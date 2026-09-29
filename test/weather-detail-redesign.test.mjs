import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { URL } from 'node:url';

test('weather detail uses the V2 planning layout with an explicit forecast region', async () => {
  const [weatherJs, appShellJs, css] = await Promise.all([
    readFile(new URL('../src/ui/ui-weather.js', import.meta.url), 'utf8'),
    readFile(new URL('../src/ui/ui-app-shell-v2.js', import.meta.url), 'utf8'),
    readFile(new URL('../src/ui/v2/dest-chrome-late.css', import.meta.url), 'utf8')
  ]);

  assert.match(weatherJs, /function WeatherPlaceMarkerIcon/, 'the shared place-marker shape is rendered in the weather header');
  assert.match(weatherJs, /M17\.657 16\.657l-4\.243 4\.243/, 'the place-marker follows the Places menu SVG path');
  assert.match(weatherJs, /function WeatherRegionSettingsIcon/, 'the weather-region control has a dedicated icon');
  assert.ok(weatherJs.includes('"aria-label": `날씨 지역 설정. 현재 ${locationAreaLabel}`'), 'region setting announces the active forecast area');
  assert.match(weatherJs, /formatWeatherDayChoice/, 'day labels are formatted inside the detail modal');
  assert.match(weatherJs, /오늘\(\$\{parts\.weekday\}\)/, 'today is labelled with its weekday instead of a duplicate date');
  assert.match(weatherJs, /\$\{parts\.monthDay\}\(\$\{parts\.weekday\}\)/, 'other dates use M.DD(요일) format');
  assert.match(weatherJs, /dayStripRef/, 'the days strip owns a dedicated scroll surface');
  assert.match(weatherJs, /onPointerMove: moveDayStripDrag/, 'the days strip supports pointer drag on desktop and touch devices');
  assert.match(weatherJs, /regionName: `\$\{activeRegion\.fullName \|\| activeRegion\.label\} \$\{draftGugun\}`/, 'selected Korean districts retain an explicit display region');
  assert.match(appShellJs, /areaName: String\(withCoords\.address/, 'meeting places provide their address context to the forecast');

  assert.match(css, /\.weather-detail-days-strip\s*\{[\s\S]*?touch-action:\s*pan-x;/, 'the horizontal date selector permits native horizontal panning');
  assert.match(css, /\.weather-detail-region/, 'the forecast area receives a dedicated V2 text treatment');
  assert.match(css, /\.weather-detail-icon-button/, 'header controls use the shared compact icon-button treatment');
  assert.match(css, /\.weather-detail-footer\s*\{[\s\S]*?safe-area-inset-bottom/, 'the weather modal footer remains above the iPhone home indicator');
});
