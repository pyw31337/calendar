/**
 * ConfirmDialog (P4-1). Deps at render: window.GATHER_UI_DEPS
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

  export function ConfirmDialog({ title, message, onConfirm, onCancel, showPasswordInput, alertOnly }) {
    const React = window.React;
    if (!React) return null;
    const deps = getDeps();
    const ResizableModalContainer = deps.ResizableModalContainer || function FallbackShell(props) {
      return React.createElement('div', { className: props.className, onClick: props.onClick, style: props.style }, props.children);
    };
    const verifyAdminPasswordRemote = deps.verifyAdminPasswordRemote || async function () { return false; };

    const [password, setPassword] = React.useState('');
    const [errorMsg, setErrorMsg] = React.useState('');

    React.useEffect(function () {
      const onKeyDown = function (e) {
        if (e.key === 'Escape') onCancel();
        if (e.key === 'Enter') handleConfirmClick();
      };
      document.addEventListener('keydown', onKeyDown);
      return function () { document.removeEventListener('keydown', onKeyDown); };
    }, [password]);

    const handleConfirmClick = async function () {
      if (showPasswordInput) {
        if (!password) { setErrorMsg('비밀번호를 입력하세요.'); return; }
        let ok;
        try { ok = await verifyAdminPasswordRemote(password); }
        catch (err) { setErrorMsg((err && err.message) || '비밀번호 확인 중 오류가 발생했습니다.'); return; }
        if (!ok) { setErrorMsg('비밀번호가 일치하지 않습니다.'); return; }
      }
      onConfirm();
    };

    return React.createElement('div', {
      // Must outrank every other overlay in the app, including the Lightbox (zIndex 50000) --
      // ConfirmDialog can be triggered from inside it (e.g. photo delete), and at 30000 it used
      // to render behind the Lightbox overlay, making the confirm prompt invisible.
      className: 'modal-overlay', onClick: onCancel, style: { zIndex: 200000 }
    }, React.createElement(ResizableModalContainer, {
      className: 'modal-container confirm-dialog-modal',
      onClick: function (e) { e.stopPropagation(); },
      style: { maxWidth: '320px', borderRadius: 'var(--radius-md)' }
    }, React.createElement('div', { className: 'confirm-dialog-body', style: { textAlign: 'center', marginBottom: '16px' } },
      title ? React.createElement('h3', {
        style: { fontSize: '1.05rem', fontWeight: 800, marginBottom: '8px', color: 'var(--text-main)' }
      }, title) : null,
      React.createElement('p', {
        style: { fontSize: 'var(--font-size-base)', color: 'var(--text-muted)', lineHeight: '1.5', wordBreak: 'keep-all' }
      }, message)
    ),
    showPasswordInput && React.createElement('div', { style: { marginBottom: '14px', textAlign: 'left' } },
      React.createElement('label', { style: { display: 'block', fontSize: 'var(--font-size-md)', fontWeight: 'bold', color: 'var(--text-muted)', marginBottom: '6px' } }, '어드민 비밀번호'),
      React.createElement('input', {
        type: 'password', className: 'form-input', placeholder: '비밀번호 입력',
        value: password,
        onChange: function (e) { setPassword(e.target.value); setErrorMsg(''); },
        style: { width: '100%', boxSizing: 'border-box' }
      }),
      errorMsg && React.createElement('div', { style: { color: '#EF4444', fontSize: 'var(--font-size-sm)', marginTop: '4px', fontWeight: 'bold' } }, errorMsg)
    ),
    React.createElement('div', { className: 'confirm-dialog-actions', style: { display: 'flex', gap: '10px', justifyContent: 'center' } },
      // alertOnly is a plain single-button notice (e.g. "현재 진행중인 투표가 없습니다") --
      // there's nothing to confirm/cancel between, so skip the 취소 button and the danger-red
      // styling that only makes sense for an actual destructive confirmation.
      !alertOnly && React.createElement('button', {
        type: 'button', className: 'btn btn-secondary', onClick: onCancel,
        style: { flex: 1, height: '44px', minHeight: '44px', fontSize: 'var(--font-size-base)' }
      }, '취소'),
      React.createElement('button', {
        type: 'button', className: alertOnly ? 'btn btn-primary' : 'btn btn-danger', onClick: handleConfirmClick,
        style: alertOnly
          ? { flex: 1, height: '44px', minHeight: '44px', fontSize: 'var(--font-size-base)' }
          : { flex: 1, height: '44px', minHeight: '44px', fontSize: 'var(--font-size-base)', backgroundColor: '#EF4444', color: '#FFFFFF', border: 'none', borderRadius: 'var(--radius-md)', fontWeight: 'bold', cursor: 'pointer' }
      }, '확인')
    )));
  }

  if (typeof window !== 'undefined') {
  window.GATHER_UI_COMPONENTS = Object.assign({}, window.GATHER_UI_COMPONENTS || {}, { ConfirmDialog: ConfirmDialog });
}
