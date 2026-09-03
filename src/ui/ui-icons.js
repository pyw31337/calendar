/**
 * Icon components (P4-23)
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
function useChatSendGuard(onSend, canSend = true) {
  const sharedGuard = window.GATHER_APP_UTILS && window.GATHER_APP_UTILS.useChatSendGuard;
  if (typeof sharedGuard === 'function') return sharedGuard(onSend, canSend);
  const React = window.React;
  const lockRef = React.useRef(false);
  return React.useCallback((...args) => {
    const isAllowed = typeof canSend === 'function' ? canSend(...args) : Boolean(canSend);
    if (!isAllowed || lockRef.current) return;
    lockRef.current = true;
    let result;
    try {
      result = onSend && onSend(...args);
    } catch (error) {
      setTimeout(() => { lockRef.current = false; }, 250);
      console.error('chat send failed:', error);
      return;
    }
    Promise.resolve(result).catch(error => {
      console.error('chat send failed:', error);
    }).finally(() => {
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
const INCOME_EXPENSE_CATEGORY = GATHER_APP_UTILS.INCOME_EXPENSE_CATEGORY || { id: 'income', name: '수입', color: 'var(--status-green)' };
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


export function MenuIcon({ paths }) {
  const React = window.React;

  return /*#__PURE__*/React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    width: "16",
    height: "16",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    style: { flexShrink: 0 }
  }, paths.map((d, i) => /*#__PURE__*/React.createElement("path", { key: i, d })));
}

export function NotepadTextIcon({ size = 16 } = {}) {
  const React = window.React;

  return /*#__PURE__*/React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    width: String(size),
    height: String(size),
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    style: { flexShrink: 0 }
  },
    /*#__PURE__*/React.createElement("path", { d: "M8 2v4" }),
    /*#__PURE__*/React.createElement("path", { d: "M12 2v4" }),
    /*#__PURE__*/React.createElement("path", { d: "M16 2v4" }),
    /*#__PURE__*/React.createElement("rect", { width: "16", height: "18", x: "4", y: "4", rx: "2" }),
    /*#__PURE__*/React.createElement("path", { d: "M8 10h6" }),
    /*#__PURE__*/React.createElement("path", { d: "M8 14h8" }),
    /*#__PURE__*/React.createElement("path", { d: "M8 18h5" })
  );
}

export function ChatSectionIcon() {
  const React = window.React;

  return /*#__PURE__*/React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    width: "20",
    height: "20",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2.5",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    style: { marginRight: '6px' }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
  }));
}

export function LinkIcon({ size = 16 }) {
  const React = window.React;

  return /*#__PURE__*/React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    width: String(size),
    height: String(size),
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    className: "icon icon-tabler icons-tabler-outline icon-tabler-link"
  }, /*#__PURE__*/React.createElement("path", { stroke: "none", d: "M0 0h24v24H0z", fill: "none" }),
    /*#__PURE__*/React.createElement("path", { d: "M9 15l6 -6" }),
    /*#__PURE__*/React.createElement("path", { d: "M11 6l.463 -.536a5 5 0 0 1 7.071 7.072l-.534 .464" }),
    /*#__PURE__*/React.createElement("path", { d: "M13 18l-.397 .534a5.068 5.068 0 0 1 -7.127 0a4.972 4.972 0 0 1 0 -7.071l.524 -.463" }));
}

export function MessageCommentIcon({ size = 24 } = {}) {
  const React = window.React;

  return /*#__PURE__*/React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg", width: String(size), height: String(size), viewBox: "0 0 24 24",
    fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round"
  },
    /*#__PURE__*/React.createElement("path", { stroke: "none", d: "M0 0h24v24H0z", fill: "none" }),
    /*#__PURE__*/React.createElement("path", { d: "M8 9h8" }),
    /*#__PURE__*/React.createElement("path", { d: "M8 13h6" }),
    /*#__PURE__*/React.createElement("path", { d: "M18 4a3 3 0 0 1 3 3v8a3 3 0 0 1 -3 3h-5l-5 3v-3h-2a3 3 0 0 1 -3 -3v-8a3 3 0 0 1 3 -3h12" })
  );
}

export function PencilIcon({ size = 12 } = {}) {
  const React = window.React;

  return /*#__PURE__*/React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg", width: String(size), height: String(size), viewBox: "0 0 24 24",
    fill: "none", stroke: "currentColor", strokeWidth: "2.5", strokeLinecap: "round", strokeLinejoin: "round"
  },
    /*#__PURE__*/React.createElement("path", { stroke: "none", d: "M0 0h24v24H0z", fill: "none" }),
    /*#__PURE__*/React.createElement("path", { d: "M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4" }),
    /*#__PURE__*/React.createElement("path", { d: "M13.5 6.5l4 4" })
  );
}

export function ReplyIcon({ size = 14 } = {}) {
  const React = window.React;

  return /*#__PURE__*/React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg", width: String(size), height: String(size), viewBox: "0 0 24 24",
    fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round"
  },
    /*#__PURE__*/React.createElement("path", { stroke: "none", d: "M0 0h24v24H0z", fill: "none" }),
    /*#__PURE__*/React.createElement("path", { d: "M9 13l-4 -4l4 -4" }),
    /*#__PURE__*/React.createElement("path", { d: "M5 9h7a4 4 0 1 1 0 8h-1" })
  );
}

export function BuildingIcon({ size = 14 } = {}) {
  const React = window.React;

  return /*#__PURE__*/React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg", width: String(size), height: String(size), viewBox: "0 0 24 24",
    fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round"
  },
    /*#__PURE__*/React.createElement("path", { d: "M10 12h4" }),
    /*#__PURE__*/React.createElement("path", { d: "M10 8h4" }),
    /*#__PURE__*/React.createElement("path", { d: "M14 21v-3a2 2 0 0 0-4 0v3" }),
    /*#__PURE__*/React.createElement("path", { d: "M6 10H4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2" }),
    /*#__PURE__*/React.createElement("path", { d: "M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16" })
  );
}

export function BackArrowIcon({ size = 24 } = {}) {
  const React = window.React;

  return /*#__PURE__*/React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg", width: String(size), height: String(size), viewBox: "0 0 24 24",
    fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round",
    style: { transform: 'rotate(90deg)', display: 'inline-block' }
  }, /*#__PURE__*/React.createElement("path", { stroke: "none", d: "M0 0h24v24H0z", fill: "none" }), /*#__PURE__*/React.createElement("path", { d: "M6 9l6 6l6 -6" }));
}

export function SunIcon({ size = 16 }) {
  const React = window.React;

  return /*#__PURE__*/React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg", width: String(size), height: String(size), viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: "icon icon-tabler icon-tabler-sun"
  }, /*#__PURE__*/React.createElement("path", { stroke: "none", d: "M0 0h24v24H0z", fill: "none" }), /*#__PURE__*/React.createElement("circle", { cx: "12", cy: "12", r: "4" }), /*#__PURE__*/React.createElement("path", { d: "M3 12h1m8 -9v1m8 8h1m-9 8v1m-6.4 -15.4l.7 .7m12.1 -.7l-.7 .7m0 11.4l.7 .7m-12.1 -.7l-.7 .7" }));
}

export function CloudIcon({ size = 16 }) {
  const React = window.React;

  return /*#__PURE__*/React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg", width: String(size), height: String(size), viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: "icon icon-tabler icon-tabler-cloud"
  }, /*#__PURE__*/React.createElement("path", { stroke: "none", d: "M0 0h24v24H0z", fill: "none" }), /*#__PURE__*/React.createElement("path", { d: "M7 18a4.6 4.4 0 0 1 0 -9h.1a5 4.5 0 0 1 11 2h.9a4 3.5 0 0 1 0 7h-12" }));
}

export function MistIcon({ size = 16 }) {
  const React = window.React;

  return /*#__PURE__*/React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg", width: String(size), height: String(size), viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: "icon icon-tabler icon-tabler-mist"
  }, /*#__PURE__*/React.createElement("path", { stroke: "none", d: "M0 0h24v24H0z", fill: "none" }), /*#__PURE__*/React.createElement("path", { d: "M5 5h14M5 9h14M5 13h14M5 17h14" }));
}

export function CloudRainIcon({ size = 16 }) {
  const React = window.React;

  return /*#__PURE__*/React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg", width: String(size), height: String(size), viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: "icon icon-tabler icon-tabler-cloud-rain"
  }, /*#__PURE__*/React.createElement("path", { stroke: "none", d: "M0 0h24v24H0z", fill: "none" }), /*#__PURE__*/React.createElement("path", { d: "M7 18a4.6 4.4 0 0 1 0 -9h.1a5 4.5 0 0 1 11 2h.9a4 3.5 0 0 1 0 7h-12M8 22l-.5 -1.5M12 22l-.5 -1.5M16 22l-.5 -1.5" }));
}

export function SnowflakeIcon({ size = 16 }) {
  const React = window.React;

  return /*#__PURE__*/React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg", width: String(size), height: String(size), viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: "icon icon-tabler icon-tabler-snowflake"
  }, /*#__PURE__*/React.createElement("path", { stroke: "none", d: "M0 0h24v24H0z", fill: "none" }), /*#__PURE__*/React.createElement("path", { d: "M10 4l2 1l2 -1M12 2v6.5M10 20l2 -1l2 1M12 15.5v6.5M20 10l-1 2l1 2M15.5 12h6.5M4 10l1 2l-1 2M2 12h6.5M4.43 4.43l4.24 4.24M2.5 5.5l1.5 1.5l1.5 -1.5M19.56 19.56l-4.24 -4.24M18.5 17.5l1.5 1.5l1.5 -1.5M19.56 4.43l-4.24 4.24M18.5 6.5l1.5 -1.5l1.5 1.5M4.43 19.56l4.24 -4.24M2.5 18.5l1.5 -1.5l1.5 1.5" }));
}

export function CloudLightningIcon({ size = 16 }) {
  const React = window.React;

  return /*#__PURE__*/React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg", width: String(size), height: String(size), viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: "icon icon-tabler icon-tabler-cloud-lightning"
  }, /*#__PURE__*/React.createElement("path", { stroke: "none", d: "M0 0h24v24H0z", fill: "none" }), /*#__PURE__*/React.createElement("path", { d: "M7 18a4.6 4.4 0 0 1 0 -9h.1a5 4.5 0 0 1 11 2h.9a4 3.5 0 0 1 0 7h-12M13 18l-2 3v-3l-2 3" }));
}

export function SettingsIcon({ size = 18 }) {
  const React = window.React;

  return /*#__PURE__*/React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg", width: String(size), height: String(size), viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: "icon icon-tabler icon-tabler-settings"
  }, /*#__PURE__*/React.createElement("path", { stroke: "none", d: "M0 0h24v24H0z", fill: "none" }), /*#__PURE__*/React.createElement("path", { d: "M10.325 4.317c.426 -1.756 2.924 -1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543 -.94 3.31 .826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756 .426 1.756 2.924 0 3.35a1.724 1.724 0 0 0 -1.066 2.573c.94 1.543 -.826 3.31 -2.37 2.37a1.724 1.724 0 0 0 -2.572 1.065c-.426 1.756 -2.924 1.756 -3.35 0a1.724 1.724 0 0 0 -2.573 -1.066c-1.543 .94 -3.31 -.826 -2.37 -2.37a1.724 1.724 0 0 0 -1.065 -2.572c-1.756 -.426 -1.756 -2.924 0 -3.35a1.724 1.724 0 0 0 1.066 -2.573c-.94 -1.543 .826 -3.31 2.37 -2.37c1 .608 2.296 .07 2.572 -1.065z" }), /*#__PURE__*/React.createElement("circle", { cx: "12", cy: "12", r: "3" }));
}

export function MapCogIcon({ size = 16 }) {
  const React = window.React;

  return /*#__PURE__*/React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg", width: String(size), height: String(size), viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: "icon icon-tabler icons-tabler-outline icon-tabler-map-cog"
  }, /*#__PURE__*/React.createElement("path", { stroke: "none", d: "M0 0h24v24H0z", fill: "none" }), /*#__PURE__*/React.createElement("path", { d: "M12 18.5l-3 -1.5l-6 3v-13l6 -3l6 3l6 -3v8" }), /*#__PURE__*/React.createElement("path", { d: "M9 4v13" }), /*#__PURE__*/React.createElement("path", { d: "M15 7v6.5" }), /*#__PURE__*/React.createElement("path", { d: "M17.001 19a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" }), /*#__PURE__*/React.createElement("path", { d: "M19.001 15.5v1.5" }), /*#__PURE__*/React.createElement("path", { d: "M19.001 21v1.5" }), /*#__PURE__*/React.createElement("path", { d: "M22.032 17.25l-1.299 .75" }), /*#__PURE__*/React.createElement("path", { d: "M17.27 20l-1.3 .75" }), /*#__PURE__*/React.createElement("path", { d: "M15.97 17.25l1.3 .75" }), /*#__PURE__*/React.createElement("path", { d: "M20.733 20l1.3 .75" }));
}

export function GiftIcon({ size = 20 } = {}) {
  const React = window.React;

  return /*#__PURE__*/React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    width: String(size),
    height: String(size),
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    className: "icon icon-tabler icons-tabler-outline icon-tabler-gift"
  },
    /*#__PURE__*/React.createElement("rect", { x: "3", y: "8", width: "18", height: "4", rx: "1" }),
    /*#__PURE__*/React.createElement("path", { d: "M12 8v13" }),
    /*#__PURE__*/React.createElement("path", { d: "M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" }),
    /*#__PURE__*/React.createElement("path", { d: "M12 8H7.5a2.5 2.5 0 0 1 0-5C11 3 12 8 12 8z" }),
    /*#__PURE__*/React.createElement("path", { d: "M12 8h4.5a2.5 2.5 0 0 0 0-5C13 3 12 8 12 8z" })
  );
}

export function MoonStarsIcon() {
  const React = window.React;

  return /*#__PURE__*/React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    width: "20",
    height: "20",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", { stroke: "none", d: "M0 0h24v24H0z", fill: "none" }),
    /*#__PURE__*/React.createElement("path", { d: "M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1 -8.313 -12.454l0 .008" }),
    /*#__PURE__*/React.createElement("path", { d: "M17 4a2 2 0 0 0 2 2a2 2 0 0 0 -2 2a2 2 0 0 0 -2 -2a2 2 0 0 0 2 -2" }),
    /*#__PURE__*/React.createElement("path", { d: "M19 11h2m-1 -1v2" }));
}

export function TextResizeIcon() {
  const React = window.React;

  return /*#__PURE__*/React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    width: "20",
    height: "20",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", { stroke: "none", d: "M0 0h24v24H0z", fill: "none" }),
    /*#__PURE__*/React.createElement("path", { d: "M3 5a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" }),
    /*#__PURE__*/React.createElement("path", { d: "M17 5a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" }),
    /*#__PURE__*/React.createElement("path", { d: "M3 19a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" }),
    /*#__PURE__*/React.createElement("path", { d: "M17 19a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" }),
    /*#__PURE__*/React.createElement("path", { d: "M5 7v10" }),
    /*#__PURE__*/React.createElement("path", { d: "M7 5h10" }),
    /*#__PURE__*/React.createElement("path", { d: "M7 19h10" }),
    /*#__PURE__*/React.createElement("path", { d: "M19 7v10" }),
    /*#__PURE__*/React.createElement("path", { d: "M10 10h4" }),
    /*#__PURE__*/React.createElement("path", { d: "M12 14v-4" }));
}

export function BellIcon() {
  const React = window.React;

  return /*#__PURE__*/React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    width: "20",
    height: "20",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", { stroke: "none", d: "M0 0h24v24H0z", fill: "none" }),
    /*#__PURE__*/React.createElement("path", { d: "M10 5a2 2 0 1 1 4 0a7 7 0 0 1 4 6v3a4 4 0 0 0 2 3h-16a4 4 0 0 0 2 -3v-3a7 7 0 0 1 4 -6" }),
    /*#__PURE__*/React.createElement("path", { d: "M9 17v1a3 3 0 0 0 6 0v-1" }));
}

export function SearchIcon({ size = 20 } = {}) {
  const React = window.React;

  return /*#__PURE__*/React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
    className: "icon icon-tabler icons-tabler-outline icon-tabler-search"
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "11",
    cy: "11",
    r: "8"
  }), /*#__PURE__*/React.createElement("path", {
    d: "m21 21-4.3-4.3"
  }));
}

export function CalendarCheckIcon() {
  const React = window.React;

  return /*#__PURE__*/React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    width: "20",
    height: "20",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    "strokeWidth": "2",
    "strokeLinecap": "round",
    "strokeLinejoin": "round",
    className: "icon lucide lucide-calendar-check"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M8 2v3"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M16 2v3"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "3",
    y: "3",
    width: "18",
    height: "18",
    rx: "2"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M3 9h18"
  }), /*#__PURE__*/React.createElement("path", {
    d: "m9 15 2 2 4-4"
  }));
}

export function LockIcon() {
  const React = window.React;

  return /*#__PURE__*/React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    width: "20",
    height: "20",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    "strokeWidth": "2",
    "strokeLinecap": "round",
    "strokeLinejoin": "round",
    className: "icon icon-tabler icons-tabler-outline icon-tabler-lock"
  }, /*#__PURE__*/React.createElement("path", {
    stroke: "none",
    d: "M0 0h24v24H0z",
    fill: "none"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M5 11m0 2a2 2 0 0 1 2 -2h10a2 2 0 0 1 2 2v6a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M11 16a1 1 0 1 0 2 0a1 1 0 0 0 -2 0"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M8 11v-4a4 4 0 1 1 8 0v4"
  }));
}

export function LogoutIcon() {
  const React = window.React;

  return /*#__PURE__*/React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    width: "20",
    height: "20",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    "strokeWidth": "2",
    "strokeLinecap": "round",
    "strokeLinejoin": "round",
    className: "icon icon-tabler icons-tabler-outline icon-tabler-logout"
  }, /*#__PURE__*/React.createElement("path", {
    stroke: "none",
    d: "M0 0h24v24H0z",
    fill: "none"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M14 8v-2a2 2 0 0 0 -2 -2h-7a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h7a2 2 0 0 0 2 -2v-2"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M9 12h12l-3 -3"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M18 15l3 -3"
  }));
}

export function RefreshIcon() {
  const React = window.React;

  return /*#__PURE__*/React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    width: "20",
    height: "20",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    "strokeWidth": "2",
    "strokeLinecap": "round",
    "strokeLinejoin": "round",
    className: "icon icon-tabler icons-tabler-outline icon-tabler-refresh"
  }, /*#__PURE__*/React.createElement("path", {
    stroke: "none",
    d: "M0 0h24v24H0z",
    fill: "none"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M20 11a8.1 8.1 0 0 0 -15.5 -2m-.5 -4v4h4"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M4 13a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4"
  }));
}

export function AdminFilledMenuIcon() {
  const React = window.React;

  return /*#__PURE__*/React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    width: "24",
    height: "24",
    viewBox: "0 0 24 24",
    fill: "currentColor",
    className: "icon icon-tabler icons-tabler-filled icon-tabler-menu-2"
  }, /*#__PURE__*/React.createElement("path", {
    stroke: "none",
    d: "M0 0h24v24H0z",
    fill: "none"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M21 6a1 1 0 0 1 -1 1h-16a1 1 0 1 1 0 -2h16a1 1 0 0 1 1 1"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M21 12a1 1 0 0 1 -1 1h-16a1 1 0 0 1 0 -2h16a1 1 0 0 1 1 1"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M21 18a1 1 0 0 1 -1 1h-16a1 1 0 0 1 0 -2h16a1 1 0 0 1 1 1"
  }));
}

export function EmojiPickerIcon() {
  const React = window.React;

  return /*#__PURE__*/React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    width: "18",
    height: "18",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    "strokeWidth": "2",
    "strokeLinecap": "round",
    "strokeLinejoin": "round",
    className: "icon icon-tabler icons-tabler-outline icon-tabler-mood-smile"
  }, /*#__PURE__*/React.createElement("path", {
    stroke: "none",
    d: "M0 0h24v24H0z",
    fill: "none"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "12", cy: "12", r: "9"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M9 10l.01 0"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M15 10l.01 0"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M9.5 15a3.5 3.5 0 0 0 5 0"
  }));
}

export function ExternalLinkIcon() {
  const React = window.React;

  return /*#__PURE__*/React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    width: "20",
    height: "20",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    "strokeWidth": "2",
    "strokeLinecap": "round",
    "strokeLinejoin": "round",
    className: "lucide lucide-external-link-icon lucide-external-link"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M15 3h6v6"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M10 14 21 3"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"
  }));
}

export function ShareIcon({ size = 20 } = {}) {
  const React = window.React;

  return /*#__PURE__*/React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    width: String(size),
    height: String(size),
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    "strokeWidth": "2",
    "strokeLinecap": "round",
    "strokeLinejoin": "round"
  }, /*#__PURE__*/React.createElement("circle", { cx: "18", cy: "5", r: "3" }),
     /*#__PURE__*/React.createElement("circle", { cx: "6", cy: "12", r: "3" }),
     /*#__PURE__*/React.createElement("circle", { cx: "18", cy: "19", r: "3" }),
     /*#__PURE__*/React.createElement("line", { x1: "8.59", y1: "13.51", x2: "15.42", y2: "17.49" }),
     /*#__PURE__*/React.createElement("line", { x1: "15.41", y1: "6.51", x2: "8.59", y2: "10.49" }));
}

export function WalletIcon({ size = 24 } = {}) {
  const React = window.React;

  return /*#__PURE__*/React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    width: String(size),
    height: String(size),
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    "strokeWidth": "2",
    "strokeLinecap": "round",
    "strokeLinejoin": "round",
    className: "icon icon-tabler icons-tabler-outline icon-tabler-wallet"
  }, /*#__PURE__*/React.createElement("path", {
    stroke: "none",
    d: "M0 0h24v24H0z",
    fill: "none"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M17 8v-3a1 1 0 0 0 -1 -1h-10a2 2 0 0 0 0 4h12a1 1 0 0 1 1 1v3m0 4v3a1 1 0 0 1 -1 1h-12a2 2 0 0 1 -2 -2v-12"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M20 12v4h-4a2 2 0 0 1 0 -4h4"
  }));
}

export function CoinIcon() {
  const React = window.React;

  return /*#__PURE__*/React.createElement("svg", {
    className: "day-coin-icon",
    viewBox: "0 0 24 24",
    width: "16",
    height: "17",
    style: {
      flexShrink: 0,
      verticalAlign: 'middle',
      marginLeft: 0
    }
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "11",
    fill: "#8A99AD"
  }), /*#__PURE__*/React.createElement("text", {
    x: "12",
    y: "16.5",
    fontSize: "14",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    fontWeight: "900",
    textAnchor: "middle",
    fill: "#FFFFFF"
  }, "\u20A9"));
}

export function BanknoteArrowUpIcon({ size = 24 } = {}) {
  const React = window.React;

  return /*#__PURE__*/React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    width: String(size),
    height: String(size),
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    "strokeWidth": "2",
    "strokeLinecap": "round",
    "strokeLinejoin": "round",
    className: "icon lucide lucide-banknote-arrow-up"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M12 18H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M18 12h.01"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M19 22v-6"
  }), /*#__PURE__*/React.createElement("path", {
    d: "m22 19-3-3-3 3"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M6 12h.01"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "2"
  }));
}

export function BanknoteArrowDownIcon({ size = 24 } = {}) {
  const React = window.React;

  return /*#__PURE__*/React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    width: String(size),
    height: String(size),
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    "strokeWidth": "2",
    "strokeLinecap": "round",
    "strokeLinejoin": "round",
    className: "icon lucide lucide-banknote-arrow-down"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M12 18H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5"
  }), /*#__PURE__*/React.createElement("path", {
    d: "m16 19 3 3 3-3"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M18 12h.01"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M19 16v6"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M6 12h.01"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "2"
  }));
}

export function PiggyBankIcon({ size = 24 } = {}) {
  const React = window.React;

  return /*#__PURE__*/React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    width: String(size),
    height: String(size),
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    "strokeWidth": "2",
    "strokeLinecap": "round",
    "strokeLinejoin": "round",
    className: "icon lucide lucide-piggy-bank"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M11 17h3v2a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-3a3.16 3.16 0 0 0 2-2h1a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1h-1a5 5 0 0 0-2-4V3a4 4 0 0 0-3.2 1.6l-.3.4H11a6 6 0 0 0-6 6v1a5 5 0 0 0 2 4v3a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M16 10h.01"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M2 8v1a2 2 0 0 0 2 2h1"
  }));
}

export function ChartBarIcon() {
  const React = window.React;

  return /*#__PURE__*/React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    width: "20",
    height: "20",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    "strokeWidth": "2",
    "strokeLinecap": "round",
    "strokeLinejoin": "round",
    className: "icon icon-tabler icons-tabler-outline icon-tabler-chart-bar"
  }, /*#__PURE__*/React.createElement("path", {
    stroke: "none",
    d: "M0 0h24v24H0z",
    fill: "none"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M3 13a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v6a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1l0 -6"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M15 9a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v10a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1l0 -10"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M9 5a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v14a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1l0 -14"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M4 20h14"
  }));
}

export function ChartPieIcon() {
  const React = window.React;

  return /*#__PURE__*/React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    width: "20",
    height: "20",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    "strokeWidth": "2",
    "strokeLinecap": "round",
    "strokeLinejoin": "round",
    className: "icon icon-tabler icons-tabler-outline icon-tabler-chart-pie"
  }, /*#__PURE__*/React.createElement("path", {
    stroke: "none",
    d: "M0 0h24v24H0z",
    fill: "none"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M10 3.2a9 9 0 1 0 10.8 10.8a1 1 0 0 0 -1 -1h-6.8a2 2 0 0 1 -2 -2v-7a.9 .9 0 0 0 -1 -.8"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M15 3.5a9 9 0 0 1 5.5 5.5h-4.5a1 1 0 0 1 -1 -1v-4.5"
  }));
}

export function CalendarCogIcon() {
  const React = window.React;

  return /*#__PURE__*/React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    width: "20",
    height: "20",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    "strokeWidth": "2",
    "strokeLinecap": "round",
    "strokeLinejoin": "round",
    className: "icon icon-tabler icons-tabler-outline icon-tabler-calendar-cog"
  }, /*#__PURE__*/React.createElement("path", {
    stroke: "none",
    d: "M0 0h24v24H0z",
    fill: "none"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M12 21h-6a2 2 0 0 1 -2 -2v-12a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v5"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M16 3v4"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M8 3v4"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M4 11h16"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M17.001 19a2 2 0 1 0 4 0a2 2 0 1 0 -4 0"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M19.001 15.5v1.5"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M19.001 21v1.5"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M22.032 17.25l-1.299 .75"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M17.27 20l-1.3 .75"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M15.97 17.25l1.3 .75"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M20.733 20l1.3 .75"
  }));
}

export function CalendarSearchIcon({ size = 20 } = {}) {
  const React = window.React;

  return /*#__PURE__*/React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    width: String(size),
    height: String(size),
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    "strokeWidth": "2",
    "strokeLinecap": "round",
    "strokeLinejoin": "round",
    className: "icon icon-tabler icons-tabler-outline icon-tabler-calendar-search"
  }, /*#__PURE__*/React.createElement("path", {
    stroke: "none",
    d: "M0 0h24v24H0z",
    fill: "none"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M11.5 21h-5.5a2 2 0 0 1 -2 -2v-12a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v4.5"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M16 3v4"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M8 3v4"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M4 11h16"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M15 18a3 3 0 1 0 6 0a3 3 0 1 0 -6 0"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M20.2 20.2l1.8 1.8"
  }));
}

export function TrophyIcon() {
  const React = window.React;

  return /*#__PURE__*/React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    width: "20",
    height: "20",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    "strokeWidth": "2",
    "strokeLinecap": "round",
    "strokeLinejoin": "round",
    className: "lucide lucide-trophy-icon lucide-trophy"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M10 14.66V17a1 1 0 0 1-1 1 2 2 0 0 0-2 2v2"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M14 14.66V17a1 1 0 0 0 1 1 2 2 0 0 1 2 2v2"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M17.916 10H19.5A2.5 2.5 0 0 0 22 7.5V5a1 1 0 0 0-1-1h-3"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M4 22h16"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M6 9a6 6 0 0 0 12 0V3a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M6.084 10H4.5A2.5 2.5 0 0 1 2 7.5V5a1 1 0 0 1 1-1h3"
  }));
}

export function PodiumIcon() {
  const React = window.React;

  return /*#__PURE__*/React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    width: "20",
    height: "20",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    "strokeWidth": "2",
    "strokeLinecap": "round",
    "strokeLinejoin": "round",
    className: "lucide lucide-podium-icon lucide-podium"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M12 6V2h-1"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M9 15a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1v-3a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M9 21V11a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v10"
  }));
}

export function CloudDataConnectionIcon() {
  const React = window.React;

  return /*#__PURE__*/React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    width: "20",
    height: "20",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    "strokeWidth": "2",
    "strokeLinecap": "round",
    "strokeLinejoin": "round",
    className: "icon icon-tabler icons-tabler-outline icon-tabler-cloud-data-connection"
  }, /*#__PURE__*/React.createElement("path", {
    stroke: "none",
    d: "M0 0h24v24H0z",
    fill: "none"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M5 9.897c0 -1.714 1.46 -3.104 3.26 -3.104c.275 -1.22 1.255 -2.215 2.572 -2.611c1.317 -.397 2.77 -.134 3.811 .69c1.042 .822 1.514 2.08 1.239 3.3h.693a2.42 2.42 0 0 1 2.425 2.414a2.42 2.42 0 0 1 -2.425 2.414h-8.315c-1.8 0 -3.26 -1.39 -3.26 -3.103"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M12 13v3"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M10 18a2 2 0 1 0 4 0a2 2 0 1 0 -4 0"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M14 18h7"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M3 18h7"
  }));
}

export function LogIcon() {
  const React = window.React;

  return /*#__PURE__*/React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    width: "18",
    height: "18",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    className: "lucide lucide-list-todo"
  }, /*#__PURE__*/React.createElement("rect", {
    x: "3",
    y: "3",
    width: "18",
    height: "18",
    rx: "2"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M9 9h6"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M9 13h6"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M9 17h6"
  }));
}

export function HourglassIcon() {
  const React = window.React;

  return /*#__PURE__*/React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    width: "16",
    height: "16",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    className: "lucide lucide-rotate-ccw-clock-icon lucide-rotate-ccw-clock"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M3 3v5h5"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M12 7v5l4 2"
  }));
}

export function AlertTriangleIcon() {
  const React = window.React;

  return /*#__PURE__*/React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    width: "20",
    height: "20",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    "strokeWidth": "2",
    "strokeLinecap": "round",
    "strokeLinejoin": "round",
    className: "icon icon-tabler icons-tabler-outline icon-tabler-alert-triangle"
  }, /*#__PURE__*/React.createElement("path", {
    stroke: "none",
    d: "M0 0h24v24H0z",
    fill: "none"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M12 9v4"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M10.363 3.591l-8.106 13.534a1.914 1.914 0 0 0 1.636 2.871h16.214a1.914 1.914 0 0 0 1.636 -2.87l-8.106 -13.536a1.914 1.914 0 0 0 -3.274 0z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M12 16h.01"
  }));
}

export function ShieldCheckIcon() {
  const React = window.React;

  return /*#__PURE__*/React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    width: "20",
    height: "20",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    "strokeWidth": "2",
    "strokeLinecap": "round",
    "strokeLinejoin": "round",
    className: "icon icon-tabler icons-tabler-outline icon-tabler-shield-check"
  }, /*#__PURE__*/React.createElement("path", {
    stroke: "none",
    d: "M0 0h24v24H0z",
    fill: "none"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M12 3a12 12 0 0 0 8.5 3a12 12 0 0 1 -8.5 15a12 12 0 0 1 -8.5 -15a12 12 0 0 0 8.5 -3"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M9 12l2 2l4 -4"
  }));
}

export function CalendarExportIcon() {
  const React = window.React;

  return /*#__PURE__*/React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    width: "16",
    height: "16",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    "strokeWidth": "2",
    "strokeLinecap": "round",
    "strokeLinejoin": "round",
    className: "icon icon-tabler icons-tabler-outline icon-tabler-calendar-plus"
  }, /*#__PURE__*/React.createElement("path", {
    stroke: "none",
    d: "M0 0h24v24H0z",
    fill: "none"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M4 7a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2v-12z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M16 3v4"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M8 3v4"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M4 11h16"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M10 16h4"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M12 14v4"
  }));
}

export function GalleryIcon() {
  const React = window.React;

  return /*#__PURE__*/React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    width: "20",
    height: "20",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    "strokeWidth": "2",
    "strokeLinecap": "round",
    "strokeLinejoin": "round",
    className: "icon icon-tabler icons-tabler-outline icon-tabler-photo"
  }, /*#__PURE__*/React.createElement("path", {
    stroke: "none",
    d: "M0 0h24v24H0z",
    fill: "none"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M15 8h.01"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M3 6a3 3 0 0 1 3 -3h12a3 3 0 0 1 3 3v12a3 3 0 0 1 -3 3h-12a3 3 0 0 1 -3 -3v-12z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M3 16l5 -5c.928 -.893 2.072 -.893 3 0l5 5"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M14 14l1 -1c.928 -.893 2.072 -.893 3 0l3 3"
  }));
}

export function PollSectionIcon() {
  const React = window.React;

  return /*#__PURE__*/React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    width: "20",
    height: "20",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    "strokeWidth": "2",
    "strokeLinecap": "round",
    "strokeLinejoin": "round",
    className: "icon icon-tabler icons-tabler-outline icon-tabler-checkbox"
  }, /*#__PURE__*/React.createElement("path", {
    stroke: "none",
    d: "M0 0h24v24H0z",
    fill: "none"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M9 11l3 3l8 -8"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M20 12v6a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2v-12a2 2 0 0 1 2 -2h9"
  }));
}

export function LineHeightIcon({ size = 22 } = {}) {
  const React = window.React;

  return /*#__PURE__*/React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    width: String(size),
    height: String(size),
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    "strokeWidth": "2",
    "strokeLinecap": "round",
    "strokeLinejoin": "round",
    className: "icon icon-tabler icons-tabler-outline icon-tabler-line-height"
  }, /*#__PURE__*/React.createElement("path", {
    stroke: "none",
    d: "M0 0h24v24H0z",
    fill: "none"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M3 8l3 -3l3 3"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M3 16l3 3l3 -3"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M6 5l0 14"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M13 6l7 0"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M13 12l7 0"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M13 18l7 0"
  }));
}

export function MegaphoneIcon({ size = 20 } = {}) {
  const React = window.React;

  return /*#__PURE__*/React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    width: String(size),
    height: String(size),
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    "strokeWidth": "2",
    "strokeLinecap": "round",
    "strokeLinejoin": "round",
    className: "lucide lucide-megaphone-icon lucide-megaphone"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M11 6a13 13 0 0 0 8.4-2.8A1 1 0 0 1 21 4v12a1 1 0 0 1-1.6.8A13 13 0 0 0 11 14H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M6 14a12 12 0 0 0 2.4 7.2 2 2 0 0 0 3.2-2.4A8 8 0 0 1 10 14"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M8 6v8"
  }));
}

export function SmallXIcon({ size = 24 } = {}) {
  const React = window.React;

  return /*#__PURE__*/React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    width: String(size),
    height: String(size),
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    "strokeWidth": "2",
    "strokeLinecap": "round",
    "strokeLinejoin": "round",
    className: "icon icon-tabler icons-tabler-outline icon-tabler-x"
  }, /*#__PURE__*/React.createElement("path", {
    stroke: "none",
    d: "M0 0h24v24H0z",
    fill: "none"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M18 6l-12 12"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M6 6l12 12"
  }));
}

export function TrashIcon({ size = 24 } = {}) {
  const React = window.React;

  return /*#__PURE__*/React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    width: String(size),
    height: String(size),
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    "strokeWidth": "2",
    "strokeLinecap": "round",
    "strokeLinejoin": "round",
    className: "lucide lucide-trash2-icon lucide-trash-2"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M10 11v6"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M14 11v6"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M3 6h18"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
  }));
}

export function ImageDownIcon({ size = 24 } = {}) {
  const React = window.React;

  return /*#__PURE__*/React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    width: String(size),
    height: String(size),
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    "strokeWidth": "2",
    "strokeLinecap": "round",
    "strokeLinejoin": "round",
    className: "lucide lucide-image-down-icon lucide-image-down"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M10.3 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10l-3.1-3.1a2 2 0 0 0-2.814.014L6 21"
  }), /*#__PURE__*/React.createElement("path", {
    d: "m14 19 3 3v-5.5"
  }), /*#__PURE__*/React.createElement("path", {
    d: "m17 22 3-3"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "9",
    cy: "9",
    r: "2"
  }));
}

export function PlaceSectionIcon({ size = 20 } = {}) {
  const React = window.React;

  return /*#__PURE__*/React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    width: String(size),
    height: String(size),
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    "strokeWidth": "2",
    "strokeLinecap": "round",
    "strokeLinejoin": "round",
    className: "icon icon-tabler icons-tabler-outline icon-tabler-map-pin"
  }, /*#__PURE__*/React.createElement("path", {
    stroke: "none",
    d: "M0 0h24v24H0z",
    fill: "none"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M9 11a3 3 0 1 0 6 0a3 3 0 0 0 -6 0"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M17.657 16.657l-4.243 4.243a2 2 0 0 1 -2.827 0l-4.244 -4.243a8 8 0 1 1 11.314 0z"
  }));
}

export function MemoSectionIcon({ size = 20 } = {}) {
  const React = window.React;

  // Same notepad shape as NotepadTextIcon (used for the header/side-menu 메모 entries) rather
  // than a pencil -- a pencil reads as "edit", not "notes", and this icon is only ever a
  // section label, never an edit affordance.
  return /*#__PURE__*/React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    width: String(size),
    height: String(size),
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    "strokeWidth": "2",
    "strokeLinecap": "round",
    "strokeLinejoin": "round"
  },
    /*#__PURE__*/React.createElement("path", { d: "M8 2v4" }),
    /*#__PURE__*/React.createElement("path", { d: "M12 2v4" }),
    /*#__PURE__*/React.createElement("path", { d: "M16 2v4" }),
    /*#__PURE__*/React.createElement("rect", { width: "16", height: "18", x: "4", y: "4", rx: "2" }),
    /*#__PURE__*/React.createElement("path", { d: "M8 10h6" }),
    /*#__PURE__*/React.createElement("path", { d: "M8 14h8" }),
    /*#__PURE__*/React.createElement("path", { d: "M8 18h5" })
  );
}

export function ThreeLinesIcon({ size = 18 } = {}) {
  const React = window.React;

  return /*#__PURE__*/React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    width: String(size),
    height: String(size),
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    "strokeWidth": "2",
    "strokeLinecap": "round"
  }, /*#__PURE__*/React.createElement("line", { x1: "4", y1: "7", x2: "20", y2: "7" }),
    /*#__PURE__*/React.createElement("line", { x1: "4", y1: "12", x2: "20", y2: "12" }),
    /*#__PURE__*/React.createElement("line", { x1: "4", y1: "17", x2: "20", y2: "17" }));
}

export function PlaceCategoryMarkerIcon({ category, size = 14, strokeColor = "#fff" } = {}) {
  const React = window.React;

  const content = getPlaceCategoryMarkerContent(category);
  return /*#__PURE__*/React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    width: String(size),
    height: String(size),
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: strokeColor,
    "strokeWidth": "2",
    "strokeLinecap": "round",
    "strokeLinejoin": "round"
  }, content.shapes.map((shape, i) => /*#__PURE__*/React.createElement(shape.tag, { key: i, ...(shape.tag === 'rect' ? { x: shape.x, y: shape.y, width: shape.width, height: shape.height, rx: shape.rx, ry: shape.ry } : shape.tag === 'circle' ? { cx: shape.cx, cy: shape.cy, r: shape.r } : { d: shape.d }) })));
}

export function CctvIcon({ size = 14 }) {
  const React = window.React;

  return /*#__PURE__*/React.createElement('svg', {
    xmlns: 'http://www.w3.org/2000/svg', width: size, height: size, viewBox: '0 0 24 24',
    fill: 'none', stroke: 'currentColor', strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round'
  },
    /*#__PURE__*/React.createElement('path', { d: 'M16.75 12h3.632a1 1 0 0 1 .894 1.447l-2.034 4.069a1 1 0 0 1-1.708.134l-2.124-2.97' }),
    /*#__PURE__*/React.createElement('path', { d: 'M17.106 9.053a1 1 0 0 1 .447 1.341l-3.106 6.211a1 1 0 0 1-1.342.447L3.61 12.3a2.92 2.92 0 0 1-1.3-3.91L3.69 5.6a2.92 2.92 0 0 1 3.92-1.3z' }),
    /*#__PURE__*/React.createElement('path', { d: 'M2 19h3.76a2 2 0 0 0 1.8-1.1L9 15' }),
    /*#__PURE__*/React.createElement('path', { d: 'M2 21v-4' }),
    /*#__PURE__*/React.createElement('path', { d: 'M7 9h.01' })
  );
}

export function CakeIcon({ size = 18 }) {
  const React = window.React;

  return /*#__PURE__*/React.createElement('svg', {
    xmlns: 'http://www.w3.org/2000/svg', width: String(size), height: String(size), viewBox: '0 0 24 24',
    fill: 'none', stroke: 'currentColor', strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round',
    'aria-hidden': 'true'
  },
    /*#__PURE__*/React.createElement('path', { d: 'M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8' }),
    /*#__PURE__*/React.createElement('path', { d: 'M4 16s.5-1 2-1 2.5 2 4 2 2.5-2 4-2 2.5 2 4 2 2-1 2-1' }),
    /*#__PURE__*/React.createElement('path', { d: 'M2 21h20' }),
    /*#__PURE__*/React.createElement('path', { d: 'M7 8v3' }),
    /*#__PURE__*/React.createElement('path', { d: 'M12 8v3' }),
    /*#__PURE__*/React.createElement('path', { d: 'M17 8v3' }),
    /*#__PURE__*/React.createElement('path', { d: 'M7 4h.01' }),
    /*#__PURE__*/React.createElement('path', { d: 'M12 4h.01' }),
    /*#__PURE__*/React.createElement('path', { d: 'M17 4h.01' })
  );
}

export function DicesIcon({ size = 14 }) {
  const React = window.React;

  return /*#__PURE__*/React.createElement('svg', {
    xmlns: 'http://www.w3.org/2000/svg', width: size, height: size, viewBox: '0 0 24 24',
    fill: 'none', stroke: 'currentColor', strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round'
  },
    /*#__PURE__*/React.createElement('rect', { width: '12', height: '12', x: '2', y: '10', rx: '2', ry: '2' }),
    /*#__PURE__*/React.createElement('path', { d: 'm17.92 14 3.5-3.5a2.24 2.24 0 0 0 0-3l-5-4.92a2.24 2.24 0 0 0-3 0L10 6' }),
    /*#__PURE__*/React.createElement('path', { d: 'M6 18h.01' }),
    /*#__PURE__*/React.createElement('path', { d: 'M10 14h.01' }),
    /*#__PURE__*/React.createElement('path', { d: 'M15 6h.01' }),
    /*#__PURE__*/React.createElement('path', { d: 'M18 9h.01' })
  );
}

// Speech-bubble "TALK" glyph used next to KakaoTalk share actions -- a plain black bubble with
// white lettering (not the yellow app-icon artwork) so it reads correctly on both light and dark
// button backgrounds without needing separate light/dark asset variants.
export function KakaoTalkIcon({ size = 20 } = {}) {
  const React = window.React;
  return /*#__PURE__*/React.createElement('svg', {
    xmlns: 'http://www.w3.org/2000/svg', width: String(size), height: String(size), viewBox: '0 0 512 512',
    'aria-hidden': 'true'
  },
    /*#__PURE__*/React.createElement('path', {
      fill: '#000',
      d: 'M256 96C114.6 96 0 182.9 0 290c0 68.5 46.5 128.8 116.7 163.4c-5.1 19-19.5 72.6-22.4 83.9c-3.5 13.9 5.1 13.7 10.7 10c4.4-2.9 70.6-47.9 99.2-67.4c16.7 2.4 34 3.7 51.8 3.7c141.4 0 256-86.9 256-194S397.4 96 256 96'
    }),
    /*#__PURE__*/React.createElement('text', {
      x: '256', y: '318', fill: '#fff', fontFamily: 'Arial, Helvetica, sans-serif', fontWeight: '700',
      fontSize: '110', letterSpacing: '2', textAnchor: 'middle'
    }, 'TALK')
  );
}

// 기념일 카테고리 아이콘 -- 생일(CakeIcon, 기존), 행사, 축제, 여행, 기타. 등록 폼의 카테고리
// 선택지와 캘린더 뱃지/목록 탭에서 공통으로 재사용된다.
export function BalloonIcon({ size = 18 } = {}) {
  const React = window.React;
  return /*#__PURE__*/React.createElement('svg', {
    xmlns: 'http://www.w3.org/2000/svg', width: String(size), height: String(size), viewBox: '0 0 24 24',
    fill: 'none', stroke: 'currentColor', strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round',
    'aria-hidden': 'true'
  },
    /*#__PURE__*/React.createElement('path', { d: 'M12 16v1a2 2 0 0 0 2 2h1a2 2 0 0 1 2 2v1' }),
    /*#__PURE__*/React.createElement('path', { d: 'M12 6a2 2 0 0 1 2 2' }),
    /*#__PURE__*/React.createElement('path', { d: 'M18 8c0 4-3.5 8-6 8s-6-4-6-8a6 6 0 0 1 12 0' })
  );
}

export function ConfettiIcon({ size = 18 } = {}) {
  const React = window.React;
  return /*#__PURE__*/React.createElement('svg', {
    xmlns: 'http://www.w3.org/2000/svg', width: String(size), height: String(size), viewBox: '0 0 24 24',
    fill: 'none', stroke: 'currentColor', strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round',
    'aria-hidden': 'true'
  },
    /*#__PURE__*/React.createElement('path', { stroke: 'none', d: 'M0 0h24v24H0z', fill: 'none' }),
    /*#__PURE__*/React.createElement('path', { d: 'M4 5h2' }),
    /*#__PURE__*/React.createElement('path', { d: 'M5 4v2' }),
    /*#__PURE__*/React.createElement('path', { d: 'M11.5 4l-.5 2' }),
    /*#__PURE__*/React.createElement('path', { d: 'M18 5h2' }),
    /*#__PURE__*/React.createElement('path', { d: 'M19 4v2' }),
    /*#__PURE__*/React.createElement('path', { d: 'M15 9l-1 1' }),
    /*#__PURE__*/React.createElement('path', { d: 'M18 13l2 -.5' }),
    /*#__PURE__*/React.createElement('path', { d: 'M18 19h2' }),
    /*#__PURE__*/React.createElement('path', { d: 'M19 18v2' }),
    /*#__PURE__*/React.createElement('path', { d: 'M14 16.518l-6.518 -6.518l-4.39 9.58a1 1 0 0 0 1.329 1.329l9.579 -4.39' })
  );
}

export function TicketsPlaneIcon({ size = 18 } = {}) {
  const React = window.React;
  return /*#__PURE__*/React.createElement('svg', {
    xmlns: 'http://www.w3.org/2000/svg', width: String(size), height: String(size), viewBox: '0 0 24 24',
    fill: 'none', stroke: 'currentColor', strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round',
    'aria-hidden': 'true'
  },
    /*#__PURE__*/React.createElement('path', { d: 'M10.5 17h1.227a2 2 0 0 0 1.345-.52L18 12' }),
    /*#__PURE__*/React.createElement('path', { d: 'm12 13.5 3.794.506' }),
    /*#__PURE__*/React.createElement('path', { d: 'm3.173 8.18 11-5a2 2 0 0 1 2.647.993L18.56 8' }),
    /*#__PURE__*/React.createElement('path', { d: 'M6 10V8' }),
    /*#__PURE__*/React.createElement('path', { d: 'M6 14v1' }),
    /*#__PURE__*/React.createElement('path', { d: 'M6 19v2' }),
    /*#__PURE__*/React.createElement('rect', { x: '2', y: '8', width: '20', height: '13', rx: '2' })
  );
}

export function MessageCircleMoreIcon({ size = 18 } = {}) {
  const React = window.React;
  return /*#__PURE__*/React.createElement('svg', {
    xmlns: 'http://www.w3.org/2000/svg', width: String(size), height: String(size), viewBox: '0 0 24 24',
    fill: 'none', stroke: 'currentColor', strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round',
    'aria-hidden': 'true'
  },
    /*#__PURE__*/React.createElement('path', { d: 'M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719' }),
    /*#__PURE__*/React.createElement('path', { d: 'M8 12h.01' }),
    /*#__PURE__*/React.createElement('path', { d: 'M12 12h.01' }),
    /*#__PURE__*/React.createElement('path', { d: 'M16 12h.01' })
  );
}

// Side-menu '히스토리' entry icon -- a folder with a small clock badge, for the confirmed-
// meeting history page.
export function FolderClockIcon({ size = 24 } = {}) {
  const React = window.React;
  return /*#__PURE__*/React.createElement('svg', {
    xmlns: 'http://www.w3.org/2000/svg', width: String(size), height: String(size), viewBox: '0 0 24 24',
    fill: 'none', stroke: 'currentColor', strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round',
    'aria-hidden': 'true'
  },
    /*#__PURE__*/React.createElement('path', { d: 'M16 14v2.2l1.6 1' }),
    /*#__PURE__*/React.createElement('path', { d: 'M7 20H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H20a2 2 0 0 1 2 2' }),
    /*#__PURE__*/React.createElement('circle', { cx: '16', cy: '16', r: '6' })
  );
}

// "현재 위치" (use my current location) button icon -- Lucide's locate-fixed, provided verbatim
// by the product ask.
export function LocateFixedIcon({ size = 24 } = {}) {
  const React = window.React;
  return /*#__PURE__*/React.createElement('svg', {
    xmlns: 'http://www.w3.org/2000/svg', width: String(size), height: String(size), viewBox: '0 0 24 24',
    fill: 'none', stroke: 'currentColor', strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round',
    'aria-hidden': 'true'
  },
    /*#__PURE__*/React.createElement('line', { x1: '2', x2: '5', y1: '12', y2: '12' }),
    /*#__PURE__*/React.createElement('line', { x1: '19', x2: '22', y1: '12', y2: '12' }),
    /*#__PURE__*/React.createElement('line', { x1: '12', x2: '12', y1: '2', y2: '5' }),
    /*#__PURE__*/React.createElement('line', { x1: '12', x2: '12', y1: '19', y2: '22' }),
    /*#__PURE__*/React.createElement('circle', { cx: '12', cy: '12', r: '7' }),
    /*#__PURE__*/React.createElement('circle', { cx: '12', cy: '12', r: '3' })
  );
}

// Place/location marker used for anniversary place info (replaces the plain 📍 emoji).
export function MapPinIcon({ size = 24 } = {}) {
  const React = window.React;
  return /*#__PURE__*/React.createElement('svg', {
    xmlns: 'http://www.w3.org/2000/svg', width: String(size), height: String(size), viewBox: '0 0 24 24',
    fill: 'none', stroke: 'currentColor', strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round',
    'aria-hidden': 'true'
  },
    /*#__PURE__*/React.createElement('path', { d: 'M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0' }),
    /*#__PURE__*/React.createElement('circle', { cx: '12', cy: '10', r: '3' })
  );
}

  if (typeof window !== 'undefined') {
  window.GATHER_UI_COMPONENTS = Object.assign({}, window.GATHER_UI_COMPONENTS || {}, {
    KakaoTalkIcon: KakaoTalkIcon,
    MenuIcon: MenuIcon,
    CakeIcon: CakeIcon,
    BalloonIcon: BalloonIcon,
    ConfettiIcon: ConfettiIcon,
    TicketsPlaneIcon: TicketsPlaneIcon,
    FolderClockIcon: FolderClockIcon,
    LocateFixedIcon: LocateFixedIcon,
    MapPinIcon: MapPinIcon,
    MessageCircleMoreIcon: MessageCircleMoreIcon,
    NotepadTextIcon: NotepadTextIcon,
    ChatSectionIcon: ChatSectionIcon,
    LinkIcon: LinkIcon,
    MessageCommentIcon: MessageCommentIcon,
    PencilIcon: PencilIcon,
    ReplyIcon: ReplyIcon,
    BuildingIcon: BuildingIcon,
    BackArrowIcon: BackArrowIcon,
    SunIcon: SunIcon,
    CloudIcon: CloudIcon,
    MistIcon: MistIcon,
    CloudRainIcon: CloudRainIcon,
    SnowflakeIcon: SnowflakeIcon,
    CloudLightningIcon: CloudLightningIcon,
    SettingsIcon: SettingsIcon,
    MapCogIcon: MapCogIcon,
    GiftIcon: GiftIcon,
    MoonStarsIcon: MoonStarsIcon,
    TextResizeIcon: TextResizeIcon,
    BellIcon: BellIcon,
    SearchIcon: SearchIcon,
    CalendarCheckIcon: CalendarCheckIcon,
    LockIcon: LockIcon,
    LogoutIcon: LogoutIcon,
    RefreshIcon: RefreshIcon,
    AdminFilledMenuIcon: AdminFilledMenuIcon,
    EmojiPickerIcon: EmojiPickerIcon,
    ExternalLinkIcon: ExternalLinkIcon,
    ShareIcon: ShareIcon,
    WalletIcon: WalletIcon,
    CoinIcon: CoinIcon,
    BanknoteArrowUpIcon: BanknoteArrowUpIcon,
    BanknoteArrowDownIcon: BanknoteArrowDownIcon,
    PiggyBankIcon: PiggyBankIcon,
    ChartBarIcon: ChartBarIcon,
    ChartPieIcon: ChartPieIcon,
    CalendarCogIcon: CalendarCogIcon,
    CalendarSearchIcon: CalendarSearchIcon,
    TrophyIcon: TrophyIcon,
    PodiumIcon: PodiumIcon,
    CloudDataConnectionIcon: CloudDataConnectionIcon,
    LogIcon: LogIcon,
    HourglassIcon: HourglassIcon,
    AlertTriangleIcon: AlertTriangleIcon,
    ShieldCheckIcon: ShieldCheckIcon,
    CalendarExportIcon: CalendarExportIcon,
    GalleryIcon: GalleryIcon,
    PollSectionIcon: PollSectionIcon,
    LineHeightIcon: LineHeightIcon,
    MegaphoneIcon: MegaphoneIcon,
    SmallXIcon: SmallXIcon,
    TrashIcon: TrashIcon,
    ImageDownIcon: ImageDownIcon,
    PlaceSectionIcon: PlaceSectionIcon,
    MemoSectionIcon: MemoSectionIcon,
    ThreeLinesIcon: ThreeLinesIcon,
    PlaceCategoryMarkerIcon: PlaceCategoryMarkerIcon,
    CctvIcon: CctvIcon,
    DicesIcon: DicesIcon,
  });
}
