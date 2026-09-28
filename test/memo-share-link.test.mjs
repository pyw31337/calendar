import assert from 'node:assert/strict';
import { test } from 'node:test';
import { findMemoShareUrlInText, parseMemoShareUrl } from '../src/core/memo-share-link.js';

const memoUrl = 'https://pyw31337.github.io/calendar/share/cw/memo/memo_1790572457893_pd5x8z/';

test('memo share parser recognises only a valid app-owned memo route', () => {
  const parsed = parseMemoShareUrl(memoUrl, {
    locationLike: { host: 'pyw31337.github.io' }, publicCalendarIds: ['cw']
  });
  assert.deepEqual(parsed && { calendarId: parsed.calendarId, memoId: parsed.memoId }, {
    calendarId: 'cw', memoId: 'memo_1790572457893_pd5x8z'
  });
  assert.equal(parseMemoShareUrl('https://example.test/calendar/share/cw/memo/memo_1/', {
    locationLike: { host: 'pyw31337.github.io' }, publicCalendarIds: ['cw']
  }), null);
});

test('only a standalone pasted memo URL replaces a chat bubble body', () => {
  const only = findMemoShareUrlInText(`${memoUrl}!`, {
    locationLike: { host: 'pyw31337.github.io' }, publicCalendarIds: ['cw']
  });
  assert.equal(only?.isOnlyUrl, true);
  const embedded = findMemoShareUrlInText(`이 메모 봐줘 ${memoUrl}`, {
    locationLike: { host: 'pyw31337.github.io' }, publicCalendarIds: ['cw']
  });
  assert.equal(embedded?.isOnlyUrl, false);
});
