/**
 * Where sw.js lives, and how to register it without a failed script load.
 *
 * GitHub Pages serves this app under /calendar/ (and /calendar/app/<id>/ for installed
 * PWAs). A page whose pathname is exactly "/calendar" does not include the substring
 * "/calendar/", and a local preview opened at the site root must not ask for a script
 * that only exists under the preview base. A wrong URL is what Safari reports as
 * "Script …/sw.js load failed".
 *
 * reg.update() returns a promise. A try/catch around the call does not see a rejected
 * update (offline, or a deploy that briefly 404s the worker), and Safari surfaces that
 * rejection as the same script-load error. Updates are always swallowed. If the script
 * itself is missing or not JavaScript, we do not register it, and we drop a registration
 * that still points at that URL so an old worker cannot keep failing on every launch.
 * A network failure leaves the current registration alone: unregistering offline would
 * drop push until the next successful visit.
 */

export function resolveServiceWorkerTarget(pathname) {
  const path = String(pathname || '/');
  const marker = '/calendar/';
  const at = path.indexOf(marker);
  if (at >= 0) {
    const prefix = path.slice(0, at);
    return { scriptUrl: `${prefix}${marker}sw.js`, scope: `${prefix}${marker}` };
  }
  if (path === '/calendar' || path.endsWith('/calendar')) {
    const prefix = path.slice(0, path.length - '/calendar'.length);
    return { scriptUrl: `${prefix}/calendar/sw.js`, scope: `${prefix}/calendar/` };
  }
  const dir = path.endsWith('/') ? path : path.replace(/[^/]*$/, '');
  const base = dir || '/';
  return { scriptUrl: `${base}sw.js`, scope: base };
}

function scriptPath(url) {
  try { return new URL(url, 'https://local.invalid').pathname; } catch (_) { return ''; }
}

async function probeServiceWorkerScript(scriptUrl, fetchImpl) {
  try {
    const response = await fetchImpl(scriptUrl, { cache: 'no-store' });
    if (!response) return 'missing';
    if (response.status === 404 || response.status === 410) return 'missing';
    if (!response.ok) return 'offline';
    const type = String(response.headers?.get?.('content-type') || '');
    return /javascript|ecmascript/i.test(type) ? 'ok' : 'missing';
  } catch (_) {
    return 'offline';
  }
}

async function purgeStaleStaticCaches(cachesApi) {
  if (!cachesApi || typeof cachesApi.keys !== 'function') return;
  try {
    const names = await cachesApi.keys();
    await Promise.all(names
      .filter(name => String(name).startsWith('moyeora-static-'))
      .map(name => cachesApi.delete(name).catch(() => false)));
  } catch (_) {}
}

async function unregisterScript(serviceWorker, scriptUrl) {
  if (typeof serviceWorker.getRegistrations !== 'function') return;
  const wanted = scriptPath(scriptUrl);
  try {
    const registrations = await serviceWorker.getRegistrations();
    await Promise.all(registrations.map(registration => {
      const current = registration?.active?.scriptURL
        || registration?.waiting?.scriptURL
        || registration?.installing?.scriptURL
        || '';
      if (!current || scriptPath(current) !== wanted) return null;
      return registration.unregister?.().catch(() => false);
    }));
  } catch (_) {}
}

function updateQuietly(registration) {
  if (!registration || typeof registration.update !== 'function') return;
  Promise.resolve(registration.update()).catch(() => {});
}

export async function installAppServiceWorker({
  pathname,
  serviceWorker,
  cachesApi = null,
  fetchImpl = fetch
} = {}) {
  if (!serviceWorker || typeof serviceWorker.register !== 'function') return null;
  const { scriptUrl, scope } = resolveServiceWorkerTarget(pathname);
  const probe = await probeServiceWorkerScript(scriptUrl, fetchImpl);
  if (probe === 'offline') return null;
  if (probe === 'missing') {
    await unregisterScript(serviceWorker, scriptUrl);
    await purgeStaleStaticCaches(cachesApi);
    return null;
  }
  try {
    const registration = await serviceWorker.register(scriptUrl, { scope });
    updateQuietly(registration);
    return registration;
  } catch (_) {
    try {
      const registration = await serviceWorker.register(scriptUrl, { scope });
      updateQuietly(registration);
      return registration;
    } catch (error) {
      console.warn('Service worker registration failed:', error);
      return null;
    }
  }
}

export function bindAppServiceWorker(target = typeof window !== 'undefined' ? window : null) {
  if (!target || typeof target.addEventListener !== 'function') return;
  const navigatorRef = target.navigator;
  if (!navigatorRef || !('serviceWorker' in navigatorRef)) return;
  const run = () => {
    installAppServiceWorker({
      pathname: target.location?.pathname,
      serviceWorker: navigatorRef.serviceWorker,
      cachesApi: target.caches,
      fetchImpl: typeof target.fetch === 'function' ? target.fetch.bind(target) : fetch
    }).catch(() => {});
  };
  target.addEventListener('load', run);
  if (typeof target.document?.addEventListener === 'function') {
    target.document.addEventListener('visibilitychange', () => {
      if (target.document.visibilityState !== 'visible') return;
      const ready = navigatorRef.serviceWorker.ready;
      if (!ready || typeof ready.then !== 'function') return;
      ready.then(registration => updateQuietly(registration)).catch(() => {});
    });
  }
  navigatorRef.serviceWorker.addEventListener?.('controllerchange', () => {
    if (typeof target.dispatchEvent === 'function') {
      target.dispatchEvent(new CustomEvent('moyeora:service-worker-updated'));
    }
  });
}
