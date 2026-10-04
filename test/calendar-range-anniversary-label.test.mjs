import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const chrome = readFileSync(new URL('../src/ui/v2/dest-chrome-late.css', import.meta.url), 'utf8');

test('desktop multi-day anniversary labels stay above later day cells', () => {
  assert.match(
    chrome,
    /\.bp-day-cell:has\(\.bp-ann-range\.bp-label-spans\)\s*\{\s*z-index:\s*4\s*!important/s,
    'the starting day cell must share the spanning label stacking context',
  );
  assert.match(
    chrome,
    /\.bp-ann-range\.bp-label-spans\s*>\s*\.bp-day-anniversary-label\s*\{[\s\S]*?width:\s*calc\(var\(--ann-span,/,
    'the label must keep using the full weekly range width rather than its first cell width',
  );
});
