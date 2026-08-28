const PROJECT_ID = 'metro-live-2918e';
const CALENDAR_IDS = process.argv.slice(2).length ? process.argv.slice(2) : ['kkot', 'cw', 'jhair'];
const base = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;
const documentBase = `projects/${PROJECT_ID}/databases/(default)/documents`;

function datesIn(value) {
  const result = new Set();
  const text = typeof value === 'string' ? value : '';
  const re = /(^|[^\d])(\d{6})(?!\d)/g;
  let m;
  while ((m = re.exec(text))) {
    const token = m[2];
    const year = 2000 + Number(token.slice(0, 2));
    const month = Number(token.slice(2, 4));
    const day = Number(token.slice(4, 6));
    const date = new Date(`${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T00:00:00Z`);
    if (date.getUTCFullYear() === year && date.getUTCMonth() + 1 === month && date.getUTCDate() === day) {
      result.add(`${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`);
    }
  }
  return result;
}

function jsValue(value) {
  if (value === null || value === undefined) return { nullValue: null };
  if (typeof value === 'string') return { stringValue: value };
  if (typeof value === 'number') return { integerValue: String(value) };
  if (typeof value === 'boolean') return { booleanValue: value };
  return { stringValue: String(value) };
}

async function listMessages(calId) {
  const rows = [];
  let token = '';
  do {
    const url = `${base}/calendars/cal_${calId}/messages?pageSize=1000${token ? `&pageToken=${encodeURIComponent(token)}` : ''}`;
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error(`message list ${calId}: HTTP ${res.status}`);
    const data = await res.json();
    rows.push(...(data.documents || []));
    token = data.nextPageToken || '';
  } while (token);
  return rows;
}

function getField(doc, name) {
  const field = doc.fields?.[name];
  if (field?.stringValue != null) return field.stringValue;
  if (field?.integerValue != null) return Number(field.integerValue);
  if (field?.arrayValue?.values) return field.arrayValue.values.map(v => v.stringValue ?? '');
  return null;
}

async function commit(writes) {
  for (let i = 0; i < writes.length; i += 450) {
    const chunk = writes.slice(i, i + 450);
    const res = await fetch(`${base}:commit`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ writes: chunk })
    });
    if (!res.ok) throw new Error(`index commit: HTTP ${res.status} ${await res.text()}`);
  }
}

for (const calId of CALENDAR_IDS) {
  const docs = await listMessages(calId);
  const writes = [];
  for (const doc of docs) {
    const messageId = doc.name.split('/').pop();
    const urls = getField(doc, 'imageUrls');
    const thumbs = getField(doc, 'thumbUrls');
    const tags = getField(doc, 'imageTags');
    const fallbackUrl = getField(doc, 'imageUrl');
    const fallbackThumb = getField(doc, 'thumbUrl');
    const entries = Array.from({ length: Math.max(urls?.length || 0, thumbs?.length || 0, fallbackUrl ? 1 : 0) }, (_, index) => ({
      imageUrl: urls?.[index] || thumbs?.[index] || fallbackUrl || '',
      thumbUrl: thumbs?.[index] || urls?.[index] || fallbackThumb || fallbackUrl || '',
      tags: tags?.[index] || getField(doc, 'tags') || ''
    })).filter(entry => entry.imageUrl || entry.thumbUrl);
    entries.forEach((entry, index) => datesIn(entry.tags).forEach(date => {
      const id = `${date}_${messageId}_${index}`.replace(/[^A-Za-z0-9_-]/g, '_');
      const name = `${documentBase}/calendars/cal_${calId}/meetingPhotoIndex/${id}`;
      writes.push({ update: { name, fields: {
        date: jsValue(date), sourceMessageId: jsValue(messageId), sourceImageIndex: jsValue(index),
        imageUrl: jsValue(entry.imageUrl), thumbUrl: jsValue(entry.thumbUrl), tags: jsValue(entry.tags),
        createdAt: jsValue(Number(getField(doc, 'timestamp')) || 0), updatedAt: jsValue(Date.now())
      }}});
    }));
  }
  await commit(writes);
  console.log(`[meeting-photo-index] ${calId}: scanned ${docs.length}, indexed ${writes.length}`);
}
