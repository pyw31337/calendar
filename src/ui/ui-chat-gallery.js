/**
 * Chat / gallery modal (P4-13)
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
function extractAllUrlInfos(...args) {
  const f = __gatherUiDeps().extractAllUrlInfos || GATHER_APP_UTILS.extractAllUrlInfos;
  return typeof f === 'function' ? f(...args) : [];
}
function extractAllUrlInfosLoose(...args) {
  const f = __gatherUiDeps().extractAllUrlInfosLoose || GATHER_APP_UTILS.extractAllUrlInfosLoose;
  return typeof f === 'function' ? f(...args) : [];
}
function getDirectMediaTagKey(...args) {
  const f = __gatherUiDeps().getDirectMediaTagKey || GATHER_APP_UTILS.getDirectMediaTagKey;
  return typeof f === 'function' ? f(...args) : '';
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
function readClipboardImageFiles(...args) {
  const f = __gatherUiDeps().readClipboardImageFiles || GATHER_APP_UTILS.readClipboardImageFiles;
  return typeof f === 'function' ? f(...args) : Promise.resolve([]);
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
const EMOJI_CATEGORIES = GATHER_APP_CHAT_DATA.EMOJI_CATEGORIES || [];
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
// Generalizes getMessageDirectMediaEntry (which only ever returned the FIRST externally-linked
// image in a message) to every recognized image link in the text -- a message pasted with several
// external image links (see DirectChatMediaText's multi-image grid in ui-remaining.js) needs every
// one of them to show up here too, not just the first, the same way a real multi-image upload
// already does via getMessageImageEntries.
function getAllDirectMediaImageEntries(msgLike) {
  if (!msgLike?.text) return [];
  const sourceHint = msgLike?.uploadSource === 'memo' ? 'memo' : 'chat';
  return extractAllUrlInfosLoose(msgLike.text)
    .filter(info => getDirectChatMediaInfo(info.url)?.type === 'image')
    .map((info, idx) => ({
      full: info.url,
      thumb: info.url,
      imageIndex: idx,
      messageId: msgLike.id,
      timestamp: msgLike.timestamp,
      tags: getDirectMediaTagsForUrl(msgLike, info.url),
      directMediaUrl: info.url,
      uploadSource: msgLike.uploadSource || null,
      source: sourceHint,
      mediaKey: `${sourceHint}:${msgLike.id || 'msg'}:direct:${getDirectMediaTagKey(info.url)}`,
      refKey: `${sourceHint}:${msgLike.id || 'msg'}:direct:${getDirectMediaTagKey(info.url)}`
    }));
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

// Tracks whether the OS clipboard currently holds an image, so a '붙여넣기' button can be
// disabled when there's nothing to paste. Browsers vary wildly here (Firefox has no image
// support for navigator.clipboard.read(), Safari/Chrome gate it behind the clipboard-read
// permission) -- this fails OPEN (button stays enabled) whenever the check itself is
// unsupported or inconclusive, and specifically avoids calling clipboard.read() while
// permission is still 'prompt' so merely rendering the button never pops a permission dialog.
function useClipboardHasImage(active) {
  return true;
}

export function ChatGalleryModal({
  chatMessages,
  memos = [],
  calendar = null,
  asPage = false,
  onClose,
  onUploadImages = null,
  onOpenShare = null,
  setActiveLightbox,
  hasMoreOlderChat = false,
  loadingOlderChat = false,
  onLoadOlderChat = null,
  hasMoreMemos = false,
  onLoadMoreMemos = null,
  totalGalleryCount = 0,
  isDarkTheme,
  onToggleTheme,
  fontScalePercent,
  onDecreaseFont,
  onIncreaseFont,
  isChatNotifyEnabled,
  onToggleChatNotifications,
  onOpenAppSettings = null,
  onChangeView = null,
  chatCount = 0,
  settlementBadge = null,
  galleryCount = 0,
  placeCount = 0,
  memoCount = 0,
  chatLastAuthor = null,
  settlementLastDate = null,
  galleryLastDate = null,
  placeLastName = null,
  memoLastTitleWord = null,
  showToast,
  onDeletePhoto = null,
  syncStatus = null
}) {
  const React = window.React;
  const __deps = window.GATHER_UI_DEPS || {};
  const __comp = window.GATHER_UI_COMPONENTS || {};
  const ResizableModalContainer = __deps.ResizableModalContainer;
  const SmallXIcon = __deps.SmallXIcon;
  const BackArrowIcon = __deps.BackArrowIcon;
  const SharedSideMenuSettings = __comp.SharedSideMenuSettings || __deps.SharedSideMenuSettings;
  const SharedSideMenuFooter = __comp.SharedSideMenuFooter || __deps.SharedSideMenuFooter;
  const SharedAppNavBlock = __comp.SharedAppNavBlock || __deps.SharedAppNavBlock;
  const WeatherBadge = __comp.WeatherBadge || __deps.WeatherBadge;
  const InlineSearchBar = __comp.InlineSearchBar || __deps.InlineSearchBar;
  const SyncStatusChip = __comp.SyncStatusChip || __deps.SyncStatusChip;
  const SyncStatusBanner = __comp.SyncStatusBanner || __deps.SyncStatusBanner;
  const LinkPreviewCard = __deps.LinkPreviewCard || __comp.LinkPreviewCard;
  const MenuIcon = __deps.MenuIcon || __comp.MenuIcon;
  const MediaThumb = __comp.MediaThumb || __deps.MediaThumb;
  const getMessageImageEntries = __deps.getMessageImageEntries;
  const resolveMeetingPhotoDisplay = __deps.resolveMeetingPhotoDisplay;
  const removeFirstUrl = __deps.removeFirstUrl;
  const formatChatHeaderTitle = __deps.formatChatHeaderTitle;
  const useScrollHideHeader = __deps.useScrollHideHeader;

  const [activeTab, setActiveTab] = React.useState('photos'); // 'photos' | 'links'
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const uploadInputRef = React.useRef(null);
  const hasClipboardImage = useClipboardHasImage(true);
  const [pastePreview, setPastePreview] = React.useState(null); // { files, previewUrls } | null
  const brokenPhotoKeysRef = React.useRef(new Set());
  const brokenPhotoUrlsRef = React.useRef(new Set());
  const [brokenPhotoRevision, setBrokenPhotoRevision] = React.useState(0);
  const getPhotoKey = photo => photo?.mediaKey || photo?.refKey || `${photo?.messageId || photo?.photoId || photo?.sourceMessageId || ''}_${photo?.imageIndex ?? photo?.sourceImageIndex ?? ''}`;
  const normalizeBrokenPhotoUrl = value => {
    const url = String(value || '').trim();
    if (!url) return '';
    return url.split(/[?#]/)[0];
  };
  const isBrokenPhotoValue = value => {
    const url = normalizeBrokenPhotoUrl(value);
    return !!url && brokenPhotoUrlsRef.current.has(url);
  };
  const markBrokenPhoto = (photo, brokenInfo = {}) => {
    const key = photo?.mediaKey || photo?.refKey || getPhotoKey(photo);
    const urls = [
      photo?.full,
      photo?.thumb,
      brokenInfo?.src,
      brokenInfo?.fallbackSrc,
      brokenInfo?.currentSrc
    ].map(normalizeBrokenPhotoUrl).filter(Boolean);
    let changed = false;
    if (key && !brokenPhotoKeysRef.current.has(key)) {
      brokenPhotoKeysRef.current.add(key);
      changed = true;
    }
    urls.forEach(url => {
      if (!brokenPhotoUrlsRef.current.has(url)) {
        brokenPhotoUrlsRef.current.add(url);
        changed = true;
      }
    });
    if (changed) setBrokenPhotoRevision(prev => prev + 1);
  };
  React.useEffect(() => () => {
    // Safety net if the component unmounts (e.g. gallery closed) while the preview is still open.
    if (pastePreview) pastePreview.previewUrls.forEach(url => { try { URL.revokeObjectURL(url); } catch (e) {} });
  }, [pastePreview]);
  // 창이 넓어지면 썸네일을 키우지 않고 단 수(2~12)를 늘린다. 셀 목표 너비 ~108px.
  const [gridCols, setGridCols] = React.useState(() => {
    const w = typeof window !== 'undefined' ? window.innerWidth : 400;
    const gap = 6;
    const target = 108;
    return Math.max(2, Math.min(12, Math.floor((w + gap) / (target + gap)) || 2));
  });
  const gridHostRef = React.useRef(null);
  const { isHeaderVisible, onScroll: handleGalleryScroll } = useScrollHideHeader();

  React.useEffect(() => {
    const computeCols = width => {
      const gap = 6;
      const targetCell = 108;
      const usable = Math.max(0, Number(width) || 0);
      const cols = Math.floor((usable + gap) / (targetCell + gap));
      return Math.max(2, Math.min(12, cols || 2));
    };
    const apply = width => setGridCols(prev => {
      const next = computeCols(Math.max(0, width || 0));
      return prev === next ? prev : next;
    });
    const el = gridHostRef.current;
    if (el && typeof ResizeObserver !== 'undefined') {
      const ro = new ResizeObserver(entries => {
        const w = entries[0]?.contentRect?.width;
        apply(w || el.clientWidth || window.innerWidth);
      });
      ro.observe(el);
      apply(el.clientWidth || window.innerWidth);
      return () => ro.disconnect();
    }
    const onWin = () => apply(window.innerWidth);
    onWin();
    window.addEventListener('resize', onWin);
    return () => window.removeEventListener('resize', onWin);
  }, [asPage, activeTab]);

  const sharedLinks = React.useMemo(() => {
    // Was extractFirstUrl -- a message or memo with several distinct links (not just a multi-image
    // link grid, any mix of URLs typed/pasted together) only ever contributed its first one here,
    // silently dropping the rest from this tab even though every one of them still renders its own
    // preview in the chat/memo itself. extractAllUrlInfosLoose surfaces all of them, INCLUDING a
    // bare domain with no http(s):// or www. prefix (e.g. a share-sheet link pasted as just
    // "naver.me/xxxx") -- that already rendered its own preview fine in chat/memo (via
    // extractFirstUrlInfo's looser single-link match) but was invisible to this tab entirely
    // under the stricter extractAllUrlInfos. Only the first URL per message reuses the cached
    // linkPreview (that cache is keyed to the message's first URL); the rest fetch their own
    // preview live the same way a fresh link normally would. Recognized image links are excluded
    // here -- those belong to the 사진 tab only (see sharedPhotos below), not duplicated as a
    // generic link card here too.
    const list = [];
    const seen = new Set();
    (chatMessages || []).forEach(msg => {
      if (!msg.text) return;
      let firstUrlSeen = false;
      extractAllUrlInfosLoose(msg.text).forEach(info => {
        if (!info.url || seen.has(info.url) || getDirectChatMediaInfo(info.url)?.type === 'image') return;
        seen.add(info.url);
        list.push({ url: info.url, timestamp: msg.timestamp, messageId: msg.id, text: msg.text, linkPreview: !firstUrlSeen ? msg.linkPreview : null, source: 'chat' });
        firstUrlSeen = true;
      });
    });
    (memos || []).forEach(memo => {
      const body = memo?.text || memo?.content || memo?.body || '';
      if (!body) return;
      let firstUrlSeen = false;
      extractAllUrlInfosLoose(body).forEach(info => {
        if (!info.url || seen.has(info.url) || getDirectChatMediaInfo(info.url)?.type === 'image') return;
        seen.add(info.url);
        list.push({ url: info.url, timestamp: memo.updatedAt || memo.createdAt || 0, messageId: memo.id, text: body, linkPreview: !firstUrlSeen ? (memo.linkPreview || null) : null, source: 'memo' });
        firstUrlSeen = true;
      });
    });
    return list.sort((a, b) => b.timestamp - a.timestamp);
  }, [chatMessages, memos]);

  const sharedPhotos = React.useMemo(() => {
    const list = [];
    (chatMessages || []).forEach(msg => {
      const entries = [...getMessageImageEntries(msg), ...getAllDirectMediaImageEntries(msg)];
      entries.forEach(entry => {
        list.push({
          ...entry,
          text: msg.text || '',
          participantId: msg.participantId || '',
          source: 'chat'
        });
      });
    });
    (memos || []).forEach(memo => {
      // memo.tags is a whole-memo tag list (not per-image), so it's only readable here for
      // display -- there's no single-photo target to write back to, which is why the tag
      // editor below is gated off (source !== 'chat'/'meeting') for memo-sourced entries.
      const memoTagsDisplay = Array.isArray(memo.tags) ? memo.tags.map(t => String(t || '').replace(/^#/, '')).filter(Boolean).join(' ') : '';
      const asMsg = {
        id: memo.id, text: memo.text || memo.content || memo.body || '',
        imageUrl: memo.imageUrl, imageUrls: memo.imageUrls, thumbUrl: memo.thumbUrl, thumbUrls: memo.thumbUrls,
        timestamp: memo.updatedAt || memo.createdAt || 0, participantId: memo.participantId || '',
        uploadSource: 'memo'
      };
      const entries = [...getMessageImageEntries(asMsg), ...getAllDirectMediaImageEntries(asMsg)];
      entries.forEach(entry => {
        list.push({
          ...entry,
          tags: memoTagsDisplay,
          text: asMsg.text || '',
          participantId: asMsg.participantId || '',
          source: 'memo'
        });
      });
    });
    getConfirmedMeetings(calendar).forEach(meeting => {
      const photos = Array.isArray(meeting?.photos) ? meeting.photos : [];
      photos.forEach((photo, index) => {
        // Auto-linked entries (sourceMessageId set) are references to a real chat photo, not
        // independent copies -- resolve the live imageUrl/thumbUrl/tags from that source
        // message so this tile always matches the chat original exactly, including any tag
        // edit made from anywhere else.
        const resolved = resolveMeetingPhotoDisplay ? resolveMeetingPhotoDisplay(photo, chatMessages) : null;
        const full = String(resolved?.imageUrl || photo?.imageUrl || photo?.full || '');
        const thumb = String(resolved?.thumbUrl || photo?.thumbUrl || photo?.thumb || full);
        if (!full && !thumb) return;
        const mediaKey = resolved?.mediaKey
          || photo?.mediaKey
          || (photo?.sourceMessageId && Number.isInteger(photo?.sourceImageIndex)
            ? `chat:${photo.sourceMessageId}:${photo.sourceImageIndex}`
            : `meeting:${meeting.date || 'date'}:${photo?.id || index}`);
        const refKey = resolved?.refKey || photo?.refKey || `meeting:${meeting.date || 'date'}:${photo?.id || index}`;
        list.push({
          full: full || thumb,
          thumb: thumb || full,
          imageIndex: index,
          messageId: null,
          photoId: photo?.id || '',
          sourceMessageId: photo?.sourceMessageId || '',
          sourceImageIndex: Number.isInteger(photo?.sourceImageIndex) ? photo.sourceImageIndex : null,
          timestamp: Number(photo?.createdAt || photo?.updatedAt || meeting?.confirmedAt || 0),
          tags: String(resolved?.tags ?? photo?.tags ?? ''),
          text: `${meeting.date || ''} 일정 사진`,
          participantId: '',
          source: 'meeting',
          meetingDate: meeting.date || '',
          mediaKey,
          refKey
        });
      });
    });
    // Tagging a photo with a date auto-links a copy of it onto that date's 일정(meeting) record
    // (see linkTaggedImageToMeetingDates in app-main.js), so the same photo can legitimately
    // appear twice in the raw lists above: once as the original chat/memo message, once as the
    // meeting's archival copy. Collapse those down to one tile per photo URL so the gallery
    // doesn't show duplicates -- keep the chat/memo copy when both exist (its tag editor writes
    // back to a real message), falling back to the meeting copy only when it's the sole survivor
    // (e.g. the original message hasn't been paginated into view yet).
    // The winning (chat/memo) copy is best for tag editing (see above), but its own entry never
    // carries meetingDate -- that only lives on the meeting-side archival copy being discarded
    // here. Carry it over onto the winner so the Lightbox can still show "일정 YY.MM.DD" with a
    // jump-to-date link for a photo that's genuinely both a real chat message AND linked to a
    // meeting date, instead of falling back to the generic non-clickable "일정 사진으로 업로드됨".
    const byUrl = new Map();
    const sourceRank = { chat: 0, memo: 1, meeting: 2 };
    list.forEach(entry => {
      const key = entry.mediaKey || entry.refKey || entry.full || entry.thumb;
      if (!key) return;
      const existing = byUrl.get(key);
      if (!existing) {
        byUrl.set(key, { ...entry });
      } else if ((sourceRank[entry.source] ?? 9) < (sourceRank[existing.source] ?? 9)) {
        byUrl.set(key, { ...entry, meetingDate: entry.meetingDate || existing.meetingDate || '' });
      } else if (!existing.meetingDate && entry.meetingDate) {
        existing.meetingDate = entry.meetingDate;
      }
    });
    return Array.from(byUrl.values()).sort((a, b) => b.timestamp - a.timestamp);
  }, [chatMessages, memos, calendar]);

  const filteredLinks = React.useMemo(() => {
    if (!searchQuery.trim()) return sharedLinks;
    const q = searchQuery.toLowerCase().trim();
    const qNoHash = q.replace(/^#/, '');
    return sharedLinks.filter(item => {
      const matchText = (item.text || '').toLowerCase().includes(q) || (item.text || '').toLowerCase().includes(qNoHash);
      const matchUrl = (item.url || '').toLowerCase().includes(q) || (item.url || '').toLowerCase().includes(qNoHash);
      const matchTitle = (item.linkPreview?.title || '').toLowerCase().includes(q) || (item.linkPreview?.title || '').toLowerCase().includes(qNoHash);
      const matchDesc = (item.linkPreview?.description || '').toLowerCase().includes(q) || (item.linkPreview?.description || '').toLowerCase().includes(qNoHash);
      return matchText || matchUrl || matchTitle || matchDesc;
    });
  }, [sharedLinks, searchQuery]);

  const filteredPhotos = React.useMemo(() => {
    if (!searchQuery.trim()) return sharedPhotos;
    const q = searchQuery.toLowerCase().trim();
    const qNoHash = q.replace(/^#/, '');
    return sharedPhotos.filter(item => {
      // tags is stored as a space-separated string (e.g. "#영우생일 #말복"), not an array
      const tagsRaw = Array.isArray(item.tags) ? item.tags.join(' ') : String(item.tags || '');
      const tagsLower = tagsRaw.toLowerCase();
      const matchTags = tagsLower.includes(q) || tagsLower.includes(qNoHash) || tagsLower.replace(/#/g, '').includes(qNoHash);
      const matchText = (item.text || '').toLowerCase().includes(q) || (item.text || '').toLowerCase().includes(qNoHash);
      return matchTags || matchText;
    });
  }, [sharedPhotos, searchQuery]);
  const visiblePhotos = React.useMemo(() => filteredPhotos.filter(photo => {
    const key = photo.mediaKey || photo.refKey || getPhotoKey(photo);
    if (key && brokenPhotoKeysRef.current.has(key)) return false;
    return !isBrokenPhotoValue(photo.full) && !isBrokenPhotoValue(photo.thumb);
  }), [filteredPhotos, brokenPhotoRevision]);

  const handleBrokenPhoto = (photo, brokenInfo = {}) => {
    markBrokenPhoto(photo, brokenInfo);
  };

  // Search must scan the full history: drain older chat pages (and memo pages) while a query is active.
  React.useEffect(() => {
    if (!searchQuery.trim()) return;
    if (typeof onLoadOlderChat === 'function' && hasMoreOlderChat && !loadingOlderChat) {
      onLoadOlderChat();
    }
    if (typeof onLoadMoreMemos === 'function' && hasMoreMemos) {
      onLoadMoreMemos();
    }
  }, [searchQuery, hasMoreOlderChat, loadingOlderChat, hasMoreMemos, (chatMessages || []).length, (memos || []).length]);

  // Keeps auto-loading older chat history while the 사진 tab is active and still short of a
  // decent first page -- unaffected by the tab-aware effect below (which only targets link count
  // once the 링크 tab is open).
  React.useEffect(() => {
    if (!asPage || (searchQuery || '').trim() || activeTab !== 'photos') return;
    if (typeof onLoadOlderChat !== 'function' || !hasMoreOlderChat || loadingOlderChat) return;
    if ((visiblePhotos || []).length >= 60) return;
    onLoadOlderChat();
  }, [asPage, searchQuery, activeTab, hasMoreOlderChat, loadingOlderChat, (visiblePhotos || []).length, (chatMessages || []).length]);

  // Was missing entirely: the 사진 tab's auto-load above only ever watches photo count, so once
  // it had loaded "enough" photos it stopped pulling in older chat/memo history for good --
  // switching to the 링크 tab afterward saw whatever links happened to already be in that
  // photo-sized window and nothing more, with no way to pull in additional history (그 tab had no
  // "더보기" button of its own either -- see below). Links can come from BOTH chat and memos, so
  // this drains both independently once the 링크 tab is actually open.
  React.useEffect(() => {
    if (!asPage || (searchQuery || '').trim() || activeTab !== 'links') return;
    if ((sharedLinks || []).length >= 50) return;
    if (typeof onLoadOlderChat === 'function' && hasMoreOlderChat && !loadingOlderChat) onLoadOlderChat();
    if (typeof onLoadMoreMemos === 'function' && hasMoreMemos) onLoadMoreMemos();
  }, [asPage, searchQuery, activeTab, hasMoreOlderChat, loadingOlderChat, hasMoreMemos, (sharedLinks || []).length, (chatMessages || []).length, (memos || []).length]);

  const displayPhotoTabCount = (typeof totalGalleryCount === 'number' && totalGalleryCount > (visiblePhotos || []).length)
    ? totalGalleryCount
    : (visiblePhotos || []).length;

  const handleUploadClick = () => {
    if (uploadInputRef.current) uploadInputRef.current.click();
  };
  const handlePasteGalleryUpload = async e => {
    if (e) e.stopPropagation();
    const files = await readClipboardImageFiles(showToast);
    if (files && files.length > 0) {
      // Show what will be uploaded and let the user confirm instead of uploading immediately --
      // handleConfirmPastePreview does the actual upload once confirmed.
      setIsMenuOpen(false);
      setPastePreview({ files, previewUrls: files.map(f => URL.createObjectURL(f)) });
    }
  };
  // previewUrls are revoked by the cleanup effect above once pastePreview changes (including
  // back to null here) -- no need to revoke them again in these two handlers.
  const handleCancelPastePreview = () => setPastePreview(null);
  const handleConfirmPastePreview = async () => {
    if (!pastePreview) return;
    const files = pastePreview.files;
    setPastePreview(null);
    await uploadFiles(files);
  };
  const uploadFiles = async files => {
    if (!files.length || typeof onUploadImages !== 'function') return;
    setIsMenuOpen(false);
    await Promise.resolve(onUploadImages(files));
    setActiveTab('photos');
  };
  const handleUploadChange = async event => {
    const files = Array.from(event.target.files || []);
    event.target.value = '';
    await uploadFiles(files);
  };
  // Lets '이미지 업로드' accept a clipboard-pasted image too, not just the file picker -- active
  // for as long as the 갤러리 페이지 is open. Routes through the same preview/confirm modal as
  // the 붙여넣기 button (handlePasteGalleryUpload) rather than uploading straight from the paste
  // event -- otherwise a stray Ctrl+V uploads whatever happens to be on the clipboard with no
  // chance to back out.
  React.useEffect(() => {
    if (typeof onUploadImages !== 'function') return;
    const handlePaste = e => {
      const files = getImageFilesFromClipboardEvent(e);
      if (!files.length) return;
      e.preventDefault();
      setIsMenuOpen(false);
      setPastePreview({ files, previewUrls: files.map(f => URL.createObjectURL(f)) });
    };
    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [onUploadImages]);
  const renderMenuIcon = () => MenuIcon
    ? /*#__PURE__*/React.createElement(MenuIcon, { paths: ["M4 6h16", "M4 12h16", "M4 18h16"] })
    : /*#__PURE__*/React.createElement("svg", {
        xmlns: "http://www.w3.org/2000/svg", width: "22", height: "22", viewBox: "0 0 24 24",
        fill: "none", stroke: "currentColor", strokeWidth: "2.5", strokeLinecap: "round", strokeLinejoin: "round"
      }, /*#__PURE__*/React.createElement("path", { d: "M4 6h16" }), /*#__PURE__*/React.createElement("path", { d: "M4 12h16" }), /*#__PURE__*/React.createElement("path", { d: "M4 18h16" }));
  const renderGalleryUploadIcon = () => /*#__PURE__*/React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg", width: "20", height: "20", viewBox: "0 0 24 24",
    fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", { d: "M10.3 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10l-3.1-3.1a2 2 0 0 0-2.814.014L6 21" }),
     /*#__PURE__*/React.createElement("path", { d: "m14 19.5 3-3 3 3" }),
     /*#__PURE__*/React.createElement("path", { d: "M17 22v-5.5" }),
     /*#__PURE__*/React.createElement("circle", { cx: "9", cy: "9", r: "2" }));
  const renderShareIcon = () => MenuIcon
    ? /*#__PURE__*/React.createElement(MenuIcon, { paths: ["M3 12a3 3 0 1 0 6 0a3 3 0 1 0 -6 0", "M15 6a3 3 0 1 0 6 0a3 3 0 1 0 -6 0", "M15 18a3 3 0 1 0 6 0a3 3 0 1 0 -6 0", "M8.7 10.7l6.6 -3.4", "M8.7 13.3l6.6 3.4"] })
    : /*#__PURE__*/React.createElement("svg", {
        xmlns: "http://www.w3.org/2000/svg", width: "20", height: "20", viewBox: "0 0 24 24",
        fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round"
      }, /*#__PURE__*/React.createElement("circle", { cx: "6", cy: "12", r: "3" }), /*#__PURE__*/React.createElement("circle", { cx: "18", cy: "6", r: "3" }), /*#__PURE__*/React.createElement("circle", { cx: "18", cy: "18", r: "3" }), /*#__PURE__*/React.createElement("path", { d: "M8.7 10.7l6.6-3.4" }), /*#__PURE__*/React.createElement("path", { d: "M8.7 13.3l6.6 3.4" }));

  // Paste preview/confirm modal -- shown after clicking '붙여넣기' and before the clipboard
  // image(s) actually upload, so the user can see what's about to be attached.
  const pastePreviewModal = pastePreview ? /*#__PURE__*/React.createElement("div", {
    className: "modal-overlay",
    style: { zIndex: 30000 },
    onClick: handleCancelPastePreview
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal-container confirm-dialog-modal",
    onClick: e => e.stopPropagation(),
    style: { maxWidth: '360px', borderRadius: 'var(--radius-md)' }
  },
    /*#__PURE__*/React.createElement("h3", {
      style: { fontSize: '1.05rem', fontWeight: 800, marginBottom: '12px', color: 'var(--text-main)', textAlign: 'center' }
    }, `클립보드 이미지 ${pastePreview.previewUrls.length}장을 붙여넣을까요?`),
    /*#__PURE__*/React.createElement("div", {
      style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(76px, 1fr))', gap: '8px', marginBottom: '16px', maxHeight: '50vh', overflowY: 'auto' }
    }, pastePreview.previewUrls.map((url, i) => /*#__PURE__*/React.createElement("img", {
      key: i,
      src: url,
      alt: "붙여넣을 이미지 미리보기",
      style: { width: '100%', aspectRatio: '1 / 1', objectFit: 'cover', borderRadius: '10px', backgroundColor: 'var(--bg-primary)' }
    }))),
    /*#__PURE__*/React.createElement("div", { style: { display: 'flex', gap: '10px', justifyContent: 'center' } },
      /*#__PURE__*/React.createElement("button", {
        type: "button",
        className: "btn btn-secondary",
        onClick: handleCancelPastePreview,
        style: { flex: 1, height: '36px', fontSize: '0.85rem' }
      }, "취소"),
      /*#__PURE__*/React.createElement("button", {
        type: "button",
        className: "btn btn-action-dark",
        onClick: handleConfirmPastePreview,
        style: { flex: 1, height: '36px', fontSize: '0.85rem' }
      }, "업로드")
    )
  )) : null;

  const galleryShellStyle = asPage ? {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1005,
    backgroundColor: 'var(--bg-primary)', display: 'flex', flexDirection: 'column',
    width: '100%', maxWidth: '100%', overflow: 'hidden'
  } : { zIndex: 11000 };
  const galleryInnerStyle = asPage ? {
    width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
    backgroundColor: 'var(--bg-card)', borderRadius: 0, maxWidth: '100%'
  } : {
    maxWidth: window.innerWidth >= 768 ? '960px' : '520px',
    width: '95%', height: '80vh', display: 'flex', flexDirection: 'column'
  };
  const galleryHeaderStyle = asPage ? {
    height: '56px', padding: '0 16px',
    borderBottom: isSearchOpen ? 'none' : '1px solid var(--border-subtle)',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1010, overflow: 'hidden', flexShrink: 0,
    backgroundColor: 'var(--bg-card)',
    transition: 'transform 0.3s ease',
    transform: isHeaderVisible ? 'translateY(0)' : 'translateY(-100%)'
  } : {
    padding: '16px 20px 12px 20px', borderBottom: '1px solid var(--border-subtle)',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    position: 'relative', overflow: 'hidden'
  };

  const galleryTree = /*#__PURE__*/React.createElement("div", {
    className: asPage ? "gallery-page-container" : "modal-overlay",
    onClick: asPage ? undefined : onClose,
    style: galleryShellStyle
  }, /*#__PURE__*/React.createElement(asPage ? "div" : ResizableModalContainer, asPage ? {
    className: "gallery-page-inner", style: galleryInnerStyle
  } : {
    className: "modal-container", onClick: e => e.stopPropagation(), style: galleryInnerStyle
  },
  /*#__PURE__*/React.createElement("div", {
    className: asPage ? "gallery-page-header" : "modal-header",
    style: galleryHeaderStyle
  },
    asPage
      ? /*#__PURE__*/React.createElement(React.Fragment, null,
          /*#__PURE__*/React.createElement("button", {
            type: "button", onClick: onClose, "aria-label": "뒤로가기",
            style: {
              width: '36px', height: '36px', borderRadius: '50%', background: 'transparent', border: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748B', flexShrink: 0
            }
          }, /*#__PURE__*/React.createElement(BackArrowIcon, { size: 22 })),
          /*#__PURE__*/React.createElement("div", {
            style: {
              position: 'absolute', left: '50%', transform: 'translateX(-50%)',
              display: 'flex', alignItems: 'center', fontWeight: 800, fontSize: '0.95rem',
              color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden',
              textOverflow: 'ellipsis', maxWidth: 'calc(100vw - 120px)', pointerEvents: 'none'
            }
          }, formatChatHeaderTitle(calendar?.title) ? formatChatHeaderTitle(calendar?.title) + " 갤러리" : "갤러리"),
          /*#__PURE__*/React.createElement("button", {
            type: "button",
            onClick: () => setIsMenuOpen(true),
            title: "갤러리 메뉴", "aria-label": "갤러리",
            style: {
              background: 'none', border: 'none', cursor: 'pointer', padding: '6px',
              color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
            }
          }, renderMenuIcon())
        )
      : /*#__PURE__*/React.createElement(React.Fragment, null,
          /*#__PURE__*/React.createElement("h3", {
            style: { fontSize: '1.05rem', fontWeight: 900, color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap', flex: 1 }
          }, "갤러리"),
          /*#__PURE__*/React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 } },
            /*#__PURE__*/React.createElement("button", {
              type: "button",
              onClick: () => setIsSearchOpen(prev => { if (prev) setSearchQuery(''); return !prev; }),
              style: { display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6px', border: 0, background: 'none', cursor: 'pointer', color: 'var(--text-muted)' }
            }, /*#__PURE__*/React.createElement("svg", {
              xmlns: "http://www.w3.org/2000/svg", width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2.5"
            }, /*#__PURE__*/React.createElement("circle", { cx: "11", cy: "11", r: "8" }), /*#__PURE__*/React.createElement("path", { d: "m21 21-4.3-4.3" }))),
            /*#__PURE__*/React.createElement("button", {
              type: "button", className: "modal-close-btn", onClick: onClose, "aria-label": "닫기",
              style: { display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px', border: 0, background: 'none', cursor: 'pointer', color: 'var(--text-muted)' }
            }, /*#__PURE__*/React.createElement(SmallXIcon, { size: 20 }))
          )
        )
  ),
  /*#__PURE__*/React.createElement("input", {
    ref: uploadInputRef,
    type: "file",
    accept: "image/jpeg, image/png, image/gif, image/webp, image/heic, image/heif, image/*",
    multiple: true,
    onChange: handleUploadChange,
    style: { display: 'none' }
  }),
  asPage && isMenuOpen && /*#__PURE__*/React.createElement("div", {
    className: "admin-side-menu-overlay",
    onClick: () => setIsMenuOpen(false),
    style: { zIndex: 12000 }
  }, /*#__PURE__*/React.createElement("nav", {
    className: "admin-side-menu",
    "aria-label": "갤러리 메뉴",
    onClick: e => e.stopPropagation()
  },
    /*#__PURE__*/React.createElement("div", { className: "admin-side-menu-header" },
      /*#__PURE__*/React.createElement("div", { className: "admin-side-menu-brand" },
        /*#__PURE__*/React.createElement("div", { className: "admin-side-menu-copy" },
          /*#__PURE__*/React.createElement("button", {
            type: "button",
            className: "admin-side-menu-title",
            title: "메인 화면으로 이동",
            "aria-label": "메인 화면으로 이동",
            onClick: () => { setIsMenuOpen(false); if (typeof onChangeView === 'function') onChangeView('calendar'); else if (typeof onClose === 'function') onClose(); },
            style: {
              background: 'none', border: 'none', padding: 0, margin: 0,
              color: 'inherit',
              cursor: 'pointer', textAlign: 'left'
            }
          }, "갤러리")
        )
      ),
      /*#__PURE__*/React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 } },
        WeatherBadge ? /*#__PURE__*/React.createElement(WeatherBadge, { weatherLocation: calendar && calendar.weatherLocation }) : null,
        /*#__PURE__*/React.createElement("button", {
          type: "button",
          className: "admin-side-menu-close-btn",
          onClick: () => setIsMenuOpen(false),
          "aria-label": "메뉴 닫기"
        }, /*#__PURE__*/React.createElement(SmallXIcon, { size: 20 }))
      )
    ),
    /*#__PURE__*/React.createElement("div", { className: "admin-side-menu-list" },
      /*#__PURE__*/React.createElement("button", {
        type: "button",
        className: "admin-side-menu-item",
        onClick: () => { setIsMenuOpen(false); setIsSearchOpen(true); }
      },
        /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-icon" }, /*#__PURE__*/React.createElement("svg", {
          xmlns: "http://www.w3.org/2000/svg", width: "20", height: "20", viewBox: "0 0 24 24",
          fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round"
        }, /*#__PURE__*/React.createElement("circle", { cx: "11", cy: "11", r: "8" }), /*#__PURE__*/React.createElement("path", { d: "m21 21-4.3-4.3" }))),
        /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-copy" },
          /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-title" }, "갤러리 검색"),
          /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-desc" }, "사진·링크 통합 검색")
        )
      ),
      /*#__PURE__*/React.createElement("div", {
        style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', paddingRight: '8px' }
      },
        /*#__PURE__*/React.createElement("button", {
          type: "button",
          className: "admin-side-menu-item",
          onClick: handleUploadClick,
          style: { flex: 1 }
        },
          /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-icon" }, renderGalleryUploadIcon()),
          /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-copy" },
            /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-title" }, "이미지 업로드"),
            /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-desc" }, "갤러리에 사진을 바로 추가")
          )
        ),
        /*#__PURE__*/React.createElement("button", {
          type: "button",
          className: "btn btn-action btn-action-outline",
          disabled: !hasClipboardImage,
          onClick: handlePasteGalleryUpload,
          title: hasClipboardImage ? undefined : '클립보드에 붙여넣을 이미지가 없습니다.',
          style: {
            padding: '4px 10px',
            fontSize: '0.76rem',
            fontWeight: 900,
            borderRadius: 'var(--radius-md)',
            cursor: hasClipboardImage ? 'pointer' : 'default',
            flexShrink: 0,
            whiteSpace: 'nowrap'
          }
        }, "붙여넣기")
      ),
    ),
    typeof SharedAppNavBlock === 'function' && /*#__PURE__*/React.createElement(SharedAppNavBlock, {
      onClose: () => setIsMenuOpen(false),
      onChangeView: onChangeView,
      chatCount: chatCount,
      settlementBadge: settlementBadge,
      galleryCount: galleryCount,
      placeCount: placeCount,
      memoCount: memoCount,
      chatLastAuthor: chatLastAuthor,
      settlementLastDate: settlementLastDate,
      galleryLastDate: galleryLastDate,
      placeLastName: placeLastName,
      memoLastTitleWord: memoLastTitleWord
    }),
    typeof SharedSideMenuFooter === 'function' && /*#__PURE__*/React.createElement(SharedSideMenuFooter, {
      onClose: () => setIsMenuOpen(false),
      onOpenShare: onOpenShare,
      onOpenSettings: onOpenAppSettings,
      shareLabel: '공유'
    })
  )),
  isSearchOpen && /*#__PURE__*/React.createElement(InlineSearchBar, {
    value: searchQuery,
    placeholder: "사진·링크 통합 검색 (태그, 텍스트, URL)",
    onChange: e => setSearchQuery(e.target.value),
    fixed: !!asPage,
    style: asPage ? {
      borderBottom: 'none',
      boxShadow: 'none',
      transition: 'transform 0.3s ease',
      transform: isHeaderVisible ? 'translateY(0)' : 'translateY(-100%)'
    } : { borderBottom: '1px solid var(--border-subtle)' },
    trailing: /*#__PURE__*/React.createElement("button", {
      type: "button",
      onClick: () => { setIsSearchOpen(false); setSearchQuery(''); },
      style: { border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px 6px', fontSize: '0.8rem', fontWeight: 700, flexShrink: 0 }
    }, "닫기")
  }), /*#__PURE__*/React.createElement("div", {
    className: asPage ? "gallery-page-tabs" : undefined,
    style: {
      display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', padding: '12px 20px 8px 20px',
      borderBottom: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-primary)',
      flexShrink: 0,
      ...(asPage ? {
        position: 'fixed', top: isSearchOpen ? '104px' : '56px', left: 0, right: 0, zIndex: 1009,
        transition: 'transform 0.3s ease, top 0.3s ease',
        transform: isHeaderVisible ? 'translateY(0)' : 'translateY(calc(-100% - 56px))'
      } : {})
    }
  }, [['photos', '사진'], ['links', '링크']].map(tab => {
    const count = tab[0] === 'photos'
      ? ((searchQuery || '').trim() ? visiblePhotos.length : displayPhotoTabCount)
      : filteredLinks.length;
    return /*#__PURE__*/React.createElement("button", {
      key: tab[0],
      type: "button",
      onClick: () => setActiveTab(tab[0]),
      style: {
        border: 'none',
        borderRadius: 'var(--radius-md)',
        padding: '8px 10px',
        background: activeTab === tab[0] ? 'var(--accent-primary)' : 'transparent',
        color: activeTab === tab[0] ? '#FFFFFF' : 'var(--text-muted)',
        fontWeight: 900,
        fontSize: '0.86rem',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px'
      }
    },
      tab[1],
      /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: '0.7rem',
          fontWeight: 800,
          padding: '1px 7px',
          borderRadius: '999px',
          backgroundColor: activeTab === tab[0] ? 'rgba(255,255,255,0.22)' : 'var(--border-subtle)',
          color: activeTab === tab[0] ? '#FFFFFF' : 'var(--text-muted)',
          minWidth: '18px',
          textAlign: 'center'
        }
      }, String(count))
    );
  })), /*#__PURE__*/React.createElement("div", {
    ref: gridHostRef,
    onScroll: asPage ? handleGalleryScroll : undefined,
    style: {
      flex: 1, overflowY: 'auto',
      padding: asPage
        ? ((isSearchOpen ? '168px' : '120px') + ' 20px 16px 20px')
        : '16px 20px',
      display: 'flex', flexDirection: 'column', gap: '12px', boxSizing: 'border-box',
      minWidth: 0
    }
  }, activeTab === 'links' ? /*#__PURE__*/React.createElement(React.Fragment, null,
    filteredLinks.length === 0 ? /*#__PURE__*/React.createElement("div", {
      style: { textAlign: 'center', color: 'var(--text-muted)', padding: '40px 0', fontSize: '0.88rem' }
    }, searchQuery ? "검색 결과가 없습니다." : "공유된 링크가 없습니다.") : filteredLinks.map(item => /*#__PURE__*/React.createElement("div", {
      key: item.messageId,
      style: { width: '100%' }
    }, /*#__PURE__*/React.createElement(LinkPreviewCard, { url: item.url, fallbackTitle: item.text ? removeFirstUrl(item.text).replace(/\n/g, ' ').replace(/\s+/g, ' ').trim() : '', cachedData: item.linkPreview, stretch: true }))),
    (hasMoreOlderChat || hasMoreMemos) && !(searchQuery || '').trim() && /*#__PURE__*/React.createElement("button", {
      type: "button",
      onClick: () => {
        if (typeof onLoadOlderChat === 'function' && hasMoreOlderChat && !loadingOlderChat) onLoadOlderChat();
        if (typeof onLoadMoreMemos === 'function' && hasMoreMemos) onLoadMoreMemos();
      },
      disabled: !!loadingOlderChat,
      style: {
        width: '100%',
        marginTop: '4px',
        padding: '12px 0',
        border: 'none',
        borderRadius: 'var(--radius-md)',
        backgroundColor: 'color-mix(in srgb, var(--bg-primary) 96%, black)',
        color: 'var(--text-main)',
        fontSize: '0.85rem',
        fontWeight: 700,
        cursor: loadingOlderChat ? 'wait' : 'pointer',
        textAlign: 'center'
      }
    }, loadingOlderChat ? '이전 링크를 불러오는 중…' : '이전 링크 더 보기')
  ) : /*#__PURE__*/React.createElement(React.Fragment, null,
    visiblePhotos.length === 0 ? /*#__PURE__*/React.createElement("div", {
      style: { textAlign: 'center', color: 'var(--text-muted)', padding: '40px 0', fontSize: '0.88rem' }
    }, searchQuery
      ? "검색 결과가 없습니다."
      : ((hasMoreOlderChat || loadingOlderChat)
        ? "이전 사진을 불러오는 중…"
        : ((typeof totalGalleryCount === 'number' && totalGalleryCount > 0)
          ? "사진 데이터를 아직 불러오지 못했습니다. 아래 더보기를 눌러 주세요."
          : "공유된 사진이 없습니다.")))
    : /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))`,
        gap: '6px',
        width: '100%',
        alignContent: 'start'
      }
    }, visiblePhotos.map((photo, idx) => /*#__PURE__*/React.createElement(MediaThumb, {
      key: photo.mediaKey || photo.refKey || `${photo.messageId || photo.source || 'photo'}-${photo.meetingDate || ''}-${photo.directMediaUrl ? 'direct' : photo.imageIndex}-${photo.timestamp || idx}`,
      "data-photo-url": photo.full || photo.thumb,
      "data-message-id": photo.messageId || photo.sourceMessageId,
      src: (photo.thumb && String(photo.thumb)) || (photo.full && String(photo.full)) || '',
      fallbackSrc: (photo.full && String(photo.full)) || (photo.thumb && String(photo.thumb)) || '',
      alt: "공유사진",
      loading: "lazy",
      decoding: "async",
      referrerPolicy: 'no-referrer',
      onClick: () => setActiveLightbox && setActiveLightbox({
        urls: visiblePhotos.map(p => p.full),
        index: idx,
          meta: visiblePhotos.map(p => ({ timestamp: p.timestamp, messageId: p.messageId, imageIndex: p.imageIndex, thumb: p.thumb, tags: p.tags, directMediaUrl: p.directMediaUrl, source: p.source, uploadSource: p.uploadSource, meetingDate: p.meetingDate, photoId: p.photoId, sourceMessageId: p.sourceMessageId, sourceImageIndex: p.sourceImageIndex, assetKey: p.assetKey, mediaKey: p.mediaKey, refKey: p.refKey }))
      }),
      onBroken: (e, brokenInfo) => handleBrokenPhoto(photo, brokenInfo),
      style: {
        width: '100%',
        maxWidth: '100%',
        aspectRatio: '1 / 1',
        objectFit: 'cover',
        borderRadius: '6px',
        cursor: 'pointer',
        backgroundColor: 'var(--bg-primary)',
        display: 'block'
      }
    }))),
    (hasMoreOlderChat || loadingOlderChat) && !(searchQuery || '').trim() && /*#__PURE__*/React.createElement("button", {
      type: "button",
      onClick: () => { if (typeof onLoadOlderChat === 'function' && !loadingOlderChat) onLoadOlderChat(); },
      disabled: !!loadingOlderChat,
      style: {
        width: '100%',
        marginTop: '4px',
        padding: '12px 0',
        border: 'none',
        borderRadius: 'var(--radius-md)',
        backgroundColor: 'color-mix(in srgb, var(--bg-primary) 96%, black)',
        color: 'var(--text-main)',
        fontSize: '0.85rem',
        fontWeight: 700,
        cursor: loadingOlderChat ? 'wait' : 'pointer',
        textAlign: 'center'
      }
    }, loadingOlderChat ? '이전 사진을 불러오는 중…' : '이전 사진·링크 더 보기')
  ))));
  return pastePreviewModal ? /*#__PURE__*/React.createElement(React.Fragment, null, galleryTree, pastePreviewModal) : galleryTree;
}

  if (typeof window !== 'undefined') {
  window.GATHER_UI_COMPONENTS = Object.assign({}, window.GATHER_UI_COMPONENTS || {}, {
    ChatGalleryModal: ChatGalleryModal,
  });
}
