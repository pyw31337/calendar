function sanitizePhotoCommentDocId(key) {
  return String(key || '').replace(/[^A-Za-z0-9_:.-]/g, '_').slice(0, 300);
}

export async function fetchPhotoComments({ photoKey, calendarId, db, projectId, decodeDocument }) {
  const docId = sanitizePhotoCommentDocId(photoKey);
  if (!docId || !calendarId) return { success: true, comments: [] };
  try {
    if (db) {
      const snap = await db.collection('calendars').doc(`cal_${calendarId}`).collection('photoComments').doc(docId).get();
      return {
        success: true,
        comments: snap?.exists && Array.isArray(snap.data()?.comments) ? snap.data().comments : []
      };
    }
    const res = await fetch(`https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/calendars/cal_${calendarId}/photoComments/${docId}`);
    if (res.status === 404) return { success: true, comments: [] };
    if (!res.ok) return { success: false, comments: [] };
    const data = decodeDocument(await res.json());
    return { success: true, comments: Array.isArray(data?.comments) ? data.comments : [] };
  } catch (error) {
    console.warn('fetchPhotoComments failed:', error);
    return { success: false, comments: [] };
  }
}

export async function savePhotoComments({
  photoKey,
  comments,
  calendarId,
  writeDocument,
  audit
}) {
  const docId = sanitizePhotoCommentDocId(photoKey);
  if (!docId || !calendarId) return false;
  const nextComments = Array.isArray(comments) ? comments : [];
  if (nextComments.length === 0) {
    const deleted = await writeDocument('photoComments', calendarId, docId, null, 'delete', '사진 댓글 삭제');
    audit('photo_comment_delete', `${docId} · 0건`);
    return Boolean(deleted?.success);
  }
  const saved = await writeDocument('photoComments', calendarId, docId, {
    comments: nextComments,
    updatedAt: Date.now()
  }, 'set', '사진 댓글 저장');
  audit('photo_comment_save', `${docId} · ${nextComments.length}건`);
  return Boolean(saved?.success);
}
