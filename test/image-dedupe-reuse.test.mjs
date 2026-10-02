import test from 'node:test';
import assert from 'node:assert/strict';

// Same facade as photo-upload-selection.test.mjs: the pipeline reads a window global on load.
globalThis.window = globalThis.window || {};
const {
  rememberKnownImageFingerprints, rememberKnownImageOriginals,
  selectNonDuplicateCompressedImages, resolveChatImageBatch
} = await import('../src/core/app-image-pipeline.js');
const { removeAssetFromMeetings, replaceAssetInMeetings } = await import('../src/core/media-reference-integrity.js');

const url = (name, token = 't') =>
  `https://firebasestorage.googleapis.com/v0/b/x/o/chatImages%2Fcal%2F${name}?alt=media&token=${token}`;
const fp = n => `sha256:${String(n).padStart(64, '0')}`;

function withFetch(handler, run) {
  const previous = globalThis.fetch;
  globalThis.fetch = handler;
  return Promise.resolve().then(run).finally(() => { globalThis.fetch = previous; });
}

test('a photo already stored in the calendar points at its original instead of uploading', async () => {
  const cal = 'dedupe-reuse';
  rememberKnownImageFingerprints(cal, [fp(1)]);
  rememberKnownImageOriginals(cal, [{ imageUrls: [url('a_original.jpg')], thumbUrls: [url('a_thumb.jpg')], imageFingerprints: [fp(1)] }]);
  const calls = [];
  await withFetch(async (input, init = {}) => {
    calls.push([String(input), init.method || 'GET']);
    if (String(input).includes(':runQuery')) return new Response('[]', { status: 200 });
    return new Response(null, { status: 200 });
  }, async () => {
    const results = await resolveChatImageBatch(cal, [{ fingerprint: fp(1), original: 'blob:x', thumbnail: 'blob:x' }], null);
    assert.equal(results.length, 1);
    assert.equal(results[0].imageUrl, url('a_original.jpg'));
    assert.equal(results[0].thumbUrl, url('a_thumb.jpg'));
    assert.equal(results[0].fingerprint, fp(1));
    assert.equal(results[0].reused, true);
    assert.deepEqual(results.reusedIndexes, [0]);
  });
  assert.ok(calls.some(([u, m]) => u === url('a_original.jpg') && m === 'HEAD'), 'the original is checked before it is reused');
});

test('a photo stored before stays in the selection (it is linked or uploaded, never dropped)', () => {
  const cal = 'dedupe-kept';
  rememberKnownImageFingerprints(cal, [fp(2)]);
  rememberKnownImageOriginals(cal, [{ imageUrls: [url('b_original.jpg')], thumbUrls: [url('b_thumb.jpg')], imageFingerprints: [fp(2)] }]);
  const selection = selectNonDuplicateCompressedImages(cal, [{ fingerprint: fp(2) }]);
  assert.equal(selection.accepted.length, 1, 'a photo stored before is kept, never silently dropped');
  assert.equal(selection.accepted[0].alreadyStored, true);
});

test('a misaligned legacy record never maps a fingerprint onto a neighbour file', async () => {
  const cal = 'dedupe-misaligned';
  // imageFingerprints still has the deleted first photo's entry: fp(3) belongs to no URL here.
  rememberKnownImageOriginals(cal, [{ imageUrls: [url('c_original.jpg')], thumbUrls: [url('c_thumb.jpg')], imageFingerprints: [fp(3), fp(4)] }]);
  rememberKnownImageFingerprints(cal, [fp(3), fp(4)]);
  let headCalls = 0;
  await withFetch(async (input, init = {}) => {
    if (init.method === 'HEAD') headCalls += 1;
    return new Response('[]', { status: 200 });
  }, async () => {
    const results = await resolveChatImageBatch(cal, [{ fingerprint: fp(3), isExisting: true, original: url('x.jpg'), thumbnail: url('x.jpg') }], null);
    assert.equal(results.reusedIndexes.length, 0);
  });
  assert.equal(headCalls, 0);
});

test('the same photo twice in one selection is one photo', () => {
  const selection = selectNonDuplicateCompressedImages('dedupe-batch', [{ fingerprint: fp(9) }, { fingerprint: fp(9) }, { fingerprint: fp(8) }]);
  assert.deepEqual(selection.accepted.map(entry => entry.index), [0, 2]);
  assert.deepEqual(selection.duplicateIndexes, [1]);
});

const photo = (n, extra = {}) => ({ imageUrl: url(`${n}_original.jpg`), thumbUrl: url(`${n}_thumb.jpg`), ...extra });

test('deleting a shared photo from one message keeps the album entry another message still holds', () => {
  const meetings = [{ date: 'd', photos: [
    { id: 'mine', ...photo('s'), sourceMessageId: 'm1', sourceImageIndex: 0 },
    { id: 'theirs', ...photo('s'), sourceMessageId: 'm2', sourceImageIndex: 0 },
    { id: 'stale', ...photo('s'), sourceMessageId: 'm3', sourceImageIndex: 0 }
  ] }];
  const { meetings: next } = removeAssetFromMeetings(meetings, photo('s'), {
    messageId: 'm1', deletedIndex: 0, isHeldByOtherMessage: p => p.sourceMessageId === 'm2'
  });
  assert.deepEqual(next[0].photos.map(p => p.id), ['theirs']);
});

test('replacing a shared photo in one message leaves the other message album entry on the original', () => {
  const meetings = [{ date: 'd', photos: [
    { id: 'mine', ...photo('s'), sourceMessageId: 'm1' },
    { id: 'theirs', ...photo('s'), sourceMessageId: 'm2' }
  ] }];
  const { meetings: next } = replaceAssetInMeetings(meetings, photo('s'), photo('new'), {
    messageId: 'm1', isHeldByOtherMessage: p => p.sourceMessageId === 'm2'
  });
  assert.equal(next[0].photos[0].imageUrl, photo('new').imageUrl);
  assert.equal(next[0].photos[1].imageUrl, photo('s').imageUrl);
});
