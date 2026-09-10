import { test } from 'node:test';
import assert from 'node:assert/strict';

// app-firebase-data.js (and its transitive imports) reference `window.GATHER_APP_CONSTANTS` /
// `window.GATHER_APP_UTILS` at module top level to pick up browser-injected globals -- a plain
// static import would throw `window is not defined` in Node. A dynamic import() after this shim
// runs after the shim executes, since (unlike static imports) it isn't hoisted.
globalThis.window = globalThis.window || {};
const { mergeConfirmedMeetings } = await import('../src/core/app-firebase-data.js');

test('merging an empty incoming list changes nothing (a no-op snapshot must not erase data)', () => {
  const server = [{ date: '2026-01-01', confirmed: true, expenses: [{ id: 'e1', amount: 10000 }] }];
  const merged = mergeConfirmedMeetings(server, []);
  assert.equal(merged.length, 1);
  assert.equal(merged[0].date, '2026-01-01');
});

test('an older incoming record does not overwrite newer server data', () => {
  const server = [{ date: '2026-01-01', note: 'new note', updatedAt: 2000 }];
  const incoming = [{ date: '2026-01-01', note: 'stale note', updatedAt: 1000 }];
  const merged = mergeConfirmedMeetings(server, incoming);
  assert.equal(merged[0].note, 'new note');
});

test('a newer incoming record does overwrite older server data', () => {
  const server = [{ date: '2026-01-01', note: 'old note', updatedAt: 1000 }];
  const incoming = [{ date: '2026-01-01', note: 'fresh note', updatedAt: 2000 }];
  const merged = mergeConfirmedMeetings(server, incoming);
  assert.equal(merged[0].note, 'fresh note');
});

test('expenses from both sides are merged by id, not replaced wholesale', () => {
  const server = [{
    date: '2026-01-01', updatedAt: 1000,
    expenses: [{ id: 'e1', amount: 10000 }]
  }];
  const incoming = [{
    date: '2026-01-01', updatedAt: 2000,
    expenses: [{ id: 'e2', amount: 5000 }]
  }];
  const merged = mergeConfirmedMeetings(server, incoming);
  const ids = merged[0].expenses.map(e => e.id).sort();
  // Both e1 (from the older/server side) and e2 (the new one) must survive the merge --
  // this is the exact guarantee that keeps a settlement's expense list from silently
  // losing entries when two devices edit different expenses under the same date.
  assert.deepEqual(ids, ['e1', 'e2']);
});

test('a date present only on the server side is preserved when incoming has other dates', () => {
  const server = [
    { date: '2026-01-01', note: 'keep me' },
    { date: '2026-02-01', note: 'also keep me' }
  ];
  const incoming = [{ date: '2026-03-01', note: 'new meeting' }];
  const merged = mergeConfirmedMeetings(server, incoming);
  const dates = merged.map(m => m.date).sort();
  assert.deepEqual(dates, ['2026-01-01', '2026-02-01', '2026-03-01']);
});
