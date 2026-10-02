// One source of truth for the server-facing notification-channel payload.  The UI keeps the
// user's channel switches in localStorage, while a push subscription keeps a copy that Cloud
// Functions can read.  An explicit override is needed when the per-calendar chat master switch
// is turned on: older V2 clients could leave the global `chat` preference false, creating a
// visible "알림 켜짐" state that the server then silently filtered out.
export const DEFAULT_PUSH_CHANNEL_PREFERENCES = Object.freeze({
  chat: true,
  comment: true,
  memo: true,
  poll: true,
  schedule: true
});

export function normalizePushChannelPreferences(preferences, overrides) {
  const saved = preferences && typeof preferences === 'object' ? preferences : {};
  const forced = overrides && typeof overrides === 'object' ? overrides : {};
  const merged = { ...DEFAULT_PUSH_CHANNEL_PREFERENCES, ...saved, ...forced };
  return {
    chat: merged.chat !== false,
    comment: merged.comment !== false,
    memo: merged.memo !== false,
    poll: merged.poll !== false,
    schedule: merged.schedule !== false
  };
}
