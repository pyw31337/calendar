'use strict';
// Runs against the Firestore + Storage emulators:
//   npm run test:functions:emulator   (from the repo root)
const test = require('node:test');
const assert = require('node:assert/strict');
const admin = require('firebase-admin');
const { deleteAsset, tagAsset, bulkTagAssets, sweepStorageGc, GC_GRACE_MS, getPhotoAssetKey } = require('../media-commands');

if (!process.env.FIRESTORE_EMULATOR_HOST) throw new Error('Run under `firebase emulators:exec` (FIRESTORE_EMULATOR_HOST unset).');
const app = admin.initializeApp({ projectId: process.env.GCLOUD_PROJECT || 'demo-moyeora', storageBucket: 'demo-moyeora.appspot.com' }, 'media-commands-test');
const db = app.firestore();
const bucket = app.storage().bucket();
const CAL = 'cal_testcal';
const root = db.collection('calendars').doc(CAL);
const url = (name, token = 't') => `https://firebasestorage.googleapis.com/v0/b/demo-moyeora.appspot.com/o/chatImages%2Ftestcal%2F${name}?alt=media&token=${token}`;
const photo = n => ({ imageUrl: url(`${n}_original.jpg`), thumbUrl: url(`${n}_thumb.jpg`) });

async function reset() {
  const collections = ['messages', 'confirmedMeetings', 'photoIndex', 'memos'];
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
  assert.deepEqual(gc.docs.map(d => d.data().path).sort(), ['chatImages/testcal/b_original.jpg', 'chatImages/testcal/b_thumb.jpg']);
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
  assert.deepEqual(result, { examined: 2, deleted: 1, kept: 1 });
  assert.equal((await bucket.file('chatImages/testcal/gone.jpg').exists())[0], false);
  assert.equal((await bucket.file('chatImages/testcal/kept.jpg').exists())[0], true);
  assert.equal((await db.collection('storageGc').get()).size, 1);
});
