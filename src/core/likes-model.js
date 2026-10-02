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
export function splitLikesForParticipant(likes, participantId) {
  const list = Array.isArray(likes) ? likes : [];
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
