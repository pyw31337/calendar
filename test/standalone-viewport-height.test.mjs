import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

// visual-viewport-sync.js stretches the V2 shell to screen.height in iOS home-screen apps, where
// WebKit reports innerHeight one status bar short. Android WebAPKs report innerHeight correctly
// and their screen.height includes the status + navigation bars, so the same stretch pushed the
// bottom of every page (menu FAB, chat composer) under the navigation bar.
const source = fs.readFileSync('src/ui/v2/visual-viewport-sync.js', 'utf8');

function runShell({ userAgent, innerHeight, screenHeight, width, navStandalone = false }) {
  const props = new Map();
  const attrs = new Set();
  const root = {
    classList: { contains: c => c === 'v2-html-active' },
    style: { getPropertyValue: k => props.get(k) || '', setProperty: (k, v) => props.set(k, v), removeProperty: k => props.delete(k) },
    hasAttribute: a => attrs.has(a), setAttribute: a => attrs.add(a), removeAttribute: a => attrs.delete(a),
    clientHeight: innerHeight
  };
  const document = { documentElement: root, body: { querySelectorAll: () => [] }, querySelectorAll: () => [] };
  const window = {
    innerHeight, innerWidth: width,
    screen: { width, height: screenHeight },
    navigator: { userAgent, standalone: navStandalone, maxTouchPoints: 5 },
    matchMedia: q => ({ matches: /display-mode:\s*standalone/.test(q) || (/orientation: landscape/.test(q) && false) }),
    visualViewport: { height: innerHeight, offsetTop: 0, offsetLeft: 0, addEventListener() {} },
    addEventListener() {}
  };
  const context = { window, document, MutationObserver: class { observe() {} }, requestAnimationFrame: fn => fn(), cancelAnimationFrame() {} };
  vm.runInNewContext(source, context);
  return props.get('--app-vv-height');
}

test('Android home-screen app keeps the reported window height', () => {
  const ua = 'Mozilla/5.0 (Linux; Android 14; SM-S918N) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/25.0 Chrome/121.0.0.0 Mobile Safari/537.36';
  assert.equal(runShell({ userAgent: ua, innerHeight: 835, screenHeight: 915, width: 412 }), '835px');
});

test('iOS home-screen app still extends over the status-bar shortfall', () => {
  const ua = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1';
  assert.equal(runShell({ userAgent: ua, innerHeight: 793, screenHeight: 852, width: 393, navStandalone: true }), '852px');
});

test('the menu FAB clears the measured bottom-toolbar gap', () => {
  const css = fs.readFileSync('src/ui/v2/dest-chrome-late.css', 'utf8');
  const rule = css.slice(css.indexOf('.v2-design .bp-home-menu-fab,\n.v2-design .bp-menu-fab {'));
  assert.match(rule.slice(0, 600), /bottom: calc\(24px \+ env\(safe-area-inset-bottom, 0px\) \+ var\(--v2-toolbar-bottom-offset, 0px\)\) !important/);
});
