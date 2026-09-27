import test from 'node:test';
import assert from 'node:assert/strict';
import {
  summarizeIntegrity, summarizeClientErrors, parsePreviousState, diffAgainstPrevious, renderReport, renderAlertComment,
} from '../scripts/lib/ops-daily-report.mjs';

const audit = (dead, orphan) => ({ reports: [
  { calendarId: 'cal1', deadIndexRows: dead, sourceRefsToMissingFiles: 0, staleIndexOwners: 2, copiesWithDifferentTags: 1, orphanCommentThreads: orphan },
  { calendarId: 'cal2', error: 'list failed 503' },
] });
const now = Date.UTC(2026, 8, 27, 2);
const logs = [
  { action: 'client_error', target: 't is not a function', calendarId: 'cal1', sessionId: 'a', receivedAt: now - 1000 },
  { action: 'client_error', target: 't is not a function', calendarId: 'cal1', sessionId: 'b', receivedAt: now - 2000 },
  { action: 'client_error', target: 'old error', calendarId: 'cal1', sessionId: 'a', receivedAt: now - 2 * 86400000 },
  { action: 'photo_delete', target: 'not an error', calendarId: 'cal1', receivedAt: now - 1000 },
];

test('client errors are grouped per message within 24h', () => {
  const errors = summarizeClientErrors(logs, { now });
  assert.deepEqual(errors, [{ message: 't is not a function', count: 2, calendars: ['cal1'], people: 2 }]);
});

test('first run never alerts; the state round-trips through the issue body', () => {
  const integrity = summarizeIntegrity(audit(3, 1));
  const errors = summarizeClientErrors(logs, { now });
  const current = { counts: integrity.counts, failed: [], errors };
  const diff = diffAgainstPrevious(null, current);
  assert.equal(diff.firstRun, true);
  const body = renderReport({ date: '2026-09-27', integrity, errors, diff, errorsAvailable: true });
  assert.match(body, /나빠진 항목 없음/);
  assert.deepEqual(parsePreviousState(body).counts, integrity.counts);
  assert.deepEqual(parsePreviousState(body).errorMessages, ['t is not a function']);
});

test('only counts that went up, failed audits and new messages alert', () => {
  const before = summarizeIntegrity(audit(3, 1));
  const previous = { counts: before.counts, errorMessages: ['t is not a function'] };
  const after = summarizeIntegrity(audit(5, 0));
  const errors = [...summarizeClientErrors(logs, { now }), { message: 'new crash', count: 1, calendars: ['cal1'], people: 1 }];
  const diff = diffAgainstPrevious(previous, { counts: after.counts, failed: after.failed, errors });
  assert.deepEqual(diff.worse, [
    { key: 'cal1.deadIndexRows', before: 3, after: 5 },
    { key: 'cal2.auditFailed', before: 0, after: 1 },
  ]);
  assert.deepEqual(diff.newErrors.map(error => error.message), ['new crash']);
  const comment = renderAlertComment({ date: '2026-09-27', diff });
  assert.match(comment, /3 → 5/);
  assert.match(comment, /new crash/);
});

test('unchanged or improved counts stay quiet', () => {
  const state = summarizeIntegrity(audit(3, 1));
  const diff = diffAgainstPrevious({ counts: state.counts, errorMessages: [] }, { counts: summarizeIntegrity(audit(3, 0)).counts, failed: [], errors: [] });
  assert.deepEqual(diff.worse, []);
  assert.deepEqual(diff.newErrors, []);
});
