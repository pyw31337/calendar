/**
 * User manual overlay (P4-6)
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


export function UserManualOverlay({ calendar, onClose }) {
  const React = window.React;
  const __deps = window.GATHER_UI_DEPS || {};
  const SmallXIcon = __deps.SmallXIcon;
  const MenuIcon = __deps.MenuIcon;

  const participants = getActiveParticipants(calendar || {});
  const sampleParticipant = participants[0] || { name: '박영우', color: '#EF4444' };
  const sampleParticipant2 = participants[1] || { name: '김유리', color: '#F97316' };
  const sampleParticipant3 = participants[2] || { name: '송은혜', color: '#06B6D4' };
  const participantBadge = (participant, text) => /*#__PURE__*/React.createElement("span", {
    className: "participant-badge",
    style: {
      backgroundColor: participant.color,
      color: getContrastTextColor(participant.color),
      boxShadow: 'none'
    }
  }, text || participant.name);
  const StepIcon = ({ children }) => /*#__PURE__*/React.createElement("div", {
    style: {
      width: '42px',
      height: '42px',
      borderRadius: '14px',
      background: 'linear-gradient(135deg, #EEF2FF, #FDF2F8)',
      color: '#4F46E5',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      boxShadow: '0 10px 24px rgba(79, 70, 229, 0.16)'
    }
  }, children);
  const stepCards = [
    {
      title: '1. 가능한 날짜를 선택해요',
      desc: '캘린더에서 내가 참석 가능한 날짜를 눌러 일정 팝업을 엽니다. 여러 날짜를 등록해둘수록 모두가 만날 수 있는 날을 찾기 쉬워져요.',
      icon: /*#__PURE__*/React.createElement(MenuIcon, { paths: ["M4 7a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2v-12z", "M16 3v4", "M8 3v4", "M4 11h16"] }),
      preview: /*#__PURE__*/React.createElement("div", {
        style: { display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '8px' }
      }, [15, 16, 17, 22, 23, 30].map(day => /*#__PURE__*/React.createElement("div", {
        key: day,
        style: {
          minHeight: '74px',
          borderRadius: '14px',
          border: day === 22 ? '1px solid #10B981' : day === 15 ? '1px solid #7C3AED' : '1px solid var(--border-subtle)',
          background: day === 22 ? '#ECFDF5' : day === 15 ? '#FAF5FF' : 'var(--bg-primary)',
          padding: '8px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: '6px'
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          color: day === 15 ? '#EF4444' : 'var(--text-main)',
          fontWeight: 900,
          fontSize: '0.86rem'
        }
      }, day, day === 15 && /*#__PURE__*/React.createElement("span", { style: { color: '#7C3AED', fontSize: '0.62rem' } }, "확정")), day === 22 ? /*#__PURE__*/React.createElement("div", { style: { display: 'flex', flexWrap: 'wrap', gap: '4px' } },
        participantBadge(sampleParticipant),
        participantBadge(sampleParticipant2)
      ) : day === 15 ? /*#__PURE__*/React.createElement("div", { style: { display: 'flex', flexWrap: 'wrap', gap: '4px' } },
        participantBadge(sampleParticipant),
        participantBadge(sampleParticipant2),
        participantBadge(sampleParticipant3)
      ) : /*#__PURE__*/React.createElement("span", { style: { color: '#CBD5E1', fontSize: '0.75rem', fontWeight: 800 } }, "선택 가능"))))
    },
    {
      title: '2. 참여자와 메모를 등록해요',
      desc: '일정 팝업에서 참여자(본인)를 선택하면 메모 입력칸이 열립니다. 시간, 장소, 차량 여부처럼 같이 보면 좋은 내용을 적고 등록하면 바로 저장됩니다.',
      icon: /*#__PURE__*/React.createElement(MenuIcon, { paths: ["M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0", "M6 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2"] }),
      preview: /*#__PURE__*/React.createElement("div", {
        style: { border: '1px solid var(--border-subtle)', borderRadius: '18px', overflow: 'hidden', background: 'var(--bg-card)' }
      }, /*#__PURE__*/React.createElement("div", {
        style: { padding: '13px 16px', background: '#F5EAFE', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 900 }
      }, "26.08.22(토)", /*#__PURE__*/React.createElement("span", { style: { color: '#64748B' } }, "×")), /*#__PURE__*/React.createElement("div", {
        style: { padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }
      }, /*#__PURE__*/React.createElement("div", { style: { fontSize: '0.75rem', fontWeight: 900, color: '#64748B' } }, "참여자 선택"), /*#__PURE__*/React.createElement("div", {
        style: { height: '42px', border: '1px solid var(--border-subtle)', borderRadius: '999px', display: 'flex', alignItems: 'center', padding: '0 14px', gap: '8px', fontWeight: 800 }
      }, /*#__PURE__*/React.createElement("span", { style: { width: 9, height: 9, borderRadius: '50%', backgroundColor: sampleParticipant.color } }), sampleParticipant.name), /*#__PURE__*/React.createElement("div", { style: { fontSize: '0.75rem', fontWeight: 900, color: '#64748B' } }, "메모 입력"), /*#__PURE__*/React.createElement("div", {
        style: { border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '11px 12px', color: '#64748B', fontSize: '0.82rem' }
      }, "예: 1시 이후 가능, 차량 운전 가능"), /*#__PURE__*/React.createElement("button", {
        type: "button",
        className: "btn btn-primary",
        style: { width: '100%', pointerEvents: 'none' }
      }, "등록")))
    },
    {
      title: '3. 많이 모인 날을 모임일자로 채택해요',
      desc: '참여자가 많이 겹치는 날짜는 캘린더와 요약 영역에서 바로 확인할 수 있습니다. 운영자는 좋은 날짜를 모임확정으로 채택하고 정산/투표/채팅까지 이어갈 수 있어요.',
      icon: /*#__PURE__*/React.createElement(MenuIcon, { paths: ["M9 12l2 2l4 -4", "M12 22a10 10 0 1 0 0 -20a10 10 0 0 0 0 20"] }),
      preview: /*#__PURE__*/React.createElement("div", {
        style: { display: 'flex', flexDirection: 'column', gap: '8px' }
      }, /*#__PURE__*/React.createElement("div", {
        style: { border: '1px solid #10B981', background: '#ECFDF5', borderRadius: '16px', padding: '12px', display: 'flex', justifyContent: 'space-between', gap: '10px', alignItems: 'center' }
      }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", { style: { color: '#10B981', fontWeight: 900, marginBottom: '7px' } }, "전원 참석 가능"), /*#__PURE__*/React.createElement("div", { style: { display: 'flex', flexWrap: 'wrap', gap: '5px' } }, participantBadge(sampleParticipant), participantBadge(sampleParticipant2), participantBadge(sampleParticipant3))), /*#__PURE__*/React.createElement("span", {
        style: { padding: '6px 10px', borderRadius: '999px', background: '#10B981', color: '#FFFFFF', fontSize: '0.75rem', fontWeight: 900, whiteSpace: 'nowrap' }
      }, "전원")), /*#__PURE__*/React.createElement("div", {
        style: { border: '1px solid transparent', background: 'linear-gradient(var(--bg-card), var(--bg-card)) padding-box, var(--accent-gradient) border-box', borderRadius: '16px', padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }
      }, /*#__PURE__*/React.createElement("strong", { style: { color: '#4F46E5' } }, "[모임확정] 26.08.22 (토)"), /*#__PURE__*/React.createElement("span", {
        style: { padding: '5px 10px', borderRadius: '999px', background: 'linear-gradient(135deg, #6366F1, #EC4899)', color: '#FFFFFF', fontWeight: 900, fontSize: '0.75rem' }
      }, "D-11")))
    }
  ];
  return ReactDOM.createPortal(/*#__PURE__*/React.createElement("div", {
    className: "manual-overlay",
    role: "dialog",
    "aria-modal": "true",
    "aria-label": "사용자 매뉴얼",
    onClick: onClose,
    style: {
      position: 'fixed',
      inset: 0,
      zIndex: 10040,
      background: 'rgba(15, 23, 42, 0.72)',
      backdropFilter: 'blur(9px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'clamp(14px, 4vw, 34px)',
      overflowY: 'auto'
    }
  }, /*#__PURE__*/React.createElement("section", {
    className: "manual-panel",
    onClick: e => e.stopPropagation(),
    style: {
      width: 'min(1080px, 100%)',
      maxHeight: 'min(860px, calc(100vh - 28px))',
      overflowY: 'auto',
      background: 'var(--bg-card)',
      color: 'var(--text-main)',
      border: '1px solid var(--border-subtle)',
      borderRadius: '28px',
      boxShadow: '0 30px 80px rgba(0, 0, 0, 0.32)',
      padding: 'clamp(18px, 3vw, 30px)'
    }
  }, /*#__PURE__*/React.createElement("header", {
    style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', marginBottom: '20px' }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: { display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 10px', borderRadius: '999px', background: 'rgba(79, 70, 229, 0.1)', color: '#4F46E5', fontSize: '0.78rem', fontWeight: 900, marginBottom: '10px' }
  }, "첫 사용자를 위한 빠른 안내"), /*#__PURE__*/React.createElement("h2", {
    style: { margin: 0, fontSize: 'clamp(1.45rem, 4vw, 2.2rem)', lineHeight: 1.12, letterSpacing: '-0.04em', fontWeight: 950 }
  }, "모여라 캘린더 사용법"), /*#__PURE__*/React.createElement("p", {
    style: { margin: '10px 0 0', color: 'var(--text-muted)', fontSize: 'clamp(0.9rem, 2.5vw, 1rem)', lineHeight: 1.55 }
  }, calendar?.title ? `${calendar.title}에서 날짜를 고르고, 본인 일정을 등록하고, 모두가 좋은 날짜를 확정하는 흐름입니다.` : "날짜를 고르고, 본인 일정을 등록하고, 모두가 좋은 날짜를 확정하는 흐름입니다.")), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onClose,
    "aria-label": "사용자 매뉴얼 닫기",
    style: { width: '42px', height: '42px', borderRadius: '50%', border: '1px solid var(--border-subtle)', background: 'var(--bg-primary)', color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }
  }, /*#__PURE__*/React.createElement(SmallXIcon, { size: 20 }))), /*#__PURE__*/React.createElement("div", {
    style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '14px' }
  }, stepCards.map(step => /*#__PURE__*/React.createElement("article", {
    key: step.title,
    style: { border: '1px solid var(--border-subtle)', borderRadius: '22px', background: 'linear-gradient(180deg, var(--bg-card), var(--bg-primary))', padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px', minHeight: '100%' }
  }, /*#__PURE__*/React.createElement("div", {
    style: { display: 'flex', alignItems: 'flex-start', gap: '12px' }
  }, /*#__PURE__*/React.createElement(StepIcon, null, step.icon), /*#__PURE__*/React.createElement("div", {
    style: { minWidth: 0 }
  }, /*#__PURE__*/React.createElement("h3", {
    style: { margin: 0, fontSize: '1rem', fontWeight: 950, letterSpacing: '-0.02em' }
  }, step.title), /*#__PURE__*/React.createElement("p", {
    style: { margin: '7px 0 0', color: 'var(--text-muted)', fontSize: '0.86rem', lineHeight: 1.55 }
  }, step.desc))), /*#__PURE__*/React.createElement("div", {
    style: { marginTop: 'auto', borderRadius: '18px', background: 'var(--bg-primary)', border: '1px solid var(--border-subtle)', padding: '12px', overflow: 'hidden' }
  }, step.preview)))), /*#__PURE__*/React.createElement("div", {
    style: { marginTop: '16px', padding: '14px 16px', borderRadius: '18px', background: 'rgba(59, 130, 246, 0.1)', color: '#2563EB', fontSize: '0.88rem', fontWeight: 500, lineHeight: 1.5 }
  }, "팁: 가능한 날짜를 하나만 고르기보다 여러 날짜를 미리 등록해두면, 공통으로 참석 가능한 날짜를 훨씬 빠르게 찾을 수 있습니다."))), document.body);
}

  if (typeof window !== 'undefined') {
  window.GATHER_UI_COMPONENTS = Object.assign({}, window.GATHER_UI_COMPONENTS || {}, {
    UserManualOverlay: UserManualOverlay,
  });
}
