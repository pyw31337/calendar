import test from 'node:test';
import assert from 'node:assert/strict';
import {
  HOME_SUMMARY_SWIPE_MIN_PX,
  getHomeSummarySwipeAxis,
  getHomeSummarySwipeDirection,
  getHomeSummarySwipeThreshold
} from '../src/ui/home-summary-swipe.js';

test('home summary pager accepts deliberate horizontal swipes only', () => {
  assert.equal(getHomeSummarySwipeAxis(6, 4), '');
  assert.equal(getHomeSummarySwipeAxis(72, 20), 'horizontal');
  assert.equal(getHomeSummarySwipeAxis(20, 72), 'vertical');
  assert.equal(getHomeSummarySwipeDirection(-88, 10, 390), 1);
  assert.equal(getHomeSummarySwipeDirection(88, 10, 390), -1);
  assert.equal(getHomeSummarySwipeDirection(-88, 98, 390), 0);
});

test('home summary swipe threshold remains reachable on narrow displays', () => {
  assert.equal(getHomeSummarySwipeThreshold(220), HOME_SUMMARY_SWIPE_MIN_PX);
  assert.equal(getHomeSummarySwipeThreshold(390), 59);
  assert.ok(getHomeSummarySwipeThreshold(2400) < 100);
});

test('home summary pager nav prevents swipe capture and allows arrow clicks', async () => {
  const fs = await import('node:fs/promises');
  const swipeSource = await fs.readFile(new URL('../src/ui/home-summary-swipe.js', import.meta.url), 'utf8');
  assert.ok(
    swipeSource.includes("export const HOME_SUMMARY_SWIPE_IGNORE = '.home-summary-pager-nav, input, textarea, select, [contenteditable=\"true\"]'"),
    'gesture capture must ignore pager nav and text fields'
  );
  assert.equal(
    swipeSource.includes("'.home-summary-pager-nav, button, a, input, textarea'"),
    false,
    'content buttons and links must still start a swipe (gallery thumbs, place cards)'
  );

  const designSource = await fs.readFile(new URL('../src/ui/v2/design.css', import.meta.url), 'utf8');
  assert.match(
    designSource,
    /\.home-summary-pager-content :is\(button, a, img\) \{[^}]*touch-action:\s*pan-y/,
    'gallery and place controls must yield horizontal pans to the pager'
  );

  const shellSource = await fs.readFile(new URL('../src/ui/ui-app-shell-v2.js', import.meta.url), 'utf8');
  assert.match(
    shellSource,
    /className:\s*'home-summary-pager-nav'[\s\S]*?onPointerDown:\s*e => e\.stopPropagation\(\)/,
    'pager nav container must stop pointer propagation'
  );
  assert.match(
    shellSource,
    /swipe\.changePage\(-1\)/,
    'previous arrow must trigger swipe.changePage(-1)'
  );
  assert.match(
    shellSource,
    /swipe\.changePage\(1\)/,
    'next arrow must trigger swipe.changePage(1)'
  );
});

test('mobile pagination button sizes fit comfortably within 320px viewport', async () => {
  const fs = await import('node:fs/promises');
  const cssSource = await fs.readFile(new URL('../src/app.css', import.meta.url), 'utf8');
  const gallerySection = cssSource.slice(cssSource.indexOf('.gallery-pagination {'));
  const galleryPaginationMobile = gallerySection.match(/@media\s*\(max-width:\s*640px\)[\s\S]*?\.gallery-pagination-button\s*\{([^}]+)\}/);
  assert.ok(galleryPaginationMobile, 'mobile gallery-pagination-button block must exist');
  const buttonBlock = galleryPaginationMobile[1];
  const minWidthMatch = buttonBlock.match(/min-width:\s*(\d+)px/);
  assert.ok(minWidthMatch, 'min-width must be defined');
  const buttonWidth = parseInt(minWidthMatch[1], 10);
  assert.ok(buttonWidth <= 26, `mobile button min-width (${buttonWidth}px) must be <= 26px to fit 320px width with 9 buttons`);
});

