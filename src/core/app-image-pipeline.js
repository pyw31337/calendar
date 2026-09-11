import { withTimeout } from './app-domain-helpers.js';

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

export { loadHeicTo, loadHeic2any, sniffImageFormat, withCorrectedImageFile, isHeicFile, loadImageElement, resetHeicToLoader, resetHeic2anyLoader };
