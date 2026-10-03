// Keep every existing trigger on Cloud Functions 1st gen while using the current SDK.
const functions = require('firebase-functions/v1');
// Firestore lives in Seoul (asia-northeast3) and every user is in Korea, so every function runs
// there: from us-central1 each Firestore read/write crossed the Pacific (a tag save took 1-2 s)
// and was billed as inter-region egress. During the move triggers and endpoints are deployed in
// both regions (both copies firing is safe: index rebuilds/recounts are idempotent and every
// push is claimed once via claimPushDelivery); scheduled jobs, which have no claim, run in Seoul
// only. docs/functions-seoul-migration.md has the step that drops the US copies.
const SEOUL_REGION = 'asia-northeast3';
const SEOUL_MOVE_REGIONS = [SEOUL_REGION, 'us-central1'];
const seoulFunctions = () => functions.region(...SEOUL_MOVE_REGIONS);
const { defineString, defineSecret } = require('firebase-functions/params');
const admin = require('firebase-admin');
const photoCommentItems = require('./photo-comment-items');
const crypto = require('crypto');
const webpush = require('web-push');
const KoreanLunarCalendar = require('korean-lunar-calendar');
const nodemailer = require('nodemailer');
const { pickCanonicalPhotoIndexTagState } = require('./photo-index-tag-contract');
const mediaCommands = require('./media-commands');
const { readImageGeo, pickPhotoIndexGeo } = require('./photo-index-geo');
const { buildKakaoLocationTags, appendLocationTags } = require('./photo-location-tags');
const { MAX_BATCH_ITEMS, MAX_TAGS, faceName, sanitizeAnalysisItem, sanitizeFaceItem, sanitizeSimilarGroups, stableAnalysisId, summarize } = require('./media-analysis');
const { buildBrief, isEmailDeliveryConfigured, isNaverSmtpConfigured } = require('./media-analysis-brief');
const { buildIntegrityReview, assetProjection, assetEdges, storagePath: mediaGraphStoragePath } = require('./media-graph');
const {
  decideMemoNotification,
  decideChatNotification,
  buildPushTargetUrl,
  decidePollNotifications,
  decideScheduleNotification,
  selectDeliverableSubscriptions
} = require('./push-notify-policy');
const { planSettlementReminders } = require('./settlement-reminders');

// A long-lived local worker needs a credential that is independent from the short admin PIN.
// It is bound only to the ingestion endpoint; neither the app nor unrelated functions receive it.
const MEDIA_WORKER_TOKEN = defineSecret('MOYEORA_MEDIA_WORKER_TOKEN');
// These remain Secret Manager values: an address by itself cannot deliver mail, and the API
// credential must never appear in the browser bundle, Git history, or a launchd plist.
const RESEND_API_KEY = defineSecret('RESEND_API_KEY');
const MEDIA_BRIEF_FROM = defineSecret('MEDIA_BRIEF_FROM');
const NAVER_SMTP_APP_PASSWORD = defineSecret('NAVER_SMTP_APP_PASSWORD');
const MEDIA_BRIEF_RECIPIENT = 'pyw213@naver.com';
const NAVER_SMTP_ACCOUNT = 'pyw213@naver.com';

admin.initializeApp();

function parseMeetingDateTags(value) {
  const text = typeof value === 'string' ? value : '';
  const dates = new Set();
  const re = /(^|[^\d])(\d{6})(?!\d)/g;
  let match;
  while ((match = re.exec(text))) {
    const token = match[2];
    const year = 2000 + Number(token.slice(0, 2));
    const month = Number(token.slice(2, 4));
    const day = Number(token.slice(4, 6));
    const candidate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const date = new Date(`${candidate}T00:00:00Z`);
    if (date.getUTCFullYear() === year && date.getUTCMonth() + 1 === month && date.getUTCDate() === day) dates.add(candidate);
  }
  return dates;
}

function getKstDateKey(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit'
  }).formatToParts(date);
  return `${parts.find(p => p.type === 'year').value}-${parts.find(p => p.type === 'month').value}-${parts.find(p => p.type === 'day').value}`;
}

function normalizeMeetingDateKey(value) {
  const text = String(value || '').trim();
  let match = text.match(/^(20\d{2})[-./](\d{1,2})[-./](\d{1,2})/);
  if (match) return `${match[1]}-${String(match[2]).padStart(2, '0')}-${String(match[3]).padStart(2, '0')}`;
  match = text.match(/^(\d{2})[.]?(\d{2})[.]?(\d{2})/);
  if (match) return `20${match[1]}-${match[2]}-${match[3]}`;
  return '';
}

function getMessageImageEntriesForIndex(message) {
  const urls = Array.isArray(message.imageUrls) && message.imageUrls.length
    ? message.imageUrls : (message.imageUrl ? [message.imageUrl] : []);
  const thumbs = Array.isArray(message.thumbUrls) && message.thumbUrls.length
    ? message.thumbUrls : (message.thumbUrl ? [message.thumbUrl] : []);
  const smalls = Array.isArray(message.smallThumbUrls) && message.smallThumbUrls.length
    ? message.smallThumbUrls : (message.smallThumbUrl ? [message.smallThumbUrl] : []);
  const tags = Array.isArray(message.imageTags) ? message.imageTags : [];
  const tagMap = message?.imageTagMap && typeof message.imageTagMap === 'object' && !Array.isArray(message.imageTagMap)
    ? message.imageTagMap
    : {};
  const count = Math.max(urls.length, thumbs.length);
  return Array.from({ length: count }, (_, index) => {
    const imageUrl = urls[index] || thumbs[index] || '';
    const thumbUrl = thumbs[index] || urls[index] || '';
    const smallThumbUrl = smalls[index] || '';
    const assetKey = getPhotoAssetKey(imageUrl || thumbUrl);
    // imageTagMap is keyed by the immutable Storage asset, while imageTags is kept as a
    // legacy positional mirror. Prefer the former so a deleted sibling can never move a tag
    // onto this photo during photoIndex rebuild.
    const hasAssetTag = assetKey && Object.prototype.hasOwnProperty.call(tagMap, assetKey);
    const hasEditableTags = hasAssetTag || Object.prototype.hasOwnProperty.call(tags, index);
    return {
      index,
      imageUrl,
      thumbUrl,
      smallThumbUrl,
      tags: hasAssetTag ? (tagMap[assetKey] || '') : (hasEditableTags ? (tags[index] || '') : (message.tags || '')),
      tagAuthority: hasEditableTags ? 'editable' : ''
    };
  }).filter(entry => entry.imageUrl || entry.thumbUrl);
}

function getDirectMediaTagKeyForIndex(url) {
  const normalized = normalizePhotoAssetUrl(url);
  let hash = 2166136261;
  const source = String(normalized || url || '');
  for (let index = 0; index < source.length; index += 1) {
    hash ^= source.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return `u_${(hash >>> 0).toString(36)}`;
}

function getDirectImageEntriesForIndex(message) {
  const text = String(message?.text || message?.content || message?.body || '');
  const urls = text.match(/https?:\/\/[^\s<>"']+/gi) || [];
  const imageExtensions = /\.(?:jpe?g|png|gif|webp|avif|bmp|svg|jfif|pjpeg|pjp|ico)$/i;
  const uploaded = new Set(getMessageImageEntriesForIndex(message)
    .flatMap(entry => [normalizePhotoAssetUrl(entry.imageUrl), normalizePhotoAssetUrl(entry.thumbUrl)]));
  const directTags = message?.directMediaTags && typeof message.directMediaTags === 'object' && !Array.isArray(message.directMediaTags)
    ? message.directMediaTags
    : {};
  const pathIsImage = url => {
    try {
      return imageExtensions.test(decodeURIComponent(new URL(url).pathname || ''));
    } catch (_) {
      return imageExtensions.test(String(url || '').split(/[?#]/)[0]);
    }
  };
  return Array.from(new Set(urls.map(url => url.replace(/[),.;!?]+$/, ''))))
    .filter(url => pathIsImage(url) && !uploaded.has(normalizePhotoAssetUrl(url)))
    .map((url, index) => {
      const tagKey = getDirectMediaTagKeyForIndex(url);
      const normalizedUrl = normalizePhotoAssetUrl(url);
      const tagKeys = [tagKey, url, normalizedUrl];
      const storedKey = tagKeys.find(key => Object.prototype.hasOwnProperty.call(directTags, key));
      const tags = storedKey ? String(directTags[storedKey] || '') : '';
      return { index, imageUrl: url, thumbUrl: url, tags, directMediaUrl: url, tagAuthority: storedKey ? 'editable' : '' };
    });
}

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

function getDirectMediaLegacyKey(value) {
  const source = String(value || '');
  let hash = 2166136261;
  for (let index = 0; index < source.length; index += 1) {
    hash ^= source.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return `chat:url:u_${(hash >>> 0).toString(36)}`;
}

function getPhotoAssetKey(value) {
  const normalized = normalizePhotoAssetUrl(value);
  return normalized ? `asset:v1:${hashPhotoAssetIdentity(normalized)}` : '';
}

function getPhotoIndexEntries(sourceType, sourceId, data) {
  if (!data || typeof data !== 'object') return [];
  const entries = [];
  const push = (photo, index, context = {}) => {
    const full = String(photo?.imageUrl || photo?.full || photo?.url || photo?.src || photo?.thumbUrl || photo?.thumb || '').trim();
    const thumb = String(photo?.thumbUrl || photo?.thumb || photo?.thumbnailUrl || full).trim();
    const smallThumb = String(photo?.smallThumbUrl || photo?.smallThumb || '').trim();
    const assetKey = getPhotoAssetKey(full || thumb);
    if (!assetKey) return;
    const source = sourceType === 'message'
      ? (['chat', 'gallery', 'meeting'].includes(data.uploadSource) ? data.uploadSource : 'chat')
      : sourceType;
    // Memo lightbox tags key off messageId === memo.id (same convention as MemoCard).
    // Previously memo index rows left messageId empty, so gallery→lightbox tag save was a no-op.
    const messageId = (sourceType === 'message' || sourceType === 'memo') ? sourceId : '';
    const imageIndex = Number.isInteger(photo?.index) ? photo.index : index;
    // Per-photo GPS written by the client after upload (src/core/photo-geo.js), keyed like
    // imageTagMap. Copied onto the index row so 보관함 > 장소 can file the photo by distance.
    const geo = readImageGeo(data, assetKey);
    entries.push({
      ...(geo || {}),
      assetKey,
      full,
      thumb,
      ...(smallThumb ? { smallThumb } : {}),
      timestamp: Number(photo?.createdAt || photo?.updatedAt || data.timestamp || data.updatedAt || data.createdAt || data.confirmedAt || 0),
      tags: String(Object.prototype.hasOwnProperty.call(photo || {}, 'tags')
        ? (photo.tags || '')
        : ((Array.isArray(data.imageTags) ? data.imageTags[imageIndex] : '') || '')),
      tagAuthority: String(photo?.tagAuthority || (
        sourceType === 'meeting' && Object.prototype.hasOwnProperty.call(photo || {}, 'tags') ? 'editable' : ''
      )),
      text: String(data.text || data.content || data.body || context.text || '').slice(0, 1000),
      participantId: String(data.participantId || ''),
      source,
      messageId,
      imageIndex,
      // A date remains the legacy document key, but the graph carries a stable meetingId so
      // photos/expenses/memos can keep their relationship when the scheduled date is edited.
      meetingId: String(context.meetingId || data.meetingId || photo?.meetingId || ''),
      meetingDate: String(context.meetingDate || photo?.meetingDate || ''),
      photoId: String(photo?.id || photo?.photoId || ''),
      sourceMessageId: String(photo?.sourceMessageId || ''),
      sourceImageIndex: Number.isInteger(photo?.sourceImageIndex) ? photo.sourceImageIndex : 0,
      directMediaUrl: String(context.directMediaUrl || photo?.directMediaUrl || ''),
      legacyKeys: Array.from(new Set([
        messageId ? `${source}:${messageId}:${imageIndex}` : '',
        messageId ? `chat:${messageId}:${imageIndex}` : '',
        photo?.sourceMessageId ? `chat:${photo.sourceMessageId}:${Number(photo.sourceImageIndex) || 0}` : '',
        context.meetingDate && photo?.id ? `meeting:${context.meetingDate}:${photo.id}` : '',
        full ? getDirectMediaLegacyKey(full) : '',
        (context.directMediaUrl || photo?.directMediaUrl) ? getDirectMediaLegacyKey(context.directMediaUrl || photo.directMediaUrl) : ''
      ].filter(Boolean))).slice(0, 12),
      sourceOwner: `${sourceType}:${sourceId}:${imageIndex}`.slice(0, 240),
      updatedAt: Date.now()
    });
  };

  if (sourceType === 'message' || sourceType === 'memo') {
    getMessageImageEntriesForIndex(data).forEach((photo, index) => push(photo, index));
    getDirectImageEntriesForIndex(data).forEach((photo, index) => push(photo, index, { directMediaUrl: photo.directMediaUrl }));
  } else if (sourceType === 'meeting') {
    (Array.isArray(data.photos) ? data.photos : []).forEach((photo, index) => push(photo, index, {
      meetingId: data.meetingId || '', meetingDate: data.date || sourceId, text: `${data.date || sourceId} 일정 사진`
    }));
  } else if (sourceType === 'anniversary') {
    // Content posters (movie/sports anniversaries) stay on the calendar/컨텐츠 surfaces.
    // Keep returning [] so sync/rebuild strip any legacy anniversary-owned photoIndex rows.
    return [];
  }
  return entries;
}

// Keep the new asset-keyed tag map bounded to photos that still exist on this document.  The
// positional imageTags array remains for legacy clients, but it is only a mirror; this map is
// what makes a tag survive deletion/reordering of neighbouring photos.
function reconcileImageTagMapForIndex(message, tagMap = null) {
  const raw = tagMap == null ? message?.imageTagMap : tagMap;
  const source = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {};
  const next = {};
  getMessageImageEntriesForIndex({ ...(message || {}), imageTagMap: source }).forEach(entry => {
    const assetKey = getPhotoAssetKey(entry.imageUrl || entry.thumbUrl);
    if (!assetKey || Object.prototype.hasOwnProperty.call(next, assetKey) || Object.keys(next).length >= 50) return;
    const hasAssetTag = Object.prototype.hasOwnProperty.call(source, assetKey);
    const legacyTags = Array.isArray(message?.imageTags) ? message.imageTags : [];
    const hasLegacyTag = Object.prototype.hasOwnProperty.call(legacyTags, entry.index);
    if (!hasAssetTag && !hasLegacyTag) return;
    next[assetKey] = String(hasAssetTag ? source[assetKey] : legacyTags[entry.index] || '').slice(0, 640);
  });
  return next;
}

function photoIndexOwnerRank(owner) {
  const sourceOwner = String(owner?.sourceOwner || '');
  // A meeting upload exists both as its original message and as a confirmedMeeting album copy.
  // Both expose source="meeting", but only the message owns the editable imageTags array.
  // Rank the original document first so the server-side gallery cache never publishes the
  // older/partial tags from the album copy after the source message has been updated.
  if (sourceOwner.startsWith('message:')) {
    if (owner?.source === 'gallery') return 0;
    if (owner?.source === 'chat') return 1;
    return 3;
  }
  if (sourceOwner.startsWith('memo:')) return 2;
  if (sourceOwner.startsWith('meeting:')) return 4;
  return 5;
}

function selectPhotoIndexOwner(owners) {
  return (owners || []).slice().sort((a, b) => photoIndexOwnerRank(a) - photoIndexOwnerRank(b)
    || Number(b.timestamp || 0) - Number(a.timestamp || 0))[0] || null;
}

// The client checks this tiny, server-only summary before accepting an IndexedDB photo-index
// cache entry.  Increment once per changed source document (rather than once per photo row), so
// a 200-photo upload produces four source-record bumps, not hundreds of contested writes.
async function bumpPhotoIndexRevision(calendarDocId) {
  if (!calendarDocId) return;
  const summaryRef = admin.firestore()
    .collection('calendars').doc(calendarDocId)
    .collection('photoIndexMeta').doc('summary');
  await summaryRef.set({
    revision: admin.firestore.FieldValue.increment(1),
    updatedAt: Date.now()
  }, { merge: true });
}

// The migration runs in dual-write mode: the legacy document remains compatible with every
// installed client, while future writes continuously refresh the normalized Asset/edge graph.
// It is a projection today; its immutable asset key and owner edge are what let us later switch
// reads without another positional-tag migration.
async function syncAssetGraphProjection(calendarDocId, assetKeys) {
  const keys = Array.from(new Set(Array.from(assetKeys || []).filter(Boolean))).slice(0, 80);
  if (!calendarDocId || !keys.length) return;
  const db = admin.firestore();
  const root = db.collection('calendars').doc(calendarDocId);
  const rows = await db.getAll(...keys.map(key => root.collection('photoIndex').doc(key)));
  const calendarId = calendarDocId.startsWith('cal_') ? calendarDocId.slice(4) : calendarDocId;
  const writes = [];
  rows.forEach(snapshot => {
    if (!snapshot.exists) return;
    const row = { assetKey: snapshot.id, ...(snapshot.data() || {}) };
    const asset = assetProjection(row, { calendarId });
    writes.push({ ref: root.collection('assets').doc(asset.assetId), data: { ...asset, updatedAt: Date.now() } });
    assetEdges(row).slice(0, 12).forEach(edge => {
      writes.push({ ref: root.collection('assetEdges').doc(edge.id), data: edge });
    });
  });
  for (let offset = 0; offset < writes.length; offset += 350) {
    const batch = db.batch();
    writes.slice(offset, offset + 350).forEach(write => batch.set(write.ref, write.data, { merge: true }));
    await batch.commit();
  }
}

async function rebuildPhotoIndexForCalendarAdmin(calendarId, apply = false) {
  const db = admin.firestore();
  const root = db.collection('calendars').doc(`cal_${calendarId}`);
  const collectionNames = ['messages', 'memos', 'confirmedMeetings', 'anniversaries', 'photoCommentItems', 'photoIndex'];
  const snapshots = await Promise.all(collectionNames.map(collection => root.collection(collection).get()));
  const byName = Object.fromEntries(collectionNames.map((name, index) => [name, snapshots[index]]));
  // Live comments per photo, from the one-document-per-comment store (photo-comment-items.js).
  const commentCounts = new Map();
  byName.photoCommentItems.docs.forEach(doc => {
    const data = doc.data() || {};
    if (!data.assetKey || data.deletedAt != null) return;
    commentCounts.set(data.assetKey, (commentCounts.get(data.assetKey) || 0) + 1);
  });
  const ownersByAsset = new Map();
  const addOwners = (sourceType, snapshot, idField = null) => snapshot.docs.forEach(doc => {
    getPhotoIndexEntries(sourceType, idField ? String(doc.data()?.[idField] || doc.id) : doc.id, doc.data() || {}).forEach(entry => {
      const owners = ownersByAsset.get(entry.assetKey) || [];
      if (!owners.some(owner => owner.sourceOwner === entry.sourceOwner)) owners.push(entry);
      // Keep the complete set while rebuilding. The persisted row keeps a bounded owner preview,
      // but its completeness marker lets mutation commands avoid reading unrelated meetings.
      // Older rows without this marker deliberately retain the safe full-scan behaviour.
      ownersByAsset.set(entry.assetKey, owners);
    });
  });
  addOwners('message', byName.messages);
  addOwners('memo', byName.memos);
  addOwners('meeting', byName.confirmedMeetings);
  addOwners('anniversary', byName.anniversaries);

  const rows = [];
  let dataUrlBytes = 0;
  let dataUrlRows = 0;
  ownersByAsset.forEach((allOwners, assetKey) => {
    const owners = allOwners.slice().sort((a, b) => photoIndexOwnerRank(a) - photoIndexOwnerRank(b)
      || Number(b.timestamp || 0) - Number(a.timestamp || 0));
    const ownerCount = owners.length;
    const ownerListComplete = ownerCount <= 12;
    const persistedOwners = owners.slice(0, 12);
    const selected = selectPhotoIndexOwner(persistedOwners);
    if (!selected) return;
    const legacyKeys = Array.from(new Set(persistedOwners.flatMap(owner => owner.legacyKeys || []))).slice(0, 40);
    const commentCount = Math.max(0, ...[assetKey, ...legacyKeys].map(key => Number(commentCounts.get(key) || 0)));
    if (String(selected.full || '').startsWith('data:') || String(selected.thumb || '').startsWith('data:')) {
      dataUrlRows += 1;
      dataUrlBytes += String(selected.full || '').length + String(selected.thumb || '').length;
    }
    const tagState = pickCanonicalPhotoIndexTagState(persistedOwners, selected.tags, selected.sourceOwner);
    rows.push({
      ...selected,
      assetKey,
      legacyKeys,
      owners: persistedOwners,
      ownerCount,
      ownerListComplete,
      commentCount,
      tags: tagState.tags,
      tagCacheVersion: 2,
      tagSourceOwner: tagState.sourceOwner,
      tagAuthoritative: tagState.authoritative,
      updatedAt: Date.now()
    });
  });
  rows.sort((a, b) => Number(b.timestamp || 0) - Number(a.timestamp || 0));
  const nextKeys = new Set(rows.map(row => row.assetKey));
  const staleRefs = byName.photoIndex.docs.filter(doc => !nextKeys.has(doc.id)).map(doc => doc.ref);

  if (apply) {
    const operations = [
      ...rows.map(row => ({ type: 'set', ref: root.collection('photoIndex').doc(row.assetKey), row })),
      ...staleRefs.map(ref => ({ type: 'delete', ref }))
    ];
    for (let offset = 0; offset < operations.length; offset += 350) {
      const batch = db.batch();
      operations.slice(offset, offset + 350).forEach(operation => {
        if (operation.type === 'delete') batch.delete(operation.ref);
        else batch.set(operation.ref, operation.row);
      });
      await batch.commit();
    }
    if (operations.length) await bumpPhotoIndexRevision(`cal_${calendarId}`);
  }
  const bySource = rows.reduce((acc, row) => {
    const key = String(row?.source || 'unknown');
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  // Anniversary/content posters are intentionally not re-indexed; any leftover anniversary
  // rows are counted in staleRows and deleted on apply so gallery totals match chat∪memo∪meeting.
  const galleryIndexedPhotos = rows.filter(row => String(row?.source || '') !== 'anniversary').length;
  return {
    calendarId,
    mode: apply ? 'applied' : 'dry-run',
    sourceDocuments: Object.fromEntries(collectionNames.slice(0, 5).map(name => [name, byName[name].size])),
    indexedPhotos: rows.length,
    galleryIndexedPhotos,
    bySource,
    commentsMatched: rows.filter(row => row.commentCount > 0).length,
    existingRows: byName.photoIndex.size,
    staleRows: staleRefs.length,
    dataUrlRows,
    dataUrlBytes
  };
}

// Concurrent events on one document contend for the same rows. A row transaction that gives up
// is retried here with backoff (a deploy-level failurePolicy would need `firebase deploy --force`,
// which this repo avoids); anything still failing is left to the nightly rebuild.
const PHOTO_INDEX_ROW_ATTEMPTS = 4;
async function withRowRetry(run) {
  for (let attempt = 1; ; attempt += 1) {
    try {
      return await run();
    } catch (err) {
      if (attempt >= PHOTO_INDEX_ROW_ATTEMPTS) throw err;
      await new Promise(resolve => setTimeout(resolve, 200 * (2 ** attempt) + Math.floor(Math.random() * 200)));
    }
  }
}

async function syncCanonicalPhotoIndex(change, context, sourceType, idParam) {
  const db = admin.firestore();
  const indexRef = db.collection('calendars').doc(context.params.calendarDocId).collection('photoIndex');
  const sourceId = context.params[idParam];
  const before = change.before.exists ? getPhotoIndexEntries(sourceType, sourceId, change.before.data() || {}) : [];
  const after = change.after.exists ? getPhotoIndexEntries(sourceType, sourceId, change.after.data() || {}) : [];
  // Events arrive unordered and a retried one may be old, so this document's owners are taken
  // from its CURRENT state, not from the event's `after`: whatever order rapid edits (a bulk tag,
  // a duplicate merge) are processed in, every row converges on what the document shows now.
  // The event's before/after only widen the set of rows to touch.
  const currentSnap = await change.after.ref.get();
  const current = currentSnap.exists ? getPhotoIndexEntries(sourceType, sourceId, currentSnap.data() || {}) : [];
  const ownerRoot = `${sourceType}:${sourceId}:`;
  const afterByKey = new Map(current.map(entry => [entry.assetKey, entry]));
  const touchedKeys = new Set([...before.map(entry => entry.assetKey), ...after.map(entry => entry.assetKey), ...afterByKey.keys()]);
  // The same physical asset may be referenced by chat, a meeting and a memo. Keeping bounded
  // owners inside the canonical row prevents deleting one source from erasing the remaining
  // references. Each transaction touches one row, so simultaneous edits cannot lose an owner.
  if (!touchedKeys.size) return false;
  await Promise.all(Array.from(touchedKeys).map(assetKey => withRowRetry(() => db.runTransaction(async transaction => {
    const ref = indexRef.doc(assetKey);
    const snapshot = await transaction.get(ref);
    const existing = snapshot.exists ? (snapshot.data() || {}) : {};
    const replacement = afterByKey.get(assetKey);
    // A new row starts from the photo's live comment count (photo-comment-items.js summary).
    const commentSnapshot = !snapshot.exists && replacement
      ? await transaction.get(db.collection('calendars').doc(context.params.calendarDocId)
        .collection(photoCommentItems.SUMMARY).doc(photoCommentItems.SUMMARY_DOC))
      : null;
    let owners = Array.isArray(existing.owners) ? existing.owners.filter(owner => owner && typeof owner === 'object') : [];
    // A missing marker means this is a pre-completeness row. Never guess that its bounded owner
    // preview is exhaustive: media mutations retain their correctness-first full meeting scan
    // until the nightly/admin rebuild stamps a complete projection.
    const ownerListWasComplete = !snapshot.exists || existing.ownerListComplete === true;
    if (!owners.length && existing.sourceOwner && existing.full) owners = [{ ...existing }];
    owners = owners.filter(owner => !String(owner.sourceOwner || '').startsWith(ownerRoot));
    if (replacement) owners.push(replacement);
    owners = owners
      .filter((owner, index, list) => list.findIndex(candidate => candidate.sourceOwner === owner.sourceOwner) === index)
      .sort((a, b) => photoIndexOwnerRank(a) - photoIndexOwnerRank(b) || Number(b.timestamp || 0) - Number(a.timestamp || 0));
    if (!owners.length) {
      transaction.delete(ref);
      return;
    }
    const ownerCount = ownerListWasComplete ? owners.length : Math.max(Number(existing.ownerCount) || 0, owners.length);
    const ownerListComplete = ownerListWasComplete && ownerCount <= 12;
    const persistedOwners = owners.slice(0, 12);
    const selected = persistedOwners[0];
    const legacyKeys = Array.from(new Set(persistedOwners.flatMap(owner => owner.legacyKeys || []))).slice(0, 40);
    const existingComments = commentSnapshot?.exists
      ? Math.max(0, Number(commentSnapshot.data()?.counts?.[assetKey]) || 0) : 0;
    const tagState = pickCanonicalPhotoIndexTagState(persistedOwners, selected.tags, selected.sourceOwner);
    const geo = pickPhotoIndexGeo(persistedOwners, existing);
    transaction.set(ref, {
      ...selected,
      ...geo,
      assetKey,
      legacyKeys,
      owners: persistedOwners,
      ownerCount,
      ownerListComplete,
      commentCount: Math.max(0, Number(existing.commentCount || 0), existingComments),
      tags: tagState.tags,
      tagCacheVersion: 2,
      tagSourceOwner: tagState.sourceOwner,
      tagAuthoritative: tagState.authoritative,
      updatedAt: Date.now()
    });
  }))));
  await bumpPhotoIndexRevision(context.params.calendarDocId);
  // Never wait for client reads to regenerate this graph; the canonical source trigger owns
  // the dual-write so tag/photo edits stay tied to the same immutable asset key.
  await syncAssetGraphProjection(context.params.calendarDocId, touchedKeys);
  return true;
}

exports.onMessagePhotoIndexWrite = seoulFunctions().firestore
  .document('calendars/{calendarDocId}/messages/{messageId}')
  .onWrite((change, context) => syncCanonicalPhotoIndex(change, context, 'message', 'messageId'));

exports.onMemoPhotoIndexWrite = seoulFunctions().firestore
  .document('calendars/{calendarDocId}/memos/{memoId}')
  .onWrite((change, context) => syncCanonicalPhotoIndex(change, context, 'memo', 'memoId'));

exports.onMeetingPhotoIndexWrite = seoulFunctions().firestore
  .document('calendars/{calendarDocId}/confirmedMeetings/{dateId}')
  .onWrite((change, context) => syncCanonicalPhotoIndex(change, context, 'meeting', 'dateId'));

// Existing meeting document ids are dates for backwards compatibility. Give each record a
// stable opaque identity once, without rewriting the date or any legacy field. The guard avoids
// a trigger loop and makes the migration safe to run alongside old installed clients.
exports.ensureMeetingIdentity = seoulFunctions().firestore
  .document('calendars/{calendarDocId}/confirmedMeetings/{dateId}')
  .onWrite(async change => {
    if (!change.after.exists || String(change.after.data()?.meetingId || '')) return null;
    await change.after.ref.set({ meetingId: `meeting:${crypto.randomUUID()}`, meetingIdentityVersion: 1 }, { merge: true });
    return null;
  });

exports.onAnniversaryPhotoIndexWrite = seoulFunctions().firestore
  .document('calendars/{calendarDocId}/anniversaries/{anniversaryId}')
  .onWrite((change, context) => syncCanonicalPhotoIndex(change, context, 'anniversary', 'anniversaryId'));

// Photo comments v2 (photo-comment-items.js): one document per comment; this trigger keeps the
// photo's count in the summary doc (thumbnail badges) and on its photoIndex row.
// A newly written photo comment also goes out as a 댓글 notification (channel: comment), never
// to its author and never for comments copied in by the migration.
exports.onPhotoCommentItemWrite = seoulFunctions().runWith({ secrets: ['VAPID_PRIVATE_KEY'] }).firestore
  .document('calendars/{calendarDocId}/photoCommentItems/{commentId}')
  .onWrite(async (change, context) => {
    const before = change.before.exists ? change.before.data() : null;
    const after = change.after.exists ? change.after.data() : null;
    const keys = photoCommentItems.assetKeysToRecount(before, after);
    for (const key of keys) {
      await photoCommentItems.recountAsset(admin.firestore(), admin, context.params.calendarDocId, key);
    }
    if (before || !after || after.migratedFrom || after.deletedAt != null) return null;
    const calendarDocId = context.params.calendarDocId;
    const claimKey = `photo-comment:${context.params.commentId}`;
    if (!(await claimPushDelivery(calendarDocId, claimKey))) return null;
    const calendarSnap = await admin.firestore().collection('calendars').doc(calendarDocId).get();
    const participants = ((calendarSnap.data() || {}).calendar || {}).participants || [];
    const named = participants.find(person => person && person.id === after.participantId);
    const author = (named && named.name) || '참여자';
    await broadcastCalendarPush(calendarDocId, {
      title: `${author}의 사진 댓글`,
      body: String(after.text || '').slice(0, 120),
      url: buildPushTargetUrl(calendarDocId, { view: 'gallery' }),
      tag: `photo-comment-${calendarDocId}-${context.params.commentId}`,
      renotify: false
    }, { skipParticipantId: after.participantId || null, channel: 'comment' });
    return null;
  });

// The old photoComments/{key} arrays are no longer the source of truth. An app that has not
// updated yet may still write one; copy any comment it adds into photoCommentItems (create-only,
// so its stale copy of the thread can never undo an edit or delete made in the new app).
exports.onPhotoCommentIndexWrite = seoulFunctions().firestore
  .document('calendars/{calendarDocId}/photoComments/{photoKey}')
  .onWrite(async (change, context) => {
    if (!change.after.exists) return null;
    const comments = change.after.data()?.comments;
    await photoCommentItems.mirrorLegacyThread(admin.firestore(), context.params.calendarDocId, context.params.photoKey, comments);
    return null;
  });

// The client can only arrayUnion its own calendarId into sharedFiles/{hash} and
// linkPreviews/{urlHash} (see firestore.rules -- `list` is disabled on both collections, so a
// client can never scan them for cross-calendar usage). This trigger recomputes a plain
// `calendarCount` field server-side whenever `calendarIds` changes, so the admin dashboard's
// 데이터풀 tab (listSharedDataPool below) can query `calendarCount >= 2` -- Firestore has no
// "array length" query operator, so a denormalized count field is the simplest way to make that
// filterable. Guarded against re-triggering itself: it only writes when the count actually changed.
function makeCalendarCountSyncTrigger() {
  return async (change) => {
    if (!change.after.exists) return null;
    const data = change.after.data() || {};
    const count = Array.isArray(data.calendarIds) ? new Set(data.calendarIds).size : 0;
    if (Number(data.calendarCount) === count) return null;
    return change.after.ref.set({ calendarCount: count }, { merge: true });
  };
}

exports.onSharedFileWrite = seoulFunctions().firestore
  .document('sharedFiles/{hash}')
  .onWrite(makeCalendarCountSyncTrigger());

exports.onLinkPreviewWrite = seoulFunctions().firestore
  .document('linkPreviews/{urlHash}')
  .onWrite(makeCalendarCountSyncTrigger());

async function syncMeetingPhotoIndex(change, context) {
  const db = admin.firestore();
  const calendarRef = db.collection('calendars').doc(context.params.calendarDocId);
  const indexRef = calendarRef.collection('meetingPhotoIndex');
  const sourceMessageId = context.params.messageId;
  const oldSnap = await indexRef.where('sourceMessageId', '==', sourceMessageId).get();
  const batch = db.batch();
  oldSnap.forEach(doc => batch.delete(doc.ref));
  if (change.after.exists) {
    const message = change.after.data() || {};
    const entries = getMessageImageEntriesForIndex(message);
    entries.forEach(entry => {
      const dates = parseMeetingDateTags(entry.tags);
      dates.forEach(date => {
        const docId = `${date}_${sourceMessageId}_${entry.index}`.replace(/[^A-Za-z0-9_-]/g, '_');
        batch.set(indexRef.doc(docId), {
          date,
          sourceMessageId,
          sourceImageIndex: entry.index,
          imageUrl: entry.imageUrl,
          thumbUrl: entry.thumbUrl,
          tags: entry.tags,
          createdAt: Number(message.timestamp) || 0,
          updatedAt: Date.now()
        });
      });
    });
  }
  await batch.commit();
}

exports.onMessageMeetingPhotoIndexWrite = seoulFunctions().firestore
  .document('calendars/{calendarDocId}/messages/{messageId}')
  .onWrite((change, context) => syncMeetingPhotoIndex(change, context));

// Public VAPID key is meant to be public (also embedded client-side in index.html, where the
// browser's pushManager.subscribe() needs it) -- only the private key is a secret. Configuring
// web-push happens lazily inside ensureVapidConfigured() rather than here at module scope,
// because this file's module-level code runs once per cold start for EVERY exported function
// below, but Secret Manager only injects VAPID_PRIVATE_KEY into the process.env of the specific
// functions that declare it (onMessageCreate, sendAnniversaryReminders via runWith({secrets})) --
// calling webpush.setVapidDetails with an undefined private key at module load would throw and
// break cold starts for unrelated functions like kakaoLocalSearchProxy that never send push.
const publicVapidKey = 'BNk35C4KAQy9JdQJ8uzLuzDAc7zUBCznmPFJc194fcWqEtD3EZTnj03ZCwE_P2SxwVILZnDzHsj2UZxIQ0Q-huU';
let vapidConfigured = false;
function ensureVapidConfigured() {
  if (vapidConfigured) return;
  webpush.setVapidDetails('mailto:partyboat1111@gmail.com', publicVapidKey, process.env.VAPID_PRIVATE_KEY);
  vapidConfigured = true;
}



// One successful claim per visible revision. A second trigger delivery (Functions
// are at-least-once) or a maintenance rewrite of the same content must not send
// again. Fail closed: a claim outage skips the push instead of repeating a storm.
async function claimPushDelivery(calendarDocId, claimKey) {
  if (!calendarDocId || !claimKey) return false;
  const ref = admin.firestore()
    .collection('calendars').doc(calendarDocId)
    .collection('push_delivery_claims').doc(String(claimKey));
  try {
    return await admin.firestore().runTransaction(async tx => {
      const snap = await tx.get(ref);
      if (snap.exists) return false;
      tx.set(ref, { createdAt: Date.now(), claimKey: String(claimKey) });
      return true;
    });
  } catch (err) {
    console.error('claimPushDelivery failed; skipping push to avoid a duplicate storm', claimKey, err);
    return false;
  }
}

/** Shared push broadcast for a calendar's push_subscriptions */
async function broadcastCalendarPush(calendarDocId, payloadObj, options = {}) {
  ensureVapidConfigured();
  const db = admin.firestore();
  const skipParticipantId = options.skipParticipantId || null;
  const channel = options.channel || 'chat'; // chat | comment | memo | poll | schedule
  // Cap fan-out so a compromised/abnormally large subscription set cannot create an
  // unbounded push-send and Firestore-write bill in one trigger invocation.
  const subSnap = await db.collection('calendars').doc(calendarDocId).collection('push_subscriptions').limit(500).get();
  if (subSnap.empty) {
    console.log('No push subscriptions for', calendarDocId);
    return { sent: 0 };
  }
  const payload = JSON.stringify(payloadObj);
  const promises = [];
  const result = {
    total: subSnap.size,
    sent: 0,
    skippedSender: 0,
    skippedChannel: 0,
    skippedInvalid: 0,
    skippedDuplicate: 0,
    failed: 0
  };
  const candidates = [];
  subSnap.forEach(doc => {
    const data = doc.data() || {};
    if (skipParticipantId && data.participantId === skipParticipantId) {
      result.skippedSender += 1;
      return;
    }
    // Channel filter: legacy docs without channels → chat only
    const ch = data.channels;
    if (ch && typeof ch === 'object') {
      if (ch[channel] === false) { result.skippedChannel += 1; return; }
    } else if (channel !== 'chat') {
      result.skippedChannel += 1;
      return;
    }
    if (!data.endpoint || !data.keys?.auth || !data.keys?.p256dh) {
      result.skippedInvalid += 1;
      console.warn('Push subscription missing endpoint or keys', doc.id, channel);
      return;
    }
    candidates.push({
      doc,
      endpoint: data.endpoint,
      deviceId: data.deviceId,
      lastSeenAt: data.lastSeenAt,
      updatedAt: data.updatedAt,
      createdAt: data.createdAt,
      keys: data.keys
    });
  });
  const selected = selectDeliverableSubscriptions(candidates);
  result.skippedDuplicate = candidates.length - selected.length;
  selected.forEach(entry => {
    const doc = entry.doc;
    const pushSubscription = {
      endpoint: entry.endpoint,
      keys: { auth: entry.keys && entry.keys.auth, p256dh: entry.keys && entry.keys.p256dh }
    };
    const sentAt = Date.now();
    const p = webpush.sendNotification(pushSubscription, payload, { urgency: 'high' })
      .then(() => {
        console.log('Push ok', doc.id, channel);
        result.sent += 1;
        return doc.ref.set({
          lastPushAt: sentAt,
          lastPushStatus: 'sent',
          lastPushChannel: channel,
          lastPushError: null
        }, { merge: true });
      })
      .catch(err => {
        console.error('Push fail', doc.id, err && err.statusCode);
        result.failed += 1;
        const status = err && err.statusCode ? `http-${err.statusCode}` : 'send-failed';
        const record = doc.ref.set({
          lastPushAt: sentAt,
          lastPushStatus: status,
          lastPushChannel: channel,
          lastPushError: String(err && err.message || 'unknown').slice(0, 500)
        }, { merge: true }).catch(() => {});
        if (err.statusCode === 410 || err.statusCode === 404 || err.statusCode === 400 || err.statusCode === 403) {
          return record.then(() => doc.ref.delete());
        }
        return record;
      });
    promises.push(p);
  });
  await Promise.all(promises);
  console.log('Push broadcast result', JSON.stringify({ calendarDocId, channel, ...result }));
  return result;
}


exports.onMessageCreate = seoulFunctions().runWith({ secrets: ['VAPID_PRIVATE_KEY'] }).firestore
  .document('calendars/{calendarDocId}/messages/{messageId}')
  .onCreate(async (snapshot, context) => {
    ensureVapidConfigured();
    const calendarDocId = context.params.calendarDocId;
    const message = snapshot.data();

    // 일정 레이어팝업 사진탭('meeting')/갤러리 페이지('gallery')에서 올린 사진은 메시지
    // 문서에 저장되더라도 채팅 활동으로 취급하지 않는다. 채팅방 노출과 채팅 푸시는
    // 모두 uploadSource 기준으로 제외한다.
    const decision = decideChatNotification(message, { messageId: context.params.messageId });
    if (!decision) {
      console.log('Skipping push for non-chat or empty message:', message && message.uploadSource);
      return;
    }
    const claimed = await claimPushDelivery(calendarDocId, decision.claimKey);
    if (!claimed) {
      console.log('Skipping duplicate chat push', decision.claimKey);
      return;
    }

    const db = admin.firestore();

    // 1. Get calendar details to retrieve title and participants
    const calendarSnap = await db.collection('calendars').doc(calendarDocId).get();
    if (!calendarSnap.exists) {
      console.log('Calendar does not exist:', calendarDocId);
      return;
    }
    const calendarData = calendarSnap.data().calendar || {};
    const calendarTitle = calendarData.title || '모여라 캘린더';
    
    // 2. Resolve sender name
    const senderId = message.participantId;
    const participants = calendarData.participants || [];
    const sender = participants.find(p => p.id === senderId) || { name: '알수없음' };
    const senderName = sender.name;
    
    const bodyText = message.text?.trim() || (message.imageUrls?.length || message.imageUrl ? '사진을 보냈습니다' : (Array.isArray(message.fileAttachments) && message.fileAttachments.length ? '파일을 보냈습니다' : '새 메시지가 도착했습니다'));
    const delivery = await broadcastCalendarPush(calendarDocId, {
      title: senderName || calendarTitle,
      body: bodyText,
      url: buildPushTargetUrl(calendarDocId, { view: 'chat', msg: context.params.messageId }),
      tag: `chat-${calendarDocId}-${context.params.messageId}`,
      renotify: false
    }, { skipParticipantId: decision.skipParticipantId || senderId, channel: 'chat' });
    console.log('Chat push dispatch', JSON.stringify({
      calendarDocId,
      messageId: context.params.messageId,
      senderId,
      ...delivery
    }));
  });

// Mirrors the client's getAnniversariesForDate matching logic (index.html) so a lunar birthday
// notifies on the same day the app itself would highlight it. Lunar anniversaries store only a
// month/day (no year) -- reinterpreting them against THIS year as the lunar year and converting
// to solar is the same equivalence trick the client uses, rather than converting today's solar
// date to lunar (either direction works; matching the client's exact approach keeps the two
// unambiguously in sync).
function isAnniversaryToday(ann, y, m, d) {
  if (!ann) return false;
  if (ann.type === 'yearly') {
    if (!ann.date) return false;
    if (ann.isLunar) {
      try {
        const cal = new KoreanLunarCalendar();
        const [lunarM, lunarD] = ann.date.split('-').map(Number);
        cal.setLunarDate(y, lunarM, lunarD, !!ann.isLeap);
        const solar = cal.getSolarCalendar();
        return !!solar && Number(solar.year) === y && Number(solar.month) === m && Number(solar.day) === d;
      } catch (e) {
        return false;
      }
    }
    const [solarM, solarD] = ann.date.split('-').map(Number);
    return solarM === m && solarD === d;
  }
  if (ann.type === 'dday') {
    return ann.targetDate === `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  }
  if (ann.type === 'once') {
    if (!ann.date) return false;
    const [oy, om, od] = ann.date.split('-').map(Number);
    return oy === y && om === m && od === d;
  }
  if (ann.type === 'repeat') {
    // Same ceil(day/7) + weekday match the client bulk-register / getAnniversariesForDate use.
    const dateStr = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    if (ann.startDate && dateStr < ann.startDate) return false;
    if (ann.endDate && dateStr > ann.endDate) return false;
    const weekOfMonth = Math.ceil(d / 7);
    const dow = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
    const weekSet = new Set((Array.isArray(ann.weeks) ? ann.weeks : []).map(Number));
    const daySet = new Set((Array.isArray(ann.weekdays) ? ann.weekdays : []).map(Number));
    return weekSet.has(weekOfMonth) && daySet.has(dow);
  }
  return false;
}

// Daily anniversary push -- fires once at 06:30 KST, scans every calendar's anniversaries
// subcollection via a single collectionGroup query (cheaper than looping per-calendar fetches),
// and pushes to every subscriber of a calendar with a match today. New Cloud Function; requires
// `firebase deploy --only functions` to go live (unlike the rest of this app, which redeploys
// automatically via GitHub Pages on merge to main).

// Memo created or edited → push (channel: memo). A write trigger is required because
// memo edits are saved as updates; the old create-only trigger silently missed them.
exports.onMemoWrite = seoulFunctions().runWith({ secrets: ['VAPID_PRIVATE_KEY'] }).firestore
  .document('calendars/{calendarDocId}/memos/{memoId}')
  .onWrite(async (change, context) => {
    if (!change.after.exists) return;
    const before = change.before.exists ? (change.before.data() || {}) : null;
    const memo = change.after.data() || {};
    // Notify only when title/text/photos/comments actually change. Tag, GPS, link
    // preview, asset-graph and updatedAt maintenance must not page anyone, and the
    // same revision is claimed once so a retried trigger cannot send it again.
    const decision = decideMemoNotification(before, memo, { memoId: context.params.memoId });
    if (!decision) return;
    const calendarDocId = context.params.calendarDocId;
    const claimed = await claimPushDelivery(calendarDocId, decision.claimKey);
    if (!claimed) {
      console.log('Skipping duplicate memo push', decision.claimKey);
      return;
    }
    const db = admin.firestore();
    const calendarSnap = await db.collection('calendars').doc(calendarDocId).get();
    if (!calendarSnap.exists) return;
    const participants = ((calendarSnap.data() || {}).calendar || {}).participants || [];
    const named = participants.find(person => person && person.id === decision.skipParticipantId);
    const author = decision.authorName || (named && named.name) || '참여자';
    const title = decision.kind === 'comment'
      ? `${author}의 메모 댓글`
      : decision.kind === 'images'
        ? `${author}의 메모 사진`
        : decision.kind === 'edit'
          ? `${author}의 메모 수정`
          : `${author}의 새 메모`;
    await broadcastCalendarPush(calendarDocId, {
      title,
      body: decision.body,
      url: buildPushTargetUrl(calendarDocId, {
        view: 'memo',
        memo: context.params.memoId,
        comment: decision.kind === 'comment' ? decision.commentId : ''
      }),
      tag: `memo-${calendarDocId}-${decision.tag}`,
      renotify: false
    }, { skipParticipantId: decision.skipParticipantId, channel: decision.kind === 'comment' ? 'comment' : 'memo' });
  });

// Meeting confirmed (the 확정 button, not a settlement/participant edit) → schedule channel.
// The document is also written by unrelated actions -- settlement note/price edits and
// participant-only registration on a date with no confirmedMeeting entry yet both create or
// rewrite this same doc with confirmed:false, and editing settlement on an already-confirmed
// meeting rewrites it without touching `confirmed` at all. Notifying on every write there
// falsely announced "모임이 확정되었습니다" for those cases. Only a genuine
// not-confirmed -> confirmed transition (client sets confirmed:true exclusively via
// handleConfirmMeeting, the actual 확정 button) should page everyone.
exports.onConfirmedMeetingWrite = seoulFunctions().runWith({ secrets: ['VAPID_PRIVATE_KEY'] }).firestore
  .document('calendars/{calendarDocId}/confirmedMeetings/{dateId}')
  .onWrite(async (change, context) => {
    if (!change.after.exists) return;
    const before = change.before.exists ? (change.before.data() || {}) : null;
    const after = change.after.data() || {};
    const calendarDocId = context.params.calendarDocId;
    const dateLabel = context.params.dateId || after.date || '';
    const meetingDateKey = normalizeMeetingDateKey(dateLabel);
    // Historical confirmedMeeting documents can be rewritten during migration,
    // reconciliation, or a late-arriving offline save. Never turn that maintenance
    // write into a fresh notification for a meeting that has already passed.
    const stale = Boolean(meetingDateKey && meetingDateKey < getKstDateKey());
    const decision = decideScheduleNotification(before, after, {
      dateId: dateLabel,
      stale
    });
    if (!decision) {
      if (stale) console.log('Skipping stale confirmed meeting notification:', meetingDateKey);
      return;
    }
    const claimed = await claimPushDelivery(calendarDocId, decision.claimKey);
    if (!claimed) {
      console.log('Skipping duplicate schedule push', decision.claimKey);
      return;
    }
    const db = admin.firestore();
    const calendarSnap = await db.collection('calendars').doc(calendarDocId).get();
    if (!calendarSnap.exists) return;
    await broadcastCalendarPush(calendarDocId, {
      title: '모임 확정',
      body: dateLabel ? `${dateLabel} 모임이 확정되었습니다` : '모임이 확정되었습니다',
      url: `./?id=${calendarDocId.replace('cal_', '')}`,
      tag: `schedule-${calendarDocId}-${decision.tag}`,
      renotify: false
    }, { skipParticipantId: decision.skipParticipantId, channel: 'schedule' });
  });

// Calendar document write → detect new polls
exports.onCalendarDocWrite = seoulFunctions().runWith({ secrets: ['VAPID_PRIVATE_KEY'] }).firestore
  .document('calendars/{calendarDocId}')
  .onUpdate(async (change, context) => {
    const beforeCal = (change.before.data() || {}).calendar || {};
    const afterCal = (change.after.data() || {}).calendar || {};
    const beforePolls = Array.isArray(beforeCal.polls) ? beforeCal.polls : [];
    const afterPolls = Array.isArray(afterCal.polls) ? afterCal.polls : [];
    const decisions = decidePollNotifications(beforePolls, afterPolls);
    if (decisions.length === 0) return;
    const calendarDocId = context.params.calendarDocId;
    for (const decision of decisions) {
      const poll = decision.poll;
      const claimed = await claimPushDelivery(calendarDocId, decision.claimKey);
      if (!claimed) {
        console.log('Skipping duplicate poll push', decision.claimKey);
        continue;
      }
      await broadcastCalendarPush(calendarDocId, {
        title: poll.title ? `새 투표: ${poll.title}` : '새 투표',
        body: poll.title ? `${poll.title} 투표가 등록되었습니다` : '새 투표가 등록되었습니다',
        url: `./?id=${calendarDocId.replace('cal_', '')}`,
        tag: `poll-${calendarDocId}-${decision.tag}`,
        renotify: false
      }, { skipParticipantId: decision.skipParticipantId, channel: 'poll' });
    }
  });

exports.sendAnniversaryReminders = functions.region(SEOUL_REGION).runWith({ secrets: ['VAPID_PRIVATE_KEY'] }).pubsub.schedule('30 6 * * *').timeZone('Asia/Seoul').onRun(async () => {
  ensureVapidConfigured();
  const kstParts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit'
  }).formatToParts(new Date());
  const y = Number(kstParts.find(p => p.type === 'year').value);
  const m = Number(kstParts.find(p => p.type === 'month').value);
  const d = Number(kstParts.find(p => p.type === 'day').value);

  const db = admin.firestore();
  const annSnap = await db.collectionGroup('anniversaries').get();

  const byCalendar = new Map();
  annSnap.forEach(doc => {
    const ann = { id: doc.id, ...doc.data() };
    if (!isAnniversaryToday(ann, y, m, d)) return;
    const calendarRef = doc.ref.parent.parent;
    if (!calendarRef) return;
    if (!byCalendar.has(calendarRef.id)) byCalendar.set(calendarRef.id, { ref: calendarRef, anniversaries: [] });
    byCalendar.get(calendarRef.id).anniversaries.push(ann);
  });

  if (byCalendar.size === 0) {
    console.log('No anniversaries today.');
    return null;
  }

  const promises = [];
  for (const [calendarDocId, entry] of byCalendar) {
    const calendarSnap = await entry.ref.get();
    if (!calendarSnap.exists) continue;

    const subSnap = await entry.ref.collection('push_subscriptions').get();
    if (subSnap.empty) continue;

    entry.anniversaries.forEach(ann => {
      const payload = JSON.stringify({
        title: '오늘의 기념일',
        body: `🎉 ${ann.title || '기념일'}`,
        url: `./?id=${calendarDocId.replace('cal_', '')}`,
        tag: `anniversary-${calendarDocId}-${ann.id}`
      });
      subSnap.forEach(subDoc => {
        const data = subDoc.data();
        const pushSubscription = {
          endpoint: data.endpoint,
          keys: { auth: data.keys?.auth, p256dh: data.keys?.p256dh }
        };
        // Same urgency: 'high' reasoning as onMessageCreate above -- a same-day anniversary
        // reminder is only useful if it actually arrives that day.
        const p = webpush.sendNotification(pushSubscription, payload, { urgency: 'high' })
          .then(() => {
            console.log(`Anniversary push sent to subscription: ${subDoc.id}`);
          })
          .catch(err => {
            console.error(`Failed to send anniversary push to sub ${subDoc.id}:`, err);
            if (err.statusCode === 410 || err.statusCode === 404 || err.statusCode === 400 || err.statusCode === 403) {
              console.log(`Removing expired subscription: ${subDoc.id}`);
              return subDoc.ref.delete();
            }
          });
        promises.push(p);
      });
    });
  }

  await Promise.all(promises);
  return null;
});

// Eve-of schedule push at 18:30 KST: tomorrow's confirmed meetings + tomorrow's matching
// type:repeat anniversary rules (e.g. 매월 셋째주 수요일). Complements the local D-1 nudge
// (client only fires when the tab is open after 18:30) and the morning anniversary job.
exports.sendEveScheduleReminders = functions.region(SEOUL_REGION).runWith({ secrets: ['VAPID_PRIVATE_KEY'] }).pubsub.schedule('30 18 * * *').timeZone('Asia/Seoul').onRun(async () => {
  ensureVapidConfigured();
  const kstNow = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Seoul' }));
  const tomorrow = new Date(kstNow.getFullYear(), kstNow.getMonth(), kstNow.getDate() + 1);
  const y = tomorrow.getFullYear();
  const m = tomorrow.getMonth() + 1;
  const d = tomorrow.getDate();
  const tomorrowKey = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

  const db = admin.firestore();
  const promises = [];

  // Confirmed meetings scheduled for tomorrow.
  const meetingSnap = await db.collectionGroup('confirmedMeetings').get();
  const meetingsByCal = new Map();
  meetingSnap.forEach(doc => {
    const data = doc.data() || {};
    if (data.confirmed === false) return;
    const dateKey = normalizeMeetingDateKey(doc.id || data.date || '');
    if (dateKey !== tomorrowKey) return;
    const calendarRef = doc.ref.parent.parent;
    if (!calendarRef) return;
    if (!meetingsByCal.has(calendarRef.id)) meetingsByCal.set(calendarRef.id, { ref: calendarRef, dates: [] });
    meetingsByCal.get(calendarRef.id).dates.push(dateKey);
  });

  for (const [calendarDocId, entry] of meetingsByCal.entries()) {
    const calendarSnap = await entry.ref.get();
    if (!calendarSnap.exists) continue;
    for (const dateLabel of entry.dates) {
      promises.push(broadcastCalendarPush(calendarDocId, {
        title: '모임 알림',
        body: `내일(${dateLabel}) 확정 모임이 있습니다`,
        url: `./?id=${calendarDocId.replace('cal_', '')}`,
        tag: `schedule-eve-${calendarDocId}-${dateLabel}`
      }, { channel: 'schedule' }));
    }
  }

  // Repeat anniversary rules that land tomorrow.
  const annSnap = await db.collectionGroup('anniversaries').get();
  const repeatsByCal = new Map();
  annSnap.forEach(doc => {
    const ann = { id: doc.id, ...doc.data() };
    if (ann.type !== 'repeat') return;
    if (!isAnniversaryToday(ann, y, m, d)) return;
    const calendarRef = doc.ref.parent.parent;
    if (!calendarRef) return;
    if (!repeatsByCal.has(calendarRef.id)) repeatsByCal.set(calendarRef.id, { ref: calendarRef, anns: [] });
    repeatsByCal.get(calendarRef.id).anns.push(ann);
  });

  for (const [calendarDocId, entry] of repeatsByCal.entries()) {
    const calendarSnap = await entry.ref.get();
    if (!calendarSnap.exists) continue;
    for (const ann of entry.anns) {
      const title = ann.title || ann.patternLabel || '반복 일정';
      promises.push(broadcastCalendarPush(calendarDocId, {
        title: '일정 알림',
        body: `내일(${tomorrowKey}) ${title}`,
        url: `./?id=${calendarDocId.replace('cal_', '')}`,
        tag: `repeat-eve-${calendarDocId}-${ann.id}-${tomorrowKey}`
      }, { channel: 'schedule' }));
    }
  }

  if (promises.length === 0) {
    console.log('No eve schedule reminders for', tomorrowKey);
    return null;
  }
  await Promise.all(promises);
  return null;
});

// Monday evening: settlement cards still 진행중 a few days after they were opened
// (settlement-reminders.js). Uses the schedule channel, like the meeting reminders above.
exports.sendSettlementReminders = functions.region(SEOUL_REGION).runWith({ secrets: ['VAPID_PRIVATE_KEY'] }).pubsub.schedule('10 19 * * 1').timeZone('Asia/Seoul').onRun(async () => {
  ensureVapidConfigured();
  const db = admin.firestore();
  const snap = await db.collection('calendars').get();
  const promises = [];
  snap.forEach(doc => {
    const calendar = (doc.data() || {}).calendar || {};
    planSettlementReminders(calendar).forEach(reminder => {
      promises.push(broadcastCalendarPush(doc.id, {
        title: '정산 알림',
        body: reminder.body,
        url: `./?id=${doc.id.replace('cal_', '')}&tab=settlement`,
        tag: `settlement-open-${doc.id}-${reminder.id}`
      }, { channel: 'schedule' }));
    });
  });
  if (!promises.length) {
    console.log('No open settlement cards to remind');
    return null;
  }
  await Promise.all(promises);
  return null;
});

// Proxies link-preview requests to Peekalink so the API key never ships to the browser. The
// client (index.html's fetchLinkPreview) is a static site with no backend of its own -- calling
// Peekalink directly from there meant the key was visible to anyone via view-source. This
// function holds the key server-side only and forwards the exact same request/response shape
// Peekalink itself uses, so the client only needs to point at this URL instead.
// Value lives in Firebase Secret Manager (see firebase functions:secrets:set PEEKALINK_API_KEY),
// injected into process.env only for functions that declare it via runWith({secrets}) below.
const PEEKALINK_API_KEY = process.env.PEEKALINK_API_KEY;

// Peekalink's scraper can't reliably read YouTube's og:meta tags -- video pages are JS-heavy and
// commonly block/return empty results for generic scrapers, which is why chat messages sharing a
// YouTube link never got a preview card under it. YouTube's own oEmbed endpoint is purpose-built
// for exactly this (title/author/thumbnail, no API key, no CORS restriction for a server-to-server
// call) so it's tried first for youtube.com/youtu.be links, with Peekalink kept as the fallback
// for anything oEmbed can't resolve (e.g. a private or deleted video).
function extractYouTubeId(link) {
  try {
    const u = new URL(link);
    const host = u.hostname.replace(/^www\./, '').replace(/^m\./, '');
    if (host === 'youtu.be') return u.pathname.slice(1).split('/')[0] || null;
    if (host === 'youtube.com' || host === 'music.youtube.com') {
      if (u.pathname === '/watch') return u.searchParams.get('v');
      const shortsMatch = u.pathname.match(/^\/(shorts|live|embed)\/([^/]+)/);
      if (shortsMatch) return shortsMatch[2];
    }
  } catch (e) {
    // not a valid URL -- let the caller fall through to Peekalink
  }
  return null;
}

async function fetchYouTubeOembedPreview(link) {
  const youtubeId = extractYouTubeId(link);
  if (!youtubeId) return null;
  try {
    const oembedRes = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(link)}&format=json`);
    if (!oembedRes.ok) return null;
    const oembed = await oembedRes.json();
    return {
      ok: true,
      title: oembed.title || '',
      description: oembed.author_name ? `${oembed.author_name} · YouTube` : '',
      image: { medium: { url: oembed.thumbnail_url || '' } },
      siteName: 'YouTube',
      domain: 'youtube.com'
    };
  } catch (err) {
    console.error('YouTube oEmbed fetch failed, falling back to Peekalink:', err);
    return null;
  }
}

function hashUrlForCache(url) {
  let hash = 0xcbf29ce484222325n;
  const prime = 0x100000001b3n;
  for (let i = 0; i < url.length; i++) {
    hash ^= BigInt(url.charCodeAt(i));
    hash = BigInt.asUintN(64, hash * prime);
  }
  return hash.toString(16).padStart(16, '0');
}

async function fetchTikTokOembedPreview(link) {
  try {
    const u = new URL(link);
    const host = u.hostname.replace(/^www\./, '').replace(/^m\./, '');
    if (host !== 'tiktok.com') return null;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(`https://www.tiktok.com/oembed?url=${encodeURIComponent(link)}`, {
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    if (!res.ok) return null;
    const data = await res.json();
    return {
      ok: true,
      title: (data.title || '').trim(),
      description: data.author_name ? `${data.author_name} · TikTok` : '',
      image: { medium: { url: data.thumbnail_url || '' } },
      siteName: 'TikTok',
      domain: 'tiktok.com'
    };
  } catch (err) {
    console.error('TikTok oEmbed fetch failed:', err);
    return null;
  }
}

async function saveLinkPreviewToFirestore(url, preview) {
  if (!preview || !preview.ok) return;
  try {
    const urlHash = hashUrlForCache(url);
    const image = preview.image?.medium?.url || preview.image?.large?.url || preview.image?.thumbnail?.url || preview.icon?.url || (typeof preview.image === 'string' ? preview.image : '');
    const data = {
      url: String(url || '').slice(0, 2000),
      title: String(preview.title || '').slice(0, 300),
      description: String(preview.description || '').slice(0, 500),
      image: String(image || '').slice(0, 2000),
      siteName: String(preview.siteName || preview.domain || '').slice(0, 200),
      fetchedAt: Date.now()
    };
    await admin.firestore().collection('linkPreviews').doc(urlHash).set(data, { merge: true });
  } catch (err) {
    console.error('saveLinkPreviewToFirestore failed:', err);
  }
}

// Public proxy endpoints must never become an open SSRF relay. Accept only ordinary web URLs,
// reject embedded credentials, and block loopback/private/cloud-metadata host spellings.
function parsePublicHttpUrl(value) {
  if (typeof value !== 'string' || value.trim().length === 0 || value.trim().length > 2000) return null;
  try {
    const url = new URL(value.trim());
    const host = url.hostname.toLowerCase();
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) return null;
    if (host === 'localhost' || host === 'localhost.localdomain' || host === 'metadata.google.internal'
      || host === 'metadata.google.com' || host.endsWith('.internal')
      || /^(127\.|10\.|192\.168\.|169\.254\.|0\.)/.test(host)
      || /^172\.(1[6-9]|2\d|3[01])\./.test(host)
      || host === '::1' || host.startsWith('fc') || host.startsWith('fd')) return null;
    return url;
  } catch (_) { return null; }
}

function setPublicCacheHeaders(res, maxAge = 300) {
  res.set('Cache-Control', `public, max-age=${maxAge}, stale-while-revalidate=${maxAge}`);
  res.set('X-Content-Type-Options', 'nosniff');
}

const PUBLIC_PROXY_RUNTIME = { timeoutSeconds: 15, memory: '256MB', maxInstances: 20 };
// kakaoLocalSearchProxy/googlePlacesSearchProxy briefly ran with minInstances: 1 (a warm instance,
// ~$2.31/month minimum bill) to remove cold-start latency. Reverted: the actual bottleneck the
// user felt was a fixed-duration *simulated* progress bar in the date-modal place search UI (see
// ui-date-modal.js), not real cold starts, and paid-idle-instance cost isn't worth it for a
// feature this infrequently used relative to chat/gallery.
const PLACE_SEARCH_PROXY_RUNTIME = PUBLIC_PROXY_RUNTIME;

// Generic per-IP, per-endpoint sliding-window throttle for the public proxy functions below
// (peekalinkProxy, kakaoLocalSearchProxy). Both proxies are unauthenticated by design (any
// calendar guest needs to reach them without a login step), which also means anyone who finds
// the URL can script requests against them directly -- without a per-caller limit, that would
// burn through Peekalink's shared 50/hour free-plan quota or Kakao's daily free quota for every
// real user, or run up Cloud Functions billing, with the abuser paying nothing themselves. Unlike
// checkAdminAuthRateLimit (which permanently locks out after N failures), this is a plain rolling
// counter with no lockout -- a burst over the limit just gets 429s until the window rolls over.
async function checkProxyRateLimit(bucketKey, ip, windowMs, maxRequests) {
  try {
    const docId = `${bucketKey}_${String(ip || 'unknown').replace(/[^a-zA-Z0-9.:_-]/g, '_').slice(0, 200) || 'unknown'}`;
    const ref = admin.firestore().collection('proxyRateLimits').doc(docId);
    const now = Date.now();
    let allowed = true;
    await admin.firestore().runTransaction(async tx => {
      const snap = await tx.get(ref);
      const data = snap.exists ? snap.data() : null;
      const withinWindow = data && data.windowStart && (now - data.windowStart) < windowMs;
      const count = withinWindow ? (data.count || 0) : 0;
      if (count >= maxRequests) {
        allowed = false;
        return;
      }
      tx.set(ref, { windowStart: withinWindow ? data.windowStart : now, count: count + 1 });
    });
    return allowed;
  } catch (err) {
    // Fail closed when the limiter itself is unavailable. These endpoints proxy paid/quota-
    // limited services; allowing traffic through during a Firestore outage would turn a safety
    // failure into an unbounded abuse/billing event. The caller returns a normal 429 response.
    console.error(`checkProxyRateLimit(${bucketKey}) unavailable; denying request:`, err);
    return false;
  }
}

// Some sites (Coupang among them) answer a scraper's request with a 200 OK "차단/Access
// Denied" interstitial page instead of a real error status -- both Peekalink's own crawler and
// our fetchFallbackPreview() direct-fetch step below see this as a "successful" fetch with a
// real <title>, so without this check a bot-block page's title would be shown to the user as if
// it were the actual link's preview (exactly the "Access Denied" card reported for Coupang
// share links). KakaoTalk's own preview works for the same links because Coupang specifically
// allowlists Kakao's crawler IP/UA -- we have no equivalent allowlist relationship, so the best
// we can do is recognize the block page and fall through to a generic domain-only preview
// instead of showing the wrong content.
function looksLikeBlockedPreviewTitle(title) {
  const t = String(title || '').trim().toLowerCase();
  if (!t) return false;
  const blockedPatterns = [
    'access denied', 'forbidden', '403 forbidden', 'attention required',
    'just a moment', 'are you a human', 'bot detection', 'unusual traffic',
    'captcha', 'request blocked', 'error 1020'
  ];
  return blockedPatterns.some(p => t === p || t.includes(p));
}

async function fetchFallbackPreview(link) {
  try {
    const url = new URL(link);
    const domain = url.hostname.replace(/^www\./i, '');
    
    // 1. Check for Instagram specifically
    if (domain.includes('instagram.com')) {
      const isReel = url.pathname.includes('/reel/');
      return {
        ok: true,
        title: isReel ? "Instagram 릴스" : "Instagram 포스트",
        description: "Instagram 사진, 동영상 및 게시물 공유 링크입니다.",
        image: { medium: { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Instagram_icon.png/120px-Instagram_icon.png" } },
        siteName: 'Instagram',
        domain: 'instagram.com'
      };
    }
    
    // 2. Try fetching the page to parse open graph tags
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      const pageRes = await fetch(link, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
        },
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      
      if (pageRes.ok) {
        const html = await pageRes.text();
        
        // simple regex parsing for og:title, og:description, og:image, og:site_name
        const getMetaContent = (property) => {
          const re1 = new RegExp(`<meta[^>]*property=["']${property}["'][^>]*content=["']([^"']*)["']`, 'i');
          const re2 = new RegExp(`<meta[^>]*content=["']([^"']*)["'][^>]*property=["']${property}["']`, 'i');
          const re3 = new RegExp(`<meta[^>]*name=["']${property}["'][^>]*content=["']([^"']*)["']`, 'i');
          const m1 = html.match(re1) || html.match(re2) || html.match(re3);
          return m1 ? m1[1] : null;
        };
        
        const rawTitle = getMetaContent('og:title') || html.match(/<title>([^<]*)<\/title>/i)?.[1] || '';
        const title = looksLikeBlockedPreviewTitle(rawTitle) ? '' : rawTitle;
        const description = getMetaContent('og:description') || getMetaContent('description') || '';
        const image = getMetaContent('og:image') || '';
        const siteName = getMetaContent('og:site_name') || domain;

        if (title || image || description) {
          return {
            ok: true,
            title: title.trim(),
            description: description.trim(),
            image: image ? { medium: { url: image } } : null,
            siteName: siteName.trim(),
            domain
          };
        }
      }
    } catch (e) {
      console.warn('Fallback HTML scraping failed for:', link, e);
    }
    
    // 3. Absolute generic fallback so ANY url shows a link preview!
    return {
      ok: true,
      title: domain,
      description: "공유된 링크입니다. 클릭하여 상세 내용을 확인하세요.",
      image: { medium: { url: `https://www.google.com/s2/favicons?sz=128&domain=${domain}` } },
      siteName: domain,
      domain
    };
  } catch (err) {
    console.error('fetchFallbackPreview failed:', err);
    return null;
  }
}

exports.peekalinkProxy = seoulFunctions().runWith({ ...PUBLIC_PROXY_RUNTIME, secrets: ['PEEKALINK_API_KEY'] }).https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    setPublicCacheHeaders(res, 86400);
    res.status(204).send('');
    return;
  }
  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, message: 'Method not allowed' });
    return;
  }
  const link = req.body && req.body.link;
  const parsedLink = parsePublicHttpUrl(link);
  if (!parsedLink) {
    res.status(400).json({ ok: false, message: 'link is required' });
    return;
  }
  setPublicCacheHeaders(res, 300);
  const normalizedLink = parsedLink.toString();
  // 0. Check Firestore shared cache first (avoids any network or rate limit)
  try {
    const urlHash = hashUrlForCache(normalizedLink);
    const cachedDoc = await admin.firestore().collection('linkPreviews').doc(urlHash).get();
    if (cachedDoc.exists && cachedDoc.data()?.title && !looksLikeBlockedPreviewTitle(cachedDoc.data()?.title)) {
      const d = cachedDoc.data();
      res.status(200).json({
        ok: true,
        title: d.title || '',
        description: d.description || '',
        image: d.image ? { medium: { url: d.image } } : null,
        siteName: d.siteName || '',
        domain: d.siteName || ''
      });
      return;
    }
  } catch (_) {}

  // 1. Free, official, unlimited platform oEmbeds (YouTube & TikTok) - bypass Peekalink rate limit!
  const youtubePreview = await fetchYouTubeOembedPreview(normalizedLink);
  if (youtubePreview) {
    await saveLinkPreviewToFirestore(normalizedLink, youtubePreview);
    res.status(200).json(youtubePreview);
    return;
  }

  const tiktokPreview = await fetchTikTokOembedPreview(normalizedLink);
  if (tiktokPreview) {
    await saveLinkPreviewToFirestore(normalizedLink, tiktokPreview);
    res.status(200).json(tiktokPreview);
    return;
  }

  // 2. Generic web URLs: Rate limit check to protect Peekalink free quota (20/hour per IP)
  if (!(await checkProxyRateLimit('peekalink', req.ip, 60 * 60 * 1000, 20))) {
    res.status(429).json({ ok: false, message: 'Too many requests' });
    return;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    const peekalinkRes = await fetch('https://api.peekalink.io/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PEEKALINK_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ link: normalizedLink }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    if (peekalinkRes.ok) {
      const json = await peekalinkRes.json();
      if (json && json.ok && json.title && !looksLikeBlockedPreviewTitle(json.title)) {
        await saveLinkPreviewToFirestore(normalizedLink, json);
        res.status(200).json(json);
        return;
      }
    }
  } catch (err) {
    console.error('Peekalink proxy request failed:', err);
  }

  // 3. If Peekalink failed or did not return valid title, fall back to our custom implementation
  const fallback = await fetchFallbackPreview(normalizedLink);
  if (fallback) {
    await saveLinkPreviewToFirestore(normalizedLink, fallback);
    res.status(200).json(fallback);
  } else {
    res.status(502).json({ ok: false, message: 'Link preview failed' });
  }
});

// Proxies Kakao Local (키워드 검색) requests so the REST API key never ships to the browser --
// same reasoning as peekalinkProxy above. Used by the 장소등록 search field (PlaceRegisterModal
// in index.html): Nominatim/OSM has almost no Korean business-name coverage (e.g. searching
// "스타벅스" only returns Japan branches), so Kakao Local is the primary geocoder for Korean POI
// search, with Nominatim kept as a fallback for plain addresses/landmarks Kakao doesn't have.
//
// This key belongs to a different Kakao Developers app ("Culture Flow") than the one this
// project was originally set up under ("Metro Live") -- Metro Live's own 카카오맵 product was
// never activated, and Kakao only grants the one-time free daily quota to the FIRST app that
// activates it account-wide, so activating it on Metro Live now would require attaching a
// payment method with no free quota at all. Culture Flow already holds that free quota, so this
// key reuses it instead -- its REST key must have its IP allowlist cleared (or set to allow-all)
// in Kakao Developers, since Cloud Functions has no fixed outbound IP to register there.
// Value lives in Firebase Secret Manager (see firebase functions:secrets:set KAKAO_REST_API_KEY),
// injected into process.env only for kakaoLocalSearchProxy via runWith({secrets}) below.
const KAKAO_REST_API_KEY = process.env.KAKAO_REST_API_KEY;

// Tracks daily call volume against Kakao's free quota (see 어드민 통계 탭's 외부 서비스 연동
// 현황 card) -- incremented here rather than client-side like incrementLinkPreviewStat, since
// the actual Kakao call happens server-side in this function, not in the browser. Uses the
// Admin SDK so no firestore.rules write access is needed for this doc.
async function incrementKakaoLocalSearchStat() {
  try {
    // Kakao's own quota window resets at KST midnight (it's a Korean service), and Cloud
    // Functions run in UTC -- offsetting by +9h before formatting keeps this doc's "today" in
    // sync with the same day Kakao's own console would show, rather than rolling over 9 hours
    // early/late relative to it.
    const todayBucket = new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const ref = admin.firestore().collection('appConfig').doc('kakaoLocalSearchStats');
    await admin.firestore().runTransaction(async tx => {
      const snap = await tx.get(ref);
      const data = snap.exists ? snap.data() : null;
      const sameBucket = data && data.dailyUsageBucket === todayBucket;
      tx.set(ref, {
        dailyUsageBucket: todayBucket,
        dailyUsageCount: sameBucket ? (data.dailyUsageCount || 0) + 1 : 1,
        updatedAt: Date.now()
      });
    });
  } catch (err) {
    console.warn('incrementKakaoLocalSearchStat failed (non-fatal):', err);
  }
}

// Shared server-side cache for repeatable external lookups. Cache keys are hashes so
// provider queries (including API keys) never appear in Firestore document paths.
function externalCacheRef(provider, key) {
  const digest = crypto.createHash('sha256').update(`${provider}:${key}`).digest('hex');
  return admin.firestore().collection('externalApiCache').doc(`${provider}_${digest}`);
}
async function readExternalCache(provider, key) {
  try {
    const snap = await externalCacheRef(provider, key).get();
    const data = snap.exists ? snap.data() : null;
    if (data && data.expiresAt > Date.now() && data.payload) return data.payload;
  } catch (_) {}
  return null;
}
async function writeExternalCache(provider, key, payload, ttlMs) {
  try {
    await externalCacheRef(provider, key).set({ payload, cachedAt: Date.now(), expiresAt: Date.now() + ttlMs }, { merge: true });
  } catch (err) { console.warn(`external cache write failed (${provider}):`, err); }
}

exports.kakaoLocalSearchProxy = seoulFunctions().runWith({ ...PLACE_SEARCH_PROXY_RUNTIME, secrets: ['KAKAO_REST_API_KEY'] }).https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') { setPublicCacheHeaders(res, 86400); res.status(204).send(''); return; }
  if (req.method !== 'GET') { res.status(405).json({ ok: false, message: 'Method not allowed' }); return; }
  const query = String(req.query.query || '').trim().slice(0, 200);
  const xRaw = String(req.query.x || '').trim();
  const yRaw = String(req.query.y || '').trim();
  const xN = Number(xRaw);
  const yN = Number(yRaw);
  const isCoord = !query && Number.isFinite(xN) && Number.isFinite(yN) && Math.abs(xN) <= 180 && Math.abs(yN) <= 90;
  if (!query && !isCoord) { res.status(400).json({ ok: false, message: 'query is required' }); return; }
  setPublicCacheHeaders(res, 300);
  // 30/minute per IP -- generous for a real person typing/refining a place search, but stops a
  // scripted caller from burning through the free daily quota this whole app shares.
  if (!(await checkProxyRateLimit('kakao', req.ip, 60 * 1000, 30))) {
    res.status(429).json({ ok: false, message: 'Too many requests' });
    return;
  }
  const cacheKey = isCoord ? `coord:${xN.toFixed(4)},${yN.toFixed(4)}` : query.toLocaleLowerCase('ko-KR');
  const cacheProvider = isCoord ? 'kakaoCoord' : 'kakaoSearch';
  const cached = await readExternalCache(cacheProvider, cacheKey);
  if (cached) { res.status(200).json(cached); return; }
  try {
    const kakaoUrl = isCoord
      ? `https://dapi.kakao.com/v2/local/geo/coord2address.json?x=${encodeURIComponent(String(xN))}&y=${encodeURIComponent(String(yN))}`
      : `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(query)}&size=10`;
    const kakaoRes = await fetch(kakaoUrl, {
      headers: { Authorization: `KakaoAK ${KAKAO_REST_API_KEY}` }
    });
    // Awaited (rather than fire-and-forget) so the write reliably completes before this HTTP
    // function's instance is frozen once the response below is sent.
    await incrementKakaoLocalSearchStat();
    if (!kakaoRes.ok) {
      res.status(kakaoRes.status).json({ ok: false, message: isCoord ? 'Kakao coord2address failed' : 'Kakao local search failed' });
      return;
    }
    const json = await kakaoRes.json();
    const result = { ok: true, mode: isCoord ? 'coord' : 'keyword', documents: json.documents || [] };
    await writeExternalCache(cacheProvider, cacheKey, result, 24 * 60 * 60 * 1000);
    res.status(200).json(result);
  } catch (err) {
    console.error('kakaoLocalSearchProxy failed:', err);
    res.status(502).json({ ok: false, message: isCoord ? 'Kakao coord2address request failed' : 'Kakao local search request failed' });
  }
});

function photoGeoSignature(geo) {
  const lat = Number(geo?.latitude);
  const lng = Number(geo?.longitude);
  return Number.isFinite(lat) && Number.isFinite(lng) ? `${lat.toFixed(5)},${lng.toFixed(5)}` : '';
}

async function fetchKakaoCoordinateTags(latitude, longitude) {
  const lat = Number(latitude);
  const lng = Number(longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) return [];
  const cacheKey = `coord-tags:${lat.toFixed(4)},${lng.toFixed(4)}`;
  const cached = await readExternalCache('kakaoCoordTags', cacheKey);
  if (Array.isArray(cached?.tags)) return cached.tags;
  if (!KAKAO_REST_API_KEY) {
    console.error('Photo location tagging skipped: KAKAO_REST_API_KEY is not configured.');
    return [];
  }
  const kakaoUrl = `https://dapi.kakao.com/v2/local/geo/coord2address.json?x=${encodeURIComponent(String(lng))}&y=${encodeURIComponent(String(lat))}`;
  const response = await fetch(kakaoUrl, { headers: { Authorization: `KakaoAK ${KAKAO_REST_API_KEY}` } });
  await incrementKakaoLocalSearchStat();
  if (!response.ok) throw new Error(`Kakao photo reverse geocode failed: ${response.status}`);
  const payload = await response.json();
  const tags = buildKakaoLocationTags(payload?.documents?.[0]);
  // Cache even an empty Korean result so a coordinate outside Kakao's coverage cannot repeatedly
  // consume quota on future edits of the same message.
  await writeExternalCache('kakaoCoordTags', cacheKey, { tags }, 24 * 60 * 60 * 1000);
  return tags;
}

async function mapWithConcurrency(items, mapper, concurrency = 4) {
  const source = Array.isArray(items) ? items : [];
  const workers = Array.from({ length: Math.min(Math.max(1, concurrency), source.length) }, async (_, workerIndex) => {
    for (let index = workerIndex; index < source.length; index += concurrency) await mapper(source[index]);
  });
  await Promise.all(workers);
}

// Browser reverse geocoding is intentionally optional: a network interruption must not hold up an
// image upload. When EXIF GPS did arrive, this trusted server-side backstop completes only the
// missing administrative tags. It runs only for a newly-added coordinate, so a later user tag
// deletion is respected and never reintroduced by an unrelated message edit.
exports.completePhotoLocationTags = seoulFunctions()
  .runWith({ timeoutSeconds: 60, memory: '256MB', secrets: ['KAKAO_REST_API_KEY'] })
  .firestore.document('calendars/{calendarDocId}/messages/{messageId}')
  .onWrite(async change => {
    if (!change.after.exists) return null;
    const after = change.after.data() || {};
    const before = change.before.exists ? (change.before.data() || {}) : {};
    const previousGeoByAsset = new Map(getMessageImageEntriesForIndex(before).map(entry => [
      getPhotoAssetKey(entry.imageUrl || entry.thumbUrl),
      photoGeoSignature(readImageGeo(before, getPhotoAssetKey(entry.imageUrl || entry.thumbUrl)))
    ]));
    const newGeoEntries = getMessageImageEntriesForIndex(after)
      .map(entry => ({ ...entry, assetKey: getPhotoAssetKey(entry.imageUrl || entry.thumbUrl) }))
      .map(entry => ({ ...entry, geo: readImageGeo(after, entry.assetKey) }))
      .filter(entry => entry.assetKey && entry.geo && photoGeoSignature(entry.geo) !== previousGeoByAsset.get(entry.assetKey));
    if (!newGeoEntries.length) return null;

    const geoByCoordinate = new Map();
    newGeoEntries.forEach(entry => {
      const coordinate = photoGeoSignature(entry.geo);
      if (!geoByCoordinate.has(coordinate)) geoByCoordinate.set(coordinate, entry.geo);
    });
    const tagsByCoordinate = new Map();
    await mapWithConcurrency(Array.from(geoByCoordinate.entries()), async ([coordinate, geo]) => {
      tagsByCoordinate.set(coordinate, await fetchKakaoCoordinateTags(geo.latitude, geo.longitude));
    });
    const locationTagsByAsset = new Map();
    await mapWithConcurrency(newGeoEntries, async entry => {
      const coordinate = photoGeoSignature(entry.geo);
      const tags = tagsByCoordinate.get(coordinate);
      if (tags?.length) locationTagsByAsset.set(entry.assetKey, tags);
    });
    if (!locationTagsByAsset.size) return null;

    await admin.firestore().runTransaction(async transaction => {
      const snapshot = await transaction.get(change.after.ref);
      if (!snapshot.exists) return;
      const latest = snapshot.data() || {};
      const imageTags = Array.isArray(latest.imageTags) ? latest.imageTags.slice() : [];
      const imageTagMap = latest.imageTagMap && typeof latest.imageTagMap === 'object' && !Array.isArray(latest.imageTagMap)
        ? { ...latest.imageTagMap }
        : {};
      let changed = false;
      getMessageImageEntriesForIndex(latest).forEach(entry => {
        const assetKey = getPhotoAssetKey(entry.imageUrl || entry.thumbUrl);
        const locationTags = locationTagsByAsset.get(assetKey);
        if (!locationTags?.length) return;
        const current = String(Object.prototype.hasOwnProperty.call(imageTagMap, assetKey) ? imageTagMap[assetKey] : (imageTags[entry.index] || ''));
        const next = appendLocationTags(current, locationTags);
        if (next === current) return;
        while (imageTags.length <= entry.index) imageTags.push('');
        imageTags[entry.index] = next;
        imageTagMap[assetKey] = next;
        changed = true;
      });
      if (!changed) return;
      transaction.update(change.after.ref, {
        imageTags,
        imageTagMap: reconcileImageTagMapForIndex({ ...latest, imageTags, imageTagMap }, imageTagMap)
      });
    });
    return null;
  });

// Overseas 장소 검색 폴백 -- Kakao Local is Korea-only, so PlaceRegisterModal.handleSearch only
// calls this when a Kakao search comes back empty (see assets/app-main.js), which in practice
// means either a typo or a place outside Korea. Google Places (New) has far better POI coverage
// abroad than Nominatim/OSM, at the cost of being a genuinely billed API past its free monthly
// SKU threshold -- see incrementGooglePlacesSearchStat below and the matching 통계 탭 card.
// Value lives in Firebase Secret Manager (see firebase functions:secrets:set
// GOOGLE_PLACES_API_KEY), injected into process.env only for googlePlacesSearchProxy via
// runWith({secrets}) below.
const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;

// Tracks monthly call volume against Google Places' free SKU threshold (see 어드민 통계 탭's
// 외부 서비스 연동 현황 card) -- unlike Kakao's daily bucket, this is monthly since that's how
// Google's own free tier resets, and because this API can actually incur real cost past it.
async function incrementGooglePlacesSearchStat() {
  try {
    const monthBucket = new Date().toISOString().slice(0, 7); // YYYY-MM (UTC)
    const ref = admin.firestore().collection('appConfig').doc('googlePlacesSearchStats');
    await admin.firestore().runTransaction(async tx => {
      const snap = await tx.get(ref);
      const data = snap.exists ? snap.data() : null;
      const sameBucket = data && data.monthlyUsageBucket === monthBucket;
      tx.set(ref, {
        monthlyUsageBucket: monthBucket,
        monthlyUsageCount: sameBucket ? (data.monthlyUsageCount || 0) + 1 : 1,
        updatedAt: Date.now()
      });
    });
  } catch (err) {
    console.warn('incrementGooglePlacesSearchStat failed (non-fatal):', err);
  }
}

exports.googlePlacesSearchProxy = seoulFunctions().runWith({ ...PLACE_SEARCH_PROXY_RUNTIME, secrets: ['GOOGLE_PLACES_API_KEY'] }).https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') { setPublicCacheHeaders(res, 86400); res.status(204).send(''); return; }
  if (req.method !== 'GET') { res.status(405).json({ ok: false, message: 'Method not allowed' }); return; }
  const query = String(req.query.query || '').trim().slice(0, 200);
  if (!query) { res.status(400).json({ ok: false, message: 'query is required' }); return; }
  setPublicCacheHeaders(res, 300);
  // 30/minute per IP -- same ceiling as kakaoLocalSearchProxy. This proxy is only ever reached
  // after a Kakao search already came back empty (see handleSearch's fallback chain), so real
  // traffic here is inherently lower than Kakao's, but the cap still exists to stop a scripted
  // caller from running up billing on a genuinely paid API.
  if (!(await checkProxyRateLimit('googlePlaces', req.ip, 60 * 1000, 30))) {
    res.status(429).json({ ok: false, message: 'Too many requests' });
    return;
  }
  const cacheKey = query.toLocaleLowerCase('ko-KR');
  const cached = await readExternalCache('googlePlacesSearch', cacheKey);
  if (cached) { res.status(200).json(cached); return; }
  try {
    // FieldMask is deliberately limited to Essentials/Pro-tier fields (id/name/address/location)
    // -- requesting Enterprise-tier fields (phone, website, opening hours, etc.) would bump every
    // call to a more expensive SKU for data this feature doesn't even use.
    const googleRes = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': GOOGLE_PLACES_API_KEY,
        'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.location'
      },
      body: JSON.stringify({ textQuery: query, languageCode: 'ko' })
    });
    // Awaited (rather than fire-and-forget) so the write reliably completes before this HTTP
    // function's instance is frozen once the response below is sent.
    await incrementGooglePlacesSearchStat();
    if (!googleRes.ok) {
      res.status(googleRes.status).json({ ok: false, message: 'Google Places search failed' });
      return;
    }
    const json = await googleRes.json();
    const result = { ok: true, places: json.places || [] };
    await writeExternalCache('googlePlacesSearch', cacheKey, result, 24 * 60 * 60 * 1000);
    res.status(200).json(result);
  } catch (err) {
    console.error('googlePlacesSearchProxy failed:', err);
    res.status(502).json({ ok: false, message: 'Google Places search request failed' });
  }
});

// Read-only Korean tourism lookup used to enrich a registered place with nearby
// attractions, food and lodging. Parameterized config keeps deployment valid even
// before a key is supplied; the browser receives only normalized display-safe fields.
const TOUR_API_SERVICE_KEY_PARAM = defineString('TOUR_API_SERVICE_KEY', {
  description: 'Optional Korea TourAPI service key for place enrichment'
});

exports.tourApiSearchProxy = seoulFunctions().runWith(PUBLIC_PROXY_RUNTIME).https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') { setPublicCacheHeaders(res, 86400); res.status(204).send(''); return; }
  if (req.method !== 'GET') { res.status(405).json({ ok: false, message: 'Method not allowed' }); return; }
  // Optional integration: the key is read only at request time so deployment
  // never prompts or fails when TourAPI is intentionally disabled.
  const rawTourApiKey = process.env.TOUR_API_SERVICE_KEY || TOUR_API_SERVICE_KEY_PARAM.value() || '';
  // data.go.kr displays the key URL-encoded; decode exactly once before
  // URLSearchParams applies request encoding.
  let tourApiServiceKey = rawTourApiKey;
  try { tourApiServiceKey = decodeURIComponent(rawTourApiKey); } catch (_) {}
  if (!tourApiServiceKey) {
    res.status(503).json({ ok: false, code: 'not_configured', message: 'TourAPI service key is not configured' });
    return;
  }
  setPublicCacheHeaders(res, 300);
  const lat = Number(req.query.lat);
  const lng = Number(req.query.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    res.status(400).json({ ok: false, message: 'lat and lng are required' });
    return;
  }
  const radius = Math.min(20000, Math.max(500, Number(req.query.radius) || 5000));
  const contentTypeId = String(req.query.contentTypeId || '').trim();
  if (contentTypeId && !/^(12|14|15|25|28|32|38|39)$/.test(contentTypeId)) {
    res.status(400).json({ ok: false, message: 'invalid contentTypeId' });
    return;
  }
  if (!(await checkProxyRateLimit('tourApi', req.ip, 60 * 1000, 30))) {
    res.status(429).json({ ok: false, message: 'Too many requests' });
    return;
  }
  const cacheKey = `${lat.toFixed(5)}:${lng.toFixed(5)}:${radius}:${contentTypeId || 'all'}`;
  const cached = await readExternalCache('tourApiSearch', cacheKey);
  if (cached) { res.status(200).json(cached); return; }
  try {
    const params = new URLSearchParams({
      serviceKey: tourApiServiceKey,
      MobileOS: 'ETC',
      MobileApp: 'MoyeoraCalendar',
      _type: 'json',
      mapX: String(lng),
      mapY: String(lat),
      radius: String(radius),
      arrange: 'C',
      numOfRows: '30',
      pageNo: '1'
    });
    if (contentTypeId) params.set('contentTypeId', contentTypeId);
    const upstream = await fetch(`https://apis.data.go.kr/B551011/KorService2/locationBasedList2?${params.toString()}`);
    if (!upstream.ok) {
      res.status(502).json({ ok: false, message: 'TourAPI request failed' });
      return;
    }
    const payload = await upstream.json();
    const rawItems = payload?.response?.body?.items?.item || [];
    const items = (Array.isArray(rawItems) ? rawItems : [rawItems]).filter(Boolean).map(item => ({
      id: String(item.contentid || ''),
      title: String(item.title || ''),
      address: String(item.addr1 || item.addr2 || ''),
      roadAddress: String(item.addr2 || ''),
      lat: Number(item.mapy),
      lng: Number(item.mapx),
      imageUrl: String(item.firstimage || item.firstimage2 || ''),
      contentTypeId: String(item.contenttypeid || ''),
      category: String(item.cat3 || item.cat2 || item.cat1 || ''),
      phone: String(item.tel || ''),
      homepage: String(item.homepage || ''),
      eventStartDate: String(item.eventstartdate || ''),
      eventEndDate: String(item.eventenddate || ''),
      modifiedAt: String(item.modifiedtime || '')
    })).filter(item => item.id && Number.isFinite(item.lat) && Number.isFinite(item.lng));
    const result = { ok: true, source: 'tourapi', items };
    await writeExternalCache('tourApiSearch', cacheKey, result, 7 * 24 * 60 * 60 * 1000);
    res.status(200).json(result);
  } catch (err) {
    console.error('tourApiSearchProxy failed:', err);
    res.status(502).json({ ok: false, message: 'TourAPI request failed' });
  }
});

// Public, unauthenticated: returns only {id, title, description} for every calendar, for the
// GitHub Actions "Refresh Calendar OG Pages" job (scripts/generate-og-pages.mjs), which needs to
// enumerate all calendars to regenerate their public share/OG preview pages. That's the same
// information any share link already exposes via its og:title/og:description meta tags before
// the recipient even opens the page, so serving it without auth doesn't reopen the enumeration
// hole listAllCalendars/adminVerifyPassword above were built to close -- this function explicitly
// never touches participants/messages/expenses/places/polls/etc.
exports.listPublicCalendarSummaries = seoulFunctions().https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') { res.status(204).send(''); return; }
  if (req.method !== 'GET') { res.status(405).json({ ok: false, message: 'Method not allowed' }); return; }
  // 30/hour per IP -- comfortably above the legitimate caller's pace (the OG-refresh GitHub
  // Action hits this every 15 minutes, i.e. 4/hour) while stopping a scripted caller from forcing
  // repeated full-collection scans at no cost to themselves, same reasoning as peekalinkProxy/
  // kakaoLocalSearchProxy above.
  if (!(await checkProxyRateLimit('publicSummaries', req.ip, 60 * 60 * 1000, 30))) {
    res.status(429).json({ ok: false, message: 'Too many requests' });
    return;
  }
  try {
    const snap = await admin.firestore().collection('calendars').get();
    const calendars = [];
    snap.forEach(doc => {
      const cal = doc.data()?.calendar;
      if (cal?.id) calendars.push({ id: cal.id, title: cal.title || '', description: cal.description || '' });
    });
    res.status(200).json({ ok: true, calendars });
  } catch (err) {
    console.error('listPublicCalendarSummaries failed:', err);
    res.status(500).json({ ok: false, message: '캘린더 목록을 불러오지 못했습니다.' });
  }
});

// --- Admin auth (listAllCalendars / adminVerifyPassword / adminChangePassword) ---
//
// This app has no real user accounts -- individual calendars are protected only by their ID
// being hard to guess (a share-link model), which firestore.rules enforces by scoping every
// read/write to a caller-supplied calendar ID. The admin dashboard's cross-calendar view broke
// that model: it needs to enumerate EVERY calendar, and firestore.rules had `allow list: if
// true` on the calendars collection to let it do that client-side -- which also let anyone
// (not just an authenticated admin) list every calendar ID and read every calendar's data
// directly via the Firestore SDK/REST API, bypassing the admin password screen entirely (that
// screen only ever ran a hash comparison in the browser; it never gated the data itself). The
// admin password's stored hash was in the same boat: appConfig/adminAuth allowed any
// correctly-shaped write, so anyone could overwrite it and log in as admin with a password of
// their choosing, with no need to know the real one.
//
// The fix moves both operations behind these three functions, which use the Admin SDK (always
// bypasses firestore.rules, since only *this* server-side code can invoke it) so the client SDK
// no longer needs (or is granted) direct list/write access to that data. firestore.rules should
// have `list` on /calendars and `create`/`update` on appConfig/adminAuth disabled to match.
const DEFAULT_ADMIN_PASSWORD_HASH = '32625be384ed05129315617a65f0b070e7b35a4257bdd11e0d98185c6f0cecfe'; // sha256("0602")

function sha256Hex(text) {
  return crypto.createHash('sha256').update(text, 'utf8').digest('hex');
}

async function getStoredAdminPasswordHash() {
  const snap = await admin.firestore().collection('appConfig').doc('adminAuth').get();
  const hash = snap.exists ? snap.data()?.passwordHash : null;
  return typeof hash === 'string' && /^[a-f0-9]{64}$/.test(hash) ? hash : DEFAULT_ADMIN_PASSWORD_HASH;
}

// Simple per-IP lockout so the (short, PIN-style) admin password can't be brute-forced online --
// this doc lives outside anything the client SDK can reach (no matching firestore.rules entry,
// so the default-deny catch-all applies), and is only ever touched by this Admin-SDK code.
const ADMIN_AUTH_RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const ADMIN_AUTH_RATE_LIMIT_MAX_FAILURES = 10;

async function checkAdminAuthRateLimit(ip) {
  const docId = String(ip || 'unknown').replace(/[^a-zA-Z0-9.:_-]/g, '_').slice(0, 200) || 'unknown';
  const ref = admin.firestore().collection('adminAuthAttempts').doc(docId);
  const snap = await ref.get();
  const now = Date.now();
  const data = snap.exists ? snap.data() : null;
  const withinWindow = data && data.windowStart && (now - data.windowStart) < ADMIN_AUTH_RATE_LIMIT_WINDOW_MS;
  if (withinWindow && (data.failCount || 0) >= ADMIN_AUTH_RATE_LIMIT_MAX_FAILURES) {
    return { blocked: true, ref };
  }
  // Only used as a fast pre-check to skip the sha256 comparison below when a caller is already
  // over the limit -- the actual count that determines the NEXT request's blocked state is only
  // ever incremented inside recordAdminAuthResult's transaction, so a stale read here can't
  // undercount failures.
  return { blocked: false, ref };
}

// Wrapped in a transaction (re-reading the doc at increment time) rather than trusting the
// failCount checkAdminAuthRateLimit read earlier -- a plain read-then-set here would lose
// increments under concurrent requests from the same IP (each reads the same pre-increment
// count, so N parallel failed attempts could all land as a single +1 instead of +N), which
// would let a scripted brute-force attacker bypass the lockout entirely by firing requests in
// parallel batches instead of serially.
async function recordAdminAuthResult(rateState, success) {
  if (success) {
    await rateState.ref.delete().catch(() => {});
    return;
  }
  const now = Date.now();
  await admin.firestore().runTransaction(async tx => {
    const snap = await tx.get(rateState.ref);
    const data = snap.exists ? snap.data() : null;
    const withinWindow = data && data.windowStart && (now - data.windowStart) < ADMIN_AUTH_RATE_LIMIT_WINDOW_MS;
    const windowStart = withinWindow ? data.windowStart : now;
    const failCount = (withinWindow ? (data.failCount || 0) : 0) + 1;
    tx.set(rateState.ref, { failCount, windowStart });
  }).catch(() => {});
}

function setAdminCorsHeaders(res) {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
}

// Server-side audit sink for unauthenticated calendar actions. The client supplies only a
// pseudonymous actor/session and event details; network evidence is captured here, outside the
// participant-readable calendar documents. IP is stored as a salted hash (not plaintext) so an
// incident can correlate repeated activity without turning the shared calendar into a tracker.
exports.auditEvent = seoulFunctions().https.onRequest(async (req, res) => {
  setAdminCorsHeaders(res);
  if (req.method === 'OPTIONS') { res.status(204).send(''); return; }
  if (req.method !== 'POST') { res.status(405).json({ ok: false }); return; }
  const body = req.body && typeof req.body === 'object' ? req.body : {};
  const calendarId = String(body.calendarId || '').trim();
  const action = String(body.action || '').trim();
  const actorId = String(body.actorId || '').trim();
  const sessionId = String(body.sessionId || '').trim();
  if (!/^[A-Za-z0-9_-]{1,64}$/.test(calendarId) || !/^[A-Za-z0-9_:-]{1,80}$/.test(action)) {
    res.status(400).json({ ok: false }); return;
  }
  if (actorId.length > 80 || sessionId.length > 100) { res.status(400).json({ ok: false }); return; }
  if (!(await checkProxyRateLimit('auditEvent', req.ip, 60 * 60 * 1000, 120))) {
    res.status(429).json({ ok: false }); return;
  }
  const ip = String(req.ip || req.headers['x-forwarded-for'] || 'unknown').split(',')[0].trim();
  const ipHash = crypto.createHash('sha256')
    .update(`${process.env.AUDIT_IP_SALT || 'metro-live-audit-v1'}:${ip}`)
    .digest('hex');
  const userAgent = String(req.get('user-agent') || '').slice(0, 600);
  const client = String(body.client || '').slice(0, 120);
  const target = String(body.target || '').slice(0, 200);
  const rawResource = body.resource && typeof body.resource === 'object' ? body.resource : null;
  const resource = rawResource ? {
    resourceType: String(rawResource.resourceType || '').slice(0, 60),
    resourceId: String(rawResource.resourceId || '').slice(0, 300),
    source: String(rawResource.source || '').slice(0, 60),
    sourceMessageId: String(rawResource.sourceMessageId || '').slice(0, 200),
    ...(Number.isInteger(rawResource.imageIndex) ? { imageIndex: rawResource.imageIndex } : {}),
    before: String(rawResource.before || '').slice(0, 500),
    after: String(rawResource.after || '').slice(0, 500)
  } : null;
  try {
    await admin.firestore().collection('serverAuditLogs').add({
      calendarId, action, actorId: actorId.slice(0, 80), sessionId: sessionId.slice(0, 100),
      client, target, ...(resource ? { resource } : {}), ipHash, userAgent, receivedAt: Date.now()
    });
    res.status(204).send('');
  } catch (err) {
    console.error('auditEvent failed:', err);
    res.status(500).json({ ok: false });
  }
});

// Verifies a submitted password against the stored admin hash, without returning any calendar
// data -- used by the login screen itself (see AdminLoginGate in index.html), separately from
// listAllCalendars below so the login check stays cheap even when the dashboard doesn't need
// a full data reload (e.g. re-validating an existing session).
exports.adminVerifyPassword = seoulFunctions().https.onRequest(async (req, res) => {
  setAdminCorsHeaders(res);
  if (req.method === 'OPTIONS') { res.status(204).send(''); return; }
  if (req.method !== 'POST') { res.status(405).json({ ok: false, message: 'Method not allowed' }); return; }
  const password = req.body && req.body.password;
  if (!password || typeof password !== 'string') { res.status(400).json({ ok: false, message: 'password is required' }); return; }
  const rateState = await checkAdminAuthRateLimit(req.ip);
  if (rateState.blocked) { res.status(429).json({ ok: false, message: '너무 많은 시도가 있었습니다. 잠시 후 다시 시도해 주세요.' }); return; }

  const [storedHash] = await Promise.all([getStoredAdminPasswordHash()]);
  const matches = sha256Hex(password.trim()) === storedHash;
  await recordAdminAuthResult(rateState, matches);
  if (!matches) { res.status(401).json({ ok: false, message: '비밀번호가 올바르지 않습니다.' }); return; }
  res.status(200).json({ ok: true });
});

// Returns every calendar's document (the admin dashboard's cross-calendar view) after verifying
// the submitted password server-side -- the only place this data leaves the server now that
// /calendars no longer allows a client-side `list`.

function slimCalendarForAdminList(cal, mode) {
  if (!cal || typeof cal !== 'object') return cal;
  const places = Array.isArray(cal.places) ? cal.places : [];
  const activityLogs = Array.isArray(cal.activityLogs) ? cal.activityLogs : [];
  const availabilities = Array.isArray(cal.availabilities) ? cal.availabilities : [];
  if (mode === 'summary') {
    return {
      id: cal.id, title: cal.title || '', description: cal.description || '',
      accentColor: cal.accentColor || '', revision: cal.revision || 0, updatedAt: cal.updatedAt || 0,
      participants: Array.isArray(cal.participants) ? cal.participants : [],
      settlementBaseBudget: cal.settlementBaseBudget || 0,
      expenseCategories: cal.expenseCategories || null, placeCategories: cal.placeCategories || null,
      polls: Array.isArray(cal.polls) ? cal.polls : [],
      places: [], activityLogs: [], availabilities: [],
      _placesCount: places.length, _activityLogsCount: activityLogs.length, _availabilitiesCount: availabilities.length
    };
  }
  const { places: _p, activityLogs: _a, ...rest } = cal;
  return { ...rest, places: [], activityLogs: [], _placesCount: places.length, _activityLogsCount: activityLogs.length };
}

exports.listAllCalendars = seoulFunctions().https.onRequest(async (req, res) => {
  setAdminCorsHeaders(res);
  if (req.method === 'OPTIONS') { res.status(204).send(''); return; }
  if (req.method !== 'POST') { res.status(405).json({ ok: false, message: 'Method not allowed' }); return; }
  const password = req.body && req.body.password;
  if (!password || typeof password !== 'string') { res.status(400).json({ ok: false, message: 'password is required' }); return; }
  const mode = (req.body && req.body.mode === 'full') ? 'full' : 'summary';

  const rateState = await checkAdminAuthRateLimit(req.ip);
  if (rateState.blocked) { res.status(429).json({ ok: false, message: '너무 많은 시도가 있었습니다. 잠시 후 다시 시도해 주세요.' }); return; }

  const storedHash = await getStoredAdminPasswordHash();
  const matches = sha256Hex(password.trim()) === storedHash;
  await recordAdminAuthResult(rateState, matches);
  if (!matches) { res.status(401).json({ ok: false, message: '비밀번호가 올바르지 않습니다.' }); return; }

  try {
    const snap = await admin.firestore().collection('calendars').get();
    const calendars = [];
    let lastModified = 0;
    snap.forEach(doc => {
      const data = doc.data();
      if (data?.calendar?.id) {
        calendars.push(slimCalendarForAdminList(data.calendar, mode));
        lastModified = Math.max(lastModified, data.lastModified || 0);
      }
    });
    res.status(200).json({ ok: true, calendars, lastModified, mode });
  } catch (err) {
    console.error('listAllCalendars failed:', err);
    res.status(500).json({ ok: false, message: '캘린더 목록을 불러오지 못했습니다.' });
  }
});

// Admin-only server audit log reader. Raw network evidence never enters the shared calendar
// documents; this endpoint returns it only after the same admin password check used elsewhere.
exports.listServerAuditLogs = seoulFunctions().https.onRequest(async (req, res) => {
  setAdminCorsHeaders(res);
  if (req.method === 'OPTIONS') { res.status(204).send(''); return; }
  if (req.method !== 'POST') { res.status(405).json({ ok: false }); return; }
  const { password, calendarId, limit } = req.body || {};
  if (typeof password !== 'string' || !password.trim()) { res.status(400).json({ ok: false }); return; }
  if (calendarId != null && !/^[A-Za-z0-9_-]{1,64}$/.test(String(calendarId))) { res.status(400).json({ ok: false }); return; }
  const rateState = await checkAdminAuthRateLimit(req.ip);
  if (rateState.blocked) { res.status(429).json({ ok: false }); return; }
  const matches = sha256Hex(password.trim()) === await getStoredAdminPasswordHash();
  await recordAdminAuthResult(rateState, matches);
  if (!matches) { res.status(401).json({ ok: false }); return; }
  try {
    const max = Math.min(Math.max(Number(limit) || 300, 1), 1000);
    let logs;
    if (calendarId) {
      // where('calendarId') + orderBy('receivedAt') needs a composite index that was never
      // deployed (this project has no automated firestore:indexes deploy step), so every
      // calendar-scoped fetch failed with FAILED_PRECONDITION and the admin 감사 로그 탭 always
      // showed "조회 실패". An equality-only where() never needs a composite index, so fetch
      // this calendar's rows unordered up to a generous cap and sort/trim in JS instead --
      // audit log volume per calendar stays small enough that this is cheap.
      const snap = await admin.firestore().collection('serverAuditLogs')
        .where('calendarId', '==', String(calendarId))
        .limit(5000)
        .get();
      logs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        .sort((a, b) => (Number(b.receivedAt) || 0) - (Number(a.receivedAt) || 0))
        .slice(0, max);
    } else {
      const snap = await admin.firestore().collection('serverAuditLogs').orderBy('receivedAt', 'desc').limit(max).get();
      logs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
    res.status(200).json({ ok: true, logs });
  } catch (err) {
    console.error('listServerAuditLogs failed:', err);
    res.status(500).json({ ok: false });
  }
});

// Global cross-calendar meme/sticker image pool (밈 키보드). Any calendar's chat can search
// these by hashtag and send one straight into the chat, like an attachment. Writable only via
// this admin-gated function -- if any calendar's own client could write directly, a
// compromised or malicious calendar could inject arbitrary images/hashtags into a pool every
// OTHER calendar sees, a materially bigger blast radius than that calendar's own data (same
// reasoning as the photoIndex collection). Reads stay open in firestore.rules since every
// calendar needs the full hashtag index to search locally.
const MEME_POOL_ID_RE = /^[A-Za-z0-9_-]{1,128}$/;
exports.memePoolUpsert = seoulFunctions().https.onRequest(async (req, res) => {
  setAdminCorsHeaders(res);
  if (req.method === 'OPTIONS') { res.status(204).send(''); return; }
  if (req.method !== 'POST') { res.status(405).json({ ok: false }); return; }
  const { password, id, thumbUrl, fullUrl, hashtags, fileName, fileSize, width, height } = req.body || {};
  if (typeof password !== 'string' || !password.trim()) { res.status(400).json({ ok: false }); return; }
  if (typeof id !== 'string' || !MEME_POOL_ID_RE.test(id)) { res.status(400).json({ ok: false, message: 'invalid id' }); return; }
  const rateState = await checkAdminAuthRateLimit(req.ip);
  if (rateState.blocked) { res.status(429).json({ ok: false }); return; }
  const matches = sha256Hex(password.trim()) === await getStoredAdminPasswordHash();
  await recordAdminAuthResult(rateState, matches);
  if (!matches) { res.status(401).json({ ok: false }); return; }
  try {
    const ref = admin.firestore().collection('memePool').doc(id);
    const existingSnap = await ref.get();
    const existing = existingSnap.exists ? existingSnap.data() : null;
    // hashtags is the only field a second call (the lightbox tagging step, after the bulk
    // upload already registered thumbUrl/fullUrl) is expected to change -- omit it to leave
    // existing tags alone rather than wiping them back to [].
    const cleanHashtags = Array.isArray(hashtags)
      ? Array.from(new Set(
          hashtags.map(t => String(t || '').trim().replace(/^#/, '').toLowerCase()).filter(Boolean)
        )).slice(0, 30)
      : (existing?.hashtags || []);
    const now = Date.now();
    const doc = {
      thumbUrl: typeof thumbUrl === 'string' && thumbUrl ? thumbUrl : (existing?.thumbUrl || ''),
      fullUrl: typeof fullUrl === 'string' && fullUrl ? fullUrl : (existing?.fullUrl || ''),
      fileName: typeof fileName === 'string' ? fileName.slice(0, 200) : (existing?.fileName || ''),
      fileSize: Number.isFinite(Number(fileSize)) ? Number(fileSize) : (existing?.fileSize ?? null),
      hashtags: cleanHashtags,
      width: Number.isFinite(Number(width)) ? Number(width) : (existing?.width ?? null),
      height: Number.isFinite(Number(height)) ? Number(height) : (existing?.height ?? null),
      createdAt: existing?.createdAt || now,
      updatedAt: now
    };
    if (!doc.thumbUrl && !doc.fullUrl) { res.status(400).json({ ok: false, message: 'thumbUrl or fullUrl required' }); return; }
    await ref.set(doc);
    try {
      await admin.firestore().collection('memePool').doc('_metadata').set({
        updatedAt: now,
        version: 1
      }, { merge: true });
    } catch (_) {}
    res.status(200).json({ ok: true, id });
  } catch (err) {
    console.error('memePoolUpsert failed:', err);
    res.status(500).json({ ok: false });
  }
});

exports.memePoolDelete = seoulFunctions().https.onRequest(async (req, res) => {
  setAdminCorsHeaders(res);
  if (req.method === 'OPTIONS') { res.status(204).send(''); return; }
  if (req.method !== 'POST') { res.status(405).json({ ok: false }); return; }
  const { password, id } = req.body || {};
  if (typeof password !== 'string' || !password.trim()) { res.status(400).json({ ok: false }); return; }
  if (typeof id !== 'string' || !MEME_POOL_ID_RE.test(id)) { res.status(400).json({ ok: false }); return; }
  const rateState = await checkAdminAuthRateLimit(req.ip);
  if (rateState.blocked) { res.status(429).json({ ok: false }); return; }
  const matches = sha256Hex(password.trim()) === await getStoredAdminPasswordHash();
  await recordAdminAuthResult(rateState, matches);
  if (!matches) { res.status(401).json({ ok: false }); return; }
  try {
    await admin.firestore().collection('memePool').doc(id).delete();
    try {
      await admin.firestore().collection('memePool').doc('_metadata').set({
        updatedAt: Date.now(),
        version: 1
      }, { merge: true });
    } catch (_) {}
    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('memePoolDelete failed:', err);
    res.status(500).json({ ok: false });
  }
});

// Admin 데이터풀 > 사진 "미태그만 보기" 일괄 처리. photoIndex is a per-calendar subcollection
// (calendars/cal_{id}/photoIndex) with client writes denied (see its firestore.rules comment),
// so listing/tagging across EVERY calendar at once has to go through an admin-gated Cloud
// Function using the Admin SDK, same trust model as memePoolUpsert above. A collectionGroup
// query needs its own composite/field-override index (see firestore.indexes.json) since
// automatic single-field indexes only cover collection-scoped queries, not collection-group ones.
const CALENDAR_ID_RE = /^[A-Za-z0-9_-]{1,64}$/;
const PHOTO_ASSET_KEY_RE = /^asset:v1:[A-Za-z0-9-]{1,80}$/;

exports.listUntaggedPhotoIndexEntries = seoulFunctions().https.onRequest(async (req, res) => {
  setAdminCorsHeaders(res);
  if (req.method === 'OPTIONS') { res.status(204).send(''); return; }
  if (req.method !== 'POST') { res.status(405).json({ ok: false }); return; }
  const { password, cursor, limit } = req.body || {};
  if (typeof password !== 'string' || !password.trim()) { res.status(400).json({ ok: false }); return; }
  const rateState = await checkAdminAuthRateLimit(req.ip);
  if (rateState.blocked) { res.status(429).json({ ok: false }); return; }
  const matches = sha256Hex(password.trim()) === await getStoredAdminPasswordHash();
  await recordAdminAuthResult(rateState, matches);
  if (!matches) { res.status(401).json({ ok: false }); return; }
  try {
    const pageSize = Math.min(200, Math.max(1, Number(limit) || 60));
    let query = admin.firestore().collectionGroup('photoIndex')
      .where('tags', '==', '')
      .orderBy('updatedAt', 'desc')
      .limit(pageSize);
    if (typeof cursor === 'number' && Number.isFinite(cursor)) query = query.startAfter(cursor);
    const snap = await query.get();
    const items = snap.docs.map(doc => {
      const data = doc.data() || {};
      // Parent chain is calendars/cal_{calendarId}/photoIndex/{assetKey}.
      const calendarDocId = doc.ref.parent.parent ? doc.ref.parent.parent.id : '';
      const calendarId = calendarDocId.startsWith('cal_') ? calendarDocId.slice(4) : calendarDocId;
      return {
        calendarId,
        assetKey: doc.id,
        thumb: String(data.thumb || data.full || ''),
        full: String(data.full || data.thumb || ''),
        text: String(data.text || ''),
        source: String(data.source || ''),
        updatedAt: Number(data.updatedAt) || 0
      };
    }).filter(item => item.calendarId && item.thumb);
    const nextCursor = snap.docs.length === pageSize ? Number(snap.docs[snap.docs.length - 1].data()?.updatedAt) || null : null;
    res.status(200).json({ ok: true, items, nextCursor });
  } catch (err) {
    console.error('listUntaggedPhotoIndexEntries failed:', err);
    res.status(500).json({ ok: false });
  }
});

// Admin 데이터풀 > "중복사진 검사" -- lists every photoIndex row across every calendar (read-only,
// no filter) so the client can run gallery-dedup.js's findDuplicatePhotoGroups/chooseDedupWinner
// against a full snapshot. Same trust model as listUntaggedPhotoIndexEntries above. Intentionally
// returns a report only; this endpoint never writes anything -- merge/delete stays a follow-up,
// separate admin-gated write endpoint once the user has reviewed a report from this one.
exports.listPhotoIndexEntriesForDedup = seoulFunctions().https.onRequest(async (req, res) => {
  setAdminCorsHeaders(res);
  if (req.method === 'OPTIONS') { res.status(204).send(''); return; }
  if (req.method !== 'POST') { res.status(405).json({ ok: false }); return; }
  const { password, cursor, limit } = req.body || {};
  if (typeof password !== 'string' || !password.trim()) { res.status(400).json({ ok: false }); return; }
  const rateState = await checkAdminAuthRateLimit(req.ip);
  if (rateState.blocked) { res.status(429).json({ ok: false }); return; }
  const matches = sha256Hex(password.trim()) === await getStoredAdminPasswordHash();
  await recordAdminAuthResult(rateState, matches);
  if (!matches) { res.status(401).json({ ok: false }); return; }
  try {
    const pageSize = Math.min(200, Math.max(1, Number(limit) || 200));
    let query = admin.firestore().collectionGroup('photoIndex')
      .orderBy('updatedAt', 'desc')
      .limit(pageSize);
    if (typeof cursor === 'number' && Number.isFinite(cursor)) query = query.startAfter(cursor);
    const snap = await query.get();
    const items = snap.docs.map(doc => {
      const data = doc.data() || {};
      const calendarDocId = doc.ref.parent.parent ? doc.ref.parent.parent.id : '';
      const calendarId = calendarDocId.startsWith('cal_') ? calendarDocId.slice(4) : calendarDocId;
      return {
        calendarId,
        assetKey: doc.id,
        full: String(data.full || data.thumb || ''),
        thumb: String(data.thumb || data.full || ''),
        timestamp: Number(data.timestamp) || 0,
        tags: String(data.tags || ''),
        commentCount: Number(data.commentCount) || 0,
        participantId: String(data.participantId || ''),
        source: String(data.source || ''),
        mergedInto: String(data.mergedInto || '')
      };
    }).filter(item => item.calendarId && item.assetKey && item.full);
    const nextCursor = snap.docs.length === pageSize ? Number(snap.docs[snap.docs.length - 1].data()?.updatedAt) || null : null;
    res.status(200).json({ ok: true, items, nextCursor });
  } catch (err) {
    console.error('listPhotoIndexEntriesForDedup failed:', err);
    res.status(500).json({ ok: false });
  }
});

// Admin-gated read of the sharedFiles/linkPreviews collections (both have `list: false` in
// firestore.rules -- a hash/urlHash is only useful to someone who already has the matching
// file/URL, so no client can enumerate them) filtered to entries onSharedFileWrite/
// onLinkPreviewWrite above have marked as used by 2+ calendars, for the admin dashboard's
// 데이터풀 tab. `calendarCount` (not `calendarIds.length`, which Firestore can't query directly)
// is both the filter and the sort key, so this only needs the automatic single-field index.
exports.listSharedDataPool = seoulFunctions().https.onRequest(async (req, res) => {
  setAdminCorsHeaders(res);
  if (req.method === 'OPTIONS') { res.status(204).send(''); return; }
  if (req.method !== 'POST') { res.status(405).json({ ok: false }); return; }
  const { password, kind, cursor, limit } = req.body || {};
  if (typeof password !== 'string' || !password.trim()) { res.status(400).json({ ok: false }); return; }
  if (kind !== 'file' && kind !== 'link') { res.status(400).json({ ok: false }); return; }
  const rateState = await checkAdminAuthRateLimit(req.ip);
  if (rateState.blocked) { res.status(429).json({ ok: false }); return; }
  const matches = sha256Hex(password.trim()) === await getStoredAdminPasswordHash();
  await recordAdminAuthResult(rateState, matches);
  if (!matches) { res.status(401).json({ ok: false }); return; }
  try {
    const pageSize = Math.min(200, Math.max(1, Number(limit) || 100));
    const collectionName = kind === 'file' ? 'sharedFiles' : 'linkPreviews';
    let query = admin.firestore().collection(collectionName)
      .where('calendarCount', '>=', 2)
      .orderBy('calendarCount', 'desc')
      .limit(pageSize);
    if (typeof cursor === 'number' && Number.isFinite(cursor)) query = query.startAfter(cursor);
    const snap = await query.get();
    const items = snap.docs.map(doc => {
      const data = doc.data() || {};
      const base = { id: doc.id, calendarCount: Number(data.calendarCount) || 0 };
      return kind === 'file'
        ? { ...base, name: String(data.name || ''), url: String(data.url || ''), mime: String(data.mime || ''), size: Number(data.size) || 0 }
        : { ...base, url: String(data.url || ''), title: String(data.title || ''), image: String(data.image || ''), siteName: String(data.siteName || '') };
    });
    const nextCursor = snap.docs.length === pageSize ? Number(snap.docs[snap.docs.length - 1].data()?.calendarCount) : null;
    res.status(200).json({ ok: true, items, nextCursor });
  } catch (err) {
    console.error('listSharedDataPool failed:', err);
    res.status(500).json({ ok: false });
  }
});

// Writes one tag string back onto whichever document actually owns this photo (a chat/gallery
// message's imageTags[index], a memo's imageTags[index], a directMediaTags[key] entry, or a
// confirmedMeeting's photos[index].tags) -- mirrors handleSaveImageTags's routing in app-main.js,
// just server-side so it can act on any calendar regardless of who's logged into it.
async function applyPhotoIndexTagWrite(calendarId, assetKey, tags) {
  const db = admin.firestore();
  const calendarDocId = `cal_${calendarId}`;
  const indexRef = db.collection('calendars').doc(calendarDocId).collection('photoIndex').doc(assetKey);
  const indexSnap = await indexRef.get();
  if (!indexSnap.exists) return { ok: false, reason: 'not-found' };
  const indexData = indexSnap.data() || {};
  const sourceOwner = String(indexData.sourceOwner || '');
  const match = sourceOwner.match(/^(message|memo|meeting):(.+):(\d+)$/);
  if (!match) return { ok: false, reason: 'unroutable' };
  const [, sourceType, sourceId, imageIndexStr] = match;
  const imageIndex = Number(imageIndexStr);
  const cleanTags = String(tags || '').trim().slice(0, 640);

  if (sourceType === 'meeting') {
    const meetingRef = db.collection('calendars').doc(calendarDocId).collection('confirmedMeetings').doc(sourceId);
    await db.runTransaction(async tx => {
      const snap = await tx.get(meetingRef);
      if (!snap.exists) return;
      const data = snap.data() || {};
      const photos = Array.isArray(data.photos) ? data.photos.slice() : [];
      const target = photos.findIndex((p, i) => (Number.isInteger(p?.index) ? p.index : i) === imageIndex);
      if (target < 0) return;
      photos[target] = { ...photos[target], tags: cleanTags };
      tx.update(meetingRef, { photos });
    });
    return { ok: true };
  }

  const collectionName = sourceType === 'memo' ? 'memos' : 'messages';
  const docRef = db.collection('calendars').doc(calendarDocId).collection(collectionName).doc(sourceId);
  await db.runTransaction(async tx => {
    const snap = await tx.get(docRef);
    if (!snap.exists) return;
    const data = snap.data() || {};
    if (indexData.directMediaUrl) {
      const tagKey = getDirectMediaTagKeyForIndex(indexData.directMediaUrl);
      const directMediaTags = (data.directMediaTags && typeof data.directMediaTags === 'object' && !Array.isArray(data.directMediaTags))
        ? { ...data.directMediaTags } : {};
      directMediaTags[tagKey] = cleanTags;
      tx.update(docRef, { directMediaTags });
      return;
    }
    const entries = getMessageImageEntriesForIndex(data);
    // photoIndex can be one revision behind a delete/reorder. Find the current source slot by
    // immutable asset key first; its historical owner index is only a fallback.
    const target = entries.find(entry => getPhotoAssetKey(entry.imageUrl || entry.thumbUrl) === assetKey)
      || entries.find(entry => entry.index === imageIndex);
    if (!target) return;
    const imageTags = Array.isArray(data.imageTags) ? data.imageTags.slice() : [];
    while (imageTags.length <= target.index) imageTags.push('');
    imageTags[target.index] = cleanTags;
    const imageTagMap = data.imageTagMap && typeof data.imageTagMap === 'object' && !Array.isArray(data.imageTagMap)
      ? { ...data.imageTagMap }
      : {};
    const targetAssetKey = getPhotoAssetKey(target.imageUrl || target.thumbUrl);
    if (targetAssetKey) imageTagMap[targetAssetKey] = cleanTags;
    tx.update(docRef, {
      imageTags,
      imageTagMap: reconcileImageTagMapForIndex({ ...data, imageTags, imageTagMap }, imageTagMap)
    });
  });
  return { ok: true };
}

exports.adminBulkTagPhotos = seoulFunctions().https.onRequest(async (req, res) => {
  setAdminCorsHeaders(res);
  if (req.method === 'OPTIONS') { res.status(204).send(''); return; }
  if (req.method !== 'POST') { res.status(405).json({ ok: false }); return; }
  const { password, entries } = req.body || {};
  if (typeof password !== 'string' || !password.trim()) { res.status(400).json({ ok: false }); return; }
  if (!Array.isArray(entries) || entries.length === 0 || entries.length > 100) { res.status(400).json({ ok: false, message: 'invalid entries' }); return; }
  const rateState = await checkAdminAuthRateLimit(req.ip);
  if (rateState.blocked) { res.status(429).json({ ok: false }); return; }
  const matches = sha256Hex(password.trim()) === await getStoredAdminPasswordHash();
  await recordAdminAuthResult(rateState, matches);
  if (!matches) { res.status(401).json({ ok: false }); return; }
  const results = [];
  for (const entry of entries) {
    const calendarId = String(entry?.calendarId || '');
    const assetKey = String(entry?.assetKey || '');
    if (!CALENDAR_ID_RE.test(calendarId) || !PHOTO_ASSET_KEY_RE.test(assetKey)) {
      results.push({ calendarId, assetKey, ok: false, reason: 'invalid' });
      continue;
    }
    try {
      const outcome = await applyPhotoIndexTagWrite(calendarId, assetKey, entry?.tags);
      results.push({ calendarId, assetKey, ...outcome });
    } catch (err) {
      console.error('applyPhotoIndexTagWrite failed:', err);
      results.push({ calendarId, assetKey, ok: false, reason: 'error' });
    }
  }
  res.status(200).json({ ok: true, results });
});

// Admin "중복사진 검사" 보고서의 병합 실행. 사용자가 요청한 "데이터가 적은 쪽을 많은 쪽으로
// 합쳐주고 데이터가 적은 사진을 제거해줘" 중 병합 절반만 서버에서 수행한다: 태그(해시태그
// 토큰의 합집합)와 댓글(합쳐서 시간순 정렬)을 승자 쪽으로 옮긴다. 의도적으로 패자 사진 자체
// (Storage 객체, 소유 문서의 imageUrls/photos[] 배열 항목)는 여기서 지우지 않는다 -- 그 삭제
// 로직은 이미 클라이언트에 있고(handleDeleteChatMessagePhoto 등, 이번 세션에서 방금 검증한
// 경로) 실사용/테스트가 된 코드라, 같은 로직을 서버에서 라이브 검증 없이 새로 복제하는 것은
// CLAUDE.md의 "데이터 모델을 백업/복구 리허설 없이 바꾸지 않는다" 원칙과 정면으로 부딪힌다.
// 병합이 끝나면 패자의 photoIndex 행에 mergedInto를 표시해 보고서에서 "삭제해도 데이터 유실
// 없음"으로 안내하고, 관리자가 그 캘린더를 열어 기존 라이트박스 삭제 버튼으로 마무리한다.
function mergeTagTokens(...tagStrings) {
  const seen = new Set();
  const tokens = [];
  tagStrings.forEach(str => String(str || '').split(/\s+/).forEach(token => {
    const clean = token.trim();
    if (!clean || seen.has(clean)) return;
    seen.add(clean);
    tokens.push(clean);
  }));
  return tokens.join(' ').slice(0, 160);
}

exports.mergeDedupPhotos = seoulFunctions().https.onRequest(async (req, res) => {
  setAdminCorsHeaders(res);
  if (req.method === 'OPTIONS') { res.status(204).send(''); return; }
  if (req.method !== 'POST') { res.status(405).json({ ok: false }); return; }
  const { password, calendarId, winnerAssetKey, loserAssetKey } = req.body || {};
  if (typeof password !== 'string' || !password.trim()) { res.status(400).json({ ok: false }); return; }
  if (!CALENDAR_ID_RE.test(String(calendarId || '')) || !PHOTO_ASSET_KEY_RE.test(String(winnerAssetKey || '')) || !PHOTO_ASSET_KEY_RE.test(String(loserAssetKey || ''))) {
    res.status(400).json({ ok: false, message: 'invalid ids' }); return;
  }
  if (winnerAssetKey === loserAssetKey) { res.status(400).json({ ok: false, message: 'same asset' }); return; }
  const rateState = await checkAdminAuthRateLimit(req.ip);
  if (rateState.blocked) { res.status(429).json({ ok: false }); return; }
  const matches = sha256Hex(password.trim()) === await getStoredAdminPasswordHash();
  await recordAdminAuthResult(rateState, matches);
  if (!matches) { res.status(401).json({ ok: false }); return; }
  try {
    const db = admin.firestore();
    const calendarDocId = `cal_${calendarId}`;
    const indexColl = db.collection('calendars').doc(calendarDocId).collection('photoIndex');
    const [winnerSnap, loserSnap] = await Promise.all([indexColl.doc(winnerAssetKey).get(), indexColl.doc(loserAssetKey).get()]);
    if (!winnerSnap.exists || !loserSnap.exists) { res.status(404).json({ ok: false, message: 'not-found' }); return; }
    const winnerData = winnerSnap.data() || {};
    const loserData = loserSnap.data() || {};

    const mergedTags = mergeTagTokens(winnerData.tags, loserData.tags);
    if (mergedTags !== String(winnerData.tags || '')) {
      const tagOutcome = await applyPhotoIndexTagWrite(calendarId, winnerAssetKey, mergedTags);
      if (!tagOutcome.ok) { res.status(200).json({ ok: false, reason: `tag-${tagOutcome.reason || 'failed'}` }); return; }
    }

    const commentsColl = db.collection('calendars').doc(calendarDocId).collection('photoComments');
    const [winnerCommentsSnap, loserCommentsSnap] = await Promise.all([commentsColl.doc(winnerAssetKey).get(), commentsColl.doc(loserAssetKey).get()]);
    const winnerComments = Array.isArray(winnerCommentsSnap.data()?.comments) ? winnerCommentsSnap.data().comments : [];
    const loserComments = Array.isArray(loserCommentsSnap.data()?.comments) ? loserCommentsSnap.data().comments : [];
    let mergedCommentCount = winnerComments.length;
    if (loserComments.length > 0) {
      const merged = [...winnerComments, ...loserComments]
        .sort((a, b) => Number(a?.timestamp || 0) - Number(b?.timestamp || 0))
        .slice(0, 200);
      await commentsColl.doc(winnerAssetKey).set({ comments: merged }, { merge: true });
      await commentsColl.doc(loserAssetKey).delete();
      mergedCommentCount = merged.length;
    }

    await indexColl.doc(loserAssetKey).set({ mergedInto: winnerAssetKey, mergedAt: Date.now() }, { merge: true });

    res.status(200).json({ ok: true, mergedTags, mergedCommentCount });
  } catch (err) {
    console.error('mergeDedupPhotos failed:', err);
    res.status(500).json({ ok: false });
  }
});

// Admin-only aggregate health view for Web Push subscriptions. Endpoints and encryption keys
// are never returned; this is intentionally a diagnostic summary to explain missed pushes and
// bound fan-out costs without exposing credentials.
exports.listPushSubscriptionHealth = seoulFunctions().https.onRequest(async (req, res) => {
  setAdminCorsHeaders(res);
  if (req.method === 'OPTIONS') { res.status(204).send(''); return; }
  if (req.method !== 'POST') { res.status(405).json({ ok: false }); return; }
  const { password, calendarId } = req.body || {};
  if (typeof password !== 'string' || !password.trim() || !/^[A-Za-z0-9_-]{1,64}$/.test(String(calendarId || ''))) { res.status(400).json({ ok: false }); return; }
  const rateState = await checkAdminAuthRateLimit(req.ip);
  if (rateState.blocked) { res.status(429).json({ ok: false }); return; }
  const matches = sha256Hex(password.trim()) === await getStoredAdminPasswordHash();
  await recordAdminAuthResult(rateState, matches);
  if (!matches) { res.status(401).json({ ok: false }); return; }
  try {
    const snap = await admin.firestore().collection('calendars').doc(`cal_${calendarId}`).collection('push_subscriptions').limit(1000).get();
    const now = Date.now();
    const summary = { total: snap.size, active: 0, stale30d: 0, sent: 0, failed: 0, channels: { chat: 0, comment: 0, memo: 0, poll: 0, schedule: 0 } };
    snap.forEach(doc => {
      const data = doc.data() || {};
      if (data.lastPushStatus === 'sent') summary.sent += 1;
      if (data.lastPushStatus && data.lastPushStatus !== 'sent') summary.failed += 1;
      if (now - Number(data.lastSeenAt || data.updatedAt || data.createdAt || 0) > 30 * 24 * 60 * 60 * 1000) summary.stale30d += 1;
      else summary.active += 1;
      const channels = data.channels && typeof data.channels === 'object' ? data.channels : { chat: true };
      Object.keys(summary.channels).forEach(channel => { if (channels[channel] !== false) summary.channels[channel] += 1; });
    });
    res.status(200).json({ ok: true, calendarId, summary, generatedAt: now });
  } catch (err) {
    console.error('listPushSubscriptionHealth failed:', err);
    res.status(500).json({ ok: false });
  }
});

// Changes the admin password after verifying the current one server-side -- appConfig/adminAuth
// no longer accepts a direct client write, so this is the only way to change it now.
exports.adminChangePassword = seoulFunctions().https.onRequest(async (req, res) => {
  setAdminCorsHeaders(res);
  if (req.method === 'OPTIONS') { res.status(204).send(''); return; }
  if (req.method !== 'POST') { res.status(405).json({ ok: false, message: 'Method not allowed' }); return; }
  const { oldPassword, newPasswordHash } = req.body || {};
  if (!oldPassword || typeof oldPassword !== 'string') { res.status(400).json({ ok: false, message: 'oldPassword is required' }); return; }
  if (!newPasswordHash || typeof newPasswordHash !== 'string' || !/^[a-f0-9]{64}$/.test(newPasswordHash)) {
    res.status(400).json({ ok: false, message: 'newPasswordHash must be a sha256 hex digest' });
    return;
  }

  const rateState = await checkAdminAuthRateLimit(req.ip);
  if (rateState.blocked) { res.status(429).json({ ok: false, message: '너무 많은 시도가 있었습니다. 잠시 후 다시 시도해 주세요.' }); return; }

  const storedHash = await getStoredAdminPasswordHash();
  const matches = sha256Hex(oldPassword.trim()) === storedHash;
  await recordAdminAuthResult(rateState, matches);
  if (!matches) { res.status(401).json({ ok: false, message: '현재 비밀번호가 올바르지 않습니다.' }); return; }

  try {
    await admin.firestore().collection('appConfig').doc('adminAuth').set({
      passwordHash: newPasswordHash,
      updatedAt: Date.now()
    });
    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('adminChangePassword failed:', err);
    res.status(500).json({ ok: false, message: '비밀번호 변경에 실패했습니다.' });
  }
});

// adminAuthAttempts (one doc per IP that's ever failed an admin login) and proxyRateLimits (one
// doc per IP+endpoint that's ever called peekalinkProxy/kakaoLocalSearchProxy) both accumulate
// permanently -- nothing ever deletes an old doc once its lockout/rate-limit window has passed.
// Both windows are well under a day (15 minutes and 1 hour respectively), so anything with a
// windowStart older than 24h is unambiguously stale and safe to prune. Runs daily alongside the
// existing sendAnniversaryReminders schedule.
exports.pruneStaleRateLimitDocs = functions.region(SEOUL_REGION).pubsub.schedule('30 9 * * *').timeZone('Asia/Seoul').onRun(async () => {
  const cutoff = Date.now() - 24 * 60 * 60 * 1000;
  const db = admin.firestore();
  for (const collectionName of ['adminAuthAttempts', 'proxyRateLimits']) {
    const snap = await db.collection(collectionName).where('windowStart', '<', cutoff).get();
    if (snap.empty) continue;
    const batch = db.batch();
    snap.forEach(doc => batch.delete(doc.ref));
    await batch.commit();
    console.log(`Pruned ${snap.size} stale doc(s) from ${collectionName}`);
  }
  return null;
});

// Production admin path: same rebuild as the emulator helper, but gated by the admin password
// (identical check to listAllCalendars / listServerAuditLogs). Dry-run by default; pass
// apply:true to write. Never relaxes Firestore photoIndex write:false for clients.
// P3 photo commands (docs/data-architecture-v3.md §3.5): multi-document photo edits run here in
// one transaction instead of as a chain of client writes. No auth yet (P2 adds membership
// checks); rate limited per IP and scoped to one calendar id per request.
const MEDIA_COMMAND_OPS = new Set(['deleteAsset', 'tagAsset', 'bulkTagAssets', 'mergeAssets']);
// Both regions permanently: the app calls Seoul and falls back to us-central1, and app builds
// cached before the move only know the us-central1 URL. An idle copy costs nothing.
exports.mediaCommand = functions.region(SEOUL_REGION, 'us-central1').runWith({ timeoutSeconds: 60, memory: '256MB' }).https.onRequest(async (req, res) => {
  setAdminCorsHeaders(res);
  if (req.method === 'OPTIONS') { res.status(204).send(''); return; }
  if (req.method !== 'POST') { res.status(405).json({ ok: false }); return; }
  const { calendarId, op, asset, tags, items, extras } = req.body || {};
  if (!CALENDAR_ID_RE.test(String(calendarId || '')) || !MEDIA_COMMAND_OPS.has(op)) { res.status(400).json({ ok: false, reason: 'invalid' }); return; }
  const isHttpUrl = value => /^https?:\/\//i.test(String(value || ''));
  const isStorageUrl = value => /^https:\/\/firebasestorage\.googleapis\.com\//i.test(String(value || ''));
  if (op === 'bulkTagAssets') {
    if (!Array.isArray(items) || !items.length || items.length > mediaCommands.MAX_BULK_TAG_ITEMS
      || items.some(item => !isHttpUrl(item?.imageUrl || item?.full || item?.thumbUrl || item?.thumb))) {
      res.status(400).json({ ok: false, reason: 'invalid-items' }); return;
    }
  }
  if (op === 'mergeAssets' && (!Array.isArray(extras) || !extras.length || extras.length > mediaCommands.MAX_MERGE_EXTRAS
    || extras.some(item => !isStorageUrl(item?.imageUrl) && !isStorageUrl(item?.thumbUrl)))) {
    res.status(400).json({ ok: false, reason: 'invalid-items' }); return;
  }
  const imageUrl = String(asset?.imageUrl || '');
  const thumbUrl = String(asset?.thumbUrl || '');
  // Keep the established mutation surface for the original one-photo commands. Only the
  // new batch command supports externally hosted direct-media URLs, and it still resolves the
  // owner from its canonical photoIndex row before writing (media-commands.js).
  if (op !== 'bulkTagAssets' && ![imageUrl, thumbUrl].some(isStorageUrl)) { res.status(400).json({ ok: false, reason: 'invalid-asset' }); return; }
  if (!(await checkProxyRateLimit('mediaCommand', req.ip, 60 * 1000, 60))) { res.status(429).json({ ok: false }); return; }
  const db = admin.firestore();
  const calendarDocId = `cal_${calendarId}`;
  const calendarSnap = await db.collection('calendars').doc(calendarDocId).get();
  if (!calendarSnap.exists) { res.status(404).json({ ok: false, reason: 'calendar' }); return; }
  const cleanAsset = {
    imageUrl, thumbUrl,
    messageId: typeof asset?.messageId === 'string' ? asset.messageId.slice(0, 200) : '',
    memoId: typeof asset?.memoId === 'string' ? asset.memoId.slice(0, 200) : '',
  };
  const cleanRef = item => ({
    imageUrl: String(item?.imageUrl || ''),
    thumbUrl: String(item?.thumbUrl || ''),
    messageId: typeof item?.messageId === 'string' ? item.messageId.slice(0, 200) : '',
    memoId: typeof item?.memoId === 'string' ? item.memoId.slice(0, 200) : '',
  });
  try {
    if (op === 'mergeAssets') {
      const merged = await mediaCommands.mergeAssets({
        db,
        bucket: admin.storage().bucket(),
        calendarDocId,
        keep: cleanAsset,
        extras: extras.map(cleanRef),
        tags: String(tags || ''),
        claimMemoPush: (before, after, memoId) => decideMemoNotification(before, after, { memoId })?.claimKey || '',
      });
      res.status(merged.ok ? 200 : 400).json(merged);
      return;
    }
    const result = op === 'deleteAsset'
      ? await mediaCommands.deleteAsset({ db, calendarDocId, asset: cleanAsset })
      : (op === 'tagAsset'
        ? await mediaCommands.tagAsset({ db, calendarDocId, asset: cleanAsset, tags: String(tags || '') })
        : await mediaCommands.bulkTagAssets({
          db,
          calendarDocId,
          items: items.map(item => ({
            imageUrl: String(item?.imageUrl || item?.full || ''),
            thumbUrl: String(item?.thumbUrl || item?.thumb || ''),
            messageId: typeof item?.messageId === 'string' ? item.messageId.slice(0, 200) : '',
            memoId: typeof item?.memoId === 'string' ? item.memoId.slice(0, 200) : '',
            directMediaUrl: typeof item?.directMediaUrl === 'string' ? item.directMediaUrl.slice(0, 2048) : '',
            tags: String(item?.tags || '').slice(0, 640),
          }))
        }));
    res.status(result.ok ? 200 : 400).json(result);
  } catch (err) {
    console.error(`mediaCommand ${op} failed:`, err);
    res.status(500).json({ ok: false, reason: 'error' });
  }
});

function hasValidMediaWorkerToken(req) {
  const header = String(req.get('authorization') || '');
  const supplied = header.match(/^Bearer\s+(.+)$/i)?.[1]?.trim() || '';
  const expected = String(process.env.MOYEORA_MEDIA_WORKER_TOKEN || MEDIA_WORKER_TOKEN.value() || '').trim();
  if (!supplied || !expected) return false;
  const left = Buffer.from(supplied, 'utf8');
  const right = Buffer.from(expected, 'utf8');
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

// 맥 백업 (어드민 '맥 백업' 탭): the admin asks for a backup; the Mac picks the request up on
// its next 15-minute check (macWorkerSync, worker token) and reports the result back. Only a
// timestamp and the backup summary are stored -- never a key, passphrase or file content.
const MAC_BACKUP_DOC = () => admin.firestore().collection('adminOps').doc('macBackup');

function sanitizeMacBackupResult(raw = {}) {
  const text = (value, max) => String(value == null ? '' : value).slice(0, max);
  const num = value => (Number.isFinite(Number(value)) ? Number(value) : 0);
  return {
    ok: raw.ok === true,
    at: num(raw.at) || Date.now(),
    file: text(raw.file, 300),
    folder: text(raw.folder, 300),
    sizeBytes: num(raw.sizeBytes),
    withSecrets: raw.withSecrets === true,
    agents: num(raw.agents),
    repos: num(raw.repos),
    host: text(raw.host, 80),
    warnings: (Array.isArray(raw.warnings) ? raw.warnings : []).slice(0, 20).map(item => text(item, 200)),
    error: text(raw.error, 500),
    passphraseCreated: raw.passphraseCreated === true
  };
}

exports.macBackupAdmin = seoulFunctions().https.onRequest(async (req, res) => {
  setAdminCorsHeaders(res);
  if (req.method === 'OPTIONS') { res.status(204).send(''); return; }
  if (req.method !== 'POST') { res.status(405).json({ ok: false }); return; }
  const { password, action } = req.body || {};
  if (typeof password !== 'string' || !password.trim()) { res.status(400).json({ ok: false }); return; }
  const rateState = await checkAdminAuthRateLimit(req.ip);
  if (rateState.blocked) { res.status(429).json({ ok: false }); return; }
  const matches = sha256Hex(password.trim()) === await getStoredAdminPasswordHash();
  await recordAdminAuthResult(rateState, matches);
  if (!matches) { res.status(401).json({ ok: false }); return; }
  const ref = MAC_BACKUP_DOC();
  if (action === 'request') {
    await ref.set({ requestedAt: Date.now() }, { merge: true });
  }
  const snap = await ref.get();
  res.status(200).json({ ok: true, state: snap.exists ? snap.data() : {} });
});

exports.macWorkerSync = seoulFunctions().runWith({ secrets: [MEDIA_WORKER_TOKEN] }).https.onRequest(async (req, res) => {
  if (req.method !== 'POST') { res.status(405).json({ ok: false }); return; }
  if (!hasValidMediaWorkerToken(req)) { res.status(401).json({ ok: false }); return; }
  const ref = MAC_BACKUP_DOC();
  const update = { lastSeenAt: Date.now() };
  if (req.body?.backup && typeof req.body.backup === 'object') {
    update.lastResult = sanitizeMacBackupResult(req.body.backup);
    update.handledRequestAt = Number(req.body.handledRequestAt) || 0;
  }
  await ref.set(update, { merge: true });
  const snap = await ref.get();
  const data = snap.data() || {};
  const pending = Number(data.requestedAt || 0) > Number(data.handledRequestAt || 0);
  res.status(200).json({ ok: true, backupRequestedAt: pending ? Number(data.requestedAt) : 0 });
});

// Receives metadata generated by the opted-in macOS worker.  It deliberately accepts no image
// bytes or arbitrary URLs: originals remain in Firebase Storage, and a result can only reference
// an existing canonical asset key.  Existing user tags are never changed by this endpoint.
// Face-name suggestions from the local face worker (kind: 'faces'). Only the face fields are
// merged, so the Vision result, its review and lastReceivedAt (the AI 분석 feed order) stay as
// they are. Like Vision results, a suggestion is accepted only for a photo still in photoIndex.
async function ingestFaceSuggestions(req, res, calendarId, rawItems, now) {
  const keys = Array.from(new Set(rawItems.map(item => String(item?.assetKey || '')).filter(key => PHOTO_ASSET_KEY_RE.test(key))));
  if (rawItems.length > 0 && !keys.length) { res.status(400).json({ ok: false, message: 'No valid face items' }); return; }
  const db = admin.firestore();
  const calendarRef = db.collection('calendars').doc(`cal_${calendarId}`);
  try {
    if (!(await calendarRef.get()).exists) { res.status(404).json({ ok: false, message: 'Calendar not found' }); return; }
    const photoSnaps = keys.length ? await db.getAll(...keys.map(key => calendarRef.collection('photoIndex').doc(key))) : [];
    const live = new Set(photoSnaps.filter(snap => snap.exists).map(snap => snap.id));
    const analysisSnaps = keys.length ? await db.getAll(...keys.map(key => calendarRef.collection('mediaAnalysis').doc(stableAnalysisId(key)))) : [];
    const rejectedByKey = new Map(analysisSnaps.map((snap, index) => [keys[index], snap.exists ? (snap.data()?.faceRejected || []) : []]));
    const accepted = [];
    rawItems.forEach(raw => {
      const key = String(raw?.assetKey || '');
      if (!live.has(key)) return;
      const item = sanitizeFaceItem(raw, rejectedByKey.get(key), now);
      if (item) accepted.push(item);
    });
    const workerId = String(req.body?.workerId || 'macos-faces').replace(/[^A-Za-z0-9_-]/g, '').slice(0, 80) || 'macos-faces';
    const batch = db.batch();
    accepted.forEach(item => {
      batch.set(calendarRef.collection('mediaAnalysis').doc(item.id), { ...item, faceWorkerId: workerId, faceReceivedAt: now }, { merge: true });
    });
    batch.set(calendarRef.collection('mediaAnalysisWorkerState').doc(workerId), {
      workerId,
      status: String(req.body?.status || 'completed').replace(/[^a-z-]/g, '').slice(0, 24) || 'completed',
      lastHeartbeatAt: now,
      lastSuccessAt: now,
      latestSummary: { received: rawItems.length, accepted: accepted.length, withPeople: accepted.filter(item => item.faceSuggested).length }
    }, { merge: true });
    await batch.commit();
    res.status(200).json({ ok: true, accepted: accepted.length, skippedDeleted: keys.length - live.size });
  } catch (error) {
    console.error('ingestFaceSuggestions failed:', error);
    res.status(500).json({ ok: false, message: 'Face suggestion upload failed' });
  }
}

exports.ingestMediaAnalysis = seoulFunctions().runWith({
  timeoutSeconds: 60,
  memory: '256MB',
  secrets: [MEDIA_WORKER_TOKEN]
}).https.onRequest(async (req, res) => {
  setAdminCorsHeaders(res);
  if (req.method === 'OPTIONS') { res.status(204).send(''); return; }
  if (req.method !== 'POST') { res.status(405).json({ ok: false, message: 'Method not allowed' }); return; }
  if (!hasValidMediaWorkerToken(req)) { res.status(401).json({ ok: false, message: 'Worker authorization failed' }); return; }
  const calendarId = String(req.body?.calendarId || '');
  const rawItems = req.body?.items;
  if (!CALENDAR_ID_RE.test(calendarId) || !Array.isArray(rawItems) || rawItems.length > MAX_BATCH_ITEMS) {
    res.status(400).json({ ok: false, message: 'Invalid analysis batch' });
    return;
  }
  if (!(await checkProxyRateLimit('mediaAnalysisIngest', req.ip, 60 * 1000, 30))) {
    res.status(429).json({ ok: false, message: 'Too many requests' });
    return;
  }
  const now = Date.now();
  if (req.body?.kind === 'faces') {
    await ingestFaceSuggestions(req, res, calendarId, rawItems, now);
    return;
  }
  const items = rawItems.map(item => sanitizeAnalysisItem(item, now)).filter(Boolean);
  if (rawItems.length > 0 && !items.length) { res.status(400).json({ ok: false, message: 'No valid analysis items' }); return; }
  const db = admin.firestore();
  const calendarRef = db.collection('calendars').doc(`cal_${calendarId}`);
  try {
    if (!(await calendarRef.get()).exists) { res.status(404).json({ ok: false, message: 'Calendar not found' }); return; }
    // The worker can only write a recommendation for an asset that is still in the canonical
    // server photo index.  This keeps a delayed local retry from resurrecting a deleted photo and
    // makes the "asset key only" contract above enforceable instead of documentary.
    const sourceRefs = items.map(item => calendarRef.collection('photoIndex').doc(item.assetKey));
    const sourceSnaps = sourceRefs.length ? await db.getAll(...sourceRefs) : [];
    const liveKeys = new Set(sourceSnaps.filter(snapshot => snapshot.exists).map(snapshot => snapshot.id));
    const acceptedItems = items.filter(item => liveKeys.has(item.assetKey));
    if (items.length && !acceptedItems.length) { res.status(409).json({ ok: false, message: 'Source photos no longer exist' }); return; }
    const runId = String(req.body?.runId || '').replace(/[^A-Za-z0-9_-]/g, '').slice(0, 96) || crypto.randomUUID();
    const workerId = String(req.body?.workerId || 'macos-local').replace(/[^A-Za-z0-9_-]/g, '').slice(0, 80) || 'macos-local';
    const status = String(req.body?.status || (items.length ? 'completed' : 'idle')).replace(/[^a-z-]/g, '').slice(0, 24) || 'idle';
    const batch = admin.firestore().batch();
    for (const item of acceptedItems) {
      const target = calendarRef.collection('mediaAnalysis').doc(item.id);
      batch.set(target, {
        ...item,
        workerId,
        lastReceivedAt: now
      }, { merge: true });
    }
    const summary = summarize(acceptedItems);
    const workerState = {
      workerId,
      status,
      lastHeartbeatAt: now,
      lastError: String(req.body?.error || '').slice(0, 500),
      latestRunId: runId,
      latestSummary: summary
    };
    // Do not erase the last known-good run when a later heartbeat reports a failure.  The
    // watchdog uses the two timestamps together to distinguish a fresh failure from a stale
    // worker, and preserving this value makes recovery auditable.
    if (status === 'completed' || status === 'idle') workerState.lastSuccessAt = now;
    if (Array.isArray(req.body?.similarGroups)) {
      // Firestore cannot hold nested arrays, so each group is { assetKeys: [...] }.
      workerState.similarGroups = sanitizeSimilarGroups(req.body.similarGroups);
      workerState.similarGroupsAt = now;
    }
    batch.set(calendarRef.collection('mediaAnalysisWorkerState').doc(workerId), workerState, { merge: true });
    batch.set(calendarRef.collection('mediaAnalysisRuns').doc(runId), {
      calendarId,
      runId,
      workerId,
      receivedAt: now,
      status,
      summary,
      window: String(req.body?.window || '').slice(0, 32),
      workerVersion: String(req.body?.workerVersion || '').slice(0, 40)
    }, { merge: true });
    await batch.commit();
    res.status(200).json({ ok: true, runId, accepted: acceptedItems.length, skippedDeleted: items.length - acceptedItems.length, summary });
  } catch (error) {
    console.error('ingestMediaAnalysis failed:', error);
    res.status(500).json({ ok: false, message: 'Analysis upload failed' });
  }
});

const MEDIA_ANALYSIS_REVIEW_DECISIONS = new Set(['applied', 'edited', 'rejected']);
function sanitizeMediaAnalysisFeedbackTags(value) {
  const source = Array.isArray(value) ? value : [];
  return Array.from(new Set(source
    .map(item => String(item || '').replace(/^#+/, '').replace(/\s+/g, ' ').trim().slice(0, 80))
    .filter(Boolean))).slice(0, MAX_TAGS);
}

// A review is an explicit user action, never a worker write. It remains beside the analysis
// result for cross-device visibility and is also recorded as a compact calibration signal for a
// future local-only personalized model. It cannot touch the original photo, tags, or comments.
exports.recordMediaAnalysisFeedback = seoulFunctions().runWith({
  timeoutSeconds: 30,
  memory: '256MB'
}).https.onRequest(async (req, res) => {
  setAdminCorsHeaders(res);
  if (req.method === 'OPTIONS') { res.status(204).send(''); return; }
  if (req.method !== 'POST') { res.status(405).json({ ok: false, message: 'Method not allowed' }); return; }
  const calendarId = String(req.body?.calendarId || '');
  const assetKey = String(req.body?.assetKey || '');
  const decision = String(req.body?.decision || '');
  if (!CALENDAR_ID_RE.test(calendarId) || !PHOTO_ASSET_KEY_RE.test(assetKey) || !MEDIA_ANALYSIS_REVIEW_DECISIONS.has(decision)) {
    res.status(400).json({ ok: false, message: 'Invalid analysis feedback' });
    return;
  }
  if (!(await checkProxyRateLimit('mediaAnalysisFeedback', req.ip, 60 * 1000, 40))) {
    res.status(429).json({ ok: false, message: 'Too many review requests' });
    return;
  }
  const proposedTags = sanitizeMediaAnalysisFeedbackTags(req.body?.proposedTags);
  const acceptedTags = decision === 'rejected' ? [] : sanitizeMediaAnalysisFeedbackTags(req.body?.acceptedTags);
  const finalTags = decision === 'rejected' ? [] : sanitizeMediaAnalysisFeedbackTags(req.body?.finalTags);
  const now = Date.now();
  const analysisId = stableAnalysisId(assetKey);
  const calendarRef = admin.firestore().collection('calendars').doc(`cal_${calendarId}`);
  const photoRef = calendarRef.collection('photoIndex').doc(assetKey);
  const analysisRef = calendarRef.collection('mediaAnalysis').doc(analysisId);
  try {
    const [photoSnap, analysisSnap] = await admin.firestore().getAll(photoRef, analysisRef);
    if (!photoSnap.exists) { res.status(404).json({ ok: false, message: 'Source photo no longer exists' }); return; }
    if (!analysisSnap.exists) { res.status(404).json({ ok: false, message: 'Analysis result no longer exists' }); return; }
    const previousReview = analysisSnap.data()?.review || {};
    const review = {
      decision,
      proposedTags,
      acceptedTags,
      finalTags,
      reviewedAt: now,
      reviewCount: Math.max(0, Number(previousReview.reviewCount) || 0) + 1
    };
    const batch = admin.firestore().batch();
    batch.set(analysisRef, { review }, { merge: true });
    batch.set(calendarRef.collection('mediaAnalysisFeedback').doc(analysisId), {
      assetKey,
      analysisId,
      decision,
      proposedTags,
      acceptedTags,
      finalTags,
      labels: Array.isArray(analysisSnap.data()?.labels)
        ? analysisSnap.data().labels.map(label => String(label?.name || '')).filter(Boolean).slice(0, 16)
        : [],
      analysisVersion: Math.max(1, Number(analysisSnap.data()?.analysisVersion) || 1),
      lastReviewedAt: now,
      reviewCount: admin.firestore.FieldValue.increment(1)
    }, { merge: true });
    await batch.commit();
    res.status(200).json({ ok: true, review });
  } catch (error) {
    console.error('recordMediaAnalysisFeedback failed:', error);
    res.status(500).json({ ok: false, message: 'Analysis feedback save failed' });
  }
});

// "아니에요" on a face suggestion: the family says this person is not in these photos. The name is
// remembered per photo (faceRejected) and filtered from every later face upload for that photo.
// It only ever hides a suggestion; it cannot touch the photo, its tags or comments.
exports.recordFaceFeedback = seoulFunctions().runWith({
  timeoutSeconds: 30,
  memory: '256MB'
}).https.onRequest(async (req, res) => {
  setAdminCorsHeaders(res);
  if (req.method === 'OPTIONS') { res.status(204).send(''); return; }
  if (req.method !== 'POST') { res.status(405).json({ ok: false, message: 'Method not allowed' }); return; }
  const calendarId = String(req.body?.calendarId || '');
  const name = faceName(req.body?.name);
  const assetKeys = Array.isArray(req.body?.assetKeys)
    ? Array.from(new Set(req.body.assetKeys.map(String).filter(key => PHOTO_ASSET_KEY_RE.test(key))))
    : [];
  if (!CALENDAR_ID_RE.test(calendarId) || !name || !assetKeys.length || assetKeys.length > 60) {
    res.status(400).json({ ok: false, message: 'Invalid face feedback' });
    return;
  }
  if (!(await checkProxyRateLimit('faceFeedback', req.ip, 60 * 1000, 30))) {
    res.status(429).json({ ok: false, message: 'Too many requests' });
    return;
  }
  const db = admin.firestore();
  const calendarRef = db.collection('calendars').doc(`cal_${calendarId}`);
  try {
    const refs = assetKeys.map(key => calendarRef.collection('mediaAnalysis').doc(stableAnalysisId(key)));
    const snaps = await db.getAll(...refs);
    const now = Date.now();
    const batch = db.batch();
    let updated = 0;
    snaps.forEach((snap, index) => {
      if (!snap.exists) return;
      const facePeople = (snap.data()?.facePeople || []).filter(entry => faceName(entry?.name) !== name);
      batch.set(refs[index], {
        faceRejected: admin.firestore.FieldValue.arrayUnion(name),
        facePeople,
        faceSuggested: facePeople.length > 0,
        faceRejectedAt: now
      }, { merge: true });
      updated += 1;
    });
    if (updated) await batch.commit();
    res.status(200).json({ ok: true, updated });
  } catch (error) {
    console.error('recordFaceFeedback failed:', error);
    res.status(500).json({ ok: false, message: 'Face feedback save failed' });
  }
});

// The local Mac receives only compact, user-reviewed calibration signals. The same worker secret
// used for ingestion is required; no browser can enumerate this private feedback collection.
exports.getMediaAnalysisCalibration = seoulFunctions().runWith({
  timeoutSeconds: 30,
  memory: '256MB',
  secrets: [MEDIA_WORKER_TOKEN]
}).https.onRequest(async (req, res) => {
  setAdminCorsHeaders(res);
  if (req.method === 'OPTIONS') { res.status(204).send(''); return; }
  if (req.method !== 'POST') { res.status(405).json({ ok: false, message: 'Method not allowed' }); return; }
  if (!hasValidMediaWorkerToken(req)) { res.status(401).json({ ok: false, message: 'Worker authorization failed' }); return; }
  const calendarId = String(req.body?.calendarId || '');
  if (!CALENDAR_ID_RE.test(calendarId)) { res.status(400).json({ ok: false, message: 'Invalid calendar' }); return; }
  if (!(await checkProxyRateLimit('mediaAnalysisCalibration', req.ip, 60 * 1000, 30))) {
    res.status(429).json({ ok: false, message: 'Too many calibration requests' });
    return;
  }
  try {
    const snapshot = await admin.firestore().collection('calendars').doc(`cal_${calendarId}`)
      .collection('mediaAnalysisFeedback').orderBy('lastReviewedAt', 'desc').limit(300).get();
    const signals = snapshot.docs.map(doc => {
      const data = doc.data() || {};
      return {
        decision: String(data.decision || ''),
        labels: sanitizeMediaAnalysisFeedbackTags(data.labels).slice(0, 16),
        proposedTags: sanitizeMediaAnalysisFeedbackTags(data.proposedTags),
        acceptedTags: sanitizeMediaAnalysisFeedbackTags(data.acceptedTags),
        reviewedAt: Math.max(0, Number(data.lastReviewedAt) || 0)
      };
    }).filter(signal => signal.labels.length && MEDIA_ANALYSIS_REVIEW_DECISIONS.has(signal.decision));
    res.status(200).json({ ok: true, calendarId, signals, generatedAt: Date.now() });
  } catch (error) {
    console.error('getMediaAnalysisCalibration failed:', error);
    res.status(500).json({ ok: false, message: 'Calibration read failed' });
  }
});

function formatBriefDate(date = new Date()) {
  return new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul', year: 'numeric', month: 'long', day: 'numeric', weekday: 'short'
  }).format(date);
}

function mediaWorkerIsStale(workerState, now = Date.now()) {
  const heartbeat = Number(workerState?.lastHeartbeatAt || 0);
  // An idle Mac (no new photos) reports in only every 12 hours -- it no longer calls the server
  // every 15 minutes just to say it is alive. 26 hours still flags a Mac that stopped for a day.
  return !heartbeat || now - heartbeat > 26 * 60 * 60 * 1000;
}

async function collectMediaBriefCalendars(db, dateKey, now = Date.now()) {
  const calendarSnap = await db.collection('calendars').select('calendar').get();
  const reports = await Promise.all(calendarSnap.docs.map(async calendarDoc => {
    const calendarId = calendarDoc.id.startsWith('cal_') ? calendarDoc.id.slice(4) : calendarDoc.id;
    if (!CALENDAR_ID_RE.test(calendarId)) return null;
    const [workerSnap, runSnap] = await Promise.all([
      calendarDoc.ref.collection('mediaAnalysisWorkerState').doc('macos-vision-m2').get(),
      calendarDoc.ref.collection('mediaAnalysisRuns').doc(`macos_${calendarId}_${dateKey.replace(/-/g, '')}`).get()
    ]);
    // The service digest includes every calendar where the opted-in worker wrote a heartbeat or
    // run. Other shared/test calendars never leak into the recipient's morning email.
    if (!workerSnap.exists && !runSnap.exists) return null;
    const worker = workerSnap.data() || {};
    const run = runSnap.data() || {};
    const calendar = calendarDoc.data()?.calendar || {};
    const stale = mediaWorkerIsStale(worker, now);
    const healthLabel = stale ? '생존 신호 확인' : worker.status === 'idle' ? '대기' : '정상';
    return {
      id: calendarId,
      name: String(calendar.title || calendar.name || calendarId),
      summary: run.summary || worker.latestSummary || {},
      stale,
      healthLabel
    };
  }));
  return reports.filter(Boolean);
}

async function sendResendMail({ apiKey, from, subject, html, text, idempotencyKey }) {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'Idempotency-Key': idempotencyKey
    },
    body: JSON.stringify({ from, to: [MEDIA_BRIEF_RECIPIENT], subject, html, text })
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload?.id) throw new Error(String(payload?.message || `Email provider failed (${response.status})`).slice(0, 500));
  return String(payload.id);
}

async function sendNaverSmtpMail({ account, appPassword, subject, html, text, dateKey }) {
  const transport = nodemailer.createTransport({
    host: 'smtp.naver.com',
    port: 587,
    secure: false,
    requireTLS: true,
    auth: { user: account, pass: appPassword },
    connectionTimeout: 20_000,
    greetingTimeout: 20_000,
    socketTimeout: 60_000,
    tls: { minVersion: 'TLSv1.2' }
  });
  try {
    const info = await transport.sendMail({
      from: `모여라 캘린더 <${account}>`,
      to: [MEDIA_BRIEF_RECIPIENT],
      subject,
      html,
      text,
      // SMTP has no provider-level idempotency API. A deterministic Message-ID allows mail
      // clients and gateways to coalesce a retry caused by an interrupted response.
      messageId: `<moyeora-media-brief-${String(dateKey).replace(/[^0-9]/g, '')}@moyeora-calendar.local>`,
      headers: { 'X-Moyeora-Brief': String(dateKey) }
    });
    return String(info.messageId || info.response || 'smtp-accepted');
  } finally {
    transport.close();
  }
}

// Four scheduled opportunities during the weekday 08:00 hour. Resend accepts the deterministic
// idempotency key; SMTP receives a stable Message-ID, while Firestore records each state for
// recovery and prevents all later scheduled slots after a confirmed send.
exports.sendDailyMediaAnalysisBrief = functions.region(SEOUL_REGION).runWith({
  timeoutSeconds: 120,
  memory: '256MB',
  secrets: [RESEND_API_KEY, MEDIA_BRIEF_FROM, NAVER_SMTP_APP_PASSWORD]
}).pubsub.schedule('0,15,30,45 8 * * 1-5').timeZone('Asia/Seoul').onRun(async () => {
  const now = Date.now();
  const dateKey = getKstDateKey(new Date(now));
  const db = admin.firestore();
  const reportRef = db.collection('operationsMediaBriefs').doc(`media-analysis-${dateKey}`);
  const existing = await reportRef.get();
  if (existing.data()?.deliveryStatus === 'sent') return null;
  const calendars = await collectMediaBriefCalendars(db, dateKey, now);
  const brief = buildBrief({ dateLabel: formatBriefDate(new Date(now)), calendars });
  const apiKey = String(process.env.RESEND_API_KEY || RESEND_API_KEY.value() || '').trim();
  const from = String(process.env.MEDIA_BRIEF_FROM || MEDIA_BRIEF_FROM.value() || '').trim();
  const naverAppPassword = String(process.env.NAVER_SMTP_APP_PASSWORD || NAVER_SMTP_APP_PASSWORD.value() || '').trim();
  const delivery = isEmailDeliveryConfigured({ apiKey, from })
    ? { provider: 'resend' }
    : isNaverSmtpConfigured({ account: NAVER_SMTP_ACCOUNT, appPassword: naverAppPassword })
      ? { provider: 'naver-smtp' }
      : null;
  // Keep producing an auditable server report while an email sender is awaiting configuration.
  // The next scheduled slot automatically resumes delivery once secrets are configured; this
  // path deliberately makes no outbound request and does not throw.
  if (!delivery) {
    await reportRef.set({
      kind: 'media-analysis-brief',
      dateKey,
      recipient: MEDIA_BRIEF_RECIPIENT,
      deliveryStatus: 'not-configured',
      emailConfigured: false,
      lastCheckedAt: now,
      generatedAt: now,
      calendarCount: calendars.length,
      summary: brief.total,
      staleCount: brief.staleCount
    }, { merge: true });
    return null;
  }
  const attempt = Math.max(0, Number(existing.data()?.attempts || 0)) + 1;
  await reportRef.set({
    kind: 'media-analysis-brief',
    dateKey,
    recipient: MEDIA_BRIEF_RECIPIENT,
    attempts: attempt,
    deliveryStatus: 'sending',
    emailConfigured: true,
    lastAttemptAt: now,
    generatedAt: now,
    calendarCount: calendars.length,
    summary: brief.total,
    staleCount: brief.staleCount,
    provider: delivery.provider
  }, { merge: true });
  try {
    const providerMessageId = delivery.provider === 'resend'
      ? await sendResendMail({
        apiKey,
        from,
        subject: brief.subject,
        html: brief.html,
        text: brief.text,
        idempotencyKey: `moyeora-media-brief-${dateKey}`
      })
      : await sendNaverSmtpMail({
        account: NAVER_SMTP_ACCOUNT,
        appPassword: naverAppPassword,
        subject: brief.subject,
        html: brief.html,
        text: brief.text,
        dateKey
      });
    await reportRef.set({
      deliveryStatus: 'sent',
      sentAt: Date.now(),
      provider: delivery.provider,
      providerMessageId,
      lastError: admin.firestore.FieldValue.delete()
    }, { merge: true });
  } catch (error) {
    const message = String(error?.message || error).slice(0, 500);
    await reportRef.set({
      deliveryStatus: 'failed',
      lastError: message,
      lastFailureAt: Date.now()
    }, { merge: true });
    // Keep the platform retry path in addition to the three scheduled retry slots.
    throw error;
  }
  return null;
});

// Nightly reconciliation (invariant I6): rebuild every calendar's photoIndex from its source
// documents, so owners that incremental triggers missed or processed out of order cannot
// linger (they were ~2% of owners and every stale 404 row), then sweep the Storage GC queue.
exports.nightlyMediaMaintenance = functions.region(SEOUL_REGION).runWith({ timeoutSeconds: 540, memory: '1GB' })
  .pubsub.schedule('10 4 * * *').timeZone('Asia/Seoul').onRun(async () => {
    const calendars = await admin.firestore().collection('calendars').select().get();
    for (const doc of calendars.docs) {
      const calendarId = doc.id.startsWith('cal_') ? doc.id.slice(4) : doc.id;
      if (!CALENDAR_ID_RE.test(calendarId)) continue;
      try {
        const report = await rebuildPhotoIndexForCalendarAdmin(calendarId, true);
        console.log('nightly photoIndex rebuild', JSON.stringify({ calendarId, indexedPhotos: report.indexedPhotos, staleRows: report.staleRows }));
      } catch (err) {
        console.error(`nightly photoIndex rebuild failed for ${calendarId}:`, err);
      }
    }
    const gc = await mediaCommands.sweepStorageGc({ db: admin.firestore(), bucket: admin.storage().bucket() });
    console.log('nightly storage GC', JSON.stringify(gc));
    return null;
  });

exports.rebuildPhotoIndex = seoulFunctions().runWith({ timeoutSeconds: 300, memory: '1GB' }).https.onRequest(async (req, res) => {
  setAdminCorsHeaders(res);
  if (req.method === 'OPTIONS') { res.status(204).send(''); return; }
  if (req.method !== 'POST') { res.status(405).json({ ok: false, message: 'Method not allowed' }); return; }
  const password = req.body && req.body.password;
  const calendarId = String(req.body?.calendarId || '');
  const apply = req.body?.apply === true;
  if (!password || typeof password !== 'string') { res.status(400).json({ ok: false, message: 'password is required' }); return; }
  if (!/^[A-Za-z0-9_-]{1,64}$/.test(calendarId)) { res.status(400).json({ ok: false, message: 'calendarId is required' }); return; }
  const rateState = await checkAdminAuthRateLimit(req.ip);
  if (rateState.blocked) { res.status(429).json({ ok: false, message: '너무 많은 시도가 있었습니다. 잠시 후 다시 시도해 주세요.' }); return; }
  const matches = sha256Hex(password.trim()) === await getStoredAdminPasswordHash();
  await recordAdminAuthResult(rateState, matches);
  if (!matches) { res.status(401).json({ ok: false, message: '비밀번호가 올바르지 않습니다.' }); return; }
  try {
    const report = await rebuildPhotoIndexForCalendarAdmin(calendarId, apply);
    res.status(200).json({ ok: true, ...report });
  } catch (error) {
    console.error('rebuildPhotoIndex failed:', error);
    res.status(500).json({ ok: false, message: String(error?.message || error) });
  }
});

// Non-destructive integrity and graph migration. This is intentionally separate from
// rebuildPhotoIndex: rebuilding a projection must never be interpreted as permission to remove
// a Storage object or legacy comment.  Every detected issue is written to an admin review queue
// together with a compact source snapshot, so a bad automatic decision can be reversed.
async function checkCanonicalAssetStorage(bucket, row) {
  const paths = [mediaGraphStoragePath(row?.full), mediaGraphStoragePath(row?.thumb)].filter(Boolean);
  if (!paths.length) return false;
  try {
    const exists = await Promise.all(paths.map(async path => {
      try { return Boolean((await bucket.file(path).exists())[0]); } catch (_) { return true; }
    }));
    return !exists.some(Boolean);
  } catch (_) {
    // A failed metadata request is not proof of data loss.
    return false;
  }
}

function sourceAssetIds(data = {}) {
  const entries = getMessageImageEntriesForIndex(data);
  return Array.from(new Set(entries.map(entry => getPhotoAssetKey(entry.imageUrl || entry.thumbUrl)).filter(Boolean)));
}

async function prepareMediaIntegrityReview({ calendarId, apply = false, materializeGraph = false, migrateLegacyComments = false } = {}) {
  const db = admin.firestore();
  const root = db.collection('calendars').doc(`cal_${calendarId}`);
  const names = ['photoIndex', 'messages', 'memos', 'confirmedMeetings', 'photoComments'];
  const snapshots = await Promise.all(names.map(name => root.collection(name).get()));
  const byName = Object.fromEntries(names.map((name, index) => [name, snapshots[index]]));
  const rows = byName.photoIndex.docs.map(doc => ({ id: doc.id, assetKey: doc.id, ...(doc.data() || {}) }));
  const missingAssetKeys = new Set();
  // Metadata checks are deliberately bounded. No image bytes are downloaded, and a transient
  // Storage failure is treated as unknown/alive rather than as a missing photo.
  const bucket = admin.storage().bucket();
  const queue = rows.slice();
  await Promise.all(Array.from({ length: 12 }, async () => {
    while (queue.length) {
      const row = queue.pop();
      if (row && await checkCanonicalAssetStorage(bucket, row)) missingAssetKeys.add(row.assetKey);
    }
  }));
  const report = buildIntegrityReview({
    calendarId,
    indexRows: rows,
    messages: byName.messages.docs.map(doc => ({ id: doc.id, ...(doc.data() || {}) })),
    memos: byName.memos.docs.map(doc => ({ id: doc.id, ...(doc.data() || {}) })),
    meetings: byName.confirmedMeetings.docs.map(doc => ({ id: doc.id, ...(doc.data() || {}) })),
    comments: byName.photoComments.docs.map(doc => ({ id: doc.id, ...(doc.data() || {}) })),
    missingAssetKeys
  });
  const counts = report.findings.reduce((acc, item) => {
    acc[item.kind] = (acc[item.kind] || 0) + 1;
    return acc;
  }, {});
  const summary = {
    calendarId, generatedAt: report.generatedAt, mode: apply ? 'applied' : 'dry-run',
    sourceDocuments: Object.fromEntries(names.map(name => [name, byName[name].size])),
    counts, findings: report.findings.length, assets: report.assets.length, edges: report.edges.length,
    missingAssets: missingAssetKeys.size,
    migratableComments: report.findings.filter(item => item.kind === 'legacy_comment_migratable').length,
    unresolvedComments: report.findings.filter(item => item.kind === 'legacy_comment_unresolved').length
  };
  if (!apply) return summary;

  const runId = `integrity_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`;
  const now = Date.now();
  const writes = [];
  writes.push({ ref: root.collection('integrityRuns').doc(runId), data: {
    ...summary, runId, status: 'review_required', createdAt: now,
    safeguards: ['no_auto_delete', 'source_snapshot_backup', 'restore_reupload_hide_only']
  } });
  report.findings.forEach(item => {
    const review = { ...item, calendarId, runId, createdAt: now, updatedAt: now };
    writes.push({ ref: root.collection('integrityReview').doc(item.id), data: review });
    // Snapshot documents are intentionally append-only per run. The queue itself can be updated
    // by later audits, while this copy remains a recovery reference.
    writes.push({ ref: root.collection('integrityRuns').doc(runId).collection('backup').doc(item.id), data: {
      kind: item.kind, assetKey: item.assetKey || '', sourceSnapshot: item.snapshot || {}, backedUpAt: now
    } });
  });
  if (materializeGraph) {
    report.assets.forEach(asset => writes.push({ ref: root.collection('assets').doc(asset.assetId), data: { ...asset, materializedAt: now } }));
    report.edges.forEach(edge => writes.push({ ref: root.collection('assetEdges').doc(edge.id), data: { ...edge, materializedAt: now } }));
    byName.messages.docs.forEach(doc => writes.push({ ref: doc.ref, data: { assetIds: sourceAssetIds(doc.data() || {}), assetGraphVersion: 1 } }));
    byName.memos.docs.forEach(doc => writes.push({ ref: doc.ref, data: { assetIds: sourceAssetIds(doc.data() || {}), assetGraphVersion: 1 } }));
    byName.confirmedMeetings.docs.forEach(doc => {
      const data = doc.data() || {};
      const albumAssetIds = (Array.isArray(data.photos) ? data.photos : [])
        .map(photo => getPhotoAssetKey(photo?.imageUrl || photo?.full || photo?.url || photo?.thumbUrl || photo?.thumb || '')).filter(Boolean);
      writes.push({ ref: doc.ref, data: {
        meetingId: String(data.meetingId || `meeting:${crypto.randomUUID()}`),
        albumAssetIds: Array.from(new Set(albumAssetIds)), assetGraphVersion: 1
      } });
    });
  }
  // Firestore batch limit is 500. Keep a margin for future schema fields.
  for (let offset = 0; offset < writes.length; offset += 350) {
    const batch = db.batch();
    writes.slice(offset, offset + 350).forEach(write => batch.set(write.ref, write.data, { merge: true }));
    await batch.commit();
  }
  let migratedComments = 0;
  if (migrateLegacyComments) {
    const migrations = report.findings.filter(item => item.kind === 'legacy_comment_migratable' && item.assetKey);
    for (const item of migrations) {
      const legacyKey = String(item.snapshot?.legacyKey || '');
      const legacyRef = root.collection('photoComments').doc(legacyKey);
      const targetRef = root.collection('photoComments').doc(item.assetKey);
      await db.runTransaction(async tx => {
        const [legacy, target] = await Promise.all([tx.get(legacyRef), tx.get(targetRef)]);
        if (!legacy.exists) return;
        const legacyComments = Array.isArray(legacy.data()?.comments) ? legacy.data().comments : [];
        const targetComments = Array.isArray(target.data()?.comments) ? target.data().comments : [];
        const unique = new Map();
        [...targetComments, ...legacyComments].forEach(comment => {
          const id = String(comment?.id || `${comment?.timestamp || 0}:${comment?.text || ''}`);
          if (!unique.has(id)) unique.set(id, comment);
        });
        const comments = Array.from(unique.values()).sort((a, b) => Number(a?.timestamp || 0) - Number(b?.timestamp || 0)).slice(0, 200);
        tx.set(targetRef, { comments, migratedFrom: admin.firestore.FieldValue.arrayUnion(legacyKey), updatedAt: now }, { merge: true });
        // Preserve the old thread for undo/audit; it is only marked as copied, never deleted.
        tx.set(legacyRef, { migration: { status: 'copied', assetKey: item.assetKey, runId, copiedAt: now } }, { merge: true });
      });
      migratedComments += 1;
    }
  }
  return { ...summary, runId, migratedComments, graphMaterialized: Boolean(materializeGraph) };
}

// Administrator entry point: dry-run is the default. `apply` only creates review records and
// optional dual-write graph records; it does not delete legacy documents or Storage objects.
exports.prepareMediaIntegrityReview = seoulFunctions().runWith({ timeoutSeconds: 540, memory: '1GB' }).https.onRequest(async (req, res) => {
  setAdminCorsHeaders(res);
  if (req.method === 'OPTIONS') { res.status(204).send(''); return; }
  if (req.method !== 'POST') { res.status(405).json({ ok: false, message: 'Method not allowed' }); return; }
  const { password, calendarId, apply, materializeGraph, migrateLegacyComments } = req.body || {};
  if (typeof password !== 'string' || !password.trim() || !CALENDAR_ID_RE.test(String(calendarId || ''))) {
    res.status(400).json({ ok: false, message: 'Invalid request' }); return;
  }
  const rateState = await checkAdminAuthRateLimit(req.ip);
  if (rateState.blocked) { res.status(429).json({ ok: false, message: 'Too many requests' }); return; }
  const matches = sha256Hex(password.trim()) === await getStoredAdminPasswordHash();
  await recordAdminAuthResult(rateState, matches);
  if (!matches) { res.status(401).json({ ok: false, message: '비밀번호가 올바르지 않습니다.' }); return; }
  try {
    const report = await prepareMediaIntegrityReview({
      calendarId: String(calendarId), apply: apply === true,
      materializeGraph: materializeGraph === true, migrateLegacyComments: migrateLegacyComments === true
    });
    res.status(200).json({ ok: true, ...report });
  } catch (error) {
    console.error('prepareMediaIntegrityReview failed:', error);
    res.status(500).json({ ok: false, message: String(error?.message || error) });
  }
});

// Emulator-only unauthenticated twin for local shell/integration tests. Prefer rebuildPhotoIndex
// in production (admin password required).
if (process.env.FUNCTIONS_EMULATOR === 'true') {
  exports.photoIndexBackfillLocal = functions.https.onRequest(async (req, res) => {
    const calendarId = String(req.body?.calendarId || '');
    if (!/^[A-Za-z0-9_-]{1,64}$/.test(calendarId)) { res.status(400).json({ ok: false }); return; }
    try {
      res.status(200).json(await rebuildPhotoIndexForCalendarAdmin(calendarId, req.body?.apply === true));
    } catch (error) {
      console.error('photoIndexBackfillLocal failed:', error);
      res.status(500).json({ ok: false, message: String(error?.message || error) });
    }
  });
}
