/**
 * Chat participant sheet + notification permission help (P4-7)
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

function getKoreanSolarTermsForYear(...args) {
  const f = __gatherUiDeps().getKoreanSolarTermsForYear || GATHER_APP_UTILS.getKoreanSolarTermsForYear;
  return typeof f === 'function' ? f(...args) : undefined;
}
function useTapRevealedMsgId(...args) {
  const f = __gatherUiDeps().useTapRevealedMsgId || GATHER_APP_UTILS.useTapRevealedMsgId;
  return typeof f === 'function' ? f(...args) : undefined;
}
function getTrulyConfirmedMeetings(...args) {
  const f = __gatherUiDeps().getTrulyConfirmedMeetings || GATHER_APP_UTILS.getTrulyConfirmedMeetings;
  return typeof f === 'function' ? f(...args) : undefined;
}
function getConfirmedMeetings(...args) {
  const f = __gatherUiDeps().getConfirmedMeetings || GATHER_APP_UTILS.getConfirmedMeetings;
  return typeof f === 'function' ? f(...args) : undefined;
}
function getHolidayNamesForDate(...args) {
  const f = __gatherUiDeps().getHolidayNamesForDate || GATHER_APP_UTILS.getHolidayNamesForDate;
  return typeof f === 'function' ? f(...args) : undefined;
}
function getAnniversariesForDate(...args) {
  const f = __gatherUiDeps().getAnniversariesForDate || GATHER_APP_UTILS.getAnniversariesForDate;
  return typeof f === 'function' ? f(...args) : undefined;
}
function getPinnedNotices(...args) {
  const f = __gatherUiDeps().getPinnedNotices || GATHER_APP_UTILS.getPinnedNotices;
  return typeof f === 'function' ? f(...args) : undefined;
}
function getMessageImageEntries(...args) {
  const f = __gatherUiDeps().getMessageImageEntries || GATHER_APP_UTILS.getMessageImageEntries;
  return typeof f === 'function' ? f(...args) : undefined;
}
function getMessageDirectMediaEntry(...args) {
  const f = __gatherUiDeps().getMessageDirectMediaEntry || GATHER_APP_UTILS.getMessageDirectMediaEntry;
  return typeof f === 'function' ? f(...args) : undefined;
}
function renderTextWithUrlBadge(...args) {
  const f = __gatherUiDeps().renderTextWithUrlBadge || GATHER_APP_UTILS.renderTextWithUrlBadge;
  return typeof f === 'function' ? f(...args) : undefined;
}
function renderChatMessageBody(...args) {
  const f = __gatherUiDeps().renderChatMessageBody || GATHER_APP_UTILS.renderChatMessageBody;
  return typeof f === 'function' ? f(...args) : undefined;
}
function parseTextWithLinks(...args) {
  const f = __gatherUiDeps().parseTextWithLinks || GATHER_APP_UTILS.parseTextWithLinks;
  return typeof f === 'function' ? f(...args) : undefined;
}
function highlightKeyword(...args) {
  const f = __gatherUiDeps().highlightKeyword || GATHER_APP_UTILS.highlightKeyword;
  return typeof f === 'function' ? f(...args) : undefined;
}
function highlightTextWithYellowMarker(...args) {
  const f = __gatherUiDeps().highlightTextWithYellowMarker || GATHER_APP_UTILS.highlightTextWithYellowMarker;
  return typeof f === 'function' ? f(...args) : undefined;
}
function copyTextToClipboard(...args) {
  const f = __gatherUiDeps().copyTextToClipboard || GATHER_APP_UTILS.copyTextToClipboard;
  return typeof f === 'function' ? f(...args) : undefined;
}
function getCalendarShareUrl(...args) {
  const f = __gatherUiDeps().getCalendarShareUrl || GATHER_APP_UTILS.getCalendarShareUrl;
  return typeof f === 'function' ? f(...args) : undefined;
}
function getViewShareUrl(...args) {
  const f = __gatherUiDeps().getViewShareUrl || GATHER_APP_UTILS.getViewShareUrl;
  return typeof f === 'function' ? f(...args) : undefined;
}
function getMemoItemShareUrl(...args) {
  const f = __gatherUiDeps().getMemoItemShareUrl || GATHER_APP_UTILS.getMemoItemShareUrl;
  return typeof f === 'function' ? f(...args) : undefined;
}
function buildLightboxImageInfo(...args) {
  const f = __gatherUiDeps().buildLightboxImageInfo || GATHER_APP_UTILS.buildLightboxImageInfo;
  return typeof f === 'function' ? f(...args) : undefined;
}
function normalizeTagsForDisplay(...args) {
  const f = __gatherUiDeps().normalizeTagsForDisplay || GATHER_APP_UTILS.normalizeTagsForDisplay;
  return typeof f === 'function' ? f(...args) : undefined;
}
function getRecentEmojis(...args) {
  const f = __gatherUiDeps().getRecentEmojis || GATHER_APP_UTILS.getRecentEmojis;
  return typeof f === 'function' ? f(...args) : undefined;
}
function addRecentEmoji(...args) {
  const f = __gatherUiDeps().addRecentEmoji || GATHER_APP_UTILS.addRecentEmoji;
  return typeof f === 'function' ? f(...args) : undefined;
}
function fetchLinkPreview(...args) {
  const f = __gatherUiDeps().fetchLinkPreview || GATHER_APP_UTILS.fetchLinkPreview;
  return typeof f === 'function' ? f(...args) : undefined;
}
function useLinkPreview(...args) {
  const f = __gatherUiDeps().useLinkPreview || GATHER_APP_UTILS.useLinkPreview;
  return typeof f === 'function' ? f(...args) : undefined;
}
function useScrollHideHeader(...args) {
  const f = __gatherUiDeps().useScrollHideHeader || GATHER_APP_UTILS.useScrollHideHeader;
  return typeof f === 'function' ? f(...args) : undefined;
}
function loadLeaflet(...args) {
  const f = __gatherUiDeps().loadLeaflet || GATHER_APP_UTILS.loadLeaflet;
  return typeof f === 'function' ? f(...args) : undefined;
}
function loadLeafletMarkerCluster(...args) {
  const f = __gatherUiDeps().loadLeafletMarkerCluster || GATHER_APP_UTILS.loadLeafletMarkerCluster;
  return typeof f === 'function' ? f(...args) : undefined;
}
function buildPlaceMarkerHtml(...args) {
  const f = __gatherUiDeps().buildPlaceMarkerHtml || GATHER_APP_UTILS.buildPlaceMarkerHtml;
  return typeof f === 'function' ? f(...args) : undefined;
}
function panMapToFitMarkerPopup(...args) {
  const f = __gatherUiDeps().panMapToFitMarkerPopup || GATHER_APP_UTILS.panMapToFitMarkerPopup;
  return typeof f === 'function' ? f(...args) : undefined;
}
function getPlaceCategories(...args) {
  const f = __gatherUiDeps().getPlaceCategories || GATHER_APP_UTILS.getPlaceCategories;
  return typeof f === 'function' ? f(...args) : undefined;
}
function getPlaceSortDateKey(...args) {
  const f = __gatherUiDeps().getPlaceSortDateKey || GATHER_APP_UTILS.getPlaceSortDateKey;
  return typeof f === 'function' ? f(...args) : undefined;
}
function getPlaceExternalMapUrl(...args) {
  const f = __gatherUiDeps().getPlaceExternalMapUrl || GATHER_APP_UTILS.getPlaceExternalMapUrl;
  return typeof f === 'function' ? f(...args) : undefined;
}
function extractKnownParticipantNames(...args) {
  const f = __gatherUiDeps().extractKnownParticipantNames || GATHER_APP_UTILS.extractKnownParticipantNames;
  return typeof f === 'function' ? f(...args) : undefined;
}
function getChatLastReadTimestamp(...args) {
  const f = __gatherUiDeps().getChatLastReadTimestamp || GATHER_APP_UTILS.getChatLastReadTimestamp;
  return typeof f === 'function' ? f(...args) : undefined;
}
function setChatLastReadTimestamp(...args) {
  const f = __gatherUiDeps().setChatLastReadTimestamp || GATHER_APP_UTILS.setChatLastReadTimestamp;
  return typeof f === 'function' ? f(...args) : undefined;
}
function isDateConfirmedMeeting(...args) {
  const f = __gatherUiDeps().isDateConfirmedMeeting || GATHER_APP_UTILS.isDateConfirmedMeeting;
  return typeof f === 'function' ? f(...args) : undefined;
}
function calculateDday(...args) {
  const f = __gatherUiDeps().calculateDday || GATHER_APP_UTILS.calculateDday;
  return typeof f === 'function' ? f(...args) : undefined;
}
function formatChatHeaderTitle(...args) {
  const f = __gatherUiDeps().formatChatHeaderTitle || GATHER_APP_UTILS.formatChatHeaderTitle;
  return typeof f === 'function' ? f(...args) : undefined;
}
function getShortTitleParts(...args) {
  const f = __gatherUiDeps().getShortTitleParts || GATHER_APP_UTILS.getShortTitleParts;
  return typeof f === 'function' ? f(...args) : undefined;
}
function isEmojiOnlyChatText(...args) {
  const f = __gatherUiDeps().isEmojiOnlyChatText || GATHER_APP_UTILS.isEmojiOnlyChatText;
  return typeof f === 'function' ? f(...args) : undefined;
}
function twemojiImageUrl(...args) {
  const f = __gatherUiDeps().twemojiImageUrl || GATHER_APP_UTILS.twemojiImageUrl;
  return typeof f === 'function' ? f(...args) : undefined;
}
function getDirectChatMediaInfo(...args) {
  const f = __gatherUiDeps().getDirectChatMediaInfo || GATHER_APP_UTILS.getDirectChatMediaInfo;
  return typeof f === 'function' ? f(...args) : undefined;
}
function getPollOptionVoterIds(...args) {
  const f = __gatherUiDeps().getPollOptionVoterIds || GATHER_APP_UTILS.getPollOptionVoterIds;
  return typeof f === 'function' ? f(...args) : undefined;
}
function getPollTotalVoteCount(...args) {
  const f = __gatherUiDeps().getPollTotalVoteCount || GATHER_APP_UTILS.getPollTotalVoteCount;
  return typeof f === 'function' ? f(...args) : undefined;
}
function getCalendarActivityLogs(...args) {
  const f = __gatherUiDeps().getCalendarActivityLogs || GATHER_APP_UTILS.getCalendarActivityLogs;
  return typeof f === 'function' ? f(...args) : undefined;
}
function getCalendarAccentColor(...args) {
  const f = __gatherUiDeps().getCalendarAccentColor || GATHER_APP_UTILS.getCalendarAccentColor;
  return typeof f === 'function' ? f(...args) : undefined;
}
function getAnniversaryDisplayColor(...args) {
  const f = __gatherUiDeps().getAnniversaryDisplayColor || GATHER_APP_UTILS.getAnniversaryDisplayColor;
  return typeof f === 'function' ? f(...args) : undefined;
}


export function ChatParticipantSheet({ calendar, selectedId, onSelect, onClose }) {
  const React = window.React;
  const __deps = window.GATHER_UI_DEPS || {};
  const SmallXIcon = __deps.SmallXIcon;

  const participants = getActiveParticipants(calendar);
  return /*#__PURE__*/React.createElement(React.Fragment, null,
    /* Overlay */
    /*#__PURE__*/React.createElement("div", {
      className: "modal-overlay",
      onClick: onClose,
      style: {
        alignItems: 'flex-end',
        backgroundColor: 'rgba(15, 23, 42, 0.68)',
        zIndex: 11000
      }
    }),
    /* Bottom Sheet */
    /*#__PURE__*/React.createElement("div", {
      className: "poll-voter-sheet",
      style: { zIndex: 11001 }
    },
      /* Header */
      /*#__PURE__*/React.createElement("div", {
        className: "poll-voter-sheet-header"
      },
        /*#__PURE__*/React.createElement("span", null, "참여자 선택"),
        /*#__PURE__*/React.createElement("button", {
          type: "button",
          onClick: onClose,
          style: { background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', padding: '4px' }
        }, /*#__PURE__*/React.createElement(SmallXIcon, null))
      ),
      /* List */
      /*#__PURE__*/React.createElement("div", {
        style: { display: 'grid', gap: '8px', padding: '14px 20px 24px' }
      },
        participants.map(participant => /*#__PURE__*/React.createElement("button", {
          key: participant.id,
          type: "button",
          className: "poll-voter-option",
          onClick: () => {
            onSelect(participant.id);
            onClose();
          }
        },
          /* Left content: dot + name */
          /*#__PURE__*/React.createElement("span", {
            style: { display: 'inline-flex', alignItems: 'center', gap: '10px' }
          },
            /*#__PURE__*/React.createElement("span", {
              className: "color-dot",
              style: { backgroundColor: participant.color }
            }),
            participant.name
          ),
          /* Right content: checkmark if selected */
          selectedId === participant.id && /*#__PURE__*/React.createElement("span", {
            style: { color: '#2563EB', fontWeight: 900 }
          }, "✓")
        ))
      )
    )
  );
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
  const statusLabel = permission === 'granted' ? '허용됨' : permission === 'denied' ? '차단됨' : permission === 'default' ? '아직 선택 안 함' : permission === 'ios-not-installed' ? 'iOS 홈 화면 추가 필요' : '미지원';
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
    style: { display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '14px', borderRadius: '16px', background: 'rgba(59, 130, 246, 0.1)', color: '#1D4ED8' }
  }, /*#__PURE__*/React.createElement("span", {
    style: { display: 'inline-flex', width: '34px', height: '34px', borderRadius: '12px', background: '#2563EB', color: '#FFFFFF', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }
  }, /*#__PURE__*/React.createElement(BellIcon, null)), /*#__PURE__*/React.createElement("div", {
    style: { fontSize: '0.86rem', lineHeight: 1.55, fontWeight: 700 }
  }, browserLabel, "에서 현재 알림 권한 상태는 ", /*#__PURE__*/React.createElement("strong", null, statusLabel), "입니다. 채팅알림을 받으려면 이 사이트의 알림 권한이 허용되어야 합니다.")), /*#__PURE__*/React.createElement("div", {
    style: { display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '8px' }
  }, diagnostics.map(item => /*#__PURE__*/React.createElement("div", {
    key: item.label,
    style: { display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 11px', borderRadius: '12px', background: 'var(--bg-primary)', border: '1px solid var(--border-subtle)', minWidth: 0 }
  }, /*#__PURE__*/React.createElement("span", {
    style: { width: '9px', height: '9px', borderRadius: '999px', background: item.ok ? '#10B981' : '#EF4444', flexShrink: 0 }
  }), /*#__PURE__*/React.createElement("span", {
    style: { display: 'flex', flexDirection: 'column', minWidth: 0 }
  }, /*#__PURE__*/React.createElement("strong", {
    style: { fontSize: '0.78rem', color: 'var(--text-main)', lineHeight: 1.25 }
  }, item.label), /*#__PURE__*/React.createElement("span", {
    style: { fontSize: '0.68rem', color: 'var(--text-muted)', lineHeight: 1.25, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }
  }, item.detail))))), /*#__PURE__*/React.createElement("div", {
    style: { display: 'flex', flexDirection: 'column', gap: '8px' }
  }, steps.map((step, idx) => /*#__PURE__*/React.createElement("div", {
    key: step,
    style: { display: 'grid', gridTemplateColumns: '28px minmax(0, 1fr)', gap: '8px', alignItems: 'start', padding: '10px 12px', borderRadius: '12px', background: 'var(--bg-primary)', border: '1px solid var(--border-subtle)', color: 'var(--text-main)', fontSize: '0.86rem', lineHeight: 1.45 }
  }, /*#__PURE__*/React.createElement("span", {
    style: { display: 'inline-flex', width: '22px', height: '22px', borderRadius: '50%', background: '#0F172A', color: '#FFFFFF', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 900 }
  }, idx + 1), /*#__PURE__*/React.createElement("span", null, step)))), /*#__PURE__*/React.createElement("p", {
    style: { margin: 0, color: 'var(--text-muted)', fontSize: '0.78rem', lineHeight: 1.5 }
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
  }, permission === 'ios-not-installed' ? '홈 화면 추가 방법 확인' : permission === 'denied' ? '권한 설정 후 다시 시도' : '권한 다시 요청')))), document.body);
}

  if (typeof window !== 'undefined') {
  window.GATHER_UI_COMPONENTS = Object.assign({}, window.GATHER_UI_COMPONENTS || {}, {
    ChatParticipantSheet: ChatParticipantSheet,
    NotificationPermissionHelpModal: NotificationPermissionHelpModal,
  });
}
