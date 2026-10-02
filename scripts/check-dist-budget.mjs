import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const DIST_ASSETS_DIR = join(process.cwd(), 'dist', 'assets');

// Per-chunk caps retain practical release headroom while catching accidental eager growth.
const BUDGETS = [
  { pattern: /^app-main-.*\.js$/, maxBytes: 360_000 },
  { pattern: /^photo-comment-items-.*\.js$/, maxBytes: 40_000 },
  { pattern: /^ui-calendar-core-.*\.js$/, maxBytes: 120_000 },
  { pattern: /^ui-chat-room-.*\.js$/, maxBytes: 100_000 },
  { pattern: /^ui-places-.*\.js$/, maxBytes: 100_000 },
  { pattern: /^ui-memo-view-.*\.js$/, maxBytes: 100_000 },
  { pattern: /^ui-event-modals-.*\.js$/, maxBytes: 200_000 },
  { pattern: /^ui-admin-.*\.js$/, maxBytes: 200_000 },
  { pattern: /^ui-lightbox-.*\.js$/, maxBytes: 80_000 },
  { pattern: /^vendor-react-dom-.*\.js$/, maxBytes: 180_000 },
  { pattern: /^index-.*\.css$/, maxBytes: 240_000 }
];

// Chunks matching these patterns are loaded lazily/on-demand only -- never part of the
// initial page load. vendor-map bundles maplibre-gl + leaflet + leaflet.markercluster +
// the maplibre/leaflet bridge (together ~1.2MB plus a ~670KB MapLibre worker chunk), pulled in only via dynamic import() when
// a user actually opens the 장소(지도) picker (verified: no static "import ... from
// 'leaflet'|'maplibre-gl'" anywhere in src -- app-main.js and ui-places.js only reach them
// through `await import(...)`). Counting an on-demand-only vendor bundle against the same
// cap as eagerly-loaded app code was inflating "total js" without reflecting any actual
// page-load cost, which is what this budget exists to guard. Reported separately below for
// visibility, but excluded from TOTAL_JS_MAX_BYTES.
const LAZY_CHUNK_PATTERNS = [
  // exifr: dynamic import on the first photo upload only (app-image-pipeline.js loadExifr).
  /^vendor-exifr-.*\.js$/,
  /^vendor-map-.*\.js$/,
  /^maplibre-gl-worker-.*\.js$/,
  /^ui-admin-.*\.js$/,
  /^ui-user-manual-.*\.js$/,
  /^ui-chat-room-.*\.js$/,
  /^ui-chat-gallery-.*\.js$/,
  /^ui-places-.*\.js$/,
  /^ui-memo-view-.*\.js$/,
  /^ui-event-modals-.*\.js$/,
  /^ui-lightbox-.*\.js$/,
  /^ui-date-modal-.*\.js$/
];

// Total EAGER JS across all Vite chunks (excludes LAZY_CHUNK_PATTERNS above) -- this is what
// actually loads before the app becomes interactive. Sized with real headroom so routine
// feature work does not trip CI for a few bytes of minifier variation. 1.60 MB was 28 KB
// short after the archive edit ledger, shared search chrome, and confetti landed in the
// eager graph (1628090 > 1600000). 1.64 MB had 263 bytes left, and the shared
// tab-strip swipe (UnderlineTabs, SegmentedToggle, search tabs) landed in that
// eager graph at 1642888. 1.648 MB had no room left once notification taps
// started carrying the existing chat/memo deep link (1649111 > 1648000).
// 1.653 MB keeps a few KB of minifier headroom and still catches a real jump.
// The settings color-theme picker (src/core/color-themes.js) added ~4 KB eager
// (1653953 > 1653000); 1.66 MB restores the same few KB of headroom.
// 보관함 추천's "얼굴로 찾은 사람" card (face suggestions from the Mac worker) lives in the eager
// archive chunk (1660883 > 1660000); 1.668 MB keeps the same few KB of headroom.
// One copy per photo (a re-upload links the stored original; shared-file delete/album guards)
// added ~4 KB to the eager upload/photo-action code (1671684 > 1668000); 1.676 MB keeps the same
// few KB of headroom.
const TOTAL_JS_MAX_BYTES = 1_676_000;

function fail(message) {
  console.error(`[check-dist-budget] ${message}`);
  process.exitCode = 1;
}

if (!existsSync(DIST_ASSETS_DIR)) {
  fail('dist/assets does not exist. Run npm run build before check:dist-budget.');
  process.exit(1);
}

const files = readdirSync(DIST_ASSETS_DIR);
const indexHtml = readFileSync(join(process.cwd(), 'dist', 'index.html'), 'utf8');
const jsFiles = files.filter(file => file.endsWith('.js'));
const isLazyChunk = file => LAZY_CHUNK_PATTERNS.some(p => p.test(file));
const lazyJsFiles = jsFiles.filter(isLazyChunk);
const eagerJsFiles = jsFiles.filter(file => !isLazyChunk(file));
const totalJsBytes = eagerJsFiles.reduce((sum, file) => sum + statSync(join(DIST_ASSETS_DIR, file)).size, 0);

const emittedMapLibreWorkers = files.filter(file => /^maplibre-gl-worker-.*\.js$/.test(file));
const mapLibreWorkerFallback = 'maplibre-gl-worker.mjs';
if (emittedMapLibreWorkers.length !== 1) {
  fail(`expected exactly one fingerprinted MapLibre worker, found ${emittedMapLibreWorkers.length}`);
} else if (!files.includes(mapLibreWorkerFallback)) {
  fail(`missing ${mapLibreWorkerFallback} fallback required by MapLibre's default worker URL`);
} else {
  const emittedSize = statSync(join(DIST_ASSETS_DIR, emittedMapLibreWorkers[0])).size;
  const fallbackSize = statSync(join(DIST_ASSETS_DIR, mapLibreWorkerFallback)).size;
  if (emittedSize !== fallbackSize) {
    fail(`${mapLibreWorkerFallback} must match the fingerprinted MapLibre worker (${fallbackSize} !== ${emittedSize})`);
  } else {
    console.log(`[check-dist-budget] ${mapLibreWorkerFallback} fallback ${fallbackSize} bytes`);
  }
}

for (const file of lazyJsFiles) {
  const size = statSync(join(DIST_ASSETS_DIR, file)).size;
  console.log(`[check-dist-budget] ${file} ${size} bytes (lazy/on-demand -- excluded from total js)`);
  if (indexHtml.includes(`modulepreload`) && indexHtml.includes(`/assets/${file}`)) {
    fail(`${file} is marked lazy but is modulepreloaded by index.html`);
  }
}

for (const { pattern, maxBytes } of BUDGETS) {
  const matches = files.filter(file => pattern.test(file));
  if (matches.length === 0) {
    fail(`missing expected build asset matching ${pattern}`);
    continue;
  }
  for (const file of matches) {
    const size = statSync(join(DIST_ASSETS_DIR, file)).size;
    const headroomPct = ((maxBytes - size) / maxBytes * 100).toFixed(1);
    console.log(`[check-dist-budget] ${file} ${size} / ${maxBytes} bytes (headroom ${headroomPct}%)`);
    if (size > maxBytes) {
      fail(`${file} exceeds budget (${size} > ${maxBytes})`);
    }
  }
}

const totalHeadroomPct = ((TOTAL_JS_MAX_BYTES - totalJsBytes) / TOTAL_JS_MAX_BYTES * 100).toFixed(1);
console.log(`[check-dist-budget] total js ${totalJsBytes} / ${TOTAL_JS_MAX_BYTES} bytes (headroom ${totalHeadroomPct}%)`);
if (totalJsBytes > TOTAL_JS_MAX_BYTES) {
  fail(`total JS exceeds budget (${totalJsBytes} > ${TOTAL_JS_MAX_BYTES})`);
}

if (!process.exitCode) {
  console.log('[check-dist-budget] OK: Vite build output is within budget');
}
