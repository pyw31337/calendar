import { saveBulkPhotoTagsRemote } from './bulk-photo-tags.js';
import { archivePhotosShareIdentity } from './archive-photo-edits.js';

export const MAX_MEDIA_TAGS = 20;
export const MAX_MEDIA_TAG_TEXT_LENGTH = 640;

// The save queues and optimistic snapshots below must outlive a render. CalendarApp rebuilds the
// handlers on every render, and a fresh Map per render meant a second quick edit (the first one's
// local patch triggers that render) started its own write in parallel with an older payload --
// whichever landed last won, so tags "came back" or vanished. CalendarApp keeps one of these in a
// ref and passes it as `saveState`.
export function createImageTagSaveState() {
  return { docSnapshots: new Map(), persistedDocs: new Map(), lanes: new Map(), bulkChain: Promise.resolve() };
}

// Per-photo tag persistence is deliberately kept out of CalendarApp.  The handler receives its
// live UI/data dependencies so the app shell stays a composition layer rather than a second
// source of photo identity logic.
export function createImageTagSaveHandler(context) {
  const {
    activeCalId,
    chatMessages,
    getChatMessages,
    saveState,
    firebaseDb,
    findMemoById,
    writeCollectionDocumentWithFallback,
    sanitizeMemoForFirestore,
    setMemos,
    patchGalleryArchiveMemo,
    galleryPhotoIndex,
    fetchMessageRest,
    withTimeout,
    showToast,
    handleSaveAnniversaryPhotoTags,
    handleSaveMeetingPhotoTags,
    getMessageImageEntries,
    resolveMessagePhotoImageIndex,
    reconcileMessageImageTagMap,
    getPhotoAssetCommentKey,
    getDirectMediaTagKey,
    getDirectMediaTagsForUrl,
    getMediaIdentityKeys,
    sanitizeText,
    invalidatePhotoIndexCache,
    rememberPhotoIndexTags,
    schedulePhotoIndexTagReload,
    patchLocalChatMessage,
    parseFlexibleDateTokens,
    linkTaggedImageToMeetingDates,
    createActivityLog,
    writeActivityLogsToFirestore,
    syncMeetingCopyTags,
    tagAssetRemote
  } = context;
  // Meeting albums (and a second message/memo holding the same file) still keep their own copy
  // of a photo's tags (docs/data-architecture-v3.md). A save on the owning message/memo is written
  // through to every copy so 일정/인물/추억 never show an older tag set than 채팅/갤러리.
  // The server command (mediaCommand bulkTagAssets) does it in one transaction against the
  // stored documents; the client fallback rewrites albums from local state, which can be stale.
  // Best-effort: the owning document is already saved.
  const writeThroughCopies = async (asset, tags) => {
    if (!(asset?.imageUrl || asset?.thumbUrl)) return;
    if (typeof tagAssetRemote === 'function') {
      try {
        const result = await tagAssetRemote(asset, tags);
        if (result?.ok) return;
      } catch (err) { console.warn('Server tag write-through failed, using local fallback:', err); }
    }
    if (typeof syncMeetingCopyTags !== 'function') return;
    try { await syncMeetingCopyTags(asset, tags); } catch (err) { console.warn('Meeting copy tag sync skipped:', err); }
  };
  const currentChatMessages = () => {
    const live = typeof getChatMessages === 'function' ? getChatMessages() : null;
    return Array.isArray(live) ? live : (chatMessages || []);
  };
  const toIndex = value => {
    if (Number.isInteger(value)) return value;
    const number = Number(value);
    return Number.isFinite(number) ? Math.max(0, Math.round(number)) : null;
  };
  const tokenList = value => Array.from(new Set(String(value || '')
    .split(/[,\s#]+/).map(token => sanitizeText(token.trim(), 30)).filter(Boolean))).slice(0, MAX_MEDIA_TAGS);
  const cleanTagText = value => sanitizeText(tokenList(value).join(' '), MAX_MEDIA_TAG_TEXT_LENGTH);
  const sourceMissing = () => {
    showToast('태그 저장 대상 이미지를 찾지 못했습니다.', 'error', 4000);
    return false;
  };
  const patchIndex = (messageId, imageIndex, tags, meta, direct = false) => {
    try {
      invalidatePhotoIndexCache(activeCalId);
      const assetKey = String(meta?.assetKey || meta?.mediaKey || meta?.refKey || '');
      const probe = {
        messageId,
        imageIndex: direct ? 0 : imageIndex,
        assetKey,
        mediaKey: assetKey,
        refKey: assetKey,
        tags
      };
      rememberPhotoIndexTags(activeCalId, [probe]);
      galleryPhotoIndex?.patchItems?.(items => (items || []).map(photo => {
        const sameAsset = assetKey && [photo.assetKey, photo.mediaKey, photo.refKey].includes(assetKey);
        const sameMessage = photo.messageId === messageId && Number(photo.imageIndex) === Number(direct ? 0 : imageIndex);
        return sameAsset || sameMessage ? { ...photo, tags } : photo;
      }));
      schedulePhotoIndexTagReload(galleryPhotoIndex, activeCalId, probe);
    } catch (err) {
      console.warn('Gallery photoIndex tag sync skipped:', err);
    }
  };

  const { docSnapshots, persistedDocs, lanes } = saveState || createImageTagSaveState();
  // Rapid tag edits on one document collapse into the latest payload. The UI
  // already shows that payload; a second in-flight write of an older payload
  // would clobber it, and a write per keystroke would just add round-trips.
  const scheduleDocWrite = (docKey, job) => {
    let lane = lanes.get(docKey);
    if (!lane) {
      lane = { pendingJob: null, waiters: [], pumping: false };
      lanes.set(docKey, lane);
    }
    let resolve;
    const promise = new Promise(done => { resolve = done; });
    lane.pendingJob = job;
    lane.waiters.push(resolve);
    const pump = async () => {
      while (lane.pendingJob) {
        await Promise.resolve();
        if (!lane.pendingJob) break;
        const jobToRun = lane.pendingJob;
        const waiters = lane.waiters;
        lane.pendingJob = null;
        lane.waiters = [];
        let ok = false;
        try {
          ok = await jobToRun() !== false;
        } catch (err) {
          console.error('Image tag save failed:', err);
          ok = false;
        }
        waiters.forEach(waiter => waiter(ok));
      }
      lane.pumping = false;
      if (lane.pendingJob) {
        lane.pumping = true;
        void pump();
        return;
      }
      // Idle: local state now holds the saved (or rolled back) document, so the next edit reads it
      // from there -- and picks up edits from other devices -- instead of from this snapshot.
      // Deferred a task so the caller's own success/rollback step still sees its snapshot.
      setTimeout(() => {
        if (lanes.get(docKey) !== lane || lane.pumping || lane.pendingJob) return;
        lanes.delete(docKey);
        docSnapshots.delete(docKey);
        persistedDocs.delete(docKey);
      }, 0);
    };
    if (!lane.pumping) {
      lane.pumping = true;
      void pump();
    }
    return promise;
  };
  const publishDoc = (docKey, nextDoc) => {
    docSnapshots.set(docKey, nextDoc);
  };
  const isCurrentDoc = (docKey, nextDoc) => docSnapshots.get(docKey) === nextDoc;
  const notePersistedBaseline = (docKey, doc) => {
    if (!persistedDocs.has(docKey)) persistedDocs.set(docKey, doc);
  };
  const markPersisted = (docKey, doc) => { persistedDocs.set(docKey, doc); };
  const persistedOr = (docKey, fallback) => persistedDocs.get(docKey) || fallback;

  return async function handleSaveImageTags(messageId, imageIndex, tagsText, meta = {}) {
    const requestedIndex = toIndex(imageIndex);
    const metaIndex = toIndex(meta?.imageIndex);
    const sourceIndex = toIndex(meta?.sourceImageIndex);
    if (meta?.source === 'anniversary') {
      return handleSaveAnniversaryPhotoTags(meta.anniversaryId, metaIndex ?? requestedIndex, tagsText);
    }
    if (meta?.source === 'meeting') {
      if (meta.sourceMessageId && sourceIndex != null) {
        return handleSaveImageTags(meta.sourceMessageId, sourceIndex, tagsText, {
          source: 'chat', imageUrl: meta.imageUrl || meta.full || '', thumb: meta.thumb || meta.thumbUrl || '',
          assetKey: meta.assetKey || '', mediaKey: meta.mediaKey || '', refKey: meta.refKey || '',
          readFresh: meta.readFresh, silent: meta.silent
        });
      }
      if (messageId && requestedIndex != null && !meta.meetingDate) {
        return handleSaveImageTags(messageId, requestedIndex, tagsText, {
          source: 'chat', imageUrl: meta.imageUrl || meta.full || '', thumb: meta.thumb || meta.thumbUrl || '',
          assetKey: meta.assetKey || '', mediaKey: meta.mediaKey || '', refKey: meta.refKey || '',
          readFresh: meta.readFresh, silent: meta.silent
        });
      }
      return handleSaveMeetingPhotoTags(meta.meetingDate, meta.photoId, tagsText);
    }
    if (meta?.source === 'memo') {
      let memoId = messageId || meta.messageId || '';
      if (!memoId) memoId = String(meta.sourceOwner || (meta.owners || [])[0]?.sourceOwner || '').match(/^memo:([^:]+):/)?.[1] || '';
      if (!memoId || requestedIndex == null) return sourceMissing();
      const docKey = `memos:${memoId}`;
      let memo = docSnapshots.get(docKey) || null;
      if (!memo) memo = await findMemoById(memoId);
      if (!memo) return sourceMissing();
      const urls = Array.isArray(memo.imageUrls) ? memo.imageUrls : (memo.imageUrl ? [memo.imageUrl] : []);
      const targetIndex = resolveMessagePhotoImageIndex(memo, requestedIndex, { ...meta, imageIndex: requestedIndex, imageUrl: meta.imageUrl || meta.full || '' });
      const entry = getMessageImageEntries({ ...memo, id: memoId, uploadSource: 'memo' }).find(item => item.imageIndex === targetIndex);
      if (!entry || targetIndex < 0 || targetIndex >= urls.length) return sourceMissing();
      const tags = cleanTagText(tagsText);
      const previousDoc = { ...memo, id: memoId };
      const imageTags = Array.isArray(memo.imageTags) ? [...memo.imageTags] : [];
      while (imageTags.length < urls.length) imageTags.push('');
      imageTags[targetIndex] = tags;
      const imageTagMap = { ...(memo.imageTagMap && typeof memo.imageTagMap === 'object' && !Array.isArray(memo.imageTagMap) ? memo.imageTagMap : {}) };
      const assetKey = getPhotoAssetCommentKey(entry);
      if (assetKey) imageTagMap[assetKey] = tags;
      const nextMap = reconcileMessageImageTagMap({ ...memo, id: memoId, uploadSource: 'memo', imageTags, imageTagMap }, imageTagMap);
      const patch = { imageTags, imageTagMap: nextMap };
      const nextDoc = { ...previousDoc, ...patch };
      const applyMemo = (doc) => {
        const nextPatch = { imageTags: doc.imageTags, imageTagMap: doc.imageTagMap };
        setMemos(previous => previous.map(item => item.id === memoId ? { ...item, ...nextPatch } : item));
        patchGalleryArchiveMemo(memoId, nextPatch);
        const appliedTags = Array.isArray(doc.imageTags) ? (doc.imageTags[targetIndex] || '') : '';
        patchIndex(memoId, targetIndex, appliedTags, { ...meta, assetKey: meta.assetKey || assetKey });
      };
      notePersistedBaseline(docKey, previousDoc);
      publishDoc(docKey, nextDoc);
      applyMemo(nextDoc);
      const ok = await scheduleDocWrite(docKey, async () => {
        const saved = await writeCollectionDocumentWithFallback('memos', activeCalId, memoId, sanitizeMemoForFirestore(patch), 'update', '메모 이미지 태그 저장', { requirePersisted: true });
        if (!saved?.success || saved?.queued) throw new Error('Memo image tags update failed');
        markPersisted(docKey, nextDoc);
        if (isCurrentDoc(docKey, nextDoc) && !meta?.silent) showToast('태그 저장완료', 'success');
        // Awaited inside the lane so the next edit of this memo cannot interleave with it.
        await writeThroughCopies({ imageUrl: entry.full || '', thumbUrl: entry.thumb || '', memoId, source: 'memo' }, tags);
        return true;
      });
      if (!ok) {
        if (isCurrentDoc(docKey, nextDoc)) {
          const restored = persistedOr(docKey, previousDoc);
          publishDoc(docKey, restored);
          applyMemo(restored);
          showToast('태그 저장 실패', 'error');
        }
        return false;
      }
      return true;
    }
    if (!messageId || requestedIndex == null) return sourceMissing();
    // Prefer the optimistic snapshot from a save that has not landed yet. Re-reading the
    // stored message (or the chat window from before that save) rebuilds imageTags without
    // the tags the user just added and the next write wipes them.
    const docKey = `messages:${messageId}`;
    let message = docSnapshots.get(docKey) || null;
    if (!message && !meta?.readFresh) message = currentChatMessages().find(item => item.id === messageId) || null;
    if (!message) {
      try {
        if (firebaseDb) {
          const snapshot = await withTimeout(firebaseDb.collection('calendars').doc(`cal_${activeCalId}`).collection('messages').doc(messageId).get(), 9000, 'image tag source message read');
          message = snapshot?.exists ? { id: messageId, ...snapshot.data() } : null;
        } else message = await fetchMessageRest(activeCalId, messageId);
      } catch (err) { console.warn('Image tag source message read failed:', err); }
    }
    if (!message) return sourceMissing();
    const direct = Boolean(meta?.directMediaUrl);
    const entries = getMessageImageEntries(message);
    const targetIndex = direct ? requestedIndex : resolveMessagePhotoImageIndex(message, requestedIndex, { ...meta, imageIndex: requestedIndex, imageUrl: meta.imageUrl || meta.full || '' });
    const entry = direct ? null : entries.find(item => item.imageIndex === targetIndex);
    if (!direct && !entry) return sourceMissing();
    const previousTokens = tokenList(direct ? getDirectMediaTagsForUrl(message, meta.directMediaUrl) : entry.tags);
    const nextTokens = tokenList(tagsText);
    const tags = cleanTagText(tagsText);
    const previousDoc = { ...message, id: messageId };
    const data = direct ? (() => {
      const next = message.directMediaTags && typeof message.directMediaTags === 'object' && !Array.isArray(message.directMediaTags) ? { ...message.directMediaTags } : {};
      const key = getDirectMediaTagKey(meta.directMediaUrl);
      if (tags) next[key] = tags; else delete next[key];
      return { directMediaTags: next };
    })() : (() => {
      const imageTags = Array.isArray(message.imageTags) ? [...message.imageTags] : [];
      const slots = Math.max(Array.isArray(message.imageUrls) ? message.imageUrls.length : 0, Array.isArray(message.thumbUrls) ? message.thumbUrls.length : 0, ...entries.map(item => item.imageIndex + 1), 0);
      while (imageTags.length < slots) imageTags.push('');
      imageTags[targetIndex] = tags;
      const imageTagMap = { ...(message.imageTagMap && typeof message.imageTagMap === 'object' && !Array.isArray(message.imageTagMap) ? message.imageTagMap : {}) };
      const assetKey = getPhotoAssetCommentKey(entry);
      if (assetKey) imageTagMap[assetKey] = tags;
      return { imageTags, imageTagMap: reconcileMessageImageTagMap({ ...message, imageTags, imageTagMap }, imageTagMap) };
    })();
    const nextDoc = { ...previousDoc, ...data };
    const applyMessage = (doc) => {
      patchLocalChatMessage(messageId, { ...doc, id: messageId });
      const appliedTags = direct
        ? (doc.directMediaTags && doc.directMediaTags[getDirectMediaTagKey(meta.directMediaUrl)]) || ''
        : (Array.isArray(doc.imageTags) ? (doc.imageTags[targetIndex] || '') : '');
      patchIndex(messageId, targetIndex, appliedTags, { ...meta, assetKey: meta.assetKey || getPhotoAssetCommentKey(entry) }, direct);
    };
    notePersistedBaseline(docKey, previousDoc);
    publishDoc(docKey, nextDoc);
    applyMessage(nextDoc);
    const ok = await scheduleDocWrite(docKey, async () => {
      const saved = await writeCollectionDocumentWithFallback('messages', activeCalId, messageId, data, 'update', '이미지 태그 저장', { requirePersisted: true });
      if (!saved?.success || saved?.queued) throw new Error('Image tags update failed');
      const identity = getMediaIdentityKeys({ messageId, imageIndex: direct ? 0 : targetIndex, directMediaUrl: direct ? meta.directMediaUrl : '', source: 'chat' }, { source: 'chat', messageId });
      const resource = { resourceType: 'photo-tag', resourceId: identity.mediaKey, source: 'chat', sourceMessageId: messageId, imageIndex: direct ? 0 : targetIndex, before: previousTokens.join(' '), after: tags };
      const addedTokens = nextTokens.filter(token => !previousTokens.includes(token));
      const removedTokens = previousTokens.filter(token => !nextTokens.includes(token));
      const activityTimestamp = Date.now();
      const logs = [
        ...addedTokens.map((token, index) => createActivityLog(activeCalId, 'tag_add', '', '', activityTimestamp + index, `#${token}`, resource)),
        ...removedTokens.map((token, index) => createActivityLog(activeCalId, 'tag_remove', '', '', activityTimestamp + addedTokens.length + index, `#${token}`, resource))
      ].filter(Boolean);
      if (logs.length) {
        writeActivityLogsToFirestore(activeCalId, logs).catch(err => console.warn('Image tag activity log write skipped:', err));
      }
      markPersisted(docKey, nextDoc);
      if (isCurrentDoc(docKey, nextDoc) && !meta?.silent) showToast('태그 저장완료', 'success');
      // Copies first, then the date-album links, one after the other: both rewrite meeting
      // albums, and running them side by side let the second write put back the first one's
      // old tags (the audit found album copies stuck on the previous date tag).
      if (!direct) {
        await writeThroughCopies({ imageUrl: entry.full || '', thumbUrl: entry.thumb || '', messageId }, tags);
      }
      const imageUrl = String(meta.imageUrl || meta.directMediaUrl || entry?.full || entry?.thumb || '').trim();
      if (imageUrl) {
        try {
          await linkTaggedImageToMeetingDates(parseFlexibleDateTokens(tagsText), { imageUrl, thumbUrl: String(meta.thumb || entry?.thumb || imageUrl), imageIndex: targetIndex }, nextDoc, tags);
        } catch (err) {
          console.warn('Image tag date link skipped:', err);
        }
      }
      return true;
    });
    if (!ok) {
      if (isCurrentDoc(docKey, nextDoc)) {
        const restored = persistedOr(docKey, previousDoc);
        publishDoc(docKey, restored);
        applyMessage(restored);
        showToast('태그 저장 실패', 'error');
      }
      return false;
    }
    return true;
  };
}


// A gallery/archive selection can contain many photos from the same source message. Sending each
// through handleSaveImageTags made every one perform its own source read, write, verification,
// meeting-copy fan-out and index reload. The mediaCommand endpoint groups those writes in one
// transaction per <=80-photo chunk. `changes` always contains final tags so callers can pass the
// captured previous values back for a real undo without guessing an inverse operation.
export function createBulkImageTagSaveHandler(context) {
  const {
    activeCalId,
    isCurrentCalendar = () => true,
    projectId,
    galleryPhotoIndex,
    invalidatePhotoIndexCache,
    rememberPhotoIndexTags,
    saveState,
  } = context;
  const state = saveState || createImageTagSaveState();
  const probesFor = (list, tagsOf) => list.map(change => ({
    assetKey: change.assetKey,
    mediaKey: change.photo?.mediaKey || change.assetKey,
    refKey: change.photo?.refKey || change.assetKey,
    full: change.photo?.full || change.photo?.imageUrl || '',
    thumb: change.photo?.thumb || change.photo?.thumbUrl || '',
    messageId: change.photo?.messageId || change.photo?.sourceMessageId || '',
    sourceMessageId: change.photo?.sourceMessageId || '',
    imageIndex: Number.isFinite(Number(change.photo?.imageIndex)) ? Number(change.photo.imageIndex) : 0,
    sourceImageIndex: change.photo?.sourceImageIndex,
    meetingDate: change.photo?.meetingDate || '',
    photoId: change.photo?.photoId || '',
    legacyKeys: change.photo?.legacyKeys,
    tags: tagsOf(change),
  }));
  const patchList = (list, tagsOf, { onlyIfTags = null } = {}) => {
    try {
      invalidatePhotoIndexCache(activeCalId);
      const probes = [];
      const applyPhoto = (photo) => {
        const hit = list.find(change => archivePhotosShareIdentity(change.photo, photo)
          || String(change.assetKey || '') === String(photo?.assetKey || photo?.mediaKey || photo?.refKey || ''));
        if (!hit) return photo;
        const nextTags = tagsOf(hit);
        if (nextTags == null) return photo;
        if (onlyIfTags != null && String(photo?.tags || '') !== String(onlyIfTags(hit) || '')) return photo;
        probes.push({ ...hit, tags: String(nextTags) });
        return { ...photo, tags: String(nextTags), tagAuthoritative: true };
      };
      if (isCurrentCalendar() && typeof galleryPhotoIndex?.patchItems === 'function') {
        galleryPhotoIndex.patchItems(items => (items || []).map(applyPhoto));
      } else {
        list.forEach(change => {
          const nextTags = tagsOf(change);
          if (nextTags != null) probes.push({ ...change, tags: String(nextTags) });
        });
      }
      const remembered = probesFor(probes, probe => probe.tags).filter(probe => probe.tags != null);
      if (remembered.length) rememberPhotoIndexTags(activeCalId, remembered);
    } catch (err) {
      console.warn('Bulk gallery tag index sync skipped:', err);
    }
  };
  return function saveBulkImageTags(changes) {
    const list = Array.isArray(changes) ? changes.filter(change => change?.photo && change?.assetKey) : [];
    if (!activeCalId || !projectId || !list.length) return Promise.resolve({ ok: false, changed: 0, reason: 'invalid' });
    // Local gallery/archive chips move before the mediaCommand round-trip.
    patchList(list, change => String(change.tags || ''));
    const run = async () => {
      try {
        const result = await saveBulkPhotoTagsRemote({ calendarId: activeCalId, projectId, changes: list });
        if (!result?.ok) throw new Error(result?.reason || '사진 태그 일괄 저장 실패');
        return { ...result, changes: list };
      } catch (err) {
        console.error('Bulk image tag save failed:', err);
        patchList(list, change => String(change.beforeTags || ''), { onlyIfTags: change => String(change.tags || '') });
        return { ok: false, changed: 0, reason: String(err?.message || err), changes: list };
      }
    };
    const queued = state.bulkChain.then(run, run);
    state.bulkChain = queued.then(() => {}, () => {});
    return queued;
  };
}
