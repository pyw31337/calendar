import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { URL } from 'node:url';

function ymd(offset) {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + offset);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

test('hero strip and D-day badge share one daily forecast for the same coordinates', async () => {
  const { resolveDailyForecast } = await import('../src/core/app-weather.js');
  const dateStr = ymd(3);
  const otherDate = ymd(4);
  let calls = 0;
  const original = globalThis.fetch;
  globalThis.fetch = async (url) => {
    calls += 1;
    const parsed = new URL(url);
    assert.equal(parsed.searchParams.get('latitude'), '36.542');
    assert.equal(parsed.searchParams.get('longitude'), '127.872');
    assert.equal(parsed.searchParams.get('timezone'), 'Asia/Seoul');
    assert.match(parsed.searchParams.get('daily'), /temperature_2m_max/);
    assert.match(parsed.searchParams.get('daily'), /weather_code/);
    const time = [ymd(-1), ymd(0), ymd(1), ymd(2), dateStr, otherDate];
    return {
      ok: true,
      json: async () => ({
        daily: {
          time,
          weather_code: time.map(day => (day === otherDate ? 61 : 3)),
          temperature_2m_max: time.map(day => (day === dateStr ? 18.2 : 23.4)),
          temperature_2m_min: time.map(() => 9),
          apparent_temperature_max: time.map(() => 17),
          apparent_temperature_min: time.map(() => 8),
          precipitation_sum: time.map(() => 0),
          precipitation_probability_max: time.map(() => 10),
          wind_speed_10m_max: time.map(() => 4),
          uv_index_max: time.map(() => 2),
        }
      })
    };
  };
  try {
    const [hero, badge, nextDay] = await Promise.all([
      resolveDailyForecast(36.5421, 127.8724, dateStr),
      resolveDailyForecast(36.5424, 127.8722, dateStr),
      resolveDailyForecast(36.5421, 127.8724, otherDate),
    ]);
    assert.equal(calls, 1, 'same rounded lat/lon shares one in-flight daily request');
    assert.equal(hero.code, 3);
    assert.equal(badge.code, hero.code);
    assert.equal(badge.max, hero.max);
    assert.equal(Math.round(hero.max), 18);
    assert.equal(nextDay.code, 61);
    assert.equal(Math.round(nextDay.max), 23);
    const again = await resolveDailyForecast(36.542, 127.872, dateStr);
    assert.equal(calls, 1, 'the resolved day stays in the shared memory cache');
    assert.equal(again.max, hero.max);
  } finally {
    globalThis.fetch = original;
  }
});

test('confirmed hero columns use the meeting place resolver, and log filters sit outside the scroller', async () => {
  const [shell, weatherUi, admin, chrome] = await Promise.all([
    readFile(new URL('../src/ui/ui-app-shell-v2.js', import.meta.url), 'utf8'),
    readFile(new URL('../src/ui/ui-weather.js', import.meta.url), 'utf8'),
    readFile(new URL('../src/ui/ui-admin-modals.js', import.meta.url), 'utf8'),
    readFile(new URL('../src/ui/v2/dest-chrome-late.css', import.meta.url), 'utf8'),
  ]);

  assert.match(shell, /function meetingPlaceWeatherCoords\(calendar, dateStr\)/);
  assert.match(shell, /weatherCoordsFor = \(dateStr\) => meetingPlaceWeatherCoords\(calendar, dateStr\)/);
  assert.match(shell, /resolveDailyForecast\(coords\.lat, coords\.lon, dateStr\)/);
  assert.match(shell, /isConfirmed\s*\n\s*\? \(placeForecasts\[day\.dateStr\]/);
  assert.match(weatherUi, /resolveDailyForecast\(latNum, lonNum, date\)/);
  assert.doesNotMatch(weatherUi, /function fetchDailyForecast/);

  const filterAt = admin.indexOf('ariaLabel: "활동 로그 분류"');
  const bodyAt = admin.indexOf('className: "modal-body"', filterAt);
  assert.ok(filterAt > 0 && bodyAt > filterAt, 'log filter tabs render before the scrolling modal body');
  assert.match(admin, /className: "admin-log-category-tabs"/);
  assert.match(admin, /activeTab === 'logs' && UnderlineTabs &&/);
  assert.doesNotMatch(admin, /margin: '0 -16px'/);
  assert.match(chrome, /\.admin-log-category-tabs\.underline-tabs--flush > button \{\s*padding: 0 4px !important;/);
  assert.match(chrome, /\.admin-log-category-tabs\.underline-tabs--flush \{[\s\S]*width: 100% !important;/);
});
