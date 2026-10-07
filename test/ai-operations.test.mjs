import assert from 'node:assert/strict';
import test from 'node:test';
import { buildAiOperationsInbox } from '../src/core/ai-operations.js';
import { getSafeMediaAutoApplyCandidates, isSafeMediaAutoApplyCandidate } from '../src/core/ai-media-review.js';

test('AI operations inbox creates grounded planning and settlement actions without mutating data', () => {
  const calendar = {
    participants: [{ id: 'young' }, { id: 'yuri' }, { id: 'eun' }],
    availabilities: [{ date: '2026-10-08', participantId: 'young' }],
    confirmedMeeting: [
      { date: '2026-10-08', title: '가을 나들이' },
      { date: '2026-10-02', title: '지난 모임', expenses: [{ id: 'food', label: '점심', amount: 42000 }] }
    ],
    settlementCards: []
  };
  const tasks = buildAiOperationsInbox({ calendar, today: '2026-10-06' });
  assert.deepEqual(tasks.map(task => task.id), ['attendance:2026-10-08', 'place:2026-10-08', 'settlement:2026-10-02']);
  assert.equal(tasks.find(task => task.id === 'settlement:2026-10-02').action.type, 'open-settlement');
  assert.equal(calendar.confirmedMeeting[1].expenses[0].amount, 42000, 'analysis is read-only');
});

test('AI operations hides a reserved expense and treats linked places as planned', () => {
  const tasks = buildAiOperationsInbox({
    today: '2026-10-06',
    hasPlaceForDate: date => date === '2026-10-10',
    calendar: {
      confirmedMeeting: [
        { date: '2026-10-10', title: '여행' },
        { date: '2026-10-01', title: '지난 여행', expenses: [{ id: 'e1', amount: 10000 }] }
      ],
      settlementCards: [{ checkedItemKeys: ['2026-10-01_e1_10000'] }]
    }
  });
  assert.equal(tasks.some(task => task.kind === 'meeting-place'), false);
  assert.equal(tasks.some(task => task.kind === 'settlement'), false);
});

test('AI operations surfaces failed work and stale worker health separately from suggestions', () => {
  const tasks = buildAiOperationsInbox({
    today: '2026-10-06', now: new Date('2026-10-06T12:00:00+09:00').getTime(),
    mediaAnalysis: [
      { assetKey: 'asset:v1:failed', status: 'failed', error: '403' },
      { assetKey: 'asset:v1:good', status: 'suggested', confidence: 0.91, places: ['광명'] }
    ],
    workerStates: [{ workerId: 'mac', lastHeartbeatAt: new Date('2026-10-04T00:00:00+09:00').getTime() }]
  });
  assert.deepEqual(tasks.map(task => task.id), ['media-analysis-failures', 'media-worker-stale', 'media-analysis-review']);
});

test('bulk photo application requires direct per-tag evidence, never a scene confidence', () => {
  const safe = { assetKey: 'asset:v1:safe', status: 'suggested', suggestedTags: ['261006'], tagEvidence: [{ tag: '261006', source: 'capture-date', confidence: 1 }] };
  assert.equal(isSafeMediaAutoApplyCandidate(safe), true);
  assert.equal(isSafeMediaAutoApplyCandidate({ ...safe, confidence: 0.99, tagEvidence: [] }), false);
  assert.equal(isSafeMediaAutoApplyCandidate({ ...safe, places: [], suggestedTags: ['260106'] }), false);
  assert.equal(isSafeMediaAutoApplyCandidate({ ...safe, review: { decision: 'applied' } }), false);
  assert.deepEqual(getSafeMediaAutoApplyCandidates([safe, { ...safe, assetKey: 'asset:v1:low', people: ['영우'] }]).map(item => item.assetKey), ['asset:v1:safe']);
});

test('operations includes ledger-only records, original expense indices, active people and note titles', () => {
  const tasks = buildAiOperationsInbox({ today: '2026-10-06', calendar: {
    participants: [{ id: 'a' }, { id: 'b', removedAt: 1 }],
    confirmedMeeting: [
      { date: '2026-10-05', confirmed: false, expenses: [{ type: 'income', amount: 50 }, { amount: 100 }, { type: 'carryover', amount: 500 }] },
      { date: '2026-10-07', note: '가족 모임' },
      { date: '2026-10-08', removedAt: 1 },
      { date: '2026-10-09', confirmed: false }
    ], settlementCards: [{ checkedItemKeys: ['2026-10-05_1_100'] }]
  } });
  assert.deepEqual(tasks.map(task => task.id), ['place:2026-10-07']);
  assert.equal(tasks[0].title, '가족 모임 장소 확인');
  assert.equal(tasks[0].action.tab, 'meeting');
});

test('operations detects duplicate reservations but not queued analysis as failures', () => {
  const tasks = buildAiOperationsInbox({ today: '2026-10-06', mediaAnalysis: [{ status: 'queued' }], calendar: {
    settlementCards: [{ id: '1', checkedItemKeys: ['expense1'] }, { id: '2', checkedItems: { expense1: {} } }]
  } });
  assert.deepEqual(tasks.map(task => task.id), ['settlement-duplicate-claims']);
  assert.equal(tasks[0].priority, 'urgent');
  assert.deepEqual(buildAiOperationsInbox({ today: '2026-02-30' }), []);
});
