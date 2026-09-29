import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { URL } from 'node:url';

test('Hero zone replaces redundant quick nav with TODAY schedule box and compact five-day weather', async () => {
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

  // Four relative labels plus a fifth date label are defined for weather.
  assert.match(
    appShellJs,
    /labels\s*=\s*\['어제',\s*'오늘',\s*'내일',\s*'모레'\]/,
    'HeroWeatherBox retains the four relative labels before its dated fifth column'
  );
  assert.match(appShellJs, /offset\s*<=\s*3/, 'HeroWeatherBox renders five days through the third future day');
  assert.match(appShellJs, /padStart\(2, '0'\)\}\.\$\{String\(d\.getDate\(\)\)\.padStart\(2, '0'\)/, 'the fifth weather label uses a stable M.DD date');

  // The cached forecast helper retrieves all five displayed days.
  assert.match(
    weatherJs,
    /export function fetchFourDayForecast/,
    'app-weather exports fetchFourDayForecast'
  );
  assert.match(
    weatherJs,
    /past_days=1&forecast_days=4/,
    'fetchFourDayForecast requests yesterday through the third future day in one request'
  );

  // CSS contains styling for both TODAY box and weather row
  assert.match(designCss, /\.bp-hero-today-box/, 'design.css styles .bp-hero-today-box');
  assert.match(designCss, /\.bp-hero-weather-row/, 'design.css styles .bp-hero-weather-row');
  assert.match(designCss, /\.bp-hero-weather-col/, 'design.css styles .bp-hero-weather-col');
  assert.match(destLateCss, /\.bp-hero-zone \.bp-hero-today-box/, 'dest-chrome-late.css has responsive sizing for today box');
  assert.match(destLateCss, /\.bp-hero-zone \.bp-hero-weather-row/, 'dest-chrome-late.css has responsive sizing for weather row');

  // Dark mode weather row on lime slab uses dark --on-brand for text and icons
  assert.match(destLateCss, /html:has\(\.renewal-shell\.v2-design\)\[data-theme="dark"\][\s\S]*?\.bp-hero-zone \.bp-hero-weather-col\s*\{\s*color:\s*var\(--on-brand\)\s*!important;/);
  assert.match(destLateCss, /html:has\(\.renewal-shell\.v2-design\)\[data-theme="dark"\][\s\S]*?\.bp-hero-zone \.bp-hero-weather-icon svg\s*\{[\s\S]*?color:\s*var\(--on-brand\)\s*!important;/);
  assert.match(destLateCss, /html:has\(\.renewal-shell\.v2-design\)\[data-theme="dark"\][\s\S]*?\.bp-hero-zone \.bp-hero-weather-temp\s*\{\s*color:\s*var\(--on-brand\)\s*!important;/);

  // Weather row fluid sizing removes rigid 520px constraint and matches D-day badge width
  assert.equal(
    destLateCss.includes('.bp-hero-zone .bp-hero-weather-row {\n  width: calc(100% - 32px) !important;\n  max-width: 520px !important;'),
    false,
    'dest-chrome-late.css removes fixed 520px max-width on weather row'
  );
  assert.match(destLateCss, /\.bp-hero-zone \.bp-hero-weather-row\s*\{[^}]*max-width:\s*none\s*!important;/, 'weather row max-width is none');

  // Hero weather supports responsive count: 5 on mobile, progressive on tablet, up to 10 on PC
  assert.match(appShellJs, /offset\s*<=\s*8/, 'HeroWeatherBox generates up to 10 items for desktop');
  assert.match(destLateCss, /\.bp-hero-weather-col:nth-child\(n\+6\)\s*\{\s*display:\s*none\s*!important;/, 'mobile caps weather columns to 5');
  assert.match(destLateCss, /container-name:\s*weather-row;/, 'weather row uses container queries for responsive layout');

  // Detailed forecast API & WeatherDetailModal
  assert.match(weatherJs, /export function fetchDetailedWeatherForecast/, 'app-weather exports fetchDetailedWeatherForecast');
  assert.match(destLateCss, /\.weather-detail-modal-container/, 'dest-chrome-late styles WeatherDetailModal');
});

