/**
 * Firebase data access helpers (P3-2).
 * Loaded before app-main.js. Runtime deps: window.GATHER_FIREBASE_DEPS
 */
function deps() { return window.GATHER_FIREBASE_DEPS || {}; }
  function isValidCalId(calId) {
    return typeof calId === 'string' && /^[A-Za-z0-9_-]{1,64}$/.test(calId);
  }
  function getDb() {
    const d = deps();
    return typeof d.getDb === 'function' ? d.getDb() : null;
  }
  function projectId() {
    const d = deps();
    if (d.projectId) return d.projectId;
    try { return (window.firebaseConfig && window.firebaseConfig.projectId) || ''; } catch (e) { return ''; }
  }
  function slimMessage(msg) {
    const d = deps();
    return typeof d.slimMessageForClient === 'function' ? d.slimMessageForClient(msg) : msg;
  }
  function docToJs(doc) {
    const d = deps();
    return typeof d.firestoreDocumentToJs === 'function' ? d.firestoreDocumentToJs(doc) : {};
  }
  function liveLimit() {
    const n = Number(deps().CHAT_LIVE_MESSAGE_LIMIT);
    return Number.isFinite(n) && n > 0 ? n : 30;
  }
  function olderPageSize() {
    const n = Number(deps().CHAT_OLDER_PAGE_SIZE);
    return Number.isFinite(n) && n > 0 ? n : 40;
  }
  function imageEntries(msg) {
    const d = deps();
    return typeof d.getMessageImageEntries === 'function' ? (d.getMessageImageEntries(msg) || []) : [];
  }
  function directEntry(msg) {
    const d = deps();
    return typeof d.getMessageDirectMediaEntry === 'function' ? d.getMessageDirectMediaEntry(msg) : null;
  }

  async function fetchChatMessagesRest(calId) {
    try {
      const url = 'https://firestore.googleapis.com/v1/projects/' + projectId() + '/databases/(default)/documents/calendars/cal_' + calId + '/messages?orderBy=timestamp%20desc&pageSize=' + liveLimit();
      const res = await fetch(url);
      if (!res.ok) return [];
      const data = await res.json();
      return (data.documents || []).map(function (doc) {
        return slimMessage({ id: doc.name.split('/').pop(), ...docToJs(doc) });
      }).reverse();
    } catch (err) {
      console.warn('fetchChatMessagesRest error:', err);
      return [];
    }
  }

  // Deliberate full-history read for views whose correctness depends on every message
  // (chat history and gallery). The live preview above remains bounded, but this path follows
  // Firestore REST page tokens until the collection is exhausted.
  async function fetchAllChatMessagesRest(calId) {
    if (!isValidCalId(calId)) return [];
    try {
      var all = [];
      var pageToken = '';
      do {
        var url = 'https://firestore.googleapis.com/v1/projects/' + projectId() + '/databases/(default)/documents/calendars/cal_' + calId + '/messages?pageSize=300';
        if (pageToken) url += '&pageToken=' + encodeURIComponent(pageToken);
        var res = await fetch(url, { cache: 'no-store' });
        if (!res.ok) return all;
        var data = await res.json();
        (data.documents || []).forEach(function (doc) {
          all.push(slimMessage({ id: doc.name.split('/').pop(), ...docToJs(doc) }));
        });
        pageToken = data.nextPageToken || '';
      } while (pageToken);
      return all.sort(function (a, b) { return (Number(a.timestamp) || 0) - (Number(b.timestamp) || 0); });
    } catch (err) {
      console.warn('fetchAllChatMessagesRest error:', err);
      return [];
    }
  }

  async function fetchRecentChatMessages(calId, limit) {
    if (!isValidCalId(calId)) return [];
    const pageSize = Math.max(1, Math.min(100, Number(limit) || 60));
    const firebaseDb = getDb();
    try {
      if (firebaseDb) {
        const snap = await firebaseDb.collection('calendars').doc('cal_' + calId).collection('messages')
          .orderBy('timestamp', 'desc').limit(pageSize).get();
        const list = [];
        snap.forEach(function (doc) { list.push(slimMessage({ id: doc.id, ...doc.data() })); });
        return list.reverse();
      }
    } catch (err) {
      console.warn('fetchRecentChatMessages sdk', err);
    }
    try {
      const url = 'https://firestore.googleapis.com/v1/projects/' + projectId() + '/databases/(default)/documents/calendars/cal_' + calId + '/messages?orderBy=timestamp%20desc&pageSize=' + pageSize;
      const res = await fetch(url);
      if (!res.ok) return [];
      const data = await res.json();
      return (data.documents || []).map(function (doc) {
        return slimMessage({ id: doc.name.split('/').pop(), ...docToJs(doc) });
      }).reverse();
    } catch (err) {
      console.warn('fetchRecentChatMessages rest', err);
      return [];
    }
  }

  // Unlike fetchRecentChatMessages (which grabs the newest N messages regardless of content),
  // this keeps paging through message history until at least minPhotoCount photos have been
  // seen (or maxPages is hit) -- so a text-heavy recent stretch of chat doesn't starve the main
  // screen's gallery widget of thumbnails even though the total photo count (fetchGalleryItemCount,
  // same maxPages default) is much higher. Falls back to fetchRecentChatMessages when the SDK
  // (needed for cursor-based startAfter pagination) isn't available.
  async function fetchRecentGalleryMessages(calId, minPhotoCount, maxPages) {
    if (!isValidCalId(calId)) return [];
    const targetCount = Math.max(1, Number(minPhotoCount) || 12);
    const pages = Math.max(1, Number(maxPages) || 8);
    const firebaseDb = getDb();
    if (!firebaseDb) return fetchRecentChatMessages(calId, 60);
    try {
      const collected = [];
      let photoCount = 0;
      let lastDoc = null;
      for (let page = 0; page < pages && photoCount < targetCount; page++) {
        let q = firebaseDb.collection('calendars').doc('cal_' + calId).collection('messages')
          .orderBy('timestamp', 'desc').limit(80);
        if (lastDoc) q = q.startAfter(lastDoc);
        const snap = await q.get();
        if (snap.empty) break;
        snap.forEach(function (doc) {
          const msg = slimMessage({ id: doc.id, ...doc.data() });
          collected.push(msg);
          photoCount += imageEntries(msg).length + (directEntry(msg) ? 1 : 0);
        });
        lastDoc = snap.docs[snap.docs.length - 1];
        if (snap.size < 80) break;
      }
      return collected.reverse();
    } catch (err) {
      console.warn('fetchRecentGalleryMessages sdk', err);
      return fetchRecentChatMessages(calId, 60);
    }
  }

  // DateModal uses this server scan instead of depending on the paginated chat/gallery window.
  // imageTags values can contain several human-readable tags in one string, so Firestore's
  // array-contains exact-match query cannot safely find every date-tagged photo.
  async function fetchMessagesByImageTag(calId, imageTag) {
    if (!isValidCalId(calId) || !imageTag) return [];
    const needle = String(imageTag);
    const hasTag = function (msg) {
      const values = Array.isArray(msg.imageTags) ? msg.imageTags : [msg.tags];
      return values.some(function (value) { return typeof value === 'string' && value.includes(needle); });
    };
    const firebaseDb = getDb();
    if (firebaseDb) {
      try {
        const snap = await firebaseDb.collection('calendars').doc('cal_' + calId).collection('messages').get({ source: 'server' });
        const list = [];
        snap.forEach(function (doc) {
          const msg = slimMessage({ id: doc.id, ...doc.data() });
          if (hasTag(msg)) list.push(msg);
        });
        return list;
      } catch (err) {
        console.warn('fetchMessagesByImageTag sdk', imageTag, err);
      }
    }
    try {
      const parent = 'projects/' + projectId() + '/databases/(default)/documents/calendars/cal_' + calId;
      const list = [];
      let pageToken = '';
      do {
        const query = '?pageSize=1000' + (pageToken ? '&pageToken=' + encodeURIComponent(pageToken) : '');
        const res = await fetch('https://firestore.googleapis.com/v1/' + parent + '/messages' + query, { cache: 'no-store' });
        if (!res.ok) return list;
        const data = await res.json();
        (data.documents || []).forEach(function (doc) {
          const msg = slimMessage({ id: doc.name.split('/').pop(), ...docToJs(doc) });
          if (hasTag(msg)) list.push(msg);
        });
        pageToken = data.nextPageToken || '';
      } while (pageToken);
      return list;
    } catch (err) {
      console.warn('fetchMessagesByImageTag rest', imageTag, err);
      return [];
    }
  }

  async function fetchMeetingPhotoIndex(calId, date) {
    if (!isValidCalId(calId) || !date) return [];
    const db = getDb();
    if (db) {
      try {
        const snap = await db.collection('calendars').doc('cal_' + calId).collection('meetingPhotoIndex')
          .where('date', '==', String(date)).get({ source: 'server' });
        const list = [];
        snap.forEach(function (doc) { list.push({ id: doc.id, ...doc.data(), source: 'meeting-index' }); });
        return list;
      } catch (err) { console.warn('fetchMeetingPhotoIndex sdk', date, err); }
    }
    try {
      const parent = 'projects/' + projectId() + '/databases/(default)/documents/calendars/cal_' + calId;
      const res = await fetch('https://firestore.googleapis.com/v1/' + parent + ':runQuery', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, cache: 'no-store',
        body: JSON.stringify({ structuredQuery: { from: [{ collectionId: 'meetingPhotoIndex' }], where: { fieldFilter: {
          field: { fieldPath: 'date' }, op: 'EQUAL', value: { stringValue: String(date) }
        }}}})
      });
      if (!res.ok) return [];
      const rows = await res.json();
      return (Array.isArray(rows) ? rows : []).filter(function (row) { return row && row.document; }).map(function (row) {
        return { id: row.document.name.split('/').pop(), ...docToJs(row.document), source: 'meeting-index' };
      });
    } catch (err) { console.warn('fetchMeetingPhotoIndex rest', date, err); return []; }
  }

  async function countMessagesByUploadSource(calId, uploadSource) {
    if (!isValidCalId(calId) || !uploadSource) return null;
    const firebaseDb = getDb();
    if (firebaseDb) {
      try {
        const ref = firebaseDb.collection('calendars').doc('cal_' + calId).collection('messages')
          .where('uploadSource', '==', uploadSource);
        if (typeof ref.count === 'function') {
          const snap = await ref.count().get();
          const n = Number(snap.data().count);
          if (Number.isFinite(n) && n >= 0) return n;
        }
      } catch (err) {
        console.warn('countMessagesByUploadSource sdk', uploadSource, err);
      }
    }
    try {
      const parentPath = 'projects/' + projectId() + '/databases/(default)/documents/calendars/cal_' + calId;
      const url = 'https://firestore.googleapis.com/v1/' + parentPath + ':runAggregationQuery';
      const aggBody = {
        structuredAggregationQuery: {
          structuredQuery: {
            from: [{ collectionId: 'messages' }],
            where: {
              fieldFilter: {
                field: { fieldPath: 'uploadSource' },
                op: 'EQUAL',
                value: { stringValue: uploadSource }
              }
            }
          },
          aggregations: [{ alias: 'total', count: {} }]
        }
      };
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(aggBody)
      });
      if (res.ok) {
        const data = await res.json();
        const rows = Array.isArray(data) ? data : [data];
        for (let i = 0; i < rows.length; i++) {
          const row = rows[i];
          const fields = row && row.result && row.result.aggregateFields;
          const total = fields && fields.total;
          if (total && total.integerValue != null) {
            const n = Number(total.integerValue);
            if (Number.isFinite(n) && n >= 0) return n;
          }
        }
      } else {
        console.warn('countMessagesByUploadSource rest status', res.status, uploadSource);
      }
    } catch (err) {
      console.warn('countMessagesByUploadSource rest', uploadSource, err);
    }
    return null;
  }

  async function fetchMessagesByUploadSource(calId, uploadSource) {
    if (!isValidCalId(calId) || !uploadSource) return null;
    const firebaseDb = getDb();
    if (firebaseDb) {
      try {
        const snap = await firebaseDb.collection('calendars').doc('cal_' + calId).collection('messages')
          .where('uploadSource', '==', uploadSource).get();
        const list = [];
        snap.forEach(function (doc) { list.push(slimMessage({ id: doc.id, ...doc.data() })); });
        return list;
      } catch (err) {
        console.warn('fetchMessagesByUploadSource sdk', uploadSource, err);
      }
    }
    try {
      const parentPath = 'projects/' + projectId() + '/databases/(default)/documents/calendars/cal_' + calId;
      const url = 'https://firestore.googleapis.com/v1/' + parentPath + ':runQuery';
      const body = {
        structuredQuery: {
          from: [{ collectionId: 'messages' }],
          where: {
            fieldFilter: {
              field: { fieldPath: 'uploadSource' },
              op: 'EQUAL',
              value: { stringValue: uploadSource }
            }
          }
        }
      };
      const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (!res.ok) {
        console.warn('fetchMessagesByUploadSource rest status', res.status, uploadSource);
        return null;
      }
      const data = await res.json();
      const rows = Array.isArray(data) ? data : [data];
      return rows.filter(function (row) { return row && row.document; }).map(function (row) {
        return slimMessage({ id: row.document.name.split('/').pop(), ...docToJs(row.document) });
      });
    } catch (err) {
      console.warn('fetchMessagesByUploadSource rest', uploadSource, err);
      return null;
    }
  }

  async function fetchSubcollectionCount(calId, subName, options = null) {
    if (!isValidCalId(calId) || !subName) return null;
    const excludedUploadSources = subName === 'messages' && options && Array.isArray(options.excludeUploadSources)
      ? Array.from(new Set(options.excludeUploadSources.map(source => String(source || '').trim()).filter(Boolean)))
      : [];
    if (excludedUploadSources.length > 0) {
      const total = await fetchSubcollectionCount(calId, subName);
      if (total == null) return null;
      let excludedCount = 0;
      for (const source of excludedUploadSources) {
        const count = await countMessagesByUploadSource(calId, source);
        if (count == null) return null;
        excludedCount += count;
      }
      return Math.max(0, total - excludedCount);
    }
    const firebaseDb = getDb();
    if (firebaseDb) {
      try {
        const ref = firebaseDb.collection('calendars').doc('cal_' + calId).collection(subName);
        if (typeof ref.count === 'function') {
          const snap = await ref.count().get();
          const n = Number(snap.data().count);
          if (Number.isFinite(n) && n >= 0) return n;
        }
      } catch (err) {
        console.warn('fetchSubcollectionCount sdk', subName, err);
      }
    }
    try {
      const parentPath = 'projects/' + projectId() + '/databases/(default)/documents/calendars/cal_' + calId;
      const url = 'https://firestore.googleapis.com/v1/' + parentPath + ':runAggregationQuery';
      const aggBody = {
        structuredAggregationQuery: {
          structuredQuery: { from: [{ collectionId: subName }] },
          aggregations: [{ alias: 'total', count: {} }]
        }
      };
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(aggBody)
      });
      if (res.ok) {
        const data = await res.json();
        const rows = Array.isArray(data) ? data : [data];
        for (let i = 0; i < rows.length; i++) {
          const row = rows[i];
          const fields = row && row.result && row.result.aggregateFields;
          const total = fields && fields.total;
          if (total && total.integerValue != null) {
            const n = Number(total.integerValue);
            if (Number.isFinite(n) && n >= 0) return n;
          }
        }
      } else {
        console.warn('fetchSubcollectionCount rest status', res.status, subName);
      }
    } catch (err) {
      console.warn('fetchSubcollectionCount rest', subName, err);
    }
    return null;
  }

  // 1-based position of a message within the full chronological chat history, used by the
  // Lightbox source label ("채팅방 #117") -- independent of how much of the chat is currently
  // paginated into the client, since it counts directly against Firestore.
  async function fetchMessageOrdinal(calId, timestamp) {
    if (!isValidCalId(calId) || !Number.isFinite(Number(timestamp))) return null;
    const ts = Number(timestamp);
    const excludedUploadSources = ['meeting', 'gallery'];
    let excludedCount = 0;
    for (let i = 0; i < excludedUploadSources.length; i++) {
      const source = excludedUploadSources[i];
      const docs = await fetchMessagesByUploadSource(calId, source);
      if (docs == null) return null;
      for (let j = 0; j < docs.length; j++) {
        const rawTs = docs[j] && docs[j].timestamp;
        const docTs = rawTs && typeof rawTs === 'object' && typeof rawTs.toDate === 'function'
          ? rawTs.toDate().getTime()
          : (rawTs && typeof rawTs.seconds === 'number'
            ? rawTs.seconds * 1000
            : Number(rawTs));
        if (Number.isFinite(docTs) && docTs <= ts) excludedCount += 1;
      }
    }
    const firebaseDb = getDb();
    if (firebaseDb) {
      try {
        const ref = firebaseDb.collection('calendars').doc('cal_' + calId).collection('messages')
          .where('timestamp', '<=', ts);
        if (typeof ref.count === 'function') {
          const snap = await ref.count().get();
          const n = Number(snap.data().count);
          if (Number.isFinite(n) && n >= 0) return Math.max(0, n - excludedCount);
        }
      } catch (err) {
        console.warn('fetchMessageOrdinal sdk', err);
      }
    }
    try {
      const parentPath = 'projects/' + projectId() + '/databases/(default)/documents/calendars/cal_' + calId;
      const url = 'https://firestore.googleapis.com/v1/' + parentPath + ':runAggregationQuery';
      const aggBody = {
        structuredAggregationQuery: {
          structuredQuery: {
            from: [{ collectionId: 'messages' }],
            where: {
              fieldFilter: {
                field: { fieldPath: 'timestamp' },
                op: 'LESS_THAN_OR_EQUAL',
                value: { doubleValue: ts }
              }
            }
          },
          aggregations: [{ alias: 'total', count: {} }]
        }
      };
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(aggBody)
      });
      if (res.ok) {
        const data = await res.json();
        const rows = Array.isArray(data) ? data : [data];
        for (let i = 0; i < rows.length; i++) {
          const row = rows[i];
          const fields = row && row.result && row.result.aggregateFields;
          const total = fields && fields.total;
          if (total && total.integerValue != null) {
            const n = Number(total.integerValue);
            if (Number.isFinite(n) && n >= 0) return Math.max(0, n - excludedCount);
          }
        }
      } else {
        console.warn('fetchMessageOrdinal rest status', res.status);
      }
    } catch (err) {
      console.warn('fetchMessageOrdinal rest', err);
    }
    return null;
  }

  // 1-based position of a specific PHOTO among every photo ever uploaded through the gallery's
  // own "이미지 업로드" action (uploadSource: 'gallery') -- used by the Lightbox source label
  // ("갤러리 #20"). A single gallery upload can chunk into several messages with several photos
  // each, so this sums photo counts across messages (ordered by timestamp) rather than counting
  // messages the way fetchMessageOrdinal does for plain chat photos. Fetches the uploadSource==
  // 'gallery' subset with a single-field equality filter -- deliberately not combined with a
  // timestamp range filter in the same Firestore query, which would need a composite index this
  // app doesn't define -- and does the ordering/summing client-side instead.
  async function fetchGalleryPhotoOrdinal(calId, messageId, imageIndex) {
    if (!isValidCalId(calId) || !messageId) return null;
    const idx = Number.isInteger(imageIndex) ? imageIndex : 0;
    const firebaseDb = getDb();
    let docs = null;
    if (firebaseDb) {
      try {
        const snap = await firebaseDb.collection('calendars').doc('cal_' + calId).collection('messages')
          .where('uploadSource', '==', 'gallery').get();
        docs = [];
        snap.forEach(function (doc) { docs.push({ id: doc.id, ...doc.data() }); });
      } catch (err) {
        console.warn('fetchGalleryPhotoOrdinal sdk', err);
      }
    }
    if (!docs) {
      try {
        const parentPath = 'projects/' + projectId() + '/databases/(default)/documents/calendars/cal_' + calId;
        const url = 'https://firestore.googleapis.com/v1/' + parentPath + ':runQuery';
        const body = {
          structuredQuery: {
            from: [{ collectionId: 'messages' }],
            where: {
              fieldFilter: {
                field: { fieldPath: 'uploadSource' },
                op: 'EQUAL',
                value: { stringValue: 'gallery' }
              }
            }
          }
        };
        const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        if (res.ok) {
          const data = await res.json();
          const rows = Array.isArray(data) ? data : [data];
          docs = rows.filter(function (row) { return row && row.document; }).map(function (row) {
            return { id: row.document.name.split('/').pop(), ...docToJs(row.document) };
          });
        } else {
          console.warn('fetchGalleryPhotoOrdinal rest status', res.status);
        }
      } catch (err) {
        console.warn('fetchGalleryPhotoOrdinal rest', err);
      }
    }
    if (!docs) return null;
    docs.sort(function (a, b) { return (Number(a.timestamp) || 0) - (Number(b.timestamp) || 0); });
    let count = 0;
    for (let i = 0; i < docs.length; i++) {
      const doc = docs[i];
      const photoCount = Array.isArray(doc.imageUrls) && doc.imageUrls.length > 0
        ? doc.imageUrls.length
        : (doc.imageUrl ? 1 : 0);
      if (doc.id === messageId) return count + Math.min(idx, Math.max(0, photoCount - 1)) + 1;
      count += photoCount;
    }
    return null;
  }

  async function fetchOlderChatMessages(calId, beforeTimestamp, pageSize) {
    if (!isValidCalId(calId) || !beforeTimestamp) return [];
    const size = pageSize != null ? pageSize : olderPageSize();
    const firebaseDb = getDb();
    if (firebaseDb) {
      try {
        const snap = await firebaseDb.collection('calendars').doc('cal_' + calId).collection('messages')
          .orderBy('timestamp', 'desc').startAfter(beforeTimestamp).limit(size).get();
        const list = [];
        snap.forEach(function (doc) { list.push(slimMessage({ id: doc.id, ...doc.data() })); });
        return list.reverse();
      } catch (err) {
        console.warn('fetchOlderChatMessages sdk', err);
      }
    }
    try {
      const parent = 'projects/' + projectId() + '/databases/(default)/documents/calendars/cal_' + calId;
      const url = 'https://firestore.googleapis.com/v1/' + parent + ':runQuery';
      const body = {
        structuredQuery: {
          from: [{ collectionId: 'messages' }],
          where: {
            fieldFilter: {
              field: { fieldPath: 'timestamp' },
              op: 'LESS_THAN',
              value: { integerValue: String(beforeTimestamp) }
            }
          },
          orderBy: [{ field: { fieldPath: 'timestamp' }, direction: 'DESCENDING' }],
          limit: size
        }
      };
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (!res.ok) return [];
      const rows = await res.json();
      const list = [];
      (Array.isArray(rows) ? rows : []).forEach(function (row) {
        const doc = row.document;
        if (!doc || !doc.name) return;
        list.push(slimMessage({ id: doc.name.split('/').pop(), ...docToJs(doc) }));
      });
      return list.reverse();
    } catch (err) {
      console.warn('fetchOlderChatMessages rest', err);
      return [];
    }
  }

  const galleryItemCountCache = Object.create(null);
  const GALLERY_COUNT_CACHE_MS = 5 * 60 * 1000;

  async function fetchGalleryItemCount(calId, maxPages) {
    if (!isValidCalId(calId)) return null;
    if (maxPages == null) maxPages = 8;
    const cached = galleryItemCountCache[calId];
    if (cached && (Date.now() - cached.at) < GALLERY_COUNT_CACHE_MS && typeof cached.n === 'number') {
      return cached.n;
    }
    const firebaseDb = getDb();
    if (!firebaseDb) return null;
    try {
      let total = 0;
      let lastDoc = null;
      for (let page = 0; page < maxPages; page++) {
        let q = firebaseDb.collection('calendars').doc('cal_' + calId).collection('messages')
          .orderBy('timestamp', 'desc').limit(80);
        if (lastDoc) q = q.startAfter(lastDoc);
        const snap = await q.get();
        if (snap.empty) break;
        snap.forEach(function (doc) {
          const msg = { id: doc.id, ...doc.data() };
          total += imageEntries(msg).length;
          if (directEntry(msg)) total += 1;
        });
        lastDoc = snap.docs[snap.docs.length - 1];
        if (snap.size < 80) break;
      }
      galleryItemCountCache[calId] = { n: total, at: Date.now() };
      return total;
    } catch (err) {
      console.warn('fetchGalleryItemCount', err);
      return null;
    }
  }


  function noop() {}

  function subscribeCalSubcollection(calId, subName, options, onSnapshot, onError) {
    const firebaseDb = getDb();
    if (!firebaseDb || !isValidCalId(calId) || !subName) return noop;
    options = options || {};
    try {
      let q = firebaseDb.collection('calendars').doc('cal_' + calId).collection(subName);
      if (options.where && options.where.length >= 3) {
        q = q.where(options.where[0], options.where[1], options.where[2]);
      }
      if (options.orderBy) {
        q = q.orderBy(options.orderBy, options.direction || 'desc');
      }
      if (options.limit != null && options.limit > 0) {
        q = q.limit(options.limit);
      }
      return q.onSnapshot(onSnapshot, onError || noop);
    } catch (err) {
      console.warn('subscribeCalSubcollection', subName, err);
      if (typeof onError === 'function') onError(err);
      return noop;
    }
  }

  function subscribeMessages(calId, options, onSnapshot, onError) {
    options = options || {};
    return subscribeCalSubcollection(
      calId, 'messages',
      { orderBy: options.orderBy || 'timestamp', direction: options.direction || 'desc', limit: options.limit },
      onSnapshot, onError
    );
  }

  function subscribePlaces(calId, onSnapshot, onError) {
    return subscribeCalSubcollection(calId, 'places', {}, onSnapshot, onError);
  }

  function subscribeMemos(calId, options, onSnapshot, onError) {
    options = options || {};
    const spec = {};
    if (options.where) spec.where = options.where;
    if (options.orderBy) {
      spec.orderBy = options.orderBy;
      spec.direction = options.direction || 'desc';
    }
    if (options.limit != null) spec.limit = options.limit;
    return subscribeCalSubcollection(calId, 'memos', spec, onSnapshot, onError);
  }

  function subscribeAnniversaries(calId, onSnapshot, onError) {
    // Do NOT orderBy createdAt: older docs may lack the field and are then invisible.
    return subscribeCalSubcollection(calId, 'anniversaries', {}, onSnapshot, onError);
  }

  export const GATHER_FIREBASE_SERVICES = Object.freeze({
    version: '0.3.1-p3-4',
    ready: true,
    isScaffold: false,
    fetchChatMessagesRest: fetchChatMessagesRest,
    fetchAllChatMessagesRest: fetchAllChatMessagesRest,
    fetchRecentChatMessages: fetchRecentChatMessages,
    fetchRecentGalleryMessages: fetchRecentGalleryMessages,
    fetchMessagesByImageTag: fetchMessagesByImageTag,
    fetchMeetingPhotoIndex: fetchMeetingPhotoIndex,
    fetchSubcollectionCount: fetchSubcollectionCount,
    fetchOlderChatMessages: fetchOlderChatMessages,
    fetchMessageOrdinal: fetchMessageOrdinal,
    fetchGalleryPhotoOrdinal: fetchGalleryPhotoOrdinal,
    fetchGalleryItemCount: fetchGalleryItemCount,
    subscribeCalSubcollection: subscribeCalSubcollection,
    subscribeMessages: subscribeMessages,
    subscribePlaces: subscribePlaces,
    subscribeMemos: subscribeMemos,
    subscribeAnniversaries: subscribeAnniversaries
  });

if (typeof window !== 'undefined') {
  window.GATHER_FIREBASE_SERVICES = GATHER_FIREBASE_SERVICES;
}
