// Undo 보관함 bulk "deletes" that only soft-deleted meeting-album copies. DRY RUN by default.
//
//   RESTORE_CALENDAR_IDS=jhair npm run ops:restore-archive-deleted-photos             # report
//   RESTORE_CALENDAR_IDS=jhair APPLY=1 npm run ops:restore-archive-deleted-photos     # write (after ops:export)
//
// Until 2026-10-02 the 보관함 인물 tab's 삭제 ran the bulk photo delete. For a photo that came
// from a meeting album it only set `deletedAt` on the album copy, so the photo left 추억 while it
// stayed in its message and in photoIndex. 보관함 actions must only take a photo out of a
// classification; real deletion is the lightbox's single-photo delete. This clears `deletedAt`
// on album copies whose file is still owned by a message/memo or still has a photoIndex row (a
// lightbox delete removes those too, so such a copy was never a real deletion).
//
// Each meeting document is patched on its raw Firestore fields (types kept as stored) with an
// updateTime precondition, so a concurrent edit makes the write fail instead of being lost.
import { normalizePhotoAssetUrl } from '../src/core/photo-asset.js';

const PROJECT_ID = 'metro-live-2918e';
const ROOT = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;
const CALENDAR_IDS = (process.env.RESTORE_CALENDAR_IDS || '')
  .split(',').map(value => value.trim()).filter(value => /^[a-z0-9_-]{1,60}$/i.test(value));
const APPLY = process.env.APPLY === '1';

if (!CALENDAR_IDS.length) {
  console.error('Set RESTORE_CALENDAR_IDS (comma separated). Nothing is changed implicitly.');
  process.exit(1);
}

async function listRaw(path) {
  const out = [];
  let pageToken = '';
  do {
    const query = new URLSearchParams({ pageSize: '300' });
    if (pageToken) query.set('pageToken', pageToken);
    const response = await fetch(`${ROOT}/${path}?${query}`);
    if (!response.ok) throw new Error(`list failed ${path}: ${response.status}`);
    const payload = await response.json();
    out.push(...(payload.documents || []));
    pageToken = payload.nextPageToken || '';
  } while (pageToken);
  return out;
}

const str = value => (value && typeof value.stringValue === 'string' ? value.stringValue : '');
const arr = value => (value && value.arrayValue ? value.arrayValue.values || [] : []);
const norm = url => normalizePhotoAssetUrl(String(url || ''));
const docUrls = fields => {
  const many = arr(fields.imageUrls).map(str).filter(Boolean);
  return many.length ? many : [str(fields.imageUrl)].filter(Boolean);
};

async function restoreCalendar(calendarId) {
  const base = `calendars/cal_${calendarId}`;
  const [meetings, messages, memos, index] = await Promise.all(
    ['confirmedMeetings', 'messages', 'memos', 'photoIndex'].map(name => listRaw(`${base}/${name}`))
  );
  const live = new Set();
  [...messages, ...memos].forEach(doc => docUrls(doc.fields || {}).forEach(url => live.add(norm(url))));
  index.forEach(doc => live.add(norm(str(doc.fields?.full))));

  const result = { calendarId, meetingsToPatch: 0, photosToRestore: 0, applied: 0, failed: 0, failures: [], meetings: [] };
  for (const doc of meetings) {
    const photos = arr(doc.fields?.photos);
    const restored = [];
    const nextPhotos = photos.map(photo => {
      const fields = photo.mapValue?.fields || {};
      if (!fields.deletedAt || fields.deletedAt.nullValue !== undefined) return photo;
      const url = str(fields.imageUrl) || str(fields.full) || str(fields.url);
      if (!live.has(norm(url))) return photo; // a completed deletion: leave it
      const { deletedAt: _deletedAt, ...rest } = fields;
      restored.push(String(url).replace(/^.*%2F/, '').split('?')[0]);
      return { mapValue: { fields: rest } };
    });
    if (!restored.length) continue;
    result.meetingsToPatch += 1;
    result.photosToRestore += restored.length;
    result.meetings.push({ meeting: decodeURIComponent(doc.name.split('/').pop()), restored: restored.length });
    if (!APPLY) continue;
    const query = new URLSearchParams();
    query.append('updateMask.fieldPaths', 'photos');
    query.append('updateMask.fieldPaths', 'updatedAt');
    query.append('currentDocument.updateTime', doc.updateTime);
    const response = await fetch(`https://firestore.googleapis.com/v1/${doc.name}?${query}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ fields: { photos: { arrayValue: { values: nextPhotos } }, updatedAt: { integerValue: String(Date.now()) } } }),
    });
    if (response.ok) result.applied += restored.length;
    else {
      result.failed += restored.length;
      result.failures.push({ meeting: doc.name.split('/').pop(), status: response.status, body: (await response.text()).slice(0, 300) });
    }
  }
  return result;
}

const reports = [];
for (const calendarId of CALENDAR_IDS) reports.push(await restoreCalendar(calendarId));
console.log(JSON.stringify({ apply: APPLY, reports }, null, 2));
