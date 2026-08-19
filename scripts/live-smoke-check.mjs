const DEFAULT_BASE_URL = 'https://pyw31337.github.io/calendar/';
const baseUrl = process.env.CALENDAR_LIVE_BASE_URL || DEFAULT_BASE_URL;
const cacheBust = process.env.CALENDAR_LIVE_CACHE_BUST || Date.now().toString(36);

const pages = [
  '?id=kkot',
  '?id=jhair',
  '?id=cw',
  '?id=cw&view=chat',
  '?id=cw&view=memo',
  '?id=cw&view=places',
  '?id=kkot&view=places',
  '?admin=1',
  '?admin=1&restore=1'
];

const assets = [
  'assets/app-constants.js?v=20260814-split4',
  'assets/app-config.js?v=20260814-split3',
  'assets/app-calendar-data.js?v=20260814-split5',
  'assets/app-chat-data.js?v=20260814-split6',
  'assets/app-utils.js?v=20260814-split7',
  'assets/app-notifications.js?v=20260814-split8'
];

function withCacheBust(path) {
  if (path.startsWith('assets/')) return new URL(path, baseUrl).toString();
  const sep = path.includes('?') ? '&' : '?';
  return new URL(`${path}${sep}_v=${cacheBust}`, baseUrl).toString();
}

async function checkUrl(url, validate) {
  const response = await fetch(url, { redirect: 'follow' });
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`${response.status} ${url}`);
  }
  validate?.(text, url);
  console.log(`[live-smoke] ${response.status} ${url} bytes=${text.length}`);
}

for (const page of pages) {
  await checkUrl(withCacheBust(page), (html, url) => {
    if (!html.includes('<div id="root">')) {
      throw new Error(`Missing root element: ${url}`);
    }
    if (!html.includes('assets/app-utils.js')) {
      throw new Error(`Missing app-utils script reference: ${url}`);
    }
    if (!html.includes('assets/app-notifications.js')) {
      throw new Error(`Missing app-notifications script reference: ${url}`);
    }
  });
}

let assetPaths = assets;
try {
  const indexUrl = new URL('.', baseUrl).toString() + `?_v=${cacheBust}`;
  const indexRes = await fetch(indexUrl, { redirect: 'follow' });
  const indexText = await indexRes.text();
  const found = [...indexText.matchAll(/assets\/(app-[a-z0-9.-]+\.js)\?v=([^"']+)/g)].map(m => `assets/${m[1]}?v=${m[2]}`);
  if (found.length) assetPaths = [...new Set(found)];
} catch (e) {
  console.warn('[live-smoke] could not parse index assets, using defaults', e && e.message);
}

for (const asset of assetPaths) {
  await checkUrl(withCacheBust(asset), (text, url) => {
    if (!text.trim()) {
      throw new Error(`Empty asset response: ${url}`);
    }
  });
}

console.log('Live smoke check passed.');
