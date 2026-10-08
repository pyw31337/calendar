import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  registerOverlay, closeAllOverlays, getOpenOverlays, isBatchClosing, noteMarkerConsumed,
  shouldHandleEscape, findDirtyCompanion, confirmMessageFor, __resetOverlayStackForTests,
  OVERLAY_CLOSE_CONFIRM_MESSAGE,
} from '../src/ui/overlay-stack.js';

// A useOverlayHistory-like entry: during a batch close it consumes its marker instead of calling
// history.back() itself.
function markerOverlay(log, name) {
  let open = true;
  const unregister = registerOverlay({
    key: name,
    close: () => {
      if (!open) return;
      open = false;
      if (isBatchClosing()) noteMarkerConsumed();
      log.push(name);
      unregister();
    },
  });
  return { isOpen: () => open, unregister };
}

test('closeAllOverlays closes top-first and pops every consumed marker with one history.go', () => {
  __resetOverlayStackForTests();
  const log = [];
  markerOverlay(log, 'settlement-editor');
  markerOverlay(log, 'more-app-settings');
  const goes = [];
  let closed = 0;
  const done = closeAllOverlays({ historyGo: (n, finish) => { goes.push(n); finish(); }, onClosed: () => { closed += 1; } });
  assert.equal(done, true);
  assert.deepEqual(log, ['more-app-settings', 'settlement-editor']);
  assert.deepEqual(goes, [2], 'both history markers are consumed in a single traversal');
  assert.equal(closed, 1);
  assert.equal(getOpenOverlays().length, 0);
  assert.equal(isBatchClosing(), false);
});

test('nothing open: onClosed runs immediately (navigation opens the new dialog right away)', () => {
  __resetOverlayStackForTests();
  let opened = false;
  closeAllOverlays({ historyGo: () => assert.fail('no traversal expected'), onClosed: () => { opened = true; } });
  assert.equal(opened, true);
});

test('a dirty dialog keeps its unsaved-changes guard: cancel keeps everything, confirm closes all', () => {
  __resetOverlayStackForTests();
  const log = [];
  markerOverlay(log, 'settlement-editor');
  let dirty = true;
  const asked = [];
  let pendingConfirm = null;
  const unregisterGuard = registerOverlay({
    key: 'dirty-guard',
    close: () => { log.push('memo-editor'); unregisterGuard(); },
    isDirty: () => dirty,
    confirm: (title, message, onConfirm) => { asked.push([title, message]); pendingConfirm = onConfirm; },
    confirmMessage: () => '초안은 남아요',
  });
  markerOverlay(log, 'more-share');
  let opened = 0;
  const result = closeAllOverlays({ historyGo: (n, finish) => finish(), onClosed: () => { opened += 1; } });
  assert.equal(result, false, 'waits for the confirmation');
  assert.deepEqual(asked, [['닫기 확인', '초안은 남아요']], 'asked exactly once with the dialog\'s own message');
  assert.deepEqual(log, [], 'nothing closed while the confirm is pending (cancel = stay put)');
  assert.equal(opened, 0);
  pendingConfirm();
  assert.deepEqual(log, ['more-share', 'memo-editor', 'settlement-editor']);
  assert.equal(opened, 1);
  dirty = false;
});

test('Escape handling defers to confirm dialogs, lightboxes, IME and handled events', () => {
  __resetOverlayStackForTests();
  const ev = (extra = {}) => ({ key: 'Escape', defaultPrevented: false, isComposing: false, ...extra });
  const doc = (match) => ({ querySelector: (sel) => (match && sel.includes(match) ? {} : null) });
  assert.equal(shouldHandleEscape(ev(), doc(null)), false, 'no dialogs open -> not ours');
  const unregister = registerOverlay({ key: 'x', close: () => {} });
  assert.equal(shouldHandleEscape(ev(), doc(null)), true);
  assert.equal(shouldHandleEscape(ev({ key: 'Enter' }), doc(null)), false);
  assert.equal(shouldHandleEscape(ev({ isComposing: true }), doc(null)), false);
  assert.equal(shouldHandleEscape(ev({ defaultPrevented: true }), doc(null)), false);
  assert.equal(shouldHandleEscape(ev(), doc('.confirm-dialog-modal')), false);
  assert.equal(shouldHandleEscape(ev(), doc('.lightbox-overlay')), false);
  unregister();
});

test('Back finds the unsaved-changes guard opened in the same commit as the dialog only', async () => {
  __resetOverlayStackForTests();
  const olderGuard = registerOverlay({ key: 'dirty-guard', close: () => {}, isDirty: () => true });
  await Promise.resolve();
  const guard = registerOverlay({ key: 'dirty-guard', close: () => {}, isDirty: () => true, confirmMessage: '' });
  const gate = registerOverlay({ key: 'more-calendar-settings', close: () => {} });
  assert.equal(findDirtyCompanion(gate.entry), guard.entry, 'AdminModal guard + MoreModalBackGate share a tick');
  await Promise.resolve();
  const later = registerOverlay({ key: 'more-share', close: () => {} });
  assert.equal(findDirtyCompanion(later.entry), null, 'an older dirty dialog underneath is not this dialog\'s guard');
  assert.equal(confirmMessageFor(guard.entry), OVERLAY_CLOSE_CONFIRM_MESSAGE);
  olderGuard(); guard(); gate(); later();
});

test('useOverlayHistory closes on its own button (regression: X only popped history) and joins the stack', async () => {
  const src = await readFile(new URL('../src/ui/ui-shared.js', import.meta.url), 'utf8');
  const body = src.slice(src.indexOf('export function useOverlayHistory'), src.indexOf('return requestClose;'));
  assert.match(body, /if \(markerOnTop\) \{\s*markerRef\.current = false;\s*runClose\(\);\s*try \{ window\.history\.back\(\);/, 'close button closes, then consumes the marker');
  assert.match(body, /event\.isTrusted && window\.history\.state && window\.history\.state\[instanceKey\]\) return;/, 'Back over a stacked dialog leaves the lower one open');
  assert.match(body, /registerOverlay\(\{ key, close: \(\) => requestClose\(\) \}\)/);
  assert.match(body, /findDirtyCompanion\(stackEntry\)/, 'Back respects the unsaved-changes guard');
  const hooks = await readFile(new URL('../src/core/app-ui-hooks.js', import.meta.url), 'utf8');
  assert.match(hooks, /registerOverlay\(\{\s*key: 'dirty-guard'/, 'dirty guards report into the stack');
});

test('navigation opens a top-level dialog only after the stack closed', async () => {
  const shell = await readFile(new URL('../src/ui/ui-app-shell-v2.js', import.meta.url), 'utf8');
  const fn = shell.slice(shell.indexOf('const openMoreModalById = (id) => {'), shell.indexOf('const handleSelectMoreItem'));
  assert.match(fn, /closeAllOverlays\(\{\s*onClosed: \(\) => \{ Promise\.resolve\(trigger\(\)\)\.then\(\(\) => setOpenMoreModal\(id\)\)/);
  assert.match(fn, /if \(id === 'search'\) \{ openSearch\(\); return; \}/, '더보기 검색 opens the same 통합검색 page');
});
