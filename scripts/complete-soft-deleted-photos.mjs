// Finish photo deletions that only reached the meeting album. DRY RUN by default.
//
//   COMPLETE_CALENDAR_IDS=jhair npm run ops:complete-soft-deleted-photos              # report
//   COMPLETE_CALENDAR_IDS=jhair APPLY=1 npm run ops:complete-soft-deleted-photos      # write (after ops:export)
//
// Before 2026-10-02 the 보관함 bulk delete marked a meeting-album copy `deletedAt` and stopped
// there for photos whose source was the album, so the same file stayed in its owning message and
// in photoIndex and came back in 갤러리/보관함 (e.g. 분류 필요) on the next load. Each photo found
// here is deleted through the server's mediaCommand deleteAsset, the same transaction that
// removes the file from every message/memo slot and album copy at once (Storage files only go to
// the 7-day storageGc queue).
//
// By default only photos whose every album copy is deleted are completed. INCLUDE_PARTIAL=1 also
// completes photos that are deleted in one album but still live in another one (the reader
// deleted the photo itself from a de-duplicated 보관함 view).
import { normalizePhotoAssetUrl } from '../src/core/photo-asset.js';

const PROJECT_ID = 'metro-live-2918e';
const ROOT = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;
const COMMAND_URL = `https://us-central1-${PROJECT_ID}.cloudfunctions.net/mediaCommand`;
const CALENDAR_IDS = (process.env.COMPLETE_CALENDAR_IDS || '')
  .split(',').map(value => value.trim()).filter(value => /^[a-z0-9_-]{1,60}$/i.test(value));
const APPLY = process.env.APPLY === '1';
const INCLUDE_PARTIAL = process.env.INCLUDE_PARTIAL === '1';

if (!CALENDAR_IDS.length) {
  console.error('Set COMPLETE_CALENDAR_IDS (comma separated). Nothing is changed implicitly.');
  process.exit(1);
}

function decode(value) {
  if (!value || typeof value !== 'object') return undefined;
  if ('stringValue' in value) return value.stringValue;
  if ('integerValue' in value) return Number(value.integerValue);
  if ('doubleValue' in value) return Number(value.doubleValue);
  if ('booleanValue' in value) return value.booleanValue;
  if ('nullValue' in value) return null;
  if ('timestampValue' in value) return value.timestampValue;
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

const norm = url => normalizePhotoAssetUrl(String(url || ''));
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const slotUrls = doc => (Array.isArray(doc.imageUrls) && doc.imageUrls.length ? doc.imageUrls : (doc.imageUrl ? [doc.imageUrl] : []));

async function deleteAsset(calendarId, asset) {
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const response = await fetch(COMMAND_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ calendarId, op: 'deleteAsset', asset }),
    });
    if (response.status === 429) { await sleep(15000 * (attempt + 1)); continue; }
    const body = await response.json().catch(() => ({}));
    return { ok: response.ok && body.ok === true, status: response.status, body };
  }
  return { ok: false, status: 429, body: {} };
}

async function completeCalendar(calendarId) {
  const base = `calendars/cal_${calendarId}`;
  const [meetings, messages, memos, index] = await Promise.all(
    ['confirmedMeetings', 'messages', 'memos', 'photoIndex'].map(name => listAll(`${base}/${name}`))
  );
  const albumCopies = new Map();
  meetings.forEach(meeting => (meeting.photos || []).forEach(photo => {
    const key = norm(photo.imageUrl || photo.full || photo.url);
    if (!key) return;
    const list = albumCopies.get(key) || [];
    list.push({ meeting: meeting.id, photo });
    albumCopies.set(key, list);
  }));
  const owners = new Map();
  const addOwner = (kind, doc) => slotUrls(doc).forEach((url, i) => {
    const key = norm(url);
    if (!key) return;
    const list = owners.get(key) || [];
    list.push({ kind, id: doc.id, url, thumb: (doc.thumbUrls || [])[i] || '' });
    owners.set(key, list);
  });
  messages.forEach(doc => addOwner('message', doc));
  memos.forEach(doc => addOwner('memo', doc));
  const indexByKey = new Map(index.map(row => [norm(row.full), row]));

  const plan = [];
  let skippedPartial = 0;
  albumCopies.forEach((copies, key) => {
    const deleted = copies.filter(c => c.photo.deletedAt != null);
    if (!deleted.length) return;
    const stillOwned = owners.get(key) || [];
    const row = indexByKey.get(key);
    if (!stillOwned.length && !row) return; // the deletion already reached every copy
    const live = copies.filter(c => c.photo.deletedAt == null);
    if (live.length && !INCLUDE_PARTIAL) { skippedPartial += 1; return; }
    const owner = stillOwned.find(o => o.kind === 'message') || null;
    const memo = stillOwned.find(o => o.kind === 'memo') || null;
    const sample = deleted[0].photo;
    plan.push({
      file: String(key).replace(/^.*%2F/, ''),
      deletedAt: new Date(Math.max(...deleted.map(c => Number(c.photo.deletedAt) || 0))).toISOString(),
      liveAlbums: live.map(c => c.meeting),
      asset: {
        imageUrl: String(owner?.url || memo?.url || row?.full || sample.imageUrl || ''),
        thumbUrl: String(owner?.thumb || memo?.thumb || row?.thumb || sample.thumbUrl || ''),
        messageId: owner?.id || '',
        memoId: memo?.id || '',
      },
    });
  });

  const result = { calendarId, toComplete: plan.length, skippedPartial, applied: 0, failed: 0, failures: [] };
  if (APPLY) {
    for (const item of plan) {
      const response = await deleteAsset(calendarId, item.asset);
      if (response.ok) result.applied += 1;
      else { result.failed += 1; result.failures.push({ file: item.file, status: response.status, reason: response.body?.reason || '' }); }
      // mediaCommand allows 60 calls per minute per IP.
      await sleep(1100);
    }
  } else {
    result.plan = plan.map(({ file, deletedAt, liveAlbums }) => ({ file, deletedAt, liveAlbums }));
  }
  return result;
}

const reports = [];
for (const calendarId of CALENDAR_IDS) reports.push(await completeCalendar(calendarId));
console.log(JSON.stringify({ apply: APPLY, includePartial: INCLUDE_PARTIAL, reports }, null, 2));
