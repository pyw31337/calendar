#!/usr/bin/env node
/*
 * Downloads only changed canonical photo-index assets, analyzes them on this Mac with Vision,
 * and uploads bounded recommendation metadata to the protected ingestMediaAnalysis endpoint.
 * It never writes tags, moves originals, or scans the Photos library.
 */

import { access, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { basename, dirname, extname, join, resolve } from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';
import { isRetryableAssetFailure } from './analysis-retry-policy.mjs';

const WORKER_DIR = dirname(fileURLToPath(import.meta.url));
const VISION_SCRIPT = join(WORKER_DIR, 'MediaInsight.swift');
const DEFAULT_PROJECT_ID = 'metro-live-2918e';
const DEFAULT_MAX_PER_RUN = 80;
const DEFAULT_CONCURRENCY = 4;
const MAX_DOWNLOAD_BYTES = 35 * 1024 * 1024;
const DEFAULT_TOKEN_SERVICE = 'Moyeora Media Analysis Worker';
const MAX_CONSECUTIVE_ASSET_FAILURES = 3;
const NETWORK_TIMEOUT_MS = 30 * 1000;

function kstDateStamp(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit'
  }).formatToParts(date);
  const part = type => parts.find(value => value.type === type)?.value || '00';
  return `${part('year')}${part('month')}${part('day')}`;
}

function parseArgs(argv) {
  const args = { calendar: '', project: DEFAULT_PROJECT_ID, state: '', output: '', endpoint: '', max: DEFAULT_MAX_PER_RUN, concurrency: DEFAULT_CONCURRENCY, tokenService: DEFAULT_TOKEN_SERVICE, tokenAccount: '', visionBinary: '', force: false };
  for (let index = 0; index < argv.length; index += 1) {
    const key = argv[index];
    if (key === '--calendar') args.calendar = argv[++index] || '';
    else if (key === '--project') args.project = argv[++index] || DEFAULT_PROJECT_ID;
    else if (key === '--state') args.state = argv[++index] || '';
    else if (key === '--output') args.output = argv[++index] || '';
    else if (key === '--endpoint') args.endpoint = argv[++index] || '';
    else if (key === '--max') args.max = Math.max(1, Math.min(100, Number(argv[++index]) || DEFAULT_MAX_PER_RUN));
    else if (key === '--concurrency') args.concurrency = Math.max(1, Math.min(4, Number(argv[++index]) || DEFAULT_CONCURRENCY));
    else if (key === '--token-service') args.tokenService = argv[++index] || DEFAULT_TOKEN_SERVICE;
    else if (key === '--token-account') args.tokenAccount = argv[++index] || '';
    else if (key === '--vision-bin') args.visionBinary = argv[++index] || '';
    else if (key === '--force') args.force = true;
  }
  return args;
}

function assertArgs(args) {
  if (!/^[A-Za-z0-9_-]{1,64}$/.test(args.calendar)) throw new Error('--calendar is required');
  if (!/^[A-Za-z0-9-]{6,80}$/.test(args.project)) throw new Error('--project is invalid');
  if (!args.state || !args.output) throw new Error('--state and --output are required');
}

async function readJson(path, fallback) {
  try { return JSON.parse(await readFile(path, 'utf8')); } catch { return fallback; }
}

async function timedRequest(url, options = {}, label = 'Network request', consume = async response => response) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), NETWORK_TIMEOUT_MS);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    return await consume(response);
  } catch (error) {
    if (error?.name === 'AbortError') throw new Error(`${label} timed out after ${NETWORK_TIMEOUT_MS / 1000}s`, { cause: error });
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

function decodeFirestoreValue(value) {
  if (!value || typeof value !== 'object') return null;
  if ('stringValue' in value) return String(value.stringValue || '');
  if ('integerValue' in value) return Number(value.integerValue) || 0;
  if ('doubleValue' in value) return Number(value.doubleValue) || 0;
  if ('booleanValue' in value) return Boolean(value.booleanValue);
  if ('nullValue' in value) return null;
  if ('timestampValue' in value) return String(value.timestampValue || '');
  if ('arrayValue' in value) return (value.arrayValue?.values || []).map(decodeFirestoreValue);
  if ('mapValue' in value) return Object.fromEntries(Object.entries(value.mapValue?.fields || {}).map(([key, child]) => [key, decodeFirestoreValue(child)]));
  return null;
}

function decodeDocument(document) {
  return Object.fromEntries(Object.entries(document?.fields || {}).map(([key, value]) => [key, decodeFirestoreValue(value)]));
}

async function firestoreGet(url) {
  return timedRequest(url, { headers: { Accept: 'application/json' } }, 'Firestore read', async response => {
    if (response.status === 404) return null;
    if (!response.ok) throw new Error(`Firestore request failed: ${response.status}`);
    return response.json();
  });
}

function firestoreRunQueryUrl(project, calendar) {
  return `https://firestore.googleapis.com/v1/projects/${project}/databases/(default)/documents/calendars/cal_${calendar}:runQuery`;
}

async function fetchRevision(args) {
  const doc = await firestoreGet(`https://firestore.googleapis.com/v1/projects/${args.project}/databases/(default)/documents/calendars/cal_${args.calendar}/photoIndexMeta/summary`);
  const fields = decodeDocument(doc);
  return String(fields.revision || '');
}

async function fetchCalendar(args) {
  const doc = await firestoreGet(`https://firestore.googleapis.com/v1/projects/${args.project}/databases/(default)/documents/calendars/cal_${args.calendar}`);
  return decodeDocument(doc)?.calendar || {};
}

function workerFunctionUrl(args, functionName) {
  const ingest = args.endpoint || `https://us-central1-${args.project}.cloudfunctions.net/ingestMediaAnalysis`;
  return ingest.replace(/\/[^/]+$/, `/${functionName}`);
}

async function fetchCalibration(args, token) {
  const { payload } = await timedRequest(workerFunctionUrl(args, 'getMediaAnalysisCalibration'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ calendarId: args.calendar })
  }, 'Calibration fetch', async response => ({ response, payload: await response.json().catch(() => null) }));
  return Array.isArray(payload?.signals) ? payload.signals : [];
}

// This is deliberate calibration, not opaque auto-training. A label/tag relation needs two
// independent accepted reviews before it can influence a later recommendation; a rejection
// subtracts from the same relation. The signal stays local to one calendar and one Mac.
function buildCalibration(signals) {
  const byLabel = new Map();
  for (const signal of Array.isArray(signals) ? signals : []) {
    const decision = String(signal?.decision || '');
    const delta = decision === 'rejected' ? -2 : (decision === 'edited' ? 2 : 1);
    const tags = decision === 'rejected'
      ? (Array.isArray(signal?.proposedTags) ? signal.proposedTags : [])
      : (Array.isArray(signal?.acceptedTags) ? signal.acceptedTags : []);
    if (!tags.length) continue;
    for (const rawLabel of Array.isArray(signal?.labels) ? signal.labels : []) {
      const label = String(rawLabel || '').trim().toLocaleLowerCase('en-US');
      if (!label) continue;
      const bucket = byLabel.get(label) || new Map();
      for (const rawTag of tags) {
        const tag = String(rawTag || '').replace(/^#+/, '').trim();
        if (!tag) continue;
        const current = bucket.get(tag) || { score: 0, approvals: 0 };
        current.score += delta;
        if (delta > 0) current.approvals += 1;
        bucket.set(tag, current);
      }
      byLabel.set(label, bucket);
    }
  }
  return byLabel;
}

function calibratedTags(insight, calibration) {
  const candidates = new Map();
  for (const label of Array.isArray(insight?.labels) ? insight.labels : []) {
    const bucket = calibration.get(String(label?.name || '').toLocaleLowerCase('en-US'));
    if (!bucket) continue;
    for (const [tag, signal] of bucket.entries()) {
      // Two reviews keeps a one-off accidental apply from becoming a persistent suggestion.
      if (signal.approvals < 2 || signal.score < 2) continue;
      candidates.set(tag, Math.max(candidates.get(tag) || 0, signal.score));
    }
  }
  return Array.from(candidates.entries()).sort((left, right) => right[1] - left[1]).map(([tag]) => tag).slice(0, 5);
}

async function fetchPhotoRows(args, cursor) {
  const query = {
    from: [{ collectionId: 'photoIndex' }],
    orderBy: [
      { field: { fieldPath: 'updatedAt' }, direction: 'ASCENDING' },
      { field: { fieldPath: '__name__' }, direction: 'ASCENDING' }
    ],
    limit: args.max
  };
  if (cursor?.updatedAt && cursor?.name) {
    query.startAt = {
      values: [{ integerValue: String(cursor.updatedAt) }, { referenceValue: cursor.name }],
      before: false
    };
  }
  const rows = await timedRequest(firestoreRunQueryUrl(args.project, args.calendar), {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ structuredQuery: query })
  }, 'Firestore photo-index query', async response => {
    if (!response.ok) throw new Error(`Photo index query failed: ${response.status}`);
    return response.json();
  });
  return (Array.isArray(rows) ? rows : []).filter(row => row?.document).map(row => ({
    name: row.document.name,
    data: decodeDocument(row.document)
  }));
}

function shell(command, args) {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(command, args, { stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', data => { stdout += data; });
    child.stderr.on('data', data => { stderr += data; });
    child.on('error', reject);
    child.on('close', code => code === 0 ? resolvePromise(stdout) : reject(new Error(stderr.trim() || `${command} exited ${code}`)));
  });
}

async function readWorkerToken(service, account) {
  if (!account) throw new Error('Missing Keychain token account');
  return (await shell('/usr/bin/security', ['find-generic-password', '-a', account, '-s', service, '-w'])).trim();
}

function nearestPlace(photo, places) {
  const lat = Number(photo.latitude);
  const lng = Number(photo.longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return '';
  let nearest = null;
  for (const place of Array.isArray(places) ? places : []) {
    const pLat = Number(place?.lat ?? place?.latitude);
    const pLng = Number(place?.lng ?? place?.longitude);
    if (!Number.isFinite(pLat) || !Number.isFinite(pLng)) continue;
    const distance = Math.hypot((pLat - lat) * 111000, (pLng - lng) * 88000);
    if (!nearest || distance < nearest.distance) nearest = { name: String(place?.name || place?.title || ''), distance };
  }
  return nearest?.distance <= 250 ? nearest.name : '';
}

function toKstDateString(ts) {
  if (!ts) return '';
  const date = new Date(typeof ts === 'number' || /^\d+$/.test(ts) ? Number(ts) : String(ts));
  if (Number.isNaN(date.getTime())) return '';
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit'
  }).formatToParts(date);
  const part = type => parts.find(value => value.type === type)?.value || '00';
  return `${part('year')}-${part('month')}-${part('day')}`;
}

function extractSmartKeywords(text) {
  if (!text) return [];
  const clean = String(text).replace(/[\r\n\t]/g, ' ').trim();
  const words = clean.split(/[\s,#·•/]+/).map(w => w.trim()).filter(w => w.length >= 2);
  const combined = clean.replace(/[\s_\-./(),[\]{}'"`~!@#$%^&*+=|\\:;<>?·•]+/g, '').trim();
  const res = [];
  if (combined && combined.length >= 2 && combined.length <= 15) res.push(combined);
  for (const word of words) {
    if (word.length >= 2 && word.length <= 15 && !res.includes(word)) res.push(word);
  }
  return res;
}

function classify(photo, insight, calendar, calibration = new Map()) {
  const rawTags = String(photo.tags || '').split(/[\s,#]+/).map(value => value.trim()).filter(Boolean);
  const lowerTags = rawTags.map(value => value.toLocaleLowerCase('ko'));
  const includes = value => lowerTags.includes(String(value || '').toLocaleLowerCase('ko'));
  const people = (Array.isArray(calendar.participants) ? calendar.participants : [])
    .map(person => String(person?.name || '').trim()).filter(Boolean).filter(includes);
  const places = (Array.isArray(calendar.places) ? calendar.places : [])
    .map(place => String(place?.name || place?.title || '').trim()).filter(Boolean).filter(includes);
  const nearby = nearestPlace(photo, calendar.places);
  if (nearby && !places.includes(nearby)) places.push(nearby);

  // Date resolution from photo.meetingDate or timestamp / capturedAt
  const dateStr = String(photo.meetingDate || '').trim() || toKstDateString(photo.timestamp || photo.capturedAt);
  const matchedMeetings = [];
  if (dateStr) {
    const rawMeetings = Array.isArray(calendar.confirmedMeeting) ? calendar.confirmedMeeting : (calendar.confirmedMeeting ? [calendar.confirmedMeeting] : []);
    for (const meeting of rawMeetings) {
      if (!meeting || meeting.confirmed === false) continue;
      const mDate = String(meeting.date || meeting.id || meeting.targetDate || '').trim();
      if (mDate === dateStr) matchedMeetings.push(meeting);
    }
    const rawAnniversaries = Array.isArray(calendar.anniversaries) ? calendar.anniversaries : [];
    for (const anniv of rawAnniversaries) {
      if (!anniv || anniv.deletedAt) continue;
      const aStart = String(anniv.startDate || anniv.date || '').trim();
      const aEnd = String(anniv.endDate || aStart).trim();
      if ((aStart && aStart === dateStr) || (aStart && aEnd && dateStr >= aStart && dateStr <= aEnd)) {
        matchedMeetings.push(anniv);
      }
    }
  }

  const scheduleSmartTags = [];
  for (const m of matchedMeetings) {
    const title = String(m.title || m.name || '').trim();
    const note = String(m.note || m.memo || '').trim();
    if (title) scheduleSmartTags.push(...extractSmartKeywords(title));
    if (note) scheduleSmartTags.push(...extractSmartKeywords(note));
  }

  const meetings = matchedMeetings.map(m => String(m.title || m.name || m.date || '')).filter(Boolean);
  const learned = calibratedTags(insight, calibration).filter(tag => !includes(tag));
  return {
    suggestedTags: Array.from(new Set([...(insight.suggestedTags || []), ...places, ...scheduleSmartTags, ...meetings, ...learned])).slice(0, 20),
    people, places, meetings,
    scenes: Array.from(new Set((insight.labels || []).filter(label => Number(label?.confidence) >= 0.65).map(label => label.name))).slice(0, 12),
    confidence: Math.max(0, ...((insight.labels || []).map(label => Number(label?.confidence) || 0)))
  };
}

async function inspectPhoto(photo, tempRoot, visionBinary) {
  // Vision cannot reliably create an NSImage from an animated GIF. A photoIndex row normally
  // carries a JPEG/WebP thumbnail as well, which preserves a representative first frame and is
  // both smaller and analyzable. For ordinary photos we keep the full original as before.
  const candidates = [photo.full, photo.imageUrl, photo.thumb, photo.thumbUrl]
    .map(value => String(value || '').trim()).filter(Boolean);
  const isGif = value => /\.gif(?:$|[?#])/i.test(value);
  const url = candidates.find(value => !isGif(value)) || candidates[0] || '';
  if (!/^https:\/\//.test(url)) throw new Error('Missing Firebase Storage URL');
  const { response, bytes } = await timedRequest(url, {}, 'Photo download', async response => {
    if (!response.ok) return { response, bytes: Buffer.alloc(0) };
    const declared = Number(response.headers.get('content-length') || 0);
    if (declared > MAX_DOWNLOAD_BYTES) throw new Error('Image exceeds local analysis limit');
    return { response, bytes: Buffer.from(await response.arrayBuffer()) };
  });
  if (!response.ok) throw new Error(`Image download failed: ${response.status}`);
  if (bytes.length > MAX_DOWNLOAD_BYTES) throw new Error('Image exceeds local analysis limit');
  const extension = extname(new URL(url).pathname) || '.jpg';
  const filename = join(tempRoot, `${String(photo.assetKey || 'photo').replace(/[^A-Za-z0-9_-]/g, '_')}${extension}`);
  await writeFile(filename, bytes);
  try {
    const command = visionBinary || '/usr/bin/xcrun';
    const commandArgs = visionBinary ? [filename] : ['swift', VISION_SCRIPT, filename];
    return JSON.parse(await shell(command, commandArgs));
  } finally {
    await rm(filename, { force: true });
  }
}

async function upload(args, token, runId, items, window, { status = 'completed', error = '' } = {}) {
  const endpoint = args.endpoint || `https://us-central1-${args.project}.cloudfunctions.net/ingestMediaAnalysis`;
  const { response, payload } = await timedRequest(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      calendarId: args.calendar,
      runId,
      workerId: 'macos-vision-m2',
      workerVersion: '4',
      window,
      status,
      error,
      items
    })
  }, 'Analysis upload', async response => ({ response, payload: await response.json().catch(() => null) }));
  if (!response.ok || !payload?.ok) throw new Error(payload?.message || `Analysis upload failed: ${response.status}`);
  return payload;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  assertArgs(args);
  if (args.visionBinary) await access(resolve(args.visionBinary));
  const statePath = resolve(args.state);
  const outputPath = resolve(args.output);
  const state = await readJson(statePath, { schemaVersion: 1, calendars: {} });
  const current = state.calendars?.[args.calendar] || {};
  const [revision, token] = await Promise.all([fetchRevision(args), readWorkerToken(args.tokenService, args.tokenAccount)]);
  const now = Date.now();
  const runId = `macos_${args.calendar}_${kstDateStamp(new Date(now))}`;
  // A completed revision can skip image downloads, but it must still heartbeat the server.  This
  // is how the server distinguishes an idle Mac from one that silently stopped running.
  if (!args.force && revision && revision === current.revision && !current.pendingRevision) {
    const result = await upload(args, token, runId, [], 'scheduled', { status: 'idle' });
    const report = { calendarId: args.calendar, skipped: true, reason: 'photo-index-unchanged', revision, generatedAt: now, summary: result.summary || {} };
    await mkdir(dirname(outputPath), { recursive: true });
    await writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
    return;
  }
  const [calendar, rows, calibrationSignals] = await Promise.all([
    fetchCalendar(args),
    fetchPhotoRows(args, current.cursor),
    fetchCalibration(args, token).catch(error => {
      console.warn('Calibration unavailable; using base Vision suggestions:', String(error?.message || error));
      return [];
    })
  ]);
  const calibration = buildCalibration(calibrationSignals);
  const tempRoot = join(tmpdir(), `moyeora-analysis-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  await mkdir(tempRoot, { recursive: true });
  const items = [];
  const failures = [];
  try {
    let nextRow = 0;
    const inspectNextRow = async () => {
      while (nextRow < rows.length) {
        const row = rows[nextRow++];
        const photo = { ...row.data, assetKey: String(row.data.assetKey || basename(row.name)) };
        try {
          const insight = await inspectPhoto(photo, tempRoot, args.visionBinary);
          items.push({ sourceKey: photo.assetKey, assetKey: photo.assetKey, sourceUpdatedAt: Number(photo.updatedAt) || 0, analyzedAt: now, source: 'photo-index', insight, ...classify(photo, insight, calendar, calibration) });
        } catch (error) {
          const message = String(error?.message || error).slice(0, 240);
          failures.push({ assetKey: photo.assetKey, error: message });
          // Persist a bounded error against the immutable asset key.  It is safe to overwrite when
          // a later retry succeeds, and makes an unanalysable file visible in the web briefing.
          items.push({ sourceKey: photo.assetKey, assetKey: photo.assetKey, sourceUpdatedAt: Number(photo.updatedAt) || 0, analyzedAt: now, source: 'photo-index', status: 'failed', error: message });
        }
      }
    };
    // Core ML/Vision work is independent by asset. Four concurrent tasks fully use a desktop M2
    // without turning an 80-photo backlog into unbounded CPU, RAM, or Firebase traffic.
    await Promise.all(Array.from({ length: Math.min(args.concurrency, rows.length) }, inspectNextRow));
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }
  const previousFailures = current.failures && typeof current.failures === 'object' ? current.failures : {};
  const nextFailures = { ...previousFailures };
  for (const item of items.filter(item => item.status !== 'failed')) delete nextFailures[item.assetKey];
  for (const failure of failures) {
    if (!isRetryableAssetFailure(failure.error)) {
      // Keep the failed analysis row on the server for review, but do not pin the cursor on a
      // deleted/missing asset. A fresh photo-index revision can still revisit it later.
      delete nextFailures[failure.assetKey];
      continue;
    }
    const previous = Number(nextFailures[failure.assetKey]?.attempts || 0);
    nextFailures[failure.assetKey] = { attempts: previous + 1, error: failure.error, updatedAt: now };
  }
  const retryableFailure = failures.some(failure => isRetryableAssetFailure(failure.error)
    && Number(nextFailures[failure.assetKey]?.attempts || 0) < MAX_CONSECUTIVE_ASSET_FAILURES);
  const result = await upload(args, token, runId, items, 'scheduled', {
    // Asset-level failures are recorded in the summary, but a successful heartbeat/upload still
    // means the worker itself is alive.  This prevents a single corrupt image from masking a
    // healthy scheduler while the bounded retry counter handles recovery.
    status: rows.length ? 'completed' : 'idle',
    error: failures[0]?.error || ''
  });
  const last = rows.at(-1);
  const pageMayHaveMore = rows.length === args.max;
  const mustRetrySamePage = retryableFailure;
  state.calendars = {
    ...(state.calendars || {}),
    [args.calendar]: {
      // Do not mark a revision complete until all pages have been seen.  Otherwise a 200-photo
      // upload could strand everything after the first batch forever.
      revision: (pageMayHaveMore || mustRetrySamePage) ? (current.revision || '') : revision,
      pendingRevision: (pageMayHaveMore || mustRetrySamePage) ? revision : '',
      cursor: mustRetrySamePage
        ? (current.cursor || null)
        : (last ? { updatedAt: Number(last.data.updatedAt) || 0, name: last.name } : current.cursor || null),
      failures: nextFailures,
      lastRunAt: now
    }
  };
  await mkdir(dirname(statePath), { recursive: true });
  await writeFile(statePath, `${JSON.stringify(state, null, 2)}\n`, 'utf8');
  const report = {
    calendarId: args.calendar,
    revision,
    generatedAt: now,
    fetched: rows.length,
    uploaded: result.accepted || 0,
    failures,
    retrying: mustRetrySamePage,
    hasMore: pageMayHaveMore,
    summary: result.summary || {}
  };
  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify(report));
}

main().catch(error => {
  console.error(error?.stack || error?.message || error);
  process.exitCode = 1;
});
