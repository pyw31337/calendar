'use strict';
// Photo comments v2 against the Firestore emulator: the rules a browser write goes through, and
// the server logic the triggers + migration use (functions/photo-comment-items.js).
//   npm run test:functions:emulator   (from the repo root)
const test = require('node:test');
const assert = require('node:assert/strict');
const { initializeApp } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const items = require('../photo-comment-items');

const host = process.env.FIRESTORE_EMULATOR_HOST;
if (!host) throw new Error('Run under `firebase emulators:exec` (FIRESTORE_EMULATOR_HOST unset).');
const project = process.env.GCLOUD_PROJECT || 'demo-moyeora';
const app = initializeApp({ projectId: project }, 'photo-comment-items-test');
const db = getFirestore(app);

const str = v => ({ stringValue: v });
const num = v => ({ integerValue: String(v) });
const nul = () => ({ nullValue: null });
const restBase = cal => `http://${host}/v1/projects/${project}/databases/(default)/documents/calendars/${cal}`;
const put = (cal, path, fields, query = '') => fetch(`${restBase(cal)}/${path}${query}`, {
  method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ fields })
});
const comment = (id, extra = {}) => ({
  id: str(id), assetKey: str('asset:v1:abc'), participantId: str('p_yuri'), text: str('좋다'),
  createdAt: num(1790000000000), updatedAt: num(1790000000000), deletedAt: nul(), ...extra
});

test('rules: a browser can add, edit and soft-delete one comment, never hard-delete it', async () => {
  const cal = 'cal_rulescomments';
  assert.equal((await put(cal, 'photoCommentItems/cmt_1', comment('cmt_1'), '?currentDocument.exists=false')).status, 200);
  assert.equal((await put(cal, 'photoCommentItems/cmt_1', comment('cmt_1', { text: str('수정') }))).status, 200, 'edit');
  assert.equal((await put(cal, 'photoCommentItems/cmt_1', comment('cmt_1', { deletedAt: num(1790000001000) }))).status, 200, 'soft delete');
  assert.equal((await put(cal, 'photoCommentItems/cmt_1', comment('cmt_1'))).status, 200, 'undo delete');
  assert.equal((await fetch(`${restBase(cal)}/photoCommentItems/cmt_1`, { method: 'DELETE' })).status, 403, 'no hard delete');
});

test('rules: malformed or rewritten comments are rejected', async () => {
  const cal = 'cal_rulescomments';
  assert.equal((await put(cal, 'photoCommentItems/cmt_2', comment('cmt_other'))).status, 403, 'id must match the doc');
  assert.equal((await put(cal, 'photoCommentItems/cmt_3', comment('cmt_3', { text: str('') }))).status, 403, 'empty text');
  assert.equal((await put(cal, 'photoCommentItems/cmt_4', comment('cmt_4', { extra: str('x') }))).status, 403, 'unknown field');
  assert.equal((await put(cal, 'photoCommentItems/cmt_5', comment('cmt_5', { deletedAt: num(1) }))).status, 403, 'created already deleted');
  const noDeletedAt = comment('cmt_6'); delete noDeletedAt.deletedAt;
  assert.equal((await put(cal, 'photoCommentItems/cmt_6', noDeletedAt)).status, 403, 'deletedAt is required');
  assert.equal((await put(cal, 'photoCommentItems/cmt_7', comment('cmt_7', { migratedFrom: str('photoComments') }))).status, 403, 'only the migration marks migrated items');
  assert.equal((await put(cal, 'photoCommentItems/cmt_1', comment('cmt_1', { createdAt: num(5) }))).status, 403, 'createdAt is fixed');
  assert.equal((await put(cal, 'photoCommentSummary/counts', { counts: { mapValue: { fields: {} } } })).status, 403, 'summary is server-only');
  assert.equal((await fetch(`${restBase(cal)}/photoCommentSummary/counts`)).status === 403, false, 'summary is readable');
});

test('legacy threads migrate create-only to their one owning photo, and counts follow', async () => {
  const cal = 'cal_migratecomments';
  const root = db.collection('calendars').doc(cal);
  await root.collection('photoIndex').doc('asset:v1:p1').set({ legacyKeys: ['chat:g1:0'], commentCount: 0 });
  await root.collection('photoIndex').doc('asset:v1:p2').set({ legacyKeys: ['chat:dup:0'] });
  await root.collection('photoIndex').doc('asset:v1:p3').set({ legacyKeys: ['chat:dup:0'] });
  const legacy = [
    { id: 'cmt_a', participantId: 'p1', text: '하나', createdAt: 1 },
    { id: 'cmt_b', participantId: 'p2', text: '둘', createdAt: 2 },
    { participantId: 'p2', text: 'id 없는 옛 댓글', createdAt: 3 },
    { id: 'cmt_empty', participantId: 'p2', text: '  ', createdAt: 4 }
  ];
  const first = await items.mirrorLegacyThread(db, cal, 'chat:g1:0', legacy);
  assert.deepEqual(first, { created: 3, existing: 0, assetKey: 'asset:v1:p1' });
  // Running again (or an old app writing its stale array again) changes nothing.
  await root.collection(items.ITEMS).doc('cmt_a').update({ text: '새 앱에서 수정', deletedAt: 9 });
  const again = await items.mirrorLegacyThread(db, cal, 'chat:g1:0', legacy);
  assert.deepEqual(again, { created: 0, existing: 3, assetKey: 'asset:v1:p1' });
  const kept = (await root.collection(items.ITEMS).doc('cmt_a').get()).data();
  assert.equal(kept.text, '새 앱에서 수정');
  assert.equal(kept.deletedAt, 9);

  assert.equal(await items.recountAsset(db, FieldValue, cal, 'asset:v1:p1'), 2, 'soft-deleted comment is not counted');
  assert.equal((await root.collection('photoIndex').doc('asset:v1:p1').get()).data().commentCount, 2);
  assert.equal((await root.collection(items.SUMMARY).doc(items.SUMMARY_DOC).get()).data().counts['asset:v1:p1'], 2);

  // A legacy key claimed by two photos stays on its own key (never guessed onto one of them).
  const dup = await items.mirrorLegacyThread(db, cal, 'chat:dup:0', [{ id: 'cmt_d', participantId: 'p1', text: '애매', createdAt: 5 }]);
  assert.equal(dup.assetKey, 'chat:dup:0');

  // Last live comment removed -> the photo drops out of the summary.
  await root.collection(items.ITEMS).doc('cmt_b').update({ deletedAt: 10 });
  const noId = (await root.collection(items.ITEMS).where('assetKey', '==', 'asset:v1:p1').where('deletedAt', '==', null).get()).docs;
  await Promise.all(noId.map(doc => doc.ref.update({ deletedAt: 11 })));
  assert.equal(await items.recountAsset(db, FieldValue, cal, 'asset:v1:p1'), 0);
  const summary = (await root.collection(items.SUMMARY).doc(items.SUMMARY_DOC).get()).data();
  assert.equal('asset:v1:p1' in (summary.counts || {}), false);
});

test('assetKeysToRecount ignores plain text edits', () => {
  const base = { assetKey: 'a', deletedAt: null };
  assert.deepEqual(items.assetKeysToRecount(base, { ...base, text: 'x' }), []);
  assert.deepEqual(items.assetKeysToRecount(null, base), ['a']);
  assert.deepEqual(items.assetKeysToRecount(base, { ...base, deletedAt: 1 }), ['a']);
  assert.deepEqual(items.assetKeysToRecount(base, { ...base, assetKey: 'b' }), ['a', 'b']);
});
