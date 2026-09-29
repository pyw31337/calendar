import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const viewportSync = fs.readFileSync('src/ui/v2/visual-viewport-sync.js', 'utf8');
const shellCss = fs.readFileSync('src/ui/v2/viewport-shell.css', 'utf8');
const chromeCss = fs.readFileSync('src/ui/v2/dest-chrome-late.css', 'utf8');

test('legacy bottom sheets receive a real, pointer-resizable handle instead of a decorative pseudo element', () => {
  assert.match(viewportSync, /data-v2-injected-sheet-handle/);
  assert.match(viewportSync, /sheet\.style\.setProperty\('height', `\$\{nextHeight\}px`, 'important'\)/);
  assert.match(viewportSync, /handle\.setPointerCapture/);
});

test('standalone iOS publishes and consumes a measured top-safe-area fallback', () => {
  assert.match(viewportSync, /--app-vv-standalone-top-inset/);
  assert.match(shellCss, /--v2-pwa-safe-top:\s*max\(env\(safe-area-inset-top, 0px\), var\(--app-vv-standalone-top-inset, 0px\)\)/);
  assert.match(chromeCss, /padding-top: calc\(var\(--v2-pwa-safe-top/);
});

test('admin settings cannot bypass the shared mobile sheet safety cap', () => {
  const marker = 'A few older sheets declare their own 100dvh maximum';
  const start = chromeCss.indexOf(marker);
  assert.ok(start > 0);
  const rule = chromeCss.slice(start, start + 1800);
  assert.match(rule, /\.modal-container\.admin-settings-modal/);
  assert.match(rule, /var\(--v2-pwa-safe-top/);
  assert.match(rule, /var\(--v2-pwa-safe-bottom/);
});
