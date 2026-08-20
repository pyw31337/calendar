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
  '?id=cw&view=gallery',
  '?id=kkot&view=places',
  '?id=kkot&view=gallery',
  '?id=jhair&view=chat',
  '?admin=1',
  '?admin=1&restore=1'
];

const REQUIRED_SCRIPT_MARKERS = [
  'assets/app-main.js',
  'assets/app-utils.js',
  'assets/app-notifications.js',
  'assets/firebase-services.js',
  'assets/ui-side-menu.js',
  'assets/ui-icons.js',
  'assets/ui-widgets.js',
  'assets/ui-shared.js',
  'assets/ui-date-modal.js',
  'assets/ui-chat-room.js',
  'assets/ui-places.js',
  'assets/ui-admin-dashboard.js'
];

function withCacheBust(path) {
  if (path.startsWith('assets/')) return new URL(path, baseUrl).toString();
  const sep = path.includes('?') ? '&' : '?';
  return new URL(`${path}${sep}_v=${cacheBust}`, baseUrl).toString();
}

async function checkUrl(url, validate) {
  const response = await fetch(url, { redirect: 'follow' });
  const text = await response.text();
  if (!response.ok) throw new Error(`${response.status} ${url}`);
  validate?.(text, url);
  console.log(`[live-smoke] ${response.status} ${url} bytes=${text.length}`);
  return text;
}

for (const page of pages) {
  await checkUrl(withCacheBust(page), (html, url) => {
    if (!html.includes('<div id="root">')) throw new Error(`Missing root element: ${url}`);
    if (!html.includes('assets/app-utils.js')) throw new Error(`Missing app-utils: ${url}`);
    if (!html.includes('assets/app-notifications.js')) throw new Error(`Missing app-notifications: ${url}`);
  });
}

const indexUrl = new URL('.', baseUrl).toString() + `?_v=${cacheBust}`;
const indexText = await checkUrl(indexUrl, (html) => {
  for (const marker of REQUIRED_SCRIPT_MARKERS) {
    if (!html.includes(marker)) throw new Error(`index.html missing required script: ${marker}`);
  }
});

const assetPaths = [...new Set(
  [...indexText.matchAll(/src="(assets\/(?:app|ui|firebase)[^"]+\.js(?:\?v=[^"]+)?)"/g)].map(m => m[1])
)];
if (assetPaths.length < 10) throw new Error(`Too few asset scripts parsed (${assetPaths.length})`);
console.log(`[live-smoke] parsed ${assetPaths.length} asset scripts from index`);

for (const asset of assetPaths) {
  await checkUrl(withCacheBust(asset), (text, url) => {
    if (!text.trim()) throw new Error(`Empty asset response: ${url}`);
  });
}

const criticalChecks = [
  ['ui-side-menu.js', 'MainSideMenu'],
  ['ui-icons.js', 'GATHER_UI_COMPONENTS'],
  ['ui-widgets.js', 'UrlCapsuleBadge'],
  ['app-main.js', 'GATHER_APP_CONSTANTS']
];
for (const [file, needle] of criticalChecks) {
  const fromIndex = assetPaths.find(p => p.includes(file));
  const finalUrl = withCacheBust(fromIndex || `assets/${file}`);
  const body = await (await fetch(finalUrl, { redirect: 'follow' })).text();
  if (!body.includes(needle)) throw new Error(`Marker "${needle}" missing in ${finalUrl}`);
  console.log(`[live-smoke] marker ok ${needle} @ ${fromIndex || file}`);
}

console.log('Live smoke check passed.');
