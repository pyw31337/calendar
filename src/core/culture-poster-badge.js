/**
 * Pure status rules for Culture Flow poster badges.
 *
 * Kept out of the React view chunk so snapshots, import jobs, and Node tests can
 * use the same date rules without initialising `window.React`.
 */
const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/;

const isoDay = value => {
  const day = String(value || '').slice(0, 10);
  return ISO_DAY.test(day) ? day : '';
};

// The Sunday that ends the week containing `today` (Mon-Sun week; Sunday is its own end).
export function weekEndSundayIso(today) {
  const d = new Date(`${today}T00:00:00`);
  if (Number.isNaN(d.getTime())) return '';
  d.setDate(d.getDate() + ((7 - d.getDay()) % 7));
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export const CULTURE_POSTER_BADGE_COLORS = { green: '#16A34A', orange: '#EA580C' };

export function getCulturePosterBadge(item, { today, isMovie = false, isOngoingKind = false, movieNowShowing = false } = {}) {
  if (!item || !ISO_DAY.test(String(today || ''))) return null;
  const start = isoDay(item.releaseDate || item.startDate);
  const end = isoDay(item.endDate) || start;
  if (isMovie && movieNowShowing) return { label: '상영중', tone: 'green' };
  if (isOngoingKind && start && start <= today && end >= today) return { label: '행사중', tone: 'green' };
  const sunday = weekEndSundayIso(today);
  if (start && sunday && start >= today && start <= sunday) return { label: '이번주', tone: 'orange' };
  return null;
}

// Consumer-friendly view model. `tone` remains available for CSS classes while
// `text`/`backgroundColor` keep renderers from duplicating the label-to-colour mapping.
export function contentPosterStatusBadge(item, options = {}) {
  const badge = getCulturePosterBadge(item, options);
  if (!badge) return null;
  return { text: badge.label, tone: badge.tone, backgroundColor: CULTURE_POSTER_BADGE_COLORS[badge.tone] };
}
