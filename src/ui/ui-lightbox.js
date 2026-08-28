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
function getTodayYmd() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}
function useChatSendGuard(onSend, canSend = true) {
  const React = window.React;
  const lockRef = React.useRef(false);
  return React.useCallback((...args) => {
    const isAllowed = typeof canSend === 'function' ? canSend(...args) : Boolean(canSend);
    if (!isAllowed || lockRef.current) return;
    lockRef.current = true;
    Promise.resolve(onSend && onSend(...args)).finally(() => {
      setTimeout(() => {
        lockRef.current = false;
      }, 250);
    });
  }, [onSend, canSend]);
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
function getMediaIdentityKeys(...args) {
  const f = __gatherUiDeps().getMediaIdentityKeys || GATHER_APP_UTILS.getMediaIdentityKeys;
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


export function LightboxInfoPanel({ info, onOpenUrl, tags = '', onSaveTags, onSearchTag, showToast, sourceInfo = null, showZoomControls = false, zoomLevel = 100, zoomMin = 50, zoomMax = 300, onZoomIn, onZoomOut, onZoomReset }) {
  const React = window.React;
  const __deps = window.GATHER_UI_DEPS || {};
  const TrashIcon = (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.TrashIcon) || __deps.TrashIcon;
  const LinkIcon = (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.LinkIcon) || __deps.LinkIcon;
  const ConfirmDialog = (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.ConfirmDialog) || __deps.ConfirmDialog;

  const tagTokens = String(tags || '').split(/[,\s#]+/).map(t => t.trim()).filter(Boolean);
  const [tagInput, setTagInput] = React.useState('');
  const [isSavingTags, setIsSavingTags] = React.useState(false);
  const [confirmDeleteTag, setConfirmDeleteTag] = React.useState(null);
  const [isDeletingTag, setIsDeletingTag] = React.useState(false);
  React.useEffect(() => { setTagInput(''); }, [tags]);
  if (!info.dateLabel && !info.typeLabel && !onSaveTags && !sourceInfo) return null;
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
      padding: '34px 14px 12px',
      background: 'linear-gradient(to top, rgba(0,0,0,0.84) 0%, rgba(0,0,0,0.84) 55%, rgba(0,0,0,0.5) 82%, transparent)',
      borderRadius: '0 0 var(--radius-md) var(--radius-md)',
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
    sourceInfo && /*#__PURE__*/React.createElement("div", { style: { display: 'flex', gap: '8px', alignItems: 'center' } },
      /*#__PURE__*/React.createElement("span", { style: labelStyle }, "출처"),
      sourceInfo.onClick
        ? /*#__PURE__*/React.createElement("button", {
          type: "button",
          onClick: e => { e.stopPropagation(); sourceInfo.onClick(); },
          style: {
            border: 'none', background: 'none', padding: 0, color: '#93C5FD', fontSize: 'inherit',
            fontWeight: 800, textDecoration: 'underline', cursor: 'pointer'
          }
        }, sourceInfo.label)
        : /*#__PURE__*/React.createElement("span", null, sourceInfo.label)
    ),
    info.typeLabel && /*#__PURE__*/React.createElement("div", {
      style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }
    },
      /*#__PURE__*/React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', minWidth: 0 } },
        info.typeLabel && /*#__PURE__*/React.createElement(React.Fragment, null,
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
        )
      ),
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
        }, /*#__PURE__*/React.createElement(TrashIcon, { size: 10 }))))
      ),
      /*#__PURE__*/React.createElement("button", {
        type: "button",
        className: "lightbox-url-btn",
        onClick: () => onOpenUrl && onOpenUrl(),
        style: {
          flexShrink: 0, height: '30px', padding: '0 10px', borderRadius: 'var(--radius-full)',
          border: '1px solid rgba(255,255,255,0.32)', background: 'rgba(255,255,255,0.14)',
          color: '#FFFFFF', display: 'inline-flex', alignItems: 'center', gap: '5px',
          cursor: 'pointer', fontSize: '0.72rem', fontWeight: 800, WebkitBackdropFilter: 'blur(6px)', backdropFilter: 'blur(6px)'
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

// PC-only zoom controls for the photo action row -- scoped to this file since they're not part
// of the shared icon set used elsewhere. Zoom-out is the same lucide zoom-in glyph minus its
// vertical stroke (matching lucide's own zoom-in/zoom-out pair).
function ZoomInIcon({ size = 15 } = {}) {
  const React = window.React;
  return /*#__PURE__*/React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg", width: String(size), height: String(size), viewBox: "0 0 24 24",
    fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round"
  },
    /*#__PURE__*/React.createElement("circle", { cx: "11", cy: "11", r: "8" }),
    /*#__PURE__*/React.createElement("line", { x1: "21", x2: "16.65", y1: "21", y2: "16.65" }),
    /*#__PURE__*/React.createElement("line", { x1: "11", x2: "11", y1: "8", y2: "14" }),
    /*#__PURE__*/React.createElement("line", { x1: "8", x2: "14", y1: "11", y2: "11" })
  );
}
function ZoomOutIcon({ size = 15 } = {}) {
  const React = window.React;
  return /*#__PURE__*/React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg", width: String(size), height: String(size), viewBox: "0 0 24 24",
    fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round"
  },
    /*#__PURE__*/React.createElement("circle", { cx: "11", cy: "11", r: "8" }),
    /*#__PURE__*/React.createElement("line", { x1: "21", x2: "16.65", y1: "21", y2: "16.65" }),
    /*#__PURE__*/React.createElement("line", { x1: "8", x2: "14", y1: "11", y2: "11" })
  );
}

// Must match the `transform ${LIGHTBOX_TRANSITION_MS}ms ease` set on the slide track below.
// handleTrackTransitionEnd already commits the pending nav exactly when that CSS transition
// finishes -- the setTimeout fallbacks (for the rare case a transitionend event never fires,
// e.g. the element is hidden mid-transition) used to fire at a shorter, unrelated 240ms, which
// beat transitionend every time and cut the slide animation short by ~40ms on every single
// navigation. Giving the timeout a safety margin past the real duration means transitionend
// normally wins and the timeout is only ever a backstop.
const LIGHTBOX_TRANSITION_MS = 230;
const LIGHTBOX_TRANSITION_FALLBACK_MS = LIGHTBOX_TRANSITION_MS + 90;
const LIGHTBOX_TRANSITION_EASING = 'cubic-bezier(0.22, 0.61, 0.36, 1)';

export function Lightbox({ urls, index, onClose, onNavigate, meta, showToast, onPromoteImageUrl, onSaveImageTags, onSearchTag, onDeletePhoto, onReplacePhoto, onJumpToChatMessage, onJumpToMemo, onJumpToMeetingDate, onJumpToGallery, onGetChatMessageOrdinal, onGetGalleryPhotoOrdinal, onRequestConfirm }) {
  const React = window.React;
  const __deps = window.GATHER_UI_DEPS || {};
  const TrashIcon = (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.TrashIcon) || __deps.TrashIcon;
  const PencilIcon = (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.PencilIcon) || __deps.PencilIcon;
  const ImageUrlModal = __deps.ImageUrlModal;
  const LightboxInfoPanel = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.LightboxInfoPanel;
  const buildLightboxImageInfo = __deps.buildLightboxImageInfo;

  const total = urls.length;
  const [showInfo, setShowInfo] = React.useState(false);
  const [imageUrlModalOpen, setImageUrlModalOpen] = React.useState(false);
  const [imageDimensions, setImageDimensions] = React.useState({});
  const [displayUrls, setDisplayUrls] = React.useState(urls);
  const [imageLoadFailed, setImageLoadFailed] = React.useState(false);
  // Zoom is PC-only -- mobile already has native pinch-to-zoom on the image, and a live
  // matchMedia listener (not a one-time read) so the buttons correctly appear/disappear if a
  // desktop window is resized narrow or a tablet is rotated while the lightbox is open.
  const [isDesktop, setIsDesktop] = React.useState(() => typeof window !== 'undefined' && window.matchMedia && !window.matchMedia('(max-width: 640px)').matches);
  React.useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined;
    const mq = window.matchMedia('(max-width: 640px)');
    const onChange = () => setIsDesktop(!mq.matches);
    if (mq.addEventListener) mq.addEventListener('change', onChange);
    else if (mq.addListener) mq.addListener(onChange);
    return () => {
      if (mq.removeEventListener) mq.removeEventListener('change', onChange);
      else if (mq.removeListener) mq.removeListener(onChange);
    };
  }, []);
  // ZOOM_DEFAULT (100%, fit-view) is the neutral/reset value -- ZOOM_MIN lets the user zoom
  // further OUT than that too (shrinking the photo within its frame), so it's no longer the
  // floor the way it was when 100% was both the minimum and the default.
  const ZOOM_MIN = 50;
  const ZOOM_MAX = 300;
  const ZOOM_STEP = 25;
  const ZOOM_DEFAULT = 100;
  const [zoomLevel, setZoomLevel] = React.useState(ZOOM_DEFAULT);
  // Drag-to-pan once zoomed past fit-view -- panOffset is a screen-pixel translate applied
  // before the scale (see zoomImageStyle below), so it stays 1:1 with cursor movement regardless
  // of zoom level. Reset to {0,0} on every zoom-button click rather than trying to re-clamp the
  // existing offset against the new scale -- simpler and avoids the image appearing to jump to
  // an now-invalid position when zooming out.
  const [panOffset, setPanOffset] = React.useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = React.useState(false);
  const zoomedImgRef = React.useRef(null);
  const panStartRef = React.useRef(null);
  const isPanningRef = React.useRef(false);
  // Reset to 100% whenever the visible photo changes, so zoom never carries over onto a
  // different image (which would show it pre-cropped/enlarged with no visual cue why).
  React.useEffect(() => { setZoomLevel(ZOOM_DEFAULT); setPanOffset({ x: 0, y: 0 }); }, [index]);
  const handleZoomIn = e => {
    e.stopPropagation();
    setShowInfo(false);
    setPanOffset({ x: 0, y: 0 });
    setZoomLevel(prev => Math.min(ZOOM_MAX, prev + ZOOM_STEP));
  };
  const handleZoomOut = e => {
    e.stopPropagation();
    setShowInfo(false);
    setPanOffset({ x: 0, y: 0 });
    setZoomLevel(prev => Math.max(ZOOM_MIN, prev - ZOOM_STEP));
  };
  // Clicking the percentage readout itself jumps straight back to 100%, regardless of which
  // direction it was zoomed.
  const handleZoomReset = e => {
    e.stopPropagation();
    setPanOffset({ x: 0, y: 0 });
    setZoomLevel(ZOOM_DEFAULT);
    setShowInfo(true);
  };
  // Clamped so the image can't be dragged entirely off-screen -- bounds come from the actual
  // rendered (post-scale) image box vs. the lightbox's own viewport cap (92vw / 82vh, matching
  // the maxWidth/maxHeight used everywhere below), not a fixed guess, so it works the same at
  // any zoom level or original photo aspect ratio. Gated on ZOOM_DEFAULT rather than ZOOM_MIN --
  // below 100% the photo is smaller than its frame with nothing to pan to, so panning only makes
  // sense once zoomed in past fit-view.
  const handlePanStart = (clientX, clientY) => {
    if (zoomLevel <= ZOOM_DEFAULT) return;
    panStartRef.current = { x: clientX, y: clientY, startX: panOffset.x, startY: panOffset.y };
    isPanningRef.current = true;
    wasDraggedRef.current = false;
    setIsPanning(true);
  };
  const handlePanMove = (clientX, clientY) => {
    if (!isPanningRef.current || !panStartRef.current) return;
    if (Math.abs(clientX - panStartRef.current.x) > 5 || Math.abs(clientY - panStartRef.current.y) > 5) {
      // Reuses the same ref handleImageTap already checks to distinguish a drag from a tap, so
      // releasing the mouse after panning doesn't also toggle the info panel off.
      wasDraggedRef.current = true;
    }
    const el = zoomedImgRef.current;
    const rect = el ? el.getBoundingClientRect() : null;
    const area = imgAreaRef.current;
    const areaRect = area ? area.getBoundingClientRect() : null;
    const maxOffsetX = rect ? Math.max(0, (rect.width - (areaRect?.width || window.innerWidth * 0.92)) / 2) : 0;
    const maxOffsetY = rect ? Math.max(0, (rect.height - (areaRect?.height || window.innerHeight * 0.82)) / 2) : 0;
    const rawX = panStartRef.current.startX + (clientX - panStartRef.current.x);
    const rawY = panStartRef.current.startY + (clientY - panStartRef.current.y);
    setPanOffset({
      x: Math.min(maxOffsetX, Math.max(-maxOffsetX, rawX)),
      y: Math.min(maxOffsetY, Math.max(-maxOffsetY, rawY))
    });
  };
  const handlePanEnd = () => {
    if (!isPanningRef.current) return;
    isPanningRef.current = false;
    panStartRef.current = null;
    setIsPanning(false);
  };
  const handleZoomedImageMouseDown = e => {
    if (!isDesktop || zoomLevel <= ZOOM_DEFAULT) return;
    e.stopPropagation();
    handlePanStart(e.clientX, e.clientY);
  };
  const zoomImageStyle = zoomLevel !== ZOOM_DEFAULT
    ? {
        transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel / 100})`,
        transition: isPanning ? 'none' : 'transform 150ms ease',
        cursor: isPanning ? 'grabbing' : 'grab'
      }
    : undefined;
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
  React.useEffect(() => { setShowInfo(false); setImageLoadFailed(false); }, [index]);
  const currentUrl = displayUrls[index] || urls[index];
  React.useEffect(() => {
    setImageLoadFailed(false);
  }, [currentUrl]);
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
  const currentIdentity = currentMeta
    ? (getMediaIdentityKeys(currentMeta, { source: currentMeta.source, meetingDate: currentMeta.meetingDate }) || {})
    : {};
  // 'meeting' entries never carry a messageId (they're archival copies stored on the
  // confirmedMeeting record, not a chat message -- see linkTaggedImageToMeetingDates in
  // app-main.js), so they need meetingDate+photoId to identify which photo instead. 'memo'
  // entries DO carry a truthy messageId (the memo's own id), but that id only resolves against
  // the messages collection, not memos -- tags there are a whole-memo field with no single-photo
  // target, so editing is intentionally left disabled rather than silently failing to save.
  const isMeetingPhoto = currentMeta?.source === 'meeting' && !!currentMeta?.meetingDate && !!currentMeta?.photoId;
  // Was keyed on source === 'chat' specifically, which left tag editing silently disabled for
  // any directMediaUrl entry (a link pasted as plain text in a message, single or multi-image --
  // see DirectChatMediaText) since those never set `source` at all. Reworked to mirror
  // canEditPhoto's structure below: 'meeting' is the one case needing isMeetingPhoto, 'memo' stays
  // explicitly disabled (a memo's tags are a whole-memo field, no single-photo target to write
  // to -- see the comment above), and everything else (chat, chat-tag, or an untagged
  // directMediaUrl entry) just needs a real messageId to write handleSaveImageTags' update to.
  const canEditTags = currentMeta && (
    currentMeta.source === 'meeting' ? isMeetingPhoto :
    currentMeta.source === 'memo' ? false :
    currentMeta.messageId != null
  );
  const tagOverrideKey = currentMeta
    ? [
        'lb',
        currentMeta.messageId || currentMeta.sourceMessageId || '',
        Number.isInteger(currentMeta.imageIndex)
          ? currentMeta.imageIndex
          : (Number.isInteger(currentMeta.sourceImageIndex) ? currentMeta.sourceImageIndex : ''),
        currentUrl || currentMeta.directMediaUrl || currentMeta.thumb || '',
        currentMeta.photoId || currentMeta.meetingDate || ''
      ].join('::')
    : null;
  const currentTags = (tagOverrideKey && Object.prototype.hasOwnProperty.call(tagOverrides, tagOverrideKey))
    ? tagOverrides[tagOverrideKey]
    : (currentMeta?.tags || '');
  // Mirrors handleSaveImageTags' own parse/dedupe/limit rules so the optimistic override shown
  // here matches what actually got persisted, without needing the save call to round-trip it.
  const normalizeTagsForDisplay = text => Array.from(new Set(
    String(text || '').split(/[,\s#]+/).map(t => t.trim()).filter(Boolean)
  )).slice(0, 10).join(' ');
  const saveCurrentTags = onSaveImageTags && canEditTags
    ? async tagsText => {
        const ok = await onSaveImageTags(currentMeta.messageId, currentMeta.imageIndex, tagsText, {
          ...currentMeta,
          imageUrl: currentUrl
        });
        if (ok && tagOverrideKey) setTagOverrides(prev => ({ ...prev, [tagOverrideKey]: normalizeTagsForDisplay(tagsText) }));
        return ok;
      }
    : null;
  // Unlike tag editing, memo photos DO have a clean single-item delete/replace target (their
  // own imageUrls[imageIndex]), even though memo TAGS are a whole-memo field with no such
  // target -- so this is intentionally broader than canEditTags above.
  const canEditPhoto = !!(currentMeta && !currentMeta.directMediaUrl && (
    currentMeta.source === 'meeting' ? isMeetingPhoto : currentMeta.messageId != null
  ));
  // "채팅 #117" -- the message's 1-based position in the calendar's full chat history, fetched
  // on demand (Firestore count() aggregate, independent of how much chat history the client has
  // paginated in) and cached per messageId so revisiting the same photo doesn't refetch it.
  const chatOrdinalFetchedRef = React.useRef(new Set());
  const [chatOrdinalCache, setChatOrdinalCache] = React.useState({});
  React.useEffect(() => {
    // Only fetch once the info panel is actually open -- it's the only place the label shows,
    // and eagerly firing a count() query for every photo as the user swipes past it (most of
    // which never get a second look) added real extra Firestore traffic for no visible benefit.
    if (!showInfo) return;
    if (!currentMeta || currentMeta.source === 'meeting' || currentMeta.source === 'memo' || currentMeta.meetingDate) return;
    if (currentMeta.uploadSource === 'gallery') return; // uses the photo-ordinal fetch below instead
    // 'meeting'-uploadSource photos are hidden from the chat feed (see ChatRoomView's render
    // filter), so a chat ordinal for them is never shown/clickable -- no point fetching it.
    if (currentMeta.uploadSource === 'meeting') return;
    if (typeof onGetChatMessageOrdinal !== 'function') return;
    const key = currentMeta.messageId;
    const ts = currentMeta.timestamp;
    if (!key || !ts || chatOrdinalFetchedRef.current.has(key)) return;
    chatOrdinalFetchedRef.current.add(key);
    let cancelled = false;
    Promise.resolve(onGetChatMessageOrdinal(ts)).then(n => {
      if (!cancelled && typeof n === 'number') setChatOrdinalCache(prev => ({ ...prev, [key]: n }));
    });
    return () => { cancelled = true; };
  }, [showInfo, currentMeta, onGetChatMessageOrdinal]);
  // "갤러리 #20" -- the photo's 1-based position among every photo ever uploaded through the
  // gallery's own "이미지 업로드" action, counted (and cached) the same on-demand way as the
  // chat ordinal above, but by photo rather than by message (see fetchGalleryPhotoOrdinal).
  const galleryOrdinalFetchedRef = React.useRef(new Set());
  const [galleryOrdinalCache, setGalleryOrdinalCache] = React.useState({});
  React.useEffect(() => {
    if (!showInfo) return;
    if (!currentMeta || currentMeta.uploadSource !== 'gallery') return;
    if (typeof onGetGalleryPhotoOrdinal !== 'function') return;
    const messageId = currentMeta.messageId;
    if (!messageId) return;
    const key = currentIdentity.assetKey || currentIdentity.refKey || currentIdentity.mediaKey || `${messageId}_${currentMeta.imageIndex || 0}`;
    if (galleryOrdinalFetchedRef.current.has(key)) return;
    galleryOrdinalFetchedRef.current.add(key);
    let cancelled = false;
    Promise.resolve(onGetGalleryPhotoOrdinal(messageId, currentMeta.imageIndex)).then(n => {
      if (!cancelled && typeof n === 'number') setGalleryOrdinalCache(prev => ({ ...prev, [key]: n }));
    });
    return () => { cancelled = true; };
  }, [showInfo, currentMeta, onGetGalleryPhotoOrdinal]);
  const sourceInfo = React.useMemo(() => {
    if (!currentMeta) return null;

    const formatScheduleLabel = (dateStr) => {
      if (!dateStr || !isValidDateString(dateStr)) return '';
      const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
      const [y, m, d] = dateStr.split('-').map(Number);
      const dt = new Date(y, m - 1, d);
      const yy = String(y).slice(-2);
      const mm = String(m).padStart(2, '0');
      const dd = String(d).padStart(2, '0');
      const dayName = dayNames[dt.getDay()];
      return `일정 ${yy}.${mm}.${dd}(${dayName})`;
    };

    let targetMeetingDate = currentMeta.meetingDate || (currentMeta.photoId && currentMeta.photoId.match(/\d{4}-\d{2}-\d{2}/)?.[0]);
    if (!targetMeetingDate && currentMeta.tags) {
      const dateMatch = String(currentMeta.tags).match(/(?:#|^|\s)(20\d{2}-\d{2}-\d{2}|\d{6})(?:\s|$)/);
      if (dateMatch) {
        const rawToken = dateMatch[1];
        if (rawToken.length === 6) {
          targetMeetingDate = `20${rawToken.slice(0, 2)}-${rawToken.slice(2, 4)}-${rawToken.slice(4, 6)}`;
        } else {
          targetMeetingDate = rawToken;
        }
      }
    }

    if (currentMeta.source === 'meeting' || currentMeta.uploadSource === 'meeting' || targetMeetingDate) {
      const dateStr = targetMeetingDate || (currentMeta.timestamp ? new Date(currentMeta.timestamp).toISOString().slice(0, 10) : (typeof getTodayYmd === 'function' ? getTodayYmd() : ''));
      const label = formatScheduleLabel(dateStr) || `일정 ${dateStr || ''}`;
      return {
        label: label,
        onClick: (onJumpToMeetingDate && dateStr) ? () => { closeLightbox(); onJumpToMeetingDate(dateStr, 'photo'); } : null
      };
    }

    if (currentMeta.source === 'memo') {
      const msgId = currentMeta.messageId || currentMeta.sourceMessageId;
      return {
        label: '메모',
        onClick: (onJumpToMemo && msgId) ? () => { closeLightbox(); onJumpToMemo(msgId); } : null
      };
    }

    if (currentMeta.uploadSource === 'gallery' || currentMeta.source === 'gallery') {
      const galleryKey = currentMeta.messageId != null ? `${currentMeta.messageId}_${currentMeta.imageIndex || 0}` : null;
      const galleryOrdinal = galleryKey != null ? galleryOrdinalCache[galleryKey] : null;
      const msgId = currentMeta.messageId != null ? currentMeta.messageId : currentMeta.sourceMessageId;
      return {
        label: typeof galleryOrdinal === 'number' ? `갤러리 #${galleryOrdinal}` : '갤러리',
        onClick: (onJumpToGallery && (msgId != null || currentUrl)) ? () => { closeLightbox(); onJumpToGallery(msgId, currentMeta.imageIndex, currentUrl); } : null
      };
    }

    const msgId = currentMeta.messageId != null ? currentMeta.messageId : currentMeta.sourceMessageId;
    const ordinal = msgId != null ? chatOrdinalCache[msgId] : null;
    return {
      label: typeof ordinal === 'number' ? `채팅 #${ordinal}` : '채팅',
      onClick: (onJumpToChatMessage && msgId) ? () => { closeLightbox(); onJumpToChatMessage(msgId); } : null
    };
  }, [currentMeta, currentUrl, closeLightbox, onJumpToChatMessage, onJumpToMemo, onJumpToMeetingDate, onJumpToGallery, chatOrdinalCache, galleryOrdinalCache]);
  const replacePhotoInputRef = React.useRef(null);
  const [isReplacingPhoto, setIsReplacingPhoto] = React.useState(false);
  const [isDeletingPhoto, setIsDeletingPhoto] = React.useState(false);
  const replacePhotoWithFile = async file => {
    if (!file || !onReplacePhoto || !currentMeta || isReplacingPhoto) return;
    setIsReplacingPhoto(true);
    try {
      const nextUrl = await onReplacePhoto({ ...currentMeta, imageUrl: currentUrl }, file);
      if (nextUrl && typeof nextUrl === 'string') {
        setDisplayUrls(prev => prev.map((item, i) => i === index ? nextUrl : item));
      }
    } finally {
      setIsReplacingPhoto(false);
    }
  };
  const handleReplacePhotoFile = async event => {
    const file = event.target.files && event.target.files[0];
    event.target.value = '';
    await replacePhotoWithFile(file);
  };
  // Lets 사진 교체 accept a clipboard-pasted image too, not just the file picker -- active
  // whenever this photo is editable, so Ctrl+V while the Lightbox is open replaces the photo
  // currently on screen directly (no need to click the pencil button first).
  React.useEffect(() => {
    if (!canEditPhoto || !onReplacePhoto) return;
    const handlePaste = e => {
      const files = getImageFilesFromClipboardEvent(e);
      if (!files.length) return;
      e.preventDefault();
      replacePhotoWithFile(files[0]);
    };
    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [canEditPhoto, onReplacePhoto, currentMeta, currentUrl, index, isReplacingPhoto]);
  const handleDeletePhotoClick = () => {
    if (!onDeletePhoto || !currentMeta || isDeletingPhoto) return;
    const confirmAction = async () => {
      setIsDeletingPhoto(true);
      try {
        const ok = await onDeletePhoto({ ...currentMeta, imageUrl: currentUrl });
        // No good way to remove just this one entry from the static urls/meta snapshot the
        // parent handed in -- close and let the next open reflect live data instead.
        if (ok) closeLightbox();
      } finally {
        setIsDeletingPhoto(false);
      }
    };
    if (typeof onRequestConfirm === 'function') {
      onRequestConfirm('사진 삭제', '이 사진을 삭제하시겠습니까?', confirmAction);
    }
  };
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
  const transitionTimerRef = React.useRef(null);
  const touchGestureRef = React.useRef(null);
  const [dragPx, setDragPx] = React.useState(0);
  const [transitionOn, setTransitionOn] = React.useState(false);
  const [isDragging, setIsDragging] = React.useState(false);

  const clearTransitionTimer = () => {
    if (transitionTimerRef.current) {
      clearTimeout(transitionTimerRef.current);
      transitionTimerRef.current = null;
    }
  };

  const commitPendingNav = React.useCallback(() => {
    clearTransitionTimer();
    if (pendingNavRef.current != null) {
      const next = pendingNavRef.current;
      pendingNavRef.current = null;
      setTransitionOn(false);
      setDragPx(0);
      onNavigate(next);
      return next;
    }
    return null;
  }, [onNavigate]);

  React.useEffect(() => {
    clearTransitionTimer();
    pendingNavRef.current = null;
    touchGestureRef.current = null;
    isPanningRef.current = false;
    panStartRef.current = null;
    setTransitionOn(false);
    setDragPx(0);
    setPanOffset({ x: 0, y: 0 });
    setIsPanning(false);
    isDraggingRef.current = false;
    setIsDragging(false);
  }, [index]);

  const goTo = i => {
    if (i < 0 || i >= total || i === index) return;
    setShowInfo(false);
    onNavigate(i);
  };
  // Adjacent (±1) navigation slides the track by exactly one container-width, same visual
  // motion as a completed drag -- used by the arrow buttons and arrow keys so every way of
  // moving between photos feels like the same carousel, not just the drag gesture.
  const animateToAdjacent = newIndex => {
    // While a transition is already in flight, `index` (the last *committed* photo) is stale --
    // pendingNavRef already holds the photo this is animating toward, so that's the real
    // "current position" a second rapid click should be measured against. Used to just commit
    // whatever was already pending and drop the new click's target entirely, which made fast
    // repeated taps (exactly the "빠르게 작동하는 환경" case) feel like every other press did
    // nothing.
    const from = pendingNavRef.current != null ? pendingNavRef.current : index;
    if (newIndex < 0 || newIndex >= total || newIndex === from) return;
    setShowInfo(false);
    if (pendingNavRef.current != null) {
      // Commit the in-flight nav immediately (skipping its remaining animation) so the new one
      // starts from a clean, consistent state instead of stacking on top of it.
      commitPendingNav();
    }
    const el = imgAreaRef.current;
    const width = (el && el.getBoundingClientRect().width) || window.innerWidth * 0.92 || 1;
    widthRef.current = width;
    pendingNavRef.current = newIndex;
    setTransitionOn(true);
    setDragPx(newIndex > from ? -width : width);

    clearTransitionTimer();
    transitionTimerRef.current = setTimeout(() => {
      commitPendingNav();
    }, LIGHTBOX_TRANSITION_FALLBACK_MS);
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
    if (pendingNavRef.current != null) {
      commitPendingNav();
    }
    const el = imgAreaRef.current;
    widthRef.current = el ? el.getBoundingClientRect().width : window.innerWidth * 0.92;
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
    const width = widthRef.current || window.innerWidth * 0.92 || 1;
    const threshold = width * SWIPE_THRESHOLD_RATIO;
    if (Math.abs(dragPx) >= threshold) setShowInfo(false);
    setTransitionOn(true);
    setDragPx(current => {
      if (current <= -threshold && index < total - 1) {
        pendingNavRef.current = index + 1;
        clearTransitionTimer();
        transitionTimerRef.current = setTimeout(() => {
          commitPendingNav();
        }, LIGHTBOX_TRANSITION_FALLBACK_MS);
        return -width;
      }
      if (current >= threshold && index > 0) {
        pendingNavRef.current = index - 1;
        clearTransitionTimer();
        transitionTimerRef.current = setTimeout(() => {
          commitPendingNav();
        }, LIGHTBOX_TRANSITION_FALLBACK_MS);
        return width;
      }
      pendingNavRef.current = null;
      return 0;
    });
  };
  const getTouchDistance = touches => {
    const a = touches[0];
    const b = touches[1];
    return Math.max(1, Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY));
  };
  const getTouchCenter = touches => ({
    x: (touches[0].clientX + touches[1].clientX) / 2,
    y: (touches[0].clientY + touches[1].clientY) / 2
  });
  const clampPanOffset = (x, y) => {
    const image = zoomedImgRef.current;
    const area = imgAreaRef.current;
    const imageRect = image ? image.getBoundingClientRect() : null;
    const areaRect = area ? area.getBoundingClientRect() : null;
    const maxX = imageRect ? Math.max(0, (imageRect.width - (areaRect?.width || window.innerWidth)) / 2) : 0;
    const maxY = imageRect ? Math.max(0, (imageRect.height - (areaRect?.height || window.innerHeight)) / 2) : 0;
    return {
      x: Math.min(maxX, Math.max(-maxX, x)),
      y: Math.min(maxY, Math.max(-maxY, y))
    };
  };
  // On mobile, one finger swipes the carousel at 100%, while a pinch enters a
  // zoom-and-pan mode. This avoids native image gestures competing with the carousel.
  const handleTouchStart = e => {
    if (e.touches.length >= 2) {
      e.preventDefault();
      if (isDraggingRef.current) {
        isDraggingRef.current = false;
        dragStartXRef.current = null;
        setIsDragging(false);
        setDragPx(0);
      }
      touchGestureRef.current = {
        mode: 'pinch',
        distance: getTouchDistance(e.touches),
        center: getTouchCenter(e.touches),
        zoom: Math.max(ZOOM_DEFAULT, zoomLevel),
        pan: { ...panOffset }
      };
      isPanningRef.current = true;
      setIsPanning(true);
      wasDraggedRef.current = true;
      setShowInfo(false);
      return;
    }
    const touch = e.touches[0];
    if (!touch) return;
    if (zoomLevel > ZOOM_DEFAULT) {
      e.preventDefault();
      touchGestureRef.current = { mode: 'pan' };
      handlePanStart(touch.clientX, touch.clientY);
      return;
    }
    touchGestureRef.current = { mode: 'carousel' };
    handleDragStart(touch.clientX);
  };
  const handleTouchMove = e => {
    const gesture = touchGestureRef.current;
    if (!gesture) return;
    if (e.touches.length >= 2) {
      e.preventDefault();
      const distance = getTouchDistance(e.touches);
      const center = getTouchCenter(e.touches);
      const nextZoom = Math.min(ZOOM_MAX, Math.max(ZOOM_DEFAULT, gesture.zoom * distance / gesture.distance));
      setZoomLevel(nextZoom);
      setPanOffset(clampPanOffset(
        gesture.pan.x + center.x - gesture.center.x,
        gesture.pan.y + center.y - gesture.center.y
      ));
      wasDraggedRef.current = true;
      return;
    }
    const touch = e.touches[0];
    if (!touch) return;
    if (gesture.mode === 'pan') {
      e.preventDefault();
      handlePanMove(touch.clientX, touch.clientY);
    } else if (gesture.mode === 'carousel') {
      e.preventDefault();
      handleDragMove(touch.clientX);
    }
  };
  const handleTouchEnd = e => {
    const gesture = touchGestureRef.current;
    if (!gesture || e.touches.length >= 2) return;
    if (gesture.mode === 'pinch' && e.touches.length === 1 && zoomLevel > ZOOM_DEFAULT) {
      const touch = e.touches[0];
      touchGestureRef.current = { mode: 'pan' };
      handlePanStart(touch.clientX, touch.clientY);
      return;
    }
    touchGestureRef.current = null;
    if (gesture.mode === 'pan') handlePanEnd();
    else if (gesture.mode === 'pinch') handlePanEnd();
    else if (gesture.mode === 'carousel') handleDragEnd();
  };
  // Mouse move/up are tracked at the document level (unlike touchmove/touchend, which keep
  // firing on their original target even once the finger leaves it) so the drag keeps working
  // if the cursor leaves the image area mid-drag. Pan-dragging (zoomed image) and slide-nav
  // dragging (carousel) are mutually exclusive -- handleZoomedImageMouseDown stops the mousedown
  // from ever reaching the carousel container while zoomed, so isPanningRef alone is enough to
  // route move/up to the right handler here.
  React.useEffect(() => {
    const onMouseMove = e => {
      if (isPanningRef.current) { handlePanMove(e.clientX, e.clientY); return; }
      handleDragMove(e.clientX);
    };
    const onMouseUp = () => {
      if (isPanningRef.current) { handlePanEnd(); return; }
      handleDragEnd();
    };
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
  }, [index, total]);
  const handleTrackTransitionEnd = e => {
    if (e.target !== e.currentTarget || e.propertyName !== 'transform') return;
    commitPendingNav();
  };
  const handleOverlayClick = () => {
    if (wasDraggedRef.current) {
      wasDraggedRef.current = false;
      return;
    }
    closeLightbox();
  };
  const handleCurrentImageError = () => {
    const thumbUrl = String(currentMeta && currentMeta.thumb || '').trim();
    const current = String(currentUrl || '').trim();
    if (thumbUrl && thumbUrl !== current) {
      setDisplayUrls(prev => prev.map((item, i) => i === index ? thumbUrl : item));
      return;
    }
    setImageLoadFailed(true);
  };

  // Shared by both the carousel's "current" slot and the single-image layout below --
  // left-aligned edit/delete buttons plus centered zoom controls on the same row.
  const renderPhotoActions = () => (showInfo && zoomLevel === ZOOM_DEFAULT && (canEditPhoto || isDesktop)) && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: '8px',
      left: '8px',
      right: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      zIndex: 10,
      pointerEvents: 'none'
    },
    onClick: e => e.stopPropagation()
  },
    /*#__PURE__*/React.createElement("div", {
      style: { display: 'flex', alignItems: 'center', gap: '6px', pointerEvents: 'auto' }
    },
      canEditPhoto && onDeletePhoto && /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: handleDeletePhotoClick,
        disabled: isReplacingPhoto || isDeletingPhoto,
        "aria-label": "사진 삭제",
        title: "사진 삭제",
        style: {
          width: '30px', height: '30px', borderRadius: '50%', border: 'none',
          background: 'rgba(15,23,42,0.62)', color: '#FFFFFF', display: 'flex',
          alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '0.72rem',
          opacity: (isReplacingPhoto || isDeletingPhoto) ? 0.5 : 1
        }
      }, isDeletingPhoto ? '...' : /*#__PURE__*/React.createElement(TrashIcon, { size: 15 })),
      canEditPhoto && onReplacePhoto && /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: () => replacePhotoInputRef.current && replacePhotoInputRef.current.click(),
        disabled: isReplacingPhoto || isDeletingPhoto,
        "aria-label": "사진 편집",
        title: "사진 교체",
        style: {
          width: '30px', height: '30px', borderRadius: '50%', border: 'none',
          background: 'rgba(15,23,42,0.62)', color: '#FFFFFF', display: 'flex',
          alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '0.72rem',
          opacity: (isReplacingPhoto || isDeletingPhoto) ? 0.5 : 1
        }
      }, isReplacingPhoto ? '...' : /*#__PURE__*/React.createElement(PencilIcon, { size: 15 }))
    ),
    isDesktop && /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        pointerEvents: 'auto'
      }
    },
      /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: handleZoomOut,
        disabled: zoomLevel <= ZOOM_MIN,
        "aria-label": "축소",
        title: "축소",
        style: {
          width: '30px',
          height: '30px',
          borderRadius: '50%',
          border: 'none',
          background: 'rgba(15,23,42,0.62)',
          color: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          fontSize: '0.72rem',
          opacity: zoomLevel <= ZOOM_MIN ? 0.5 : 1
        }
      }, /*#__PURE__*/React.createElement(ZoomOutIcon, { size: 14 })),
      /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: handleZoomReset,
        disabled: zoomLevel === ZOOM_DEFAULT,
        "aria-label": "100%로 초기화",
        title: "100%로 초기화",
        style: {
          width: '30px',
          height: '30px',
          borderRadius: '50%',
          border: 'none',
          background: 'rgba(15,23,42,0.62)',
          color: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: zoomLevel === ZOOM_DEFAULT ? 'default' : 'pointer',
          fontSize: '0.62rem',
          fontWeight: 900,
          opacity: zoomLevel === ZOOM_DEFAULT ? 0.7 : 1
        }
      }, `${zoomLevel}%`),
      /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: handleZoomIn,
        disabled: zoomLevel >= ZOOM_MAX,
        "aria-label": "확대",
        title: "확대",
        style: {
          width: '30px',
          height: '30px',
          borderRadius: '50%',
          border: 'none',
          background: 'rgba(15,23,42,0.62)',
          color: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          fontSize: '0.72rem',
          opacity: zoomLevel >= ZOOM_MAX ? 0.5 : 1
        }
      }, /*#__PURE__*/React.createElement(ZoomInIcon, { size: 14 }))
    )
  );

  const renderSlide = (url, slot) => {
    const wrapperStyle = { width: '33.3333%', flexShrink: 0, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' };
    if (!url) return /*#__PURE__*/React.createElement("div", { style: wrapperStyle });

    if (slot === 'current') {
      if (imageLoadFailed) {
        return /*#__PURE__*/React.createElement("div", { style: wrapperStyle }, /*#__PURE__*/React.createElement("div", {
          style: {
            width: '100%',
            maxWidth: '100%',
            maxHeight: '100%',
            aspectRatio: '1 / 1',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--bg-card)',
            border: '1px dashed var(--border-subtle)',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            textAlign: 'center',
            fontSize: '0.9rem',
            fontWeight: 700
          }
        }, "이미지를 불러오지 못했습니다."));
      }

      return /*#__PURE__*/React.createElement("div", { style: wrapperStyle }, /*#__PURE__*/React.createElement("div", {
        style: { position: 'relative', display: 'inline-flex', maxWidth: '100%', maxHeight: '100%' },
        onClick: handleImageTap
      }, /*#__PURE__*/React.createElement("img", {
        ref: zoomedImgRef,
        src: url,
        alt: "원본 이미지",
        "data-slide": slot,
        draggable: false,
        decoding: 'async',
        referrerPolicy: 'no-referrer',
        onLoad: e => recordImageDimensions(url, e),
        onError: handleCurrentImageError,
        onMouseDown: handleZoomedImageMouseDown,
        style: {
          maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: 'var(--radius-md)',
          display: 'block', ...zoomImageStyle
        }
      }), renderPhotoActions(), showInfo && zoomLevel === ZOOM_DEFAULT && /*#__PURE__*/React.createElement(LightboxInfoPanel, {
      key: tagOverrideKey || String(currentUrl || index),
        info: currentInfo,
        tags: currentTags,
        onSaveTags: saveCurrentTags,
        onSearchTag: onSearchTag,
        onOpenUrl: () => setImageUrlModalOpen(true),
        showToast: showToast,
        sourceInfo: sourceInfo,
        showZoomControls: isDesktop,
        zoomLevel: zoomLevel,
        zoomMin: ZOOM_MIN,
        zoomMax: ZOOM_MAX,
        onZoomIn: handleZoomIn,
        onZoomOut: handleZoomOut,
        onZoomReset: handleZoomReset
      })));
    }

    return /*#__PURE__*/React.createElement("div", { style: wrapperStyle }, /*#__PURE__*/React.createElement("img", {
      src: url,
      alt: "원본 이미지",
      "data-slide": slot,
      draggable: false,
      decoding: 'async',
      referrerPolicy: 'no-referrer',
      onLoad: e => recordImageDimensions(url, e),
      onClick: e => e.stopPropagation(),
      style: {
        maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: 'var(--radius-md)'
      }
    }));
  };

  const lightboxNode = /*#__PURE__*/React.createElement("div", {
    className: "lightbox-overlay",
    onClick: handleOverlayClick,
    style: {
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.92)', WebkitBackdropFilter: 'blur(8px)', backdropFilter: 'blur(8px)', zIndex: 50000,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      width: '100%', maxWidth: '100%', overflow: 'hidden',
      userSelect: 'none'
    }
  }, /*#__PURE__*/React.createElement("input", {
    ref: replacePhotoInputRef,
    type: "file",
    accept: "image/jpeg, image/png, image/gif, image/webp, image/heic, image/heif, image/*",
    onClick: e => e.stopPropagation(),
    onChange: handleReplacePhotoFile,
    style: { display: 'none' }
  }), /*#__PURE__*/React.createElement("button", {
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
    className: "lightbox-nav-btn",
    type: "button",
    onClick: e => { e.stopPropagation(); animateToAdjacent(index - 1); },
    "aria-label": "이전 이미지",
    // The shared global press-scale rule (button:active { transform: translate3d(...) scale(...) })
    // overrides this button's own inline `transform: translateY(-50%)` centering with !important,
    // so pressing it used to yank it out from its vertically-centered position toward the bottom
    // of the overlay -- by the time the finger/cursor lifts, it's no longer over the button, so
    // the click (or worse, a synthetic click on whatever's now underneath) misses it and can close
    // the lightbox instead of navigating. data-no-press-feedback opts this button out of that
    // rule entirely (see app.css) rather than trying to keep patching the override to also apply
    // here.
    "data-no-press-feedback": true,
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
    className: "lightbox-nav-btn",
    type: "button",
    onClick: e => { e.stopPropagation(); animateToAdjacent(index + 1); },
    "aria-label": "다음 이미지",
    "data-no-press-feedback": true,
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
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
    onTouchCancel: handleTouchEnd,
    style: {
      width: '92vw', height: '82vh', overflow: 'hidden',
      cursor: isDragging ? 'grabbing' : 'grab',
      touchAction: 'none'
    }
  }, /*#__PURE__*/React.createElement("div", {
    onTransitionEnd: handleTrackTransitionEnd,
    style: {
      display: 'flex', width: '300%', height: '100%',
      transform: `translateX(calc(-33.3333% + ${dragPx}px))`,
      transition: transitionOn ? `transform ${LIGHTBOX_TRANSITION_MS}ms ${LIGHTBOX_TRANSITION_EASING}` : 'none',
      willChange: 'transform'
    }
  }, renderSlide(index > 0 ? displayUrls[index - 1] : null, 'prev'), renderSlide(currentUrl, 'current'), renderSlide(index < total - 1 ? displayUrls[index + 1] : null, 'next')))
    : /*#__PURE__*/React.createElement("div", {
    style: { position: 'relative', display: 'inline-flex', maxWidth: '92vw', maxHeight: '82vh', touchAction: 'none' },
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
    onTouchCancel: handleTouchEnd,
    onClick: handleImageTap
  }, /*#__PURE__*/React.createElement("img", {
    ref: zoomedImgRef,
    src: currentUrl,
    alt: "원본 이미지",
    draggable: false,
    decoding: 'async',
    referrerPolicy: 'no-referrer',
    onLoad: e => recordImageDimensions(currentUrl, e),
    onMouseDown: handleZoomedImageMouseDown,
    style: {
      maxWidth: '92vw', maxHeight: '82vh', borderRadius: 'var(--radius-md)', objectFit: 'contain',
      display: 'block', ...zoomImageStyle
    }
  }), renderPhotoActions(), showInfo && zoomLevel === ZOOM_DEFAULT && /*#__PURE__*/React.createElement(LightboxInfoPanel, {
      key: tagOverrideKey || String(currentUrl || index),
    info: currentInfo,
    tags: currentTags,
    onSaveTags: saveCurrentTags,
    onSearchTag: onSearchTag,
    onOpenUrl: () => setImageUrlModalOpen(true),
    showToast: showToast,
    sourceInfo: sourceInfo,
    showZoomControls: isDesktop,
    zoomLevel: zoomLevel,
    zoomMin: ZOOM_MIN,
    zoomMax: ZOOM_MAX,
    onZoomIn: handleZoomIn,
    onZoomOut: handleZoomOut,
    onZoomReset: handleZoomReset
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
