/**
 * Summary list, photo gallery, category tabs (P4-11)
 */

/* P6 ESM classic-compat: free names that live scripts shared via global lexical scope */
const GATHER_APP_CALENDAR_DATA = window.GATHER_APP_CALENDAR_DATA || {};
const GATHER_APP_CHAT_DATA = window.GATHER_APP_CHAT_DATA || {};
const GATHER_APP_UTILS = window.GATHER_APP_UTILS || {};
const GATHER_APP_CONSTANTS = window.GATHER_APP_CONSTANTS || {};
const BULK_NO_PARTICIPANT_ID = GATHER_APP_CONSTANTS.BULK_NO_PARTICIPANT_ID || '__none__';
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
function normalizeDomesticKoreanAddress(...args) {
  const f = __gatherUiDeps().normalizeDomesticKoreanAddress || GATHER_APP_UTILS.normalizeDomesticKoreanAddress;
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

// Combines chat message images, memo images, and confirmed-meeting photos into one flat, deduped,
// newest-first list -- shared by PhotoGallery (갤러리 페이지) and HistoryView's 인물/추억 tabs so
// both browse exactly the same photo set instead of two independently-built ones drifting apart.
function buildCombinedPhotoEntries(chatMessages, memos, calendar) {
  const __deps = window.GATHER_UI_DEPS || {};
  const resolveMeetingPhotoDisplay = __deps.resolveMeetingPhotoDisplay;
  const sorted = [...(chatMessages || [])].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
  const chatEntries = sorted.flatMap(msg => {
    if (!msg || isTombstone(msg)) return [];
    const directEntry = getMessageDirectMediaEntry(msg);
    const entries = directEntry ? [...getMessageImageEntries(msg), directEntry] : getMessageImageEntries(msg);
    return entries.map((entry) => ({ ...entry, source: 'chat', timestamp: msg.timestamp }));
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
    return entries.map(entry => ({ ...entry, tags: memoTagsDisplay, source: 'memo', timestamp: asMsg.timestamp }));
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
export function MemoPreviewSection({ memos = [], calendar = null, onViewAll, onOpenEdit, onTogglePin, onSelectTag, onShare, onCommentsChange, onRequestConfirm, showToast }) {
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
        /*#__PURE__*/React.createElement("span", null, "메모")
      ),
      /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: e => { e.stopPropagation(); openMemoPage(); },
        style: { background: 'none', border: 'none', color: '#3B82F6', fontSize: 'var(--font-size-md)', fontWeight: 800, cursor: 'pointer', padding: '4px 6px', flexShrink: 0 }
      }, "전체보기")
    ),
    /*#__PURE__*/React.createElement("div", {
      style: { display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px' }
    }, MemoCard ? displayedMemos.map(memo => /*#__PURE__*/React.createElement(MemoCard, {
      key: memo.id,
      memo: memo,
      calendar: calendar,
      onOpenEdit: onOpenEdit,
      onTogglePin: () => { if (typeof onTogglePin === 'function') onTogglePin(memo); },
      onShare: () => { if (typeof onShare === 'function') onShare(memo); },
      onSelectTag: onSelectTag,
      onCommentsChange: nextComments => (typeof onCommentsChange === 'function' ? onCommentsChange(memo, nextComments) : false),
      getBorderColor: getMemoPreviewBorderColor,
      onRequestConfirm: onRequestConfirm,
      showToast: showToast,
      effectivePinned: !!memo.isPinned,
      hidePinButton: true,
      variant: 'preview'
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

  const [collapsed, setCollapsed] = React.useState(false);
  const [lightbox, setLightbox] = React.useState(null);
  // Mobile shows a tighter 3x3 grid instead of the desktop 6-wide layout, so the thumbnail cap
  // needs to track the same breakpoint the CSS grid switches on (see .gallery-thumb-grid).
  const [isMobile, setIsMobile] = React.useState(() => typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(max-width: 639px)').matches);
  React.useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined;
    const mq = window.matchMedia('(max-width: 639px)');
    const handleChange = () => setIsMobile(mq.matches);
    handleChange();
    if (mq.addEventListener) mq.addEventListener('change', handleChange);
    else if (mq.addListener) mq.addListener(handleChange);
    return () => {
      if (mq.removeEventListener) mq.removeEventListener('change', handleChange);
      else if (mq.removeListener) mq.removeListener(handleChange);
    };
  }, []);
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

  const photoEntries = React.useMemo(() => buildCombinedPhotoEntries(chatMessages, memos, calendar), [chatMessages, memos, calendar]);
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

  const displayedEntries = visibleEntries
    .filter(e => (e && ((e.thumb && String(e.thumb)) || (e.full && String(e.full)))))
    .slice(0, isMobile ? 9 : 18);
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
        /*#__PURE__*/React.createElement("span", null, "갤러리")
      ),
      /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: e => { e.stopPropagation(); openGalleryPage(); },
        style: {
          border: 'none', background: 'transparent', cursor: 'pointer',
          color: '#3B82F6', fontSize: 'var(--font-size-md)', fontWeight: 700, padding: '4px 6px', flexShrink: 0
        }
      }, "전체보기")
    ),
    !collapsed && displayedEntries.length > 0 && /*#__PURE__*/React.createElement(React.Fragment, null,
      /*#__PURE__*/React.createElement("div", {
        className: "gallery-thumb-grid",
        style: { display: 'grid', gap: '6px', marginTop: '12px' }
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
      )
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
    const entries = dateMap[d].filter(e => participantsMap[e.participantId] || e.participantId === BULK_NO_PARTICIPANT_ID);
    const uniqueParticipants = new Set(entries.map(e => e.participantId));
    return totalCount > 0 && uniqueParticipants.size === totalCount;
  });
  const allAvailableSet = new Set(allAvailableDates);

  // 2. Partial-available dates (MIN_THRESHOLD <= availCount < totalCount), excluding all-available
  const partialAvailableDates = thresholdN > 0 ? Object.keys(dateMap).filter(d => {
    if (allAvailableSet.has(d)) return false;
    const entries = dateMap[d].filter(e => participantsMap[e.participantId] || e.participantId === BULK_NO_PARTICIPANT_ID);
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

  // '6인 이상 참석 가능' / '전원 참석 가능' / '모임 확정' -- all three removed from the main
  // screen entirely per product decision (모임 확정 already lives on its own 히스토리 page; the
  // partial/all-available sections were the last ones still rendering here). Forcing all three
  // flags false hides every section (and the dividers between them, gated on the same flags)
  // without touching the large nested JSX blocks below, so there's no risk of a stray unbalanced
  // paren from hand-editing them -- the early return just below then always fires.
  const isPartialVisible = false;
  const isAllVisible = false;
  const isConfirmedVisible = false;
  const anyBeforeAll = isPartialVisible;
  const anyBeforeConfirmed = isPartialVisible || isAllVisible;

  // Nothing to show (this section is now always hidden -- see above) -- an empty .summary-card
  // shell used to still take up a visible gap on the main screen below chat.
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
    const dateEntries = (dateMap[d] || []).filter(e => (participantsMap[e.participantId] || e.participantId === BULK_NO_PARTICIPANT_ID) && !isTombstone(e));
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
      const p = participantsMap[e.participantId] || (e.participantId === BULK_NO_PARTICIPANT_ID ? { id: BULK_NO_PARTICIPANT_ID, name: '일정', color: '#94A3B8' } : null);
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
    const dateEntries = (dateMap[d] || []).filter(e => (participantsMap[e.participantId] || e.participantId === BULK_NO_PARTICIPANT_ID) && !isTombstone(e));
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
      const p = participantsMap[e.participantId] || (e.participantId === BULK_NO_PARTICIPANT_ID ? { id: BULK_NO_PARTICIPANT_ID, name: '일정', color: '#94A3B8' } : null);
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
    const dateEntries = (dateMap[d] || []).filter(e => (participantsMap[e.participantId] || e.participantId === BULK_NO_PARTICIPANT_ID) && !isTombstone(e));
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
      const p = participantsMap[e.participantId] || (e.participantId === BULK_NO_PARTICIPANT_ID ? { id: BULK_NO_PARTICIPANT_ID, name: '일정', color: '#94A3B8' } : null);
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

// Same chevron-down glyph SimpleBottomSheetPicker renders (see below) -- reused as-is on the
// 시/도·군/구 region triggers so they read as the exact same picker control the rest of the app
// uses, not a bespoke plain-text button. A function (not a module-level element) because it needs
// the caller's own `React` local -- this module never assumes window.React is ready at
// module-evaluation time, only once a component actually renders.
function renderRegionTriggerChevron(React) {
  return /*#__PURE__*/React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg", width: "18", height: "18", viewBox: "0 0 24 24",
    fill: "none", stroke: "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round",
    className: "form-select-chevron"
  }, /*#__PURE__*/React.createElement("path", { stroke: "none", d: "M0 0h24v24H0z", fill: "none" }),
    /*#__PURE__*/React.createElement("path", { d: "M6 9l6 6l6 -6" }));
}

// Shared by HistoryView(보관함) and ContentView(컨텐츠) -- both open the same admin-side-menu
// overlay chrome (brand header/weather badge/close button + page-specific extra items +
// SharedAppNavBlock + SharedSideMenuFooter), differing only in title text and which extra items
// they show above the shared nav block.
function SideMenuOverlay({ isOpen, onClose, homeLabel, ariaLabel, calendar, onGoHome, extraItems = [], navBlockProps, onOpenShare, onOpenAppSettings }) {
  const React = window.React;
  const __comp = window.GATHER_UI_COMPONENTS || {};
  const __deps = window.GATHER_UI_DEPS || {};
  const WeatherBadge = __comp.WeatherBadge || __deps.WeatherBadge;
  const SmallXIcon = __comp.SmallXIcon || __deps.SmallXIcon;
  const SharedAppNavBlock = __comp.SharedAppNavBlock || __deps.SharedAppNavBlock;
  const SharedSideMenuFooter = __comp.SharedSideMenuFooter || __deps.SharedSideMenuFooter;
  if (!isOpen) return null;
  return /*#__PURE__*/React.createElement("div", {
    className: "admin-side-menu-overlay", style: { zIndex: 12000 }, onClick: onClose
  }, /*#__PURE__*/React.createElement("div", {
    className: "admin-side-menu", onClick: e => e.stopPropagation(), role: "dialog", "aria-label": ariaLabel
  },
    /*#__PURE__*/React.createElement("div", { className: "admin-side-menu-header" },
      /*#__PURE__*/React.createElement("div", { className: "admin-side-menu-brand" },
        /*#__PURE__*/React.createElement("div", { className: "admin-side-menu-copy" },
          /*#__PURE__*/React.createElement("button", {
            type: "button", className: "admin-side-menu-title", title: "메인 화면으로 이동", "aria-label": "메인 화면으로 이동",
            onClick: onGoHome,
            style: { background: 'none', border: 'none', padding: 0, margin: 0, color: 'var(--text-main)', fontSize: '1.05rem', fontWeight: 800, cursor: 'pointer' }
          }, homeLabel)
        )
      ),
      /*#__PURE__*/React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 } },
        WeatherBadge ? /*#__PURE__*/React.createElement(WeatherBadge, { weatherLocation: calendar && calendar.weatherLocation }) : null,
        /*#__PURE__*/React.createElement("button", {
          type: "button", className: "admin-side-menu-close-btn", title: "메뉴 닫기", "aria-label": "메뉴 닫기",
          onClick: onClose
        }, SmallXIcon ? /*#__PURE__*/React.createElement(SmallXIcon, { size: 20 }) : "✕")
      )
    ),
    extraItems.length > 0 && /*#__PURE__*/React.createElement("div", { className: "admin-side-menu-list" },
      extraItems.map((it, idx) => /*#__PURE__*/React.createElement("button", {
        key: idx, type: "button", className: "admin-side-menu-item", onClick: it.onClick
      },
        /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-icon" }, it.icon),
        /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-copy" },
          /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-title" }, it.title),
          it.desc && /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-desc" }, it.desc)
        )
      ))
    ),
    typeof SharedAppNavBlock === 'function' && /*#__PURE__*/React.createElement(SharedAppNavBlock, navBlockProps),
    typeof SharedSideMenuFooter === 'function' && /*#__PURE__*/React.createElement(SharedSideMenuFooter, {
      onClose, onOpenShare, onOpenSettings: onOpenAppSettings
    })
  ));
}

// Full-page '히스토리' view -- every confirmed meeting date (모임 확정), moved off the main
// calendar screen onto its own page. Each card also folds in whatever place(s) were registered
// for that date (see doesPlaceMatchDate), since a confirmed meeting's place is exactly the kind
// of detail worth keeping alongside its history entry.
export function HistoryView({
  calendar, onBack, onSelectDate, onChangeView, onOpenAppSettings, onOpenShare = null,
  chatCount = 0, settlementBadge = null, galleryCount = 0, placeCount = 0, memoCount = 0, historyCount = 0,
  chatLastAuthor = null, settlementLastDate = null, galleryLastDate = null, placeLastName = null, memoLastTitleWord = null,
  showSettlement = true, onOpenCreateSettlement,
  isDarkTheme, onToggleTheme, fontScalePercent, onDecreaseFont, onIncreaseFont,
  isChatNotifyEnabled, onToggleChatNotifications, syncStatus = null,
  onAddPersonTag = null, showToast = null,
  anniversaries = [], chatMessages = [], memos = [], setActiveLightbox = null
}) {
  const React = window.React;
  const __deps = window.GATHER_UI_DEPS || {};
  const __comp = window.GATHER_UI_COMPONENTS || {};
  const BackArrowIcon = __comp.BackArrowIcon || __deps.BackArrowIcon;
  const ThreeLinesIcon = __comp.ThreeLinesIcon || __deps.ThreeLinesIcon;
  const SearchIcon = __comp.SearchIcon || __deps.SearchIcon;
  const MapPinIcon = __comp.MapPinIcon || __deps.MapPinIcon;
  const InlineSearchBar = __comp.InlineSearchBar || __deps.InlineSearchBar;
  const UnderlineTabs = __comp.UnderlineTabs || __deps.UnderlineTabs;

  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const HISTORY_TAB_STORAGE_KEY = 'gather_history_tab';
  const VALID_HISTORY_TABS = ['meetings', 'memories', 'people'];
  const [historyTab, setHistoryTab] = React.useState(() => {
    try {
      const saved = localStorage.getItem(HISTORY_TAB_STORAGE_KEY);
      if (VALID_HISTORY_TABS.includes(saved)) return saved;
    } catch (_) { /* private browsing / disabled storage */ }
    return 'meetings';
  });
  const changeHistoryTab = (tab) => {
    if (!VALID_HISTORY_TABS.includes(tab)) return;
    setHistoryTab(tab);
    try { localStorage.setItem(HISTORY_TAB_STORAGE_KEY, tab); } catch (_) { /* best-effort */ }
  };
  // When the side menu navigates to 보관함 again (or any view), force the 지난모임 tab so
  // re-entry always lands there rather than whatever tab was last open.
  const handleHistoryChangeView = (view) => {
    if (view === 'history') changeHistoryTab('meetings');
    if (typeof onChangeView === 'function') onChangeView(view);
  };
  // 인물 탭: 기본 태그는 현재 캘린더 참여자, 그 외에 사용자가 직접 추가한 커스텀 태그
  // (calendar.customPersonTags)도 함께 보여준다.
  const [newPersonTag, setNewPersonTag] = React.useState('');
  const [isAddingPersonTag, setIsAddingPersonTag] = React.useState(false);
  const handleAddPersonTagClick = async () => {
    const label = newPersonTag.trim();
    if (!label || isAddingPersonTag || typeof onAddPersonTag !== 'function') return;
    setIsAddingPersonTag(true);
    try {
      const ok = await onAddPersonTag(label);
      if (ok) setNewPersonTag('');
    } finally {
      setIsAddingPersonTag(false);
    }
  };
  // 채팅방/갤러리 페이지의 고정 헤더와 같은 방식: 상단 헤더+탭을 하나의 position:fixed 묶음으로
  // 만들어서, 아래로 스크롤하면 위로 숨고 위로 스크롤하면 다시 나타나게 한다. 묶음의 실제 높이는
  // ResizeObserver로 직접 측정 -- 갤러리 헤더처럼 고정 픽셀값을 하드코딩하지 않는다.
  const { isHeaderVisible, onScroll: handleHistoryScroll } = useScrollHideHeader();
  const headerStackRef = React.useRef(null);
  const [headerStackHeight, setHeaderStackHeight] = React.useState(0);
  React.useLayoutEffect(() => {
    const el = headerStackRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(entries => {
      const rect = entries[0] && entries[0].contentRect;
      setHeaderStackHeight(Math.round(rect ? rect.height : el.offsetHeight));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  // Content sits below the now-fixed header stack; padding-top reserves exactly its measured
  // height, and drops to a small constant while hidden so the first scroll-up gesture actually
  // moves content instead of only eating reserved empty space (same trick the 갤러리 페이지 uses).
  // Both branches add env(safe-area-inset-top) too, since the header stack itself now starts
  // that far down (see its `top` above) rather than at the very top of the screen.
  const historyContentPaddingTop = isHeaderVisible
    ? `calc(${headerStackHeight}px + env(safe-area-inset-top, 0px))`
    : `calc(12px + env(safe-area-inset-top, 0px))`;

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
    const dateEntries = (dateMap[d] || []).filter(e => participantsMap[e.participantId] || e.participantId === BULK_NO_PARTICIPANT_ID);
    const namesMatch = dateEntries.some(e => (participantsMap[e.participantId]?.name || '').toLowerCase().includes(q));
    const memoMatch = dateEntries.some(e => (e.note || '').toLowerCase().includes(q));
    const placeMatch = getCalendarPlaces(calendar).filter(p => doesPlaceMatchDate(p, d)).some(p =>
      (p.alias || p.name || '').toLowerCase().includes(q) || (p.address || '').toLowerCase().includes(q)
    );
    return d.includes(q) || namesMatch || memoMatch || placeMatch;
  });

  const customPersonTags = Array.isArray(calendar?.customPersonTags) ? calendar.customPersonTags : [];
  const personTagChips = [
    ...activeParticipants.map(p => ({ id: p.id, label: p.name, color: p.color || '#7C3AED' })),
    ...customPersonTags.filter(t => !activeParticipants.some(p => p.name === t)).map(t => ({ id: `custom_${t}`, label: t, color: '#64748B' }))
  ];

  // 인물/추억 탭이 공유하는 사진 목록 -- 갤러리 페이지(PhotoGallery)와 동일한 소스(채팅/메모/모임
  // 사진)를 결합해, 태그(인물)나 날짜(추억)로 걸러 보여준다.
  const historyPhotoEntries = React.useMemo(() => buildCombinedPhotoEntries(chatMessages, memos, calendar), [chatMessages, memos, calendar]);
  const [selectedPersonTag, setSelectedPersonTag] = React.useState(null);
  React.useEffect(() => { setSelectedPersonTag(null); }, [historyTab]);
  const entryTagTokens = entry => String(entry?.tags || '').split(/[,\s#]+/).map(t => t.trim()).filter(Boolean);
  const photosForPersonTag = React.useMemo(() => {
    if (!selectedPersonTag) return [];
    const needle = selectedPersonTag.toLowerCase();
    return historyPhotoEntries.filter(entry => entryTagTokens(entry).some(t => t.toLowerCase() === needle));
  }, [historyPhotoEntries, selectedPersonTag]);
  const openHistoryLightbox = (photos, index) => {
    if (typeof setActiveLightbox !== 'function') return;
    const urls = photos.map(p => p.full || p.thumb).filter(Boolean);
    if (urls.length === 0) return;
    setActiveLightbox({ urls, index });
  };
  // 추억 탭: '여행' 카테고리 기념일의 제목을 기준으로, 그 기간에 등록된 사진을 모아 보여준다.
  const entryDateStr = entry => {
    const ts = Number(entry?.timestamp) || 0;
    if (!ts) return '';
    const d = new Date(ts);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };
  const travelMemoryGroups = React.useMemo(() => {
    return (anniversaries || [])
      .filter(a => a && a.category === 'travel' && a.startDate)
      .map(a => {
        const start = a.startDate;
        const end = a.endDate || a.startDate;
        const photos = historyPhotoEntries.filter(entry => {
          const d = entryDateStr(entry);
          return d && d >= start && d <= end;
        });
        return { id: a.id, title: a.title || '여행', startDate: start, endDate: end, photos };
      })
      .sort((a, b) => (b.startDate || '').localeCompare(a.startDate || ''));
  }, [anniversaries, historyPhotoEntries]);

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
      ref: headerStackRef,
      className: "history-header-stack",
      style: {
        // iOS 홈화면 설치(standalone) 상태에서는 상태바 영역까지 콘텐츠가 그려지므로, top:0
        // 대신 env(safe-area-inset-top)만큼 아래로 밀어야 상태바 아이콘과 겹치지 않고 버튼도
        // 눌린다. 일반 브라우저 탭에서는 이 값이 0이라 동작 변화 없음.
        position: 'fixed', top: 'env(safe-area-inset-top, 0px)', left: 0, right: 0, zIndex: 1010,
        backgroundColor: 'var(--bg-primary)',
        transition: 'transform 0.3s ease',
        transform: isHeaderVisible ? 'translateY(0)' : 'translateY(-100%)'
      }
    },
    /*#__PURE__*/React.createElement("div", {
      className: "places-view-header",
      style: {
        position: 'relative', height: '56px',
        backgroundColor: 'var(--bg-card)', borderBottom: '1px solid var(--border-subtle)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 16px', flexShrink: 0
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
      }, calendar.title, " 보관함"),
      /*#__PURE__*/React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '8px' } },
        /*#__PURE__*/React.createElement("button", {
          type: "button", onClick: () => setIsSearchOpen(v => !v), title: "보관함 검색", "aria-label": "보관함 검색",
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
      onClose: () => { setIsSearchOpen(false); setSearchQuery(''); }
    }),
    UnderlineTabs && /*#__PURE__*/React.createElement(UnderlineTabs, {
      ariaLabel: "보관함 탭",
      value: historyTab,
      onChange: changeHistoryTab,
      options: [
        { value: 'meetings', label: '지난모임' },
        { value: 'memories', label: '추억' },
        { value: 'people', label: '인물' }
      ]
    })
    ), // end history-header-stack
    historyTab === 'meetings' && /*#__PURE__*/React.createElement("div", {
      className: "history-meetings-grid",
      onScroll: handleHistoryScroll,
      style: Object.assign(
        { flex: 1, overflowY: 'auto', padding: '118px 16px 16px' },
        confirmedDates.length === 0 ? { display: 'flex', alignItems: 'center', justifyContent: 'center' } : {}
      )
    },
      confirmedDates.length === 0 ? /*#__PURE__*/React.createElement("div", {
        style: { textAlign: 'center', color: 'var(--text-muted)', fontSize: 'var(--font-size-md)' }
      }, q ? "검색 결과가 없습니다." : "아직 확정된 모임이 없습니다.") : confirmedDates.map(d => {
        const dateEntries = (dateMap[d] || []).filter(e => (participantsMap[e.participantId] || e.participantId === BULK_NO_PARTICIPANT_ID) && !isTombstone(e));
        const memoEntries = dateEntries.filter(e => e.note && e.note.trim().length > 0);
        const isPast = d < todayStr;
        const ddayLabel = isPast ? '지난 모임' : (() => {
          const dday = calculateDday(d);
          return dday <= 0 ? 'D-DAY' : `D-${dday}`;
        })();
        const datePlaces = getCalendarPlaces(calendar).filter(p => doesPlaceMatchDate(p, d));
        return /*#__PURE__*/React.createElement("button", {
          key: d,
          className: `date-item-btn ${isPast ? 'is-past' : 'is-confirmed'} confirmed-meeting-card confirmed-meeting-surface`,
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
          memoEntries.length > 0 && /*#__PURE__*/React.createElement("div", { style: { display: 'flex', alignItems: 'flex-start', gap: '6px', flexWrap: 'wrap' } },
            memoEntries.map(e => {
              const p = participantsMap[e.participantId] || (e.participantId === BULK_NO_PARTICIPANT_ID ? { id: BULK_NO_PARTICIPANT_ID, name: '일정', color: '#94A3B8' } : null);
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
          datePlaces.length > 0 && /*#__PURE__*/React.createElement("div", {
            style: {
              display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '2px', width: '100%',
              ...(isPast ? {} : { mixBlendMode: 'luminosity' })
            }
          },
            datePlaces.map(place => {
              const mapUrl = getKakaoMapLinkUrl(place);
              const placeName = place.alias || place.name;
              const address = place.address ? getDisplayPlaceAddress(place) : '';
              return /*#__PURE__*/React.createElement("div", {
                key: place.id,
                className: "place-memo-stack",
                style: {
                  display: 'flex', alignItems: 'flex-start', gap: '6px',
                  backgroundColor: isPast ? 'transparent' : '#333',
                  borderRadius: isPast ? 0 : 'var(--radius-md)',
                  borderTop: isPast ? '1px solid rgba(0, 0, 0, 0.05)' : 'none',
                  padding: '7px 10px', width: '100%', boxSizing: 'border-box'
                }
              },
                MapPinIcon && /*#__PURE__*/React.createElement(MapPinIcon, { size: 14, style: { flexShrink: 0, marginTop: '2px', color: '#7C3AED' } }),
                /*#__PURE__*/React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: '1px', minWidth: 0 } },
                  mapUrl
                    ? /*#__PURE__*/React.createElement("a", {
                        href: mapUrl, target: "_blank", rel: "noreferrer",
                        onClick: e => e.stopPropagation(),
                        style: { fontSize: 'var(--font-size-sm)', fontWeight: 800, color: isPast ? 'var(--text-main)' : '#fff', textDecoration: 'none', wordBreak: 'break-word' }
                      }, placeName)
                    : /*#__PURE__*/React.createElement("span", { style: { fontSize: 'var(--font-size-sm)', fontWeight: 800, color: isPast ? 'var(--text-main)' : '#fff', wordBreak: 'break-word' } }, placeName),
                  address && /*#__PURE__*/React.createElement("span", { style: { fontSize: 'var(--font-size-xs)', color: isPast ? 'var(--text-muted)' : '#fff', wordBreak: 'break-word' } }, address)
                )
              );
            })
          )
        );
      })
    ),
    historyTab === 'memories' && /*#__PURE__*/React.createElement("div", {
      style: { flex: 1, overflowY: 'auto', padding: '118px 16px 16px', display: 'flex', flexDirection: 'column', gap: '18px' }
    },
      travelMemoryGroups.length === 0
        ? /*#__PURE__*/React.createElement("div", {
            style: {
              flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              gap: '8px', padding: '24px', textAlign: 'center', color: 'var(--text-muted)'
            }
          },
            /*#__PURE__*/React.createElement("span", { style: { fontSize: '2rem' } }, "🗂️"),
            /*#__PURE__*/React.createElement("span", { style: { fontSize: 'var(--font-size-md)', fontWeight: 700, color: 'var(--text-main)' } }, "등록된 여행 일정이 없습니다"),
            /*#__PURE__*/React.createElement("span", { style: { fontSize: 'var(--font-size-sm)' } }, "기념일 등록에서 '여행' 카테고리로 일정을 추가하면, 그 기간에 등록된 사진을 여기 모아 보여줘요.")
          )
        : travelMemoryGroups.map(group => /*#__PURE__*/React.createElement("div", {
            key: group.id,
            style: { display: 'flex', flexDirection: 'column', gap: '8px' }
          },
            /*#__PURE__*/React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: '2px' } },
              /*#__PURE__*/React.createElement("span", { style: { fontSize: 'var(--font-size-md)', fontWeight: 800, color: 'var(--text-main)' } }, group.title),
              /*#__PURE__*/React.createElement("span", { style: { fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' } },
                group.startDate === group.endDate ? group.startDate : `${group.startDate} ~ ${group.endDate}`,
                ` · 사진 ${group.photos.length}장`
              )
            ),
            group.photos.length === 0
              ? /*#__PURE__*/React.createElement("div", { style: { color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)' } }, "이 기간에 등록된 사진이 아직 없어요.")
              : /*#__PURE__*/React.createElement("div", {
                  style: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px' }
                }, group.photos.map((photo, idx) => /*#__PURE__*/React.createElement("button", {
                  key: photo.mediaKey || photo.refKey || `${group.id}_${idx}`,
                  type: "button",
                  onClick: () => openHistoryLightbox(group.photos, idx),
                  style: { padding: 0, border: 'none', borderRadius: 'var(--radius-sm)', overflow: 'hidden', aspectRatio: '1 / 1', cursor: 'pointer', backgroundColor: 'var(--bg-primary)' }
                }, /*#__PURE__*/React.createElement("img", {
                  src: photo.thumb || photo.full, alt: "", loading: "lazy", decoding: "async",
                  style: { width: '100%', height: '100%', objectFit: 'cover' }
                })))
              )
          ))
    ),
    historyTab === 'people' && /*#__PURE__*/React.createElement("div", {
      style: { flex: 1, overflowY: 'auto', padding: '118px 16px 16px', display: 'flex', flexDirection: 'column', gap: '16px' }
    },
      /*#__PURE__*/React.createElement("div", { style: { display: 'flex', flexWrap: 'wrap', gap: '8px' } },
        personTagChips.length === 0
          ? /*#__PURE__*/React.createElement("span", { style: { color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)' } }, "태그가 없습니다. 아래에서 인물 태그를 추가해 보세요.")
          : personTagChips.map(tag => /*#__PURE__*/React.createElement("button", {
              key: tag.id,
              type: "button",
              className: "region-selection-badge",
              style: {
                backgroundColor: tag.color, color: getContrastTextColor(tag.color), cursor: 'pointer',
                border: selectedPersonTag === tag.label ? '2px solid var(--text-main)' : 'none'
              },
              onClick: () => setSelectedPersonTag(prev => prev === tag.label ? null : tag.label)
            }, tag.label))
      ),
      /*#__PURE__*/React.createElement("div", { style: { display: 'flex', gap: '8px', alignItems: 'center' } },
        /*#__PURE__*/React.createElement("input", {
          type: "text",
          className: "form-input",
          placeholder: "새 인물 태그 추가 (예: 삼촌)",
          value: newPersonTag,
          onChange: e => setNewPersonTag(e.target.value),
          onKeyDown: e => { if (e.key === 'Enter') { e.preventDefault(); handleAddPersonTagClick(); } },
          style: { flex: 1 }
        }),
        /*#__PURE__*/React.createElement("button", {
          type: "button",
          className: "btn-primary",
          disabled: isAddingPersonTag || !newPersonTag.trim(),
          onClick: handleAddPersonTagClick
        }, "태그 추가")
      ),
      !selectedPersonTag
        ? /*#__PURE__*/React.createElement("div", { style: { color: 'var(--text-muted)', fontSize: 'var(--font-size-xs)' } },
            "위 태그를 누르면 그 태그가 달린 사진을 모아 보여줘요. 사진에 태그를 달려면 갤러리에서 사진을 열고 해시태그로 그 이름을 추가하세요."
          )
        : photosForPersonTag.length === 0
          ? /*#__PURE__*/React.createElement("div", { style: { color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)' } }, `#${selectedPersonTag} 태그가 달린 사진이 아직 없어요.`)
          : /*#__PURE__*/React.createElement("div", {
              style: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px' }
            }, photosForPersonTag.map((photo, idx) => /*#__PURE__*/React.createElement("button", {
              key: photo.mediaKey || photo.refKey || `person_${idx}`,
              type: "button",
              onClick: () => openHistoryLightbox(photosForPersonTag, idx),
              style: { padding: 0, border: 'none', borderRadius: 'var(--radius-sm)', overflow: 'hidden', aspectRatio: '1 / 1', cursor: 'pointer', backgroundColor: 'var(--bg-primary)' }
            }, /*#__PURE__*/React.createElement("img", {
              src: photo.thumb || photo.full, alt: "", loading: "lazy", decoding: "async",
              style: { width: '100%', height: '100%', objectFit: 'cover' }
            })))
          )
    ),

    /*#__PURE__*/React.createElement(SideMenuOverlay, {
      isOpen: isMenuOpen,
      onClose: () => setIsMenuOpen(false),
      homeLabel: "보관함",
      ariaLabel: "보관함 메뉴",
      calendar,
      onGoHome: () => { setIsMenuOpen(false); if (typeof onChangeView === 'function') onChangeView('calendar'); else if (typeof onBack === 'function') onBack(); },
      extraItems: [{
        onClick: () => { setIsMenuOpen(false); setIsSearchOpen(true); },
        icon: SearchIcon ? /*#__PURE__*/React.createElement(SearchIcon, null) : "🔍",
        title: "보관함 검색",
        desc: "지난모임 날짜·참여자·메모·장소 검색"
      }],
      navBlockProps: {
        onClose: () => setIsMenuOpen(false),
        onChangeView: handleHistoryChangeView,
        onOpenCreateSettlement, showSettlement, chatCount, settlementBadge, galleryCount, placeCount, memoCount, historyCount,
        chatLastAuthor, settlementLastDate, galleryLastDate, placeLastName, memoLastTitleWord
      },
      onOpenShare,
      onOpenAppSettings
    })
  );
}

// 컨텐츠: 사이드메뉴 "컨텐츠" 항목이 여는 페이지. 예전 보관함의 지역축제/문화공연 탭 chrome을 그대로
// 이어받아 스포츠 탭을 추가한 것 -- 지역 필터/그리드 밀도 토글/컨텐츠 등록까지 동일하게 유지된다.
export function ContentView({
  calendar, onBack, onChangeView, onOpenAppSettings, onOpenShare = null,
  chatCount = 0, settlementBadge = null, galleryCount = 0, placeCount = 0, memoCount = 0, historyCount = 0,
  chatLastAuthor = null, settlementLastDate = null, galleryLastDate = null, placeLastName = null, memoLastTitleWord = null,
  showSettlement = true, onOpenCreateSettlement,
  anniversaries = [], onRegisterCultureEvent, onUnregisterCultureEvent, onQuickSaveMemo = null,
  customCultureItems = [], onSaveCustomCultureItem = null, showToast = null
}) {
  const React = window.React;
  const __deps = window.GATHER_UI_DEPS || {};
  const __comp = window.GATHER_UI_COMPONENTS || {};
  const BackArrowIcon = __comp.BackArrowIcon || __deps.BackArrowIcon;
  const ThreeLinesIcon = __comp.ThreeLinesIcon || __deps.ThreeLinesIcon;
  const LocateFixedIcon = __comp.LocateFixedIcon || __deps.LocateFixedIcon;
  const UnderlineTabs = __comp.UnderlineTabs || __deps.UnderlineTabs;

  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isContentRegisterOpen, setIsContentRegisterOpen] = React.useState(false);
  const CONTENT_TAB_STORAGE_KEY = 'gather_content_tab';
  const VALID_CONTENT_TABS = ['festival', 'culture', 'sports'];
  const [contentTab, setContentTab] = React.useState(() => {
    try {
      const saved = localStorage.getItem(CONTENT_TAB_STORAGE_KEY);
      if (VALID_CONTENT_TABS.includes(saved)) return saved;
    } catch (_) { /* private browsing / disabled storage */ }
    return 'festival';
  });
  const changeContentTab = (tab) => {
    if (!VALID_CONTENT_TABS.includes(tab)) return;
    setContentTab(tab);
    try { localStorage.setItem(CONTENT_TAB_STORAGE_KEY, tab); } catch (_) { /* best-effort */ }
  };
  // 컨텐츠 메뉴를 다시 누르면 항상 지역축제 탭부터 보이도록.
  const handleContentChangeView = (view) => {
    if (view === 'content') changeContentTab('festival');
    if (typeof onChangeView === 'function') onChangeView(view);
  };

  // 기념일 등록(AnniversaryModal)으로 직접 만든 festival/event/sports도 각 탭에 보이도록,
  // 문화포털에서 등록된 것(cultureSourceId 있음)은 제외하고 사용자가 직접 만든 것만 카드 형태로 변환.
  const selfAuthoredCultureItems = React.useMemo(() => {
    const kindByCategory = { festival: 'festival', event: 'performance', sports: 'sports' };
    return (anniversaries || [])
      .filter(a => a && !a.cultureSourceId && kindByCategory[a.category])
      .map(a => ({
        id: a.id,
        kind: kindByCategory[a.category],
        title: a.title || '',
        startDate: a.startDate,
        endDate: a.endDate,
        dateLabel: (a.startDate && a.endDate && a.startDate !== a.endDate) ? `${a.startDate} ~ ${a.endDate}` : (a.startDate || ''),
        venue: a.place ? (a.place.alias || a.place.name || '') : '',
        address: a.place ? (a.place.address || '') : '',
        description: a.description || '',
        image: a.image || ''
      }));
  }, [anniversaries]);

  // Shared 지역 filter for the 지역축제/문화공연/스포츠 tabs. Restored from localStorage so a
  // region picked on a previous visit still applies next time.
  const CULTURE_REGION_STORAGE_KEY = 'gather_culture_region_filter';
  const [regionSelections, setRegionSelections] = React.useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(CULTURE_REGION_STORAGE_KEY) || '{}');
      if (Array.isArray(saved.selections)) return saved.selections.filter(s => s && s.sido);
      if (saved.sido) return [{ sido: saved.sido, gugun: saved.gugun || '' }];
      return [];
    } catch (_) { return []; }
  });
  const [isRegionFilterOpen, setIsRegionFilterOpen] = React.useState(false);
  const persistRegionSelections = (next) => {
    setRegionSelections(next);
    try { localStorage.setItem(CULTURE_REGION_STORAGE_KEY, JSON.stringify({ selections: next })); } catch (_) { /* best-effort */ }
  };
  const addRegionSelection = (sido, gugun) => {
    if (!sido) return;
    const normalizedGugun = gugun || '';
    if (regionSelections.some(s => s.sido === sido && (s.gugun || '') === normalizedGugun)) return;
    persistRegionSelections([...regionSelections, { sido, gugun: normalizedGugun }]);
  };
  const removeRegionSelection = (index) => {
    persistRegionSelections(regionSelections.filter((_, i) => i !== index));
  };
  const resetRegionSelections = () => persistRegionSelections([]);
  const [regionFilterItems, setRegionFilterItems] = React.useState([]);
  const [isLocating, setIsLocating] = React.useState(false);
  const CULTURE_GRID_COLS_STORAGE_KEY = 'gather_culture_grid_cols';
  const [gridCols, setGridCols] = React.useState(() => {
    try {
      const saved = localStorage.getItem(CULTURE_GRID_COLS_STORAGE_KEY);
      return saved === '1' || saved === '2' ? saved : '2';
    } catch (_) { return '2'; }
  });
  const persistGridCols = (next) => {
    setGridCols(next);
    try { localStorage.setItem(CULTURE_GRID_COLS_STORAGE_KEY, next); } catch (_) { /* best-effort */ }
  };
  const handleUseCurrentLocation = () => {
    if (isLocating) return;
    setIsLocating(true);
    resolveCurrentLocationRegion()
      .then(({ sido, gugun }) => addRegionSelection(sido, gugun))
      .catch(err => console.warn('Current-location region lookup failed:', err))
      .finally(() => setIsLocating(false));
  };

  const { isHeaderVisible, onScroll: handleContentScroll } = useScrollHideHeader();
  const headerStackRef = React.useRef(null);
  const [headerStackHeight, setHeaderStackHeight] = React.useState(0);
  React.useLayoutEffect(() => {
    const el = headerStackRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(entries => {
      const rect = entries[0] && entries[0].contentRect;
      setHeaderStackHeight(Math.round(rect ? rect.height : el.offsetHeight));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const [chipRowSlot, setChipRowSlot] = React.useState(null);
  const contentPaddingTop = isHeaderVisible
    ? `calc(${headerStackHeight}px + env(safe-area-inset-top, 0px))`
    : `calc(12px + env(safe-area-inset-top, 0px))`;

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
      ref: headerStackRef,
      className: "history-header-stack",
      style: {
        position: 'fixed', top: 'env(safe-area-inset-top, 0px)', left: 0, right: 0, zIndex: 1010,
        backgroundColor: 'var(--bg-primary)',
        transition: 'transform 0.3s ease',
        transform: isHeaderVisible ? 'translateY(0)' : 'translateY(-100%)'
      }
    },
    /*#__PURE__*/React.createElement("div", {
      className: "places-view-header",
      style: {
        position: 'relative', height: '56px',
        backgroundColor: 'var(--bg-card)', borderBottom: '1px solid var(--border-subtle)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 16px', flexShrink: 0
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
      }, calendar.title, " 컨텐츠"),
      /*#__PURE__*/React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '8px' } },
        /*#__PURE__*/React.createElement("button", {
          type: "button", onClick: () => setIsMenuOpen(true), title: "메뉴", "aria-label": "메뉴 열기",
          style: { background: 'none', border: 'none', cursor: 'pointer', padding: '6px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }
        }, ThreeLinesIcon ? /*#__PURE__*/React.createElement(ThreeLinesIcon, { size: 22 }) : "≡")
      )
    ),
    UnderlineTabs && /*#__PURE__*/React.createElement(UnderlineTabs, {
      ariaLabel: "컨텐츠 탭",
      value: contentTab,
      onChange: changeContentTab,
      options: [
        { value: 'festival', label: '지역축제' },
        { value: 'culture', label: '문화행사' },
        { value: 'sports', label: '스포츠' }
      ]
    }),
    /*#__PURE__*/React.createElement("div", {
      className: "region-filter-trigger-row"
    },
      /*#__PURE__*/React.createElement("button", {
        type: "button",
        className: "current-location-btn",
        disabled: isLocating,
        onClick: handleUseCurrentLocation,
        title: "현재 위치",
        "aria-label": "현재 위치"
      },
        LocateFixedIcon && /*#__PURE__*/React.createElement(LocateFixedIcon, { size: 18 })
      ),
      /*#__PURE__*/React.createElement("button", {
        type: "button",
        className: "form-select region-filter-trigger",
        onClick: () => setIsRegionFilterOpen(true)
      },
        /*#__PURE__*/React.createElement("span", { style: { minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, "지역 선택"),
        renderRegionTriggerChevron(React)
      ),
      /*#__PURE__*/React.createElement("div", {
        className: "culture-grid-cols-toggle",
        role: "group",
        "aria-label": "그리드 열 수"
      },
        /*#__PURE__*/React.createElement("button", {
          type: "button",
          className: "culture-grid-cols-btn" + (gridCols === '2' ? " is-active" : ""),
          "aria-label": "2단",
          "aria-pressed": gridCols === '2',
          onClick: () => persistGridCols('2')
        },
          /*#__PURE__*/React.createElement("svg", {
            width: 20, height: 20, viewBox: "0 0 24 24", fill: "none",
            stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round",
            "aria-hidden": "true"
          },
            /*#__PURE__*/React.createElement("path", { d: "M3 4a1 1 0 0 1 1 -1h16a1 1 0 0 1 1 1v16a1 1 0 0 1 -1 1h-16a1 1 0 0 1 -1 -1v-16" }),
            /*#__PURE__*/React.createElement("path", { d: "M12 3v18" })
          )
        ),
        /*#__PURE__*/React.createElement("button", {
          type: "button",
          className: "culture-grid-cols-btn" + (gridCols === '1' ? " is-active" : ""),
          "aria-label": "1단",
          "aria-pressed": gridCols === '1',
          onClick: () => persistGridCols('1')
        },
          /*#__PURE__*/React.createElement("svg", {
            width: 20, height: 20, viewBox: "0 0 24 24", fill: "none",
            stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round",
            "aria-hidden": "true"
          },
            /*#__PURE__*/React.createElement("path", { d: "M5 4a1 1 0 0 1 1 -1h12a1 1 0 0 1 1 1v16a1 1 0 0 1 -1 1h-12a1 1 0 0 1 -1 -1l0 -16" })
          )
        )
      )
    ),
    regionSelections.length > 0 && /*#__PURE__*/React.createElement("div", {
      className: "region-selection-badges-row"
    },
      regionSelections.map((sel, idx) => /*#__PURE__*/React.createElement(RegionSelectionBadge, {
        key: `${sel.sido}::${sel.gugun}`,
        sel,
        onRemove: () => removeRegionSelection(idx)
      })),
      /*#__PURE__*/React.createElement("button", {
        type: "button",
        className: "region-filter-reset-btn",
        onClick: resetRegionSelections
      }, "초기화")
    ),
    /*#__PURE__*/React.createElement("div", { ref: setChipRowSlot })
    ), // end history-header-stack
    /*#__PURE__*/React.createElement(RegionFilterBackdrop, {
      isOpen: isRegionFilterOpen,
      onClose: () => setIsRegionFilterOpen(false),
      selections: regionSelections,
      onAdd: addRegionSelection,
      onRemove: removeRegionSelection,
      onReset: resetRegionSelections,
      items: regionFilterItems
    }),
    contentTab === 'culture' && /*#__PURE__*/React.createElement(CulturePerformancesTab, {
      calendar, anniversaries, onRegisterCultureEvent, onUnregisterCultureEvent, onQuickSaveMemo, dataUrl: CULTURE_PERFORMANCES_URL,
      emptyLabel: "상영중이거나 예정된 문화행사가 없습니다.", regionSelections, onItemsLoaded: setRegionFilterItems,
      anniversaryCategory: "event",
      extraItems: [...selfAuthoredCultureItems.filter(i => i.kind === 'performance'), ...(customCultureItems || []).filter(i => i && i.kind === 'performance')],
      chipRowSlot, contentPaddingTop, onScroll: handleContentScroll,
      gridCols
    }),
    contentTab === 'festival' && /*#__PURE__*/React.createElement(CulturePerformancesTab, {
      calendar, anniversaries, onRegisterCultureEvent, onUnregisterCultureEvent, onQuickSaveMemo, dataUrl: CULTURE_FESTIVALS_URL,
      emptyLabel: "진행중이거나 예정된 지역축제가 없습니다.", regionSelections, onItemsLoaded: setRegionFilterItems,
      anniversaryCategory: "festival",
      extraItems: [...selfAuthoredCultureItems.filter(i => i.kind === 'festival'), ...(customCultureItems || []).filter(i => i && i.kind === 'festival')],
      chipRowSlot, contentPaddingTop, onScroll: handleContentScroll,
      gridCols
    }),
    contentTab === 'sports' && /*#__PURE__*/React.createElement(CulturePerformancesTab, {
      calendar, anniversaries, onRegisterCultureEvent, onUnregisterCultureEvent, onQuickSaveMemo, dataUrl: CULTURE_SPORTS_URL,
      emptyLabel: "진행중이거나 예정된 스포츠 경기가 없습니다.", regionSelections, onItemsLoaded: setRegionFilterItems,
      anniversaryCategory: "sports",
      extraItems: [...selfAuthoredCultureItems.filter(i => i.kind === 'sports'), ...(customCultureItems || []).filter(i => i && i.kind === 'sports')],
      chipRowSlot, contentPaddingTop, onScroll: handleContentScroll,
      gridCols
    }),

    /*#__PURE__*/React.createElement(SideMenuOverlay, {
      isOpen: isMenuOpen,
      onClose: () => setIsMenuOpen(false),
      homeLabel: "컨텐츠",
      ariaLabel: "컨텐츠 메뉴",
      calendar,
      onGoHome: () => { setIsMenuOpen(false); if (typeof onChangeView === 'function') onChangeView('calendar'); else if (typeof onBack === 'function') onBack(); },
      extraItems: [{
        onClick: () => { setIsMenuOpen(false); setIsContentRegisterOpen(true); },
        icon: /*#__PURE__*/React.createElement("svg", {
          xmlns: "http://www.w3.org/2000/svg", width: "20", height: "20", viewBox: "0 0 24 24",
          fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true"
        },
          /*#__PURE__*/React.createElement("circle", { cx: "12", cy: "12", r: "10" }),
          /*#__PURE__*/React.createElement("path", { d: "M12 8v8" }),
          /*#__PURE__*/React.createElement("path", { d: "M8 12h8" })
        ),
        title: "컨텐츠 등록",
        desc: "문화행사·지역축제·스포츠 직접 등록"
      }],
      navBlockProps: {
        onClose: () => setIsMenuOpen(false),
        onChangeView: handleContentChangeView,
        onOpenCreateSettlement, showSettlement, chatCount, settlementBadge, galleryCount, placeCount, memoCount, historyCount,
        chatLastAuthor, settlementLastDate, galleryLastDate, placeLastName, memoLastTitleWord
      },
      onOpenShare,
      onOpenAppSettings
    }),
    isContentRegisterOpen && /*#__PURE__*/React.createElement(ContentRegisterModal, {
      onClose: () => setIsContentRegisterOpen(false),
      onSave: onSaveCustomCultureItem,
      showToast: showToast
    })
  );
}

const CULTURE_DATA_BASE = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.BASE_URL) || '/';
const CULTURE_PERFORMANCES_URL = `${CULTURE_DATA_BASE}data/culture-performances.json`;
const CULTURE_FESTIVALS_URL = `${CULTURE_DATA_BASE}data/culture-festivals.json`;
const CULTURE_SPORTS_URL = `${CULTURE_DATA_BASE}data/culture-sports.json`;
const CULTURE_MISSING_LABEL = '정보없음';
const culturePerf = value => (value && String(value).trim()) || CULTURE_MISSING_LABEL;

// culture-performances.json/culture-festivals.json 항목의 raw `genre` 코드 -> 칩에 보여줄 한글
// 라벨. 매핑에 없는 값(장래에 Culture Flow가 새 장르를 추가하는 경우)은 코드값 그대로 보여준다 --
// 조용히 사라지는 것보다 "알 수 없는 라벨"이 낫다.
const CULTURE_GENRE_LABELS = {
  classic_tradition: '클래식/전통',
  play: '연극',
  musical: '뮤지컬',
  concert: '콘서트',
  exhibition: '전시',
  activity: '체험',
  museum: '박물관',
  baseball: '야구',
  basketball: '농구',
  volleyball: '배구',
  soccer: '축구',
  handball: '핸드볼'
};
const cultureGenreLabel = genre => CULTURE_GENRE_LABELS[genre] || genre || '기타';

// 문화공연/지역축제 탭의 지역 필터용 전국 시/도-군/구 목록 (동 단위는 두지 않음). `code`는
// culture-performances.json/culture-festivals.json의 각 항목이 이미 들고 있는 `region` 필드값과
// 그대로 맞춘 것 -- 이 코드로 데이터를 직접 필터링한다. `gugun`은 데이터에 별도 필드가 없어
// item.address의 두 번째 토큰(예: "경기도 부천시 ...")으로 대조하므로, 실제 데이터 유무와 무관하게
// 대한민국 표준 행정구역 전체를 보여준다 (Culture Flow 자체 지역설정 백드롭과 동일한 방식).
const KOREA_REGIONS = [
  { code: 'seoul', label: '서울', gugun: ['종로구', '중구', '용산구', '성동구', '광진구', '동대문구', '중랑구', '성북구', '강북구', '도봉구', '노원구', '은평구', '서대문구', '마포구', '양천구', '강서구', '구로구', '금천구', '영등포구', '동작구', '관악구', '서초구', '강남구', '송파구', '강동구'] },
  { code: 'busan', label: '부산', gugun: ['중구', '서구', '동구', '영도구', '부산진구', '동래구', '남구', '북구', '해운대구', '사하구', '금정구', '강서구', '연제구', '수영구', '사상구', '기장군'] },
  { code: 'daegu', label: '대구', gugun: ['중구', '동구', '서구', '남구', '북구', '수성구', '달서구', '달성군', '군위군'] },
  { code: 'incheon', label: '인천', gugun: ['중구', '동구', '미추홀구', '연수구', '남동구', '부평구', '계양구', '서구', '강화군', '옹진군'] },
  { code: 'gwangju', label: '광주', gugun: ['동구', '서구', '남구', '북구', '광산구'] },
  { code: 'daejeon', label: '대전', gugun: ['동구', '중구', '서구', '유성구', '대덕구'] },
  { code: 'ulsan', label: '울산', gugun: ['중구', '남구', '동구', '북구', '울주군'] },
  { code: 'sejong', label: '세종', gugun: ['세종시'] },
  { code: 'gyeonggi', label: '경기', gugun: ['수원시', '성남시', '의정부시', '안양시', '부천시', '광명시', '평택시', '동두천시', '안산시', '고양시', '과천시', '구리시', '남양주시', '오산시', '시흥시', '군포시', '의왕시', '하남시', '용인시', '파주시', '이천시', '안성시', '김포시', '화성시', '광주시', '양주시', '포천시', '여주시', '연천군', '가평군', '양평군'] },
  { code: 'gangwon', label: '강원', gugun: ['춘천시', '원주시', '강릉시', '동해시', '태백시', '속초시', '삼척시', '홍천군', '횡성군', '영월군', '평창군', '정선군', '철원군', '화천군', '양구군', '인제군', '고성군', '양양군'] },
  { code: 'chungbuk', label: '충북', gugun: ['청주시', '충주시', '제천시', '보은군', '옥천군', '영동군', '증평군', '진천군', '괴산군', '음성군', '단양군'] },
  { code: 'chungnam', label: '충남', gugun: ['천안시', '공주시', '보령시', '아산시', '서산시', '논산시', '계룡시', '당진시', '금산군', '부여군', '서천군', '청양군', '홍성군', '예산군', '태안군'] },
  { code: 'jeonbuk', label: '전북', gugun: ['전주시', '군산시', '익산시', '정읍시', '남원시', '김제시', '완주군', '진안군', '무주군', '장수군', '임실군', '순창군', '고창군', '부안군'] },
  { code: 'jeonnam', label: '전남', gugun: ['목포시', '여수시', '순천시', '나주시', '광양시', '담양군', '곡성군', '구례군', '고흥군', '보성군', '화순군', '장흥군', '강진군', '해남군', '영암군', '무안군', '함평군', '영광군', '장성군', '완도군', '진도군', '신안군'] },
  { code: 'gyeongbuk', label: '경북', gugun: ['포항시', '경주시', '김천시', '안동시', '구미시', '영주시', '영천시', '상주시', '문경시', '경산시', '의성군', '청송군', '영양군', '영덕군', '청도군', '고령군', '성주군', '칠곡군', '예천군', '봉화군', '울진군', '울릉군'] },
  { code: 'gyeongnam', label: '경남', gugun: ['창원시', '진주시', '통영시', '사천시', '김해시', '밀양시', '거제시', '양산시', '의령군', '함안군', '창녕군', '고성군', '남해군', '하동군', '산청군', '함양군', '거창군', '합천군'] },
  { code: 'jeju', label: '제주', gugun: ['제주시', '서귀포시'] }
];
// Flat (region, gugun) lookup used by the search field below to resolve a typed district name
// (e.g. "부천") straight to its parent 시/도 -- built once at module load since KOREA_REGIONS
// never changes at runtime.
const KOREA_REGION_GUGUN_INDEX = KOREA_REGIONS.flatMap(region =>
  region.gugun.map(gugun => ({ code: region.code, label: region.label, gugun }))
);

// item.region already matches a KOREA_REGIONS code 1:1. There's no separate 군/구 field in the
// culture snapshot, so this reads it off the second space-separated token of the item's own
// address string (Korean addresses always lead with "시/도 시/군/구 ..."). Shared by the grid's
// own region filter and the region-count badges in RegionFilterBackdrop below so both agree on
// exactly the same district for a given item.
function getCultureItemDistrict(item) {
  const tokens = String(item?.address || item?.venue || '').trim().split(/\s+/);
  return tokens[1] || '';
}

// Shared by both the page-level "현재 위치" trigger and RegionFilterBackdrop's own GPS icon
// button -- resolves the browser's geolocation position to a { sido, gugun } pair via the same
// reverse-geocode + address-normalize path both call sites need, so that logic lives in one place.
function resolveCurrentLocationRegion() {
  return new Promise((resolve, reject) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      reject(new Error('geolocation unavailable'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=jsonv2&accept-language=ko&zoom=14`);
          const data = await res.json();
          const normalized = normalizeDomesticKoreanAddress(data?.display_name || '') || '';
          const tokens = normalized.trim().split(/\s+/);
          const matchedRegion = KOREA_REGIONS.find(r => r.label === tokens[0]);
          if (!matchedRegion) { reject(new Error('no matching region')); return; }
          const matchedGugun = matchedRegion.gugun.includes(tokens[1]) ? tokens[1] : '';
          resolve({ sido: matchedRegion.code, gugun: matchedGugun });
        } catch (err) {
          reject(err);
        }
      },
      (err) => reject(err),
      { timeout: 10000 }
    );
  });
}

// One capsule badge for a saved region selection ("서울 광진구 (x)") -- rendered both below the
// 지역 선택 trigger row on the page itself and inside RegionFilterBackdrop's own body, both
// driven by the same regionSelections array so the two stay in sync.
function RegionSelectionBadge({ sel, onRemove }) {
  const React = window.React;
  const __comp = window.GATHER_UI_COMPONENTS || {};
  const __deps = window.GATHER_UI_DEPS || {};
  const TrashIcon = __comp.TrashIcon || __deps.TrashIcon;
  const label = `${KOREA_REGIONS.find(r => r.code === sel.sido)?.label || sel.sido}${sel.gugun ? ' ' + sel.gugun : ''}`;
  return /*#__PURE__*/React.createElement("span", { className: "region-selection-badge" },
    label,
    /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "region-selection-badge-remove",
      "aria-label": `${label} 필터 해제`,
      onClick: onRemove
    }, TrashIcon ? /*#__PURE__*/React.createElement(TrashIcon, { size: 11 }) : "✕")
  );
}

// Region-select backdrop opened by the single 지역 선택 trigger below the 보관함 tabs
// (Culture Flow's own region picker, referenced by the product ask, is the model: a search field
// on top auto-resolving a typed district straight to its province, plus every province's full
// district list laid out as tap targets rather than a plain dropdown). Multi-select: choosing a
// 시/도 then a 군/구 (or "전체") only highlights a *draft* pick -- nothing is applied until "지역
// 저장" is pressed, which adds it to `selections` (via onAdd) without closing the sheet, so
// several regions can be added in one sitting (e.g. 서울 광진구 저장, then 인천 연수구 저장).
export function RegionFilterBackdrop({ isOpen, onClose, selections = [], onAdd, onRemove, onReset, items = [] }) {
  const React = window.React;
  const ReactDOM = window.ReactDOM;
  const __comp = window.GATHER_UI_COMPONENTS || {};
  const __deps = window.GATHER_UI_DEPS || {};
  const LocateFixedIcon = __comp.LocateFixedIcon || __deps.LocateFixedIcon;
  const [query, setQuery] = React.useState('');
  const [expandedSido, setExpandedSido] = React.useState('');
  const [draftGugun, setDraftGugun] = React.useState('');
  const [isLocating, setIsLocating] = React.useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setExpandedSido('');
      setDraftGugun('');
      setQuery('');
    }
  }, [isOpen]);

  // Typing a district name (partial match, e.g. "부천" -> "부천시") jumps straight to that
  // province's chip list with the district pre-highlighted as the draft pick -- the user still
  // taps "지역 저장" to actually add it.
  React.useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) return;
    const match = KOREA_REGION_GUGUN_INDEX.find(entry => entry.gugun.includes(trimmed));
    if (match) {
      setExpandedSido(match.code);
      setDraftGugun(match.gugun);
    }
  }, [query]);

  if (!isOpen) return null;

  const activeRegion = KOREA_REGIONS.find(r => r.code === expandedSido);

  // Per-region/per-군구 counts shown as badges next to each chip label, computed off the
  // currently active tab's full (unfiltered) item snapshot passed down from HistoryView.
  const regionCounts = {};
  const gugunCounts = {};
  items.forEach(item => {
    regionCounts[item.region] = (regionCounts[item.region] || 0) + 1;
    if (activeRegion && item.region === activeRegion.code) {
      const district = getCultureItemDistrict(item);
      if (district) gugunCounts[district] = (gugunCounts[district] || 0) + 1;
    }
  });

  const handleLocate = () => {
    if (isLocating) return;
    setIsLocating(true);
    resolveCurrentLocationRegion()
      .then(({ sido, gugun }) => { setExpandedSido(sido); setDraftGugun(gugun); setQuery(''); })
      .catch(err => console.warn('Current-location region lookup failed:', err))
      .finally(() => setIsLocating(false));
  };

  const handleSave = () => {
    if (!expandedSido || typeof onAdd !== 'function') return;
    onAdd(expandedSido, draftGugun);
    setExpandedSido('');
    setDraftGugun('');
    setQuery('');
  };

  const sheet = /*#__PURE__*/React.createElement("div", {
    className: "bottom-sheet-overlay",
    onClick: e => { e.stopPropagation(); onClose(); }
  }, /*#__PURE__*/React.createElement("div", {
    className: "bottom-sheet region-filter-sheet",
    onClick: e => e.stopPropagation()
  },
    /*#__PURE__*/React.createElement("div", { className: "bottom-sheet-header" },
      /*#__PURE__*/React.createElement("h4", null, "지역 설정"),
      /*#__PURE__*/React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '10px' } },
        selections.length > 0 && /*#__PURE__*/React.createElement("button", {
          type: "button",
          className: "region-filter-reset-btn",
          onClick: () => { setExpandedSido(''); setDraftGugun(''); setQuery(''); onReset && onReset(); }
        }, "초기화"),
        /*#__PURE__*/React.createElement("button", {
          type: "button",
          style: { background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.2rem', cursor: 'pointer' },
          onClick: onClose
        }, "✕")
      )
    ),
    /*#__PURE__*/React.createElement("div", { className: "bottom-sheet-body region-filter-body" },
      /*#__PURE__*/React.createElement("div", { className: "region-filter-search-row" },
        /*#__PURE__*/React.createElement("input", {
          type: "text",
          className: "form-input",
          placeholder: "지역명으로 검색 (예: 부천)",
          value: query,
          onChange: e => setQuery(e.target.value),
          autoFocus: true
        }),
        /*#__PURE__*/React.createElement("button", {
          type: "button",
          className: "region-filter-locate-btn",
          disabled: isLocating,
          onClick: handleLocate,
          title: "현재 위치로 검색",
          "aria-label": "현재 위치로 검색"
        }, LocateFixedIcon ? /*#__PURE__*/React.createElement(LocateFixedIcon, { size: 18 }) : "GPS")
      ),
      selections.length > 0 && /*#__PURE__*/React.createElement("div", { className: "region-selection-badges" },
        selections.map((sel, idx) => /*#__PURE__*/React.createElement(RegionSelectionBadge, {
          key: `${sel.sido}::${sel.gugun}`,
          sel,
          onRemove: () => onRemove && onRemove(idx)
        }))
      ),
      /*#__PURE__*/React.createElement("div", { className: "region-filter-section-label" }, "시/도"),
      /*#__PURE__*/React.createElement("div", { className: "region-filter-chip-group" },
        KOREA_REGIONS.map(r => /*#__PURE__*/React.createElement("button", {
          key: r.code,
          type: "button",
          className: `region-filter-chip${r.code === expandedSido ? ' is-active' : ''}`,
          onClick: () => { setQuery(''); setExpandedSido(r.code); setDraftGugun(''); }
        }, r.label, /*#__PURE__*/React.createElement("span", { className: "region-filter-chip-count" }, regionCounts[r.code] || 0)))
      ),
      activeRegion && /*#__PURE__*/React.createElement(React.Fragment, null,
        /*#__PURE__*/React.createElement("div", { className: "region-filter-section-label" }, "군/구"),
        /*#__PURE__*/React.createElement("div", { className: "region-filter-chip-group" },
          /*#__PURE__*/React.createElement("button", {
            type: "button",
            className: `region-filter-chip${!draftGugun ? ' is-active' : ''}`,
            onClick: () => setDraftGugun('')
          }, "전체", /*#__PURE__*/React.createElement("span", { className: "region-filter-chip-count" }, regionCounts[activeRegion.code] || 0)),
          activeRegion.gugun.map(g => /*#__PURE__*/React.createElement("button", {
            key: g,
            type: "button",
            className: `region-filter-chip${g === draftGugun ? ' is-active' : ''}`,
            onClick: () => setDraftGugun(g)
          }, g, /*#__PURE__*/React.createElement("span", { className: "region-filter-chip-count" }, gugunCounts[g] || 0)))
        )
      )
    ),
    /*#__PURE__*/React.createElement("div", { className: "bottom-sheet-footer" },
      /*#__PURE__*/React.createElement("button", {
        type: "button",
        className: "region-filter-save-btn",
        disabled: !expandedSido,
        onClick: handleSave
      }, "지역 저장")
    )
  ));
  return typeof document !== 'undefined' && ReactDOM.createPortal ? ReactDOM.createPortal(sheet, document.body) : sheet;
}

function formatCultureDateLabel(startDate, endDate) {
  const fmt = (s) => {
    if (!s || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return '';
    const [y, m, d] = s.split('-');
    return `${y}.${m}.${d}`;
  };
  const a = fmt(startDate);
  const b = fmt(endDate || startDate);
  if (!a) return '';
  return a === b ? a : `${a} ~ ${b}`;
}

// Layer popup for manually registering 문화공연 / 지역축제 items into the archive tabs.
// Portaled to document.body (same pattern as CulturePerformancesTab's detail sheet) so it sits
// above the side menu / page chrome. Persists via onSave → app-main customCultureItems write.
function ContentRegisterModal({ onClose, onSave, showToast = null }) {
  const React = window.React;
  const ReactDOM = window.ReactDOM;
  const __deps = window.GATHER_UI_DEPS || {};
  const __comp = window.GATHER_UI_COMPONENTS || {};
  const SmallXIcon = __comp.SmallXIcon || __deps.SmallXIcon;
  const UnderlineTabs = __comp.UnderlineTabs || __deps.UnderlineTabs;
  const AutoGrowTextarea = __comp.AutoGrowTextarea || __deps.AutoGrowTextarea;
  const autoGrowTextarea = __deps.autoGrowTextarea || (window.GATHER_APP_UTILS || {}).autoGrowTextarea || (() => {});

  const [kind, setKind] = React.useState('performance'); // 'performance' | 'festival'
  const [title, setTitle] = React.useState('');
  const [startDate, setStartDate] = React.useState('');
  const [endDate, setEndDate] = React.useState('');
  const [venue, setVenue] = React.useState('');
  const [address, setAddress] = React.useState('');
  const [link, setLink] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [image, setImage] = React.useState('');
  const [price, setPrice] = React.useState('');
  const [contact, setContact] = React.useState('');
  const [saving, setSaving] = React.useState(false);

  const handleSave = async () => {
    const cleanTitle = (title || '').trim();
    const cleanStart = (startDate || '').trim();
    if (!cleanTitle) {
      if (typeof showToast === 'function') showToast('제목을 입력해 주세요.', 'error');
      return;
    }
    if (!cleanStart || !/^\d{4}-\d{2}-\d{2}$/.test(cleanStart)) {
      if (typeof showToast === 'function') showToast('시작일을 YYYY-MM-DD 형식으로 입력해 주세요.', 'error');
      return;
    }
    const cleanEnd = ((endDate || '').trim() || cleanStart);
    if (cleanEnd && !/^\d{4}-\d{2}-\d{2}$/.test(cleanEnd)) {
      if (typeof showToast === 'function') showToast('종료일을 YYYY-MM-DD 형식으로 입력해 주세요.', 'error');
      return;
    }
    if (typeof onSave !== 'function') {
      if (typeof showToast === 'function') showToast('저장 기능을 사용할 수 없습니다.', 'error');
      return;
    }
    const stamp = Date.now();
    const prefix = kind === 'festival' ? 'custom_fest_' : 'custom_perf_';
    const id = prefix + stamp + '_' + Math.random().toString(36).slice(2, 8);
    const item = {
      id,
      title: cleanTitle,
      startDate: cleanStart,
      endDate: cleanEnd,
      dateLabel: formatCultureDateLabel(cleanStart, cleanEnd),
      venue: (venue || '').trim(),
      address: (address || '').trim(),
      link: (link || '').trim(),
      description: (description || '').trim(),
      image: (image || '').trim(),
      price: (price || '').trim(),
      contact: (contact || '').trim(),
      source: 'custom',
      kind: kind === 'festival' ? 'festival' : 'performance',
      createdAt: stamp,
      updatedAt: stamp
    };
    // Drop empty optional strings so Firestore never sees unnecessary keys (and to keep card
    // rendering identical to crawled items that omit missing fields).
    Object.keys(item).forEach(k => {
      if (item[k] === '' || item[k] == null) delete item[k];
    });
    // Re-assert required fields after the empty-key sweep.
    item.id = id;
    item.title = cleanTitle;
    item.startDate = cleanStart;
    item.endDate = cleanEnd;
    item.source = 'custom';
    item.kind = kind === 'festival' ? 'festival' : 'performance';
    item.createdAt = stamp;
    item.updatedAt = stamp;
    if (!item.dateLabel) item.dateLabel = formatCultureDateLabel(cleanStart, cleanEnd);

    setSaving(true);
    try {
      const ok = await onSave(item);
      if (ok) onClose && onClose();
    } finally {
      setSaving(false);
    }
  };

  const field = (label, el, extraStyle = null) => /*#__PURE__*/React.createElement("label", {
    style: Object.assign({ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: 'var(--font-size-sm)', fontWeight: 700, color: 'var(--text-main)' }, extraStyle || {})
  }, label, el);

  if (typeof document === 'undefined' || !ReactDOM) return null;
  return ReactDOM.createPortal(
    /*#__PURE__*/React.createElement("div", {
      onClick: () => !saving && onClose && onClose(),
      style: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.55)', zIndex: 14000, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }
    },
      /*#__PURE__*/React.createElement("div", {
        onClick: e => e.stopPropagation(),
        role: "dialog",
        "aria-label": "컨텐츠 등록",
        style: {
          width: '100%', maxWidth: '480px', maxHeight: '90vh', overflowY: 'auto',
          backgroundColor: 'var(--bg-card)', borderRadius: '16px 16px 0 0', padding: '16px 16px 20px',
          display: 'flex', flexDirection: 'column', gap: '12px', boxSizing: 'border-box'
        }
      },
        /*#__PURE__*/React.createElement("div", { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' } },
          /*#__PURE__*/React.createElement("div", { style: { fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)' } }, "컨텐츠 등록"),
          /*#__PURE__*/React.createElement("button", {
            type: "button", onClick: () => !saving && onClose && onClose(), "aria-label": "닫기",
            style: { background: 'none', border: 'none', cursor: 'pointer', padding: '6px', color: 'var(--text-muted)', display: 'flex' }
          }, SmallXIcon ? /*#__PURE__*/React.createElement(SmallXIcon, { size: 20 }) : "✕")
        ),
        UnderlineTabs && /*#__PURE__*/React.createElement(UnderlineTabs, {
          ariaLabel: "컨텐츠 종류",
          value: kind,
          onChange: v => setKind(v),
          style: { backgroundColor: 'var(--bg-card)', borderBottom: '1px solid var(--border-subtle)' },
          options: [
            { value: 'performance', label: '문화공연' },
            { value: 'festival', label: '지역축제' }
          ]
        }),
        field("제목 *", /*#__PURE__*/React.createElement("input", {
          className: "form-input", type: "text", value: title, onChange: e => setTitle(e.target.value),
          placeholder: kind === 'festival' ? "축제 이름" : "공연 제목", maxLength: 120
        })),
        /*#__PURE__*/React.createElement("div", { style: { display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: '10px', width: '100%' } },
          field("시작일 *", /*#__PURE__*/React.createElement("input", {
            className: "form-input", type: "date", value: startDate, onChange: e => setStartDate(e.target.value),
            style: { width: '100%', maxWidth: '100%', minWidth: 0, boxSizing: 'border-box' }
          }), { minWidth: 0, maxWidth: '100%', overflow: 'hidden' }),
          field("종료일", /*#__PURE__*/React.createElement("input", {
            className: "form-input", type: "date", value: endDate, onChange: e => setEndDate(e.target.value),
            style: { width: '100%', maxWidth: '100%', minWidth: 0, boxSizing: 'border-box' }
          }), { minWidth: 0, maxWidth: '100%', overflow: 'hidden' })
        ),
        field(kind === 'festival' ? "장소" : "공연장", /*#__PURE__*/React.createElement("input", {
          className: "form-input", type: "text", value: venue, onChange: e => setVenue(e.target.value),
          placeholder: "장소 / 공연장", maxLength: 120
        })),
        field("주소", /*#__PURE__*/React.createElement("input", {
          className: "form-input", type: "text", value: address, onChange: e => setAddress(e.target.value),
          placeholder: "주소", maxLength: 200
        })),
        field("링크 / URL", /*#__PURE__*/React.createElement("input", {
          className: "form-input", type: "url", value: link, onChange: e => setLink(e.target.value),
          placeholder: "https://", maxLength: 500
        })),
        field("이미지 URL (선택)", /*#__PURE__*/React.createElement("input", {
          className: "form-input", type: "url", value: image, onChange: e => setImage(e.target.value),
          placeholder: "https://", maxLength: 500
        })),
        /*#__PURE__*/React.createElement("div", { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' } },
          field("가격 / 요금", /*#__PURE__*/React.createElement("input", {
            className: "form-input", type: "text", value: price, onChange: e => setPrice(e.target.value),
            placeholder: "예: 무료 / 20,000원", maxLength: 80
          })),
          field("문의", /*#__PURE__*/React.createElement("input", {
            className: "form-input", type: "text", value: contact, onChange: e => setContact(e.target.value),
            placeholder: "연락처 / 문의처", maxLength: 120
          }))
        ),
        field("설명", AutoGrowTextarea
          ? /*#__PURE__*/React.createElement(AutoGrowTextarea, {
              className: "form-input",
              value: description,
              onChange: e => setDescription(e.target.value),
              placeholder: "간단한 설명",
              rows: 3,
              maxLength: 2000,
              minHeight: 72,
              maxHeight: 240,
              style: { width: '100%' }
            })
          : /*#__PURE__*/React.createElement("textarea", {
              className: "form-input", value: description,
              onChange: e => { setDescription(e.target.value); autoGrowTextarea(e.target, 240); },
              onInput: e => autoGrowTextarea(e.target, 240),
              placeholder: "간단한 설명", rows: 3, maxLength: 2000,
              style: { resize: 'none', minHeight: '72px', overflow: 'hidden', width: '100%' }
            })),
        /*#__PURE__*/React.createElement("button", {
          type: "button", className: "btn btn-primary btn-action", disabled: saving, onClick: handleSave,
          style: { width: '100%', marginTop: '4px', height: '44px', minHeight: '44px', opacity: saving ? 0.7 : 1 }
        }, saving ? "저장 중..." : "저장")
      )
    ),
    document.body
  );
}

// 히스토리(보관함) 페이지의 '문화공연'/'지역축제' 탭 -- 둘 다 이 컴포넌트 하나를 dataUrl만 바꿔
// 재사용한다 (문화공연은 culture-performances.json, 지역축제는 culture-festivals.json). 둘 다
// scripts/sync-culture-performances.mjs가 매일 커밋하는 이 리포 소유의 정적 스냅샷을 fetch해서
// 상영중/예정 목록을 보여준다. Culture Flow(별개 프로젝트)의 실시간 JSON을 직접 fetch하지 않는
// 이유는 그 프로젝트의 스키마가 바뀌거나 그날 수집이 실패해도 이 탭이 즉시 깨지지 않게 하기
// 위함 -- 동기화 스크립트가 검증에 실패하면 최근 정상 스냅샷을 그대로 커밋해 유지한다.
// Preview-only mirror of app-main.js's buildCultureEventMemoText -- shown as the textarea's
// placeholder so the user can see what gets saved if they leave the memo blank. The actual
// save always goes through onQuickSaveMemo (app-main.js), which is the single source of truth
// for the saved text; this is just a hint and doesn't need to stay byte-identical.
function buildQuickMemoPlaceholder(item) {
  if (!item) return '';
  const lines = [];
  const period = item.dateLabel || [item.startDate, item.endDate].filter(Boolean).join(' ~ ');
  if (period) lines.push(`기간: ${period}`);
  if (item.venue) lines.push(`장소: ${item.venue}`);
  if (item.address) lines.push(`주소: ${item.address}`);
  return lines.join('\n') || '비워두면 행사 정보가 그대로 저장됩니다';
}

export function CulturePerformancesTab({ calendar, anniversaries = [], onRegisterCultureEvent, onUnregisterCultureEvent, onQuickSaveMemo = null, dataUrl = CULTURE_PERFORMANCES_URL, emptyLabel = "상영중이거나 예정된 문화공연이 없습니다.", regionSelections = [], onItemsLoaded, anniversaryCategory = 'event', extraItems = [], chipRowSlot = null, contentPaddingTop = 0, onScroll, gridCols = '2' }) {
  const React = window.React;
  const ReactDOM = window.ReactDOM;
  const __deps = window.GATHER_UI_DEPS || {};
  const __comp = window.GATHER_UI_COMPONENTS || {};
  const SmallXIcon = __comp.SmallXIcon || __deps.SmallXIcon;
  const [items, setItems] = React.useState(null); // null = loading, [] = loaded-empty
  const [loadError, setLoadError] = React.useState(false);
  const [selected, setSelected] = React.useState(null);
  const [pendingId, setPendingId] = React.useState(null);
  const [isMemoOpen, setIsMemoOpen] = React.useState(false);
  const [memoDraft, setMemoDraft] = React.useState('');
  const [isSavingMemo, setIsSavingMemo] = React.useState(false);
  // Reset the memo composer whenever a different card is opened (or the sheet is closed),
  // rather than leaving a previous card's draft/expanded state bleeding into the next one.
  React.useEffect(() => {
    setIsMemoOpen(false);
    setMemoDraft('');
    setIsSavingMemo(false);
  }, [selected?.id]);
  const handleSaveQuickMemo = async () => {
    if (!selected || isSavingMemo || typeof onQuickSaveMemo !== 'function') return;
    setIsSavingMemo(true);
    try {
      const ok = await onQuickSaveMemo(selected, memoDraft);
      if (ok) { setIsMemoOpen(false); setMemoDraft(''); }
    } finally {
      setIsSavingMemo(false);
    }
  };
  // Local to this mount, not lifted to HistoryView like regionSelections -- 문화공연 and
  // 지역축제 have genuinely different genre mixes (지역축제 is almost entirely 'exhibition'), so a
  // category picked in one tab wouldn't mean anything carried over to the other. Since HistoryView
  // renders only one of these two tabs at a time (mutually exclusive `historyTab === ...` guards),
  // switching tabs unmounts this component and this state naturally resets with it.
  const [categoryFilter, setCategoryFilter] = React.useState('');

  React.useEffect(() => {
    let cancelled = false;
    setItems(null);
    setLoadError(false);
    fetch(dataUrl)
      .then(res => { if (!res.ok) throw new Error(`status ${res.status}`); return res.json(); })
      .then(data => {
        if (cancelled) return;
        setItems(Array.isArray(data?.items) ? data.items : []);
      })
      .catch(err => {
        console.warn('Culture snapshot load failed:', err);
        if (!cancelled) { setItems([]); setLoadError(true); }
      });
    return () => { cancelled = true; };
  }, [dataUrl]);

  // A registered item's own anniversary doc (cultureSourceId set by handleRegisterCultureEvent
  // in app-main.js), or null if this item hasn't been added to the calendar yet. Also matches by
  // a.id === itemId for cards built directly from a self-authored anniversary (기념일 등록으로
  // 만든 festival/event -- see HistoryView's selfAuthoredCultureItems), which never gets its own
  // cultureSourceId since it wasn't registered through this tab in the first place.
  const findRegisteredAnniversary = itemId =>
    (anniversaries || []).find(a => a?.cultureSourceId === itemId || a?.id === itemId) || null;

  const handleToggleRegister = async (item) => {
    if (!item || pendingId) return;
    setPendingId(item.id);
    try {
      const existing = findRegisteredAnniversary(item.id);
      if (existing) {
        if (typeof onUnregisterCultureEvent === 'function') await onUnregisterCultureEvent(existing.id);
      } else {
        const category = (anniversaryCategory === 'festival' || anniversaryCategory === 'sports') ? anniversaryCategory : 'event';
        if (typeof onRegisterCultureEvent === 'function') await onRegisterCultureEvent({ ...item, anniversaryCategory: category }, { category });
      }
    } finally {
      setPendingId(null);
    }
  };

  // Merge calendar-owned custom items (컨텐츠 등록) ahead of the crawled snapshot. Custom ids
  // use custom_perf_/custom_fest_ prefixes so they never collide with crawled perf_/fest_ ids,
  // but still de-dupe by id in case a write echoes twice.
  const mergedItems = React.useMemo(() => {
    if (items === null) return null;
    const extras = Array.isArray(extraItems) ? extraItems.filter(Boolean) : [];
    const seen = new Set(extras.map(e => e && e.id).filter(Boolean));
    const crawled = (items || []).filter(i => i && i.id && !seen.has(i.id));
    return [...extras, ...crawled];
  }, [items, extraItems]);

  // Reported unfiltered (crawled snapshot + any custom items merged in above) -- RegionFilterBackdrop's
  // per-region counts should always reflect every item available in this tab, not just whatever the
  // current region selection narrows the grid down to.
  React.useEffect(() => {
    if (typeof onItemsLoaded === 'function') onItemsLoaded(mergedItems || []);
  }, [mergedItems]);

  if (mergedItems === null) {
    return /*#__PURE__*/React.createElement("div", {
      style: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 'var(--font-size-md)', paddingTop: contentPaddingTop }
    }, "불러오는 중...");
  }

  if (mergedItems.length === 0) {
    return /*#__PURE__*/React.createElement("div", {
      style: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 'var(--font-size-md)', paddingTop: contentPaddingTop }
    }, loadError ? "정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요." : emptyLabel);
  }

  // Multi-select OR: with no selections at all, every item passes (전국); with one or more,
  // an item matches if it satisfies ANY saved { sido, gugun } pair (gugun '' means that 시/도 전체).
  const regionFilteredItems = mergedItems.filter(item => {
    if (!regionSelections || regionSelections.length === 0) return true;
    return regionSelections.some(sel => {
      if (sel.sido && item.region !== sel.sido) return false;
      if (sel.gugun && getCultureItemDistrict(item) !== sel.gugun) return false;
      return true;
    });
  });

  if (regionFilteredItems.length === 0) {
    return /*#__PURE__*/React.createElement("div", {
      style: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 'var(--font-size-md)', paddingTop: contentPaddingTop }
    }, "선택한 지역에 해당하는 항목이 없습니다.");
  }

  // Counts (and which genres even exist) are computed off the region-filtered set, not the raw
  // snapshot -- so switching region can change which category chips show up / their counts,
  // consistent with how RegionFilterBackdrop's own counts work off whichever tab is mounted.
  const categoryCounts = new Map();
  regionFilteredItems.forEach(item => {
    const key = item.genre || '';
    categoryCounts.set(key, (categoryCounts.get(key) || 0) + 1);
  });
  const categoryOptions = [...categoryCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([genre, count]) => ({ value: genre, label: cultureGenreLabel(genre), count }));

  const filteredItems = categoryFilter
    ? regionFilteredItems.filter(item => (item.genre || '') === categoryFilter)
    : regionFilteredItems;

  const categoryChipRow = categoryOptions.length > 1 && /*#__PURE__*/React.createElement("div", {
    style: { display: 'flex', gap: '6px', padding: '0 16px 12px', overflowX: 'auto', flexShrink: 0, alignItems: 'center' }
  },
    [{ value: '', label: '전체', count: regionFilteredItems.length }, ...categoryOptions].map(opt => {
      const isActive = categoryFilter === opt.value;
      return /*#__PURE__*/React.createElement("button", {
        key: opt.value || 'all',
        type: "button",
        onClick: () => setCategoryFilter(opt.value),
        style: {
          flexShrink: 0, border: 'none', borderRadius: 'var(--radius-full)', padding: '6px 12px',
          background: isActive ? 'var(--accent-primary)' : 'var(--bg-primary)',
          color: isActive ? '#FFFFFF' : 'var(--text-muted)',
          fontWeight: 700, fontSize: 'var(--font-size-sm)', cursor: 'pointer', whiteSpace: 'nowrap',
          display: 'inline-flex', alignItems: 'center', gap: '6px'
        }
      }, opt.label, /*#__PURE__*/React.createElement(SectionCountBadge, { count: opt.count }));
    })
  );

  // Portals into the fixed header-stack slot HistoryView renders below the 시/도·군/구 row so the
  // chip row slides away together with the rest of the header on scroll, instead of scrolling
  // with the poster grid underneath it. Falls back to rendering inline (its pre-existing spot,
  // right above the grid) on the rare render where the slot ref hasn't attached yet.
  const renderedCategoryChipRow = chipRowSlot
    ? (categoryChipRow ? ReactDOM.createPortal(categoryChipRow, chipRowSlot) : null)
    : categoryChipRow;

  if (filteredItems.length === 0) {
    return /*#__PURE__*/React.createElement(React.Fragment, null,
      renderedCategoryChipRow,
      /*#__PURE__*/React.createElement("div", {
        style: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 'var(--font-size-md)', paddingTop: contentPaddingTop }
      }, "선택한 카테고리에 해당하는 항목이 없습니다.")
    );
  }

  return /*#__PURE__*/React.createElement(React.Fragment, null,
    renderedCategoryChipRow,
    /*#__PURE__*/React.createElement("div", {
      className: "culture-items-grid is-cols-" + (gridCols === '1' ? '1' : '2'),
      onScroll,
      style: { flex: 1, overflowY: 'auto', padding: '16px', paddingTop: contentPaddingTop, alignContent: 'start' }
    },
      filteredItems.map(item => {
        const registered = !!findRegisteredAnniversary(item.id);
        return /*#__PURE__*/React.createElement("button", {
          key: item.id,
          type: "button",
          onClick: () => setSelected(item),
          style: {
            display: 'flex', flexDirection: 'column', gap: '6px', padding: 0,
            border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--bg-card)', cursor: 'pointer', textAlign: 'left',
            // No overflow:hidden here -- this is a CSS Grid item, and per the sizing spec a grid
            // (or flex) item's *automatic* minimum size resolves to 0 whenever the item itself has
            // a non-visible overflow, which made every card collapse to ~6px (grid-auto-rows:auto
            // sizes rows off that same automatic-minimum-size mechanism). Same root cause as the
            // 히스토리 date-row flex-shrink bug fixed earlier -- see .date-item-btn in app.css --
            // just tripped via Grid's row auto-sizing instead of Flexbox shrinking. Rounding the
            // poster's own top corners below achieves the same clipped look without it.
            //
            // minWidth:0 is the width-axis counterpart of that same bug: this button is also a
            // `repeat(2/4/6, 1fr)` grid item, and a 1fr track's automatic minimum uses the
            // item's min-content contribution -- which the venue line below inflates to its full
            // unwrapped text width (white-space:nowrap's min-content IS its full width) unless
            // this is capped. Left uncapped, one long unbroken address (real festival data
            // regularly has these) forces every column wider than the grid's own box, so the
            // whole grid silently overflows past the viewport with no scrollbar (clipped by the
            // page's own overflow-x safety net) instead of the ellipsis actually kicking in.
            minWidth: 0
          }
        },
          /*#__PURE__*/React.createElement("div", { style: { position: 'relative', width: '100%', paddingTop: '133%', backgroundColor: 'var(--bg-primary)', flexShrink: 0, borderRadius: 'var(--radius-md) var(--radius-md) 0 0', overflow: 'hidden' } },
            // "포스터 없음" is always the base layer (not just the no-image branch's fallback) so
            // a broken image URL -- the daily snapshot's festival items all carry an
            // /images/fallbacks/*.jpg path that was never actually committed as a real asset,
            // so every one 404s -- reveals this placeholder underneath once onError hides the
            // <img>, instead of leaving a blank box with nothing in it.
            /*#__PURE__*/React.createElement("div", { style: { position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)' } }, "포스터 없음"),
            item.image && /*#__PURE__*/React.createElement("img", {
              src: item.image, alt: item.title, loading: 'lazy', decoding: 'async',
              style: { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' },
              onError: e => { e.currentTarget.style.display = 'none'; }
            }),
            // 스포츠 경기 카드: 포스터(팀 관계없는 종목 기본 이미지) 위에 날짜/양팀 로고/경기장을
            // 오버레이로 얹는다. 로고를 크게 꽉 채우고, 날짜/경기장은 로고 쪽으로 촘촘하게 붙인다
            // (컬처플로우 스포츠 카드 레이아웃 참고).
            item.homeTeam && item.awayTeam && /*#__PURE__*/React.createElement("div", {
              style: {
                position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
                justifyContent: 'center', alignItems: 'center', gap: '4px', padding: '10px 8px',
                boxSizing: 'border-box', color: '#fff', textAlign: 'center',
                background: 'linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.15) 22%, rgba(0,0,0,0.15) 78%, rgba(0,0,0,0.55) 100%)'
              }
            },
              /*#__PURE__*/React.createElement("div", {
                style: { fontSize: 'var(--font-size-xs)', fontWeight: 700, textShadow: '0 1px 2px rgba(0,0,0,0.6)' }
              }, item.dateLabel || formatCultureDateLabel(item.startDate, item.endDate) || CULTURE_MISSING_LABEL),
              /*#__PURE__*/React.createElement("div", {
                style: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', width: '100%' }
              },
                /*#__PURE__*/React.createElement("div", { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', flex: '1 1 0', minWidth: 0 } },
                  item.homeTeamLogo && /*#__PURE__*/React.createElement("img", {
                    src: item.homeTeamLogo, alt: item.homeTeam, loading: 'lazy', decoding: 'async',
                    style: { width: '100%', maxWidth: '76px', aspectRatio: '1 / 1', objectFit: 'contain', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.55))' },
                    onError: e => { e.currentTarget.style.display = 'none'; }
                  }),
                  /*#__PURE__*/React.createElement("span", {
                    style: { fontSize: 'var(--font-size-2xs)', fontWeight: 700, textShadow: '0 1px 2px rgba(0,0,0,0.6)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%' }
                  }, item.homeTeam)
                ),
                /*#__PURE__*/React.createElement("span", {
                  style: { fontSize: 'var(--font-size-xs)', fontWeight: 800, textShadow: '0 1px 2px rgba(0,0,0,0.6)', flexShrink: 0 }
                }, "vs"),
                /*#__PURE__*/React.createElement("div", { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', flex: '1 1 0', minWidth: 0 } },
                  item.awayTeamLogo && /*#__PURE__*/React.createElement("img", {
                    src: item.awayTeamLogo, alt: item.awayTeam, loading: 'lazy', decoding: 'async',
                    style: { width: '100%', maxWidth: '76px', aspectRatio: '1 / 1', objectFit: 'contain', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.55))' },
                    onError: e => { e.currentTarget.style.display = 'none'; }
                  }),
                  /*#__PURE__*/React.createElement("span", {
                    style: { fontSize: 'var(--font-size-2xs)', fontWeight: 700, textShadow: '0 1px 2px rgba(0,0,0,0.6)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%' }
                  }, item.awayTeam)
                )
              ),
              /*#__PURE__*/React.createElement("div", {
                style: { fontSize: 'var(--font-size-2xs)', fontWeight: 600, textShadow: '0 1px 2px rgba(0,0,0,0.6)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%' }
              }, item.venue || CULTURE_MISSING_LABEL)
            ),
            registered && /*#__PURE__*/React.createElement("div", {
              style: { position: 'absolute', top: '6px', right: '6px', backgroundColor: '#7C3AED', color: '#fff', borderRadius: 'var(--radius-full)', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 800, boxShadow: '0 1px 3px rgba(0,0,0,0.25)' }
            }, "✓")
          ),
          /*#__PURE__*/React.createElement("div", { style: { padding: '8px 10px 10px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: '3px' } },
            /*#__PURE__*/React.createElement("div", {
              style: { fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }
            }, item.dateLabel || formatCultureDateLabel(item.startDate, item.endDate) || CULTURE_MISSING_LABEL),
            /*#__PURE__*/React.createElement("div", {
              style: { fontSize: 'var(--font-size-sm)', fontWeight: 800, color: 'var(--text-main)', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', wordBreak: 'break-word' }
            }, item.title),
            // 지역축제는 '장소'와 '주소'가 사실상 같은 정보를 가리키는 경우가 대부분이라
            // (예: 장소="영등포아트홀", 주소="서울 영등포구 ...") 축제 카드에서는 장소 줄을
            // 생략하고 주소만 보여준다. 문화공연(anniversaryCategory 'event')은 공연장 이름이
            // 주소만으로는 알 수 없는 별도 정보라 계속 둘 다 보여준다.
            anniversaryCategory !== 'festival' && /*#__PURE__*/React.createElement("div", {
              style: { fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }
            }, item.venue || CULTURE_MISSING_LABEL),
            /*#__PURE__*/React.createElement("div", {
              style: { fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }
            }, item.address || CULTURE_MISSING_LABEL)
          )
        );
      })
    ),
    selected && ReactDOM.createPortal(
      /*#__PURE__*/React.createElement("div", {
        onClick: () => setSelected(null),
        style: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.55)', zIndex: 13000, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }
      },
        /*#__PURE__*/React.createElement("div", {
          onClick: e => e.stopPropagation(),
          style: {
            position: 'relative', width: '100%', maxWidth: '480px', maxHeight: '85vh',
            backgroundColor: 'var(--bg-card)', borderRadius: '16px 16px 0 0', padding: '20px',
            display: 'flex', flexDirection: 'column', gap: '10px', boxSizing: 'border-box'
          }
        },
          /*#__PURE__*/React.createElement("button", {
            type: "button", onClick: () => setSelected(null), "aria-label": "닫기",
            style: {
              position: 'absolute', top: '12px', right: '12px', zIndex: 1,
              width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: 'none', borderRadius: 'var(--radius-full)', cursor: 'pointer',
              backgroundColor: 'rgba(0,0,0,0.45)', color: '#fff'
            }
          }, SmallXIcon ? /*#__PURE__*/React.createElement(SmallXIcon, { size: 18 }) : "✕"),
          selected.image && /*#__PURE__*/React.createElement("img", {
            src: selected.image, alt: selected.title, loading: 'lazy',
            style: { width: '100%', maxHeight: '260px', objectFit: 'contain', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-primary)', flexShrink: 0 },
            onError: e => { e.currentTarget.style.display = 'none'; }
          }),
          /*#__PURE__*/React.createElement("div", { style: { fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', flexShrink: 0, paddingRight: '36px' } }, selected.title),
          // 기간~설명까지 한 블록으로 스크롤 -- 예전엔 설명 칸만 따로 120px 높이로 스크롤돼서
          // 모바일 세로폭에선 몇 줄 보이지도 않는 좁은 창으로 긴 설명을 읽어야 했다. 이미지/제목은
          // 항상 보이게 위에 고정, 체크박스/링크 버튼은 항상 보이게 아래 고정하고, 그 사이 정보
          // 블록만 남는 공간을 스크롤하도록 minHeight:0 + flex:1로 바꿨다.
          /*#__PURE__*/React.createElement("div", {
            style: { flex: 1, minHeight: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }
          },
            [
              ['기간', culturePerf(selected.dateLabel)],
              ['장소', culturePerf(selected.venue)],
              ['주소', culturePerf(selected.address)],
              ['주최', culturePerf(selected.organizer)],
              ['문의', culturePerf(selected.contact)],
              ['가격', culturePerf(selected.price)],
              ['공식 홈페이지', culturePerf(selected.website)]
            ].map(([label, value]) => /*#__PURE__*/React.createElement("div", {
              key: label, style: { display: 'flex', gap: '8px', fontSize: 'var(--font-size-sm)' }
            },
              /*#__PURE__*/React.createElement("span", { style: { flexShrink: 0, width: '84px', color: 'var(--text-muted)', fontWeight: 700 } }, label),
              /*#__PURE__*/React.createElement("span", { style: { color: 'var(--text-main)', wordBreak: 'break-word' } }, value)
            )),
            selected.description && /*#__PURE__*/React.createElement("div", {
              style: { fontSize: 'var(--font-size-sm)', color: 'var(--text-main)', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }
            }, selected.description)
          ),
          /*#__PURE__*/React.createElement("div", {
            style: { display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }
          },
            /*#__PURE__*/React.createElement("label", {
              style: { display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0, padding: '10px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-primary)', cursor: pendingId ? 'wait' : 'pointer', fontSize: 'var(--font-size-md)', fontWeight: 700, color: 'var(--text-main)' }
            },
              /*#__PURE__*/React.createElement("input", {
                type: "checkbox",
                checked: !!findRegisteredAnniversary(selected.id),
                disabled: !!pendingId,
                onChange: () => handleToggleRegister(selected)
              }),
              "캘린더와 연동"
            ),
            typeof onQuickSaveMemo === 'function' && /*#__PURE__*/React.createElement("button", {
              type: "button",
              onClick: () => setIsMemoOpen(prev => !prev),
              "aria-expanded": isMemoOpen,
              "aria-label": "메모로 등록",
              style: {
                display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0,
                padding: '10px 12px', borderRadius: 'var(--radius-md)', border: 'none',
                backgroundColor: 'var(--bg-primary)', color: 'var(--text-main)',
                fontSize: 'var(--font-size-md)', fontWeight: 700, cursor: 'pointer'
              }
            }, "메모", /*#__PURE__*/React.createElement("svg", {
              xmlns: "http://www.w3.org/2000/svg", width: "16", height: "16", viewBox: "0 0 24 24",
              fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round",
              style: { transform: isMemoOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s ease' }
            }, /*#__PURE__*/React.createElement("path", { d: "M6 9l6 6l6 -6" })))
          ),
          isMemoOpen && /*#__PURE__*/React.createElement("div", {
            style: { display: 'flex', flexDirection: 'column', gap: '8px', flexShrink: 0 }
          },
            /*#__PURE__*/React.createElement("textarea", {
              value: memoDraft,
              onChange: e => setMemoDraft(e.target.value),
              placeholder: buildQuickMemoPlaceholder(selected),
              rows: 4,
              style: {
                width: '100%', boxSizing: 'border-box', padding: '10px', borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-card)', color: 'var(--text-main)',
                fontSize: 'var(--font-size-sm)', fontFamily: 'inherit', resize: 'vertical'
              }
            }),
            /*#__PURE__*/React.createElement("button", {
              type: "button",
              onClick: handleSaveQuickMemo,
              disabled: isSavingMemo,
              style: {
                padding: '10px', borderRadius: 'var(--radius-md)', border: 'none',
                backgroundColor: 'var(--accent-primary)', color: '#fff', fontWeight: 800,
                fontSize: 'var(--font-size-md)', cursor: isSavingMemo ? 'wait' : 'pointer',
                opacity: isSavingMemo ? 0.6 : 1
              }
            }, "메모 저장")
          ),
          selected.link && /*#__PURE__*/React.createElement("a", {
            href: selected.link, target: "_blank", rel: "noreferrer",
            style: {
              display: 'block', flexShrink: 0, textAlign: 'center', padding: '10px', borderRadius: 'var(--radius-md)',
              backgroundColor: '#7C3AED', color: '#fff', fontWeight: 800, fontSize: 'var(--font-size-md)', textDecoration: 'none'
            }
          }, selected.source === 'custom' ? "링크 열기" : "자세히보기")
        )
      ),
      document.body
    )
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
    ContentView: ContentView,
    CulturePerformancesTab: CulturePerformancesTab,
    ContentRegisterModal: ContentRegisterModal,
    RegionFilterBackdrop: RegionFilterBackdrop,
  });
}
