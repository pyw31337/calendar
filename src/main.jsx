import './react-globals.js';
import './app.css';

const BOOT_RETRY_KEY = 'gather_boot_auto_retry';
const FIREBASE_SDK_VERSION = (() => {
  if (typeof window !== 'undefined' && window.__GATHER_FIREBASE_SDK_VERSION) {
    return window.__GATHER_FIREBASE_SDK_VERSION;
  }
  let version;
  try {
    const url = new URL(import.meta.url, window.location.href);
    version = `${url.pathname.split('/').pop() || ''}${url.search || ''}`;
  } catch (_) {
    version = String(Date.now());
  }
  if (typeof window !== 'undefined') window.__GATHER_FIREBASE_SDK_VERSION = version;
  return version;
})();
const firebaseScriptLoadPromises = new Map();

function resolveFirebaseSdkUrl(src) {
  const absolute = new URL(src, window.location.href);
  absolute.searchParams.set('v', FIREBASE_SDK_VERSION);
  return absolute.toString();
}

function showBootStatus(msg) {
  const root = document.getElementById('root');
  if (!root || root.dataset.booted === '1') return;
  root.innerHTML = `<div style="min-height:100vh;display:flex;align-items:center;justify-content:center;font-family:system-ui,sans-serif;color:#64748B;font-size:0.88rem;">${msg}</div>`;
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
  const resolvedSrc = resolveFirebaseSdkUrl(src);
  const inflight = firebaseScriptLoadPromises.get(resolvedSrc);
  if (inflight) return inflight;
  const promise = new Promise((resolve, reject) => {
    let settled = false;
    const el = document.createElement('script');
    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      // A PC Whale user's console showed "Firebase is already defined in the global scope"
      // followed by Firestore permanently refusing to reapply its transport settings -- traced
      // to exactly this: a slow-but-not-actually-failed request outliving its timeout, so
      // loadScriptWithRetry fires a second <script> tag for the same file while the first is
      // still in flight, and BOTH eventually execute (each redefining window.firebase from
      // scratch). Detaching this element's handlers and removing it from the document before
      // rejecting stops it from executing later if the response does eventually arrive.
      el.onload = null;
      el.onerror = null;
      el.remove();
      firebaseScriptLoadPromises.delete(resolvedSrc);
      reject(new Error(`script load timed out: ${resolvedSrc}`));
    }, timeoutMs);
    el.src = resolvedSrc;
    el.onload = () => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      firebaseScriptLoadPromises.delete(resolvedSrc);
      resolve();
    };
    el.onerror = () => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      firebaseScriptLoadPromises.delete(resolvedSrc);
      reject(new Error(`script load failed: ${resolvedSrc}`));
    };
    document.head.appendChild(el);
  });
  firebaseScriptLoadPromises.set(resolvedSrc, promise);
  return promise;
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
  // index.html preloads these same-origin files with defer. Only load a missing piece here;
  // injecting every file again used to race the deferred tags and could replace window.firebase
  // while app-firebase-data.js was initializing, leaving some browsers with no usable SDK.
  if (typeof window.firebase === 'undefined') {
    await loadScriptWithRetry('vendor/firebase-app-compat.js', 12000);
  }
  if (typeof window.firebase === 'undefined' || typeof window.firebase.firestore !== 'function') {
    await loadScriptWithRetry('vendor/firebase-firestore-compat.js', 30000);
  }
  if (typeof window.firebase === 'undefined' || typeof window.firebase.storage !== 'function') {
    await loadScriptWithRetry('vendor/firebase-storage-compat.js', 15000);
  }
}

// Admin UI is not needed for the initial calendar view, but it is also reachable from
// the main screen's side menu. Keep it lazy while exposing the same loader to app-main so
// opening "캘린더 설정" can load the modal before rendering it.
let adminUiLoadPromise = null;
function loadAdminUi() {
  if (window.GATHER_UI_COMPONENTS && typeof window.GATHER_UI_COMPONENTS.AdminModal === 'function') {
    return Promise.resolve();
  }
  if (!adminUiLoadPromise) {
    adminUiLoadPromise = Promise.all([
      import('./ui/ui-admin-modals.js'),
      import('./ui/ui-admin-dashboard.js')
    ]).catch(err => {
      adminUiLoadPromise = null;
      throw err;
    });
  }
  return adminUiLoadPromise;
}
window.__gatherLoadAdminUi = loadAdminUi;

let manualUiLoadPromise = null;
function loadManualUi() {
  if (window.GATHER_UI_COMPONENTS && typeof window.GATHER_UI_COMPONENTS.UserManualOverlay === 'function') {
    return Promise.resolve();
  }
  if (!manualUiLoadPromise) {
    manualUiLoadPromise = import('./ui/ui-user-manual.js').catch(err => {
      manualUiLoadPromise = null;
      throw err;
    });
  }
  return manualUiLoadPromise;
}
window.__gatherLoadManualUi = loadManualUi;

let chatUiLoadPromise = null;
function loadChatUi() {
  const components = window.GATHER_UI_COMPONENTS || {};
  if (typeof components.ChatRoomView === 'function' && typeof components.ChatGalleryModal === 'function') {
    return Promise.resolve();
  }
  if (!chatUiLoadPromise) {
    chatUiLoadPromise = Promise.all([
      import('./ui/ui-chat-sheets.js'),
      import('./ui/ui-chat-gallery.js'),
      import('./ui/ui-chat-room.js')
    ]).catch(err => {
      chatUiLoadPromise = null;
      throw err;
    });
  }
  return chatUiLoadPromise;
}
window.__gatherLoadChatUi = loadChatUi;

const viewUiLoaders = {
  memo: () => import('./ui/ui-memo-view.js'),
  places: () => import('./ui/ui-places.js')
};
const viewUiLoadPromises = new Map();
function loadViewUi(view) {
  const loader = viewUiLoaders[view];
  if (!loader) return Promise.resolve();
  const componentName = view === 'memo' ? 'MemoView' : 'PlacesView';
  if (window.GATHER_UI_COMPONENTS && typeof window.GATHER_UI_COMPONENTS[componentName] === 'function') {
    return Promise.resolve();
  }
  if (!viewUiLoadPromises.has(view)) {
    viewUiLoadPromises.set(view, loader().catch(err => {
      viewUiLoadPromises.delete(view);
      throw err;
    }));
  }
  return viewUiLoadPromises.get(view);
}
window.__gatherLoadViewUi = loadViewUi;

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
      import('./core/app-place-search.js'),
      import('./core/app-notifications.js'),
      import('./core/firebase-services.js')
    ]);
    await Promise.all([
      import('./ui/ui-icons.js'),
      import('./ui/ui-confirm-dialog.js'),
      import('./ui/ui-share-modal.js'),
      import('./ui/ui-overlays.js'),
      import('./ui/ui-widgets.js'),
      import('./ui/ui-weather.js'),
      import('./ui/ui-side-menu.js'),
      import('./ui/ui-misc.js'),
      import('./ui/ui-place-register.js'),
      import('./ui/ui-lightbox.js'),
      import('./ui/ui-remaining.js'),
      import('./ui/ui-summary-gallery.js'),
      import('./ui/ui-shared.js'),
      import('./ui/ui-date-modal.js'),
      import('./ui/ui-event-modals.js'),
      import('./ui/ui-calendar-core.js'),
      // ChatParticipantSheet (the actual participant-selection bottom sheet, vs. the button
      // that opens it) lives in this file, but it isn't chat-specific -- the memo composer/edit
      // modal, the comment composer, and the chat message reassignment modal in
      // ui-calendar-core.js all open it too. It used to load only via loadChatUi() (view=chat or
      // gallery), so opening the picker from memo/comments/edit before ever visiting chat in the
      // same session found window.GATHER_UI_COMPONENTS.ChatParticipantSheet unset and silently
      // rendered nothing. Loading it here unconditionally, alongside every other always-on
      // shared UI module, makes it available regardless of which view boots first.
      import('./ui/ui-chat-sheets.js')
    ]);
    // Admin dashboard/modals are normally loaded only for a direct admin route. The main
    // screen can also request AdminModal from its side menu; that path uses loadAdminUi above.
    const params = new URLSearchParams(window.location.search);
    const isAdminRoute = params.get('admin') === '1' || params.get('mode') === 'admin';
    const initialView = params.get('view') || 'calendar';
    if (initialView === 'chat' || initialView === 'gallery') {
      await loadChatUi();
    }
    if (initialView === 'memo' || initialView === 'places') {
      await loadViewUi(initialView);
    }
    if (isAdminRoute) {
      await loadAdminUi();
    }
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
      try {
        const u = new URL(window.location.href);
        u.searchParams.set('_boot', String(Date.now()));
        window.location.replace(u.toString());
      } catch (_) {
        window.location.reload();
      }
      return;
    }
    const detail = (err && (err.message || String(err))) || '';
    showBootStatus('로딩 실패. 새로고침 해주세요.' + (detail ? `<div style="margin-top:8px;font-size:0.75rem;opacity:.75;max-width:320px;text-align:center;word-break:break-word;">${detail.replace(/[<>&]/g, c => ({'<':'&lt;','>':'&gt;','&':'&amp;'}[c]))}</div>` : ''));
  }
}

boot();
