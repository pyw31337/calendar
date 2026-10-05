import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { planSettlementReminders, planNewSettlementNotifications } = require('../functions/settlement-reminders.js');

// 2026-10-08 06:30 Asia/Seoul.
const NOW = Date.parse('2026-10-07T21:30:00Z');

test('open cards are reminded only on Seoul day 3 and day 5 after creation', () => {
  const plan = planSettlementReminders({
    settlementCards: [
      { id: 'day3', title: '서울랜드 정산', status: 'active', createdAt: '2026-10-05T01:00:00Z' },
      { id: 'day5', title: '한강 정산', status: 'active', createdAt: '2026-10-03T01:00:00Z' },
      { id: 'day4', title: '사이 날짜', status: 'active', createdAt: '2026-10-04T01:00:00Z' },
      { id: 'day8', title: '오래된 정산', status: 'active', createdAt: '2026-09-26T13:20:36.024Z' },
      { id: 'closed', title: '마감된 정산', status: 'closed', createdAt: '2026-10-05T01:00:00Z' },
      { id: 'deleted', title: '삭제된 정산', status: 'active', createdAt: '2026-10-05T01:00:00Z', deletedAt: 1 },
      { id: 'young', title: '어제 만든 정산', status: 'active', createdAt: '2026-10-07T01:00:00Z' },
      { id: 'nodate', title: '날짜 없음', status: 'active' },
    ],
  }, NOW);
  assert.deepEqual(plan.map(item => [item.id, item.days]), [['day3', 3], ['day5', 5]]);
  assert.equal(plan[0].claimKey, 'settlement_day3_day3');
  assert.equal(plan[1].claimKey, 'settlement_day5_day5');
  assert.match(plan[0].body, /서울랜드 정산/);
  assert.match(plan[0].body, /3일째/);
  assert.match(plan[1].body, /5일째/);
});

test('the Seoul calendar date is what counts, not elapsed hours', () => {
  // Created 2026-10-05 23:50 KST. At 06:30 KST on 2026-10-08 only 2 days and ~7 hours
  // have elapsed, but the Seoul date is 3 days later.
  const late = planSettlementReminders({
    settlementCards: [{ id: 'late', title: '늦은 정산', status: 'active', createdAt: '2026-10-05T14:50:00Z' }]
  }, NOW);
  assert.deepEqual(late.map(item => item.days), [3]);
  // Created 2026-10-06 00:10 KST. Same clock time is only 2 Seoul days later.
  const afterMidnight = planSettlementReminders({
    settlementCards: [{ id: 'am', title: '자정 넘긴 정산', status: 'active', createdAt: '2026-10-05T15:10:00Z' }]
  }, NOW);
  assert.deepEqual(afterMidnight, []);
});

test('an epoch createdAt is the same clock', () => {
  const created = Date.parse('2026-10-03T02:00:00Z');
  const plan = planSettlementReminders({
    settlementCards: [{ id: 'epoch', title: '숫자 시각', status: 'active', createdAt: created }]
  }, NOW);
  assert.deepEqual(plan.map(item => [item.id, item.days]), [['epoch', 5]]);
});

test('a calendar without cards plans nothing', () => {
  assert.deepEqual(planSettlementReminders({}, NOW), []);
  assert.deepEqual(planSettlementReminders(null, NOW), []);
});

test('only a newly registered open settlement card notifies', () => {
  const existing = { id: 'old', title: '기존', status: 'active', createdAt: '2026-10-01T00:00:00Z' };
  const created = { id: 'new', title: '새 정산', status: 'active', createdAt: '2026-10-08T00:00:00Z' };
  const plan = planNewSettlementNotifications([existing], [existing, created]);
  assert.equal(plan.length, 1);
  assert.equal(plan[0].id, 'new');
  assert.equal(plan[0].claimKey, 'settlement_new');
  assert.equal(plan[0].skipParticipantId, null);
  assert.match(plan[0].body, /새 정산/);
  assert.deepEqual(planNewSettlementNotifications([existing, created], [created, { ...existing, title: '제목만 수정' }]), []);
  assert.deepEqual(planNewSettlementNotifications([], [{ id: 'closed-new', title: '이미 마감', status: 'closed', createdAt: '2026-10-08T00:00:00Z' }]), []);
  assert.deepEqual(planNewSettlementNotifications([], [{ id: 'gone', title: '삭제', status: 'active', deletedAt: 1 }]), []);
  const authored = planNewSettlementNotifications([], [{ id: 'by', title: '작성자', status: 'active', createdBy: 'person_author' }]);
  assert.equal(authored[0].skipParticipantId, 'person_author');
});
