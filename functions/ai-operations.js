'use strict';

// Server-side counterpart of the home operations inbox. It deliberately uses deterministic,
// auditable facts instead of asking a language model to invent priorities. The scheduled brief
// may describe a task, but it never edits a calendar or sends a message on anyone's behalf.

const DAY_MS = 24 * 60 * 60 * 1000;

function dateKey(value) {
  const match = String(value || '').match(/^(\d{4}-\d{2}-\d{2})$/);
  if (!match) return '';
  const date = new Date(`${match[1]}T00:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === match[1] ? match[1] : '';
}

function dayNumber(value) {
  const date = dateKey(value);
  if (!date) return Number.NaN;
  const [year, month, day] = date.split('-').map(Number);
  return Date.UTC(year, month - 1, day) / DAY_MS;
}

function asRows(value) {
  return Array.isArray(value) ? value : (value ? [value] : []);
}

function reservedKeys(cards) {
  const result = new Set();
  asRows(cards).forEach(card => {
    if (!card || card.deletedAt || card.removedAt || card.isDeleted) return;
    asRows(card && card.checkedItemKeys).forEach(key => result.add(String(key || '').trim()));
    if (card && card.checkedItems && typeof card.checkedItems === 'object') Object.keys(card.checkedItems).forEach(key => result.add(String(key || '').trim()));
  });
  return result;
}

function meetingRows(calendar) {
  const seen = new Set();
  return [calendar && calendar.confirmedMeeting, calendar && calendar.meetings, calendar && calendar.events]
    .flatMap(asRows)
    .filter(meeting => {
      const date = dateKey(meeting && (meeting.date || meeting.targetDate || meeting.id));
      if (!date || meeting.deletedAt || meeting.removedAt || meeting.isDeleted || seen.has(date)) return false;
      seen.add(date);
      return true;
    });
}

function meetingTitle(meeting) {
  return String(meeting && (meeting.title || meeting.name || meeting.note || meeting.label) || '일정').trim() || '일정';
}

function meetingHasPlace(meeting) {
  return ['place', 'placeName', 'location', 'address', 'venue'].some(key => String(meeting && meeting[key] || '').trim());
}

function matchingPlace(calendar, date) {
  return asRows(calendar && calendar.places).some(place => {
    if (!place || place.deletedAt || place.removedAt || place.isDeleted) return false;
    const normalize = value => {
      const match = String(value || '').match(/^(\d{4}|\d{2})[.-](\d{2})[.-](\d{2})$/);
      return match ? dateKey(`${match[1].length === 2 ? '20' : ''}${match[1]}-${match[2]}-${match[3]}`) : '';
    };
    const dates = [...String(place.memo || '').matchAll(/(?<!\d)(\d{4}|\d{2})[.-](\d{2})[.-](\d{2})(?!\d)/g)].map(match => normalize(match[0])).filter(Boolean);
    if (dates.includes(date)) return true;
    if (!dates.length && place.visitStatus === 'planned') return false;
    return [place.date, place.visitDate, place.meetingDate, place.targetDate].some(value => normalize(value) === date);
  });
}

function operation(id, priority, title, detail) {
  return { id, priority, title, detail };
}

const priorityRank = { urgent: 0, high: 1, medium: 2, low: 3 };

function buildCalendarOperations({ calendar = {}, dateKey: today, summary = {}, stale = false } = {}) {
  const nowDay = dayNumber(today);
  if (Number.isNaN(nowDay)) return [];
  const tasks = [];
  if (Number(summary.failed || 0) > 0) {
    tasks.push(operation('analysis-failed', 'high', '사진 분석 재확인', `사진 분석 ${Number(summary.failed)}건이 완료되지 않았습니다.`));
  }
  if (stale) tasks.push(operation('worker-stale', 'high', '분석 기기 연결 확인', '사진 분석 기기의 최근 상태가 26시간 이상 갱신되지 않았습니다.'));

  const participants = asRows(calendar.participants).filter(person => person && !person.deletedAt && !person.removedAt && !person.isDeleted);
  const participantIds = new Set(participants.map(person => String(typeof person === 'string' ? person : person.id || person.name || '').trim()).filter(Boolean));
  const availability = new Map();
  asRows(calendar.availabilities).filter(row => row && !row.deletedAt && !row.removedAt && !row.isDeleted).forEach(row => {
    const date = dateKey(row.date);
    const participantId = String(row.participantId || row.participant || row.name || '').trim();
    if (!date || !participantId) return;
    if (!availability.has(date)) availability.set(date, new Set());
    availability.get(date).add(participantId);
  });
  const reserved = reservedKeys(calendar.settlementCards);
  const claims = new Map();
  asRows(calendar.settlementCards).forEach((card, index) => reservedKeys([card]).forEach(key => {
    if (!claims.has(key)) claims.set(key, new Set());
    claims.get(key).add(String(card.id || index));
  }));
  const duplicateCount = [...claims.values()].filter(ids => ids.size > 1).length;
  if (duplicateCount) tasks.push(operation('settlement-duplicate-claims', 'urgent', '중복 정산 항목 확인', `동일한 지출 ${duplicateCount}건이 여러 정산 카드에 포함되어 있습니다. 삭제 전 카드를 비교해 주세요.`));
  meetingRows(calendar).forEach(meeting => {
    const date = dateKey(meeting.date || meeting.targetDate || meeting.id);
    const offset = dayNumber(date) - nowDay;
    const title = meetingTitle(meeting);
    if (meeting.confirmed !== false && offset >= 0 && offset <= 21 && !meetingHasPlace(meeting) && !matchingPlace(calendar, date)) {
      tasks.push(operation(`place:${date}`, offset <= 7 ? 'high' : 'medium', `${title} 장소 확인`, `${date} 일정에 연결된 장소가 없습니다. 장소를 등록하거나 일정에 연결해 주세요.`));
    }
    if (meeting.confirmed !== false && offset >= 0 && offset <= 14 && participantIds.size >= 2) {
      const answered = availability.get(date) || new Set();
      const missing = [...participantIds].filter(id => !answered.has(id)).length;
      if (missing) tasks.push(operation(`attendance:${date}`, offset <= 3 ? 'high' : 'medium', `${title} 참여 일정 확인`, `참여자 ${missing}명의 해당 날짜 일정이 등록되지 않았습니다. 불참을 뜻하지는 않습니다.`));
    }
    if (offset < 0 && offset >= -60) {
      const openExpenses = asRows(meeting.expenses).map((expense, index) => ({ expense, index }))
        .filter(({ expense }) => expense && !expense.deletedAt && !expense.removedAt && !expense.isDeleted && !expense.isSelfPay
          && !['income', 'carryover'].includes(expense.type) && !expense.isCarryover && Number.isFinite(Number(expense.amount)) && Number(expense.amount) > 0)
        .filter(({ expense, index }) => !reserved.has(`${date}_${expense.id || index}_${expense.amount || 0}`));
      const amount = openExpenses.reduce((total, { expense }) => total + Number(expense.amount || 0), 0);
      if (openExpenses.length && amount > 0) {
        tasks.push(operation(`settlement:${date}`, offset >= -14 ? 'high' : 'medium', `${title} 정산 만들기`, `정산 카드에 포함되지 않은 공동 지출 ${openExpenses.length}건(${Math.round(amount).toLocaleString()}원)이 있습니다.`));
      }
    }
  });
  return tasks.sort((a, b) => priorityRank[a.priority] - priorityRank[b.priority] || a.id.localeCompare(b.id)).slice(0, 6);
}

module.exports = { buildCalendarOperations };
