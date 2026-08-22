import './react-globals.js';
import './app.css';

const BOOT_RETRY_KEY = 'gather_boot_auto_retry';

function showBootStatus(msg) {
  const root = document.getElementById('root');
  if (!root || root.dataset.booted === '1') return;
  root.innerHTML = `<div style="min-height:100vh;display:flex;align-items:center;justify-content:center;font-family:system-ui,sans-serif;color:#64748B;font-size:14px;">${msg}</div>`;
}

async function boot() {
  try {
    showBootStatus('모여라 캘린더 불러오는 중…');
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
