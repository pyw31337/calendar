/**
 * 좋아요 runtime store: one live subscription per calendar, shared by every heart button on every
 * screen (they live in different lazy chunks but import this one module). Writes go through the
 * app's standard writeCollectionDocumentWithFallback (SDK → REST → retry queue), scoped to
 * calendars/cal_{id}/likes like every other calendar subcollection.
 */
import { LIKE_KINDS, buildLikeDocument, likeDocId } from './likes-model.js';
// app-firebase-data is loaded lazily: a static import from here (pulled in by UI modules that
// the app shell itself imports) creates an evaluation cycle and broke boot.
const firebaseData = () => import('./app-firebase-data.js');

const stores = new Map();

function liveDb() {
  return (typeof window !== 'undefined' && window.__gatherFirebaseDb) || null;
}

function createLikesStore(calendarId) {
  let byId = new Map();
  let ready = false;
  let unsubscribe = null;
  let restLoaded = false;
  const listeners = new Set();
  // Optimistic toggles win over snapshots until the write settles, so a slow round trip never
  // flips the heart back and forth.
  const pending = new Map();
  let snapshot = { list: [], ready: false, version: 0 };

  const rebuild = () => {
    const merged = new Map(byId);
    pending.forEach((doc, id) => { if (doc) merged.set(id, doc); else merged.delete(id); });
    snapshot = { list: Array.from(merged.values()), ready, version: snapshot.version + 1, byId: merged };
    listeners.forEach(fn => { try { fn(snapshot); } catch (_) {} });
  };

  const loadRest = async () => {
    if (restLoaded) return;
    restLoaded = true;
    try {
      const { firebaseConfig, firestoreDocumentToJs } = await firebaseData();
      const next = new Map();
      let pageToken = '';
      do {
        const query = new URLSearchParams({ pageSize: '300' });
        if (pageToken) query.set('pageToken', pageToken);
        const res = await fetch(`https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/calendars/cal_${calendarId}/likes?${query}`);
        if (!res.ok) break;
        const payload = await res.json();
        (payload.documents || []).forEach(doc => {
          const id = decodeURIComponent(String(doc.name || '').split('/').pop());
          const data = firestoreDocumentToJs(doc) || {};
          if (LIKE_KINDS.includes(data.kind)) next.set(id, { ...data, id });
        });
        pageToken = payload.nextPageToken || '';
      } while (pageToken);
      if (!unsubscribe || !ready) { byId = next; ready = true; rebuild(); }
    } catch (_) {
      ready = true;
      rebuild();
    }
  };

  const start = () => {
    if (unsubscribe) return;
    const db = liveDb();
    if (db) {
      try {
        unsubscribe = db.collection('calendars').doc(`cal_${calendarId}`).collection('likes')
          .onSnapshot(snap => {
            const next = new Map();
            snap.forEach(doc => {
              const data = doc.data() || {};
              if (LIKE_KINDS.includes(data.kind)) next.set(doc.id, { ...data, id: doc.id });
            });
            byId = next;
            ready = true;
            rebuild();
          }, () => { void loadRest(); });
        return;
      } catch (_) {
        unsubscribe = null;
      }
    }
    void loadRest();
  };

  return {
    subscribe(fn) {
      listeners.add(fn);
      start();
      fn(snapshot);
      return () => listeners.delete(fn);
    },
    getSnapshot: () => snapshot,
    isLiked(kind, ref) {
      const id = likeDocId(kind, ref);
      if (pending.has(id)) return Boolean(pending.get(id));
      return byId.has(id);
    },
    async toggle(item) {
      const doc = buildLikeDocument(item);
      if (!doc) return false;
      const id = likeDocId(doc.kind, doc.ref);
      const wasLiked = this.isLiked(doc.kind, doc.ref);
      pending.set(id, wasLiked ? null : { ...doc, id });
      rebuild();
      const { writeCollectionDocumentWithFallback } = await firebaseData();
      const result = wasLiked
        ? await writeCollectionDocumentWithFallback('likes', calendarId, id, null, 'delete', '좋아요 취소')
        : await writeCollectionDocumentWithFallback('likes', calendarId, id, doc, 'set', '좋아요');
      const ok = Boolean(result && result.success !== false);
      if (ok) {
        if (wasLiked) byId.delete(id); else byId.set(id, { ...doc, id });
      }
      pending.delete(id);
      rebuild();
      return ok ? !wasLiked : wasLiked;
    }
  };
}

export function resolveLikesCalendarId(calendarId) {
  const explicit = String(calendarId || '').trim();
  if (explicit) return explicit;
  try { return String(new URLSearchParams(window.location.search).get('id') || '').trim(); } catch (_) { return ''; }
}

export function getLikesStore(calendarId) {
  const id = resolveLikesCalendarId(calendarId);
  if (!/^[A-Za-z0-9_-]{1,64}$/.test(id)) return null;
  if (!stores.has(id)) stores.set(id, createLikesStore(id));
  return stores.get(id);
}

/** React binding: re-renders when the calendar's likes change. */
export function useLikes(React, calendarId) {
  const store = getLikesStore(calendarId);
  const [snapshot, setSnapshot] = React.useState(() => (store ? store.getSnapshot() : { list: [], ready: true }));
  React.useEffect(() => (store ? store.subscribe(setSnapshot) : undefined), [store]);
  return {
    list: snapshot.list || [],
    ready: Boolean(snapshot.ready),
    isLiked: (kind, ref) => Boolean(store && store.isLiked(kind, ref)),
    toggle: item => (store ? store.toggle(item) : Promise.resolve(false))
  };
}
