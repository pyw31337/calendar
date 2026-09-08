const functions = require('firebase-functions');
const { defineString } = require('firebase-functions/params');
const admin = require('firebase-admin');
const crypto = require('crypto');
const webpush = require('web-push');
const KoreanLunarCalendar = require('korean-lunar-calendar');

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
  const tags = Array.isArray(message.imageTags) ? message.imageTags : [];
  const count = Math.max(urls.length, thumbs.length);
  return Array.from({ length: count }, (_, index) => ({
    index,
    imageUrl: urls[index] || thumbs[index] || '',
    thumbUrl: thumbs[index] || urls[index] || '',
    tags: tags[index] || message.tags || ''
  })).filter(entry => entry.imageUrl || entry.thumbUrl);
}

function getDirectImageEntriesForIndex(message) {
  const text = String(message?.text || message?.content || message?.body || '');
  const urls = text.match(/https?:\/\/[^\s<>"']+/gi) || [];
  const imageExtensions = /\.(?:jpe?g|png|gif|webp|avif|bmp|svg|jfif|pjpeg|pjp|ico)(?:[?#].*)?$/i;
  const uploaded = new Set(getMessageImageEntriesForIndex(message)
    .flatMap(entry => [normalizePhotoAssetUrl(entry.imageUrl), normalizePhotoAssetUrl(entry.thumbUrl)]));
  return Array.from(new Set(urls.map(url => url.replace(/[),.;!?]+$/, ''))))
    .filter(url => imageExtensions.test(url) && !uploaded.has(normalizePhotoAssetUrl(url)))
    .map((url, index) => ({ index, imageUrl: url, thumbUrl: url, tags: '', directMediaUrl: url }));
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
    const assetKey = getPhotoAssetKey(full || thumb);
    if (!assetKey) return;
    const source = sourceType === 'message'
      ? (['chat', 'gallery', 'meeting'].includes(data.uploadSource) ? data.uploadSource : 'chat')
      : sourceType;
    // Memo lightbox tags key off messageId === memo.id (same convention as MemoCard).
    // Previously memo index rows left messageId empty, so gallery→lightbox tag save was a no-op.
    const messageId = (sourceType === 'message' || sourceType === 'memo') ? sourceId : '';
    const imageIndex = Number.isInteger(photo?.index) ? photo.index : index;
    entries.push({
      assetKey,
      full,
      thumb,
      timestamp: Number(photo?.createdAt || photo?.updatedAt || data.timestamp || data.updatedAt || data.createdAt || data.confirmedAt || 0),
      tags: String(photo?.tags || (Array.isArray(data.imageTags) ? data.imageTags[imageIndex] : '') || ''),
      text: String(data.text || data.content || data.body || context.text || '').slice(0, 1000),
      participantId: String(data.participantId || ''),
      source,
      messageId,
      imageIndex,
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
    (Array.isArray(data.photos) ? data.photos : []).forEach((photo, index) => push(photo, index, { meetingDate: data.date || sourceId, text: `${data.date || sourceId} 일정 사진` }));
  } else if (sourceType === 'anniversary') {
    // Content posters (movie/sports anniversaries) stay on the calendar/컨텐츠 surfaces.
    // Keep returning [] so sync/rebuild strip any legacy anniversary-owned photoIndex rows.
    return [];
  }
  return entries;
}

function selectPhotoIndexOwner(owners) {
  const sourceRank = owner => owner?.source === 'gallery' ? 0
    : owner?.source === 'chat' ? 1
      : owner?.source === 'memo' ? 2
        : owner?.source === 'meeting' ? 3 : 4;
  return (owners || []).slice().sort((a, b) => sourceRank(a) - sourceRank(b)
    || Number(b.timestamp || 0) - Number(a.timestamp || 0))[0] || null;
}

async function rebuildPhotoIndexForCalendarAdmin(calendarId, apply = false) {
  const db = admin.firestore();
  const root = db.collection('calendars').doc(`cal_${calendarId}`);
  const collectionNames = ['messages', 'memos', 'confirmedMeetings', 'anniversaries', 'photoComments', 'photoIndex'];
  const snapshots = await Promise.all(collectionNames.map(collection => root.collection(collection).get()));
  const byName = Object.fromEntries(collectionNames.map((name, index) => [name, snapshots[index]]));
  const commentCounts = new Map(byName.photoComments.docs.map(doc => {
    const comments = doc.data()?.comments;
    return [doc.id, Array.isArray(comments) ? comments.length : 0];
  }));
  const ownersByAsset = new Map();
  const addOwners = (sourceType, snapshot, idField = null) => snapshot.docs.forEach(doc => {
    getPhotoIndexEntries(sourceType, idField ? String(doc.data()?.[idField] || doc.id) : doc.id, doc.data() || {}).forEach(entry => {
      const owners = ownersByAsset.get(entry.assetKey) || [];
      if (!owners.some(owner => owner.sourceOwner === entry.sourceOwner)) owners.push(entry);
      ownersByAsset.set(entry.assetKey, owners.slice(0, 12));
    });
  });
  addOwners('message', byName.messages);
  addOwners('memo', byName.memos);
  addOwners('meeting', byName.confirmedMeetings);
  addOwners('anniversary', byName.anniversaries);

  const rows = [];
  let dataUrlBytes = 0;
  let dataUrlRows = 0;
  ownersByAsset.forEach((owners, assetKey) => {
    const selected = selectPhotoIndexOwner(owners);
    if (!selected) return;
    const legacyKeys = Array.from(new Set(owners.flatMap(owner => owner.legacyKeys || []))).slice(0, 40);
    const commentCount = Math.max(0, ...[assetKey, ...legacyKeys].map(key => Number(commentCounts.get(key) || 0)));
    if (String(selected.full || '').startsWith('data:') || String(selected.thumb || '').startsWith('data:')) {
      dataUrlRows += 1;
      dataUrlBytes += String(selected.full || '').length + String(selected.thumb || '').length;
    }
    rows.push({ ...selected, assetKey, legacyKeys, owners, commentCount, updatedAt: Date.now() });
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
  }
  return {
    calendarId,
    mode: apply ? 'applied' : 'dry-run',
    sourceDocuments: Object.fromEntries(collectionNames.slice(0, 5).map(name => [name, byName[name].size])),
    indexedPhotos: rows.length,
    commentsMatched: rows.filter(row => row.commentCount > 0).length,
    existingRows: byName.photoIndex.size,
    staleRows: staleRefs.length,
    dataUrlRows,
    dataUrlBytes
  };
}

async function syncCanonicalPhotoIndex(change, context, sourceType, idParam) {
  const db = admin.firestore();
  const indexRef = db.collection('calendars').doc(context.params.calendarDocId).collection('photoIndex');
  const sourceId = context.params[idParam];
  const before = change.before.exists ? getPhotoIndexEntries(sourceType, sourceId, change.before.data() || {}) : [];
  const after = change.after.exists ? getPhotoIndexEntries(sourceType, sourceId, change.after.data() || {}) : [];
  const ownerRoot = `${sourceType}:${sourceId}:`;
  const beforeKeys = new Set(before.map(entry => entry.assetKey));
  const afterByKey = new Map(after.map(entry => [entry.assetKey, entry]));
  const touchedKeys = new Set([...beforeKeys, ...afterByKey.keys()]);
  const sourceRank = owner => owner?.source === 'gallery' ? 0
    : owner?.source === 'chat' ? 1
      : owner?.source === 'memo' ? 2
        : owner?.source === 'meeting' ? 3 : 4;

  // The same physical asset may be referenced by chat, a meeting and a memo. Keeping bounded
  // owners inside the canonical row prevents deleting one source from erasing the remaining
  // references. Each transaction touches one row, so simultaneous edits cannot lose an owner.
  await Promise.all(Array.from(touchedKeys).map(assetKey => db.runTransaction(async transaction => {
    const ref = indexRef.doc(assetKey);
    const snapshot = await transaction.get(ref);
    const existing = snapshot.exists ? (snapshot.data() || {}) : {};
    const replacement = afterByKey.get(assetKey);
    const commentSnapshot = !snapshot.exists && replacement
      ? await transaction.get(db.collection('calendars').doc(context.params.calendarDocId).collection('photoComments').doc(assetKey))
      : null;
    let owners = Array.isArray(existing.owners) ? existing.owners.filter(owner => owner && typeof owner === 'object') : [];
    if (!owners.length && existing.sourceOwner && existing.full) owners = [{ ...existing }];
    owners = owners.filter(owner => !String(owner.sourceOwner || '').startsWith(ownerRoot));
    if (replacement) owners.push(replacement);
    owners = owners
      .filter((owner, index, list) => list.findIndex(candidate => candidate.sourceOwner === owner.sourceOwner) === index)
      .sort((a, b) => sourceRank(a) - sourceRank(b) || Number(b.timestamp || 0) - Number(a.timestamp || 0))
      .slice(0, 12);
    if (!owners.length) {
      transaction.delete(ref);
      return;
    }
    const selected = owners[0];
    const legacyKeys = Array.from(new Set(owners.flatMap(owner => owner.legacyKeys || []))).slice(0, 40);
    const existingComments = commentSnapshot?.exists && Array.isArray(commentSnapshot.data()?.comments)
      ? commentSnapshot.data().comments.length : 0;
    transaction.set(ref, {
      ...selected,
      assetKey,
      legacyKeys,
      owners,
      commentCount: Math.max(0, Number(existing.commentCount || 0), existingComments),
      updatedAt: Date.now()
    });
  })));
}

exports.onMessagePhotoIndexWrite = functions.firestore
  .document('calendars/{calendarDocId}/messages/{messageId}')
  .onWrite((change, context) => syncCanonicalPhotoIndex(change, context, 'message', 'messageId'));

exports.onMemoPhotoIndexWrite = functions.firestore
  .document('calendars/{calendarDocId}/memos/{memoId}')
  .onWrite((change, context) => syncCanonicalPhotoIndex(change, context, 'memo', 'memoId'));

exports.onMeetingPhotoIndexWrite = functions.firestore
  .document('calendars/{calendarDocId}/confirmedMeetings/{dateId}')
  .onWrite((change, context) => syncCanonicalPhotoIndex(change, context, 'meeting', 'dateId'));

exports.onAnniversaryPhotoIndexWrite = functions.firestore
  .document('calendars/{calendarDocId}/anniversaries/{anniversaryId}')
  .onWrite((change, context) => syncCanonicalPhotoIndex(change, context, 'anniversary', 'anniversaryId'));

exports.onPhotoCommentIndexWrite = functions.firestore
  .document('calendars/{calendarDocId}/photoComments/{photoKey}')
  .onWrite(async (change, context) => {
    const comments = change.after.exists && Array.isArray(change.after.data()?.comments) ? change.after.data().comments : [];
    const indexRef = admin.firestore().collection('calendars').doc(context.params.calendarDocId).collection('photoIndex');
    const batch = admin.firestore().batch();
    let writeCount = 0;
    const canonical = await indexRef.doc(context.params.photoKey).get();
    // A legacy comment key is not necessarily an asset key. Never create a partial/ghost photo
    // row for it; update the canonical document only when it already exists.
    if (canonical.exists) {
      batch.set(canonical.ref, { commentCount: comments.length, updatedAt: Date.now() }, { merge: true });
      writeCount += 1;
    }
    const aliases = await indexRef.where('legacyKeys', 'array-contains', context.params.photoKey).limit(100).get();
    aliases.forEach(doc => {
      if (canonical.exists && doc.id === canonical.id) return;
      batch.set(doc.ref, { commentCount: comments.length, updatedAt: Date.now() }, { merge: true });
      writeCount += 1;
    });
    if (writeCount > 0) await batch.commit();
  });

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

exports.onMessageMeetingPhotoIndexWrite = functions.firestore
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


/** Shared push broadcast for a calendar's push_subscriptions */
async function broadcastCalendarPush(calendarDocId, payloadObj, options = {}) {
  ensureVapidConfigured();
  const db = admin.firestore();
  const skipParticipantId = options.skipParticipantId || null;
  const channel = options.channel || 'chat'; // chat | memo | poll | schedule
  // Cap fan-out so a compromised/abnormally large subscription set cannot create an
  // unbounded push-send and Firestore-write bill in one trigger invocation.
  const subSnap = await db.collection('calendars').doc(calendarDocId).collection('push_subscriptions').limit(500).get();
  if (subSnap.empty) {
    console.log('No push subscriptions for', calendarDocId);
    return { sent: 0 };
  }
  const payload = JSON.stringify(payloadObj);
  const promises = [];
  let skipped = 0;
  subSnap.forEach(doc => {
    const data = doc.data() || {};
    if (skipParticipantId && data.participantId === skipParticipantId) {
      skipped += 1;
      return;
    }
    // Channel filter: legacy docs without channels → chat only
    const ch = data.channels;
    if (ch && typeof ch === 'object') {
      if (ch[channel] === false) { skipped += 1; return; }
    } else if (channel !== 'chat') {
      skipped += 1;
      return;
    }
    const pushSubscription = {
      endpoint: data.endpoint,
      keys: { auth: data.keys && data.keys.auth, p256dh: data.keys && data.keys.p256dh }
    };
    const sentAt = Date.now();
    const p = webpush.sendNotification(pushSubscription, payload, { urgency: 'high' })
      .then(() => {
        console.log('Push ok', doc.id, channel);
        return doc.ref.set({
          lastPushAt: sentAt,
          lastPushStatus: 'sent',
          lastPushChannel: channel,
          lastPushError: null
        }, { merge: true });
      })
      .catch(err => {
        console.error('Push fail', doc.id, err && err.statusCode);
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
  return { sent: promises.length, skipped };
}


exports.onMessageCreate = functions.runWith({ secrets: ['VAPID_PRIVATE_KEY'] }).firestore
  .document('calendars/{calendarDocId}/messages/{messageId}')
  .onCreate(async (snapshot, context) => {
    ensureVapidConfigured();
    const calendarDocId = context.params.calendarDocId;
    const message = snapshot.data();

    // 일정 레이어팝업 사진탭('meeting')/갤러리 페이지('gallery')에서 올린 사진은 메시지
    // 문서에 저장되더라도 채팅 활동으로 취급하지 않는다. 채팅방 노출과 채팅 푸시는
    // 모두 uploadSource 기준으로 제외한다.
    if (message.uploadSource === 'meeting' || message.uploadSource === 'gallery') {
      console.log('Skipping push for non-chat photo upload:', message.uploadSource);
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
    
    const bodyText = message.text?.trim() || (message.imageUrls?.length || message.imageUrl ? '사진을 보냈습니다' : '새 메시지가 도착했습니다');
    await broadcastCalendarPush(calendarDocId, {
      title: `${calendarTitle} · ${senderName}`,
      body: bodyText,
      url: `./?id=${calendarDocId.replace('cal_', '')}&view=chat`,
      tag: `chat-${calendarDocId}`
    }, { skipParticipantId: senderId, channel: 'chat' });
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

// Daily anniversary push -- fires once at 09:00 KST, scans every calendar's anniversaries
// subcollection via a single collectionGroup query (cheaper than looping per-calendar fetches),
// and pushes to every subscriber of a calendar with a match today. New Cloud Function; requires
// `firebase deploy --only functions` to go live (unlike the rest of this app, which redeploys
// automatically via GitHub Pages on merge to main).

// Memo created or edited → push (channel: memo). A write trigger is required because
// memo edits are saved as updates; the old create-only trigger silently missed them.
exports.onMemoWrite = functions.runWith({ secrets: ['VAPID_PRIVATE_KEY'] }).firestore
  .document('calendars/{calendarDocId}/memos/{memoId}')
  .onWrite(async (change, context) => {
    if (!change.after.exists) return;
    const before = change.before.exists ? (change.before.data() || {}) : null;
    const memo = change.after.data() || {};
    if (before && JSON.stringify(before) === JSON.stringify(memo)) return;
    const calendarDocId = context.params.calendarDocId;
    const db = admin.firestore();
    const calendarSnap = await db.collection('calendars').doc(calendarDocId).get();
    if (!calendarSnap.exists) return;
    const calendarData = calendarSnap.data().calendar || {};
    const calendarTitle = calendarData.title || '모여라 캘린더';
    const author = memo.authorName || memo.participantName || '참여자';
    const body = (memo.text || memo.title || '새 메모').toString().trim().slice(0, 120) || '새 메모가 등록되었습니다';
    await broadcastCalendarPush(calendarDocId, {
      title: `${calendarTitle} · 메모`,
      body: `${author}: ${body}`,
      url: `./?id=${calendarDocId.replace('cal_', '')}&view=memo`,
      tag: `memo-${calendarDocId}-${context.params.memoId}`
    }, { skipParticipantId: memo.participantId || memo.authorId || null, channel: 'memo' });
  });

// Meeting confirmed (the 확정 button, not a settlement/participant edit) → schedule channel.
// The document is also written by unrelated actions -- settlement note/price edits and
// participant-only registration on a date with no confirmedMeeting entry yet both create or
// rewrite this same doc with confirmed:false, and editing settlement on an already-confirmed
// meeting rewrites it without touching `confirmed` at all. Notifying on every write there
// falsely announced "모임이 확정되었습니다" for those cases. Only a genuine
// not-confirmed -> confirmed transition (client sets confirmed:true exclusively via
// handleConfirmMeeting, the actual 확정 button) should page everyone.
exports.onConfirmedMeetingWrite = functions.runWith({ secrets: ['VAPID_PRIVATE_KEY'] }).firestore
  .document('calendars/{calendarDocId}/confirmedMeetings/{dateId}')
  .onWrite(async (change, context) => {
    if (!change.after.exists) return;
    const before = change.before.exists ? (change.before.data() || {}) : null;
    const after = change.after.data() || {};
    if (before && JSON.stringify(before) === JSON.stringify(after)) return;
    const wasConfirmed = !!before && before.confirmed !== false;
    const isConfirmed = after.confirmed !== false;
    if (!isConfirmed || wasConfirmed) return;
    const calendarDocId = context.params.calendarDocId;
    const db = admin.firestore();
    const calendarSnap = await db.collection('calendars').doc(calendarDocId).get();
    if (!calendarSnap.exists) return;
    const calendarData = calendarSnap.data().calendar || {};
    const calendarTitle = calendarData.title || '모여라 캘린더';
    const dateLabel = context.params.dateId || after.date || '';
    const meetingDateKey = normalizeMeetingDateKey(dateLabel);
    // Historical confirmedMeeting documents can be rewritten during migration,
    // reconciliation, or a late-arriving offline save. Never turn that maintenance
    // write into a fresh notification for a meeting that has already passed.
    if (meetingDateKey && meetingDateKey < getKstDateKey()) {
      console.log('Skipping stale confirmed meeting notification:', meetingDateKey);
      return;
    }
    await broadcastCalendarPush(calendarDocId, {
      title: `${calendarTitle} · 모임 확정`,
      body: dateLabel ? `${dateLabel} 모임이 확정되었습니다` : '모임이 확정되었습니다',
      url: `./?id=${calendarDocId.replace('cal_', '')}`,
      tag: `schedule-${calendarDocId}-${dateLabel}`
    }, { channel: 'schedule' });
  });

// Calendar document write → detect new polls
exports.onCalendarDocWrite = functions.runWith({ secrets: ['VAPID_PRIVATE_KEY'] }).firestore
  .document('calendars/{calendarDocId}')
  .onUpdate(async (change, context) => {
    const beforeCal = (change.before.data() || {}).calendar || {};
    const afterCal = (change.after.data() || {}).calendar || {};
    const beforePolls = Array.isArray(beforeCal.polls) ? beforeCal.polls : [];
    const afterPolls = Array.isArray(afterCal.polls) ? afterCal.polls : [];
    const beforeIds = new Set(beforePolls.map(p => p && p.id).filter(Boolean));
    const newPolls = afterPolls.filter(p => p && p.id && !beforeIds.has(p.id));
    if (newPolls.length === 0) return;
    const calendarDocId = context.params.calendarDocId;
    const calendarTitle = afterCal.title || '모여라 캘린더';
    for (const poll of newPolls) {
      await broadcastCalendarPush(calendarDocId, {
        title: `${calendarTitle} · 투표`,
        body: poll.title ? `새 투표: ${poll.title}` : '새 투표가 등록되었습니다',
        url: `./?id=${calendarDocId.replace('cal_', '')}`,
        tag: `poll-${calendarDocId}-${poll.id}`
      }, { channel: 'poll' });
    }
  });

exports.sendAnniversaryReminders = functions.runWith({ secrets: ['VAPID_PRIVATE_KEY'] }).pubsub.schedule('0 9 * * *').timeZone('Asia/Seoul').onRun(async () => {
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
    const calendarData = calendarSnap.data().calendar || {};
    const calendarTitle = calendarData.title || '모여라 캘린더';

    const subSnap = await entry.ref.collection('push_subscriptions').get();
    if (subSnap.empty) continue;

    entry.anniversaries.forEach(ann => {
      const payload = JSON.stringify({
        title: `${calendarTitle} · 오늘의 기념일`,
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

// Eve-of schedule push at 18:00 KST: tomorrow's confirmed meetings + tomorrow's matching
// type:repeat anniversary rules (e.g. 매월 셋째주 수요일). Complements the local D-1 nudge
// (client only fires when the tab is open after 18:00) and the morning anniversary job.
exports.sendEveScheduleReminders = functions.runWith({ secrets: ['VAPID_PRIVATE_KEY'] }).pubsub.schedule('0 18 * * *').timeZone('Asia/Seoul').onRun(async () => {
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
    const calendarData = (calendarSnap.data() || {}).calendar || {};
    const calendarTitle = calendarData.title || '모여라 캘린더';
    for (const dateLabel of entry.dates) {
      promises.push(broadcastCalendarPush(calendarDocId, {
        title: `${calendarTitle} · 모임 알림`,
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
    const calendarData = (calendarSnap.data() || {}).calendar || {};
    const calendarTitle = calendarData.title || '모여라 캘린더';
    for (const ann of entry.anns) {
      const title = ann.title || ann.patternLabel || '반복 일정';
      promises.push(broadcastCalendarPush(calendarDocId, {
        title: `${calendarTitle} · 일정 알림`,
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

exports.peekalinkProxy = functions.runWith({ ...PUBLIC_PROXY_RUNTIME, secrets: ['PEEKALINK_API_KEY'] }).https.onRequest(async (req, res) => {
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

exports.kakaoLocalSearchProxy = functions.runWith({ ...PUBLIC_PROXY_RUNTIME, secrets: ['KAKAO_REST_API_KEY'] }).https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') { setPublicCacheHeaders(res, 86400); res.status(204).send(''); return; }
  if (req.method !== 'GET') { res.status(405).json({ ok: false, message: 'Method not allowed' }); return; }
  const query = String(req.query.query || '').trim().slice(0, 200);
  if (!query) { res.status(400).json({ ok: false, message: 'query is required' }); return; }
  setPublicCacheHeaders(res, 300);
  // 30/minute per IP -- generous for a real person typing/refining a place search, but stops a
  // scripted caller from burning through the free daily quota this whole app shares.
  if (!(await checkProxyRateLimit('kakao', req.ip, 60 * 1000, 30))) {
    res.status(429).json({ ok: false, message: 'Too many requests' });
    return;
  }
  const cacheKey = query.toLocaleLowerCase('ko-KR');
  const cached = await readExternalCache('kakaoSearch', cacheKey);
  if (cached) { res.status(200).json(cached); return; }
  try {
    const kakaoRes = await fetch(`https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(query)}&size=10`, {
      headers: { Authorization: `KakaoAK ${KAKAO_REST_API_KEY}` }
    });
    // Awaited (rather than fire-and-forget) so the write reliably completes before this HTTP
    // function's instance is frozen once the response below is sent.
    await incrementKakaoLocalSearchStat();
    if (!kakaoRes.ok) {
      res.status(kakaoRes.status).json({ ok: false, message: 'Kakao local search failed' });
      return;
    }
    const json = await kakaoRes.json();
    const result = { ok: true, documents: json.documents || [] };
    await writeExternalCache('kakaoSearch', cacheKey, result, 24 * 60 * 60 * 1000);
    res.status(200).json(result);
  } catch (err) {
    console.error('kakaoLocalSearchProxy failed:', err);
    res.status(502).json({ ok: false, message: 'Kakao local search request failed' });
  }
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

exports.googlePlacesSearchProxy = functions.runWith({ ...PUBLIC_PROXY_RUNTIME, secrets: ['GOOGLE_PLACES_API_KEY'] }).https.onRequest(async (req, res) => {
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

exports.tourApiSearchProxy = functions.runWith(PUBLIC_PROXY_RUNTIME).https.onRequest(async (req, res) => {
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
exports.listPublicCalendarSummaries = functions.https.onRequest(async (req, res) => {
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
exports.auditEvent = functions.https.onRequest(async (req, res) => {
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
exports.adminVerifyPassword = functions.https.onRequest(async (req, res) => {
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

exports.listAllCalendars = functions.https.onRequest(async (req, res) => {
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
exports.listServerAuditLogs = functions.https.onRequest(async (req, res) => {
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
    let query = admin.firestore().collection('serverAuditLogs').orderBy('receivedAt', 'desc').limit(max);
    if (calendarId) query = query.where('calendarId', '==', String(calendarId));
    const snap = await query.get();
    const logs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json({ ok: true, logs });
  } catch (err) {
    console.error('listServerAuditLogs failed:', err);
    res.status(500).json({ ok: false });
  }
});

// Admin-only aggregate health view for Web Push subscriptions. Endpoints and encryption keys
// are never returned; this is intentionally a diagnostic summary to explain missed pushes and
// bound fan-out costs without exposing credentials.
exports.listPushSubscriptionHealth = functions.https.onRequest(async (req, res) => {
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
    const summary = { total: snap.size, active: 0, stale30d: 0, sent: 0, failed: 0, channels: { chat: 0, memo: 0, poll: 0, schedule: 0 } };
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
exports.adminChangePassword = functions.https.onRequest(async (req, res) => {
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
exports.pruneStaleRateLimitDocs = functions.pubsub.schedule('30 9 * * *').timeZone('Asia/Seoul').onRun(async () => {
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

// Deliberately available only inside `firebase functions:shell`: this gives release operations
// an Admin SDK path for an explicit, audited index rebuild without ever deploying a public
// backfill endpoint or relaxing Firestore's server-only photoIndex rule.
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
