// Pure gallery composition and pagination. Keeping this outside React makes the expensive
// message/memo/meeting merge independently testable and prevents UI state changes from subtly
// changing photo identity or deduplication rules.
export function composeGalleryPhotos({
  chatMessages = [], memos = [], calendar = null,
  isTombstone, getMessageImageEntries, getAllDirectMediaImageEntries,
  getConfirmedMeetings, resolveMeetingPhotoDisplay, isBrokenPhotoValue,
  getPhotoAssetCommentKey
}) {
  const list = [];
  chatMessages.forEach(msg => {
    if (!msg || isTombstone(msg)) return;
    [...getMessageImageEntries(msg), ...getAllDirectMediaImageEntries(msg)].forEach(entry => {
      if (!entry || isBrokenPhotoValue(entry.full) || isBrokenPhotoValue(entry.thumb)) return;
      list.push({ ...entry, text: msg.text || '', participantId: msg.participantId || '', source: entry.source || 'chat' });
    });
  });
  memos.forEach(memo => {
    if (!memo || isTombstone(memo)) return;
    const memoTags = Array.isArray(memo.tags)
      ? memo.tags.map(tag => String(tag || '').replace(/^#/, '')).filter(Boolean).join(' ')
      : '';
    const asMessage = {
      id: memo.id,
      text: memo.text || memo.content || memo.body || '',
      imageUrl: memo.imageUrl,
      imageUrls: memo.imageUrls,
      thumbUrl: memo.thumbUrl,
      thumbUrls: memo.thumbUrls,
      timestamp: memo.updatedAt || memo.createdAt || 0,
      participantId: memo.participantId || '',
      uploadSource: 'memo'
    };
    [...getMessageImageEntries(asMessage), ...getAllDirectMediaImageEntries(asMessage)].forEach(entry => {
      if (!entry || isBrokenPhotoValue(entry.full) || isBrokenPhotoValue(entry.thumb)) return;
      list.push({ ...entry, tags: memoTags, text: asMessage.text, participantId: asMessage.participantId, source: 'memo' });
    });
  });
  getConfirmedMeetings(calendar).forEach(meeting => {
    (Array.isArray(meeting?.photos) ? meeting.photos : []).forEach((photo, index) => {
      if (photo?.sourceMessageId) {
        const source = chatMessages.find(message => message?.id === photo.sourceMessageId);
        if (source && isTombstone(source)) return;
      }
      const resolved = resolveMeetingPhotoDisplay ? resolveMeetingPhotoDisplay(photo, chatMessages) : null;
      const full = String(resolved?.imageUrl || photo?.imageUrl || photo?.full || '');
      const thumb = String(resolved?.thumbUrl || photo?.thumbUrl || photo?.thumb || full);
      if ((!full && !thumb) || isBrokenPhotoValue(full) || isBrokenPhotoValue(thumb)) return;
      const mediaKey = resolved?.mediaKey || photo?.mediaKey
        || (photo?.sourceMessageId && Number.isInteger(photo?.sourceImageIndex)
          ? `chat:${photo.sourceMessageId}:${photo.sourceImageIndex}`
          : `meeting:${meeting.date || 'date'}:${photo?.id || index}`);
      const refKey = resolved?.refKey || photo?.refKey || `meeting:${meeting.date || 'date'}:${photo?.id || index}`;
      list.push({
        full: full || thumb,
        thumb: thumb || full,
        imageIndex: index,
        messageId: null,
        photoId: photo?.id || '',
        sourceMessageId: photo?.sourceMessageId || '',
        sourceImageIndex: Number.isInteger(photo?.sourceImageIndex) ? photo.sourceImageIndex : null,
        timestamp: Number(photo?.createdAt || photo?.updatedAt || meeting?.confirmedAt || 0),
        tags: String(resolved?.tags ?? photo?.tags ?? ''),
        directMediaUrl: '',
        text: `${meeting.date || ''} 일정 사진`,
        participantId: '',
        source: 'meeting',
        meetingDate: meeting.date || '',
        mediaKey,
        refKey
      });
    });
  });

  const byAsset = new Map();
  const sourceRank = entry => entry?.messageId ? 0 : (entry?.source === 'memo' ? 1 : 2);
  list.forEach(entry => {
    const key = getPhotoAssetCommentKey(entry) || entry.full || entry.thumb || entry.mediaKey || entry.refKey;
    if (!key) return;
    const existing = byAsset.get(key);
    if (!existing || sourceRank(entry) < sourceRank(existing)) {
      byAsset.set(key, existing
        ? { ...entry, meetingDate: entry.meetingDate || existing.meetingDate || '' }
        : { ...entry });
    } else if (!existing.meetingDate && entry.meetingDate) {
      existing.meetingDate = entry.meetingDate;
    }
  });
  return Array.from(byAsset.values()).sort((a, b) => Number(b.timestamp || 0) - Number(a.timestamp || 0));
}

export function paginateGalleryItems(items, page, pageSize = 100) {
  const list = Array.isArray(items) ? items : [];
  const size = Math.max(1, Number(pageSize) || 100);
  const pageCount = Math.max(1, Math.ceil(list.length / size));
  const currentPage = Math.min(pageCount, Math.max(1, Number(page) || 1));
  const start = (currentPage - 1) * size;
  return { items: list.slice(start, start + size), currentPage, pageCount, total: list.length };
}

export function getPaginationWindow(currentPage, pageCount, windowSize) {
  const size = Math.max(1, Number(windowSize) || 5);
  const safeCount = Math.max(1, Number(pageCount) || 1);
  const current = Math.min(safeCount, Math.max(1, Number(currentPage) || 1));
  let start = Math.floor((current - 1) / size) * size + 1;
  if (start + size - 1 > safeCount) start = Math.max(1, safeCount - size + 1);
  return Array.from({ length: Math.min(size, safeCount) }, (_, index) => start + index);
}

