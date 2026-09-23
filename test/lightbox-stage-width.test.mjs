import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

test('lightbox slide width follows measured stage, not a 0.92 viewport guess', () => {
  const here = dirname(fileURLToPath(import.meta.url));
  const src = readFileSync(join(here, '../src/ui/ui-lightbox.js'), 'utf8');
  assert.match(src, /measuredStageWidth/);
  assert.match(src, /ResizeObserver/);
  assert.doesNotMatch(
    src,
    /innerWidth\)\s*\*\s*\(isLandscape\s*\?\s*1\s*:\s*0\.92\)/,
    'percentage/0.92 viewport estimate must not size slides (causes neighbor bleed)'
  );
  assert.match(src, /lightbox-stage/);
  assert.match(src, /flex:\s*`0 0 \$\{stageWidthPx\}px`/);
});
