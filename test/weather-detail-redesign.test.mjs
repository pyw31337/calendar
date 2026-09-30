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
  assert.match(weatherJs, /addressdetails=1/, 'place lookups request the address fields needed for an exact forecast region');
  assert.match(weatherJs, /reverseGeocodeWeatherArea/, 'coordinate-only places resolve a forecast area without changing the place coordinates');
  assert.match(weatherJs, /regionName !== '현재 위치'/, 'GPS source labels yield to the resolved administrative forecast area');
  assert.match(weatherJs, /일정 장소 기준 날씨/, 'a coordinate-only meeting place is never mislabeled as an unrelated forecast region while its area resolves');
  assert.match(weatherJs, /onSaveLocationRef/, 'reverse-geocoding is insulated from parent re-renders so it does not duplicate requests');
  assert.match(appShellJs, /const placeAreaName = String\(withCoords\.address/, 'meeting places provide their address context to the forecast');
  assert.match(appShellJs, /needsReverseGeocode: !placeAreaName/, 'coordinate-only meeting places explicitly request an area-label lookup');
  assert.match(appShellJs, /areaName: String\(parsed\.areaName \|\| ''\)/, 'saved user weather regions retain their resolved area after a refresh');

  assert.match(css, /\.weather-detail-days-strip\s*\{[\s\S]*?touch-action:\s*pan-x;/, 'the horizontal date selector permits native horizontal panning');
  assert.match(css, /\.weather-detail-days-strip\s*\{[\s\S]*?border-radius:\s*0\s*!important;/, 'days strip removes rounded pill borders');
  assert.match(css, /\.weather-detail-days-strip\s*\{[\s\S]*?border-top:\s*0\s*!important;/, 'days strip removes top border');
  assert.match(css, /\.weather-detail-region[\s\S]*?margin-top:\s*-4px\s*!important;/, 'the forecast area copy has narrowed margin');
  assert.match(css, /\.weather-detail-region/, 'the forecast area receives a dedicated V2 text treatment');
  assert.match(css, /\.weather-detail-icon-button/, 'header controls use the shared compact icon-button treatment');
  assert.match(css, /\.weather-detail-footer\s*\{[\s\S]*?safe-area-inset-bottom/, 'the weather modal footer remains above the iPhone home indicator');

  // Location setting header subtitle
  assert.match(weatherJs, /설정위치\s*:\s*\$\{displayLocationName\}/, 'region setting modal header displays current location subtitle');

  // Metric cards custom SVG icons
  assert.match(weatherJs, /lucide-cloud-rain-wind/, 'precipitation metric card renders cloud-rain-wind SVG');
  assert.match(weatherJs, /lucide-factory/, 'air quality metric card renders factory SVG');
  assert.match(weatherJs, /lucide-wind/, 'wind speed metric card renders wind SVG');
  assert.match(weatherJs, /icon-tabler-uv-index/, 'UV index metric card renders uv-index SVG');

  // Naver weather style hourly forecast tabs and chart
  assert.match(weatherJs, /weather-hourly-tabs/, 'hourly forecast section renders category sub-tabs');
  assert.match(weatherJs, /key:\s*'weather',\s*label:\s*'날씨'/, 'hourly forecast has weather/temp tab');
  assert.match(weatherJs, /key:\s*'precip',\s*label:\s*'강수'/, 'hourly forecast has precip tab');
  assert.match(weatherJs, /key:\s*'wind',\s*label:\s*'바람'/, 'hourly forecast has wind tab');
  assert.match(weatherJs, /key:\s*'humidity',\s*label:\s*'습도'/, 'hourly forecast has humidity tab');
  assert.match(weatherJs, /weather-hourly-col/, 'hourly columns render with individual borderless styling');
  assert.match(css, /\.weather-hourly-col\s*\{[\s\S]*?border:\s*none\s*!important;/, 'hourly forecast boxes have borders removed');

  // Weather highlight card redesign & readability
  assert.match(weatherJs, /getWeatherCardTheme/, 'weather highlight card uses dynamic weather gradient themes');
  assert.match(weatherJs, /weather-highlight-temp-big/, 'weather highlight card features prominent large temperature typography');
  assert.match(weatherJs, /weather-highlight-content-right/, 'weather highlight card renders right text block');
  assert.match(weatherJs, /rgba\(0,\s*0,\s*0,\s*0\.32\)/, 'highlight card right block has frosted dark glass background for high readability');
  assert.match(css, /\.weather-highlight-content-right/, 'CSS includes rules for highlight card right text block');
  assert.match(css, /\.weather-highlight-card\s*\{[\s\S]*?border-radius:\s*20px;/, 'weather highlight card uses 20px rounded card');

  // Days strip border removal & radius 0
  assert.match(weatherJs, /borderRadius:\s*0/, 'days strip has inline borderRadius 0');
  assert.match(weatherJs, /borderTop:\s*0/, 'days strip has inline borderTop 0');
  assert.match(css, /\.weather-detail-days-strip\s*\{[\s\S]*?border-left:\s*0\s*!important;/, 'days strip removes left border');
  assert.match(css, /\.weather-detail-days-strip\s*\{[\s\S]*?border-right:\s*0\s*!important;/, 'days strip removes right border');

  // Hourly forecast swipe drag & scrollbar hiding
  assert.match(weatherJs, /beginTimelineDrag/, 'hourly timeline has beginTimelineDrag handler');
  assert.match(weatherJs, /onPointerMove:\s*moveTimelineDrag/, 'hourly timeline attaches moveTimelineDrag handler');
  assert.match(weatherJs, /scrollbarWidth:\s*'none'/, 'hourly timeline inlines scrollbarWidth none');
  assert.match(css, /\.weather-hourly-timeline\s*\{[\s\S]*?scrollbar-width:\s*none\s*!important;/, 'hourly timeline CSS hides scrollbar');
  assert.match(css, /\.weather-hourly-timeline\s*\{[\s\S]*?cursor:\s*grab;/, 'hourly timeline CSS sets grab cursor');
  assert.match(css, /\.weather-hourly-timeline::-webkit-scrollbar\s*\{[\s\S]*?display:\s*none\s*!important;/, 'hourly timeline webkit scrollbar is hidden');
});

