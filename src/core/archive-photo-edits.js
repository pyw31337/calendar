import { canonicalPhotoAssetKey } from './photo-asset.js';

// One photo is reachable through several ids at once: the canonical asset, the
// photoIndex document id, a chat slot, a meeting copy, and the image URL.
// Archive edits must hit every one of those or the same picture stays on screen
// after a tag or delete that only knew about a different id.
export function archivePhotoIdentityKeys(photo = {}) {
  const keys = [];
  const push = value => {
    const text = String(value || '').trim();
    if (!text || keys.includes(text)) return;
    keys.push(text);
  };
  push(photo.assetKey);
  push(photo.mediaKey);
  push(photo.refKey);
  (Array.isArray(photo.legacyKeys) ? photo.legacyKeys : []).forEach(push);
  push(canonicalPhotoAssetKey(photo));
  const messageId = String(photo.messageId || photo.sourceMessageId || '').trim();
  if (messageId) {
    const imageIndex = Number.isFinite(Number(photo.imageIndex))
      ? Number(photo.imageIndex)
      : (Number.isFinite(Number(photo.sourceImageIndex)) ? Number(photo.sourceImageIndex) : 0);
    push(`slot:${messageId}:${imageIndex}`);
  }
  const meetingDate = String(photo.meetingDate || '').slice(0, 10);
  const photoId = String(photo.photoId || photo.id || '').trim();
  if (meetingDate && photoId) push(`meet:${meetingDate}:${photoId}`);
  push(photo.full);
  push(photo.thumb);
  push(photo.imageUrl);
  push(photo.thumbUrl);
  push(photo.url);
  return keys;
}

export function archivePhotosShareIdentity(left, right) {
  if (!left || !right) return false;
  const keys = new Set(archivePhotoIdentityKeys(right));
  return archivePhotoIdentityKeys(left).some(key => keys.has(key));
}

export function rememberArchiveTag(map, photo, tags) {
  const next = map instanceof Map ? map : new Map();
  const value = String(tags || '');
  archivePhotoIdentityKeys(photo).forEach(key => next.set(key, value));
  return next;
}

export function readArchiveTag(map, photo) {
  if (!(map instanceof Map) || map.size === 0) return null;
  for (const key of archivePhotoIdentityKeys(photo)) {
    if (map.has(key)) return map.get(key);
  }
  return null;
}

export function rememberArchiveDeleted(set, photo) {
  const next = set instanceof Set ? set : new Set();
  archivePhotoIdentityKeys(photo).forEach(key => next.add(key));
  return next;
}

export function forgetArchiveDeleted(set, photo) {
  const next = set instanceof Set ? new Set(set) : new Set();
  archivePhotoIdentityKeys(photo).forEach(key => next.delete(key));
  return next;
}

export function photoHiddenByArchiveDelete(deletedKeys, photo) {
  if (!(deletedKeys instanceof Set) || deletedKeys.size === 0) return false;
  return archivePhotoIdentityKeys(photo).some(key => deletedKeys.has(key));
}

export function projectArchivePhotoEntries(entries, { tagOverrides = null, deletedKeys = null } = {}) {
  const list = Array.isArray(entries) ? entries : [];
  if ((!tagOverrides || tagOverrides.size === 0) && (!deletedKeys || deletedKeys.size === 0)) return list;
  return list.reduce((acc, photo) => {
    if (!photo || photoHiddenByArchiveDelete(deletedKeys, photo)) return acc;
    const override = readArchiveTag(tagOverrides, photo);
    acc.push(override == null ? photo : { ...photo, tags: override, tagAuthoritative: true });
    return acc;
  }, []);
}
