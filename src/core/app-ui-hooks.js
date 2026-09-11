/**
 * docs/app-main-split-units.md U2: three standalone hooks that already lived outside the
 * CalendarApp closure (they take their own args/state, no CalendarApp-scoped variables), just
 * needed moving into their own module. Same `const React = window.React;` per-function pattern
 * as use-scroll-hide-header.js.
 */

// Tracks which message row's edit/delete controls should be revealed: desktop hover is
// handled purely in CSS (see .msg-row-hover:hover), this only drives the mobile tap case --
// tapping a row reveals its controls, tapping anywhere else (including another row) hides them.
export function useTapRevealedMsgId() {
  const React = window.React;
  const [revealedId, setRevealedId] = React.useState(null);
  React.useEffect(() => {
    const handler = e => {
      const target = e.target.closest ? e.target.closest('[data-msg-row-id]') : null;
      setRevealedId(target ? target.getAttribute('data-msg-row-id') : null);
    };
    document.addEventListener('touchstart', handler, { passive: true });
    document.addEventListener('mousedown', handler);
    return () => {
      document.removeEventListener('touchstart', handler);
      document.removeEventListener('mousedown', handler);
    };
  }, []);
  return revealedId;
}

// Snapshot-based close guard for layer popups: capture the draft state when a modal becomes
// active (or when a caller explicitly resets the baseline) and only ask for confirmation when
// the current snapshot no longer matches that baseline. This keeps "opened then immediately
// closed" silent, but still catches actual unsaved edits across text fields, toggles, selects,
// reorders, and other non-text controls.
export function useModalDirtyGuard(onClose, onRequestConfirm, message, active = true, getSnapshot = null, resetKey = '') {
  const React = window.React;
  const baselineRef = React.useRef('');
  const snapshotRef = React.useRef(getSnapshot);
  snapshotRef.current = getSnapshot;
  const readSnapshot = React.useCallback(() => {
    const fn = snapshotRef.current;
    if (typeof fn !== 'function') return '';
    try {
      return String(fn() ?? '');
    } catch (e) {
      return '';
    }
  }, []);
  React.useEffect(() => {
    if (!active) return undefined;
    baselineRef.current = readSnapshot();
    return undefined;
  }, [active, resetKey, readSnapshot]);
  const requestClose = React.useCallback(() => {
    if (readSnapshot() !== baselineRef.current && typeof onRequestConfirm === 'function') {
      onRequestConfirm('닫기 확인', message || '저장하지 않은 내용이 있습니다. 닫으시겠습니까?', onClose);
      return;
    }
    onClose();
  }, [onClose, onRequestConfirm, message, readSnapshot]);
  const overlayOnClick = React.useCallback(e => {
    if (e.target !== e.currentTarget) return;
    requestClose();
  }, [requestClose]);
  return { requestClose, overlayOnClick };
}

// De-dupes rapid double-taps / pointerdown+click event duplication firing onSend() twice for the
// same message -- extracted from ChatRoomView (see its own history of this exact bug) so
// CommentsSection's independent Send button/Ctrl+Enter shortcut get the same protection instead
// of quietly missing it.
export function useChatSendGuard(onSend, canSend = true) {
  const React = window.React;
  const sharedGuard = window.GATHER_APP_UTILS && window.GATHER_APP_UTILS.useChatSendGuard;
  if (typeof sharedGuard === 'function') return sharedGuard(onSend, canSend);
  const lockRef = React.useRef(false);
  return (...args) => {
    const isAllowed = typeof canSend === 'function' ? canSend(...args) : Boolean(canSend);
    if (!isAllowed || lockRef.current) return;
    lockRef.current = true;
    let result;
    try {
      result = onSend && onSend(...args);
    } catch (error) {
      setTimeout(() => { lockRef.current = false; }, 250);
      console.error('chat send failed:', error);
      return;
    }
    Promise.resolve(result).catch(error => {
      console.error('chat send failed:', error);
    }).finally(() => {
      setTimeout(() => {
        lockRef.current = false;
      }, 250);
    });
  };
}
