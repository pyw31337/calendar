/**
 * Lightweight design-rule guards (P5-3).
 */
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const css = readFileSync(resolve(root, 'src/app.css'), 'utf8');
const shareModal = readFileSync(resolve(root, 'src/ui/ui-share-modal.js'), 'utf8');
const places = readFileSync(resolve(root, 'src/ui/ui-places.js'), 'utf8');
const main = readFileSync(resolve(root, 'src/core/app-main.js'), 'utf8');
const v2Shell = readFileSync(resolve(root, 'src/ui/ui-app-shell-v2.js'), 'utf8');
const utils = readFileSync(resolve(root, 'src/core/app-utils.js'), 'utf8');

let failed = false;
function fail(msg) {
  console.error('[check-design-rules]', msg);
  failed = true;
}
function ok(msg) {
  console.log('[check-design-rules] OK:', msg);
}

if (!/font-size:\s*(0\.88rem|1rem|16px)/.test(css)) {
  fail('expected input font-size rule in CSS');
} else ok('input font-size guard present in CSS');

if (!shareModal.includes('URL 복사하기')) fail('ShareModal missing copy button label');
if (!shareModal.includes('createDataURL')) fail('ShareModal missing QR createDataURL');
else ok('ShareModal has copy + QR structure');

if (places.includes('장소 페이지 URL 복사') || places.includes('"공유하기"')) {
  fail('Places side menu must not expose the removed 공유하기 item');
} else ok('Places side menu does not expose the removed 공유하기 item');

if (!utils.includes('share/')) fail('utils missing /share/ path helpers');
else ok('share path helpers in utils');

// The V1 shell (withStickyVideo + per-activeView branches) was removed; V2 is the only shell.
// Its 기록 > 사진·영상 destination must keep receiving the gallery props.
if (!v2Shell.includes('memos: galleryMemos')) fail('V2 gallery destination missing gallery memos wiring');
else ok('V2 gallery destination wired');
if (main.includes('renderCalendarViews')) fail('removed V1 view renderer is referenced again');
else ok('no V1 view renderer');

if (!css.includes('--radius-md') && !css.includes('--radius-sm') && !css.includes('--radius-full')) {
  fail('radius design tokens missing');
} else ok('radius tokens present');

try {
  readFileSync(resolve(root, 'scripts/check-calendar-isolation.mjs'), 'utf8');
  ok('calendar isolation check script present');
} catch {
  fail('check-calendar-isolation.mjs missing');
}

if (failed) process.exit(1);
console.log('[check-design-rules] all checks passed');
