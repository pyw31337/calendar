/**
 * Immutable identity for one user photo.
 *
 * Comments and tags attach to `asset:v1:<hash>`, never to a message slot or array
 * index. The hash is the normalized original URL (Firebase download tokens are
 * stripped). It must stay byte-for-byte identical to functions/index.js
 * getPhotoAssetKey — do not "improve" the mixer.
 *
 * This module is pure ESM: no `window`, no DOM. gallery-data.js may import it.
 * Paint resolution lives in gallery-thumb.js (`resolvePhotoAsset`) so every screen
 * asks the same pair (thumb, then original) for pixels.
 */

export function normalizePhotoAssetUrl(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  if (raw.startsWith('data:') || raw.startsWith('blob:')) return raw;
  try {
    const parsed = new URL(raw, typeof window !== 'undefined' ? window.location?.href : undefined);
    parsed.hash = '';
    if (parsed.hostname === 'firebasestorage.googleapis.com' || parsed.hostname.endsWith('.firebasestorage.app')) {
      parsed.search = '';
    }
    return parsed.toString();
  } catch (_) {
    return raw.split('#')[0];
  }
}

export function hashPhotoAssetIdentity(value) {
  const source = String(value || '');
  let fnv = 2166136261;
  let djb = 5381;
  for (let i = 0; i < source.length; i++) {
    const code = source.charCodeAt(i);
    fnv ^= code;
    fnv = Math.imul(fnv, 16777619);
    djb = Math.imul(djb, 33) ^ code;
  }
  return `${(fnv >>> 0).toString(36)}-${(djb >>> 0).toString(36)}-${source.length.toString(36)}`;
}

/** One key per photo. Prefers the original URL, then the thumb if that is all we have. */
export function canonicalPhotoAssetKey(photo = {}) {
  const url = normalizePhotoAssetUrl(
    photo?.full || photo?.imageUrl || photo?.url || photo?.src || photo?.thumb || photo?.thumbUrl || ''
  );
  return url ? `asset:v1:${hashPhotoAssetIdentity(url)}` : '';
}
