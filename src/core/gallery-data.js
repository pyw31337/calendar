// Pure gallery composition and pagination. Keeping this outside React makes the expensive
// message/memo/meeting merge independently testable and prevents UI state changes from subtly
// changing photo identity or deduplication rules.

export function coerceGalleryImageIndex(value) {
  if (Number.isInteger(value)) return value;
  const n = Number(value);
  return Number.isFinite(n) ? Math.max(0, Math.round(n)) : null;
}

// Durable gallery identity keys. Prefer message slot (messageId/sourceMessageId + index) so a
// thumb-only meeting copy still collapses with its chat full-size sibling, then asset URL hash
// (including thumb when it differs from full), then legacy mediaKey/refKey/URL fallbacks.
export function getGalleryPhotoDedupeKeys(entry, getPhotoAssetCommentKey) {
  const keys = [];
  const push = (key) => {
    const value = typeof key === 'string' ? key.trim() : '';
    if (value && !keys.includes(value)) keys.push(value);
  };
  const sourceIdx = coerceGalleryImageIndex(entry?.sourceImageIndex);
  if (entry?.sourceMessageId && sourceIdx != null) {
    push(`slot:${entry.sourceMessageId}:${sourceIdx}`);
  }
  const idx = coerceGalleryImageIndex(entry?.imageIndex);
  // Direct-media rows reuse imageIndex 0; keep them on asset/URL keys so they do not collide
  // with a real attached image at slot 0 on the same message.
  if (entry?.messageId && idx != null && !entry?.directMediaUrl) {
    push(`slot:${entry.messageId}:${idx}`);
  }
  if (typeof getPhotoAssetCommentKey === 'function') {
    push(getPhotoAssetCommentKey(entry));
    if (entry?.thumb && entry.thumb !== entry.full) {
      push(getPhotoAssetCommentKey({ full: entry.thumb, imageUrl: entry.thumb, thumb: entry.thumb }));
    }
  }
  push(entry?.mediaKey);
  push(entry?.refKey);
  push(entry?.full);
  push(entry?.thumb);
  return keys;
}

export function dedupeGalleryPhotoEntries(list, getPhotoAssetCommentKey, sourceRankFn) {
  const sourceRank = typeof sourceRankFn === 'function'
    ? sourceRankFn
    : (entry) => {
      const rank = { chat: 0, gallery: 0, memo: 1, meeting: 2, anniversary: 3 };
      return rank[entry?.source] ?? 9;
    };
  const byCanonical = new Map();
  const alias = new Map();

  const mergeIdentity = (preferred, other) => {
    const merged = { ...preferred };
    if (!merged.meetingDate && other.meetingDate) merged.meetingDate = other.meetingDate;
    if (!merged.tags && other.tags) merged.tags = other.tags;
    if (!merged.messageId && other.messageId) merged.messageId = other.messageId;
    if (coerceGalleryImageIndex(merged.imageIndex) == null && coerceGalleryImageIndex(other.imageIndex) != null) {
      merged.imageIndex = coerceGalleryImageIndex(other.imageIndex);
    }
    if (!merged.sourceMessageId && other.sourceMessageId) merged.sourceMessageId = other.sourceMessageId;
    if (coerceGalleryImageIndex(merged.sourceImageIndex) == null && coerceGalleryImageIndex(other.sourceImageIndex) != null) {
      merged.sourceImageIndex = coerceGalleryImageIndex(other.sourceImageIndex);
    }
    if (!merged.photoId && other.photoId) merged.photoId = other.photoId;
    if (!merged.mediaKey && other.mediaKey) merged.mediaKey = other.mediaKey;
    if (!merged.refKey && other.refKey) merged.refKey = other.refKey;
    if (!merged.assetKey && other.assetKey) merged.assetKey = other.assetKey;
    // Prefer a real full-size URL when the survivor was a thumb-only copy.
    if (other.full && (!merged.full || (merged.thumb && merged.full === merged.thumb && other.full !== other.thumb))) {
      merged.full = other.full;
    }
    if (other.thumb && !merged.thumb) merged.thumb = other.thumb;
    return merged;
  };

  (Array.isArray(list) ? list : []).forEach((entry) => {
    if (!entry) return;
    const keys = getGalleryPhotoDedupeKeys(entry, getPhotoAssetCommentKey);
    if (!keys.length) return;
    let canonical = null;
    for (const key of keys) {
      if (alias.has(key)) {
        canonical = alias.get(key);
        break;
      }
    }
    if (canonical == null) {
      canonical = keys[0];
      byCanonical.set(canonical, { ...entry });
      keys.forEach((key) => alias.set(key, canonical));
      return;
    }
    const existing = byCanonical.get(canonical) || { ...entry };
    const preferNew = sourceRank(entry) < sourceRank(existing);
    const merged = preferNew ? mergeIdentity(entry, existing) : mergeIdentity(existing, entry);
    byCanonical.set(canonical, merged);
    keys.forEach((key) => alias.set(key, canonical));
  });

  return Array.from(byCanonical.values());
}

function collectMessagePhotoEntries(msg, {
  getMessageImageEntries,
  getAllDirectMediaImageEntries,
  getPhotoAssetCommentKey,
  isBrokenPhotoValue
}) {
  if (!msg) return [];
  const imageEntries = typeof getMessageImageEntries === 'function' ? (getMessageImageEntries(msg) || []) : [];
  const directEntries = typeof getAllDirectMediaImageEntries === 'function'
    ? (getAllDirectMediaImageEntries(msg) || [])
    : [];
  const covered = new Set();
  imageEntries.forEach((entry) => {
    getGalleryPhotoDedupeKeys(entry, getPhotoAssetCommentKey).forEach((key) => covered.add(key));
    if (entry?.full) covered.add(entry.full);
    if (entry?.thumb) covered.add(entry.thumb);
  });
  const filteredDirect = directEntries.filter((entry) => {
    if (!entry) return false;
    const keys = getGalleryPhotoDedupeKeys(entry, getPhotoAssetCommentKey);
    if (keys.some((key) => covered.has(key))) return false;
    if (entry.full && covered.has(entry.full)) return false;
    if (entry.thumb && covered.has(entry.thumb)) return false;
    return true;
  });
  return [...imageEntries, ...filteredDirect].filter((entry) => (
    entry
    && !(typeof isBrokenPhotoValue === 'function' && (isBrokenPhotoValue(entry.full) || isBrokenPhotoValue(entry.thumb)))
  ));
}

export function composeGalleryPhotos({
  chatMessages = [], memos = [], calendar = null, anniversaries = [],
  isTombstone, getMessageImageEntries, getAllDirectMediaImageEntries,
  getConfirmedMeetings, resolveMeetingPhotoDisplay, isBrokenPhotoValue,
  getPhotoAssetCommentKey
}) {
  const list = [];
  const broken = typeof isBrokenPhotoValue === 'function' ? isBrokenPhotoValue : () => false;
  chatMessages.forEach(msg => {
    if (!msg || (typeof isTombstone === 'function' && isTombstone(msg))) return;
    collectMessagePhotoEntries(msg, {
      getMessageImageEntries,
      getAllDirectMediaImageEntries,
      getPhotoAssetCommentKey,
      isBrokenPhotoValue: broken
    }).forEach(entry => {
      list.push({ ...entry, text: msg.text || '', participantId: msg.participantId || '', source: entry.source || 'chat' });
    });
  });
  memos.forEach(memo => {
    if (!memo || (typeof isTombstone === 'function' && isTombstone(memo))) return;
    const memoImageTags = Array.isArray(memo.imageTags) ? memo.imageTags : [];
    const asMessage = {
      id: memo.id,
      text: memo.text || memo.content || memo.body || '',
      imageUrl: memo.imageUrl,
      imageUrls: memo.imageUrls,
      thumbUrl: memo.thumbUrl,
      thumbUrls: memo.thumbUrls,
      imageTags: memoImageTags,
      timestamp: memo.updatedAt || memo.createdAt || 0,
      participantId: memo.participantId || '',
      uploadSource: 'memo'
    };
    collectMessagePhotoEntries(asMessage, {
      getMessageImageEntries,
      getAllDirectMediaImageEntries,
      getPhotoAssetCommentKey,
      isBrokenPhotoValue: broken
    }).forEach(entry => {
      list.push({
        ...entry,
        tags: String(entry.tags || memoImageTags[entry.imageIndex] || ''),
        text: asMessage.text,
        participantId: asMessage.participantId,
        source: 'memo'
      });
    });
  });
  const meetings = typeof getConfirmedMeetings === 'function' ? getConfirmedMeetings(calendar) : [];
  meetings.forEach(meeting => {
    (Array.isArray(meeting?.photos) ? meeting.photos : []).forEach((photo, index) => {
      if (photo?.sourceMessageId) {
        const source = chatMessages.find(message => message?.id === photo.sourceMessageId);
        if (source && typeof isTombstone === 'function' && isTombstone(source)) return;
      }
      const resolved = resolveMeetingPhotoDisplay ? resolveMeetingPhotoDisplay(photo, chatMessages) : null;
      const full = String(resolved?.imageUrl || photo?.imageUrl || photo?.full || '');
      const thumb = String(resolved?.thumbUrl || photo?.thumbUrl || photo?.thumb || full);
      if ((!full && !thumb) || broken(full) || broken(thumb)) return;
      const sourceImageIndex = coerceGalleryImageIndex(
        photo?.sourceImageIndex ?? resolved?.sourceImageIndex
      );
      const mediaKey = resolved?.mediaKey || photo?.mediaKey
        || (photo?.sourceMessageId && sourceImageIndex != null
          ? `chat:${photo.sourceMessageId}:${sourceImageIndex}`
          : `meeting:${meeting.date || 'date'}:${photo?.id || index}`);
      const refKey = resolved?.refKey || photo?.refKey || `meeting:${meeting.date || 'date'}:${photo?.id || index}`;
      list.push({
        full: full || thumb,
        thumb: thumb || full,
        imageIndex: index,
        messageId: null,
        photoId: photo?.id || '',
        sourceMessageId: photo?.sourceMessageId || '',
        sourceImageIndex,
        timestamp: Number(photo?.createdAt || photo?.updatedAt || meeting?.confirmedAt || 0),
        tags: String(resolved?.tags ?? photo?.tags ?? ''),
        directMediaUrl: '',
        text: `${meeting.date || ''} 일정 사진`,
        participantId: '',
        source: 'meeting',
        meetingDate: meeting.date || '',
        mediaKey,
        refKey,
        assetKey: resolved?.assetKey || photo?.assetKey || mediaKey
      });
    });
  });

  (Array.isArray(anniversaries) ? anniversaries : []).forEach(anniversary => {
    const photos = Array.isArray(anniversary?.photos) ? anniversary.photos : [];
    const anniversaryDate = String(anniversary?.date || anniversary?.startDate || anniversary?.endDate || '').slice(0, 10);
    photos.forEach((photo, index) => {
      const full = String(photo?.imageUrl || photo?.url || photo?.full || photo?.src || '');
      const thumb = String(photo?.thumbUrl || photo?.thumbnailUrl || photo?.thumb || full);
      if ((!full && !thumb) || broken(full) || broken(thumb)) return;
      const mediaKey = photo?.mediaKey || `anniversary:${anniversary?.id || anniversaryDate || 'date'}:${photo?.id || index}`;
      const refKey = photo?.refKey || mediaKey;
      list.push({
        full: full || thumb,
        thumb: thumb || full,
        imageIndex: index,
        messageId: null,
        photoId: photo?.id || '',
        sourceMessageId: '',
        sourceImageIndex: null,
        timestamp: Number(photo?.createdAt || photo?.updatedAt || anniversary?.updatedAt || 0),
        tags: String(photo?.tags || ''),
        directMediaUrl: '',
        text: '',
        participantId: '',
        source: 'anniversary',
        anniversaryId: anniversary?.id || '',
        meetingDate: anniversaryDate,
        mediaKey,
        refKey
      });
    });
  });

  return dedupeGalleryPhotoEntries(list, getPhotoAssetCommentKey)
    .sort((a, b) => Number(b.timestamp || 0) - Number(a.timestamp || 0));
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
  // Keep the active page centered in the visible window when possible. Near the ends the
  // window clamps so page 1 / last stay reachable without inventing out-of-range numbers.
  if (safeCount <= size) {
    return Array.from({ length: safeCount }, (_, index) => index + 1);
  }
  const half = Math.floor(size / 2);
  let start = current - half;
  if (start < 1) start = 1;
  else if (start + size - 1 > safeCount) start = safeCount - size + 1;
  return Array.from({ length: size }, (_, index) => start + index);
}
