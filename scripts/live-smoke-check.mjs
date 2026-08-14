const DEFAULT_BASE_URL = 'https://pyw31337.github.io/calendar/';
const baseUrl = process.env.CALENDAR_LIVE_BASE_URL || DEFAULT_BASE_URL;
const cacheBust = process.env.CALENDAR_LIVE_CACHE_BUST || Date.now().toString(36);

const pages = [
  '?id=kkot',
  '?id=jhair',
  '?id=cw&view=chat',
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
  });
}

for (const asset of assets) {
  await checkUrl(withCacheBust(asset), (text, url) => {
    if (!text.trim()) {
      throw new Error(`Empty asset response: ${url}`);
    }
  });
}

console.log('Live smoke check passed.');
