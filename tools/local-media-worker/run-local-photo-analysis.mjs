#!/usr/bin/env node
/*
 * Reviewed local-only worker for an Apple Silicon Mac.
 *
 * It scans a normal inbox directory, sends originals to the bundled Vision helper and writes a
 * JSON suggestion manifest. It never opens Photos.app's library, uploads a byte, or mutates
 * calendar data. Keeping the destructive/remote step out of this worker makes unattended
 * launchd execution safe; the app can later offer an explicit "apply suggestions" review flow.
 */

import { createHash } from 'node:crypto';
import { mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import { basename, dirname, extname, join, resolve } from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const WORKER_DIR = dirname(fileURLToPath(import.meta.url));
const VISION_SCRIPT = join(WORKER_DIR, 'MediaInsight.swift');
const IMAGE_EXTENSIONS = new Set(['.avif', '.bmp', '.gif', '.heic', '.heif', '.jpeg', '.jpg', '.png', '.webp']);
const DEFAULT_MAX_PER_RUN = 40;

function parseArgs(argv) {
  const args = { input: '', output: '', max: DEFAULT_MAX_PER_RUN };
  for (let index = 0; index < argv.length; index += 1) {
    const key = argv[index];
    if (key === '--input') args.input = argv[++index] || '';
    else if (key === '--output') args.output = argv[++index] || '';
    else if (key === '--max') args.max = Math.max(1, Math.min(200, Number(argv[++index]) || DEFAULT_MAX_PER_RUN));
  }
  return args;
}

async function listImages(root) {
  const entries = await readdir(root, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async entry => {
    const path = join(root, entry.name);
    if (entry.isDirectory()) return listImages(path);
    return entry.isFile() && IMAGE_EXTENSIONS.has(extname(entry.name).toLowerCase()) ? [path] : [];
  }));
  return nested.flat().sort((a, b) => a.localeCompare(b, 'ko'));
}

function signature(path, size, modifiedAtMs) {
  return createHash('sha256').update(`${path}\u0000${size}\u0000${modifiedAtMs}`).digest('hex');
}

function runVision(filePath) {
  return new Promise((resolvePromise, reject) => {
    const child = spawn('/usr/bin/xcrun', ['swift', VISION_SCRIPT, filePath], { stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', chunk => { stdout += chunk; });
    child.stderr.on('data', chunk => { stderr += chunk; });
    child.on('error', reject);
    child.on('close', code => {
      if (code !== 0) return reject(new Error(stderr.trim() || `Vision exited ${code}`));
      try { return resolvePromise(JSON.parse(stdout)); }
      catch (error) { return reject(new Error(`Invalid Vision JSON: ${error.message}`)); }
    });
  });
}

async function readManifest(outputPath) {
  try {
    const parsed = JSON.parse(await readFile(outputPath, 'utf8'));
    return parsed && Array.isArray(parsed.items) ? parsed : { schemaVersion: 1, items: [] };
  } catch {
    return { schemaVersion: 1, items: [] };
  }
}

async function main() {
  const args = parseArgs(globalThis.process.argv.slice(2));
  if (!args.input || !args.output) {
    throw new Error('Usage: run-local-photo-analysis.mjs --input <inbox-dir> --output <suggestions.json> [--max 40]');
  }
  const input = resolve(args.input);
  const output = resolve(args.output);
  const manifest = await readManifest(output);
  const bySignature = new Map(manifest.items.map(item => [item.signature, item]));
  const images = await listImages(input);
  const pending = [];
  for (const filePath of images) {
    const info = await stat(filePath);
    const key = signature(filePath, info.size, info.mtimeMs);
    if (!bySignature.has(key)) pending.push({ filePath, info, key });
    if (pending.length >= args.max) break;
  }
  const next = [...manifest.items];
  for (const candidate of pending) {
    try {
      const insight = await runVision(candidate.filePath);
      next.push({
        signature: candidate.key,
        fileName: basename(candidate.filePath),
        filePath: candidate.filePath,
        size: candidate.info.size,
        modifiedAt: Math.round(candidate.info.mtimeMs),
        analyzedAt: Date.now(),
        status: 'suggested',
        insight
      });
      globalThis.console.log(`[suggested] ${candidate.filePath}`);
    } catch (error) {
      next.push({
        signature: candidate.key,
        fileName: basename(candidate.filePath),
        filePath: candidate.filePath,
        size: candidate.info.size,
        modifiedAt: Math.round(candidate.info.mtimeMs),
        analyzedAt: Date.now(),
        status: 'failed',
        error: String(error?.message || error).slice(0, 300)
      });
      globalThis.console.error(`[failed] ${candidate.filePath}: ${error.message}`);
    }
  }
  await mkdir(dirname(output), { recursive: true });
  await writeFile(output, `${JSON.stringify({
    schemaVersion: 1,
    generatedAt: Date.now(),
    sourceDirectory: input,
    pendingCount: Math.max(0, images.length - pending.length),
    items: next.slice(-5000)
  }, null, 2)}\n`, 'utf8');
  globalThis.console.log(`Processed ${pending.length} image(s); suggestions remain local at ${output}`);
}

main().catch(error => {
  globalThis.console.error(error.message || error);
  globalThis.process.exitCode = 1;
});
