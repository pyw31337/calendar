import test from 'node:test';
import assert from 'node:assert/strict';

const {
  sharesAsset, findImageSlotByAsset, removeAssetFromMeetings, replaceAssetInMeetings,
  syncAssetTagsInMeetings, listOtherAssetReferences,
} = await import('../src/core/media-reference-integrity.js');

const url = (name, token = 't1') =>
  `https://firebasestorage.googleapis.com/v0/b/x/o/chatImages%2Fcal%2F${name}?alt=media&token=${token}`;
const photo = (n, extra = {}) => ({ imageUrl: url(`${n}_original.jpg`), thumbUrl: url(`${n}_thumb.jpg`), ...extra });

test('same Storage object matches even when the download token differs', () => {
  assert.equal(sharesAsset(photo('a'), { full: url('a_original.jpg', 'other') }), true);
  assert.equal(sharesAsset(photo('a'), photo('b')), false);
  assert.equal(sharesAsset({}, photo('a')), false);
});

test('a stale index never selects the neighbouring photo', () => {
  // Another device deleted slot 0, so the caller's index 1 now points at "c".
  const current = { imageUrls: [photo('b').imageUrl, photo('c').imageUrl], thumbUrls: [photo('b').thumbUrl, photo('c').thumbUrl] };
  assert.equal(findImageSlotByAsset(current, photo('b'), 1), 0);
  assert.equal(findImageSlotByAsset(current, photo('c'), 1), 1);
  assert.equal(findImageSlotByAsset(current, photo('gone'), 0), -1);
});

test('delete removes album copies made by other paths and renumbers same-message refs', () => {
  const meetings = [
    { date: '2026-09-19', photos: [
      { id: 'p1', ...photo('a'), sourceMessageId: 'm1', sourceImageIndex: 0 },
      { id: 'p2', ...photo('b'), sourceMessageId: 'm1', sourceImageIndex: 1 },
      { id: 'p3', ...photo('c'), sourceMessageId: 'm1', sourceImageIndex: 2 },
    ] },
    // A copy of the same file in another meeting with no sourceMessageId -- this is what used to
    // survive a delete and turn into a 404 thumbnail.
    { date: '2026-09-20', photos: [{ id: 'q1', ...photo('b') }, { id: 'q2', ...photo('z') }] },
  ];
  const { meetings: next, changed } = removeAssetFromMeetings(meetings, photo('b'), { messageId: 'm1', deletedIndex: 1 });
  assert.equal(changed, true);
  assert.deepEqual(next[0].photos.map(p => [p.id, p.sourceImageIndex]), [['p1', 0], ['p3', 1]]);
  assert.deepEqual(next[1].photos.map(p => p.id), ['q2']);
});

test('whole-message delete drops every reference to that message', () => {
  const meetings = [{ date: 'd', photos: [{ id: 'x', ...photo('a'), sourceMessageId: 'm1', sourceImageIndex: 0 }, { id: 'y', ...photo('k') }] }];
  const { meetings: next } = removeAssetFromMeetings(meetings, photo('a'), { messageId: 'm1', dropAllFromMessage: true });
  assert.deepEqual(next[0].photos.map(p => p.id), ['y']);
});

test('replace moves every copy to the new file and keeps tags and ids', () => {
  const meetings = [{ date: 'd', photos: [{ id: 'p', ...photo('a'), tags: '260919 서준' }, { id: 'o', ...photo('o') }] }];
  const replacement = photo('a2');
  const { meetings: next, changed } = replaceAssetInMeetings(meetings, photo('a'), replacement);
  assert.equal(changed, true);
  assert.equal(next[0].photos[0].id, 'p');
  assert.equal(next[0].photos[0].tags, '260919 서준');
  assert.equal(next[0].photos[0].imageUrl, replacement.imageUrl);
  assert.equal(next[0].photos[0].thumbUrl, replacement.thumbUrl);
  assert.equal(next[0].photos[1], meetings[0].photos[1]);
});

test('tag edits are written through to every album copy', () => {
  const meetings = [
    { date: '2026-08-08', photos: [{ id: 'p', ...photo('a'), tags: '260808 서준' }] },
    { date: '2026-08-09', photos: [{ id: 'q', ...photo('a'), tags: '' }, { id: 'r', ...photo('b'), tags: 'keep' }] },
  ];
  const { meetings: next, changed } = syncAssetTagsInMeetings(meetings, photo('a'), '260808 도연 도은 서준 흔들카');
  assert.equal(changed, true);
  assert.equal(next[0].photos[0].tags, '260808 도연 도은 서준 흔들카');
  assert.equal(next[1].photos[0].tags, '260808 도연 도은 서준 흔들카');
  assert.equal(next[1].photos[1].tags, 'keep');
  assert.equal(syncAssetTagsInMeetings(next, photo('a'), '260808 도연 도은 서준 흔들카').changed, false);
});

test('Storage deletion is blocked while any other document still references the file', () => {
  const asset = photo('a');
  const base = { excludeMessageId: 'm1', excludeMeetingDates: ['2026-09-19'] };
  assert.deepEqual(listOtherAssetReferences(asset, { ...base }), []);
  assert.deepEqual(listOtherAssetReferences(asset, { ...base, messages: [{ id: 'm1', imageUrls: [asset.imageUrl] }] }), []);
  assert.deepEqual(listOtherAssetReferences(asset, { ...base, messages: [{ id: 'm2', imageUrl: asset.imageUrl }] }), ['message:m2']);
  assert.deepEqual(listOtherAssetReferences(asset, { ...base, meetings: [{ date: '2026-09-20', photos: [asset] }] }), ['meeting:2026-09-20']);
  assert.deepEqual(listOtherAssetReferences(asset, { ...base, meetings: [{ date: '2026-09-20', photos: [{ ...asset, deletedAt: 1 }] }] }), []);
  assert.deepEqual(listOtherAssetReferences(asset, { ...base, indexOwners: ['message:m1:3', 'meeting:2026-09-19:4', 'memo:n1:0'] }), ['memo:n1']);
});

test('overlapping memories: a photo appears only in the most specific one', async () => {
  globalThis.window = globalThis.window || {};
  const { assignPhotosToSingleMemory } = await import('../src/core/gallery-data.js');
  const fireworksPhoto = { imageUrl: url('fw_original.jpg'), thumbUrl: url('fw_thumb.jpg'), tags: '260905' };
  const beachPhoto = { imageUrl: url('beach_original.jpg'), thumbUrl: url('beach_thumb.jpg'), tags: '260904' };
  const groups = [
    { id: 'trip', startDate: '2026-09-04', endDate: '2026-09-06', photos: [fireworksPhoto, beachPhoto] },
    { id: 'fireworks', startDate: '2026-09-05', endDate: '2026-09-05', photos: [fireworksPhoto] },
  ];
  const [trip, fireworks] = assignPhotosToSingleMemory(groups);
  assert.deepEqual(trip.photos, [beachPhoto]);
  assert.deepEqual(fireworks.photos, [fireworksPhoto]);
  // Removed from the festival by the user -> falls through to the trip instead of vanishing.
  const [trip2] = assignPhotosToSingleMemory([groups[0], { ...groups[1], photos: [] }]);
  assert.equal(trip2.photos.length, 2);
});
