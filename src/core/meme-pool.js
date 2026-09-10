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
  return new Promise(resolve => {
    if (isPng) canvas.toBlob(blob => resolve({ blob, width: w, height: h }), 'image/png');
    else canvas.toBlob(blob => resolve({ blob, width: w, height: h }), 'image/jpeg', quality);
  });
}

// GIFs must not be re-encoded to canvas (that silently drops the animation, flattening it to
// one frame) -- upload the original bytes for both "full" and "thumb" when the source is a gif.
function isGif(file) {
  return /image\/gif/i.test(file.type || '') || /\.gif$/i.test(file.name || '');
}

function getMemeStorage() {
  return (typeof window !== 'undefined' && window.__gatherFirebaseStorage) || null;
}

async function uploadBlobToMemePool(storage, path, blob, contentType) {
  const ref = storage.ref(path);
  await ref.put(blob, { contentType });
  return ref.getDownloadURL();
}

// Resizes+uploads one file to `memePool/{id}_full.<ext>` and `memePool/{id}_thumb.<ext>`,
// returning the pair of download URLs (plus the full image's pixel size) or null on failure.
// Does NOT touch Firestore -- call memePoolUpsertRemote afterward to register the metadata.
async function uploadMemePoolAssets(id, file) {
  const storage = getMemeStorage();
  if (!storage || !file) return null;
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
    return null;
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
  matchMemePoolByKeyword
};
