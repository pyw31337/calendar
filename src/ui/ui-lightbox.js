/**
 * Lightbox + LightboxInfoPanel (P4-3).
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

function extractExpenseTimePrefix(...args) {
  const f = __gatherUiDeps().extractExpenseTimePrefix || GATHER_APP_UTILS.extractExpenseTimePrefix;
  return typeof f === 'function' ? f(...args) : undefined;
}
function extractFirstUrl(...args) {
  const f = __gatherUiDeps().extractFirstUrl || GATHER_APP_UTILS.extractFirstUrl;
  return typeof f === 'function' ? f(...args) : undefined;
}
function extractLeadingMemoDate(...args) {
  const f = __gatherUiDeps().extractLeadingMemoDate || GATHER_APP_UTILS.extractLeadingMemoDate;
  return typeof f === 'function' ? f(...args) : undefined;
}
function formatChatDividerDate(...args) {
  const f = __gatherUiDeps().formatChatDividerDate || GATHER_APP_UTILS.formatChatDividerDate;
  return typeof f === 'function' ? f(...args) : undefined;
}
function formatChatTime(...args) {
  const f = __gatherUiDeps().formatChatTime || GATHER_APP_UTILS.formatChatTime;
  return typeof f === 'function' ? f(...args) : undefined;
}
function formatCommentDate(...args) {
  const f = __gatherUiDeps().formatCommentDate || GATHER_APP_UTILS.formatCommentDate;
  return typeof f === 'function' ? f(...args) : undefined;
}
function formatDateWithDayName(...args) {
  const f = __gatherUiDeps().formatDateWithDayName || GATHER_APP_UTILS.formatDateWithDayName;
  return typeof f === 'function' ? f(...args) : undefined;
}
function formatPlaceBadgeDate(...args) {
  const f = __gatherUiDeps().formatPlaceBadgeDate || GATHER_APP_UTILS.formatPlaceBadgeDate;
  return typeof f === 'function' ? f(...args) : undefined;
}
function formatPollDeadline(...args) {
  const f = __gatherUiDeps().formatPollDeadline || GATHER_APP_UTILS.formatPollDeadline;
  return typeof f === 'function' ? f(...args) : undefined;
}
function formatRegisteredAt(...args) {
  const f = __gatherUiDeps().formatRegisteredAt || GATHER_APP_UTILS.formatRegisteredAt;
  return typeof f === 'function' ? f(...args) : undefined;
}
function formatShortDateWithDayName(...args) {
  const f = __gatherUiDeps().formatShortDateWithDayName || GATHER_APP_UTILS.formatShortDateWithDayName;
  return typeof f === 'function' ? f(...args) : undefined;
}
function getActivePollOptions(...args) {
  const f = __gatherUiDeps().getActivePollOptions || GATHER_APP_UTILS.getActivePollOptions;
  return typeof f === 'function' ? f(...args) : undefined;
}
function getActivityLogStamp(...args) {
  const f = __gatherUiDeps().getActivityLogStamp || GATHER_APP_UTILS.getActivityLogStamp;
  return typeof f === 'function' ? f(...args) : undefined;
}
function getContrastTextColor(...args) {
  const f = __gatherUiDeps().getContrastTextColor || GATHER_APP_UTILS.getContrastTextColor;
  return typeof f === 'function' ? f(...args) : undefined;
}
function getDisplayExpenseCategory(...args) {
  const f = __gatherUiDeps().getDisplayExpenseCategory || GATHER_APP_UTILS.getDisplayExpenseCategory;
  return typeof f === 'function' ? f(...args) : undefined;
}
function getDisplayPlaceAddress(...args) {
  const f = __gatherUiDeps().getDisplayPlaceAddress || GATHER_APP_UTILS.getDisplayPlaceAddress;
  return typeof f === 'function' ? f(...args) : undefined;
}
function getExpenseCategories(...args) {
  const f = __gatherUiDeps().getExpenseCategories || GATHER_APP_UTILS.getExpenseCategories;
  return typeof f === 'function' ? f(...args) : undefined;
}
function getExpenseCategory(...args) {
  const f = __gatherUiDeps().getExpenseCategory || GATHER_APP_UTILS.getExpenseCategory;
  return typeof f === 'function' ? f(...args) : undefined;
}
function getExpenseCategoryIcon(...args) {
  const f = __gatherUiDeps().getExpenseCategoryIcon || GATHER_APP_UTILS.getExpenseCategoryIcon;
  return typeof f === 'function' ? f(...args) : undefined;
}
function getExpenseCategoryLabel(...args) {
  const f = __gatherUiDeps().getExpenseCategoryLabel || GATHER_APP_UTILS.getExpenseCategoryLabel;
  return typeof f === 'function' ? f(...args) : undefined;
}
function getPlaceCategoryById(...args) {
  const f = __gatherUiDeps().getPlaceCategoryById || GATHER_APP_UTILS.getPlaceCategoryById;
  return typeof f === 'function' ? f(...args) : undefined;
}
function getPlaceCategoryIcon(...args) {
  const f = __gatherUiDeps().getPlaceCategoryIcon || GATHER_APP_UTILS.getPlaceCategoryIcon;
  return typeof f === 'function' ? f(...args) : undefined;
}
function getPlaceCategoryLabel(...args) {
  const f = __gatherUiDeps().getPlaceCategoryLabel || GATHER_APP_UTILS.getPlaceCategoryLabel;
  return typeof f === 'function' ? f(...args) : undefined;
}
function isDomesticLatLng(...args) {
  const f = __gatherUiDeps().isDomesticLatLng || GATHER_APP_UTILS.isDomesticLatLng;
  return typeof f === 'function' ? f(...args) : undefined;
}
function isExpenseIncomeEntry(...args) {
  const f = __gatherUiDeps().isExpenseIncomeEntry || GATHER_APP_UTILS.isExpenseIncomeEntry;
  return typeof f === 'function' ? f(...args) : undefined;
}
function isInternalTestCalendarId(...args) {
  const f = __gatherUiDeps().isInternalTestCalendarId || GATHER_APP_UTILS.isInternalTestCalendarId;
  return typeof f === 'function' ? f(...args) : undefined;
}
function isPollClosed(...args) {
  const f = __gatherUiDeps().isPollClosed || GATHER_APP_UTILS.isPollClosed;
  return typeof f === 'function' ? f(...args) : undefined;
}
function isTombstone(...args) {
  const f = __gatherUiDeps().isTombstone || GATHER_APP_UTILS.isTombstone;
  return typeof f === 'function' ? f(...args) : undefined;
}
function isValidCalendarId(...args) {
  const f = __gatherUiDeps().isValidCalendarId || GATHER_APP_UTILS.isValidCalendarId;
  return typeof f === 'function' ? f(...args) : undefined;
}
function isValidDateString(...args) {
  const f = __gatherUiDeps().isValidDateString || GATHER_APP_UTILS.isValidDateString;
  return typeof f === 'function' ? f(...args) : undefined;
}
function normalizeColorValue(...args) {
  const f = __gatherUiDeps().normalizeColorValue || GATHER_APP_UTILS.normalizeColorValue;
  return typeof f === 'function' ? f(...args) : undefined;
}
function normalizeExpenseCategories(...args) {
  const f = __gatherUiDeps().normalizeExpenseCategories || GATHER_APP_UTILS.normalizeExpenseCategories;
  return typeof f === 'function' ? f(...args) : undefined;
}
function normalizePlaceAddressForSave(...args) {
  const f = __gatherUiDeps().normalizePlaceAddressForSave || GATHER_APP_UTILS.normalizePlaceAddressForSave;
  return typeof f === 'function' ? f(...args) : undefined;
}
function normalizePlaceCategories(...args) {
  const f = __gatherUiDeps().normalizePlaceCategories || GATHER_APP_UTILS.normalizePlaceCategories;
  return typeof f === 'function' ? f(...args) : undefined;
}
function normalizePlaceDateForSort(...args) {
  const f = __gatherUiDeps().normalizePlaceDateForSort || GATHER_APP_UTILS.normalizePlaceDateForSort;
  return typeof f === 'function' ? f(...args) : undefined;
}
function parseVisitEntriesFromMemo(...args) {
  const f = __gatherUiDeps().parseVisitEntriesFromMemo || GATHER_APP_UTILS.parseVisitEntriesFromMemo;
  return typeof f === 'function' ? f(...args) : undefined;
}
function reformatMemoIntoDateLines(...args) {
  const f = __gatherUiDeps().reformatMemoIntoDateLines || GATHER_APP_UTILS.reformatMemoIntoDateLines;
  return typeof f === 'function' ? f(...args) : undefined;
}
function removeFirstUrl(...args) {
  const f = __gatherUiDeps().removeFirstUrl || GATHER_APP_UTILS.removeFirstUrl;
  return typeof f === 'function' ? f(...args) : undefined;
}
function sortVisitEntriesRecentFirst(...args) {
  const f = __gatherUiDeps().sortVisitEntriesRecentFirst || GATHER_APP_UTILS.sortVisitEntriesRecentFirst;
  return typeof f === 'function' ? f(...args) : undefined;
}
function trimLatLngOutliers(...args) {
  const f = __gatherUiDeps().trimLatLngOutliers || GATHER_APP_UTILS.trimLatLngOutliers;
  return typeof f === 'function' ? f(...args) : undefined;
}

const KOREAN_LUNAR_HOLIDAY_DATES = GATHER_APP_CALENDAR_DATA.KOREAN_LUNAR_HOLIDAY_DATES || {};
const KOREAN_TEMPORARY_HOLIDAYS = GATHER_APP_CALENDAR_DATA.KOREAN_TEMPORARY_HOLIDAYS || [];
const KOREAN_FIXED_HOLIDAYS = GATHER_APP_CALENDAR_DATA.KOREAN_FIXED_HOLIDAYS || [];
const KOREAN_SOLAR_TERMS = GATHER_APP_CALENDAR_DATA.KOREAN_SOLAR_TERMS || [];
const MONTH_NAMES = GATHER_APP_CALENDAR_DATA.MONTH_NAMES || ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'];
const PRESET_COLORS = GATHER_APP_CONSTANTS.PRESET_COLORS || [];
const DEFAULT_EXPENSE_CATEGORIES = GATHER_APP_CONSTANTS.DEFAULT_EXPENSE_CATEGORIES || [];
const DEFAULT_PLACE_CATEGORIES = GATHER_APP_CONSTANTS.DEFAULT_PLACE_CATEGORIES || GATHER_APP_UTILS.DEFAULT_PLACE_CATEGORIES || [];
const EMOJI_CATEGORIES = GATHER_APP_CONSTANTS.EMOJI_CATEGORIES || [];
const INCOME_EXPENSE_CATEGORY = GATHER_APP_UTILS.INCOME_EXPENSE_CATEGORY || { id: 'income', name: '수입', color: '#16A34A' };
const PLACE_MAP_DEFAULT_CENTER = __gatherUiDeps().PLACE_MAP_DEFAULT_CENTER || [37.5665, 126.978];
const PLACE_MAP_DEFAULT_ZOOM = __gatherUiDeps().PLACE_MAP_DEFAULT_ZOOM || 11;
const PLACE_MARKER_SIZE = __gatherUiDeps().PLACE_MARKER_SIZE || 28;
const CONFETTI_Z_INDEX = 9999;
const DEADLINE_PICKER_MONTH_NAMES = GATHER_APP_CALENDAR_DATA.MONTH_NAMES || ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'];

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


export function LightboxInfoPanel({ info, onOpenUrl, tags = '', onSaveTags, onSearchTag, showToast }) {
  const React = window.React;
  const __deps = window.GATHER_UI_DEPS || {};
  const SmallXIcon = __deps.SmallXIcon;
  const LinkIcon = __deps.LinkIcon;
  const ConfirmDialog = (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.ConfirmDialog) || __deps.ConfirmDialog;

  const tagTokens = String(tags || '').split(/[,\s#]+/).map(t => t.trim()).filter(Boolean);
  const [tagInput, setTagInput] = React.useState('');
  const [isSavingTags, setIsSavingTags] = React.useState(false);
  const [confirmDeleteTag, setConfirmDeleteTag] = React.useState(null);
  const [isDeletingTag, setIsDeletingTag] = React.useState(false);
  React.useEffect(() => { setTagInput(''); }, [tags]);
  if (!info.dateLabel && !info.typeLabel && !onSaveTags) return null;
  const MAX_TAGS = 10;
  const handleSaveTags = async () => {
    if (!onSaveTags || isSavingTags) return;
    // Parse new tokens from input
    const newTokens = String(tagInput || '').split(/[,\s#]+/).map(t => t.trim()).filter(Boolean);
    if (newTokens.length === 0) return;
    // Merge with existing, deduplicate, enforce limit
    const merged = Array.from(new Set([...tagTokens, ...newTokens]));
    if (merged.length > MAX_TAGS) {
      // Check if any of the new tokens would actually be added
      const wouldAdd = newTokens.filter(t => !tagTokens.includes(t));
      if (tagTokens.length >= MAX_TAGS || (tagTokens.length + wouldAdd.length) > MAX_TAGS) {
        if (typeof showToast === 'function') showToast('태그는 최대 10개 저장 가능', 'error');
        return;
      }
    }
    const finalTags = merged.slice(0, MAX_TAGS);
    setIsSavingTags(true);
    try {
      const saved = await onSaveTags(finalTags.join(' '));
      if (saved !== false) setTagInput('');
    } finally {
      setIsSavingTags(false);
    }
  };
  const handleConfirmDeleteTag = async () => {
    if (!onSaveTags || !confirmDeleteTag || isDeletingTag) return;
    setIsDeletingTag(true);
    try {
      await onSaveTags(tagTokens.filter(t => t !== confirmDeleteTag).join(' '));
    } finally {
      setIsDeletingTag(false);
      setConfirmDeleteTag(null);
    }
  };
  const labelStyle = { opacity: 0.7, flexShrink: 0, minWidth: '52px' };
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "lightbox-info-panel",
    style: {
      position: 'absolute', left: 0, right: 0, bottom: 0, minWidth: '190px',
      padding: '14px 14px 12px',
      background: 'linear-gradient(to top, rgba(0,0,0,0.82), rgba(0,0,0,0.45) 60%, transparent)',
      borderRadius: '0 0 12px 12px',
      color: '#FFFFFF', fontSize: '0.76rem', lineHeight: 1.7,
      display: 'flex', flexDirection: 'column', gap: '4px',
      pointerEvents: 'auto'
    },
    onClick: e => e.stopPropagation()
  },
    info.dateLabel && /*#__PURE__*/React.createElement("div", { style: { display: 'flex', gap: '8px' } },
      /*#__PURE__*/React.createElement("span", { style: labelStyle }, "업로드"),
      /*#__PURE__*/React.createElement("span", { style: { wordBreak: 'break-all' } }, info.dateLabel)
    ),
    info.typeLabel && /*#__PURE__*/React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' } },
      /*#__PURE__*/React.createElement("span", { style: labelStyle }, "파일정보"),
      /*#__PURE__*/React.createElement("span", {
        style: {
          display: 'inline-flex', alignItems: 'center', padding: '1px 8px', borderRadius: 'var(--radius-full)',
          border: '1px solid #FFFFFF', color: '#FFFFFF', fontSize: '0.68rem', fontWeight: 800
        }
      }, info.typeLabel),
      /*#__PURE__*/React.createElement("span", null, "/"),
      /*#__PURE__*/React.createElement("span", null, info.sizeLabel || '-'),
      /*#__PURE__*/React.createElement("span", null, "/"),
      /*#__PURE__*/React.createElement("span", null, info.dimensionLabel || '-')
    ),
    /*#__PURE__*/React.createElement("div", { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' } },
      /*#__PURE__*/React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', minWidth: 0 } },
        /*#__PURE__*/React.createElement("span", { style: labelStyle }, "해시태그"),
        tagTokens.map(tag => /*#__PURE__*/React.createElement("span", {
          key: tag,
          className: "lightbox-tag-badge",
          onClick: () => onSearchTag && onSearchTag(tag),
          style: {
            display: 'inline-flex', alignItems: 'center', gap: '6px', borderRadius: 'var(--radius-full)',
            padding: '3px 4px 3px 10px', fontSize: '0.72rem', fontWeight: 900, lineHeight: 1,
            border: '1px solid #FFFFFF', color: '#FFFFFF', background: 'transparent',
            cursor: onSearchTag ? 'pointer' : 'default'
          }
        }, `#${tag}`, onSaveTags && /*#__PURE__*/React.createElement("button", {
          type: "button",
          title: `#${tag} 태그 삭제`,
          onClick: e => { e.stopPropagation(); setConfirmDeleteTag(tag); },
          style: {
            width: '17px', height: '17px', border: 0, borderRadius: '50%',
            background: '#FFFFFF', color: '#0F172A', display: 'inline-flex',
            alignItems: 'center', justifyContent: 'center', padding: 0, cursor: 'pointer',
            flexShrink: 0
          }
        }, /*#__PURE__*/React.createElement(SmallXIcon, { size: 12 }))))
      ),
      /*#__PURE__*/React.createElement("button", {
        type: "button",
        className: "lightbox-url-btn",
        onClick: () => onOpenUrl && onOpenUrl(),
        style: {
          flexShrink: 0, height: '30px', padding: '0 10px', borderRadius: 'var(--radius-full)',
          border: '1px solid rgba(255,255,255,0.32)', background: 'rgba(255,255,255,0.14)',
          color: '#FFFFFF', display: 'inline-flex', alignItems: 'center', gap: '5px',
          cursor: 'pointer', fontSize: '0.72rem', fontWeight: 800, backdropFilter: 'blur(6px)'
        }
      }, /*#__PURE__*/React.createElement(LinkIcon, { size: 14 }), "URL")
    ),
    onSaveTags && /*#__PURE__*/React.createElement("div", {
      style: { display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }
    },
      /*#__PURE__*/React.createElement("span", { style: labelStyle }, "태그입력"),
      /*#__PURE__*/React.createElement("input", {
        type: "text",
        className: "lightbox-tag-input",
        value: tagInput,
        onChange: e => setTagInput(e.target.value),
        onKeyDown: e => {
          if (e.nativeEvent.isComposing) return;
          if (e.key === 'Enter') {
            e.preventDefault();
            handleSaveTags();
          }
        },
        placeholder: tagTokens.length >= 10 ? "태그 최대 10개 도달" : `태그 입력 (${tagTokens.length}/10)`,
        maxLength: 100,
        style: {
          flex: 1, minWidth: 0, height: '28px', padding: '0 8px', borderRadius: '6px',
          border: '1px solid rgba(255,255,255,0.32)', background: 'rgba(255,255,255,0.14)',
          color: '#FFFFFF', fontSize: '0.74rem'
        }
      }),
      /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: handleSaveTags,
        disabled: isSavingTags || tagTokens.length >= 10,
        style: {
          flexShrink: 0, height: '28px', padding: '0 10px', borderRadius: '6px',
          border: '1px solid rgba(255,255,255,0.32)', background: 'rgba(255,255,255,0.22)',
          color: '#FFFFFF', fontSize: '0.72rem', fontWeight: 800, cursor: 'pointer',
          opacity: (isSavingTags || tagTokens.length >= 10) ? 0.45 : 1
        }
      }, isSavingTags ? '...' : '저장')
    )
  ), confirmDeleteTag && /*#__PURE__*/React.createElement(ConfirmDialog, {
    title: "해시태그 삭제",
    message: `#${confirmDeleteTag} 태그를 삭제하시겠습니까?`,
    onConfirm: handleConfirmDeleteTag,
    onCancel: () => setConfirmDeleteTag(null)
  }));
}

export function Lightbox({ urls, index, onClose, onNavigate, meta, showToast, onPromoteImageUrl, onSaveImageTags, onSearchTag }) {
  const React = window.React;
  const __deps = window.GATHER_UI_DEPS || {};
  const SmallXIcon = __deps.SmallXIcon;
  const ImageUrlModal = __deps.ImageUrlModal;
  const LightboxInfoPanel = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.LightboxInfoPanel;
  const buildLightboxImageInfo = __deps.buildLightboxImageInfo;

  const total = urls.length;
  const [showInfo, setShowInfo] = React.useState(false);
  const [imageUrlModalOpen, setImageUrlModalOpen] = React.useState(false);
  const [imageDimensions, setImageDimensions] = React.useState({});
  const [displayUrls, setDisplayUrls] = React.useState(urls);
  const lightboxHistoryRef = React.useRef(false);
  React.useEffect(() => {
    try {
      window.history.pushState({ ...(window.history.state || {}), __moyeoraLightbox: true }, '', window.location.href);
      lightboxHistoryRef.current = true;
    } catch (e) {
      lightboxHistoryRef.current = false;
    }
    const handlePopState = () => {
      lightboxHistoryRef.current = false;
      onClose();
    };
    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      lightboxHistoryRef.current = false;
    };
  }, []);
  const closeLightbox = () => {
    if (lightboxHistoryRef.current && window.history.state && window.history.state.__moyeoraLightbox) {
      window.history.back();
      return;
    }
    onClose();
  };
  React.useEffect(() => { setDisplayUrls(urls); }, [urls]);
  React.useEffect(() => { setShowInfo(false); }, [index]);
  const currentUrl = displayUrls[index] || urls[index];
  const currentInfo = React.useMemo(
    () => {
      const base = buildLightboxImageInfo(currentUrl, meta && meta[index] && meta[index].timestamp);
      const size = imageDimensions[currentUrl];
      return {
        ...base,
        dimensionLabel: size ? `${size.width} × ${size.height}px` : null
      };
    },
    [currentUrl, index, meta, imageDimensions]
  );
  // meta is a static snapshot handed in when the Lightbox was opened (built once from
  // chatMessages at click time), so it never reflects a tag save/delete that happens while the
  // Lightbox stays open on the same image -- track successful saves here so the info panel
  // shows the result immediately instead of only after the Lightbox is closed and reopened.
  const [tagOverrides, setTagOverrides] = React.useState({});
  const currentMeta = meta && meta[index];
  const tagOverrideKey = currentMeta ? `${currentMeta.messageId}_${currentMeta.directMediaUrl ? 'direct' : currentMeta.imageIndex}` : null;
  const currentTags = (tagOverrideKey && tagOverrideKey in tagOverrides) ? tagOverrides[tagOverrideKey] : (currentMeta?.tags || '');
  // Mirrors handleSaveImageTags' own parse/dedupe/limit rules so the optimistic override shown
  // here matches what actually got persisted, without needing the save call to round-trip it.
  const normalizeTagsForDisplay = text => Array.from(new Set(
    String(text || '').split(/[,\s#]+/).map(t => t.trim()).filter(Boolean)
  )).slice(0, 20).join(' ');
  const saveCurrentTags = onSaveImageTags && currentMeta?.messageId != null
    ? async tagsText => {
        const ok = await onSaveImageTags(currentMeta.messageId, currentMeta.imageIndex, tagsText, currentMeta);
        if (ok && tagOverrideKey) setTagOverrides(prev => ({ ...prev, [tagOverrideKey]: normalizeTagsForDisplay(tagsText) }));
        return ok;
      }
    : null;
  const ensureCurrentShareUrl = async url => {
    if (typeof url !== 'string' || !url.startsWith('data:')) return url;
    if (typeof onPromoteImageUrl !== 'function') throw new Error('No image URL promotion handler');
    const result = await onPromoteImageUrl({ url, meta: meta && meta[index], index });
    const nextShareUrl = typeof result === 'string' ? result : result?.shareUrl;
    const nextImageUrl = typeof result === 'string' ? result : result?.imageUrl;
    if (nextImageUrl && /^https?:\/\//.test(nextImageUrl)) {
      setDisplayUrls(prev => prev.map((item, i) => i === index ? nextImageUrl : item));
    }
    if (nextShareUrl && /^https?:\/\//.test(nextShareUrl)) {
      if (showToast) showToast('공유 URL 생성완료', 'success', 3000);
      return nextShareUrl;
    }
    throw new Error('Image URL promotion failed');
  };
  const recordImageDimensions = (url, e) => {
    const img = e.currentTarget;
    const width = img.naturalWidth;
    const height = img.naturalHeight;
    if (!url || !width || !height) return;
    setImageDimensions(prev => prev[url] ? prev : { ...prev, [url]: { width, height } });
  };
  const handleImageTap = e => {
    e.stopPropagation();
    if (wasDraggedRef.current) { wasDraggedRef.current = false; return; }
    setShowInfo(prev => !prev);
  };
  const imgAreaRef = React.useRef(null);
  const widthRef = React.useRef(0);
  const dragStartXRef = React.useRef(null);
  const isDraggingRef = React.useRef(false);
  const wasDraggedRef = React.useRef(false);
  const pendingNavRef = React.useRef(null);
  const [dragPx, setDragPx] = React.useState(0);
  const [transitionOn, setTransitionOn] = React.useState(false);
  const [isDragging, setIsDragging] = React.useState(false);

  const goTo = i => {
    if (i < 0 || i >= total || i === index) return;
    onNavigate(i);
  };
  // Adjacent (±1) navigation slides the track by exactly one container-width, same visual
  // motion as a completed drag -- used by the arrow buttons and arrow keys so every way of
  // moving between photos feels like the same carousel, not just the drag gesture.
  const animateToAdjacent = newIndex => {
    if (newIndex < 0 || newIndex >= total || newIndex === index) return;
    const el = imgAreaRef.current;
    if (el) widthRef.current = el.getBoundingClientRect().width;
    pendingNavRef.current = newIndex;
    setTransitionOn(true);
    setDragPx(newIndex > index ? -widthRef.current : widthRef.current);
  };
  React.useEffect(() => {
    const onKeyDown = e => {
      if (e.key === 'Escape') closeLightbox();
      else if (e.key === 'ArrowLeft') animateToAdjacent(index - 1);
      else if (e.key === 'ArrowRight') animateToAdjacent(index + 1);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [index, total]);

  // Carousel drag: the track visually follows the finger/cursor 1:1 while dragging (dragPx is
  // the live pixel offset added on top of the centered baseline), then on release either
  // completes the slide to the adjacent photo or springs back -- both animated the same way,
  // via a CSS transition on transform. The reset back to dragPx:0 after a completed slide
  // happens in the same handler as the index change (onTransitionEnd), so the swap is
  // invisible: the outgoing frame and the reset frame show the same photo in the same spot.
  const SWIPE_THRESHOLD_RATIO = 0.18;
  const EDGE_RESISTANCE = 0.35;
  const dampedDelta = raw => {
    if (raw > 0 && index === 0) return raw * EDGE_RESISTANCE;
    if (raw < 0 && index === total - 1) return raw * EDGE_RESISTANCE;
    return raw;
  };
  const handleDragStart = clientX => {
    if (total <= 1) return;
    const el = imgAreaRef.current;
    widthRef.current = el ? el.getBoundingClientRect().width : 0;
    dragStartXRef.current = clientX;
    isDraggingRef.current = true;
    wasDraggedRef.current = false;
    setTransitionOn(false);
    setIsDragging(true);
  };
  const handleDragMove = clientX => {
    if (!isDraggingRef.current || dragStartXRef.current == null) return;
    const raw = clientX - dragStartXRef.current;
    if (Math.abs(raw) > 5) wasDraggedRef.current = true;
    setDragPx(dampedDelta(raw));
  };
  const handleDragEnd = () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    setIsDragging(false);
    dragStartXRef.current = null;
    const width = widthRef.current || 1;
    const threshold = width * SWIPE_THRESHOLD_RATIO;
    setTransitionOn(true);
    setDragPx(current => {
      if (current <= -threshold && index < total - 1) {
        pendingNavRef.current = index + 1;
        return -width;
      }
      if (current >= threshold && index > 0) {
        pendingNavRef.current = index - 1;
        return width;
      }
      pendingNavRef.current = null;
      return 0;
    });
  };
  // Mouse move/up are tracked at the document level (unlike touchmove/touchend, which keep
  // firing on their original target even once the finger leaves it) so the drag keeps working
  // if the cursor leaves the image area mid-drag.
  React.useEffect(() => {
    const onMouseMove = e => handleDragMove(e.clientX);
    const onMouseUp = () => handleDragEnd();
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
  }, [index, total]);
  const handleTrackTransitionEnd = e => {
    if (e.target !== e.currentTarget || e.propertyName !== 'transform') return;
    if (pendingNavRef.current == null) return;
    const next = pendingNavRef.current;
    pendingNavRef.current = null;
    setTransitionOn(false);
    setDragPx(0);
    onNavigate(next);
  };
  const handleOverlayClick = () => {
    if (wasDraggedRef.current) {
      wasDraggedRef.current = false;
      return;
    }
    closeLightbox();
  };

  const renderSlide = (url, slot) => /*#__PURE__*/React.createElement("div", {
    style: { width: '33.3333%', flexShrink: 0, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }
  }, url && (slot === 'current' ? /*#__PURE__*/React.createElement("div", {
    style: { position: 'relative', display: 'inline-flex', maxWidth: '100%', maxHeight: '100%' },
    onClick: handleImageTap
  }, /*#__PURE__*/React.createElement("img", {
    src: url,
    alt: "원본 이미지",
    "data-slide": slot,
    draggable: false,
    referrerPolicy: 'no-referrer',
    onLoad: e => recordImageDimensions(url, e),
    style: {
      maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: '12px',
      display: 'block'
    }
  }), showInfo && /*#__PURE__*/React.createElement(LightboxInfoPanel, {
    info: currentInfo,
    tags: currentTags,
    onSaveTags: saveCurrentTags,
    onSearchTag: onSearchTag,
    onOpenUrl: () => setImageUrlModalOpen(true),
    showToast: showToast
  })) : /*#__PURE__*/React.createElement("img", {
    src: url,
    alt: "원본 이미지",
    "data-slide": slot,
    draggable: false,
    referrerPolicy: 'no-referrer',
    onLoad: e => recordImageDimensions(url, e),
    onClick: e => e.stopPropagation(),
    style: {
      maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: '12px'
    }
  })));

  const lightboxNode = /*#__PURE__*/React.createElement("div", {
    className: "lightbox-overlay",
    onClick: handleOverlayClick,
    style: {
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.92)', backdropFilter: 'blur(8px)', zIndex: 50000,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      width: '100%', maxWidth: '100%', overflow: 'hidden',
      userSelect: 'none'
    }
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: e => { e.stopPropagation(); closeLightbox(); },
    "aria-label": "닫기",
    style: {
      position: 'absolute', top: '16px', right: '16px',
      background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.25)',
      borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF', zIndex: 9001
    }
  }, /*#__PURE__*/React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg", width: "18", height: "18", viewBox: "0 0 24 24",
    fill: "none", stroke: "currentColor", strokeWidth: "2.5", strokeLinecap: "round", strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("line", { x1: "18", y1: "6", x2: "6", y2: "18" }), /*#__PURE__*/React.createElement("line", { x1: "6", y1: "6", x2: "18", y2: "18" }))),
  total > 1 && index > 0 && /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: e => { e.stopPropagation(); animateToAdjacent(index - 1); },
    "aria-label": "이전 이미지",
    style: {
      position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
      background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.25)',
      borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF', zIndex: 9001
    }
  }, /*#__PURE__*/React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg", width: "22", height: "22", viewBox: "0 0 24 24",
    fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", { d: "M15 6l-6 6l6 6" }))),
  total > 1 && index < total - 1 && /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: e => { e.stopPropagation(); animateToAdjacent(index + 1); },
    "aria-label": "다음 이미지",
    style: {
      position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
      background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.25)',
      borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF', zIndex: 9001
    }
  }, /*#__PURE__*/React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg", width: "22", height: "22", viewBox: "0 0 24 24",
    fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", { d: "M9 6l6 6l-6 6" }))),
  total > 1 ? /*#__PURE__*/React.createElement("div", {
    ref: imgAreaRef,
    onMouseDown: e => handleDragStart(e.clientX),
    onTouchStart: e => handleDragStart(e.touches[0].clientX),
    onTouchMove: e => handleDragMove(e.touches[0].clientX),
    onTouchEnd: handleDragEnd,
    style: {
      width: '92vw', height: '82vh', overflow: 'hidden',
      cursor: isDragging ? 'grabbing' : 'grab'
    }
  }, /*#__PURE__*/React.createElement("div", {
    onTransitionEnd: handleTrackTransitionEnd,
    style: {
      display: 'flex', width: '300%', height: '100%',
      transform: `translateX(calc(-33.3333% + ${dragPx}px))`,
      transition: transitionOn ? 'transform 280ms ease' : 'none'
    }
  }, renderSlide(index > 0 ? displayUrls[index - 1] : null, 'prev'), renderSlide(currentUrl, 'current'), renderSlide(index < total - 1 ? displayUrls[index + 1] : null, 'next')))
    : /*#__PURE__*/React.createElement("div", {
    style: { position: 'relative', display: 'inline-flex', maxWidth: '92vw', maxHeight: '82vh' },
    onClick: handleImageTap
  }, /*#__PURE__*/React.createElement("img", {
    src: currentUrl,
    alt: "원본 이미지",
    draggable: false,
    referrerPolicy: 'no-referrer',
    onLoad: e => recordImageDimensions(currentUrl, e),
    style: {
      maxWidth: '92vw', maxHeight: '82vh', borderRadius: '12px', objectFit: 'contain',
      display: 'block'
    }
  }), showInfo && /*#__PURE__*/React.createElement(LightboxInfoPanel, {
    info: currentInfo,
    tags: currentTags,
    onSaveTags: saveCurrentTags,
    onSearchTag: onSearchTag,
    onOpenUrl: () => setImageUrlModalOpen(true),
    showToast: showToast
  })),
  total > 1 && (() => {
    const maxVisibleDots = 10;
    const startIdx = total <= maxVisibleDots
      ? 0
      : Math.max(0, Math.min(index - Math.floor(maxVisibleDots / 2), total - maxVisibleDots));
    const endIdx = startIdx + Math.min(total, maxVisibleDots);
    const visibleIndices = Array.from({ length: endIdx - startIdx }, (_, i) => startIdx + i);

    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '6px',
        marginTop: '16px',
        zIndex: 9001
      }
    },
      /* Text indicator */
      /*#__PURE__*/React.createElement("span", {
        style: { color: 'rgba(255, 255, 255, 0.75)', fontSize: '0.8rem', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }
      }, `${index + 1} / ${total}`),
      /* Dots container */
      /*#__PURE__*/React.createElement("div", {
        onClick: e => e.stopPropagation(),
        style: { display: 'flex', alignItems: 'center', gap: '7px' }
      },
        startIdx > 0 && /*#__PURE__*/React.createElement("span", {
          style: { width: '4px', height: '4px', borderRadius: '50%', backgroundColor: 'rgba(255, 255, 255, 0.2)' }
        }),
        visibleIndices.map(i => /*#__PURE__*/React.createElement("span", {
          key: i,
          onClick: () => goTo(i),
          style: {
            width: i === index ? '8px' : '6px',
            height: i === index ? '8px' : '6px',
            borderRadius: '50%',
            cursor: 'pointer',
            backgroundColor: i === index ? '#FFFFFF' : 'rgba(255, 255, 255, 0.35)',
            transition: 'all 0.15s'
          }
        })),
        endIdx < total && /*#__PURE__*/React.createElement("span", {
          style: { width: '4px', height: '4px', borderRadius: '50%', backgroundColor: 'rgba(255, 255, 255, 0.2)' }
        })
      )
    );
  })(), imageUrlModalOpen && /*#__PURE__*/React.createElement(ImageUrlModal, {
    imageUrl: currentUrl,
    onClose: () => setImageUrlModalOpen(false),
    showToast,
    onEnsureShareUrl: ensureCurrentShareUrl
  }));
  return ReactDOM.createPortal(lightboxNode, document.body);
}

  if (typeof window !== 'undefined') {
  window.GATHER_UI_COMPONENTS = Object.assign({}, window.GATHER_UI_COMPONENTS || {}, {
    LightboxInfoPanel: LightboxInfoPanel,
    Lightbox: Lightbox,
  });
}
