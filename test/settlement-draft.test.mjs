import test from 'node:test';
import assert from 'node:assert/strict';
import { buildSettlementDraftFromMeeting } from '../src/core/settlement-draft.js';

const calendar = {
  participants: [
    { id: 'p1', name: '박영우' }, { id: 'p2', name: '김유리' }, { id: 'p3', name: '송은혜' },
    { id: 'p4', name: '탈퇴', removedAt: 1 },
  ],
  availabilities: [
    { participantId: 'p1', date: '2026-09-26' }, { participantId: 'p3', date: '2026-09-26' },
    { participantId: 'p2', date: '2026-09-26', deletedAt: 1 }, { participantId: 'p2', date: '2026-09-27' },
  ],
};

test('the draft takes that day\'s attendees and pre-checks the day\'s expenses', () => {
  const draft = buildSettlementDraftFromMeeting({
    date: '2026-09-26', note: '서울랜드 바이킹',
    expenses: [{ id: 'e1', amount: 15000 }, { id: 'e2', amount: 9000 }, { id: 'e3', amount: 1, deletedAt: 1 }],
  }, calendar);
  assert.equal(draft.isDraft, true);
  assert.equal(draft.title, '9.26 서울랜드 바이킹 정산');
  assert.equal(draft.monthStr, '2026-09');
  assert.deepEqual(draft.participants, ['박영우', '송은혜']);
  assert.deepEqual(draft.participantRows.map(r => r.participantId), ['박영우', '송은혜']);
  assert.deepEqual(draft.checkedItemKeys, ['2026-09-26_e1_15000', '2026-09-26_e2_9000']);
});

test('without attendees everyone active is in; a bad date gives no draft', () => {
  const draft = buildSettlementDraftFromMeeting({ date: '2026-10-03' }, calendar);
  assert.deepEqual(draft.participants, ['박영우', '김유리', '송은혜']);
  assert.equal(draft.title, '10.3 정산');
  assert.equal(buildSettlementDraftFromMeeting({ date: 'x' }, calendar), null);
});
