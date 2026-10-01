import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('lightbox single stage is full-width flex container and does not collapse to 0 width', () => {
  const lightboxJs = fs.readFileSync('src/ui/ui-lightbox.js', 'utf8');

  // Verify lightbox-single-stage container layout
  assert.match(lightboxJs, /className:\s*"lightbox-single-stage"/);
  assert.match(lightboxJs, /className:\s*"lightbox-single-stage"[\s\S]*?display:\s*'flex'/);
  assert.doesNotMatch(lightboxJs, /className:\s*"lightbox-single-stage"[\s\S]{0,150}display:\s*'inline-flex'/);
  assert.doesNotMatch(lightboxJs, /width:\s*isLandscape\s*\?\s*'100vw'\s*:\s*'auto'/);

  // Single stage matches the CSS contract (100% of the measured overlay), not 100vw.
  assert.match(lightboxJs, /className:\s*"lightbox-single-stage"[\s\S]*?width:\s*'100%',\s*maxWidth:\s*'100%'/);
  assert.doesNotMatch(lightboxJs, /maxWidth:\s*'100vw'/);
});

test('stageWidthPx and mobileImageStageStyle use full viewport width to prevent initial right-shift', () => {
  const lightboxJs = fs.readFileSync('src/ui/ui-lightbox.js', 'utf8');

  // stageWidthPx must not downscale portrait photos to 0.92, which previously caused track offset mismatch
  assert.match(lightboxJs, /const stageWidthPx = typeof window === 'undefined'\s*\?\s*640\s*:\s*Math\.max\(240,\s*Math\.round\(vpW\)\);/);
  assert.doesNotMatch(lightboxJs, /Math\.round\(vpW\s*\*\s*\(isLandscape\s*\?\s*1\s*:\s*0\.92\)\)/);

  // Stage width follows the overlay (100%), not the layout viewport (100vw).
  assert.match(lightboxJs, /width:\s*'100%',\s*maxWidth:\s*'100%'/);
  assert.doesNotMatch(lightboxJs, /width:\s*'100vw',\s*maxWidth:\s*'100vw'/);
  assert.doesNotMatch(lightboxJs, /width:\s*isLandscape\s*\?\s*'100vw'\s*:\s*'92vw'/);
});

test('thumbnail image is bounded with 100% width/height and object-fit contain for exact 0ms centering', () => {
  const lightboxJs = fs.readFileSync('src/ui/ui-lightbox.js', 'utf8');

  // Thumbnail in both carousel and single-stage has 100% width & height with object-fit: contain
  const thumbMatches = [...lightboxJs.matchAll(/className:\s*"lightbox-thumb-img"[\s\S]*?objectFit:\s*'contain'/g)];
  assert.ok(thumbMatches.length >= 3, 'all lightbox-thumb-img instances enforce objectFit contain');

  for (const m of thumbMatches) {
    assert.match(m[0], /position:\s*'absolute'/);
    assert.match(m[0], /inset:\s*0/);
    assert.match(m[0], /margin:\s*'auto'/);
  }
});

test('viewport-shell.css includes .lightbox-single-stage in 100% width rule', () => {
  const css = fs.readFileSync('src/ui/v2/viewport-shell.css', 'utf8');
  assert.match(css, /\.lightbox-overlay\s+\.lightbox-single-stage/);
  assert.match(css, /width:\s*100%\s*!important/);
});
