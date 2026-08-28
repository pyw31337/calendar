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
function isSettlementEnabledCalendarId(...args) {
  const f = __gatherUiDeps().isSettlementEnabledCalendarId || (window.GATHER_APP_UTILS || {}).isSettlementEnabledCalendarId;
  return typeof f === 'function' ? f(...args) : true;
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
function createCalendarDataBackupPayload(...args) {
  const f = __gatherUiDeps().createCalendarDataBackupPayload || GATHER_APP_UTILS.createCalendarDataBackupPayload;
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
function extractCalendarBackupEntries(...args) {
  const f = __gatherUiDeps().extractCalendarBackupEntries || GATHER_APP_UTILS.extractCalendarBackupEntries;
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
function validateCalendarBackupEntries(...args) {
  const f = __gatherUiDeps().validateCalendarBackupEntries || GATHER_APP_UTILS.validateCalendarBackupEntries;
  return typeof f === 'function' ? f(...args) : undefined;
}
function restoreCalendarBackupEntries(...args) {
  const f = __gatherUiDeps().restoreCalendarBackupEntries || GATHER_APP_UTILS.restoreCalendarBackupEntries;
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
function useTapRevealedMsgId() {
  const React = window.React;
  const [tapRevealedMsgId, setTapRevealedMsgId] = React.useState(null);
  return [tapRevealedMsgId, setTapRevealedMsgId];
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
function useLinkPreview(url, cachedData) {
  const React = window.React;
  const [state, setState] = React.useState(() => {
    if (cachedData) return { status: 'success', data: cachedData };
    return null;
  });
  React.useEffect(() => {
    if (cachedData) {
      setState({ status: 'success', data: cachedData });
      return;
    }
    if (!url) return;
    let cancelled = false;
    setState({ status: 'loading' });
    const f = __gatherUiDeps().fetchLinkPreview || (typeof fetchLinkPreview === 'function' ? fetchLinkPreview : null);
    if (typeof f === 'function') {
      f(url).then(result => {
        if (!cancelled) setState(result);
      });
    }
    return () => {
      cancelled = true;
    };
  }, [url, cachedData]);
  return state;
}
function useScrollHideHeader() {
  const React = window.React;
  const [isHeaderVisible, setIsHeaderVisible] = React.useState(true);
  const lastScrollTopRef = React.useRef(0);
  const onScroll = React.useCallback((e) => {
    const scrollTop = e && e.target ? e.target.scrollTop : 0;
    const lastScrollTop = lastScrollTopRef.current;
    if (scrollTop < 10) {
      setIsHeaderVisible(true);
    } else if (scrollTop > lastScrollTop && scrollTop > 56) {
      setIsHeaderVisible(false);
    } else if (scrollTop < lastScrollTop) {
      setIsHeaderVisible(true);
    }
    lastScrollTopRef.current = scrollTop;
  }, []);
  return { isHeaderVisible, onScroll };
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


export function AppSettingsModal({
  onClose, isDarkTheme, onToggleTheme, fontScalePercent, onDecreaseFont, onIncreaseFont,
  isNotifPermissionGranted, isMasterNotifyEnabled, onToggleMasterNotify,
  notifyChannels, onToggleNotifyChannel, helpSteps,
  weatherLocation = null, recentLocations = [], onUpdateWeatherLocation, onDeleteRecentLocation, showToast,
  calendarId = null,
  activeParticipantId = null,
  onForcePushReregister = null,
  calendar = null,
  onRequestConfirm = null,
  onRequestDataRefresh = null
}) {
  const React = window.React;
  const __deps = window.GATHER_UI_DEPS || {};
  const SmallXIcon = __deps.SmallXIcon;
  const ToggleSwitch = __deps.ToggleSwitch;
  const MoonStarsIcon = __deps.MoonStarsIcon;
  const TextResizeIcon = __deps.TextResizeIcon;
  const BellIcon = __deps.BellIcon;
  const MapCogIcon = __deps.MapCogIcon;
  const translateKoreanToEnglish = __deps.translateKoreanToEnglish;
  const getNotificationDiagnostics = (window.GATHER_APP_NOTIFICATIONS || {}).getNotificationDiagnostics
    || (window.GATHER_APP_DOMAIN_HELPERS || {}).getNotificationDiagnostics;
  const getOrCreateDeviceId = (window.GATHER_APP_NOTIFICATIONS || {}).getOrCreateDeviceId
    || (window.GATHER_APP_DOMAIN_HELPERS || {}).getOrCreateDeviceId;
  const channels = [
    { key: 'chat', label: '채팅 알림' },
    { key: 'memo', label: '메모 알림' },
    { key: 'poll', label: '투표 알림' },
    { key: 'schedule', label: '일정 알림' }
  ];
  const [weatherQuery, setWeatherQuery] = React.useState('');
  const [weatherResults, setWeatherResults] = React.useState([]);
  const [weatherLoading, setWeatherLoading] = React.useState(false);
  const currentWeatherName = (weatherLocation && weatherLocation.name) || '서울';
  const [pushBusy, setPushBusy] = React.useState(false);
  const [pushStatus, setPushStatus] = React.useState(null); // { ok, reason, subId }
  const [deviceRows, setDeviceRows] = React.useState([]);
  const [backupBusy, setBackupBusy] = React.useState(false);
  const backupFileInputRef = React.useRef(null);
  const myDeviceId = React.useMemo(() => (typeof getOrCreateDeviceId === 'function' ? getOrCreateDeviceId() : null), []);
  const currentCalendar = calendar && typeof calendar === 'object' ? calendar : null;
  const currentCalendarId = currentCalendar?.id || calendarId || '';
  const canUseBackup = !!currentCalendar && !!currentCalendarId;

  const refreshPushMeta = React.useCallback(async () => {
    const diag = typeof getNotificationDiagnostics === 'function' ? getNotificationDiagnostics() : null;
    let status = { ok: false, reason: 'unknown', diag };
    try {
      if (typeof Notification === 'undefined' || Notification.permission !== 'granted') {
        status = { ok: false, reason: 'permission', diag };
      } else if (!('serviceWorker' in navigator) || !navigator.serviceWorker) {
        status = { ok: false, reason: 'no-sw', diag };
      } else {
        const reg = await navigator.serviceWorker.ready;
        const sub = reg.pushManager ? await reg.pushManager.getSubscription() : null;
        if (!sub) status = { ok: false, reason: 'no-sub', diag };
        else status = { ok: true, reason: 'subscribed', subId: String(sub.endpoint || '').slice(-24), diag };
      }
    } catch (e) {
      status = { ok: false, reason: e?.message || 'error', diag };
    }
    setPushStatus(status);

    // Device list from Firestore
    try {
      const db = typeof window !== 'undefined' ? window.__gatherFirebaseDb : null;
      if (db && calendarId) {
        const snap = await db.collection('calendars').doc('cal_' + calendarId).collection('push_subscriptions').get();
        const rows = [];
        snap.forEach(doc => {
          const d = doc.data() || {};
          const isThisDevice = myDeviceId && d.deviceId === myDeviceId;
          let label = d.deviceLabel || '';
          if (!label || label === '알 수 없는 기기') {
            const currentLabel = (typeof getDeviceLabel === 'function') ? getDeviceLabel() : null;
            if (isThisDevice && currentLabel) {
              label = currentLabel;
            } else {
              return; // Hide legacy unknown device entries
            }
          }
          rows.push({
            id: doc.id,
            deviceId: d.deviceId || '',
            deviceLabel: label.replace(/ · 이 기기$/, ''),
            lastSeenAt: d.lastSeenAt || d.updatedAt || d.createdAt || 0,
            participantId: d.participantId || '',
            isThis: isThisDevice
          });
        });
        rows.sort((a, b) => (b.lastSeenAt || 0) - (a.lastSeenAt || 0));
        setDeviceRows(rows);
      }
    } catch (e) {
      console.warn('push device list', e);
    }
  }, [calendarId, myDeviceId]);

  React.useEffect(() => { refreshPushMeta(); }, [refreshPushMeta]);

  const handleForceReregister = async () => {
    if (pushBusy) return;
    setPushBusy(true);
    try {
      if (typeof onForcePushReregister === 'function') {
        const r = await onForcePushReregister();
        if (typeof showToast === 'function') {
          showToast(r && r.ok ? '이 기기 알림 구독을 다시 등록했습니다.' : ('구독 실패: ' + (r && r.reason || 'unknown')), r && r.ok ? 'success' : 'error');
        }
      }
      await refreshPushMeta();
    } finally {
      setPushBusy(false);
    }
  };

  const handleDeleteDevice = async (row) => {
    if (!row || !calendarId) return;
    try {
      const db = window.__gatherFirebaseDb;
      if (!db) return;
      await db.collection('calendars').doc('cal_' + calendarId).collection('push_subscriptions').doc(row.id).delete();
      if (typeof showToast === 'function') showToast('기기 구독을 삭제했습니다.', 'success');
      await refreshPushMeta();
    } catch (e) {
      if (typeof showToast === 'function') showToast('삭제 실패', 'error');
    }
  };

  const handleDownloadBackup = async () => {
    if (backupBusy) return;
    if (!canUseBackup || !currentCalendar) {
      if (typeof showToast === 'function') showToast('백업할 캘린더를 찾지 못했습니다.', 'error');
      return;
    }
    setBackupBusy(true);
    try {
      if (typeof showToast === 'function') showToast('백업 파일을 생성하는 중입니다.', 'info', 2500);
      const payload = await createCalendarDataBackupPayload([currentCalendar], currentCalendarId);
      const suffix = currentCalendarId || 'current';
      const timestamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
      downloadJsonFile(`calendar-backup-${suffix}-${timestamp}.json`, payload);
      if (typeof showToast === 'function') showToast('백업 다운로드가 완료되었습니다.', 'success');
    } catch (err) {
      console.error('createCalendarDataBackupPayload failed:', err);
      if (typeof showToast === 'function') showToast('백업 다운로드에 실패했습니다.', 'error');
    } finally {
      setBackupBusy(false);
    }
  };

  const handleRestoreBackupFile = async (event) => {
    const file = event?.target?.files?.[0];
    event.target.value = '';
    if (!file || backupBusy) return;
    if (!canUseBackup || !currentCalendar) {
      if (typeof showToast === 'function') showToast('현재 캘린더를 찾지 못했습니다.', 'error');
      return;
    }
    try {
      const raw = await file.text();
      const parsed = JSON.parse(raw);
      const extracted = extractCalendarBackupEntries(parsed);
      const { entries, error: validationError } = validateCalendarBackupEntries(extracted);
      if (validationError) {
        if (typeof showToast === 'function') showToast(validationError, 'error', 6000);
        return;
      }
      if (!Array.isArray(entries) || entries.length !== 1) {
        if (typeof showToast === 'function') showToast('이 화면에서는 현재 캘린더 1개 백업만 복구할 수 있습니다.', 'error', 6000);
        return;
      }
      const entry = entries[0];
      if (entry.calendar.id !== currentCalendarId) {
        if (typeof showToast === 'function') showToast(`이 백업은 ${entry.calendar.id} 용입니다. 현재 캘린더(${currentCalendarId})와 다릅니다.`, 'error', 6000);
        return;
      }
      const confirmMessage = `${currentCalendarId} 캘린더를 백업 파일 내용으로 복구합니다.\n채팅·메모·장소·사진·투표·정산·로그 데이터가 현재 서버 내용으로 교체됩니다.`;
      const executeRestore = async () => {
        if (backupBusy) return;
        setBackupBusy(true);
        try {
          const result = await restoreCalendarBackupEntries([entry]);
          if (!result || !result.ok) {
            const failedLabel = result?.failed?.map(item => item.id || 'unknown').filter(Boolean).join(', ') || '복구';
            if (typeof showToast === 'function') showToast(`${failedLabel} 실패`, 'error', 6000);
            return;
          }
          if (typeof onRequestDataRefresh === 'function') {
            try { onRequestDataRefresh(); } catch (_) {}
          }
          if (typeof showToast === 'function') showToast('백업 복구가 완료되었습니다.', 'success');
        } catch (restoreErr) {
          console.error('restoreCalendarBackupEntries failed:', restoreErr);
          if (typeof showToast === 'function') showToast('복구 실패', 'error', 6000);
        } finally {
          setBackupBusy(false);
        }
      };
      const confirmFn = typeof onRequestConfirm === 'function'
        ? onRequestConfirm
        : (title, message, onConfirm) => {
            if (window.confirm(`${title}\n\n${message}`)) onConfirm();
          };
      confirmFn('백업 복구 확인', confirmMessage, executeRestore);
    } catch (err) {
      console.error('backup restore failed:', err);
      if (typeof showToast === 'function') showToast('복구 실패', 'error', 6000);
    }
  };

  const isKoreaResult = (loc) => {
    if (!loc) return false;
    const cc = String(loc.country_code || loc.countryCode || '').toUpperCase();
    if (cc === 'KR') return true;
    const country = String(loc.country || '');
    if (/대한민국|South Korea|Korea, Republic|한국/i.test(country)) return true;
    // open-meteo uses country_code
    return false;
  };

  const handleWeatherSearch = async (e) => {
    if (e) e.preventDefault();
    const cleanQuery = (weatherQuery || '').trim();
    if (!cleanQuery) {
      if (typeof showToast === 'function') showToast('검색할 지역 이름을 입력해 주세요.', 'error');
      return;
    }
    setWeatherLoading(true);
    try {
      const translated = typeof translateKoreanToEnglish === 'function' ? translateKoreanToEnglish(cleanQuery) : cleanQuery;
      let searchResults = [];
      // Domestic only: countryCode=KR (open-meteo) / countrycodes=kr (nominatim)
      if (translated) {
        const res = await fetch('https://geocoding-api.open-meteo.com/v1/search?name=' + encodeURIComponent(translated) + '&count=12&language=ko&format=json&countryCode=KR');
        if (res.ok) {
          const data = await res.json();
          searchResults = (data.results || []).filter(isKoreaResult);
        }
      }
      if (searchResults.length === 0) {
        const res = await fetch('https://nominatim.openstreetmap.org/search?q=' + encodeURIComponent(cleanQuery) + '&format=json&limit=12&accept-language=ko&countrycodes=kr');
        if (res.ok) {
          const data = await res.json();
          searchResults = (data || []).map((item, idx) => ({
            id: 'nominatim_' + (item.place_id || idx),
            name: item.name || (item.display_name || '').split(',')[0],
            latitude: parseFloat(item.lat),
            longitude: parseFloat(item.lon),
            country: '대한민국',
            country_code: 'KR',
            admin1: (item.display_name || '').split(',').slice(1, 2)[0]?.trim() || ''
          }));
        }
      }
      setWeatherResults(searchResults);
      if (searchResults.length === 0 && typeof showToast === 'function') {
        showToast('국내에서 일치하는 지역이 없습니다.', 'info');
      }
    } catch (err) {
      console.error(err);
      if (typeof showToast === 'function') showToast('지역 검색에 실패했습니다.', 'error');
    } finally {
      setWeatherLoading(false);
    }
  };

  const pickWeatherLocation = (loc) => {
    if (!loc) return;
    const normalized = {
      name: loc.name || loc.admin1 || '선택한 지역',
      lat: loc.latitude != null ? loc.latitude : loc.lat,
      lon: loc.longitude != null ? loc.longitude : loc.lon
    };
    if (typeof onUpdateWeatherLocation === 'function') onUpdateWeatherLocation(normalized);
    setWeatherQuery('');
    setWeatherResults([]);
    if (typeof showToast === 'function') showToast((normalized.name || '지역') + ' 날씨로 설정했습니다.', 'success');
  };

  return /*#__PURE__*/React.createElement("div", { className: "modal-overlay", onClick: onClose, style: { zIndex: 12000 } },
    /*#__PURE__*/React.createElement("div", {
      className: "modal-container", onClick: e => e.stopPropagation(),
      style: { maxWidth: '400px', width: '92%', backgroundColor: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-subtle)', overflow: 'hidden' }
    },
      /*#__PURE__*/React.createElement("div", { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid var(--border-subtle)' } },
        /*#__PURE__*/React.createElement("span", { style: { fontWeight: 900, fontSize: '0.98rem' } }, "설정"),
        /*#__PURE__*/React.createElement("button", { type: "button", onClick: onClose, style: { background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', display: 'flex' } },
          SmallXIcon ? /*#__PURE__*/React.createElement(SmallXIcon, { size: 20 }) : "✕")
      ),
      /*#__PURE__*/React.createElement("div", { style: { padding: '12px 16px 20px', display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '70vh', overflowY: 'auto' } },
        /* Weather region — above dark mode */
        /*#__PURE__*/React.createElement("div", { style: { padding: '6px 0 12px', display: 'flex', flexDirection: 'column', gap: '8px' } },
          /*#__PURE__*/React.createElement("div", {
            className: "admin-side-menu-setting-row",
            style: { padding: '4px 0 2px', alignItems: 'center' }
          },
            /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-setting-label" },
              /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-setting-icon" },
                MapCogIcon ? /*#__PURE__*/React.createElement(MapCogIcon, { size: 20 }) : null
              ),
              "날씨 지역"
            ),
            /*#__PURE__*/React.createElement("span", {
              style: { fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600, flexShrink: 0 }
            }, "현재 : ", /*#__PURE__*/React.createElement("span", { style: { color: 'var(--text-main)', fontWeight: 700 } }, currentWeatherName))
          ),
          /*#__PURE__*/React.createElement("form", {
            onSubmit: handleWeatherSearch,
            style: { display: 'flex', gap: '8px', alignItems: 'center' }
          },
            /*#__PURE__*/React.createElement("input", {
              type: "text",
              value: weatherQuery,
              onChange: e => setWeatherQuery(e.target.value),
              placeholder: "지역 이름 검색 (예: 구로구)",
              style: {
                flex: 1, minWidth: 0, padding: '10px 12px', borderRadius: '10px',
                border: '1px solid var(--border-subtle)', background: 'var(--bg-primary)',
                color: 'var(--text-main)', fontSize: '0.88rem', outline: 'none'
              }
            }),
            /*#__PURE__*/React.createElement("button", {
              type: "submit",
              disabled: weatherLoading,
              style: {
                flexShrink: 0, padding: '10px 14px', borderRadius: '10px', border: 'none',
                background: '#0f172a', color: '#fff', fontWeight: 700, fontSize: '0.82rem',
                cursor: weatherLoading ? 'wait' : 'pointer'
              }
            }, weatherLoading ? '검색중' : '검색')
          ),
          recentLocations && recentLocations.length > 0 && /*#__PURE__*/React.createElement("div", {
            style: { display: 'flex', flexWrap: 'wrap', gap: '6px' }
          },
            recentLocations.map((loc, idx) => /*#__PURE__*/React.createElement("button", {
              key: idx,
              type: "button",
              onClick: () => pickWeatherLocation(loc),
              style: {
                padding: '5px 10px', fontSize: '0.72rem', borderRadius: '6px',
                border: '1px solid var(--border-subtle)', background: 'var(--bg-primary)',
                color: 'var(--text-main)', cursor: 'pointer'
              }
            }, loc.name))
          ),
          weatherResults && weatherResults.length > 0 && /*#__PURE__*/React.createElement("div", {
            style: { display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '160px', overflowY: 'auto' }
          },
            weatherResults.map((loc, idx) => /*#__PURE__*/React.createElement("button", {
              key: loc.id || idx,
              type: "button",
              onClick: () => pickWeatherLocation(loc),
              style: {
                textAlign: 'left', padding: '8px 10px', borderRadius: '8px',
                border: '1px solid var(--border-subtle)', background: 'var(--bg-primary)',
                color: 'var(--text-main)', cursor: 'pointer', fontSize: '0.82rem'
              }
            }, loc.name, loc.admin1 ? ' · ' + loc.admin1 : ''))
          )
        ),
        /*#__PURE__*/React.createElement("div", {
          "aria-hidden": "true",
          style: { height: '0', borderTop: '1px solid var(--border-subtle)', margin: '12px 0' }
        }),
        /*#__PURE__*/React.createElement("div", { className: "admin-side-menu-setting-row", style: { padding: '10px 0' } },
          /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-setting-label" },
            /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-setting-icon" }, MoonStarsIcon && /*#__PURE__*/React.createElement(MoonStarsIcon, null)), "다크모드"),
          ToggleSwitch && /*#__PURE__*/React.createElement(ToggleSwitch, { checked: !!isDarkTheme, onChange: onToggleTheme, label: "다크모드" })
        ),
        /*#__PURE__*/React.createElement("div", { className: "admin-side-menu-setting-row", style: { padding: '10px 0' } },
          /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-setting-label" },
            /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-setting-icon" }, TextResizeIcon && /*#__PURE__*/React.createElement(TextResizeIcon, null)), "글자크기"),
          /*#__PURE__*/React.createElement("div", { className: "admin-side-menu-font-controls" },
            /*#__PURE__*/React.createElement("button", { type: "button", onClick: onDecreaseFont, className: "admin-side-menu-font-btn", "aria-label": "글자 크기 줄이기" }, "−"),
            /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-font-value" }, (fontScalePercent || 100) + "%"),
            /*#__PURE__*/React.createElement("button", { type: "button", onClick: onIncreaseFont, className: "admin-side-menu-font-btn", "aria-label": "글자 크기 늘리기" }, "+")
          )
        ),
        /*#__PURE__*/React.createElement("div", {
          "aria-hidden": "true",
          style: { height: '0', borderTop: '1px solid var(--border-subtle)', margin: '12px 0' }
        }),
        /*#__PURE__*/React.createElement("div", { className: "admin-side-menu-setting-row", style: { padding: '10px 0' } },
          /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-setting-label" },
            /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-setting-icon" }, BellIcon && /*#__PURE__*/React.createElement(BellIcon, null)), "알림허용"),
          ToggleSwitch && /*#__PURE__*/React.createElement(ToggleSwitch, { checked: !!isMasterNotifyEnabled, onChange: onToggleMasterNotify, label: "알림허용" })
        ),
        /*#__PURE__*/React.createElement("div", { style: { fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.45, padding: '0 2px 8px' } },
          isNotifPermissionGranted ? "브라우저 알림이 허용된 상태입니다. 아래에서 종류별로 켤 수 있습니다." : "스위치를 켜면 브라우저 알림 허용 요청이 표시됩니다."),
        /*#__PURE__*/React.createElement("div", {
          style: {
            marginTop: '4px', padding: '4px 10px', borderRadius: '12px',
            background: 'var(--bg-primary)', border: '1px solid var(--border-subtle)',
            opacity: isMasterNotifyEnabled ? 1 : 0.55
          }
        },
          channels.map(ch => /*#__PURE__*/React.createElement("div", {
            key: ch.key, className: "admin-side-menu-setting-row",
            style: { padding: '10px 2px' }
          },
            /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-setting-label", style: { fontSize: '0.88rem' } }, ch.label),
            ToggleSwitch && /*#__PURE__*/React.createElement(ToggleSwitch, {
              checked: !!(notifyChannels && notifyChannels[ch.key]),
              onChange: () => onToggleNotifyChannel && onToggleNotifyChannel(ch.key),
              label: ch.label
            })
          ))
        ),
        deviceRows.length > 0 && /*#__PURE__*/React.createElement("div", {
          style: {
            marginTop: '10px', padding: '12px 14px', borderRadius: '12px', background: 'var(--bg-primary)',
            border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '6px'
          }
        },
          /*#__PURE__*/React.createElement("div", { style: { fontWeight: 800, fontSize: '0.82rem', color: 'var(--text-main)', marginBottom: '2px' } },
            "등록된 기기 (", deviceRows.length, ")"),
          deviceRows.map(row => /*#__PURE__*/React.createElement("div", {
            key: row.id,
            style: {
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px',
              padding: '6px 0', borderTop: '1px solid var(--border-subtle)', fontSize: '0.78rem'
            }
          },
            /*#__PURE__*/React.createElement("div", { style: { minWidth: 0 } },
              /*#__PURE__*/React.createElement("div", { style: { fontWeight: 700, color: 'var(--text-main)' } },
                row.deviceLabel, row.isThis ? ' (이 기기)' : ''),
              /*#__PURE__*/React.createElement("div", { style: { color: 'var(--text-muted)', fontSize: '0.7rem', marginTop: '1px' } },
                row.lastSeenAt ? ('최근 ' + new Date(row.lastSeenAt).toLocaleDateString('ko-KR')) : '')
            ),
            /*#__PURE__*/React.createElement("button", {
              type: "button",
              onClick: () => handleDeleteDevice(row),
              style: {
                flexShrink: 0, border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.12)',
                color: '#EF4444', borderRadius: '6px', padding: '3px 8px', fontWeight: 700, fontSize: '0.7rem', cursor: 'pointer'
              }
            }, "삭제")
          ))
        ),
        Array.isArray(helpSteps) && helpSteps.length > 0 && /*#__PURE__*/React.createElement("div", {
          style: { marginTop: '10px', padding: '12px', borderRadius: '12px', background: 'var(--bg-primary)', border: 'none', fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.5 }
        },
          /*#__PURE__*/React.createElement("div", { style: { fontWeight: 800, color: 'var(--text-main)', marginBottom: '6px' } }, "설정 안내"),
          /*#__PURE__*/React.createElement("ol", { style: { margin: 0, paddingLeft: '18px' } },
            helpSteps.map((step, i) => /*#__PURE__*/React.createElement("li", { key: i, style: { marginBottom: '4px' } }, step))
          )
        )
      )
    )
  );
}

export function NotificationOnboardingModal({ onClose, isMasterNotifyEnabled, onToggleMasterNotify, helpSteps, browserLabel }) {
  const React = window.React;
  const __deps = window.GATHER_UI_DEPS || {};
  const SmallXIcon = __deps.SmallXIcon;
  const ToggleSwitch = __deps.ToggleSwitch;
  const BellIcon = __deps.BellIcon;
  return /*#__PURE__*/React.createElement("div", { className: "modal-overlay", style: { zIndex: 13000 } },
    /*#__PURE__*/React.createElement("div", {
      className: "modal-container", onClick: e => e.stopPropagation(),
      style: { maxWidth: '400px', width: '92%', backgroundColor: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-subtle)', overflow: 'hidden' }
    },
      /*#__PURE__*/React.createElement("div", { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid var(--border-subtle)' } },
        /*#__PURE__*/React.createElement("span", { style: { fontWeight: 900, fontSize: '0.98rem', display: 'flex', alignItems: 'center', gap: '6px' } },
          BellIcon && /*#__PURE__*/React.createElement(BellIcon, null), "알림 허용 안내"),
        /*#__PURE__*/React.createElement("button", { type: "button", onClick: onClose, style: { background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', display: 'flex' } },
          SmallXIcon ? /*#__PURE__*/React.createElement(SmallXIcon, { size: 20 }) : "✕")
      ),
      /*#__PURE__*/React.createElement("div", { style: { padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' } },
        /*#__PURE__*/React.createElement("div", {
          className: "admin-side-menu-setting-row",
          style: { padding: '14px 12px', borderRadius: '12px', background: 'var(--bg-primary)', border: '1px solid var(--border-subtle)' }
        },
          /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-setting-label", style: { fontWeight: 800 } }, "알림허용"),
          ToggleSwitch && /*#__PURE__*/React.createElement(ToggleSwitch, { checked: !!isMasterNotifyEnabled, onChange: onToggleMasterNotify, label: "알림허용" })
        ),
        /*#__PURE__*/React.createElement("p", { style: { margin: 0, fontSize: '0.84rem', color: 'var(--text-main)', lineHeight: 1.55 } },
          "채팅·메모·일정·투표 등 새 소식이 등록될 때 알림을 받으려면 알림허용이 필요합니다."),
        /*#__PURE__*/React.createElement("div", { style: { fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.5 } },
          /*#__PURE__*/React.createElement("div", { style: { fontWeight: 800, color: 'var(--text-main)', marginBottom: '6px' } }, (browserLabel || '브라우저') + " 설정 안내"),
          /*#__PURE__*/React.createElement("ol", { style: { margin: 0, paddingLeft: '18px' } },
            (helpSteps || []).map((step, i) => /*#__PURE__*/React.createElement("li", { key: i, style: { marginBottom: '4px' } }, step))
          )
        ),
        /*#__PURE__*/React.createElement("button", { type: "button", className: "btn btn-action-dark btn-action", onClick: onClose, style: { width: '100%', marginTop: '4px' } }, "확인")
      )
    )
  );
}


/** 공통 앱 네비: 채팅 / 정산 / 갤러리 / 장소 / 메모 */
export function SharedAppNavBlock({
  onClose,
  onChangeView,
  onOpenCreateSettlement,
  showSettlement = true,
  chatCount = 0,
  settlementBadge = null,
  galleryCount = 0,
  placeCount = 0,
  memoCount = 0,
  chatLastAuthor = null,
  settlementLastDate = null,
  galleryLastDate = null,
  placeLastName = null,
  memoLastTitleWord = null
}) {
  const React = window.React;
  const go = (view) => {
    if (typeof onChangeView === 'function') onChangeView(view);
    if (typeof onClose === 'function') onClose();
  };
  const badge = (count, muted = true) => count > 0 ? /*#__PURE__*/React.createElement("span", {
    className: "main-menu-badge",
    style: muted
      ? { backgroundColor: "var(--border-subtle)", color: "var(--text-muted)", marginLeft: "4px" }
      : { marginLeft: "4px" }
  }, count) : null;

  const metaPill = (text, styleExtra) => {
    if (!text) return null;
    const label = String(text).trim();
    if (!label) return null;
    return /*#__PURE__*/React.createElement("span", {
      className: "side-menu-meta-pill",
      title: label,
      style: Object.assign({
        marginLeft: "auto",
        alignSelf: "center",
        flexShrink: 0,
        maxWidth: "8.25rem",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "flex-end",
        height: "auto",
        minHeight: "auto",
        padding: "0",
        fontSize: "0.6rem",
        fontWeight: 500,
        lineHeight: 1.2,
        borderRadius: "0",
        backgroundColor: "transparent",
        border: "none",
        color: "var(--text-muted, #64748B)",
        boxSizing: "border-box",
        fontVariantNumeric: "tabular-nums"
      }, styleExtra || {})
    }, label);
  };

  const chatAuthorPill = () => {
    if (!chatLastAuthor || !chatLastAuthor.name) return null;
    const color = chatLastAuthor.color || "#64748B";
    return metaPill(chatLastAuthor.name, {
      border: "none",
      color: color,
      backgroundColor: "transparent"
    });
  };

  return /*#__PURE__*/React.createElement("div", {
    className: "admin-side-menu-list",
    style: { borderTop: '1px solid var(--border-subtle, #E2E8F0)', borderBottom: 'none', paddingTop: '6px', marginTop: '2px' }
  },
    /* 1. 채팅 */
    /*#__PURE__*/React.createElement("button", { type: "button", className: "admin-side-menu-item", onClick: () => go("chat") },
      /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-icon" }, /*#__PURE__*/React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2" }, /*#__PURE__*/React.createElement("path", { d: "M7.9 20A9 9 0 1 0 4 16.1L2 22Z" }))),
      /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-copy" },
        /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-title", style: { display: "flex", alignItems: "center", gap: "6px" } }, "채팅", badge(chatCount))
      ),
      chatAuthorPill()
    ),
    /* 4. 정산 */
    showSettlement && /*#__PURE__*/React.createElement("button", { type: "button", className: "admin-side-menu-item", onClick: () => go("settlement") },
      /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-icon" }, /*#__PURE__*/React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2" }, /*#__PURE__*/React.createElement("path", { d: "M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" }), /*#__PURE__*/React.createElement("path", { d: "M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" }))),
      /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-copy" },
        /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-title", style: { display: "flex", alignItems: "center", gap: "6px" } }, "정산",
          settlementBadge && settlementBadge.text && /*#__PURE__*/React.createElement("span", {
            className: "main-menu-badge",
            style: { backgroundColor: settlementBadge.bgColor || "#64748B", color: "#FFFFFF", marginLeft: "4px" }
          }, settlementBadge.text)
        )
      ),
      metaPill(settlementLastDate)
    ),
    /* 5. 갤러리 */
    /*#__PURE__*/React.createElement("button", { type: "button", className: "admin-side-menu-item", onClick: () => go("gallery") },
      /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-icon" }, /*#__PURE__*/React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2" }, /*#__PURE__*/React.createElement("rect", { width: "18", height: "18", x: "3", y: "3", rx: "2", ry: "2" }), /*#__PURE__*/React.createElement("circle", { cx: "9", cy: "9", r: "2" }), /*#__PURE__*/React.createElement("path", { d: "m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" }))),
      /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-copy" },
        /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-title", style: { display: "flex", alignItems: "center", gap: "6px" } }, "갤러리", badge(galleryCount))
      ),
      metaPill(galleryLastDate)
    ),
    /* 6. 장소 */
    /*#__PURE__*/React.createElement("button", { type: "button", className: "admin-side-menu-item", onClick: () => go("places") },
      /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-icon" }, /*#__PURE__*/React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2" }, /*#__PURE__*/React.createElement("path", { d: "M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" }), /*#__PURE__*/React.createElement("circle", { cx: "12", cy: "10", r: "3" }))),
      /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-copy" },
        /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-title", style: { display: "flex", alignItems: "center", gap: "6px" } }, "장소", badge(placeCount))
      ),
      metaPill(placeLastName)
    ),
    /* 7. 메모 */
    /*#__PURE__*/React.createElement("button", { type: "button", className: "admin-side-menu-item", onClick: () => go("memo") },
      /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-icon" }, /*#__PURE__*/React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2" }, /*#__PURE__*/React.createElement("path", { d: "M12 20h9" }), /*#__PURE__*/React.createElement("path", { d: "M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" }))),
      /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-copy" },
        /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-title", style: { display: "flex", alignItems: "center", gap: "6px" } }, "메모", badge(memoCount))
      ),
      metaPill(memoLastTitleWord)
    )
  );
}

export function SharedSideMenuFooter({ onClose, onOpenShare, onOpenSettings, shareLabel = '공유' }) {
  const React = window.React;
  const __deps = window.GATHER_UI_DEPS || {};
  const MenuIcon = __deps.MenuIcon;
  const handle = action => { if (typeof action === 'function') action(); };
  return /*#__PURE__*/React.createElement("div", {
    className: "admin-side-menu-list",
    style: { borderTop: '1px solid var(--border-subtle, #E2E8F0)', borderBottom: 'none', paddingTop: '6px', marginTop: '2px' }
  },
    typeof onOpenShare === 'function' && /*#__PURE__*/React.createElement("button", {
      type: "button", className: "admin-side-menu-item",
      onClick: () => { handle(onClose); handle(onOpenShare); }
    },
      /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-icon" }, MenuIcon ? /*#__PURE__*/React.createElement(MenuIcon, { paths: ["M3 12a3 3 0 1 0 6 0a3 3 0 1 0 -6 0", "M15 6a3 3 0 1 0 6 0a3 3 0 1 0 -6 0", "M15 18a3 3 0 1 0 6 0a3 3 0 1 0 -6 0", "M8.7 10.7l6.6 -3.4", "M8.7 13.3l6.6 3.4"] }) : "↗"),
      /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-copy" },
        /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-title" }, shareLabel)
      )
    ),
    typeof onOpenSettings === 'function' && /*#__PURE__*/React.createElement("button", {
      type: "button", className: "admin-side-menu-item",
      onClick: () => { handle(onClose); handle(onOpenSettings); }
    },
      /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-icon" }, /*#__PURE__*/React.createElement("svg", {
        xmlns: "http://www.w3.org/2000/svg", width: "20", height: "20", viewBox: "0 0 24 24",
        fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round"
      }, /*#__PURE__*/React.createElement("path", { d: "M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" }), /*#__PURE__*/React.createElement("circle", { cx: "12", cy: "12", r: "3" }))),
      /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-copy" },
        /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-title" }, "설정")
      )
    )
  );
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
  onOpenAppSettings,
  calendar,
  anniversaries = [],
  galleryCount = 0,
  placeCount = 0,
  chatCount = 0,
  memoCount = 0,
  settlementCount = 0,
  settlementBadge = null,
  chatLastAuthor = null,
  settlementLastDate = null,
  galleryLastDate = null,
  placeLastName = null,
  memoLastTitleWord = null,
  onClose,
  onOpenManual,
  onOpenSettings,
  onOpenAnniversaries,
  onOpenShare,
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
  onChangeView,
  onOpenCreateSettlement,
  showSettlement = true
}) {
  const React = window.React;
  const __deps = window.GATHER_UI_DEPS || {};
  const SharedSideMenuSettings = (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.SharedSideMenuSettings) || __deps.SharedSideMenuSettings;
  const SharedSideMenuFooter = (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.SharedSideMenuFooter) || __deps.SharedSideMenuFooter;
  const SharedAppNavBlock = (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.SharedAppNavBlock) || __deps.SharedAppNavBlock;
  const SmallXIcon = __deps.SmallXIcon;
  const MenuIcon = __deps.MenuIcon;
  const CalendarCogIcon = __deps.CalendarCogIcon;
  const MapCogIcon = __deps.MapCogIcon;
  const GiftIcon = __deps.GiftIcon;
  const LockIcon = __deps.LockIcon;
  const WeatherBadge = __deps.WeatherBadge;
  const WeatherLocationModal = __deps.WeatherLocationModal;

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
  React.useEffect(() => () => {
    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
  }, []);
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "admin-side-menu-overlay",
    onClick: onClose
  }, /*#__PURE__*/React.createElement("nav", {
    className: "admin-side-menu main-side-menu" + (isScrollingActive ? " scroll-active" : ""),
    "aria-label": "메인 메뉴",
    onClick: e => e.stopPropagation(),
    onMouseMove: triggerScrollActive,
    onScroll: triggerScrollActive
  },
	    /*#__PURE__*/React.createElement("div", { className: "admin-side-menu-header" },
	      /*#__PURE__*/React.createElement("div", { className: "admin-side-menu-brand" },
	        /*#__PURE__*/React.createElement("div", { className: "admin-side-menu-copy" },
	          /*#__PURE__*/React.createElement("button", {
	            type: "button",
	            className: "admin-side-menu-title",
	            title: "메인 화면",
	            "aria-label": "메인 화면",
	            onClick: () => { onClose && onClose(); if (typeof onChangeView === 'function') onChangeView('calendar'); },
	            style: {
	              background: 'none', border: 'none', padding: 0, margin: 0,
	              color: 'inherit',
	              cursor: 'pointer', textAlign: 'left'
	            }
	          }, "메뉴")
	        )
      ),
        /* Right container: Weather badge + Settings Icon + Close Button */
        /*#__PURE__*/React.createElement("div", {
          style: { display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }
        },
          /* Weather Badge only (region settings moved to AppSettingsModal) */
          /*#__PURE__*/React.createElement(WeatherBadge, { weatherLocation: calendar?.weatherLocation }),
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
    /* Group 1: manual (banner) + calendar settings */
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
      )
    ),
    /* Group 2: 채팅 / 정산 / 갤러리 / 장소 / 메모 */
    typeof SharedAppNavBlock === 'function' && /*#__PURE__*/React.createElement(SharedAppNavBlock, {
      onClose: onClose,
      onChangeView: onChangeView,
      onOpenCreateSettlement: onOpenCreateSettlement,
      showSettlement: showSettlement,
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
/* Group 3+4: 공유하기 + 설정 */
    typeof SharedSideMenuFooter === 'function' && /*#__PURE__*/React.createElement(SharedSideMenuFooter, {
      onClose: onClose,
      onOpenShare: onOpenShare,
      onOpenSettings: onOpenAppSettings,
      shareLabel: '공유'
    }),
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
  )));
}

  if (typeof window !== 'undefined') {
  window.GATHER_UI_COMPONENTS = Object.assign({}, window.GATHER_UI_COMPONENTS || {}, {
    SharedSideMenuSettings: SharedSideMenuSettings,
    SharedSideMenuFooter: SharedSideMenuFooter,
    SharedAppNavBlock: SharedAppNavBlock,
    AppSettingsModal: AppSettingsModal,
    NotificationOnboardingModal: NotificationOnboardingModal,
    MainSideMenu: MainSideMenu,
  });
}
