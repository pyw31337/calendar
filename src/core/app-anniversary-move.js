// Moving a calendar anniversary badge to another date by drag and drop: which badges can move,
// which fields a move changes (and their old values for 되돌리기), and the confirm sentence.
import KoreanLunarCalendar from 'korean-lunar-calendar';
import { isCultureLinkedAnniversary } from './app-anniversary-dates.js';

// Which calendar badges can be dragged to another date: one-day, yearly (birthdays, also lunar)
// and multi-day (연일) anniversaries, plus content-linked ones. A D-day milestone badge and a
// repeat rule (매월 셋째주 수요일) are derived from a rule, so there is no single date to move.
export function isMovableAnniversary(ann) {
  if (!ann) return false;
  if (isCultureLinkedAnniversary(ann)) return true;
  if (ann.type === 'range') return Boolean(ann.startDate && ann.endDate);
  return ann.type === 'once' || ann.type === 'yearly';
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const pad2 = value => String(value).padStart(2, '0');
function shiftDateStr(dateStr, days) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const moved = new Date(Date.UTC(y, m - 1, d + days));
  return `${moved.getUTCFullYear()}-${pad2(moved.getUTCMonth() + 1)}-${pad2(moved.getUTCDate())}`;
}
function daysBetween(fromStr, toStr) {
  const toUtc = value => { const [y, m, d] = value.split('-').map(Number); return Date.UTC(y, m - 1, d); };
  return Math.round((toUtc(toStr) - toUtc(fromStr)) / 86400000);
}

/**
 * The fields that move `ann` from the calendar cell it was dragged from (sourceDate) to
 * targetDate, and the same fields' current values for 되돌리기: `{ patch, previous, kind }`, or
 * null when it cannot move. A 연일 anniversary moves as a whole (its length stays), a yearly one
 * changes its every-year date, and a lunar one keeps counting in lunar dates.
 */
export function planAnniversaryMove(ann, sourceDate, targetDate) {
  if (!isMovableAnniversary(ann) || !DATE_RE.test(String(sourceDate || '')) || !DATE_RE.test(String(targetDate || '')) || sourceDate === targetDate) return null;
  let kind = ann.type;
  let patch;
  if (isCultureLinkedAnniversary(ann)) {
    kind = 'once';
    patch = { type: 'once', date: targetDate, isLunar: false, isLeap: false };
  } else if (ann.type === 'range') {
    const delta = daysBetween(sourceDate, targetDate);
    patch = { startDate: shiftDateStr(ann.startDate, delta), endDate: shiftDateStr(ann.endDate, delta) };
  } else if (ann.isLunar) {
    const [ty, tm, td] = targetDate.split('-').map(Number);
    const cal = new KoreanLunarCalendar();
    if (!cal.setSolarDate(ty, tm, td)) return null;
    const lunar = cal.getLunarCalendar();
    if (!lunar || !lunar.month || !lunar.day) return null;
    patch = {
      date: ann.type === 'yearly' ? `${pad2(lunar.month)}-${pad2(lunar.day)}` : `${lunar.year}-${pad2(lunar.month)}-${pad2(lunar.day)}`,
      isLeap: Boolean(lunar.intercalation)
    };
  } else {
    patch = { date: ann.type === 'yearly' ? targetDate.slice(5) : targetDate };
  }
  const previous = {};
  Object.keys(patch).forEach(key => {
    if (key === 'type') previous.type = ann.type || 'once';
    else previous[key] = ann[key] === undefined ? (typeof patch[key] === 'boolean' ? false : null) : ann[key];
  });
  return { patch, previous, kind, lunar: Boolean(ann.isLunar) && !isCultureLinkedAnniversary(ann) && ann.type !== 'range' };
}

// 을/를 and 으로/로 after a word, read from its last Hangul syllable (brackets, spaces and
// punctuation at the end are skipped: "2026.10.10 (토)" reads 토 -> 로). Digits read as Korean
// numbers; anything else falls back to the neutral 을(를)/(으)로.
const DIGIT_FINAL = { 0: 21, 1: 8, 2: 0, 3: 16, 4: 0, 5: 0, 6: 1, 7: 8, 8: 8, 9: 0 };
function finalConsonantOf(word) {
  const chars = [...String(word || '')].reverse();
  for (const ch of chars) {
    const code = ch.charCodeAt(0);
    if (code >= 0xAC00 && code <= 0xD7A3) return (code - 0xAC00) % 28;
    if (ch >= '0' && ch <= '9') return DIGIT_FINAL[ch];
    if (/[\s)\]}>»”"'’.,!?~·-]/.test(ch)) continue;
    return -1;
  }
  return -1;
}
export function withObjectParticle(word) {
  const jong = finalConsonantOf(word);
  return `${word}${jong < 0 ? '을(를)' : jong > 0 ? '을' : '를'}`;
}
export function withDirectionParticle(word) {
  const jong = finalConsonantOf(word);
  return `${word}${jong < 0 ? '(으)로' : jong === 0 || jong === 8 ? '로' : '으로'}`;
}

// The confirm sentence for a planned move. formatDate renders a YYYY-MM-DD for people.
export function describeAnniversaryMove(name, sourceDate, targetDate, plan, formatDate = value => value) {
  const head = `${withObjectParticle(`“${name || '기념일'}”`)} ${formatDate(sourceDate)}에서 ${withDirectionParticle(formatDate(targetDate))} 옮기시겠습니까?`;
  if (!plan) return head;
  if (plan.kind === 'range') return `${head} 기간 전체를 ${withDirectionParticle(`${formatDate(plan.patch.startDate)} ~ ${formatDate(plan.patch.endDate)}`)} 옮깁니다.`;
  if (plan.lunar) {
    const [month, day] = String(plan.patch.date || '').split('-').slice(-2).map(Number);
    const lunarLabel = `음력 ${plan.patch.isLeap ? '윤' : ''}${month}월 ${day}일`;
    return plan.kind === 'yearly'
      ? `${head} 음력 기념일이라 해마다 ${withDirectionParticle(lunarLabel)} 바뀝니다.`
      : `${head} 음력 날짜는 ${withDirectionParticle(lunarLabel)} 바뀝니다.`;
  }
  if (plan.kind === 'yearly') return `${head} 매년 반복되는 기념일이라 해마다 이 날짜로 바뀝니다.`;
  return head;
}
