import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

test('lightbox slide width is corrected from the measured stage', () => {
  const here = dirname(fileURLToPath(import.meta.url));
  const sync = readFileSync(join(here, '../src/ui/v2/visual-viewport-sync.js'), 'utf8');
  assert.match(sync, /lightbox-stage/);
  assert.match(sync, /lightbox-slide/);
  assert.match(sync, /getBoundingClientRect/);
  assert.match(sync, /ResizeObserver/);
  // Track transform must be rebased to measured width so a 0.92*viewport guess cannot show a neighbor.
  assert.match(sync, /translate3d/);
  const lightbox = readFileSync(join(here, '../src/ui/ui-lightbox.js'), 'utf8');
  assert.match(lightbox, /lightbox-stage/);
  assert.match(lightbox, /flex:\s*`0 0 \$\{stageWidthPx\}px`/);
});
