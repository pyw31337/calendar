// ---- Anniversary date matching, category badges, lunar conversion ----
// Split out of app-main.js (2026-09-10, docs/split-plan.md 15단계 방식): this block is
// pure date/badge math with no React or component-state dependency. getAnniversaryDisplayColor
// stays in app-main.js because it needs getActiveParticipants.

export function isRepeatAnniversaryOnDate(ann, dateStr) {
  if (!ann || ann.type !== 'repeat' || !dateStr) return false;
  if (ann.startDate && dateStr < ann.startDate) return false;
  if (ann.endDate && dateStr > ann.endDate) return false;
  const parts = dateStr.split('-').map(Number);
  const y = parts[0], m = parts[1], d = parts[2];
  if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(d)) return false;
  const weekOfMonth = Math.ceil(d / 7);
  const dow = new Date(y, m - 1, d).getDay();
  const weekSet = new Set((Array.isArray(ann.weeks) ? ann.weeks : []).map(Number));
  const daySet = new Set((Array.isArray(ann.weekdays) ? ann.weekdays : []).map(Number));
  return weekSet.has(weekOfMonth) && daySet.has(dow);
}

export function getAnniversariesForDate(dateStr, anniversariesList) {
  if (!dateStr || !Array.isArray(anniversariesList)) return [];
  const [y, m, d] = dateStr.split('-').map(Number);
  if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(d)) return [];

  // DateModal's expanded banner + lightbox need place/description/photos/timestamps on every
  // matching anniversary, not only range/festival entries. Keep calendar-grid fields (title/
  // badgeColor/icon) and layer the detail fields from the source doc.
  const withAnnDetail = (base, ann) => ({
    ...base,
    type: base.type || ann.type,
    date: ann.date,
    targetDate: ann.targetDate,
    isCountDown: ann.isCountDown,
    isLunar: ann.isLunar,
    isLeap: ann.isLeap,
    startDate: base.startDate || ann.startDate,
    endDate: base.endDate || ann.endDate,
    place: ann.place,
    description: ann.description,
    photos: ann.photos,
    createdAt: ann.createdAt,
    updatedAt: ann.updatedAt,
    category: ann.category
  });

  const results = [];
  anniversariesList.forEach(ann => {
    if (!ann || typeof ann !== 'object') return;
    if (ann.type === 'yearly') {
      if (!ann.date || typeof ann.date !== 'string') return;
      if (ann.isLunar) {
        try {
          const cal = new KoreanLunarCalendar();
          const [lunarM, lunarD] = ann.date.split('-').map(Number);
          if (Number.isFinite(lunarM) && Number.isFinite(lunarD)) {
            cal.setLunarDate(y, lunarM, lunarD, !!ann.isLeap);
            const solar = cal.getSolarCalendar();
            if (solar && solar.year === y && solar.month === m && solar.day === d) {
              const yearlyCatBadge = getAnniversaryCategoryBadge(ann.category, ann.genre);
              results.push(withAnnDetail({
                id: ann.id,
                title: `${ann.title || ''} (음)`,
                badgeColor: yearlyCatBadge.badgeColor,
                icon: yearlyCatBadge.icon,
                type: 'yearly'
              }, ann));
            }
          }
        } catch (e) {
          console.warn('Lunar date calculation failed for', ann.title, e);
        }
      } else {
        const [solarM, solarD] = ann.date.split('-').map(Number);
        if (solarM === m && solarD === d) {
          const yearlyCatBadge = getAnniversaryCategoryBadge(ann.category, ann.genre);
          results.push(withAnnDetail({
            id: ann.id,
            title: `${ann.title || ''}`,
            badgeColor: yearlyCatBadge.badgeColor,
            icon: yearlyCatBadge.icon,
            type: 'yearly'
          }, ann));
        }
      }
    } else if (ann.type === 'dday') {
      const targetStr = ann.targetDate;
      if (!targetStr || typeof targetStr !== 'string') return;
      if (targetStr === dateStr) {
        results.push(withAnnDetail({
          id: ann.id,
          title: `${ann.title || ''} (D-Day)`,
          badgeColor: '#3B82F6',
          icon: '🎁',
          type: 'dday'
        }, ann));
      } else {
        const tDate = new Date(`${targetStr}T00:00:00`);
        const cDate = new Date(`${dateStr}T00:00:00`);
        if (Number.isNaN(tDate.getTime()) || Number.isNaN(cDate.getTime())) return;
        const diffMs = cDate.getTime() - tDate.getTime();
        const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
        
        if (ann.isCountDown) {
          if (diffDays < 0) {
            const daysLeft = Math.abs(diffDays);
            if (daysLeft === 100 || daysLeft === 50 || daysLeft === 10 || daysLeft === 30) {
              results.push(withAnnDetail({
                id: ann.id,
                title: `${ann.title || ''} D-${daysLeft}`,
                badgeColor: '#6366F1',
                icon: '📅',
                type: 'dday'
              }, ann));
            }
          }
        } else {
          if (diffDays === 99) {
            results.push(withAnnDetail({
              id: ann.id,
              title: `${ann.title || ''} 100일`,
              badgeColor: '#EC4899',
              icon: '💖',
              type: 'dday'
            }, ann));
          } else if (diffDays === 199) {
            results.push(withAnnDetail({
              id: ann.id,
              title: `${ann.title || ''} 200일`,
              badgeColor: '#EC4899',
              icon: '💖',
              type: 'dday'
            }, ann));
          } else if (diffDays === 299) {
            results.push(withAnnDetail({
              id: ann.id,
              title: `${ann.title || ''} 300일`,
              badgeColor: '#EC4899',
              icon: '💖',
              type: 'dday'
            }, ann));
          } else if (diffDays === 364) {
            results.push(withAnnDetail({
              id: ann.id,
              title: `${ann.title || ''} 1주년`,
              badgeColor: '#EC4899',
              icon: '🎉',
              type: 'dday'
            }, ann));
          } else if (diffDays > 0 && diffDays % 365 === 364) {
            const years = Math.round((diffDays + 1) / 365);
            results.push(withAnnDetail({
              id: ann.id,
              title: `${ann.title || ''} ${years}주년`,
              badgeColor: '#EC4899',
              icon: '🎉',
              type: 'dday'
            }, ann));
          }
        }
      }
    } else if (ann.type === 'once') {
      // Non-repeating single-day anniversary (a specific YYYY-MM-DD, optionally lunar).
      if (!ann.date || typeof ann.date !== 'string') return;
      const [onceY, onceM, onceD] = ann.date.split('-').map(Number);
      if (!Number.isFinite(onceY) || !Number.isFinite(onceM) || !Number.isFinite(onceD)) return;
      const catBadge = getAnniversaryCategoryBadge(ann.category, ann.genre);
      if (ann.isLunar) {
        try {
          const cal = new KoreanLunarCalendar();
          cal.setLunarDate(onceY, onceM, onceD, !!ann.isLeap);
          const solar = cal.getSolarCalendar();
          if (solar && solar.year === y && solar.month === m && solar.day === d) {
            results.push(withAnnDetail({
              id: ann.id,
              title: `${ann.title || ''} (음)`,
              badgeColor: catBadge.badgeColor,
              icon: catBadge.icon,
              type: 'once'
            }, ann));
          }
        } catch (e) {
          console.warn('Lunar date calculation failed for', ann.title, e);
        }
      } else if (onceY === y && onceM === m && onceD === d) {
        results.push(withAnnDetail({
          id: ann.id,
          title: `${ann.title || ''}`,
          badgeColor: catBadge.badgeColor,
          icon: catBadge.icon,
          type: 'once'
        }, ann));
      }
    } else if (ann.type === 'range') {
      // Multi-day (연일) event/festival spanning a start/end date range. type/startDate/endDate
      // are kept on the result (unlike the other branches above) so the calendar grid can tell
      // a spanning festival apart from a single-day anniversary and render it as one connected
      // bar across the days it covers instead of a separate badge repeated on each day. place/
      // description/photos are also carried through -- DateModal's expanded festival banner
      // reads these directly, and without them here it could only ever show a title and date
      // range no matter how much detail the anniversary itself actually had saved.
      if (!ann.startDate || !ann.endDate) return;
      if (dateStr >= ann.startDate && dateStr <= ann.endDate) {
        const catBadge = getAnniversaryCategoryBadge(ann.category, ann.genre);
        results.push(withAnnDetail({
          id: ann.id,
          title: `${ann.title || ''}`,
          badgeColor: catBadge.badgeColor,
          icon: catBadge.icon,
          type: 'range',
          startDate: ann.startDate,
          endDate: ann.endDate,
          place: ann.place,
          description: ann.description,
          photos: ann.photos
        }, ann));
      }
    } else if (ann.type === 'repeat') {
      // Monthly nth-weekday rules saved from the 반복 tab (e.g. 매월 셋째주 수요일). Same
      // weekOfMonth = ceil(day/7) + weekday match used when bulk-registering dates.
      if (!isRepeatAnniversaryOnDate(ann, dateStr)) return;
      const catBadge = getAnniversaryCategoryBadge(ann.category || 'other', ann.genre);
      results.push(withAnnDetail({
        id: ann.id,
        title: `${ann.title || ann.patternLabel || '반복 일정'}`,
        badgeColor: catBadge.badgeColor,
        icon: catBadge.icon,
        type: 'repeat',
        startDate: ann.startDate,
        endDate: ann.endDate,
        weeks: ann.weeks,
        weekdays: ann.weekdays,
        patternLabel: ann.patternLabel
      }, ann));
    }
  });
  return results;
}

// Badge color/icon for the newer category-tagged anniversary types ('once', 'range'). Legacy
// 'yearly'/'dday' entries predate the category field and keep their original hardcoded look above
// so nothing already saved changes appearance.
// 종목(genre)별 아이콘 -- culture-sports.json의 raw genre 코드(handleRegisterCultureEvent가
// 등록 시 ann.genre로 그대로 복사해 둠). 매칭되는 종목이 없으면(레거시 데이터, 혹은 목록에
// 없는 새 종목) 야구/축구를 대표하는 기존 공 아이콘으로 대체한다.
export const SPORTS_GENRE_ICONS = {
  baseball: '⚾', basketball: '🏀', volleyball: '🏐', soccer: '⚽', handball: '🤾'
};
export function getAnniversaryCategoryBadge(category, genre) {
  const map = {
    birthday: { badgeColor: '#EF4444', icon: '🎂' },
    event: { badgeColor: '#3B82F6', icon: '🎈' },
    festival: { badgeColor: '#F59E0B', icon: '🎉' },
    sports: { badgeColor: '#0EA5E9', icon: SPORTS_GENRE_ICONS[genre] || '⚽' },
    movie: { badgeColor: '#8B5CF6', icon: '🎬' },
    travel: { badgeColor: '#10B981', icon: '✈️' },
    other: { badgeColor: '#6B7280', icon: '💬' }
  };
  // No category (anniversaries saved before this field existed) keeps the original cake/red
  // look every 'yearly' anniversary had prior to categories -- never map.other here.
  return map[category] || map.birthday;
}

// Signed day-count from today to targetDateStr (positive = future, negative = past),
// local-midnight based to match formatDDayLabel's convention.
export function calculateDday(targetDateStr) {
  const [y, m, d] = targetDateStr.split('-').map(Number);
  const target = new Date(y, m - 1, d);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((target - today) / 86400000);
}

// Converts a lunar calendar date to its solar-calendar equivalent for display
// (e.g. showing "this year's" solar date next to a recurring lunar anniversary).
// Returns a 'YYYY-MM-DD' string, or null if the lunar date is invalid.
export function getSolarFromLunar(year, month, day, isLeap) {
  try {
    const cal = new KoreanLunarCalendar();
    cal.setLunarDate(year, month, day, !!isLeap);
    const solar = cal.getSolarCalendar();
    if (!solar) return null;
    return `${solar.year}-${String(solar.month).padStart(2, '0')}-${String(solar.day).padStart(2, '0')}`;
  } catch (e) {
    console.warn('Lunar to solar conversion failed:', e);
    return null;
  }
}
