/**
 * Calendar grid, comments, memo card, polls, search (P4-19)
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
function withFirestoreReadTimeout(promise, timeoutMs = 9000) {
  let timer = null;
  const deadline = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error('Firestore search read timed out')), timeoutMs);
  });
  return Promise.race([promise, deadline]).finally(() => { if (timer) clearTimeout(timer); });
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


// Shared text style for anniversary/festival badges: pale tinted background (set by the
// caller) with the category color itself as the text color, wrapping up to 2 lines when the
// title doesn't fit -- text-align/text-align-last left-aligns the first line and right-aligns
// the (possibly different) last line, so a title cut across two lines still shows both its
// start and its end at a glance instead of only the start.
function ANNIVERSARY_BADGE_TEXT_STYLE(displayColor) {
  return {
    flex: '0 1 auto',
    minWidth: 0,
    fontSize: 'var(--font-size-2xs)',
    fontWeight: 800,
    color: displayColor,
    lineHeight: 1.3,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  };
}

export function CalendarGrid({
  anniversaries = [],
  calendar,
  isLoading = false,
  monthDate,
  onPrevMonth,
  onNextMonth,
  onToday,
  onJumpToMonth,
  onSelectDate,
  compact = false,
  onMoveAvailability,
  onParticipantClick
}) {
  const React = window.React;
  const __deps = window.GATHER_UI_DEPS || {};
  const __comp = window.GATHER_UI_COMPONENTS || {};
  const CalendarCheckIcon = __comp.CalendarCheckIcon || __deps.CalendarCheckIcon;
  const CoinIcon = __comp.CoinIcon || __deps.CoinIcon;
  const CakeIcon = __comp.CakeIcon || __deps.CakeIcon;
  const BalloonIcon = __comp.BalloonIcon || __deps.BalloonIcon;
  const ConfettiIcon = __comp.ConfettiIcon || __deps.ConfettiIcon;
  const TicketsPlaneIcon = __comp.TicketsPlaneIcon || __deps.TicketsPlaneIcon;
  const MessageCircleMoreIcon = __comp.MessageCircleMoreIcon || __deps.MessageCircleMoreIcon;
  const CookingPotIcon = __comp.CookingPotIcon || __deps.CookingPotIcon;
  const ParticipantBadge = __comp.ParticipantBadge || __deps.ParticipantBadge;
  // 흔들도시락 anniversary: cooking-pot icon + jiggle (title match, not category emoji).
  const isHeundeulDosirakAnn = (ann) => {
    const title = String(ann && ann.title != null ? ann.title : '').trim();
    return title === '흔들도시락' || title.includes('흔들도시락');
  };
  // Legacy D-Day badges (ann.type === 'dday') keep their plain emoji exactly as before; only the
  // newer category-tagged types (yearly/once/range) swap their category emoji for its icon component.
  const renderAnniversaryIcon = (ann, size) => {
    if (isHeundeulDosirakAnn(ann)) {
      const potSize = size;
      return /*#__PURE__*/React.createElement("span", {
        className: "ann-cooking-pot-icon-wrap",
        style: {
          width: Math.ceil(potSize * 1.5),
          height: Math.ceil(potSize * 1.5),
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          overflow: 'visible'
        },
        "aria-hidden": "true"
      }, /*#__PURE__*/React.createElement("span", {
        className: "ann-cooking-pot-jiggle"
      }, CookingPotIcon ? /*#__PURE__*/React.createElement(CookingPotIcon, {
        size: potSize
      }) : null));
    }
    if (ann.type === 'dday') return ann.icon;
    const iconMap = { '🎂': CakeIcon, '🎈': BalloonIcon, '🎉': ConfettiIcon, '✈️': TicketsPlaneIcon, '💬': MessageCircleMoreIcon };
    const Icon = iconMap[ann.icon];
    return Icon ? /*#__PURE__*/React.createElement(Icon, { size }) : ann.icon;
  };
  const getActiveParticipants = __deps.getActiveParticipants;

  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const [isPickerOpen, setIsPickerOpen] = React.useState(false);
  const [pickerYear, setPickerYear] = React.useState(year);
  const [pickerMonth, setPickerMonth] = React.useState(month);

  // Water-ripple hover effect (replaces the old bordered-box hover): a single delegated
  // pointer listener on the whole grid, not one per cell, updates --mx/--my (the pointer's
  // position within whichever cell it's currently over) so that cell's CSS radial-gradient
  // glow can track it. Ripples themselves follow the classic "material ripple" codepen
  // technique (https://codepen.io/LukeDiamantopoulos/pen/xXpaRj): a real span is appended
  // to the cell, sized/positioned in JS so it can grow to fully cover the cell, then a class
  // toggle drives its CSS transform/opacity transition; the span removes itself on
  // transitionend rather than living as a fixed-size pseudo-element. The origin is snapped to
  // whichever edge of the cell the pointer's entry coordinate is closest to, so the ripple
  // reads as entering from that boundary rather than blooming from an arbitrary point inside
  // the cell. Reading clientX/Y and writing the custom properties straight to the DOM (not
  // through React state) keeps this at native mousemove frequency without triggering a
  // re-render on every pixel of movement.
  const daysGridRef = React.useRef(null);
  React.useEffect(() => {
    const grid = daysGridRef.current;
    if (!grid || typeof window === 'undefined') return undefined;
    if (window.matchMedia && window.matchMedia('(hover: none)').matches) return undefined;
    let lastCell = null;
    const updatePosition = (cell, clientX, clientY) => {
      const rect = cell.getBoundingClientRect();
      const mx = ((clientX - rect.left) / rect.width) * 100;
      const my = ((clientY - rect.top) / rect.height) * 100;
      cell.style.setProperty('--mx', `${mx}%`);
      cell.style.setProperty('--my', `${my}%`);
    };
    const spawnRipple = (cell, clientX, clientY) => {
      const rect = cell.getBoundingClientRect();
      let x = clientX - rect.left;
      let y = clientY - rect.top;
      // Snap the origin onto whichever edge the pointer is nearest to -- that's the boundary
      // it actually crossed to enter this cell -- instead of leaving it at the raw entry
      // sample, which can land a few px inside depending on mousemove timing.
      const distLeft = x;
      const distRight = rect.width - x;
      const distTop = y;
      const distBottom = rect.height - y;
      const minDist = Math.min(distLeft, distRight, distTop, distBottom);
      if (minDist === distLeft) x = 0;
      else if (minDist === distRight) x = rect.width;
      else if (minDist === distTop) y = 0;
      else y = rect.height;
      // The ripple must grow large enough to fully cover the cell from this origin, so size it
      // to the farthest of the four corners.
      const maxDist = Math.max(
        Math.hypot(x, y),
        Math.hypot(rect.width - x, y),
        Math.hypot(x, rect.height - y),
        Math.hypot(rect.width - x, rect.height - y)
      );
      const diameter = maxDist * 2;
      const ripple = document.createElement('span');
      ripple.className = 'day-cell-ripple';
      ripple.style.width = `${diameter}px`;
      ripple.style.height = `${diameter}px`;
      ripple.style.left = `${x - maxDist}px`;
      ripple.style.top = `${y - maxDist}px`;
      ripple.addEventListener('transitionend', () => ripple.remove(), { once: true });
      cell.appendChild(ripple);
      // Force layout before adding the active class so the scale/opacity transition actually
      // runs instead of starting from its already-active end state.
      void ripple.offsetWidth;
      ripple.classList.add('is-active');
    };
    const handleMove = (clientX, clientY, target) => {
      const cell = target && target.closest ? target.closest('.day-cell') : null;
      if (!cell || !grid.contains(cell)) {
        lastCell = null;
        return;
      }
      if (cell !== lastCell) {
        updatePosition(cell, clientX, clientY);
        spawnRipple(cell, clientX, clientY);
        lastCell = cell;
      } else {
        updatePosition(cell, clientX, clientY);
      }
    };
    const onMouseMove = e => handleMove(e.clientX, e.clientY, e.target);
    const onMouseLeave = () => {
      lastCell = null;
    };
    const onTouchMove = e => {
      const touch = e.touches && e.touches[0];
      if (!touch) return;
      handleMove(touch.clientX, touch.clientY, document.elementFromPoint(touch.clientX, touch.clientY));
    };
    grid.addEventListener('mousemove', onMouseMove);
    grid.addEventListener('mouseleave', onMouseLeave);
    grid.addEventListener('touchmove', onTouchMove, { passive: true });
    grid.addEventListener('touchend', onMouseLeave);
    return () => {
      grid.removeEventListener('mousemove', onMouseMove);
      grid.removeEventListener('mouseleave', onMouseLeave);
      grid.removeEventListener('touchmove', onTouchMove);
      grid.removeEventListener('touchend', onMouseLeave);
    };
  }, [monthDate]);

  // Touch equivalent of the desktop-only HTML5 draggable/onDragStart/onDrop badge-move below --
  // native Drag-and-Drop never fires from touch input on any mobile browser, so without this a
  // participant badge simply couldn't be moved between dates on a phone at all. Implemented as a
  // long-press-then-drag gesture (not a plain touchmove-drag) specifically so a normal vertical
  // scroll that happens to start on a badge still scrolls the page instead of accidentally
  // grabbing it -- touchDragRef tracks the pending/active gesture, isTouchDragging mirrors
  // whether it's actually dragging (vs. just pressed) for the body touch-action lock below, and
  // touchDropTargetDate is which day-cell is currently under the finger (for the highlight).
  const TOUCH_LONG_PRESS_MS = 350;
  const TOUCH_MOVE_CANCEL_PX = 10;
  const touchDragRef = React.useRef(null);
  const justTouchDraggedRef = React.useRef(false);
  const [isTouchDragging, setIsTouchDragging] = React.useState(false);
  const [touchDragBadge, setTouchDragBadge] = React.useState(null); // { name, color, x, y } | null
  const [touchDropTargetDate, setTouchDropTargetDate] = React.useState(null);

  // touch-action:'auto' stays in effect (native scroll works normally) until the long-press
  // actually fires -- see handleBadgeTouchStart below, which is also the only place drag state
  // gets created, so the browser never fights a scroll gesture that never intended to be a drag.
  React.useEffect(() => {
    if (!isTouchDragging) return undefined;
    const originalTouchAction = document.body.style.touchAction;
    const originalOverflow = document.body.style.overflow;
    document.body.style.touchAction = 'none';
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.touchAction = originalTouchAction;
      document.body.style.overflow = originalOverflow;
    };
  }, [isTouchDragging]);

  const findDayCellDateAt = (x, y) => {
    const el = typeof document.elementFromPoint === 'function' ? document.elementFromPoint(x, y) : null;
    const cell = el && typeof el.closest === 'function' ? el.closest('.day-cell') : null;
    return cell ? cell.dataset.dateStr || null : null;
  };

  const endTouchDrag = (targetDate) => {
    const state = touchDragRef.current;
    touchDragRef.current = null;
    setIsTouchDragging(false);
    setTouchDragBadge(null);
    setTouchDropTargetDate(null);
    if (!state || !state.dragging) return;
    justTouchDraggedRef.current = true;
    // Cleared on the next tick rather than immediately -- the browser's compatibility click (if
    // any survives touchend's preventDefault below) fires essentially synchronously after, and
    // the badge's onClick checks this flag to avoid also opening the participant view right
    // after a drag-to-move.
    setTimeout(() => { justTouchDraggedRef.current = false; }, 300);
    if (targetDate && targetDate !== state.sourceDate && typeof onMoveAvailability === 'function') {
      onMoveAvailability(state.entryReferId, state.sourceDate, targetDate, state.participantId, state.participantName);
    }
  };

  const handleBadgeTouchStart = (event, entry, participant, dateStr) => {
    if (event.touches.length !== 1) return;
    const touch = event.touches[0];
    if (touchDragRef.current) clearTimeout(touchDragRef.current.timer);
    const dragInfo = {
      entryReferId: entry.id,
      sourceDate: dateStr,
      participantId: entry.participantId,
      participantName: participant.name,
      color: participant.color,
      touchId: touch.identifier,
      startX: touch.clientX,
      startY: touch.clientY,
      dragging: false,
      timer: null
    };
    dragInfo.timer = setTimeout(() => {
      if (touchDragRef.current !== dragInfo) return;
      dragInfo.dragging = true;
      setIsTouchDragging(true);
      setTouchDragBadge({ name: dragInfo.participantName, color: dragInfo.color, x: dragInfo.startX, y: dragInfo.startY });
      setTouchDropTargetDate(dateStr);
      if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
        try { navigator.vibrate(15); } catch (e) {}
      }
    }, TOUCH_LONG_PRESS_MS);
    touchDragRef.current = dragInfo;
  };

  const handleBadgeTouchMove = event => {
    const state = touchDragRef.current;
    if (!state) return;
    const touch = Array.from(event.touches).find(t => t.identifier === state.touchId);
    if (!touch) return;
    if (!state.dragging) {
      const dx = Math.abs(touch.clientX - state.startX);
      const dy = Math.abs(touch.clientY - state.startY);
      if (dx > TOUCH_MOVE_CANCEL_PX || dy > TOUCH_MOVE_CANCEL_PX) {
        // Moved before the long-press committed -- this is a normal scroll/swipe, not a drag.
        clearTimeout(state.timer);
        touchDragRef.current = null;
      }
      return;
    }
    setTouchDragBadge(prev => (prev ? { ...prev, x: touch.clientX, y: touch.clientY } : prev));
    setTouchDropTargetDate(findDayCellDateAt(touch.clientX, touch.clientY));
  };

  const handleBadgeTouchEnd = event => {
    const state = touchDragRef.current;
    if (!state) return;
    clearTimeout(state.timer);
    if (state.dragging) {
      const touch = Array.from(event.changedTouches).find(t => t.identifier === state.touchId) || event.changedTouches[0];
      const targetDate = touch ? findDayCellDateAt(touch.clientX, touch.clientY) : null;
      event.preventDefault();
      endTouchDrag(targetDate);
    } else {
      touchDragRef.current = null;
    }
  };

  const handleBadgeTouchCancel = () => {
    const state = touchDragRef.current;
    if (state) clearTimeout(state.timer);
    endTouchDrag(null);
  };

  // Sync picker values when month navigates externally
  React.useEffect(() => {
    setPickerYear(year);
    setPickerMonth(month);
  }, [year, month]);
  const handlePickerApply = () => {
    onJumpToMonth(pickerYear, pickerMonth);
    setIsPickerOpen(false);
  };
  const MONTH_NAMES = Array.isArray(GATHER_APP_CALENDAR_DATA.MONTH_NAMES) ? GATHER_APP_CALENDAR_DATA.MONTH_NAMES : ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];
  const firstDay = new Date(year, month, 1).getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();
  const prevLastDate = new Date(year, month, 0).getDate();
  const days = [];

  // Fill previous month days
  for (let i = firstDay - 1; i >= 0; i--) {
    const d = prevLastDate - i;
    const prevMonthDate = new Date(year, month - 1, d);
    const dateStr = `${prevMonthDate.getFullYear()}-${String(prevMonthDate.getMonth() + 1).padStart(2, '0')}-${String(prevMonthDate.getDate()).padStart(2, '0')}`;
    days.push({
      dayNum: d,
      dateStr,
      isCurrentMonth: false
    });
  }

  // Fill current month days
  for (let i = 1; i <= lastDate; i++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    days.push({
      dayNum: i,
      dateStr,
      isCurrentMonth: true
    });
  }

  // Fill next month days to complete the 7-column grid
  const totalCells = Math.ceil(days.length / 7) * 7;
  const nextDaysNeeded = totalCells - days.length;
  for (let i = 1; i <= nextDaysNeeded; i++) {
    const nextMonthDate = new Date(year, month + 1, i);
    const dateStr = `${nextMonthDate.getFullYear()}-${String(nextMonthDate.getMonth() + 1).padStart(2, '0')}-${String(nextMonthDate.getDate()).padStart(2, '0')}`;
    days.push({
      dayNum: i,
      dateStr,
      isCurrentMonth: false
    });
  }
  // Multi-day (연일) festival/event anniversaries render as one connected bar spanning the day
  // cells they cover within a week row, instead of a separate badge repeated on each day -- a
  // bar can't visually cross a week-row boundary in a grid, so each row gets its own segment of
  // a given festival. Rendered as extra .days-grid children with explicit grid placement (see
  // festivalBars.map below) rather than nested inside any single day-cell, since day-cell has
  // overflow:hidden and would clip a bar extending past its own box into the grid gap.
  const festivalBars = React.useMemo(() => {
    const bars = [];
    const rowCount = Math.ceil(days.length / 7);
    for (let row = 0; row < rowCount; row++) {
      const rowDays = days.slice(row * 7, row * 7 + 7);
      const byId = new Map();
      rowDays.forEach((day, col) => {
        getAnniversariesForDate(day.dateStr, anniversaries).forEach(ann => {
          if (ann.type !== 'range') return;
          if (!byId.has(ann.id)) byId.set(ann.id, { ...ann, row, startCol: col, endCol: col });
          else byId.get(ann.id).endCol = col;
        });
      });
      byId.forEach(bar => bars.push(bar));
    }
    // A festival spanning multiple week rows produces one bar segment per row above -- number
    // them in row order (0, 1, 2...) per festival id so alternating weeks can alternate their
    // icon+text alignment (1st week left, 2nd week right, 3rd week left, ...).
    const spanIndexById = new Map();
    bars.forEach(bar => {
      const nextIndex = spanIndexById.has(bar.id) ? spanIndexById.get(bar.id) + 1 : 0;
      spanIndexById.set(bar.id, nextIndex);
      bar.spanIndex = nextIndex;
    });
    // Total segment count per festival id lets each segment know whether it's the true start,
    // the true end, or a middle link of the chain -- used below to round only the edge that
    // isn't visually continuing into another row (see the border-radius comment near
    // FESTIVAL_BAR_HEIGHT's use).
    const totalSegmentsById = new Map();
    bars.forEach(bar => {
      totalSegmentsById.set(bar.id, (totalSegmentsById.get(bar.id) || 0) + 1);
    });
    bars.forEach(bar => {
      bar.totalSegments = totalSegmentsById.get(bar.id);
      bar.isFirstSegment = bar.spanIndex === 0;
      bar.isLastSegment = bar.spanIndex === bar.totalSegments - 1;
    });
    // Two range-type anniversaries (e.g. a 지역축제 + 문화행사, or a self-made 기념일, registered
    // on overlapping dates) used to render as two bars stacked in the exact same grid cell,
    // painting directly on top of each other. Assign each bar in a row the lowest stack `level`
    // that doesn't collide (by column range) with any bar already assigned in that row -- a
    // greedy interval-graph coloring, same idea a day-grid calendar (e.g. FullCalendar) uses for
    // overlapping multi-day events. Bars are sorted by startCol first so left-to-right visual
    // order stays stable regardless of Map iteration order.
    const barsByRow = new Map();
    bars.forEach(bar => {
      if (!barsByRow.has(bar.row)) barsByRow.set(bar.row, []);
      barsByRow.get(bar.row).push(bar);
    });
    barsByRow.forEach(rowBars => {
      rowBars.sort((a, b) => a.startCol - b.startCol);
      const levelEnds = []; // levelEnds[level] = endCol of the last bar placed at that level
      rowBars.forEach(bar => {
        let level = levelEnds.findIndex(endCol => endCol < bar.startCol);
        if (level === -1) level = levelEnds.length;
        levelEnds[level] = bar.endCol;
        bar.level = level;
      });
    });
    return bars;
  }, [days.map(d => d.dateStr).join('|'), anniversaries]);
  // How many stacked bar rows (see `level` above) each date needs reserved beneath its own
  // content -- the tallest stack any bar covering that date belongs to, so a same-day regular
  // anniversary badge stacks above every bar instead of being covered by the topmost one.
  const festivalCoveredDates = React.useMemo(() => {
    const map = new Map();
    festivalBars.forEach(bar => {
      for (let col = bar.startCol; col <= bar.endCol; col++) {
        const day = days[bar.row * 7 + col];
        if (!day) continue;
        map.set(day.dateStr, Math.max(map.get(day.dateStr) || 0, bar.level + 1));
      }
    });
    return map;
  }, [festivalBars]);
  // Matches the single-line ellipsis title in ANNIVERSARY_BADGE_TEXT_STYLE.
  const FESTIVAL_BAR_HEIGHT = 24;
  // Mobile-only icon-only line (see festivalBars.flatMap below) -- same height as the day-cell's
  // own participant dot on mobile (.days-grid .participant-badge in app.css), since the title
  // text is unreadable at that width anyway and the desktop banner's height was only ever sized
  // to fit that text.
  const FESTIVAL_BAR_HEIGHT_MOBILE = 8;
  const availMap = React.useMemo(() => getActiveAvailabilities(calendar).reduce((acc, entry) => {
    if (!acc[entry.date]) acc[entry.date] = [];
    acc[entry.date].push(entry);
    return acc;
  }, {}), [calendar.availabilities]);
  const participantsMap = React.useMemo(() => getActiveParticipants(calendar).reduce((acc, p) => {
    acc[p.id] = p;
    return acc;
  }, {}), [calendar.participants]);
  const totalPartCount = Object.keys(participantsMap).length;
  const holidayMap = React.useMemo(() => {
    const map = {};
    [year - 1, year, year + 1].forEach(y => {
      computeKoreanHolidaysForYear(y).forEach(e => {
        (map[e.date] = map[e.date] || []).push(e.name);
      });
    });
    return map;
  }, [year]);
  const solarTermMap = React.useMemo(() => {
    const map = {};
    [year - 1, year, year + 1].forEach(y => {
      Object.assign(map, getKoreanSolarTermsForYear(y));
    });
    return map;
  }, [year]);
  const lunarLabelMap = React.useMemo(() => {
    const map = {};
    [year - 1, year, year + 1].forEach(y => {
      const lunar = KOREAN_LUNAR_HOLIDAY_DATES[y];
      if (!lunar) return;
      map[lunar.seollal] = '음력 1.1';
      map[lunar.chuseok] = '음력 8.15';
      map[lunar.buddha] = '음력 4.8';
    });
    return map;
  }, [year]);
  const gridTree = /*#__PURE__*/React.createElement("div", {
    className: "calendar-card",
    style: {
      position: 'relative'
    }
  }, isLoading && /*#__PURE__*/React.createElement("div", {
    className: "calendar-loading-overlay",
    role: "status",
    "aria-live": "polite"
  }, /*#__PURE__*/React.createElement("div", {
    className: "calendar-loading-pill"
  }, /*#__PURE__*/React.createElement("span", {
    className: "calendar-spinner",
    "aria-hidden": "true"
  }), /*#__PURE__*/React.createElement("span", null, "Firebase에서 캘린더 데이터를 불러오는 중입니다."))), /*#__PURE__*/React.createElement("div", {
    className: "calendar-nav",
    style: compact ? { flexWrap: 'nowrap' } : undefined
  }, /*#__PURE__*/React.createElement("div", {
    className: "month-display",
    style: {
      cursor: 'pointer',
      userSelect: 'none',
      display: 'flex',
      alignItems: 'center',
      gap: '6px'
    },
    onClick: () => setIsPickerOpen(v => !v),
    title: "\uD074\uB9AD\uD558\uC5EC \uB144\uC6D4 \uC774\uB3D9"
  }, compact ? `${String(year).slice(2)}.${String(month + 1).padStart(2, '0')}` : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", {
    className: "month-display-year-full"
  }, `${year}\uB144 `), /*#__PURE__*/React.createElement("span", {
    className: "month-display-year-short"
  }, `${String(year).slice(2)}\uB144 `), `${month + 1}\uC6D4`), /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-light)',
      display: 'inline-flex',
      alignItems: 'center'
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
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: '6px'
    }
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn-secondary calendar-month-nav-btn",
    title: "\uC774\uC804\uB2EC",
    "aria-label": "\uC774\uC804\uB2EC",
    style: { padding: '8px' },
    onClick: onPrevMonth
  }, /*#__PURE__*/React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    width: "20",
    height: "20",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    "stroke-width": "2",
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
    style: { transform: 'rotate(90deg)' },
    className: "icon icon-tabler icons-tabler-outline icon-tabler-chevron-down"
  }, /*#__PURE__*/React.createElement("path", {
    stroke: "none",
    d: "M0 0h24v24H0z",
    fill: "none"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M6 9l6 6l6 -6"
  }))), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn-secondary calendar-month-nav-btn",
    title: "\uC624\uB298",
    "aria-label": "\uC624\uB298",
    style: { padding: '8px' },
    onClick: onToday
  }, /*#__PURE__*/React.createElement(CalendarCheckIcon, null)), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn-secondary calendar-month-nav-btn",
    title: "\uB2E4\uC74C\uB2EC",
    "aria-label": "\uB2E4\uC74C\uB2EC",
    style: { padding: '8px' },
    onClick: onNextMonth
  }, /*#__PURE__*/React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    width: "20",
    height: "20",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    "stroke-width": "2",
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
    style: { transform: 'rotate(-90deg)' },
    className: "icon icon-tabler icons-tabler-outline icon-tabler-chevron-down"
  }, /*#__PURE__*/React.createElement("path", {
    stroke: "none",
    d: "M0 0h24v24H0z",
    fill: "none"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M6 9l6 6l6 -6"
  }))))), (() => {
    const sheet = isPickerOpen && /*#__PURE__*/React.createElement("div", {
      className: "bottom-sheet-overlay",
      onClick: () => setIsPickerOpen(false)
    }, /*#__PURE__*/React.createElement("div", {
      className: "bottom-sheet",
      onClick: e => e.stopPropagation()
    },
      /*#__PURE__*/React.createElement("div", { className: "bottom-sheet-header" },
        /*#__PURE__*/React.createElement("h4", null, "\uC5F0\uC6D4 \uC120\uD0DD"),
        /*#__PURE__*/React.createElement("button", {
          type: "button",
          style: { background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.2rem', cursor: 'pointer' },
          onClick: () => setIsPickerOpen(false)
        }, "\u2715")
      ),
      /*#__PURE__*/React.createElement("div", { className: "bottom-sheet-body" },
        /*#__PURE__*/React.createElement("div", { style: { marginBottom: '16px' } },
          /*#__PURE__*/React.createElement("label", {
            style: { fontSize: 'var(--font-size-md)', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }
          }, "\uB144\uB3C4"),
          /*#__PURE__*/React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '10px' } },
            /*#__PURE__*/React.createElement("button", {
              type: "button", className: "btn btn-secondary", style: { padding: '4px 10px', fontSize: 'var(--font-size-base)' },
              onClick: () => setPickerYear(y => y - 1)
            }, "\u25C0"),
            /*#__PURE__*/React.createElement("span", {
              style: { fontWeight: 800, fontSize: '1.1rem', minWidth: '60px', textAlign: 'center' }
            }, pickerYear, "\uB144"),
            /*#__PURE__*/React.createElement("button", {
              type: "button", className: "btn btn-secondary", style: { padding: '4px 10px', fontSize: 'var(--font-size-base)' },
              onClick: () => setPickerYear(y => y + 1)
            }, "\u25B6")
          )
        ),
        /*#__PURE__*/React.createElement("div", { style: { marginBottom: '16px' } },
          /*#__PURE__*/React.createElement("label", {
            style: { fontSize: 'var(--font-size-md)', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }
          }, "\uC6D4"),
          /*#__PURE__*/React.createElement("div", { style: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' } },
            MONTH_NAMES.map((name, idx) => /*#__PURE__*/React.createElement("button", {
              key: idx, type: "button", onClick: () => setPickerMonth(idx),
              style: {
                padding: '6px 4px', borderRadius: 'var(--radius-sm)',
                border: pickerMonth === idx ? '2px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                background: pickerMonth === idx ? 'rgba(99, 102, 241, 0.15)' : 'var(--bg-card)',
                color: pickerMonth === idx ? 'var(--accent-primary)' : 'var(--text-main)',
                fontWeight: pickerMonth === idx ? 800 : 500, fontSize: 'var(--font-size-md)', cursor: 'pointer'
              }
            }, name))
          )
        ),
        /*#__PURE__*/React.createElement("button", {
          type: "button", className: "btn btn-primary", style: { width: '100%' },
          onClick: handlePickerApply
        }, pickerYear, "\uB144 ", pickerMonth + 1, "\uC6D4\uB85C \uC774\uB3D9")
      )
    ));
    return sheet && typeof document !== 'undefined' && ReactDOM.createPortal ? ReactDOM.createPortal(sheet, document.body) : sheet;
  })(), /*#__PURE__*/React.createElement("div", {
    className: "weekday-grid"
  }, /*#__PURE__*/React.createElement("div", {
    className: "weekday-label sun"
  }, "\uC77C"), /*#__PURE__*/React.createElement("div", {
    className: "weekday-label"
  }, "\uC6D4"), /*#__PURE__*/React.createElement("div", {
    className: "weekday-label"
  }, "\uD654"), /*#__PURE__*/React.createElement("div", {
    className: "weekday-label"
  }, "\uC218"), /*#__PURE__*/React.createElement("div", {
    className: "weekday-label"
  }, "\uBAA9"), /*#__PURE__*/React.createElement("div", {
    className: "weekday-label"
  }, "\uAE08"), /*#__PURE__*/React.createElement("div", {
    className: "weekday-label sat"
  }, "\uD1A0")), /*#__PURE__*/React.createElement("div", {
    className: "days-grid",
    ref: daysGridRef
  }, [days.map(({
    dayNum,
    dateStr,
    isCurrentMonth
  }, idx) => {
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const isToday = isCurrentMonth && dateStr === todayStr;
    const entries = (availMap[dateStr] || []).filter(e => participantsMap[e.participantId] || e.participantId === BULK_NO_PARTICIPANT_ID);
    const uniqueActiveParts = new Set(entries.filter(e => participantsMap[e.participantId]).map(e => e.participantId));
    const isAllAvailable = totalPartCount > 0 && uniqueActiveParts.size === totalPartCount;
    const holidayNames = holidayMap[dateStr];
    const isHoliday = !!holidayNames && holidayNames.length > 0;
    const lunarLabel = lunarLabelMap[dateStr];
    const isConfirmed = isDateConfirmedMeeting(calendar, dateStr);
    const hasExpenses = (() => {
      const entry = getConfirmedMeetings(calendar).find(m => m.date === dateStr);
      return entry && Array.isArray(entry.expenses) && entry.expenses.length > 0;
    })();
    const solarTermName = !isHoliday && !isAllAvailable ? solarTermMap[dateStr] : null;
    // Range-type (연일 festival/event) anniversaries are excluded here -- they render as a
    // connected bar overlay (see festivalBars above) instead of a per-day badge.
    const cellAnns = getAnniversariesForDate(dateStr, anniversaries).filter(ann => ann.type !== 'range');
    const hasHeundeulDosirak = cellAnns.some(isHeundeulDosirakAnn);
    const festivalStackDepth = festivalCoveredDates.get(dateStr) || 0;
    // Holiday name stays visible (red date styling), but when the day is also a confirmed
    // meeting we append ·확정 -- otherwise users only see '개천절' and re-tap 모임확정,
    // which toggles the confirmation OFF. Then '전원', then solar term.
    const holidayLabel = isHoliday ? holidayNames.join('·') : '';
    // Holiday name stays red; when also confirmed, ·확정 is a nested purple span so both
    // statuses remain readable. Non-holiday confirmed days keep plain purple '확정'.
    const cornerText = isHoliday
      ? holidayLabel
      : isConfirmed ? '확정' : isAllAvailable ? '전원' : solarTermName;
    const cornerColor = isHoliday ? '#EF4444' : isConfirmed ? '#7C3AED' : isAllAvailable ? 'var(--status-green)' : '#94A3B8';
    const cornerTitle = isHoliday
      ? ((lunarLabel ? `${holidayNames.join(', ')} (${lunarLabel})` : holidayNames.join(', ')) + (isConfirmed ? ' · 확정' : ''))
      : (isConfirmed ? '모임 확정' : undefined);
    const columnDow = idx % 7; // 0=Sun .. 6=Sat, since each week row starts on Sunday
    const isSunday = columnDow === 0;
    const isTouchDropTarget = isTouchDragging && touchDropTargetDate === dateStr;
    return /*#__PURE__*/React.createElement("div", {
      key: idx,
      className: `day-cell ${isCurrentMonth ? '' : 'other-month'} ${isConfirmed ? 'confirmed-meeting' : isAllAvailable ? 'all-available' : ''}${hasHeundeulDosirak ? ' day-cell-ann-jiggle' : ''}`,
      "data-date-str": dateStr,
      // Explicit grid placement (rather than relying on auto-flow) so a festival-bar overlay
      // (see festivalBars below), which must also use explicit placement to span multiple
      // columns, can share this exact cell instead of the grid's auto-placement treating the
      // bar's reserved cells as occupied and shifting every subsequent day-cell over.
      style: {
        gridRowStart: Math.floor(idx / 7) + 1,
        gridColumnStart: (idx % 7) + 1,
        ...(isTouchDropTarget ? { outline: '2px solid var(--accent-primary)', outlineOffset: '-2px' } : {}),
        "--cell-index": idx
      },
      onClick: () => onSelectDate(dateStr),
      onDragOver: event => {
        event.preventDefault();
      },
      onDrop: event => {
        event.preventDefault();
        event.stopPropagation();
        try {
          const rawData = event.dataTransfer.getData('text/plain');
          if (!rawData) return;
          const data = JSON.parse(rawData);
          if (data.sourceDate === dateStr) return;
          if (typeof onMoveAvailability === 'function') {
            onMoveAvailability(data.entryReferId, data.sourceDate, dateStr, data.participantId, data.participantName);
          }
        } catch (err) {
          console.error('Drop error:', err);
        }
      }
    },
      /* Day cell header row (Date number & holiday/corner label) */
      /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '4px',
          width: '100%'
        }
      },
        /* Left: Date number & Coin icon */
        /*#__PURE__*/React.createElement("div", {
          style: {
            display: 'flex',
            alignItems: 'center',
            gap: '2px',
            flexShrink: 0
          }
        },
          /*#__PURE__*/React.createElement("span", {
            className: isToday ? "day-number day-number-today" : "day-number",
            style: isToday ? {
              backgroundColor: '#3B82F6',
              color: '#FFFFFF',
              borderRadius: '50%',
              fontWeight: '800',
              boxShadow: '0 2px 4px rgba(59, 130, 246, 0.4)',
              flexShrink: 0
            } : isHoliday || isSunday ? {
              color: '#EF4444',
              fontWeight: '800',
              flexShrink: 0
            } : { flexShrink: 0 }
          }, dayNum),
          hasExpenses && /*#__PURE__*/React.createElement(CoinIcon, null)
        ),
        /* Right: Holiday / status label */
        cornerText && /*#__PURE__*/React.createElement("span", {
          className: `day-corner-label${isHoliday ? ' is-holiday' : ''}${isAllAvailable ? ' is-all-available' : ''}`,
          title: cornerTitle,
          style: {
            fontSize: 'var(--font-size-2xs)',
            fontWeight: isHoliday || isAllAvailable ? 800 : 600,
            color: cornerColor,
            lineHeight: 1.2,
            minWidth: 0,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            textAlign: 'right'
          }
        }, cornerText, isHoliday && isConfirmed ? /*#__PURE__*/React.createElement("span", {
          style: {
            color: '#7C3AED'
          }
        }, "·확정") : null)
      ),

      /* Middle: Schedule badges container */
      /*#__PURE__*/React.createElement("div", {
        className: "badges-container"
      }, entries.map(e => {
        const isNone = e.participantId === BULK_NO_PARTICIPANT_ID;
        const p = isNone
          ? { id: BULK_NO_PARTICIPANT_ID, name: '일정', color: '#94A3B8' }
          : participantsMap[e.participantId];
        if (!p) return null;
        return /*#__PURE__*/React.createElement(ParticipantBadge, {
          key: p.id + (e.id || e.date || ''),
          participant: p,
          style: { cursor: 'pointer' },
          draggable: !isNone,
          onDragStart: isNone ? undefined : (event => {
            event.stopPropagation();
            event.dataTransfer.setData('text/plain', JSON.stringify({
              entryReferId: e.id,
              sourceDate: dateStr,
              participantId: e.participantId,
              participantName: p.name
            }));
          }),
          onTouchStart: isNone ? undefined : (event => { event.stopPropagation(); handleBadgeTouchStart(event, e, p, dateStr); }),
          onTouchMove: isNone ? undefined : (event => { event.stopPropagation(); handleBadgeTouchMove(event); }),
          onTouchEnd: isNone ? undefined : (event => { event.stopPropagation(); handleBadgeTouchEnd(event); }),
          onTouchCancel: isNone ? undefined : (event => { event.stopPropagation(); handleBadgeTouchCancel(); }),
          onClick: event => {
            event.stopPropagation();
            if (justTouchDraggedRef.current) return;
            if (!isNone && typeof onParticipantClick === 'function') {
              onParticipantClick(p.name, dateStr);
            } else if (typeof onSelectDate === 'function') {
              onSelectDate(dateStr);
            }
          },
          title: e.note ? `${p.name}: ${e.note}` : p.name
        }, /*#__PURE__*/React.createElement("span", {
          className: "badge-name"
        }, p.name));
      })),

      /* PC Anniversary Badge (desktop-only, soft banner cards at the bottom of schedules) */
      cellAnns.length > 0 && /*#__PURE__*/React.createElement("div", {
        className: `day-anniversary-desktop${hasHeundeulDosirak ? ' day-ann-jiggle-row' : ''}`,
        style: {
          flexDirection: 'column',
          gap: '2px',
          width: '100%',
          marginTop: 'auto',
          paddingTop: '8px',
          pointerEvents: 'none',
          overflow: hasHeundeulDosirak ? 'visible' : undefined
        }
      }, cellAnns.map((ann, aIdx) => {
        const displayColor = getAnniversaryDisplayColor(ann, calendar);
        const isHeundeul = isHeundeulDosirakAnn(ann);
        return /*#__PURE__*/React.createElement("div", {
          key: ann.id || aIdx,
          className: isHeundeul ? 'day-anniversary-badge-jiggle' : undefined,
          style: {
            height: '24px',
            minHeight: '24px',
            backgroundColor: `${displayColor}22`,
            padding: '3px 8px',
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            alignItems: 'center',
            // Single-day anniversary badges always stay left-aligned (only a multi-week
            // festival bar alternates left/right by week -- see festivalBars below).
            justifyContent: 'flex-start',
            gap: '4px',
            width: '100%',
            boxSizing: 'border-box',
            color: displayColor,
            overflow: isHeundeul ? 'visible' : undefined
          }
        }, renderAnniversaryIcon(ann, isHeundeul ? 17 : 12), /*#__PURE__*/React.createElement("span", {
          style: ANNIVERSARY_BADGE_TEXT_STYLE(displayColor)
        }, ann.title));
      })),

      /* Mobile Anniversary Icon Badge (mobile-only, circular icons containing emoji with participant color) */
      cellAnns.length > 0 && /*#__PURE__*/React.createElement("div", {
        className: `day-anniversary-mobile${hasHeundeulDosirak ? ' day-ann-jiggle-row' : ''}`,
        style: {
          gap: '3px',
          justifyContent: 'center',
          width: '100%',
          marginTop: 'auto',
          paddingTop: '6px',
          pointerEvents: 'none',
          boxSizing: 'border-box',
          flexWrap: 'wrap',
          overflow: hasHeundeulDosirak ? 'visible' : undefined
        }
      }, cellAnns.map((ann, aIdx) => {
        const displayColor = getAnniversaryDisplayColor(ann, calendar);
        const isHeundeul = isHeundeulDosirakAnn(ann);
        return /*#__PURE__*/React.createElement("div", {
          key: ann.id || aIdx,
          title: ann.title,
          className: isHeundeul ? 'day-anniversary-badge-jiggle' : undefined,
          style: {
            width: '18px',
            height: '18px',
            borderRadius: '50%',
            backgroundColor: displayColor,
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 'var(--font-size-2xs)',
            flexShrink: 0,
            overflow: isHeundeul ? 'visible' : undefined
          }
        }, renderAnniversaryIcon(ann, isHeundeul ? 10 : 11));
      })),

      /* Reserves room at the bottom of this cell for the festival-bar overlay drawn as a
         separate .days-grid child (see festivalBars below) -- unconditional on cellAnns so it
         also protects plain attendee badges from being covered, not just other anniversaries.
         Sized via CSS custom property + .festival-bar-spacer (app.css) instead of a hardcoded
         desktop-height inline style, so it shrinks to match FESTIVAL_BAR_HEIGHT_MOBILE on small
         viewports -- otherwise every day under a festival bar reserved 24px/level even on mobile,
         where the bar itself is only 8px tall, leaving a large unused gap under the day number. */
      festivalStackDepth > 0 && /*#__PURE__*/React.createElement("div", {
        className: "festival-bar-spacer",
        style: { '--festival-stack-depth': festivalStackDepth, flexShrink: 0, width: '100%' }
      })
    );
  }), festivalBars.flatMap(bar => {
    const displayColor = getAnniversaryDisplayColor(bar, calendar);
    const gridPlacementStyle = {
      gridRowStart: bar.row + 1,
      gridColumnStart: bar.startCol + 1,
      gridColumnEnd: bar.endCol + 2,
      alignItems: 'flex-end',
      pointerEvents: 'none',
      boxSizing: 'border-box',
      // .day-cell has position:relative, so it always paints in the positioned-elements
      // layer above any position:static sibling regardless of DOM order -- without also
      // being positioned here, this bar would render invisibly underneath every day-cell.
      position: 'relative',
      zIndex: 1,
      // A grid item's automatic minimum width defaults to its content's min-content size
      // (here, the unwrapped title text) unless overridden -- without this, a long title
      // forces its spanned column(s) wide enough to fit the whole word, squeezing every
      // other column in the row down to a sliver. minWidth:0 lets the item shrink to the
      // track's actual size and leaves the inner pill's own overflow/ellipsis to truncate it.
      minWidth: 0
    };
    const borderRadius = bar.totalSegments === 1
      ? 'var(--radius-sm)'
      : bar.isFirstSegment
        ? '8px 0 0 8px'
        : bar.isLastSegment
          ? '0 8px 8px 0'
          : '0';
    return [
      // Tablet/PC: unchanged icon+title banner.
      /*#__PURE__*/React.createElement("div", {
        key: `festival-bar-desktop-${bar.id}-${bar.row}`,
        className: "festival-bar-desktop",
        style: { ...gridPlacementStyle, display: 'flex' }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          width: '100%',
          height: `${FESTIVAL_BAR_HEIGHT}px`,
          // Bars whose date ranges overlap (see `level` assignment in festivalBars above) stack
          // upward from the bottom of the cell instead of painting on top of each other -- level 0
          // sits flush at the bottom, level 1 sits one bar-height above it, and so on.
          marginBottom: bar.level > 0 ? `${bar.level * FESTIVAL_BAR_HEIGHT}px` : undefined,
          backgroundColor: `${displayColor}22`,
          borderRadius,
          padding: bar.totalSegments > 1 && bar.isLastSegment ? '3px 10px 3px 8px' : '3px 8px',
          display: 'flex',
          alignItems: 'center',
          // Icon+text renders as one content-sized chunk (not stretched to fill the bar) so this
          // justifyContent can actually move it -- alternates left/right by which week of the
          // festival's span this bar segment is (see spanIndex in festivalBars above).
          justifyContent: bar.spanIndex % 2 === 0 ? 'flex-start' : 'flex-end',
          gap: '4px',
          boxSizing: 'border-box',
          color: displayColor
        }
      }, renderAnniversaryIcon(bar, 12), /*#__PURE__*/React.createElement("span", {
        style: ANNIVERSARY_BADGE_TEXT_STYLE(displayColor)
      }, bar.title))),
      // Mobile: the title text is unreadable at phone width anyway, so it's dropped entirely --
      // just a solid-color line (same height as the day-cell's own participant dot) with the
      // category icon centered on it, matching the icon-only treatment single-day anniversaries
      // already get in their own mobile badge (day-anniversary-mobile below).
      /*#__PURE__*/React.createElement("div", {
        key: `festival-bar-mobile-${bar.id}-${bar.row}`,
        className: "festival-bar-mobile",
        style: { ...gridPlacementStyle, display: 'none' }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          width: '100%',
          height: `${FESTIVAL_BAR_HEIGHT_MOBILE}px`,
          marginBottom: bar.level > 0 ? `${bar.level * FESTIVAL_BAR_HEIGHT_MOBILE}px` : undefined,
          backgroundColor: displayColor,
          borderRadius,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxSizing: 'border-box',
          color: '#fff',
          overflow: 'visible'
        }
      // 11px 아이콘이 8px짜리 바 안에 들어가면 아이콘이 바 배경보다 커서 위아래로 삐져나와
      // 보였다 -- 바 높이에 맞춰 6px로 축소.
      }, renderAnniversaryIcon(bar, 6)))
    ];
  })]));

  // Floating badge that follows the finger while a touch drag is active (see
  // handleBadgeTouchStart above) -- portaled straight to <body> so it renders above everything
  // regardless of where CalendarGrid itself sits in the DOM, and isn't affected by any ancestor
  // establishing its own containing block (transform/filter/etc. would otherwise break a plain
  // position:fixed descendant).
  const touchDragIndicator = touchDragBadge && typeof document !== 'undefined' && ReactDOM.createPortal
    ? ReactDOM.createPortal(/*#__PURE__*/React.createElement("div", {
      style: {
        position: 'fixed',
        left: `${touchDragBadge.x}px`,
        top: `${touchDragBadge.y}px`,
        transform: 'translate(-50%, -130%)',
        backgroundColor: touchDragBadge.color,
        color: '#FFFFFF',
        padding: '6px 12px',
        borderRadius: 'var(--radius-full)',
        fontSize: 'var(--font-size-md)',
        fontWeight: 800,
        boxShadow: '0 8px 20px rgba(0,0,0,0.28)',
        pointerEvents: 'none',
        zIndex: 100001,
        whiteSpace: 'nowrap'
      }
    }, touchDragBadge.name), document.body)
    : null;

  return touchDragIndicator
    ? /*#__PURE__*/React.createElement(React.Fragment, null, gridTree, touchDragIndicator)
    : gridTree;
}

export function CommentsSection({
  calendar,
  recentMessages,
  chatMessages = [],
  totalChatCount: totalChatCountProp,
  previewHydrationExhausted = false,
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
  activeLightbox,
  setActiveLightbox,
  onSend,
  onDeleteMessage,
  onEditMessage,
  onMore,
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
}) {
  const React = window.React;
  const __deps = window.GATHER_UI_DEPS || {};
  const __comp = window.GATHER_UI_COMPONENTS || {};
  const ChatSectionIcon = __comp.ChatSectionIcon || __deps.ChatSectionIcon;
  const Lightbox = __comp.Lightbox || __deps.Lightbox;
  const TrashIcon = __comp.TrashIcon || __deps.TrashIcon;
  const getActiveParticipants = __deps.getActiveParticipants;

  const participants = getActiveParticipants(calendar);
  const participantsMap = participants.reduce((acc, p) => {
    acc[p.id] = p;
    return acc;
  }, {});
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
  const visibleChatMessages = React.useMemo(() => {
    return Array.isArray(chatMessages)
      ? chatMessages.filter(msg => msg && msg.uploadSource !== 'meeting' && msg.uploadSource !== 'gallery' && !meetingPhotoMessageIds.has(msg.id))
      : [];
  }, [chatMessages, meetingPhotoMessageIds]);
  const visibleRecentMessages = React.useMemo(() => {
    return Array.isArray(recentMessages)
      ? recentMessages.filter(msg => msg && msg.uploadSource !== 'meeting' && msg.uploadSource !== 'gallery' && !meetingPhotoMessageIds.has(msg.id))
      : [];
  }, [recentMessages, meetingPhotoMessageIds]);
  const [isCollapsed, setIsCollapsed] = React.useState(true); // default closed
  const revealedMsgId = useTapRevealedMsgId();

  // Total chat count + read/unread badge, tracked locally per calendar (no server-side
  // read state). visibleChatMessages only includes actual chat, not meeting/gallery photo docs.
  const totalChatCount = (typeof totalChatCountProp === 'number' && totalChatCountProp >= visibleChatMessages.length)
    ? totalChatCountProp
    : Math.max(visibleChatMessages.length, typeof totalChatCountProp === 'number' ? totalChatCountProp : 0);
  const latestChatTimestamp = visibleChatMessages.length > 0 ? visibleChatMessages[visibleChatMessages.length - 1].timestamp : 0;
  const [lastReadTimestamp, setLastReadTimestamp] = React.useState(() => getChatLastReadTimestamp(calendar.id));
  React.useEffect(() => {
    setLastReadTimestamp(getChatLastReadTimestamp(calendar.id));
  }, [calendar.id]);
  const toggleCommentsSection = () => {
    setIsCollapsed(prev => {
      const next = !prev;
      if (next === false && latestChatTimestamp > 0) {
        setChatLastReadTimestamp(calendar.id, latestChatTimestamp);
        setLastReadTimestamp(latestChatTimestamp);
      }
      return next;
    });
  };
  const previewSourceMessages = React.useMemo(() => {
    if (visibleChatMessages.length > 0) return visibleChatMessages;
    return Array.isArray(visibleRecentMessages) ? visibleRecentMessages.filter(Boolean).slice().reverse() : [];
  }, [visibleChatMessages, visibleRecentMessages]);
  const previewRecentMessages = React.useMemo(() => {
    return previewSourceMessages.length > 0 ? previewSourceMessages.slice(-5) : [];
  }, [previewSourceMessages]);
  const hasAnyChat = totalChatCount > 0 || previewSourceMessages.length > 0;
  const emptyChatMessage = (totalChatCount > 0 && !previewHydrationExhausted)
    ? '최근 채팅을 불러오는 중…'
    : (hasAnyChat ? '표시할 최근 채팅이 없습니다.' : '등록된 채팅이 없습니다.');
  const openFullChat = (event) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    if (typeof onMore === 'function') onMore();
  };

  // 일정탭('meeting')/갤러리페이지('gallery')에서 올린 사진은 참조용 실제 채팅 메시지
  // 문서로 저장되지만 채팅 피드에는 노출되지 않아야 함 -- ChatRoomView(ui-chat-room.js)의
  // 같은 필터를 이 메인화면 채팅 미리보기 위젯에도 동일하게 적용.
  const messagesToShow = isCollapsed
    ? previewRecentMessages.slice(-3)
    : previewRecentMessages;

  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("section", {
    style: { textAlign: 'left' }
  },
  /* Header */
  /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '10px',
      gap: '8px',
      cursor: 'pointer'
    },
    onClick: toggleCommentsSection
  }, /*#__PURE__*/React.createElement("div", {
    className: "summary-title",
    style: { color: '#2563EB', marginBottom: 0, display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'bold' }
  }, /*#__PURE__*/React.createElement(ChatSectionIcon, null), "채팅"),
  /*#__PURE__*/React.createElement("div", {
    style: { marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '2px', flexShrink: 0 }
  },
    /*#__PURE__*/React.createElement("button", {
      type: "button",
      onClick: openFullChat,
      style: {
        background: 'none',
        border: 'none',
        color: '#3B82F6',
        fontSize: 'var(--font-size-md)',
        fontWeight: 800,
        cursor: 'pointer',
        padding: '4px 6px',
        whiteSpace: 'nowrap'
      }
    }, "전체보기")
  )),
  /* List Background Panel -- one continuous gray canvas the individual white message
     bubbles float on, instead of each message having its own separate gray card */
  /*#__PURE__*/React.createElement("div", {
    style: {
      backgroundColor: 'var(--bg-primary)',
      borderRadius: 'var(--radius-md)',
      padding: '12px',
      minHeight: '48px'
    }
  }, messagesToShow.length === 0 ? /*#__PURE__*/React.createElement("div", {
    style: { color: 'var(--text-muted)', fontSize: 'var(--font-size-base)', padding: '8px 0', textAlign: 'center' }
  }, emptyChatMessage) : /*#__PURE__*/React.createElement("div", {
    style: { display: 'flex', flexDirection: 'column', gap: '10px' }
  }, messagesToShow.map(msg => {
    const p = participantsMap[msg.participantId];
    const dateInfo = formatCommentDate(msg.timestamp);
    const isMsgMe = msg.participantId === chatParticipantId;
    const badgeColor = p?.color || '#94A3B8';
    const badgeName = p?.name || '알수없음';

    /* === SHARED ELEMENTS === */
    const bubbleContent = renderChatMessageBody(msg, setActiveLightbox, { maxWidth: '120px', maxHeight: '90px', isMiniChat: true }, '', null, null, true);

    const editSvg = /*#__PURE__*/React.createElement('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '12', height: '12', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: '2.5', strokeLinecap: 'round', strokeLinejoin: 'round' },
      /*#__PURE__*/React.createElement('path', { stroke: 'none', d: 'M0 0h24v24H0z', fill: 'none' }),
      /*#__PURE__*/React.createElement('path', { d: 'M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4' }),
      /*#__PURE__*/React.createElement('path', { d: 'M13.5 6.5l4 4' })
    );
    /* === UNIFIED CARD LAYOUT (badge + edit/delete on one header row, full-width bubble
       below, single-line timestamp bottom-right) === */
    return /*#__PURE__*/React.createElement('div', {
      key: msg.id,
      className: `msg-row-hover ${revealedMsgId === msg.id ? 'msg-actions-revealed' : ''}`,
      'data-msg-row-id': msg.id,
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: '6px'
      }
    },
      /* Header row: name badge left; timestamp always visible top-right, with
         edit/delete (own messages only) appearing to its right on hover/tap */
      /*#__PURE__*/React.createElement('div', {
        style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }
      },
        /*#__PURE__*/React.createElement('span', {
          style: { backgroundColor: badgeColor, color: '#FFFFFF', padding: '3px 10px', borderRadius: 'var(--radius-full)', fontSize: 'var(--font-size-sm)', fontWeight: 'bold', whiteSpace: 'nowrap' }
        }, badgeName),
        /*#__PURE__*/React.createElement('div', {
          style: { display: 'flex', alignItems: 'center', gap: '6px' }
        },
          /*#__PURE__*/React.createElement('span', {
            style: { fontSize: 'var(--font-size-sm)', color: 'var(--text-light)', whiteSpace: 'nowrap' }
          }, `${dateInfo.dateStr.replace('(', ' (')} ${dateInfo.timeStr}`),
          isMsgMe ? /*#__PURE__*/React.createElement('div', {
            className: 'msg-actions-group-inline',
            style: { display: 'flex', alignItems: 'center', gap: '4px' }
          },
            /* Edit Button */
            /*#__PURE__*/React.createElement('button', {
              type: 'button', onClick: () => onEditMessage && onEditMessage(msg), title: '편집',
              style: { width: '22px', height: '22px', border: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0, color: 'var(--text-muted)' }
            }, editSvg),
            /* Delete Button */
            /*#__PURE__*/React.createElement('button', {
              type: 'button', onClick: () => onDeleteMessage && onDeleteMessage(msg), title: '삭제',
              style: { width: '22px', height: '22px', border: 'none', background: 'none', padding: 0, cursor: 'pointer', color: 'var(--text-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }
            }, /*#__PURE__*/React.createElement(TrashIcon, { size: 14 }))
          ) : null
        )
      ),
      /* Full-width bubble with top tail pointing to name badge */
      /*#__PURE__*/React.createElement('div', { style: { position: 'relative', marginTop: '2px' } },
        /* Outer tail (border color) */
        /*#__PURE__*/React.createElement('div', {
          style: { position: 'absolute', top: '-7px', left: '18px', width: 0, height: 0, borderLeft: '7px solid transparent', borderRight: '7px solid transparent', borderBottom: '7px solid var(--border-subtle)', zIndex: 2 }
        }),
        /* Inner tail (white fill) */
        /*#__PURE__*/React.createElement('div', {
          style: { position: 'absolute', top: '-5px', left: '19px', width: 0, height: 0, borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderBottom: '6px solid var(--bg-card)', zIndex: 3 }
        }),
        /* Bubble container */
        /*#__PURE__*/React.createElement('div', {
          style: { backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '10px 12px', fontSize: 'var(--font-size-base)', lineHeight: '1.4', color: 'var(--text-main)', wordBreak: 'keep-all', overflowWrap: 'break-word', whiteSpace: 'pre-wrap', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', position: 'relative', zIndex: 1 }
        }, bubbleContent)
      )
    );
  })
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
  }) : null));
}

export function MemoCard({ memo, calendar, onOpenEdit, onTogglePin, onShare, onSelectTag, onCommentsChange, getBorderColor, onRequestConfirm, showToast, effectivePinned, hidePinButton = false, variant = 'page' }) {
  const React = window.React;
  const __deps = window.GATHER_UI_DEPS || {};
  const __comp = window.GATHER_UI_COMPONENTS || {};
  const ChatParticipantSheet = __comp.ChatParticipantSheet || __deps.ChatParticipantSheet;
  const LinkPreviewCard = __comp.LinkPreviewCard || __deps.LinkPreviewCard;
  const ClickToPlayVideoCard = __comp.ClickToPlayVideoCard || __deps.ClickToPlayVideoCard;
  const TikTokEmbedWidget = __comp.TikTokEmbedWidget || __deps.TikTokEmbedWidget;
  const MessageCommentIcon = __comp.MessageCommentIcon || __deps.MessageCommentIcon;
  const ParticipantPickerButton = __comp.ParticipantPickerButton || __deps.ParticipantPickerButton;
  const MediaThumb = __comp.MediaThumb || __deps.MediaThumb;
  const PencilIcon = __comp.PencilIcon || __deps.PencilIcon;
  const ShareIcon = __comp.ShareIcon || __deps.ShareIcon;
  const SmallXIcon = __comp.SmallXIcon || __deps.SmallXIcon;
  const TrashIcon = __comp.TrashIcon || __deps.TrashIcon;
  const AutoGrowTextarea = __comp.AutoGrowTextarea || __deps.AutoGrowTextarea;
  // 'page' = memo-page standard module; 'preview' = main-screen section customization.
  const isPreview = variant === 'preview';
  const sanitizeText = __deps.sanitizeText;
  const extractFirstUrl = __deps.extractFirstUrl;

  const imageUrls = memo.imageUrls || [];
  const thumbUrls = memo.thumbUrls || [];
  const memoFirstUrl = extractFirstUrl(memo.text);
  const memoMediaInfo = memoFirstUrl ? getDirectChatMediaInfo(memoFirstUrl) : null;
  // Only media that actually plays inline here (YouTube/Vimeo embeds, direct video files) gets
  // the "영상 바로보기" toggle -- TikTok's façade just opens a new tab instead of playing on this
  // page, which read as the button lying/glitching. memoMediaInfo (any recognized media, not just
  // the inline-playable ones) still governs stripping the raw URL out of the displayed text below,
  // since the TikTok widget/preview card renders regardless of whether the toggle button does.
  const isVideoMedia = !!(memoMediaInfo && memoMediaInfo.playsInline);
  const displayMemoText = memo.text ? ((memo.linkPreview || memoMediaInfo) ? removeFirstUrl(memo.text) : memo.text) : '';
  const memoTextLineCount = displayMemoText ? displayMemoText.split(/\r?\n/).length : 0;
  const hasLongMemoText = displayMemoText.length > 280 || memoTextLineCount > 8;
  const [isMemoTextExpanded, setIsMemoTextExpanded] = React.useState(false);
  const [isVideoOpen, setIsVideoOpen] = React.useState(false);

  // Comments: stored inline on the memo doc as a size-capped array (see hasValidMemoShape in
  // firestore.rules -- comments.size() <= 200, no per-comment shape lock). Composer mirrors the
  // tag-input module's pattern.
  const comments = memo.comments || [];
  const [isCommentComposerOpen, setIsCommentComposerOpen] = React.useState(false);
  const [commentText, setCommentText] = React.useState('');
  const [commentParticipantId, setCommentParticipantId] = React.useState(() => getStoredChatParticipantId(calendar?.id, calendar));
  const [isCommentPartOpen, setIsCommentPartOpen] = React.useState(false);
  const [editingCommentId, setEditingCommentId] = React.useState(null);
  const [isSavingComment, setIsSavingComment] = React.useState(false);
  const commentPart = (calendar?.participants || []).find(p => p.id === commentParticipantId);
  // Long comment threads otherwise push the composer far below the fold -- collapse to the most
  // recent COMMENT_COLLAPSE_LIMIT by default, with a toggle above the list to see the rest.
  const COMMENT_COLLAPSE_LIMIT = 3;
  const [isCommentsExpanded, setIsCommentsExpanded] = React.useState(false);
  const hasMoreComments = comments.length > COMMENT_COLLAPSE_LIMIT;
  const visibleComments = (!hasMoreComments || isCommentsExpanded) ? comments : comments.slice(-COMMENT_COLLAPSE_LIMIT);

  const handleSaveComment = async (e) => {
    e.stopPropagation();
    const text = commentText.trim();
    if (!text || !commentParticipantId || isSavingComment) return;
    const now = Date.now();
    const wasEditing = !!editingCommentId;
    const nextComments = editingCommentId
      ? comments.map(c => c.id === editingCommentId ? { ...c, text, participantId: commentParticipantId, updatedAt: now } : c)
      : [...comments, { id: `cmt_${now}_${Math.random().toString(36).slice(2, 8)}`, participantId: commentParticipantId, text, createdAt: now }];
    setIsSavingComment(true);
    try {
      const saved = await Promise.resolve(onCommentsChange(nextComments));
      if (saved === false) return;
      setCommentText('');
      setEditingCommentId(null);
      setIsCommentComposerOpen(false);
      if (typeof showToast === 'function') {
        showToast(wasEditing ? '댓글이 수정되었습니다' : '댓글이 등록되었습니다', 'success');
      }
    } finally {
      setIsSavingComment(false);
    }
  };

  const handleCancelComment = e => {
    if (e) e.stopPropagation();
    setEditingCommentId(null);
    setCommentText('');
    setIsCommentComposerOpen(false);
  };

  const handleStartEditComment = (e, comment) => {
    e.stopPropagation();
    setEditingCommentId(comment.id);
    setCommentText(comment.text);
    setCommentParticipantId(comment.participantId);
    setIsCommentComposerOpen(true);
  };

  const handleDeleteComment = (e, comment) => {
    e.stopPropagation();
    const commentId = typeof comment === 'string' ? comment : comment?.id;
    if (!commentId) return;
    const target = typeof comment === 'object' && comment ? comment : comments.find(c => c.id === commentId);
    const author = (calendar?.participants || []).find(p => p.id === (target?.participantId || ''));
    const authorName = author?.name || '참여자';
    const snippet = sanitizeText(String(target?.text || ''), 40);
    const message = snippet
      ? `${authorName}님의 '${snippet}' 댓글을 삭제하시겠습니까?`
      : `${authorName}님의 댓글을 삭제하시겠습니까?`;
    const doDelete = async () => {
      const previousComments = comments.slice();
      const saved = await Promise.resolve(onCommentsChange(previousComments.filter(c => c.id !== commentId)));
      if (saved === false) return;
      if (editingCommentId === commentId) {
        setEditingCommentId(null);
        setCommentText('');
        setIsCommentComposerOpen(false);
      }
      if (typeof showToast === 'function') {
        showToast('댓글이 삭제되었습니다', 'delete', 5000, async () => {
          const restored = await Promise.resolve(onCommentsChange(previousComments));
          if (restored !== false && typeof showToast === 'function') showToast('댓글 삭제를 되돌렸습니다', 'success', 3000);
        });
      }
    };
    if (typeof onRequestConfirm === 'function') {
      onRequestConfirm('댓글 삭제', message, doDelete);
    }
  };

  // Reusable multi-image proportional CSS Grid to cleanly fit layout inside card
  const renderMemoCardImages = () => {
    if (imageUrls.length === 0) return null;
    if (imageUrls.length === 1) {
      return /*#__PURE__*/React.createElement(MediaThumb, {
        src: thumbUrls[0] || imageUrls[0],
        fallbackSrc: imageUrls[0] || thumbUrls[0],
        alt: "메모 첨부 이미지",
        loading: 'lazy',
        decoding: 'async',
        style: { width: '100%', maxHeight: '140px', objectFit: 'cover', borderRadius: 'var(--radius-sm)', marginBottom: '8px' }
      });
    }

    const cols = imageUrls.length === 2 ? 2 : 3;
    const maxW = imageUrls.length === 2 ? '100%' : '100%';
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gap: '4px',
        width: '100%',
        maxWidth: maxW,
        marginBottom: '8px'
      }
    }, thumbUrls.slice(0, 6).map((thumb, idx) => /*#__PURE__*/React.createElement(MediaThumb, {
      key: idx,
      src: thumb || imageUrls[idx],
      fallbackSrc: imageUrls[idx] || thumb,
      alt: `메모 첨부 이미지 ${idx + 1}`,
      loading: 'lazy',
      decoding: 'async',
      style: {
        display: 'block',
        width: '100%',
        aspectRatio: '1',
        borderRadius: '4px',
        objectFit: 'cover'
      }
    })));
  };

  return /*#__PURE__*/React.createElement("div", {
    id: `memo-${memo.id}`,
    "data-memo-id": memo.id,
    onClick: (e) => {
      const t = e.target;
      if (t && t.closest && t.closest('input, textarea, select, button, a, [data-stop-card-open]')) return;
      if (typeof onOpenEdit === 'function') onOpenEdit(memo);
    },
    role: "button",
    tabIndex: 0,
    onKeyDown: (e) => {
      // 댓글 등 입력 중 Space/Enter는 카드 열기로 처리하지 않음
      const t = e.target;
      const tag = (t && t.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select' || (t && t.isContentEditable)) return;
      if (t && t.closest && t.closest('input, textarea, select, button, a, [data-stop-card-open]')) return;
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (typeof onOpenEdit === 'function') onOpenEdit(memo);
      }
    },
    style: {
      backgroundColor: (memo.color && memo.color !== 'var(--bg-card)' && memo.color !== '#fff' && memo.color !== '#FFFFFF') ? memo.color : (isPreview ? 'var(--bg-primary)' : '#fff'),
      border: '0',
      borderRadius: 'var(--radius-md)',
      padding: '12px',
      cursor: 'pointer',
      boxShadow: '0 2px 5px rgba(0,0,0,0.03)',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      transition: 'box-shadow 0.2s ease',
      boxSizing: 'border-box'
    },
    className: "memo-card-hover"
  },
    /* Share button -- sits immediately left of the pin toggle (when the pin is shown), same
       absolute-positioned/unstyled-button pattern, same 16px icon size, stroke weight and color
       as the pin's neutral ("off") state -- including its 0.2 opacity, which is what actually
       reads as "weight" at a glance (the stroke-width/color values were already identical; the
       visual mismatch was the pin's off-state being much fainter than a full-opacity share
       icon). Main-screen preview cards hide the pin (hidePinButton) so the share button takes
       its slot instead. */
    /*#__PURE__*/React.createElement("button", {
      onClick: (e) => {
        e.stopPropagation();
        if (onShare) onShare(memo);
      },
      title: "메모 공유",
      style: hidePinButton
        ? { position: 'absolute', top: '12px', right: '18px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', opacity: 0.2, display: 'flex', alignItems: 'center' }
        : { position: 'absolute', top: '10px', right: '34px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', opacity: 0.2, display: 'flex', alignItems: 'center' },
      className: "memo-card-share-btn"
    }, /*#__PURE__*/React.createElement(ShareIcon, { size: 16 })),
    /* Pin action toggle button (stops click propagation so it doesn't open edit modal!) --
       hidden entirely on the main-screen preview (hidePinButton), which has no "고정" concept. */
    !hidePinButton && /*#__PURE__*/React.createElement("button", {
      onClick: (e) => {
        e.stopPropagation();
        onTogglePin();
      },
      title: effectivePinned && !memo.isPinned ? "최근 활동 고정 해제" : undefined,
      style: {
        position: 'absolute', top: '10px', right: '10px',
        background: 'none', border: 'none', cursor: 'pointer',
        color: effectivePinned ? '#F59E0B' : '#64748B',
        opacity: effectivePinned ? 1 : 0.2
      },
      className: "memo-card-pin-btn"
    }, effectivePinned ?
      /* ON state filled pin SVG */
      /*#__PURE__*/React.createElement("svg", {
        xmlns: "http://www.w3.org/2000/svg", width: "16", height: "16", viewBox: "0 0 24 24", fill: "currentColor", className: "icon icon-tabler icon-tabler-filled icon-tabler-pin"
      }, /*#__PURE__*/React.createElement("path", { stroke: "none", d: "M0 0h24v24H0z", fill: "none" }), /*#__PURE__*/React.createElement("path", { d: "M15.113 3.21l.094 .083l5.5 5.5a1 1 0 0 1 -1.175 1.59l-3.172 3.171l-1.424 3.797a1 1 0 0 1 -.158 .277l-.07 .08l-1.5 1.5a1 1 0 0 1 -1.32 .082l-.095 -.083l-2.793 -2.792l-3.793 3.792a1 1 0 0 1 -1.497 -1.32l.083 -.094l3.792 -3.793l-2.792 -2.793a1 1 0 0 1 -.083 -1.32l.083 -.094l1.5 -1.5a1 1 0 0 1 .258 -.187l.098 -.042l3.796 -1.425l3.171 -3.17a1 1 0 0 1 1.497 -1.26z" }))
    :
      /* OFF state outline pin SVG */
      /*#__PURE__*/React.createElement("svg", {
        xmlns: "http://www.w3.org/2000/svg", width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: "icon icon-tabler icons-tabler-outline icon-tabler-pin"
      }, /*#__PURE__*/React.createElement("path", { stroke: "none", d: "M0 0h24v24H0z", fill: "none" }), /*#__PURE__*/React.createElement("path", { d: "M15 4.5l-4 4l-4 1.5l-1.5 1.5l7 7l1.5 -1.5l1.5 -4l4 -4" }), /*#__PURE__*/React.createElement("path", { d: "M9 15l-4.5 4.5" }), /*#__PURE__*/React.createElement("path", { d: "M14.5 4l5.5 5.5" }))
    ),

    /* Title if exists -- paddingRight clears the share icon (and pin icon, when shown) */
    memo.title && /*#__PURE__*/React.createElement("div", {
      style: { fontSize: '1rem', fontWeight: 'bold', color: 'var(--text-main)', marginBottom: '8px', paddingRight: hidePinButton ? '30px' : '44px', wordBreak: 'break-all' }
    }, memo.title),

    /* Images */
    renderMemoCardImages(),

    /* Content Body -- when a link preview card is available below, the bare URL inside the
       text is redundant (same link shown twice), so it's stripped from the body here only.
       memo.linkPreview is the source of truth for whether the preview actually has content
       (same field LinkPreviewCard's cachedData reads), so this stays in sync with it. */
    displayMemoText && /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 'var(--font-size-md)',
        color: 'var(--text-main)',
        lineHeight: '1.4',
        whiteSpace: 'pre-wrap',
        overflowWrap: 'break-word',
        wordBreak: 'break-all',
        ...(hasLongMemoText && !isMemoTextExpanded ? {
          display: '-webkit-box',
          WebkitLineClamp: 8,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        } : {})
      }
    }, parseTextWithLinks(displayMemoText)),

    hasLongMemoText && /*#__PURE__*/React.createElement("button", {
      type: "button",
      onClick: (e) => {
        e.stopPropagation();
        setIsMemoTextExpanded(v => !v);
      },
      "data-stop-card-open": "true",
      style: {
        width: '100%',
        marginTop: '8px',
        padding: '8px 12px',
        border: 'none',
        borderRadius: 'var(--radius-md)',
        background: 'var(--bg-primary)',
        color: 'var(--text-main)',
        fontSize: 'var(--font-size-md)',
        fontWeight: 800,
        cursor: 'pointer',
        textAlign: 'center'
      }
    }, isMemoTextExpanded ? "접기" : "더 보기"),

    /* Media Embed or Link Preview Card under the card content if applicable */
    memoFirstUrl && /*#__PURE__*/React.createElement("div", {
      style: { marginTop: '8px', width: '100%' },
      "data-stop-card-open": "true",
      onClick: e => e.stopPropagation()
    },
      /* Link Preview Card shown primarily */
      /*#__PURE__*/React.createElement(LinkPreviewCard, {
        url: memoFirstUrl,
        fallbackTitle: memo.title || (memo.text ? removeFirstUrl(memo.text).replace(/\n/g, ' ').replace(/\s+/g, ' ').trim() : ''),
        cachedData: memo.linkPreview,
        stretch: true,
        noBorder: isPreview
      }),

      /* Video Toggle button if this URL is a video */
      isVideoMedia && /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: e => {
          e.stopPropagation();
          setIsVideoOpen(prev => !prev);
        },
        style: {
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          width: '100%',
          height: '32px',
          minHeight: '32px',
          padding: '0 12px',
          marginTop: '6px',
          boxSizing: 'border-box',
          borderRadius: 'var(--radius-md)',
          border: 'none',
          backgroundColor: 'color-mix(in srgb, var(--bg-primary) 96%, black)',
          color: isVideoOpen ? 'var(--text-muted)' : 'var(--primary)',
          fontSize: 'var(--font-size-sm)',
          fontWeight: 700,
          cursor: 'pointer'
        }
      },
        isVideoOpen ? [
          /*#__PURE__*/React.createElement(SmallXIcon, { size: 13 }),
          " 영상 닫기"
        ] : [
          /*#__PURE__*/React.createElement("svg", {
            viewBox: "0 0 24 24", width: "13", height: "13", fill: "currentColor"
          }, /*#__PURE__*/React.createElement("path", { d: "M8 5v14l11-7z" })),
          " 영상 바로보기"
        ]
      ),

      /* Video Player when expanded */
      isVideoMedia && isVideoOpen && /*#__PURE__*/React.createElement("div", {
        style: { marginTop: '8px', width: '100%' }
      }, /*#__PURE__*/React.createElement(ClickToPlayVideoCard, {
        url: memoFirstUrl,
        mediaInfo: memoMediaInfo,
        fallbackTitle: memo.title || (memo.text ? removeFirstUrl(memo.text).replace(/\n/g, ' ').replace(/\s+/g, ' ').trim() : ''),
        cachedData: memo.linkPreview
      }))
    ),

    /* Tags container if exists */
    /*#__PURE__*/React.createElement("div", {
      style: { display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '6px', marginTop: '10px' }
    },
      /* Writer badge (capsule with participant's color and white text) */
      (() => {
        const writer = (calendar?.participants || []).find(p => p.id === memo.participantId);
        if (!writer) return null;
        return /*#__PURE__*/React.createElement("span", {
          style: {
            backgroundColor: writer.color || '#94A3B8',
            color: '#FFFFFF',
            borderRadius: 'var(--radius-full)',
            padding: '3px 8px',
            fontSize: 'var(--font-size-xs)',
            fontWeight: 'bold',
            lineHeight: 1,
            whiteSpace: 'nowrap'
          }
        }, writer.name);
      })(),
      
      /* Tags */
      memo.tags && memo.tags.length > 0 && memo.tags.map(tag => /*#__PURE__*/React.createElement("span", {
        key: tag,
        onClick: (e) => {
          e.stopPropagation();
          onSelectTag(tag);
        },
        style: {
          fontSize: 'var(--font-size-xs)', fontWeight: '600',
          color: '#2563EB', backgroundColor: 'rgba(37, 99, 235, 0.08)',
          padding: '3px 8px', borderRadius: '4px',
          cursor: 'pointer', lineHeight: 1,
          whiteSpace: 'nowrap'
        }
      }, tag)),

      /* Comment toggle button -- pushed to the far right of the row */
      /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: (e) => {
          e.stopPropagation();
          setEditingCommentId(null);
          setCommentText('');
          setIsCommentComposerOpen(v => !v);
        },
        title: "댓글",
        "aria-label": "댓글",
        style: {
          marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', padding: '2px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: (comments.length > 0 || isCommentComposerOpen) ? 'var(--accent-primary)' : '#94A3B8', flexShrink: 0
        }
      }, /*#__PURE__*/React.createElement(MessageCommentIcon, { size: 18 }))
    ),

    /* Comment list -- no background, thin divider line between rows instead */
    comments.length > 0 && /*#__PURE__*/React.createElement("div", {
      style: { display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '8px' }
    },
      hasMoreComments && /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: e => { e.stopPropagation(); setIsCommentsExpanded(v => !v); },
        style: {
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
          alignSelf: 'center', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 6px',
          fontSize: 'var(--font-size-sm)', fontWeight: 700, color: 'var(--text-muted)'
        }
      },
        /*#__PURE__*/React.createElement("svg", {
          width: "12", height: "12", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2",
          strokeLinecap: "round", strokeLinejoin: "round",
          style: { transform: isCommentsExpanded ? 'none' : 'rotate(180deg)' }
        }, /*#__PURE__*/React.createElement("path", { d: "M6 9l6 6l6 -6" })),
        isCommentsExpanded ? '댓글 접기' : `댓글 더보기 (${comments.length - COMMENT_COLLAPSE_LIMIT}개)`
      ),
      visibleComments.map((comment, commentIdx) => {
      const author = (calendar?.participants || []).find(p => p.id === comment.participantId);
      return /*#__PURE__*/React.createElement("div", {
        key: comment.id,
        onClick: e => e.stopPropagation(),
        style: {
          display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 2px',
          borderTop: commentIdx > 0 ? '1px solid color-mix(in srgb, var(--bg-primary) 96%, black)' : 'none'
        }
      },
        /*#__PURE__*/React.createElement("span", {
          className: "memo-comment-author-dot",
          role: "img",
          tabIndex: 0,
          "aria-label": `${author?.name || '알 수 없는 작성자'} 작성자`,
          "data-author-name": author?.name || '알 수 없는 작성자',
          title: author?.name || '알 수 없는 작성자',
          style: { width: '8px', height: '8px', borderRadius: '50%', backgroundColor: author?.color || '#94A3B8', flexShrink: 0 }
        }),
        /*#__PURE__*/React.createElement("span", {
          style: { flex: 1, minWidth: 0, fontSize: 'var(--font-size-md)', color: 'var(--text-main)', wordBreak: 'break-word' }
        }, comment.text),
        /*#__PURE__*/React.createElement("button", {
          type: "button", onClick: e => handleStartEditComment(e, comment), title: "편집", "aria-label": "댓글 편집",
          style: { background: 'none', border: 'none', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center', color: 'var(--text-muted)', flexShrink: 0 }
        }, /*#__PURE__*/React.createElement(PencilIcon, { size: 12 })),
        /*#__PURE__*/React.createElement("button", {
          type: "button", onClick: e => handleDeleteComment(e, comment), title: "삭제", "aria-label": "댓글 삭제",
          style: { background: 'none', border: 'none', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center', color: 'var(--text-muted)', flexShrink: 0 }
        }, /*#__PURE__*/React.createElement(TrashIcon, { size: 12 }))
      );
    })),

    /* Comment composer -- same shape as the tag-input module: participant picker + input + save,
       plus a cancel button. On mobile this stacks into two rows (input alone, then picker left /
       cancel+save right); at/above 640px .comment-composer-footer collapses via display:contents
       so its two children rejoin the input as ordinary siblings in one row (see .comment-composer
       rules in app.css) -- same DOM, no separate mobile/desktop render branch needed. */
    isCommentComposerOpen && /*#__PURE__*/React.createElement("div", {
      className: "comment-composer",
      onClick: e => e.stopPropagation(),
      style: { marginTop: '8px' }
    },
      AutoGrowTextarea && /*#__PURE__*/React.createElement(AutoGrowTextarea, {
        className: "comment-composer-input",
        value: commentText,
        onChange: e => setCommentText(e.target.value),
        onClick: e => e.stopPropagation(),
        onKeyDown: e => {
          e.stopPropagation();
          // Allow Enter for newlines; Cmd/Ctrl+Enter saves (matches chat composer).
          if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            if (e.nativeEvent && e.nativeEvent.isComposing) return;
            e.preventDefault();
            handleSaveComment(e);
          }
        },
        placeholder: "댓글을 입력하세요...",
        rows: 1,
        minHeight: 30,
        maxHeight: 200,
        style: {
          width: '100%',
          fontSize: '0.8rem',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-sm)',
          padding: '6px 8px',
          backgroundColor: '#fff',
          color: 'var(--text-main)',
          outline: 'none',
          boxSizing: 'border-box'
        }
      }),
      /*#__PURE__*/React.createElement("div", { className: "comment-composer-footer" },
        /*#__PURE__*/React.createElement(ParticipantPickerButton, {
          participant: commentPart,
          onClick: () => setIsCommentPartOpen(true)
        }),
        /*#__PURE__*/React.createElement("div", { className: "comment-composer-buttons" },
          /*#__PURE__*/React.createElement("button", {
            type: "button",
            onClick: handleCancelComment,
            style: {
              flexShrink: 0, height: '30px', padding: '0 12px', borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-card)', color: 'var(--text-muted)',
              fontSize: 'var(--font-size-md)', fontWeight: 'bold', cursor: 'pointer'
            }
          }, "취소"),
          /*#__PURE__*/React.createElement("button", {
            type: "button",
            onClick: handleSaveComment,
            disabled: !commentText.trim() || !commentParticipantId || isSavingComment,
            style: {
              flexShrink: 0, height: '30px', padding: '0 12px', borderRadius: 'var(--radius-sm)', border: 'none',
              backgroundColor: 'var(--accent-primary)', color: '#FFFFFF', fontSize: 'var(--font-size-md)', fontWeight: 'bold',
              cursor: isSavingComment ? 'wait' : 'pointer', opacity: (commentText.trim() && commentParticipantId && !isSavingComment) ? 1 : 0.5
            }
          }, isSavingComment ? "저장 중…" : "저장")
        )
      )
    ),

    isCommentPartOpen && /*#__PURE__*/React.createElement(ChatParticipantSheet, {
      calendar: calendar,
      selectedId: commentParticipantId,
      onSelect: id => { setCommentParticipantId(id); setIsCommentPartOpen(false); },
      onClose: () => setIsCommentPartOpen(false)
    })
  );
}

export function PollList({ calendar, onCreatePoll, onEditPoll, onVotePoll, onCancelVote, onRequestConfirm, expandSignal }) {
  const React = window.React;
  const __deps = window.GATHER_UI_DEPS || {};
  const __comp = window.GATHER_UI_COMPONENTS || {};
  const PollSectionIcon = __comp.PollSectionIcon || __deps.PollSectionIcon;
  const ParticipantBadge = __comp.ParticipantBadge || __deps.ParticipantBadge;
  const SectionCountBadge = __comp.SectionCountBadge || __deps.SectionCountBadge;
  const SectionToggleButton = __comp.SectionToggleButton || __deps.SectionToggleButton;
  const SettingsIcon = __comp.SettingsIcon || __deps.SettingsIcon;
  const SmallXIcon = __comp.SmallXIcon || __deps.SmallXIcon;
  const getActiveParticipants = __deps.getActiveParticipants;
  const renderTextWithUrlBadge = __deps.renderTextWithUrlBadge;

  // Closed (deadline-passed) polls stay in 진행중 투표 rather than disappearing -- they're shown
  // with a "confirmed" treatment (dimmed card + winning-option badge) instead of being filtered
  // out, so the group can still see what was decided without having to dig through poll history.
  // Explicitly hidden polls (poll.hidden, toggled from the poll edit modal) are the one case that
  // does disappear from here -- they still show in 캘린더 설정 > 일반's unfiltered poll list, so
  // the toggle can be reversed there.
  const polls = getCalendarPolls(calendar).filter(poll => !poll.hidden);
  const participants = getActiveParticipants(calendar);
  const participantsMap = participants.reduce((acc, participant) => {
    acc[participant.id] = participant;
    return acc;
  }, {});
  const [isCollapsed, setIsCollapsed] = React.useState(true); // default closed
  const [openPollIds, setOpenPollIds] = React.useState({});

  // Header's "투표" main-menu button bumps expandSignal to force this section open (and its
  // poll cards visible) even if the user had collapsed it -- scrolling here without expanding
  // would otherwise land on an empty-looking, collapsed header.
  React.useEffect(() => {
    if (expandSignal) setIsCollapsed(false);
  }, [expandSignal]);

  // A poll can be visually open two ways: the whole section is expanded (!isCollapsed), or
  // it was opened individually while the section stayed collapsed (openPollIds[id]). The
  // section-level arrow button needs to know if ANYTHING is open to decide its direction --
  // toggling the raw isCollapsed flag alone would expand a section that's already showing an
  // individually-opened poll (since isCollapsed was never flipped to false for that), instead
  // of closing it like the button visually promises.
  const anyPollOpen = !isCollapsed || Object.values(openPollIds).some(Boolean);
  const togglePollList = () => {
    if (anyPollOpen) {
      setIsCollapsed(true);
      setOpenPollIds({});
    } else {
      setIsCollapsed(false);
    }
  };

  return /*#__PURE__*/React.createElement("section", {
    className: "polls-panel",
    style: { textAlign: 'left' }
  }, /*#__PURE__*/React.createElement("div", {
    className: "polls-panel-header",
    style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' },
    onClick: togglePollList
  }, /*#__PURE__*/React.createElement("div", {
    className: "summary-title",
    style: { color: '#2563EB', marginBottom: 0, display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'bold' }
  }, /*#__PURE__*/React.createElement(PollSectionIcon, null), "\uC9C4\uD589\uC911 \uD22C\uD45C ", /*#__PURE__*/React.createElement(SectionCountBadge, { count: polls.length })),
  /*#__PURE__*/React.createElement(SectionToggleButton, {
    collapsed: !anyPollOpen,
    onToggle: togglePollList,
    label: anyPollOpen ? "진행중 투표 접기" : "진행중 투표 펼치기"
  })), polls.length === 0 ? /*#__PURE__*/React.createElement("div", {
    style: { color: 'var(--text-muted)', fontSize: 'var(--font-size-base)', padding: '10px 0', textAlign: 'center' }
  }, "\uC544\uC9C1 \uC0DD\uC131\uB41C \uD22C\uD45C\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4.") : /*#__PURE__*/React.createElement("div", {
    className: "polls-section"
  }, polls.map(poll => {
    const isOptionsVisible = !isCollapsed || !!openPollIds[poll.id];
    const closed = isPollClosed(poll);
    // Winning option(s) for a closed poll -- ties mark every tied option, and a poll nobody
    // voted on marks none (no (투표확정) badge shown anywhere in that case). Used to both pin
    // the winning row(s) to the top of the option list and tag them with a badge in place,
    // rather than a separate summary line under the title/description.
    const winningOptionIds = (() => {
      if (!closed) return new Set();
      const optionsWithVotes = getActivePollOptions(poll).map(option => ({
        id: option.id,
        count: getPollOptionVoterIds(poll, option.id).length
      }));
      const maxVotes = optionsWithVotes.reduce((max, o) => Math.max(max, o.count), 0);
      if (maxVotes <= 0) return new Set();
      return new Set(optionsWithVotes.filter(o => o.count === maxVotes).map(o => o.id));
    })();
    const orderedOptions = (() => {
      const active = getActivePollOptions(poll);
      if (!closed || winningOptionIds.size === 0) return active;
      const winners = active.filter(option => winningOptionIds.has(option.id));
      const rest = active.filter(option => !winningOptionIds.has(option.id));
      return [...winners, ...rest];
    })();
    // A closed poll's winning row stays visible under the description even while the section/
    // this poll is collapsed, instead of disappearing along with the rest of the option list --
    // expanding still shows every option (winner first, per orderedOptions above).
    const showOptionList = isOptionsVisible || (closed && winningOptionIds.size > 0);
    const visibleOptions = isOptionsVisible ? orderedOptions : orderedOptions.filter(option => winningOptionIds.has(option.id));
    // 미참여: active roster members who haven't voted on ANY option of this poll yet (union
    // across options, not per-option) -- who still needs a nudge to vote at all.
    const votedParticipantIds = new Set(
      getActivePollOptions(poll).flatMap(option => getPollOptionVoterIds(poll, option.id))
    );
    const nonVoters = participants.filter(p => !votedParticipantIds.has(p.id));
    const renderNonVoterBadges = className => nonVoters.length > 0 && /*#__PURE__*/React.createElement("div", {
      key: className, className
    },
      /*#__PURE__*/React.createElement("span", {
        style: { fontSize: 'var(--font-size-xs)', fontWeight: 700, color: 'var(--text-muted)', whiteSpace: 'nowrap' }
      }, "미참여"),
      nonVoters.map(p => /*#__PURE__*/React.createElement(ParticipantBadge, {
        key: p.id,
        participant: p,
        style: { opacity: 0.65 }
      }))
    );

    const togglePollOptions = (event) => {
      if (isCollapsed) {
        event.stopPropagation();
        setOpenPollIds(prev => ({
          ...prev,
          [poll.id]: !prev[poll.id]
        }));
      }
    };

    return /*#__PURE__*/React.createElement("section", {
      key: poll.id,
      className: "poll-card",
      style: closed ? { backgroundColor: 'var(--bg-primary)' } : undefined
    }, /*#__PURE__*/React.createElement("div", {
      className: "poll-header",
      style: {
        alignItems: 'center',
        marginBottom: showOptionList ? '12px' : '0'
      }
    }, /*#__PURE__*/React.createElement("div", {
      onClick: togglePollOptions,
      "data-no-press-feedback": true,
      style: { cursor: isCollapsed ? 'pointer' : 'default', flex: 1 }
    }, /*#__PURE__*/React.createElement("div", {
      className: "poll-title",
      style: { display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }
    }, poll.title, poll.deadline && /*#__PURE__*/React.createElement("span", {
      className: closed ? 'poll-deadline-badge is-closed' : 'poll-deadline-badge is-open',
      style: {
        fontSize: 'var(--font-size-xs)', fontWeight: 800, padding: '2px 8px', borderRadius: 'var(--radius-full)', whiteSpace: 'nowrap'
      }
    }, closed ? '마감됨' : `마감 ${formatPollDeadline(poll.deadline)}`)), poll.description && /*#__PURE__*/React.createElement("div", {
      className: "poll-desc"
    }, renderTextWithUrlBadge(poll.description))), renderNonVoterBadges('poll-nonvoters-desktop'), /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "btn btn-secondary",
      title: "\uD22C\uD45C \uC124\uC815",
      style: { padding: '8px' },
      onClick: () => onEditPoll(poll)
    }, /*#__PURE__*/React.createElement(SettingsIcon, null))), renderNonVoterBadges('poll-nonvoters-mobile'), showOptionList && /*#__PURE__*/React.createElement("div", {
      className: "poll-option-list"
    }, visibleOptions.map((option, index) => {
      const voterIds = getPollOptionVoterIds(poll, option.id).filter(participantId => participantsMap[participantId]);
      const voteCount = voterIds.length;
      // Relative to the participant roster, not the sum of votes across options, so an option
      // everyone voted for reads as a full 100% bar even on a multi-select poll.
      const percent = participants.length > 0 ? Math.min(100, Math.round(voteCount / participants.length * 100)) : 0;
      const isWinner = winningOptionIds.has(option.id);
      return /*#__PURE__*/React.createElement("div", {
        key: option.id,
        className: `poll-option-row${isWinner ? ' is-confirmed-winner' : ''}`
      }, /*#__PURE__*/React.createElement("div", {
        className: "poll-option-main"
      }, /*#__PURE__*/React.createElement("div", {
        style: { display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }
      }, isWinner && /*#__PURE__*/React.createElement("span", {
        className: "poll-confirmed-badge"
      }, "투표확정"), /*#__PURE__*/React.createElement("span", null, option.text)), option.url && /*#__PURE__*/React.createElement("span", {
        className: "poll-option-link",
        onClick: event => {
          event.stopPropagation();
          window.open(option.url, '_blank', 'noopener,noreferrer');
        },
        title: "\uC0C8\uCC3D\uC73C\uB85C \uB9C1\uD06C \uC5F4\uAE30"
      }, option.url)), /*#__PURE__*/React.createElement("div", {
        className: "poll-result-row"
      }, /*#__PURE__*/React.createElement("div", {
        className: "poll-progress",
        title: `${percent}%`
      }, /*#__PURE__*/React.createElement("div", {
        className: "poll-progress-fill",
        style: { width: `${percent}%` }
      })), /*#__PURE__*/React.createElement("span", {
        className: "poll-vote-count"
      }, voteCount, "\uD45C")), /*#__PURE__*/React.createElement("div", {
        className: "poll-vote-actions"
      }, /*#__PURE__*/React.createElement("button", {
        type: "button",
        className: "btn btn-secondary",
        onClick: () => onVotePoll(poll, option),
        style: closed ? { display: 'none' } : undefined
      }, "\uD22C\uD45C\uD558\uAE30"), voterIds.length > 0 && /*#__PURE__*/React.createElement("div", {
        className: "poll-voter-badges"
      }, voterIds.map(participantId => {
        const participant = participantsMap[participantId];
        const textColor = '#FFFFFF';
        return /*#__PURE__*/React.createElement("span", {
          key: participantId,
          className: "poll-voter-badge",
          style: {
            backgroundColor: participant.color,
            color: textColor,
            // .poll-voter-badge's CSS padding is intentionally right-light (3px 4px 3px 8px) to
            // make room for the 투표 취소 (X) button below -- once that button stops rendering
            // (closed poll), the smaller right padding alone made the name text look off-center,
            // hugging the right edge. Restore symmetric padding here when there's no button.
            ...(closed ? { padding: '3px 8px' } : null)
          }
        }, participant.name, !closed && /*#__PURE__*/React.createElement("button", {
          type: "button",
          className: "poll-voter-remove",
          title: `${participant.name} \uD22C\uD45C \uCDE8\uC18C`,
          onClick: event => {
            event.stopPropagation();
            onRequestConfirm('투표 취소', `${participant.name}님 투표를 취소하시겠습니까?`, () => {
              onCancelVote(poll, option, participant.id);
            });
          }
        }, /*#__PURE__*/React.createElement(SmallXIcon, null)));
      }))));
    })));
  })));
}

export function GlobalSearchModal({
  calendar,
  chatMessages,
  memos,
  onClose,
  onSelectDate,
  onOpenChatMessage,
  onOpenImage,
  onOpenMemo,
  initialQuery = ''
}) {
  const React = window.React;
  const __deps = window.GATHER_UI_DEPS || {};
  const __comp = window.GATHER_UI_COMPONENTS || {};
  const ResizableModalContainer = __comp.ResizableModalContainer || __deps.ResizableModalContainer || (function Shell(p) { return React.createElement('div', p, p.children); });
  const SearchCategoryTabs = __comp.SearchCategoryTabs || __deps.SearchCategoryTabs;
  const SearchIcon = __comp.SearchIcon || __deps.SearchIcon;
  const SearchResultLogRow = __comp.SearchResultLogRow || __deps.SearchResultLogRow;
  const SmallXIcon = __comp.SmallXIcon || __deps.SmallXIcon;

  const [query, setQuery] = React.useState(initialQuery);
  const inputRef = React.useRef(null);
  React.useEffect(() => { inputRef.current?.focus(); }, []);

  const q = query.trim().toLowerCase();

  // chatMessages/memos are capped for display, so searching that array would miss older items.
  // A deliberate search is a correctness operation: query the complete server collections with
  // server source instead of silently returning a plausible-looking recent-only answer.
  const [fullHistory, setFullHistory] = React.useState(null);
  const [isLoadingFullHistory, setIsLoadingFullHistory] = React.useState(false);
  React.useEffect(() => {
    if (!q || fullHistory || isLoadingFullHistory || !calendar?.id || !__fb()) return;
    setIsLoadingFullHistory(true);
    Promise.all([
      withFirestoreReadTimeout(__fb().collection('calendars').doc(`cal_${calendar.id}`).collection('messages').get({ source: 'server' })),
      withFirestoreReadTimeout(__fb().collection('calendars').doc(`cal_${calendar.id}`).collection('memos').get({ source: 'server' }))
    ]).then(([messagesSnap, memosSnap]) => {
      setFullHistory({
        chatMessages: messagesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })),
        memos: memosSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      });
    }).catch(err => {
      console.warn('Full-history search fetch failed, falling back to already-loaded data:', err);
    }).finally(() => {
      setIsLoadingFullHistory(false);
    });
  }, [q, fullHistory, isLoadingFullHistory, calendar?.id]);

  const matches = React.useMemo(
    () => computeCalendarSearchMatches(calendar, fullHistory?.chatMessages || chatMessages, fullHistory?.memos || memos, q),
    [calendar, fullHistory, chatMessages, memos, q]
  );

  const SimpleBottomSheetPicker = __deps.SimpleBottomSheetPicker;

  const isMobile = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(max-width: 640px)').matches;

  const tabDefs = [
    { key: 'all', label: '전체', count: Object.values(matches).reduce((total, items) => total + (Array.isArray(items) ? items.length : 0), 0) },
    { key: 'schedules', label: '일정', count: (matches.schedules || []).length },
    { key: 'chat', label: '채팅', count: (matches.chat || []).length },
    { key: 'photos', label: '사진', count: (matches.photos || []).length },
    { key: 'places', label: '장소', count: (matches.places || []).length },
    { key: 'tags', label: '사진 태그', count: (matches.tags || []).length },
    { key: 'expenses', label: '정산', count: (matches.expenses || []).length },
    { key: 'memos', label: '메모', count: (matches.memos || []).length }
  ];
  const hasResults = tabDefs.some(t => t.count > 0);

  const [activeTab, setActiveTab] = React.useState('all');
  // Whenever the query (or its results) changes, jump to the first category that actually has
  // matches instead of leaving the user staring at an empty tab.
  React.useEffect(() => {
    if (!q) return;
    setActiveTab(prev => {
      const prevDef = tabDefs.find(t => t.key === prev);
      if (prevDef && prevDef.count > 0) return prev;
      const firstNonEmpty = tabDefs.find(t => t.count > 0);
      return firstNonEmpty ? firstNonEmpty.key : prev;
    });
  }, [q, matches.schedules.length, matches.chat.length, (matches.photos || []).length, (matches.places || []).length, (matches.tags || []).length, matches.expenses.length, matches.memos.length]);

  // The default view is a single chronological result stream. Category tabs remain
  // available for drilling down, but users no longer need to guess which tab contains
  // a matching record. This is intentionally deterministic text search, not AI.
  const allResults = React.useMemo(() => {
    const rows = [];
    (matches.schedules || []).forEach(item => rows.push({
      id: `schedule_${item.date}_${item.participantId}`, badgeName: `일정 · ${item.participantName}`, badgeColor: item.participantColor,
      timeStr: formatDateWithDayName(item.date), content: item.note || item.participantName,
      onClick: () => { onSelectDate(item.date); onClose(); }, sortStamp: item.date
    }));
    (matches.chat || []).forEach(item => rows.push({
      id: `chat_${item.id}`, badgeName: `채팅 · ${item.participantName}`, badgeColor: item.participantColor,
      timeStr: formatLogTimestamp(item.timestamp), content: item.text || '사진/미디어',
      onClick: () => { onOpenChatMessage?.(item.id); onClose(); }, sortStamp: String(item.timestamp || 0).padStart(14, '0')
    }));
    (matches.photos || []).forEach((item, idx) => rows.push({
      id: `photo_${item.id || idx}`, badgeName: '사진', badgeColor: '#8B5CF6',
      timeStr: item.date ? formatDateWithDayName(item.date) : '', content: item.tags || '일정 사진',
      onClick: () => { if (item.date) onSelectDate(item.date); onClose(); }, sortStamp: item.date || ''
    }));
    (matches.places || []).forEach(item => rows.push({
      id: `place_${item.id}`, badgeName: `장소 · ${item.alias || item.name}`, badgeColor: '#06B6D4',
      timeStr: item.address || '', content: item.memo || item.name || '', onClick: () => onClose(), sortStamp: item.visitDate || ''
    }));
    (matches.expenses || []).forEach(item => rows.push({
      id: `expense_${item.id}`, badgeName: item.categoryName, badgeColor: item.categoryColor,
      timeStr: formatDateWithDayName(item.date), content: `${item.label || item.url || ''} · ${item.amount < 0 ? '+' : '-'}${Math.abs(Number(item.amount)).toLocaleString()}원`,
      onClick: () => { onSelectDate(item.date); onClose(); }, sortStamp: item.date || ''
    }));
    (matches.memos || []).forEach(item => rows.push({
      id: `memo_${item.id}`, badgeName: `메모 · ${item.participantName}`, badgeColor: item.participantColor,
      timeStr: formatLogTimestamp(item.createdAt), content: [item.title, item.text].filter(Boolean).join(' · '),
      onClick: () => { onOpenMemo?.(item.id); onClose(); }, sortStamp: String(item.createdAt || 0).padStart(14, '0')
    }));
    return rows.sort((a, b) => String(b.sortStamp || '').localeCompare(String(a.sortStamp || '')));
  }, [matches, onClose, onOpenChatMessage, onOpenMemo, onSelectDate]);

  return /*#__PURE__*/React.createElement("div", {
    className: "modal-overlay",
    onClick: onClose,
    style: { zIndex: 11000 }
  }, /*#__PURE__*/React.createElement(ResizableModalContainer, {
    className: "modal-container",
    onClick: e => e.stopPropagation(),
    style: { maxWidth: '520px' }
  },
    /*#__PURE__*/React.createElement("div", { className: "modal-header" },
      /*#__PURE__*/React.createElement("h3", { style: { fontSize: '1.1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' } },
        /*#__PURE__*/React.createElement(SearchIcon, null), "검색"
      ),
      /*#__PURE__*/React.createElement("button", {
        onClick: onClose,
        style: { background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.2rem', cursor: 'pointer', display: 'flex', alignItems: 'center' }
      }, /*#__PURE__*/React.createElement(SmallXIcon, { size: 20 }))
    ),
    /*#__PURE__*/React.createElement("div", { className: "modal-body" },
      /*#__PURE__*/React.createElement("input", {
        ref: inputRef,
        type: "text",
        className: "form-input",
        style: { width: '100%' },
        placeholder: "일정, 채팅, 사진, 장소, 정산, 메모 검색...",
        value: query,
        onChange: e => setQuery(e.target.value)
      }),

      isLoadingFullHistory && /*#__PURE__*/React.createElement("div", {
        style: { fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', marginTop: '8px' }
      }, "전체 기록에서 검색 중..."),

      q && hasResults && /*#__PURE__*/React.createElement("div", {
        style: { position: 'sticky', top: '-18px', backgroundColor: 'var(--bg-card)', zIndex: 10, marginTop: '10px', marginBottom: '12px', width: '100%' }
      }, isMobile && SimpleBottomSheetPicker ? /*#__PURE__*/React.createElement(SimpleBottomSheetPicker, {
        title: "검색 카테고리 선택",
        value: activeTab,
        options: tabDefs.map(t => {
          const hasCount = (t.count || 0) >= 1;
          return {
            value: t.key,
            label: /*#__PURE__*/React.createElement(React.Fragment, null, `${t.label} `, /*#__PURE__*/React.createElement("span", {
              style: {
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: '20px', height: '18px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: hasCount ? '#2563EB' : '#E2E8F0',
                color: hasCount ? '#FFFFFF' : '#475569',
                fontSize: 'var(--font-size-sm)', fontWeight: 'bold', padding: '0 6px', marginLeft: '4px'
              }
            }, t.count))
          };
        }),
        onSelect: setActiveTab
      }) : /*#__PURE__*/React.createElement(SearchCategoryTabs, { tabs: tabDefs, activeKey: activeTab, onSelect: setActiveTab, containerStyle: { width: '100%' } })),

      !q && /*#__PURE__*/React.createElement("div", { style: { padding: '30px', color: 'var(--text-muted)', fontSize: 'var(--font-size-base)', textAlign: 'center' } }, "검색어를 입력해 주세요."),
      q && !hasResults && /*#__PURE__*/React.createElement("div", { style: { padding: '30px', color: 'var(--text-muted)', fontSize: 'var(--font-size-base)', textAlign: 'center' } }, "검색 결과가 없습니다."),

      q && hasResults && activeTab === 'schedules' && /*#__PURE__*/React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: '6px' } },
        matches.schedules.map(item => /*#__PURE__*/React.createElement(SearchResultLogRow, {
          key: `${item.date}_${item.participantId}`,
          badgeName: item.participantName,
          badgeColor: item.participantColor,
          timeStr: formatDateWithDayName(item.date),
          onClick: () => { onSelectDate(item.date); onClose(); }
        }, highlightKeyword(item.note || '', q)))
      ),

      q && hasResults && activeTab === 'all' && /*#__PURE__*/React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: '6px' } },
        allResults.slice(0, 100).map(item => /*#__PURE__*/React.createElement(SearchResultLogRow, {
          key: item.id,
          badgeName: item.badgeName,
          badgeColor: item.badgeColor,
          timeStr: item.timeStr,
          onClick: item.onClick
        }, highlightKeyword(item.content, q)))
      ),

      q && hasResults && activeTab === 'chat' && /*#__PURE__*/React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: '6px' } },
        matches.chat.map(msg => /*#__PURE__*/React.createElement(SearchResultLogRow, {
          key: msg.id,
          badgeName: msg.participantName,
          badgeColor: msg.participantColor,
          timeStr: formatLogTimestamp(msg.timestamp),
          onClick: () => { if (typeof onOpenChatMessage === 'function') onOpenChatMessage(msg.id); if (typeof onClose === 'function') onClose(); }
        }, highlightKeyword(msg.text || '', q)))
      ),

      q && hasResults && activeTab === 'photos' && /*#__PURE__*/React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: '6px' } },
        (matches.photos || []).map((photo, idx) => /*#__PURE__*/React.createElement(SearchResultLogRow, {
          key: photo.id || `${photo.imageUrl}_${idx}`,
          badgeName: "일정 사진",
          badgeColor: "#8B5CF6",
          timeStr: photo.date ? formatDateWithDayName(photo.date) : '',
          onClick: () => { if (photo.date) onSelectDate(photo.date); onClose(); }
        }, photo.tags || '일정 사진'))
      ),

      q && hasResults && activeTab === 'places' && /*#__PURE__*/React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: '6px' } },
        (matches.places || []).map(place => /*#__PURE__*/React.createElement(SearchResultLogRow, {
          key: place.id,
          badgeName: place.alias || place.name,
          badgeColor: "#06B6D4",
          timeStr: place.address || '',
          onClick: () => { onClose(); }
        }, highlightKeyword(place.memo || place.name || '', q)))
      ),

      q && hasResults && activeTab === 'tags' && /*#__PURE__*/React.createElement("div", {
        style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(72px, 100%), 1fr))', gap: '6px' }
      },
        matches.tags.map(entry => /*#__PURE__*/React.createElement("button", {
          key: `${entry.messageId}_${entry.directMediaUrl ? 'direct' : entry.imageIndex}`,
          type: "button",
          title: entry.tags,
          onClick: () => { onOpenImage && onOpenImage(entry.messageId, entry.imageIndex, entry.directMediaUrl); onClose(); },
          style: { padding: 0, border: 0, background: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '4px' }
        },
          /*#__PURE__*/React.createElement("img", {
            src: entry.thumb,
            alt: entry.tags || '태그된 사진',
            loading: "lazy",
            decoding: "async",
            style: { width: '100%', aspectRatio: '1 / 1', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }
          }),
          /*#__PURE__*/React.createElement("span", {
            style: { fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }
          }, highlightKeyword(entry.tags || '', q))
        ))
      ),

      q && hasResults && activeTab === 'expenses' && /*#__PURE__*/React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: '6px' } },
        matches.expenses.map(exp => /*#__PURE__*/React.createElement(SearchResultLogRow, {
          key: exp.id,
          badgeName: exp.categoryName,
          badgeColor: exp.categoryColor,
          timeStr: formatDateWithDayName(exp.date),
          onClick: () => { onSelectDate(exp.date); onClose(); }
        }, highlightKeyword(exp.label || exp.url || '', q), ' · ', /*#__PURE__*/React.createElement("span", {
          style: { fontWeight: 800, color: exp.amount < 0 ? 'var(--status-green)' : '#DC2626' }
        }, `${exp.amount < 0 ? '+' : '-'}${Math.abs(Number(exp.amount)).toLocaleString()}원`)))
      ),

      q && hasResults && activeTab === 'memos' && /*#__PURE__*/React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: '6px' } },
        matches.memos.map(memo => /*#__PURE__*/React.createElement(SearchResultLogRow, {
          key: memo.id,
          badgeName: memo.participantName,
          badgeColor: memo.participantColor,
          timeStr: formatLogTimestamp(memo.createdAt),
          onClick: () => { onOpenMemo && onOpenMemo(memo.id); onClose(); }
        },
          memo.title && /*#__PURE__*/React.createElement("div", { style: { fontWeight: 800, marginBottom: '2px' } }, highlightKeyword(memo.title, q)),
          memo.text && highlightKeyword(memo.text.length > 80 ? memo.text.slice(0, 80) + '...' : memo.text, q)
        ))
      )
    )
  ));
}

export function EditMessageModal({
  message,
  calendar,
  onSave,
  onClose,
  onRequestConfirm,
  showToast
}) {
  const React = window.React;
  const __deps = window.GATHER_UI_DEPS || {};
  const __comp = window.GATHER_UI_COMPONENTS || {};
  const ChatParticipantSheet = __comp.ChatParticipantSheet || __deps.ChatParticipantSheet;
  const EmojiPickerIcon = __comp.EmojiPickerIcon || __deps.EmojiPickerIcon;
  const EmojiPickerSheet = __comp.EmojiPickerSheet || __deps.EmojiPickerSheet;
  const ImageProcessingOverlay = __comp.ImageProcessingOverlay || __deps.ImageProcessingOverlay;
  const ImageThumbRemoveButton = __comp.ImageThumbRemoveButton || __deps.ImageThumbRemoveButton;
  const ParticipantPickerButton = __comp.ParticipantPickerButton || __deps.ParticipantPickerButton;
  const ResizableModalContainer = __comp.ResizableModalContainer || __deps.ResizableModalContainer || (function Shell(p) { return React.createElement('div', p, p.children); });
  const SmallXIcon = __comp.SmallXIcon || __deps.SmallXIcon;
  const autoGrowTextarea = __deps.autoGrowTextarea;

  const [text, setText] = React.useState(message.text || '');
  const [participantId, setParticipantId] = React.useState(message.participantId || '');
  const [isPartSheetOpen, setIsPartSheetOpen] = React.useState(false);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = React.useState(false);
  const part = (calendar.participants || []).find(p => p.id === participantId);
  const [images, setImages] = React.useState(() => {
    const urls = Array.isArray(message.imageUrls) && message.imageUrls.length > 0
      ? message.imageUrls
      : (message.imageUrl ? [message.imageUrl] : []);
    const thumbs = Array.isArray(message.thumbUrls) && message.thumbUrls.length > 0
      ? message.thumbUrls
      : (message.thumbUrl ? [message.thumbUrl] : []);
    return urls.map((url, idx) => ({ original: url, thumbnail: thumbs[idx] || url, isExisting: true }));
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const fileInputRefEdit = React.useRef(null);
  const [imageProcessingEdit, setImageProcessingEdit] = React.useState(null);
  const editTextareaRef = React.useRef(null);
  React.useEffect(() => {
    const grow = () => {
      const el = editTextareaRef.current;
      if (!el || typeof autoGrowTextarea !== 'function') return;
      // Grow to fit existing message body on open (and after emoji/image changes).
      // Cap is large; modal-body scroll handles viewport overflow.
      autoGrowTextarea(el, 5000);
    };
    grow();
    requestAnimationFrame(() => {
      grow();
      requestAnimationFrame(grow);
    });
  }, [text, images.length]);
  const editMessageDirtySnapshot = () => JSON.stringify([
    text,
    participantId,
    images.map(img => [img.original, img.thumbnail, img.isExisting ? 1 : 0])
  ]);
  const { requestClose, overlayOnClick } = useModalDirtyGuard(
    onClose,
    onRequestConfirm,
    undefined,
    true,
    editMessageDirtySnapshot,
    message?.id || 'new'
  );

  const handleFileChangeEdit = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    try {
      const remainingSlots = 50 - images.length;
      if (remainingSlots <= 0) {
        if (showToast) showToast('사진 최대 50장', 'error');
        return;
      }

      const filesToProcess = Array.from(files).slice(0, remainingSlots);
      if (files.length > remainingSlots && showToast) {
        showToast(`${remainingSlots}장만 추가됨 (최대 50장)`, 'info');
      }

      setImageProcessingEdit({ current: 0, total: filesToProcess.length });
      const { succeeded, failed } = await processImageFilesSequentially(
        filesToProcess,
        progress => setImageProcessingEdit(progress)
      );

      if (succeeded.length > 0) {
        setImages(prev => [...prev, ...succeeded]);
      }
      if (failed.length > 0) {
        console.error('Image compression failed for:', failed.map(f => f.fileName));
        const message = describeImageProcessingFailures(failed);
        if (showToast) showToast(message, 'error', 5000);
        else console.warn(message);
      }
    } catch (err) {
      console.error('handleFileChangeEdit unexpected error:', err);
      const message = '사진 첨부 중 오류';
      if (showToast) showToast(message, 'error', 5000);
      else console.warn(message);
    } finally {
      setImageProcessingEdit(null);
      e.target.value = '';
    }
  };

  const handleSave = async () => {
    if ((!text.trim() && images.length === 0) || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const saved = await onSave(text.trim(), images, participantId);
      if (saved !== false) onClose();
    } catch (err) {
      console.error('EditMessageModal save error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const insertEmojiIntoEditInput = (emoji) => {
    const textarea = editTextareaRef.current;
    const start = textarea ? (textarea.selectionStart ?? text.length) : text.length;
    const end = textarea ? (textarea.selectionEnd ?? text.length) : text.length;
    const next = text.slice(0, start) + emoji + text.slice(end);
    setText(next);
    if (textarea) {
      requestAnimationFrame(() => {
        textarea.focus();
        const pos = start + emoji.length;
        textarea.setSelectionRange(pos, pos);
        if (typeof autoGrowTextarea === 'function') autoGrowTextarea(textarea, 5000);
      });
    }
  };

  // Mirrors the main composer's handlePasteImagesChat -- the edit textarea had no paste handler
  // at all before this, so Ctrl+V (or a right-click "이미지 복사" paste) here silently did
  // nothing while the same gesture in the composer attached the image with a progress overlay.
  const handlePasteImagesEdit = async (e) => {
    const pastedFiles = getImageFilesFromClipboardEvent(e);
    if (pastedFiles.length === 0) return;
    e.preventDefault();
    e.stopPropagation();
    try {
      await appendChatImageFiles({
        files: pastedFiles,
        currentCount: images.length,
        setImageProcessing: setImageProcessingEdit,
        setChatImages: setImages,
        showToast
      });
    } catch (err) {
      console.error('handlePasteImagesEdit unexpected error:', err);
      if (showToast) showToast('붙여넣은 사진 첨부 중 오류', 'error', 5000);
    } finally {
      setImageProcessingEdit(null);
    }
  };

  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "modal-overlay",
    onClick: e => { if (!isSubmitting) overlayOnClick(e); },
    style: { zIndex: 11000 }
  }, /*#__PURE__*/React.createElement(ResizableModalContainer, {
    className: "modal-container",
    onClick: e => e.stopPropagation(),
    style: {
      width: '90%',
      maxWidth: '400px',
      borderRadius: 'var(--radius-md)',
      // Grow with content; ResizableModalContainer also clamps to visualViewport
      maxHeight: 'min(92vh, 100dvh)',
      display: 'flex',
      flexDirection: 'column'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal-header",
    style: { padding: '16px', marginBottom: 0, flexShrink: 0 }
  }, /*#__PURE__*/React.createElement("h3", {
    style: { fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }
  }, "채팅 수정"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => { if (!isSubmitting) requestClose(); },
    style: { background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.2rem', cursor: 'pointer', display: 'flex', alignItems: 'center' }
  }, /*#__PURE__*/React.createElement(SmallXIcon, { size: 20 }))),
  // .modal-body handles the actual grow-then-scroll behavior (flex:1 1 auto, min-height:0,
  // overflow-y:auto, capped by .modal-container's own visualViewport-aware max-height set in
  // ResizableModalContainer) -- so this modal naturally grows taller with the message's content,
  // up to the visible screen height, and only then scrolls internally. The header/footer stay
  // pinned outside this scrolling region so the 취소/수정 buttons are never clipped off-screen.
  /*#__PURE__*/React.createElement("div", {
    className: "modal-body",
    style: {
      padding: '16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      flex: '1 1 auto',
      minHeight: 0,
      overflowY: 'auto'
    }
  },
  images.length > 0 ? /*#__PURE__*/React.createElement("div", {
    style: { display: 'flex', flexWrap: 'wrap', gap: '8px', alignSelf: 'flex-start' }
  }, images.map((img, index) => /*#__PURE__*/React.createElement("div", {
    key: index,
    style: { position: 'relative', display: 'inline-block' }
  }, /*#__PURE__*/React.createElement("img", {
    src: img.thumbnail,
    alt: `수정 이미지 미리보기 ${index + 1}`,
    decoding: 'async',
    style: {
      width: '80px',
      height: '80px',
      objectFit: 'cover',
      borderRadius: 'var(--radius-md)',
      display: 'block',
      border: '1px solid var(--border-subtle)'
    }
  }), /*#__PURE__*/React.createElement(ImageThumbRemoveButton, {
    onClick: () => setImages(prev => prev.filter((_, idx) => idx !== index))
  })))) : null,
  /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      backgroundColor: 'var(--bg-primary)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-md)',
      padding: '8px'
    }
  }, /*#__PURE__*/React.createElement("textarea", {
    ref: editTextareaRef,
    placeholder: "수정할 채팅을 입력하세요...",
    value: text,
    onChange: e => {
      setText(e.target.value);
      // Grow with content; modal-body scrolls if the popup would exceed the viewport.
      autoGrowTextarea(e.target, 5000);
    },
    onPaste: handlePasteImagesEdit,
    style: {
      display: 'block',
      width: '100%',
      minHeight: '80px',
      resize: 'none',
      border: 'none',
      backgroundColor: 'transparent',
      fontSize: 'var(--font-size-base)',
      lineHeight: '1.45',
      fontFamily: 'inherit',
      outline: 'none',
      boxSizing: 'border-box',
      // Full width — emoji/image actions sit on their own row below (no paddingRight reserved).
      paddingRight: 0,
      paddingBottom: '4px',
      overflowY: 'hidden'
    }
  }), /*#__PURE__*/React.createElement("input", {
    ref: fileInputRefEdit,
    type: "file",
    accept: "image/jpeg, image/png, image/gif, image/webp, image/heic, image/heif, image/*",
    multiple: true,
    style: { position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0,0,0,0)', border: 0 },
    onChange: handleFileChangeEdit
  }), /*#__PURE__*/React.createElement("div", {
    style: { display: 'flex', justifyContent: 'flex-end', gap: '6px', marginTop: '6px' }
  },
    /*#__PURE__*/React.createElement("button", {
      type: "button",
      onClick: () => setIsEmojiPickerOpen(true),
      title: "이모티콘 추가",
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
    /*#__PURE__*/React.createElement("button", {
      type: "button",
      onClick: () => fileInputRefEdit.current && fileInputRefEdit.current.click(),
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
      width: "16",
      height: "16",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, /*#__PURE__*/React.createElement("path", { stroke: "none", d: "M0 0h24v24H0z", fill: "none" }), /*#__PURE__*/React.createElement("path", { d: "M15 8h.01" }), /*#__PURE__*/React.createElement("path", { d: "M12.5 21h-6.5a3 3 0 0 1 -3 -3v-12a3 3 0 0 1 3 -3h12a3 3 0 0 1 3 3v6.5" }), /*#__PURE__*/React.createElement("path", { d: "M3 16l5 -5c.928 -.893 2.072 -.893 3 0l4 4" }), /*#__PURE__*/React.createElement("path", { d: "M14 14l1 -1c.67 -.644 1.45 -.824 2.182 -.54" }), /*#__PURE__*/React.createElement("path", { d: "M16 19h6" }), /*#__PURE__*/React.createElement("path", { d: "M19 16v6" }))))
  )), /*#__PURE__*/React.createElement("div", {
    className: "modal-footer",
    style: { padding: '16px', justifyContent: 'space-between', alignItems: 'center' }
  },
    /* Participant reassignment -- fixes a message posted under the wrong participant */
    /*#__PURE__*/React.createElement(ParticipantPickerButton, {
      participant: part,
      onClick: () => setIsPartSheetOpen(true)
    }),
    /*#__PURE__*/React.createElement("div", { style: { display: 'flex', gap: '8px' } },
      /*#__PURE__*/React.createElement("button", {
        type: "button",
        className: "btn btn-secondary",
        disabled: isSubmitting,
        onClick: onClose,
        style: { height: '44px', minHeight: '44px', fontSize: 'var(--font-size-base)', padding: '0 16px' }
      }, "취소"),
      /*#__PURE__*/React.createElement("button", {
        type: "button",
        className: "btn btn-poll-create",
        disabled: isSubmitting || (!text.trim() && images.length === 0),
        onClick: handleSave,
        style: { height: '44px', minHeight: '44px', fontSize: 'var(--font-size-base)', padding: '0 16px', opacity: (text.trim() || images.length > 0) && !isSubmitting ? 1 : 0.6 }
      }, isSubmitting ? '...' : "수정")
    )
  ))), isPartSheetOpen && /*#__PURE__*/React.createElement(ChatParticipantSheet, {
    calendar: calendar,
    selectedId: participantId,
    onSelect: id => { setParticipantId(id); setIsPartSheetOpen(false); },
    onClose: () => setIsPartSheetOpen(false)
  }), isEmojiPickerOpen && /*#__PURE__*/React.createElement(EmojiPickerSheet, {
    onSelect: insertEmojiIntoEditInput,
    onClose: () => setIsEmojiPickerOpen(false)
  }), imageProcessingEdit && /*#__PURE__*/React.createElement(ImageProcessingOverlay, imageProcessingEdit));
}

  if (typeof window !== 'undefined') {
  window.GATHER_UI_COMPONENTS = Object.assign({}, window.GATHER_UI_COMPONENTS || {}, {
    CalendarGrid: CalendarGrid,
    CommentsSection: CommentsSection,
    MemoCard: MemoCard,
    PollList: PollList,
    GlobalSearchModal: GlobalSearchModal,
    EditMessageModal: EditMessageModal,
  });
}
