/**
 * 좋아요 (likes) — data model. One Firestore document per liked thing, shared by everyone in the
 * calendar (the 갤러리 > 좋아요 tab is the group's collection of favourites):
 *
 *   calendars/cal_{calendarId}/likes/{likeDocId(kind, ref)}
 *     { kind, ref, title, subtitle, thumb, url, likedAt, target }
 *
 * `kind` is what was liked, `ref` the stable identity of that thing inside its own feature
 * (photo asset key, memo id, place id, url, …). The document exists ⇔ the thing is liked, so a
 * like toggle is a single create or delete — no counters, no arrays to merge.
 * `target` carries the few fields the 좋아요 tab needs to reopen the original.
 */

export const LIKE_KINDS = ['photo', 'memo', 'file', 'link', 'content', 'memory', 'person', 'place', 'meeting'];

export const LIKE_KIND_LABELS = {
  photo: '사진', memo: '메모', file: '파일', link: '링크', content: '컨텐츠',
  memory: '추억', person: '인물', place: '장소', meeting: '모임'
};

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

export function likeDocId(kind, ref) {
  const cleanKind = LIKE_KINDS.includes(kind) ? kind : 'item';
  const key = `${cleanKind}:${String(ref || '')}`;
  return `${cleanKind}_${fnv1a(key, 0x811c9dc5)}${fnv1a(key, 0x01234567)}`;
}

const clip = (value, max) => String(value == null ? '' : value).slice(0, max);

/** Normalises a like before it is written (sizes match firestore.rules hasValidLikeShape). */
export function buildLikeDocument(item, now = Date.now()) {
  const kind = LIKE_KINDS.includes(item?.kind) ? item.kind : null;
  const ref = clip(item?.ref, 500);
  if (!kind || !ref) return null;
  const target = {};
  Object.entries(item?.target && typeof item.target === 'object' ? item.target : {}).slice(0, 20).forEach(([key, value]) => {
    if (value == null || value === '') return;
    if (typeof value === 'number' || typeof value === 'boolean') target[clip(key, 40)] = value;
    else target[clip(key, 40)] = clip(value, 1000);
  });
  return {
    kind,
    ref,
    title: clip(item?.title, 300),
    subtitle: clip(item?.subtitle, 300),
    thumb: clip(item?.thumb, 2000),
    url: clip(item?.url, 2000),
    likedAt: Number(item?.likedAt) || now,
    target
  };
}

/** Likes grouped for the 좋아요 tab: kinds in LIKE_KINDS order, newest first inside each. */
export function groupLikesByKind(likes) {
  const groups = new Map(LIKE_KINDS.map(kind => [kind, []]));
  (Array.isArray(likes) ? likes : []).forEach(like => {
    if (like && groups.has(like.kind)) groups.get(like.kind).push(like);
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
