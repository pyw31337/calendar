/**
 * Firebase data access helpers (P3-2).
 * Loaded before app-main.js. Runtime deps: window.GATHER_FIREBASE_DEPS
 */
function deps() { return window.GATHER_FIREBASE_DEPS || {}; }
  const FIRESTORE_REST_TIMEOUT_MS = 9000;
  function fetchWithTimeout(url, init, timeoutMs) {
    const controller = typeof AbortController === 'function' ? new AbortController() : null;
    const timeout = Number(timeoutMs) > 0 ? Number(timeoutMs) : FIRESTORE_REST_TIMEOUT_MS;
    let timer = null;
    const request = fetch(url, controller ? { ...(init || {}), signal: controller.signal } : (init || {}));
    const deadline = new Promise(function (_, reject) {
      timer = setTimeout(function () {
        if (controller) controller.abort();
        reject(new Error('Firestore REST read timed out'));
      }, timeout);
    });
    return Promise.race([request, deadline]).finally(function () { if (timer) clearTimeout(timer); });
  }
  function withSdkTimeout(promise, timeoutMs) {
    let timer = null;
    const deadline = new Promise(function (_, reject) {
      timer = setTimeout(function () { reject(new Error('Firestore SDK read timed out')); }, Number(timeoutMs) || FIRESTORE_REST_TIMEOUT_MS);
    });
    return Promise.race([promise, deadline]).finally(function () { if (timer) clearTimeout(timer); });
  }
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
      const res = await fetchWithTimeout(url, { cache: 'no-store' });
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
        var res = await fetchWithTimeout(url, { cache: 'no-store' });
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
    // Capped at 400 (not the old 100) so the main-screen chat preview's hydration safety net
    // (app-main.js) can escalate its raw window deep enough to outlast a burst of dozens of
    // 일정(meeting)/갤러리 photo uploads, which share this same `messages` collection but are
    // filtered out client-side (isChatRenderableMessage) -- a caller asking for more than the
    // old cap used to get silently truncated back to 100 raw docs, which a large-enough photo
    // burst could still fully occupy, leaving genuinely recent chat text undiscoverable no
    // matter how many times the caller retried the same query.
    const pageSize = Math.max(1, Math.min(400, Number(limit) || 60));
    const firebaseDb = getDb();
    // Firestore's orderBy() silently excludes any document that is missing the field being
    // ordered on -- not just sorts it oddly, drops it from the result set entirely, at any limit.
    // A message doc that somehow ended up without a `timestamp` field (a bad write, an old
    // migration, manual Firestore console edits) would then be invisible to every orderBy('timestamp')
    // query forever, while a plain count() aggregation still counts it -- exactly the "count says
    // there's chat, nothing ever loads" symptom. If the ordered query comes back empty, fall back to
    // an unordered read (which has no such exclusion) and sort client-side, so those documents are
    // still findable instead of being permanently invisible.
    let orderedEmpty = false;
    try {
      if (firebaseDb) {
        const snap = await withSdkTimeout(firebaseDb.collection('calendars').doc('cal_' + calId).collection('messages')
          .orderBy('timestamp', 'desc').limit(pageSize).get(), FIRESTORE_REST_TIMEOUT_MS);
        const list = [];
        snap.forEach(function (doc) { list.push(slimMessage({ id: doc.id, ...doc.data() })); });
        if (list.length > 0) return list.reverse();
        orderedEmpty = true;
      }
    } catch (err) {
      console.warn('fetchRecentChatMessages sdk', err);
    }
    if (orderedEmpty && firebaseDb) {
      try {
        const snap = await withSdkTimeout(firebaseDb.collection('calendars').doc('cal_' + calId).collection('messages')
          .limit(pageSize).get(), FIRESTORE_REST_TIMEOUT_MS);
        const list = [];
        snap.forEach(function (doc) { list.push(slimMessage({ id: doc.id, ...doc.data() })); });
        if (list.length > 0) {
          list.sort(function (a, b) { return (Number(a.timestamp) || 0) - (Number(b.timestamp) || 0); });
          console.warn('fetchRecentChatMessages: recovered', list.length, 'message(s) via unordered fallback -- some docs are likely missing a timestamp field');
          return list;
        }
      } catch (err) {
        console.warn('fetchRecentChatMessages unordered fallback', err);
      }
    }
    try {
      const url = 'https://firestore.googleapis.com/v1/projects/' + projectId() + '/databases/(default)/documents/calendars/cal_' + calId + '/messages?orderBy=timestamp%20desc&pageSize=' + pageSize;
      const res = await fetchWithTimeout(url, { cache: 'no-store' });
      if (!res.ok) return [];
      const data = await res.json();
      const list = (data.documents || []).map(function (doc) {
        return slimMessage({ id: doc.name.split('/').pop(), ...docToJs(doc) });
      });
      if (list.length > 0) return list.reverse();
    } catch (err) {
      console.warn('fetchRecentChatMessages rest', err);
    }
    // Same unordered-fallback reasoning as the SDK path above, for when only REST is available.
    try {
      const url = 'https://firestore.googleapis.com/v1/projects/' + projectId() + '/databases/(default)/documents/calendars/cal_' + calId + '/messages?pageSize=' + pageSize;
      const res = await fetchWithTimeout(url, { cache: 'no-store' });
      if (!res.ok) return [];
      const data = await res.json();
      const list = (data.documents || []).map(function (doc) {
        return slimMessage({ id: doc.name.split('/').pop(), ...docToJs(doc) });
      });
      list.sort(function (a, b) { return (Number(a.timestamp) || 0) - (Number(b.timestamp) || 0); });
      if (list.length > 0) console.warn('fetchRecentChatMessages: recovered', list.length, 'message(s) via unordered REST fallback');
      return list;
    } catch (err) {
      console.warn('fetchRecentChatMessages unordered rest fallback', err);
      return [];
    }
  }

  // Page only until enough media has been found for the preview. The previous implementation
  // downloaded the entire messages collection just to render twelve thumbnails, which became
  // progressively slower and more expensive as a calendar grew.
  async function fetchRecentGalleryMessages(calId, desiredMediaCount) {
    if (!isValidCalId(calId)) return [];
    const target = Math.max(1, Math.min(60, Number(desiredMediaCount) || 12));
    const pageSize = 40;
    const mediaCount = function (msg) {
      return imageEntries(msg).length + (directEntry(msg) ? 1 : 0);
    };
    const firebaseDb = getDb();
    if (firebaseDb) try {
      const collected = [];
      let found = 0;
      let lastDoc = null;
      while (found < target) {
        let q = firebaseDb.collection('calendars').doc('cal_' + calId).collection('messages')
          .orderBy('timestamp', 'desc').limit(pageSize);
        if (lastDoc) q = q.startAfter(lastDoc);
        const snap = await withSdkTimeout(q.get(), FIRESTORE_REST_TIMEOUT_MS);
        if (snap.empty) break;
        snap.forEach(function (doc) {
          if (found >= target) return;
          const msg = slimMessage({ id: doc.id, ...doc.data() });
          collected.push(msg);
          found += mediaCount(msg);
        });
        lastDoc = snap.docs[snap.docs.length - 1];
        if (snap.size < pageSize) break;
      }
      return collected.reverse();
    } catch (err) {
      console.warn('fetchRecentGalleryMessages sdk', err);
    }
    try {
      const collected = [];
      let found = 0;
      let pageToken = '';
      while (found < target) {
        let url = 'https://firestore.googleapis.com/v1/projects/' + projectId() + '/databases/(default)/documents/calendars/cal_' + calId + '/messages?orderBy=timestamp%20desc&pageSize=' + pageSize;
        if (pageToken) url += '&pageToken=' + encodeURIComponent(pageToken);
        const res = await fetchWithTimeout(url, { cache: 'no-store' });
        if (!res.ok) break;
        const data = await res.json();
        (data.documents || []).forEach(function (doc) {
          if (found >= target) return;
          const msg = slimMessage({ id: doc.name.split('/').pop(), ...docToJs(doc) });
          collected.push(msg);
          found += mediaCount(msg);
        });
        pageToken = data.nextPageToken || '';
        if (!pageToken) break;
      }
      return collected.reverse();
    } catch (err) {
      console.warn('fetchRecentGalleryMessages rest', err);
      return [];
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
        const snap = await withSdkTimeout(firebaseDb.collection('calendars').doc('cal_' + calId).collection('messages').get({ source: 'server' }), FIRESTORE_REST_TIMEOUT_MS);
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
        const res = await fetchWithTimeout('https://firestore.googleapis.com/v1/' + parent + '/messages' + query, { cache: 'no-store' });
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

  // DateModal must find tagged memos independently from the memo page's recent-item window.
  // Tags are stored as an array, but legacy values are not perfectly normalized (some include
  // the leading # and some do not), so scan the bounded subcollection and compare normalized
  // tokens instead of relying on one array-contains query that would miss older shapes.
  async function fetchMemosByTag(calId, memoTag) {
    if (!isValidCalId(calId) || !memoTag) return [];
    const needle = String(memoTag).trim().replace(/^#/, '').toLowerCase();
    const hasTag = function (memo) {
      const values = Array.isArray(memo.tags) ? memo.tags : [memo.tags];
      return values.some(function (value) {
        return String(value || '').trim().replace(/^#/, '').toLowerCase() === needle;
      });
    };
    const firebaseDb = getDb();
    if (firebaseDb) {
      try {
        const snap = await withSdkTimeout(firebaseDb.collection('calendars').doc('cal_' + calId).collection('memos').get({ source: 'server' }), FIRESTORE_REST_TIMEOUT_MS);
        const list = [];
        snap.forEach(function (doc) {
          const memo = { id: doc.id, ...doc.data() };
          if (hasTag(memo)) list.push(memo);
        });
        return list;
      } catch (err) {
        console.warn('fetchMemosByTag sdk', memoTag, err);
      }
    }
    try {
      const parent = 'projects/' + projectId() + '/databases/(default)/documents/calendars/cal_' + calId;
      const list = [];
      let pageToken = '';
      do {
        const query = '?pageSize=1000' + (pageToken ? '&pageToken=' + encodeURIComponent(pageToken) : '');
        const res = await fetchWithTimeout('https://firestore.googleapis.com/v1/' + parent + '/memos' + query, { cache: 'no-store' });
        if (!res.ok) return list;
        const data = await res.json();
        (data.documents || []).forEach(function (doc) {
          const memo = { id: doc.name.split('/').pop(), ...docToJs(doc) };
          if (hasTag(memo)) list.push(memo);
        });
        pageToken = data.nextPageToken || '';
      } while (pageToken);
      return list;
    } catch (err) {
      console.warn('fetchMemosByTag rest', memoTag, err);
      return [];
    }
  }

  async function fetchMeetingPhotoIndex(calId, date) {
    if (!isValidCalId(calId) || !date) return [];
    const db = getDb();
    if (db) {
      try {
        const snap = await withSdkTimeout(db.collection('calendars').doc('cal_' + calId).collection('meetingPhotoIndex')
          .where('date', '==', String(date)).get({ source: 'server' }), FIRESTORE_REST_TIMEOUT_MS);
        const list = [];
        snap.forEach(function (doc) { list.push({ id: doc.id, ...doc.data(), source: 'meeting-index' }); });
        return list;
      } catch (err) { console.warn('fetchMeetingPhotoIndex sdk', date, err); }
    }
    try {
      const parent = 'projects/' + projectId() + '/databases/(default)/documents/calendars/cal_' + calId;
      const res = await fetchWithTimeout('https://firestore.googleapis.com/v1/' + parent + ':runQuery', {
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
          const snap = await withSdkTimeout(ref.count().get(), FIRESTORE_REST_TIMEOUT_MS);
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
      const res = await fetchWithTimeout(url, {
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
        const snap = await withSdkTimeout(firebaseDb.collection('calendars').doc('cal_' + calId).collection('messages')
          .where('uploadSource', '==', uploadSource).get(), FIRESTORE_REST_TIMEOUT_MS);
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
      const res = await fetchWithTimeout(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
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
          const snap = await withSdkTimeout(ref.count().get(), FIRESTORE_REST_TIMEOUT_MS);
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
      const res = await fetchWithTimeout(url, {
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
          const snap = await withSdkTimeout(ref.count().get(), FIRESTORE_REST_TIMEOUT_MS);
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
        const res = await fetchWithTimeout(url, {
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
        const snap = await withSdkTimeout(firebaseDb.collection('calendars').doc('cal_' + calId).collection('messages')
          .where('uploadSource', '==', 'gallery').get(), FIRESTORE_REST_TIMEOUT_MS);
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
        const res = await fetchWithTimeout(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
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
        const snap = await withSdkTimeout(firebaseDb.collection('calendars').doc('cal_' + calId).collection('messages')
          .orderBy('timestamp', 'desc').startAfter(beforeTimestamp).limit(size).get(), FIRESTORE_REST_TIMEOUT_MS);
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
      const res = await fetchWithTimeout(url, {
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

  function invalidateGalleryItemCount(calId) {
    if (!isValidCalId(calId)) return;
    delete galleryItemCountCache[calId];
  }

  async function fetchGalleryItemCount(calId, maxPages) {
    if (!isValidCalId(calId)) return null;
    // This is an exact count, not a display preview. A caller may pass maxPages for an
    // explicitly bounded diagnostic, but normal UI calls must scan until Firestore is exhausted.
    if (maxPages == null) maxPages = Infinity;
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
        const snap = await withSdkTimeout(q.get({ source: 'server' }), FIRESTORE_REST_TIMEOUT_MS);
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

  // Real-time chat listener. Firestore's orderBy() silently EXCLUDES any document missing the
  // ordered field from the result set (see fetchRecentChatMessages above for the same issue on
  // the one-shot path) -- and unlike a one-shot read, an onSnapshot subscription only fires once
  // for a query that keeps matching zero documents, so nothing ever re-checks it. If some message
  // docs in this calendar lack a `timestamp` field (a bad write, an old migration, a manual edit),
  // this listener would report "empty" forever and never recover on its own, no matter how much
  // real chat history exists in the collection -- exactly the "count says there's chat, chat room
  // shows nothing" symptom, but for the live listener rather than a single fetch. When the ordered
  // query's first snapshot comes back empty, fall back to an unordered live listener (which has no
  // such exclusion), sorting/limiting the results client-side before handing them to the caller in
  // the same snapshot-like shape (a `forEach`) callers already rely on.
  function subscribeMessages(calId, options, onSnapshot, onError) {
    const firebaseDb = getDb();
    if (!firebaseDb || !isValidCalId(calId)) return noop;
    options = options || {};
    const orderField = options.orderBy || 'timestamp';
    const direction = options.direction || 'desc';
    const limitN = Number(options.limit) > 0 ? Number(options.limit) : null;

    let stopped = false;
    let innerUnsub = noop;

    function sortedSnapshotFrom(docs) {
      const sorted = docs.slice().sort(function (a, b) {
        const ta = Number(a.data()[orderField]) || 0;
        const tb = Number(b.data()[orderField]) || 0;
        return direction === 'desc' ? tb - ta : ta - tb;
      });
      const limited = limitN ? sorted.slice(0, limitN) : sorted;
      return { forEach: function (fn) { limited.forEach(fn); } };
    }

    function attachUnordered() {
      if (stopped) return;
      try {
        let q = firebaseDb.collection('calendars').doc('cal_' + calId).collection('messages');
        // No orderBy to apply server-side, so widen the raw window before sorting/limiting
        // client-side -- otherwise an arbitrary-order limit() could clip out the very messages
        // that should have been "most recent".
        q = q.limit(limitN ? Math.max(limitN * 4, 200) : 200);
        innerUnsub = q.onSnapshot(function (snap) {
          if (stopped) return;
          onSnapshot(sortedSnapshotFrom(snap.docs));
        }, onError || noop);
      } catch (err) {
        console.warn('subscribeMessages unordered fallback', err);
        if (typeof onError === 'function') onError(err);
      }
    }

    function attachOrdered() {
      let usedFallback = false;
      try {
        let q = firebaseDb.collection('calendars').doc('cal_' + calId).collection('messages')
          .orderBy(orderField, direction);
        if (limitN) q = q.limit(limitN);
        innerUnsub = q.onSnapshot(function (snap) {
          if (stopped) return;
          if (snap.empty && !usedFallback) {
            usedFallback = true;
            const prevUnsub = innerUnsub;
            attachUnordered();
            if (typeof prevUnsub === 'function') prevUnsub();
            return;
          }
          onSnapshot(snap);
        }, function (err) {
          console.warn('subscribeMessages ordered', err);
          if (typeof onError === 'function') onError(err);
        });
      } catch (err) {
        console.warn('subscribeMessages ordered attach', err);
        if (typeof onError === 'function') onError(err);
      }
    }

    attachOrdered();

    return function () {
      stopped = true;
      if (typeof innerUnsub === 'function') innerUnsub();
    };
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
    fetchMemosByTag: fetchMemosByTag,
    fetchMeetingPhotoIndex: fetchMeetingPhotoIndex,
    fetchSubcollectionCount: fetchSubcollectionCount,
    fetchOlderChatMessages: fetchOlderChatMessages,
    fetchMessageOrdinal: fetchMessageOrdinal,
    fetchGalleryPhotoOrdinal: fetchGalleryPhotoOrdinal,
    fetchGalleryItemCount: fetchGalleryItemCount,
    invalidateGalleryItemCount: invalidateGalleryItemCount,
    subscribeCalSubcollection: subscribeCalSubcollection,
    subscribeMessages: subscribeMessages,
    subscribePlaces: subscribePlaces,
    subscribeMemos: subscribeMemos,
    subscribeAnniversaries: subscribeAnniversaries
  });

if (typeof window !== 'undefined') {
  window.GATHER_FIREBASE_SERVICES = GATHER_FIREBASE_SERVICES;
}
