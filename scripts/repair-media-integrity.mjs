// P1 data repair for meeting albums (docs/data-architecture-v3.md §4). DRY RUN by default.
//
//   REPAIR_CALENDAR_IDS=cw npm run ops:integrity-repair            # report only
//   REPAIR_CALENDAR_IDS=cw APPLY=1 npm run ops:integrity-repair    # write (after ops:export backup)
//
// For every confirmedMeetings/{date} document:
//   1. drop album entries whose original AND thumbnail files are gone from Storage (404) --
//      these render as broken thumbnails in 일정/갤러리/추억;
//   2. reset each album copy's tags to the owning chat/gallery message's current tags for the
//      same file (imageTagMap by asset key first, then the positional imageTags mirror) -- the
//      copies drifted and made 인물/추억 disagree with 채팅/갤러리.
// Messages that still reference missing files are REPORTED by default. With REPAIR_MESSAGES=1 the
// dead slots are removed (imageUrls/thumbUrls/imageTags stay aligned, imageTagMap entry dropped),
// a message whose only content was that photo ("갤러리 사진"/"일정 사진" placeholder) is deleted,
// and every meeting album reference into that message by position is renumbered.
//
// Every write is a guarded PATCH (currentDocument.updateTime), so a meeting edited by someone
// between the read and the write is skipped, never overwritten.
import { canonicalPhotoAssetKey } from '../src/core/photo-asset.js';

const PROJECT_ID = 'metro-live-2918e';
const ROOT = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;
const CALENDAR_IDS = (process.env.REPAIR_CALENDAR_IDS || '')
  .split(',').map(value => value.trim()).filter(value => /^[a-z0-9_-]{1,60}$/i.test(value));
const APPLY = process.env.APPLY === '1';
const REPAIR_MESSAGES = process.env.REPAIR_MESSAGES === '1';
const PLACEHOLDER_TEXTS = new Set(['', '갤러리 사진', '일정 사진', '사진']);

if (!CALENDAR_IDS.length) {
  console.error('Set REPAIR_CALENDAR_IDS (comma separated). Nothing is repaired implicitly.');
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
function encode(value) {
  if (value === null || value === undefined) return { nullValue: null };
  if (typeof value === 'string') return { stringValue: value };
  if (typeof value === 'boolean') return { booleanValue: value };
  if (typeof value === 'number') return Number.isInteger(value) ? { integerValue: String(value) } : { doubleValue: value };
  if (Array.isArray(value)) return { arrayValue: value.length ? { values: value.map(encode) } : {} };
  if (typeof value === 'object') return { mapValue: { fields: Object.fromEntries(Object.entries(value).map(([k, v]) => [k, encode(v)])) } };
  return { stringValue: String(value) };
}
const fieldsOf = doc => Object.fromEntries(Object.entries(doc.fields || {}).map(([k, v]) => [k, decode(v)]));

async function listRaw(path) {
  const out = [];
  let pageToken = '';
  do {
    const query = new URLSearchParams({ pageSize: '300' });
    if (pageToken) query.set('pageToken', pageToken);
    const response = await fetch(`${ROOT}/${path}?${query}`, { cache: 'no-store' });
    if (!response.ok) throw new Error(`list failed ${path}: ${response.status}`);
    const payload = await response.json();
    out.push(...(payload.documents || []));
    pageToken = payload.nextPageToken || '';
  } while (pageToken);
  return out;
}

const norm = url => String(url || '').split('?')[0];
const storage = new Map();
const fileExists = url => {
  const key = norm(url);
  if (!key || !/firebasestorage/.test(key)) return Promise.resolve(true);
  if (!storage.has(key)) storage.set(key, fetch(key).then(res => res.status !== 404).catch(() => true));
  return storage.get(key);
};

// file (normalized original or thumb URL) -> canonical tags from the owning message
function buildCanonicalTagIndex(messages) {
  const byUrl = new Map();
  messages.forEach(doc => {
    const m = fieldsOf(doc);
    const urls = Array.isArray(m.imageUrls) && m.imageUrls.length ? m.imageUrls : (m.imageUrl ? [m.imageUrl] : []);
    const thumbs = Array.isArray(m.thumbUrls) && m.thumbUrls.length ? m.thumbUrls : (m.thumbUrl ? [m.thumbUrl] : []);
    const map = m.imageTagMap && typeof m.imageTagMap === 'object' && !Array.isArray(m.imageTagMap) ? m.imageTagMap : {};
    const tags = Array.isArray(m.imageTags) ? m.imageTags : [];
    urls.forEach((url, index) => {
      const key = canonicalPhotoAssetKey({ full: url, thumb: thumbs[index] });
      const hasMap = key && Object.prototype.hasOwnProperty.call(map, key);
      const hasPositional = Object.prototype.hasOwnProperty.call(tags, index);
      if (!hasMap && !hasPositional) return;
      const value = String(hasMap ? map[key] : tags[index] || '');
      const owner = `${doc.name.split('/').pop()}:${index}`;
      [url, thumbs[index]].filter(Boolean).forEach(u => byUrl.set(norm(u), { tags: value, owner }));
    });
  });
  return byUrl;
}

async function guardedPatchPhotos(doc, photos) {
  if (!doc.updateTime) throw new Error(`refusing unguarded update for ${doc.name}`);
  const query = new URLSearchParams({ 'updateMask.fieldPaths': 'photos', 'currentDocument.updateTime': doc.updateTime });
  const response = await fetch(`https://firestore.googleapis.com/v1/${doc.name}?${query}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields: { photos: encode(photos) } }),
  });
  if (response.status === 400 || response.status === 409 || response.status === 412) return { skipped: true, status: response.status };
  if (!response.ok) throw new Error(`guarded patch failed ${doc.name}: ${response.status} ${await response.text()}`);
  return { skipped: false };
}

const summary = [];
for (const calendarId of CALENDAR_IDS) {
  const base = `calendars/cal_${calendarId}`;
  const [meetingDocs, messageDocs] = await Promise.all([listRaw(`${base}/confirmedMeetings`), listRaw(`${base}/messages`)]);
  const canonical = buildCanonicalTagIndex(messageDocs);
  const result = { calendarId, mode: APPLY ? 'applied' : 'dry-run', meetingsScanned: meetingDocs.length, meetingsChanged: 0, meetingsSkippedConcurrent: 0, albumEntriesRemoved: 0, albumTagCopiesReset: 0, tagConflictsLeftAlone: 0, messageRefsToMissingFiles: 0, samples: [] };

  for (const doc of meetingDocs) {
    const fields = fieldsOf(doc);
    const photos = Array.isArray(fields.photos) ? fields.photos : [];
    const next = [];
    let changed = false;
    for (const photo of photos) {
      if (!photo || typeof photo !== 'object') { next.push(photo); continue; }
      const full = photo.imageUrl || photo.full || photo.url || '';
      const thumb = photo.thumbUrl || photo.thumb || '';
      if ((full || thumb) && !(await fileExists(full)) && !(await fileExists(thumb || full))) {
        result.albumEntriesRemoved += 1;
        if (result.samples.length < 12) result.samples.push(`remove ${fields.date || doc.name.split('/').pop()} ${norm(full).replace(/^.*%2F/, '')}`);
        changed = true;
        continue;
      }
      const source = canonical.get(norm(full)) || canonical.get(norm(thumb));
      const tokens = value => new Set(String(value || '').split(/[,\s#]+/).filter(Boolean));
      const albumTokens = tokens(photo.tags);
      const sourceTokens = tokens(source?.tags);
      // Album entries without a message link take tag edits on the meeting itself, so there the
      // album may hold the NEWER edit. Only reset when the message is provably authoritative:
      // the entry routes its edits to that message, or its tags are a subset of the message's.
      const linked = source && photo.sourceMessageId && source.owner.startsWith(`${photo.sourceMessageId}:`);
      const subset = source && [...albumTokens].every(token => sourceTokens.has(token));
      if (source && String(photo.tags || '') !== source.tags && !linked && !subset) {
        result.tagConflictsLeftAlone += 1;
      } else if (source && String(photo.tags || '') !== source.tags) {
        result.albumTagCopiesReset += 1;
        if (result.samples.length < 12) result.samples.push(`retag ${fields.date || ''} [${photo.tags || ''}] -> [${source.tags}]`);
        next.push({ ...photo, tags: source.tags });
        changed = true;
        continue;
      }
      next.push(photo);
    }
    if (!changed) continue;
    result.meetingsChanged += 1;
    if (APPLY) {
      const outcome = await guardedPatchPhotos(doc, next);
      if (outcome.skipped) { result.meetingsChanged -= 1; result.meetingsSkippedConcurrent += 1; }
    }
  }

  // Re-read meetings: step 1 may just have rewritten them.
  const liveMeetings = REPAIR_MESSAGES ? await listRaw(`${base}/confirmedMeetings`) : meetingDocs;
  result.messagesSlotRepaired = 0;
  result.messagesDeleted = 0;
  result.meetingRefsRenumbered = 0;
  result.meetingRefsAlreadyMisaligned = 0;
  for (const doc of messageDocs) {
    const m = fieldsOf(doc);
    const urls = [...(m.imageUrls || []), ...(m.thumbUrls || []), m.imageUrl, m.thumbUrl].filter(Boolean);
    for (const url of new Set(urls.map(norm))) if (!(await fileExists(url))) result.messageRefsToMissingFiles += 1;
    if (!REPAIR_MESSAGES) continue;
    const imageUrls = Array.isArray(m.imageUrls) && m.imageUrls.length ? m.imageUrls : (m.imageUrl ? [m.imageUrl] : []);
    const thumbUrls = Array.isArray(m.thumbUrls) && m.thumbUrls.length ? m.thumbUrls : (m.thumbUrl ? [m.thumbUrl] : []);
    const slots = Math.max(imageUrls.length, thumbUrls.length);
    const dead = [];
    for (let index = 0; index < slots; index += 1) {
      const full = imageUrls[index] || '';
      const thumb = thumbUrls[index] || full;
      if ((full || thumb) && !(await fileExists(full || thumb)) && !(await fileExists(thumb))) dead.push(index);
    }
    if (!dead.length) continue;
    const messageId = doc.name.split('/').pop();
    const deadSet = new Set(dead);
    const keep = index => !deadSet.has(index);
    const nextUrls = imageUrls.filter((_, i) => keep(i));
    const nextThumbs = thumbUrls.filter((_, i) => keep(i));
    const nextTags = (Array.isArray(m.imageTags) ? m.imageTags : []).filter((_, i) => keep(i));
    const deadKeys = new Set(dead.map(i => canonicalPhotoAssetKey({ full: imageUrls[i], thumb: thumbUrls[i] })).filter(Boolean));
    const nextMap = Object.fromEntries(Object.entries(m.imageTagMap && typeof m.imageTagMap === 'object' && !Array.isArray(m.imageTagMap) ? m.imageTagMap : {}).filter(([key]) => !deadKeys.has(key)));
    const onlyPlaceholder = !nextUrls.length && !nextThumbs.length && PLACEHOLDER_TEXTS.has(String(m.text || '').trim())
      && !(Array.isArray(m.fileAttachments) && m.fileAttachments.length);
    // New position of an old slot: old index minus the number of removed slots before it.
    const shift = oldIndex => oldIndex - dead.filter(d => d < oldIndex).length;
    const meetingPatches = [];
    for (const meetingDoc of liveMeetings) {
      const mf = fieldsOf(meetingDoc);
      const photos = Array.isArray(mf.photos) ? mf.photos : [];
      let touched = false;
      const nextPhotos = [];
      photos.forEach(photo => {
        if (!photo || photo.sourceMessageId !== messageId || !Number.isInteger(photo.sourceImageIndex)) { nextPhotos.push(photo); return; }
        if (deadSet.has(photo.sourceImageIndex) || onlyPlaceholder) { touched = true; return; }
        // Prefer the slot that actually holds this entry's file; positional refs were found to be
        // misaligned already, and a pure shift would carry that error forward.
        const byFile = nextUrls.findIndex((url, i) => norm(url) === norm(photo.imageUrl || photo.full || '') || norm(nextThumbs[i]) === norm(photo.thumbUrl || photo.thumb || ''));
        const shifted = shift(photo.sourceImageIndex);
        if (byFile >= 0 && byFile !== shifted) result.meetingRefsAlreadyMisaligned += 1;
        const moved = byFile >= 0 ? byFile : shifted;
        if (moved !== photo.sourceImageIndex) { touched = true; result.meetingRefsRenumbered += 1; nextPhotos.push({ ...photo, sourceImageIndex: moved }); return; }
        nextPhotos.push(photo);
      });
      if (touched) meetingPatches.push([meetingDoc, nextPhotos]);
    }
    if (result.samples.length < 12) result.samples.push(`${onlyPlaceholder ? 'delete' : 'trim'} message ${messageId} dead slots [${dead.join(',')}] of ${slots}; meeting docs to renumber: ${meetingPatches.length}`);
    if (onlyPlaceholder) result.messagesDeleted += 1; else result.messagesSlotRepaired += 1;
    if (!APPLY) continue;
    if (onlyPlaceholder) {
      const query = new URLSearchParams({ 'currentDocument.updateTime': doc.updateTime });
      const res = await fetch(`https://firestore.googleapis.com/v1/${doc.name}?${query}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(`guarded delete failed ${doc.name}: ${res.status} ${await res.text()}`);
    } else {
      const fields = { imageUrls: nextUrls, thumbUrls: nextThumbs, imageTags: nextTags, imageTagMap: nextMap, imageUrl: nextUrls[0] || nextThumbs[0] || null, thumbUrl: nextThumbs[0] || nextUrls[0] || null };
      const query = new URLSearchParams({ 'currentDocument.updateTime': doc.updateTime });
      Object.keys(fields).forEach(field => query.append('updateMask.fieldPaths', field));
      const res = await fetch(`https://firestore.googleapis.com/v1/${doc.name}?${query}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields: Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, encode(v)])) }),
      });
      if (!res.ok) throw new Error(`guarded message patch failed ${doc.name}: ${res.status} ${await res.text()}`);
    }
    for (const [meetingDoc, nextPhotos] of meetingPatches) {
      const outcome = await guardedPatchPhotos(meetingDoc, nextPhotos);
      if (outcome.skipped) throw new Error(`meeting ${meetingDoc.name} changed concurrently after message ${messageId} was repaired -- restore from backup and re-run`);
    }
  }
  summary.push(result);
}

console.log(JSON.stringify({ generatedAt: new Date().toISOString(), summary }, null, 2));
if (!APPLY) console.log('Dry run only. Back up first (npm run ops:export), then re-run with APPLY=1.');
