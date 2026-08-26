
function getLocalStorage() {
  return window['local' + 'Storage'];
}

function getActiveParticipants(calendar) {
  const utils = window.GATHER_APP_UTILS || {};
  const f = utils.getActiveParticipants;
  return typeof f === 'function' ? f(calendar) : [];
}


function isNotificationSupported() {
    return typeof Notification !== 'undefined';
  }

  // iOS Safari -- and every other iOS browser (Chrome/Firefox/Edge on iOS all run on Apple's
  // required WebKit engine, so they inherit the exact same restriction) -- only delivers Web
  // Push to a site that's been added to the Home Screen. In a regular browser tab,
  // Notification.permission can still report 'granted' (the permission API itself works fine),
  // which is exactly what makes this so easy to miss: the toggle, the permission prompt, and
  // even a successful pushManager.subscribe() call can all appear to work, yet no push will ever
  // actually arrive. detectBrowserForShortcutInstructions (assets/app-utils.js) already does
  // this same iOS/platform sniff for the "add to home screen" instructions -- mirrored here
  // rather than shared across files since app-utils.js and app-notifications.js are independent
  // globals with no import between them.
  function isIOSDevice() {
    if (typeof navigator === 'undefined') return false;
    const ua = navigator.userAgent || '';
    return /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  }

  function isInstalledStandalonePwa() {
    if (typeof window === 'undefined') return false;
    if (window.navigator && window.navigator.standalone === true) return true; // iOS Safari's own legacy flag
    return typeof window.matchMedia === 'function' && window.matchMedia('(display-mode: standalone)').matches;
  }

  // The one reliable way to catch the iOS false-positive-permission case before the user
  // believes notifications are on: actually try to construct a Notification. A regular
  // (non-installed) iOS browser tab throws here even when Notification.permission says
  // 'granted'. Every "turn notifications on" code path should probe with this before
  // subscribing, not just check Notification.permission.
  async function probeNotificationCapability() {
    if (!isNotificationSupported()) return { ok: false, reason: 'unsupported' };
    if (Notification.permission !== 'granted') return { ok: false, reason: 'permission-not-granted' };
    if (isIOSDevice() && !isInstalledStandalonePwa()) return { ok: false, reason: 'ios-not-installed' };
    try {
      const probe = new Notification(' ', { silent: true, tag: 'notif-probe' });
      probe.close();
      return { ok: true };
    } catch (e) {
      return { ok: false, reason: isIOSDevice() ? 'ios-not-installed' : 'probe-failed' };
    }
  }

  async function requestChatNotificationPermission() {
    if (!isNotificationSupported()) return 'unsupported';
    if (Notification.permission === 'granted' || Notification.permission === 'denied') {
      return Notification.permission;
    }
    try {
      return await new Promise(resolve => {
        let settled = false;
        const finish = value => {
          if (settled) return;
          settled = true;
          resolve(value || Notification.permission || 'default');
        };
        const result = Notification.requestPermission(finish);
        if (result && typeof result.then === 'function') {
          result.then(finish).catch(() => finish(Notification.permission || 'denied'));
        }
        setTimeout(() => finish(Notification.permission || 'default'), 12000);
      });
    } catch (e) {
      return 'denied';
    }
  }

  async function ensureChatNotificationPermission() {
    if (!isNotificationSupported()) return 'unsupported';
    if (Notification.permission === 'granted') return 'granted';
    if (Notification.permission === 'denied') return 'denied';
    return requestChatNotificationPermission();
  }

  function getChatNotifyPrefKey(calId) {
    return `gather_chat_notify_pref_${calId}_v1`;
  }

  function isChatNotifyEnabledForCalendar(calId) {
    if (!calId) return true;
    const calPref = getLocalStorage().getItem(getChatNotifyPrefKey(calId));
    if (calPref === 'on') return true;
    if (calPref === 'off') return false;
    const legacyGlobalPref = getLocalStorage().getItem('gather_chat_notify_pref_global_v1');
    if (legacyGlobalPref === 'on' || legacyGlobalPref === 'off') {
      getLocalStorage().setItem(getChatNotifyPrefKey(calId), legacyGlobalPref);
      return legacyGlobalPref === 'on';
    }
    return true;
  }

  function setChatNotifyEnabledForCalendar(calId, enabled) {
    const val = enabled ? 'on' : 'off';
    if (calId) {
      getLocalStorage().setItem(getChatNotifyPrefKey(calId), val);
    }
  }

  function getChatParticipantPrefKey(calId) {
    return `gather_active_participant_id_${calId || 'global'}_v1`;
  }

  function getStoredChatParticipantId(calId, calendar) {
    const participants = calendar ? getActiveParticipants(calendar) : [];
    const activeIds = participants.map(p => p.id);
    const scopedId = calId ? getLocalStorage().getItem(getChatParticipantPrefKey(calId)) : '';
    if (scopedId && (activeIds.length === 0 || activeIds.includes(scopedId))) return scopedId;

    const legacyId = getLocalStorage().getItem('gather_active_participant_id_v20');
    if (legacyId && activeIds.includes(legacyId)) {
      if (calId) getLocalStorage().setItem(getChatParticipantPrefKey(calId), legacyId);
      return legacyId;
    }
    return activeIds[0] || '';
  }

  function setStoredChatParticipantId(calId, participantId) {
    if (!participantId) return;
    if (calId) getLocalStorage().setItem(getChatParticipantPrefKey(calId), participantId);
    getLocalStorage().setItem('gather_active_participant_id_v20', participantId);
  }

  function describePushSubscribeFailure(reason) {
    const map = {
      'missing-calendar': '캘린더 정보 없음',
      'missing-participant': '참여자 선택 필요',
      'insecure-context': '보안 연결 필요',
      'permission-not-granted': '브라우저 알림 권한 필요',
      'service-worker-unsupported': '서비스워커 미지원',
      'service-worker-not-ready': '서비스워커 준비 실패',
      'push-manager-unsupported': 'Web Push 미지원',
      'push-subscribe-blocked': '브라우저가 푸시 구독 차단',
      'push-subscribe-failed': '푸시 구독 실패',
      'firestore-unavailable': 'Firebase 연결 실패'
    };
    return map[reason] || reason || '알 수 없는 오류';
  }

  function getNotificationDiagnostics() {
    const rows = [];
    const add = (label, ok, detail) => rows.push({ label, ok, detail });
    const permission = isNotificationSupported() ? Notification.permission : 'unsupported';
    add('브라우저 알림', isNotificationSupported(), isNotificationSupported() ? '지원됨' : '미지원');
    add('알림 권한', permission === 'granted', permission === 'granted' ? '허용됨' : permission === 'denied' ? '차단됨' : permission === 'default' ? '아직 선택 안 함' : '미지원');
    add('보안 연결', typeof window === 'undefined' || window.isSecureContext !== false, 'HTTPS 또는 localhost 필요');
    add('서비스워커', typeof navigator !== 'undefined' && 'serviceWorker' in navigator, typeof navigator !== 'undefined' && 'serviceWorker' in navigator ? '지원됨' : '미지원');
    add('Web Push', typeof window !== 'undefined' && 'PushManager' in window, typeof window !== 'undefined' && 'PushManager' in window ? '지원됨' : '미지원');
    // The four checks above can all show green on a non-installed iOS browser tab -- iOS exposes
    // these APIs regardless, but never actually delivers a push unless the site is running from
    // its Home Screen icon. This is the row that actually explains most "I turned it on but
    // nothing ever arrives" reports on iPhone/iPad.
    if (isIOSDevice()) {
      add('iOS 홈 화면 설치', isInstalledStandalonePwa(), isInstalledStandalonePwa() ? '홈 화면 앱으로 실행 중' : 'Safari 탭에서 실행 중 (알림 불가)');
    }
    return rows;
  }

  function classifyPushSubscribeError(err) {
    const name = err?.name || '';
    const message = err?.message || '';
    if (name === 'NotAllowedError' || /permission|denied/i.test(message)) return 'permission-not-granted';
    if (name === 'NotSupportedError' || /not supported|unsupported/i.test(message)) return 'push-manager-unsupported';
    if (name === 'InvalidStateError' || /service worker/i.test(message)) return 'service-worker-not-ready';
    if (name === 'AbortError') return 'push-subscribe-blocked';
    return 'push-subscribe-failed';
  }


  const NOTIF_GUIDE_SEEN_KEY = 'gather_notif_guide_seen_v1';
  const NOTIF_CHANNELS_KEY = 'gather_notify_channels_v1';
  function getNotifGuideSeen() {
    try { return getLocalStorage().getItem(NOTIF_GUIDE_SEEN_KEY) === '1'; } catch (_) { return false; }
  }
  function setNotifGuideSeen(seen = true) {
    try { getLocalStorage().setItem(NOTIF_GUIDE_SEEN_KEY, seen ? '1' : '0'); } catch (_) {}
  }
  function shouldShowNotifOnboarding() {
    if (!isNotificationSupported()) return false;
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') return false;
    if (getNotifGuideSeen()) return false;
    return true;
  }
  function getDefaultNotifyChannels() {
    return { chat: true, memo: true, poll: true, schedule: true };
  }
  function getNotifyChannels() {
    try {
      const raw = getLocalStorage().getItem(NOTIF_CHANNELS_KEY);
      if (!raw) return getDefaultNotifyChannels();
      const parsed = JSON.parse(raw);
      return { ...getDefaultNotifyChannels(), ...(parsed && typeof parsed === 'object' ? parsed : {}) };
    } catch (_) { return getDefaultNotifyChannels(); }
  }
  function setNotifyChannel(channel, enabled) {
    const next = { ...getNotifyChannels(), [channel]: !!enabled };
    try { getLocalStorage().setItem(NOTIF_CHANNELS_KEY, JSON.stringify(next)); } catch (_) {}
    return next;
  }
  function isNotifyChannelEnabled(channel) {
    return getNotifyChannels()[channel] !== false;
  }

  function getBrowserLabelForNotifications() {
    if (typeof navigator === 'undefined') return '현재 브라우저';
    const ua = navigator.userAgent || '';
    if (/SamsungBrowser/i.test(ua)) return '삼성 인터넷';
    if (/Whale/i.test(ua)) return '네이버 웨일';
    if (/Edg/i.test(ua)) return 'Microsoft Edge';
    if (/Firefox/i.test(ua)) return 'Firefox';
    if (/CriOS|Chrome/i.test(ua)) return 'Chrome';
    if (/Safari/i.test(ua)) return 'Safari';
    return '현재 브라우저';
  }

  function getNotificationPermissionHelpSteps() {
    const browser = getBrowserLabelForNotifications();
    const isMobile = typeof navigator !== 'undefined' && /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent || '');
    if (isIOSDevice() && !isInstalledStandalonePwa()) {
      return [
        '아이폰/아이패드는 Apple 정책상 일반 브라우저 탭에서는 알림을 받을 수 없습니다.',
        'Safari에서 공유 버튼(□↑)을 누른 뒤 "홈 화면에 추가"를 선택하세요.',
        '홈 화면 아이콘으로 다시 연 다음, 알림허용을 켜 주세요.',
        '그래도 안 되면: 설정 앱 → 알림 → (이 앱)에서 알림을 허용해 주세요.'
      ];
    }
    if (isIOSDevice() && isInstalledStandalonePwa()) {
      return [
        '홈 화면 앱으로 실행 중입니다. 아래에서 알림허용을 켜 주세요.',
        '허용 팝업이 뜨면 "허용"을 선택하세요.',
        '이미 거부했다면: 아이폰 설정 → 알림 → 해당 앱에서 알림을 다시 켜 주세요.'
      ];
    }
    if (browser === '삼성 인터넷') {
      return isMobile ? [
        '아래 알림허용을 켠 뒤 팝업에서 "허용"을 선택하세요.',
        '거부된 경우: 삼성 인터넷 메뉴 → 설정 → 사이트 권한 → 알림에서 이 사이트를 허용하세요.',
        '기기 설정 → 알림 → 삼성 인터넷 알림도 확인해 주세요.'
      ] : [
        '아래 알림허용을 켠 뒤 "허용"을 선택하세요.',
        '거부된 경우 주소창 사이트 설정 → 알림 → 허용으로 변경하세요.'
      ];
    }
    if (browser === '네이버 웨일') {
      return [
        '아래 알림허용을 켠 뒤 "허용"을 선택하세요.',
        isMobile ? '거부된 경우: 웨일 설정 → 사이트 설정 → 알림에서 허용하세요.' : '거부된 경우: 주소창 자물쇠 → 사이트 설정 → 알림 → 허용.',
        '기기 알림 설정에서 웨일 알림이 꺼져 있지 않은지 확인하세요.'
      ];
    }
    if (browser === 'Chrome') {
      return isMobile ? [
        '아래 알림허용을 켠 뒤 "허용"을 선택하세요.',
        '거부된 경우: Chrome 메뉴 → 설정 → 사이트 설정 → 알림 → 이 사이트 허용.',
        'Android 설정 → 앱 → Chrome → 알림도 확인해 주세요.'
      ] : [
        '아래 알림허용을 켠 뒤 "허용"을 선택하세요.',
        '거부된 경우: 주소창 자물쇠 → 사이트 설정 → 알림 → 허용.',
        'chrome://settings/content/notifications 에서 차단 여부를 확인하세요.'
      ];
    }
    if (browser === 'Safari') {
      return [
        'Mac Safari: 아래 알림허용을 켠 뒤 "허용"을 선택하세요.',
        '거부된 경우: Safari 설정 → 웹사이트 → 알림에서 허용으로 바꾸세요.',
        '시스템 설정 → 알림 → Safari 알림도 확인해 주세요.'
      ];
    }
    if (browser === 'Firefox') {
      return [
        '아래 알림허용을 켠 뒤 "허용"을 선택하세요.',
        '거부된 경우: 주소창 자물쇠 → 권한 → 알림 → 허용.'
      ];
    }
    if (browser === 'Microsoft Edge') {
      return [
        '아래 알림허용을 켠 뒤 "허용"을 선택하세요.',
        '거부된 경우: 주소창 자물쇠 → 사이트 권한 → 알림 → 허용.'
      ];
    }
    return [
      '아래 알림허용 스위치를 켠 뒤, 브라우저 팝업에서 "허용"을 선택하세요.',
      (browser || '브라우저') + ' 설정에서 이 사이트의 알림이 차단되어 있지 않은지 확인해 주세요.',
      '기기 시스템 알림 설정에서 해당 브라우저 알림이 꺼져 있지 않은지 확인해 주세요.'
    ];
  }


  export const GATHER_APP_NOTIFICATIONS = Object.freeze({
    isNotificationSupported,
    requestChatNotificationPermission,
    ensureChatNotificationPermission,
    getChatNotifyPrefKey,
    isChatNotifyEnabledForCalendar,
    setChatNotifyEnabledForCalendar,
    getChatParticipantPrefKey,
    getStoredChatParticipantId,
    setStoredChatParticipantId,
    describePushSubscribeFailure,
    getNotificationDiagnostics,
    classifyPushSubscribeError,
    getNotifGuideSeen,
    setNotifGuideSeen,
    shouldShowNotifOnboarding,
    getNotifyChannels,
    setNotifyChannel,
    isNotifyChannelEnabled,
    getBrowserLabelForNotifications,
    getNotificationPermissionHelpSteps,
    isIOSDevice,
    isInstalledStandalonePwa,
    probeNotificationCapability
  });

if (typeof window !== 'undefined') {
  window.GATHER_APP_NOTIFICATIONS = GATHER_APP_NOTIFICATIONS;
}
