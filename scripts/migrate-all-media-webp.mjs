#!/usr/bin/env node
/**
 * Automated Full Media WebP Batch Migration Tool
 *
 * Scans all unique photos across calendars (messages, memos, confirmedMeetings),
 * downloads non-WebP thumbnails and original photos,
 * converts them to high-efficiency WebP using local cwebp/sips,
 * uploads them in-place to Firebase Storage with Content-Type: image/webp,
 * tracks progress in a resumable state file, and verifies integrity.
 */

import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile, unlink } from 'node:fs/promises';
import { join } from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { tmpdir } from 'node:os';

const execFileAsync = promisify(execFile);

const PROJECT_ID = 'metro-live-2918e';
const BUCKET = 'metro-live-2918e.firebasestorage.app';
const FIRESTORE_BASE = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;
const CALENDAR_IDS = (process.env.CALENDARS || 'cw,kkot,jhair').split(',').map(s => s.trim()).filter(Boolean);

const CWEBP_PATH = existsSync('/opt/homebrew/bin/cwebp') ? '/opt/homebrew/bin/cwebp' : 'cwebp';
const STATE_FILE_PATH = join(process.cwd(), 'scripts', 'data', 'all-media-webp-state.json');
const CONCURRENCY = Number(process.env.CONCURRENCY) || 8;
const MAX_RETRIES = 4;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function decodeFirestoreDoc(doc) {
  const fields = doc?.fields || {};
  const decodeValue = (val) => {
    if (!val || typeof val !== 'object') return null;
    if ('stringValue' in val) return val.stringValue;
    if ('integerValue' in val) return Number(val.integerValue);
    if ('doubleValue' in val) return Number(val.doubleValue);
    if ('booleanValue' in val) return val.booleanValue;
    if ('arrayValue' in val) return (val.arrayValue.values || []).map(decodeValue);
    if ('mapValue' in val) return Object.fromEntries(Object.entries(val.mapValue.fields || {}).map(([k, v]) => [k, decodeValue(v)]));
    if ('nullValue' in val) return null;
    return null;
  };

  return {
    id: doc.name.split('/').pop(),
    ...Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, decodeValue(v)]))
  };
}

async function listAllDocuments(path) {
  const documents = [];
  let pageToken = '';
  do {
    const query = new URLSearchParams({ pageSize: '300' });
    if (pageToken) query.set('pageToken', pageToken);
    try {
      const res = await fetch(`${FIRESTORE_BASE}/${path}?${query}`);
      if (!res.ok) break;
      const data = await res.json();
      (data.documents || []).forEach(doc => documents.push(decodeFirestoreDoc(doc)));
      pageToken = data.nextPageToken || '';
    } catch (_) {
      break;
    }
  } while (pageToken);
  return documents;
}

async function collectAllUniquePhotos() {
  console.log(`[media-webp] Scanning unique photos across calendars: ${CALENDAR_IDS.join(', ')}...`);
  const uniqueStoragePaths = new Map(); // storagePath -> { url, isThumb, calendarId }

  for (const calId of CALENDAR_IDS) {
    const [messages, memos, meetings] = await Promise.all([
      listAllDocuments(`calendars/cal_${calId}/messages`),
      listAllDocuments(`calendars/cal_${calId}/memos`),
      listAllDocuments(`calendars/cal_${calId}/confirmedMeetings`)
    ]);

    function addUrl(url, isThumb) {
      if (!url || typeof url !== 'string' || !url.startsWith('http')) return;
      const m = url.match(/\/o\/([^?]+)/);
      if (!m) return;
      const storagePath = decodeURIComponent(m[1]);
      if (!uniqueStoragePaths.has(storagePath)) {
        uniqueStoragePaths.set(storagePath, { storagePath, url, isThumb, calendarId: calId });
      }
    }

    for (const msg of messages) {
      const urls = Array.isArray(msg.imageUrls) ? msg.imageUrls : (msg.imageUrl ? [msg.imageUrl] : []);
      const thumbs = Array.isArray(msg.thumbUrls) ? msg.thumbUrls : (msg.thumbUrl ? [msg.thumbUrl] : []);
      urls.forEach(u => addUrl(u, false));
      thumbs.forEach(u => addUrl(u, true));
    }

    for (const memo of memos) {
      const urls = Array.isArray(memo.imageUrls) ? memo.imageUrls : (memo.imageUrl ? [memo.imageUrl] : []);
      const thumbs = Array.isArray(memo.thumbUrls) ? memo.thumbUrls : (memo.thumbUrl ? [memo.thumbUrl] : []);
      urls.forEach(u => addUrl(u, false));
      thumbs.forEach(u => addUrl(u, true));
    }

    for (const mtg of meetings) {
      for (const p of mtg.photos || []) {
        if (p?.imageUrl) addUrl(p.imageUrl, false);
        if (p?.thumbUrl) addUrl(p.thumbUrl, true);
      }
    }
  }

  console.log(`[media-webp] Found ${uniqueStoragePaths.size} unique Storage photos across ${CALENDAR_IDS.length} calendars.`);
  return Array.from(uniqueStoragePaths.values());
}

async function loadState() {
  try {
    if (existsSync(STATE_FILE_PATH)) {
      const content = await readFile(STATE_FILE_PATH, 'utf8');
      return JSON.parse(content);
    }
  } catch (_) {}
  return { completed: {}, failed: {}, stats: { origTotalBytes: 0, webpTotalBytes: 0, convertedCount: 0 } };
}

async function saveState(state) {
  try {
    await mkdir(join(process.cwd(), 'scripts', 'data'), { recursive: true });
    await writeFile(STATE_FILE_PATH, JSON.stringify(state, null, 2), 'utf8');
  } catch (e) {
    console.warn('[media-webp] Failed to save state:', e.message);
  }
}

async function fetchWithRetry(url, options = {}, retries = MAX_RETRIES) {
  let lastErr = null;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, { ...options, signal: AbortSignal.timeout(35000) });
      if (res.ok) return res;
      if (res.status === 404) throw new Error(`HTTP 404 Not Found: ${url}`);
      lastErr = new Error(`HTTP ${res.status} ${res.statusText}`);
    } catch (err) {
      lastErr = err;
    }
    if (attempt < retries) {
      await sleep(400 * Math.pow(2, attempt - 1));
    }
  }
  throw lastErr;
}

function isAlreadyWebp(buffer) {
  return buffer.length >= 12 &&
    buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46 && // RIFF
    buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50; // WEBP
}

function isGif(buffer) {
  return buffer.length >= 6 &&
    buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x38; // GIF8
}

async function uploadToFirebaseStorage(storagePath, buffer) {
  const encodedName = encodeURIComponent(storagePath);
  const uploadUrl = `https://firebasestorage.googleapis.com/v0/b/${BUCKET}/o?name=${encodedName}&uploadType=media`;

  const res = await fetchWithRetry(uploadUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'image/webp',
      'Cache-Control': 'public, max-age=31536000, immutable'
    },
    body: buffer
  });

  return res.ok;
}

async function processPhotoItem(photo, tempDir, index, total, state) {
  const storagePath = photo.storagePath;
  const fileNameSafe = storagePath.replace(/[^a-zA-Z0-9_-]/g, '_');
  const tempSrc = join(tempDir, `${fileNameSafe}_src`);
  const tempWebp = join(tempDir, `${fileNameSafe}.webp`);

  try {
    // 1. Download
    const res = await fetchWithRetry(photo.url);
    const origBuf = Buffer.from(await res.arrayBuffer());

    // Skip if already WebP or GIF
    if (isAlreadyWebp(origBuf) || isGif(origBuf)) {
      state.completed[storagePath] = { skipped: true, origBytes: origBuf.length, webpBytes: origBuf.length };
      return { skipped: true };
    }

    await writeFile(tempSrc, origBuf);

    // 2. Convert to WebP
    const quality = photo.isThumb ? 80 : 82;
    await execFileAsync(CWEBP_PATH, ['-q', String(quality), tempSrc, '-o', tempWebp]);
    const webpBuf = await readFile(tempWebp);

    // If WebP is smaller, upload in-place
    if (webpBuf.length < origBuf.length) {
      await uploadToFirebaseStorage(storagePath, webpBuf);
      const saved = origBuf.length - webpBuf.length;
      const pct = ((saved / origBuf.length) * 100).toFixed(1);

      state.completed[storagePath] = {
        origBytes: origBuf.length,
        webpBytes: webpBuf.length,
        savedBytes: saved,
        at: Date.now()
      };
      state.stats.origTotalBytes += origBuf.length;
      state.stats.webpTotalBytes += webpBuf.length;
      state.stats.convertedCount += 1;

      if ((index + 1) % 10 === 0 || index + 1 === total) {
        console.log(`[${index + 1}/${total}] ${(origBuf.length / 1024).toFixed(1)}KB -> ${(webpBuf.length / 1024).toFixed(1)}KB (-${pct}%) | ${storagePath.split('/').pop()}`);
      }
      return { success: true, saved };
    } else {
      state.completed[storagePath] = { skipped: true, origBytes: origBuf.length, webpBytes: origBuf.length };
      return { skipped: true };
    }
  } finally {
    await Promise.allSettled([unlink(tempSrc), unlink(tempWebp)]);
  }
}

async function verifyLiveSamples(sampleList, count = 20) {
  console.log(`\n--- [media-webp] Verifying Live Converted Samples (${count} items) ---`);
  const picks = sampleList.slice(0, count);
  let verifiedOk = 0;
  let totalLatency = 0;

  for (const item of picks) {
    const start = performance.now();
    try {
      const res = await fetch(item.url);
      const latency = performance.now() - start;
      totalLatency += latency;
      const contentType = res.headers.get('content-type') || '';
      const bytes = (await res.arrayBuffer()).byteLength;
      if (res.ok && contentType.includes('webp') && bytes > 0) {
        console.log(`✔ [VERIFIED] (${(bytes / 1024).toFixed(1)}KB, ${contentType}) in ${latency.toFixed(0)}ms: ${item.storagePath}`);
        verifiedOk++;
      } else {
        console.warn(`✖ [CHECK] status:${res.status} type:${contentType} bytes:${bytes}: ${item.storagePath}`);
      }
    } catch (e) {
      console.warn(`✖ [ERROR] ${e.message}: ${item.storagePath}`);
    }
  }
  const avg = (totalLatency / picks.length).toFixed(1);
  console.log(`Live verification complete: ${verifiedOk}/${picks.length} verified image/webp. Avg latency: ${avg}ms\n`);
}

async function run() {
  const startTime = Date.now();
  console.log('====================================================');
  console.log('   Gather Calendar Full Media WebP Migration');
  console.log('====================================================\n');

  const tempDir = join(tmpdir(), `all-media-webp-${Date.now()}`);
  await mkdir(tempDir, { recursive: true });

  const state = await loadState();
  const allPhotos = await collectAllUniquePhotos();

  const toProcess = allPhotos.filter(p => !state.completed[p.storagePath]);

  console.log(`[media-webp] Total unique photos: ${allPhotos.length}`);
  console.log(`[media-webp] Already completed: ${Object.keys(state.completed).length}`);
  console.log(`[media-webp] To process in this run: ${toProcess.length}`);

  let completedInRun = 0;
  let failedInRun = 0;
  let saveCounter = 0;

  let cursor = 0;
  async function worker(workerId) {
    while (cursor < toProcess.length) {
      const idx = cursor++;
      const item = toProcess[idx];
      try {
        await processPhotoItem(item, tempDir, idx, toProcess.length, state);
        completedInRun++;
      } catch (err) {
        console.error(`[Worker ${workerId}] Failed: ${item.storagePath} (${err.message})`);
        state.failed[item.storagePath] = { error: err.message, at: Date.now() };
        failedInRun++;
      }

      saveCounter++;
      if (saveCounter % 25 === 0) {
        await saveState(state);
      }
      await sleep(25);
    }
  }

  const workers = Array.from({ length: CONCURRENCY }, (_, i) => worker(i + 1));
  await Promise.all(workers);
  await saveState(state);

  const durationSec = ((Date.now() - startTime) / 1000).toFixed(1);
  const totalOrigMb = (state.stats.origTotalBytes / (1024 * 1024)).toFixed(2);
  const totalWebpMb = (state.stats.webpTotalBytes / (1024 * 1024)).toFixed(2);
  const savedMb = ((state.stats.origTotalBytes - state.stats.webpTotalBytes) / (1024 * 1024)).toFixed(2);
  const savedPct = state.stats.origTotalBytes > 0
    ? (((state.stats.origTotalBytes - state.stats.webpTotalBytes) / state.stats.origTotalBytes) * 100).toFixed(1)
    : '0.0';

  console.log('\n====================================================');
  console.log('   Full Media WebP Migration Results Summary');
  console.log('====================================================');
  console.log(`- Processed in this session: ${completedInRun}`);
  console.log(`- Failed items: ${failedInRun}`);
  console.log(`- Total converted in state: ${state.stats.convertedCount}`);
  console.log(`- Original Data Size: ${totalOrigMb} MB`);
  console.log(`- Optimized WebP Size: ${totalWebpMb} MB`);
  console.log(`- Total Data Saved: ${savedMb} MB (${savedPct}% reduction)`);
  console.log(`- Elapsed Time: ${durationSec}s`);
  console.log('====================================================\n');

  // Verify live converted samples
  await verifyLiveSamples(allPhotos, 20);
}

run().catch(err => {
  console.error('[media-webp] Fatal error:', err);
  process.exit(1);
});
