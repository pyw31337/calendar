/**
 * Shared UI primitives (P4-22)
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


export function ResizableModalContainer({ className, style, children, ...props }) {
  const React = window.React;
  const __deps = window.GATHER_UI_DEPS || {};
  const __comp = window.GATHER_UI_COMPONENTS || {};

  const containerRef = React.useRef(null);
  const [dimensions, setDimensions] = React.useState(null); // { width, height }
  const isDraggingRef = React.useRef(false);
  const startPosRef = React.useRef({ x: 0, y: 0 });
  const startDimRef = React.useRef({ w: 0, h: 0 });

  const handleMouseDown = e => {
    if (e.button !== 0) return; // Only left-click
    isDraggingRef.current = true;
    startPosRef.current = { x: e.clientX, y: e.clientY };
    const rect = containerRef.current.getBoundingClientRect();
    startDimRef.current = { w: rect.width, h: rect.height };
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleTouchStart = e => {
    isDraggingRef.current = true;
    startPosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    const rect = containerRef.current.getBoundingClientRect();
    startDimRef.current = { w: rect.width, h: rect.height };
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);
  };

  const handleMouseMove = e => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - startPosRef.current.x;
    const deltaY = e.clientY - startPosRef.current.y;
    setDimensions({
      width: Math.max(280, startDimRef.current.w + deltaX),
      height: Math.max(150, startDimRef.current.h + deltaY)
    });
  };

  const handleTouchMove = e => {
    if (!isDraggingRef.current) return;
    if (e.cancelable) e.preventDefault();
    const deltaX = e.touches[0].clientX - startPosRef.current.x;
    const deltaY = e.touches[0].clientY - startPosRef.current.y;
    setDimensions({
      width: Math.max(280, startDimRef.current.w + deltaX),
      height: Math.max(150, startDimRef.current.h + deltaY)
    });
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    const blockClick = ev => {
      ev.preventDefault();
      ev.stopPropagation();
      document.removeEventListener('click', blockClick, true);
    };
    document.addEventListener('click', blockClick, true);
    setTimeout(() => document.removeEventListener('click', blockClick, true), 0);
  };

  const handleTouchEnd = () => {
    isDraggingRef.current = false;
    document.removeEventListener('touchmove', handleTouchMove);
    document.removeEventListener('touchend', handleTouchEnd);
    const blockClick = ev => {
      ev.preventDefault();
      ev.stopPropagation();
      document.removeEventListener('click', blockClick, true);
    };
    document.addEventListener('click', blockClick, true);
    setTimeout(() => document.removeEventListener('click', blockClick, true), 0);
  };

  React.useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  // Fit modal to currently visible viewport (address bar / toolbars on or off).
  React.useEffect(() => {
    if (dimensions) return undefined;
    const root = document.documentElement;
    const apply = () => {
      const vv = window.visualViewport;
      const vvH = vv && typeof vv.height === 'number' ? vv.height : window.innerHeight;
      const isAdminSettings = containerRef.current && containerRef.current.classList.contains('admin-settings-modal');
      const isMemoEdit = containerRef.current && containerRef.current.classList.contains('memo-edit-modal-container');
      const reserved = window.matchMedia && window.matchMedia('(max-width: 640px)').matches ? 20 : 32;
      const maxPx = Math.max(180, Math.floor(isAdminSettings
        ? Math.min(720, vvH - reserved)
        : isMemoEdit
          ? Math.min(780, vvH - reserved)
        : Math.min(860, vvH - reserved)));
      root.style.setProperty('--gather-vv-modal-max', `${maxPx}px`);
      if (containerRef.current) {
        containerRef.current.style.maxHeight = `${maxPx}px`;
      }
    };
    apply();
    const vv = window.visualViewport;
    if (vv) {
      vv.addEventListener('resize', apply);
      vv.addEventListener('scroll', apply);
    }
    window.addEventListener('resize', apply);
    return () => {
      if (vv) {
        vv.removeEventListener('resize', apply);
        vv.removeEventListener('scroll', apply);
      }
      window.removeEventListener('resize', apply);
    };
  }, [dimensions]);

  const mergedStyle = {
    ...style,
    position: 'relative',
    ...(dimensions ? { width: `${dimensions.width}px`, height: `${dimensions.height}px`, maxWidth: 'none', maxHeight: 'none' } : {})
  };

  return /*#__PURE__*/React.createElement("div", {
    ref: containerRef,
    className: className || "modal-container",
    style: mergedStyle,
    ...props
  },
    children,
    /* Resize handle at bottom right */
    /*#__PURE__*/React.createElement("div", {
      onMouseDown: e => { e.preventDefault(); e.stopPropagation(); handleMouseDown(e); },
      onTouchStart: e => { e.stopPropagation(); handleTouchStart(e); },
      onClick: e => { e.preventDefault(); e.stopPropagation(); },
      style: {
        position: 'absolute',
        right: '4px',
        bottom: '4px',
        width: '18px',
        height: '18px',
        cursor: 'se-resize',
        color: 'var(--text-muted)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        userSelect: 'none',
        touchAction: 'none'
      }
    },
      /*#__PURE__*/React.createElement("svg", {
        xmlns: "http://www.w3.org/2000/svg",
        width: "1em",
        height: "1em",
        viewBox: "0 0 16 16",
        style: { pointerEvents: 'none' }
      },
        /*#__PURE__*/React.createElement("path", { d: "M0 0h16v16H0z", fill: "none" }),
        /*#__PURE__*/React.createElement("path", { fill: "currentColor", fillRule: "evenodd", d: "M14.776 4.284a.75.75 0 0 0-1.06-1.06L3.22 13.72a.75.75 0 1 0 1.06 1.06zm0 5a.75.75 0 0 0-1.06-1.06L8.22 13.72a.75.75 0 1 0 1.06 1.06z", clipRule: "evenodd" })
      )
    )
  );
}

export function AutoGrowTextarea({
  maxHeight = 480,
  value,
  onChange,
  style = null,
  className = 'form-input',
  minHeight = 44,
  textareaRef = null,
  ...rest
}) {
  const React = window.React;
  const __deps = window.GATHER_UI_DEPS || {};
  const __comp = window.GATHER_UI_COMPONENTS || {};
  const autoGrowTextarea = __deps.autoGrowTextarea;

  const innerRef = React.useRef(null);
  const setRefs = React.useCallback(el => {
    innerRef.current = el;
    if (typeof textareaRef === 'function') textareaRef(el);
    else if (textareaRef && typeof textareaRef === 'object') textareaRef.current = el;
  }, [textareaRef]);
  React.useLayoutEffect(() => {
    autoGrowTextarea(innerRef.current, maxHeight);
  }, [value, maxHeight]);
  return /*#__PURE__*/React.createElement("textarea", Object.assign({
    ref: setRefs,
    className: className,
    value: value,
    onChange: e => {
      if (typeof onChange === 'function') onChange(e);
      autoGrowTextarea(e.target, maxHeight);
    },
    onInput: e => autoGrowTextarea(e.target, maxHeight),
    style: Object.assign({
      resize: 'none',
      overflow: 'hidden',
      boxSizing: 'border-box',
      width: '100%',
      minHeight: typeof minHeight === 'number' ? `${minHeight}px` : minHeight,
      fontFamily: 'inherit',
      lineHeight: 1.45,
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-word',
      overflowWrap: 'anywhere'
    }, style || {})
  }, rest));
}

export function FormAddEditActionButtons({ isEditing, isSaving, onCancel, onSubmit, disabled = false, savingLabel = '저장 중...', alignSelf = null, flexGrow = false }) {
  const React = window.React;
  const __deps = window.GATHER_UI_DEPS || {};
  const __comp = window.GATHER_UI_COMPONENTS || {};

  const base = {
    flexShrink: flexGrow ? 1 : 0,
    height: '44px',
    minHeight: '44px',
    whiteSpace: 'nowrap',
    justifyContent: 'center'
  };
  if (flexGrow) base.flex = 1;
  if (alignSelf) base.alignSelf = alignSelf;
  const primaryStyle = isEditing
    ? { ...base, backgroundColor: '#0F172A', borderColor: '#0F172A', color: '#FFFFFF' }
    : base;
  return /*#__PURE__*/React.createElement(React.Fragment, null,
    isEditing && /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "btn btn-secondary",
      style: base,
      disabled: !!isSaving,
      onClick: e => {
        if (e) { e.preventDefault(); e.stopPropagation(); }
        if (typeof onCancel === 'function') onCancel(e);
      }
    }, "취소"),
    /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "btn btn-secondary",
      style: primaryStyle,
      disabled: !!isSaving || !!disabled,
      onClick: e => {
        if (e) { e.preventDefault(); e.stopPropagation(); }
        if (typeof onSubmit === 'function') onSubmit(e);
      }
    }, isSaving ? savingLabel : (isEditing ? '수정' : '추가'))
  );
}

export function UnderlineTabs({ options = [], value, onChange, ariaLabel, className = '', style = null, activeColor = '#7C3AED', variant = null }) {
  const React = window.React;
  const list = Array.isArray(options) ? options : [];
  // 'flush' sits edge-to-edge on the modal/page width with equal flex children and no extra
  // horizontal padding so the active 2px underline can land on the container's bottom hairline
  // (marginBottom: -1px below). Callers that nest tabs inside a padded header should move the
  // padding onto the title row (or pass negative horizontal margins) so the bar stays full-bleed.
  const isFlush = variant === 'flush';
  return /*#__PURE__*/React.createElement('div', {
    className: `underline-tabs${isFlush ? ' underline-tabs--flush' : ''}${className ? ' ' + className : ''}`,
    role: 'tablist',
    'aria-label': ariaLabel || undefined,
    style: {
      display: 'flex',
      width: '100%',
      borderBottom: '1px solid var(--border-subtle)',
      backgroundColor: 'var(--bg-card)',
      flexShrink: 0,
      boxSizing: 'border-box',
      paddingLeft: isFlush ? 0 : undefined,
      paddingRight: isFlush ? 0 : undefined,
      ...(style || {})
    }
  }, list.map(opt => {
    const id = opt.value;
    const isActive = value === id;
    const label = typeof opt.label === 'function' ? opt.label(isActive) : opt.label;
    const badge = opt.badge;
    return /*#__PURE__*/React.createElement('button', {
      key: String(id),
      type: 'button',
      role: 'tab',
      'aria-selected': isActive,
      onClick: () => { if (typeof onChange === 'function') onChange(id); },
      style: {
        flex: 1,
        padding: isFlush ? '12px 0' : '12px 0',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        fontSize: 'var(--font-size-md)',
        fontWeight: 800,
        color: isActive ? activeColor : 'var(--text-muted)',
        borderBottom: isActive ? `2px solid ${activeColor}` : '2px solid transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
        marginBottom: '-1px',
        minWidth: 0
      }
    },
      label,
      badge != null && badge !== '' ? /*#__PURE__*/React.createElement('span', {
        style: {
          fontSize: 'var(--font-size-xs)',
          fontWeight: 800,
          padding: '1px 7px',
          borderRadius: 'var(--radius-full)',
          backgroundColor: isActive ? 'rgba(124, 58, 237, 0.12)' : 'var(--border-subtle)',
          color: isActive ? activeColor : 'var(--text-muted)',
          minWidth: '18px',
          textAlign: 'center'
        }
      }, String(badge)) : null
    );
  }));
}

export function SegmentedToggle({ options, value, onChange, disabled, style, ariaLabel }) {
  const React = window.React;
  const __deps = window.GATHER_UI_DEPS || {};
  const __comp = window.GATHER_UI_COMPONENTS || {};

  const safeOptions = Array.isArray(options) ? options : [];
  return /*#__PURE__*/React.createElement("div", {
    role: "tablist",
    "aria-label": ariaLabel,
    style: {
      display: 'flex', alignItems: 'stretch', padding: '3px', boxSizing: 'border-box',
      border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', flexShrink: 0,
      ...style
    }
  }, safeOptions.flatMap((opt, i) => [
    i > 0 ? /*#__PURE__*/React.createElement("span", {
      key: `div-${opt.value}`, "aria-hidden": "true",
      style: { width: '1px', margin: '6px 2px', backgroundColor: 'var(--border-subtle)' }
    }) : null,
    /*#__PURE__*/React.createElement("button", {
      key: opt.value,
      type: "button", role: "tab", "aria-selected": value === opt.value,
      disabled,
      onClick: () => onChange(opt.value),
      style: {
        flex: 1, minWidth: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
        padding: '12px 16px', border: 'none', cursor: disabled ? 'default' : 'pointer', borderRadius: 'var(--radius-sm)',
        fontSize: 'var(--font-size-md)', fontWeight: value === opt.value ? 900 : 500, whiteSpace: 'nowrap',
        backgroundColor: value === opt.value ? (opt.activeColor || 'var(--accent-primary)') : 'transparent',
        color: value === opt.value ? '#FFFFFF' : 'var(--text-muted)'
      }
    }, opt.label)
  ]).filter(Boolean));
}

export function ItemEditDeleteActions({ onEdit, onDelete, editTitle = '수정', deleteTitle = '삭제', showEdit = true, showDelete = true }) {
  const React = window.React;
  const __deps = window.GATHER_UI_DEPS || {};
  const __comp = window.GATHER_UI_COMPONENTS || {};
  const PencilIcon = __comp.PencilIcon || __deps.PencilIcon;
  const TrashIcon = __comp.TrashIcon || __deps.TrashIcon;

  return /*#__PURE__*/React.createElement("div", {
    className: "item-edit-delete-actions",
    style: { display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }
  },
    showEdit && typeof onEdit === 'function' && /*#__PURE__*/React.createElement("button", {
      type: "button",
      onClick: e => { e.preventDefault(); e.stopPropagation(); onEdit(e); },
      title: editTitle, "aria-label": editTitle,
      style: {
        width: '22px', height: '22px', border: '1px solid var(--border-subtle)',
        backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-sm)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', padding: 0, color: 'var(--text-muted)'
      }
    }, /*#__PURE__*/React.createElement(PencilIcon, { size: 12 })),
    showDelete && typeof onDelete === 'function' && /*#__PURE__*/React.createElement("button", {
      type: "button",
      onClick: e => { e.preventDefault(); e.stopPropagation(); onDelete(e); },
      title: deleteTitle, "aria-label": deleteTitle,
      style: {
        width: '22px', height: '22px', border: 'none', background: 'none',
        padding: 0, cursor: 'pointer', color: 'var(--text-muted)',
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }
    }, /*#__PURE__*/React.createElement(TrashIcon, { size: 14 }))
  );
}

export function GamifiedConfirmButtonContent({ label }) {
  const React = window.React;
  const __deps = window.GATHER_UI_DEPS || {};
  const __comp = window.GATHER_UI_COMPONENTS || {};

  const bolt = /*#__PURE__*/React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", width: "100%", height: "100%",
    fill: "currentColor", "aria-hidden": true
  }, /*#__PURE__*/React.createElement("path", { d: "M13 2 3 14h8l-1 8 10-12h-8l1-8z" }));
  const star = /*#__PURE__*/React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", width: "100%", height: "100%",
    fill: "currentColor", "aria-hidden": true
  }, /*#__PURE__*/React.createElement("path", { d: "M12 2l2.4 7.2H22l-6 4.8 2.3 7.2L12 16.8 5.7 21.2 8 14 2 9.2h7.6z" }));
  return /*#__PURE__*/React.createElement(React.Fragment, null,
    /*#__PURE__*/React.createElement("span", { className: "gamified-shiny-glow-wrapper", "aria-hidden": true },
      /*#__PURE__*/React.createElement("span", { className: "gamified-shiny-glow" })
    ),
    /*#__PURE__*/React.createElement("span", {
      className: "gamified-border-electric",
      "aria-hidden": true
    }),
    /*#__PURE__*/React.createElement("span", {
      className: "gamified-border-electric gamified-border-electric-secondary",
      "aria-hidden": true
    }),
    /*#__PURE__*/React.createElement("span", { className: "gamified-sparks-container", "aria-hidden": true },
      [1,2,3,4,5,6].map(n => /*#__PURE__*/React.createElement("span", {
        key: "sp"+n, className: "gamified-spark gamified-spark-" + n
      }, bolt)),
      [1,2,3,4,5,6].map(n => /*#__PURE__*/React.createElement("span", {
        key: "sl"+n, className: "gamified-sparklet gamified-sparklet-" + n
      }, star))
    ),
    /*#__PURE__*/React.createElement("span", { className: "gamified-confirm-label" }, label)
  );
}

export function LinkPreviewCard({ url, fallbackTitle, cachedData, stretch = false, stretchWidth = null, noBorder = false, onStatusChange = null, marginTop = null }) {
  const React = window.React;
  const __deps = window.GATHER_UI_DEPS || {};
  const __comp = window.GATHER_UI_COMPONENTS || {};

  const preview = useLinkPreview(url, cachedData);
  const hasPreviewData = !!(preview && preview.status === 'success' && preview.data);

  // Notify parents (e.g. DirectChatMediaText) when preview settles so they can hide the raw URL
  // from bubble text once a card is successfully showing -- while loading/failed the URL stays
  // visible/clickable. Fire on every preview.status change, including the cachedData success
  // path that useLinkPreview returns synchronously on mount. Keep the callback in a ref so a
  // fresh inline onStatusChange from the parent doesn't re-fire this effect every render.
  const onStatusChangeRef = React.useRef(onStatusChange);
  onStatusChangeRef.current = onStatusChange;
  React.useEffect(() => {
    const cb = onStatusChangeRef.current;
    if (typeof cb !== 'function') return;
    if (preview && preview.status) {
      cb(preview.status);
    } else if (cachedData) {
      cb('success');
    }
  }, [preview, cachedData]);

  if (!hasPreviewData && !fallbackTitle) return null;

  const { title, description, image, siteName } = (hasPreviewData ? preview.data : {}) || {};
  let host = '';
  try {
    host = new URL(url).hostname.replace(/^www\./i, '');
  } catch (_) {}

  // Cached OpenGraph data is user/content supplied and older records may contain a malformed
  // image value. Do not let it become an invalid <img src>, which produces noisy browser errors
  // and can break page smoke checks. Valid network/data URLs still use the normal thumbnail.
  const imageSrc = (() => {
    const candidate = typeof image === 'string' ? image.trim() : '';
    const validator = GATHER_APP_UTILS.isRenderableImageUrl;
    if (typeof validator === 'function' && validator(candidate)) return candidate;
    // A missing preview used to trigger Google's favicon proxy as a decorative fallback.
    // That endpoint can redirect to a 404 (notably in WebKit) and turns an otherwise valid text
    // card into a console/network failure. Keep the deterministic text-only card instead.
    return '';
  })();
  const isGenericTitle = !title || title === 'map.naver.com' || title === 'naver.me' || title.startsWith('map.naver');
  const displayTitle = (isGenericTitle && fallbackTitle) ? fallbackTitle : (title || fallbackTitle || siteName || host);
  const displayHost = (siteName && siteName !== displayTitle) ? siteName : host;

  if (!displayTitle && !description) return null;

  return /*#__PURE__*/React.createElement('a', {
    href: url,
    target: '_blank',
    rel: 'noopener noreferrer',
    onClick: e => e.stopPropagation(),
    'data-no-press-feedback': true,
    className: 'link-preview-card',
    style: {
      display: 'flex',
      alignItems: 'flex-start',
      width: stretchWidth || (stretch ? '100%' : 'fit-content'),
      // min(100%, 280px), not a plain 280px: the bubble this card sits in is fit-content-sized
      // and can end up narrower than 280px (long participant badge, narrow phone, reply context),
      // and overflow below is 'hidden' now specifically so a too-wide title/description gets
      // truncated INSIDE whichever of the two is actually smaller instead of visually spilling
      // out past the card's own right edge.
      maxWidth: stretchWidth || (stretch ? '100%' : 'min(100%, 280px)'),
      boxSizing: 'border-box',
      gap: '10px',
      marginTop: marginTop != null ? (typeof marginTop === 'number' ? `${marginTop}px` : marginTop) : (stretch ? '0px' : '6px'),
      border: noBorder ? 'none' : '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-md)',
      // Was 'visible' -- with a nowrap+ellipsis title inside a flex child, 'visible' let the
      // untruncated text render past this box's own edge (and the bubble's) instead of actually
      // being clipped/ellipsized at it. 'hidden' is what makes the title/description's own
      // overflow:hidden + text-overflow:ellipsis further down actually take effect.
      overflow: 'hidden',
      textDecoration: 'none',
      color: 'inherit',
      backgroundColor: 'var(--bg-card)'
    }
  },
      imageSrc && /*#__PURE__*/React.createElement('img', {
      src: imageSrc,
      alt: '',
      loading: 'lazy',
      decoding: 'async',
      referrerPolicy: 'no-referrer',
      style: {
        width: '72px',
        height: '72px',
        objectFit: 'cover',
        flexShrink: 0,
        backgroundColor: 'var(--bg-primary)',
        borderRadius: 'calc(var(--radius-md) - 1px) 0 0 calc(var(--radius-md) - 1px)'
      }
    }),
    /*#__PURE__*/React.createElement('div', {
      style: {
        padding: imageSrc ? '8px 10px 8px 0' : '8px 10px',
        minWidth: 0,
        maxWidth: stretch ? 'none' : (imageSrc ? '198px' : '270px'),
        flex: stretch ? '1 1 0' : '0 1 auto',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignSelf: 'stretch',
        gap: '4px',
        minHeight: imageSrc ? '72px' : 'auto'
      }
    },
      displayTitle && /*#__PURE__*/React.createElement('div', {
        style: {
          fontSize: 'var(--font-size-md)',
          fontWeight: 700,
          lineHeight: 1.25,
          color: 'var(--text-main)',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }
      }, displayTitle),
      description && /*#__PURE__*/React.createElement('div', {
        style: {
          fontSize: 'var(--font-size-sm)',
          lineHeight: 1.3,
          color: 'var(--text-muted)',
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical'
        }
      }, description),
      displayHost && /*#__PURE__*/React.createElement('div', {
        style: {
          fontSize: 'var(--font-size-2xs)',
          lineHeight: 1.2,
          color: 'var(--text-light)'
        }
      }, displayHost)
    )
  );
}

export function LinkPreviewProgressOverlay({ progress, remainingSec }) {
  const React = window.React;
  const __deps = window.GATHER_UI_DEPS || {};
  const __comp = window.GATHER_UI_COMPONENTS || {};

  return ReactDOM.createPortal(
    /*#__PURE__*/React.createElement("div", {
      className: "modal-overlay",
      style: { zIndex: 12000, display: 'flex', alignItems: 'center', justifyContent: 'center' }
    },
      /*#__PURE__*/React.createElement("div", {
        className: "modal-container",
        style: { width: '100%', maxWidth: '360px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }
      },
        /*#__PURE__*/React.createElement("h3", { style: { fontSize: '1rem', fontWeight: 800, textAlign: 'center', margin: 0, color: 'var(--text-main)' } }, "링크 미리보기 가져오는 중"),
        /*#__PURE__*/React.createElement("div", { style: { fontSize: 'var(--font-size-md)', color: 'var(--text-muted)', textAlign: 'center' } }, "웹페이지 정보를 분석하고 있습니다."),
        /*#__PURE__*/React.createElement("div", {
          style: { display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-size-sm)', fontWeight: 700 }
        },
          /*#__PURE__*/React.createElement("span", { style: { color: 'var(--text-muted)' } }, "진행 상태"),
          /*#__PURE__*/React.createElement("span", { style: { color: 'var(--accent-primary)' } }, `${progress}% (약 ${remainingSec}초 남음)`)
        ),
        /*#__PURE__*/React.createElement("div", {
          style: { width: '100%', height: '8px', backgroundColor: 'var(--border-subtle)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }
        },
          /*#__PURE__*/React.createElement("div", {
            style: {
              width: `${progress}%`,
              height: '100%',
              backgroundColor: 'var(--accent-primary)',
              borderRadius: 'var(--radius-full)',
              transition: 'width 0.1s linear'
            }
          })
        )
      )
    ),
    document.body
  );
}

export function AdminLoginGate({ children }) {
  const React = window.React;
  const __deps = window.GATHER_UI_DEPS || {};
  const __comp = window.GATHER_UI_COMPONENTS || {};
  const LockIcon = __comp.LockIcon || __deps.LockIcon;

  const [status, setStatus] = React.useState('checking'); // 'checking' | 'locked' | 'unlocked'
  const [passwordInput, setPasswordInput] = React.useState('');
  const [error, setError] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'light');
    document.documentElement.style.fontSize = '';
    setStatus(getAdminSession() ? 'unlocked' : 'locked');
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = passwordInput.trim();
    if (!trimmed || isSubmitting) return;
    setIsSubmitting(true);
    setError('');
    try {
      const ok = await verifyAdminPasswordRemote(trimmed);
      if (ok) {
        setAdminSession(trimmed);
        setPasswordInput('');
        setStatus('unlocked');
      } else {
        setError('비밀번호가 올바르지 않습니다.');
      }
    } catch (err) {
      console.warn('Admin auth check failed:', err);
      setError(err?.message || '인증 확인 중 오류가 발생했습니다. 다시 시도해 주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === 'checking') return null;
  if (status === 'unlocked') return children;

  return /*#__PURE__*/React.createElement("div", {
    className: "admin-login-gate",
    style: {
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      backgroundColor: '#F8FAFC', padding: '20px'
    }
  },
    /*#__PURE__*/React.createElement("form", {
      onSubmit: handleSubmit,
      className: "modal-container",
      style: { maxWidth: '320px', padding: '28px', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '14px' }
    },
      /*#__PURE__*/React.createElement("div", { style: { fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' } }, /*#__PURE__*/React.createElement(LockIcon, null), "관리자 인증"),
      /*#__PURE__*/React.createElement("div", { style: { fontSize: 'var(--font-size-md)', color: 'var(--text-muted)' } }, "비밀번호를 입력해 주세요."),
      /*#__PURE__*/React.createElement("input", {
        type: "password",
        className: "form-input",
        style: { width: '100%' },
        autoFocus: true,
        value: passwordInput,
        onChange: e => setPasswordInput(e.target.value),
        placeholder: "비밀번호"
      }),
      error && /*#__PURE__*/React.createElement("div", { style: { color: '#DC2626', fontSize: 'var(--font-size-md)' } }, error),
      /*#__PURE__*/React.createElement("button", {
        type: "submit",
        className: "btn btn-primary",
        disabled: isSubmitting || !passwordInput.trim(),
        style: { opacity: isSubmitting || !passwordInput.trim() ? 0.6 : 1 }
      }, isSubmitting ? '확인 중...' : '입장')
    )
  );
}

export function DonutChart({ segments, size = 84, strokeWidth = 14 }) {
  const React = window.React;
  const __deps = window.GATHER_UI_DEPS || {};
  const __comp = window.GATHER_UI_COMPONENTS || {};

  const [activeIndex, setActiveIndex] = React.useState(null);
  const total = segments.reduce((sum, seg) => sum + seg.value, 0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const positiveSegments = segments.filter(seg => seg.value > 0);
  const activeSeg = activeIndex != null ? positiveSegments[activeIndex] : null;
  let dashOffsetAcc = 0;
  return /*#__PURE__*/React.createElement("div", { style: { position: 'relative', display: 'inline-flex', flexShrink: 0 } },
    /*#__PURE__*/React.createElement("svg", {
      width: size, height: size, viewBox: `0 0 ${size} ${size}`, style: { flexShrink: 0 },
      onMouseLeave: () => setActiveIndex(null)
    },
      total === 0 ?
        /*#__PURE__*/React.createElement("circle", { cx: size / 2, cy: size / 2, r: radius, fill: "none", stroke: "#E2E8F0", strokeWidth }) :
        positiveSegments.map((seg, idx) => {
          const dash = seg.value / total * circumference;
          const el = /*#__PURE__*/React.createElement("circle", {
            key: seg.label, cx: size / 2, cy: size / 2, r: radius, fill: "none",
            stroke: seg.color, strokeWidth,
            strokeDasharray: `${dash} ${circumference - dash}`,
            strokeDashoffset: -dashOffsetAcc,
            transform: `rotate(-90 ${size / 2} ${size / 2})`,
            strokeLinecap: positiveSegments.length > 1 ? 'butt' : 'round',
            style: {
              cursor: 'pointer',
              opacity: activeIndex == null || activeIndex === idx ? 1 : 0.4,
              transition: 'opacity 0.12s ease'
            },
            onMouseEnter: () => setActiveIndex(idx),
            onClick: event => {
              event.stopPropagation();
              setActiveIndex(prev => prev === idx ? null : idx);
            }
          });
          dashOffsetAcc += dash;
          return el;
        })
    ),
    activeSeg && /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute', bottom: `calc(100% + 6px)`, left: '50%', transform: 'translateX(-50%)',
        backgroundColor: 'rgba(15, 23, 42, 0.94)', color: '#FFFFFF', borderRadius: 'var(--radius-sm)',
        padding: '4px 8px', fontSize: 'var(--font-size-2xs)', fontWeight: 700, whiteSpace: 'nowrap',
        pointerEvents: 'none', zIndex: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.25)'
      }
    }, `${activeSeg.label} · ${activeSeg.value}${activeSeg.unit || '건'} (${total > 0 ? Math.round(activeSeg.value / total * 100) : 0}%)`)
  );
}

export function ColorSwatchPicker({ value, onChange, disabled, title = "색상 선택" }) {
  const React = window.React;
  const __deps = window.GATHER_UI_DEPS || {};
  const __comp = window.GATHER_UI_COMPONENTS || {};

  const [isOpen, setIsOpen] = React.useState(false);
  const normalized = normalizeColorValue(value, '#64748B').toUpperCase();
  const swatchColors = PRESET_COLORS.map(c => c.toUpperCase()).includes(normalized)
    ? PRESET_COLORS
    : [normalized, ...PRESET_COLORS];
  const sheet = isOpen && /*#__PURE__*/React.createElement("div", {
    className: "bottom-sheet-overlay",
    onClick: () => setIsOpen(false)
  }, /*#__PURE__*/React.createElement("div", {
    className: "bottom-sheet",
    onClick: e => e.stopPropagation()
  },
    /*#__PURE__*/React.createElement("div", { className: "bottom-sheet-header" },
      /*#__PURE__*/React.createElement("h4", null, title),
      /*#__PURE__*/React.createElement("button", {
        type: "button",
        style: { background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.2rem', cursor: 'pointer' },
        onClick: () => setIsOpen(false)
      }, "✕")
    ),
    /*#__PURE__*/React.createElement("div", { className: "bottom-sheet-body" },
      /*#__PURE__*/React.createElement("div", { style: { display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '14px' } },
        swatchColors.map(color => {
          const isSelected = color.toUpperCase() === normalized;
          return /*#__PURE__*/React.createElement("button", {
            key: color,
            type: "button",
            "aria-label": color,
            onClick: () => { onChange(color); setIsOpen(false); },
            style: {
              width: '44px', height: '44px', borderRadius: '50%', backgroundColor: color,
              border: isSelected ? '3px solid var(--text-main)' : '1px solid var(--border-subtle)',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#FFFFFF', fontWeight: 900, fontSize: '1rem'
            }
          }, isSelected && "✓");
        })
      )
    )
  ));
  return /*#__PURE__*/React.createElement(React.Fragment, null,
    /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "color-swatch-trigger",
      disabled,
      title,
      "aria-label": title,
      onClick: () => setIsOpen(true),
      style: { backgroundColor: normalized }
    }),
    sheet && typeof document !== 'undefined' && ReactDOM.createPortal ? ReactDOM.createPortal(sheet, document.body) : sheet
  );
}

// Height (px) of the "채팅으로 이동 / ✕" controls bar shown below the video when floating --
// shared between the resize-drag math and the container height calc below so they can't drift
// apart.
const STICKY_VIDEO_CONTROLS_HEIGHT = 38;

// The single persistent chat-video player: one <iframe> DOM node, kept alive (same React `key`)
// for as long as `stickyVideo` is set, regardless of which app view is showing -- so playback is
// genuinely uninterrupted once a video is promoted. Always renders as a small resizable floating
// PIP fixed to the bottom-right corner, in every view including chat (the owning chat message
// shows a "playing in PIP" placeholder instead -- see DirectChatMediaText's isThisSticky branch --
// rather than a second, competing inline iframe).
//
// An earlier version tried portaling into the owning chat message's own placeholder box while it
// was mounted, so the video would look inline there instead of floating -- and before that, an
// even earlier version always portaled into document.body but used position:fixed + a transform
// continuously recalculated from the anchor's getBoundingClientRect() on every animation frame to
// make the fixed box visually track the anchor's position. Both were abandoned: the cross-origin
// iframe frequently failed to actually paint under the constant reparenting/re-transform. The
// portal here always targets one stable, never-recreated host div (see hostRef below) appended
// directly to document.body, so the iframe DOM node itself is never moved or recreated.
export function StickyVideoBox({ stickyVideo, onClose, onGoToChat }) {
  const React = window.React;
  const __deps = window.GATHER_UI_DEPS || {};
  const __comp = window.GATHER_UI_COMPONENTS || {};

  // User's drag-resized floating width (px), null until they've actually dragged the resize
  // handle -- falls back to the orientation-based default below. Persists only for as long as
  // this particular video stays active; a newly-activated video starts back at the default.
  const [floatWidth, setFloatWidth] = React.useState(null);
  const dragStateRef = React.useRef(null);

  // Host container div in document.body for persistent PIP player.
  // Always kept inside document.body so browsers never reload or reset the iframe browsing context
  // during view transitions or sequential video switches.
  const hostRef = React.useRef(null);
  if (!hostRef.current && typeof document !== 'undefined') {
    hostRef.current = document.createElement('div');
    hostRef.current.style.display = 'contents';
  }
  React.useLayoutEffect(() => {
    const host = hostRef.current;
    if (!host || typeof document === 'undefined') return undefined;
    if (host.parentNode !== document.body) document.body.appendChild(host);
  }, [!!stickyVideo]);
  React.useEffect(() => () => {
    const host = hostRef.current;
    if (host && host.parentNode) host.parentNode.removeChild(host);
  }, []);

  const isPortrait = !!(stickyVideo && stickyVideo.orientation === 'portrait');
  const defaultFloatWidth = isPortrait ? 172 : 260;
  const effectiveFloatWidth = floatWidth || defaultFloatWidth;
  const effectiveFloatHeight = isPortrait ? Math.round(effectiveFloatWidth * 16 / 9) : Math.round(effectiveFloatWidth * 9 / 16);

  // Drag-to-resize the floating mini player -- pointer events cover mouse and touch alike.
  const handleResizePointerDown = e => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const startWidth = effectiveFloatWidth;
    dragStateRef.current = { startX, startWidth };
    const handleMove = moveEvent => {
      if (!dragStateRef.current) return;
      const dx = dragStateRef.current.startX - moveEvent.clientX;
      const maxWidthByViewportWidth = window.innerWidth - 28;
      const availableHeight = window.innerHeight - 28 - STICKY_VIDEO_CONTROLS_HEIGHT;
      const maxWidthByViewportHeight = isPortrait ? availableHeight * 9 / 16 : availableHeight * 16 / 9;
      const maxWidth = Math.max(120, Math.min(maxWidthByViewportWidth, maxWidthByViewportHeight));
      const next = Math.max(120, Math.min(maxWidth, dragStateRef.current.startWidth + dx));
      setFloatWidth(next);
    };
    const handleUp = () => {
      dragStateRef.current = null;
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
    };
    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
  };

  if (!stickyVideo || typeof document === 'undefined' || !ReactDOM.createPortal || !hostRef.current) return null;
  const autoplaySrc = stickyVideo.embedUrl + (stickyVideo.embedUrl.includes('?') ? '&' : '?') + 'autoplay=1';

  return ReactDOM.createPortal(/*#__PURE__*/React.createElement('div', {
    style: {
      position: 'fixed',
      right: '14px',
      bottom: 'calc(14px + env(safe-area-inset-bottom, 0px))',
      left: 'auto',
      top: 'auto',
      width: `${effectiveFloatWidth}px`,
      height: `${effectiveFloatHeight + STICKY_VIDEO_CONTROLS_HEIGHT}px`,
      zIndex: 40000,
      borderRadius: 'var(--radius-md)',
      overflow: 'hidden',
      background: '#000',
      boxShadow: '0 12px 32px rgba(0,0,0,0.4)'
    }
  }, /*#__PURE__*/React.createElement('iframe', {
    key: stickyVideo.key,
    src: autoplaySrc,
    title: stickyVideo.title || '미니플레이어',
    allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share',
    allowFullScreen: true,
    style: { display: 'block', width: '100%', height: `${effectiveFloatHeight}px`, border: '0' }
  }), /*#__PURE__*/React.createElement('div', {
    onPointerDown: handleResizePointerDown,
    'aria-label': '미니플레이어 크기 조절',
    style: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '22px',
      height: '22px',
      cursor: 'nwse-resize',
      touchAction: 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'rgba(255,255,255,0.85)',
      background: 'linear-gradient(135deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.55) 45%, transparent 46%)'
    }
  }, /*#__PURE__*/React.createElement('svg', {
    width: '10', height: '10', viewBox: '0 0 10 10', fill: 'none', stroke: 'currentColor', strokeWidth: '1.4', strokeLinecap: 'round'
  }, /*#__PURE__*/React.createElement('path', { d: 'M1 9 L9 1 M4.5 9 L9 4.5 M8 9 L9 8' }))), /*#__PURE__*/React.createElement('div', {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      padding: '6px',
      height: `${STICKY_VIDEO_CONTROLS_HEIGHT}px`,
      boxSizing: 'border-box',
      backgroundColor: 'rgba(15,23,42,0.94)'
    }
  }, /*#__PURE__*/React.createElement('button', {
    type: 'button',
    onClick: onGoToChat,
    style: {
      flex: 1,
      padding: '6px 8px',
      fontSize: 'var(--font-size-sm)',
      fontWeight: '700',
      color: '#FFFFFF',
      backgroundColor: 'rgba(255,255,255,0.14)',
      border: 'none',
      borderRadius: 'var(--radius-md)',
      cursor: 'pointer'
    }
  }, '채팅으로 이동'), /*#__PURE__*/React.createElement('button', {
    type: 'button',
    onClick: onClose,
    'aria-label': '미니플레이어 닫기',
    style: {
      width: '26px',
      height: '26px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 'var(--font-size-base)',
      color: '#FFFFFF',
      backgroundColor: 'rgba(255,255,255,0.14)',
      border: 'none',
      borderRadius: 'var(--radius-md)',
      cursor: 'pointer'
    }
  }, '✕'))), hostRef.current);
}

// Shared "\uCC38\uC5EC\uC790 \uC120\uD0DD" bottom sheet -- portaled to document.body (see stopPropagation comment
// below), lists active participants as color-dot + name rows with a checkmark on the selected
// one(s). ChatParticipantSheet (ui-chat-sheets.js, single-select "\uC791\uC131\uC790 \uC120\uD0DD") and PollVoterSheet
// (below, multi-voter "\uD22C\uD45C\uC790 \uC120\uD0DD") used to each hand-roll this exact same sheet -- differing only
// in title text and selection semantics -- so this is the one place their shared chrome lives.
export function ParticipantSelectSheet({ calendar, participants, title, isOptionSelected, onSelect, onClose }) {
  const React = window.React;
  const __deps = window.GATHER_UI_DEPS || {};
  const __comp = window.GATHER_UI_COMPONENTS || {};
  const SmallXIcon = __comp.SmallXIcon || __deps.SmallXIcon;
  const ParticipantBackdrop = __comp.ParticipantBackdrop || __deps.ParticipantBackdrop;

  const list = participants || getActiveParticipants(calendar);
  // Bottom-sheet rule: portal to document.body so a `position: fixed` sheet never gets trapped
  // by a transformed ancestor (e.g. a poll card's hover lift, or a memo card's :hover lift).
  return ReactDOM.createPortal(/*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "modal-overlay",
    // Portaled elements replay their synthetic events through the React component tree, not
    // the DOM tree, so this click would otherwise still bubble up to whatever ancestor
    // component (e.g. a poll card's or memo card's "tap to open" handler) rendered this sheet.
    onClick: e => { e.stopPropagation(); onClose(); },
    style: {
      alignItems: 'flex-end',
      backgroundColor: 'rgba(15, 23, 42, 0.68)',
      zIndex: 11000
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "poll-voter-sheet",
    style: { zIndex: 11001 }
  }, /*#__PURE__*/React.createElement("div", {
    className: "poll-voter-sheet-header"
  }, /*#__PURE__*/React.createElement("span", null, title), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onClose,
    style: { background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }
  }, /*#__PURE__*/React.createElement(SmallXIcon, null))), /*#__PURE__*/React.createElement("div", {
    style: { display: 'grid', gap: '8px', padding: '14px 20px 24px' }
  }, list.map(participant => /*#__PURE__*/React.createElement("button", {
    key: participant.id,
    type: "button",
    className: "poll-voter-option",
    onClick: () => onSelect(participant.id)
  }, /*#__PURE__*/React.createElement(ParticipantBackdrop, { participant: participant, name: participant.name, dotSize: 10, style: { gap: '10px' } }),
  isOptionSelected(participant.id) && /*#__PURE__*/React.createElement("span", {
    style: { color: '#2563EB', fontWeight: 900 }
  }, "\u2713")))))), document.body);
}

export function PollVoterSheet({ calendar, pollId, optionId, onSelect, onClose }) {
  const React = window.React;
  const __deps = window.GATHER_UI_DEPS || {};
  const __comp = window.GATHER_UI_COMPONENTS || {};
  const SharedParticipantSelectSheet = __comp.ParticipantSelectSheet || __deps.ParticipantSelectSheet || ParticipantSelectSheet;

  const participants = getActiveParticipants(calendar);
  const poll = getCalendarPolls(calendar).find(item => item.id === pollId);
  const option = getActivePollOptions(poll).find(item => item.id === optionId);
  if (!poll || !option) return null;
  const selectedIds = new Set(getPollOptionVoterIds(poll, option.id));
  return /*#__PURE__*/React.createElement(SharedParticipantSelectSheet, {
    calendar: calendar,
    participants: participants,
    title: "\uD22C\uD45C\uC790 \uC120\uD0DD",
    isOptionSelected: id => selectedIds.has(id),
    onSelect: id => {
      setStoredChatParticipantId(calendar?.id, id);
      onSelect(id);
    },
    onClose: onClose
  });
}

export function OperationProgressOverlay({ title, detail, pct }) {
  const React = window.React;
  const __deps = window.GATHER_UI_DEPS || {};
  const __comp = window.GATHER_UI_COMPONENTS || {};

  const clamped = Math.max(0, Math.min(100, pct || 0));
  return /*#__PURE__*/React.createElement('div', {
    role: 'status',
    'aria-live': 'polite',
    style: { position: 'fixed', top: 'calc(env(safe-area-inset-top, 0px) + 16px)', right: '16px', zIndex: 100000, width: '300px', maxWidth: 'calc(100vw - 32px)', pointerEvents: 'none' }
  }, /*#__PURE__*/React.createElement('div', {
    style: { backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '16px 18px', width: '100%', textAlign: 'left', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }
  },
    /*#__PURE__*/React.createElement('div', { style: { fontWeight: 900, fontSize: '0.9rem', color: 'var(--text-main)', marginBottom: '4px' } }, title || '작업 처리 중...'),
    /*#__PURE__*/React.createElement('div', { style: { fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', marginBottom: '10px', lineHeight: 1.4 } }, detail || '서버에 반영하고 있습니다.'),
    /*#__PURE__*/React.createElement('div', { style: { height: '9px', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--border-subtle)', overflow: 'hidden' } },
      /*#__PURE__*/React.createElement('div', { style: { height: '100%', width: `${clamped}%`, background: 'linear-gradient(90deg, #4F46E5, #EC4899)', transition: 'width 0.35s ease', borderRadius: 'var(--radius-full)' } })
    ),
    /*#__PURE__*/React.createElement('div', { style: { marginTop: '6px', color: 'var(--text-muted)', fontSize: 'var(--font-size-xs)', fontWeight: 800 } }, `${Math.round(clamped)}% · 다른 화면은 계속 사용할 수 있습니다.`)
  ));
}

export function ToggleSwitch({ checked, onChange, label }) {
  const React = window.React;
  const __deps = window.GATHER_UI_DEPS || {};
  const __comp = window.GATHER_UI_COMPONENTS || {};

  return /*#__PURE__*/React.createElement("button", {
    type: "button",
    role: "switch",
    "aria-checked": checked,
    "aria-label": label,
    onClick: onChange,
    style: {
      width: '44px', height: '24px', borderRadius: 'var(--radius-full)', border: 'none', cursor: 'pointer',
      backgroundColor: checked ? 'var(--accent-primary)' : '#CBD5E1',
      position: 'relative', transition: 'background-color 0.2s ease', padding: 0, flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute', top: '2px', left: checked ? '22px' : '2px',
      width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#FFFFFF',
      transition: 'left 0.2s ease', boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
    }
  }));
}

function getSyncStatusMeta(syncStatus = null) {
  const status = String(syncStatus?.status || 'live');
  const label = String(syncStatus?.label || '동기화됨');
  const lastSyncedText = String(syncStatus?.lastSyncedText || '').trim();
  const detail = String(syncStatus?.detail || '').trim();
  const title = [label, lastSyncedText ? `최근 ${lastSyncedText}` : '', detail].filter(Boolean).join(' · ') || label;
  return { status, label, lastSyncedText, detail, title };
}

export function SyncStatusChip({ syncStatus = null, className = '', style = null }) {
  const React = window.React;
  const { status, label, lastSyncedText, title } = getSyncStatusMeta(syncStatus);
  if (!syncStatus || !['offline', 'saving', 'error'].includes(status)) return null;
  const mergedClassName = ['sync-status-chip', `is-${status}`, className].filter(Boolean).join(' ');

  return /*#__PURE__*/React.createElement("span", {
    role: "status",
    className: mergedClassName,
    title: title,
    style: style || undefined
  },
    /*#__PURE__*/React.createElement("span", {
      className: "sync-status-chip__dot",
      "aria-hidden": "true"
    }),
    /*#__PURE__*/React.createElement("span", {
      className: "sync-status-chip__text"
    },
      /*#__PURE__*/React.createElement("span", {
        className: "sync-status-chip__label"
      }, label),
      lastSyncedText && /*#__PURE__*/React.createElement("span", {
        className: "sync-status-chip__time"
      }, `· ${lastSyncedText}`)
    )
  );
}

export function SyncStatusBanner({ syncStatus = null, className = '', style = null }) {
  const React = window.React;
  const { status, label, lastSyncedText, detail, title } = getSyncStatusMeta(syncStatus);
  if (!syncStatus || !['offline', 'saving', 'error'].includes(status)) return null;
  const mergedClassName = ['sync-status-banner', `is-${status}`, className].filter(Boolean).join(' ');

  return /*#__PURE__*/React.createElement("div", {
    role: "status",
    className: mergedClassName,
    title: title,
    style: style || undefined
  },
    /*#__PURE__*/React.createElement("span", {
      className: "sync-status-banner__dot",
      "aria-hidden": "true"
    }),
    /*#__PURE__*/React.createElement("div", {
      className: "sync-status-banner__content"
    },
      /*#__PURE__*/React.createElement("div", {
        className: "sync-status-banner__headline"
      },
        /*#__PURE__*/React.createElement("span", {
          className: "sync-status-banner__label"
        }, label),
        lastSyncedText && /*#__PURE__*/React.createElement("span", {
          className: "sync-status-banner__time"
        }, `최근 ${lastSyncedText}`)
      ),
      detail && /*#__PURE__*/React.createElement("div", {
        className: "sync-status-banner__detail"
      }, detail)
    )
  );
}

export function Footer() {
  const React = window.React;
  const __deps = window.GATHER_UI_DEPS || {};
  const __comp = window.GATHER_UI_COMPONENTS || {};

  return /*#__PURE__*/React.createElement('footer', { className: 'app-footer' },
    /*#__PURE__*/React.createElement('p', { className: 'app-footer-copyright' }, 'Copyright © 2026 모여라 캘린더. All Rights Reserved.'),
    /*#__PURE__*/React.createElement('div', { className: 'app-footer-family' },
      /*#__PURE__*/React.createElement('span', { className: 'app-footer-family-label' }, 'FAMILY LINK'),
      /*#__PURE__*/React.createElement('div', { className: 'app-footer-family-links' },
        getFooterFamilyLinks().map(link => /*#__PURE__*/React.createElement('a', {
          key: link.url,
          href: link.url,
          target: '_blank',
          rel: 'noopener noreferrer',
          className: 'app-footer-link'
        }, /*#__PURE__*/React.createElement(link.Icon, { size: 14 }), link.label))
      )
    )
  );
}

export function MemoTagInputRow({
  participant,
  onOpenParticipant,
  tags = [],
  tagInput = '',
  onTagInputChange,
  onAddTag,
  maxTags = 10
}) {
  const React = window.React;
  const __deps = window.GATHER_UI_DEPS || {};
  const ParticipantPickerButton = __deps.ParticipantPickerButton;

  return /*#__PURE__*/React.createElement("div", {
    style: { display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }
  },
    ParticipantPickerButton && /*#__PURE__*/React.createElement(ParticipantPickerButton, {
      participant: participant,
      onClick: onOpenParticipant
    }),
    /*#__PURE__*/React.createElement("input", {
      type: "text",
      placeholder: tags.length >= maxTags ? `태그 최대 ${maxTags}개 도달` : `태그 입력 (${tags.length}/${maxTags})`,
      value: tagInput,
      onChange: e => onTagInputChange && onTagInputChange(e.target.value),
      onKeyDown: e => {
        if (e.nativeEvent.isComposing) return;
        if (e.key === 'Enter') {
          e.preventDefault();
          onAddTag && onAddTag();
        }
      },
      maxLength: 100,
      style: {
        flex: 1, minWidth: 0, height: '28px', padding: '0 8px', borderRadius: 'var(--radius-sm)',
        border: '1px solid var(--border-subtle)', background: 'var(--bg-primary)',
        color: 'var(--text-main)', fontSize: 'var(--font-size-sm)'
      }
    }),
    /*#__PURE__*/React.createElement("button", {
      type: "button",
      onClick: onAddTag,
      disabled: tags.length >= maxTags,
      style: {
        flexShrink: 0, height: '28px', padding: '0 10px', borderRadius: 'var(--radius-sm)',
        border: '1px solid var(--border-subtle)', background: 'var(--border-subtle)',
        color: 'var(--text-main)', fontSize: 'var(--font-size-sm)', fontWeight: 800, cursor: 'pointer',
        opacity: tags.length >= maxTags ? 0.45 : 1
      }
    }, "태그저장")
  );
}

export function ClickToPlayVideoCard({ url, mediaInfo = null, fallbackTitle = '', cachedData = null }) {
  const React = window.React;
  const __deps = window.GATHER_UI_DEPS || {};
  const __comp = window.GATHER_UI_COMPONENTS || {};
  const TikTokEmbedWidget = __comp.TikTokEmbedWidget || __deps.TikTokEmbedWidget;

  const [isPlaying, setIsPlaying] = React.useState(false);

  const preview = useLinkPreview(url, cachedData);
  const previewData = (preview && preview.status === 'success' && preview.data) ? preview.data : (cachedData || {});

  const info = mediaInfo || (typeof GATHER_APP_UTILS !== 'undefined' && typeof GATHER_APP_UTILS.getDirectChatMediaInfo === 'function' ? GATHER_APP_UTILS.getDirectChatMediaInfo(url) : null);
  const isTikTok = !!(info && info.type === 'tiktok-widget');
  const isEmbed = !!(info && info.type === 'embed');
  const isDirectVideo = !!(info && info.type === 'video');
  const isPortrait = (isEmbed && info?.orientation === 'portrait') || isTikTok;

  const title = previewData?.title || fallbackTitle || (isTikTok ? 'TikTok 영상' : '영상 재생');
  const thumbnailUrl = previewData?.image || '';

  // Active playing state for YouTube / direct video
  if (isPlaying) {
    if (isEmbed) {
      const embedUrl = info.url + (info.url.includes('?') ? '&autoplay=1&playsinline=1' : '?autoplay=1&playsinline=1');
      return /*#__PURE__*/React.createElement("div", {
        style: {
          width: '100%',
          maxWidth: isPortrait ? '320px' : '100%',
          margin: '0 auto',
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden',
          backgroundColor: '#000000',
          boxSizing: 'border-box'
        }
      }, /*#__PURE__*/React.createElement("iframe", {
        src: embedUrl,
        title: title,
        allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share',
        allowFullScreen: true,
        style: {
          display: 'block',
          width: '100%',
          aspectRatio: isPortrait ? '9 / 16' : '16 / 9',
          maxHeight: isPortrait ? 'min(72vh, 480px)' : 'min(54vh, 360px)',
          border: '0',
          borderRadius: 'var(--radius-md)'
        }
      }));
    }
    if (isDirectVideo) {
      return /*#__PURE__*/React.createElement("video", {
        src: info.url,
        controls: true,
        autoPlay: true,
        playsInline: true,
        style: {
          display: 'block',
          width: '100%',
          maxHeight: '360px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: '#000000',
          boxSizing: 'border-box'
        }
      });
    }
  }

  // Click-to-Play Façade (Lightweight, zero iframes on load, perfectly sized)
  const handlePlayClick = e => {
    e.preventDefault();
    e.stopPropagation();
    if (isTikTok) {
      // Direct open in TikTok for immediate high-res playback with audio
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      setIsPlaying(true);
    }
  };
  const handlePlayKeyDown = e => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    handlePlayClick(e);
  };
  const playLabel = isTikTok ? 'TikTok에서 영상 보기' : `${title} 재생`;

  return /*#__PURE__*/React.createElement("div", {
    onClick: handlePlayClick,
    onKeyDown: handlePlayKeyDown,
    role: "button",
    tabIndex: 0,
    "aria-label": playLabel,
    title: isTikTok ? 'TikTok에서 영상 보기 (새 탭에서 바로 재생)' : `${title} 재생`,
    style: {
      position: 'relative',
      width: '100%',
      maxWidth: '100%',
      aspectRatio: isPortrait ? '9 / 16' : '16 / 9',
      maxHeight: isPortrait ? 'min(62vh, 400px)' : 'min(45vh, 260px)',
      borderRadius: 'var(--radius-md)',
      overflow: 'hidden',
      backgroundColor: '#0F172A',
      cursor: 'pointer',
      boxSizing: 'border-box',
      border: '1px solid var(--border-subtle)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  },
    /* Thumbnail Image */
    thumbnailUrl ? /*#__PURE__*/React.createElement("img", {
      src: thumbnailUrl,
      alt: title,
      loading: "lazy",
      decoding: "async",
      style: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        display: 'block'
      }
    }) : /*#__PURE__*/React.createElement("div", {
      style: {
        width: '100%',
        height: '100%',
        background: 'linear-gradient(135deg, #1E293B, #0F172A)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        boxSizing: 'border-box',
        textAlign: 'center',
        color: 'var(--text-light)',
        fontSize: 'var(--font-size-md)',
        fontWeight: 600
      }
    }, title),

    /* Dark gradient scrim at bottom */
    /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.1) 45%, transparent 70%)',
        pointerEvents: 'none'
      }
    }),

    /* Platform Badge at Top-Left */
    /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        top: '8px',
        left: '8px',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '3px 8px',
        borderRadius: 'var(--radius-full)',
        backgroundColor: isTikTok ? 'rgba(0,0,0,0.78)' : 'rgba(220, 38, 38, 0.92)',
        color: '#FFFFFF',
        fontSize: 'var(--font-size-xs)',
        fontWeight: 800,
        boxShadow: '0 2px 4px rgba(0,0,0,0.25)',
        pointerEvents: 'none'
      }
    }, isTikTok ? 'TikTok' : (isPortrait ? 'Shorts' : 'YouTube')),

    /* Center Play Button */
    /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        width: '46px',
        height: '46px',
        borderRadius: '50%',
        backgroundColor: isTikTok ? '#FE2C55' : '#FF0000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
        pointerEvents: 'none'
      }
    }, /*#__PURE__*/React.createElement("svg", {
      viewBox: "0 0 24 24",
      width: "22",
      height: "22",
      fill: "#FFFFFF",
      style: { marginLeft: '3px' }
    }, /*#__PURE__*/React.createElement("path", { d: "M8 5v14l11-7z" }))),

    /* Bottom Info Bar */
    /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        bottom: '8px',
        left: '10px',
        right: '10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        pointerEvents: 'none'
      }
    },
      /* Video title preview */
      /*#__PURE__*/React.createElement("div", {
        style: {
          color: '#FFFFFF',
          fontSize: 'var(--font-size-sm)',
          fontWeight: 700,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          textShadow: '0 1px 3px rgba(0,0,0,0.9)'
        }
      }, isTikTok ? 'TikTok에서 바로 시청하기 ↗' : (title || '영상 재생'))
    )
  );
}

// Wraps a fixed-height, independently-scrolling list (e.g. a participant roster or an expense
// breakdown) that lives inside a modal body which itself scrolls -- without this, the list's own
// scrollbar and the modal's outer scrollbar fight each other ("이중 스크롤"). Renders the list
// (via `children`) at a user-adjustable height with a drag handle docked to its bottom edge, so
// the list can be expanded to avoid the double-scroll instead of always defaulting to a fixed cap.
export function ResizableListSection({
  children,
  initialHeight = 160,
  minHeight = 96,
  maxHeight = 480,
  step = 24,
  listClassName = '',
  listStyle = {},
  handleTitle = '드래그하여 목록 높이 조절',
  handleAriaLabel = '목록 높이 조절'
}) {
  const React = window.React;
  // initialHeight: 'auto' sizes the list to however tall its content actually is on first
  // mount (clamped to [minHeight, maxHeight]) instead of always opening at the same fixed
  // guess -- a 1-row list opens compact, an 8-row one opens tall enough to show everyone
  // without immediately needing the drag handle. Only measured once on mount (not on every
  // content change) so it never fights a resize the user has already made by hand.
  const isAutoInitial = initialHeight === 'auto';
  const [height, setHeight] = React.useState(isAutoInitial ? minHeight : initialHeight);
  const listRef = React.useRef(null);
  const resizeRef = React.useRef(null);
  const clampHeight = h => Math.min(maxHeight, Math.max(minHeight, h));
  // Empty dependency array is deliberate: measure once against whatever content is present at
  // mount time only, so a later content change doesn't fight a resize the user already made.
  React.useLayoutEffect(() => {
    if (!isAutoInitial || !listRef.current) return;
    const el = listRef.current;
    // scrollHeight never includes border width (only padding + content), but this element's
    // own box-sizing is border-box (global `* { box-sizing: border-box }`), so setting height
    // straight from scrollHeight leaves exactly the border's width too little room -- content
    // that fits exactly still overflows by a pixel or two and shows a needless scrollbar.
    // offsetHeight - clientHeight isolates that border width (both already reflect the same
    // border regardless of the element's current, possibly still-clamped, height) so it can be
    // added back to get a height that actually fits the measured content with no scroll.
    const borderHeight = el.offsetHeight - el.clientHeight;
    setHeight(clampHeight(el.scrollHeight + borderHeight));
  }, []);

  const handleResizeStart = event => {
    event.preventDefault();
    event.stopPropagation();
    resizeRef.current = { pointerId: event.pointerId, startY: event.clientY, startHeight: height };
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };
  const handleResizeMove = event => {
    const resize = resizeRef.current;
    if (!resize || resize.pointerId !== event.pointerId) return;
    event.preventDefault();
    setHeight(clampHeight(resize.startHeight + event.clientY - resize.startY));
  };
  const handleResizeEnd = event => {
    if (resizeRef.current?.pointerId === event.pointerId) resizeRef.current = null;
  };
  const handleResizeKeyDown = event => {
    const stepSize = event.shiftKey ? step * 2 : step;
    if (!['ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const next = event.key === 'Home' ? minHeight : event.key === 'End' ? maxHeight : height + (event.key === 'ArrowDown' ? stepSize : -stepSize);
    setHeight(clampHeight(next));
  };

  return /*#__PURE__*/React.createElement(React.Fragment, null,
    /*#__PURE__*/React.createElement('div', {
      ref: listRef,
      className: listClassName,
      style: { ...listStyle, height: `${height}px`, overflowY: 'auto', transition: resizeRef.current ? 'none' : 'height 120ms ease' }
    }, children),
    /*#__PURE__*/React.createElement('div', {
      className: 'resizable-list-handle-row',
      // Row height itself is left to CSS (see .resizable-list-handle-row in app.css) so it can
      // track the handle button's actual rendered height at each breakpoint -- 24px on desktop,
      // 36px under the mobile `.modal-body button { min-height: 36px }` touch-target rule.
      style: { display: 'flex', justifyContent: 'center', marginTop: '-8px', backgroundColor: 'rgba(0, 0, 0, 0.04)', borderRadius: '0 0 6px 6px', marginBottom: '8px' }
    },
      /*#__PURE__*/React.createElement('button', {
        type: 'button',
        className: 'resizable-list-handle',
        title: handleTitle,
        'aria-label': handleAriaLabel,
        onPointerDown: handleResizeStart,
        onPointerMove: handleResizeMove,
        onPointerUp: handleResizeEnd,
        onPointerCancel: handleResizeEnd,
        onKeyDown: handleResizeKeyDown
      },
        /*#__PURE__*/React.createElement('svg', { width: '18', height: '18', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': 'true' },
          /*#__PURE__*/React.createElement('path', { d: 'M8 9l4-4 4 4' }),
          /*#__PURE__*/React.createElement('path', { d: 'M16 15l-4 4-4-4' })
        )
      )
    )
  );
}

  if (typeof window !== 'undefined') {
  window.GATHER_UI_COMPONENTS = Object.assign({}, window.GATHER_UI_COMPONENTS || {}, {
    ResizableModalContainer: ResizableModalContainer,
    ResizableListSection: ResizableListSection,
    AutoGrowTextarea: AutoGrowTextarea,
    FormAddEditActionButtons: FormAddEditActionButtons,
    SegmentedToggle: SegmentedToggle,
    UnderlineTabs: UnderlineTabs,
    ItemEditDeleteActions: ItemEditDeleteActions,
    GamifiedConfirmButtonContent: GamifiedConfirmButtonContent,
    SyncStatusChip: SyncStatusChip,
    SyncStatusBanner: SyncStatusBanner,
    LinkPreviewCard: LinkPreviewCard,
    LinkPreviewProgressOverlay: LinkPreviewProgressOverlay,
    AdminLoginGate: AdminLoginGate,
    DonutChart: DonutChart,
    ColorSwatchPicker: ColorSwatchPicker,
    StickyVideoBox: StickyVideoBox,
    PollVoterSheet: PollVoterSheet,
    ParticipantSelectSheet: ParticipantSelectSheet,
    OperationProgressOverlay: OperationProgressOverlay,
    ToggleSwitch: ToggleSwitch,
    Footer: Footer,
    MemoTagInputRow: MemoTagInputRow,
    ClickToPlayVideoCard: ClickToPlayVideoCard,
  });
}
