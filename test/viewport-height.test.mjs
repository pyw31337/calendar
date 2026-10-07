import test from 'node:test';
import assert from 'node:assert/strict';
import { toolbarKeyboardGap, isTextEntryFocused, installToolbarOffsetSync, SETTLE_DELAYS_MS } from '../src/core/viewport-height.js';
import { readAppVvHeight, subscribeAppVvRemeasure } from '../src/core/app-vv-measure.js';

// WebKit bug 254868: an installed iOS app opened from a notification can report a short,
// stale visualViewport. Only a focused text control may make the toolbar follow a keyboard gap.

test('stale keyboard-sized gap with nothing focused is ignored', () => {
  assert.equal(toolbarKeyboardGap({ innerHeight: 852, vvHeight: 510, textFocused: false }), 0);
  assert.equal(toolbarKeyboardGap({ innerHeight: 852, vvHeight: 510, textFocused: false, standalone: true }), 0);
});

test('a focused text field still follows the keyboard gap', () => {
  assert.equal(toolbarKeyboardGap({ innerHeight: 852, vvHeight: 500, offsetTop: 20, textFocused: true }), 332);
  assert.equal(toolbarKeyboardGap({ innerHeight: 852, vvHeight: 500, textFocused: true, standalone: true }), 352);
});

test('browser-tab bottom toolbar gap is kept, but an installed app has no toolbar', () => {
  assert.equal(toolbarKeyboardGap({ innerHeight: 800, vvHeight: 744, textFocused: false }), 56);
  assert.equal(toolbarKeyboardGap({ innerHeight: 800, vvHeight: 744, textFocused: false, standalone: true }), 0);
  assert.equal(toolbarKeyboardGap({ innerHeight: 500, vvHeight: 800, textFocused: true }), 0);
});

test('only controls that can raise the keyboard count as focused text entry', () => {
  const body = { tagName: 'BODY' };
  assert.equal(isTextEntryFocused(body, body), false);
  assert.equal(isTextEntryFocused(null, body), false);
  assert.equal(isTextEntryFocused({ tagName: 'TEXTAREA' }, body), true);
  assert.equal(isTextEntryFocused({ tagName: 'INPUT', type: 'search' }, body), true);
  assert.equal(isTextEntryFocused({ tagName: 'INPUT', type: 'checkbox' }, body), false);
  assert.equal(isTextEntryFocused({ tagName: 'BUTTON' }, body), false);
  assert.equal(isTextEntryFocused({ tagName: 'DIV', isContentEditable: true }, body), true);
});

test('offset is re-measured on return signals with late settle passes', () => {
  const listeners = new Map();
  const on = scope => ({
    addEventListener: (t, fn) => listeners.set(`${scope}:${t}`, fn),
    removeEventListener: t => listeners.delete(`${scope}:${t}`),
  });
  const props = new Map();
  const timers = [];
  const vv = { height: 852, offsetTop: 0, ...on('vv') };
  const win = {
    innerHeight: 852, visualViewport: vv, ...on('win'),
    navigator: { standalone: true, serviceWorker: on('sw') },
    requestAnimationFrame: fn => { fn(); return 1; }, cancelAnimationFrame() {},
    setTimeout: (fn, ms) => { timers.push({ fn, ms }); return timers.length; }, clearTimeout() {},
  };
  const body = { tagName: 'BODY' };
  const doc = {
    body, activeElement: body, visibilityState: 'visible', ...on('doc'),
    documentElement: { style: { setProperty: (k, v) => props.set(k, v) } },
  };
  const cleanup = installToolbarOffsetSync(win, doc);
  for (const key of ['vv:resize', 'win:resize', 'win:pageshow', 'win:focus', 'win:orientationchange', 'doc:focusout', 'doc:visibilitychange', 'sw:message']) {
    assert.ok(listeners.has(key), key);
  }
  assert.deepEqual(timers.map(t => t.ms), SETTLE_DELAYS_MS);
  // Notification tap: stale short viewport, nothing focused -> no offset.
  vv.height = 510;
  timers.length = 0;
  listeners.get('sw:message')({ data: { type: 'notification-open' } });
  assert.equal(props.get('--v2-toolbar-bottom-offset'), '0px');
  assert.deepEqual(timers.map(t => t.ms), SETTLE_DELAYS_MS);
  // Keyboard open in a focused field follows it; closing it (focusout) settles back.
  doc.activeElement = { tagName: 'TEXTAREA' };
  listeners.get('vv:resize')();
  assert.equal(props.get('--v2-toolbar-bottom-offset'), '342px');
  doc.activeElement = body;
  vv.height = 852;
  listeners.get('doc:focusout')();
  assert.equal(props.get('--v2-toolbar-bottom-offset'), '0px');
  cleanup();
  assert.equal(listeners.size, 0);
});

test('readAppVvHeight prefers --app-vv-height over raw visualViewport', () => {
  const doc = { documentElement: { style: { getPropertyValue: (k) => k === '--app-vv-height' ? '800px' : '' } } };
  const win = { visualViewport: { height: 510 }, innerHeight: 510 };
  assert.equal(readAppVvHeight(win, doc), 800);
});

test('subscribeAppVvRemeasure listens for pageshow/visibility/focus/notification-open', () => {
  const listeners = new Map();
  const on = scope => ({
    addEventListener: (t, fn) => listeners.set(`${scope}:${t}`, fn),
    removeEventListener: t => listeners.delete(`${scope}:${t}`),
  });
  const vv = { height: 800, ...on('vv') };
  const win = {
    visualViewport: vv, innerHeight: 800, ...on('win'),
    navigator: { serviceWorker: on('sw') },
    requestAnimationFrame: fn => { fn(); return 1; }, cancelAnimationFrame() {},
    setTimeout: () => 1, clearTimeout() {},
  };
  const doc = { visibilityState: 'visible', ...on('doc'), documentElement: { style: { getPropertyValue: () => '' } } };
  let calls = 0;
  const cleanup = subscribeAppVvRemeasure(() => { calls += 1; }, win, doc);
  for (const key of ['vv:resize', 'win:resize', 'win:pageshow', 'win:focus', 'win:orientationchange', 'doc:visibilitychange', 'sw:message']) {
    assert.ok(listeners.has(key), key);
  }
  const before = calls;
  listeners.get('sw:message')({ data: { type: 'notification-open' } });
  assert.ok(calls > before);
  cleanup();
});
