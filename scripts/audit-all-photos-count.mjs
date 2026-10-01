const PROJECT_ID = 'metro-live-2918e';
const ROOT = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;
const CALENDAR_IDS = ['kkot', 'cw', 'jhair'];

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

function decodeDoc(doc) {
  const fields = doc?.fields || {};
  return {
    id: doc.name.split('/').pop(),
    ...Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, decode(v)]))
  };
}

async function listAll(path) {
  const documents = [];
  let pageToken = '';
  do {
    const query = new URLSearchParams({ pageSize: '300' });
    if (pageToken) query.set('pageToken', pageToken);
    try {
      const res = await fetch(`${ROOT}/${path}?${query}`);
      if (!res.ok) {
        if (res.status === 404) return documents;
        break;
      }
      const data = await res.json();
      (data.documents || []).forEach(doc => documents.push(decodeDoc(doc)));
      pageToken = data.nextPageToken || '';
    } catch (e) {
      break;
    }
  } while (pageToken);
  return documents;
}

async function main() {
  console.log('Auditing unique photos across calendars...');
  const allUrls = new Set();
  const storageFiles = new Set();
  const byCal = {};

  for (const calId of CALENDAR_IDS) {
    byCal[calId] = { uniqueUrls: new Set(), thumbs: new Set(), originals: new Set() };
    const messages = await listAll(`calendars/cal_${calId}/messages`);
    const memos = await listAll(`calendars/cal_${calId}/memos`);
    const meetings = await listAll(`calendars/cal_${calId}/confirmedMeetings`);

    function record(url, isThumb) {
      if (!url || typeof url !== 'string' || !url.startsWith('http')) return;
      allUrls.add(url);
      byCal[calId].uniqueUrls.add(url);
      if (isThumb) byCal[calId].thumbs.add(url);
      else byCal[calId].originals.add(url);

      const m = url.match(/\/o\/([^?]+)/);
      if (m) {
        storageFiles.add(decodeURIComponent(m[1]));
      }
    }

    for (const msg of messages) {
      const urls = Array.isArray(msg.imageUrls) ? msg.imageUrls : (msg.imageUrl ? [msg.imageUrl] : []);
      const thumbs = Array.isArray(msg.thumbUrls) ? msg.thumbUrls : (msg.thumbUrl ? [msg.thumbUrl] : []);
      urls.forEach(u => record(u, false));
      thumbs.forEach(u => record(u, true));
    }

    for (const memo of memos) {
      const urls = Array.isArray(memo.imageUrls) ? memo.imageUrls : (memo.imageUrl ? [memo.imageUrl] : []);
      const thumbs = Array.isArray(memo.thumbUrls) ? memo.thumbUrls : (memo.thumbUrl ? [memo.thumbUrl] : []);
      urls.forEach(u => record(u, false));
      thumbs.forEach(u => record(u, true));
    }

    for (const mtg of meetings) {
      for (const p of mtg.photos || []) {
        if (p?.imageUrl) record(p.imageUrl, false);
        if (p?.thumbUrl) record(p.thumbUrl, true);
      }
    }
  }

  console.log('Total unique URLs across all calendars:', allUrls.size);
  console.log('Total unique Storage files:', storageFiles.size);
  for (const calId of CALENDAR_IDS) {
    console.log(`- ${calId}: ${byCal[calId].uniqueUrls.size} unique URLs (${byCal[calId].thumbs.size} thumbs, ${byCal[calId].originals.size} originals)`);
  }

  let chatImagesCount = 0;
  let memoImagesCount = 0;
  let otherCount = 0;
  storageFiles.forEach(f => {
    if (f.startsWith('chatImages/')) chatImagesCount++;
    else if (f.startsWith('memoImages/')) memoImagesCount++;
    else otherCount++;
  });
  console.log('Storage files breakdown:');
  console.log(`- chatImages: ${chatImagesCount}`);
  console.log(`- memoImages: ${memoImagesCount}`);
  console.log(`- other: ${otherCount}`);
}

main().catch(console.error);
