import { test } from 'node:test';
import assert from 'node:assert/strict';

globalThis.window = globalThis.window || {};
const { getPhotoCommentIdentity } = await import('../src/core/app-domain-helpers.js');

test('ambiguous meeting rows with shared metadata keep distinct comment keys', () => {
  const rows = [
    { source: 'meeting', meetingDate: '2026-09-06', photoId: 'msg-1', sourceMessageId: 'msg-1', full: 'https://cdn.test/a.jpg' },
    { source: 'meeting', meetingDate: '2026-09-06', photoId: 'msg-1', sourceMessageId: 'msg-1', full: 'https://cdn.test/b.jpg' }
  ];
  const first = getPhotoCommentIdentity(rows[0], rows, { source: 'meeting', meetingDate: '2026-09-06' });
  const second = getPhotoCommentIdentity(rows[1], rows, { source: 'meeting', meetingDate: '2026-09-06' });
  assert.notEqual(first.mediaKey, second.mediaKey);
  assert.notEqual(first.refKey, second.refKey);
  assert.equal(first.legacyKeys.includes(second.mediaKey), false);
});

test('canonical asset identity remains stable when a real image index is present', () => {
  const photo = {
    source: 'meeting', meetingDate: '2026-09-06', photoId: 'photo-7',
    sourceMessageId: 'msg-1', sourceImageIndex: 7, full: 'https://cdn.test/photo-7.jpg'
  };
  const identity = getPhotoCommentIdentity(photo, [photo], { source: 'meeting', meetingDate: '2026-09-06' });
  assert.ok(identity.mediaKey);
  assert.equal(identity.mediaKey, identity.refKey);
  assert.ok(identity.legacyKeys.includes('chat:msg-1:7'));
});
