import assert from 'node:assert/strict';
import test from 'node:test';
import { getAnniversariesForDate } from '../src/core/app-anniversary-dates.js';

test('a legacy culture-linked range renders only on its release or start date', () => {
  const anniversary = {
    id: 'movie-macaronie',
    title: '극장판 마카앤로니: 기억탐험 대소동!',
    type: 'range',
    category: 'movie',
    cultureSourceId: 'movie-macaronie',
    startDate: '2026-11-14',
    endDate: '2026-12-05',
  };

  const onReleaseDate = getAnniversariesForDate('2026-11-14', [anniversary]);

  assert.deepEqual(onReleaseDate.map(item => ({
    id: item.id,
    type: item.type,
    date: item.date,
    cultureSourceId: item.cultureSourceId,
  })), [{
    id: 'movie-macaronie',
    type: 'once',
    date: '2026-11-14',
    cultureSourceId: 'movie-macaronie',
  }]);
  assert.deepEqual(getAnniversariesForDate('2026-11-15', [anniversary]), []);
});

test('a moved culture-linked anniversary uses its chosen date, not the source period', () => {
  const anniversary = {
    id: 'movie-macaronie',
    title: '극장판 마카앤로니: 기억탐험 대소동!',
    type: 'once',
    date: '2026-11-15',
    category: 'movie',
    cultureSourceId: 'movie-macaronie',
    startDate: '2026-11-14',
    endDate: '2026-12-05',
  };

  assert.deepEqual(getAnniversariesForDate('2026-11-14', [anniversary]), []);
  assert.deepEqual(getAnniversariesForDate('2026-11-15', [anniversary]).map(item => item.date), ['2026-11-15']);
});

test('a manually created range remains a multi-day anniversary', () => {
  const anniversary = {
    id: 'manual-festival',
    title: '직접 등록한 축제',
    type: 'range',
    category: 'festival',
    startDate: '2026-11-14',
    endDate: '2026-11-16',
  };

  assert.equal(getAnniversariesForDate('2026-11-15', [anniversary])[0]?.type, 'range');
});
