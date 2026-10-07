import test from 'node:test';
import assert from 'node:assert/strict';
import { installClientErrorMonitor } from '../src/core/client-error-monitor.js';

test('client diagnostics are deduplicated, bounded, calendar-aware and removable', () => {
  const target = new EventTarget();
  const reports = [];
  let calendar = 'first';
  const cleanup = installClientErrorMonitor({ target, getCalendarId: () => calendar,
    sanitizeText: (text, limit) => text.slice(0, limit),
    queueServerAuditEvent: (...args) => reports.push(args), getClientAuditContext: () => ({}), showToast: () => {} });
  const emit = message => { const event = new Event('error'); event.message = message; target.dispatchEvent(event); };
  emit('first error'); emit('first error');
  calendar = 'second';
  for (let index = 0; index < 8; index += 1) emit(`error ${index}`);
  assert.equal(reports.length, 5);
  assert.equal(reports[0][0], 'first');
  assert.equal(reports[1][0], 'second');
  cleanup();
  emit('after cleanup');
  assert.equal(reports.length, 5);
});

test('an already broken realtime connection exposes the reload action', () => {
  const target = new EventTarget();
  target.__gatherFirestoreBroken = 'broken';
  let reloaded = false;
  target.location = { reload: () => { reloaded = true; } };
  let toast;
  const cleanup = installClientErrorMonitor({ target, getCalendarId: () => '', sanitizeText: text => text,
    queueServerAuditEvent: () => {}, getClientAuditContext: () => ({}), showToast: (...args) => { toast = args; } });
  assert.equal(toast[5], '새로고침');
  toast[3]();
  assert.equal(reloaded, true);
  cleanup();
});
