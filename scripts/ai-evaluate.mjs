#!/usr/bin/env node

// Privacy-safe evaluation harness. Deterministic metadata cases run without a model. The
// optional Ollama pass evaluates semantic scope on synthetic descriptions only; it never reads
// a user's image or sends calendar data anywhere.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { classifyPhoto } from '../tools/local-media-worker/analysis-evidence.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const valueFor = (name, fallback) => args.find(arg => arg.startsWith(`${name}=`))?.slice(name.length + 1) || fallback;
const datasetPath = path.resolve(valueFor('--dataset', path.resolve(__dirname, 'data/ai-evaluation-gold.json')));
const outputPath = valueFor('--output', '');
const models = valueFor('--models', '').split(',').map(value => value.trim()).filter(Boolean);
const host = String(valueFor('--ollama', process.env.OLLAMA_HOST || 'http://127.0.0.1:11434')).replace(/\/$/, '');
const timeoutMs = Math.max(10000, Number(valueFor('--timeout-ms', '90000')) || 90000);
const dataset = JSON.parse(fs.readFileSync(datasetPath, 'utf8'));

const dimensions = ['recognizedPeople', 'recognizedPlaces', 'candidatePeople', 'candidatePlaces', 'dates', 'meetings', 'suggestedTags', 'scenes'];
const asSet = value => new Set((Array.isArray(value) ? value : []).map(item => String(item).trim()).filter(Boolean));
const equalSet = (left, right) => left.size === right.size && [...left].every(value => right.has(value));

function classifyCase(testCase) {
  const result = classifyPhoto(testCase.photo || {}, testCase.insight || {}, testCase.calendar || {});
  const candidatePeople = (result.candidateEvidence || []).filter(row => row.source === 'ocr-person').map(row => row.tag);
  const candidatePlaces = (result.candidateEvidence || []).filter(row => row.source === 'gps-place').map(row => row.tag);
  return {
    recognizedPeople: (result.people || []).filter(tag => !candidatePeople.includes(tag)),
    recognizedPlaces: (result.places || []).filter(tag => !candidatePlaces.includes(tag)),
    candidatePeople,
    candidatePlaces,
    dates: (result.suggestedTags || []).filter(value => /^\d{6}(?:\d{2})?$/.test(value)),
    meetings: result.meetings || [],
    suggestedTags: result.suggestedTags || [],
    scenes: result.scenes || []
  };
}

function scoreDeterministic(cases) {
  const stats = Object.fromEntries(dimensions.map(dimension => [dimension, { tp: 0, fp: 0, fn: 0, exact: 0, total: cases.length }]));
  const rows = cases.map(testCase => {
    const actual = classifyCase(testCase);
    let exact = true;
    for (const dimension of dimensions) {
      const expected = asSet(testCase.expected?.[dimension]);
      const observed = asSet(actual[dimension]);
      const tp = [...observed].filter(value => expected.has(value)).length;
      stats[dimension].tp += tp;
      stats[dimension].fp += observed.size - tp;
      stats[dimension].fn += expected.size - tp;
      if (!equalSet(expected, observed)) exact = false;
    }
    dimensions.forEach(dimension => { if (equalSet(asSet(testCase.expected?.[dimension]), asSet(actual[dimension]))) stats[dimension].exact += 1; });
    return { id: testCase.id, exact, actual, expected: testCase.expected };
  });
  for (const statsRow of Object.values(stats)) {
    statsRow.precision = statsRow.tp + statsRow.fp ? statsRow.tp / (statsRow.tp + statsRow.fp) : 1;
    statsRow.recall = statsRow.tp + statsRow.fn ? statsRow.tp / (statsRow.tp + statsRow.fn) : 1;
    statsRow.f1 = statsRow.precision + statsRow.recall ? 2 * statsRow.precision * statsRow.recall / (statsRow.precision + statsRow.recall) : 1;
    statsRow.exactRate = statsRow.total ? statsRow.exact / statsRow.total : 1;
  }
  return { caseExactRate: rows.filter(row => row.exact).length / (rows.length || 1), dimensions: stats, rows };
}

const modelSchema = {
  type: 'object',
  properties: {
    category: { type: 'string', enum: ['person', 'place', 'food', 'object', 'document', 'date', 'unknown'] },
    entities: { type: 'array', items: { type: 'string' } },
    confidence: { type: 'number' },
    abstain: { type: 'boolean' },
    placeEvidence: { type: 'boolean' }
  },
  required: ['category', 'entities', 'confidence', 'abstain', 'placeEvidence']
};

async function askModel(model, testCase) {
  const system = 'Classify only the described synthetic observation. Never infer a person identity or a place from a generic scene. Return strict JSON. If evidence is insufficient, set abstain=true and entities=[].';
  const response = await fetch(`${host}/api/chat`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ model, stream: false, format: modelSchema, options: { temperature: 0, seed: 41 }, messages: [
      { role: 'system', content: system },
      { role: 'user', content: JSON.stringify({ observation: testCase.observation, expectedOutput: 'category/entities/confidence/abstain/placeEvidence' }) }
    ] }),
    signal: AbortSignal.timeout(timeoutMs)
  });
  if (!response.ok) throw new Error(`Ollama ${response.status}`);
  const payload = await response.json();
  return JSON.parse(payload?.message?.content || '{}');
}

async function scoreModel(model) {
  const rows = [];
  for (const testCase of dataset.modelCases || []) {
    const started = Date.now();
    try {
      const actual = await askModel(model, testCase);
      const expected = testCase.expected || {};
      const actualEntities = asSet(actual.entities);
      const expectedEntities = asSet(expected.entities);
      const entityTp = [...actualEntities].filter(value => expectedEntities.has(value)).length;
      const categoryCorrect = actual.category === expected.category;
      const abstainCorrect = Boolean(actual.abstain) === Boolean(expected.abstain);
      const placeAbstainCorrect = expected.abstainPlace ? actual.placeEvidence === false : true;
      rows.push({ id: testCase.id, ok: categoryCorrect && equalSet(actualEntities, expectedEntities) && abstainCorrect && placeAbstainCorrect, categoryCorrect, entityExact: equalSet(actualEntities, expectedEntities), abstainCorrect, placeAbstainCorrect, latencyMs: Date.now() - started, actual, expected });
    } catch (error) {
      rows.push({ id: testCase.id, ok: false, error: String(error?.message || error), latencyMs: Date.now() - started });
    }
  }
  return { model, total: rows.length, completed: rows.filter(row => !row.error).length, caseAccuracy: rows.filter(row => row.ok).length / (rows.length || 1), categoryAccuracy: rows.filter(row => row.categoryCorrect).length / (rows.length || 1), entityExactRate: rows.filter(row => row.entityExact).length / (rows.length || 1), abstentionAccuracy: rows.filter(row => row.abstainCorrect).length / (rows.length || 1), placeAbstentionAccuracy: rows.filter(row => row.placeAbstainCorrect).length / (rows.length || 1), meanLatencyMs: rows.length ? rows.reduce((sum, row) => sum + row.latencyMs, 0) / rows.length : 0, rows };
}

const report = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  dataset: datasetPath,
  privacy: 'Deterministic cases are synthetic. Ollama cases contain descriptions only; no user photos, names, GPS, or calendar records are sent.',
  deterministic: scoreDeterministic(dataset.deterministicCases || []),
  models: []
};
for (const model of models) report.models.push(await scoreModel(model));
if (outputPath) {
  fs.mkdirSync(path.dirname(path.resolve(outputPath)), { recursive: true });
  fs.writeFileSync(path.resolve(outputPath), `${JSON.stringify(report, null, 2)}\n`);
}
console.log(JSON.stringify(report, null, 2));
