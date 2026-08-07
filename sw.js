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
const STATIC_CACHE = 'moyeora-static-v1';
const STATIC_ASSETS = [
  'manifest.json',
  'manifest-kkot.json',
  'manifest-cw.json',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/apple-touch-icon.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => cache.addAll(STATIC_ASSETS))
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
  // Never intercept navigations or the app script itself -- always fresh from the network,
  // matching index.html's own no-cache header (see the note above).
  if (req.mode === 'navigate' || req.url.endsWith('/index.html')) return;

  const url = new URL(req.url);
  const isStaticAsset = url.origin === self.location.origin && STATIC_ASSETS.some(asset => url.pathname.endsWith('/' + asset) || url.pathname.endsWith(asset));
  if (!isStaticAsset) return;

  // Cache-first for the static set, with a background revalidation so an icon/manifest update
  // still reaches users on their next load rather than being stuck forever.
  event.respondWith(
    caches.match(req).then(cached => {
      const network = fetch(req).then(res => {
        if (res && res.ok) caches.open(STATIC_CACHE).then(cache => cache.put(req, res.clone()));
        return res;
      }).catch(() => cached);
      return cached || network;
    })
  );
});

// Push/notificationclick scaffolding -- nothing currently sends a push message (that needs a
// trusted server holding VAPID/FCM credentials, which this app -- a static GitHub Pages site
// backed only by client-reachable Firestore -- does not have; new-message alerts today are the
// foreground Web Notifications API path in index.html's notifyNewChatMessage(), which only
// works while a tab is open). Kept minimal and inert until/unless a server-side sender exists,
// so the app is ready to receive real pushes without needing a second service worker rewrite.
self.addEventListener('push', event => {
  if (!event.data) return;
  let payload;
  try {
    payload = event.data.json();
  } catch (e) {
    payload = { title: '모여라 캘린더', body: event.data.text() };
  }
  event.waitUntil(
    self.registration.showNotification(payload.title || '모여라 캘린더', {
      body: payload.body || '',
      icon: 'icons/icon-192.png',
      tag: payload.tag || 'moyeora-push',
      data: payload.url || './'
    })
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const targetUrl = event.notification.data || './';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      for (const client of clientList) {
        if (client.url.includes(targetUrl) && 'focus' in client) return client.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow(targetUrl);
    })
  );
});
