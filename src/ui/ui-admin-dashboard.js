/**
 * Admin dashboard (P4-17)
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


export function AdminDashboard({ initialCalendars }) {
  const React = window.React;
  const __deps = window.GATHER_UI_DEPS || {};
  const __comp = window.GATHER_UI_COMPONENTS || {};
  const AdminCreateCalendarModal = __comp.AdminCreateCalendarModal || __deps.AdminCreateCalendarModal;
  const AdminFilledMenuIcon = __comp.AdminFilledMenuIcon || __deps.AdminFilledMenuIcon;
  const AdminRestorePhraseModal = __comp.AdminRestorePhraseModal || __deps.AdminRestorePhraseModal;
  const AdminUnifiedSearchModal = __comp.AdminUnifiedSearchModal || __deps.AdminUnifiedSearchModal;
  const AdminUnifiedSearchResultsView = __comp.AdminUnifiedSearchResultsView || __deps.AdminUnifiedSearchResultsView;
  const AlertTriangleIcon = __comp.AlertTriangleIcon || __deps.AlertTriangleIcon;
  const CalendarCogIcon = __comp.CalendarCogIcon || __deps.CalendarCogIcon;
  const ChartBarIcon = __comp.ChartBarIcon || __deps.ChartBarIcon;
  const ChartPieIcon = __comp.ChartPieIcon || __deps.ChartPieIcon;
  const ChatSectionIcon = __comp.ChatSectionIcon || __deps.ChatSectionIcon;
  const CloudDataConnectionIcon = __comp.CloudDataConnectionIcon || __deps.CloudDataConnectionIcon;
  const ColorSwatchPicker = __comp.ColorSwatchPicker || __deps.ColorSwatchPicker;
  const ConfirmDialog = __comp.ConfirmDialog || __deps.ConfirmDialog;
  const DonutChart = __comp.DonutChart || __deps.DonutChart;
  const ExternalLinkIcon = __comp.ExternalLinkIcon || __deps.ExternalLinkIcon;
  const HourglassIcon = __comp.HourglassIcon || __deps.HourglassIcon;
  const LockIcon = __comp.LockIcon || __deps.LockIcon;
  const LogoutIcon = __comp.LogoutIcon || __deps.LogoutIcon;
  const PodiumIcon = __comp.PodiumIcon || __deps.PodiumIcon;
  const PollModal = __comp.PollModal || __deps.PollModal;
  const PollSectionIcon = __comp.PollSectionIcon || __deps.PollSectionIcon;
  const RefreshIcon = __comp.RefreshIcon || __deps.RefreshIcon;
  const SearchIcon = __comp.SearchIcon || __deps.SearchIcon;
  const SectionCountBadge = __comp.SectionCountBadge || __deps.SectionCountBadge;
  const SettingsIcon = __comp.SettingsIcon || __deps.SettingsIcon;
  const ShieldCheckIcon = __comp.ShieldCheckIcon || __deps.ShieldCheckIcon;
  const SmallXIcon = __comp.SmallXIcon || __deps.SmallXIcon;
  const TrophyIcon = __comp.TrophyIcon || __deps.TrophyIcon;
  const fetchSubcollectionCount = __deps.fetchSubcollectionCount;
  const sanitizeText = __deps.sanitizeText;
  const getActiveParticipants = __deps.getActiveParticipants;

  const [serverCalendars, setServerCalendars] = React.useState(cloneCalendarList(initialCalendars || []));
  const [loadedAt, setLoadedAt] = React.useState(null);
  const [error, setError] = React.useState('');
  const [toast, setToast] = React.useState(null);
  const importInputRef = React.useRef(null);
  const isRestoreMode = isAdminRestoreRoute();

  // Tab control state
  const [activeTab, setActiveTab] = React.useState('settings'); // 'settings' (일반), 'metrics' (통계), 'logs', 'recovery'

  // Selected calendar for settings and recovery tabs
  const [selectedCalId, setSelectedCalId] = React.useState(() => getAdminSelectedCalendarIdFromUrl('kkot'));

  // Calendar profile edit states
  const [calTitle, setCalTitle] = React.useState('');
  const [calDesc, setCalDesc] = React.useState('');
	  const [calAccentColor, setCalAccentColor] = React.useState('');
	  const [calParticipants, setCalParticipants] = React.useState([]);
	  const [calSettlementBaseBudget, setCalSettlementBaseBudget] = React.useState('');
	  const [calExpenseCategories, setCalExpenseCategories] = React.useState(DEFAULT_EXPENSE_CATEGORIES);
	  const [newExpenseCategoryName, setNewExpenseCategoryName] = React.useState('');
	  const [calPlaceCategories, setCalPlaceCategories] = React.useState(DEFAULT_PLACE_CATEGORIES);
	  const [newPlaceCategoryName, setNewPlaceCategoryName] = React.useState('');
	  const [newPartName, setNewPartName] = React.useState('');
  const newPartNameRef = React.useRef(null);

  // Poll sub-modal state
  const [editingPollCalId, setEditingPollCalId] = React.useState(null);
  const [editingPoll, setEditingPoll] = React.useState(null);
  const [isPollModalOpen, setIsPollModalOpen] = React.useState(false);

  // Unified chat log states
  const [messagesMap, setMessagesMap] = React.useState({});
  const [adminMessageLimit, setAdminMessageLimit] = React.useState(ADMIN_MESSAGE_LIVE_LIMIT);
  const [adminMemoLimit, setAdminMemoLimit] = React.useState(ADMIN_MEMO_LIVE_LIMIT);
  const [adminMsgTotal, setAdminMsgTotal] = React.useState({});
  const [adminMemoTotal, setAdminMemoTotal] = React.useState({});
  const [chatSearchQuery, setChatSearchQuery] = React.useState('');
  // Per-calendar memos, loaded the same way as messagesMap -- powers the 통합검색 메모 tab.
  const [memosMap, setMemosMap] = React.useState({});
  // Full activity log history for the calendar selected in Tab 2/3, sourced from the
  // activityLogs subcollection. Fetched in full (no limit) since point-in-time recovery needs
  // every entry, not just a recent window, to correctly replay state up to a cutoff.
  const [selectedCalActivityLogs, setSelectedCalActivityLogs] = React.useState([]);

  // Timeline filters and pagination for Tab 4 (Recovery logs)
  const [timelineSearchQuery, setTimelineSearchQuery] = React.useState('');
  const [timelineTypeFilter, setTimelineTypeFilter] = React.useState('all');
  const [timelineStartDate, setTimelineStartDate] = React.useState('');
  const [timelineEndDate, setTimelineEndDate] = React.useState('');
  const [timelineLimit, setTimelineLimit] = React.useState(100);

  // Shared link-preview cache stats (통합 링크미리보기), service-wide (not per-calendar) --
  // see appConfig/linkPreviewStats + hashUrlForCache/fetchLinkPreview.
  const [linkPreviewStats, setLinkPreviewStats] = React.useState(null);

  // Kakao Local (지도 검색) daily call count, service-wide -- see appConfig/kakaoLocalSearchStats,
  // written server-side by kakaoLocalSearchProxy (functions/index.js).
  const [kakaoSearchStats, setKakaoSearchStats] = React.useState(null);

  // Google Places (해외 장소 검색 폴백) monthly call count, service-wide -- see
  // appConfig/googlePlacesSearchStats, written server-side by googlePlacesSearchProxy
  // (functions/index.js). Unlike Kakao (free at this app's scale), Google Places is billed past
  // its free monthly SKU threshold, so this is tracked monthly (matching how Google's own free
  // tier resets) rather than daily.
  const [googlePlacesStats, setGooglePlacesStats] = React.useState(null);

  const lastSyncedRef = React.useRef(null);

  const showAdminToast = (message, type = 'success', duration = 3000) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), duration);
  };

  // Generic layer-popup confirm dialog (replaces window.confirm across this page)
  const [confirmDialog, setConfirmDialog] = React.useState(null);
  const requestConfirm = (title, message, onConfirm, showPasswordInput = false) => {
    setConfirmDialog({
      title,
      message,
      onConfirm: () => {
        setConfirmDialog(null);
        onConfirm();
      },
      showPasswordInput
    });
  };
  const closeConfirmDialog = () => setConfirmDialog(null);

  // New calendar creation modal (replaces window.prompt across this page)
  const [isCreateCalModalOpen, setIsCreateCalModalOpen] = React.useState(false);

  // Restore-mode confirmation phrase modal (replaces window.prompt)
  const [isRestorePhraseModalOpen, setIsRestorePhraseModalOpen] = React.useState(false);

  // Admin password change
  const [isChangePwOpen, setIsChangePwOpen] = React.useState(false);
  const [isHeaderCalPickerOpen, setIsHeaderCalPickerOpen] = React.useState(false);
  const [isAdminMenuOpen, setIsAdminMenuOpen] = React.useState(false);
  // Unified cross-calendar search: input popup + result page (non-null query -> show results page).
  // Query and its 캘린더/기간 filters are all mirrored into the URL (?search=&cal=&from=&to=) so
  // the results page is its own addressable/bookmarkable/shareable route rather than only living
  // in component state.
  const [isUnifiedSearchOpen, setIsUnifiedSearchOpen] = React.useState(false);
  const [unifiedSearchQuery, setUnifiedSearchQueryState] = React.useState(getAdminSearchQueryFromUrl);
  const [unifiedSearchCalFilter, setUnifiedSearchCalFilterState] = React.useState(() => getAdminSearchFilterFromUrl().calFilter);
  const [unifiedSearchDateStart, setUnifiedSearchDateStartState] = React.useState(() => getAdminSearchFilterFromUrl().dateStart);
  const [unifiedSearchDateEnd, setUnifiedSearchDateEndState] = React.useState(() => getAdminSearchFilterFromUrl().dateEnd);
  const pushSearchUrl = (overrides) => {
    const params = new URLSearchParams(window.location.search);
    const next = {
      search: 'query' in overrides ? overrides.query : unifiedSearchQuery,
      cal: 'calFilter' in overrides ? overrides.calFilter : unifiedSearchCalFilter,
      from: 'dateStart' in overrides ? overrides.dateStart : unifiedSearchDateStart,
      to: 'dateEnd' in overrides ? overrides.dateEnd : unifiedSearchDateEnd
    };
    if (next.search) params.set('search', next.search); else params.delete('search');
    if (next.cal && next.cal !== 'all') params.set('cal', next.cal); else params.delete('cal');
    if (next.from) params.set('from', next.from); else params.delete('from');
    if (next.to) params.set('to', next.to); else params.delete('to');
    window.history.pushState({}, '', `${window.location.pathname}?${params.toString()}`);
  };
  const syncSelectedCalendarUrl = (calId, mode = 'replace') => {
    const params = new URLSearchParams(window.location.search);
    params.set('admin', '1');
    if (calId && isValidCalendarId(calId)) params.set('id', calId); else params.delete('id');
    const nextUrl = `${window.location.pathname}?${params.toString()}`;
    if (mode === 'push') window.history.pushState({}, '', nextUrl);
    else window.history.replaceState({}, '', nextUrl);
  };
  const selectAdminCalendar = (calId, mode = 'replace') => {
    if (!isValidCalendarId(calId)) return;
    setSelectedCalId(calId);
    syncSelectedCalendarUrl(calId, mode);
  };
  const setUnifiedSearchQuery = (query) => { setUnifiedSearchQueryState(query); pushSearchUrl({ query }); };
  const setUnifiedSearchCalFilter = (calFilter) => { setUnifiedSearchCalFilterState(calFilter); pushSearchUrl({ calFilter }); };
  const setUnifiedSearchDateStart = (dateStart) => { setUnifiedSearchDateStartState(dateStart); pushSearchUrl({ dateStart }); };
  const setUnifiedSearchDateEnd = (dateEnd) => { setUnifiedSearchDateEndState(dateEnd); pushSearchUrl({ dateEnd }); };
  React.useEffect(() => {
    const handlePop = () => {
      setUnifiedSearchQueryState(getAdminSearchQueryFromUrl());
      const f = getAdminSearchFilterFromUrl();
      setUnifiedSearchCalFilterState(f.calFilter);
      setUnifiedSearchDateStartState(f.dateStart);
      setUnifiedSearchDateEndState(f.dateEnd);
      setSelectedCalId(getAdminSelectedCalendarIdFromUrl('kkot'));
    };
    window.addEventListener('popstate', handlePop);
    return () => window.removeEventListener('popstate', handlePop);
  }, []);
  const [currentPwInput, setCurrentPwInput] = React.useState('');
  const [newPwInput, setNewPwInput] = React.useState('');
  const [confirmPwInput, setConfirmPwInput] = React.useState('');
  const [pwError, setPwError] = React.useState('');
  const [isPwSubmitting, setIsPwSubmitting] = React.useState(false);

  const handleLogoutAdmin = () => {
    clearAdminSession();
    window.location.reload();
  };

  const resetChangePwForm = () => {
    setCurrentPwInput('');
    setNewPwInput('');
    setConfirmPwInput('');
    setPwError('');
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (isPwSubmitting) return;
    setPwError('');
    if (newPwInput.length < 6) {
      setPwError('새 비밀번호는 6자 이상이어야 합니다.');
      return;
    }
    if (newPwInput !== confirmPwInput) {
      setPwError('새 비밀번호가 서로 일치하지 않습니다.');
      return;
    }
    setIsPwSubmitting(true);
    try {
      const newHash = await sha256Hex(newPwInput.trim());
      const trimmedCurrent = currentPwInput.trim();
      await changeAdminPasswordRemote(trimmedCurrent, newHash);
      // The session's cached password (see getAdminSession) is what listAllCalendarsRemote
      // sends on every later call -- it has to be updated to the new one now, or the very next
      // dashboard refresh sends the now-stale old password and gets rejected.
      setAdminSession(newPwInput.trim());
      setIsChangePwOpen(false);
      resetChangePwForm();
      showAdminToast('비밀번호 변경완료', 'success');
    } catch (err) {
      console.warn('Admin password change failed:', err);
      setPwError(err?.message || '비밀번호 변경 중 오류가 발생했습니다.');
    } finally {
      setIsPwSubmitting(false);
    }
  };

  // 1. Cross-calendar list, via listAllCalendars (Cloud Function) instead of a direct Firestore
  // listener -- /calendars no longer grants the client SDK `list` (see firestore.rules), so this
  // is now the only way to get every calendar's data, and it requires the admin password the
  // session was unlocked with. Not a live listener anymore, so it's polled on an interval to
  // approximate the old real-time behavior, plus refreshTick lets callers (e.g. a manual
  // refresh action) force an immediate re-fetch.
  const [refreshTick, setRefreshTick] = React.useState(0);
  const refreshServerCalendars = () => setRefreshTick(tick => tick + 1);
  const [isAdminListLoading, setIsAdminListLoading] = React.useState(true);
  const adminListLastModifiedRef = React.useRef(0);
  const adminListModeRef = React.useRef('none');
  const selectedCalIdRef = React.useRef(selectedCalId);
  selectedCalIdRef.current = selectedCalId;
  React.useEffect(() => {
    let isMounted = true;
    let intervalId = null;
    const session = getAdminSession();
    if (!session) {
      setError('관리자 세션이 만료되었습니다. 다시 로그인해 주세요.');
      setIsAdminListLoading(false);
      return () => { isMounted = false; };
    }
    const applyList = (calendars, lastModified, mode) => {
      if (!isMounted) return;
      const lm = Number(lastModified) || 0;
      if (lm > 0) adminListLastModifiedRef.current = lm;
      adminListModeRef.current = mode || 'summary';
      setServerCalendars(cloneCalendarList(calendars || []).map(normalizeCalendarForSave));
      setLoadedAt(new Date());
      setError('');
      setIsAdminListLoading(false);
    };
    const preferId = selectedCalIdRef.current || getAdminSelectedCalendarIdFromUrl('kkot');
    const fast = (preferId ? fetchSingleCalendarWithRest(preferId, 6000) : Promise.resolve(null))
      .then(one => {
        if (!isMounted || !one || !one.id) return;
        if (adminListModeRef.current !== 'none') return;
        setServerCalendars([normalizeCalendarForSave(one)]);
        setIsAdminListLoading(false);
        setError('');
      }).catch(() => {});
    const loadSummary = () => listAllCalendarsRemote(session.password, { mode: 'summary' })
      .then(result => applyList(result.calendars, result.lastModified, 'summary'));
    const loadViaRestFallback = async () => {
      const knownIds = ['cw', 'kkot', 'jhair'];
      const preferId = selectedCalIdRef.current || getAdminSelectedCalendarIdFromUrl('kkot');
      const ids = Array.from(new Set([preferId, ...knownIds].filter(Boolean)));
      const results = await Promise.all(ids.map(id => fetchSingleCalendarWithRest(id, 8000).catch(() => null)));
      const cals = results.filter(c => c && c.id).map(normalizeCalendarForSave);
      if (!isMounted || cals.length === 0) return false;
      adminListModeRef.current = 'rest-fallback';
      setServerCalendars(cloneCalendarList(cals));
      setLoadedAt(new Date());
      setError('');
      setIsAdminListLoading(false);
      return true;
    };
    loadSummary().catch(async (err) => {
      console.warn('listAllCalendars summary failed', err);
      if (!isMounted) return;
      const ok = await loadViaRestFallback();
      if (!ok && adminListModeRef.current === 'none') {
        setError(err.message || '대시보드 데이터를 불러오지 못했습니다.');
        setIsAdminListLoading(false);
      }
    });
    void fast;
    const startPoll = () => {
      if (intervalId) return;
      intervalId = setInterval(() => { loadSummary().catch(() => {}); }, 180000);
    };
    const stopPoll = () => { if (intervalId) { clearInterval(intervalId); intervalId = null; } };
    startPoll();
    const onVis = () => {
      if (typeof document === 'undefined') return;
      if (document.visibilityState === 'hidden') stopPoll();
      else { loadSummary().catch(() => {}); startPoll(); }
    };
    if (typeof document !== 'undefined') document.addEventListener('visibilitychange', onVis);
    return () => {
      isMounted = false; stopPoll();
      if (typeof document !== 'undefined') document.removeEventListener('visibilitychange', onVis);
    };
  }, [refreshTick]);

  React.useEffect(() => {
    if (activeTab !== 'metrics' && activeTab !== 'recovery') return;
    if (adminListModeRef.current === 'full') return;
    const session = getAdminSession();
    if (!session) return;
    let cancelled = false;
    listAllCalendarsRemote(session.password, { mode: 'full' })
      .then(result => {
        if (cancelled) return;
        adminListModeRef.current = 'full';
        if (result.lastModified) adminListLastModifiedRef.current = Number(result.lastModified) || 0;
        setServerCalendars(cloneCalendarList(result.calendars || []).map(normalizeCalendarForSave));
        setLoadedAt(new Date());
      }).catch(err => console.warn('admin full list', err));
    return () => { cancelled = true; };
  }, [activeTab, refreshTick]);

  const calendarsList = React.useMemo(() => serverCalendars
    .filter(cal => cal && !isInternalTestCalendarId(cal.id))
    .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0)), [serverCalendars]);

  // Auto-select first calendar if selectedCalId is not valid/present in lists (fixes blank tab bug)
  React.useEffect(() => {
    if (calendarsList.length > 0) {
      const exists = calendarsList.some(c => c.id === selectedCalId);
      if (!exists) {
        selectAdminCalendar(calendarsList[0].id, 'replace');
      } else {
        syncSelectedCalendarUrl(selectedCalId, 'replace');
      }
    }
  }, [calendarsList, selectedCalId]);

  // 2. Load Messages (Firestore snapshots or REST) -- capped per calendar (not truly unbounded)
  // so opening the admin dashboard doesn't download/live-sync a calendar's entire message
  // history forever; see the matching cap on GlobalSearchModal's own full-history search fetch.
  React.useEffect(() => {
    if (!selectedCalId) return;
    setAdminMessageLimit(ADMIN_MESSAGE_LIVE_LIMIT);
    setAdminMemoLimit(ADMIN_MEMO_LIVE_LIMIT);
  }, [selectedCalId]);

  React.useEffect(() => {
    if (!firebaseDb || !calendarsList.length) return;
    let cancelled = false;
    const ids = calendarsList.map(c => c.id).filter(Boolean);
    (async () => {
      const rows = await Promise.all(ids.map(async id => {
        const [mc, mm] = await Promise.all([
          fetchSubcollectionCount(id, 'messages'),
          fetchSubcollectionCount(id, 'memos')
        ]);
        return { id, mc, mm };
      }));
      if (cancelled) return;
      setAdminMsgTotal(prev => {
        const next = { ...prev };
        rows.forEach(({ id, mc }) => { if (mc != null) next[id] = mc; });
        return next;
      });
      setAdminMemoTotal(prev => {
        const next = { ...prev };
        rows.forEach(({ id, mm }) => { if (mm != null) next[id] = mm; });
        return next;
      });
    })();
    return () => { cancelled = true; };
  }, [firebaseDb, calendarsList.map(c => c.id).join('|')]);

  // Chat messages: only selected calendar while 채팅 tab is open
  React.useEffect(() => {
    if (activeTab !== 'logs' || !selectedCalId) return;

    if (firebaseDb) {
      const unsub = firebaseDb.collection('calendars').doc(`cal_${selectedCalId}`).collection('messages')
        .orderBy('timestamp', 'desc').limit(adminMessageLimit)
        .onSnapshot(snapshot => {
          const list = [];
          snapshot.forEach(doc => {
            const data = doc.data();
            if (data) list.push({ id: doc.id, ...data });
          });
          setMessagesMap(prev => ({
            ...prev,
            [selectedCalId]: list.sort((a, b) => b.timestamp - a.timestamp)
          }));
        }, err => {
          console.error(`Failed to load messages for ${selectedCalId}:`, err);
        });
      return () => unsub();
    }
    (async () => {
      try {
        const recent = await fetchRecentMessagesRest(selectedCalId);
        const chat = await fetchChatMessagesRest(selectedCalId);
        const combined = [...recent, ...chat].sort((a, b) => b.timestamp - a.timestamp);
        setMessagesMap(prev => ({ ...prev, [selectedCalId]: combined }));
      } catch (e) {
        console.error(`Failed REST message fetch for ${selectedCalId}:`, e);
      }
    })();
  }, [selectedCalId, firebaseDb, activeTab, adminMessageLimit]);

  // 2b. Load memos (same live-listener pattern as messages above, same 2000 cap) -- powers the
  // 통합검색 메모 탭
  React.useEffect(() => {
    if (activeTab !== 'logs' || !selectedCalId || !firebaseDb) return;
    const unsub = firebaseDb.collection('calendars').doc(`cal_${selectedCalId}`).collection('memos')
      .orderBy('createdAt', 'desc').limit(adminMemoLimit)
      .onSnapshot(snapshot => {
        const list = [];
        snapshot.forEach(doc => {
          const data = doc.data();
          if (data) list.push({ id: doc.id, ...data });
        });
        setMemosMap(prev => ({ ...prev, [selectedCalId]: list }));
      }, err => {
        console.error(`Failed to load memos for ${selectedCalId}:`, err);
      });
    return () => unsub();
  }, [selectedCalId, firebaseDb, activeTab, adminMemoLimit]);

  // Link-preview cache stats only on metrics tab (egress rule)
  React.useEffect(() => {
    if (!firebaseDb) return;
    if (activeTab !== 'metrics') return;
    const unsub = firebaseDb.collection('appConfig').doc('linkPreviewStats').onSnapshot(snap => {
      setLinkPreviewStats(snap.exists ? snap.data() : { cachedCount: 0, updatedAt: null });
    }, () => setLinkPreviewStats(null));
    return () => unsub && unsub();
  }, [firebaseDb, activeTab]);

  // Kakao Local search daily usage, loaded once (not tied to any single calendar)
  React.useEffect(() => {
    if (!firebaseDb) return;
    if (activeTab !== 'metrics') return;
    const unsub = firebaseDb.collection('appConfig').doc('kakaoLocalSearchStats').onSnapshot(snap => {
      setKakaoSearchStats(snap.exists ? snap.data() : { dailyUsageBucket: null, dailyUsageCount: 0 });
    }, () => setKakaoSearchStats(null));
    return () => unsub && unsub();
  }, [firebaseDb, activeTab]);

  // Google Places search monthly usage, loaded once (not tied to any single calendar)
  React.useEffect(() => {
    if (!firebaseDb) return;
    if (activeTab !== 'metrics') return;
    const unsub = firebaseDb.collection('appConfig').doc('googlePlacesSearchStats').onSnapshot(snap => {
      setGooglePlacesStats(snap.exists ? snap.data() : { monthlyUsageBucket: null, monthlyUsageCount: 0 });
    }, () => setGooglePlacesStats(null));
    return () => unsub && unsub();
  }, [firebaseDb, activeTab]);

  // Full, unbounded activity log history for the selected calendar -- only unifiedTimeline
  // (복구 탭's PITR replay) ever reads selectedCalActivityLogs, so this only needs to fetch
  // while that tab is actually open, not on every calendar switch made from 설정/통계/로그.
  const activityLogsCacheRef = React.useRef({});
  React.useEffect(() => {
    if (!selectedCalId || activeTab !== 'recovery') {
      if (activeTab !== 'recovery') setSelectedCalActivityLogs([]);
      return;
    }
    const cached = activityLogsCacheRef.current[selectedCalId];
    if (Array.isArray(cached)) {
      setSelectedCalActivityLogs(cached);
      return;
    }
    let isMounted = true;
    setSelectedCalActivityLogs([]);
    fetchActivityLogsFromFirestore(selectedCalId, 500).then(list => {
      activityLogsCacheRef.current[selectedCalId] = list;
      if (isMounted) setSelectedCalActivityLogs(list);
    });
    return () => { isMounted = false; };
  }, [selectedCalId, activeTab]);

  React.useEffect(() => {
    setTimelineSearchQuery('');
    setTimelineTypeFilter('all');
    setTimelineStartDate('');
    setTimelineEndDate('');
    setTimelineLimit(100);
  }, [selectedCalId]);

  // Sync Tab 2 form values when selectedCalId changes or serverCalendars list updates (avoiding wiping edits)
  React.useEffect(() => {
    const cal = serverCalendars.find(c => c.id === selectedCalId);
    if (cal) {
      const key = `${cal.id}_rev_${cal.revision || 0}`;
      if (lastSyncedRef.current !== key) {
        setCalTitle(cal.title);
        setCalDesc(cal.description || '');
	        setCalAccentColor(normalizeColorValue(cal.accentColor, getCalendarAccentColor(cal, serverCalendars.findIndex(c => c.id === cal.id))));
	        setCalParticipants(getActiveParticipants(cal));
	        setCalSettlementBaseBudget(Number(cal.settlementBaseBudget || 0).toLocaleString());
	        setCalExpenseCategories(getExpenseCategories(cal));
	        setNewExpenseCategoryName('');
	        setCalPlaceCategories(getPlaceCategories(cal));
	        setNewPlaceCategoryName('');
	        setNewPartName('');
        lastSyncedRef.current = key;
      }
    }
  }, [selectedCalId, serverCalendars]);

  // Create new calendar from dashboard (via isCreateCalModalOpen modal, not window.prompt)
  const handleCreateNewCalendarFromAdmin = () => {
    setIsCreateCalModalOpen(true);
  };

  const submitCreateCalendar = async (rawId, rawTitle) => {
    const id = (rawId || '').trim();
    const titleVal = (rawTitle || '').trim();
    if (!id) return '캘린더 ID를 입력해 주세요.';
    if (!isValidCalendarId(id)) return '캘린더 ID는 영문, 숫자, -, _ 조합으로 입력해 주세요.';
    if (serverCalendars.some(c => c.id === id)) return '이미 존재하는 캘린더 ID입니다.';
    if (!titleVal) return '캘린더 제목을 입력해 주세요.';

    const now = Date.now();
    const newCal = {
      ...createDefaultCalendar(id),
      title: titleVal,
      description: `${titleVal} 참여자들의 일정 조율`,
      updatedAt: now,
      revision: 1
    };

    const saved = await pushSingleCloudCalendar(newCal, now, 18, null, 'replace');
    if (saved) {
      setServerCalendars(prev => [newCal, ...prev]);
      selectAdminCalendar(newCal.id, 'replace');
      setIsCreateCalModalOpen(false);
      showAdminToast('캘린더 생성완료', 'success');
      return '';
    }
    return '캘린더 생성에 실패했습니다.';
  };

  // Backup operations
  const handleDownloadBackup = (calendarId = '') => {
    const payload = createCalendarBackupPayload(calendarsList, calendarId);
    if (!payload.calendars.length) {
      showAdminToast('백업할 데이터 없음', 'error');
      return;
    }
    const suffix = calendarId || 'all';
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
    downloadJsonFile(`calendar-backup-${suffix}-${timestamp}.json`, payload);
    showAdminToast(`${suffix} 백업 다운로드완료`);
  };

  const handleImportClick = () => {
    if (!firebaseDb || !ENABLE_FIRESTORE_WRITES) {
      showAdminToast('쓰기 연결 없음', 'error');
      return;
    }
    if (!isRestoreMode) {
      showAdminToast('복구 모드 필요 (restore=1)', 'error', 6000);
      return;
    }
    setIsRestorePhraseModalOpen(true);
  };

  const submitRestorePhrase = (phrase) => {
    if (phrase !== '운영 데이터 복구') {
      return '확인 문구가 일치하지 않습니다. "운영 데이터 복구"를 정확히 입력해 주세요.';
    }
    setIsRestorePhraseModalOpen(false);
    importInputRef.current?.click();
    return '';
  };

  const performBackupRestore = async (calendars) => {
    closeConfirmDialog();
    const now = Date.now();
    const results = [];
    for (const calendar of calendars) {
      const restoredCalendar = {
        ...calendar,
        updatedAt: now,
        revision: (calendar.revision || 0) + 1
      };
      const saved = await pushSingleCloudCalendar(restoredCalendar, now, 18, null, 'restore');
      results.push({ id: calendar.id, saved, calendar: restoredCalendar });
    }
    const failed = results.filter(result => !result.saved);
    if (failed.length) {
      showAdminToast(`${failed.map(result => result.id).join(', ')} 복구 실패`, 'error', 6000);
      return;
    }
    setServerCalendars(prev => mergeCalendarCollections(prev, results.map(result => result.calendar), { replaceMatchingId: true }));
    showAdminToast('데이터 복구완료');
  };

  const handleImportBackup = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    try {
      const raw = await file.text();
      const parsed = JSON.parse(raw);
      const { calendars, error: validationError } = validateBackupCalendars(extractCalendarsFromBackup(parsed));
      if (validationError) {
        showAdminToast(validationError, 'error', 6000);
        return;
      }
      const message = `${calendars.map(calendar => calendar.id).join(', ')} 데이터를 백업 파일 내용으로 복구합니다. 현재 Firestore 데이터가 해당 백업으로 교체됩니다. 계속할까요?`;
      requestConfirm('데이터 복구 확인', message, () => performBackupRestore(calendars));
    } catch (err) {
      console.error('Calendar backup import failed:', err);
      showAdminToast('복구 실패', 'error', 6000);
    }
  };

  // Tab 2 Profile Saving
  const handleSaveCalendarSettings = async () => {
    const cal = serverCalendars.find(c => c.id === selectedCalId);
    if (!cal) return;

    if (!calTitle.trim()) {
      showAdminToast('캘린더명 필요', 'error');
      return;
    }

    const activeParts = calParticipants.filter(p => !isTombstone(p));
    const activeNames = activeParts.map(p => p.name.trim().toLowerCase());
    if (new Set(activeNames).size !== activeNames.length) {
      showAdminToast('참여자 이름 중복', 'error');
      return;
    }

    const now = Date.now();
    const stampedCal = {
      ...cal,
      title: calTitle.trim(),
      description: calDesc.trim(),
	      accentColor: normalizeColorValue(calAccentColor, getCalendarAccentColor(cal, serverCalendars.findIndex(c => c.id === cal.id))),
	      participants: calParticipants,
	      settlementBaseBudget: Number((calSettlementBaseBudget || '').replace(/[^0-9]/g, '')) || 0,
	      expenseCategories: normalizeExpenseCategories(calExpenseCategories),
	      placeCategories: normalizePlaceCategories(calPlaceCategories),
	      updatedAt: now,
      revision: (cal.revision || 0) + 1
    };

    const saved = await pushSingleCloudCalendar(stampedCal, now, 18, null, 'settings');
    if (saved) {
      setServerCalendars(prev => prev.map(c => c.id === selectedCalId ? stampedCal : c));
      showAdminToast('설정 저장완료', 'success');
    } else {
      showAdminToast('설정 저장 실패', 'error');
    }
  };

  const handleAddPart = () => {
    const latest = newPartNameRef.current ? newPartNameRef.current.value : newPartName;
    const trimmed = sanitizeText(latest, 40);
    if (!trimmed) return;
    const newPart = {
      id: `${selectedCalId}_p_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      name: trimmed,
      color: normalizeColorValue(PRESET_COLORS[calParticipants.filter(p => !isTombstone(p)).length % PRESET_COLORS.length]),
      updatedAt: Date.now()
    };
    setCalParticipants(prev => [...prev, newPart]);
    setNewPartName('');
    if (newPartNameRef.current) newPartNameRef.current.value = '';
  };

	  const handleUpdatePart = (partId, patch) => {
	    setCalParticipants(prev => prev.map(p => p.id === partId ? { ...p, ...patch, updatedAt: Date.now() } : p));
	  };
	  const handleAddExpenseCategory = () => {
	    const trimmed = sanitizeText(newExpenseCategoryName, 24);
	    if (!trimmed) return;
	    const slug = trimmed.toLowerCase().replace(/[^a-z0-9가-힣_-]/g, '').slice(0, 24) || `cat_${Date.now()}`;
	    const idBase = `custom_${slug}`;
	    const existingIds = new Set(calExpenseCategories.map(category => category.id));
	    const id = existingIds.has(idBase) ? `${idBase}_${Date.now().toString(36).slice(-4)}` : idBase;
	    setCalExpenseCategories(prev => [...prev, {
	      id,
	      name: trimmed,
	      color: normalizeColorValue(PRESET_COLORS[prev.length % PRESET_COLORS.length], '#64748B')
	    }]);
	    setNewExpenseCategoryName('');
	  };
	  const handleUpdateExpenseCategory = (categoryId, patch) => {
	    setCalExpenseCategories(prev => prev.map(category => category.id === categoryId ? {
	      ...category,
	      ...patch,
	      name: patch.name != null ? sanitizeText(patch.name, 24) : category.name,
	      color: patch.color != null ? normalizeColorValue(patch.color, category.color) : category.color
	    } : category));
	  };
	  const handleRemoveExpenseCategory = categoryId => {
	    const target = calExpenseCategories.find(c => c.id === categoryId);
	    const nameText = target ? target.name : '카테고리';
	    requestConfirm(
	      '지출 카테고리 삭제',
	      `"${nameText}" 지출 카테고리를 삭제하시겠습니까?`,
	      () => {
	        setCalExpenseCategories(prev => {
	          const next = prev.filter(category => category.id !== categoryId);
	          return next.length ? next : DEFAULT_EXPENSE_CATEGORIES;
	        });
	      }
	    );
	  };
	  const handleAddPlaceCategory = () => {
	    const trimmed = sanitizeText(newPlaceCategoryName, 24);
	    if (!trimmed) return;
	    const slug = trimmed.toLowerCase().replace(/[^a-z0-9가-힣_-]/g, '').slice(0, 24) || `cat_${Date.now()}`;
	    const idBase = `custom_${slug}`;
	    const existingIds = new Set(calPlaceCategories.map(category => category.id));
	    const id = existingIds.has(idBase) ? `${idBase}_${Date.now().toString(36).slice(-4)}` : idBase;
	    setCalPlaceCategories(prev => [...prev, {
	      id,
	      name: trimmed,
	      color: normalizeColorValue(PRESET_COLORS[prev.length % PRESET_COLORS.length], '#64748B')
	    }]);
	    setNewPlaceCategoryName('');
	  };
	  const handleUpdatePlaceCategory = (categoryId, patch) => {
	    setCalPlaceCategories(prev => prev.map(category => category.id === categoryId ? {
	      ...category,
	      ...patch,
	      name: patch.name != null ? sanitizeText(patch.name, 24) : category.name,
	      color: patch.color != null ? normalizeColorValue(patch.color, category.color) : category.color
	    } : category));
	  };
	  const handleRemovePlaceCategory = categoryId => {
	    const target = calPlaceCategories.find(c => c.id === categoryId);
	    const nameText = target ? target.name : '카테고리';
	    requestConfirm(
	      '장소 카테고리 삭제',
	      `"${nameText}" 장소 카테고리를 삭제하시겠습니까?`,
	      () => {
	        setCalPlaceCategories(prev => {
	          const next = prev.filter(category => category.id !== categoryId);
	          return next.length ? next : DEFAULT_PLACE_CATEGORIES;
	        });
	      }
	    );
	  };

	  // Delete Poll from Admin Page
  const handleDeletePollFromAdminPage = (calId, poll) => {
    requestConfirm('투표 삭제', `"${poll.title}" 투표를 삭제하시겠습니까?`, () => {
      closeConfirmDialog();
      const targetCal = serverCalendars.find(c => c.id === calId);
      if (!targetCal) return;

      const now = Date.now();
      // Tombstone (mark deletedAt) rather than filter the poll out of the array: saveMode
      // 'polls' merges via mergePolls, which unions this calendar's polls with whatever's
      // still on the server by ID -- a poll simply missing from the outgoing payload looks
      // like "no change" to that union, not "delete", so the server's copy survives and
      // resurrects it. mergePollRecord already carries deletedAt through merges, so marking
      // it here is what actually sticks.
      const nextPolls = (targetCal.polls || []).map(p => p.id === poll.id ? { ...p, deletedAt: now, updatedAt: now } : p);
      const updatedCal = {
        ...targetCal,
        polls: nextPolls,
        updatedAt: now,
        revision: (targetCal.revision || 0) + 1
      };

      pushSingleCloudCalendar(updatedCal, now, 18, null, 'polls').then(saved => {
        if (saved) {
          setServerCalendars(prev => prev.map(c => c.id === calId ? updatedCal : c));
          showAdminToast('투표 삭제완료', 'success');
        } else {
          showAdminToast('투표 삭제 실패', 'error');
        }
      });
    });
  };

  // Point-in-time Recovery implementation (includes schedule, polls AND chat messages)
  const handleRestoreToLogTimestamp = (calId, log) => {
    const cal = serverCalendars.find(c => c.id === calId);
    if (!cal) return;

    const timeLabel = formatRegisteredAt(log.timestamp);
    const typeLabel = log.type === 'chat' ? '채팅 발송' :
                      log.action === 'create' ? '일정 등록' :
                      log.action === 'update' ? '일정 변경' :
                      log.action === 'delete' ? '일정 삭제' :
                      log.action === 'poll_create' ? '투표 생성' :
                      log.action === 'poll_vote' ? '투표 진행' :
                      log.action === 'poll_cancel' ? '투표 취소' :
                      log.action === 'expense_create' ? '지출/수입 등록' :
                      log.action === 'expense_update' ? '지출/수입 수정' :
                      log.action === 'expense_delete' ? '지출/수입 삭제' :
                      log.action === 'meeting_confirm' ? '모임 확정' :
                      log.action === 'meeting_cancel' ? '모임 확정 취소' :
                      log.action === 'tag_add' ? '사진 태그 추가' :
                      log.action === 'tag_remove' ? '사진 태그 삭제' :
                      log.action === 'memo_create' ? '메모 추가' :
                      log.action === 'memo_update' ? '메모 변경' :
                      log.action === 'memo_delete' ? '메모 삭제' :
                      log.action === 'place_create' ? '장소 등록' :
                      log.action === 'place_update' ? '장소 수정' :
                      log.action === 'place_delete' ? '장소 삭제' : '활동';

    const msg = `[${calId}] 시점 데이터 전체 복구 (타겟 로그: [${timeLabel}] [${typeLabel}]) — 이 시점으로 데이터를 복구하시겠습니까? 이 시점 이후 등록된 모든 일정/투표 롤백과 동시에, 이 시간 이후 전송된 모든 채팅 메시지도 서버에서 영구적으로 삭제됩니다.`;
    requestConfirm('시점 데이터 복구', msg, async () => {
      closeConfirmDialog();
      try {
        const fullLogs = calId === selectedCalId ? selectedCalAllActivityLogs : await fetchActivityLogsFromFirestore(calId);
        const restoredCal = rebuildCalendarToTimestamp(cal, log.timestamp, fullLogs);
        const now = Date.now();

        // Save rolled-back calendar
        const calSaved = await pushSingleCloudCalendar(restoredCal, now, 18, null, 'restore');
        if (!calSaved) {
          showAdminToast('데이터 복구 실패', 'error');
          return;
        }

        // Delete messages sent after log.timestamp
        const messages = messagesMap[calId] || [];
        const messagesToDelete = messages.filter(m => m.timestamp > log.timestamp);
        for (const mToDelete of messagesToDelete) {
          if (firebaseDb) {
            await firebaseDb.collection('calendars').doc(`cal_${calId}`).collection('messages').doc(mToDelete.id).delete();
          } else {
            await deleteMessageRest(calId, mToDelete.id);
          }
        }

        // Delete activity log entries recorded after log.timestamp, matching the message cleanup above
        await deleteActivityLogsAfterTimestamp(calId, fullLogs, log.timestamp);

        // Sync local state
        setServerCalendars(prev => prev.map(c => c.id === calId ? restoredCal : c));
        setMessagesMap(prev => ({
          ...prev,
          [calId]: (prev[calId] || []).filter(m => m.timestamp <= log.timestamp)
        }));
        setSelectedCalActivityLogs(prev => prev.filter(l => getActivityLogStamp(l) <= log.timestamp));

        showAdminToast('시점 복구완료', 'success');
      } catch (err) {
        console.error('Unified PITR failed:', err);
        showAdminToast('복구 오류', 'error');
      }
    });
  };

  // Message deletion from Admin Page
  const performDeleteMessage = async (calId, msg) => {
    closeConfirmDialog();
    try {
      let ok = false;
      if (firebaseDb) {
        await firebaseDb.collection('calendars').doc(`cal_${calId}`).collection('messages').doc(msg.id).delete();
        ok = true;
      } else {
        ok = await deleteMessageRest(calId, msg.id);
      }
      if (ok) {
        deleteAllChatImagesFromStorage(msg);
        showAdminToast('삭제완료', 'success');
        setMessagesMap(prev => ({
          ...prev,
          [calId]: (prev[calId] || []).filter(m => m.id !== msg.id)
        }));
      } else {
        showAdminToast('삭제 실패', 'error');
      }
    } catch (e) {
      console.error(e);
      showAdminToast('삭제 실패', 'error');
    }
  };

  const handleDeleteMessageDirect = (calId, msg) => {
    const txt = `[${calId}] 다음 채팅을 삭제하시겠습니까? "${msg.text || '[사진]'}"`;
    requestConfirm('채팅 삭제', txt, () => performDeleteMessage(calId, msg));
  };

  // Calculations for Tab 1
  const dashboard = React.useMemo(() => buildAdminDashboardMetrics(calendarsList), [calendarsList]);
  const adminUpdatedText = loadedAt ? loadedAt.toLocaleString('ko-KR') : '불러오는 중';

  // Merge messages across all calendars for Tab 1 feed
  const allMergedMessages = Object.entries(messagesMap).flatMap(([calId, list]) =>
    list.map(m => ({ ...m, calId }))
  ).sort((a, b) => b.timestamp - a.timestamp);

  const filteredMessages = allMergedMessages.filter(msg => {
    if (selectedCalId && msg.calId !== selectedCalId) return false;
    const cal = serverCalendars.find(c => c.id === msg.calId);
    const pMap = (cal?.participants || []).reduce((acc, p) => { acc[p.id] = p; return acc; }, {});
    const p = pMap[msg.participantId];
    const author = p?.name || '알수없음';
    const query = chatSearchQuery.toLowerCase();
    return author.toLowerCase().includes(query) || (msg.text || '').toLowerCase().includes(query);
  });

  const selectedCal = serverCalendars.find(c => c.id === selectedCalId);

  // Union of the activityLogs subcollection (source of truth going forward) with any legacy
  // embedded calendar.activityLogs still present for calendars that haven't self-healed yet.
  const selectedCalAllActivityLogs = React.useMemo(() => {
    const byId = new Map();
    getCalendarActivityLogs(selectedCal).forEach(log => { if (log?.id) byId.set(log.id, log); });
    (selectedCalActivityLogs || []).forEach(log => { if (log?.id) byId.set(log.id, log); });
    return Array.from(byId.values());
  }, [selectedCal, selectedCalActivityLogs]);

  // Build Unified chronological timeline logs for Tab 3 (Recovery)
  const unifiedTimeline = React.useMemo(() => {
    if (!selectedCal) return [];

    // 1. Calendar / Poll Activity Logs
    const calLogs = [...selectedCalAllActivityLogs].map(l => ({
      id: l.id,
      type: 'activity',
      action: l.action,
      timestamp: l.timestamp,
      participantId: l.participantId,
      date: l.date,
      note: l.note || (l.date ? formatShortDateWithDayName(l.date) : ''),
      raw: l
    }));

    // 2. Chat / Comment Logs
    const chatLogs = (messagesMap[selectedCalId] || []).map(m => ({
      id: m.id,
      type: 'chat',
      action: 'chat_send',
      timestamp: m.timestamp,
      participantId: m.participantId,
      note: m.text || '[사진 첨부됨]',
      raw: m
    }));

    // Sort chronologically descending
    return [...calLogs, ...chatLogs].sort((a, b) => b.timestamp - a.timestamp);
  }, [selectedCal, selectedCalAllActivityLogs, messagesMap[selectedCalId]]);

  // Filtered timeline based on user inputs
  const filteredTimeline = React.useMemo(() => {
    return unifiedTimeline.filter(log => {
      // 1. Type Filter
      if (timelineTypeFilter !== 'all' && log.type !== timelineTypeFilter) {
        return false;
      }

      // 2. Date Range Filter
      if (timelineStartDate) {
        const startMs = new Date(timelineStartDate + 'T00:00:00').getTime();
        if (log.timestamp < startMs) return false;
      }
      if (timelineEndDate) {
        const endMs = new Date(timelineEndDate + 'T23:59:59').getTime();
        if (log.timestamp > endMs) return false;
      }

      // 3. Keyword Search
      if (timelineSearchQuery.trim()) {
        const query = timelineSearchQuery.toLowerCase().trim();
        
        // Find participant name
        const pMap = (selectedCal?.participants || []).reduce((acc, p) => { acc[p.id] = p; return acc; }, {});
        const p = pMap[log.participantId] || {
          name: log.type === 'chat' ? '메시지' :
                EXPENSE_ACTIVITY_ACTIONS.includes(log.action) && !log.participantId ? '정산' :
                IMAGE_TAG_ACTIVITY_ACTIONS.includes(log.action) && !log.participantId ? '태그' :
                POLL_ACTIVITY_ACTIONS.includes(log.action) && !log.participantId ? '투표' :
                PLACE_ACTIVITY_ACTIONS.includes(log.action) && !log.participantId ? '장소' :
                MEETING_ACTIVITY_ACTIONS.includes(log.action) && !log.participantId ? '정산' : '알수없음'
        };
        const participantName = (p.name || '').toLowerCase();
        const note = (log.note || '').toLowerCase();
        
        const actLabel = log.type === 'chat' ? '채팅 전송' :
                         {
                           create: '일정 등록', update: '일정 수정', delete: '일정 삭제',
                           poll_create: '투표 생성', poll_vote: '투표 진행', poll_cancel: '투표 취소',
                           expense_create: '지출/수입 등록', expense_update: '지출/수입 수정', expense_delete: '지출/수입 삭제',
                           tag_add: '사진 태그 추가', tag_remove: '사진 태그 삭제',
                           meeting_confirm: '모임 확정', meeting_cancel: '모임 확정 취소',
                           memo_create: '메모 추가', memo_update: '메모 변경', memo_delete: '메모 삭제',
                           place_create: '장소 등록', place_update: '장소 수정', place_delete: '장소 삭제'
                         }[log.action] || '활동';
        const actionText = actLabel.toLowerCase();

        if (!participantName.includes(query) && !note.includes(query) && !actionText.includes(query)) {
          return false;
        }
      }

      return true;
    });
  }, [unifiedTimeline, timelineTypeFilter, timelineStartDate, timelineEndDate, timelineSearchQuery, selectedCal]);

  React.useEffect(() => {
    try {
      sessionStorage.removeItem('gather_admin_collapsed_sections_v1');
    } catch (e) {}
  }, []);

  // Each collapsible section's header/action element carries an explicit data-collapse-anchor
  // marker (set directly in its JSX below) instead of being located by matching its title text
  // against a known-titles list -- the old text-matching approach picked up the WRONG element
  // whenever a section's own body text happened to contain another section's title as a
  // substring (e.g. the 타임라인 복구 warning banner's copy mentions "채팅 로그", so the button
  // ended up attached to the banner instead of the actual title). The explicit marker also lets
  // the toggle button be anchored inside a small nested group (e.g. next to the 채팅 로그 search
  // input) rather than always the section's own first direct child.
  React.useEffect(() => {
    const root = document.querySelector('.admin-scope');
    if (!root) return;

    const storageKey = 'gather_admin_collapsed_sections_v2';
    let storage = null;
    try {
      storage = typeof window !== 'undefined' && window.sessionStorage ? window.sessionStorage : null;
    } catch (e) {
      storage = null;
    }
    const readCollapsed = () => {
      if (!storage) return {};
      try {
        return JSON.parse(storage.getItem(storageKey) || '{}');
      } catch (e) {
        return {};
      }
    };
    const writeCollapsed = value => {
      if (!storage) return;
      try {
        storage.setItem(storageKey, JSON.stringify(value));
      } catch (e) {}
    };
    const makeToggleButton = label => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'section-toggle-btn admin-section-toggle-btn';
      button.setAttribute('aria-label', `${label} 접기/펼치기`);
      button.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path stroke="none" d="M0 0h24v24H0z" fill="none"></path><path d="M6 9l6 6l6 -6"></path></svg>';
      return button;
    };

    const applyAnchor = anchor => {
      const section = anchor.closest('section');
      const collapseKey = anchor.dataset.collapseKey;
      if (!section || !collapseKey) return;

      // The anchor may be nested a level or two inside the section (e.g. the small
      // input+arrow group in 채팅 로그) -- walk up to the section's own direct child so we
      // know which sibling(s) to hide when collapsed.
      let headerRow = anchor;
      while (headerRow.parentElement && headerRow.parentElement !== section) {
        headerRow = headerRow.parentElement;
      }
      if (headerRow.parentElement !== section) return;

      const sectionKey = `${activeTab}:${selectedCalId || 'all'}:${collapseKey}`;
      section.classList.add('admin-collapsible-section');
      section.dataset.adminCollapseKey = sectionKey;
      headerRow.classList.add('admin-collapsible-header');

      let button = anchor.querySelector(':scope > .admin-section-toggle-btn');
      if (!button) {
        button = makeToggleButton(anchor.dataset.collapseLabel || collapseKey);
        anchor.appendChild(button);
      }

      const directChildren = Array.from(section.children);
      const sync = () => {
        const collapsed = !!readCollapsed()[sectionKey];
        section.classList.toggle('admin-section-collapsed', collapsed);
        button.classList.toggle('is-collapsed', collapsed);
        button.setAttribute('aria-expanded', String(!collapsed));
        directChildren.forEach(child => {
          if (child !== headerRow) child.hidden = collapsed;
        });
      };

      button.onclick = event => {
        event.preventDefault();
        event.stopPropagation();
        const next = readCollapsed();
        next[sectionKey] = !next[sectionKey];
        writeCollapsed(next);
        sync();
      };
      sync();
    };

    const frame = requestAnimationFrame(() => {
      Array.from(root.querySelectorAll('[data-collapse-anchor]')).forEach(applyAnchor);
    });
    return () => cancelAnimationFrame(frame);
  }, [
    activeTab,
    selectedCalId,
    calendarsList.length,
    dashboard.totalSchedules,
    dashboard.totalPolls,
    filteredMessages.length,
    unifiedTimeline.length,
    isRestoreMode
  ]);

  // =====================================================================
  // Supabase Design System Palette (Light)
  // =====================================================================
  const styles = {
    dashboard: {
      color: '#0F172A',
      minHeight: '100vh',
      fontFamily: 'Inter, sans-serif',
      width: '100%',
      maxWidth: '100%',
      overflowX: 'hidden'
    },
    content: {
      padding: '10px 0px',
      width: '100%',
      maxWidth: '100%',
      overflowX: 'hidden'
    },
    topBar: {
      backgroundColor: '#FFFFFF',
      borderBottom: '1px solid #E2E8F0',
      // Body keeps the requested 24px admin padding; the top bar absorbs that
      // safe area with its own white background so the header never shows a gray strip.
      margin: '-24px 0 0',
      paddingTop: '24px',
      boxSizing: 'border-box',
      maxWidth: '100%',
      overflowX: 'hidden'
    },
    header: {
      padding: '20px 16px'
    },
    title: {
      fontSize: '1.35rem',
      fontWeight: '800',
      color: '#0F172A',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    desc: {
      fontSize: '0.82rem',
      color: '#64748B',
      marginTop: '4px'
    },
    tabBar: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
      gap: 0,
      borderTop: '1px solid #E2E8F0',
      padding: '6px 12px 0 12px',
      minWidth: 0
    },
    tabButton: (isActive) => ({
      padding: '12px 16px',
      fontSize: '0.88rem',
      fontWeight: 'bold',
      whiteSpace: 'nowrap',
      minWidth: 0,
      width: '100%',
      border: 'none',
      background: 'none',
      color: isActive ? '#059669' : '#64748B',
      borderBottom: isActive ? '3px solid #059669' : '3px solid transparent',
      backgroundColor: isActive ? '#ECFDF5' : 'transparent',
      borderRadius: '6px 6px 0 0',
      cursor: 'pointer',
      outline: 'none',
      transition: 'all 0.2s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px'
    }),
    card: {
      backgroundColor: '#FFFFFF',
      border: 'none',
      borderRadius: 0,
      padding: '14px 24px 24px',
      boxShadow: 'rgba(0, 0, 0, 0.05) 0px 2px 4px'
    },
    cardTitle: {
      fontSize: '0.96rem',
      fontWeight: '800',
      color: '#0F172A',
      margin: '0 0 16px 0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '8px',
      borderBottom: '1px solid #E2E8F0',
      paddingBottom: '10px'
    },
    metricValue: {
      fontSize: '1.6rem',
      fontWeight: '900',
      color: '#0F172A',
      marginTop: '0'
    }
  };

  // Peekalink free-plan usage this hour -- surfaced as a 데이터 사용량 card below (alongside
  // Firestore/GitHub Pages quotas) rather than its own gauge in 외부 서비스 연동 현황, so every
  // external-limit number lives in one place. The stored bucket only reflects the CURRENT hour
  // if it matches now -- an older bucket means no calls have happened yet this hour, so usage
  // reads as 0 rather than a stale prior count.
  const peekalinkCurrentBucket = Math.floor(Date.now() / PEEKALINK_HOUR_BUCKET_MS);
  const peekalinkHourlyUsage = (linkPreviewStats && linkPreviewStats.hourlyUsageBucket === peekalinkCurrentBucket)
    ? (linkPreviewStats.hourlyUsageCount || 0) : 0;
  const peekalinkUsagePercent = Math.min(100, Math.round(peekalinkHourlyUsage / PEEKALINK_FREE_HOURLY_LIMIT * 100));
  const peekalinkRemaining = Math.max(0, PEEKALINK_FREE_HOURLY_LIMIT - peekalinkHourlyUsage);

  // 일정 데이터의 5000건 캡은 캘린더 1개 문서당 개별 적용 (전체 합산이 아님) -- 가장 사용량이
  // 많은 캘린더를 기준으로 하나의 카드에 요약해서 보여주고, 캘린더별 세부 수치는 아래
  // "캘린더별 세부 통계"에서 확인 가능.
  const worstAvailabilityStat = dashboard.calendarStats.reduce((worst, stat) => {
    const count = Array.isArray(stat.calendar.availabilities) ? stat.calendar.availabilities.length : 0;
    return (!worst || count > worst.count) ? { stat, count } : worst;
  }, null);
  const worstAvailabilityCount = worstAvailabilityStat ? worstAvailabilityStat.count : 0;
  const worstAvailabilityLabel = worstAvailabilityStat ? (worstAvailabilityStat.stat.calendar.title || worstAvailabilityStat.stat.calendar.id) : '';

  // Kakao Local (지도 검색) daily usage -- Kakao's exact free-quota ceiling isn't hardcoded here
  // (it depends on the connected Kakao Developers app's own plan/quota settings, which can change
  // independently of this code), so this card shows the raw call count only and points to the
  // 카카오 콘솔 쿼터 메뉴 for the actual limit rather than risking a stale/wrong number giving a
  // false sense of safety margin.
  // Must match the +9h KST offset incrementKakaoLocalSearchStat uses server-side (functions/
  // index.js), or this card would show "0건" for several hours around KST midnight even right
  // after a real search -- toISOString() alone is UTC regardless of the browser's local timezone.
  const kakaoTodayBucket = new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const kakaoDailyUsage = (kakaoSearchStats && kakaoSearchStats.dailyUsageBucket === kakaoTodayBucket)
    ? (kakaoSearchStats.dailyUsageCount || 0) : 0;

  // Google Places (해외 장소 검색 폴백, 카카오 검색이 0건일 때만 호출) monthly usage -- unlike
  // Kakao this is a genuinely paid API past its free SKU threshold, so this card exists mainly as
  // an early-warning signal rather than a hard limit display (the real number lives in Google
  // Cloud 콘솔's billing view, which can change independently of this code).
  const googlePlacesThisMonthBucket = new Date().toISOString().slice(0, 7);
  const googlePlacesMonthlyUsage = (googlePlacesStats && googlePlacesStats.monthlyUsageBucket === googlePlacesThisMonthBucket)
    ? (googlePlacesStats.monthlyUsageCount || 0) : 0;

  const fullServiceUsage = [
    ...dashboard.serviceUsage,
    {
      label: 'Peekalink API (이번 시간)',
      used: `${peekalinkHourlyUsage}건`,
      limit: `${PEEKALINK_FREE_HOURLY_LIMIT}건/시간`,
      remaining: `${peekalinkRemaining}건 (매 정시 초기화)`,
      percent: peekalinkUsagePercent,
      note: '무료 요금제는 누적 소진이 아닌 시간당 rate limit이며, 캐시 응답은 집계에서 제외'
    },
    {
      label: '카카오맵 지도 검색 (오늘)',
      used: `${kakaoDailyUsage}건`,
      limit: '카카오 콘솔에서 확인',
      remaining: '자정(UTC) 초기화',
      percent: null,
      note: '정확한 무료 한도는 카카오 개발자 콘솔 → 해당 앱 → 쿼터 메뉴에서 확인해 주세요. 성공/실패 요청 모두 집계됩니다.'
    },
    {
      label: '구글 장소 검색 (이번 달, 해외 장소 폴백)',
      used: `${googlePlacesMonthlyUsage}건`,
      limit: '유료 API - Google Cloud 콘솔에서 확인',
      remaining: '매월 1일 초기화',
      percent: null,
      note: '카카오 검색이 0건일 때만 호출되는 해외 장소 폴백입니다. 월 무료 호출 한도를 넘으면 과금되니, 정확한 한도/비용은 Google Cloud 콘솔 → Places API 청구 내역에서 확인해 주세요.'
    },
    {
      label: '일정 데이터 (5,000건 캡)',
      used: worstAvailabilityStat ? `${worstAvailabilityCount.toLocaleString()}건 (${worstAvailabilityLabel})` : '0건',
      limit: '5,000건/캘린더',
      remaining: `${Math.max(0, 5000 - worstAvailabilityCount).toLocaleString()}건`,
      percent: Math.min(100, Math.round(worstAvailabilityCount / 5000 * 100)),
      note: '전체 합산이 아닌 캘린더 1개당 개별 적용되는 캡이며, 가장 사용량이 많은 캘린더 기준 (세부 수치는 캘린더별 세부 통계 참고)'
    }
  ];

  if (unifiedSearchQuery !== null) {
    return /*#__PURE__*/React.createElement(AdminUnifiedSearchResultsView, {
      query: unifiedSearchQuery,
      calendarsList: calendarsList,
      messagesMap: messagesMap,
      memosMap: memosMap,
      calFilter: unifiedSearchCalFilter,
      dateStart: unifiedSearchDateStart,
      dateEnd: unifiedSearchDateEnd,
      onCalFilterChange: setUnifiedSearchCalFilter,
      onDateStartChange: setUnifiedSearchDateStart,
      onDateEndChange: setUnifiedSearchDateEnd,
      onBack: () => setUnifiedSearchQuery(null)
    });
  }

  return /*#__PURE__*/React.createElement("div", {
    className: "admin-scope",
    style: styles.dashboard
  },
    /* Toast Alert */
    toast && /*#__PURE__*/React.createElement("div", {
      className: "toast",
      style: {
        position: 'fixed', bottom: '32px', left: '50%', transform: 'translateX(-50%)', zIndex: 99999,
        backgroundColor: toast.type === 'error' ? '#EF4444' : '#3ECF8E', color: toast.type === 'error' ? '#FFFFFF' : '#000000',
        padding: '12px 24px', borderRadius: '12px', fontSize: '0.88rem', fontWeight: 'bold', boxShadow: '0 10px 25px -5px rgba(15,23,42,0.35)',
        textAlign: 'center', wordBreak: 'break-all', whiteSpace: 'pre-wrap', maxWidth: '380px', width: '90%', boxSizing: 'border-box'
      }
    }, toast.message),

    /* Header + Tabs, attached into one flush top bar (no outer box/margin, like the main
       app's fixed header + .main-menu-bar underneath it) */
    /*#__PURE__*/React.createElement("div", { className: "admin-top-bar", style: styles.topBar },
      /*#__PURE__*/React.createElement("header", {
        className: "admin-header",
        style: styles.header
      },
        /*#__PURE__*/React.createElement("div", { className: "admin-header-title" },
          /*#__PURE__*/React.createElement("div", { style: styles.title },
            "모여라 캘린더 ",
            /*#__PURE__*/React.createElement("span", {
              style: {
                fontSize: '0.68rem', fontWeight: 800, padding: '3px 10px', borderRadius: 'var(--radius-full)',
                backgroundColor: '#0F172A', color: '#FFFFFF', letterSpacing: '0.02em'
              }
            }, "Admin")
          )
        ),
        /*#__PURE__*/React.createElement("div", { className: "admin-auth-actions" },
          /*#__PURE__*/React.createElement("button", {
            type: "button",
            className: "admin-menu-toggle-btn",
            title: "통합검색",
            "aria-label": "통합검색",
            onClick: () => setIsUnifiedSearchOpen(true)
          }, /*#__PURE__*/React.createElement(SearchIcon, null)),
          /*#__PURE__*/React.createElement("button", {
            type: "button",
            className: "admin-menu-toggle-btn",
            title: isAdminMenuOpen ? "메뉴 닫기" : "메뉴 열기",
            "aria-label": isAdminMenuOpen ? "메뉴 닫기" : "메뉴 열기",
            "aria-expanded": isAdminMenuOpen,
            onClick: () => setIsAdminMenuOpen(prev => !prev)
          }, isAdminMenuOpen ? /*#__PURE__*/React.createElement(SmallXIcon, { size: 24 }) : /*#__PURE__*/React.createElement(AdminFilledMenuIcon, null))
        ),
        /*#__PURE__*/React.createElement("div", { className: "admin-header-actions" },
            /*#__PURE__*/React.createElement("button", {
              type: "button",
              className: "form-select admin-calendar-picker-btn",
              style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', cursor: 'pointer', textAlign: 'left', flex: '1 1 auto', minWidth: 0 },
              onClick: () => setIsHeaderCalPickerOpen(true)
            },
              /*#__PURE__*/React.createElement("span", { style: { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } },
                selectedCal ? `${selectedCal.title} (${selectedCal.id})` : '캘린더 선택'
              ),
              /*#__PURE__*/React.createElement("svg", {
                xmlns: "http://www.w3.org/2000/svg", width: "18", height: "18", viewBox: "0 0 24 24",
                fill: "none", stroke: "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round",
                className: "icon icon-tabler icons-tabler-outline icon-tabler-chevron-down", style: { flexShrink: 0, color: '#94A3B8' }
              }, /*#__PURE__*/React.createElement("path", { stroke: "none", d: "M0 0h24v24H0z", fill: "none" }),
                 /*#__PURE__*/React.createElement("path", { d: "M6 9l6 6l6 -6" }))
            ),
            isHeaderCalPickerOpen && /*#__PURE__*/React.createElement("div", {
              className: "bottom-sheet-overlay",
              onClick: () => setIsHeaderCalPickerOpen(false)
            },
              /*#__PURE__*/React.createElement("div", {
                className: "bottom-sheet",
                onClick: e => e.stopPropagation()
              },
                /*#__PURE__*/React.createElement("div", { className: "bottom-sheet-header" },
                  /*#__PURE__*/React.createElement("h4", null, "캘린더 선택"),
                  /*#__PURE__*/React.createElement("button", {
                    type: "button",
                    style: { background: 'none', border: 'none', color: '#64748B', fontSize: '1.2rem', cursor: 'pointer' },
                    onClick: () => setIsHeaderCalPickerOpen(false)
                  }, "✕")
                ),
                /*#__PURE__*/React.createElement("div", { className: "bottom-sheet-body" },
                  calendarsList.map(cal => /*#__PURE__*/React.createElement("button", {
                    key: cal.id,
                    type: "button",
                    className: "bottom-sheet-item",
                    onClick: () => { selectAdminCalendar(cal.id, 'replace'); setIsHeaderCalPickerOpen(false); }
                  }, `${cal.title} (${cal.id})`))
                )
              )
            ),
            /*#__PURE__*/React.createElement("button", {
              type: "button", className: "btn btn-secondary admin-header-action-btn",
              title: "새 창으로 캘린더 열기",
              disabled: !selectedCalId,
              style: { width: '44px', height: '44px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '10px', flexShrink: 0 },
              onClick: () => { if (selectedCalId) window.open(`${window.location.pathname}?id=${selectedCalId}`, '_blank', 'noopener,noreferrer'); }
            }, /*#__PURE__*/React.createElement(ExternalLinkIcon, null))
        )
      ),

      /* Tabs Bar */
      /*#__PURE__*/React.createElement("div", {
        className: "admin-tab-bar",
        style: styles.tabBar
      },
        /* Tab 1 button */
        /*#__PURE__*/React.createElement("button", {
          type: "button", className: "admin-tab-button", onClick: () => setActiveTab('settings'),
          style: styles.tabButton(activeTab === 'settings')
        }, /*#__PURE__*/React.createElement("span", { className: "admin-tab-icon" }, /*#__PURE__*/React.createElement(SettingsIcon, null)), "일반"),
        /* Tab 2 button */
        /*#__PURE__*/React.createElement("button", {
          type: "button", className: "admin-tab-button", onClick: () => setActiveTab('metrics'),
          style: styles.tabButton(activeTab === 'metrics')
        }, /*#__PURE__*/React.createElement("span", { className: "admin-tab-icon" }, /*#__PURE__*/React.createElement(ChartBarIcon, null)), "통계"),
        /* Tab 3 button */
        /*#__PURE__*/React.createElement("button", {
          type: "button", className: "admin-tab-button", onClick: () => setActiveTab('logs'),
          style: styles.tabButton(activeTab === 'logs')
        }, /*#__PURE__*/React.createElement("span", { className: "admin-tab-icon" }, /*#__PURE__*/React.createElement(ChatSectionIcon, null)), "채팅"),
        /* Tab 4 button */
        /*#__PURE__*/React.createElement("button", {
          type: "button", className: "admin-tab-button", onClick: () => setActiveTab('recovery'),
          style: styles.tabButton(activeTab === 'recovery')
        }, /*#__PURE__*/React.createElement("span", { className: "admin-tab-icon" }, /*#__PURE__*/React.createElement(HourglassIcon, null)), "로그")
      )
    ),

    isAdminMenuOpen && /*#__PURE__*/React.createElement("div", {
      className: "admin-side-menu-overlay",
      onClick: () => setIsAdminMenuOpen(false)
    },
      /*#__PURE__*/React.createElement("nav", {
        className: "admin-side-menu",
        "aria-label": "관리자 메뉴",
        onClick: e => e.stopPropagation()
      },
        /*#__PURE__*/React.createElement("div", { className: "admin-side-menu-header" },
          /*#__PURE__*/React.createElement("div", { className: "admin-side-menu-brand" },
            /*#__PURE__*/React.createElement("div", { className: "admin-side-menu-logo", "aria-hidden": "true" }, "⚙"),
            /*#__PURE__*/React.createElement("div", { className: "admin-side-menu-copy" },
              /*#__PURE__*/React.createElement("div", { className: "admin-side-menu-title" }, "관리자 메뉴"),
              /*#__PURE__*/React.createElement("div", { className: "admin-side-menu-subtitle" }, "Calendar admin")
            )
          ),
          /*#__PURE__*/React.createElement("button", {
            type: "button",
            className: "admin-side-menu-close-btn",
            title: "메뉴 닫기",
            "aria-label": "메뉴 닫기",
            onClick: () => setIsAdminMenuOpen(false)
          }, /*#__PURE__*/React.createElement(SmallXIcon, { size: 20 }))
        ),
        /*#__PURE__*/React.createElement("div", { className: "admin-side-menu-list" },
          /*#__PURE__*/React.createElement("button", {
            type: "button",
            className: "admin-side-menu-item",
            onClick: () => {
              setIsAdminMenuOpen(false);
              refreshServerCalendars();
              showAdminToast('새로고침 중...', 'success', 1500);
            }
          },
            /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-icon" }, /*#__PURE__*/React.createElement(RefreshIcon, null)),
            /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-copy" },
              /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-title" }, "새로고침"),
              /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-desc" }, `마지막 업데이트: ${adminUpdatedText}`)
            )
          ),
          /*#__PURE__*/React.createElement("button", {
            type: "button",
            className: "admin-side-menu-item",
            onClick: () => {
              setIsAdminMenuOpen(false);
              resetChangePwForm();
              setIsChangePwOpen(true);
            }
          },
            /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-icon" }, /*#__PURE__*/React.createElement(LockIcon, null)),
            /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-copy" },
              /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-title" }, "비밀번호 변경"),
              /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-desc" }, "관리자 인증 정보를 수정")
            )
          ),
          /*#__PURE__*/React.createElement("button", {
            type: "button",
            className: "admin-side-menu-item",
            onClick: () => {
              setIsAdminMenuOpen(false);
              handleLogoutAdmin();
            }
          },
            /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-icon" }, /*#__PURE__*/React.createElement(LogoutIcon, null)),
            /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-copy" },
              /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-title" }, "로그아웃"),
              /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-desc" }, "관리자 모드 종료")
            )
          )
        )
      )
    ),

    /* Content area (tab bar's own padding above keeps this off the flush top bar) */
    /*#__PURE__*/React.createElement("div", { style: styles.content },

    /* Admin password change modal */
    isChangePwOpen && /*#__PURE__*/React.createElement("div", {
      className: "modal-overlay",
      onClick: () => { setIsChangePwOpen(false); resetChangePwForm(); },
      style: { zIndex: 11000 }
    },
      /*#__PURE__*/React.createElement("form", {
        onSubmit: handleChangePassword,
        onClick: e => e.stopPropagation(),
        className: "modal-container",
        style: { maxWidth: '340px', padding: '20px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '12px' }
      },
        /*#__PURE__*/React.createElement("h3", { style: { fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '6px' } }, /*#__PURE__*/React.createElement(LockIcon, null), "관리자 비밀번호 변경"),
        /*#__PURE__*/React.createElement("input", {
          type: "password", className: "form-input", style: { width: '100%' }, autoFocus: true, placeholder: "현재 비밀번호",
          value: currentPwInput, onChange: e => setCurrentPwInput(e.target.value)
        }),
        /*#__PURE__*/React.createElement("input", {
          type: "password", className: "form-input", style: { width: '100%' }, placeholder: "새 비밀번호 (6자 이상)",
          value: newPwInput, onChange: e => setNewPwInput(e.target.value)
        }),
        /*#__PURE__*/React.createElement("input", {
          type: "password", className: "form-input", style: { width: '100%' }, placeholder: "새 비밀번호 확인",
          value: confirmPwInput, onChange: e => setConfirmPwInput(e.target.value)
        }),
        pwError && /*#__PURE__*/React.createElement("div", { style: { color: '#DC2626', fontSize: '0.8rem' } }, pwError),
        /*#__PURE__*/React.createElement("div", { style: { display: 'flex', gap: '8px', marginTop: '4px' } },
          /*#__PURE__*/React.createElement("button", {
            type: "button", className: "btn btn-secondary", style: { flex: 1 },
            onClick: () => { setIsChangePwOpen(false); resetChangePwForm(); }
          }, "취소"),
          /*#__PURE__*/React.createElement("button", {
            type: "submit", className: "btn btn-primary", style: { flex: 1 }, disabled: isPwSubmitting
          }, isPwSubmitting ? '변경 중...' : '변경하기')
        )
      )
    ),

    /* Main Content Area */
    error && /*#__PURE__*/React.createElement("div", {
      style: { color: '#EF4444', border: '1px solid #EF4444', backgroundColor: '#1A0B0B', marginBottom: '18px', padding: '14px', borderRadius: '8px', fontSize: '0.88rem', fontWeight: 'bold' }
    }, error),
    isAdminListLoading && !error && /*#__PURE__*/React.createElement("div", {
      style: { color: '#64748B', border: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-primary)', marginBottom: '18px', padding: '14px', borderRadius: '8px', fontSize: '0.88rem', fontWeight: 700 }
    }, "관리자 캘린더 목록을 불러오는 중…"),

    /* ================================================================= */
    /* TAB 1: OPERATIONAL METRICS & CHAT LOGS                            */
    /* ================================================================= */
    activeTab === 'metrics' && /*#__PURE__*/React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: '10px' } },
      /* Core metrics stat-box grid: each drillable box shows its own always-visible kkot/cw
         donut instead of expanding a shared detail row on click, since every box's donut uses
         the same calendar legend anyway -- that legend now lives once in the section title. */
      /*#__PURE__*/React.createElement("section", { style: styles.card },
        /*#__PURE__*/React.createElement("div", { style: styles.cardTitle, "data-collapse-anchor": "true", "data-collapse-key": "metrics-core", "data-collapse-label": "핵심 운영 지표" },
          /*#__PURE__*/React.createElement("span", { style: { display: 'flex', alignItems: 'center', gap: '6px' } }, /*#__PURE__*/React.createElement(ChartPieIcon, null), "핵심 운영 지표", /*#__PURE__*/React.createElement(SectionCountBadge, { count: calendarsList.length })),

        ),
        /*#__PURE__*/React.createElement("div", { className: "admin-metrics-grid" },
          [
            { key: 'participants', label: '총 참여자', val: dashboard.totalParticipants, perCal: stat => stat.participants.length, unit: '명' },
            { key: 'schedules', label: '총 일정 수', val: dashboard.totalSchedules, perCal: stat => stat.schedules.length, unit: '건' },
            { key: 'dates', label: '등록 날짜 수', val: dashboard.uniqueDateCount, perCal: stat => stat.dateCount, unit: '일' },
            { key: 'upcoming', label: '예정 일정 수', val: dashboard.upcomingCount, perCal: stat => stat.upcomingCount, unit: '건' },
            { key: 'memo', label: '메모 일정 수', val: dashboard.memoCount, perCal: stat => stat.memoCount, unit: '건' },
            { key: 'confirmed', label: '확정 모임 수', val: dashboard.totalConfirmedMeetings, perCal: stat => stat.confirmedCount, unit: '건' },
            { key: 'chatMessages', label: '총 채팅 메시지', val: dashboard.calendarStats.reduce((sum, stat) => sum + (adminMsgTotal[stat.calendar.id] != null ? adminMsgTotal[stat.calendar.id] : (messagesMap[stat.calendar.id] || []).length), 0), perCal: stat => (adminMsgTotal[stat.calendar.id] != null ? adminMsgTotal[stat.calendar.id] : (messagesMap[stat.calendar.id] || []).length), unit: '건' },
            { key: 'polls', label: '총 투표 수', val: dashboard.totalPolls, perCal: stat => stat.pollCount, unit: '건' },
            { key: 'pollVotes', label: '총 투표자 수', val: dashboard.totalPollVotes, perCal: stat => stat.pollVoteCount, unit: '명' }
          ].map(box => {
            const perCalValues = box.perCal ? dashboard.calendarStats.map((stat, i) => ({
              id: stat.calendar.id, title: stat.calendar.title || stat.calendar.id, value: box.perCal(stat), color: getCalendarAccentColor(stat.calendar, i)
            })) : [];
            return /*#__PURE__*/React.createElement("div", {
              key: box.key,
              className: "admin-metric-card"
            },
              box.perCal && /*#__PURE__*/React.createElement(DonutChart, {
                segments: perCalValues.map(item => ({ label: item.title, value: item.value, color: item.color, unit: box.unit })),
                size: 40, strokeWidth: 8
              }),
              /*#__PURE__*/React.createElement("div", { style: { fontSize: '0.78rem', color: '#64748B', fontWeight: 'bold' } }, box.label),
              /*#__PURE__*/React.createElement("div", { style: styles.metricValue }, box.val)
            );
          })
        )
      ),

      /* External service integration status -- service-wide (통합관리), not per-calendar.
         Surfaces the Peekalink link-preview dependency's shared cache size and the client-side
         API key exposure risk, per the admin transparency requirement for external services. */
      /*#__PURE__*/React.createElement("section", { style: styles.card },
        /*#__PURE__*/React.createElement("div", { style: styles.cardTitle, "data-collapse-anchor": "true", "data-collapse-key": "metrics-external-services", "data-collapse-label": "외부 서비스 연동 현황" },
          /*#__PURE__*/React.createElement("span", { style: { display: 'flex', alignItems: 'center', gap: '6px' } }, /*#__PURE__*/React.createElement(ExternalLinkIcon, null), "외부 서비스 연동 현황")
        ),
        /*#__PURE__*/React.createElement("div", { style: { border: '1px solid #E2E8F0', borderRadius: '10px', padding: '14px', backgroundColor: '#F8FAFC' } },
          /*#__PURE__*/React.createElement("div", { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' } },
            /*#__PURE__*/React.createElement("div", { style: { fontSize: '0.9rem', fontWeight: 'bold', color: '#0F172A' } }, "Peekalink (링크 미리보기 / OpenGraph)"),
            /*#__PURE__*/React.createElement("span", { style: { fontSize: '0.7rem', padding: '2px 8px', borderRadius: 'var(--radius-full)', backgroundColor: '#DCFCE7', color: '#16A34A', fontWeight: 'bold' } }, "통합 캐시 사용 중")
          ),
          /*#__PURE__*/React.createElement("div", { style: { fontSize: '0.8rem', color: '#64748B', marginTop: '8px', lineHeight: 1.6 } },
            "채팅/메모/정산에서 붙여넣은 링크의 제목·설명·이미지를 가져오는 데 사용됩니다. 이제 캘린더별로 각각 요청하지 않고, URL당 한 번만 조회한 뒤 결과를 ",
            /*#__PURE__*/React.createElement("strong", null, "모든 캘린더가 공유하는 서버 캐시"),
            "(Firestore linkPreviews 컬렉션)에 저장해 재사용합니다."
          ),
          /*#__PURE__*/React.createElement("div", { style: { display: 'flex', gap: '16px', marginTop: '12px', flexWrap: 'wrap' } },
            /*#__PURE__*/React.createElement("div", null,
              /*#__PURE__*/React.createElement("div", { style: { fontSize: '0.72rem', color: '#94A3B8', fontWeight: 700 } }, "누적 캐시된 링크 수(추정)"),
              /*#__PURE__*/React.createElement("div", { style: { fontSize: '1.3rem', fontWeight: 900, color: '#0F172A' } },
                linkPreviewStats ? `${linkPreviewStats.cachedCount || 0}건` : '—'
              )
            ),
            /*#__PURE__*/React.createElement("div", null,
              /*#__PURE__*/React.createElement("div", { style: { fontSize: '0.72rem', color: '#94A3B8', fontWeight: 700 } }, "최근 갱신"),
              /*#__PURE__*/React.createElement("div", { style: { fontSize: '0.85rem', color: '#334155', marginTop: '4px' } },
                linkPreviewStats && linkPreviewStats.updatedAt ? new Date(linkPreviewStats.updatedAt).toLocaleString('ko-KR') : '아직 없음'
              )
            )
          ),
          /*#__PURE__*/React.createElement("div", { style: { display: 'flex', alignItems: 'flex-start', gap: '8px', marginTop: '14px', padding: '10px', borderRadius: '8px', backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0' } },
            /*#__PURE__*/React.createElement(ShieldCheckIcon, null),
            /*#__PURE__*/React.createElement("div", { style: { fontSize: '0.78rem', color: '#166534', lineHeight: 1.6 } },
              /*#__PURE__*/React.createElement("strong", null, "API 키 보호: "),
              "이 서비스는 백엔드가 없는 정적 사이트라 Peekalink API 키가 브라우저 소스에 그대로 노출되는 문제가 있었습니다. 이제는 Cloud Function 프록시(peekalinkProxy)를 통해서만 Peekalink를 호출하도록 변경되어, 키는 서버(Functions 코드)에만 존재하고 브라우저에는 전혀 전송되지 않습니다. 무료 요금제 사용량(시간당 한도)은 아래 ",
              /*#__PURE__*/React.createElement("strong", null, "데이터 사용량"),
              " 섹션에서 확인할 수 있습니다."
            )
          )
        )
      ),

      /* Calendar-by-calendar detail cards */
      /*#__PURE__*/React.createElement("section", { style: styles.card },
        /*#__PURE__*/React.createElement("div", { style: styles.cardTitle, "data-collapse-anchor": "true", "data-collapse-key": "metrics-detail", "data-collapse-label": "캘린더별 세부 통계" },
          /*#__PURE__*/React.createElement("span", { style: { display: 'flex', alignItems: 'center', gap: '6px' } }, /*#__PURE__*/React.createElement(ChartBarIcon, null), "캘린더별 세부 통계")
        ),
        dashboard.calendarStats.length === 0 ? /*#__PURE__*/React.createElement("div", { style: { color: '#64748B', fontSize: '0.9rem' } }, "표시할 캘린더가 없습니다.") :
        /*#__PURE__*/React.createElement("div", { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(320px, 100%), 1fr))', gap: '10px' } },
          dashboard.calendarStats.map(stat => {
            const cal = stat.calendar;
            const width = `${Math.max(4, Math.round(stat.schedules.length / dashboard.maxSchedules * 100))}%`;
            // Raw array length (including soft-deleted tombstones getActiveAvailabilities
            // filters out) since that's what actually counts against the 5000 cap enforced by
            // validateCalendarShape()/firestore.rules -- stat.schedules.length alone would
            // undercount and mask a calendar quietly approaching the limit.
            const availabilityCount = Array.isArray(cal.availabilities) ? cal.availabilities.length : 0;
            const availabilityCapPercent = Math.min(100, Math.round(availabilityCount / 5000 * 100));
            const availabilityCapColor = availabilityCapPercent >= 90 ? '#DC2626' : availabilityCapPercent >= 60 ? '#D97706' : '#94A3B8';
            return /*#__PURE__*/React.createElement("div", {
              key: cal.id, style: { border: '1px solid #E2E8F0', borderRadius: '10px', padding: '16px', backgroundColor: '#F8FAFC' }
            },
              /*#__PURE__*/React.createElement("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: '8px' } },
                /*#__PURE__*/React.createElement("div", { style: { fontSize: '0.92rem', fontWeight: 'bold', color: '#0F172A' } }, cal.title || cal.id),
                /*#__PURE__*/React.createElement("div", { style: { fontSize: '0.76rem', color: '#64748B', fontWeight: 500 } }, cal.id)
              ),
              /*#__PURE__*/React.createElement("div", {
                style: { display: 'flex', flexWrap: 'wrap', gap: '6px', margin: '12px 0' }
              },
                [[stat.participants.length, '명'], [stat.schedules.length, '건'], [stat.dateCount, '일'], [`투표 ${stat.pollCount}`, '건']].map(([val, unit]) => /*#__PURE__*/React.createElement("span", {
                  key: unit + val, style: { fontSize: '0.7rem', padding: '2px 8px', borderRadius: '4px', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', color: '#0F172A' }
                }, val, unit))
              ),
              /* 일정 등록 비중: 가장 일정이 많은 캘린더를 100% 기준으로 비교합니다. */
              /*#__PURE__*/React.createElement("div", {
                style: { display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '8px', fontSize: '0.68rem', color: '#94A3B8', fontWeight: 700, marginTop: '4px' }
              },
                /*#__PURE__*/React.createElement("span", null, "등록 일정 비교 (최다 기준)"),
                /*#__PURE__*/React.createElement("span", null, `${stat.schedules.length.toLocaleString()}건 / 최다 캘린더 ${dashboard.maxSchedules.toLocaleString()}건`)
              ),
              /*#__PURE__*/React.createElement("div", {
                style: { width: '100%', height: '6px', borderRadius: '999px', backgroundColor: '#E2E8F0', overflow: 'hidden', marginTop: '4px' }
              },
                /*#__PURE__*/React.createElement("div", { style: { width, height: '100%', backgroundColor: '#3ECF8E' } })
              ),
              /* Participants flow list */
              /*#__PURE__*/React.createElement("div", {
                style: { display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '12px' }
              },
                stat.participants.slice(0, 10).map(p => /*#__PURE__*/React.createElement("span", {
                  key: p.id, style: { backgroundColor: p.color, color: getContrastTextColor(p.color), padding: '2px 8px', borderRadius: 'var(--radius-full)', fontSize: '0.68rem', fontWeight: 'bold' }
                }, p.name))
              ),
              /* 일정 데이터 5000건 캡 사용량 -- 캘린더 문서별로 독립적으로 적용됨 (전체 합산이 아님) */
              /*#__PURE__*/React.createElement("div", { style: { marginTop: '12px' } },
                /*#__PURE__*/React.createElement("div", { style: { display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', fontSize: '0.68rem', color: '#94A3B8', fontWeight: 700 } },
                  React.createElement("span", null, "일정 데이터 사용량"),
                  React.createElement("span", { style: { color: availabilityCapColor, fontWeight: 800 } }, `${availabilityCount.toLocaleString()} / 5,000건 (${availabilityCapPercent}%)`)
                ),
                /*#__PURE__*/React.createElement("div", {
                  style: { width: '100%', height: '4px', borderRadius: '999px', backgroundColor: '#E2E8F0', overflow: 'hidden', marginTop: '4px' }
                },
                  /*#__PURE__*/React.createElement("div", { style: { width: `${Math.max(2, availabilityCapPercent)}%`, height: '100%', backgroundColor: availabilityCapColor } })
                )
              )
            );
          })
        )
      ),

      /* Popular Dates & Registrations splits */
      /*#__PURE__*/React.createElement("div", { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(320px, 100%), 1fr))', gap: '10px' } },
        /* Popular Dates Card */
        /*#__PURE__*/React.createElement("section", { style: styles.card },
          /*#__PURE__*/React.createElement("div", { style: styles.cardTitle, "data-collapse-anchor": "true", "data-collapse-key": "metrics-top-dates", "data-collapse-label": "날짜별 가능 인원 Top" },
            /*#__PURE__*/React.createElement("span", { style: { display: 'flex', alignItems: 'center', gap: '6px' } }, /*#__PURE__*/React.createElement(TrophyIcon, null), "날짜별 가능 인원 Top")
          ),
          dashboard.calendarStats.map(stat => /*#__PURE__*/React.createElement("div", { key: `${stat.calendar.id}_popular`, style: { marginBottom: '14px' } },
            /*#__PURE__*/React.createElement("div", { style: { fontWeight: 950, marginBottom: '6px', color: '#0F172A', fontSize: '0.86rem' } }, stat.calendar.id, " (전원 가능 ", stat.fullDates.length, "일)"),
            stat.popularDates.length === 0 ? /*#__PURE__*/React.createElement("div", { style: { color: '#64748B', fontSize: '0.8rem' } }, "등록된 날짜가 없습니다.") :
            stat.popularDates.slice(0, 3).map(item => /*#__PURE__*/React.createElement("div", {
              key: `${stat.calendar.id}_${item.date}`,
              style: {
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', width: '100%',
                padding: '6px 10px', marginBottom: '4px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 'var(--radius-md)', color: '#0F172A'
              }
            },
              /*#__PURE__*/React.createElement("div", { className: "date-item-left", style: { width: 'auto', minWidth: 0 } },
                /*#__PURE__*/React.createElement("strong", { style: { fontSize: '0.78rem', color: '#0F172A' } }, formatDateWithDayName(item.date)),
                /*#__PURE__*/React.createElement("span", { style: { fontSize: '0.75rem', marginLeft: '6px', color: '#64748B' } }, item.count, "/", stat.participants.length, "명 가능")
              ),
              item.count >= stat.participants.length ? /*#__PURE__*/React.createElement("span", { className: "date-item-badge", style: { background: '#DCFCE7', color: '#16A34A', fontSize: '0.7rem', border: '1px solid #86EFAC' } }, "전원") :
              /*#__PURE__*/React.createElement("span", { className: "date-item-badge", style: { fontSize: '0.7rem', backgroundColor: '#F1F5F9', color: '#64748B' } }, item.count, "명")
            ))
          ))
        ),

        /* Participant entry details -- the page itself scrolls, so this doesn't need its own
           scrollbox; each calendar's group gets an accent-colored rail + pill label (instead of
           plain bold text) so adjacent calendars are visually easy to tell apart. */
        /*#__PURE__*/React.createElement("section", { style: { ...styles.card, display: 'flex', flexDirection: 'column' } },
          /*#__PURE__*/React.createElement("div", { style: styles.cardTitle, "data-collapse-anchor": "true", "data-collapse-key": "metrics-participants", "data-collapse-label": "참여자별 일정 등록수 / 참석률" },
            /*#__PURE__*/React.createElement("span", { style: { display: 'flex', alignItems: 'center', gap: '6px' } }, /*#__PURE__*/React.createElement(PodiumIcon, null), "참여자별 일정 등록수 / 참석률")
          ),
          /*#__PURE__*/React.createElement("div", null,
            dashboard.calendarStats.map((stat, i) => {
              const accent = getCalendarAccentColor(stat.calendar, i);
              return /*#__PURE__*/React.createElement("div", {
                key: `${stat.calendar.id}_parts_list`,
                style: { marginBottom: '16px', paddingLeft: '10px', borderLeft: `3px solid ${accent}` }
              },
              /*#__PURE__*/React.createElement("span", {
                style: { display: 'inline-block', fontWeight: 900, marginBottom: '8px', color: accent, fontSize: '0.8rem', backgroundColor: `${accent}1A`, padding: '2px 10px', borderRadius: 'var(--radius-full)' }
              }, stat.calendar.id),
              stat.participantStats.map(participant => {
                const pct = `${Math.max(4, Math.round(participant.count / Math.max(1, stat.schedules.length) * 100))}%`;
                // 참석률: 이 캘린더에 등록된 전체 날짜(dateCount, 등록자 상관없이 유니크 날짜 수) 중
                // 이 참여자가 응답한 날짜의 비율 -- 위 pct(전체 등록 건수 중 이 사람 몫)와는 다른 지표라
                // 별도 뱃지로 병기. 등록된 날짜가 아직 없는 캘린더는 0%로 표시.
                const attendanceRate = stat.dateCount > 0 ? Math.round(participant.count / stat.dateCount * 100) : 0;
                return /*#__PURE__*/React.createElement("div", { key: participant.id, style: { marginBottom: '6px' } },
                  /*#__PURE__*/React.createElement("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', fontWeight: 800 } },
                    /*#__PURE__*/React.createElement("span", null, participant.name),
                    /*#__PURE__*/React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '6px' } },
                      /*#__PURE__*/React.createElement("span", { style: { color: '#64748B' } }, participant.count, "건"),
                      /*#__PURE__*/React.createElement("span", {
                        style: { fontSize: '0.68rem', fontWeight: 700, padding: '1px 7px', borderRadius: 'var(--radius-full)', backgroundColor: '#EEF2FF', color: '#4338CA' }
                      }, "참석률 ", attendanceRate, "%")
                    )
                  ),
                  /*#__PURE__*/React.createElement("div", { style: { width: '100%', height: '5px', borderRadius: '999px', background: '#E2E8F0', overflow: 'hidden', marginTop: '2px', border: '1px solid #E2E8F0' } },
                    /*#__PURE__*/React.createElement("div", { style: { width: pct, height: '100%', background: participant.color || '#64748B' } })
                  )
                );
              })
              );
            })
          )
        )
      ),

      /* Quota Limit rules */
      /*#__PURE__*/React.createElement("section", { style: styles.card },
        /*#__PURE__*/React.createElement("div", { style: styles.cardTitle, "data-collapse-anchor": "true", "data-collapse-key": "metrics-quota", "data-collapse-label": "데이터 사용량" },
          /*#__PURE__*/React.createElement("span", { style: { display: 'flex', alignItems: 'center', gap: '6px' } }, /*#__PURE__*/React.createElement(CloudDataConnectionIcon, null), "데이터 사용량")
        ),
        /*#__PURE__*/React.createElement("div", { className: "admin-quota-grid" },
          fullServiceUsage.map(item => /*#__PURE__*/React.createElement("div", { key: item.label, className: "admin-quota-card" },
            /*#__PURE__*/React.createElement("div", { className: "admin-quota-label" }, item.label),
            /*#__PURE__*/React.createElement("div", { className: "admin-quota-value" }, item.used, " / ", item.limit),
            item.percent != null && /*#__PURE__*/React.createElement("div", { className: "admin-progress" },
              /*#__PURE__*/React.createElement("div", { className: "admin-progress-fill", style: { width: `${Math.max(2, Math.min(100, item.percent))}%`, background: item.percent >= 75 ? '#F59E0B' : '#3ECF8E' } })
            ),
            /*#__PURE__*/React.createElement("div", { className: "admin-quota-note" }, "잔여: ", item.remaining, /*#__PURE__*/React.createElement("br", null), item.note)
          ))
        )
      )
    ),

    /* ================================================================= */
    /* TAB 2: CALENDARS & POLLS SETTINGS                                 */
    /* ================================================================= */
    activeTab === 'settings' && /*#__PURE__*/React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: '10px' } },
      selectedCal ? /*#__PURE__*/React.createElement(React.Fragment, null,
        /* Profile & Participants settings card */
        /*#__PURE__*/React.createElement("section", { style: styles.card },
          /*#__PURE__*/React.createElement("h4", { style: { ...styles.cardTitle, display: 'flex', alignItems: 'center', gap: '10px' }, "data-collapse-anchor": "true", "data-collapse-key": "settings-calendar", "data-collapse-label": "캘린더 설정" },
            /*#__PURE__*/React.createElement("span", { style: { display: 'flex', alignItems: 'center', gap: '6px', flex: '1 1 auto', minWidth: 0 } }, /*#__PURE__*/React.createElement(CalendarCogIcon, null), "캘린더 설정"),
            /*#__PURE__*/React.createElement("span", { style: { display: 'inline-flex', alignItems: 'center', gap: '8px', marginLeft: 'auto', flexShrink: 0 } },
            /*#__PURE__*/React.createElement("button", {
              type: "button", className: "btn btn-poll-create",
              onClick: handleCreateNewCalendarFromAdmin
            }, "+ 새 캘린더")
            )
          ),

          /* Title input */
          /*#__PURE__*/React.createElement("div", { style: { marginBottom: '12px' } },
            /*#__PURE__*/React.createElement("label", { style: { display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#64748B', marginBottom: '4px' } }, "캘린더 제목"),
            /*#__PURE__*/React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '8px' } },
              /*#__PURE__*/React.createElement(ColorSwatchPicker, {
                value: calAccentColor || '#64748B',
                onChange: setCalAccentColor,
                title: "캘린더 색상"
              }),
              /*#__PURE__*/React.createElement("input", {
                type: "text", className: "form-input", style: { flex: 1, minWidth: 0 }, value: calTitle,
                onChange: e => setCalTitle(e.target.value), placeholder: "캘린더 제목"
              })
            )
          ),

          /* Description input */
          /*#__PURE__*/React.createElement("div", { style: { marginBottom: '16px' } },
            /*#__PURE__*/React.createElement("label", { style: { display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#64748B', marginBottom: '4px' } }, "캘린더 설명"),
            /*#__PURE__*/React.createElement("input", {
              type: "text", className: "form-input", style: { width: '100%' }, value: calDesc,
              onChange: e => setCalDesc(e.target.value), placeholder: "캘린더 설명"
            })
          ),

          /* Participant Management */
          /*#__PURE__*/React.createElement("div", { style: { paddingTop: '14px' } },
            /*#__PURE__*/React.createElement("label", { style: { display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#64748B', marginBottom: '8px' } }, `참여자 리스트 설정 (${calParticipants.filter(p => !isTombstone(p)).length}명)`),

            /* Add Row */
            /*#__PURE__*/React.createElement("div", { style: { display: 'flex', gap: '8px', marginBottom: '12px' } },
              /*#__PURE__*/React.createElement("input", {
                type: "text", className: "form-input", style: { flex: 1, minWidth: 0 }, placeholder: "추가할 참여자 이름", value: newPartName,
                ref: newPartNameRef, onChange: e => setNewPartName(e.target.value),
                onKeyDown: e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (e.nativeEvent && e.nativeEvent.isComposing) return;
                    handleAddPart();
                  }
                }
              }),
              /*#__PURE__*/React.createElement("button", {
                type: "button", className: "btn btn-poll-create", style: { height: '44px', whiteSpace: 'nowrap' }, onClick: handleAddPart
              }, "추가")
            ),

            /* Participants List grid */
            /*#__PURE__*/React.createElement("div", { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(220px, 100%), 1fr))', gap: '8px' } },
              calParticipants.map(p => isTombstone(p) ? null : /*#__PURE__*/React.createElement("div", {
                key: p.id,
                style: { display: 'flex', alignItems: 'center', gap: '8px' }
              },
                /* Color picker */
                /*#__PURE__*/React.createElement(ColorSwatchPicker, {
                  value: p.color,
                  onChange: color => handleUpdatePart(p.id, { color }),
                  title: "참여자 색상"
                }),
                /* Name input */
                /*#__PURE__*/React.createElement("input", {
                  type: "text", className: "form-input", style: { flex: 1, minWidth: 0, height: '44px', fontSize: '0.82rem' }, value: p.name,
                  onChange: e => handleUpdatePart(p.id, { name: e.target.value })
                }),
                /* Remove trigger */
                /*#__PURE__*/React.createElement("button", {
                  type: "button", className: "btn btn-danger", style: { padding: '4px 10px', height: '44px', display: 'flex', alignItems: 'center' },
                  onClick: () => requestConfirm('참여자 삭제', `"${p.name}" 참여자를 삭제하시겠습니까?`, () => handleUpdatePart(p.id, { removedAt: Date.now() }))
                }, /*#__PURE__*/React.createElement(SmallXIcon, { size: 16 }))
              ))
	            )
	          ),

	          /* Settlement Management */
	          /*#__PURE__*/React.createElement("div", { style: { paddingTop: '14px', marginTop: '14px', borderTop: '1px solid #E2E8F0' } },
	            /*#__PURE__*/React.createElement("label", { style: { display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#64748B', marginBottom: '8px' } }, "정산 설정"),
	            /*#__PURE__*/React.createElement("div", { style: { display: 'flex', gap: '8px', marginBottom: '10px' } },
	              /*#__PURE__*/React.createElement("input", {
	                type: "text",
	                className: "form-input",
	                style: { flex: 1, minWidth: 0 },
	                placeholder: "새 지출 카테고리",
	                value: newExpenseCategoryName,
	                maxLength: 24,
	                onChange: e => setNewExpenseCategoryName(e.target.value),
	                onKeyDown: e => {
	                  if (e.key === 'Enter') {
	                    e.preventDefault();
	                    if (e.nativeEvent && e.nativeEvent.isComposing) return;
	                    handleAddExpenseCategory();
	                  }
	                }
	              }),
	              /*#__PURE__*/React.createElement("button", {
	                type: "button",
	                className: "btn btn-poll-create",
	                style: { height: '44px', whiteSpace: 'nowrap' },
	                onClick: handleAddExpenseCategory
	              }, "추가")
	            ),
	            /*#__PURE__*/React.createElement("div", { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(220px, 100%), 1fr))', gap: '8px' } },
	              calExpenseCategories.map(category => /*#__PURE__*/React.createElement("div", {
	                key: category.id,
	                style: { display: 'flex', alignItems: 'center', gap: '8px' }
	              },
	                /*#__PURE__*/React.createElement(ColorSwatchPicker, {
	                  value: category.color,
	                  onChange: color => handleUpdateExpenseCategory(category.id, { color }),
	                  title: "지출 카테고리 색상"
	                }),
	                /*#__PURE__*/React.createElement("input", {
	                  type: "text",
	                  className: "form-input",
	                  style: { flex: 1, minWidth: 0, height: '44px', fontSize: '0.82rem' },
	                  value: category.name,
	                  maxLength: 24,
	                  onChange: e => handleUpdateExpenseCategory(category.id, { name: e.target.value })
	                }),
	                /*#__PURE__*/React.createElement("button", {
	                  type: "button",
	                  className: "btn btn-danger",
	                  style: { padding: '4px 10px', height: '44px', display: 'flex', alignItems: 'center' },
	                  onClick: () => handleRemoveExpenseCategory(category.id)
	                }, /*#__PURE__*/React.createElement(SmallXIcon, { size: 16 }))
	              ))
	            )
	          ),

	          /* Place Category Management */
	          /*#__PURE__*/React.createElement("div", { style: { paddingTop: '14px', marginTop: '14px', borderTop: '1px solid #E2E8F0' } },
	            /*#__PURE__*/React.createElement("label", { style: { display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#64748B', marginBottom: '8px' } }, "장소 카테고리 설정"),
	            /*#__PURE__*/React.createElement("div", { style: { display: 'flex', gap: '8px', marginBottom: '10px' } },
	              /*#__PURE__*/React.createElement("input", {
	                type: "text",
	                className: "form-input",
	                style: { flex: 1, minWidth: 0 },
	                placeholder: "새 장소 카테고리",
	                value: newPlaceCategoryName,
	                maxLength: 24,
	                onChange: e => setNewPlaceCategoryName(e.target.value),
	                onKeyDown: e => {
	                  if (e.key === 'Enter') {
	                    e.preventDefault();
	                    if (e.nativeEvent && e.nativeEvent.isComposing) return;
	                    handleAddPlaceCategory();
	                  }
	                }
	              }),
	              /*#__PURE__*/React.createElement("button", {
	                type: "button",
	                className: "btn btn-poll-create",
	                style: { height: '44px', whiteSpace: 'nowrap' },
	                onClick: handleAddPlaceCategory
	              }, "추가")
	            ),
	            /*#__PURE__*/React.createElement("div", { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(220px, 100%), 1fr))', gap: '8px' } },
	              calPlaceCategories.map(category => /*#__PURE__*/React.createElement("div", {
	                key: category.id,
	                style: { display: 'flex', alignItems: 'center', gap: '8px' }
	              },
	                /*#__PURE__*/React.createElement(ColorSwatchPicker, {
	                  value: category.color,
	                  onChange: color => handleUpdatePlaceCategory(category.id, { color }),
	                  title: "장소 카테고리 색상"
	                }),
	                /*#__PURE__*/React.createElement("input", {
	                  type: "text",
	                  className: "form-input",
	                  style: { flex: 1, minWidth: 0, height: '44px', fontSize: '0.82rem' },
	                  value: category.name,
	                  maxLength: 24,
	                  onChange: e => handleUpdatePlaceCategory(category.id, { name: e.target.value })
	                }),
	                /*#__PURE__*/React.createElement("button", {
	                  type: "button",
	                  className: "btn btn-danger",
	                  style: { padding: '4px 10px', height: '44px', display: 'flex', alignItems: 'center' },
	                  onClick: () => handleRemovePlaceCategory(category.id)
	                }, /*#__PURE__*/React.createElement(SmallXIcon, { size: 16 }))
	              ))
	            )
	          ),

	          /* Submit settings button */
	          /*#__PURE__*/React.createElement("button", {
            type: "button", className: "btn btn-primary", style: { width: '100%', height: '44px', justifyContent: 'center', marginTop: '20px' },
            onClick: handleSaveCalendarSettings
          }, "설정 저장")
        ),

        /* Polls management card */
        /*#__PURE__*/React.createElement("section", { style: styles.card },
          /* Header */
          /*#__PURE__*/React.createElement("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '14px', borderBottom: '1px solid #E2E8F0', paddingBottom: '8px' }, "data-collapse-anchor": "true", "data-collapse-key": "settings-polls", "data-collapse-label": "투표 설정" },
            /*#__PURE__*/React.createElement("h4", { style: { fontSize: '0.96rem', fontWeight: '900', color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', flex: '1 1 auto', minWidth: 0 } }, /*#__PURE__*/React.createElement(PollSectionIcon, null), "투표 설정"),
            /*#__PURE__*/React.createElement("span", { style: { display: 'inline-flex', alignItems: 'center', gap: '8px', marginLeft: 'auto', flexShrink: 0 } },
            /*#__PURE__*/React.createElement("button", {
              type: "button", className: "btn btn-poll-create",
              onClick: () => { setEditingPoll(null); setEditingPollCalId(selectedCalId); setIsPollModalOpen(true); }
            }, "+ 새 투표")
            )
          ),

          /* Polls List */
          /*#__PURE__*/React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: '8px' } },
            getCalendarPolls(selectedCal).length === 0 ? /*#__PURE__*/React.createElement("div", { style: { padding: '16px', color: '#64748B', fontSize: '0.8rem', textAlign: 'center' } }, "등록된 투표가 없습니다. 우측 상단 버튼으로 투표를 등록해 주세요.") :
            getCalendarPolls(selectedCal).map(poll => /*#__PURE__*/React.createElement("div", {
              key: poll.id,
              className: "admin-poll-row"
            },
              /* Left */
              /*#__PURE__*/React.createElement("div", { className: "admin-poll-row-main" },
                /*#__PURE__*/React.createElement("span", { className: "admin-poll-row-title", style: { fontSize: '0.86rem', fontWeight: 'bold', color: '#0F172A' } }, poll.title),
                /*#__PURE__*/React.createElement("span", { className: "admin-poll-row-meta", style: { fontSize: '0.72rem', color: '#64748B' } }, `${getActivePollOptions(poll).length}개 선택 항목 · 총 ${getPollTotalVoteCount(poll)}표${poll.deadline ? ` · 마감 ${formatPollDeadline(poll.deadline)}${isPollClosed(poll) ? ' (마감됨)' : ''}` : ''}`)
              ),
              /* Right */
              /*#__PURE__*/React.createElement("div", { className: "admin-poll-row-actions" },
                /* Edit */
                /*#__PURE__*/React.createElement("button", {
                  type: "button", className: "btn btn-secondary", style: { padding: '4px 10px', fontSize: '0.75rem' },
                  onClick: () => { setEditingPoll(poll); setEditingPollCalId(selectedCalId); setIsPollModalOpen(true); }
                }, "수정"),
                /* Delete */
                /*#__PURE__*/React.createElement("button", {
                  type: "button", className: "btn btn-danger", title: "삭제", style: { padding: '4px 10px', fontSize: '0.75rem' },
                  onClick: () => handleDeletePollFromAdminPage(selectedCalId, poll)
                }, "삭제")
              )
            ))
          )
        )
      ) : null
    ),

    /* ================================================================= */
    /* TAB 3: POINT-IN-TIME RECOVERY & BACKUPS                           */
    /* ================================================================= */
    activeTab === 'recovery' && /*#__PURE__*/React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: '10px' } },
      selectedCal ? /*#__PURE__*/React.createElement(React.Fragment, null,
        /* Timeline log restore card (Combined schedules, polls and chat logs!) */
        /*#__PURE__*/React.createElement("section", { className: "recovery-timeline-card", style: styles.card },
          /* Warning banner */
          /*#__PURE__*/React.createElement("div", {
            style: { backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: '8px', padding: '12px 14px', color: '#B91C1C', fontSize: '0.8rem', lineHeight: '1.5', marginBottom: '16px' }
          },
            /*#__PURE__*/React.createElement("span", { style: { fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '4px', verticalAlign: 'middle' } }, /*#__PURE__*/React.createElement(AlertTriangleIcon, null), "통합 시점 복구 경고: "),
            "캘린더의 일정, 투표 기록 뿐만 아니라 해당 캘린더에 전송된 채팅 로그를 포함하는 복구 타임라인입니다. 복구 지점 이후 변경된 데이터 롤백 및 시간 외 전송 메시지는 DB에서 실시간 삭제 처리됩니다."
          ),

          /* Title */
          /*#__PURE__*/React.createElement("h4", { style: styles.cardTitle, "data-collapse-anchor": "true", "data-collapse-key": "recovery-timeline", "data-collapse-label": "타임라인 복구" },
            /*#__PURE__*/React.createElement("span", { style: { display: 'flex', alignItems: 'center', gap: '6px' } }, /*#__PURE__*/React.createElement(HourglassIcon, null), `타임라인 복구 (${filteredTimeline.length}건 / 전체 ${unifiedTimeline.length}건)`)
          ),

          /* Filter controls for Timeline */
          /*#__PURE__*/React.createElement("div", {
            style: {
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: '10px',
              marginBottom: '12px',
              padding: '12px',
              backgroundColor: '#F1F5F9',
              borderRadius: '8px',
              border: '1px solid #E2E8F0'
            }
          },
            /* Keyword Search */
            /*#__PURE__*/React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: '4px' } },
              /*#__PURE__*/React.createElement("span", { style: { fontSize: '0.72rem', fontWeight: 'bold', color: '#475569' } }, "검색어 (이름, 내용, 활동)"),
              /*#__PURE__*/React.createElement("input", {
                type: "text",
                className: "form-input",
                placeholder: "검색어 입력...",
                value: timelineSearchQuery,
                onChange: e => { setTimelineSearchQuery(e.target.value); setTimelineLimit(100); },
                style: { fontSize: '0.8rem', padding: '6px 10px', height: '34px', minHeight: '34px' }
              })
            ),
            /* Type Filter (All / Activity / Chat) */
            /*#__PURE__*/React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: '4px' } },
              /*#__PURE__*/React.createElement("span", { style: { fontSize: '0.72rem', fontWeight: 'bold', color: '#475569' } }, "로그 구분"),
              /*#__PURE__*/React.createElement("select", {
                className: "form-select",
                value: timelineTypeFilter,
                onChange: e => { setTimelineTypeFilter(e.target.value); setTimelineLimit(100); },
                style: { fontSize: '0.8rem', padding: '6px 10px', height: '34px', minHeight: '34px' }
              },
                /*#__PURE__*/React.createElement("option", { value: "all" }, "전체 로그"),
                /*#__PURE__*/React.createElement("option", { value: "activity" }, "활동 로그만"),
                /*#__PURE__*/React.createElement("option", { value: "chat" }, "채팅 로그만")
              )
            ),
            /* Date range (Start Date) */
            /*#__PURE__*/React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: '4px' } },
              /*#__PURE__*/React.createElement("span", { style: { fontSize: '0.72rem', fontWeight: 'bold', color: '#475569' } }, "시작일"),
              /*#__PURE__*/React.createElement("input", {
                type: "date",
                className: "form-input",
                value: timelineStartDate,
                onChange: e => { setTimelineStartDate(e.target.value); setTimelineLimit(100); },
                style: { fontSize: '0.8rem', padding: '6px 10px', height: '34px', minHeight: '34px' }
              })
            ),
            /* Date range (End Date) */
            /*#__PURE__*/React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: '4px' } },
              /*#__PURE__*/React.createElement("span", { style: { fontSize: '0.72rem', fontWeight: 'bold', color: '#475569' } }, "종료일"),
              /*#__PURE__*/React.createElement("input", {
                type: "date",
                className: "form-input",
                value: timelineEndDate,
                onChange: e => { setTimelineEndDate(e.target.value); setTimelineLimit(100); },
                style: { fontSize: '0.8rem', padding: '6px 10px', height: '34px', minHeight: '34px' }
              })
            )
          ),

          /* Log list -- the page itself scrolls, so this doesn't need its own scrollbox */
          /*#__PURE__*/React.createElement("div", {
            style: { border: '1px solid #E2E8F0', borderRadius: '8px', padding: '8px', backgroundColor: '#F8FAFC' }
          },
            filteredTimeline.length === 0 ?
            /*#__PURE__*/React.createElement("div", { style: { padding: '30px', color: '#64748B', fontSize: '0.82rem', textAlign: 'center' } }, "조건에 맞는 타임라인 로그가 존재하지 않습니다.") :
            /*#__PURE__*/React.createElement(React.Fragment, null,
              filteredTimeline.slice(0, timelineLimit).map(log => {
                const pMap = (selectedCal.participants || []).reduce((acc, p) => { acc[p.id] = p; return acc; }, {});
                const p = pMap[log.participantId] || {
                  name: log.type === 'chat' ? '메시지' :
                        EXPENSE_ACTIVITY_ACTIONS.includes(log.action) && !log.participantId ? '정산' :
                        IMAGE_TAG_ACTIVITY_ACTIONS.includes(log.action) && !log.participantId ? '태그' :
                        POLL_ACTIVITY_ACTIONS.includes(log.action) && !log.participantId ? '투표' :
                        PLACE_ACTIVITY_ACTIONS.includes(log.action) && !log.participantId ? '장소' :
                        MEETING_ACTIVITY_ACTIONS.includes(log.action) && !log.participantId ? '정산' : '알수없음',
                  color: '#94A3B8'
                };

                const actLabel = log.type === 'chat' ? '채팅 전송' :
                                 {
                                   create: '일정 등록', update: '일정 수정', delete: '일정 삭제',
                                   poll_create: '투표 생성', poll_vote: '투표 진행', poll_cancel: '투표 취소',
                                   expense_create: '지출/수입 등록', expense_update: '지출/수입 수정', expense_delete: '지출/수입 삭제',
                                   tag_add: '사진 태그 추가', tag_remove: '사진 태그 삭제',
                                   meeting_confirm: '모임 확정', meeting_cancel: '모임 확정 취소',
                                   memo_create: '메모 추가', memo_update: '메모 변경', memo_delete: '메모 삭제',
                                   place_create: '장소 등록', place_update: '장소 수정', place_delete: '장소 삭제'
                                 }[log.action] || '활동';

                const badgeBg = log.type === 'chat' ? '#E0F2FE' :
                                {
                                  create: '#DCFCE7', update: '#DBEAFE', delete: '#FEE2E2',
                                  poll_create: '#F3E8FF', poll_vote: '#FCE7F3', poll_cancel: '#FFEDD5',
                                  expense_create: '#FEF3C7', expense_update: '#FEF3C7', expense_delete: '#FFEDD5',
                                  tag_add: '#E0E7FF', tag_remove: '#FEE2E2',
                                  meeting_confirm: '#F3E8FF', meeting_cancel: '#FEE2E2',
                                  memo_create: '#E0E7FF', memo_update: '#FEF3C7', memo_delete: '#FEE2E2',
                                  place_create: '#DCFCE7', place_update: '#DBEAFE', place_delete: '#FEE2E2'
                                }[log.action] || '#F1F5F9';

                const badgeColor = log.type === 'chat' ? '#0369A1' :
                                   {
                                     create: '#15803D', update: '#1D4ED8', delete: '#B91C1C',
                                     poll_create: '#7E22CE', poll_vote: '#BE185D', poll_cancel: '#C2410C',
                                     expense_create: '#B45309', expense_update: '#B45309', expense_delete: '#C2410C',
                                     tag_add: '#4338CA', tag_remove: '#B91C1C',
                                     meeting_confirm: '#7E22CE', meeting_cancel: '#B91C1C',
                                     memo_create: '#4338CA', memo_update: '#B45309', memo_delete: '#B91C1C',
                                     place_create: '#15803D', place_update: '#1D4ED8', place_delete: '#B91C1C'
                                   }[log.action] || '#64748B';

                return /*#__PURE__*/React.createElement("div", {
                  key: log.id,
                  className: "admin-chat-row"
                },
                  /* Left: action + participant badges + date */
                  /*#__PURE__*/React.createElement("div", { className: "admin-chat-header", style: { display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' } },
                    /*#__PURE__*/React.createElement("span", {
                      style: { fontSize: '0.68rem', fontWeight: 'bold', padding: '2px 6px', borderRadius: '4px', backgroundColor: badgeBg, color: badgeColor, border: `1px solid ${badgeColor}30`, whiteSpace: 'nowrap' }
                    }, actLabel),
                    /*#__PURE__*/React.createElement("span", {
                      style: { backgroundColor: p.color, color: getContrastTextColor(p.color), padding: '2px 8px', borderRadius: 'var(--radius-full)', fontSize: '0.7rem', fontWeight: 'bold', whiteSpace: 'nowrap' }
                    }, p.name),
                    log.date && /*#__PURE__*/React.createElement("span", {
                      style: { fontSize: '0.8rem', fontWeight: 'bold', color: '#475569' }
                    }, formatShortDateWithDayName(log.date))
                  ),

                  /* Middle: memo, ellipsized on wide screens like admin-chat-text, wraps on narrow */
                  log.note && log.note !== (log.date ? formatShortDateWithDayName(log.date) : '') && /*#__PURE__*/React.createElement("span", { className: "admin-chat-text", title: log.note || '' }, log.note || ''),

                  /* Right: timestamp + restore button -- the button drops to its own full-width
                     row on mobile (recovery-restore-footer) rather than squeezing onto the
                     timestamp's line like the shared admin-chat-footer layout normally does. */
                  /*#__PURE__*/React.createElement("div", { className: "admin-chat-footer recovery-restore-footer" },
                    /*#__PURE__*/React.createElement("span", { style: { fontSize: '0.72rem', color: '#64748B', fontWeight: '500', whiteSpace: 'nowrap' } }, formatRegisteredAt(log.timestamp)),
                    /*#__PURE__*/React.createElement("button", {
                      type: "button", className: "btn btn-secondary recovery-restore-btn", style: { fontSize: '0.76rem', padding: '4px 10px', whiteSpace: 'nowrap' },
                      onClick: () => handleRestoreToLogTimestamp(selectedCalId, log)
                    }, "이 시점으로 복구")
                  )
                );
              }),
              filteredTimeline.length > timelineLimit && /*#__PURE__*/React.createElement("div", {
                style: { display: 'flex', justifyContent: 'center', marginTop: '12px', paddingBottom: '4px' }
              },
                /*#__PURE__*/React.createElement("button", {
                  type: "button",
                  className: "btn btn-secondary",
                  onClick: () => setTimelineLimit(prev => prev + 100),
                  style: {
                    width: '100%',
                    fontSize: '0.8rem',
                    padding: '8px 16px',
                    backgroundColor: '#EFF6FF',
                    borderColor: '#BFDBFE',
                    color: '#1D4ED8',
                    fontWeight: 'bold'
                  }
                }, `로그 100개 더 보기 (전체 ${filteredTimeline.length}개 중 ${timelineLimit}개 표시 중)`)
              )
            )
          )
        )
      ) : null,

      /* Original Backup card tools */
      /*#__PURE__*/React.createElement("section", { className: "recovery-backup-card", style: styles.card },
        /*#__PURE__*/React.createElement("div", { className: "admin-section-header" },
          /*#__PURE__*/React.createElement("div", { className: "summary-title" }, "JSON 백업관리"),
          /*#__PURE__*/React.createElement("div", { className: "admin-backup-actions", "data-collapse-anchor": "true", "data-collapse-key": "recovery-backup", "data-collapse-label": "JSON 백업관리" },
            /*#__PURE__*/React.createElement("button", { className: "btn btn-secondary", onClick: () => handleDownloadBackup('') }, "전체 백업 다운로드"),
            /*#__PURE__*/React.createElement("button", { className: isRestoreMode ? "btn btn-danger" : "btn btn-secondary", onClick: handleImportClick },
              isRestoreMode ? "JSON 파일 불러오기" : "데이터 복구 모드 필요"
            )
          )
        ),
        /*#__PURE__*/React.createElement("input", {
          ref: importInputRef, type: "file", accept: "application/json,.json", onChange: handleImportBackup, style: { display: 'none' }
        }),
        /*#__PURE__*/React.createElement("div", { className: "admin-backup-grid" },
          dashboard.calendarStats.map(stat => /*#__PURE__*/React.createElement("div", {
            key: `${stat.calendar.id}_backup_tab`, className: "admin-backup-card"
          },
            /*#__PURE__*/React.createElement("div", { style: { fontWeight: 900, color: '#0F172A', fontSize: '0.86rem' } }, stat.calendar.id, " 백업 파일"),
            /*#__PURE__*/React.createElement("div", { style: { color: '#64748B', fontSize: '0.78rem', margin: '4px 0 10px 0' } },
              `${stat.participants.length}명 참여자 · 활성일정 ${stat.schedules.length}건 · 투표 ${stat.pollCount}개`
            ),
            /*#__PURE__*/React.createElement("button", {
              className: "btn btn-secondary", style: { fontSize: '0.76rem', padding: '4px 10px' },
              onClick: () => handleDownloadBackup(stat.calendar.id)
            }, `${stat.calendar.id} JSON 다운로드`)
          ))
        )
      )
    )
    ,

    /* ================================================================= */
    /* TAB 4: CHAT LOGS                                                   */
    /* ================================================================= */
    activeTab === 'logs' && /*#__PURE__*/React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: '10px' } },
      /* Unified Live Chat Logs Section */
      /*#__PURE__*/React.createElement("section", { style: styles.card },
        /* Header & Search */
        /*#__PURE__*/React.createElement("div", {
          style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' },
          "data-collapse-anchor": "true", "data-collapse-key": "logs-chat", "data-collapse-label": "채팅 로그"
        },
          /*#__PURE__*/React.createElement("div", { style: { flex: '1 1 auto', minWidth: 0 } },
            /*#__PURE__*/React.createElement("h4", { style: { fontSize: '0.96rem', fontWeight: '900', color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '6px' } }, /*#__PURE__*/React.createElement(ChatSectionIcon, null), "채팅 로그", (adminMsgTotal[selectedCalId] || 0) > 0 && /*#__PURE__*/React.createElement("span", { className: "main-menu-badge" }, adminMsgTotal[selectedCalId])),
            /*#__PURE__*/React.createElement("p", { style: { fontSize: '0.75rem', color: '#64748B', margin: '2px 0 0 0' } }, "각 캘린더별 채팅 메시지 내역을 실시간 모니터링하고 어드민 권한으로 삭제할 수 있습니다.")
          ),
          /*#__PURE__*/React.createElement("div", {
            style: { display: 'flex', alignItems: 'center', gap: '8px', maxWidth: '100%', flex: '0 1 260px', justifyContent: 'flex-end', marginLeft: 'auto' }
          },
            /*#__PURE__*/React.createElement("input", {
              type: "text", className: "form-input", placeholder: "이름, 메시지 검색...", value: chatSearchQuery,
              onChange: e => setChatSearchQuery(e.target.value),
              style: { maxWidth: '240px', width: '100%', minWidth: 0 }
            })
          )
        ),

        /* Message list -- the page itself scrolls, so this doesn't need its own scrollbox */
        /*#__PURE__*/React.createElement("div", {
          style: { border: '1px solid #E2E8F0', borderRadius: '8px', padding: '8px', backgroundColor: '#F8FAFC' }
        },
          filteredMessages.length === 0 ? /*#__PURE__*/React.createElement("div", { style: { padding: '30px', color: '#64748B', fontSize: '0.82rem', textAlign: 'center' } }, "표시할 채팅 내역이 없습니다.") :
          filteredMessages.map(msg => {
            const cal = serverCalendars.find(c => c.id === msg.calId);
            const pMap = (cal?.participants || []).reduce((acc, p) => { acc[p.id] = p; return acc; }, {});
            const p = pMap[msg.participantId] || { name: '알수없음', color: '#94A3B8' };
            const timeStr = new Date(msg.timestamp).toLocaleString('ko-KR', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' });

            return /*#__PURE__*/React.createElement("div", {
              key: msg.id,
              className: 'admin-chat-row'
            },
              /* Line 1: participant badge (calendar is now implied by the header's calendar select) */
              /*#__PURE__*/React.createElement("div", { className: "admin-chat-header" },
                /* Participant badge */
                /*#__PURE__*/React.createElement("span", {
                  style: { backgroundColor: p.color, color: getContrastTextColor(p.color), padding: '2px 8px', borderRadius: 'var(--radius-full)', fontSize: '0.72rem', fontWeight: 'bold', whiteSpace: 'nowrap' }
                }, p.name)
              ),
              /* Line 2: full message text, wrapped rather than truncated on narrow screens */
              /*#__PURE__*/React.createElement("span", {
                className: "admin-chat-text",
                title: msg.text || ''
              }, msg.text ? highlightTextWithYellowMarker(msg.text, chatSearchQuery) : (msg.imageUrl ? '[사진 첨부됨]' : '')),
              /* Line 3: timestamp + boxed delete button */
              /*#__PURE__*/React.createElement("div", { className: "admin-chat-footer" },
                /*#__PURE__*/React.createElement("span", { style: { fontSize: '0.72rem', color: '#64748B' } }, timeStr),
                /*#__PURE__*/React.createElement("button", {
                  type: "button", className: "btn btn-danger", title: "삭제",
                  onClick: () => handleDeleteMessageDirect(msg.calId, msg),
                  style: { width: '26px', height: '26px', padding: 0, flexShrink: 0 }
                }, /*#__PURE__*/React.createElement(SmallXIcon, { size: 14 }))
              )
            );
          }),
          (() => {
            const loadedCount = (messagesMap[selectedCalId] || []).length;
            const totalKnown = adminMsgTotal[selectedCalId];
            const totalCount = (totalKnown != null && totalKnown >= 0) ? totalKnown : null;
            const hasMore = (totalCount != null && totalCount > loadedCount)
              || (loadedCount > 0 && loadedCount >= adminMessageLimit);
            if (!hasMore) return null;
            const step = ADMIN_MESSAGE_LIVE_LIMIT;
            const totalLabel = totalCount != null ? String(totalCount) : (loadedCount + '+');
            return /*#__PURE__*/React.createElement("div", {
              style: { display: 'flex', justifyContent: 'center', marginTop: '12px', paddingBottom: '4px' }
            },
              /*#__PURE__*/React.createElement("button", {
                type: "button",
                className: "btn btn-secondary",
                onClick: () => setAdminMessageLimit(prev => prev + step),
                style: {
                  width: '100%',
                  fontSize: '0.8rem',
                  padding: '8px 16px',
                  backgroundColor: '#EFF6FF',
                  borderColor: '#BFDBFE',
                  color: '#1D4ED8',
                  fontWeight: 'bold'
                }
              }, `채팅 ${step}개 더 보기 (전체 ${totalLabel}개 중 ${loadedCount}개 표시 중)`)
            );
          })()
        )
      )
    )),

    /* Inner PollModal to Edit/Create Polls from AdminDashboard */
    isPollModalOpen && editingPollCalId && /*#__PURE__*/React.createElement(PollModal, {
      calendar: serverCalendars.find(c => c.id === editingPollCalId),
      poll: editingPoll,
      onRequestConfirm: requestConfirm,
      onSave: async (updatedPoll) => {
        const now = Date.now();
        const targetCal = serverCalendars.find(c => c.id === editingPollCalId);
        let nextPolls = [...(targetCal.polls || [])];
        const idx = nextPolls.findIndex(p => p.id === updatedPoll.id);
        if (idx >= 0) {
          nextPolls[idx] = updatedPoll;
        } else {
          nextPolls.push(updatedPoll);
        }

        const log = createPollActivityLog(targetCal.id, 'poll_create', '', now, updatedPoll.title);

        const updatedCal = {
          ...targetCal,
          polls: nextPolls,
          activityLogs: log ? [...getCalendarActivityLogs(targetCal), log] : getCalendarActivityLogs(targetCal),
          updatedAt: now,
          revision: (targetCal.revision || 0) + 1
        };

        const saved = await pushSingleCloudCalendar(updatedCal, now, 18, null, 'polls', log ? [log] : []);
        if (saved) {
          setServerCalendars(prev => prev.map(c => c.id === targetCal.id ? updatedCal : c));
          showAdminToast('투표 저장완료', 'success');
          setIsPollModalOpen(false);
          setEditingPoll(null);
          setEditingPollCalId(null);
        } else {
          showAdminToast('투표 저장 실패', 'error');
        }
      },
      onClose: () => {
        setIsPollModalOpen(false);
        setEditingPoll(null);
        setEditingPollCalId(null);
      },
      showToast: showAdminToast
    }),

    /* Generic layer-popup confirm dialog (replaces window.confirm) */
    confirmDialog && /*#__PURE__*/React.createElement(ConfirmDialog, {
      title: confirmDialog.title,
      message: confirmDialog.message,
      onConfirm: confirmDialog.onConfirm,
      onCancel: closeConfirmDialog,
      showPasswordInput: confirmDialog.showPasswordInput
    }),

    /* New calendar creation modal (replaces window.prompt) */
    isCreateCalModalOpen && /*#__PURE__*/React.createElement(AdminCreateCalendarModal, {
      onCreate: submitCreateCalendar,
      onClose: () => setIsCreateCalModalOpen(false)
    }),

    /* Restore-mode confirmation phrase modal (replaces window.prompt) */
    isRestorePhraseModalOpen && /*#__PURE__*/React.createElement(AdminRestorePhraseModal, {
      onConfirm: submitRestorePhrase,
      onClose: () => setIsRestorePhraseModalOpen(false)
    }),

    isUnifiedSearchOpen && /*#__PURE__*/React.createElement(AdminUnifiedSearchModal, {
      onClose: () => setIsUnifiedSearchOpen(false),
      onSearch: q => {
        setIsUnifiedSearchOpen(false);
        setUnifiedSearchQuery(q);
      }
    })
  );
}

  if (typeof window !== 'undefined') {
  window.GATHER_UI_COMPONENTS = Object.assign({}, window.GATHER_UI_COMPONENTS || {}, {
    AdminDashboard: AdminDashboard,
  });
}
