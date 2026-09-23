/**
 * Single photo render-resolution layer.
 *
 * Identity (asset:v1) lives in photo-asset.js. This module owns pixels: the UI
 * paints the stored thumb+original pair and nothing else (no sibling imageUrls).
 * Callers paint a placeholder when resolution returns `missing`.
 */

import { isMemeKeyboardPhotoEntry } from './gallery-data.js';
import { canonicalPhotoAssetKey } from './photo-asset.js';

const THUMB_FIELD_ORDER = [
  'thumb',
  'thumbnailUrl',
  'thumbUrl',
  'full',
  'url',
  'imageUrl',
  'downloadURL',
  'directMediaUrl',
];

/** Pure URL gate used by resolver + tests (mirrors app-utils isRenderableImageUrl). */
export function isGalleryThumbUrl(value) {
  if (typeof value !== 'string' || !value.trim()) return false;
  const candidate = value.trim();
  if (/^data:image\//i.test(candidate)) {
    const match = candidate.match(/^data:image\/[a-z0-9.+-]+;base64,([a-z0-9+/]*={0,2})$/i);
    if (!match || !match[1] || match[1].length % 4 === 1) return false;
    try {
      if (typeof atob === 'function') atob(match[1]);
      return true;
    } catch (_) {
      return false;
    }
  }
  if (!/^https?:\/\//i.test(candidate)) return false;
  try {
    const parsed = new URL(candidate);
    return Boolean(parsed.protocol && parsed.hostname);
  } catch (_) {
    return false;
  }
}

export function collectGalleryThumbCandidates(item = {}) {
  const seen = new Set();
  const out = [];
  const push = (value) => {
    const url = typeof value === 'string' ? value.trim() : '';
    if (!url || seen.has(url)) return;
    seen.add(url);
    out.push(url);
  };
  for (const key of THUMB_FIELD_ORDER) push(item?.[key]);
  if (Array.isArray(item?.thumbUrls)) item.thumbUrls.forEach(push);
  if (Array.isArray(item?.imageUrls)) item.imageUrls.forEach(push);
  return out;
}

/**
 * @returns {{ state: 'loading'|'ready'|'missing', src: string, fallbackSrc: string, candidates: string[] }}
 */
export function resolveGalleryThumbUrl(item, options = {}) {
  const {
    isRenderable = isGalleryThumbUrl,
    isBroken = () => false,
    loading = false,
  } = options;

  if (loading) {
    return { state: 'loading', src: '', fallbackSrc: '', candidates: [] };
  }
  if (!item) {
    return { state: 'missing', src: '', fallbackSrc: '', candidates: [] };
  }

  const candidates = collectGalleryThumbCandidates(item)
    .filter((url) => isRenderable(url) && !isBroken(url));

  if (!candidates.length) {
    return { state: 'missing', src: '', fallbackSrc: '', candidates: [] };
  }

  const src = candidates[0];
  const fallbackSrc = candidates.find((url) => url !== src) || '';
  return { state: 'ready', src, fallbackSrc, candidates };
}

function firstPhotoString(...values) {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return '';
}

/** The stored pair only. Sibling imageUrls/thumbUrls belong to other photos. */
export function projectPhotoAssetPair(item = {}) {
  return {
    thumb: firstPhotoString(item.thumb, item.thumbnailUrl, item.thumbUrl),
    full: firstPhotoString(item.full, item.imageUrl, item.url, item.downloadURL, item.src, item.directMediaUrl),
  };
}

/**
 * One photo, one key, one pair.
 * displaySrc is the first ready candidate (thumb preferred). fallbackSrc is the
 * other URL in the pair. assetKey matches getPhotoAssetCommentKey / the server index.
 */
export function resolvePhotoAsset(item, options = {}) {
  const pair = projectPhotoAssetPair(item || {});
  const display = resolveGalleryThumbUrl({ thumb: pair.thumb, full: pair.full }, options);
  const full = pair.full || pair.thumb;
  const thumb = pair.thumb || pair.full;
  return {
    assetKey: canonicalPhotoAssetKey({ full, thumb, imageUrl: pair.full }),
    full,
    thumb,
    displaySrc: display.src,
    fallbackSrc: display.fallbackSrc,
    state: display.state,
    tags: typeof item?.tags === 'string' ? item.tags : '',
    candidates: display.candidates,
  };
}

function photoTimeMs(photo) {
  const raw = photo?.timestamp ?? photo?.createdAt ?? photo?.updatedAt
    ?? photo?.uploadedAt ?? photo?.messageTimestamp;
  if (raw == null || raw === '') return 0;
  if (typeof raw === 'number' && Number.isFinite(raw)) {
    return raw < 1e12 ? raw * 1000 : raw;
  }
  if (typeof raw === 'string') {
    const asNum = Number(raw);
    if (Number.isFinite(asNum) && asNum > 0) return asNum < 1e12 ? asNum * 1000 : asNum;
    const parsed = Date.parse(raw);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  if (typeof raw?.toMillis === 'function') {
    try { return Number(raw.toMillis()) || 0; } catch (_) { /* ignore */ }
  }
  if (typeof raw?.seconds === 'number') return raw.seconds * 1000;
  return 0;
}

function photoIdentityKey(photo, index = 0) {
  return String(
    photo?.id
    || photo?.mediaKey
    || photo?.refKey
    || photo?.assetKey
    || photo?.full
    || photo?.thumb
    || index
  );
}

/**
 * Pick up to `limit` newest non-meme photos that resolve to a ready thumb.
 * Scans past the first `limit` rows so a 404/meeting-tombstone mid-strip does not
 * leave a permanent grey cell (live cw photoIndex has such rows).
 */
export function selectGalleryPreviewPhotos(items, options = {}) {
  const {
    limit = 9,
    scanLimit = 48,
    isMeme = isMemeKeyboardPhotoEntry,
    isBroken = () => false,
    isRenderable = isGalleryThumbUrl,
  } = options;

  const list = Array.isArray(items) ? items.filter(Boolean) : [];
  const sorted = list.slice().sort((a, b) => {
    const delta = photoTimeMs(b) - photoTimeMs(a);
    if (delta) return delta;
    return photoIdentityKey(b).localeCompare(photoIdentityKey(a));
  });

  const picked = [];
  const seen = new Set();
  const scan = Math.max(limit, scanLimit);
  for (let i = 0; i < sorted.length && i < scan && picked.length < limit; i += 1) {
    const photo = sorted[i];
    if (typeof isMeme === 'function' && isMeme(photo)) continue;
    const resolved = resolveGalleryThumbUrl(photo, { isRenderable, isBroken });
    if (resolved.state !== 'ready') continue;
    const key = photoIdentityKey(photo, i);
    if (seen.has(key)) continue;
    seen.add(key);
    picked.push({
      ...photo,
      thumb: resolved.src,
      full: photo.full || resolved.fallbackSrc || resolved.src,
      __thumbResolved: resolved,
    });
  }
  return picked;
}

/**
 * Home-strip readiness for a photoIndex-backed list.
 * - loading: index still idle/loading → skeleton, never empty grey grid
 * - ready: paint resolved thumbs (may be fewer than limit if media is scarce)
 * - empty: index settled with nothing resolvable
 */
export function resolveHomeGalleryStripState({
  items,
  status,
  loading = false,
  limit = 9,
  isBroken = () => false,
} = {}) {
  const busy = loading
    || status === 'idle'
    || status === 'loading'
    || (status == null && !Array.isArray(items));

  if (busy) {
    return { state: 'loading', photos: [], slots: limit };
  }

  const photos = selectGalleryPreviewPhotos(items, { limit, isBroken });
  if (!photos.length) {
    return { state: 'empty', photos: [], slots: 0 };
  }
  return { state: 'ready', photos, slots: photos.length };
}
