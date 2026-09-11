import { withTimeout, MAX_CHAT_THUMB_BASE64_LENGTH } from './app-domain-helpers.js';
import {
  buildMetadataTags as buildPhotoMetadataTags,
  parseNominatimLocation
} from './photo-metadata-tags.js';
import { reverseGeocodeCoords } from './app-place-search.js';
import { firebaseConfig, isStorageDisabled, ensureFirebaseStorageReady, checkFirebaseStorageHealth } from './app-firebase-data.js';
import { uploadBlobWithWatchdog } from './app-media-upload.js';
import exifr from 'exifr';

// Same live-getter pattern as chat-file-attachments.js's own getLiveFirebaseStorage -- reads the
// global __setFirebaseDb-adjacent Storage instance set by app-firebase-data.js, rather than a
// one-time snapshot, so it reflects the SDK actually connecting after this module first evaluates.
function getLiveFirebaseStorage() {
  try {
    if (typeof window !== 'undefined' && window.__gatherFirebaseStorage) return window.__gatherFirebaseStorage;
  } catch (_) {}
  try {
    if (typeof firebase !== 'undefined' && typeof firebase.storage === 'function') return firebase.storage();
  } catch (_) {}
  return null;
}

const GATHER_APP_CHAT_DATA = window.GATHER_APP_CHAT_DATA || {};

// HEIC/HEIF (the default photo format on iPhone) has no native decode support in canvas/Image()
// on any browser except some Safari versions -- a raw .heic/.heif file (e.g. picked via the
// Files app, which unlike Safari's usual photo picker doesn't auto-convert to JPEG on select)
// fails outright everywhere else. heic2any is a WASM-based client-side HEIC->JPEG converter;
// it's ~1.3MB so it's loaded lazily, only the first time an actual HEIC/HEIF file shows up.
// Bounds any promise that might otherwise hang forever (a stalled network request that never
// fires error/complete, a CDN script tag whose load/error events never trigger on a flaky
// mobile connection) so a single stuck operation can't freeze the whole upload/processing
// flow indefinitely -- without this, callers awaiting it never reach their finally block, so a
// submit button or progress overlay would stay stuck on-screen with no way to recover.

let heicToLoadPromise = null;
// heic-to bundles a current libheif build (1.22.2 as of writing) inside a single self-contained
// file -- no separate .wasm fetch, it spins up its decoder as an inline Worker built from a
// string embedded in this same file. heic2any (below) is kept only as a second-chance fallback:
// it hasn't been updated since 2023, and its own Emscripten build has been unreliable on some
// mobile browsers in the wild for reasons that never surface a clear error (it's caught and
// collapsed into one generic failure), which is exactly the profile of this bug report.
const HEIC_TO_CDN_URLS = Array.isArray(GATHER_APP_CHAT_DATA.HEIC_TO_CDN_URLS) ? GATHER_APP_CHAT_DATA.HEIC_TO_CDN_URLS : [
  'https://cdn.jsdelivr.net/npm/heic-to@1.5.2/dist/heic-to.js',
  'https://unpkg.com/heic-to@1.5.2/dist/heic-to.js'
];
function loadHeicTo(timeoutMs = 15000) {
  if (heicToLoadPromise) return heicToLoadPromise;
  heicToLoadPromise = (async () => {
    let lastErr = null;
    for (const src of HEIC_TO_CDN_URLS) {
      try {
        const mod = await withTimeout(import(/* @vite-ignore */ src), timeoutMs, `heic-to import timed out: ${src}`);
        if (mod && typeof mod.heicTo === 'function') return mod.heicTo;
        lastErr = new Error('heic-to module missing heicTo export');
      } catch (err) {
        lastErr = err;
      }
    }
    heicToLoadPromise = null; // allow retrying on a later file instead of caching the failure forever
    throw lastErr || new Error('heic-to failed to load from all CDNs');
  })();
  return heicToLoadPromise;
}

let heic2anyLoadPromise = null;
// Two independent CDNs -- some mobile carrier/corporate networks block one but not the other,
// and a single hardcoded host with no fallback turns any CDN hiccup into a hard HEIC failure.
const HEIC2ANY_CDN_URLS = Array.isArray(GATHER_APP_CHAT_DATA.HEIC2ANY_CDN_URLS) ? GATHER_APP_CHAT_DATA.HEIC2ANY_CDN_URLS : [
  'https://cdn.jsdelivr.net/npm/heic2any@0.0.4/dist/heic2any.min.js',
  'https://unpkg.com/heic2any@0.0.4/dist/heic2any.min.js'
];
function loadScriptOnce(src, timeoutMs) {
  return new Promise((resolve, reject) => {
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
function loadHeic2any(timeoutMs = 15000) {
  if (window.heic2any) return Promise.resolve(window.heic2any);
  if (heic2anyLoadPromise) return heic2anyLoadPromise;
  heic2anyLoadPromise = (async () => {
    let lastErr = null;
    for (const src of HEIC2ANY_CDN_URLS) {
      try {
        await loadScriptOnce(src, timeoutMs);
        if (window.heic2any) return window.heic2any;
        lastErr = new Error('heic2any failed to initialize');
      } catch (err) {
        lastErr = err;
      }
    }
    heic2anyLoadPromise = null; // allow retrying on a later file instead of caching the failure forever
    throw lastErr || new Error('heic2any failed to load from all CDNs');
  })();
  return heic2anyLoadPromise;
}

async function sniffImageFormat(file) {
  if (!file || typeof file.slice !== 'function') return null;
  try {
    const buf = await file.slice(0, 16).arrayBuffer();
    const bytes = new Uint8Array(buf);
    if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
      return { mime: 'image/jpeg', ext: 'jpg', kind: 'jpeg' };
    }
    if (bytes.length >= 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) {
      return { mime: 'image/png', ext: 'png', kind: 'png' };
    }
    if (bytes.length >= 6 && bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x38) {
      return { mime: 'image/gif', ext: 'gif', kind: 'gif' };
    }
    if (bytes.length >= 12
      && bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46
      && bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50) {
      return { mime: 'image/webp', ext: 'webp', kind: 'webp' };
    }
    // ISO BMFF brands: HEIC/HEIF/AVIF often arrive from messengers with a .png/.jpg name.
    if (bytes.length >= 12) {
      const brand = String.fromCharCode(bytes[8], bytes[9], bytes[10], bytes[11]).toLowerCase();
      if (brand === 'heic' || brand === 'heif' || brand === 'mif1' || brand === 'msf1') {
        return { mime: 'image/heic', ext: 'heic', kind: 'heic' };
      }
      if (brand === 'avif' || brand === 'avis') {
        return { mime: 'image/avif', ext: 'avif', kind: 'avif' };
      }
    }
  } catch (_) { /* ignore sniff failures */ }
  return null;
}

function withCorrectedImageFile(file, sniff) {
  if (!file || !sniff?.mime) return file;
  const currentType = String(file.type || '').toLowerCase();
  if (currentType === sniff.mime) return file;
  const rawName = String(file.name || 'image').trim() || 'image';
  const base = rawName.includes('.') ? rawName.replace(/\.[^.]+$/, '') : rawName;
  const nextName = `${base}.${sniff.ext}`;
  try {
    if (typeof File === 'function') {
      return new File([file], nextName, { type: sniff.mime, lastModified: file.lastModified || Date.now() });
    }
  } catch (_) { /* fall through to Blob */ }
  const blob = file.slice ? file.slice(0, file.size, sniff.mime) : new Blob([file], { type: sniff.mime });
  try { blob.name = nextName; } catch (_) { /* Blob.name is read-only in some engines */ }
  return blob;
}

function isHeicFile(file) {
  const type = (file.type || '').toLowerCase();
  if (type === 'image/heic' || type === 'image/heif' || type === 'image/heic-sequence' || type === 'image/heif-sequence') return true;
  // file.type is often empty for HEIC on browsers/OSes with no MIME association registered,
  // so also fall back to the extension.
  const name = (file.name || '').toLowerCase();
  return name.endsWith('.heic') || name.endsWith('.heif');
}

// Wraps Image() decoding with a timeout so one stuck/malformed file can't hang a whole batch
// indefinitely (the caller is otherwise waiting on onload/onerror, which some browsers never
// fire for certain corrupt inputs).
function loadImageElement(objectUrl, timeoutMs = 20000) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    let settled = false;
    const timeoutId = setTimeout(() => {
      if (settled) return;
      settled = true;
      reject(Object.assign(new Error('IMAGE_DECODE_TIMEOUT'), { code: 'IMAGE_DECODE_TIMEOUT' }));
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
      reject(Object.assign(new Error('IMAGE_DECODE_FAILED'), { code: 'IMAGE_DECODE_FAILED' }));
    };
    img.src = objectUrl;
  });
}

// Exposed so compressImageToDataUrls (still in app-main.js, U7b scope) can force a fresh load
// attempt when the actual HEIC conversion call fails after a successful module load (as opposed
// to loadHeicTo/loadHeic2any's own internal reset, which only covers a load failure) -- same
// "don't cache a transient failure forever" reasoning as those functions' own resets.
function resetHeicToLoader() {
  heicToLoadPromise = null;
}
function resetHeic2anyLoader() {
  heic2anyLoadPromise = null;
  window.heic2any = null;
}

async function compressImageToDataUrls(file, { maxThumbBase64Length = MAX_CHAT_THUMB_BASE64_LENGTH } = {}) {
  // Messengers often rewrite the bytes (JPEG/HEIC) while keeping a .png name or a wrong MIME.
  // Sniff the header so decode/encode follow the real format instead of the filename.
  const sniffed = await sniffImageFormat(file).catch(() => null);
  const workingFile = withCorrectedImageFile(file, sniffed) || file;
  let sourceBlob = workingFile;
  const metadata = await extractPhotoMetadata(workingFile).catch(() => null);
  let img = null;
  const treatAsHeic = isHeicFile(workingFile) || sniffed?.kind === 'heic';

  if (treatAsHeic) {
    // Try every native decode path the platform might offer before falling back to a CDN
    // library. Different engines expose HEIC support through different APIs -- some Chrome
    // builds decode via createImageBitmap using the OS's own HEIF codec without supporting
    // <img> for the same file, while Safari typically supports both. Trying both costs nothing
    // on browsers that support neither: createImageBitmap rejects immediately for an
    // undecodable blob, and <img> reports onerror almost instantly (no network wait, the file
    // is already a local blob). This also sidesteps heic2any's bundled libheif (last published
    // 2020) failing to parse newer HDR/gain-map HEIC variants some iPhones now produce, which
    // the platform's own decoder often still handles fine -- and avoids the ~1.3MB CDN fetch
    // entirely on capable browsers.
    if (typeof createImageBitmap === 'function') {
      try {
        img = await withTimeout(createImageBitmap(workingFile), 6000, 'createImageBitmap timed out');
      } catch (err) {
        img = null;
      }
    }
    if (!img) {
      const probeUrl = URL.createObjectURL(workingFile);
      try {
        img = await loadImageElement(probeUrl, 6000);
      } catch (err) {
        img = null;
      } finally {
        URL.revokeObjectURL(probeUrl);
      }
    }

    if (!img) {
      let converted = null;
      let lastErr = null;

      // Primary: heic-to, a self-contained, actively-maintained current-libheif build. Try it
      // twice -- the first conversion call right after the decoder's Worker spins up can
      // transiently fail in some browsers, and one retry recovers most of those.
      for (let attempt = 0; attempt < 2 && !converted; attempt++) {
        try {
          const heicTo = await loadHeicTo();
          converted = await withTimeout(
            heicTo({ blob: workingFile, type: 'image/jpeg', quality: 0.85 }),
            45000,
            'HEIC conversion timed out'
          );
        } catch (err) {
          lastErr = err;
          resetHeicToLoader(); // force a fresh load attempt on retry, not a cached failure
        }
      }

      // Fallback: heic2any, an older/differently-built decoder kept only as a second opinion in
      // case heic-to's specific CDN or Worker/WASM path is the one having trouble on a given
      // device -- a genuinely different implementation succeeding where the first one failed is
      // exactly the case this is here for.
      if (!converted) {
        for (let attempt = 0; attempt < 2 && !converted; attempt++) {
          try {
            const heic2any = await loadHeic2any();
            // A 24MP+ HEIC on a slower mobile device can genuinely take a while to decode, but
            // must not be allowed to hang forever -- bound it generously (45s) rather than leave
            // the attach flow stuck with no way to recover.
            converted = await withTimeout(
              heic2any({ blob: workingFile, toType: 'image/jpeg', quality: 0.85 }),
              45000,
              'HEIC conversion timed out'
            );
          } catch (err) {
            lastErr = err;
            resetHeic2anyLoader(); // force a fresh load attempt on retry, not a cached failure
          }
        }
      }

      if (!converted) {
        throw Object.assign(new Error('HEIC 이미지를 변환하지 못했습니다.'), { code: 'HEIC_CONVERT_FAILED', fileName: workingFile.name || file.name, cause: lastErr });
      }
      sourceBlob = Array.isArray(converted) ? converted[0] : converted;
    }
  }

  if (!img) {
    // Prefer createImageBitmap for ordinary images too -- some mobile WebViews decode JPEG/PNG
    // via bitmap even when <img> onerror fires for a MIME/extension mismatch.
    if (typeof createImageBitmap === 'function') {
      try {
        img = await withTimeout(createImageBitmap(sourceBlob), 8000, 'createImageBitmap timed out');
      } catch (_) {
        img = null;
      }
    }
  }
  if (!img) {
    const objectUrl = URL.createObjectURL(sourceBlob);
    try {
      img = await loadImageElement(objectUrl);
    } catch (err) {
      throw Object.assign(
        new Error('이미지를 불러오지 못했습니다. 지원하지 않는 형식이거나 손상된 파일일 수 있습니다.'),
        { code: err.code || 'IMAGE_DECODE_FAILED', fileName: workingFile.name || file.name, sniffedKind: sniffed?.kind || null }
      );
    } finally {
      URL.revokeObjectURL(objectUrl);
    }
  }

  // Encodes `img` as a JPEG data URL within `budget` (fallback path only).
  const yieldToMain = () => new Promise(r => setTimeout(r, 0));
  const encodeWithinBudget = async (maxDimStart, qualitySteps, budget, minDim) => {
    let maxDim = maxDimStart;
    let best = null;
    while (true) {
      let w = img.width, h = img.height;
      if (w > maxDim || h > maxDim) {
        if (w > h) { h = Math.round(h * maxDim / w); w = maxDim; }
        else { w = Math.round(w * maxDim / h); h = maxDim; }
      }
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      canvas.getContext('2d').drawImage(img, 0, 0, w, h);
      for (const quality of qualitySteps) {
        const base64 = canvas.toDataURL('image/jpeg', quality);
        best = { base64, canvas, quality };
        if (base64.length <= budget) return best;
        await yieldToMain();
      }
      if (maxDim <= minDim) return best;
      maxDim = Math.max(minDim, Math.round(maxDim * 0.75));
    }
  };

  const preferStorage = !isStorageDisabled;

  const getHighQualityBlob = () => {
    if (isStorageDisabled) return Promise.resolve(null);
    // 1440px/quality 0.72 was noticeably blurring dense small text (scanned notices, flyers) --
    // this path only fires for genuinely oversized sources (small ones already return the
    // original file untouched below), so a bigger cap and higher quality here doesn't cost much:
    // Storage uploads aren't bounded by Firestore's 1MiB doc limit the way inline base64 is.
    const maxDimHigh = 2000;
    const isOversized = img.width > maxDimHigh || img.height > maxDimHigh;
    if (!isOversized && workingFile.size <= 1.5 * 1024 * 1024) {
      return Promise.resolve(workingFile);
    }
    return new Promise(res => {
      let w = img.width, h = img.height;
      const isPng = sniffed?.kind === 'png' || (!sniffed && (workingFile.type === 'image/png' || (workingFile.name || file.name || '').toLowerCase().endsWith('.png')));
      if (isOversized) {
        if (w > h) { h = Math.round(h * maxDimHigh / w); w = maxDimHigh; }
        else { w = Math.round(w * maxDimHigh / h); h = maxDimHigh; }
      }
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      canvas.getContext('2d').drawImage(img, 0, 0, w, h);
      if (isPng) canvas.toBlob(blob => res(blob), 'image/png');
      else canvas.toBlob(blob => res(blob), 'image/jpeg', 0.85);
    });
  };

  const getHighQualityThumbBlob = () => {
    if (isStorageDisabled) return Promise.resolve(null);
    return new Promise(res => {
      let w = img.width, h = img.height;
      // 640px: this thumb is shared by the gallery grid (~122px cells) and the single-image
      // chat bubble (renderChatMessageImages caps that display at maxWidth 420px/60vh and
      // intentionally reuses this thumb instead of the full asset). A 480px cap (tried in
      // #556) visibly softened the chat bubble on retina/high-DPI screens -- a 420 CSS px
      // bubble on a 2x+ display needs 840px+ of real pixels to look sharp, and 480px fell far
      // short. Reverted back to 640px; the gallery grid can live with the larger per-photo
      // bytes since 640px is still well under the un-thumbed full asset.
      const maxDimThumb = 640;
      if (w > maxDimThumb || h > maxDimThumb) {
        if (w > h) { h = Math.round(h * maxDimThumb / w); w = maxDimThumb; }
        else { w = Math.round(w * maxDimThumb / h); h = maxDimThumb; }
      }
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      canvas.getContext('2d').drawImage(img, 0, 0, w, h);
      const isPng = sniffed?.kind === 'png' || (!sniffed && (workingFile.type === 'image/png' || (workingFile.name || file.name || '').toLowerCase().endsWith('.png')));
      if (isPng) canvas.toBlob(blob => res(blob), 'image/png');
      else canvas.toBlob(blob => res(blob), 'image/jpeg', 0.82);
    });
  };

  let originalMeta = null;
  let thumbnailMeta = null;
  if (!preferStorage) {
    originalMeta = await encodeWithinBudget(600, [0.85, 0.75, 0.65, 0.55, 0.45, 0.35], 48 * 1024, 320);
    thumbnailMeta = await encodeWithinBudget(360, [0.78, 0.68, 0.58, 0.48], maxThumbBase64Length, 180);
  }

  const highQualityBlob = await getHighQualityBlob();
  const highQualityThumbBlob = await getHighQualityThumbBlob();

  return new Promise((resolve) => {
    const objectUrls = [];
    const finish = (origBlob, thumbBlob) => {
      let originalStr = originalMeta ? originalMeta.base64 : null;
      let thumbnailStr = thumbnailMeta ? thumbnailMeta.base64 : null;
      if (preferStorage) {
        const previewBlob = thumbBlob || origBlob || file;
        try {
          const previewUrl = URL.createObjectURL(previewBlob);
          objectUrls.push(previewUrl);
          originalStr = previewUrl;
          thumbnailStr = previewUrl;
        } catch (_) {
          originalStr = originalStr || '';
          thumbnailStr = thumbnailStr || originalStr;
        }
      }
      resolve({
        original: originalStr,
        thumbnail: thumbnailStr,
        originalBlob: origBlob,
        thumbnailBlob: thumbBlob,
        needsBase64Fallback: preferStorage,
        metadata,
        _objectUrls: objectUrls
      });
    };

    const getOrig = (cb) => {
      if (highQualityBlob) cb(highQualityBlob);
      else if (originalMeta && originalMeta.canvas) originalMeta.canvas.toBlob(blob => cb(blob), 'image/jpeg', originalMeta.quality);
      else cb(file);
    };
    const getThumb = (cb) => {
      if (highQualityThumbBlob) cb(highQualityThumbBlob);
      else if (thumbnailMeta && thumbnailMeta.canvas) thumbnailMeta.canvas.toBlob(blob => cb(blob), 'image/jpeg', thumbnailMeta.quality);
      else getOrig(cb);
    };
    getOrig(origBlob => getThumb(thumbBlob => finish(origBlob, thumbBlob)));
  });
}

// Extract only the small, user-facing subset of EXIF. The original EXIF block is never stored.
// GPS is reverse-geocoded on a best-effort basis and cached by rounded coordinates so a batch
// from one place does not issue one request per image.
const photoLocationCache = new Map();
let photoLocationRequestAt = 0;
async function extractPhotoMetadata(file) {
  if (!file || typeof exifr?.parse !== 'function') return null;
  const exif = await exifr.parse(file, { pick: ['DateTimeOriginal', 'CreateDate', 'Make', 'Model', 'latitude', 'longitude'] });
  if (!exif) return null;
  const result = {};
  const date = exif.DateTimeOriginal || exif.CreateDate;
  if (date instanceof Date && !Number.isNaN(date.getTime())) result.capturedAt = date.toISOString();
  const make = String(exif.Make || '').trim();
  const model = String(exif.Model || '').trim();
  if (make || model) result.device = [make, model].filter(Boolean).join(' ').replace(/\s+/g, ' ').slice(0, 100);
  const lat = Number(exif.latitude), lon = Number(exif.longitude);
  if (Number.isFinite(lat) && Number.isFinite(lon)) {
    result.latitude = Number(lat.toFixed(6)); result.longitude = Number(lon.toFixed(6));
    const key = `${lat.toFixed(4)},${lon.toFixed(4)}`;
    if (photoLocationCache.has(key)) {
      const cached = photoLocationCache.get(key);
      if (cached && typeof cached === 'object') {
        if (cached.location) result.location = cached.location;
        if (Array.isArray(cached.locationTags) && cached.locationTags.length) result.locationTags = cached.locationTags.slice();
      } else if (cached) {
        result.location = cached;
      }
    } else {
      try {
        let parsed = null;
        if (typeof reverseGeocodeCoords === 'function') {
          parsed = await reverseGeocodeCoords(lat, lon, {
            firebaseConfig: typeof firebaseConfig !== 'undefined' ? firebaseConfig : {}
          });
        } else {
          const waitMs = Math.max(0, 1100 - (Date.now() - photoLocationRequestAt));
          if (waitMs) await new Promise(resolve => setTimeout(resolve, waitMs));
          photoLocationRequestAt = Date.now();
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=jsonv2&addressdetails=1&accept-language=ko&zoom=18`,
            { headers: { Accept: 'application/json', 'User-Agent': 'GatherCalendar/1.0 (https://github.com/pyw31337/calendar)' } }
          );
          if (response.ok) parsed = parseNominatimLocation(await response.json());
        }
        if (parsed && (parsed.location || (parsed.locationTags && parsed.locationTags.length))) {
          photoLocationCache.set(key, parsed);
          if (parsed.location) result.location = parsed.location;
          if (parsed.locationTags.length) result.locationTags = parsed.locationTags;
        }
      } catch (_) {}
    }
  }
  return result;
}

function buildMetadataTags(metadata, scheduledDateOrOptions = '') {
  return buildPhotoMetadataTags(metadata, scheduledDateOrOptions);
}

async function buildBase64FallbackFromCompressed(compressed) {
  const blob = compressed.thumbnailBlob || compressed.originalBlob;
  if (!blob) {
    return {
      original: typeof compressed.original === 'string' && compressed.original.startsWith('data:') ? compressed.original : null,
      thumbnail: typeof compressed.thumbnail === 'string' && compressed.thumbnail.startsWith('data:') ? compressed.thumbnail : null
    };
  }
  let bitmap = null;
  try {
    if (typeof createImageBitmap === 'function') bitmap = await createImageBitmap(blob);
  } catch (_) { bitmap = null; }
  if (!bitmap) {
    const dataUrl = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
    return { original: dataUrl, thumbnail: dataUrl };
  }
  const encode = (maxDim, quality, budget) => {
    let w = bitmap.width, h = bitmap.height;
    if (w > maxDim || h > maxDim) {
      if (w > h) { h = Math.round(h * maxDim / w); w = maxDim; }
      else { w = Math.round(w * maxDim / h); h = maxDim; }
    }
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    canvas.getContext('2d').drawImage(bitmap, 0, 0, w, h);
    let best = canvas.toDataURL('image/jpeg', quality);
    if (best.length > budget) best = canvas.toDataURL('image/jpeg', Math.max(0.35, quality - 0.2));
    return best;
  };
  const original = encode(600, 0.7, 48 * 1024);
  const thumbnail = encode(360, 0.65, 24 * 1024);
  try { bitmap.close && bitmap.close(); } catch (_) {}
  return { original, thumbnail };
}

function revokeCompressedObjectUrls(compressed) {
  if (!compressed || !Array.isArray(compressed._objectUrls)) return;
  compressed._objectUrls.forEach(u => {
    try { URL.revokeObjectURL(u); } catch (_) {}
  });
  compressed._objectUrls = [];
}

// Successful image preprocessing is reusable across a retry. Selecting the same files again
// creates new File objects, so use stable browser metadata rather than object identity. Failed
// items are never cached; the bounded map prevents a long-lived page from retaining unlimited
// full-size blobs.
const imagePreprocessCache = new Map();
const IMAGE_PREPROCESS_CACHE_LIMIT = 80;
function getImagePreprocessCacheKey(file) {
  if (!file) return '';
  return [file.name || '', file.size || 0, file.lastModified || 0, file.type || ''].join('::');
}
function rememberPreprocessedImage(file, compressed) {
  const key = getImagePreprocessCacheKey(file);
  if (!key || !compressed) return;
  imagePreprocessCache.delete(key);
  imagePreprocessCache.set(key, compressed);
  while (imagePreprocessCache.size > IMAGE_PREPROCESS_CACHE_LIMIT) {
    const oldest = imagePreprocessCache.keys().next().value;
    imagePreprocessCache.delete(oldest);
  }
}
function forgetPreprocessedImages(files) {
  Array.from(files || []).forEach(file => {
    const key = getImagePreprocessCacheKey(file);
    if (key) imagePreprocessCache.delete(key);
  });
}

let activeMediaUploadCount = 0;
let mediaUploadWakeLock = null;
let mediaUploadWakeLockVisibilityHandler = null;
async function acquireMediaUploadWakeLock() {
  activeMediaUploadCount += 1;
  if (typeof navigator === 'undefined' || !navigator.wakeLock?.request) return;
  const request = async () => {
    if (activeMediaUploadCount <= 0 || document.visibilityState !== 'visible' || mediaUploadWakeLock) return;
    try {
      mediaUploadWakeLock = await navigator.wakeLock.request('screen');
      mediaUploadWakeLock.addEventListener?.('release', () => { mediaUploadWakeLock = null; request(); });
    } catch (_) { /* unsupported, permission denied, or document hidden */ }
  };
  await request();
  if (!mediaUploadWakeLockVisibilityHandler) {
    mediaUploadWakeLockVisibilityHandler = () => { if (document.visibilityState === 'visible') request(); };
    document.addEventListener('visibilitychange', mediaUploadWakeLockVisibilityHandler);
  }
}
function releaseMediaUploadWakeLock() {
  activeMediaUploadCount = Math.max(0, activeMediaUploadCount - 1);
  if (activeMediaUploadCount > 0) return;
  try { mediaUploadWakeLock?.release?.(); } catch (_) {}
  mediaUploadWakeLock = null;
  if (mediaUploadWakeLockVisibilityHandler) {
    document.removeEventListener('visibilitychange', mediaUploadWakeLockVisibilityHandler);
    mediaUploadWakeLockVisibilityHandler = null;
  }
}

async function processImageFilesSequentially(files, onProgress) {
  await acquireMediaUploadWakeLock();
  try {
  await checkFirebaseStorageHealth().catch(() => {});
  const list = Array.from(files || []).sort((a, b) => String(a && a.name || '').localeCompare(String(b && b.name || ''), undefined, { numeric: true, sensitivity: 'base' }));
  const succeeded = new Array(list.length);
  const failed = [];
  const startedAt = Date.now();
  let completed = 0;
  let cursor = 0;
  const nav = typeof navigator !== 'undefined' ? navigator : {};
  const CONCURRENCY = /Mobi|Android|iPhone|iPad/i.test(nav.userAgent || '') || (nav.hardwareConcurrency || 8) <= 4 ? 1 : Math.min(2, Math.max(1, list.length));

  const report = (fileName) => {
    if (!onProgress) return;
    const elapsedSec = (Date.now() - startedAt) / 1000;
    const pct = list.length ? Math.round((completed / list.length) * 100) : 100;
    const remainingSec = completed > 0
      ? Math.max(0, Math.round((elapsedSec / completed) * (list.length - completed)))
      : null;
    onProgress({
      current: Math.min(list.length, completed + 1),
      total: list.length,
      fileName: fileName || null,
      pct,
      remainingSec
    });
  };

  async function worker() {
    while (true) {
      const i = cursor++;
      if (i >= list.length) return;
      const file = list[i];
      report(file && file.name);
      try {
        await new Promise(resolve => setTimeout(resolve, 0));
        const cacheKey = getImagePreprocessCacheKey(file);
        const cached = cacheKey ? imagePreprocessCache.get(cacheKey) : null;
        if (cached) {
          succeeded[i] = cached;
        } else {
          succeeded[i] = await compressImageToDataUrls(file);
          rememberPreprocessedImage(file, succeeded[i]);
        }
        await new Promise(resolve => setTimeout(resolve, 0));
      } catch (err) {
        failed.push({ fileName: file && file.name, error: err });
        succeeded[i] = null;
      }
      completed += 1;
      report(file && file.name);
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, () => worker()));
  if (onProgress) onProgress({ current: list.length, total: list.length, fileName: null, pct: 100, remainingSec: 0 });
  return { succeeded: succeeded.filter(Boolean), failed };
  } finally {
    releaseMediaUploadWakeLock();
  }
}

// Chunk resolved images so a base64-fallback batch never exceeds Firestore's 1MiB/doc limit.
const CHAT_MESSAGE_SAFE_BYTE_BUDGET = 120000; // large images must use Storage URLs, not Firestore
function chunkResolvedImagesForMessages(resolvedImages) {
  const chunks = [];
  let current = [];
  let currentBytes = 0;
  for (const img of resolvedImages) {
    const imgBytes = (img.imageUrl?.length || 0) + (img.thumbUrl?.length || 0);
    if (current.length > 0 && currentBytes + imgBytes > CHAT_MESSAGE_SAFE_BYTE_BUDGET) {
      chunks.push(current);
      current = [];
      currentBytes = 0;
    }
    current.push(img);
    currentBytes += imgBytes;
  }
  if (current.length > 0) chunks.push(current);
  return chunks;
}

function describeImageProcessingFailures(failed) {
  if (failed.length === 0) return '';
  const first = failed[0];
  const reason = first.error?.code === 'HEIC_CONVERT_FAILED'
    ? 'HEIC/HEIF 변환 실패'
    : first.error?.code === 'IMAGE_DECODE_TIMEOUT'
    ? '처리 시간 초과'
    : first.error?.code === 'IMAGE_DECODE_FAILED'
    ? '이미지 디코드 실패'
    : '지원하지 않는 형식';
  if (failed.length === 1) return `${first.fileName} 첨부 실패 (${reason})`;
  return `${failed.length}장 첨부 실패 (${reason} 등)`;
}

function getImageFilesFromClipboardEvent(event) {
  const clipboard = event?.clipboardData;
  if (!clipboard) return [];
  const files = [];
  const seen = new Set();
  const appendFile = file => {
    if (!file) return;
    const isImageLike = /^image\//i.test(file.type || '') || isHeicFile(file);
    if (!isImageLike) return;
    // Deduplicate pasted images (some browsers expose the same file via items and files).
    const stableKey = `${file.type || 'image'}:${file.size || 0}`;
    const fallbackKey = `${file.name || 'clipboard-image'}:${file.size || 0}:${file.type || ''}:${file.lastModified || 0}`;
    const key = file.size ? stableKey : fallbackKey;
    if (seen.has(key) || seen.has(fallbackKey)) return;
    seen.add(key);
    seen.add(fallbackKey);
    files.push(file);
  };

  Array.from(clipboard.items || []).forEach(item => {
    if (item?.kind === 'file' && /^image\//i.test(item.type || '')) {
      appendFile(item.getAsFile());
    }
  });
  Array.from(clipboard.files || []).forEach(appendFile);
  return files;
}

async function appendChatImageFiles({
  files,
  currentCount,
  setImageProcessing,
  setChatImages,
  showToast
}) {
  const imageFiles = Array.from(files || []).filter(file => /^image\//i.test(file?.type || '') || isHeicFile(file));
  if (imageFiles.length === 0) return { handled: false, succeeded: 0, failed: 0 };

  const remainingSlots = 50 - currentCount;
  if (remainingSlots <= 0) {
    if (showToast) showToast('사진 최대 50장', 'error');
    return { handled: true, succeeded: 0, failed: 0 };
  }

  const filesToProcess = imageFiles.slice(0, remainingSlots);
  if (imageFiles.length > remainingSlots && showToast) {
    showToast(`${remainingSlots}장만 추가됨 (최대 50장)`, 'info');
  }

  setImageProcessing({ current: 0, total: filesToProcess.length });
  const { succeeded, failed } = await processImageFilesSequentially(
    filesToProcess,
    progress => setImageProcessing(progress)
  );

  if (succeeded.length > 0) {
    setChatImages(prev => [...prev, ...succeeded]);
  }
  if (failed.length > 0) {
    console.error('Image compression failed for:', failed.map(f => f.fileName));
    if (showToast) showToast(describeImageProcessingFailures(failed), 'error', 5000);
  } else if (succeeded.length > 0 && showToast) {
    showToast(`${succeeded.length}장 첨부완료`, 'success', 3000);
  }

  return { handled: true, succeeded: succeeded.length, failed: failed.length };
}

function getUploadImageBlobMeta(blob, fallbackExt = 'jpg') {
  const mime = String(blob?.type || '').toLowerCase();
  const extByMime = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
    'image/avif': 'avif',
    'image/bmp': 'bmp'
  };
  const contentTypeByExt = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
    gif: 'image/gif',
    avif: 'image/avif',
    bmp: 'image/bmp'
  };
  const ext = extByMime[mime] || fallbackExt || 'jpg';
  return {
    ext,
    contentType: /^image\//.test(mime) ? mime : (contentTypeByExt[ext] || 'image/jpeg')
  };
}

// Uploads a compressed chat image pair to Firebase Storage and returns download URLs, or null
// if Storage isn't available/the upload fails -- callers should fall back to the base64 data
// URLs already produced by compressImageToDataUrls in that case. `onBytes(taskKey, transferred,
// total)` is called as each upload progresses so a caller can aggregate progress across a batch.
function uploadChatImageAssets(calendarId, compressed, index, onBytes, timeoutMs = 45000) {
  return new Promise((resolve) => {
    const storage = getLiveFirebaseStorage();
    if (!storage || !compressed?.originalBlob || !compressed?.thumbnailBlob) {
      resolve(null);
      return;
    }
    const stamp = Date.now();
    const rand = Math.random().toString(36).slice(2, 8);
    const basePath = `chatImages/${calendarId}/${stamp}_${rand}_${index}`;
    // The byte size is embedded in the filename itself (parsed back out by
    // getStorageUrlFileSize) so the Lightbox info panel can show it without any extra network
    // request -- Firebase Storage's download endpoint doesn't send a CORS header by default, so
    // a plain fetch() to read Content-Length from a different origin (like this app's GitHub
    // Pages host) is silently blocked by the browser and would never work.
    const originalMeta = getUploadImageBlobMeta(compressed.originalBlob, 'jpg');
    const thumbMeta = getUploadImageBlobMeta(compressed.thumbnailBlob, originalMeta.ext === 'png' ? 'png' : 'jpg');
    const originalRef = storage.ref(`${basePath}_original_${compressed.originalBlob.size}b.${originalMeta.ext}`);
    const thumbRef = storage.ref(`${basePath}_thumb_${compressed.thumbnailBlob.size}b.${thumbMeta.ext}`);

    // On a flaky mobile connection, a stalled upload can go silent with no error/complete event
    // ever firing (the SDK is still waiting on a dead connection) -- without a bound here, the
    // whole send/edit flow would hang forever with no way for the user to recover. Time out and
    // fall back to inline base64 for that image instead.
    const runUploadOnce = (blob, ref, taskKey, contentType) => uploadBlobWithWatchdog({
      ref, blob, contentType, taskKey, onBytes, timeoutMs
    });
    // One retry before giving up -- a single failed/timed-out attempt (a brief mobile network
    // hiccup) used to permanently drop that photo to the low-quality ~600px/48KB base64 fallback
    // with no second chance, which is exactly what produced reports of meeting/gallery photos
    // saved at 600x450 / ~33KB. Same fix pattern as loadScriptWithRetry in main.jsx.
    const runUpload = async (blob, ref, taskKey, contentType) => {
      const first = await runUploadOnce(blob, ref, taskKey, contentType);
      if (first) return first;
      return runUploadOnce(blob, ref, taskKey, contentType);
    };

    Promise.all([
      runUpload(compressed.originalBlob, originalRef, `${index}-orig`, originalMeta.contentType),
      runUpload(compressed.thumbnailBlob, thumbRef, `${index}-thumb`, thumbMeta.contentType)
    ]).then(async ([imageUrl, thumbUrl]) => {
      if (imageUrl && thumbUrl) resolve({ imageUrl, thumbUrl });
      else {
        // Treat the pair as one atomic asset: if either upload fails, remove the successful
        // half so an orphaned original/thumbnail cannot accumulate in Storage.
        await Promise.allSettled([
          originalRef.delete().catch(() => {}),
          thumbRef.delete().catch(() => {})
        ]);
        console.warn('Chat image Storage upload failed (no base64 fallback)');
        resolve(null);
      }
    });
  });
}

async function dataUrlToBlob(dataUrl) {
  if (typeof dataUrl !== 'string' || !dataUrl.startsWith('data:')) return null;
  const match = dataUrl.match(/^data:([^;,]+)?(;base64)?,(.*)$/);
  if (!match) return null;
  const mimeType = match[1] || 'application/octet-stream';
  const isBase64 = Boolean(match[2]);
  const payload = match[3] || '';
  try {
    if (isBase64) {
      const binary = atob(payload);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
      return new Blob([bytes], { type: mimeType });
    }
    return new Blob([decodeURIComponent(payload)], { type: mimeType });
  } catch (err) {
    console.warn('dataUrlToBlob failed:', err);
    return null;
  }
}

async function uploadInlineChatImageToStorage(calendarId, imageUrl, thumbUrl, index = 0, onBytes, timeoutMs = 45000) {
  if (!(getLiveFirebaseStorage() || await ensureFirebaseStorageReady())) return null;
  if (onBytes) onBytes(`${index}-prepare`, 1, 10);
  const originalBlob = await dataUrlToBlob(imageUrl);
  if (onBytes) onBytes(`${index}-prepare`, 5, 10);
  const thumbnailBlob = await dataUrlToBlob(thumbUrl && thumbUrl.startsWith('data:') ? thumbUrl : imageUrl);
  if (onBytes) onBytes(`${index}-prepare`, 10, 10);
  if (!originalBlob || !thumbnailBlob) return null;
  return uploadChatImageAssets(calendarId, {
    original: imageUrl,
    thumbnail: thumbUrl || imageUrl,
    originalBlob,
    thumbnailBlob
  }, `share_${index}`, onBytes, timeoutMs);
}

async function readClipboardImageFiles(showToast) {
  if (typeof navigator === 'undefined' || !navigator.clipboard) {
    if (typeof showToast === 'function') showToast('클립보드 접근을 지원하지 않는 브라우저입니다.', 'error');
    return [];
  }
  try {
    const files = [];
    if (typeof navigator.clipboard.read === 'function') {
      // Some mobile browsers (notably Android Chrome when Permissions-Policy silently withholds
      // clipboard-read for this context) neither resolve nor reject this promise -- they just
      // hang forever with no error and no data. Without a bound, that reads to the user as the
      // 붙여넣기 button doing literally nothing when pressed (no toast, no preview, no error).
      // Bounding it guarantees the catch block's error toast fires within a few seconds either
      // way, so a press always produces some visible reaction.
      const items = await withTimeout(navigator.clipboard.read(), 5000, 'clipboard read timed out');
      for (const item of items) {
        for (const type of item.types) {
          if (type.startsWith('image/')) {
            const blob = await item.getType(type);
            const ext = type.split('/')[1] || 'png';
            const file = new File([blob], `paste_${Date.now()}.${ext}`, { type });
            files.push(file);
          }
        }
      }
    }
    if (files.length === 0) {
      if (typeof showToast === 'function') showToast('클립보드에 이미지가 없습니다.', 'info');
    }
    return files;
  } catch (err) {
    console.warn('readClipboardImageFiles failed:', err);
    if (typeof showToast === 'function') showToast('클립보드 이미지를 읽을 수 없거나 접근 권한이 없습니다.', 'error');
    return [];
  }
}

export {
  loadHeicTo, loadHeic2any, sniffImageFormat, withCorrectedImageFile, isHeicFile, loadImageElement, resetHeicToLoader, resetHeic2anyLoader,
  compressImageToDataUrls, buildMetadataTags, buildBase64FallbackFromCompressed, revokeCompressedObjectUrls,
  imagePreprocessCache, getImagePreprocessCacheKey, rememberPreprocessedImage, forgetPreprocessedImages,
  acquireMediaUploadWakeLock, releaseMediaUploadWakeLock, processImageFilesSequentially, chunkResolvedImagesForMessages,
  describeImageProcessingFailures, getImageFilesFromClipboardEvent, appendChatImageFiles, getUploadImageBlobMeta,
  uploadChatImageAssets, uploadInlineChatImageToStorage, readClipboardImageFiles
};
