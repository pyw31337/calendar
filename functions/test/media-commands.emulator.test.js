'use strict';
// Runs against the Firestore + Storage emulators:
//   npm run test:functions:emulator   (from the repo root)
const test = require('node:test');
const assert = require('node:assert/strict');
const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { getStorage } = require('firebase-admin/storage');
const { deleteAsset, tagAsset, bulkTagAssets, mergeAssets, sweepStorageGc, GC_GRACE_MS, getPhotoAssetKey, isOriginalStoragePath } = require('../media-commands');

if (!process.env.FIRESTORE_EMULATOR_HOST) throw new Error('Run under `firebase emulators:exec` (FIRESTORE_EMULATOR_HOST unset).');
const app = initializeApp({ projectId: process.env.GCLOUD_PROJECT || 'demo-moyeora', storageBucket: 'demo-moyeora.appspot.com' }, 'media-commands-test');
const db = getFirestore(app);
const bucket = getStorage(app).bucket();
const CAL = 'cal_testcal';
const root = db.collection('calendars').doc(CAL);
const url = (name, token = 't') => `https://firebasestorage.googleapis.com/v0/b/demo-moyeora.appspot.com/o/chatImages%2Ftestcal%2F${name}?alt=media&token=${token}`;
const photo = n => ({ imageUrl: url(`${n}_original.jpg`), thumbUrl: url(`${n}_thumb.jpg`) });

async function reset() {
  const collections = ['messages', 'confirmedMeetings', 'photoIndex', 'memos', 'photoCommentItems', 'push_delivery_claims'];
  for (const name of collections) {
    const snap = await root.collection(name).get();
    await Promise.all(snap.docs.map(doc => doc.ref.delete()));
  }
  const gc = await db.collection('storageGc').get();
  await Promise.all(gc.docs.map(doc => doc.ref.delete()));
}

async function seed() {
  const [a, b, c] = ['a', 'b', 'c'].map(photo);
  await root.collection('messages').doc('m1').set({
    text: '일정 사진', participantId: 'p', timestamp: 1,
    imageUrls: [a.imageUrl, b.imageUrl, c.imageUrl], thumbUrls: [a.thumbUrl, b.thumbUrl, c.thumbUrl],
    imageTags: ['ta', 'tb', 'tc'], imageTagMap: { [getPhotoAssetKey(b.imageUrl)]: 'tb' },
  });
  await root.collection('confirmedMeetings').doc('2026-09-19').set({ date: '2026-09-19', photos: [
    { id: 'p0', ...a, sourceMessageId: 'm1', sourceImageIndex: 0, tags: 'ta' },
    { id: 'p1', ...b, sourceMessageId: 'm1', sourceImageIndex: 1, tags: 'old' },
    // Misaligned positional ref: says slot 1 but holds file c.
    { id: 'p2', ...c, sourceMessageId: 'm1', sourceImageIndex: 1, tags: 'tc' },
  ] });
  // Copy of b in a second meeting, no message link -- used to survive deletes as a 404 tile.
  await root.collection('confirmedMeetings').doc('2026-09-20').set({ date: '2026-09-20', photos: [{ id: 'q', ...b, tags: '' }] });
  await root.collection('photoIndex').doc(getPhotoAssetKey(b.imageUrl)).set({
    full: b.imageUrl, thumb: b.thumbUrl, owners: [{ sourceOwner: 'message:m1:1' }, { sourceOwner: 'meeting:2026-09-19:1' }],
  });
  return { a, b, c };
}

test('tagAsset writes the tag to the owning slot and every album copy in one transaction', async () => {
  await reset();
  const { b } = await seed();
  const result = await tagAsset({ db, calendarDocId: CAL, asset: { imageUrl: url('b_original.jpg', 'rotated') }, tags: '260919 서준 도은' });
  assert.equal(result.ok, true);
  assert.equal(result.slotsTagged, 1);
  assert.equal(result.albumCopiesTagged, 2);
  assert.equal(result.meetingReadScope, 'full-scan', 'legacy owner previews must retain the correctness-first fallback');
  const m1 = (await root.collection('messages').doc('m1').get()).data();
  assert.deepEqual(m1.imageTags, ['ta', '260919 서준 도은', 'tc']);
  assert.equal(m1.imageTagMap[getPhotoAssetKey(b.imageUrl)], '260919 서준 도은');
  const d19 = (await root.collection('confirmedMeetings').doc('2026-09-19').get()).data().photos;
  const d20 = (await root.collection('confirmedMeetings').doc('2026-09-20').get()).data().photos;
  assert.equal(d19.find(p => p.id === 'p1').tags, '260919 서준 도은');
  assert.equal(d19.find(p => p.id === 'p0').tags, 'ta');
  assert.equal(d20[0].tags, '260919 서준 도은');
});

test('tagAsset scopes complete owner projections to only the owning meetings', async () => {
  await reset();
  const { b } = await seed();
  const indexRef = root.collection('photoIndex').doc(getPhotoAssetKey(b.imageUrl));
  await indexRef.set({
    owners: [
      { sourceOwner: 'message:m1:1' },
      { sourceOwner: 'meeting:2026-09-19:1' },
      { sourceOwner: 'meeting:2026-09-20:0' },
    ],
    ownerCount: 3,
    ownerListComplete: true,
  }, { merge: true });
  const unrelated = photo('unrelated');
  await root.collection('confirmedMeetings').doc('unrelated').set({
    date: '2026-09-21',
    photos: [{ id: 'u', ...unrelated, tags: 'leave-me' }],
  });

  const result = await tagAsset({ db, calendarDocId: CAL, asset: b, tags: '완전한 소유 관계' });
  assert.equal(result.ok, true);
  assert.equal(result.meetingReadScope, 'owners');
  assert.equal(result.meetingDocumentsRead, 2);
  assert.equal(result.albumCopiesTagged, 2);
  const untouched = (await root.collection('confirmedMeetings').doc('unrelated').get()).data().photos;
  assert.equal(untouched[0].tags, 'leave-me');
});

test('bulkTagAssets updates multiple assets in one source and every meeting copy', async () => {
  await reset();
  const { a, b, c } = await seed();
  const result = await bulkTagAssets({
    db,
    calendarDocId: CAL,
    items: [
      { ...a, messageId: 'm1', tags: '260919 서준' },
      { ...b, messageId: 'm1', tags: '260919 도은' },
      { ...c, messageId: 'm1', tags: '파주 하니랜드' },
    ],
    now: 9,
  });
  assert.equal(result.ok, true);
  assert.equal(result.itemCount, 3);
  assert.equal(result.sourceDocumentsTouched, 1);
  assert.equal(result.slotsTagged, 3);
  // a, b, c are in 9/19 and b is also referenced by the 9/20 meeting copy.
  assert.equal(result.albumCopiesTagged, 4);
  const m1 = (await root.collection('messages').doc('m1').get()).data();
  assert.deepEqual(m1.imageTags, ['260919 서준', '260919 도은', '파주 하니랜드']);
  assert.equal(m1.imageTagMap[getPhotoAssetKey(a.imageUrl)], '260919 서준');
  assert.equal(m1.imageTagMap[getPhotoAssetKey(c.imageUrl)], '파주 하니랜드');
  const d19 = (await root.collection('confirmedMeetings').doc('2026-09-19').get()).data().photos;
  assert.equal(d19.find(p => p.id === 'p0').tags, '260919 서준');
  assert.equal(d19.find(p => p.id === 'p1').tags, '260919 도은');
  assert.equal(d19.find(p => p.id === 'p2').tags, '파주 하니랜드');
  const d20 = (await root.collection('confirmedMeetings').doc('2026-09-20').get()).data().photos;
  assert.equal(d20[0].tags, '260919 도은');
});

test('deleteAsset removes every copy, re-links positional refs by file, and queues files for GC', async () => {
  await reset();
  const { a, b, c } = await seed();
  const now = 1_000_000;
  const result = await deleteAsset({ db, calendarDocId: CAL, asset: b, now });
  assert.equal(result.ok, true);
  assert.equal(result.slotsRemoved, 1);
  assert.equal(result.albumCopiesRemoved, 2);
  const m1 = (await root.collection('messages').doc('m1').get()).data();
  assert.deepEqual(m1.imageUrls, [a.imageUrl, c.imageUrl]);
  assert.deepEqual(m1.thumbUrls, [a.thumbUrl, c.thumbUrl]);
  assert.deepEqual(m1.imageTags, ['ta', 'tc']);
  assert.deepEqual(m1.imageTagMap, {});
  const d19 = (await root.collection('confirmedMeetings').doc('2026-09-19').get()).data().photos;
  assert.deepEqual(d19.map(p => [p.id, p.sourceImageIndex]), [['p0', 0], ['p2', 1]]);
  const d20 = (await root.collection('confirmedMeetings').doc('2026-09-20').get()).data().photos;
  assert.deepEqual(d20, []);
  const gc = await db.collection('storageGc').get();
  assert.deepEqual(gc.docs.map(d => d.data().path).sort(), ['chatImages/testcal/b_thumb.jpg']);
  assert.ok(gc.docs.every(d => d.data().deleteAfter === now + GC_GRACE_MS));
});

test('a placeholder message whose only photo is deleted is removed entirely', async () => {
  await reset();
  const lone = photo('lone');
  await root.collection('messages').doc('m2').set({ text: '갤러리 사진', participantId: 'p', timestamp: 2, imageUrls: [lone.imageUrl], thumbUrls: [lone.thumbUrl], imageTags: [''] });
  await root.collection('confirmedMeetings').doc('2026-09-21').set({ date: '2026-09-21', photos: [{ id: 'r', ...lone, sourceMessageId: 'm2', sourceImageIndex: 0 }] });
  const result = await deleteAsset({ db, calendarDocId: CAL, asset: { ...lone, messageId: 'm2' } });
  assert.equal(result.ok, true);
  assert.equal((await root.collection('messages').doc('m2').get()).exists, false);
  assert.deepEqual((await root.collection('confirmedMeetings').doc('2026-09-21').get()).data().photos, []);
});

test('GC sweep deletes only unreferenced files after the grace period', async () => {
  await reset();
  await bucket.file('chatImages/testcal/gone.jpg').save(Buffer.from('x'));
  await bucket.file('chatImages/testcal/kept.jpg').save(Buffer.from('y'));
  const queue = (path, deleteAfter) => db.collection('storageGc').doc(Buffer.from(path).toString('base64url')).set({ path, calendarDocId: CAL, deleteAfter });
  await queue('chatImages/testcal/gone.jpg', 10);
  await queue('chatImages/testcal/kept.jpg', 10);
  await queue('chatImages/testcal/later.jpg', 10_000);
  // kept.jpg was re-uploaded / still indexed somewhere -> must survive.
  await root.collection('photoIndex').doc('asset:v1:kept').set({ full: url('kept.jpg'), thumb: url('kept.jpg') });
  const result = await sweepStorageGc({ db, bucket, now: 100 });
  assert.deepEqual(result, { examined: 2, deleted: 1, kept: 1, skippedOriginal: 0 });
  assert.equal((await bucket.file('chatImages/testcal/gone.jpg').exists())[0], false);
  assert.equal((await bucket.file('chatImages/testcal/kept.jpg').exists())[0], true);
  assert.equal((await db.collection('storageGc').get()).size, 1);
});

test('GC sweep keeps a file another calendar still shows (photos copied across calendars)', async () => {
  await reset();
  await bucket.file('memoImages/testcal/shared.jpg').save(Buffer.from('z'));
  await db.collection('storageGc').doc('shared').set({ path: 'memoImages/testcal/shared.jpg', calendarDocId: CAL, deleteAfter: 10 });
  const other = db.collection('calendars').doc('cal_othercal');
  const sharedUrl = 'https://firebasestorage.googleapis.com/v0/b/demo-moyeora.appspot.com/o/memoImages%2Ftestcal%2Fshared.jpg?alt=media';
  await other.collection('photoIndex').doc('asset:v1:shared').set({ full: sharedUrl, thumb: sharedUrl });
  const result = await sweepStorageGc({ db, bucket, now: 100 });
  assert.deepEqual(result, { examined: 1, deleted: 0, kept: 1, skippedOriginal: 0 });
  assert.equal((await bucket.file('memoImages/testcal/shared.jpg').exists())[0], true);
  await other.collection('photoIndex').doc('asset:v1:shared').delete();
});

test('GC sweep keeps a file an anniversary photo or a culture poster still points at', async () => {
  await reset();
  const file = name => `https://firebasestorage.googleapis.com/v0/b/demo-moyeora.appspot.com/o/chatImages%2Ftestcal%2F${name}?alt=media`;
  for (const name of ['ann.jpg', 'poster.jpg', 'loose.jpg']) {
    await bucket.file(`chatImages/testcal/${name}`).save(Buffer.from(name));
    await db.collection('storageGc').doc(name).set({ path: `chatImages/testcal/${name}`, calendarDocId: CAL, deleteAfter: 10 });
  }
  await root.collection('anniversaries').doc('a1').set({ title: 'x', photos: [{ url: file('ann.jpg'), thumbUrl: file('ann.jpg') }] });
  await root.collection('customCultureItems').doc('c1').set({ title: 'y', image: file('poster.jpg'), imageUrl: file('poster.jpg') });
  const result = await sweepStorageGc({ db, bucket, now: 100 });
  assert.deepEqual(result, { examined: 3, deleted: 1, kept: 2, skippedOriginal: 0 });
  assert.equal((await bucket.file('chatImages/testcal/ann.jpg').exists())[0], true);
  assert.equal((await bucket.file('chatImages/testcal/poster.jpg').exists())[0], true);
  assert.equal((await bucket.file('chatImages/testcal/loose.jpg').exists())[0], false);
  await root.collection('anniversaries').doc('a1').delete();
  await root.collection('customCultureItems').doc('c1').delete();
});

test('mergeAssets points identical copies at the kept file, moves comments, and deletes nothing', async () => {
  await reset();
  const keep = photo('k');
  const dup = photo('d');
  const other = photo('o');
  await bucket.file('chatImages/testcal/k_original.jpg').save(Buffer.from('same-bytes'));
  await bucket.file('chatImages/testcal/d_original.jpg').save(Buffer.from('same-bytes'));
  await bucket.file('chatImages/testcal/o_original.jpg').save(Buffer.from('other-bytes'));
  const keyOf = p => getPhotoAssetKey(p.imageUrl);
  await root.collection('messages').doc('mk').set({ text: '', imageUrls: [keep.imageUrl], thumbUrls: [keep.thumbUrl], imageTags: ['서준'] });
  await root.collection('memos').doc('md').set({ text: '메모', imageUrls: [other.imageUrl, dup.imageUrl], thumbUrls: [other.thumbUrl, dup.thumbUrl], imageTags: ['', '고성'], imageTagMap: { [keyOf(dup)]: '고성' } });
  await root.collection('confirmedMeetings').doc('2026-09-19').set({ photos: [{ id: 'x', ...dup, tags: '고성' }] });
  await root.collection('photoIndex').doc(keyOf(keep)).set({ full: keep.imageUrl, thumb: keep.thumbUrl, owners: [{ sourceOwner: 'message:mk:0' }] });
  await root.collection('photoIndex').doc(keyOf(dup)).set({ full: dup.imageUrl, thumb: dup.thumbUrl, owners: [{ sourceOwner: 'memo:md:1' }, { sourceOwner: 'meeting:2026-09-19:0' }] });
  await root.collection('photoIndex').doc(keyOf(other)).set({ full: other.imageUrl, thumb: other.thumbUrl, owners: [{ sourceOwner: 'memo:md:0' }] });
  await root.collection('photoCommentItems').doc('c1').set({ assetKey: keyOf(dup), text: '좋다' });

  const result = await mergeAssets({
    db, bucket, calendarDocId: CAL, keep, extras: [dup, other], tags: '서준 고성', now: 5,
    claimMemoPush: (_before, _after, memoId) => `memo-${memoId}`,
  });
  assert.equal(result.ok, true);
  assert.deepEqual(result.merged, [keyOf(dup)]);
  assert.deepEqual(result.notIdentical, [keyOf(other)], 'a different file is never merged');
  assert.equal(result.slotsRepointed, 1);
  assert.equal(result.albumEntriesMoved, 1);
  assert.equal(result.commentsMoved, 1);
  const memo = (await root.collection('memos').doc('md').get()).data();
  assert.deepEqual(memo.imageUrls, [other.imageUrl, keep.imageUrl], 'slot kept in place, nothing removed');
  assert.deepEqual(memo.imageTags, ['', '서준 고성']);
  assert.equal(memo.imageTagMap[keyOf(keep)], '서준 고성');
  assert.equal(memo.imageTagMap[keyOf(dup)], undefined);
  assert.equal((await root.collection('push_delivery_claims').doc('memo-md').get()).exists, true);
  const album = (await root.collection('confirmedMeetings').doc('2026-09-19').get()).data().photos;
  assert.equal(album[0].imageUrl, keep.imageUrl);
  assert.equal(album[0].id, 'x');
  assert.equal((await root.collection('photoCommentItems').doc('c1').get()).data().assetKey, keyOf(keep));
  assert.deepEqual((await root.collection('messages').doc('mk').get()).data().imageTags, ['서준 고성']);
  assert.equal((await bucket.file('chatImages/testcal/d_original.jpg').exists())[0], true, 'the file is kept');
  assert.equal((await db.collection('storageGc').get()).size, 0);
});


test('GC sweep never deletes an original even if queued', async () => {
  await reset();
  const original = 'chatImages/testcal/shot_original_12b.jpg';
  const thumb = 'chatImages/testcal/shot_thumb_3b.jpg';
  await bucket.file(original).save(Buffer.from('orig'));
  await bucket.file(thumb).save(Buffer.from('thumb'));
  const queue = (path, deleteAfter) => db.collection('storageGc').doc(Buffer.from(path).toString('base64url')).set({ path, calendarDocId: CAL, deleteAfter });
  await queue(original, 10);
  await queue(thumb, 10);
  assert.equal(isOriginalStoragePath(original), true);
  const result = await sweepStorageGc({ db, bucket, now: 100 });
  assert.equal(result.skippedOriginal, 1);
  assert.equal(result.deleted, 1);
  assert.equal((await bucket.file(original).exists())[0], true);
  assert.equal((await bucket.file(thumb).exists())[0], false);
});

test('GC sweep keeps a chat file still referenced by a message fileAttachment', async () => {
  await reset();
  const path = 'chatFiles/testcal/shared.pdf';
  await bucket.file(path).save(Buffer.from('%PDF'));
  await db.collection('storageGc').doc('cf').set({ path, calendarDocId: CAL, deleteAfter: 10 });
  await root.collection('messages').doc('m1').set({
    text: 'file',
    fileAttachments: [{ id: 'f1', name: 'shared.pdf', url: 'https://x', storagePath: path, uploadedAt: 1 }],
  });
  const result = await sweepStorageGc({ db, bucket, now: 100 });
  assert.equal(result.kept, 1);
  assert.equal(result.deleted, 0);
  assert.equal((await bucket.file(path).exists())[0], true);
  await root.collection('messages').doc('m1').delete();
});
