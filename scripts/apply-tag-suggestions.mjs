// Apply the 보관함 추천 tab's automatic suggestions (src/ui/archive-tag-suggestions.js) to every
// photo of a calendar in one pass. DRY RUN by default.
//
//   SUGGEST_CALENDAR_IDS=cw npm run ops:apply-tag-suggestions            # report only
//   SUGGEST_CALENDAR_IDS=cw APPLY=1 npm run ops:apply-tag-suggestions    # write (after ops:export backup)
//
// Only the batch-safe rules are applied (registered place, same-day place, upload-batch tag, album
// date) -- the same cards the tab's [모두 적용] applies. Person suggestions need a person to pick
// photos and are never written here. Tags are only ADDED: each photo's final tags are its current
// tags plus the suggested ones, de-duplicated and capped like every other tag edit. Writes go through
// the server's mediaCommand bulkTagAssets (one transaction per chunk, every copy of the file).
import { buildPlacePhotoGroups } from '../src/ui/archive-place-groups.js';
import { buildTagSuggestions, photoSuggestionKey } from '../src/ui/archive-tag-suggestions.js';
import { applyPhotoTagOperation, BULK_TAG_CHUNK_SIZE, joinPhotoTagTokens } from '../src/core/bulk-photo-tags.js';

const PROJECT_ID = 'metro-live-2918e';
const ROOT = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;
const COMMAND_URL = `https://asia-northeast3-${PROJECT_ID}.cloudfunctions.net/mediaCommand`;
const CALENDAR_IDS = (process.env.SUGGEST_CALENDAR_IDS || '')
  .split(',').map(value => value.trim()).filter(value => /^[a-z0-9_-]{1,60}$/i.test(value));
const APPLY = process.env.APPLY === '1';

if (!CALENDAR_IDS.length) {
  console.error('Set SUGGEST_CALENDAR_IDS (comma separated). Nothing is tagged implicitly.');
  process.exit(1);
}

function decode(value) {
  if (!value || typeof value !== 'object') return undefined;
  if ('stringValue' in value) return value.stringValue;
  if ('integerValue' in value) return Number(value.integerValue);
  if ('doubleValue' in value) return Number(value.doubleValue);
  if ('booleanValue' in value) return value.booleanValue;
  if ('nullValue' in value) return null;
  if ('arrayValue' in value) return (value.arrayValue.values || []).map(decode);
  if ('mapValue' in value) return Object.fromEntries(Object.entries(value.mapValue.fields || {}).map(([k, v]) => [k, decode(v)]));
  return undefined;
}
const decodeDoc = doc => ({
  id: decodeURIComponent(doc.name.split('/').pop()),
  ...Object.fromEntries(Object.entries(doc.fields || {}).map(([k, v]) => [k, decode(v)])),
});
async function listAll(path) {
  const out = [];
  let pageToken = '';
  do {
    const query = new URLSearchParams({ pageSize: '300' });
    if (pageToken) query.set('pageToken', pageToken);
    const response = await fetch(`${ROOT}/${path}?${query}`);
    if (!response.ok) throw new Error(`list failed ${path}: ${response.status}`);
    const payload = await response.json();
    (payload.documents || []).forEach(doc => out.push(decodeDoc(doc)));
    pageToken = payload.nextPageToken || '';
  } while (pageToken);
  return out;
}
async function readCalendar(calendarId) {
  const response = await fetch(`${ROOT}/calendars/cal_${calendarId}`);
  if (!response.ok) throw new Error(`calendar read failed: ${response.status}`);
  return decodeDoc(await response.json()).calendar || {};
}

// Same date grammar as app-main parseFlexibleDateTokens (YYMMDD, YYYYMMDD, YY.MM.DD, YYYY년 M월 D일).
function parseDates(text) {
  const source = String(text || '').replace(/[()[\]{}'"“”‘’]/g, ' ');
  const dates = new Set();
  const push = (yearRaw, monthRaw, dayRaw) => {
    let year = Number(yearRaw);
    const month = Number(monthRaw);
    const day = Number(dayRaw);
    if (year < 100) year += 2000;
    if (year < 2000 || year > 2099 || month < 1 || month > 12 || day < 1 || day > 31) return;
    const check = new Date(year, month - 1, day);
    if (check.getFullYear() !== year || check.getMonth() !== month - 1 || check.getDate() !== day) return;
    dates.add(`${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`);
  };
  source.replace(/(?:^|[^\d])(\d{2,4})\s*[.\-/]\s*(\d{1,2})\s*[.\-/]\s*(\d{1,2})(?=$|[^\d])/g, (m, y, mo, d) => { push(y, mo, d); return m; });
  source.replace(/(?:^|[^\d])(\d{2,4})\s*년\s*(\d{1,2})\s*월\s*(\d{1,2})\s*일?/g, (m, y, mo, d) => { push(y, mo, d); return m; });
  source.replace(/(?:^|[^\d])(\d{4})(\d{2})(\d{2})(?=$|[^\d])/g, (m, y, mo, d) => { push(y, mo, d); return m; });
  source.replace(/(?:^|[^\d])(\d{2})(\d{2})(\d{2})(?=$|[^\d])/g, (m, y, mo, d) => { push(y, mo, d); return m; });
  return Array.from(dates);
}

async function run(calendarId) {
  const base = `calendars/cal_${calendarId}`;
  const [index, places, calendar] = await Promise.all([listAll(`${base}/photoIndex`), listAll(`${base}/places`), readCalendar(calendarId)]);
  const photos = index.filter(row => row.full || row.thumb);
  const livePlaces = places.filter(place => !place.deletedAt);
  const getPhotoDates = photo => parseDates(photo?.tags || '');
  const placeGroups = buildPlacePhotoGroups({
    places: livePlaces,
    photos,
    getPhotoDates: photo => {
      const meetingDate = String(photo?.meetingDate || '').slice(0, 10);
      const dates = getPhotoDates(photo);
      return /^\d{4}-\d{2}-\d{2}$/.test(meetingDate) ? [meetingDate, ...dates] : dates;
    },
    // Conservative subset of the app's doesPlaceMatchDate: an explicit visitDate only.
    doesPlaceMatchDate: (place, date) => String(place?.visitDate || '').slice(0, 10) === date,
  });
  const people = [
    ...(calendar.participants || []).filter(p => p && !p.deletedAt && !p.removedAt).map(p => p.name),
    ...(calendar.customPersonTags || []),
  ];
  const suggestions = buildTagSuggestions({ photos, places: livePlaces, placeGroups, getPhotoDates, personLabels: people });

  const byKey = new Map();
  suggestions.groups.forEach(group => group.photos.forEach(photo => {
    const key = photoSuggestionKey(photo);
    const prev = byKey.get(key) || { photo, before: joinPhotoTagTokens(photo.tags || ''), tags: joinPhotoTagTokens(photo.tags || ''), added: [] };
    const next = applyPhotoTagOperation(prev.tags, 'add', group.tag);
    if (next.changed) { prev.tags = joinPhotoTagTokens(next.tags); prev.added.push(group.tag); }
    byKey.set(key, prev);
  }));
  const changes = Array.from(byKey.values()).filter(change => change.added.length);
  const result = {
    calendarId,
    photos: photos.length,
    cards: suggestions.groups.map(group => `${group.tag} (${group.rules.join('+')}) ${group.photos.length}`),
    photosToTag: changes.length,
    skippedAtTagLimit: Array.from(byKey.values()).filter(change => !change.added.length).length,
    applied: 0,
    failed: 0,
  };
  if (!APPLY) return result;
  const items = changes.map(({ photo, tags }) => ({
    imageUrl: String(photo.full || photo.thumb || ''),
    thumbUrl: String(photo.thumb || photo.full || ''),
    messageId: String(photo.messageId || photo.sourceMessageId || ''),
    memoId: String(photo.source === 'memo' ? photo.messageId || '' : ''),
    directMediaUrl: String(photo.directMediaUrl || ''),
    tags,
  }));
  for (let offset = 0; offset < items.length; offset += BULK_TAG_CHUNK_SIZE) {
    const chunk = items.slice(offset, offset + BULK_TAG_CHUNK_SIZE);
    const response = await fetch(COMMAND_URL, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ calendarId, op: 'bulkTagAssets', items: chunk }),
    });
    const payload = await response.json().catch(() => ({}));
    if (response.ok && payload?.ok !== false) result.applied += chunk.length;
    else { result.failed += chunk.length; console.error(`[${calendarId}] chunk failed`, response.status, payload); }
  }
  return result;
}

const reports = [];
for (const calendarId of CALENDAR_IDS) reports.push(await run(calendarId));
console.log(JSON.stringify({ apply: APPLY, reports }, null, 2));
