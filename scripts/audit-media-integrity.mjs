// Read-only media integrity audit (docs/data-architecture-v3.md §1).
//
//   AUDIT_CALENDAR_IDS=cw npm run ops:integrity-audit
//
// Reports, per calendar:
//   - photoIndex rows whose Storage files no longer exist (broken thumbnails everywhere),
//   - source documents (messages / meetings / memos) still referencing missing files,
//   - photoIndex owners that the source document no longer contains (index drift),
//   - photos whose copies (message / meeting album / index) carry different tags,
//   - comment threads keyed by array position, and threads attached to no photo.
// Never writes. Storage existence is checked with a metadata GET (no download).
const PROJECT_ID = 'metro-live-2918e';
const ROOT = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;
const CALENDAR_IDS = (process.env.AUDIT_CALENDAR_IDS || 'kkot,cw,jhair')
  .split(',').map(value => value.trim()).filter(value => /^[a-z0-9_-]{1,60}$/i.test(value));
const CONCURRENCY = 12;

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
    if (!response.ok) throw new Error(`integrity audit list failed ${path}: ${response.status}`);
    const payload = await response.json();
    (payload.documents || []).forEach(doc => out.push(decodeDoc(doc)));
    pageToken = payload.nextPageToken || '';
  } while (pageToken);
  return out;
}

const norm = url => String(url || '').split('?')[0];
const tagSet = value => Array.from(new Set(String(value || '').split(/[,\s#]+/).filter(Boolean))).sort().join(' ');
const docUrls = doc => new Set([...(doc.imageUrls || []), ...(doc.thumbUrls || []), doc.imageUrl, doc.thumbUrl].filter(Boolean).map(norm));
const meetingUrls = meeting => new Set((meeting.photos || []).flatMap(p => [p.imageUrl, p.full, p.url, p.thumbUrl, p.thumb]).filter(Boolean).map(norm));

const storageStatus = new Map();
function fileExists(url) {
  const key = norm(url);
  if (!/firebasestorage/.test(key)) return Promise.resolve(true);
  if (!storageStatus.has(key)) {
    // Network errors count as "exists": the audit must never report data as lost when it merely
    // could not reach Storage.
    storageStatus.set(key, fetch(key).then(res => res.status !== 404).catch(() => true));
  }
  return storageStatus.get(key);
}
async function pool(items, worker) {
  let next = 0;
  await Promise.all(Array.from({ length: CONCURRENCY }, async () => {
    while (next < items.length) { const index = next++; await worker(items[index]); }
  }));
}

async function auditCalendar(calendarId) {
  const base = `calendars/cal_${calendarId}`;
  const [index, messages, meetings, memos, comments] = await Promise.all(
    ['photoIndex', 'messages', 'confirmedMeetings', 'memos', 'photoComments'].map(name => listAll(`${base}/${name}`))
  );
  const sources = { message: new Map(messages.map(d => [d.id, docUrls(d)])), memo: new Map(memos.map(d => [d.id, docUrls(d)])), meeting: new Map(meetings.map(m => [m.id, meetingUrls(m)])) };

  const report = {
    calendarId,
    documents: { photoIndex: index.length, messages: messages.length, meetings: meetings.length, memos: memos.length, photoComments: comments.length },
    deadIndexRows: 0, sourceRefsToMissingFiles: 0, staleIndexOwners: 0, indexOwners: 0,
    photosWithCopies: 0, copiesWithDifferentTags: 0, messagesWithPositionalTagsOnly: 0,
    positionalCommentThreads: 0, orphanCommentThreads: 0,
    samples: { deadIndexRows: [], missingFileRefs: [], tagDivergence: [], orphanComments: [] },
  };

  await pool(index, async row => {
    const alive = (await fileExists(row.full)) || (await fileExists(row.thumb));
    if (!alive) {
      report.deadIndexRows += 1;
      if (report.samples.deadIndexRows.length < 10) report.samples.deadIndexRows.push({ assetKey: row.id, owners: (row.owners || []).map(o => o.sourceOwner) });
    }
    for (const owner of row.owners || []) {
      report.indexOwners += 1;
      const [kind, ...rest] = String(owner.sourceOwner || '').split(':');
      const id = kind === 'meeting' ? rest[0] : rest.slice(0, -1).join(':');
      const urls = sources[kind]?.get(id);
      if (!urls || !(urls.has(norm(owner.full || row.full)) || urls.has(norm(owner.thumb || row.thumb)))) report.staleIndexOwners += 1;
    }
  });

  const refs = [];
  messages.forEach(d => docUrls(d).forEach(u => refs.push([`message:${d.id}`, u])));
  memos.forEach(d => docUrls(d).forEach(u => refs.push([`memo:${d.id}`, u])));
  meetings.forEach(m => meetingUrls(m).forEach(u => refs.push([`meeting:${m.id}`, u])));
  await pool(refs, async ([owner, url]) => {
    if (await fileExists(url)) return;
    report.sourceRefsToMissingFiles += 1;
    if (report.samples.missingFileRefs.length < 10) report.samples.missingFileRefs.push(`${owner} ${url.replace(/^.*%2F/, '')}`);
  });

  const copies = new Map();
  const addCopy = (url, where, tags) => { const key = norm(url); if (!key) return; const list = copies.get(key) || []; list.push({ where, tags: tagSet(tags) }); copies.set(key, list); };
  messages.forEach(m => {
    const urls = m.imageUrls || (m.imageUrl ? [m.imageUrl] : []);
    urls.forEach((u, i) => addCopy(u, `message:${m.id}:${i}`, (m.imageTags || [])[i]));
    if (urls.length && !Object.keys(m.imageTagMap || {}).length && (m.imageTags || []).some(Boolean)) report.messagesWithPositionalTagsOnly += 1;
  });
  meetings.forEach(m => (m.photos || []).forEach((p, i) => addCopy(p.imageUrl || p.full || p.url, `meeting:${m.id}:${i}`, p.tags)));
  index.forEach(r => addCopy(r.full, `index:${r.id}`, r.tags));
  copies.forEach((list, url) => {
    if (list.length < 2) return;
    report.photosWithCopies += 1;
    if (new Set(list.map(c => c.tags)).size > 1) {
      report.copiesWithDifferentTags += 1;
      if (report.samples.tagDivergence.length < 5) report.samples.tagDivergence.push({ file: url.replace(/^.*%2F/, ''), copies: list.map(c => `${c.where} [${c.tags}]`) });
    }
  });

  const assetKeys = new Set(index.map(r => r.id));
  const legacyKeys = new Set(index.flatMap(r => r.legacyKeys || []));
  comments.forEach(c => {
    if (!Array.isArray(c.comments) || !c.comments.length) return;
    const isAsset = c.id.startsWith('asset:v1:');
    if (!isAsset) report.positionalCommentThreads += 1;
    if (isAsset ? !assetKeys.has(c.id) : !legacyKeys.has(c.id)) {
      report.orphanCommentThreads += 1;
      if (report.samples.orphanComments.length < 10) report.samples.orphanComments.push(`${c.id} (${c.comments.length})`);
    }
  });
  return report;
}

const reports = [];
for (const calendarId of CALENDAR_IDS) {
  try {
    reports.push(await auditCalendar(calendarId));
  } catch (err) {
    reports.push({ calendarId, error: String(err?.message || err) });
  }
}
console.log(JSON.stringify({ generatedAt: new Date().toISOString(), reports }, null, 2));
