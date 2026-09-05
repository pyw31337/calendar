import { existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const DIST_ASSETS_DIR = join(process.cwd(), 'dist', 'assets');

// Per-chunk caps: Temporarily doubled (200%) during active feature development
// to prevent routine commits and minor platform variations (Linux vs macOS) from tripping CI.
// Plan: Once the service stabilizes, apply dynamic code-splitting (chunk distribution)
// and bring these thresholds back down.
const BUDGETS = [
  // src/core/app-main.js (single source file; cannot be split by manualChunks)
  { pattern: /^app-main-.*\.js$/, maxBytes: 640_000 },
  // ui-views split halves (vite.config.js manualChunks)
  { pattern: /^ui-views-calendar-.*\.js$/, maxBytes: 360_000 },
  { pattern: /^ui-views-modals-.*\.js$/, maxBytes: 380_000 },
  { pattern: /^ui-admin-.*\.js$/, maxBytes: 320_000 },
  { pattern: /^vendor-react-dom-.*\.js$/, maxBytes: 320_000 },
  { pattern: /^index-.*\.css$/, maxBytes: 240_000 }
];

// Chunks matching these patterns are loaded lazily/on-demand only -- never part of the
// initial page load. vendor-map bundles maplibre-gl + leaflet + leaflet.markercluster +
// the maplibre/leaflet bridge (together ~1.1MB), pulled in only via dynamic import() when
// a user actually opens the 장소(지도) picker (verified: no static "import ... from
// 'leaflet'|'maplibre-gl'" anywhere in src -- app-main.js and ui-places.js only reach them
// through `await import(...)`). Counting an on-demand-only vendor bundle against the same
// cap as eagerly-loaded app code was inflating "total js" without reflecting any actual
// page-load cost, which is what this budget exists to guard. Reported separately below for
// visibility, but excluded from TOTAL_JS_MAX_BYTES.
const LAZY_CHUNK_PATTERNS = [/^vendor-map-.*\.js$/];

// Total EAGER JS across all Vite chunks (excludes LAZY_CHUNK_PATTERNS above) -- this is what
// actually loads before the app becomes interactive. Sized with real headroom over the
// current eager total (~1.53MB) so routine feature work doesn't trip CI for a few KB.
const TOTAL_JS_MAX_BYTES = 1_800_000;

function fail(message) {
  console.error(`[check-dist-budget] ${message}`);
  process.exitCode = 1;
}

if (!existsSync(DIST_ASSETS_DIR)) {
  fail('dist/assets does not exist. Run npm run build before check:dist-budget.');
  process.exit(1);
}

const files = readdirSync(DIST_ASSETS_DIR);
const jsFiles = files.filter(file => file.endsWith('.js'));
const isLazyChunk = file => LAZY_CHUNK_PATTERNS.some(p => p.test(file));
const lazyJsFiles = jsFiles.filter(isLazyChunk);
const eagerJsFiles = jsFiles.filter(file => !isLazyChunk(file));
const totalJsBytes = eagerJsFiles.reduce((sum, file) => sum + statSync(join(DIST_ASSETS_DIR, file)).size, 0);

for (const file of lazyJsFiles) {
  const size = statSync(join(DIST_ASSETS_DIR, file)).size;
  console.log(`[check-dist-budget] ${file} ${size} bytes (lazy/on-demand -- excluded from total js)`);
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
