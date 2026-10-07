import assert from 'node:assert/strict';
import test from 'node:test';
import { contentPosterStatusBadge } from '../src/core/culture-poster-badge.js';

const TODAY = '2026-10-01'; // Thursday; coming Sunday is 2026-10-04

const status = (item, options = {}) => contentPosterStatusBadge(item, { today: TODAY, ...options });

test('ongoing culture items win over this-week status', () => {
  assert.deepEqual(
    status({ title: '진행중', startDate: '2026-09-28', endDate: '2026-10-10' }, { isOngoingKind: true }),
    { text: '행사중', tone: 'green', backgroundColor: '#16A34A' },
  );
  assert.equal(status({ title: '오늘 시작', startDate: TODAY, endDate: '2026-10-03' }, { isOngoingKind: true }).text, '행사중');
  assert.equal(status({ title: '이번주 시작', startDate: '2026-10-03', endDate: '2026-10-06' }, { isOngoingKind: true }).text, '이번주');
  assert.equal(status({ title: '다음주', startDate: '2026-10-05' }, { isOngoingKind: true }), null);
});

test('sports and movies use the same pure date contract without a React runtime', () => {
  assert.equal(status({ title: '오늘 경기', startDate: TODAY }).text, '이번주');
  assert.equal(status({ title: '어제 경기', startDate: '2026-09-30' }), null);
  assert.equal(status({ title: '상영', releaseDate: '2026-09-20' }, { isMovie: true, movieNowShowing: true }).text, '상영중');
  assert.equal(status({ title: '개봉예정', releaseDate: '2026-10-03' }, { isMovie: true, movieNowShowing: false }).text, '이번주');
});

test('Sunday does not leak next-week badges', () => {
  const sunday = '2026-10-04';
  assert.equal(contentPosterStatusBadge({ startDate: sunday }, { today: sunday }).text, '이번주');
  assert.equal(contentPosterStatusBadge({ startDate: '2026-10-05' }, { today: sunday }), null);
});
