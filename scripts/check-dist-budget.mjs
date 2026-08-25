import { existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const DIST_ASSETS_DIR = join(process.cwd(), 'dist', 'assets');

const BUDGETS = [
  // Bumped from 264_000 -- the photo ontology rework (chat-feed filtering, Lightbox meta
  // reshaping), place-search reuse (existingPlaceSuggestions/sourcePlaceId merge), and the
  // mobile touch drag-and-drop implementation for CalendarGrid all added real, non-duplicated
  // logic to this single-file chunk (src/core/app-main.js can't be split further by
  // manualChunks the way ui-views was below, since it's one source file, not several).
  { pattern: /^app-main-.*\.js$/, maxBytes: 280_000 },
  // ui-views was split into two smaller chunks (see vite.config.js manualChunks) once the
  // combined chunk crept up near its old 260_000 budget -- both halves stay well under these
  // caps for now, giving real headroom before either needs bumping again.
  { pattern: /^ui-views-calendar-.*\.js$/, maxBytes: 150_000 },
  { pattern: /^ui-views-modals-.*\.js$/, maxBytes: 160_000 },
  { pattern: /^ui-admin-.*\.js$/, maxBytes: 140_000 },
  { pattern: /^vendor-react-dom-.*\.js$/, maxBytes: 150_000 },
  { pattern: /^index-.*\.css$/, maxBytes: 95_000 }
];

// Bumped from 1_050_000 alongside the app-main bump above -- splitting ui-views doesn't reduce
// total bytes downloaded (same 6 files, just two output files instead of one), so this total
// needed headroom of its own to keep pace with app-main's.
// Bumped from 1_080_000 after icon DEPS sync fix (chat React #130) — was ~9 bytes over.
const TOTAL_JS_MAX_BYTES = 1_090_000;

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
    console.log(`[check-dist-budget] ${file} ${size} / ${maxBytes} bytes`);
    if (size > maxBytes) {
      fail(`${file} exceeds budget (${size} > ${maxBytes})`);
    }
  }
}

console.log(`[check-dist-budget] total js ${totalJsBytes} / ${TOTAL_JS_MAX_BYTES} bytes`);
if (totalJsBytes > TOTAL_JS_MAX_BYTES) {
  fail(`total JS exceeds budget (${totalJsBytes} > ${TOTAL_JS_MAX_BYTES})`);
}

if (!process.exitCode) {
  console.log('[check-dist-budget] OK: Vite build output is within budget');
}
