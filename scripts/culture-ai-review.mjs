#!/usr/bin/env node

// Optional Mac-mini review pass. Deterministic normalization remains the source of truth;
// Ollama is asked only about ambiguous same-title groups that the safe matcher intentionally
// kept separate. The result is an auditable sidecar, never a direct overwrite of the feed.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { normalizeTitleForMatch } from './lib/culture-normalize.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const valueFor = (name, fallback) => args.find(arg => arg.startsWith(`${name}=`))?.slice(name.length + 1) || fallback;
const input = path.resolve(valueFor('--input', path.resolve(__dirname, '../public-vite/data/culture-performances.json')));
const output = path.resolve(valueFor('--output', path.resolve(__dirname, 'data/culture-ai-review.json')));
const host = String(valueFor('--ollama', process.env.OLLAMA_HOST || 'http://127.0.0.1:11434')).replace(/\/$/, '');
const model = valueFor('--model', process.env.OLLAMA_CULTURE_MODEL || '');
const limit = Math.max(1, Number(valueFor('--limit', '40')) || 40);
const batchSize = Math.max(1, Number(valueFor('--batch-size', process.env.OLLAMA_CULTURE_BATCH_SIZE || '8')) || 8);
const requestTimeoutMs = Math.max(10000, Number(valueFor('--timeout-ms', process.env.OLLAMA_CULTURE_REQUEST_TIMEOUT_MS || '60000')) || 60000);
const required = args.includes('--required');

function loadItems(file) {
  const payload = JSON.parse(fs.readFileSync(file, 'utf8'));
  return Array.isArray(payload) ? payload : (Array.isArray(payload?.items) ? payload.items : []);
}

function buildAmbiguousGroups(items) {
  const groups = new Map();
  for (const item of items) {
    const key = normalizeTitleForMatch(item.title);
    if (!key) continue;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(item);
  }
  return [...groups.entries()]
    .filter(([, group]) => group.length > 1)
    .map(([normalizedTitle, group]) => ({
      normalizedTitle,
      items: group.map(item => ({
        id: item.id,
        title: item.title,
        dateLabel: item.dateLabel,
        startDate: item.startDate,
        endDate: item.endDate,
        openEnded: Boolean(item.openEnded || item.isOpenEnded),
        venue: item.venue,
        address: item.address,
        genre: item.genre,
        source: item.source,
        sourceListings: Array.isArray(item.sourceListings) ? item.sourceListings : [],
        description: String(item.description || '').slice(0, 240)
      }))
    }))
    .slice(0, limit);
}

function writeReport(report) {
  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, `${JSON.stringify(report, null, 2)}\n`);
  console.log(JSON.stringify(report, null, 2));
}

const baseReport = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  input,
  output,
  provider: { type: 'ollama-local', host, model: model || null },
  deterministicPolicy: 'Only same normalized title + compatible venue/date is auto-merged. AI suggestions require review or a separately audited promotion step.',
  groups: []
};

if (!model) {
  writeReport({ ...baseReport, status: 'not-configured', message: 'Set OLLAMA_CULTURE_MODEL on the Mac mini to enable the optional review pass.' });
  if (required) process.exitCode = 1;
  process.exit();
}

let groups;
try {
  groups = buildAmbiguousGroups(loadItems(input));
} catch (error) {
  writeReport({ ...baseReport, status: 'input-error', message: String(error?.message || error) });
  process.exitCode = 1;
  process.exit();
}

if (!groups.length) {
  writeReport({ ...baseReport, status: 'no-ambiguous-groups', groups: [] });
  process.exit();
}

const schema = {
  type: 'object',
  properties: {
    decisions: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          canonicalId: { type: 'string' },
          duplicateId: { type: 'string' },
          sameProduction: { type: 'boolean' },
          confidence: { type: 'number' },
          reason: { type: 'string' },
          evidence: { type: 'array', items: { type: 'string' } }
        },
        required: ['canonicalId', 'duplicateId', 'sameProduction', 'confidence', 'reason', 'evidence']
      }
    }
  },
  required: ['decisions']
};

const system = [
  'You review Korean performance listings for duplicate production detection.',
  'Never infer a duplicate from title alone: a touring show can share a title but have different venues or dates.',
  'Return only strict JSON matching the schema.',
  'Mark sameProduction=true only when the evidence supports the same production and the records should be merged into one card.',
  'Do not invent dates, venues, links, or booking facts. Use an empty evidence array only when there is no evidence.'
].join(' ');

function sanitizeDecisions(decisions) {
  return (Array.isArray(decisions) ? decisions : []).filter(decision => {
    const confidence = Number(decision.confidence);
    return typeof decision.canonicalId === 'string'
      && typeof decision.duplicateId === 'string'
      && decision.canonicalId !== decision.duplicateId
      && typeof decision.sameProduction === 'boolean'
      && Number.isFinite(confidence) && confidence >= 0 && confidence <= 1;
  }).map(decision => ({
    ...decision,
    confidence: Number(decision.confidence),
    evidence: Array.isArray(decision.evidence) ? decision.evidence.slice(0, 6).map(String) : []
  }));
}

async function reviewBatch(batch) {
  const prompt = JSON.stringify({ task: 'Review the following same-normalized-title groups.', groups: batch });
  const response = await fetch(`${host}/api/chat`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      model,
      stream: false,
      format: schema,
      options: { temperature: 0, seed: 17 },
      messages: [{ role: 'system', content: system }, { role: 'user', content: prompt }]
    }),
    signal: AbortSignal.timeout(requestTimeoutMs)
  });
  if (!response.ok) throw new Error(`Ollama ${response.status}: ${(await response.text()).slice(0, 240)}`);
  const payload = await response.json();
  const content = payload?.message?.content || '';
  const parsed = JSON.parse(content);
  return {
    decisions: sanitizeDecisions(parsed?.decisions),
    response: { done: payload?.done === true, totalDurationNs: payload?.total_duration || null }
  };
}

const decisions = [];
const modelResponses = [];
const failures = [];
async function reviewBatchWithFallback(batch, start) {
  if (!batch.length) return;
  try {
    const result = await reviewBatch(batch);
    decisions.push(...result.decisions);
    modelResponses.push({ start, count: batch.length, ...result.response });
  } catch (error) {
    // Smaller requests are more reliable on memory-constrained Mac minis. Split a timed-out
    // batch before giving up so one slow group cannot discard the rest of the review pass.
    if (batch.length > 1) {
      const midpoint = Math.ceil(batch.length / 2);
      await reviewBatchWithFallback(batch.slice(0, midpoint), start);
      await reviewBatchWithFallback(batch.slice(midpoint), start + midpoint);
      return;
    }
    failures.push({ start, count: batch.length, message: String(error?.message || error) });
  }
}

for (let start = 0; start < groups.length; start += batchSize) {
  await reviewBatchWithFallback(groups.slice(start, start + batchSize), start);
}

const status = failures.length === 0 ? 'completed' : (decisions.length ? 'partial' : 'unavailable');
writeReport({
  ...baseReport,
  status,
  modelResponse: { batchSize, requestTimeoutMs, batches: modelResponses },
  groups,
  decisions,
  ...(failures.length ? { failures } : {})
});
if (required && failures.length) process.exitCode = 1;
