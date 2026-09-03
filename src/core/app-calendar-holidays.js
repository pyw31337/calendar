// ---- Korean public holidays, substitute holidays, and 24 solar terms ----
// Base facts are hardcoded (fixed-date holidays; lunar-holiday solar dates, verified
// against Wikipedia's "Public holidays in South Korea" 1994-2050 table); consequences
// (대체공휴일) are computed from the legal rule so edge cases self-correct.
//
// Split out of app-main.js (2026-09-03, docs/split-plan.md 15단계 방식): this whole block is
// pure date/holiday math with no React or component-state dependency, so it moves as a unit
// with no behavior change -- app-main.js keeps calling the same functions, just via import
// instead of same-file definition.

// Solar-date anchors for lunar-based holidays (설날/추석/부처님오신날), 2021-2032.
const GATHER_APP_CALENDAR_DATA = window.GATHER_APP_CALENDAR_DATA || {};
const KOREAN_LUNAR_HOLIDAY_DATES = GATHER_APP_CALENDAR_DATA.KOREAN_LUNAR_HOLIDAY_DATES || {
  2021: { seollal: '2021-02-12', chuseok: '2021-09-21', buddha: '2021-05-19' },
  2022: { seollal: '2022-02-01', chuseok: '2022-09-10', buddha: '2022-05-08' },
  2023: { seollal: '2023-01-22', chuseok: '2023-09-29', buddha: '2023-05-27' },
  2024: { seollal: '2024-02-10', chuseok: '2024-09-17', buddha: '2024-05-15' },
  2025: { seollal: '2025-01-29', chuseok: '2025-10-06', buddha: '2025-05-05' },
  2026: { seollal: '2026-02-17', chuseok: '2026-09-25', buddha: '2026-05-24' },
  2027: { seollal: '2027-02-07', chuseok: '2027-09-15', buddha: '2027-05-13' },
  2028: { seollal: '2028-01-27', chuseok: '2028-10-03', buddha: '2028-05-02' },
  2029: { seollal: '2029-02-13', chuseok: '2029-09-22', buddha: '2029-05-20' },
  2030: { seollal: '2030-02-03', chuseok: '2030-09-12', buddha: '2030-05-09' },
  2031: { seollal: '2031-01-23', chuseok: '2031-10-01', buddha: '2031-05-28' },
  2032: { seollal: '2032-02-11', chuseok: '2032-09-19', buddha: '2032-05-16' }
};

// One-off government-designated days off (임시공휴일) - not derivable from the standing law.
const KOREAN_TEMPORARY_HOLIDAYS = Array.isArray(GATHER_APP_CALENDAR_DATA.KOREAN_TEMPORARY_HOLIDAYS) ? GATHER_APP_CALENDAR_DATA.KOREAN_TEMPORARY_HOLIDAYS : [{ date: '2023-10-02', name: '임시공휴일' }, { date: '2025-01-27', name: '임시공휴일' }];

// subType controls 대체공휴일 eligibility: 'weekend' = substitute if Sat or Sun,
// 'sunday' = substitute if Sun only (설날/추석), 'none' = never substitutes.
// fromYear = the holiday itself didn't exist/wasn't a red day before that year.
// subFromYear = the holiday already existed, but only became substitute-eligible
// from that year (관공서의 공휴일에 관한 규정 개정 이력: 삼일절/광복절/개천절/한글날
// 대체공휴일 2021년 확대 시행, 부처님오신날/성탄절은 2023년부터 확대 적용).
const KOREAN_FIXED_HOLIDAYS = Array.isArray(GATHER_APP_CALENDAR_DATA.KOREAN_FIXED_HOLIDAYS) ? GATHER_APP_CALENDAR_DATA.KOREAN_FIXED_HOLIDAYS : [{ month: 1, day: 1, name: '신정', subType: 'none' }, { month: 3, day: 1, name: '삼일절', subType: 'weekend', subFromYear: 2022 }, { month: 5, day: 5, name: '어린이날', subType: 'weekend' }, { month: 6, day: 6, name: '현충일', subType: 'none' }, { month: 7, day: 17, name: '제헌절', subType: 'weekend', fromYear: 2026 }, { month: 8, day: 15, name: '광복절', subType: 'weekend', subFromYear: 2021 }, { month: 10, day: 3, name: '개천절', subType: 'weekend', subFromYear: 2021 }, { month: 10, day: 9, name: '한글날', subType: 'weekend', subFromYear: 2021 }, { month: 12, day: 25, name: '성탄절', subType: 'weekend', subFromYear: 2023 }, { month: 5, day: 1, name: '노동절', subType: 'none', fromYear: 2026 }];

export function koreanYmd(y, m, d) {
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}
export function koreanDateStrToDate(s) {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}
export function koreanAddDays(s, n) {
  const dt = koreanDateStrToDate(s);
  dt.setDate(dt.getDate() + n);
  return koreanYmd(dt.getFullYear(), dt.getMonth() + 1, dt.getDate());
}
export function koreanDayOfWeek(s) {
  return koreanDateStrToDate(s).getDay();
}

export function getKoreanHolidayEntriesForYear(year) {
  const entries = [];
  KOREAN_FIXED_HOLIDAYS.forEach(h => {
    if (h.fromYear && year < h.fromYear) return;
    const subType = h.subFromYear && year < h.subFromYear ? 'none' : h.subType;
    entries.push({ date: koreanYmd(year, h.month, h.day), name: h.name, subType, groupId: `${h.name}-${year}` });
  });
  KOREAN_TEMPORARY_HOLIDAYS.forEach(h => {
    if (h.date.startsWith(`${year}-`)) {
      entries.push({ date: h.date, name: h.name, subType: 'none', groupId: `temp-${h.date}` });
    }
  });
  const lunar = KOREAN_LUNAR_HOLIDAY_DATES[year];
  if (lunar) {
    const seollalGroup = `seollal-${year}`;
    entries.push({ date: koreanAddDays(lunar.seollal, -1), name: '설날 연휴', subType: 'sunday', groupId: seollalGroup });
    entries.push({ date: lunar.seollal, name: '설날', subType: 'sunday', groupId: seollalGroup });
    entries.push({ date: koreanAddDays(lunar.seollal, 1), name: '설날 연휴', subType: 'sunday', groupId: seollalGroup });
    const chuseokGroup = `chuseok-${year}`;
    entries.push({ date: koreanAddDays(lunar.chuseok, -1), name: '추석 연휴', subType: 'sunday', groupId: chuseokGroup });
    entries.push({ date: lunar.chuseok, name: '추석', subType: 'sunday', groupId: chuseokGroup });
    entries.push({ date: koreanAddDays(lunar.chuseok, 1), name: '추석 연휴', subType: 'sunday', groupId: chuseokGroup });
    entries.push({ date: lunar.buddha, name: '부처님오신날', subType: year >= 2023 ? 'weekend' : 'none', groupId: `buddha-${year}` });
  }
  return entries;
}

// Computes the full holiday list for a year, including programmatically-derived
// 대체공휴일 (substitute holidays). Overlapping holidays (same exact date, e.g.
// 어린이날+부처님오신날 in 2025) and weekend-triggered holidays are merged into a
// single component via union-find so only ONE substitute is granted per triggering
// event, matching the actual legal rule.
export function computeKoreanHolidaysForYear(year) {
  const entries = getKoreanHolidayEntriesForYear(year);
  const parent = entries.map((_, i) => i);
  function find(x) { while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x]; } return x; }
  function union(a, b) { const ra = find(a), rb = find(b); if (ra !== rb) parent[ra] = rb; }
  const groupIdxMap = {};
  entries.forEach((e, i) => { (groupIdxMap[e.groupId] = groupIdxMap[e.groupId] || []).push(i); });
  Object.values(groupIdxMap).forEach(idxs => { for (let i = 1; i < idxs.length; i++) union(idxs[0], idxs[i]); });
  const dateIdxMap = {};
  entries.forEach((e, i) => { (dateIdxMap[e.date] = dateIdxMap[e.date] || []).push(i); });
  Object.values(dateIdxMap).forEach(idxs => { for (let i = 1; i < idxs.length; i++) union(idxs[0], idxs[i]); });
  const components = {};
  entries.forEach((e, i) => { const r = find(i); (components[r] = components[r] || []).push(e); });

  const occupied = new Set(entries.map(e => e.date));
  const substitutes = [];
  Object.values(components).forEach(comp => {
    let triggered = false;
    comp.forEach(e => {
      if (e.subType === 'none') return;
      const dow = koreanDayOfWeek(e.date);
      if (e.subType === 'weekend' && (dow === 0 || dow === 6)) triggered = true;
      if (e.subType === 'sunday' && dow === 0) triggered = true;
    });
    if (!triggered) {
      const byDate = {};
      comp.forEach(e => { (byDate[e.date] = byDate[e.date] || []).push(e); });
      Object.values(byDate).forEach(list => {
        if (list.length > 1 && list.some(e => e.subType !== 'none')) triggered = true;
      });
    }
    if (!triggered || !comp.some(e => e.subType !== 'none')) return;
    const lastDate = comp.map(e => e.date).sort().slice(-1)[0];
    let cand = koreanAddDays(lastDate, 1);
    while (true) {
      const dow = koreanDayOfWeek(cand);
      if (dow !== 0 && dow !== 6 && !occupied.has(cand)) break;
      cand = koreanAddDays(cand, 1);
    }
    occupied.add(cand);
    const label = [...new Set(comp.map(e => e.name.replace(' 연휴', '')))].join('·');
    substitutes.push({ date: cand, name: `대체공휴일(${label})` });
  });

  return entries.concat(substitutes);
}

// Single-date holiday name lookup (e.g. for DateModal's header) -- CalendarGrid's own
// holidayMap is memoized per rendered month range, which isn't available outside that
// component, so this recomputes just the one year a given date falls in.
export function getHolidayNamesForDate(dateStr) {
  if (!dateStr) return [];
  const year = parseInt(dateStr.slice(0, 4), 10);
  if (!year) return [];
  return computeKoreanHolidaysForYear(year).filter(e => e.date === dateStr).map(e => e.name);
}

// 24 solar terms (24절기) via the standard low-precision solar-longitude formula
// (Meeus/USNO, ~0.01deg accuracy). Validated against 19 KASI-derived reference
// dates spanning 2025-2027 with zero mismatches; no external data table needed.
const KOREAN_SOLAR_TERMS = Array.isArray(GATHER_APP_CALENDAR_DATA.KOREAN_SOLAR_TERMS) ? GATHER_APP_CALENDAR_DATA.KOREAN_SOLAR_TERMS : [['소한', 285], ['대한', 300], ['입춘', 315], ['우수', 330], ['경칩', 345], ['춘분', 0], ['청명', 15], ['곡우', 30], ['입하', 45], ['소만', 60], ['망종', 75], ['하지', 90], ['소서', 105], ['대서', 120], ['입추', 135], ['처서', 150], ['백로', 165], ['추분', 180], ['한로', 195], ['상강', 210], ['입동', 225], ['소설', 240], ['대설', 255], ['동지', 270]];

function koreanJulianDayUTC(year, month, day, hourUTC) {
  let y = year, m = month;
  if (m <= 2) { y -= 1; m += 12; }
  const A = Math.floor(y / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + B - 1524.5 + hourUTC / 24;
}
function koreanSunEclipticLongitudeDeg(jd) {
  const D = jd - 2451545.0;
  let L = 280.460 + 0.9856474 * D;
  let g = 357.528 + 0.9856003 * D;
  L = ((L % 360) + 360) % 360;
  g = ((g % 360) + 360) % 360;
  const gRad = g * Math.PI / 180;
  const lambda = L + 1.915 * Math.sin(gRad) + 0.020 * Math.sin(2 * gRad);
  return ((lambda % 360) + 360) % 360;
}
function koreanLongitudeAtKstMidnight(year, month, day) {
  // KST 00:00 of (y,m,d) = UTC previous-day 15:00, i.e. 9 hours before that date's 00:00 UTC.
  return koreanSunEclipticLongitudeDeg(koreanJulianDayUTC(year, month, day, -9));
}
function findKoreanSolarTermDate(year, targetDeg) {
  let cur = { y: year - 1, m: 12, d: 15 };
  let prevUnwrapped = koreanLongitudeAtKstMidnight(cur.y, cur.m, cur.d);
  let offset = 0;
  for (let i = 0; i < 400; i++) {
    const nextStr = koreanAddDays(koreanYmd(cur.y, cur.m, cur.d), 1);
    const [ny, nm, nd] = nextStr.split('-').map(Number);
    const next = { y: ny, m: nm, d: nd };
    let lon = koreanLongitudeAtKstMidnight(next.y, next.m, next.d);
    let unwrapped = lon + offset;
    if (unwrapped < prevUnwrapped - 1) { offset += 360; unwrapped = lon + offset; }
    for (let k = -1; k <= 2; k++) {
      const tgt = targetDeg + k * 360;
      // The crossing happens sometime during the KST calendar day "cur" (between cur's
      // and next's KST midnights), so the term always falls on `cur`, not `next`.
      if (prevUnwrapped <= tgt && tgt < unwrapped && cur.y === year) {
        return cur;
      }
    }
    prevUnwrapped = unwrapped;
    cur = next;
  }
  return null;
}
export function getKoreanSolarTermsForYear(year) {
  const map = {};
  KOREAN_SOLAR_TERMS.forEach(([name, deg]) => {
    const r = findKoreanSolarTermDate(year, deg);
    if (r) map[koreanYmd(r.y, r.m, r.d)] = name;
  });
  return map;
}
