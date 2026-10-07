// Bounded browser diagnostics share the existing server audit pipeline. Dependencies are
// injected so monitoring has no React/UI dependency and always resolves the active calendar.
export function installClientErrorMonitor({ target, getCalendarId, sanitizeText, queueServerAuditEvent, getClientAuditContext, showToast }) {
  const reported = new Set();
  const report = (message, extra) => {
    const note = sanitizeText(`${message || '알 수 없는 오류'} ${extra || ''}`.trim(), 200);
    if (reported.has(note) || reported.size >= 5) return;
    reported.add(note);
    queueServerAuditEvent(getCalendarId() || 'unknown', 'client_error', note, getClientAuditContext());
  };
  const onError = event => report(event?.message, event?.filename ? `@${event.filename}:${event.lineno || ''}` : '');
  const onRejection = event => report(event?.reason?.message || String(event?.reason || '').slice(0, 160));
  const onFirestoreBroken = event => {
    report(event?.detail?.message || 'FIRESTORE INTERNAL ASSERTION FAILED');
    showToast('실시간 연결에 문제가 생겼습니다. 새로고침하면 복구됩니다.', 'error', 60000,
      () => { target.location.reload(); }, null, '새로고침');
  };
  const listeners = { error: onError, unhandledrejection: onRejection, 'gather:firestore-broken': onFirestoreBroken };
  Object.entries(listeners).forEach(([name, handler]) => target.addEventListener(name, handler));
  if (target.__gatherFirestoreBroken) onFirestoreBroken({ detail: { message: target.__gatherFirestoreBroken } });
  return () => Object.entries(listeners).forEach(([name, handler]) => target.removeEventListener(name, handler));
}
