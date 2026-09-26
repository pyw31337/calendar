'use strict';
// firestore.rules: messages accept the per-photo GPS map (imageGeoMap) written by
// src/core/photo-geo.js, and still reject anything else. Talks to the emulator's REST API
// WITHOUT admin credentials, so the security rules are evaluated like a real client write.
//   npm run test:functions:emulator   (from the repo root)
const test = require('node:test');
const assert = require('node:assert/strict');

const host = process.env.FIRESTORE_EMULATOR_HOST;
if (!host) throw new Error('Run under `firebase emulators:exec` (FIRESTORE_EMULATOR_HOST unset).');
const project = process.env.GCLOUD_PROJECT || 'demo-moyeora';
const base = `http://${host}/v1/projects/${project}/databases/(default)/documents/calendars/cal_rulesgeo/messages`;

const str = v => ({ stringValue: v });
const num = v => (Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v });
const geo = (lat, lng) => ({ mapValue: { fields: { lat: num(lat), lng: num(lng) } } });

async function createMessage(id, extraFields = {}) {
  return fetch(`${base}?documentId=${id}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields: { participantId: str('p1'), text: str('hi'), timestamp: num(1790000000000), uploadSource: str('chat'), ...extraFields } })
  });
}
async function patchMessage(id, fields) {
  const mask = Object.keys(fields).map(f => `updateMask.fieldPaths=${encodeURIComponent(f)}`).join('&');
  return fetch(`${base}/${id}?${mask}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ fields }) });
}

test('a client can add imageGeoMap to its message right after saving it', async () => {
  assert.equal((await createMessage('geo1')).status, 200);
  const res = await patchMessage('geo1', { imageGeoMap: { mapValue: { fields: { 'asset:v1:abc': geo(37.43366, 127.02008) } } } });
  assert.equal(res.status, 200, await res.text());
});

test('a message may also be created with imageGeoMap', async () => {
  const res = await createMessage('geo2', { imageGeoMap: { mapValue: { fields: { 'asset:v1:def': geo(37.5, 127.1) } } } });
  assert.equal(res.status, 200, await res.text());
});

test('imageGeoMap must be a map', async () => {
  assert.equal((await createMessage('geo3')).status, 200);
  const res = await patchMessage('geo3', { imageGeoMap: str('37.4,127.0') });
  assert.equal(res.status, 403);
});

test('other unknown message fields are still rejected', async () => {
  const res = await createMessage('geo4', { somethingElse: str('x') });
  assert.equal(res.status, 403);
});
