'use strict';
// Server-side photo commands (docs/data-architecture-v3.md, phase P3).
//
// Every photo mutation that spans several documents runs here in ONE Firestore transaction
// instead of as a chain of client writes:
//   deleteAsset -> removes the file's slot from every owning message/memo (arrays kept aligned),
//                  drops every meeting-album copy, re-links positional album references by file,
//                  and queues the Storage objects for delayed garbage collection;
//   tagAsset    -> writes the tag to every owning message/memo slot and every album copy.
// Storage objects are never deleted inline. They go to `storageGc/{id}` with a grace period and
// the sweeper deletes them only if no photoIndex row still points at the file (invariant I2).
//
// Pure dependency injection (db, bucket) so the logic is tested against the Firestore/Storage
// emulator (functions/test/media-commands.emulator.test.js).

const GC_GRACE_MS = 7 * 24 * 60 * 60 * 1000;
const PLACEHOLDER_TEXTS = new Set(['', '갤러리 사진', '일정 사진', '사진']);

// Must stay byte-identical to src/core/photo-asset.js and functions/index.js getPhotoAssetKey.
function normalizePhotoAssetUrl(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  if (raw.startsWith('data:') || raw.startsWith('blob:')) return raw;
  try {
    const parsed = new URL(raw);
    parsed.hash = '';
    if (parsed.hostname === 'firebasestorage.googleapis.com' || parsed.hostname.endsWith('.firebasestorage.app')) parsed.search = '';
    return parsed.toString();
  } catch (_) {
    return raw.split('#')[0];
  }
}
function hashPhotoAssetIdentity(value) {
  const source = String(value || '');
  let fnv = 2166136261;
  let djb = 5381;
  for (let index = 0; index < source.length; index += 1) {
    const code = source.charCodeAt(index);
    fnv ^= code;
    fnv = Math.imul(fnv, 16777619);
    djb = Math.imul(djb, 33) ^ code;
  }
  return `${(fnv >>> 0).toString(36)}-${(djb >>> 0).toString(36)}-${source.length.toString(36)}`;
}
function getPhotoAssetKey(value) {
  const normalized = normalizePhotoAssetUrl(value);
  return normalized ? `asset:v1:${hashPhotoAssetIdentity(normalized)}` : '';
}

function urlSet(record) {
  const out = new Set();
  ['imageUrl', 'full', 'url', 'thumbUrl', 'thumb'].forEach(field => {
    const value = record && typeof record[field] === 'string' ? normalizePhotoAssetUrl(record[field]) : '';
    if (value) out.add(value);
  });
  return out;
}
function sameFile(a, b) {
  const left = urlSet(a);
  for (const url of urlSet(b)) if (left.has(url)) return true;
  return false;
}
function slotsOf(doc) {
  const urls = Array.isArray(doc.imageUrls) && doc.imageUrls.length ? doc.imageUrls : (doc.imageUrl ? [doc.imageUrl] : []);
  const thumbs = Array.isArray(doc.thumbUrls) && doc.thumbUrls.length ? doc.thumbUrls : (doc.thumbUrl ? [doc.thumbUrl] : []);
  const count = Math.max(urls.length, thumbs.length);
  return Array.from({ length: count }, (_, index) => ({ imageUrl: urls[index] || '', thumbUrl: thumbs[index] || urls[index] || '' }));
}
function storagePathFromUrl(url) {
  const match = String(url || '').match(/\/o\/([^?#]+)/);
  if (!match) return '';
  try { return decodeURIComponent(match[1]); } catch (_) { return ''; }
}
function ownerDocIds(indexData) {
  const owners = Array.isArray(indexData?.owners) ? indexData.owners : [];
  const ids = { messages: new Set(), memos: new Set() };
  owners.forEach(owner => {
    const match = String(owner?.sourceOwner || '').match(/^(message|memo):(.+):\d+$/);
    if (!match) return;
    (match[1] === 'message' ? ids.messages : ids.memos).add(match[2]);
  });
  return ids;
}

// Remove every slot holding `asset` from a message/memo. Returns null when nothing matched.
function removeAssetSlots(data, asset) {
  const slots = slotsOf(data);
  const dead = slots.map((slot, index) => (sameFile(slot, asset) ? index : -1)).filter(index => index >= 0);
  if (!dead.length) return null;
  const keep = (_, index) => !dead.includes(index);
  const imageUrls = slots.filter(keep).map(slot => slot.imageUrl);
  const thumbUrls = slots.filter(keep).map(slot => slot.thumbUrl);
  const imageTags = (Array.isArray(data.imageTags) ? data.imageTags : []).filter(keep);
  const removedKeys = new Set(dead.map(index => getPhotoAssetKey(slots[index].imageUrl || slots[index].thumbUrl)));
  const tagMap = data.imageTagMap && typeof data.imageTagMap === 'object' && !Array.isArray(data.imageTagMap) ? data.imageTagMap : {};
  const imageTagMap = Object.fromEntries(Object.entries(tagMap).filter(([key]) => !removedKeys.has(key)));
  const hasOtherContent = imageUrls.length > 0
    || !PLACEHOLDER_TEXTS.has(String(data.text || '').trim())
    || (Array.isArray(data.fileAttachments) && data.fileAttachments.length > 0);
  return {
    deleteDoc: !hasOtherContent,
    removed: dead,
    patch: { imageUrls, thumbUrls, imageTags, imageTagMap, imageUrl: imageUrls[0] || null, thumbUrl: thumbUrls[0] || null },
  };
}

// Drop album copies of `asset`; re-link positional references into edited messages by file.
function rewriteMeetingPhotos(photos, asset, editedMessages) {
  let changed = false;
  const next = [];
  (Array.isArray(photos) ? photos : []).forEach(photo => {
    if (!photo || typeof photo !== 'object') { next.push(photo); return; }
    if (sameFile(photo, asset)) { changed = true; return; }
    const edited = photo.sourceMessageId ? editedMessages.get(photo.sourceMessageId) : null;
    if (!edited || !Number.isInteger(photo.sourceImageIndex)) { next.push(photo); return; }
    if (edited.deleteDoc) { changed = true; return; }
    const byFile = edited.patch.imageUrls.findIndex((url, index) => sameFile({ imageUrl: url, thumbUrl: edited.patch.thumbUrls[index] }, photo));
    const shifted = photo.sourceImageIndex - edited.removed.filter(index => index < photo.sourceImageIndex).length;
    const moved = byFile >= 0 ? byFile : shifted;
    if (moved !== photo.sourceImageIndex) { changed = true; next.push({ ...photo, sourceImageIndex: moved }); return; }
    next.push(photo);
  });
  return { photos: next, changed };
}

async function deleteAsset({ db, calendarDocId, asset, now = Date.now() }) {
  const root = db.collection('calendars').doc(calendarDocId);
  const assetKey = getPhotoAssetKey(asset?.imageUrl || asset?.thumbUrl);
  if (!assetKey) return { ok: false, reason: 'invalid-asset' };
  const indexSnap = await root.collection('photoIndex').doc(assetKey).get();
  const owners = ownerDocIds(indexSnap.exists ? indexSnap.data() : null);
  (asset.messageId ? [asset.messageId] : []).forEach(id => owners.messages.add(id));
  (asset.memoId ? [asset.memoId] : []).forEach(id => owners.memos.add(id));

  return db.runTransaction(async tx => {
    const messageRefs = Array.from(owners.messages).map(id => root.collection('messages').doc(id));
    const memoRefs = Array.from(owners.memos).map(id => root.collection('memos').doc(id));
    const [messageSnaps, memoSnaps, meetingsSnap] = await Promise.all([
      Promise.all(messageRefs.map(ref => tx.get(ref))),
      Promise.all(memoRefs.map(ref => tx.get(ref))),
      tx.get(root.collection('confirmedMeetings')),
    ]);
    const editedMessages = new Map();
    const writes = [];
    let slotsRemoved = 0;
    [...messageSnaps, ...memoSnaps].forEach(snap => {
      if (!snap.exists) return;
      const result = removeAssetSlots(snap.data() || {}, asset);
      if (!result) return;
      slotsRemoved += result.removed.length;
      if (snap.ref.parent.id === 'messages') editedMessages.set(snap.id, result);
      writes.push(() => (result.deleteDoc ? tx.delete(snap.ref) : tx.update(snap.ref, result.patch)));
    });
    let albumCopiesRemoved = 0;
    meetingsSnap.docs.forEach(doc => {
      const before = Array.isArray(doc.data()?.photos) ? doc.data().photos : [];
      const { photos, changed } = rewriteMeetingPhotos(before, asset, editedMessages);
      if (!changed) return;
      albumCopiesRemoved += before.filter(photo => sameFile(photo, asset)).length;
      writes.push(() => tx.update(doc.ref, { photos, updatedAt: now }));
    });
    const paths = Array.from(new Set([storagePathFromUrl(asset.imageUrl), storagePathFromUrl(asset.thumbUrl)].filter(Boolean)));
    paths.forEach(path => {
      writes.push(() => tx.set(db.collection('storageGc').doc(Buffer.from(path).toString('base64url')), {
        path, calendarDocId, assetKey, queuedAt: now, deleteAfter: now + GC_GRACE_MS,
      }));
    });
    writes.forEach(write => write());
    return { ok: true, assetKey, slotsRemoved, albumCopiesRemoved, messagesTouched: editedMessages.size, queuedStoragePaths: paths };
  });
}

async function tagAsset({ db, calendarDocId, asset, tags, now = Date.now() }) {
  const root = db.collection('calendars').doc(calendarDocId);
  const assetKey = getPhotoAssetKey(asset?.imageUrl || asset?.thumbUrl);
  if (!assetKey) return { ok: false, reason: 'invalid-asset' };
  const value = String(tags || '').trim().slice(0, 160);
  const indexSnap = await root.collection('photoIndex').doc(assetKey).get();
  const owners = ownerDocIds(indexSnap.exists ? indexSnap.data() : null);
  (asset.messageId ? [asset.messageId] : []).forEach(id => owners.messages.add(id));
  (asset.memoId ? [asset.memoId] : []).forEach(id => owners.memos.add(id));
  return db.runTransaction(async tx => {
    const refs = [
      ...Array.from(owners.messages).map(id => root.collection('messages').doc(id)),
      ...Array.from(owners.memos).map(id => root.collection('memos').doc(id)),
    ];
    const [snaps, meetingsSnap] = await Promise.all([Promise.all(refs.map(ref => tx.get(ref))), tx.get(root.collection('confirmedMeetings'))]);
    const writes = [];
    let slotsTagged = 0;
    snaps.forEach(snap => {
      if (!snap.exists) return;
      const data = snap.data() || {};
      const slots = slotsOf(data);
      const imageTags = Array.isArray(data.imageTags) ? data.imageTags.slice() : [];
      while (imageTags.length < slots.length) imageTags.push('');
      const imageTagMap = { ...(data.imageTagMap && typeof data.imageTagMap === 'object' && !Array.isArray(data.imageTagMap) ? data.imageTagMap : {}) };
      let hit = false;
      slots.forEach((slot, index) => {
        if (!sameFile(slot, asset)) return;
        imageTags[index] = value;
        imageTagMap[getPhotoAssetKey(slot.imageUrl || slot.thumbUrl)] = value;
        hit = true;
        slotsTagged += 1;
      });
      if (hit) writes.push(() => tx.update(snap.ref, { imageTags, imageTagMap }));
    });
    let albumCopiesTagged = 0;
    meetingsSnap.docs.forEach(doc => {
      const photos = Array.isArray(doc.data()?.photos) ? doc.data().photos : [];
      let changed = false;
      const next = photos.map(photo => {
        if (!photo || !sameFile(photo, asset) || String(photo.tags || '') === value) return photo;
        changed = true;
        albumCopiesTagged += 1;
        return { ...photo, tags: value };
      });
      if (changed) writes.push(() => tx.update(doc.ref, { photos: next, updatedAt: now }));
    });
    writes.forEach(write => write());
    return { ok: true, assetKey, slotsTagged, albumCopiesTagged };
  });
}

// Delete queued Storage objects whose grace period elapsed and that no photoIndex row still
// references (checked per calendar, by original or thumb path).
async function sweepStorageGc({ db, bucket, now = Date.now(), limit = 200 }) {
  const due = await db.collection('storageGc').where('deleteAfter', '<=', now).limit(limit).get();
  const result = { examined: due.size, deleted: 0, kept: 0 };
  const referencedByCalendar = new Map();
  const referencedPaths = async calendarDocId => {
    if (!referencedByCalendar.has(calendarDocId)) {
      const index = await db.collection('calendars').doc(calendarDocId).collection('photoIndex').get();
      const paths = new Set();
      index.docs.forEach(row => { const data = row.data() || {}; [data.full, data.thumb].forEach(url => { const p = storagePathFromUrl(url); if (p) paths.add(p); }); });
      referencedByCalendar.set(calendarDocId, paths);
    }
    return referencedByCalendar.get(calendarDocId);
  };
  for (const doc of due.docs) {
    const { path, calendarDocId } = doc.data() || {};
    const stillReferenced = (await referencedPaths(calendarDocId)).has(path);
    if (stillReferenced) {
      result.kept += 1;
      await doc.ref.delete();
      continue;
    }
    try { await bucket.file(path).delete(); } catch (err) { if (err?.code !== 404) throw err; }
    await doc.ref.delete();
    result.deleted += 1;
  }
  return result;
}

module.exports = {
  GC_GRACE_MS,
  normalizePhotoAssetUrl,
  getPhotoAssetKey,
  storagePathFromUrl,
  removeAssetSlots,
  rewriteMeetingPhotos,
  deleteAsset,
  tagAsset,
  sweepStorageGc,
};
