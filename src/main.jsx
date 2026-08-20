import './react-globals.js';
import './app.css';

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
    await import('./core/app-main.js');
  } catch (err) {
    console.error('[P6] boot failed', err);
    showBootStatus('로딩 실패. 새로고침 해주세요.');
  }
}

boot();
