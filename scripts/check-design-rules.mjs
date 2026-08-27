/**
 * Lightweight design-rule guards (P5-3).
 */
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const css = readFileSync(resolve(root, 'src/app.css'), 'utf8');
const shareModal = readFileSync(resolve(root, 'src/ui/ui-share-modal.js'), 'utf8');
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

if (!utils.includes('share/')) fail('utils missing /share/ path helpers');
else ok('share path helpers in utils');

const gal = main.indexOf("if (activeView === 'gallery')");
if (gal < 0) fail('gallery view branch missing');
else {
  const slice = main.slice(gal, gal + 1500);
  if (!slice.includes('activeLightbox') || !slice.includes('Lightbox')) {
    fail('gallery view must render Lightbox when activeLightbox is set');
  } else ok('gallery page wires Lightbox');
}

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
