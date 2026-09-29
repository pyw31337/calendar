import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { URL } from 'node:url';

test('Hero zone replaces redundant quick nav with TODAY schedule box and 4-day weather', async () => {
  const [appShellJs, weatherJs, designCss, destLateCss] = await Promise.all([
    readFile(new URL('../src/ui/ui-app-shell-v2.js', import.meta.url), 'utf8'),
    readFile(new URL('../src/core/app-weather.js', import.meta.url), 'utf8'),
    readFile(new URL('../src/ui/v2/design.css', import.meta.url), 'utf8'),
    readFile(new URL('../src/ui/v2/dest-chrome-late.css', import.meta.url), 'utf8')
  ]);

  // Redundant quick nav is removed from CalendarPane hero zone
  assert.equal(
    appShellJs.includes('React.createElement(HeroQuickNav'),
    false,
    'CalendarPane no longer renders redundant HeroQuickNav'
  );

  // HeroTodayOrWeather is rendered in CalendarPane
  assert.match(
    appShellJs,
    /React\.createElement\(HeroTodayOrWeather/,
    'CalendarPane renders HeroTodayOrWeather'
  );

  // 4 day labels are defined for weather
  assert.match(
    appShellJs,
    /labels\s*=\s*\['어제',\s*'오늘',\s*'내일',\s*'모레'\]/,
    'HeroWeatherBox defines 4 day labels (어제, 오늘, 내일, 모레)'
  );

  // app-weather exports 4-day forecast helpers
  assert.match(
    weatherJs,
    /export function fetchFourDayForecast/,
    'app-weather exports fetchFourDayForecast'
  );
  assert.match(
    weatherJs,
    /past_days=1&forecast_days=3/,
    'fetchFourDayForecast requests past_days=1 and forecast_days=3'
  );

  // CSS contains styling for both TODAY box and weather row
  assert.match(designCss, /\.bp-hero-today-box/, 'design.css styles .bp-hero-today-box');
  assert.match(designCss, /\.bp-hero-weather-row/, 'design.css styles .bp-hero-weather-row');
  assert.match(designCss, /\.bp-hero-weather-col/, 'design.css styles .bp-hero-weather-col');
  assert.match(destLateCss, /\.bp-hero-zone \.bp-hero-today-box/, 'dest-chrome-late.css has responsive sizing for today box');
  assert.match(destLateCss, /\.bp-hero-zone \.bp-hero-weather-row/, 'dest-chrome-late.css has responsive sizing for weather row');
});
