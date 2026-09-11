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

function loadImageFromUrl(url, timeoutMs = 20000) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    let settled = false;
    const timeoutId = setTimeout(() => {
      if (settled) return;
      settled = true;
      reject(new Error('이미지를 불러오지 못했습니다'));
    }, timeoutMs);
    img.onload = () => {
      if (settled) return;
      settled = true;
      clearTimeout(timeoutId);
      resolve(img);
    };
    img.onerror = () => {
      if (settled) return;
      settled = true;
      clearTimeout(timeoutId);
      reject(new Error('이미지를 불러오지 못했습니다'));
    };
    img.src = url;
  });
}

function withTimeout(promise, ms, message) {
  return new Promise((resolve, reject) => {
    const id = setTimeout(() => reject(new Error(message)), ms);
    Promise.resolve(promise).then(
      value => { clearTimeout(id); resolve(value); },
      err => { clearTimeout(id); reject(err); }
    );
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
  const type = String(file?.type || '').toLowerCase();
  if (type === 'image/heic' || type === 'image/heif' || type === 'image/heic-sequence' || type === 'image/heif-sequence') return true;
  const name = String(file?.name || '').toLowerCase();
  return name.endsWith('.heic') || name.endsWith('.heif');
}

// Messengers/iOS Files often keep a .jpg/.png name on HEIC bytes. Magic-byte sniff so we
// convert the real format instead of trusting the filename.
async function sniffImageFormat(file) {
  if (!file || typeof file.slice !== 'function') return null;
  try {
    const buf = await file.slice(0, 16).arrayBuffer();
    const bytes = new Uint8Array(buf);
    if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
      return { mime: 'image/jpeg', kind: 'jpeg' };
    }
    if (bytes.length >= 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) {
      return { mime: 'image/png', kind: 'png' };
    }
    if (bytes.length >= 6 && bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x38) {
      return { mime: 'image/gif', kind: 'gif' };
    }
    if (bytes.length >= 12
      && bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46
      && bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50) {
      return { mime: 'image/webp', kind: 'webp' };
    }
    if (bytes.length >= 12) {
      const brand = String.fromCharCode(bytes[8], bytes[9], bytes[10], bytes[11]).toLowerCase();
      if (brand === 'heic' || brand === 'heif' || brand === 'mif1' || brand === 'msf1') {
        return { mime: 'image/heic', kind: 'heic' };
      }
    }
  } catch (_) { /* ignore sniff failures */ }
  return null;
}

function getHeicCdnUrls() {
  const data = (typeof window !== 'undefined' && window.GATHER_APP_CHAT_DATA) || {};
  return {
    heicTo: Array.isArray(data.HEIC_TO_CDN_URLS) && data.HEIC_TO_CDN_URLS.length
      ? data.HEIC_TO_CDN_URLS
      : ['https://cdn.jsdelivr.net/npm/heic-to@1.5.2/dist/heic-to.js', 'https://unpkg.com/heic-to@1.5.2/dist/heic-to.js'],
    heic2any: Array.isArray(data.HEIC2ANY_CDN_URLS) && data.HEIC2ANY_CDN_URLS.length
      ? data.HEIC2ANY_CDN_URLS
      : ['https://cdn.jsdelivr.net/npm/heic2any@0.0.4/dist/heic2any.min.js', 'https://unpkg.com/heic2any@0.0.4/dist/heic2any.min.js']
  };
}

let heicToLoadPromise = null;
async function loadHeicTo(timeoutMs = 15000) {
  if (heicToLoadPromise) return heicToLoadPromise;
  heicToLoadPromise = (async () => {
    let lastErr = null;
    for (const src of getHeicCdnUrls().heicTo) {
      try {
        const mod = await withTimeout(import(/* @vite-ignore */ src), timeoutMs, `heic-to import timed out: ${src}`);
        if (mod && typeof mod.heicTo === 'function') return mod.heicTo;
        lastErr = new Error('heic-to module missing heicTo export');
      } catch (err) {
        lastErr = err;
      }
    }
    heicToLoadPromise = null;
    throw lastErr || new Error('heic-to failed to load from all CDNs');
  })();
  return heicToLoadPromise;
}

function loadScriptOnce(src, timeoutMs) {
  return new Promise((resolve, reject) => {
    if (typeof document === 'undefined') {
      reject(new Error(`script load unavailable: ${src}`));
      return;
    }
    let settled = false;
    const timeoutId = setTimeout(() => {
      if (settled) return;
      settled = true;
      reject(new Error(`script load timed out: ${src}`));
    }, timeoutMs);
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => {
      if (settled) return;
      settled = true;
      clearTimeout(timeoutId);
      resolve();
    };
    script.onerror = () => {
      if (settled) return;
      settled = true;
      clearTimeout(timeoutId);
      reject(new Error(`script failed to load: ${src}`));
    };
    document.head.appendChild(script);
  });
}

let heic2anyLoadPromise = null;
async function loadHeic2any(timeoutMs = 15000) {
  if (typeof window !== 'undefined' && window.heic2any) return window.heic2any;
  if (heic2anyLoadPromise) return heic2anyLoadPromise;
  heic2anyLoadPromise = (async () => {
    let lastErr = null;
    for (const src of getHeicCdnUrls().heic2any) {
      try {
        await loadScriptOnce(src, timeoutMs);
        if (typeof window !== 'undefined' && window.heic2any) return window.heic2any;
        lastErr = new Error('heic2any failed to initialize');
      } catch (err) {
        lastErr = err;
      }
    }
    heic2anyLoadPromise = null;
    throw lastErr || new Error('heic2any failed to load from all CDNs');
  })();
  return heic2anyLoadPromise;
}

async function tryNativeDecode(blob, timeoutMs) {
  if (!blob) return null;
  if (typeof createImageBitmap === 'function') {
    try {
      return await withTimeout(createImageBitmap(blob), timeoutMs, 'decode timeout');
    } catch (_) { /* try <img> next */ }
  }
  if (typeof URL === 'undefined' || typeof Image === 'undefined') return null;
  const url = URL.createObjectURL(blob);
  try {
    return await loadImageFromUrl(url, timeoutMs);
  } catch (_) {
    return null;
  } finally {
    URL.revokeObjectURL(url);
  }
}

async function convertHeicBlobToJpeg(file) {
  let converted = null;
  let lastErr = null;
  for (let attempt = 0; attempt < 2 && !converted; attempt++) {
    try {
      const heicTo = await loadHeicTo();
      converted = await withTimeout(
        heicTo({ blob: file, type: 'image/jpeg', quality: 0.85 }),
        45000,
        '사진 변환이 너무 오래 걸렸습니다'
      );
    } catch (err) {
      lastErr = err;
      heicToLoadPromise = null;
    }
  }
  if (!converted) {
    for (let attempt = 0; attempt < 2 && !converted; attempt++) {
      try {
        const heic2any = await loadHeic2any();
        converted = await withTimeout(
          heic2any({ blob: file, toType: 'image/jpeg', quality: 0.85 }),
          45000,
          '사진 변환이 너무 오래 걸렸습니다'
        );
      } catch (err) {
        lastErr = err;
        heic2anyLoadPromise = null;
        if (typeof window !== 'undefined') window.heic2any = null;
      }
    }
  }
  if (!converted) {
    const error = new Error('사진을 처리하지 못했습니다. 다른 파일을 선택하거나 잠시 후 다시 시도해 주세요.', { cause: lastErr });
    error.code = 'HEIC_CONVERT_FAILED';
    throw error;
  }
  return Array.isArray(converted) ? converted[0] : converted;
}

// libheif WASM is heavy -- serialize conversions so a 24-file HEIC batch doesn't spawn
// 24 workers at once. JPEG/PNG still upload concurrently around this queue.
let heicConvertChain = Promise.resolve();
function enqueueHeicConvert(task) {
  const run = heicConvertChain.then(task, task);
  heicConvertChain = run.then(() => undefined, () => undefined);
  return run;
}

async function decodeMemeImage(file, sniffed) {
  const treatAsHeic = isHeicFile(file) || sniffed?.kind === 'heic';
  let sourceBlob = file;
  let img = null;
  if (treatAsHeic) {
    img = await tryNativeDecode(file, 6000);
    if (!img) {
      sourceBlob = await enqueueHeicConvert(() => convertHeicBlobToJpeg(file));
    }
  }
  if (!img) img = await tryNativeDecode(sourceBlob, 20000);
  if (!img) {
    throw Object.assign(new Error('이미지를 불러오지 못했습니다. 지원하지 않는 형식이거나 손상된 파일일 수 있습니다.'), {
      code: 'IMAGE_DECODE_FAILED'
    });
  }
  return img;
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
  // Meme pool assets are never overwritten in place (a re-tag only touches Firestore, not
  // Storage) -- safe to cache forever, so repeat keyboard opens don't re-fetch every thumbnail.
  await ref.put(blob, { contentType, cacheControl: 'public, max-age=31536000, immutable' });
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
  if (code === 'HEIC_CONVERT_FAILED' || code === 'IMAGE_DECODE_FAILED' || /사진을 처리하지|이미지를 불러오지|이미지를 변환|변환이 너무 오래/i.test(raw)) {
    return '사진을 처리하지 못했습니다. 다른 파일을 선택하거나 잠시 후 다시 시도해 주세요.';
  }
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
  const storage = await ensureMemeStorage();
  const sniffed = await sniffImageFormat(file).catch(() => null);
  try {
    const treatAsGif = sniffed?.kind === 'gif' || (isGif(file) && sniffed?.kind !== 'heic');
    if (treatAsGif) {
      const [fullUrl, thumbUrl] = await Promise.all([
        uploadBlobToMemePool(storage, `memePool/${id}_full.gif`, file, 'image/gif'),
        uploadBlobToMemePool(storage, `memePool/${id}_thumb.gif`, file, 'image/gif')
      ]);
      return { fullUrl, thumbUrl, width: null, height: null };
    }
    const img = await decodeMemeImage(file, sniffed);
    const isPng = sniffed?.kind === 'png' || (!sniffed && (/image\/png/i.test(file.type || '') || /\.png$/i.test(file.name || '')));
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
  sniffImageFormat,
  isHeicFile,
  isGif
};
