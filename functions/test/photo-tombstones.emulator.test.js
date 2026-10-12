'use strict';
// A photo deleted from every record leaves a photoTombstones note (functions/photo-tombstones.js)
// written by the real photoIndex triggers; the GC sweep keeps the files it names; browsers can
// read the note (firestore.rules) and never write it.
//   npm run test:functions:emulator   (from the repo root)
const test = require('node:test');
const assert = require('node:assert/strict');

if (!process.env.FIRESTORE_EMULATOR_HOST) throw new Error('Run under `firebase emulators:exec` (FIRESTORE_EMULATOR_HOST unset).');

const fns = require('../index.js');
const media = require('../media-commands');
const { getFirestore } = require('firebase-admin/firestore');
const { getStorage } = require('firebase-admin/storage');

const PROJECT = process.env.GCLOUD_PROJECT || 'demo-moyeora';
const BUCKET = `${PROJECT}.appspot.com`;
const CAL_ID = 'tombstones';
const CAL = `cal_${CAL_ID}`;
const db = getFirestore();
const bucket = getStorage().bucket(BUCKET);
const root = db.collection('calendars').doc(CAL);
const hex = n => String(n).repeat(64).slice(0, 64);
const fp = n => `sha256:${hex(n)}`;
const path = (name, kind) => `chatImages/${CAL_ID}/${name}_${kind}_10b.jpg`;
const url = (name, kind) => `https://firebasestorage.googleapis.com/v0/b/${BUCKET}/o/${encodeURIComponent(path(name, kind))}?alt=media&token=t`;
const photo = name => ({ imageUrl: url(name, 'original'), thumbUrl: url(name, 'thumb') });
const rest = `http://${process.env.FIRESTORE_EMULATOR_HOST}/v1/projects/${PROJECT}/databases/(default)/documents`;

async function reset() {
  for (const name of ['messages', 'memos', 'confirmedMeetings', 'photoIndex', 'photoIndexMeta', 'photoTombstones', 'assets', 'assetEdges']) {
    const snap = await root.collection(name).get();
    await Promise.all(snap.docs.map(doc => doc.ref.delete()));
  }
  const gc = await db.collection('storageGc').where('calendarDocId', '==', CAL).get();
  await Promise.all(gc.docs.map(doc => doc.ref.delete()));
}

// Run the real trigger for a write the test just made, the way Firestore would deliver it.
async function write(collection, id, data, triggers) {
  const ref = root.collection(collection).doc(id);
  const before = await ref.get();
  if (data === null) await ref.delete(); else await ref.set(data);
  const after = await ref.get();
  const change = { before: { exists: before.exists, data: () => before.data(), ref }, after: { exists: after.exists, data: () => after.data(), ref } };
  const param = { messages: 'messageId', memos: 'memoId', confirmedMeetings: 'dateId' }[collection];
  for (const fn of triggers) await fn.run(change, { params: { calendarDocId: CAL, [param]: id } });
}
const MESSAGE_TRIGGERS = [fns.onMessagePhotoIndexWrite];
const MEETING_TRIGGERS = [fns.onMeetingPhotoIndexWrite];

async function deliver(collection, id, before, triggers) {
  const ref = root.collection(collection).doc(id);
  const after = await ref.get();
  const change = { before: { exists: Boolean(before), data: () => before, ref }, after: { exists: after.exists, data: () => after.data(), ref } };
  const param = { messages: 'messageId', memos: 'memoId', confirmedMeetings: 'dateId' }[collection];
  for (const fn of triggers) await fn.run(change, { params: { calendarDocId: CAL, [param]: id } });
}

test('a photo deleted everywhere leaves a note naming its stored file, even when an album copy goes last', async () => {
  await reset();
  const [a, b] = [photo('a'), photo('b')];
  await write('messages', 'm1', {
    text: '사진', participantId: 'p', timestamp: 1, uploadSource: 'gallery',
    imageUrls: [a.imageUrl, b.imageUrl], thumbUrls: [a.thumbUrl, b.thumbUrl], imageTags: ['', ''],
    imageFingerprints: [fp(1), fp(2)],
  }, MESSAGE_TRIGGERS);
  await write('confirmedMeetings', '2026-10-01', { date: '2026-10-01', photos: [{ id: 'p1', ...a, sourceMessageId: 'm1', sourceImageIndex: 0, tags: '' }] }, MEETING_TRIGGERS);
  const row = (await root.collection('photoIndex').doc(media.getPhotoAssetKey(a.imageUrl)).get()).data();
  assert.equal(row.fingerprint, fp(1), 'the row remembers the fingerprint of its file');

  const messageBefore = (await root.collection('messages').doc('m1').get()).data();
  const meetingBefore = (await root.collection('confirmedMeetings').doc('2026-10-01').get()).data();
  const result = await media.deleteAsset({ db, calendarDocId: CAL, asset: { ...a, messageId: 'm1' } });
  assert.equal(result.ok, true);
  // The message's event first, then the album copy's: the last owner to go carries no fingerprint.
  await deliver('messages', 'm1', messageBefore, MESSAGE_TRIGGERS);
  assert.equal((await root.collection('photoTombstones').doc(hex(1)).get()).exists, false, 'still in the album');
  await deliver('confirmedMeetings', '2026-10-01', meetingBefore, MEETING_TRIGGERS);

  assert.equal((await root.collection('photoIndex').doc(media.getPhotoAssetKey(a.imageUrl)).get()).exists, false);
  const note = (await root.collection('photoTombstones').doc(hex(1)).get()).data();
  assert.equal(note.fingerprint, fp(1));
  assert.equal(note.imageUrl, a.imageUrl);
  assert.equal(note.thumbUrl, a.thumbUrl);
  assert.equal(note.assetKey, media.getPhotoAssetKey(a.imageUrl));
  assert.equal((await root.collection('photoTombstones').doc(hex(2)).get()).exists, false, 'b is still shown');
});

test('a record whose fingerprints lost a slot leaves no note (it could name a neighbour file)', async () => {
  await reset();
  const [c] = [photo('c')];
  await write('messages', 'm2', {
    text: '사진', participantId: 'p', timestamp: 2, uploadSource: 'gallery',
    imageUrls: [c.imageUrl], thumbUrls: [c.thumbUrl], imageFingerprints: [fp(3), fp(4)],
  }, MESSAGE_TRIGGERS);
  await write('messages', 'm2', null, MESSAGE_TRIGGERS);
  assert.equal((await root.collection('photoTombstones').get()).size, 0);
});

test('the GC sweep keeps the original and thumbnail a note names', async () => {
  await reset();
  const d = photo('d');
  await Promise.all(['original', 'thumb'].map(kind => bucket.file(path('d', kind)).save(Buffer.from('jpeg-bytes'), { contentType: 'image/jpeg' })));
  await write('messages', 'm3', {
    text: '사진', participantId: 'p', timestamp: 3, uploadSource: 'gallery',
    imageUrls: [d.imageUrl], thumbUrls: [d.thumbUrl], imageFingerprints: [fp(5)],
  }, MESSAGE_TRIGGERS);
  const before = (await root.collection('messages').doc('m3').get()).data();
  const result = await media.deleteAsset({ db, calendarDocId: CAL, asset: { ...d, messageId: 'm3' } });
  assert.deepEqual(result.queuedStoragePaths, [path('d', 'thumb')], 'the thumbnail is queued for GC');
  await deliver('messages', 'm3', before, MESSAGE_TRIGGERS);
  assert.ok((await root.collection('photoTombstones').doc(hex(5)).get()).exists);

  const gc = await media.sweepStorageGc({ db, bucket, now: Date.now() + media.GC_GRACE_MS + 60000 });
  assert.ok(gc.kept >= 1, JSON.stringify(gc));
  for (const kind of ['original', 'thumb']) {
    const [exists] = await bucket.file(path('d', kind)).exists();
    assert.equal(exists, true, `${kind} kept for reuse`);
  }
});

test('browsers can read a note (batchGet included) but never write one', async () => {
  await reset();
  await root.collection('photoTombstones').doc(hex(6)).set({ fingerprint: fp(6), imageUrl: photo('e').imageUrl, thumbUrl: photo('e').thumbUrl, assetKey: 'asset:v1:x', deletedAt: 1 });
  const name = `projects/${PROJECT}/databases/(default)/documents/calendars/${CAL}/photoTombstones`;
  assert.equal((await fetch(`${rest}/calendars/${CAL}/photoTombstones/${hex(6)}`)).status, 200);
  const batch = await fetch(`${rest}:batchGet`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ documents: [`${name}/${hex(6)}`, `${name}/${hex(7)}`] }),
  });
  assert.equal(batch.status, 200, await batch.clone().text());
  const rows = await batch.json();
  assert.equal(rows.filter(row => row.found).length, 1);
  assert.equal(rows.filter(row => row.missing).length, 1);
  assert.equal(rows.find(row => row.found).found.fields.imageUrl.stringValue, photo('e').imageUrl);

  const forged = await fetch(`${rest}/calendars/${CAL}/photoTombstones/${hex(8)}`, {
    method: 'PATCH', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields: { fingerprint: { stringValue: fp(8) }, imageUrl: { stringValue: 'https://evil.test/x.jpg' } } }),
  });
  assert.equal(forged.status, 403);
  const removed = await fetch(`${rest}/calendars/${CAL}/photoTombstones/${hex(6)}`, { method: 'DELETE' });
  assert.equal(removed.status, 403);
  assert.equal((await fetch(`${rest}/calendars/not-a-calendar/photoTombstones/${hex(6)}`)).status, 403);
});
