/**
 * Places map + places view (P4-10)
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
function parsePlaceMemoEntries(...args) {
  const f = __gatherUiDeps().parsePlaceMemoEntries || GATHER_APP_UTILS.parsePlaceMemoEntries;
  return typeof f === 'function' ? f(...args) : undefined;
}
function removeFirstUrl(...args) {
  const f = __gatherUiDeps().removeFirstUrl || GATHER_APP_UTILS.removeFirstUrl;
  return typeof f === 'function' ? f(...args) : undefined;
}
function removePlaceMemoEntry(...args) {
  const f = __gatherUiDeps().removePlaceMemoEntry || GATHER_APP_UTILS.removePlaceMemoEntry;
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
function upsertPlaceMemoEntry(...args) {
  const f = __gatherUiDeps().upsertPlaceMemoEntry || GATHER_APP_UTILS.upsertPlaceMemoEntry;
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
function loadMapLibreLeaflet(...args) {
  const f = __gatherUiDeps().loadMapLibreLeaflet || GATHER_APP_UTILS.loadMapLibreLeaflet;
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

// A deliberately quiet basemap: enough coastline, water, major roads and broad place names to
// orient the user, but no POIs, buildings, shops, transit labels or neighbourhood-level noise.
// The source is isolated behind a normal MapLibre style object so moving it to our own PMTiles
// archive later only requires replacing `sources.openmaptiles`, not rewriting the map UI.
const MINIMAL_MONO_MAP_STYLE = {
  version: 8,
  name: 'Gather Minimal Mono',
  glyphs: 'https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf',
  sources: {
    openmaptiles: {
      type: 'vector',
      url: 'https://tiles.openfreemap.org/planet',
      attribution: 'OpenFreeMap &copy; OpenMapTiles Data from OpenStreetMap'
    }
  },
  layers: [
    {
      id: 'background',
      type: 'background',
      paint: { 'background-color': '#f8f8f6' }
    },
    {
      id: 'water',
      type: 'fill',
      source: 'openmaptiles',
      'source-layer': 'water',
      paint: { 'fill-color': '#e7eaeb', 'fill-antialias': true }
    },
    {
      id: 'parks',
      type: 'fill',
      source: 'openmaptiles',
      'source-layer': 'park',
      minzoom: 8,
      paint: { 'fill-color': '#f0f1ed', 'fill-opacity': 0.72 }
    },
    {
      id: 'waterways',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'waterway',
      minzoom: 9,
      paint: { 'line-color': '#dce1e2', 'line-width': 0.8, 'line-opacity': 0.78 }
    },
    {
      id: 'major-road-casing',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'transportation',
      minzoom: 7,
      filter: ['in', ['get', 'class'], ['literal', ['motorway', 'trunk', 'primary', 'secondary']]],
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: {
        'line-color': '#e1e1de',
        'line-width': ['interpolate', ['linear'], ['zoom'], 7, 1.2, 13, 4, 18, 9],
        'line-opacity': 0.65
      }
    },
    {
      id: 'major-roads',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'transportation',
      minzoom: 7,
      filter: ['in', ['get', 'class'], ['literal', ['motorway', 'trunk', 'primary', 'secondary']]],
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: {
        'line-color': '#ffffff',
        'line-width': ['interpolate', ['linear'], ['zoom'], 7, 0.6, 13, 2.5, 18, 6.5],
        'line-opacity': 0.9
      }
    },
    {
      id: 'country-boundaries',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'boundary',
      filter: ['==', ['get', 'admin_level'], 2],
      paint: { 'line-color': '#babdbd', 'line-width': 1, 'line-opacity': 0.65 }
    },
    {
      id: 'regional-boundaries',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'boundary',
      minzoom: 7,
      filter: ['in', ['get', 'admin_level'], ['literal', [3, 4]]],
      paint: {
        'line-color': '#c9cbca',
        'line-width': 0.7,
        'line-opacity': 0.55,
        'line-dasharray': [3, 3]
      }
    },
    {
      id: 'country-labels',
      type: 'symbol',
      source: 'openmaptiles',
      'source-layer': 'place',
      maxzoom: 7,
      filter: ['==', ['get', 'class'], 'country'],
      layout: {
        'text-field': ['coalesce', ['get', 'name:ko'], ['get', 'name']],
        'text-font': ['Noto Sans Regular'],
        'text-size': 11,
        'text-letter-spacing': 0.08
      },
      paint: { 'text-color': '#74797b', 'text-halo-color': '#f8f8f6', 'text-halo-width': 1.1 }
    },
    {
      id: 'region-labels',
      type: 'symbol',
      source: 'openmaptiles',
      'source-layer': 'place',
      minzoom: 5,
      maxzoom: 11,
      filter: ['==', ['get', 'class'], 'state'],
      layout: {
        'text-field': ['coalesce', ['get', 'name:ko'], ['get', 'name']],
        'text-font': ['Noto Sans Regular'],
        'text-size': 10,
        'text-letter-spacing': 0.05
      },
      paint: { 'text-color': '#818688', 'text-halo-color': '#f8f8f6', 'text-halo-width': 1.1 }
    },
    {
      id: 'city-labels',
      type: 'symbol',
      source: 'openmaptiles',
      'source-layer': 'place',
      minzoom: 5,
      filter: ['in', ['get', 'class'], ['literal', ['city', 'town']]],
      layout: {
        'text-field': ['coalesce', ['get', 'name:ko'], ['get', 'name']],
        'text-font': ['Noto Sans Regular'],
        'text-size': ['interpolate', ['linear'], ['zoom'], 5, 10, 11, 13],
        'text-max-width': 8
      },
      paint: { 'text-color': '#62686a', 'text-halo-color': '#f8f8f6', 'text-halo-width': 1.25 }
    }
  ]
};


export function PlaceMapView({ places, calendar, onSelectPlace, scrollWheelZoom = false, resizeSignal, preferDomesticBounds = false, focusPlace = null, onSelectDate }) {
  const React = window.React;
  const __deps = window.GATHER_UI_DEPS || {};
  const getCalendarPlaces = __deps.getCalendarPlaces;
  const getPlaceCategories = __deps.getPlaceCategories;
  const loadLeaflet = __deps.loadLeaflet;
  const loadLeafletMarkerCluster = __deps.loadLeafletMarkerCluster;
  const loadMapLibreLeaflet = __deps.loadMapLibreLeaflet;
  const buildPlaceMarkerHtml = __deps.buildPlaceMarkerHtml;
  const panMapToFitMarkerPopup = __deps.panMapToFitMarkerPopup;
  const centerMapOnMarkerAndPopup = __deps.centerMapOnMarkerAndPopup;
  const PLACE_MAP_DEFAULT_CENTER = __deps.PLACE_MAP_DEFAULT_CENTER;
  const PLACE_MAP_DEFAULT_ZOOM = __deps.PLACE_MAP_DEFAULT_ZOOM;
  const getPlaceExternalMapUrl = __deps.getPlaceExternalMapUrl;
  const parsePlaceMemoEntries = __deps.parsePlaceMemoEntries;
  const sortVisitEntriesRecentFirst = __deps.sortVisitEntriesRecentFirst;

  const containerRef = React.useRef(null);
  const mapRef = React.useRef(null);
  const markersLayerRef = React.useRef(null);
  // Keyed by place.id so the focusPlace effect below can look up and pan/zoom to a specific
  // marker (and open its popup) without needing to re-walk `places` or rebuild the marker layer.
  const markersByIdRef = React.useRef(new Map());
  // getCalendarPlaces(calendar) builds a brand-new array (and place objects) on every call, so
  // the `places` prop gets a new reference on every parent re-render even when nothing about the
  // places actually changed -- e.g. clicking a marker opens the edit modal, which re-renders the
  // parent, which recomputes `places`, which used to re-trigger the marker-rebuild effect below
  // and reset the map's pan/zoom back to its fitted view mid-interaction. Comparing an actual
  // content signature (not the array reference) lets that effect skip doing anything at all when
  // the underlying data hasn't changed.
  const dataSignatureRef = React.useRef(null);
  const [ready, setReady] = React.useState(false);
  const [loadError, setLoadError] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    loadLeaflet().then(async L => {
      if (cancelled || !containerRef.current || mapRef.current) return;
      const map = L.map(containerRef.current, {
          scrollWheelZoom,
          zoomControl: true,
          attributionControl: true,
          touchZoom: true,
          dragging: true,
          doubleClickZoom: true,
          boxZoom: false,
          keyboard: true,
          tapTolerance: 15
        })
        .setView(PLACE_MAP_DEFAULT_CENTER, PLACE_MAP_DEFAULT_ZOOM);
      mapRef.current = map;
      try { map.invalidateSize({ animate: false }); } catch (e) {}

      // Paint a lightweight raster fallback immediately, then replace it with the intentionally
      // sparse vector style once its lazy chunk is ready. This avoids a blank map on 3G/old
      // devices while still allowing individual vector layers (POIs, buildings, minor roads,
      // transit labels) to be omitted entirely. If WebGL or the vector source fails, the raster
      // layer simply stays in place instead of turning the whole map into an error panel.
      const addOpenStreetMapLayer = () => L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        maxNativeZoom: 19,
        className: 'places-map-raster-fallback',
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);
      const rasterFallbackLayer = addOpenStreetMapLayer();
      if (typeof loadMapLibreLeaflet === 'function') {
        try {
          await loadMapLibreLeaflet();
          if (!cancelled && mapRef.current && L.maplibreGL) {
            const monoVectorLayer = L.maplibreGL({
              style: MINIMAL_MONO_MAP_STYLE,
              className: 'places-map-vector-basemap',
              attribution: '<a href="https://openfreemap.org/">OpenFreeMap</a> &copy; <a href="https://www.openmaptiles.org/">OpenMapTiles</a> Data from <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
              interactive: false,
              padding: 0.08
            }).addTo(map);
            const vectorMap = monoVectorLayer.getMaplibreMap();
            let vectorReady = false;
            const vectorLoadTimer = window.setTimeout(() => {
              if (vectorReady || cancelled) return;
              try { map.removeLayer(monoVectorLayer); } catch (_) {}
            }, 12000);
            // `load` only means that the style JSON parsed; it can fire even when every vector
            // tile request is failing. `idle` confirms the first visible tile set is actually
            // complete before we remove the already-rendered raster safety layer.
            vectorMap.once('idle', () => {
              vectorReady = true;
              window.clearTimeout(vectorLoadTimer);
              if (cancelled || !mapRef.current) return;
              try { map.removeLayer(rasterFallbackLayer); } catch (_) {}
            });
            vectorMap.on('error', () => {
              if (vectorReady || cancelled) return;
              window.clearTimeout(vectorLoadTimer);
              try { map.removeLayer(monoVectorLayer); } catch (_) {}
            });
          }
        } catch (err) {
          console.warn('Minimal vector basemap unavailable, keeping raster fallback:', err);
        }
      }
      try { map.invalidateSize({ animate: false }); } catch (e) {}

      let clusterAvailable = false;
      try {
        await loadLeafletMarkerCluster();
        clusterAvailable = !!L.markerClusterGroup;
      } catch (err) {
        console.error('leaflet.markercluster load failed, falling back to ungrouped markers:', err);
      }
      if (cancelled) return;
      markersLayerRef.current = clusterAvailable ? L.markerClusterGroup({
        chunkedLoading: true,
        showCoverageOnHover: false,
        // We handle clusterclick ourselves so we can keep the zoom anchored to the cluster's
        // bounds while also adding a bit of padding. The earlier custom flyTo(center, +1 zoom)
        // path made clusters appear to "run away" because the centroid shifts during reclustering;
        // zooming to bounds avoids that, and the padding keeps the result from hugging the edge.
        // Both zoomToBoundsOnClick AND spiderfyOnMaxZoom must stay false here: the plugin binds
        // its own built-in _zoomOrSpiderfy click handler whenever EITHER is truthy, and that
        // handler would then run in parallel with the one registered below on every cluster
        // click -- e.g. spiderfying a cluster the same moment our handler also zooms/re-fits it,
        // leaving a spiderfied fan of markers on screen next to a freshly re-clustered icon.
        zoomToBoundsOnClick: false,
        spiderfyOnMaxZoom: false,
        disableClusteringAtZoom: 18,
        maxClusterRadius: zoom => {
          const z = typeof zoom === 'number' ? zoom : 0;
          if (z >= 17) return 42;
          if (z >= 15) return 54;
          if (z >= 13) return 66;
          return 78;
        },
        // Flat solid-color badge instead of the plugin's default ripple-ring style, to match the
        // rest of the app's flat/minimal look rather than pulling in its default CSS theme too.
        iconCreateFunction: cluster => {
          const count = cluster.getChildCount();
          // Once there's nothing left to merge with (zoomed in far enough that a "cluster" only
          // has one marker in it, or the plugin momentarily reports a stale/zero count mid-zoom),
          // show that marker's own category badge instead of a numbered cluster circle -- a
          // single-marker "cluster" should look exactly like an individual marker, not like a
          // cluster with nothing in it.
          if (count <= 1) {
            const child = cluster.getAllChildMarkers()[0];
            return L.divIcon({
              html: buildPlaceMarkerHtml(child?.placeCategory, child?.placeVisitStatus),
              className: 'place-map-marker',
              iconSize: [PLACE_MARKER_SIZE, PLACE_MARKER_SIZE],
              iconAnchor: [PLACE_MARKER_SIZE / 2, PLACE_MARKER_SIZE / 2]
            });
          }
          const size = count < 10 ? 30 : count < 50 ? 36 : 42;
          return L.divIcon({
            html: `<div style="width:100%;height:100%;border-radius:8px;background:#3B82F6;border:3px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:0.75rem;">${count}</div>`,
            className: 'place-cluster-icon',
            iconSize: [size, size]
          });
        }
      }) : L.layerGroup();
      if (clusterAvailable) {
        markersLayerRef.current.on('clusterclick', e => {
          const cluster = e && e.layer;
          const group = markersLayerRef.current;
          const map = mapRef.current;
          if (!cluster || !map || !group) return;
          try {
            if (e.originalEvent) {
              L.DomEvent.preventDefault(e.originalEvent);
              L.DomEvent.stopPropagation(e.originalEvent);
            }
          } catch (err) {}

          // Re-derive leaflet.markercluster's own "are we as deep as clustering ever goes"
          // check (normally done inside its _zoomOrSpiderfy, which we intentionally left
          // unbound above) instead of a same-coordinates heuristic: a cluster of markers a few
          // meters apart never satisfies "same location" and previously fell through to
          // fitBounds capped at zoom 16 -- below disableClusteringAtZoom (18), so it stayed
          // clustered forever with clicks doing nothing once that bound was reached.
          let bottomCluster = cluster;
          while (bottomCluster._childClusters && bottomCluster._childClusters.length === 1) {
            bottomCluster = bottomCluster._childClusters[0];
          }
          const atDeepestClusterLevel = typeof group._maxZoom === 'number'
            && bottomCluster._zoom === group._maxZoom
            && bottomCluster._childCount === cluster._childCount;

          if (atDeepestClusterLevel) {
            if (typeof cluster.spiderfy === 'function') cluster.spiderfy();
            return;
          }

          // Not yet as deep as clustering goes -- zoomToBounds() reuses the plugin's own
          // step-zoom logic (zooms in by whole levels toward the bounds, and forces at least
          // one level of advance even if the bounds already fit the current view), so a click
          // always visibly does something instead of silently no-op'ing.
          if (typeof cluster.zoomToBounds === 'function') {
            cluster.zoomToBounds({ padding: [50, 50], animate: true });
          }
        });
      }
      markersLayerRef.current.addTo(map);
      setReady(true);
      try { map.invalidateSize({ animate: false }); } catch (e) {}
    }).catch(err => {
      console.error('Leaflet load failed:', err);
      if (!cancelled) setLoadError(true);
    });
    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  React.useEffect(() => {
    if (!ready || !mapRef.current || !window.L) return;
    const L = window.L;
    const categories = getPlaceCategories(calendar);
    const placesKey = (places || []).map(p => `${p.id}|${p.lat}|${p.lng}|${p.updatedAt || 0}|${p.categoryId || ''}|${p.visitStatus || ''}`).join(';');
    const categoriesKey = (categories || []).map(c => `${c.id}|${c.color || ''}`).join(';');
    const signature = placesKey + '::' + categoriesKey;
    if (dataSignatureRef.current === signature) return;
    dataSignatureRef.current = signature;
    const layer = markersLayerRef.current;
    layer.clearLayers();
    markersByIdRef.current = new Map();
    const categoryMap = categories.reduce((acc, c) => { acc[c.id] = c; return acc; }, {});
    const bounds = [];
    (places || []).forEach(place => {
      const category = categoryMap[place.categoryId] || categoryMap.etc;
      // Flat circle instead of the earlier rotated-teardrop shape -- simpler to render (no CSS
      // transform on top of Leaflet's own positioning transform).
      const icon = L.divIcon({
        className: 'place-map-marker',
        html: buildPlaceMarkerHtml(category, place.visitStatus),
        iconSize: [PLACE_MARKER_SIZE, PLACE_MARKER_SIZE],
        iconAnchor: [PLACE_MARKER_SIZE / 2, PLACE_MARKER_SIZE / 2],
        popupAnchor: [0, -PLACE_MARKER_SIZE / 2]
      });
      const marker = L.marker([place.lat, place.lng], { icon });
      if (place.id) markersByIdRef.current.set(place.id, marker);
      // Read back by the cluster group's iconCreateFunction above when a cluster collapses down
      // to just this one marker, so it can render the same category badge instead of a "1".
      marker.placeCategory = category;
      marker.placeVisitStatus = place.visitStatus;
      const isMobileViewport = window.innerWidth <= 720;
      const popupNode = document.createElement('div');
      popupNode.style.minWidth = '220px';

      // Header: name+address on the left, a 업체정보(external map) button and a custom close
      // button on the right -- Leaflet's own default close glyph doesn't share this app's
      // stroke-based icon styling, so closeButton is disabled below and both buttons are built
      // here instead, matching each other's size/weight/color exactly.
      const headerEl = document.createElement('div');
      headerEl.style.display = 'flex';
      headerEl.style.alignItems = 'flex-start';
      headerEl.style.justifyContent = 'space-between';
      headerEl.style.gap = '8px';
      const infoEl = document.createElement('div');
      infoEl.style.minWidth = '0';
      const nameEl = document.createElement('div');
      nameEl.style.fontWeight = '800';
      nameEl.style.fontSize = '0.85rem';
      const displayName = (place.alias && place.alias !== place.name)
        ? `${place.name || ''} (${place.alias})`
        : (place.alias || place.name || '이름 없음');
      nameEl.textContent = displayName;
      infoEl.appendChild(nameEl);
      if (place.address) {
        const addrEl = document.createElement('div');
        addrEl.style.fontSize = '0.75rem';
        addrEl.style.color = '#64748B';
        addrEl.textContent = getDisplayPlaceAddress(place);
        infoEl.appendChild(addrEl);
      }
      headerEl.appendChild(infoEl);

      const actionsEl = document.createElement('div');
      actionsEl.style.display = 'flex';
      actionsEl.style.alignItems = 'center';
      actionsEl.style.gap = '2px';
      actionsEl.style.flexShrink = '0';
      const popupActionBtnStyle = { width: '22px', height: '22px', border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0' };

      const businessInfoBtn = document.createElement('button');
      businessInfoBtn.type = 'button';
      businessInfoBtn.title = '지도에서 업체정보 보기';
      Object.assign(businessInfoBtn.style, popupActionBtnStyle);
      // Fixed, controlled markup (not user text) -- same reasoning as buildPlaceMarkerHtml's own
      // innerHTML use above.
      businessInfoBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 12h4"/><path d="M10 8h4"/><path d="M14 21v-3a2 2 0 0 0-4 0v3"/><path d="M6 10H4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2"/><path d="M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16"/></svg>';
      businessInfoBtn.addEventListener('click', e => {
        e.stopPropagation();
        window.open(getPlaceExternalMapUrl(place), '_blank', 'noopener,noreferrer');
      });
      actionsEl.appendChild(businessInfoBtn);

      const popupCloseBtn = document.createElement('button');
      popupCloseBtn.type = 'button';
      popupCloseBtn.title = '닫기';
      Object.assign(popupCloseBtn.style, popupActionBtnStyle);
      popupCloseBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6l-12 12"/><path d="M6 6l12 12"/></svg>';
      popupCloseBtn.addEventListener('click', e => {
        e.stopPropagation();
        marker.closePopup();
      });
      actionsEl.appendChild(popupCloseBtn);

      headerEl.appendChild(actionsEl);
      popupNode.appendChild(headerEl);

      const memoEntries = parsePlaceMemoEntries(place.memo);
      const displayVisitEntries = sortVisitEntriesRecentFirst(memoEntries.filter(e => e.date));
      const memoWithoutDate = memoEntries.filter(e => !e.date).map(e => e.note).join('\n');

      if (displayVisitEntries.length > 0 || place.memo) {
        const dividerEl = document.createElement('hr');
        dividerEl.style.border = 'none';
        dividerEl.style.borderTop = '1px solid #E2E8F0';
        dividerEl.style.margin = '6px 0';
        popupNode.appendChild(dividerEl);
      }
      if (displayVisitEntries.length > 0) {
        // Bulk-imported places carry their whole visit history in one memo -- show it as an
        // actual scrollable list of {date, note} rows here instead of one long run-on line.
        const historyWrap = document.createElement('div');
        historyWrap.style.marginTop = '4px';
        historyWrap.style.maxHeight = isMobileViewport ? '120px' : '165px';
        historyWrap.style.overflowY = 'auto';
        historyWrap.style.webkitOverflowScrolling = 'touch';
        historyWrap.style.display = 'flex';
        historyWrap.style.flexDirection = 'column';
        historyWrap.style.gap = '4px';
        displayVisitEntries.forEach((entry, idx) => {
          const rowEl = document.createElement('div');
          rowEl.style.fontSize = '0.72rem';
          rowEl.style.color = '#334155';
          rowEl.style.padding = '4px 0';
          rowEl.style.cursor = 'pointer';
          rowEl.title = `${formatPlaceBadgeDate(entry.date) || entry.date} 일정 열기`;
          rowEl.addEventListener('click', (e) => {
            e.stopPropagation();
            if (typeof onSelectDate === 'function' && entry.date) {
              onSelectDate(entry.date);
            }
          });

          if (isMobileViewport) {
            // Mobile layout: Date one line, note next line, separator line at the bottom
            const dateEl = document.createElement('div');
            dateEl.textContent = formatPlaceBadgeDate(entry.date) || entry.date;
            dateEl.style.fontWeight = '700';
            dateEl.style.color = '#64748B';
            dateEl.style.marginBottom = '2px';
            rowEl.appendChild(dateEl);

            const noteEl = document.createElement('div');
            noteEl.textContent = entry.note;
            noteEl.style.color = '#334155';
            rowEl.appendChild(noteEl);

            if (idx < displayVisitEntries.length - 1) {
              const divider = document.createElement('div');
              divider.style.borderTop = '1px solid #E2E8F0';
              divider.style.margin = '6px 0 2px 0';
              rowEl.appendChild(divider);
            }
          } else {
            // PC layout: Side-by-side (flex)
            rowEl.style.display = 'flex';
            rowEl.style.gap = '8px';
            rowEl.style.alignItems = 'flex-start';

            const dateEl = document.createElement('span');
            dateEl.textContent = formatPlaceBadgeDate(entry.date) || entry.date;
            dateEl.style.flexShrink = '0';
            dateEl.style.fontWeight = '700';
            dateEl.style.color = '#64748B';
            rowEl.appendChild(dateEl);

            const noteEl = document.createElement('span');
            noteEl.textContent = entry.note;
            rowEl.appendChild(noteEl);
          }
          historyWrap.appendChild(rowEl);
        });
        popupNode.appendChild(historyWrap);
      } else if (memoWithoutDate) {
        // Built via DOM nodes (not innerHTML) since memo is free-text user input -- the URL
        // portion still gets the same gray capsule badge look as renderTextWithUrlBadge, just
        // hand-built here since Leaflet popups render outside React's tree.
        const memoWrap = document.createElement('div');
        memoWrap.style.fontSize = '0.75rem';
        memoWrap.style.color = '#334155';
        memoWrap.style.marginTop = '4px';
        memoWrap.style.display = 'flex';
        memoWrap.style.flexWrap = 'wrap';
        memoWrap.style.alignItems = 'center';
        memoWrap.style.gap = '4px';
        const memoUrl = extractFirstUrl(memoWithoutDate);
        const memoText = memoUrl ? removeFirstUrl(memoWithoutDate) : memoWithoutDate;
        if (memoText) {
          const textEl = document.createElement('span');
          textEl.textContent = memoText;
          memoWrap.appendChild(textEl);
        }
        if (memoUrl) {
          const urlEl = document.createElement('a');
          urlEl.href = memoUrl;
          urlEl.target = '_blank';
          urlEl.rel = 'noopener noreferrer';
          urlEl.textContent = memoUrl;
          urlEl.style.display = 'inline-block';
          urlEl.style.padding = '2px 8px';
          urlEl.style.borderRadius = 'var(--radius-full)';
          urlEl.style.fontSize = '0.68rem';
          urlEl.style.fontWeight = '600';
          urlEl.style.backgroundColor = '#E2E8F0';
          urlEl.style.color = '#475569';
          urlEl.style.textDecoration = 'none';
          urlEl.style.wordBreak = 'break-all';
          memoWrap.appendChild(urlEl);
        }
        popupNode.appendChild(memoWrap);
      }
      // closeButton disabled -- popupCloseBtn above replaces it with one that matches this app's
      // own icon styling. maxWidth wider on desktop (PC 가로폭 확장 요청) and capped at ~80% of
      // the viewport on mobile instead of a fixed pixel width, matching the isMobileViewport
      // pattern already used for fitBounds below.
      marker.bindPopup(popupNode, {
        closeButton: false,
        closeOnClick: false,
        minWidth: 220,
        maxWidth: isMobileViewport ? Math.round(window.innerWidth * 0.82) : 460,
        maxHeight: isMobileViewport ? 220 : 320,
        // Leaflet's own autoPan and our panMapToFitMarkerPopup/centerMapOnMarkerAndPopup calls
        // (fired right after every openPopup()) both try to keep the popup on screen -- leaving
        // autoPan on let the two race, each measuring the popup mid-way through the other's
        // pan and sometimes settling in a visibly wrong spot. Disabling it makes our own
        // functions, which account for the marker's position too (not just the popup's), the
        // single source of truth for where the map ends up.
        autoPan: false,
        keepInView: false
      });
      if (onSelectPlace) marker.on('click', () => onSelectPlace(place, { fromMap: true }));
      marker.addTo(layer);
      bounds.push([place.lat, place.lng]);
    });
    // The main-screen preview map opts into this: an imported travel log can mix a handful of
    // overseas trips into an otherwise domestic cluster, and fitting bounds over every single pin
    // would zoom out to "half of Asia" just to include one of them. Restricting to domestic
    // points (and trimming outliers within Korea) keeps the default view centered on wherever
    // most of the pins actually are, capped at roughly peninsula-wide as the widest it goes.
    const fitBoundsPoints = preferDomesticBounds
      ? (() => {
          const domestic = bounds.filter(([lat, lng]) => isDomesticLatLng(lat, lng));
          return domestic.length > 0 ? trimLatLngOutliers(domestic) : bounds;
        })()
      : bounds;
    // A narrow phone viewport has much less room than the padding/maxZoom values below assume,
    // so the same fitBounds fit reads as "too zoomed in" -- pins near the fitted edge end up
    // hidden under the header/list below the map. Backing off one zoom level and padding out
    // further on mobile keeps more of the cluster in frame.
    const isMobileViewport = window.innerWidth <= 720;
    // Focused place: do not re-center on marker rebuild (lets user drag after select).
    if (focusPlace && focusPlace.id) {
      const focused = markersByIdRef.current.get(focusPlace.id);
      if (focused) {
        requestAnimationFrame(() => {
          try { focused.openPopup(); } catch (e) {}
        });
      }
    } else if (fitBoundsPoints.length === 1) {
      mapRef.current.setView(fitBoundsPoints[0], isMobileViewport ? 14 : 15);
    } else if (fitBoundsPoints.length > 1) {
      mapRef.current.fitBounds(fitBoundsPoints, {
        padding: isMobileViewport ? [50, 70] : [30, 30],
        maxZoom: isMobileViewport ? 15 : 16
      });
    } else if (preferDomesticBounds) {
      mapRef.current.setView(PLACE_MAP_DEFAULT_CENTER, 10); // 등록된 장소가 없을 때는 서울 중심으로 표시
    } else {
      mapRef.current.setView(PLACE_MAP_DEFAULT_CENTER, PLACE_MAP_DEFAULT_ZOOM);
    }
  }, [ready, places, calendar, preferDomesticBounds]);

  // Pans/zooms straight to a single place's marker and opens its popup -- driven by PlacesView's
  // list rows (clicking one focuses that place's pin here) rather than by anything inside this
  // component itself. `focusPlace` carries a monotonic `token` alongside the place id so clicking
  // the SAME row twice in a row still re-triggers the pan even though the id didn't change.
  const lastFocusTokenRef = React.useRef(null);
  React.useEffect(() => {
    if (!ready || !mapRef.current) return;
    if (!focusPlace || !focusPlace.id) {
      try { mapRef.current.closePopup(); } catch (e) {}
      lastFocusTokenRef.current = null;
      return;
    }
    if (lastFocusTokenRef.current === focusPlace.token) return;
    lastFocusTokenRef.current = focusPlace.token;
    const marker = markersByIdRef.current.get(focusPlace.id);
    if (!marker) return;
    if (focusPlace.fromMap) {
      // Clicked directly on a pin that's already on screen -- just open its popup and nudge
      // the view only if that popup would otherwise clip against the map edge, rather than
      // re-centering the whole map around a marker the user can already see.
      try { marker.openPopup(); } catch (e) {}
      requestAnimationFrame(() => panMapToFitMarkerPopup(mapRef.current, marker, { animate: true }));
      return;
    }
    const performFocus = () => {
      if (!mapRef.current) return;
      const map = mapRef.current;
      const zoom = 16;
      map.setView(marker.getLatLng(), zoom, { animate: false });
      requestAnimationFrame(() => {
        try { marker.openPopup(); } catch (e) {}
        // Re-center on the marker+popup as one combined block (not just the marker's own
        // point) once the popup has actually rendered and its real size is known -- a plain
        // marker-centered setView above would leave the popup, which opens upward from the
        // pin, pushed off toward one edge instead of the whole pin+bubble sitting mid-screen.
        centerMapOnMarkerAndPopup(map, marker, { animate: true });
      });
    };

    const layer = markersLayerRef.current;
    if (layer && typeof layer.getVisibleParent === 'function') {
      const parent = layer.getVisibleParent(marker);
      if (parent && parent !== marker && typeof layer.zoomToShowLayer === 'function') {
        layer.zoomToShowLayer(marker, performFocus);
        return;
      }
    }
    performFocus();
  }, [ready, focusPlace]);

  // Container size changes (the section's collapse/expand aspect-ratio toggle & window resize)
  // fire size changes. Leaflet's internal tile grid goes stale unless invalidateSize() is called.
  React.useEffect(() => {
    const triggerInvalidate = () => {
      if (mapRef.current) {
        try { mapRef.current.invalidateSize({ animate: false }); } catch (e) {}
      }
    };
    triggerInvalidate();
    const t1 = setTimeout(triggerInvalidate, 50);
    const t2 = setTimeout(triggerInvalidate, 200);
    const t3 = setTimeout(triggerInvalidate, 500);
    const t4 = setTimeout(triggerInvalidate, 1000);
    window.addEventListener('resize', triggerInvalidate);
    let observer = null;
    if (typeof ResizeObserver !== 'undefined' && containerRef.current) {
      observer = new ResizeObserver(() => {
        triggerInvalidate();
      });
      observer.observe(containerRef.current);
    }
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      window.removeEventListener('resize', triggerInvalidate);
      if (observer) observer.disconnect();
    };
  }, [ready, resizeSignal]);

  if (loadError) {
    return /*#__PURE__*/React.createElement("div", {
      style: { width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', backgroundColor: '#F1F5F9' }
    }, "지도를 불러오지 못했습니다.");
  }

  return /*#__PURE__*/React.createElement("div", {
    ref: containerRef,
    // Leaflet's internal panes/controls use z-index values up to 1000, and this div (once
    // Leaflet turns it into .leaflet-container) has no z-index of its own -- without one, it
    // never opens its own stacking context, so those high z-indexes compare directly against
    // sibling elements outside the map (like the map-expand grip button below) and win despite
    // the button's explicit z-index. Giving the container a z-index here contains Leaflet's
    // internals inside their own stacking context so the button's z-index actually applies.
    style: { width: '100%', height: '100%', backgroundColor: 'var(--border-subtle)', position: 'relative', zIndex: 1 }
  }, !ready && /*#__PURE__*/React.createElement("div", {
    style: { width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }
  }, "지도를 불러오는 중..."));
}

export function PlacesView({
  onOpenAppSettings, onChangeView, chatCount = 0, settlementBadge = null, galleryCount = 0, placeCount = 0, memoCount = 0, chatLastAuthor = null, settlementLastDate = null, galleryLastDate = null, placeLastName = null, memoLastTitleWord = null, calendar, onBack, onSavePlace, onDeletePlace, showToast, onRequestConfirm, placesInitialQuery, setPlacesInitialQuery, isDarkTheme, onToggleTheme, fontScalePercent, onDecreaseFont, onIncreaseFont, isChatNotifyEnabled, onToggleChatNotifications, onSharePlaces, onSelectDate, syncStatus = null }) {
  const React = window.React;
  const __deps = window.GATHER_UI_DEPS || {};
  const __comp = window.GATHER_UI_COMPONENTS || {};
  const PlaceMapView = __comp.PlaceMapView || __deps.PlaceMapView;
  const PlaceRegisterModal = __comp.PlaceRegisterModal || __deps.PlaceRegisterModal || (typeof window !== 'undefined' && window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.PlaceRegisterModal);
  const SearchCategoryTabs = __deps.SearchCategoryTabs;
  const SimpleBottomSheetPicker = __deps.SimpleBottomSheetPicker;
  const PlaceCategoryMarkerIcon = __deps.PlaceCategoryMarkerIcon;
  const InlineSearchBar = __comp.InlineSearchBar || __deps.InlineSearchBar;
  const SharedSideMenuSettings = __comp.SharedSideMenuSettings || __deps.SharedSideMenuSettings;
  const SharedSideMenuFooter = __comp.SharedSideMenuFooter || __deps.SharedSideMenuFooter;
  const SharedAppNavBlock = __comp.SharedAppNavBlock || __deps.SharedAppNavBlock;
  const WeatherBadge = __comp.WeatherBadge || __deps.WeatherBadge;
  const SyncStatusChip = __comp.SyncStatusChip || __deps.SyncStatusChip;
  const SyncStatusBanner = __comp.SyncStatusBanner || __deps.SyncStatusBanner;
  const BackArrowIcon = __deps.BackArrowIcon;
  const BuildingIcon = __deps.BuildingIcon;
  const PencilIcon = __deps.PencilIcon;
  const SearchIcon = __deps.SearchIcon;
  const SmallXIcon = __deps.SmallXIcon;
  const TrashIcon = __comp.TrashIcon || __deps.TrashIcon;
  const ThreeLinesIcon = __deps.ThreeLinesIcon;
  const getCalendarPlaces = __deps.getCalendarPlaces;
  const getPlaceCategories = __deps.getPlaceCategories;
const getPlaceSortDateKey = __deps.getPlaceSortDateKey;
  const parsePlaceMemoEntries = __deps.parsePlaceMemoEntries;
  const sortVisitEntriesRecentFirst = __deps.sortVisitEntriesRecentFirst;
  const upsertPlaceMemoEntry = __deps.upsertPlaceMemoEntry;
  const removePlaceMemoEntry = __deps.removePlaceMemoEntry;
  const derivePlaceVisitStatus = __deps.derivePlaceVisitStatus;
  const countPlaceVisits = __deps.countPlaceVisits;
  const getPlaceExternalMapUrl = __deps.getPlaceExternalMapUrl;
  const getPlaceKakaoRouteUrl = __deps.getPlaceKakaoRouteUrl;
  const getPlaceNaverRouteUrl = __deps.getPlaceNaverRouteUrl;
  const getPlaceGoogleRouteUrl = __deps.getPlaceGoogleRouteUrl;

  // A plain `const isMobile = window.matchMedia(...).matches` read once per render only reflects
  // reality by accident, whenever some unrelated state change happens to force a re-render after
  // the viewport settles -- on a fresh mobile page load with no such re-render yet, it can stay
  // stuck reporting whatever it evaluated to on the very first pass. Tracked as real state with a
  // matchMedia listener instead, so it updates the moment the viewport actually crosses the
  // breakpoint (load, rotation, resize) regardless of what else is re-rendering this component.
  // 720px, not 640px, to match this file's own isMobileViewport breakpoint (used for the map's
  // fitBounds zoom) and the place-category-tabs-desktop-only/place-category-select-mobile-only
  // CSS media queries below -- the previous 640px here disagreed with both, so a viewport between
  // 640-720px got neither the desktop nor the mobile category bar rendered by React at all.
  const [isMobile, setIsMobile] = React.useState(() => typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(max-width: 720px)').matches);
  React.useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined;
    const mq = window.matchMedia('(max-width: 720px)');
    const handleChange = () => setIsMobile(mq.matches);
    handleChange();
    if (mq.addEventListener) mq.addEventListener('change', handleChange);
    else if (mq.addListener) mq.addListener(handleChange);
    return () => {
      if (mq.removeEventListener) mq.removeEventListener('change', handleChange);
      else if (mq.removeListener) mq.removeListener(handleChange);
    };
  }, []);

  const [isRegisterOpen, setIsRegisterOpen] = React.useState(false);
  const [editingPlace, setEditingPlace] = React.useState(null);
  const [categoryFilter, setCategoryFilter] = React.useState('all');
  const [visitFilter, setVisitFilter] = React.useState('all'); // 'all', 'visited', 'planned'
  const [mapExpanded, setMapExpanded] = React.useState(false);
  // { id, token } for PlaceMapView's focus effect -- token increments on every select so clicking
  // the same list row twice in a row still re-triggers the pan/zoom even though id didn't change.
  const [focusPlace, setFocusPlace] = React.useState(null);
  const focusTokenRef = React.useRef(0);
  const scrollBodyRef = React.useRef(null);
  
  // Refined: Header search and Map drag height states
  const [listSearchQuery, setListSearchQuery] = React.useState('');
  const [isPlacesMenuOpen, setIsPlacesMenuOpen] = React.useState(false);
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);
  // Per-date memo entry being edited inline (comment-style), keyed `${placeId}::${entry.date}` so
  // only one entry across all place cards is in edit mode at a time.
  const [editingMemoEntryKey, setEditingMemoEntryKey] = React.useState(null);
  const [editingMemoEntryText, setEditingMemoEntryText] = React.useState('');
  const listScrollAnimRef = React.useRef(0);

  React.useEffect(() => {
    if (placesInitialQuery) {
      setListSearchQuery(placesInitialQuery);
      setIsSearchOpen(true);
      setCategoryFilter('all');
      setPlacesInitialQuery('');
    }
  }, [placesInitialQuery, setPlacesInitialQuery]);
  const [mapHeight, setMapHeight] = React.useState(Math.round(window.innerHeight * 0.4));
  
  const isDraggingRef = React.useRef(false);
  const startYRef = React.useRef(0);
  const startHeightRef = React.useRef(mapHeight);
  const mapHeightRef = React.useRef(mapHeight);
  
  React.useEffect(() => {
    mapHeightRef.current = mapHeight;
  }, [mapHeight]);

  const handleDragStart = e => {
    isDraggingRef.current = true;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    startYRef.current = clientY;
    startHeightRef.current = mapHeightRef.current;
    
    document.addEventListener('mousemove', handleDragMove);
    document.addEventListener('mouseup', handleDragEnd);
    document.addEventListener('touchmove', handleDragMove, { passive: false });
    document.addEventListener('touchend', handleDragEnd);
  };

  const handleDragMove = e => {
    if (!isDraggingRef.current) return;
    if (e.cancelable) e.preventDefault();
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const deltaY = clientY - startYRef.current;
    const nextHeight = Math.max(160, Math.min(window.innerHeight - 220, startHeightRef.current + deltaY));
    setMapHeight(nextHeight);
  };

  const handleDragEnd = () => {
    isDraggingRef.current = false;
    document.removeEventListener('mousemove', handleDragMove);
    document.removeEventListener('mouseup', handleDragEnd);
    document.removeEventListener('touchmove', handleDragMove);
    document.removeEventListener('touchend', handleDragEnd);
  };

  React.useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleDragMove);
      document.removeEventListener('mouseup', handleDragEnd);
      document.removeEventListener('touchmove', handleDragMove);
      document.removeEventListener('touchend', handleDragEnd);
    };
  }, []);

  const places = getCalendarPlaces(calendar);
  const categories = getPlaceCategories(calendar);
  const categoryMap = categories.reduce((acc, c) => { acc[c.id] = c; return acc; }, {});

  const handleOpenRegister = () => {
    setEditingPlace(null);
    setIsRegisterOpen(true);
  };
  const handleEditPlace = place => {
    setEditingPlace(place);
    setIsRegisterOpen(true);
  };

  // Per-date memo entry edit/delete -- mirrors MemoCard's comment edit/delete (ui-calendar-core.js)
  // but without a participant field, since a place-memo entry isn't attributed to one person.
  const handleStartEditPlaceMemoEntry = (place, entry) => {
    setEditingMemoEntryKey(`${place.id}::${entry.date}`);
    setEditingMemoEntryText(entry.note || '');
  };
  const handleCancelEditPlaceMemoEntry = () => {
    setEditingMemoEntryKey(null);
    setEditingMemoEntryText('');
  };
  const handleSavePlaceMemoEntry = async (place, entry) => {
    const text = editingMemoEntryText.trim();
    if (!text) return;
    const nextMemo = upsertPlaceMemoEntry(place.memo || '', entry.date, text);
    const ok = await Promise.resolve(onSavePlace({
      id: place.id, name: place.name, alias: place.alias || '',
      address: place.address || '', lat: place.lat, lng: place.lng,
      categoryId: place.categoryId || 'etc', memo: nextMemo,
      visitStatus: place.visitStatus === 'planned' ? 'planned' : 'visited',
      visitDate: place.visitDate || ''
    }));
    if (ok !== false) {
      showToast('메모가 수정되었습니다.', 'success');
      setEditingMemoEntryKey(null);
      setEditingMemoEntryText('');
    } else {
      showToast('메모 수정에 실패했습니다.', 'error');
    }
  };
  const handleDeletePlaceMemoEntry = (place, entry) => {
    const label = formatPlaceBadgeDate(entry.date) || entry.date;
    const placeSnapshot = JSON.parse(JSON.stringify(place));
    onRequestConfirm('메모 삭제', `"${label}" 메모를 삭제하시겠습니까?`, async () => {
      const nextMemo = removePlaceMemoEntry(place.memo || '', entry.date);
      const ok = await Promise.resolve(onSavePlace({
        id: place.id, name: place.name, alias: place.alias || '',
        address: place.address || '', lat: place.lat, lng: place.lng,
        categoryId: place.categoryId || 'etc', memo: nextMemo,
        visitStatus: place.visitStatus === 'planned' ? 'planned' : 'visited',
        visitDate: place.visitDate || ''
      }));
      if (ok !== false) {
        showToast('메모가 삭제되었습니다.', 'delete', 5000, async () => {
          const restored = await Promise.resolve(onSavePlace(placeSnapshot));
          if (restored !== false) {
            showToast('메모 삭제를 되돌렸습니다.', 'success', 3000);
          } else {
            showToast('메모 복원 실패', 'error', 4000);
          }
        });
        if (editingMemoEntryKey === `${place.id}::${entry.date}`) {
          setEditingMemoEntryKey(null);
          setEditingMemoEntryText('');
        }
      } else {
        showToast('메모 삭제에 실패했습니다.', 'error');
      }
    });
  };

  // Click on list item focuses marker. Since scrollBodyRef scrolls only the place list container
  // now, scrolling is focused on list container or we can ignore scrolling if map is fixed!
  // Wait, let's keep the smooth scroll to top of list container if list scrolls.
  const animateListScrollTo = React.useCallback((container, targetTop, durationMs = 220) => {
    if (!container) return;
    const reduceMotion = typeof window !== 'undefined'
      && window.matchMedia
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion || durationMs <= 0) {
      container.scrollTop = targetTop;
      return;
    }
    const startTop = container.scrollTop;
    const delta = targetTop - startTop;
    if (Math.abs(delta) < 4) {
      container.scrollTop = targetTop;
      return;
    }
    const token = ++listScrollAnimRef.current;
    const startTime = performance.now();
    const easeOutCubic = t => 1 - Math.pow(1 - t, 3);
    const step = now => {
      if (listScrollAnimRef.current !== token) return;
      const progress = Math.min(1, (now - startTime) / durationMs);
      container.scrollTop = startTop + (delta * easeOutCubic(progress));
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };
    requestAnimationFrame(step);
  }, []);

  const handleSelectPlaceOnMap = (place, options = {}) => {
    if (!place || !place.id) return;
    focusTokenRef.current += 1;
    const fromMap = !!(options && options.fromMap);

    // When selected from map marker, un-filter so the place card is guaranteed to be rendered in list
    if (fromMap) {
      if (categoryFilter !== 'all' && place.categoryId !== categoryFilter) {
        setCategoryFilter('all');
      }
      if (visitFilter === 'planned' && place.visitStatus !== 'planned') {
        setVisitFilter('all');
      } else if (visitFilter === 'visited' && place.visitStatus === 'planned') {
        setVisitFilter('all');
      }
      if (listSearchQuery.trim()) {
        const queryLower = listSearchQuery.toLowerCase().trim();
        const matchName = place.name && place.name.toLowerCase().includes(queryLower);
        const matchAlias = place.alias && place.alias.toLowerCase().includes(queryLower);
        const matchAddress = place.address && place.address.toLowerCase().includes(queryLower);
        const matchMemo = place.memo && place.memo.toLowerCase().includes(queryLower);
        if (!matchName && !matchAlias && !matchAddress && !matchMemo) {
          setListSearchQuery('');
        }
      }
    }

    setFocusPlace({ id: place.id, token: focusTokenRef.current, fromMap });
  };

  // Scroll list container whenever focusPlace updates and DOM is rendered
  React.useEffect(() => {
    if (!focusPlace || !focusPlace.id) return;
    const targetId = focusPlace.id;
    let attempts = 0;

    const tryScroll = () => {
      const container = scrollBodyRef.current;
      if (!container) return;
      const safeId = (window.CSS && CSS.escape) ? CSS.escape(String(targetId)) : String(targetId).replace(/"/g, '');
      const row = container.querySelector('[data-place-id="' + safeId + '"]');
      if (!row) {
        if (attempts < 10) {
          attempts++;
          setTimeout(tryScroll, 40);
        }
        return;
      }

      // Exact pixel position inside scroll container
      const containerRect = container.getBoundingClientRect();
      const rowRect = row.getBoundingClientRect();
      const relativeTop = rowRect.top - containerRect.top + container.scrollTop;
      // Target top leaves a comfortable 12px top margin inside the list container so top border & tags are 100% visible
      const targetTop = Math.max(0, relativeTop - 12);
      const maxTop = Math.max(0, container.scrollHeight - container.clientHeight);
      const finalTop = Math.min(maxTop, targetTop);

      animateListScrollTo(container, finalTop, 220);
    };

    const timer = setTimeout(tryScroll, 30);
    return () => clearTimeout(timer);
  }, [focusPlace, animateListScrollTo]);
  const handleCloseModal = () => {
    setIsRegisterOpen(false);
    setEditingPlace(null);
  };

  // Most recent visit date first, oldest last
  const sortedPlaces = [...places].sort((a, b) => {
    const dateA = getPlaceSortDateKey(a);
    const dateB = getPlaceSortDateKey(b);
    if (dateA && dateB) return dateB.localeCompare(dateA);
    if (dateA && !dateB) return -1;
    if (!dateA && dateB) return 1;
    return (b.updatedAt || 0) - (a.updatedAt || 0);
  });
  
  // Feeds the "전체 N" badge and countsByCategory below -- both need to move together with
  // visitFilter (전체/방문/예정), not just listSearchQuery, or clicking 방문/예정 changes which
  // place cards actually show (see filteredPlaces below) while every badge next to it keeps
  // showing the unfiltered total, which is what this used to do.
  const searchedPlaces = React.useMemo(() => {
    return places.filter(p => {
      const isPlanned = p.visitStatus === 'planned';
      if (visitFilter === 'visited' && isPlanned) return false;
      if (visitFilter === 'planned' && !isPlanned) return false;
      if (!listSearchQuery.trim()) return true;
      const queryLower = listSearchQuery.toLowerCase().trim();
      const matchName = p.name && p.name.toLowerCase().includes(queryLower);
      const matchAlias = p.alias && p.alias.toLowerCase().includes(queryLower);
      const matchAddress = p.address && p.address.toLowerCase().includes(queryLower);
      const matchMemo = p.memo && p.memo.toLowerCase().includes(queryLower);
      return matchName || matchAlias || matchAddress || matchMemo;
    });
  }, [places, listSearchQuery, visitFilter]);

  const countsByCategory = React.useMemo(() => {
    return searchedPlaces.reduce((acc, p) => {
      acc[p.categoryId] = (acc[p.categoryId] || 0) + 1;
      return acc;
    }, {});
  }, [searchedPlaces]);
  
  // Filter by category filter, visit status filter, AND listSearchQuery query!
  const filteredPlaces = sortedPlaces.filter(p => {
    if (categoryFilter !== 'all' && p.categoryId !== categoryFilter) return false;
    const isPlanned = p.visitStatus === 'planned';
    if (visitFilter === 'visited' && isPlanned) return false;
    if (visitFilter === 'planned' && !isPlanned) return false;
    if (listSearchQuery.trim()) {
      const queryLower = listSearchQuery.toLowerCase().trim();
      const matchName = p.name && p.name.toLowerCase().includes(queryLower);
      const matchAddress = p.address && p.address.toLowerCase().includes(queryLower);
      const matchMemo = p.memo && p.memo.toLowerCase().includes(queryLower);
      return matchName || matchAddress || matchMemo;
    }
    return true;
  });

  return /*#__PURE__*/React.createElement("div", {
    className: "places-view-container",
    style: {
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'var(--bg-primary)',
      display: 'flex', flexDirection: 'column',
      width: '100%', maxWidth: '100%', overflowX: 'hidden'
    }
  },
    /* Header: inline back button, centered title, right action buttons */
    /*#__PURE__*/React.createElement("div", {
      className: "places-view-header",
      style: {
        position: 'relative', height: '56px',
        backgroundColor: 'var(--bg-card)', borderBottom: '1px solid var(--border-subtle)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 16px', zIndex: 1010, flexShrink: 0
      }
    },
      /* Back button inline inside header */
      /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: onBack,
        "aria-label": "뒤로가기",
        style: {
          width: '36px', height: '36px',
          borderRadius: '50%', backgroundColor: 'transparent', border: 'none',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', color: 'var(--text-muted)'
        }
      }, /*#__PURE__*/React.createElement(BackArrowIcon, { size: 22 })),
      
      /* Title */
      /*#__PURE__*/React.createElement("div", {
        style: {
          position: 'absolute', left: '50%', transform: 'translateX(-50%)',
          display: 'flex', alignItems: 'center', fontWeight: 800, fontSize: '0.95rem',
          color: 'var(--text-main)', whiteSpace: 'nowrap', pointerEvents: 'none'
        }
      }, calendar.title, " 장소"),
      
      /* Right Controls: Desktop Visit Filter Toggle + 3-line menu */
      /*#__PURE__*/React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '8px' } },
        /* Desktop Visit Filter Toggle: 전체 | 방문 | 예정 (Only on PC) */
        !isMobile && /*#__PURE__*/React.createElement("div", {
          className: "visit-filter-toggle-desktop",
          style: {
            display: 'flex', alignItems: 'center', gap: '2px',
            backgroundColor: 'var(--bg-primary)', padding: '3px', borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)'
          }
        },
          /*#__PURE__*/React.createElement("button", {
            type: "button",
            onClick: () => setVisitFilter('all'),
            style: {
              padding: '4px 10px', fontSize: '0.75rem', fontWeight: 800, borderRadius: 'var(--radius-sm)', border: 'none', cursor: 'pointer',
              backgroundColor: visitFilter === 'all' ? '#4F46E5' : 'transparent',
              color: visitFilter === 'all' ? '#FFFFFF' : 'var(--text-muted)'
            }
          }, "전체"),
          /*#__PURE__*/React.createElement("button", {
            type: "button",
            onClick: () => setVisitFilter('visited'),
            style: {
              padding: '4px 10px', fontSize: '0.75rem', fontWeight: 800, borderRadius: 'var(--radius-sm)', border: 'none', cursor: 'pointer',
              backgroundColor: visitFilter === 'visited' ? '#4F46E5' : 'transparent',
              color: visitFilter === 'visited' ? '#FFFFFF' : 'var(--text-muted)'
            }
          }, "방문"),
          /*#__PURE__*/React.createElement("button", {
            type: "button",
            onClick: () => setVisitFilter('planned'),
            style: {
              padding: '4px 10px', fontSize: '0.75rem', fontWeight: 800, borderRadius: 'var(--radius-sm)', border: 'none', cursor: 'pointer',
              backgroundColor: visitFilter === 'planned' ? '#4F46E5' : 'transparent',
              color: visitFilter === 'planned' ? '#FFFFFF' : 'var(--text-muted)'
            }
          }, "예정")
        ),
        /* 3-line menu */
        /*#__PURE__*/React.createElement("button", {
          type: "button",
          onClick: () => setIsPlacesMenuOpen(true),
          title: "장소 메뉴",
          "aria-label": "장소 메뉴 열기",
          style: {
            background: 'none', border: 'none', cursor: 'pointer', padding: '6px',
            color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }
        }, /*#__PURE__*/React.createElement(ThreeLinesIcon, { size: 22 }))
      )
    ),
    /* Slide-down search input bar (shared InlineSearchBar) */
    isSearchOpen && /*#__PURE__*/React.createElement(InlineSearchBar, {
      value: listSearchQuery,
      placeholder: "등록된 장소명 또는 주소 검색...",
      onChange: e => {
        const val = e.target.value;
        setListSearchQuery(val);
        if (val.trim()) setCategoryFilter('all');
      },
      trailing: listSearchQuery ? /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: () => setListSearchQuery(''),
        style: { border: 'none', background: 'none', color: 'var(--text-muted)', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 600, flexShrink: 0 }
      }, "초기화") : null
    }),

    /* Sticky Map Area */
    /*#__PURE__*/React.createElement("div", {
      className: "places-map-sticky-area",
      style: mapExpanded
        ? { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1005 }
        : { position: 'relative', width: '100%', height: `${mapHeight}px`, minHeight: '160px', flexShrink: 0, zIndex: 10 }
    },
      /*#__PURE__*/React.createElement(PlaceMapView, {
        places,
        calendar,
        scrollWheelZoom: true,
        resizeSignal: `${mapExpanded}_${mapHeight}`,
        focusPlace,
        onSelectPlace: handleSelectPlaceOnMap,
        onSelectDate: onSelectDate
      }),
      
      /* Centered Grip Handle + Right Resizer Handle Control Bar */
      /*#__PURE__*/React.createElement("div", {
        style: {
          position: 'absolute', left: 0, right: 0, bottom: 0, height: '32px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 12px', borderTop: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--bg-card)', zIndex: 6, boxSizing: 'border-box'
        }
      },
        /* Left Spacer */
        /*#__PURE__*/React.createElement("div", { style: { width: '32px' } }),
        
        /* Centered expand/collapse button */
        /*#__PURE__*/React.createElement("button", {
          type: "button",
          onClick: () => setMapExpanded(prev => !prev),
          "aria-label": mapExpanded ? '지도 축소' : '지도 확대',
          title: mapExpanded ? '지도 축소' : '지도 확대',
          style: {
            background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px'
          }
        }, mapExpanded ? /*#__PURE__*/React.createElement("svg", {
          xmlns: "http://www.w3.org/2000/svg",
          width: "20",
          height: "20",
          viewBox: "0 0 24 24",
          fill: "none",
          stroke: "currentColor",
          strokeWidth: "2",
          strokeLinecap: "round",
          strokeLinejoin: "round",
          className: "icon icon-tabler icons-tabler-outline icon-tabler-fold-up"
        },
          /*#__PURE__*/React.createElement("path", { stroke: "none", d: "M0 0h24v24H0z", fill: "none" }),
          /*#__PURE__*/React.createElement("path", { d: "M12 13v-8l-3 3m6 0l-3 -3" }),
          /*#__PURE__*/React.createElement("path", { d: "M9 17l1 0" }),
          /*#__PURE__*/React.createElement("path", { d: "M14 17l1 0" }),
          /*#__PURE__*/React.createElement("path", { d: "M19 17l1 0" }),
          /*#__PURE__*/React.createElement("path", { d: "M4 17l1 0" })
        ) : /*#__PURE__*/React.createElement("svg", {
          xmlns: "http://www.w3.org/2000/svg",
          width: "20",
          height: "20",
          viewBox: "0 0 24 24",
          fill: "none",
          stroke: "currentColor",
          strokeWidth: "2",
          strokeLinecap: "round",
          strokeLinejoin: "round",
          className: "icon icon-tabler icons-tabler-outline icon-tabler-fold-down"
        },
          /*#__PURE__*/React.createElement("path", { stroke: "none", d: "M0 0h24v24H0z", fill: "none" }),
          /*#__PURE__*/React.createElement("path", { d: "M12 11v8l3 -3m-6 0l3 3" }),
          /*#__PURE__*/React.createElement("path", { d: "M9 7l1 0" }),
          /*#__PURE__*/React.createElement("path", { d: "M14 7l1 0" }),
          /*#__PURE__*/React.createElement("path", { d: "M19 7l1 0" }),
          /*#__PURE__*/React.createElement("path", { d: "M4 7l1 0" })
        )),
        
        /* Right drag resizer handle (only shown when map is not fullscreen expanded) */
        !mapExpanded ? /*#__PURE__*/React.createElement("div", {
          onMouseDown: handleDragStart,
          onTouchStart: handleDragStart,
          title: "드래그하여 지도 높이 조절",
          style: {
            width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'ns-resize', color: 'var(--text-muted)', userSelect: 'none', touchAction: 'none'
          }
        },
          /* Lucide-style split diagonal resizing arrows */
          /*#__PURE__*/React.createElement("svg", {
            xmlns: "http://www.w3.org/2000/svg",
            width: "20",
            height: "20",
            viewBox: "0 0 24 24",
            fill: "none",
            stroke: "currentColor",
            strokeWidth: "2",
            strokeLinecap: "round",
            strokeLinejoin: "round",
            className: "icon icon-tabler icons-tabler-outline icon-tabler-selector"
          },
            /*#__PURE__*/React.createElement("path", { stroke: "none", d: "M0 0h24v24H0z", fill: "none" }),
            /*#__PURE__*/React.createElement("path", { d: "M8 9l4 -4l4 4" }),
            /*#__PURE__*/React.createElement("path", { d: "M16 15l-4 4l-4 -4" })
          )
        ) : /*#__PURE__*/React.createElement("div", { style: { width: '32px' } })
      )
    ),

    /* Sticky Category Tabs */
    !mapExpanded && categories.length > 0 && /*#__PURE__*/React.createElement("div", {
      className: "places-category-sticky-tabs",
      style: { flexShrink: 0, zIndex: 9, backgroundColor: 'var(--bg-card)', borderBottom: '1px solid var(--border-subtle)' }
    },
      /* Desktop Category Bar (Only on PC) */
      !isMobile && /*#__PURE__*/React.createElement("div", { className: "place-category-tabs-desktop-only" },
        /*#__PURE__*/React.createElement(SearchCategoryTabs, {
          tabs: [
            { key: 'all', label: '전체', count: searchedPlaces.length, color: '#2563EB' },
            ...categories.map(category => ({
              key: category.id,
              label: `${getPlaceCategoryIcon(category)} ${category.name}`,
              count: countsByCategory[category.id] || 0,
              color: category.color
            }))
          ],
          activeKey: categoryFilter,
          onSelect: setCategoryFilter,
          containerStyle: { backgroundColor: 'var(--bg-card)' },
          tabPadding: '12px 4px',
          tabTextStyle: { fontSize: '0.85rem', fontWeight: 700 },
          countBadgeClassName: "section-count-badge"
        })
      ),
      /* Mobile Category Select Box + Visit/Planned Switching Tab (Only on Mobile) */
      isMobile && /*#__PURE__*/React.createElement("div", {
        className: "place-category-select-mobile-only",
        style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', padding: '6px 12px' }
      },
        /*#__PURE__*/React.createElement(SimpleBottomSheetPicker, {
          title: "카테고리 선택",
          value: categoryFilter,
          options: [
            {
              value: 'all',
              label: /*#__PURE__*/React.createElement(React.Fragment, null, "전체 ", /*#__PURE__*/React.createElement("span", {
                style: {
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: '20px', height: '18px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: searchedPlaces.length >= 1 ? '#2563EB' : '#E2E8F0',
                  color: searchedPlaces.length >= 1 ? '#FFFFFF' : '#475569',
                  fontSize: '0.72rem', fontWeight: 'bold', padding: '0 6px', marginLeft: '4px'
                }
              }, searchedPlaces.length))
            },
            ...categories.map(category => {
              const cCount = countsByCategory[category.id] || 0;
              return {
                value: category.id,
                label: /*#__PURE__*/React.createElement(React.Fragment, null,
                  `${getPlaceCategoryIcon(category)} ${category.name} `,
                  /*#__PURE__*/React.createElement("span", {
                    style: {
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: '20px', height: '18px',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: cCount >= 1 ? (category.color || '#2563EB') : '#E2E8F0',
                      color: cCount >= 1 ? '#FFFFFF' : '#475569',
                      fontSize: '0.72rem', fontWeight: 'bold', padding: '0 6px', marginLeft: '4px'
                    }
                  }, cCount)
                )
              };
            })
          ],
          onSelect: setCategoryFilter
        }),
        /* Mobile Switching Tab: 방문 | 예정 -- height matches the 카테고리 select box next to it
           (.form-select's 44px, see app.css) so the two controls line up edge-to-edge. */
        /*#__PURE__*/React.createElement("div", {
          className: "visit-filter-toggle-mobile",
          style: {
            display: 'inline-flex',
            alignItems: 'center',
            height: '44px',
            boxSizing: 'border-box',
            padding: '3px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            backgroundColor: 'var(--bg-card)',
            flexShrink: 0
          }
        },
          /*#__PURE__*/React.createElement("button", {
            type: "button",
            onClick: () => setVisitFilter(prev => prev === 'visited' ? 'all' : 'visited'),
            style: {
              height: '100%',
              boxSizing: 'border-box',
              padding: '0 12px',
              fontSize: '0.8rem',
              fontWeight: 900,
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: visitFilter === 'visited' ? '#4F46E5' : 'transparent',
              color: visitFilter === 'visited' ? '#FFFFFF' : 'var(--text-muted)'
            }
          }, "방문"),
          /*#__PURE__*/React.createElement("div", { style: { width: '1px', height: '14px', backgroundColor: 'var(--border-subtle)', margin: '0 2px' } }),
          /*#__PURE__*/React.createElement("button", {
            type: "button",
            onClick: () => setVisitFilter(prev => prev === 'planned' ? 'all' : 'planned'),
            style: {
              height: '100%',
              boxSizing: 'border-box',
              padding: '0 12px',
              fontSize: '0.8rem',
              fontWeight: 900,
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: visitFilter === 'planned' ? '#4F46E5' : 'transparent',
              color: visitFilter === 'planned' ? '#FFFFFF' : 'var(--text-muted)'
            }
          }, "예정")
        )
      )
    ),

    /* Scrollable Cards List Container (Scrolling independently) */
    !mapExpanded && /*#__PURE__*/React.createElement("div", {
      ref: scrollBodyRef,
      style: { flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }
    },
      /* Place cards list layout */
      /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'flex', flexDirection: 'column', gap: '6px', padding: '10px',
          border: 'none', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-card)',
          boxShadow: '0 1px 4px rgba(0,0,0,0.08)'
        }
      },
        filteredPlaces.length === 0 ? /*#__PURE__*/React.createElement("div", {
          style: { padding: '30px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }
        }, places.length === 0 ? "등록된 장소가 없습니다. 우측 상단 아이콘을 눌러 추가해 보세요." : "검색 조건에 맞는 장소가 없습니다.") :
        filteredPlaces.map(place => {
          const category = categoryMap[place.categoryId] || categoryMap.etc;
          const memoEntries = parsePlaceMemoEntries(place.memo);
          const displayVisitEntries = sortVisitEntriesRecentFirst(memoEntries.filter(e => e.date));
          const memoWithoutDate = memoEntries.filter(e => !e.date).map(e => e.note).join('\n');
          const isPlaceFocused = !!(focusPlace && focusPlace.id === place.id);
          return /*#__PURE__*/React.createElement("div", {
            key: place.id,
            // Same purple-border + up/down-shake "you were just brought here" treatment used
            // everywhere else in the app (see chat-search-focused-bubble/chat-search-shake).
            className: "place-card-row" + (isPlaceFocused ? " is-focused chat-search-focused-bubble" : ""),
            "data-place-id": place.id,
            "data-no-press-feedback": true,
            role: "button",
            tabIndex: 0,
            onClickCapture: e => {
              if (e.target && typeof e.target.closest === 'function' && e.target.closest('button, input, textarea, select')) return;
              handleSelectPlaceOnMap(place);
            },
            onKeyDown: (e) => {
              if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'BUTTON')) return;
              if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSelectPlaceOnMap(place); }
            },
            style: {
              display: 'flex', flexDirection: 'column', gap: '4px',
              padding: '10px 12px', position: 'relative',
              border: isPlaceFocused ? '1px solid #8B5CF6' : '1px solid var(--border-subtle)',
              boxShadow: 'none',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              backgroundColor: isPlaceFocused ? 'rgba(139, 92, 246, 0.08)' : 'var(--bg-card)',
              transition: 'border-color 0.15s ease, background-color 0.15s ease'
            }
          },
            /* Top-right absolute action buttons */
            /*#__PURE__*/React.createElement("div", {
              style: { position: 'absolute', top: '8px', right: '8px', display: 'flex', alignItems: 'center', gap: '4px', zIndex: 10 },
              onClick: e => { e.preventDefault(); e.stopPropagation(); },
              onMouseDown: e => e.stopPropagation(),
              onTouchStart: e => e.stopPropagation()
            },
              /*#__PURE__*/React.createElement("button", {
                type: "button",
                onClick: event => {
                  event.preventDefault();
                  event.stopPropagation();
                  const url = getPlaceExternalMapUrl(place);
                  if (url) window.open(url, '_blank', 'noopener,noreferrer');
                },
                title: "업체보기",
                style: {
                  width: '28px', height: '28px',
                  background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0,
                  position: 'relative', zIndex: 11
                }
              }, /*#__PURE__*/React.createElement(BuildingIcon, { size: 14, style: { pointerEvents: 'none' } })),
              /*#__PURE__*/React.createElement("button", {
                type: "button",
                onClick: event => {
                  event.preventDefault();
                  event.stopPropagation();
                  handleEditPlace(place);
                },
                title: "장소 수정",
                style: {
                  width: '28px', height: '28px',
                  background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0,
                  position: 'relative', zIndex: 11
                }
              }, /*#__PURE__*/React.createElement(PencilIcon, { size: 14, style: { pointerEvents: 'none' } }))
            ),
            
            /* Category Label Capsule and Visit Info */
            /*#__PURE__*/React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', paddingRight: '64px' } },
              /*#__PURE__*/React.createElement("span", {
                style: {
                  display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '3px 8px 3px 3px', borderRadius: 'var(--radius-full)',
                  backgroundColor: `${category.color}18`, color: category.color, fontSize: '0.68rem', fontWeight: 900
                }
              },
                /*#__PURE__*/React.createElement("span", {
                  style: {
                    width: '16px', height: '16px', borderRadius: '50%', flexShrink: 0,
                    backgroundColor: place.visitStatus === 'planned' ? '#FFFFFF' : category.color,
                    border: place.visitStatus === 'planned' ? `1px solid ${category.color}` : 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxSizing: 'border-box'
                  }
                }, /*#__PURE__*/React.createElement(PlaceCategoryMarkerIcon, {
                  category,
                  size: 10,
                  strokeColor: place.visitStatus === 'planned' ? category.color : '#fff'
                })),
                category.name
              ),
              /*#__PURE__*/React.createElement("span", {
                style: {
                  fontSize: '0.66rem', fontWeight: 700, padding: '2px 7px', borderRadius: 'var(--radius-full)',
                  backgroundColor: (derivePlaceVisitStatus ? derivePlaceVisitStatus(place) : place.visitStatus) === 'planned' ? 'rgba(59, 130, 246, 0.12)' : 'rgba(16, 185, 129, 0.12)',
                  color: (derivePlaceVisitStatus ? derivePlaceVisitStatus(place) : place.visitStatus) === 'planned' ? '#2563EB' : 'var(--status-green)'
                }
              }, (derivePlaceVisitStatus ? derivePlaceVisitStatus(place) : place.visitStatus) === 'planned' ? '방문예정' : '방문'),
              displayVisitEntries.length > 0 && /*#__PURE__*/React.createElement("span", { style: { fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700 } }, `총 ${countPlaceVisits ? countPlaceVisits(place, displayVisitEntries, category) : displayVisitEntries.length}회 ${(derivePlaceVisitStatus ? derivePlaceVisitStatus(place) : place.visitStatus) === 'planned' ? '방문예정' : '방문'}`)
            ),
            
            /* Name & Address -- alias is the list display name when set; official name shown underneath */
            /*#__PURE__*/React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 } },
              /*#__PURE__*/React.createElement("span", { style: { fontWeight: 800, fontSize: '0.88rem', color: 'var(--text-main)' } }, (place.alias || place.name || '이름 없음')),
              place.alias && place.name && /*#__PURE__*/React.createElement("span", { style: { fontSize: '0.72rem', color: 'var(--text-muted)' } }, place.name),
              place.address && /*#__PURE__*/React.createElement("span", { style: { fontSize: '0.74rem', color: 'var(--text-muted)' } }, getDisplayPlaceAddress(place))
            ),
            
            /* Visits history log (one row per date, newest first) or plain dateless memo --
               each row mirrors MemoCard's comment rows (ui-calendar-core.js): a gray capsule with
               edit/delete, minus the participant dot since a place-memo entry isn't attributed to
               one person. */
                displayVisitEntries.length > 0
              ? /*#__PURE__*/React.createElement("div", {
                  className: "place-memo-stack",
                  style: { display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '2px' },
                  onClick: e => e.stopPropagation()
                }, displayVisitEntries.map((entry, idx) => {
                  const entryKey = `${place.id}::${entry.date}`;
                  const isEditingEntry = editingMemoEntryKey === entryKey;
                  if (isEditingEntry) {
                    return /*#__PURE__*/React.createElement("div", {
                      key: idx,
                      style: { display: 'flex', flexDirection: 'column', gap: '6px', backgroundColor: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', padding: '8px 10px' }
                    },
                      /*#__PURE__*/React.createElement("span", { style: { fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)' } }, formatPlaceBadgeDate(entry.date) || entry.date),
                      /*#__PURE__*/React.createElement("input", {
                        type: "text",
                        value: editingMemoEntryText,
                        autoFocus: true,
                        onChange: e => setEditingMemoEntryText(e.target.value),
                        onKeyDown: e => {
                          e.stopPropagation();
                          if (e.key === 'Enter') {
                            if (e.nativeEvent && e.nativeEvent.isComposing) return;
                            e.preventDefault();
                            handleSavePlaceMemoEntry(place, entry);
                          } else if (e.key === 'Escape') {
                            handleCancelEditPlaceMemoEntry();
                          }
                        },
                        style: { width: '100%', height: '32px', fontSize: '0.8rem', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '0 8px', backgroundColor: 'var(--bg-card)', color: 'var(--text-main)', outline: 'none', boxSizing: 'border-box' }
                      }),
                      /*#__PURE__*/React.createElement("div", { style: { display: 'flex', gap: '6px', justifyContent: 'flex-end' } },
                        /*#__PURE__*/React.createElement("button", {
                          type: "button",
                          onClick: e => { e.stopPropagation(); handleCancelEditPlaceMemoEntry(); },
                          style: { height: '28px', padding: '0 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', background: 'none', color: 'var(--text-muted)', fontSize: '0.76rem', fontWeight: 700, cursor: 'pointer' }
                        }, "취소"),
                        /*#__PURE__*/React.createElement("button", {
                          type: "button",
                          onClick: e => { e.stopPropagation(); handleSavePlaceMemoEntry(place, entry); },
                          disabled: !editingMemoEntryText.trim(),
                          style: { height: '28px', padding: '0 10px', borderRadius: 'var(--radius-sm)', border: 'none', backgroundColor: 'var(--accent-primary)', color: '#FFFFFF', fontSize: '0.76rem', fontWeight: 700, cursor: 'pointer', opacity: editingMemoEntryText.trim() ? 1 : 0.5 }
                        }, "수정")
                      )
                    );
                  }
                  if (isMobile) {
                    return /*#__PURE__*/React.createElement("div", {
                      key: idx,
                      onClick: () => {
                        if (typeof onSelectDate === 'function' && entry.date) {
                          onSelectDate(entry.date);
                        }
                      },
                      title: `${formatPlaceBadgeDate(entry.date) || entry.date} 일정 열기`,
                      className: "place-visit-entry-row-mobile",
                      style: { display: 'flex', flexDirection: 'column', gap: '4px', backgroundColor: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', padding: '8px 10px', cursor: 'pointer' }
                    },
                      /* Line 1: Date on left, Edit/Delete icons on right */
                      /*#__PURE__*/React.createElement("div", {
                        style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }
                      },
                        /*#__PURE__*/React.createElement("span", { className: "place-visit-entry-date", style: { fontWeight: 700, fontSize: '0.74rem', color: 'var(--text-main)' } }, formatPlaceBadgeDate(entry.date) || entry.date),
                        /*#__PURE__*/React.createElement("div", {
                          style: { display: 'flex', alignItems: 'center', gap: '8px' }
                        },
                          /*#__PURE__*/React.createElement("button", {
                            type: "button", onClick: (e) => { e.stopPropagation(); handleStartEditPlaceMemoEntry(place, entry); }, title: "메모 편집", "aria-label": "메모 편집",
                            style: { background: 'none', border: 'none', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center', color: 'var(--text-muted)' }
                          }, /*#__PURE__*/React.createElement(PencilIcon, { size: 14 })),
                          /*#__PURE__*/React.createElement("button", {
                            type: "button", onClick: (e) => { e.stopPropagation(); handleDeletePlaceMemoEntry(place, entry); }, title: "메모 삭제", "aria-label": "메모 삭제",
                            style: { background: 'none', border: 'none', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center', color: 'var(--text-muted)' }
                          }, /*#__PURE__*/React.createElement(TrashIcon, { size: 14 }))
                        )
                      ),
                      /* Line 2: Memo note full width below */
                      entry.note && /*#__PURE__*/React.createElement("div", {
                        style: { fontSize: '0.74rem', color: 'var(--text-main)', wordBreak: 'break-word', lineHeight: 1.45, width: '100%' }
                      }, entry.note)
                    );
                  }

                  return /*#__PURE__*/React.createElement("div", {
                    key: idx,
                    onClick: () => {
                      if (typeof onSelectDate === 'function' && entry.date) {
                        onSelectDate(entry.date);
                      }
                    },
                    title: `${formatPlaceBadgeDate(entry.date) || entry.date} 일정 열기`,
                    className: "place-visit-entry-row-desktop",
                    style: { display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', padding: '6px 10px', cursor: 'pointer' }
                  },
                    /*#__PURE__*/React.createElement("span", { className: "place-visit-entry-date", style: { flexShrink: 0, fontWeight: 700, fontSize: '0.74rem' } }, formatPlaceBadgeDate(entry.date) || entry.date),
                    /*#__PURE__*/React.createElement("span", { style: { flex: 1, minWidth: 0, fontSize: '0.74rem', color: 'var(--text-main)', wordBreak: 'break-word' } }, entry.note),
                    /*#__PURE__*/React.createElement("button", {
                      type: "button", onClick: (e) => { e.stopPropagation(); handleStartEditPlaceMemoEntry(place, entry); }, title: "메모 편집", "aria-label": "메모 편집",
                      style: { background: 'none', border: 'none', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center', color: 'var(--text-muted)', flexShrink: 0 }
                    }, /*#__PURE__*/React.createElement(PencilIcon, { size: 12 })),
                    /*#__PURE__*/React.createElement("button", {
                      type: "button", onClick: (e) => { e.stopPropagation(); handleDeletePlaceMemoEntry(place, entry); }, title: "메모 삭제", "aria-label": "메모 삭제",
                      style: { background: 'none', border: 'none', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center', color: 'var(--text-muted)', flexShrink: 0 }
                    }, /*#__PURE__*/React.createElement(TrashIcon, { size: 12 }))
                  );
                }))
              : memoWithoutDate && /*#__PURE__*/React.createElement("div", { className: "place-memo-stack", style: { fontSize: '0.74rem', color: 'var(--text-main)', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '4px' } }, renderTextWithUrlBadge(memoWithoutDate))
          );
        })
      )
    ),

    isPlacesMenuOpen && /*#__PURE__*/React.createElement("div", {
      className: "admin-side-menu-overlay",
      style: { zIndex: 12000 },
      onClick: () => setIsPlacesMenuOpen(false)
    }, /*#__PURE__*/React.createElement("div", {
      className: "admin-side-menu",
      onClick: e => e.stopPropagation(),
      role: "dialog",
      "aria-label": "장소 메뉴"
    },
      /*#__PURE__*/React.createElement("div", { className: "admin-side-menu-header" },
        /*#__PURE__*/React.createElement("div", { className: "admin-side-menu-brand" },
          /*#__PURE__*/React.createElement("div", { className: "admin-side-menu-copy" },
            /*#__PURE__*/React.createElement("button", {
              type: "button",
              className: "admin-side-menu-title",
              title: "메인 화면으로 이동",
              "aria-label": "메인 화면으로 이동",
              onClick: () => { setIsPlacesMenuOpen(false); if (typeof onChangeView === 'function') onChangeView('calendar'); else if (typeof onBack === 'function') onBack(); },
              style: {
                background: 'none', border: 'none', padding: 0, margin: 0,
                color: 'var(--text-main)', fontSize: '1.05rem', fontWeight: 800, cursor: 'pointer'
              }
            }, "장소")
          )
        ),
        /*#__PURE__*/React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 } },
          WeatherBadge ? /*#__PURE__*/React.createElement(WeatherBadge, { weatherLocation: calendar && calendar.weatherLocation }) : null,
          /*#__PURE__*/React.createElement("button", {
            type: "button", className: "admin-side-menu-close-btn",
            title: "메뉴 닫기", "aria-label": "메뉴 닫기",
            onClick: () => setIsPlacesMenuOpen(false)
          }, /*#__PURE__*/React.createElement(SmallXIcon, { size: 20 }))
        )
      ),
      /*#__PURE__*/React.createElement("div", { className: "admin-side-menu-list" },
        /*#__PURE__*/React.createElement("button", {
          type: "button", className: "admin-side-menu-item",
          onClick: () => { setIsPlacesMenuOpen(false); setIsSearchOpen(true); }
        },
          /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-icon" }, /*#__PURE__*/React.createElement(SearchIcon, null)),
          /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-copy" },
            /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-title" }, "장소 검색"),
            /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-desc" }, "등록된 장소명·주소 검색")
          )
        ),
        /*#__PURE__*/React.createElement("button", {
          type: "button", className: "admin-side-menu-item",
          onClick: () => { setIsPlacesMenuOpen(false); handleOpenRegister(); }
        },
          /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-icon" }, /*#__PURE__*/React.createElement("svg", {
            xmlns: "http://www.w3.org/2000/svg", width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round"
          }, /*#__PURE__*/React.createElement("path", { d: "M5 12h14" }), /*#__PURE__*/React.createElement("path", { d: "M12 5v14" }))),
          /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-copy" },
            /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-title" }, "장소 등록"),
            /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-desc" }, "새 장소 추가하기")
          )
        ),
      ),
      typeof SharedAppNavBlock === 'function' && /*#__PURE__*/React.createElement(SharedAppNavBlock, {
        onClose: () => setIsPlacesMenuOpen(false),
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
        onClose: () => setIsPlacesMenuOpen(false),
        onOpenShare: onSharePlaces,
        onOpenSettings: onOpenAppSettings,
        shareLabel: '공유'
      })
    )),
    (() => {
      const PlaceRegisterModalComp = PlaceRegisterModal || (typeof window !== 'undefined' && window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.PlaceRegisterModal) || (typeof window !== 'undefined' && window.GATHER_UI_DEPS && window.GATHER_UI_DEPS.PlaceRegisterModal);
      return isRegisterOpen && PlaceRegisterModalComp ? /*#__PURE__*/React.createElement(PlaceRegisterModalComp, {
        calendar,
        editingPlace,
        onClose: handleCloseModal,
        onSave: onSavePlace,
        onDelete: onDeletePlace,
        showToast,
        onRequestConfirm
      }) : null;
    })()
  );
}

  if (typeof window !== 'undefined') {
  window.GATHER_UI_COMPONENTS = Object.assign({}, window.GATHER_UI_COMPONENTS || {}, {
    PlaceMapView: PlaceMapView,
    PlacesView: PlacesView,
  });
}
