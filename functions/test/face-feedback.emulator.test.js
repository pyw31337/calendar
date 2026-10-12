'use strict';
// 얼굴 추천 "아니에요" and its 되돌리기, through the real recordFaceFeedback endpoint.
const test = require('node:test');
const assert = require('node:assert/strict');

if (!process.env.FIRESTORE_EMULATOR_HOST) throw new Error('Run under `firebase emulators:exec` (FIRESTORE_EMULATOR_HOST unset).');

const fns = require('../index.js');
const { stableAnalysisId } = require('../media-analysis');
const { getFirestore } = require('firebase-admin/firestore');

const db = getFirestore();
const CAL = 'cal_facefb';
const KEY = 'asset:v1:face-feedback-1';

function call(body) {
  return new Promise((resolve, reject) => {
    const res = {
      statusCode: 200, headers: {},
      set(name, value) { this.headers[name] = value; return this; },
      setHeader(name, value) { this.headers[name] = value; },
      status(code) { this.statusCode = code; return this; },
      json(payload) { resolve({ status: this.statusCode, body: payload }); },
      send(payload) { resolve({ status: this.statusCode, body: payload }); },
    };
    Promise.resolve(fns.recordFaceFeedback({ method: 'POST', body, ip: `10.0.0.${Math.floor(Math.random() * 200)}`, headers: {}, get: () => '' }, res)).catch(reject);
  });
}

test('a rejected face suggestion can be put back with its score', async () => {
  const ref = db.collection('calendars').doc(CAL).collection('mediaAnalysis').doc(stableAnalysisId(KEY));
  await ref.set({ assetKey: KEY, facePeople: [{ name: '서준', score: 0.71 }, { name: '도은', score: 0.66 }], faceSuggested: true });

  const rejected = await call({ calendarId: 'facefb', name: '서준', assetKeys: [KEY] });
  assert.equal(rejected.status, 200, JSON.stringify(rejected.body));
  let data = (await ref.get()).data();
  assert.deepEqual(data.facePeople.map(p => p.name), ['도은']);
  assert.deepEqual(data.faceRejected, ['서준']);

  const restored = await call({ calendarId: 'facefb', name: '서준', restore: true, assetKeys: [KEY], scores: [0.71] });
  assert.equal(restored.status, 200, JSON.stringify(restored.body));
  data = (await ref.get()).data();
  assert.deepEqual(data.facePeople.map(p => [p.name, p.score]).sort(), [['도은', 0.66], ['서준', 0.71]]);
  assert.deepEqual(data.faceRejected, []);
  assert.equal(data.faceSuggested, true);

  // A score that is not a number between 0 and 1 is never written.
  await call({ calendarId: 'facefb', name: '도은', assetKeys: [KEY] });
  await call({ calendarId: 'facefb', name: '도은', restore: true, assetKeys: [KEY], scores: ['huge'] });
  data = (await ref.get()).data();
  assert.deepEqual(data.facePeople.map(p => p.name), ['서준']);
  assert.deepEqual(data.faceRejected, [], 'the name still comes off faceRejected');
});
