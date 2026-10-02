'use strict';
// firestore.rules: calendars/{cal}/likes accepts the 좋아요 documents written by
// src/core/likes-store.js and rejects anything else. Client (unauthenticated REST) writes, so the
// rules are evaluated like a real browser write.
//   npm run test:functions:emulator   (from the repo root)
const test = require('node:test');
const assert = require('node:assert/strict');

const host = process.env.FIRESTORE_EMULATOR_HOST;
if (!host) throw new Error('Run under `firebase emulators:exec` (FIRESTORE_EMULATOR_HOST unset).');
const project = process.env.GCLOUD_PROJECT || 'demo-moyeora';
const base = `http://${host}/v1/projects/${project}/databases/(default)/documents/calendars/cal_ruleslikes/likes`;

const str = v => ({ stringValue: v });
const num = v => ({ integerValue: String(v) });
const map = fields => ({ mapValue: { fields } });

const like = (extra = {}) => ({
  kind: str('photo'), ref: str('asset:v1:abc'), title: str('#서준'), subtitle: str(''),
  thumb: str('https://example.test/t.jpg'), url: str('https://example.test/f.jpg'),
  likedAt: num(1790000000000), target: map({ messageId: str('m1'), imageIndex: num(0) }), ...extra
});
const put = (id, fields) => fetch(`${base}/${id}`, {
  method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ fields })
});

test('a like document can be created, read and deleted', async () => {
  const id = 'photo_0123456789abcdef';
  assert.equal((await put(id, like())).status, 200);
  assert.equal((await fetch(`${base}/${id}`)).status, 200);
  assert.equal((await fetch(`${base}/${id}`, { method: 'DELETE' })).status, 200);
});

test('every like kind is accepted', async () => {
  for (const kind of ['memo', 'file', 'link', 'content', 'memory', 'person', 'place', 'meeting']) {
    const res = await put(`${kind}_00000000000000aa`, like({ kind: str(kind) }));
    assert.equal(res.status, 200, `${kind}: ${await res.text()}`);
  }
});

test('a malformed document id is rejected', async () => {
  assert.equal((await put('photo_not-a-hash', like())).status, 403);
  assert.equal((await put('unknown_0123456789abcdef', like())).status, 403);
});

test('unknown fields and kinds are rejected', async () => {
  assert.equal((await put('photo_1123456789abcdef', like({ extra: str('x') }))).status, 403);
  assert.equal((await put('photo_2123456789abcdef', like({ kind: str('chat') }))).status, 403);
  assert.equal((await put('photo_3123456789abcdef', like({ ref: str('') }))).status, 403);
});
