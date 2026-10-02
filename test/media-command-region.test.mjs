import test from 'node:test';
import assert from 'node:assert/strict';
import { saveBulkPhotoTagsRemote } from '../src/core/bulk-photo-tags.js';

const change = { photo: { full: 'https://firebasestorage.googleapis.com/v0/b/x/o/a.jpg', messageId: 'm1' }, tags: '서준' };
const ok = () => ({ ok: true, status: 200, json: async () => ({ ok: true }) });

test('mediaCommand goes to Seoul first', async () => {
  const urls = [];
  const res = await saveBulkPhotoTagsRemote({ calendarId: 'cw', projectId: 'p', changes: [change], fetchImpl: async url => { urls.push(url); return ok(); } });
  assert.equal(res.ok, true);
  assert.deepEqual(urls, ['https://asia-northeast3-p.cloudfunctions.net/mediaCommand']);
});

test('falls back to us-central1 when Seoul is missing, down or unreachable', async () => {
  for (const seoul of [{ ok: false, status: 404, json: async () => ({}) }, { ok: false, status: 503, json: async () => ({}) }, 'throw']) {
    const urls = [];
    const res = await saveBulkPhotoTagsRemote({
      calendarId: 'cw', projectId: 'p', changes: [change],
      fetchImpl: async url => { urls.push(url); if (url.includes('asia-northeast3')) { if (seoul === 'throw') throw new TypeError('Failed to fetch'); return seoul; } return ok(); },
    });
    assert.equal(res.ok, true);
    assert.equal(urls.length, 2);
    assert.match(urls[1], /^https:\/\/us-central1-p\.cloudfunctions\.net\/mediaCommand$/);
  }
});

test('a rejected request (400) is not retried in the other region', async () => {
  const urls = [];
  await assert.rejects(saveBulkPhotoTagsRemote({
    calendarId: 'cw', projectId: 'p', changes: [change],
    fetchImpl: async url => { urls.push(url); return { ok: false, status: 400, json: async () => ({ ok: false, reason: 'invalid' }) }; },
  }));
  assert.equal(urls.length, 1);
});
