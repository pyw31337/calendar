import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const files = [
  'src/ui/v2/dest-chrome-late.css',
  'src/ui/v2/screens.css',
  'src/ui/v2/design.css',
];

const BG_FFF =
  /background(?:-color)?\s*:\s*#(?:fff|ffffff)\b/i;
const BG_FAFAFC =
  /background(?:-color)?\s*:\s*#(?:fafafc)\b/i;
const COLOR_MIX_FFF = /color-mix\([^)]*#(?:fff|ffffff)/i;

for (const rel of files) {
  test(`${rel} surfaces use theme tokens (no #fff/#fafafc backgrounds)`, () => {
    const css = readFileSync(join(root, rel), 'utf8');
    assert.equal(BG_FFF.test(css), false, `${rel} still has #fff background`);
    assert.equal(BG_FAFAFC.test(css), false, `${rel} still has #fafafc background`);
    assert.equal(COLOR_MIX_FFF.test(css), false, `${rel} still mixes against literal #fff`);
  });
}
