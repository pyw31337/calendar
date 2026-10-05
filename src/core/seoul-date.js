/** Asia/Seoul YYYY-MM-DD keys via Intl (not device TZ / not UTC). */
export const SEOUL_TIME_ZONE = 'Asia/Seoul';
const SEOUL_YMD = new Intl.DateTimeFormat('en-CA', {
  timeZone: SEOUL_TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit'
});
export function seoulDateKey(input = new Date()) {
  const date = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(date.getTime())) return '';
  try { return SEOUL_YMD.format(date); }
  catch (_) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }
}
export function todaySeoulDateKey(now = new Date()) { return seoulDateKey(now); }
export function addDaysToDateKey(dateKey, days) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(dateKey || ''));
  if (!match) return '';
  const utc = Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]), 12, 0, 0);
  const shifted = new Date(utc + Number(days) * 86400000);
  return `${shifted.getUTCFullYear()}-${String(shifted.getUTCMonth() + 1).padStart(2, '0')}-${String(shifted.getUTCDate()).padStart(2, '0')}`;
}
export function seoulMonthKey(input = new Date()) {
  const day = seoulDateKey(input);
  return day ? day.slice(0, 7) : '';
}
export function diffDaysFromSeoulToday(dateKey, now = new Date()) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(dateKey || ''));
  if (!match) return null;
  const today = seoulDateKey(now);
  if (!today) return null;
  const targetUtc = Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]), 12, 0, 0);
  const [ty, tm, td] = today.split('-').map(Number);
  return Math.round((targetUtc - Date.UTC(ty, tm - 1, td, 12, 0, 0)) / 86400000);
}
export function seoulHour(input = new Date()) {
  const date = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(date.getTime())) return NaN;
  try {
    const hour = new Intl.DateTimeFormat('en-US', {
      timeZone: SEOUL_TIME_ZONE, hour: 'numeric', hour12: false
    }).formatToParts(date).find(p => p.type === 'hour');
    const n = Number(hour && hour.value);
    return n === 24 ? 0 : n;
  } catch (_) { return date.getHours(); }
}
