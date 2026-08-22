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
const STATIC_CACHE = 'moyeora-static-v2';
const STATIC_ASSETS = [
  'favicon.ico',
  'manifest.json',
  'manifest-kkot.json',
  'manifest-cw.json',
  'manifest-jhair.json',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/icon-512-maskable.png',
  'icons/apple-touch-icon.png'
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
      .then(names => Promise.all(names.filter(name => name !== STATIC_CACHE).map(name => caches.delete(name))))
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
  if (req.mode === 'navigate' || req.url.endsWith('/index.html')) {
    event.respondWith(fetch(req, { cache: 'no-store' }).catch(() => Response.error()));
    return;
  }

  const url = new URL(req.url);
  const isStaticAsset = url.origin === self.location.origin && STATIC_ASSETS.some(asset => url.pathname.endsWith('/' + asset) || url.pathname.endsWith(asset));
  // The app's own CSS/split-JS files (assets/app*.js, assets/app.css) are cache-busted with a
  // ?v=<date>-splitN query string on every deploy -- a fresh deploy always requests a brand new
  // URL, so caching them here can never serve stale content the way caching index.html would
  // (see the note at the top of this file for why index.html itself stays excluded). Matched by
  // pathname so it covers each split file without hardcoding all six names.
  const isVersionedAppAsset = url.origin === self.location.origin && /\/assets\/app[\w-]*\.(?:js|css)$/.test(url.pathname);
  if (!isStaticAsset && !isVersionedAppAsset) return;

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
  const options = {
    body: payload.body || '',
    icon: 'icons/icon-192.png',
    badge: 'icons/icon-192.png',
    tag: payload.tag || 'gather-push',
    renotify: true,
    data: payload.url || './',
    vibrate: [80, 40, 80]
  };
  event.waitUntil(
    self.registration.showNotification(title, options).catch(function () {
      return self.registration.showNotification(title, { body: options.body, tag: 'gather-push-fallback', data: options.data });
    })
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const targetUrl = event.notification.data || './';
  const absoluteTargetUrl = new URL(targetUrl, self.location.href).href;
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      // 1. Try to find a tab matching the target URL exactly
      for (const client of clientList) {
        if (client.url === absoluteTargetUrl && 'focus' in client) return client.focus();
      }
      // 2. If not found, find any tab on our origin, navigate it to target URL, and focus it
      for (const client of clientList) {
        const clientUrl = new URL(client.url);
        if (clientUrl.origin === self.location.origin && 'focus' in client) {
          if (client.navigate) {
            client.navigate(absoluteTargetUrl);
          }
          return client.focus();
        }
      }
      // 3. Fallback to opening a new tab
      if (self.clients.openWindow) return self.clients.openWindow(absoluteTargetUrl);
    })
  );
});
