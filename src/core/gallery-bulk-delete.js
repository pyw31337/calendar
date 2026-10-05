async function postQueueStorageGc(fetchImpl, projectId, body) {
  const response = await fetchImpl(
    `https://asia-northeast3-${encodeURIComponent(projectId)}.cloudfunctions.net/mediaCommand`,
    { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }
  );
  return response;
}

/**
 * Queue a chat-file Storage path for the 7-day storageGc sweeper.
 * Never delete Storage objects immediately — the same path can be referenced by other
 * messages/memos (see chat-file-attachments.js dedupe). Clients cannot write storageGc
 * directly (Firestore rules deny it); mediaCommand queueStorageGc does it server-side.
 */
export async function queueOwnedChatFileForStorageGc(attachment, { activeCalId, projectId, fetchImpl = fetch } = {}) {
  const path = String(attachment && attachment.storagePath || '');
  if (!path || !activeCalId || !projectId) return { ok: false, reason: 'missing' };
  if (path.indexOf('chatFiles/' + activeCalId + '/') !== 0) return { ok: false, reason: 'not-owned' };
  try {
    const response = await postQueueStorageGc(fetchImpl, projectId, {
      calendarId: activeCalId,
      op: 'queueStorageGc',
      paths: [path],
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || payload?.ok === false) {
      console.warn('queueStorageGc failed:', payload?.reason || response.status);
      return { ok: false, reason: payload?.reason || String(response.status) };
    }
    return { ok: true, queued: payload?.queued || 1 };
  } catch (err) {
    console.warn('Failed to queue chat file for Storage GC:', err);
    return { ok: false, reason: String(err?.message || err) };
  }
}

/** @deprecated Immediate Storage deletes are unsafe for shared paths — use queueOwnedChatFileForStorageGc. */
export async function deleteOwnedChatFileFromStorage(attachment, deps) {
  // No-op shim: never hard-delete Storage objects from the client.
  void attachment;
  void deps;
}

export async function deleteGalleryFileAttachments(items, deps) {
  const list = Array.isArray(items) ? items : [];
  if (!list.length || typeof deps.guardLoadedCalendar !== 'function' || !deps.guardLoadedCalendar()) return 0;
  const activeCal = deps.activeCal;
  if (!activeCal || !activeCal.id) return 0;
  const byMessage = new Map();
  list.forEach(item => {
    const messageId = String(item && item.messageId || '');
    if (!messageId) return;
    if (!byMessage.has(messageId)) byMessage.set(messageId, []);
    byMessage.get(messageId).push(item);
  });
  let deleted = 0;
  const projectId = deps.projectId
    || (typeof deps.getFirebaseConfig === 'function' ? deps.getFirebaseConfig()?.projectId : null)
    || (typeof window !== 'undefined' && window.GATHER_APP_CONFIG && window.GATHER_APP_CONFIG.FIREBASE_CONFIG?.projectId)
    || '';
  for (const [messageId, group] of byMessage) {
    const sourceMessage = await deps.findChatMessageById(messageId);
    if (!sourceMessage) continue;
    const current = Array.isArray(sourceMessage.fileAttachments) ? sourceMessage.fileAttachments.slice() : [];
    const removeKeys = new Set(group.map(item => String(item.id || item.url || '')));
    const removed = [];
    const nextFiles = current.filter(att => {
      const key = String((att && (att.id || att.url)) || '');
      if (removeKeys.has(key)) {
        removed.push(att);
        return false;
      }
      return true;
    });
    if (!removed.length) continue;
    const imageEntries = typeof deps.getMessageImageEntries === 'function' ? deps.getMessageImageEntries(sourceMessage) : [];
    const remainingText = String(sourceMessage.text || '').trim();
    const shouldDeleteMessage = nextFiles.length === 0 && imageEntries.length === 0
      && (!remainingText || sourceMessage.uploadSource === 'gallery');
    try {
      if (shouldDeleteMessage) {
        const deletedDoc = await deps.writeCollectionDocumentWithFallback('messages', activeCal.id, messageId, null, 'delete', '갤러리 파일 삭제');
        if (!deletedDoc) continue;
        deps.removeLocalChatMessage(messageId);
        deleted += removed.length;
      } else {
        const data = nextFiles.length ? { fileAttachments: nextFiles } : {};
        const deletePaths = nextFiles.length ? [] : ['fileAttachments'];
        const ok = await deps.writeCollectionDocumentWithFallback('messages', activeCal.id, messageId, data, 'update', '갤러리 파일 삭제', { deletePaths });
        if (!ok) continue;
        deps.patchLocalChatMessage(messageId, nextFiles.length ? { fileAttachments: nextFiles } : { fileAttachments: [] });
        deleted += removed.length;
      }
      for (const att of removed) {
        await queueOwnedChatFileForStorageGc(att, {
          activeCalId: deps.activeCalId || activeCal.id,
          projectId,
          fetchImpl: deps.fetchImpl || fetch,
        });
      }
    } catch (err) {
      console.error('handleDeleteGalleryFiles failed:', err);
    }
  }
  return deleted;
}

export async function deleteGalleryLinkItems(items, deps) {
  const list = Array.isArray(items) ? items : [];
  if (!list.length || typeof deps.guardLoadedCalendar !== 'function' || !deps.guardLoadedCalendar()) {
    return { deleted: 0, skipped: 0 };
  }
  const activeCal = deps.activeCal;
  if (!activeCal || !activeCal.id) return { deleted: 0, skipped: 0 };
  let deleted = 0;
  let skipped = 0;
  for (const item of list) {
    const source = String(item && item.source || 'chat');
    if (source === 'memo' || source === 'meeting') {
      skipped += 1;
      continue;
    }
    const messageId = String(item && item.messageId || '');
    const url = String(item && item.url || '').trim();
    if (!messageId || !url) {
      skipped += 1;
      continue;
    }
    const sourceMessage = await deps.findChatMessageById(messageId);
    if (!sourceMessage) {
      skipped += 1;
      continue;
    }
    const text = String(sourceMessage.text || '');
    const imageEntries = typeof deps.getMessageImageEntries === 'function' ? deps.getMessageImageEntries(sourceMessage) : [];
    const files = Array.isArray(sourceMessage.fileAttachments) ? sourceMessage.fileAttachments : [];
    const stripped = text.split(url).join('').trim();
    if (sourceMessage.uploadSource !== 'gallery') {
      skipped += 1;
      continue;
    }
    try {
      if (!stripped && imageEntries.length === 0 && files.length === 0) {
        const deletedDoc = await deps.writeCollectionDocumentWithFallback('messages', activeCal.id, messageId, null, 'delete', '갤러리 링크 삭제');
        if (!deletedDoc) {
          skipped += 1;
          continue;
        }
        deps.removeLocalChatMessage(messageId);
        deleted += 1;
      } else {
        const ok = await deps.writeCollectionDocumentWithFallback('messages', activeCal.id, messageId, { text: stripped }, 'update', '갤러리 링크 삭제');
        if (!ok) {
          skipped += 1;
          continue;
        }
        deps.patchLocalChatMessage(messageId, { text: stripped });
        deleted += 1;
      }
    } catch (err) {
      console.error('handleDeleteGalleryLinks failed:', err);
      skipped += 1;
    }
  }
  return { deleted, skipped };
}

export function filterDeletedPhotoFromIndexItems(items, meta) {
  if (!meta) return Array.isArray(items) ? items : [];
  const msgId = String(meta.messageId || meta.sourceMessageId || '');
  const idx = Number.isInteger(meta.imageIndex)
    ? meta.imageIndex
    : (Number.isInteger(meta.sourceImageIndex) ? meta.sourceImageIndex : null);
  const keys = new Set([
    meta.mediaKey, meta.refKey, meta.assetKey, meta.full, meta.thumb, meta.imageUrl, meta.thumbUrl
  ].filter(Boolean).map(value => String(value)));
  return (items || []).reduce((acc, photo) => {
    if (!photo) return acc;
    const photoMsg = String(photo.messageId || photo.sourceMessageId || '');
    const photoIdx = Number(photo.imageIndex);
    const photoKeys = [photo.mediaKey, photo.refKey, photo.assetKey, photo.full, photo.thumb]
      .filter(Boolean).map(value => String(value));
    const sameAsset = photoKeys.some(key => keys.has(key));
    const sameSlot = !!(msgId && photoMsg === msgId && Number.isInteger(idx) && photoIdx === idx);
    if (sameAsset || sameSlot) return acc;
    if (msgId && photoMsg === msgId && Number.isInteger(idx) && Number.isFinite(photoIdx) && photoIdx > idx) {
      acc.push({
        ...photo,
        imageIndex: photoIdx - 1,
        sourceImageIndex: Number.isInteger(photo.sourceImageIndex) ? photo.sourceImageIndex - 1 : photo.sourceImageIndex
      });
      return acc;
    }
    acc.push(photo);
    return acc;
  }, []);
}
