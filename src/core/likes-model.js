/**
 * 좋아요 (likes) — data model. One Firestore document per liked thing, shared by everyone in the
 * calendar (the 갤러리 > 좋아요 tab is the group's collection of favourites):
 *
 *   calendars/cal_{calendarId}/likes/{likeDocId(kind, ref, participantId)}
 *     { kind, ref, participantId, title, subtitle, thumb, url, likedAt, target }
 *
 * Likes belong to the participant currently selected on this device (the same 참여자 the chat,
 * memo and comments use; there is no login yet). The id carries a short hash of the participant
 * id, so 김유리's like and 박영우's like of the same photo are two documents, and choosing the same
 * participant on another device shows the same likes. Likes written before this (no participantId,
 * id without the `_p…` suffix) are kept and show only under 모두.
 *
 * `kind` is what was liked, `ref` the stable identity of that thing inside its own feature
 * (photo asset key, memo id, place id, url, …). The document exists ⇔ the thing is liked, so a
 * like toggle is a single create or delete — no counters, no arrays to merge.
 * `target` carries the few fields the 좋아요 tab needs to reopen the original.
 */

import { todaySeoulDateKey, addDaysToDateKey } from './seoul-date.js';

export const LIKE_KINDS = ['photo', 'memo', 'file', 'link', 'content', 'memory', 'person', 'place', 'meeting'];

export const LIKE_KIND_LABELS = {
  photo: '사진', memo: '메모', file: '파일', link: '링크', content: '컨텐츠',
  memory: '추억', person: '인물', place: '장소', meeting: '모임'
};

function normalizeLikeYmd(raw) {
  const m = String(raw || '').match(/\b(20\d{2})\s*[.\-/년]\s*(\d{1,2})\s*[.\-/월]\s*(\d{1,2})/);
  if (!m) return '';
  return `${m[1]}-${String(m[2]).padStart(2, '0')}-${String(m[3]).padStart(2, '0')}`;
}

function extractLikeSubtitleDates(text) {
  const out = [];
  const re = /\b(20\d{2})\s*[.\-/년]\s*(\d{1,2})\s*[.\-/월]\s*(\d{1,2})/g;
  let m;
  while ((m = re.exec(String(text || ''))) !== null) {
    out.push(`${m[1]}-${String(m[2]).padStart(2, '0')}-${String(m[3]).padStart(2, '0')}`);
  }
  return out;
}

/**
 * Returns true when a liked content item (festival / performance / sports / movie) has already
 * ended as of `today` (Asia/Seoul YYYY-MM-DD), matching the Content tab's lifecycle visibility.
 */
export function isExpiredContentLike(like, today = todaySeoulDateKey()) {
  if (!like || like.kind !== 'content') return false;
  if (!today || !/^\d{4}-\d{2}-\d{2}$/.test(today)) return false;
  const subtitle = String(like.subtitle || '');
  const target = (like.target && typeof like.target === 'object') ? like.target : {};
  if (target.isOpenEnded === true || /오픈런|OPEN\s*RUN|상시/i.test(subtitle)) return false;

  const targetEnd = normalizeLikeYmd(target.endDate);
  const targetStart = normalizeLikeYmd(target.startDate || target.releaseDate);
  const dates = extractLikeSubtitleDates(subtitle);

  const category = String(target.category || '').toLowerCase();
  const isMovie = category === 'movie' || category === 'movies'
    || /개봉/.test(subtitle)
    || /^movie_/i.test(String(like.ref || target.contentId || ''));

  if (isMovie) {
    const endDay = targetEnd || (dates.length >= 2 ? dates[dates.length - 1] : '');
    if (endDay) return endDay < today;
    const releaseDay = targetStart || (dates.length === 1 ? dates[0] : '');
    if (!releaseDay) return false;
    if (releaseDay > today) return false;
    const windowEnd = addDaysToDateKey(releaseDay, 28);
    return Boolean(windowEnd && windowEnd < today);
  }

  const endDay = targetEnd || (dates.length > 0 ? dates[dates.length - 1] : targetStart);
  if (!endDay) return false;
  return endDay < today;
}

// FNV-1a 32-bit, twice with different seeds → 16 hex chars. Only needs to be stable and
// collision-resistant within one calendar's likes, not cryptographic.
function fnv1a(text, seed) {
  let hash = seed >>> 0;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, '0');
}

export function likeDocId(kind, ref, participantId = '') {
  const cleanKind = LIKE_KINDS.includes(kind) ? kind : 'item';
  const key = `${cleanKind}:${String(ref || '')}`;
  const base = `${cleanKind}_${fnv1a(key, 0x811c9dc5)}${fnv1a(key, 0x01234567)}`;
  const pid = String(participantId || '');
  return pid ? `${base}_p${fnv1a(pid, 0x9e3779b9)}` : base;
}

/** Same thing liked by several people -> one key (the 모두 view merges them). */
export function likeThingKey(like) {
  return `${like?.kind || ''}:${like?.ref || ''}`;
}

const clip = (value, max) => String(value == null ? '' : value).slice(0, max);

/** Normalises a like before it is written (sizes match firestore.rules hasValidLikeShape). */
export function buildLikeDocument(item, now = Date.now(), participantId = '') {
  const kind = LIKE_KINDS.includes(item?.kind) ? item.kind : null;
  const ref = clip(item?.ref, 500);
  if (!kind || !ref) return null;
  const target = {};
  Object.entries(item?.target && typeof item.target === 'object' ? item.target : {}).slice(0, 20).forEach(([key, value]) => {
    if (value == null || value === '') return;
    if (typeof value === 'number' || typeof value === 'boolean') target[clip(key, 40)] = value;
    else target[clip(key, 40)] = clip(value, 1000);
  });
  const doc = {
    kind,
    ref,
    title: clip(item?.title, 300),
    subtitle: clip(item?.subtitle, 300),
    thumb: clip(item?.thumb, 2000),
    url: clip(item?.url, 2000),
    likedAt: Number(item?.likedAt) || now,
    target
  };
  const pid = clip(participantId, 120);
  if (pid) doc.participantId = pid;
  return doc;
}

/**
 * The 좋아요 tab lists: `mine` = this participant's likes; `all` = every participant's likes plus
 * the older shared ones, one entry per liked thing with who liked it (newest like first).
 */
export function splitLikesForParticipant(likes, participantId, today = todaySeoulDateKey()) {
  const list = (Array.isArray(likes) ? likes : []).filter(like => like && !isExpiredContentLike(like, today));
  const pid = String(participantId || '');
  const mine = pid ? list.filter(like => like && like.participantId === pid) : list.filter(like => like && !like.participantId);
  const merged = new Map();
  list.slice().sort((a, b) => Number(b?.likedAt || 0) - Number(a?.likedAt || 0)).forEach(like => {
    if (!like) return;
    const key = likeThingKey(like);
    const prev = merged.get(key);
    if (!prev) { merged.set(key, { ...like, likerIds: like.participantId ? [like.participantId] : [] }); return; }
    if (like.participantId && !prev.likerIds.includes(like.participantId)) prev.likerIds.push(like.participantId);
  });
  return { mine, all: Array.from(merged.values()) };
}

/** Likes grouped for the 좋아요 tab: kinds in LIKE_KINDS order, newest first inside each. */
export function groupLikesByKind(likes, today = todaySeoulDateKey()) {
  const groups = new Map(LIKE_KINDS.map(kind => [kind, []]));
  (Array.isArray(likes) ? likes : []).forEach(like => {
    if (like && groups.has(like.kind) && !isExpiredContentLike(like, today)) groups.get(like.kind).push(like);
  });
  return LIKE_KINDS
    .map(kind => ({
      kind,
      label: LIKE_KIND_LABELS[kind],
      items: groups.get(kind).slice().sort((a, b) => Number(b.likedAt || 0) - Number(a.likedAt || 0))
    }))
    .filter(group => group.items.length > 0);
}

/** The like payload for one photo; `ref` is the photo's asset key (same key everywhere). */
export function photoLikeItem(photo, ref) {
  const imageIndex = Number(photo?.imageIndex);
  return {
    kind: 'photo',
    ref,
    title: String(photo?.tags || '').trim() || '사진',
    subtitle: String(photo?.meetingDate || ''),
    thumb: photo?.thumb || photo?.full || '',
    url: photo?.full || photo?.thumb || '',
    target: {
      messageId: photo?.messageId || '',
      imageIndex: Number.isFinite(imageIndex) ? imageIndex : 0,
      source: photo?.source || '',
      meetingDate: photo?.meetingDate || '',
      assetKey: photo?.assetKey || ''
    }
  };
}
