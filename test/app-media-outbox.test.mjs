import test from 'node:test';
import assert from 'node:assert/strict';
import { replayQueuedMediaMessage, replayQueuedMemoSave } from '../src/core/app-media-outbox.js';

test('a queued chat photo keeps its fingerprint, so the replay can reuse a stored original', async () => {
  let seen = null;
  const written = [];
  const ok = await replayQueuedMediaMessage({
    id: 'op', calendarId: 'c',
    payload: { participantId: 'p', text: 'hi', timestamp: 1, images: [{ originalBlob: 'o', thumbnailBlob: 't', fingerprint: 'sha256:aa' }] },
  }, {
    resolveImages: async (_cal, items) => { seen = items; return items.map(item => ({ imageUrl: 'https://x/1', thumbUrl: 'https://x/1t', fingerprint: item.fingerprint })); },
    chunkImages: list => [list],
    writeMessage: async (_cal, data) => { written.push(data); return { success: true }; },
  });
  assert.equal(ok, true);
  assert.equal(seen[0].fingerprint, 'sha256:aa');
  assert.deepEqual(written[0].imageFingerprints, ['sha256:aa']);
});

test('a queued memo edit keeps urls, thumbs and fingerprints aligned per photo', async () => {
  let saved = null;
  await replayQueuedMemoSave({
    calendarId: 'c',
    payload: {
      memoId: 'm', memoData: { title: 't' },
      images: [
        { isExisting: true, original: 'https://x/old', thumbnail: 'https://x/oldt', fingerprint: 'sha256:old' },
        { originalBlob: 'o', thumbnailBlob: 't', fingerprint: 'sha256:new' },
      ],
    },
  }, {
    resolveImages: async (_cal, items) => items.map(item => ({ imageUrl: 'https://x/new', thumbUrl: 'https://x/newt', fingerprint: item.fingerprint })),
    writeMemo: async (_cal, _id, data) => { saved = data; return { success: true }; },
  });
  assert.deepEqual(saved.imageUrls, ['https://x/old', 'https://x/new']);
  assert.deepEqual(saved.thumbUrls, ['https://x/oldt', 'https://x/newt']);
  assert.deepEqual(saved.imageFingerprints, ['sha256:old', 'sha256:new']);
});

test('a queued chat photo is not written when Storage did not keep an https file', async () => {
  let options = null;
  let wrote = false;
  const ok = await replayQueuedMediaMessage({
    id: 'op', calendarId: 'c',
    payload: { participantId: 'p', text: '', timestamp: 1, uploadSource: 'chat', images: [{ originalBlob: 'o', thumbnailBlob: 't' }] },
  }, {
    resolveImages: async (_cal, _items, _progress, opts) => {
      options = opts;
      return [{ imageUrl: 'data:image/png;base64,AAAA', thumbUrl: 'data:image/png;base64,AAAA' }];
    },
    chunkImages: list => [list],
    writeMessage: async () => { wrote = true; return { success: true }; },
  });
  assert.equal(ok, false);
  assert.equal(wrote, false);
  assert.equal(options.requireStorage, true);
});
