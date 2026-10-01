import test from 'node:test';
import assert from 'node:assert/strict';
import { getCulturePosterBadge, weekEndSundayIso } from '../src/ui/culture-poster-badge.js';

// 2026-10-01 is a Thursday; that week ends Sunday 2026-10-04.
const today = '2026-10-01';

test('week end is the coming Sunday, and a Sunday is its own week end', () => {
  assert.equal(weekEndSundayIso('2026-10-01'), '2026-10-04');
  assert.equal(weekEndSundayIso('2026-09-28'), '2026-10-04');
  assert.equal(weekEndSundayIso('2026-10-04'), '2026-10-04');
});

test('a running festival or culture event is 행사중 (green)', () => {
  const festival = { startDate: '2026-09-19', endDate: '2026-10-06' };
  assert.deepEqual(getCulturePosterBadge(festival, { today, isOngoingKind: true }), { label: '행사중', tone: 'green' });
  const oneDay = { startDate: today, endDate: today };
  assert.deepEqual(getCulturePosterBadge(oneDay, { today, isOngoingKind: true }), { label: '행사중', tone: 'green' });
});

test('a now-showing movie stays 상영중 (green)', () => {
  const movie = { releaseDate: '2026-09-09', startDate: '2026-09-09', endDate: '2026-10-07' };
  assert.deepEqual(getCulturePosterBadge(movie, { today, isMovie: true, movieNowShowing: true }), { label: '상영중', tone: 'green' });
});

test('anything starting by this Sunday is 이번주 (orange)', () => {
  const later = { startDate: '2026-10-03', endDate: '2026-10-05' };
  assert.deepEqual(getCulturePosterBadge(later, { today, isOngoingKind: true }), { label: '이번주', tone: 'orange' });
  const sportsToday = { startDate: today, endDate: today };
  assert.deepEqual(getCulturePosterBadge(sportsToday, { today }), { label: '이번주', tone: 'orange' });
  const movieSunday = { releaseDate: '2026-10-04' };
  assert.deepEqual(getCulturePosterBadge(movieSunday, { today, isMovie: true, movieNowShowing: false }), { label: '이번주', tone: 'orange' });
});

test('next week, past, or undated items get no badge', () => {
  assert.equal(getCulturePosterBadge({ startDate: '2026-10-05' }, { today, isOngoingKind: true }), null);
  assert.equal(getCulturePosterBadge({ startDate: '2026-09-01', endDate: '2026-09-30' }, { today, isOngoingKind: true }), null);
  assert.equal(getCulturePosterBadge({ startDate: '' }, { today, isOngoingKind: true }), null);
  // An ended movie with no theatrical run left is not 이번주 either.
  assert.equal(getCulturePosterBadge({ releaseDate: '2026-08-01' }, { today, isMovie: true, movieNowShowing: false }), null);
});
