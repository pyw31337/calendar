/**
 * ConfirmDialog (P4-1). Deps at render: window.GATHER_UI_DEPS
 */

/* P6 ESM classic-compat: free names that live scripts shared via global lexical scope */
const GATHER_APP_CALENDAR_DATA = window.GATHER_APP_CALENDAR_DATA || {};
const GATHER_APP_CHAT_DATA = window.GATHER_APP_CHAT_DATA || {};
const GATHER_APP_UTILS = window.GATHER_APP_UTILS || {};
const GATHER_APP_CONSTANTS = window.GATHER_APP_CONSTANTS || {};
const GATHER_APP_CONFIG = window.GATHER_APP_CONFIG || {};
function __gatherUiDeps() { return window.GATHER_UI_DEPS || {}; }
function getActiveAvailabilities(calendar) {
  const f = __gatherUiDeps().getActiveAvailabilities || GATHER_APP_UTILS.getActiveAvailabilities;
  return typeof f === 'function' ? f(calendar) : [];
}
function getActiveParticipants(calendar) {
  const f = __gatherUiDeps().getActiveParticipants || GATHER_APP_UTILS.getActiveParticipants;
  return typeof f === 'function' ? f(calendar) : [];
}
function getCalendarPolls(calendar) {
  const f = __gatherUiDeps().getCalendarPolls || GATHER_APP_UTILS.getCalendarPolls;
  return typeof f === 'function' ? f(calendar) : [];
}
function getCalendarPlaces(calendar) {
  const f = __gatherUiDeps().getCalendarPlaces || GATHER_APP_UTILS.getCalendarPlaces;
  return typeof f === 'function' ? f(calendar) : [];
}
function useChatSendGuard(onSend, canSend) {
  const f = __gatherUiDeps().useChatSendGuard;
  return typeof f === 'function' ? f(onSend, canSend) : onSend;
}
function computeKoreanHolidaysForYear(year) {
  const f = __gatherUiDeps().computeKoreanHolidaysForYear;
  return typeof f === 'function' ? f(year) : [];
}
function getFooterFamilyLinks() {
  return __gatherUiDeps().FOOTER_FAMILY_LINKS || [];
}


function getDeps() { return window.GATHER_UI_DEPS || {}; }

  export function ConfirmDialog({ title, message, onConfirm, onCancel, showPasswordInput }) {
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
      className: 'modal-overlay', onClick: onCancel, style: { zIndex: 30000 }
    }, React.createElement(ResizableModalContainer, {
      className: 'modal-container',
      onClick: function (e) { e.stopPropagation(); },
      style: { maxWidth: '320px', padding: '20px', borderRadius: '12px' }
    }, React.createElement('div', { style: { textAlign: 'center', marginBottom: '20px' } },
      title ? React.createElement('h3', {
        style: { fontSize: '1.05rem', fontWeight: 800, marginBottom: '8px', color: 'var(--text-main)' }
      }, title) : null,
      React.createElement('p', {
        style: { fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: '1.5', wordBreak: 'keep-all' }
      }, message)
    ),
    showPasswordInput && React.createElement('div', { style: { marginBottom: '14px', textAlign: 'left' } },
      React.createElement('label', { style: { display: 'block', fontSize: '0.78rem', fontWeight: 'bold', color: 'var(--text-muted)', marginBottom: '6px' } }, '어드민 비밀번호'),
      React.createElement('input', {
        type: 'password', className: 'form-input', placeholder: '비밀번호 입력',
        value: password,
        onChange: function (e) { setPassword(e.target.value); setErrorMsg(''); },
        style: { width: '100%', boxSizing: 'border-box' }
      }),
      errorMsg && React.createElement('div', { style: { color: '#EF4444', fontSize: '0.72rem', marginTop: '4px', fontWeight: 'bold' } }, errorMsg)
    ),
    React.createElement('div', { style: { display: 'flex', gap: '8px', justifyContent: 'center' } },
      React.createElement('button', {
        type: 'button', className: 'btn btn-secondary', onClick: onCancel,
        style: { flex: 1, height: '36px', fontSize: '0.85rem' }
      }, '취소'),
      React.createElement('button', {
        type: 'button', className: 'btn btn-danger', onClick: handleConfirmClick,
        style: { flex: 1, height: '36px', fontSize: '0.85rem', backgroundColor: '#EF4444', color: '#FFFFFF', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }
      }, '확인')
    )));
  }

  if (typeof window !== 'undefined') {
  window.GATHER_UI_COMPONENTS = Object.assign({}, window.GATHER_UI_COMPONENTS || {}, { ConfirmDialog: ConfirmDialog });
}
