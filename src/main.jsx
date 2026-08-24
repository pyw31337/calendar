import './react-globals.js';
import './app.css';

const BOOT_RETRY_KEY = 'gather_boot_auto_retry';

function showBootStatus(msg) {
  const root = document.getElementById('root');
  if (!root || root.dataset.booted === '1') return;
  root.innerHTML = `<div style="min-height:100vh;display:flex;align-items:center;justify-content:center;font-family:system-ui,sans-serif;color:#64748B;font-size:14px;">${msg}</div>`;
}

// index.html used to load these as plain synchronous <head> <script src> tags, which browsers
// never retry on failure -- one transient network hiccup meant window.firebase stayed undefined
// for the rest of that page load, with no error surfaced anywhere (app-firebase-data.js's own
// firebase.initializeApp() call is wrapped in a try/catch that just console.warns and lets the
// app boot in a silently Firebase-less state: no calendar data, no chat, no gallery, nothing
// that reads from Firestore, but otherwise a normally-rendering page). A cold app launch (Android
// "홈 화면에 추가" WebAPK icon, opened after the OS froze/killed the process) is far more likely
// to hit exactly that kind of brief network-not-ready window than a tab in an already-warm
// browser, which is why this consistently showed up as "installed app can't load anything" while
// the same site in a regular tab worked fine. Retrying (like the HEIC CDN fallbacks and boot()'s
// own dynamic-import reload already do elsewhere in this app) turns that transient failure into a
// short delay instead of a silent, permanent no-data state.
// Bounded so a script request that neither fires onload nor onerror (stalls indefinitely on a
// bad connection instead of failing outright) can't hang loadFirebaseSdk forever -- without this
// a single stuck request meant boot() never reached __gatherStartApp() at all.
function loadScriptOnce(src, timeoutMs = 8000) {
  return new Promise((resolve, reject) => {
    let settled = false;
    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      reject(new Error(`script load timed out: ${src}`));
    }, timeoutMs);
    const el = document.createElement('script');
    el.src = src;
    el.onload = () => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve();
    };
    el.onerror = () => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      reject(new Error(`script load failed: ${src}`));
    };
    document.head.appendChild(el);
  });
}
async function loadScriptWithRetry(src, timeoutMs, attempts = 3, delayMs = 700) {
  let lastErr;
  for (let i = 0; i < attempts; i += 1) {
    try {
      await loadScriptOnce(src, timeoutMs);
      return;
    } catch (err) {
      lastErr = err;
      if (i < attempts - 1) await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
  console.warn('[P6] Firebase SDK script failed to load after retries -- app will boot without Firestore/Storage:', lastErr);
}
// firebase-app-compat.js must finish (it defines window.firebase itself) before the other two
// compat scripts, which only extend that existing global, can run -- kept sequential to match the
// same execution order the removed <head> <script> tags guaranteed by HTML parse order.
//
// Vendored under vendor/ (see public-vite/vendor/, copied into dist/ by
// copy-static-to-dist.mjs) and loaded as a same-origin relative path instead of from
// www.gstatic.com. A live diagnostic report (the "연결 오류" toast now includes the actual
// failure reason -- see app-firebase-data.js's attemptFirebaseInit) confirmed a real device
// consistently got `window.firebase undefined` even after every timeout/retry adjustment tried
// here, meaning the SDK script itself was never reaching that browser at all -- something on
// that network path (DNS-level filtering, a privacy resolver, an extension) was blocking
// www.gstatic.com specifically, while the site's own origin loaded fine. No amount of waiting or
// retrying fixes a route that's actually blocked; serving these files from the same origin as
// the rest of the app removes the separate CDN dependency entirely. Per-file timeouts are kept
// (not one flat value) since firebase-firestore-compat.js is ~340KB, about 8-12x the other two
// files (~29KB / ~40KB).
async function loadFirebaseSdk() {
  await loadScriptWithRetry('vendor/firebase-app-compat.js', 12000);
  await loadScriptWithRetry('vendor/firebase-firestore-compat.js', 30000);
  await loadScriptWithRetry('vendor/firebase-storage-compat.js', 15000);
}

async function boot() {
  try {
    showBootStatus('모여라 캘린더 불러오는 중…');
    // Loaded and awaited FIRST, before any of the dynamic imports below -- an earlier version
    // kicked this off in parallel with them to save a little latency, but that meant it was
    // competing for bandwidth with ~30 concurrent chunk fetches on a slow/cold mobile connection
    // (exactly the condition this retry logic exists for), which made Firebase fail to load more
    // often, not less. Loading it first and alone most closely matches the original behavior
    // (a render-blocking <script> in <head>, which reliably worked) while still adding retries.
    await loadFirebaseSdk();
    await Promise.all([
      import('./core/app-constants.js'),
      import('./core/app-config.js'),
      import('./core/app-calendar-data.js'),
      import('./core/app-chat-data.js'),
      import('./core/app-utils.js'),
      import('./core/app-notifications.js'),
      import('./core/firebase-services.js')
    ]);
    await Promise.all([
      import('./ui/ui-icons.js'),
      import('./ui/ui-confirm-dialog.js'),
      import('./ui/ui-share-modal.js'),
      import('./ui/ui-overlays.js'),
      import('./ui/ui-widgets.js'),
      import('./ui/ui-chat-sheets.js'),
      import('./ui/ui-user-manual.js'),
      import('./ui/ui-weather.js'),
      import('./ui/ui-side-menu.js'),
      import('./ui/ui-misc.js'),
      import('./ui/ui-place-register.js'),
      import('./ui/ui-lightbox.js'),
      import('./ui/ui-chat-gallery.js'),
      import('./ui/ui-remaining.js'),
      import('./ui/ui-summary-gallery.js'),
      import('./ui/ui-shared.js'),
      import('./ui/ui-places.js'),
      import('./ui/ui-memo-view.js'),
      import('./ui/ui-chat-room.js'),
      import('./ui/ui-date-modal.js'),
      import('./ui/ui-event-modals.js'),
      import('./ui/ui-calendar-core.js'),
      import('./ui/ui-admin-modals.js'),
      import('./ui/ui-admin-dashboard.js')
    ]);
    const root = document.getElementById('root');
    if (root) root.dataset.booted = '1';
    window.__GATHER_BOOT_READY__ = true;
    // firebase SDK is already fully loaded (awaited above, before any imports started), so
    // app-firebase-data.js's top-level firebase.initializeApp() call (evaluated as part of this
    // import) can safely assume window.firebase exists.
    await import('./core/app-main.js');
    if (typeof window.__gatherStartApp === 'function') window.__gatherStartApp();
    try { sessionStorage.removeItem(BOOT_RETRY_KEY); } catch (_) {}
  } catch (err) {
    console.error('[P6] boot failed', err);
    // The most common real cause here is a stale cached index.html (from before this tab was
    // backgrounded) still pointing at content-hashed chunk files a newer deploy has since
    // replaced -- every deploy fully replaces the site, so those old chunk URLs 404 and the
    // dynamic imports above reject. sw.js's own fix (forcing navigations to bypass the HTTP
    // cache) should prevent that at the source, but this is the fallback for whatever still slips
    // through (a mid-navigation deploy race, a browser that ignores the no-store hint, etc.): one
    // automatic hard reload, which fetches this same page fresh and gets the chunk hashes that
    // are actually live right now. Guarded by a per-tab flag so a genuinely offline device or a
    // real bug doesn't reload-loop forever -- it gets exactly one free retry, then the manual
    // message.
    let alreadyRetried = false;
    try { alreadyRetried = sessionStorage.getItem(BOOT_RETRY_KEY) === '1'; } catch (_) {}
    if (!alreadyRetried) {
      try { sessionStorage.setItem(BOOT_RETRY_KEY, '1'); } catch (_) {}
      showBootStatus('불러오는 중… (자동 재시도)');
      window.location.reload();
      return;
    }
    showBootStatus('로딩 실패. 새로고침 해주세요.');
  }
}

boot();
