// Decisions behind ensurePushSubscriptionHealthy (app-domain-helpers.js).
//
// A browser has ONE PushSubscription for the whole site, and every calendar it enabled keeps its
// own push_subscriptions row for that one endpoint. Replacing the subscription (unsubscribe +
// subscribe) therefore kills the endpoint every other calendar's row points at. On 2026-10-28 a
// resume-time repair replaced it whenever the open calendar had no row for it: a phone switching
// between two calendars broke each one's notifications in turn, and one resume burst created
// three endpoints in six seconds. So the subscription is replaced only when its endpoint is
// known dead, and a new endpoint is then carried to this browser's other calendars.

export const PUSH_HEALTH_KEY_PREFIX = 'gather_push_health_';

// A push service answering 404/410 has dropped the endpoint; 403 means it was created for
// another VAPID key. None of them recover by sending again.
const DEAD_ENDPOINT_STATUS = /^http-(?:403|404|410)$/;

/**
 * 'rotate' when this calendar's row shows the endpoint is dead, or when the row this browser
 * itself saved for this exact endpoint is gone (the server deletes a row after a 404/410, and
 * Samsung Internet keeps handing back such an endpoint). Otherwise 'register': write the row
 * for the endpoint the browser already has -- e.g. a calendar that has never seen it.
 */
export function planPushSubscriptionRepair({ health, storedSubId, subId } = {}) {
  if (!health || !health.available) return 'register';
  if (health.exists) {
    return DEAD_ENDPOINT_STATUS.test(String(health.data?.lastPushStatus || '')) ? 'rotate' : 'register';
  }
  return storedSubId && storedSubId === subId ? 'rotate' : 'register';
}

/** The calendars this browser registered, from the record subscribeUserToPush keeps for each. */
export function readRegisteredPushCalendars(storage) {
  const out = [];
  if (!storage || typeof storage.length !== 'number') return out;
  for (let i = 0; i < storage.length; i += 1) {
    const key = storage.key(i);
    if (!key || !key.startsWith(PUSH_HEALTH_KEY_PREFIX)) continue;
    try {
      const record = JSON.parse(storage.getItem(key) || 'null');
      const calendarId = key.slice(PUSH_HEALTH_KEY_PREFIX.length);
      if (calendarId && record && record.subId) {
        out.push({ calendarId, subId: String(record.subId), participantId: record.participantId ? String(record.participantId) : '' });
      }
    } catch (_) { /* a malformed record is simply not a registration */ }
  }
  return out;
}

/** Rows this same device left for older endpoints: the server sends to one row per device. */
export function staleDeviceRowIds(rows, { deviceId, subId } = {}) {
  if (!deviceId || !subId) return [];
  return (Array.isArray(rows) ? rows : [])
    .filter(row => row && row.id && row.id !== subId && row.deviceId === deviceId)
    .map(row => row.id);
}
