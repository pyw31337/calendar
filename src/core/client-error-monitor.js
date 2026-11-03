import { logActionFailure, logActionSuccess } from './error-logger.js';

// Bounded browser diagnostics share the existing server audit pipeline. Dependencies are
// injected so monitoring has no React/UI dependency and always resolves the active calendar.
export function installClientErrorMonitor({ target, getCalendarId, sanitizeText, queueServerAuditEvent, getClientAuditContext, showToast }) {
  const reported = new Set();
  const report = (message, extra) => {
    const note = sanitizeText(`${message || '알 수 없는 오류'} ${extra || ''}`.trim(), 200);
    if (reported.has(note) || reported.size >= 5) return;
    reported.add(note);
    queueServerAuditEvent(getCalendarId() || 'unknown', 'client_error', note, getClientAuditContext());
    logActionFailure({
      calendarId: getCalendarId() || 'unknown',
      action: 'client_error',
      target: note,
      error: extra || message
    });
  };
  const onError = event => report(event?.message, event?.filename ? `@${event.filename}:${event.lineno || ''}` : '');
  const onRejection = event => report(event?.reason?.message || String(event?.reason || '').slice(0, 160));
  const onFirestoreBroken = event => {
    report(event?.detail?.message || 'FIRESTORE INTERNAL ASSERTION FAILED');
    showToast('실시간 연결에 문제가 생겼습니다. 새로고침하면 복구됩니다.', 'error', 60000,
      () => { target.location.reload(); }, null, '새로고침');
  };
  const onMemoDraftFailure = event => {
    const detail = event?.detail || {};
    const note = `메모 임시저장 실패 ${detail.message || 'Safari 저장소를 사용할 수 없습니다.'}`;
    if (reported.has(note) || reported.size >= 5) return;
    reported.add(note);
    logActionFailure({
      calendarId: getCalendarId() || 'unknown',
      action: 'memo_draft_failure',
      target: '메모 작성 중 임시저장 실패',
      error: detail.message || 'draft storage unavailable',
      resource: { resourceType: 'memo-draft', resourceId: detail.key || '' }
    });
  };
  // iOS Safari/PWA can suspend and resume the page without a normal reload. These bounded
  // lifecycle breadcrumbs let the daily report correlate a reset with offline/resume timing.
  const lifecycle = (action, target, status = 'info') => {
    try {
      logActionSuccess({ calendarId: getCalendarId() || 'unknown', action, target, status, resource: { resourceType: 'pwa-lifecycle' } });
    } catch (_) {}
  };
  const onOffline = () => lifecycle('pwa_network_offline', '브라우저 네트워크 오프라인 전환', 'offline');
  const onOnline = () => lifecycle('pwa_network_online', '브라우저 네트워크 복구', 'recovered');
  const onPageShow = event => { if (event?.persisted) lifecycle('pwa_resume', '백/포워드 캐시에서 PWA 복귀', 'resumed'); };
  const listeners = {
    error: onError,
    unhandledrejection: onRejection,
    offline: onOffline,
    online: onOnline,
    pageshow: onPageShow,
    'gather:firestore-broken': onFirestoreBroken,
    'gather:memo-draft-failure': onMemoDraftFailure
  };
  Object.entries(listeners).forEach(([name, handler]) => target.addEventListener(name, handler));
  if (target.__gatherFirestoreBroken) onFirestoreBroken({ detail: { message: target.__gatherFirestoreBroken } });
  return () => Object.entries(listeners).forEach(([name, handler]) => target.removeEventListener(name, handler));
}
