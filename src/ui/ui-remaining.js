/**
 * Direct media, deadline picker, places section, image URL (P4-21)
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
function getDirectMediaTagsForUrl(...args) {
  const f = __gatherUiDeps().getDirectMediaTagsForUrl || GATHER_APP_UTILS.getDirectMediaTagsForUrl;
  return typeof f === 'function' ? f(...args) : '';
}
function extractDirectImageUrls(...args) {
  const f = __gatherUiDeps().extractDirectImageUrls || GATHER_APP_UTILS.extractDirectImageUrls;
  return typeof f === 'function' ? f(...args) : [];
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


export function DirectChatMediaText({ text, searchQuery = '', setActiveLightbox, linkPreview, style = {}, message = null, stickyVideoKey = null, onActivateVideo = null, textMaxWidth = null }) {
  const React = window.React;
  const __deps = window.GATHER_UI_DEPS || {};
  const __comp = window.GATHER_UI_COMPONENTS || {};
  const LinkPreviewCard = __comp.LinkPreviewCard || __deps.LinkPreviewCard;
  const TikTokEmbedWidget = __comp.TikTokEmbedWidget || __deps.TikTokEmbedWidget;
  const extractFirstUrl = __deps.extractFirstUrl;

  const firstUrl = extractFirstUrl(text);
  const mediaInfo = getDirectChatMediaInfo(firstUrl);
  const [failed, setFailed] = React.useState(false);
  React.useEffect(() => {
    setFailed(false);
  }, [firstUrl]);
  // Several pasted image links (not an actual upload) shown as a thumbnail grid, same as a real
  // multi-image message -- see extractDirectImageUrls. Computed unconditionally every render like
  // the hooks around it so this component's hook order never changes; the multi-image early
  // return below happens after all hooks have run.
  const directImageUrls = React.useMemo(() => extractDirectImageUrls(text), [text]);

  // Detects which embed the user actually pressed play on, so it can be promoted to the single
  // persistent player (see PersistentVideoPlayer/StickyVideoBox) that survives view/tab switches
  // without ever unmounting -- that's what makes playback genuinely uninterrupted rather than
  // just restarted in a new iframe elsewhere. Clicks inside a cross-origin iframe never bubble
  // out to this parent div, so a plain onClick handler can't see them; a window 'blur' event
  // fires when focus moves INTO the iframe (e.g. the user hit play), and document.activeElement
  // then correctly identifies which of possibly many embeds in the chat history received it.
  const embedIframeRef = React.useRef(null);
  const isEmbedVideo = mediaInfo && mediaInfo.type === 'embed';
  React.useEffect(() => {
    if (!isEmbedVideo || !onActivateVideo) return undefined;
    const handleWindowBlur = () => {
      if (document.activeElement === embedIframeRef.current) {
        onActivateVideo({
          key: message ? message.id : null,
          embedUrl: mediaInfo.url,
          provider: mediaInfo.provider,
          orientation: mediaInfo.orientation,
          title: mediaInfo.provider === 'youtube' ? 'YouTube 영상' : mediaInfo.provider === 'vimeo' ? 'Vimeo 영상' : '링크 영상'
        });
      }
    };
    window.addEventListener('blur', handleWindowBlur);
    return () => window.removeEventListener('blur', handleWindowBlur);
  }, [isEmbedVideo, onActivateVideo, mediaInfo && mediaInfo.url, message && message.id]);
  // While this message owns the active/persistent video, it doesn't render its own iframe at all
  // -- the persistent player (StickyVideoBox, mounted once at the app root) already has the same
  // iframe playing in its own floating PIP, so this just shows a placeholder instead of a second,
  // competing iframe for the same video (see the isThisSticky branch below).
  const isThisSticky = isEmbedVideo && stickyVideoKey && message && message.id === stickyVideoKey;

  if (directImageUrls.length >= 2) {
    const urls = directImageUrls.map(info => info.url);
    const meta = directImageUrls.map((info, idx) => ({
      timestamp: message?.timestamp || Date.now(),
      messageId: message?.id || '',
      imageIndex: idx,
      thumb: info.url,
      directMediaUrl: info.url,
      // Without this, reopening the Lightbox on a multi-image-link message always showed blank
      // tags regardless of what was actually saved -- getMessageDirectMediaEntry (the single-
      // embedded-image case) already does this the same way.
      tags: message ? getDirectMediaTagsForUrl(message, info.url) : ''
    }));
    let remainingText = text;
    directImageUrls.forEach(info => { remainingText = remainingText.split(info.raw).join(''); });
    remainingText = remainingText.replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
    // Same multi-image grid layout as renderChatMessageImages' multi-image branch (app-main.js) --
    // deliberately duplicated rather than shared since that one reads from getMessageImageEntries
    // (actual uploads) while this reads from plain URLs pulled out of the text.
    const mobileCols = urls.length === 2 ? 2 : 3;
    const isMobile = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(max-width: 640px)').matches;
    const activeCols = isMobile ? mobileCols : (urls.length >= 12 ? 6 : urls.length >= 5 ? 5 : mobileCols);
    // Plain length, not wrapped in min(100%, ...) -- see computeChatImageGridMaxWidth in
    // app-main.js for why: paired with width:'100%' below, that's already enough to shrink this
    // safely on a narrow viewport, and min()+percentage here actively breaks the ancestor
    // bubble's own fit-content sizing (verified via isolated repro).
    const maxW = isMobile ? '280px' : `calc(${activeCols} * 76px + (${activeCols} - 1) * 4px)`;
    return /*#__PURE__*/React.createElement(React.Fragment, null,
      /*#__PURE__*/React.createElement('div', {
        className: `chat-message-image-grid${urls.length >= 5 ? ' is-wide' : ''}`,
        style: { width: '100%', maxWidth: maxW, boxSizing: 'border-box', marginBottom: remainingText ? '8px' : (style.marginBottom || '0') }
      }, /*#__PURE__*/React.createElement('div', {
        style: { display: 'grid', gridTemplateColumns: `repeat(${activeCols}, minmax(0, 1fr))`, gap: '4px', width: '100%', maxWidth: '100%', boxSizing: 'border-box' }
      }, urls.map((url, idx) => /*#__PURE__*/React.createElement('img', {
        key: idx,
        src: url,
        alt: `링크 이미지 ${idx + 1}`,
        loading: 'lazy',
        decoding: 'async',
        referrerPolicy: 'no-referrer',
        onClick: () => setActiveLightbox && setActiveLightbox({ urls, index: idx, meta }),
        style: { display: 'block', width: '100%', aspectRatio: '1', borderRadius: '6px', cursor: setActiveLightbox ? 'pointer' : 'default', objectFit: 'cover' }
      })))),
      // Capped to the same maxW as the grid above -- a fit-content chat bubble sizes itself to
      // whichever child is widest, so an uncapped caption longer than the grid would stretch the
      // bubble past it, leaving a gap to the grid's right (see computeChatImageGridMaxWidth in
      // app-main.js, whose real-upload counterpart needs the identical fix for the same reason).
      remainingText ? /*#__PURE__*/React.createElement('div', {
        style: { maxWidth: maxW, width: '100%', boxSizing: 'border-box' }
      }, parseTextWithLinks(remainingText, searchQuery)) : null
    );
  }

  if (!mediaInfo || failed) {
    const textNode = text ? parseTextWithLinks(text, searchQuery) : null;
    // textMaxWidth (grid caption case, see above) takes priority when both apply. Otherwise, if
    // this text contains a URL, cap it to the same width LinkPreviewCard below uses (whether or
    // not that card actually ends up rendering -- it may still be loading, or fail to fetch a
    // preview at all). Pasted links are often padded with long tracking query strings that, left
    // unbounded, are literally the ONE piece of content wide enough to force this fit-content
    // bubble out to its absolute max width -- verified by measuring rendered widths in an
    // isolated repro: an unbounded 140-char tracking URL alone stretched the bubble ~400px wider
    // than the card sitting next to it, while wrapping the same URL at the card's own width
    // closed that gap to a few px. overflow-wrap:break-word is already inherited from the bubble,
    // so it wraps here instead of overflowing; the link stays fully visible and clickable either
    // way, unlike hiding it outright (which would leave nothing clickable if the card fails).
    // Plain length (not min(100%, ...)) for the same reason as computeChatImageGridMaxWidth in
    // app-main.js -- paired with width:'100%' below, that alone is enough to shrink safely on a
    // narrow viewport, and min()+percentage here breaks the ancestor bubble's fit-content sizing.
    const effectiveMaxWidth = textMaxWidth || (firstUrl ? '280px' : null);
    const cappedTextNode = (textNode && effectiveMaxWidth)
      ? /*#__PURE__*/React.createElement('div', {
        style: { maxWidth: effectiveMaxWidth, width: '100%', boxSizing: 'border-box' }
      }, textNode)
      : textNode;
    return /*#__PURE__*/React.createElement(React.Fragment, null,
      cappedTextNode,
      firstUrl && /*#__PURE__*/React.createElement(LinkPreviewCard, {
        url: firstUrl,
        fallbackTitle: text ? removeFirstUrl(text).replace(/\n/g, ' ').replace(/\s+/g, ' ').trim() : '',
        cachedData: linkPreview
      })
    );
  }

  const remainingText = removeFirstUrl(text);
  const maxWidth = style.maxWidth || '320px';
  const maxHeight = style.maxHeight || '240px';
  const marginBottom = remainingText ? '8px' : (style.marginBottom || '0');
  const isPortraitEmbed = mediaInfo.type === 'embed' && mediaInfo.orientation === 'portrait';
  const embedTitleMap = {
    youtube: 'YouTube 영상',
    vimeo: 'Vimeo 영상'
  };
  const commonStyle = {
    display: 'block',
    width: '100%',
    maxWidth: `min(100%, ${maxWidth})`,
    maxHeight,
    borderRadius: '10px',
    backgroundColor: 'var(--bg-primary)',
    objectFit: 'contain',
    marginBottom
  };

  return /*#__PURE__*/React.createElement(React.Fragment, null,
    mediaInfo.type === 'tiktok-widget'
      ? /*#__PURE__*/React.createElement(TikTokEmbedWidget, {
        key: mediaInfo.url,
        url: mediaInfo.url,
        videoId: mediaInfo.videoId,
        onFailed: () => setFailed(true)
      })
      : mediaInfo.type === 'image'
      ? /*#__PURE__*/React.createElement('img', {
        src: mediaInfo.url,
        alt: '링크 이미지',
        loading: 'lazy',
        decoding: 'async',
        referrerPolicy: 'no-referrer',
        onError: () => setFailed(true),
        onClick: () => setActiveLightbox && setActiveLightbox({
          urls: [mediaInfo.url],
          index: 0,
          meta: [{
            timestamp: message?.timestamp || Date.now(),
            messageId: message?.id || '',
            imageIndex: 0,
            thumb: mediaInfo.url,
            tags: message?.directMediaTags || '',
            directMediaUrl: mediaInfo.url
          }]
        }),
        style: { ...commonStyle, cursor: setActiveLightbox ? 'pointer' : 'default' }
      })
      : mediaInfo.type === 'video'
      ? /*#__PURE__*/React.createElement('video', {
        src: mediaInfo.url,
        muted: true,
        autoPlay: true,
        loop: true,
        playsInline: true,
        controls: true,
        preload: 'metadata',
        referrerPolicy: 'no-referrer',
        onError: () => setFailed(true),
        style: commonStyle
      })
      : (() => {
        // Chat-room case uses vw (not %) width: the ancestor chain here (shrink-to-fit flex
        // item, then a plain block) has no definite width, so % would resolve to 'auto' and
        // collapse the <iframe> to 300x150. vw resolves against the viewport directly, also
        // letting bubble/bubble-wrapper shrink-to-fit around it instead of stretching wider and
        // leaving empty space beside it. isMiniChat (dashboard preview) already sits in a
        // definite-size container so it stays %-based. Doubles as the desktop drag-resize handle
        // (.chat-media-resizable in app.css): resize:horizontal grows width, aspect-ratio keeps
        // height proportional for free.
        const isMini = !!style.isMiniChat;
        const embedWidth = isMini ? '100%' : (isPortraitEmbed ? (style.portraitEmbedMaxWidth || '360px') : (style.embedMaxWidth || '760px'));
        const minW = isMini ? '0' : (isPortraitEmbed ? '150px' : '180px');
        const maxW = isMini ? '100%' : (isPortraitEmbed ? '500px' : '1400px');
        // LinkPreviewCard lives INSIDE this width-constrained div, not as a sibling, so it
        // matches the video's rendered width even after a drag-resize via .chat-media-resizable.
        const embedBoxStyle = {
          width: isMini ? `min(100%, ${embedWidth})` : `min(88vw, ${embedWidth})`,
          // maxWidth also clamps to 100% of the bubble now that bubble-wrapper's min-width:0
          // lets it actually shrink -- the vw estimate above is only ever a *starting* size;
          // this is what stops it from overflowing once the real available space is smaller.
          maxWidth: `min(100%, ${maxW})`,
          minWidth: minW,
          margin: '0 auto',
          marginBottom
        };
        // This message owns the active/persistent video -- it doesn't render its own iframe here
        // at all, since the exact same iframe is already playing in StickyVideoBox's floating PIP.
        if (isThisSticky) {
          return /*#__PURE__*/React.createElement('div', {
            style: {
              ...embedBoxStyle,
              aspectRatio: isPortraitEmbed ? '9 / 16' : '16 / 9',
              maxHeight: isPortraitEmbed ? 'min(72vh, 620px)' : 'min(54vh, 430px)',
              borderRadius: '10px',
              backgroundColor: '#000',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'rgba(255, 255, 255, 0.75)',
              fontSize: '0.8rem',
              fontWeight: 800
            }
          }, /*#__PURE__*/React.createElement('span', null, '▶ 미니플레이어(PIP) 재생 중'));
        }
        return /*#__PURE__*/React.createElement('div', {
          className: isMini ? '' : 'chat-media-resizable',
          style: embedBoxStyle
        }, /*#__PURE__*/React.createElement('iframe', {
          ref: embedIframeRef,
          src: mediaInfo.url,
          title: embedTitleMap[mediaInfo.provider] || '링크 영상',
          loading: 'lazy',
          allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share',
          allowFullScreen: true,
          onError: () => setFailed(true),
          style: {
            display: 'block',
            width: '100%',
            aspectRatio: isPortraitEmbed ? '9 / 16' : '16 / 9',
            maxHeight: isPortraitEmbed ? 'min(72vh, 620px)' : 'min(54vh, 430px)',
            border: '0',
            borderRadius: '10px',
            backgroundColor: 'var(--bg-primary)'
          }
        }), /*#__PURE__*/React.createElement(LinkPreviewCard, {
          url: firstUrl,
          fallbackTitle: text ? removeFirstUrl(text).replace(/\n/g, ' ').replace(/\s+/g, ' ').trim() : '',
          cachedData: linkPreview
        }));
      })(),
    remainingText ? /*#__PURE__*/React.createElement('div', null, parseTextWithLinks(remainingText, searchQuery)) : null
  );
}

export function DeadlineDateTimePicker({ value, onChange, disabled, dateOnly = false, placeholder }) {
  const React = window.React;
  const __deps = window.GATHER_UI_DEPS || {};
  const __comp = window.GATHER_UI_COMPONENTS || {};
  const CalendarSearchIcon = __comp.CalendarSearchIcon || __deps.CalendarSearchIcon;

  const [isOpen, setIsOpen] = React.useState(false);
  const now = new Date();
  // dateOnly mode stores/reads plain YYYY-MM-DD (no time component) -- append a fixed local
  // midnight when parsing so Date() doesn't interpret the bare date string as UTC (see
  // isValidDateString's "always UTC" comment elsewhere in this file for the same pitfall).
  const parsed = value ? new Date(dateOnly ? `${value}T00:00` : value) : null;
  const isValid = parsed && !Number.isNaN(parsed.getTime());
  const [pYear, setPYear] = React.useState(isValid ? parsed.getFullYear() : now.getFullYear());
  const [pMonth, setPMonth] = React.useState(isValid ? parsed.getMonth() : now.getMonth());
  const [pDay, setPDay] = React.useState(isValid ? parsed.getDate() : now.getDate());
  const [pTime, setPTime] = React.useState(isValid && !dateOnly ? value.slice(11, 16) : '23:59');

  const openPicker = () => {
    const d = value ? new Date(dateOnly ? `${value}T00:00` : value) : null;
    const v = d && !Number.isNaN(d.getTime());
    setPYear(v ? d.getFullYear() : now.getFullYear());
    setPMonth(v ? d.getMonth() : now.getMonth());
    setPDay(v ? d.getDate() : now.getDate());
    if (!dateOnly) setPTime(v ? value.slice(11, 16) : '23:59');
    setIsOpen(true);
  };

  const daysInMonth = new Date(pYear, pMonth + 1, 0).getDate();
  const firstWeekday = new Date(pYear, pMonth, 1).getDay();

  const handleApply = () => {
    const mm = String(pMonth + 1).padStart(2, '0');
    const dd = String(pDay).padStart(2, '0');
    onChange(dateOnly ? `${pYear}-${mm}-${dd}` : `${pYear}-${mm}-${dd}T${pTime}`);
    setIsOpen(false);
  };

  const displayText = isValid
    ? dateOnly
      ? `${parsed.getFullYear()}.${String(parsed.getMonth() + 1).padStart(2, '0')}.${String(parsed.getDate()).padStart(2, '0')}`
      : `${parsed.getFullYear()}.${String(parsed.getMonth() + 1).padStart(2, '0')}.${String(parsed.getDate()).padStart(2, '0')} ${value.slice(11, 16)}`
    : (placeholder || (dateOnly ? '날짜 선택' : '날짜/시간 선택'));

  return /*#__PURE__*/React.createElement('div', { style: { position: 'relative' } },
    /*#__PURE__*/React.createElement('button', {
      type: 'button',
      className: 'form-select',
      disabled,
      style: { width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', cursor: disabled ? 'default' : 'pointer', textAlign: 'left' },
      onClick: openPicker
    },
      /*#__PURE__*/React.createElement('span', { style: { minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, displayText),
      dateOnly && /*#__PURE__*/React.createElement(CalendarSearchIcon, { size: 18 })
    ),
    (() => {
      const sheet = isOpen && /*#__PURE__*/React.createElement('div', {
        className: 'bottom-sheet-overlay',
        onClick: () => setIsOpen(false)
      }, /*#__PURE__*/React.createElement('div', {
        className: 'bottom-sheet',
        onClick: e => e.stopPropagation()
      },
        /*#__PURE__*/React.createElement('div', { className: 'bottom-sheet-header' },
          /*#__PURE__*/React.createElement('h4', null, dateOnly ? '날짜 선택' : '날짜/시간 선택'),
          /*#__PURE__*/React.createElement('button', {
            type: 'button',
            style: { background: 'none', border: 'none', color: '#64748B', fontSize: '1.2rem', cursor: 'pointer' },
            onClick: () => setIsOpen(false)
          }, '✕')
        ),
        /*#__PURE__*/React.createElement('div', { className: 'bottom-sheet-body' },
          /*#__PURE__*/React.createElement('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '12px' } },
            /*#__PURE__*/React.createElement('button', { type: 'button', className: 'btn btn-secondary', style: { padding: '4px 10px', fontSize: '0.85rem' }, onClick: () => setPYear(y => y - 1) }, '◀'),
            /*#__PURE__*/React.createElement('span', { style: { fontWeight: 800, fontSize: '1rem', minWidth: '60px', textAlign: 'center' } }, `${pYear}년`),
            /*#__PURE__*/React.createElement('button', { type: 'button', className: 'btn btn-secondary', style: { padding: '4px 10px', fontSize: '0.85rem' }, onClick: () => setPYear(y => y + 1) }, '▶')
          ),
          /*#__PURE__*/React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', marginBottom: '12px' } },
            DEADLINE_PICKER_MONTH_NAMES.map((name, idx) => /*#__PURE__*/React.createElement('button', {
              key: idx, type: 'button',
              onClick: () => {
                setPMonth(idx);
                const dim = new Date(pYear, idx + 1, 0).getDate();
                if (pDay > dim) setPDay(dim);
              },
              style: {
                padding: '6px 4px', borderRadius: '8px',
                border: pMonth === idx ? '2px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                background: pMonth === idx ? 'rgba(99, 102, 241, 0.15)' : 'var(--bg-card)',
                color: pMonth === idx ? 'var(--accent-primary)' : 'var(--text-main)',
                fontWeight: pMonth === idx ? 800 : 500, fontSize: '0.8rem', cursor: 'pointer'
              }
            }, name))
          ),
          /*#__PURE__*/React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '4px' } },
            ['일', '월', '화', '수', '목', '금', '토'].map(w => /*#__PURE__*/React.createElement('div', {
              key: w, style: { textAlign: 'center', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)' }
            }, w))
          ),
          /*#__PURE__*/React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '14px' } },
            Array.from({ length: firstWeekday }).map((_, i) => /*#__PURE__*/React.createElement('div', { key: `blank-${i}` })),
            Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const isSelected = pDay === day;
              return /*#__PURE__*/React.createElement('button', {
                key: day, type: 'button', onClick: () => setPDay(day),
                style: {
                  padding: '6px 0', borderRadius: '8px',
                  border: isSelected ? '2px solid var(--accent-primary)' : '1px solid transparent',
                  background: isSelected ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                  color: isSelected ? 'var(--accent-primary)' : 'var(--text-main)',
                  fontWeight: isSelected ? 800 : 500, fontSize: '0.8rem', cursor: 'pointer'
                }
              }, day);
            })
          ),
          !dateOnly && /*#__PURE__*/React.createElement('div', { style: { marginBottom: '14px' } },
            /*#__PURE__*/React.createElement('label', { style: { fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' } }, '시간'),
            /*#__PURE__*/React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '8px' } },
              /*#__PURE__*/React.createElement('input', {
                type: 'number', className: 'form-input', style: { flex: '1 1 0%', minWidth: 0, textAlign: 'center' },
                min: 0, max: 23, value: Number(pTime.slice(0, 2)),
                onChange: e => {
                  const h = Math.min(23, Math.max(0, Number(e.target.value) || 0));
                  setPTime(`${String(h).padStart(2, '0')}:${pTime.slice(3, 5)}`);
                }
              }),
              /*#__PURE__*/React.createElement('span', { style: { fontWeight: 800, color: 'var(--text-muted)' } }, ':'),
              /*#__PURE__*/React.createElement('input', {
                type: 'number', className: 'form-input', style: { flex: '1 1 0%', minWidth: 0, textAlign: 'center' },
                min: 0, max: 59, value: Number(pTime.slice(3, 5)),
                onChange: e => {
                  const m = Math.min(59, Math.max(0, Number(e.target.value) || 0));
                  setPTime(`${pTime.slice(0, 2)}:${String(m).padStart(2, '0')}`);
                }
              })
            )
          ),
          /*#__PURE__*/React.createElement('button', {
            type: 'button', className: 'btn btn-primary', style: { width: '100%' }, onClick: handleApply
          }, '선택 완료')
        )
      ));
      return sheet && typeof document !== 'undefined' && ReactDOM.createPortal ? ReactDOM.createPortal(sheet, document.body) : sheet;
    })()
  );
}

export function PlacesSection({ calendar, onViewAll }) {
  const React = window.React;
  const __deps = window.GATHER_UI_DEPS || {};
  const __comp = window.GATHER_UI_COMPONENTS || {};
  const PlaceMapView = __comp.PlaceMapView || __deps.PlaceMapView;
  const PlaceSectionIcon = __comp.PlaceSectionIcon || __deps.PlaceSectionIcon;
  const SectionCountBadge = __comp.SectionCountBadge || __deps.SectionCountBadge;
  const SectionToggleButton = __comp.SectionToggleButton || __deps.SectionToggleButton;
  const getCalendarPlaces = __deps.getCalendarPlaces;

  const [collapsed, setCollapsed] = React.useState(false);
  const [mapShouldMount, setMapShouldMount] = React.useState(false);
  const mapHostRef = React.useRef(null);
  const places = getCalendarPlaces(calendar);

  React.useEffect(() => {
    if (collapsed || mapShouldMount) return undefined;
    const el = mapHostRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      const t = setTimeout(() => setMapShouldMount(true), 400);
      return () => clearTimeout(t);
    }
    let done = false;
    const io = new IntersectionObserver((entries) => {
      if (done) return;
      if (entries.some(e => e.isIntersecting || (e.intersectionRatio || 0) > 0)) {
        done = true;
        setMapShouldMount(true);
        io.disconnect();
      }
    }, { root: null, rootMargin: '160px 0px', threshold: 0.01 });
    io.observe(el);
    let idleId = null, idleTimer = null;
    if (typeof window !== 'undefined' && typeof window.requestIdleCallback === 'function') {
      idleId = window.requestIdleCallback(() => {
        if (!done) { done = true; setMapShouldMount(true); io.disconnect(); }
      }, { timeout: 2500 });
    } else {
      idleTimer = setTimeout(() => {
        if (!done) { done = true; setMapShouldMount(true); io.disconnect(); }
      }, 2000);
    }
    return () => {
      io.disconnect();
      if (idleId != null && typeof window.cancelIdleCallback === 'function') window.cancelIdleCallback(idleId);
      if (idleTimer) clearTimeout(idleTimer);
    };
  }, [collapsed, mapShouldMount]);

  return /*#__PURE__*/React.createElement("section", { className: "summary-card" },
    /*#__PURE__*/React.createElement("div", {
      className: `summary-title${collapsed ? ' is-collapsed' : ''}`,
      style: { display: 'flex', alignItems: 'center', gap: '6px', width: '100%', color: '#2563EB' }
    },
      /*#__PURE__*/React.createElement("div", {
        style: { display: 'flex', alignItems: 'center', gap: '6px', flex: 1, minWidth: 0, color: '#2563EB' }
      },
        /*#__PURE__*/React.createElement(PlaceSectionIcon, null),
        /*#__PURE__*/React.createElement("span", null, "장소"),
        places.length > 0 && /*#__PURE__*/React.createElement(SectionCountBadge, { count: places.length })
      ),
      /*#__PURE__*/React.createElement("div", {
        style: { marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '2px', flexShrink: 0 }
      },
        /*#__PURE__*/React.createElement("button", {
          type: "button",
          onClick: onViewAll,
          style: { background: 'none', border: 'none', color: '#3B82F6', fontSize: '0.78rem', fontWeight: 800, cursor: 'pointer', padding: '4px 6px' }
        }, "전체보기"),
        /*#__PURE__*/React.createElement(SectionToggleButton, {
          collapsed,
          onToggle: () => setCollapsed(prev => !prev),
          label: collapsed ? '지도 펼치기' : '지도 접기'
        })
      )
    ),
    !collapsed && /*#__PURE__*/React.createElement("div", {
      ref: mapHostRef,
      style: {
        position: 'relative', width: '100%', aspectRatio: '4 / 3',
        borderRadius: 'var(--radius-sm)', overflow: 'hidden', marginTop: '12px',
        backgroundColor: 'color-mix(in srgb, var(--bg-primary) 92%, #94a3b8)'
      }
    },
      mapShouldMount
        ? /*#__PURE__*/React.createElement(PlaceMapView, {
            places, calendar, resizeSignal: collapsed, preferDomesticBounds: true
          })
        : /*#__PURE__*/React.createElement("div", {
            style: {
              position: 'absolute', inset: 0, display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700,
              color: 'var(--text-muted)', letterSpacing: '-0.02em'
            }
          }, "지도 준비 중…"),
      places.length > 0 && /*#__PURE__*/React.createElement("button", {
        type: "button", onClick: onViewAll,
        style: {
          position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 500, width: '100%',
          backgroundColor: 'color-mix(in srgb, var(--bg-primary) 96%, black)',
          border: 'none', borderRadius: '0 0 8px 8px', padding: '8px 0',
          fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-main)',
          cursor: 'pointer', textAlign: 'center'
        }
      }, "장소 더보기")
    )
  );
}

export function ImageUrlModal({ imageUrl, onClose, showToast, onEnsureShareUrl }) {
  const React = window.React;
  const __deps = window.GATHER_UI_DEPS || {};
  const __comp = window.GATHER_UI_COMPONENTS || {};
  const ResizableModalContainer = __comp.ResizableModalContainer || __deps.ResizableModalContainer;
  const SmallXIcon = __comp.SmallXIcon || __deps.SmallXIcon;

  const [resolvedUrl, setResolvedUrl] = React.useState(imageUrl || '');
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [errorText, setErrorText] = React.useState('');
  const isInlineImageUrl = typeof resolvedUrl === 'string' && resolvedUrl.startsWith('data:');
  const isShareableUrl = /^https?:\/\//.test(resolvedUrl || '');
  // onEnsureShareUrl is a fresh closure on every Lightbox render (it isn't memoized, since it
  // closes over meta/index/onPromoteImageUrl), so keeping it out of the effect's dependency
  // array -- and reading the latest version through a ref instead -- keeps an unrelated parent
  // re-render (e.g. chat messages updating, image dimensions loading) from cancelling and
  // restarting an in-flight share-URL generation before it can resolve.
  const onEnsureShareUrlRef = React.useRef(onEnsureShareUrl);
  onEnsureShareUrlRef.current = onEnsureShareUrl;
  React.useEffect(() => {
    let cancelled = false;
    setResolvedUrl(imageUrl || '');
    setErrorText('');
    if (typeof imageUrl !== 'string' || !imageUrl.startsWith('data:') || typeof onEnsureShareUrlRef.current !== 'function') return;
    setIsGenerating(true);
    Promise.resolve(onEnsureShareUrlRef.current(imageUrl)).then(result => {
      if (cancelled) return;
      const nextUrl = typeof result === 'string' ? result : result?.shareUrl;
      if (nextUrl && /^https?:\/\//.test(nextUrl)) {
        setResolvedUrl(nextUrl);
      } else {
        setErrorText('공유 URL 생성 실패');
      }
    }).catch(err => {
      console.error('Image share URL generation failed:', err);
      if (!cancelled) setErrorText('공유 URL 생성 실패');
    }).finally(() => {
      if (!cancelled) setIsGenerating(false);
    });
    return () => { cancelled = true; };
  }, [imageUrl]);
  return /*#__PURE__*/React.createElement("div", {
    className: "modal-overlay image-url-modal",
    onClick: e => { e.stopPropagation(); onClose(); },
    style: { zIndex: 10050 }
  }, /*#__PURE__*/React.createElement(ResizableModalContainer, {
    className: "modal-container",
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal-header",
    style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' }
  }, /*#__PURE__*/React.createElement("h3", {
    style: { fontSize: '1.1rem', fontWeight: 800 }
  }, "이미지 URL"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onClose,
    style: {
      background: 'none',
      border: 'none',
      color: '#64748B',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement(SmallXIcon, { size: 20 }))), /*#__PURE__*/React.createElement("div", {
    className: "modal-body"
  }, /*#__PURE__*/React.createElement("label", {
    style: { fontSize: '0.85rem', fontWeight: 700, color: '#64748B' }
  }, isGenerating ? "공유 가능한 이미지 URL 생성 중" : "선택한 사진의 원본 이미지 URL"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    className: "form-input",
    style: { width: '100%' },
    value: isGenerating ? '공유 URL을 생성하고 있습니다...' : (isInlineImageUrl ? '공유 가능한 HTTPS URL을 생성할 수 없습니다.' : resolvedUrl || ''),
    readOnly: true
  }), errorText && /*#__PURE__*/React.createElement("div", {
    style: { fontSize: '0.78rem', color: '#EF4444', fontWeight: 700 }
  }, errorText, " Storage 업로드 권한 또는 네트워크 상태를 확인해 주세요."), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn-primary",
    disabled: isGenerating || !isShareableUrl,
    style: { opacity: isGenerating || !isShareableUrl ? 0.65 : 1, cursor: isGenerating || !isShareableUrl ? 'not-allowed' : 'pointer' },
    onClick: async () => {
      const ok = await copyTextToClipboard(resolvedUrl || '');
      const message = ok ? '이미지 URL이 복사되었습니다.' : '복사에 실패했습니다. URL을 직접 선택해 복사해 주세요.';
      if (showToast) showToast(message, ok ? 'success' : 'error');
      else alert(message);
    }
  }, isGenerating ? "URL 생성 중..." : "URL 복사하기"))));
}

  if (typeof window !== 'undefined') {
  window.GATHER_UI_COMPONENTS = Object.assign({}, window.GATHER_UI_COMPONENTS || {}, {
    DirectChatMediaText: DirectChatMediaText,
    DeadlineDateTimePicker: DeadlineDateTimePicker,
    PlacesSection: PlacesSection,
    ImageUrlModal: ImageUrlModal,
  });
}
