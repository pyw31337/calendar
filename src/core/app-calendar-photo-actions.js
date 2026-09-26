// U13 (docs/app-main-split-units.md): CalendarApp's photo actions, moved out verbatim.
// Everything the Lightbox, DateModal, gallery and 보관함 call to delete, replace or comment on a
// photo, plus the "jump to" navigation handlers (chat message / memo / place / gallery photo /
// meeting date):
//   - meeting photos (confirmedMeeting.photos[] references) delete/replace;
//   - chat message and memo photos delete/replace, acting on the server's CURRENT document
//     (readFreshChatMessage / findMemoById) and deleting Storage files only when no other
//     document still references them (docs/data-architecture-v3.md, media-reference-integrity);
//   - the single Lightbox dispatch point (handleDeletePhoto / handleReplacePhoto);
//   - photo comment saves.
// Tag saves already live in app-image-tag-save.js (CalendarApp passes handleSaveImageTags in).
//
// This is a plain factory, not a hook: CalendarApp calls it once per render, at the spot where
// these handlers used to be declared, so every handler closes over that render's values exactly
// as before. The React hooks this code leaned on (chatMessagesRef, galleryChatMessagesRef,
// memosRef, findChatMessageById, handleFetchPhotoComments) stay in CalendarApp and are passed in. getFirebaseDb reads
// app-main's module-level Firestore handle live at call time, like the inline code did.
import { createActivityLog, getClientAuditContext, getConfirmedMeetings, getMessageImageEntries, isValidDateString, queueServerAuditEvent, reconcileMessageImageTagMap, sanitizeMemoForFirestore, sanitizeMessageForFirestore, withTimeout } from './app-domain-helpers.js';
import { fetchGalleryPhotoOrdinal, fetchMessageOrdinal, fetchMessageRest, firebaseConfig, firestoreDocumentToJs, writeCollectionDocumentWithFallback } from './app-firebase-data.js';
import { deleteChatImageFromStorage, resolveChatImageBatch } from './app-image-pipeline.js';
import { cloneConfirmedMeetings } from './confirmed-meeting-coordinator.js';
import { filterDeletedPhotoFromIndexItems } from './gallery-bulk-delete.js';
import { findImageSlotByAsset, listOtherAssetReferences, removeAssetFromMeetings, replaceAssetInMeetings } from './media-reference-integrity.js';
import { canonicalPhotoAssetKey } from './photo-asset.js';
import { savePhotoComments } from './photo-comments.js';

export function createCalendarPhotoActions({
  activeCalId, showToast, showUndoableDeleteToast, showRetryableUploadToast, setSelectedDate,
  setIsModalOpen, setDateModalInitialTab, setSharedMemo, setChatUploadProgress,
  setActiveLightbox, setPlacesInitialFocusId, setMemoInitialTag, setPhotoCommentCounts,
  galleryPhotoIndex, photoCommentStoreRef, setPreloadedPhotoComments, chatMessages,
  allChatMessages, memos, setMemos, galleryChatMessages, patchGalleryArchiveMemo,
  focusChatMessage, changeView, activeCal, activeCalRef, loadOlderChatMessagesRef,
  hasMoreOlderChatRef, patchLocalChatMessage, upsertLocalChatMessage, removeLocalChatMessage,
  prepareGalleryImageUploads, handleSaveImageTags, commitConfirmedMeetings, chatMessagesRef,
  galleryChatMessagesRef, memosRef, findChatMessageById, handleFetchPhotoComments,
  getFirebaseDb
}) {
  const isSameImageUrl = (url1, url2) => {
    if (!url1 || !url2) return false;
    if (url1 === url2) return true;
    const c1 = String(url1).split('?')[0];
    const c2 = String(url2).split('?')[0];
    return c1 === c2;
  };

  const photoMatchesUrl = (p, targetUrl) => {
    if (!p || !targetUrl) return false;
    const urls = [p.imageUrl, p.thumbUrl, p.full, p.thumb, p.url].filter(Boolean);
    return urls.some(u => isSameImageUrl(u, targetUrl));
  };

  const photoMatchesIdentity = (p, identityKey) => {
    if (!p || !identityKey) return false;
    return p.id === identityKey || p.refKey === identityKey || p.mediaKey === identityKey || p.assetKey === identityKey;
  };

  const photoMatchesIdentityPayload = (photo, identity = {}) => {
    if (!photo || !identity || typeof identity !== 'object') return false;
    const keys = [identity.photoId, identity.refKey, identity.mediaKey, identity.assetKey].filter(Boolean);
    if (keys.some(key => photoMatchesIdentity(photo, key))) return true;
    const urls = [identity.imageUrl, identity.thumbUrl, identity.full, identity.thumb].filter(Boolean);
    return urls.some(url => photoMatchesUrl(photo, url));
  };

  const photoIdentityKeys = (identity = {}) => [identity.photoId, identity.refKey, identity.mediaKey, identity.assetKey].filter(Boolean);

  const resolveImageEntryIndex = (entries, preferredIndex, identity = {}) => {
    if (!Array.isArray(entries) || entries.length === 0) return -1;
    const keys = photoIdentityKeys(identity);
    const urls = [identity.imageUrl, identity.thumbUrl, identity.full, identity.thumb].filter(Boolean);
    if (keys.length) {
      const matchedByKey = entries.findIndex(entry => keys.some(key => photoMatchesIdentity(entry, key)));
      if (matchedByKey >= 0) return matchedByKey;
    }
    if (urls.length) {
      const matchedByUrl = entries.findIndex(entry => urls.some(url => entry.full === url || entry.thumb === url || entry.imageUrl === url));
      if (matchedByUrl >= 0) return matchedByUrl;
    }
    const fallbackIndex = Number.isInteger(preferredIndex)
      ? preferredIndex
      : (Number.isInteger(identity.imageIndex) ? identity.imageIndex : (Number.isInteger(identity.sourceImageIndex) ? identity.sourceImageIndex : null));
    return Number.isInteger(fallbackIndex) && fallbackIndex >= 0 && fallbackIndex < entries.length ? fallbackIndex : -1;
  };

  const handleDeleteMeetingPhoto = (dateStr, photoId, imageUrl, options = {}) => {
    if (!activeCal) return false;
    const existingMeetings = getConfirmedMeetings(activeCal);
    let meetingIndex = isValidDateString(dateStr) ? existingMeetings.findIndex(m => m.date === dateStr) : -1;
    if (meetingIndex < 0) {
      meetingIndex = existingMeetings.findIndex(m => (m.photos || []).some(p => (
        (photoId && photoMatchesIdentity(p, photoId))
        || photoMatchesIdentity(p, options.refKey)
        || photoMatchesIdentity(p, options.mediaKey)
        || photoMatchesUrl(p, imageUrl)
      )));
    }
    if (meetingIndex < 0) return false;
    const meeting = existingMeetings[meetingIndex];
    const existingPhotos = Array.isArray(meeting.photos) ? meeting.photos : [];
    const deletedPhoto = existingPhotos.find(p => (
      (photoId && photoMatchesIdentity(p, photoId))
      || photoMatchesIdentity(p, options.refKey)
      || photoMatchesIdentity(p, options.mediaKey)
      || photoMatchesUrl(p, imageUrl)
    ));
    if (!deletedPhoto) return false;
    const previousMeetings = cloneConfirmedMeetings(existingMeetings);
    const now = Date.now();
    const nextConfirmedMeetings = existingMeetings.map((m, i) => i === meetingIndex
      ? { ...m, photos: existingPhotos.map(p => (p === deletedPhoto || p.id === deletedPhoto.id || photoMatchesUrl(p, imageUrl)) ? { ...p, deletedAt: Date.now(), updatedAt: Date.now() } : p), updatedAt: Date.now() }
      : m);
    const targetDate = meeting.date || dateStr;
    const photoLog = createActivityLog(activeCal.id, 'photo_delete', targetDate, '', now, '일정 사진 삭제');
    const ok = commitConfirmedMeetings(nextConfirmedMeetings, null, photoLog ? [photoLog] : [], 'write', 'delete');
    const restoreSourceTags = typeof options.restoreSourceTags === 'string' ? options.restoreSourceTags : '';
    const restoreSourceMessageId = options.restoreSourceMessageId || '';
    const restoreSourceImageIndex = Number.isInteger(options.restoreSourceImageIndex) ? options.restoreSourceImageIndex : null;
    const shouldDeleteStorage = !restoreSourceMessageId && !deletedPhoto?.sourceMessageId;
    const finalizeStorageDeletion = () => {
      if (!shouldDeleteStorage) return;
      // Same file may also sit in another meeting's album or a chat/memo message.
      void deleteAssetFilesIfUnreferenced(
        { imageUrl: deletedPhoto.imageUrl || imageUrl, thumbUrl: deletedPhoto.thumbUrl || '' },
        { excludeMeetingDates: [targetDate] }
      );
    };
    const undoDelete = async () => {
      try {
        const restoredMeetings = cloneConfirmedMeetings(previousMeetings);
        await commitConfirmedMeetings(restoredMeetings, null, [], 'restore');
        if (restoreSourceMessageId && Number.isInteger(restoreSourceImageIndex) && restoreSourceTags) {
          await handleSaveImageTags(restoreSourceMessageId, restoreSourceImageIndex, restoreSourceTags, {
            source: 'meeting',
            uploadSource: 'meeting',
            meetingDate: targetDate,
            photoId: deletedPhoto.id,
            imageUrl: deletedPhoto.imageUrl || imageUrl,
            thumbUrl: deletedPhoto.thumbUrl || deletedPhoto.imageUrl || imageUrl,
            sourceMessageId: restoreSourceMessageId,
            sourceImageIndex: restoreSourceImageIndex
          });
        }
        showToast('일정 사진 복원완료', 'success', 3000);
      } catch (err) {
        console.error('handleDeleteMeetingPhoto undo failed:', err);
        showToast('일정 사진 복원 실패', 'error', 4000);
      }
    };
    return ok.then(result => {
      if (!result) return false;
      if (options.silent) {
        if (shouldDeleteStorage) finalizeStorageDeletion();
        return true;
      }
      const onExpire = shouldDeleteStorage ? async () => {
        finalizeStorageDeletion();
      } : null;
      showUndoableDeleteToast('일정 사진이 삭제되었습니다.', undoDelete, onExpire, 5000);
      return true;
    });
  };

  const handleReplaceMeetingPhoto = async (dateStr, photoId, file, imageUrl, options = {}) => {
    if (!activeCal || !file) return false;
    const existingMeetings = getConfirmedMeetings(activeCal);
    let meetingIndex = isValidDateString(dateStr) ? existingMeetings.findIndex(m => m.date === dateStr) : -1;
    if (meetingIndex < 0) {
      meetingIndex = existingMeetings.findIndex(m => (m.photos || []).some(p => (
        (photoId && photoMatchesIdentity(p, photoId))
        || photoMatchesIdentity(p, options.refKey)
        || photoMatchesIdentity(p, options.mediaKey)
        || (imageUrl && (p.imageUrl === imageUrl || p.thumbUrl === imageUrl))
      )));
    }
    if (meetingIndex < 0) return false;
    const meeting = existingMeetings[meetingIndex];
    const existingPhotos = Array.isArray(meeting.photos) ? meeting.photos : [];
    const targetPhoto = existingPhotos.find(p => (
      (photoId && photoMatchesIdentity(p, photoId))
      || photoMatchesIdentity(p, options.refKey)
      || photoMatchesIdentity(p, options.mediaKey)
      || (imageUrl && (p.imageUrl === imageUrl || p.thumbUrl === imageUrl))
    ));
    if (!targetPhoto) return false;
    const compressed = await prepareGalleryImageUploads([file], '사진 교체 준비 중...');
    if (!compressed.length) { setChatUploadProgress(null); return false; }
    try {
      const [resolved] = await resolveChatImageBatch(activeCal.id, compressed, progress => {
        setChatUploadProgress({ ...progress, label: '사진 교체 중...' });
      });
      if (!resolved) throw new Error('Replacement upload returned no result');
      const prevImageUrl = targetPhoto.imageUrl;
      const prevThumbUrl = targetPhoto.thumbUrl;
      const nextConfirmedMeetings = existingMeetings.map((m, i) => i === meetingIndex
        ? { ...m, photos: existingPhotos.map(photo => (photo === targetPhoto || (photoId && photoMatchesIdentity(photo, photoId))) ? { ...photo, imageUrl: resolved.imageUrl, thumbUrl: resolved.thumbUrl || resolved.imageUrl } : photo) }
        : m);
      const ok = await commitConfirmedMeetings(nextConfirmedMeetings, '사진 교체완료');
      if (ok) {
        deleteChatImageFromStorage(prevImageUrl);
        deleteChatImageFromStorage(prevThumbUrl);
      }
      return ok ? resolved.imageUrl : false;
    } catch (err) {
      console.error('handleReplaceMeetingPhoto failed:', err);
      showRetryableUploadToast('사진 교체 실패', () => handleReplaceMeetingPhoto(dateStr, photoId, file, imageUrl, options), 5000);
      return false;
    } finally {
      setTimeout(() => setChatUploadProgress(null), 250);
    }
  };


  // Photo mutations (delete/replace/retag) must act on the server's CURRENT message, never on a
  // possibly stale local copy -- another device may have removed or reordered photos, and acting
  // on the old array positions is what deleted/retagged neighbouring photos
  // (docs/data-architecture-v3.md, root cause 2).
  const readFreshChatMessage = async messageId => {
    try {
      if (getFirebaseDb()) {
        const snap = await withTimeout(getFirebaseDb().collection('calendars').doc(`cal_${activeCalId}`).collection('messages').doc(messageId).get(), 9000, 'photo edit fresh message read');
        if (snap) return snap.exists ? { id: messageId, ...snap.data() } : null;
      }
      const rest = await fetchMessageRest(activeCalId, messageId);
      if (rest) return rest;
    } catch (readErr) {
      console.warn('readFreshChatMessage fell back to local copy:', readErr);
    }
    return findChatMessageById(messageId);
  };
  // photoIndex owners of one asset (server view of every document that references the file).
  // Returns null when the index cannot be read, so callers keep the file rather than guess.
  const fetchAssetIndexOwners = async asset => {
    const assetKey = canonicalPhotoAssetKey(asset);
    if (!assetKey) return [];
    try {
      const url = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/calendars/cal_${activeCalId}/photoIndex/${encodeURIComponent(assetKey)}`;
      const res = await withTimeout(fetch(url), 8000, 'photo index owners read');
      if (res.status === 404) return [];
      if (!res.ok) return null;
      const doc = firestoreDocumentToJs(await res.json()) || {};
      return (Array.isArray(doc.owners) ? doc.owners : []).map(owner => String(owner?.sourceOwner || '')).filter(Boolean);
    } catch (err) {
      console.warn('fetchAssetIndexOwners failed:', err);
      return null;
    }
  };
  // The only Storage deletion path for user photos: the file goes only when no other message,
  // memo or meeting album still points at it (otherwise that reference becomes a permanent 404
  // thumbnail). A leaked file costs a few KB; a dangling reference breaks every screen.
  const deleteAssetFilesIfUnreferenced = async (asset, exclusions = {}) => {
    const full = String(asset?.imageUrl || asset?.full || '');
    const thumb = String(asset?.thumbUrl || asset?.thumb || '');
    if (!full && !thumb) return false;
    const indexOwners = await fetchAssetIndexOwners({ imageUrl: full || thumb });
    if (indexOwners === null) return false;
    const others = listOtherAssetReferences({ imageUrl: full, thumbUrl: thumb }, {
      messages: [...(chatMessagesRef.current || []), ...(galleryChatMessagesRef.current || [])],
      memos: memosRef.current || [],
      meetings: getConfirmedMeetings(activeCalRef.current || activeCal),
      indexOwners,
      ...exclusions
    });
    if (others.length) {
      console.info('Storage file kept; still referenced by', others);
      return false;
    }
    if (full) deleteChatImageFromStorage(full);
    if (thumb && thumb !== full) deleteChatImageFromStorage(thumb);
    return true;
  };

  // Keeps confirmedMeeting.photos[] REFERENCES (see linkTaggedImageToMeetingDates) pointing at
  // the right photo after the chat message they trace back to loses an image -- the entry at
  // the deleted index is dropped (that photo is gone everywhere now, not just here), and every
  // later index shifts down by one to track the now-renumbered imageUrls array. Pass
  // deletedImageIndex=null when the whole message was removed, dropping every reference to it
  // regardless of index.
  const unlinkMeetingPhotoReferences = async (messageId, deletedImageIndex, deletedPhoto = {}) => {
    if (!activeCal || !messageId) return true;
    // Every album entry of the deleted file goes, including copies made by other paths or in a
    // second meeting (removeAssetFromMeetings matches by Storage identity, not only by
    // sourceMessageId) -- those leftovers were the 404 thumbnails in 추억/갤러리.
    const { meetings: nextConfirmedMeetings, changed } = removeAssetFromMeetings(
      getConfirmedMeetings(activeCal),
      { imageUrl: deletedPhoto.imageUrl || '', thumbUrl: deletedPhoto.thumbUrl || '' },
      { messageId, deletedIndex: deletedImageIndex, dropAllFromMessage: deletedImageIndex === null }
    );
    if (!changed) return true;
    const ok = await commitConfirmedMeetings(nextConfirmedMeetings, null, [], 'write', 'success');
    if (!ok) {
      throw new Error('일정 사진 연결 정리 실패');
    }
    return true;
  };

  const handleDeleteChatMessagePhoto = async (messageId, imageIndex, options) => {
    const silent = !!(options && options.silent);
    if (!messageId || !Number.isInteger(imageIndex)) return false;
    // The caller's view of the photo (possibly from a stale local copy) says WHICH file to
    // delete; the fresh server copy says WHERE it is now.
    const localMessage = await findChatMessageById(messageId);
    const localTarget = localMessage ? getMessageImageEntries(localMessage).find(entry => entry.imageIndex === imageIndex) : null;
    const sourceMessage = await readFreshChatMessage(messageId);
    if (!sourceMessage) {
      return false;
    }
    const entries = getMessageImageEntries(sourceMessage);
    const expected = localTarget
      ? { imageUrl: localTarget.full || '', thumbUrl: localTarget.thumb || '' }
      : { imageUrl: options?.imageUrl || '', thumbUrl: options?.thumbUrl || '' };
    if (expected.imageUrl || expected.thumbUrl) {
      const slot = findImageSlotByAsset(sourceMessage, expected, imageIndex);
      if (slot < 0) {
        if (!silent) showToast('이미 삭제되었거나 변경된 사진입니다. 화면을 새로고침해 주세요.', 'error', 4000);
        return false;
      }
      imageIndex = slot;
    }
    const target = entries.find(entry => entry.imageIndex === imageIndex);
    if (!target) return false;
    // Keep the three persisted arrays aligned by their source slot. `entries` is a render list
    // and may omit a malformed legacy image, so rebuilding arrays from it would shift every
    // later photo/tag pair after a deletion.
    const rawUrls = Array.isArray(sourceMessage.imageUrls) && sourceMessage.imageUrls.length
      ? sourceMessage.imageUrls.slice()
      : (sourceMessage.imageUrl ? [sourceMessage.imageUrl] : []);
    const rawThumbs = Array.isArray(sourceMessage.thumbUrls) && sourceMessage.thumbUrls.length
      ? sourceMessage.thumbUrls.slice()
      : (sourceMessage.thumbUrl ? [sourceMessage.thumbUrl] : []);
    const rawTags = Array.isArray(sourceMessage.imageTags) ? sourceMessage.imageTags.slice() : [];
    const nextUrls = rawUrls.filter((_, index) => index !== imageIndex);
    const nextThumbs = rawThumbs.filter((_, index) => index !== imageIndex);
    const nextTags = rawTags.filter((_, index) => index !== imageIndex);
    const nextImageTagMap = reconcileMessageImageTagMap({
      ...sourceMessage,
      imageUrls: nextUrls,
      thumbUrls: nextThumbs,
      imageTags: nextTags,
      imageUrl: nextUrls.find(Boolean) || nextThumbs.find(Boolean) || null,
      thumbUrl: nextThumbs.find(Boolean) || nextUrls.find(Boolean) || null
    }, sourceMessage.imageTagMap);
    const remainingText = String(sourceMessage.text || '').trim();
    const remainingFiles = Array.isArray(sourceMessage.fileAttachments) ? sourceMessage.fileAttachments.filter(Boolean) : [];
    const previousMeetings = cloneConfirmedMeetings(getConfirmedMeetings(activeCal));
    const sourceSnapshot = JSON.parse(JSON.stringify(sourceMessage));
    const deletedPhotoIdentity = {
      photoId: target.refKey || target.mediaKey || '',
      mediaKey: target.mediaKey || '',
      refKey: target.refKey || '',
      imageUrl: target.full || '',
      thumbUrl: target.thumb || ''
    };
    // Firestore messages rules only allow a fixed key set. Client snapshots often carry `id`
    // and other local-only fields; writing those on undo caused permission-denied / restore fail.
    const pickMessageFieldsForWrite = (msg, { asCreate = false } = {}) => {
      const allowed = asCreate
        ? ['participantId', 'text', 'timestamp', 'imageUrl', 'thumbUrl', 'imageUrls', 'thumbUrls', 'imageTags', 'imageTagMap', 'uploadSource', 'linkPreview', 'fileAttachments', 'replyTo']
        : ['text', 'imageUrl', 'thumbUrl', 'imageUrls', 'thumbUrls', 'imageShareUrls', 'imageTags', 'imageTagMap', 'directMediaTags', 'participantId', 'linkPreview', 'fileAttachments'];
      const out = {};
      for (const key of allowed) {
        if (msg && msg[key] !== undefined) out[key] = msg[key];
      }
      if (asCreate) {
        if (typeof out.participantId !== 'string') out.participantId = String(msg && msg.participantId || '');
        if (typeof out.timestamp !== 'number') out.timestamp = Number(msg && msg.timestamp) || Date.now();
        if (out.text === undefined) out.text = typeof (msg && msg.text) === 'string' ? msg.text : '';
      }
      return sanitizeMessageForFirestore(out);
    };
    const finalizeStorageDeletion = () => deleteAssetFilesIfUnreferenced(
      { imageUrl: target.full, thumbUrl: target.thumb },
      { excludeMessageId: messageId, excludeMeetingDates: getConfirmedMeetings(activeCalRef.current || activeCal).map(m => m.date) }
    );
    // `writeCollectionDocumentWithFallback` can also return { queued: true } when neither the
    // SDK nor REST attempt could complete in time (see FIRESTORE_WRITE_DEADLINE_MS/
    // shouldQueueCollectionWrite) -- the operation is durably saved for a later automatic retry,
    // but it has NOT actually reached Firestore yet. Callers used to treat that identically to a
    // real success, showing "사진이 삭제되었습니다." even though the photo was still sitting on
    // the server -- exactly the confusing "it says deleted but it's still there" symptom this is
    // fixing. Surface the truth instead so the user knows to wait rather than repeat the action.
    let wasQueued;
    try {
      const isWholeDelete = nextUrls.length === 0 && !remainingText && remainingFiles.length === 0;
      if (isWholeDelete) {
        const deleted = await writeCollectionDocumentWithFallback('messages', activeCalId, messageId, null, 'delete', '메시지 삭제');
        if (!deleted) throw new Error('Message delete failed');
        wasQueued = Boolean(deleted?.queued);
        removeLocalChatMessage(messageId);
      } else {
        const deletePaths = nextUrls.length === 0 ? ['imageUrl', 'thumbUrl'] : [];
        const data = sanitizeMessageForFirestore({
          imageUrls: nextUrls,
          thumbUrls: nextThumbs,
          imageUrl: nextUrls.find(Boolean) || nextThumbs.find(Boolean) || null,
          thumbUrl: nextThumbs.find(Boolean) || nextUrls.find(Boolean) || null,
          imageTags: nextTags,
          imageTagMap: nextImageTagMap
        });
        const ok = await writeCollectionDocumentWithFallback('messages', activeCalId, messageId, data, 'update', '사진 삭제', { deletePaths });
        if (!ok) throw new Error('Photo delete update failed');
        wasQueued = Boolean(ok?.queued);
        patchLocalChatMessage(messageId, data);
      }

      let meetingCleanupOk = true;
      try {
        meetingCleanupOk = await unlinkMeetingPhotoReferences(
          messageId,
          nextUrls.length === 0 ? null : imageIndex,
          deletedPhotoIdentity
        );
      } catch (cleanupErr) {
        meetingCleanupOk = false;
        console.warn('handleDeleteChatMessagePhoto meeting cleanup deferred:', cleanupErr);
      }
      const canUndo = getFirebaseDb() || !isWholeDelete;
      const restoreDeletedPhoto = async () => {
        try {
          if (isWholeDelete) {
            const createData = pickMessageFieldsForWrite(sourceSnapshot, { asCreate: true });
            const restored = await writeCollectionDocumentWithFallback('messages', activeCalId, messageId, createData, 'set', '메시지 복원');
            if (!restored) throw new Error('Message restore failed');
            upsertLocalChatMessage({ ...sourceSnapshot, ...createData, id: messageId });
          } else {
            const restoreData = pickMessageFieldsForWrite({
              imageUrls: Array.isArray(sourceSnapshot.imageUrls) ? sourceSnapshot.imageUrls : (sourceSnapshot.imageUrl ? [sourceSnapshot.imageUrl] : []),
              thumbUrls: Array.isArray(sourceSnapshot.thumbUrls) ? sourceSnapshot.thumbUrls : (sourceSnapshot.thumbUrl ? [sourceSnapshot.thumbUrl] : []),
              imageUrl: sourceSnapshot.imageUrl || (Array.isArray(sourceSnapshot.imageUrls) ? sourceSnapshot.imageUrls[0] : null) || null,
              thumbUrl: sourceSnapshot.thumbUrl || (Array.isArray(sourceSnapshot.thumbUrls) ? sourceSnapshot.thumbUrls[0] : null) || null,
              imageTags: Array.isArray(sourceSnapshot.imageTags) ? sourceSnapshot.imageTags : [],
              imageTagMap: sourceSnapshot.imageTagMap && typeof sourceSnapshot.imageTagMap === 'object' && !Array.isArray(sourceSnapshot.imageTagMap) ? sourceSnapshot.imageTagMap : {},
              text: sourceSnapshot.text,
              participantId: sourceSnapshot.participantId,
              linkPreview: sourceSnapshot.linkPreview
            }, { asCreate: false });
            const restored = await writeCollectionDocumentWithFallback('messages', activeCalId, messageId, restoreData, 'update', '사진 복원');
            if (!restored) throw new Error('Photo delete restore failed');
            patchLocalChatMessage(messageId, { ...restoreData, id: messageId });
          }
          try {
            const restoredMeetings = cloneConfirmedMeetings(previousMeetings);
            await commitConfirmedMeetings(restoredMeetings, null, [], 'restore');
          } catch (meetingErr) {
            console.warn('handleDeleteChatMessagePhoto meeting restore notice:', meetingErr);
          }
          showToast('사진 삭제를 되돌렸습니다.', 'success', 3000);
        } catch (err) {
          console.error('handleDeleteChatMessagePhoto undo failed:', err);
          showToast('사진 복원 실패', 'error', 4000);
        }
      };
      const expireStorageDeletion = async () => {
        if (!meetingCleanupOk) {
          try {
            meetingCleanupOk = await unlinkMeetingPhotoReferences(
              messageId,
              nextUrls.length === 0 ? null : imageIndex,
              deletedPhotoIdentity
            );
          } catch (cleanupErr) {
            meetingCleanupOk = false;
            console.warn('handleDeleteChatMessagePhoto meeting cleanup retry failed:', cleanupErr);
          }
        }
        if (!meetingCleanupOk) return;
        await finalizeStorageDeletion();
      };
      if (wasQueued) {
        if (!silent) showToast('네트워크가 불안정하여 삭제를 대기열에 저장했습니다. 연결되면 자동으로 반영됩니다.', 'info', 6000);
      } else if (silent) {
        await expireStorageDeletion();
      } else if (canUndo) {
        showUndoableDeleteToast('사진이 삭제되었습니다.', restoreDeletedPhoto, expireStorageDeletion, 5000);
      } else {
        showToast('사진이 삭제되었습니다.', 'delete', 5000, null, expireStorageDeletion);
      }
      return true;
    } catch (err) {
      console.error('handleDeleteChatMessagePhoto failed:', err);
      if (!silent) showToast('사진 삭제 실패', 'error', 4000);
      return false;
    }
  };

  const handleReplaceChatMessagePhoto = async (messageId, imageIndex, file) => {
    if (!messageId || !Number.isInteger(imageIndex) || !file) return false;
    const localMessage = await findChatMessageById(messageId);
    const localTarget = localMessage ? getMessageImageEntries(localMessage).find(entry => entry.imageIndex === imageIndex) : null;
    const sourceMessage = await readFreshChatMessage(messageId);
    if (!sourceMessage) {
      showToast('교체 대상 이미지를 찾지 못했습니다.', 'error', 4000);
      return false;
    }
    if (localTarget) {
      const slot = findImageSlotByAsset(sourceMessage, { imageUrl: localTarget.full || '', thumbUrl: localTarget.thumb || '' }, imageIndex);
      if (slot < 0) {
        showToast('이미 삭제되었거나 변경된 사진입니다. 화면을 새로고침해 주세요.', 'error', 4000);
        return false;
      }
      imageIndex = slot;
    }
    const entries = getMessageImageEntries(sourceMessage);
    const target = entries.find(entry => entry.imageIndex === imageIndex);
    if (!target) return false;
    const compressed = await prepareGalleryImageUploads([file], '사진 교체 준비 중...');
    if (!compressed.length) { setChatUploadProgress(null); return false; }
    try {
      const [resolved] = await resolveChatImageBatch(activeCalId, compressed, progress => {
        setChatUploadProgress({ ...progress, label: '사진 교체 중...' });
      });
      if (!resolved) throw new Error('Replacement upload returned no result');
      const rawUrls = Array.isArray(sourceMessage.imageUrls) && sourceMessage.imageUrls.length
        ? sourceMessage.imageUrls.slice()
        : (sourceMessage.imageUrl ? [sourceMessage.imageUrl] : []);
      const rawThumbs = Array.isArray(sourceMessage.thumbUrls) && sourceMessage.thumbUrls.length
        ? sourceMessage.thumbUrls.slice()
        : (sourceMessage.thumbUrl ? [sourceMessage.thumbUrl] : []);
      while (rawUrls.length <= imageIndex) rawUrls.push('');
      while (rawThumbs.length <= imageIndex) rawThumbs.push('');
      const nextUrls = rawUrls.map((url, index) => index === imageIndex ? resolved.imageUrl : url);
      const nextThumbs = rawThumbs.map((url, index) => index === imageIndex ? (resolved.thumbUrl || resolved.imageUrl) : url);
      const nextImageTags = Array.isArray(sourceMessage.imageTags) ? [...sourceMessage.imageTags] : [];
      while (nextImageTags.length < Math.max(nextUrls.length, nextThumbs.length)) nextImageTags.push('');
      // Replacing the pixels does not change what the photo is: keep its tags (they used to be
      // wiped here) and re-key them to the new file.
      const keptTags = String(target.tags || nextImageTags[imageIndex] || '');
      nextImageTags[imageIndex] = keptTags;
      const oldAssetKey = canonicalPhotoAssetKey({ full: target.full, thumb: target.thumb });
      const newAssetKey = canonicalPhotoAssetKey({ full: resolved.imageUrl, thumb: resolved.thumbUrl });
      const seededTagMap = { ...(sourceMessage.imageTagMap && typeof sourceMessage.imageTagMap === 'object' && !Array.isArray(sourceMessage.imageTagMap) ? sourceMessage.imageTagMap : {}) };
      if (newAssetKey && keptTags) seededTagMap[newAssetKey] = keptTags;
      const nextImageTagMap = reconcileMessageImageTagMap({
        ...sourceMessage,
        imageUrls: nextUrls,
        thumbUrls: nextThumbs,
        imageTags: nextImageTags,
        imageUrl: nextUrls.find(Boolean) || nextThumbs.find(Boolean) || null,
        thumbUrl: nextThumbs.find(Boolean) || nextUrls.find(Boolean) || null
      }, seededTagMap);
      const data = sanitizeMessageForFirestore({
        imageUrls: nextUrls,
        thumbUrls: nextThumbs,
        imageUrl: nextUrls.find(Boolean) || nextThumbs.find(Boolean) || null,
        thumbUrl: nextThumbs.find(Boolean) || nextUrls.find(Boolean) || null,
        imageTags: nextImageTags,
        imageTagMap: nextImageTagMap
      });
      const ok = await writeCollectionDocumentWithFallback('messages', activeCalId, messageId, data, 'update', '사진 교체');
      if (!ok) throw new Error('Photo replace update failed');
      patchLocalChatMessage(messageId, data);
      const oldAsset = { imageUrl: target.full, thumbUrl: target.thumb };
      // Every meeting album copy follows the replacement; otherwise it keeps pointing at the
      // old file, which is deleted below -> a broken thumbnail in 일정/추억.
      let meetingsMoved = true;
      try {
        const moved = replaceAssetInMeetings(getConfirmedMeetings(activeCalRef.current || activeCal), oldAsset, { imageUrl: resolved.imageUrl, thumbUrl: resolved.thumbUrl || resolved.imageUrl });
        if (moved.changed) meetingsMoved = Boolean(await commitConfirmedMeetings(moved.meetings, null, [], 'write', 'success'));
      } catch (moveErr) {
        meetingsMoved = false;
        console.warn('handleReplaceChatMessagePhoto meeting copies not moved:', moveErr);
      }
      // Comments follow the photo, not the file.
      if (oldAssetKey && newAssetKey && oldAssetKey !== newAssetKey) {
        try {
          const previousComments = await handleFetchPhotoComments(oldAssetKey);
          const list = Array.isArray(previousComments) ? previousComments : (Array.isArray(previousComments?.comments) ? previousComments.comments : []);
          if (list.length && await handleSavePhotoComments(newAssetKey, list)) await handleSavePhotoComments(oldAssetKey, []);
        } catch (commentErr) {
          console.warn('handleReplaceChatMessagePhoto comments not moved:', commentErr);
        }
      }
      if (meetingsMoved) {
        await deleteAssetFilesIfUnreferenced(oldAsset, {
          excludeMessageId: messageId,
          excludeMeetingDates: getConfirmedMeetings(activeCalRef.current || activeCal).map(m => m.date)
        });
      }
      showToast('사진 교체완료', 'success');
      return resolved.imageUrl;
    } catch (err) {
      console.error('handleReplaceChatMessagePhoto failed:', err);
      showRetryableUploadToast('사진 교체 실패', () => handleReplaceChatMessagePhoto(messageId, imageIndex, file), 5000);
      return false;
    } finally {
      setTimeout(() => setChatUploadProgress(null), 250);
    }
  };

  // Memo photos live in the memos collection, structurally identical to chat message images
  // (imageUrls/thumbUrls arrays), so this mirrors handleDeleteChatMessagePhoto/
  // handleReplaceChatMessagePhoto one-for-one against that collection instead.
  const handleSavePhotoComments = async (photoKey, nextComments) => {
    const saved = await savePhotoComments({
      photoKey,
      comments: nextComments,
      calendarId: activeCalId,
      writeDocument: writeCollectionDocumentWithFallback,
      audit: (type, detail) => queueServerAuditEvent(activeCalId, type, detail, getClientAuditContext())
    });
    if (saved) {
      const docId = String(photoKey || '').replace(/[^A-Za-z0-9_:.-]/g, '_').slice(0, 300);
      if (docId) {
        const comments = Array.isArray(nextComments) ? nextComments : [];
        if (photoCommentStoreRef.current) photoCommentStoreRef.current.updateLocal(docId, comments);
        setPreloadedPhotoComments(previous => {
          const next = { ...previous };
          if (comments.length > 0) next[docId] = comments;
          else delete next[docId];
          return next;
        });
        setPhotoCommentCounts(previous => {
          const next = { ...previous };
          if (comments.length > 0) next[docId] = comments.length;
          else delete next[docId];
          return next;
        });
      }
    }
    return saved;
  };

  const findMemoById = async memoId => {
    const local = (memos || []).find(m => m.id === memoId);
    if (local) return local;
    try {
      if (getFirebaseDb()) {
        const snap = await getFirebaseDb().collection('calendars').doc(`cal_${activeCalId}`).collection('memos').doc(memoId).get();
        return snap?.exists ? { id: memoId, ...snap.data() } : null;
      }
      const res = await fetch(`https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/calendars/cal_${activeCalId}/memos/${memoId}`);
      return res.ok ? { id: memoId, ...firestoreDocumentToJs(await res.json()) } : null;
    } catch (readErr) {
      console.warn('findMemoById failed:', readErr);
      return null;
    }
  };

  const handleDeleteMemoPhoto = async (memoId, imageIndex, options) => {
    const silent = !!(options && options.silent);
    if (!memoId || !Number.isInteger(imageIndex)) return false;
    const memo = await findMemoById(memoId);
    if (!memo) {
      return false;
    }
    const urls = Array.isArray(memo.imageUrls) ? memo.imageUrls : (memo.imageUrl ? [memo.imageUrl] : []);
    const thumbs = Array.isArray(memo.thumbUrls) ? memo.thumbUrls : (memo.thumbUrl ? [memo.thumbUrl] : []);
    if (!urls[imageIndex]) return false;
    const removedUrl = urls[imageIndex];
    const removedThumb = thumbs[imageIndex] || removedUrl;
    const nextUrls = urls.filter((_, i) => i !== imageIndex);
    const nextThumbs = thumbs.filter((_, i) => i !== imageIndex);
    const nextImageTags = Array.isArray(memo.imageTags) ? memo.imageTags.filter((_, i) => i !== imageIndex) : undefined;
    const nextImageTagMap = reconcileMessageImageTagMap({
      ...memo,
      id: memoId,
      uploadSource: 'memo',
      imageUrls: nextUrls,
      thumbUrls: nextThumbs,
      imageTags: nextImageTags || [],
      imageUrl: nextUrls.find(Boolean) || nextThumbs.find(Boolean) || null,
      thumbUrl: nextThumbs.find(Boolean) || nextUrls.find(Boolean) || null
    }, memo.imageTagMap);
    const memoSnapshot = JSON.parse(JSON.stringify(memo));
    const finalizeStorageDeletion = () => {
      deleteChatImageFromStorage(removedUrl);
      if (removedThumb !== removedUrl) deleteChatImageFromStorage(removedThumb);
    };
    try {
      const deletePaths = nextUrls.length === 0 ? ['imageUrl', 'thumbUrl'] : [];
      const data = sanitizeMemoForFirestore({
        imageUrls: nextUrls,
        thumbUrls: nextThumbs,
        imageUrl: nextUrls.find(Boolean) || nextThumbs.find(Boolean) || null,
        thumbUrl: nextThumbs.find(Boolean) || nextUrls.find(Boolean) || null,
        ...(nextImageTags ? { imageTags: nextImageTags } : {}),
        imageTagMap: nextImageTagMap
      });
      const updated = await writeCollectionDocumentWithFallback('memos', activeCalId, memoId, data, 'update', '메모 사진 삭제', { deletePaths });
      if (!updated) throw new Error('Memo photo delete failed');
      setMemos(prev => prev.map(m => m.id === memoId ? { ...m, ...data } : m));
      if (typeof patchGalleryArchiveMemo === 'function') patchGalleryArchiveMemo(memoId, data);
      if (silent) {
        finalizeStorageDeletion();
        return true;
      }
      showUndoableDeleteToast('사진이 삭제되었습니다.', async () => {
        try {
          const restored = await writeCollectionDocumentWithFallback('memos', activeCalId, memoId, sanitizeMemoForFirestore(memoSnapshot), 'set', '메모 사진 복원');
          if (!restored) throw new Error('Memo photo restore failed');
          setMemos(prev => prev.map(m => m.id === memoId ? { ...m, ...memoSnapshot } : m));
          if (typeof patchGalleryArchiveMemo === 'function') patchGalleryArchiveMemo(memoId, memoSnapshot);
          showToast('사진 삭제를 되돌렸습니다.', 'success', 3000);
        } catch (err) {
          console.error('handleDeleteMemoPhoto undo failed:', err);
          showToast('사진 복원 실패', 'error', 4000);
        }
      }, finalizeStorageDeletion, 5000);
      return true;
    } catch (err) {
      console.error('handleDeleteMemoPhoto failed:', err);
      if (!silent) showToast('사진 삭제 실패', 'error', 4000);
      return false;
    }
  };

  const handleReplaceMemoPhoto = async (memoId, imageIndex, file) => {
    if (!memoId || !Number.isInteger(imageIndex) || !file) return false;
    const memo = await findMemoById(memoId);
    if (!memo) {
      showToast('교체 대상 이미지를 찾지 못했습니다.', 'error', 4000);
      return false;
    }
    const urls = Array.isArray(memo.imageUrls) ? memo.imageUrls : (memo.imageUrl ? [memo.imageUrl] : []);
    const thumbs = Array.isArray(memo.thumbUrls) ? memo.thumbUrls : (memo.thumbUrl ? [memo.thumbUrl] : []);
    if (!urls[imageIndex]) return false;
    const compressed = await prepareGalleryImageUploads([file], '사진 교체 준비 중...');
    if (!compressed.length) { setChatUploadProgress(null); return false; }
    try {
      const [resolved] = await resolveChatImageBatch(activeCalId, compressed, progress => {
        setChatUploadProgress({ ...progress, label: '사진 교체 중...' });
      });
      if (!resolved) throw new Error('Replacement upload returned no result');
      const removedUrl = urls[imageIndex];
      const removedThumb = thumbs[imageIndex] || removedUrl;
      const nextUrls = urls.map((u, i) => i === imageIndex ? resolved.imageUrl : u);
      const nextThumbs = thumbs.map((t, i) => i === imageIndex ? (resolved.thumbUrl || resolved.imageUrl) : t);
      const nextImageTags = Array.isArray(memo.imageTags) ? [...memo.imageTags] : [];
      while (nextImageTags.length < nextUrls.length) nextImageTags.push('');
      // A replacement is a new asset, not a renamed old one. Never carry the removed photo's
      // people/place tags across to it.
      nextImageTags[imageIndex] = '';
      const nextImageTagMap = reconcileMessageImageTagMap({
        ...memo,
        id: memoId,
        uploadSource: 'memo',
        imageUrls: nextUrls,
        thumbUrls: nextThumbs,
        imageTags: nextImageTags,
        imageUrl: nextUrls.find(Boolean) || nextThumbs.find(Boolean) || null,
        thumbUrl: nextThumbs.find(Boolean) || nextUrls.find(Boolean) || null
      }, memo.imageTagMap);
      const data = sanitizeMemoForFirestore({
        imageUrls: nextUrls,
        thumbUrls: nextThumbs,
        imageUrl: nextUrls.find(Boolean) || nextThumbs.find(Boolean) || null,
        thumbUrl: nextThumbs.find(Boolean) || nextUrls.find(Boolean) || null,
        imageTags: nextImageTags,
        imageTagMap: nextImageTagMap
      });
      const updated = await writeCollectionDocumentWithFallback('memos', activeCalId, memoId, data, 'update', '메모 사진 교체');
      if (!updated) throw new Error('Memo photo replace failed');
      setMemos(prev => prev.map(m => m.id === memoId ? { ...m, ...data } : m));
      deleteChatImageFromStorage(removedUrl);
      if (removedThumb !== removedUrl) deleteChatImageFromStorage(removedThumb);
      showToast('사진 교체완료', 'success');
      return resolved.imageUrl;
    } catch (err) {
      console.error('handleReplaceMemoPhoto failed:', err);
      showRetryableUploadToast('사진 교체 실패', () => handleReplaceMemoPhoto(memoId, imageIndex, file), 5000);
      return false;
    } finally {
      setTimeout(() => setChatUploadProgress(null), 250);
    }
  };

  // Single dispatch point handed to every Lightbox instance -- routes to the right storage
  // location based on meta.source. directMediaUrl (an image pasted as a bare URL in chat/memo
  // text) has no clean single-item target to mutate, so it's left unsupported (Lightbox hides
  // the edit/delete buttons for it).
  const findPhotoTargetByUrl = async (imageUrl, preferredMsgId, preferredDateStr, preferredPhotoId, preferredIdentity = {}) => {
    if (!imageUrl) return null;
    if (preferredMsgId) {
      const msg = await findChatMessageById(preferredMsgId);
      if (msg) {
        const getEntries = typeof getMessageImageEntries === 'function' ? getMessageImageEntries : null;
        const entries = getEntries ? getEntries(msg) : [];
        const idx = resolveImageEntryIndex(entries, preferredIdentity.imageIndex, {
          ...preferredIdentity,
          photoId: preferredPhotoId || preferredIdentity.photoId || '',
          imageUrl,
          thumbUrl: preferredIdentity.thumbUrl || imageUrl
        });
        if (idx >= 0) return { type: 'chat', messageId: msg.id, imageIndex: idx, assetKey: entries[idx]?.assetKey || entries[idx]?.mediaKey || '', mediaKey: entries[idx]?.mediaKey || '', refKey: entries[idx]?.refKey || '' };
      }
    }
    const localMsg = (allChatMessages || []).find(m => {
      const getEntries = typeof getMessageImageEntries === 'function' ? getMessageImageEntries : null;
      const entries = getEntries ? getEntries(m) : [];
      return entries.some(e => e.full === imageUrl || e.thumb === imageUrl || e.imageUrl === imageUrl || photoMatchesIdentityPayload(e, preferredIdentity));
    });
    if (localMsg) {
      const getEntries = typeof getMessageImageEntries === 'function' ? getMessageImageEntries : null;
      const entries = getEntries ? getEntries(localMsg) : [];
      const idx = resolveImageEntryIndex(entries, preferredIdentity.imageIndex, {
        ...preferredIdentity,
        photoId: preferredPhotoId || preferredIdentity.photoId || '',
        imageUrl,
        thumbUrl: preferredIdentity.thumbUrl || imageUrl
      });
      if (idx >= 0) return { type: 'chat', messageId: localMsg.id, imageIndex: idx, assetKey: entries[idx]?.assetKey || entries[idx]?.mediaKey || '', mediaKey: entries[idx]?.mediaKey || '', refKey: entries[idx]?.refKey || '' };
    }

    const localMemo = (memos || []).find(m => {
      const urls = Array.isArray(m.imageUrls) ? m.imageUrls : (m.imageUrl ? [m.imageUrl] : []);
      const thumbs = Array.isArray(m.thumbUrls) ? m.thumbUrls : (m.thumbUrl ? [m.thumbUrl] : []);
      return urls.includes(imageUrl) || thumbs.includes(imageUrl) || photoMatchesIdentityPayload(m, preferredIdentity);
    });
    if (localMemo) {
      const urls = Array.isArray(localMemo.imageUrls) ? localMemo.imageUrls : (localMemo.imageUrl ? [localMemo.imageUrl] : []);
      const thumbs = Array.isArray(localMemo.thumbUrls) ? localMemo.thumbUrls : (localMemo.thumbUrl ? [localMemo.thumbUrl] : []);
      let idx = urls.indexOf(imageUrl);
      if (idx < 0) idx = thumbs.indexOf(imageUrl);
      return { type: 'memo', memoId: localMemo.id, imageIndex: Math.max(0, idx), assetKey: `memo:${localMemo.id}:${Math.max(0, idx)}`, mediaKey: `memo:${localMemo.id}:${Math.max(0, idx)}`, refKey: `memo:${localMemo.id}:${Math.max(0, idx)}` };
    }

    const meetings = getConfirmedMeetings(activeCal);
    let targetMeeting = null;
    let targetPhoto = null;
    if (preferredDateStr && isValidDateString(preferredDateStr)) {
      const m = meetings.find(item => item.date === preferredDateStr);
      if (m && Array.isArray(m.photos)) {
        targetPhoto = m.photos.find(p => (preferredPhotoId && p.id === preferredPhotoId) || photoMatchesIdentityPayload(p, preferredIdentity) || p.imageUrl === imageUrl || p.thumbUrl === imageUrl);
        if (targetPhoto) targetMeeting = m;
      }
    }
    if (!targetMeeting) {
      for (const m of meetings) {
        if (!Array.isArray(m.photos)) continue;
        const p = m.photos.find(item => (preferredPhotoId && item.id === preferredPhotoId) || photoMatchesIdentityPayload(item, preferredIdentity) || item.imageUrl === imageUrl || item.thumbUrl === imageUrl);
        if (p) {
          targetMeeting = m;
          targetPhoto = p;
          break;
        }
      }
    }
    if (targetMeeting && targetPhoto) {
      return { type: 'meeting', dateStr: targetMeeting.date, photoId: targetPhoto.id, photo: targetPhoto, assetKey: targetPhoto.assetKey || targetPhoto.mediaKey || '', mediaKey: targetPhoto.mediaKey || '', refKey: targetPhoto.refKey || '' };
    }

    return null;
  };

  const focusElementWithShake = el => {
    if (!el) return false;
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    el.classList.remove('chat-search-focused-bubble');
    void el.offsetWidth;
    el.classList.add('chat-search-focused-bubble');
    setTimeout(() => {
      el.classList.remove('chat-search-focused-bubble');
    }, 2200);
    return true;
  };

  const dropPhotoFromGalleryIndex = meta => {
    if (!meta || typeof galleryPhotoIndex?.patchItems !== 'function') return;
    galleryPhotoIndex.patchItems(items => filterDeletedPhotoFromIndexItems(items, meta));
  };

  const handleDeletePhoto = async meta => {
    if (!meta || meta.directMediaUrl) return false;
    const silent = !!meta.silent;
    const imageUrl = meta.imageUrl || meta.full || meta.thumb;
    const msgId = meta.messageId || meta.sourceMessageId;
    const imgIdx = Number.isInteger(meta.imageIndex) ? meta.imageIndex : (Number.isInteger(meta.sourceImageIndex) ? meta.sourceImageIndex : 0);
    const dateStr = meta.meetingDate;
    const photoId = meta.photoId;
    const mediaKey = meta.mediaKey || meta.originMediaKey || '';
    const refKey = meta.refKey || '';
    const isMeetingPhotoMeta = meta.source === 'meeting' || meta.uploadSource === 'meeting' || dateStr || photoId;
    const originalTags = typeof meta.tags === 'string' ? meta.tags : '';
    const preferredIdentity = { photoId, mediaKey, refKey, assetKey: meta.assetKey || '', imageUrl, thumbUrl: meta.thumbUrl || meta.thumb || imageUrl, imageIndex: imgIdx, sourceImageIndex: meta.sourceImageIndex };
    const silentOpt = silent ? { silent: true } : undefined;
    const finish = (ok, patch) => {
      if (!ok) return false;
      dropPhotoFromGalleryIndex(patch || meta);
      return true;
    };
    const meetingOpts = extra => ({
      restoreSourceMessageId: extra.sourceMessageId,
      restoreSourceImageIndex: extra.sourceImageIndex,
      restoreSourceTags: originalTags,
      mediaKey: extra.mediaKey || mediaKey,
      refKey: extra.refKey || refKey,
      silent
    });

    if (meta.source === 'memo' && msgId) {
      if (finish(await handleDeleteMemoPhoto(msgId, imgIdx, silentOpt))) return true;
    }

    if (meta.sourceMessageId) {
      const sourceMessage = await findChatMessageById(meta.sourceMessageId);
      const entries = sourceMessage ? getMessageImageEntries(sourceMessage) : [];
      const resolvedIndex = resolveImageEntryIndex(entries, meta.sourceImageIndex, preferredIdentity);
      if (resolvedIndex >= 0) {
        // Meeting-tab photos are a view onto the shared image asset, not a separate owner.
        // Delete the canonical asset first so the photo disappears from chat, gallery, and
        // every linked meeting in one step.
        if (finish(
          await handleDeleteChatMessagePhoto(meta.sourceMessageId, resolvedIndex, silentOpt),
          { ...meta, imageIndex: resolvedIndex, messageId: meta.sourceMessageId }
        )) return true;
      }
    }

    const target = await findPhotoTargetByUrl(imageUrl, msgId, dateStr, photoId, preferredIdentity);
    if (target) {
      if (target.type === 'chat') {
        if (finish(
          await handleDeleteChatMessagePhoto(target.messageId, target.imageIndex, silentOpt),
          { ...meta, messageId: target.messageId, imageIndex: target.imageIndex }
        )) return true;
      } else if (target.type === 'memo') {
        if (finish(
          await handleDeleteMemoPhoto(target.memoId, target.imageIndex, silentOpt),
          { ...meta, messageId: target.memoId, imageIndex: target.imageIndex }
        )) return true;
      } else if (target.type === 'meeting') {
        if (finish(await handleDeleteMeetingPhoto(target.dateStr, target.photoId, imageUrl, meetingOpts(target)))) return true;
      }
    }

    if (msgId) {
      if (finish(
        await handleDeleteChatMessagePhoto(msgId, imgIdx, silentOpt),
        { ...meta, messageId: msgId, imageIndex: imgIdx }
      )) return true;
    }

    if (isMeetingPhotoMeta) {
      // Legacy fallback for meeting-only entries that do not have a canonical source asset
      // pointer. New uploads should almost always route through the shared chat/message asset
      // path above so one delete removes the photo everywhere.
      if (finish(await handleDeleteMeetingPhoto(dateStr, photoId, imageUrl, meetingOpts(meta)))) return true;
      return false;
    }

    if (finish(await handleDeleteMeetingPhoto(dateStr, photoId, imageUrl, meetingOpts(meta)))) return true;
    if (!silent) showToast('삭제 대상 사진을 찾지 못했습니다.', 'error', 4000);
    return false;
  };

  const handleReplacePhoto = async (meta, file) => {
    if (!meta || meta.directMediaUrl || !file) return false;
    const imageUrl = meta.imageUrl || meta.full || meta.thumb;
    const msgId = meta.messageId || meta.sourceMessageId;
    const imgIdx = Number.isInteger(meta.imageIndex) ? meta.imageIndex : (Number.isInteger(meta.sourceImageIndex) ? meta.sourceImageIndex : 0);
    const dateStr = meta.meetingDate;
    const photoId = meta.photoId;
    const mediaKey = meta.mediaKey || meta.originMediaKey || '';
    const refKey = meta.refKey || '';
    const preferredIdentity = { photoId, mediaKey, refKey, assetKey: meta.assetKey || '', imageUrl, thumbUrl: meta.thumbUrl || meta.thumb || imageUrl, imageIndex: imgIdx, sourceImageIndex: meta.sourceImageIndex };

    if (meta.source === 'memo' && msgId) {
      const res = await handleReplaceMemoPhoto(msgId, imgIdx, file);
      if (res) return res;
    }

    if (meta.sourceMessageId) {
      const sourceMessage = await findChatMessageById(meta.sourceMessageId);
      const entries = sourceMessage ? getMessageImageEntries(sourceMessage) : [];
      const resolvedIndex = resolveImageEntryIndex(entries, meta.sourceImageIndex, preferredIdentity);
      if (resolvedIndex >= 0) {
        // As with delete, the shared source image is the canonical asset. Replacing it there
        // keeps chat, gallery, and meeting views visually identical without having to patch each
        // view independently.
        const resChat = await handleReplaceChatMessagePhoto(meta.sourceMessageId, resolvedIndex, file);
        if (resChat) return resChat;
      }
    }

    if ((meta.source === 'meeting' || meta.uploadSource === 'meeting' || dateStr || photoId) && !meta.sourceMessageId) {
      const resMeeting = await handleReplaceMeetingPhoto(dateStr, photoId, file, imageUrl, { mediaKey, refKey });
      if (resMeeting) return resMeeting;
    }

    if (msgId) {
      const resChat = await handleReplaceChatMessagePhoto(msgId, imgIdx, file);
      if (resChat) return resChat;
    }

    const target = await findPhotoTargetByUrl(imageUrl, msgId, dateStr, photoId, preferredIdentity);
    if (target) {
      if (target.type === 'chat') {
        const res = await handleReplaceChatMessagePhoto(target.messageId, target.imageIndex, file);
        if (res) return res;
      } else if (target.type === 'memo') {
        const res = await handleReplaceMemoPhoto(target.memoId, target.imageIndex, file);
        if (res) return res;
      } else if (target.type === 'meeting') {
        const res = await handleReplaceMeetingPhoto(target.dateStr, target.photoId, file, imageUrl, { mediaKey: target.mediaKey, refKey: target.refKey });
        if (res) return res;
      }
    }

    const resFallback = await handleReplaceMeetingPhoto(dateStr, photoId, file, imageUrl, { mediaKey, refKey });
    if (resFallback) return resFallback;

    showToast('교체 대상 사진을 찾지 못했습니다.', 'error', 4000);
    return false;
  };

  const handleJumpToChatMessage = messageId => {
    if (!messageId) return;
    setActiveLightbox(null);
    changeView('chat');
    setTimeout(async () => {
      if (focusChatMessage(messageId)) return;
      for (let i = 0; i < 40 && hasMoreOlderChatRef.current; i++) {
        await Promise.resolve(loadOlderChatMessagesRef.current());
        await new Promise(resolve => setTimeout(resolve, 80));
        if (focusChatMessage(messageId)) return;
      }
      showToast('메시지를 찾을 수 없습니다.', 'error');
    }, 350);
  };

  const handleGetChatMessageOrdinal = timestamp => {
    if (!activeCalId || !timestamp) return Promise.resolve(null);
    return fetchMessageOrdinal(activeCalId, timestamp);
  };

  const handleGetGalleryPhotoOrdinal = (messageId, imageIndex) => {
    if (!activeCalId || !messageId) return Promise.resolve(null);
    return fetchGalleryPhotoOrdinal(activeCalId, messageId, imageIndex);
  };

  const handleJumpToMemo = async memoId => {
    if (!memoId) return;
    setActiveLightbox(null);
    const local = (memos || []).find(m => m.id === memoId);
    if (local) setSharedMemo(local);
    else {
      const fetched = await findMemoById(memoId);
      if (fetched) setSharedMemo(fetched);
    }
    changeView('memo');
    setTimeout(() => {
      const el = document.querySelector(`[data-memo-id="${memoId}"], #memo-${memoId}`);
      if (el) focusElementWithShake(el);
    }, 350);
  };

  const handleJumpToMemoTag = tag => {
    if (!tag) return;
    setMemoInitialTag(tag);
    changeView('memo');
  };

  const handleJumpToPlace = placeId => {
    if (!placeId) return;
    setPlacesInitialFocusId(placeId);
    changeView('places');
  };

  const handleJumpToGallery = (messageId, imageIndex, imageUrl) => {
    setActiveLightbox(null);
    changeView('gallery');
    setTimeout(() => {
      let el = imageUrl ? document.querySelector(`[data-photo-url="${CSS.escape(imageUrl)}"]`) : null;
      if (!el && messageId) {
        el = document.querySelector(`[data-message-id="${messageId}"]`);
      }
      if (el) focusElementWithShake(el);
    }, 350);
  };

  const handleJumpToMeetingDate = (dateStr, initialTab = null) => {
    if (!dateStr) return;
    setActiveLightbox(null);
    setDateModalInitialTab(initialTab);
    setSelectedDate(dateStr);
    setIsModalOpen(true);
    changeView('calendar');
    setTimeout(() => {
      const el = document.querySelector(`[data-date-str="${dateStr}"]`);
      if (el) focusElementWithShake(el);
    }, 350);
  };

  return {
    handleDeleteMeetingPhoto, unlinkMeetingPhotoReferences, handleDeleteChatMessagePhoto,
    handleReplaceChatMessagePhoto, handleSavePhotoComments, findMemoById, handleDeletePhoto,
    handleReplacePhoto, handleJumpToChatMessage, handleGetChatMessageOrdinal,
    handleGetGalleryPhotoOrdinal, handleJumpToMemo, handleJumpToMemoTag, handleJumpToPlace,
    handleJumpToGallery, handleJumpToMeetingDate
  };
}
