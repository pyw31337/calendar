import assert from 'node:assert/strict';
import test from 'node:test';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { buildCalendarOperations } = require('../functions/ai-operations.js');

test('scheduled operations only surface observed planning, attendance, settlement, and worker facts', () => {
  const tasks = buildCalendarOperations({
    dateKey: '2026-10-06', stale: true, summary: { failed: 2 },
    calendar: {
      participants: [{ id: 'young' }, { id: 'yuri' }],
      availabilities: [{ date: '2026-10-08', participantId: 'young' }],
      confirmedMeeting: [
        { date: '2026-10-08', title: '여행' },
        { date: '2026-10-03', title: '지난 모임', expenses: [{ id: 'food', amount: 10000 }] }
      ]
    }
  });
  assert.deepEqual(tasks.map(task => task.id), ['analysis-failed', 'attendance:2026-10-08', 'place:2026-10-08', 'settlement:2026-10-03', 'worker-stale']);
});

test('scheduled operations ignore linked place and settlement rows already claimed by a card', () => {
  const tasks = buildCalendarOperations({
    dateKey: '2026-10-06',
    calendar: {
      places: [{ date: '2026-10-09', name: '숙소' }],
      confirmedMeeting: [
        { date: '2026-10-09', title: '여행' },
        { date: '2026-10-01', title: '지난 여행', expenses: [{ id: 'food', amount: 10000 }] }
      ],
      settlementCards: [{ checkedItemKeys: ['2026-10-01_food_10000'] }]
    }
  });
  assert.equal(tasks.length, 0);
});
