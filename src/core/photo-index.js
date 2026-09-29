import {
  clearPhotoIndexPersistentEntries,
  readPhotoIndexPersistentEntry,
  writePhotoIndexPersistentEntry
} from './photo-index-persistent-cache.js';

const PAGE_SIZE = 100;
const pageCache = new Map();
const countCache = new Map();
const countRequests = new Map();
const REQUEST_TIMEOUT_MS = 8000;
const CACHE_TTL_MS = 2 * 60 * 1000;
const SUMMARY_CACHE_TTL_MS = 45 * 1000;
const PHOTO_INDEX_CACHE_KIND_PAGE = 'page';
const PHOTO_INDEX_CACHE_KIND_TOTAL = 'gallery-total';
const summaryCache = new Map();

function cacheId(calendarId, page, revision = '') {
  return `${calendarId}:${normalizeCacheRevision(revision) || 'live'}:${page}`;
}

async function fetchJsonWithRetry(url, init, attempts = 2, { allowNotFound = false } = {}) {
  let lastError = null;
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const controller = typeof AbortController === 'function' ? new AbortController() : null;
    const timer = controller ? setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS) : null;
    try {
      const response = await fetch(url, { ...init, ...(controller ? { signal: controller.signal } : {}) });
      if (allowNotFound && response.status === 404) return null;
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

function readFirestoreNumber(fields, fieldName) {
  const value = fields?.[fieldName];
  const number = value?.integerValue ?? value?.doubleValue;
  return Number.isFinite(Number(number)) ? Number(number) : 0;
}

function photoIndexSummaryUrl(calendarId, projectId) {
  return `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/calendars/cal_${calendarId}/photoIndexMeta/summary`;
}

// A summary revision is written once for each source-document photo mutation by the Cloud
// Function. It is deliberately a tiny point read: it lets a persisted page remain valid for
// weeks without allowing an old gallery snapshot to masquerade as current collaborative data.
export async function fetchPhotoIndexSummary({ calendarId, projectId, force = false } = {}) {
  if (!calendarId || !projectId) return { version: '', updatedAt: 0, exists: false };
  const key = `${projectId}:${calendarId}`;
  const cached = summaryCache.get(key);
  if (!force && cached && Date.now() - cached.savedAt < SUMMARY_CACHE_TTL_MS) return cached.value;
  const document = await fetchJsonWithRetry(
    photoIndexSummaryUrl(calendarId, projectId),
    { method: 'GET', headers: { Accept: 'application/json' } },
    2,
    { allowNotFound: true }
  );
  const value = document
    ? {
        version: String(readFirestoreNumber(document.fields, 'revision') || ''),
        updatedAt: readFirestoreNumber(document.fields, 'updatedAt'),
        exists: true
      }
    : { version: '', updatedAt: 0, exists: false };
  summaryCache.set(key, { savedAt: Date.now(), value });
  return value;
}

function normalizeCacheRevision(value) {
  const revision = String(value || '').trim();
  return revision && revision !== '0' ? revision : '';
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

export async function fetchPhotoIndexCount({ calendarId, projectId, cacheRevision = '' }) {
  const revision = normalizeCacheRevision(cacheRevision);
  const key = `${projectId}:${calendarId}:${revision || 'live'}`;
  const cached = countCache.get(key);
  if (cached && Date.now() - cached.savedAt < CACHE_TTL_MS) return cached.value;
  if (countRequests.has(key)) return countRequests.get(key);
  const request = (async () => {
    // A server-issued revision proves that this cached aggregate matches the canonical index.
    // Use it before hitting two aggregation endpoints (total and content-poster count) again.
    if (revision) {
      const persisted = await readPhotoIndexPersistentEntry({
        calendarId,
        revision,
        kind: PHOTO_INDEX_CACHE_KIND_TOTAL
      });
      if (Number.isFinite(Number(persisted)) && Number(persisted) >= 0) {
        const value = Number(persisted);
        countCache.set(key, { savedAt: Date.now(), value });
        return value;
      }
    }
    // Movie/sports content posters are indexed as source=anniversary; gallery 사진 must omit them.
    const [total, anniversaryTotal] = await Promise.all([
      fetchPhotoIndexAggregationCount({ calendarId, projectId }),
      fetchPhotoIndexAggregationCount({ calendarId, projectId, sourceEquals: 'anniversary' })
    ]);
    const value = Math.max(0, total - anniversaryTotal);
    countCache.set(key, { savedAt: Date.now(), value });
    if (revision) void writePhotoIndexPersistentEntry({
      calendarId,
      revision,
      kind: PHOTO_INDEX_CACHE_KIND_TOTAL,
      value
    });
    return value;
  })();
  countRequests.set(key, request);
  try {
    return await request;
  } finally {
    countRequests.delete(key);
  }
}

// Client-safe read-only verification for gallery totals. Compares the live photoIndex
// aggregation (anniversary posters already subtracted) against an optional expected count
// from a rebuild dry-run / local estimate. Does not write.
export async function verifyGalleryPhotoIndexTotals({
  calendarId,
  projectId,
  expectedGalleryCount = null,
  cacheRevision = ''
} = {}) {
  const indexedGalleryCount = await fetchPhotoIndexCount({ calendarId, projectId, cacheRevision });
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

// Page N+1 continues after the last raw row of page N (Firestore cursor). An `offset` query bills
// every skipped document, so walking a large gallery with offsets costs O(pages^2) reads; the cursor
// keeps each page at PAGE_SIZE reads. A page opened without a known cursor (a direct jump) still
// falls back to offset and then seeds the cursor for the pages after it.
const cursorCache = new Map();

function mapPhotoIndexRow(row, decodeDocument) {
  const data = decodeDocument(row.document) || {};
  return {
    ...data,
    full: data.full || data.imageUrl || data.thumb || data.thumbUrl || '',
    thumb: data.thumb || data.thumbUrl || data.full || data.imageUrl || '',
    mediaKey: data.assetKey || row.document.name.split('/').pop(),
    refKey: data.assetKey || row.document.name.split('/').pop(),
    indexBacked: true
  };
}

function cursorAfterRow(row) {
  const timestamp = row?.document?.fields?.timestamp;
  const name = row?.document?.name;
  return timestamp && name ? [timestamp, { referenceValue: name }] : null;
}

export function buildPhotoIndexPageQuery({ cursor = null, offset = 0, limit = PAGE_SIZE } = {}) {
  const structuredQuery = {
    from: [{ collectionId: 'photoIndex' }],
    orderBy: [
      { field: { fieldPath: 'timestamp' }, direction: 'DESCENDING' },
      { field: { fieldPath: '__name__' }, direction: 'DESCENDING' }
    ],
    limit
  };
  if (cursor) structuredQuery.startAt = { values: cursor, before: false };
  else if (offset > 0) structuredQuery.offset = offset;
  return structuredQuery;
}

async function runPhotoIndexQuery({ calendarId, projectId, structuredQuery }) {
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/calendars/cal_${calendarId}:runQuery`;
  const rows = await fetchJsonWithRetry(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ structuredQuery })
  });
  return (Array.isArray(rows) ? rows : []).filter(row => row?.document);
}

// Store raw rows as consecutive PAGE_SIZE pages starting at firstPage, seeding each next cursor.
function rememberPhotoIndexPages(calendarId, firstPage, rows, decodeDocument, cacheRevision = '') {
  const revision = normalizeCacheRevision(cacheRevision);
  const chunks = [];
  for (let index = 0; index < rows.length; index += PAGE_SIZE) chunks.push(rows.slice(index, index + PAGE_SIZE));
  if (!chunks.length) chunks.push([]);
  return chunks.map((pageRows, offset) => {
    const page = firstPage + offset;
    const items = filterGalleryPhotoIndexItems(pageRows.map(row => mapPhotoIndexRow(row, decodeDocument)));
    pageCache.set(cacheId(calendarId, page, revision), { savedAt: Date.now(), items });
    if (revision) void writePhotoIndexPersistentEntry({
      calendarId,
      revision,
      kind: PHOTO_INDEX_CACHE_KIND_PAGE,
      page,
      value: items
    });
    const next = pageRows.length === PAGE_SIZE ? cursorAfterRow(pageRows[pageRows.length - 1]) : null;
    if (next) cursorCache.set(cacheId(calendarId, page + 1, revision), next);
    return items;
  });
}

export async function fetchPhotoIndexPage({ calendarId, projectId, page = 1, decodeDocument, force = false, cacheRevision = '' }) {
  const safePage = Math.max(1, Number(page) || 1);
  const revision = normalizeCacheRevision(cacheRevision);
  const key = cacheId(calendarId, safePage, revision);
  const cached = pageCache.get(key);
  if (!force && cached && Date.now() - cached.savedAt < CACHE_TTL_MS) return cached.items;
  if (!force && revision) {
    const persisted = await readPhotoIndexPersistentEntry({
      calendarId,
      revision,
      kind: PHOTO_INDEX_CACHE_KIND_PAGE,
      page: safePage
    });
    if (Array.isArray(persisted)) {
      pageCache.set(key, { savedAt: Date.now(), items: persisted });
      return persisted;
    }
  }
  const cursor = safePage > 1 ? cursorCache.get(key) || null : null;
  const rows = await runPhotoIndexQuery({
    calendarId,
    projectId,
    structuredQuery: buildPhotoIndexPageQuery({ cursor, offset: cursor ? 0 : (safePage - 1) * PAGE_SIZE })
  });
  return rememberPhotoIndexPages(calendarId, safePage, rows, decodeDocument, revision)[0];
}

// Every page of the calendar, walked with cursors in chunks of a few pages per request.
export async function fetchAllPhotoIndexPages({ calendarId, projectId, pageCount, decodeDocument, pagesPerRequest = 3, cacheRevision = '' }) {
  const all = [];
  let cursor = null;
  for (let page = 1; page <= pageCount; page += pagesPerRequest) {
    const count = Math.min(pagesPerRequest, pageCount - page + 1);
    const rows = await runPhotoIndexQuery({
      calendarId,
      projectId,
      structuredQuery: buildPhotoIndexPageQuery({ cursor, limit: count * PAGE_SIZE })
    });
    all.push(...rememberPhotoIndexPages(calendarId, page, rows, decodeDocument, cacheRevision));
    if (rows.length < count * PAGE_SIZE) break;
    cursor = cursorAfterRow(rows[rows.length - 1]);
    // Yield between chunks. Large photo libraries otherwise monopolize the main thread while
    // normalizing several hundred Firestore records, which can trigger the browser's "wait or
    // close" dialog even though every individual request is asynchronous.
    if (page + count <= pageCount) await new Promise(resolve => setTimeout(resolve, 0));
  }
  return all;
}

export function invalidatePhotoIndexCache(calendarId) {
  if (!calendarId) return;
  for (const key of pageCache.keys()) if (key.startsWith(`${calendarId}:`)) pageCache.delete(key);
  for (const key of cursorCache.keys()) if (key.startsWith(`${calendarId}:`)) cursorCache.delete(key);
  for (const key of countCache.keys()) if (key.includes(`:${calendarId}:`)) countCache.delete(key);
  for (const key of summaryCache.keys()) if (key.endsWith(`:${calendarId}`)) summaryCache.delete(key);
  // A verified local mutation may reach the index trigger slightly later. Do not reopen a
  // stale persisted page during that window; the next server revision repopulates it safely.
  void clearPhotoIndexPersistentEntries(calendarId);
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

export function countPhotoTagTokens(value) {
  const normalized = normalizePhotoIndexTagSet(value);
  return normalized ? normalized.split(' ').length : 0;
}

// Prefer the fuller durable tag string. Token order / # prefixes differ across message writes,
// meeting album copies, and CF denorm — compare as normalized sets and keep the richer source.
export function pickRicherPhotoTags(...candidates) {
  let best = '';
  let bestCount = -1;
  for (const candidate of candidates) {
    if (candidate == null) continue;
    const text = String(candidate);
    const count = countPhotoTagTokens(text);
    if (count > bestCount) {
      best = text;
      bestCount = count;
    }
  }
  return best;
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
      // Empty is a real, verified user choice (delete every tag), not "no override".
      // Keep it pending until the raw CF index also becomes empty or stale tags can reappear.
      sticky.set(key, tags);
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

export function hasStickyPhotoIndexTags(calendarId, photo = {}) {
  const sticky = stickyPhotoTagsByCalendar.get(calendarId);
  if (!sticky || sticky.size === 0) return false;
  return photoIndexTagIdentityKeys(photo).some(key => sticky.has(key));
}

// Lightbox reopen (save → close → open, no hard refresh): session sticky is the verified
// in-tab write. Stale in-memory message snapshots (e.g. unpatched galleryLiveMessages) can
// still expose empty imageTags[] and must not wipe sticky/index. Intentional clears stay in
// sticky as '' until CF catches up.
//
// `imageTagMap` makes a per-asset tag an explicit source of truth.  Never merge it with a
// "richer" duplicate owner: those can be different photos that happened to share an old URL,
// or an obsolete meeting-album copy.  The richer heuristic remains only for legacy records
// which have no explicit per-image tag state at all.
export function resolveGalleryLightboxTags(calendarId, photo = {}, {
  localTags = null,
  indexTags = '',
  localTagAuthoritative = false
} = {}) {
  if (calendarId && hasStickyPhotoIndexTags(calendarId, photo)) {
    return peekStickyPhotoIndexTags(calendarId, photo);
  }
  // Empty/partial in-memory message.imageTags (common after photoIndex rebuild prefers a
  // message owner whose tags lagged the meeting album copy) must not blank richer index tags.
  const fromLocal = localTags != null ? String(localTags) : null;
  const fromIndex = indexTags != null ? String(indexTags) : '';
  const fromPhoto = String(photo?.tags || '');
  const photoTagsAreAuthoritative = photo?.tagAuthority === 'editable' || photo?.tagAuthoritative === true;
  if (localTagAuthoritative && fromLocal != null) return fromLocal;
  if (photoTagsAreAuthoritative) return fromPhoto;
  if (fromLocal != null) return pickRicherPhotoTags(fromLocal, fromIndex, fromPhoto);
  return pickRicherPhotoTags(fromIndex, fromPhoto);
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
      if (!hasStickyPhotoIndexTags(calendarId, stickyProbe)) return;
      window.setTimeout(poll, retryDelayMs);
    });
  };
  window.setTimeout(poll, initialDelayMs);
}



function applyStickyPhotoIndexTags(calendarId, items, options = {}) {
  const list = Array.isArray(items) ? items : [];
  const sticky = stickyPhotoTagsByCalendar.get(calendarId);
  if (!sticky || sticky.size === 0) return list;
  const clearOnMatch = options.clearOnMatch !== false;
  return list.map(photo => {
    const keys = photoIndexTagIdentityKeys(photo);
    let stickyTags = '';
    let hasSticky = false;
    for (const key of keys) {
      if (sticky.has(key)) {
        stickyTags = sticky.get(key);
        hasSticky = true;
        break;
      }
    }
    if (!hasSticky) return photo;
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

// Reconcile a force/page fetch with in-memory rows + session sticky.
// Raw server rows are authoritative unless a verified local save is still pending.
export function reconcilePhotoIndexTagItems(calendarId, _previousItems, fetchedItems) {
  const fetched = Array.isArray(fetchedItems) ? fetchedItems : [];
  return applyStickyPhotoIndexTags(calendarId, fetched, { clearOnMatch: true });
}

export function useGalleryPhotoIndex({ React, calendarId, activeView, projectId, decodeDocument }) {
  const [state, setState] = React.useState({ status: 'idle', items: [], total: 0, page: 1, loading: false, complete: false });
  const loadPage = React.useCallback(async (page = 1, options = {}) => {
    if (!calendarId) return false;
    const requestedPage = Math.max(1, Number(page) || 1);
    const includeTotal = options.includeTotal !== false;
    setState(previous => ({
      ...previous,
      status: previous.status === 'ready' ? 'ready' : 'loading',
      loading: true
    }));
    try {
      if (options.force) invalidatePhotoIndexCache(calendarId);
      const summary = await fetchPhotoIndexSummary({ calendarId, projectId, force: Boolean(options.force) });
      // A first page is useful immediately; aggregate counts are metadata and used to hold the
      // first visual result behind two extra Firestore queries. Commit the page first, then let
      // the total settle in the background so side-menu navigation can paint without waiting.
      const items = await fetchPhotoIndexPage({
        calendarId, projectId, page: requestedPage, decodeDocument,
        force: Boolean(options.force), cacheRevision: summary.version
      });
      setState(previous => {
        const merged = reconcilePhotoIndexTagItems(calendarId, previous.items, items);
        return {
          // Do not call an empty first filtered page a fallback yet. The count resolves whether
          // the index really has no gallery rows; page one may contain only content posters.
          status: merged.length > 0 ? 'ready' : (includeTotal ? 'loading' : 'ready'),
          items: merged,
          total: Math.max(previous.total || 0, merged.length),
          page: requestedPage,
          loading: includeTotal,
          complete: false
        };
      });
      if (!includeTotal) return items.length > 0;
      const total = await fetchPhotoIndexCount({ calendarId, projectId, cacheRevision: summary.version });
      setState(previous => ({
        ...previous,
        status: total > 0 ? 'ready' : 'fallback',
        total: Math.max(0, Number(total) || 0),
        loading: false
      }));
      return total > 0;
    } catch (error) {
      console.warn('photo index page load failed:', error);
      // A network/read failure is not evidence that this calendar has no canonical index.
      // Keep it distinct from the genuine zero-row fallback so the gallery never presents a
      // handful of locally hydrated photos as the complete result.
      setState(previous => ({ ...previous, status: 'error', loading: false }));
      return false;
    }
  }, [calendarId, projectId, decodeDocument]);
  const loadAll = React.useCallback(async () => {
    if (!calendarId) return false;
    setState(previous => ({ ...previous, loading: true }));
    try {
      const summary = await fetchPhotoIndexSummary({ calendarId, projectId });
      const total = await fetchPhotoIndexCount({ calendarId, projectId, cacheRevision: summary.version });
      if (total <= 0) {
        setState({ status: 'fallback', items: [], total: 0, page: 1, loading: false, complete: false });
        return false;
      }
      const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
      // Full hydration is reserved for an explicit search or month view. It is walked with cursors,
      // three pages per request, so the cost stays at one read per photo.
      const pages = await fetchAllPhotoIndexPages({
        calendarId, projectId, pageCount, decodeDocument, cacheRevision: summary.version
      });
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
    // The V2 calendar home renders a six-photo gallery strip from the same
    // canonical index. Keep the first page warm there as well; otherwise the
    // home summary is permanently empty until the user visits Gallery.
    const shouldLoadPreview = activeView === 'calendar';
    if (!calendarId || (!shouldLoadPreview && activeView !== 'gallery' && activeView !== 'history')) {
      setState({ status: 'idle', items: [], total: 0, page: 1, loading: false, complete: false });
      return undefined;
    }
    // Let the calendar paint first. The home strip is supplementary content, and its preview
    // only needs one page; deferring it avoids competing with the initial calendar/chat data.
    const run = () => {
      // 보관함은 인물·장소·추억 분류를 위해 과거에 여기서 모든 사진을 즉시 내려받았다.
      // 대형 캘린더에서는 수백 장의 이미지 메타를 한 프레임에 그룹화하면서 Long Task가
      // 발생했고, 모바일 브라우저가 "페이지를 닫을까요"를 표시할 정도로 악화됐다.
      // 첫 진입은 다른 사진 화면과 동일하게 최근 한 페이지로 제한한다. 전체 읽기는
      // 갤러리 검색·월별 보기처럼 전체 결과가 필요한 작업에서만 호출한다.
      void loadPage(1, { includeTotal: !shouldLoadPreview });
    };
    const shouldDefer = shouldLoadPreview || activeView === 'history';
    if (!shouldDefer) { run(); return undefined; }
    let cancelled = false;
    const start = () => { if (!cancelled) run(); };
    if (typeof window !== 'undefined' && typeof window.requestIdleCallback === 'function') {
      const idleId = window.requestIdleCallback(start, { timeout: activeView === 'history' ? 650 : 900 });
      return () => { cancelled = true; window.cancelIdleCallback?.(idleId); };
    }
    const timerId = setTimeout(start, activeView === 'history' ? 120 : 350);
    return () => { cancelled = true; clearTimeout(timerId); };
  }, [calendarId, activeView, loadPage, loadAll]);
  return { ...state, loadPage, loadAll, patchItems };
}

export { PAGE_SIZE as PHOTO_INDEX_PAGE_SIZE };
