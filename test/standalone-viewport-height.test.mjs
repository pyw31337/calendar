import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

// visual-viewport-sync.js stretches the V2 shell to screen.height in iOS home-screen apps, where
// WebKit reports innerHeight one status bar short. Android WebAPKs report innerHeight correctly
// and their screen.height includes the status + navigation bars, so the same stretch pushed the
// bottom of every page (menu FAB, chat composer) under the navigation bar.
const source = fs.readFileSync('src/ui/v2/visual-viewport-sync.js', 'utf8');

function runShell({ userAgent, innerHeight, screenHeight, width, innerWidth = width, navStandalone = false, visualViewport = {}, activeElement = null, clientHeight = null }) {
  const props = new Map();
  const attrs = new Set();
  const listeners = { window: new Map(), document: new Map(), serviceWorker: new Map() };
  const on = bucket => (type, fn) => {
    if (!bucket.has(type)) bucket.set(type, []);
    bucket.get(type).push(fn);
  };
  const timers = [];
  const root = {
    classList: { contains: c => c === 'v2-html-active' },
    style: { getPropertyValue: k => props.get(k) || '', setProperty: (k, v) => props.set(k, v), removeProperty: k => props.delete(k) },
    hasAttribute: a => attrs.has(a), setAttribute: a => attrs.add(a), removeAttribute: a => attrs.delete(a),
    clientHeight: clientHeight == null ? innerHeight : clientHeight
  };
  const body = { querySelectorAll: () => [] };
  const document = {
    documentElement: root, body, querySelectorAll: () => [],
    activeElement: activeElement || body,
    visibilityState: 'visible',
    addEventListener: on(listeners.document), removeEventListener() {}
  };
  const serviceWorker = {
    addEventListener: on(listeners.serviceWorker), removeEventListener() {}
  };
  const window = {
    innerHeight, innerWidth,
    screen: { width, height: screenHeight },
    navigator: { userAgent, standalone: navStandalone, maxTouchPoints: 5, serviceWorker },
    matchMedia: q => ({ matches: (navStandalone && /display-mode:\s*standalone/.test(q)) || (/orientation: landscape/.test(q) && false) }),
    visualViewport: { height: innerHeight, offsetTop: 0, offsetLeft: 0, scale: 1, addEventListener() {}, ...visualViewport },
    addEventListener: on(listeners.window), removeEventListener() {}
  };
  const context = {
    window, document,
    MutationObserver: class { observe() {} },
    ResizeObserver: class { observe() {} disconnect() {} },
    requestAnimationFrame: fn => fn(), cancelAnimationFrame() {},
    setTimeout: fn => { timers.push(fn); return timers.length; }, clearTimeout() {}
  };
  vm.runInNewContext(source, context);
  const read = () => ({
    height: props.get('--app-vv-height'),
    standaloneTopInset: props.get('--app-vv-standalone-top-inset'),
    keyboard: attrs.has('data-v2-keyboard'),
  });
  return {
    ...read(),
    read, window, document, timers, serviceWorker,
    fire: (target, type, event) => (listeners[target].get(type) || []).forEach(fn => fn(event || { persisted: true })),
    has: (target, type) => listeners[target].has(type),
  };
}

test('Android home-screen app keeps the reported window height', () => {
  const ua = 'Mozilla/5.0 (Linux; Android 14; SM-S918N) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/25.0 Chrome/121.0.0.0 Mobile Safari/537.36';
  const result = runShell({ userAgent: ua, innerHeight: 835, screenHeight: 915, width: 412 });
  assert.equal(result.height, '835px');
  assert.equal(result.standaloneTopInset, '0px');
});

test('iOS home-screen app still extends over the status-bar shortfall', () => {
  const ua = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1';
  const result = runShell({ userAgent: ua, innerHeight: 793, screenHeight: 852, width: 393, navStandalone: true });
  assert.equal(result.height, '852px');
  assert.equal(result.standaloneTopInset, '59px');
});

test('compact iOS standalone keeps its full height while a focused control has changed the viewport width', () => {
  const ua = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1';
  const result = runShell({
    userAgent: ua,
    innerHeight: 793,
    screenHeight: 852,
    width: 393,
    innerWidth: 327,
    navStandalone: true,
    visualViewport: { height: 660, scale: 1.2 },
  });
  assert.equal(result.height, '852px');
  assert.equal(result.standaloneTopInset, '59px');
});

test('mobile Safari fits the shell to browser chrome without calling it a keyboard', () => {
  const ua = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1';
  const result = runShell({
    userAgent: ua,
    innerHeight: 800,
    screenHeight: 852,
    width: 390,
    visualViewport: { height: 720, offsetTop: 0, scale: 1 },
  });
  assert.equal(result.height, '720px');
  assert.equal(result.keyboard, false);
  assert.equal(result.standaloneTopInset, '0px');
});

test('a keyboard-sized shrink still pins the shell and marks the keyboard', () => {
  const ua = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1';
  const result = runShell({
    userAgent: ua,
    innerHeight: 800,
    screenHeight: 852,
    width: 390,
    visualViewport: { height: 420, offsetTop: 0, scale: 1 },
    activeElement: { tagName: 'TEXTAREA' },
  });
  assert.equal(result.height, '420px');
  assert.equal(result.keyboard, true);
});

const IOS_UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1';

test('home-screen app opened from a notification ignores a stale short window height', () => {
  // Tapping a KakaoTalk-style notification: WebKit still reports the window at
  // ~60% of the screen while the app switch settles. Nothing is focused.
  const result = runShell({ userAgent: IOS_UA, innerHeight: 510, screenHeight: 852, width: 393, navStandalone: true });
  assert.equal(result.height, '852px');
  assert.equal(result.keyboard, false);
  // Not a 342px status bar: no previous real inset, so reserve nothing extra.
  assert.equal(result.standaloneTopInset, '0px');
});

test('home-screen app ignores a keyboard-sized visual viewport when no field is focused', () => {
  const result = runShell({
    userAgent: IOS_UA, innerHeight: 793, screenHeight: 852, width: 393, navStandalone: true,
    visualViewport: { height: 480, offsetTop: 0, scale: 1 },
  });
  assert.equal(result.height, '852px');
  assert.equal(result.keyboard, false);
  assert.equal(result.standaloneTopInset, '59px');
});

test('home-screen app does not treat a small leftover shrink as browser chrome', () => {
  const result = runShell({
    userAgent: IOS_UA, innerHeight: 793, screenHeight: 852, width: 393, navStandalone: true,
    visualViewport: { height: 700, offsetTop: 0, scale: 1 },
  });
  assert.equal(result.height, '852px');
  assert.equal(result.keyboard, false);
});

test('mobile Safari ignores a keyboard-sized shrink when no field is focused', () => {
  const result = runShell({
    userAgent: IOS_UA, innerHeight: 800, screenHeight: 852, width: 390,
    visualViewport: { height: 420, offsetTop: 0, scale: 1 },
  });
  assert.equal(result.height, '800px');
  assert.equal(result.keyboard, false);
});

test('home-screen chat/memo composer still follows the keyboard while its field is focused', () => {
  const result = runShell({
    userAgent: IOS_UA, innerHeight: 793, screenHeight: 852, width: 393, navStandalone: true,
    visualViewport: { height: 450, offsetTop: 0, scale: 1 },
    activeElement: { tagName: 'TEXTAREA' },
  });
  assert.equal(result.height, '450px');
  assert.equal(result.keyboard, true);
});

test('the shell height is recomputed when the app comes back, not only on resize', () => {
  const result = runShell({ userAgent: IOS_UA, innerHeight: 800, screenHeight: 852, width: 390 });
  for (const type of ['resize', 'pageshow', 'focus', 'orientationchange']) {
    assert.ok(result.has('window', type), `window ${type} listener`);
  }
  assert.ok(result.has('document', 'visibilitychange'), 'visibilitychange listener');
  assert.ok(result.has('document', 'focusout'), 'focusout listener');
  assert.ok(result.has('serviceWorker', 'message'), 'serviceWorker message listener');
  // Cold start schedules settle re-measures too (a notification tap can land mid-transition).
  assert.ok(result.timers.length >= 4);

  const shrink = () => {
    result.window.innerHeight = 500;
    result.window.visualViewport.height = 500;
    result.document.documentElement.clientHeight = 500;
  };
  const grow = () => {
    result.window.innerHeight = 800;
    result.window.visualViewport.height = 800;
    result.document.documentElement.clientHeight = 800;
  };

  // Both layout metrics went short mid-transition (no resize when they recover).
  shrink();
  result.fire('window', 'resize');
  assert.equal(result.read().height, '500px');
  grow();
  result.fire('window', 'pageshow');
  assert.equal(result.read().height, '800px');

  shrink();
  result.fire('window', 'resize');
  grow();
  result.document.visibilityState = 'visible';
  result.fire('document', 'visibilitychange');
  assert.equal(result.read().height, '800px');

  // A settle timer alone also catches a late update.
  shrink();
  result.fire('window', 'resize');
  result.fire('window', 'focus');
  grow();
  result.timers.at(-1)();
  assert.equal(result.read().height, '800px');

  // Closing the keyboard (focusout) re-settles to the full height.
  shrink();
  result.fire('window', 'resize');
  grow();
  result.fire('document', 'focusout');
  assert.equal(result.read().height, '800px');

  // sw.js notificationclick posts {type:'notification-open'} to an open client.
  shrink();
  result.fire('window', 'resize');
  grow();
  result.fire('serviceWorker', 'message', { data: { type: 'notification-open', url: './?view=chat' } });
  assert.equal(result.read().height, '800px');
});

test('prefers documentElement.clientHeight when innerHeight is stale and shorter', () => {
  const result = runShell({
    userAgent: IOS_UA, innerHeight: 500, clientHeight: 800, screenHeight: 852, width: 390,
  });
  assert.equal(result.height, '800px');
  assert.equal(result.keyboard, false);
});

test('iOS input controls use a 16px-equivalent mobile token so Safari does not auto-zoom', () => {
  const css = fs.readFileSync('src/ui/v2/viewport-shell.css', 'utf8');
  assert.match(css, /--v2-mobile-control-font-size:\s*max\(16px, 1rem\)/);
  assert.match(css, /textarea,\s*html:has\(\.renewal-shell\.v2-design\) \.renewal-shell\.v2-design select[\s\S]*font-size:\s*var\(--v2-mobile-control-font-size\)\s*!important/);
});

test('touch devices floor every text control at 16px, including landscape and portaled sheets', () => {
  const css = fs.readFileSync('src/ui/v2/viewport-shell.css', 'utf8');
  assert.match(css, /@media \(hover: none\) and \(pointer: coarse\)/);
  assert.match(css, /html:has\(\.renewal-shell\.v2-design\) :is\([\s\S]*\[contenteditable='true'\][\s\S]*font-size:\s*max\(16px, 1rem\)\s*!important/);
  assert.match(css, /touch-action:\s*manipulation/);
});

test('a focused field is revealed by its scroll ancestor, not by scrolling the window', () => {
  assert.match(source, /const revealFocusedControl = \(\) =>/);
  assert.match(source, /node\.scrollTop \+= delta/);
  assert.match(source, /date-modal-field-with-actions/);
  assert.doesNotMatch(source, /scrollIntoView/);
  assert.doesNotMatch(source, /style\.position === 'fixed'\) return/);
});

test('the home scrollport uses overflow-x clip so the sticky hero survives in WebKit', () => {
  const css = fs.readFileSync('src/ui/v2/viewport-shell.css', 'utf8');
  const rule = css.slice(css.indexOf('.renewal-shell.v2-design > main.bp-app-shell.is-bento-home'));
  assert.match(rule.slice(0, 500), /overflow-x: hidden !important;\s*\/\*[\s\S]*?\*\/\s*overflow-x: clip !important;/);
});

test('the menu FAB clears the measured bottom-toolbar gap', () => {
  const css = fs.readFileSync('src/ui/v2/dest-chrome-late.css', 'utf8');
  const rule = css.slice(css.indexOf('.v2-design .bp-home-menu-fab,\n.v2-design .bp-menu-fab {'));
  assert.match(rule.slice(0, 600), /bottom: calc\(24px \+ env\(safe-area-inset-bottom, 0px\) \+ var\(--v2-toolbar-bottom-offset, 0px\)\) !important/);
});
