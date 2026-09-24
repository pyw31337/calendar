/**
 * Recover from a deploy that happened while the page was open.
 *
 * Every Vite chunk is content-hashed and GitHub Pages keeps no previous build, so a tab opened
 * before a deploy asks for chunk names that no longer exist the first time it opens a lazily
 * loaded screen (memo, chat, places, a modal...). Production client_error logs show exactly
 * this ("Failed to fetch dynamically imported module .../ui-memo-view-<old hash>.js"), and the
 * screen simply never opens. Reloading fetches the current index.html (navigations always hit
 * the network, see sw.js) and with it the current chunk names.
 *
 * At most one automatic reload per RELOAD_COOLDOWN_MS, so a genuinely missing chunk or an
 * offline device cannot loop.
 */
const STALE_CHUNK_PATTERNS = [
  /Failed to fetch dynamically imported module/i, // Chromium
  /Importing a module script failed/i, // Safari
  /error loading dynamically imported module/i, // Firefox
  /Unable to preload CSS for/i // Vite CSS preload
];
const RELOAD_KEY = 'gather_stale_chunk_reload_at';
const RELOAD_COOLDOWN_MS = 10 * 60 * 1000;

export function isStaleChunkError(value) {
  const text = value instanceof Error ? value.message : String(value?.message || value || '');
  return STALE_CHUNK_PATTERNS.some(pattern => pattern.test(text));
}

export function installStaleChunkRecovery(target, {
  storage = (() => { try { return target.sessionStorage; } catch (_) { return null; } })(),
  now = () => Date.now(),
  reload = () => target.location.reload(),
  isOnline = () => !target.navigator || target.navigator.onLine !== false
} = {}) {
  if (!target) return () => false;
  const tryReload = (reason) => {
    if (!isStaleChunkError(reason) || !isOnline()) return false;
    let last = 0;
    try { last = Number(storage && storage.getItem(RELOAD_KEY)) || 0; } catch (_) {}
    if (now() - last < RELOAD_COOLDOWN_MS) return false;
    try { if (storage) storage.setItem(RELOAD_KEY, String(now())); } catch (_) {}
    reload();
    return true;
  };
  // Vite's own signal for a failed dynamic-import preload; preventDefault stops the rethrow.
  target.addEventListener('vite:preloadError', event => { if (tryReload(event?.payload)) event.preventDefault?.(); });
  target.addEventListener('unhandledrejection', event => { tryReload(event?.reason); });
  target.addEventListener('error', event => { tryReload(event?.error || event?.message); });
  return tryReload;
}
