/**
 * Which image file a surface should request.
 *
 * Chat uploads keep three objects: original, 512px chat thumb, 160px small thumb.
 * Calendar, gallery, memo, and meeting uploads keep two: original + small thumb.
 * Chat vs other is uploadSource / message channel, never the URL host.
 * Grids may derive the small object from a Storage original path so a new
 * Firestore field is not required for the request.
 */

export const CHAT_THUMB_MAX_EDGE = 512;
export const CHAT_THUMB_QUALITY = 0.8;
export const SMALL_THUMB_MAX_EDGE = 160;
export const SMALL_THUMB_QUALITY = 0.8;

const NON_CHAT_UPLOAD_SOURCES = new Set([
  'calendar',
  'gallery',
  'memo',
  'meeting',
  'anniversary',
]);

function clean(value) {
  return typeof value === 'string' ? value.trim() : '';
}

export function isChatImageUpload({ uploadSource, channel } = {}) {
  const source = clean(uploadSource).toLowerCase();
  const messageChannel = clean(channel).toLowerCase();
  if (NON_CHAT_UPLOAD_SOURCES.has(source)) return false;
  if (source === 'meme') return false;
  if (source === 'chat') return true;
  // Messages written before uploadSource existed are chat. Anything else without
  // an explicit source is not guessed into the 3-file set.
  if (!source && (messageChannel === 'message' || messageChannel === 'messages' || messageChannel === 'chat')) {
    return true;
  }
  return false;
}

export function storagePathFromDownloadUrl(url) {
  const raw = clean(url);
  if (!raw || raw.startsWith('data:') || raw.startsWith('blob:')) return '';
  try {
    const parsed = new URL(raw);
    const match = parsed.pathname.match(/\/o\/(.+)$/);
    if (!match) return '';
    return decodeURIComponent(match[1]);
  } catch (_) {
    return '';
  }
}

export function isThumbObjectPath(path) {
  return /_thumb_[^/]+$/i.test(String(path || ''));
}

export function isOriginalObjectPath(path) {
  return /_original_[^/]+$/i.test(String(path || ''));
}

export function isSmallThumbPath(path) {
  return /_small(?:_\d+b)?\.webp$/i.test(String(path || ''));
}

export function siblingSmallStoragePath(originalPath) {
  const path = String(originalPath || '');
  if (!path) return '';
  if (isSmallThumbPath(path)) return path;
  if (isThumbObjectPath(path)) return '';
  if (/_original_[^/]+$/i.test(path)) return path.replace(/_original_[^/]+$/i, '_small.webp');
  if (/^(?:chatImages|memoImages|anniversaryImages)\//.test(path)) {
    return path.replace(/\.[^./]+$/, '') + '_small.webp';
  }
  return '';
}

export function derivedSmallThumbUrl(originalUrl) {
  const raw = clean(originalUrl);
  if (!/^https?:\/\//i.test(raw)) return '';
  let parsed;
  try {
    parsed = new URL(raw);
  } catch (_) {
    return '';
  }
  const host = parsed.hostname.toLowerCase();
  if (host !== 'firebasestorage.googleapis.com' && !host.endsWith('.firebasestorage.app')) return '';
  const originalPath = storagePathFromDownloadUrl(raw);
  if (!originalPath) return '';
  if (isSmallThumbPath(originalPath)) return raw;
  const smallPath = siblingSmallStoragePath(originalPath);
  if (!smallPath || smallPath === originalPath) return '';
  const bucket = parsed.pathname.split('/')[3];
  if (!bucket) return '';
  return `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodeURIComponent(smallPath)}?alt=media`;
}

function explicitSmallUrl(chatThumb, smallThumb) {
  const stored = clean(smallThumb);
  if (stored) return stored;
  const mid = clean(chatThumb);
  if (mid && isSmallThumbPath(storagePathFromDownloadUrl(mid))) return mid;
  return '';
}

/**
 * @param {'grid'|'chat'|'chat-bubble'|'lightbox'} surface
 */
export function selectImageVariant({
  surface = 'grid',
  uploadSource,
  channel,
  original = '',
  chatThumb = '',
  smallThumb = '',
} = {}) {
  const chat = isChatImageUpload({ uploadSource, channel });
  const full = clean(original);
  const mid = clean(chatThumb);
  const midIsSmall = Boolean(mid) && isSmallThumbPath(storagePathFromDownloadUrl(mid));
  const small = explicitSmallUrl(mid, smallThumb) || derivedSmallThumbUrl(full);
  if (surface === 'lightbox') return full || mid || small || '';
  if (surface === 'chat' || surface === 'chat-bubble') {
    if (chat) return (mid && !midIsSmall ? mid : '') || small || full || '';
    return small || full || mid || '';
  }
  return small || mid || full || '';
}

export function imageUploadVariantPlan(profile) {
  if (profile === 'grid') {
    return { profile: 'grid', files: ['original', 'small'], keepChatThumb: false };
  }
  return { profile: 'chat', files: ['original', 'chatThumb', 'small'], keepChatThumb: true };
}

export function shouldCreateSmallThumb({ smallObjectExists = false } = {}) {
  return !smallObjectExists;
}

/**
 * A 512 thumb may be removed only after the small object exists and nothing
 * still points at the 512 object. Original bytes are never a delete candidate,
 * including a Sep 29 in-place WebP whose object name is still .jpg.
 */
export function canDeleteSupersededThumb({
  chat = false,
  thumbPath = '',
  originalPaths = [],
  smallExists = false,
  refsPointAtSmall = false,
  thumbStillReferenced = false,
  thumbIsOriginalBytes = false,
} = {}) {
  if (chat) return false;
  if (!smallExists || !refsPointAtSmall || thumbStillReferenced) return false;
  if (!isThumbObjectPath(thumbPath)) return false;
  if ((originalPaths || []).includes(thumbPath)) return false;
  if (thumbIsOriginalBytes) return false;
  if (isOriginalObjectPath(thumbPath)) return false;
  return true;
}

export function variantMigrationPlan({
  chat = false,
  smallObjectExists = false,
  thumbPath = '',
  smallPath = '',
  originalPaths = [],
  thumbIsOriginalBytes = false,
  refsPointAtSmall = false,
  thumbStillReferenced = true,
} = {}) {
  const createSmall = shouldCreateSmallThumb({ smallObjectExists });
  const retargetThumb = !chat
    && !createSmall
    && isThumbObjectPath(thumbPath)
    && Boolean(smallPath)
    && thumbPath !== smallPath
    && !refsPointAtSmall;
  const deleteThumb = canDeleteSupersededThumb({
    chat,
    thumbPath,
    originalPaths,
    smallExists: !createSmall && Boolean(smallPath),
    refsPointAtSmall,
    thumbStillReferenced,
    thumbIsOriginalBytes,
  });
  return {
    profile: chat ? 'chat' : 'grid',
    createSmall,
    retargetThumb,
    deleteThumb,
    skip: !createSmall && !retargetThumb && !deleteThumb,
  };
}
