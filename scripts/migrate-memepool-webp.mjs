#!/usr/bin/env node
/**
 * Automated Meme Pool WebP Batch Migration Script
 *
 * Scans all meme items from Firestore memePool collection,
 * downloads existing JPG/PNG thumbnails and full images,
 * converts them to optimized WebP format (q=80 for thumb, q=82 for full) using local cwebp/sips,
 * uploads them directly to Firebase Storage with proper Content-Type & cache headers,
 * updates Firestore documents via memePoolUpsert Cloud Function with admin credentials,
 * tracks progress in a resumable state file, and verifies image integrity.
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
const FIRESTORE_BASE = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/memePool`;
const UPSERT_FUNCTION_URL = `https://asia-northeast3-${PROJECT_ID}.cloudfunctions.net/memePoolUpsert`;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '0602';

const CWEBP_PATH = existsSync('/opt/homebrew/bin/cwebp') ? '/opt/homebrew/bin/cwebp' : 'cwebp';
const SIPS_PATH = '/usr/bin/sips';

const STATE_FILE_PATH = join(process.cwd(), 'scripts', 'data', 'meme-webp-state.json');
const CONCURRENCY = 6;
const MAX_RETRIES = 4;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function decodeFirestoreDoc(doc) {
  const fields = doc.fields || {};
  const decodeValue = (val) => {
    if (!val || typeof val !== 'object') return null;
    if ('stringValue' in val) return val.stringValue;
    if ('integerValue' in val) return Number(val.integerValue);
    if ('doubleValue' in val) return Number(val.doubleValue);
    if ('booleanValue' in val) return val.booleanValue;
    if ('arrayValue' in val) return (val.arrayValue.values || []).map(decodeValue);
    if ('nullValue' in val) return null;
    return null;
  };

  const id = doc.name.split('/').pop();
  return {
    id,
    thumbUrl: decodeValue(fields.thumbUrl) || '',
    fullUrl: decodeValue(fields.fullUrl) || '',
    hashtags: decodeValue(fields.hashtags) || [],
    fileName: decodeValue(fields.fileName) || '',
    fileSize: decodeValue(fields.fileSize),
    width: decodeValue(fields.width),
    height: decodeValue(fields.height)
  };
}

async function fetchAllMemeDocs() {
  console.log('[meme-webp] Fetching all documents from Firestore memePool...');
  const items = [];
  let pageToken = '';
  do {
    const url = `${FIRESTORE_BASE}?pageSize=300${pageToken ? `&pageToken=${pageToken}` : ''}`;
    let res = null;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        res = await fetch(url);
        if (res.ok) break;
      } catch (e) {
        if (attempt === 3) throw e;
        await sleep(1000 * attempt);
      }
    }
    if (!res || !res.ok) throw new Error(`Failed to fetch meme documents: ${res?.status}`);
    const data = await res.json();
    for (const doc of data.documents || []) {
      items.push(decodeFirestoreDoc(doc));
    }
    pageToken = data.nextPageToken || '';
  } while (pageToken);
  console.log(`[meme-webp] Total documents retrieved: ${items.length}`);
  return items;
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
    console.warn('[meme-webp] Failed to save state:', e.message);
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
      await sleep(500 * Math.pow(2, attempt - 1));
    }
  }
  throw lastErr;
}

async function downloadFile(url, destPath) {
  const res = await fetchWithRetry(url);
  const buffer = Buffer.from(await res.arrayBuffer());
  await writeFile(destPath, buffer);
  return buffer.length;
}

async function getImageDimensions(filePath) {
  try {
    const { stdout } = await execFileAsync(SIPS_PATH, ['-g', 'pixelWidth', '-g', 'pixelHeight', filePath]);
    const wMatch = stdout.match(/pixelWidth:\s*(\d+)/);
    const hMatch = stdout.match(/pixelHeight:\s*(\d+)/);
    return {
      width: wMatch ? Number(wMatch[1]) : 0,
      height: hMatch ? Number(hMatch[1]) : 0
    };
  } catch (_) {
    return { width: 0, height: 0 };
  }
}

async function convertToWebp(srcPath, destPath, quality) {
  const args = ['-q', String(quality), srcPath, '-o', destPath];
  await execFileAsync(CWEBP_PATH, args);
  const webpBuffer = await readFile(destPath);
  return webpBuffer;
}

async function uploadToFirebaseStorage(fileName, buffer) {
  const encodedName = encodeURIComponent(`memePool/${fileName}`);
  const uploadUrl = `https://firebasestorage.googleapis.com/v0/b/${BUCKET}/o?name=${encodedName}&uploadType=media`;

  const res = await fetchWithRetry(uploadUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'image/webp',
      'Cache-Control': 'public, max-age=31536000, immutable'
    },
    body: buffer
  });

  const data = await res.json();
  const token = data.downloadTokens;
  if (!token) throw new Error('No downloadTokens returned from Storage upload');
  return `https://firebasestorage.googleapis.com/v0/b/${BUCKET}/o/${encodedName}?alt=media&token=${token}`;
}

async function updateMemeFirestoreDoc(item, newThumbUrl, newFullUrl, width, height, fullBytes) {
  const payload = {
    password: ADMIN_PASSWORD,
    id: item.id,
    thumbUrl: newThumbUrl,
    fullUrl: newFullUrl,
    hashtags: item.hashtags,
    fileName: item.fileName,
    fileSize: fullBytes,
    width: width || item.width || null,
    height: height || item.height || null
  };

  const res = await fetchWithRetry(UPSERT_FUNCTION_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const result = await res.json();
  if (!result.ok) throw new Error(`memePoolUpsert failed: ${result.message || JSON.stringify(result)}`);
  return result;
}

async function processMemeItem(item, tempDir, index, total, state) {
  const id = item.id;
  const isThumbWebp = item.thumbUrl.includes('.webp');
  const isFullWebp = item.fullUrl.includes('.webp');
  const isGif = item.thumbUrl.includes('.gif') || item.fullUrl.includes('.gif');

  // Skip if already WebP or GIF (GIF animations preserved)
  if ((isThumbWebp && isFullWebp) || isGif) {
    return { skipped: true, reason: isGif ? 'gif' : 'already_webp' };
  }

  const thumbSrc = join(tempDir, `${id}_thumb_orig`);
  const fullSrc = join(tempDir, `${id}_full_orig`);
  const thumbWebp = join(tempDir, `${id}_thumb.webp`);
  const fullWebp = join(tempDir, `${id}_full.webp`);

  try {
    // 1. Download
    const [origThumbBytes, origFullBytes] = await Promise.all([
      downloadFile(item.thumbUrl, thumbSrc),
      downloadFile(item.fullUrl, fullSrc)
    ]);

    // 2. Convert to WebP
    const [thumbWebpBuf, fullWebpBuf] = await Promise.all([
      convertToWebp(thumbSrc, thumbWebp, 80),
      convertToWebp(fullSrc, fullWebp, 82)
    ]);

    const { width, height } = await getImageDimensions(fullWebp);

    // 3. Upload to Firebase Storage
    const [newThumbUrl, newFullUrl] = await Promise.all([
      uploadToFirebaseStorage(`${id}_thumb.webp`, thumbWebpBuf),
      uploadToFirebaseStorage(`${id}_full.webp`, fullWebpBuf)
    ]);

    // 4. Update Firestore Metadata
    await updateMemeFirestoreDoc(item, newThumbUrl, newFullUrl, width, height, fullWebpBuf.length);

    const origTotal = origThumbBytes + origFullBytes;
    const webpTotal = thumbWebpBuf.length + fullWebpBuf.length;
    const saved = origTotal - webpTotal;
    const pct = ((saved / origTotal) * 100).toFixed(1);

    state.completed[id] = {
      origBytes: origTotal,
      webpBytes: webpTotal,
      savedBytes: saved,
      thumbUrl: newThumbUrl,
      fullUrl: newFullUrl,
      at: Date.now()
    };
    state.stats.origTotalBytes += origTotal;
    state.stats.webpTotalBytes += webpTotal;
    state.stats.convertedCount += 1;

    console.log(`[${index + 1}/${total}] ID:${id} ${(origTotal / 1024).toFixed(1)}KB -> ${(webpTotal / 1024).toFixed(1)}KB (-${pct}%)`);

    return { success: true, saved, origTotal, webpTotal };
  } finally {
    // Clean up temporary files
    await Promise.allSettled([
      unlink(thumbSrc),
      unlink(fullSrc),
      unlink(thumbWebp),
      unlink(fullWebp)
    ]);
  }
}

async function verifyConvertedWebpSamples(state, sampleCount = 10) {
  console.log(`\n--- [meme-webp] Verifying Live Converted Samples (${sampleCount} items) ---`);
  const keys = Object.keys(state.completed);
  if (!keys.length) {
    console.log('No completed items to verify.');
    return;
  }

  const sampleKeys = keys.slice(0, sampleCount);
  let verifiedOk = 0;
  let totalLatencyMs = 0;

  for (const id of sampleKeys) {
    const entry = state.completed[id];
    const start = performance.now();
    try {
      const res = await fetch(entry.thumbUrl);
      const latency = performance.now() - start;
      totalLatencyMs += latency;
      const contentType = res.headers.get('content-type') || '';
      const bytes = (await res.arrayBuffer()).byteLength;
      if (res.ok && contentType.includes('webp') && bytes > 0) {
        console.log(`✔ [VERIFIED] ID:${id} (${(bytes / 1024).toFixed(1)}KB, ${contentType}) in ${latency.toFixed(0)}ms`);
        verifiedOk++;
      } else {
        console.warn(`✖ [VERIFY FAILED] ID:${id} status:${res.status} type:${contentType} bytes:${bytes}`);
      }
    } catch (err) {
      console.warn(`✖ [VERIFY ERROR] ID:${id}: ${err.message}`);
    }
  }

  const avgLatency = (totalLatencyMs / sampleKeys.length).toFixed(1);
  console.log(`Live verification complete: ${verifiedOk}/${sampleKeys.length} passed. Avg latency: ${avgLatency}ms\n`);
}

async function run() {
  const startTime = Date.now();
  console.log('====================================================');
  console.log('   Meme Pool WebP Batch Migration & Optimization');
  console.log('====================================================\n');

  const tempDir = join(tmpdir(), `meme-webp-${Date.now()}`);
  await mkdir(tempDir, { recursive: true });

  const state = await loadState();
  const allDocs = await fetchAllMemeDocs();

  // Filter items that need conversion
  const toProcess = allDocs.filter(doc => {
    if (state.completed[doc.id]) return false;
    const isThumbWebp = doc.thumbUrl.includes('.webp');
    const isFullWebp = doc.fullUrl.includes('.webp');
    const isGif = doc.thumbUrl.includes('.gif') || doc.fullUrl.includes('.gif');
    return !isGif && (!isThumbWebp || !isFullWebp);
  });

  console.log(`[meme-webp] Total pool: ${allDocs.length}`);
  console.log(`[meme-webp] Already completed: ${Object.keys(state.completed).length}`);
  console.log(`[meme-webp] Eligible for conversion: ${toProcess.length}`);

  let completedInRun = 0;
  let failedInRun = 0;
  let saveCounter = 0;

  // Worker pool execution
  let cursor = 0;
  async function worker(workerId) {
    while (cursor < toProcess.length) {
      const idx = cursor++;
      const item = toProcess[idx];
      try {
        await processMemeItem(item, tempDir, idx, toProcess.length, state);
        completedInRun++;
      } catch (err) {
        console.error(`[Worker ${workerId}] Failed item ${item.id}:`, err.message);
        state.failed[item.id] = { error: err.message, at: Date.now() };
        failedInRun++;
      }

      saveCounter++;
      if (saveCounter % 15 === 0) {
        await saveState(state);
      }
      await sleep(40); // small throttle to prevent burst
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
  console.log('   Meme Pool WebP Migration Results Summary');
  console.log('====================================================');
  console.log(`- Converted items in this session: ${completedInRun}`);
  console.log(`- Failed items: ${failedInRun}`);
  console.log(`- Total converted in state: ${state.stats.convertedCount}`);
  console.log(`- Original Data Size: ${totalOrigMb} MB`);
  console.log(`- Optimized WebP Size: ${totalWebpMb} MB`);
  console.log(`- Total Data Saved: ${savedMb} MB (${savedPct}% reduction)`);
  console.log(`- Elapsed Time: ${durationSec}s`);
  console.log('====================================================\n');

  // Verify converted samples live
  await verifyConvertedWebpSamples(state, 15);
}

run().catch(err => {
  console.error('[meme-webp] Fatal error:', err);
  process.exit(1);
});
