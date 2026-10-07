import assert from 'node:assert/strict';
import { prepareAnalysisTags } from '../src/core/ai-media-review.js';
import test from 'node:test';
import { createRequire } from 'node:module';
import { classifyPhoto, captureDateKey } from '../tools/local-media-worker/analysis-evidence.mjs';
import { getMediaAnalysisReview } from '../src/core/ai-media-review.js';
import { persistMediaAnalysisReview } from '../src/core/media-analysis-review-save.js';
const require = createRequire(import.meta.url);
const { sanitizeAnalysisItem } = require('../functions/media-analysis.js');
const calendar = { participants: [{ name: '영우' }, { name: '탈퇴', removedAt: 1 }], confirmedMeeting: [{ date: '2026-10-06', note: '가족여행' }] };

test('upload time is not capture time and a scene does not learn identities', () => {
  const result = classifyPhoto({ timestamp: Date.parse('2026-10-06T12:00:00Z') }, { suggestedTags: ['음식'], labels: [{ name: 'food', confidence: .99 }] }, calendar, ['영우', '서울', '261006']);
  assert.deepEqual(result.suggestedTags, ['음식']);
  assert.deepEqual(result.meetings, []);
  assert.equal(getMediaAnalysisReview({ ...result, assetKey: 'asset:v1:a', status: 'suggested' }).canBulkApply, false);
});

test('OCR exact tokens are manual evidence; substrings and removed participants are ignored', () => {
  assert.deepEqual(classifyPhoto({}, { ocrText: ['영우동 탈퇴'] }, calendar).people, []);
  const result = classifyPhoto({}, { ocrText: ['영우'] }, calendar);
  assert.deepEqual(result.people, ['영우']);
  assert.equal(result.tagEvidence[0].source, 'ocr-person');
  assert.equal(getMediaAnalysisReview({ ...result, assetKey: 'asset:v1:a', status: 'suggested', confidence: .999 }).canBulkApply, false);
});

test('capture dates are grounded; calendar dates and nearby venues remain suggestions', () => {
  const result = classifyPhoto({ capturedAt: '2026:10:06 12:00:00' }, {}, {});
  assert.deepEqual(result.suggestedTags, ['261006']);
  const safe = { ...result, assetKey: 'asset:v1:a', status: 'suggested', sourceUpdatedAt: 1 };
  assert.equal(getMediaAnalysisReview(safe).canBulkApply, true);
  assert.equal(getMediaAnalysisReview(safe, { photo: { updatedAt: 2 } }).canBulkApply, false);
  const contextual = classifyPhoto({ meetingDate: '2026-10-06' }, {}, calendar);
  assert.equal(getMediaAnalysisReview({ ...contextual, assetKey: 'asset:v1:a', status: 'suggested' }).canBulkApply, false);
  assert.equal(captureDateKey('2026-02-30'), '');
  assert.equal(captureDateKey('2026-10-05T16:00:00Z'), '2026-10-06');
});

test('GPS-nearest venues are not certain; multiple candidates and missing coordinates abstain', () => {
  const places = [{ name: '공원', lat: 37, lng: 127 }, { name: '식당', lat: 37.0001, lng: 127 }];
  assert.deepEqual(classifyPhoto({ latitude: 37, longitude: 127 }, {}, { places }).places, []);
  assert.deepEqual(classifyPhoto({ latitude: null, longitude: null }, {}, { places: [{ name: '없는장소', lat: null, lng: null }] }).places, []);
  const result = classifyPhoto({ latitude: 37, longitude: 127 }, {}, { places: [places[0]] });
  assert.equal(result.tagEvidence[0].source, 'gps-place');
  assert.equal(getMediaAnalysisReview({ ...result, assetKey: 'asset:v1:a', status: 'suggested' }).canBulkApply, false);
});

test('legacy/NaN evidence cannot bypass the policy and server drops unknown evidence types', () => {
  for (const confidence of [undefined, NaN, Infinity, '1', .999]) {
    assert.equal(getMediaAnalysisReview({ assetKey: 'asset:v1:a', status: 'suggested', places: ['서울'], confidence,
      tagEvidence: [{ tag: '서울', source: 'existing-tag', confidence }] }).canBulkApply, false);
  }
  const result = sanitizeAnalysisItem({ assetKey: 'asset:v1:a', tagEvidence: [
    { tag: '서울', source: 'admin-approved', confidence: 1 },
    { tag: '261006', source: 'capture-date', confidence: NaN }
  ] });
  assert.deepEqual(result.tagEvidence, [{ tag: '261006', source: 'capture-date', confidence: 0 }]);
});

test('failed tag writes never persist reviews, partial audit failures remain retryable', async () => {
  const order = [];
  await assert.rejects(persistMediaAnalysisReview({ changed: true, saveTags: async () => false, saveReview: async () => order.push('review') }), /저장하지 못/);
  assert.deepEqual(order, []);
  await assert.rejects(persistMediaAnalysisReview({ changed: true, saveTags: async () => { order.push('tags'); return { ok: true }; }, saveReview: async () => { throw new Error('offline'); } }), /태그는 저장됐지만/);
  await persistMediaAnalysisReview({ changed: false, saveTags: async () => { throw new Error('must not rewrite'); }, saveReview: async () => order.push('review') });
  assert.deepEqual(order, ['tags', 'review']);
});
test('manual tag removal stays removed; stale edits and over-capacity additions are refused', () => {
  assert.deepEqual(prepareAnalysisTags({ tags: '서준 광명시' }, ['서준'], { decision: 'edited', originalTags: '서준 광명시' }), ['서준']);
  assert.deepEqual(prepareAnalysisTags({ tags: '서준' }, [], { decision: 'edited', originalTags: '서준' }), []);
  assert.throws(() => prepareAnalysisTags({ tags: '서준 새태그' }, ['서준'], { decision: 'edited', originalTags: '서준' }), /변경/);
  const tags = Array.from({ length: 20 }, (_, i) => `t${i}`).join(' ');
  assert.throws(() => prepareAnalysisTags({ tags }, ['새태그']), /한도/);
  assert.throws(() => prepareAnalysisTags({ tags: '가'.repeat(31) }, ['새태그']), /한도/);
  assert.deepEqual(prepareAnalysisTags({ tags: '영우' }, ['박영우'], { calendar: { participants: [{ name: '박영우' }] } }), ['영우']);
});
