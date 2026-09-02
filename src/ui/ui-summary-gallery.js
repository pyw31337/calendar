/**
 * Summary list, photo gallery, category tabs (P4-11)
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
function formatConfirmedMeetingLabel(...args) {
  const f = __gatherUiDeps().formatConfirmedMeetingLabel || GATHER_APP_UTILS.formatConfirmedMeetingLabel;
  return typeof f === 'function' ? f(...args) : (args[0] ? formatDateWithDayName(args[0]) : '');
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


export function SectionCountBadge({ count }) {
  const React = window.React;
  const normalizedCount = Number(count || 0);

  if (!Number.isFinite(normalizedCount) || normalizedCount <= 0) return null;

  return /*#__PURE__*/React.createElement("span", {
    className: "section-count-badge"
  }, normalizedCount);
}

export function SectionToggleButton({ collapsed, onToggle, label }) {
  const React = window.React;

  return /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: `section-toggle-btn${collapsed ? ' is-collapsed' : ''}`,
    "aria-label": label,
    "aria-expanded": !collapsed,
    onClick: event => {
      event.stopPropagation();
      onToggle();
    }
  }, /*#__PURE__*/React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    width: "24",
    height: "24",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    "stroke-width": "2",
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
    className: "icon icon-tabler icons-tabler-outline icon-tabler-chevron-down"
  }, /*#__PURE__*/React.createElement("path", {
    stroke: "none",
    d: "M0 0h24v24H0z",
    fill: "none"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M6 9l6 6l6 -6"
  })));
}

function handleSectionHeaderKeyDown(event, onToggle) {
  if (event.key !== 'Enter' && event.key !== ' ') return;
  event.preventDefault();
  onToggle();
}

export function SearchCategoryTabs({ tabs, activeKey, onSelect, containerStyle, tabPadding, tabTextStyle, countBadgeClassName, countBadgeStyle }) {
  const React = window.React;

  return /*#__PURE__*/React.createElement("div", {
    style: { display: 'grid', gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))`, overflow: 'hidden', borderBottom: '1px solid var(--border-subtle)', ...containerStyle }
  }, tabs.map(tab => {
    const count = Number(tab.count || 0);
    return /*#__PURE__*/React.createElement("button", {
      key: tab.key,
      type: "button",
      onClick: () => onSelect(tab.key),
      style: {
        minWidth: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
        padding: tabPadding || '10px 4px', fontSize: 'var(--font-size-md)', fontWeight: 800,
        background: 'none', border: 'none', cursor: 'pointer',
        color: activeKey === tab.key ? '#2563EB' : '#64748B',
        borderBottom: activeKey === tab.key ? '3px solid #2563EB' : '3px solid transparent',
        marginBottom: '-1px',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        ...tabTextStyle
      }
    }, tab.label, count > 0 && /*#__PURE__*/React.createElement("span", {
        className: countBadgeClassName || undefined,
        style: {
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          verticalAlign: 'middle',
          lineHeight: 1,
          minWidth: '20px',
          height: '18px',
          borderRadius: 'var(--radius-full)',
          backgroundColor: tab.color || tab.badgeColor || '#2563EB',
          color: '#FFFFFF',
          fontSize: 'var(--font-size-xs)',
          fontWeight: 'bold',
          padding: '0 6px',
          boxSizing: 'border-box',
          ...countBadgeStyle
        }
      }, count));
  }));
}

export function ParticipantBackdrop({ participant, name, dotSize = 10, style = {}, className }) {
  const React = window.React;
  const color = participant?.color || '#94A3B8';
  const label = name || participant?.name || '참여자';
  return React.createElement('span', {
    className,
    style: { display: 'inline-flex', alignItems: 'center', gap: '8px', color, fontWeight: 700, ...style }
  },
    React.createElement('span', {
      'aria-hidden': 'true',
      style: { display: 'inline-block', width: `${dotSize}px`, height: `${dotSize}px`, borderRadius: '50%', backgroundColor: color, flexShrink: 0 }
    }),
    label
  );
}

export function SimpleBottomSheetPicker({ title, value, options, onSelect, placeholder, disabled, style, className = "form-select" }) {
  const React = window.React;

  const [isOpen, setIsOpen] = React.useState(false);
  const safeOptions = Array.isArray(options) ? options : [];
  const selected = safeOptions.find(o => o.value === value);
  const sheet = isOpen && /*#__PURE__*/React.createElement("div", {
    className: "bottom-sheet-overlay",
    // This sheet is portaled to document.body below, so its synthetic click still bubbles up
    // the React component tree (not the DOM tree) to whatever ancestor rendered it -- without
    // stopPropagation, a click meant only to dismiss this sheet can also trigger an ancestor
    // card's own "tap to open" handler.
    onClick: e => { e.stopPropagation(); setIsOpen(false); }
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
      safeOptions.map(opt => /*#__PURE__*/React.createElement("button", {
        key: opt.value,
        type: "button",
        className: "bottom-sheet-item",
        disabled: !!opt.disabled,
        onClick: () => { if (!opt.disabled) { onSelect(opt.value); setIsOpen(false); } },
        style: opt.disabled ? { opacity: 0.45, cursor: 'not-allowed' } : undefined
      }, opt.color ? /*#__PURE__*/React.createElement(ParticipantBackdrop, { participant: opt, name: opt.label }) : opt.label,
        opt.disabled ? /*#__PURE__*/React.createElement("span", { style: { marginLeft: 'auto', fontSize: 'var(--font-size-sm)', color: 'var(--text-light)' } }, "추가됨") : null))
    )
  ));
  return /*#__PURE__*/React.createElement(React.Fragment, null,
    /*#__PURE__*/React.createElement("button", {
      type: "button",
      className,
      disabled,
      style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', cursor: disabled ? 'default' : 'pointer', textAlign: 'left', width: '100%', ...style },
      onClick: () => setIsOpen(true)
    },
      selected?.color ? /*#__PURE__*/React.createElement(ParticipantBackdrop, { participant: selected, name: selected.label, style: { minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }) : /*#__PURE__*/React.createElement("span", { style: { minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, selected ? selected.label : placeholder),
      /*#__PURE__*/React.createElement("svg", {
        xmlns: "http://www.w3.org/2000/svg",
        width: "18",
        height: "18",
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        "stroke-width": "2",
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
        className: "icon icon-tabler icons-tabler-outline icon-tabler-chevron-down",
        style: { flexShrink: 0, color: 'var(--text-light)' }
      }, /*#__PURE__*/React.createElement("path", { stroke: "none", d: "M0 0h24v24H0z", fill: "none" }),
        /*#__PURE__*/React.createElement("path", { d: "M6 9l6 6l6 -6" }))
    ),
    sheet && typeof document !== 'undefined' && ReactDOM.createPortal ? ReactDOM.createPortal(sheet, document.body) : sheet
  );
}

// Comments are stored inline on the memo doc (see MemoCard in ui-calendar-core.js), so the
// latest-comment timestamp is derived straight from that array rather than relying on the
// denormalized memo.lastCommentAt field, which has known gaps for memos outside the page's
// currently-loaded window (see ui-memo-view.js's own comment on RECENT_MEMO_ACTIVITY_WINDOW_MS).
function getLatestMemoPreviewCommentTimestamp(memo) {
  const comments = memo?.comments || [];
  let latest = 0;
  for (const c of comments) {
    const t = Number(c?.createdAt) || 0;
    if (t > latest) latest = t;
  }
  return latest;
}

// Same curated pastel palette MemoView's own composer/edit color picker uses (see MEMO_COLORS in
// ui-memo-view.js) -- duplicated here as a tiny pure lookup (not imported) so this preview's
// MemoCard instances tint their border the same as the memo page's, without pulling in MemoView's
// much larger edit-modal state.
const MEMO_PREVIEW_BORDER_COLORS = {
  'var(--bg-card)': 'var(--border-subtle)',
  'rgba(239, 68, 68, 0.12)': 'rgba(239, 68, 68, 0.3)',
  'rgba(245, 158, 11, 0.12)': 'rgba(245, 158, 11, 0.3)',
  'rgba(234, 179, 8, 0.12)': 'rgba(234, 179, 8, 0.3)',
  'rgba(16, 185, 129, 0.12)': 'rgba(16, 185, 129, 0.3)',
  'rgba(6, 182, 212, 0.12)': 'rgba(6, 182, 212, 0.3)',
  'rgba(59, 130, 246, 0.12)': 'rgba(59, 130, 246, 0.3)',
  'rgba(139, 92, 246, 0.12)': 'rgba(139, 92, 246, 0.3)',
  'rgba(236, 72, 153, 0.12)': 'rgba(236, 72, 153, 0.3)'
};
function getMemoPreviewBorderColor(colorVal) {
  return MEMO_PREVIEW_BORDER_COLORS[colorVal] || 'var(--border-subtle)';
}

// Renders the actual memo-page MemoCard (same title/image-grid/tags/comments/pin/share look and
// behavior as the 메모 page), not a bespoke compact row, per the product decision that the
// main-screen memo preview should look and act like a real memo card. onOpenEdit/onSelectTag fall
// back to navigating to the memo page (this section owns no edit modal or tag-search UI of its
// own); onTogglePin/onCommentsChange are real writes (see handleTogglePinFromMemoPreview /
// handleMemoCommentsChangeFromMemoPreview in app-main.js) since MemoCard calls them unconditionally.
export function MemoPreviewSection({ memos = [], calendar = null, onViewAll, onOpenEdit, onTogglePin, onSelectTag, onCommentsChange, onRequestConfirm, showToast }) {
  const React = window.React;
  const __deps = window.GATHER_UI_DEPS || {};
  const __comp = window.GATHER_UI_COMPONENTS || {};
  const MemoSectionIcon = __comp.MemoSectionIcon || __deps.MemoSectionIcon;
  const MemoCard = __comp.MemoCard || __deps.MemoCard;

  const [collapsed, setCollapsed] = React.useState(true);

  const sortedMemos = React.useMemo(() => {
    const list = (memos || []).filter(m => m && !isTombstone(m));
    return list.slice().sort((a, b) => {
      const aComment = getLatestMemoPreviewCommentTimestamp(a);
      const bComment = getLatestMemoPreviewCommentTimestamp(b);
      if (aComment !== bComment) return bComment - aComment;
      const aCreated = a.updatedAt || a.createdAt || 0;
      const bCreated = b.updatedAt || b.createdAt || 0;
      return bCreated - aCreated;
    });
  }, [memos]);

  if (sortedMemos.length === 0) return null;

  const displayedMemos = sortedMemos.slice(0, collapsed ? 1 : 3);
  const openMemoPage = () => { if (typeof onViewAll === 'function') onViewAll(); };
  const handleTitleKeyDown = event => handleSectionHeaderKeyDown(event, () => setCollapsed(prev => !prev));

  return /*#__PURE__*/React.createElement("section", { className: "summary-card" },
    /*#__PURE__*/React.createElement("div", {
      className: `summary-title is-toggleable${collapsed ? ' is-collapsed' : ''}`,
      role: "button",
      tabIndex: 0,
      "aria-expanded": !collapsed,
      "data-no-press-feedback": true,
      onClick: () => setCollapsed(prev => !prev),
      onKeyDown: handleTitleKeyDown,
      style: { display: 'flex', alignItems: 'center', gap: '6px', width: '100%', color: '#2563EB', cursor: 'pointer' }
    },
      /*#__PURE__*/React.createElement("div", {
        style: { display: 'flex', alignItems: 'center', gap: '6px', flex: 1, minWidth: 0, color: '#2563EB' }
      },
        /*#__PURE__*/React.createElement(MemoSectionIcon, null),
        /*#__PURE__*/React.createElement("span", null, "메모"),
        /*#__PURE__*/React.createElement(SectionCountBadge, { count: sortedMemos.length })
      ),
      /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: e => { e.stopPropagation(); openMemoPage(); },
        style: { background: 'none', border: 'none', color: '#3B82F6', fontSize: 'var(--font-size-md)', fontWeight: 800, cursor: 'pointer', padding: '4px 6px', flexShrink: 0 }
      }, "전체보기"),
      /*#__PURE__*/React.createElement(SectionToggleButton, {
        collapsed,
        onToggle: () => setCollapsed(prev => !prev),
        label: collapsed ? '메모 펼치기' : '메모 접기'
      })
    ),
    /*#__PURE__*/React.createElement("div", {
      style: { display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px' }
    }, MemoCard ? displayedMemos.map(memo => /*#__PURE__*/React.createElement(MemoCard, {
      key: memo.id,
      memo: memo,
      calendar: calendar,
      onOpenEdit: onOpenEdit,
      onTogglePin: () => { if (typeof onTogglePin === 'function') onTogglePin(memo); },
      onShare: undefined,
      onSelectTag: onSelectTag,
      onCommentsChange: nextComments => (typeof onCommentsChange === 'function' ? onCommentsChange(memo, nextComments) : false),
      getBorderColor: getMemoPreviewBorderColor,
      onRequestConfirm: onRequestConfirm,
      showToast: showToast,
      effectivePinned: !!memo.isPinned
    })) : null)
  );
}

export function PhotoGallery({ chatMessages, memos = [], calendar = null, totalGalleryCount, onViewAll, showToast, onPromoteImageUrl, onSaveImageTags, onSearchTag, onDeletePhoto, onReplacePhoto, onJumpToChatMessage, onJumpToMemo, onJumpToMeetingDate, onJumpToGallery, onGetChatMessageOrdinal, onGetGalleryPhotoOrdinal, onRequestConfirm }) {
  const React = window.React;
  const __deps = window.GATHER_UI_DEPS || {};
  const __comp = window.GATHER_UI_COMPONENTS || {};
  const GalleryIcon = __deps.GalleryIcon;
  const Lightbox = __comp.Lightbox || __deps.Lightbox;
  const MediaThumb = __comp.MediaThumb || __deps.MediaThumb;
  const resolveMeetingPhotoDisplay = __deps.resolveMeetingPhotoDisplay;
  const SectionCountBadge = __comp.SectionCountBadge;
  const SectionToggleButton = __comp.SectionToggleButton;

  const [collapsed, setCollapsed] = React.useState(false);
  const [lightbox, setLightbox] = React.useState(null);
  const brokenPhotoKeysRef = React.useRef((GATHER_APP_UTILS.getPersistentBrokenPhotoUrls || (window.GATHER_APP_UTILS && window.GATHER_APP_UTILS.getPersistentBrokenPhotoUrls) || (() => new Set()))());
  const brokenPhotoUrlsRef = React.useRef((GATHER_APP_UTILS.getPersistentBrokenPhotoUrls || (window.GATHER_APP_UTILS && window.GATHER_APP_UTILS.getPersistentBrokenPhotoUrls) || (() => new Set()))());
  // A confirmed-broken entry (MediaThumb already tried the full-size fallback -- this only fires
  // once both attempts failed) is a dead, unclickable placeholder with no way to recover it from
  // this read-only preview widget, so it is dropped from the grid rather than shown. The revision
  // bump re-runs the visibleEntries filter below so a newly-discovered broken photo disappears
  // immediately instead of waiting for a fresh page load.
  const [brokenPhotoRevision, setBrokenPhotoRevision] = React.useState(0);
  const normalizeBrokenPhotoUrl = value => {
    const url = String(value || '').trim();
    if (!url) return '';
    return url.split(/[?#]/)[0];
  };
  const saveBrokenUrl = urlOrKey => {
    const saveFn = GATHER_APP_UTILS.savePersistentBrokenPhotoUrl || (window.GATHER_APP_UTILS && window.GATHER_APP_UTILS.savePersistentBrokenPhotoUrl);
    if (typeof saveFn === 'function') saveFn(urlOrKey);
  };
  const markBrokenPhoto = (photo, brokenInfo = {}) => {
    const key = photo?.mediaKey || photo?.refKey || photo?.key;
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
      saveBrokenUrl(key);
      changed = true;
    }
    urls.forEach(url => {
      if (!brokenPhotoUrlsRef.current.has(url)) {
        brokenPhotoUrlsRef.current.add(url);
        saveBrokenUrl(url);
        changed = true;
      }
    });
    if (changed) setBrokenPhotoRevision(prev => prev + 1);
  };

  const photoEntries = React.useMemo(() => {
    const sorted = [...(chatMessages || [])].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    const chatEntries = sorted.flatMap(msg => {
      if (!msg || isTombstone(msg)) return [];
      const directEntry = getMessageDirectMediaEntry(msg);
      const entries = directEntry ? [...getMessageImageEntries(msg), directEntry] : getMessageImageEntries(msg);
      return entries.map((entry, i) => ({
        ...entry,
        source: 'chat',
        timestamp: msg.timestamp
      }));
    });
    const memoEntries = (memos || []).flatMap(memo => {
      if (!memo || isTombstone(memo)) return [];
      const memoTagsDisplay = Array.isArray(memo.tags) ? memo.tags.map(t => String(t || '').replace(/^#/, '')).filter(Boolean).join(' ') : '';
      const asMsg = {
        id: memo.id, text: memo.text || memo.content || memo.body || '',
        imageUrl: memo.imageUrl, imageUrls: memo.imageUrls, thumbUrl: memo.thumbUrl, thumbUrls: memo.thumbUrls,
        timestamp: memo.updatedAt || memo.createdAt || 0, participantId: memo.participantId || '',
        uploadSource: 'memo'
      };
      const directEntry = getMessageDirectMediaEntry(asMsg);
      const entries = directEntry ? [...getMessageImageEntries(asMsg), directEntry] : getMessageImageEntries(asMsg);
      return entries.map(entry => ({
        ...entry,
        tags: memoTagsDisplay,
        source: 'memo',
        timestamp: asMsg.timestamp
      }));
    });
    const meetingEntries = [];
    getConfirmedMeetings(calendar).forEach(meeting => {
      const photos = Array.isArray(meeting?.photos) ? meeting.photos : [];
      photos.forEach((photo, index) => {
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
        meetingEntries.push({
          full: full || thumb,
          thumb: thumb || full,
          imageIndex: index,
          messageId: null,
          photoId: photo?.id || '',
          sourceMessageId: photo?.sourceMessageId || '',
          sourceImageIndex: Number.isInteger(photo?.sourceImageIndex) ? photo.sourceImageIndex : null,
          timestamp: Number(photo?.createdAt || photo?.updatedAt || meeting?.confirmedAt || 0),
          tags: String(resolved?.tags ?? photo?.tags ?? ''),
          directMediaUrl: '',
          source: 'meeting',
          meetingDate: meeting.date || '',
          mediaKey,
          refKey
        });
      });
    });
    const byUrl = new Map();
    const sourceRank = { chat: 0, memo: 1, meeting: 2 };
    [...chatEntries, ...memoEntries, ...meetingEntries].forEach(entry => {
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
    return Array.from(byUrl.values()).sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
  }, [chatMessages, memos, calendar]);
  const isKnownBrokenPhoto = entry => {
    const key = entry?.mediaKey || entry?.refKey || entry?.key;
    if (key && brokenPhotoKeysRef.current.has(key)) return true;
    return [entry?.full, entry?.thumb].map(normalizeBrokenPhotoUrl).filter(Boolean)
      .some(url => brokenPhotoUrlsRef.current.has(url));
  };
  // brokenPhotoRevision is read only to re-run this filter once markBrokenPhoto records a
  // newly-discovered broken entry, so a dead placeholder disappears immediately instead of
  // lingering until the next full reload.
  const visibleEntries = React.useMemo(() => photoEntries.filter(entry => (
    ((entry && entry.thumb && String(entry.thumb)) || (entry && entry.full && String(entry.full)))
    && !isKnownBrokenPhoto(entry)
  )), [photoEntries, brokenPhotoRevision]);

  const handleBrokenPhoto = (photo, brokenInfo = {}) => {
    markBrokenPhoto(photo, brokenInfo);
  };

  const badgeCount = visibleEntries.length;
  const displayedEntries = visibleEntries
    .filter(e => (e && ((e.thumb && String(e.thumb)) || (e.full && String(e.full)))))
    .slice(0, 12);
  const openGalleryPage = () => { if (typeof onViewAll === 'function') onViewAll(); };
  const handleGalleryTitleKeyDown = event => handleSectionHeaderKeyDown(event, () => setCollapsed(prev => !prev));

  if (visibleEntries.length === 0) return null;

  return /*#__PURE__*/React.createElement("section", { className: "summary-card" },
    /*#__PURE__*/React.createElement("div", {
      className: `summary-title is-toggleable${collapsed ? ' is-collapsed' : ''}`,
      role: "button",
      tabIndex: 0,
      "aria-expanded": !collapsed,
      "data-no-press-feedback": true,
      onClick: () => setCollapsed(prev => !prev),
      onKeyDown: handleGalleryTitleKeyDown,
      style: { display: 'flex', alignItems: 'center', gap: '6px', width: '100%', color: '#2563EB', cursor: 'pointer' }
    },
      /*#__PURE__*/React.createElement("div", {
        style: { display: 'flex', alignItems: 'center', gap: '6px', flex: 1, minWidth: 0, color: '#2563EB' }
      },
        /*#__PURE__*/React.createElement(GalleryIcon, null),
        /*#__PURE__*/React.createElement("span", null, "갤러리"),
        badgeCount > 0 && /*#__PURE__*/React.createElement(SectionCountBadge, { count: badgeCount })
      ),
      /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: e => { e.stopPropagation(); openGalleryPage(); },
        style: {
          border: 'none', background: 'transparent', cursor: 'pointer',
          color: '#3B82F6', fontSize: 'var(--font-size-md)', fontWeight: 700, padding: '4px 6px', flexShrink: 0
        }
      }, "전체보기"),
      /*#__PURE__*/React.createElement(SectionToggleButton, {
        collapsed,
        onToggle: () => setCollapsed(prev => !prev),
        label: collapsed ? '갤러리 펼치기' : '갤러리 접기'
      })
    ),
    !collapsed && displayedEntries.length > 0 && /*#__PURE__*/React.createElement(React.Fragment, null,
      /*#__PURE__*/React.createElement("div", {
        style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(80px, 100%), 1fr))', gap: '6px', marginTop: '12px' }
      },
        displayedEntries.map((entry, idx) => /*#__PURE__*/React.createElement(MediaThumb, {
          key: entry.mediaKey || entry.refKey || entry.full || entry.thumb,
          src: (entry.thumb && String(entry.thumb)) || (entry.full && String(entry.full)) || '',
          fallbackSrc: (entry.full && String(entry.full)) || (entry.thumb && String(entry.thumb)) || '',
          alt: "채팅에 첨부된 사진",
          loading: "lazy",
          decoding: "async",
          referrerPolicy: 'no-referrer',
          onClick: () => setLightbox({
            urls: displayedEntries.map(e => e.full),
            meta: displayedEntries.map(e => ({ timestamp: e.timestamp, messageId: e.messageId, imageIndex: e.imageIndex, thumb: e.thumb, tags: e.tags, directMediaUrl: e.directMediaUrl, source: e.source, uploadSource: e.uploadSource, meetingDate: e.meetingDate, photoId: e.photoId, sourceMessageId: e.sourceMessageId, sourceImageIndex: e.sourceImageIndex, mediaKey: e.mediaKey, refKey: e.refKey })),
            index: idx
          }),
          onBroken: (e, brokenInfo) => handleBrokenPhoto(entry, brokenInfo),
          style: { width: '100%', aspectRatio: '1 / 1', objectFit: 'cover', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }
        }))
      ),
      /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: openGalleryPage,
        style: {
          width: '100%',
          backgroundColor: 'color-mix(in srgb, var(--bg-primary) 96%, black)',
          border: 'none',
          borderRadius: 'var(--radius-md)',
          padding: '8px 0',
          marginTop: '10px',
          fontSize: 'var(--font-size-base)',
          fontWeight: 'bold',
          color: 'var(--text-main)',
          cursor: 'pointer',
          textAlign: 'center'
        }
      }, "갤러리 더보기")
    ),
    lightbox && /*#__PURE__*/React.createElement(Lightbox, {
      urls: lightbox.urls,
      index: lightbox.index,
      meta: lightbox.meta,
      onClose: () => setLightbox(null),
      onNavigate: i => setLightbox(prev => prev ? { ...prev, index: i } : prev),
      showToast,
      onPromoteImageUrl,
      onSaveImageTags,
      onSearchTag,
      onDeletePhoto,
      onReplacePhoto,
      onJumpToChatMessage: (msgId) => { setLightbox(null); if (typeof onJumpToChatMessage === 'function') onJumpToChatMessage(msgId); },
      onJumpToMemo: (memoId) => { setLightbox(null); if (typeof onJumpToMemo === 'function') onJumpToMemo(memoId); },
      onJumpToMeetingDate: (dateStr, tab) => { setLightbox(null); if (typeof onJumpToMeetingDate === 'function') onJumpToMeetingDate(dateStr, tab); },
      onJumpToGallery: (msgId, idx, url) => { setLightbox(null); if (typeof onJumpToGallery === 'function') onJumpToGallery(msgId, idx, url); },
      onGetChatMessageOrdinal,
      onGetGalleryPhotoOrdinal,
      onRequestConfirm
    })
  );
}

export function SummaryList({
  calendar,
  onSelectDate
}) {
  const React = window.React;
  const __comp = window.GATHER_UI_COMPONENTS || {};
  const SectionCountBadge = __comp.SectionCountBadge;
  const SectionToggleButton = __comp.SectionToggleButton;

  const [collapsedSections, setCollapsedSections] = React.useState({
    partial: false,
    all: true,
    confirmed: true,
    past: true
  });
  const SUMMARY_LIST_PAGE = 10;
  const [allListLimit, setAllListLimit] = React.useState(SUMMARY_LIST_PAGE);
  const [confirmedListLimit, setConfirmedListLimit] = React.useState(SUMMARY_LIST_PAGE);
  const toggleSection = sectionKey => {
    setCollapsedSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };
  const handleSectionTitleKeyDown = (event, sectionKey) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    toggleSection(sectionKey);
  };
  const activeParticipants = getActiveParticipants(calendar);
  const totalCount = activeParticipants.length || 0;
  const availabilities = getActiveAvailabilities(calendar);
  const participantsMap = activeParticipants.reduce((acc, p) => {
    acc[p.id] = p;
    return acc;
  }, {});
  const dateMap = availabilities.reduce((acc, e) => {
    if (!acc[e.date]) acc[e.date] = [];
    acc[e.date].push(e);
    return acc;
  }, {});
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  // Threshold = totalCount - 2, only show partial section when totalCount >= 6
  // 4명 → 전원만 | 6명 → 4명 이상 + 전원 | 8명 → 6명 이상 + 전원
  const thresholdN = totalCount >= 6 ? totalCount - 2 : 0;

  // 1. All-available dates: only count active participants (those still in participantsMap)
  const allAvailableDates = Object.keys(dateMap).filter(d => {
    const entries = dateMap[d].filter(e => participantsMap[e.participantId]);
    const uniqueParticipants = new Set(entries.map(e => e.participantId));
    return totalCount > 0 && uniqueParticipants.size === totalCount;
  });
  const allAvailableSet = new Set(allAvailableDates);

  // 2. Partial-available dates (MIN_THRESHOLD <= availCount < totalCount), excluding all-available
  const partialAvailableDates = thresholdN > 0 ? Object.keys(dateMap).filter(d => {
    if (allAvailableSet.has(d)) return false;
    const entries = dateMap[d].filter(e => participantsMap[e.participantId]);
    const uniqueParticipants = new Set(entries.map(e => e.participantId));
    const cnt = uniqueParticipants.size;
    return cnt >= thresholdN && cnt < totalCount;
  }) : [];

  // Sort descending: newest at top, oldest at bottom
  const getSortedDates = datesList => {
    return [...datesList].sort((a, b) => b.localeCompare(a));
  };

  // Future only — past availability dates are not shown here; confirmed meetings (past or
  // future) still appear in the '모임 확정' section below. Confirmed meetings are excluded
  // from '전원 참석 가능' entirely -- once a date is confirmed it lives on the calendar's
  // own banner bubble instead, so it shouldn't linger here as merely "possible".
  const sortedAllDates = getSortedDates(allAvailableDates.filter(d => d >= todayStr && !isDateConfirmedMeeting(calendar, d)));
  const sortedPartialDates = getSortedDates(partialAvailableDates.filter(d => d >= todayStr));

  // 3. Confirmed-meeting dates -- every date promoted to 모임확정, past or future.
  const confirmedDates = getSortedDates(getTrulyConfirmedMeetings(calendar).filter(m => isValidDateString(m?.date)).map(m => m.date));

  // '6인 이상 참석 가능' / '전원 참석 가능' / '모임 확정' only ever show when they have at least
  // one matching date -- an empty one hides its title entirely rather than rendering a
  // placeholder. Track which sections are actually visible so dividers between them only
  // appear between two sections that both render.
  const isPartialVisible = thresholdN > 0 && sortedPartialDates.length > 0;
  const isAllVisible = sortedAllDates.length > 0;
  // '모임 확정' moved off the main screen entirely, onto its own 히스토리 page (see HistoryView
  // below) -- forcing this false hides the section (and its divider, gated on the same flag)
  // without touching the JSX below it, so there's no risk of a stray unbalanced paren from
  // hand-editing that large nested block.
  const isConfirmedVisible = false;
  const anyBeforeAll = isPartialVisible;
  const anyBeforeConfirmed = isPartialVisible || isAllVisible;

  // Nothing to show (common now that 모임 확정 always renders false here -- see above) -- an
  // empty .summary-card shell used to still take up a visible gap on the main screen below chat.
  if (!isPartialVisible && !isAllVisible && !isConfirmedVisible) return null;

  return /*#__PURE__*/React.createElement("div", {
    className: "summary-card",
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '20px'
    }
  }, thresholdN > 0 && sortedPartialDates.length > 0 && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: `summary-title is-toggleable${collapsedSections.partial ? ' is-collapsed' : ''}`,
    role: "button",
    tabIndex: 0,
    "aria-expanded": !collapsedSections.partial,
    onClick: () => toggleSection('partial'),
    onKeyDown: event => handleSectionTitleKeyDown(event, 'partial'),
    "data-no-press-feedback": true,
    style: {
      color: '#2563EB',
      marginBottom: '12px'
    }
  }, /*#__PURE__*/React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    width: "20",
    height: "20",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    "stroke-width": "2.5",
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
    style: {
      marginRight: '4px'
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "9",
    cy: "7",
    r: "4"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M22 21v-2a4 4 0 0 0-3-3.87"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M16 3.13a4 4 0 0 1 0 7.75"
  })), thresholdN, "\uBA85 \uC774\uC0C1 \uCC38\uC11D \uAC00\uB2A5 ", /*#__PURE__*/React.createElement(SectionCountBadge, { count: sortedPartialDates.length }), /*#__PURE__*/React.createElement(SectionToggleButton, {
    collapsed: collapsedSections.partial,
    onToggle: () => toggleSection('partial'),
    label: collapsedSections.partial ? `${thresholdN}\uBA85 \uC774\uC0C1 \uCC38\uC11D \uAC00\uB2A5 \uD3BC\uCE58\uAE30` : `${thresholdN}\uBA85 \uC774\uC0C1 \uCC38\uC11D \uAC00\uB2A5 \uC811\uAE30`
  })), !collapsedSections.partial && /*#__PURE__*/React.createElement("div", null, sortedPartialDates.map(d => {
    const dateEntries = (dateMap[d] || []).filter(e => participantsMap[e.participantId] && !isTombstone(e));
    const formattedDateStr = formatDateWithDayName(d);
    const memoEntries = dateEntries.filter(e => e.note && e.note.trim().length > 0);
    const isPast = d < todayStr;
    const availCount = new Set(dateEntries.map(e => e.participantId)).size;
    const isConfirmed = isDateConfirmedMeeting(calendar, d);
    return /*#__PURE__*/React.createElement("button", {
      key: d,
      className: `date-item-btn ${isPast ? 'is-past' : isConfirmed ? 'is-confirmed' : 'is-available'}`,
      onClick: () => onSelectDate(d)
    }, /*#__PURE__*/React.createElement("div", {
      className: "date-item-left"
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontWeight: 800,
        color: isPast ? '#94A3B8' : '#2563EB',
        fontSize: '0.95rem'
      }
    }, formattedDateStr), memoEntries.length > 0 && /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        flexWrap: 'wrap'
      }
    }, memoEntries.map(e => {
      const p = participantsMap[e.participantId];
      if (!p) return null;
      const memoUrl = extractFirstUrl(e.note);
      const memoText = memoUrl ? removeFirstUrl(e.note) : e.note.trim();
      if (!memoText) return null;
      return /*#__PURE__*/React.createElement("span", {
        key: e.participantId || p.id,
        className: "memo-capsule-badge",
        style: isPast ? {
          backgroundColor: 'transparent',
          color: p.color,
          border: `1px solid ${p.color}`,
          boxShadow: 'none'
        } : {
          backgroundColor: p.color,
          color: getContrastTextColor(p.color)
        },
        title: `${p.name}: ${memoText}`
      }, memoText);
    }))), /*#__PURE__*/React.createElement("span", {
      className: `date-item-badge ${isPast ? 'is-past' : isConfirmed ? 'is-confirmed' : 'is-available'}`,
      style: {
        background: isPast ? '#E2E8F0' : isConfirmed ? '#F3E8FF' : '#DBEAFE',
        color: isPast ? '#64748B' : isConfirmed ? '#7C3AED' : '#1D4ED8',
        border: isPast ? 'none' : isConfirmed ? '1px solid #E9D5FF' : '1px solid #BFDBFE'
      }
    }, isPast ? '지나간 모임' : isConfirmed ? '확정모임' : `${availCount}명 가능 (${availCount}/${totalCount}명)`));
  }))), anyBeforeAll && isAllVisible && /*#__PURE__*/React.createElement("div", {
    className: "summary-section-divider"
  }), isAllVisible && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: `summary-title is-toggleable${collapsedSections.all ? ' is-collapsed' : ''}`,
    role: "button",
    tabIndex: 0,
    "aria-expanded": !collapsedSections.all,
    onClick: () => toggleSection('all'),
    onKeyDown: event => handleSectionTitleKeyDown(event, 'all'),
    "data-no-press-feedback": true,
    style: {
      color: 'var(--status-green)',
      marginBottom: '12px'
    }
  }, /*#__PURE__*/React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    width: "20",
    height: "20",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    "stroke-width": "2.5",
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
    style: {
      marginRight: '4px'
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "m9 12 2 2 4-4"
  })), "\uC804\uC6D0 \uCC38\uC11D \uAC00\uB2A5 ", /*#__PURE__*/React.createElement(SectionCountBadge, { count: sortedAllDates.length }), /*#__PURE__*/React.createElement(SectionToggleButton, {
    collapsed: collapsedSections.all,
    onToggle: () => toggleSection('all'),
    label: collapsedSections.all ? "\uC804\uC6D0 \uCC38\uC11D \uAC00\uB2A5 \uD3BC\uCE58\uAE30" : "\uC804\uC6D0 \uCC38\uC11D \uAC00\uB2A5 \uC811\uAE30"
  })), !collapsedSections.all && (sortedAllDates.length === 0 ? /*#__PURE__*/React.createElement("div", {
    style: {
      color: 'var(--text-muted)',
      fontSize: 'var(--font-size-base)',
      padding: '10px 0'
    }
  }, "\uC544\uC9C1 \uCC38\uC5EC\uC790 \uC804\uC6D0\uC774 \uAC00\uB2A5\uD55C \uB0A0\uC9DC\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4. \uCE98\uB9B0\uB354\uC5D0\uC11C \uB0A0\uC9DC\uB97C \uC120\uD0DD\uD558\uC5EC \uAC00\uB2A5 \uC5EC\uBD80\uB97C \uD45C\uAE30\uD574\uBCF4\uC138\uC694!") : /*#__PURE__*/React.createElement("div", null, sortedAllDates.slice(0, allListLimit).map(d => {
    const dateEntries = (dateMap[d] || []).filter(e => participantsMap[e.participantId] && !isTombstone(e));
    const formattedDateStr = formatDateWithDayName(d);
    const memoEntries = dateEntries.filter(e => e.note && e.note.trim().length > 0);
    const isPast = d < todayStr;
    return /*#__PURE__*/React.createElement("button", {
      key: d,
      className: `date-item-btn${isPast ? ' is-past' : ' is-all'}`,
      onClick: () => onSelectDate(d),
      style: {
        flexDirection: 'column',
        alignItems: 'flex-start'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        gap: '8px'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontWeight: 800,
        color: isPast ? '#94A3B8' : 'var(--status-green)',
        fontSize: '0.95rem',
        minWidth: 0,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
      }
    }, formattedDateStr), /*#__PURE__*/React.createElement("span", {
      className: `date-item-badge ${isPast ? 'is-past' : 'is-all'}`,
      style: {
        background: isPast ? '#E2E8F0' : 'var(--status-green)',
        color: isPast ? '#64748B' : '#FFF',
        border: 'none',
        flexShrink: 0
      }
    }, isPast ? '지나간 모임' : '전원 가능')), memoEntries.length > 0 && /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        flexWrap: 'wrap'
      }
    }, memoEntries.map(e => {
      const p = participantsMap[e.participantId];
      if (!p) return null;
      const memoUrl = extractFirstUrl(e.note);
      const memoText = memoUrl ? removeFirstUrl(e.note) : e.note.trim();
      if (!memoText) return null;
      return /*#__PURE__*/React.createElement("span", {
        key: e.participantId || p.id,
        className: "memo-capsule-badge",
        style: isPast ? {
          backgroundColor: 'var(--bg-primary)',
          color: 'var(--text-muted)',
          border: `1px solid ${p.color}`,
          boxShadow: 'none'
        } : {
          backgroundColor: p.color,
          color: getContrastTextColor(p.color)
        },
        title: `${p.name}: ${memoText}`
      }, memoText);
    })));
  }), ((() => {
      const total = sortedAllDates.length;
      const shown = Math.min(allListLimit, total);
      if (!(total > shown)) return null;
      const step = SUMMARY_LIST_PAGE;
      return /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: () => setAllListLimit(prev => prev + step),
        style: {
          width: '100%', marginTop: '4px', marginBottom: '6px', padding: '10px 0',
          border: 'none', borderRadius: 'var(--radius-md)',
          backgroundColor: 'color-mix(in srgb, var(--bg-primary) 96%, black)',
          color: 'var(--text-main)', fontSize: 'var(--font-size-base)', fontWeight: 700, cursor: 'pointer', textAlign: 'center'
        }
      }, `더보기 (총 ${total}개 중 ${shown}개)`);
    })())))), anyBeforeConfirmed && isConfirmedVisible && /*#__PURE__*/React.createElement("div", {
    className: "summary-section-divider"
  }), isConfirmedVisible && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: `summary-title is-toggleable${collapsedSections.confirmed ? ' is-collapsed' : ''}`,
    role: "button",
    tabIndex: 0,
    "aria-expanded": !collapsedSections.confirmed,
    onClick: () => toggleSection('confirmed'),
    onKeyDown: event => handleSectionTitleKeyDown(event, 'confirmed'),
    "data-no-press-feedback": true,
    style: {
      color: '#7C3AED',
      marginBottom: '12px'
    }
  }, /*#__PURE__*/React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    width: "20",
    height: "20",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    "stroke-width": "2.5",
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
    style: {
      marginRight: '4px'
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "m9 12 2 2 4-4"
  })), "모임 확정 ", /*#__PURE__*/React.createElement(SectionCountBadge, { count: confirmedDates.length }), /*#__PURE__*/React.createElement(SectionToggleButton, {
    collapsed: collapsedSections.confirmed,
    onToggle: () => toggleSection('confirmed'),
    label: collapsedSections.confirmed ? "모임 확정 펼치기" : "모임 확정 접기"
  })), !collapsedSections.confirmed && /*#__PURE__*/React.createElement("div", null, confirmedDates.slice(0, confirmedListLimit).map(d => {
    const dateEntries = (dateMap[d] || []).filter(e => participantsMap[e.participantId] && !isTombstone(e));
    const formattedDateStr = formatDateWithDayName(d);
    const memoEntries = dateEntries.filter(e => e.note && e.note.trim().length > 0);
    const isPast = d < todayStr;
    const ddayLabel = isPast ? '지난 모임' : (() => {
      const dday = calculateDday(d);
      return dday <= 0 ? 'D-DAY' : `D-${dday}`;
    })();
    return /*#__PURE__*/React.createElement("button", {
      key: d,
      className: `date-item-btn ${isPast ? 'is-past' : 'is-confirmed'} confirmed-meeting-card confirmed-meeting-surface`,
      onClick: () => onSelectDate(d),
      style: {
        flexDirection: 'column',
        alignItems: 'flex-start'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        gap: '8px'
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "confirmed-meeting-date",
      style: {
        fontWeight: 800,
        color: isPast ? '#94A3B8' : '#FFFFFF',
        fontSize: '0.95rem',
        minWidth: 0,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
      }
    }, isPast ? formatDateWithDayName(d) : formatConfirmedMeetingLabel(d)), /*#__PURE__*/React.createElement("span", {
      className: `date-item-badge dday-badge ${isPast ? 'is-past' : 'is-confirmed'}`,
      style: {
        flexShrink: 0
      }
    }, ddayLabel)), memoEntries.length > 0 && /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        flexWrap: 'wrap'
      }
    }, memoEntries.map(e => {
      const p = participantsMap[e.participantId];
      if (!p) return null;
      const memoUrl = extractFirstUrl(e.note);
      const memoText = memoUrl ? removeFirstUrl(e.note) : e.note.trim();
      if (!memoText) return null;
      return /*#__PURE__*/React.createElement("span", {
        key: e.participantId || p.id,
        className: `memo-capsule-badge ${isPast ? 'is-past' : ''}`,
        style: isPast ? {
          backgroundColor: 'transparent',
          background: 'transparent',
          color: p.color,
          border: `1px solid ${p.color}`,
          boxShadow: 'none'
        } : {
          backgroundColor: p.color,
          color: getContrastTextColor(p.color)
        },
        title: `${p.name}: ${memoText}`
      }, memoText);
    })));
  }), ((() => {
      const total = confirmedDates.length;
      const shown = Math.min(confirmedListLimit, total);
      if (!(total > shown)) return null;
      const step = SUMMARY_LIST_PAGE;
      return /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: () => setConfirmedListLimit(prev => prev + step),
        style: {
          width: '100%', marginTop: '4px', marginBottom: '6px', padding: '10px 0',
          border: 'none', borderRadius: 'var(--radius-md)',
          backgroundColor: 'color-mix(in srgb, var(--bg-primary) 96%, black)',
          color: 'var(--text-main)', fontSize: 'var(--font-size-base)', fontWeight: 700, cursor: 'pointer', textAlign: 'center'
        }
      }, `더보기 (총 ${total}개 중 ${shown}개)`);
    })()))));
}

// Opens Kakao Map centered on a specific point with a labeled marker -- a plain link URL, no API
// key needed (unlike Kakao's search/local APIs). getPlaceKakaoRouteUrl exists as a cross-file
// bridge but has no real implementation anywhere in the app, so it always resolves to undefined;
// building the well-known link format directly here avoids depending on that dead reference.
function getKakaoMapLinkUrl(place) {
  if (!place || !Number.isFinite(place.lat) || !Number.isFinite(place.lng)) return null;
  const label = encodeURIComponent(place.alias || place.name || '장소');
  return `https://map.kakao.com/link/map/${label},${place.lat},${place.lng}`;
}

// Full-page '히스토리' view -- every confirmed meeting date (모임 확정), moved off the main
// calendar screen onto its own page. Each card also folds in whatever place(s) were registered
// for that date (see doesPlaceMatchDate), since a confirmed meeting's place is exactly the kind
// of detail worth keeping alongside its history entry.
export function HistoryView({
  calendar, onBack, onSelectDate, onChangeView, onOpenAppSettings,
  chatCount = 0, settlementBadge = null, galleryCount = 0, placeCount = 0, memoCount = 0, historyCount = 0,
  chatLastAuthor = null, settlementLastDate = null, galleryLastDate = null, placeLastName = null, memoLastTitleWord = null,
  showSettlement = true, onOpenCreateSettlement,
  isDarkTheme, onToggleTheme, fontScalePercent, onDecreaseFont, onIncreaseFont,
  isChatNotifyEnabled, onToggleChatNotifications, syncStatus = null
}) {
  const React = window.React;
  const __deps = window.GATHER_UI_DEPS || {};
  const __comp = window.GATHER_UI_COMPONENTS || {};
  const BackArrowIcon = __comp.BackArrowIcon || __deps.BackArrowIcon;
  const ThreeLinesIcon = __comp.ThreeLinesIcon || __deps.ThreeLinesIcon;
  const SmallXIcon = __comp.SmallXIcon || __deps.SmallXIcon;
  const SearchIcon = __comp.SearchIcon || __deps.SearchIcon;
  const FolderClockIcon = __comp.FolderClockIcon || __deps.FolderClockIcon;
  const MapPinIcon = __comp.MapPinIcon || __deps.MapPinIcon;
  const InlineSearchBar = __comp.InlineSearchBar || __deps.InlineSearchBar;
  const WeatherBadge = __comp.WeatherBadge || __deps.WeatherBadge;
  const SharedAppNavBlock = __comp.SharedAppNavBlock || __deps.SharedAppNavBlock;
  const SharedSideMenuFooter = __comp.SharedSideMenuFooter || __deps.SharedSideMenuFooter;

  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');

  const activeParticipants = getActiveParticipants(calendar);
  const participantsMap = activeParticipants.reduce((acc, p) => { acc[p.id] = p; return acc; }, {});
  const availabilities = getActiveAvailabilities(calendar);
  const dateMap = availabilities.reduce((acc, e) => {
    if (!acc[e.date]) acc[e.date] = [];
    acc[e.date].push(e);
    return acc;
  }, {});
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const allConfirmedDates = [...getTrulyConfirmedMeetings(calendar).filter(m => isValidDateString(m?.date)).map(m => m.date)]
    .sort((a, b) => b.localeCompare(a));

  const q = searchQuery.trim().toLowerCase();
  const confirmedDates = !q ? allConfirmedDates : allConfirmedDates.filter(d => {
    const dateEntries = (dateMap[d] || []).filter(e => participantsMap[e.participantId]);
    const namesMatch = dateEntries.some(e => (participantsMap[e.participantId]?.name || '').toLowerCase().includes(q));
    const memoMatch = dateEntries.some(e => (e.note || '').toLowerCase().includes(q));
    const placeMatch = getCalendarPlaces(calendar).filter(p => doesPlaceMatchDate(p, d)).some(p =>
      (p.alias || p.name || '').toLowerCase().includes(q) || (p.address || '').toLowerCase().includes(q)
    );
    return d.includes(q) || namesMatch || memoMatch || placeMatch;
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
    /*#__PURE__*/React.createElement("div", {
      className: "places-view-header",
      style: {
        position: 'relative', height: '56px',
        backgroundColor: 'var(--bg-card)', borderBottom: '1px solid var(--border-subtle)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 16px', zIndex: 1010, flexShrink: 0
      }
    },
      /*#__PURE__*/React.createElement("button", {
        type: "button", onClick: onBack, "aria-label": "뒤로가기",
        style: {
          width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'transparent', border: 'none',
          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-muted)'
        }
      }, BackArrowIcon ? /*#__PURE__*/React.createElement(BackArrowIcon, { size: 22 }) : "←"),
      /*#__PURE__*/React.createElement("div", {
        style: {
          position: 'absolute', left: '50%', transform: 'translateX(-50%)',
          display: 'flex', alignItems: 'center', fontWeight: 800, fontSize: '0.95rem',
          color: 'var(--text-main)', whiteSpace: 'nowrap', pointerEvents: 'none'
        }
      }, calendar.title, " 히스토리"),
      /*#__PURE__*/React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '8px' } },
        /*#__PURE__*/React.createElement("button", {
          type: "button", onClick: () => setIsSearchOpen(v => !v), title: "모임 검색", "aria-label": "모임 검색",
          style: { background: 'none', border: 'none', cursor: 'pointer', padding: '6px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }
        }, SearchIcon ? /*#__PURE__*/React.createElement(SearchIcon, null) : "🔍"),
        /*#__PURE__*/React.createElement("button", {
          type: "button", onClick: () => setIsMenuOpen(true), title: "메뉴", "aria-label": "메뉴 열기",
          style: { background: 'none', border: 'none', cursor: 'pointer', padding: '6px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }
        }, ThreeLinesIcon ? /*#__PURE__*/React.createElement(ThreeLinesIcon, { size: 22 }) : "≡")
      )
    ),
    isSearchOpen && InlineSearchBar && /*#__PURE__*/React.createElement(InlineSearchBar, {
      value: searchQuery,
      placeholder: "날짜·참여자·메모·장소 검색...",
      onChange: e => setSearchQuery(e.target.value),
      trailing: searchQuery ? /*#__PURE__*/React.createElement("button", {
        type: "button", onClick: () => setSearchQuery(''),
        style: { border: 'none', background: 'none', color: 'var(--text-muted)', fontSize: 'var(--font-size-md)', cursor: 'pointer', fontWeight: 600, flexShrink: 0 }
      }, "초기화") : null
    }),
    /*#__PURE__*/React.createElement("div", {
      style: { flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }
    },
      confirmedDates.length === 0 ? /*#__PURE__*/React.createElement("div", {
        style: { textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)', fontSize: 'var(--font-size-md)' }
      }, q ? "검색 결과가 없습니다." : "아직 확정된 모임이 없습니다.") : confirmedDates.map(d => {
        const dateEntries = (dateMap[d] || []).filter(e => participantsMap[e.participantId] && !isTombstone(e));
        const memoEntries = dateEntries.filter(e => e.note && e.note.trim().length > 0);
        const isPast = d < todayStr;
        const ddayLabel = isPast ? '지난 모임' : (() => {
          const dday = calculateDday(d);
          return dday <= 0 ? 'D-DAY' : `D-${dday}`;
        })();
        const datePlaces = getCalendarPlaces(calendar).filter(p => doesPlaceMatchDate(p, d));
        return /*#__PURE__*/React.createElement("button", {
          key: d,
          className: `date-item-btn ${isPast ? 'is-past' : 'is-confirmed'} history-meeting-card confirmed-meeting-surface`,
          onClick: () => onSelectDate(d),
          style: { flexDirection: 'column', alignItems: 'flex-start' }
        },
          /*#__PURE__*/React.createElement("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', gap: '8px' } },
            /*#__PURE__*/React.createElement("span", {
              className: "confirmed-meeting-date",
              style: { fontWeight: 800, color: isPast ? '#94A3B8' : '#FFFFFF', fontSize: '0.95rem', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }
            }, isPast ? formatDateWithDayName(d) : formatConfirmedMeetingLabel(d)),
            /*#__PURE__*/React.createElement("span", { className: `date-item-badge dday-badge ${isPast ? 'is-past' : 'is-confirmed'}`, style: { flexShrink: 0 } }, ddayLabel)
          ),
          memoEntries.length > 0 && /*#__PURE__*/React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' } },
            memoEntries.map(e => {
              const p = participantsMap[e.participantId];
              if (!p) return null;
              const memoUrl = extractFirstUrl(e.note);
              const memoText = memoUrl ? removeFirstUrl(e.note) : e.note.trim();
              if (!memoText) return null;
              return /*#__PURE__*/React.createElement("span", {
                key: e.participantId || p.id,
                className: `memo-capsule-badge ${isPast ? 'is-past' : ''}`,
                style: isPast
                  ? { backgroundColor: 'transparent', background: 'transparent', color: p.color, border: `1px solid ${p.color}`, boxShadow: 'none' }
                  : { backgroundColor: p.color, color: getContrastTextColor(p.color) },
                title: `${p.name}: ${memoText}`
              }, memoText);
            })
          ),
          datePlaces.length > 0 && /*#__PURE__*/React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '2px', width: '100%' } },
            datePlaces.map(place => {
              const mapUrl = getKakaoMapLinkUrl(place);
              const placeName = place.alias || place.name;
              const address = place.address ? getDisplayPlaceAddress(place) : '';
              return /*#__PURE__*/React.createElement("div", {
                key: place.id,
                className: "place-memo-stack",
                style: {
                  display: 'flex', alignItems: 'flex-start', gap: '6px',
                  backgroundColor: 'rgba(255, 255, 255, 0.92)', borderRadius: 'var(--radius-md)',
                  padding: '7px 10px', width: '100%', boxSizing: 'border-box'
                }
              },
                MapPinIcon && /*#__PURE__*/React.createElement(MapPinIcon, { size: 14, style: { flexShrink: 0, marginTop: '2px', color: '#7C3AED' } }),
                /*#__PURE__*/React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: '1px', minWidth: 0 } },
                  mapUrl
                    ? /*#__PURE__*/React.createElement("a", {
                        href: mapUrl, target: "_blank", rel: "noreferrer",
                        onClick: e => e.stopPropagation(),
                        style: { fontSize: 'var(--font-size-sm)', fontWeight: 800, color: 'var(--text-main)', textDecoration: 'none', wordBreak: 'break-word' }
                      }, placeName)
                    : /*#__PURE__*/React.createElement("span", { style: { fontSize: 'var(--font-size-sm)', fontWeight: 800, color: 'var(--text-main)', wordBreak: 'break-word' } }, placeName),
                  address && /*#__PURE__*/React.createElement("span", { style: { fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', wordBreak: 'break-word' } }, address)
                )
              );
            })
          )
        );
      })
    ),

    isMenuOpen && /*#__PURE__*/React.createElement("div", {
      className: "admin-side-menu-overlay", style: { zIndex: 12000 }, onClick: () => setIsMenuOpen(false)
    }, /*#__PURE__*/React.createElement("div", {
      className: "admin-side-menu", onClick: e => e.stopPropagation(), role: "dialog", "aria-label": "히스토리 메뉴"
    },
      /*#__PURE__*/React.createElement("div", { className: "admin-side-menu-header" },
        /*#__PURE__*/React.createElement("div", { className: "admin-side-menu-brand" },
          /*#__PURE__*/React.createElement("div", { className: "admin-side-menu-copy" },
            /*#__PURE__*/React.createElement("button", {
              type: "button", className: "admin-side-menu-title", title: "메인 화면으로 이동", "aria-label": "메인 화면으로 이동",
              onClick: () => { setIsMenuOpen(false); if (typeof onChangeView === 'function') onChangeView('calendar'); else if (typeof onBack === 'function') onBack(); },
              style: { background: 'none', border: 'none', padding: 0, margin: 0, color: 'var(--text-main)', fontSize: '1.05rem', fontWeight: 800, cursor: 'pointer' }
            }, "히스토리")
          )
        ),
        /*#__PURE__*/React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 } },
          WeatherBadge ? /*#__PURE__*/React.createElement(WeatherBadge, { weatherLocation: calendar && calendar.weatherLocation }) : null,
          /*#__PURE__*/React.createElement("button", {
            type: "button", className: "admin-side-menu-close-btn", title: "메뉴 닫기", "aria-label": "메뉴 닫기",
            onClick: () => setIsMenuOpen(false)
          }, SmallXIcon ? /*#__PURE__*/React.createElement(SmallXIcon, { size: 20 }) : "✕")
        )
      ),
      /*#__PURE__*/React.createElement("div", { className: "admin-side-menu-list" },
        /*#__PURE__*/React.createElement("button", {
          type: "button", className: "admin-side-menu-item",
          onClick: () => { setIsMenuOpen(false); setIsSearchOpen(true); }
        },
          /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-icon" }, SearchIcon ? /*#__PURE__*/React.createElement(SearchIcon, null) : "🔍"),
          /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-copy" },
            /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-title" }, "모임 검색"),
            /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-desc" }, "확정된 모임 날짜·장소 검색")
          )
        )
      ),
      typeof SharedAppNavBlock === 'function' && /*#__PURE__*/React.createElement(SharedAppNavBlock, {
        onClose: () => setIsMenuOpen(false),
        onChangeView: onChangeView,
        onOpenCreateSettlement: onOpenCreateSettlement,
        showSettlement: showSettlement,
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
        onClose: () => setIsMenuOpen(false),
        onOpenSettings: onOpenAppSettings
      })
    ))
  );
}

  if (typeof window !== 'undefined') {
  window.GATHER_UI_COMPONENTS = Object.assign({}, window.GATHER_UI_COMPONENTS || {}, {
    SectionCountBadge: SectionCountBadge,
    SectionToggleButton: SectionToggleButton,
    SearchCategoryTabs: SearchCategoryTabs,
    SimpleBottomSheetPicker: SimpleBottomSheetPicker,
    ParticipantBackdrop: ParticipantBackdrop,
    PhotoGallery: PhotoGallery,
    MemoPreviewSection: MemoPreviewSection,
    SummaryList: SummaryList,
    HistoryView: HistoryView,
  });
}
