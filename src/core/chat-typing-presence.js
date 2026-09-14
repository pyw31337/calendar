export const CHAT_TYPING_IDLE_MS = 2500;
export const CHAT_TYPING_HEARTBEAT_MS = 4000;
export const CHAT_TYPING_TTL_MS = 10000;

const SESSION_ID_PATTERN = /^[A-Za-z0-9_-]{1,80}$/;
const CALENDAR_ID_PATTERN = /^[A-Za-z0-9_-]{1,64}$/;

export function createChatTypingSessionId() {
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return `typing_${crypto.randomUUID().replace(/-/g, '')}`;
    }
  } catch (_) {}
  return `typing_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 14)}`;
}

function getTypingCollection(firebaseDb, calendarId) {
  const cleanCalendarId = String(calendarId || '').trim();
  if (!firebaseDb || !CALENDAR_ID_PATTERN.test(cleanCalendarId)) return null;
  return firebaseDb.collection('calendars').doc(`cal_${cleanCalendarId}`).collection('typingPresence');
}

function isValidSessionId(sessionId) {
  return SESSION_ID_PATTERN.test(String(sessionId || ''));
}

export function getActiveTypingParticipantIds(rows, now = Date.now(), ownParticipantId = '') {
  const cutoff = Number(now) || Date.now();
  const ownId = String(ownParticipantId || '');
  const activeIds = new Set();
  (Array.isArray(rows) ? rows : []).forEach(row => {
    const participantId = String(row?.participantId || '').trim();
    const updatedAt = Number(row?.updatedAt) || 0;
    const expiresAt = Number(row?.expiresAt) || 0;
    if (!participantId || participantId === ownId) return;
    // A badly skewed or forged future clock must not create a permanent typing indicator.
    if (updatedAt > cutoff + CHAT_TYPING_TTL_MS || expiresAt <= cutoff) return;
    activeIds.add(participantId);
  });
  return Array.from(activeIds);
}

export async function publishChatTypingPresence(firebaseDb, calendarId, sessionId, participantId, now = Date.now()) {
  const collection = getTypingCollection(firebaseDb, calendarId);
  const cleanSessionId = String(sessionId || '');
  const cleanParticipantId = String(participantId || '').trim();
  if (!collection || !isValidSessionId(cleanSessionId) || !cleanParticipantId || cleanParticipantId.length > 160) return false;
  const updatedAt = Number(now) || Date.now();
  try {
    await collection.doc(cleanSessionId).set({
      participantId: cleanParticipantId,
      sessionId: cleanSessionId,
      updatedAt,
      expiresAt: updatedAt + CHAT_TYPING_TTL_MS
    });
    return true;
  } catch (error) {
    console.warn('Chat typing presence publish failed:', error);
    return false;
  }
}

export async function clearChatTypingPresence(firebaseDb, calendarId, sessionId) {
  const collection = getTypingCollection(firebaseDb, calendarId);
  const cleanSessionId = String(sessionId || '');
  if (!collection || !isValidSessionId(cleanSessionId)) return false;
  try {
    await collection.doc(cleanSessionId).delete();
    return true;
  } catch (error) {
    console.warn('Chat typing presence cleanup failed:', error);
    return false;
  }
}

export function subscribeChatTypingPresence(firebaseDb, calendarId, ownParticipantId, onChange, onError) {
  const collection = getTypingCollection(firebaseDb, calendarId);
  if (!collection || typeof onChange !== 'function') return () => {};
  let rows = [];
  let stopped = false;
  const cleanupAttempted = new Set();
  const emit = () => {
    if (!stopped) onChange(getActiveTypingParticipantIds(rows, Date.now(), ownParticipantId));
  };
  const unsubscribe = collection.onSnapshot(snapshot => {
    const nextRows = [];
    const now = Date.now();
    let cleanupCount = 0;
    snapshot.forEach(doc => {
      const data = doc.data() || {};
      nextRows.push(data);
      // Firestore has no onDisconnect hook. Remove a bounded number of expired crash leftovers
      // when the next visitor opens chat, preventing random per-tab session rows accumulating.
      if (Number(data.expiresAt) > now || cleanupCount >= 8 || cleanupAttempted.has(doc.id)) return;
      cleanupAttempted.add(doc.id);
      cleanupCount += 1;
      if (doc.ref && typeof doc.ref.delete === 'function') void doc.ref.delete().catch(() => {});
    });
    rows = nextRows;
    emit();
  }, error => {
    if (typeof onError === 'function') onError(error);
  });
  const pruneTimer = setInterval(emit, 1000);
  return () => {
    stopped = true;
    clearInterval(pruneTimer);
    if (typeof unsubscribe === 'function') unsubscribe();
  };
}

export function useChatTypingPresence({ React, getDb, calendarId, participantId }) {
  const [typingParticipantIds, setTypingParticipantIds] = React.useState([]);
  const [firebaseVersion, setFirebaseVersion] = React.useState(() => Number(
    typeof window !== 'undefined' ? window.__GATHER_FIREBASE_STATE_VERSION || 0 : 0
  ));
  const sessionIdRef = React.useRef(null);
  const activeRef = React.useRef(null);
  const idleTimerRef = React.useRef(null);
  const heartbeatTimerRef = React.useRef(null);
  if (!sessionIdRef.current) sessionIdRef.current = createChatTypingSessionId();

  const stopTyping = React.useCallback(() => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    if (heartbeatTimerRef.current) clearInterval(heartbeatTimerRef.current);
    idleTimerRef.current = null;
    heartbeatTimerRef.current = null;
    const active = activeRef.current;
    activeRef.current = null;
    if (active) void clearChatTypingPresence(active.db, active.calendarId, sessionIdRef.current);
  }, []);

  const announceTyping = React.useCallback(value => {
    const hasText = Boolean(String(value || '').trim());
    if (!hasText || !calendarId || !participantId) {
      stopTyping();
      return;
    }
    const db = typeof getDb === 'function' ? getDb() : null;
    if (!db) return;
    const active = activeRef.current;
    if (!active || active.db !== db || active.calendarId !== calendarId || active.participantId !== participantId) {
      stopTyping();
      activeRef.current = { db, calendarId, participantId };
      void publishChatTypingPresence(db, calendarId, sessionIdRef.current, participantId);
      heartbeatTimerRef.current = setInterval(() => {
        const current = activeRef.current;
        if (current) void publishChatTypingPresence(current.db, current.calendarId, sessionIdRef.current, current.participantId);
      }, CHAT_TYPING_HEARTBEAT_MS);
    }
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(stopTyping, CHAT_TYPING_IDLE_MS);
  }, [calendarId, participantId, getDb, stopTyping, firebaseVersion]);

  React.useEffect(() => {
    const handleFirebaseStateChange = () => setFirebaseVersion(Number(window.__GATHER_FIREBASE_STATE_VERSION || 0));
    window.addEventListener('gather-firebase-state-change', handleFirebaseStateChange);
    return () => window.removeEventListener('gather-firebase-state-change', handleFirebaseStateChange);
  }, []);

  React.useEffect(() => {
    const db = typeof getDb === 'function' ? getDb() : null;
    setTypingParticipantIds([]);
    if (!db || !calendarId) return undefined;
    return subscribeChatTypingPresence(db, calendarId, participantId, setTypingParticipantIds, error => {
      console.warn('Chat typing presence subscription failed:', error);
    });
  }, [calendarId, participantId, getDb, firebaseVersion]);

  React.useEffect(() => {
    stopTyping();
  }, [calendarId, participantId, stopTyping]);

  React.useEffect(() => {
    const handlePageExit = () => stopTyping();
    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') stopTyping();
    };
    window.addEventListener('pagehide', handlePageExit);
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      window.removeEventListener('pagehide', handlePageExit);
      document.removeEventListener('visibilitychange', handleVisibility);
      stopTyping();
    };
  }, [stopTyping]);

  return { typingParticipantIds, announceTyping, stopTyping };
}
