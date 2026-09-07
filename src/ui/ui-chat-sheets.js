/**
 * Chat participant sheet + notification permission help (P4-7)
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

function isNotificationSupported(...args) {
  const f = (window.GATHER_APP_NOTIFICATIONS || {}).isNotificationSupported;
  return typeof f === 'function' ? f(...args) : undefined;
}
function requestChatNotificationPermission(...args) {
  const f = (window.GATHER_APP_NOTIFICATIONS || {}).requestChatNotificationPermission;
  return typeof f === 'function' ? f(...args) : undefined;
}
function getNotificationDiagnostics(...args) {
  const f = (window.GATHER_APP_NOTIFICATIONS || {}).getNotificationDiagnostics;
  return typeof f === 'function' ? f(...args) : undefined;
}
function getBrowserLabelForNotifications(...args) {
  const f = (window.GATHER_APP_NOTIFICATIONS || {}).getBrowserLabelForNotifications;
  return typeof f === 'function' ? f(...args) : undefined;
}
function getNotificationPermissionHelpSteps(...args) {
  const f = (window.GATHER_APP_NOTIFICATIONS || {}).getNotificationPermissionHelpSteps;
  return typeof f === 'function' ? f(...args) : undefined;
}
function isIOSDevice(...args) {
  const f = (window.GATHER_APP_NOTIFICATIONS || {}).isIOSDevice;
  return typeof f === 'function' ? f(...args) : undefined;
}
function isInstalledStandalonePwa(...args) {
  const f = (window.GATHER_APP_NOTIFICATIONS || {}).isInstalledStandalonePwa;
  return typeof f === 'function' ? f(...args) : undefined;
}
function probeNotificationCapability(...args) {
  const f = (window.GATHER_APP_NOTIFICATIONS || {}).probeNotificationCapability;
  return typeof f === 'function' ? f(...args) : undefined;
}

export function ChatParticipantSheet({ calendar, selectedId, onSelect, onClose }) {
  const React = window.React;
  const __deps = window.GATHER_UI_DEPS || {};
  const __comp = window.GATHER_UI_COMPONENTS || {};
  const ParticipantSelectSheet = __comp.ParticipantSelectSheet || __deps.ParticipantSelectSheet;

  return /*#__PURE__*/React.createElement(ParticipantSelectSheet, {
    calendar: calendar,
    title: "작성자 선택",
    isOptionSelected: id => selectedId === id,
    onSelect: id => { onSelect(id); onClose(); },
    onClose: onClose
  });
}

export function NotificationPermissionHelpModal({ onClose, onRetry, showToast }) {
  const React = window.React;
  const __deps = window.GATHER_UI_DEPS || {};
  const SmallXIcon = __deps.SmallXIcon;
  const BellIcon = __deps.BellIcon;

  const browserLabel = getBrowserLabelForNotifications();
  const isIosBlocked = isIOSDevice() && !isInstalledStandalonePwa();
  // Notification.permission can read 'granted' on iOS even in a regular browser tab, where push
  // is architecturally impossible until the site is added to the Home Screen -- treat that case
  // as its own status rather than trusting the raw permission value, so the headline sentence
  // doesn't tell the user everything is already "허용됨" (allowed) when it isn't actually usable.
  const permission = isIosBlocked ? 'ios-not-installed' : (isNotificationSupported() ? Notification.permission : 'unsupported');
  const steps = getNotificationPermissionHelpSteps();
  const diagnostics = getNotificationDiagnostics();
  const canRequestPermission = permission === 'default';
  const isPermissionBlocked = permission === 'denied';
  const handleRetry = async () => {
    if (!isNotificationSupported()) {
      if (showToast) showToast('이 브라우저는 알림을 지원하지 않습니다.', 'error', 5000);
      return;
    }
    if (isIosBlocked) {
      if (showToast) showToast('iOS는 홈 화면에 추가한 앱에서만 채팅알림을 받을 수 있습니다.', 'error', 6000);
      return;
    }
    if (Notification.permission === 'denied') {
      if (showToast) showToast('이미 차단된 권한은 브라우저 설정에서만 해제할 수 있습니다.', 'error', 6000);
      return;
    }
    const result = await requestChatNotificationPermission();
    if (result !== 'granted') {
      if (showToast) showToast('알림 권한을 허용해야 채팅알림을 받을 수 있습니다.', 'error', 6000);
      return;
    }
    const capability = await probeNotificationCapability();
    if (!capability.ok) {
      if (showToast) showToast(capability.reason === 'ios-not-installed' ? 'iOS는 홈 화면에 추가한 앱에서만 채팅알림을 받을 수 있습니다.' : '이 환경에서는 알림을 받을 수 없습니다.', 'error', 6000);
      return;
    }
    if (showToast) showToast('알림 권한이 허용되었습니다. 채팅알림을 다시 켭니다.', 'success', 3500);
    if (onRetry) await onRetry();
  };
  const statusLabel = permission === 'granted' ? '허용됨' : permission === 'denied' ? '브라우저에서 차단됨' : permission === 'default' ? '권한 요청 가능' : permission === 'ios-not-installed' ? 'iOS 홈 화면 추가 필요' : '미지원';
  const primaryButtonLabel = permission === 'ios-not-installed'
    ? '홈 화면 추가 방법 확인'
    : isPermissionBlocked
      ? '설정 변경 후 다시 시도'
      : canRequestPermission
        ? '브라우저 권한 요청하기'
        : '권한 다시 확인';
  return ReactDOM.createPortal(/*#__PURE__*/React.createElement("div", {
    className: "modal-overlay",
    role: "dialog",
    "aria-modal": "true",
    "aria-label": "채팅알림 권한 안내",
    onClick: onClose,
    style: { zIndex: 10080 }
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal",
    onClick: e => e.stopPropagation(),
    style: { maxWidth: '460px' }
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal-header"
  }, /*#__PURE__*/React.createElement("h3", null, "채팅알림 권한 필요"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn-icon",
    onClick: onClose,
    "aria-label": "닫기"
  }, /*#__PURE__*/React.createElement(SmallXIcon, { size: 22 }))), /*#__PURE__*/React.createElement("div", {
    className: "modal-body",
    style: { display: 'flex', flexDirection: 'column', gap: '14px' }
  }, /*#__PURE__*/React.createElement("div", {
    style: { display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '14px', borderRadius: 'var(--radius-md)', background: 'rgba(59, 130, 246, 0.1)', color: '#1D4ED8' }
  }, /*#__PURE__*/React.createElement("span", {
    style: { display: 'inline-flex', width: '34px', height: '34px', borderRadius: 'var(--radius-sm)', background: '#2563EB', color: '#FFFFFF', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }
  }, /*#__PURE__*/React.createElement(BellIcon, null)), /*#__PURE__*/React.createElement("div", {
    style: { fontSize: 'var(--font-size-base)', lineHeight: 1.55, fontWeight: 700 }
  }, browserLabel, "에서 현재 알림 권한 상태는 ", /*#__PURE__*/React.createElement("strong", null, statusLabel), "입니다. 채팅알림을 받으려면 이 사이트의 알림 권한이 허용되어야 합니다.")),
  isPermissionBlocked && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '12px 14px',
      borderRadius: 'var(--radius-md)',
      background: 'rgba(239, 68, 68, 0.1)',
      color: '#B91C1C',
      border: '1px solid rgba(239, 68, 68, 0.22)',
      fontSize: 'var(--font-size-md)',
      fontWeight: 800,
      lineHeight: 1.5
    }
  }, "이미 차단된 알림 권한은 브라우저 보안정책 때문에 웹페이지가 직접 켤 수 없습니다. 아래 순서대로 사이트 알림을 허용한 뒤 다시 시도해 주세요."),
  canRequestPermission && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '12px 14px',
      borderRadius: 'var(--radius-md)',
      background: 'rgba(16, 185, 129, 0.1)',
      color: '#047857',
      border: '1px solid rgba(16, 185, 129, 0.22)',
      fontSize: 'var(--font-size-md)',
      fontWeight: 800,
      lineHeight: 1.5
    }
  }, "지금은 권한 요청이 가능한 상태입니다. 아래 버튼을 누르면 브라우저의 알림 허용 팝업이 바로 나타납니다."), /*#__PURE__*/React.createElement("div", {
    style: { display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '8px' }
  }, diagnostics.map(item => /*#__PURE__*/React.createElement("div", {
    key: item.label,
    style: { display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 11px', borderRadius: 'var(--radius-md)', background: 'var(--bg-primary)', border: '1px solid var(--border-subtle)', minWidth: 0 }
  }, /*#__PURE__*/React.createElement("span", {
    style: { width: '9px', height: '9px', borderRadius: 'var(--radius-full)', background: item.ok ? 'var(--status-green)' : '#EF4444', flexShrink: 0 }
  }), /*#__PURE__*/React.createElement("span", {
    style: { display: 'flex', flexDirection: 'column', minWidth: 0 }
  }, /*#__PURE__*/React.createElement("strong", {
    style: { fontSize: 'var(--font-size-md)', color: 'var(--text-main)', lineHeight: 1.25 }
  }, item.label), /*#__PURE__*/React.createElement("span", {
    style: { fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', lineHeight: 1.25, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }
  }, item.detail))))), /*#__PURE__*/React.createElement("div", {
    style: { display: 'flex', flexDirection: 'column', gap: '8px' }
  }, steps.map((step, idx) => /*#__PURE__*/React.createElement("div", {
    key: step,
    style: { display: 'grid', gridTemplateColumns: '28px minmax(0, 1fr)', gap: '8px', alignItems: 'start', padding: '10px 12px', borderRadius: 'var(--radius-md)', background: 'var(--bg-primary)', border: '1px solid var(--border-subtle)', color: 'var(--text-main)', fontSize: 'var(--font-size-base)', lineHeight: 1.45 }
  }, /*#__PURE__*/React.createElement("span", {
    style: { display: 'inline-flex', width: '22px', height: '22px', borderRadius: '50%', background: '#0F172A', color: '#FFFFFF', alignItems: 'center', justifyContent: 'center', fontSize: 'var(--font-size-sm)', fontWeight: 900 }
  }, idx + 1), /*#__PURE__*/React.createElement("span", null, step)))), /*#__PURE__*/React.createElement("p", {
    style: { margin: 0, color: 'var(--text-muted)', fontSize: 'var(--font-size-md)', lineHeight: 1.5 }
  }, "참고: 브라우저가 이미 알림을 차단한 상태에서는 보안 정책상 웹페이지가 설정을 자동으로 바꿀 수 없습니다. 대신 위 경로로 권한을 허용한 뒤 다시 시도해 주세요.")), /*#__PURE__*/React.createElement("div", {
    className: "modal-footer"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn-secondary",
    onClick: onClose
  }, "닫기"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn-primary",
    onClick: handleRetry
  }, primaryButtonLabel)))), document.body);
}

  if (typeof window !== 'undefined') {
  window.GATHER_UI_COMPONENTS = Object.assign({}, window.GATHER_UI_COMPONENTS || {}, {
    ChatParticipantSheet: ChatParticipantSheet,
    NotificationPermissionHelpModal: NotificationPermissionHelpModal,
  });
}
