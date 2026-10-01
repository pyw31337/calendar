#!/usr/bin/env node
/**
 * Local Machine WebP Image Optimization Tool
 *
 * Scans photos from Firestore, downloads existing non-WebP thumbnails,
 * converts them to high-efficiency WebP (420px cap, quality 80) using cwebp/sips,
 * measures bandwidth savings, and prepares or uploads optimized assets.
 *
 * Usage:
 *   node scripts/optimize-media-webp.mjs --calendar cw --dry-run
 *   OPTIMIZE_CALENDAR_IDS=cw node scripts/optimize-media-webp.mjs
 */

import { existsSync } from 'node:fs';
import { mkdir, readdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { tmpdir } from 'node:os';

const execFileAsync = promisify(execFile);

const PROJECT_ID = 'metro-live-2918e';
const ROOT = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;
const CWEBP_PATH = existsSync('/opt/homebrew/bin/cwebp') ? '/opt/homebrew/bin/cwebp' : 'cwebp';
const SIPS_PATH = '/usr/bin/sips';

function parseArgs() {
  const argv = process.argv.slice(2);
  const args = {
    calendar: process.env.OPTIMIZE_CALENDAR_IDS || 'cw',
    dryRun: argv.includes('--dry-run') || process.env.DRY_RUN === '1',
    limit: 100,
    quality: 80,
    maxDim: 420,
    localDir: '',
    outDir: join(process.cwd(), 'dist', 'optimized-webp')
  };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--calendar' && argv[i + 1]) args.calendar = argv[++i];
    if (argv[i] === '--limit' && argv[i + 1]) args.limit = Number(argv[++i]) || 100;
    if (argv[i] === '--quality' && argv[i + 1]) args.quality = Number(argv[++i]) || 80;
    if (argv[i] === '--local-dir' && argv[i + 1]) args.localDir = argv[++i];
    if (argv[i] === '--out-dir' && argv[i + 1]) args.outDir = argv[++i];
  }
  return args;
}

function decode(value) {
  if (!value || typeof value !== 'object') return undefined;
  if ('stringValue' in value) return value.stringValue;
  if ('integerValue' in value) return Number(value.integerValue);
  if ('doubleValue' in value) return Number(value.doubleValue);
  if ('booleanValue' in value) return value.booleanValue;
  if ('nullValue' in value) return null;
  if ('arrayValue' in value) return (value.arrayValue.values || []).map(decode);
  if ('mapValue' in value) return Object.fromEntries(Object.entries(value.mapValue.fields || {}).map(([k, v]) => [k, decode(v)]));
  return undefined;
}

const decodeDoc = doc => ({
  id: decodeURIComponent(doc.name.split('/').pop()),
  ...Object.fromEntries(Object.entries(doc.fields || {}).map(([k, v]) => [k, decode(v)])),
});

async function listAll(path) {
  const out = [];
  let pageToken = '';
  do {
    const query = new URLSearchParams({ pageSize: '100' });
    if (pageToken) query.set('pageToken', pageToken);
    try {
      const response = await fetch(`${ROOT}/${path}?${query}`);
      if (!response.ok) {
        if (response.status === 404) return out;
        throw new Error(`list failed ${path}: ${response.status}`);
      }
      const payload = await response.json();
      (payload.documents || []).forEach(doc => out.push(decodeDoc(doc)));
      pageToken = payload.nextPageToken || '';
    } catch (e) {
      console.warn(`[optimize-webp] fetch ${path} note: ${e.message}`);
      break;
    }
  } while (pageToken);
  return out;
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

async function convertToWebP(inputPath, outputPath, { quality, maxDim }) {
  try {
    const dims = await getImageDimensions(inputPath);
    const shouldResize = dims.width > maxDim || dims.height > maxDim;
    const cwebpArgs = ['-q', String(quality)];
    if (shouldResize) {
      if (dims.width >= dims.height) cwebpArgs.push('-resize', String(maxDim), '0');
      else cwebpArgs.push('-resize', '0', String(maxDim));
    }
    cwebpArgs.push(inputPath, '-o', outputPath);
    await execFileAsync(CWEBP_PATH, cwebpArgs);
    return true;
  } catch (_) {
    // Fallback: sips resize then sips to webp or jpeg
    try {
      await execFileAsync(SIPS_PATH, [
        '-Z', String(maxDim),
        inputPath,
        '--out', outputPath
      ]);
      return true;
    } catch (err2) {
      console.error(`[optimize-webp] conversion failed for ${inputPath}:`, err2.message);
      return false;
    }
  }
}

async function main() {
  const args = parseArgs();
  console.log(`[optimize-webp] Starting WebP optimization scan for calendar: ${args.calendar}`);
  console.log(`[optimize-webp] Settings: quality=${args.quality}, maxDim=${args.maxDim}px, dryRun=${args.dryRun}`);

  await mkdir(args.outDir, { recursive: true });

  const calendars = args.calendar.split(',').map(s => s.trim()).filter(Boolean);
  let totalCandidates = 0;
  let totalOptimized = 0;
  let totalBytesBefore = 0;
  let totalBytesAfter = 0;

  if (args.localDir) {
    console.log(`\n--- Local Directory [${args.localDir}] ---`);
    if (!existsSync(args.localDir)) {
      console.error(`[optimize-webp] Local directory not found: ${args.localDir}`);
      return;
    }
    const files = await readdir(args.localDir);
    const imageFiles = files.filter(f => /\.(jpe?g|png)$/i.test(f));
    console.log(`[optimize-webp] Found ${imageFiles.length} image files in ${args.localDir}.`);
    for (const f of imageFiles.slice(0, args.limit)) {
      const inputPath = join(args.localDir, f);
      const outputName = `${f.replace(/\.[^.]+$/, '')}_thumb.webp`;
      const outputPath = join(args.outDir, outputName);
      const inStat = await stat(inputPath);
      const originalSize = inStat.size;
      const ok = await convertToWebP(inputPath, outputPath, { quality: args.quality, maxDim: args.maxDim });
      if (ok && existsSync(outputPath)) {
        const outStat = await stat(outputPath);
        const newSize = outStat.size;
        const savingsPct = (((originalSize - newSize) / originalSize) * 100).toFixed(1);
        totalBytesBefore += originalSize;
        totalBytesAfter += newSize;
        totalOptimized += 1;
        console.log(`✔ [LOCAL] ${f} (${(originalSize / 1024).toFixed(1)} KB) -> ${outputName} (${(newSize / 1024).toFixed(1)} KB, -${savingsPct}%)`);
      }
    }
    totalCandidates += imageFiles.length;
  }

  for (const calId of calendars) {
    console.log(`\n--- Calendar [${calId}] ---`);
    const messages = await listAll(`calendars/${calId}/messages`);
    const photoCandidates = [];

    messages.forEach(msg => {
      const thumbs = Array.isArray(msg.thumbUrls) && msg.thumbUrls.length
        ? msg.thumbUrls
        : (msg.thumbUrl ? [msg.thumbUrl] : []);
      thumbs.forEach((url, idx) => {
        if (typeof url === 'string' && url.includes('firebasestorage') && !url.includes('.webp')) {
          photoCandidates.push({
            type: 'message',
            docId: msg.id,
            index: idx,
            url
          });
        }
      });
    });

    console.log(`[optimize-webp] Found ${photoCandidates.length} non-WebP thumbnail candidates in messages.`);
    totalCandidates += photoCandidates.length;

    const toProcess = photoCandidates.slice(0, args.limit);
    for (const item of toProcess) {
      try {
        const res = await fetch(item.url);
        if (!res.ok) continue;
        const buffer = Buffer.from(await res.arrayBuffer());
        const originalSize = buffer.length;

        const tempInput = join(tmpdir(), `orig_${Date.now()}_${Math.random().toString(36).slice(2, 6)}.tmp`);
        const tempOutput = join(tmpdir(), `opt_${Date.now()}_${Math.random().toString(36).slice(2, 6)}.webp`);
        await writeFile(tempInput, buffer);

        const ok = await convertToWebP(tempInput, tempOutput, { quality: args.quality, maxDim: args.maxDim });
        if (ok && existsSync(tempOutput)) {
          const stats = await stat(tempOutput);
          const newSize = stats.size;
          const savingsPct = (((originalSize - newSize) / originalSize) * 100).toFixed(1);

          totalBytesBefore += originalSize;
          totalBytesAfter += newSize;
          totalOptimized += 1;

          // Save to output directory
          const savedName = `${calId}_${item.docId}_${item.index}.webp`;
          const finalPath = join(args.outDir, savedName);
          const webpData = await readFile(tempOutput);
          await writeFile(finalPath, webpData);

          console.log(`✔ [${item.docId}#${item.index}] ${(originalSize / 1024).toFixed(1)} KB -> ${(newSize / 1024).toFixed(1)} KB (-${savingsPct}%) saved to ${savedName}`);
        }

        await rm(tempInput, { force: true }).catch(() => {});
        await rm(tempOutput, { force: true }).catch(() => {});
      } catch (err) {
        console.warn(`⚠ Failed processing item ${item.docId}: ${err.message}`);
      }
    }
  }

  const overallSavingsPct = totalBytesBefore > 0
    ? (((totalBytesBefore - totalBytesAfter) / totalBytesBefore) * 100).toFixed(1)
    : 0;

  console.log('\n========================================');
  console.log(`[optimize-webp] Optimization Complete!`);
  console.log(`- Total Candidates: ${totalCandidates}`);
  console.log(`- Optimized: ${totalOptimized}`);
  console.log(`- Original Size: ${(totalBytesBefore / 1024).toFixed(1)} KB`);
  console.log(`- WebP Size: ${(totalBytesAfter / 1024).toFixed(1)} KB`);
  console.log(`- Total Bandwidth Saved: ${((totalBytesBefore - totalBytesAfter) / 1024).toFixed(1)} KB (-${overallSavingsPct}%)`);
  console.log(`- Output Directory: ${args.outDir}`);
  console.log('========================================\n');
}

main().catch(err => {
  console.error('[optimize-webp] Fatal error:', err);
  process.exit(1);
});
