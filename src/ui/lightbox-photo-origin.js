/**
 * Where a Lightbox photo actually came from — the "출처" row in the Lightbox info panel.
 *
 * The origin is decided by how the photo was uploaded (uploadSource / source), never by what it
 * is tagged with. A chat photo tagged "#260926" is auto-linked into that date's 일정 album (see
 * linkTaggedImageToMeetingDates), and every surface that shows the photo also knows the date --
 * the old label logic let either of those turn the source into "일정", so chat photos read as
 * schedule photos. Only a photo uploaded from the schedule itself (uploadSource 'meeting') is
 * "일정"; the date tag / meeting date only picks WHICH date that is.
 *
 * Pure (no window/React) so it can be unit-tested.
 */

const ORIGIN_UPLOAD_SOURCES = ['chat', 'gallery', 'meeting', 'memo'];

function normalize(value) {
  return String(value || '').trim().toLowerCase();
}

function isYmd(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(value || ''));
}

function dateFromTags(tags) {
  const match = String(tags || '').match(/(?:#|^|\s)(20\d{2}-\d{2}-\d{2}|\d{6})(?:\s|$)/);
  if (!match) return '';
  const token = match[1];
  return token.length === 6 ? `20${token.slice(0, 2)}-${token.slice(2, 4)}-${token.slice(4, 6)}` : token;
}

function localYmd(timestamp) {
  const n = Number(timestamp);
  if (!Number.isFinite(n) || n <= 0) return '';
  const d = new Date(n);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}

// Message ids carry their upload path: CalendarApp creates chat sends as `chat_<cal>_...`, gallery
// uploads as `gallery_<cal>_...` and 일정 uploads as `meeting_<cal>_<date>_...`. Used only when the
// source message itself is not loaded (e.g. a date-linked album entry pointing at an old chat
// message), so a reference is never mislabelled "일정" just because its source is off-screen.
export function inferUploadSourceFromMessageId(messageId) {
  const match = String(messageId || '').match(/^(chat|gallery|meeting)_/);
  return match ? match[1] : '';
}

// The schedule date a meeting-origin photo belongs to: the explicit meeting date first, then a
// date embedded in its photo id, its date hashtag, and finally the upload day.
export function resolveMeetingPhotoDate(meta) {
  if (!meta) return '';
  if (isYmd(meta.meetingDate)) return meta.meetingDate;
  const fromId = String(meta.photoId || '').match(/\d{4}-\d{2}-\d{2}/)?.[0] || '';
  if (fromId) return fromId;
  const fromTags = dateFromTags(meta.tags);
  if (fromTags) return fromTags;
  return localYmd(meta.timestamp);
}

/**
 * @returns {{ kind: 'anniversary'|'memo'|'gallery'|'chat'|'meeting', messageId: string|null, meetingDate: string }}
 */
export function resolveLightboxPhotoOrigin(meta) {
  if (!meta) return null;
  const source = normalize(meta.source);
  const declared = ORIGIN_UPLOAD_SOURCES.includes(normalize(meta.uploadSource)) ? normalize(meta.uploadSource) : '';
  const messageId = meta.messageId != null && meta.messageId !== ''
    ? String(meta.messageId)
    : (meta.sourceMessageId ? String(meta.sourceMessageId) : null);
  const meeting = () => ({ kind: 'meeting', messageId, meetingDate: resolveMeetingPhotoDate(meta) });

  if (source === 'anniversary') return { kind: 'anniversary', messageId: null, meetingDate: '' };
  if (source === 'memo' || declared === 'memo') return { kind: 'memo', messageId, meetingDate: '' };
  if (declared === 'gallery' || source === 'gallery') return { kind: 'gallery', messageId, meetingDate: '' };
  // 'chat-tag' is DateModal's name for a chat photo that only shows up there via its date tag.
  if (declared === 'chat' || source === 'chat' || source === 'chat-tag') return { kind: 'chat', messageId, meetingDate: '' };
  if (declared === 'meeting' || source === 'meeting') return meeting();
  // Legacy metadata that never recorded an upload source.
  if (isYmd(meta.meetingDate) || /\d{4}-\d{2}-\d{2}/.test(String(meta.photoId || ''))) return meeting();
  if (messageId) return { kind: 'chat', messageId, meetingDate: '' };
  if (dateFromTags(meta.tags)) return meeting();
  return { kind: 'chat', messageId, meetingDate: '' };
}
