import {
  describePushSubscribeFailure,
  ensureChatNotificationPermission,
  ensurePushSubscriptionHealthy,
  getNotifyChannels,
  isChatNotifyEnabledForCalendar,
  isNotificationSupported,
  probeNotificationCapability,
  setChatNotifyEnabledForCalendar,
  setNotifGuideSeen,
  subscribeUserToPush,
  subscribeUserToPushWithPermission,
  unsubscribeUserFromPush
} from './app-domain-helpers.js';

const DEFAULT_NOTIFY_CHANNELS = Object.freeze({ chat: true, memo: true, poll: true, schedule: true });

function readNotificationPermission() {
  return isNotificationSupported() ? Notification.permission : 'unsupported';
}
export function useNotificationPwaState({
  React,
  activeCalId,
  firebaseDb,
  chatParticipantId,
  getCurrentParticipantId,
  showToast
}) {
  const [mainNotifPermission, setMainNotifPermission] = React.useState(readNotificationPermission);
  const [mainChatNotifyEnabled, setMainChatNotifyEnabled] = React.useState(() => isChatNotifyEnabledForCalendar(activeCalId));
  const [isNotificationHelpOpen, setIsNotificationHelpOpen] = React.useState(false);
  const [isNotifOnboardingOpen, setIsNotifOnboardingOpen] = React.useState(false);
  const [notifyChannels, setNotifyChannelsState] = React.useState(() => (
    typeof getNotifyChannels === 'function' ? getNotifyChannels() : { ...DEFAULT_NOTIFY_CHANNELS }
  ));

  React.useEffect(() => {
    setMainChatNotifyEnabled(isChatNotifyEnabledForCalendar(activeCalId));
    setMainNotifPermission(readNotificationPermission());
  }, [activeCalId]);

  React.useEffect(() => {
    if (!activeCalId || !firebaseDb || !mainChatNotifyEnabled) return undefined;
    let cancelled = false;
    const run = async () => {
      if (cancelled || (typeof document !== 'undefined' && document.visibilityState === 'hidden')) return;
      let participantId = null;
      try {
        participantId = ((window.GATHER_APP_NOTIFICATIONS || {}).getStoredChatParticipantId || (() => null))(activeCalId, null);
      } catch (_) {}
      if (!participantId) return;
      try {
        await ensurePushSubscriptionHealthy(activeCalId, participantId);
      } catch (error) {
        console.warn('push health:', error);
      }
    };
    run();
    const onVisible = () => { if (document.visibilityState === 'visible') run(); };
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', run);
    const intervalId = setInterval(run, 6 * 60 * 60 * 1000);
    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', run);
      clearInterval(intervalId);
    };
  }, [activeCalId, firebaseDb, mainChatNotifyEnabled]);

  React.useEffect(() => {
    if (!activeCalId || !chatParticipantId) return;
    if (!mainChatNotifyEnabled || mainNotifPermission !== 'granted') return;
    subscribeUserToPush(activeCalId, chatParticipantId).then(result => {
      if (result && !result.ok) console.warn('Main chat notification auto-subscribe skipped:', result.reason);
    });
  }, [activeCalId, chatParticipantId, mainChatNotifyEnabled, mainNotifPermission]);

  const openNotificationHelp = React.useCallback(() => setIsNotificationHelpOpen(true), []);
  const handleMainToggleNotifications = React.useCallback(async () => {
    if (!isNotificationSupported()) {
      showToast('알림 미지원 브라우저', 'error');
      openNotificationHelp();
      return;
    }

    const currentParticipantId = () => (
      typeof getCurrentParticipantId === 'function' ? getCurrentParticipantId() : undefined
    );

    if (Notification.permission === 'granted') {
      const next = !mainChatNotifyEnabled;
      if (next) {
        const capability = await probeNotificationCapability();
        if (!capability.ok) {
          setMainNotifPermission('unsupported');
          openNotificationHelp();
          showToast(capability.reason === 'ios-not-installed'
            ? 'iOS는 홈 화면에 추가한 앱에서만 채팅알림을 받을 수 있습니다.'
            : '이 환경에서는 채팅알림을 받을 수 없습니다.', 'error', 6000);
          return;
        }
      }
      setMainChatNotifyEnabled(next);
      setChatNotifyEnabledForCalendar(activeCalId, next);
      if (next) {
        let result = await subscribeUserToPushWithPermission(activeCalId, currentParticipantId());
        if (result && !result.ok) {
          await new Promise(resolve => setTimeout(resolve, 400));
          result = await subscribeUserToPushWithPermission(activeCalId, currentParticipantId());
        }
        if (result && !result.ok) {
          setMainChatNotifyEnabled(false);
          setChatNotifyEnabledForCalendar(activeCalId, false);
          if (result.reason === 'permission-not-granted') openNotificationHelp();
          else showToast(`알림 설정 실패 (${describePushSubscribeFailure(result.reason)})`, 'error', 5000);
          console.warn('Main chat notification subscribe failed:', result.reason);
          return;
        }
      } else {
        await unsubscribeUserFromPush(activeCalId);
      }
      showToast(next ? '알림이 켜졌습니다.' : '알림이 꺼졌습니다.', 'success');
      return;
    }

    if (Notification.permission === 'denied') {
      openNotificationHelp();
      showToast('브라우저 설정에서 알림 허용 필요', 'error', 6000);
      return;
    }

    const permission = await ensureChatNotificationPermission();
    setMainNotifPermission(permission);
    if (permission !== 'granted') {
      openNotificationHelp();
      showToast('알림 권한을 허용해야 알림을 받을 수 있습니다.', 'error', 6000);
      return;
    }
    const capability = await probeNotificationCapability();
    if (!capability.ok) {
      setMainNotifPermission('unsupported');
      openNotificationHelp();
      showToast(capability.reason === 'ios-not-installed'
        ? 'iOS는 홈 화면에 추가한 앱에서만 알림을 받을 수 있습니다.'
        : '이 브라우저에서는 알림을 표시할 수 없습니다.', 'error', 6000);
      return;
    }
    setChatNotifyEnabledForCalendar(activeCalId, true);
    setMainChatNotifyEnabled(true);
    let subscribeResult = await subscribeUserToPushWithPermission(activeCalId, currentParticipantId());
    if (subscribeResult && !subscribeResult.ok) {
      await new Promise(resolve => setTimeout(resolve, 400));
      subscribeResult = await subscribeUserToPushWithPermission(activeCalId, currentParticipantId());
    }
    if (subscribeResult && !subscribeResult.ok) {
      setMainChatNotifyEnabled(false);
      setChatNotifyEnabledForCalendar(activeCalId, false);
      if (subscribeResult.reason === 'permission-not-granted') openNotificationHelp();
      else showToast(`알림 설정 실패 (${describePushSubscribeFailure(subscribeResult.reason)})`, 'error', 5000);
      console.warn('Main chat notification subscribe failed:', subscribeResult.reason);
      return;
    }
    showToast('알림이 켜졌습니다.', 'success');
    if (typeof setNotifGuideSeen === 'function') setNotifGuideSeen(true);
  }, [activeCalId, getCurrentParticipantId, mainChatNotifyEnabled, openNotificationHelp, showToast]);

  return {
    mainNotifPermission,
    setMainNotifPermission,
    mainChatNotifyEnabled,
    setMainChatNotifyEnabled,
    isNotificationHelpOpen,
    setIsNotificationHelpOpen,
    isNotifOnboardingOpen,
    setIsNotifOnboardingOpen,
    notifyChannels,
    setNotifyChannelsState,
    openNotificationHelp,
    handleMainToggleNotifications
  };
}
