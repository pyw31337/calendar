const PROJECT_ID = process.env.GATHER_PROJECT_ID || 'metro-live-2918e';
const DATABASE = '(default)';
const ROOT = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/${DATABASE}/documents`;
const CALENDAR_IDS = (process.env.AUDIT_CALENDAR_IDS || 'kkot,cw,jhair')
  .split(',').map(value => value.trim()).filter(Boolean);

function decode(value) {
  if (!value || typeof value !== 'object') return undefined;
  if ('stringValue' in value) return value.stringValue;
  if ('integerValue' in value) return Number(value.integerValue);
  if ('doubleValue' in value) return Number(value.doubleValue);
  if ('booleanValue' in value) return value.booleanValue;
  if ('nullValue' in value) return null;
  if ('timestampValue' in value) return Date.parse(value.timestampValue);
  if ('arrayValue' in value) return (value.arrayValue.values || []).map(decode);
  if ('mapValue' in value) return Object.fromEntries(Object.entries(value.mapValue.fields || {}).map(([key, child]) => [key, decode(child)]));
  return undefined;
}

function decodeDocument(document) {
  return {
    id: String(document?.name || '').split('/').pop(),
    ...Object.fromEntries(Object.entries(document?.fields || {}).map(([key, value]) => [key, decode(value)]))
  };
}

async function listCollection(calendarId, collection) {
  const documents = [];
  let pageToken = '';
  do {
    const query = new URLSearchParams({ pageSize: '300' });
    if (pageToken) query.set('pageToken', pageToken);
    const response = await fetch(`${ROOT}/calendars/cal_${encodeURIComponent(calendarId)}/${collection}?${query}`, { cache: 'no-store' });
    if (!response.ok) throw new Error(`${calendarId}/${collection}: ${response.status} ${await response.text()}`);
    const payload = await response.json();
    documents.push(...(payload.documents || []).map(decodeDocument));
    pageToken = payload.nextPageToken || '';
  } while (pageToken);
  return documents;
}

function normalizeAssetUrl(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  if (raw.startsWith('data:') || raw.startsWith('blob:')) return raw;
  try {
    const parsed = new URL(raw);
    parsed.hash = '';
    if (parsed.hostname === 'firebasestorage.googleapis.com' || parsed.hostname.endsWith('.firebasestorage.app')) parsed.search = '';
    return parsed.toString();
  } catch (_) {
    return raw.split('#')[0];
  }
}

function hashAssetIdentity(value) {
  const source = String(value || '');
  let fnv = 2166136261;
  let djb = 5381;
  for (let index = 0; index < source.length; index += 1) {
    const code = source.charCodeAt(index);
    fnv ^= code;
    fnv = Math.imul(fnv, 16777619);
    djb = Math.imul(djb, 33) ^ code;
  }
  return `${(fnv >>> 0).toString(36)}-${(djb >>> 0).toString(36)}-${source.length.toString(36)}`;
}

function assetKey(value) {
  const normalized = normalizeAssetUrl(value);
  return normalized ? `asset:v1:${hashAssetIdentity(normalized)}` : '';
}

function attachedImages(record) {
  const urls = Array.isArray(record.imageUrls) && record.imageUrls.length ? record.imageUrls : (record.imageUrl ? [record.imageUrl] : []);
  const thumbs = Array.isArray(record.thumbUrls) && record.thumbUrls.length ? record.thumbUrls : (record.thumbUrl ? [record.thumbUrl] : []);
  const tags = Array.isArray(record.imageTags) ? record.imageTags : [];
  return Array.from({ length: Math.max(urls.length, thumbs.length) }, (_, index) => ({
    index,
    full: urls[index] || thumbs[index] || '',
    thumb: thumbs[index] || urls[index] || '',
    tags: String(tags[index] || record.tags || '')
  })).filter(photo => photo.full || photo.thumb);
}

function directImages(record) {
  const text = String(record.text || record.content || record.body || '');
  const urls = text.match(/https?:\/\/[^\s<>"']+/gi) || [];
  const imageExtension = /\.(?:jpe?g|png|gif|webp|avif|bmp|svg|jfif|pjpeg|pjp|ico)(?:[?#].*)?$/i;
  const uploaded = new Set(attachedImages(record).flatMap(photo => [normalizeAssetUrl(photo.full), normalizeAssetUrl(photo.thumb)]));
  return Array.from(new Set(urls.map(url => url.replace(/[),.;!?]+$/, ''))))
    .filter(url => imageExtension.test(url) && !uploaded.has(normalizeAssetUrl(url)))
    .map((url, index) => ({ index, full: url, thumb: url, tags: '' }));
}

function tagCount(value) {
  return new Set(String(value || '').split(/[,\s#]+/).map(token => token.trim()).filter(Boolean)).size;
}

function collectExpectedOwners({ messages, memos, meetings }) {
  const byAsset = new Map();
  const add = (sourceType, sourceId, photos) => photos.forEach((photo, index) => {
    const key = assetKey(photo.full || photo.thumb);
    if (!key) return;
    const sourceOwner = `${sourceType}:${sourceId}:${Number.isInteger(photo.index) ? photo.index : index}`.slice(0, 240);
    const owners = byAsset.get(key) || [];
    if (!owners.some(owner => owner.sourceOwner === sourceOwner)) owners.push({ sourceOwner, tags: String(photo.tags || '') });
    byAsset.set(key, owners);
  });
  messages.forEach(message => add('message', message.id, [...attachedImages(message), ...directImages(message)]));
  memos.forEach(memo => add('memo', memo.id, [...attachedImages(memo), ...directImages(memo)]));
  meetings.forEach(meeting => add('meeting', meeting.id, (Array.isArray(meeting.photos) ? meeting.photos : []).map((photo, index) => ({
    index,
    full: photo?.imageUrl || photo?.full || photo?.url || photo?.src || photo?.thumbUrl || photo?.thumb || '',
    thumb: photo?.thumbUrl || photo?.thumb || photo?.thumbnailUrl || photo?.imageUrl || photo?.full || '',
    tags: String(photo?.tags || '')
  }))));
  return byAsset;
}

const reports = [];
let hasContractFailure = false;
for (const calendarId of CALENDAR_IDS) {
  const [messages, memos, meetings, photoIndex, photoComments] = await Promise.all(
    ['messages', 'memos', 'confirmedMeetings', 'photoIndex', 'photoComments'].map(collection => listCollection(calendarId, collection))
  );
  const expected = collectExpectedOwners({ messages, memos, meetings });
  const indexed = new Map(photoIndex.map(row => [row.assetKey || row.id, row]));
  const missingAssets = [...expected.keys()].filter(key => !indexed.has(key));
  const missingOwners = [];
  const staleTagRows = [];
  expected.forEach((owners, key) => {
    const row = indexed.get(key);
    if (!row) return;
    const actualOwners = new Set((Array.isArray(row.owners) ? row.owners : []).map(owner => owner?.sourceOwner).filter(Boolean));
    owners.forEach(owner => { if (!actualOwners.has(owner.sourceOwner)) missingOwners.push({ assetKey: key, sourceOwner: owner.sourceOwner }); });
    const richestExpectedTags = Math.max(0, ...owners.map(owner => tagCount(owner.tags)));
    if (Number(row.tagCacheVersion || 0) < 2 || tagCount(row.tags) < richestExpectedTags) {
      staleTagRows.push({ assetKey: key, version: Number(row.tagCacheVersion || 0), cachedTags: tagCount(row.tags), expectedTags: richestExpectedTags });
    }
  });
  const unexpectedAssets = [...indexed.keys()].filter(key => !expected.has(key));
  const commentCounts = new Map(photoComments.map(row => [row.id, Array.isArray(row.comments) ? row.comments.length : 0]));
  const badgeMismatches = [];
  indexed.forEach((row, key) => {
    const aliases = [key, ...(Array.isArray(row.legacyKeys) ? row.legacyKeys : [])];
    const expectedCount = Math.max(0, ...aliases.map(alias => Number(commentCounts.get(alias) || 0)));
    if (Number(row.commentCount || 0) !== expectedCount) badgeMismatches.push({ assetKey: key, cached: Number(row.commentCount || 0), expected: expectedCount });
  });
  const indexedCommentAliases = new Set([...indexed].flatMap(([key, row]) => [key, ...(Array.isArray(row.legacyKeys) ? row.legacyKeys : [])]));
  const orphanCommentThreads = [...commentCounts].filter(([key, count]) => count > 0 && !indexedCommentAliases.has(key)).map(([key, count]) => ({ key, count }));
  const failures = missingAssets.length + missingOwners.length + badgeMismatches.length;
  hasContractFailure ||= failures > 0;
  reports.push({
    calendarId,
    sourceDocuments: { messages: messages.length, memos: memos.length, meetings: meetings.length },
    uniqueSourceAssets: expected.size,
    indexedAssets: indexed.size,
    missingAssets: missingAssets.length,
    missingOwners: missingOwners.length,
    unexpectedAssets: unexpectedAssets.length,
    staleTagRows: staleTagRows.length,
    badgeMismatches: badgeMismatches.length,
    orphanCommentThreads: orphanCommentThreads.length,
    samples: {
      missingAssets: missingAssets.slice(0, 5),
      missingOwners: missingOwners.slice(0, 5),
      staleTagRows: staleTagRows.slice(0, 5),
      badgeMismatches: badgeMismatches.slice(0, 5),
      orphanCommentThreads: orphanCommentThreads.slice(0, 5)
    }
  });
}

console.log(JSON.stringify({ projectId: PROJECT_ID, readOnly: true, reports }, null, 2));
if (hasContractFailure) process.exitCode = 1;
