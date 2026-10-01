/**
 * Top-left poster badge for the content (culture) grid.
 *   green  상영중 -- a movie still in theatres (caller passes movieNowShowing)
 *   green  행사중 -- a festival / culture event running today (start <= today <= end)
 *   orange 이번주 -- any card (festival, event, sports, movie) starting between today and this
 *                    Sunday, when no green badge applies
 * Dates are local YYYY-MM-DD strings, compared as strings.
 */

const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/;

const isoDay = value => {
  const day = String(value || '').slice(0, 10);
  return ISO_DAY.test(day) ? day : '';
};

// The Sunday that ends the week containing `today` (Mon-Sun week; a Sunday is its own week end).
export function weekEndSundayIso(today) {
  const d = new Date(`${today}T00:00:00`);
  if (Number.isNaN(d.getTime())) return '';
  d.setDate(d.getDate() + ((7 - d.getDay()) % 7));
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

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

export const CULTURE_POSTER_BADGE_COLORS = { green: '#16A34A', orange: '#EA580C' };
