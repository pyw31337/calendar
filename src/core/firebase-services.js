/**
 * Firebase data access helpers (P3-2).
 * Loaded before app-main.js. Runtime deps: window.GATHER_FIREBASE_DEPS
 */
(function () {
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

  async function fetchSubcollectionCount(calId, subName) {
    if (!isValidCalId(calId) || !subName) return null;
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
    return subscribeCalSubcollection(
      calId, 'anniversaries',
      { orderBy: 'createdAt', direction: 'desc' },
      onSnapshot, onError
    );
  }

  window.GATHER_FIREBASE_SERVICES = Object.freeze({
    version: '0.3.1-p3-4',
    ready: true,
    isScaffold: false,
    fetchChatMessagesRest: fetchChatMessagesRest,
    fetchRecentChatMessages: fetchRecentChatMessages,
    fetchSubcollectionCount: fetchSubcollectionCount,
    fetchOlderChatMessages: fetchOlderChatMessages,
    fetchGalleryItemCount: fetchGalleryItemCount,
    subscribeCalSubcollection: subscribeCalSubcollection,
    subscribeMessages: subscribeMessages,
    subscribePlaces: subscribePlaces,
    subscribeMemos: subscribeMemos,
    subscribeAnniversaries: subscribeAnniversaries
  });
})();
