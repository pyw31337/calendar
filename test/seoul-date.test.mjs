import test from 'node:test';
import assert from 'node:assert/strict';
import {
  seoulDateKey,
  todaySeoulDateKey,
  addDaysToDateKey,
  seoulMonthKey,
  diffDaysFromSeoulToday,
  seoulHour
} from '../src/core/seoul-date.js';

// Fixed instants: 23:30 KST = 14:30Z same calendar day; 01:00 KST = 16:00Z previous UTC day.
const kst2330 = new Date('2026-10-05T23:30:00+09:00');
const kst0100 = new Date('2026-10-06T01:00:00+09:00');

test('seoulDateKey follows Asia/Seoul wall date at 23:30 KST', () => {
  assert.equal(seoulDateKey(kst2330), '2026-10-05');
  assert.equal(seoulHour(kst2330), 23);
});

test('seoulDateKey follows Asia/Seoul wall date at 01:00 KST (UTC still previous day)', () => {
  assert.equal(kst0100.toISOString().slice(0, 10), '2026-10-05'); // UTC date
  assert.equal(seoulDateKey(kst0100), '2026-10-06');
  assert.equal(seoulHour(kst0100), 1);
});

test('todaySeoulDateKey / month / addDays / diffDays', () => {
  assert.equal(todaySeoulDateKey(kst2330), '2026-10-05');
  assert.equal(seoulMonthKey(kst0100), '2026-10');
  assert.equal(addDaysToDateKey('2026-10-05', 1), '2026-10-06');
  assert.equal(addDaysToDateKey('2026-10-05', -1), '2026-10-04');
  assert.equal(diffDaysFromSeoulToday('2026-10-05', kst2330), 0);
  assert.equal(diffDaysFromSeoulToday('2026-10-06', kst2330), 1);
  assert.equal(diffDaysFromSeoulToday('2026-10-04', kst2330), -1);
});

test('non-KST process TZ still yields Seoul keys (TZ env)', async () => {
  // Spawn a child with TZ=America/New_York so device-local Date getters would disagree.
  const { spawnSync } = await import('node:child_process');
  const script = `
    import { seoulDateKey, seoulHour } from './src/core/seoul-date.js';
    const d = new Date('2026-10-05T23:30:00+09:00');
    if (seoulDateKey(d) !== '2026-10-05') { console.error('bad key', seoulDateKey(d)); process.exit(1); }
    if (seoulHour(d) !== 23) { console.error('bad hour', seoulHour(d)); process.exit(1); }
    const early = new Date('2026-10-06T01:00:00+09:00');
    if (seoulDateKey(early) !== '2026-10-06') { console.error('bad early', seoulDateKey(early)); process.exit(1); }
    console.log('ok');
  `;
  const result = spawnSync(process.execPath, ['--input-type=module', '-e', script], {
    cwd: new URL('..', import.meta.url).pathname,
    env: { ...process.env, TZ: 'America/New_York' },
    encoding: 'utf8'
  });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(result.stdout, /ok/);
});
