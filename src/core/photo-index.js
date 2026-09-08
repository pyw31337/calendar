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

export async function fetchPhotoIndexCount({ calendarId, projectId }) {
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/calendars/cal_${calendarId}:runAggregationQuery`;
  const rows = await fetchJsonWithRetry(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      structuredAggregationQuery: {
        structuredQuery: { from: [{ collectionId: 'photoIndex' }] },
        aggregations: [{ alias: 'total', count: {} }]
      }
    })
  });
  const value = rows?.[0]?.result?.aggregateFields?.total?.integerValue;
  return Number.isFinite(Number(value)) ? Number(value) : 0;
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
  const items = (Array.isArray(rows) ? rows : []).filter(row => row?.document).map(row => {
    const data = decodeDocument(row.document) || {};
    return {
      ...data,
      full: data.full || data.imageUrl || data.thumb || data.thumbUrl || '',
      thumb: data.thumb || data.thumbUrl || data.full || data.imageUrl || '',
      mediaKey: data.assetKey || row.document.name.split('/').pop(),
      refKey: data.assetKey || row.document.name.split('/').pop(),
      indexBacked: true
    };
  });
  pageCache.set(key, { savedAt: Date.now(), items });
  return items;
}

export function invalidatePhotoIndexCache(calendarId) {
  for (const key of pageCache.keys()) if (key.startsWith(`${calendarId}:`)) pageCache.delete(key);
}

export function useGalleryPhotoIndex({ React, calendarId, activeView, projectId, decodeDocument }) {
  const [state, setState] = React.useState({ status: 'idle', items: [], total: 0, page: 1, loading: false });
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
      setState({ status: total > 0 ? 'ready' : 'fallback', items: Array.isArray(items) ? items : [], total: Math.max(0, Number(total) || 0), page: requestedPage, loading: false });
      return total > 0;
    } catch (error) {
      console.warn('photo index page load failed:', error);
      setState(previous => ({ ...previous, status: 'fallback', loading: false }));
      return false;
    }
  }, [calendarId, projectId, decodeDocument]);
  React.useEffect(() => {
    if (!calendarId || activeView !== 'gallery') {
      setState({ status: 'idle', items: [], total: 0, page: 1, loading: false });
      return undefined;
    }
    void loadPage(1);
    return undefined;
  }, [calendarId, activeView, loadPage]);
  return { ...state, loadPage };
}

export { PAGE_SIZE as PHOTO_INDEX_PAGE_SIZE };
