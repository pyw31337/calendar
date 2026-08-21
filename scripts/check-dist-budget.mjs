import { existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const DIST_ASSETS_DIR = join(process.cwd(), 'dist', 'assets');

const BUDGETS = [
  { pattern: /^app-main-.*\.js$/, maxBytes: 260_000 },
  { pattern: /^ui-views-.*\.js$/, maxBytes: 260_000 },
  { pattern: /^ui-admin-.*\.js$/, maxBytes: 140_000 },
  { pattern: /^vendor-react-dom-.*\.js$/, maxBytes: 150_000 },
  { pattern: /^index-.*\.css$/, maxBytes: 95_000 }
];

const TOTAL_JS_MAX_BYTES = 1_050_000;

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
