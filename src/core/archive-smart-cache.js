/**
 * Archive Smart Cache & Fast Grouping Helper
 *
 * Caches heavy archive (보관함: 추억, 인물, 장소) computations in memory
 * and localStorage with a 6-hour TTL, providing instant (0ms) loads and
 * background synchronization without blocking the main UI thread.
 */

export const ARCHIVE_CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours
const ARCHIVE_CACHE_PREFIX = 'gather_archive_cache_';

// In-memory cache for fast inter-tab navigation during the same session
const memoryCache = new Map();

export function getArchiveStorageKey(calendarId) {
  return `${ARCHIVE_CACHE_PREFIX}${String(calendarId || 'default').trim()}`;
}

/**
 * Reads cached archive computation from memory or localStorage if within 6 hours.
 */
export function getPersistedArchiveCache(calendarId) {
  if (!calendarId) return null;
  const mem = memoryCache.get(calendarId);
  const now = Date.now();
  if (mem && (now - mem.savedAt < ARCHIVE_CACHE_TTL_MS)) {
    return mem.data;
  }
  if (typeof window === 'undefined' || !window.localStorage) return null;
  try {
    const raw = window.localStorage.getItem(getArchiveStorageKey(calendarId));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    if (now - Number(parsed.savedAt || 0) > ARCHIVE_CACHE_TTL_MS) {
      window.localStorage.removeItem(getArchiveStorageKey(calendarId));
      return null;
    }
    memoryCache.set(calendarId, { savedAt: parsed.savedAt, data: parsed.data });
    return parsed.data;
  } catch (err) {
    console.warn('Failed to read persisted archive cache:', err);
    return null;
  }
}

/**
 * Saves computed archive results to memory and localStorage (bounded payload).
 */
export function savePersistedArchiveCache(calendarId, data) {
  if (!calendarId || !data) return;
  const now = Date.now();
  const existing = memoryCache.get(calendarId)?.data || {};
  const merged = { ...existing, ...data };
  memoryCache.set(calendarId, { savedAt: now, data: merged });
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    const compactData = {
      savedAt: now,
      data: {
        memoryGroups: Array.isArray(merged.memoryGroups)
          ? merged.memoryGroups.slice(0, 80).map(group => {
            const photos = (Array.isArray(group.photos) ? group.photos.slice(0, 20) : []).map(p => ({
              full: p.full || p.thumb || p.imageUrl || '',
              thumb: p.thumb || p.full || p.thumbUrl || '',
              assetKey: p.assetKey || '',
              timestamp: p.timestamp || 0,
              tags: p.tags || ''
            }));
            return {
              id: group.id,
              title: group.title,
              startDate: group.startDate,
              endDate: group.endDate,
              photoCount: Array.isArray(group.photos) ? group.photos.length : (group.photoCount || 0),
              photos
            };
          })
          : []
      }
    };
    window.localStorage.setItem(getArchiveStorageKey(calendarId), JSON.stringify(compactData));
  } catch (err) {
    // Quota exceeded or private browsing restrictions
    console.warn('Failed to persist archive cache:', err);
  }
}

/**
 * Invalidates archive cache when photos or tags change.
 */
export function clearPersistedArchiveCache(calendarId) {
  if (!calendarId) return;
  memoryCache.delete(calendarId);
  try {
    window.localStorage?.removeItem(getArchiveStorageKey(calendarId));
  } catch (_) { /* ignore */ }
}

/**
 * High-performance memories grouping with exclusions and single-membership assignment.
 */
export function computeArchiveMemoryGroups({
  anniversaries,
  photoEntries,
  entryMatchesDateRange,
  isMemoryPhotoExcluded,
  getPhotoAssetCommentKey,
  assignPhotosToSingleMemory
}) {
  if (!Array.isArray(anniversaries) || !Array.isArray(photoEntries) || !photoEntries.length) return [];
  const validAnniversaries = anniversaries.filter(a => a && (a.startDate || a.date) && !a.hiddenFromMemories);
  if (!validAnniversaries.length) return [];

  const rawGroups = validAnniversaries.map(a => {
    const start = a.startDate || a.date;
    const end = a.endDate || a.startDate || a.date;
    const excluded = new Set(Array.isArray(a.excludedMemoryPhotoKeys) ? a.excludedMemoryPhotoKeys : []);
    const photosInRange = photoEntries.filter(entry => entryMatchesDateRange(entry, start, end, a.id));
    const photos = photosInRange.filter(entry => !isMemoryPhotoExcluded(entry, excluded, getPhotoAssetCommentKey));
    const excludedPhotos = photosInRange.filter(entry => isMemoryPhotoExcluded(entry, excluded, getPhotoAssetCommentKey));
    return { id: a.id, title: a.title || '기록', startDate: start, endDate: end, photos, excludedPhotos };
  });

  return assignPhotosToSingleMemory(rawGroups, getPhotoAssetCommentKey)
    .filter(group => group.photos.length > 0)
    .sort((a, b) => (b.startDate || '').localeCompare(a.startDate || ''));
}
