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
