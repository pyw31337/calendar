/**
 * Overlay stack: one registry of the top-level dialogs that are open right now, so
 *  - one Esc closes every stacked dialog (asking once if any of them has unsaved edits),
 *  - opening a new top-level dialog from navigation (side nav 설정/공유/캘린더 설정 ...) first
 *    closes the ones underneath instead of leaving two `.modal-container`s open,
 *  - the browser history markers those dialogs pushed (useOverlayHistory) are consumed in one
 *    `history.go(-n)` so Back afterwards behaves exactly as if the dialogs had never been opened.
 *
 * Entries come from two hooks:
 *  - useOverlayHistory (ui-shared.js): `close` consumes its history marker without calling
 *    history.back() itself while a batch close is running (`isBatchClosing()`), and reports it
 *    through `noteMarkerConsumed()`.
 *  - useModalDirtyGuard (core/app-ui-hooks.js): contributes `isDirty` + its `confirm` function so
 *    the stack can keep the existing "저장하지 않은 내용이 있습니다" guard. Its `close` is the raw
 *    (unguarded) close because the stack asks for confirmation once for the whole batch.
 *
 * Pure module (no React). The DOM/history pieces are injectable so node tests can drive it.
 */

const entries = [];
let seq = 0;
let batchDepth = 0;
let batchSeq = 0;
let consumedMarkers = 0;
let escInstalled = false;

export const OVERLAY_CLOSE_CONFIRM_TITLE = '닫기 확인';
export const OVERLAY_CLOSE_CONFIRM_MESSAGE = '저장하지 않은 내용이 있습니다. 닫으시겠습니까?';

function safeCall(fn, fallback) {
  try { return typeof fn === 'function' ? fn() : fallback; } catch (_) { return fallback; }
}

/**
 * @param {{ key?: string, close: Function, isDirty?: Function, confirm?: Function, confirmMessage?: string|Function }} entry
 * @returns {Function} unregister
 */
export function registerOverlay(entry) {
  if (!entry || typeof entry.close !== 'function') return () => {};
  const record = { ...entry, id: ++seq, tick: currentTick() };
  entries.push(record);
  installEscapeHandler();
  const unregister = () => {
    const idx = entries.indexOf(record);
    if (idx >= 0) entries.splice(idx, 1);
  };
  unregister.entry = record;
  return unregister;
}

// Registrations made in the same synchronous run (one React commit: a dialog's own
// useOverlayHistory + its useModalDirtyGuard, or MoreModalBackGate + the AdminModal inside it)
// share a tick, which is how Back finds the unsaved-changes guard that belongs to the dialog it
// is about to close.
let tick = 0;
let tickScheduled = false;
function currentTick() {
  if (!tickScheduled) {
    tickScheduled = true;
    const bump = () => { tick += 1; tickScheduled = false; };
    if (typeof queueMicrotask === 'function') queueMicrotask(bump);
    else Promise.resolve().then(bump);
  }
  return tick;
}

/** The dirty unsaved-changes guard opened together with `record` (same tick), if any. */
export function findDirtyCompanion(record) {
  if (!record) return null;
  return entries.find(e => e !== record && e.tick === record.tick && typeof e.isDirty === 'function' && safeCall(e.isDirty, false)) || null;
}

/** Confirm text for a dirty entry (its own message, else the shared default). */
export function confirmMessageFor(entry) {
  const custom = entry && (typeof entry.confirmMessage === 'function' ? safeCall(entry.confirmMessage, '') : entry.confirmMessage);
  return custom || OVERLAY_CLOSE_CONFIRM_MESSAGE;
}

export function getOpenOverlays() {
  return entries.slice();
}

export function isBatchClosing() {
  return batchDepth > 0;
}

/** Id of the running batch close (0 outside one) -- lets a dialog that registered twice
 * (its own marker + its dirty guard) close only once per batch. */
export function getBatchId() {
  return batchDepth > 0 ? batchSeq : 0;
}

/** useOverlayHistory calls this when a batch close consumed its marker without history.back(). */
export function noteMarkerConsumed() {
  if (batchDepth > 0) consumedMarkers += 1;
}

function defaultConfirm(_title, message, onConfirm) {
  if (typeof window !== 'undefined' && typeof window.confirm === 'function') {
    if (window.confirm(message)) onConfirm();
    return;
  }
  onConfirm();
}

function defaultHistoryGo(n, done) {
  if (typeof window === 'undefined' || !window.history || n <= 0) { done(); return; }
  let finished = false;
  const finish = () => {
    if (finished) return;
    finished = true;
    window.removeEventListener('popstate', finish);
    done();
  };
  window.addEventListener('popstate', finish);
  // Fallback: a traversal that never fires popstate (bfcache quirks) must not strand the caller.
  setTimeout(finish, 450);
  try { window.history.go(-n); } catch (_) { finish(); }
}

/**
 * Close every registered overlay (top first). If any of them reports unsaved edits, ask once
 * using that dialog's own confirm (falls back to `confirm` / window.confirm); cancelling keeps
 * everything open and `onClosed` is not called.
 *
 * @param {{ onClosed?: Function, confirm?: Function, historyGo?: Function, except?: Function }} [options]
 * @returns {boolean} true when it closed (or there was nothing to close) synchronously-or-pending,
 *   false when it is waiting on a confirmation.
 */
export function closeAllOverlays(options = {}) {
  const { onClosed, confirm, historyGo = defaultHistoryGo, except } = options;
  const targets = entries.slice().reverse().filter(e => !(typeof except === 'function' && except(e)));
  const finish = () => { if (typeof onClosed === 'function') onClosed(); };
  if (!targets.length) { finish(); return true; }

  const run = () => {
    batchDepth += 1;
    batchSeq += 1;
    consumedMarkers = 0;
    let consumed;
    try {
      for (const entry of targets) safeCall(() => entry.close({ batch: true }));
    } finally {
      consumed = consumedMarkers;
      consumedMarkers = 0;
      batchDepth -= 1;
    }
    if (consumed > 0) historyGo(consumed, finish);
    else finish();
  };

  const dirty = targets.find(e => safeCall(e.isDirty, false));
  if (dirty) {
    const ask = (typeof dirty.confirm === 'function' && dirty.confirm) || confirm || defaultConfirm;
    ask(OVERLAY_CLOSE_CONFIRM_TITLE, confirmMessageFor(dirty), run);
    return false;
  }
  run();
  return true;
}

/**
 * Esc closes all stacked dialogs. Skips when something else owns Esc right now: an open confirm
 * dialog (it cancels itself), the photo/document lightbox, an IME composition, or a handler that
 * already called preventDefault().
 */
export function shouldHandleEscape(event, doc) {
  if (!event || (event.key !== 'Escape' && event.key !== 'Esc')) return false;
  if (event.defaultPrevented || event.isComposing) return false;
  if (!entries.length) return false;
  const d = doc || (typeof document !== 'undefined' ? document : null);
  if (d && typeof d.querySelector === 'function') {
    if (d.querySelector('.confirm-dialog-modal')) return false;
    if (d.querySelector('.lightbox-overlay, .document-lightbox-modal')) return false;
  }
  return true;
}

export function handleEscapeKey(event) {
  if (!shouldHandleEscape(event)) return false;
  closeAllOverlays();
  return true;
}

function installEscapeHandler() {
  if (escInstalled || typeof window === 'undefined' || typeof window.addEventListener !== 'function') return;
  escInstalled = true;
  window.addEventListener('keydown', handleEscapeKey);
}

/** Test helper: forget every registration. */
export function __resetOverlayStackForTests() {
  entries.length = 0;
  batchDepth = 0;
  consumedMarkers = 0;
}

if (typeof window !== 'undefined') {
  window.GATHER_OVERLAY_STACK = { registerOverlay, closeAllOverlays, getOpenOverlays, isBatchClosing, getBatchId, noteMarkerConsumed };
}
