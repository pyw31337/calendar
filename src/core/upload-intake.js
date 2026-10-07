/* Small, enumerable intake note for an image send. Stored on the message only when a
 * message is actually written. Never includes image bytes. */

const SOURCES = new Set(['clip', 'paste', 'camera', 'share', 'other']);
const CLIENTS = new Set(['ios-safari', 'ios-pwa', 'other']);
// iOS names a picture taken inside the system picker `image.jpg` (also jpeg/png). Library
// picks keep names like IMG_1234.HEIC. That is the only pattern we treat as camera, and only
// when the file came through the paperclip/file input — paste stays paste.
const CAMERA_CAPTURE_NAME = /^image\.(jpe?g|png)$/i;

function clipText(value, max) {
  let out = '';
  for (const ch of String(value || '')) {
    const code = ch.charCodeAt(0);
    if (code === 10 || code === 13) out += ' ';
    else if (code >= 32) out += ch;
  }
  return out.trim().slice(0, max);
}

export function detectUploadClient(userAgent = '', displayMode = '', { maxTouchPoints = 0, standalone = false } = {}) {
  const ua = String(userAgent || '');
  const iosDevice = /iPhone|iPad|iPod/i.test(ua) || (/Macintosh/i.test(ua) && Number(maxTouchPoints) > 1);
  if (!iosDevice) return 'other';
  const mode = String(displayMode || '');
  const installed = standalone === true || mode === 'standalone' || mode === 'fullscreen' || mode === 'minimal-ui';
  if (installed) return 'ios-pwa';
  if (/CriOS|FxiOS|EdgiOS|OPiOS|DuckDuckGo/i.test(ua)) return 'other';
  return 'ios-safari';
}

export function currentUploadClient() {
  if (typeof navigator === 'undefined') return 'other';
  let mode = '';
  try {
    if (typeof window !== 'undefined' && window.matchMedia) {
      if (window.matchMedia('(display-mode: standalone)').matches) mode = 'standalone';
      else if (window.matchMedia('(display-mode: fullscreen)').matches) mode = 'fullscreen';
      else if (window.matchMedia('(display-mode: minimal-ui)').matches) mode = 'minimal-ui';
    }
  } catch (_) {}
  return detectUploadClient(navigator.userAgent || '', mode, {
    maxTouchPoints: navigator.maxTouchPoints || 0,
    standalone: navigator.standalone === true
  });
}

export function classifyIntakeSource(explicitSource, file) {
  const hinted = String(explicitSource || '').toLowerCase();
  if (hinted === 'paste' || hinted === 'share' || hinted === 'camera') return hinted;
  const name = String(file?.name || '');
  if ((hinted === 'clip' || hinted === 'other' || !hinted) && CAMERA_CAPTURE_NAME.test(name)) return 'camera';
  if (hinted === 'clip') return 'clip';
  return 'other';
}

export function markFileIntakeSource(files, source) {
  const hinted = SOURCES.has(source) ? source : 'other';
  Array.from(files || []).forEach(file => {
    if (!file || typeof file !== 'object') return;
    try {
      Object.defineProperty(file, 'intakeSource', { value: hinted, configurable: true, enumerable: false });
    } catch (_) {
      try { file.intakeSource = hinted; } catch (__) {}
    }
  });
  return files;
}

export function buildImageIntakeEntry({ source, file, client, name, mime, fail } = {}) {
  const entry = {
    source: classifyIntakeSource(source, file || { name }),
    client: CLIENTS.has(client) ? client : 'other',
    name: clipText(name || file?.name || '', 80),
    mime: clipText(mime || file?.type || '', 80)
  };
  const reason = clipText(fail || '', 80);
  if (reason) entry.fail = reason;
  return entry;
}

export function stampCompressedIntake(item, file) {
  if (!item || typeof item !== 'object' || item.isExisting) return item;
  const entry = buildImageIntakeEntry({
    source: file?.intakeSource || item.intakeSource || 'other',
    file,
    client: item.intakeClient || currentUploadClient(),
    name: file?.name || item.intakeName || '',
    mime: file?.type || item.intakeMime || ''
  });
  item.intakeSource = entry.source;
  item.intakeClient = entry.client;
  item.intakeName = entry.name;
  item.intakeMime = entry.mime;
  return item;
}

export function intakeFromCompressed(item, fail) {
  if (!item || typeof item !== 'object') return null;
  if (item.intake && typeof item.intake === 'object') {
    return buildImageIntakeEntry({ ...item.intake, fail: fail || item.intake.fail || item.intakeFail || '' });
  }
  if (!item.intakeSource && !item.intakeName && !item.intakeMime) return null;
  return buildImageIntakeEntry({
    source: item.intakeSource,
    client: item.intakeClient,
    name: item.intakeName,
    mime: item.intakeMime,
    fail: fail || item.intakeFail || ''
  });
}

export function imageIntakeList(images) {
  const list = Array.isArray(images) ? images.filter(Boolean) : [];
  if (!list.some(img => img.intake || img.intakeSource || img.intakeName || img.intakeMime)) return null;
  return list.slice(0, 50).map(img => intakeFromCompressed(img) || { source: 'other', client: 'other', name: '', mime: '' });
}

export function sanitizeImageIntakeList(list) {
  if (!Array.isArray(list)) return [];
  return list.slice(0, 50).map(entry => {
    if (!entry || typeof entry !== 'object') return { source: 'other', client: 'other', name: '', mime: '' };
    return buildImageIntakeEntry(entry);
  });
}

function isHttpsUrl(url) {
  return typeof url === 'string' && url.startsWith('https://');
}

/* Returns the message to write, or null when a photo slot has no https Storage URL.
 * Callers must skip the Firestore write on null — a data: URL is not a stored photo. */
export function storedPhotoPayload(message, images) {
  const list = Array.isArray(images) ? images.filter(Boolean) : [];
  if (!list.length) return null;
  for (const img of list) {
    const full = img.imageUrl;
    const thumb = img.thumbUrl || img.imageUrl;
    if (!isHttpsUrl(full) || !isHttpsUrl(thumb)) return null;
  }
  const next = { ...(message || {}) };
  const intake = imageIntakeList(list);
  if (intake) next.imageIntake = intake;
  return next;
}
