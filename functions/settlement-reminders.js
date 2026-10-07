// Settlement pushes (index.js onCalendarDocWrite and sendSettlementReminders).
// Pure so it is unit-tested (test/settlement-reminders.test.mjs).
//
// Cards are stored on the calendar document as calendar.settlementCards.
// There is no per-person paid flag. status stays 'active' (진행중) until someone
// marks the card 마감 (status: 'closed'). deletedAt is a tombstone, not an open card.
// createdAt is the only timestamp a card is guaranteed to have (ISO string from the
// editor, or epoch millis if a later save filled it in). That is the clock for
// the day-3 and day-5 reminders. Cards do not store who created them.

const REMINDER_DAY_OFFSETS = [3, 5];

function cardCreatedAt(card) {
  const raw = card && card.createdAt;
  const value = typeof raw === 'number' ? raw : Date.parse(String(raw || ''));
  return Number.isFinite(value) ? value : 0;
}

// Civil date in Asia/Seoul, as a day count. Diffs are calendar days, not elapsed hours.
function seoulDayNumber(ms) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(new Date(ms));
  const year = Number(parts.find(part => part.type === 'year').value);
  const month = Number(parts.find(part => part.type === 'month').value);
  const day = Number(parts.find(part => part.type === 'day').value);
  return Math.floor(Date.UTC(year, month - 1, day) / 86400000);
}

function isOpenUnpaid(card) {
  return Boolean(card) && !card.deletedAt && card.status !== 'closed';
}

function cardTitle(card) {
  return String((card && card.title) || '정산').trim().slice(0, 40) || '정산';
}

// A card id that was not on the document before is a new registration.
// The caller claims settlement_<id> once, so a later rewrite of the same card
// does not push again. Closed or deleted cards are not news.
function planNewSettlementNotifications(beforeCards, afterCards) {
  const before = Array.isArray(beforeCards) ? beforeCards : [];
  const after = Array.isArray(afterCards) ? afterCards : [];
  const beforeIds = new Set(before.filter(card => card && card.id).map(card => String(card.id)));
  return after.filter(card => isOpenUnpaid(card) && card.id && !beforeIds.has(String(card.id))).map(card => {
    const id = String(card.id);
    const title = cardTitle(card);
    return {
      id,
      title,
      body: `'${title}' 정산이 등록되었습니다.`,
      claimKey: `settlement_${id}`,
      // Only if a creator id is actually stored. Today's cards have none, so this stays null
      // and the push reaches every device, which is what the old settlement reminder did.
      skipParticipantId: card.createdBy || card.authorId || null
    };
  });
}

// One notice on the Seoul date 3 days after createdAt, and one on the date 5 days after.
// Any other day, a closed card, a deleted card, or a card with no createdAt plans nothing.
function planSettlementReminders(calendar, now = Date.now()) {
  const cards = Array.isArray(calendar && calendar.settlementCards) ? calendar.settlementCards : [];
  const today = seoulDayNumber(now);
  return cards.filter(isOpenUnpaid).flatMap(card => {
    const created = cardCreatedAt(card);
    if (!created) return [];
    const days = today - seoulDayNumber(created);
    if (!REMINDER_DAY_OFFSETS.includes(days)) return [];
    const id = String(card.id || '');
    const title = cardTitle(card);
    return [{
      id,
      title,
      days,
      claimKey: `settlement_${id}_day${days}`,
      body: `'${title}' 정산 입금이 아직이에요. 등록 후 ${days}일째입니다. 입금이 끝났으면 마감해 주세요.`
    }];
  });
}

module.exports = {
  planSettlementReminders,
  planNewSettlementNotifications,
  REMINDER_DAY_OFFSETS,
  seoulDayNumber
};
