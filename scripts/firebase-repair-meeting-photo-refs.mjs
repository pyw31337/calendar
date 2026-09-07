const PROJECT_ID = 'metro-live-2918e';
const DATABASE = '(default)';
const ROOT = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/${DATABASE}/documents`;
const CALENDAR_IDS = (process.env.REPAIR_CALENDAR_IDS || 'kkot,cw,jhair')
  .split(',').map(value => value.trim()).filter(value => /^[a-z0-9_-]{1,60}$/i.test(value));
const APPLY = process.env.APPLY === '1';

function decode(value) {
  if (!value || typeof value !== 'object') return undefined;
  if ('stringValue' in value) return value.stringValue;
  if ('integerValue' in value) return Number(value.integerValue);
  if ('doubleValue' in value) return Number(value.doubleValue);
  if ('booleanValue' in value) return value.booleanValue;
  if ('nullValue' in value) return null;
  if ('arrayValue' in value) return (value.arrayValue.values || []).map(decode);
  if ('mapValue' in value) return Object.fromEntries(Object.entries(value.mapValue.fields || {}).map(([key, nested]) => [key, decode(nested)]));
  return undefined;
}

function encode(value) {
  if (value === null || value === undefined) return { nullValue: null };
  if (typeof value === 'string') return { stringValue: value };
  if (typeof value === 'boolean') return { booleanValue: value };
  if (typeof value === 'number') return Number.isInteger(value) ? { integerValue: String(value) } : { doubleValue: value };
  if (Array.isArray(value)) return { arrayValue: value.length ? { values: value.map(encode) } : {} };
  if (typeof value === 'object') {
    return { mapValue: { fields: Object.fromEntries(Object.entries(value).map(([key, nested]) => [key, encode(nested)])) } };
  }
  return { stringValue: String(value) };
}

function isRenderableImageUrl(value) {
  if (typeof value !== 'string' || !value.trim()) return false;
  const candidate = value.trim();
  if (/^data:image\//i.test(candidate)) {
    const match = candidate.match(/^data:image\/[a-z0-9.+-]+;base64,([a-z0-9+/]*={0,2})$/i);
    if (!match || !match[1] || match[1].length % 4 === 1) return false;
    try { atob(match[1]); return true; } catch (_) { return false; }
  }
  if (!/^https?:\/\//i.test(candidate)) return false;
  try { return Boolean(new URL(candidate).hostname); } catch (_) { return false; }
}

async function list(path) {
  const documents = [];
  let pageToken = '';
  do {
    const query = new URLSearchParams({ pageSize: '300' });
    if (pageToken) query.set('pageToken', pageToken);
    const response = await fetch(`${ROOT}/${path}?${query}`, { cache: 'no-store' });
    if (!response.ok) throw new Error(`list failed for ${path}: ${response.status} ${await response.text()}`);
    const payload = await response.json();
    documents.push(...(payload.documents || []));
    pageToken = payload.nextPageToken || '';
  } while (pageToken);
  return documents;
}

async function getSourceMessage(calendarId, sourceMessageId, cache) {
  if (!sourceMessageId) return null;
  const key = `${calendarId}:${sourceMessageId}`;
  if (cache.has(key)) return cache.get(key);
  const response = await fetch(`${ROOT}/calendars/cal_${calendarId}/messages/${encodeURIComponent(sourceMessageId)}`, { cache: 'no-store' });
  if (response.status === 404) {
    cache.set(key, null);
    return null;
  }
  if (!response.ok) throw new Error(`source read failed for ${key}: ${response.status} ${await response.text()}`);
  const doc = await response.json();
  const decoded = Object.fromEntries(Object.entries(doc.fields || {}).map(([field, value]) => [field, decode(value)]));
  cache.set(key, decoded);
  return decoded;
}

function sourceImageAt(message, index) {
  if (!message) return '';
  const images = Array.isArray(message.imageUrls) && message.imageUrls.length ? message.imageUrls : [message.imageUrl];
  return typeof images[index] === 'string' ? images[index] : '';
}

async function patchPhotos(doc, photos) {
  const updateTime = doc.updateTime || '';
  if (!updateTime) throw new Error(`refusing unguarded update for ${doc.name}`);
  const query = new URLSearchParams({
    'updateMask.fieldPaths': 'photos',
    'currentDocument.updateTime': updateTime
  });
  const response = await fetch(`https://firestore.googleapis.com/v1/${doc.name}?${query}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields: { photos: encode(photos) } })
  });
  if (!response.ok) throw new Error(`guarded patch failed for ${doc.name}: ${response.status} ${await response.text()}`);
  return response.json();
}

const sourceCache = new Map();
const repairs = [];
for (const calendarId of CALENDAR_IDS) {
  const docs = await list(`calendars/cal_${calendarId}/confirmedMeetings`);
  for (const doc of docs) {
    const fields = Object.fromEntries(Object.entries(doc.fields || {}).map(([field, value]) => [field, decode(value)]));
    const photos = Array.isArray(fields.photos) ? fields.photos : [];
    let changed = false;
    const nextPhotos = [];
    for (const photo of photos) {
      if (!photo || typeof photo !== 'object') {
        nextPhotos.push(photo);
        continue;
      }
      const invalidFields = ['imageUrl', 'thumbUrl'].filter(field => photo[field] && !isRenderableImageUrl(photo[field]));
      if (!invalidFields.length) {
        nextPhotos.push(photo);
        continue;
      }
      const cleaned = { ...photo };
      invalidFields.forEach(field => delete cleaned[field]);
      const source = await getSourceMessage(calendarId, photo.sourceMessageId, sourceCache);
      const sourceUrl = sourceImageAt(source, Number(photo.sourceImageIndex || 0));
      repairs.push({
        calendarId,
        meetingDate: fields.date || doc.name.split('/').pop(),
        photoId: photo.id || '',
        removedFields: invalidFields,
        sourceMessageId: photo.sourceMessageId || '',
        sourceRenderable: isRenderableImageUrl(sourceUrl)
      });
      nextPhotos.push(cleaned);
      changed = true;
    }
    if (changed && APPLY) await patchPhotos(doc, nextPhotos);
  }
}

console.log(JSON.stringify({
  ok: true,
  mode: APPLY ? 'applied' : 'dry-run',
  repairedPhotoRecords: repairs.length,
  sourceRecoverable: repairs.filter(item => item.sourceRenderable).length,
  metadataOnly: repairs.filter(item => !item.sourceRenderable).length,
  repairs
}, null, 2));

if (!APPLY && repairs.length) {
  console.log('Dry run only. Re-run with APPLY=1 after creating a production export backup.');
}
