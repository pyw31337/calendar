/**
 * ShareModal (P4-2). Site rule: URL + copy + QR.
 * Deps via window.GATHER_UI_DEPS at render time.
 */

/* P6 ESM classic-compat: free names that live scripts shared via global lexical scope */
function __gatherUiDeps() { return window.GATHER_UI_DEPS || {}; }
/* __fb() bridge */
function __fb() {
  const deps = __gatherUiDeps();
  if (deps && typeof deps.getDb === 'function') {
    try { const d = deps.getDb(); if (d) return d; } catch (e) {}
  }
  return (typeof window !== 'undefined' && window.__gatherFirebaseDb) || null;
}

function getDeps() { return window.GATHER_UI_DEPS || {}; }

  export function ShareModal(props) {
    const React = window.React;
    if (!React) return null;
    const calendar = props.calendar;
    const onClose = props.onClose;
    const shareType = props.shareType || 'calendar';
    const showToast = props.showToast;
    const customUrl = props.customUrl != null ? props.customUrl : null;

    const deps = getDeps();
    const ResizableModalContainer = deps.ResizableModalContainer || function FallbackShell(p) {
      return React.createElement('div', { className: p.className, onClick: p.onClick, style: p.style }, p.children);
    };
    const SmallXIcon = deps.SmallXIcon || function (p) {
      return React.createElement('span', { style: { fontSize: (p && p.size) || 20 } }, '\u00d7');
    };
    const KakaoTalkIcon = deps.KakaoTalkIcon || function () {
      return React.createElement('span', { style: { fontSize: '0.95rem' } }, '\ud83d\udcac');
    };
    const copyTextToClipboard = deps.copyTextToClipboard || async function (text) {
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(text);
          return true;
        }
      } catch (e) {}
      return false;
    };
    const getViewShareUrl = deps.getViewShareUrl || function (id, view) {
      const base = getCalendarShareUrl(id);
      if (!view || view === 'calendar') return base;
      return `${base}${encodeURIComponent(view)}/`;
    };
    const getCalendarShareUrl = deps.getCalendarShareUrl || function (id) {
      const basePath = String(window.location.pathname || '/').replace(/\/share(?:\/.*)?$/, '/').replace(/\/(?:index\.html)?$/, '/');
      const normalizedBasePath = basePath.endsWith('/') ? basePath : `${basePath}/`;
      return `${window.location.origin}${normalizedBasePath}share/${encodeURIComponent(id)}/`;
    };

    const shareUrl = React.useMemo(function () {
      if (customUrl) return customUrl;
      if (shareType === 'chat') return getViewShareUrl(calendar.id, 'chat');
      if (shareType === 'places') return getViewShareUrl(calendar.id, 'places');
      if (shareType === 'memo') return getViewShareUrl(calendar.id, 'memo');
      if (shareType === 'gallery') return getViewShareUrl(calendar.id, 'gallery');
      if (shareType === 'settlement') return getViewShareUrl(calendar.id, 'settlement');
      if (shareType === 'history') return getViewShareUrl(calendar.id, 'history');
      return getCalendarShareUrl(calendar.id);
    }, [calendar, shareType, customUrl]);

    const shareTitle = shareType === 'chat' ? '채팅방 공유 URL'
      : shareType === 'places' ? '장소 공유 URL'
      : shareType === 'memo' ? '메모 공유 URL'
      : shareType === 'gallery' ? '갤러리 공유 URL'
      : shareType === 'settlement' ? '정산 공유 URL'
      : shareType === 'history' ? '기록 공유 URL'
      : '캘린더 공유 URL';
    const shareLabel = shareType === 'chat' ? ('현재 채팅방 (' + calendar.id + ') 전용 공유 URL')
      : shareType === 'places' ? ('현재 장소 (' + calendar.id + ') 전용 공유 URL')
      : shareType === 'memo' ? ('현재 메모 (' + calendar.id + ') 전용 공유 URL')
      : shareType === 'gallery' ? ('현재 갤러리 (' + calendar.id + ') 전용 공유 URL')
      : shareType === 'settlement' ? ('현재 정산 (' + calendar.id + ') 전용 공유 URL')
      : shareType === 'history' ? ('현재 기록 (' + calendar.id + ') 전용 공유 URL')
      : ('현재 캘린더 (' + calendar.id + ') 전용 공유 URL');

    const qrDataUrl = React.useMemo(function () {
      if (typeof qrcode === 'undefined') return null;
      try {
        const qr = qrcode(0, 'M');
        qr.addData(shareUrl);
        qr.make();
        return qr.createDataURL(6, 8);
      } catch (e) {
        console.warn('QR code render failed:', e);
        return null;
      }
    }, [shareUrl]);

    return React.createElement('div', {
      className: 'modal-overlay',
      onClick: onClose,
      style: { zIndex: 11000 }
    }, React.createElement(ResizableModalContainer, {
      className: 'modal-container',
      onClick: function (e) { e.stopPropagation(); }
    }, React.createElement('div', {
      className: 'modal-header',
      style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' }
    }, React.createElement('h3', {
      style: { fontSize: '1.1rem', fontWeight: 800 }
    }, shareTitle), React.createElement('button', {
      onClick: onClose,
      style: {
        background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.2rem',
        cursor: 'pointer', display: 'flex', alignItems: 'center'
      }
    }, React.createElement(SmallXIcon, { size: 20 }))), React.createElement('div', {
      className: 'modal-body'
    }, React.createElement('label', {
      style: { fontSize: 'var(--font-size-base)', fontWeight: 700, color: 'var(--text-muted)' }
    }, shareLabel), React.createElement('input', {
      type: 'text',
      className: 'form-input',
      style: { width: '100%' },
      value: shareUrl,
      readOnly: true
    }), React.createElement('button', {
      className: 'btn btn-primary',
      onClick: async function () {
        const ok = await copyTextToClipboard(shareUrl);
        const message = ok ? 'URL이 복사되었습니다!' : '복사에 실패했습니다. URL을 직접 선택해 복사해 주세요.';
        if (showToast) showToast(message, ok ? 'success' : 'error');
        else console.warn(message);
      }
    }, 'URL 복사하기'),
    qrDataUrl && React.createElement('div', {
      style: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', marginTop: '16px' }
    },
      React.createElement('img', {
        src: qrDataUrl,
        alt: '캘린더 초대 QR코드',
        style: { borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }
      }),
      React.createElement('span', {
        style: { fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }
      }, 'QR코드를 카메라로 스캔해 접속하세요')
    ),

    /* Step 4: KakaoTalk / Native Web Share API Section */
    React.createElement('div', {
      style: {
        marginTop: '14px', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)',
        display: 'flex', flexDirection: 'column', gap: '8px'
      }
    },
      React.createElement('label', {
        style: { fontSize: 'var(--font-size-base)', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }
      }, React.createElement(KakaoTalkIcon, { size: 18 }), '카카오톡으로 공유하기'),
      React.createElement('div', {
        style: { display: 'flex', gap: '6px', flexWrap: 'wrap' }
      },
        /* Native Web Share Button (if supported) */
        typeof navigator !== 'undefined' && typeof navigator.share === 'function' && React.createElement('button', {
          type: 'button',
          className: 'btn',
          onClick: function () {
            navigator.share({
              title: `${calendar?.title || '모아엘가'} 캘린더`,
              text: `[${calendar?.title || '모아엘가'}] 캘린더 모임 일정과 장소를 확인해 보세요!`,
              url: shareUrl
            }).catch(function (e) {
              console.warn('Native share cancelled:', e);
            });
          },
          style: {
            flex: '1 1 100%', height: '38px', borderRadius: '8px',
            backgroundColor: '#FEE500', color: '#191919', border: 'none',
            fontSize: 'var(--font-size-md)', fontWeight: 800, cursor: 'pointer',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
          }
        }, React.createElement(KakaoTalkIcon, { size: 16 }), '카카오톡 공유'),

        /* Custom Share Invitation Text Copy Button */
        React.createElement('button', {
          type: 'button',
          className: 'btn',
          onClick: async function () {
            const text = `[${calendar?.title || '모아엘가'} 캘린더 초대]\n모임 일정 및 장소 확인하기:\n${shareUrl}`;
            const ok = await copyTextToClipboard(text);
            if (showToast) showToast(ok ? '초대 문구가 복사되었습니다! 카카오톡에 붙여넣어 공유하세요.' : '복사 실패', ok ? 'success' : 'error');
          },
          style: {
            flex: '1 1 100%', height: '36px', borderRadius: '8px',
            backgroundColor: 'var(--bg-primary)', color: 'var(--text-main)', border: '1px solid var(--border-subtle)',
            fontSize: 'var(--font-size-md)', fontWeight: 700, cursor: 'pointer',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '4px'
          }
        }, '✉️ 초대 메시지 복사')
      )
    ))));
  }

  if (typeof window !== 'undefined') {
  window.GATHER_UI_COMPONENTS = Object.assign({}, window.GATHER_UI_COMPONENTS || {}, {
    ShareModal: ShareModal
  });
}
