// Behavioural test for useOverlayHistory + overlay-stack with a fake browser history and a tiny
// hook runtime (no DOM): stacked dialogs, Back, close buttons, one Esc closing everything.
import test from 'node:test';
import assert from 'node:assert/strict';

function createHistory() {
  const entries = [{ state: null }];
  let index = 0;
  const listeners = new Set();
  const fire = () => { for (const fn of [...listeners]) fn({ isTrusted: true }); };
  return {
    listeners,
    history: {
      get state() { return entries[index].state; },
      get length() { return entries.length; },
      pushState(state) { entries.splice(index + 1); entries.push({ state }); index += 1; },
      replaceState(state) { entries[index] = { state }; },
      back() { this.go(-1); },
      go(n) { const next = Math.max(0, Math.min(entries.length - 1, index + n)); if (next !== index) { index = next; fire(); } },
    },
    depth: () => index,
  };
}

const h = createHistory();
const windowListeners = { popstate: h.listeners, keydown: new Set() };
globalThis.window = {
  history: h.history,
  location: { href: 'https://example.test/calendar/?id=cw' },
  addEventListener: (type, fn) => { (windowListeners[type] ||= new Set()).add(fn); },
  removeEventListener: (type, fn) => { windowListeners[type]?.delete(fn); },
};

// Minimal hook runtime: one "component" = one hook call; mount runs effects, unmount cleans up.
function mountHook(hookFn) {
  const refs = [];
  const cleanups = [];
  let i = 0;
  globalThis.window.React = {
    useRef: (v) => { const idx = i++; if (!refs[idx]) refs[idx] = { current: v }; return refs[idx]; },
    useCallback: (fn) => fn,
    useEffect: (fn) => { const c = fn(); if (typeof c === 'function') cleanups.push(c); },
  };
  const result = hookFn();
  return { result, unmount: () => { while (cleanups.length) cleanups.pop()(); } };
}

const { useOverlayHistory } = await import('../src/ui/ui-shared.js');
const stack = await import('../src/ui/overlay-stack.js');

function openDialog(name, log, key = 'layer-popup') {
  let mounted = null;
  const onClose = () => { log.push(name); if (mounted) { const m = mounted; mounted = null; m.unmount(); } };
  mounted = mountHook(() => useOverlayHistory(onClose, { enabled: true, key }));
  return { close: () => mounted && mounted.result(), isOpen: () => !!mounted };
}

test('Back over two stacked dialogs with the same key closes only the top one', () => {
  stack.__resetOverlayStackForTests();
  const log = [];
  const start = h.depth();
  const a = openDialog('A', log);
  const b = openDialog('B', log);
  assert.equal(h.depth(), start + 2);
  h.history.back();
  assert.deepEqual(log, ['B']);
  assert.equal(a.isOpen(), true, 'lower dialog stays open');
  h.history.back();
  assert.deepEqual(log, ['B', 'A']);
  assert.equal(h.depth(), start, 'no stale entries left behind');
  assert.equal(b.isOpen(), false);
});

test('close button closes the dialog and consumes its history marker', () => {
  stack.__resetOverlayStackForTests();
  const log = [];
  const start = h.depth();
  const a = openDialog('settings', log, 'more-app-settings');
  a.close();
  assert.deepEqual(log, ['settings']);
  assert.equal(h.depth(), start, 'marker popped, so the next Back does not hit a ghost entry');
});

test('one Esc closes every stacked dialog and pops all markers in one traversal', async () => {
  stack.__resetOverlayStackForTests();
  const log = [];
  const start = h.depth();
  openDialog('editor', log, 'settlement-editor');
  openDialog('settings', log, 'more-app-settings');
  const goes = [];
  const realGo = h.history.go.bind(h.history);
  h.history.go = (n) => { goes.push(n); realGo(n); };
  for (const fn of windowListeners.keydown) fn({ key: 'Escape', defaultPrevented: false, isComposing: false });
  h.history.go = realGo;
  assert.deepEqual(log, ['settings', 'editor']);
  assert.deepEqual(goes, [-2]);
  assert.equal(h.depth(), start);
  assert.equal(stack.getOpenOverlays().length, 0);
});

test('Back on a dialog with unsaved edits asks first; cancel keeps it open with its marker', async () => {
  stack.__resetOverlayStackForTests();
  const log = [];
  const start = h.depth();
  let pending = null;
  const unregisterGuard = stack.registerOverlay({ key: 'dirty-guard', close: () => {}, isDirty: () => true, confirm: (_t, _m, ok) => { pending = ok; } });
  const d = openDialog('memo-editor', log, 'memo-editor');
  h.history.back();
  assert.equal(typeof pending, 'function', 'confirm requested');
  assert.deepEqual(log, [], 'still open while asking');
  assert.equal(h.depth(), start + 1, 'marker restored');
  pending();
  assert.deepEqual(log, ['memo-editor']);
  assert.equal(h.depth(), start);
  assert.equal(d.isOpen(), false);
  unregisterGuard();
});
