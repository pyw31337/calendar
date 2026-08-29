/**
 * Memo view page (P4-15)
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

function withMemoFirestoreTimeout(promise, timeoutMs = 12000) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('메모 저장 시간이 초과되었습니다.')), timeoutMs))
  ]);
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


export function MemoView({ calendar, memos, hasMoreMemos, totalMemoCount, onLoadMoreMemos, onBack, showToast, isDarkTheme, onRequestConfirm, sharedMemo, onDismissSharedMemo, chatMessages, setActiveLightbox, onOpenShare, onOpenAppSettings, onChangeView, chatCount = 0, settlementBadge = null, galleryCount = 0, placeCount = 0, memoCount = 0, chatLastAuthor = null, settlementLastDate = null, galleryLastDate = null, placeLastName = null, memoLastTitleWord = null }) {
  const React = window.React;
  const __deps = window.GATHER_UI_DEPS || {};
  const __comp = window.GATHER_UI_COMPONENTS || {};
  const BackArrowIcon = __comp.BackArrowIcon || __deps.BackArrowIcon;
  const SmallXIcon = __comp.SmallXIcon || __deps.SmallXIcon;
  const TrashIcon = __comp.TrashIcon || __deps.TrashIcon;
  const ResizableModalContainer = __comp.ResizableModalContainer || __deps.ResizableModalContainer || (function Shell(p) { return React.createElement('div', p, p.children); });
  const ChatGalleryModal = __comp.ChatGalleryModal || __deps.ChatGalleryModal;
  const ChatParticipantSheet = __comp.ChatParticipantSheet || __deps.ChatParticipantSheet;
  const EmojiPickerIcon = __comp.EmojiPickerIcon || __deps.EmojiPickerIcon;
  const EmojiPickerSheet = __comp.EmojiPickerSheet || __deps.EmojiPickerSheet;
  const ImageProcessingOverlay = __comp.ImageProcessingOverlay || __deps.ImageProcessingOverlay;
  const ImageThumbRemoveButton = __comp.ImageThumbRemoveButton || __deps.ImageThumbRemoveButton;
  const ImageUploadOverlay = __comp.ImageUploadOverlay || __deps.ImageUploadOverlay;
  const InlineSearchBar = __comp.InlineSearchBar || __deps.InlineSearchBar;
  const LinkPreviewCard = __deps.LinkPreviewCard || __comp.LinkPreviewCard;
  const LinkPreviewProgressOverlay = __deps.LinkPreviewProgressOverlay;
  const MemoCard = __deps.MemoCard;
  const MemoShareModal = __comp.MemoShareModal || __deps.MemoShareModal;
  const ParticipantPickerButton = __deps.ParticipantPickerButton;
  const extractFirstUrl = __deps.extractFirstUrl;
  const autoGrowTextarea = __deps.autoGrowTextarea;
  const getActiveParticipants = __deps.getActiveParticipants;
  const formatChatHeaderTitle = __deps.formatChatHeaderTitle;

  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedTag, setSelectedTag] = React.useState('');
  // Header hides on scroll-down / reappears on scroll-up, matching the chat room header exactly.
  const { isHeaderVisible, onScroll: handleMemoScroll } = useScrollHideHeader();
    const SharedSideMenuFooter = (__comp && __comp.SharedSideMenuFooter) || (window.GATHER_UI_DEPS || {}).SharedSideMenuFooter;
  const SharedAppNavBlock = (__comp && __comp.SharedAppNavBlock) || (window.GATHER_UI_DEPS || {}).SharedAppNavBlock;
  const ThreeLinesIcon = (__comp && __comp.ThreeLinesIcon) || (window.GATHER_UI_DEPS || {}).ThreeLinesIcon;
  const WeatherBadge = (__comp && __comp.WeatherBadge) || (window.GATHER_UI_DEPS || {}).WeatherBadge;
  const [isMemoMenuOpen, setIsMemoMenuOpen] = React.useState(false);
const [isSearchOpen, setIsSearchOpen] = React.useState(false);
  const memoSearchInputRef = React.useRef(null);
  React.useEffect(() => {
    if (isSearchOpen) memoSearchInputRef.current?.focus();
  }, [isSearchOpen]);
  const [isComposerExpanded, setIsComposerExpanded] = React.useState(false);
  const newTitleInputRef = React.useRef(null);
  React.useEffect(() => {
    if (isComposerExpanded) newTitleInputRef.current?.focus();
  }, [isComposerExpanded]);

  // New Memo Composer State
  const [newTitle, setNewTitle] = React.useState('');
  const [newText, setNewText] = React.useState('');
  const [newColor, setNewColor] = React.useState('var(--bg-card)');
  const [newIsPinned, setNewIsPinned] = React.useState(false);
  const [newTags, setNewTags] = React.useState([]); // array of strings (tag tokens)
  const [newTagInput, setNewTagInput] = React.useState('');
  const [newImages, setNewImages] = React.useState([]); // array of { original, thumbnail, originalBlob, thumbnailBlob } (same shape chat uses)
  const [imageProcessingNew, setImageProcessingNew] = React.useState(null); // compression phase, mirrors chat's imageProcessing
  const [newUploadProgress, setNewUploadProgress] = React.useState(null); // upload phase: { pct, remainingSec }

  // Editing Memo State
  const [editingMemo, setEditingMemo] = React.useState(null);
  const [editTitle, setEditTitle] = React.useState('');
  const [editText, setEditText] = React.useState('');
  const editMemoTextareaRef = React.useRef(null);
  // editText gets set from an existing memo's text when 수정 is clicked (not just from typing),
  // so sizing needs to run on every editText change, not just once on mount.
  React.useEffect(() => autoGrowTextarea(editMemoTextareaRef.current, 400), [editText]);
  const [editColor, setEditColor] = React.useState('');
  const [editIsPinned, setEditIsPinned] = React.useState(false);
  const [editTags, setEditTags] = React.useState([]); // array of strings (tag tokens)
  const [editTagInput, setEditTagInput] = React.useState('');
  const [editImages, setEditImages] = React.useState([]); // { original, thumbnail, isExisting } for kept photos, { original, thumbnail, originalBlob, thumbnailBlob } for new ones
  const [imageProcessingEdit, setImageProcessingEdit] = React.useState(null); // compression phase, mirrors chat's imageProcessingEdit
  const [editUploadProgress, setEditUploadProgress] = React.useState(null); // upload phase: { pct, remainingSec }

  // Participant Picker States
  const [composerParticipantId, setComposerParticipantId] = React.useState(() => {
    return getStoredChatParticipantId(calendar?.id, calendar);
  });
  const [isComposerPartOpen, setIsComposerPartOpen] = React.useState(false);
  const [editParticipantId, setEditParticipantId] = React.useState('');
  const [isEditPartOpen, setIsEditPartOpen] = React.useState(false);
  const memoEditorDirtySnapshot = () => JSON.stringify([
    editTitle,
    editText,
    editColor,
    editIsPinned,
    editTags,
    editTagInput,
    editParticipantId,
    editImages.map(img => [img.original, img.thumbnail, img.isExisting ? 1 : 0])
  ]);
  // MemoView stays mounted while the inline editor is open, so pass the active flag and the
  // current memo id as a baseline reset key to keep dirty tracking scoped to the memo being
  // edited rather than the page's surrounding composer/search state.
  const memoEditorDirtyGuard = useModalDirtyGuard(
    () => setEditingMemo(null),
    onRequestConfirm,
    undefined,
    !!editingMemo,
    memoEditorDirtySnapshot,
    editingMemo?.id || 'new'
  );

  // Emoji Picker States
  const [isComposerEmojiOpen, setIsComposerEmojiOpen] = React.useState(false);
  const [isEditEmojiOpen, setIsEditEmojiOpen] = React.useState(false);

  // Curated RGBA pastel background colors that work perfectly in both Light and Dark mode
  const MEMO_COLORS = [
    { name: '기본', value: 'var(--bg-card)', border: 'var(--border-subtle)' },
    { name: '빨강', value: 'rgba(239, 68, 68, 0.12)', border: 'rgba(239, 68, 68, 0.3)' },
    { name: '오렌지', value: 'rgba(245, 158, 11, 0.12)', border: 'rgba(245, 158, 11, 0.3)' },
    { name: '노랑', value: 'rgba(234, 179, 8, 0.12)', border: 'rgba(234, 179, 8, 0.3)' },
    { name: '초록', value: 'rgba(16, 185, 129, 0.12)', border: 'rgba(16, 185, 129, 0.3)' },
    { name: '하늘', value: 'rgba(6, 182, 212, 0.12)', border: 'rgba(6, 182, 212, 0.3)' },
    { name: '파랑', value: 'rgba(59, 130, 246, 0.12)', border: 'rgba(59, 130, 246, 0.3)' },
    { name: '보라', value: 'rgba(139, 92, 246, 0.12)', border: 'rgba(139, 92, 246, 0.3)' },
    { name: '핑크', value: 'rgba(236, 72, 153, 0.12)', border: 'rgba(236, 72, 153, 0.3)' }
  ];

  const getBorderColor = (colorVal) => {
    const matched = MEMO_COLORS.find(c => c.value === colorVal);
    return matched ? matched.border : 'var(--border-subtle)';
  };

  // Reuses the exact same compression/thumbnail pipeline chat attachments use
  // (processImageFilesSequentially -> compressImageToDataUrls), so memo photos get
  // identical quality handling, HEIC support, and a { original, thumbnail, originalBlob,
  // thumbnailBlob } shape that resolveMemoImageBatch and the thumbnail <img> below expect.
  const handleComposerFileSelect = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    try {
      const remainingSlots = 50 - newImages.length;
      if (remainingSlots <= 0) {
        if (showToast) showToast('사진 최대 50장', 'error');
        return;
      }
      const filesToProcess = Array.from(files).slice(0, remainingSlots);
      if (files.length > remainingSlots && showToast) {
        showToast(`${remainingSlots}장만 추가됨 (최대 50장)`, 'info');
      }

      setImageProcessingNew({ current: 0, total: filesToProcess.length });
      const { succeeded, failed } = await processImageFilesSequentially(
        filesToProcess,
        progress => setImageProcessingNew(progress)
      );

      if (succeeded.length > 0) setNewImages(prev => [...prev, ...succeeded]);
      if (failed.length > 0) {
        console.error('Image compression failed for:', failed.map(f => f.fileName));
        if (showToast) showToast(describeImageProcessingFailures(failed), 'error', 5000);
      } else if (succeeded.length > 0 && showToast) {
        showToast(`${succeeded.length}장 첨부완료`, 'success', 3000);
      }
    } catch (err) {
      console.error('handleComposerFileSelect unexpected error:', err);
      if (showToast) showToast('사진 첨부 중 오류', 'error', 5000);
    } finally {
      setImageProcessingNew(null);
      e.target.value = '';
    }
  };

  const handleEditFileSelect = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    try {
      const remainingSlots = 50 - editImages.length;
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

      if (succeeded.length > 0) setEditImages(prev => [...prev, ...succeeded]);
      if (failed.length > 0) {
        console.error('Image compression failed for:', failed.map(f => f.fileName));
        if (showToast) showToast(describeImageProcessingFailures(failed), 'error', 5000);
      } else if (succeeded.length > 0 && showToast) {
        showToast(`${succeeded.length}장 첨부완료`, 'success', 3000);
      }
    } catch (err) {
      console.error('handleEditFileSelect unexpected error:', err);
      if (showToast) showToast('사진 첨부 중 오류', 'error', 5000);
    } finally {
      setImageProcessingEdit(null);
      e.target.value = '';
    }
  };

  const handleSaveMemo = async () => {
    if (!newTitle.trim() && !newText.trim() && newImages.length === 0) {
      showToast('제목, 내용, 사진 중 하나 이상 입력해 주세요.', 'error');
      return;
    }

    try {
      const calendarId = calendar.id;
      const stamp = Date.now();
      const memoId = 'memo_' + stamp + '_' + Math.random().toString(36).slice(2, 8);

      // 1. Upload attachments (Storage upload with inline-base64 fallback + progress,
      // exactly the same module chat uses -- see resolveMemoImageBatch/resolveImageBatch)
      let uploadedUrls = [];
      let uploadedThumbs = [];
      if (newImages.length > 0) {
        setNewUploadProgress({ pct: 0, remainingSec: null });
        const resolved = await resolveMemoImageBatch(calendarId, newImages, setNewUploadProgress);
        uploadedUrls = resolved.map(r => r.imageUrl);
        uploadedThumbs = resolved.map(r => r.thumbUrl);
      }

      // Save tags formatted back to database (prepend '#' prefix if needed)
      const tagsArray = newTags.map(t => t.startsWith('#') ? t : '#' + t);

      const participantId = composerParticipantId || 'anonymous';

      // Link previews are hydrated by the rendered card; a third-party scraper must not delay
      // the user's memo save.
      const linkPreview = null;

      // 2. Write to Firestore
      const memoData = {
        id: memoId,
        participantId,
        title: newTitle.trim(),
        text: newText.trim(),
        imageUrls: uploadedUrls,
        thumbUrls: uploadedThumbs,
        color: newColor,
        isPinned: newIsPinned,
        tags: tagsArray,
        createdAt: stamp,
        updatedAt: stamp
      };
      if (linkPreview) memoData.linkPreview = linkPreview;

      await withMemoFirestoreTimeout(__fb().collection('calendars').doc('cal_' + calendarId).collection('memos').doc(memoId).set(sanitizeMemoForFirestore(memoData)));

      // 3. Write Activity Log
      const logNote = newTitle.trim() ? `제목: ${newTitle.trim()}` : (newText.trim() ? newText.trim().slice(0, 30) + '...' : '사진 첨부');
      const activityLog = createMemoActivityLog(calendarId, 'memo_create', participantId, stamp, logNote);
      if (activityLog) {
        const nextCal = {
          ...calendar,
          updatedAt: stamp,
          revision: (calendar.revision || 0) + 1
        };
        await pushSingleCloudCalendar(nextCal, stamp, 4, null, 'settings', [activityLog]);
      }

      showToast('메모가 저장되었습니다.', 'success');
      
      // Reset composer
      setNewTitle('');
      setNewText('');
      setNewColor('var(--bg-card)');
      setNewIsPinned(false);
      setNewTags([]);
      setNewTagInput('');
      setNewImages([]);
      setIsComposerExpanded(false);
    } catch (err) {
      console.error('Failed to save memo:', err);
      showToast('메모 저장 실패', 'error');
    } finally {
      setNewUploadProgress(null);
    }
  };

  const handleUpdateMemo = async () => {
    if (!editTitle.trim() && !editText.trim() && editImages.length === 0) {
      showToast('제목, 내용, 사진 중 하나 이상 입력해 주세요.', 'error');
      return;
    }

    try {
      const calendarId = calendar.id;
      const stamp = Date.now();

      // Kept photos carry isExisting (pass through as-is) and new ones get uploaded, same
      // module chat's edit flow uses (see resolveMemoImageBatch/resolveImageBatch).
      let uploadedUrls = [];
      let uploadedThumbs = [];
      if (editImages.length > 0) {
        setEditUploadProgress({ pct: 0, remainingSec: null });
        const resolved = await resolveMemoImageBatch(calendarId, editImages, setEditUploadProgress);
        uploadedUrls = resolved.map(r => r.imageUrl);
        uploadedThumbs = resolved.map(r => r.thumbUrl);
      }

      // Save tags formatted back to database (prepend '#' prefix if needed)
      const tagsArray = editTags.map(t => t.startsWith('#') ? t : '#' + t);

      const participantId = editParticipantId || 'anonymous';

      let linkPreview = null;
      const url = extractFirstUrl(editText);
      const oldUrl = extractFirstUrl(editingMemo.text);
      if (url && oldUrl === url && editingMemo.linkPreview) linkPreview = editingMemo.linkPreview;

      const memoData = {
        ...editingMemo,
        participantId,
        title: editTitle.trim(),
        text: editText.trim(),
        imageUrls: uploadedUrls,
        thumbUrls: uploadedThumbs,
        color: editColor,
        isPinned: editIsPinned,
        tags: tagsArray,
        updatedAt: stamp,
        linkPreview: linkPreview || null
      };

      await withMemoFirestoreTimeout(__fb().collection('calendars').doc('cal_' + calendarId).collection('memos').doc(editingMemo.id).set(sanitizeMemoForFirestore(memoData)));

      // Log Memo Update — before→after detail
      const logNote = buildFieldChangeNote(editTitle.trim() || '메모', [
        { key: '제목', before: editingMemo.title || '', after: editTitle.trim() },
        { key: '내용', before: editingMemo.text || '', after: editText.trim() },
        { key: '색상', before: editingMemo.color || '', after: editColor || '' },
        { key: '고정', before: editingMemo.isPinned ? 'Y' : 'N', after: editIsPinned ? 'Y' : 'N' }
      ]) || (editTitle.trim() || (editText.trim().slice(0, 40) + '...'));
      const activityLog = createMemoActivityLog(calendarId, 'memo_update', participantId, stamp, logNote);
      if (activityLog) {
        const nextCal = {
          ...calendar,
          updatedAt: stamp,
          revision: (calendar.revision || 0) + 1
        };
        await pushSingleCloudCalendar(nextCal, stamp, 4, null, 'settings', [activityLog]);
      }

      showToast('메모가 수정되었습니다.', 'success');
      setEditingMemo(null);
    } catch (err) {
      console.error('Failed to update memo:', err);
      showToast('메모 수정 실패', 'error');
    } finally {
      setEditUploadProgress(null);
    }
  };

  const handleDeleteMemo = async (memo) => {
    const action = async () => {
      try {
        const calendarId = calendar.id;
        const stamp = Date.now();
        const participantId = getStoredChatParticipantId(calendarId, calendar) || 'anonymous';
        const memoSnapshot = JSON.parse(JSON.stringify(memo));

        await withMemoFirestoreTimeout(__fb().collection('calendars').doc('cal_' + calendarId).collection('memos').doc(memo.id).delete());

        // Log Memo Delete
        const logNote = memo.title ? `제목: ${memo.title}` : (memo.text.slice(0, 30) + '...');
        const activityLog = createMemoActivityLog(calendarId, 'memo_delete', participantId, stamp, logNote);
        if (activityLog) {
          const nextCal = {
            ...calendar,
            updatedAt: stamp,
            revision: (calendar.revision || 0) + 1
          };
          await pushSingleCloudCalendar(nextCal, stamp, 4, null, 'settings', [activityLog]);
        }

        showToast('메모가 삭제되었습니다.', 'delete', 5000, async () => {
          try {
            const restoreStamp = Date.now();
            await withMemoFirestoreTimeout(__fb().collection('calendars').doc('cal_' + calendarId).collection('memos').doc(memo.id).set(sanitizeMemoForFirestore(memoSnapshot)));
            const restoreNote = memoSnapshot.title
              ? `복원: 제목: ${memoSnapshot.title}`
              : `복원: ${String(memoSnapshot.text || '').slice(0, 30)}...`;
            const restoreActivityLog = createMemoActivityLog(calendarId, 'memo_update', participantId, restoreStamp, restoreNote);
            if (restoreActivityLog) {
              const nextCal = {
                ...calendar,
                updatedAt: restoreStamp,
                revision: (calendar.revision || 0) + 1
              };
              await pushSingleCloudCalendar(nextCal, restoreStamp, 4, null, 'settings', [restoreActivityLog]);
            }
            setEditingMemo(null);
            showToast('메모 삭제를 되돌렸습니다.', 'success', 3000);
          } catch (err) {
            console.error('Failed to restore deleted memo:', err);
            showToast('메모 복원 실패', 'error', 4000);
          }
        });
        setEditingMemo(null);
      } catch (err) {
        console.error('Failed to delete memo:', err);
        showToast('메모 삭제 실패', 'error');
      }
    };

    if (onRequestConfirm) {
      onRequestConfirm('메모 삭제', '이 메모를 삭제하시겠습니까?', action);
    }
  };

  const handleOpenEdit = (memo) => {
    setEditingMemo(memo);
    setEditTitle(memo.title || '');
    setEditText(memo.text || '');
    setEditColor(memo.color || 'var(--bg-card)');
    setEditIsPinned(!!memo.isPinned);
    
    // Parse tag tokens (strip '#' prefix for local state management)
    const rawTags = memo.tags || [];
    const cleanTags = rawTags.map(t => t.startsWith('#') ? t.slice(1).trim() : t).filter(Boolean);
    setEditTags(cleanTags);
    setEditTagInput('');

    // Reconstruct list of images for editing (same { original, thumbnail, isExisting }
    // shape chat's edit flow uses, so resolveMemoImageBatch passes these through untouched)
    const currentImgs = (memo.imageUrls || []).map((url, idx) => ({
      original: url,
      thumbnail: memo.thumbUrls?.[idx] || url,
      isExisting: true
    }));
    setEditImages(currentImgs);
    setEditParticipantId(memo.participantId || '');
  };

  const handleTogglePin = async (memo) => {
    try {
      await __fb().collection('calendars').doc('cal_' + calendar.id).collection('memos').doc(memo.id).update({ isPinned: !memo.isPinned });
    } catch (err) {
      console.error('Failed to toggle memo pin:', err);
      showToast('고정 상태 변경 실패', 'error');
    }
  };

  const handleMemoCommentsChange = async (memo, nextComments) => {
    try {
      await __fb().collection('calendars').doc('cal_' + calendar.id).collection('memos').doc(memo.id).update({ comments: nextComments });
    } catch (err) {
      console.error('Failed to update memo comments:', err);
      showToast('댓글 저장 실패', 'error');
    }
  };

  // Layer-popup share link for a single memo -- opens MemoShareModal, which builds the
  // ?id=<calendar>&view=memo&memo=<id> URL (same deep-link convention chat/tag search results
  // already use) and offers a one-tap copy.
  const [sharingMemo, setSharingMemo] = React.useState(null);

  // Gallery modal state -- opens the ChatGalleryModal (photo grid) from this view's own
  // header gallery icon or side-menu entry. Previously these variables were only declared
  // in App scope and were never in scope inside MemoView, causing a ReferenceError crash.
  const [isGalleryOpen, setIsGalleryOpen] = React.useState(false);

  // Link-preview progress overlay state -- shown while a memo link-preview is being fetched.
  // Same crash root cause as isGalleryOpen above (declared only in App, used here).
  const [linkPreviewProgressState, setLinkPreviewProgressState] = React.useState(null);

  const removeComposerImage = (idx) => {
    setNewImages(prev => prev.filter((_, i) => i !== idx));
  };

  const removeEditImage = (idx) => {
    setEditImages(prev => prev.filter((_, i) => i !== idx));
  };

  const handleAddNewTag = () => {
    const val = newTagInput.trim();
    if (!val) return;

    const cleanTag = val.startsWith('#') ? val.slice(1).trim() : val;
    if (!cleanTag) return;

    if (newTags.includes(cleanTag)) {
      showToast('이미 등록된 태그입니다.', 'error');
      return;
    }
    if (newTags.length >= 10) {
      showToast('태그는 최대 10개까지 등록 가능합니다.', 'error');
      return;
    }
    setNewTags(prev => [...prev, cleanTag]);
    setNewTagInput('');
  };

  const handleAddEditTag = async () => {
    const val = editTagInput.trim();
    if (!val) return;

    const cleanTag = val.startsWith('#') ? val.slice(1).trim() : val;
    if (!cleanTag) return;

    if (editTags.includes(cleanTag)) {
      showToast('이미 등록된 태그입니다.', 'error');
      return;
    }
    if (editTags.length >= 10) {
      showToast('태그는 최대 10개까지 등록 가능합니다.', 'error');
      return;
    }
    
    const nextTags = [...editTags, cleanTag];

    // Real-time Save to Firestore immediately for edit modal
    if (editingMemo) {
      try {
        const calendarId = calendar.id;
        const tagsArray = nextTags.map(t => t.startsWith('#') ? t : '#' + t);
        await __fb().collection('calendars').doc('cal_' + calendarId).collection('memos').doc(editingMemo.id).update({
          tags: tagsArray
        });
      } catch (err) {
        console.error('Failed to update tags in Firestore:', err);
        showToast('태그 저장 실패', 'error');
      }
    }

    setEditTags(nextTags);
    setEditTagInput('');
  };

  const filteredMemos = (memos || []).filter(memo => {
    const query = searchQuery.trim().toLowerCase();
    
    // Live Search Matcher
    let searchMatch = true;
    if (query) {
      const titleMatch = memo.title ? memo.title.toLowerCase().includes(query) : false;
      const textMatch = memo.text ? memo.text.toLowerCase().includes(query) : false;
      const tagsMatch = memo.tags ? memo.tags.some(tag => tag.toLowerCase().includes(query)) : false;
      searchMatch = titleMatch || textMatch || tagsMatch;
    }

    // Filter by Tag Clicked Matcher
    const filterTagMatch = selectedTag ? (memo.tags || []).includes(selectedTag) : true;

    return searchMatch && filterTagMatch;
  });

  const pinnedMemos = filteredMemos.filter(m => m.isPinned);
  const otherMemos = filteredMemos.filter(m => !m.isPinned);

  const composerPart = (calendar.participants || []).find(p => p.id === composerParticipantId);
  const editPart = (calendar.participants || []).find(p => p.id === editParticipantId);

  return /*#__PURE__*/React.createElement("div", {
    className: "memo-view-container",
    style: {
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'var(--bg-primary)',
      display: 'flex', flexDirection: 'column',
      width: '100%', maxWidth: '100%', overflowX: 'hidden'
    }
  },
    /* Floating back button -- always fixed in place; gains a shadow once the header itself
       has scrolled out of view, exactly like the chat room's back button. */
    /*#__PURE__*/React.createElement("button", {
      type: "button",
      onClick: onBack,
      "aria-label": "뒤로가기",
      style: {
        position: 'fixed', top: '10px', left: '10px', width: '36px', height: '36px',
        borderRadius: '50%', backgroundColor: 'var(--bg-card)', border: 'none',
        boxShadow: isHeaderVisible ? 'none' : '0 2px 8px rgba(0,0,0,0.12)',
        transition: 'box-shadow 0.2s ease',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', color: '#64748B', zIndex: 1020
      }
    }, /*#__PURE__*/React.createElement(BackArrowIcon, { size: 22 })),

    /* Chat-room-header-style header: left spacer (back button floats over it), centered
       title, right search-toggle button. */
    /*#__PURE__*/React.createElement("div", {
      className: "memo-view-header",
      style: {
        position: 'fixed', top: 0, left: 0, right: 0, height: '56px',
        backgroundColor: 'var(--bg-card)', borderBottom: '1px solid var(--border-subtle)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 16px', zIndex: 1010,
        transition: 'transform 0.3s ease',
        transform: isHeaderVisible ? 'translateY(0)' : 'translateY(-100%)'
      }
    },
      /*#__PURE__*/React.createElement("div", { style: { width: '32px', flexShrink: 0 } }),
      /*#__PURE__*/React.createElement("div", {
        style: {
          position: 'absolute', left: '50%', transform: 'translateX(-50%)',
          display: 'flex', alignItems: 'center', fontWeight: 800, fontSize: '0.95rem',
          color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden',
          textOverflow: 'ellipsis', maxWidth: 'calc(100vw - 160px)', pointerEvents: 'none'
        }
      }, calendar.title, " 메모"),
      /*#__PURE__*/React.createElement("div", {
        style: { display: 'flex', alignItems: 'center', gap: '2px', flexShrink: 0 }
      },
        /*#__PURE__*/React.createElement("button", {
          type: "button",
          onClick: () => setIsMemoMenuOpen(true),
          title: "메모 메뉴",
          "aria-label": "메모 메뉴 열기",
          style: {
            background: 'none', border: 'none', cursor: 'pointer', padding: '6px',
            color: 'var(--text-muted)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 'var(--radius-md)'
          }
        }, ThreeLinesIcon ? /*#__PURE__*/React.createElement(ThreeLinesIcon, { size: 20 }) : /*#__PURE__*/React.createElement("svg", {
          xmlns: "http://www.w3.org/2000/svg", width: "22", height: "22", viewBox: "0 0 24 24",
          fill: "none", stroke: "currentColor", strokeWidth: "2"
        }, /*#__PURE__*/React.createElement("path", { d: "M4 6h16" }), /*#__PURE__*/React.createElement("path", { d: "M4 12h16" }), /*#__PURE__*/React.createElement("path", { d: "M4 18h16" })))
      )
    ),

    /* Search bar -- hidden by default, slides in below the header when the search button is
       tapped (same slot/z-index the chat room's own search bar uses). */
    isSearchOpen && /*#__PURE__*/React.createElement(InlineSearchBar, {
      fixed: true,
      inputRef: memoSearchInputRef,
      value: searchQuery,
      placeholder: "메모 제목, 내용, 해시태그 검색...",
      onChange: e => setSearchQuery(e.target.value),
      trailing: /*#__PURE__*/React.createElement(React.Fragment, null,
        selectedTag && /*#__PURE__*/React.createElement("button", {
          type: "button",
          onClick: () => setSelectedTag(''),
          title: selectedTag,
          style: {
            padding: '6px 12px', borderRadius: '16px', backgroundColor: 'var(--bg-primary)',
            border: '1px solid var(--border-subtle)', color: '#3B82F6', fontSize: '0.75rem',
            fontWeight: 'bold', cursor: 'pointer', flexShrink: 0,
            maxWidth: '35vw', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
          }
        }, selectedTag, " ✕"),
        /*#__PURE__*/React.createElement("button", {
          type: "button",
          onClick: () => { setIsSearchOpen(false); setSearchQuery(''); setSelectedTag(''); },
          style: { border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px 6px', fontSize: '0.8rem', fontWeight: 700, flexShrink: 0 }
        }, "닫기")
      )
    }),

    isMemoMenuOpen && /*#__PURE__*/React.createElement("div", {
      className: "admin-side-menu-overlay",
      style: { zIndex: 12000 },
      onClick: () => setIsMemoMenuOpen(false)
    }, /*#__PURE__*/React.createElement("nav", {
      className: "admin-side-menu",
      "aria-label": "메모",
      onClick: e => e.stopPropagation()
    },
      /*#__PURE__*/React.createElement("div", { className: "admin-side-menu-header" },
        /*#__PURE__*/React.createElement("div", { className: "admin-side-menu-brand" },
          /*#__PURE__*/React.createElement("div", { className: "admin-side-menu-copy" },
            /*#__PURE__*/React.createElement("button", {
              type: "button",
              className: "admin-side-menu-title",
              title: "메인 화면으로 이동",
              "aria-label": "메인 화면으로 이동",
              onClick: () => { setIsMemoMenuOpen(false); if (typeof onChangeView === 'function') onChangeView('calendar'); else if (typeof onBack === 'function') onBack(); },
              style: {
                background: 'none', border: 'none', padding: 0, margin: 0,
                color: 'inherit',
                cursor: 'pointer', textAlign: 'left'
              }
            }, "메모")
          )
        ),
        /*#__PURE__*/React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 } },
          WeatherBadge ? /*#__PURE__*/React.createElement(WeatherBadge, { weatherLocation: calendar && calendar.weatherLocation }) : null,
          /*#__PURE__*/React.createElement("button", {
            type: "button", className: "admin-side-menu-close-btn", onClick: () => setIsMemoMenuOpen(false), "aria-label": "닫기"
          }, "✕")
        )
      ),
      /*#__PURE__*/React.createElement("div", { className: "admin-side-menu-list", style: { borderBottom: 'none', paddingTop: '6px' } },
        /*#__PURE__*/React.createElement("button", {
          type: "button",
          className: "admin-side-menu-item",
          onClick: () => { setIsMemoMenuOpen(false); setIsSearchOpen(true); }
        },
          /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-icon" }, /*#__PURE__*/React.createElement("svg", {
            xmlns: "http://www.w3.org/2000/svg", width: "20", height: "20", viewBox: "0 0 24 24",
            fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round"
          }, /*#__PURE__*/React.createElement("path", { d: "M10.7 20H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H20a2 2 0 0 1 2 2v4.1" }), /*#__PURE__*/React.createElement("path", { d: "m21 21-1.9-1.9" }), /*#__PURE__*/React.createElement("circle", { cx: "17", cy: "17", r: "3" }))),
          /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-copy" },
            /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-title" }, "메모 검색")
          )
        )
      ),
      typeof SharedAppNavBlock === 'function' && /*#__PURE__*/React.createElement(SharedAppNavBlock, {
        onClose: () => setIsMemoMenuOpen(false),
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
        onClose: () => setIsMemoMenuOpen(false),
        onOpenShare: onOpenShare,
        onOpenSettings: onOpenAppSettings,
        shareLabel: '공유'
      })
    )),

    /* Main Scrollable Body */
    /*#__PURE__*/React.createElement("div", {
      style: { flex: 1, position: 'relative', minHeight: 0 }
    }, /*#__PURE__*/React.createElement("div", {
      onScroll: handleMemoScroll,
      style: { position: 'absolute', inset: 0, overflowY: 'auto', padding: '16px', paddingTop: isSearchOpen ? '116px' : '72px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: '20px' }
    },
      /* Shared-memo banner -- when this page was opened via a memo's own share link
         (?view=memo&memo=<id>), show that memo prominently as a single full-width row above
         everything else (composer included), then the normal composer/list continue exactly
         as before below it. The memo may be older than the paginated `memos` window, hence the
         separate direct-by-id fetch (see sharedMemo in App()) rather than searching the list. */
      sharedMemo && /*#__PURE__*/React.createElement("div", {
        // Same purple-border + up/down-shake "you were just brought here" treatment used
        // everywhere else in the app (see chat-search-focused-bubble/chat-search-shake) --
        // keyed by memo id so navigating between two different shared-memo links replays it.
        key: sharedMemo.id,
        className: "chat-search-focused-bubble",
        style: {
          width: '100%', maxWidth: '520px', margin: '0 auto', boxSizing: 'border-box',
          borderRadius: 'var(--radius-md)', padding: '10px',
          boxShadow: '0 6px 18px rgba(79, 70, 229, 0.14)',
          display: 'flex', flexDirection: 'column', gap: '8px'
        }
      },
        /*#__PURE__*/React.createElement("div", {
          style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', padding: '0 4px' }
        },
          /*#__PURE__*/React.createElement("span", {
            style: { fontSize: '0.72rem', fontWeight: 800, color: '#4F46E5', letterSpacing: '0.05em', textTransform: 'uppercase' }
          }, "공유된 메모"),
          /*#__PURE__*/React.createElement("button", {
            type: "button",
            onClick: () => { if (onDismissSharedMemo) onDismissSharedMemo(); },
            title: "닫기",
            style: { background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', display: 'flex', alignItems: 'center', flexShrink: 0 }
          }, /*#__PURE__*/React.createElement(SmallXIcon, { size: 18 }))
        ),
        /* Reuses MemoCard itself (same images/link-preview/text/pin/comments rendering as the
           normal grid below) instead of a bespoke one-line teaser -- "크게" (prominently) here
           means full-width and its own row, not a stripped-down summary. */
        /*#__PURE__*/React.createElement(MemoCard, {
          memo: sharedMemo,
          calendar: calendar,
          onOpenEdit: handleOpenEdit,
          onTogglePin: () => handleTogglePin(sharedMemo),
          onShare: () => setSharingMemo(sharedMemo),
          onSelectTag: (tag) => { setSelectedTag(tag); setIsSearchOpen(true); },
          onCommentsChange: (nextComments) => handleMemoCommentsChange(sharedMemo, nextComments),
          getBorderColor: getBorderColor,
          onRequestConfirm: onRequestConfirm,
          showToast: showToast
        })
      ),

      /* Rich Memo Input Composer (Google Keep style) */
      /*#__PURE__*/React.createElement("div", {
        style: {
          width: '100%',
          maxWidth: '520px',
          margin: '0 auto',
          backgroundColor: newColor,
          border: '1px solid ' + getBorderColor(newColor),
          borderRadius: 'var(--radius-md)',
          padding: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          transition: 'all 0.2s ease',
          boxSizing: 'border-box'
        }
      },
        !isComposerExpanded ? 
          /* Collapsed state */
          /*#__PURE__*/React.createElement("div", {
            onClick: () => setIsComposerExpanded(true),
            style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', color: 'var(--text-muted)' }
          },
            /*#__PURE__*/React.createElement("span", { style: { fontSize: '0.88rem' } }, "새로운 메모를 남겨보세요..."),
            /*#__PURE__*/React.createElement("span", { style: { display: 'flex', gap: '8px', color: '#64748B', marginLeft: 'auto' } }, 
              /* Photo icon shortcut */
              /*#__PURE__*/React.createElement("svg", {
                xmlns: "http://www.w3.org/2000/svg", width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2"
              }, /*#__PURE__*/React.createElement("rect", { width: "18", height: "18", x: "3", y: "3", rx: "2", ry: "2" }), /*#__PURE__*/React.createElement("circle", { cx: "9", cy: "9", r: "2" }), /*#__PURE__*/React.createElement("path", { d: "m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" }))
            )
          )
        :
          /* Expanded state */
          /*#__PURE__*/React.createElement("div", {
            style: { display: 'flex', flexDirection: 'column', gap: '8px' }
          },
            /* Title & Pin row */
            /*#__PURE__*/React.createElement("div", {
              style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }
            },
              /* Title input - Styled precisely as user requested */
              /*#__PURE__*/React.createElement("input", {
                type: "text",
                ref: newTitleInputRef,
                placeholder: "제목",
                value: newTitle,
                onChange: e => setNewTitle(e.target.value),
                style: {
                  padding: '8px 8px',
                  background: 'transparent',
                  borderWidth: 'medium',
                  borderStyle: 'none',
                  borderColor: 'currentcolor',
                  borderImage: 'none',
                  outline: 'none',
                  fontSize: '0.95rem',
                  fontWeight: 'bold',
                  color: 'var(--text-main)',
                  width: '100%',
                  borderBottom: '1px solid var(--border-subtle)',
                  boxSizing: 'border-box'
                }
              }),
              /* Pin Toggle button (Custom pin SVGs for ON/OFF) */
              /*#__PURE__*/React.createElement("button", {
                type: "button",
                onClick: () => setNewIsPinned(!newIsPinned),
                style: { background: 'none', border: 'none', cursor: 'pointer', color: newIsPinned ? '#F59E0B' : '#94A3B8', padding: '4px' }
              }, newIsPinned ? 
                /*#__PURE__*/React.createElement("svg", {
                  xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "currentColor", className: "icon icon-tabler icon-tabler-filled icon-tabler-pin"
                }, /*#__PURE__*/React.createElement("path", { stroke: "none", d: "M0 0h24v24H0z", fill: "none" }), /*#__PURE__*/React.createElement("path", { d: "M15.113 3.21l.094 .083l5.5 5.5a1 1 0 0 1 -1.175 1.59l-3.172 3.171l-1.424 3.797a1 1 0 0 1 -.158 .277l-.07 .08l-1.5 1.5a1 1 0 0 1 -1.32 .082l-.095 -.083l-2.793 -2.792l-3.793 3.792a1 1 0 0 1 -1.497 -1.32l.083 -.094l3.792 -3.793l-2.792 -2.793a1 1 0 0 1 -.083 -1.32l.083 -.094l1.5 -1.5a1 1 0 0 1 .258 -.187l.098 -.042l3.796 -1.425l3.171 -3.17a1 1 0 0 1 1.497 -1.26z" }))
              :
                /*#__PURE__*/React.createElement("svg", {
                  xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: "icon icon-tabler icons-tabler-outline icon-tabler-pin"
                }, /*#__PURE__*/React.createElement("path", { stroke: "none", d: "M0 0h24v24H0z", fill: "none" }), /*#__PURE__*/React.createElement("path", { d: "M15 4.5l-4 4l-4 1.5l-1.5 1.5l7 7l1.5 -1.5l1.5 -4l4 -4" }), /*#__PURE__*/React.createElement("path", { d: "M9 15l-4.5 4.5" }), /*#__PURE__*/React.createElement("path", { d: "M14.5 4l5.5 5.5" }))
              )
            ),

            /* Body Textarea wrapped relatively with bottom-right emoji & file picker icons - Styled precisely as user requested */
            /*#__PURE__*/React.createElement("div", {
              style: { position: 'relative', width: '100%' }
            },
              /* Textarea */
              /*#__PURE__*/React.createElement("textarea", {
                placeholder: "메모 입력...",
                value: newText,
                onChange: e => { setNewText(e.target.value); autoGrowTextarea(e.target, 400); },
                rows: "4",
                style: {
                  padding: '8px 4px',
                  background: 'transparent',
                  borderWidth: 'medium',
                  borderStyle: 'none',
                  borderColor: 'currentcolor',
                  borderImage: 'none',
                  outline: 'none',
                  resize: 'none',
                  fontSize: '0.88rem',
                  color: 'var(--text-main)',
                  width: '100%',
                  paddingBottom: '28px',
                  fontFamily: 'inherit',
                  boxSizing: 'border-box'
                }
              }),
              /* Bottom-right emoji/photo buttons wrapper */
              /*#__PURE__*/React.createElement("div", {
                style: {
                  position: 'absolute',
                  right: '4px',
                  bottom: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  zIndex: 2
                }
              },
                /* Emoji picker trigger */
                /*#__PURE__*/React.createElement("button", {
                  type: "button",
                  onClick: () => setIsComposerEmojiOpen(true),
                  style: { background: 'none', border: 'none', padding: '4px', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' },
                  title: "이모티콘 추가"
                }, /*#__PURE__*/React.createElement(EmojiPickerIcon, null)),
                
                /* File Upload label icon */
                /*#__PURE__*/React.createElement("label", {
                  style: { display: 'flex', alignItems: 'center', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px' },
                  title: "사진 첨부"
                }, 
                  /*#__PURE__*/React.createElement("input", {
                    type: "file",
                    multiple: true,
                    accept: "image/jpeg, image/png, image/gif, image/webp, image/heic, image/heif, image/*",
                    onChange: handleComposerFileSelect,
                    style: { display: 'none' }
                  }),
                  /*#__PURE__*/React.createElement("svg", {
                    xmlns: "http://www.w3.org/2000/svg", width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2"
                  }, /*#__PURE__*/React.createElement("rect", { width: "18", height: "18", x: "3", y: "3", rx: "2", ry: "2" }), /*#__PURE__*/React.createElement("circle", { cx: "9", cy: "9", r: "2" }), /*#__PURE__*/React.createElement("path", { d: "m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" }))
                )
              )
            ),

            /* Live Link Preview Area inside input */
            extractFirstUrl(newText) && /*#__PURE__*/React.createElement("div", {
              style: { marginTop: '4px', marginBottom: '4px' }
            }, /*#__PURE__*/React.createElement(LinkPreviewCard, { url: extractFirstUrl(newText), stretch: true })),

            /* Images previews list */
            newImages.length > 0 && /*#__PURE__*/React.createElement("div", {
              style: { display: 'flex', flexWrap: 'wrap', gap: '6px', margin: '4px 0' }
            }, newImages.map((img, idx) => /*#__PURE__*/React.createElement("div", {
              key: idx,
              style: { position: 'relative', width: '60px', height: '60px' }
            }, 
              /* Image element */
              /*#__PURE__*/React.createElement("img", {
                src: img.thumbnail,
                decoding: 'async',
                style: { width: '100%', height: '100%', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--border-subtle)' }
              }),
              /* Remove button (shared with chat's attachment thumbnail) */
              /*#__PURE__*/React.createElement(ImageThumbRemoveButton, {
                onClick: () => removeComposerImage(idx)
              })
            ))),

            /* Tag Input Module (from Lightbox, with IME composition prevention) */
            /*#__PURE__*/React.createElement("div", {
              style: { display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }
            },
              /*#__PURE__*/React.createElement("span", {
                style: { fontSize: '0.74rem', fontWeight: 800, color: 'var(--text-muted)', flexShrink: 0 }
              }, "태그입력"),
              /*#__PURE__*/React.createElement("input", {
                type: "text",
                placeholder: newTags.length >= 10 ? "태그 최대 10개 도달" : `태그 입력 (${newTags.length}/10)`,
                value: newTagInput,
                onChange: e => setNewTagInput(e.target.value),
                onKeyDown: e => {
                  if (e.nativeEvent.isComposing) return;
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddNewTag();
                  }
                },
                maxLength: 100,
                style: {
                  flex: 1, minWidth: 0, height: '28px', padding: '0 8px', borderRadius: '6px',
                  border: '1px solid var(--border-subtle)', background: 'var(--bg-primary)',
                  color: 'var(--text-main)', fontSize: '0.74rem'
                }
              }),
              /*#__PURE__*/React.createElement("button", {
                type: "button",
                onClick: handleAddNewTag,
                disabled: newTags.length >= 10,
                style: {
                  flexShrink: 0, height: '28px', padding: '0 10px', borderRadius: '6px',
                  border: '1px solid var(--border-subtle)', background: 'var(--border-subtle)',
                  color: 'var(--text-main)', fontSize: '0.72rem', fontWeight: 800, cursor: 'pointer',
                  opacity: newTags.length >= 10 ? 0.45 : 1
                }
              }, "저장")
            ),

            /* Actions Row: swatches completely removed, shows writer and tags side-by-side */
            /*#__PURE__*/React.createElement("div", {
              style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px', gap: '8px', flexWrap: 'wrap' }
            },
              /* Participant select box & tag badges list to its right */
              /*#__PURE__*/React.createElement("div", {
                style: { display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }
              },
                /* Participant selection capsule button (shared with memo edit + chat edit modal) */
                /*#__PURE__*/React.createElement(ParticipantPickerButton, {
                  participant: composerPart,
                  onClick: () => setIsComposerPartOpen(true)
                }),

                /* Active tag capsule badges (Responsive white background style: (#레시피 (✕))) */
                newTags.map(tag => /*#__PURE__*/React.createElement("span", {
                  key: tag,
                  style: {
                    display: 'inline-flex', alignItems: 'center', gap: '6px', borderRadius: 'var(--radius-full)',
                    padding: '3px 4px 3px 10px', fontSize: '0.72rem', fontWeight: 900, lineHeight: 1,
                    border: '1px solid var(--border-subtle)', color: 'var(--text-main)', background: 'var(--bg-primary)'
                  }
                }, `#${tag}`, /*#__PURE__*/React.createElement("button", {
                  type: "button",
                  title: `#${tag} 태그 삭제`,
                  onClick: e => {
                    e.stopPropagation();
                    setNewTags(prev => prev.filter(t => t !== tag));
                  },
                  style: {
                    width: '17px', height: '17px', border: 0, borderRadius: '50%',
                    background: 'var(--border-subtle)', color: 'var(--text-main)', display: 'inline-flex',
                    alignItems: 'center', justifyContent: 'center', padding: 0, cursor: 'pointer',
                    flexShrink: 0
                  }
                }, /*#__PURE__*/React.createElement(TrashIcon, { size: 12 }))))
              ),

              /* Save & Close buttons formatted using DateModal styles */
              /*#__PURE__*/React.createElement("div", {
                style: { display: 'flex', gap: '8px', marginLeft: 'auto' }
              },
                /* Close without saving */
                /*#__PURE__*/React.createElement("button", {
                  type: "button",
                  className: "btn btn-secondary",
                  onClick: () => setIsComposerExpanded(false),
                  style: {
                    whiteSpace: 'nowrap',
                    cursor: 'pointer',
                    backgroundColor: 'transparent',
                    border: 'none'
                  }
                }, "닫기"),
                /* Save memo */
                /*#__PURE__*/React.createElement("button", {
                  type: "button",
                  className: "btn btn-primary",
                  onClick: handleSaveMemo,
                  disabled: newUploadProgress !== null,
                  style: {
                    padding: '10px 28px',
                    whiteSpace: 'nowrap',
                    cursor: 'pointer'
                  }
                }, newUploadProgress !== null ? `업로드 (${newUploadProgress.pct}%)` : "저장")
              )
            )
          )
      ),

      /* MEMOS SECTIONS (Pinned vs Normal) */
      
      /* 1. Pinned Memos Section */
      pinnedMemos.length > 0 && /*#__PURE__*/React.createElement("div", {
        style: { display: 'flex', flexDirection: 'column', gap: '8px' }
      },
        /* Label */
        /*#__PURE__*/React.createElement("div", {
          style: { fontSize: '0.72rem', fontWeight: 'bold', color: '#64748B', letterSpacing: '0.05em', textTransform: 'uppercase' }
        }, "고정됨"),
        /* Grid */
        /*#__PURE__*/React.createElement("div", {
          style: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '12px'
          }
        }, pinnedMemos.map(memo => /*#__PURE__*/React.createElement(MemoCard, {
          key: memo.id,
          memo: memo,
          calendar: calendar,
          onOpenEdit: handleOpenEdit,
          onTogglePin: () => handleTogglePin(memo),
          onShare: () => setSharingMemo(memo),
          onSelectTag: (tag) => { setSelectedTag(tag); setIsSearchOpen(true); },
          onCommentsChange: (nextComments) => handleMemoCommentsChange(memo, nextComments),
          getBorderColor: getBorderColor,
          onRequestConfirm: onRequestConfirm,
          showToast: showToast
        })))
      ),

      /* 2. Other Memos Section */
      otherMemos.length > 0 && /*#__PURE__*/React.createElement("div", {
        style: { display: 'flex', flexDirection: 'column', gap: '8px', marginTop: pinnedMemos.length > 0 ? '12px' : '0' }
      },
        /* Label */
        pinnedMemos.length > 0 && /*#__PURE__*/React.createElement("div", {
          style: { fontSize: '0.72rem', fontWeight: 'bold', color: '#64748B', letterSpacing: '0.05em', textTransform: 'uppercase' }
        }, "메모 목록"),
        /* Grid */
        /*#__PURE__*/React.createElement("div", {
          style: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '12px'
          }
        }, otherMemos.map(memo => /*#__PURE__*/React.createElement(MemoCard, {
          key: memo.id,
          memo: memo,
          calendar: calendar,
          onOpenEdit: handleOpenEdit,
          onTogglePin: () => handleTogglePin(memo),
          onShare: () => setSharingMemo(memo),
          onSelectTag: (tag) => { setSelectedTag(tag); setIsSearchOpen(true); },
          onCommentsChange: (nextComments) => handleMemoCommentsChange(memo, nextComments),
          getBorderColor: getBorderColor,
          onRequestConfirm: onRequestConfirm,
          showToast: showToast
        })))
      ),

      /* "메모 더 보기" -- memos load newest-first in pages rather than all at once, so this
         fetches the next page of older memos (mirrors chat room's "이전 채팅 더보기"). Pinned
         memos are always fully loaded regardless of this button, so pinning an old memo never
         depends on paging back to it first. */
      hasMoreMemos && /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: onLoadMoreMemos,
        style: {
          width: '100%',
          backgroundColor: 'var(--bg-primary)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '10px 0',
          fontSize: '0.85rem',
          fontWeight: 'bold',
          color: 'var(--text-main)',
          cursor: 'pointer',
          textAlign: 'center',
          marginTop: '4px'
        }
      }, "메모 더 보기"),

      /* Empty State */
      filteredMemos.length === 0 && /*#__PURE__*/React.createElement("div", {
        style: { padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.88rem' }
      }, "등록된 메모가 없거나 검색 조건과 일치하는 메모가 없습니다. 📝")
    ),

    /* Memo Editor Modal Overlay */
    editingMemo && /*#__PURE__*/React.createElement("div", {
      onClick: memoEditorDirtyGuard.overlayOnClick,
      style: {
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.4)', WebkitBackdropFilter: 'blur(4px)', backdropFilter: 'blur(4px)',
        zIndex: 10000,
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
      }
    },
      /* Modal Container */
      /*#__PURE__*/React.createElement(ResizableModalContainer, {
        className: "modal-container memo-edit-modal-container",
        style: {
          width: '100%', maxWidth: '520px',
          backgroundColor: editColor,
          border: '1px solid ' + getBorderColor(editColor),
          borderRadius: 'var(--radius-md)',
          boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
          display: 'flex', flexDirection: 'column', gap: '12px',
          padding: '16px', boxSizing: 'border-box',
        }
      },
        /* Header: Title & Pin */
        /*#__PURE__*/React.createElement("div", {
          className: "memo-edit-modal-header",
          style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }
        },
          /* Title input - Styled precisely as user requested */
          /*#__PURE__*/React.createElement("input", {
            type: "text",
            placeholder: "제목",
            value: editTitle,
            onChange: e => setEditTitle(e.target.value),
            style: {
              padding: '8px 8px',
              background: 'transparent',
              borderWidth: 'medium',
              borderStyle: 'none',
              borderColor: 'currentcolor',
              borderImage: 'none',
              outline: 'none',
              fontSize: '0.95rem',
              fontWeight: 'bold',
              color: 'var(--text-main)',
              width: '100%',
              borderBottom: '1px solid var(--border-subtle)',
              boxSizing: 'border-box'
            }
          }),
          /* Share button in Memo edit popup */
          /*#__PURE__*/React.createElement("button", {
            type: "button",
            onClick: () => setSharingMemo(editingMemo),
            title: "메모 공유",
            style: { background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', padding: '4px', marginRight: '6px' }
          }, /*#__PURE__*/React.createElement("svg", {
            xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round"
          }, /*#__PURE__*/React.createElement("path", { d: "M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" }), /*#__PURE__*/React.createElement("polyline", { points: "16 6 12 2 8 6" }), /*#__PURE__*/React.createElement("line", { x1: "12", y1: "2", x2: "12", y2: "15" }))),
          /* Pin Toggle button (Custom pin SVGs for ON/OFF) */
          /*#__PURE__*/React.createElement("button", {
            type: "button",
            onClick: () => setEditIsPinned(!editIsPinned),
            style: { background: 'none', border: 'none', cursor: 'pointer', color: editIsPinned ? '#F59E0B' : '#94A3B8', padding: '4px' }
          }, editIsPinned ? 
            /*#__PURE__*/React.createElement("svg", {
              xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "currentColor", className: "icon icon-tabler icon-tabler-filled icon-tabler-pin"
            }, /*#__PURE__*/React.createElement("path", { stroke: "none", d: "M0 0h24v24H0z", fill: "none" }), /*#__PURE__*/React.createElement("path", { d: "M15.113 3.21l.094 .083l5.5 5.5a1 1 0 0 1 -1.175 1.59l-3.172 3.171l-1.424 3.797a1 1 0 0 1 -.158 .277l-.07 .08l-1.5 1.5a1 1 0 0 1 -1.32 .082l-.095 -.083l-2.793 -2.792l-3.793 3.792a1 1 0 0 1 -1.497 -1.32l.083 -.094l3.792 -3.793l-2.792 -2.793a1 1 0 0 1 -.083 -1.32l.083 -.094l1.5 -1.5a1 1 0 0 1 .258 -.187l.098 -.042l3.796 -1.425l3.171 -3.17a1 1 0 0 1 1.497 -1.26z" }))
          :
            /*#__PURE__*/React.createElement("svg", {
              xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: "icon icon-tabler icons-tabler-outline icon-tabler-pin"
            }, /*#__PURE__*/React.createElement("path", { stroke: "none", d: "M0 0h24v24H0z", fill: "none" }), /*#__PURE__*/React.createElement("path", { d: "M15 4.5l-4 4l-4 1.5l-1.5 1.5l7 7l1.5 -1.5l1.5 -4l4 -4" }), /*#__PURE__*/React.createElement("path", { d: "M9 15l-4.5 4.5" }), /*#__PURE__*/React.createElement("path", { d: "M14.5 4l5.5 5.5" }))
          )
        ),

        /*#__PURE__*/React.createElement("div", {
          className: "memo-edit-modal-body"
        },
        /* Textarea wrapped relatively with bottom-right emoji & file picker icons - Styled precisely as user requested */
        /*#__PURE__*/React.createElement("div", {
          style: { position: 'relative', width: '100%' }
        },
          /* Body Textarea */
          /*#__PURE__*/React.createElement("textarea", {
            ref: editMemoTextareaRef,
            className: "memo-edit-textarea",
            placeholder: "메모 입력...",
            value: editText,
            onChange: e => { setEditText(e.target.value); autoGrowTextarea(e.target, 480); },
            rows: "6",
            style: {
              padding: '8px 4px',
              background: 'transparent',
              borderWidth: 'medium',
              borderStyle: 'none',
              borderColor: 'currentcolor',
              borderImage: 'none',
              outline: 'none',
              resize: 'none',
              fontSize: '0.82rem',
              color: 'var(--text-main)',
              width: '100%',
              paddingBottom: '28px',
              fontFamily: 'inherit',
              boxSizing: 'border-box'
            }
          }),
          /* Bottom-right emoji/photo buttons wrapper */
          /*#__PURE__*/React.createElement("div", {
            style: {
              position: 'absolute',
              right: '4px',
              bottom: '4px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              zIndex: 2
            }
          },
            /* Emoji picker trigger */
            /*#__PURE__*/React.createElement("button", {
              type: "button",
              onClick: () => setIsEditEmojiOpen(true),
              style: { background: 'none', border: 'none', padding: '4px', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' },
              title: "이모티콘 추가"
            }, /*#__PURE__*/React.createElement(EmojiPickerIcon, null)),
            
            /* File Upload label icon */
            /*#__PURE__*/React.createElement("label", {
              style: { display: 'flex', alignItems: 'center', cursor: 'pointer', color: '#64748B', padding: '4px' },
              title: "사진 추가"
            }, 
              /*#__PURE__*/React.createElement("input", {
                type: "file",
                multiple: true,
                accept: "image/jpeg, image/png, image/gif, image/webp, image/heic, image/heif, image/*",
                onChange: handleEditFileSelect,
                style: { display: 'none' }
              }),
              /*#__PURE__*/React.createElement("svg", {
                xmlns: "http://www.w3.org/2000/svg", width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2"
              }, /*#__PURE__*/React.createElement("rect", { width: "18", height: "18", x: "3", y: "3", rx: "2", ry: "2" }), /*#__PURE__*/React.createElement("circle", { cx: "9", cy: "9", r: "2" }), /*#__PURE__*/React.createElement("path", { d: "m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" }))
            )
          )
        ),

        /* Links Card Preview inside edit modal */
        extractFirstUrl(editText) && (() => {
          const url = extractFirstUrl(editText);
          const oldUrl = extractFirstUrl(editingMemo?.text);
          const cachedData = (oldUrl === url) ? editingMemo?.linkPreview : null;
          return /*#__PURE__*/React.createElement("div", {
            style: { marginTop: '4px', marginBottom: '4px' }
          }, /*#__PURE__*/React.createElement(LinkPreviewCard, { url: url, cachedData: cachedData, stretch: true }));
        })(),

        /* Images previews list */
        editImages.length > 0 && /*#__PURE__*/React.createElement("div", {
          style: { display: 'flex', flexWrap: 'wrap', gap: '6px', margin: '4px 0' }
        }, editImages.map((img, idx) => /*#__PURE__*/React.createElement("div", {
          key: idx,
          style: { position: 'relative', width: '60px', height: '60px' }
        }, 
          /* Image element */
          /*#__PURE__*/React.createElement("img", {
            src: img.thumbnail,
            decoding: 'async',
            style: { width: '100%', height: '100%', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--border-subtle)' }
          }),
          /* Remove button (shared with chat's attachment thumbnail) */
          /*#__PURE__*/React.createElement(ImageThumbRemoveButton, {
            onClick: () => removeEditImage(idx)
          })
        ))),

        /* Tag Input Module (migrated directly from Lightbox component, white background responsive, IME composition protected) */
        /*#__PURE__*/React.createElement("div", {
          style: { display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }
        },
          /*#__PURE__*/React.createElement("span", {
            style: { fontSize: '0.74rem', fontWeight: 800, color: 'var(--text-muted)', flexShrink: 0 }
          }, "태그입력"),
          /*#__PURE__*/React.createElement("input", {
            type: "text",
            placeholder: editTags.length >= 10 ? "태그 최대 10개 도달" : `태그 입력 (${editTags.length}/10)`,
            value: editTagInput,
            onChange: e => setEditTagInput(e.target.value),
            onKeyDown: e => {
              if (e.nativeEvent.isComposing) return;
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddEditTag();
              }
            },
            maxLength: 100,
            style: {
              flex: 1, minWidth: 0, height: '28px', padding: '0 8px', borderRadius: '6px',
              border: '1px solid var(--border-subtle)', background: 'var(--bg-primary)',
              color: 'var(--text-main)', fontSize: '0.74rem'
            }
          }),
          /*#__PURE__*/React.createElement("button", {
            type: "button",
            onClick: handleAddEditTag,
            disabled: editTags.length >= 10,
            style: {
              flexShrink: 0, height: '28px', padding: '0 10px', borderRadius: '6px',
              border: '1px solid var(--border-subtle)', background: 'var(--border-subtle)',
              color: 'var(--text-main)', fontSize: '0.72rem', fontWeight: 800, cursor: 'pointer',
              opacity: editTags.length >= 10 ? 0.45 : 1
            }
          }, "저장")
        )),

        /* Footer Controls: Participant button and Tag Badges row (Swatches dot menu removed completely) */
        /*#__PURE__*/React.createElement("div", {
          className: "memo-edit-modal-footer",
          style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px', gap: '8px', flexWrap: 'wrap' }
        },
          /* Participant select box & tag badges list to its right */
          /*#__PURE__*/React.createElement("div", {
            style: { display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }
          },
            /* Participant selection capsule button (shared with memo composer + chat edit modal) */
            /*#__PURE__*/React.createElement(ParticipantPickerButton, {
              participant: editPart,
              onClick: () => setIsEditPartOpen(true)
            }),

            /* Active tag capsule badges (Responsive white background style: (#레시피 (✕))) */
            editTags.map(tag => /*#__PURE__*/React.createElement("span", {
              key: tag,
              style: {
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                borderRadius: 'var(--radius-full)',
                padding: '3px 4px 3px 10px',
                fontSize: '0.72rem',
                fontWeight: 900,
                lineHeight: 1,
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-main)',
                background: 'var(--bg-primary)'
              }
            }, `#${tag}`, /*#__PURE__*/React.createElement("button", {
              type: "button",
              title: `#${tag} 태그 삭제`,
              onClick: async e => {
                e.stopPropagation();
                const nextTags = editTags.filter(t => t !== tag);
                if (editingMemo) {
                  try {
                    const calendarId = calendar.id;
                    const tagsArray = nextTags.map(t => t.startsWith('#') ? t : '#' + t);
                    await __fb().collection('calendars').doc('cal_' + calendarId).collection('memos').doc(editingMemo.id).update({
                      tags: tagsArray
                    });
                  } catch (err) {
                    console.error('Failed to delete tag in Firestore:', err);
                    showToast('태그 삭제 실패', 'error');
                  }
                }
                setEditTags(nextTags);
              },
              style: {
                width: '17px',
                height: '17px',
                border: 0,
                borderRadius: '50%',
                background: 'var(--border-subtle)',
                color: 'var(--text-main)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0,
                cursor: 'pointer',
                flexShrink: 0
              }
            }, /*#__PURE__*/React.createElement(TrashIcon, { size: 12 }))))
          ),

          /* Save / Delete / Cancel Actions using DateModal layout styles */
          /*#__PURE__*/React.createElement("div", {
            style: { display: 'flex', gap: '8px', width: '100%', justifyContent: 'flex-end', marginTop: '6px' }
          },
            /* Delete Memo Button (Pushed to the far left) */
            /*#__PURE__*/React.createElement("button", {
              type: "button",
              className: "btn btn-danger",
              onClick: () => handleDeleteMemo(editingMemo),
              style: {
                whiteSpace: 'nowrap',
                cursor: 'pointer',
                padding: '10px 20px',
                marginRight: 'auto',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }
            }, /*#__PURE__*/React.createElement(TrashIcon, { size: 14 }), "삭제"),
            
            /* Cancel */
            /*#__PURE__*/React.createElement("button", {
              type: "button",
              className: "btn btn-secondary",
              onClick: memoEditorDirtyGuard.requestClose,
              style: {
                whiteSpace: 'nowrap',
                cursor: 'pointer',
                backgroundColor: 'transparent',
                border: 'none'
              }
            }, "닫기"),
            
            /* Update */
            /*#__PURE__*/React.createElement("button", {
              type: "button",
              className: "btn btn-primary",
              onClick: handleUpdateMemo,
              disabled: editUploadProgress !== null,
              style: {
                padding: '10px 28px',
                whiteSpace: 'nowrap',
                cursor: 'pointer'
              }
            }, editUploadProgress !== null ? `업로드 (${editUploadProgress.pct}%)` : "저장")
          )
        )
      )
    )),

    /* Emoji Picker Overlay & Bottom Sheets for selector sheets */
    isComposerEmojiOpen && /*#__PURE__*/React.createElement(EmojiPickerSheet, {
      onSelect: (emoji) => {
        setNewText(prev => prev + emoji);
        setIsComposerEmojiOpen(false);
      },
      onClose: () => setIsComposerEmojiOpen(false)
    }),
    isEditEmojiOpen && /*#__PURE__*/React.createElement(EmojiPickerSheet, {
      onSelect: (emoji) => {
        setEditText(prev => prev + emoji);
        setIsEditEmojiOpen(false);
      },
      onClose: () => setIsEditEmojiOpen(false)
    }),

    isComposerPartOpen && /*#__PURE__*/React.createElement(ChatParticipantSheet, {
      calendar: calendar,
      selectedId: composerParticipantId,
      onSelect: id => {
        setComposerParticipantId(id);
        setIsComposerPartOpen(false);
      },
      onClose: () => setIsComposerPartOpen(false)
    }),
    isEditPartOpen && /*#__PURE__*/React.createElement(ChatParticipantSheet, {
      calendar: calendar,
      selectedId: editParticipantId,
      onSelect: id => {
        setEditParticipantId(id);
        setIsEditPartOpen(false);
      },
      onClose: () => setIsEditPartOpen(false)
    }),

    imageProcessingNew && /*#__PURE__*/React.createElement(ImageProcessingOverlay, imageProcessingNew),
    newUploadProgress && /*#__PURE__*/React.createElement(ImageUploadOverlay, newUploadProgress),
    imageProcessingEdit && /*#__PURE__*/React.createElement(ImageProcessingOverlay, imageProcessingEdit),
    linkPreviewProgressState && /*#__PURE__*/React.createElement(LinkPreviewProgressOverlay, { progress: linkPreviewProgressState.pct, remainingSec: linkPreviewProgressState.remainingSec }),
    isGalleryOpen && /*#__PURE__*/React.createElement(ChatGalleryModal, { chatMessages, onClose: () => setIsGalleryOpen(false), setActiveLightbox }),
    editUploadProgress && /*#__PURE__*/React.createElement(ImageUploadOverlay, editUploadProgress),

    sharingMemo && /*#__PURE__*/React.createElement(MemoShareModal, {
      memo: sharingMemo,
      calendarId: calendar.id,
      onClose: () => setSharingMemo(null),
      showToast: showToast
    })
  );
}

  if (typeof window !== 'undefined') {
  window.GATHER_UI_COMPONENTS = Object.assign({}, window.GATHER_UI_COMPONENTS || {}, {
    MemoView: MemoView,
  });
}
