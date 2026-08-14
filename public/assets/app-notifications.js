(function () {
  function isNotificationSupported() {
    return typeof Notification !== 'undefined';
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
    if (legacyGlobalPref === 'on') return true;
    if (legacyGlobalPref === 'off') return false;
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
    if (browser === '삼성 인터넷') {
      return [
        '하단 메뉴(≡ 또는 점 3개)를 눌러 주세요.',
        '설정 > 사이트 및 다운로드 > 알림으로 이동해 주세요.',
        'pyw31337.github.io 항목을 찾아 알림을 허용으로 변경해 주세요.',
        '다시 이 화면으로 돌아와 채팅알림 스위치를 한 번 더 켜 주세요.'
      ];
    }
    if (browser === 'Chrome') {
      return [
        '주소창 왼쪽 자물쇠 아이콘을 눌러 주세요.',
        '사이트 설정 > 알림을 허용으로 변경해 주세요.',
        '페이지를 새로고침한 뒤 채팅알림을 다시 켜 주세요.'
      ];
    }
    if (browser === '네이버 웨일') {
      return [
        '주소창 왼쪽 자물쇠 아이콘 또는 브라우저 메뉴를 눌러 주세요.',
        '사이트 설정에서 알림 권한을 허용으로 변경해 주세요.',
        '페이지를 새로고침한 뒤 채팅알림을 다시 켜 주세요.'
      ];
    }
    return [
      '주소창의 자물쇠/사이트 정보 아이콘을 눌러 주세요.',
      '알림 권한을 허용으로 변경해 주세요.',
      '페이지를 새로고침한 뒤 채팅알림을 다시 켜 주세요.'
    ];
  }

  window.GATHER_APP_NOTIFICATIONS = Object.freeze({
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
    getBrowserLabelForNotifications,
    getNotificationPermissionHelpSteps
  });
})();
