/**
 * Admin sub-modals (P4-20)
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
function useChatSendGuard(onSend, canSend) {
  const f = __gatherUiDeps().useChatSendGuard;
  return typeof f === 'function' ? f(onSend, canSend) : onSend;
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

function isNotificationSupported(...args) {
  const n = window.GATHER_APP_NOTIFICATIONS || {};
  const f = __gatherUiDeps().isNotificationSupported || n.isNotificationSupported || GATHER_APP_UTILS.isNotificationSupported;
  if (typeof f === 'function') return f(...args);
  try { return typeof Notification !== 'undefined' && 'Notification' in window; } catch (_) { return false; }
}
function isChatNotifyEnabledForCalendar(...args) {
  const n = window.GATHER_APP_NOTIFICATIONS || {};
  const f = __gatherUiDeps().isChatNotifyEnabledForCalendar || n.isChatNotifyEnabledForCalendar;
  return typeof f === 'function' ? f(...args) : false;
}
function setChatNotifyEnabledForCalendar(...args) {
  const n = window.GATHER_APP_NOTIFICATIONS || {};
  const f = __gatherUiDeps().setChatNotifyEnabledForCalendar || n.setChatNotifyEnabledForCalendar;
  return typeof f === 'function' ? f(...args) : undefined;
}
function probeNotificationCapability(...args) {
  const n = window.GATHER_APP_NOTIFICATIONS || {};
  const f = __gatherUiDeps().probeNotificationCapability || n.probeNotificationCapability;
  if (typeof f === 'function') return f(...args);
  return Promise.resolve({ ok: isNotificationSupported(), reason: 'unsupported' });
}
function ensureChatNotificationPermission(...args) {
  const n = window.GATHER_APP_NOTIFICATIONS || {};
  const f = __gatherUiDeps().ensureChatNotificationPermission || n.ensureChatNotificationPermission;
  if (typeof f === 'function') return f(...args);
  try {
    if (!isNotificationSupported()) return Promise.resolve('unsupported');
    if (Notification.permission === 'granted') return Promise.resolve('granted');
    if (Notification.permission === 'denied') return Promise.resolve('denied');
    return Notification.requestPermission();
  } catch (_) {
    return Promise.resolve('unsupported');
  }
}
function describePushSubscribeFailure(...args) {
  const n = window.GATHER_APP_NOTIFICATIONS || {};
  const f = __gatherUiDeps().describePushSubscribeFailure || n.describePushSubscribeFailure;
  if (typeof f === 'function') return f(...args);
  return String(args[0] || 'unknown');
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
function rebuildCalendarToTimestamp(...args) {
  const f = __gatherUiDeps().rebuildCalendarToTimestamp || GATHER_APP_UTILS.rebuildCalendarToTimestamp;
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
function useTapRevealedMsgId(...args) {
  const f = __gatherUiDeps().useTapRevealedMsgId || GATHER_APP_UTILS.useTapRevealedMsgId;
  return typeof f === 'function' ? f(...args) : undefined;
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
function useLinkPreview(...args) {
  const f = __gatherUiDeps().useLinkPreview || GATHER_APP_UTILS.useLinkPreview;
  return typeof f === 'function' ? f(...args) : undefined;
}
function useScrollHideHeader(...args) {
  const f = __gatherUiDeps().useScrollHideHeader || GATHER_APP_UTILS.useScrollHideHeader;
  return typeof f === 'function' ? f(...args) : undefined;
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


export function AdminModal({
  anniversaries = [],
  initialTab = 'settings',
  onOpenAnniversarySettings,
  calendar,
  allCalendars,
  onSelectCalendar,
  onLoadActivityLogs,
  onSave,
  recentMessages = [],
  chatMessages = [],
  onDeleteMessage,
  onDeleteAvailability,
  onDeleteAllForDate,
  onBulkRegister,
  onRequestConfirm,
  onClose,
  showToast,
  onDeleteLog,
  chatParticipantId,
  themeChoice,
  toggleTheme,
  isDarkTheme,
  fontScalePercent,
  setFontScalePercent,
  onSelectDate,
  onOpenChatMessage,
  onOpenImage,
  onNotificationPermissionBlocked
}) {
  const React = window.React;
  const __deps = window.GATHER_UI_DEPS || {};
  const __comp = window.GATHER_UI_COMPONENTS || {};
  const AlertTriangleIcon = __comp.AlertTriangleIcon || __deps.AlertTriangleIcon;
  const CalendarCogIcon = __comp.CalendarCogIcon || __deps.CalendarCogIcon;
  const CalendarExportIcon = __comp.CalendarExportIcon || __deps.CalendarExportIcon;
  const CalendarGrid = __comp.CalendarGrid || __deps.CalendarGrid;
  const ColorSwatchPicker = __comp.ColorSwatchPicker || __deps.ColorSwatchPicker;
  const DateModal = __comp.DateModal || __deps.DateModal;
  const HourglassIcon = __comp.HourglassIcon || __deps.HourglassIcon;
  const LogIcon = __comp.LogIcon || __deps.LogIcon;
  const MenuIcon = __comp.MenuIcon || __deps.MenuIcon;
  const PollModal = __comp.PollModal || __deps.PollModal;
  const PollSectionIcon = __comp.PollSectionIcon || __deps.PollSectionIcon;
  const ResizableModalContainer = __comp.ResizableModalContainer || __deps.ResizableModalContainer;
  const SettingsIcon = __comp.SettingsIcon || __deps.SettingsIcon;
  const SmallXIcon = __comp.SmallXIcon || __deps.SmallXIcon;
  const TrashIcon = __comp.TrashIcon || __deps.TrashIcon;
  const AnniversaryModal = __comp.AnniversaryModal || __deps.AnniversaryModal;
  const getActiveParticipants = typeof __deps.getActiveParticipants === 'function'
    ? __deps.getActiveParticipants
    : (typeof GATHER_APP_UTILS !== 'undefined' && typeof GATHER_APP_UTILS.getActiveParticipants === 'function'
      ? GATHER_APP_UTILS.getActiveParticipants
      : function (cal) { return (cal && Array.isArray(cal.participants) ? cal.participants.filter(function (p) { return p && !p.deletedAt; }) : []); });
  const sanitizeText = typeof __deps.sanitizeText === 'function'
    ? __deps.sanitizeText
    : (typeof GATHER_APP_UTILS !== 'undefined' && typeof GATHER_APP_UTILS.sanitizeText === 'function'
      ? GATHER_APP_UTILS.sanitizeText
      : function (s, n) { var v = String(s == null ? '' : s); return typeof n === 'number' ? v.slice(0, n) : v; });
    const CakeTabIcon = ({ size = 18 }) => /*#__PURE__*/React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg", width: size, height: size, viewBox: "0 0 24 24",
    fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true"
  },
    /*#__PURE__*/React.createElement("path", { d: "M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8" }),
    /*#__PURE__*/React.createElement("path", { d: "M4 16s.5-1 2-1 2.5 2 4 2 2.5-2 4-2 2.5 2 4 2 2-1 2-1" }),
    /*#__PURE__*/React.createElement("path", { d: "M2 21h20" }),
    /*#__PURE__*/React.createElement("path", { d: "M7 8v3" }),
    /*#__PURE__*/React.createElement("path", { d: "M12 8v3" }),
    /*#__PURE__*/React.createElement("path", { d: "M17 8v3" }),
    /*#__PURE__*/React.createElement("path", { d: "M7 4h.01" }),
    /*#__PURE__*/React.createElement("path", { d: "M12 4h.01" }),
    /*#__PURE__*/React.createElement("path", { d: "M17 4h.01" })
  );

  const [activeTab, setActiveTab] = React.useState(initialTab === 'anniversary' ? 'anniversary' : (initialTab || 'settings'));
  React.useEffect(() => { if (initialTab) setActiveTab(initialTab === 'anniversary' ? 'anniversary' : initialTab); }, [initialTab]);

  // recovery/logs only — avoid loading full activityLogs when opening 일반/설정
  React.useEffect(() => {
    if (activeTab === 'recovery' || activeTab === 'logs') {
      if (typeof onLoadActivityLogs === 'function') onLoadActivityLogs();
    }
  }, [activeTab, onLoadActivityLogs, calendar && calendar.id]);

  // Chat notification permission -- mirrors ChatRoomView's own bell toggle logic (kept as an
  // independent local read of the same browser-level Notification.permission rather than shared
  // React state, since it's not app-owned data). Lets the on/off switch live here too, in 일반
  // tab, alongside the other personal display preferences. Notification.permission itself is
  // origin-wide (the browser has no concept of "per-calendar" permission), but once granted,
  // whether THIS calendar's chat actually shows a notification is its own per-calendar
  // preference (isChatNotifyEnabledForCalendar) -- so the switch reflects both together, and
  // toggling it once permission is already granted flips the per-calendar preference instead of
  // hitting a dead end.
  const [notifPermission, setNotifPermission] = React.useState(() => (isNotificationSupported() ? Notification.permission : 'unsupported'));
  const [chatNotifyEnabled, setChatNotifyEnabled] = React.useState(() => isChatNotifyEnabledForCalendar(calendar?.id));
  React.useEffect(() => {
    setChatNotifyEnabled(isChatNotifyEnabledForCalendar(calendar?.id));
  }, [calendar?.id]);
  const handleToggleNotifications = async () => {
    if (!isNotificationSupported()) {
      if (showToast) showToast('알림 미지원 브라우저', 'error');
      if (onNotificationPermissionBlocked) onNotificationPermissionBlocked();
      return;
    }
    if (Notification.permission === 'granted') {
      const next = !chatNotifyEnabled;
      if (next) {
        // iOS reports Notification.permission as 'granted' even in a regular (non-installed)
        // browser tab, where push can never actually arrive -- probe before trusting that flag
        // (this branch used to skip straight to subscribe, unlike the "not yet decided" branch
        // below which already had this check).
        const capability = await probeNotificationCapability();
        if (!capability.ok) {
          setNotifPermission('unsupported');
          if (onNotificationPermissionBlocked) onNotificationPermissionBlocked();
          if (showToast) showToast(capability.reason === 'ios-not-installed' ? '이 브라우저에서는 알림을 표시할 수 없습니다 (iOS는 홈 화면 추가 필요)' : '이 환경에서는 알림을 받을 수 없습니다.', 'error', 6000);
          return;
        }
      }
      setChatNotifyEnabled(next);
      setChatNotifyEnabledForCalendar(calendar.id, next);
      if (next) {
        const result = await subscribeUserToPushWithPermission(calendar.id, chatParticipantId);
        if (result && !result.ok) {
          setChatNotifyEnabled(false);
          setChatNotifyEnabledForCalendar(calendar.id, false);
          if (result.reason === 'permission-not-granted' && onNotificationPermissionBlocked) onNotificationPermissionBlocked();
          if (showToast) showToast(`푸시 등록 실패: ${describePushSubscribeFailure(result.reason)}`, 'error', 6000);
          console.warn('Settings chat notification subscribe failed:', result.reason);
          return;
        }
      } else {
        await unsubscribeUserFromPush(calendar.id);
      }
      if (showToast) showToast(next ? '이 캘린더 채팅 알림 켜짐' : '이 캘린더 채팅 알림 꺼짐', 'success');
      return;
    }
    if (Notification.permission === 'denied') {
      if (onNotificationPermissionBlocked) onNotificationPermissionBlocked();
      if (showToast) showToast('브라우저 설정에서 알림 허용 필요', 'error');
      return;
    }
    const result = await ensureChatNotificationPermission();
    if (result !== 'granted') {
      setNotifPermission(result);
      if (onNotificationPermissionBlocked) onNotificationPermissionBlocked();
      if (showToast) showToast('알림 권한 거부됨', 'error');
      return;
    }
    const capability = await probeNotificationCapability();
    if (!capability.ok) {
      setNotifPermission('unsupported');
      if (onNotificationPermissionBlocked) onNotificationPermissionBlocked();
      if (showToast) showToast(capability.reason === 'ios-not-installed' ? '이 브라우저에서는 알림을 표시할 수 없습니다 (iOS는 홈 화면 추가 필요)' : '이 브라우저에서는 알림을 표시할 수 없습니다.', 'error', 6000);
      return;
    }
    setNotifPermission('granted');
    setChatNotifyEnabled(true);
    setChatNotifyEnabledForCalendar(calendar.id, true);
    const subscribeResult = await subscribeUserToPushWithPermission(calendar.id, chatParticipantId);
    if (subscribeResult && !subscribeResult.ok) {
      setChatNotifyEnabled(false);
      setChatNotifyEnabledForCalendar(calendar.id, false);
      if (subscribeResult.reason === 'permission-not-granted' && onNotificationPermissionBlocked) onNotificationPermissionBlocked();
      if (showToast) showToast(`푸시 등록 실패: ${describePushSubscribeFailure(subscribeResult.reason)}`, 'error', 6000);
      console.warn('Settings chat notification subscribe failed:', subscribeResult.reason);
      return;
    }
    if (showToast) showToast('알림 켜짐', 'success');
  };

  // Calendar tab: browse dates and delete schedules -- reuses DateModal in adminMode, which
  // hides the normal registration UI and shows only the registered-participant list + delete
  // controls (per-participant and whole-date), same as the 일정 삭제 flow used to live in the
  // regular user-facing modal before it moved here.
  const [adminCalMonthDate, setAdminCalMonthDate] = React.useState(new Date());
  const [adminSelectedDate, setAdminSelectedDate] = React.useState(null);

  // Settings tab states
  const [title, setTitle] = React.useState(calendar.title);
  const [description, setDescription] = React.useState(calendar.description || '');
  const [participants, setParticipants] = React.useState(() => { try { return getActiveParticipants(calendar) || []; } catch (_) { return []; } });

  const [newName, setNewName] = React.useState('');
  const newNameInputRef = React.useRef(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const adminSettingsDirtySnapshot = () => JSON.stringify([
    title,
    description,
    newName,
    participants.map(p => [p.id, p.name, p.color, p.removedAt ? 1 : 0])
  ]);
  const { requestClose, overlayOnClick } = useModalDirtyGuard(
    onClose,
    onRequestConfirm,
    undefined,
    true,
    adminSettingsDirtySnapshot,
    calendar?.id || 'calendar'
  );

  // Poll sub-modal states inside AdminModal
  const [editingPoll, setEditingPoll] = React.useState(null);
  const [isPollModalOpen, setIsPollModalOpen] = React.useState(false);

  React.useEffect(() => {
    setTitle(calendar.title);
    setDescription(calendar.description || '');
    setParticipants(getActiveParticipants(calendar));
    setNewName('');
    setIsSubmitting(false);
  }, [calendar?.id]);

  const handleAddParticipant = e => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    if (isSubmitting) return;
    if (e && e.nativeEvent && e.nativeEvent.isComposing) return;
    const latestName = newNameInputRef.current ? newNameInputRef.current.value : newName;
    const trimmed = sanitizeText(latestName, 40);
    if (!trimmed) {
      if (showToast) showToast('참여자 이름을 입력해 주세요.', 'error');
      return;
    }
    const newParticipant = {
      id: `${calendar.id}_p_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      name: trimmed,
      color: normalizeColorValue(PRESET_COLORS[participants.filter(p => !isTombstone(p)).length % PRESET_COLORS.length]),
      updatedAt: Date.now()
    };
    setParticipants(prev => [...prev, newParticipant]);
    setNewName('');
    if (newNameInputRef.current) newNameInputRef.current.value = '';
  };

  const updateParticipant = (participantId, patch) => {
    if (isSubmitting) return;
    const now = Date.now();
    const cleanPatch = { ...patch };
    if (Object.prototype.hasOwnProperty.call(cleanPatch, 'name')) {
      cleanPatch.name = sanitizeText(cleanPatch.name, 40);
    }
    if (Object.prototype.hasOwnProperty.call(cleanPatch, 'color')) {
      cleanPatch.color = normalizeColorValue(cleanPatch.color);
    }
    setParticipants(prev => prev.map(item => item.id === participantId ? {
      ...item,
      ...cleanPatch,
      updatedAt: now
    } : item));
  };

  const handleSubmitSettings = async e => {
    if (e) e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    const now = Date.now();

    // Validate titles & names
    if (!title.trim()) {
      if (showToast) showToast('캘린더 제목을 입력해 주세요.', 'error'); else alert('캘린더 제목을 입력해 주세요.');
      setIsSubmitting(false);
      return;
    }

    const activeParticipantsList = participants.filter(p => !isTombstone(p));
    const activeNames = activeParticipantsList.map(p => p.name.trim().toLowerCase());
    if (new Set(activeNames).size !== activeNames.length) {
      if (showToast) showToast('동일한 참여자 이름이 이미 존재합니다.', 'error'); else alert('동일한 참여자 이름이 이미 존재합니다.');
      setIsSubmitting(false);
      return;
    }

    const stampedCal = {
      ...calendar,
      title: title.trim(),
      description: description.trim(),
      updatedAt: now,
      revision: (calendar.revision || 0) + 1,
      participants: participants
    };

    let saved = false;
    try {
      saved = await Promise.resolve(onSave(stampedCal, null));
    } catch (err) {
      console.error('Calendar settings save failed:', err);
    }
    setIsSubmitting(false);
    if (saved !== false) {
      onClose();
    }
  };

  // Poll operations from Admin Dashboard
  const handleSavePollFromAdmin = async (updatedPoll) => {
    const now = Date.now();
    let nextPolls = [...(calendar.polls || [])];
    const index = nextPolls.findIndex(p => p.id === updatedPoll.id);
    if (index >= 0) {
      nextPolls[index] = updatedPoll;
    } else {
      nextPolls.push(updatedPoll);
    }

    const log = createPollActivityLog(
      calendar.id,
      'poll_create',
      '',
      now,
      updatedPoll.title
    );

    const updatedCal = {
      ...calendar,
      polls: nextPolls,
      activityLogs: log ? [...getCalendarActivityLogs(calendar), log] : getCalendarActivityLogs(calendar),
      updatedAt: now,
      revision: (calendar.revision || 0) + 1
    };

    const saved = await onSave(updatedCal, null);
    if (saved !== false) {
      setIsPollModalOpen(false);
      setEditingPoll(null);
    }
  };

  const handleDeletePollFromAdmin = (poll) => {
    onRequestConfirm('투표 삭제', `"${poll.title}" 투표를 삭제하시겠습니까?`, async () => {
      const now = Date.now();
      // Tombstone rather than filter out -- saveMode 'settings' now merges polls via
      // mergePolls, which unions by ID against the server's copy, so a poll simply absent
      // from the outgoing payload reads as "no change" and the server's copy survives.
      const nextPolls = (calendar.polls || []).map(p => p.id === poll.id ? { ...p, deletedAt: now, updatedAt: now } : p);
      const updatedCal = {
        ...calendar,
        polls: nextPolls,
        updatedAt: now,
        revision: (calendar.revision || 0) + 1
      };
      await onSave(updatedCal, null);
    });
  };

  // Log rollback operation
  const handleRestoreToLog = (log) => {
    const dateStr = log.date ? formatShortDateWithDayName(log.date) : '';
    onRequestConfirm(
      '시점 복구',
      `[${formatRegisteredAt(log.timestamp)}] 시점으로 복구하시겠습니까? 복구 후에는 이 시점 이후 등록된 모든 일정/투표 내역이 복구/롤백 처리됩니다.`,
      async () => {
        const fullLogs = getCalendarActivityLogs(calendar);
        const restoredCal = rebuildCalendarToTimestamp(calendar, log.timestamp, fullLogs);
        const saved = await onSave(restoredCal, null);
        if (saved !== false) {
          await deleteActivityLogsAfterTimestamp(calendar.id, fullLogs, log.timestamp);
          onClose();
        }
      },
      true // showPasswordInput = true
    );
  };

  const handleTimelineRowClick = (log) => {
    onClose(); // Close AdminModal settings popup

    const dateStr = log.date;
    const action = log.action || '';

    if (log.type === 'chat' || action === 'chat_send') {
      onOpenChatMessage && onOpenChatMessage(log.id);
    } else if (action === 'tag_add' || action === 'tag_remove') {
      let found = false;
      const cleanTag = (log.note || '').replace('#', '').trim();
      if (chatMessages && cleanTag) {
        for (const msg of chatMessages) {
          const directEntry = getMessageDirectMediaEntry(msg);
          const entries = directEntry ? [...getMessageImageEntries(msg), directEntry] : getMessageImageEntries(msg);
          const entry = entries.find(e => (e.tags || '').includes(cleanTag));
          if (entry) {
            onOpenImage && onOpenImage(msg.id, entry.imageIndex, entry.directMediaUrl);
            found = true;
            break;
          }
        }
      }
      if (!found) {
        onOpenChatMessage && onOpenChatMessage(log.participantId);
      }
    } else if (dateStr && isValidDateString(dateStr)) {
      onSelectDate && onSelectDate(dateStr);
    }
  };

  // Re-build map of participants for info
  const participantsMap = (calendar.participants || []).reduce((acc, p) => {
    acc[p.id] = p;
    return acc;
  }, {});

  const activityLogsSorted = React.useMemo(
    () => [...getCalendarActivityLogs(calendar)].sort((a, b) => b.timestamp - a.timestamp),
    [calendar.activityLogs]
  );

  if (!calendar || !calendar.id) {
    return /*#__PURE__*/React.createElement("div", {
      className: "modal-overlay",
      onClick: onClose,
      style: { zIndex: 10000 }
    }, /*#__PURE__*/React.createElement("div", {
      className: "modal-container confirm-dialog-modal",
      style: { maxWidth: '360px', padding: '20px' }
    }, /*#__PURE__*/React.createElement("p", { style: { margin: 0 } }, "캘린더 데이터를 불러오는 중입니다."),
      /*#__PURE__*/React.createElement("button", { type: "button", className: "btn btn-secondary", style: { marginTop: '12px', width: '100%' }, onClick: onClose }, "닫기")));
  }

  return /*#__PURE__*/React.createElement("div", {
    className: "modal-overlay",
    onClick: e => { if (!isSubmitting) overlayOnClick(e); },
    style: { zIndex: 10000 }
  }, /*#__PURE__*/React.createElement(ResizableModalContainer, {
    className: "modal-container admin-settings-modal",
    onClick: e => e.stopPropagation(),
    style: { maxWidth: '760px', width: '95vw', display: 'flex', flexDirection: 'column', height: 'min(90vh, 720px)', maxHeight: 'min(720px, calc(100svh - 24px), calc(100vh - 24px))', borderRadius: 'var(--radius-md)', overflow: 'hidden' }
  },
    /* Header */
    /*#__PURE__*/React.createElement("div", {
      className: "modal-header",
      style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }
    },
      /*#__PURE__*/React.createElement("h3", { style: { fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' } },
        /*#__PURE__*/React.createElement(SettingsIcon, null), `${calendar.title} 설정`
      ),
      /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: () => { if (!isSubmitting) requestClose(); },
        style: { background: 'none', border: 'none', color: '#64748B', fontSize: '1.2rem', cursor: 'pointer', display: 'flex', alignItems: 'center' }
      }, /*#__PURE__*/React.createElement(SmallXIcon, { size: 20 }))
    ),

    /* Tab Menu Bar */
    /*#__PURE__*/React.createElement("div", {
      style: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', borderBottom: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-primary)', flexShrink: 0, minWidth: 0 }
    },
      /* Tab 1: General settings */
      /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: () => setActiveTab('settings'),
        style: {
          padding: '12px 8px', fontSize: '0.88rem', fontWeight: 'bold', whiteSpace: 'nowrap',
          color: activeTab === 'settings' ? '#2563EB' : '#64748B',
          border: 'none', background: 'none',
          borderBottom: activeTab === 'settings' ? '3px solid #2563EB' : '3px solid transparent',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
        }
      }, /*#__PURE__*/React.createElement("span", { className: "admin-tab-icon" }, /*#__PURE__*/React.createElement(CalendarCogIcon, null)), "일반"),
      /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: () => setActiveTab('anniversary'),
        style: {
          padding: '12px 6px', fontSize: '0.82rem', fontWeight: 'bold', whiteSpace: 'nowrap',
          color: activeTab === 'anniversary' ? '#2563EB' : '#64748B',
          border: 'none', background: 'none',
          borderBottom: activeTab === 'anniversary' ? '3px solid #2563EB' : '3px solid transparent',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px'
        }
      }, /*#__PURE__*/React.createElement("span", { className: "admin-tab-icon" }, /*#__PURE__*/React.createElement(CakeTabIcon, { size: 18 })), "기념일"),
      /* Tab 2: Log-based recovery */
      /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: () => setActiveTab('recovery'),
        style: {
          padding: '12px 8px', fontSize: '0.88rem', fontWeight: 'bold', whiteSpace: 'nowrap',
          color: activeTab === 'recovery' ? '#2563EB' : '#64748B',
          border: 'none', background: 'none',
          borderBottom: activeTab === 'recovery' ? '3px solid #2563EB' : '3px solid transparent',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
        }
      }, /*#__PURE__*/React.createElement("span", { className: "admin-tab-icon" }, /*#__PURE__*/React.createElement(HourglassIcon, null)), "복구"),
      /* Tab 3: Logs view list */
      /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: () => setActiveTab('logs'),
        style: {
          padding: '12px 8px', fontSize: '0.88rem', fontWeight: 'bold', whiteSpace: 'nowrap',
          color: activeTab === 'logs' ? '#2563EB' : '#64748B',
          border: 'none', background: 'none',
          borderBottom: activeTab === 'logs' ? '3px solid #2563EB' : '3px solid transparent',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
        }
      }, /*#__PURE__*/React.createElement("span", { className: "admin-tab-icon" }, /*#__PURE__*/React.createElement(LogIcon, null)), "로그")
    ),

    /* Modal Scrollable Body */
    /*#__PURE__*/React.createElement("div", {
      className: "modal-body",
      style: { flex: activeTab === 'logs' ? '0 0 auto' : 1, overflowY: 'auto', padding: activeTab === 'logs' ? '0px' : '20px', display: 'flex', flexDirection: 'column', gap: '20px' }
    },
      /* ========================================== */
      /* TAB 2: CALENDAR & POLLS SETTINGS           */
      /* ========================================== */
      activeTab === 'settings' && /*#__PURE__*/React.createElement(React.Fragment, null,
        /* Grid split: Left is Calendar settings, Right is Poll management */
        /*#__PURE__*/React.createElement("div", {
          style: { display: 'flex', gap: '20px', flexDirection: 'column' }
        },
          /* Section 1: Calendar Profile & Participants */
          /*#__PURE__*/React.createElement("div", {
            style: { border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '16px', backgroundColor: 'var(--bg-card)' }
          },
            /*#__PURE__*/React.createElement("h4", { style: { fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 14px 0', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' } }, /*#__PURE__*/React.createElement(SettingsIcon, null), "프로필 설정"),

            /* Input: Title */
            /*#__PURE__*/React.createElement("div", { style: { marginBottom: '10px' } },
              /*#__PURE__*/React.createElement("label", { style: { display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' } }, "캘린더명"),
              /*#__PURE__*/React.createElement("input", {
                type: "text", className: "form-input", style: { width: '100%' },
                value: title, disabled: isSubmitting, maxLength: 80,
                onChange: e => setTitle(e.target.value)
              })
            ),

            /* Input: Description */
            /*#__PURE__*/React.createElement("div", { style: { marginBottom: '14px' } },
              /*#__PURE__*/React.createElement("label", { style: { display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' } }, "캘린더 설명"),
              /*#__PURE__*/React.createElement("input", {
                type: "text", className: "form-input", style: { width: '100%' },
                value: description, disabled: isSubmitting, maxLength: 160,
                onChange: e => setDescription(e.target.value)
              })
            ),

            /* Participant Management */
            /*#__PURE__*/React.createElement("div", {
              style: { borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }
            },
              /*#__PURE__*/React.createElement("label", { style: { display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' } }, `참여자 설정 (${participants.filter(p => !isTombstone(p)).length}명)`),

              /* Add Row */
              /*#__PURE__*/React.createElement("div", {
                style: { display: 'flex', gap: '8px', marginBottom: '12px' }
              },
                /*#__PURE__*/React.createElement("input", {
                  type: "text", className: "form-input", style: { flex: 1, minWidth: 0 },
                  placeholder: "새 참여자 이름", value: newName, disabled: isSubmitting, maxLength: 40,
                  ref: newNameInputRef, onChange: e => setNewName(e.target.value),
                  onKeyDown: e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (e.nativeEvent && e.nativeEvent.isComposing) return;
                      handleAddParticipant(e);
                    }
                  }
                }),
                /*#__PURE__*/React.createElement("button", {
                  type: "button", className: "btn btn-secondary", disabled: isSubmitting,
                  style: { whiteSpace: 'nowrap', height: '44px' },
                  onClick: handleAddParticipant
                }, "추가")
              ),

              /* List Row */
              /*#__PURE__*/React.createElement("div", {
                style: { display: 'flex', flexDirection: 'column', gap: '6px' }
              },
                participants.map(p => isTombstone(p) ? null : /*#__PURE__*/React.createElement("div", {
                  key: p.id,
                  style: { display: 'flex', alignItems: 'center', gap: '8px' }
                },
                  /* Color */
                  /*#__PURE__*/React.createElement(ColorSwatchPicker, {
                    value: p.color,
                    disabled: isSubmitting,
                    onChange: color => updateParticipant(p.id, { color }),
                    title: "참여자 색상"
                  }),
                  /* Name input */
                  /*#__PURE__*/React.createElement("input", {
                    type: "text", className: "form-input", style: { flex: 1, minWidth: 0, height: '30px', fontSize: '0.82rem' },
                    value: p.name, disabled: isSubmitting, maxLength: 40,
                    onInput: e => updateParticipant(p.id, { name: e.target.value }),
                    onChange: e => updateParticipant(p.id, { name: e.target.value })
                  }),
                  /* Remove button */
                  /*#__PURE__*/React.createElement("button", {
                    type: "button", className: "btn btn-danger", disabled: isSubmitting, title: "삭제",
                    style: { width: '30px', height: '30px', padding: 0, flexShrink: 0 },
                    onClick: () => onRequestConfirm('참여자 삭제', `"${p.name}" 참여자를 삭제하시겠습니까?`, () => updateParticipant(p.id, { removedAt: Date.now() }))
                  }, /*#__PURE__*/React.createElement(TrashIcon, { size: 16 }))
                ))
              )
            ),

            /* Save Button for Settings */
            /*#__PURE__*/React.createElement("button", {
              type: "button", className: "btn btn-primary", disabled: isSubmitting,
              onClick: handleSubmitSettings,
              style: { marginTop: '16px', width: '100%', height: '44px', fontWeight: 'bold' }
            }, isSubmitting ? "저장 중..." : "설정 저장")
          ),

          /* Section 2: Polls Creation & List */
          /*#__PURE__*/React.createElement("div", {
            style: { border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '16px', backgroundColor: 'var(--bg-card)' }
          },
            /* Header */
            /*#__PURE__*/React.createElement("div", {
              style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '6px' }
            },
              /*#__PURE__*/React.createElement("h4", { style: { fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' } }, /*#__PURE__*/React.createElement(PollSectionIcon, null), "투표 설정"),
              /*#__PURE__*/React.createElement("button", {
                type: "button",
                className: "btn btn-poll-create",
                onClick: () => { setEditingPoll(null); setIsPollModalOpen(true); }
              }, "+ 새 투표")
            ),

            /* Poll list container */
            /*#__PURE__*/React.createElement("div", {
              style: { display: 'flex', flexDirection: 'column', gap: '8px' }
            },
              getCalendarPolls(calendar).length === 0 ? /*#__PURE__*/React.createElement("div", { style: { padding: '16px', color: '#94A3B8', fontSize: '0.8rem', textAlign: 'center' } }, "현재 등록된 투표가 없습니다. 새 투표를 생성해 주세요.") :
              getCalendarPolls(calendar).map(poll => /*#__PURE__*/React.createElement("div", {
                key: poll.id,
                className: 'admin-log-row poll-list-row settings-poll-row',
                style: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px 8px', borderRadius: 'var(--radius-md)', padding: '10px 12px' }
              },
                /* Left info */
                /*#__PURE__*/React.createElement("div", { className: "admin-poll-row-main", style: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '2px', minWidth: 0, flex: '1 1 160px' } },
                  /*#__PURE__*/React.createElement("span", { style: { fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-main)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' } }, poll.title),
                  /*#__PURE__*/React.createElement("span", { style: { fontSize: '0.72rem', color: '#64748B' } }, `${getActivePollOptions(poll).length}개 옵션 · 총 ${getPollTotalVoteCount(poll)}표${poll.deadline ? ` · 마감 ${formatPollDeadline(poll.deadline)}${isPollClosed(poll) ? ' (마감됨)' : ''}` : ''}`)
                ),
                /* Right actions */
                /*#__PURE__*/React.createElement("div", { className: "admin-poll-row-actions", style: { display: 'flex', gap: '6px' } },
                  /* Edit button */
                  /*#__PURE__*/React.createElement("button", {
                    type: "button",
                    onClick: () => { setEditingPoll(poll); setIsPollModalOpen(true); },
                    style: {
                      backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '6px',
                      padding: '4px 10px', fontSize: '0.75rem', cursor: 'pointer', color: 'var(--text-main)'
                    }
                  }, "수정"),
                  /* Delete button */
                  /*#__PURE__*/React.createElement("button", {
                    type: "button",
                    className: "btn btn-danger",
                    title: "삭제",
                    onClick: () => handleDeletePollFromAdmin(poll),
                    style: { width: '30px', height: '30px', padding: 0, flexShrink: 0 }
                  }, /*#__PURE__*/React.createElement(TrashIcon, { size: 16 }))
                )
              ))
            )
          )
        )
      ),

      /* ========================================== */
      /* TAB 3: POINT-IN-TIME LOG RECOVERY         */
      /* ========================================== */
      activeTab === 'anniversary' && /*#__PURE__*/React.createElement("div", {
        style: { display: 'flex', flexDirection: 'column', gap: '0', margin: '-20px', minHeight: '320px' }
      },
        AnniversaryModal
          ? /*#__PURE__*/React.createElement(AnniversaryModal, {
              calendar: calendar,
              anniversaries: anniversaries || [],
              embedded: true,
              onClose: () => {},
              showToast: showToast,
              onRequestConfirm: onRequestConfirm,
              onBulkRegister: onBulkRegister,
              isDarkTheme: isDarkTheme
            })
          : /*#__PURE__*/React.createElement("div", { style: { padding: '20px', color: 'var(--text-muted)' } }, "기념일 모듈을 불러올 수 없습니다.")
      ),

      activeTab === 'recovery' && /*#__PURE__*/React.createElement(React.Fragment, null,
        /* Info alert */
        /*#__PURE__*/React.createElement("div", {
          style: { backgroundColor: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: 'var(--radius-md)', padding: '12px 14px', color: '#92400E', fontSize: '0.8rem', lineHeight: '1.5' }
        },
          /*#__PURE__*/React.createElement("span", { style: { fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '4px', verticalAlign: 'middle' } }, /*#__PURE__*/React.createElement(AlertTriangleIcon, null), "데이터 유실 방지 경고: "),
          "특정 시점으로 데이터를 복구(롤백)하면, 그 시점 이후에 수행된 모든 일정 등록 및 변경 사항과 투표 기록이 되돌아갑니다. 복구하기 전 현재 상태의 백업이 필요하다면 백업 저장 기능을 이용해 주세요."
        ),

        /*#__PURE__*/React.createElement("button", {
          type: "button",
          className: "btn btn-secondary",
          style: { width: '100%', justifyContent: 'center', padding: '24px' },
          onClick: () => {
            if (getTrulyConfirmedMeetings(calendar).length === 0) {
              if (showToast) showToast('확정된 모임이 없습니다', 'error');
              return;
            }
            exportCalendarConfirmedMeetingsToICS(calendar);
          }
        }, /*#__PURE__*/React.createElement(CalendarExportIcon, null), "캘린더 내보내기 (.ics)"),

        /* Log Timeline */
        /*#__PURE__*/React.createElement("div", {
          style: { border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '16px', backgroundColor: 'var(--bg-card)', display: 'flex', flexDirection: 'column' }
        },
          /*#__PURE__*/React.createElement("h4", { style: { fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '6px' } }, /*#__PURE__*/React.createElement(HourglassIcon, null), "시점복구"),

          /* Timeline scroll container */
          /*#__PURE__*/React.createElement("div", {
            style: { display: 'flex', flexDirection: 'column', gap: '8px', minHeight: '360px', paddingRight: '4px' }
          },
            activityLogsSorted.length === 0 ? /*#__PURE__*/React.createElement("div", { style: { padding: '30px', color: '#94A3B8', fontSize: '0.82rem', textAlign: 'center' } }, "기록된 활동 로그가 없어 복구 기능을 이용할 수 없습니다.") :
            activityLogsSorted.map(log => {
              const p = participantsMap[log.participantId] || {
                name: EXPENSE_ACTIVITY_ACTIONS.includes(log.action) && !log.participantId ? '정산' :
                      IMAGE_TAG_ACTIVITY_ACTIONS.includes(log.action) && !log.participantId ? '태그' :
                      POLL_ACTIVITY_ACTIONS.includes(log.action) && !log.participantId ? '투표' :
                      PLACE_ACTIVITY_ACTIONS.includes(log.action) && !log.participantId ? '장소' :
                      MEETING_ACTIVITY_ACTIONS.includes(log.action) && !log.participantId ? '정산' : '알수없음',
                color: '#94A3B8'
              };
              const actionLabel = {
                create: '일정 추가', update: '일정 변경', delete: '일정 삭제',
                poll_create: '투표 생성', poll_vote: '투표 진행', poll_cancel: '투표 취소',
                expense_create: '지출/수입 등록', expense_update: '지출/수입 수정', expense_delete: '지출/수입 삭제',
                tag_add: '사진 태그 추가', tag_remove: '사진 태그 삭제',
                meeting_confirm: '모임 확정', meeting_cancel: '모임 확정 취소',
                memo_create: '메모 추가', memo_update: '메모 변경', memo_delete: '메모 삭제',
                place_create: '장소 등록', place_update: '장소 수정', place_delete: '장소 삭제'
              }[log.action] || '활동';

              const actionBadgeColor = {
                create: '#10B981', update: '#2563EB', delete: '#EF4444',
                poll_create: '#8B5CF6', poll_vote: '#EC4899', poll_cancel: '#F97316',
                expense_create: '#F59E0B', expense_update: '#F59E0B', expense_delete: '#DC2626',
                tag_add: '#6366F1', tag_remove: '#DC2626',
                meeting_confirm: '#8B5CF6', meeting_cancel: '#EF4444',
                memo_create: '#6366F1', memo_update: '#F59E0B', memo_delete: '#EF4444',
                place_create: '#10B981', place_update: '#2563EB', place_delete: '#EF4444'
              }[log.action] || '#64748B';
              // A translucent tint of the badge's own color (instead of a fixed pastel hex)
              // stays readable on both light and dark modal backgrounds -- a solid light pastel
              // like #EFF6FF would look washed-out/too-bright against the dark theme's card bg.
              const actionBadgeBg = `${actionBadgeColor}1F`;

              // On PC, this lines up on a single row exactly like the 로그 tab's rows do (reusing
              // the same recent-log-row/left/right classes): badge/user/description on the far
              // left, registered-at timestamp + restore button on the far right. Below 640px the
              // shared media query stacks it into a column automatically.
              return /*#__PURE__*/React.createElement("div", {
                key: log.id,
                className: "recent-log-row",
                style: { cursor: 'pointer' },
                onClick: () => handleTimelineRowClick(log)
              },
                /* Left: action badge + user + description */
                /*#__PURE__*/React.createElement("div", { className: "recent-log-left" },
                  /* Action Badge */
                  /*#__PURE__*/React.createElement("span", {
                    style: {
                      fontSize: '0.68rem', fontWeight: 'bold', padding: '2px 6px', borderRadius: '4px',
                      backgroundColor: actionBadgeBg, color: actionBadgeColor, border: `1px solid ${actionBadgeColor}30`,
                      whiteSpace: 'nowrap'
                    }
                  }, actionLabel),
                  /* User */
                  /*#__PURE__*/React.createElement("span", {
                    style: { backgroundColor: p.color, color: getContrastTextColor(p.color), padding: '2px 8px', borderRadius: 'var(--radius-full)', fontSize: '0.7rem', fontWeight: 'bold', whiteSpace: 'nowrap' }
                  }, p.name),
                  log.date && /*#__PURE__*/React.createElement("span", {
                    className: "recent-log-date",
                    style: { fontSize: '0.78rem' }
                  }, formatShortDateWithDayName(log.date)),
                  /* Description text, wrapped rather than truncated */
                  log.note && /*#__PURE__*/React.createElement("span", {
                    className: "recent-log-note",
                    style: { fontSize: '0.78rem' }
                  }, log.note)
                ),
                /* Right: registered-at timestamp + rollback button */
                /*#__PURE__*/React.createElement("div", { className: "recent-log-right recovery-restore-footer" },
                  /*#__PURE__*/React.createElement("span", { className: "registered-at-text recent-log-time" }, formatRegisteredAt(log.timestamp)),
                  /*#__PURE__*/React.createElement("button", {
                    type: "button",
                    onClick: (e) => { e.stopPropagation(); handleRestoreToLog(log); },
                    className: "recovery-restore-btn",
                    style: {
                      backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '6px',
                      padding: '6px 10px', fontSize: '0.72rem', fontWeight: 'bold', cursor: 'pointer', color: 'var(--accent-primary)', whiteSpace: 'nowrap'
                    }
                  }, "이 시점으로 복구")
                )
              );
            })
          )
        )
      )
    ),

    /* ========================================== */
    /* TAB 4: CHAT/SCHEDULE ACTIVITY LOG LIST       */
    /* ========================================== */
    activeTab === 'logs' && /*#__PURE__*/React.createElement("div", {
      style: { flex: 1, minHeight: 0, overflowY: 'auto', overscrollBehavior: 'contain', WebkitOverflowScrolling: 'touch', padding: '16px' }
    },
      /*#__PURE__*/React.createElement("div", {
        style: { display: 'flex', flexDirection: 'column', gap: '10px' }
      },
        (() => {
          const actionLabels = {
            create: '등록',
            update: '수정',
            delete: '삭제',
            poll_create: '투표 생성',
            poll_vote: '투표',
            poll_cancel: '투표 취소',
            expense_create: '지출/수입 등록',
            expense_update: '지출/수입 수정',
            expense_delete: '지출/수입 삭제',
            tag_add: '사진 태그 추가',
            tag_remove: '사진 태그 삭제',
            meeting_confirm: '모임 확정',
            meeting_cancel: '모임 확정 취소',
            memo_create: '메모 추가',
            memo_update: '메모 변경',
            memo_delete: '메모 삭제',
            place_create: '장소 등록',
            place_update: '장소 수정',
            place_delete: '장소 삭제'
          };
          const actionColors = {
            create: '#2563EB',
            update: '#7C3AED',
            delete: '#DC2626',
            poll_create: '#0F172A',
            poll_vote: '#2563EB',
            poll_cancel: '#DC2626',
            expense_create: '#B45309',
            expense_update: '#B45309',
            expense_delete: '#C2410C',
            tag_add: '#4338CA',
            tag_remove: '#B91C1C',
            meeting_confirm: '#7E22CE',
            meeting_cancel: '#B91C1C',
            memo_create: '#4338CA',
            memo_update: '#B45309',
            memo_delete: '#B91C1C',
            place_create: '#2563EB',
            place_update: '#7C3AED',
            place_delete: '#DC2626'
          };
          const logs = buildActivityLogsFromAvailabilities(calendar || {});
          if (logs.length === 0) {
            return /*#__PURE__*/React.createElement("div", {
              style: { textAlign: 'center', color: '#94A3B8', fontSize: '0.85rem', padding: '24px 0' }
            }, "기록된 일정 로그가 없습니다.");
          }
          return /*#__PURE__*/React.createElement("div", {
            className: "recent-log-list",
            style: { display: 'flex', flexDirection: 'column', gap: '8px' }
          }, logs.map(log => {
            const participant = participantsMap[log.participantId] || {
              name: EXPENSE_ACTIVITY_ACTIONS.includes(log.action) && !log.participantId ? '정산' :
                    IMAGE_TAG_ACTIVITY_ACTIONS.includes(log.action) && !log.participantId ? '태그' :
                    POLL_ACTIVITY_ACTIONS.includes(log.action) && !log.participantId ? '투표' :
                    PLACE_ACTIVITY_ACTIONS.includes(log.action) && !log.participantId ? '장소' :
                    MEETING_ACTIVITY_ACTIONS.includes(log.action) && !log.participantId ? '정산' : '알 수 없음',
              color: '#94A3B8'
            };
            const actionLabel = actionLabels[log.action] || '기록';
            const actionColor = actionColors[log.action] || '#64748B';
            const noteText = sanitizeText(log.note || '', 120);
            const logDateText = log.date ? formatShortDateWithDayName(log.date) : '';
            const logTitleText = [participant.name, `[${actionLabel}]`, logDateText].filter(Boolean).join(' ');
            const confirmText = `${logTitleText} 로그 데이터를 삭제하시겠습니까?`;
            return /*#__PURE__*/React.createElement("div", {
              key: log.id,
              className: "recent-log-row",
              style: { cursor: 'pointer' },
              onClick: () => handleTimelineRowClick(log)
            }, /*#__PURE__*/React.createElement("div", {
              className: "recent-log-left"
            }, /*#__PURE__*/React.createElement("span", {
              className: "participant-badge",
              style: {
                backgroundColor: participant.color,
                color: getContrastTextColor(participant.color),
                fontSize: '0.72rem',
                padding: '2px 8px'
              }
            }, participant.name), /*#__PURE__*/React.createElement("span", {
              className: "recent-log-action",
              style: { color: actionColor, fontWeight: 'bold', fontSize: '0.75rem' }
            }, "[", actionLabel, "]"), /*#__PURE__*/React.createElement("span", {
              className: "recent-log-date",
              style: { fontSize: '0.78rem', color: '#475569' }
            }, logDateText || null), noteText && /*#__PURE__*/React.createElement("span", {
              className: "recent-log-note",
              style: { fontSize: '0.78rem', color: '#64748B', fontStyle: 'italic' }
            }, "\"", noteText, "\"")), /*#__PURE__*/React.createElement("div", {
              className: "recent-log-right"
            }, /*#__PURE__*/React.createElement("span", {
              className: "registered-at-text recent-log-time"
            }, formatRegisteredAt(log.timestamp)), /*#__PURE__*/React.createElement("button", {
              type: "button",
              className: "btn btn-danger",
              title: "로그 삭제",
              style: { width: '30px', height: '30px', padding: 0, flexShrink: 0 },
              onClick: (e) => {
                e.stopPropagation();
                if (typeof onDeleteLog !== 'function') return;
                onRequestConfirm('로그 삭제', confirmText, () => onDeleteLog(log));
              }
            }, /*#__PURE__*/React.createElement(TrashIcon, { size: 16 }))));
          }));
        })()
      )
    ),

    /* ========================================== */
    /* TAB 5: CALENDAR-BASED SCHEDULE DELETION      */
    /* ========================================== */
    /* Inner PollModal to Edit/Create Polls */
    (() => {
      const PollComp = PollModal || (typeof window !== 'undefined' && window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.PollModal) || (typeof window !== 'undefined' && window.GATHER_UI_DEPS && window.GATHER_UI_DEPS.PollModal);
      return isPollModalOpen && PollComp ? /*#__PURE__*/React.createElement(PollComp, {
        calendar: calendar,
        poll: editingPoll,
        onRequestConfirm: onRequestConfirm,
        onSave: handleSavePollFromAdmin,
        onClose: () => {
          setIsPollModalOpen(false);
          setEditingPoll(null);
        },
        showToast: showToast
      }) : null;
    })()
  ));
}

export function AdminUnifiedSearchResultsView({
  query, calendarsList, messagesMap, memosMap,
  calFilter = 'all', dateStart = '', dateEnd = '',
  onCalFilterChange, onDateStartChange, onDateEndChange,
  onBack
}) {
  const React = window.React;
  const __deps = window.GATHER_UI_DEPS || {};
  const __comp = window.GATHER_UI_COMPONENTS || {};
  const BackArrowIcon = __comp.BackArrowIcon || __deps.BackArrowIcon;
  const CalendarSearchIcon = __comp.CalendarSearchIcon || __deps.CalendarSearchIcon;
  const DeadlineDateTimePicker = __comp.DeadlineDateTimePicker || __deps.DeadlineDateTimePicker;
  const SearchCategoryTabs = __comp.SearchCategoryTabs || __deps.SearchCategoryTabs;
  const SearchResultLogRow = __comp.SearchResultLogRow || __deps.SearchResultLogRow;
  const SimpleBottomSheetPicker = __comp.SimpleBottomSheetPicker || __deps.SimpleBottomSheetPicker;

  const q = (query || '').trim().toLowerCase();
  const [isFilterPanelOpen, setIsFilterPanelOpen] = React.useState(true);

  const searchCalendarOptions = React.useMemo(() => {
    const priority = new Map([['kkot', 1], ['cw', 2], ['jhair', 3]]);
    const known = [...(calendarsList || [])].sort((a, b) => {
      const ai = priority.get(a.id) || 99;
      const bi = priority.get(b.id) || 99;
      if (ai !== bi) return ai - bi;
      return (a.title || a.id).localeCompare(b.title || b.id, 'ko');
    });
    return [
      { value: 'all', label: '통합 캘린더' },
      ...known.map(cal => ({ value: cal.id, label: cal.title || cal.id }))
    ];
  }, [calendarsList]);

  const filteredCalendarsList = React.useMemo(() => (
    calFilter === 'all' ? (calendarsList || []) : (calendarsList || []).filter(cal => cal.id === calFilter)
  ), [calendarsList, calFilter]);

  // Timestamp fields (채팅/태그/메모) need epoch bounds derived from the picked YYYY-MM-DD dates;
  // date-string fields (일정/정산) compare directly since ISO YYYY-MM-DD sorts lexicographically.
  const dateRangeMs = React.useMemo(() => ({
    startMs: dateStart ? new Date(`${dateStart}T00:00:00`).getTime() : -Infinity,
    endMs: dateEnd ? new Date(`${dateEnd}T23:59:59.999`).getTime() : Infinity
  }), [dateStart, dateEnd]);

  // Every calendar's matches, tagged with which calendar they came from (results are grouped by
  // category tab now, not by calendar, so each row needs its own calendar label).
  const allMatches = React.useMemo(() => {
    if (!q) return { schedules: [], chat: [], tags: [], expenses: [], memos: [] };
    const merged = { schedules: [], chat: [], tags: [], expenses: [], memos: [] };
    filteredCalendarsList.forEach(cal => {
      const calLabel = cal.title || cal.id;
      const perCal = computeCalendarSearchMatches(cal, messagesMap?.[cal.id], memosMap?.[cal.id], q, 20);
      Object.keys(merged).forEach(key => {
        perCal[key].forEach(item => merged[key].push({ ...item, calendarId: cal.id, calendarLabel: calLabel }));
      });
    });
    if (dateStart) {
      merged.schedules = merged.schedules.filter(item => item.date >= dateStart);
      merged.expenses = merged.expenses.filter(item => item.date >= dateStart);
    }
    if (dateEnd) {
      merged.schedules = merged.schedules.filter(item => item.date <= dateEnd);
      merged.expenses = merged.expenses.filter(item => item.date <= dateEnd);
    }
    if (dateStart || dateEnd) {
      merged.chat = merged.chat.filter(item => item.timestamp >= dateRangeMs.startMs && item.timestamp <= dateRangeMs.endMs);
      merged.tags = merged.tags.filter(item => item.timestamp >= dateRangeMs.startMs && item.timestamp <= dateRangeMs.endMs);
      merged.memos = merged.memos.filter(item => item.createdAt >= dateRangeMs.startMs && item.createdAt <= dateRangeMs.endMs);
    }
    merged.schedules.sort((a, b) => b.date.localeCompare(a.date) || (b.updatedAt || 0) - (a.updatedAt || 0));
    merged.chat.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    merged.tags.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    merged.expenses.sort((a, b) => b.date.localeCompare(a.date) || (b.createdAt || 0) - (a.createdAt || 0));
    merged.memos.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    return merged;
  }, [q, filteredCalendarsList, messagesMap, memosMap, dateStart, dateEnd, dateRangeMs]);

  const calendarCount = React.useMemo(() => {
    if (!q) return 0;
    const ids = new Set();
    Object.values(allMatches).forEach(list => list.forEach(item => ids.add(item.calendarId)));
    return ids.size;
  }, [q, allMatches]);

  const grandTotal = Object.values(allMatches).reduce((sum, list) => sum + list.length, 0);

  const tabDefs = [
    { key: 'schedules', label: '일정', count: allMatches.schedules.length },
    { key: 'chat', label: '채팅', count: allMatches.chat.length },
    { key: 'tags', label: '태그', count: allMatches.tags.length },
    { key: 'expenses', label: '정산', count: allMatches.expenses.length },
    { key: 'memos', label: '메모', count: allMatches.memos.length }
  ];
  const [activeTab, setActiveTab] = React.useState('schedules');
  React.useEffect(() => {
    const current = tabDefs.find(t => t.key === activeTab);
    if (current && current.count > 0) return;
    const firstNonEmpty = tabDefs.find(t => t.count > 0);
    if (firstNonEmpty) setActiveTab(firstNonEmpty.key);
  }, [q, allMatches]);

  return /*#__PURE__*/React.createElement("div", {
    // admin-scope is what body:has(.admin-scope){padding:0} keys off of -- this view previously
    // rendered as an early return BEFORE AdminDashboard's own admin-scope wrapper, so that CSS
    // rule (and the dark-mode-lock rules that also key off .admin-scope) never matched here no
    // matter how many times the padding fix was reapplied. This class is the actual fix.
    className: "admin-scope",
    style: { backgroundColor: 'var(--bg-primary)', minHeight: '100vh', width: '100%', maxWidth: '100%', overflowX: 'hidden' }
  },
    /* Chat-room-header-style header: left back arrow, centered title, symmetric right spacer */
    /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: '56px', padding: '0 16px', borderBottom: '1px solid #E2E8F0',
        position: 'sticky', top: 0, backgroundColor: 'var(--bg-card)', zIndex: 5
      }
    },
      /*#__PURE__*/React.createElement("button", {
        type: "button", onClick: onBack, "aria-label": "뒤로가기",
        style: { background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', color: '#0F172A', padding: 0, flexShrink: 0 }
      }, /*#__PURE__*/React.createElement(BackArrowIcon, { size: 22 })),
      /*#__PURE__*/React.createElement("div", {
        style: { position: 'absolute', left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'baseline', whiteSpace: 'nowrap' }
      },
        /*#__PURE__*/React.createElement("span", { style: { fontWeight: 800, fontSize: '0.95rem', color: '#0F172A' } }, "통합 검색결과"),
        /*#__PURE__*/React.createElement("span", { style: { fontWeight: 500, marginLeft: '10px', fontSize: '0.78rem', color: '#64748B' } },
          `"${query}" · ${grandTotal}건 · 캘린더 ${calendarCount}개`
        )
      ),
      /*#__PURE__*/React.createElement("button", {
        type: "button", onClick: () => setIsFilterPanelOpen(prev => !prev),
        "aria-label": "검색 기간/캘린더 필터", title: "검색 기간/캘린더 필터",
        style: {
          background: 'none', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: '32px', height: '32px', padding: 0, color: (calFilter !== 'all' || dateStart || dateEnd) ? '#2563EB' : '#64748B', flexShrink: 0
        }
      }, /*#__PURE__*/React.createElement(CalendarSearchIcon, { size: 22 }))
    ),

    isFilterPanelOpen && /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px',
        padding: '12px 20px', borderBottom: '1px solid #E2E8F0', backgroundColor: '#F8FAFC'
      }
    },
      /*#__PURE__*/React.createElement("div", { style: { minWidth: '140px', flex: '1 1 140px' } },
        /*#__PURE__*/React.createElement(SimpleBottomSheetPicker, {
          title: "캘린더 선택",
          value: calFilter,
          options: searchCalendarOptions,
          onSelect: onCalFilterChange,
          placeholder: "통합 캘린더",
          className: "form-select admin-calendar-picker-btn",
          style: { minHeight: '44px' }
        })
      ),
      /*#__PURE__*/React.createElement("div", { style: { minWidth: '120px', flex: '1 1 120px' } },
        /*#__PURE__*/React.createElement(DeadlineDateTimePicker, {
          value: dateStart, onChange: onDateStartChange, dateOnly: true, placeholder: "시작일"
        })
      ),
      /*#__PURE__*/React.createElement("span", { style: { color: '#94A3B8', fontWeight: 700 } }, "~"),
      /*#__PURE__*/React.createElement("div", { style: { minWidth: '120px', flex: '1 1 120px' } },
        /*#__PURE__*/React.createElement(DeadlineDateTimePicker, {
          value: dateEnd, onChange: onDateEndChange, dateOnly: true, placeholder: "종료일"
        })
      ),
      (calFilter !== 'all' || dateStart || dateEnd) && /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: () => { onCalFilterChange('all'); onDateStartChange(''); onDateEndChange(''); },
        className: "btn btn-secondary",
        style: { height: '44px', boxSizing: 'border-box', padding: '0 12px', fontSize: '0.78rem', flexShrink: 0 }
      }, "초기화")
    ),

    /*#__PURE__*/React.createElement(SearchCategoryTabs, { tabs: tabDefs, activeKey: activeTab, onSelect: setActiveTab }),

    /*#__PURE__*/React.createElement("div", { style: { padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px' } },
      grandTotal === 0 ? /*#__PURE__*/React.createElement("div", {
        style: { textAlign: 'center', color: '#94A3B8', fontSize: '0.88rem', padding: '40px 0' }
      }, "검색 결과가 없습니다.") : null,

      activeTab === 'schedules' && allMatches.schedules.map(item => /*#__PURE__*/React.createElement(SearchResultLogRow, {
        key: `${item.calendarId}_${item.date}_${item.participantId}`,
        badgeName: item.participantName, badgeColor: item.participantColor,
        calendarLabel: item.calendarLabel, timeStr: formatDateWithDayName(item.date),
        onClick: () => window.open(getAdminSearchResultTargetUrl('schedules', item), '_blank', 'noopener')
      }, highlightKeyword(item.note || '', q))),

      activeTab === 'chat' && allMatches.chat.map(msg => /*#__PURE__*/React.createElement(SearchResultLogRow, {
        key: `${msg.calendarId}_${msg.id}`,
        badgeName: msg.participantName, badgeColor: msg.participantColor,
        calendarLabel: msg.calendarLabel, timeStr: formatLogTimestamp(msg.timestamp),
        onClick: () => window.open(getAdminSearchResultTargetUrl('chat', msg), '_blank', 'noopener')
      }, highlightKeyword(msg.text || '', q))),

      activeTab === 'tags' && /*#__PURE__*/React.createElement("div", {
        style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(88px, 100%), 1fr))', gap: '8px' }
      }, allMatches.tags.map((entry, idx) => /*#__PURE__*/React.createElement("button", {
        key: `${entry.calendarId}_${entry.messageId}_${entry.imageIndex}_${idx}`,
        type: "button",
        title: entry.tags,
        onClick: () => window.open(getAdminSearchResultTargetUrl('tags', entry), '_blank', 'noopener'),
        style: { padding: 0, border: 0, background: 'none', cursor: 'pointer', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '4px', font: 'inherit' }
      },
        /*#__PURE__*/React.createElement("img", { src: entry.thumb, loading: 'lazy', decoding: 'async', referrerPolicy: 'no-referrer', style: { width: '100%', aspectRatio: '1 / 1', objectFit: 'cover', borderRadius: '6px' } }),
        /*#__PURE__*/React.createElement("span", { style: { fontSize: '0.68rem', color: '#94A3B8', fontWeight: 700 } }, entry.calendarLabel),
        /*#__PURE__*/React.createElement("span", { style: { fontSize: '0.7rem', color: '#0F172A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, highlightKeyword(entry.tags || '', q))
      ))),

      activeTab === 'expenses' && allMatches.expenses.map(exp => /*#__PURE__*/React.createElement(SearchResultLogRow, {
        key: `${exp.calendarId}_${exp.id}`,
        badgeName: exp.categoryName, badgeColor: exp.categoryColor,
        calendarLabel: exp.calendarLabel, timeStr: formatDateWithDayName(exp.date),
        onClick: () => window.open(getAdminSearchResultTargetUrl('expenses', exp), '_blank', 'noopener')
      }, highlightKeyword(exp.label || exp.url || '', q), ' · ', /*#__PURE__*/React.createElement("span", {
        style: { fontWeight: 800, color: exp.amount < 0 ? '#16A34A' : '#DC2626' }
      }, `${exp.amount < 0 ? '+' : '-'}${Math.abs(Number(exp.amount)).toLocaleString()}원`))),

      activeTab === 'memos' && allMatches.memos.map(memo => /*#__PURE__*/React.createElement(SearchResultLogRow, {
        key: `${memo.calendarId}_${memo.id}`,
        badgeName: memo.participantName, badgeColor: memo.participantColor,
        calendarLabel: memo.calendarLabel, timeStr: formatLogTimestamp(memo.createdAt),
        onClick: () => window.open(getAdminSearchResultTargetUrl('memos', memo), '_blank', 'noopener')
      },
        memo.title && /*#__PURE__*/React.createElement("div", { style: { fontWeight: 500, marginBottom: '2px' } }, highlightKeyword(memo.title, q)),
        memo.text && /*#__PURE__*/React.createElement("div", { style: { fontSize: '0.7rem', color: '#94A3B8' } }, highlightKeyword(memo.text.length > 100 ? memo.text.slice(0, 100) + '...' : memo.text, q))
      ))
    )
  );
}

export function AdminCreateCalendarModal({ onCreate, onClose }) {
  const React = window.React;
  const __deps = window.GATHER_UI_DEPS || {};
  const __comp = window.GATHER_UI_COMPONENTS || {};

  const [id, setId] = React.useState('cal_' + Date.now().toString().slice(-4));
  const [title, setTitle] = React.useState('');
  const [error, setError] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    setError('');
    try {
      const result = await onCreate(id, title);
      if (result) setError(result);
    } finally {
      setIsSubmitting(false);
    }
  };

  return /*#__PURE__*/React.createElement("div", {
    className: "modal-overlay",
    onClick: onClose,
    style: { zIndex: 10000 }
  },
    /*#__PURE__*/React.createElement("form", {
      onSubmit: handleSubmit,
      onClick: e => e.stopPropagation(),
      className: "modal-container",
      style: { maxWidth: '360px', padding: '20px', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '12px' }
    },
      /*#__PURE__*/React.createElement("h3", { style: { fontSize: '1.05rem', fontWeight: 800, color: '#0F172A' } }, "+ 새 캘린더 생성"),
      /*#__PURE__*/React.createElement("div", null,
        /*#__PURE__*/React.createElement("label", { style: { display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#64748B', marginBottom: '4px' } }, "캘린더 ID (예: kkot, cw, trip)"),
        /*#__PURE__*/React.createElement("input", {
          type: "text", className: "form-input", style: { width: '100%' }, autoFocus: true,
          value: id, onChange: e => setId(e.target.value), disabled: isSubmitting
        })
      ),
      /*#__PURE__*/React.createElement("div", null,
        /*#__PURE__*/React.createElement("label", { style: { display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#64748B', marginBottom: '4px' } }, "캘린더 제목"),
        /*#__PURE__*/React.createElement("input", {
          type: "text", className: "form-input", style: { width: '100%' }, placeholder: `${id} 모임 캘린더`,
          value: title, onChange: e => setTitle(e.target.value), disabled: isSubmitting
        })
      ),
      error && /*#__PURE__*/React.createElement("div", { style: { color: '#DC2626', fontSize: '0.82rem' } }, error),
      /*#__PURE__*/React.createElement("div", { style: { display: 'flex', gap: '8px', marginTop: '4px' } },
        /*#__PURE__*/React.createElement("button", {
          type: "button", className: "btn btn-secondary", style: { flex: 1, height: '44px' },
          onClick: onClose, disabled: isSubmitting
        }, "취소"),
        /*#__PURE__*/React.createElement("button", {
          type: "submit", className: "btn btn-primary", style: { flex: 1, height: '44px' },
          disabled: isSubmitting
        }, isSubmitting ? '생성 중...' : '생성')
      )
    )
  );
}

export function AdminRestorePhraseModal({ onConfirm, onClose }) {
  const React = window.React;
  const __deps = window.GATHER_UI_DEPS || {};
  const __comp = window.GATHER_UI_COMPONENTS || {};

  const [phrase, setPhrase] = React.useState('');
  const [error, setError] = React.useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const result = onConfirm(phrase);
    if (result) setError(result);
  };

  return /*#__PURE__*/React.createElement("div", {
    className: "modal-overlay",
    onClick: onClose,
    style: { zIndex: 10000 }
  },
    /*#__PURE__*/React.createElement("form", {
      onSubmit: handleSubmit,
      onClick: e => e.stopPropagation(),
      className: "modal-container",
      style: { maxWidth: '380px', padding: '20px', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '12px' }
    },
      /*#__PURE__*/React.createElement("h3", { style: { fontSize: '1.05rem', fontWeight: 800, color: '#0F172A' } }, "운영 데이터 복구 확인"),
      /*#__PURE__*/React.createElement("p", { style: { fontSize: '0.85rem', color: '#475569', lineHeight: '1.5' } },
        '백업 JSON 복구는 현재 운영 데이터를 교체합니다. 계속하려면 아래에 "운영 데이터 복구"를 정확히 입력하세요.'
      ),
      /*#__PURE__*/React.createElement("input", {
        type: "text", className: "form-input", style: { width: '100%' }, autoFocus: true,
        value: phrase, onChange: e => setPhrase(e.target.value), placeholder: "운영 데이터 복구"
      }),
      error && /*#__PURE__*/React.createElement("div", { style: { color: '#DC2626', fontSize: '0.82rem' } }, error),
      /*#__PURE__*/React.createElement("div", { style: { display: 'flex', gap: '8px', marginTop: '4px' } },
        /*#__PURE__*/React.createElement("button", {
          type: "button", className: "btn btn-secondary", style: { flex: 1, height: '44px' }, onClick: onClose
        }, "취소"),
        /*#__PURE__*/React.createElement("button", {
          type: "submit", className: "btn btn-danger", style: { flex: 1, height: '44px' }
        }, "복구 진행")
      )
    )
  );
}

export function AdminUnifiedSearchModal({ onClose, onSearch }) {
  const React = window.React;
  const __deps = window.GATHER_UI_DEPS || {};
  const __comp = window.GATHER_UI_COMPONENTS || {};
  const ResizableModalContainer = __comp.ResizableModalContainer || __deps.ResizableModalContainer;
  const SearchIcon = __comp.SearchIcon || __deps.SearchIcon;
  const SmallXIcon = __comp.SmallXIcon || __deps.SmallXIcon;

  const [query, setQuery] = React.useState('');
  const inputRef = React.useRef(null);
  React.useEffect(() => { inputRef.current?.focus(); }, []);

  const submit = () => {
    const trimmed = query.trim();
    if (!trimmed) return;
    onSearch(trimmed);
  };

  return /*#__PURE__*/React.createElement("div", {
    className: "modal-overlay",
    onClick: onClose,
    style: { zIndex: 11000 }
  }, /*#__PURE__*/React.createElement(ResizableModalContainer, {
    className: "modal-container",
    onClick: e => e.stopPropagation(),
    style: { maxWidth: '440px' }
  },
    /*#__PURE__*/React.createElement("div", { className: "modal-header" },
      /*#__PURE__*/React.createElement("h3", { style: { fontSize: '1.1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' } },
        /*#__PURE__*/React.createElement(SearchIcon, null), "통합검색"
      ),
      /*#__PURE__*/React.createElement("button", {
        onClick: onClose,
        style: { background: 'none', border: 'none', color: '#64748B', fontSize: '1.2rem', cursor: 'pointer', display: 'flex', alignItems: 'center' }
      }, /*#__PURE__*/React.createElement(SmallXIcon, { size: 20 }))
    ),
    /*#__PURE__*/React.createElement("div", { className: "modal-body" },
      /*#__PURE__*/React.createElement("p", { style: { fontSize: '0.8rem', color: '#64748B', margin: '0 0 10px' } },
        "모든 캘린더의 일정, 대화, 투표, 사진 태그를 한번에 검색합니다."
      ),
      /*#__PURE__*/React.createElement("input", {
        ref: inputRef,
        type: "text",
        className: "form-input",
        style: { width: '100%' },
        placeholder: "검색어를 입력하세요...",
        value: query,
        onChange: e => setQuery(e.target.value),
        onKeyDown: e => { if (e.key === 'Enter') { e.preventDefault(); submit(); } }
      }),
      /*#__PURE__*/React.createElement("button", {
        type: "button",
        className: "btn btn-primary",
        style: { width: '100%', marginTop: '10px' },
        disabled: !query.trim(),
        onClick: submit
      }, "검색")
    )
  ));
}

  if (typeof window !== 'undefined') {
  window.GATHER_UI_COMPONENTS = Object.assign({}, window.GATHER_UI_COMPONENTS || {}, {
    AdminModal: AdminModal,
    AdminUnifiedSearchResultsView: AdminUnifiedSearchResultsView,
    AdminCreateCalendarModal: AdminCreateCalendarModal,
    AdminRestorePhraseModal: AdminRestorePhraseModal,
    AdminUnifiedSearchModal: AdminUnifiedSearchModal,
  });
}
