/* Chat file attachment helpers — documents upload beside the existing chat image pipeline. */

import { uploadBlobWithWatchdog } from './app-media-upload.js';

export const MAX_CHAT_FILE_BYTES = 20 * 1024 * 1024;
export const MAX_CHAT_FILE_ATTACHMENTS = 20;

export const CHAT_DOCUMENT_EXTENSIONS = Object.freeze([
  'pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'txt', 'csv', 'rtf'
]);

export const CHAT_DOCUMENT_MIME_TYPES = Object.freeze([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
  'text/csv',
  'application/rtf',
  'text/rtf',
  'application/csv',
  'application/vnd.ms-office'
]);

export const CHAT_IMAGE_MIME_PREFIX = 'image/';
export const CHAT_IMAGE_EXTENSIONS = Object.freeze([
  'jpg', 'jpeg', 'png', 'webp', 'gif', 'heic', 'heif', 'bmp', 'avif'
]);

/** Single paperclip picker: images + documents (images route to photo pipeline). */
export const CHAT_COMPOSER_ACCEPT = [
  '.pdf', '.doc', '.docx', '.ppt', '.pptx', '.xls', '.xlsx', '.txt', '.csv', '.rtf',
  ...CHAT_DOCUMENT_MIME_TYPES,
  'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/heic', 'image/heif', 'image/*'
].join(',');


const EXT_MIME = Object.freeze({
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ppt: 'application/vnd.ms-powerpoint',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  xls: 'application/vnd.ms-excel',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  txt: 'text/plain',
  csv: 'text/csv',
  rtf: 'application/rtf',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  gif: 'image/gif',
  heic: 'image/heic',
  heif: 'image/heif',
  bmp: 'image/bmp',
  avif: 'image/avif'
});

const FILE_ATTACHMENT_KEYS = Object.freeze([
  'id', 'name', 'mime', 'size', 'url', 'storagePath', 'uploadedAt', 'ext', 'tags'
]);

export function getFileExtension(nameOrPath = '') {
  const raw = String(nameOrPath || '').trim();
  const base = raw.split(/[\\/]/).pop() || '';
  const clean = base.split('?')[0].split('#')[0];
  const idx = clean.lastIndexOf('.');
  if (idx < 0) return '';
  return clean.slice(idx + 1).toLowerCase();
}

export function isHeicLikeName(file) {
  const name = String(file?.name || '');
  const type = String(file?.type || '').toLowerCase();
  const ext = getFileExtension(name);
  return type.includes('heic') || type.includes('heif') || ext === 'heic' || ext === 'heif';
}

export function isChatImageFile(file) {
  if (!file) return false;
  const type = String(file.type || '').toLowerCase();
  if (type.startsWith(CHAT_IMAGE_MIME_PREFIX)) return true;
  if (isHeicLikeName(file)) return true;
  const ext = getFileExtension(file.name);
  return CHAT_IMAGE_EXTENSIONS.includes(ext);
}

export function isChatDocumentFile(file) {
  if (!file || isChatImageFile(file)) return false;
  const type = String(file.type || '').toLowerCase();
  const ext = getFileExtension(file.name);
  if (CHAT_DOCUMENT_EXTENSIONS.includes(ext)) return true;
  if (CHAT_DOCUMENT_MIME_TYPES.includes(type)) return true;
  // Some browsers leave Office MIME empty; extension is authoritative for the allowlist.
  return false;
}

export function isVideoLikeFile(file) {
  const type = String(file?.type || '').toLowerCase();
  const ext = getFileExtension(file?.name);
  return type.startsWith('video/') || ['mp4', 'mov', 'webm', 'mkv', 'avi', 'm4v'].includes(ext);
}

export function classifyChatComposerFiles(fileList) {
  const images = [];
  const documents = [];
  const rejected = [];
  Array.from(fileList || []).forEach(file => {
    if (!file) return;
    if (isVideoLikeFile(file)) {
      rejected.push({ file, reason: 'video' });
      return;
    }
    if (isChatImageFile(file)) {
      images.push(file);
      return;
    }
    if (isChatDocumentFile(file)) {
      if (Number(file.size) > MAX_CHAT_FILE_BYTES) {
        rejected.push({ file, reason: 'too-large' });
        return;
      }
      documents.push(file);
      return;
    }
    rejected.push({ file, reason: 'unsupported' });
  });
  return { images, documents, rejected };
}

export function formatChatFileSize(bytes) {
  const n = Number(bytes);
  if (!Number.isFinite(n) || n < 0) return '';
  if (n < 1024) return `${Math.round(n)} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(n < 10 * 1024 ? 1 : 0)} KB`;
  return `${(n / (1024 * 1024)).toFixed(n < 10 * 1024 * 1024 ? 1 : 0)} MB`;
}

export function getChatFileTypeLabel(attachment) {
  const ext = String(attachment?.ext || getFileExtension(attachment?.name) || '').toUpperCase();
  if (ext) return ext;
  const mime = String(attachment?.mime || '').toLowerCase();
  if (mime === 'application/pdf') return 'PDF';
  if (mime.includes('word')) return 'DOC';
  if (mime.includes('presentation') || mime.includes('powerpoint')) return 'PPT';
  if (mime.includes('sheet') || mime.includes('excel')) return 'XLS';
  if (mime.startsWith('text/')) return 'TXT';
  return 'FILE';
}

export function isPdfAttachment(attachment) {
  const mime = String(attachment?.mime || '').toLowerCase();
  const ext = String(attachment?.ext || getFileExtension(attachment?.name) || '').toLowerCase();
  return mime === 'application/pdf' || ext === 'pdf';
}

export function guessMimeForFile(file) {
  const type = String(file?.type || '').trim().toLowerCase();
  if (type && type !== 'application/octet-stream') return type;
  const ext = getFileExtension(file?.name);
  return EXT_MIME[ext] || 'application/octet-stream';
}

export function createPendingChatFileAttachment(file) {
  const ext = getFileExtension(file?.name);
  const mime = guessMimeForFile(file);
  const id = `local_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  return {
    id,
    name: String(file?.name || `file.${ext || 'bin'}`).slice(0, 200),
    mime,
    size: Number(file?.size) || 0,
    ext,
    file,
    localOnly: true
  };
}

export function sanitizeFileAttachment(entry) {
  if (!entry || typeof entry !== 'object') return null;
  const name = typeof entry.name === 'string' ? entry.name.trim().slice(0, 200) : '';
  const url = typeof entry.url === 'string' ? entry.url.trim().slice(0, 2000) : '';
  const storagePath = typeof entry.storagePath === 'string' ? entry.storagePath.trim().slice(0, 500) : '';
  const mime = typeof entry.mime === 'string' ? entry.mime.trim().slice(0, 120) : '';
  const ext = typeof entry.ext === 'string'
    ? entry.ext.trim().toLowerCase().slice(0, 16)
    : getFileExtension(name);
  const size = Number(entry.size);
  const uploadedAt = Number(entry.uploadedAt);
  const id = typeof entry.id === 'string' ? entry.id.trim().slice(0, 120) : '';
  const tags = typeof entry.tags === 'string' ? entry.tags.trim().slice(0, 160) : '';
  if (!name || !url || !storagePath) return null;
  if (!Number.isFinite(size) || size < 0 || size > MAX_CHAT_FILE_BYTES) return null;
  if (!Number.isFinite(uploadedAt) || uploadedAt <= 0) return null;
  const out = {
    id: id || `file_${uploadedAt}`,
    name,
    mime: mime || EXT_MIME[ext] || 'application/octet-stream',
    size: Math.round(size),
    url,
    storagePath,
    uploadedAt: Math.round(uploadedAt),
    ext,
    ...(tags ? { tags } : {})
  };
  // Drop unknown keys so Firestore hasOnly stays stable.
  Object.keys(out).forEach(key => {
    if (!FILE_ATTACHMENT_KEYS.includes(key)) delete out[key];
  });
  return out;
}

export function sanitizeFileAttachments(list) {
  if (!Array.isArray(list)) return undefined;
  const cleaned = list.map(sanitizeFileAttachment).filter(Boolean).slice(0, MAX_CHAT_FILE_ATTACHMENTS);
  return cleaned.length > 0 ? cleaned : undefined;
}

function getLiveFirebaseStorage() {
  try {
    if (typeof window !== 'undefined' && window.__gatherFirebaseStorage) return window.__gatherFirebaseStorage;
  } catch (_) {}
  try {
    if (typeof firebase !== 'undefined' && typeof firebase.storage === 'function') return firebase.storage();
  } catch (_) {}
  return null;
}

function getLiveFirestore() {
  try {
    if (typeof window !== 'undefined' && window.GATHER_APP_FIREBASE_DATA && window.GATHER_APP_FIREBASE_DATA.firebaseDb) {
      return window.GATHER_APP_FIREBASE_DATA.firebaseDb;
    }
  } catch (_) {}
  return null;
}

function safeStorageFileName(name) {
  const base = String(name || 'file').replace(/[^\w.\-()+ ]+/g, '_').replace(/\s+/g, '_');
  return base.slice(0, 120) || 'file';
}

// SHA-256 of the file's bytes -- the dedup key for the cross-calendar shared-file pool below.
// Every browser this app supports has SubtleCrypto; if it's ever unavailable (very old browser,
// non-HTTPS context) callers just skip dedup and upload like before rather than failing outright.
async function sha256HexOfFile(file) {
  try {
    if (!(typeof crypto !== 'undefined' && crypto.subtle && typeof crypto.subtle.digest === 'function')) return '';
    const buffer = await file.arrayBuffer();
    const digest = await crypto.subtle.digest('SHA-256', buffer);
    return Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, '0')).join('');
  } catch (_) {
    return '';
  }
}

// Same file (identical bytes) commonly gets sent to several calendars, or resent in the same
// one -- a shared trip flyer, a group PDF, a ticket. Before this, every send re-uploaded the
// full bytes to a fresh per-calendar Storage path, unlike link previews (which already share one
// Peekalink fetch per URL across every calendar via the `linkPreviews` collection). Look up a
// content-hash keyed `sharedFiles/{hash}` doc first and reuse its URL/path when the bytes match;
// only fall through to a real upload on a genuine miss.
async function findSharedFileByHash(hash) {
  const db = getLiveFirestore();
  if (!db || !hash) return null;
  try {
    const snap = await db.collection('sharedFiles').doc(hash).get();
    if (!snap.exists) return null;
    const data = snap.data() || {};
    if (!data.url || !data.storagePath) return null;
    return data;
  } catch (_) {
    return null;
  }
}

async function registerSharedFile(hash, entry) {
  const db = getLiveFirestore();
  if (!db || !hash) return;
  try {
    await db.collection('sharedFiles').doc(hash).set({
      url: entry.url,
      storagePath: entry.storagePath,
      name: entry.name,
      mime: entry.mime,
      size: entry.size,
      ext: entry.ext,
      createdAt: Date.now()
    }, { merge: true });
  } catch (_) {
    // Non-fatal -- the file itself already uploaded fine; a dedup registration miss just means
    // the next identical upload re-uploads instead of reusing, not a broken attachment now.
  }
}

export async function uploadChatFileAttachment(calendarId, file, onBytes, timeoutMs = 60000) {
  let storage = getLiveFirebaseStorage();
  if (!storage && typeof window !== 'undefined' && typeof window.__gatherLoadFirebaseStorageSdk === 'function') {
    try { await window.__gatherLoadFirebaseStorageSdk(); } catch (_) {}
    storage = getLiveFirebaseStorage();
  }
  if (!storage || !file || !calendarId) return null;
  const ext = getFileExtension(file.name);
  const mime = guessMimeForFile(file);
  const size = Number(file.size) || 0;
  const stamp = Date.now();
  const rand = Math.random().toString(36).slice(2, 8);
  const name = String(file.name || `file.${ext || 'bin'}`).slice(0, 200);

  const hash = await sha256HexOfFile(file);
  if (hash) {
    const shared = await findSharedFileByHash(hash);
    // Guard on size too -- an extremely unlikely SHA-256 collision would otherwise hand back
    // someone else's file under this name.
    if (shared && Number(shared.size) === size) {
      return sanitizeFileAttachment({
        id: `file_${stamp}_${rand}`,
        name,
        mime: shared.mime || mime,
        size,
        url: shared.url,
        storagePath: shared.storagePath,
        uploadedAt: stamp,
        ext
      });
    }
  }

  const storagePath = hash
    ? `sharedFiles/${hash}_${size}.${ext || 'bin'}`
    : `chatFiles/${calendarId}/${stamp}_${rand}_${safeStorageFileName(file.name)}`;
  const ref = storage.ref(storagePath);
  const url = await uploadBlobWithWatchdog({
    ref,
    blob: file,
    contentType: mime,
    taskKey: `file-${stamp}`,
    onBytes,
    timeoutMs,
    stallTimeoutMs: 25000
  });
  if (!url) {
    try { await ref.delete(); } catch (_) {}
    return null;
  }
  const attachment = sanitizeFileAttachment({
    id: `file_${stamp}_${rand}`,
    name,
    mime,
    size,
    url,
    storagePath,
    uploadedAt: stamp,
    ext
  });
  if (hash && attachment) registerSharedFile(hash, attachment);
  return attachment;
}

export async function uploadChatFileAttachments(calendarId, pendingList, onProgress) {
  const files = (Array.isArray(pendingList) ? pendingList : [])
    .map(item => item?.file || item)
    .filter(Boolean);
  const uploaded = [];
  for (let i = 0; i < files.length; i += 1) {
    const file = files[i];
    if (typeof onProgress === 'function') {
      onProgress({
        pct: Math.min(90, 10 + Math.round((i / Math.max(1, files.length)) * 70)),
        current: i + 1,
        total: files.length,
        label: '파일 업로드 중...'
      });
    }
    const result = await uploadChatFileAttachment(calendarId, file, null);
    if (!result) throw new Error(`파일 업로드 실패: ${file?.name || i + 1}`);
    uploaded.push(result);
  }
  return uploaded;
}

export function collectChatFileAttachmentsFromMessages(messages) {
  const list = [];
  (Array.isArray(messages) ? messages : []).forEach(msg => {
    const attachments = Array.isArray(msg?.fileAttachments) ? msg.fileAttachments : [];
    attachments.forEach((attachment, index) => {
      const clean = sanitizeFileAttachment(attachment);
      if (!clean) return;
      list.push({
        ...clean,
        messageId: msg.id || '',
        participantId: msg.participantId || '',
        timestamp: Number(msg.timestamp) || clean.uploadedAt || 0,
        source: 'chat',
        uploadSource: msg.uploadSource || 'chat',
        attachmentIndex: index
      });
    });
  });
  list.sort((a, b) => (Number(b.timestamp) || 0) - (Number(a.timestamp) || 0));
  return list;
}

if (typeof window !== 'undefined') {
  window.GATHER_CHAT_FILE_ATTACHMENTS = Object.assign({}, window.GATHER_CHAT_FILE_ATTACHMENTS || {}, {
    MAX_CHAT_FILE_BYTES,
    MAX_CHAT_FILE_ATTACHMENTS,
    CHAT_COMPOSER_ACCEPT,
    classifyChatComposerFiles,
    formatChatFileSize,
    getChatFileTypeLabel,
    isPdfAttachment,
    isChatImageFile,
    isChatDocumentFile,
    sanitizeFileAttachments,
    sanitizeFileAttachment,
    createPendingChatFileAttachment,
    uploadChatFileAttachments,
    collectChatFileAttachmentsFromMessages
  });
}
