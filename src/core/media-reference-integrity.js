/**
 * Reference integrity for user photos (docs/data-architecture-v3.md, phase P0).
 *
 * The data model still stores copies of a photo in several documents (the chat/gallery message
 * that owns the upload, confirmedMeetings.photos[] album entries, memos). Until the `assets`
 * collection lands (P3) every mutation must treat those copies as ONE asset:
 *
 *   - a photo is identified by its normalized Storage URL (download tokens stripped), never by
 *     an array position;
 *   - delete removes every copy, and the Storage file is only deleted when nothing else still
 *     points at it;
 *   - replace moves every copy to the new file and keeps tags;
 *   - a tag edit is written through to every copy.
 *
 * Pure ESM, no window/DOM, so the rules are unit-tested directly (test/media-reference-integrity.test.mjs).
 */
import { normalizePhotoAssetUrl } from './photo-asset.js';

const URL_FIELDS = ['imageUrl', 'full', 'url', 'src', 'downloadURL', 'thumbUrl', 'thumb', 'thumbnailUrl'];

/** Normalized URLs a photo-ish record carries (original + thumb). */
export function assetUrlSet(photo = {}) {
  const out = new Set();
  URL_FIELDS.forEach(field => {
    const value = photo && typeof photo[field] === 'string' ? normalizePhotoAssetUrl(photo[field]) : '';
    if (value) out.add(value);
  });
  return out;
}

/** True when two records point at the same stored file (original or thumb overlap). */
export function sharesAsset(a = {}, b = {}) {
  const left = assetUrlSet(a);
  if (!left.size) return false;
  for (const url of assetUrlSet(b)) if (left.has(url)) return true;
  return false;
}

/** Message/memo slot -> { imageUrl, thumbUrl } for index i (legacy single-image fields too). */
export function messageImageAt(message = {}, index) {
  const urls = Array.isArray(message.imageUrls) && message.imageUrls.length
    ? message.imageUrls : (message.imageUrl ? [message.imageUrl] : []);
  const thumbs = Array.isArray(message.thumbUrls) && message.thumbUrls.length
    ? message.thumbUrls : (message.thumbUrl ? [message.thumbUrl] : []);
  return { imageUrl: urls[index] || '', thumbUrl: thumbs[index] || '' };
}

export function messageImageCount(message = {}) {
  const urls = Array.isArray(message.imageUrls) && message.imageUrls.length
    ? message.imageUrls.length : (message.imageUrl ? 1 : 0);
  const thumbs = Array.isArray(message.thumbUrls) && message.thumbUrls.length
    ? message.thumbUrls.length : (message.thumbUrl ? 1 : 0);
  return Math.max(urls, thumbs);
}

/**
 * Locate the slot holding `asset` in the CURRENT message. The caller's index is only trusted
 * when that slot still holds the same file -- a stale local copy (another device deleted or
 * reordered photos) must never delete, replace or retag a neighbouring photo.
 * Returns -1 when the asset is no longer in the message.
 */
export function findImageSlotByAsset(message = {}, asset = {}, hintIndex = null) {
  const count = messageImageCount(message);
  if (Number.isInteger(hintIndex) && hintIndex >= 0 && hintIndex < count
    && sharesAsset(messageImageAt(message, hintIndex), asset)) {
    return hintIndex;
  }
  for (let index = 0; index < count; index += 1) {
    if (sharesAsset(messageImageAt(message, index), asset)) return index;
  }
  return -1;
}

const meetingPhotoList = meeting => (Array.isArray(meeting?.photos) ? meeting.photos : []);

/**
 * Drop every album entry of `asset` from every meeting -- not only the ones whose
 * sourceMessageId is this message (album copies made by other paths, or copied into a second
 * meeting, were left behind and became 404 thumbnails). Same-message references after the
 * deleted slot are renumbered because they still address the message by position.
 */
export function removeAssetFromMeetings(meetings = [], asset = {}, { messageId = '', deletedIndex = null, dropAllFromMessage = false } = {}) {
  let changed = false;
  const next = (Array.isArray(meetings) ? meetings : []).map(meeting => {
    const photos = meetingPhotoList(meeting);
    let meetingChanged = false;
    const kept = [];
    photos.forEach(photo => {
      const sameMessage = messageId && photo?.sourceMessageId === messageId;
      const byIdentity = sharesAsset(photo, asset);
      const byPosition = sameMessage && (dropAllFromMessage
        || (Number.isInteger(deletedIndex) && photo.sourceImageIndex === deletedIndex));
      if (byIdentity || byPosition) {
        meetingChanged = true;
        return;
      }
      if (sameMessage && Number.isInteger(deletedIndex) && Number.isInteger(photo.sourceImageIndex)
        && photo.sourceImageIndex > deletedIndex) {
        meetingChanged = true;
        kept.push({ ...photo, sourceImageIndex: photo.sourceImageIndex - 1 });
        return;
      }
      kept.push(photo);
    });
    if (!meetingChanged) return meeting;
    changed = true;
    return { ...meeting, photos: kept };
  });
  return { meetings: next, changed };
}

/** Point every album copy of `oldAsset` at the replacement file; tags, ids and order stay. */
export function replaceAssetInMeetings(meetings = [], oldAsset = {}, newAsset = {}) {
  const imageUrl = String(newAsset.imageUrl || newAsset.full || '');
  const thumbUrl = String(newAsset.thumbUrl || newAsset.thumb || imageUrl);
  if (!imageUrl) return { meetings, changed: false };
  let changed = false;
  const next = (Array.isArray(meetings) ? meetings : []).map(meeting => {
    let meetingChanged = false;
    const photos = meetingPhotoList(meeting).map(photo => {
      if (!sharesAsset(photo, oldAsset)) return photo;
      meetingChanged = true;
      const patched = { ...photo, imageUrl, thumbUrl, updatedAt: Date.now() };
      if ('full' in photo) patched.full = imageUrl;
      if ('url' in photo) patched.url = imageUrl;
      if ('thumb' in photo) patched.thumb = thumbUrl;
      return patched;
    });
    if (!meetingChanged) return meeting;
    changed = true;
    return { ...meeting, photos };
  });
  return { meetings: next, changed };
}

/** Write a tag edit through to every album copy of the same asset. */
export function syncAssetTagsInMeetings(meetings = [], asset = {}, tags = '') {
  const value = String(tags || '');
  let changed = false;
  const next = (Array.isArray(meetings) ? meetings : []).map(meeting => {
    let meetingChanged = false;
    const photos = meetingPhotoList(meeting).map(photo => {
      if (!sharesAsset(photo, asset) || String(photo.tags || '') === value) return photo;
      meetingChanged = true;
      return { ...photo, tags: value };
    });
    if (!meetingChanged) return meeting;
    changed = true;
    return { ...meeting, photos };
  });
  return { meetings: next, changed };
}

/**
 * Other documents that still reference `asset`, excluding the owner being edited. Used to
 * decide whether the Storage file may be deleted. `indexOwners` are photoIndex owner strings
 * (`message:<id>:<i>`, `memo:<id>:<i>`, `meeting:<date>:<i>`) from the server index; the local
 * collections cover writes the index has not caught up with yet.
 */
export function listOtherAssetReferences(asset = {}, {
  messages = [],
  memos = [],
  meetings = [],
  indexOwners = [],
  excludeMessageId = '',
  excludeMemoId = '',
  excludeMeetingDates = [],
} = {}) {
  const refs = new Set();
  const excludedDates = new Set(excludeMeetingDates.filter(Boolean));
  const scanDoc = (kind, doc, excludedId) => {
    if (!doc || (excludedId && doc.id === excludedId)) return;
    const count = messageImageCount(doc);
    for (let index = 0; index < count; index += 1) {
      if (sharesAsset(messageImageAt(doc, index), asset)) {
        refs.add(`${kind}:${doc.id}`);
        return;
      }
    }
  };
  (messages || []).forEach(doc => scanDoc('message', doc, excludeMessageId));
  (memos || []).forEach(doc => scanDoc('memo', doc, excludeMemoId));
  (meetings || []).forEach(meeting => {
    if (excludedDates.has(meeting?.date)) return;
    if (meetingPhotoList(meeting).some(photo => !photo?.deletedAt && sharesAsset(photo, asset))) {
      refs.add(`meeting:${meeting.date}`);
    }
  });
  (indexOwners || []).forEach(owner => {
    const match = String(owner || '').match(/^(message|memo|meeting):(.+):\d+$/);
    if (!match) return;
    const [, kind, id] = match;
    if (kind === 'message' && id === excludeMessageId) return;
    if (kind === 'memo' && id === excludeMemoId) return;
    if (kind === 'meeting' && excludedDates.has(id)) return;
    refs.add(`${kind}:${id}`);
  });
  return Array.from(refs);
}
