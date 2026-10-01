import assert from 'node:assert/strict';
import { test } from 'node:test';
import { findMemoShareUrlInText, parseMemoShareUrl, isInternalServiceUrl, isExternalServiceUrl } from '../src/core/memo-share-link.js';

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

test('memo share parser also recognises query-string deep links (?id=cw&memo=...) in chat bubbles', () => {
  const queryUrl = 'https://pyw31337.github.io/calendar/?id=cw&view=memo&memo=memo_1790569102511_icdks6';
  const parsed = parseMemoShareUrl(queryUrl, {
    locationLike: { host: 'pyw31337.github.io' }, publicCalendarIds: ['cw']
  });
  assert.deepEqual(parsed && { calendarId: parsed.calendarId, memoId: parsed.memoId }, {
    calendarId: 'cw', memoId: 'memo_1790569102511_icdks6'
  });
  const only = findMemoShareUrlInText(queryUrl, {
    locationLike: { host: 'pyw31337.github.io' }, publicCalendarIds: ['cw']
  });
  assert.equal(only?.isOnlyUrl, true);
  assert.equal(only?.memoId, 'memo_1790569102511_icdks6');
});

test('isExternalServiceUrl accepts external services and rejects internal app/memo links', () => {
  const loc = { host: 'pyw31337.github.io', hostname: 'pyw31337.github.io' };
  const opts = { locationLike: loc, publicCalendarIds: ['cw'] };

  // External services
  assert.equal(isExternalServiceUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ', opts), true);
  assert.equal(isExternalServiceUrl('https://youtu.be/dQw4w9WgXcQ', opts), true);
  assert.equal(isExternalServiceUrl('https://naver.me/5rabc123', opts), true);
  assert.equal(isExternalServiceUrl('https://m.blog.naver.com/post/1234', opts), true);
  assert.equal(isExternalServiceUrl('https://place.map.kakao.com/12345', opts), true);
  assert.equal(isExternalServiceUrl('https://www.instagram.com/p/C_abc/', opts), true);
  assert.equal(isInternalServiceUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ', opts), false);

  // Internal memo share URLs
  assert.equal(isInternalServiceUrl(memoUrl, opts), true);
  assert.equal(isExternalServiceUrl(memoUrl, opts), false);
  assert.equal(isInternalServiceUrl('https://pyw31337.github.io/calendar/?id=cw&memo=memo_123', opts), true);
  assert.equal(isExternalServiceUrl('https://pyw31337.github.io/calendar/?id=cw&memo=memo_123', opts), false);

  // Internal app host and bare domains
  assert.equal(isInternalServiceUrl('https://pyw31337.github.io', opts), true);
  assert.equal(isExternalServiceUrl('https://pyw31337.github.io', opts), false);
  assert.equal(isInternalServiceUrl('pyw31337.github.io', opts), true);
  assert.equal(isExternalServiceUrl('pyw31337.github.io', opts), false);
  assert.equal(isInternalServiceUrl('https://pyw31337.github.io/calendar/', opts), true);
  assert.equal(isExternalServiceUrl('https://pyw31337.github.io/calendar/', opts), false);

  // Localhost & Firebase hosting
  assert.equal(isInternalServiceUrl('http://localhost:5173/calendar', opts), true);
  assert.equal(isExternalServiceUrl('http://localhost:5173/calendar', opts), false);
  assert.equal(isInternalServiceUrl('https://metro-live-2918e.firebaseapp.com', opts), true);
  assert.equal(isExternalServiceUrl('https://metro-live-2918e.firebaseapp.com', opts), false);
  assert.equal(isInternalServiceUrl('https://demo-moyeora.web.app', opts), true);
  assert.equal(isExternalServiceUrl('https://demo-moyeora.web.app', opts), false);

  // Relative paths & internal fragments
  assert.equal(isInternalServiceUrl('/share/cw/memo/123', opts), true);
  assert.equal(isExternalServiceUrl('/share/cw/memo/123', opts), false);
  assert.equal(isInternalServiceUrl('#gatherLinks=abc', opts), true);
  assert.equal(isExternalServiceUrl('#gatherLinks=abc', opts), false);

  // Invalid / empty
  assert.equal(isExternalServiceUrl('', opts), false);
  assert.equal(isExternalServiceUrl('not a url', opts), false);
});
