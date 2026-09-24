import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { URL } from 'node:url';

test('V2 viewport shell gives bento home a bounded scrollport after document lock', () => {
  const css = readFileSync(new URL('../src/ui/v2/viewport-shell.css', import.meta.url), 'utf8');
  assert.match(css, /main\.bp-app-shell\.is-bento-home/);
  assert.match(css, /overflow-y:\s*auto\s*!important/);
  assert.match(css, /max-height:\s*100%\s*!important/);
});

test('V2 settlement outer pane scrolls; nested settlement-page-body stays overflow visible', () => {
  const css = readFileSync(new URL('../src/ui/v2/viewport-shell.css', import.meta.url), 'utf8');
  assert.match(css, /\.v2-settlement\s+\.v2-settlement-body\s+\.settlement-page-body/);
  assert.match(css, /Nested[\s\S]*settlement-page-body[\s\S]*overflow:\s*visible\s*!important/);
  assert.match(css, /v2-wrap-legacy \.v2-settlement-legacy/);
  assert.match(css, /overflow-y:\s*auto\s*!important/);
});

test('V2 uses one iOS standalone safe viewport for every destination', () => {
  const css = readFileSync(new URL('../src/ui/v2/viewport-shell.css', import.meta.url), 'utf8');
  assert.match(css, /--v2-safe-top:\s*env\(safe-area-inset-top,\s*0px\)/);
  assert.match(css, /--v2-safe-bottom:\s*env\(safe-area-inset-bottom,\s*0px\)/);
  assert.match(css, /main\.renewal-shell-main[\s\S]*height:\s*calc\(var\(--app-vv-height,\s*100dvh\) - var\(--v2-safe-top\) - var\(--v2-safe-bottom\)\)\s*!important/);
  assert.match(css, /is-bento-home > \.bp-hero-zone[\s\S]*padding-top:\s*calc\(10px \+ var\(--v2-safe-top\)\)\s*!important/);
  assert.match(css, /v2-page-header[\s\S]*padding-top:\s*0\s*!important/);
});
