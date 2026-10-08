// Service worker for 모여라 캘린더.
//
// Scope decision: index.html itself ships with
// `Cache-Control: no-cache, no-store, must-revalidate` -- a deliberate choice by this app (many
// rapid same-day deploys, and a stale cached HTML shell showing an old broken build is worse
// than a slightly slower load). A service worker that cached index.html would silently
// undermine that, serving a stale shell from the Cache Storage layer even though the HTTP
// header says never to. So this worker deliberately does NOT cache index.html or any other
// document navigation -- those always go to the network. It only caches the small set of truly
// static, rarely-changing assets (icons, the per-calendar manifests), which is enough to (a)
// satisfy PWA installability's usual expectation of a service worker and (b) let those specific
// assets resolve instantly/offline without touching the freshness of the app itself.
// Replaced at build time by scripts/copy-static-to-dist.mjs. A commit-scoped cache
// prevents an older PWA shell from surviving a deployment.
const BUILD_SHA = '75c181202dbb890f452566ba9e2204b594513014';
const STATIC_CACHE = `moyeora-static-${BUILD_SHA}`;
// Uploaded photos/posters/files live at unique, never-overwritten Firebase Storage paths
// (timestamped names, see app-image-pipeline.js), so a copy fetched once is valid forever.
// This cache outlives deploys (it is not BUILD_SHA scoped) so revisits, reloads and the iOS
// home-screen app -- whose HTTP cache is evicted aggressively -- reuse the bytes instead of
// downloading them again: faster screens and less Storage egress.
const MEDIA_CACHE = 'moyeora-media-v1';
const MEDIA_CACHE_MAX_ENTRIES = 800;
const MEDIA_CACHE_MAX_BYTES_PER_ITEM = 8 * 1024 * 1024;
const STATIC_ASSETS = [
  'favicon.ico',
  'manifest.json',
  'manifest-kkot.json',
  'manifest-cw.json',
  'manifest-jhair.json',
  'icons/icon-v6-192.png',
  'icons/icon-v6-512.png',
  'icons/icon-v6-512-maskable.png',
  'icons/icon-v6-apple-touch.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      // Do not let one optional asset failure abort the whole service worker install. A failed
      // install means PushManager never becomes ready, which looks like a notification failure
      // even though the app itself loaded fine.
      .then(cache => Promise.allSettled(STATIC_ASSETS.map(asset => cache.add(asset))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(names => Promise.all(names.filter(name => name !== STATIC_CACHE && name !== MEDIA_CACHE).map(name => caches.delete(name))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  // Navigations (typing the URL, back/forward, a script reload -- and critically, the browser
  // silently reloading a tab it discarded while backgrounded, which mobile Safari/Chrome do
  // routinely) must always hit the network fresh. GitHub Pages ignores this app's own caching
  // intent -- there is no way to configure it to send index.html with the no-cache header the
  // top-of-file note above assumed; it actually serves `Cache-Control: max-age=600` on every
  // response including index.html, which a browser is fully entitled to serve straight out of
  // its own HTTP cache for the next 10 minutes with zero network round-trip. That becomes a hard
  // failure ("로딩 실패. 새로고침 해주세요." in main.jsx) the moment even one deploy lands in
  // that window: every deploy here replaces the entire site (GitHub Pages keeps no old-version
  // fallback), so the still-cached HTML's <script> tags point at content-hashed chunk files
  // (app-main-<hash>.js etc.) that no longer exist, and the dynamic imports in boot() 404. Forcing
  // `cache: 'no-store'` here bypasses only the browser's own HTTP cache for this one fetch (the
  // CDN in front of Pages is a separate layer, already invalidated as part of every deploy), so a
  // resumed/reloaded tab always gets the index.html that matches whatever is actually live right
  // now instead of whatever happened to be cached from up to 10 minutes ago.
  const accept = req.headers.get('accept') || '';
  const isDocument = req.mode === 'navigate'
    || req.destination === 'document'
    || req.url.endsWith('/index.html')
    || (accept.includes('text/html') && (req.url.endsWith('/calendar/') || req.url.endsWith('/calendar')));
  if (isDocument) {
    event.respondWith(fetchFreshDocument(req));
    return;
  }

  const url = new URL(req.url);
  if (isCacheableStorageMedia(req, url)) {
    event.respondWith(serveStorageMedia(req));
    return;
  }
  const isStaticAsset = url.origin === self.location.origin && STATIC_ASSETS.some(asset => url.pathname.endsWith('/' + asset) || url.pathname.endsWith(asset));
  // Every file Vite emits into dist/assets/ is content-hashed (app-main-<hash>.js,
  // index-<hash>.js, vendor-react-dom-<hash>.js, ui-*-<hash>.js, index-<hash>.css, ...) -- a
  // fresh deploy that changes a file's content always produces a brand-new URL, so caching all
  // of them here can never serve stale content the way caching index.html would (see the note at
  // the top of this file for why index.html itself stays excluded). Matched by directory rather
  // than a filename prefix: an earlier version of this only matched names starting with "app",
  // which silently excluded the entry chunk and every UI/vendor chunk -- everything except the
  // 7 files under that prefix went uncached, so a reloaded offline PWA never actually booted.
  const isViteAsset = url.origin === self.location.origin && /\/assets\/[^/]+\.(?:js|css)$/.test(url.pathname);
  if (!isStaticAsset && !isViteAsset) return;

  // The web app manifests decide the home-screen icon and name. Serving them cache-first meant
  // "홈 화면에 추가" right after an icon change still installed the previous icon, so they are
  // network-first and fall back to the cached copy only when offline.
  if (/\/manifest(?:-[A-Za-z0-9_-]+)?\.json$/.test(url.pathname)) {
    event.respondWith((async () => {
      try {
        const res = await fetch(req, { cache: 'no-store' });
        if (res && res.ok) {
          try {
            const cache = await caches.open(STATIC_CACHE);
            await cache.put(req, res.clone());
          } catch (_) {}
        }
        return res;
      } catch (e) {
        return (await caches.match(req)) || Response.error();
      }
    })());
    return;
  }

  // Cache-first for the static set, with a background revalidation so an icon/manifest update
  // still reaches users on their next load rather than being stuck forever.
  event.respondWith((async () => {
    const cached = await caches.match(req);
    if (cached) {
      fetch(req).then(async (res) => {
        if (!res || !res.ok) return;
        try {
          const copy = res.clone();
          const cache = await caches.open(STATIC_CACHE);
          await cache.put(req, copy);
        } catch (_) {}
      }).catch(() => {});
      return cached;
    }
    try {
      const res = await fetch(req);
      if (res && res.ok) {
        try {
          const cache = await caches.open(STATIC_CACHE);
          await cache.put(req, res.clone());
        } catch (_) {}
      }
      return res;
    } catch (e) {
      return cached || Response.error();
    }
  })());
});

// A home-screen web clip can retain an app/<id>/ URL from an interrupted deploy or an older
// manifest.  If that document path is temporarily unavailable, retry the canonical root page
// for the same calendar instead of surfacing Safari's opaque "cannot connect" screen. The root
// page has the same boot bundle and preserves the id query parameter, so this is a safe fallback
// for the legacy installed apps while normal app-scoped paths keep their preferred response.
async function fetchFreshDocument(req) {
  try {
    const response = await fetch(req, { cache: 'no-store' });
    if (response && response.ok) return response;

    const url = new URL(req.url);
    // Dynamic share link (e.g. /share/cw/memo/memo_123/): redirect to canonical SPA route
    const shareMatch = url.pathname.match(/^(.*)\/share\/([A-Za-z0-9_-]+)(?:\/([A-Za-z0-9_-]+))?(?:\/([A-Za-z0-9_.-]+))?\/?$/);
    if (shareMatch) {
      const basePath = shareMatch[1] ? `${shareMatch[1]}/` : '/';
      const calendarId = shareMatch[2];
      const view = shareMatch[3] || '';
      const extraId = shareMatch[4] || '';
      const redirectUrl = new URL(basePath, url.origin);
      redirectUrl.searchParams.set('id', calendarId);
      if (view === 'memo') {
        redirectUrl.searchParams.set('view', 'memo');
        if (extraId) redirectUrl.searchParams.set('memo', extraId);
      } else if (view && ['chat', 'places', 'gallery', 'settlement'].includes(view)) {
        redirectUrl.searchParams.set('view', view);
        if (extraId) redirectUrl.searchParams.set('detail', extraId);
      } else if (view) {
        redirectUrl.searchParams.set('view', view);
      }
      for (const [k, v] of url.searchParams.entries()) {
        if (!redirectUrl.searchParams.has(k)) redirectUrl.searchParams.set(k, v);
      }
      try {
        return Response.redirect(redirectUrl.toString(), 302);
      } catch (_) {
        const res = await fetch(redirectUrl.toString(), { cache: 'no-store' });
        if (res && (res.ok || res.status === 404)) return res;
      }
    }

    // Allow 404 status (to let 404.html execute client-side redirection on GitHub Pages)
    if (response && response.status === 404) return response;
    throw new Error(`document status ${response?.status || 0}`);
  } catch (_) {
    try {
      const url = new URL(req.url);
      const appPath = url.pathname.match(/^(.*)\/app\/([A-Za-z0-9_-]+)\/?$/);
      if (appPath) {
        const fallback = new URL(`${appPath[1]}/`, url.origin);
        fallback.search = url.search;
        if (!fallback.searchParams.get('id') && !fallback.searchParams.get('cal')) {
          fallback.searchParams.set('id', appPath[2]);
        }
        const response = await fetch(fallback.toString(), { cache: 'no-store' });
        if (response && (response.ok || response.status === 404)) return response;
      }

      const sharePath = url.pathname.match(/^(.*)\/share\/([A-Za-z0-9_-]+)/);
      if (sharePath) {
        const basePath = sharePath[1] ? `${sharePath[1]}/` : '/';
        const fallback = new URL(basePath, url.origin);
        fallback.searchParams.set('id', sharePath[2]);
        for (const [k, v] of url.searchParams.entries()) {
          if (!fallback.searchParams.has(k)) fallback.searchParams.set(k, v);
        }
        const response = await fetch(fallback.toString(), { cache: 'no-store' });
        if (response && (response.ok || response.status === 404)) return response;
      }
      return Response.error();
    } catch (_) {
      return Response.error();
    }
  }
}

function isCacheableStorageMedia(req, url) {
  // Range requests (video/audio seeking) stream partial content -- leave them to the network.
  if (req.headers.has('range')) return false;
  if (req.destination === 'video' || req.destination === 'audio') return false;
  if (url.hostname === 'firebasestorage.googleapis.com') {
    return /\/v0\/b\/[^/]+\/o\/.+/.test(url.pathname) && url.searchParams.get('alt') === 'media';
  }
  return false;
}

let mediaPutsSinceTrim = 0;
async function trimMediaCache() {
  try {
    const cache = await caches.open(MEDIA_CACHE);
    const keys = await cache.keys();
    const excess = keys.length - MEDIA_CACHE_MAX_ENTRIES;
    // keys() is in insertion order, so the oldest entries go first.
    for (let i = 0; i < excess; i += 1) await cache.delete(keys[i]);
  } catch (_) {}
}

async function serveStorageMedia(req) {
  let cache = null;
  try {
    cache = await caches.open(MEDIA_CACHE);
    const hit = await cache.match(req.url);
    if (hit) return hit;
  } catch (_) {}
  // <img> requests are no-cors (opaque, unmeasurable and padded in quota), so fetch the same
  // URL in CORS mode -- Firebase Storage answers with Access-Control-Allow-Origin: * -- and
  // store a real, size-checked response. If CORS fails for any reason, fall back to the
  // browser's original request untouched.
  let res;
  try {
    res = await fetch(req.url, { mode: 'cors', credentials: 'omit' });
  } catch (_) {
    return fetch(req);
  }
  if (res && res.ok && res.status === 200 && res.type !== 'opaque' && cache) {
    const length = Number(res.headers.get('content-length') || 0);
    if (!length || length <= MEDIA_CACHE_MAX_BYTES_PER_ITEM) {
      const copy = res.clone();
      cache.put(req.url, copy).then(() => {
        mediaPutsSinceTrim += 1;
        if (mediaPutsSinceTrim >= 25) { mediaPutsSinceTrim = 0; return trimMediaCache(); }
        return undefined;
      }).catch(() => {});
    }
  }
  return res;
}

// Push/notificationclick handling. Real push messages are sent by the onMessageCreate Cloud
// Function (functions/index.js), which holds the VAPID private key and calls web-push's
// sendNotification on every new chat message -- that function must be deployed separately
// (`firebase deploy --only functions`, and the Firebase project must be on the Blaze plan,
// since Cloud Functions' outbound network calls aren't available on the free Spark plan) for
// this to actually fire; this listener only displays whatever payload arrives. The foreground
// Web Notifications API path in index.html's notifyNewChatMessage() is a separate, tab-must-
// be-open fallback that doesn't depend on this at all.
self.addEventListener('push', event => {
  let payload = { title: '모여라 캘린더', body: '새 알림이 도착했습니다.', url: './', tag: 'gather-push' };
  try {
    if (event.data) {
      try { payload = Object.assign(payload, event.data.json()); }
      catch (e) { payload.body = event.data.text() || payload.body; }
    }
  } catch (_) {}
  const title = payload.title || '모여라 캘린더';
  const scopeUrl = self.registration?.scope || (self.location.origin + '/calendar/');
  const iconUrl = new URL('icons/icon-v6-192.png', scopeUrl).href;
  const options = {
    body: payload.body || '',
    icon: iconUrl,
    badge: iconUrl,
    tag: payload.tag || 'gather-push',
    // Same tag replaces the previous card. A caller must opt in to buzz again;
    // memo/chat retries send renotify:false so a duplicate delivery stays one card.
    renotify: payload.renotify !== false,
    data: payload.url || './',
    vibrate: [80, 40, 80]
  };
  event.waitUntil(
    self.registration.showNotification(title, options).catch(function () {
      return self.registration.showNotification(title, {
        body: options.body,
        icon: iconUrl,
        tag: 'gather-push-fallback',
        data: options.data
      });
    })
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  // data is the push payload url string (./?id=&view=chat&msg= / view=memo&memo=&comment=).
  // Some browsers hand the same field back as { url }.
  const raw = event.notification && event.notification.data;
  const targetUrl = (raw && typeof raw === 'object' && raw.url) || (typeof raw === 'string' ? raw : '') || './';
  const scopeHref = (self.registration && self.registration.scope) || self.location.href;
  const absoluteTargetUrl = new URL(targetUrl, scopeHref).href;
  const target = new URL(absoluteTargetUrl);
  const inScope = (client) => {
    try {
      const url = new URL(client.url);
      return url.origin === target.origin && url.pathname.indexOf(new URL(scopeHref).pathname) === 0;
    } catch (_) { return false; }
  };
  const sameDocument = (client) => {
    try {
      const url = new URL(client.url);
      return url.origin === target.origin && url.pathname === target.pathname && url.search === target.search;
    } catch (_) { return false; }
  };
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(async clientList => {
      const scoped = clientList.filter(inScope);
      const exact = scoped.find(sameDocument);
      if (exact && 'focus' in exact) return exact.focus();
      const client = scoped[0];
      if (client) {
        // An already-open calendar tab ignores a bare focus(). Tell it to apply the
        // same URL the cold load reads, and navigate when the browser allows it.
        try { client.postMessage({ type: 'notification-open', url: absoluteTargetUrl }); } catch (_) {}
        let next = client;
        if (client.navigate) {
          try { next = await client.navigate(absoluteTargetUrl) || client; } catch (_) {}
        }
        if (next && next.focus) return next.focus();
        return undefined;
      }
      if (self.clients.openWindow) return self.clients.openWindow(absoluteTargetUrl);
      return undefined;
    })
  );
});
