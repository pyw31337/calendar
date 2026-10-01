// Weekly "정산이 아직 진행 중" push (index.js sendSettlementReminders). Pure so it is unit-tested
// (test/settlement-reminders.test.mjs).
//
// A settlement card has no per-person paid flag; `status: 'active'` (진행중) until someone marks it
// 마감. A card still active a few days after it was created is the one people forget, so it is
// mentioned once a week until it is closed or deleted.
const MIN_OPEN_DAYS = 3;
const DAY_MS = 24 * 60 * 60 * 1000;

function cardCreatedAt(card) {
  const raw = card && card.createdAt;
  const value = typeof raw === 'number' ? raw : Date.parse(String(raw || ''));
  return Number.isFinite(value) ? value : 0;
}

function planSettlementReminders(calendar, now = Date.now()) {
  const cards = Array.isArray(calendar && calendar.settlementCards) ? calendar.settlementCards : [];
  return cards
    .filter(card => card && !card.deletedAt && card.status !== 'closed')
    .map(card => ({ card, days: Math.floor((now - cardCreatedAt(card)) / DAY_MS) }))
    .filter(({ card, days }) => cardCreatedAt(card) > 0 && days >= MIN_OPEN_DAYS)
    .map(({ card, days }) => ({
      id: String(card.id || ''),
      title: String(card.title || '정산'),
      days,
      body: `'${String(card.title || '정산').slice(0, 40)}' 정산이 ${days}일째 진행 중이에요. 입금이 끝났으면 마감해 주세요.`,
    }));
}

module.exports = { planSettlementReminders, MIN_OPEN_DAYS };
