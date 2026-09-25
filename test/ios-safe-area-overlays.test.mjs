import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

// iOS home-screen apps draw under the status bar / home indicator (black-translucent,
// viewport-fit=cover). Anything fixed to the physical screen edges must take the insets itself.
const css = fs.readFileSync('src/ui/v2/dest-chrome-late.css', 'utf8');

test('the phone/tablet side-nav drawer pads for the status bar, home indicator and side notch', () => {
  assert.match(css, /padding: env\(safe-area-inset-top, 0px\) env\(safe-area-inset-right, 0px\) env\(safe-area-inset-bottom, 0px\) 0 !important;/);
  assert.doesNotMatch(css.slice(css.indexOf('Mobile/tablet drawer uses the same expanded PC rail'), css.indexOf('Mobile/tablet drawer uses the same expanded PC rail') + 1600), /\n {4}padding: 0 !important;/);
});

test('bottom-anchored sheets keep their footers above the home indicator', () => {
  const i = css.indexOf('Phone/tablet sheets sit flush on the bottom edge');
  assert.ok(i > 0);
  assert.match(css.slice(i, i + 1200), /padding-bottom: env\(safe-area-inset-bottom, 0px\) !important;/);
});

test('landscape: the shell and the menu FABs clear the side notch', () => {
  assert.match(css, /padding-left: env\(safe-area-inset-left, 0px\) !important;\s*padding-right: env\(safe-area-inset-right, 0px\) !important;/);
  assert.match(css, /right: calc\(20px \+ env\(safe-area-inset-right, 0px\)\) !important;/);
  assert.match(css, /right: calc\(16px \+ env\(safe-area-inset-right, 0px\)\) !important;/);
});
