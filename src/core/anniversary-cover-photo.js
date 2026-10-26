// Shared representative-image selection for anniversary-derived cards.
//
// A manually attached anniversary photo (or a crawled poster) is authoritative. When
// neither exists, a photo attached to the same calendar date is a useful, deterministic
// cover for memories, content cards and date banners. This module is deliberately pure so
// the rule can be unit-tested without React/Firebase.

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function clean(value) {
  const text = String(value || '').trim();
  return text && text !== 'undefined' && text !== 'null' ? text : '';
}

function dateKey(value) {
  const text = clean(value).slice(0, 10);
  return ISO_DATE_RE.test(text) ? text : '';
}

function monthDay(value) {
  const text = clean(value);
  let match = text.match(/^(?:\d{4}[-./])?(\d{1,2})[-./](\d{1,2})$/);
  if (!match) match = text.match(/^(?:\d{4}-)?(\d{2})(\d{2})$/);
  if (!match) return '';
  const month = Number(match[1]);
  const day = Number(match[2]);
  if (!Number.isInteger(month) || !Number.isInteger(day) || month < 1 || month > 12 || day < 1 || day > 31) return '';
  return `${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function anniversaryDateInfo(anniversary) {
  const start = dateKey(anniversary?.startDate || anniversary?.date);
  const end = dateKey(anniversary?.endDate || anniversary?.startDate || anniversary?.date) || start;
  const yearly = monthDay(anniversary?.date);
  return { start, end: end || start, yearly };
}

function candidateUrl(photo) {
  return clean(photo?.full || photo?.imageUrl || photo?.url || photo?.src || photo?.image
    || photo?.thumbUrl || photo?.thumbnailUrl || photo?.thumb || photo?.downloadURL);
}

function candidateThumb(photo) {
  return clean(photo?.thumbUrl || photo?.thumbnailUrl || photo?.thumb || photo?.thumbnail
    || photo?.full || photo?.imageUrl || photo?.url || photo?.src || photo?.image || photo?.downloadURL);
}

export function normalizeAnniversaryCoverPhoto(photo, source = 'date') {
  const full = candidateUrl(photo);
  const thumb = candidateThumb(photo) || full;
  if (!full && !thumb) return null;
  return {
    ...(photo && typeof photo === 'object' ? photo : {}),
    full: full || thumb,
    thumb: thumb || full,
    imageUrl: full || thumb,
    url: full || thumb,
    thumbUrl: thumb || full,
    source: photo?.source || source
  };
}

function photoDate(photo) {
  return dateKey(photo?.meetingDate || photo?.date || photo?.dateKey || photo?.albumDate || photo?.uploadDate);
}

function photoMatchesAnniversary(photo, anniversary) {
  const date = photoDate(photo);
  if (!date) return false;
  const { start, end, yearly } = anniversaryDateInfo(anniversary);
  if (start && date >= start && date <= (end || start)) return true;
  return !!yearly && date.slice(5) === yearly;
}

function photoTimestamp(photo) {
  const value = photo?.createdAt ?? photo?.updatedAt ?? photo?.timestamp ?? 0;
  if (typeof value?.toMillis === 'function') return Number(value.toMillis()) || 0;
  if (typeof value?.toDate === 'function') return Number(value.toDate()?.getTime()) || 0;
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : (Date.parse(value) || 0);
}

/**
 * Return the representative photo, preferring explicit anniversary media and then a
 * same-date attachment. `datePhotos` may be a flat meeting/photo-index list.
 */
export function resolveAnniversaryCoverPhoto(anniversary, datePhotos = []) {
  if (!anniversary || typeof anniversary !== 'object') return null;
  const explicit = Array.isArray(anniversary.photos) ? anniversary.photos : [];
  const explicitPhoto = explicit.map(photo => normalizeAnniversaryCoverPhoto(photo, 'anniversary')).find(Boolean);
  if (explicitPhoto) return explicitPhoto;
  const ownImage = normalizeAnniversaryCoverPhoto({ image: anniversary.image }, 'anniversary');
  if (ownImage) return ownImage;

  const candidates = (Array.isArray(datePhotos) ? datePhotos : [])
    .filter(photo => photo && photoMatchesAnniversary(photo, anniversary))
    .map(photo => normalizeAnniversaryCoverPhoto(photo, 'date'))
    .filter(Boolean)
    .sort((a, b) => photoTimestamp(b) - photoTimestamp(a));
  return candidates[0] || null;
}

export function resolveAnniversaryCoverUrl(anniversary, datePhotos = []) {
  const photo = resolveAnniversaryCoverPhoto(anniversary, datePhotos);
  return photo?.thumb || photo?.full || photo?.url || '';
}

export function anniversaryPhotoMatchesDate(photo, anniversary) {
  return photoMatchesAnniversary(photo, anniversary);
}

export function collectAnniversaryDatePhotos(calendar, getMeetings) {
  const meetings = typeof getMeetings === 'function' ? getMeetings(calendar) : [];
  return (Array.isArray(meetings) ? meetings : []).flatMap(meeting => (
    (Array.isArray(meeting?.photos) ? meeting.photos : []).map(photo => ({
      ...photo,
      meetingDate: photo?.meetingDate || meeting?.date || ''
    }))
  ));
}

