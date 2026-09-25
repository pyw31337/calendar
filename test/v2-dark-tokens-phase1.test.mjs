import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const v2Dir = join(root, 'src/ui/v2');

const SURFACE_TOKEN_RE =
  /--(?:bg-primary|bg-card|border-subtle)\s*:\s*#(?:FAFAFC|fafafc|FFFFFF|ffffff|FFF|fff|ECEAF5|eceaf5)\b/;

test('reference-*.css do not reset surface tokens to light literals', () => {
  const files = readdirSync(v2Dir).filter((name) => /^reference-.*\.css$/.test(name));
  assert.ok(files.length >= 5, `expected reference-*.css files, got ${files.join(',')}`);
  for (const name of files) {
    const css = readFileSync(join(v2Dir, name), 'utf8');
    assert.equal(
      SURFACE_TOKEN_RE.test(css),
      false,
      `${name} still hardcodes a light surface token (--bg-primary/--bg-card/--border-subtle)`,
    );
  }
});

test('renewal-shell no longer forces light --bg-primary in app.css', () => {
  const css = readFileSync(join(root, 'src/app.css'), 'utf8');
  const block = css.match(/\.renewal-shell\s*\{[\s\S]*?\n\}/);
  assert.ok(block, 'missing .renewal-shell block');
  assert.equal(
    /--bg-primary\s*:\s*#FAFAFC/i.test(block[0]),
    false,
    '.renewal-shell must not redefine --bg-primary to #FAFAFC',
  );
});

test('viewport-shell page canvas uses var(--bg-primary)', () => {
  const css = readFileSync(join(v2Dir, 'viewport-shell.css'), 'utf8');
  assert.match(css, /html:has\(\.v2-design\)[\s\S]*?background:\s*var\(--bg-primary\)/);
  assert.equal(/html:has\(\.v2-design\)[\s\S]*?background:\s*#fafafc/i.test(css), false);
});
