// Re-align photos whose copies carry different tags (the audit's copiesWithDifferentTags).
// DRY RUN by default.
//
//   REPAIR_CALENDAR_IDS=cw npm run ops:repair-tag-divergence            # report only
//   REPAIR_CALENDAR_IDS=cw APPLY=1 npm run ops:repair-tag-divergence    # write (after ops:export backup)
//
// Which copy is right: the photoIndex row, unless another copy holds every index tag and more
// (a write the index has not caught up with yet -- see below). It is rebuilt from the latest write to any copy, and
// in every audited sample it held the newest tag set -- the stale copy was either the chat message
// (an album-only save never reached it) or an album entry (the date-link commit put back the
// previous tags). Photos without an index row fall back to the owning message's tags.
//
// Writes go through the server's mediaCommand bulkTagAssets, the same transaction the app's bulk
// tag edit uses: it rewrites every message/memo slot and album entry of the file to one value.
// Nothing here writes Firestore directly.
import { normalizePhotoAssetUrl } from '../src/core/photo-asset.js';
import { BULK_TAG_CHUNK_SIZE, joinPhotoTagTokens } from '../src/core/bulk-photo-tags.js';

const PROJECT_ID = 'metro-live-2918e';
const ROOT = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;
const COMMAND_URL = `https://us-central1-${PROJECT_ID}.cloudfunctions.net/mediaCommand`;
const CALENDAR_IDS = (process.env.REPAIR_CALENDAR_IDS || '')
  .split(',').map(value => value.trim()).filter(value => /^[a-z0-9_-]{1,60}$/i.test(value));
const APPLY = process.env.APPLY === '1';

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
const tagSet = value => Array.from(new Set(String(value || '').split(/[,\s#]+/).filter(Boolean))).sort().join(' ');

async function repairCalendar(calendarId) {
  const base = `calendars/cal_${calendarId}`;
  const [index, messages, meetings, memos] = await Promise.all(
    ['photoIndex', 'messages', 'confirmedMeetings', 'memos'].map(name => listAll(`${base}/${name}`))
  );
  const copies = new Map();
  const add = (url, copy) => {
    const key = norm(url);
    if (!key) return;
    const list = copies.get(key) || [];
    list.push(copy);
    copies.set(key, list);
  };
  messages.forEach(m => (m.imageUrls || (m.imageUrl ? [m.imageUrl] : [])).forEach((u, i) => add(u, {
    kind: 'message', where: `message:${m.id}:${i}`, id: m.id, tags: (m.imageTags || [])[i], url: u, thumb: (m.thumbUrls || [])[i] || '',
  })));
  memos.forEach(m => (m.imageUrls || (m.imageUrl ? [m.imageUrl] : [])).forEach((u, i) => add(u, {
    kind: 'memo', where: `memo:${m.id}:${i}`, id: m.id, tags: (m.imageTags || [])[i], url: u, thumb: (m.thumbUrls || [])[i] || '',
  })));
  meetings.forEach(m => (m.photos || []).forEach((p, i) => add(p.imageUrl || p.full || p.url, {
    kind: 'meeting', where: `meeting:${m.id}:${i}`, tags: p.tags, url: p.imageUrl || p.full || p.url, thumb: p.thumbUrl || p.thumb || '',
  })));
  index.forEach(r => add(r.full, { kind: 'index', where: `index:${r.id}`, tags: r.tags, url: r.full, thumb: r.thumb || '' }));

  const plan = [];
  copies.forEach(list => {
    if (list.length < 2 || new Set(list.map(c => tagSet(c.tags))).size < 2) return;
    const preferred = list.find(c => c.kind === 'index') || list.find(c => c.kind === 'message') || list.find(c => c.kind === 'memo');
    // The index row is rebuilt asynchronously after a write, so for a short while a source copy
    // can hold MORE tags than the index (a tag just added). A copy that contains every index tag
    // and more is that newer write -- never roll it back to the index.
    const tokensOf = c => new Set(tagSet(c?.tags).split(' ').filter(Boolean));
    const base = tokensOf(preferred);
    const superset = list
      .filter(c => c.kind !== 'index' && c !== preferred)
      .filter(c => { const t = tokensOf(c); return t.size > base.size && [...base].every(x => t.has(x)); })
      .sort((x, y) => tokensOf(y).size - tokensOf(x).size)[0];
    const canonical = superset || preferred;
    if (!canonical) return; // album-only copies: no authority to pick from, leave for a person
    const owner = list.find(c => c.kind === 'message') || null;
    const memo = list.find(c => c.kind === 'memo') || null;
    plan.push({
      file: String(canonical.url).replace(/^.*%2F/, '').split('?')[0],
      tags: joinPhotoTagTokens(canonical.tags || ''),
      stale: list.filter(c => tagSet(c.tags) !== tagSet(canonical.tags)).map(c => `${c.where} [${tagSet(c.tags)}]`),
      item: {
        imageUrl: String(canonical.url || ''),
        thumbUrl: String(canonical.thumb || list.find(c => c.thumb)?.thumb || ''),
        messageId: owner?.id || '',
        memoId: memo?.id || '',
        tags: joinPhotoTagTokens(canonical.tags || ''),
      },
    });
  });

  const result = { calendarId, divergent: plan.length, applied: 0, failed: 0, plan: plan.map(({ file, tags, stale }) => ({ file, tags, stale })) };
  if (!APPLY) return result;
  for (let offset = 0; offset < plan.length; offset += BULK_TAG_CHUNK_SIZE) {
    const items = plan.slice(offset, offset + BULK_TAG_CHUNK_SIZE).map(entry => entry.item);
    const response = await fetch(COMMAND_URL, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ calendarId, op: 'bulkTagAssets', items }),
    });
    const payload = await response.json().catch(() => ({}));
    if (response.ok && payload?.ok !== false) result.applied += items.length;
    else { result.failed += items.length; console.error(`[${calendarId}] chunk failed`, response.status, payload); }
  }
  return result;
}

const reports = [];
for (const calendarId of CALENDAR_IDS) reports.push(await repairCalendar(calendarId));
console.log(JSON.stringify({ apply: APPLY, reports }, null, 2));
