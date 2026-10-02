/**
 * Photo comments v2 -- the only code in the app that reads or writes photo comments.
 *
 *   calendars/cal_{id}/photoCommentItems/{commentId}   one document per comment
 *   calendars/cal_{id}/photoCommentSummary/counts      { counts: { [assetKey]: n } } (server-kept)
 *
 * - A comment belongs to the photo's canonical asset key. Old threads filed under a legacy key
 *   were moved there by scripts/migrate-photo-comment-items.mjs; the lightbox still asks for the
 *   photo's legacy keys too, so a thread whose owner could not be decided is never hidden.
 * - Adding creates one document, editing changes that document, deleting sets deletedAt. Nothing
 *   ever rewrites a whole thread, so what one device has in memory can never erase comments
 *   someone else wrote (that whole-array overwrite and the per-screen key were the old bugs).
 * - Thumbnail badges read the summary document the onPhotoCommentItemWrite function keeps, which
 *   counts exactly what the lightbox shows: one document read per calendar, not one per photo.
 *
 * Server side: functions/photo-comment-items.js (same document shapes), firestore.rules.
 */
const firebaseData = () => import('./app-firebase-data.js');

const ITEMS = 'photoCommentItems';
const SUMMARY = 'photoCommentSummary';
const SUMMARY_DOC = 'counts';
const MAX_TEXT = 2000;

function liveDb() {
  return (typeof window !== 'undefined' && window.__gatherFirebaseDb) || null;
}

/** Same character set and length as firestore.rules isValidPhotoCommentDocId. */
export function cleanPhotoCommentKey(value) {
  return String(value || '').replace(/[^A-Za-z0-9_:.-]/g, '_').slice(0, 300);
}

/** The calendar a lightbox belongs to: its calendar prop, else the page's ?id=. */
export function resolvePhotoCommentCalendarId(calendarId) {
  const explicit = String(calendarId || '').trim();
  if (/^[A-Za-z0-9_-]{1,64}$/.test(explicit)) return explicit;
  try {
    const fromUrl = String(new URLSearchParams(window.location.search).get('id') || '').trim();
    return /^[A-Za-z0-9_-]{1,64}$/.test(fromUrl) ? fromUrl : '';
  } catch (_) {
    return '';
  }
}

export function newPhotoCommentId(now = Date.now()) {
  return `cmt_${now}_${Math.random().toString(36).slice(2, 8)}`;
}

/** Live comments of a thread, oldest first, without deleted ones or duplicates. */
export function visiblePhotoComments(docs) {
  const byId = new Map();
  (Array.isArray(docs) ? docs : []).forEach(doc => {
    if (!doc || !doc.id || doc.deletedAt != null) return;
    byId.set(doc.id, doc);
  });
  return Array.from(byId.values()).sort((a, b) => (Number(a.createdAt) || 0) - (Number(b.createdAt) || 0)
    || String(a.id).localeCompare(String(b.id)));
}

export function buildPhotoCommentItem({ assetKey, participantId, text, now = Date.now(), id = newPhotoCommentId(now) }) {
  const key = cleanPhotoCommentKey(assetKey);
  const body = String(text || '').trim().slice(0, MAX_TEXT);
  const who = String(participantId || '').slice(0, 120);
  if (!key || !body || !who) return null;
  return { id, assetKey: key, participantId: who, text: body, createdAt: now, updatedAt: now, deletedAt: null };
}

function collectionRef(db, calendarId) {
  return db.collection('calendars').doc(`cal_${calendarId}`).collection(ITEMS);
}

async function restRunQuery(calendarId, keys) {
  const { firebaseConfig, firestoreDocumentToJs } = await firebaseData();
  const res = await fetch(`https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/calendars/cal_${calendarId}:runQuery`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      structuredQuery: {
        from: [{ collectionId: ITEMS }],
        where: {
          fieldFilter: {
            field: { fieldPath: 'assetKey' },
            op: 'IN',
            value: { arrayValue: { values: keys.map(stringValue => ({ stringValue })) } }
          }
        },
        limit: 500
      }
    })
  });
  if (!res.ok) throw new Error(`photo comments ${res.status}`);
  const rows = await res.json();
  return (Array.isArray(rows) ? rows : [])
    .filter(row => row && row.document)
    .map(row => ({ ...(firestoreDocumentToJs(row.document) || {}), id: decodeURIComponent(String(row.document.name || '').split('/').pop()) }));
}

/**
 * Live thread of one photo. `keys` = [canonical asset key, ...legacy keys] (max 10, the
 * Firestore `in` limit). onChange(comments) gets the visible comments; onError() when no source
 * answered. Returns an unsubscribe function.
 */
export function subscribePhotoCommentThread({ calendarId, keys, onChange, onError }) {
  const lookup = Array.from(new Set((Array.isArray(keys) ? keys : []).map(cleanPhotoCommentKey).filter(Boolean))).slice(0, 10);
  if (!calendarId || !lookup.length) {
    onChange([]);
    return () => {};
  }
  let stopped = false;
  let unsubscribe = null;
  let answered = false;
  const fallback = () => {
    restRunQuery(calendarId, lookup)
      .then(docs => { if (!stopped) { answered = true; onChange(visiblePhotoComments(docs)); } })
      .catch(() => { if (!stopped && !answered && typeof onError === 'function') onError(); });
  };
  const db = liveDb();
  if (db) {
    try {
      unsubscribe = collectionRef(db, calendarId).where('assetKey', 'in', lookup).onSnapshot(snap => {
        if (stopped) return;
        // A cache-only empty answer is not proof that the thread is empty; wait for the server.
        if (snap.metadata?.fromCache && snap.empty) return;
        answered = true;
        onChange(visiblePhotoComments(snap.docs.map(doc => ({ ...(doc.data() || {}), id: doc.id }))));
      }, () => { if (!stopped) fallback(); });
    } catch (_) {
      unsubscribe = null;
      fallback();
    }
    // A stalled stream (some proxies) still gets an answer.
    const timer = setTimeout(() => { if (!stopped && !answered) fallback(); }, 5000);
    return () => {
      stopped = true;
      clearTimeout(timer);
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }
  fallback();
  return () => { stopped = true; };
}

async function write(calendarId, id, data, method, label, extra = {}) {
  const { writeCollectionDocumentWithFallback } = await firebaseData();
  const result = await writeCollectionDocumentWithFallback(ITEMS, calendarId, id, data, method, label, { requirePersisted: true, ...extra });
  return Boolean(result && result.success !== false && !result.queued);
}

/** Adds one comment. Resolves to the stored item, or null when the write failed. */
export async function addPhotoComment({ calendarId, assetKey, participantId, text }) {
  const item = buildPhotoCommentItem({ assetKey, participantId, text });
  if (!calendarId || !item) return null;
  return (await write(calendarId, item.id, item, 'set', '사진 댓글 등록')) ? item : null;
}

/** Edits one comment's text (and its author, when it was re-assigned). */
export async function editPhotoComment({ calendarId, comment, text, participantId }) {
  const body = String(text || '').trim().slice(0, MAX_TEXT);
  if (!calendarId || !comment?.id || !body) return false;
  return write(calendarId, comment.id, {
    text: body,
    participantId: String(participantId || comment.participantId || '').slice(0, 120),
    updatedAt: Date.now()
  }, 'update', '사진 댓글 수정');
}

export async function deletePhotoComment({ calendarId, comment }) {
  if (!calendarId || !comment?.id) return false;
  const now = Date.now();
  return write(calendarId, comment.id, { deletedAt: now, updatedAt: now }, 'update', '사진 댓글 삭제');
}

export async function restorePhotoComment({ calendarId, comment }) {
  if (!calendarId || !comment?.id) return false;
  return write(calendarId, comment.id, { deletedAt: null, updatedAt: Date.now() }, 'update', '사진 댓글 복원');
}

/** A replaced photo keeps its comments: re-file every comment of the old asset under the new one. */
export async function movePhotoComments({ calendarId, fromKey, toKey }) {
  const from = cleanPhotoCommentKey(fromKey);
  const to = cleanPhotoCommentKey(toKey);
  if (!calendarId || !from || !to || from === to) return true;
  const db = liveDb();
  const docs = db
    ? (await collectionRef(db, calendarId).where('assetKey', '==', from).get()).docs.map(doc => ({ ...(doc.data() || {}), id: doc.id }))
    : await restRunQuery(calendarId, [from]);
  const results = await Promise.all(docs.map(doc => write(calendarId, doc.id, {
    assetKey: to,
    previousAssetKeys: Array.from(new Set([...(Array.isArray(doc.previousAssetKeys) ? doc.previousAssetKeys : []), from])).slice(-20),
    updatedAt: Date.now()
  }, 'update', '사진 댓글 이동')));
  return results.every(Boolean);
}

/**
 * Comment counts for every photo of the calendar, from the summary document.
 * onChange(countsByAssetKey). Returns an unsubscribe function.
 */
export function subscribePhotoCommentCounts({ calendarId, onChange }) {
  if (!calendarId) return () => {};
  let stopped = false;
  const restOnce = async () => {
    try {
      const { firebaseConfig, firestoreDocumentToJs } = await firebaseData();
      const res = await fetch(`https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/calendars/cal_${calendarId}/${SUMMARY}/${SUMMARY_DOC}`);
      if (stopped) return;
      if (res.status === 404) { onChange({}); return; }
      if (!res.ok) return;
      const data = firestoreDocumentToJs(await res.json()) || {};
      if (!stopped) onChange(data.counts && typeof data.counts === 'object' ? data.counts : {});
    } catch (_) {}
  };
  const db = liveDb();
  if (db) {
    try {
      const unsubscribe = db.collection('calendars').doc(`cal_${calendarId}`).collection(SUMMARY).doc(SUMMARY_DOC)
        .onSnapshot(snap => {
          if (stopped) return;
          const counts = snap.exists ? snap.data()?.counts : null;
          onChange(counts && typeof counts === 'object' ? { ...counts } : {});
        }, () => { void restOnce(); });
      return () => { stopped = true; unsubscribe(); };
    } catch (_) {}
  }
  void restOnce();
  return () => { stopped = true; };
}
