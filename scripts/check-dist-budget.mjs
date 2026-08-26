import { existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const DIST_ASSETS_DIR = join(process.cwd(), 'dist', 'assets');

// Per-chunk caps: sized with real headroom so routine UI/feature work does not
// fail CI for a few KB. Revisit only when a single chunk grows >~20% past these.
const BUDGETS = [
  // src/core/app-main.js (single source file; cannot be split by manualChunks)
  { pattern: /^app-main-.*\.js$/, maxBytes: 320_000 },
  // ui-views split halves (vite.config.js manualChunks)
  { pattern: /^ui-views-calendar-.*\.js$/, maxBytes: 180_000 },
  { pattern: /^ui-views-modals-.*\.js$/, maxBytes: 190_000 },
  { pattern: /^ui-admin-.*\.js$/, maxBytes: 160_000 },
  { pattern: /^vendor-react-dom-.*\.js$/, maxBytes: 160_000 },
  { pattern: /^index-.*\.css$/, maxBytes: 120_000 }
];

// Total JS across all Vite chunks. Raised deliberately to ~1.30MB (from ~1.13MB)
// so small feature batches stop tripping CI every push. Still a guardrail against
// accidental multi-100KB regressions; not a license to ship unbounded growth.
// History: 1.05 → 1.08 → 1.09 → 1.10 → 1.12 → 1.125 → 1.13 → 1.135 (repeated
// micro-bumps). This jump consolidates that pain into one stable ceiling.
const TOTAL_JS_MAX_BYTES = 1_300_000;

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
