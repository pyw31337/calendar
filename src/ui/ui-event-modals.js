/**
 * Anniversary / Settlement / Poll modals (P4-18)
 */

import { calculateSettlementRows } from '../core/settlement-calculator.js';

/* P6 ESM classic-compat: free names that live scripts shared via global lexical scope */
const GATHER_APP_CALENDAR_DATA = window.GATHER_APP_CALENDAR_DATA || {};
const GATHER_APP_CHAT_DATA = window.GATHER_APP_CHAT_DATA || {};
const GATHER_APP_UTILS = window.GATHER_APP_UTILS || {};
const GATHER_APP_CONSTANTS = window.GATHER_APP_CONSTANTS || {};
const GATHER_APP_CONFIG = window.GATHER_APP_CONFIG || {};
function __gatherUiDeps() { return window.GATHER_UI_DEPS || {}; }
function maskSettlementAccountNumber(value) {
  return String(value || '').replace(/\d/g, '*');
}
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
function isSettlementEnabledCalendarId(...args) {
  const f = __gatherUiDeps().isSettlementEnabledCalendarId || (window.GATHER_APP_UTILS || {}).isSettlementEnabledCalendarId;
  return typeof f === 'function' ? f(...args) : true;
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
function writeSharedCollection(...args) {
  const f = __gatherUiDeps().writeCollectionDocumentWithFallback;
  return typeof f === 'function' ? f(...args) : null;
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


export function AnniversaryModal({
  calendar,
  anniversaries,
  onClose,
  showToast,
  onRequestConfirm,
  onBulkRegister,
  isDarkTheme,
  embedded = false
}) {
  const React = window.React;
  const __deps = window.GATHER_UI_DEPS || {};
  const __comp = window.GATHER_UI_COMPONENTS || {};
  const ParticipantBackdrop = __comp.ParticipantBackdrop || __deps.ParticipantBackdrop;
  const DeadlineDateTimePicker = __comp.DeadlineDateTimePicker || __deps.DeadlineDateTimePicker || (function () { return null; });
  const ResizableModalContainer = __comp.ResizableModalContainer || __deps.ResizableModalContainer || (function Shell(p) { return React.createElement('div', p, p.children); });
  const SegmentedToggle = __comp.SegmentedToggle || __deps.SegmentedToggle || (function Shell(p) { return React.createElement('div', p, p.children); });
  const SimpleBottomSheetPicker = __comp.SimpleBottomSheetPicker || __deps.SimpleBottomSheetPicker || ((props) => React.createElement('select', {
    value: props.value ?? '',
    onChange: event => props.onSelect?.(event.target.value),
    disabled: props.disabled,
    style: props.style
  }, (props.options || []).map(option => {
    const item = typeof option === 'object' ? option : { value: option, label: option };
    return React.createElement('option', { key: String(item.value), value: item.value }, item.label ?? item.value);
  })));
  const SmallXIcon = __comp.SmallXIcon || __deps.SmallXIcon || (function () { return '×'; });
  const getActiveParticipants = __deps.getActiveParticipants;
  const [activeTab, setActiveTab] = React.useState('list'); // 'list', 'add', 'bulk'
  const [editingId, setEditingId] = React.useState(null); // null when registering a new anniversary
  
  // Add Anniversary form states
  const [newTitle, setNewTitle] = React.useState('');
  const [newType, setNewType] = React.useState('yearly'); // 'yearly', 'dday'
  // Yearly options
  const [yearlyMonth, setYearlyMonth] = React.useState(() => new Date().getMonth() + 1);
  const [yearlyDay, setYearlyDay] = React.useState(() => new Date().getDate());
  const [isLunar, setIsLunar] = React.useState(false);
  const [isLeap, setIsLeap] = React.useState(false);
  // D-Day options
  const [targetDate, setTargetDate] = React.useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  });
  const [ddayMode, setDdayMode] = React.useState('countdown'); // 'countdown', 'milestone'

  // Migrated bulk register availability states
  const [bulkParticipantId, setBulkParticipantId] = React.useState('');
  const [isBulkParticipantSheetOpen, setIsBulkParticipantSheetOpen] = React.useState(false);
  const [bulkWeekday, setBulkWeekday] = React.useState(1);
  const [bulkNote, setBulkNote] = React.useState('');
  const [isBulkSubmitting, setIsBulkSubmitting] = React.useState(false);
  const [bulkStartDate, setBulkStartDate] = React.useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  });
  const [bulkEndDate, setBulkEndDate] = React.useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 56); // 8 weeks ahead
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });
  const anniversaryDirtySnapshot = () => JSON.stringify([
    newTitle,
    newType,
    yearlyMonth,
    yearlyDay,
    isLunar,
    isLeap,
    targetDate,
    ddayMode,
    bulkParticipantId,
    bulkWeekday,
    bulkNote,
    bulkStartDate,
    bulkEndDate
  ]);
  const { requestClose, overlayOnClick } = useModalDirtyGuard(
    onClose,
    onRequestConfirm,
    undefined,
    true,
    anniversaryDirtySnapshot,
    editingId || 'new'
  );

  const participants = getActiveParticipants(calendar);
  const bulkParticipant = participants.find(p => p.id === bulkParticipantId) || null;

  const handleEditClick = (ann) => {
    setEditingId(ann.id);
    setNewTitle(ann.title || '');
    setNewType(ann.type || 'yearly');
    if (ann.type === 'yearly') {
      const parts = (ann.date || `${new Date().getMonth() + 1}-${new Date().getDate()}`).split('-');
      setYearlyMonth(Number(parts[0]) || (new Date().getMonth() + 1));
      setYearlyDay(Number(parts[1]) || new Date().getDate());
      setIsLunar(!!ann.isLunar);
      setIsLeap(!!ann.isLeap);
    } else {
      setTargetDate(ann.targetDate || `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`);
      setDdayMode(ann.isCountDown ? 'countdown' : 'milestone');
    }
    setActiveTab('add');
  };

  const handleSaveAnniversary = async () => {
    if (!newTitle.trim()) {
      showToast('기념일 제목을 입력해 주세요.', 'error');
      return;
    }

    try {
      const stamp = Date.now();
      const anniversaryId = editingId || ('anniversary_' + stamp + '_' + Math.random().toString(36).slice(2, 8));
      const calendarId = calendar.id;

      const oldAnn = anniversaries.find(a => a.id === editingId);
      const createdAt = oldAnn ? (oldAnn.createdAt || stamp) : stamp;

      let annData = {
        id: anniversaryId,
        calendarId,
        title: newTitle.trim(),
        type: newType,
        createdAt: createdAt,
        updatedAt: stamp
      };

      if (newType === 'yearly') {
        annData.date = `${String(yearlyMonth).padStart(2, '0')}-${String(yearlyDay).padStart(2, '0')}`;
        annData.isLunar = isLunar;
        annData.isLeap = isLunar ? isLeap : false;
      } else {
        annData.targetDate = targetDate;
        annData.isCountDown = ddayMode === 'countdown';
      }

      const saved = await writeSharedCollection('anniversaries', calendarId, anniversaryId, annData, 'set', '기념일 저장');
      if (!saved?.success) throw new Error('Anniversary save failed');
      showToast(editingId ? '기념일이 수정되었습니다.' : '기념일이 등록되었습니다.', 'success');

      // Reset form
      setNewTitle('');
      setIsLunar(false);
      setIsLeap(false);
      setYearlyMonth(new Date().getMonth() + 1);
      setYearlyDay(new Date().getDate());
      setEditingId(null);
      setActiveTab('list');
    } catch (err) {
      console.error('Anniversary save error:', err);
      showToast('기념일 저장 실패', 'error');
    }
  };

  const handleDeleteAnniversary = (ann) => {
    onRequestConfirm('기념일 삭제', `"${ann.title}" 기념일을 삭제하시겠습니까?`, async () => {
      try {
        const calendarId = calendar.id;
        const annSnapshot = JSON.parse(JSON.stringify(ann));
        const deleted = await writeSharedCollection('anniversaries', calendarId, ann.id, null, 'delete', '기념일 삭제');
        if (!deleted?.success) throw new Error('Anniversary delete failed');
        showToast('기념일이 삭제되었습니다.', 'delete', 5000, async () => {
          try {
            const restored = await writeSharedCollection('anniversaries', calendarId, ann.id, annSnapshot, 'set', '기념일 복원');
            if (!restored?.success) throw new Error('Anniversary restore failed');
            showToast('기념일 삭제를 되돌렸습니다.', 'success', 3000);
          } catch (restoreErr) {
            console.error('Anniversary restore error:', restoreErr);
            showToast('기념일 복원 실패', 'error', 4000);
          }
        });
        if (editingId === ann.id) {
          setEditingId(null);
          setNewTitle('');
        }
      } catch (err) {
        console.error('Anniversary delete error:', err);
        showToast('기념일 삭제 실패', 'error');
      }
    });
  };

  const handleApplyBulkRegister = async () => {
    if (isBulkSubmitting || !onBulkRegister) return;
    if (!bulkParticipantId) {
      showToast('참여자를 선택해 주세요.', 'error');
      return;
    }
    const start = new Date(`${bulkStartDate}T00:00:00`);
    const end = new Date(`${bulkEndDate}T00:00:00`);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start > end) {
      showToast('시작일자가 종료일자보다 늦습니다.', 'error');
      return;
    }

    const dates = [];
    const cursor = new Date(start);
    const maxLimit = 104; // Hard cap
    while (cursor <= end && dates.length < maxLimit) {
      if (cursor.getDay() === bulkWeekday) {
        const y = cursor.getFullYear();
        const m = String(cursor.getMonth() + 1).padStart(2, '0');
        const d = String(cursor.getDate()).padStart(2, '0');
        dates.push(`${y}-${m}-${d}`);
      }
      cursor.setDate(cursor.getDate() + 1);
    }

    if (dates.length === 0) {
      showToast('선택한 기간 동안 해당 요일이 존재하지 않습니다.', 'error');
      return;
    }

    onRequestConfirm(
      '일괄 등록 확인',
      `총 ${dates.length}개의 요일 일정을 일괄 등록하시겠습니까?`,
      async () => {
        setIsBulkSubmitting(true);
        try {
          const successCount = await onBulkRegister(bulkParticipantId, dates, bulkNote);
          showToast(`${successCount}개의 반복 일정이 등록되었습니다.`, 'success');
          setBulkNote('');
          setActiveTab('list');
          onClose();
        } catch (err) {
          console.error('Bulk register error:', err);
          showToast('일괄 등록에 실패했습니다.', 'error');
        } finally {
          setIsBulkSubmitting(false);
        }
      }
    );
  };

  const getYearlyDisplay = (ann) => {
    const parts = (ann.date || '01-01').split('-');
    const m = Number(parts[0]) || 1;
    const d = Number(parts[1]) || 1;
    const label = `${m}월 ${d}일`;
    return ann.isLunar ? `음력 ${label}${ann.isLeap ? ' (윤달)' : ''}` : label;
  };

  const getDDayBadge = (ann) => {
    if (!ann.targetDate) return null;
    const target = new Date(`${ann.targetDate}T00:00:00`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const diffDays = Math.round((target - today) / (1000 * 60 * 60 * 24));

    if (ann.isCountDown) {
      if (diffDays === 0) return 'D-Day';
      if (diffDays > 0) return `D-${diffDays}`;
      return `D+${Math.abs(diffDays)}`;
    }
    const elapsed = Math.abs(diffDays) + 1;
    return `${elapsed}일째`;
  };

  const anniversaryPanelInner = /*#__PURE__*/React.createElement(React.Fragment, null,
    /* Modal Navigation Tabs */
    /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '6px',
        width: '100%',
        padding: '10px 12px 8px',
        boxSizing: 'border-box',
        flexShrink: 0
      }
    },
      [['list', '목록'], ['add', '등록'], ['bulk', '반복']].map(([id, label]) => /*#__PURE__*/React.createElement("button", {
        key: id,
        type: "button",
        onClick: () => {
          setActiveTab(id);
          if (id === 'add') {
            setEditingId(null);
            setNewTitle('');
            setIsLunar(false);
            setIsLeap(false);
            setNewType('yearly');
          }
        },
        style: {
          border: 'none',
          borderRadius: 'var(--radius-md)',
          padding: '7px 4px',
          background: activeTab === id ? 'var(--accent-primary)' : 'transparent',
          color: activeTab === id ? '#FFFFFF' : 'var(--text-muted)',
          fontWeight: 800,
          fontSize: '0.8rem',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '4px'
        }
      }, label))
    ),
    /*#__PURE__*/React.createElement("div", {
      className: "anniversary-subtab-divider",
      style: {
        height: '1px',
        width: '100%',
        backgroundColor: 'var(--border-subtle)',
        flexShrink: 0
      }
    }),

    /* Modal Scrollable Body */

      /* Modal Body */
      /*#__PURE__*/React.createElement("div", { style: { padding: '16px', maxHeight: '65vh', overflowY: 'auto' } },
        /* TAB 1: List */
        activeTab === 'list' && /*#__PURE__*/React.createElement("div", {
          style: { display: 'flex', flexDirection: 'column', gap: '8px' }
        },
          anniversaries.length > 0 ? anniversaries.map(ann => /*#__PURE__*/React.createElement("div", {
            key: ann.id,
            style: {
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '10px 12px', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-primary)'
            }
          },
            /* Left info */
            /*#__PURE__*/React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 } },
              /*#__PURE__*/React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '6px' } },
                /*#__PURE__*/React.createElement("span", { style: { fontWeight: 800, fontSize: '0.86rem', color: 'var(--text-main)' } }, ann.title),
                /* Badge */
                /*#__PURE__*/React.createElement("span", {
                  style: {
                    fontSize: '0.68rem', padding: '1px 6px', borderRadius: '4px',
                    backgroundColor: ann.type === 'yearly' ? 'rgba(59,130,246,0.1)' : 'rgba(245,158,11,0.1)',
                    color: ann.type === 'yearly' ? '#3B82F6' : '#F59E0B',
                    fontWeight: 700
                  }
                }, ann.type === 'yearly' ? '매년 반복' : getDDayBadge(ann))
              ),
              /* Date details */
              /*#__PURE__*/React.createElement("span", { style: { fontSize: '0.72rem', color: 'var(--text-muted)' } },
                ann.type === 'yearly' ? getYearlyDisplay(ann) : `기준일: ${ann.targetDate}`
              )
            ),

            /* Action Buttons */
            /*#__PURE__*/React.createElement("div", { style: { display: 'flex', gap: '6px', flexShrink: 0 } },
              /* Edit button */
              /*#__PURE__*/React.createElement("button", {
                type: "button",
                onClick: () => handleEditClick(ann),
                style: {
                  background: 'none', border: '1px solid var(--border-subtle)', borderRadius: '6px',
                  padding: '4px 8px', fontSize: '0.72rem', color: 'var(--text-main)', cursor: 'pointer'
                }
              }, "수정"),
              /* Delete button */
              /*#__PURE__*/React.createElement("button", {
                type: "button",
                onClick: () => handleDeleteAnniversary(ann),
                style: {
                  background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '6px',
                  padding: '4px 8px', fontSize: '0.72rem', color: '#EF4444', cursor: 'pointer'
                }
              }, "삭제")
            )
          ))
          : /*#__PURE__*/React.createElement("div", {
            style: {
              textAlign: 'center', padding: '30px 10px', color: 'var(--text-muted)',
              fontSize: '0.82rem', lineHeight: '1.5'
            }
          }, "등록된 기념일이 없습니다. 매년 돌아오는 생일이나 D-Day를 등록해 보세요. 🎂")
        ),

        /* TAB 2: Register / Edit */
        activeTab === 'add' && /*#__PURE__*/React.createElement("div", {
          style: { display: 'flex', flexDirection: 'column', gap: '12px' }
        },
          /* Title Field */
          /*#__PURE__*/React.createElement("div", null,
            /*#__PURE__*/React.createElement("label", { style: { display: 'block', fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' } }, "기념일 이름"),
            /*#__PURE__*/React.createElement("input", {
              type: "text",
              className: "form-input",
              style: { width: '100%' },
              placeholder: "예: 홍길동 생일, 커플 1주년",
              value: newTitle,
              onChange: e => setNewTitle(e.target.value),
              maxLength: 50
            })
          ),

          /* Type switcher */
          /*#__PURE__*/React.createElement("div", null,
            /*#__PURE__*/React.createElement("label", { style: { display: 'block', fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' } }, "종류"),
            /*#__PURE__*/React.createElement("div", { style: { display: 'flex', gap: '8px' } },
              [['yearly', '매년 특정일자 반복 (생일 등)'], ['dday', '기준일 D-Day (커플, 시험 등)']].map(([typeVal, label]) => /*#__PURE__*/React.createElement("label", {
                key: typeVal,
                className: "anniversary-type-option",
                style: {
                  flex: 1,
                  backgroundColor: newType === typeVal ? 'rgba(59,130,246,0.06)' : 'var(--bg-primary)',
                  border: '1px solid ' + (newType === typeVal ? '#3B82F6' : 'var(--border-subtle)'),
                  borderRadius: 'var(--radius-md)',
                  padding: '8px 10px',
                  fontSize: '0.76rem',
                  cursor: 'pointer',
                  fontWeight: newType === typeVal ? 'bold' : 'normal'
                }
              },
                /*#__PURE__*/React.createElement("input", {
                  type: "radio",
                  name: "annType",
                  value: typeVal,
                  checked: newType === typeVal,
                  onChange: () => setNewType(typeVal),
                  style: { margin: 0 }
                }),
                label
              ))
            )
          ),

          /* Cond 1: Yearly details fields */
          newType === 'yearly' && /*#__PURE__*/React.createElement("div", {
            style: { display: 'flex', flexDirection: 'column', gap: '10px', padding: '10px', border: '1px solid var(--border-subtle)', borderRadius: '10px', backgroundColor: 'var(--bg-primary)' }
          },
            /* Month / Day picker */
            /*#__PURE__*/React.createElement("div", null,
              /*#__PURE__*/React.createElement("label", { style: { display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '3px' } }, "월 / 일"),
              /*#__PURE__*/React.createElement(DeadlineDateTimePicker, {
                dateOnly: true,
                value: `${new Date().getFullYear()}-${String(yearlyMonth).padStart(2, '0')}-${String(yearlyDay).padStart(2, '0')}`,
                onChange: v => {
                  const [, mm, dd] = v.split('-');
                  setYearlyMonth(Number(mm));
                  setYearlyDay(Number(dd));
                }
              })
            ),
            /* Lunar / Leap month settings */
            /*#__PURE__*/React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '14px', marginTop: '4px', flexWrap: 'wrap' } },
              /* Solar/lunar toggle */
              /*#__PURE__*/React.createElement(SegmentedToggle, {
                ariaLabel: "양력/음력 전환",
                value: isLunar ? 'lunar' : 'solar',
                onChange: v => setIsLunar(v === 'lunar'),
                options: [{ value: 'solar', label: '양력' }, { value: 'lunar', label: '음력' }]
              }),
              /* Leap month toggle */
              isLunar && /*#__PURE__*/React.createElement("button", {
                type: "button",
                role: "switch",
                "aria-checked": isLeap,
                onClick: () => setIsLeap(!isLeap),
                style: {
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
                  padding: '12px 16px', border: '1px solid var(--border-subtle)', cursor: 'pointer',
                  borderRadius: 'var(--radius-sm)', fontSize: '0.78rem', fontWeight: isLeap ? 900 : 500,
                  whiteSpace: 'nowrap', backgroundColor: isLeap ? 'var(--accent-primary)' : 'transparent',
                  color: isLeap ? '#FFFFFF' : 'var(--text-muted)'
                }
              }, "윤달")
            )
          ),

          /* Cond 2: D-Day details fields */
          newType === 'dday' && /*#__PURE__*/React.createElement("div", {
            style: { display: 'flex', flexDirection: 'column', gap: '10px', padding: '10px', border: '1px solid var(--border-subtle)', borderRadius: '10px', backgroundColor: 'var(--bg-primary)' }
          },
            /* Target date picker */
            /*#__PURE__*/React.createElement("div", null,
              /*#__PURE__*/React.createElement("label", { style: { display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '3px' } }, "시작일자 / 기준일자"),
              /*#__PURE__*/React.createElement(DeadlineDateTimePicker, {
                value: `${targetDate}T00:00`,
                onChange: v => setTargetDate(v.slice(0, 10))
              })
            ),
            /* Mode Selector Radio */
            /*#__PURE__*/React.createElement("div", null,
              /*#__PURE__*/React.createElement("label", { style: { display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '3px' } }, "디데이 표기방식"),
              /*#__PURE__*/React.createElement("div", { style: { display: 'flex', gap: '8px' } },
                [['countdown', 'D-Day 카운트다운', '(D-100)'], ['milestone', '날짜수 자동경과', '(100일째)']].map(([modeVal, modeLabel, modeSub]) => /*#__PURE__*/React.createElement("label", {
                  key: modeVal,
                  className: "anniversary-type-option",
                  style: {
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    gap: '4px',
                    backgroundColor: ddayMode === modeVal ? 'rgba(59,130,246,0.06)' : 'var(--bg-primary)',
                    border: '1px solid ' + (ddayMode === modeVal ? '#3B82F6' : 'var(--border-subtle)'),
                    borderRadius: 'var(--radius-md)',
                    padding: '8px 6px',
                    fontSize: '0.76rem',
                    cursor: 'pointer',
                    fontWeight: ddayMode === modeVal ? 'bold' : 'normal'
                  }
                },
                  /*#__PURE__*/React.createElement("input", {
                    type: "radio",
                    name: "ddayMode",
                    value: modeVal,
                    checked: ddayMode === modeVal,
                    onChange: () => setDdayMode(modeVal),
                    style: { margin: 0 }
                  }),
                  /*#__PURE__*/React.createElement("span", { style: { lineHeight: '1.25' } }, modeLabel, /*#__PURE__*/React.createElement("br"), modeSub)
                ))
              )
            )
          ),

          /* Save Button */
          /*#__PURE__*/React.createElement("button", {
            type: "button",
            className: "btn btn-primary",
            onClick: handleSaveAnniversary,
            style: { width: '100%', justifyContent: 'center', padding: '10px', fontSize: '0.82rem', marginTop: '6px' }
          }, editingId ? "기념일 수정 완료" : "기념일 등록")
        ),

        /* TAB 3: Bulk Repeating Schedule Register */
        activeTab === 'bulk' && /*#__PURE__*/React.createElement("div", {
          style: { display: 'flex', flexDirection: 'column', gap: '12px' }
        },
          /* User instructions */
          /*#__PURE__*/React.createElement("div", { style: { fontSize: '0.76rem', color: 'var(--text-muted)', lineHeight: '1.45', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '6px' } },
            "매주 특정 요일에 반복되는 사용자의 스케줄을 한 번에 일괄 등록합니다."
          ),

          /* Participant & Weekday Select row */
          /*#__PURE__*/React.createElement("div", { style: { display: 'flex', gap: '8px', flexWrap: 'wrap' } },
            /* Participant picker */
            /*#__PURE__*/React.createElement("button", {
              type: "button",
              className: "form-select",
              disabled: isBulkSubmitting,
              style: {
                flex: '0 0 115px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                gap: '4px', textAlign: 'left', cursor: isBulkSubmitting ? 'default' : 'pointer', padding: '10px 8px'
              },
              onClick: () => { if (!isBulkSubmitting) setIsBulkParticipantSheetOpen(true); }
            },
              /*#__PURE__*/React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0, overflow: 'hidden' } },
                bulkParticipant && /*#__PURE__*/React.createElement("span", {
                  className: "form-select-color-indicator",
                  style: { backgroundColor: bulkParticipant.color }
                }),
                /*#__PURE__*/React.createElement("span", {
                  style: {
                    fontWeight: 700, color: bulkParticipant ? 'var(--text-main)' : 'var(--text-muted)',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.82rem'
                  }
                }, bulkParticipant ? bulkParticipant.name : '참여자')
              ),
              /*#__PURE__*/React.createElement("svg", {
                xmlns: "http://www.w3.org/2000/svg", width: "16", height: "16", viewBox: "0 0 24 24",
                fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round",
                className: "form-select-chevron", "aria-hidden": "true"
              }, /*#__PURE__*/React.createElement("path", { d: "M6 9l6 6l6 -6" }))
            ),
            /* Weekday picker */
            /*#__PURE__*/React.createElement(SimpleBottomSheetPicker, {
              title: "요일 선택",
              placeholder: "요일 선택",
              value: bulkWeekday,
              disabled: isBulkSubmitting,
              onSelect: v => setBulkWeekday(Number(v)),
              options: ['일', '월', '화', '수', '목', '금', '토'].map((label, idx) => ({
                value: idx, label: `매주 ${label}요일`, color: idx === 0 ? '#EF4444' : undefined
              })),
              style: { flex: '1 1 0', minWidth: '120px' }
            })
          ),

        /* Start / End dates selectors */
        /*#__PURE__*/React.createElement("div", { style: { display: 'flex', gap: '8px', flexWrap: 'wrap' } },
          /* Start */
          /*#__PURE__*/React.createElement("div", { style: { flex: '1 1 130px' } },
            /*#__PURE__*/React.createElement("label", { style: { display: 'block', fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' } }, "시작일자"),
            /*#__PURE__*/React.createElement(DeadlineDateTimePicker, {
              value: `${bulkStartDate}T00:00`,
              disabled: isBulkSubmitting,
              onChange: v => setBulkStartDate(v.slice(0, 10))
            })
          ),
          /* End */
          /*#__PURE__*/React.createElement("div", { style: { flex: '1 1 130px' } },
            /*#__PURE__*/React.createElement("label", { style: { display: 'block', fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' } }, "종료일자"),
            /*#__PURE__*/React.createElement(DeadlineDateTimePicker, {
              value: `${bulkEndDate}T00:00`,
              disabled: isBulkSubmitting,
              onChange: v => setBulkEndDate(v.slice(0, 10))
            })
          )
        ),

        /* Bulk Note */
        /*#__PURE__*/React.createElement("input", {
          type: "text",
          className: "form-input",
          placeholder: "반복 일정 메모 (선택, 최대 500자)",
          maxLength: 500,
          value: bulkNote,
          onChange: e => setBulkNote(e.target.value),
          disabled: isBulkSubmitting,
          style: { width: '100%', fontSize: '0.8rem' }
        }),

        /* Apply button */
        /*#__PURE__*/React.createElement("button", {
          type: "button",
          className: "btn btn-primary",
          onClick: handleApplyBulkRegister,
          disabled: isBulkSubmitting,
          style: { width: '100%', justifyContent: 'center', padding: '10px', fontSize: '0.82rem', marginTop: '4px' }
        }, isBulkSubmitting ? "등록 진행 중..." : "반복 일정 일괄 등록")
      )
    )
  );

  const portalContent = embedded
    ? /*#__PURE__*/React.createElement("div", {
        style: { display: 'flex', flexDirection: 'column', minHeight: 0, width: '100%' }
      }, anniversaryPanelInner)
    : /*#__PURE__*/React.createElement("div", {
        className: "modal-overlay",
        onClick: overlayOnClick,
        style: { zIndex: 11000 }
      }, /*#__PURE__*/React.createElement(ResizableModalContainer, {
        className: "modal-container",
        style: { maxWidth: '440px', width: '90%', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)' },
        onClick: e => e.stopPropagation()
      },
        /*#__PURE__*/React.createElement("div", {
          style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid var(--border-subtle)' }
        },
          /*#__PURE__*/React.createElement("span", {
            style: { fontSize: '0.96rem', fontWeight: '900', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }
          }, /*#__PURE__*/React.createElement("svg", {
            xmlns: "http://www.w3.org/2000/svg", width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round"
          }, /*#__PURE__*/React.createElement("path", { d: "M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8" }), /*#__PURE__*/React.createElement("path", { d: "M4 16s.5-1 2-1 2.5 2 4 2 2.5-2 4-2 2.5 2 4 2 2-1 2-1" }), /*#__PURE__*/React.createElement("path", { d: "M2 21h20" }), /*#__PURE__*/React.createElement("path", { d: "M7 8v3" }), /*#__PURE__*/React.createElement("path", { d: "M12 8v3" }), /*#__PURE__*/React.createElement("path", { d: "M17 8v3" }), /*#__PURE__*/React.createElement("path", { d: "M7 4h.01" }), /*#__PURE__*/React.createElement("path", { d: "M12 4h.01" }), /*#__PURE__*/React.createElement("path", { d: "M17 4h.01" })), "기념일 & 반복 일정 설정"),
          /*#__PURE__*/React.createElement("button", {
            type: "button", onClick: requestClose,
            style: { background: 'none', border: 'none', color: '#64748B', fontSize: '1.2rem', cursor: 'pointer', display: 'flex', alignItems: 'center' }
          }, /*#__PURE__*/React.createElement(SmallXIcon, { size: 20 }))
        ),
        anniversaryPanelInner
      ));

  // Bottom-sheet rule: never nest under ResizableModalContainer (CSS transform traps fixed) --
  // portaled as its own sibling rather than embedded inside portalContent's JSX tree.
  const bulkParticipantSheet = isBulkParticipantSheetOpen && /*#__PURE__*/React.createElement("div", {
    className: "bottom-sheet-overlay",
    onClick: () => setIsBulkParticipantSheetOpen(false)
  }, /*#__PURE__*/React.createElement("div", {
    className: "bottom-sheet",
    onClick: e => e.stopPropagation()
  },
    /*#__PURE__*/React.createElement("div", { className: "bottom-sheet-header" },
      /*#__PURE__*/React.createElement("h4", null, "참여자 선택"),
      /*#__PURE__*/React.createElement("button", {
        type: "button",
        style: { background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.2rem', cursor: 'pointer' },
        onClick: () => setIsBulkParticipantSheetOpen(false)
      }, "✕")
    ),
    /*#__PURE__*/React.createElement("div", { className: "bottom-sheet-body" },
      participants.map(p => /*#__PURE__*/React.createElement("button", {
        key: p.id,
        type: "button",
        className: "bottom-sheet-item",
        onClick: () => {
          setBulkParticipantId(p.id);
          setIsBulkParticipantSheetOpen(false);
        }
      }, ParticipantBackdrop ? /*#__PURE__*/React.createElement(ParticipantBackdrop, { participant: p, name: p.name, dotSize: 12 }) : /*#__PURE__*/React.createElement("span", { style: { display: 'inline-flex', alignItems: 'center', gap: '8px', color: p.color, fontWeight: 700 } }, /*#__PURE__*/React.createElement("span", { className: "color-dot", style: { backgroundColor: p.color, width: '12px', height: '12px' } }), p.name)))
    )
  ));

  return /*#__PURE__*/React.createElement(React.Fragment, null,
    embedded
      ? portalContent
      : (typeof document !== 'undefined' && ReactDOM.createPortal
        ? ReactDOM.createPortal(portalContent, document.body)
        : portalContent),
    bulkParticipantSheet && typeof document !== 'undefined' && ReactDOM.createPortal
      ? ReactDOM.createPortal(bulkParticipantSheet, document.body)
      : bulkParticipantSheet
  );
}

/* Bank account number formatting helper */
function isCarryoverSettlementItem(item) {
  const label = String(item?.label || item?.title || item?.note || '').toLowerCase();
  return label.includes('이월') || label.includes('전년이월') || label.includes('전월이월');
}

function orderSettlementItemsForDisplay(items) {
  return items.slice().sort((a, b) => Number(isCarryoverSettlementItem(a)) - Number(isCarryoverSettlementItem(b)));
}

function formatBankAccountNumber(bankName, value) {
  if (!value) return '';
  const digits = String(value).replace(/\D/g, '');
  if (!digits) return '';
  const bank = String(bankName || '').trim();

  if (bank.includes('신한')) {
    if (digits.length <= 3) return digits;
    if (digits.length <= 5) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5, 14)}`;
  }
  if (bank.includes('우리')) {
    if (digits.length <= 4) return digits;
    if (digits.length <= 7) return `${digits.slice(0, 4)}-${digits.slice(4)}`;
    return `${digits.slice(0, 4)}-${digits.slice(4, 7)}-${digits.slice(7, 14)}`;
  }
  if (bank.includes('국민') || bank.includes('KB')) {
    if (digits.length <= 6) return digits;
    if (digits.length <= 8) return `${digits.slice(0, 6)}-${digits.slice(6)}`;
    return `${digits.slice(0, 6)}-${digits.slice(6, 8)}-${digits.slice(8, 14)}`;
  }
  if (bank.includes('카카오뱅크')) {
    if (digits.length <= 4) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 4)}-${digits.slice(4)}`;
    return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 13)}`;
  }
  if (bank.includes('토스')) {
    if (digits.length <= 4) return digits;
    if (digits.length <= 8) return `${digits.slice(0, 4)}-${digits.slice(4)}`;
    return `${digits.slice(0, 4)}-${digits.slice(4, 8)}-${digits.slice(8, 12)}`;
  }
  if (bank.includes('농협') || bank.includes('NH')) {
    if (digits.length <= 3) return digits;
    if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    if (digits.length <= 11) return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 11)}-${digits.slice(11, 13)}`;
  }
  if (bank.includes('하나')) {
    if (digits.length <= 3) return digits;
    if (digits.length <= 9) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, 9)}-${digits.slice(9, 14)}`;
  }
  if (bank.includes('기업') || bank.includes('IBK')) {
    if (digits.length <= 3) return digits;
    if (digits.length <= 9) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    if (digits.length <= 11) return `${digits.slice(0, 3)}-${digits.slice(3, 9)}-${digits.slice(9)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, 9)}-${digits.slice(9, 11)}-${digits.slice(11, 14)}`;
  }

  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  if (digits.length <= 11) return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 11)}-${digits.slice(11, 14)}`;
}

export function CreateSettlementModal({ calendar, initialData, onClose, onSave, onDeleteCard, onToggleStatus, showToast }) {
  const React = window.React;
  const __deps = window.GATHER_UI_DEPS || {};
  const __comp = window.GATHER_UI_COMPONENTS || {};
  const ResizableModalContainer = __comp.ResizableModalContainer || __deps.ResizableModalContainer || ((props) => React.createElement('div', props, props.children));
  const SmallXIcon = __comp.SmallXIcon || __deps.SmallXIcon || (() => '×');
  const SimpleBottomSheetPicker = __comp.SimpleBottomSheetPicker || __deps.SimpleBottomSheetPicker || ((props) => React.createElement('select', {
    value: props.value ?? '',
    onChange: event => props.onSelect?.(event.target.value),
    disabled: props.disabled,
    style: props.style
  }, (props.options || []).map(option => {
    const item = typeof option === 'object' ? option : { value: option, label: option };
    return React.createElement('option', { key: String(item.value), value: item.value }, item.label ?? item.value);
  })));
  const TrashIcon = __comp.TrashIcon || __deps.TrashIcon || (() => '🗑');
  const PencilIcon = __comp.PencilIcon || __deps.PencilIcon || (() => '✎');
  const ParticipantBackdrop = __comp.ParticipantBackdrop || __deps.ParticipantBackdrop;
  const MainCalendarArrow = ({ direction }) => React.createElement('svg', {
    xmlns: 'http://www.w3.org/2000/svg', width: '20', height: '20', viewBox: '0 0 24 24',
    fill: 'none', stroke: 'currentColor', strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round',
    style: { transform: direction === 'left' ? 'rotate(90deg)' : 'rotate(-90deg)' }
  },
    React.createElement('path', { stroke: 'none', d: 'M0 0h24v24H0z', fill: 'none' }),
    React.createElement('path', { d: 'M6 9l6 6l6 -6' })
  );

  const cardToEdit = initialData || null;
  const isEditing = !!cardToEdit;

  const activeParticipants = getActiveParticipants(calendar);
  const participantOptions = React.useMemo(() => {
    if (!Array.isArray(activeParticipants) || activeParticipants.length === 0) return ['참여자'];
    return activeParticipants.map(p => typeof p === 'string' ? p : (p?.name || p?.id || '참여자')).filter(Boolean);
  }, [activeParticipants]);

  const participantPickerOptions = React.useMemo(() => {
    if (!Array.isArray(activeParticipants) || activeParticipants.length === 0) {
      return [{ value: '참여자', label: '참여자' }];
    }
    const defaultColors = ['#EF4444', '#F97316', 'var(--status-green)', '#3B82F6', '#6366F1', '#8B5CF6', '#EC4899', '#14B8A6'];
    return activeParticipants.map((p, idx) => {
      const name = typeof p === 'string' ? p : (p?.name || p?.id || '참여자');
      const color = (typeof p === 'object' && p?.color) ? p.color : defaultColors[idx % defaultColors.length];
      return { value: name, label: name, color: color };
    });
  }, [activeParticipants]);

  const BANK_OPTIONS = ['토스뱅크', '카카오뱅크', '신한은행', 'KB국민은행', 'NH농협은행', '우리은행', '하나은행', 'IBK기업은행', '카카오페이', '네이버페이', '기타'];
  const bankPickerOptions = React.useMemo(() => {
    return BANK_OPTIONS.map(b => ({ value: b, label: b }));
  }, [BANK_OPTIONS]);

  const today = new Date();
  const [title, setTitle] = React.useState(() => cardToEdit?.title || '1/N 간편 송금');

  const [participantRows, setParticipantRows] = React.useState(() => {
    if (Array.isArray(cardToEdit?.participantRows) && cardToEdit.participantRows.length > 0) {
      const seen = new Set();
      return cardToEdit.participantRows.filter(row => {
        const name = String(row?.participantId || '').trim();
        if (!name || seen.has(name)) return false;
        seen.add(name);
        return true;
      }).map(row => ({
        id: row.id || `pr_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        participantId: row.participantId,
        memo: String(row.memo || row.note || '').trim()
      }));
    }
    if (Array.isArray(cardToEdit?.participants) && cardToEdit.participants.length > 0) {
      const perAmt = cardToEdit.perPersonAmount || (cardToEdit.participants.length > 0 ? Math.round((cardToEdit.amount || 0) / cardToEdit.participants.length) : 0);
      const seen = new Set();
      return cardToEdit.participants.filter(pName => {
        const name = String(pName || '').trim();
        if (!name || seen.has(name)) return false;
        seen.add(name);
        return true;
      }).map((pName, idx) => ({
        id: `pr_${idx}_${Date.now()}`,
        participantId: pName,
        memo: '',
        amount: perAmt
      }));
    }
    const defaultP = participantOptions[0] || '참여자';
    return [{ id: `pr_0_${Date.now()}`, participantId: defaultP, amount: 0 }];
  });
  const [participantToAdd, setParticipantToAdd] = React.useState('');
  const [participantMemoInput, setParticipantMemoInput] = React.useState('');
  const [editingParticipantRowId, setEditingParticipantRowId] = React.useState(null);
  const [isSavingSettlementCard, setIsSavingSettlementCard] = React.useState(false);
  const availableParticipantPickerOptions = React.useMemo(() => {
    const selected = new Set(participantRows
      .filter(row => row?.id !== editingParticipantRowId)
      .map(row => row?.participantId)
      .filter(Boolean));
    return participantPickerOptions.filter(option => !selected.has(option.value));
  }, [participantPickerOptions, participantRows, editingParticipantRowId]);
  const participantPickerOptionsWithSelectionState = React.useMemo(() => {
    const selected = new Set(participantRows
      .filter(row => row?.id !== editingParticipantRowId)
      .map(row => row?.participantId)
      .filter(Boolean));
    return participantPickerOptions.map(option => ({ ...option, disabled: selected.has(option.value) }));
  }, [participantPickerOptions, participantRows, editingParticipantRowId]);
  React.useEffect(() => {
    const editingRow = participantRows.find(row => row?.id === editingParticipantRowId);
    const isCurrentEditingValue = Boolean(editingRow && participantToAdd === editingRow.participantId);
    if (participantToAdd && !isCurrentEditingValue && !availableParticipantPickerOptions.some(option => option.value === participantToAdd)) {
      setParticipantToAdd(availableParticipantPickerOptions[0]?.value || '');
    }
  }, [availableParticipantPickerOptions, participantRows, editingParticipantRowId, participantToAdd]);
  // 개인 지출은 캘린더 전체 참여자가 아니라, 이 정산 카드의 일반 탭에
  // 등록된 참여자만 선택할 수 있어야 한다. 일반 탭의 행이 단일 기준(source of truth)이다.
  const personalParticipantPickerOptions = React.useMemo(() => {
    const activeByName = new Map(activeParticipants.map((p, idx) => {
      const name = typeof p === 'string' ? p : (p?.name || p?.id || '참여자');
      return [name, { name, color: (typeof p === 'object' && p?.color) || ['#EF4444', '#F97316', 'var(--status-green)', '#3B82F6', '#6366F1'][idx % 5] }];
    }));
    const seen = new Set();
    const options = [];
    participantRows.forEach(row => {
      const name = String(row?.participantId || '').trim();
      if (!name || seen.has(name)) return;
      seen.add(name);
      const person = activeByName.get(name) || { name, color: '#3B82F6' };
      options.push({ value: name, label: name, color: person.color });
    });
    return options.length > 0 ? options : [{ value: '참여자', label: '참여자', color: '#3B82F6' }];
  }, [activeParticipants, participantRows]);

  const [bankName, setBankName] = React.useState(() => cardToEdit?.bankName || '토스뱅크');
  const [otherBankName, setOtherBankName] = React.useState(() => cardToEdit?.otherBankName || '');
  const [depositorName, setDepositorName] = React.useState(() => cardToEdit?.depositorName || '');
  const [accountNumber, setAccountNumber] = React.useState(() => cardToEdit?.accountNumber || '');
  const [activeTab, setActiveTab] = React.useState('general');
  const [isSettlementCardPreviewOpen, setIsSettlementCardPreviewOpen] = React.useState(false);
  const [settlementCardImageUrl, setSettlementCardImageUrl] = React.useState(null);
  const [expenseListHeight, setExpenseListHeight] = React.useState(160);
  const expenseResizeRef = React.useRef(null);

  const [personalExpenses, setPersonalExpenses] = React.useState(() => {
    if (Array.isArray(cardToEdit?.personalExpenses) && cardToEdit.personalExpenses.length > 0) {
      return cardToEdit.personalExpenses;
    }
    return [];
  });

  const [peParticipantId, setPeParticipantId] = React.useState(() => participantOptions[0] || '참여자');
  const [peAmountInput, setPeAmountInput] = React.useState('');
  const [peDescriptionInput, setPeDescriptionInput] = React.useState('');
  const [editingPeId, setEditingPeId] = React.useState(null);
  React.useEffect(() => {
    if (!personalParticipantPickerOptions.some(option => option.value === peParticipantId)) {
      setPeParticipantId(personalParticipantPickerOptions[0]?.value || '참여자');
    }
  }, [personalParticipantPickerOptions, peParticipantId]);

  const [year, setYear] = React.useState(() => {
    if (cardToEdit?.monthStr && cardToEdit.monthStr.includes('-')) {
      const y = parseInt(cardToEdit.monthStr.split('-')[0], 10);
      if (!isNaN(y)) return y;
    }
    return today.getFullYear();
  });
  const [month, setMonth] = React.useState(() => {
    if (cardToEdit?.monthStr && cardToEdit.monthStr.includes('-')) {
      const m = parseInt(cardToEdit.monthStr.split('-')[1], 10) - 1;
      if (!isNaN(m) && m >= 0 && m <= 11) return m;
    }
    return today.getMonth();
  });

  const [checkedItems, setCheckedItems] = React.useState(() => {
    if (cardToEdit?.checkedItems && typeof cardToEdit.checkedItems === 'object') {
      return cardToEdit.checkedItems;
    }
    return {};
  });
  const checkedItemsHydratedRef = React.useRef(false);

  const clampExpenseListHeight = (height) => Math.min(480, Math.max(96, height));
  const handleExpenseResizeStart = (event) => {
    event.preventDefault();
    event.stopPropagation();
    expenseResizeRef.current = { pointerId: event.pointerId, startY: event.clientY, startHeight: expenseListHeight };
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };
  const handleExpenseResizeMove = (event) => {
    const resize = expenseResizeRef.current;
    if (!resize || resize.pointerId !== event.pointerId) return;
    event.preventDefault();
    setExpenseListHeight(clampExpenseListHeight(resize.startHeight + event.clientY - resize.startY));
  };
  const handleExpenseResizeEnd = (event) => {
    if (expenseResizeRef.current?.pointerId === event.pointerId) expenseResizeRef.current = null;
  };
  const handleExpenseResizeKeyDown = (event) => {
    const step = event.shiftKey ? 48 : 24;
    if (!['ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const nextHeight = event.key === 'Home' ? 96 : event.key === 'End' ? 480 : expenseListHeight + (event.key === 'ArrowDown' ? step : -step);
    setExpenseListHeight(clampExpenseListHeight(nextHeight));
  };

  const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`;
  const confirmed = getConfirmedMeetings(calendar);

  const monthlyExpenses = React.useMemo(() => {
    const list = [];
    if (!Array.isArray(confirmed)) return list;
    confirmed.forEach(m => {
      if (!m || !m.date) return;
      const dateStr = typeof m.date === 'string' ? m.date : String(m.date || '');
      if (!dateStr || !dateStr.startsWith(monthStr)) return;
      const exps = Array.isArray(m.expenses) ? m.expenses : [];
      exps.forEach((exp, idx) => {
        if (!exp) return;
        const textToTest = (exp.label || exp.title || exp.note || exp.category || '').toLowerCase();
        if (textToTest.includes('이월') || textToTest.includes('전년이월') || textToTest.includes('전월이월')) return;
        const key = `${dateStr}_${exp.id || idx}_${exp.amount || 0}`;
        list.push({ ...exp, date: dateStr, itemKey: key, isIncome: Number(exp.amount || 0) < 0 });
      });
    });
    // The settlement editor selects shared expenses only. Income entries
    // (shown with a `+` amount) must not appear here or participate in the
    // editor's checked-item state.
    return list.filter(item => !item.isIncome);
  }, [confirmed, monthStr]);

  React.useEffect(() => {
    // `confirmed` can be recreated while the modal is open. Hydrating on
    // every render would re-add an item immediately after the user unchecks
    // it, making persisted checked items impossible to turn off.
    if (checkedItemsHydratedRef.current || monthlyExpenses.length === 0) return;
    checkedItemsHydratedRef.current = true;
    const savedKeys = Array.isArray(cardToEdit?.checkedItemKeys) ? cardToEdit.checkedItemKeys : [];
    if (savedKeys.length === 0) return;
    const initialChecked = {};
    monthlyExpenses.forEach(item => {
      if (savedKeys.includes(item.itemKey)) initialChecked[item.itemKey] = item;
    });
    if (Object.keys(initialChecked).length > 0) {
      setCheckedItems(prev => ({ ...initialChecked, ...prev }));
    }
  }, [monthlyExpenses, cardToEdit]);

  // Personal expenses are signed adjustments: negative values reduce the
  // participant's settlement and positive values increase it. New entries
  // default to a negative sign when the user enters digits without one.
  const formatSignedCommaNumber = (val) => {
    if (val === null || val === undefined || val === '') return '';
    const raw = String(val).trim();
    const sign = raw.startsWith('+') ? '+' : '-';
    const digits = raw.replace(/[^0-9]/g, '');
    return digits ? `${sign}${Number(digits).toLocaleString()}` : sign;
  };

  const parseSignedCommaNumber = (val) => {
    const raw = String(val || '').trim();
    const digits = raw.replace(/[^0-9]/g, '');
    if (!digits) return 0;
    return (raw.startsWith('+') ? 1 : -1) * Number(digits);
  };

  const formatShortDateWithDay = (dateStr) => {
    if (!dateStr || typeof dateStr !== 'string' || !dateStr.includes('-')) return dateStr || '';
    const [y, m, d] = dateStr.split('-');
    const dateObj = new Date(parseInt(y, 10), parseInt(m, 10) - 1, parseInt(d, 10));
    const dayNamesShort = ['일', '월', '화', '수', '목', '금', '토'];
    const dayName = dayNamesShort[dateObj.getDay()] || '';
    return `${y.slice(2)}.${m}.${d} (${dayName})`;
  };

  const { totalExpense, settlementPerPerson } = React.useMemo(() => {
    let exp = 0;
    Object.values(checkedItems).forEach(item => {
      const amt = Number(item.amount || 0);
      if (!item.isIncome) exp += Math.abs(amt);
    });
    const count = Math.max(1, participantRows.length);
    const perPerson = Math.round(exp / count);
    return { totalExpense: exp, settlementPerPerson: perPerson };
  }, [checkedItems, participantRows.length]);

  const personalExpenseTotals = React.useMemo(() => {
    const totals = new Map();
    personalExpenses.forEach(item => {
      const participantId = item?.participantId || '참여자';
      // Older records stored a positive number for a negative personal
      // expense. Keep those records compatible while new records use signed
      // amounts explicitly.
      const amount = item?.signedAmount
        ? (Number(item.amount) || 0)
        : -Math.abs(Number(item?.amount) || 0);
      totals.set(participantId, (totals.get(participantId) || 0) + amount);
    });
    return totals;
  }, [personalExpenses]);

  const hasSharedExpenses = Object.keys(checkedItems || {}).length > 0;
  const settlementRows = React.useMemo(() => calculateSettlementRows(
    totalExpense,
    participantRows.map(row => row?.participantId),
    personalExpenseTotals,
    depositorName
  ), [totalExpense, participantRows, personalExpenseTotals, depositorName]);
  const getIndividualSettlementAmount = (participantId) => {
    if (!hasSharedExpenses) return 0;
    return settlementRows.find(row => row.name === participantId)?.amount || 0;
  };

  const handleAccountNumberChange = (e) => {
    const val = e.target.value;
    if (bankName === '기타') {
      setAccountNumber(String(val).replace(/[^0-9-]/g, ''));
      return;
    }
    const formatted = formatBankAccountNumber(bankName, val);
    setAccountNumber(formatted);
  };

  const handleBankNameChange = (newBank) => {
    setBankName(newBank);
    if (accountNumber) {
      setAccountNumber(newBank === '기타'
        ? String(accountNumber).replace(/[^0-9-]/g, '')
        : formatBankAccountNumber(newBank, accountNumber));
    }
  };

  const toggleCheckItem = (item) => {
    setCheckedItems(prev => {
      const next = { ...prev };
      if (next[item.itemKey]) delete next[item.itemKey];
      else next[item.itemKey] = item;
      return next;
    });
  };

  const handleAddParticipantRow = () => {
    const defaultP = String(participantToAdd || '').trim();
    const memo = String(participantMemoInput || '').trim().slice(0, 500);
    if (!defaultP) return;
    if (editingParticipantRowId) {
      if (participantRows.some(row => row.id !== editingParticipantRowId && row.participantId === defaultP)) {
        if (showToast) showToast('이미 등록된 참여자입니다.', 'warning');
        return;
      }
      setParticipantRows(prev => prev.map(row => row.id === editingParticipantRowId
        ? { ...row, participantId: defaultP, memo }
        : row));
    } else {
      if (participantRows.some(row => row.participantId === defaultP)) {
        if (showToast) showToast('이미 등록된 참여자입니다.', 'warning');
        return;
      }
      setParticipantRows(prev => [
        ...prev,
        { id: `pr_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`, participantId: defaultP, memo }
      ]);
    }
    setParticipantToAdd('');
    setParticipantMemoInput('');
    setEditingParticipantRowId(null);
  };

  const handleRemoveParticipantRow = (rowId) => {
    setParticipantRows(prev => prev.filter(r => r.id !== rowId));
    if (editingParticipantRowId === rowId) {
      setParticipantToAdd('');
      setParticipantMemoInput('');
      setEditingParticipantRowId(null);
    }
  };

  const handleEditParticipantRow = (row) => {
    setParticipantToAdd(row?.participantId || '');
    setParticipantMemoInput(row?.memo || '');
    setEditingParticipantRowId(row?.id || null);
  };

  const handleSaveOrUpdatePersonalExpense = () => {
    const amt = parseSignedCommaNumber(peAmountInput);
    const desc = peDescriptionInput.trim();
    if (!amt && !desc) {
      if (showToast) showToast('금액 또는 지출 명목을 입력해주세요.', 'warning');
      return;
    }
    if (editingPeId) {
      setPersonalExpenses(prev => prev.map(item => item.id === editingPeId ? {
        ...item,
        participantId: peParticipantId,
        amount: amt,
        signedAmount: true,
        description: desc
      } : item));
      if (showToast) showToast('개인 지출이 수정되었습니다.', 'success');
    } else {
      setPersonalExpenses(prev => [
        ...prev,
        {
          id: `pe_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          participantId: peParticipantId,
          amount: amt,
          signedAmount: true,
          description: desc
        }
      ]);
      if (showToast) showToast('개인 지출이 추가되었습니다.', 'success');
    }
    setPeAmountInput('');
    setPeDescriptionInput('');
    setEditingPeId(null);
  };

  const handleSelectPersonalExpenseItem = (item) => {
    setEditingPeId(item.id);
    setPeParticipantId(item.participantId || participantOptions[0] || '참여자');
    setPeAmountInput(item?.signedAmount
      ? formatSignedCommaNumber(item.amount || 0)
      : formatSignedCommaNumber(-(Math.abs(Number(item.amount) || 0))));
    setPeDescriptionInput(item.description || '');
  };

  const handleCancelPersonalExpenseEdit = () => {
    setEditingPeId(null);
    setPeAmountInput('');
    setPeDescriptionInput('');
  };

  const handleDeletePersonalExpenseItem = (id, e) => {
    if (e) e.stopPropagation();
    setPersonalExpenses(prev => prev.filter(item => item.id !== id));
    if (editingPeId === id) {
      handleCancelPersonalExpenseEdit();
    }
    if (showToast) showToast('개인 지출 항목이 삭제되었습니다.', 'info');
  };

  const handlePrevMonth = () => {
    setMonth(prev => {
      if (prev === 0) {
        setYear(y => y - 1);
        return 11;
      }
      return prev - 1;
    });
  };

  const handleNextMonth = () => {
    setMonth(prev => {
      if (prev === 11) {
        setYear(y => y + 1);
        return 0;
      }
      return prev + 1;
    });
  };

  const handleSave = async () => {
    if (isSavingSettlementCard) return;
    if (!title.trim()) {
      if (showToast) showToast('정산 타이틀을 입력해주세요.', 'warning');
      return;
    }

    // A participant memo is edited in a small row-level form. Previously the main
    // "수정" button serialized participantRows without first applying that pending
    // form state, so the old memo was saved unless the user happened to press the
    // row-level "수정" button as an extra step. Treat the visible form as the latest
    // value when the card itself is saved.
    let participantRowsForSave = participantRows;
    if (editingParticipantRowId) {
      const pendingParticipantId = String(participantToAdd || '').trim();
      if (!pendingParticipantId) {
        if (showToast) showToast('참여자를 선택해주세요.', 'warning');
        return;
      }
      if (participantRows.some(row => row.id !== editingParticipantRowId && row.participantId === pendingParticipantId)) {
        if (showToast) showToast('이미 등록된 참여자입니다.', 'warning');
        return;
      }
      participantRowsForSave = participantRows.map(row => row.id === editingParticipantRowId
        ? { ...row, participantId: pendingParticipantId, memo: String(participantMemoInput || '').trim().slice(0, 500) }
        : row);
    }

    const participantNames = Array.from(new Set(participantRowsForSave.map(r => r.participantId).filter(Boolean)));
    const newCard = {
      id: cardToEdit?.id || `set_${Date.now()}`,
      title: title.trim(),
      status: cardToEdit?.status || 'active',
      createdAt: cardToEdit?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      participants: participantNames,
      participantCount: participantNames.length,
      // Individual amounts are derived at render time from total expense and personal
      // expenses; never persist a manually editable per-participant amount.
      participantRows: participantRowsForSave.map(row => ({ id: row.id, participantId: row.participantId, memo: row.memo || '' })),
      personalExpenses: personalExpenses,
      amount: totalExpense,
      perPersonAmount: settlementPerPerson,
      bankName: bankName,
      otherBankName: bankName === '기타' ? otherBankName.trim() : '',
      depositorName: depositorName.trim(),
      accountNumber: accountNumber.trim(),
      monthStr: monthStr,
      checkedItemKeys: Object.keys(checkedItems)
    };
    setIsSavingSettlementCard(true);
    try {
      const saved = typeof onSave === 'function' ? await onSave(newCard) : false;
      if (saved === false) throw new Error('Settlement card save rejected');
      if (showToast) showToast(isEditing ? `'${title}' 정산 정보가 수정되었습니다!` : `'${title}' 정산 카드가 생성되었습니다!`, 'success');
      if (onClose) onClose();
    } catch (error) {
      console.error('Failed to save settlement card:', error);
      if (showToast) showToast('정산 카드 저장에 실패했습니다. 다시 시도해 주세요.', 'error');
    } finally {
      setIsSavingSettlementCard(false);
    }
  };

  const cleanAccountDigits = (accountNumber || '').replace(/[^0-9]/g, '');
  const isAccountValid = cleanAccountDigits.length >= 8;
  const settlementSectionLabelStyle = { display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-muted)' };

  // Settlement-card preview -> image, rendered client-side onto an offscreen canvas (same
  // technique as the settlement-summary share image) so it can be saved as a plain jpg and
  // shared outside the app without anyone needing account access.
  const handleDownloadSettlementCardImage = () => {
    const items = Object.values(checkedItems);
    const W = 720;
    const PAD = 40;
    const HEADER_H = 190;
    const ROW_H = 40;
    const summaryBoxH = 74 + Math.max(1, participantRows.length) * ROW_H;
    const bankBoxH = depositorName ? 108 : 86;
    const listBoxH = 74 + Math.max(1, items.length) * ROW_H;
    const H = HEADER_H + 34 + summaryBoxH + 20 + bankBoxH + 20 + listBoxH + 50;

    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');

    const fitText = (text, maxWidth) => {
      const str = String(text);
      if (ctx.measureText(str).width <= maxWidth) return str;
      let t = str;
      while (t.length > 1 && ctx.measureText(`${t}…`).width > maxWidth) t = t.slice(0, -1);
      return `${t}…`;
    };
    const hLine = (x1, x2, yy) => {
      ctx.strokeStyle = '#F1F5F9';
      ctx.beginPath();
      ctx.moveTo(x1, yy);
      ctx.lineTo(x2, yy);
      ctx.stroke();
    };
    const pillPath = (x, yy, w, h) => {
      const r = h / 2;
      ctx.beginPath();
      ctx.moveTo(x + r, yy);
      ctx.arcTo(x + w, yy, x + w, yy + h, r);
      ctx.arcTo(x + w, yy + h, x, yy + h, r);
      ctx.arcTo(x, yy + h, x, yy, r);
      ctx.arcTo(x, yy, x + w, yy, r);
      ctx.closePath();
    };

    ctx.fillStyle = '#F5F3FF';
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = '#4F46E5';
    ctx.fillRect(0, 0, W, HEADER_H);
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.font = '700 16px sans-serif';
    ctx.fillText(cardToEdit?.status === 'closed' ? '마감된 정산' : '진행중인 정산', PAD, 50);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '900 30px sans-serif';
    ctx.fillText(fitText(title || '1/N 간편 송금', W - PAD * 2), PAD, 96);
    ctx.font = '700 17px sans-serif';
    ctx.fillText('총 지출', PAD, HEADER_H - 30);
    ctx.fillStyle = '#F0ABFC';
    ctx.font = '900 30px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(`${totalExpense.toLocaleString()}원`, W - PAD, HEADER_H - 26);
    ctx.textAlign = 'left';

    let y = HEADER_H + 34;

    // 기준 분담금
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(PAD, y, W - PAD * 2, summaryBoxH);
    ctx.strokeStyle = '#E2E8F0';
    ctx.strokeRect(PAD, y, W - PAD * 2, summaryBoxH);
    ctx.fillStyle = '#64748B';
    ctx.font = '700 14px sans-serif';
    const summaryLabel = `기준 분담금: 약 ${settlementPerPerson.toLocaleString()}원 (총 지출 ÷ ${Math.max(1, participantRows.length)}명)`;
    ctx.fillText(fitText(summaryLabel, W - PAD * 2 - 40), PAD + 20, y + 32);

    let rowY = y + 56;
    if (participantRows.length === 0) {
      ctx.fillStyle = '#94A3B8';
      ctx.font = '500 14px sans-serif';
      ctx.fillText('등록된 참여자가 없습니다.', PAD + 20, rowY);
    } else {
      participantRows.forEach(row => {
        const amount = getIndividualSettlementAmount(row.participantId);
        const isRefund = amount < 0;
        hLine(PAD + 20, W - PAD - 20, rowY - 22);
        ctx.fillStyle = '#334155';
        ctx.font = '600 15px sans-serif';
        const nameText = `${row.participantId}님`;
        ctx.fillText(nameText, PAD + 20, rowY);
        const nameWidth = ctx.measureText(nameText).width;

        const badgeText = isRefund ? '(환급예정)' : '(입금요청)';
        ctx.font = '800 12px sans-serif';
        const badgePadX = 8;
        const badgeW = ctx.measureText(badgeText).width + badgePadX * 2;
        const badgeH = 18;
        const badgeX = PAD + 20 + nameWidth + 8;
        const badgeY = rowY - badgeH + 4;
        pillPath(badgeX, badgeY, badgeW, badgeH);
        if (isRefund) {
          ctx.strokeStyle = '#16A34A';
          ctx.lineWidth = 1;
          ctx.stroke();
          ctx.fillStyle = '#16A34A';
        } else {
          ctx.fillStyle = '#DC2626';
          ctx.fill();
          ctx.fillStyle = '#FFFFFF';
        }
        ctx.fillText(badgeText, badgeX + badgePadX, badgeY + 13);

        ctx.fillStyle = amount < 0 ? '#16A34A' : '#DC2626';
        ctx.font = '800 16px sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(`${amount < 0 ? '환급금 +' : '분담금 -'}${Math.abs(amount).toLocaleString()}원`, W - PAD - 20, rowY);
        ctx.textAlign = 'left';
        rowY += ROW_H;
      });
    }

    y += summaryBoxH + 20;

    // 송금계좌 정보
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(PAD, y, W - PAD * 2, bankBoxH);
    ctx.strokeStyle = '#E2E8F0';
    ctx.strokeRect(PAD, y, W - PAD * 2, bankBoxH);
    ctx.fillStyle = '#64748B';
    ctx.font = '700 14px sans-serif';
    ctx.fillText('송금계좌 정보', PAD + 20, y + 30);
    ctx.fillStyle = '#0F172A';
    ctx.font = '800 18px sans-serif';
    const bankLabel = `${bankName === '기타' ? (otherBankName || '기타') : bankName} ${accountNumber || '계좌번호 미입력'}`;
    ctx.fillText(fitText(bankLabel, W - PAD * 2 - 40), PAD + 20, y + 60);
    if (depositorName) {
      ctx.fillStyle = '#64748B';
      ctx.font = '500 14px sans-serif';
      ctx.fillText(`예금주: ${depositorName}`, PAD + 20, y + 86);
    }

    y += bankBoxH + 20;

    // 정산목록
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(PAD, y, W - PAD * 2, listBoxH);
    ctx.strokeStyle = '#E2E8F0';
    ctx.strokeRect(PAD, y, W - PAD * 2, listBoxH);
    ctx.fillStyle = '#64748B';
    ctx.font = '700 14px sans-serif';
    ctx.fillText(`정산목록 (${items.length}건)`, PAD + 20, y + 30);

    let listRowY = y + 56;
    if (items.length === 0) {
      ctx.fillStyle = '#94A3B8';
      ctx.font = '500 14px sans-serif';
      ctx.fillText('선택된 지출 항목이 없습니다.', PAD + 20, listRowY);
    } else {
      items.forEach(item => {
        hLine(PAD + 20, W - PAD - 20, listRowY - 22);
        ctx.fillStyle = '#334155';
        ctx.font = '500 14px sans-serif';
        ctx.fillText(fitText(`${formatShortDateWithDay(item.date)} · ${item.label || '정산 항목'}`, 420), PAD + 20, listRowY);
        ctx.fillStyle = '#DC2626';
        ctx.font = '800 15px sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(`-${Math.abs(Number(item.amount) || 0).toLocaleString()}원`, W - PAD - 20, listRowY);
        ctx.textAlign = 'left';
        listRowY += ROW_H;
      });
    }

    ctx.fillStyle = '#94A3B8';
    ctx.font = '500 12px sans-serif';
    ctx.fillText(`모여라 캘린더 · ${new Date().toLocaleDateString('ko-KR')} 생성`, PAD, H - 24);

    setSettlementCardImageUrl(canvas.toDataURL('image/jpeg', 0.92));
  };

  return React.createElement(React.Fragment, null,
  React.createElement('div', {
    className: 'modal-overlay',
    onClick: onClose,
    style: { zIndex: 11000 }
  }, React.createElement(ResizableModalContainer, {
    className: 'modal-container',
    role: 'dialog',
    'aria-modal': 'true',
    'aria-labelledby': 'settlement-modal-title',
    style: { maxWidth: '520px', width: '92%', maxHeight: '90vh', display: 'flex', flexDirection: 'column' },
    onClick: e => e.stopPropagation()
  },
    React.createElement('div', {
      className: 'modal-header',
      style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', borderBottom: '1px solid var(--border-subtle)' }
    },
      React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 } },
        React.createElement('h3', { id: 'settlement-modal-title', style: { fontSize: '1.05rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' } }, isEditing ? '정산 수정' : '정산 생성')
      ),
      React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '6px' } },
        isEditing && React.createElement('button', {
          type: 'button', onClick: () => setIsSettlementCardPreviewOpen(true),
          style: { border: '1px solid var(--border-subtle)', borderRadius: '7px', background: 'var(--bg-card)', color: 'var(--text-main)', padding: '5px 9px', fontSize: '0.72rem', fontWeight: 800, cursor: 'pointer', whiteSpace: 'nowrap' }
        }, '정산 카드'),
        React.createElement('button', {
          type: 'button', onClick: onClose,
          style: { background: 'none', border: 'none', color: '#64748B', cursor: 'pointer' }
        }, React.createElement(SmallXIcon, { size: 20 }))
      )
    ),
    React.createElement('div', {
      role: 'tablist',
      'aria-label': '정산 수정 탭',
      style: { display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-card)' }
    },
      ['general', 'settlement'].map(tab => React.createElement('button', {
        key: tab,
        type: 'button',
        role: 'tab',
        'aria-selected': activeTab === tab,
        onClick: () => setActiveTab(tab),
        style: {
          height: '46px', border: 'none', borderBottom: activeTab === tab ? '2px solid #2563EB' : '2px solid transparent',
          background: 'transparent', color: activeTab === tab ? '#2563EB' : 'var(--text-muted)',
          fontSize: '0.84rem', fontWeight: 800, cursor: 'pointer'
        }
      }, tab === 'general' ? '일반' : '정산'))
    ),
    React.createElement('div', {
      className: 'modal-body',
      style: { overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }
    },
      activeTab === 'general' && React.createElement('div', {
        style: { display: 'flex', flexDirection: 'column', gap: '14px' }
      },
      React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: '6px' } },
        React.createElement('label', { style: settlementSectionLabelStyle }, '타이틀 입력'),
        React.createElement('input', {
          type: 'text', className: 'form-input', value: title,
          onChange: e => setTitle(e.target.value), placeholder: '예: 1/N 간편 송금',
          style: { width: '100%', borderRadius: '8px' }
        })
      ),
      React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: '8px' } },
        React.createElement('label', { style: settlementSectionLabelStyle }, '참여자 선택'),
        React.createElement(SimpleBottomSheetPicker, {
          title: "참여자 선택",
          placeholder: "참여할 이름을 골라주세요",
          value: participantToAdd,
          options: participantPickerOptionsWithSelectionState,
          onSelect: setParticipantToAdd,
          disabled: availableParticipantPickerOptions.length === 0 && !editingParticipantRowId,
          style: { width: '100%', height: '44px', borderRadius: '8px', fontSize: '0.84rem' }
        }),
          React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: '4px' } },
            React.createElement('label', { style: settlementSectionLabelStyle }, '메모 입력 (선택)'),
          React.createElement('div', { style: { display: 'flex', flexDirection: editingParticipantRowId ? 'column' : 'row', gap: '8px', alignItems: editingParticipantRowId ? 'stretch' : 'center' } },
            React.createElement('input', {
              type: 'text', className: 'form-input', value: participantMemoInput,
              maxLength: 500, onChange: e => setParticipantMemoInput(e.target.value),
              placeholder: '일정 메모를 남길 수 있습니다 (최대 500자)',
              style: { width: '100%', height: '44px', borderRadius: '8px', fontSize: '0.82rem' }
            }),
            editingParticipantRowId
              ? React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', width: '100%' } },
                React.createElement('button', {
                  type: 'button', className: 'btn btn-secondary', onClick: () => {
                    setParticipantToAdd(''); setParticipantMemoInput(''); setEditingParticipantRowId(null);
                  }, style: { width: '100%', height: '44px', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 800 }
                }, '취소'),
                React.createElement('button', {
                  type: 'button', className: 'btn btn-secondary', onClick: handleAddParticipantRow,
                  disabled: !participantToAdd,
                  style: { width: '100%', height: '44px', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-main)', cursor: participantToAdd ? 'pointer' : 'not-allowed', border: '1px solid #CBD5E1', backgroundColor: '#F1F5F9' }
                }, '수정')
              )
              : React.createElement('button', {
                type: 'button', className: 'btn btn-secondary', onClick: handleAddParticipantRow,
                disabled: !participantToAdd,
                style: { width: '60px', height: '44px', flexShrink: 0, borderRadius: '8px', fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-main)', cursor: participantToAdd ? 'pointer' : 'not-allowed', border: '1px solid #CBD5E1', backgroundColor: '#F1F5F9' }
              }, '추가')
          )
        ),
        participantRows.length > 0 && React.createElement('div', {
          style: { display: 'flex', flexDirection: 'column', gap: '6px', padding: '8px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-subtle)', borderRadius: '8px' }
        }, participantRows.map(row => React.createElement('div', {
          key: row.id,
          style: { display: 'flex', flexDirection: 'column', gap: '4px', minHeight: '44px', padding: '7px 10px', border: '1px solid var(--border-subtle)', borderRadius: '8px', backgroundColor: 'var(--bg-card)' }
        },
          React.createElement('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', width: '100%', minWidth: 0 } },
            React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '9px', minWidth: 0, overflow: 'hidden', cursor: 'pointer' }, onClick: () => handleEditParticipantRow(row) },
            ParticipantBackdrop ? React.createElement(ParticipantBackdrop, {
              participant: participantPickerOptions.find(option => option.value === row.participantId) || { name: row.participantId, color: '#3B82F6' },
              name: row.participantId || '참여자', dotSize: 9, style: { fontSize: '0.82rem', flexShrink: 0 }
            }) : React.createElement('span', { style: { fontSize: '0.84rem', fontWeight: 800, color: 'var(--text-main)' } }, row.participantId || '참여자')
            ),
            React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '5px', flexShrink: 0 } },
            React.createElement('span', { className: `settlement-person-settlement-badge${getIndividualSettlementAmount(row.participantId) < 0 ? ' is-refund' : ''}` }, (() => {
              const amount = getIndividualSettlementAmount(row.participantId);
              return amount < 0 ? '환급금' : amount > 0 ? '분담금' : '정산 없음';
            })()),
            getIndividualSettlementAmount(row.participantId) !== 0 && React.createElement('span', { style: { fontSize: '0.78rem', color: 'var(--text-main)', whiteSpace: 'nowrap', marginRight: '2px', fontWeight: 800 } }, `${getIndividualSettlementAmount(row.participantId) < 0 ? '+' : '-'}${Math.abs(getIndividualSettlementAmount(row.participantId)).toLocaleString()}원`),
            React.createElement('button', {
              type: 'button', title: '참여자 메모 편집', 'aria-label': '참여자 메모 편집', onClick: () => handleEditParticipantRow(row),
              style: { width: '24px', height: '24px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '6px', color: '#64748B', backgroundColor: 'transparent', border: '1px solid #CBD5E1', flexShrink: 0 }
            }, React.createElement(PencilIcon, { size: 12 })),
            React.createElement('button', {
              type: 'button', title: '참여자 삭제', 'aria-label': '참여자 삭제', onClick: () => handleRemoveParticipantRow(row.id),
              style: { width: '24px', height: '24px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '6px', color: '#64748B', backgroundColor: 'transparent', border: 'none', flexShrink: 0 }
            }, React.createElement(TrashIcon, { size: 14, style: { stroke: '#64748B' } }))
            )
          ),
          row.memo ? React.createElement('div', { style: { alignSelf: 'flex-start', maxWidth: '100%', padding: '3px 8px', borderRadius: '999px', backgroundColor: '#E2E8F0', color: '#64748B', fontSize: '0.72rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', cursor: 'pointer' }, onClick: () => handleEditParticipantRow(row) }, row.memo) : null
        )))
      ),
      React.createElement('div', { className: 'settlement-bank-grid', style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' } },
          React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: '4px' } },
            React.createElement('label', { style: { fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)' } }, '송금 받을 은행'),
          SimpleBottomSheetPicker ? React.createElement(SimpleBottomSheetPicker, {
            title: "송금 받을 은행 선택",
            placeholder: "은행 선택",
            value: bankName,
            options: bankPickerOptions,
            onSelect: (val) => handleBankNameChange(val),
            style: { width: '100%', height: '44px', borderRadius: '8px', fontSize: '0.82rem' }
          }) : React.createElement('select', {
            className: 'form-select', value: bankName, onChange: e => handleBankNameChange(e.target.value),
            style: { width: '100%', height: '44px', borderRadius: '8px', fontSize: '0.82rem' }
          }, BANK_OPTIONS.map(b => React.createElement('option', { key: b, value: b }, b))),
          bankName === '기타' && React.createElement('input', {
            type: 'text', className: 'form-input', value: otherBankName,
            onChange: e => setOtherBankName(e.target.value), placeholder: '은행 이름 입력', maxLength: 40,
            style: { width: '100%', height: '44px', borderRadius: '8px', fontSize: '0.82rem' }
          })
        ),
        React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: '4px' } },
          React.createElement('label', { style: { fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)' } }, '예금자명'),
          React.createElement('input', {
            type: 'text', className: 'form-input', value: depositorName,
            onChange: e => setDepositorName(e.target.value), placeholder: '예금주 입력',
            style: { width: '100%', height: '44px', borderRadius: '8px', fontSize: '0.82rem' }
          })
        )
      ),
      React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: '4px' } },
        React.createElement('label', { style: { fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)' } }, '계좌번호'),
        React.createElement('div', { style: { position: 'relative', width: '100%' } },
          React.createElement('input', {
            type: 'text', inputMode: 'numeric', className: 'form-input', value: accountNumber,
            onChange: handleAccountNumberChange, placeholder: bankName === '기타' ? '계좌번호 입력 (숫자와 - 직접 입력)' : '계좌번호 입력 (숫자만 입력 시 하이픈 자동생성)',
            style: { width: '100%', height: '44px', borderRadius: '8px', fontSize: '0.82rem', paddingRight: bankName !== '기타' && isAccountValid ? '36px' : '12px' }
          }),
          bankName !== '기타' && isAccountValid && React.createElement('div', {
            style: {
              position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '20px', height: '20px', borderRadius: '50%', backgroundColor: 'var(--status-green)', color: '#FFFFFF',
              fontSize: '0.72rem', fontWeight: 900, pointerEvents: 'none'
            }
          }, '✓')
        )
      ),
      ),
      /* Lower Section Container with subtle background separating it from top inputs */
      activeTab === 'settlement' && React.createElement('div', {
        style: {
          display: 'flex', flexDirection: 'column', gap: '12px',
          backgroundColor: 'var(--bg-primary)', padding: '14px',
          borderRadius: '12px', border: '1px solid var(--border-subtle)'
        }
      },
        React.createElement('div', {
          className: 'settlement-metric-grid',
          style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', margin: 0 }
        },
          React.createElement('div', { className: 'settlement-metric-card', style: { textAlign: 'center' } },
            React.createElement('div', { className: 'settlement-metric-card-label' }, '총 지출'),
            React.createElement('div', { className: 'settlement-metric-card-value', style: { color: '#0F172A' } }, `${totalExpense.toLocaleString()}원`)
          ),
          React.createElement('div', { className: 'settlement-metric-card', style: { textAlign: 'center' } },
            React.createElement('div', { className: 'settlement-metric-card-label' }, '개별정산(인당)'),
            React.createElement('div', { className: 'settlement-metric-card-value', style: { color: '#2563EB' } }, `${settlementPerPerson.toLocaleString()}원`)
          )
        ),
        React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: '8px' } },
          React.createElement('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', minHeight: '36px' } },
            React.createElement('label', { style: { ...settlementSectionLabelStyle, marginBottom: 0 } }, '지출 항목'),
            React.createElement('div', {
              className: 'calendar-nav',
              style: { display: 'flex', alignItems: 'center', gap: '6px', height: '36px', marginBottom: 0 }
            },
              React.createElement('button', {
                type: 'button', className: 'btn btn-secondary calendar-month-nav-btn', style: { width: '32px', height: '32px', padding: '6px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' },
                onClick: handlePrevMonth
              }, React.createElement(MainCalendarArrow, { direction: 'left' })),
              React.createElement('div', {
                className: 'month-display',
                style: { cursor: 'default', userSelect: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '48px', height: '32px', fontSize: '0.86rem', fontWeight: 800 }
              }, `${String(year).slice(2)}.${String(month + 1).padStart(2, '0')}`),
              React.createElement('button', {
                type: 'button', className: 'btn btn-secondary calendar-month-nav-btn', style: { width: '32px', height: '32px', padding: '6px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' },
                onClick: handleNextMonth
              }, React.createElement(MainCalendarArrow, { direction: 'right' }))
            )
          ),
          React.createElement('div', {
            style: {
              height: `${expenseListHeight}px`, minHeight: '96px', maxHeight: '480px', overflowY: 'auto', border: '1px solid var(--border-subtle)', borderRadius: '8px 8px 0 0', padding: '6px', display: 'flex', flexDirection: 'column', gap: '4px', backgroundColor: 'var(--bg-card)', transition: expenseResizeRef.current ? 'none' : 'height 120ms ease'
            }
          },
            monthlyExpenses.length === 0 ? React.createElement('div', { style: { padding: '16px', textAlign: 'center', fontSize: '0.78rem', color: 'var(--text-muted)' } }, '해당 월에 등록된 내역이 없습니다.')
              : monthlyExpenses.map(item => {
                const isChecked = !!checkedItems[item.itemKey];
                return React.createElement('label', {
                  key: item.itemKey,
                  className: `settlement-expense-option${isChecked ? ' is-checked' : ''}`
                },
                  React.createElement('input', {
                    type: 'checkbox', checked: isChecked,
                    onClick: e => e.stopPropagation(),
                    onChange: e => { e.stopPropagation(); toggleCheckItem(item); },
                    'aria-label': `${formatShortDateWithDay(item.date)} ${item.label || '지출 내역'} 선택`,
                    className: 'settlement-expense-checkbox'
                  }),
                  React.createElement('span', { className: 'settlement-expense-option-copy' },
                    React.createElement('span', { className: 'settlement-expense-option-date' }, formatShortDateWithDay(item.date)),
                    React.createElement('span', { className: 'settlement-expense-option-label' }, item.label || '지출 내역')
                  ),
                  React.createElement('strong', { className: `settlement-expense-option-amount${item.isIncome ? ' is-income' : ''}` },
                    `${item.isIncome ? '+' : '-'}${Math.abs(item.amount).toLocaleString()}원`
                  )
                );
              })
          ),
          React.createElement('div', {
            className: 'settlement-expense-resize-row',
            style: { display: 'flex', justifyContent: 'center', height: '20px', marginTop: '-8px', backgroundColor: 'rgba(0, 0, 0, 0.04)', borderRadius: '0 0 6px 6px', marginBottom: '8px' }
          },
            React.createElement('button', {
              type: 'button',
              className: 'settlement-expense-resize-handle',
              title: '드래그하여 지출 항목 높이 조절',
              'aria-label': '지출 항목 목록 높이 조절',
              onPointerDown: handleExpenseResizeStart,
              onPointerMove: handleExpenseResizeMove,
              onPointerUp: handleExpenseResizeEnd,
              onPointerCancel: handleExpenseResizeEnd,
              onKeyDown: handleExpenseResizeKeyDown
            },
              React.createElement('svg', { width: '18', height: '18', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': 'true' },
                React.createElement('path', { d: 'M8 9l4-4 4 4' }),
                React.createElement('path', { d: 'M16 15l-4 4-4-4' })
              )
            )
          )
        ),
        /* Personal Expense Editor Block */
        React.createElement('div', {
          style: { display: 'flex', flexDirection: 'column', gap: '10px' }
        },
          React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' } },
            React.createElement('label', { style: { ...settlementSectionLabelStyle, marginBottom: 0 } }, '개인 지출 등록'),
            React.createElement('span', { style: { fontSize: '0.72rem', color: 'var(--text-muted)' } }, '총 지출에 포함된 금액 중 개인이 먼저 결제한 금액을 입력하세요.'),
            React.createElement('span', { style: { fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)' } },
              `합계: ${Math.abs(personalExpenses.reduce((s, x) => {
                const amount = x?.signedAmount ? (Number(x.amount) || 0) : -Math.abs(Number(x?.amount) || 0);
                return s + amount;
              }, 0)).toLocaleString()}원`
            )
          ),

          React.createElement('div', {
            className: 'settlement-personal-expense-summary',
            style: { display: 'flex', flexDirection: 'column', gap: '6px', overflowX: 'hidden', padding: '8px 6px', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px', boxSizing: 'border-box' }
          },
            personalParticipantPickerOptions.map(option => {
              const total = personalExpenseTotals.get(option.value) || 0;
              const participant = activeParticipants.find(p => (typeof p === 'string' ? p : (p?.name || p?.id)) === option.value) || { name: option.value, color: option.color };
              return React.createElement('div', {
                key: option.value,
                style: {
                  width: '100%', minWidth: 0, minHeight: '36px', padding: '6px 10px', borderRadius: '9px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px',
                  backgroundColor: '#F8FAFC', border: 'none', boxSizing: 'border-box'
                }
              },
                ParticipantBackdrop ? React.createElement(ParticipantBackdrop, { participant, name: option.value, dotSize: 9, style: { fontSize: '0.72rem', flex: '0 1 auto', minWidth: 0 } }) : React.createElement('span', { style: { color: option.color, fontWeight: 800, fontSize: '0.72rem' } }, `● ${option.value}`),
                React.createElement('strong', { style: { color: '#2563EB', fontSize: '0.78rem', whiteSpace: 'nowrap' } }, `${Math.abs(total).toLocaleString()}원`)
              );
            })
          ),

          /* Personal expense fields: participant, description, then amount/action. */
          React.createElement('div', { style: { width: '100%' } },
            SimpleBottomSheetPicker ? React.createElement(SimpleBottomSheetPicker, {
              title: "개인 지출 참여자 선택",
              placeholder: "참여자 선택",
              value: peParticipantId,
              options: personalParticipantPickerOptions,
              onSelect: setPeParticipantId,
              style: { width: '100%', height: '44px', borderRadius: '8px', fontSize: '0.82rem' }
            }) : React.createElement('select', {
              className: 'form-select',
              value: peParticipantId,
              onChange: e => setPeParticipantId(e.target.value),
              style: { width: '100%', height: '44px', borderRadius: '8px', fontSize: '0.82rem' }
            }, personalParticipantPickerOptions.map(option => React.createElement('option', { key: option.value, value: option.value }, option.label))),
          ),
          React.createElement('div', { style: { width: '100%', marginTop: '-6px', marginBottom: '-6px' } },
            React.createElement('input', {
              type: 'text', className: 'form-input', value: peDescriptionInput,
              onChange: e => setPeDescriptionInput(e.target.value), placeholder: '지출 명목 (예: 개인 음료, 교통비)',
              style: { width: '100%', height: '44px', borderRadius: '8px', fontSize: '0.84rem' },
              onKeyDown: e => { if (e.key === 'Enter') { e.preventDefault(); handleSaveOrUpdatePersonalExpense(); } }
            })
          ),
          React.createElement('div', { style: { display: 'flex', gap: '8px', alignItems: 'center', width: '100%' } },
            React.createElement('input', {
              type: 'text',
              inputMode: 'tel',
              className: 'form-input',
              value: peAmountInput,
              onChange: e => setPeAmountInput(formatSignedCommaNumber(e.target.value)),
              placeholder: '금액 입력 (원)',
              style: { flex: 1, minWidth: 0, width: '100%', height: '44px', borderRadius: '8px', fontSize: '0.84rem', color: '#0F172A', fontWeight: 400 }
            }),
            !editingPeId && React.createElement('button', {
              type: 'button', className: 'btn btn-secondary', onClick: handleSaveOrUpdatePersonalExpense,
              style: { width: '60px', height: '44px', flexShrink: 0 }
            }, '추가')
          ),

          editingPeId && React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', width: '100%' } },
            React.createElement('button', {
              type: 'button', className: 'btn btn-secondary', onClick: handleCancelPersonalExpenseEdit,
              style: { width: '100%', height: '44px' }
            }, '취소'),
            React.createElement('button', {
              type: 'button', className: 'btn btn-secondary', onClick: handleSaveOrUpdatePersonalExpense,
              style: { width: '100%', height: '44px' }
            }, editingPeId ? '수정' : '추가')
          ),

          /* Saved Personal Expenses List */
          personalExpenses.length > 0 && React.createElement('div', {
            style: { display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }
          },
            personalExpenses.map(item => {
              const isItemEditing = editingPeId === item.id;
              const participant = activeParticipants.find(p => (typeof p === 'string' ? p : (p?.name || p?.id)) === item.participantId) || { name: item.participantId || '참여자' };
              return React.createElement('div', {
                key: item.id,
                onClick: () => handleSelectPersonalExpenseItem(item),
                style: {
                  padding: '10px 12px 11px', borderRadius: '10px',
                  backgroundColor: isItemEditing ? 'rgba(59, 130, 246, 0.08)' : 'var(--bg-card)',
                  border: isItemEditing ? '1px solid #2563EB' : '1px solid var(--border-subtle)',
                  display: 'flex', flexDirection: 'column', gap: '5px', cursor: 'pointer'
                }
              },
                React.createElement('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', minHeight: '20px' } },
                  ParticipantBackdrop ? React.createElement(ParticipantBackdrop, { participant, name: item.participantId || '참여자', dotSize: 9 }) : React.createElement('span', { style: { color: participant.color || '#2563EB', fontWeight: 800 } }, `● ${item.participantId || '참여자'}`),
                  React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '5px' } },
                  React.createElement('button', {
                    type: 'button',
                    onClick: (e) => { e.stopPropagation(); handleSelectPersonalExpenseItem(item); },
                    title: '개인 지출 편집', 'aria-label': '개인 지출 편집',
                    style: { background: 'none', border: '1px solid #CBD5E1', borderRadius: '6px', color: '#64748B', cursor: 'pointer', padding: '2px 4px', display: 'inline-flex', alignItems: 'center' }
                  }, React.createElement(PencilIcon, { size: 13 })),
                  React.createElement('button', {
                    type: 'button',
                    onClick: (e) => handleDeletePersonalExpenseItem(item.id, e),
                    title: '항목 삭제',
                    style: { background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '2px 4px' }
                  }, React.createElement(TrashIcon, { size: 14 }))
                  )
                ),
                item.description ? React.createElement('div', { style: { color: 'var(--text-main)', fontWeight: 700, fontSize: '0.8rem', overflowWrap: 'anywhere' } }, item.description) : null,
                React.createElement('strong', { style: { alignSelf: 'flex-start', color: item?.signedAmount && Number(item.amount) > 0 ? 'var(--status-green)' : '#DC2626', fontWeight: 800, fontSize: '0.86rem', marginTop: '1px' } }, `${item?.signedAmount && Number(item.amount) > 0 ? '+' : '-'}${Math.abs(Number(item.amount) || 0).toLocaleString()}원`)
              );
            })
          )
        )
      )
    ),

    /* Modal Footer */
    React.createElement('div', {
      className: 'modal-footer',
        style: { padding: '12px 18px', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', flexWrap: 'nowrap' }
    },
      /* Left footer actions: Delete & Close Status */
      React.createElement('div', { style: { display: 'flex', gap: '6px', alignItems: 'center' } },
        isEditing && React.createElement('button', {
          type: 'button', className: 'btn btn-danger',
          onClick: () => {
            if (typeof onDeleteCard === 'function') onDeleteCard(cardToEdit.id);
            if (onClose) onClose();
          },
          style: { borderRadius: '8px', fontSize: '0.8rem', fontWeight: 800 }
        }, '삭제'),
        isEditing && React.createElement('button', {
          type: 'button', className: 'btn btn-secondary',
          onClick: () => {
            if (typeof onToggleStatus === 'function') onToggleStatus(cardToEdit.id);
            if (onClose) onClose();
          },
          style: { borderRadius: '8px', fontSize: '0.8rem', fontWeight: 800 }
        }, cardToEdit?.status === 'closed' ? '마감 해제' : '마감')
      ),
      /* Right footer actions: Cancel & Save (Black background, white text) */
      React.createElement('div', { style: { display: 'flex', gap: '8px', alignItems: 'center' } },
        React.createElement('button', {
          type: 'button', className: 'btn btn-secondary', onClick: onClose, style: { borderRadius: '8px', fontSize: '0.8rem', background: 'none', border: 0 }
        }, '취소'),
        React.createElement('button', {
          type: 'button',
          className: 'btn',
          onClick: handleSave,
          disabled: isSavingSettlementCard,
          style: {
            borderRadius: '8px', fontWeight: 800, fontSize: '0.84rem',
            backgroundColor: '#0F172A', color: '#FFFFFF', border: 'none', padding: '8px 20px',
            cursor: isSavingSettlementCard ? 'wait' : 'pointer', opacity: isSavingSettlementCard ? 0.7 : 1
          }
        }, isSavingSettlementCard ? '저장 중...' : (isEditing ? '수정' : '생성'))
      )
    )
  )),
  isSettlementCardPreviewOpen && React.createElement('div', {
    className: 'modal-overlay',
    onClick: () => setIsSettlementCardPreviewOpen(false),
    style: { zIndex: 12000 }
  }, React.createElement(ResizableModalContainer, {
    className: 'modal-container',
    onClick: e => e.stopPropagation(),
    style: { width: '92%', maxWidth: '430px', maxHeight: '88vh', display: 'flex', flexDirection: 'column' }
  },
    React.createElement('div', { className: 'modal-header', style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: '1px solid var(--border-subtle)' } },
      React.createElement('h3', { style: { margin: 0, fontSize: '1rem', fontWeight: 900, color: 'var(--text-main)' } }, '정산 카드 미리보기'),
      React.createElement('button', { type: 'button', onClick: () => setIsSettlementCardPreviewOpen(false), style: { border: 0, background: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem' } }, '✕')
    ),
    React.createElement('div', { className: 'modal-body', style: { overflowY: 'auto', padding: '14px', display: 'flex', flexDirection: 'column', gap: '12px', background: 'linear-gradient(145deg, #EEF2FF, #FDF2F8)' } },
      React.createElement('div', { style: { padding: '16px', borderRadius: '14px', background: 'linear-gradient(135deg, #4F46E5, #DB2777)', color: '#FFFFFF', boxShadow: '0 8px 20px rgba(79,70,229,0.18)' } },
        React.createElement('div', { style: { fontSize: '0.72rem', opacity: 0.82, marginBottom: '4px' } }, cardToEdit?.status === 'closed' ? '마감된 정산' : '진행중인 정산'),
        React.createElement('div', { style: { fontSize: '1.08rem', fontWeight: 900, marginBottom: '12px' } }, title || '1/N 간편 송금'),
        React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'end', gap: '8px' } },
          React.createElement('span', { style: { fontSize: '0.8rem', fontWeight: 700 } }, '총 지출'),
          React.createElement('strong', { style: { fontSize: '1.25rem', color: '#F0ABFC' } }, `${totalExpense.toLocaleString()}원`)
        )
      ),
      React.createElement('div', { style: { padding: '12px', borderRadius: '10px', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' } },
        React.createElement('div', { style: { fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '8px' } }, `기준 분담금: 약 ${settlementPerPerson.toLocaleString()}원 (총 지출 ÷ ${Math.max(1, participantRows.length)}명)`),
        participantRows.length === 0
          ? React.createElement('div', { style: { fontSize: '0.78rem', color: 'var(--text-muted)' } }, '등록된 참여자가 없습니다.')
          : participantRows.map(row => {
            const amount = getIndividualSettlementAmount(row.participantId);
            const isRefund = amount < 0;
            return React.createElement('div', { key: `preview_${row.id}`, style: { display: 'flex', justifyContent: 'space-between', gap: '8px', padding: '7px 0', borderTop: '1px solid var(--border-subtle)', fontSize: '0.8rem' } },
              React.createElement('span', { style: { display: 'inline-flex', alignItems: 'center', gap: '6px' } },
                `${row.participantId}님`,
                React.createElement('span', {
                  style: isRefund
                    ? { display: 'inline-flex', alignItems: 'center', padding: '1px 8px', borderRadius: '999px', border: '1px solid var(--status-green)', color: 'var(--status-green)', fontSize: '0.7rem', fontWeight: 800, whiteSpace: 'nowrap' }
                    : { display: 'inline-flex', alignItems: 'center', padding: '1px 8px', borderRadius: '999px', backgroundColor: '#DC2626', color: '#FFFFFF', fontSize: '0.7rem', fontWeight: 800, whiteSpace: 'nowrap' }
                }, isRefund ? '(환급예정)' : '(입금요청)')
              ),
              React.createElement('strong', { style: { color: amount < 0 ? 'var(--status-green)' : '#DC2626', whiteSpace: 'nowrap' } }, `${amount < 0 ? '환급금 +' : '분담금 -'}${Math.abs(amount).toLocaleString()}원`)
            );
          })
      ),
      React.createElement('div', { style: { padding: '12px', borderRadius: '10px', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' } },
        React.createElement('div', { style: { fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '7px' } }, '송금계좌 정보'),
        React.createElement('div', { style: { fontSize: '0.86rem', fontWeight: 800, color: 'var(--text-main)' } }, `${bankName === '기타' ? otherBankName || '기타' : bankName} ${accountNumber || '계좌번호 미입력'}`),
        depositorName && React.createElement('div', { style: { marginTop: '3px', fontSize: '0.78rem', color: 'var(--text-muted)' } }, `예금주: ${depositorName}`)
      ),
      React.createElement('div', { style: { padding: '12px', borderRadius: '10px', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' } },
        React.createElement('div', { style: { fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '7px' } }, `정산목록 (${Object.keys(checkedItems).length}건)`),
        Object.values(checkedItems).length === 0
          ? React.createElement('div', { style: { fontSize: '0.78rem', color: 'var(--text-muted)' } }, '선택된 지출 항목이 없습니다.')
          : Object.values(checkedItems).map((item, index) => React.createElement('div', { key: item.itemKey || index, style: { display: 'flex', justifyContent: 'space-between', gap: '8px', padding: '7px 0', borderTop: '1px solid var(--border-subtle)', fontSize: '0.78rem' } },
            React.createElement('span', { style: { minWidth: 0, overflowWrap: 'anywhere' } }, `${formatShortDateWithDay(item.date)} · ${item.label || '정산 항목'}`),
            React.createElement('strong', { style: { color: '#DC2626', whiteSpace: 'nowrap' } }, `-${Math.abs(Number(item.amount) || 0).toLocaleString()}원`)
          ))
      ),
      React.createElement('button', {
        type: 'button',
        onClick: handleDownloadSettlementCardImage,
        style: {
          width: '100%', padding: '11px', borderRadius: '10px', border: 'none',
          backgroundColor: '#0F172A', color: '#FFFFFF', fontSize: '0.84rem', fontWeight: 800, cursor: 'pointer'
        }
      }, '이미지로 다운받기')
    ),
    React.createElement('div', { className: 'modal-footer', style: { display: 'flex', justifyContent: 'flex-end', padding: '10px 14px', borderTop: '1px solid var(--border-subtle)' } },
      React.createElement('button', { type: 'button', className: 'btn btn-secondary', onClick: () => setIsSettlementCardPreviewOpen(false) }, '닫기')
    )
  )),
  settlementCardImageUrl && React.createElement('div', {
    className: 'modal-overlay',
    onClick: () => setSettlementCardImageUrl(null),
    style: { zIndex: 12500 }
  }, React.createElement(ResizableModalContainer, {
    className: 'modal-container',
    onClick: e => e.stopPropagation(),
    style: { width: '90%', maxWidth: '360px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }
  },
    React.createElement('img', { src: settlementCardImageUrl, alt: '정산 카드 이미지', decoding: 'async', style: { width: '100%', borderRadius: '10px', border: '1px solid var(--border-subtle)' } }),
    React.createElement('div', { style: { fontSize: '0.76rem', color: 'var(--text-muted)', textAlign: 'center' } }, '이미지를 길게 눌러 저장하거나, 아래 버튼으로 다운로드하세요'),
    React.createElement('div', { style: { display: 'flex', gap: '8px', width: '100%' } },
      React.createElement('button', {
        type: 'button', className: 'btn btn-secondary', style: { flex: 1 },
        onClick: () => setSettlementCardImageUrl(null)
      }, '닫기'),
      React.createElement('a', {
        href: settlementCardImageUrl,
        download: `${title || '정산'}_정산카드.jpg`,
        className: 'btn btn-primary',
        style: { flex: 1, textAlign: 'center', textDecoration: 'none' }
      }, '다운로드')
    )
  )));
}

export function SettlementSummaryModal({ calendar, onBack, onSelectDate, onOpenShare, onOpenAppSettings, onChangeView, onOpenCreateSettlement, onOpenSettlementEditor, onToggleSettlementCardStatus, onDeleteSettlementCard, onSaveSettlementCard, chatCount = 0, settlementBadge = null, galleryCount = 0, placeCount = 0, memoCount = 0, chatLastAuthor = null, settlementLastDate = null, galleryLastDate = null, placeLastName = null, memoLastTitleWord = null, showToast }) {
  const React = window.React;
  const __deps = window.GATHER_UI_DEPS || {};
  const __comp = window.GATHER_UI_COMPONENTS || {};
  const BackArrowIcon = __comp.BackArrowIcon || __deps.BackArrowIcon || (function () { return '←'; });
  const BanknoteArrowDownIcon = __comp.BanknoteArrowDownIcon || __deps.BanknoteArrowDownIcon || (function () { return '↓'; });
  const BanknoteArrowUpIcon = __comp.BanknoteArrowUpIcon || __deps.BanknoteArrowUpIcon || (function () { return '↑'; });
  const CalendarCheckIcon = __comp.CalendarCheckIcon || __deps.CalendarCheckIcon || (function () { return '📅'; });
  const ChartBarIcon = __comp.ChartBarIcon || __deps.ChartBarIcon || (function () { return '📊'; });
  const PiggyBankIcon = __comp.PiggyBankIcon || __deps.PiggyBankIcon || (function () { return '🐷'; });
  const ResizableModalContainer = __comp.ResizableModalContainer || __deps.ResizableModalContainer || (function Shell(p) { return React.createElement('div', p, p.children); });
  const SectionToggleButton = __comp.SectionToggleButton || __deps.SectionToggleButton || (function Shell(p) { return React.createElement('div', p, p.children); });
  const SegmentedToggle = __comp.SegmentedToggle || __deps.SegmentedToggle || (function Shell(p) { return React.createElement('div', p, p.children); });
  const ShareIcon = __comp.ShareIcon || __deps.ShareIcon || (function () { return '🔗'; });
  const SharedSideMenuFooter = __comp.SharedSideMenuFooter || __deps.SharedSideMenuFooter || (function Shell(p) { return React.createElement('div', p, p.children); });
  const SharedAppNavBlock = __comp.SharedAppNavBlock || __deps.SharedAppNavBlock || (function Shell(p) { return React.createElement('div', p, p.children); });
  const ThreeLinesIcon = __comp.ThreeLinesIcon || __deps.ThreeLinesIcon || (function () { return '☰'; });
  const WeatherBadge = __comp.WeatherBadge || __deps.WeatherBadge || (function () { return null; });
  const CreateSettlementModalComp = __comp.CreateSettlementModal || CreateSettlementModal;
  const [isSettlementMenuOpen, setIsSettlementMenuOpen] = React.useState(false);
  const [isSettlementListOpen, setIsSettlementListOpen] = React.useState(false);
  const [isCreateSettlementOpen, setIsCreateSettlementOpen] = React.useState(false);
  const [editingSettlementCard, setEditingSettlementCard] = React.useState(null);
  const sanitizeText = __deps.sanitizeText;
  const extractFirstUrl = __deps.extractFirstUrl;
  const formatChatHeaderTitle = __deps.formatChatHeaderTitle;
  const canUseSettlement = isSettlementEnabledCalendarId(calendar?.id);

  const handleOpenCreateSettlement = () => {
    setIsSettlementMenuOpen(false);
    if (!canUseSettlement) {
      if (showToast) showToast('이 캘린더에서는 정산을 사용할 수 없습니다.', 'info');
      return;
    }
    if (typeof onOpenCreateSettlement === 'function') {
      onOpenCreateSettlement();
    } else {
      setIsCreateSettlementOpen(true);
    }
  };

  const handleCopySettlementBankInfo = async (bankInfoText) => {
    if (!bankInfoText) return;
    const copied = await copyTextToClipboard(bankInfoText);
    if (showToast) showToast(copied ? '계좌번호가 클립보드에 복사되었습니다.' : '계좌번호 복사에 실패했습니다.', copied ? 'success' : 'error');
  };

  const handleOpenSettlementEditor = (card) => {
    setOpenMenuCardId(null);
    if (typeof onOpenSettlementEditor === 'function') {
      onOpenSettlementEditor(card);
      setIsSettlementListOpen(false);
      return;
    }
    // Keep the editor in this summary's render tree. The settlement page has an
    // early return path, so routing this action through the page owner can lose
    // the modal even though the click handler itself ran.
    setIsCreateSettlementOpen(true);
    setEditingSettlementCard({ ...card });
  };

  const { isHeaderVisible, onScroll: handleSettlementScroll } = useScrollHideHeader();
  const [activeTab, setActiveTab] = React.useState('total');
  const [openMenuCardId, setOpenMenuCardId] = React.useState(null);
  const [collapsedDailyRows, setCollapsedDailyRows] = React.useState({});
  const categories = getExpenseCategories(calendar);
  const baseBudget = Number.isFinite(Number(calendar?.settlementBaseBudget)) ? Math.max(0, Math.round(Number(calendar.settlementBaseBudget))) : 0;
  // Income entries have no meaningful expense category of their own (their categoryId is
  // whatever was selected/defaulted at entry time, usually '기타') -- badge them as 수입 instead
  // of showing a misleading expense category, and keep them out of "카테고리별 지출" entirely
  // since that section is specifically about expense breakdown, not income. INCOME_EXPENSE_CATEGORY
  // is the shared module-level constant (see isExpenseIncomeEntry/getDisplayExpenseCategory).
  const getDisplayCategory = item => (item.isIncome ? INCOME_EXPENSE_CATEGORY : item.category);
  const getExpenseUrl = expense => sanitizeText(expense?.url || extractFirstUrl(expense?.label || ''), 220);
  const getExpenseLabel = expense => {
    const label = sanitizeText(expense?.label || '', 120);
    const url = getExpenseUrl(expense);
    return url ? sanitizeText(removeFirstUrl(label), 120) : label;
  };

  const today = new Date();
  const [year, setYear] = React.useState(today.getFullYear());
  const [month, setMonth] = React.useState(today.getMonth()); // 0-indexed
  const [isPickerOpen, setIsPickerOpen] = React.useState(false);
  const [pickerYear, setPickerYear] = React.useState(today.getFullYear());
  const [pickerMonth, setPickerMonth] = React.useState(today.getMonth());
  const monthNames = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];

  const handleOpenPicker = () => {
    setPickerYear(year);
    setPickerMonth(month);
    setIsPickerOpen(true);
  };
  const onPrevMonth = () => {
    if (month === 0) {
      setYear(y => y - 1);
      setMonth(11);
    } else {
      setMonth(m => m - 1);
    }
  };
  const onNextMonth = () => {
    if (month === 11) {
      setYear(y => y + 1);
      setMonth(0);
    } else {
      setMonth(m => m + 1);
    }
  };
  const onToday = () => {
    const d = new Date();
    setYear(d.getFullYear());
    setMonth(d.getMonth());
  };
  const handlePickerApply = () => {
    setYear(pickerYear);
    setMonth(pickerMonth);
    setIsPickerOpen(false);
  };
  const toggleDailyRow = date => {
    setCollapsedDailyRows(prev => ({ ...prev, [date]: !prev[date] }));
  };

  const allTimeRows = getConfirmedMeetings(calendar).slice().sort((a, b) => b.date.localeCompare(a.date))
    .map(meeting => {
      const items = orderSettlementItemsForDisplay((Array.isArray(meeting.expenses) ? meeting.expenses : [])
        .filter(expense => Number.isFinite(Number(expense.amount)) && Number(expense.amount) !== 0)
        .map((expense, index) => {
          const amount = Number(expense.amount || 0);
          const isIncome = isExpenseIncomeEntry(expense);
          return {
            ...expense,
            amount,
            isIncome,
            category: getExpenseCategory(calendar, expense.categoryId),
            label: getExpenseLabel(expense) || '정산 항목',
            url: getExpenseUrl(expense),
            ledgerKey: `${meeting.date}|${expense.id || index}|${expense.createdAt || ''}|${amount}`
          };
        }));
      const expenseTotal = items.filter(item => !item.isIncome).reduce((sum, item) => sum + Math.abs(item.amount), 0);
      const incomeTotal = items.filter(item => item.isIncome).reduce((sum, item) => sum + Math.abs(item.amount), 0);
      return { meeting, items, expenseTotal, incomeTotal, net: incomeTotal - expenseTotal };
    })
    .filter(row => row.items.length > 0);
  const allTimeItems = allTimeRows.flatMap(row => row.items.map(item => ({ ...item, date: row.meeting.date, meetingNote: row.meeting.note || '' })));
  const settlementBalanceByKey = new Map();
  let runningSettlementBalance = baseBudget;
  allTimeItems.slice().reverse().forEach(item => {
    runningSettlementBalance += item.isIncome ? Math.abs(item.amount) : -Math.abs(item.amount);
    settlementBalanceByKey.set(item.ledgerKey, runningSettlementBalance);
  });
  const allTimeIncome = baseBudget + allTimeItems.filter(item => item.isIncome).reduce((sum, item) => sum + Math.abs(item.amount), 0);
  const allTimeExpense = allTimeItems.filter(item => !item.isIncome).reduce((sum, item) => sum + Math.abs(item.amount), 0);
  const settlementParticipants = getActiveParticipants(calendar);
  const getCalendarSettlementCards = __deps.getCalendarSettlementCards || (c => Array.isArray(c?.settlementCards) ? c.settlementCards : []);
  const customSettlementCards = getCalendarSettlementCards(calendar);
  const allSettlementCards = customSettlementCards.length > 0 ? customSettlementCards : [{
    id: 'default_settlement_card',
    title: '1/N 간편 송금',
    status: 'active',
    participantCount: Math.max(1, settlementParticipants.length),
    perPersonAmount: Math.round(allTimeExpense / Math.max(1, settlementParticipants.length)),
    amount: allTimeExpense,
    bankName: '토스뱅크',
    depositorName: '',
    accountNumber: ''
  }];
  const getSettlementCardTime = card => {
    const value = card?.updatedAt || card?.createdAt || 0;
    const numeric = Number(value);
    return Number.isFinite(numeric) && numeric > 0 ? numeric : (Date.parse(value) || 0);
  };
  const sortedSettlementCards = allSettlementCards.slice().sort((a, b) => {
    const aClosed = a?.status === 'closed';
    const bClosed = b?.status === 'closed';
    if (aClosed !== bClosed) return aClosed ? 1 : -1;
    return getSettlementCardTime(b) - getSettlementCardTime(a);
  });
  const visibleSettlementCards = sortedSettlementCards.filter(card => card?.status !== 'closed');
  const overallBalance = allTimeIncome - allTimeExpense;

  const targetPrefix = `${year}-${String(month + 1).padStart(2, '0')}-`;
  const rows = getConfirmedMeetings(calendar).slice().sort((a, b) => b.date.localeCompare(a.date))
    .filter(meeting => activeTab === 'total' || meeting.date.startsWith(targetPrefix))
    .map(meeting => {
      const items = orderSettlementItemsForDisplay((Array.isArray(meeting.expenses) ? meeting.expenses : [])
        .filter(expense => Number.isFinite(Number(expense.amount)) && Number(expense.amount) !== 0)
        .sort((a, b) => {
          const aOrder = Number.isFinite(Number(a.order)) ? Number(a.order) : Number.POSITIVE_INFINITY;
          const bOrder = Number.isFinite(Number(b.order)) ? Number(b.order) : Number.POSITIVE_INFINITY;
          if (aOrder !== bOrder) return aOrder - bOrder;
          return (a.createdAt || 0) - (b.createdAt || 0);
        })
        .map((expense, index) => {
          const amount = Number(expense.amount || 0);
          const isIncome = isExpenseIncomeEntry(expense);
          return {
            ...expense,
            amount,
            isIncome,
            category: getExpenseCategory(calendar, expense.categoryId),
            label: getExpenseLabel(expense) || '정산 항목',
            url: getExpenseUrl(expense),
            ledgerKey: `${meeting.date}|${expense.id || index}|${expense.createdAt || ''}|${amount}`
          };
        }));
      const expenseTotal = items.filter(item => !item.isIncome).reduce((sum, item) => sum + Math.abs(item.amount), 0);
      const incomeTotal = items.filter(item => item.isIncome).reduce((sum, item) => sum + Math.abs(item.amount), 0);
      return { meeting, items, expenseTotal, incomeTotal, net: incomeTotal - expenseTotal };
    })
    .filter(row => row.items.length > 0);

  const allItems = rows.flatMap(row => row.items.map(item => ({ ...item, date: row.meeting.date, meetingNote: row.meeting.note || '' })));
  const incomeItems = allItems.filter(item => item.isIncome);
  const expenseItems = allItems.filter(item => !item.isIncome);

  const displayIncome = activeTab === 'total'
    ? allTimeIncome
    : incomeItems.reduce((sum, item) => sum + Math.abs(item.amount), 0);

  const displayExpense = activeTab === 'total'
    ? allTimeExpense
    : expenseItems.reduce((sum, item) => sum + Math.abs(item.amount), 0);

  // 일자별보기(선택된 월)일 때는 그 달의 수입-지출 순액을, 누적보기일 때는 baseBudget까지 포함한
  // 전체 기간 잔액을 보여준다 -- displayIncome/displayExpense가 이미 탭에 따라 그 값들을 계산해
  // 두므로 둘의 차만 내면 두 경우 모두 올바른 값이 나온다.
  const displayBalance = activeTab === 'total' ? overallBalance : (displayIncome - displayExpense);

  const allTimeExpenseItems = allTimeItems.filter(item => !item.isIncome);
  const categoryTotals = categories.map(category => ({
    category,
    total: allTimeExpenseItems.filter(item => item.category.id === category.id).reduce((sum, item) => sum + Math.abs(item.amount), 0),
    count: allTimeExpenseItems.filter(item => item.category.id === category.id).length
  })).filter(item => item.total > 0 || item.count > 0);

  const monthLabelPrefix = `${month + 1}월`;
  const metricCards = [
    { label: activeTab === 'total' ? '총 수입' : `${monthLabelPrefix} 수입`, value: displayIncome, color: 'var(--status-green)', icon: React.createElement(BanknoteArrowUpIcon, { size: 16 }) },
    { label: activeTab === 'total' ? '총 지출' : `${monthLabelPrefix} 지출`, value: displayExpense, color: '#DC2626', icon: React.createElement(BanknoteArrowDownIcon, { size: 16 }) },
    { label: activeTab === 'total' ? '현재 잔액' : `${monthLabelPrefix} 잔액`, value: displayBalance, color: 'var(--text-main)', icon: React.createElement(PiggyBankIcon, { size: 16 }) }
  ];

  // Shareable result card -- rendered client-side onto an offscreen canvas so it can be saved
  // as a plain image and pasted into KakaoTalk/문자 without anyone needing app access. Shown in
  // an overlay (not auto-downloaded) since a direct file download is unreliable on iOS Safari;
  // long-pressing the image to save works everywhere, and the download link below it covers
  // desktop/Android.
  const [shareImageUrl, setShareImageUrl] = React.useState(null);
  const periodLabel = activeTab === 'total' ? '전체 기간' : `${year}년 ${month + 1}월`;
  const handleGenerateShareImage = () => {
    const canvas = document.createElement('canvas');
    const W = 720, H = 960;
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#F8FAFC';
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = '#4F46E5';
    ctx.fillRect(0, 0, W, 160);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '700 22px sans-serif';
    ctx.fillText(calendar?.title || '모여라 캘린더', 40, 60);
    ctx.font = '900 34px sans-serif';
    ctx.fillText('회비 정산 결과', 40, 105);
    ctx.font = '500 18px sans-serif';
    ctx.fillText(periodLabel, 40, 138);

    const rowsStats = [
      { label: activeTab === 'total' ? '총 수입' : `${monthLabelPrefix} 수입`, value: displayIncome, color: 'var(--status-green)' },
      { label: activeTab === 'total' ? '총 지출' : `${monthLabelPrefix} 지출`, value: displayExpense, color: '#DC2626' },
      { label: activeTab === 'total' ? '현재 잔액' : `${monthLabelPrefix} 잔액`, value: displayBalance, color: '#0F172A' }
    ];
    let y = 230;
    rowsStats.forEach(stat => {
      ctx.fillStyle = '#64748B';
      ctx.font = '600 18px sans-serif';
      ctx.fillText(stat.label, 40, y);
      ctx.fillStyle = stat.color;
      ctx.font = '900 30px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(`${stat.value < 0 ? '-' : ''}${Math.abs(stat.value).toLocaleString()}원`, W - 40, y + 2);
      ctx.textAlign = 'left';
      y += 56;
    });

    y += 16;
    ctx.strokeStyle = '#E2E8F0';
    ctx.beginPath();
    ctx.moveTo(40, y);
    ctx.lineTo(W - 40, y);
    ctx.stroke();
    y += 40;

    ctx.fillStyle = '#0F172A';
    ctx.font = '800 18px sans-serif';
    ctx.fillText('카테고리별 지출', 40, y);
    y += 30;

    const topCategories = categoryTotals.slice().sort((a, b) => b.total - a.total).slice(0, 6);
    const maxCategoryTotal = Math.max(1, ...topCategories.map(c => c.total));
    topCategories.forEach(item => {
      ctx.fillStyle = '#334155';
      ctx.font = '600 15px sans-serif';
      ctx.fillText(item.category.name, 40, y);
      ctx.textAlign = 'right';
      ctx.fillText(`${item.total.toLocaleString()}원`, W - 40, y);
      ctx.textAlign = 'left';
      y += 10;
      const barW = Math.max(6, Math.round((item.total / maxCategoryTotal) * (W - 80)));
      ctx.fillStyle = '#E2E8F0';
      ctx.fillRect(40, y, W - 80, 8);
      ctx.fillStyle = item.category.color || '#6366F1';
      ctx.fillRect(40, y, barW, 8);
      y += 34;
    });
    if (topCategories.length === 0) {
      ctx.fillStyle = '#94A3B8';
      ctx.font = '500 15px sans-serif';
      ctx.fillText('등록된 지출 항목이 없습니다.', 40, y);
      y += 34;
    }

    ctx.fillStyle = '#94A3B8';
    ctx.font = '500 13px sans-serif';
    ctx.fillText(`모여라 캘린더 · ${new Date().toLocaleDateString('ko-KR')} 생성`, 40, H - 30);

    setShareImageUrl(canvas.toDataURL('image/png'));
  };

  const categoryBadge = category => /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '5px',
      padding: '4px 9px',
      borderRadius: '999px',
      backgroundColor: `${category.color}18`,
      color: category.color,
      fontSize: '0.68rem',
      fontWeight: 900,
      whiteSpace: 'nowrap'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: { width: '7px', height: '7px', borderRadius: '50%', backgroundColor: category.color }
  }), category.name);

  const renderItemRow = (item, showDate = false) => /*#__PURE__*/React.createElement("div", {
    key: item.id || `${item.date}_${item.createdAt}_${item.amount}`,
    onClick: () => onSelectDate && onSelectDate(item.date),
    style: { display: 'flex', flexDirection: 'column', gap: '5px', padding: '10px 12px', border: '0', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-card)', cursor: onSelectDate ? 'pointer' : 'default' }
  }, /*#__PURE__*/React.createElement("div", {
    style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }
  }, /*#__PURE__*/React.createElement("div", {
    style: { minWidth: 0, display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }
  }, categoryBadge(getDisplayCategory(item)), showDate && /*#__PURE__*/React.createElement("span", { className: "registered-at-text" }, formatDateWithDayName(item.date))), /*#__PURE__*/React.createElement("strong", {
    style: { fontSize: '0.9rem', color: item.isIncome ? 'var(--status-green)' : '#DC2626', whiteSpace: 'nowrap' }
  }, item.isIncome ? '+' : '-', Math.abs(item.amount).toLocaleString(), "원")), /*#__PURE__*/React.createElement("span", {
    style: { fontSize: '0.86rem', color: 'var(--text-main)', fontWeight: 500, overflowWrap: 'anywhere' }
  }, item.label), /*#__PURE__*/React.createElement("span", {
    className: "settlement-running-balance"
  }, `잔액\u00a0\u00a0\u00a0${Number(settlementBalanceByKey.get(item.ledgerKey) || 0).toLocaleString()}원`), item.url && /*#__PURE__*/React.createElement("button", {
    type: "button",
    title: item.url,
    style: {
      alignSelf: 'flex-start',
      border: 0,
      cursor: 'pointer',
      textDecoration: 'none',
      display: 'inline-flex',
      alignItems: 'center',
      padding: '3px 10px',
      borderRadius: 'var(--radius-full)',
      fontSize: '0.72rem',
      fontWeight: 400,
      backgroundColor: 'var(--border-subtle)',
      color: 'var(--text-muted)',
      wordBreak: 'break-all',
      maxWidth: '100%',
      textAlign: 'left'
    },
    onClick: e => { e.stopPropagation(); window.open(item.url, '_blank', 'noopener,noreferrer'); }
  }, item.url));

  const emptyContent = /*#__PURE__*/React.createElement("div", {
    style: { padding: '30px 12px', color: '#94A3B8', fontSize: '0.88rem', textAlign: 'center' }
  }, "등록된 정산 내역이 없습니다.");

  const totalContent = /*#__PURE__*/React.createElement("div", {
    style: { display: 'flex', flexDirection: 'column', gap: '12px' }
  }, /*#__PURE__*/React.createElement("section", {
    style: { border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '12px', background: 'var(--bg-primary)' }
  }, /*#__PURE__*/React.createElement("h4", {
    style: { margin: '0 0 10px', fontSize: '0.92rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '6px' }
  }, /*#__PURE__*/React.createElement(ChartBarIcon, null), "카테고리별 지출"), categoryTotals.length === 0 ? /*#__PURE__*/React.createElement("div", {
    style: { color: '#94A3B8', fontSize: '0.82rem' }
  }, "아직 지출 항목이 없습니다.") : categoryTotals.map(item => /*#__PURE__*/React.createElement("div", {
    key: item.category.id,
    style: { display: 'grid', gridTemplateColumns: 'auto minmax(0, 1fr) auto', gap: '8px', alignItems: 'center', marginTop: '8px' }
  }, categoryBadge(item.category), /*#__PURE__*/React.createElement("div", {
    style: { height: '8px', borderRadius: '999px', background: 'var(--border-subtle)', overflow: 'hidden' }
  }, /*#__PURE__*/React.createElement("div", {
    style: { width: `${allTimeExpense ? Math.max(4, item.total / allTimeExpense * 100) : 0}%`, height: '100%', background: item.category.color, borderRadius: '999px' }
  })), /*#__PURE__*/React.createElement("strong", {
    style: { fontSize: '0.8rem', color: 'var(--text-main)', whiteSpace: 'nowrap' }
  }, item.total.toLocaleString(), "원")))), /*#__PURE__*/React.createElement("section", {
    style: { display: 'flex', flexDirection: 'column', gap: '8px' }
  }, baseBudget > 0 && /*#__PURE__*/React.createElement("div", {
    className: 'settlement-base-budget-card', style: { display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto', gap: '10px', alignItems: 'center', padding: '10px 12px', border: '1px solid #BBF7D0', borderRadius: 'var(--radius-md)', background: '#F0FDF4' }
  }, /*#__PURE__*/React.createElement("div", {
    style: { display: 'flex', flexDirection: 'column', gap: '4px' }
  }, /*#__PURE__*/React.createElement("strong", {
    style: { color: 'var(--status-green)', fontSize: '0.86rem' }
  }, "기초 예산"), /*#__PURE__*/React.createElement("span", {
    className: "registered-at-text"
  }, "어드민에서 설정한 누적 잔액")), /*#__PURE__*/React.createElement("strong", {
    style: { color: 'var(--status-green)', whiteSpace: 'nowrap' }
  }, "+", baseBudget.toLocaleString(), "원")), allTimeItems.map(item => renderItemRow(item, true))));

  const monthEmptyContent = /*#__PURE__*/React.createElement("div", {
    style: { padding: '40px 12px', color: 'var(--text-muted)', fontSize: '0.88rem', textAlign: 'center' }
  }, `${year}년 ${month + 1}월 정산 내역이 없습니다.`);

  const dailyContent = rows.length === 0 ? monthEmptyContent : /*#__PURE__*/React.createElement("div", {
    style: { display: 'flex', flexDirection: 'column', gap: '10px' }
  }, rows.map(row => {
    const isCollapsed = !!collapsedDailyRows[row.meeting.date];
    return /*#__PURE__*/React.createElement("section", {
      key: row.meeting.date,
      style: { border: '0', borderRadius: 'var(--radius-md)', padding: '12px', backgroundColor: 'var(--bg-primary)' }
    }, /*#__PURE__*/React.createElement("div", {
      style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', marginBottom: isCollapsed ? 0 : '10px' }
    }, /*#__PURE__*/React.createElement("strong", {
      style: { fontSize: '0.92rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }
    }, /*#__PURE__*/React.createElement(CalendarCheckIcon, null), formatShortDateWithDayName(row.meeting.date)), /*#__PURE__*/React.createElement("span", {
      style: { display: 'inline-flex', alignItems: 'center', gap: '6px', marginLeft: 'auto', whiteSpace: 'nowrap' }
    }, /*#__PURE__*/React.createElement("span", {
      // Capsule badge (not plain colored text) so this per-date total reads distinctly from the
      // plain +/- colored amounts on the expense rows below it.
      style: {
        fontSize: '0.8rem', fontWeight: 900, color: '#FFFFFF',
        backgroundColor: row.net < 0 ? '#DC2626' : 'var(--status-green)',
        padding: '4px 10px', borderRadius: '999px'
      }
    }, row.net >= 0 ? '+' : '-', Math.abs(row.net).toLocaleString(), "원"), /*#__PURE__*/React.createElement(SectionToggleButton, {
      collapsed: isCollapsed,
      onToggle: () => toggleDailyRow(row.meeting.date),
      label: `${formatShortDateWithDayName(row.meeting.date)} 정산`
    }))), !isCollapsed && /*#__PURE__*/React.createElement("div", {
      style: { display: 'flex', flexDirection: 'column', gap: '8px' }
    }, row.items.map(item => renderItemRow({ ...item, date: row.meeting.date }, false))));
  }));

  const bodyContent = allTimeItems.length === 0 && baseBudget === 0 ? emptyContent : activeTab === 'total' ? totalContent : dailyContent;

  return /*#__PURE__*/React.createElement("div", {
    className: "settlement-page-container",
    style: {
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'var(--bg-primary)', display: 'flex', flexDirection: 'column',
      width: '100%', maxWidth: '100%', overflow: 'hidden', zIndex: 1005
    }
  },
    /* Floating back button -- always fixed in place; gains a shadow once the header itself
       has scrolled out of view, matching the chat room / memo page back button behavior. */
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
    /*#__PURE__*/React.createElement("div", {
    className: "settlement-page-header",
    style: {
      position: 'fixed', top: 0, left: 0, right: 0, height: '56px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px',
      backgroundColor: 'var(--bg-card)', borderBottom: '1px solid var(--border-subtle)',
      zIndex: 1010, transition: 'transform 0.3s ease',
      transform: isHeaderVisible ? 'translateY(0)' : 'translateY(-100%)'
    }
  }, /*#__PURE__*/React.createElement("div", { style: { width: '32px', flexShrink: 0 } }), /*#__PURE__*/React.createElement("h3", {
    style: {
      fontSize: '1.05rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '8px', margin: 0, color: 'var(--text-main)',
      position: 'absolute', left: '50%', transform: 'translateX(-50%)', pointerEvents: 'none'
    }
  }, formatChatHeaderTitle(calendar?.title), " 정산"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setIsSettlementMenuOpen(true),
    title: "메뉴",
    "aria-label": "메뉴",
    style: {
      marginLeft: 'auto',
      width: '32px', height: '32px', borderRadius: '50%', border: 'none',
      backgroundColor: 'transparent', cursor: 'pointer', display: 'flex',
      alignItems: 'center', justifyContent: 'center', color: '#64748B', padding: 0
    }
  }, ThreeLinesIcon ? /*#__PURE__*/React.createElement(ThreeLinesIcon, { size: 20 }) : /*#__PURE__*/React.createElement(ShareIcon, { size: 16 }))),

  /*#__PURE__*/React.createElement("div", {
    className: "settlement-page-body",
    onScroll: handleSettlementScroll,
    style: { flex: '1 1 auto', overflowY: 'auto', padding: '72px 16px 16px', display: 'flex', flexDirection: 'column', gap: '14px' }
  },
    /* 1. Settlement Cards (Positioned ABOVE metrics grid) */
    (() => {
      const activeParticipants = settlementParticipants;
      const displayCards = visibleSettlementCards;

      return React.createElement("div", {
        style: { display: 'flex', flexDirection: 'column', gap: '10px' }
      },
        displayCards.map(card => {
          const isClosed = card.status === 'closed';
          const displayBankName = card.bankName === '기타' && card.otherBankName ? card.otherBankName : card.bankName;
          const displayAccountNumber = isClosed ? maskSettlementAccountNumber(card.accountNumber) : card.accountNumber;
          const bankInfoText = [displayBankName, displayAccountNumber, card.depositorName].filter(Boolean).join(' ');
          const isMenuOpen = openMenuCardId === card.id;
          const cardParticipantNames = Array.from(new Set(
            Array.isArray(card.participantRows) && card.participantRows.length > 0
              ? card.participantRows.map(row => row.participantId).filter(Boolean)
              : (Array.isArray(card.participants) && card.participants.length > 0
                ? card.participants
                : activeParticipants.map(participant => participant.name)).filter(Boolean)
          ));
          const cardPersonalTotals = new Map();
          (Array.isArray(card.personalExpenses) ? card.personalExpenses : []).forEach(item => {
            const name = item?.participantId || '참여자';
            // New records persist the explicit sign; legacy records represented every personal
            // expense as a positive amount and therefore remain a subtraction. Keep this exact
            // convention aligned with the settlement editor's personalExpenseTotals calculation
            // so the card and popup cannot show different balances.
            const signedAmount = item?.signedAmount
              ? (Number(item.amount) || 0)
              : -Math.abs(Number(item?.amount) || 0);
            cardPersonalTotals.set(name, (cardPersonalTotals.get(name) || 0) + signedAmount);
          });
          const cardParticipantMemos = new Map();
          (Array.isArray(card.participantRows) ? card.participantRows : []).forEach(row => {
            const memo = String(row?.memo || '').trim();
            if (memo) cardParticipantMemos.set(row.participantId, memo);
          });
          const cardParticipantRows = calculateSettlementRows(
            Number(card.amount) || allTimeExpense,
            cardParticipantNames,
            cardPersonalTotals,
            card.depositorName
          );

          return React.createElement("div", {
            key: card.id,
            style: {
              background: 'linear-gradient(90deg, var(--settlement-hero-start), var(--settlement-hero-end))',
              border: 'none',
              borderRadius: '18px',
              padding: '14px 14px 12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              opacity: isClosed ? 0.75 : 1,
              position: 'relative',
              boxShadow: 'none',
              color: 'var(--settlement-hero-text)'
            }
          },
            /* Card Header: status top-left, settings top-right, title/account below. */
            React.createElement("div", {
              style: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '6px', position: 'relative' }
            },
              React.createElement("span", {
                style: {
                  alignSelf: 'flex-start', fontSize: '0.68rem', fontWeight: 600, padding: '2px 6px', borderRadius: '4px',
                  backgroundColor: isClosed ? 'rgba(255,255,255,0.18)' : 'var(--status-green)',
                  color: isClosed ? '#FFFFFF' : '#5B4BEB'
                }
              }, isClosed ? "마감됨" : "진행중"),
              React.createElement("strong", { style: { fontSize: '0.92rem', color: 'var(--settlement-hero-text)', fontWeight: 900, lineHeight: 1.25, textAlign: 'left' } }, card.title || "1/N 간편 송금"),

              /* Account info remains one copyable left-aligned row; only the account number is a capsule. */
              bankInfoText && React.createElement("span", {
                role: 'button', tabIndex: 0, title: '계좌정보 복사', 'aria-label': '계좌정보 복사',
                onClick: () => handleCopySettlementBankInfo(bankInfoText),
                onKeyDown: e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleCopySettlementBankInfo(bankInfoText); } },
                style: {
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'flex-start', flexWrap: 'wrap',
                  maxWidth: '100%', textAlign: 'left', fontSize: '0.78rem', color: 'var(--settlement-hero-text)',
                  fontWeight: 700, cursor: 'pointer', userSelect: 'none'
                }
              },
                displayBankName && React.createElement("span", null, displayBankName),
                displayAccountNumber && React.createElement("span", {
                  style: {
                    display: 'inline-flex', alignItems: 'center', padding: '2px 10px', margin: '0 4px',
                    borderRadius: '10px', backgroundColor: '#666', mixBlendMode: 'hard-light', color: 'var(--settlement-hero-text)'
                  }
                }, displayAccountNumber),
                card.depositorName && React.createElement("span", { style: { fontWeight: 500 } }, card.depositorName)
              ),

              /* Cog Settings Button */
              React.createElement("button", {
                  type: "button",
                  title: "정산 수정",
                  'aria-label': '정산 수정',
                  'data-settlement-edit-button': 'true',
                  // Open only on the completed click (not on mousedown/pointerup, which fire
                  // before the browser's click event). Opening earlier let the newly-mounted
                  // modal's full-viewport .modal-overlay (onClick={onClose}) end up under the
                  // pointer by the time the same click gesture's terminal click event landed,
                  // closing the editor an instant after it appeared -- the modal never opened.
                  onClick: event => {
                    event.stopPropagation();
                    handleOpenSettlementEditor(card);
                  },
                  onKeyDown: event => {
                    if (event.key !== 'Enter' && event.key !== ' ') return;
                    event.preventDefault();
                    event.stopPropagation();
                    handleOpenSettlementEditor(card);
                  },
                  style: {
                    background: 'transparent', border: 'none', borderRadius: '0',
                    width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--settlement-hero-action-text)', cursor: 'pointer', padding: 0,
                    position: 'absolute', top: '-4px', right: 0
                  }
                },
                  React.createElement("svg", {
                    xmlns: "http://www.w3.org/2000/svg", width: "16", height: "16", viewBox: "0 0 24 24",
                    fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round"
                  },
                    React.createElement("circle", { cx: "12", cy: "12", r: "3" }),
                    React.createElement("path", { d: "M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" })
                  )
                ),

              /* Dropdown Settings Menu */
              isMenuOpen && React.createElement("div", {
                  style: {
                    position: 'absolute', right: 0, top: '34px', backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border-subtle)', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    zIndex: 100, display: 'flex', flexDirection: 'column', minWidth: '110px', overflow: 'hidden'
                  }
                },
                  React.createElement("button", {
                    type: "button",
                    // Open only on click -- see the cog button above for why the earlier
                    // mousedown/pointerup/touchend variants of this handler caused the editor
                    // to open and immediately self-close within the same click gesture.
                    onClick: event => {
                      event.preventDefault();
                      event.stopPropagation();
                      setOpenMenuCardId(null);
                      handleOpenSettlementEditor(card);
                    },
                    onKeyDown: event => {
                      if (event.key !== 'Enter' && event.key !== ' ') return;
                      event.preventDefault();
                      event.stopPropagation();
                      setOpenMenuCardId(null);
                      handleOpenSettlementEditor(card);
                    },
                    style: {
                      padding: '8px 12px', background: 'none', border: 'none', textAlign: 'left',
                      fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-main)', cursor: 'pointer',
                      borderBottom: '1px solid var(--border-subtle)'
                    }
                  }, "정산 수정"),
                  React.createElement("button", {
                    type: "button",
                    onClick: () => {
                      setOpenMenuCardId(null);
                      if (typeof onToggleSettlementCardStatus === 'function') onToggleSettlementCardStatus(card.id);
                    },
                    style: {
                      padding: '8px 12px', background: 'none', border: 'none', textAlign: 'left',
                      fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-main)', cursor: 'pointer',
                      borderBottom: '1px solid var(--border-subtle)'
                    }
                  }, isClosed ? "다시열기" : "마감하기"),
                  React.createElement("button", {
                    type: "button",
                    onClick: () => {
                      setOpenMenuCardId(null);
                      if (typeof onDeleteSettlementCard === 'function') onDeleteSettlementCard(card.id);
                    },
                    style: {
                      padding: '8px 12px', background: 'none', border: 'none', textAlign: 'left',
                      fontSize: '0.78rem', fontWeight: 700, color: '#EF4444', cursor: 'pointer'
                    }
                  }, "삭제")
                )
            ),

            /* Total expense is the first card; participant cards follow it in the responsive grid. */
            React.createElement("div", {
              className: "settlement-person-grid"
            }, React.createElement("div", { className: "settlement-person-card settlement-total-card" },
              React.createElement("div", { className: "settlement-person-name" }, "총 지출"),
              React.createElement("strong", { className: "settlement-person-amount" }, `${(Number(card.amount) || allTimeExpense).toLocaleString()}원`)
            ), cardParticipantRows.length === 0
              ? React.createElement("div", { className: "settlement-person-card settlement-person-card-empty" }, "참여 멤버 없음")
              : cardParticipantRows.map((row, index) => {
                const personalTotal = cardPersonalTotals.get(row.name) || 0;
                const personalMemo = cardParticipantMemos.get(row.name) || '';
                const personalColor = (activeParticipants.find(p => (typeof p === 'string' ? p : (p?.name || p?.id)) === row.name)?.color) || '#3B82F6';
                return React.createElement("div", {
                key: `${card.id}_${row.name}_${index}`,
                className: "settlement-person-card"
              },
                React.createElement("div", { className: "settlement-person-name" },
                  React.createElement("span", {
                    className: "settlement-person-dot",
                    style: { backgroundColor: personalColor }
                  }),
                  React.createElement("span", { className: "settlement-person-name-text" }, row.name),
                  React.createElement('span', { className: `settlement-person-settlement-badge settlement-person-mobile-badge${row.amount < 0 ? ' is-refund' : ''}` }, row.amount < 0 ? '환급금' : row.amount > 0 ? '분담금' : '정산 없음')
                ),
                React.createElement("strong", { className: `settlement-person-amount${row.amount < 0 ? ' is-refund' : ''}`, title: row.amount < 0 ? '공금에서 받을 환급금' : row.amount > 0 ? '공금에 납부할 분담금' : '정산할 금액 없음' },
                  row.amount !== 0 && React.createElement('span', null, `${row.amount < 0 ? '+' : '-'}${Math.abs(row.amount).toLocaleString()}원`)
                ),
                personalTotal !== 0 && React.createElement('span', { className: 'settlement-person-detail-capsule' }, `개인지출 ${Math.abs(personalTotal).toLocaleString()}원`),
                personalMemo && React.createElement('span', { className: 'settlement-person-detail-capsule settlement-person-memo-capsule', title: personalMemo }, personalMemo)
                );
              }))

          );
        })
      );
    })(),

    /* 누적/월별 toggle -- moved here from the header, right under the settlement card(s), full width like the other sections */
    /*#__PURE__*/React.createElement("div", {
      className: "settlement-view-tabs",
      "aria-label": "정산 보기 방식",
      style: { display: 'flex', width: '100%' }
    }, /*#__PURE__*/React.createElement(SegmentedToggle, {
      ariaLabel: "누적 또는 월별 정산 보기",
      value: activeTab,
      onChange: v => setActiveTab(v),
      options: [{ value: 'total', label: '누적보기' }, { value: 'daily', label: '월별보기' }],
      style: { width: '100%', padding: '2px', borderRadius: '10px' }
    })),

    /* Metric Grid (총수입 / 총지출 / 현재잔액) */
    /*#__PURE__*/React.createElement("div", {
      className: "settlement-metric-grid"
    }, metricCards.map(card => /*#__PURE__*/React.createElement("div", {
      key: card.label,
      className: "settlement-metric-card"
    }, /*#__PURE__*/React.createElement("div", {
      className: "settlement-metric-card-label"
    }, /*#__PURE__*/React.createElement("span", { style: { color: card.color, display: 'inline-flex' } }, card.icon), card.label), /*#__PURE__*/React.createElement("div", {
      className: "settlement-metric-card-value",
      style: { color: card.color }
    }, card.value.toLocaleString(), "원")))),
  activeTab === 'daily' && /*#__PURE__*/React.createElement("div", {
    className: "calendar-nav",
    style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px', marginBottom: '2px', flexShrink: 0 }
  }, /*#__PURE__*/React.createElement("div", {
    className: "month-display",
    style: {
      cursor: 'pointer',
      userSelect: 'none',
      display: 'flex',
      alignItems: 'center',
      gap: '6px'
    },
    onClick: handleOpenPicker,
    title: "클릭하여 년월 이동"
  }, /*#__PURE__*/React.createElement("span", {
    className: "month-display-year-full"
  }, `${year}년 `), /*#__PURE__*/React.createElement("span", {
    className: "month-display-year-short"
  }, `${String(year).slice(2)}년 `), `${month + 1}월`, /*#__PURE__*/React.createElement("span", {
    style: {
      color: '#94A3B8',
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
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
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
    title: "이전달",
    "aria-label": "이전달",
    style: { padding: '8px' },
    onClick: onPrevMonth
  }, /*#__PURE__*/React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    width: "20",
    height: "20",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
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
    title: "오늘",
    "aria-label": "오늘",
    style: { padding: '8px' },
    onClick: onToday
  }, /*#__PURE__*/React.createElement(CalendarCheckIcon, null)), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn-secondary calendar-month-nav-btn",
    title: "다음달",
    "aria-label": "다음달",
    style: { padding: '8px' },
    onClick: onNextMonth
  }, /*#__PURE__*/React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    width: "20",
    height: "20",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    style: { transform: 'rotate(-90deg)' },
    className: "icon icon-tabler icons-tabler-outline icon-tabler-chevron-down"
  }, /*#__PURE__*/React.createElement("path", {
    stroke: "none",
    d: "M0 0h24v24H0z",
    fill: "none"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M6 9l6 6l6 -6"
  }))))),
  bodyContent,
  (() => {
    const sheet = isPickerOpen && /*#__PURE__*/React.createElement("div", {
      className: "bottom-sheet-overlay",
      onClick: () => setIsPickerOpen(false),
      style: { zIndex: 12000 }
    }, /*#__PURE__*/React.createElement("div", {
      className: "bottom-sheet",
      onClick: e => e.stopPropagation()
    },
      /*#__PURE__*/React.createElement("div", { className: "bottom-sheet-header" },
        /*#__PURE__*/React.createElement("h4", null, "연월 선택"),
        /*#__PURE__*/React.createElement("button", {
          type: "button",
          style: { background: 'none', border: 'none', color: '#64748B', fontSize: '1.2rem', cursor: 'pointer' },
          onClick: () => setIsPickerOpen(false)
        }, "✕")
      ),
      /*#__PURE__*/React.createElement("div", { className: "bottom-sheet-body" },
        /*#__PURE__*/React.createElement("div", { style: { marginBottom: '16px' } },
          /*#__PURE__*/React.createElement("label", {
            style: { fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }
          }, "년도"),
          /*#__PURE__*/React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '10px' } },
            /*#__PURE__*/React.createElement("button", {
              type: "button", className: "btn btn-secondary", style: { padding: '4px 10px', fontSize: '0.85rem' },
              onClick: () => setPickerYear(y => y - 1)
            }, "◀"),
            /*#__PURE__*/React.createElement("span", {
              style: { fontWeight: 800, fontSize: '1.1rem', minWidth: '60px', textAlign: 'center' }
            }, pickerYear, "년"),
            /*#__PURE__*/React.createElement("button", {
              type: "button", className: "btn btn-secondary", style: { padding: '4px 10px', fontSize: '0.85rem' },
              onClick: () => setPickerYear(y => y + 1)
            }, "▶")
          )
        ),
        /*#__PURE__*/React.createElement("div", { style: { marginBottom: '16px' } },
          /*#__PURE__*/React.createElement("label", {
            style: { fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }
          }, "월"),
          /*#__PURE__*/React.createElement("div", { style: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' } },
            monthNames.map((name, idx) => /*#__PURE__*/React.createElement("button", {
              key: idx, type: "button", onClick: () => setPickerMonth(idx),
              style: {
                padding: '6px 4px', borderRadius: 'var(--radius-sm)',
                border: pickerMonth === idx ? '2px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                background: pickerMonth === idx ? 'rgba(99, 102, 241, 0.15)' : 'var(--bg-card)',
                color: pickerMonth === idx ? 'var(--accent-primary)' : 'var(--text-main)',
                fontWeight: pickerMonth === idx ? 800 : 500, fontSize: '0.82rem', cursor: 'pointer'
              }
            }, name))
          )
        ),
        /*#__PURE__*/React.createElement("button", {
          type: "button", className: "btn btn-primary", style: { width: '100%' },
          onClick: handlePickerApply
        }, pickerYear, "년 ", pickerMonth + 1, "월로 이동")
      )
    ));
    return sheet && typeof document !== 'undefined' && ReactDOM.createPortal ? ReactDOM.createPortal(sheet, document.body) : sheet;
  })(),
  /* Generated share-image overlay -- shown instead of auto-downloading since a triggered file
     download is unreliable on iOS Safari; long-pressing the <img> to save works on every
     mobile browser, and the explicit 다운로드 link below covers desktop. */
  shareImageUrl && /*#__PURE__*/React.createElement("div", {
    className: "modal-overlay",
    onClick: () => setShareImageUrl(null),
    style: { zIndex: 12000 }
  }, /*#__PURE__*/React.createElement(ResizableModalContainer, {
    className: "modal-container",
    onClick: e => e.stopPropagation(),
    style: { width: '90%', maxWidth: '360px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }
  },
    /*#__PURE__*/React.createElement("img", { src: shareImageUrl, alt: "정산 결과 공유 이미지", decoding: "async", style: { width: '100%', borderRadius: '10px', border: '1px solid var(--border-subtle)' } }),
    /*#__PURE__*/React.createElement("div", { style: { fontSize: '0.76rem', color: 'var(--text-muted)', textAlign: 'center' } }, "이미지를 길게 눌러 저장하거나, 아래 버튼으로 다운로드하세요"),
    /*#__PURE__*/React.createElement("div", { style: { display: 'flex', gap: '8px', width: '100%' } },
      /*#__PURE__*/React.createElement("button", {
        type: "button", className: "btn btn-secondary", style: { flex: 1 },
        onClick: () => setShareImageUrl(null)
      }, "닫기"),
      /*#__PURE__*/React.createElement("a", {
        href: shareImageUrl,
        download: `${calendar?.title || '정산'}_정산결과.png`,
        className: "btn btn-primary",
        style: { flex: 1, textAlign: 'center', textDecoration: 'none' }
      }, "다운로드")
    )
  )),
  isSettlementMenuOpen && /*#__PURE__*/React.createElement("div", {
    className: "admin-side-menu-overlay",
    style: { zIndex: 12000 },
    onClick: () => setIsSettlementMenuOpen(false)
  }, /*#__PURE__*/React.createElement("nav", {
    className: "admin-side-menu",
    "aria-label": "정산",
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
            onClick: () => { setIsSettlementMenuOpen(false); if (typeof onChangeView === 'function') onChangeView('calendar'); else if (typeof onBack === 'function') onBack(); },
            style: {
              background: 'none', border: 'none', padding: 0, margin: 0,
              color: 'inherit',
              cursor: 'pointer', textAlign: 'left'
            }
          }, "정산")
        )
      ),
      /*#__PURE__*/React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 } },
        WeatherBadge ? /*#__PURE__*/React.createElement(WeatherBadge, { weatherLocation: calendar && calendar.weatherLocation }) : null,
        /*#__PURE__*/React.createElement("button", {
          type: "button", className: "admin-side-menu-close-btn", onClick: () => setIsSettlementMenuOpen(false), "aria-label": "닫기"
        }, "✕")
      )
    ),
    /* Group 1: 정산 생성 + 정산 목록 */
    React.createElement("div", { className: "admin-side-menu-list", style: { borderBottom: 'none', paddingTop: '6px' } },
      /* 1. 정산 생성 */
      React.createElement("button", {
        type: "button",
        className: "admin-side-menu-item",
        onClick: handleOpenCreateSettlement
      },
        React.createElement("span", { className: "admin-side-menu-item-icon" },
          React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2.5", strokeLinecap: "round", strokeLinejoin: "round" },
            React.createElement("line", { x1: "12", y1: "5", x2: "12", y2: "19" }),
            React.createElement("line", { x1: "5", y1: "12", x2: "19", y2: "12" })
          )
        ),
        React.createElement("span", { className: "admin-side-menu-item-copy" },
          React.createElement("span", { className: "admin-side-menu-item-title", style: { fontWeight: 700, color: "var(--text-main)" } }, "정산 생성")
        )
      ),

      /* 2. 정산 목록 */
      React.createElement("button", {
        type: "button",
        className: "admin-side-menu-item",
        onClick: () => { setIsSettlementMenuOpen(false); setIsSettlementListOpen(true); }
      },
        React.createElement("span", { className: "admin-side-menu-item-icon" }, React.createElement("svg", {
          xmlns: "http://www.w3.org/2000/svg", width: "20", height: "20", viewBox: "0 0 24 24",
          fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round"
        }, React.createElement("rect", { x: "4", y: "4", width: "16", height: "16", rx: "2" }), React.createElement("line", { x1: "8", y1: "9", x2: "16", y2: "9" }), React.createElement("line", { x1: "8", y1: "13", x2: "16", y2: "13" }), React.createElement("line", { x1: "8", y1: "17", x2: "13", y2: "17" }))),
        React.createElement("span", { className: "admin-side-menu-item-copy" },
          React.createElement("span", { className: "admin-side-menu-item-title" }, "정산 목록")
        )
      )
    ),
    typeof SharedAppNavBlock === 'function' && /*#__PURE__*/React.createElement(SharedAppNavBlock, {
      onClose: () => setIsSettlementMenuOpen(false),
      onChangeView: onChangeView,
      onOpenCreateSettlement: handleOpenCreateSettlement,
      showSettlement: canUseSettlement,
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
      onClose: () => setIsSettlementMenuOpen(false),
      onOpenShare: onOpenShare,
      onOpenSettings: onOpenAppSettings,
      shareLabel: '공유'
    })
  ))),

  /* Settlement list Layer Popup */
  (isSettlementListOpen && canUseSettlement && React.createElement("div", {
    className: "modal-overlay",
    onClick: () => setIsSettlementListOpen(false),
    style: { zIndex: 12000 }
  }, React.createElement(ResizableModalContainer, {
    className: "modal-container",
    onClick: e => e.stopPropagation(),
    style: { maxWidth: '520px', width: '92%', maxHeight: '82vh', display: 'flex', flexDirection: 'column' }
  },
    React.createElement("div", {
      className: "modal-header",
      style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: '1px solid var(--border-subtle)' }
    },
      React.createElement("h3", { style: { margin: 0, fontSize: '1.02rem', fontWeight: 900, color: 'var(--text-main)' } }, "정산 목록"),
      React.createElement("button", { type: "button", onClick: () => setIsSettlementListOpen(false), style: { background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem' } }, "✕")
    ),
    React.createElement("div", {
      className: "modal-body",
      style: { overflowY: 'auto', padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }
    },
      sortedSettlementCards.map(card => {
        const isClosed = card?.status === 'closed';
        const cardTime = getSettlementCardTime(card);
        const participantNames = Array.isArray(card?.participantRows) && card.participantRows.length > 0
          ? card.participantRows.map(row => row.participantId).filter(Boolean)
          : (Array.isArray(card?.participants) ? card.participants : []);
        return React.createElement("button", {
          key: card.id,
          className: "settlement-list-card",
          type: "button",
          // Open only on click -- see the cog button's comment above for why an early
          // pointerup handler here raced the editor's self-closing overlay.
          onClick: event => {
            event.preventDefault();
            event.stopPropagation();
            setIsSettlementListOpen(false);
            handleOpenSettlementEditor(card);
          },
          onKeyDown: event => {
            if (event.key !== 'Enter' && event.key !== ' ') return;
            event.preventDefault();
            event.stopPropagation();
            setIsSettlementListOpen(false);
            handleOpenSettlementEditor(card);
          },
          style: {
            display: 'flex', flexDirection: 'column', gap: '7px', width: '100%', padding: '12px 14px', textAlign: 'left',
            border: '1px solid var(--border-subtle)', borderRadius: '10px', backgroundColor: 'var(--bg-card)', cursor: 'pointer', opacity: isClosed ? 0.72 : 1
          }
        },
          React.createElement("div", { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' } },
            React.createElement("strong", { style: { color: 'var(--text-main)', fontSize: '0.88rem' } }, card.title || '1/N 간편 송금'),
            React.createElement("span", { style: { color: isClosed ? 'var(--text-muted)' : 'var(--status-green)', fontSize: '0.7rem', fontWeight: 800 } }, isClosed ? '마감됨' : '진행중')
          ),
          React.createElement("div", { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', color: 'var(--text-muted)', fontSize: '0.74rem' } },
            React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap', minWidth: 0 } },
              participantNames.length > 0
                ? participantNames.map((name, index) => {
                  const participant = settlementParticipants.find(item => (typeof item === 'string' ? item : (item?.name || item?.id)) === name);
                  const color = typeof participant === 'object' ? participant?.color : null;
                  return React.createElement('span', {
                    key: `${card.id}_participant_${name}_${index}`,
                    style: { display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 7px', borderRadius: '999px', backgroundColor: color ? `${color}1A` : 'var(--border-subtle)', color: color || 'var(--text-main)', fontSize: '0.7rem', fontWeight: 700, whiteSpace: 'nowrap' }
                  }, name);
                })
                : React.createElement('span', null, '참여자 없음')
            ),
            React.createElement("span", null, cardTime ? new Date(cardTime).toLocaleDateString('ko-KR') : '날짜 없음')
          )
        );
      })
    )
  ))),

  /* Create Settlement Layer Popup */
  (isCreateSettlementOpen && canUseSettlement && !editingSettlementCard && React.createElement(CreateSettlementModalComp, {
    calendar: calendar,
    onClose: () => setIsCreateSettlementOpen(false),
    onSave: (newCard) => {
      if (typeof onSaveSettlementCard === 'function') {
        onSaveSettlementCard(newCard);
      } else if (calendar) {
        if (!Array.isArray(calendar.settlementCards)) calendar.settlementCards = [];
        calendar.settlementCards.unshift(newCard);
      }
      setIsCreateSettlementOpen(false);
      if (showToast) showToast(`'${newCard.title}' 정산 카드가 생성되었습니다!`, 'success');
    },
    showToast: showToast
  })),

  /* Edit Settlement Layer Popup */
  // Use the local component directly here. The global component registry can briefly contain
  // an older module reference during live bundle refresh, which previously swallowed this
  // edit modal after the card button had already updated editingSettlementCard.
  (() => {
    // A card is only rendered in this view when it is already an allowed, visible
    // settlement record. Do not re-apply the create-flow feature gate here: a stale
    // gate value used to swallow the editor after the card button had handled the click.
    const editor = editingSettlementCard && React.createElement(CreateSettlementModal, {
    calendar: calendar,
    initialData: editingSettlementCard,
    onClose: () => { setEditingSettlementCard(null); setIsCreateSettlementOpen(false); },
    onDeleteCard: (cardId) => {
      if (typeof onDeleteSettlementCard === 'function') onDeleteSettlementCard(cardId);
      setEditingSettlementCard(null);
      setIsCreateSettlementOpen(false);
    },
    onToggleStatus: (cardId) => {
      if (typeof onToggleSettlementCardStatus === 'function') onToggleSettlementCardStatus(cardId);
      setEditingSettlementCard(null);
      setIsCreateSettlementOpen(false);
    },
    onSave: (updatedCard) => {
      if (typeof onSaveSettlementCard === 'function') {
        onSaveSettlementCard(updatedCard);
      } else if (calendar) {
        if (!Array.isArray(calendar.settlementCards)) calendar.settlementCards = [];
        const idx = calendar.settlementCards.findIndex(c => c.id === updatedCard.id);
        if (idx >= 0) calendar.settlementCards[idx] = updatedCard;
        else calendar.settlementCards.unshift(updatedCard);
      }
      setEditingSettlementCard(null);
      setIsCreateSettlementOpen(false);
    },
    showToast: showToast
    });
    // This modal already belongs to the top-level settlement view. Rendering it
    // directly avoids the separate ReactDOM portal path that can drop the editor
    // after the click when the lazy UI modules are being assembled.
    return editor;
  })()
  );
}

export function PollModal({ calendar, poll, onSave, onClose, showToast, onRequestConfirm }) {
  const React = window.React;
  const __deps = window.GATHER_UI_DEPS || {};
  const __comp = window.GATHER_UI_COMPONENTS || {};
  const DeadlineDateTimePicker = __comp.DeadlineDateTimePicker || __deps.DeadlineDateTimePicker || (function () { return null; });
  const LineHeightIcon = __comp.LineHeightIcon || __deps.LineHeightIcon || (function () { return null; });
  const ResizableModalContainer = __comp.ResizableModalContainer || __deps.ResizableModalContainer || (function Shell(p) { return React.createElement('div', p, p.children); });
  const SectionToggleButton = __comp.SectionToggleButton || __deps.SectionToggleButton || (function Shell(p) { return React.createElement('div', p, p.children); });
  const SmallXIcon = __comp.SmallXIcon || __deps.SmallXIcon || (function () { return '×'; });
  const TrashIcon = __comp.TrashIcon || __deps.TrashIcon || (function () { return '🗑'; });
  const sanitizeText = __deps.sanitizeText;
  const now = Date.now();
  const isEditing = Boolean(poll?.id);
  // Once a poll's deadline has passed, adding new candidates no longer makes sense (voting is
  // already over) -- lock just the add input/button below, leaving the existing option list
  // viewable/editable so stray typos etc. can still be cleaned up.
  const isClosed = isPollClosed(poll);
  const createdAtText = isEditing ? formatRegisteredAt(poll?.createdAt) : '';
  const [title, setTitle] = React.useState(poll?.title || '');
  const [description, setDescription] = React.useState(poll?.description || '');
  // <input type="datetime-local"> needs "YYYY-MM-DDTHH:mm" in the viewer's local time, not a
  // raw epoch -- convert via the timezone offset rather than toISOString (which is UTC).
  const [deadlineInput, setDeadlineInput] = React.useState(() => {
    if (!poll?.deadline) return '';
    const d = new Date(Number(poll.deadline));
    if (Number.isNaN(d.getTime())) return '';
    const tzOffsetMs = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - tzOffsetMs).toISOString().slice(0, 16);
  });
  const [isDeadlineCollapsed, setIsDeadlineCollapsed] = React.useState(true);
  const [newOption, setNewOption] = React.useState('');
  const [options, setOptions] = React.useState(getActivePollOptions(poll).map(option => ({
    ...option,
    inputValue: `${option.text}${option.url ? ' ' + option.url : ''}`
  })));
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [draggingOptionId, setDraggingOptionId] = React.useState('');
  const [dragOverOptionId, setDragOverOptionId] = React.useState('');
  const newOptionInputRef = React.useRef(null);
  const pointerSortRef = React.useRef({ sourceId: '', targetId: '', startX: 0, startY: 0, active: false });
  const pollDirtySnapshot = () => JSON.stringify([
    title,
    description,
    deadlineInput,
    newOption,
    options.map(option => [
      option.id,
      option.inputValue ?? `${option.text}${option.url ? ' ' + option.url : ''}`,
      option.removedAt ? 1 : 0,
      option.updatedAt || 0
    ])
  ]);
  const { requestClose, overlayOnClick } = useModalDirtyGuard(
    onClose,
    onRequestConfirm,
    undefined,
    true,
    pollDirtySnapshot,
    poll?.id || 'new'
  );
  const handleAddOption = e => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (isSubmitting || isClosed) return;
    const latest = newOptionInputRef.current ? newOptionInputRef.current.value : newOption;
    const parsed = normalizePollOptionInput(latest);
    if (!parsed.text) {
      if (showToast) showToast('투표 항목 내용을 입력해 주세요.', 'error');
      return;
    }
    setOptions(prev => [...prev, {
      id: `${poll?.id || calendar.id + '_poll'}_opt_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      text: parsed.text,
      url: parsed.url,
      inputValue: latest,
      updatedAt: Date.now()
    }]);
    setNewOption('');
    if (newOptionInputRef.current) newOptionInputRef.current.value = '';
  };
  const updateOption = (optionId, value) => {
    const parsed = normalizePollOptionInput(value);
    setOptions(prev => prev.map(option => option.id === optionId ? {
      ...option,
      inputValue: value,
      text: parsed.text || value,
      url: parsed.url,
      updatedAt: Date.now()
    } : option));
  };
  const moveOption = (sourceId, targetId) => {
    if (!sourceId || !targetId || sourceId === targetId || isSubmitting) return;
    setOptions(prev => {
      const fromIndex = prev.findIndex(option => option.id === sourceId);
      const toIndex = prev.findIndex(option => option.id === targetId);
      if (fromIndex < 0 || toIndex < 0) return prev;
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, { ...moved, updatedAt: Date.now() });
      return next;
    });
  };
  const resetPointerSort = () => {
    pointerSortRef.current = { sourceId: '', targetId: '', startX: 0, startY: 0, active: false };
    setDraggingOptionId('');
    setDragOverOptionId('');
  };
  const beginPointerSort = (event, optionId) => {
    if (isSubmitting) return;
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    pointerSortRef.current = {
      sourceId: optionId,
      targetId: '',
      startX: event.clientX,
      startY: event.clientY,
      active: false
    };
    setDraggingOptionId(optionId);
    setDragOverOptionId('');
    if (event.currentTarget.setPointerCapture && event.pointerId !== undefined) {
      try {
        event.currentTarget.setPointerCapture(event.pointerId);
      } catch (e) {}
    }
    event.preventDefault();
  };
  const updatePointerSort = event => {
    const session = pointerSortRef.current;
    if (!session.sourceId || isSubmitting) return;
    const moved = Math.abs(event.clientX - session.startX) > 6 || Math.abs(event.clientY - session.startY) > 6;
    if (!moved && !session.active) return;
    session.active = true;
    const element = document.elementFromPoint(event.clientX, event.clientY);
    const targetRow = element && element.closest ? element.closest('.poll-sortable-row') : null;
    const targetId = targetRow ? targetRow.getAttribute('data-option-id') : '';
    session.targetId = targetId && targetId !== session.sourceId ? targetId : '';
    setDragOverOptionId(session.targetId);
    event.preventDefault();
  };
  const finishPointerSort = event => {
    const session = pointerSortRef.current;
    if (!session.sourceId) return;
    if (session.active && session.targetId) {
      moveOption(session.sourceId, session.targetId);
    }
    resetPointerSort();
    if (event && event.currentTarget && event.currentTarget.releasePointerCapture && event.pointerId !== undefined) {
      try {
        event.currentTarget.releasePointerCapture(event.pointerId);
      } catch (e) {}
    }
    if (event) event.preventDefault();
  };
  const handleSubmit = async e => {
    e.preventDefault();
    if (isSubmitting) return;
    const cleanTitle = sanitizeText(title, 80);
    const cleanDescription = sanitizeText(description, 160);
    // Deleted options must still be SENT to onSave with their removedAt tombstone intact, not
    // dropped from the array -- mergePollRecord (see its definition) merges this calendar's
    // saved poll against whatever the server currently has by unioning option IDs from both
    // sides, keyed by whichever copy has the newer timestamp. If a deleted option is simply
    // omitted here instead of tombstoned, the merge has no way to tell "this option was removed"
    // apart from "this save just never mentioned it" -- the server's still-existing copy of that
    // option ID wins the union and the deletion silently reverts on the next merge (which is
    // exactly what a concurrent-edit-safe merge needs to do for options nobody touched).
    const normalizedOptions = options.map(option => {
      if (isTombstone(option)) return option;
      const inputValue = option.inputValue ?? `${option.text}${option.url ? ' ' + option.url : ''}`;
      const parsed = normalizePollOptionInput(inputValue);
      return {
        ...option,
        text: parsed.text,
        url: parsed.url
      };
    }).filter(option => isTombstone(option) || sanitizeText(option.text, 120));
    const activeOptionCount = normalizedOptions.filter(option => !isTombstone(option)).length;
    if (!cleanTitle) {
      if (showToast) showToast('투표 제목을 입력해 주세요.', 'error'); else console.warn('투표 제목을 입력해 주세요.');
      return;
    }
    if (activeOptionCount === 0) {
      if (showToast) showToast('투표 항목을 1개 이상 추가해 주세요.', 'error'); else console.warn('투표 항목을 1개 이상 추가해 주세요.');
      return;
    }
    setIsSubmitting(true);
    let saved = false;
    try {
      saved = await Promise.resolve(onSave({
        ...(poll || {}),
        id: poll?.id || `${calendar.id}_poll_${now}_${Math.random().toString(36).slice(2, 7)}`,
        calendarId: calendar.id,
        title: cleanTitle,
        description: cleanDescription,
        deadline: deadlineInput ? new Date(deadlineInput).getTime() : null,
        options: normalizedOptions,
        votes: poll?.votes || {},
        createdAt: poll?.createdAt || now,
        updatedAt: Date.now()
      }));
    } catch (err) {
      console.error('Poll save failed:', err);
    }
    if (saved === false) {
      setIsSubmitting(false);
      return;
    }
    onClose();
  };
  const modalEl = /*#__PURE__*/React.createElement("div", {
    className: "modal-overlay",
    onClick: e => {
      if (!isSubmitting) overlayOnClick(e);
    },
    style: { zIndex: 12000 }
  }, /*#__PURE__*/React.createElement(ResizableModalContainer, {
    className: "modal-container",
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal-header",
    style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' }
  }, /*#__PURE__*/React.createElement("h3", {
    style: { fontSize: '1.1rem', fontWeight: 800 }
  }, isEditing ? "\uD22C\uD45C \uC218\uC815" : "\uD22C\uD45C \uC0DD\uC131"), /*#__PURE__*/React.createElement("div", {
    style: { display: 'flex', alignItems: 'center', gap: '10px', marginLeft: 'auto' }
  }, createdAtText && /*#__PURE__*/React.createElement("span", {
    className: "registered-at-text",
    style: { fontSize: '0.6rem', whiteSpace: 'nowrap' }
  }, "\uC0DD\uC131\uC77C\uC790 ", createdAtText), /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      if (!isSubmitting) requestClose();
    },
    style: { background: 'none', border: 'none', color: '#64748B', fontSize: '1.2rem', cursor: 'pointer', display: 'flex', alignItems: 'center' }
  }, /*#__PURE__*/React.createElement(SmallXIcon, { size: 20 })))), /*#__PURE__*/React.createElement("form", {
    onSubmit: handleSubmit
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal-body"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    style: { display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px', color: '#64748B' }
  }, "\uD22C\uD45C\uBA85"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    className: "form-input",
    style: { width: '100%' },
    value: title,
    disabled: isSubmitting,
    maxLength: 80,
    onChange: e => setTitle(e.target.value),
    required: true
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    style: { display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px', color: '#64748B' }
  }, "\uD22C\uD45C \uC124\uBA85"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    className: "form-input",
    style: { width: '100%' },
    value: description,
    disabled: isSubmitting,
    maxLength: 160,
    onChange: e => setDescription(e.target.value)
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    onClick: () => setIsDeadlineCollapsed(prev => !prev),
    style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: isDeadlineCollapsed ? 0 : '6px', cursor: 'pointer' }
  }, /*#__PURE__*/React.createElement("label", {
    style: { fontSize: '0.85rem', fontWeight: 700, color: '#64748B', cursor: 'pointer' }
  }, "\uB9C8\uAC10\uAE30\uD55C (\uC120\uD0DD)"), /*#__PURE__*/React.createElement(SectionToggleButton, {
    collapsed: isDeadlineCollapsed,
    onToggle: () => setIsDeadlineCollapsed(prev => !prev),
    label: isDeadlineCollapsed ? "\uB9C8\uAC10\uC2DC\uD55C \uD3BC\uCE58\uAE30" : "\uB9C8\uAC10\uC2DC\uD55C \uC811\uAE30"
  })), !isDeadlineCollapsed && /*#__PURE__*/React.createElement(DeadlineDateTimePicker, {
    value: deadlineInput,
    onChange: setDeadlineInput,
    disabled: isSubmitting
  })), /*#__PURE__*/React.createElement("div", {
    style: { borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }
  }, /*#__PURE__*/React.createElement("label", {
    style: { display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px', color: '#64748B' }
  }, "\uD22C\uD45C \uC124\uC815"), /*#__PURE__*/React.createElement("div", {
    className: "participant-add-row",
    style: { display: 'flex', gap: '6px', marginBottom: '8px' }
  }, /*#__PURE__*/React.createElement("input", {
    type: "text",
    className: "form-input participant-add-input",
    style: { flex: 1, minWidth: 0 },
    placeholder: isClosed ? "마감된 투표에는 후보를 추가할 수 없습니다" : "예: 천왕역모아엘가 https://place.map.kakao.com/...",
    value: newOption,
    disabled: isSubmitting || isClosed,
    maxLength: 220,
    ref: newOptionInputRef,
    onChange: e => setNewOption(e.target.value),
    onKeyDown: e => {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (e.nativeEvent && e.nativeEvent.isComposing) return;
        handleAddOption(e);
      }
    }
  }), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn-secondary participant-action-btn",
    disabled: isSubmitting || isClosed,
    title: isClosed ? "\uB9C8\uAC10\uB41C \uD22C\uD45C\uC5D0\uB294 \uD6C4\uBCF4\uB97C \uCD94\uAC00\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4" : undefined,
    style: { whiteSpace: 'nowrap', minWidth: '52px', flexShrink: 0 },
    onClick: handleAddOption
  }, "\uCD94\uAC00")), options.map(option => isTombstone(option) ? null : /*#__PURE__*/React.createElement("div", {
    key: option.id,
    "data-option-id": option.id,
    className: `participant-edit-row poll-sortable-row${draggingOptionId === option.id ? ' is-dragging' : ''}${dragOverOptionId === option.id ? ' is-drop-target' : ''}`,
    onDragOver: event => {
      event.preventDefault();
      event.dataTransfer.dropEffect = 'move';
      if (draggingOptionId && draggingOptionId !== option.id) setDragOverOptionId(option.id);
    },
    onDragEnter: event => {
      event.preventDefault();
      if (draggingOptionId && draggingOptionId !== option.id) setDragOverOptionId(option.id);
    },
    onDragLeave: event => {
      if (!event.currentTarget.contains(event.relatedTarget)) setDragOverOptionId('');
    },
    onDrop: event => {
      event.preventDefault();
      const sourceId = event.dataTransfer.getData('text/plain') || draggingOptionId;
      moveOption(sourceId, option.id);
      setDraggingOptionId('');
      setDragOverOptionId('');
    },
    onDragEnd: () => {
      setDraggingOptionId('');
      setDragOverOptionId('');
    },
    style: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "poll-drag-handle",
    disabled: isSubmitting,
    draggable: !isSubmitting,
    title: "\uB4DC\uB798\uADF8\uD558\uC5EC \uC21C\uC11C \uBCC0\uACBD",
    onPointerDown: event => beginPointerSort(event, option.id),
    onPointerMove: updatePointerSort,
    onPointerUp: finishPointerSort,
    onPointerCancel: resetPointerSort,
    onDragStart: event => {
      if (isSubmitting) return;
      setDraggingOptionId(option.id);
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', option.id);
      const row = event.currentTarget.closest('.poll-sortable-row');
      if (row && event.dataTransfer.setDragImage) {
        const rect = row.getBoundingClientRect();
        event.dataTransfer.setDragImage(row, Math.min(rect.width - 12, Math.max(24, event.clientX - rect.left)), Math.max(16, event.clientY - rect.top));
      }
    },
    onDragEnd: () => {
      setDraggingOptionId('');
      setDragOverOptionId('');
    }
  }, /*#__PURE__*/React.createElement(LineHeightIcon, null)), /*#__PURE__*/React.createElement("input", {
    type: "text",
    className: "form-input participant-name-input",
    style: { flex: 1, minWidth: 0 },
    value: option.inputValue ?? `${option.text}${option.url ? ' ' + option.url : ''}`,
    disabled: isSubmitting,
    maxLength: 220,
    onKeyDown: e => e.stopPropagation(),
    onInput: e => updateOption(option.id, e.target.value),
    onChange: e => updateOption(option.id, e.target.value)
  }), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn-danger participant-remove-btn",
    disabled: isSubmitting,
    onClick: () => {
      const performDelete = () => setOptions(prev => prev.map(item => item.id === option.id ? { ...item, removedAt: Date.now(), updatedAt: Date.now() } : item));
      if (onRequestConfirm) {
        onRequestConfirm('투표 항목 삭제', `"${option.text || '빈 항목'}" 항목을 삭제하시겠습니까?`, performDelete);
      }
    }
    }, /*#__PURE__*/React.createElement(TrashIcon, { size: 20 })))))), /*#__PURE__*/React.createElement("div", {
    className: "modal-footer"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn-secondary",
    disabled: isSubmitting,
    onClick: () => {
      if (!isSubmitting) onClose();
    }
  }, "\uCDE8\uC18C"), /*#__PURE__*/React.createElement("button", {
    type: "submit",
    className: "btn btn-primary",
    disabled: isSubmitting,
    style: { opacity: isSubmitting ? 0.75 : 1, cursor: isSubmitting ? 'wait' : 'pointer' }
  }, isSubmitting ? "\uC800\uC7A5 \uC911..." : "\uD22C\uD45C \uC800\uC7A5")))));

  // Portaled to document.body (like the other layer popups in this file) so this modal's own
  // position:fixed dim overlay is never clipped/contained by an ancestor modal's
  // ResizableModalContainer (e.g. AdminModal's admin-settings-modal, which sets overflow:hidden) --
  // without this, opening PollModal from inside another modal made the outer modal collapse to
  // just its border while this one rendered confined to the outer modal's box instead of covering
  // the full viewport with its own dim.
  return ReactDOM.createPortal(modalEl, document.body);
}

if (typeof window !== 'undefined') {
  // The app shell is loaded after this lazy UI module. Keep an explicit reference
  // so its top-level modal overlay never resolves to an empty registry wrapper.
  window.__GATHER_CREATE_SETTLEMENT_MODAL__ = CreateSettlementModal;
  window.GATHER_UI_COMPONENTS = Object.assign({}, window.GATHER_UI_COMPONENTS || {}, {
    AnniversaryModal: AnniversaryModal,
    SettlementSummaryModal: SettlementSummaryModal,
    PollModal: PollModal,
    CreateSettlementModal: CreateSettlementModal,
  });
}
