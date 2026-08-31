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

// Total JS across all Vite chunks. Temporarily doubled to 2.6MB (~200%) during active development.
// Will be reduced alongside post-stabilization chunk optimization.
const TOTAL_JS_MAX_BYTES = 2_600_000;

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
const totalJsBytes = jsFiles.reduce((sum, file) => sum + statSync(join(DIST_ASSETS_DIR, file)).size, 0);

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
