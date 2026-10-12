/**
 * '되돌리기' at the right end of a success toast: every toast that confirms a finished change
 * offers to take that change back.
 *
 * `undo` must reverse only what that one action changed, applied to the current data (never a
 * stale snapshot of everything), so whatever someone else changed meanwhile is kept. It runs at
 * most once. Its outcome is a plain toast without another 되돌리기 -- undoing the undo would just
 * be the original action again. `undo` may return false (nothing reversed) or a message string.
 */
export const UNDO_TOAST_MS = 6000;

// `onExpire` runs once the toast closed without 되돌리기 (e.g. deleting a file the change
// replaced, which 되돌리기 still needs until then); never after 되돌리기 was pressed.
export function showUndoableToast(showToast, message, undo, {
  duration = UNDO_TOAST_MS,
  doneMessage = '되돌렸습니다.',
  failMessage = '되돌리지 못했습니다.',
  extraActions = [],
  type = 'success',
  onExpire = null,
} = {}) {
  if (typeof showToast !== 'function') return;
  if (typeof undo !== 'function') {
    showToast(message, type, extraActions.length ? duration : 3000, null, onExpire, undefined, extraActions);
    return;
  }
  let used = false;
  const expire = typeof onExpire === 'function' ? () => (used ? undefined : onExpire()) : null;
  showToast(message, type, duration, async () => {
    if (used) return;
    used = true;
    try {
      const result = await undo();
      if (result === false) showToast(failMessage, 'error', 4000);
      else showToast(typeof result === 'string' && result ? result : doneMessage, 'success', 3000);
    } catch (error) {
      console.error('undo failed:', error);
      showToast(failMessage, 'error', 4000);
    }
  }, expire, '되돌리기', extraActions);
}
