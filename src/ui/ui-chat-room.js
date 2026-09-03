/**
 * Chat room view (P4-16)
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
      }).catch(() => {});
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
    const el = e && e.target;
    const scrollTop = el && typeof el.scrollTop === 'number' ? el.scrollTop : 0;
    const lastScrollTop = lastScrollTopRef.current;
    const delta = scrollTop - lastScrollTop;
    lastScrollTopRef.current = scrollTop;
    // Ignore sub-pixel / rubber-band noise
    if (Math.abs(delta) < 4) return;
    const maxScroll = el ? Math.max(0, (el.scrollHeight || 0) - (el.clientHeight || 0)) : 0;
    // Near the bottom, never re-show from tiny upward deltas (padding oscillation)
    const nearBottom = maxScroll > 0 && (maxScroll - scrollTop) < 64;
    if (scrollTop < 10) {
      setIsHeaderVisible(true);
    } else if (delta > 0 && scrollTop > 56) {
      setIsHeaderVisible(false);
    } else if (delta < 0 && !nearBottom) {
      setIsHeaderVisible(true);
    }
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


export function ChatRoomView({
  calendar,
  chatMessages,
  loadingOlderChat,
  hasMoreOlderChat,
  onLoadOlderChat,
  chatInput,
  setChatInput,
  chatParticipantId,
  setChatParticipantId,
  isChatSheetOpen,
  setIsChatSheetOpen,
  isChatSubmitting,
  chatTextareaRef,
  chatImage: chatImages,
  setChatImage: setChatImages,
  chatReplyTarget = null,
  setChatReplyTarget,
  activeLightbox,
  setActiveLightbox,
  onSend,
  onDeleteMessage,
  onEditMessage,
  onAddPinnedNotice,
  onRemovePinnedNotice,
  onBack,
  isHeaderVisible,
  handleChatScroll,
  onRevealChatInput,
  chatMessagesContainerRef,
  showToast,
  onPromoteImageUrl,
  onSaveImageTags,
  onSearchTag,
  onShare,
  isDarkTheme,
  onToggleTheme,
  fontScalePercent,
  onDecreaseFont,
  onIncreaseFont,
  isChatNotifyEnabled,
  onToggleChatNotifications,
  onOpenGallery,
  onChangeView,
  stickyVideoKey,
  onActivateVideo,
  onDeletePhoto,
  onReplacePhoto,
  onJumpToChatMessage,
  onJumpToMemo,
  onJumpToMeetingDate,
  onGetChatMessageOrdinal,
  onGetGalleryPhotoOrdinal,
  onRequestConfirm,
  syncStatus = null,
  externalFocusMessageId = null
,
  onOpenAppSettings
,
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
  const HeaderSearchIcon = ({ size = 20 }) => /*#__PURE__*/React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true }, /*#__PURE__*/React.createElement("circle", { cx: "11", cy: "11", r: "8" }), /*#__PURE__*/React.createElement("path", { d: "m21 21-4.3-4.3" }));
  const __deps = window.GATHER_UI_DEPS || {};
  const __comp = window.GATHER_UI_COMPONENTS || {};
  const BackArrowIcon = __comp.BackArrowIcon || __deps.BackArrowIcon;
  const SmallXIcon = __comp.SmallXIcon || __deps.SmallXIcon;
  const TrashIcon = __comp.TrashIcon || __deps.TrashIcon;
  const PencilIcon = __comp.PencilIcon || __deps.PencilIcon;
  const ReplyIcon = __comp.ReplyIcon || __deps.ReplyIcon;
  const ThreeLinesIcon = __comp.ThreeLinesIcon || __deps.ThreeLinesIcon;
  const MegaphoneIcon = __comp.MegaphoneIcon || __deps.MegaphoneIcon;
  const EmojiPickerIcon = __comp.EmojiPickerIcon || __deps.EmojiPickerIcon;
  const ChatGalleryModal = __comp.ChatGalleryModal || __deps.ChatGalleryModal;
  const SyncStatusChip = __comp.SyncStatusChip || __deps.SyncStatusChip;
  const SyncStatusBanner = __comp.SyncStatusBanner || __deps.SyncStatusBanner;
  const ChatSideMenu = __comp.ChatSideMenu || __deps.ChatSideMenu;
  const EmojiPickerSheet = __comp.EmojiPickerSheet || __deps.EmojiPickerSheet;
  const ImageProcessingOverlay = __comp.ImageProcessingOverlay || __deps.ImageProcessingOverlay;
  const ImageThumbRemoveButton = __comp.ImageThumbRemoveButton || __deps.ImageThumbRemoveButton;
  const InlineSearchBar = __comp.InlineSearchBar || __deps.InlineSearchBar;
  const Lightbox = __comp.Lightbox || __deps.Lightbox;
  const ParticipantPickerButton = __comp.ParticipantPickerButton || __deps.ParticipantPickerButton;
  const getActiveParticipants = __deps.getActiveParticipants;
  const extractFirstUrl = __deps.extractFirstUrl;
  const autoGrowTextarea = __deps.autoGrowTextarea;
  const getChatLastReadTimestamp = __deps.getChatLastReadTimestamp;
  const setChatLastReadTimestamp = __deps.setChatLastReadTimestamp;
  const appendChatImageFiles = __deps.appendChatImageFiles;
  const confetti = __deps.confetti || window.confetti;
  const CONFETTI_Z_INDEX = __deps.CONFETTI_Z_INDEX;
  const meetingPhotoMessageIds = React.useMemo(() => {
    const ids = new Set();
    const meetings = typeof getConfirmedMeetings === 'function' ? getConfirmedMeetings(calendar) : [];
    meetings.forEach(meeting => {
      (Array.isArray(meeting?.photos) ? meeting.photos : []).forEach(photo => {
        const messageId = String(photo?.sourceMessageId || '').trim();
        if (!messageId) return;
        const mediaKey = String(photo?.mediaKey || photo?.assetKey || '').trim().toLowerCase();
        const uploadSource = String(photo?.uploadSource || '').trim().toLowerCase();
        const source = String(photo?.source || '').trim().toLowerCase();
        if (!(mediaKey.startsWith('meeting:') || uploadSource === 'meeting' || source === 'meeting')) return;
        ids.add(messageId);
      });
    });
    return ids;
  }, [calendar]);

  const [viewportBottom, setViewportBottom] = React.useState(0);
  const [composerHeight, setComposerHeight] = React.useState(0);
  const chatComposerRef = React.useRef(null);
  const [isInputFocused, setIsInputFocused] = React.useState(false);
  // 'closed' (default -- nothing shown) | 'list' (existing notices + 공지 추가) | 'add' (textarea)
  const [noticePanelMode, setNoticePanelMode] = React.useState('closed');
  const [noticeInput, setNoticeInput] = React.useState('');
  const [isChatSideMenuOpen, setIsChatSideMenuOpen] = React.useState(false);
  const [isChatGalleryOpen, setIsChatGalleryOpen] = React.useState(false);
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [searchFocusIndex, setSearchFocusIndex] = React.useState(0);
  const visibleChatMessages = React.useMemo(() => {
    return Array.isArray(chatMessages)
      ? chatMessages.filter(msg => msg && msg.uploadSource !== 'meeting' && msg.uploadSource !== 'gallery' && !meetingPhotoMessageIds.has(msg.id))
      : [];
  }, [chatMessages, meetingPhotoMessageIds]);

  // Ordered list of message IDs matching the current search query (for ▲▼ navigation)
  const searchMatchIds = React.useMemo(() => {
    if (!searchQuery) return [];
    const q = searchQuery.toLowerCase();
    return visibleChatMessages
      .filter(m => m.text && m.text.toLowerCase().includes(q))
      .map(m => m.id)
      .filter(id => !!id);
  }, [visibleChatMessages, searchQuery]);

  const clampedFocusIdx = searchMatchIds.length > 0
    ? Math.max(0, Math.min(searchFocusIndex, searchMatchIds.length - 1))
    : 0;
  const focusedMsgId = searchMatchIds.length > 0 ? searchMatchIds[clampedFocusIdx] : null;

  // Scroll focused match into view whenever it changes
  React.useEffect(() => {
    if (!focusedMsgId) return;
    const el = document.querySelector('[data-msg-row-id="' + focusedMsgId + '"]');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [focusedMsgId]);

  const pinnedNotices = getPinnedNotices(calendar);
  const revealedMsgId = useTapRevealedMsgId();

  // Read-up-to-here marker: capture the read timestamp as it was BEFORE this view marks
  // everything read, so the marker can be placed at the right spot in the message list.
  // Mirrors the same browser-storage key CommentsSection uses for its unread badge.
  const [priorReadTimestamp] = React.useState(() => getChatLastReadTimestamp(calendar.id));
  React.useEffect(() => {
    const latest = visibleChatMessages.length > 0 ? visibleChatMessages[visibleChatMessages.length - 1].timestamp : 0;
    if (latest > 0) setChatLastReadTimestamp(calendar.id, latest);
  }, [calendar.id, visibleChatMessages.length > 0 ? visibleChatMessages[visibleChatMessages.length - 1]?.timestamp : 0]);

  // Scroll-to-bottom floating button: shown once scrolled far enough away from the latest
  // message that swiping back down manually would be tedious.
  const [showScrollToBottom, setShowScrollToBottom] = React.useState(false);
  // "새로운 메시지" banner: distinct from the generic scroll-to-bottom button above -- this one
  // only appears when a message actually arrives WHILE the user is reading older history
  // (scrolled away from the bottom), replacing the generic button with a labeled pill so a new
  // message doesn't go unnoticed. Clears once the user scrolls back near the bottom themselves.
  const [hasNewMessageBelow, setHasNewMessageBelow] = React.useState(false);
  // Track the id of the newest (last) message rather than the array's length -- scrolling up
  // triggers onLoadOlderChat, which prepends older history and also grows this array's length,
  // but doesn't change what's actually newest. A length-only check fired the banner on every
  // such page of history even though nothing new had arrived at the bottom; comparing the last
  // message's id only fires when a message is genuinely appended at the end.
  const lastVisibleMsgIdRef = React.useRef(
    visibleChatMessages.length ? visibleChatMessages[visibleChatMessages.length - 1].id : null
  );
  React.useEffect(() => {
    const last = visibleChatMessages.length ? visibleChatMessages[visibleChatMessages.length - 1] : null;
    const lastId = last ? last.id : null;
    const appended = lastId != null && lastId !== lastVisibleMsgIdRef.current;
    lastVisibleMsgIdRef.current = lastId;
    if (!appended) return;
    const el = chatMessagesContainerRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    if (distanceFromBottom > 200) setHasNewMessageBelow(true);
  }, [visibleChatMessages]);
  // Confetti burst around a newly-sent bubble -- only for messages I just sent myself (not
  // ones arriving from other participants, and not the initial batch on mount). Anchors the
  // burst to the actual bubble's on-screen position via its data-msg-row-id, same pattern as
  // celebrateMoneyBurst's origin-element math elsewhere in the app.
  const prevLastMsgIdRef = React.useRef(undefined);
  React.useEffect(() => {
    return; // Disabled chat confetti per user request
    // eslint-disable-next-line no-unreachable -- kept in place to make re-enabling easy later
    const last = visibleChatMessages[visibleChatMessages.length - 1];
    const prevId = prevLastMsgIdRef.current;
    prevLastMsgIdRef.current = last ? last.id : null;
    if (prevId === undefined || !last || last.id === prevId) return;
    if (last.participantId !== chatParticipantId) return;
    if (typeof confetti !== 'function') return;
    requestAnimationFrame(() => {
      const el = chatMessagesContainerRef.current && last.id
        ? chatMessagesContainerRef.current.querySelector(`[data-msg-row-id="${last.id}"]`)
        : null;
      let origin = { y: 0.75 };
      if (el && typeof el.getBoundingClientRect === 'function') {
        const rect = el.getBoundingClientRect();
        if (rect.width || rect.height) {
          origin = {
            x: (rect.left + rect.width / 2) / window.innerWidth,
            y: (rect.top + rect.height / 2) / window.innerHeight
          };
        }
      }
      try {
        confetti({ particleCount: 36, spread: 60, startVelocity: 26, gravity: 1.1, ticks: 90, origin, scalar: 0.85, zIndex: CONFETTI_Z_INDEX });
      } catch (err) {
        console.warn('Chat confetti error', err);
      }
    });
  }, [visibleChatMessages.length]);
  const handleScrollCombined = (e) => {
    if (handleChatScroll) handleChatScroll(e);
    const el = e.target;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    setShowScrollToBottom(distanceFromBottom > 200);
    if (distanceFromBottom <= 200) setHasNewMessageBelow(false);
    isAtBottomRef.current = distanceFromBottom <= 60;
  };
  const scrollToBottom = () => {
    if (chatMessagesContainerRef.current) {
      chatMessagesContainerRef.current.scrollTo({ top: chatMessagesContainerRef.current.scrollHeight, behavior: 'smooth' });
    }
  };
  const handleNewMessageBannerClick = () => {
    scrollToBottom();
    setHasNewMessageBelow(false);
  };

  // Message bubbles can grow taller AFTER they first render -- most notably a link preview
  // card (useLinkPreview/LinkPreviewCard in ui-shared.js), which fetches OpenGraph data
  // asynchronously and pops in a thumbnail/title card well after the initial send. The
  // chatMessages.length-keyed scroll-to-bottom effect (app-main.js) only fires once when the
  // message is first added, so that later growth used to push the bubble's bottom half under
  // the fixed .chat-composer bar with nothing to re-scroll it into view. Track whether the
  // user is (still) at the bottom and, if so, follow any subsequent height growth of the
  // message list so a freshly-sent bubble never ends up hidden behind the input field.
  const isAtBottomRef = React.useRef(true);
  const messagesListInnerRef = React.useRef(null);
  React.useEffect(() => {
    const el = messagesListInnerRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => {
      if (!isAtBottomRef.current) return;
      const container = chatMessagesContainerRef.current;
      if (container) container.scrollTop = container.scrollHeight;
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const canSendChatNow = () => !isChatSubmitting && (!!chatInput.trim() || chatImages.length > 0);
  const triggerChatSend = useChatSendGuard(onSend, canSendChatNow);
  const handleSendPointerDown = (event) => {
    if (!canSendChatNow()) return;
    event.preventDefault();
    event.stopPropagation();
    triggerChatSend();
  };
  const handleSendClick = () => {
    triggerChatSend();
  };

  // Reply-in-progress ("답장"): tapping a bubble's reply button snapshots just enough of that
  // message to render the quote card (see renderReplyQuoteCard below) and to link back to it by
  // id -- not the live message object, so a later edit/delete of the original doesn't retroactively
  // change what the reply's quote shows (same behavior as KakaoTalk/Slack/Discord replies).
  const handleStartReply = (msg, imageCount) => {
    if (typeof setChatReplyTarget !== 'function' || !msg) return;
    const text = String(msg.text || '').trim();
    setChatReplyTarget({
      id: msg.id,
      participantId: msg.participantId,
      text: text.length > 200 ? text.slice(0, 200) : text,
      imageCount: imageCount || 0
    });
    if (onRevealChatInput) onRevealChatInput();
    requestAnimationFrame(() => chatTextareaRef.current && chatTextareaRef.current.focus());
  };
  const handleCancelReply = () => {
    if (typeof setChatReplyTarget === 'function') setChatReplyTarget(null);
  };
  const replyQuoteLabel = (replyTo) => {
    if (!replyTo) return '';
    if (replyTo.text) return replyTo.text;
    const count = Number(replyTo.imageCount) || 0;
    return count > 1 ? `사진 ${count}장` : '사진';
  };

  // Note: chat notification on/off is fully owned by the App-level handleMainToggleNotifications,
  // reached here via the isChatNotifyEnabled/onToggleChatNotifications props (passed straight
  // through to ChatSideMenu) -- including the iOS false-positive-permission probe and the
  // NotificationPermissionHelpModal popup. A parallel local copy of this same state/handler/
  // auto-subscribe-effect used to live here too (pre-dating that unification) but was never
  // actually wired to anything -- removed as dead code that only duplicated App's own
  // subscribeUserToPush effect on every ChatRoomView mount.

  // Monitor visualViewport to shift layout above virtual keyboard on mobile devices.
  // Cross-browser notes:
  //  - iOS Safari: visualViewport.height shrinks when keyboard is up; offsetTop may be > 0 if
  //    the page has scrolled up to keep the input in view -- we must subtract offsetTop to get
  //    only the keyboard portion, not page scroll.
  //  - Android Chrome/Samsung: innerHeight truly shrinks with interactive-widget=resizes-content
  //    so the viewportBottom calc yields ~0. The layout simply follows the shrunk window.
  //  - Android Firefox: same as Chrome (innerHeight shrinks).
  //  - All: rAF coalesces rapid back-to-back events (Samsung keyboard auto-complete bar pop-in).
  const vpRafRef = React.useRef(null);
  React.useEffect(() => {
    const updateViewport = () => {
      if (!window.visualViewport) return;
      // offsetTop is non-zero on iOS when the browser scrolls the page to keep the input
      // in view -- that scroll portion is NOT keyboard, so subtract it.
      const offsetTop = window.visualViewport.offsetTop || 0;
      const kbHeight = window.innerHeight - window.visualViewport.height - offsetTop;
      setViewportBottom(Math.max(0, kbHeight));
    };
    const onVpEvent = () => {
      if (vpRafRef.current) cancelAnimationFrame(vpRafRef.current);
      vpRafRef.current = requestAnimationFrame(updateViewport);
    };

    // iOS Safari focus-in fallback: visualViewport resize fires late.
    // When a textarea inside the chat room gets focus, force a delayed measurement.
    const onFocus = (e) => {
      const t = e.target;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA') && t.closest && t.closest('.chat-room-container')) {
        setIsInputFocused(true);
        // Two-pass: immediate (catches partial-open) + 400ms (catches fully-open on iOS)
        setTimeout(updateViewport, 50);
        setTimeout(updateViewport, 400);
      }
    };
    const onBlur = (e) => {
      const t = e.target;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA') && t.closest && t.closest('.chat-room-container')) {
        const related = e.relatedTarget;
        if (related && related.closest && related.closest('.chat-composer')) {
          return;
        }
        setTimeout(() => {
          const a = document.activeElement;
          if (a && (a.tagName === 'TEXTAREA' || a.tagName === 'INPUT') && a.closest &&
              (a.closest('.chat-composer') || a.closest('.chat-room-container'))) {
            setIsInputFocused(true);
            return;
          }
          setIsInputFocused(false);
          setTimeout(updateViewport, 300);
        }, 50);
      }
    };

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', onVpEvent);
      window.visualViewport.addEventListener('scroll', onVpEvent);
    }
    document.addEventListener('focusin', onFocus);
    document.addEventListener('focusout', onBlur);
    updateViewport();
    return () => {
      if (vpRafRef.current) cancelAnimationFrame(vpRafRef.current);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', onVpEvent);
        window.visualViewport.removeEventListener('scroll', onVpEvent);
      }
      document.removeEventListener('focusin', onFocus);
      document.removeEventListener('focusout', onBlur);
    };
  }, []);

  // Keyboard open/close: scroll to bottom AND ensure composer is always visible
  // when keyboard is up. On some Android browsers (Samsung Internet, Chrome), the keyboard
  // appears without a scroll event, so isHeaderVisible must be forced here too.
  React.useEffect(() => {
    if (chatMessagesContainerRef.current) {
      const container = chatMessagesContainerRef.current;
      container.scrollTop = container.scrollHeight;
      const t = setTimeout(() => {
        container.scrollTop = container.scrollHeight;
      }, 100);
      return () => clearTimeout(t);
    }
  }, [viewportBottom]);

  // Reserve the actual composer height so a tall reply preview can never cover the last bubble.
  React.useEffect(() => {
    const el = chatComposerRef.current;
    if (!el) return;
    const measure = () => setComposerHeight(Math.ceil(el.getBoundingClientRect().height));
    measure();
    if (typeof ResizeObserver === 'function') {
      const observer = new ResizeObserver(measure);
      observer.observe(el);
      return () => observer.disconnect();
    }
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [chatReplyTarget, chatInput, chatImages, isInputFocused, viewportBottom]);

  const fileInputRefChat = React.useRef(null);
  const [imageProcessingChat, setImageProcessingChat] = React.useState(null);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = React.useState(false);
  const insertEmojiIntoChatInput = (emoji) => {
    const textarea = chatTextareaRef.current;
    const start = textarea ? (textarea.selectionStart ?? chatInput.length) : chatInput.length;
    const end = textarea ? (textarea.selectionEnd ?? chatInput.length) : chatInput.length;
    const next = chatInput.slice(0, start) + emoji + chatInput.slice(end);
    setChatInput(next);
    if (textarea) {
      requestAnimationFrame(() => {
        textarea.focus();
        const pos = start + emoji.length;
        textarea.setSelectionRange(pos, pos);
      });
    }
  };
  const handleFileChangeChat = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    try {
      await appendChatImageFiles({
        files,
        currentCount: chatImages.length,
        setImageProcessing: setImageProcessingChat,
        setChatImages,
        showToast
      });
    } catch (err) {
      console.error('handleFileChangeChat unexpected error:', err);
      if (showToast) showToast('사진 첨부 중 오류', 'error', 5000);
    } finally {
      setImageProcessingChat(null);
      e.target.value = '';
    }
  };
  const handlePasteImagesChat = async (e) => {
    const pastedFiles = getImageFilesFromClipboardEvent(e);
    if (pastedFiles.length === 0) return;
    e.preventDefault();
    e.stopPropagation();
    try {
      await appendChatImageFiles({
        files: pastedFiles,
        currentCount: chatImages.length,
        setImageProcessing: setImageProcessingChat,
        setChatImages,
        showToast
      });
    } catch (err) {
      console.error('handlePasteImagesChat unexpected error:', err);
      if (showToast) showToast('붙여넣은 사진 첨부 중 오류', 'error', 5000);
    } finally {
      setImageProcessingChat(null);
    }
  };
  const participants = getActiveParticipants(calendar);
  const participantsMap = participants.reduce((acc, p) => {
    acc[p.id] = p;
    return acc;
  }, {});
  const selectedParticipant = participants.find(p => p.id === chatParticipantId);
  // Kakao-style reply quote card, rendered at the top of a bubble when msg.replyTo is set --
  // shows the quoted sender + a 1-2 line snippet of what they said, and jumps back to that
  // original bubble (scroll + highlight, paginating through older history if needed) on tap.
  const renderReplyQuoteCard = (replyTo) => {
    if (!replyTo) return null;
    const qp = participantsMap[replyTo.participantId];
    return /*#__PURE__*/React.createElement("div", {
      onClick: e => {
        e.stopPropagation();
        if (onJumpToChatMessage && replyTo.id) onJumpToChatMessage(replyTo.id);
      },
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: '2px',
        padding: '6px 8px',
        marginBottom: '6px',
        borderRadius: '8px',
        borderLeft: `3px solid ${qp?.color || '#94A3B8'}`,
        backgroundColor: 'rgba(148, 163, 184, 0.1)',
        cursor: onJumpToChatMessage ? 'pointer' : 'default'
      }
    },
      /*#__PURE__*/React.createElement("span", {
        style: { fontSize: 'var(--font-size-sm)', fontWeight: 700, color: qp?.color || '#64748B' }
      }, qp?.name || '알수없음'),
      /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: 'var(--font-size-md)',
          color: 'var(--text-main)',
          opacity: 0.75,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          wordBreak: 'break-word'
        }
      }, replyQuoteLabel(replyTo))
    );
  };
  let lastDateStr = '';
  let readMarkerInserted = false;
  const renderedMessages = [];
  visibleChatMessages.forEach((msg, idx) => {
    // 일정탭('meeting')/갤러리페이지('gallery')에서 올린 사진은 참조용 실제 채팅 메시지
    // 문서로 저장되긴 하지만(태그 편집·삭제·갤러리 정렬 번호 매기기가 이 문서를 가리킴),
    // 채팅 피드에는 노출되지 않아야 함 -- 갤러리/일정 레이어팝업 사진탭에서만 보여야 함.
    if (msg.uploadSource === 'meeting' || msg.uploadSource === 'gallery') return;
    if (!readMarkerInserted && priorReadTimestamp > 0 && msg.timestamp > priorReadTimestamp) {
      readMarkerInserted = true;
      renderedMessages.push(/*#__PURE__*/React.createElement("div", {
        key: `read-marker-${msg.timestamp}-${idx}`,
        style: {
          position: 'relative',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          margin: '16px 0'
        }
      },
        /*#__PURE__*/React.createElement("div", {
          style: { position: 'absolute', left: 0, right: 0, height: '1px', backgroundColor: '#FCA5A5', zIndex: 1 }
        }),
        /*#__PURE__*/React.createElement("span", {
          style: {
            position: 'relative', zIndex: 2, backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5',
            borderRadius: '12px', padding: '3px 12px', fontSize: 'var(--font-size-sm)', color: '#EF4444', fontWeight: 'bold'
          }
        }, '여기까지 읽으셨습니다')
      ));
    }
    const date = new Date(msg.timestamp);
    const dateStr = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
    if (dateStr !== lastDateStr) {
      renderedMessages.push(/*#__PURE__*/React.createElement("div", {
        key: `divider-${msg.timestamp}-${idx}`,
        style: {
          position: 'relative',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          margin: '24px 0 16px'
        }
      },
        /* Line */
        /*#__PURE__*/React.createElement("div", {
          style: {
            position: 'absolute',
            left: 0,
            right: 0,
            height: '1px',
            backgroundColor: 'var(--border-subtle)',
            zIndex: 1
          }
        }),
        /* Date Badge */
        /*#__PURE__*/React.createElement("span", {
          style: {
            position: 'relative',
            zIndex: 2,
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '12px',
            padding: '3px 12px',
            fontSize: 'var(--font-size-sm)',
            color: 'var(--text-muted)',
            fontWeight: 'bold'
          }
        }, formatChatDividerDate(msg.timestamp))
      ));
      lastDateStr = dateStr;
    }
    const p = participantsMap[msg.participantId];
    const isMe = msg.participantId === chatParticipantId;
    const timeStr = formatChatTime(msg.timestamp);
    const msgHasImages = !!(msg.imageUrl || (Array.isArray(msg.imageUrls) && msg.imageUrls.length > 0));
    const msgImageCount = Array.isArray(msg.imageUrls) && msg.imageUrls.length > 0 ? msg.imageUrls.length : (msg.imageUrl ? 1 : 0);
    const msgDirectMediaInfo = getDirectChatMediaInfo(extractFirstUrl(msg.text || ''));
    const isEmbedMessage = msgDirectMediaInfo?.type === 'embed';
    // Wide enough that the embed's own .chat-media-resizable wrapper (see DirectChatMediaText)
    // has real headroom to drag-resize into on desktop, instead of immediately overflowing
    // this bubble's box the moment the user grows it past the old 820px ceiling.
    const chatBubbleMaxWidth = isEmbedMessage ? 'calc(100% - 60px)' : '65%';
    const multiImageBubbleMaxWidth = msgImageCount >= 2
      ? `min(65%, calc(${msgImageCount >= 12 ? 6 : msgImageCount >= 5 ? 5 : msgImageCount === 2 ? 2 : 3} * 76px + (${msgImageCount >= 12 ? 6 : msgImageCount >= 5 ? 5 : msgImageCount === 2 ? 2 : 3} - 1) * 4px + 24px))`
      : chatBubbleMaxWidth;
    const bubbleWrapperMaxWidth = (!isEmbedMessage && msgImageCount >= 2) ? multiImageBubbleMaxWidth : chatBubbleMaxWidth;
    const chatMediaStyle = isEmbedMessage
      ? { maxWidth: '760px', embedMaxWidth: '760px', portraitEmbedMaxWidth: '360px', maxHeight: '72vh', marginBottom: msg.text ? '10px' : '0' }
      : { maxWidth: '420px', maxHeight: '62vh', marginBottom: msg.text ? '10px' : '0' };
    const isEmojiOnlyMessage = isEmojiOnlyChatText(msg.text) && !msgHasImages;
    const rowId = msg.id || `msg-${idx}`;
    const isSearchMatch = searchQuery && msg.text && msg.text.toLowerCase().includes(searchQuery.toLowerCase());
    // Focused either by in-chat text search (isSearchMatch + arrow-key navigation) or by an
    // external jump-to-message request (Lightbox source link, admin/global search, ?msg= deep
    // link -- see focusChatMessage in app-main.js) -- both render identically, the same purple
    // border + up/down shake as the in-chat search feature has always used.
    const isSearchFocused = (isSearchMatch && rowId === focusedMsgId) || (!!externalFocusMessageId && rowId === externalFocusMessageId);
    renderedMessages.push(/*#__PURE__*/React.createElement("div", {
      key: rowId,
      className: `msg-row-hover ${revealedMsgId === rowId ? 'msg-actions-revealed' : ''}`,
      'data-msg-row-id': rowId,
      style: {
        display: 'flex',
        alignItems: 'flex-start',
        gap: '8px',
        marginBottom: '12px',
        justifyContent: isMe ? 'flex-end' : 'flex-start'
      }
    }, !isMe && /*#__PURE__*/React.createElement("span", {
      style: {
        backgroundColor: p?.color || '#94A3B8',
        color: '#FFFFFF',
        padding: '3px 8px',
        borderRadius: 'var(--radius-full)',
        fontSize: 'var(--font-size-md)',
        fontWeight: 'bold',
        flexShrink: 0,
        alignSelf: 'flex-start',
        marginTop: '2px'
      }
    }, p?.name || '알수없음'), isMe ? [/*#__PURE__*/React.createElement("div", {
      key: "meta",
      style: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        alignItems: 'flex-end',
        alignSelf: 'flex-end',
        gap: '4px',
        marginRight: '6px',
        flexShrink: 0,
        minWidth: '32px',
        padding: '2px 0'
      }
    },
      /* Top: Reply + Delete buttons */
      /*#__PURE__*/React.createElement("div", {
        style: { display: 'flex', alignItems: 'center', gap: '4px' }
      },
        /*#__PURE__*/React.createElement("button", {
          type: "button",
          className: "msg-actions-group",
          onClick: () => handleStartReply(msg, msgImageCount),
          title: "답장",
          style: {
            width: '32px',
            height: '32px',
            minWidth: '32px',
            minHeight: '32px',
            boxSizing: 'border-box',
            border: 'none',
            background: 'none',
            padding: 0,
            cursor: 'pointer',
            color: 'var(--text-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end'
          }
        }, /*#__PURE__*/React.createElement(ReplyIcon, { size: 15 })),
        /*#__PURE__*/React.createElement("button", {
          type: "button",
          className: "msg-actions-group",
          onClick: () => onDeleteMessage && onDeleteMessage(msg),
          title: "삭제",
          style: {
            width: '32px',
            height: '32px',
            minWidth: '32px',
            minHeight: '32px',
            boxSizing: 'border-box',
            border: 'none',
            background: 'none',
            padding: 0,
            cursor: 'pointer',
            color: 'var(--text-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end'
          }
        }, /*#__PURE__*/React.createElement(TrashIcon, { size: 13 }))
      ),
      /* Bottom: Edit button + Timestamp */
      /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: '4px'
        }
      },
        /* Edit button */
        /*#__PURE__*/React.createElement("button", {
          type: "button",
          className: "msg-actions-group",
          onClick: () => onEditMessage && onEditMessage(msg),
          title: "편집",
          style: {
            width: '32px',
            height: '32px',
            minWidth: '32px',
            minHeight: '32px',
            boxSizing: 'border-box',
            border: '1px solid var(--border-subtle)',
            backgroundColor: 'var(--bg-primary)',
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            padding: 0,
            color: 'var(--text-muted)'
          }
        }, /*#__PURE__*/React.createElement(PencilIcon, { size: 12 })),
        /* Timestamp */
        /*#__PURE__*/React.createElement("span", {
          style: {
            fontSize: 'var(--font-size-xs)',
            color: 'var(--text-light)',
            lineHeight: '1.25',
            textAlign: 'right'
          }
        }, timeStr)
      )
    ), /*#__PURE__*/React.createElement("div", {
      key: "bubble-wrapper",
      // minWidth:0 overrides the flex item's default min-width:auto, which otherwise refuses to
      // shrink the bubble below its content's natural size (the classic flexbox overflow trap) --
      // without it, an oversized child (e.g. an embed sized by an imprecise vw estimate) can force
      // this box wider than message-row actually has room for.
      style: { position: 'relative', maxWidth: bubbleWrapperMaxWidth, minWidth: 0, zIndex: 1, alignSelf: 'flex-end' }
    }, /*#__PURE__*/React.createElement("div", {
      key: isSearchFocused ? `bubble-focused-${rowId}` : undefined,
      className: isSearchFocused ? 'chat-search-focused-bubble' : (isSearchMatch ? 'chat-search-match-bubble' : ''),
      style: {
        position: 'relative',
        zIndex: 1,
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        padding: isEmojiOnlyMessage ? '12px 16px' : '8px 12px',
        fontSize: isEmojiOnlyMessage ? '4rem' : '0.9rem',
        lineHeight: isEmojiOnlyMessage ? 1 : '1.4',
        color: 'var(--text-main)',
        wordBreak: 'keep-all',
        overflowWrap: 'break-word',
        whiteSpace: 'pre-wrap',
        boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
        // Hard guarantee that text/media content never visually escapes the bubble's rounded
        // border, regardless of any upstream sizing imprecision (e.g. an embed's vw-estimated
        // width overshooting on a narrow viewport) -- overflow:hidden is spec-basic and behaves
        // identically across Chrome/Whale/Safari/Firefox, unlike relying purely on width math.
        overflow: 'hidden'
      }
    }, renderReplyQuoteCard(msg.replyTo), renderChatMessageBody(msg, setActiveLightbox, chatMediaStyle, searchQuery, stickyVideoKey, onActivateVideo)), /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        right: '-7px',
        top: '10px',
        width: 0,
        height: 0,
        borderTop: '7px solid transparent',
        borderBottom: '7px solid transparent',
        borderLeft: isSearchFocused
          ? '7px solid #7C3AED'
          : isSearchMatch
            ? '7px solid rgba(124,58,237,0.45)'
            : '7px solid var(--border-subtle)',
        zIndex: 2
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        right: '-5px',
        top: '11px',
        width: 0,
        height: 0,
        borderTop: '6px solid transparent',
        borderBottom: '6px solid transparent',
        borderLeft: isSearchFocused
          ? '6px solid rgba(124,58,237,0.06)'
          : isSearchMatch
            ? '6px solid rgba(124,58,237,0.03)'
            : '6px solid var(--bg-card)',
        zIndex: 3
      }
    }))] : [/*#__PURE__*/React.createElement("div", {
      key: "bubble-wrapper",
      style: { position: 'relative', maxWidth: bubbleWrapperMaxWidth, minWidth: 0, zIndex: 1 }
    }, /*#__PURE__*/React.createElement("div", {
      key: isSearchFocused ? `bubble-focused-${rowId}` : undefined,
      className: isSearchFocused ? 'chat-search-focused-bubble' : (isSearchMatch ? 'chat-search-match-bubble' : ''),
      style: {
        position: 'relative',
        zIndex: 1,
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        padding: isEmojiOnlyMessage ? '12px 16px' : '8px 12px',
        fontSize: isEmojiOnlyMessage ? '4rem' : '0.9rem',
        lineHeight: isEmojiOnlyMessage ? 1 : '1.4',
        color: 'var(--text-main)',
        wordBreak: 'keep-all',
        overflowWrap: 'break-word',
        whiteSpace: 'pre-wrap',
        boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
        // Hard guarantee that text/media content never visually escapes the bubble's rounded
        // border, regardless of any upstream sizing imprecision (e.g. an embed's vw-estimated
        // width overshooting on a narrow viewport) -- overflow:hidden is spec-basic and behaves
        // identically across Chrome/Whale/Safari/Firefox, unlike relying purely on width math.
        overflow: 'hidden'
      }
    }, renderReplyQuoteCard(msg.replyTo), renderChatMessageBody(msg, setActiveLightbox, chatMediaStyle, searchQuery, stickyVideoKey, onActivateVideo)), /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        left: '-7px',
        top: '10px',
        width: 0,
        height: 0,
        borderTop: '7px solid transparent',
        borderBottom: '7px solid transparent',
        borderRight: isSearchFocused
          ? '7px solid #7C3AED'
          : isSearchMatch
            ? '7px solid rgba(124,58,237,0.45)'
            : '7px solid var(--border-subtle)',
        zIndex: 2
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        left: '-5px',
        top: '11px',
        width: 0,
        height: 0,
        borderTop: '6px solid transparent',
        borderBottom: '6px solid transparent',
        borderRight: isSearchFocused
          ? '6px solid rgba(124,58,237,0.06)'
          : isSearchMatch
            ? '6px solid rgba(124,58,237,0.03)'
            : '6px solid var(--bg-card)',
        zIndex: 3
      }
    })), /*#__PURE__*/React.createElement("div", {
      key: "meta",
      style: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        alignItems: 'flex-start',
        alignSelf: 'stretch',
        marginLeft: '6px',
        flexShrink: 0,
        minWidth: '32px',
        padding: '2px 0'
      }
    },
      /* Reply button (no edit/delete for other participants) */
      /*#__PURE__*/React.createElement("button", {
        type: "button",
        className: "msg-actions-group",
        onClick: () => handleStartReply(msg, msgImageCount),
        title: "답장",
        style: {
          width: '32px',
          height: '32px',
          minWidth: '32px',
          minHeight: '32px',
          boxSizing: 'border-box',
          border: 'none',
          background: 'none',
          padding: 0,
          cursor: 'pointer',
          color: 'var(--text-light)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-start'
        }
      }, /*#__PURE__*/React.createElement(ReplyIcon, { size: 15 })),
      /* Timestamp */
      /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: 'var(--font-size-xs)',
          color: 'var(--text-light)',
          lineHeight: '1.25',
          textAlign: 'left'
        }
      }, timeStr))]));
  });
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "chat-room-container",
    style: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: `${viewportBottom}px`,
      backgroundColor: 'var(--bg-primary)',
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      maxWidth: '100%',
      overflowX: 'hidden',
      zIndex: 1005,
      transition: 'bottom 0.12s ease-out'
    }
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onBack,
    "aria-label": "뒤로가기",
    style: {
      position: 'fixed',
      top: 'calc(10px + env(safe-area-inset-top, 0px))',
      left: '10px',
      width: '36px',
      height: '36px',
      borderRadius: '50%',
      backgroundColor: 'var(--bg-card)',
      border: 'none',
      boxShadow: isHeaderVisible ? 'none' : '0 2px 8px rgba(0,0,0,0.12)',
      transition: 'box-shadow 0.2s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      color: 'var(--text-muted)',
      zIndex: 1020
    }
  }, /*#__PURE__*/React.createElement(BackArrowIcon, { size: 22 })),
  !(isHeaderVisible || viewportBottom > 80 || isInputFocused || !!(chatInput && String(chatInput).trim()) || (chatImages && chatImages.length > 0) || !!chatReplyTarget) && /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "chat-keyboard-reopen-btn",
    onClick: () => {
      if (onRevealChatInput) onRevealChatInput();
      requestAnimationFrame(() => chatTextareaRef.current && chatTextareaRef.current.focus());
    },
    "aria-label": "채팅 입력창 열기",
    style: {
      position: 'fixed',
      left: '10px',
      bottom: `calc(${viewportBottom}px + 16px)`,
      width: '36px',
      height: '36px',
      borderRadius: '50%',
      backgroundColor: 'var(--bg-card)',
      border: '1px solid var(--border-subtle)',
      boxShadow: '0 2px 10px rgba(0,0,0,0.16)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      color: 'var(--text-muted)',
      zIndex: 1020
    }
  }, /*#__PURE__*/React.createElement("svg", {
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
    /*#__PURE__*/React.createElement("path", { d: "M2 6a2 2 0 0 1 2 -2h16a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-16a2 2 0 0 1 -2 -2z" }),
    /*#__PURE__*/React.createElement("path", { d: "M6 8h.01" }),
    /*#__PURE__*/React.createElement("path", { d: "M10 8h.01" }),
    /*#__PURE__*/React.createElement("path", { d: "M14 8h.01" }),
    /*#__PURE__*/React.createElement("path", { d: "M18 8h.01" }),
    /*#__PURE__*/React.createElement("path", { d: "M8 12h.01" }),
    /*#__PURE__*/React.createElement("path", { d: "M12 12h.01" }),
    /*#__PURE__*/React.createElement("path", { d: "M16 12h.01" }),
    /*#__PURE__*/React.createElement("path", { d: "M7 16h10" }))), noticePanelMode === 'floating' && /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setNoticePanelMode(pinnedNotices.length > 0 ? 'list' : 'add'),
    title: "공지",
    "aria-label": "공지 펼치기",
    style: {
      position: 'fixed',
      top: 'calc(10px + env(safe-area-inset-top, 0px))',
      right: '16px',
      width: '36px',
      height: '36px',
      borderRadius: '50%',
      backgroundColor: 'var(--bg-card)',
      border: 'none',
      boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      color: 'var(--text-muted)',
      zIndex: 1000
    }
  }, /*#__PURE__*/React.createElement(MegaphoneIcon, { size: 18 })), /*#__PURE__*/React.createElement("div", {
    className: "chat-room-header",
    style: {
      position: 'fixed',
      top: 'env(safe-area-inset-top, 0px)',
      left: 0,
      right: 0,
      height: '56px',
      backgroundColor: 'var(--bg-card)',
      borderBottom: '1px solid var(--border-subtle)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 16px',
      zIndex: 1010,
      transition: 'transform 0.3s ease',
      transform: isHeaderVisible ? 'translateY(0)' : 'translateY(-100%)'
    }
  }, /*#__PURE__*/React.createElement("div", { style: { width: '32px', flexShrink: 0 } }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: '50%',
      transform: 'translateX(-50%)',
      display: 'flex',
      alignItems: 'center',
      fontWeight: 800,
      fontSize: '0.95rem',
      color: 'var(--text-main)',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      maxWidth: 'calc(100vw - 160px)',
      pointerEvents: 'none'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: { overflow: 'hidden', textOverflow: 'ellipsis' }
  }, formatChatHeaderTitle(calendar?.title), " 채팅")), /*#__PURE__*/React.createElement("div", {
    style: { display: 'flex', alignItems: 'center', gap: '2px' }
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => { setIsSearchOpen(true); setSearchQuery(''); },
    title: "대화 검색",
    "aria-label": "대화 검색",
    style: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      padding: '6px',
      color: 'var(--text-muted)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 'var(--radius-md)'
    }
  }, /*#__PURE__*/React.createElement(HeaderSearchIcon, { size: 20 })), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setIsChatSideMenuOpen(true),
    title: "채팅 메뉴",
    "aria-label": "채팅 메뉴 열기",
    style: { background: 'none', border: 'none', cursor: 'pointer', padding: '6px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 'var(--radius-md)' }
  }, /*#__PURE__*/React.createElement(ThreeLinesIcon, { size: 22 })))), /*#__PURE__*/React.createElement("div", {
    style: { flex: 1, position: 'relative', minHeight: 0 }
  }, /*#__PURE__*/React.createElement("div", {
    ref: chatMessagesContainerRef,
    onScroll: handleScrollCombined,
    style: {
      position: 'absolute',
      inset: 0,
      overflowY: 'auto',
      padding: '16px',
      paddingTop: `calc(${isSearchOpen ? '124px' : '72px'} + env(safe-area-inset-top, 0px))`,
      // Static 152px alone only clears the composer at its rest position. Once the virtual
      // keyboard opens, the fixed .chat-composer rides up by viewportBottom px (see its own
      // `bottom: viewportBottom` below) -- without adding that same amount here, scrolling to
      // scrollHeight still leaves the newest bubble sitting right where the keyboard now covers
      // it, since the reserved bottom space never grew to match.
      paddingBottom: `${Math.max(152, composerHeight + 24) + viewportBottom}px`
    }
  }, (loadingOlderChat || hasMoreOlderChat) && /*#__PURE__*/React.createElement("div", {
    style: { textAlign: 'center', fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', padding: '8px 0 12px' }
  }, loadingOlderChat ? '이전 대화를 불러오는 중…' : (hasMoreOlderChat ? '위로 스크롤하면 이전 대화가 로드됩니다' : '')), noticePanelMode === 'add' && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'sticky', top: 0, zIndex: 6,
      display: 'flex', flexDirection: 'column', gap: '8px',
      backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)',
      padding: '10px 12px', marginBottom: '12px', boxShadow: 'var(--shadow-md)'
    }
  },
    /*#__PURE__*/React.createElement("textarea", {
      className: "form-input",
      style: { width: '100%', resize: 'none', minHeight: '60px' },
      value: noticeInput,
      maxLength: 200,
      autoFocus: true,
      placeholder: "채팅방 상단에 고정할 공지를 입력하세요",
      onChange: e => { setNoticeInput(e.target.value); autoGrowTextarea(e.target, 200); }
    }),
    /*#__PURE__*/React.createElement("div", { style: { display: 'flex', gap: '8px' } },
      /*#__PURE__*/React.createElement("button", {
        type: "button", className: "btn btn-secondary", style: { flex: 1 },
        onClick: () => setNoticePanelMode(pinnedNotices.length > 0 ? 'list' : 'closed')
      }, "취소"),
      /*#__PURE__*/React.createElement("button", {
        type: "button", className: "btn btn-secondary",
        style: { flex: 1, height: '44px', minHeight: '44px', backgroundColor: '#0F172A', borderColor: '#0F172A', color: '#FFFFFF', justifyContent: 'center' },
        onClick: () => {
          const trimmed = noticeInput.trim();
          if (!trimmed) { if (showToast) showToast('공지 내용을 입력해 주세요', 'error'); return; }
          onAddPinnedNotice && onAddPinnedNotice(trimmed, (participantsMap[chatParticipantId] || {}).name || '');
          setNoticeInput('');
          setNoticePanelMode('list');
        }
      }, "저장")
    )
  ), noticePanelMode === 'list' && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'sticky', top: 0, zIndex: 6,
      display: 'flex', flexDirection: 'column', gap: '8px',
      backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)',
      padding: '10px 12px', marginBottom: '12px', boxShadow: 'var(--shadow-md)'
    }
  },
    pinnedNotices.length === 0 ? /*#__PURE__*/React.createElement("div", {
      style: { fontSize: 'var(--font-size-md)', color: 'var(--text-muted)', textAlign: 'center', padding: '6px 0' }
    }, "등록된 공지가 없습니다.") : pinnedNotices.map(notice => /*#__PURE__*/React.createElement("div", {
      key: notice.id,
      style: {
        display: 'flex', alignItems: 'flex-start', gap: '8px',
        backgroundColor: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: 'var(--radius-md)',
        padding: '10px 12px', fontSize: 'var(--font-size-md)', color: '#92400E', lineHeight: '1.5'
      }
    },
      /*#__PURE__*/React.createElement("div", { style: { flex: 1, wordBreak: 'break-word' } }, renderTextWithUrlBadge(notice.text)),
      /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: () => onRemovePinnedNotice && onRemovePinnedNotice(notice.id),
        title: "공지 삭제",
        style: { background: 'none', border: 'none', cursor: 'pointer', color: '#92400E', flexShrink: 0, display: 'flex', alignItems: 'center' }
      }, /*#__PURE__*/React.createElement(TrashIcon, { size: 16 }))
    )),
    /*#__PURE__*/React.createElement("div", { style: { display: 'flex', gap: '8px' } },
      /*#__PURE__*/React.createElement("button", {
        type: "button",
        style: { flex: 1, border: '1px solid #0F172A', borderRadius: 'var(--radius-md)', padding: '10px', fontWeight: 800, cursor: 'pointer', backgroundColor: '#0F172A', color: '#FFFFFF' },
        onClick: () => { setNoticeInput(''); setNoticePanelMode('add'); }
      }, "공지 추가"),
      /*#__PURE__*/React.createElement("button", {
        type: "button", className: "btn btn-secondary", style: { flex: 1 },
        onClick: () => setNoticePanelMode('floating')
      }, "공지 접기")
    )
  ), noticePanelMode === 'closed' && pinnedNotices.length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'sticky', top: 0, zIndex: 5,
      display: 'flex', flexDirection: 'column', gap: '6px',
      marginBottom: '12px'
    }
  }, pinnedNotices.map(notice => /*#__PURE__*/React.createElement("div", {
    key: notice.id,
    style: {
      display: 'flex', alignItems: 'flex-start', gap: '8px',
      backgroundColor: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: 'var(--radius-md)',
      padding: '10px 12px', fontSize: 'var(--font-size-md)', color: '#92400E', lineHeight: '1.5'
    }
  },
    /*#__PURE__*/React.createElement("div", { style: { flex: 1, wordBreak: 'break-word' } },
      /*#__PURE__*/React.createElement("strong", null, "공지 "), renderTextWithUrlBadge(notice.text)
    )
  ))), /*#__PURE__*/React.createElement("div", { ref: messagesListInnerRef },
    renderedMessages.length === 0 ? /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: 'center',
        color: 'var(--text-light)',
        fontSize: 'var(--font-size-base)',
        marginTop: '40px'
      }
    }, "\uC544\uC9C1 \uB4F1\uB85D\uB41C \uB300\uD654\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4.") : renderedMessages
  )), showScrollToBottom && !hasNewMessageBelow && /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: scrollToBottom,
    "aria-label": "\uCD5C\uADFC \uB300\uD654\uB85C \uC774\uB3D9",
    style: {
      position: 'absolute',
      bottom: '16px',
      right: '16px',
      width: '36px',
      height: '36px',
      borderRadius: '50%',
      backgroundColor: 'var(--bg-card)',
      border: 'none',
      boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      color: 'var(--text-muted)',
      zIndex: 50
    }
  }, /*#__PURE__*/React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    width: "22",
    height: "22",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    "stroke-width": "2",
    "stroke-linecap": "round",
    "stroke-linejoin": "round"
  }, /*#__PURE__*/React.createElement("path", { stroke: "none", d: "M0 0h24v24H0z", fill: "none" }), /*#__PURE__*/React.createElement("path", { d: "M6 9l6 6l6 -6" }))), hasNewMessageBelow && /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: handleNewMessageBannerClick,
    "aria-label": "\uC0C8\uB85C\uC6B4 \uBA54\uC2DC\uC9C0\uB85C \uC774\uB3D9",
    style: {
      position: 'absolute',
      bottom: '16px',
      left: '50%',
      transform: 'translateX(-50%)',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      padding: '8px 16px',
      borderRadius: 'var(--radius-full)',
      backgroundColor: '#4F46E5',
      color: '#FFFFFF',
      border: 'none',
      boxShadow: '0 4px 12px rgba(79,70,229,0.35)',
      cursor: 'pointer',
      fontSize: 'var(--font-size-md)',
      fontWeight: 700,
      whiteSpace: 'nowrap',
      zIndex: 51
    }
  }, "\uC0C8\uB85C\uC6B4 \uBA54\uC2DC\uC9C0", /*#__PURE__*/React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    width: "16",
    height: "16",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    "stroke-width": "2.5",
    "stroke-linecap": "round",
    "stroke-linejoin": "round"
  }, /*#__PURE__*/React.createElement("path", { d: "M6 9l6 6l6 -6" })))), /*#__PURE__*/React.createElement("div", {
    className: "chat-composer",
    ref: chatComposerRef,
    style: {
      position: 'fixed',
      left: 0,
      right: 0,
      // Sit above emoji sheet when open (CSS var set by EmojiPickerSheet)
      bottom: `max(${viewportBottom}px, var(--emoji-sheet-h, 0px))`,
      backgroundColor: 'var(--bg-card)',
      borderTop: '1px solid var(--border-subtle)',
      padding: '12px 16px',
      zIndex: isEmojiPickerOpen ? 13050 : 1012,
      flexShrink: 0,
      transform: (isHeaderVisible || viewportBottom > 80 || isInputFocused || !!(chatInput && String(chatInput).trim()) || (chatImages && chatImages.length > 0) || !!chatReplyTarget) ? 'translateY(0)' : 'translateY(calc(100% + 12px))',
      opacity: (isHeaderVisible || viewportBottom > 80 || isInputFocused || !!(chatInput && String(chatInput).trim()) || (chatImages && chatImages.length > 0) || !!chatReplyTarget) ? 1 : 0,
      pointerEvents: (isHeaderVisible || viewportBottom > 80 || isInputFocused || !!(chatInput && String(chatInput).trim()) || (chatImages && chatImages.length > 0) || !!chatReplyTarget) ? 'auto' : 'none',
      transition: 'transform 0.28s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.18s ease, bottom 0.12s ease-out'
    }
  },
    /* Inner card wrapper (same border/radius as CommentsSection input card) */
    /*#__PURE__*/React.createElement("div", {
      style: {
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        padding: '12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        boxSizing: 'border-box',
        width: '100%'
      }
    },
      /* Reply preview: shown above the textarea while replying to a specific bubble. The
         snippet mirrors renderReplyQuoteCard's label so what you see here is exactly what
         lands on the sent message's own quote card. */
      chatReplyTarget && /*#__PURE__*/React.createElement("div", {
        style: {
          '--reply-accent': participantsMap[chatReplyTarget.participantId]?.color || '#94A3B8',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '8px',
          padding: '6px 8px',
          borderRadius: '8px',
          border: `1px solid ${participantsMap[chatReplyTarget.participantId]?.color || '#94A3B8'}`,
          borderLeft: `3px solid ${participantsMap[chatReplyTarget.participantId]?.color || '#94A3B8'}`,
          backgroundColor: 'rgba(148, 163, 184, 0.1)'
        }
      },
        /*#__PURE__*/React.createElement("div", {
          style: { display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0, flex: 1 }
        },
          /*#__PURE__*/React.createElement("span", {
            style: { fontSize: 'var(--font-size-sm)', fontWeight: 800, color: 'var(--reply-accent)' }
          }, `${participantsMap[chatReplyTarget.participantId]?.name || '알수없음'}님에게 답장`),
          /*#__PURE__*/React.createElement("span", {
            style: {
              fontSize: 'var(--font-size-md)',
              color: 'var(--text-main)',
              opacity: 0.75,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }
          }, replyQuoteLabel(chatReplyTarget))
        ),
        /*#__PURE__*/React.createElement("button", {
          type: "button",
          onClick: handleCancelReply,
          "aria-label": "답장 취소",
          style: {
            width: '32px',
            height: '32px',
            minWidth: '32px',
            minHeight: '32px',
            boxSizing: 'border-box',
            border: 'none',
            background: 'none',
            padding: 0,
            cursor: 'pointer',
            color: 'var(--text-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }
        }, /*#__PURE__*/React.createElement(SmallXIcon, { size: 16 }))
      ),
      /* Textarea at top */
      /*#__PURE__*/React.createElement("textarea", {
        ref: chatTextareaRef,
        placeholder: "메시지를 입력하세요...",
        value: chatInput,
        maxLength: 5000,
        onFocus: () => setIsInputFocused(true),
        onBlur: () => {
          setTimeout(() => {
            const a = document.activeElement;
            if (a && a.closest && a.closest('.chat-composer')) {
              setIsInputFocused(true);
              return;
            }
            if ((chatInput && String(chatInput).trim()) || (chatImages && chatImages.length > 0) || chatReplyTarget) {
              setIsInputFocused(true);
              return;
            }
            setIsInputFocused(false);
          }, 50);
        },
        onChange: e => { setChatInput(e.target.value); autoGrowTextarea(e.target, 100); },
        onPaste: handlePasteImagesChat,
        onKeyDown: e => {
          if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            triggerChatSend();
          }
        },
        style: {
          width: '100%',
          height: '44px',
          minHeight: '44px',
          maxHeight: '100px',
          resize: 'none',
          border: 'none',
          background: 'none',
          padding: '2px 4px',
          fontSize: 'var(--font-size-base)',
          lineHeight: '1.4',
          fontFamily: 'inherit',
          outline: 'none',
          boxSizing: 'border-box',
          overflowY: 'auto'
        }
      }),

      /* Attached Images Preview (between Textarea and Action Row) */
      chatImages.length > 0 ? /*#__PURE__*/React.createElement("div", {
        style: { display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '4px', alignSelf: 'flex-start' }
      }, chatImages.map((img, index) => /*#__PURE__*/React.createElement("div", {
        key: index,
        style: { position: 'relative', display: 'inline-block' }
      }, /*#__PURE__*/React.createElement("img", {
        src: img.thumbnail,
        alt: `첨부 미리보기 ${index + 1}`,
        decoding: 'async',
        style: {
          width: '60px',
          height: '60px',
          objectFit: 'cover',
          borderRadius: 'var(--radius-md)',
          display: 'block'
        }
      }), /*#__PURE__*/React.createElement(ImageThumbRemoveButton, {
        onClick: () => setChatImages(prev => prev.filter((_, idx) => idx !== index))
      })))) : null,

      /* Hidden File Input */
      /*#__PURE__*/React.createElement("input", {
        ref: fileInputRefChat,
        type: "file",
        accept: "image/jpeg, image/png, image/gif, image/webp, image/heic, image/heif, image/*",
        multiple: true,
        style: { position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0,0,0,0)', border: 0 },
        onChange: handleFileChangeChat
      }),

      /* Action Row (Select box, Camera, Send) at bottom */
      /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          borderTop: '1px solid var(--border-subtle)',
          paddingTop: '8px',
          marginTop: '2px'
        }
      },
        /* Left side: Participant select capsule button (shared component -- see ui-widgets.js) */
        /*#__PURE__*/React.createElement(ParticipantPickerButton, {
          participant: selectedParticipant,
          placeholder: "선택",
          onClick: () => setIsChatSheetOpen(true)
        }),

        /* Right side: Camera button & Send button */
        /*#__PURE__*/React.createElement("div", {
          style: { display: 'flex', alignItems: 'center', gap: '8px' }
        },
          /* Emoji Button */
          /*#__PURE__*/React.createElement("button", {
            type: "button",
            onClick: () => setIsEmojiPickerOpen(true),
            title: "이모티콘",
            style: {
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              border: '1px solid var(--border-subtle)',
              backgroundColor: 'var(--bg-card)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              padding: 0,
              color: 'var(--text-muted)'
            }
          }, /*#__PURE__*/React.createElement(EmojiPickerIcon, null)),
          /* Camera/Image Button */
          /*#__PURE__*/React.createElement("button", {
            type: "button",
            onClick: () => fileInputRefChat.current && fileInputRefChat.current.click(),
            title: "사진 첨부",
            style: {
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              border: '1px solid var(--border-subtle)',
              backgroundColor: 'var(--bg-card)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              padding: 0,
              color: 'var(--text-muted)'
            }
          }, /*#__PURE__*/React.createElement("svg", {
            xmlns: "http://www.w3.org/2000/svg",
            width: "18",
            height: "18",
            viewBox: "0 0 24 24",
            fill: "none",
            stroke: "currentColor",
            strokeWidth: "2",
            strokeLinecap: "round",
            strokeLinejoin: "round"
          },
            /*#__PURE__*/React.createElement("path", { stroke: "none", d: "M0 0h24v24H0z", fill: "none" }),
            /*#__PURE__*/React.createElement("path", { d: "M15 8h.01" }),
            /*#__PURE__*/React.createElement("path", { d: "M12.5 21h-6.5a3 3 0 0 1 -3 -3v-12a3 3 0 0 1 3 -3h12a3 3 0 0 1 3 3v6.5" }),
            /*#__PURE__*/React.createElement("path", { d: "M3 16l5 -5c.928 -.893 2.072 -.893 3 0l4 4" }),
            /*#__PURE__*/React.createElement("path", { d: "M14 14l1 -1c.67 -.644 1.45 -.824 2.182 -.54" }),
            /*#__PURE__*/React.createElement("path", { d: "M16 19h6" }),
            /*#__PURE__*/React.createElement("path", { d: "M19 16v6" })
          )),

          /* Send Button */
          /*#__PURE__*/React.createElement("button", {
            type: "button",
            disabled: isChatSubmitting || (!chatInput.trim() && chatImages.length === 0),
            onPointerDown: handleSendPointerDown,
            onClick: handleSendClick,
            style: {
              height: '32px',
              padding: '0 16px',
              fontSize: 'var(--font-size-md)',
              fontWeight: 'bold',
              backgroundColor: '#57606F',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '16px',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              opacity: (chatInput.trim() || chatImages.length > 0) && !isChatSubmitting ? 1 : 0.6
            }
          }, isChatSubmitting ? '...' : '전송')
        )
      )
    )),
  activeLightbox ? /*#__PURE__*/React.createElement(Lightbox, {
    urls: activeLightbox.urls,
    index: activeLightbox.index,
    meta: activeLightbox.meta,
    onClose: () => setActiveLightbox(null),
    onNavigate: i => setActiveLightbox(prev => prev ? { ...prev, index: i } : prev),
    showToast,
    onPromoteImageUrl,
    onSaveImageTags,
    onSearchTag,
    onDeletePhoto,
    onReplacePhoto,
    onJumpToChatMessage,
    onJumpToMemo,
    onJumpToMeetingDate,
    onGetChatMessageOrdinal,
    onGetGalleryPhotoOrdinal,
    onRequestConfirm
  }) : null), imageProcessingChat && /*#__PURE__*/React.createElement(ImageProcessingOverlay, imageProcessingChat),
  isEmojiPickerOpen && /*#__PURE__*/React.createElement(EmojiPickerSheet, {
    onSelect: insertEmojiIntoChatInput,
    onClose: () => setIsEmojiPickerOpen(false)
  }),
  isChatSideMenuOpen && /*#__PURE__*/React.createElement(ChatSideMenu, {
    weatherLocation: calendar && calendar.weatherLocation,
    onClose: () => setIsChatSideMenuOpen(false),
    onOpenSearch: () => { setIsSearchOpen(true); setSearchQuery(''); },
    onOpenNoticeSettings: () => {
      if (pinnedNotices.length > 0) { setNoticePanelMode('list'); } else { setNoticeInput(''); setNoticePanelMode('add'); }
    },
    onOpenGallery: () => setIsChatGalleryOpen(true),
    onOpenShare: onShare,
    isDarkTheme: isDarkTheme,
    onChangeView: onChangeView,
    onToggleTheme: onToggleTheme,
    fontScalePercent: fontScalePercent,
    onDecreaseFont: onDecreaseFont,
    onIncreaseFont: onIncreaseFont,
    isChatNotifyEnabled: isChatNotifyEnabled,
    onToggleChatNotifications: onToggleChatNotifications,
    onOpenAppSettings: onOpenAppSettings,
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
  isChatGalleryOpen && /*#__PURE__*/React.createElement(ChatGalleryModal, {
    chatMessages: chatMessages,
    onClose: () => setIsChatGalleryOpen(false),
    setActiveLightbox: setActiveLightbox,
    onDeletePhoto: onDeletePhoto,
    hasMoreOlderChat: hasMoreOlderChat,
    loadingOlderChat: loadingOlderChat,
    onLoadOlderChat: onLoadOlderChat,
    totalGalleryCount: 0
  }),
  isSearchOpen && /*#__PURE__*/React.createElement(InlineSearchBar, {
    fixed: true,
    value: searchQuery,
    placeholder: "검색할 메시지를 입력하세요...",
    onChange: e => { setSearchQuery(e.target.value); setSearchFocusIndex(Number.MAX_SAFE_INTEGER); },
    trailing: /*#__PURE__*/React.createElement(React.Fragment, null,
      searchQuery && /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', flexShrink: 0,
          minWidth: '36px', textAlign: 'center', fontVariantNumeric: 'tabular-nums'
        }
      }, searchMatchIds.length > 0 ? `${clampedFocusIdx + 1}/${searchMatchIds.length}` : '0/0'),
      /*#__PURE__*/React.createElement("button", {
        type: "button", disabled: searchMatchIds.length === 0,
        onClick: () => setSearchFocusIndex(i => {
          const currentIdx = i >= searchMatchIds.length ? searchMatchIds.length - 1 : i;
          const next = currentIdx - 1;
          return next < 0 ? searchMatchIds.length - 1 : next;
        }),
        title: "이전 결과",
        style: {
          border: 'none', background: 'none',
          cursor: searchMatchIds.length > 0 ? 'pointer' : 'default',
          color: searchMatchIds.length > 0 ? 'var(--text-main)' : 'var(--text-muted)',
          padding: '4px', display: 'flex', alignItems: 'center', flexShrink: 0,
          opacity: searchMatchIds.length > 0 ? 1 : 0.4
        }
      }, /*#__PURE__*/React.createElement("svg", {
        xmlns: "http://www.w3.org/2000/svg", width: "18", height: "18",
        viewBox: "0 0 24 24", fill: "none", stroke: "currentColor",
        strokeWidth: "2.5", strokeLinecap: "round", strokeLinejoin: "round"
      }, /*#__PURE__*/React.createElement("path", { d: "m18 15-6-6-6 6" }))),
      /*#__PURE__*/React.createElement("button", {
        type: "button", disabled: searchMatchIds.length === 0,
        onClick: () => setSearchFocusIndex(i => {
          const currentIdx = i >= searchMatchIds.length ? searchMatchIds.length - 1 : i;
          const next = currentIdx + 1;
          return next >= searchMatchIds.length ? 0 : next;
        }),
        title: "다음 결과",
        style: {
          border: 'none', background: 'none',
          cursor: searchMatchIds.length > 0 ? 'pointer' : 'default',
          color: searchMatchIds.length > 0 ? 'var(--text-main)' : 'var(--text-muted)',
          padding: '4px', display: 'flex', alignItems: 'center', flexShrink: 0,
          opacity: searchMatchIds.length > 0 ? 1 : 0.4
        }
      }, /*#__PURE__*/React.createElement("svg", {
        xmlns: "http://www.w3.org/2000/svg", width: "18", height: "18",
        viewBox: "0 0 24 24", fill: "none", stroke: "currentColor",
        strokeWidth: "2.5", strokeLinecap: "round", strokeLinejoin: "round"
      }, /*#__PURE__*/React.createElement("path", { d: "m6 9 6 6 6-6" }))),
      /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: () => { setIsSearchOpen(false); setSearchQuery(''); setSearchFocusIndex(0); },
        style: {
          border: 'none', background: 'none', cursor: 'pointer',
          color: 'var(--text-muted)', padding: '4px 6px', fontSize: 'var(--font-size-md)',
          fontWeight: 700, flexShrink: 0
        }
      }, "닫기")
    )
  }));
}

  if (typeof window !== 'undefined') {
  window.GATHER_UI_COMPONENTS = Object.assign({}, window.GATHER_UI_COMPONENTS || {}, {
    ChatRoomView: ChatRoomView,
  });
}
