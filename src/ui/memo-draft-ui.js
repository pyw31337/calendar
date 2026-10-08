/**
 * React glue for memo draft autosave (core/memo-draft-store.js): the debounced autosave hook and
 * the V2 "작성 중이던 메모가 있어요. 이어서 쓸까요?" prompt shown inside the editor.
 */
import './v2/memo-draft.css';
import {
  saveMemoDraft, clearMemoDraft, isSameMemoDraftContent, createDebouncedSaver, normalizeMemoDraft,
  MEMO_DRAFT_DEBOUNCE_MS, MEMO_DRAFT_RESTORE_PROMPT,
} from '../core/memo-draft-store.js';

/**
 * Saves `fields` under `key` ~500ms after the last change while `active`. When the fields match
 * `baseline` (nothing typed yet / edits reverted) the stored draft is removed instead. A pending
 * save is flushed when the editor closes or unmounts, so a quick close still keeps the draft.
 * Returns `{ clear }` -- call it after a successful save (cancels the pending save first).
 */
export function useMemoDraftAutosave({ key, active, fields, baseline = null }) {
  const React = window.React;
  const saverRef = React.useRef(null);
  if (!saverRef.current) {
    saverRef.current = createDebouncedSaver((k, f, b) => {
      if (b && isSameMemoDraftContent(f, b)) clearMemoDraft(k);
      else saveMemoDraft(k, f);
    }, MEMO_DRAFT_DEBOUNCE_MS);
  }
  // Normalized (binaries/data: previews dropped) so the change check stays cheap.
  const fieldsJson = JSON.stringify(normalizeMemoDraft(fields || {}));
  const baselineRef = React.useRef(baseline);
  baselineRef.current = baseline;
  React.useEffect(() => {
    if (!active || !key) return undefined;
    saverRef.current(key, fields, baselineRef.current);
    return undefined;
  }, [active, key, fieldsJson]);
  React.useEffect(() => {
    if (!active || !key) return undefined;
    const saver = saverRef.current;
    const flush = () => saver.flush();
    window.addEventListener('pagehide', flush);
    return () => {
      window.removeEventListener('pagehide', flush);
      saver.flush();
    };
  }, [active, key]);
  const clear = React.useCallback((k) => {
    saverRef.current.cancel();
    clearMemoDraft(k || key);
  }, [key]);
  return { clear };
}

function formatSavedAt(savedAt) {
  const t = Number(savedAt);
  if (!Number.isFinite(t) || t <= 0) return '';
  const d = new Date(t);
  const pad = v => String(v).padStart(2, '0');
  return `${d.getMonth() + 1}.${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())} 임시 저장`;
}

export function MemoDraftRestorePrompt({ draft, onResume, onDiscard }) {
  const React = window.React;
  if (!draft) return null;
  const meta = formatSavedAt(draft.savedAt);
  return React.createElement('div', { className: 'memo-draft-restore', role: 'status', 'aria-live': 'polite', onClick: e => e.stopPropagation() },
    React.createElement('div', { className: 'memo-draft-restore-text' },
      MEMO_DRAFT_RESTORE_PROMPT,
      meta ? React.createElement('span', { className: 'memo-draft-restore-meta' }, meta) : null
    ),
    React.createElement('div', { className: 'memo-draft-restore-actions' },
      React.createElement('button', { type: 'button', className: 'memo-draft-restore-btn is-secondary', onClick: onDiscard }, '새로 쓰기'),
      React.createElement('button', { type: 'button', className: 'memo-draft-restore-btn is-primary', onClick: onResume }, '이어쓰기')
    )
  );
}
