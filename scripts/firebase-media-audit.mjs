const PROJECT_ID = 'metro-live-2918e';
const DATABASE = '(default)';
const ROOT = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/${DATABASE}/documents`;
const CALENDAR_IDS = (process.env.AUDIT_CALENDAR_IDS || 'kkot,cw,jhair')
  .split(',').map(value => value.trim()).filter(Boolean);

function isRenderableImageUrl(value) {
  if (typeof value !== 'string' || !value.trim()) return false;
  const candidate = value.trim();
  if (/^data:image\//i.test(candidate)) {
    const match = candidate.match(/^data:image\/[a-z0-9.+-]+;base64,([a-z0-9+/]*={0,2})$/i);
    if (!match || !match[1] || match[1].length % 4 === 1) return false;
    try { atob(match[1]); return true; } catch (_) { return false; }
  }
  if (!/^https?:\/\//i.test(candidate)) return false;
  try { const parsed = new URL(candidate); return Boolean(parsed.hostname); } catch (_) { return false; }
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

async function list(path) {
  const documents = [];
  let pageToken = '';
  do {
    const query = new URLSearchParams({ pageSize: '300' });
    if (pageToken) query.set('pageToken', pageToken);
    const response = await fetch(`${ROOT}/${path}?${query}`);
    if (!response.ok) throw new Error(`media audit fetch failed: ${response.status} ${await response.text()}`);
    const payload = await response.json();
    documents.push(...(payload.documents || []));
    pageToken = payload.nextPageToken || '';
  } while (pageToken);
  return documents;
}

function inspectRecord(record, kind, id, result) {
  const candidates = [];
  for (const key of ['imageUrl', 'thumbUrl']) if (record[key]) candidates.push([key, record[key]]);
  for (const key of ['imageUrls', 'thumbUrls']) if (Array.isArray(record[key])) record[key].forEach((url, index) => candidates.push([`${key}[${index}]`, url]));
  candidates.forEach(([field, url]) => {
    if (!isRenderableImageUrl(url)) result.invalid.push({ kind, id, field, preview: String(url || '').slice(0, 80) });
  });
}

const result = { scope: CALENDAR_IDS, scannedCalendars: 0, invalid: [], scannedMessages: 0, scannedMemos: 0, scannedMeetings: 0, scannedMeetingPhotos: 0 };
for (const calendarId of CALENDAR_IDS) {
  const documentResponse = await fetch(`${ROOT}/calendars/cal_${encodeURIComponent(calendarId)}`);
  if (documentResponse.status === 404) continue;
  if (!documentResponse.ok) throw new Error(`media audit fetch failed for ${calendarId}: ${documentResponse.status} ${await documentResponse.text()}`);
  const document = await documentResponse.json();
  result.scannedCalendars += 1;
  inspectRecord(decode(document.fields?.calendar) || {}, 'calendar', calendarId, result);
  const messages = await list(`calendars/cal_${encodeURIComponent(calendarId)}/messages`);
  const memos = await list(`calendars/cal_${encodeURIComponent(calendarId)}/memos`);
  result.scannedMessages += messages.length;
  result.scannedMemos += memos.length;
  const meetings = await list(`calendars/cal_${encodeURIComponent(calendarId)}/confirmedMeetings`);
  result.scannedMeetings += meetings.length;
  messages.forEach(item => inspectRecord(decode(item.fields) || {}, 'message', item.name.split('/').pop(), result));
  memos.forEach(item => inspectRecord(decode(item.fields) || {}, 'memo', item.name.split('/').pop(), result));
  meetings.forEach(item => {
    const meeting = decode(item.fields) || {};
    const photos = Array.isArray(meeting.photos) ? meeting.photos : [];
    result.scannedMeetingPhotos += photos.length;
    photos.forEach((photo, index) => inspectRecord(photo || {}, 'meetingPhoto', `${item.name.split('/').pop()}[${index}]`, result));
  });
}
console.log(JSON.stringify({ ...result, invalidCount: result.invalid.length }, null, 2));
if (result.invalid.length) process.exitCode = 1;
