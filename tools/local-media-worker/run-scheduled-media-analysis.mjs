#!/usr/bin/env node
/* Time-gates Mac-local media analysis: weekday 18:00–07:59 KST, every hour on weekends and Korean public holidays. */

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const WORKER_DIR = dirname(fileURLToPath(import.meta.url));
const SERVER_WORKER = join(WORKER_DIR, 'run-server-photo-analysis.mjs');
const FACE_WORKER = join(WORKER_DIR, 'face-tags.py');
const DEFAULT_HOLIDAY_FEED = 'https://calendar.google.com/calendar/ical/ko.south_korea%23holiday%40group.v.calendar.google.com/public/basic.ics';
const HOLIDAY_CACHE_MS = 7 * 24 * 60 * 60 * 1000;

function kstParts(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit',
    hourCycle: 'h23', weekday: 'short'
  }).formatToParts(date);
  const get = type => parts.find(part => part.type === type)?.value || '';
  return { key: `${get('year')}-${get('month')}-${get('day')}`, hour: Number(get('hour')), weekday: get('weekday') };
}

export function isAnalysisWindow({ date = new Date(), holidayKeys = new Set(), allowAllHours = false } = {}) {
  const current = kstParts(date);
  const weekend = current.weekday === 'Sat' || current.weekday === 'Sun';
  const holiday = holidayKeys.has(current.key);
  return { ...current, weekend, holiday, allowAllHours, allowed: Boolean(allowAllHours) || weekend || holiday || current.hour >= 18 || current.hour < 8 };
}

export function parseHolidayIcs(ics = '') {
  const dates = new Set();
  for (const line of String(ics).replace(/\r/g, '').split('\n')) {
    const match = line.match(/^DTSTART(?:;[^:]*)?:(\d{4})(\d{2})(\d{2})/);
    if (match) dates.add(`${match[1]}-${match[2]}-${match[3]}`);
  }
  return dates;
}

async function readJson(path, fallback) {
  try { return JSON.parse(await readFile(path, 'utf8')); } catch { return fallback; }
}

async function writeJson(path, value) {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

async function readHolidayKeys(cachePath, feedUrl) {
  const cached = await readJson(cachePath, { fetchedAt: 0, dates: [] });
  if (Date.now() - Number(cached.fetchedAt || 0) < HOLIDAY_CACHE_MS && Array.isArray(cached.dates)) return new Set(cached.dates);
  try {
    const response = await fetch(feedUrl, { headers: { Accept: 'text/calendar' } });
    if (!response.ok) throw new Error(`Holiday feed ${response.status}`);
    const dates = Array.from(parseHolidayIcs(await response.text())).sort();
    await writeJson(cachePath, { fetchedAt: Date.now(), dates });
    return new Set(dates);
  } catch (error) {
    console.warn(`Holiday calendar refresh failed: ${error.message}`);
    return new Set(Array.isArray(cached.dates) ? cached.dates : []);
  }
}

function run(command, args) {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(command, args, { stdio: 'inherit' });
    child.on('error', reject);
    child.on('close', code => code === 0 ? resolvePromise() : reject(new Error(`${command} exited ${code}`)));
  });
}

async function main() {
  const configPath = resolve(process.argv[2] || join(process.env.HOME || '', 'Library/Application Support/Moyeora/media-worker.json'));
  const config = await readJson(configPath, null);
  if (!config || !Array.isArray(config.calendarIds) || !config.calendarIds.length) throw new Error(`Missing calendarIds in ${configPath}`);
  const appDir = dirname(configPath);
  const holidays = await readHolidayKeys(resolve(config.holidayCachePath || join(appDir, 'korean-holidays.json')), config.holidayFeedUrl || DEFAULT_HOLIDAY_FEED);
  const allowAllHours = Boolean(config.allowAllHours || process.env.MOYEORA_MEDIA_ALL_HOURS === '1' || process.argv.includes('--all-hours'));
  const window = isAnalysisWindow({ holidayKeys: holidays, allowAllHours });
  const reportPath = resolve(config.schedulerReportPath || join(appDir, 'media-analysis-scheduler-latest.json'));
  if (!window.allowed) {
    await writeJson(reportPath, { status: 'idle', reason: 'weekday-daytime', generatedAt: Date.now(), ...window });
    return;
  }
  const results = [];
  for (const calendarId of config.calendarIds) {
    const reportFile = resolve(config.reportDirectory || join(appDir, 'media-analysis-reports'), `${calendarId}-latest.json`);
    const args = [SERVER_WORKER, '--calendar', calendarId, '--project', config.projectId || 'metro-live-2918e', '--state', resolve(config.statePath || join(appDir, 'server-photo-analysis-state.json')), '--output', reportFile, '--max', String(config.maxPerRun || 80), '--concurrency', String(config.analysisConcurrency || 4), '--token-service', config.tokenService || 'Moyeora Media Analysis Worker'];
    if (config.tokenAccount) args.push('--token-account', config.tokenAccount);
    if (config.endpoint) args.push('--endpoint', config.endpoint);
    if (config.visionBinary) args.push('--vision-bin', resolve(config.visionBinary));
    try {
      await run(process.execPath, args);
      results.push({ calendarId, ok: true, reportFile });
    } catch (error) {
      results.push({ calendarId, ok: false, error: String(error?.message || error).slice(0, 300), reportFile });
    }
    // Face suggestions (opt-in: `face-tags.py --enable-schedule` writes facePython). They run after
    // Vision so a new upload gets both; a face failure is reported but never fails the Vision run.
    if (config.facePython) {
      const result = results[results.length - 1];
      try {
        await run(config.facePython, [FACE_WORKER, '--calendar', calendarId, '--config', configPath, '--upload', '--quiet', '--max-new', String(config.faceMaxNewPerRun || 400)]);
        result.faces = { ok: true };
      } catch (error) {
        result.faces = { ok: false, error: String(error?.message || error).slice(0, 300) };
        console.error(`Face suggestions failed for ${calendarId}:`, result.faces.error);
      }
    }
  }
  await writeJson(reportPath, { status: results.every(result => result.ok) ? 'completed' : 'partial', generatedAt: Date.now(), ...window, results });
  if (results.some(result => !result.ok)) process.exitCode = 1;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => { console.error(error?.stack || error); process.exitCode = 1; });
}
