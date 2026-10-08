/**
 * Local memo draft autosave (memo editor add/edit + memo comment compose).
 *
 * What is kept: title, body, tags (date hashtags are how a memo is tied to a date, so the
 * selected date rides along in `tags`), the half-typed tag, colour/pin, and -- for edits -- the
 * references (already-uploaded https URLs) of the photos still attached. Never photo binaries:
 * data:/blob: previews and File/Blob objects are dropped.
 *
 * Keyed per calendar + memo (`new` for the add composer), so drafts never cross calendars.
 * Saved debounced (~500ms) by the editor, cleared on a successful save or an explicit 새로 쓰기,
 * and expired after 7 days. This is a per-device UI draft only -- the memo itself still lives
 * only in Firestore.
 */

export const MEMO_DRAFT_PREFIX = 'gather_memo_draft_v1';
export const MEMO_DRAFT_TTL_MS = 7 * 24 * 60 * 60 * 1000;
export const MEMO_DRAFT_DEBOUNCE_MS = 500;
export const MEMO_DRAFT_RESTORE_PROMPT = '작성 중이던 메모가 있어요. 이어서 쓸까요?';
export const MEMO_DRAFT_CLOSE_MESSAGE = '저장하지 않은 내용이 있습니다. 작성 중인 내용은 이 기기에 임시 저장돼서 다음에 이어 쓸 수 있어요. 닫으시겠습니까?';

const MAX_TEXT = 20000;
const MAX_TAGS = 50;
const MAX_IMAGES = 20;

function cleanSegment(value) {
  return String(value == null ? '' : value).replace(/[:\s]/g, '_').slice(0, 120);
}

export function memoDraftKey(calendarId, memoId) {
  const cal = cleanSegment(calendarId);
  if (!cal) return '';
  return `${MEMO_DRAFT_PREFIX}:${cal}:${cleanSegment(memoId) || 'new'}`;
}

export function memoCommentDraftKey(calendarId, memoId, commentId) {
  const cal = cleanSegment(calendarId);
  const memo = cleanSegment(memoId);
  if (!cal || !memo) return '';
  return `${MEMO_DRAFT_PREFIX}:${cal}:comment:${memo}${commentId ? `:${cleanSegment(commentId)}` : ''}`;
}

function isRemoteUrl(url) {
  return typeof url === 'string' && /^https?:\/\//i.test(url) && url.length < 4000;
}

/** Keep only already-uploaded photo references (https URLs); never binaries or local previews. */
export function draftImageRefs(images) {
  if (!Array.isArray(images)) return [];
  const out = [];
  for (const img of images) {
    if (!img || typeof img !== 'object') continue;
    if (img.originalBlob || img.thumbnailBlob || img.file) continue;
    const original = isRemoteUrl(img.original) ? img.original : '';
    if (!original) continue;
    out.push({ original, thumbnail: isRemoteUrl(img.thumbnail) ? img.thumbnail : original, fingerprint: typeof img.fingerprint === 'string' ? img.fingerprint.slice(0, 200) : '' });
    if (out.length >= MAX_IMAGES) break;
  }
  return out;
}

function str(value, max = MAX_TEXT) {
  return typeof value === 'string' ? value.slice(0, max) : '';
}

/** Normalize editor fields into the stored draft shape. */
export function normalizeMemoDraft(fields = {}) {
  const tags = Array.isArray(fields.tags) ? fields.tags.map(t => String(t || '').trim()).filter(Boolean).slice(0, MAX_TAGS) : [];
  const draft = {
    title: str(fields.title, 500),
    text: str(fields.text),
    tags,
    tagInput: str(fields.tagInput, 200),
  };
  if (typeof fields.color === 'string' && fields.color) draft.color = fields.color.slice(0, 120);
  if (typeof fields.isPinned === 'boolean') draft.isPinned = fields.isPinned;
  if (fields.images !== undefined) draft.images = draftImageRefs(fields.images);
  if (typeof fields.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(fields.date)) draft.date = fields.date;
  return draft;
}

export function isMemoDraftEmpty(draft) {
  if (!draft) return true;
  return !String(draft.title || '').trim()
    && !String(draft.text || '').trim()
    && !(Array.isArray(draft.tags) && draft.tags.length)
    && !String(draft.tagInput || '').trim();
}

function comparable(draft) {
  const d = normalizeMemoDraft(draft || {});
  return JSON.stringify([d.title.trim(), d.text.trim(), d.tags, d.tagInput.trim(), (d.images || []).map(i => i.original)]);
}

/** Same user-visible content (title/body/tags/kept photos)? Colour/pin alone never trigger a prompt. */
export function isSameMemoDraftContent(a, b) {
  return comparable(a) === comparable(b);
}

function getStorage(storage) {
  if (storage) return storage;
  try { return typeof window !== 'undefined' ? window.localStorage : null; } catch (_) { return null; }
}

export function saveMemoDraft(key, fields, { storage, now = Date.now() } = {}) {
  const store = getStorage(storage);
  if (!store || !key) return false;
  const draft = normalizeMemoDraft(fields);
  try {
    if (isMemoDraftEmpty(draft)) { store.removeItem(key); return false; }
    store.setItem(key, JSON.stringify({ v: 1, savedAt: now, ...draft }));
    return true;
  } catch (_) {
    return false; // quota / private mode: autosave is best-effort
  }
}

export function loadMemoDraft(key, { storage, now = Date.now(), ttlMs = MEMO_DRAFT_TTL_MS } = {}) {
  const store = getStorage(storage);
  if (!store || !key) return null;
  try {
    const raw = store.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const savedAt = Number(parsed && parsed.savedAt);
    if (!parsed || parsed.v !== 1 || !Number.isFinite(savedAt) || now - savedAt > ttlMs || savedAt - now > ttlMs) {
      store.removeItem(key);
      return null;
    }
    const draft = normalizeMemoDraft(parsed);
    if (isMemoDraftEmpty(draft)) { store.removeItem(key); return null; }
    return { ...draft, savedAt };
  } catch (_) {
    try { store.removeItem(key); } catch (__) { /* ignore */ }
    return null;
  }
}

export function clearMemoDraft(key, { storage } = {}) {
  const store = getStorage(storage);
  if (!store || !key) return;
  try { store.removeItem(key); } catch (_) { /* ignore */ }
}

/** Drop every expired memo draft (any calendar). Cheap: only touches our own prefix. */
export function pruneExpiredMemoDrafts({ storage, now = Date.now(), ttlMs = MEMO_DRAFT_TTL_MS } = {}) {
  const store = getStorage(storage);
  if (!store || typeof store.length !== 'number') return 0;
  const keys = [];
  try {
    for (let i = 0; i < store.length; i += 1) {
      const k = store.key(i);
      if (k && k.startsWith(`${MEMO_DRAFT_PREFIX}:`)) keys.push(k);
    }
  } catch (_) { return 0; }
  let removed = 0;
  for (const k of keys) {
    if (!loadMemoDraft(k, { storage: store, now, ttlMs })) removed += 1;
  }
  return removed;
}

/** Trailing-edge debounce with flush/cancel (flush runs a pending save right away). */
export function createDebouncedSaver(fn, wait = MEMO_DRAFT_DEBOUNCE_MS, timers = { set: setTimeout, clear: clearTimeout }) {
  let handle = null;
  let pending = null;
  const run = () => {
    handle = null;
    if (!pending) return;
    const args = pending;
    pending = null;
    fn(...args);
  };
  const schedule = (...args) => {
    pending = args;
    if (handle !== null) timers.clear(handle);
    handle = timers.set(run, wait);
  };
  schedule.flush = () => { if (handle !== null) { timers.clear(handle); } run(); };
  schedule.cancel = () => { if (handle !== null) timers.clear(handle); handle = null; pending = null; };
  schedule.pending = () => pending !== null;
  return schedule;
}

/** The editor fields an existing memo opens with (baseline for "did the user change anything?"). */
export function memoDraftFieldsFromMemo(memo) {
  if (!memo) return normalizeMemoDraft({});
  const rawTags = Array.isArray(memo.tags) ? memo.tags : (memo.tags ? [memo.tags] : []);
  const tags = rawTags.map(tag => { const t = String(tag || '').trim(); return t.startsWith('#') ? t.slice(1).trim() : t; }).filter(Boolean);
  const urls = Array.isArray(memo.imageUrls) ? memo.imageUrls : [];
  return normalizeMemoDraft({
    title: memo.title || '',
    text: memo.text || '',
    tags,
    tagInput: '',
    images: urls.map((url, idx) => ({ original: url, thumbnail: (memo.thumbUrls && memo.thumbUrls[idx]) || url })),
  });
}

/** Draft photo refs that still belong to `memo` (restore never invents a photo the memo lost). */
export function restorableDraftImages(draft, memo) {
  if (!draft || !Array.isArray(draft.images) || !memo) return null;
  const urls = Array.isArray(memo.imageUrls) ? memo.imageUrls : [];
  return draft.images
    .map(img => urls.indexOf(img.original))
    .filter((idx, pos, arr) => idx >= 0 && arr.indexOf(idx) === pos)
    .map(idx => ({
      original: urls[idx],
      thumbnail: (memo.thumbUrls && memo.thumbUrls[idx]) || urls[idx],
      fingerprint: (memo.imageFingerprints && memo.imageFingerprints[idx]) || '',
      isExisting: true,
    }));
}
