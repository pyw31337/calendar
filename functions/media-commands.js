'use strict';
// Server-side photo commands (docs/data-architecture-v3.md, phase P3).
//
// Every photo mutation that spans several documents runs here in ONE Firestore transaction
// instead of as a chain of client writes:
//   deleteAsset -> removes the file's slot from every owning message/memo (arrays kept aligned),
//                  drops every meeting-album copy, re-links positional album references by file,
//                  and queues the Storage objects for delayed garbage collection;
//   tagAsset    -> writes the tag to every owning message/memo slot and every album copy;
//   mergeAssets -> turns byte-identical copies (same Storage md5) into one photo: every slot and
//                  album entry showing a copy shows the kept file instead, tags are merged and
//                  comments move to it. Nothing is deleted (no slot, document, comment or file).
// Storage objects are never deleted inline. They go to `storageGc/{id}` with a grace period and
// the sweeper deletes them only if no photoIndex row of any calendar still points at the file
// (invariant I2).
//
// Pure dependency injection (db, bucket) so the logic is tested against the Firestore/Storage
// emulator (functions/test/media-commands.emulator.test.js).

const GC_GRACE_MS = 7 * 24 * 60 * 60 * 1000;
// One mediaCommand transaction also reads every affected source document and the meeting album
// collection. Keeping a conservative cap prevents a 200-photo UI selection from exceeding
// Firestore's 500-document transaction limit; the browser chunks larger selections.
const MAX_BULK_TAG_ITEMS = 80;
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

// `owners` is intentionally a bounded preview in photoIndex.  A row explicitly marked as
// complete can safely scope meeting mutations to the listed documents; unmarked legacy rows
// retain the full scan so an older, truncated projection can never leave an album copy stale.
function meetingOwnerScope(indexData) {
  const owners = Array.isArray(indexData?.owners) ? indexData.owners : [];
  const ids = new Set();
  owners.forEach(owner => {
    const match = String(owner?.sourceOwner || '').match(/^meeting:(.+):\d+$/);
    if (match?.[1]) ids.add(match[1]);
  });
  return { ids, complete: indexData?.ownerListComplete === true };
}

function mergeMeetingOwnerScopes(scopes) {
  const ids = new Set();
  let complete = true;
  (Array.isArray(scopes) ? scopes : []).forEach(scope => {
    if (!scope?.complete) complete = false;
    (scope?.ids || []).forEach(id => ids.add(id));
  });
  return { ids, complete };
}

function meetingSnapshots(read) {
  return Array.isArray(read) ? read : (read?.docs || []);
}

function readMeetingDocuments(transaction, root, scope) {
  if (!scope?.complete) return transaction.get(root.collection('confirmedMeetings'));
  return Promise.all(Array.from(scope.ids).map(id => transaction.get(root.collection('confirmedMeetings').doc(id))));
}

function getDirectMediaTagKey(url) {
  const source = String(normalizePhotoAssetUrl(url) || url || '');
  let hash = 2166136261;
  for (let index = 0; index < source.length; index += 1) {
    hash ^= source.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return `u_${(hash >>> 0).toString(36)}`;
}

function sanitizeTagText(value) {
  const seen = new Set();
  return String(value || '').split(/[\s,#]+/)
    .map(token => token.trim().replace(/^#+/, '').slice(0, 30))
    .filter(token => token && !seen.has(token) && (seen.add(token) || true))
    .slice(0, 20)
    .join(' ')
    .slice(0, 640);
}

function sourceOwnerParts(value) {
  const match = String(value || '').match(/^(message|memo):(.+):\d+$/);
  return match ? { collection: match[1] === 'message' ? 'messages' : 'memos', id: match[2] } : null;
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
  const meetingScope = meetingOwnerScope(indexSnap.exists ? indexSnap.data() : null);
  (asset.messageId ? [asset.messageId] : []).forEach(id => owners.messages.add(id));
  (asset.memoId ? [asset.memoId] : []).forEach(id => owners.memos.add(id));

  return db.runTransaction(async tx => {
    const messageRefs = Array.from(owners.messages).map(id => root.collection('messages').doc(id));
    const memoRefs = Array.from(owners.memos).map(id => root.collection('memos').doc(id));
    const [messageSnaps, memoSnaps, meetingRead] = await Promise.all([
      Promise.all(messageRefs.map(ref => tx.get(ref))),
      Promise.all(memoRefs.map(ref => tx.get(ref))),
      readMeetingDocuments(tx, root, meetingScope),
    ]);
    const meetingDocs = meetingSnapshots(meetingRead).filter(snapshot => snapshot?.exists);
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
    meetingDocs.forEach(doc => {
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
    return {
      ok: true,
      assetKey,
      slotsRemoved,
      albumCopiesRemoved,
      messagesTouched: editedMessages.size,
      queuedStoragePaths: paths,
      meetingReadScope: meetingScope.complete ? 'owners' : 'full-scan',
      meetingDocumentsRead: meetingDocs.length,
    };
  });
}

async function tagAsset({ db, calendarDocId, asset, tags, now = Date.now() }) {
  const root = db.collection('calendars').doc(calendarDocId);
  const assetKey = getPhotoAssetKey(asset?.imageUrl || asset?.thumbUrl);
  if (!assetKey) return { ok: false, reason: 'invalid-asset' };
  const value = String(tags || '').trim().slice(0, 640);
  const indexSnap = await root.collection('photoIndex').doc(assetKey).get();
  const owners = ownerDocIds(indexSnap.exists ? indexSnap.data() : null);
  const meetingScope = meetingOwnerScope(indexSnap.exists ? indexSnap.data() : null);
  (asset.messageId ? [asset.messageId] : []).forEach(id => owners.messages.add(id));
  (asset.memoId ? [asset.memoId] : []).forEach(id => owners.memos.add(id));
  return db.runTransaction(async tx => {
    const refs = [
      ...Array.from(owners.messages).map(id => root.collection('messages').doc(id)),
      ...Array.from(owners.memos).map(id => root.collection('memos').doc(id)),
    ];
    const [snaps, meetingRead] = await Promise.all([
      Promise.all(refs.map(ref => tx.get(ref))),
      readMeetingDocuments(tx, root, meetingScope),
    ]);
    const meetingDocs = meetingSnapshots(meetingRead).filter(snapshot => snapshot?.exists);
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
    meetingDocs.forEach(doc => {
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
    return {
      ok: true,
      assetKey,
      slotsTagged,
      albumCopiesTagged,
      meetingReadScope: meetingScope.complete ? 'owners' : 'full-scan',
      meetingDocumentsRead: meetingDocs.length,
    };
  });
}

// Applies final tag sets for many assets in one transaction. This deliberately receives the
// *final* tags, rather than an "add/remove" instruction: the browser can show a precise undo by
// sending the captured previous sets back, and the server remains the one authoritative writer
// for source documents and their meeting-album projections.
async function bulkTagAssets({ db, calendarDocId, items, now = Date.now() }) {
  const input = Array.isArray(items) ? items : [];
  if (!input.length || input.length > MAX_BULK_TAG_ITEMS) {
    return { ok: false, reason: 'invalid-items' };
  }
  const root = db.collection('calendars').doc(calendarDocId);
  const entriesByKey = new Map();
  input.forEach(item => {
    const asset = item && typeof item === 'object' ? item : {};
    const imageUrl = String(asset.imageUrl || asset.full || '').trim();
    const thumbUrl = String(asset.thumbUrl || asset.thumb || imageUrl).trim();
    const assetKey = getPhotoAssetKey(imageUrl || thumbUrl);
    if (!assetKey || entriesByKey.has(assetKey)) return;
    entriesByKey.set(assetKey, {
      assetKey,
      asset: {
        imageUrl,
        thumbUrl,
        messageId: String(asset.messageId || asset.sourceMessageId || '').slice(0, 200),
        memoId: String(asset.memoId || '').slice(0, 200),
        directMediaUrl: String(asset.directMediaUrl || '').trim(),
      },
      tags: sanitizeTagText(asset.tags),
      indexData: null,
    });
  });
  const entries = Array.from(entriesByKey.values());
  if (!entries.length) return { ok: false, reason: 'invalid-asset' };

  // Fetching these before the transaction avoids re-reading the same photoIndex rows while the
  // transaction is open. The source/album documents themselves are still transaction reads.
  const indexSnaps = await Promise.all(entries.map(entry => root.collection('photoIndex').doc(entry.assetKey).get()));
  const owners = { messages: new Set(), memos: new Set() };
  const directByOwner = new Map();
  const meetingScopes = [];
  indexSnaps.forEach((snapshot, index) => {
    const entry = entries[index];
    const data = snapshot.exists ? snapshot.data() || {} : {};
    entry.indexData = data;
    meetingScopes.push(meetingOwnerScope(data));
    const listed = ownerDocIds(data);
    listed.messages.forEach(id => owners.messages.add(id));
    listed.memos.forEach(id => owners.memos.add(id));
    if (entry.asset.messageId) owners.messages.add(entry.asset.messageId);
    if (entry.asset.memoId) owners.memos.add(entry.asset.memoId);
    // Direct-link tags must be routed by an existing canonical index owner. Unlike an uploaded
    // image slot there is no array/file match to prove a caller-supplied message id owns an
    // arbitrary external URL, so never use the request's messageId as a direct-media fallback.
    const directUrl = String(data.directMediaUrl || '').trim();
    const owner = sourceOwnerParts(data.sourceOwner);
    if (!directUrl || !owner) return;
    const key = `${owner.collection}:${owner.id}`;
    const list = directByOwner.get(key) || [];
    list.push({ directUrl, tags: entry.tags, assetKey: entry.assetKey });
    directByOwner.set(key, list);
  });
  const meetingScope = mergeMeetingOwnerScopes(meetingScopes);

  return db.runTransaction(async tx => {
    const messageRefs = Array.from(owners.messages).map(id => root.collection('messages').doc(id));
    const memoRefs = Array.from(owners.memos).map(id => root.collection('memos').doc(id));
    const [messageSnaps, memoSnaps, meetingRead] = await Promise.all([
      Promise.all(messageRefs.map(ref => tx.get(ref))),
      Promise.all(memoRefs.map(ref => tx.get(ref))),
      readMeetingDocuments(tx, root, meetingScope),
    ]);
    const meetingDocs = meetingSnapshots(meetingRead).filter(snapshot => snapshot?.exists);
    const writes = [];
    let sourceDocumentsTouched = 0;
    let slotsTagged = 0;
    let albumCopiesTagged = 0;
    const writeSource = (snap, collection) => {
      if (!snap.exists) return;
      const data = snap.data() || {};
      const slots = slotsOf(data);
      const imageTags = Array.isArray(data.imageTags) ? data.imageTags.slice() : [];
      while (imageTags.length < slots.length) imageTags.push('');
      const imageTagMap = {
        ...(data.imageTagMap && typeof data.imageTagMap === 'object' && !Array.isArray(data.imageTagMap)
          ? data.imageTagMap : {})
      };
      let changed = false;
      slots.forEach((slot, slotIndex) => {
        const assetKey = getPhotoAssetKey(slot.imageUrl || slot.thumbUrl);
        const entry = entriesByKey.get(assetKey);
        if (!entry) return;
        if (imageTags[slotIndex] !== entry.tags || imageTagMap[assetKey] !== entry.tags) {
          imageTags[slotIndex] = entry.tags;
          imageTagMap[assetKey] = entry.tags;
          changed = true;
          slotsTagged += 1;
        }
      });
      const directEntries = directByOwner.get(`${collection}:${snap.id}`) || [];
      let directMediaTags = data.directMediaTags && typeof data.directMediaTags === 'object' && !Array.isArray(data.directMediaTags)
        ? { ...data.directMediaTags } : {};
      directEntries.forEach(entry => {
        const key = getDirectMediaTagKey(entry.directUrl);
        if (directMediaTags[key] === entry.tags) return;
        if (entry.tags) directMediaTags[key] = entry.tags;
        else delete directMediaTags[key];
        changed = true;
        slotsTagged += 1;
      });
      if (!changed) return;
      sourceDocumentsTouched += 1;
      const patch = { imageTags, imageTagMap };
      if (directEntries.length) patch.directMediaTags = directMediaTags;
      writes.push(() => tx.update(snap.ref, patch));
    };
    messageSnaps.forEach(snap => writeSource(snap, 'messages'));
    memoSnaps.forEach(snap => writeSource(snap, 'memos'));
    meetingDocs.forEach(doc => {
      const photos = Array.isArray(doc.data()?.photos) ? doc.data().photos : [];
      let changed = false;
      const next = photos.map(photo => {
        const assetKey = getPhotoAssetKey(photo?.imageUrl || photo?.full || photo?.thumbUrl || photo?.thumb);
        const entry = entriesByKey.get(assetKey);
        if (!entry || String(photo?.tags || '') === entry.tags) return photo;
        changed = true;
        albumCopiesTagged += 1;
        return { ...photo, tags: entry.tags };
      });
      if (changed) writes.push(() => tx.update(doc.ref, { photos: next, updatedAt: now }));
    });
    writes.forEach(write => write());
    return {
      ok: true,
      itemCount: entries.length,
      sourceDocumentsTouched,
      slotsTagged,
      albumCopiesTagged,
      assetKeys: entries.map(entry => entry.assetKey),
      meetingReadScope: meetingScope.complete ? 'owners' : 'full-scan',
      meetingDocumentsRead: meetingDocs.length,
    };
  });
}

// Point every slot showing `extra` at `keep` (same position, merged tags). Null when none matched.
function repointAssetSlots(data, extra, keep, tags) {
  const slots = slotsOf(data);
  const hits = slots.map((slot, index) => (sameFile(slot, extra) ? index : -1)).filter(index => index >= 0);
  if (!hits.length) return null;
  const imageUrls = slots.map(slot => slot.imageUrl);
  const thumbUrls = slots.map(slot => slot.thumbUrl);
  const imageTags = Array.isArray(data.imageTags) ? data.imageTags.slice() : [];
  while (imageTags.length < slots.length) imageTags.push('');
  const imageTagMap = { ...(data.imageTagMap && typeof data.imageTagMap === 'object' && !Array.isArray(data.imageTagMap) ? data.imageTagMap : {}) };
  hits.forEach(index => {
    delete imageTagMap[getPhotoAssetKey(slots[index].imageUrl || slots[index].thumbUrl)];
    imageUrls[index] = keep.imageUrl;
    thumbUrls[index] = keep.thumbUrl || keep.imageUrl;
    imageTags[index] = tags;
  });
  imageTagMap[getPhotoAssetKey(keep.imageUrl || keep.thumbUrl)] = tags;
  return {
    count: hits.length,
    patch: { imageUrls, thumbUrls, imageTags, imageTagMap, imageUrl: imageUrls[0] || null, thumbUrl: thumbUrls[0] || null },
  };
}

async function storageMd5(bucket, url) {
  const path = storagePathFromUrl(url);
  if (!path) return '';
  try { return (await bucket.file(path).getMetadata())[0]?.md5Hash || ''; } catch (_) { return ''; }
}

const MAX_MERGE_EXTRAS = 10;

// The 보관함 추천 "중복 사진 정리". Only copies whose Storage bytes equal the kept photo's
// (md5) are merged; anything else is reported back untouched. A memo write claims the push it
// would otherwise trigger (the kept URL looks like a newly added photo), so nobody is paged.
async function mergeAssets({ db, bucket, calendarDocId, keep, extras, tags, now = Date.now(), claimMemoPush = null }) {
  const root = db.collection('calendars').doc(calendarDocId);
  const keepKey = getPhotoAssetKey(keep?.imageUrl || keep?.thumbUrl);
  const list = (Array.isArray(extras) ? extras : []).slice(0, MAX_MERGE_EXTRAS);
  if (!keepKey || !list.length) return { ok: false, reason: 'invalid-asset' };
  const keepIndex = await root.collection('photoIndex').doc(keepKey).get();
  if (!keepIndex.exists) return { ok: false, reason: 'keep-not-indexed' };
  const keepFile = { imageUrl: keepIndex.data().full || keep.imageUrl, thumbUrl: keepIndex.data().thumb || keep.thumbUrl || keep.imageUrl };
  const keepMd5 = await storageMd5(bucket, keepFile.imageUrl);
  if (!keepMd5) return { ok: false, reason: 'keep-file-missing' };
  const value = sanitizeTagText(tags);
  const result = { ok: true, assetKey: keepKey, merged: [], notIdentical: [], slotsRepointed: 0, albumEntriesMoved: 0, commentsMoved: 0 };

  for (const extra of list) {
    const extraKey = getPhotoAssetKey(extra?.imageUrl || extra?.thumbUrl);
    if (!extraKey || extraKey === keepKey) continue;
    const extraIndex = await root.collection('photoIndex').doc(extraKey).get();
    if (!extraIndex.exists) { result.notIdentical.push(extraKey); continue; }
    const extraFile = { imageUrl: extraIndex.data().full || extra.imageUrl, thumbUrl: extraIndex.data().thumb || extra.thumbUrl };
    if (storagePathFromUrl(extraFile.imageUrl) !== storagePathFromUrl(keepFile.imageUrl)
      && await storageMd5(bucket, extraFile.imageUrl) !== keepMd5) {
      result.notIdentical.push(extraKey);
      continue;
    }
    const owners = ownerDocIds(extraIndex.data());
    (extra.messageId ? [extra.messageId] : []).forEach(id => owners.messages.add(id));
    (extra.memoId ? [extra.memoId] : []).forEach(id => owners.memos.add(id));
    const meetingScope = meetingOwnerScope(extraIndex.data());
    const comments = await root.collection('photoCommentItems').where('assetKey', '==', extraKey).get();
    await db.runTransaction(async tx => {
      const refs = [
        ...Array.from(owners.messages).map(id => root.collection('messages').doc(id)),
        ...Array.from(owners.memos).map(id => root.collection('memos').doc(id)),
      ];
      const [snaps, meetingRead] = await Promise.all([
        Promise.all(refs.map(ref => tx.get(ref))),
        readMeetingDocuments(tx, root, meetingScope),
      ]);
      const claims = [];
      const writes = [];
      let slots = 0;
      let album = 0;
      for (const snap of snaps) {
        if (!snap.exists) continue;
        const data = snap.data() || {};
        const repointed = repointAssetSlots(data, extraFile, keepFile, value);
        if (!repointed) continue;
        slots += repointed.count;
        if (snap.ref.parent.id === 'memos' && typeof claimMemoPush === 'function') {
          const claimKey = claimMemoPush(data, { ...data, ...repointed.patch }, snap.id);
          if (claimKey) claims.push(root.collection('push_delivery_claims').doc(claimKey));
        }
        writes.push(() => tx.update(snap.ref, { ...repointed.patch, updatedAt: now }));
      }
      meetingSnapshots(meetingRead).filter(doc => doc?.exists).forEach(doc => {
        const photos = Array.isArray(doc.data()?.photos) ? doc.data().photos : [];
        let moved = 0;
        const next = photos.map(photo => {
          if (!photo || typeof photo !== 'object' || !sameFile(photo, extraFile)) return photo;
          moved += 1;
          const patched = { ...photo, imageUrl: keepFile.imageUrl, thumbUrl: keepFile.thumbUrl, tags: value, updatedAt: now };
          if ('full' in photo) patched.full = keepFile.imageUrl;
          if ('url' in photo) patched.url = keepFile.imageUrl;
          if ('thumb' in photo) patched.thumb = keepFile.thumbUrl;
          return patched;
        });
        if (!moved) return;
        album += moved;
        writes.push(() => tx.update(doc.ref, { photos: next, updatedAt: now }));
      });
      const claimSnaps = await Promise.all(claims.map(ref => tx.get(ref)));
      claimSnaps.forEach(snap => {
        if (!snap.exists) writes.push(() => tx.set(snap.ref, { createdAt: now, claimKey: snap.id, reason: 'merge-duplicate-photos' }));
      });
      comments.docs.forEach(doc => writes.push(() => tx.update(doc.ref, { assetKey: keepKey, mergedFrom: extraKey })));
      writes.forEach(write => write());
      result.slotsRepointed += slots;
      result.albumEntriesMoved += album;
    });
    result.commentsMoved += comments.size;
    result.merged.push(extraKey);
  }
  // Every place the kept photo already appears carries the merged tags too.
  if (result.merged.length) await tagAsset({ db, calendarDocId, asset: keepFile, tags: value, now });
  return result;
}

// Every Storage path a value points at, wherever it sits (anniversary photos[], poster fields).
function collectStoragePaths(value, into, depth = 0) {
  if (depth > 6 || value == null) return;
  if (typeof value === 'string') {
    if (value.includes('/o/')) { const path = storagePathFromUrl(value); if (path) into.add(path); }
    return;
  }
  if (Array.isArray(value)) { value.forEach(item => collectStoragePaths(item, into, depth + 1)); return; }
  if (typeof value === 'object') Object.values(value).forEach(item => collectStoragePaths(item, into, depth + 1));
}

// Delete queued Storage objects whose grace period elapsed and that nothing in ANY calendar
// still references: no photoIndex row (messages, memos, albums), no anniversary photo and no
// culture item poster. Photos copied across calendars keep the source file's URL, and a
// re-upload (anniversaries and posters included) links the stored original, so checking only
// the queuing calendar's index deleted files other records still showed.
async function sweepStorageGc({ db, bucket, now = Date.now(), limit = 200 }) {
  const due = await db.collection('storageGc').where('deleteAfter', '<=', now).limit(limit).get();
  const result = { examined: due.size, deleted: 0, kept: 0 };
  if (!due.size) return result;
  const referenced = new Set();
  const calendars = await db.collection('calendars').listDocuments();
  for (const calendar of calendars) {
    const [index, anniversaries, cultureItems, calendarDoc] = await Promise.all([
      calendar.collection('photoIndex').get(),
      calendar.collection('anniversaries').get(),
      calendar.collection('customCultureItems').get(),
      calendar.get(),
    ]);
    index.docs.forEach(row => { const data = row.data() || {}; [data.full, data.thumb].forEach(url => { const p = storagePathFromUrl(url); if (p) referenced.add(p); }); });
    [...anniversaries.docs, ...cultureItems.docs].forEach(doc => collectStoragePaths(doc.data(), referenced));
    collectStoragePaths(calendarDoc.data()?.calendar?.anniversaries, referenced);
  }
  for (const doc of due.docs) {
    const { path } = doc.data() || {};
    if (referenced.has(path)) {
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
  ownerDocIds,
  meetingOwnerScope,
  mergeMeetingOwnerScopes,
  removeAssetSlots,
  rewriteMeetingPhotos,
  deleteAsset,
  tagAsset,
  bulkTagAssets,
  mergeAssets,
  repointAssetSlots,
  MAX_BULK_TAG_ITEMS,
  MAX_MERGE_EXTRAS,
  sweepStorageGc,
  collectStoragePaths,
};
