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
  '?id=kkot&view=memo',
  '?id=jhair&view=chat',
  '?admin=1',
  '?admin=1&restore=1'
];

const CLASSIC_REQUIRED_SCRIPT_MARKERS = [
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
  if (path.startsWith('assets/') || path.startsWith('/')) {
    return new URL(path.replace(/^\//, ''), baseUrl).toString();
  }
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

function isViteHtml(html) {
  return html.includes('type="module"') && /assets\/index-[^"]+\.js/.test(html);
}

function isClassicHtml(html) {
  return html.includes('assets/app-main.js') && html.includes('assets/app-utils.js');
}

const indexUrl = new URL('.', baseUrl).toString() + `?_v=${cacheBust}`;
const indexText = await checkUrl(indexUrl, (html, url) => {
  if (!html.includes('<div id="root">')) throw new Error(`Missing root element: ${url}`);
  if (!isViteHtml(html) && !isClassicHtml(html)) {
    throw new Error(`Unrecognized deployment HTML (neither Vite nor classic): ${url}`);
  }
});

const mode = isViteHtml(indexText) ? 'vite' : 'classic';
console.log(`[live-smoke] deployment mode: ${mode}`);

for (const page of pages) {
  await checkUrl(withCacheBust(page), (html, url) => {
    if (!html.includes('<div id="root">')) throw new Error(`Missing root element: ${url}`);
    if (mode === 'vite') {
      if (!isViteHtml(html)) throw new Error(`Expected Vite module bundle on ${url}`);
    } else {
      if (!html.includes('assets/app-utils.js')) throw new Error(`Missing app-utils: ${url}`);
      if (!html.includes('assets/app-notifications.js')) throw new Error(`Missing app-notifications: ${url}`);
    }
  });
}

if (mode === 'vite') {
  const jsMatch = indexText.match(/src="([^"]*assets\/index-[^"]+\.js)"/);
  const cssMatch = indexText.match(/href="([^"]*assets\/index-[^"]+\.css)"/);
  if (!jsMatch) throw new Error('Vite index missing assets/index-*.js');
  if (!cssMatch) throw new Error('Vite index missing assets/index-*.css');

  const jsUrl = new URL(jsMatch[1], baseUrl).toString();
  const cssUrl = new URL(cssMatch[1], baseUrl).toString();

  const jsBody = await checkUrl(jsUrl, (text, url) => {
    if (!text.trim()) throw new Error(`Empty JS entry: ${url}`);
  });
  await checkUrl(cssUrl, (text, url) => {
    if (!text.trim()) throw new Error(`Empty CSS bundle: ${url}`);
  });

  const chunkUrls = [...new Set([
    ...[...indexText.matchAll(/["']([^"']*assets\/[^"']+\.js)["']/g)].map(m => new URL(m[1], baseUrl).toString()),
    ...[...jsBody.matchAll(/["']([^"']*assets\/[^"']+\.js)["']/g)].map(m => new URL(m[1], jsUrl).toString())
  ])];
  let combined = jsBody;
  let totalBytes = jsBody.length;
  for (const cu of chunkUrls.slice(0, 40)) {
    try {
      const body = await (await fetch(cu, { redirect: 'follow' })).text();
      if (body && body.length) {
        combined += body;
        totalBytes += body.length;
        console.log(`[live-smoke] chunk ${cu.split('/').pop()} bytes=${body.length}`);
      }
    } catch (e) {
      console.log(`[live-smoke] chunk skip ${cu}: ${e.message}`);
    }
  }
  if (totalBytes < 100000) throw new Error(`Vite JS chunks too small total=${totalBytes}`);
  for (const needle of ['AdminDashboard', 'MemoView', 'ChatRoomView', 'GATHER_APP_CONSTANTS', 'createRoot']) {
    if (!combined.includes(needle)) throw new Error(`Marker "${needle}" missing across Vite chunks`);
    console.log(`[live-smoke] marker ok ${needle} @ vite-chunks`);
  }
} else {
  for (const marker of CLASSIC_REQUIRED_SCRIPT_MARKERS) {
    if (!indexText.includes(marker)) throw new Error(`index.html missing required script: ${marker}`);
  }
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
}

console.log('Live smoke check passed.');
