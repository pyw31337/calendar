/**
 * The participant selected on this device (no login yet): one choice per calendar, used by chat,
 * memo, comments, likes and the side menu badge. It is stored by app-notifications.js
 * (setStoredChatParticipantId), which also broadcasts PARTICIPANT_CHANGE_EVENT so every screen
 * that keeps its own copy (comment composers, the chat composer, hearts) follows the change.
 */
export const PARTICIPANT_CHANGE_EVENT = 'gather:participant-change';

export function readCurrentParticipantId(calendarId, calendar) {
  try {
    const read = typeof window !== 'undefined' && window.GATHER_APP_NOTIFICATIONS?.getStoredChatParticipantId;
    return typeof read === 'function' ? String(read(calendarId, calendar) || '') : '';
  } catch (_) {
    return '';
  }
}

/** The participant someone actually picked on this device, or '' before the first pick. */
export function readChosenParticipantId(calendarId, calendar) {
  try {
    const read = typeof window !== 'undefined' && window.GATHER_APP_NOTIFICATIONS?.getChosenChatParticipantId;
    return typeof read === 'function' ? String(read(calendarId, calendar) || '') : '';
  } catch (_) {
    return '';
  }
}

/** handler({ calId, participantId }); returns an unsubscribe function. */
export function subscribeParticipantChange(handler) {
  if (typeof window === 'undefined' || typeof window.addEventListener !== 'function') return () => {};
  const listener = event => { try { handler(event?.detail || {}); } catch (_) {} };
  window.addEventListener(PARTICIPANT_CHANGE_EVENT, listener);
  return () => window.removeEventListener(PARTICIPANT_CHANGE_EVENT, listener);
}

/** Keeps a component's own participant state in step with the device-wide choice. */
export function useParticipantSync(React, calendarId, setParticipantId) {
  React.useEffect(() => subscribeParticipantChange(({ calId, participantId }) => {
    if (participantId && (!calId || !calendarId || calId === calendarId)) setParticipantId(participantId);
  }), [calendarId]);
}
