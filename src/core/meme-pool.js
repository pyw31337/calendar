/**
 * 밈 키보드(meme keyboard): a global, cross-calendar pool of tagged sticker/meme images.
 * Typing a word in chat that matches one of the pool's hashtags surfaces a collapsible strip
 * of matching thumbnails above the composer, tap-to-send like an emoji picker.
 *
 * Data lives in the top-level `memePool` Firestore collection (not scoped to any one
 * calendar -- every calendar's chat searches the same shared index) and in Firebase Storage
 * under `memePool/`. Writes to the Firestore metadata go only through the admin-gated
 * memePoolUpsert/memePoolDelete Cloud Functions (see functions/index.js for why client writes
 * aren't allowed there); this module only uploads the image bytes to Storage directly, the
 * same trust model every other upload path in this app already uses (see storage.rules).
 */

// Longest side an uploaded meme image (or its thumbnail) is resized to before upload. Admin
// source files are arbitrary phone/PC screenshots and stickers -- these keep the pool light
// enough that fetching a few hundred to a few thousand thumbnails for local hashtag search
// stays cheap, while still looking sharp inside the small keyboard strip / bulk-tagging grid.
const MEME_FULL_MAX_DIM = 720;
const MEME_THUMB_MAX_DIM = 220;

function loadImageFromFile(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = err => { URL.revokeObjectURL(url); reject(err); };
    img.src = url;
  });
}

function resizeImageToBlob(img, maxDim, quality, isPng) {
  let w = img.width, h = img.height;
  if (w > maxDim || h > maxDim) {
    if (w > h) { h = Math.round(h * maxDim / w); w = maxDim; }
    else { w = Math.round(w * maxDim / h); h = maxDim; }
  }
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  canvas.getContext('2d').drawImage(img, 0, 0, w, h);
  return new Promise((resolve, reject) => {
    const type = isPng ? 'image/png' : 'image/jpeg';
    const done = blob => {
      if (!blob) {
        reject(new Error('이미지를 변환하지 못했습니다'));
        return;
      }
      resolve({ blob, width: w, height: h });
    };
    if (isPng) canvas.toBlob(done, type);
    else canvas.toBlob(done, type, quality);
  });
}

// GIFs must not be re-encoded to canvas (that silently drops the animation, flattening it to
// one frame) -- upload the original bytes for both "full" and "thumb" when the source is a gif.
function isGif(file) {
  return /image\/gif/i.test(file?.type || '') || /\.gif$/i.test(file?.name || '');
}

function isHeicFile(file) {
  return /image\/hei[cf]/i.test(file?.type || '') || /\.hei[cf]$/i.test(file?.name || '');
}

function getMemeStorage() {
  try {
    if (typeof window !== 'undefined' && window.__gatherFirebaseStorage) {
      return window.__gatherFirebaseStorage;
    }
  } catch (_) {}
  // Chat uploads already do this: loading the Storage *script* is not enough. firebase.storage
  // is a factory -- until we call it, window.__gatherFirebaseStorage stays unset and every
  // meme upload returns null. That is why #534 still failed on a fresh admin session: the
  // 밈키보드 tab is usually opened before any chat/gallery upload has initialized Storage.
  try {
    if (typeof firebase !== 'undefined' && typeof firebase.storage === 'function') {
      if (!firebase.apps.length) {
        const cfg = (typeof window !== 'undefined' && window.__gatherFirebaseConfig) || null;
        if (cfg) firebase.initializeApp(cfg);
      }
      if (!firebase.apps.length) return null;
      const storage = firebase.storage();
      if (typeof window !== 'undefined') window.__gatherFirebaseStorage = storage;
      return storage;
    }
  } catch (_) {}
  return null;
}

// Storage is loaded lazily (see main.jsx's loadFirebaseStorageSdk) so a read-only visitor never
// pays for its script on the critical path -- the SDK only actually loads once something tries
// to upload. #534 started awaiting that loader here, but still only read
// window.__gatherFirebaseStorage afterwards, which nobody had set.
async function ensureMemeStorage() {
  let storage = getMemeStorage();
  if (storage) return storage;
  if (typeof window !== 'undefined' && typeof window.__gatherLoadFirebaseStorageSdk === 'function') {
    try { await window.__gatherLoadFirebaseStorageSdk(); } catch (err) {
      throw new Error(`스토리지 SDK 로드 실패: ${err?.message || err}`, { cause: err });
    }
  }
  storage = getMemeStorage();
  if (storage) return storage;
  throw new Error('스토리지를 시작하지 못했습니다. 새로고침 후 다시 시도해 주세요.');
}

async function uploadBlobToMemePool(storage, path, blob, contentType) {
  if (!blob) throw new Error('업로드할 이미지가 비어 있습니다');
  const ref = storage.ref(path);
  await ref.put(blob, { contentType });
  return ref.getDownloadURL();
}

function describeMemeUploadError(err) {
  const code = String(err?.code || '');
  const raw = String(err?.message || err || '');
  if (code === 'storage/unauthorized' || /unauthorized/i.test(raw)) {
    return '저장소 규칙이 아직 반영되지 않았습니다. 운영자에게 storage 배포를 요청해 주세요.';
  }
  if (code === 'storage/canceled' || /canceled/i.test(raw)) return '업로드가 취소되었습니다.';
  if (code === 'storage/retry-limit-exceeded') return '네트워크가 불안정합니다. 잠시 후 다시 시도해 주세요.';
  if (/스토리지 SDK|스토리지를 시작/i.test(raw)) return raw;
  if (/hei[cf]/i.test(raw)) return raw;
  if (/이미지를 변환|로드하지/i.test(raw)) return raw;
  if (/요청이 실패했습니다 \(401\)/.test(raw)) return '관리자 비밀번호가 맞지 않습니다. 다시 로그인해 주세요.';
  if (/요청이 실패했습니다 \(429\)/.test(raw)) return '잠시 후 다시 시도해 주세요.';
  if (/요청이 실패했습니다/.test(raw)) return `등록 함수 오류: ${raw}`;
  return raw.slice(0, 180) || '알 수 없는 오류';
}

// Resizes+uploads one file to `memePool/{id}_full.<ext>` and `memePool/{id}_thumb.<ext>`,
// returning the pair of download URLs (plus the full image's pixel size).
// Does NOT touch Firestore -- call memePoolUpsertRemote afterward to register the metadata.
async function uploadMemePoolAssets(id, file) {
  if (!file) throw new Error('파일이 없습니다');
  if (isHeicFile(file)) {
    throw new Error('HEIC 사진은 JPG/PNG/GIF/WEBP로 저장한 뒤 올려 주세요');
  }
  const storage = await ensureMemeStorage();
  try {
    if (isGif(file)) {
      const [fullUrl, thumbUrl] = await Promise.all([
        uploadBlobToMemePool(storage, `memePool/${id}_full.gif`, file, 'image/gif'),
        uploadBlobToMemePool(storage, `memePool/${id}_thumb.gif`, file, 'image/gif')
      ]);
      return { fullUrl, thumbUrl, width: null, height: null };
    }
    const img = await loadImageFromFile(file);
    const isPng = /image\/png/i.test(file.type || '') || /\.png$/i.test(file.name || '');
    const [full, thumb] = await Promise.all([
      resizeImageToBlob(img, MEME_FULL_MAX_DIM, 0.85, isPng),
      resizeImageToBlob(img, MEME_THUMB_MAX_DIM, 0.8, isPng)
    ]);
    const ext = isPng ? 'png' : 'jpg';
    const contentType = isPng ? 'image/png' : 'image/jpeg';
    const [fullUrl, thumbUrl] = await Promise.all([
      uploadBlobToMemePool(storage, `memePool/${id}_full.${ext}`, full.blob, contentType),
      uploadBlobToMemePool(storage, `memePool/${id}_thumb.${ext}`, thumb.blob, contentType)
    ]);
    return { fullUrl, thumbUrl, width: full.width, height: full.height };
  } catch (err) {
    console.warn('uploadMemePoolAssets failed:', err);
    throw err;
  }
}

// A short, filesystem/Storage-path-safe id derived from the upload time + a random suffix.
// Doesn't need to be globally unique beyond "extremely unlikely to collide within one admin
// bulk-upload batch" -- matches MEME_POOL_ID_RE in functions/index.js.
function generateMemePoolId() {
  return `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeHashtag(tag) {
  return String(tag || '').trim().replace(/^#/, '').toLowerCase();
}

// Splits a free-text hashtag input ("눈물, 화남 짜증" or "#눈물 #화남") into normalized tags.
function parseHashtagInput(text) {
  return Array.from(new Set(
    String(text || '')
      .split(/[,\s]+/)
      .map(normalizeHashtag)
      .filter(Boolean)
  ));
}

// Given the full meme pool and the text currently being typed in chat, returns groups of
// { tag, items } for every hashtag that appears as a substring of the typed text (e.g. typing
// "너무 눈물난다" matches the "눈물" tag). Longest tags first so a more specific match
// ("눈물참기") outranks a shorter one ("눈물") when both would otherwise match the same text.
function matchMemePoolByKeyword(pool, text) {
  const needle = String(text || '').trim().toLowerCase();
  if (!needle || !Array.isArray(pool) || pool.length === 0) return [];
  const byTag = new Map();
  pool.forEach(item => {
    (Array.isArray(item?.hashtags) ? item.hashtags : []).forEach(rawTag => {
      const tag = normalizeHashtag(rawTag);
      if (!tag || !needle.includes(tag)) return;
      if (!byTag.has(tag)) byTag.set(tag, []);
      byTag.get(tag).push(item);
    });
  });
  return Array.from(byTag.entries())
    .map(([tag, items]) => ({ tag, items }))
    .sort((a, b) => b.tag.length - a.tag.length);
}

export {
  MEME_FULL_MAX_DIM,
  MEME_THUMB_MAX_DIM,
  uploadMemePoolAssets,
  generateMemePoolId,
  normalizeHashtag,
  parseHashtagInput,
  matchMemePoolByKeyword,
  describeMemeUploadError,
  isHeicFile,
  isGif
};
