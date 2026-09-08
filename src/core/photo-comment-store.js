import { fetchPhotoComments } from './photo-comments.js';

const CACHE_VERSION = 1;
const CACHE_TTL_MS = 10 * 60 * 1000;
const REQUEST_TIMEOUT_MS = 6500;

function cleanKey(value) {
  return String(value || '').replace(/[^A-Za-z0-9_:.-]/g, '_').slice(0, 300);
}

function cacheKey(calendarId) {
  return `gather:photo-comments:v${CACHE_VERSION}:${calendarId}`;
}

function withTimeout(promise, timeoutMs = REQUEST_TIMEOUT_MS) {
  let timer;
  return Promise.race([
    Promise.resolve(promise),
    new Promise((_, reject) => {
      timer = setTimeout(() => reject(Object.assign(new Error('photo comments timeout'), { code: 'TIMEOUT' })), timeoutMs);
    })
  ]).finally(() => clearTimeout(timer));
}

function readSessionCache(calendarId) {
  try {
    const parsed = JSON.parse(sessionStorage.getItem(cacheKey(calendarId)) || 'null');
    if (!parsed || parsed.version !== CACHE_VERSION || Date.now() - Number(parsed.savedAt || 0) > CACHE_TTL_MS) return null;
    return parsed.comments && typeof parsed.comments === 'object'
      ? { comments: parsed.comments, complete: parsed.complete === true }
      : null;
  } catch (_) {
    return null;
  }
}

function writeSessionCache(calendarId, comments, complete = false) {
  try {
    sessionStorage.setItem(cacheKey(calendarId), JSON.stringify({
      version: CACHE_VERSION,
      savedAt: Date.now(),
      comments,
      complete
    }));
  } catch (_) {}
}

function countsFromComments(commentsByKey) {
  const counts = {};
  Object.entries(commentsByKey || {}).forEach(([key, comments]) => {
    if (Array.isArray(comments) && comments.length > 0) counts[key] = comments.length;
  });
  return counts;
}

export function createPhotoCommentStore({ calendarId, db, projectId, decodeDocument, fetchCountsRest, enableBulkHydration = true }) {
  const cachedState = readSessionCache(calendarId);
  let commentsByKey = cachedState?.comments || {};
  let countOverrides = {};
  // `ready` means the cache is complete for every possible photo key. A few point-read results
  // are useful cache entries, but must never make an unrelated lightbox skip its own fetch.
  let ready = cachedState?.complete === true;
  let stopped = false;
  let unsubscribe = null;
  let listener = null;
  const pending = new Map();

  const emit = source => {
    if (stopped || typeof listener !== 'function') return;
    listener({
      commentsByKey: { ...commentsByKey },
      counts: { ...countOverrides, ...countsFromComments(commentsByKey) },
      ready,
      source
    });
  };

  const replaceFromSnapshot = snapshot => {
    const next = {};
    snapshot.forEach(doc => {
      const data = doc.data() || {};
      next[doc.id] = Array.isArray(data.comments) ? data.comments : [];
    });
    if (snapshot.metadata?.fromCache) commentsByKey = { ...commentsByKey, ...next };
    else {
      commentsByKey = next;
      countOverrides = countsFromComments(next);
    }
    // A cache snapshot is already sufficient for instant rendering. A missing key still falls
    // through to fetch()'s bounded point-read, so this never turns an incomplete cache into a
    // false permanent "no comments" answer.
    ready = snapshot.metadata?.fromCache ? ready : true;
    writeSessionCache(calendarId, commentsByKey, ready);
    emit(snapshot.metadata?.fromCache ? 'sdk-cache' : 'sdk-server');
  };

  const hydrateRest = async () => {
    if (typeof fetchCountsRest !== 'function') return;
    try {
      const counts = await withTimeout(fetchCountsRest(calendarId));
      if (stopped) return;
      // REST hydration intentionally stores counts separately from bodies. Treating a count as
      // a fake comment array would make the lightbox believe it had already loaded the thread.
      countOverrides = { ...countOverrides, ...(counts || {}) };
      emit('rest-counts');
    } catch (_) {
      // Point reads remain available even when bulk hydration is temporarily unavailable.
      emit('rest-timeout');
    }
  };

  const start = onChange => {
    listener = onChange;
    emit('session-cache');
    if (enableBulkHydration) void hydrateRest();
    if (db && enableBulkHydration) {
      unsubscribe = db.collection('calendars').doc(`cal_${calendarId}`).collection('photoComments')
        .onSnapshot(replaceFromSnapshot, () => {
          emit('sdk-error');
        });
    }
    return () => stop();
  };

  const fetchOne = async photoKey => {
    const docId = cleanKey(photoKey);
    if (!docId) return { success: true, comments: [] };
    const cached = commentsByKey[docId];
    if (Array.isArray(cached) && cached.every(Boolean)) return { success: true, comments: cached };
    if (pending.has(docId)) return pending.get(docId);
    const request = (async () => {
      // SDK streams can be healthy for writes yet stall on a point read behind certain browser
      // proxies. Race the cache-aware SDK read with plain REST and accept the first successful
      // answer instead of making the user wait through two serial timeouts.
      const sources = db ? [db, null] : [null];
      const result = await withTimeout(new Promise(resolve => {
        let remaining = sources.length;
        let settled = false;
        sources.forEach(sourceDb => {
          Promise.resolve(fetchPhotoComments({
            photoKey: docId, calendarId, db: sourceDb, projectId, decodeDocument
          })).then(value => {
            if (!settled && value?.success) {
              settled = true;
              resolve(value);
              return;
            }
            remaining -= 1;
            if (!settled && remaining === 0) resolve({ success: false, comments: [] });
          }).catch(() => {
            remaining -= 1;
            if (!settled && remaining === 0) resolve({ success: false, comments: [] });
          });
        });
      })).catch(() => ({ success: false, comments: [] }));
      const normalized = result?.success
        ? { success: true, comments: Array.isArray(result.comments) ? result.comments : [] }
        : { success: false, comments: [] };
      if (normalized.success) {
        commentsByKey[docId] = normalized.comments;
        writeSessionCache(calendarId, commentsByKey, ready);
        emit('point-read');
      }
      return normalized;
    })().finally(() => pending.delete(docId));
    pending.set(docId, request);
    return request;
  };

  const updateLocal = (photoKey, comments) => {
    const docId = cleanKey(photoKey);
    if (!docId) return;
    if (Array.isArray(comments) && comments.length > 0) commentsByKey[docId] = comments;
    else delete commentsByKey[docId];
    if (Array.isArray(comments) && comments.length > 0) countOverrides[docId] = comments.length;
    else delete countOverrides[docId];
    writeSessionCache(calendarId, commentsByKey, ready);
    emit('local-write');
  };

  const stop = () => {
    stopped = true;
    if (typeof unsubscribe === 'function') unsubscribe();
    unsubscribe = null;
    listener = null;
  };

  return { start, fetch: fetchOne, updateLocal, stop, isReady: () => ready };
}

