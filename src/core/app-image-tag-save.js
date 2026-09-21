// Per-photo tag persistence is deliberately kept out of CalendarApp.  The handler receives its
// live UI/data dependencies so the app shell stays a composition layer rather than a second
// source of photo identity logic.
export function createImageTagSaveHandler(context) {
  const {
    activeCalId,
    chatMessages,
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
    writeActivityLogsToFirestore
  } = context;
  const toIndex = value => {
    if (Number.isInteger(value)) return value;
    const number = Number(value);
    return Number.isFinite(number) ? Math.max(0, Math.round(number)) : null;
  };
  const tokenList = value => Array.from(new Set(String(value || '')
    .split(/[,\s#]+/).map(token => sanitizeText(token.trim(), 30)).filter(Boolean))).slice(0, 10);
  const cleanTagText = value => sanitizeText(tokenList(value).join(' '), 100);
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
          assetKey: meta.assetKey || '', mediaKey: meta.mediaKey || '', refKey: meta.refKey || ''
        });
      }
      if (messageId && requestedIndex != null && !meta.meetingDate) {
        return handleSaveImageTags(messageId, requestedIndex, tagsText, {
          source: 'chat', imageUrl: meta.imageUrl || meta.full || '', thumb: meta.thumb || meta.thumbUrl || '',
          assetKey: meta.assetKey || '', mediaKey: meta.mediaKey || '', refKey: meta.refKey || ''
        });
      }
      return handleSaveMeetingPhotoTags(meta.meetingDate, meta.photoId, tagsText);
    }
    if (meta?.source === 'memo') {
      let memoId = messageId || meta.messageId || '';
      if (!memoId) memoId = String(meta.sourceOwner || (meta.owners || [])[0]?.sourceOwner || '').match(/^memo:([^:]+):/)?.[1] || '';
      if (!memoId || requestedIndex == null) return sourceMissing();
      const memo = await findMemoById(memoId);
      if (!memo) return sourceMissing();
      const urls = Array.isArray(memo.imageUrls) ? memo.imageUrls : (memo.imageUrl ? [memo.imageUrl] : []);
      const targetIndex = resolveMessagePhotoImageIndex(memo, requestedIndex, { ...meta, imageIndex: requestedIndex, imageUrl: meta.imageUrl || meta.full || '' });
      const entry = getMessageImageEntries({ ...memo, id: memoId, uploadSource: 'memo' }).find(item => item.imageIndex === targetIndex);
      if (!entry || targetIndex < 0 || targetIndex >= urls.length) return sourceMissing();
      const tags = cleanTagText(tagsText);
      const imageTags = Array.isArray(memo.imageTags) ? [...memo.imageTags] : [];
      while (imageTags.length < urls.length) imageTags.push('');
      imageTags[targetIndex] = tags;
      const imageTagMap = { ...(memo.imageTagMap && typeof memo.imageTagMap === 'object' && !Array.isArray(memo.imageTagMap) ? memo.imageTagMap : {}) };
      const assetKey = getPhotoAssetCommentKey(entry);
      if (assetKey) imageTagMap[assetKey] = tags;
      const nextMap = reconcileMessageImageTagMap({ ...memo, id: memoId, uploadSource: 'memo', imageTags, imageTagMap }, imageTagMap);
      try {
        const saved = await writeCollectionDocumentWithFallback('memos', activeCalId, memoId, sanitizeMemoForFirestore({ imageTags, imageTagMap: nextMap }), 'update', '메모 이미지 태그 저장', { requirePersisted: true });
        if (!saved?.success || saved?.queued) throw new Error('Memo image tags update failed');
        setMemos(previous => previous.map(item => item.id === memoId ? { ...item, imageTags, imageTagMap: nextMap } : item));
        patchGalleryArchiveMemo(memoId, { imageTags, imageTagMap: nextMap });
        patchIndex(memoId, targetIndex, tags, { ...meta, assetKey: meta.assetKey || assetKey });
        showToast('태그 저장완료', 'success');
        return true;
      } catch (err) {
        console.error('Memo image tag save failed:', err);
        showToast('태그 저장 실패', 'error');
        return false;
      }
    }
    if (!messageId || requestedIndex == null) return sourceMissing();
    let message = (chatMessages || []).find(item => item.id === messageId);
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
    try {
      const saved = await writeCollectionDocumentWithFallback('messages', activeCalId, messageId, data, 'update', '이미지 태그 저장', { requirePersisted: true });
      if (!saved?.success || saved?.queued) throw new Error('Image tags update failed');
      // A write acknowledgement is authoritative. Verification refreshes state only and cannot
      // turn a confirmed tag save into the false "태그 저장 실패" result from the old flow.
      let verified = null;
      try {
        if (firebaseDb) {
          const snapshot = await withTimeout(firebaseDb.collection('calendars').doc(`cal_${activeCalId}`).collection('messages').doc(messageId).get(), 5000, 'image tag verification read');
          verified = snapshot?.exists ? { id: messageId, ...snapshot.data() } : null;
        }
        if (!verified) verified = await fetchMessageRest(activeCalId, messageId);
      } catch (err) { console.warn('Image tag verification read skipped:', err); }
      if (verified) {
        const actual = direct ? getDirectMediaTagsForUrl(verified, meta.directMediaUrl) : getMessageImageEntries(verified).find(item => item.imageIndex === targetIndex)?.tags || '';
        if (String(actual) !== tags) throw new Error('Image tags verification mismatch');
      }
      patchLocalChatMessage(messageId, verified || { ...message, ...data, id: messageId });
      const identity = getMediaIdentityKeys({ messageId, imageIndex: direct ? 0 : targetIndex, directMediaUrl: direct ? meta.directMediaUrl : '', source: 'chat' }, { source: 'chat', messageId });
      const resource = { resourceType: 'photo-tag', resourceId: identity.mediaKey, source: 'chat', sourceMessageId: messageId, imageIndex: direct ? 0 : targetIndex, before: previousTokens.join(' '), after: tags };
      const addedTokens = nextTokens.filter(token => !previousTokens.includes(token));
      const removedTokens = previousTokens.filter(token => !nextTokens.includes(token));
      const activityTimestamp = Date.now();
      const logs = [
        ...addedTokens.map((token, index) => createActivityLog(activeCalId, 'tag_add', '', '', activityTimestamp + index, `#${token}`, resource)),
        ...removedTokens.map((token, index) => createActivityLog(activeCalId, 'tag_remove', '', '', activityTimestamp + addedTokens.length + index, `#${token}`, resource))
      ].filter(Boolean);
      if (logs.length) try { await writeActivityLogsToFirestore(activeCalId, logs); } catch (err) { console.warn('Image tag activity log write skipped:', err); }
    } catch (err) {
      console.error('Image tag save failed:', err);
      showToast('태그 저장 실패', 'error');
      return false;
    }
    const imageUrl = String(meta.imageUrl || meta.directMediaUrl || entry?.full || entry?.thumb || '').trim();
    if (imageUrl) {
      try { await linkTaggedImageToMeetingDates(parseFlexibleDateTokens(tagsText), { imageUrl, thumbUrl: String(meta.thumb || entry?.thumb || imageUrl), imageIndex: targetIndex }, message, tags); }
      catch (err) { console.warn('Image tag date link skipped:', err); showToast('태그는 저장됐지만 일정 사진 연결은 실패했습니다.', 'error', 5000); }
    }
    patchIndex(messageId, targetIndex, tags, { ...meta, assetKey: meta.assetKey || getPhotoAssetCommentKey(entry) }, direct);
    showToast('태그 저장완료', 'success');
    return true;
  };
}
