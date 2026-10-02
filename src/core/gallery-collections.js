/**
 * Gallery collections: the one place the 갤러리 page turns chat messages, memos, meetings and
 * photoIndex rows into its three lists (사진 / 링크 / 파일).
 *
 * Why this exists (2026-10 rewrite):
 *   1. Mixed lists. Link cards were keyed by their message id, so a message with two links gave
 *      two siblings the same React key. React cannot reconcile duplicate keys, and because every
 *      tab rendered its list into the same grid <div>, stale link cards stayed behind inside the
 *      photo grid after switching tabs. Every item now carries a `galleryKey` that is unique within
 *      its list (kind + source + owner + asset/url), and the page mounts each tab in its own keyed
 *      container.
 *   2. Slowness. Each photoIndex row looked up its message/memo with Array.find and scanned every
 *      confirmed meeting, i.e. photos × messages work on every recompute — and the full chat
 *      archive (thousands of messages) is loaded as soon as 링크/파일 is opened. Lookups here go
 *      through maps built once per input.
 *
 * Everything is pure: helpers that live on window (URL extraction, tag resolution …) are passed in.
 */

function firstById(list) {
  const map = new Map();
  (Array.isArray(list) ? list : []).forEach(row => {
    if (row && row.id != null && row.id !== '' && !map.has(row.id)) map.set(row.id, row);
  });
  return map;
}

function sourceSlotKey(messageId, imageIndex) {
  const index = Number(imageIndex);
  if (!messageId || !Number.isFinite(index)) return '';
  return `${messageId}|${index}`;
}

/**
 * Lookup tables for resolving a photoIndex row against the documents that own its tags.
 * `meetings` must be in the same order getConfirmedMeetings returns them; the first matching
 * meeting wins, exactly like the scan it replaces.
 */
export function createGalleryOwnerLookup({ messages = [], memos = [], meetings = [] } = {}) {
  const messagesById = firstById(messages);
  const memosById = firstById(memos);
  const meetingList = Array.isArray(meetings) ? meetings : [];
  const meetingsByPhotoId = new Map();
  const meetingsBySourceSlot = new Map();
  const addIndex = (map, key, index) => {
    if (!key) return;
    const list = map.get(key);
    if (!list) map.set(key, [index]);
    else if (list[list.length - 1] !== index) list.push(index);
  };
  meetingList.forEach((meeting, meetingIndex) => {
    (Array.isArray(meeting?.photos) ? meeting.photos : []).forEach(row => {
      if (!row) return;
      if (row.id) addIndex(meetingsByPhotoId, row.id, meetingIndex);
      if (row.sourceMessageId) addIndex(meetingsBySourceSlot, sourceSlotKey(row.sourceMessageId, row.sourceImageIndex), meetingIndex);
    });
  });
  return {
    message: id => (id ? messagesById.get(id) || null : null),
    memo: id => (id ? memosById.get(id) || null : null),
    /** First meeting album row (in meeting order) for this photo whose tags are set, or null. */
    meetingTagRow(photo, imageIndex) {
      const candidates = new Set();
      if (photo?.photoId) (meetingsByPhotoId.get(photo.photoId) || []).forEach(i => candidates.add(i));
      if (photo?.sourceMessageId) {
        const slot = sourceSlotKey(photo.sourceMessageId, photo.sourceImageIndex != null ? photo.sourceImageIndex : imageIndex);
        (meetingsBySourceSlot.get(slot) || []).forEach(i => candidates.add(i));
      }
      const ordered = Array.from(candidates).sort((a, b) => a - b);
      for (const meetingIndex of ordered) {
        const rows = Array.isArray(meetingList[meetingIndex]?.photos) ? meetingList[meetingIndex].photos : [];
        const match = rows.find(row => {
          if (!row) return false;
          if (photo.photoId && row.id === photo.photoId) return true;
          return Boolean(photo.sourceMessageId && row.sourceMessageId === photo.sourceMessageId
            && Number(row.sourceImageIndex) === Number(photo.sourceImageIndex != null ? photo.sourceImageIndex : imageIndex));
        });
        if (match && match.tags != null) return match;
      }
      return null;
    }
  };
}

function normalizeImageIndex(value) {
  if (Number.isInteger(value)) return value;
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(0, Math.round(number)) : 0;
}

/**
 * photoIndex rows → 사진 tab rows. Same rules as before (posters, meme stickers and non-photo
 * assets are excluded; the owning document's asset-keyed tags win over the lagging index), with
 * O(1) owner lookups.
 */
export function resolveIndexedGalleryPhotos(indexedPhotos, {
  lookup,
  calendarId = '',
  isBrokenPhotoValue = () => false,
  isMemeKeyboardPhotoEntry = () => false,
  classifyGalleryItem,
  getPhotoAssetCommentKey = () => '',
  getDirectMediaTagsForUrl = () => '',
  resolveGalleryLightboxTags
} = {}) {
  if (!Array.isArray(indexedPhotos)) return [];
  const owners = lookup || createGalleryOwnerLookup();
  return indexedPhotos
    .filter(photo => photo && !isBrokenPhotoValue(photo.full) && !isBrokenPhotoValue(photo.thumb))
    // Movie/sports (anniversary) posters belong in 컨텐츠, not gallery 사진.
    .filter(photo => {
      const source = String(photo.source || '').trim();
      if (source === 'anniversary') return false;
      return !String(photo.sourceOwner || '').startsWith('anniversary:');
    })
    .filter(photo => !isMemeKeyboardPhotoEntry(photo))
    .filter(photo => classifyGalleryItem(photo) === 'photo')
    .map(photo => {
      const source = photo.source || 'gallery';
      const imageIndex = normalizeImageIndex(photo.imageIndex);
      // Photo-index memo rows historically omitted messageId. Recover it from sourceOwner
      // (`memo:<id>:<index>`) so lightbox tag saves can resolve the memo document.
      let messageId = photo.messageId;
      if (!messageId && source === 'memo') {
        const owner = String(photo.sourceOwner || (Array.isArray(photo.owners) && photo.owners[0] && photo.owners[0].sourceOwner) || '');
        const match = owner.match(/^memo:([^:]+):/);
        if (match) messageId = match[1];
      }
      // Client cannot write photoIndex and the CF denorm can lag, so the source document's
      // asset-keyed tag state wins. Never combine it with a duplicate photo's tag.
      const indexTags = String(photo.tags || '');
      let localTags = null;
      let localTagsAreAuthoritative = false;
      const assetKey = String(photo?.assetKey || getPhotoAssetCommentKey(photo) || '');
      const readOwnerTags = row => {
        const map = row?.imageTagMap;
        if (map && typeof map === 'object' && !Array.isArray(map) && assetKey
          && Object.prototype.hasOwnProperty.call(map, assetKey)) {
          localTags = String(map[assetKey] || '');
          localTagsAreAuthoritative = true;
        } else if (Array.isArray(row?.imageTags) && Object.prototype.hasOwnProperty.call(row.imageTags, imageIndex)) {
          localTags = String(row.imageTags[imageIndex] || '');
          localTagsAreAuthoritative = true;
        }
      };
      if (messageId) {
        if (source === 'memo') {
          const memo = owners.memo(messageId);
          if (memo) readOwnerTags(memo);
        } else if (photo.directMediaUrl) {
          const message = owners.message(messageId);
          if (message) localTags = String(getDirectMediaTagsForUrl(message, photo.directMediaUrl) || '');
        } else {
          const message = owners.message(messageId);
          if (message) readOwnerTags(message);
        }
      }
      // Meeting album copies store durable tags on confirmedMeetings.photos[].tags. They are a
      // legacy fallback only: once the original message/memo owns an explicit slot (even an
      // empty one) it is never replaced.
      if ((source === 'meeting' || photo.meetingDate || photo.photoId || photo.sourceMessageId)
        && !localTagsAreAuthoritative && localTags == null) {
        const row = owners.meetingTagRow(photo, imageIndex);
        if (row) localTags = String(row.tags || '');
      }
      const tags = resolveGalleryLightboxTags(calendarId, {
        ...photo,
        messageId: messageId || photo.messageId,
        imageIndex
      }, { localTags, indexTags, localTagAuthoritative: localTagsAreAuthoritative });
      return {
        ...photo,
        source,
        uploadSource: photo.uploadSource || (['chat', 'gallery', 'meeting', 'memo'].includes(source) ? source : photo.uploadSource),
        messageId: messageId || photo.messageId,
        imageIndex,
        tags
      };
    });
}

/** Stable, list-unique key for a 링크 row: one card per (source, owner, url). */
export function galleryLinkKey(item) {
  return `link:${item?.source || ''}:${item?.messageId || ''}:${item?.url || ''}`;
}

/**
 * Every external link shared in chat, memos and meeting notes, newest first. A URL appears once
 * (first owner wins, chat before memo before meeting — the order the page always used).
 */
export function buildGalleryLinks({
  messages = [],
  memos = [],
  meetings = [],
  extractUrls,
  isExternalServiceUrl,
  isTombstone = () => false,
  classifyGalleryItem
} = {}) {
  const list = [];
  const seen = new Set();
  const pushFrom = (body, makeItem) => {
    let firstUrlSeen = false;
    (extractUrls(body) || []).forEach(info => {
      if (!info?.url || seen.has(info.url) || !isExternalServiceUrl(info.url)) return;
      seen.add(info.url);
      // Only the owner's first URL reuses its cached linkPreview (the cache is keyed to it).
      list.push(makeItem(info.url, !firstUrlSeen));
      firstUrlSeen = true;
    });
  };
  (Array.isArray(messages) ? messages : []).forEach(msg => {
    if (!msg?.text) return;
    pushFrom(msg.text, (url, first) => ({
      url, timestamp: msg.timestamp, messageId: msg.id, text: msg.text,
      linkPreview: first ? msg.linkPreview : null, source: 'chat'
    }));
  });
  (Array.isArray(memos) ? memos : []).forEach(memo => {
    const body = memo?.text || memo?.content || memo?.body || '';
    if (!body || isTombstone(memo)) return;
    pushFrom(body, (url, first) => ({
      url, timestamp: memo.updatedAt || memo.createdAt || 0, messageId: memo.id, title: memo.title || '',
      text: body, linkPreview: first ? (memo.linkPreview || null) : null, source: 'memo'
    }));
  });
  (Array.isArray(meetings) ? meetings : []).forEach(meeting => {
    const body = [meeting?.note, meeting?.memo, meeting?.description, meeting?.text].filter(Boolean).join('\n');
    if (!body) return;
    pushFrom(body, url => ({
      url, timestamp: meeting.updatedAt || meeting.confirmedAt || 0,
      messageId: `meeting:${meeting.date || ''}`, text: body, source: 'meeting',
      title: meeting.date ? `${meeting.date} 일정` : '일정'
    }));
  });
  return list
    .filter(item => classifyGalleryItem(item) === 'link')
    .map(item => ({ ...item, galleryKey: galleryLinkKey(item) }))
    .sort((a, b) => Number(b.timestamp || 0) - Number(a.timestamp || 0));
}

/** Stable, list-unique key for a 파일 row. */
export function galleryFileKey(item, index = 0) {
  const id = String(item?.id || '').trim();
  const url = String(item?.url || '').trim();
  return `file:${id || url || `idx-${index}`}`;
}

/**
 * Gives every row a key that is unique within the list. Rows that would collide get a `#n`
 * suffix instead of sharing a React key (the original cause of cards leaking between tabs).
 */
export function withUniqueGalleryKeys(items, keyOf) {
  const used = new Map();
  return (Array.isArray(items) ? items : []).map((item, index) => {
    const base = String(keyOf(item, index) || `item-${index}`);
    const count = used.get(base) || 0;
    used.set(base, count + 1);
    const galleryKey = count ? `${base}#${count}` : base;
    return item && item.galleryKey === galleryKey ? item : { ...item, galleryKey };
  });
}

/** key → position map, so a thumbnail finds its lightbox index without scanning the list. */
export function buildGalleryKeyIndex(items, keyOf) {
  const map = new Map();
  (Array.isArray(items) ? items : []).forEach((item, index) => {
    const key = keyOf(item, index);
    if (key && !map.has(key)) map.set(key, index);
  });
  return map;
}
