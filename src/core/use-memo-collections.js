// U11 (docs/app-main-split-units.md): the memo collection window, moved out of CalendarApp
// verbatim. Owns the paginated `memos` list, its page size (`memosLimit`) and `hasMoreMemos`,
// the gate that decides which routes get the full paginated window (needsMemoCollection), and
// the three realtime memo listeners (pinned / recent comment activity / newest by createdAt).
// CalendarApp still owns the local patch/upsert/remove helpers (they also patch the gallery
// archive copy, which is built from this hook's `memos`), the shared-memo-by-id fetch and the
// 보관함 REST snapshot, and gets `setMemos`/`setHasMoreMemos` back from here.
//
// getFirebaseDb reads CalendarApp's module-level Firestore handle live at effect time, exactly
// like the original inline effect did (the value itself is also passed for the deps array).
import { MEMOS_PAGE_SIZE, queueServerAuditEvent, getClientAuditContext } from './app-domain-helpers.js';
import { subscribeMemos, fetchMemosRest } from './app-firebase-data.js';

export function useMemoCollections({
  React,
  activeCalId,
  activeView,
  isGlobalSearchOpen,
  firebaseDb,
  getFirebaseDb,
  firebaseConnectionVersion
}) {
  const [memos, setMemos] = React.useState([]);
  const [memosLimit, setMemosLimit] = React.useState(MEMOS_PAGE_SIZE);
  const [hasMoreMemos, setHasMoreMemos] = React.useState(false);

  // Memos: paginated newest-first load (rather than subscribing to the entire collection at
  // once, which would download/re-sync thousands of memos on every open as a calendar grows).
  // Pinned memos are fetched separately and unbounded -- pinning is a deliberate, self-limiting
  // action, and keeping it a separate always-live query means an old pinned memo can never
  // silently fall out of view just because it's outside the paginated recent window.
  // Kept subscribed regardless of activeView (like chat/places) so a memo added on another
  // device shows up immediately even while this tab is on a different view.
  React.useEffect(() => {
    setMemosLimit(MEMOS_PAGE_SIZE);
  }, [activeCalId]);

  // Same churn fix as needsPlacesData in CalendarApp: memoize the gate boolean and depend on it
  // instead of the raw activeView/isGlobalSearchOpen, so navigating among the views that DON'T
  // need the memo collection (e.g. calendar -> chat -> settlement) never tears down and
  // recreates these three memo listeners -- only crossing into/out of memo|gallery|search
  // actually should.
  const needsMemoCollection = React.useMemo(
    // The calendar home preview also needs the server-backed pinned and recent-comment
    // queries; otherwise an old pinned memo falls outside the small createdAt window and
    // the preview silently shows unrelated recent cards.
    () => activeView === 'calendar' || activeView === 'memo' || activeView === 'gallery' || isGlobalSearchOpen,
    [activeView, isGlobalSearchOpen]
  );

  React.useEffect(() => {
    if (!activeCalId) {
      setMemos([]);
      setHasMoreMemos(false);
      return;
    }
    // Gallery/memo page need a paginated window; the home preview shows 2 cards by default
    // (and 3 when the section is expanded), so other routes still fetch a tiny recent set.
    const effectiveMemosLimit = needsMemoCollection ? memosLimit : 3;
    let isMounted = true;
    const liveDb = (typeof window !== 'undefined' && window.__gatherFirebaseDb) || getFirebaseDb();
    if (!liveDb) {
      fetchMemosRest(activeCalId, effectiveMemosLimit).then(list => {
        if (!isMounted) return;
        setMemos(list);
        setHasMoreMemos(needsMemoCollection && list.length >= effectiveMemosLimit);
      });
      return () => { isMounted = false; };
    }
    let pinnedList = [];
    let recentList = [];
    let recentActivityList = [];
    const applyMerged = () => {
      const byId = new Map();
      pinnedList.forEach(m => byId.set(m.id, m));
      recentActivityList.forEach(m => byId.set(m.id, m));
      recentList.forEach(m => byId.set(m.id, m));
      setMemos(Array.from(byId.values()).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)));
    };

    // 고정 메모는 원래도 적은 수라 문제된 적 없지만, 수년간 쓰는 가족 캘린더가 계속 늘려온
    // 다른 컬렉션(anniversaries)에서 이미 겪은 "무제한 재읽기" 패턴을 여기도 예방적으로 막아둔다.
    // where()에 대한 등호(==) 필터 + limit()만 쓰면(orderBy 없이) 복합 인덱스가 필요 없다.
    const unsubscribePinned = needsMemoCollection ? subscribeMemos(activeCalId, { where: ['isPinned', '==', true], limit: 100 }, snapshot => {
        if (!isMounted) return;
        pinnedList = [];
        snapshot.forEach(doc => pinnedList.push({ id: doc.id, ...doc.data() }));
        applyMerged();
      }, err => {
        console.warn(`Firestore pinned memos subscription error:`, err);
      }) : null;

    // 최근 활동 (see RECENT_MEMO_ACTIVITY_WINDOW_MS in ui-memo-view.js) needs any memo with a
    // recent comment loaded even when it's well outside the recent-by-createdAt window below --
    // an old memo that just got a comment otherwise wouldn't be in `memos` at all until someone
    // pages back to it. Ordered by lastCommentAt (set alongside `comments` whenever a comment is
    // added/edited/deleted) rather than filtered by a time cutoff, since a snapshot listener
    // doesn't re-fire just because wall-clock time passed a cutoff -- ui-memo-view.js's own
    // isMemoRecentlyActive does the actual 6-hour cutoff check against this loaded set.
    const unsubscribeRecentActivity = needsMemoCollection ? subscribeMemos(activeCalId, { orderBy: 'lastCommentAt', direction: 'desc', limit: 30 }, snapshot => {
        if (!isMounted) return;
        recentActivityList = [];
        snapshot.forEach(doc => recentActivityList.push({ id: doc.id, ...doc.data() }));
        applyMerged();
      }, err => {
        console.warn(`Firestore recent-activity memos subscription error:`, err);
      }) : null;

    const unsubscribeRecent = subscribeMemos(activeCalId, { orderBy: 'createdAt', direction: 'desc', limit: effectiveMemosLimit }, snapshot => {
        if (!isMounted) return;
        recentList = [];
        snapshot.forEach(doc => recentList.push({ id: doc.id, ...doc.data() }));
        setHasMoreMemos(needsMemoCollection && recentList.length >= effectiveMemosLimit);
        applyMerged();
      }, err => {
        console.warn(`Firestore memos subscription error:`, err);
        queueServerAuditEvent(activeCalId, 'realtime_fallback', `memos:${String(err?.code || 'unknown')}`, getClientAuditContext());
        fetchMemosRest(activeCalId, effectiveMemosLimit).then(list => {
          if (!isMounted) return;
          recentList = list;
          setHasMoreMemos(needsMemoCollection && list.length >= effectiveMemosLimit);
          applyMerged();
        });
      });

    return () => {
      isMounted = false;
      if (typeof unsubscribePinned === 'function') unsubscribePinned();
      if (typeof unsubscribeRecentActivity === 'function') unsubscribeRecentActivity();
      if (typeof unsubscribeRecent === 'function') unsubscribeRecent();
    };
  }, [activeCalId, needsMemoCollection, memosLimit, firebaseDb, firebaseConnectionVersion]);

  return { memos, setMemos, memosLimit, setMemosLimit, hasMoreMemos, setHasMoreMemos };
}
