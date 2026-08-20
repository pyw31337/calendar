/**
 * Side menu UI (P4-4): SharedSideMenuSettings + MainSideMenu
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


export function SharedSideMenuSettings({
  isDarkTheme,
  onToggleTheme,
  fontScalePercent,
  onDecreaseFont,
  onIncreaseFont,
  isChatNotifyEnabled,
  onToggleChatNotifications
}) {
  const React = window.React;
  const __deps = window.GATHER_UI_DEPS || {};
  const MoonStarsIcon = __deps.MoonStarsIcon;
  const TextResizeIcon = __deps.TextResizeIcon;
  const BellIcon = __deps.BellIcon;
  const ToggleSwitch = __deps.ToggleSwitch;

  return /*#__PURE__*/React.createElement("div", {
    className: "admin-side-menu-list shared-side-menu-settings",
    style: { borderTop: '1px solid var(--border-subtle, #E2E8F0)', borderBottom: 'none', paddingTop: '8px', paddingBottom: '4px', marginTop: '2px' }
  },
    /*#__PURE__*/React.createElement("div", { className: "admin-side-menu-setting-row" },
      /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-setting-label" },
        /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-setting-icon", "aria-hidden": "true" }, /*#__PURE__*/React.createElement(MoonStarsIcon, null)),
        "다크모드"
      ),
      /*#__PURE__*/React.createElement(ToggleSwitch, { checked: !!isDarkTheme, onChange: onToggleTheme, label: "다크모드" })
    ),
    /*#__PURE__*/React.createElement("div", { className: "admin-side-menu-setting-row" },
      /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-setting-label" },
        /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-setting-icon", "aria-hidden": "true" }, /*#__PURE__*/React.createElement(TextResizeIcon, null)),
        "글자크기"
      ),
      /*#__PURE__*/React.createElement("div", { className: "admin-side-menu-font-controls" },
        /*#__PURE__*/React.createElement("button", {
          type: "button", onClick: onDecreaseFont, "aria-label": "글자 크기 줄이기", className: "admin-side-menu-font-btn"
        }, "−"),
        /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-font-value" }, `${fontScalePercent || 100}%`),
        /*#__PURE__*/React.createElement("button", {
          type: "button", onClick: onIncreaseFont, "aria-label": "글자 크기 늘리기", className: "admin-side-menu-font-btn"
        }, "+")
      )
    ),
    /*#__PURE__*/React.createElement("div", { className: "admin-side-menu-setting-row" },
      /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-setting-label" },
        /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-setting-icon", "aria-hidden": "true" }, /*#__PURE__*/React.createElement(BellIcon, null)),
        "채팅알림"
      ),
      /*#__PURE__*/React.createElement(ToggleSwitch, { checked: !!isChatNotifyEnabled, onChange: onToggleChatNotifications, label: "채팅알림" })
    )
  );
}

export function MainSideMenu({
  calendar,
  anniversaries = [],
  onClose,
  onOpenManual,
  onOpenSettings,
  onOpenAnniversaries,
  onOpenShare,
  onCreateShortcut,
  onOpenAdmin,
  isDarkTheme,
  onToggleTheme,
  fontScalePercent,
  onDecreaseFont,
  onIncreaseFont,
  isChatNotifyEnabled,
  onToggleChatNotifications,
  onUpdateWeatherLocation,
  onDeleteRecentLocation,
  showToast,
  onOpenGallery,
  onChangeView
}) {
  const React = window.React;
  const __deps = window.GATHER_UI_DEPS || {};
  const SharedSideMenuSettings = (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.SharedSideMenuSettings) || __deps.SharedSideMenuSettings;
  const SmallXIcon = __deps.SmallXIcon;
  const MenuIcon = __deps.MenuIcon;
  const CalendarCogIcon = __deps.CalendarCogIcon;
  const MapCogIcon = __deps.MapCogIcon;
  const GiftIcon = __deps.GiftIcon;
  const LockIcon = __deps.LockIcon;
  const ExternalLinkIcon = __deps.ExternalLinkIcon;
  const WeatherBadge = __deps.WeatherBadge;
  const WeatherLocationModal = __deps.WeatherLocationModal;

  const [isWeatherModalOpen, setIsWeatherModalOpen] = React.useState(false);
  const handle = action => {
    if (typeof action === 'function') action();
  };
  const scrollTimeoutRef = React.useRef(null);
  const [isScrollingActive, setIsScrollingActive] = React.useState(false);
  const triggerScrollActive = () => {
    setIsScrollingActive(true);
    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    scrollTimeoutRef.current = setTimeout(() => {
      setIsScrollingActive(false);
    }, 1200);
  };
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "admin-side-menu-overlay",
    onClick: onClose
  }, /*#__PURE__*/React.createElement("nav", {
    className: "admin-side-menu" + (isScrollingActive ? " scroll-active" : ""),
    "aria-label": "메인 메뉴",
    onClick: e => e.stopPropagation(),
    onMouseMove: triggerScrollActive,
    onScroll: triggerScrollActive
  },
	    /*#__PURE__*/React.createElement("div", { className: "admin-side-menu-header" },
	      /*#__PURE__*/React.createElement("div", { className: "admin-side-menu-brand" },
	        /*#__PURE__*/React.createElement("div", { className: "admin-side-menu-copy" },
	          /*#__PURE__*/React.createElement("div", { className: "admin-side-menu-title" }, "메뉴")
	        )
      ),
        /* Right container: Weather badge + Settings Icon + Close Button */
        /*#__PURE__*/React.createElement("div", {
          style: { display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }
        },
          /* Weather Badge */
          /*#__PURE__*/React.createElement(WeatherBadge, { weatherLocation: calendar?.weatherLocation }),
          /* Weather Settings */
          /*#__PURE__*/React.createElement("button", {
            type: "button",
            className: "admin-side-menu-weather-settings-btn",
            title: "날씨 지역 설정",
            style: {
              width: '28px',
              height: '28px',
              border: 'none',
              borderRadius: '6px',
              background: 'transparent',
              color: '#64748B',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              padding: 0,
              transition: 'background-color 0.16s ease, color 0.16s ease'
            },
            onClick: (e) => {
              e.stopPropagation();
              setIsWeatherModalOpen(true);
            }
          }, /*#__PURE__*/React.createElement(MapCogIcon, { size: 16 })),
          /* Close Button */
      /*#__PURE__*/React.createElement("button", {
        type: "button",
        className: "admin-side-menu-close-btn",
        title: "메뉴 닫기",
        "aria-label": "메뉴 닫기",
        onClick: onClose
      }, /*#__PURE__*/React.createElement(SmallXIcon, { size: 20 }))

        )
    ),
    /* Group 1: manual (banner) + calendar + anniversary */
    /*#__PURE__*/React.createElement("div", { className: "admin-side-menu-list", style: { borderTop: 'none', borderBottom: 'none', paddingTop: '4px' } },
      /*#__PURE__*/React.createElement("button", {
        type: "button",
        className: "admin-side-menu-item main-side-menu-manual-banner",
        onClick: () => handle(onOpenManual)
      },
        /*#__PURE__*/React.createElement("span", { className: "main-side-menu-manual-banner-icon-wrap", "aria-hidden": "true" },
          /*#__PURE__*/React.createElement("svg", {
            xmlns: "http://www.w3.org/2000/svg", width: "22", height: "22", viewBox: "0 0 24 24",
            fill: "none", stroke: "currentColor", strokeWidth: "1.8", strokeLinecap: "round", strokeLinejoin: "round"
          },
            /*#__PURE__*/React.createElement("path", { d: "M4 19.5A2.5 2.5 0 0 1 6.5 17H20" }),
            /*#__PURE__*/React.createElement("path", { d: "M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" }),
            /*#__PURE__*/React.createElement("path", { d: "M8 7h8" }),
            /*#__PURE__*/React.createElement("path", { d: "M8 11h6" })
          )
        ),
        /*#__PURE__*/React.createElement("span", { className: "main-side-menu-manual-banner-text" },
          /*#__PURE__*/React.createElement("span", { className: "main-side-menu-manual-banner-title" }, "사용자 매뉴얼"),
          /*#__PURE__*/React.createElement("span", { className: "main-side-menu-manual-banner-sub" }, "사용 방법 한눈에 보기")
        ),
        /*#__PURE__*/React.createElement("span", { className: "main-side-menu-manual-banner-chevron", "aria-hidden": "true" },
          /*#__PURE__*/React.createElement("svg", {
            xmlns: "http://www.w3.org/2000/svg", width: "18", height: "18", viewBox: "0 0 24 24",
            fill: "none", stroke: "currentColor", strokeWidth: "2.2", strokeLinecap: "round", strokeLinejoin: "round"
          }, /*#__PURE__*/React.createElement("path", { d: "m9 18 6-6-6-6" }))
        )
      ),
      /*#__PURE__*/React.createElement("button", {
        type: "button",
        className: "admin-side-menu-item",
        onClick: () => handle(onOpenSettings)
      },
        /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-icon" }, /*#__PURE__*/React.createElement(CalendarCogIcon, null)),
        /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-copy" },
          /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-title" }, "캘린더 설정")
        )
      ),
      /*#__PURE__*/React.createElement("button", {
        type: "button",
        className: "admin-side-menu-item",
        onClick: () => handle(onOpenAnniversaries)
      },
        /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-icon" }, /*#__PURE__*/React.createElement(GiftIcon, null)),
        /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-copy" },
          /*#__PURE__*/React.createElement("span", {
            className: "admin-side-menu-item-title",
            style: { display: 'flex', alignItems: 'center', gap: '6px' }
          }, "기념일 설정", anniversaries.length > 0 && /*#__PURE__*/React.createElement("span", {
            className: "main-menu-badge",
            style: {
              backgroundColor: 'var(--border-subtle)',
              color: 'var(--text-muted)',
              marginLeft: '4px'
            }
          }, anniversaries.length))
        )
      )
    ),
    /* Group 2: gallery + places */
    /*#__PURE__*/React.createElement("div", { className: "admin-side-menu-list", style: { borderTop: '1px solid var(--border-subtle, #E2E8F0)', borderBottom: 'none', paddingTop: '6px', marginTop: '2px' } },
      /*#__PURE__*/React.createElement("button", {
        type: "button",
        className: "admin-side-menu-item",
        onClick: () => { onClose && onClose(); if (onChangeView) onChangeView('gallery'); }
      },
        /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-icon" }, /*#__PURE__*/React.createElement("svg", {
          xmlns: "http://www.w3.org/2000/svg", width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2"
        }, /*#__PURE__*/React.createElement("rect", { width: "18", height: "18", x: "3", y: "3", rx: "2", ry: "2" }), /*#__PURE__*/React.createElement("circle", { cx: "9", cy: "9", r: "2" }), /*#__PURE__*/React.createElement("path", { d: "m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" }))),
        /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-copy" },
          /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-title" }, "갤러리")
        )
      ),
      /*#__PURE__*/React.createElement("button", {
        type: "button",
        className: "admin-side-menu-item",
        onClick: () => { onClose && onClose(); if (onChangeView) onChangeView('places'); }
      },
        /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-icon" }, /*#__PURE__*/React.createElement("svg", {
          xmlns: "http://www.w3.org/2000/svg", width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2"
        }, /*#__PURE__*/React.createElement("path", { d: "M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" }), /*#__PURE__*/React.createElement("circle", { cx: "12", cy: "10", r: "3" }))),
        /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-copy" },
          /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-title" }, "장소")
        )
      )
    ),
    /* Group 3: theme / font / notify (divider owned by SharedSideMenuSettings) */
    /*#__PURE__*/React.createElement(SharedSideMenuSettings, {
      isDarkTheme: isDarkTheme,
      onToggleTheme: onToggleTheme,
      fontScalePercent: fontScalePercent,
      onDecreaseFont: onDecreaseFont,
      onIncreaseFont: onIncreaseFont,
      isChatNotifyEnabled: isChatNotifyEnabled,
      onToggleChatNotifications: onToggleChatNotifications
    }),
    /* Group 4: share + shortcut */
    /*#__PURE__*/React.createElement("div", { className: "admin-side-menu-list", style: { borderTop: '1px solid var(--border-subtle, #E2E8F0)', borderBottom: 'none', paddingTop: '6px', marginTop: '2px' } },
      /*#__PURE__*/React.createElement("button", {
        type: "button",
        className: "admin-side-menu-item",
        onClick: () => handle(onOpenShare)
      },
        /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-icon" }, /*#__PURE__*/React.createElement(MenuIcon, { paths: ["M3 12a3 3 0 1 0 6 0a3 3 0 1 0 -6 0", "M15 6a3 3 0 1 0 6 0a3 3 0 1 0 -6 0", "M15 18a3 3 0 1 0 6 0a3 3 0 1 0 -6 0", "M8.7 10.7l6.6 -3.4", "M8.7 13.3l6.6 3.4"] })),
        /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-copy" },
          /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-title" }, "공유하기")
        )
      ),
      /*#__PURE__*/React.createElement("button", {
        type: "button",
        className: "admin-side-menu-item",
        onClick: () => handle(onCreateShortcut)
      },
        /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-icon" }, /*#__PURE__*/React.createElement(ExternalLinkIcon, null)),
        /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-copy" },
          /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-title" }, "바로가기")
        )
      )
    ),
    /* Group 5: admin */
    /*#__PURE__*/React.createElement("div", { className: "admin-side-menu-list", style: { marginTop: 'auto', borderTop: '1px solid var(--border-subtle, #E2E8F0)', borderBottom: 'none', paddingTop: '6px' } },
      /*#__PURE__*/React.createElement("button", {
        type: "button",
        className: "admin-side-menu-item",
        onClick: () => {
          onClose && onClose();
          handle(onOpenAdmin);
        }
      },
        /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-icon" }, /*#__PURE__*/React.createElement(LockIcon, null)),
        /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-copy" },
          /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-title" }, "어드민")
        )
      )
    )
  )), isWeatherModalOpen && /*#__PURE__*/React.createElement(WeatherLocationModal, {
    onClose: () => setIsWeatherModalOpen(false),
    onSelectLocation: onUpdateWeatherLocation,
    onDeleteRecentLocation: onDeleteRecentLocation,
    showToast: showToast,
    recentLocations: calendar?.recentLocations || []
  }));
}

  if (typeof window !== 'undefined') {
  window.GATHER_UI_COMPONENTS = Object.assign({}, window.GATHER_UI_COMPONENTS || {}, {
    SharedSideMenuSettings: SharedSideMenuSettings,
    MainSideMenu: MainSideMenu,
  });
}
