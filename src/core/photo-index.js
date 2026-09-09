const PAGE_SIZE = 100;
const pageCache = new Map();
const REQUEST_TIMEOUT_MS = 8000;

function cacheId(calendarId, page) {
  return `${calendarId}:${page}`;
}

async function fetchJsonWithRetry(url, init, attempts = 2) {
  let lastError = null;
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const controller = typeof AbortController === 'function' ? new AbortController() : null;
    const timer = controller ? setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS) : null;
    try {
      const response = await fetch(url, { ...init, ...(controller ? { signal: controller.signal } : {}) });
      if (!response.ok) throw new Error(`photo index request failed: ${response.status}`);
      return await response.json();
    } catch (error) {
      lastError = error;
      if (attempt + 1 < attempts) await new Promise(resolve => setTimeout(resolve, 180 * (attempt + 1)));
    } finally {
      if (timer) clearTimeout(timer);
    }
  }
  throw lastError || new Error('photo index request failed');
}

function isGalleryContentPosterRow(item) {
  const source = String(item?.source || '').trim();
  if (source === 'anniversary') return true;
  const owners = Array.isArray(item?.owners) ? item.owners : [];
  if (owners.length && owners.every(owner => String(owner?.source || '').trim() === 'anniversary'
    || String(owner?.sourceOwner || '').startsWith('anniversary:'))) {
    return true;
  }
  return String(item?.sourceOwner || '').startsWith('anniversary:');
}

async function fetchPhotoIndexAggregationCount({ calendarId, projectId, sourceEquals = null }) {
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/calendars/cal_${calendarId}:runAggregationQuery`;
  const structuredQuery = { from: [{ collectionId: 'photoIndex' }] };
  if (sourceEquals) {
    structuredQuery.where = {
      fieldFilter: {
        field: { fieldPath: 'source' },
        op: 'EQUAL',
        value: { stringValue: sourceEquals }
      }
    };
  }
  const rows = await fetchJsonWithRetry(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      structuredAggregationQuery: {
        structuredQuery,
        aggregations: [{ alias: 'total', count: {} }]
      }
    })
  });
  const value = rows?.[0]?.result?.aggregateFields?.total?.integerValue;
  return Number.isFinite(Number(value)) ? Number(value) : 0;
}

export async function fetchPhotoIndexCount({ calendarId, projectId }) {
  // Movie/sports content posters are indexed as source=anniversary; gallery 사진 must omit them.
  const [total, anniversaryTotal] = await Promise.all([
    fetchPhotoIndexAggregationCount({ calendarId, projectId }),
    fetchPhotoIndexAggregationCount({ calendarId, projectId, sourceEquals: 'anniversary' })
  ]);
  return Math.max(0, total - anniversaryTotal);
}

// Client-safe read-only verification for gallery totals. Compares the live photoIndex
// aggregation (anniversary posters already subtracted) against an optional expected count
// from a rebuild dry-run / local estimate. Does not write.
export async function verifyGalleryPhotoIndexTotals({
  calendarId,
  projectId,
  expectedGalleryCount = null
} = {}) {
  const indexedGalleryCount = await fetchPhotoIndexCount({ calendarId, projectId });
  const expected = expectedGalleryCount == null ? null : Number(expectedGalleryCount);
  const hasExpected = Number.isFinite(expected);
  return {
    calendarId,
    indexedGalleryCount,
    expectedGalleryCount: hasExpected ? expected : null,
    matches: hasExpected ? indexedGalleryCount === expected : null,
    delta: hasExpected ? indexedGalleryCount - expected : null
  };
}

// Normalize a rebuildPhotoIndex / photoIndexBackfillLocal report into the gallery-facing
// totals operators care about (chat∪memo∪meeting; anniversary posters excluded).
export function summarizePhotoIndexRebuildReport(report = {}) {
  const bySource = report?.bySource && typeof report.bySource === 'object' ? report.bySource : {};
  const galleryIndexedPhotos = Number.isFinite(Number(report?.galleryIndexedPhotos))
    ? Number(report.galleryIndexedPhotos)
    : Math.max(0, Number(report?.indexedPhotos || 0) - Number(bySource.anniversary || 0));
  return {
    calendarId: report?.calendarId || '',
    mode: report?.mode || 'unknown',
    galleryIndexedPhotos,
    bySource,
    existingRows: Number(report?.existingRows || 0),
    staleRows: Number(report?.staleRows || 0),
    sourceDocuments: report?.sourceDocuments || {}
  };
}

export function filterGalleryPhotoIndexItems(items) {
  return (Array.isArray(items) ? items : []).filter(item => !isGalleryContentPosterRow(item));
}

export async function fetchPhotoIndexPage({ calendarId, projectId, page = 1, decodeDocument, force = false }) {
  const safePage = Math.max(1, Number(page) || 1);
  const key = cacheId(calendarId, safePage);
  const cached = pageCache.get(key);
  if (!force && cached && Date.now() - cached.savedAt < 2 * 60 * 1000) return cached.items;
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/calendars/cal_${calendarId}:runQuery`;
  const rows = await fetchJsonWithRetry(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      structuredQuery: {
        from: [{ collectionId: 'photoIndex' }],
        orderBy: [
          { field: { fieldPath: 'timestamp' }, direction: 'DESCENDING' },
          { field: { fieldPath: '__name__' }, direction: 'DESCENDING' }
        ],
        offset: (safePage - 1) * PAGE_SIZE,
        limit: PAGE_SIZE
      }
    })
  });
  const items = filterGalleryPhotoIndexItems((Array.isArray(rows) ? rows : []).filter(row => row?.document).map(row => {
    const data = decodeDocument(row.document) || {};
    return {
      ...data,
      full: data.full || data.imageUrl || data.thumb || data.thumbUrl || '',
      thumb: data.thumb || data.thumbUrl || data.full || data.imageUrl || '',
      mediaKey: data.assetKey || row.document.name.split('/').pop(),
      refKey: data.assetKey || row.document.name.split('/').pop(),
      indexBacked: true
    };
  }));
  pageCache.set(key, { savedAt: Date.now(), items });
  return items;
}

export function invalidatePhotoIndexCache(calendarId) {
  for (const key of pageCache.keys()) if (key.startsWith(`${calendarId}:`)) pageCache.delete(key);
}

// Client cannot write photoIndex (Firestore rules: write false). Tag saves land on messages/memos
// and Cloud Functions eventually denormalize tags onto photoIndex. Until that catches up — or when
// a force reload races the trigger — gallery lightbox meta would reopen with empty tags even though
// the message write + toast already succeeded. Keep a session sticky overlay keyed by asset /
// message identity so local verified saves survive reload and gallery remount within the tab.
const stickyPhotoTagsByCalendar = new Map();

// Tag token order / # prefixes vary between lightbox normalize, message writes, and CF denorm.
// Compare as a sorted set so sticky clears only when the index actually caught up.
export function normalizePhotoIndexTagSet(value) {
  return Array.from(new Set(
    String(value || '').split(/[,\s#]+/).map(token => token.trim()).filter(Boolean)
  )).sort().join(' ');
}

function photoIndexTagIdentityKeys(photo = {}) {
  const keys = [];
  const asset = String(photo.assetKey || photo.mediaKey || photo.refKey || '').trim();
  if (asset) keys.push(`asset:${asset}`);
  const messageId = String(photo.messageId || '').trim();
  if (messageId) {
    const imageIndex = Number.isFinite(Number(photo.imageIndex)) ? Number(photo.imageIndex) : 0;
    keys.push(`msg:${messageId}:${imageIndex}`);
  }
  return keys;
}

export function rememberPhotoIndexTags(calendarId, photos) {
  if (!calendarId || !Array.isArray(photos) || photos.length === 0) return;
  let sticky = stickyPhotoTagsByCalendar.get(calendarId);
  if (!sticky) {
    sticky = new Map();
    stickyPhotoTagsByCalendar.set(calendarId, sticky);
  }
  photos.forEach(photo => {
    const tags = String(photo?.tags || '');
    photoIndexTagIdentityKeys(photo).forEach(key => {
      if (tags) sticky.set(key, tags);
      else sticky.delete(key);
    });
  });
}

export function peekStickyPhotoIndexTags(calendarId, photo = {}) {
  const sticky = stickyPhotoTagsByCalendar.get(calendarId);
  if (!sticky || sticky.size === 0) return '';
  for (const key of photoIndexTagIdentityKeys(photo)) {
    if (sticky.has(key)) return String(sticky.get(key) || '');
  }
  return '';
}

// After a verified message/memo tag write, poll force-reload until sticky clears (CF denorm
// caught up) or attempts are exhausted. Sticky overlay covers reopen during the wait.
export function schedulePhotoIndexTagReload(galleryPhotoIndex, calendarId, stickyProbe, options = {}) {
  if (!galleryPhotoIndex || galleryPhotoIndex.status !== 'ready') return;
  if (typeof galleryPhotoIndex.loadPage !== 'function' || !calendarId) return;
  const page = Math.max(1, Number(options.page || galleryPhotoIndex.page || 1) || 1);
  const initialDelayMs = Number.isFinite(Number(options.initialDelayMs)) ? Number(options.initialDelayMs) : 1800;
  const retryDelayMs = Number.isFinite(Number(options.retryDelayMs)) ? Number(options.retryDelayMs) : 1200;
  const maxAttempts = Math.max(1, Number(options.maxAttempts) || 5);
  let attempts = 0;
  const poll = () => {
    attempts += 1;
    void Promise.resolve(galleryPhotoIndex.loadPage(page, { force: true })).finally(() => {
      if (attempts >= maxAttempts) return;
      if (!peekStickyPhotoIndexTags(calendarId, stickyProbe)) return;
      window.setTimeout(poll, retryDelayMs);
    });
  };
  window.setTimeout(poll, initialDelayMs);
}



export function photoIndexTagTokenSet(value) {
  const normalized = normalizePhotoIndexTagSet(value);
  return normalized ? new Set(normalized.split(' ')) : new Set();
}

// Prefer the richer verified tag set. Partial CF denorm (e.g. only #260908) must not beat a
// fuller previous patch / message save; intentional deletes rely on sticky until CF catches up.
export function preferRicherPhotoIndexTags(previousTags, nextTags) {
  const prev = String(previousTags || '');
  const next = String(nextTags || '');
  if (!next) return prev;
  if (!prev) return next;
  if (normalizePhotoIndexTagSet(prev) === normalizePhotoIndexTagSet(next)) return next;
  const prevSet = photoIndexTagTokenSet(prev);
  const nextSet = photoIndexTagTokenSet(next);
  const nextSubsetOfPrev = nextSet.size < prevSet.size && [...nextSet].every(token => prevSet.has(token));
  if (nextSubsetOfPrev) return prev;
  return next;
}

function applyStickyPhotoIndexTags(calendarId, items, options = {}) {
  const list = Array.isArray(items) ? items : [];
  const sticky = stickyPhotoTagsByCalendar.get(calendarId);
  if (!sticky || sticky.size === 0) return list;
  const clearOnMatch = options.clearOnMatch !== false;
  return list.map(photo => {
    const keys = photoIndexTagIdentityKeys(photo);
    let stickyTags = '';
    for (const key of keys) {
      if (sticky.has(key)) {
        stickyTags = sticky.get(key);
        break;
      }
    }
    if (!stickyTags) return photo;
    const serverTags = String(photo?.tags || '');
    // Only clear sticky against RAW photoIndex/CF tags. Clearing after merge backfilled an empty
    // CF row from a fuller previous patch made the next partial denorm stick permanently.
    if (clearOnMatch && normalizePhotoIndexTagSet(serverTags) === normalizePhotoIndexTagSet(stickyTags)) {
      keys.forEach(key => sticky.delete(key));
      return serverTags ? photo : { ...photo, tags: stickyTags };
    }
    return { ...photo, tags: stickyTags };
  });
}

function mergePhotoIndexTags(previousItems, nextItems) {
  const previous = Array.isArray(previousItems) ? previousItems : [];
  const next = Array.isArray(nextItems) ? nextItems : [];
  if (!previous.length) return next;
  const byKey = new Map();
  previous.forEach(photo => {
    const tags = String(photo?.tags || '');
    if (!tags) return;
    photoIndexTagIdentityKeys(photo).forEach(key => byKey.set(key, tags));
  });
  if (!byKey.size) return next;
  return next.map(photo => {
    let prevTags = '';
    for (const key of photoIndexTagIdentityKeys(photo)) {
      if (byKey.has(key)) {
        prevTags = byKey.get(key);
        break;
      }
    }
    if (!prevTags) return photo;
    const chosen = preferRicherPhotoIndexTags(prevTags, photo?.tags);
    return chosen === String(photo?.tags || '') ? photo : { ...photo, tags: chosen };
  });
}

// Reconcile a force/page fetch with in-memory rows + session sticky.
// Order matters: sticky may clear only when RAW CF tags match; merge then protects against
// partial denorm overwriting a fuller previous patch after sticky was correctly cleared.
export function reconcilePhotoIndexTagItems(calendarId, previousItems, fetchedItems) {
  const fetched = Array.isArray(fetchedItems) ? fetchedItems : [];
  const withStickyFromServer = applyStickyPhotoIndexTags(calendarId, fetched, { clearOnMatch: true });
  return mergePhotoIndexTags(previousItems, withStickyFromServer);
}

export function useGalleryPhotoIndex({ React, calendarId, activeView, projectId, decodeDocument }) {
  const [state, setState] = React.useState({ status: 'idle', items: [], total: 0, page: 1, loading: false, complete: false });
  const loadPage = React.useCallback(async (page = 1, options = {}) => {
    if (!calendarId) return false;
    const requestedPage = Math.max(1, Number(page) || 1);
    setState(previous => ({ ...previous, loading: true }));
    try {
      if (options.force) invalidatePhotoIndexCache(calendarId);
      const [items, total] = await Promise.all([
        fetchPhotoIndexPage({ calendarId, projectId, page: requestedPage, decodeDocument, force: Boolean(options.force) }),
        fetchPhotoIndexCount({ calendarId, projectId })
      ]);
      setState(previous => {
        const merged = reconcilePhotoIndexTagItems(calendarId, previous.items, items);
        return {
          status: total > 0 ? 'ready' : 'fallback',
          items: merged,
          total: Math.max(0, Number(total) || 0),
          page: requestedPage,
          loading: false,
          complete: false
        };
      });
      return total > 0;
    } catch (error) {
      console.warn('photo index page load failed:', error);
      setState(previous => ({ ...previous, status: 'fallback', loading: false }));
      return false;
    }
  }, [calendarId, projectId, decodeDocument]);
  const loadAll = React.useCallback(async () => {
    if (!calendarId) return false;
    setState(previous => ({ ...previous, loading: true }));
    try {
      const total = await fetchPhotoIndexCount({ calendarId, projectId });
      if (total <= 0) {
        setState({ status: 'fallback', items: [], total: 0, page: 1, loading: false, complete: false });
        return false;
      }
      const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
      // Full hydration is reserved for an explicit search or month view. Fetch in small waves so
      // a slow mobile connection is not hit with every Firestore request at once.
      const pages = [];
      for (let start = 1; start <= pageCount; start += 3) {
        const wave = [];
        for (let page = start; page < Math.min(start + 3, pageCount + 1); page += 1) {
          wave.push(fetchPhotoIndexPage({ calendarId, projectId, page, decodeDocument }));
        }
        pages.push(...await Promise.all(wave));
      }
      setState(previous => ({
        status: 'ready',
        items: reconcilePhotoIndexTagItems(
          calendarId,
          previous.items,
          filterGalleryPhotoIndexItems(pages.flat())
        ),
        total,
        page: previous.page || 1,
        loading: false,
        complete: true
      }));
      return true;
    } catch (error) {
      console.warn('complete photo index load failed:', error);
      setState(previous => ({ ...previous, loading: false }));
      return false;
    }
  }, [calendarId, projectId, decodeDocument]);
  const patchItems = React.useCallback(updater => {
    setState(previous => {
      const current = Array.isArray(previous.items) ? previous.items : [];
      const nextItems = typeof updater === 'function' ? updater(current) : current;
      const items = Array.isArray(nextItems) ? nextItems : current;
      // Persist verified local tag edits across the force-reload that used to wipe them.
      const changed = [];
      const prevByKey = new Map();
      current.forEach(photo => photoIndexTagIdentityKeys(photo).forEach(key => prevByKey.set(key, String(photo?.tags || ''))));
      items.forEach(photo => {
        const tags = String(photo?.tags || '');
        const keys = photoIndexTagIdentityKeys(photo);
        if (!keys.length) return;
        const prevTags = keys.map(key => prevByKey.get(key)).find(value => value != null) || '';
        if (tags !== prevTags) changed.push(photo);
      });
      if (changed.length) rememberPhotoIndexTags(calendarId, changed);
      return { ...previous, items };
    });
  }, [calendarId]);
  React.useEffect(() => {
    if (!calendarId || activeView !== 'gallery') {
      setState({ status: 'idle', items: [], total: 0, page: 1, loading: false, complete: false });
      return undefined;
    }
    void loadPage(1);
    return undefined;
  }, [calendarId, activeView, loadPage]);
  return { ...state, loadPage, loadAll, patchItems };
}

export { PAGE_SIZE as PHOTO_INDEX_PAGE_SIZE };
