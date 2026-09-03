/**
 * Place register/edit modal (P4-12)
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
function arePlacesSameLocation(a, b) {
  const f = __gatherUiDeps().arePlacesSameLocation || GATHER_APP_UTILS.arePlacesSameLocation;
  return typeof f === 'function' ? f(a, b) : false;
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
function useModalDirtyGuard(...args) {
  return __gatherUiDeps().useModalDirtyGuard(...args);
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
function sanitizeText(...args) {
  const f = __gatherUiDeps().sanitizeText || GATHER_APP_UTILS.sanitizeText;
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


export function PlaceRegisterModal({ calendar, editingPlace, onClose, onSave, onDelete, showToast, onRequestConfirm }) {
  const React = window.React;
  const __deps = window.GATHER_UI_DEPS || {};
  const __comp = window.GATHER_UI_COMPONENTS || {};
  const ResizableModalContainer = __comp.ResizableModalContainer || __deps.ResizableModalContainer || function Shell(p) { return React.createElement('div', p, p.children); };
  const SmallXIcon = __comp.SmallXIcon || __deps.SmallXIcon || function () { return '×'; };
  const TrashIcon = __comp.TrashIcon || __deps.TrashIcon || function () { return '🗑'; };
  const AutoGrowTextarea = __comp.AutoGrowTextarea || __deps.AutoGrowTextarea;
  const FormAddEditActionButtons = __comp.FormAddEditActionButtons || __deps.FormAddEditActionButtons;
  const PlaceSectionIcon = __comp.PlaceSectionIcon || __deps.PlaceSectionIcon;
  const SegmentedToggle = __comp.SegmentedToggle || __deps.SegmentedToggle;
  const SimpleBottomSheetPicker = __comp.SimpleBottomSheetPicker || __deps.SimpleBottomSheetPicker;
  const getPlaceCategories = __deps.getPlaceCategories || (window.GATHER_APP_UTILS || {}).getPlaceCategories || (() => []);
  const normalizePlaceAddress = __deps.normalizePlaceAddress || (window.GATHER_APP_UTILS || {}).normalizePlaceAddress || (a => a);
  const normalizePlaceDateForSort = __deps.normalizePlaceDateForSort || (window.GATHER_APP_UTILS || {}).normalizePlaceDateForSort || (d => d);
  const extractLeadingMemoDate = __deps.extractLeadingMemoDate || (window.GATHER_APP_UTILS || {}).extractLeadingMemoDate || (() => '');
  const autoGrowTextarea = __deps.autoGrowTextarea || (window.GATHER_APP_UTILS || {}).autoGrowTextarea || (() => {});
  const getPlaceCategoryIcon = __deps.getPlaceCategoryIcon || (window.GATHER_APP_UTILS || {}).getPlaceCategoryIcon || (() => '');
  const firebaseConfig = __deps.firebaseConfig || window.firebaseConfig;
  const KAKAO_CATEGORY_GROUP_TO_PLACE_CATEGORY = __deps.KAKAO_CATEGORY_GROUP_TO_PLACE_CATEGORY || {};

  const categories = getPlaceCategories(calendar);
  const [query, setQuery] = React.useState(editingPlace ? (editingPlace.name || '') : '');
  const [results, setResults] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [selected, setSelected] = React.useState(editingPlace ? {
    name: editingPlace.name, address: editingPlace.address, lat: editingPlace.lat, lng: editingPlace.lng,
    categoryLabel: '', phone: '', url: ''
  } : null);
  const [tourItems, setTourItems] = React.useState([]);
  const [tourLoading, setTourLoading] = React.useState(false);
  const tourGroups = React.useMemo(() => {
    const api = window.GATHER_APP_PLACE_SEARCH;
    return api && typeof api.groupTourItemsByType === 'function'
      ? api.groupTourItemsByType(tourItems)
      : (tourItems.length ? [{ key: 'etc', label: '주변 여행정보', items: tourItems }] : []);
  }, [tourItems]);
  // Display alias (별칭) -- optional nickname shown in lists while official search name stays on the place record.
  const [alias, setAlias] = React.useState(editingPlace ? (editingPlace.alias || '') : '');
  // Reformats an existing multi-visit memo into one line per date entry on open (see
  // reformatMemoIntoDateLines) -- a bulk-imported memo saved as one long run-on line otherwise
  // shows up exactly that way here, making it hard to find/edit any one visit's note.
  const [memo, setMemo] = React.useState(editingPlace ? reformatMemoIntoDateLines(editingPlace.memo || '') : '');
  const memoTextareaRef = React.useRef(null);
  // This modal remounts fresh each time it opens (isRegisterOpen && <PlaceRegisterModal .../>),
  // so a mount-only effect is enough to size an existing place's memo correctly on open.
  React.useEffect(() => autoGrowTextarea(memoTextareaRef.current, 480), []);
  const [categoryId, setCategoryId] = React.useState(editingPlace ? editingPlace.categoryId : (categories[0]?.id || 'etc'));
  const [visitStatus, setVisitStatus] = React.useState(editingPlace ? editingPlace.visitStatus : 'visited');
  const [visitDate, setVisitDate] = React.useState(() => {
    if (editingPlace) return editingPlace.visitDate || '';
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });
  const [saving, setSaving] = React.useState(false);
  const placeDirtySnapshot = () => JSON.stringify([
    query,
    selected ? [selected.id || '', selected.name || '', selected.address || '', selected.lat || '', selected.lng || ''] : '',
    alias,
    memo,
    categoryId,
    visitStatus,
    visitDate
  ]);
  const { requestClose, overlayOnClick } = useModalDirtyGuard(
    onClose,
    onRequestConfirm,
    undefined,
    true,
    placeDirtySnapshot,
    editingPlace?.id || 'new'
  );
  // Which tier of the fallback chain a manual (non-auto) search is currently waiting on --
  // null outside of a manual search. Drives the progress indicator below the search field so a
  // slow tier (e.g. a cold-started googlePlacesSearchProxy) reads as "still working", not frozen.
  const [searchStage, setSearchStage] = React.useState(null);
  const SEARCH_TIER_LABELS = { kakao: '카카오에서 검색 중...', google: '해외 장소 데이터베이스 확인 중...', nominatim: '지도 데이터에서 주소 확인 중...' };

  const searchPlacesWithProviders = async (cleanQuery, options = {}) => {
    const api = window.GATHER_APP_PLACE_SEARCH;
    if (!api || typeof api.searchPlaces !== 'function') return { provider: null, results: [] };
    return api.searchPlaces(cleanQuery, {
      ...options,
      firebaseConfig,
      categoryMap: KAKAO_CATEGORY_GROUP_TO_PLACE_CATEGORY,
      onStage: setSearchStage
    });
  };

  // Tourism enrichment is deliberately read-only and never blocks place saving.
  // If the optional TourAPI secret is absent or the service is unavailable, the
  // normal place workflow remains unchanged.
  React.useEffect(() => {
    const api = window.GATHER_APP_PLACE_SEARCH;
    const lat = Number(selected?.lat);
    const lng = Number(selected?.lng);
    if (!api || typeof api.searchTourInfo !== 'function' || !Number.isFinite(lat) || !Number.isFinite(lng)) {
      setTourItems([]);
      setTourLoading(false);
      return undefined;
    }
    let active = true;
    setTourLoading(true);
    api.searchTourInfo(firebaseConfig, { lat, lng, radius: 5000 })
      .then(items => { if (active) setTourItems(Array.isArray(items) ? items.slice(0, 6) : []); })
      .catch(() => { if (active) setTourItems([]); })
      .finally(() => { if (active) setTourLoading(false); });
    return () => { active = false; };
  }, [selected?.lat, selected?.lng, firebaseConfig?.projectId]);

  // Three-tier fallback chain, cheapest/most-reliable first: Kakao Local (키워드 검색) covers
  // domestic businesses very well and is effectively free at this app's scale, so it's tried
  // first for every search. Kakao is Korea-only, so an empty result there usually means either a
  // typo or (increasingly relevant now that 장소 등록 covers overseas trips too) a place outside
  // Korea -- Google Places picks up that case, since its POI coverage abroad (e.g. Vietnam) is
  // far better than Kakao's or Nominatim's. Nominatim/OSM stays as the last, always-free safety
  // net in case Google Places itself errors or comes up empty too. Kakao and Google both proxy
  // through a Cloud Function (kakaoLocalSearchProxy / googlePlacesSearchProxy) so neither API key
  // ships to the browser, same reasoning as the existing peekalinkProxy for link previews.
  // `auto` distinguishes a debounced as-you-type search (see the effect below) from an explicit
  // button/Enter submit -- an auto search only ever tries Kakao (fast, free, safe to fire on
  // every keystroke pause) and stays quiet on empty query / no-results, since the Google/Nominatim
  // tiers add real latency (and, for Google, real cost) that a live-typing dropdown shouldn't pay
  // on every partial fragment. Explicit submits get the full chain.
  const handleSearch = async (e, auto = false) => {
    if (e) e.preventDefault();
    const cleanQuery = query.trim();
    if (!cleanQuery) {
      if (!auto) showToast('검색할 주소나 업체명을 입력해 주세요.', 'error');
      return;
    }
    setLoading(true);
    try {
      const { results: mapped } = await searchPlacesWithProviders(cleanQuery, { auto });
      setResults(mapped);
      if (mapped.length === 0 && !auto) showToast('검색 결과가 없습니다.', 'info');
    } catch (err) {
      console.error('Place search failed:', err);
      if (!auto) showToast('장소 검색에 실패했습니다.', 'error');
    } finally {
      setLoading(false);
      setSearchStage(null);
    }
  };

  // Live-search-as-you-type, matching how Naver/Kakao map search behaves, instead of requiring an
  // explicit "검색" submit for every query change. Debounced so a fast typist doesn't fire one
  // request per keystroke, skipped entirely right after handleSelectResult fills the field with
  // the chosen result's own name (nothing new to search for at that point).
  const existingPlaceSuggestions = React.useMemo(() => {
    const trimmed = query.trim();
    if (selected && selected.name === trimmed) return [];
    if (trimmed.length < 2) return [];
    const q = trimmed.toLowerCase();
    return getCalendarPlaces(calendar)
      .filter(p => !editingPlace || p.id !== editingPlace.id)
      .filter(p => (p.name || '').toLowerCase().includes(q) || (p.alias || '').toLowerCase().includes(q))
      .slice(0, 8);
  }, [query, selected, calendar, editingPlace]);

  const duplicatePlace = React.useMemo(() => {
    if (!selected || selected.isExistingPlace || selected.mergeTargetId || selected.duplicateDismissed || editingPlace) return null;
    return getCalendarPlaces(calendar).find(place => place.id !== editingPlace?.id && arePlacesSameLocation(place, selected)) || null;
  }, [selected, calendar, editingPlace]);

  const handleSelectExistingPlace = place => {
    const name = place.alias || place.name;
    setSelected({
      id: place.id,
      name,
      address: getDisplayPlaceAddress(place) || place.name || '',
      lat: place.lat,
      lng: place.lng,
      duplicateDismissed: true,
      isExistingPlace: true
    });
    setQuery(name);
    setResults([]);
    if (place.alias) setAlias(place.alias);
    if (place.categoryId) setCategoryId(place.categoryId);
  };

  React.useEffect(() => {
    const trimmed = query.trim();
    if (selected && selected.name === trimmed) return undefined;
    if (trimmed.length < 2) {
      setResults([]);
      return undefined;
    }
    const timer = setTimeout(() => { handleSearch(null, true); }, 380);
    return () => clearTimeout(timer);
  }, [query]);

  const handleSelectResult = result => {
    setSelected({
      name: result.name, address: result.address, lat: result.lat, lng: result.lng,
      categoryLabel: result.categoryLabel || '', phone: result.phone || '', url: result.url || '',
      duplicateDismissed: false, mergeTargetId: '', isExistingPlace: false
    });
    setQuery(result.name);
    setResults([]);
    // Kakao's category_group_code lets a search result suggest 식당/카페/놀이/숙박 up front, so the
    // user usually doesn't have to touch the category picker at all -- only auto-selects when the
    // result actually carries a mapped category, otherwise leaves whatever was already chosen.
    if (result.categoryId) setCategoryId(result.categoryId);
  };

  const handleSubmit = async () => {
    if (!selected || !Number.isFinite(selected.lat) || !Number.isFinite(selected.lng)) {
      showToast('검색 결과에서 장소를 선택해 주세요.', 'error');
      return;
    }
    setSaving(true);
    try {
      const ok = await onSave({
        id: editingPlace ? editingPlace.id : undefined,
        name: selected.name || query.trim(),
        alias: sanitizeText(alias.trim(), 80),
        address: selected.address || '',
        lat: selected.lat,
        lng: selected.lng,
        categoryId,
        memo: memo.trim(),
        visitStatus,
        visitDate: visitStatus === 'visited' ? visitDate : '',
        sourcePlaceId: selected.mergeTargetId || selected.id || ''
      });
      if (ok !== false) onClose();
    } catch (err) {
      console.error('[PlaceRegisterModal] Save failed:', err);
      showToast('장소 저장 중 오류가 발생했습니다.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClick = () => {
    if (!editingPlace) return;
    if (typeof onRequestConfirm === 'function') {
      onRequestConfirm('장소 삭제', `"${editingPlace.name || '이 장소'}"를 삭제하시겠습니까?`, async () => {
        setSaving(true);
        try {
          const deleted = await Promise.resolve(onDelete(editingPlace.id));
          if (deleted !== false) onClose();
        } catch (err) {
          console.error('[PlaceRegisterModal] Delete failed:', err);
          showToast('장소 삭제 중 오류가 발생했습니다.', 'error');
        } finally {
          setSaving(false);
        }
      });
    }
  };

  // Bulk-imported places carry their memo written as "YY.MM.DD 누구랑 뭐했는지" -- typing that same
  // shorthand here auto-fills the 방문일자 field (and flips the toggle to 방문 if it was left on
  // 예정) instead of making the user re-enter the same date twice in two different fields.
  const handleMemoChange = e => {
    const value = e.target.value;
    setMemo(value);
    autoGrowTextarea(e.target, 480);
    const detectedDate = normalizePlaceDateForSort(extractLeadingMemoDate(value));
    if (detectedDate) {
      setVisitDate(detectedDate);
      setVisitStatus('visited');
    }
  };

  // Pasting a fresh bulk export (another Google My Maps-style run-on block) hits the same
  // one-long-line problem the mount-time reformat above fixes for existing places -- reformat
  // just the pasted chunk before splicing it in, so it's readable immediately instead of only
  // after the next save+reopen. Left alone (native paste proceeds) when the pasted text doesn't
  // look like a multi-visit block, so pasting a single URL/sentence isn't affected.
  const handleMemoPaste = e => {
    const pasted = e.clipboardData.getData('text');
    if (!pasted) return;
    const reformatted = reformatMemoIntoDateLines(pasted);
    if (reformatted === pasted) return;
    e.preventDefault();
    const el = e.target;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const nextValue = memo.slice(0, start) + reformatted + memo.slice(end);
    setMemo(nextValue);
    const cursorPos = start + reformatted.length;
    requestAnimationFrame(() => {
      if (!memoTextareaRef.current) return;
      memoTextareaRef.current.setSelectionRange(cursorPos, cursorPos);
      autoGrowTextarea(memoTextareaRef.current, 480);
    });
    const detectedDate = normalizePlaceDateForSort(extractLeadingMemoDate(nextValue));
    if (detectedDate) {
      setVisitDate(detectedDate);
      setVisitStatus('visited');
    }
  };

  const categoryOptions = categories.map(c => ({ value: c.id, label: getPlaceCategoryLabel(c) }));

  return /*#__PURE__*/React.createElement("div", {
    className: "modal-overlay",
    onClick: overlayOnClick,
    style: { zIndex: 12000 }
  }, /*#__PURE__*/React.createElement(ResizableModalContainer, {
    className: "modal-container",
    style: { maxWidth: '400px', width: '90%', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)' },
    onClick: e => e.stopPropagation()
  },
    /* Header */
    /*#__PURE__*/React.createElement("div", {
      style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid var(--border-subtle)' }
    },
      /*#__PURE__*/React.createElement("span", {
        style: { fontSize: '0.92rem', fontWeight: '900', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }
      }, /*#__PURE__*/React.createElement(PlaceSectionIcon, { size: 16 }), editingPlace ? '장소 수정' : '장소 등록'),
      /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: requestClose,
        style: { width: '32px', height: '32px', minWidth: '32px', minHeight: '32px', boxSizing: 'border-box', borderRadius: '50%', border: 'none', background: 'var(--border-subtle)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }
      }, /*#__PURE__*/React.createElement(SmallXIcon, { size: 14 }))
    ),

    /* Body */
    /*#__PURE__*/React.createElement("div", {
      style: { padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '70vh', overflowY: 'auto' }
    },
      /* Search field */
      /*#__PURE__*/React.createElement("form", { onSubmit: handleSearch, style: { display: 'flex', gap: '8px' } },
        /*#__PURE__*/React.createElement("input", {
          type: "text",
          className: "form-input",
          style: { flex: 1, minWidth: 0 },
          placeholder: "주소 또는 업체명 검색",
          value: query,
          onChange: e => { setQuery(e.target.value); setSelected(null); }
        }),
        /*#__PURE__*/React.createElement("button", {
          type: "submit",
          className: "btn btn-poll-create",
          style: { height: '44px', whiteSpace: 'nowrap' },
          disabled: loading
        }, loading ? '검색중' : '검색')
      ),
      /* Search progress -- only for a manual (non-auto) submit, see searchStage above. Google
         Places in particular can take several seconds on a cold start, so this exists to make
         that wait read as "still working" instead of a frozen button label. */
      searchStage && /*#__PURE__*/React.createElement("div", {
        style: { display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(59, 130, 246, 0.06)' }
      },
        /*#__PURE__*/React.createElement("span", { className: "calendar-spinner", style: { flexShrink: 0 } }),
        /*#__PURE__*/React.createElement("span", { style: { fontSize: 'var(--font-size-md)', color: 'var(--text-muted)' } }, SEARCH_TIER_LABELS[searchStage] || '검색 중...')
      ),

      /* Already registered places section */
      existingPlaceSuggestions.length > 0 && /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '160px', overflowY: 'auto',
          border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '6px',
          backgroundColor: 'var(--bg-primary)'
        }
      },
        /*#__PURE__*/React.createElement("div", {
          style: { fontSize: 'var(--font-size-sm)', fontWeight: 800, color: 'var(--accent-primary)', padding: '2px 6px' }
        }, "이미 등록된 장소"),
        existingPlaceSuggestions.map(p => /*#__PURE__*/React.createElement("button", {
          key: p.id,
          type: "button",
          onClick: () => handleSelectExistingPlace(p),
          style: { textAlign: 'left', padding: '8px 10px', borderRadius: 'var(--radius-sm)', border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '2px' },
          className: "place-result-item"
        },
          /*#__PURE__*/React.createElement("span", { style: { fontSize: 'var(--font-size-md)', fontWeight: 700, color: 'var(--text-main)' } }, p.alias || p.name),
          /*#__PURE__*/React.createElement("span", { style: { fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' } }, getDisplayPlaceAddress(p) || p.name)
        ))
      ),

      /* Search results */
      results.length > 0 && /*#__PURE__*/React.createElement("div", {
        style: { display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '160px', overflowY: 'auto', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '4px' }
      }, results.map(r => /*#__PURE__*/React.createElement("button", {
        key: r.id,
        type: "button",
        onClick: () => handleSelectResult(r),
        style: { textAlign: 'left', padding: '8px 10px', borderRadius: 'var(--radius-sm)', border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '2px' }
      },
        /*#__PURE__*/React.createElement("span", { style: { fontSize: 'var(--font-size-md)', fontWeight: 700, color: 'var(--text-main)' } }, r.name),
        /*#__PURE__*/React.createElement("span", { style: { fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' } }, r.address)
      ))),

      /* Selected place confirmation -- shows whatever business info the search result actually
         carried (주소/전화/URL), not just a bare "선택됨: 이름" line, so the user can confirm
         they picked the right branch/listing before saving. */
      selected && /*#__PURE__*/React.createElement("div", {
        style: {
          padding: '10px 12px', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(59, 130, 246, 0.08)',
          border: '1px solid rgba(59, 130, 246, 0.2)', display: 'flex', flexDirection: 'column', gap: '4px'
        }
      },
        /*#__PURE__*/React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' } },
          /*#__PURE__*/React.createElement("span", { style: { fontSize: 'var(--font-size-base)', fontWeight: 800, color: 'var(--text-main)' } }, selected.name),
          selected.categoryLabel && /*#__PURE__*/React.createElement("span", { style: { fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' } }, selected.categoryLabel)
        ),
        selected.address && /*#__PURE__*/React.createElement("div", { style: { fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' } }, selected.address),
        selected.phone && /*#__PURE__*/React.createElement("div", { style: { fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' } }, `☎ ${selected.phone}`),
        duplicatePlace && /*#__PURE__*/React.createElement("div", {
          style: { marginTop: '6px', padding: '9px 10px', borderRadius: '8px', backgroundColor: 'rgba(245, 158, 11, 0.12)', border: '1px solid rgba(245, 158, 11, 0.35)' }
        },
          /*#__PURE__*/React.createElement("div", { style: { fontSize: 'var(--font-size-md)', fontWeight: 700, color: '#92400E', lineHeight: 1.45 } }, `기존 ${duplicatePlace.alias || duplicatePlace.name} 과 동일한 업체입니다. 병합하시겠습니까?`),
          /*#__PURE__*/React.createElement("div", { style: { display: 'flex', gap: '6px', marginTop: '7px' } },
            /*#__PURE__*/React.createElement("button", { type: 'button', onClick: () => setSelected(prev => ({ ...prev, mergeTargetId: duplicatePlace.id })), style: { border: 0, borderRadius: 'var(--radius-sm)', padding: '5px 10px', background: 'var(--accent-primary)', color: '#fff', fontSize: 'var(--font-size-sm)', fontWeight: 700, cursor: 'pointer' } }, '병합'),
            /*#__PURE__*/React.createElement("button", { type: 'button', onClick: () => setSelected(prev => ({ ...prev, duplicateDismissed: true })), style: { border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '5px 10px', background: 'var(--bg-card)', color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)', cursor: 'pointer' } }, '별도 등록')
          )
        ),
        selected.url && /*#__PURE__*/React.createElement("button", {
          type: "button",
          title: selected.url,
          onClick: e => { e.stopPropagation(); window.open(selected.url, '_blank', 'noopener,noreferrer'); },
          style: {
            alignSelf: 'flex-start', border: 0, cursor: 'pointer', textAlign: 'left',
            padding: '3px 10px', borderRadius: 'var(--radius-full)', fontSize: 'var(--font-size-sm)', fontWeight: 400,
            backgroundColor: 'var(--border-subtle)', color: 'var(--text-muted)', wordBreak: 'break-all', maxWidth: '100%'
          }
        }, selected.url)
        , tourLoading && /*#__PURE__*/React.createElement("div", { style: { marginTop: '6px', fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' } }, '주변 투어 정보 불러오는 중...')
        , tourItems.length > 0 && /*#__PURE__*/React.createElement("div", {
          style: { marginTop: '8px', paddingTop: '8px', borderTop: '1px solid rgba(59,130,246,0.16)', display: 'flex', flexDirection: 'column', gap: '5px' }
        },
          /*#__PURE__*/React.createElement("div", { style: { fontSize: 'var(--font-size-sm)', fontWeight: 800, color: 'var(--accent-primary)' } }, '주변 투어 정보 (TourAPI)'),
          tourGroups.map(group => /*#__PURE__*/React.createElement("div", { key: group.key, style: { display: 'flex', flexDirection: 'column', gap: '4px' } },
            /*#__PURE__*/React.createElement("div", { style: { fontSize: 'var(--font-size-xs)', fontWeight: 800, color: 'var(--text-muted)', marginTop: '2px' } }, group.label),
            group.items.map(item => /*#__PURE__*/React.createElement("a", {
              key: item.id,
              href: item.homepage || `https://map.kakao.com/?q=${encodeURIComponent(item.title)}`,
              target: '_blank',
              rel: 'noreferrer',
              style: { display: 'flex', alignItems: 'center', gap: '7px', color: 'var(--text-main)', textDecoration: 'none', fontSize: 'var(--font-size-sm)' }
            },
              item.imageUrl && /*#__PURE__*/React.createElement('img', { src: item.imageUrl, alt: '', loading: 'lazy', style: { width: '34px', height: '34px', objectFit: 'cover', borderRadius: 'var(--radius-sm)', flexShrink: 0 } }),
              /*#__PURE__*/React.createElement('span', { style: { minWidth: 0 } },
                /*#__PURE__*/React.createElement('span', { style: { display: 'block', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, item.title),
                /*#__PURE__*/React.createElement('span', { style: { display: 'block', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, item.address)
              )
            ))
          ))
        )
      ),

      /* Alias (별칭) -- optional nickname; official search name stays as place.name */
      selected && /*#__PURE__*/React.createElement("div", null,
        /*#__PURE__*/React.createElement("label", {
          style: { display: 'block', fontSize: 'var(--font-size-md)', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }
        }, "별칭 (선택)"),
        /*#__PURE__*/React.createElement("input", {
          type: "text",
          className: "form-input",
          placeholder: "목록에 표시할 별칭 (예: 도은네 집)",
          maxLength: 80,
          value: alias,
          onChange: e => setAlias(e.target.value),
          style: { width: '100%', boxSizing: 'border-box' }
        }),
        /*#__PURE__*/React.createElement("div", {
          style: { marginTop: '4px', fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }
        }, "비우면 검색된 공식 명칭이 그대로 표시됩니다.")
      ),

      /* Category picker */
      /*#__PURE__*/React.createElement("div", null,
        /*#__PURE__*/React.createElement("label", { style: { display: 'block', fontSize: 'var(--font-size-md)', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' } }, "카테고리"),
        /*#__PURE__*/React.createElement("div", { style: { width: '100%' } },
          /*#__PURE__*/React.createElement(SimpleBottomSheetPicker, {
            title: "카테고리 선택",
            value: categoryId,
            options: categoryOptions,
            onSelect: setCategoryId,
            placeholder: "카테고리 선택"
          })
        )
      ),

      /* Memo field */
      /*#__PURE__*/React.createElement("div", null,
        /*#__PURE__*/React.createElement("label", { style: { display: 'block', fontSize: 'var(--font-size-md)', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' } }, "메모"),
        /*#__PURE__*/React.createElement(AutoGrowTextarea, {
          textareaRef: memoTextareaRef,
          className: "form-input",
          style: { width: '100%' },
          minHeight: 60,
          maxHeight: 480,
          placeholder: "메모를 남겨보세요 (선택, URL을 입력하면 캡슐 뱃지로 표시됩니다. '26.02.12'처럼 날짜를 적으면 방문일자에 자동 반영됩니다)",
          value: memo,
          maxLength: 2000,
          onChange: handleMemoChange,
          onPaste: handleMemoPaste
        }),
        extractFirstUrl(memo) && /*#__PURE__*/React.createElement("div", {
          style: { marginTop: '6px', fontSize: 'var(--font-size-md)', color: 'var(--text-main)', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '4px' }
        }, renderTextWithUrlBadge(memo))
      )
    ),

    /* Footer — 추가/취소·수정 공통 모듈 (FormAddEditActionButtons) */
    /*#__PURE__*/React.createElement("div", {
      style: { display: 'flex', gap: '8px', padding: '12px 16px', borderTop: '1px solid var(--border-subtle)' }
    },
      editingPlace && /*#__PURE__*/React.createElement("button", {
        type: "button",
        className: "btn btn-danger",
        style: { height: '44px', minHeight: '44px', flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: '6px' },
        onClick: handleDeleteClick,
        disabled: saving
      }, /*#__PURE__*/React.createElement(TrashIcon, { size: 14 }), "삭제"),
      /*#__PURE__*/React.createElement(FormAddEditActionButtons, {
        isEditing: !!editingPlace,
        isSaving: saving,
        flexGrow: true,
        onCancel: onClose,
        onSubmit: handleSubmit
      })
    )
  ));
}

  if (typeof window !== 'undefined') {
  window.GATHER_UI_COMPONENTS = Object.assign({}, window.GATHER_UI_COMPONENTS || {}, {
    PlaceRegisterModal: PlaceRegisterModal,
  });
}
