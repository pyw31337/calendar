/**
 * Date modal (schedule popup) (P4-14)
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
function computeKoreanHolidaysForYear(year) {
  const f = __gatherUiDeps().computeKoreanHolidaysForYear;
  return typeof f === 'function' ? f(year) : [];
}
function getFooterFamilyLinks() {
  return __gatherUiDeps().FOOTER_FAMILY_LINKS || [];
}

// Stable component type so opening/closing a video does not reset when DateModal refreshes its
// live date-tag queries. It intentionally mirrors MemoCard's preview + toggle + inline player.
function DateModalVideoCard({ video }) {
  const React = window.React;
  const __deps = window.GATHER_UI_DEPS || {};
  const __comp = window.GATHER_UI_COMPONENTS || {};
  const LinkPreviewCard = __comp.LinkPreviewCard || __deps.LinkPreviewCard;
  const ClickToPlayVideoCard = __comp.ClickToPlayVideoCard || __deps.ClickToPlayVideoCard;
  const SmallXIcon = __comp.SmallXIcon || __deps.SmallXIcon;
  const [isVideoOpen, setIsVideoOpen] = React.useState(false);
  const mediaInfo = getDirectChatMediaInfo(video.directMediaUrl);
  const fallbackTitle = video.title || '영상';

  return /*#__PURE__*/React.createElement("div", {
    style: { width: '100%', boxSizing: 'border-box' }
  },
    LinkPreviewCard && /*#__PURE__*/React.createElement(LinkPreviewCard, {
      url: video.directMediaUrl,
      fallbackTitle,
      cachedData: video.linkPreview,
      stretch: true
    }),
    /*#__PURE__*/React.createElement("button", {
      type: 'button',
      onClick: () => setIsVideoOpen(value => !value),
      "aria-expanded": isVideoOpen,
      style: {
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
        width: '100%', padding: '6px 0', marginTop: '6px', borderRadius: 'var(--radius-md)',
        border: isVideoOpen ? '1px solid var(--border-subtle)' : '1px solid var(--primary)',
        backgroundColor: isVideoOpen ? 'var(--bg-secondary)' : 'var(--bg-primary)',
        color: isVideoOpen ? 'var(--text-muted)' : 'var(--primary)',
        fontSize: 'var(--font-size-sm)', fontWeight: 700, cursor: 'pointer'
      }
    }, isVideoOpen ? [
      SmallXIcon ? /*#__PURE__*/React.createElement(SmallXIcon, { key: 'close', size: 13 }) : null,
      ' 영상 닫기'
    ] : [
      /*#__PURE__*/React.createElement("svg", { key: 'play', viewBox: '0 0 24 24', width: '13', height: '13', fill: 'currentColor' },
        /*#__PURE__*/React.createElement("path", { d: 'M8 5v14l11-7z' })
      ),
      ' 영상 바로보기'
    ]),
    isVideoOpen && ClickToPlayVideoCard && /*#__PURE__*/React.createElement("div", {
      style: { marginTop: '8px', width: '100%' }
    }, /*#__PURE__*/React.createElement(ClickToPlayVideoCard, {
      url: video.directMediaUrl,
      mediaInfo,
      fallbackTitle,
      cachedData: video.linkPreview
    }))
  );
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
function getPlaceMemoEntryForDate(...args) {
  const f = __gatherUiDeps().getPlaceMemoEntryForDate || GATHER_APP_UTILS.getPlaceMemoEntryForDate;
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
function toMemoDateFormat(...args) {
  const f = __gatherUiDeps().toMemoDateFormat || GATHER_APP_UTILS.toMemoDateFormat;
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
function readClipboardImageFiles(...args) {
  const f = __gatherUiDeps().readClipboardImageFiles || GATHER_APP_UTILS.readClipboardImageFiles;
  return typeof f === 'function' ? f(...args) : Promise.resolve([]);
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
function resolveMeetingPhotoDisplay(...args) {
  const f = __gatherUiDeps().resolveMeetingPhotoDisplay || GATHER_APP_UTILS.resolveMeetingPhotoDisplay;
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

// Tracks whether the OS clipboard currently holds an image, so a '붙여넣기' button can be
// disabled when there's nothing to paste. Browsers vary wildly here (Firefox has no image
// support for navigator.clipboard.read(), Safari/Chrome gate it behind the clipboard-read
// permission) -- this fails OPEN (button stays enabled) whenever the check itself is
// unsupported or inconclusive, and specifically avoids calling clipboard.read() while
// permission is still 'prompt' so merely rendering the button never pops a permission dialog.
function useClipboardHasImage(active) {
  return true;
}


export function DateModal({
  anniversaries = [],
  dateStr,
  calendar,
  chatMessages = [],
  memos = [],
  setActiveLightbox,
  initialTab = null,
  adminMode = false,
  onSave,
  onConfirmMeeting,
  onSaveExpense,
  onDeleteExpense,
  onReorderExpenses,
  onReorderAvailability,
  onAddMeetingPhotos,
  onDeletePhoto,
  onDeleteMeetingPhoto,
  onFindChatMessageById,
  onFetchDateTaggedMessages,
  onFetchDateTaggedMemos,
  onFetchMeetingPhotoIndex,
  onLoadOlderChat,
  hasMoreOlderChat = false,
  loadingOlderChat = false,
  onSavePlace,
  onDeletePlace,
  onReorderPlaces,
  onDelete,
  onDeleteDate,
  onRequestConfirm,
  onClose,
  showToast,
  onParticipantClick,
  syncStatus = null
}) {
  const React = window.React;
  const __deps = window.GATHER_UI_DEPS || {};
  const ParticipantBackdrop = (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.ParticipantBackdrop) || __deps.ParticipantBackdrop;
  const __comp = window.GATHER_UI_COMPONENTS || {};
  const ResizableModalContainer = __comp.ResizableModalContainer || __deps.ResizableModalContainer || (function Shell(p) { return React.createElement('div', p, p.children); });
  const ResizableListSection = __comp.ResizableListSection || __deps.ResizableListSection;
  const AutoGrowTextarea = __deps.AutoGrowTextarea;
  const FormAddEditActionButtons = __deps.FormAddEditActionButtons;
  const GamifiedConfirmButtonContent = __deps.GamifiedConfirmButtonContent;
  const ItemEditDeleteActions = __deps.ItemEditDeleteActions;
  const LineHeightIcon = __deps.LineHeightIcon;
  const SegmentedToggle = __deps.SegmentedToggle;
  const UnderlineTabs = __comp.UnderlineTabs || __deps.UnderlineTabs;
  const SimpleBottomSheetPicker = __comp.SimpleBottomSheetPicker || __deps.SimpleBottomSheetPicker;
  const MediaThumb = __comp.MediaThumb || __deps.MediaThumb;
  const CakeIcon = __comp.CakeIcon || __deps.CakeIcon;
  const BalloonIcon = __comp.BalloonIcon || __deps.BalloonIcon;
  const ConfettiIcon = __comp.ConfettiIcon || __deps.ConfettiIcon;
  const TicketsPlaneIcon = __comp.TicketsPlaneIcon || __deps.TicketsPlaneIcon;
  const MessageCircleMoreIcon = __comp.MessageCircleMoreIcon || __deps.MessageCircleMoreIcon;
  const MapPinIcon = __comp.MapPinIcon || __deps.MapPinIcon;
  const CalendarIcon = __comp.CalendarIcon || __deps.CalendarIcon;
  // Legacy D-Day badges (ann.type === 'dday') keep their plain emoji exactly as before; only the
  // newer category-tagged types (yearly/once/range) swap their category emoji for its icon component.
  const renderAnniversaryIcon = (ann, size) => {
    if (ann.type === 'dday') return ann.icon;
    const iconMap = { '🎂': CakeIcon, '🎈': BalloonIcon, '🎉': ConfettiIcon, '✈️': TicketsPlaneIcon, '💬': MessageCircleMoreIcon };
    const Icon = iconMap[ann.icon];
    return Icon ? /*#__PURE__*/React.createElement(Icon, { size }) : ann.icon;
  };
  // Same date-display convention as the anniversary settings modal's list tab (ui-event-modals.js)
  const getAnnBannerDateDisplay = (ann) => {
    if (ann.type === 'yearly' || ann.type === 'once') {
      const parts = (ann.date || '').split('-');
      const label = ann.type === 'yearly'
        ? `${Number(parts[0]) || 1}월 ${Number(parts[1]) || 1}일`
        : (parts.length === 3 ? `${parts[0]}년 ${Number(parts[1])}월 ${Number(parts[2])}일` : ann.date || '');
      return ann.isLunar ? `음력 ${label}${ann.isLeap ? ' (윤달)' : ''}` : label;
    }
    if (ann.type === 'range') return `${formatDateWithDayName(ann.startDate)} ~ ${formatDateWithDayName(ann.endDate)}`;
    return ann.targetDate ? `기준일: ${ann.targetDate}` : '';
  };
  // Same as ui-event-modals.js's getKakaoMapLinkUrl -- see that file's comment for why this
  // isn't going through the (dead) getPlaceKakaoRouteUrl bridge.
  const getAnnBannerKakaoMapLinkUrl = (place) => {
    if (!place || !Number.isFinite(place.lat) || !Number.isFinite(place.lng)) return null;
    const label = encodeURIComponent(place.alias || place.name || '장소');
    return `https://map.kakao.com/link/map/${label},${place.lat},${place.lng}`;
  };
  const LinkPreviewCard = __comp.LinkPreviewCard || __deps.LinkPreviewCard;
  const SectionCountBadge = __comp.SectionCountBadge || __deps.SectionCountBadge;
  const SyncStatusChip = __comp.SyncStatusChip || __deps.SyncStatusChip;
  const SyncStatusBanner = __comp.SyncStatusBanner || __deps.SyncStatusBanner;
  const UrlCapsuleBadge = __deps.UrlCapsuleBadge;
  const SmallXIcon = __deps.SmallXIcon;
  const TrashIcon = __comp.TrashIcon || __deps.TrashIcon;
  const getActiveParticipants = __deps.getActiveParticipants;
  const getCalendarPlaces = __deps.getCalendarPlaces;
  const getPlaceCategories = __deps.getPlaceCategories;
  const sortVisitEntriesRecentFirst = __deps.sortVisitEntriesRecentFirst;
  const normalizePlaceAddress = __deps.normalizePlaceAddress;
  const normalizePlaceDateForSort = __deps.normalizePlaceDateForSort;
  const renderTextWithUrlBadge = __deps.renderTextWithUrlBadge;
  const sanitizeText = __deps.sanitizeText;
  const autoGrowTextarea = __deps.autoGrowTextarea;
  const getPlaceCategoryIcon = __deps.getPlaceCategoryIcon;
  const firebaseConfig = __deps.firebaseConfig || window.firebaseConfig;
  const KAKAO_CATEGORY_GROUP_TO_PLACE_CATEGORY = __deps.KAKAO_CATEGORY_GROUP_TO_PLACE_CATEGORY || {};

  const [activeTab, setActiveTab] = React.useState(initialTab || 'participant'); // 'participant' | 'meeting' | 'settlement' | 'photo'
  const [participantId, setParticipantId] = React.useState('');
  const [note, setNote] = React.useState('');
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const noteInputRef = React.useRef(null);
  const brokenMeetingPhotoKeysRef = React.useRef(new Set());
  const brokenMeetingPhotoUrlsRef = React.useRef(new Set());
  const [brokenMeetingPhotoRevision, setBrokenMeetingPhotoRevision] = React.useState(0);
  const normalizeBrokenMeetingPhotoUrl = value => {
    const url = String(value || '').trim();
    if (!url) return '';
    return url.split(/[?#]/)[0];
  };
  const isBrokenMeetingPhotoValue = value => {
    const url = normalizeBrokenMeetingPhotoUrl(value);
    return !!url && brokenMeetingPhotoUrlsRef.current.has(url);
  };
  // A failed Storage upload used to leave a data URL truncated at the Firestore safety limit.
  // It still looks non-empty to a simple `imageUrl || thumbUrl` check, so it inflated the tab
  // badge even though the browser could not render it. Treat that known truncated shape as
  // unavailable until the orphaned reference is replaced.
  const isRenderableMeetingPhotoValue = value => {
    const url = String(value || '').trim();
    if (!url) return false;
    if (/^https?:\/\//i.test(url)) return true;
    if (/^data:image\/(?:jpeg|jpg|png|webp|gif|avif|bmp);base64,/i.test(url)) {
      return url.length > 64 && url.length !== 2000;
    }
    return false;
  };
  const markBrokenMeetingPhoto = (photo, brokenInfo = {}) => {
    const key = photo?.refKey || photo?.mediaKey || photo?.id || photo?.imageUrl || photo?.thumbUrl;
    const urls = [
      photo?.imageUrl,
      photo?.thumbUrl,
      brokenInfo?.src,
      brokenInfo?.fallbackSrc,
      brokenInfo?.currentSrc
    ].map(normalizeBrokenMeetingPhotoUrl).filter(Boolean);
    let changed = false;
    if (key && !brokenMeetingPhotoKeysRef.current.has(key)) {
      brokenMeetingPhotoKeysRef.current.add(key);
      changed = true;
    }
    urls.forEach(url => {
      if (!brokenMeetingPhotoUrlsRef.current.has(url)) {
        brokenMeetingPhotoUrlsRef.current.add(url);
        changed = true;
      }
    });
    if (changed) setBrokenMeetingPhotoRevision(prev => prev + 1);
  };
  const activeParticipants = getActiveParticipants(calendar);
  const dateEntries = getActiveAvailabilities(calendar).filter(e => e.date === dateStr);
  const dateAnns = getAnniversariesForDate(dateStr, anniversaries);
  const getExistingNoteForParticipant = id => (dateEntries.find(entry => entry.participantId === id)?.note || '');

  const selectedPart = activeParticipants.find(p => p.id === participantId);
  const selectedPartName = selectedPart ? selectedPart.name : '';
  const selectedPartColor = selectedPart ? selectedPart.color : '#94A3B8';

  // Place state
  const [placeQuery, setPlaceQuery] = React.useState('');
  const [placeResults, setPlaceResults] = React.useState([]);
  const [selectedPlace, setSelectedPlace] = React.useState(null);
  const [placeMemo, setPlaceMemo] = React.useState('');
  // Once 장소 메모 wraps past a single line, the 추가/취소/수정 buttons no longer fit comfortably
  // beside it -- even on PC, not just the <480px mobile breakpoint that already stacks every other
  // field's actions below it (see .date-modal-field-with-actions in app.css). Measured off the
  // textarea's own scrollHeight (its content height regardless of screen width) rather than a
  // viewport media query, since this is about the memo text itself overflowing, not the device.
  // One-way latch: once the memo has needed a second line, keep the stacked layout for the rest
  // of this editing session rather than re-measuring on every keystroke. Un-latching live caused
  // a visible jump-jump-jump while typing near the wrap boundary -- switching to the stacked
  // layout widens the textarea, which can make the very same text fit back on one line, flipping
  // isPlaceMemoWrapped straight back to false on the next keystroke, which narrows it again and
  // re-wraps it, and so on. Only the calls that load a fresh/different memo (see setPlaceMemo call
  // sites) explicitly reset this back to false.
  const placeMemoTextareaRef = React.useRef(null);
  // Monotonic request id so stale place-search responses never overwrite newer results
  // (debounced live search and the manual 검색 button can overlap without AbortController).
  const placeSearchReqIdRef = React.useRef(0);
  const [isPlaceMemoWrapped, setIsPlaceMemoWrapped] = React.useState(false);
  React.useLayoutEffect(() => {
    const el = placeMemoTextareaRef.current;
    if (!el) return;
    if (el.scrollHeight > 48) setIsPlaceMemoWrapped(true);
  }, [placeMemo]);
  const [placeAlias, setPlaceAlias] = React.useState('');
  const [placeCategoryId, setPlaceCategoryId] = React.useState(() => getPlaceCategories(calendar)[0]?.id || 'etc');
  const [placeVisitStatus, setPlaceVisitStatus] = React.useState('visited');
  const [editingLinkedPlaceId, setEditingLinkedPlaceId] = React.useState(null);
  const [isPlaceLoading, setIsPlaceLoading] = React.useState(false);
  const [isPlaceCollapsed, setIsPlaceCollapsed] = React.useState(true);
  const [placeSearchStage, setPlaceSearchStage] = React.useState(null);
  const [isSavingPlace, setIsSavingPlace] = React.useState(false);

  // Search progress simulation states
  const [searchProgress, setSearchProgress] = React.useState(0);
  const [estRemainingSeconds, setEstRemainingSeconds] = React.useState(5);

  React.useEffect(() => {
    if (!isPlaceLoading) {
      setSearchProgress(0);
      setEstRemainingSeconds(5);
      return;
    }
    setSearchProgress(5);
    setEstRemainingSeconds(5);
    const startTime = Date.now();
    const targetDuration = 5000;
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progressValue = Math.min(Math.round(98 * (1 - Math.exp(-elapsed / 2200))), 98);
      const remaining = Math.max(1, Math.round((targetDuration - elapsed) / 1000));
      setSearchProgress(progressValue);
      setEstRemainingSeconds(remaining);
    }, 100);
    return () => clearInterval(interval);
  }, [isPlaceLoading]);

  const searchPlacesWithProviders = async (cleanQuery, options = {}) => {
    const api = window.GATHER_APP_PLACE_SEARCH;
    if (!api || typeof api.searchPlaces !== 'function') return { provider: null, results: [] };
    const callerOnStage = typeof options.onStage === 'function' ? options.onStage : null;
    return api.searchPlaces(cleanQuery, {
      ...options,
      firebaseConfig,
      categoryMap: KAKAO_CATEGORY_GROUP_TO_PLACE_CATEGORY,
      onStage: stage => {
        if (callerOnStage) callerOnStage(stage);
        else setPlaceSearchStage(stage);
      }
    });
  };

  // Registered places for this date
  const registeredPlaces = React.useMemo(() => {
    return getCalendarPlaces(calendar).filter(p => doesPlaceMatchDate(p, dateStr)).slice().sort((a, b) => {
      const ao = Number.isFinite(Number(a.order)) ? Number(a.order) : Number.POSITIVE_INFINITY;
      const bo = Number.isFinite(Number(b.order)) ? Number(b.order) : Number.POSITIVE_INFINITY;
      return ao !== bo ? ao - bo : (a.createdAt || 0) - (b.createdAt || 0);
    });
  }, [calendar, dateStr]);
  // Which anniversary banners (keyed by ann.id) are expanded to show 기간/장소/설명/사진 detail.
  const [expandedAnnBannerIds, setExpandedAnnBannerIds] = React.useState(() => new Set());
  const toggleAnnBannerExpanded = (id) => setExpandedAnnBannerIds(prev => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });
  const [draggingPlaceId, setDraggingPlaceId] = React.useState('');
  const [dragOverPlaceId, setDragOverPlaceId] = React.useState('');
  const movePlace = async (sourceId, targetId) => {
    if (!onReorderPlaces || !sourceId || !targetId || sourceId === targetId) return false;
    const sourceIdx = registeredPlaces.findIndex(p => p.id === sourceId);
    const targetIdx = registeredPlaces.findIndex(p => p.id === targetId);
    if (sourceIdx < 0 || targetIdx < 0) return false;
    const next = [...registeredPlaces];
    const [moved] = next.splice(sourceIdx, 1);
    next.splice(targetIdx, 0, moved);
    const ok = await Promise.resolve(onReorderPlaces(dateStr, next.map(p => p.id)));
    return ok !== false;
  };

  // Places already registered on THIS calendar (any date, e.g. a place first visited weeks ago)
  // matching the current search text -- '장소 검색' below only queries Kakao/Google/Nominatim's
  // public business directories, which never contain a private/informal place someone only ever
  // hand-registered here (e.g. "서준네"). Surfacing these lets the user reuse that record (see
  // handleSelectExistingPlace) instead of typing it as a brand-new place with no visit history.
  const existingPlaceSuggestions = React.useMemo(() => {
    const trimmed = placeQuery.trim();
    if (selectedPlace && selectedPlace.name === trimmed) return [];
    if (trimmed.length < 2) return [];
    const q = trimmed.toLowerCase();
    const todayIds = new Set(registeredPlaces.map(p => p.id));
    return getCalendarPlaces(calendar)
      .filter(p => !todayIds.has(p.id))
      .filter(p => (p.name || '').toLowerCase().includes(q) || (p.alias || '').toLowerCase().includes(q))
      .slice(0, 8);
  }, [placeQuery, selectedPlace, calendar, registeredPlaces]);

  const duplicatePlace = React.useMemo(() => {
    if (!selectedPlace || selectedPlace.isExistingPlace || selectedPlace.mergeTargetId || selectedPlace.duplicateDismissed || editingLinkedPlaceId) return null;
    return getCalendarPlaces(calendar).find(place => arePlacesSameLocation(place, selectedPlace)) || null;
  }, [selectedPlace, calendar, editingLinkedPlaceId]);

  // Debounced live typing search
  React.useEffect(() => {
    const trimmed = placeQuery.trim();
    if (selectedPlace && selectedPlace.name === trimmed) return undefined;
    if (trimmed.length < 2) {
      // Invalidate any in-flight search so a late response cannot repopulate an empty query.
      placeSearchReqIdRef.current += 1;
      setPlaceResults([]);
      setIsPlaceLoading(false);
      setPlaceSearchStage(null);
      return undefined;
    }
    // Keep previous results visible until the newer request finishes (no flash-empty).
    const timer = setTimeout(() => { handlePlaceSearch(null, true); }, 380);
    return () => clearTimeout(timer);
  }, [placeQuery, selectedPlace]);

  React.useEffect(() => {
    setParticipantId('');
    setNote('');
    setIsSheetOpen(false);
    setIsSubmitting(false);

    setSelectedPlace(null);
    setPlaceMemo('');
    setIsPlaceMemoWrapped(false);
    setPlaceAlias('');
    setPlaceCategoryId(getPlaceCategories(calendar)[0]?.id || 'etc');
    setPlaceVisitStatus('visited');
    setEditingLinkedPlaceId(null);
    setPlaceQuery('');
    setIsPlaceCollapsed(true);
    setPlaceResults([]);
  }, [calendar?.id, dateStr]);

  const handlePlaceSearch = async (e, auto = false) => {
    if (e) e.preventDefault();
    const cleanQuery = placeQuery.trim();
    if (!cleanQuery) {
      if (!auto) showToast('검색할 주소나 업체명을 입력해 주세요.', 'error');
      return;
    }
    const reqId = ++placeSearchReqIdRef.current;
    const guardedOnStage = stage => {
      if (reqId === placeSearchReqIdRef.current) setPlaceSearchStage(stage);
    };
    setIsPlaceLoading(true);
    try {
      // Always try kakao-first first (same path as debounce) for snappy UX.
      // Manual 검색 additionally falls back to the full provider order only when kakao
      // returns zero hits -- never apply results from an superseded request.
      let { results: mapped } = await searchPlacesWithProviders(cleanQuery, { auto: true, onStage: guardedOnStage });
      if (reqId !== placeSearchReqIdRef.current) return;
      if ((!mapped || mapped.length === 0) && !auto) {
        ({ results: mapped } = await searchPlacesWithProviders(cleanQuery, { auto: false, onStage: guardedOnStage }));
        if (reqId !== placeSearchReqIdRef.current) return;
      }
      setPlaceResults(mapped || []);
      if ((mapped || []).length === 0 && !auto) {
        showToast('검색 결과가 없습니다.', 'info');
      }
    } catch (err) {
      if (reqId !== placeSearchReqIdRef.current) return;
      console.error('Place search error:', err);
      showToast('장소 검색 중 오류가 발생했습니다.', 'error');
    } finally {
      if (reqId === placeSearchReqIdRef.current) {
        setIsPlaceLoading(false);
        setPlaceSearchStage(null);
      }
    }
  };

  const handleSavePlaceClick = async () => {
    if (!onSavePlace) return;
    if (!selectedPlace) {
      showToast('추가할 장소를 선택해 주세요.', 'error');
      return;
    }
    setIsSavingPlace(true);
    try {
      const cleanName = sanitizeText(selectedPlace.name || '', 80);
      const cleanAddress = normalizePlaceAddressForSave(selectedPlace.address || '', selectedPlace.lat, selectedPlace.lng);
      const cleanMemo = sanitizeText(placeMemo.trim() || '', 2000);
      
      const newPlaceData = {
        id: editingLinkedPlaceId || undefined,
        name: cleanName,
        alias: sanitizeText(placeAlias || '', 80),
        address: cleanAddress,
        lat: selectedPlace.lat,
        lng: selectedPlace.lng,
        categoryId: placeCategoryId || selectedPlace.categoryId || 'etc',
        memo: cleanMemo,
        // This field always represents just THIS date's note (brand new place, an existing place
        // reused for another date, or an already-linked place being re-edited) -- memoOp:'upsert'
        // tells handleSavePlace (app-main.js) to merge it into the target place's per-date memo
        // stack instead of overwriting the whole memo with just this one note.
        memoOp: 'upsert',
        visitStatus: placeVisitStatus === 'planned' ? 'planned' : 'visited',
        visitDate: dateStr,
        // Not set while editing a place already linked to this date (editingLinkedPlaceId) --
        // only relevant when adding a NEW date entry, so handleSavePlace (app-main.js) can
        // recognize "the same Kakao/Google/Nominatim result, or the same already-registered
        // calendar place (see handleSelectExistingPlace), was picked again" and merge into that
        // record's multi-date memo instead of creating a duplicate place.
        sourcePlaceId: editingLinkedPlaceId ? '' : (selectedPlace.mergeTargetId || selectedPlace.id || '')
      };

      const ok = await Promise.resolve(onSavePlace(newPlaceData));
      if (ok === false) {
        showToast(editingLinkedPlaceId ? '장소 수정에 실패했습니다.' : '장소 추가에 실패했습니다.', 'error');
        return;
      }
      showToast(editingLinkedPlaceId ? '장소가 수정되었습니다.' : '장소가 추가되었습니다.', 'success');
      setSelectedPlace(null);
      setPlaceMemo('');
      setIsPlaceMemoWrapped(false);
      setPlaceAlias('');
      setPlaceCategoryId(getPlaceCategories(calendar)[0]?.id || 'etc');
      setPlaceVisitStatus('visited');
      setEditingLinkedPlaceId(null);
      setPlaceQuery('');
      setHasInteracted(false);
      const resetPlaceCat = getPlaceCategories(calendar)[0]?.id || 'etc';
      snapshotFormBaseline({
        ...formBaselineRef.current,
        editingLinkedPlaceId: null,
        placeMemo: '',
        placeAlias: '',
        placeQuery: '',
        selectedPlaceKey: '',
        placeCategoryId: resetPlaceCat,
        placeVisitStatus: 'visited'
      });
    } catch (err) {
      console.error('Save place error:', err);
      showToast('장소 추가 실패', 'error');
    } finally {
      setIsSavingPlace(false);
    }
  };

  const handleSelectResult = (res) => {
    setSelectedPlace({ ...res, duplicateDismissed: false, mergeTargetId: '', isExistingPlace: false });
    setPlaceQuery(res.name);
    setPlaceResults([]);
  };

  // Prefills the place form for a place already linked to THIS date (card-click edit).
  // Scrolls to and focuses the 장소 메모 input after state settles so the user can edit immediately.
  const beginEditLinkedPlace = (place) => {
    if (!place) return;
    const sp = { name: place.name, address: place.address || '', lat: place.lat, lng: place.lng, categoryId: place.categoryId || 'etc' };
    // Prefill with ONLY this date's note, not the place's whole memo history -- this
    // field always represents a single date's entry, upserted back into the stack on
    // save (see handleSavePlaceClick's memoOp:'upsert').
    const dateNote = getPlaceMemoEntryForDate(place.memo || '', dateStr);
    const catId = place.categoryId || 'etc';
    const visit = place.visitStatus === 'planned' ? 'planned' : 'visited';
    setEditingLinkedPlaceId(place.id);
    setSelectedPlace(sp);
    setPlaceQuery(place.name || '');
    setPlaceAlias(place.alias || '');
    setPlaceMemo(dateNote);
    setIsPlaceMemoWrapped(false);
    setPlaceCategoryId(catId);
    setPlaceVisitStatus(visit);
    setPlaceResults([]);
    setHasInteracted(false);
    snapshotFormBaseline({
      ...formBaselineRef.current,
      editingLinkedPlaceId: place.id,
      placeMemo: dateNote,
      placeAlias: place.alias || '',
      placeQuery: place.name || '',
      selectedPlaceKey: String(sp.id || '') + '|' + String(sp.name || '') + '|' + String(sp.lat || '') + '|' + String(sp.lng || ''),
      placeCategoryId: catId,
      placeVisitStatus: visit
    });
    window.setTimeout(() => {
      const el = placeMemoTextareaRef.current;
      if (!el) return;
      try { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch (_) {}
      try { el.focus(); } catch (_) {}
    }, 50);
  };

  // Reuses an already-registered calendar place picked from existingPlaceSuggestions above.
  // Deliberately does NOT set editingLinkedPlaceId (that's reserved for card-click edit of
  // a place already linked to THIS date) -- instead handleSavePlaceClick below carries this
  // place's own id through as sourcePlaceId, which handleSavePlace (app-main.js) recognizes and
  // merges into, appending this date onto the place's existing multi-date memo instead of
  // creating a duplicate place document.
  const handleSelectExistingPlace = (place) => {
    setSelectedPlace({
      id: place.id,
      name: place.name,
      address: place.address,
      lat: place.lat,
      lng: place.lng,
      categoryId: place.categoryId,
      duplicateDismissed: true,
      isExistingPlace: true
    });
    setPlaceAlias(place.alias || '');
    setPlaceCategoryId(place.categoryId || getPlaceCategories(calendar)[0]?.id || 'etc');
    setPlaceQuery(place.name);
    setPlaceResults([]);
    // Leave blank rather than prefilling the place's existing memo -- this field now always holds
    // just THIS date's note, which handleSavePlaceClick below upserts into the place's per-date
    // memo stack (see app-main.js's handleSavePlace, memoOp:'upsert') without disturbing its other
    // dates' entries.
    setPlaceMemo('');
    setIsPlaceMemoWrapped(false);
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!participantId) {
      showToast('참여자를 선택해 주세요.', 'error');
      return;
    }
    setIsSubmitting(true);
    const cleanNote = sanitizeText(note, 500);
    const ok = await onSave(dateStr, participantId, cleanNote);
    setIsSubmitting(false);
    if (ok !== false) {
      const wasEdit = dateEntries.some(en => en.participantId === participantId);
      showToast(wasEdit ? '참석 정보가 수정되었습니다.' : '참석이 추가되었습니다.', 'success');
      setParticipantId('');
      setNote('');
      setHasInteracted(false);
      snapshotFormBaseline({ ...formBaselineRef.current, participantId: '', note: '' });
    }
  };

  const handleEditClick = (entry) => {
    const pid = entry.participantId;
    const n = entry.note || '';
    setParticipantId(pid);
    setNote(n);
    setHasInteracted(false);
    snapshotFormBaseline({
      ...formBaselineRef.current,
      participantId: pid,
      note: n
    });
    if (noteInputRef.current) {
      // The attendance list this click came from typically sits well below the memo field in
      // the modal's own scroll, so a plain focus() can leave the just-loaded field off-screen --
      // scroll it into view first, then focus once that scroll settles.
      noteInputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      noteInputRef.current.focus({ preventScroll: true });
    }
  };

  const handleDeleteClick = (entry) => {
    if (!onDelete) return;
    const part = activeParticipants.find(p => p.id === entry.participantId);
    const nameLabel = part ? part.name : '참여자';
    const entrySnapshot = JSON.parse(JSON.stringify(entry));
    onRequestConfirm('참석 삭제', `"${nameLabel}"님의 참석 기록을 삭제하시겠습니까?`, async () => {
      setIsSubmitting(true);
      const ok = await onDelete(dateStr, entry.participantId);
      setIsSubmitting(false);
      if (ok !== false) {
        showToast('참석 기록이 삭제되었습니다.', 'delete', 5000, async () => {
          try {
            setIsSubmitting(true);
            const restored = await onSave(dateStr, entrySnapshot.participantId, entrySnapshot.note || '');
            setIsSubmitting(false);
            if (restored !== false) showToast('참석 삭제를 되돌렸습니다.', 'success', 3000);
            else showToast('참석 복원 실패', 'error', 4000);
          } catch (restoreErr) {
            setIsSubmitting(false);
            console.error('Attendance restore failed:', restoreErr);
            showToast('참석 복원 실패', 'error', 4000);
          }
        });
      }
      else showToast('삭제에 실패했습니다.', 'error');
    });
  };

  const titleParts = getShortTitleParts(dateStr);
  const getDeleteDateLabel = dateStr => `${titleParts.year}${titleParts.rest}`;
  const holidayNames = React.useMemo(() => getHolidayNamesForDate(dateStr), [dateStr]);
  const holidayLabelText = holidayNames.length > 0 ? holidayNames.join('·') : '';
  const totalPartCount = activeParticipants.length || 0;
  const uniqueActiveParts = new Set(dateEntries.map(e => e.participantId));
  const isAllAvailable = totalPartCount > 0 && uniqueActiveParts.size === totalPartCount;
  const isConfirmed = isDateConfirmedMeeting(calendar, dateStr);
  const confirmedMeetingEntry = getConfirmedMeetings(calendar).find(m => m.date === dateStr) || null;
  const getMessageImageEntries = __deps.getMessageImageEntries;
  const parseFlexibleDateTokens = __deps.parseFlexibleDateTokens || (text => {
    const found = new Set();
    const source = String(text || '');
    const add = (yearRaw, monthRaw, dayRaw) => {
      let year = Number(yearRaw); const month = Number(monthRaw); const day = Number(dayRaw);
      if (year < 100) year += 2000;
      if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day) || year < 2000 || year > 2099 || month < 1 || month > 12 || day < 1 || day > 31) return;
      const date = new Date(year, month - 1, day);
      if (date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day) found.add(`${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`);
    };
    source.replace(/(?:^|[^\d])(\d{2,4})\s*[.\-/]\s*(\d{1,2})\s*[.\-/]\s*(\d{1,2})(?=$|[^\d])/g, (_, y, m, d) => { add(y, m, d); return _; });
    source.replace(/(?:^|[^\d])(\d{4})(\d{2})(\d{2})(?=$|[^\d])/g, (_, y, m, d) => { add(y, m, d); return _; });
    source.replace(/(?:^|[^\d])(\d{2})(\d{2})(\d{2})(?=$|[^\d])/g, (_, y, m, d) => { add(y, m, d); return _; });
    return Array.from(found);
  });
  const dateStrToHashtag = __deps.dateStrToHashtag;

  // A 일정 사진's sourceMessageId can point at a chat message older than whatever's currently
  // paginated into `chatMessages` (that array only holds the live-loaded window here -- unlike
  // the Gallery page, this modal has no "load more" of its own to widen it), which made
  // resolveMeetingPhotoDisplay below silently fall back to the archival snapshot's stale tags
  // whenever that happened. Fetch any missing source messages directly by id (same lookup
  // Gallery's own tag-save path already uses) and fold them in below.
  const [fetchedSourceMessages, setFetchedSourceMessages] = React.useState({});
  const fetchedSourceIdsRef = React.useRef(new Set());
  React.useEffect(() => {
    if (typeof onFindChatMessageById !== 'function') return;
    const loadedIds = new Set((chatMessages || []).map(m => m && m.id).filter(Boolean));
    const missingIds = Array.from(new Set(
      (Array.isArray(confirmedMeetingEntry?.photos) ? confirmedMeetingEntry.photos : [])
        .map(p => p && p.sourceMessageId)
        .filter(id => id && !loadedIds.has(id) && !fetchedSourceIdsRef.current.has(id))
    ));
    if (missingIds.length === 0) return;
    missingIds.forEach(id => fetchedSourceIdsRef.current.add(id));
    let cancelled = false;
    Promise.all(missingIds.map(id => Promise.resolve(onFindChatMessageById(id)).then(msg => [id, msg]))).then(pairs => {
      if (cancelled) return;
      const found = pairs.filter(([, msg]) => msg);
      if (found.length === 0) return;
      setFetchedSourceMessages(prev => {
        const next = { ...prev };
        found.forEach(([id, msg]) => { next[id] = msg; });
        return next;
      });
    });
    return () => { cancelled = true; };
  }, [confirmedMeetingEntry, chatMessages, onFindChatMessageById]);
  const chatMessagesWithFetchedSources = React.useMemo(() => {
    const extra = Object.values(fetchedSourceMessages);
    return extra.length === 0 ? chatMessages : [...(chatMessages || []), ...extra];
  }, [chatMessages, fetchedSourceMessages]);

  // Query the server by the date tag immediately. The date photo list must not depend on the
  // user opening Gallery or loading older chat pages first.
  const [fetchedTaggedMessages, setFetchedTaggedMessages] = React.useState([]);
  const [fetchedTaggedMemos, setFetchedTaggedMemos] = React.useState([]);
  const [indexedMeetingPhotos, setIndexedMeetingPhotos] = React.useState([]);
  const fetchedDateTagRef = React.useRef('');
  React.useEffect(() => {
    const targetTag = typeof dateStrToHashtag === 'function' ? dateStrToHashtag(dateStr) : '';
    if (!targetTag || typeof onFetchDateTaggedMessages !== 'function' || fetchedDateTagRef.current === targetTag) return;
    fetchedDateTagRef.current = targetTag;
    let cancelled = false;
    let refreshInFlight = false;
    const refresh = () => {
      if (cancelled || refreshInFlight) return;
      refreshInFlight = true;
      Promise.resolve(onFetchDateTaggedMessages(targetTag)).then(messages => {
        if (!cancelled && Array.isArray(messages)) setFetchedTaggedMessages(messages);
      }).catch(err => console.warn('date-tagged meeting photo fetch failed:', err))
        .finally(() => { refreshInFlight = false; });
    };
    refresh();
    // A browser without the Firestore SDK has no onSnapshot channel. Keep an open date modal
    // fresh by rechecking only this date's tagged messages; this is bounded to the modal lifetime
    // and stops immediately on close, so another device's completed upload appears without a
    // manual refresh while normal SDK clients still get their push update instantly.
    const refreshTimer = setInterval(refresh, 6000);
    return () => { cancelled = true; clearInterval(refreshTimer); };
  }, [dateStr, dateStrToHashtag, onFetchDateTaggedMessages]);
  React.useEffect(() => {
    const targetTag = typeof dateStrToHashtag === 'function' ? dateStrToHashtag(dateStr) : '';
    if (!targetTag || typeof onFetchDateTaggedMemos !== 'function') return;
    let cancelled = false;
    Promise.resolve(onFetchDateTaggedMemos(targetTag)).then(items => {
      if (!cancelled && Array.isArray(items)) setFetchedTaggedMemos(items);
    }).catch(err => console.warn('date-tagged memo fetch failed:', err));
    return () => { cancelled = true; };
  // The App passes a small calendar-scoped callback inline. Depending on that function identity
  // would cancel a still-running server scan on every unrelated App render (badge/chat updates),
  // making the video briefly appear and then disappear. DateModal is remounted per calendar;
  // dateStr is the actual query key that should restart this effect.
  }, [dateStr, dateStrToHashtag]);
  React.useEffect(() => {
    if (typeof onFetchMeetingPhotoIndex !== 'function' || !dateStr) return;
    let cancelled = false;
    Promise.resolve(onFetchMeetingPhotoIndex(dateStr)).then(photos => {
      if (!cancelled && Array.isArray(photos)) setIndexedMeetingPhotos(photos);
    }).catch(err => console.warn('meeting photo index fetch failed:', err));
    return () => { cancelled = true; };
  }, [dateStr, onFetchMeetingPhotoIndex]);
  const allMeetingPhotoMessages = React.useMemo(() => {
    const byId = new Map();
    [...(chatMessagesWithFetchedSources || []), ...(fetchedTaggedMessages || [])].forEach(msg => {
      if (msg?.id) byId.set(msg.id, msg);
    });
    return Array.from(byId.values());
  }, [chatMessagesWithFetchedSources, fetchedTaggedMessages]);

  const meetingPhotos = React.useMemo(() => {
    // An auto-linked 일정 사진 (sourceMessageId set) is only a reference/archival copy of a real
    // chat photo -- its own imageUrl/thumbUrl/tags fields are a snapshot from whenever it was
    // linked, and a later tag edit (e.g. from the Gallery page's Lightbox) writes to the SOURCE
    // MESSAGE, not back onto this snapshot (see handleSaveImageTags in app-main.js). Gallery
    // already resolves the live values via resolveMeetingPhotoDisplay before displaying; this tab
    // didn't, so the exact same photo could show different tags depending on which page you
    // opened it from. Resolving here keeps this tab's thumbnails and Lightbox in sync with it.
    const indexedPhotos = (indexedMeetingPhotos || []).map(photo => ({
      ...photo,
      imageUrl: photo.imageUrl || photo.thumbUrl,
      thumbUrl: photo.thumbUrl || photo.imageUrl,
      sourceMessageId: photo.sourceMessageId,
      sourceImageIndex: Number(photo.sourceImageIndex),
      createdAt: photo.createdAt || 0,
      mediaKey: `chat:${photo.sourceMessageId}:${photo.sourceImageIndex}`,
      refKey: `meeting-index:${photo.id}`
    }));
    const directPhotos = [...indexedPhotos, ...(Array.isArray(confirmedMeetingEntry?.photos) ? confirmedMeetingEntry.photos : [])]
      .filter(photo => photo && (photo.imageUrl || photo.thumbUrl))
      .map(photo => {
        const resolved = resolveMeetingPhotoDisplay(photo, chatMessagesWithFetchedSources) || {};
        const mediaKey = resolved.mediaKey
          || photo.mediaKey
          || (photo.sourceMessageId && Number.isInteger(photo.sourceImageIndex)
            ? `chat:${photo.sourceMessageId}:${photo.sourceImageIndex}`
            : `meeting:${dateStr}:${photo.id || 'photo'}`);
        const refKey = resolved.refKey || photo.refKey || `meeting:${dateStr}:${photo.id || 'photo'}`;
        return {
          ...photo,
          imageUrl: resolved.imageUrl || photo.imageUrl,
          thumbUrl: resolved.thumbUrl || photo.thumbUrl,
          tags: resolved.tags != null ? resolved.tags : photo.tags,
          assetKey: resolved.assetKey || photo.assetKey || mediaKey,
          mediaKey,
          refKey
        };
      })
      .filter((photo, index, photos) => {
        const key = photo.mediaKey || photo.refKey || photo.id || photo.imageUrl || photo.thumbUrl;
        return photos.findIndex(candidate => (candidate.mediaKey || candidate.refKey || candidate.id || candidate.imageUrl || candidate.thumbUrl) === key) === index;
      });

    const directKeys = new Set(directPhotos.map(p => p.mediaKey || p.refKey || p.id).filter(Boolean));
    const targetTag = typeof dateStrToHashtag === 'function' ? dateStrToHashtag(dateStr) : (dateStr ? dateStr.replace(/-/g, '').slice(2) : '');

    const chatPhotos = [];
    allMeetingPhotoMessages.forEach(msg => {
      const getEntries = typeof getMessageImageEntries === 'function' ? getMessageImageEntries : null;
      const entries = getEntries ? getEntries(msg) : [];
      if (entries.length > 0) {
        entries.forEach((entry, idx) => {
          const tags = (Array.isArray(msg.imageTags) ? msg.imageTags[idx] : '') || entry.tags || '';
          const parsedDates = typeof parseFlexibleDateTokens === 'function' ? parseFlexibleDateTokens(tags) : [];
          const matchesTag = (targetTag && tags.includes(targetTag)) || parsedDates.includes(dateStr);
          if (matchesTag) {
            const url = entry.full || entry.thumb || entry.imageUrl;
            const key = entry.mediaKey || entry.refKey || url;
            if (url && key && !directKeys.has(key)) {
              directKeys.add(key);
              chatPhotos.push({
                id: `chat_photo_${msg.id}_${idx}`,
                imageUrl: url,
                thumbUrl: entry.thumb || url,
                createdAt: msg.timestamp || 0,
                source: 'chat-tag',
                sourceMessageId: msg.id,
                sourceImageIndex: idx,
                tags: tags,
                assetKey: entry.assetKey || entry.mediaKey || key,
                mediaKey: entry.mediaKey || key,
                refKey: entry.refKey || `chat:${msg.id}:${idx}`
              });
            }
          }
        });
      } else {
        const imageUrl = msg.imageUrl || msg.thumbUrl;
        const tags = (Array.isArray(msg.imageTags) ? msg.imageTags[0] : '') || msg.tags || '';
        const parsedDates = typeof parseFlexibleDateTokens === 'function' ? parseFlexibleDateTokens(tags) : [];
        const matchesTag = (targetTag && tags.includes(targetTag)) || parsedDates.includes(dateStr);
        const fallbackKey = `chat:${msg.id}:0`;
        if (imageUrl && matchesTag && !directKeys.has(fallbackKey)) {
          directKeys.add(fallbackKey);
          chatPhotos.push({
            id: `chat_photo_${msg.id}_0`,
            imageUrl: imageUrl,
            thumbUrl: msg.thumbUrl || imageUrl,
            createdAt: msg.timestamp || 0,
            source: 'chat-tag',
            sourceMessageId: msg.id,
            sourceImageIndex: 0,
            tags: tags,
            assetKey: fallbackKey,
            mediaKey: fallbackKey,
            refKey: fallbackKey
          });
        }
      }
    });

    const memoPhotos = [];
    const targetDate = dateStr;
    const taggedMemoMap = new Map();
    [...(Array.isArray(memos) ? memos : []), ...fetchedTaggedMemos].forEach(memo => {
      if (memo?.id) taggedMemoMap.set(memo.id, memo);
    });
    taggedMemoMap.forEach(memo => {
      if (!memo || isTombstone(memo)) return;
      const tags = Array.isArray(memo.tags) ? memo.tags.join(' ') : String(memo.tags || '');
      const parsedDates = typeof parseFlexibleDateTokens === 'function' ? parseFlexibleDateTokens(tags) : [];
      if (!(parsedDates.includes(targetDate) || (targetTag && tags.includes(targetTag)))) return;
      // Memo link previews may be persisted separately from the body text (especially for
      // older memos). Include every supported URL field when resolving direct video media so
      // date-tagged memo videos are not silently omitted from the meeting photo tab.
      const memoDirectUrl = memo.linkPreview?.url || memo.url || memo.videoUrl || '';
      const asMsg = { id: memo.id, text: [memo.text || '', memoDirectUrl].filter(Boolean).join(' '), imageUrl: memo.imageUrl, imageUrls: memo.imageUrls, thumbUrl: memo.thumbUrl, thumbUrls: memo.thumbUrls };
      const imageEntries = typeof getMessageImageEntries === 'function' ? getMessageImageEntries(asMsg) : [];
      imageEntries.forEach((entry, idx) => {
        const full = entry.full || entry.thumb;
        const key = entry.mediaKey || entry.refKey || `memo:${memo.id}:${idx}`;
        if (full && !directKeys.has(key)) {
          directKeys.add(key);
          memoPhotos.push({ id: `memo_photo_${memo.id}_${idx}`, imageUrl: full, thumbUrl: entry.thumb || full, createdAt: memo.updatedAt || memo.createdAt || 0, source: 'memo-tag', sourceMemoId: memo.id, sourceImageIndex: idx, tags, assetKey: key, mediaKey: key, refKey: `memo:${memo.id}:${idx}` });
        }
      });
      const direct = typeof getMessageDirectMediaEntry === 'function' ? getMessageDirectMediaEntry(asMsg, { allowVideo: true }) : null;
      const directMediaUrl = extractFirstUrl(asMsg.text) || direct?.directMediaUrl || direct?.full || '';
      if (direct?.directMediaUrl && directMediaUrl && !directKeys.has(`memo:${memo.id}:video`)) {
        directKeys.add(`memo:${memo.id}:video`);
        memoPhotos.push({ id: `memo_video_${memo.id}`, directMediaUrl, imageUrl: '', thumbUrl: '', title: memo.title || '', linkPreview: memo.linkPreview || null, createdAt: memo.updatedAt || memo.createdAt || 0, source: 'memo-tag', sourceMemoId: memo.id, tags, mediaKey: `memo:${memo.id}:video`, refKey: `memo:${memo.id}:video` });
      }
    });
    return [...directPhotos, ...chatPhotos, ...memoPhotos].sort((a, b) => {
      const av = a.directMediaUrl ? 0 : 1;
      const bv = b.directMediaUrl ? 0 : 1;
      return av - bv || (b.createdAt || 0) - (a.createdAt || 0);
    });
  }, [confirmedMeetingEntry, chatMessages, memos, fetchedTaggedMemos, allMeetingPhotoMessages, chatMessagesWithFetchedSources, indexedMeetingPhotos, dateStr]);
  const visibleMeetingPhotos = React.useMemo(
    () => meetingPhotos.filter(photo => {
      if (photo.directMediaUrl) return true;
      const key = photo.refKey || photo.mediaKey || photo.id || photo.imageUrl || photo.thumbUrl;
      if (key && brokenMeetingPhotoKeysRef.current.has(key)) return false;
      return !isBrokenMeetingPhotoValue(photo.imageUrl)
        && !isBrokenMeetingPhotoValue(photo.thumbUrl)
        && (isRenderableMeetingPhotoValue(photo.imageUrl) || isRenderableMeetingPhotoValue(photo.thumbUrl));
    }),
    [meetingPhotos, brokenMeetingPhotoRevision]
  );
  const visibleMeetingVideos = visibleMeetingPhotos.filter(photo => photo.directMediaUrl);
  const visibleMeetingImages = visibleMeetingPhotos.filter(photo => !photo.directMediaUrl);
  const handleBrokenMeetingPhoto = (photo, brokenInfo = {}) => {
    markBrokenMeetingPhoto(photo, brokenInfo);
  };
  const meetingPhotoInputRef = React.useRef(null);
  const [isSavingMeetingPhotos, setIsSavingMeetingPhotos] = React.useState(false);
  const hasClipboardImage = useClipboardHasImage(activeTab === 'photo');
  const [pastePreview, setPastePreview] = React.useState(null); // { files, previewUrls } | null
  React.useEffect(() => () => {
    // Safety net if the component unmounts (e.g. modal closed) while the preview is still open.
    if (pastePreview) pastePreview.previewUrls.forEach(url => { try { URL.revokeObjectURL(url); } catch (e) {} });
  }, [pastePreview]);
  const expenses = React.useMemo(
    () => (Array.isArray(confirmedMeetingEntry?.expenses) ? confirmedMeetingEntry.expenses : [])
      .filter(e => e && typeof e === 'object' && e.id)
      .slice()
      .sort((a, b) => {
      const aOrder = Number.isFinite(Number(a.order)) ? Number(a.order) : Number.POSITIVE_INFINITY;
      const bOrder = Number.isFinite(Number(b.order)) ? Number(b.order) : Number.POSITIVE_INFINITY;
      if (aOrder !== bOrder) return aOrder - bOrder;
      return (a.createdAt || 0) - (b.createdAt || 0);
    }),
    [confirmedMeetingEntry]
  );
  const [expenseLabelInput, setExpenseLabelInput] = React.useState('');
  const [expenseAmountInput, setExpenseAmountInput] = React.useState('');
  const [expenseCategoryInput, setExpenseCategoryInput] = React.useState(() => getExpenseCategories(calendar)[0]?.id || 'etc');
  // 지출자(payer): '' means 공금지출 (paid from the shared pool). A participant name means that
  // person personally fronted the amount -- the settlement card auto-derives who to reimburse
  // from this instead of the same line item having to be re-typed there by hand.
  const [expensePayerInput, setExpensePayerInput] = React.useState('');
  const expensePayerOptions = React.useMemo(() => [
    { value: '', label: '공금지출' },
    ...activeParticipants.map(p => ({ value: p.name, label: p.name, color: p.color }))
  ], [activeParticipants]);
  const [expenseIsIncome, setExpenseIsIncome] = React.useState(false);
  // 자비부담: this expense was paid entirely out of that participant's own pocket for
  // themselves, unlike 지출자(선결제) which fronts a *shared* cost pending reimbursement from
  // the group. A self-pay item keeps its price recorded for visibility but never touches 공금
  // (shared fund) or the split total -- see its exclusion in expenseTotal below,
  // calculateSettlementBalance in app-domain-helpers.js, and monthlyExpenses in
  // ui-event-modals.js's settlement-card editor.
  const [expenseIsSelfPay, setExpenseIsSelfPay] = React.useState(false);
  const [editingExpenseId, setEditingExpenseId] = React.useState(null);
  const [isSavingExpense, setIsSavingExpense] = React.useState(false);
  const [draggingExpenseId, setDraggingExpenseId] = React.useState('');
  const [dragOverExpenseId, setDragOverExpenseId] = React.useState('');
  const expensePointerSortRef = React.useRef({ sourceId: '', targetId: '', startX: 0, startY: 0, active: false });
  // 참석 명단 drag-to-reorder -- same pointer-sort pattern as the 정산 expense list above (see
  // beginExpensePointerSort/moveExpense), keyed by participantId instead of an expense id since
  // an availability entry's natural identity within one date is (date, participantId).
  const [draggingParticipantId, setDraggingParticipantId] = React.useState('');
  const [dragOverParticipantId, setDragOverParticipantId] = React.useState('');
  const [isReorderingAttendance, setIsReorderingAttendance] = React.useState(false);
  const attendancePointerSortRef = React.useRef({ sourceId: '', targetId: '', startX: 0, startY: 0, active: false });
  // Tapping a row in the (potentially long) expense list below edits it via the form up top --
  // but that form can be well off-screen by then, so the edit silently "does nothing" from the
  // user's point of view. Scroll the 지출 명목 field into view and focus it so the edit is
  // immediately visible.
  const expenseLabelFieldRef = React.useRef(null);

  React.useEffect(() => {
    setExpenseLabelInput('');
    setExpenseAmountInput('');
    setExpenseCategoryInput(getExpenseCategories(calendar)[0]?.id || 'etc');
    setExpensePayerInput('');
    setExpenseIsIncome(false);
    setExpenseIsSelfPay(false);
    setEditingExpenseId(null);
    setDraggingExpenseId('');
    setDragOverExpenseId('');
    expensePointerSortRef.current = { sourceId: '', targetId: '', startX: 0, startY: 0, active: false };
    setIsSavingMeetingPhotos(false);
  }, [calendar?.id, dateStr]);

  const handleMeetingPhotoFiles = async event => {
    const files = Array.from(event.target.files || []);
    event.target.value = '';
    if (!files.length || typeof onAddMeetingPhotos !== 'function') return;
    setIsSavingMeetingPhotos(true);
    try {
      // onAddMeetingPhotos (handleAddMeetingPhotos in app-main.js) always shows its own toast on
      // both success and failure -- including a specific reason when there is one (e.g. the
      // calendar data size guard), not just a generic message -- so showing another toast here on
      // top of it would only ever overwrite that toast (showToast is single-slot) before the user
      // has a chance to read it. Only the case that function can't cover -- it throwing instead of
      // resolving, an actual bug rather than an expected failure -- gets a toast from here.
      await Promise.resolve(onAddMeetingPhotos(dateStr, files));
    } catch (err) {
      console.error('Meeting photo upload failed:', err);
      showToast('사진 추가 실패', 'error');
    } finally {
      setIsSavingMeetingPhotos(false);
    }
  };

  const handlePasteMeetingPhotos = async () => {
    if (typeof onAddMeetingPhotos !== 'function' || isSavingMeetingPhotos) return;
    try {
      const files = await readClipboardImageFiles(showToast);
      if (files && files.length > 0) {
        // Show what will be uploaded and let the user confirm instead of uploading immediately --
        // handleConfirmPasteMeetingPhotos does the actual upload once confirmed.
        setPastePreview({ files, previewUrls: files.map(f => URL.createObjectURL(f)) });
      }
    } catch (err) {
      console.error('Paste meeting photo failed:', err);
      showToast('사진 추가 실패', 'error');
    }
  };

  // previewUrls are revoked by the cleanup effect above once pastePreview changes (including
  // back to null here) -- no need to revoke them again in these two handlers.
  const handleCancelPastePreview = () => setPastePreview(null);
  const handleConfirmPastePreview = async () => {
    if (!pastePreview || typeof onAddMeetingPhotos !== 'function') return;
    const files = pastePreview.files;
    setPastePreview(null);
    setIsSavingMeetingPhotos(true);
    try {
      // See handleMeetingPhotoFiles above for why no toast is shown for the resolved result.
      await Promise.resolve(onAddMeetingPhotos(dateStr, files));
    } catch (err) {
      console.error('Paste meeting photo failed:', err);
      showToast('사진 추가 실패', 'error');
    } finally {
      setIsSavingMeetingPhotos(false);
    }
  };

  React.useEffect(() => {
    if (activeTab !== 'photo' || typeof onAddMeetingPhotos !== 'function') return;
    // Same preview/confirm gate as the 붙여넣기 button (handlePasteMeetingPhotos) -- this used to
    // upload straight from the paste event with no confirmation step, so a stray Ctrl+V (or an
    // image left on the clipboard from something unrelated) could add a photo the user never
    // meant to attach.
    const handlePaste = (e) => {
      const files = getImageFilesFromClipboardEvent(e);
      if (!files || !files.length) return;
      e.preventDefault();
      setPastePreview({ files, previewUrls: files.map(f => URL.createObjectURL(f)) });
    };
    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [activeTab, onAddMeetingPhotos]);

  const handleDeleteMeetingPhoto = photo => {
    if (!photo || (typeof onDeletePhoto !== 'function' && typeof onDeleteMeetingPhoto !== 'function')) return;
    onRequestConfirm('일정 사진 삭제', '이 일정 사진을 삭제하시겠습니까?', async () => {
      setIsSavingMeetingPhotos(true);
      try {
        const deletionMeta = {
          source: 'meeting',
          uploadSource: photo.uploadSource || (photo.source === 'chat-tag' ? 'chat' : 'meeting'),
          imageUrl: photo.imageUrl || photo.thumbUrl || '',
          thumbUrl: photo.thumbUrl || photo.imageUrl || '',
          sourceMessageId: photo.sourceMessageId,
          sourceImageIndex: photo.sourceImageIndex,
          messageId: photo.messageId || photo.sourceMessageId,
          imageIndex: Number.isInteger(photo.imageIndex) ? photo.imageIndex : photo.sourceImageIndex,
          meetingDate: dateStr,
          photoId: photo.id,
          assetKey: photo.assetKey || photo.mediaKey || ''
        };
        const ok = typeof onDeletePhoto === 'function'
          ? await Promise.resolve(onDeletePhoto(deletionMeta))
          : await Promise.resolve(onDeleteMeetingPhoto(dateStr, photo.id, deletionMeta.imageUrl));
        if (ok === false) showToast('사진 삭제 실패', 'error');
      } finally {
        setIsSavingMeetingPhotos(false);
      }
    });
  };

  // 자비부담(isSelfPay) expenses are personal, not shared -- they keep their price recorded on
  // the line item for visibility but never enter this shared total (nor 공금, nor anyone else's
  // settlement split; see calculateSettlementBalance in app-domain-helpers.js and the
  // 정산카드 editor's monthlyExpenses filter in ui-event-modals.js).
  const expenseTotal = expenses.reduce((sum, e) => sum + (e?.isSelfPay ? 0 : (Number(e?.amount) || 0)), 0);
  const expenseCategories = getExpenseCategories(calendar) || [];
  const getExpenseUrl = expense => {
    try {
      const labelStr = typeof expense?.label === 'string' ? expense.label : String(expense?.label || '');
      return sanitizeText(expense?.url || extractFirstUrl(labelStr) || '', 220);
    } catch (_) {
      return '';
    }
  };
  const getExpenseLabel = expense => {
    try {
      const raw = typeof expense?.label === 'string' ? expense.label : String(expense?.label || '');
      const url = getExpenseUrl(expense);
      return url ? raw.replace(url, '').trim() : raw;
    } catch (_) {
      return String(expense?.label || '');
    }
  };
  const handleExpenseItemClick = expense => {
    if (isSavingExpense) return;
    const eid = expense.id;
    const label = getExpenseLabel(expense);
    const isIncome = Number(expense.amount) < 0;
    const amountStr = Math.abs(Number(expense.amount)).toLocaleString();
    const cat = expense.categoryId || 'etc';
    const payer = expense.payerId || '';
    const selfPay = !!expense.isSelfPay;
    setEditingExpenseId(eid);
    setExpenseLabelInput(label);
    setExpenseIsIncome(isIncome);
    setExpenseAmountInput(amountStr);
    setExpenseCategoryInput(cat);
    setExpensePayerInput(payer);
    setExpenseIsSelfPay(selfPay);
    setHasInteracted(false);
    snapshotFormBaseline({
      ...formBaselineRef.current,
      editingExpenseId: eid,
      expenseLabelInput: label,
      expenseAmountInput: amountStr,
      expenseIsIncome: isIncome,
      expenseCategoryInput: cat,
      expensePayerInput: payer,
      expenseIsSelfPay: selfPay
    });
    requestAnimationFrame(() => {
      const field = expenseLabelFieldRef.current;
      if (!field) return;
      field.scrollIntoView({ behavior: 'smooth', block: 'center' });
      field.querySelector('input')?.focus({ preventScroll: true });
    });
  };
  const handleSaveExpenseClick = async () => {
    if (!onSaveExpense) return;
    const label = expenseLabelInput.trim();
    if (!label) {
      showToast('내역을 입력해 주세요.', 'error');
      return;
    }
    const cleanAmount = Number(expenseAmountInput.replace(/[^0-9]/g, ''));
    if (!cleanAmount) {
      showToast('금액을 입력해 주세요.', 'error');
      return;
    }
    setIsSavingExpense(true);
    try {
      const finalAmount = expenseIsIncome ? -cleanAmount : cleanAmount;
      const ok = await onSaveExpense(dateStr, {
        id: editingExpenseId || undefined,
        label,
        amount: finalAmount,
        categoryId: expenseCategoryInput,
        payerId: expenseIsIncome ? '' : expensePayerInput,
        isSelfPay: expenseIsIncome ? false : expenseIsSelfPay
      });
      if (ok !== false) {
        showToast(editingExpenseId ? '정산 내역이 수정되었습니다.' : '정산 내역이 추가되었습니다.', 'success');
        setEditingExpenseId(null);
        setExpenseLabelInput('');
        setExpenseAmountInput('');
        setExpenseIsIncome(false);
        setExpensePayerInput('');
        setExpenseIsSelfPay(false);
        setHasInteracted(false);
        const resetExpCat = getExpenseCategories(calendar)[0]?.id || 'etc';
        setExpenseCategoryInput(resetExpCat);
        snapshotFormBaseline({
          ...formBaselineRef.current,
          editingExpenseId: null,
          expenseLabelInput: '',
          expenseAmountInput: '',
          expenseIsIncome: false,
          expenseCategoryInput: resetExpCat,
          expensePayerInput: '',
          expenseIsSelfPay: false
        });
      }
    } catch (err) {
      console.error('Expense save failed:', err);
      showToast('정산 내역 저장에 실패했습니다. 연결되면 다시 시도해 주세요.', 'error', 6000);
    } finally {
      setIsSavingExpense(false);
    }
  };
  const handleDeleteExpenseClick = (e, expenseId) => {
    e.stopPropagation();
    if (!onDeleteExpense) return;
    const target = expenses.find(exp => exp.id === expenseId);
    const expenseSnapshot = JSON.parse(JSON.stringify(target || null));
    const rawLabel = String(target?.label || target?.url || '').trim();
    const shortLabel = rawLabel.length > 24 ? rawLabel.slice(0, 24) + '…' : rawLabel;
    const kind = Number(target?.amount) < 0 ? '수입' : '지출';
    const message = shortLabel
      ? `"${shortLabel}" ${kind} 내역을 삭제하시겠습니까?`
      : `이 ${kind} 내역을 삭제하시겠습니까?`;
    // Confirm once only — parent handler must not show another dialog.
    onRequestConfirm('정산 내역 삭제', message, async () => {
      setIsSavingExpense(true);
      try {
        const ok = await onDeleteExpense(dateStr, expenseId);
        if (ok === false) {
          showToast('삭제에 실패했습니다.', 'error');
          return;
        }
        showToast('정산 내역이 삭제되었습니다.', 'delete', 5000, async () => {
          setIsSavingExpense(true);
          try {
            const restored = await onSaveExpense(dateStr, {
              id: expenseSnapshot?.id || expenseId,
              label: expenseSnapshot?.label || expenseSnapshot?.url || '',
              amount: Number(expenseSnapshot?.amount) || 0,
              categoryId: expenseSnapshot?.categoryId || expenseCategoryInput,
              payerId: expenseSnapshot?.payerId || '',
              isSelfPay: !!expenseSnapshot?.isSelfPay
            });
            if (restored !== false) showToast('정산 삭제를 되돌렸습니다.', 'success', 3000);
            else showToast('정산 복원 실패', 'error', 4000);
          } catch (restoreErr) {
            console.error('Expense restore failed:', restoreErr);
            showToast('정산 복원 실패', 'error', 4000);
          } finally {
            setIsSavingExpense(false);
          }
        });
        if (editingExpenseId === expenseId) {
          setEditingExpenseId(null);
          setExpenseLabelInput('');
          setExpenseAmountInput('');
        }
      } catch (err) {
        console.error('Expense delete failed:', err);
        showToast('삭제에 실패했습니다. 연결되면 다시 시도해 주세요.', 'error', 6000);
      } finally {
        setIsSavingExpense(false);
      }
    });
  };
    const moveExpense = async (sourceId, targetId) => {
    if (!onReorderExpenses || !sourceId || !targetId || sourceId === targetId) return false;
    const sourceIdx = expenses.findIndex(e => e.id === sourceId);
    const targetIdx = expenses.findIndex(e => e.id === targetId);
    if (sourceIdx < 0 || targetIdx < 0) return false;
    const nextExpenses = [...expenses];
    const [moved] = nextExpenses.splice(sourceIdx, 1);
    nextExpenses.splice(targetIdx, 0, moved);
    const orderedIds = nextExpenses.map(exp => exp.id);
    const result = await Promise.resolve(onReorderExpenses(dateStr, orderedIds));
    return result !== false;
  };

  const expensesOrderRef = React.useRef(expenses);
  expensesOrderRef.current = expenses;
  const expenseDragHandlersRef = React.useRef({});

  // Safety net for the document-level pointermove/up/cancel listeners the settlement drag-reorder
  // below attaches directly (not via useEffect, since they need to live exactly as long as one
  // drag gesture) -- normally finish()/reset() (fired by pointerup/pointercancel) remove them, but
  // if DateModal closes mid-drag (an interrupted gesture that never delivers either event, or a
  // parent force-closing the modal), those listeners would otherwise never be removed and would
  // keep referencing this now-unmounted instance's closures for the rest of the page's life.
  React.useEffect(() => () => {
    const ref = expensePointerSortRef.current;
    const handlers = expenseDragHandlersRef.current;
    if (ref && ref.active && handlers) {
      document.removeEventListener('pointermove', handlers.onMove);
      document.removeEventListener('pointerup', handlers.onUp);
      document.removeEventListener('pointercancel', handlers.onCancel);
    }
  }, []);

  expenseDragHandlersRef.current.update = e => {
    const ref = expensePointerSortRef.current;
    if (!ref.active) return;
    if (e.cancelable) e.preventDefault();
    const deltaY = e.clientY - ref.startY;
    const row = document.querySelector(`.expense-sortable-row[data-expense-id="${ref.sourceId}"]`);
    if (row) {
      row.style.transform = `translateY(${deltaY}px) scale(1.02)`;
      row.style.pointerEvents = 'none';
    }
    // elementFromPoint 대신 각 행의 세로 영역으로 타겟 판정
    const rows = Array.from(document.querySelectorAll('.date-modal-settlement-list .expense-sortable-row'));
    let nextTargetId = '';
    for (const r of rows) {
      const id = r.getAttribute('data-expense-id');
      if (!id || id === ref.sourceId) continue;
      const rect = r.getBoundingClientRect();
      if (e.clientY >= rect.top && e.clientY <= rect.bottom) {
        nextTargetId = id;
        break;
      }
    }
    if (nextTargetId !== ref.targetId) {
      if (ref.targetId) {
        const prev = document.querySelector(`.expense-sortable-row[data-expense-id="${ref.targetId}"]`);
        if (prev) prev.style.borderColor = 'var(--border-subtle)';
      }
      ref.targetId = nextTargetId;
      if (nextTargetId) {
        const next = document.querySelector(`.expense-sortable-row[data-expense-id="${nextTargetId}"]`);
        if (next) next.style.borderColor = 'var(--accent-primary)';
      }
      setDragOverExpenseId(nextTargetId || '');
    }
  };

  expenseDragHandlersRef.current.finish = async () => {
    const ref = expensePointerSortRef.current;
    if (!ref.active) return;
    const sourceId = ref.sourceId;
    const targetId = ref.targetId;
    document.removeEventListener('pointermove', expenseDragHandlersRef.current.onMove);
    document.removeEventListener('pointerup', expenseDragHandlersRef.current.onUp);
    document.removeEventListener('pointercancel', expenseDragHandlersRef.current.onCancel);
    ref.active = false;
    const row = document.querySelector(`.expense-sortable-row[data-expense-id="${sourceId}"]`);
    if (row) {
      row.style.zIndex = '';
      row.style.boxShadow = '';
      row.style.transform = '';
      row.style.transition = '';
      row.style.pointerEvents = '';
      row.style.opacity = '';
    }
    if (targetId) {
      const targetRow = document.querySelector(`.expense-sortable-row[data-expense-id="${targetId}"]`);
      if (targetRow) targetRow.style.borderColor = 'var(--border-subtle)';
    }
    setDraggingExpenseId('');
    setDragOverExpenseId('');
    expensePointerSortRef.current = { sourceId: '', targetId: '', startX: 0, startY: 0, active: false };
    if (sourceId && targetId && sourceId !== targetId) {
      setIsSavingExpense(true);
      try {
        const ok = await moveExpense(sourceId, targetId);
        if (ok === false) showToast('순서 변경에 실패했습니다.', 'error');
        else showToast('순서가 변경되었습니다.', 'success');
      } finally {
        setIsSavingExpense(false);
      }
    }
  };

  expenseDragHandlersRef.current.reset = () => {
    const ref = expensePointerSortRef.current;
    document.removeEventListener('pointermove', expenseDragHandlersRef.current.onMove);
    document.removeEventListener('pointerup', expenseDragHandlersRef.current.onUp);
    document.removeEventListener('pointercancel', expenseDragHandlersRef.current.onCancel);
    const sourceId = ref.sourceId;
    const targetId = ref.targetId;
    ref.active = false;
    const row = document.querySelector(`.expense-sortable-row[data-expense-id="${sourceId}"]`);
    if (row) {
      row.style.zIndex = '';
      row.style.boxShadow = '';
      row.style.transform = '';
      row.style.transition = '';
      row.style.pointerEvents = '';
      row.style.opacity = '';
    }
    if (targetId) {
      const targetRow = document.querySelector(`.expense-sortable-row[data-expense-id="${targetId}"]`);
      if (targetRow) targetRow.style.borderColor = 'var(--border-subtle)';
    }
    setDraggingExpenseId('');
    setDragOverExpenseId('');
    expensePointerSortRef.current = { sourceId: '', targetId: '', startX: 0, startY: 0, active: false };
  };

  expenseDragHandlersRef.current.onMove = e => expenseDragHandlersRef.current.update(e);
  expenseDragHandlersRef.current.onUp = e => expenseDragHandlersRef.current.finish(e);
  expenseDragHandlersRef.current.onCancel = () => expenseDragHandlersRef.current.reset();

  const beginExpensePointerSort = (e, expenseId) => {
    if (isSavingExpense || expenses.length <= 1) return;
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch (_) {}
    const row = e.currentTarget.closest('.expense-sortable-row');
    if (!row) return;
    row.style.zIndex = '1000';
    row.style.boxShadow = '0 8px 20px rgba(0,0,0,0.12)';
    row.style.transform = 'scale(1.02)';
    row.style.transition = 'none';
    row.style.pointerEvents = 'none';
    row.style.opacity = '0.92';
    expensePointerSortRef.current = {
      sourceId: expenseId, targetId: '', startX: e.clientX, startY: e.clientY, active: true, pointerId: e.pointerId
    };
    setDraggingExpenseId(expenseId);
    setDragOverExpenseId('');
    document.addEventListener('pointermove', expenseDragHandlersRef.current.onMove, { passive: false });
    document.addEventListener('pointerup', expenseDragHandlersRef.current.onUp);
    document.addEventListener('pointercancel', expenseDragHandlersRef.current.onCancel);
  };
  const resetExpensePointerSort = () => expenseDragHandlersRef.current.reset();

  const moveAttendee = async (sourceParticipantId, targetParticipantId) => {
    if (!onReorderAvailability || !sourceParticipantId || !targetParticipantId || sourceParticipantId === targetParticipantId) return false;
    const sourceIdx = dateEntries.findIndex(en => en.participantId === sourceParticipantId);
    const targetIdx = dateEntries.findIndex(en => en.participantId === targetParticipantId);
    if (sourceIdx < 0 || targetIdx < 0) return false;
    const nextEntries = [...dateEntries];
    const [moved] = nextEntries.splice(sourceIdx, 1);
    nextEntries.splice(targetIdx, 0, moved);
    const orderedParticipantIds = nextEntries.map(en => en.participantId);
    const result = await Promise.resolve(onReorderAvailability(dateStr, orderedParticipantIds));
    return result !== false;
  };

  const attendanceDragHandlersRef = React.useRef({});

  // Same interrupted-gesture safety net as the expense pointer-sort cleanup above -- if DateModal
  // closes mid-drag, finish()/reset() (fired by pointerup/pointercancel) never runs, so the
  // document-level listeners must be torn down here instead of being left attached forever.
  React.useEffect(() => () => {
    const ref = attendancePointerSortRef.current;
    const handlers = attendanceDragHandlersRef.current;
    if (ref && ref.active && handlers) {
      document.removeEventListener('pointermove', handlers.onMove);
      document.removeEventListener('pointerup', handlers.onUp);
      document.removeEventListener('pointercancel', handlers.onCancel);
    }
  }, []);

  attendanceDragHandlersRef.current.update = e => {
    const ref = attendancePointerSortRef.current;
    if (!ref.active) return;
    if (e.cancelable) e.preventDefault();
    const deltaY = e.clientY - ref.startY;
    const row = document.querySelector(`.attendance-sortable-row[data-participant-id="${ref.sourceId}"]`);
    if (row) {
      row.style.transform = `translateY(${deltaY}px) scale(1.02)`;
      row.style.pointerEvents = 'none';
    }
    const rows = Array.from(document.querySelectorAll('.date-modal-attendance-list .attendance-sortable-row'));
    let nextTargetId = '';
    for (const r of rows) {
      const id = r.getAttribute('data-participant-id');
      if (!id || id === ref.sourceId) continue;
      const rect = r.getBoundingClientRect();
      if (e.clientY >= rect.top && e.clientY <= rect.bottom) {
        nextTargetId = id;
        break;
      }
    }
    if (nextTargetId !== ref.targetId) {
      if (ref.targetId) {
        const prev = document.querySelector(`.attendance-sortable-row[data-participant-id="${ref.targetId}"]`);
        if (prev) prev.style.borderColor = 'var(--border-subtle)';
      }
      ref.targetId = nextTargetId;
      if (nextTargetId) {
        const next = document.querySelector(`.attendance-sortable-row[data-participant-id="${nextTargetId}"]`);
        if (next) next.style.borderColor = 'var(--accent-primary)';
      }
      setDragOverParticipantId(nextTargetId || '');
    }
  };

  attendanceDragHandlersRef.current.finish = async () => {
    const ref = attendancePointerSortRef.current;
    if (!ref.active) return;
    const sourceId = ref.sourceId;
    const targetId = ref.targetId;
    document.removeEventListener('pointermove', attendanceDragHandlersRef.current.onMove);
    document.removeEventListener('pointerup', attendanceDragHandlersRef.current.onUp);
    document.removeEventListener('pointercancel', attendanceDragHandlersRef.current.onCancel);
    ref.active = false;
    const row = document.querySelector(`.attendance-sortable-row[data-participant-id="${sourceId}"]`);
    if (row) {
      row.style.zIndex = '';
      row.style.boxShadow = '';
      row.style.transform = '';
      row.style.transition = '';
      row.style.pointerEvents = '';
      row.style.opacity = '';
    }
    if (targetId) {
      const targetRow = document.querySelector(`.attendance-sortable-row[data-participant-id="${targetId}"]`);
      if (targetRow) targetRow.style.borderColor = 'var(--border-subtle)';
    }
    setDraggingParticipantId('');
    setDragOverParticipantId('');
    attendancePointerSortRef.current = { sourceId: '', targetId: '', startX: 0, startY: 0, active: false };
    if (sourceId && targetId && sourceId !== targetId) {
      setIsReorderingAttendance(true);
      try {
        const ok = await moveAttendee(sourceId, targetId);
        if (ok === false) showToast('순서 변경에 실패했습니다.', 'error');
        else showToast('순서가 변경되었습니다.', 'success');
      } finally {
        setIsReorderingAttendance(false);
      }
    }
  };

  attendanceDragHandlersRef.current.reset = () => {
    const ref = attendancePointerSortRef.current;
    document.removeEventListener('pointermove', attendanceDragHandlersRef.current.onMove);
    document.removeEventListener('pointerup', attendanceDragHandlersRef.current.onUp);
    document.removeEventListener('pointercancel', attendanceDragHandlersRef.current.onCancel);
    const sourceId = ref.sourceId;
    const targetId = ref.targetId;
    ref.active = false;
    const row = document.querySelector(`.attendance-sortable-row[data-participant-id="${sourceId}"]`);
    if (row) {
      row.style.zIndex = '';
      row.style.boxShadow = '';
      row.style.transform = '';
      row.style.transition = '';
      row.style.pointerEvents = '';
      row.style.opacity = '';
    }
    if (targetId) {
      const targetRow = document.querySelector(`.attendance-sortable-row[data-participant-id="${targetId}"]`);
      if (targetRow) targetRow.style.borderColor = 'var(--border-subtle)';
    }
    setDraggingParticipantId('');
    setDragOverParticipantId('');
    attendancePointerSortRef.current = { sourceId: '', targetId: '', startX: 0, startY: 0, active: false };
  };

  attendanceDragHandlersRef.current.onMove = e => attendanceDragHandlersRef.current.update(e);
  attendanceDragHandlersRef.current.onUp = e => attendanceDragHandlersRef.current.finish(e);
  attendanceDragHandlersRef.current.onCancel = () => attendanceDragHandlersRef.current.reset();

  const beginAttendancePointerSort = (e, participantId) => {
    if (isReorderingAttendance || dateEntries.length <= 1) return;
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch (_) {}
    const row = e.currentTarget.closest('.attendance-sortable-row');
    if (!row) return;
    row.style.zIndex = '1000';
    row.style.boxShadow = '0 8px 20px rgba(0,0,0,0.12)';
    row.style.transform = 'scale(1.02)';
    row.style.transition = 'none';
    row.style.pointerEvents = 'none';
    row.style.opacity = '0.92';
    attendancePointerSortRef.current = {
      sourceId: participantId, targetId: '', startX: e.clientX, startY: e.clientY, active: true, pointerId: e.pointerId
    };
    setDraggingParticipantId(participantId);
    setDragOverParticipantId('');
    document.addEventListener('pointermove', attendanceDragHandlersRef.current.onMove, { passive: false });
    document.addEventListener('pointerup', attendanceDragHandlersRef.current.onUp);
    document.addEventListener('pointercancel', attendanceDragHandlersRef.current.onCancel);
  };

  // Close-confirm only when form differs from last committed baseline.
  // Baseline: mount (real defaults), edit-load, successful save.
  const formBaselineRef = React.useRef(null);
  const placeKeyOf = (sp) => {
    if (!sp) return '';
    return String(sp.id || '') + '|' + String(sp.name || '') + '|' + String(sp.lat || '') + '|' + String(sp.lng || '');
  };
  const snapshotFormBaseline = React.useCallback((overrides = {}) => {
    formBaselineRef.current = {
      participantId: '',
      note: '',
      editingLinkedPlaceId: null,
      placeMemo: '',
      placeAlias: '',
      placeQuery: '',
      selectedPlaceKey: '',
      placeCategoryId: getPlaceCategories(calendar)[0]?.id || 'etc',
      placeVisitStatus: 'visited',
      editingExpenseId: null,
      expenseLabelInput: '',
      expenseAmountInput: '',
      expenseIsIncome: false,
      expenseCategoryInput: getExpenseCategories(calendar)[0]?.id || 'etc',
      ...overrides
    };
  }, [calendar]);
  React.useLayoutEffect(() => {
    snapshotFormBaseline({
      participantId: '',
      note: '',
      editingLinkedPlaceId: null,
      placeMemo: '',
      placeAlias: '',
      placeQuery: '',
      selectedPlaceKey: '',
      placeCategoryId: placeCategoryId || getPlaceCategories(calendar)[0]?.id || 'etc',
      placeVisitStatus: placeVisitStatus || 'visited',
      editingExpenseId: null,
      expenseLabelInput: '',
      expenseAmountInput: '',
      expenseIsIncome: false,
      expenseCategoryInput: expenseCategoryInput || getExpenseCategories(calendar)[0]?.id || 'etc'
    });
    // mount only
  }, []);
  const [hasInteracted, setHasInteracted] = React.useState(false);
  const markDirty = React.useCallback(() => setHasInteracted(true), []);
  const requestClose = () => {
    if (isSubmitting) return;
    const b = formBaselineRef.current;
    if (!b) {
      onClose();
      return;
    }
    const dirty = (
      String(participantId || '') !== String(b.participantId || '') ||
      String(note || '') !== String(b.note || '') ||
      String(editingLinkedPlaceId || '') !== String(b.editingLinkedPlaceId || '') ||
      String(placeMemo || '') !== String(b.placeMemo || '') ||
      String(placeAlias || '') !== String(b.placeAlias || '') ||
      String(placeQuery || '') !== String(b.placeQuery || '') ||
      placeKeyOf(selectedPlace) !== String(b.selectedPlaceKey || '') ||
      String(placeCategoryId || '') !== String(b.placeCategoryId || '') ||
      String(placeVisitStatus || 'visited') !== String(b.placeVisitStatus || 'visited') ||
      String(editingExpenseId || '') !== String(b.editingExpenseId || '') ||
      String(expenseLabelInput || '') !== String(b.expenseLabelInput || '') ||
      String(expenseAmountInput || '') !== String(b.expenseAmountInput || '') ||
      !!expenseIsIncome !== !!b.expenseIsIncome ||
      String(expenseCategoryInput || '') !== String(b.expenseCategoryInput || '') ||
      String(expensePayerInput || '') !== String(b.expensePayerInput || '')
    );
    if (dirty && typeof onRequestConfirm === 'function') {
      onRequestConfirm('닫기 확인', '저장하지 않은 내용이 있습니다. 닫으시겠습니까?', () => onClose());
      return;
    }
    onClose();
  };

  const portalContent = /*#__PURE__*/React.createElement("div", {
    className: "modal-overlay",
    onClick: e => {
      if (e.target !== e.currentTarget) return;
      requestClose();
    },
    style: { zIndex: 11000 }
  }, /*#__PURE__*/React.createElement(ResizableModalContainer, {
    className: "modal-container",
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal-header",
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      padding: '14px 16px 12px 16px',
      borderBottom: '1px solid var(--border-subtle)',
      backgroundColor: 'var(--bg-card)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'baseline',
      gap: '8px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '1.25rem',
      fontWeight: 900,
      color: 'var(--text-main)'
    }
  }, titleParts.year, /*#__PURE__*/React.createElement("span", {
    style: {
      color: isConfirmed ? '#7C3AED' : (isAllAvailable ? 'var(--status-green)' : 'var(--text-muted)'),
      marginLeft: '4px'
    }
  }, titleParts.rest)), holidayLabelText && /*#__PURE__*/React.createElement("span", {
    className: "holiday-tag",
    style: {
      fontSize: 'var(--font-size-sm)',
      fontWeight: 'bold',
      padding: '3px 8px',
      borderRadius: 'var(--radius-sm)',
      backgroundColor: '#FEF2F2',
      color: '#EF4444',
      border: '1px solid #FEE2E2',
      verticalAlign: 'middle'
    }
  }, holidayLabelText)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    }
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => {
      if (!isSubmitting) requestClose();
    },
    style: {
      background: 'none',
      border: 'none',
      color: 'var(--text-muted)',
      fontSize: '1.25rem',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      padding: '2px 4px'
    },
    title: "닫기"
  }, "✕"))), UnderlineTabs && /*#__PURE__*/React.createElement(UnderlineTabs, {
    ariaLabel: "일정 탭",
    value: activeTab,
    onChange: (id) => setActiveTab(id),
    style: { backgroundColor: 'transparent', borderBottom: 'none', width: '100%' },
    options: [
      { value: 'participant', label: /*#__PURE__*/React.createElement(React.Fragment, null, "참여자", /*#__PURE__*/React.createElement(SectionCountBadge, { count: dateEntries.length })) },
      { value: 'meeting', label: /*#__PURE__*/React.createElement(React.Fragment, null, "장소", /*#__PURE__*/React.createElement(SectionCountBadge, { count: registeredPlaces.length })) },
      { value: 'settlement', label: /*#__PURE__*/React.createElement(React.Fragment, null, "정산", /*#__PURE__*/React.createElement(SectionCountBadge, { count: expenses.length })) },
      { value: 'photo', label: /*#__PURE__*/React.createElement(React.Fragment, null, "사진", /*#__PURE__*/React.createElement(SectionCountBadge, { count: visibleMeetingPhotos.length })) }
    ]
  })), /*#__PURE__*/React.createElement("form", {
    onSubmit: e => {
      e.preventDefault();
      if (activeTab === 'participant') handleSubmit(e);
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal-body"
  },

    /* TAB CONTENTS */

    /* Tab 1 Content: 참여자 */
    activeTab === 'participant' && /*#__PURE__*/React.createElement(React.Fragment, null,
      /* Anniversaries banner list inside DateModal body */
      dateAnns.length > 0 && /*#__PURE__*/React.createElement("div", {
        style: { display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '14px' }
      }, dateAnns.map((ann, aIdx) => {
        const displayColor = getAnniversaryDisplayColor(ann, calendar);
        const bannerKey = ann.id || aIdx;
        const isExpanded = expandedAnnBannerIds.has(bannerKey);
        const hasDetail = !!(ann.place || ann.description || getAnnBannerDateDisplay(ann));
        const photos = Array.isArray(ann.photos) ? ann.photos : [];
        const thumbSize = isExpanded ? 64 : 22;
        return /*#__PURE__*/React.createElement("div", {
          key: bannerKey,
          style: {
            display: 'flex', flexDirection: 'column', gap: '8px',
            padding: '10px 14px',
            backgroundColor: `${displayColor}12`,
            color: displayColor,
            border: `1px solid ${displayColor}30`,
            borderLeft: `4px solid ${displayColor}`,
            borderRadius: 'var(--radius-md)',
            fontSize: 'var(--font-size-md)',
            fontWeight: 'bold'
          }
        },
          /*#__PURE__*/React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '8px' } },
            renderAnniversaryIcon(ann, 14), " ",
            /*#__PURE__*/React.createElement("span", { style: { flex: 1, minWidth: 0 } }, ann.title),
            photos.length > 0 && MediaThumb && /*#__PURE__*/React.createElement(MediaThumb, {
              src: photos[0].thumbUrl || photos[0].url,
              fallbackSrc: photos[0].url || photos[0].thumbUrl,
              alt: "기념일 사진",
              onClick: e => {
                e.stopPropagation();
                if (typeof setActiveLightbox === 'function') {
                  setActiveLightbox({
                    urls: photos.map(p => p.url || p.thumbUrl),
                    index: 0,
                    meta: photos.map(() => ({}))
                  });
                }
              },
              style: {
                width: `${thumbSize}px`, height: `${thumbSize}px`, borderRadius: '6px', objectFit: 'cover',
                cursor: 'pointer', flexShrink: 0, transition: 'width 150ms ease, height 150ms ease'
              }
            }),
            hasDetail && /*#__PURE__*/React.createElement("button", {
              type: "button",
              onClick: e => { e.stopPropagation(); toggleAnnBannerExpanded(bannerKey); },
              "aria-label": isExpanded ? "기념일 상세 접기" : "기념일 상세 펼치기",
              style: { background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: '2px', display: 'flex', alignItems: 'center', flexShrink: 0 }
            }, /*#__PURE__*/React.createElement("svg", {
              width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor",
              strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round"
            }, isExpanded
              ? /*#__PURE__*/React.createElement("path", { d: "M18 15l-6-6-6 6" })
              : /*#__PURE__*/React.createElement("path", { d: "M6 9l6 6 6-6" })
            ))
          ),
          isExpanded && /*#__PURE__*/React.createElement("div", {
            style: { display: 'flex', flexDirection: 'column', gap: '4px', fontSize: 'var(--font-size-sm)', fontWeight: 500 }
          },
            getAnnBannerDateDisplay(ann) && /*#__PURE__*/React.createElement("div", { style: { display: 'inline-flex', alignItems: 'center', gap: '4px' } },
              CalendarIcon && /*#__PURE__*/React.createElement(CalendarIcon, { size: 14 }),
              /*#__PURE__*/React.createElement("span", null, getAnnBannerDateDisplay(ann))
            ),
            ann.place && (() => {
              const mapUrl = getAnnBannerKakaoMapLinkUrl(ann.place);
              const label = `[${ann.place.alias || ann.place.name}] ${getDisplayPlaceAddress(ann.place) || ''}`.trim();
              return /*#__PURE__*/React.createElement("div", { style: { display: 'inline-flex', alignItems: 'center', gap: '4px' } },
                MapPinIcon && /*#__PURE__*/React.createElement(MapPinIcon, { size: 14 }),
                mapUrl
                  ? /*#__PURE__*/React.createElement("a", {
                      href: mapUrl, target: "_blank", rel: "noreferrer",
                      onClick: e => e.stopPropagation(),
                      style: { color: 'inherit', textDecoration: 'underline' }
                    }, label)
                  : /*#__PURE__*/React.createElement("span", null, label)
              );
            })(),
            ann.description && /*#__PURE__*/React.createElement("div", { style: { color: 'var(--text-main)' } },
              renderTextWithUrlBadge(ann.description)
            )
          )
        );
      })),

      !adminMode && /*#__PURE__*/React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: '10px' } },
        /* Participant Picker Button */
        /*#__PURE__*/React.createElement("div", null,
          /*#__PURE__*/React.createElement("label", {
            style: { display: 'block', fontSize: 'var(--font-size-md)', fontWeight: 700, marginBottom: '6px', color: 'var(--text-muted)' }
          }, "참여자 선택"),
          /*#__PURE__*/React.createElement("button", {
            type: "button",
            className: "form-select",
            style: {
              width: '100%',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              textAlign: 'left',
              background: 'var(--bg-card)',
              cursor: isSubmitting ? 'default' : 'pointer'
            },
            disabled: isSubmitting,
            onClick: () => {
              if (!isSubmitting) { setIsSheetOpen(true); }
            }
          },
            /*#__PURE__*/React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, overflow: 'hidden' } },
              participantId && /*#__PURE__*/React.createElement("span", {
                className: "form-select-color-indicator",
                style: { backgroundColor: selectedPartColor }
              }),
              /*#__PURE__*/React.createElement("span", {
                style: {
                  fontWeight: 700,
                  color: participantId ? 'var(--text-main)' : 'var(--text-muted)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }
              }, participantId ? selectedPartName : '참여할 이름을 골라주세요')
            ),
            /*#__PURE__*/React.createElement("svg", {
              xmlns: "http://www.w3.org/2000/svg",
              width: "18",
              height: "18",
              viewBox: "0 0 24 24",
              fill: "none",
              stroke: "currentColor",
              strokeWidth: "2",
              strokeLinecap: "round",
              strokeLinejoin: "round",
              className: "form-select-chevron",
              "aria-hidden": "true"
            }, /*#__PURE__*/React.createElement("path", { d: "M6 9l6 6l6 -6" }))
          )
        ),
        /* Note Input Field */
        /*#__PURE__*/React.createElement("div", null,
          /*#__PURE__*/React.createElement("label", {
            style: { display: 'block', fontSize: 'var(--font-size-md)', fontWeight: 700, marginBottom: '6px', color: 'var(--text-muted)' }
          }, "메모 입력 (선택)"),
          /*#__PURE__*/React.createElement("div", { className: "date-modal-field-with-actions", style: { display: 'flex', gap: '8px' } },
            /*#__PURE__*/React.createElement("input", {
              ref: noteInputRef,
              type: "text",
              className: "form-input",
              style: { flex: 1 },
              placeholder: "일정 메모를 남길 수 있습니다 (최대 500자)",
              maxLength: 500,
              value: note,
              disabled: isSubmitting,
              onChange: e => { markDirty(); setNote(e.target.value); }
            }),
            /*#__PURE__*/React.createElement("div", { className: "date-modal-field-actions" },
              /*#__PURE__*/React.createElement(FormAddEditActionButtons, {
                isEditing: !!participantId && dateEntries.some(en => en.participantId === participantId),
                isSaving: isSubmitting,
                onCancel: () => {
                  setParticipantId('');
                  setNote('');
                  setHasInteracted(false);
                  snapshotFormBaseline({ ...formBaselineRef.current, participantId: '', note: '' });
                },
                onSubmit: handleSubmit
              })
            )
          )
        )
      ),

      /* Attendees list */
      dateEntries.length > 0 && /*#__PURE__*/React.createElement("div", {
        style: { marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }
      },
        /*#__PURE__*/React.createElement("label", {
          style: { fontSize: 'var(--font-size-md)', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '2px' }
        }, `참석 명단 (${dateEntries.length}명 가능)`),
        /* List */
        /*#__PURE__*/React.createElement(ResizableListSection, {
          initialHeight: 'auto',
          minHeight: 72,
          maxHeight: 500,
          listClassName: "date-modal-attendance-list",
          listStyle: {
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            padding: '8px',
            backgroundColor: 'var(--bg-primary)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md) var(--radius-md) 0 0'
          },
          handleTitle: '드래그하여 참석자 목록 높이 조절',
          handleAriaLabel: '참석자 목록 높이 조절'
        }, dateEntries.map((entry, entryIndex) => {
          const part = activeParticipants.find(p => p.id === entry.participantId);
          if (!part) return null;
          const canReorder = !adminMode && dateEntries.length > 1;
          // The reserved right-hand gap only needs to clear the absolutely-positioned drag/delete
          // icons near the row's top-right corner, not the whole card height -- letting the note
          // below reclaim most of that width (see its own negative marginRight) keeps its usable
          // width close to the row's actual left inset instead of wrapping early for no reason.
          const attendanceRightReserve = adminMode ? 12 : (canReorder ? 78 : 44);
          return /*#__PURE__*/React.createElement("div", {
            key: entry.id || `${entry.participantId || 'participant'}_${entryIndex}`,
            "data-participant-id": entry.participantId,
            className: `date-modal-attendance-row attendance-sortable-row poll-sortable-row${canReorder ? ' date-modal-attendance-row--reorderable' : ''}${draggingParticipantId === entry.participantId ? ' is-dragging' : ''}${dragOverParticipantId === entry.participantId ? ' is-drop-target' : ''}`,
            style: {
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'stretch',
              gap: '4px',
              padding: '10px 12px',
              paddingRight: `${attendanceRightReserve}px`,
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              position: 'relative',
              cursor: 'pointer'
            },
            title: '눌러서 수정 (참여자·메모 불러오기)',
            onClick: e => {
              // Let the drag handle, delete button, and any URL badge inside the note handle
              // their own clicks (they already stopPropagation, but this also covers future
              // interactive children) instead of also opening edit mode underneath them.
              if (e.target.closest('button, a, [data-stop-card-open]')) return;
              handleEditClick(entry);
            }
          },
            /*#__PURE__*/React.createElement("div", {
              className: "date-modal-attendance-row-head",
              style: { display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }
            },
              /*#__PURE__*/React.createElement("span", {
                style: { width: '8px', height: '8px', borderRadius: '50%', backgroundColor: part.color, flexShrink: 0 }
              }),
              /*#__PURE__*/React.createElement("span", {
                className: "date-modal-attendance-name",
                style: {
                  fontWeight: 800,
                  fontSize: 'var(--font-size-base)',
                  color: part.color || 'var(--text-main)',
                  minWidth: 0,
                  lineHeight: 1.35,
                  wordBreak: 'keep-all'
                }
              }, part.name)
            ),
            entry.note && /*#__PURE__*/React.createElement("div", {
              className: "date-modal-attendance-note",
              style: {
                fontSize: 'var(--font-size-md)',
                color: 'var(--text-main)',
                minWidth: 0,
                lineHeight: 1.4,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: '4px',
                paddingLeft: '16px',
                paddingRight: '0',
                // Reclaims the row's own right-inset reserve (kept for the top-right icons) so
                // this note -- which sits below the icons and never overlaps them -- can use
                // nearly the row's full width instead of wrapping early against unused space.
                // A negative margin-right alone wouldn't widen this box (this is a flex item
                // with an explicit width, not width:auto, so margins don't affect its own
                // sizing) -- extending width itself past 100% via calc() is what actually grows
                // it, landing its right edge just inside the row's own border either way.
                width: `calc(100% + ${Math.max(attendanceRightReserve - 12, 0)}px)`,
                boxSizing: 'border-box',
                wordBreak: 'break-word',
                overflowWrap: 'anywhere'
              }
            }, renderTextWithUrlBadge(entry.note)),
            !adminMode && /*#__PURE__*/React.createElement("div", {
              className: "date-modal-attendance-actions",
              style: { position: 'absolute', top: '8px', right: '8px', display: 'flex', alignItems: 'center', gap: '4px' }
            },
              canReorder && /*#__PURE__*/React.createElement("button", {
                type: "button",
                className: "poll-drag-handle",
                disabled: isReorderingAttendance,
                title: "드래그하여 순서 변경",
                style: {
                  width: '22px', height: '22px', border: '1px solid var(--border-subtle)',
                  backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-sm)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'grab', padding: 0, color: 'var(--text-muted)',
                  touchAction: 'none', userSelect: 'none'
                },
                onClick: event => { event.preventDefault(); event.stopPropagation(); },
                onPointerDown: event => beginAttendancePointerSort(event, entry.participantId)
              }, /*#__PURE__*/React.createElement(LineHeightIcon, { size: 12 })),
              /*#__PURE__*/React.createElement(ItemEditDeleteActions, {
                showEdit: false,
                onDelete: () => handleDeleteClick(entry)
              })
            )
          );
        })
      ),
      !adminMode && typeof onConfirmMeeting === 'function' && /*#__PURE__*/React.createElement("div", {
        className: "gamified-confirm-wrap",
        style: { marginTop: '4px', overflow: 'hidden', borderRadius: 'var(--radius-md)' }
      }, /*#__PURE__*/React.createElement("button", {
        type: "button",
        className: !isConfirmed && isAllAvailable ? 'btn-gamified-confirm' : 'btn-meeting-confirm-plain',
        disabled: isSubmitting,
        onClick: async e => {
          e.preventDefault();
          e.stopPropagation();
          if (isSubmitting) return;
          setIsSubmitting(true);
          try { await Promise.resolve(onConfirmMeeting(dateStr, '')); }
          finally { setIsSubmitting(false); }
        },
        style: {
          width: '100%', marginTop: '12px', padding: '12px 16px', borderRadius: 'var(--radius-md)',
          fontWeight: 800, fontSize: '0.92rem', cursor: isSubmitting ? 'wait' : 'pointer',
          ...((!isConfirmed && isAllAvailable) ? {} : isConfirmed ? {
            border: '1.5px solid rgb(239, 68, 68)',
            backgroundColor: 'rgba(239, 68, 68, 0.06)',
            color: 'rgb(239, 68, 68)'
          } : {
            border: '1.5px solid #C4B5FD', backgroundColor: 'rgba(124, 58, 237, 0.08)', color: '#7C3AED'
          })
        }
      }, (!isConfirmed && isAllAvailable)
        ? /*#__PURE__*/React.createElement(GamifiedConfirmButtonContent, { label: "모임 확정" })
        : (isConfirmed ? '모임 취소' : '모임 확정')))
    )),

    /* Tab 2 Content: 장소 */
    activeTab === 'meeting' && /*#__PURE__*/React.createElement(React.Fragment, null,
      !adminMode && /*#__PURE__*/React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: '12px' } },
        /* Search Field */
        /*#__PURE__*/React.createElement("div", null,
          /*#__PURE__*/React.createElement("label", {
            style: { display: 'block', fontSize: 'var(--font-size-md)', fontWeight: 700, marginBottom: '6px', color: 'var(--text-muted)' }
          }, "장소 검색"),
          /*#__PURE__*/React.createElement("div", { className: "date-modal-field-with-actions", style: { display: 'flex', gap: '8px' } },
            /*#__PURE__*/React.createElement("input", {
              type: "text",
              className: "form-input",
              style: { flex: 1 },
              placeholder: "지명, 도로명 주소, 또는 업체명 검색",
              value: placeQuery,
              onChange: e => setPlaceQuery(e.target.value),
              onKeyDown: e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  e.stopPropagation();
                  handlePlaceSearch(e, false);
                }
              }
            }),
            /*#__PURE__*/React.createElement("div", { className: "date-modal-field-actions" },
              /*#__PURE__*/React.createElement("button", {
                type: "button",
                className: "btn btn-poll-create btn-action btn-action-dark",
                style: { padding: '0 16px', fontWeight: 800, height: '44px', flex: 1 },
                onClick: e => { e.preventDefault(); e.stopPropagation(); handlePlaceSearch(e, false); }
              }, "검색")
            )
          )
        ),

        /* Search progress overlay */
        isPlaceLoading && /*#__PURE__*/React.createElement("div", {
          style: {
            padding: '12px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)',
            backgroundColor: 'var(--bg-primary)', display: 'flex', flexDirection: 'column', gap: '6px'
          }
        },
          /*#__PURE__*/React.createElement("div", { style: { display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-size-sm)', fontWeight: 700 } },
            /*#__PURE__*/React.createElement("span", { style: { color: 'var(--text-muted)' } },
              placeSearchStage === 'kakao' ? "카카오 로컬 정보 분석 중..." :
              placeSearchStage === 'google' ? "구글 장소 분석 중..." :
              placeSearchStage === 'nominatim' ? "지도 매핑 분석 중..." : "주변 정보 수집 중..."
            ),
            /*#__PURE__*/React.createElement("span", { style: { color: 'var(--accent-primary)' } }, `${searchProgress}% (${estRemainingSeconds}초 남음)`)
          ),
          /*#__PURE__*/React.createElement("div", { style: { width: '100%', height: '6px', backgroundColor: 'var(--border-subtle)', borderRadius: 'var(--radius-full)', overflow: 'hidden' } },
            /*#__PURE__*/React.createElement("div", { style: { width: `${searchProgress}%`, height: '100%', backgroundColor: 'var(--accent-primary)', transition: 'width 0.1s linear' } })
          )
        ),

        /* Existing calendar places matching the search text -- shown above the external
           Kakao/Google/Nominatim results so an already-registered private place (e.g. "서준네")
           is picked instead of accidentally creating a duplicate. */
        existingPlaceSuggestions.length > 0 && /*#__PURE__*/React.createElement("div", {
          style: {
            display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '180px', overflowY: 'auto',
            border: '1px solid rgba(79, 70, 229, 0.35)', borderRadius: 'var(--radius-md)', padding: '6px', backgroundColor: 'rgba(79, 70, 229, 0.06)'
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

        /* Search Results List */
        placeResults.length > 0 && /*#__PURE__*/React.createElement("div", {
          style: {
            display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '180px', overflowY: 'auto',
            border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '6px', backgroundColor: 'var(--bg-primary)'
          }
        }, placeResults.map(r => /*#__PURE__*/React.createElement("button", {
          key: r.id,
          type: "button",
          onClick: () => handleSelectResult(r),
          style: { textAlign: 'left', padding: '8px 10px', borderRadius: 'var(--radius-sm)', border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '2px' },
          className: "place-result-item"
        },
          /*#__PURE__*/React.createElement("span", { style: { fontSize: 'var(--font-size-md)', fontWeight: 700, color: 'var(--text-main)' } }, r.name),
          /*#__PURE__*/React.createElement("span", { style: { fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' } }, getDisplayPlaceAddress(r))
        ))),

        /* Selected place preview card */
        selectedPlace && /*#__PURE__*/React.createElement("div", {
          style: {
            padding: '10px 12px', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(59, 130, 246, 0.08)',
            border: '1px solid rgba(59, 130, 246, 0.2)', display: 'flex', flexDirection: 'column', gap: '4px'
          }
        },
          /*#__PURE__*/React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' } },
            /*#__PURE__*/React.createElement("span", { style: { fontSize: 'var(--font-size-base)', fontWeight: 800, color: 'var(--text-main)' } }, selectedPlace.name),
            selectedPlace.categoryLabel && /*#__PURE__*/React.createElement("span", { style: { fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' } }, selectedPlace.categoryLabel)
          ),
          selectedPlace.address && /*#__PURE__*/React.createElement("div", { style: { fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' } }, getDisplayPlaceAddress(selectedPlace)),
          selectedPlace.phone && /*#__PURE__*/React.createElement("div", { style: { fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' } }, `☎ ${selectedPlace.phone}`),
          duplicatePlace && /*#__PURE__*/React.createElement("div", {
            style: { marginTop: '6px', padding: '9px 10px', borderRadius: '8px', backgroundColor: 'rgba(245, 158, 11, 0.12)', border: '1px solid rgba(245, 158, 11, 0.35)' }
          },
            /*#__PURE__*/React.createElement("div", { style: { fontSize: 'var(--font-size-md)', fontWeight: 700, color: '#92400E', lineHeight: 1.45 } }, `기존 ${duplicatePlace.alias || duplicatePlace.name} 과 동일한 업체입니다. 병합하시겠습니까?`),
            /*#__PURE__*/React.createElement("div", { style: { display: 'flex', gap: '6px', marginTop: '7px' } },
              /*#__PURE__*/React.createElement("button", { type: 'button', onClick: () => setSelectedPlace(prev => ({ ...prev, mergeTargetId: duplicatePlace.id })), style: { border: 0, borderRadius: 'var(--radius-sm)', padding: '5px 10px', background: 'var(--accent-primary)', color: '#fff', fontSize: 'var(--font-size-sm)', fontWeight: 700, cursor: 'pointer' } }, '병합'),
              /*#__PURE__*/React.createElement("button", { type: 'button', onClick: () => setSelectedPlace(prev => ({ ...prev, duplicateDismissed: true })), style: { border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '5px 10px', background: 'var(--bg-card)', color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)', cursor: 'pointer' } }, '별도 등록')
            )
          )
        ),

        selectedPlace && /*#__PURE__*/React.createElement("div", null,
          /*#__PURE__*/React.createElement("label", {
            style: { display: 'block', fontSize: 'var(--font-size-md)', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }
          }, "별칭 (선택)"),
          /*#__PURE__*/React.createElement("input", {
            type: "text", className: "form-input", placeholder: "목록에 표시할 별칭 (예: 도은네 집)",
            maxLength: 80, value: placeAlias, onChange: e => setPlaceAlias(e.target.value),
            style: { width: '100%', boxSizing: 'border-box' }
          })
        ),
        /*#__PURE__*/React.createElement("div", null,
          /*#__PURE__*/React.createElement("label", {
            style: { display: 'block', fontSize: 'var(--font-size-md)', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }
          }, "카테고리"),
          /*#__PURE__*/React.createElement("div", { style: { width: '100%' } },
            /*#__PURE__*/React.createElement(SimpleBottomSheetPicker, {
              title: "카테고리 선택",
              value: placeCategoryId,
              options: getPlaceCategories(calendar).map(c => ({ value: c.id, label: getPlaceCategoryLabel(c) })),
              onSelect: setPlaceCategoryId,
              placeholder: "카테고리 선택"
            })
          )
        ),
        /*#__PURE__*/React.createElement("div", null,
          /*#__PURE__*/React.createElement("label", {
            style: { display: 'block', fontSize: 'var(--font-size-md)', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }
          }, "장소 메모 입력"),
          /*#__PURE__*/React.createElement("div", {
            className: "date-modal-field-with-actions",
            style: { display: 'flex', gap: '8px', alignItems: 'flex-start', flexDirection: isPlaceMemoWrapped ? 'column' : 'row' }
          },
            /*#__PURE__*/React.createElement(AutoGrowTextarea, {
              className: "form-input",
              style: { flex: 1, width: isPlaceMemoWrapped ? '100%' : undefined, padding: '8px 12px' },
              minHeight: 44,
              maxHeight: 480,
              textareaRef: placeMemoTextareaRef,
              placeholder: "메모 입력 (선택, '26.02.12' 또는 URL 입력 가능)",
              maxLength: 2000,
              value: placeMemo,
              disabled: isSavingPlace,
              onChange: e => setPlaceMemo(e.target.value)
            }),
            /*#__PURE__*/React.createElement("div", {
              className: "date-modal-field-actions",
              style: isPlaceMemoWrapped ? { width: '100%' } : undefined
            },
              /*#__PURE__*/React.createElement(FormAddEditActionButtons, {
                isEditing: !!editingLinkedPlaceId,
                isSaving: isSavingPlace,
                alignSelf: 'flex-start',
                flexGrow: isPlaceMemoWrapped,
                onCancel: () => {
                  setEditingLinkedPlaceId(null);
                  setSelectedPlace(null);
                  setPlaceQuery('');
                  setPlaceAlias('');
                  setPlaceMemo('');
                  setIsPlaceMemoWrapped(false);
                  setPlaceCategoryId(getPlaceCategories(calendar)[0]?.id || 'etc');
                  setPlaceVisitStatus('visited');
                },
                onSubmit: handleSavePlaceClick
              })
            )
          )
        )
      ),

      /* List of registered places for this date */
      /*#__PURE__*/React.createElement("div", { style: { marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '6px' } },
        /*#__PURE__*/React.createElement("label", {
          style: { fontSize: 'var(--font-size-md)', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '2px' }
        }, `등록된 장소 (${registeredPlaces.length}곳)`),
        /* List */
        registeredPlaces.length === 0 ? /*#__PURE__*/React.createElement("div", {
          style: { textAlign: 'center', color: 'var(--text-muted)', padding: '24px 0', fontSize: 'var(--font-size-md)', border: '1px dashed var(--border-subtle)', borderRadius: 'var(--radius-md)' }
        }, "등록된 장소가 없습니다.") : /*#__PURE__*/React.createElement("div", {
          className: "date-modal-places-list",
          style: { display: 'flex', flexDirection: 'column', gap: '8px', flex: '1 1 auto', minHeight: '80px', overflow: 'visible', paddingBottom: '20px' }
        }, registeredPlaces.map(place => {
          const category = getPlaceCategoryById(calendar, place.categoryId) || { id: 'etc', name: '기타', color: '#64748B' };
          const catColor = category.color || '#64748B';
          const catName = category.name || '기타';
          const isEditingThisPlace = editingLinkedPlaceId === place.id;
          return /*#__PURE__*/React.createElement("div", {
            key: place.id,
            className: `date-modal-place-row${draggingPlaceId === place.id ? ' is-dragging' : ''}${dragOverPlaceId === place.id ? ' is-drop-target' : ''}${isEditingThisPlace ? ' is-editing' : ''}`,
            "data-place-id": place.id,
            role: !adminMode ? 'button' : undefined,
            tabIndex: !adminMode ? 0 : undefined,
            style: {
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              padding: '12px 14px',
              backgroundColor: isEditingThisPlace ? 'rgba(59, 130, 246, 0.08)' : 'var(--bg-card)',
              border: isEditingThisPlace ? '1px solid rgba(59, 130, 246, 0.35)' : '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              position: 'relative',
              cursor: !adminMode ? 'pointer' : undefined
            },
            onClick: !adminMode ? () => beginEditLinkedPlace(place) : undefined,
            onKeyDown: !adminMode ? event => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                beginEditLinkedPlace(place);
              }
            } : undefined,
            onDragOver: event => { event.preventDefault(); if (draggingPlaceId && draggingPlaceId !== place.id) setDragOverPlaceId(place.id); },
            onDrop: async event => {
              event.preventDefault();
              const sourceId = draggingPlaceId;
              setDraggingPlaceId(''); setDragOverPlaceId('');
              if (sourceId && sourceId !== place.id) {
                const ok = await movePlace(sourceId, place.id);
                if (ok === false) showToast('장소 순서 변경에 실패했습니다.', 'error');
                else showToast('장소 순서가 변경되었습니다.', 'success');
              }
            }
          },
            /* Category Tag */
            /*#__PURE__*/React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '6px' } },
              /*#__PURE__*/React.createElement("span", {
                style: {
                  fontSize: 'var(--font-size-2xs)', fontWeight: 900, padding: '2px 8px', borderRadius: 'var(--radius-full)',
                  backgroundColor: `${catColor}18`, color: catColor
                }
              }, catName)
            ),
            /* Name & Address — prefer alias when set */
            /*#__PURE__*/React.createElement("span", { style: { fontWeight: 800, fontSize: 'var(--font-size-base)', color: 'var(--text-main)' } }, place.alias || place.name),
            place.alias && place.name && /*#__PURE__*/React.createElement("span", { style: { fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' } }, place.name),
            place.address && /*#__PURE__*/React.createElement("span", { style: { fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' } }, getDisplayPlaceAddress(place)),
            /* Memo — in DateModal's '장소' tab, show ONLY the memo entry for THIS dateStr; the
               full per-place history (every date's entry) is shown on the 장소 페이지 instead. */
            place.memo && (() => {
              const dateNote = getPlaceMemoEntryForDate(place.memo, dateStr);
              if (!dateNote) return null;
              const memoDate = typeof toMemoDateFormat === 'function' ? toMemoDateFormat(dateStr) : dateStr;
              return /*#__PURE__*/React.createElement("div", {
                style: { fontSize: 'var(--font-size-md)', color: 'var(--text-main)', whiteSpace: 'pre-wrap', wordBreak: 'break-word', lineHeight: 1.45 }
              }, renderTextWithUrlBadge(`${memoDate} ${dateNote}`));
            })(),
            !adminMode && /*#__PURE__*/React.createElement("div", {
              style: { position: 'absolute', top: '10px', right: '10px', display: 'flex', alignItems: 'center', gap: '4px' },
              onClick: event => { event.preventDefault(); event.stopPropagation(); }
            }, /*#__PURE__*/React.createElement("button", {
              type: 'button',
              className: 'poll-drag-handle',
              draggable: true,
              title: '드래그하여 순서 변경',
              'aria-label': '장소 순서 변경',
              onClick: event => { event.preventDefault(); event.stopPropagation(); },
              onDragStart: event => { event.stopPropagation(); setDraggingPlaceId(place.id); event.dataTransfer.effectAllowed = 'move'; },
              onDragEnd: () => { setDraggingPlaceId(''); setDragOverPlaceId(''); },
              // HTML drag-and-drop is intentionally used here: it works with a mouse/trackpad,
              // while touch users can still reorder through the same control on browsers that
              // promote draggable elements to a native long-press drag gesture.
              style: { width: '22px', height: '22px', padding: 0, border: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-sm)', cursor: 'grab', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', touchAction: 'none', userSelect: 'none' }
            }, /*#__PURE__*/React.createElement(LineHeightIcon, { size: 12 })), /*#__PURE__*/React.createElement(ItemEditDeleteActions, {
              showEdit: false,
              onDelete: () => {
                const placeSnapshot = JSON.parse(JSON.stringify(place));
                const canRestorePlace = typeof onSavePlace === 'function';
                const restorePlace = async () => {
                  if (!canRestorePlace) return false;
                  try {
                    setIsSavingPlace(true);
                    const restored = await Promise.resolve(onSavePlace(placeSnapshot));
                    setIsSavingPlace(false);
                    if (restored !== false) showToast('장소 삭제를 되돌렸습니다.', 'success', 3000);
                    else showToast('장소 복원 실패', 'error', 4000);
                    return restored;
                  } catch (restoreErr) {
                    setIsSavingPlace(false);
                    console.error('Place restore failed:', restoreErr);
                    showToast('장소 복원 실패', 'error', 4000);
                    return false;
                  }
                };
                onRequestConfirm('장소 삭제', `"${place.alias || place.name}" 장소를 이 날짜에서 해제하시겠습니까?`, async () => {
                  setIsSavingPlace(true);
                  try {
                    const targetNorm = normalizePlaceDateForSort(dateStr) || dateStr;
                    let nextVisitDate = place.visitDate || '';
                    if (nextVisitDate === dateStr || normalizePlaceDateForSort(nextVisitDate) === targetNorm) nextVisitDate = '';
                    const nextMemo = removePlaceMemoEntry(place.memo || '', dateStr);
                    if (typeof onSavePlace === 'function') {
                      const ok = await Promise.resolve(onSavePlace({
                        id: place.id, name: place.name, alias: place.alias || '',
                        address: place.address || '', lat: place.lat, lng: place.lng,
                        categoryId: place.categoryId || 'etc', memo: nextMemo,
                        visitStatus: place.visitStatus === 'planned' ? 'planned' : 'visited',
                        visitDate: nextVisitDate
                      }));
                      if (ok !== false) {
                        showToast('이 날짜에서 장소가 해제되었습니다.', 'delete', 5000, canRestorePlace ? restorePlace : null);
                        if (editingLinkedPlaceId === place.id) {
                          setEditingLinkedPlaceId(null); setSelectedPlace(null);
                          setPlaceQuery(''); setPlaceAlias(''); setPlaceMemo('');
                          setIsPlaceMemoWrapped(false);
                        }
                      } else if (onDeletePlace) {
                        await Promise.resolve(onDeletePlace(place.id));
                        showToast('장소가 삭제되었습니다.', 'delete', 5000, canRestorePlace ? restorePlace : null);
                      }
                    } else if (onDeletePlace) {
                      await Promise.resolve(onDeletePlace(place.id));
                      showToast('장소가 삭제되었습니다.', 'delete', 5000, canRestorePlace ? restorePlace : null);
                    }
                  } finally { setIsSavingPlace(false); }
                });
              }
            }))
          );
        }))
      )
    ),

    /* Tab 3 Content: 정산 */
    activeTab === 'settlement' && /*#__PURE__*/React.createElement(React.Fragment, null,
      /* Profit/Loss Info Badge */
      /*#__PURE__*/React.createElement("div", {
        style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-primary)', marginBottom: '12px' }
      },
        /*#__PURE__*/React.createElement("span", { style: { fontSize: 'var(--font-size-md)', fontWeight: 700, color: 'var(--text-muted)' } }, "총 정산 요약"),
        (() => {
          const hasSettlementData = expenses.length > 0;
          const netAmount = -expenseTotal;
          const isNegative = netAmount < 0;
          if (!hasSettlementData) return null;
          return /*#__PURE__*/React.createElement("span", {
            style: {
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              verticalAlign: 'middle',
              lineHeight: 1,
              fontSize: 'var(--font-size-md)',
              fontWeight: 600,
              padding: '3px 9px',
              borderRadius: 'var(--radius-full)',
              whiteSpace: 'nowrap',
              backgroundColor: isNegative ? '#FEF2F2' : '#F0FDF4',
              border: `1px solid ${isNegative ? '#FCA5A5' : '#BBF7D0'}`,
              color: isNegative ? '#DC2626' : 'var(--status-green)'
            }
          }, `${isNegative ? '-' : '+'}${Math.abs(netAmount).toLocaleString()}원`);
        })()
      ),

      /* Input Forms */
      !adminMode && /*#__PURE__*/React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: '12px' } },
        /*#__PURE__*/React.createElement("div", null,
          /*#__PURE__*/React.createElement("label", {
            style: { display: 'block', fontSize: 'var(--font-size-md)', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }
          }, "구분 / 카테고리"),
          /*#__PURE__*/React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '8px' } },
            /*#__PURE__*/React.createElement(SegmentedToggle, {
              ariaLabel: "수입/지출 전환",
              disabled: isSavingExpense,
              value: expenseIsIncome ? 'income' : 'expense',
              onChange: v => setExpenseIsIncome(v === 'income'),
              options: [
                { value: 'income', label: '+ 수입', activeColor: 'var(--status-green)' },
                { value: 'expense', label: '- 지출', activeColor: '#DC2626' }
              ]
            }),
            !expenseIsIncome && /*#__PURE__*/React.createElement(SimpleBottomSheetPicker, {
              title: "지출 카테고리 선택",
              placeholder: "지출 카테고리 선택",
              value: expenseCategoryInput,
              disabled: isSavingExpense,
              onSelect: setExpenseCategoryInput,
              options: expenseCategories.map(category => ({
                value: category.id,
                label: getExpenseCategoryLabel(category)
              })),
              style: { flex: '1 1 0%', minWidth: 0, height: '42px' }
            })
          )
        ),
        !expenseIsIncome && /*#__PURE__*/React.createElement("div", null,
          /*#__PURE__*/React.createElement("label", {
            style: { display: 'block', fontSize: 'var(--font-size-md)', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }
          }, "지출자"),
          /*#__PURE__*/React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '8px' } },
            /*#__PURE__*/React.createElement(SimpleBottomSheetPicker, {
              title: "지출자 선택",
              placeholder: "공금지출",
              value: expensePayerInput,
              disabled: isSavingExpense,
              onSelect: setExpensePayerInput,
              options: expensePayerOptions,
              style: { flex: '1 1 0%', minWidth: 0, height: '42px' }
            }),
            /*#__PURE__*/React.createElement("label", {
              title: "체크하면 공금에 영향을 주지 않고, 정산 대상에서도 제외되는 개인 지출로 기록됩니다.",
              style: {
                display: 'flex', alignItems: 'center', gap: '5px', flexShrink: 0,
                padding: '0 10px', height: '42px', borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                backgroundColor: expenseIsSelfPay ? 'rgba(79, 70, 229, 0.08)' : 'var(--bg-card)',
                color: expenseIsSelfPay ? 'var(--accent-primary)' : 'var(--text-muted)',
                fontSize: 'var(--font-size-sm)', fontWeight: 700, cursor: isSavingExpense ? 'default' : 'pointer',
                userSelect: 'none'
              }
            },
              /*#__PURE__*/React.createElement("input", {
                type: "checkbox",
                checked: expenseIsSelfPay,
                disabled: isSavingExpense,
                onChange: e => setExpenseIsSelfPay(e.target.checked),
                style: { margin: 0, cursor: isSavingExpense ? 'default' : 'pointer' }
              }),
              "자비부담"
            )
          )
        ),
        /*#__PURE__*/React.createElement("div", { ref: expenseLabelFieldRef },
          /*#__PURE__*/React.createElement("label", {
            style: { display: 'block', fontSize: 'var(--font-size-md)', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }
          }, expenseIsIncome ? "수입 명목" : "지출 명목"),
          /*#__PURE__*/React.createElement("input", {
            type: "text",
            className: "form-input",
            style: { width: '100%' },
            placeholder: expenseIsIncome ? "수입명목 (예: 회비 입금, URL 첨부 가능)" : "지출명목 (예: 식당 예약금, URL 첨부 가능)",
            maxLength: 220,
            value: expenseLabelInput,
            disabled: isSavingExpense,
            onChange: e => setExpenseLabelInput(e.target.value)
          })
        ),
        /*#__PURE__*/React.createElement("div", null,
          /*#__PURE__*/React.createElement("label", {
            style: { display: 'block', fontSize: 'var(--font-size-md)', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }
          }, expenseIsIncome ? "수입 금액" : "지출 금액"),
          /*#__PURE__*/React.createElement("div", { className: "date-modal-field-with-actions", style: { display: 'flex', gap: '8px' } },
          /*#__PURE__*/React.createElement("input", {
            type: "text",
            inputMode: "numeric",
            className: "form-input",
            style: { flex: '1 1 0%', minWidth: 0 },
            placeholder: expenseIsIncome ? "수입금액 (원)" : "지출금액 (원)",
            value: expenseAmountInput,
            disabled: isSavingExpense,
            onChange: e => {
              const digits = e.target.value.replace(/[^0-9]/g, '');
              const formatted = digits ? Number(digits).toLocaleString() : '';
              setExpenseAmountInput(formatted ? `${expenseIsIncome ? '+' : '-'}${formatted}` : '');
            }
          }),
          /*#__PURE__*/React.createElement("div", { className: "date-modal-field-actions" },
          /*#__PURE__*/React.createElement(FormAddEditActionButtons, {
            isEditing: !!editingExpenseId,
            isSaving: isSavingExpense,
            onCancel: () => {
              setEditingExpenseId(null);
              setExpenseLabelInput('');
              setExpenseAmountInput('');
              setExpenseIsIncome(false);
              setExpensePayerInput('');
              setExpenseIsSelfPay(false);
            },
            onSubmit: handleSaveExpenseClick
          })
          )
          )
        )
      ),

      /* Expenses list */
      expenses.length > 0 && /*#__PURE__*/React.createElement("div", {
        className: "date-modal-settlement-list",
        style: {
          display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px',
          flex: '1 1 auto', minHeight: '80px', overflow: 'visible', paddingBottom: '36px', marginBottom: '24px'
        }
      },
        expenses.map(expense => {
          const { time: expenseTime, rest: expenseLabel } = extractExpenseTimePrefix(getExpenseLabel(expense));
          const expenseUrl = getExpenseUrl(expense);
          const expenseCategory = getDisplayExpenseCategory(calendar, expense) || { id: 'etc', name: '기타', color: '#64748B' };
          const categoryColor = expenseCategory.color || '#64748B';
          const categoryName = expenseCategory.name || '기타';
          return /*#__PURE__*/React.createElement("div", {
            key: expense.id,
            "data-expense-id": expense.id,
            className: `expense-sortable-row poll-sortable-row${draggingExpenseId === expense.id ? ' is-dragging' : ''}${dragOverExpenseId === expense.id ? ' is-drop-target' : ''}`,
            onClick: () => handleExpenseItemClick(expense),
            onDragOver: event => {
              event.preventDefault();
              event.dataTransfer.dropEffect = 'move';
              if (draggingExpenseId && draggingExpenseId !== expense.id) setDragOverExpenseId(expense.id);
            },
            onDragEnter: event => {
              event.preventDefault();
              if (draggingExpenseId && draggingExpenseId !== expense.id) setDragOverExpenseId(expense.id);
            },
            onDragLeave: event => {
              if (!event.currentTarget.contains(event.relatedTarget)) setDragOverExpenseId('');
            },
            onDrop: event => {
              event.preventDefault();
              event.stopPropagation();
              const sourceId = event.dataTransfer.getData('text/plain') || draggingExpenseId;
              moveExpense(sourceId, expense.id);
              setDraggingExpenseId('');
              setDragOverExpenseId('');
            },
            onDragEnd: resetExpensePointerSort,
            style: {
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              padding: '12px 48px 12px 12px',
              position: 'relative',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderColor: editingExpenseId === expense.id ? 'var(--accent-primary)' : (dragOverExpenseId === expense.id ? 'var(--accent-primary)' : 'var(--border-subtle)'),
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              boxSizing: 'border-box'
            }
          },
            /*#__PURE__*/React.createElement("div", {
              className: "expense-row-actions",
              style: { position: 'absolute', top: '10px', right: '10px', display: 'flex', alignItems: 'center', gap: '6px' }
            },
              expenses.length > 1 && /*#__PURE__*/React.createElement("button", {
                type: "button",
                className: "poll-drag-handle",
                disabled: isSavingExpense,
                title: "드래그하여 순서 변경",
                style: {
                  width: '22px', height: '22px', border: '1px solid var(--border-subtle)',
                  backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-sm)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'grab', padding: 0, color: 'var(--text-muted)',
                  touchAction: 'none', userSelect: 'none'
                },
                onClick: event => { event.preventDefault(); event.stopPropagation(); },
                onPointerDown: event => beginExpensePointerSort(event, expense.id)
              }, /*#__PURE__*/React.createElement(LineHeightIcon, { size: 12 })),
              /*#__PURE__*/React.createElement("button", {
                type: "button",
                className: "expense-row-delete-btn",
                title: "삭제",
                "aria-label": "삭제",
                style: {
                  width: '22px',
                  height: '22px',
                  border: 'none',
                  background: 'none',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  padding: 0,
                  color: 'var(--text-muted)'
                },
                onClick: event => handleDeleteExpenseClick(event, expense.id)
              }, /*#__PURE__*/React.createElement(TrashIcon, { size: 14 }))
            ),
            /*#__PURE__*/React.createElement("div", { style: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px', minWidth: 0 } },
              /*#__PURE__*/React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' } },
                /*#__PURE__*/React.createElement("span", {
                  style: {
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '3px 8px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: `${categoryColor}18`,
                    color: categoryColor,
                    fontSize: 'var(--font-size-xs)',
                    fontWeight: 900
                  }
                }, getExpenseCategoryIcon(expenseCategory), getExpenseCategoryIcon(expenseCategory) ? '\u00A0' : '', categoryName),
                expenseTime && /*#__PURE__*/React.createElement("span", {
                  style: {
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '3px 8px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'rgba(79, 70, 229, 0.08)',
                    color: '#4F46E5',
                    fontSize: 'var(--font-size-xs)',
                    fontWeight: 'bold'
                  }
                }, expenseTime),
                (expense.payerId || expense.isSelfPay) && /*#__PURE__*/React.createElement("span", {
                  style: {
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '3px 8px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: `${(activeParticipants.find(p => p.name === expense.payerId) || {}).color || '#64748B'}18`,
                    color: (activeParticipants.find(p => p.name === expense.payerId) || {}).color || '#64748B',
                    fontSize: 'var(--font-size-xs)',
                    fontWeight: 900
                  }
                }, expense.payerId ? `${expense.payerId} ${expense.isSelfPay ? '자비부담' : '선결제'}` : '자비부담')
              ),
              /*#__PURE__*/React.createElement("div", { style: { fontSize: 'var(--font-size-base)', fontWeight: 'bold', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap', width: '100%', wordBreak: 'break-all' } },
                expenseUrl ? /*#__PURE__*/React.createElement(React.Fragment, null,
                  expenseLabel,
                  /*#__PURE__*/React.createElement(UrlCapsuleBadge, { url: expenseUrl })
                ) : expenseLabel
              ),
              /*#__PURE__*/React.createElement("div", { style: { fontSize: '0.9rem', fontWeight: 900, color: Number(expense.amount) < 0 ? 'var(--status-green)' : '#DC2626' } },
                `${Number(expense.amount) < 0 ? '+' : '-'}${Math.abs(Number(expense.amount)).toLocaleString()}원`
              )
            )
          );
        }),
        /* Dedicated 28px bottom spacer ONLY for settlement list when expenses exist */
        /*#__PURE__*/React.createElement("div", {
          className: "date-modal-settlement-bottom-spacer",
          style: { height: '28px', minHeight: '28px', width: '100%', flexShrink: 0, clear: 'both' }
        })
      )
    ),

    /* Tab 4 Content: 사진 */
    activeTab === 'photo' && /*#__PURE__*/React.createElement(React.Fragment, null,
      /* Hidden File Input */
      /*#__PURE__*/React.createElement("input", {
        ref: meetingPhotoInputRef,
        type: "file",
        accept: "image/jpeg, image/png, image/gif, image/webp, image/heic, image/heif, image/*",
        multiple: true,
        onChange: handleMeetingPhotoFiles,
        style: { display: 'none' }
      }),
      /* Title, Count Badge & Upload Button Header */
      /*#__PURE__*/React.createElement("div", {
        style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }
      },
        /*#__PURE__*/React.createElement("label", {
          style: { fontSize: 'var(--font-size-md)', fontWeight: 800, color: 'var(--text-muted)' }
        }, `등록된 사진 (${visibleMeetingImages.length}장)`),
        !adminMode && /*#__PURE__*/React.createElement("div", {
          style: { display: 'flex', alignItems: 'center', gap: '6px' }
        },
          /*#__PURE__*/React.createElement("button", {
            type: "button",
            className: "btn btn-action btn-action-outline",
            disabled: isSavingMeetingPhotos || !hasClipboardImage,
            onClick: handlePasteMeetingPhotos,
            title: hasClipboardImage ? undefined : '클립보드에 붙여넣을 이미지가 없습니다.',
            style: {
              height: '36px',
              padding: '0 12px',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--font-size-md)',
              fontWeight: 900,
              cursor: isSavingMeetingPhotos ? 'wait' : 'pointer'
            }
          }, "붙여넣기"),
          /*#__PURE__*/React.createElement("button", {
            type: "button",
            className: "btn btn-action btn-action-dark",
            disabled: isSavingMeetingPhotos,
            onClick: () => meetingPhotoInputRef.current && meetingPhotoInputRef.current.click(),
            style: {
              height: '36px',
              padding: '0 12px',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--font-size-md)',
              fontWeight: 900,
              cursor: isSavingMeetingPhotos ? 'wait' : 'pointer'
            }
          }, isSavingMeetingPhotos ? "업로드 중..." : "추가")
        )
      ),
      /* Empty State or Photo Grid */
      visibleMeetingPhotos.length === 0 ? /*#__PURE__*/React.createElement("div", {
        style: { textAlign: 'center', color: 'var(--text-muted)', padding: '24px 0', fontSize: 'var(--font-size-md)', border: '1px dashed var(--border-subtle)', borderRadius: 'var(--radius-md)' }
      }, "등록된 사진이 없습니다.") : /*#__PURE__*/React.createElement(React.Fragment, null,
        visibleMeetingImages.length === 0 ? null : /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(76px, 1fr))',
          gap: '8px'
        }
      }, visibleMeetingImages.map((photo, index) => /*#__PURE__*/React.createElement("div", {
        key: photo.id || `${photo.imageUrl}_${index}`,
        style: { position: 'relative', minWidth: 0 }
      },
        /*#__PURE__*/React.createElement(MediaThumb, {
          src: photo.thumbUrl || photo.imageUrl,
          fallbackSrc: photo.imageUrl || photo.thumbUrl,
          alt: "일정 사진",
          loading: "lazy",
          decoding: "async",
          referrerPolicy: "no-referrer",
          onBroken: (e, brokenInfo) => handleBrokenMeetingPhoto(photo, brokenInfo),
          onClick: () => {
            if (typeof setActiveLightbox === 'function') {
              // Lightbox expects { urls, index, meta } (array-shaped, for prev/next
              // navigation) -- NOT a single flat photo object. Passing a flat object left
              // `urls` undefined, which crashed Lightbox on `urls.length` and rendered a
              // blank white screen. 'chat-tag' entries (tag-matched chat photos with no
              // confirmedMeeting.photos entry of their own) route edit/delete/jump through
              // messageId/imageIndex like any other chat photo; real meeting-tab uploads
              // route through source:'meeting' + sourceMessageId/sourceImageIndex/
              // meetingDate/photoId (see handleDeletePhoto/handleSaveImageTags in app-main.js).
              setActiveLightbox({
                urls: visibleMeetingImages.map(p => p.imageUrl || p.thumbUrl),
                index,
                meta: visibleMeetingImages.map(p => ({
                  timestamp: p.createdAt,
                  tags: p.tags,
                  source: p.source || 'meeting',
                  uploadSource: p.uploadSource || (p.source === 'chat-tag' ? 'chat' : 'meeting'),
                  messageId: p.sourceMessageId || p.messageId,
                  imageIndex: p.sourceImageIndex ?? p.imageIndex,
                  sourceMessageId: p.sourceMessageId,
                  sourceImageIndex: p.sourceImageIndex,
                  meetingDate: dateStr,
                  photoId: p.id,
                  assetKey: p.assetKey,
                  mediaKey: p.mediaKey,
                  refKey: p.refKey
                }))
              });
            } else {
              const url = photo.imageUrl || photo.thumbUrl;
              if (url) window.open(url, '_blank', 'noopener,noreferrer');
            }
          },
          style: {
            width: '100%',
            aspectRatio: '1 / 1',
            objectFit: 'cover',
            display: 'block',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--bg-primary)',
            cursor: 'pointer'
          }
        }),
      ))),
        visibleMeetingVideos.length > 0 && /*#__PURE__*/React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '14px' } },
          visibleMeetingVideos.map(video => /*#__PURE__*/React.createElement(DateModalVideoCard, { key: video.id, video }))
        )
      )
    )
  ))));

  // Bottom-sheet rule: never nest under ResizableModalContainer (CSS transform traps fixed).
  const participantSheet = isSheetOpen ? /*#__PURE__*/React.createElement("div", {
    className: "bottom-sheet-overlay",
    style: { zIndex: 20050 },
    onClick: () => setIsSheetOpen(false)
  }, /*#__PURE__*/React.createElement("div", {
    className: "bottom-sheet",
    onClick: e => e.stopPropagation()
  },
    /*#__PURE__*/React.createElement("div", { className: "bottom-sheet-header" },
      /*#__PURE__*/React.createElement("h4", null, "참여자 선택"),
      /*#__PURE__*/React.createElement("button", {
        type: "button",
        style: { background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.2rem', cursor: 'pointer' },
        onClick: () => setIsSheetOpen(false)
      }, "✕")
    ),
    /*#__PURE__*/React.createElement("div", { className: "bottom-sheet-body" },
      activeParticipants.map(p => /*#__PURE__*/React.createElement("button", {
        key: p.id,
        type: "button",
        className: "bottom-sheet-item",
        disabled: isSubmitting,
        onClick: () => {
          if (isSubmitting) return;
          markDirty();
          setParticipantId(p.id);
          setNote(getExistingNoteForParticipant(p.id));
          setIsSheetOpen(false);
        }
      }, ParticipantBackdrop ? /*#__PURE__*/React.createElement(ParticipantBackdrop, { participant: p, name: p.name, dotSize: 12 }) : /*#__PURE__*/React.createElement("span", { style: { display: 'inline-flex', alignItems: 'center', gap: '8px', color: p.color, fontWeight: 700 } }, /*#__PURE__*/React.createElement("span", { className: "color-dot", style: { backgroundColor: p.color, width: '12px', height: '12px' } }), p.name)))
    )
  )) : null;

  // Paste preview/confirm modal -- shown after clicking '붙여넣기' (photo tab) and before the
  // clipboard image(s) actually upload, so the user can see what's about to be attached.
  const pastePreviewModal = pastePreview ? /*#__PURE__*/React.createElement("div", {
    className: "modal-overlay",
    style: { zIndex: 30000 },
    onClick: handleCancelPastePreview
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal-container confirm-dialog-modal",
    onClick: e => e.stopPropagation(),
    style: { maxWidth: '360px', borderRadius: 'var(--radius-md)' }
  },
    /*#__PURE__*/React.createElement("h3", {
      style: { fontSize: '1.05rem', fontWeight: 800, marginBottom: '12px', color: 'var(--text-main)', textAlign: 'center' }
    }, `클립보드 이미지 ${pastePreview.previewUrls.length}장을 붙여넣을까요?`),
    /*#__PURE__*/React.createElement("div", {
      style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(76px, 1fr))', gap: '8px', marginBottom: '16px', maxHeight: '50vh', overflowY: 'auto' }
    }, pastePreview.previewUrls.map((url, i) => /*#__PURE__*/React.createElement("img", {
      key: i,
      src: url,
      alt: "붙여넣을 이미지 미리보기",
      style: { width: '100%', aspectRatio: '1 / 1', objectFit: 'cover', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-primary)' }
    }))),
    /*#__PURE__*/React.createElement("div", { style: { display: 'flex', gap: '10px', justifyContent: 'center' } },
      /*#__PURE__*/React.createElement("button", {
        type: "button",
        className: "btn btn-secondary",
        onClick: handleCancelPastePreview,
        style: { flex: 1, height: '36px', fontSize: 'var(--font-size-base)' }
      }, "취소"),
      /*#__PURE__*/React.createElement("button", {
        type: "button",
        className: "btn btn-action-dark",
        onClick: handleConfirmPastePreview,
        style: { flex: 1, height: '36px', fontSize: 'var(--font-size-base)' }
      }, "업로드")
    )
  )) : null;

  const portaled = /*#__PURE__*/React.createElement(React.Fragment, null, portalContent, participantSheet, pastePreviewModal);
  return typeof document !== 'undefined' && ReactDOM.createPortal
    ? ReactDOM.createPortal(portaled, document.body)
    : portaled;
}

  if (typeof window !== 'undefined') {
  window.GATHER_UI_COMPONENTS = Object.assign({}, window.GATHER_UI_COMPONENTS || {}, {
    DateModal: DateModal,
  });
}
