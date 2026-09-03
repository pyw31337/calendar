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

// Lightbox must be hosted once in withStickyVideo so every activeView (including
// settlement/memo/places/history DateModal) can open photos — not only gallery.
if (!main.includes("const withStickyVideo")) fail('withStickyVideo wrapper missing');
else if (!main.includes('Shared Lightbox host') || !main.includes('createElement(Lightbox')) {
  fail('withStickyVideo must mount shared Lightbox when activeLightbox is set');
} else ok('shared Lightbox host in withStickyVideo');
if (!main.includes("if (activeView === 'gallery')")) fail('gallery view branch missing');
else ok('gallery view branch present');

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
