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

function pushNormalizedMemoryIdentityKey(keys, key) {
  const value = typeof key === 'string' ? key.trim() : '';
  if (!value || keys.includes(value)) return;
  keys.push(value);
  if (!/^https?:\/\//i.test(value) && value.indexOf('/o/') < 0) return;
  const stripped = value.split('?')[0];
  if (stripped && !keys.includes(stripped)) keys.push(stripped);
  try {
    const decoded = decodeURIComponent(stripped || value);
    const marker = '/o/';
    const idx = decoded.indexOf(marker);
    if (idx >= 0) {
      const path = decoded.slice(idx + marker.length).split('?')[0];
      if (path && !keys.includes(path)) keys.push(path);
    }
  } catch (_err) { /* ignore malformed URI */ }
}

function expandStoredMemoryIdentityKey(key) {
  const keys = [];
  pushNormalizedMemoryIdentityKey(keys, key);
  return keys;
}

export function collectMemoryPhotoIdentityKeys(entry, getPhotoAssetCommentKey) {
  const keys = [];
  const push = (key) => pushNormalizedMemoryIdentityKey(keys, key);
  getGalleryPhotoDedupeKeys(entry, getPhotoAssetCommentKey).forEach(push);
  push(entry?.assetKey);
  push(entry?.photoId);
  push(entry?.id);
  push(entry?.imageUrl);
  push(entry?.storagePath);
  const sourceIdx = coerceGalleryImageIndex(entry?.sourceImageIndex);
  const idx = coerceGalleryImageIndex(entry?.imageIndex);
  if (entry?.sourceMessageId && sourceIdx != null) {
    push(`chat:${entry.sourceMessageId}:${sourceIdx}`);
    push(`gallery:${entry.sourceMessageId}:${sourceIdx}`);
    push(`meeting-index:${entry.sourceMessageId}:${sourceIdx}`);
  }
  if (entry?.messageId && idx != null) {
    push(`chat:${entry.messageId}:${idx}`);
    push(`gallery:${entry.messageId}:${idx}`);
  }
  if (entry?.photoId) push(`meeting-index:${entry.photoId}`);
  (Array.isArray(entry?.legacyKeys) ? entry.legacyKeys : []).forEach(push);
  return keys;
}

export function isMemoryPhotoExcluded(entry, excludedKeys, getPhotoAssetCommentKey) {
  const excluded = excludedKeys instanceof Set ? excludedKeys : new Set(Array.isArray(excludedKeys) ? excludedKeys : []);
  if (!excluded.size) return false;
  const excludedAll = new Set();
  excluded.forEach((key) => expandStoredMemoryIdentityKey(key).forEach((item) => excludedAll.add(item)));
  return collectMemoryPhotoIdentityKeys(entry, getPhotoAssetCommentKey).some(key => excludedAll.has(key));
}

export function expandMemoryPhotoExclusionKeys(photos, selectedKeys, getPhotoAssetCommentKey) {
  const selected = selectedKeys instanceof Set ? selectedKeys : new Set(Array.isArray(selectedKeys) ? selectedKeys : []);
  const out = [];
  const push = (key) => pushNormalizedMemoryIdentityKey(out, key);
  let matchedCount = 0;
  (Array.isArray(photos) ? photos : []).forEach((photo, idx) => {
    const ids = collectMemoryPhotoIdentityKeys(photo, getPhotoAssetCommentKey);
    const uiKey = ids[0] || `${photo?.mediaKey || photo?.refKey || 'idx'}:${idx}`;
    const matched = selected.has(uiKey) || ids.some(key => selected.has(key));
    if (!matched) return;
    matchedCount += 1;
    ids.forEach(push);
    push(uiKey);
  });
  return { keys: out, matchedCount };
}

export function filterOutMemoryExclusionKeys(existingKeys, identityKeys) {
  const existing = Array.isArray(existingKeys) ? existingKeys : [];
  const identity = new Set();
  (identityKeys instanceof Set ? Array.from(identityKeys) : (Array.isArray(identityKeys) ? identityKeys : [])).forEach((key) => {
    expandStoredMemoryIdentityKey(key).forEach((item) => identity.add(item));
  });
  if (!identity.size) return existing.slice();
  return existing.filter((key) => !expandStoredMemoryIdentityKey(key).some((item) => identity.has(item)));
}

export function mergeMemoryPhotoIdentity(preferred, other, getPhotoAssetCommentKey) {
  const merged = { ...(preferred || {}) };
  const donor = other || {};
  if (!merged.meetingDate && donor.meetingDate) merged.meetingDate = donor.meetingDate;
  if (!merged.messageId && donor.messageId) merged.messageId = donor.messageId;
  if (!merged.sourceMessageId && donor.sourceMessageId) merged.sourceMessageId = donor.sourceMessageId;
  if (coerceGalleryImageIndex(merged.imageIndex) == null && coerceGalleryImageIndex(donor.imageIndex) != null) {
    merged.imageIndex = coerceGalleryImageIndex(donor.imageIndex);
  }
  if (coerceGalleryImageIndex(merged.sourceImageIndex) == null && coerceGalleryImageIndex(donor.sourceImageIndex) != null) {
    merged.sourceImageIndex = coerceGalleryImageIndex(donor.sourceImageIndex);
  }
  if (!merged.photoId && donor.photoId) merged.photoId = donor.photoId;
  if (!merged.id && donor.id) merged.id = donor.id;
  if (!merged.mediaKey && donor.mediaKey) merged.mediaKey = donor.mediaKey;
  if (!merged.refKey && donor.refKey) merged.refKey = donor.refKey;
  if (!merged.assetKey && donor.assetKey) merged.assetKey = donor.assetKey;
  if (!merged.imageUrl && donor.imageUrl) merged.imageUrl = donor.imageUrl;
  if (!merged.storagePath && donor.storagePath) merged.storagePath = donor.storagePath;
  if (donor.full && (!merged.full || (merged.thumb && merged.full === merged.thumb && donor.full !== donor.thumb))) {
    merged.full = donor.full;
  }
  if (donor.thumb && !merged.thumb) merged.thumb = donor.thumb;
  const union = [];
  collectMemoryPhotoIdentityKeys(merged, getPhotoAssetCommentKey).forEach((key) => pushNormalizedMemoryIdentityKey(union, key));
  collectMemoryPhotoIdentityKeys(donor, getPhotoAssetCommentKey).forEach((key) => pushNormalizedMemoryIdentityKey(union, key));
  merged.legacyKeys = union;
  return merged;
}

export function dedupeMemoryPhotoEntries(list, getPhotoAssetCommentKey, sourceRankFn) {
  const sourceRank = typeof sourceRankFn === 'function'
    ? sourceRankFn
    : (entry) => {
      const rank = { chat: 0, gallery: 0, memo: 1, meeting: 2, anniversary: 3 };
      return rank[entry?.source] ?? 9;
    };
  const byCanonical = new Map();
  const alias = new Map();
  (Array.isArray(list) ? list : []).forEach((entry) => {
    if (!entry) return;
    const keys = collectMemoryPhotoIdentityKeys(entry, getPhotoAssetCommentKey);
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
      byCanonical.set(canonical, mergeMemoryPhotoIdentity(entry, {}, getPhotoAssetCommentKey));
      keys.forEach((key) => alias.set(key, canonical));
      return;
    }
    const existing = byCanonical.get(canonical) || entry;
    const preferNew = sourceRank(entry) < sourceRank(existing);
    const merged = preferNew
      ? mergeMemoryPhotoIdentity(entry, existing, getPhotoAssetCommentKey)
      : mergeMemoryPhotoIdentity(existing, entry, getPhotoAssetCommentKey);
    byCanonical.set(canonical, merged);
    collectMemoryPhotoIdentityKeys(merged, getPhotoAssetCommentKey).forEach((key) => alias.set(key, canonical));
  });
  return Array.from(byCanonical.values());
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
    // Prefer the fuller tag string when chat/memo/meeting copies of the same asset disagree
    // (empty message.imageTags must not blank a tagged meeting album copy).
    const mergedTagCount = String(merged.tags || '').split(/[,\s#]+/).map(t => t.trim()).filter(Boolean).length;
    const otherTagCount = String(other.tags || '').split(/[,\s#]+/).map(t => t.trim()).filter(Boolean).length;
    if (otherTagCount > mergedTagCount) merged.tags = other.tags;
    else if (!merged.tags && other.tags) merged.tags = other.tags;
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
        tags: (() => {
          const resolvedTags = resolved?.tags != null ? String(resolved.tags) : '';
          const photoTags = String(photo?.tags ?? '');
          const resolvedCount = resolvedTags.split(/[,\s#]+/).map(t => t.trim()).filter(Boolean).length;
          const photoCount = photoTags.split(/[,\s#]+/).map(t => t.trim()).filter(Boolean).length;
          return photoCount > resolvedCount ? photoTags : (resolvedTags || photoTags);
        })(),
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
