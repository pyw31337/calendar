/**
 * Concurrent-safe memo comment writes.
 *
 * Memo comments live in the memo document's `comments` array. Writing the whole array from a
 * local snapshot loses comments another device added meanwhile (last-write-wins). Appends use
 * arrayUnion; edits and deletes run a server read-modify-write transaction keyed by comment id.
 */

function getFirestoreApi() {
  if (typeof firebase !== 'undefined' && firebase?.firestore) return firebase.firestore;
  if (typeof window !== 'undefined' && window.firebase?.firestore) return window.firebase.firestore;
  return null;
}

export function diffMemoComments(previousComments = [], nextComments = []) {
  const prev = Array.isArray(previousComments) ? previousComments : [];
  const next = Array.isArray(nextComments) ? nextComments : [];
  const prevById = new Map(prev.filter(c => c && c.id).map(c => [String(c.id), c]));
  const nextById = new Map(next.filter(c => c && c.id).map(c => [String(c.id), c]));
  const added = [];
  const edited = [];
  const deletedIds = [];
  for (const [id, comment] of nextById) {
    if (!prevById.has(id)) added.push(comment);
    else {
      const before = prevById.get(id);
      if (before.text !== comment.text
        || before.participantId !== comment.participantId
        || Number(before.updatedAt || 0) !== Number(comment.updatedAt || 0)) {
        edited.push(comment);
      }
    }
  }
  for (const id of prevById.keys()) {
    if (!nextById.has(id)) deletedIds.push(id);
  }
  return { added, edited, deletedIds };
}

export function latestMemoCommentAt(comments = []) {
  let latest = 0;
  for (const c of (Array.isArray(comments) ? comments : [])) {
    const t = Number(c?.createdAt) || 0;
    if (t > latest) latest = t;
  }
  return latest;
}

function memoRef(db, calendarId, memoId) {
  return db.collection('calendars').doc(`cal_${calendarId}`).collection('memos').doc(memoId);
}

/**
 * Persist a comment list change without overwriting concurrent comments.
 * Prefer the Firestore SDK (arrayUnion / transaction). Falls back to a field update only when
 * the change is a pure append of brand-new ids and no SDK is available (caller supplies writeUpdate).
 */
export async function persistMemoCommentsChange({
  db,
  calendarId,
  memoId,
  previousComments,
  nextComments,
  writeUpdate,
} = {}) {
  if (!calendarId || !memoId) return { success: false, reason: 'missing-ids' };
  const next = Array.isArray(nextComments) ? nextComments : [];
  const prev = Array.isArray(previousComments) ? previousComments : [];
  const { added, edited, deletedIds } = diffMemoComments(prev, next);
  const lastCommentAt = latestMemoCommentAt(next);
  const firestoreApi = getFirestoreApi();
  const arrayUnion = firestoreApi?.FieldValue?.arrayUnion;

  // Pure append of one or more new comments, nothing else touched.
  if (added.length && !edited.length && !deletedIds.length && db && typeof arrayUnion === 'function') {
    const ref = memoRef(db, calendarId, memoId);
    const payload = {
      lastCommentAt,
      comments: added.length === 1 ? arrayUnion(added[0]) : arrayUnion(...added),
    };
    await ref.update(payload);
    return { success: true, mode: 'arrayUnion', added: added.length };
  }

  // Edits / deletes (or mixed with adds) need the server's current array.
  if (db && typeof db.runTransaction === 'function') {
    const ref = memoRef(db, calendarId, memoId);
    await db.runTransaction(async tx => {
      const snap = await tx.get(ref);
      const serverComments = Array.isArray(snap.data()?.comments) ? snap.data().comments.slice() : [];
      const byId = new Map(serverComments.filter(c => c && c.id).map(c => [String(c.id), c]));
      for (const id of deletedIds) byId.delete(String(id));
      for (const comment of edited) {
        if (!comment?.id) continue;
        const existing = byId.get(String(comment.id));
        if (existing) {
          byId.set(String(comment.id), {
            ...existing,
            ...comment,
            id: existing.id,
            createdAt: existing.createdAt,
          });
        }
      }
      for (const comment of added) {
        if (!comment?.id) continue;
        if (!byId.has(String(comment.id))) byId.set(String(comment.id), comment);
      }
      const merged = Array.from(byId.values())
        .sort((a, b) => (Number(a.createdAt) || 0) - (Number(b.createdAt) || 0));
      tx.update(ref, { comments: merged, lastCommentAt: latestMemoCommentAt(merged) });
    });
    return {
      success: true,
      mode: 'transaction',
      added: added.length,
      edited: edited.length,
      deleted: deletedIds.length,
    };
  }

  // Last-resort fallback (no SDK): only safe for pure appends of ids the caller knows are new.
  if (typeof writeUpdate === 'function' && added.length && !edited.length && !deletedIds.length) {
    const result = await writeUpdate({ comments: next, lastCommentAt });
    return { success: Boolean(result?.success ?? result), mode: 'fallback-update' };
  }

  return { success: false, reason: 'no-safe-transport' };
}
