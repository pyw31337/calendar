// One gallery item belongs to exactly one tab. Mime and extension decide
// photo vs file; a bare Firebase Storage host is not a photo. Webpage URLs
// are links. Callers for 사진 / 파일 / 링크 / AI 분석 must use this function
// instead of stacking isExternalServiceUrl and isStoredGalleryMediaUrl.

const IMAGE_EXTS = new Set([
  'jpg', 'jpeg', 'png', 'webp', 'gif', 'heic', 'heif', 'bmp', 'avif',
  'jfif', 'pjpeg', 'pjp', 'ico', 'svg'
]);

const FILE_EXTS = new Set([
  'pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'txt', 'csv', 'rtf',
  'hwp', 'hwpx', 'odt', 'ods', 'odp', 'md', 'tsv', 'json', 'log'
]);

function cleanExt(value) {
  const text = String(value || '').trim().toLowerCase().replace(/^\./, '');
  if (!text || text.length > 8 || /[^a-z0-9]/.test(text)) return '';
  return text;
}

export function galleryPathExtension(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  let path = raw;
  try {
    if (/^[a-z][a-z0-9+.-]*:/i.test(raw)) {
      path = decodeURIComponent(new URL(raw).pathname || '');
    }
  } catch (_) {
    path = raw.split(/[?#]/)[0];
  }
  const base = path.split(/[\\/]/).pop() || '';
  const clean = base.split('?')[0].split('#')[0];
  const dot = clean.lastIndexOf('.');
  if (dot < 0 || dot === clean.length - 1) return '';
  return cleanExt(clean.slice(dot + 1));
}

function kindFromExt(ext) {
  if (FILE_EXTS.has(ext)) return 'file';
  if (IMAGE_EXTS.has(ext)) return 'photo';
  return '';
}

function kindFromMime(mime) {
  const value = String(mime || '').trim().toLowerCase();
  if (!value) return '';
  if (value.startsWith('image/')) return 'photo';
  if (
    value === 'application/pdf'
    || value === 'application/msword'
    || value === 'application/rtf'
    || value === 'text/rtf'
    || value === 'application/csv'
    || value === 'application/vnd.ms-office'
    || value.startsWith('application/vnd.')
    || value.startsWith('text/')
  ) return 'file';
  return '';
}

function isStorageHost(hostname) {
  const host = String(hostname || '').toLowerCase();
  return host === 'firebasestorage.googleapis.com'
    || host.endsWith('.firebasestorage.app')
    || host === 'storage.googleapis.com';
}

export function canonicalGalleryStoragePath(item) {
  const explicit = String(item?.storagePath || '').trim().replace(/^\/+/, '');
  if (explicit) return explicit;
  const candidates = [item?.url, item?.full, item?.imageUrl, item?.thumb, item?.thumbUrl];
  for (const candidate of candidates) {
    const raw = String(candidate || '').trim();
    if (!raw) continue;
    try {
      const url = new URL(raw);
      if (!isStorageHost(url.hostname)) continue;
      const marker = '/o/';
      const index = url.pathname.indexOf(marker);
      const encoded = index >= 0 ? url.pathname.slice(index + marker.length) : url.pathname.replace(/^\/+/, '');
      const path = decodeURIComponent(encoded).replace(/^\/+/, '');
      if (path) return path;
    } catch (_) {}
  }
  return '';
}

function extensionSignals(item) {
  const declared = cleanExt(item?.ext);
  const declaredKind = kindFromExt(declared);
  if (declaredKind === 'file') return 'file';
  let photo = declaredKind === 'photo';
  const fields = [item?.name, item?.storagePath, item?.full, item?.url, item?.imageUrl, item?.thumb, item?.thumbUrl];
  for (const field of fields) {
    const kind = kindFromExt(galleryPathExtension(field));
    if (kind === 'file') return 'file';
    if (kind === 'photo') photo = true;
  }
  return photo ? 'photo' : '';
}

function isWebPageUrl(value) {
  const raw = String(value || '').trim();
  if (!/^https?:\/\//i.test(raw)) return false;
  if (kindFromExt(galleryPathExtension(raw))) return false;
  try {
    return !isStorageHost(new URL(raw).hostname);
  } catch (_) {
    return false;
  }
}

/**
 * @returns {'photo'|'file'|'link'|'other'}
 */
export function classifyGalleryItem(item) {
  if (!item || typeof item !== 'object') return 'other';

  const mimeKind = kindFromMime(item.mime || item.contentType);
  if (mimeKind === 'file') return 'file';

  const extKind = extensionSignals(item);
  if (extKind === 'file') return 'file';

  // A chat/memo row whose directMediaUrl is a normal webpage is a link even
  // when its preview thumb is a stored image. An image directMediaUrl is not.
  const direct = String(item.directMediaUrl || '').trim();
  if (direct && isWebPageUrl(direct)) return 'link';

  if (mimeKind === 'photo' || extKind === 'photo') return 'photo';

  const source = String(item.uploadSource || item.source || '').trim().toLowerCase();
  if (source === 'file' || source === 'document') return 'file';

  const primary = String(item.url || item.full || item.imageUrl || item.thumb || '').trim();
  if (/^data:image\//i.test(primary)) return 'photo';
  if (/^blob:/i.test(primary) && source !== 'link') return 'photo';
  if (isWebPageUrl(primary) || source === 'link') return 'link';

  // Storage objects with no mime and no extension are not assumed to be photos.
  if (primary && canonicalGalleryStoragePath(item)) return 'other';
  return 'other';
}

// Same stored object is often attached twice: once on a chat message and again
// on a memo, or on two messages that reused the shared-file Storage path.
// Message id is a different owner, not a different file. Name+size is only the
// fallback when the path itself was not stored.
export function galleryFileIdentityKey(item) {
  const path = canonicalGalleryStoragePath(item);
  if (path) return `storage:${path}`;
  const name = String(item?.name || '').trim().toLowerCase();
  const size = Number(item?.size);
  if (name && Number.isFinite(size) && size >= 0) return `name:${name}:${Math.round(size)}`;
  const messageId = String(item?.messageId || item?.memoId || '').trim();
  const id = String(item?.id || '').trim();
  if (messageId && id) return `message:${messageId}:${id}`;
  const url = String(item?.url || item?.full || '').trim();
  return url ? `url:${url}` : '';
}

export function dedupeGalleryFiles(items) {
  const seen = new Set();
  const out = [];
  (Array.isArray(items) ? items : []).forEach(item => {
    if (!item) return;
    const key = galleryFileIdentityKey(item);
    if (key && seen.has(key)) return;
    if (key) seen.add(key);
    out.push(item);
  });
  return out;
}

export function galleryFileViewModel(item) {
  const url = String(item?.url || item?.full || item?.imageUrl || item?.thumb || '').trim();
  const storagePath = canonicalGalleryStoragePath(item);
  const ext = cleanExt(item?.ext) || galleryPathExtension(item?.name) || galleryPathExtension(storagePath) || galleryPathExtension(url);
  const nameFromPath = (storagePath || url).split(/[\\/]/).pop() || '';
  const name = String(item?.name || '').trim() || decodeURIComponentSafe(nameFromPath.split('?')[0]) || `file.${ext || 'bin'}`;
  const timestamp = Number(item?.timestamp || item?.uploadedAt) || 0;
  return {
    id: String(item?.id || item?.assetKey || item?.messageId || storagePath || url || name),
    name,
    mime: String(item?.mime || item?.contentType || (ext === 'pdf' ? 'application/pdf' : '')),
    size: Number.isFinite(Number(item?.size)) ? Number(item.size) : 0,
    url,
    storagePath,
    uploadedAt: Number(item?.uploadedAt) || timestamp || Date.now(),
    ext,
    timestamp,
    messageId: String(item?.messageId || ''),
    source: item?.source || 'gallery',
    uploadSource: item?.uploadSource || item?.source || 'gallery',
    ...(item?.tags ? { tags: String(item.tags) } : {})
  };
}

function decodeURIComponentSafe(value) {
  try { return decodeURIComponent(String(value || '')); } catch (_) { return String(value || ''); }
}
