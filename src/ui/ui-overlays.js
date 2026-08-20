/**
 * Overlay / emoji picker UI (P4-5)
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


export function ImageUploadOverlay({ pct, remainingSec, label, current, total }) {
  const React = window.React;

  const clamped = Math.max(0, Math.min(100, pct || 0));
  // Only worth showing "(n/총장수)" once there's more than one photo in the batch -- a single
  // photo's own label ("사진 전송 중...") already says everything a "(1/1)" suffix would.
  const countSuffix = total > 1 ? ` (${Math.min(current || 1, total)}/${total})` : '';
  return /*#__PURE__*/React.createElement('div', {
    style: { position: 'fixed', inset: 0, backgroundColor: 'rgba(15,23,42,0.45)', zIndex: 100000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }
  }, /*#__PURE__*/React.createElement('div', {
    style: { backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '14px', padding: '24px 28px', width: '260px', maxWidth: '100%', textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.25)' }
  },
    /*#__PURE__*/React.createElement('div', { style: { fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-main)', marginBottom: '4px' } }, `${label || '사진 전송 중...'}${countSuffix}`),
    /*#__PURE__*/React.createElement('div', { style: { fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '14px' } },
      `${clamped}%${typeof remainingSec === 'number' ? ` · 약 ${remainingSec}초 남음` : ''}`),
    /*#__PURE__*/React.createElement('div', { style: { height: '8px', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--border-subtle)', overflow: 'hidden' } },
      /*#__PURE__*/React.createElement('div', { style: { height: '100%', width: `${clamped}%`, backgroundColor: '#4F46E5', transition: 'width 0.2s ease', borderRadius: 'var(--radius-full)' } })
    )
  ));
}

export function ImageProcessingOverlay({ current, total, fileName, pct, remainingSec }) {
  const React = window.React;

  if (!total) return null;
  const clamped = typeof pct === 'number' ? Math.max(0, Math.min(100, pct)) : Math.min(100, Math.round((current / total) * 100));
  return /*#__PURE__*/React.createElement('div', {
    style: { position: 'fixed', inset: 0, backgroundColor: 'rgba(15,23,42,0.45)', zIndex: 100000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }
  }, /*#__PURE__*/React.createElement('div', {
    style: { backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '14px', padding: '24px 28px', width: '260px', maxWidth: '100%', textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.25)' }
  },
    /*#__PURE__*/React.createElement('div', { style: { fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-main)', marginBottom: '4px' } }, '사진 변환 중...'),
    /*#__PURE__*/React.createElement('div', { style: { fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } },
      `${current}/${total}${fileName ? ` · ${fileName}` : ''} · ${clamped}%${typeof remainingSec === 'number' ? ` · 약 ${remainingSec}초 남음` : ''}`),
    /*#__PURE__*/React.createElement('div', { style: { height: '8px', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--border-subtle)', overflow: 'hidden' } },
      /*#__PURE__*/React.createElement('div', { style: { height: '100%', width: `${clamped}%`, backgroundColor: '#4F46E5', transition: 'width 0.2s ease', borderRadius: 'var(--radius-full)' } })
    )
  ));
}

export function EmojiGridButton({ emoji, onSelect }) {
  const React = window.React;

  const [imgFailed, setImgFailed] = React.useState(false);
  return /*#__PURE__*/React.createElement('button', {
    type: 'button',
    title: emoji,
    onMouseDown: e => e.preventDefault(), // keep the chat textarea's focus/caret position intact
    onClick: () => onSelect(emoji),
    style: {
      width: '38px', height: '38px', border: 'none', background: 'none', cursor: 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px',
      padding: 0, fontSize: '1.3rem', lineHeight: 1
    }
  }, imgFailed
    ? emoji
    : /*#__PURE__*/React.createElement('img', {
      src: twemojiImageUrl(emoji), alt: emoji, width: 24, height: 24, loading: 'lazy', draggable: false,
      onError: () => setImgFailed(true)
    }));
}

export function EmojiPickerSheet({ onSelect, onClose }) {
  const React = window.React;
  const __deps = window.GATHER_UI_DEPS || {};
  const EmojiGridButton = (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.EmojiGridButton) || __deps.EmojiGridButton;

  const [recents, setRecents] = React.useState(() => getRecentEmojis());
  const handlePick = (emoji) => {
    addRecentEmoji(emoji);
    setRecents(getRecentEmojis());
    onSelect(emoji);
  };
  const renderGroup = (label, emojis, key) => /*#__PURE__*/React.createElement('div', { key, style: { marginBottom: '10px' } },
    /*#__PURE__*/React.createElement('div', { style: { fontSize: '0.75rem', fontWeight: 700, color: '#94A3B8', margin: '4px 6px' } }, label),
    /*#__PURE__*/React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, 38px)', justifyContent: 'space-between' } },
      emojis.map((e, i) => /*#__PURE__*/React.createElement(EmojiGridButton, { key: `${key}-${i}`, emoji: e, onSelect: handlePick }))
    )
  );
  const sheet = /*#__PURE__*/React.createElement('div', {
    className: 'bottom-sheet-overlay emoji-sheet-overlay',
    onClick: onClose
  }, /*#__PURE__*/React.createElement('div', {
    className: 'bottom-sheet emoji-sheet',
    onClick: e => e.stopPropagation(),
    style: { maxHeight: '60vh' }
  },
    /*#__PURE__*/React.createElement('div', { className: 'bottom-sheet-header' },
      /*#__PURE__*/React.createElement('h4', null, '이모티콘'),
      /*#__PURE__*/React.createElement('button', {
        type: 'button', onClick: onClose,
        style: { background: 'none', border: 'none', color: '#64748B', fontSize: '1.2rem', cursor: 'pointer' }
      }, '✕')
    ),
    /*#__PURE__*/React.createElement('div', { style: { overflowY: 'auto', padding: '10px 14px 20px' } },
      recents.length > 0 && renderGroup('최근 사용', recents, 'recent'),
      EMOJI_CATEGORIES.map(cat => renderGroup(cat.label, cat.emojis, cat.label))
    )
  ));
  return ReactDOM.createPortal(sheet, document.body);
}

  if (typeof window !== 'undefined') {
  window.GATHER_UI_COMPONENTS = Object.assign({}, window.GATHER_UI_COMPONENTS || {}, {
    ImageUploadOverlay: ImageUploadOverlay,
    ImageProcessingOverlay: ImageProcessingOverlay,
    EmojiGridButton: EmojiGridButton,
    EmojiPickerSheet: EmojiPickerSheet
  });
}
