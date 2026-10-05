import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { relativeDayLabel, shortDateTitleParts } from '../src/ui/date-title.js';

const now = new Date('2026-10-02T14:00:00+09:00');

test('relative badge only for 어제/오늘/내일/모레', () => {
  assert.equal(relativeDayLabel('2026-10-01', now), '어제');
  assert.equal(relativeDayLabel('2026-10-02', now), '오늘');
  assert.equal(relativeDayLabel('2026-10-03', now), '내일');
  assert.equal(relativeDayLabel('2026-10-04', now), '모레');
  assert.equal(relativeDayLabel('2026-10-05', now), '');
  assert.equal(relativeDayLabel('2026-09-30', now), '');
  assert.equal(relativeDayLabel('bad', now), '');
});

test('date reads 26.10.03 (토)', () => {
  assert.deepEqual(shortDateTitleParts('2026-10-03'), { year: '26.', rest: '10.03 (토)' });
  assert.equal(shortDateTitleParts(''), null);
});

test('weather and 일정 popups share the title; hourly tabs and metric cards are wired', async () => {
  const [weatherJs, dateModalJs, weatherCore, css] = await Promise.all([
    readFile(new URL('../src/ui/ui-weather.js', import.meta.url), 'utf8'),
    readFile(new URL('../src/ui/ui-date-modal.js', import.meta.url), 'utf8'),
    readFile(new URL('../src/core/app-weather.js', import.meta.url), 'utf8'),
    readFile(new URL('../src/ui/v2/dest-chrome-late.css', import.meta.url), 'utf8'),
  ]);
  assert.match(weatherJs, /createElement\(DateTitle/);
  assert.match(dateModalJs, /createElement\(DateTitle/);
  assert.match(weatherJs, /key: 'air', label: '대기'/);
  assert.match(weatherJs, /key: 'uv', label: '자외선'/);
  assert.match(weatherJs, /metricCardProps\('precip'/);
  assert.match(weatherJs, /metricCardProps\('wind'/);
  assert.match(weatherJs, /onPointerUp: endCardSwipe/);
  assert.match(weatherCore, /wind_speed_10m,uv_index&/);
  // The air-quality API rejects forecast_days above 7 (the whole request fails).
  assert.match(weatherCore, /air-quality\?[^`]*forecast_days=7`/);
  assert.match(css, /\.weather-highlight-card\[data-weather\] \{\s*box-shadow: none !important;/);
});
