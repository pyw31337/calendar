/**
 * Date modal (schedule popup) (P4-14)
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

/* __fb() bridge */
function __fb() {
  const deps = __gatherUiDeps();
  if (deps && typeof deps.getDb === 'function') {
    try { const d = deps.getDb(); if (d) return d; } catch (e) {}
  }
  return (typeof window !== 'undefined' && window.__gatherFirebaseDb) || null;
}

function getStoredChatParticipantId(...args) {
  const fn = (window.GATHER_APP_NOTIFICATIONS || {}).getStoredChatParticipantId;
  return typeof fn === 'function' ? fn(...args) : '';
}
function setStoredChatParticipantId(...args) {
  const fn = (window.GATHER_APP_NOTIFICATIONS || {}).setStoredChatParticipantId;
  return typeof fn === 'function' ? fn(...args) : undefined;
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

function appendChatImageFiles(...args) {
  const f = __gatherUiDeps().appendChatImageFiles || GATHER_APP_UTILS.appendChatImageFiles;
  return typeof f === 'function' ? f(...args) : undefined;
}
function autoGrowTextarea(...args) {
  const f = __gatherUiDeps().autoGrowTextarea || GATHER_APP_UTILS.autoGrowTextarea;
  return typeof f === 'function' ? f(...args) : undefined;
}
function buildActivityLogsFromAvailabilities(...args) {
  const f = __gatherUiDeps().buildActivityLogsFromAvailabilities || GATHER_APP_UTILS.buildActivityLogsFromAvailabilities;
  return typeof f === 'function' ? f(...args) : undefined;
}
function buildAdminDashboardMetrics(...args) {
  const f = __gatherUiDeps().buildAdminDashboardMetrics || GATHER_APP_UTILS.buildAdminDashboardMetrics;
  return typeof f === 'function' ? f(...args) : undefined;
}
function buildFieldChangeNote(...args) {
  const f = __gatherUiDeps().buildFieldChangeNote || GATHER_APP_UTILS.buildFieldChangeNote;
  return typeof f === 'function' ? f(...args) : undefined;
}
function changeAdminPasswordRemote(...args) {
  const f = __gatherUiDeps().changeAdminPasswordRemote || GATHER_APP_UTILS.changeAdminPasswordRemote;
  return typeof f === 'function' ? f(...args) : undefined;
}
function clearAdminSession(...args) {
  const f = __gatherUiDeps().clearAdminSession || GATHER_APP_UTILS.clearAdminSession;
  return typeof f === 'function' ? f(...args) : undefined;
}
function cloneCalendarList(...args) {
  const f = __gatherUiDeps().cloneCalendarList || GATHER_APP_UTILS.cloneCalendarList;
  return typeof f === 'function' ? f(...args) : undefined;
}
function computeCalendarSearchMatches(...args) {
  const f = __gatherUiDeps().computeCalendarSearchMatches || GATHER_APP_UTILS.computeCalendarSearchMatches;
  return typeof f === 'function' ? f(...args) : undefined;
}
function createCalendarBackupPayload(...args) {
  const f = __gatherUiDeps().createCalendarBackupPayload || GATHER_APP_UTILS.createCalendarBackupPayload;
  return typeof f === 'function' ? f(...args) : undefined;
}
function createDefaultCalendar(...args) {
  const f = __gatherUiDeps().createDefaultCalendar || GATHER_APP_UTILS.createDefaultCalendar;
  return typeof f === 'function' ? f(...args) : undefined;
}
function createMemoActivityLog(...args) {
  const f = __gatherUiDeps().createMemoActivityLog || GATHER_APP_UTILS.createMemoActivityLog;
  return typeof f === 'function' ? f(...args) : undefined;
}
function createPollActivityLog(...args) {
  const f = __gatherUiDeps().createPollActivityLog || GATHER_APP_UTILS.createPollActivityLog;
  return typeof f === 'function' ? f(...args) : undefined;
}
function deleteActivityLogsAfterTimestamp(...args) {
  const f = __gatherUiDeps().deleteActivityLogsAfterTimestamp || GATHER_APP_UTILS.deleteActivityLogsAfterTimestamp;
  return typeof f === 'function' ? f(...args) : undefined;
}
function deleteAllChatImagesFromStorage(...args) {
  const f = __gatherUiDeps().deleteAllChatImagesFromStorage || GATHER_APP_UTILS.deleteAllChatImagesFromStorage;
  return typeof f === 'function' ? f(...args) : undefined;
}
function deleteMessageRest(...args) {
  const f = __gatherUiDeps().deleteMessageRest || GATHER_APP_UTILS.deleteMessageRest;
  return typeof f === 'function' ? f(...args) : undefined;
}
function describeImageProcessingFailures(...args) {
  const f = __gatherUiDeps().describeImageProcessingFailures || GATHER_APP_UTILS.describeImageProcessingFailures;
  return typeof f === 'function' ? f(...args) : undefined;
}
function doesPlaceMatchDate(...args) {
  const f = __gatherUiDeps().doesPlaceMatchDate || GATHER_APP_UTILS.doesPlaceMatchDate;
  return typeof f === 'function' ? f(...args) : undefined;
}
function downloadJsonFile(...args) {
  const f = __gatherUiDeps().downloadJsonFile || GATHER_APP_UTILS.downloadJsonFile;
  return typeof f === 'function' ? f(...args) : undefined;
}
function exportCalendarConfirmedMeetingsToICS(...args) {
  const f = __gatherUiDeps().exportCalendarConfirmedMeetingsToICS || GATHER_APP_UTILS.exportCalendarConfirmedMeetingsToICS;
  return typeof f === 'function' ? f(...args) : undefined;
}
function extractCalendarsFromBackup(...args) {
  const f = __gatherUiDeps().extractCalendarsFromBackup || GATHER_APP_UTILS.extractCalendarsFromBackup;
  return typeof f === 'function' ? f(...args) : undefined;
}
function fetchActivityLogsFromFirestore(...args) {
  const f = __gatherUiDeps().fetchActivityLogsFromFirestore || GATHER_APP_UTILS.fetchActivityLogsFromFirestore;
  return typeof f === 'function' ? f(...args) : undefined;
}
function fetchChatMessagesRest(...args) {
  const f = __gatherUiDeps().fetchChatMessagesRest || GATHER_APP_UTILS.fetchChatMessagesRest;
  return typeof f === 'function' ? f(...args) : undefined;
}
function fetchImageShareDocument(...args) {
  const f = __gatherUiDeps().fetchImageShareDocument || GATHER_APP_UTILS.fetchImageShareDocument;
  return typeof f === 'function' ? f(...args) : undefined;
}
function fetchRecentMessagesRest(...args) {
  const f = __gatherUiDeps().fetchRecentMessagesRest || GATHER_APP_UTILS.fetchRecentMessagesRest;
  return typeof f === 'function' ? f(...args) : undefined;
}
function fetchSingleCalendarWithRest(...args) {
  const f = __gatherUiDeps().fetchSingleCalendarWithRest || GATHER_APP_UTILS.fetchSingleCalendarWithRest;
  return typeof f === 'function' ? f(...args) : undefined;
}
function fetchSubcollectionCount(...args) {
  const f = __gatherUiDeps().fetchSubcollectionCount || GATHER_APP_UTILS.fetchSubcollectionCount;
  return typeof f === 'function' ? f(...args) : undefined;
}
function fetchWithTimeout(...args) {
  const f = __gatherUiDeps().fetchWithTimeout || GATHER_APP_UTILS.fetchWithTimeout;
  return typeof f === 'function' ? f(...args) : undefined;
}
function formatLogTimestamp(...args) {
  const f = __gatherUiDeps().formatLogTimestamp || GATHER_APP_UTILS.formatLogTimestamp;
  return typeof f === 'function' ? f(...args) : undefined;
}
function getAdminSearchFilterFromUrl(...args) {
  const f = __gatherUiDeps().getAdminSearchFilterFromUrl || GATHER_APP_UTILS.getAdminSearchFilterFromUrl;
  return typeof f === 'function' ? f(...args) : undefined;
}
function getAdminSearchQueryFromUrl(...args) {
  const f = __gatherUiDeps().getAdminSearchQueryFromUrl || GATHER_APP_UTILS.getAdminSearchQueryFromUrl;
  return typeof f === 'function' ? f(...args) : undefined;
}
function getAdminSearchResultTargetUrl(...args) {
  const f = __gatherUiDeps().getAdminSearchResultTargetUrl || GATHER_APP_UTILS.getAdminSearchResultTargetUrl;
  return typeof f === 'function' ? f(...args) : undefined;
}
function getAdminSelectedCalendarIdFromUrl(...args) {
  const f = __gatherUiDeps().getAdminSelectedCalendarIdFromUrl || GATHER_APP_UTILS.getAdminSelectedCalendarIdFromUrl;
  return typeof f === 'function' ? f(...args) : undefined;
}
function getAdminSession(...args) {
  const f = __gatherUiDeps().getAdminSession || GATHER_APP_UTILS.getAdminSession;
  return typeof f === 'function' ? f(...args) : undefined;
}
function getImageFilesFromClipboardEvent(...args) {
  const f = __gatherUiDeps().getImageFilesFromClipboardEvent || GATHER_APP_UTILS.getImageFilesFromClipboardEvent;
  return typeof f === 'function' ? f(...args) : undefined;
}
function getKnownPlaceParticipantNames(...args) {
  const f = __gatherUiDeps().getKnownPlaceParticipantNames || GATHER_APP_UTILS.getKnownPlaceParticipantNames;
  return typeof f === 'function' ? f(...args) : undefined;
}
function getPlaceCategoryMarkerContent(...args) {
  const f = __gatherUiDeps().getPlaceCategoryMarkerContent || GATHER_APP_UTILS.getPlaceCategoryMarkerContent;
  return typeof f === 'function' ? f(...args) : undefined;
}
function getSolarFromLunar(...args) {
  const f = __gatherUiDeps().getSolarFromLunar || GATHER_APP_UTILS.getSolarFromLunar;
  return typeof f === 'function' ? f(...args) : undefined;
}
function getWeatherIcon(...args) {
  const f = __gatherUiDeps().getWeatherIcon || GATHER_APP_UTILS.getWeatherIcon;
  return typeof f === 'function' ? f(...args) : undefined;
}
function isAdminRestoreRoute(...args) {
  const f = __gatherUiDeps().isAdminRestoreRoute || GATHER_APP_UTILS.isAdminRestoreRoute;
  return typeof f === 'function' ? f(...args) : undefined;
}
function listAllCalendarsRemote(...args) {
  const f = __gatherUiDeps().listAllCalendarsRemote || GATHER_APP_UTILS.listAllCalendarsRemote;
  return typeof f === 'function' ? f(...args) : undefined;
}
function mergeCalendarCollections(...args) {
  const f = __gatherUiDeps().mergeCalendarCollections || GATHER_APP_UTILS.mergeCalendarCollections;
  return typeof f === 'function' ? f(...args) : undefined;
}
function mergePollRecord(...args) {
  const f = __gatherUiDeps().mergePollRecord || GATHER_APP_UTILS.mergePollRecord;
  return typeof f === 'function' ? f(...args) : undefined;
}
function normalizeCalendarForSave(...args) {
  const f = __gatherUiDeps().normalizeCalendarForSave || GATHER_APP_UTILS.normalizeCalendarForSave;
  return typeof f === 'function' ? f(...args) : undefined;
}
function normalizePollOptionInput(...args) {
  const f = __gatherUiDeps().normalizePollOptionInput || GATHER_APP_UTILS.normalizePollOptionInput;
  return typeof f === 'function' ? f(...args) : undefined;
}
function processImageFilesSequentially(...args) {
  const f = __gatherUiDeps().processImageFilesSequentially || GATHER_APP_UTILS.processImageFilesSequentially;
  return typeof f === 'function' ? f(...args) : undefined;
}
function pushSingleCloudCalendar(...args) {
  const f = __gatherUiDeps().pushSingleCloudCalendar || GATHER_APP_UTILS.pushSingleCloudCalendar;
  return typeof f === 'function' ? f(...args) : undefined;
}
function resolveMemoImageBatch(...args) {
  const f = __gatherUiDeps().resolveMemoImageBatch || GATHER_APP_UTILS.resolveMemoImageBatch;
  return typeof f === 'function' ? f(...args) : undefined;
}
function sanitizeMemoForFirestore(...args) {
  const f = __gatherUiDeps().sanitizeMemoForFirestore || GATHER_APP_UTILS.sanitizeMemoForFirestore;
  return typeof f === 'function' ? f(...args) : undefined;
}
function setAdminSession(...args) {
  const f = __gatherUiDeps().setAdminSession || GATHER_APP_UTILS.setAdminSession;
  return typeof f === 'function' ? f(...args) : undefined;
}
function sha256Hex(...args) {
  const f = __gatherUiDeps().sha256Hex || GATHER_APP_UTILS.sha256Hex;
  return typeof f === 'function' ? f(...args) : undefined;
}
function subscribeUserToPushWithPermission(...args) {
  const f = __gatherUiDeps().subscribeUserToPushWithPermission || GATHER_APP_UTILS.subscribeUserToPushWithPermission;
  return typeof f === 'function' ? f(...args) : undefined;
}
function translateKoreanToEnglish(...args) {
  const f = __gatherUiDeps().translateKoreanToEnglish || GATHER_APP_UTILS.translateKoreanToEnglish;
  return typeof f === 'function' ? f(...args) : undefined;
}
function unsubscribeUserFromPush(...args) {
  const f = __gatherUiDeps().unsubscribeUserFromPush || GATHER_APP_UTILS.unsubscribeUserFromPush;
  return typeof f === 'function' ? f(...args) : undefined;
}
function validateBackupCalendars(...args) {
  const f = __gatherUiDeps().validateBackupCalendars || GATHER_APP_UTILS.validateBackupCalendars;
  return typeof f === 'function' ? f(...args) : undefined;
}
function validateCalendarShape(...args) {
  const f = __gatherUiDeps().validateCalendarShape || GATHER_APP_UTILS.validateCalendarShape;
  return typeof f === 'function' ? f(...args) : undefined;
}
function verifyAdminPasswordRemote(...args) {
  const f = __gatherUiDeps().verifyAdminPasswordRemote || GATHER_APP_UTILS.verifyAdminPasswordRemote;
  return typeof f === 'function' ? f(...args) : undefined;
}

const ADMIN_MESSAGE_LIVE_LIMIT = (__gatherUiDeps().ADMIN_MESSAGE_LIVE_LIMIT
  || (window.__GATHER_ADMIN_LIMITS && window.__GATHER_ADMIN_LIMITS.ADMIN_MESSAGE_LIVE_LIMIT)
  || 50);
const ADMIN_MEMO_LIVE_LIMIT = (__gatherUiDeps().ADMIN_MEMO_LIVE_LIMIT
  || (window.__GATHER_ADMIN_LIMITS && window.__GATHER_ADMIN_LIMITS.ADMIN_MEMO_LIVE_LIMIT)
  || 50);

const PEEKALINK_HOUR_BUCKET_MS = Number.isFinite(GATHER_APP_CHAT_DATA.PEEKALINK_HOUR_BUCKET_MS) ? GATHER_APP_CHAT_DATA.PEEKALINK_HOUR_BUCKET_MS : 3600000;
const PEEKALINK_FREE_HOURLY_LIMIT = Number.isFinite(GATHER_APP_CHAT_DATA.PEEKALINK_FREE_HOURLY_LIMIT) ? GATHER_APP_CHAT_DATA.PEEKALINK_FREE_HOURLY_LIMIT : 50;
const ENABLE_FIRESTORE_WRITES = (window.GATHER_APP_CONFIG || {}).ENABLE_FIRESTORE_WRITES !== false;
const GLOBAL_SEARCH_HISTORY_LIMIT = 100;
const EXPENSE_ACTIVITY_ACTIONS = GATHER_APP_CONSTANTS.EXPENSE_ACTIVITY_ACTIONS || [];
const IMAGE_TAG_ACTIVITY_ACTIONS = GATHER_APP_CONSTANTS.IMAGE_TAG_ACTIVITY_ACTIONS || [];
const MEETING_ACTIVITY_ACTIONS = GATHER_APP_CONSTANTS.MEETING_ACTIVITY_ACTIONS || [];
const PLACE_ACTIVITY_ACTIONS = GATHER_APP_CONSTANTS.PLACE_ACTIVITY_ACTIONS || [];
const POLL_ACTIVITY_ACTIONS = GATHER_APP_CONSTANTS.POLL_ACTIVITY_ACTIONS || [];
const KAKAO_CATEGORY_GROUP_TO_PLACE_CATEGORY = GATHER_APP_CONSTANTS.KAKAO_CATEGORY_GROUP_TO_PLACE_CATEGORY || {};
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


export function DateModal({
  anniversaries = [],
  dateStr,
  calendar,
  chatMessages = [],
  adminMode = false,
  onSave,
  onConfirmMeeting,
  onSaveExpense,
  onDeleteExpense,
  onReorderExpenses,
  onAddMeetingPhotos,
  setActiveLightbox,
  initialTab = null,
  onSavePlace,
  onDeletePlace,
  onDelete,
  onDeleteDate,
  onRequestConfirm,
  onClose,
  showToast,
  onParticipantClick
}) {
  const React = window.React;
  const __deps = window.GATHER_UI_DEPS || {};
  const __comp = window.GATHER_UI_COMPONENTS || {};
  const ResizableModalContainer = __deps.ResizableModalContainer;
  const AutoGrowTextarea = __deps.AutoGrowTextarea;
  const FormAddEditActionButtons = __deps.FormAddEditActionButtons;
  const GamifiedConfirmButtonContent = __deps.GamifiedConfirmButtonContent;
  const ItemEditDeleteActions = __deps.ItemEditDeleteActions;
  const LineHeightIcon = __deps.LineHeightIcon;
  const SegmentedToggle = __deps.SegmentedToggle;
  const SimpleBottomSheetPicker = __comp.SimpleBottomSheetPicker || __deps.SimpleBottomSheetPicker;
  const UrlCapsuleBadge = __deps.UrlCapsuleBadge;
  const SmallXIcon = __deps.SmallXIcon;
  const resolveMeetingPhotoDisplay = __deps.resolveMeetingPhotoDisplay;
  const getActiveParticipants = __deps.getActiveParticipants;
  const getCalendarPlaces = __deps.getCalendarPlaces;
  const getPlaceCategories = __deps.getPlaceCategories;
  const extractLeadingMemoDate = __deps.extractLeadingMemoDate;
  const parseVisitEntriesFromMemo = __deps.parseVisitEntriesFromMemo;
  const sortVisitEntriesRecentFirst = __deps.sortVisitEntriesRecentFirst;
  const normalizePlaceAddress = __deps.normalizePlaceAddress;
  const normalizePlaceDateForSort = __deps.normalizePlaceDateForSort;
  const renderTextWithUrlBadge = __deps.renderTextWithUrlBadge;
  const sanitizeText = __deps.sanitizeText;
  const autoGrowTextarea = __deps.autoGrowTextarea;
  const getPlaceCategoryIcon = __deps.getPlaceCategoryIcon;
  const fetchWithTimeout = __deps.fetchWithTimeout;
  const firebaseConfig = __deps.firebaseConfig || window.firebaseConfig;
  const KAKAO_CATEGORY_GROUP_TO_PLACE_CATEGORY = __deps.KAKAO_CATEGORY_GROUP_TO_PLACE_CATEGORY || {};

  const [activeTab, setActiveTab] = React.useState(initialTab || 'participant'); // 'participant' | 'meeting' | 'settlement' | 'photos'
  const [participantId, setParticipantId] = React.useState('');
  const [note, setNote] = React.useState('');
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const noteInputRef = React.useRef(null);
  const activeParticipants = getActiveParticipants(calendar);
  const dateEntries = getActiveAvailabilities(calendar).filter(e => e.date === dateStr);
  const dateAnns = getAnniversariesForDate(dateStr, anniversaries);
  const getExistingNoteForParticipant = id => (dateEntries.find(entry => entry.participantId === id)?.note || '');

  const selectedPart = activeParticipants.find(p => p.id === participantId);
  const selectedPartName = selectedPart ? selectedPart.name : '';
  const selectedPartColor = selectedPart ? selectedPart.color : '#94A3B8';

  // Place state
  const [placeQuery, setPlaceQuery] = React.useState('');
  const [placeResults, setPlaceResults] = React.useState([]);
  const [selectedPlace, setSelectedPlace] = React.useState(null);
  const [placeMemo, setPlaceMemo] = React.useState('');
  const [placeAlias, setPlaceAlias] = React.useState('');
  const [placeCategoryId, setPlaceCategoryId] = React.useState(() => getPlaceCategories(calendar)[0]?.id || 'etc');
  const [placeVisitStatus, setPlaceVisitStatus] = React.useState('visited');
  const [editingLinkedPlaceId, setEditingLinkedPlaceId] = React.useState(null);
  const [isPlaceLoading, setIsPlaceLoading] = React.useState(false);
  const [isPlaceCollapsed, setIsPlaceCollapsed] = React.useState(true);
  const [placeSearchStage, setPlaceSearchStage] = React.useState(null);
  const [isSavingPlace, setIsSavingPlace] = React.useState(false);

  // Search progress simulation states
  const [searchProgress, setSearchProgress] = React.useState(0);
  const [estRemainingSeconds, setEstRemainingSeconds] = React.useState(5);

  React.useEffect(() => {
    if (!isPlaceLoading) {
      setSearchProgress(0);
      setEstRemainingSeconds(5);
      return;
    }
    setSearchProgress(5);
    setEstRemainingSeconds(5);
    const startTime = Date.now();
    const targetDuration = 5000;
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progressValue = Math.min(Math.round(98 * (1 - Math.exp(-elapsed / 2200))), 98);
      const remaining = Math.max(1, Math.round((targetDuration - elapsed) / 1000));
      setSearchProgress(progressValue);
      setEstRemainingSeconds(remaining);
    }, 100);
    return () => clearInterval(interval);
  }, [isPlaceLoading]);

  // Registered places for this date
  const registeredPlaces = React.useMemo(() => {
    return getCalendarPlaces(calendar).filter(p => doesPlaceMatchDate(p, dateStr));
  }, [calendar, dateStr]);

  // Debounced live typing search
  React.useEffect(() => {
    const trimmed = placeQuery.trim();
    if (selectedPlace && selectedPlace.name === trimmed) return undefined;
    if (trimmed.length < 2) {
      setPlaceResults([]);
      return undefined;
    }
    const timer = setTimeout(() => { handlePlaceSearch(null, true); }, 380);
    return () => clearTimeout(timer);
  }, [placeQuery, selectedPlace]);

  React.useEffect(() => {
    setParticipantId('');
    setNote('');
    setIsSheetOpen(false);
    setIsSubmitting(false);

    setSelectedPlace(null);
    setPlaceMemo('');
    setPlaceAlias('');
    setPlaceCategoryId(getPlaceCategories(calendar)[0]?.id || 'etc');
    setPlaceVisitStatus('visited');
    setEditingLinkedPlaceId(null);
    setPlaceQuery('');
    setIsPlaceCollapsed(true);
    setPlaceResults([]);
  }, [calendar?.id, dateStr]);

  const handlePlaceSearch = async (e, auto = false) => {
    if (e) e.preventDefault();
    const cleanQuery = placeQuery.trim();
    if (!cleanQuery) {
      if (!auto) showToast('검색할 주소나 업체명을 입력해 주세요.', 'error');
      return;
    }
    setIsPlaceLoading(true);
    if (!auto) setPlaceSearchStage('kakao');
    try {
      let mapped = [];
      try {
        const kakaoUrl = `https://us-central1-${firebaseConfig.projectId}.cloudfunctions.net/kakaoLocalSearchProxy?query=${encodeURIComponent(cleanQuery)}`;
        const kakaoRes = await fetchWithTimeout(kakaoUrl, 6000);
        const kakaoJson = kakaoRes.ok ? await kakaoRes.json() : null;
        if (kakaoJson?.ok && Array.isArray(kakaoJson.documents)) {
          mapped = kakaoJson.documents.map((doc, idx) => ({
            id: `kakao_${doc.id || idx}`,
            name: doc.place_name || cleanQuery,
            address: doc.road_address_name || doc.address_name || '',
            lat: parseFloat(doc.y),
            lng: parseFloat(doc.x),
            categoryId: KAKAO_CATEGORY_GROUP_TO_PLACE_CATEGORY[doc.category_group_code] || null,
            categoryLabel: doc.category_name || '',
            phone: doc.phone || '',
            url: doc.place_url || ''
          })).filter(r => Number.isFinite(r.lat) && Number.isFinite(r.lng));
        }
      } catch (err) {
        console.error('Kakao local search failed, falling back to Google Places:', err);
      }
      if (mapped.length === 0 && !auto) {
        setPlaceSearchStage('google');
        try {
          const googleUrl = `https://us-central1-${firebaseConfig.projectId}.cloudfunctions.net/googlePlacesSearchProxy?query=${encodeURIComponent(cleanQuery)}`;
          const googleRes = await fetchWithTimeout(googleUrl, 6000);
          const googleJson = googleRes.ok ? await googleRes.json() : null;
          if (googleJson?.ok && Array.isArray(googleJson.places)) {
            mapped = googleJson.places.map((p, idx) => ({
              id: `google_${p.id || idx}`,
              name: p.displayName?.text || cleanQuery,
              address: p.formattedAddress || '',
              lat: parseFloat(p.location?.latitude),
              lng: parseFloat(p.location?.longitude),
              categoryId: null,
              categoryLabel: '', phone: '', url: ''
            })).filter(r => Number.isFinite(r.lat) && Number.isFinite(r.lng));
          }
        } catch (err) {
          console.error('Google Places search failed, falling back to Nominatim:', err);
        }
      }
      if (mapped.length === 0 && !auto) {
        setPlaceSearchStage('nominatim');
        const res = await fetchWithTimeout(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(cleanQuery)}&format=json&limit=8&accept-language=ko`, 6000);
        const data = res.ok ? await res.json() : [];
        mapped = data.map((doc, idx) => ({
          id: `osm_${doc.place_id || idx}`,
          name: doc.display_name?.split(',')[0] || cleanQuery,
          address: doc.display_name || '',
          lat: parseFloat(doc.lat),
          lng: parseFloat(doc.lon),
          categoryId: null,
          categoryLabel: '', phone: '', url: ''
        })).filter(r => Number.isFinite(r.lat) && Number.isFinite(r.lng));
      }
      setPlaceResults(mapped);
      if (mapped.length === 0 && !auto) {
        showToast('검색 결과가 없습니다.', 'info');
      }
    } catch (err) {
      console.error('Place search error:', err);
      showToast('장소 검색 중 오류가 발생했습니다.', 'error');
    } finally {
      setIsPlaceLoading(false);
      setPlaceSearchStage(null);
    }
  };

  const handleSavePlaceClick = async () => {
    if (!onSavePlace) return;
    if (!selectedPlace) {
      showToast('추가할 장소를 선택해 주세요.', 'error');
      return;
    }
    setIsSavingPlace(true);
    try {
      const isConfirmed = isDateConfirmedMeeting(calendar, dateStr);
      const cleanName = sanitizeText(selectedPlace.name || '', 80);
      const cleanAddress = normalizePlaceAddressForSave(selectedPlace.address || '', selectedPlace.lat, selectedPlace.lng);
      const cleanMemo = sanitizeText(placeMemo.trim() || '', 2000);
      
      const newPlaceData = {
        id: editingLinkedPlaceId || undefined,
        name: cleanName,
        alias: sanitizeText(placeAlias || '', 80),
        address: cleanAddress,
        lat: selectedPlace.lat,
        lng: selectedPlace.lng,
        categoryId: placeCategoryId || selectedPlace.categoryId || 'etc',
        memo: cleanMemo,
        visitStatus: placeVisitStatus === 'planned' ? 'planned' : 'visited',
        visitDate: dateStr
      };

      const ok = await Promise.resolve(onSavePlace(newPlaceData));
      if (ok === false) {
        showToast(editingLinkedPlaceId ? '장소 수정에 실패했습니다.' : '장소 추가에 실패했습니다.', 'error');
        return;
      }
      showToast(editingLinkedPlaceId ? '장소가 수정되었습니다.' : '장소가 추가되었습니다.', 'success');
      setSelectedPlace(null);
      setPlaceMemo('');
      setPlaceAlias('');
      setPlaceCategoryId(getPlaceCategories(calendar)[0]?.id || 'etc');
      setPlaceVisitStatus('visited');
      setEditingLinkedPlaceId(null);
      setPlaceQuery('');
      setHasInteracted(false);
      const resetPlaceCat = getPlaceCategories(calendar)[0]?.id || 'etc';
      snapshotFormBaseline({
        ...formBaselineRef.current,
        editingLinkedPlaceId: null,
        placeMemo: '',
        placeAlias: '',
        placeQuery: '',
        selectedPlaceKey: '',
        placeCategoryId: resetPlaceCat,
        placeVisitStatus: 'visited'
      });
    } catch (err) {
      console.error('Save place error:', err);
      showToast('장소 추가 실패', 'error');
    } finally {
      setIsSavingPlace(false);
    }
  };

  const handleSelectResult = (res) => {
    setSelectedPlace(res);
    setPlaceQuery(res.name);
    setPlaceResults([]);
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!participantId) {
      showToast('참여자를 선택해 주세요.', 'error');
      return;
    }
    setIsSubmitting(true);
    const cleanNote = sanitizeText(note, 500);
    const ok = await onSave(dateStr, participantId, cleanNote);
    setIsSubmitting(false);
    if (ok !== false) {
      const wasEdit = dateEntries.some(en => en.participantId === participantId);
      showToast(wasEdit ? '참석 정보가 수정되었습니다.' : '참석이 추가되었습니다.', 'success');
      setParticipantId('');
      setNote('');
      setHasInteracted(false);
      snapshotFormBaseline({ ...formBaselineRef.current, participantId: '', note: '' });
    }
  };

  const handleEditClick = (entry) => {
    const pid = entry.participantId;
    const n = entry.note || '';
    setParticipantId(pid);
    setNote(n);
    setHasInteracted(false);
    snapshotFormBaseline({
      ...formBaselineRef.current,
      participantId: pid,
      note: n
    });
    if (noteInputRef.current) {
      noteInputRef.current.focus();
    }
  };

  const handleDeleteClick = (entry) => {
    if (!onDelete) return;
    const part = activeParticipants.find(p => p.id === entry.participantId);
    const nameLabel = part ? part.name : '참여자';
    onRequestConfirm('참석 삭제', `"${nameLabel}"님의 참석 기록을 삭제하시겠습니까?`, async () => {
      setIsSubmitting(true);
      const ok = await onDelete(dateStr, entry.participantId);
      setIsSubmitting(false);
      if (ok !== false) showToast('참석 기록이 삭제되었습니다.', 'success');
      else showToast('삭제에 실패했습니다.', 'error');
    });
  };

  const handleClearAllDate = () => {
    if (!onDeleteDate) return;
    onRequestConfirm('날짜 초기화', `${getDeleteDateLabel(dateStr)}의 모든 참석/장소/정산 내역을 삭제하고 선택 가능 날짜에서 제외하시겠습니까?`, async () => {
      setIsSubmitting(true);
      await onDeleteDate(dateStr);
      setIsSubmitting(false);
      showToast('날짜가 초기화되었습니다.', 'success');
      onClose();
    });
  };

  const titleParts = getShortTitleParts(dateStr);
  const getDeleteDateLabel = dateStr => `${titleParts.year}${titleParts.rest}`;
  const holidayNames = React.useMemo(() => getHolidayNamesForDate(dateStr), [dateStr]);
  const holidayLabelText = holidayNames.length > 0 ? holidayNames.join('·') : '';
  const totalPartCount = activeParticipants.length || 0;
  const uniqueActiveParts = new Set(dateEntries.map(e => e.participantId));
  const isAllAvailable = totalPartCount > 0 && uniqueActiveParts.size === totalPartCount;
  const isConfirmed = isDateConfirmedMeeting(calendar, dateStr);
  const confirmedMeetingEntry = getConfirmedMeetings(calendar).find(m => m.date === dateStr) || null;
  const meetingPhotos = React.useMemo(
    () => (Array.isArray(confirmedMeetingEntry?.photos) ? confirmedMeetingEntry.photos : [])
      .filter(photo => photo && (photo.imageUrl || photo.thumbUrl))
      // Auto-linked entries (sourceMessageId set) are references to a real chat photo --
      // resolve the live imageUrl/thumbUrl/tags from that source message so this tile always
      // matches the chat original exactly, including any tag edit made from anywhere else.
      .map(photo => {
        const resolved = resolveMeetingPhotoDisplay ? resolveMeetingPhotoDisplay(photo, chatMessages) : null;
        return resolved ? { ...photo, imageUrl: resolved.imageUrl, thumbUrl: resolved.thumbUrl, tags: resolved.tags } : photo;
      })
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)),
    [confirmedMeetingEntry, chatMessages]
  );
  const meetingPhotoInputRef = React.useRef(null);
  const [isSavingMeetingPhotos, setIsSavingMeetingPhotos] = React.useState(false);
  const expenses = React.useMemo(
    () => (Array.isArray(confirmedMeetingEntry?.expenses) ? confirmedMeetingEntry.expenses : [])
      .filter(e => e && typeof e === 'object' && e.id)
      .slice()
      .sort((a, b) => {
      const aOrder = Number.isFinite(Number(a.order)) ? Number(a.order) : Number.POSITIVE_INFINITY;
      const bOrder = Number.isFinite(Number(b.order)) ? Number(b.order) : Number.POSITIVE_INFINITY;
      if (aOrder !== bOrder) return aOrder - bOrder;
      return (a.createdAt || 0) - (b.createdAt || 0);
    }),
    [confirmedMeetingEntry]
  );
  const [expenseLabelInput, setExpenseLabelInput] = React.useState('');
  const [expenseAmountInput, setExpenseAmountInput] = React.useState('');
  const [expenseCategoryInput, setExpenseCategoryInput] = React.useState(() => getExpenseCategories(calendar)[0]?.id || 'etc');
  const [expenseIsIncome, setExpenseIsIncome] = React.useState(false);
  const [editingExpenseId, setEditingExpenseId] = React.useState(null);
  const [isSavingExpense, setIsSavingExpense] = React.useState(false);
  const [isSettlementCollapsed, setIsSettlementCollapsed] = React.useState(true);
  const [draggingExpenseId, setDraggingExpenseId] = React.useState('');
  const [dragOverExpenseId, setDragOverExpenseId] = React.useState('');
  const expensePointerSortRef = React.useRef({ sourceId: '', targetId: '', startX: 0, startY: 0, active: false });

  React.useEffect(() => {
    setExpenseLabelInput('');
    setExpenseAmountInput('');
    setExpenseCategoryInput(getExpenseCategories(calendar)[0]?.id || 'etc');
    setExpenseIsIncome(false);
    setEditingExpenseId(null);
    setDraggingExpenseId('');
    setDragOverExpenseId('');
    expensePointerSortRef.current = { sourceId: '', targetId: '', startX: 0, startY: 0, active: false };
    setIsSavingMeetingPhotos(false);
  }, [calendar?.id, dateStr]);

  const handleMeetingPhotoFiles = async event => {
    const files = Array.from(event.target.files || []);
    event.target.value = '';
    if (!files.length || typeof onAddMeetingPhotos !== 'function') return;
    setIsSavingMeetingPhotos(true);
    try {
      const ok = await Promise.resolve(onAddMeetingPhotos(dateStr, files));
      if (ok !== false) showToast('일정 사진이 추가되었습니다.', 'success');
      else showToast('사진 추가 실패', 'error');
    } catch (err) {
      console.error('Meeting photo upload failed:', err);
      showToast('사진 추가 실패', 'error');
    } finally {
      setIsSavingMeetingPhotos(false);
    }
  };

  const expenseTotal = expenses.reduce((sum, e) => sum + (Number(e?.amount) || 0), 0);
  const expenseCategories = getExpenseCategories(calendar) || [];
  const getExpenseUrl = expense => {
    try {
      const labelStr = typeof expense?.label === 'string' ? expense.label : String(expense?.label || '');
      return sanitizeText(expense?.url || extractFirstUrl(labelStr) || '', 220);
    } catch (_) {
      return '';
    }
  };
  const getExpenseLabel = expense => {
    try {
      const raw = typeof expense?.label === 'string' ? expense.label : String(expense?.label || '');
      const url = getExpenseUrl(expense);
      return url ? raw.replace(url, '').trim() : raw;
    } catch (_) {
      return String(expense?.label || '');
    }
  };
  const handleExpenseItemClick = expense => {
    if (isSavingExpense) return;
    const eid = expense.id;
    const label = getExpenseLabel(expense);
    const isIncome = Number(expense.amount) < 0;
    const amountStr = Math.abs(Number(expense.amount)).toLocaleString();
    const cat = expense.categoryId || 'etc';
    setEditingExpenseId(eid);
    setExpenseLabelInput(label);
    setExpenseIsIncome(isIncome);
    setExpenseAmountInput(amountStr);
    setExpenseCategoryInput(cat);
    setHasInteracted(false);
    snapshotFormBaseline({
      ...formBaselineRef.current,
      editingExpenseId: eid,
      expenseLabelInput: label,
      expenseAmountInput: amountStr,
      expenseIsIncome: isIncome,
      expenseCategoryInput: cat
    });
  };
  const handleSaveExpenseClick = async () => {
    if (!onSaveExpense) return;
    const label = expenseLabelInput.trim();
    if (!label) {
      showToast('내역을 입력해 주세요.', 'error');
      return;
    }
    const cleanAmount = Number(expenseAmountInput.replace(/[^0-9]/g, ''));
    if (!cleanAmount) {
      showToast('금액을 입력해 주세요.', 'error');
      return;
    }
    setIsSavingExpense(true);
    const finalAmount = expenseIsIncome ? -cleanAmount : cleanAmount;
    const ok = await onSaveExpense(dateStr, {
      id: editingExpenseId || undefined,
      label,
      amount: finalAmount,
      categoryId: expenseCategoryInput
    });
    setIsSavingExpense(false);
    if (ok !== false) {
      showToast(editingExpenseId ? '정산 내역이 수정되었습니다.' : '정산 내역이 추가되었습니다.', 'success');
      setEditingExpenseId(null);
      setExpenseLabelInput('');
      setExpenseAmountInput('');
      setExpenseIsIncome(false);
      setHasInteracted(false);
      const resetExpCat = getExpenseCategories(calendar)[0]?.id || 'etc';
      setExpenseCategoryInput(resetExpCat);
      snapshotFormBaseline({
        ...formBaselineRef.current,
        editingExpenseId: null,
        expenseLabelInput: '',
        expenseAmountInput: '',
        expenseIsIncome: false,
        expenseCategoryInput: resetExpCat
      });
    }
  };
  const handleDeleteExpenseClick = (e, expenseId) => {
    e.stopPropagation();
    if (!onDeleteExpense) return;
    const target = expenses.find(exp => exp.id === expenseId);
    const rawLabel = String(target?.label || target?.url || '').trim();
    const shortLabel = rawLabel.length > 24 ? rawLabel.slice(0, 24) + '…' : rawLabel;
    const kind = Number(target?.amount) < 0 ? '수입' : '지출';
    const message = shortLabel
      ? `"${shortLabel}" ${kind} 내역을 삭제하시겠습니까?`
      : `이 ${kind} 내역을 삭제하시겠습니까?`;
    // Confirm once only — parent handler must not show another dialog.
    onRequestConfirm('정산 내역 삭제', message, async () => {
      setIsSavingExpense(true);
      const ok = await onDeleteExpense(dateStr, expenseId);
      setIsSavingExpense(false);
      if (ok === false) {
        showToast('삭제에 실패했습니다.', 'error');
        return;
      }
      showToast('정산 내역이 삭제되었습니다.', 'success');
      if (editingExpenseId === expenseId) {
        setEditingExpenseId(null);
        setExpenseLabelInput('');
        setExpenseAmountInput('');
      }
    });
  };
    const moveExpense = async (sourceId, targetId) => {
    if (!onReorderExpenses || !sourceId || !targetId || sourceId === targetId) return false;
    const sourceIdx = expenses.findIndex(e => e.id === sourceId);
    const targetIdx = expenses.findIndex(e => e.id === targetId);
    if (sourceIdx < 0 || targetIdx < 0) return false;
    const nextExpenses = [...expenses];
    const [moved] = nextExpenses.splice(sourceIdx, 1);
    nextExpenses.splice(targetIdx, 0, moved);
    const orderedIds = nextExpenses.map(exp => exp.id);
    const result = await Promise.resolve(onReorderExpenses(dateStr, orderedIds));
    return result !== false;
  };

  const expensesOrderRef = React.useRef(expenses);
  expensesOrderRef.current = expenses;
  const expenseDragHandlersRef = React.useRef({});

  expenseDragHandlersRef.current.update = e => {
    const ref = expensePointerSortRef.current;
    if (!ref.active) return;
    if (e.cancelable) e.preventDefault();
    const deltaY = e.clientY - ref.startY;
    const row = document.querySelector(`.expense-sortable-row[data-expense-id="${ref.sourceId}"]`);
    if (row) {
      row.style.transform = `translateY(${deltaY}px) scale(1.02)`;
      row.style.pointerEvents = 'none';
    }
    // elementFromPoint 대신 각 행의 세로 영역으로 타겟 판정
    const rows = Array.from(document.querySelectorAll('.date-modal-settlement-list .expense-sortable-row'));
    let nextTargetId = '';
    for (const r of rows) {
      const id = r.getAttribute('data-expense-id');
      if (!id || id === ref.sourceId) continue;
      const rect = r.getBoundingClientRect();
      if (e.clientY >= rect.top && e.clientY <= rect.bottom) {
        nextTargetId = id;
        break;
      }
    }
    if (nextTargetId !== ref.targetId) {
      if (ref.targetId) {
        const prev = document.querySelector(`.expense-sortable-row[data-expense-id="${ref.targetId}"]`);
        if (prev) prev.style.borderColor = 'var(--border-subtle)';
      }
      ref.targetId = nextTargetId;
      if (nextTargetId) {
        const next = document.querySelector(`.expense-sortable-row[data-expense-id="${nextTargetId}"]`);
        if (next) next.style.borderColor = 'var(--accent-primary)';
      }
      setDragOverExpenseId(nextTargetId || '');
    }
  };

  expenseDragHandlersRef.current.finish = async () => {
    const ref = expensePointerSortRef.current;
    if (!ref.active) return;
    const sourceId = ref.sourceId;
    const targetId = ref.targetId;
    document.removeEventListener('pointermove', expenseDragHandlersRef.current.onMove);
    document.removeEventListener('pointerup', expenseDragHandlersRef.current.onUp);
    document.removeEventListener('pointercancel', expenseDragHandlersRef.current.onCancel);
    ref.active = false;
    const row = document.querySelector(`.expense-sortable-row[data-expense-id="${sourceId}"]`);
    if (row) {
      row.style.zIndex = '';
      row.style.boxShadow = '';
      row.style.transform = '';
      row.style.transition = '';
      row.style.pointerEvents = '';
      row.style.opacity = '';
    }
    if (targetId) {
      const targetRow = document.querySelector(`.expense-sortable-row[data-expense-id="${targetId}"]`);
      if (targetRow) targetRow.style.borderColor = 'var(--border-subtle)';
    }
    setDraggingExpenseId('');
    setDragOverExpenseId('');
    expensePointerSortRef.current = { sourceId: '', targetId: '', startX: 0, startY: 0, active: false };
    if (sourceId && targetId && sourceId !== targetId) {
      setIsSavingExpense(true);
      try {
        const ok = await moveExpense(sourceId, targetId);
        if (ok === false) showToast('순서 변경에 실패했습니다.', 'error');
        else showToast('순서가 변경되었습니다.', 'success');
      } finally {
        setIsSavingExpense(false);
      }
    }
  };

  expenseDragHandlersRef.current.reset = () => {
    const ref = expensePointerSortRef.current;
    document.removeEventListener('pointermove', expenseDragHandlersRef.current.onMove);
    document.removeEventListener('pointerup', expenseDragHandlersRef.current.onUp);
    document.removeEventListener('pointercancel', expenseDragHandlersRef.current.onCancel);
    const sourceId = ref.sourceId;
    const targetId = ref.targetId;
    ref.active = false;
    const row = document.querySelector(`.expense-sortable-row[data-expense-id="${sourceId}"]`);
    if (row) {
      row.style.zIndex = '';
      row.style.boxShadow = '';
      row.style.transform = '';
      row.style.transition = '';
      row.style.pointerEvents = '';
      row.style.opacity = '';
    }
    if (targetId) {
      const targetRow = document.querySelector(`.expense-sortable-row[data-expense-id="${targetId}"]`);
      if (targetRow) targetRow.style.borderColor = 'var(--border-subtle)';
    }
    setDraggingExpenseId('');
    setDragOverExpenseId('');
    expensePointerSortRef.current = { sourceId: '', targetId: '', startX: 0, startY: 0, active: false };
  };

  expenseDragHandlersRef.current.onMove = e => expenseDragHandlersRef.current.update(e);
  expenseDragHandlersRef.current.onUp = e => expenseDragHandlersRef.current.finish(e);
  expenseDragHandlersRef.current.onCancel = () => expenseDragHandlersRef.current.reset();

  const beginExpensePointerSort = (e, expenseId) => {
    if (isSavingExpense || expenses.length <= 1) return;
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch (_) {}
    const row = e.currentTarget.closest('.expense-sortable-row');
    if (!row) return;
    row.style.zIndex = '1000';
    row.style.boxShadow = '0 8px 20px rgba(0,0,0,0.12)';
    row.style.transform = 'scale(1.02)';
    row.style.transition = 'none';
    row.style.pointerEvents = 'none';
    row.style.opacity = '0.92';
    expensePointerSortRef.current = {
      sourceId: expenseId, targetId: '', startX: e.clientX, startY: e.clientY, active: true, pointerId: e.pointerId
    };
    setDraggingExpenseId(expenseId);
    setDragOverExpenseId('');
    document.addEventListener('pointermove', expenseDragHandlersRef.current.onMove, { passive: false });
    document.addEventListener('pointerup', expenseDragHandlersRef.current.onUp);
    document.addEventListener('pointercancel', expenseDragHandlersRef.current.onCancel);
  };
  const updateExpensePointerSort = e => expenseDragHandlersRef.current.update(e);
  const finishExpensePointerSort = e => expenseDragHandlersRef.current.finish(e);
  const resetExpensePointerSort = () => expenseDragHandlersRef.current.reset();

  // Close-confirm only when form differs from last committed baseline.
  // Baseline: mount (real defaults), edit-load, successful save.
  const formBaselineRef = React.useRef(null);
  const placeKeyOf = (sp) => {
    if (!sp) return '';
    return String(sp.id || '') + '|' + String(sp.name || '') + '|' + String(sp.lat || '') + '|' + String(sp.lng || '');
  };
  const snapshotFormBaseline = React.useCallback((overrides = {}) => {
    formBaselineRef.current = {
      participantId: '',
      note: '',
      editingLinkedPlaceId: null,
      placeMemo: '',
      placeAlias: '',
      placeQuery: '',
      selectedPlaceKey: '',
      placeCategoryId: getPlaceCategories(calendar)[0]?.id || 'etc',
      placeVisitStatus: 'visited',
      editingExpenseId: null,
      expenseLabelInput: '',
      expenseAmountInput: '',
      expenseIsIncome: false,
      expenseCategoryInput: getExpenseCategories(calendar)[0]?.id || 'etc',
      ...overrides
    };
  }, [calendar]);
  React.useLayoutEffect(() => {
    snapshotFormBaseline({
      participantId: '',
      note: '',
      editingLinkedPlaceId: null,
      placeMemo: '',
      placeAlias: '',
      placeQuery: '',
      selectedPlaceKey: '',
      placeCategoryId: placeCategoryId || getPlaceCategories(calendar)[0]?.id || 'etc',
      placeVisitStatus: placeVisitStatus || 'visited',
      editingExpenseId: null,
      expenseLabelInput: '',
      expenseAmountInput: '',
      expenseIsIncome: false,
      expenseCategoryInput: expenseCategoryInput || getExpenseCategories(calendar)[0]?.id || 'etc'
    });
    // mount only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [hasInteracted, setHasInteracted] = React.useState(false);
  const markDirty = React.useCallback(() => setHasInteracted(true), []);
  const requestClose = () => {
    if (isSubmitting) return;
    const b = formBaselineRef.current;
    if (!b) {
      onClose();
      return;
    }
    const dirty = (
      String(participantId || '') !== String(b.participantId || '') ||
      String(note || '') !== String(b.note || '') ||
      String(editingLinkedPlaceId || '') !== String(b.editingLinkedPlaceId || '') ||
      String(placeMemo || '') !== String(b.placeMemo || '') ||
      String(placeAlias || '') !== String(b.placeAlias || '') ||
      String(placeQuery || '') !== String(b.placeQuery || '') ||
      placeKeyOf(selectedPlace) !== String(b.selectedPlaceKey || '') ||
      String(placeCategoryId || '') !== String(b.placeCategoryId || '') ||
      String(placeVisitStatus || 'visited') !== String(b.placeVisitStatus || 'visited') ||
      String(editingExpenseId || '') !== String(b.editingExpenseId || '') ||
      String(expenseLabelInput || '') !== String(b.expenseLabelInput || '') ||
      String(expenseAmountInput || '') !== String(b.expenseAmountInput || '') ||
      !!expenseIsIncome !== !!b.expenseIsIncome ||
      String(expenseCategoryInput || '') !== String(b.expenseCategoryInput || '')
    );
    if (dirty && typeof onRequestConfirm === 'function') {
      onRequestConfirm('닫기 확인', '저장하지 않은 내용이 있습니다. 닫으시겠습니까?', () => onClose());
      return;
    }
    onClose();
  };

  const portalContent = /*#__PURE__*/React.createElement("div", {
    className: "modal-overlay",
    onClick: e => {
      if (e.target !== e.currentTarget) return;
      requestClose();
    },
    style: { zIndex: 11000 }
  }, /*#__PURE__*/React.createElement(ResizableModalContainer, {
    className: "modal-container",
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal-header",
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '14px 20px',
      borderBottom: '1px solid var(--border-subtle)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'baseline',
      gap: '8px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '1.25rem',
      fontWeight: 900,
      color: 'var(--text-main)'
    }
  }, titleParts.year, /*#__PURE__*/React.createElement("span", {
    style: {
      color: isConfirmed ? '#7C3AED' : (isAllAvailable ? '#10B981' : 'var(--text-muted)'),
      marginLeft: '4px'
    }
  }, titleParts.rest)), holidayLabelText && /*#__PURE__*/React.createElement("span", {
    className: "holiday-tag",
    style: {
      fontSize: '0.72rem',
      fontWeight: 'bold',
      padding: '3px 8px',
      borderRadius: '6px',
      backgroundColor: '#FEF2F2',
      color: '#EF4444',
      border: '1px solid #FEE2E2',
      verticalAlign: 'middle'
    }
  }, holidayLabelText)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    }
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => {
      if (!isSubmitting) requestClose();
    },
    style: {
      background: 'none',
      border: 'none',
      color: 'var(--text-muted)',
      fontSize: '1.25rem',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      padding: '2px 4px',
      marginLeft: '4px'
    },
    title: "닫기"
  }, "✕"))), /*#__PURE__*/React.createElement("form", {
    onSubmit: e => {
      e.preventDefault();
      if (activeTab === 'participant') handleSubmit(e);
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal-body"
  },
    /* Tab Bar Menu: 참여자 / 장소 / 정산 / 사진 -- full-bleed + sticky so it stays pinned to
       modal-header (like a second header row) while the rest of modal-body scrolls under it. */
    /*#__PURE__*/React.createElement("div", {
      className: "modal-sticky-tab-bar",
      style: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr 1fr',
        gap: '6px'
      }
    },
      /* Tab 1: 참여자 */
      /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: e => { e.preventDefault(); e.stopPropagation(); setActiveTab('participant'); },
        style: {
          border: 'none',
          borderRadius: '8px',
          padding: '8px 4px',
          background: activeTab === 'participant' ? 'var(--accent-primary)' : 'transparent',
          color: activeTab === 'participant' ? '#FFFFFF' : 'var(--text-muted)',
          fontWeight: 800,
          fontSize: '0.82rem',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '4px'
        }
      },
        "참여자",
        /*#__PURE__*/React.createElement("span", {
          style: {
            fontSize: '0.7rem',
            padding: '1px 5px',
            borderRadius: '999px',
            backgroundColor: activeTab === 'participant' ? 'rgba(255,255,255,0.2)' : 'var(--border-subtle)',
            color: activeTab === 'participant' ? '#FFFFFF' : 'var(--text-muted)',
            fontWeight: 'bold'
          }
        }, dateEntries.length > 0 ? dateEntries.length : '없음')
      ),
      /* Tab 2: 장소 */
      /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: e => { e.preventDefault(); e.stopPropagation(); setActiveTab('meeting'); },
        style: {
          border: 'none',
          borderRadius: '8px',
          padding: '8px 4px',
          background: activeTab === 'meeting' ? 'var(--accent-primary)' : 'transparent',
          color: activeTab === 'meeting' ? '#FFFFFF' : 'var(--text-muted)',
          fontWeight: 800,
          fontSize: '0.82rem',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '4px'
        }
      },
        "장소",
        /*#__PURE__*/React.createElement("span", {
          style: {
            fontSize: '0.7rem',
            padding: '1px 5px',
            borderRadius: '999px',
            backgroundColor: activeTab === 'meeting' ? 'rgba(255,255,255,0.2)' : 'var(--border-subtle)',
            color: activeTab === 'meeting' ? '#FFFFFF' : 'var(--text-muted)',
            fontWeight: 'bold'
          }
        }, registeredPlaces.length > 0 ? registeredPlaces.length : '없음')
      ),
      /* Tab 3: 정산 */
      /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: e => { e.preventDefault(); e.stopPropagation(); setActiveTab('settlement'); },
        style: {
          border: 'none',
          borderRadius: '8px',
          padding: '8px 4px',
          background: activeTab === 'settlement' ? 'var(--accent-primary)' : 'transparent',
          color: activeTab === 'settlement' ? '#FFFFFF' : 'var(--text-muted)',
          fontWeight: 800,
          fontSize: '0.82rem',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '4px'
        }
      },
        "정산",
        /*#__PURE__*/React.createElement("span", {
          style: {
            fontSize: '0.7rem',
            padding: '1px 5px',
            borderRadius: '999px',
            backgroundColor: activeTab === 'settlement' ? 'rgba(255,255,255,0.2)' : 'var(--border-subtle)',
            color: activeTab === 'settlement' ? '#FFFFFF' : 'var(--text-muted)',
            fontWeight: 'bold'
          }
        }, expenses.length > 0 ? expenses.length : '없음')
      ),
      /* Tab 4: 사진 */
      /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: e => { e.preventDefault(); e.stopPropagation(); setActiveTab('photos'); },
        style: {
          border: 'none',
          borderRadius: '8px',
          padding: '8px 4px',
          background: activeTab === 'photos' ? 'var(--accent-primary)' : 'transparent',
          color: activeTab === 'photos' ? '#FFFFFF' : 'var(--text-muted)',
          fontWeight: 800,
          fontSize: '0.82rem',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '4px'
        }
      },
        "사진",
        /*#__PURE__*/React.createElement("span", {
          style: {
            fontSize: '0.7rem',
            padding: '1px 5px',
            borderRadius: '999px',
            backgroundColor: activeTab === 'photos' ? 'rgba(255,255,255,0.2)' : 'var(--border-subtle)',
            color: activeTab === 'photos' ? '#FFFFFF' : 'var(--text-muted)',
            fontWeight: 'bold'
          }
        }, meetingPhotos.length > 0 ? meetingPhotos.length : '없음')
      )
    ),

    /* TAB CONTENTS */

    /* Tab 1 Content: 참여자 */
    activeTab === 'participant' && /*#__PURE__*/React.createElement(React.Fragment, null,
      /* Anniversaries banner list inside DateModal body */
      dateAnns.length > 0 && /*#__PURE__*/React.createElement("div", {
        style: { display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '14px' }
      }, dateAnns.map((ann, aIdx) => {
        const displayColor = getAnniversaryDisplayColor(ann, calendar);
        return /*#__PURE__*/React.createElement("div", {
          key: ann.id || aIdx,
          style: {
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 14px',
            backgroundColor: `${displayColor}12`,
            color: displayColor,
            border: `1px solid ${displayColor}30`,
            borderLeft: `4px solid ${displayColor}`,
            borderRadius: '8px',
            fontSize: '0.82rem',
            fontWeight: 'bold'
          }
        }, ann.icon, " ", ann.title);
      })),

      !adminMode && /*#__PURE__*/React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: '10px' } },
        /* Participant Picker Button */
        /*#__PURE__*/React.createElement("div", null,
          /*#__PURE__*/React.createElement("label", {
            style: { display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-muted)' }
          }, "참여자 선택"),
          /*#__PURE__*/React.createElement("button", {
            type: "button",
            className: "form-select",
            style: {
              width: '100%',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              textAlign: 'left',
              background: 'var(--bg-card)',
              cursor: isSubmitting ? 'default' : 'pointer'
            },
            disabled: isSubmitting,
            onClick: () => {
              if (!isSubmitting) { setIsSheetOpen(true); }
            }
          },
            /*#__PURE__*/React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, overflow: 'hidden' } },
              participantId && /*#__PURE__*/React.createElement("span", {
                className: "form-select-color-indicator",
                style: { backgroundColor: selectedPartColor }
              }),
              /*#__PURE__*/React.createElement("span", {
                style: {
                  fontWeight: 700,
                  color: participantId ? 'var(--text-main)' : 'var(--text-muted)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }
              }, participantId ? selectedPartName : '참여할 이름을 골라주세요')
            ),
            /*#__PURE__*/React.createElement("svg", {
              xmlns: "http://www.w3.org/2000/svg",
              width: "18",
              height: "18",
              viewBox: "0 0 24 24",
              fill: "none",
              stroke: "currentColor",
              strokeWidth: "2",
              strokeLinecap: "round",
              strokeLinejoin: "round",
              className: "form-select-chevron",
              "aria-hidden": "true"
            }, /*#__PURE__*/React.createElement("path", { d: "M6 9l6 6l6 -6" }))
          )
        ),
        /* Note Input Field */
        /*#__PURE__*/React.createElement("div", null,
          /*#__PURE__*/React.createElement("label", {
            style: { display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-muted)' }
          }, "메모 입력 (선택)"),
          /*#__PURE__*/React.createElement("div", { className: "date-modal-field-with-actions", style: { display: 'flex', gap: '8px' } },
            /*#__PURE__*/React.createElement("input", {
              ref: noteInputRef,
              type: "text",
              className: "form-input",
              style: { flex: 1 },
              placeholder: "일정 메모를 남길 수 있습니다 (최대 500자)",
              maxLength: 500,
              value: note,
              disabled: isSubmitting,
              onChange: e => { markDirty(); setNote(e.target.value); }
            }),
            /*#__PURE__*/React.createElement("div", { className: "date-modal-field-actions" },
              /*#__PURE__*/React.createElement(FormAddEditActionButtons, {
                isEditing: !!participantId && dateEntries.some(en => en.participantId === participantId),
                isSaving: isSubmitting,
                disabled: !participantId,
                onCancel: () => {
                  setParticipantId('');
                  setNote('');
                  setHasInteracted(false);
                  snapshotFormBaseline({ ...formBaselineRef.current, participantId: '', note: '' });
                },
                onSubmit: handleSubmit
              })
            )
          )
        )
      ),

      /* Attendees list */
      dateEntries.length > 0 && /*#__PURE__*/React.createElement("div", {
        style: { marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }
      },
        /*#__PURE__*/React.createElement("label", {
          style: { fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '2px' }
        }, `참석 명단 (${dateEntries.length}명 가능)`),
        /* List */
        /*#__PURE__*/React.createElement("div", {
          style: {
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            maxHeight: '260px',
            overflowY: 'auto',
            padding: '8px',
            backgroundColor: 'var(--bg-primary)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '12px'
          }
        }, dateEntries.map(entry => {
          const part = activeParticipants.find(p => p.id === entry.participantId);
          if (!part) return null;
          return /*#__PURE__*/React.createElement("div", {
            key: entry.id,
            className: "date-modal-attendance-row",
            style: {
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'stretch',
              gap: '4px',
              padding: '10px 12px',
              paddingRight: adminMode ? '12px' : '44px',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '10px',
              position: 'relative'
            }
          },
            /*#__PURE__*/React.createElement("div", {
              className: "date-modal-attendance-row-head",
              style: { display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }
            },
              /*#__PURE__*/React.createElement("span", {
                style: { width: '8px', height: '8px', borderRadius: '50%', backgroundColor: part.color, flexShrink: 0 }
              }),
              /*#__PURE__*/React.createElement("span", {
                className: "date-modal-attendance-name",
                style: {
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  color: 'var(--text-main)',
                  minWidth: 0,
                  cursor: 'pointer',
                  lineHeight: 1.35,
                  wordBreak: 'keep-all'
                },
                title: '눌러서 수정 (참여자·메모 불러오기)',
                onClick: () => handleEditClick(entry)
              }, part.name)
            ),
            entry.note && /*#__PURE__*/React.createElement("div", {
              className: "date-modal-attendance-note",
              style: {
                fontSize: '0.78rem',
                color: 'var(--text-main)',
                minWidth: 0,
                lineHeight: 1.4,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: '4px',
                paddingLeft: '16px',
                paddingRight: '0',
                width: '100%',
                boxSizing: 'border-box',
                wordBreak: 'break-word',
                overflowWrap: 'anywhere'
              }
            }, renderTextWithUrlBadge(entry.note)),
            !adminMode && /*#__PURE__*/React.createElement("div", {
              className: "date-modal-attendance-actions",
              style: { position: 'absolute', top: '8px', right: '8px' }
            }, /*#__PURE__*/React.createElement(ItemEditDeleteActions, {
              onEdit: () => handleEditClick(entry),
              onDelete: () => handleDeleteClick(entry)
            }))
          );
        })
      ),
      !adminMode && typeof onConfirmMeeting === 'function' && /*#__PURE__*/React.createElement("div", {
        className: "gamified-confirm-wrap",
        style: { marginTop: '4px', overflow: 'hidden', borderRadius: '14px' }
      }, /*#__PURE__*/React.createElement("button", {
        type: "button",
        className: !isConfirmed && isAllAvailable ? 'btn-gamified-confirm' : 'btn-meeting-confirm-plain',
        disabled: isSubmitting,
        onClick: async e => {
          e.preventDefault();
          e.stopPropagation();
          if (isSubmitting) return;
          setIsSubmitting(true);
          try { await Promise.resolve(onConfirmMeeting(dateStr, '')); }
          finally { setIsSubmitting(false); }
        },
        style: {
          width: '100%', marginTop: '12px', padding: '12px 16px', borderRadius: '12px',
          fontWeight: 800, fontSize: '0.92rem', cursor: isSubmitting ? 'wait' : 'pointer',
          ...((!isConfirmed && isAllAvailable) ? {} : isConfirmed ? {
            border: '1.5px solid rgb(239, 68, 68)',
            backgroundColor: 'rgba(239, 68, 68, 0.06)',
            color: 'rgb(239, 68, 68)'
          } : {
            border: '1.5px solid #C4B5FD', backgroundColor: 'rgba(124, 58, 237, 0.08)', color: '#7C3AED'
          })
        }
      }, (!isConfirmed && isAllAvailable)
        ? /*#__PURE__*/React.createElement(GamifiedConfirmButtonContent, { label: "모임 확정" })
        : (isConfirmed ? '모임 취소' : '모임 확정')))
    )),

    /* Tab 2 Content: 장소 */
    activeTab === 'meeting' && /*#__PURE__*/React.createElement(React.Fragment, null,
      !adminMode && /*#__PURE__*/React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: '12px' } },
        /* Search Field */
        /*#__PURE__*/React.createElement("div", null,
          /*#__PURE__*/React.createElement("label", {
            style: { display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-muted)' }
          }, "장소 검색"),
          /*#__PURE__*/React.createElement("div", { className: "date-modal-field-with-actions", style: { display: 'flex', gap: '8px' } },
            /*#__PURE__*/React.createElement("input", {
              type: "text",
              className: "form-input",
              style: { flex: 1 },
              placeholder: "지명, 도로명 주소, 또는 업체명 검색",
              value: placeQuery,
              onChange: e => setPlaceQuery(e.target.value),
              onKeyDown: e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  e.stopPropagation();
                  handlePlaceSearch(e, false);
                }
              }
            }),
            /*#__PURE__*/React.createElement("div", { className: "date-modal-field-actions" },
              /*#__PURE__*/React.createElement("button", {
                type: "button",
                className: "btn btn-poll-create btn-action btn-action-dark",
                style: { padding: '0 16px', fontWeight: 800, height: '44px', flex: 1 },
                onClick: e => { e.preventDefault(); e.stopPropagation(); handlePlaceSearch(e, false); }
              }, "검색")
            )
          )
        ),

        /* Search progress overlay */
        isPlaceLoading && /*#__PURE__*/React.createElement("div", {
          style: {
            padding: '12px 14px', borderRadius: '8px', border: '1px solid var(--border-subtle)',
            backgroundColor: 'var(--bg-primary)', display: 'flex', flexDirection: 'column', gap: '6px'
          }
        },
          /*#__PURE__*/React.createElement("div", { style: { display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', fontWeight: 700 } },
            /*#__PURE__*/React.createElement("span", { style: { color: 'var(--text-muted)' } },
              placeSearchStage === 'kakao' ? "카카오 로컬 정보 분석 중..." :
              placeSearchStage === 'google' ? "구글 장소 분석 중..." :
              placeSearchStage === 'nominatim' ? "지도 매핑 분석 중..." : "주변 정보 수집 중..."
            ),
            /*#__PURE__*/React.createElement("span", { style: { color: 'var(--accent-primary)' } }, `${searchProgress}% (${estRemainingSeconds}초 남음)`)
          ),
          /*#__PURE__*/React.createElement("div", { style: { width: '100%', height: '6px', backgroundColor: 'var(--border-subtle)', borderRadius: '999px', overflow: 'hidden' } },
            /*#__PURE__*/React.createElement("div", { style: { width: `${searchProgress}%`, height: '100%', backgroundColor: 'var(--accent-primary)', transition: 'width 0.1s linear' } })
          )
        ),

        /* Search Results List */
        placeResults.length > 0 && /*#__PURE__*/React.createElement("div", {
          style: {
            display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '180px', overflowY: 'auto',
            border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '6px', backgroundColor: 'var(--bg-primary)'
          }
        }, placeResults.map(r => /*#__PURE__*/React.createElement("button", {
          key: r.id,
          type: "button",
          onClick: () => handleSelectResult(r),
          style: { textAlign: 'left', padding: '8px 10px', borderRadius: '6px', border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '2px' },
          className: "place-result-item"
        },
          /*#__PURE__*/React.createElement("span", { style: { fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)' } }, r.name),
          /*#__PURE__*/React.createElement("span", { style: { fontSize: '0.72rem', color: 'var(--text-muted)' } }, getDisplayPlaceAddress(r))
        ))),

        /* Selected place preview card */
        selectedPlace && /*#__PURE__*/React.createElement("div", {
          style: {
            padding: '10px 12px', borderRadius: '8px', backgroundColor: 'rgba(59, 130, 246, 0.08)',
            border: '1px solid rgba(59, 130, 246, 0.2)', display: 'flex', flexDirection: 'column', gap: '4px'
          }
        },
          /*#__PURE__*/React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' } },
            /*#__PURE__*/React.createElement("span", { style: { fontSize: '0.86rem', fontWeight: 800, color: 'var(--text-main)' } }, selectedPlace.name),
            selectedPlace.categoryLabel && /*#__PURE__*/React.createElement("span", { style: { fontSize: '0.7rem', color: 'var(--text-muted)' } }, selectedPlace.categoryLabel)
          ),
          selectedPlace.address && /*#__PURE__*/React.createElement("div", { style: { fontSize: '0.76rem', color: 'var(--text-muted)' } }, getDisplayPlaceAddress(selectedPlace)),
          selectedPlace.phone && /*#__PURE__*/React.createElement("div", { style: { fontSize: '0.76rem', color: 'var(--text-muted)' } }, `☎ ${selectedPlace.phone}`)
        ),

        selectedPlace && /*#__PURE__*/React.createElement("div", null,
          /*#__PURE__*/React.createElement("label", {
            style: { display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }
          }, "별칭 (선택)"),
          /*#__PURE__*/React.createElement("input", {
            type: "text", className: "form-input", placeholder: "목록에 표시할 별칭 (예: 도은네 집)",
            maxLength: 80, value: placeAlias, onChange: e => setPlaceAlias(e.target.value),
            style: { width: '100%', boxSizing: 'border-box' }
          })
        ),
        /*#__PURE__*/React.createElement("div", null,
          /*#__PURE__*/React.createElement("label", {
            style: { display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }
          }, "카테고리"),
          /*#__PURE__*/React.createElement("div", { style: { display: 'flex', alignItems: 'stretch', gap: '10px' } },
            /*#__PURE__*/React.createElement("div", { style: { flex: 1, minWidth: 0 } },
              /*#__PURE__*/React.createElement(SimpleBottomSheetPicker, {
                title: "카테고리 선택",
                value: placeCategoryId,
                options: getPlaceCategories(calendar).map(c => ({ value: c.id, label: getPlaceCategoryLabel(c) })),
                onSelect: setPlaceCategoryId,
                placeholder: "카테고리 선택"
              })
            ),
            /*#__PURE__*/React.createElement(SegmentedToggle, {
              ariaLabel: "방문/방문예정 전환",
              value: placeVisitStatus,
              onChange: v => setPlaceVisitStatus(v),
              options: [{ value: 'visited', label: '방문' }, { value: 'planned', label: '예정' }]
            })
          )
        ),
        /*#__PURE__*/React.createElement("div", null,
          /*#__PURE__*/React.createElement("label", {
            style: { display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }
          }, "장소 메모 입력"),
          /*#__PURE__*/React.createElement("div", {
            className: "date-modal-field-with-actions",
            style: { display: 'flex', gap: '8px', alignItems: 'flex-start' }
          },
            /*#__PURE__*/React.createElement(AutoGrowTextarea, {
              className: "form-input",
              style: { flex: 1, padding: '8px 12px' },
              minHeight: 44,
              maxHeight: 480,
              placeholder: "메모 입력 (선택, '26.02.12' 또는 URL 입력 가능)",
              maxLength: 2000,
              value: placeMemo,
              disabled: isSavingPlace,
              onChange: e => setPlaceMemo(e.target.value)
            }),
            /*#__PURE__*/React.createElement("div", { className: "date-modal-field-actions" },
              /*#__PURE__*/React.createElement(FormAddEditActionButtons, {
                isEditing: !!editingLinkedPlaceId,
                isSaving: isSavingPlace,
                disabled: !selectedPlace,
                alignSelf: 'flex-start',
                onCancel: () => {
                  setEditingLinkedPlaceId(null);
                  setSelectedPlace(null);
                  setPlaceQuery('');
                  setPlaceAlias('');
                  setPlaceMemo('');
                  setPlaceCategoryId(getPlaceCategories(calendar)[0]?.id || 'etc');
                  setPlaceVisitStatus('visited');
                },
                onSubmit: handleSavePlaceClick
              })
            )
          )
        )
      ),

      /* List of registered places for this date */
      /*#__PURE__*/React.createElement("div", { style: { marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '6px' } },
        /*#__PURE__*/React.createElement("label", {
          style: { fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '2px' }
        }, `등록된 장소 (${registeredPlaces.length}곳)`),
        /* List */
        registeredPlaces.length === 0 ? /*#__PURE__*/React.createElement("div", {
          style: { textAlign: 'center', color: 'var(--text-muted)', padding: '24px 0', fontSize: '0.82rem', border: '1px dashed var(--border-subtle)', borderRadius: '12px' }
        }, "등록된 장소가 없습니다.") : /*#__PURE__*/React.createElement("div", {
          className: "date-modal-places-list",
          style: { display: 'flex', flexDirection: 'column', gap: '8px', flex: '1 1 auto', minHeight: '80px', overflow: 'visible' }
        }, registeredPlaces.map(place => {
          const category = getPlaceCategoryById(calendar, place.categoryId) || { id: 'etc', name: '기타', color: 'var(--text-muted)' };
          const catColor = category.color || '#64748B';
          const catName = category.name || '기타';
          return /*#__PURE__*/React.createElement("div", {
            key: place.id,
            style: {
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              padding: '12px 14px',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '12px',
              position: 'relative'
            }
          },
            /* Category Tag */
            /*#__PURE__*/React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '6px' } },
              /*#__PURE__*/React.createElement("span", {
                style: {
                  fontSize: '0.64rem', fontWeight: 900, padding: '2px 8px', borderRadius: '999px',
                  backgroundColor: `${catColor}18`, color: catColor
                }
              }, catName)
            ),
            /* Name & Address — prefer alias when set */
            /*#__PURE__*/React.createElement("span", { style: { fontWeight: 800, fontSize: '0.88rem', color: 'var(--text-main)' } }, place.alias || place.name),
            place.alias && place.name && /*#__PURE__*/React.createElement("span", { style: { fontSize: '0.72rem', color: 'var(--text-muted)' } }, place.name),
            place.address && /*#__PURE__*/React.createElement("span", { style: { fontSize: '0.74rem', color: 'var(--text-muted)' } }, getDisplayPlaceAddress(place)),
            /* Memo — one line per visit date entry */
            place.memo && (() => {
              let entries = parseVisitEntriesFromMemo(place.memo);
              if (entries.length === 0) {
                const leading = typeof extractLeadingMemoDate === 'function' ? extractLeadingMemoDate(place.memo) : '';
                if (leading) {
                  const rest = String(place.memo).replace(String(leading), '').replace(/^\s*\/?\s*/, '').trim();
                  entries = [{ date: leading, note: rest }];
                }
              } else if (typeof sortVisitEntriesRecentFirst === 'function') {
                entries = sortVisitEntriesRecentFirst(entries);
              }
              if (entries.length > 0) {
                return /*#__PURE__*/React.createElement("div", {
                  style: { display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '0.78rem', color: 'var(--text-main)', lineHeight: 1.45 }
                }, entries.map((en, idx) => /*#__PURE__*/React.createElement("div", {
                  key: `${en.date}_${idx}`,
                  style: { wordBreak: 'break-word' }
                }, renderTextWithUrlBadge(en.note ? `${en.date} ${en.note}` : en.date))));
              }
              return /*#__PURE__*/React.createElement("div", {
                style: { fontSize: '0.78rem', color: 'var(--text-main)', whiteSpace: 'pre-wrap', wordBreak: 'break-word', lineHeight: 1.45 }
              }, renderTextWithUrlBadge(place.memo));
            })(),
            !adminMode && /*#__PURE__*/React.createElement("div", {
              style: { position: 'absolute', top: '10px', right: '10px' }
            }, /*#__PURE__*/React.createElement(ItemEditDeleteActions, {
              onEdit: () => {
                const sp = { name: place.name, address: place.address || '', lat: place.lat, lng: place.lng, categoryId: place.categoryId || 'etc' };
                const memoLines = reformatMemoIntoDateLines(place.memo || '');
                const catId = place.categoryId || 'etc';
                const visit = place.visitStatus === 'planned' ? 'planned' : 'visited';
                setEditingLinkedPlaceId(place.id);
                setSelectedPlace(sp);
                setPlaceQuery(place.name || '');
                setPlaceAlias(place.alias || '');
                setPlaceMemo(memoLines);
                setPlaceCategoryId(catId);
                setPlaceVisitStatus(visit);
                setPlaceResults([]);
                setHasInteracted(false);
                snapshotFormBaseline({
                  ...formBaselineRef.current,
                  editingLinkedPlaceId: place.id,
                  placeMemo: memoLines,
                  placeAlias: place.alias || '',
                  placeQuery: place.name || '',
                  selectedPlaceKey: String(sp.id || '') + '|' + String(sp.name || '') + '|' + String(sp.lat || '') + '|' + String(sp.lng || ''),
                  placeCategoryId: catId,
                  placeVisitStatus: visit
                });
              },
              onDelete: () => {
                onRequestConfirm('장소 삭제', `"${place.alias || place.name}" 장소를 이 날짜에서 해제하시겠습니까?`, async () => {
                  setIsSavingPlace(true);
                  try {
                    const targetNorm = normalizePlaceDateForSort(dateStr) || dateStr;
                    let nextVisitDate = place.visitDate || '';
                    if (nextVisitDate === dateStr || normalizePlaceDateForSort(nextVisitDate) === targetNorm) nextVisitDate = '';
                    let nextMemo = String(place.memo || '');
                    const entries = parseVisitEntriesFromMemo(nextMemo);
                    if (entries.length >= 2) {
                      nextMemo = entries
                        .filter(en => normalizePlaceDateForSort(en.date) !== targetNorm)
                        .map(en => en.note ? `${en.date} ${en.note}` : en.date)
                        .join(' / ');
                    } else {
                      const leading = extractLeadingMemoDate(nextMemo);
                      if (leading && normalizePlaceDateForSort(leading) === targetNorm) {
                        nextMemo = nextMemo.replace(/^\s*\d{2,4}[.-]\d{2}[.-]\d{2}\s*/, '').replace(/^\/\s*/, '').trim();
                      }
                    }
                    if (typeof onSavePlace === 'function') {
                      const ok = await Promise.resolve(onSavePlace({
                        id: place.id, name: place.name, alias: place.alias || '',
                        address: place.address || '', lat: place.lat, lng: place.lng,
                        categoryId: place.categoryId || 'etc', memo: nextMemo,
                        visitStatus: place.visitStatus === 'planned' ? 'planned' : 'visited',
                        visitDate: nextVisitDate
                      }));
                      if (ok !== false) {
                        showToast('이 날짜에서 장소가 해제되었습니다.', 'success');
                        if (editingLinkedPlaceId === place.id) {
                          setEditingLinkedPlaceId(null); setSelectedPlace(null);
                          setPlaceQuery(''); setPlaceAlias(''); setPlaceMemo('');
                        }
                      } else if (onDeletePlace) {
                        await Promise.resolve(onDeletePlace(place.id));
                        showToast('장소가 삭제되었습니다.', 'success');
                      }
                    } else if (onDeletePlace) {
                      await Promise.resolve(onDeletePlace(place.id));
                      showToast('장소가 삭제되었습니다.', 'success');
                    }
                  } finally { setIsSavingPlace(false); }
                });
              }
            }))
          );
        }))
      )
    ),

    /* Tab 3 Content: 정산 */
    activeTab === 'settlement' && /*#__PURE__*/React.createElement(React.Fragment, null,
      /* Profit/Loss Info Badge */
      /*#__PURE__*/React.createElement("div", {
        style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderRadius: '12px', border: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-primary)', marginBottom: '12px' }
      },
        /*#__PURE__*/React.createElement("span", { style: { fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' } }, "총 정산 요약"),
        (() => {
          const hasSettlementData = expenses.length > 0;
          const netAmount = -expenseTotal;
          const isNegative = netAmount < 0;
          return /*#__PURE__*/React.createElement("span", {
            style: {
              fontSize: '0.78rem',
              fontWeight: 600,
              padding: '3px 9px',
              borderRadius: '999px',
              whiteSpace: 'nowrap',
              backgroundColor: !hasSettlementData ? 'var(--bg-card)' : isNegative ? '#FEF2F2' : '#F0FDF4',
              border: `1px solid ${!hasSettlementData ? 'var(--border-subtle)' : isNegative ? '#FCA5A5' : '#BBF7D0'}`,
              color: !hasSettlementData ? 'var(--text-muted)' : isNegative ? '#DC2626' : '#16A34A'
            }
          }, hasSettlementData ? `${isNegative ? '-' : '+'}${Math.abs(netAmount).toLocaleString()}원` : '없음');
        })()
      ),

      /* Input Forms */
      !adminMode && /*#__PURE__*/React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: '12px' } },
        /*#__PURE__*/React.createElement("div", null,
          /*#__PURE__*/React.createElement("label", {
            style: { display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }
          }, "구분 / 카테고리"),
          /*#__PURE__*/React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '8px' } },
            /*#__PURE__*/React.createElement(SegmentedToggle, {
              ariaLabel: "수입/지출 전환",
              disabled: isSavingExpense,
              value: expenseIsIncome ? 'income' : 'expense',
              onChange: v => setExpenseIsIncome(v === 'income'),
              options: [
                { value: 'income', label: '+ 수입', activeColor: '#16A34A' },
                { value: 'expense', label: '- 지출', activeColor: '#DC2626' }
              ]
            }),
            !expenseIsIncome && /*#__PURE__*/React.createElement(SimpleBottomSheetPicker, {
              title: "지출 카테고리 선택",
              placeholder: "지출 카테고리 선택",
              value: expenseCategoryInput,
              disabled: isSavingExpense,
              onSelect: setExpenseCategoryInput,
              options: expenseCategories.map(category => ({
                value: category.id,
                label: getExpenseCategoryLabel(category)
              })),
              style: { flex: '1 1 0%', minWidth: 0, height: '42px' }
            })
          )
        ),
        /*#__PURE__*/React.createElement("div", null,
          /*#__PURE__*/React.createElement("label", {
            style: { display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }
          }, expenseIsIncome ? "수입 명목" : "지출 명목"),
          /*#__PURE__*/React.createElement("input", {
            type: "text",
            className: "form-input",
            style: { width: '100%' },
            placeholder: expenseIsIncome ? "수입명목 (예: 회비 입금, URL 첨부 가능)" : "지출명목 (예: 식당 예약금, URL 첨부 가능)",
            maxLength: 220,
            value: expenseLabelInput,
            disabled: isSavingExpense,
            onChange: e => setExpenseLabelInput(e.target.value)
          })
        ),
        /*#__PURE__*/React.createElement("div", null,
          /*#__PURE__*/React.createElement("label", {
            style: { display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }
          }, expenseIsIncome ? "수입 금액" : "지출 금액"),
          /*#__PURE__*/React.createElement("div", { className: "date-modal-field-with-actions", style: { display: 'flex', gap: '8px' } },
          /*#__PURE__*/React.createElement("input", {
            type: "text",
            className: "form-input",
            style: { flex: '1 1 0%', minWidth: 0 },
            placeholder: expenseIsIncome ? "수입금액 (원)" : "지출금액 (원)",
            value: expenseAmountInput,
            disabled: isSavingExpense,
            onChange: e => {
              const digits = e.target.value.replace(/[^0-9]/g, '');
              const formatted = digits ? Number(digits).toLocaleString() : '';
              setExpenseAmountInput(formatted ? `${expenseIsIncome ? '+' : '-'}${formatted}` : '');
            }
          }),
          /*#__PURE__*/React.createElement("div", { className: "date-modal-field-actions" },
          /*#__PURE__*/React.createElement(FormAddEditActionButtons, {
            isEditing: !!editingExpenseId,
            isSaving: isSavingExpense,
            onCancel: () => {
              setEditingExpenseId(null);
              setExpenseLabelInput('');
              setExpenseAmountInput('');
              setExpenseIsIncome(false);
            },
            onSubmit: handleSaveExpenseClick
          })
          )
          )
        )
      ),

      /* Expenses list */
      expenses.length > 0 && /*#__PURE__*/React.createElement("div", {
        className: "date-modal-settlement-list",
        style: {
          display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px',
          flex: '1 1 auto', minHeight: '80px', overflow: 'visible'
        }
      },
        expenses.map(expense => {
          const { time: expenseTime, rest: expenseLabel } = extractExpenseTimePrefix(getExpenseLabel(expense));
          const expenseUrl = getExpenseUrl(expense);
          const expenseCategory = getDisplayExpenseCategory(calendar, expense) || { id: 'etc', name: '기타', color: 'var(--text-muted)' };
          const categoryColor = expenseCategory.color || '#64748B';
          const categoryName = expenseCategory.name || '기타';
          return /*#__PURE__*/React.createElement("div", {
            key: expense.id,
            "data-expense-id": expense.id,
            className: `expense-sortable-row poll-sortable-row${draggingExpenseId === expense.id ? ' is-dragging' : ''}${dragOverExpenseId === expense.id ? ' is-drop-target' : ''}`,
            onClick: () => handleExpenseItemClick(expense),
            onDragOver: event => {
              event.preventDefault();
              event.dataTransfer.dropEffect = 'move';
              if (draggingExpenseId && draggingExpenseId !== expense.id) setDragOverExpenseId(expense.id);
            },
            onDragEnter: event => {
              event.preventDefault();
              if (draggingExpenseId && draggingExpenseId !== expense.id) setDragOverExpenseId(expense.id);
            },
            onDragLeave: event => {
              if (!event.currentTarget.contains(event.relatedTarget)) setDragOverExpenseId('');
            },
            onDrop: event => {
              event.preventDefault();
              event.stopPropagation();
              const sourceId = event.dataTransfer.getData('text/plain') || draggingExpenseId;
              moveExpense(sourceId, expense.id);
              setDraggingExpenseId('');
              setDragOverExpenseId('');
            },
            onDragEnd: resetExpensePointerSort,
            style: {
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              padding: '12px 48px 12px 12px',
              position: 'relative',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderColor: editingExpenseId === expense.id ? 'var(--accent-primary)' : (dragOverExpenseId === expense.id ? 'var(--accent-primary)' : 'var(--border-subtle)'),
              borderRadius: '12px',
              cursor: 'pointer',
              boxSizing: 'border-box'
            }
          },
            /*#__PURE__*/React.createElement("div", {
              className: "expense-row-actions",
              style: { position: 'absolute', top: '10px', right: '10px', display: 'flex', alignItems: 'center', gap: '6px' }
            },
              expenses.length > 1 && /*#__PURE__*/React.createElement("button", {
                type: "button",
                className: "poll-drag-handle",
                disabled: isSavingExpense,
                title: "드래그하여 순서 변경",
                style: {
                  width: '22px', height: '22px', border: '1px solid var(--border-subtle)',
                  backgroundColor: 'var(--bg-card)', borderRadius: '6px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'grab', padding: 0, color: 'var(--text-muted)',
                  touchAction: 'none', userSelect: 'none'
                },
                onClick: event => { event.preventDefault(); event.stopPropagation(); },
                onPointerDown: event => beginExpensePointerSort(event, expense.id)
              }, /*#__PURE__*/React.createElement(LineHeightIcon, { size: 12 })),
              /*#__PURE__*/React.createElement("button", {
                type: "button",
                className: "expense-row-delete-btn",
                title: "삭제",
                "aria-label": "삭제",
                style: {
                  width: '22px',
                  height: '22px',
                  border: 'none',
                  background: 'none',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  padding: 0,
                  color: 'var(--text-muted)'
                },
                onClick: event => handleDeleteExpenseClick(event, expense.id)
              }, /*#__PURE__*/React.createElement(SmallXIcon, { size: 14 }))
            ),
            /*#__PURE__*/React.createElement("div", { style: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px', minWidth: 0 } },
              /*#__PURE__*/React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' } },
                /*#__PURE__*/React.createElement("span", {
                  style: {
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '3px 8px',
                    borderRadius: '999px',
                    backgroundColor: `${categoryColor}18`,
                    color: categoryColor,
                    fontSize: '0.68rem',
                    fontWeight: 900
                  }
                }, getExpenseCategoryIcon(expenseCategory), getExpenseCategoryIcon(expenseCategory) ? '\u00A0' : '', categoryName),
                expenseTime && /*#__PURE__*/React.createElement("span", {
                  style: {
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '3px 8px',
                    borderRadius: '999px',
                    backgroundColor: 'rgba(79, 70, 229, 0.08)',
                    color: '#4F46E5',
                    fontSize: '0.68rem',
                    fontWeight: 'bold'
                  }
                }, expenseTime)
              ),
              /*#__PURE__*/React.createElement("div", { style: { fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap', width: '100%', wordBreak: 'break-all' } },
                expenseUrl ? /*#__PURE__*/React.createElement(React.Fragment, null,
                  expenseLabel,
                  /*#__PURE__*/React.createElement(UrlCapsuleBadge, { url: expenseUrl })
                ) : expenseLabel
              ),
              /*#__PURE__*/React.createElement("div", { style: { fontSize: '0.9rem', fontWeight: 900, color: Number(expense.amount) < 0 ? '#16A34A' : '#DC2626' } },
                `${Number(expense.amount) < 0 ? '+' : '-'}${Math.abs(Number(expense.amount)).toLocaleString()}원`
              )
            )
          );
        })
      )
    ),

    /* Tab 4 Content: 사진 */
    activeTab === 'photos' && /*#__PURE__*/React.createElement(React.Fragment, null,
      /*#__PURE__*/React.createElement("div", {
        style: { display: 'flex', flexDirection: 'column', gap: '8px' }
      },
        /*#__PURE__*/React.createElement("input", {
          ref: meetingPhotoInputRef,
          type: "file",
          accept: "image/*",
          multiple: true,
          onChange: handleMeetingPhotoFiles,
          style: { display: 'none' }
        }),
        /*#__PURE__*/React.createElement("div", {
          style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }
        },
          /*#__PURE__*/React.createElement("label", {
            style: { fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-muted)' }
          }, `일정 사진 (${meetingPhotos.length}장)`),
          !adminMode && /*#__PURE__*/React.createElement("button", {
            type: "button",
            className: "btn btn-action btn-action-dark",
            disabled: isSavingMeetingPhotos,
            onClick: () => meetingPhotoInputRef.current && meetingPhotoInputRef.current.click(),
            style: {
              height: '36px',
              padding: '0 12px',
              borderRadius: '10px',
              fontSize: '0.78rem',
              fontWeight: 900,
              cursor: isSavingMeetingPhotos ? 'wait' : 'pointer'
            }
          }, isSavingMeetingPhotos ? "업로드 중..." : "사진 추가")
        ),
        meetingPhotos.length === 0 ? /*#__PURE__*/React.createElement("div", {
          style: { textAlign: 'center', color: 'var(--text-muted)', padding: '22px 0', fontSize: '0.82rem', border: '1px dashed var(--border-subtle)', borderRadius: '12px' }
        }, "이 일정에 첨부된 사진이 없습니다.") : /*#__PURE__*/React.createElement("div", {
          style: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(72px, 1fr))',
            gap: '8px'
          }
        }, meetingPhotos.map((photo, index) => /*#__PURE__*/React.createElement("div", {
          key: photo.id || `${photo.imageUrl}_${index}`,
          style: { position: 'relative', minWidth: 0 }
        },
          /*#__PURE__*/React.createElement("img", {
            src: photo.thumbUrl || photo.imageUrl,
            alt: "일정 사진",
            loading: "lazy",
            decoding: "async",
            referrerPolicy: "no-referrer",
            onClick: () => {
              if (typeof setActiveLightbox !== 'function') {
                const url = photo.imageUrl || photo.thumbUrl;
                if (url) window.open(url, '_blank', 'noopener,noreferrer');
                return;
              }
              setActiveLightbox({
                urls: meetingPhotos.map(p => p.imageUrl || p.thumbUrl),
                index: index,
                meta: meetingPhotos.map(p => ({
                  timestamp: Number(p.createdAt || p.updatedAt || 0),
                  thumb: p.thumbUrl || p.imageUrl,
                  tags: String(p.tags || ''),
                  source: 'meeting',
                  meetingDate: dateStr,
                  photoId: p.id || '',
                  sourceMessageId: p.sourceMessageId || '',
                  sourceImageIndex: Number.isInteger(p.sourceImageIndex) ? p.sourceImageIndex : null
                }))
              });
            },
            style: {
              width: '100%',
              aspectRatio: '1 / 1',
              objectFit: 'cover',
              display: 'block',
              borderRadius: '10px',
              backgroundColor: 'var(--bg-primary)',
              cursor: 'pointer'
            }
          })
        )))
      )
    )
  ))));

  // Bottom-sheet rule: never nest under ResizableModalContainer (CSS transform traps fixed).
  const participantSheet = isSheetOpen ? /*#__PURE__*/React.createElement("div", {
    className: "bottom-sheet-overlay",
    style: { zIndex: 20050 },
    onClick: () => setIsSheetOpen(false)
  }, /*#__PURE__*/React.createElement("div", {
    className: "bottom-sheet",
    style: { maxHeight: '70vh' },
    onClick: e => e.stopPropagation()
  },
    /*#__PURE__*/React.createElement("div", { className: "bottom-sheet-header" },
      /*#__PURE__*/React.createElement("h4", null, "참여자 선택"),
      /*#__PURE__*/React.createElement("button", {
        type: "button",
        style: { background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.2rem', cursor: 'pointer' },
        onClick: () => setIsSheetOpen(false)
      }, "✕")
    ),
    /*#__PURE__*/React.createElement("div", { className: "bottom-sheet-body" },
      activeParticipants.map(p => /*#__PURE__*/React.createElement("button", {
        key: p.id,
        type: "button",
        className: "bottom-sheet-item",
        disabled: isSubmitting,
        onClick: () => {
          if (isSubmitting) return;
          markDirty();
          setParticipantId(p.id);
          setNote(getExistingNoteForParticipant(p.id));
          setIsSheetOpen(false);
        }
      }, /*#__PURE__*/React.createElement("span", {
        className: "color-dot",
        style: { backgroundColor: p.color, width: '12px', height: '12px' }
      }), /*#__PURE__*/React.createElement("span", { style: { fontWeight: 700 } }, p.name)))
    )
  )) : null;

  const portaled = /*#__PURE__*/React.createElement(React.Fragment, null, portalContent, participantSheet);
  return typeof document !== 'undefined' && ReactDOM.createPortal
    ? ReactDOM.createPortal(portaled, document.body)
    : portaled;
}

  if (typeof window !== 'undefined') {
  window.GATHER_UI_COMPONENTS = Object.assign({}, window.GATHER_UI_COMPONENTS || {}, {
    DateModal: DateModal,
  });
}
