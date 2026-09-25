// U10 (docs/app-main-split-units.md): the chat message window, moved out of CalendarApp verbatim.
// Owns the live recent-message window, the gallery's own live window, the stalled-stream
// watchdog, and the cursor-paged "older messages" history, plus the chat scroll container ref
// that "이전 메시지 더 보기" keeps anchored. CalendarApp still owns everything that merely
// patches these lists (patch/upsert/removeLocalChatMessage, the preview hydration safety net)
// and gets the setters back from here.
//
// Inputs that CalendarApp declares after this hook is called are read through getters, and only
// from inside effects/callbacks (never during render), so they are always initialized by then:
//   getFirebaseDb  -- the module-level Firestore handle, read live at effect time exactly like
//                     the original inline effects did (the value itself is also passed for deps).
//   getActiveCal   -- activeCalRef.current, for the new-message notification's sender/title.
import {
  readConfigNumber,
  CHAT_LIVE_MESSAGE_LIMIT,
  slimMessageForClient,
  queueServerAuditEvent,
  getClientAuditContext,
  notifyNewChatMessage,
  getActiveParticipants
} from './app-domain-helpers.js';
import {
  subscribeMessages,
  fetchRecentChatMessages,
  fetchOlderChatMessages,
  CHAT_OLDER_PAGE_SIZE,
  MAX_OLDER_CHAT_MESSAGES,
  invalidateGalleryItemCount
} from './app-firebase-data.js';

export function useChatMessageWindow({
  React,
  activeCalId,
  activeView,
  isInitialDataLoading,
  firebaseDb,
  getFirebaseDb,
  firebaseConnectionVersion,
  chatParticipantIdRef,
  getActiveCal
}) {
  const [chatMessages, setChatMessages] = React.useState([]);
  const [galleryLiveMessages, setGalleryLiveMessages] = React.useState([]);
  const [olderChatMessages, setOlderChatMessages] = React.useState([]);
  const [hasMoreOlderChat, setHasMoreOlderChat] = React.useState(true);
  const [loadingOlderChat, setLoadingOlderChat] = React.useState(false);
  const CHAT_INITIAL_MESSAGE_LIMIT = readConfigNumber('CHAT_INITIAL_MESSAGE_LIMIT', 5);
  const [chatLiveLimit, setChatLiveLimit] = React.useState(CHAT_INITIAL_MESSAGE_LIMIT);
  const loadingOlderChatRef = React.useRef(false);
  const allChatMessages = React.useMemo(() => {
    const byId = new Map();
    (olderChatMessages || []).forEach(m => { if (m && m.id) byId.set(m.id, m); });
    (galleryLiveMessages || []).forEach(m => { if (m && m.id) byId.set(m.id, m); });
    (chatMessages || []).forEach(m => { if (m && m.id) byId.set(m.id, m); });
    return Array.from(byId.values()).sort((a, b) => Number(a.timestamp || 0) - Number(b.timestamp || 0));
  }, [olderChatMessages, galleryLiveMessages, chatMessages]);
  // Scroll container of the chat room -- loadOlderChatMessages keeps the reading position
  // anchored on it when older history is prepended.
  const chatMessagesContainerRef = React.useRef(null);

  // Tracks the last time the chat onSnapshot listener actually delivered a snapshot (own writes,
  // someone else's writes, or the initial history load all count). The watchdog effect below
  // compares against this to detect a listener that has silently stopped receiving updates --
  // a known field failure mode (see the long-polling notes above attemptFirebaseInit in
  // app-main.js) where the realtime stream goes quiet while everything else keeps working, so
  // creates/edits/deletes and other participants' messages stop showing up until a manual reload.
  const lastChatSnapshotAtRef = React.useRef(0);

  // Render the newest five messages first. On capable networks, widen the realtime window after
  // the critical first paint; on save-data/2G/3G connections keep the compact window and let the
  // existing cursor-based "older messages" control fetch history in small pages on demand.
  React.useEffect(() => {
    setChatLiveLimit(CHAT_INITIAL_MESSAGE_LIMIT);
    if (activeView !== 'chat') return undefined;
    const connection = typeof navigator !== 'undefined'
      ? (navigator.connection || navigator.mozConnection || navigator.webkitConnection)
      : null;
    const effectiveType = String(connection?.effectiveType || '').toLowerCase();
    const constrained = Boolean(connection?.saveData) || effectiveType === 'slow-2g' || effectiveType === '2g' || effectiveType === '3g';
    if (constrained) return undefined;
    const timer = setTimeout(() => setChatLiveLimit(CHAT_LIVE_MESSAGE_LIMIT), 700);
    return () => clearTimeout(timer);
  }, [activeCalId, activeView, CHAT_INITIAL_MESSAGE_LIMIT]);

  // Real-time messages listener
  // Full window on chat/gallery. The main-screen preview (else branch) used to query only
  // CHAT_INITIAL_MESSAGE_LIMIT (5) raw docs -- but this listener's query orders by raw
  // `timestamp` with no way to exclude meeting/gallery-linked photos at the query level (that
  // filter is client-only, see isChatRenderableMessage/meetingPhotoMessageIds -- a photo
  // promoted into a confirmed meeting's album keeps its original non-meeting uploadSource on
  // its own doc). So on a calendar whose 5 most recent raw messages happen to all be such
  // promoted photos, every single snapshot from this always-subscribed listener kept resetting
  // chatMessages to an all-filtered-out list, permanently re-triggering (and then immediately
  // stomping) the separate hydration-retry effect in CalendarApp -- the widget could never
  // settle on real content and stayed on "최근 채팅을 불러오는 중…" no matter how long you waited.
  // The chat room gets a wider raw window because a calendar can have a long run of hidden
  // gallery/meeting uploads at the head of the collection. The calendar preview remains bounded.
  React.useEffect(() => {
    if (!activeCalId) {
      setChatMessages([]);
      return;
    }
    const chatLimit = activeView === 'chat'
      ? Math.max(chatLiveLimit, 60)
      : activeView === 'gallery' ? Math.min(12, CHAT_LIVE_MESSAGE_LIMIT) : CHAT_LIVE_MESSAGE_LIMIT;
    if (!getFirebaseDb()) {
      // No live SDK channel at all (not just a stalled stream -- see the watchdog below for
      // that case) -- without this poll, a device stuck on this path never saw the other
      // participant's messages until a manual reload, since fetchRecentChatMessages only ran
      // once per mount/dependency change.
      let cancelled = false;
      const poll = () => {
        if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return;
        fetchRecentChatMessages(activeCalId, chatLimit).then(list => {
          if (!cancelled) setChatMessages(list);
        });
      };
      poll();
      const pollTimer = setInterval(poll, activeView === 'chat' ? 12000 : 60000);
      return () => { cancelled = true; clearInterval(pollTimer); };
    }
    let isMounted = true;
    // Reset the watchdog clock on every (re)subscribe so it waits a full grace period for this
    // fresh listener's own first snapshot instead of immediately judging it stale.
    lastChatSnapshotAtRef.current = Date.now();

    // Subscribe to the bounded recent message window; render-layer filtering removes non-chat
    // gallery/meeting uploads while retaining meme-keyboard messages.
    let hasSeenInitialChatSnapshot = false;
    let lastNotifiedMessageId = null;
    const unsubscribeChat = subscribeMessages(activeCalId, {
      orderBy: 'timestamp', direction: 'desc', limit: chatLimit
    }, snapshot => {
        if (!isMounted) return;
        lastChatSnapshotAtRef.current = Date.now();
        const list = [];
        snapshot.forEach(doc => {
          list.push(slimMessageForClient({ id: doc.id, ...doc.data() }));
        });
        list.reverse();
        setChatMessages(list);
        invalidateGalleryItemCount(activeCalId);

        // Browser notification for a genuinely new incoming message from someone else --
        // skip the very first snapshot (that's just the existing history loading, not a
        // new message) and skip anything sent by the current participant themselves.
        const latest = list[list.length - 1];
        if (hasSeenInitialChatSnapshot && latest && latest.id !== lastNotifiedMessageId
          && latest.participantId !== chatParticipantIdRef.current) {
          const sender = getActiveParticipants(getActiveCal()).find(p => p.id === latest.participantId);
          notifyNewChatMessage(getActiveCal(), latest, sender?.name || '알수없음');
        }
        hasSeenInitialChatSnapshot = true;
        if (latest) lastNotifiedMessageId = latest.id;
      }, err => {
        console.warn(`Firestore chat history subscription error:`, err);
        queueServerAuditEvent(activeCalId, 'realtime_fallback', `messages:${String(err?.code || 'unknown')}`, getClientAuditContext());
        fetchRecentChatMessages(activeCalId, chatLimit).then(list => {
          if (isMounted) setChatMessages(list);
        });
      });

    return () => {
      isMounted = false;
      if (unsubscribeChat) unsubscribeChat();
    };
  // Re-run when the Firebase bootstrap/retry loop recovers the SDK after the first
  // render. Without this dependency, a page that initially fell back to REST never
  // attached onSnapshot until a full reload, so messages from other users appeared
  // only after refreshing.
  }, [activeCalId, activeView, chatLiveLimit, firebaseDb, firebaseConnectionVersion, CHAT_INITIAL_MESSAGE_LIMIT]);

  // Gallery media has its own unscoped live window. Keeping this separate from the channel-
  // scoped chat listener prevents photo uploads from displacing the main screen's recent chat,
  // while the gallery still receives other participants' new gallery/meeting uploads live.
  React.useEffect(() => {
    if (!activeCalId || activeView !== 'gallery' || !getFirebaseDb()) {
      setGalleryLiveMessages([]);
      return undefined;
    }
    let mounted = true;
    const unsubscribe = subscribeMessages(activeCalId, {
      orderBy: 'timestamp', direction: 'desc', limit: CHAT_LIVE_MESSAGE_LIMIT
    }, snapshot => {
      if (!mounted) return;
      const list = [];
      snapshot.forEach(doc => list.push(slimMessageForClient({ id: doc.id, ...doc.data() })));
      list.reverse();
      setGalleryLiveMessages(list);
    }, err => console.warn('Firestore gallery media subscription error:', err));
    return () => {
      mounted = false;
      if (unsubscribe) unsubscribe();
    };
  }, [activeCalId, activeView, firebaseDb, firebaseConnectionVersion]);

  // Chat listener watchdog: throttled self-healing for stalled onSnapshot stream.
  // Reconciles on tab visibility/online return, and runs 60s backup only while viewing chat.
  React.useEffect(() => {
    if (!activeCalId || !getFirebaseDb()) return undefined;
    const isChatView = activeView === 'chat';
    const chatLimit = isChatView ? Math.max(chatLiveLimit, 60) : CHAT_INITIAL_MESSAGE_LIMIT;
    const STALE_AFTER_MS = 60000;
    const CHECK_INTERVAL_MS = 30000;
    let isMounted = true;
    let reconciling = false;
    const reconcile = async () => {
      if (reconciling || !isMounted) return;
      reconciling = true;
      try {
        const fresh = await fetchRecentChatMessages(activeCalId, chatLimit);
        if (!isMounted || !Array.isArray(fresh) || fresh.length === 0) return;
        const freshIds = new Set(fresh.map(m => m.id));
        const oldestFreshTimestamp = Number(fresh[0].timestamp) || 0;
        setChatMessages(prev => {
          const keepOlder = prev.filter(m => !freshIds.has(m.id) && (Number(m.timestamp) || 0) < oldestFreshTimestamp);
          const merged = [...keepOlder, ...fresh];
          merged.sort((a, b) => (Number(a.timestamp) || 0) - (Number(b.timestamp) || 0) || String(a.id || '').localeCompare(String(b.id || '')));
          return merged;
        });
        invalidateGalleryItemCount(activeCalId);
      } catch (err) {
        console.warn('Chat listener watchdog reconcile notice:', err);
      } finally {
        lastChatSnapshotAtRef.current = Date.now();
        reconciling = false;
      }
    };

    let timer = null;
    if (isChatView) {
      timer = setInterval(() => {
        if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return;
        if (Date.now() - lastChatSnapshotAtRef.current > STALE_AFTER_MS) void reconcile();
      }, CHECK_INTERVAL_MS);
    }

    const handleVisible = () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible' && Date.now() - lastChatSnapshotAtRef.current > 10000) void reconcile();
    };
    const handleOnline = () => { void reconcile(); };

    document.addEventListener('visibilitychange', handleVisible);
    window.addEventListener('online', handleOnline);
    return () => {
      isMounted = false;
      if (timer) clearInterval(timer);
      document.removeEventListener('visibilitychange', handleVisible);
      window.removeEventListener('online', handleOnline);
    };
  }, [activeCalId, activeView, chatLiveLimit, firebaseDb, CHAT_INITIAL_MESSAGE_LIMIT]);

  // Per-calendar reset of the paged history and the gallery live window. Same dependencies as
  // CalendarApp's count/maintenance effect it was split out of (which still resets the totals).
  React.useEffect(() => {
    setOlderChatMessages([]);
    setHasMoreOlderChat(true);
    setLoadingOlderChat(false);
    loadingOlderChatRef.current = false;
    setGalleryLiveMessages([]);
  }, [activeCalId, isInitialDataLoading]);

  const loadOlderChatMessages = React.useCallback(async () => {
    if (!activeCalId || loadingOlderChatRef.current || !hasMoreOlderChat) return;
    if (olderChatMessages.length >= MAX_OLDER_CHAT_MESSAGES) {
      setHasMoreOlderChat(false);
      return;
    }
    // Falls back to "now" when there's no local message to anchor the query on yet (e.g. the
    // gallery/chat is opened before the live listener's first snapshot has arrived) -- silently
    // returning here left onLoadOlderChat a no-op with no loading state and no error, which from
    // the "이전 사진/링크 더 보기" button looked exactly like a stuck/broken button.
    const oldest = allChatMessages[0];
    const beforeTs = (oldest && oldest.timestamp) || Date.now();
    loadingOlderChatRef.current = true;
    setLoadingOlderChat(true);
    const container = chatMessagesContainerRef.current;
    const prevHeight = container ? container.scrollHeight : 0;
    const prevTop = container ? container.scrollTop : 0;
    try {
      const older = await fetchOlderChatMessages(activeCalId, beforeTs, CHAT_OLDER_PAGE_SIZE);
      if (!older.length) {
        setHasMoreOlderChat(false);
        return;
      }
      if (older.length < CHAT_OLDER_PAGE_SIZE) setHasMoreOlderChat(false);
      setOlderChatMessages(prev => {
        const seen = new Set((prev || []).map(m => m.id));
        (chatMessages || []).forEach(m => { if (m && m.id) seen.add(m.id); });
        const add = older.filter(m => m && m.id && !seen.has(m.id));
        return add.length ? [...add, ...(prev || [])] : prev;
      });
      requestAnimationFrame(() => {
        const el = chatMessagesContainerRef.current;
        if (!el || !prevHeight) return;
        el.scrollTop = prevTop + (el.scrollHeight - prevHeight);
      });
    } finally {
      loadingOlderChatRef.current = false;
      setLoadingOlderChat(false);
    }
  }, [activeCalId, hasMoreOlderChat, allChatMessages, chatMessages, olderChatMessages]);

  return {
    chatMessages,
    setChatMessages,
    galleryLiveMessages,
    setGalleryLiveMessages,
    olderChatMessages,
    setOlderChatMessages,
    hasMoreOlderChat,
    loadingOlderChat,
    loadingOlderChatRef,
    allChatMessages,
    chatMessagesContainerRef,
    loadOlderChatMessages
  };
}
