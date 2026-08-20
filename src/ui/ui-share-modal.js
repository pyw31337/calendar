/**
 * ShareModal (P4-2). Site rule: URL + copy + QR.
 * Deps via window.GATHER_UI_DEPS at render time.
 */
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
      return window.location.origin + window.location.pathname + '?id=' + encodeURIComponent(id) + '&view=' + encodeURIComponent(view);
    };
    const getCalendarShareUrl = deps.getCalendarShareUrl || function (id) {
      return window.location.origin + window.location.pathname + '?id=' + encodeURIComponent(id);
    };

    const shareUrl = React.useMemo(function () {
      if (customUrl) return customUrl;
      if (shareType === 'chat') return getViewShareUrl(calendar.id, 'chat');
      if (shareType === 'places') return getViewShareUrl(calendar.id, 'places');
      if (shareType === 'memo') return getViewShareUrl(calendar.id, 'memo');
      if (shareType === 'gallery') return getViewShareUrl(calendar.id, 'gallery');
      return getCalendarShareUrl(calendar.id);
    }, [calendar, shareType, customUrl]);

    const shareTitle = shareType === 'chat' ? '채팅방 공유 URL'
      : shareType === 'places' ? '장소 공유 URL'
      : shareType === 'memo' ? '메모 공유 URL'
      : shareType === 'gallery' ? '갤러리 공유 URL'
      : shareType === 'settlement' ? '정산 공유 URL'
      : '캘린더 공유 URL';
    const shareLabel = shareType === 'chat' ? ('현재 채팅방 (' + calendar.id + ') 전용 공유 URL')
      : shareType === 'places' ? ('현재 장소 (' + calendar.id + ') 전용 공유 URL')
      : shareType === 'memo' ? ('현재 메모 (' + calendar.id + ') 전용 공유 URL')
      : shareType === 'gallery' ? ('현재 갤러리 (' + calendar.id + ') 전용 공유 URL')
      : shareType === 'settlement' ? ('현재 정산 (' + calendar.id + ') 전용 공유 URL')
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
        background: 'none', border: 'none', color: '#64748B', fontSize: '1.2rem',
        cursor: 'pointer', display: 'flex', alignItems: 'center'
      }
    }, React.createElement(SmallXIcon, { size: 20 }))), React.createElement('div', {
      className: 'modal-body'
    }, React.createElement('label', {
      style: { fontSize: '0.85rem', fontWeight: 700, color: '#64748B' }
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
        else alert(message);
      }
    }, 'URL 복사하기'),
    qrDataUrl && React.createElement('div', {
      style: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', marginTop: '16px' }
    },
      React.createElement('img', {
        src: qrDataUrl,
        alt: '캘린더 초대 QR코드',
        style: { borderRadius: '8px', border: '1px solid var(--border-subtle)' }
      }),
      React.createElement('span', {
        style: { fontSize: '0.76rem', color: 'var(--text-muted)' }
      }, 'QR코드를 카메라로 스캔해 접속하세요')
    ))));
  }

  if (typeof window !== 'undefined') {
  window.GATHER_UI_COMPONENTS = Object.assign({}, window.GATHER_UI_COMPONENTS || {}, {
    ShareModal: ShareModal
  });
}
