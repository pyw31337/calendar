/**
 * Misc chat/share UI (P4-9)
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


export function UpdateAvailableBanner() {
  const React = window.React;

  const [updateAvailable, setUpdateAvailable] = React.useState(false);
  const [dismissed, setDismissed] = React.useState(false);
  React.useEffect(() => {
    let initialBuildId = null;
    let cancelled = false;
    const extractBuildId = (html) => {
      if (!html || typeof html !== 'string') return null;
      const m = html.match(/app-main-[A-Za-z0-9_-]+\.js/) || html.match(/index-[A-Za-z0-9_-]+\.js/);
      return m ? m[0] : null;
    };
    const currentBuildId = (() => {
      try {
        const scripts = document.querySelectorAll('script[src]');
        for (const s of scripts) {
          const src = s.getAttribute('src') || '';
          const m = src.match(/app-main-[A-Za-z0-9_-]+\.js/);
          if (m) return m[0];
        }
        const links = document.querySelectorAll('link[rel="modulepreload"]');
        for (const l of links) {
          const href = l.getAttribute('href') || '';
          const m = href.match(/app-main-[A-Za-z0-9_-]+\.js/);
          if (m) return m[0];
        }
      } catch (_) {}
      return null;
    })();
    const checkForUpdate = () => {
      fetch(location.href.split('#')[0], { method: 'GET', cache: 'no-store', credentials: 'same-origin' })
        .then(res => res.text())
        .then(html => {
          if (cancelled) return;
          const liveId = extractBuildId(html);
          if (!liveId) return;
          if (initialBuildId === null) initialBuildId = liveId;
          const baseline = currentBuildId || initialBuildId;
          if (baseline && liveId !== baseline) setUpdateAvailable(true);
        })
        .catch(() => {});
    };
    checkForUpdate();
    const intervalId = setInterval(() => {
      if (document.visibilityState === 'visible') checkForUpdate();
    }, 45 * 1000);
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') checkForUpdate();
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('focus', checkForUpdate);
    window.addEventListener('online', checkForUpdate);
    return () => {
      cancelled = true;
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('focus', checkForUpdate);
      window.removeEventListener('online', checkForUpdate);
    };
  }, []);

  if (!updateAvailable || dismissed) return null;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'fixed', left: '50%', bottom: '20px', transform: 'translateX(-50%)',
      zIndex: 100000, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px',
      backgroundColor: '#0F172A', color: '#FFFFFF', padding: '10px 12px 10px 16px',
      borderRadius: 'var(--radius-md)', boxShadow: '0 12px 32px rgba(0,0,0,0.28)',
      fontSize: 'var(--font-size-base)', fontWeight: 700, width: '90%', maxWidth: '380px',
      boxSizing: 'border-box'
    }
  },
    /*#__PURE__*/React.createElement("span", { style: { whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } }, "새 버전이 있어요"),
    /*#__PURE__*/React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 } },
      /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: () => window.location.reload(),
        style: {
          backgroundColor: '#4F46E5', color: '#FFFFFF', border: 'none', borderRadius: 'var(--radius-md)',
          padding: '6px 14px', fontSize: 'var(--font-size-md)', fontWeight: 800, cursor: 'pointer', whiteSpace: 'nowrap'
        }
      }, "새로고침"),
      /*#__PURE__*/React.createElement("button", {
        type: "button",
        "aria-label": "닫기",
        onClick: () => setDismissed(true),
        style: {
          background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer',
          padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center'
        }
      }, /*#__PURE__*/React.createElement("svg", {
        xmlns: "http://www.w3.org/2000/svg", width: "16", height: "16", viewBox: "0 0 24 24",
        fill: "none", stroke: "currentColor", strokeWidth: "2.5", strokeLinecap: "round", strokeLinejoin: "round"
      }, /*#__PURE__*/React.createElement("line", { x1: "18", y1: "6", x2: "6", y2: "18" }), /*#__PURE__*/React.createElement("line", { x1: "6", y1: "6", x2: "18", y2: "18" })))
    )
  );
}

// A plain JS style object can't use CSS's @supports fallback cascade the way app.css does (two
// inline style keys of the same name just collapse to the last one -- the '100vh' this used to
// sit next to was always dead code, never an actual fallback) -- pick the right unit once here
// instead, so an engine without dvh support (very old browsers only at this point) still gets a
// valid minHeight rather than none at all.
const SUPPORTS_DVH = typeof CSS !== 'undefined' && typeof CSS.supports === 'function' && CSS.supports('height', '1dvh');

export function ImageShareViewer({ shareId }) {
  const React = window.React;

  const [state, setState] = React.useState({ loading: true, share: null, error: '' });
  React.useEffect(() => {
    let cancelled = false;
    fetchImageShareDocument(shareId).then(share => {
      if (cancelled) return;
      if (!share?.imageUrl) {
        setState({ loading: false, share: null, error: '이미지를 찾지 못했습니다.' });
        return;
      }
      setState({ loading: false, share, error: '' });
    }).catch(err => {
      console.error('Image share load failed:', err);
      if (!cancelled) setState({ loading: false, share: null, error: '이미지를 불러오지 못했습니다.' });
    });
    return () => { cancelled = true; };
  }, [shareId]);

  return /*#__PURE__*/React.createElement("div", {
    style: {
      minHeight: SUPPORTS_DVH ? '100dvh' : '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '16px',
      padding: '20px',
      background: '#111827',
      color: '#FFFFFF',
      boxSizing: 'border-box'
    }
  }, state.loading ? /*#__PURE__*/React.createElement(React.Fragment, null,
    /*#__PURE__*/React.createElement("div", {
      style: { width: '42px', height: '42px', borderRadius: '50%', border: '4px solid rgba(255,255,255,0.22)', borderTopColor: '#FFFFFF', animation: 'spin 0.8s linear infinite' }
    }),
    /*#__PURE__*/React.createElement("div", { style: { fontSize: '0.95rem', fontWeight: 800 } }, "이미지를 불러오는 중입니다...")
  ) : state.error ? /*#__PURE__*/React.createElement(React.Fragment, null,
    /*#__PURE__*/React.createElement("div", { style: { fontSize: '1.05rem', fontWeight: 900 } }, state.error),
    /*#__PURE__*/React.createElement("a", { href: "./", style: { color: '#93C5FD', fontWeight: 800 } }, "캘린더로 돌아가기")
  ) : /*#__PURE__*/React.createElement(React.Fragment, null,
    /*#__PURE__*/React.createElement("img", {
      src: state.share.imageUrl,
      alt: "공유 이미지",
      decoding: "async",
      style: {
        maxWidth: '100%',
        maxHeight: 'calc(100dvh - 96px)',
        objectFit: 'contain',
        borderRadius: 'var(--radius-md)',
        boxShadow: '0 24px 80px rgba(0,0,0,0.35)'
      }
    }),
    /*#__PURE__*/React.createElement("div", {
      style: { fontSize: 'var(--font-size-md)', color: 'rgba(255,255,255,0.72)', textAlign: 'center' }
    }, "모여라 캘린더 공유 이미지")
  ));
}

export function ImageThumbRemoveButton({ onClick, title = '삭제' }) {
  const React = window.React;

  return /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick,
    title,
    "aria-label": title,
    style: {
      position: 'absolute', top: '-6px', right: '-6px',
      width: '18px', height: '18px', borderRadius: '50%',
      backgroundColor: '#475569', border: 'none', cursor: 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 0, color: '#FFFFFF'
    }
  }, /*#__PURE__*/React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg", width: "10", height: "10", viewBox: "0 0 24 24",
    fill: "none", stroke: "#FFFFFF", strokeWidth: "3", strokeLinecap: "round", strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("line", { x1: "18", y1: "6", x2: "6", y2: "18" }), /*#__PURE__*/React.createElement("line", { x1: "6", y1: "6", x2: "18", y2: "18" })));
}

export function InlineSearchBar({
  value,
  onChange,
  placeholder,
  autoFocus = true,
  fixed = false,
  inputRef = null,
  leading = null,
  trailing = null,
  className = '',
  style = null
}) {
  const React = window.React;

  const barStyle = {
    minHeight: '48px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 12px',
    backgroundColor: 'var(--bg-card)',
    borderBottom: '1px solid var(--border-subtle)',
    boxSizing: 'border-box',
    ...(fixed ? {
      position: 'fixed', top: '56px', left: 0, right: 0, zIndex: 1008, flexShrink: 0
    } : { flexShrink: 0, zIndex: 1008 }),
    ...(style || {})
  };
  return /*#__PURE__*/React.createElement("div", {
    className: `inline-search-bar${fixed ? ' is-fixed' : ''}${className ? ' ' + className : ''}`,
    style: barStyle
  },
    leading,
    /*#__PURE__*/React.createElement("div", {
      className: "inline-search-capsule",
      style: {
        flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: '8px',
        height: '36px', padding: '0 12px', borderRadius: 'var(--radius-full)', border: 'none',
        backgroundColor: 'var(--bg-primary)', boxSizing: 'border-box'
      }
    },
      /*#__PURE__*/React.createElement("svg", {
        xmlns: "http://www.w3.org/2000/svg", width: "16", height: "16", viewBox: "0 0 24 24",
        fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round",
        style: { color: 'var(--text-muted)', flexShrink: 0 }, "aria-hidden": true
      },
        /*#__PURE__*/React.createElement("circle", { cx: "11", cy: "11", r: "8" }),
        /*#__PURE__*/React.createElement("path", { d: "m21 21-4.3-4.3" })
      ),
      /*#__PURE__*/React.createElement("input", {
        ref: inputRef, type: "text", className: "inline-search-input",
        placeholder: placeholder, value: value, onChange: onChange, autoFocus: autoFocus,
        style: {
          flex: 1, minWidth: 0, height: '100%', fontSize: 'var(--font-size-base)', padding: 0,
          border: 'none', outline: 'none', background: 'transparent',
          color: 'var(--text-main)', boxShadow: 'none'
        }
      })
    ),
    trailing
  );
}

export function MemoShareModal({ memo, calendarId, onClose, showToast }) {
  const React = window.React;
  const __deps = window.GATHER_UI_DEPS || {};
  const __comp = window.GATHER_UI_COMPONENTS || {};
  const ResizableModalContainer = __comp.ResizableModalContainer || __deps.ResizableModalContainer || (function Shell(p) { return React.createElement('div', p, p.children); });
  const SmallXIcon = __deps.SmallXIcon;
  const getMemoItemShareUrl = __deps.getMemoItemShareUrl;
  const copyTextToClipboard = __deps.copyTextToClipboard;

  const shareUrl = React.useMemo(() => {
    return getMemoItemShareUrl(calendarId, memo.id);
  }, [calendarId, memo.id]);
  const qrDataUrl = React.useMemo(() => {
    if (typeof qrcode === 'undefined') return null;
    try {
      const qr = qrcode(0, 'M');
      qr.addData(shareUrl);
      qr.make();
      return qr.createDataURL(6, 8);
    } catch (e) {
      console.warn('QR code render failed:', e);
      return null;
    }
  }, [shareUrl]);
  return ReactDOM.createPortal(/*#__PURE__*/React.createElement("div", {
    className: "modal-overlay",
    onClick: onClose,
    style: { zIndex: 11000 }
  }, /*#__PURE__*/React.createElement(ResizableModalContainer, {
    className: "modal-container",
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal-header",
    style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' }
  }, /*#__PURE__*/React.createElement("h3", {
    style: { fontSize: '1.1rem', fontWeight: 800 }
  }, "메모 공유 URL"), /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    style: { background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.2rem', cursor: 'pointer', display: 'flex', alignItems: 'center' }
  }, /*#__PURE__*/React.createElement(SmallXIcon, { size: 20 }))), /*#__PURE__*/React.createElement("div", {
    className: "modal-body"
  }, /*#__PURE__*/React.createElement("label", {
    style: { fontSize: 'var(--font-size-base)', fontWeight: 700, color: 'var(--text-muted)' }
  }, memo.title ? `"${memo.title}" 메모 전용 공유 URL` : '이 메모 전용 공유 URL'), /*#__PURE__*/React.createElement("input", {
    type: "text",
    className: "form-input",
    style: { width: '100%' },
    value: shareUrl,
    readOnly: true
  }), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-primary",
    onClick: async () => {
      const ok = await copyTextToClipboard(shareUrl);
      const message = ok ? 'URL이 복사되었습니다!' : '복사에 실패했습니다. URL을 직접 선택해 복사해 주세요.';
      if (showToast) showToast(message, ok ? 'success' : 'error');
      else console.warn(message);
    }
  }, "URL 복사하기"),
  qrDataUrl && /*#__PURE__*/React.createElement("div", {
    style: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', marginTop: '16px' }
  },
    /*#__PURE__*/React.createElement("img", { src: qrDataUrl, alt: "메모 공유 QR코드", style: { borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' } }),
    /*#__PURE__*/React.createElement("span", { style: { fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' } }, "QR코드를 카메라로 스캔해 접속하세요")
  )))), document.body);
}

export function ChatSideMenu({
  onOpenAppSettings,
  onClose,
  onOpenSearch,
  onOpenNoticeSettings,
  onOpenGallery,
  onOpenShare,
  onChangeView,
  chatCount = 0,
  settlementBadge = null,
  galleryCount = 0,
  placeCount = 0,
  memoCount = 0,
  historyCount = 0,
  chatLastAuthor = null,
  settlementLastDate = null,
  galleryLastDate = null,
  placeLastName = null,
  memoLastTitleWord = null,
  weatherLocation = null
}) {
  const React = window.React;
  const __deps = window.GATHER_UI_DEPS || {};
  const __comp = window.GATHER_UI_COMPONENTS || {};
  const SmallXIcon = __deps.SmallXIcon;
  const WeatherBadge = __comp.WeatherBadge || __deps.WeatherBadge;
  const MegaphoneIcon = __deps.MegaphoneIcon;
  const SharedSideMenuSettings = (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.SharedSideMenuSettings) || __deps.SharedSideMenuSettings;
  const SharedSideMenuFooter = (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.SharedSideMenuFooter) || __deps.SharedSideMenuFooter;
  const SharedAppNavBlock = (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.SharedAppNavBlock) || __deps.SharedAppNavBlock;

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
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "admin-side-menu-overlay",
    onClick: onClose
  }, /*#__PURE__*/React.createElement("nav", {
    className: "admin-side-menu" + (isScrollingActive ? " scroll-active" : ""),
    "aria-label": "채팅",
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
            title: "메인 화면으로 이동",
            "aria-label": "메인 화면으로 이동",
            onClick: () => { onClose && onClose(); if (typeof onChangeView === 'function') onChangeView('calendar'); },
            style: {
              background: 'none', border: 'none', padding: 0, margin: 0,
              color: 'inherit',
              cursor: 'pointer', textAlign: 'left'
            }
          }, "채팅")
        )
      ),
        /*#__PURE__*/React.createElement("div", {
          style: { display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }
        },
          WeatherBadge ? /*#__PURE__*/React.createElement(WeatherBadge, { weatherLocation: weatherLocation }) : null,
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
    /*#__PURE__*/React.createElement("div", {
    className: "admin-side-menu-list",
    style: { borderBottom: 'none', paddingTop: '6px' }
  },
      /*#__PURE__*/React.createElement("button", {
        type: "button",
        className: "admin-side-menu-item",
        onClick: () => { onClose(); handle(onOpenSearch); }
      },
        /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-icon" }, /*#__PURE__*/React.createElement("svg", {
          xmlns: "http://www.w3.org/2000/svg", width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2"
        }, /*#__PURE__*/React.createElement("circle", { cx: "11", cy: "11", r: "8" }), /*#__PURE__*/React.createElement("path", { d: "m21 21-4.3-4.3" }))),
        /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-copy" },
          /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-title" }, "대화검색")
        )
      ),
      /*#__PURE__*/React.createElement("button", {
        type: "button",
        className: "admin-side-menu-item",
        onClick: () => { onClose(); handle(onOpenNoticeSettings); }
      },
        /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-icon" }, /*#__PURE__*/React.createElement(MegaphoneIcon, { size: 20 })),
        /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-copy" },
          /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-title" }, "공지사항")
        )
      )
    ),
    typeof SharedAppNavBlock === 'function' && /*#__PURE__*/React.createElement(SharedAppNavBlock, {
      onClose: onClose,
      onChangeView: onChangeView,
      chatCount: chatCount,
      settlementBadge: settlementBadge,
      galleryCount: galleryCount,
      placeCount: placeCount,
      memoCount: memoCount,
      historyCount: historyCount,
      chatLastAuthor: chatLastAuthor,
      settlementLastDate: settlementLastDate,
      galleryLastDate: galleryLastDate,
      placeLastName: placeLastName,
      memoLastTitleWord: memoLastTitleWord
    }),
    typeof SharedSideMenuFooter === 'function' && /*#__PURE__*/React.createElement(SharedSideMenuFooter, {
      onClose: onClose,
      onOpenShare: onOpenShare,
      onOpenSettings: onOpenAppSettings,
      shareLabel: '공유'
    }),
  )));
}

  if (typeof window !== 'undefined') {
  window.GATHER_UI_COMPONENTS = Object.assign({}, window.GATHER_UI_COMPONENTS || {}, {
    UpdateAvailableBanner: UpdateAvailableBanner,
    ImageShareViewer: ImageShareViewer,
    ImageThumbRemoveButton: ImageThumbRemoveButton,
    InlineSearchBar: InlineSearchBar,
    MemoShareModal: MemoShareModal,
    ChatSideMenu: ChatSideMenu,
  });
}
