#!/usr/bin/env node
// 어드민 '맥 백업' 버튼 ↔ 이 맥. Runs with the 15-minute media worker (run-media-worker.sh):
// one small call to macWorkerSync (worker token from the Keychain) says the Mac is alive and asks
// whether the admin requested a backup. If so, backup.sh --auto runs (secrets locked with the
// Keychain passphrase) and its summary -- never a key, passphrase or file content -- is reported
// back so the admin page shows the result. Never fails the media worker: errors are reported.
import { execFile } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const supportDir = join(homedir(), 'Library', 'Application Support', 'Moyeora');
const configPath = process.argv[2] || join(supportDir, 'media-worker.json');

const run = (command, args, options = {}) => new Promise((resolve, reject) => {
  execFile(command, args, { maxBuffer: 4 * 1024 * 1024, ...options }, (error, stdout, stderr) => {
    if (error) reject(new Error(String(stderr || error.message).trim().slice(0, 400)));
    else resolve(String(stdout));
  });
});

async function sync(endpoint, token, body) {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(20000),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload?.ok === false) throw new Error(`macWorkerSync ${response.status}`);
  return payload;
}

async function main() {
  const config = JSON.parse(await readFile(configPath, 'utf8'));
  const project = config.projectId || 'metro-live-2918e';
  const endpoint = `https://asia-northeast3-${project}.cloudfunctions.net/macWorkerSync`;
  const token = (await run('/usr/bin/security', ['find-generic-password', '-a', config.tokenAccount || process.env.USER || '', '-s', config.tokenService || 'Moyeora Media Analysis Worker', '-w'])).trim();
  const { backupRequestedAt } = await sync(endpoint, token, {});
  if (!backupRequestedAt) return;
  let backup;
  try {
    await run('/bin/zsh', [join(here, 'backup.sh'), '--auto'], { timeout: 20 * 60 * 1000 });
    backup = JSON.parse(await readFile(join(supportDir, 'mac-backup-latest.json'), 'utf8'));
  } catch (error) {
    backup = { ok: false, at: Date.now(), error: String(error?.message || error) };
  }
  await sync(endpoint, token, { backup, handledRequestAt: backupRequestedAt });
  console.log(`mac backup ${backup.ok ? 'done' : 'failed'}: ${backup.file || backup.error || ''}`);
}

main().catch(error => console.warn('mac backup sync skipped:', String(error?.message || error)));
