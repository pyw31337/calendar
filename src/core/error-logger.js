/**
 * Unified Client Error & Action Failure Logger
 *
 * Captures all client-side exceptions, unhandled rejections, and user action
 * failures ("누가 어떤 시도를 했는데 실패했다") with rich context (actor,
 * action, calendar, resource, error stack), persisting to serverAuditLogs
 * and a local rolling buffer for automated diagnosis and reporting.
 */

const ROLLING_LOG_KEY = 'gather_recent_error_logs';
const MAX_ROLLING_LOGS = 50;
const SESSION_KEY = 'gather_error_session_v1';
let memorySessionId = '';

/**
 * Sanitizes strings for safe transmission and storage.
 */
function safeSlice(val, maxLen = 200) {
  if (val === null || val === undefined) return '';
  return String(val).trim().slice(0, maxLen);
}

/**
 * Reads local rolling error logs from localStorage.
 */
export function getRecentErrorLogs() {
  if (typeof window === 'undefined' || !window.localStorage) return [];
  try {
    const raw = window.localStorage.getItem(ROLLING_LOG_KEY);
    if (!raw) return [];
    const list = JSON.parse(raw);
    return Array.isArray(list) ? list : [];
  } catch (_) {
    return [];
  }
}

/**
 * Clears local rolling error logs.
 */
export function clearRecentErrorLogs() {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.removeItem(ROLLING_LOG_KEY);
  } catch (_) {}
}

/**
 * Appends an error event to the local rolling buffer.
 */
function recordLocalErrorLog(entry) {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    const current = getRecentErrorLogs();
    current.push(entry);
    const trimmed = current.slice(-MAX_ROLLING_LOGS);
    window.localStorage.setItem(ROLLING_LOG_KEY, JSON.stringify(trimmed));
  } catch (_) {}
}

/**
 * Sends audit log to Cloud Functions auditEvent endpoint (best effort).
 */
function sendServerAuditEvent(payload) {
  if (typeof fetch !== 'function') return;
  try {
    const endpoint = 'https://asia-northeast3-metro-live-2918e.cloudfunctions.net/auditEvent';
    setTimeout(() => {
      fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true
      }).catch(() => {});
    }, 0);
  } catch (_) {}
}

function getAuditSessionId() {
  if (memorySessionId) return memorySessionId;
  try {
    const storage = typeof window !== 'undefined' ? window.sessionStorage : null;
    const existing = storage?.getItem(SESSION_KEY);
    if (existing) { memorySessionId = existing; return existing; }
    const random = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 12)}`;
    memorySessionId = `session_${random}`.slice(0, 100);
    storage?.setItem(SESSION_KEY, memorySessionId);
  } catch (_) {
    memorySessionId = `session_${Date.now().toString(36)}`;
  }
  return memorySessionId;
}

/**
 * Resolves current client device/browser info.
 */
function getClientEnvironment() {
  if (typeof navigator === 'undefined') return 'node';
  const ua = navigator.userAgent || '';
  const isIos = /iPhone|iPad|iPod/i.test(ua);
  const isAndroid = /Android/i.test(ua);
  const isSafari = /^((?!chrome|android).)*safari/i.test(ua);
  const isChrome = /Chrome/i.test(ua) && !/Edge/i.test(ua);
  const env = isIos ? (isSafari ? 'ios-safari' : 'ios-other') : (isAndroid ? 'android' : (isChrome ? 'desktop-chrome' : 'desktop-other'));
  const mode = typeof window !== 'undefined' && window.matchMedia?.('(display-mode: standalone)').matches ? 'pwa' : 'browser';
  return `${env}:${mode}`;
}

function sanitizeResource(resource) {
  if (!resource || typeof resource !== 'object') return null;
  const output = {
    resourceType: safeSlice(resource.resourceType || resource.type || '', 60),
    resourceId: safeSlice(resource.resourceId || resource.id || '', 200)
  };
  ['source', 'sourceMessageId', 'before', 'after'].forEach(key => {
    if (resource[key] !== undefined && resource[key] !== null) output[key] = safeSlice(resource[key], key === 'sourceMessageId' ? 200 : 500);
  });
  if (Number.isInteger(resource.imageIndex)) output.imageIndex = resource.imageIndex;
  return output;
}

/**
 * Records a structured action failure or error.
 *
 * @param {Object} params
 * @param {string} params.calendarId
 * @param {string} params.action - e.g. 'memo_save_failure', 'memo_update_failure', 'calendar_save_failure', 'client_error'
 * @param {string} [params.target] - Description of what was being attempted
 * @param {string} [params.actorId] - Participant ID
 * @param {string} [params.actorName] - Participant name if known
 * @param {Error|any} [params.error] - Caught error or exception
 * @param {Object} [params.resource] - Target resource (memoId, photoId, etc.)
 */
export function logActionFailure({
  calendarId,
  action,
  target = '',
  actorId = '',
  actorName = '',
  error = null,
  resource = null,
  attemptId = '',
  durationMs = null
}) {
  const calId = safeSlice(calendarId || 'unknown', 64);
  const act = safeSlice(action || 'action_failure', 80);
  const errMsg = safeSlice(error?.message || error || '', 300);
  const errCode = safeSlice(error?.code || '', 40);
  const desc = safeSlice(`${target || ''} ${errCode ? `[${errCode}] ` : ''}${errMsg}`.trim(), 200) || '(오류 내용 없음)';
  const now = Date.now();
  const client = getClientEnvironment();

  const entry = {
    status: 'failed',
    attemptId: safeSlice(attemptId, 100),
    durationMs: Number.isFinite(Number(durationMs)) ? Math.max(0, Math.round(Number(durationMs))) : null,
    sessionId: getAuditSessionId(),
    timestamp: now,
    calendarId: calId,
    action: act,
    actorId: safeSlice(actorId, 80),
    actorName: safeSlice(actorName, 60),
    client,
    target: desc,
    error: {
      message: errMsg,
      code: errCode,
      stack: safeSlice(error?.stack || '', 500)
    },
    resource: sanitizeResource(resource)
  };

  recordLocalErrorLog(entry);

  sendServerAuditEvent({
    calendarId: calId,
    action: act,
    target: desc,
    actorId: entry.actorId,
    actorName: entry.actorName,
    sessionId: entry.sessionId,
    status: entry.status,
    attemptId: entry.attemptId,
    durationMs: entry.durationMs,
    error: entry.error,
    client,
    resource: entry.resource
  });

  if (typeof window !== 'undefined') {
    try {
      window.dispatchEvent(new CustomEvent('gather:action-failure', { detail: entry }));
    } catch (_) {}
  }

  return entry;
}

function newAttemptId(action) {
  const random = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
  return `${safeSlice(action || 'action', 40)}_${random}`.slice(0, 100);
}

/** Record the beginning of a user action. This is intentionally best-effort and never blocks UI. */
export function logActionAttempt(params = {}) {
  const startedAt = Date.now();
  const attemptId = params.attemptId || newAttemptId(params.action || 'action');
  const entry = logActionEvent({ ...params, status: 'started', attemptId, timestamp: startedAt });
  return { attemptId, startedAt, entry };
}

/** Record a successful or durably queued action so the daily report can close the failure loop. */
export function logActionSuccess(params = {}) {
  return logActionEvent({ ...params, status: params.status || 'succeeded' });
}

export function logActionResolution(params = {}) {
  return logActionEvent({ ...params, status: 'healed' });
}

function logActionEvent({
  calendarId, action, target = '', actorId = '', actorName = '', error = null, resource = null,
  status = 'info', attemptId = '', durationMs = null, timestamp = Date.now()
} = {}) {
  const calId = safeSlice(calendarId || 'unknown', 64);
  const act = safeSlice(action || 'action_event', 80);
  const errMsg = safeSlice(error?.message || error || '', 300);
  const errCode = safeSlice(error?.code || '', 40);
  const desc = safeSlice(`${target || ''} ${errCode ? `[${errCode}] ` : ''}${errMsg}`.trim(), 200) || '(내용 없음)';
  const entry = {
    timestamp,
    status: safeSlice(status, 24),
    attemptId: safeSlice(attemptId, 100),
    durationMs: Number.isFinite(Number(durationMs)) ? Math.max(0, Math.round(Number(durationMs))) : null,
    sessionId: getAuditSessionId(),
    calendarId: calId,
    action: act,
    actorId: safeSlice(actorId, 80),
    actorName: safeSlice(actorName, 60),
    client: getClientEnvironment(),
    target: desc,
    error: { message: errMsg, code: errCode, stack: safeSlice(error?.stack || '', 500) },
    resource: sanitizeResource(resource)
  };
  recordLocalErrorLog(entry);
  sendServerAuditEvent({
    calendarId: calId, action: act, target: desc, actorId: entry.actorId, actorName: entry.actorName,
    client: entry.client, sessionId: entry.sessionId, status: entry.status, attemptId: entry.attemptId,
    durationMs: entry.durationMs, ...(entry.error.message ? { error: entry.error } : {}), resource: entry.resource
  });
  if (typeof window !== 'undefined') {
    try { window.dispatchEvent(new CustomEvent('gather:action-event', { detail: entry })); } catch (_) {}
  }
  return entry;
}
