import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { planSettlementReminders } = require('../functions/settlement-reminders.js');

const NOW = Date.parse('2026-10-05T10:00:00Z');

test('only open cards older than three days are reminded', () => {
  const plan = planSettlementReminders({
    settlementCards: [
      { id: 'a', title: '서울랜드 정산', status: 'active', createdAt: '2026-09-26T13:20:36.024Z' },
      { id: 'b', title: '마감된 정산', status: 'closed', createdAt: '2026-09-01T00:00:00Z' },
      { id: 'c', title: '삭제된 정산', status: 'active', createdAt: '2026-09-01T00:00:00Z', deletedAt: 1 },
      { id: 'd', title: '어제 만든 정산', status: 'active', createdAt: '2026-10-04T10:00:00Z' },
      { id: 'e', title: '날짜 없음', status: 'active' },
    ],
  }, NOW);
  assert.deepEqual(plan.map(p => [p.id, p.days]), [['a', 8]]);
  assert.match(plan[0].body, /서울랜드 정산.*8일째/);
});

test('a calendar without cards plans nothing', () => {
  assert.deepEqual(planSettlementReminders({}, NOW), []);
  assert.deepEqual(planSettlementReminders(null, NOW), []);
});
