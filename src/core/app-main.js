/** P6 ESM adapter for app-main — live assets/app-main.js unchanged */
import './../react-globals.js';
import {
  classifyChatComposerFiles,
  createPendingChatFileAttachment,
  uploadChatFileAttachments,
  formatChatFileSize,
  getChatFileTypeLabel,
  isPdfAttachment,
  collectChatFileAttachmentsFromMessages,
  sanitizeFileAttachment,
} from './chat-file-attachments.js';
import {
  deleteGalleryFileAttachments,
  deleteGalleryLinkItems,
  filterDeletedPhotoFromIndexItems
} from './gallery-bulk-delete.js';
import { filterOutMemoryExclusionKeys, preserveAnniversaryCurationFields } from './gallery-data.js';
import { bindUiComponentAliases } from './app-ui-wrappers.js';
import { useTapRevealedMsgId, useModalDirtyGuard, useChatSendGuard } from './app-ui-hooks.js';
import { highlightTextWithYellowMarker, highlightKeyword, formatLogTimestamp, computeCalendarSearchMatches, getAdminSearchResultTargetUrl } from './app-search.js';
import { fetchLinkPreview, useLinkPreview, shouldFetchLinkPreviewForChatUrl } from './app-link-preview.js';
import { renderChatMessageBody, parseTextWithLinks, isEmojiOnlyChatText, resolveMeetingPhotoDisplay, buildLightboxImageInfo, renderTextWithUrlBadge } from './app-chat-render.js';
import { loadLeaflet, loadLeafletMarkerCluster, loadMapLibreLeaflet, getPlaceCategoryMarkerContent, buildPlaceMarkerHtml, panMapToFitMarkerPopup, centerMapOnMarkerAndPopup } from './app-place-map.js';
import {
  isHeicFile,
  buildMetadataTags,
  forgetPreprocessedImages,
  processImageFilesSequentially, chunkResolvedImagesForMessages,
  describeImageProcessingFailures, getImageFilesFromClipboardEvent, appendChatImageFiles,
  uploadInlineChatImageToStorage, readClipboardImageFiles,
  migrateBase64ChatImagesForCalendar, backfillMeetingUploadSourcesForCalendar,
  resolveChatImageBatch, resolveMemoImageBatch, deleteChatImageFromStorage, deleteAllChatImagesFromStorage,
  resolveAnniversaryImageBatch
} from './app-image-pipeline.js';
import {
  computeKoreanHolidaysForYear,
  getHolidayNamesForDate,
  getKoreanSolarTermsForYear
} from './app-calendar-holidays.js';
import {
  getAnniversariesForDate,
  calculateDday,
  getSolarFromLunar
} from './app-anniversary-dates.js';
const React = window.React;
const ReactDOM = window.ReactDOM;
if (!React || !ReactDOM || typeof ReactDOM.createRoot !== 'function') {
  throw new Error('[P6] React globals missing before app-main');
}

import {
  getExpenseCategories,
  getPlaceCategories,
  getPlaceCategoryIcon,
  normalizePlaceAddressForSave,
  deduplicateCalendarPlaces,
  derivePlaceVisitStatus,
  countPlaceVisits,
  getCalendarPlaces,
  unionPlaces,
  extractLeadingMemoDate,
  parseVisitEntriesFromMemo,
  sortVisitEntriesRecentFirst,
  parsePlaceMemoEntries,
  toMemoDateFormat,
  upsertPlaceMemoEntry,
  removePlaceMemoEntry,
  getPlaceMemoEntryForDate,
  getKnownPlaceParticipantNames,
  extractKnownParticipantNames,
  normalizePlaceDateForSort,
  getPlaceSortDateKey,
  getPlaceExternalMapUrl,
  getPlaceKakaoRouteUrl,
  getPlaceNaverRouteUrl,
  getPlaceGoogleRouteUrl,
  getCalendarSettlementCards,
  readConfigNumber,
  FIREBASE_LOAD_TIMEOUT_MS,
  FIREBASE_LOAD_MAX_ATTEMPTS,
  MEMOS_PAGE_SIZE,
  CHAT_LIVE_MESSAGE_LIMIT,
  ADMIN_MESSAGE_LIVE_LIMIT,
  ADMIN_MEMO_LIVE_LIMIT,
  sanitizeMessageForFirestore,
  sanitizeMemoForFirestore,
  slimMessageForClient,
  sha256Hex,
  getAdminSession,
  setAdminSession,
  clearAdminSession,
  verifyAdminPasswordRemote,
  listAllCalendarsRemote,
  listServerAuditLogsRemote,
  memePoolUpsertRemote,
  memePoolDeleteRemote,
  listUntaggedPhotoIndexEntriesRemote,
  adminBulkTagPhotosRemote,
  listSharedDataPoolRemote,
  findCultureLinkedAnniversary,
  findCultureLinkedMemo,
  buildCultureLinkedMemoData,
  rebuildPhotoIndexRemote,
  queueServerAuditEvent,
  getClientAuditContext,
  changeAdminPasswordRemote,
  copyTextToClipboard,
  isNotificationSupported,
  isChatNotifyEnabledForCalendar,
  setChatNotifyEnabledForCalendar,
  setStoredChatParticipantId,
  getBrowserLabelForNotifications,
  getNotificationPermissionHelpSteps,
  setNotifGuideSeen,
  setNotifyChannel,
  ensurePushSubscriptionHealthy,
  syncPushSubscriptionChannels,
  subscribeUserToPushWithPermission,
  unsubscribeUserFromPush,
  notifyNewChatMessage,
  notifyMeetingReminder,
  notifyRepeatScheduleReminder,
  formatDateWithDayName,
  normalizeDateString,
  formatConfirmedMeetingLabel,
  formatDDayLabel,
  getConfirmedMeetings,
  unionConfirmedMeetings,
  getTrulyConfirmedMeetings,
  isDateConfirmedMeeting,
  calculateSettlementBalance,
  formatBalanceBadge,
  getPinnedNotices,
  formatChatHeaderTitle,
  isValidCalendarId,
  isAllowedCalendarId,
  isSettlementEnabledCalendarId,
  sanitizeText,
  describeFirebaseWriteError,
  isValidDateString,
  parseSharePathFromLocation,
  getCalendarIdFromURL,
  getRawCalendarIdFromURL,
  getCalendarMonthFromURL,
  normalizeCalendarUrlParams,
  getCalendarShareUrl,
  getViewShareUrl,
  getMemoItemShareUrl,
  applyDynamicManifest,
  isTombstone,
  getActiveParticipants,
  getActiveAvailabilities,
  getCalendarActivityLogs,
  unionActivityLogs,
  getCalendarPolls,
  getActivePollOptions,
  mergeDeletedActivityLogIds,
  POLL_ACTIVITY_ACTIONS,
  normalizeActivityLog,
  buildFieldChangeNote,
  createActivityLog,
  createPollActivityLog,
  extractFirstUrl,
  extractAllUrlInfos,
  extractAllUrlInfosLoose,
  removeFirstUrl,
  autoGrowTextarea,
  getDirectChatMediaInfo,
  withTimeout,
  getMessageImageEntries,
  getDirectMediaTagKey,
  getDirectMediaTagsForUrl,
  getMediaIdentityKeys,
  getPhotoAssetCommentKey,
  getPhotoCommentIdentity,
  getPhotoCommentCount,
  getLegacyMeetingMediaKey,
  getMessageDirectMediaEntry,
  getShortTitleParts,
  doesPlaceMatchDate,
  getAnniversaryDisplayColor,
} from './app-domain-helpers.js';
import { fetchPhotoComments, savePhotoComments } from './photo-comments.js';
import { createPhotoCommentStore } from './photo-comment-store.js';
import { useGalleryPhotoIndex, invalidatePhotoIndexCache, rememberPhotoIndexTags, schedulePhotoIndexTagReload } from './photo-index.js';
import { useGalleryArchiveState } from './gallery-archive-state.js';
import { cloneConfirmedMeetings, commitConfirmedMeetingChanges } from './confirmed-meeting-coordinator.js';
import {
  todayUploadTagOptions,
  withUploadDateTag
} from './photo-metadata-tags.js';
import { getInitialAppView, buildAppViewUrl } from './app-routing-state.js';
import { useNotificationPwaState } from './notification-pwa-state.js';
import { useDisplayPreferences, useMainHeaderState } from './app-shell-state.js';
import { useBrowserUiCompatibility } from './app-browser-ui-state.js';
import {
  buildMainCalendarScreenState,
  getLocalStorage,
  getChatLastReadTimestamp,
  setChatLastReadTimestamp
} from './app-calendar-screen-state.js';
import {
  getInitialDataLoadingState,
  subscribeBrowserConnectivity,
  subscribeCalendarBootstrap,
  subscribeFirestoreForegroundRecovery,
  subscribeAppResumeRefresh,
  watchFirebaseBootstrap
} from './app-data-bootstrap.js';
const GATHER_APP_CONSTANTS = window.GATHER_APP_CONSTANTS || {};
const GATHER_APP_UTILS = window.GATHER_APP_UTILS || {};
// U1b (docs/app-main-split-units.md): plain GATHER_UI_COMPONENTS pass-through aliases,
// bound once below via bindUiComponentAliases (src/core/app-ui-wrappers.js). Kept as
// same-name const bindings because check-required-symbols.mjs (AdminLoginGate) and every
// JSX call site in this file still reference these names directly.
const uiWrapperAliases = bindUiComponentAliases(React);
const {
  ResizableModalContainer, AutoGrowTextarea, FormAddEditActionButtons, SegmentedToggle,
  UnderlineTabs, ItemEditDeleteActions, GamifiedConfirmButtonContent, LinkPreviewCard,
  LinkPreviewProgressOverlay, AdminLoginGate, DonutChart, ColorSwatchPicker, StickyVideoBox,
  PollVoterSheet, OperationProgressOverlay, ToggleSwitch, Footer, SearchResultLogRow,
  TikTokEmbedWidget, UrlCapsuleBadge, ParticipantPickerButton, DateCapsuleBadge,
  CapsuleTextBadge
} = uiWrapperAliases;


// Shared add/edit action row: 추가 | (edit) 취소 + 수정 — DateModal 참여자/장소/정산 공통 모듈

import {
  normalizePollOptionInput,
  normalizePollVotes,
  getPollOptionVoterIds,
  getPollTotalVoteCount,
  isPollClosed,
  normalizePoll,
  mergePollRecord,
  mergePolls,
  buildActivityLogsFromAvailabilities,
  validateCalendarShape,
  normalizeCalendarForSave,
  assertCalendarLinks,
  cloneCalendar,
  cloneCalendarList,
  mergeCalendarCollections,
  __gatherSafeLocalStorage,
  loadLocalCache,
  saveLocalCache,
  isUsableCalendarRecord,
  createLoadingCalendarShell,
  subscribeMessages,
  subscribePlaces,
  subscribeMemos,
  firebaseConfig,
  __setFirebaseDb,
  firebaseInitError,
  firebaseRetryExhausted,
  ensureFirebaseStorageReady,
  getLiveFirebaseStorage,
  getFirebaseStateVersion,
  subscribeFirebaseStateChange,
  fetchSingleCalendarWithRest,
  fetchRecentMessagesRest,
  fetchChatMessagesRest,
  fetchAllChatMessagesRest,
  fetchCalendarSearchIndex,
  fetchRecentChatMessages,
  fetchRecentGalleryMessages,
  fetchMessagesByImageTag,
  fetchMemosByTag,
  fetchMeetingPhotoIndex,
  CHAT_OLDER_PAGE_SIZE,
  MAX_OLDER_CHAT_MESSAGES,
  fetchSubcollectionCount,
  fetchOlderChatMessages,
  fetchMessageOrdinal,
  fetchGalleryPhotoOrdinal,
  invalidateGalleryItemCount,
  fetchMemosRest,
  fetchAnniversariesRest,
  fetchPhotoCommentCountsRest,
  fetchCustomCultureItemsRest,
  fetchMemePoolRest,
  writeCollectionDocumentWithFallback,
  writeRootCollectionDocumentWithFallback,
  deleteMessageRest,
  fetchMessageRest,
  fetchSingleCloudCalendar,
  getCloudDocCalendar,
  firestoreDocumentToJs,
  createImageShareDocument,
  fetchImageShareDocument,
  writeActivityLogsToFirestore,
  fetchActivityLogsFromFirestore,
  deleteActivityLogsAfterTimestamp,
  fetchPlacesFromFirestore,
  fetchConfirmedMeetingsFromFirestore,
  fetchExistingConfirmedMeetingsForDates,
  mergeConfirmedMeetings,
  describeUpdateCalendarsFailure,
  pushSingleCloudCalendar,
  persistCalendarAuxiliaryData,
  loadLocalMeta,
  saveLocalMeta,
  getMetaLastModified,
  updateMetaLastModified,
  getMetaRevision,
  updateMetaRevision,
  isAdminDashboardRoute,
  isAdminRestoreRoute,
  getAdminSelectedCalendarIdFromUrl,
  getAdminSearchQueryFromUrl,
  getAdminSearchFilterFromUrl,
  createDefaultCalendar,
  createCalendarBackupPayload,
  createCalendarDataBackupPayload,
  downloadJsonFile,
  dateStrToHashtag,
  exportCalendarConfirmedMeetingsToICS,
  extractCalendarsFromBackup,
  extractCalendarBackupEntries,
  validateCalendarBackupEntries,
  restoreCalendarBackupEntries,
  validateBackupCalendars,
  buildAdminDashboardMetrics,
  getCalendarAccentColor
} from './app-firebase-data.js';
import { enqueueWriteOperation, flushWriteQueue } from './app-write-queue.js';
import { replayQueuedMediaMessage, replayQueuedMemoSave, replayQueuedRootCollectionWrite } from './app-media-outbox.js';
import { useAppFeedbackState } from './app-feedback-state.js';
// window.GATHER_APP_FIREBASE_DATA was never assigned anywhere in this codebase -- these two
// vars were a permanently-null dead snapshot from module-eval time onward, which meant every
// `if (!firebaseDb)` check below saw the SDK as "unavailable" forever and fell back to its
// REST-polling path (setInterval(..., 6000)) for the entire life of every page load, on every
// client, regardless of whether the Firebase SDK actually connected successfully. The real,
// live-updated globals are window.__gatherFirebaseDb / window.__gatherFirebaseStorage (set by
// __setFirebaseDb in app-firebase-data.js and already used correctly by every ui-*.js file and
// by getLiveFirebaseStorage below) -- read those now, and keep these vars in sync going forward
// via the same 'gather-firebase-state-change' event app-firebase-data.js already dispatches on
// every connection-state change (see firebaseConnectionVersion's useSyncExternalStore below,
// which already re-runs the affected effects on this same event -- they just need firebaseDb
// itself to stop being stuck at its initial null).
var firebaseDb = (typeof window !== 'undefined' && window.__gatherFirebaseDb) || null;
if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
  window.addEventListener('gather-firebase-state-change', () => {
    if (window.__gatherFirebaseDb) firebaseDb = window.__gatherFirebaseDb;
  });
}
function shouldQueueCalendarWriteFailure(error) {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return true;
  const message = String(error?.message || error || '').toLowerCase();
  return /timeout|network|fetch|offline|연결|상태를 확인/.test(message);
}
async function replayQueuedCalendarWrite(operation) {
  if (operation?.type === 'root-collection-write' && operation.payload) return replayQueuedRootCollectionWrite(operation, { writeDocument: (collectionName, docId, data, label, options) => writeRootCollectionDocumentWithFallback(collectionName, docId, data, label, { ...options, skipQueue: true }) });
  if (operation?.type === 'media-memo-save' && operation.payload) {
    return replayQueuedMemoSave(operation, {
      resolveImages: resolveMemoImageBatch,
      writeMemo: (calendarId, memoId, data) => writeCollectionDocumentWithFallback('memos', calendarId, memoId, data, 'set', '메모 사진 대기 저장', { skipQueue: true })
    });
  }
  if (operation?.type === 'media-chat-send' && operation.payload) {
    return replayQueuedMediaMessage(operation, {
      resolveImages: resolveChatImageBatch,
      chunkImages: chunkResolvedImagesForMessages,
      writeMessage: (calendarId, data, documentId) => writeCollectionDocumentWithFallback('messages', calendarId, '', data, 'add', '사진 대기 저장', { documentId, skipQueue: true })
    });
  }
  if (operation?.type === 'collection-write' && operation.payload) {
    const payload = operation.payload;
    const result = await writeCollectionDocumentWithFallback(
      payload.collectionName,
      operation.calendarId,
      payload.docId || '',
      payload.data,
      payload.method || 'update',
      payload.warnLabel || '대기 저장',
      { deletePaths: payload.deletePaths || [], skipQueue: true }
    );
    return Boolean(result?.success);
  }
  if (operation?.type === 'calendar-auxiliary-sync' && operation.payload) {
    return persistCalendarAuxiliaryData(
      operation.calendarId,
      Array.isArray(operation.payload.places) ? operation.payload.places : [],
      Array.isArray(operation.payload.meetings) ? operation.payload.meetings : []
    );
  }
  if (operation?.type !== 'calendar-snapshot' || !operation.payload?.calendar) return false;
  const payload = operation.payload;
  const result = await pushSingleCloudCalendar(
    payload.calendar,
    payload.lastModified,
    4,
    null,
    payload.saveMode || 'availability',
    Array.isArray(payload.newActivityLogs) ? payload.newActivityLogs : [],
    payload.auxiliaryData || {}
  );
  return Boolean(result?.ok);
}
const {
  AdminDashboard, AdminModal, AdminUnifiedSearchResultsView, AdminCreateCalendarModal,
  AdminRestorePhraseModal, AdminUnifiedSearchModal, CreateSettlementModal
} = uiWrapperAliases;
function getAllDirectMediaImageEntries(message) {
  const direct = getMessageDirectMediaEntry(message);
  return direct ? [direct] : [];
}
const NON_CHAT_UPLOAD_SOURCES = new Set(['meeting', 'gallery']);
function isNonChatUploadSource(uploadSource) {
  return NON_CHAT_UPLOAD_SOURCES.has(String(uploadSource || '').trim().toLowerCase());
}

function getMeetingOwnedPhotoMessageIds(calendar) {
  const ids = new Set();
  const fn = typeof getConfirmedMeetings === 'function' ? getConfirmedMeetings : (typeof window !== 'undefined' && window.GATHER_APP_UTILS ? window.GATHER_APP_UTILS.getConfirmedMeetings : null);
  const meetings = typeof fn === 'function' ? fn(calendar) : [];
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
}

function isChatRenderableMessage(message, meetingPhotoMessageIds = null) {
  if (!message || typeof message !== 'object') return false;
  if (isNonChatUploadSource(message.uploadSource)) return false;
  if (meetingPhotoMessageIds && meetingPhotoMessageIds.has(message.id)) return false;
  return true;
}

// Default empty-composer memo body for a 문화공연/지역축제 card (detail-sheet fields).
function buildCultureEventMemoText(item) {
  if (!item) return '';
  const lines = [];
  if (item.title) lines.push(item.title);
  const period = item.dateLabel || [item.startDate, item.endDate].filter(Boolean).join(' ~ ');
  if (period) lines.push(`기간: ${period}`);
  if (item.venue) lines.push(`장소: ${item.venue}`);
  if (item.address) lines.push(`주소: ${item.address}`);
  if (item.organizer) lines.push(`주최: ${item.organizer}`);
  if (item.contact) lines.push(`문의: ${item.contact}`);
  if (item.price) lines.push(`가격: ${item.price}`);
  if (item.description) lines.push(String(item.description).trim());
  if (item.link) lines.push(String(item.link).trim());
  return lines.join('\n');
}

function App() {
  // Keep hooks unconditional. The app can switch between the admin route and the regular
  // calendar route through SPA/browser-history navigation; returning before these hooks on only
  // one route changes the hook count between renders and triggers React invariant #310.
  const adminRoute = isAdminDashboardRoute();
  // 컨텐츠 상세의 "공유" 버튼으로 받은 URL(#gatherContent=...)을 열면, 어느 화면에 있든/캘린더가
  // 로드됐든 안 됐든 상관없이 그 컨텐츠 백드롭이 바로 보이도록 최상위에서 한 번만 파싱한다.
  // 실제 등록(Firestore 쓰기)은 하지 않는 읽기 전용 미리보기 -- 등록은 컨텐츠 등록 화면의
  // "붙여넣기"에서 사용자가 명시적으로 한다.
  const [sharedContentItem, setSharedContentItem] = React.useState(() => {
    try {
      const hash = window.location.hash || '';
      const marker = '#gatherContent=';
      const idx = hash.indexOf(marker);
      if (idx === -1) return null;
      const json = decodeURIComponent(escape(atob(hash.slice(idx + marker.length))));
      const payload = JSON.parse(json);
      if (!payload || payload.kind !== 'gather-content' || !payload.item || !payload.item.title) return null;
      return payload.item;
    } catch (_) { return null; }
  });
  React.useEffect(() => {
    if (!sharedContentItem) return;
    try { window.history.replaceState({}, '', window.location.pathname + window.location.search); } catch (_) { /* best-effort */ }
  }, []);
  if (adminRoute) {
    const initialCalendars = loadLocalCache();
    return /*#__PURE__*/React.createElement(AdminLoginGate, null,
      /*#__PURE__*/React.createElement(AdminDashboard, { initialCalendars })
    );
  }
  const SharedContentPreviewModal = (window.GATHER_UI_COMPONENTS || {}).SharedContentPreviewModal;
  return /*#__PURE__*/React.createElement(React.Fragment, null,
    /*#__PURE__*/React.createElement(CalendarApp, null),
    sharedContentItem && SharedContentPreviewModal && /*#__PURE__*/React.createElement(SharedContentPreviewModal, {
      item: sharedContentItem,
      onClose: () => setSharedContentItem(null)
    })
  );
}

function CalendarApp() {
  const [activeCalId, setActiveCalId] = React.useState(() => {
    const requestedId = getCalendarIdFromURL();
    if (requestedId && isAllowedCalendarId(requestedId)) return requestedId;
    try {
      const savedId = window.localStorage?.getItem('gather_last_active_cal_id');
      if (savedId && isAllowedCalendarId(savedId)) return savedId;
    } catch (_) {}
    // This app has no real per-user login -- a calendar id IS the access secret (see
    // firestore.rules' isCalendarDoc checks). The bare app URL used to default straight into
    // a real, hardcoded family calendar id for anyone with neither a share link nor a saved
    // browser (a brand new device/browser, private mode, or cleared storage) -- meaning that
    // literal id, sitting in this public repo's source, doubled as a live, unauthenticated
    // door into that calendar's chat/photos/locations for anyone who read the code. A visitor
    // with no real link now sees the generic "불러오는 중..." loading shell (createLoading-
    // CalendarShell/isUsableCalendarRecord already handle an id no calendar document matches)
    // instead of silently landing on someone's actual data. Real access still only ever works
    // via an explicit share link (?cal=.../ /share/.../) or this device's own saved last-used
    // calendar, exactly as before -- nothing changes for anyone who already has a real link.
    return 'no-calendar-selected';
  });
  normalizeCalendarUrlParams(activeCalId);
  React.useEffect(() => {
    if (activeCalId && isAllowedCalendarId(activeCalId)) {
      try {
        window.localStorage?.setItem('gather_last_active_cal_id', activeCalId);
      } catch (_) {}
      normalizeCalendarUrlParams(activeCalId);
    }
  }, [activeCalId]);
  const [calendars, setCalendarsState] = React.useState(() => loadLocalCache());
  const calendarsRef = React.useRef(calendars);
  React.useEffect(() => {
    calendarsRef.current = calendars;
  }, [calendars]);
  const {
    toast, operationProgress, showToast, dismissToast, showUndoableDeleteToast,
    showRetryableUploadToast, runWithOperationProgress, confirmDialog, setConfirmDialog,
    showConfirmDialog, showAlert
  } = useAppFeedbackState({ React, createToastLifecycle: GATHER_APP_UTILS.createToastLifecycle });
  const flushPendingWrites = React.useCallback(async () => {
    if (typeof navigator !== 'undefined' && navigator.onLine === false) return;
    try {
      const result = await flushWriteQueue(replayQueuedCalendarWrite);
      if (result.processed > 0) showToast(`${result.processed}건의 대기 저장을 동기화했습니다.`, 'success', 3000);
    } catch (error) {
      console.warn('Pending write queue flush notice:', error);
    }
  }, [showToast]);
  React.useEffect(() => {
    void flushPendingWrites();
    const handleOnline = () => { void flushPendingWrites(); };
    window.addEventListener('online', handleOnline);
    // A write only ever gets queued here because it looked network-related (a timeout, a fetch
    // failure -- see shouldQueueCollectionWrite/shouldQueueCalendarWriteFailure), NOT because the
    // browser was actually marked offline. `navigator.onLine` stays true through exactly this kind
    // of transient flakiness, so the 'online' listener above never fires to retry it -- without a
    // periodic sweep, a queued send/edit/delete/upload just sits there, invisible, until the user
    // happens to reload the page (and even then only gets ONE retry attempt, which can fail again
    // under the same flaky connection -- explaining reports of needing several reloads before a
    // delete/send/upload "sticks"). Skipped while the tab is hidden since there's no one to show
    // the resulting toast to and it would only burn battery/data in the background.
    const retryTimer = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return;
      void flushPendingWrites();
    }, 20000);
    return () => {
      window.removeEventListener('online', handleOnline);
      clearInterval(retryTimer);
    };
  }, [flushPendingWrites]);
  const firebaseConnectionVersion = React.useSyncExternalStore(
    subscribeFirebaseStateChange,
    getFirebaseStateVersion,
    getFirebaseStateVersion
  );

  const isSavingRef = React.useRef(false);
  const [saveSyncState, setSaveSyncState] = React.useState({ status: 'live', label: '동기화됨', lastSyncedText: '' });
  const pendingRemoteSnapshotRef = React.useRef(null);
  const pendingRemotePlacesRef = React.useRef(null);
  const pendingRemoteMeetingsRef = React.useRef(null);
  const localWriteStartedAtRef = React.useRef({});
  const serverRevisionRef = React.useRef(loadLocalMeta());
  const applyServerCalendars = (serverCalendars, lastModified = Date.now()) => {
    const normalized = cloneCalendarList(serverCalendars).map(normalizeCalendarForSave);
    if (normalized.length === 0) return;
    normalized.forEach((calendar) => {
      serverRevisionRef.current = updateMetaLastModified(serverRevisionRef.current, calendar.id, lastModified);
      serverRevisionRef.current = updateMetaRevision(serverRevisionRef.current, calendar.id, calendar.revision || 0);
    });
    setCalendarsState(normalized);
    saveLocalCache(normalized);
    saveLocalMeta(serverRevisionRef.current);
  };

  const updateCalendars = async (nextCalendars, toastMsg = '저장완료', toastType = 'success', targetCalId = activeCalId, saveMode = 'availability', newActivityLogs = [], auxiliaryData = {}) => {
    let previousCalendars = null;
    let normalizedCalendars = null;
    let queueOperationId = '';
    let queuePayload = null;
    try {
      if (isSavingRef.current) return false;
      if (!isAllowedCalendarId(targetCalId)) {
        showToast('캘린더 ID 오류', 'error');
        return false;
      }
      const now = Date.now();
      normalizedCalendars = cloneCalendarList(nextCalendars).map(normalizeCalendarForSave);

      const currentCal = normalizedCalendars.find(c => c.id === targetCalId) || null;
      if (!currentCal) {
        console.warn('Active calendar not found during save:', targetCalId);
        showToast('캘린더 없음', 'error');
        return false;
      }

      queueOperationId = `calendar_${targetCalId}_${now}_${Math.random().toString(36).slice(2, 8)}`;
      const saveOperationId = queueOperationId;
      auxiliaryData = { ...auxiliaryData, operationId: saveOperationId };
      queuePayload = {
        calendar: currentCal,
        lastModified: now,
        saveMode,
        newActivityLogs,
        auxiliaryData
      };
      if (typeof navigator !== 'undefined' && navigator.onLine === false) {
        const queued = await enqueueWriteOperation({
          id: queueOperationId,
          type: 'calendar-snapshot',
          calendarId: targetCalId,
          payload: queuePayload
        });
        if (queued) {
          setCalendarsState(normalizedCalendars);
          setSaveSyncState({ status: 'offline', label: '오프라인 저장 대기', detail: '연결되면 자동으로 재시도합니다.' });
          showToast('오프라인입니다. 연결되면 자동으로 저장합니다.', 'info', 5000);
          return true;
        }
        showToast('오프라인 저장 대기열을 사용할 수 없습니다.', 'error', 6000);
        return false;
      }
      isSavingRef.current = true;
      setSaveSyncState({ status: 'saving', label: '저장 중', detail: '서버에 반영하고 있습니다.' });
      localWriteStartedAtRef.current[targetCalId] = now;
      previousCalendars = calendars;
      setCalendarsState(normalizedCalendars);
      const progressTitle = saveMode === 'polls'
        ? '투표 저장 중...'
        : saveMode === 'settings'
        ? '설정 저장 중...'
        : saveMode === 'replace'
        ? '캘린더 저장 중...'
        : saveMode === 'restore'
        ? '데이터 복구 중...'
        : '일정 저장 중...';
      const saved = await runWithOperationProgress({
        title: progressTitle,
        detail: `${currentCal.title || currentCal.id} 데이터를 Firebase에 반영하고 있습니다.`
      }, () => pushSingleCloudCalendar(currentCal, now, 4, normalizedCalendars, saveMode, newActivityLogs, auxiliaryData));
      console.info('[calendar-save]', {
        operationId: saveOperationId,
        calendarId: currentCal.id,
        saveMode,
        revision: saved?.revision || null,
        auxiliaryPersistenceFailed: Boolean(saved?.auxiliaryPersistenceFailed)
      });
      if (!saved) {
        console.warn('Cloud save failed for calendar:', currentCal.id);
        if (previousCalendars) setCalendarsState(previousCalendars);
        showToast('저장 실패', 'error');
        setSaveSyncState({ status: 'error', label: '저장 실패', detail: '다시 시도해 주세요.' });
        return false;
      }

      if (saved.auxiliaryPersistenceFailed) {
        showToast('저장은 완료되었지만 일부 보조 데이터 동기화가 지연되고 있습니다.', 'info', 6000);
      }
      setSaveSyncState({ status: 'live', label: '동기화됨', lastSyncedText: '방금' });

      serverRevisionRef.current = updateMetaLastModified(serverRevisionRef.current, currentCal.id, now);
      serverRevisionRef.current = updateMetaRevision(serverRevisionRef.current, currentCal.id, (saved && saved.revision) || currentCal.revision || 0);
      saveLocalCache(normalizedCalendars);
      saveLocalMeta(serverRevisionRef.current);
      if (toastMsg !== null && toastMsg !== undefined && toastMsg !== '') {
        showToast(toastMsg, toastType, 3000);
      }
      return true;
    } catch (err) {
      console.error('updateCalendars failed:', err);
      console.warn('[calendar-save-failed]', {
        operationId: queueOperationId || null,
        calendarId: targetCalId,
        saveMode,
        error: String(err?.message || err || '').slice(0, 240)
      });
      if (shouldQueueCalendarWriteFailure(err)) {
        const queued = await enqueueWriteOperation({
          id: queueOperationId,
          type: 'calendar-snapshot',
          calendarId: targetCalId,
          payload: queuePayload,
          lastError: err?.message || String(err)
        });
        if (queued) {
          if (previousCalendars) setCalendarsState(normalizedCalendars);
          showToast('네트워크가 불안정합니다. 저장을 대기하고 연결되면 자동 재시도합니다.', 'info', 6000);
          setSaveSyncState({ status: 'offline', label: '저장 대기 중', detail: '연결되면 자동으로 재시도합니다.' });
          return true;
        }
      }
      if (previousCalendars) setCalendarsState(previousCalendars);
      showToast(describeUpdateCalendarsFailure(err), 'error', 6000);
      setSaveSyncState({ status: 'error', label: '저장 실패', detail: '다시 시도해 주세요.' });
      return false;
    } finally {
      isSavingRef.current = false;
      const pending = pendingRemoteSnapshotRef.current;
      pendingRemoteSnapshotRef.current = null;
      if (pending && pending.calendar && pending.calendar.id === targetCalId) {
        applyCalendarSnapshot(pending.calendar, pending.lastModified, pending.revision, false);
      }
      const pendingPlaces = pendingRemotePlacesRef.current;
      pendingRemotePlacesRef.current = null;
      // pendingPlaces is now only the bounded recent-updates window (see subscribePlaces above),
      // not the full collection, so merge it in by id instead of replacing -- a plain replace
      // here would silently drop every older place not touched during this save.
      if (Array.isArray(pendingPlaces)) {
        setPlacesSubcollection(prev => {
          const byId = new Map();
          (Array.isArray(prev) ? prev : []).forEach(p => { if (p?.id) byId.set(p.id, p); });
          pendingPlaces.forEach(p => { if (p?.id) byId.set(p.id, p); });
          return Array.from(byId.values());
        });
      }
      const pendingMeetings = pendingRemoteMeetingsRef.current;
      pendingRemoteMeetingsRef.current = null;
      if (Array.isArray(pendingMeetings)) {
        setConfirmedMeetingsSubcollection(prev => {
          const prevList = Array.isArray(prev) ? prev : [];
          const snapshotDates = new Set(pendingMeetings.map(m => m && m.date).filter(Boolean));
          return mergeConfirmedMeetings(prevList, pendingMeetings).filter(m => m && m.date && snapshotDates.has(m.date));
        });
      }
    }
  };

  const [cloudReloadToken, setCloudReloadToken] = React.useState(0);
  const [currentMonthDate, setCurrentMonthDate] = React.useState(() => {
    const requestedMonth = getCalendarMonthFromURL();
    return requestedMonth
      ? new Date(requestedMonth.year, requestedMonth.month - 1, 1)
      : new Date();
  });
  const [selectedDate, setSelectedDate] = React.useState(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  // Lets a Lightbox "이동" action (from handleJumpToMeetingDate) open DateModal straight on
  // its 사진 tab instead of the default 참여자 tab; null everywhere else.
  const [dateModalInitialTab, setDateModalInitialTab] = React.useState(null);
  const [isAdminOpen, setIsAdminOpen] = React.useState(false);
  const [adminInitialTab, setAdminInitialTab] = React.useState('settings');
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = React.useState(false);
  const [globalSearchInitialQuery, setGlobalSearchInitialQuery] = React.useState('');

  const {
    themeChoice,
    toggleTheme,
    isDarkTheme,
    fontScalePercent,
    setFontScalePercent
  } = useDisplayPreferences({ React, activeCalId, isAdminDashboardRoute, getLocalStorage });

  const [adminActivityLogs, setAdminActivityLogs] = React.useState([]);
  const [isShareOpen, setIsShareOpen] = React.useState(false);
  const [isChatShareOpen, setIsChatShareOpen] = React.useState(false);
  const [isPlacesShareOpen, setIsPlacesShareOpen] = React.useState(false);
  const [isMemoShareOpen, setIsMemoShareOpen] = React.useState(false);
  const [isGalleryShareOpen, setIsGalleryShareOpen] = React.useState(false);
  const [isHistoryShareOpen, setIsHistoryShareOpen] = React.useState(false);
  const [isMainSideMenuOpen, setIsMainSideMenuOpen] = React.useState(false);
  const confirmedMeetingAnimationTimersRef = React.useRef(new Map());
  const [isAppSettingsOpen, setIsAppSettingsOpen] = React.useState(false);
  const [isPollModalOpen, setIsPollModalOpen] = React.useState(false);
  const [expandedConfirmedDates, setExpandedConfirmedDates] = React.useState({});
  const [isCreateSettlementOpen, setIsCreateSettlementOpen] = React.useState(false);
  const [editingSettlementCard, setEditingSettlementCard] = React.useState(null);
  const [editingPoll, setEditingPoll] = React.useState(null);
  const [voteTarget, setVoteTarget] = React.useState(null);
  const [isGuideOpen, setIsGuideOpen] = React.useState(false);
  const [isAnniversariesOpen, setIsAnniversariesOpen] = React.useState(false);
  const [anniversaryEditId, setAnniversaryEditId] = React.useState(null);
  const withEventUi = (open, failureLabel = '화면') => {
    const components = window.GATHER_UI_COMPONENTS || {};
    if (typeof components.AnniversaryModal === 'function'
      && typeof components.PollModal === 'function'
      && typeof components.SettlementSummaryModal === 'function') {
      open();
      return;
    }
    if (typeof window.__gatherLoadEventUi !== 'function') return;
    window.__gatherLoadEventUi().then(open).catch(error => {
      console.error(`${failureLabel} UI load failed:`, error);
      showToast(`${failureLabel}을 불러오지 못했습니다. 다시 시도해 주세요.`, 'error');
    });
  };
  // 일정 팝업의 "+ 기념일 등록" 버튼이 채워 넣는 날짜 -- AnniversaryModal이 이 날짜로 바로
  // 등록 폼을 여는 데 쓴다 (initialEditId와는 별개로, 기존 기념일이 아닌 새 등록 전용).
  const [anniversaryInitialDate, setAnniversaryInitialDate] = React.useState(null);
  const [isInitialDataLoading, setIsInitialDataLoading] = React.useState(() => getInitialDataLoadingState({
    firebaseDb,
    activeCalId,
    loadLocalCache,
    isUsableCalendarRecord
  }));
  const [, setIsBrowserOnline] = React.useState(() => {
    try {
      return typeof navigator === 'undefined' ? true : navigator.onLine !== false;
    } catch (_) {
      return true;
    }
  });
  const [, setSyncDiag] = React.useState(null);
  React.useEffect(() => subscribeBrowserConnectivity(setIsBrowserOnline), []);

  // Chat-related states
  const [chatMessages, setChatMessages] = React.useState([]);
  const [galleryLiveMessages, setGalleryLiveMessages] = React.useState([]);
  const [olderChatMessages, setOlderChatMessages] = React.useState([]);
  const [hasMoreOlderChat, setHasMoreOlderChat] = React.useState(true);
  const [loadingOlderChat, setLoadingOlderChat] = React.useState(false);
  const [totalChatCount, setTotalChatCount] = React.useState(null);
  const [chatPreviewHydrationExhausted, setChatPreviewHydrationExhausted] = React.useState(false);
  const [totalMemoCount, setTotalMemoCount] = React.useState(null);
  const [totalGalleryCount, setTotalGalleryCount] = React.useState(null);
  const [galleryPreviewMessages, setGalleryPreviewMessages] = React.useState([]);
  const CHAT_INITIAL_MESSAGE_LIMIT = readConfigNumber('CHAT_INITIAL_MESSAGE_LIMIT', 5);
  const [chatLiveLimit, setChatLiveLimit] = React.useState(CHAT_INITIAL_MESSAGE_LIMIT);
  const loadingOlderChatRef = React.useRef(false);
  const allChatMessages = React.useMemo(() => {
    const byId = new Map();
    (olderChatMessages || []).forEach(m => { if (m && m.id) byId.set(m.id, m); });
    (galleryLiveMessages || []).forEach(m => { if (m && m.id) byId.set(m.id, m); });
    (chatMessages || []).forEach(m => { if (m && m.id) byId.set(m.id, m); });
    return Array.from(byId.values()).sort((a, b) => Number(a.timestamp || 0) - Number(b.timestamp || 0));
  }, [olderChatMessages, galleryLiveMessages, chatMessages]);
  const [memos, setMemos] = React.useState([]);
  const [memosLimit, setMemosLimit] = React.useState(MEMOS_PAGE_SIZE);
  const [hasMoreMemos, setHasMoreMemos] = React.useState(false);
  // A memo shared via its own ?view=memo&memo=<id> link (see MemoShareModal) may be older than
  // the paginated `memos` window above, so it needs its own direct-by-id fetch rather than
  // relying on it already being present in that list.
  const [sharedMemo, setSharedMemo] = React.useState(null);
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const share = parseSharePathFromLocation();
    const memoParam = (share && share.memoId) || params.get('memo');
    if (!memoParam || !activeCalId) {
      setSharedMemo(null);
      return;
    }
    let isMounted = true;
    (async () => {
      try {
        if (firebaseDb) {
          const doc = await withTimeout(firebaseDb.collection('calendars').doc(`cal_${activeCalId}`).collection('memos').doc(memoParam).get(), 9000, 'shared memo read');
          if (isMounted && doc.exists) setSharedMemo({ id: doc.id, ...doc.data() });
        } else {
          const res = await withTimeout(fetch(`https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/calendars/cal_${activeCalId}/memos/${memoParam}`), 9000, 'shared memo REST read');
          if (res.ok && isMounted) setSharedMemo({ id: memoParam, ...firestoreDocumentToJs(await res.json()) });
        }
      } catch (e) {
        console.warn('Failed to fetch shared memo:', e);
      }
    })();
    return () => { isMounted = false; };
  }, [activeCalId, firebaseDb, firebaseConnectionVersion]);
  const [anniversaries, setAnniversaries] = React.useState([]);
  const [customCultureItems, setCustomCultureItems] = React.useState([]);
  // 밈 키보드용 이미지 풀. calendarId로 나뉘지 않는 전역 컬렉션이라(모든 캘린더가 같은 해시태그
  // 인덱스를 검색) 활성 캘린더가 바뀌어도 다시 불러올 필요는 없지만, 딱 한 번만 불러오면
  // 어드민이 다른 탭에서 태그를 편집하는 동안 이 세션은 그 변경을 영영 못 본다 -- 탭을 다시
  // 활성화할 때마다(포커스/가시성 복귀) 재조회해서, 새로고침 없이도 몇 분 안에 반영되게 한다.
  // 너무 잦은 재조회를 막기 위해 최소 재조회 간격을 둔다.
  const [memePool, setMemePool] = React.useState([]);
  React.useEffect(() => {
    let cancelled = false;
    let lastFetchAt = 0;
    const MIN_REFETCH_INTERVAL_MS = 20000;
    const load = () => {
      const now = Date.now();
      if (now - lastFetchAt < MIN_REFETCH_INTERVAL_MS) return;
      lastFetchAt = now;
      fetchMemePoolRest().then(list => { if (!cancelled) setMemePool(list); }).catch(() => {});
    };
    load();
    const onVisibilityOrFocus = () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return;
      load();
    };
    if (typeof document !== 'undefined') document.addEventListener('visibilitychange', onVisibilityOrFocus);
    if (typeof window !== 'undefined') window.addEventListener('focus', onVisibilityOrFocus);
    return () => {
      cancelled = true;
      if (typeof document !== 'undefined') document.removeEventListener('visibilitychange', onVisibilityOrFocus);
      if (typeof window !== 'undefined') window.removeEventListener('focus', onVisibilityOrFocus);
    };
  }, []);
  // id -> poster URL from crawled culture JSON (festivals + performances). Used to enrich
  // already-registered culture anniversaries that were saved before posters were copied.
  const [culturePosterById, setCulturePosterById] = React.useState(() => new Map());
  const culturePosterFetchedRef = React.useRef(false);
  // id -> 종목(genre) from crawled culture-sports.json, same idea as culturePosterById above --
  // backfills getAnniversaryCategoryBadge's per-sport icon for sports anniversaries registered
  // before ann.genre started being saved (handleRegisterCultureEvent), which otherwise stay
  // stuck on the generic ⚽ fallback forever since nothing ever writes the field after creation.
  const [cultureGenreById, setCultureGenreById] = React.useState(() => new Map());
  const cultureGenreFetchedRef = React.useRef(false);
  const customPosterById = React.useMemo(() => {
    const m = new Map();
    (customCultureItems || []).forEach(item => {
      if (!item || !item.id) return;
      const img = item.image ? String(item.image).trim() : '';
      if (img) m.set(item.id, img);
    });
    return m;
  }, [customCultureItems]);
  // Live subcollection state for places/confirmedMeeting (see unionPlaces/unionConfirmedMeetings
  // and the effect below) -- unlike activityLogs (only fetched on-demand for the recovery UI),
  // these two feed many always-visible surfaces (calendar grid badges, summary banners, place
  // map, settlement), so they need a live listener merged into activeCal itself, not a
  // fetch-on-open pattern.
  const [placesSubcollection, setPlacesSubcollection] = React.useState([]);
  const [confirmedMeetingsSubcollection, setConfirmedMeetingsSubcollection] = React.useState([]);
  // Side-menu 정산 badge must not render a fake `0` before the first confirmedMeetings
  // snapshot for this calendar arrives (gallery/chat cold open used to look empty).
  const [meetingsHydrated, setMeetingsHydrated] = React.useState(false);
  React.useEffect(() => {
    setMeetingsHydrated(false);
    setConfirmedMeetingsSubcollection([]);
    setPlacesSubcollection([]);
  }, [activeCalId]);
  // 사진별 댓글 개수(라이트박스 댓글 뱃지용) -- 사진의 mediaKey/refKey를 문서 id로 쓰는
  // calendars/cal_{id}/photoComments 컬렉션을 그대로 구독한다. 댓글이 실제로 달린 사진만
  // 문서가 존재하므로(빈 배열은 안 씀) 컬렉션 크기가 항상 작게 유지된다 -- see the realtime
  // listener below.
  const [photoCommentCounts, setPhotoCommentCounts] = React.useState({});
  const [preloadedPhotoComments, setPreloadedPhotoComments] = React.useState({});
  const [preloadedPhotoCommentsReady, setPreloadedPhotoCommentsReady] = React.useState(false);
  // The badge subscription already receives every small photoComments document. Retain the
  // comment arrays too, so opening a lightbox does not perform several serial document reads.
  const photoCommentStoreRef = React.useRef(null);
  const [chatInput, setChatInput] = React.useState('');
  const [chatParticipantId, setChatParticipantId] = React.useState('');
  const chatParticipantIdRef = React.useRef(chatParticipantId);
  React.useEffect(() => { chatParticipantIdRef.current = chatParticipantId; }, [chatParticipantId]);
  const getCurrentChatParticipantId = () => {
    if (chatParticipantIdRef.current) return chatParticipantIdRef.current;
    return ((window.GATHER_APP_NOTIFICATIONS || {}).getStoredChatParticipantId || (() => undefined))(activeCalId, activeCal);
  };
  const {
    mainNotifPermission,
    setMainNotifPermission,
    mainChatNotifyEnabled,
    setMainChatNotifyEnabled,
    isNotificationHelpOpen,
    setIsNotificationHelpOpen,
    isNotifOnboardingOpen,
    setIsNotifOnboardingOpen,
    notifyChannels,
    setNotifyChannelsState,
    openNotificationHelp,
    handleMainToggleNotifications
  } = useNotificationPwaState({
    React,
    activeCalId,
    firebaseDb,
    chatParticipantId,
    getCurrentParticipantId: getCurrentChatParticipantId,
    showToast
  });
  const [isChatSheetOpen, setIsChatSheetOpen] = React.useState(false);
  const [isChatSubmitting, setIsChatSubmitting] = React.useState(false);
  const [chatUploadProgress, setChatUploadProgress] = React.useState(null);
  const chatTextareaRef = React.useRef(null);
  const [chatImages, setChatImages] = React.useState([]);
  const [chatFileAttachments, setChatFileAttachments] = React.useState([]);
  // The message a reply-in-progress is quoting -- { id, participantId, text, imageCount } | null.
  // Snapshotted from the target message at the moment "답장" is tapped (see ChatRoomView), not
  // kept live, so editing/deleting the original afterward doesn't retroactively change what the
  // reply's quote card shows -- same snapshot-at-reply-time behavior as KakaoTalk/Slack/Discord.
  const [chatReplyTarget, setChatReplyTarget] = React.useState(null);
  const [activeLightbox, setActiveLightbox] = React.useState(null); // { urls: string[], index: number } | null
  const [isGalleryOpen, setIsGalleryOpen] = React.useState(false);
  const [placesInitialQuery, setPlacesInitialQuery] = React.useState('');
  const [placesInitialFocusId, setPlacesInitialFocusId] = React.useState(null);
  const [memoInitialTag, setMemoInitialTag] = React.useState('');
  const [previewSharingMemo, setPreviewSharingMemo] = React.useState(null);
  // Clicking a #해시태그 in the lightbox's image-info panel closes the lightbox and opens the
  // global search prefilled with that tag -- shared by every Lightbox instance in the app.
  // GlobalSearchModal is only mounted in the default (calendar) tree, not in the separate
  // early-returned activeView==='chat' tree, so switching back to 'calendar' first is required
  // for the search modal to actually become visible when a tag is clicked from inside chat.
  const handleSearchTag = tagText => {
    setActiveLightbox(null);
    setGlobalSearchInitialQuery(tagText);
    setIsGlobalSearchOpen(true);
    changeView('calendar');
  };
  const handleParticipantClick = (name, dateStr) => {
    if (dateStr) {
      setSelectedDate(dateStr);
      setIsModalOpen(true);
      return;
    }
    if (name) {
      setPlacesInitialQuery(name);
      changeView('places');
    }
  };
  const [editingMessage, setEditingMessage] = React.useState(null); // {id, participantId, text, imageUrl, thumbUrl, calId}

  const [activeView, setActiveView] = React.useState(() => getInitialAppView(window.location, parseSharePathFromLocation));
  const {
    isMainHeaderVisible,
    mainHeaderHeight,
    mainHeaderRef,
    calendarSectionRef,
    pollsSectionRef,
    pollsExpandSignal,
    setPollsExpandSignal,
    scrollToSection,
    resetMainHeader
  } = useMainHeaderState({ React, activeView, isMainSideMenuOpen });
  const galleryPhotoIndex = useGalleryPhotoIndex({
    React, calendarId: activeCalId, activeView,
    projectId: firebaseConfig.projectId, decodeDocument: firestoreDocumentToJs
  });
  const { fullChatMessages, displayChatMessages, galleryChatMessages, galleryMemos, patchGalleryArchiveMessage, removeGalleryArchiveMessage, patchGalleryArchiveMemo } = useGalleryArchiveState({
    React, activeCalId, activeView, isGlobalSearchOpen, firebaseDb, firebaseConnectionVersion,
    allChatMessages, galleryPreviewMessages, memos, fetchAllChatMessagesRest, fetchCalendarSearchIndex
  });
  // The chat embed the user tapped play on -- { key, embedUrl, provider, orientation, title } |
  // null. Once set, it's rendered through a SINGLE always-mounted portal iframe (StickyVideoBox)
  // that never unmounts across view/tab switches, so playback genuinely never stops -- only its
  // on-screen position changes. Previously this was only promoted when leaving chat (via
  // changeView), which meant the mini player got a brand-new iframe with no autoplay and no
  // relation to the one that had been playing -- i.e. playback actually did stop, just less
  // obviously. Now activation happens the moment the user presses play in chat, and the same
  // iframe DOM node (same React `key`) is reused for the rest of its life.
  const [stickyVideo, setStickyVideo] = React.useState(null);
  const handleActivateChatVideo = React.useCallback(videoInfo => {
    setStickyVideo(videoInfo);
  }, []);

  // Shared "jump to this chat message and highlight it" treatment -- the Lightbox source-jump
  // link, the admin/global search modals' message-open actions, and the ?msg= deep link all
  // funnel through this so every entry point highlights the target bubble exactly like in-chat
  // search's own focused-match style (chat-search-focused-bubble/chat-search-shake, see
  // ChatRoomView's isSearchFocused), instead of each call site rolling its own imperative
  // classList flash shaped like a plain rectangle rather than the actual speech-bubble outline.
  const externalFocusTimeoutRef = React.useRef(null);
  const [externalFocusMsgId, setExternalFocusMsgId] = React.useState(null);
  const focusChatMessage = messageId => {
    const el = document.querySelector(`[data-msg-row-id="${messageId}"]`);
    if (!el) return false;
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    if (externalFocusTimeoutRef.current) clearTimeout(externalFocusTimeoutRef.current);
    // Clear first so re-targeting the same message a second time still re-triggers the shake
    // animation (ChatRoomView keys the focused bubble off this value flipping to a new state).
    setExternalFocusMsgId(null);
    requestAnimationFrame(() => {
      setExternalFocusMsgId(messageId);
      externalFocusTimeoutRef.current = setTimeout(() => setExternalFocusMsgId(null), 1700);
    });
    return true;
  };

  React.useEffect(() => {
    const handleUrlChange = () => {
      setActiveView(getInitialAppView(window.location, parseSharePathFromLocation));
    };
    window.addEventListener('popstate', handleUrlChange);
    return () => window.removeEventListener('popstate', handleUrlChange);
  }, []);

  // Deep-link support: ?date=YYYY-MM-DD auto-opens that date's DateModal on load. Used by the
  // admin 통합검색결과 page so clicking a 일정/정산 search result can open a new tab that lands
  // directly on the matched date instead of just the calendar's home screen.
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const dateParam = params.get('date');
    if (dateParam && isValidDateString(dateParam)) {
      setSelectedDate(dateParam);
      setIsModalOpen(true);
    }
  }, []);

  useBrowserUiCompatibility(React);

  const changeView = (view) => {
    if (view === 'settlement'
      && !(window.GATHER_UI_COMPONENTS
        && typeof window.GATHER_UI_COMPONENTS.SettlementSummaryModal === 'function')) {
      if (typeof window.__gatherLoadEventUi === 'function') {
        window.__gatherLoadEventUi().then(() => changeView(view)).catch(error => {
          console.error('Settlement UI load failed:', error);
          showToast('정산 화면을 불러오지 못했습니다. 다시 시도해 주세요.', 'error');
        });
      }
      return;
    }
    if ((view === 'chat' || view === 'gallery')
      && !(window.GATHER_UI_COMPONENTS
        && typeof window.GATHER_UI_COMPONENTS.ChatRoomView === 'function'
        && typeof window.GATHER_UI_COMPONENTS.ChatGalleryModal === 'function')) {
      if (typeof window.__gatherLoadChatUi === 'function') {
        window.__gatherLoadChatUi().then(() => changeView(view)).catch(error => {
          console.error('Chat UI load failed:', error);
          showToast('채팅 화면을 불러오지 못했습니다. 다시 시도해 주세요.', 'error');
        });
      }
      return;
    }
    if ((view === 'memo' || view === 'places')
      && !(window.GATHER_UI_COMPONENTS
        && typeof window.GATHER_UI_COMPONENTS[view === 'memo' ? 'MemoView' : 'PlacesView'] === 'function')) {
      if (typeof window.__gatherLoadViewUi === 'function') {
        window.__gatherLoadViewUi(view).then(() => changeView(view)).catch(error => {
          console.error(`${view} UI load failed:`, error);
          showToast(`${view === 'memo' ? '메모' : '장소'} 화면을 불러오지 못했습니다. 다시 시도해 주세요.`, 'error');
        });
      }
      return;
    }
    // No sticky-video promotion needed here anymore -- stickyVideo (once set by actually pressing
    // play in chat, see handleActivateChatVideo) stays active across every view by itself, always
    // floating as PIP (see StickyVideoBox).
    setActiveView(view);
    if (view === 'chat') chatHeaderRevealUntilRef.current = Date.now() + 900;
    // Each view owns its header. Restore it before mounting the next view so a hidden main
    // header cannot leave the new view's menu button translated outside the viewport.
    setIsHeaderVisible(true);
    if (view !== 'chat') {
      resetMainHeader();
      requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'auto' }));
    }
    window.history.pushState({}, '', buildAppViewUrl(window.location, view, currentMonthDate));
  };
  const syncCurrentMonthInUrl = nextDate => {
    if (!(nextDate instanceof Date) || Number.isNaN(nextDate.getTime())) return;
    const params = new URLSearchParams(window.location.search);
    const keepId = params.get('id') || params.get('cal');
    params.delete('id');
    params.delete('cal');
    if (keepId) params.set('id', keepId);
    params.set('year', String(nextDate.getFullYear()));
    params.set('month', String(nextDate.getMonth() + 1).padStart(2, '0'));
    const qs = params.toString();
    const newUrl = qs ? `${window.location.pathname}?${qs}` : window.location.pathname;
    window.history.replaceState({}, '', newUrl);
  };
  const setCurrentMonthAndSync = nextDate => {
    setCurrentMonthDate(nextDate);
    syncCurrentMonthInUrl(nextDate);
  };
  const restoreActiveCalendarFromCache = React.useCallback(() => {
    if (!isAllowedCalendarId(activeCalId)) return false;
    const cached = loadLocalCache();
    const cachedCal = Array.isArray(cached) ? cached.find(c => c && c.id === activeCalId) : null;
    if (!isUsableCalendarRecord(cachedCal)) return false;
    let restored = false;
    setCalendarsState(prevCals => {
      const current = (prevCals || []).find(c => c && c.id === activeCalId);
      if (isUsableCalendarRecord(current)) return prevCals;
      restored = true;
      const nextCal = cloneCalendar(cachedCal);
      const nextCals = Array.isArray(prevCals) && prevCals.some(c => c && c.id === activeCalId)
        ? prevCals.map(c => c && c.id === activeCalId ? nextCal : c)
        : [nextCal, ...(Array.isArray(prevCals) ? prevCals : [])];
      calendarsRef.current = nextCals;
      return nextCals;
    });
    return restored || true;
  }, [activeCalId]);

  const applyCalendarSnapshot = React.useCallback((cloudCal, cloudLastMod = Date.now(), cloudRevision = 0, forceApply = false) => {
    if (!cloudCal || cloudCal.id !== activeCalId) return false;
    if (forceApply && isSavingRef.current) return false;
    const incomingRevision = Number(cloudRevision || 0) || 0;
    const currentMetaRevision = getMetaRevision(serverRevisionRef.current, activeCalId);
    if (!forceApply) {
      if (incomingRevision > 0 && currentMetaRevision > 0 && incomingRevision < currentMetaRevision) return false;
      if (incomingRevision <= 0 && cloudLastMod < getMetaLastModified(serverRevisionRef.current, activeCalId)) return false;
    } else if (cloudLastMod < (localWriteStartedAtRef.current[activeCalId] || 0)) return false;
    setIsInitialDataLoading(false);
    setCalendarsState(prevCals => {
      const list = Array.isArray(prevCals) ? prevCals : [];
      const hasExisting = list.some(c => c && c.id === activeCalId);
      const nextCals = hasExisting
        ? list.map(c => c && c.id === activeCalId ? cloneCalendar(cloudCal) : c)
        : [cloneCalendar(cloudCal), ...list];
      saveLocalCache(nextCals);
      serverRevisionRef.current = updateMetaLastModified(serverRevisionRef.current, activeCalId, cloudLastMod || 0);
      if (incomingRevision > 0) {
        serverRevisionRef.current = updateMetaRevision(serverRevisionRef.current, activeCalId, incomingRevision);
      }
      saveLocalMeta(serverRevisionRef.current);
      return nextCals;
    });
    return true;
  }, [activeCalId]);

  // Firebase Firestore Real-Time Listener (ISOLATED per activeCalId)
  React.useEffect(() => subscribeCalendarBootstrap({
    firebaseDb,
    activeCalId,
    calendarsRef,
    restoreActiveCalendarFromCache,
    isUsableCalendarRecord,
    setIsInitialDataLoading,
    fetchSingleCloudCalendar,
    loadMaxAttempts: FIREBASE_LOAD_MAX_ATTEMPTS,
    loadTimeoutMs: FIREBASE_LOAD_TIMEOUT_MS,
    applyCalendarSnapshot,
    getMetaRevision,
    getMetaLastModified,
    serverRevisionRef,
    isSavingRef,
    pendingRemoteSnapshotRef,
    getCloudDocCalendar,
    setSyncDiag,
    setCloudReloadToken
  }), [activeCalId, cloudReloadToken, firebaseConnectionVersion, restoreActiveCalendarFromCache, applyCalendarSnapshot]);

  // Mobile browsers routinely freeze a tab while it is backgrounded. Firestore can then
  // resume with a cached snapshot without promptly reopening its listen stream. Recreating
  // this calendar listener on return to the foreground also runs the existing source:'server'
  // fallback, so a user never needs DevTools/Clear Storage just to recover a fresh document.
  React.useEffect(() => subscribeFirestoreForegroundRecovery({
    activeCalId,
    getFirebaseDb: () => firebaseDb,
    isSavingRef,
    setCloudReloadToken
  }), [activeCalId]);

  React.useEffect(() => watchFirebaseBootstrap({
    getFirebaseDb: () => firebaseDb,
    getRetryExhausted: () => firebaseRetryExhausted,
    getInitError: () => firebaseInitError
  }), []);
  const activeCalLoaded = calendars.some(c => c && c.id === activeCalId && isUsableCalendarRecord(c));
  const activeCalendarFromState = calendars.find(c => c.id === activeCalId);
  const lastUsableActiveCalendarRef = React.useRef(null);
  if (isUsableCalendarRecord(activeCalendarFromState)) {
    lastUsableActiveCalendarRef.current = cloneCalendar(activeCalendarFromState);
  }
  const rawActiveCal = isUsableCalendarRecord(activeCalendarFromState)
    ? activeCalendarFromState
    : (lastUsableActiveCalendarRef.current?.id === activeCalId
      ? lastUsableActiveCalendarRef.current
      : createLoadingCalendarShell(activeCalId));
  // Merges the live places/confirmedMeetings subcollections into whatever's still embedded on
  // the calendar document itself (legacy entries not yet migrated -- see unionPlaces/
  // unionConfirmedMeetings and the self-healing migration in pushSingleCloudCalendar/
  // pushSingleCalendarWithRest). Every consumer of `activeCal` below -- rendering AND the
  // handleSavePlace/handleConfirmMeeting-family handlers' own "existing entries" lookups --
  // sees the merged view for free from this single point, rather than needing every call site
  // updated individually.
  const activeCal = React.useMemo(() => ({
    ...rawActiveCal,
    places: unionPlaces(rawActiveCal, placesSubcollection),
    confirmedMeeting: unionConfirmedMeetings(rawActiveCal, confirmedMeetingsSubcollection)
  }), [rawActiveCal, placesSubcollection, confirmedMeetingsSubcollection]);
  const meetingPhotoMessageIds = React.useMemo(() => getMeetingOwnedPhotoMessageIds(activeCal), [activeCal]);
  // Mirrors meetingPhotoMessageIds for effects that need its latest value without depending on
  // (and being restarted by) its object identity, which changes on essentially every realtime
  // listener tick since it's derived from `activeCal` -- see the chat-preview hydration effect.
  const meetingPhotoMessageIdsRef = React.useRef(meetingPhotoMessageIds);
  meetingPhotoMessageIdsRef.current = meetingPhotoMessageIds;
  const visibleChatMessages = React.useMemo(() => {
    return allChatMessages.filter(msg => isChatRenderableMessage(msg, meetingPhotoMessageIds));
  }, [allChatMessages, meetingPhotoMessageIds]);
  const recentMessages = React.useMemo(() => visibleChatMessages.slice(-5).reverse(), [visibleChatMessages]);
  // `totalChatCount` (server-side aggregate) only excludes messages whose OWN `uploadSource`
  // field is 'meeting'/'gallery' -- see fetchSubcollectionCount's excludeUploadSources option.
  // A photo originally posted as a normal chat message and only later linked into a confirmed
  // meeting's photo album (handleConfirmMeeting matches by sourceMessageId, it never rewrites
  // the original message doc's uploadSource) keeps its non-meeting uploadSource, so the server
  // count still includes it -- but isChatRenderableMessage/meetingPhotoMessageIds filters it out
  // of every rendered chat list on the client. For a calendar whose chat is mostly/entirely such
  // promoted photos this made the main-screen preview widget's "totalChatCount > 0 but nothing to
  // show" branch permanently true (stuck on "최근 채팅을 불러오는 중…" forever, since retrying the
  // fetch just keeps re-discovering the same already-linked, already-hidden messages). Correct
  // the count locally by subtracting the meeting-linked set, which is already known for free from
  // `activeCal` without any extra fetch.
  const visibleTotalChatCount = typeof totalChatCount === 'number'
    ? Math.max(0, totalChatCount - meetingPhotoMessageIds.size)
    : totalChatCount;
  // Mirrors visibleTotalChatCount for the hydration-retry effect below, which must NOT restart
  // every time this number changes -- see that effect for why.
  const visibleTotalChatCountRef = React.useRef(visibleTotalChatCount);
  visibleTotalChatCountRef.current = visibleTotalChatCount;
  const canUseSettlement = !!(activeCal && isSettlementEnabledCalendarId(activeCal.id || activeCalId));
  const syncStatus = saveSyncState;
  React.useEffect(() => {
    if (activeView !== 'settlement') return;
    if (!activeCalId || canUseSettlement) return;
    if (typeof showToast === 'function') {
      showToast('이 캘린더에서는 정산을 사용할 수 없습니다.', 'info');
    }
    changeView('calendar');
  }, [activeView, activeCalId, canUseSettlement, changeView, showToast]);
  React.useEffect(() => subscribeAppResumeRefresh({
    activeCalId,
    activeCalLoaded,
    activeView,
    firebaseDb,
    isAllowedCalendarId,
    isSavingRef,
    localWriteStartedAtRef,
    fetchSingleCalendarWithRest,
    applyCalendarSnapshot,
    fetchMemosRest,
    memosLimit,
    setMemos,
    setHasMoreMemos,
    restoreActiveCalendarFromCache,
    setIsInitialDataLoading,
    setCloudReloadToken
  }), [activeCalId, activeCalLoaded, activeView, applyCalendarSnapshot, memosLimit, restoreActiveCalendarFromCache]);
  // The chat message listener below only re-subscribes on [activeCalId], so without this ref it
  // would keep using the activeCal snapshot from whenever that effect last ran -- meaning a
  // participant added (or the calendar renamed) mid-session wouldn't be reflected in incoming
  // chat notifications (sender shows "알수없음", title stays the old name) until activeCalId
  // itself changes. Mirrors the chatParticipantIdRef pattern used the same way above.
  const activeCalRef = React.useRef(activeCal);
  React.useEffect(() => { activeCalRef.current = activeCal; }, [activeCal]);

  // Lightweight client-side error monitoring: without this, a bug that fails silently in
  // someone's browser is invisible to us unless they think to report it. Reuses the existing
  // serverAuditLogs pipeline (queueServerAuditEvent -> auditEvent Cloud Function, already
  // rate-limited server-side) instead of adding a new third-party service/account -- these
  // show up in the admin 감사 로그 tab as action "client_error", same place as every other
  // audit event. Registered once for the page's lifetime, not per calendar.
  React.useEffect(() => {
    const reportClientError = (message, extra) => {
      const calId = activeCalRef.current?.id || 'unknown';
      const note = sanitizeText(`${message || '알 수 없는 오류'} ${extra || ''}`.trim(), 200);
      queueServerAuditEvent(calId, 'client_error', note, getClientAuditContext());
    };
    const onError = (event) => {
      reportClientError(event?.message, event?.filename ? `@${event.filename}:${event.lineno || ''}` : '');
    };
    const onRejection = (event) => {
      const reason = event?.reason;
      reportClientError(reason?.message || String(reason || '').slice(0, 160));
    };
    window.addEventListener('error', onError);
    window.addEventListener('unhandledrejection', onRejection);
    return () => {
      window.removeEventListener('error', onError);
      window.removeEventListener('unhandledrejection', onRejection);
    };
  }, []);

  React.useEffect(() => {
    if (activeCal) {
      const calTitle = `${activeCal.title} 캘린더`;
      const calDesc = activeCal.description || `${activeCal.title} 사모임 멤버들의 참석 가능 날짜 조율 캘린더입니다.`;
      const currentShareUrl = getCalendarShareUrl(activeCal.id);
      document.title = calTitle;
      const ogTitle = document.getElementById('og-title');
      if (ogTitle) ogTitle.setAttribute('content', calTitle);
      const ogDesc = document.getElementById('og-desc');
      if (ogDesc) ogDesc.setAttribute('content', calDesc);
      const ogUrl = document.getElementById('og-url');
      if (ogUrl) ogUrl.setAttribute('content', currentShareUrl);
      const twTitle = document.getElementById('tw-title');
      if (twTitle) twTitle.setAttribute('content', calTitle);
      if (window.location.pathname.includes('/share/')) {
        window.history.replaceState({}, '', currentShareUrl);
      }
      // Only once real data has loaded -- activeCal is otherwise createLoadingCalendarShell's
      // placeholder, and installing under "Firebase에서 실시간..." would be worse than not
      // swapping the manifest at all yet.
      if (activeCalLoaded) {
        applyDynamicManifest(activeCal);
        // iOS Safari's "홈 화면에 추가" reads this meta tag for the installed icon's label --
        // it doesn't consult the manifest at all, so it needs the same per-calendar update.
        const appleTitle = document.querySelector('meta[name="apple-mobile-web-app-title"]');
        if (appleTitle) appleTitle.setAttribute('content', activeCal.title);
      }
    }
  }, [activeCal, activeCalLoaded]);

  // Local schedule reminder: D-day anytime, or D-1 after 18:00 local, for confirmed meetings
  // and type:repeat anniversary occurrences. Best-effort while the tab is open -- server push
  // at 18:00 KST (sendEveScheduleReminders) covers devices that aren't open.
  React.useEffect(() => {
    if (!activeCalLoaded || !activeCal) return;
    const meetings = getTrulyConfirmedMeetings(activeCal);
    const now = new Date();
    const toDateStr = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const todayStr = toDateStr(now);
    const tomorrowStr = toDateStr(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1));
    const hour = now.getHours();
    const candidates = [];
    const todayMeeting = meetings.find(m => m.date === todayStr);
    if (todayMeeting) candidates.push({ kind: 'meeting', meeting: todayMeeting, whenLabel: '오늘', key: todayMeeting.date });
    if (hour >= 18) {
      const tomorrowMeeting = meetings.find(m => m.date === tomorrowStr);
      if (tomorrowMeeting) candidates.push({ kind: 'meeting', meeting: tomorrowMeeting, whenLabel: '내일', key: tomorrowMeeting.date });
    }
    const annList = Array.isArray(anniversaries) ? anniversaries : [];
    const collectRepeats = (dateStr, whenLabel) => {
      getAnniversariesForDate(dateStr, annList).filter(a => a && a.type === 'repeat').forEach(ann => {
        candidates.push({ kind: 'repeat', ann, whenLabel, date: dateStr, key: `repeat_${ann.id}_${dateStr}` });
      });
    };
    collectRepeats(todayStr, '오늘');
    if (hour >= 18) collectRepeats(tomorrowStr, '내일');
    candidates.forEach(target => {
      const shownKey = `gather_meeting_reminder_shown_${activeCal.id}_${target.key}_${todayStr}_v1`;
      if (getLocalStorage().getItem(shownKey)) return;
      getLocalStorage().setItem(shownKey, '1');
      if (target.kind === 'meeting') {
        const fallbackMessage = notifyMeetingReminder(activeCal, target.meeting, target.whenLabel);
        if (fallbackMessage) showToast(fallbackMessage, 'success');
      } else if (typeof notifyRepeatScheduleReminder === 'function') {
        const fallbackMessage = notifyRepeatScheduleReminder(activeCal, target.ann, target.whenLabel, target.date);
        if (fallbackMessage) showToast(fallbackMessage, 'success');
      }
    });
  }, [activeCal?.id, activeCalLoaded, activeCal?.confirmedMeeting, anniversaries]);

  // Synchronize chatParticipantId when activeCal changes (loads cached participant or defaults to first active)
  React.useEffect(() => {
    if (activeCal) {
      setChatParticipantId(((window.GATHER_APP_NOTIFICATIONS||{}).getStoredChatParticipantId||(()=>undefined))(activeCalId, activeCal));
    }
  }, [activeCalId, calendars]);

  // Tracks the last time the chat onSnapshot listener actually delivered a snapshot (own writes,
  // someone else's writes, or the initial history load all count). The watchdog effect below
  // compares against this to detect a listener that has silently stopped receiving updates --
  // a known field failure mode (see the long-polling notes above attemptFirebaseInit) where the
  // realtime stream goes quiet while everything else keeps working, so creates/edits/deletes and
  // other participants' messages stop showing up until a manual reload.
  const lastChatSnapshotAtRef = React.useRef(0);

  // Render the newest five messages first. On capable networks, widen the realtime window after
  // the critical first paint; on save-data/2G/3G connections keep the compact window and let the
  // existing cursor-based "older messages" control fetch history in small pages on demand.
  React.useEffect(() => {
    setChatLiveLimit(CHAT_INITIAL_MESSAGE_LIMIT);
    if (activeView !== 'chat') return undefined;
    const connection = typeof navigator !== 'undefined'
      ? (navigator.connection || navigator.mozConnection || navigator.webkitConnection)
      : null;
    const effectiveType = String(connection?.effectiveType || '').toLowerCase();
    const constrained = Boolean(connection?.saveData) || effectiveType === 'slow-2g' || effectiveType === '2g' || effectiveType === '3g';
    if (constrained) return undefined;
    const timer = setTimeout(() => setChatLiveLimit(CHAT_LIVE_MESSAGE_LIMIT), 700);
    return () => clearTimeout(timer);
  }, [activeCalId, activeView, CHAT_INITIAL_MESSAGE_LIMIT]);

  // Real-time messages listener
  // Full window on chat/gallery. The main-screen preview (else branch) used to query only
  // CHAT_INITIAL_MESSAGE_LIMIT (5) raw docs -- but this listener's query orders by raw
  // `timestamp` with no way to exclude meeting/gallery-linked photos at the query level (that
  // filter is client-only, see isChatRenderableMessage/meetingPhotoMessageIds -- a photo
  // promoted into a confirmed meeting's album keeps its original non-meeting uploadSource on
  // its own doc). So on a calendar whose 5 most recent raw messages happen to all be such
  // promoted photos, every single snapshot from this always-subscribed listener kept resetting
  // chatMessages to an all-filtered-out list, permanently re-triggering (and then immediately
  // stomping) the separate hydration-retry effect below -- the widget could never settle on
  // real content and stayed on "최근 채팅을 불러오는 중…" no matter how long you waited.
  // The chat room gets a wider raw window because a calendar can have a long run of hidden
  // gallery/meeting uploads at the head of the collection. The calendar preview remains bounded.
  React.useEffect(() => {
    if (!activeCalId) {
      setChatMessages([]);
      return;
    }
    const chatLimit = activeView === 'chat'
      ? Math.max(chatLiveLimit, 60)
      : activeView === 'gallery' ? Math.min(12, CHAT_LIVE_MESSAGE_LIMIT) : CHAT_LIVE_MESSAGE_LIMIT;
    if (!firebaseDb) {
      // No live SDK channel at all (not just a stalled stream -- see the watchdog below for
      // that case) -- without this poll, a device stuck on this path never saw the other
      // participant's messages until a manual reload, since fetchRecentChatMessages only ran
      // once per mount/dependency change.
      let cancelled = false;
      const poll = () => {
        if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return;
        fetchRecentChatMessages(activeCalId, chatLimit).then(list => {
          if (!cancelled) setChatMessages(list);
        });
      };
      poll();
      const pollTimer = setInterval(poll, 6000);
      return () => { cancelled = true; clearInterval(pollTimer); };
    }
    let isMounted = true;
    // Reset the watchdog clock on every (re)subscribe so it waits a full grace period for this
    // fresh listener's own first snapshot instead of immediately judging it stale.
    lastChatSnapshotAtRef.current = Date.now();

    // Subscribe to chat room history. Queried newest-first + limit so the window
    // tracks the most recent messages as new ones arrive, then reversed back to
    // ascending order for rendering.
    let hasSeenInitialChatSnapshot = false;
    let lastNotifiedMessageId = null;
    const unsubscribeChat = subscribeMessages(activeCalId, {
      where: ['uploadSource', '==', 'chat'],
      orderBy: 'timestamp', direction: 'desc', limit: chatLimit
    }, snapshot => {
        if (!isMounted) return;
        lastChatSnapshotAtRef.current = Date.now();
        const list = [];
        snapshot.forEach(doc => {
          list.push(slimMessageForClient({ id: doc.id, ...doc.data() }));
        });
        list.reverse();
        setChatMessages(list);
        invalidateGalleryItemCount(activeCalId);

        // Browser notification for a genuinely new incoming message from someone else --
        // skip the very first snapshot (that's just the existing history loading, not a
        // new message) and skip anything sent by the current participant themselves.
        const latest = list[list.length - 1];
        if (hasSeenInitialChatSnapshot && latest && latest.id !== lastNotifiedMessageId
          && latest.participantId !== chatParticipantIdRef.current) {
          const sender = getActiveParticipants(activeCalRef.current).find(p => p.id === latest.participantId);
          notifyNewChatMessage(activeCalRef.current, latest, sender?.name || '알수없음');
        }
        hasSeenInitialChatSnapshot = true;
        if (latest) lastNotifiedMessageId = latest.id;
      }, err => {
        console.warn(`Firestore chat history subscription error:`, err);
        queueServerAuditEvent(activeCalId, 'realtime_fallback', `messages:${String(err?.code || 'unknown')}`, getClientAuditContext());
        fetchRecentChatMessages(activeCalId, chatLimit).then(list => {
          if (isMounted) setChatMessages(list);
        });
      });

    return () => {
      isMounted = false;
      if (unsubscribeChat) unsubscribeChat();
    };
  // Re-run when the Firebase bootstrap/retry loop recovers the SDK after the first
  // render. Without this dependency, a page that initially fell back to REST never
  // attached onSnapshot until a full reload, so messages from other users appeared
  // only after refreshing.
  }, [activeCalId, activeView, chatLiveLimit, firebaseDb, firebaseConnectionVersion, CHAT_INITIAL_MESSAGE_LIMIT]);

  // Gallery media has its own unscoped live window. Keeping this separate from the channel-
  // scoped chat listener prevents photo uploads from displacing the main screen's recent chat,
  // while the gallery still receives other participants' new gallery/meeting uploads live.
  React.useEffect(() => {
    if (!activeCalId || activeView !== 'gallery' || !firebaseDb) {
      setGalleryLiveMessages([]);
      return undefined;
    }
    let mounted = true;
    const unsubscribe = subscribeMessages(activeCalId, {
      orderBy: 'timestamp', direction: 'desc', limit: CHAT_LIVE_MESSAGE_LIMIT
    }, snapshot => {
      if (!mounted) return;
      const list = [];
      snapshot.forEach(doc => list.push(slimMessageForClient({ id: doc.id, ...doc.data() })));
      list.reverse();
      setGalleryLiveMessages(list);
    }, err => console.warn('Firestore gallery media subscription error:', err));
    return () => {
      mounted = false;
      if (unsubscribe) unsubscribe();
    };
  }, [activeCalId, activeView, firebaseDb, firebaseConnectionVersion]);

  // Chat listener watchdog: self-heals a silently stalled onSnapshot stream. Checks periodically
  // whether the listener above has gone quiet for too long and, if so, pulls the same recent
  // window directly (SDK read with a REST fallback baked into fetchRecentChatMessages) and
  // reconciles it into local state -- picking up creates/edits/deletes and other participants'
  // messages without requiring a manual page reload. Cheap while the listener is healthy (the
  // timestamp keeps getting refreshed by real snapshots, so the check below is a no-op almost
  // every tick); only starts actually re-fetching once the stream has genuinely stopped.
  React.useEffect(() => {
    if (!activeCalId || !firebaseDb) return undefined;
    const chatLimit = activeView === 'chat' ? Math.max(chatLiveLimit, 60) : CHAT_INITIAL_MESSAGE_LIMIT;
    // Tightened from 9000/5000: on a connection where the realtime stream never recovers (see
    // the long-polling notes above attemptFirebaseInit), this fallback is the only thing that
    // ever shows the other participant's message, and 9-14s felt like "it's broken" in a chat UI.
    const STALE_AFTER_MS = 4000;
    const CHECK_INTERVAL_MS = 2000;
    let isMounted = true;
    let reconciling = false;
    const reconcile = async () => {
      if (reconciling) return;
      reconciling = true;
      try {
        const fresh = await fetchRecentChatMessages(activeCalId, chatLimit);
        if (!isMounted || !Array.isArray(fresh) || fresh.length === 0) return;
        const freshIds = new Set(fresh.map(m => m.id));
        const oldestFreshTimestamp = Number(fresh[0].timestamp) || 0;
        setChatMessages(prev => {
          const keepOlder = prev.filter(m => !freshIds.has(m.id) && (Number(m.timestamp) || 0) < oldestFreshTimestamp);
          const merged = [...keepOlder, ...fresh];
          merged.sort((a, b) => (Number(a.timestamp) || 0) - (Number(b.timestamp) || 0) || String(a.id || '').localeCompare(String(b.id || '')));
          return merged;
        });
        invalidateGalleryItemCount(activeCalId);
      } catch (err) {
        console.warn('Chat listener watchdog reconcile notice:', err);
      } finally {
        // Whether or not the fetch found anything new, treat a completed reconcile as "caught
        // up" so the watchdog doesn't hammer the network every single tick while the realtime
        // stream stays stuck -- it'll try again after another full stale interval.
        lastChatSnapshotAtRef.current = Date.now();
        reconciling = false;
      }
    };
    const timer = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return;
      if (Date.now() - lastChatSnapshotAtRef.current > STALE_AFTER_MS) void reconcile();
    }, CHECK_INTERVAL_MS);
    // Some mobile browsers (observed on Samsung Internet) suspend the page's timers and the
    // Firestore onSnapshot stream together while backgrounded, then resume the tab without
    // promptly redelivering a fresh snapshot -- the periodic check above can then sit waiting
    // up to CHECK_INTERVAL_MS behind a `lastChatSnapshotAtRef` that never advanced while hidden,
    // and in practice never catches up until a manual reload. Reconciling immediately the moment
    // the page becomes visible again -- rather than only on the next interval tick -- closes
    // that gap; it's cheap when the stream was actually healthy since `reconciling` is a no-op.
    const handleVisible = () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') void reconcile();
    };
    document.addEventListener('visibilitychange', handleVisible);
    return () => {
      isMounted = false;
      clearInterval(timer);
      document.removeEventListener('visibilitychange', handleVisible);
    };
  }, [activeCalId, activeView, chatLiveLimit, firebaseDb, CHAT_INITIAL_MESSAGE_LIMIT]);

  // Anniversaries: full collection (no orderBy) + client sort so docs without createdAt still show.
  // Also active on history (보관함) so culture/festival "캘린더와 연동" checkboxes can resolve
  // cultureSourceId matches without requiring a prior visit to the calendar view this session.
  // 컨텐츠 페이지(지역축제/문화행사/스포츠/영화 탭)의 selfAuthoredCultureItems/orphanedSourceItems
  // (ui-summary-gallery.js)도 이 anniversaries 데이터가 있어야 기념일 등록으로 직접 만든 항목과,
  // 크롤링 피드에서 빠졌지만 등록은 살아있는 항목("개별등록")을 찾아낼 수 있다. 'content'가
  // 빠져 있으면, 캘린더/보관함을 먼저 들르지 않고 컨텐츠 페이지로 곧장 들어온 세션(북마크,
  // onFocusCultureSource 이동, PWA 바로가기 등)에서는 anniversaries가 아예 로드되지 않아 그런
  // 항목들이 통째로 안 보였다 -- 새로고침 후 캘린더부터 방문하면 다시 로드되어 "고치면 잠깐
  // 보이고 다시 안 보인다"처럼 보이는 원인 중 하나.
  const needsAnniversariesData = React.useMemo(
    () => activeView === 'calendar' || activeView === 'history' || activeView === 'content',
    [activeView]
  );
  React.useEffect(() => {
    if (!activeCalId || !needsAnniversariesData) return;
    let isMounted = true;
    const sortAnns = list => {
      const arr = Array.isArray(list) ? list.slice() : [];
      arr.sort((a, b) => (Number(b.createdAt) || Number(b.updatedAt) || 0) - (Number(a.createdAt) || Number(a.updatedAt) || 0));
      return arr;
    };
    const applyList = (list, preserveExisting = false) => {
      if (!isMounted) return;
      const arr = Array.isArray(list) ? list : [];
      setAnniversaries(prev => {
        const prevById = new Map((Array.isArray(prev) ? prev : []).filter(item => item?.id).map(item => [item.id, item]));
        const hydrated = arr.map(item => preserveAnniversaryCurationFields(prevById.get(item?.id), item));
        let merged = hydrated;
        if (preserveExisting) {
          const seen = new Set(hydrated.map(item => item?.id).filter(Boolean));
          const existing = Array.isArray(prev) ? prev.filter(item => item?.id && !seen.has(item.id)) : [];
          merged = [...hydrated, ...existing];
        }
        return sortAnns(merged);
      });
    };
    if (!firebaseDb) {
      fetchAnniversariesRest(activeCalId).then(list => {
        if (Array.isArray(list) && list.length > 0) applyList(list);
      }).catch(() => {});
      return () => { isMounted = false; };
    }
    // A years-old family calendar's anniversaries collection only ever grows, and the plain
    // subscribeAnniversaries() listener below has no limit -- every single reconnect (a phone
    // waking up, a network handoff, a fresh tab) re-reads the ENTIRE collection from scratch,
    // regardless of how little actually changed. Same fix already applied to customCultureItems:
    // hydrate the complete archive once via REST, then attach a listener bounded to just the
    // newest documents to catch live edits/additions, merging (never replacing) into local state
    // so older entries hydrated via REST are never dropped.
    fetchAnniversariesRest(activeCalId).then(list => {
      if (Array.isArray(list) && list.length > 0) applyList(list);
    }).catch(err => console.warn('Anniversaries archive hydration failed:', err));
    // orderBy(createdAt) is safe ONLY for this bounded recent-window listener -- legacy docs
    // missing createdAt (excluded by this orderBy) are already covered by the REST hydration
    // above, which sorts client-side instead of relying on the field being present.
    const unsub = firebaseDb.collection('calendars').doc(`cal_${activeCalId}`).collection('anniversaries')
      .orderBy('createdAt', 'desc').limit(200)
      .onSnapshot(snapshot => {
        if (!isMounted) return;
        const list = [];
        snapshot.forEach(doc => list.push({ id: doc.id, ...doc.data() }));
        applyList(list, true);
      }, err => {
        console.warn(`Firestore anniversaries subscription error:`, err);
        fetchAnniversariesRest(activeCalId).then(list => {
          if (Array.isArray(list) && list.length > 0) applyList(list);
        }).catch(fallbackErr => console.warn('Anniversaries REST fallback failed:', fallbackErr));
      });
    return () => { isMounted = false; unsub(); };
  }, [activeCalId, needsAnniversariesData, firebaseDb, firebaseConnectionVersion]);

  // Patches local state immediately after a confirmed-successful write instead of waiting on
  // the realtime listener above. A write that falls through to the REST fallback (see
  // writeCollectionDocumentWithFallback) never touches the Firestore SDK's own local persistence
  // cache, so if that listener's live connection is stuck (a blocked/throttled WebChannel, seen
  // on some browsers/networks), it can keep serving the stale cache indefinitely -- surviving
  // even a full page reload, since IndexedDB persistence carries the stale snapshot across reloads.
  const handleAnniversarySaved = (annData) => {
    if (!annData?.id) return;
    setAnniversaries(prev => {
      const list = Array.isArray(prev) ? prev.slice() : [];
      const idx = list.findIndex(a => a.id === annData.id);
      if (idx >= 0) list[idx] = preserveAnniversaryCurationFields(list[idx], { ...list[idx], ...annData });
      else list.unshift(annData);
      list.sort((a, b) => (Number(b.createdAt) || Number(b.updatedAt) || 0) - (Number(a.createdAt) || Number(a.updatedAt) || 0));
      return list;
    });
  };
  const handleAnniversaryDeleted = (annId) => {
    if (!annId) return;
    setAnniversaries(prev => (Array.isArray(prev) ? prev.filter(a => a.id !== annId) : []));
  };

  // One-time fetch of crawled culture posters when any culture-linked anniversary lacks photos.
  React.useEffect(() => {
    const missing = (anniversaries || []).some(a => {
      if (!a || !a.cultureSourceId) return false;
      const hasPhotos = Array.isArray(a.photos) && a.photos.length > 0;
      const hasImage = !!(a.image && String(a.image).trim());
      if (hasPhotos || hasImage) return false;
      if (customPosterById.has(a.cultureSourceId)) return false;
      if (culturePosterById.has(a.cultureSourceId)) return false;
      return true;
    });
    if (!missing || culturePosterFetchedRef.current) return;
    culturePosterFetchedRef.current = true;
    let cancelled = false;
    const base = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.BASE_URL) || '/';
    const urls = [`${base}data/culture-festivals.json`, `${base}data/culture-performances.json`];
    Promise.all(urls.map(u => fetch(u).then(r => (r.ok ? r.json() : null)).catch(() => null))).then(results => {
      if (cancelled) return;
      setCulturePosterById(prev => {
        const next = new Map(prev);
        (results || []).forEach(data => {
          const items = Array.isArray(data && data.items) ? data.items : [];
          items.forEach(it => {
            if (!it || !it.id) return;
            const img = it.image ? String(it.image).trim() : '';
            if (img && !next.has(it.id)) next.set(it.id, img);
          });
        });
        return next;
      });
    });
    return () => { cancelled = true; };
  }, [anniversaries, customPosterById, culturePosterById]);

  // One-time fetch of crawled culture-sports genres, to backfill ann.genre in-memory for sports
  // anniversaries that predate handleRegisterCultureEvent saving it (see cultureGenreById above).
  React.useEffect(() => {
    const missing = (anniversaries || []).some(a => (
      a && a.category === 'sports' && a.cultureSourceId && !a.genre && !cultureGenreById.has(a.cultureSourceId)
    ));
    if (!missing || cultureGenreFetchedRef.current) return;
    cultureGenreFetchedRef.current = true;
    let cancelled = false;
    const base = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.BASE_URL) || '/';
    fetch(`${base}data/culture-sports.json`).then(r => (r.ok ? r.json() : null)).catch(() => null).then(data => {
      if (cancelled || !data) return;
      const items = Array.isArray(data.items) ? data.items : [];
      setCultureGenreById(prev => {
        const next = new Map(prev);
        items.forEach(it => {
          if (!it || !it.id) return;
          const genre = it.genre ? String(it.genre).trim() : '';
          if (genre && !next.has(it.id)) next.set(it.id, genre);
        });
        return next;
      });
    });
    return () => { cancelled = true; };
  }, [anniversaries, cultureGenreById]);

  // In-memory poster/genre enrichment for DateModal / calendar display (no Firestore rewrite).
  const anniversariesWithPosters = React.useMemo(() => {
    if (!Array.isArray(anniversaries)) return [];
    return anniversaries.map(ann => {
      if (!ann) return ann;
      let next = ann;
      if (ann.category === 'sports' && ann.cultureSourceId && !ann.genre) {
        const genre = cultureGenreById.get(ann.cultureSourceId);
        if (genre) next = { ...next, genre };
      }
      const hasPhotos = Array.isArray(next.photos) && next.photos.length > 0;
      const hasImage = !!(next.image && String(next.image).trim());
      if (hasPhotos || hasImage || !next.cultureSourceId) return next;
      const poster = customPosterById.get(next.cultureSourceId) || culturePosterById.get(next.cultureSourceId);
      if (!poster) return next;
      return {
        ...next,
        image: poster,
        photos: [{ id: `poster_${next.id}`, url: poster, thumbUrl: poster }]
      };
    });
  }, [anniversaries, customPosterById, culturePosterById, cultureGenreById]);

  // 히스토리 > 문화공연 탭의 "캘린더에 일정 추가" 체크박스가 직접 호출하는 write path -- reuses
  // the exact same anniversaries write shape AnniversaryModal's own handleSaveAnniversary uses
  // (ui-event-modals.js) rather than opening that modal, since the source data (title/period/
  // venue/link) is already complete and doesn't need a form. cultureSourceId lets the checkbox
  // find its own registered anniversary again (to show checked, or to unregister) without the
  // culture item and the anniversary doc needing the same id.
  // 영화는 실제 상영관(장소)이 없는데도 공공 영화 데이터 API 스키마가 venue 필드를 필수로 요구해서,
  // 크롤링 원본(culture-movies.json, scripts/sync-culture-performances.mjs)이 항상 이 문자열을 채워
  // 넣어 온다. 이걸 실제 장소로 착각해 그대로 저장/표시하면 일정팝업에 "장소 확인 필요"라는 의미
  // 없는 텍스트가 위치 아이콘과 함께 나타나고(마치 사용자가 확인해야 할 일이 있는 것처럼 보임),
  // 설명 텍스트 맨 앞에도 같은 문구가 섞여 붙는다 -- 정보가 없을 뿐이니 장소 자체가 아예 없는
  // 것과 똑같이 취급한다(ui-date-modal.js의 hasRealAnnPlace와 동일한 판단).
  const CULTURE_VENUE_PLACEHOLDER = '장소 확인 필요';
  const hasRealVenue = (venue) => {
    const v = String(venue || '').trim();
    return !!v && v !== CULTURE_VENUE_PLACEHOLDER;
  };
  const handleRegisterCultureEvent = async (item, options = {}) => {
    if (!activeCal?.id || !item?.id || !item?.title) return null;
    const stamp = Date.now();
    const anniversaryId = 'anniversary_culture_' + stamp + '_' + Math.random().toString(36).slice(2, 8);
    const startDate = normalizeDateString(item.startDate || item.endDate);
    if (!startDate) { showToast('공연 기간 정보가 없어 등록할 수 없습니다.', 'error'); return null; }
    // 문화행사 tab → event(행사), 지역축제 tab → festival(축제), 스포츠 tab도 event로 등록한다 --
    // 기념일 수동 등록 폼(ANNIVERSARY_CATEGORY_OPTIONS.filter(opt => opt.value !== 'sports'),
    // ui-event-modals.js)이 애초에 '스포츠'를 사용자가 고를 수 있는 카테고리로 노출하지 않으므로,
    // 여기서만 별도로 'sports' 값을 만들어내면 사용자가 그 값을 다시 고를 방법이 없는 카테고리가
    // 생겨버린다. Prefer explicit options.category, then item.anniversaryCategory / item.kind from
    // the register checkbox path.
    const rawCategory = (options && options.category) || item.anniversaryCategory || item.kind || 'event';
    const category = rawCategory === 'festival' ? 'festival' : (rawCategory === 'sports' ? 'sports' : (rawCategory === 'movie' ? 'movie' : 'event'));
    // Full copy of the crawled/portal card as-is (minus the two plumbing fields this call adds
    // itself, anniversaryCategory/kind -- see handleToggleRegister/ContentRegisterModal, neither
    // of which is a real content field). 기념일 등록(이 함수)과 컨텐츠 카드가 서로 다른 필드
    // 집합을 따로 관리하던 게 "등록했더니 정보가 다 날아갔다" 버그의 근본 원인이었다 -- 등록
    // 당시 이 카드가 가진 필드가 앞으로 몇 개든, 뭐든, 항상 그대로 보존되도록 필드를 하나하나
    // 골라 옮기는 대신 카드 전체를 스냅샷으로 저장한다. orphanedSourceItems(ui-summary-gallery.js)가
    // 크롤링 피드에서 이 항목이 사라졌을 때(또는 id가 어긋났을 때) 이 스냅샷으로 원래 카드와
    // 동일한 상세 정보를 그대로 복원한다.
    const { anniversaryCategory: _omitAnniversaryCategory, kind: _omitKind, ...cultureSnapshot } = item;
    const annData = {
      id: anniversaryId,
      calendarId: activeCal.id,
      title: item.title,
      category,
      type: 'range',
      startDate,
      endDate: normalizeDateString(item.endDate || startDate) || startDate,
      cultureSourceId: item.id,
      cultureSnapshot,
      createdAt: stamp,
      updatedAt: stamp
    };
    if (category === 'movie') {
      annData.movieMeta = {
        releaseDate: item.releaseDate || item.startDate || startDate,
        endDate: item.endDate || null,
        isOpenEnded: item.isOpenEnded !== false,
        director: item.director || '',
        cast: Array.isArray(item.cast) ? item.cast : [],
        bookingRate: item.bookingRate || '',
        audienceCount: item.audienceCount || '',
        ageRating: item.ageRating || ''
      };
    }
    // Conditionally-added, not `field: value || undefined` -- Firestore's set() rejects a literal
    // undefined property value outright, so an always-present key here would throw on exactly the
    // items missing that field (same pattern AnniversaryModal's own handleSaveAnniversary uses).
    const descriptionParts = [hasRealVenue(item.venue) ? item.venue : null, item.address];
    if (item.description) descriptionParts.push(String(item.description).trim());
    if (item.link) descriptionParts.push(String(item.link).trim());
    const descriptionText = descriptionParts.filter(Boolean).join(' · ');
    if (descriptionText) annData.description = descriptionText;
    if (item.link) annData.cultureSourceLink = item.link;
    // 크롤링된 장소명(item.venue)을 기념일 자신의 구조화된 place 필드에도 그대로 채워 넣는다 --
    // 이게 없으면 일정 팝업의 "장소" 줄이 공란으로 보였다(장소 자체는 registerCulturePlaceForEvent가
    // 별도로 장소 목록에는 등록해두지만, 그 등록은 이 anniversaries 문서와 연결되지 않았다).
    // 좌표(lat/lng)는 없어도 되도록 만들어져 있다(getAnnBannerKakaoMapLinkUrl/getDisplayPlaceAddress
    // 모두 이름/주소만으로 동작) -- 지오코딩 성공 여부와 무관하게 항상 채워지도록 동기적으로 넣는다.
    if (hasRealVenue(item.venue)) annData.place = { name: item.venue, address: item.address || '' };
    // Copy archive-card poster so DateModal anniversary banners can show the same image.
    const poster = item.image ? String(item.image).trim() : '';
    if (poster) {
      annData.image = poster;
      annData.photos = [{ id: `poster_${anniversaryId}`, url: poster, thumbUrl: poster }];
    }
    try {
      const saved = await writeCollectionDocumentWithFallback('anniversaries', activeCal.id, anniversaryId, annData, 'set', '문화공연 캘린더 등록');
      if (!saved?.success) throw new Error('Culture event anniversary save failed');
      handleAnniversarySaved(annData);
      showToast('캘린더에 등록되었습니다.', 'success');
      // Best-effort, non-blocking: also register the venue as a 장소 so it shows up on the
      // 장소 tab/map without the user having to search and add it themselves. Never lets a
      // place-search failure affect the anniversary registration that already succeeded above.
      registerCulturePlaceForEvent(item, startDate).catch(() => {});
      return anniversaryId;
    } catch (err) {
      console.error('Failed to register culture event as anniversary:', err);
      showToast('등록 실패', 'error');
      return null;
    }
  };
  // Looks up the event's venue via the same Kakao/Google/Nominatim search chain 장소 등록
  // uses (window.GATHER_APP_PLACE_SEARCH, see app-place-search.js) and saves it through
  // handleSavePlace -- which already dedupes by sourcePlaceId, so registering the same venue
  // from multiple events (or the same event twice) merges into one place instead of duplicating.
  // Silently does nothing if the venue can't be found (no address/lat-lng to save) or the app is
  // offline -- this is a convenience on top of the calendar registration, never a requirement.
  const registerCulturePlaceForEvent = async (item, visitDate) => {
    const realVenue = hasRealVenue(item?.venue) ? String(item.venue).trim() : '';
    const venueQuery = realVenue || String(item?.title || '').trim();
    if (!venueQuery) return;
    const api = window.GATHER_APP_PLACE_SEARCH;
    if (!api || typeof api.searchPlaces !== 'function') return;
    const { results } = await api.searchPlaces(venueQuery, { firebaseConfig, auto: true });
    const top = Array.isArray(results) ? results[0] : null;
    if (!top || !Number.isFinite(top.lat) || !Number.isFinite(top.lng)) return;
    handleSavePlace({
      name: realVenue || top.name,
      address: item.address || top.address || '',
      lat: top.lat,
      lng: top.lng,
      categoryId: top.categoryId || 'etc',
      visitStatus: 'planned',
      visitDate,
      sourcePlaceId: top.id
    });
  };
  const handleUnregisterCultureEvent = async (anniversaryId) => {
    if (!activeCal?.id || !anniversaryId) return;
    try {
      const deleted = await writeCollectionDocumentWithFallback('anniversaries', activeCal.id, anniversaryId, null, 'delete', '문화공연 캘린더 등록 취소');
      if (!deleted?.success) throw new Error('Culture event anniversary delete failed');
      handleAnniversaryDeleted(anniversaryId);
      showToast('등록이 취소되었습니다.', 'success');
    } catch (err) {
      console.error('Failed to unregister culture event anniversary:', err);
      showToast('취소 실패', 'error');
    }
  };
  // Culture backdrop memo: upsert memos doc (+ cultureSourceId) and mirror onto linked anniversary.memo.
  const handleQuickSaveCultureMemo = async (item, customText = '') => {
    if (!activeCal?.id) return false;
    const trimmedCustom = String(customText || '').trim();
    const body = trimmedCustom || buildCultureEventMemoText(item);
    if (!body) return false;
    const participantId = getCurrentChatParticipantId() || '';
    const stamp = Date.now();
    const linkedAnn = findCultureLinkedAnniversary(anniversaries, item);
    const existingMemo = findCultureLinkedMemo(memos, item, isTombstone);
    const memoData = buildCultureLinkedMemoData({ existingMemo, item, text: body, participantId, stamp });
    try {
      const saved = await writeCollectionDocumentWithFallback('memos', activeCal.id, memoData.id, sanitizeMemoForFirestore(memoData), 'set', '문화공연 메모 저장');
      if (!saved?.success) throw new Error('Culture event memo save failed');
      setMemos(prev => [memoData, ...(Array.isArray(prev) ? prev.filter(m => m && m.id !== memoData.id) : [])]);
      if (linkedAnn?.id) {
        const annPatch = { id: linkedAnn.id, memo: trimmedCustom || body, updatedAt: stamp };
        const annSaved = await writeCollectionDocumentWithFallback('anniversaries', activeCal.id, linkedAnn.id, annPatch, 'update', '문화공연 연동 메모 저장');
        if (annSaved?.success) handleAnniversarySaved({ ...linkedAnn, ...annPatch });
      }
      if (!existingMemo) {
        const title = String(item?.title || '').trim();
        const logNote = title ? ('제목: ' + title) : (body.slice(0, 30) + (body.length > 30 ? '...' : ''));
        const activityLog = createMemoActivityLog(activeCal.id, 'memo_create', participantId, stamp, logNote);
        if (activityLog) {
          await pushSingleCloudCalendar({ ...activeCal, updatedAt: stamp, revision: (activeCal.revision || 0) + 1 }, stamp, 4, null, 'settings', [activityLog]);
        }
      }
      showToast(existingMemo ? '메모가 수정되었습니다.' : '메모에 등록되었습니다.', 'success');
      return true;
    } catch (err) {
      console.error('Failed to save culture event memo:', err);
      showToast('메모 등록 실패', 'error');
      return false;
    }
  };

  // 보관함 > 인물 탭의 "태그 추가" -- 참여자 외에 직접 구분하고 싶은 인물(예: "삼촌")을 캘린더
  // 단위 커스텀 태그 목록에 저장한다. 사진 자체에는 이미 있는 해시태그 기능(라이트박스)으로 태그를
  // 붙이므로, 여기서는 그 태그를 인물 탭에 칩으로 노출시키기 위한 이름 목록만 관리한다.
  const handleAddPersonTag = async (label) => {
    const trimmed = String(label || '').trim();
    if (!trimmed || !activeCal) return false;
    const existing = Array.isArray(activeCal.customPersonTags) ? activeCal.customPersonTags : [];
    if (existing.includes(trimmed)) return true;
    const nextCalendars = calendars.map(c => c.id === activeCal.id ? { ...c, customPersonTags: [...existing, trimmed] } : c);
    // settingsFields tells the server-side settings merge (mergeCalendarSettingsDelta) which
    // fields to actually overwrite from this write -- without it, an unlisted field like
    // customPersonTags is silently dropped and only the server's old value survives.
    const ok = await updateCalendars(nextCalendars, '태그가 추가되었습니다.', 'success', activeCal.id, 'settings', [], { settingsFields: ['customPersonTags'] });
    return ok;
  };

  // 인물 탭 상세 헤더의 연필 버튼 -- customPersonTags에 저장된 이름표 문자열 자체를 바꾼다.
  // 사진 쪽 해시태그(getPhotosForTagLabel이 매칭에 쓰는 값)는 전혀 건드리지 않으므로, 개명 후에는
  // 새 이름과 일치하는 사진들이 다음부터 이 칸에 모이게 된다 -- 기존 사진에 붙은 실제 해시태그를
  // 바꿔주는 기능은 아니다.
  const handleRenamePersonTag = async (oldLabel, newLabel) => {
    const trimmedOld = String(oldLabel || '').trim();
    const trimmedNew = String(newLabel || '').trim();
    if (!trimmedOld || !trimmedNew || trimmedOld === trimmedNew || !activeCal) return false;
    const existing = Array.isArray(activeCal.customPersonTags) ? activeCal.customPersonTags : [];
    if (!existing.includes(trimmedOld)) return false;
    if (existing.includes(trimmedNew)) {
      showToast('이미 같은 이름의 태그가 있습니다.', 'error');
      return false;
    }
    const nextCalendars = calendars.map(c => c.id === activeCal.id
      ? { ...c, customPersonTags: existing.map(t => t === trimmedOld ? trimmedNew : t) }
      : c);
    const ok = await updateCalendars(nextCalendars, '태그 이름이 변경되었습니다.', 'success', activeCal.id, 'settings', [], { settingsFields: ['customPersonTags'] });
    return ok;
  };

  // 인물 탭 상세 헤더의 휴지통 버튼 -- customPersonTags 이름표만 목록에서 제거한다. 사진에 붙은
  // 해시태그나 사진 자체는 그대로 남으므로, 같은 이름을 다시 태그로 추가하면 그 사진들은 그대로
  // 다시 모여 보인다.
  const handleDeletePersonTag = async (label) => {
    const trimmed = String(label || '').trim();
    if (!trimmed || !activeCal) return false;
    const existing = Array.isArray(activeCal.customPersonTags) ? activeCal.customPersonTags : [];
    if (!existing.includes(trimmed)) return true;
    const nextCalendars = calendars.map(c => c.id === activeCal.id
      ? { ...c, customPersonTags: existing.filter(t => t !== trimmed) }
      : c);
    const ok = await updateCalendars(nextCalendars, '태그가 삭제되었습니다.', 'success', activeCal.id, 'settings', [], { settingsFields: ['customPersonTags'] });
    return ok;
  };

  // 보관함 > 추억 탭의 라이트박스 "이 추억에서 제거" -- 여행 사진 모음은 날짜 구간으로 자동
  // 수집되므로, 같이 찍혔지만 그 여행과 무관한 사진이 섞일 수 있다. 사진 자체는 지우지 않고
  // 이 여행(anniversary) 문서에 제외 목록(mediaKey/refKey)만 추가해 다음부터 그 모음에서 빠지게
  // 한다. writeCollectionDocumentWithFallback의 'update'는 Firestore 부분 병합이라, 이 필드만
  // 안전하게 덧붙일 수 있다.
  const handleRemovePhotoFromTravelMemory = async (anniversaryId, photoKey) => {
    if (!activeCal?.id || !anniversaryId || !photoKey) return false;
    const ann = (anniversaries || []).find(a => a.id === anniversaryId);
    const existing = Array.isArray(ann?.excludedMemoryPhotoKeys) ? ann.excludedMemoryPhotoKeys : [];
    if (existing.includes(photoKey)) return true;
    const next = [...existing, photoKey];
    try {
      const saved = await writeCollectionDocumentWithFallback('anniversaries', activeCal.id, anniversaryId, { excludedMemoryPhotoKeys: next }, 'update', '추억에서 사진 제거');
      if (!saved?.success) throw new Error('remove photo from travel memory failed');
      handleAnniversarySaved({ id: anniversaryId, excludedMemoryPhotoKeys: next });
      showToast('추억에서 제거했습니다.', 'success');
      return true;
    } catch (err) {
      console.error('Failed to remove photo from travel memory:', err);
      showToast('제거 실패', 'error');
      return false;
    }
  };

  // 위 handleRemovePhotoFromTravelMemory의 일괄(여러 장) 버전 -- 추억 상세 페이지의 편집 모드에서
  // 체크박스로 여러 장을 골라 한 번에 제외할 때 쓴다. 장 수만큼 반복 호출하는 대신 병합된 제외
  // 목록 하나로 한 번만 쓴다.
  const handleRemovePhotosFromTravelMemory = async (anniversaryId, photoKeys, photoCount) => {
    if (!activeCal?.id || !anniversaryId || !Array.isArray(photoKeys) || photoKeys.length === 0) return false;
    const ann = (anniversaries || []).find(a => a.id === anniversaryId);
    const existing = Array.isArray(ann?.excludedMemoryPhotoKeys) ? ann.excludedMemoryPhotoKeys : [];
    const next = Array.from(new Set([...existing, ...photoKeys]));
    if (next.length === existing.length) return true;
    try {
      const saved = await writeCollectionDocumentWithFallback('anniversaries', activeCal.id, anniversaryId, { excludedMemoryPhotoKeys: next }, 'update', '추억에서 사진 일괄 제외');
      if (!saved?.success) throw new Error('remove photos from travel memory failed');
      handleAnniversarySaved({ id: anniversaryId, excludedMemoryPhotoKeys: next });
      const shown = Number.isFinite(photoCount) && photoCount > 0 ? photoCount : null;
      showToast(shown ? `사진 ${shown}장을 추억에서 제외했습니다.` : '선택한 사진을 추억에서 제외했습니다.', 'success');
      return true;
    } catch (err) {
      console.error('Failed to bulk-remove photos from travel memory:', err);
      showToast('제외 실패', 'error');
      return false;
    }
  };

  // 추억 탭의 "삭제" -- 흔들도시락처럼 반복 일정용으로만 등록한 기념일은 날짜 구간이 우연히
  // 사진과 겹치면 추억 탭에 여행처럼 그룹으로 잡혀버린다. 기념일(반복 일정)과 사진은 그대로 두고,
  // 이 플래그만 켜서 추억 탭 그룹핑 대상에서만 숨긴다.
  const handleHideMemoryGroup = async (anniversaryId) => {
    if (!activeCal?.id || !anniversaryId) return false;
    try {
      const saved = await writeCollectionDocumentWithFallback('anniversaries', activeCal.id, anniversaryId, { hiddenFromMemories: true }, 'update', '추억 목록에서 숨김');
      if (!saved?.success) throw new Error('hide memory group failed');
      handleAnniversarySaved({ id: anniversaryId, hiddenFromMemories: true });
      showToast('추억 목록에서 삭제했습니다.', 'success');
      return true;
    } catch (err) {
      console.error('Failed to hide memory group:', err);
      showToast('삭제 실패', 'error');
      return false;
    }
  };

  // 추억 목록의 "추가" -- 숨겨 두었던 기념일을 다시 추억 목록에 노출한다.
  const handleRestoreMemoryGroup = async (anniversaryId) => {
    if (!activeCal?.id || !anniversaryId) return false;
    try {
      const saved = await writeCollectionDocumentWithFallback('anniversaries', activeCal.id, anniversaryId, { hiddenFromMemories: false }, 'update', '추억 목록에 추가');
      if (!saved?.success) throw new Error('restore memory group failed');
      handleAnniversarySaved({ id: anniversaryId, hiddenFromMemories: false });
      showToast('추억 목록에 추가했습니다.', 'success');
      return true;
    } catch (err) {
      console.error('Failed to restore memory group:', err);
      showToast('추억 추가 실패', 'error');
      return false;
    }
  };

  // 추억 탭의 "추가" -- handleRemovePhotosFromTravelMemory로 제외했던 사진을 다시 이 추억에
  // 넣을 수 있게, excludedMemoryPhotoKeys에서 골라낸 키들만 제거한다.
  const handleAddPhotosBackToTravelMemory = async (anniversaryId, photoKeys, photoCount) => {
    if (!activeCal?.id || !anniversaryId || !Array.isArray(photoKeys) || photoKeys.length === 0) return false;
    const ann = (anniversaries || []).find(a => a.id === anniversaryId);
    const existing = Array.isArray(ann?.excludedMemoryPhotoKeys) ? ann.excludedMemoryPhotoKeys : [];
    const next = filterOutMemoryExclusionKeys(existing, photoKeys);
    if (next.length === existing.length) return true;
    try {
      const saved = await writeCollectionDocumentWithFallback('anniversaries', activeCal.id, anniversaryId, { excludedMemoryPhotoKeys: next }, 'update', '추억에 사진 다시 추가');
      if (!saved?.success) throw new Error('add photos back to travel memory failed');
      handleAnniversarySaved({ id: anniversaryId, excludedMemoryPhotoKeys: next });
      const shown = Number.isFinite(photoCount) && photoCount > 0 ? photoCount : null;
      showToast(shown ? `사진 ${shown}장을 추억에 다시 추가했습니다.` : '선택한 사진을 추억에 다시 추가했습니다.', 'success');
      return true;
    } catch (err) {
      console.error('Failed to add photos back to travel memory:', err);
      showToast('추가 실패', 'error');
      return false;
    }
  };

  // 보관함 > 컨텐츠 등록 / 컨텐츠 페이지: calendar-owned custom culture/festival/sports cards
  // merged into the CulturePerformancesTab lists alongside crawled JSON snapshots.
  //
  // needsCustomCultureData is memoized (rather than depending on raw `activeView` directly)
  // for the same reason needsPlacesData is below: history and content both need this exact same
  // subscription, so switching back and forth between them must NOT tear the Firestore listener
  // down and recreate it on every single navigation -- only a genuine transition across the
  // needs-it/doesn't-need-it boundary should resubscribe. Before this, `[activeCalId, activeView,
  // ...]` resubscribed on every 보관함<->컨텐츠 switch, exactly the "unsubscribe+resubscribe
  // within milliseconds of a nav" churn already identified (see needsPlacesData's own comment)
  // as the likely trigger for Firestore's "INTERNAL ASSERTION FAILED: Unexpected state" listener
  // corruption -- a torn-down-and-rebuilt listener can come back delivering a stale/incomplete
  // snapshot, which reads exactly like "개별등록 items keep vanishing, and refreshing briefly
  // fixes it" even though the documents were never actually lost.
  // Keep individual contents hydrated for any view that can open the side menu / return to
  // 컨텐츠 without a wipe. Gating to history|content only made items "vanish" on other tabs.
  const needsCustomCultureData = React.useMemo(
    () => Boolean(activeCalId),
    [activeCalId]
  );
  React.useEffect(() => {
    if (!activeCalId || !needsCustomCultureData) return;
    let isMounted = true;
    const kindByCategory = { festival: 'festival', event: 'performance', performance: 'performance', sports: 'sports', movie: 'movie' };
    const normalizeCustomCultureItem = item => {
      if (!item || typeof item !== 'object') return null;
      const inferredKind = item.kind || kindByCategory[item.category] || kindByCategory[item.anniversaryCategory]
        || (item.genre === 'movie' ? 'movie' : '');
      return { ...item, kind: inferredKind || 'performance' };
    };
    const applyList = (list, preserveExisting = false) => {
      if (!isMounted) return;
      const arr = (Array.isArray(list) ? list : []).map(normalizeCustomCultureItem).filter(Boolean);
      setCustomCultureItems(prev => {
        let merged = arr;
        if (preserveExisting) {
          const seen = new Set(arr.map(item => item.id).filter(Boolean));
          const existing = Array.isArray(prev) ? prev.filter(item => item?.id && !seen.has(item.id)) : [];
          merged = [...arr, ...existing];
        }
        merged.sort((a, b) => (Number(b.createdAt) || Number(b.updatedAt) || 0) - (Number(a.createdAt) || Number(a.updatedAt) || 0));
        return merged;
      });
    };
    if (!firebaseDb) {
      fetchCustomCultureItemsRest(activeCalId).then(list => applyList(list)).catch(err => {
        console.warn('Custom culture REST fallback failed; retaining existing items:', err);
      });
      return () => { isMounted = false; };
    }
    // Keep the realtime window bounded. The REST fallback above remains the authoritative
    // archive path, while the listener only tracks the newest registrations and prevents an
    // ever-growing collection from being re-sent on every reconnect.
    // Hydrate the complete archive once, then keep only a bounded recent listener attached.
    // This preserves older individually registered cards without making every reconnect stream
    // the entire collection.
    fetchCustomCultureItemsRest(activeCalId).then(list => applyList(list)).catch(err => {
      console.warn('Custom culture archive hydration failed:', err);
    });
    const unsub = firebaseDb.collection('calendars').doc(`cal_${activeCalId}`).collection('customCultureItems')
      .orderBy('createdAt', 'desc').limit(200)
      .onSnapshot(snapshot => {
        const list = [];
        snapshot.forEach(doc => list.push({ id: doc.id, ...doc.data() }));
        applyList(list, true);
      }, err => {
        console.warn('Firestore customCultureItems subscription error:', err);
        // A transient listener failure must never replace a previously received authoritative
        // collection with []. Keep the current list unless REST returns actual documents.
        fetchCustomCultureItemsRest(activeCalId).then(list => {
          if (Array.isArray(list) && list.length > 0) applyList(list);
        }).catch(fallbackErr => console.warn('Custom culture REST fallback failed; retaining existing items:', fallbackErr));
      });
    return () => { isMounted = false; unsub(); };
  }, [activeCalId, needsCustomCultureData, firebaseDb, firebaseConnectionVersion]);

  const handleSaveCustomCultureItem = async (item) => {
    if (!activeCal?.id || !item?.id || !item?.title) return false;
    try {
      const normalizedItem = { ...item };
      if (normalizedItem.startDate) normalizedItem.startDate = normalizeDateString(normalizedItem.startDate) || normalizedItem.startDate;
      if (normalizedItem.endDate) normalizedItem.endDate = normalizeDateString(normalizedItem.endDate) || normalizedItem.endDate;
      if (normalizedItem.releaseDate) normalizedItem.releaseDate = normalizeDateString(normalizedItem.releaseDate) || normalizedItem.releaseDate;
      if (normalizedItem.startDate) normalizedItem.dateLabel = formatDateWithDayName(normalizedItem.startDate) + (normalizedItem.endDate && normalizedItem.endDate !== normalizedItem.startDate ? ` ~ ${formatDateWithDayName(normalizedItem.endDate)}` : '');
      const saved = await writeCollectionDocumentWithFallback('customCultureItems', activeCal.id, item.id, normalizedItem, 'set', '컨텐츠 등록');
      if (!saved?.success) throw new Error('Custom culture item save failed');
      setCustomCultureItems(prev => {
        const list = Array.isArray(prev) ? prev.filter(x => x && x.id !== normalizedItem.id) : [];
        list.unshift(normalizedItem);
        return list;
      });
      showToast('컨텐츠가 등록되었습니다.', 'success');
      return true;
    } catch (err) {
      console.error('Failed to save custom culture item:', err);
      showToast('컨텐츠 등록 실패', 'error');
      return false;
    }
  };

  // Places + confirmed meetings: calendar / places / settlement / history only.
  // needsPlacesData is memoized and used as the effect's dependency (instead of the raw
  // activeView) so navigating between these four views -- all of which need the same
  // subscriptions -- doesn't tear down and recreate the Firestore listeners on every single
  // screen change. That churn (unsubscribe+resubscribe within milliseconds of a nav) was the
  // most likely trigger for the Firestore "INTERNAL ASSERTION FAILED: Unexpected state" errors:
  // only a genuine transition across the needs-it/doesn't-need-it boundary should resubscribe.
  // Nav 정산/장소 meta and schedule photos need this on gallery/chat/memo/content too.
  // Subscribe for the whole calendar session so view switches do not drop hydrated meetings.
  const needsPlacesData = React.useMemo(
    () => Boolean(activeCalId),
    [activeCalId]
  );
  React.useEffect(() => {
    if (!activeCalId || !needsPlacesData) return;
    let isMounted = true;

    // REST is only a fallback when the SDK is unavailable. With an active SDK, the listeners
    // below deliver the initial server snapshot; doing both would double every collection read.
    const refreshConfirmedMeetings = () => fetchConfirmedMeetingsFromFirestore(activeCalId).then(list => {
      if (!isMounted || !Array.isArray(list)) return;
      setConfirmedMeetingsSubcollection(prev => {
        const prevList = Array.isArray(prev) ? prev : [];
        const snapshotDates = new Set(list.map(m => m && m.date).filter(Boolean));
        return mergeConfirmedMeetings(prevList, list).filter(m => m && m.date && snapshotDates.has(m.date));
      });
      setMeetingsHydrated(true);
    }).catch(() => {});

    // REST is a request/response fallback, not a realtime transport. Poll only when the SDK
    // channel is unavailable so an open popup still sees another device's completed meeting
    // photo upload without requiring a manual refresh.
    if (!firebaseDb) {
      refreshConfirmedMeetings();
      fetchPlacesFromFirestore(activeCalId).then(list => {
        if (isMounted && Array.isArray(list) && list.length > 0) setPlacesSubcollection(list);
      }).catch(() => {});
      const refreshTimer = setInterval(refreshConfirmedMeetings, 6000);
      return () => { isMounted = false; clearInterval(refreshTimer); };
    }

    // A years-old family calendar's places subcollection only ever grows, and a plain
    // unbounded onSnapshot() re-reads every single place from scratch on every reconnect.
    // Same fix as anniversaries/customCultureItems: hydrate the full list once via REST, then
    // attach a listener bounded to the most-recently-updated places to catch live add/edit/
    // (soft-)delete, merging by id into local state so older places hydrated via REST are never
    // dropped. Deletes are safe to catch this way because they're soft-deletes (deletedAt set on
    // the doc, which bumps updatedAt) rather than real document removal, so a delete always shows
    // up in the "most recently updated" window like any other edit.
    const mergePlacesById = (prevList, incomingList) => {
      const byId = new Map();
      (Array.isArray(prevList) ? prevList : []).forEach(p => { if (p?.id) byId.set(p.id, p); });
      (Array.isArray(incomingList) ? incomingList : []).forEach(p => { if (p?.id) byId.set(p.id, p); });
      return Array.from(byId.values());
    };
    fetchPlacesFromFirestore(activeCalId).then(list => {
      if (isMounted && Array.isArray(list) && list.length > 0) {
        setPlacesSubcollection(prev => mergePlacesById(prev, list));
      }
    }).catch(err => console.warn('Places archive hydration failed:', err));
    const unsubPlaces = subscribePlaces(activeCalId, { orderBy: 'updatedAt', direction: 'desc', limit: 200 }, snapshot => {
        if (!isMounted) return;
        const list = [];
        snapshot.forEach(doc => list.push(doc.data()));
        if (isSavingRef.current) {
          if (!snapshot.metadata?.fromCache && !snapshot.metadata?.hasPendingWrites) pendingRemotePlacesRef.current = list;
          return;
        }
        setPlacesSubcollection(prev => mergePlacesById(prev, list));
      }, err => {
        console.warn(`Firestore places subscription error:`, err);
        queueServerAuditEvent(activeCalId, 'realtime_fallback', `places:${String(err?.code || 'unknown')}`, getClientAuditContext());
        fetchPlacesFromFirestore(activeCalId).then(list => {
          if (isMounted) setPlacesSubcollection(list);
        });
      });
    const unsubMeetings = firebaseDb.collection('calendars').doc(`cal_${activeCalId}`).collection('confirmedMeetings')
      .onSnapshot({ includeMetadataChanges: true }, snapshot => {
        if (!isMounted) return;
        // Ignore snapshots that arrive while this device is mid-save, same as the places
        // listener above -- a Firestore persistence-cached snapshot delivered immediately
        // after the write starts would stomp the optimistic local state with stale data
        // (e.g. reverting an expense edit back to the old amount) before the server-confirmed
        // write has a chance to land in the subcollection.
        if (isSavingRef.current) {
          if (!snapshot.metadata.fromCache && !snapshot.metadata.hasPendingWrites) {
            const list = [];
            snapshot.forEach(doc => list.push(doc.data()));
            pendingRemoteMeetingsRef.current = list;
          }
          return;
        }
        // Also ignore cached snapshots that arrive right after a save finishes -- Firestore
        // persistence can replay a stale fromCache:true event for the subcollection even after
        // the SDK-level write transaction succeeded and we already have correct local state.
        // Only fromCache:false (server-confirmed) snapshots should update subcollection state
        // when there was a recent local write for this calendar.
        const recentWriteAt = localWriteStartedAtRef.current[activeCalId] || 0;
        if (snapshot.metadata.fromCache && Date.now() - recentWriteAt < 8000) return;
        const list = [];
        snapshot.forEach(doc => list.push(doc.data()));
        // Identity-merge photos/expenses so a brief stale/cached snapshot with a short photos
        // array cannot shrink a richer album already held in memory. Still replace the date set
        // with the snapshot so server-side deletions are not retained forever.
        setConfirmedMeetingsSubcollection(prev => {
          const prevList = Array.isArray(prev) ? prev : [];
          const snapshotDates = new Set((list || []).map(m => m && m.date).filter(Boolean));
          return mergeConfirmedMeetings(prevList, list).filter(m => m && m.date && snapshotDates.has(m.date));
        });
        setMeetingsHydrated(true);
      }, err => {
        console.warn(`Firestore confirmedMeetings subscription error:`, err);
        queueServerAuditEvent(activeCalId, 'realtime_fallback', `confirmedMeetings:${String(err?.code || 'unknown')}`, getClientAuditContext());
        fetchConfirmedMeetingsFromFirestore(activeCalId).then(list => {
          if (!isMounted || !Array.isArray(list)) return;
          setConfirmedMeetingsSubcollection(prev => {
            const prevList = Array.isArray(prev) ? prev : [];
            const snapshotDates = new Set(list.map(m => m && m.date).filter(Boolean));
            return mergeConfirmedMeetings(prevList, list).filter(m => m && m.date && snapshotDates.has(m.date));
          });
          setMeetingsHydrated(true);
        });
      });
    return () => {
      isMounted = false;
      unsubPlaces();
      unsubMeetings();
    };
  }, [activeCalId, needsPlacesData, firebaseDb, firebaseConnectionVersion]);

  // Stable calendar-scoped fetchers for DateModal / History. Inline lambdas recreate every App
  // render and would cancel in-flight DateModal effects that depend on callback identity.
  const handleFetchMeetingPhotoIndex = React.useCallback(
    (date) => fetchMeetingPhotoIndex(activeCalId, date),
    [activeCalId]
  );
  const handleFetchDateTaggedMessages = React.useCallback(
    (tag) => fetchMessagesByImageTag(activeCalId, tag),
    [activeCalId]
  );
  const handleFetchDateTaggedMemos = React.useCallback(
    (tag) => fetchMemosByTag(activeCalId, tag),
    [activeCalId]
  );
  // DateModal full album: meeting + index + date-tag chat/memo (not view window).
  const handleFetchMeetingAlbum = React.useCallback(async (date) => {
    const tag = typeof dateStrToHashtag === 'function' ? dateStrToHashtag(date) : '';
    const [meetings, indexPhotos, taggedMessages, taggedMemos] = await Promise.all([
      fetchExistingConfirmedMeetingsForDates(activeCalId, [date]),
      fetchMeetingPhotoIndex(activeCalId, date),
      tag ? fetchMessagesByImageTag(activeCalId, tag).catch(() => []) : Promise.resolve([]),
      tag ? fetchMemosByTag(activeCalId, tag).catch(() => []) : Promise.resolve([])
    ]);
    const meeting = (Array.isArray(meetings) ? meetings : []).find(m => m && m.date === date) || null;
    if (meeting) setConfirmedMeetingsSubcollection(prev => mergeConfirmedMeetings(Array.isArray(prev) ? prev : [], [meeting]));
    return {
      photos: Array.isArray(meeting?.photos) ? meeting.photos : [],
      indexPhotos: Array.isArray(indexPhotos) ? indexPhotos : [],
      taggedMessages: Array.isArray(taggedMessages) ? taggedMessages : [],
      taggedMemos: Array.isArray(taggedMemos) ? taggedMemos : []
    };
  }, [activeCalId]);

  // 사진 댓글 개수 실시간 구독 -- 썸네일 우측 상단 뱃지(캘린더 일정/갤러리 등)에 쓰인다. 댓글이
  // 실제로 달린 사진만 문서가 존재하므로 컬렉션 자체가 작게 유지되어, 전체 스냅샷을 그대로
  // 구독해도(개별 문서 get을 여러 번 하는 대신) 부담이 적다. 썸네일에 뱃지가 실제로 보이는
  // 화면(캘린더/갤러리/보관함)에서만 구독한다.
  const needsPhotoCommentCounts = React.useMemo(
    () => activeView === 'calendar' || activeView === 'gallery' || activeView === 'history',
    [activeView]
  );
  // Reset comment caches only when the calendar changes — not on every gallery/calendar hop
  // (that wipe made every thumbnail badge flash `0` until the next snapshot).
  React.useEffect(() => {
    setPhotoCommentCounts({});
    setPreloadedPhotoComments({});
    setPreloadedPhotoCommentsReady(false);
  }, [activeCalId]);
  React.useEffect(() => {
    if (!activeCalId || !needsPhotoCommentCounts) return;
    const store = createPhotoCommentStore({
      calendarId: activeCalId, db: firebaseDb, projectId: firebaseConfig.projectId,
      decodeDocument: firestoreDocumentToJs, fetchCountsRest: fetchPhotoCommentCountsRest,
      // Gallery thumbnails still need comment badges; keep bulk hydration on.
      enableBulkHydration: true
    });
    photoCommentStoreRef.current = store;
    const stop = store.start(state => {
      setPhotoCommentCounts(state.counts || {});
      setPreloadedPhotoComments(state.commentsByKey || {});
      setPreloadedPhotoCommentsReady(Boolean(state.ready));
    });
    return () => {
      stop();
      if (photoCommentStoreRef.current === store) photoCommentStoreRef.current = null;
    };
  }, [activeCalId, needsPhotoCommentCounts, firebaseDb, firebaseConnectionVersion]);

  // Memos: paginated newest-first load (rather than subscribing to the entire collection at
  // once, which would download/re-sync thousands of memos on every open as a calendar grows).
  // Pinned memos are fetched separately and unbounded -- pinning is a deliberate, self-limiting
  // action, and keeping it a separate always-live query means an old pinned memo can never
  // silently fall out of view just because it's outside the paginated recent window.
  // Kept subscribed regardless of activeView (like chat/places) so a memo added on another
  // device shows up immediately even while this tab is on a different view.
  React.useEffect(() => {
    setMemosLimit(MEMOS_PAGE_SIZE);
  }, [activeCalId]);

  // Same churn fix as needsPlacesData above: memoize the gate boolean and depend on it instead
  // of the raw activeView/isGlobalSearchOpen, so navigating among the views that DON'T need the
  // memo collection (e.g. calendar -> chat -> settlement) never tears down and recreates these
  // three memo listeners -- only crossing into/out of memo|gallery|search actually should.
  const needsMemoCollection = React.useMemo(
    () => activeView === 'memo' || activeView === 'gallery' || isGlobalSearchOpen,
    [activeView, isGlobalSearchOpen]
  );
  // 보관함 인물/추억 탭의 사진 목록용 memo 스냅샷 -- 위 needsMemoCollection에 'history'를 넣어 실시간
  // 구독을 타게 하면 캘린더<->보관함을 오갈 때마다 리스너가 추가로 붙었다 떨어지는 처치(churn)가
  // 늘어나는데, 이 리스너 처치가 실사용자 콘솔에서 반복 관찰된 "FIRESTORE INTERNAL ASSERTION
  // FAILED: Unexpected state" 크래시의 유력한 방아쇠라 이미 위 주석에서 경고하고 있다. 사진 모아보기는
  // 실시간일 필요가 없으므로, 보관함에 들어갈 때 한 번만 REST로 읽어와 별도 상태에 담는다(구독 없음).
  const [historyMemosSnapshot, setHistoryMemosSnapshot] = React.useState([]);
  React.useEffect(() => {
    if (!activeCalId || activeView !== 'history') return;
    let cancelled = false;
    fetchMemosRest(activeCalId, 200).then(list => {
      if (!cancelled) setHistoryMemosSnapshot(Array.isArray(list) ? list : []);
    }).catch(() => {});
    return () => { cancelled = true; };
  }, [activeCalId, activeView]);

  React.useEffect(() => {
    if (!activeCalId) {
      setMemos([]);
      setHasMoreMemos(false);
      return;
    }
    // Gallery needs a paginated memo window for memo-attached photos/links; other routes only
    // need the latest memo for their summary badge/snippet.
    const effectiveMemosLimit = needsMemoCollection ? memosLimit : 1;
    let isMounted = true;
    const liveDb = (typeof window !== 'undefined' && window.__gatherFirebaseDb) || firebaseDb;
    if (!liveDb) {
      fetchMemosRest(activeCalId, effectiveMemosLimit).then(list => {
        if (!isMounted) return;
        setMemos(list);
        setHasMoreMemos(needsMemoCollection && list.length >= effectiveMemosLimit);
      });
      return () => { isMounted = false; };
    }
    let pinnedList = [];
    let recentList = [];
    let recentActivityList = [];
    const applyMerged = () => {
      const byId = new Map();
      pinnedList.forEach(m => byId.set(m.id, m));
      recentActivityList.forEach(m => byId.set(m.id, m));
      recentList.forEach(m => byId.set(m.id, m));
      setMemos(Array.from(byId.values()).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)));
    };

    // 고정 메모는 원래도 적은 수라 문제된 적 없지만, 수년간 쓰는 가족 캘린더가 계속 늘려온
    // 다른 컬렉션(anniversaries)에서 이미 겪은 "무제한 재읽기" 패턴을 여기도 예방적으로 막아둔다.
    // where()에 대한 등호(==) 필터 + limit()만 쓰면(orderBy 없이) 복합 인덱스가 필요 없다.
    const unsubscribePinned = needsMemoCollection ? subscribeMemos(activeCalId, { where: ['isPinned', '==', true], limit: 100 }, snapshot => {
        if (!isMounted) return;
        pinnedList = [];
        snapshot.forEach(doc => pinnedList.push({ id: doc.id, ...doc.data() }));
        applyMerged();
      }, err => {
        console.warn(`Firestore pinned memos subscription error:`, err);
      }) : null;

    // 최근 활동 (see RECENT_MEMO_ACTIVITY_WINDOW_MS in ui-memo-view.js) needs any memo with a
    // recent comment loaded even when it's well outside the recent-by-createdAt window below --
    // an old memo that just got a comment otherwise wouldn't be in `memos` at all until someone
    // pages back to it. Ordered by lastCommentAt (set alongside `comments` whenever a comment is
    // added/edited/deleted) rather than filtered by a time cutoff, since a snapshot listener
    // doesn't re-fire just because wall-clock time passed a cutoff -- ui-memo-view.js's own
    // isMemoRecentlyActive does the actual 6-hour cutoff check against this loaded set.
    const unsubscribeRecentActivity = needsMemoCollection ? subscribeMemos(activeCalId, { orderBy: 'lastCommentAt', direction: 'desc', limit: 30 }, snapshot => {
        if (!isMounted) return;
        recentActivityList = [];
        snapshot.forEach(doc => recentActivityList.push({ id: doc.id, ...doc.data() }));
        applyMerged();
      }, err => {
        console.warn(`Firestore recent-activity memos subscription error:`, err);
      }) : null;

    const unsubscribeRecent = subscribeMemos(activeCalId, { orderBy: 'createdAt', direction: 'desc', limit: effectiveMemosLimit }, snapshot => {
        if (!isMounted) return;
        recentList = [];
        snapshot.forEach(doc => recentList.push({ id: doc.id, ...doc.data() }));
        setHasMoreMemos(needsMemoCollection && recentList.length >= effectiveMemosLimit);
        applyMerged();
      }, err => {
        console.warn(`Firestore memos subscription error:`, err);
        queueServerAuditEvent(activeCalId, 'realtime_fallback', `memos:${String(err?.code || 'unknown')}`, getClientAuditContext());
        fetchMemosRest(activeCalId, effectiveMemosLimit).then(list => {
          if (!isMounted) return;
          recentList = list;
          setHasMoreMemos(needsMemoCollection && list.length >= effectiveMemosLimit);
          applyMerged();
        });
      });

    return () => {
      isMounted = false;
      if (typeof unsubscribePinned === 'function') unsubscribePinned();
      if (typeof unsubscribeRecentActivity === 'function') unsubscribeRecentActivity();
      if (typeof unsubscribeRecent === 'function') unsubscribeRecent();
    };
  }, [activeCalId, needsMemoCollection, memosLimit, firebaseDb, firebaseConnectionVersion]);

  // Dynamic body padding override for full-screen subviews (chat, settlement, memo, places,
  // history, content). Each of these renders its own `position:fixed; top/left/right/bottom:0`
  // container with an internal `overflowY:auto` scroll region, sized to exactly fill the viewport.
  // Leaving body's default padding (24px top + 60px bottom, see `body` in app.css) in place while
  // one of these is mounted makes body's own box 84px taller than the viewport regardless of
  // content -- since a fixed-position child doesn't shrink its ancestor -- so `html`/`body` end up
  // with their own ~84px scrollbar on top of the subview's internal one, i.e. a visible double
  // vertical scrollbar.
  React.useEffect(() => {
    if (activeView === 'memo' || activeView === 'chat' || activeView === 'settlement' || activeView === 'places' || activeView === 'history' || activeView === 'content') {
      document.body.classList.add('no-body-padding');
    } else {
      document.body.classList.remove('no-body-padding');
    }
    return () => {
      document.body.classList.remove('no-body-padding');
    };
  }, [activeView]);

  // Deep-link support: ?view=chat&msg=<id>[&img=<index>] switches to chat and scrolls/flashes
  // the matched message bubble (same DOM hook + animation GlobalSearchModal's in-session click
  // already uses), optionally opening the lightbox at a specific image for 태그 results. Used by
  // the admin 통합검색결과 page so 채팅/태그 search results open a new tab landing on the actual
  // message instead of just the chat room's bottom. Re-runs as chatMessages streams in (the
  // message may not be in the DOM yet on first paint) but only acts once via the ref guard.
  const chatDeepLinkHandledRef = React.useRef(false);
  React.useEffect(() => {
    if (chatDeepLinkHandledRef.current) return;
    const params = new URLSearchParams(window.location.search);
    const msgParam = params.get('msg');
    if (!msgParam) return;
    if (activeView !== 'chat') { changeView('chat'); return; }
    if (!focusChatMessage(msgParam)) return;
    chatDeepLinkHandledRef.current = true;
    const imgParam = params.get('img');
    if (imgParam !== null) {
      const msg = chatMessages.find(m => m.id === msgParam);
      if (msg) {
        const entries = getMessageImageEntries(msg);
        setActiveLightbox({
          urls: entries.map(e => e.full),
          meta: entries.map(e => ({ timestamp: msg.timestamp, messageId: msg.id, imageIndex: e.imageIndex, thumb: e.thumb, tags: e.tags, source: e.source, uploadSource: e.uploadSource, assetKey: e.assetKey, mediaKey: e.mediaKey, refKey: e.refKey })),
          index: Number(imgParam) || 0
        });
      }
    }
  }, [activeView, chatMessages]);

  // Activity logs only when settings AdminModal opens recovery/logs tabs (not on every settings open).
  const adminActivityLogsLoadedForRef = React.useRef(null);
  const loadAdminActivityLogs = React.useCallback(() => {
    if (!activeCalId) return;
    if (adminActivityLogsLoadedForRef.current === activeCalId && adminActivityLogs.length > 0) return;
    const calId = activeCalId;
    fetchActivityLogsFromFirestore(calId, 400).then(list => {
      adminActivityLogsLoadedForRef.current = calId;
      setAdminActivityLogs(Array.isArray(list) ? list : []);
    });
  }, [activeCalId, adminActivityLogs.length]);
  React.useEffect(() => {
    if (!isAdminOpen) {
      setAdminActivityLogs([]);
      adminActivityLogsLoadedForRef.current = null;
    }
  }, [isAdminOpen]);

  // Scroll to bottom of chat container
  const chatMessagesContainerRef = React.useRef(null);
  React.useEffect(() => {
    setOlderChatMessages([]);
    setHasMoreOlderChat(true);
    setLoadingOlderChat(false);
    loadingOlderChatRef.current = false;
    setTotalChatCount(null);
    setTotalMemoCount(null);
    setTotalGalleryCount(null);
    setGalleryPreviewMessages([]);
    setGalleryLiveMessages([]);
    // These counts/migration scan are non-essential background work -- deferred until the
    // initial calendar document has actually finished loading (isInitialDataLoading false) so
    // they queue up behind the one fetch that matters on a cold start instead of racing it. A
    // burst of count()/paginated get() calls firing on the very same tick as the critical
    // calendar-doc fetch was starving that fetch of its 8s timeout budget, which is what made
    // the "서버 재연결 중" toast show up so often on first load / deep-link entry.
    if (!activeCalId || isInitialDataLoading) return;
    let cancelled = false;
    (async () => {
      const [msgCount, memoCount] = await Promise.all([
        fetchSubcollectionCount(activeCalId, 'messages', { excludeUploadSources: ['meeting', 'gallery'] }),
        fetchSubcollectionCount(activeCalId, 'memos')
      ]);
      if (cancelled) return;
      if (msgCount != null) setTotalChatCount(msgCount);
      if (memoCount != null) setTotalMemoCount(memoCount);
      // Historical migrations are maintenance work, not part of an end-user request path. They
      // remain available behind an explicit maintenance flag instead of scanning up to 120 chat
      // documents on every calendar visit.
      const runMaintenance = new URLSearchParams(window.location.search).get('maintenance') === '1';
      if (!runMaintenance) return;
      try {
        if (!window.__gatherB64MigDone) window.__gatherB64MigDone = Object.create(null);
        if (!window.__gatherB64MigDone[activeCalId]) {
          const result = await migrateBase64ChatImagesForCalendar(activeCalId, { maxMessages: 20 });
          if (!cancelled && result && (result.failed || 0) === 0) window.__gatherB64MigDone[activeCalId] = true;
          if (result && result.migrated > 0) console.info('base64→Storage migrated', activeCalId, result);
        }
        if (!window.__gatherMeetingUploadSourceMigDone) window.__gatherMeetingUploadSourceMigDone = Object.create(null);
        if (!window.__gatherMeetingUploadSourceMigDone[activeCalId]) {
          const result = await backfillMeetingUploadSourcesForCalendar(activeCalId, activeCal, { maxMessages: 100 });
          if (!cancelled && result && (result.failed || 0) === 0) window.__gatherMeetingUploadSourceMigDone[activeCalId] = true;
          if (!cancelled && result && result.migrated > 0) {
            setTotalChatCount(prev => (typeof prev === 'number' ? Math.max(0, prev - result.migrated) : prev));
            console.info('meeting uploadSource backfilled', activeCalId, result);
          }
        }
      } catch (e) { console.warn('base64 migration skipped', e); }
    })();
    return () => { cancelled = true; };
  }, [activeCalId, isInitialDataLoading]);

  // Main-screen chat preview safety net:
  // if the count says chat history exists but the live recent window is still empty,
  // hydrate the newest renderable messages so the summary widget can render at least the
  // latest real chat instead of getting stuck on "최근 채팅을 불러오는 중…" forever.
  //
  // This used to re-fetch the "top N raw docs" from scratch on every retry with N escalating
  // (20 -> 60 -> 150 -> 300 -> 400), which has two structural problems: (1) it re-reads the
  // same already-seen photo docs from scratch on every attempt instead of making forward
  // progress, and (2) it's still a hard ceiling -- a calendar whose real text chat sits behind
  // more than 400 consecutive 일정(meeting)/갤러리 photo uploads (each its own message doc,
  // filtered out client-side by isChatRenderableMessage -- there is no server-side field that
  // reliably excludes them, see isNonChatUploadSource/meetingPhotoMessageIds) permanently
  // exhausts every attempt and wrongly settles on "표시할 최근 채팅이 없습니다." even though real
  // chat exists a bit further back. Walking backward with a cursor (the same startAfter/limit
  // pagination "이전 메시지 더 보기" already uses) instead removes both: each page only scans
  // docs the previous page hasn't already covered, and there's no arbitrary point at which a
  // deep-enough photo backlog forces a wrong "no chat" conclusion -- it only stops for real once
  // a page comes back shorter than requested, meaning the collection is genuinely exhausted.
  // Deliberately does NOT gate on `visibleTotalChatCount > 0` before attempting a hydrate pass
  // (it used to). That count comes from a separate server-side aggregation query
  // (fetchSubcollectionCount) rather than the same timestamp-ordered query this walk itself
  // uses, so the two can disagree -- e.g. a message document missing its `timestamp` field
  // entirely (a partial write, a pre-migration doc, ...) is invisible to every orderBy('timestamp')
  // query below (Firestore excludes documents missing an ordered field from the result set) but
  // still gets counted by a plain aggregation count(). That mismatch means the count can report
  // "chat exists" forever while every walk -- no matter how many pages -- correctly and
  // immediately finds nothing, which used to leave the widget trusting the wrong signal and
  // stuck showing "최근 채팅을 불러오는 중…" well past when the actual collection had already
  // been proven empty. Always attempting one real query and trusting ITS outcome (a page shorter
  // than requested means the collection is actually exhausted, full stop) costs at most one extra
  // Firestore read for a calendar that has genuinely never had any chat, and removes an entire
  // class of "count lied" bugs.
  React.useEffect(() => {
    if (!activeCalId || isInitialDataLoading) return;
    setChatPreviewHydrationExhausted(false);
    if (visibleChatMessages.length > 0) return;
    let cancelled = false;
    let page = 0;
    let cursorTs = null; // null = start from the newest message; otherwise walk strictly older
    let retryTimer = null;
    const PAGE_SIZE = 150;
    const MAX_PAGES = 6; // safety valve: 900 raw docs scanned before giving up for good
    const ERROR_RETRY_DELAY_MS = 3000; // only used when a page fetch itself fails (network hiccup)
    const tryHydrate = async () => {
      page += 1;
      let list;
      try {
        list = cursorTs == null
          ? await fetchRecentChatMessages(activeCalId, PAGE_SIZE)
          : await fetchOlderChatMessages(activeCalId, cursorTs, PAGE_SIZE);
      } catch (err) {
        console.warn('chat preview hydration failed:', err);
        if (cancelled) return;
        if (page >= MAX_PAGES) { setChatPreviewHydrationExhausted(true); return; }
        page -= 1; // this attempt didn't actually consume a page -- retry the same one
        retryTimer = setTimeout(tryHydrate, ERROR_RETRY_DELAY_MS);
        return;
      }
      if (cancelled) return;
      // Both fetchRecentChatMessages and fetchOlderChatMessages return ascending order (oldest
      // first), so list[0] is the oldest doc seen in this page -- exactly the cursor the next
      // page needs to keep walking backward without re-covering ground already scanned.
      // Read meetingPhotoMessageIds via the ref (not the effect's own closure) -- this value is
      // recomputed from `activeCal`, whose object identity changes on essentially every realtime
      // listener tick (even for fields unrelated to chat), so reading it via a plain closure
      // would go stale mid-walk instead of reflecting whatever meeting got confirmed most recently.
      const renderable = Array.isArray(list) ? list.filter(m => isChatRenderableMessage(m, meetingPhotoMessageIdsRef.current)) : [];
      if (renderable.length > 0) {
        // The realtime listener may already have populated state with only hidden gallery/
        // meeting uploads. Merge the wider recovery page instead of treating that raw array as
        // a successful chat load and discarding the actual conversation.
        setChatMessages(prev => {
          const byId = new Map();
          (Array.isArray(prev) ? prev : []).forEach(message => { if (message?.id) byId.set(message.id, message); });
          list.forEach(message => { if (message?.id) byId.set(message.id, message); });
          return Array.from(byId.values()).sort((a, b) => (Number(a.timestamp) || 0) - (Number(b.timestamp) || 0));
        });
        return;
      }
      if (!Array.isArray(list) || list.length < PAGE_SIZE) {
        // Fewer docs than requested came back -- there is nothing older left in the collection,
        // so this is a genuine "no real chat exists" conclusion, not a ceiling being hit.
        setChatPreviewHydrationExhausted(true);
        return;
      }
      cursorTs = Number(list[0].timestamp) || cursorTs;
      if (page >= MAX_PAGES) {
        // Diagnostic breadcrumb for this exact "count>0 but nothing renders" case -- if it
        // recurs, checking devtools console for this line pins down whether the raw server
        // count, the meeting-linked-photo correction, or the fetch itself is the mismatch.
        console.info('[chat-preview] hydration exhausted', {
          calendarId: activeCalId, rawTotalChatCount: totalChatCount,
          meetingLinkedCount: meetingPhotoMessageIdsRef.current.size,
          visibleTotalChatCount: visibleTotalChatCountRef.current,
          visibleChatMessagesLength: visibleChatMessages.length,
          pagesScanned: page, docsScanned: page * PAGE_SIZE
        });
        setChatPreviewHydrationExhausted(true);
        return;
      }
      void tryHydrate();
    };
    void tryHydrate();
    return () => {
      cancelled = true;
      if (retryTimer) clearTimeout(retryTimer);
    };
  // Deliberately NOT depending on `visibleTotalChatCount` here (read via ref above instead) --
  // it's `totalChatCount - meetingPhotoMessageIds.size`, and that subtrahend changes its actual
  // NUMBER (not just object identity) every time a new 일정/갤러리 photo is confirmed while this
  // effect is mid-walk. With the number in this array, every such upload tore the effect down
  // and rebuilt it, resetting the walk back to page 0 before it could ever reach MAX_PAGES -- so
  // on a calendar where photos keep getting confirmed faster than the walk can finish, the widget
  // could stay on "불러오는 중…" indefinitely even though every individual fetch was completing
  // fine and correctly finding nothing renderable yet. visibleChatMessages.length stays in the
  // array on purpose: it only ever needs to fire once real chat text actually arrives (0 -> N),
  // which is exactly when this effect should bail out early instead of continuing to walk.
  }, [activeCalId, isInitialDataLoading, visibleChatMessages.length]);

  // Absolute backstop for the hydration safety net above, independent of its own retry/backoff
  // bookkeeping -- this exact widget has already needed several rounds of fixes for new ways to
  // get permanently stuck on "불러오는 중…" (a filtered-out raw window, then a dependency-churn
  // reset loop, ...), and each fix only closed the one mechanism found. Rather than trust that no
  // further such mechanism exists, this timer guarantees a hard ceiling regardless of cause: no
  // matter what goes wrong in the retry effect above (a bug not yet found, a future regression, a
  // network condition none of the above anticipated), the widget can never show "불러오는 중…"
  // for longer than this timeout before settling to a definitive resolved state. If real messages
  // arrive after this fires, they still render immediately (visibleChatMessages.length > 0 always
  // wins in CommentsSection's own emptyChatMessage check) -- this only forces the terminal
  // "nothing found" state to stop waiting indefinitely.
  React.useEffect(() => {
    if (!activeCalId || isInitialDataLoading) return undefined;
    const timer = setTimeout(() => setChatPreviewHydrationExhausted(true), 15000);
    return () => clearTimeout(timer);
  }, [activeCalId, isInitialDataLoading]);

  React.useEffect(() => {
    // Same reasoning as above -- wait for the initial calendar document load to finish before
    // spending a paginated Firestore scan on gallery-preview thumbnails.
    if (!activeCalId || (activeView !== 'calendar' && activeView !== 'gallery') || isInitialDataLoading) return;
    let cancelled = false;
    (async () => {
      // Keeps paging through history until at least 18 photos have been found (matching the
      // desktop widget cap; tablet/mobile still render the newest 9), instead of grabbing the newest 60 messages
      // regardless of content -- a text-heavy recent stretch of chat used to starve the main
      // screen's gallery widget of thumbnails even when far more photos existed further back.
      const list = await fetchRecentGalleryMessages(activeCalId, 18);
      if (!cancelled && Array.isArray(list)) setGalleryPreviewMessages(list);
    })();
    return () => { cancelled = true; };
  }, [activeCalId, activeView, isInitialDataLoading]);

  const loadOlderChatMessages = React.useCallback(async () => {
    if (!activeCalId || loadingOlderChatRef.current || !hasMoreOlderChat) return;
    if (olderChatMessages.length >= MAX_OLDER_CHAT_MESSAGES) {
      setHasMoreOlderChat(false);
      return;
    }
    // Falls back to "now" when there's no local message to anchor the query on yet (e.g. the
    // gallery/chat is opened before the live listener's first snapshot has arrived) -- silently
    // returning here left onLoadOlderChat a no-op with no loading state and no error, which from
    // the "이전 사진/링크 더 보기" button looked exactly like a stuck/broken button.
    const oldest = allChatMessages[0];
    const beforeTs = (oldest && oldest.timestamp) || Date.now();
    loadingOlderChatRef.current = true;
    setLoadingOlderChat(true);
    const container = chatMessagesContainerRef.current;
    const prevHeight = container ? container.scrollHeight : 0;
    const prevTop = container ? container.scrollTop : 0;
    try {
      const older = await fetchOlderChatMessages(activeCalId, beforeTs, CHAT_OLDER_PAGE_SIZE);
      if (!older.length) {
        setHasMoreOlderChat(false);
        return;
      }
      if (older.length < CHAT_OLDER_PAGE_SIZE) setHasMoreOlderChat(false);
      setOlderChatMessages(prev => {
        const seen = new Set((prev || []).map(m => m.id));
        (chatMessages || []).forEach(m => { if (m && m.id) seen.add(m.id); });
        const add = older.filter(m => m && m.id && !seen.has(m.id));
        return add.length ? [...add, ...(prev || [])] : prev;
      });
      requestAnimationFrame(() => {
        const el = chatMessagesContainerRef.current;
        if (!el || !prevHeight) return;
        el.scrollTop = prevTop + (el.scrollHeight - prevHeight);
      });
    } finally {
      loadingOlderChatRef.current = false;
      setLoadingOlderChat(false);
    }
  }, [activeCalId, hasMoreOlderChat, allChatMessages, chatMessages, olderChatMessages]);
  // Refs for handleJumpToChatMessage's setTimeout retry (avoid stale hasMore/loadOlder closures).
  const loadOlderChatMessagesRef = React.useRef(loadOlderChatMessages);
  loadOlderChatMessagesRef.current = loadOlderChatMessages;
  const hasMoreOlderChatRef = React.useRef(hasMoreOlderChat);
  hasMoreOlderChatRef.current = hasMoreOlderChat;

  // Patch live/older/gallery-preview AND gallery archive together — miss any and lightbox
  // reopen (갤러리) can keep stale/partial photoIndex tags for photos outside the live window.
  const patchLocalChatMessage = (messageId, patch) => {
    const patchMessage = msg => msg.id === messageId ? { ...msg, ...patch } : msg;
    setChatMessages(prev => prev.map(patchMessage));
    setOlderChatMessages(prev => prev.map(patchMessage));
    setGalleryPreviewMessages(prev => prev.map(patchMessage));
    // Gallery uploads live here (chat listener is uploadSource=='chat' only). Missing this
    // left allChatMessages on a stale live snapshot whose empty imageTags overrode archive.
    setGalleryLiveMessages(prev => prev.map(patchMessage));
    patchGalleryArchiveMessage(messageId, patch);
  };
  const upsertLocalChatMessage = message => {
    if (!message?.id) return;
    const upsertMessage = prev => {
      const idx = prev.findIndex(item => item.id === message.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], ...message };
        return next;
      }
      const next = [...prev, message];
      next.sort((a, b) => (Number(a.timestamp) || 0) - (Number(b.timestamp) || 0) || String(a.id || '').localeCompare(String(b.id || '')));
      return next;
    };
    setChatMessages(upsertMessage);
    setOlderChatMessages(upsertMessage);
    setGalleryPreviewMessages(upsertMessage);
    invalidateGalleryItemCount(activeCalId);
  };
  const removeLocalChatMessage = messageId => {
    const dropMessage = prev => prev.filter(m => m.id !== messageId);
    setChatMessages(dropMessage);
    setOlderChatMessages(dropMessage);
    setGalleryPreviewMessages(dropMessage);
    setGalleryLiveMessages(dropMessage);
    if (typeof removeGalleryArchiveMessage === 'function') removeGalleryArchiveMessage(messageId);
    invalidateGalleryItemCount(activeCalId);
  };
  const patchLocalMemo = (memoId, patch) => {
    if (!memoId || !patch) return;
    setMemos(prev => (Array.isArray(prev) ? prev.map(m => m.id === memoId ? { ...m, ...patch } : m) : []));
    // patchLocalChatMessage's chat equivalent also patches the gallery archive copy -- this
    // didn't, so a pin toggle or a new comment on a memo already loaded into the Gallery/History
    // archive stayed stale there (only the live `memos` array saw it) until the archive's own
    // one-shot fetch happened to re-run.
    if (typeof patchGalleryArchiveMemo === 'function') patchGalleryArchiveMemo(memoId, patch);
  };
  const upsertLocalMemo = memo => {
    if (!memo?.id) return;
    setMemos(prev => {
      const list = Array.isArray(prev) ? [...prev] : [];
      const idx = list.findIndex(m => m.id === memo.id);
      if (idx >= 0) {
        list[idx] = { ...list[idx], ...memo };
      } else {
        list.unshift(memo);
      }
      list.sort((a, b) => (Number(b.createdAt) || Number(b.updatedAt) || 0) - (Number(a.createdAt) || Number(a.updatedAt) || 0));
      return list;
    });
  };
  const removeLocalMemo = memoId => {
    if (!memoId) return;
    setMemos(prev => (Array.isArray(prev) ? prev.filter(m => m.id !== memoId) : []));
  };
  // Mirrors ui-memo-view.js's own handleTogglePin/handleMemoCommentsChange so the main-screen
  // memo preview (which now renders the real MemoCard, not a bespoke row -- see
  // MemoPreviewSection) can pin/comment inline instead of crashing: MemoCard calls onTogglePin()
  // and onCommentsChange() unconditionally, with no typeof guard, so these must be real handlers.
  const handleTogglePinFromMemoPreview = async (memo) => {
    const nextPinned = !memo.isPinned;
    patchLocalMemo(memo.id, { isPinned: nextPinned });
    try {
      const updated = await writeCollectionDocumentWithFallback('memos', activeCal.id, memo.id, { isPinned: nextPinned }, 'update', '메모 고정 변경');
      if (!updated?.success) throw new Error('Memo pin update failed');
    } catch (err) {
      console.error('Failed to toggle memo pin:', err);
      patchLocalMemo(memo.id, { isPinned: memo.isPinned });
      showToast('고정 상태 변경 실패', 'error');
    }
  };
  const handleMemoCommentsChangeFromMemoPreview = async (memo, nextComments) => {
    let latest = 0;
    for (const c of (nextComments || [])) { const t = Number(c?.createdAt) || 0; if (t > latest) latest = t; }
    patchLocalMemo(memo.id, { comments: nextComments, lastCommentAt: latest });
    try {
      const updated = await writeCollectionDocumentWithFallback('memos', activeCal.id, memo.id, { comments: nextComments, lastCommentAt: latest }, 'update', '메모 댓글 저장');
      if (!updated?.success) throw new Error('Memo comment update failed');
      return true;
    } catch (err) {
      console.error('Failed to update memo comments:', err);
      patchLocalMemo(memo.id, { comments: memo.comments, lastCommentAt: memo.lastCommentAt });
      showToast('댓글 저장 실패', 'error');
      return false;
    }
  };

  React.useEffect(() => {
    if (activeView === 'chat' && chatMessagesContainerRef.current) {
      const container = chatMessagesContainerRef.current;
      if (loadingOlderChatRef.current) return;
      container.scrollTop = container.scrollHeight;
      const t = setTimeout(() => {
        if (!loadingOlderChatRef.current) container.scrollTop = container.scrollHeight;
      }, 50);
      return () => clearTimeout(t);
    }
  }, [activeView, chatMessages.length]);

  const [isHeaderVisible, setIsHeaderVisible] = React.useState(true);
  const lastScrollTopRef = React.useRef(0);
  const chatHeaderRevealUntilRef = React.useRef(0);
  // 채팅 입력줄(흔히 "키보드"로 불리는 하단 바) 수동 고정: null이면 기존처럼 스크롤 방향에
  // 따라 자동으로 열고 닫힌다. 사용자가 chat-keyboard-reopen-btn을 누르면 그 순간의 반대
  // 상태로 고정되어, 이후 스크롤과 무관하게 그 상태를 유지한다 (단, 실제 키보드가 열리거나
  // 입력창에 포커스가 가는 등 이미 있던 강제-표시 안전장치는 그대로 우선한다 -- 타이핑 중인
  // 입력창을 숨겨버리면 안 되므로).
  const [chatInputPin, setChatInputPin] = React.useState(null); // null | 'visible' | 'hidden'
  const toggleChatInputPin = () => {
    const currentlyVisible = chatInputPin === null ? isHeaderVisible : chatInputPin === 'visible';
    const next = currentlyVisible ? 'hidden' : 'visible';
    setChatInputPin(next);
    setIsHeaderVisible(next === 'visible');
  };

  // Cross-browser virtual keyboard detection.
  // Strategy:
  //  1. visualViewport resize/scroll events (all browsers)
  //  2. document focusin/focusout events (iOS Safari workaround for resize event delay)
  //  3. Distinguish address-bar shrink from true keyboard: keyboard height > 120px threshold
  //     (address bar change is typically only 40-60px on iOS; keyboard is 250px+)
  //  4. requestAnimationFrame coalescing to prevent Samsung double-fire flicker
  const isKeyboardOpenRef = React.useRef(false);
  const kbRafRef = React.useRef(null);
  React.useEffect(() => {
    const measureKeyboard = () => {
      // Use visualViewport when available; fall back to window dimensions (Firefox Android)
      const vh = window.visualViewport ? window.visualViewport.height : window.innerHeight;
      // On iOS the page may have scrolled up (visualViewport.offsetTop > 0), which adds to
      // the gap but isn't keyboard. On Android innerHeight truly shrinks with the keyboard.
      const offsetTop = window.visualViewport ? (window.visualViewport.offsetTop || 0) : 0;
      const keyboardHeight = window.innerHeight - vh - offsetTop;
      // 120px threshold: rules out iOS address bar animation (typically 40-60px change)
      const wasOpen = isKeyboardOpenRef.current;
      isKeyboardOpenRef.current = keyboardHeight > 120;
      if (isKeyboardOpenRef.current && !wasOpen) {
        // Keyboard just opened → force input bar visible immediately
        setIsHeaderVisible(true);
      }
    };

    const onVpChangeRaf = () => {
      if (kbRafRef.current) cancelAnimationFrame(kbRafRef.current);
      kbRafRef.current = requestAnimationFrame(measureKeyboard);
    };

    // Fallback for iOS Safari: resize event can be delayed up to ~300ms.
    // focusin on an input/textarea fires immediately → pre-mark keyboard as open so
    // the scroll handler ignores the incoming programmatic scrollTop update.
    const onFocusIn = (e) => {
      const target = e.target;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
        if (target.closest && target.closest('.chat-room-container')) {
          // Pre-emptively flag keyboard as open and reveal input bar BEFORE the
          // visualViewport resize fires (critical for iOS Safari where resize is delayed)
          isKeyboardOpenRef.current = true;
          setIsHeaderVisible(true);
          // Schedule a real measurement after keyboard animation (~350ms on iOS)
          setTimeout(measureKeyboard, 400);
        }
      }
    };
    const onFocusOut = (e) => {
      const target = e.target;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
        if (target.closest && target.closest('.chat-room-container')) {
          // Delay clearing keyboard flag to avoid race with next focusin (e.g. tapping emoji picker)
          setTimeout(() => {
            if (!document.activeElement || document.activeElement.tagName === 'BODY') {
              isKeyboardOpenRef.current = false;
            } else {
              measureKeyboard();
            }
          }, 300);
        }
      }
    };

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', onVpChangeRaf);
      window.visualViewport.addEventListener('scroll', onVpChangeRaf);
    } else {
      // Firefox Android fallback: window resize
      window.addEventListener('resize', onVpChangeRaf);
    }
    document.addEventListener('focusin', onFocusIn);
    document.addEventListener('focusout', onFocusOut);
    measureKeyboard();
    return () => {
      if (kbRafRef.current) cancelAnimationFrame(kbRafRef.current);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', onVpChangeRaf);
        window.visualViewport.removeEventListener('scroll', onVpChangeRaf);
      } else {
        window.removeEventListener('resize', onVpChangeRaf);
      }
      document.removeEventListener('focusin', onFocusIn);
      document.removeEventListener('focusout', onFocusOut);
    };
  }, []);

  const handleChatScroll = (e) => {
    // Keep composer while keyboard open, focused, OR draft text/images exist.
    // Mobile often blurs the textarea as soon as the message list is scrolled.
    const active = document.activeElement;
    const chatInputFocused = !!(
      active &&
      (active.tagName === 'TEXTAREA' || active.tagName === 'INPUT') &&
      active.closest &&
      (active.closest('.chat-composer') || active.closest('.chat-room-container'))
    );
    const hasComposerDraft = !!(String(chatInput || '').trim() || (chatImages && chatImages.length > 0) || (chatFileAttachments && chatFileAttachments.length > 0));
    const scrollTop = e.target.scrollTop;
    // Chat mounts by scrolling its list to the newest message. Do not treat that programmatic
    // scroll as the user's downward scroll and hide the fresh header.
    if (activeView === 'chat' && Date.now() < chatHeaderRevealUntilRef.current) {
      setIsHeaderVisible(true);
      lastScrollTopRef.current = scrollTop;
      return;
    }
    if (scrollTop < 120 && hasMoreOlderChat && !loadingOlderChatRef.current) {
      loadOlderChatMessages();
    }
    if (isKeyboardOpenRef.current || chatInputFocused || hasComposerDraft) {
      setIsHeaderVisible(true);
      lastScrollTopRef.current = scrollTop;
      return;
    }
    if (chatInputPin !== null) {
      setIsHeaderVisible(chatInputPin === 'visible');
      lastScrollTopRef.current = scrollTop;
      return;
    }
    const lastScrollTop = lastScrollTopRef.current;
    if (scrollTop < 10) {
      setIsHeaderVisible(true);
    } else if (scrollTop > lastScrollTop && scrollTop > 56) {
      setIsHeaderVisible(false);
    } else if (scrollTop < lastScrollTop) {
      setIsHeaderVisible(true);
    }
    lastScrollTopRef.current = scrollTop;
  };

  const handleSendChatMessage = async () => {
    const hasText = !!chatInput.trim();
    const imageCount = chatImages.length;
    const fileCount = Array.isArray(chatFileAttachments) ? chatFileAttachments.length : 0;
    if (!chatParticipantId) {
      showToast('참여자를 선택해 주세요.', 'error');
      return;
    }
    if (!hasText && imageCount === 0 && fileCount === 0) {
      showToast('메시지 내용, 사진 또는 파일을 입력해 주세요.', 'error');
      return;
    }
    const replyToPayload = chatReplyTarget ? {
      id: String(chatReplyTarget.id || ''),
      participantId: String(chatReplyTarget.participantId || ''),
      text: String(chatReplyTarget.text || ''),
      imageCount: Number(chatReplyTarget.imageCount) || 0
    } : null;
    setIsChatSubmitting(true);
    setChatUploadProgress({
      pct: 3,
      remainingSec: null,
      label: imageCount > 0 ? '채팅 준비 중...' : '채팅 전송 준비 중...',
      current: imageCount > 0 ? 1 : undefined,
      total: imageCount > 0 ? imageCount : undefined
    });

    try {
      // Link preview scraping is deliberately post-save. A third-party preview endpoint can
      // take several seconds or fail on a weak mobile network; it must never hold the user's
      // message/photo write hostage.
      const chatLinkUrl = hasText ? extractFirstUrl(chatInput) : '';
      let linkPreview = null;
      let firstSentMessageId = null;
      let ok = false;
      // The realtime onSnapshot listener is the only thing that would otherwise surface a just-
      // sent message -- and it has been observed in the field to silently stop delivering updates
      // (see the watchdog effect and the long-polling notes above attemptFirebaseInit), leaving a
      // sent message invisible in the sender's own feed until a manual reload. Collect what was
      // actually written here so it can be inserted locally right away regardless of listener
      // health; the listener/watchdog will just reconcile over the same id later.
      const sentMessagesForOptimisticInsert = [];
      // See handleDeleteChatMessagePhoto's comment on `.queued` -- true means the write only
      // reached the durable retry queue (network-related SDK+REST failure), not Firestore itself.
      // The optimistic insert below still makes it LOOK sent immediately, so without this flag
      // the sender would have no way to know it isn't actually saved yet and might, per the
      // user's own worry, send it again believing the first attempt silently failed.
      let sendWasQueued = false;
      if (fileCount > 0 && typeof navigator !== 'undefined' && navigator.onLine === false) {
        showToast('오프라인에서는 파일 업로드를 할 수 없습니다. 연결 후 다시 시도해 주세요.', 'error', 5000);
        return;
      }
      if (imageCount > 0 && typeof navigator !== 'undefined' && navigator.onLine === false
        && chatImages.every(image => image?.originalBlob && image?.thumbnailBlob)) {
        const queued = await enqueueWriteOperation({
          id: `chat_media_${activeCalId}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
          type: 'media-chat-send',
          calendarId: activeCalId,
          payload: {
            participantId: chatParticipantId,
            text: chatInput.trim(),
            timestamp: Date.now(),
            uploadSource: 'chat',
            images: chatImages.map(image => ({ originalBlob: image.originalBlob, thumbnailBlob: image.thumbnailBlob, metadata: image.metadata || null })),
            ...(replyToPayload ? { replyTo: replyToPayload } : {})
          }
        });
        if (!queued) throw new Error('사진 오프라인 저장 공간이 부족합니다.');
        setChatInput('');
        setChatImages([]);
        setChatFileAttachments([]);
        setChatReplyTarget(null);
        showToast('오프라인입니다. 사진은 연결되면 자동 전송됩니다.', 'info', 5000);
        return;
      }
      let uploadedFileAttachments = [];
      if (fileCount > 0) {
        setChatUploadProgress({ pct: 8, remainingSec: null, label: '파일 업로드 중...', current: 1, total: fileCount });
        uploadedFileAttachments = await uploadChatFileAttachments(activeCalId, chatFileAttachments, setChatUploadProgress);
        uploadedFileAttachments = uploadedFileAttachments.map(item => item ? { ...item, tags: withUploadDateTag(item.tags) } : item);
      }
      if (imageCount === 0) {
        const messageOperationId = `chat_${activeCalId}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
        const messageData = {
          participantId: chatParticipantId,
          text: chatInput.trim(),
          timestamp: Date.now(),
          uploadSource: 'chat'
        };
        if (uploadedFileAttachments.length) messageData.fileAttachments = uploadedFileAttachments;
        if (linkPreview) messageData.linkPreview = linkPreview;
        if (replyToPayload) messageData.replyTo = replyToPayload;
        setChatUploadProgress({ pct: 90, remainingSec: 1, label: '채팅 저장 중...' });
        ok = await (async () => {
          const sent = await writeCollectionDocumentWithFallback('messages', activeCalId, '', messageData, 'add', '채팅 저장', { documentId: messageOperationId });
          firstSentMessageId = sent?.id || null;
          if (sent?.id) sentMessagesForOptimisticInsert.push({ ...messageData, id: sent.id });
          if (sent?.queued) sendWasQueued = true;
          return Boolean(sent);
        })();
        if (ok) setChatUploadProgress({ pct: 100, remainingSec: 0, label: '전송 완료' });
      } else {
        // Bundle every attached image into a single multi-thumbnail message when possible.
        // Uploads that land in Storage produce short download URLs, so this is always a single
        // message in the normal case. Images that fall back to inline base64 (Storage
        // unavailable) keep their full quality -- instead the batch is split across multiple
        // chat messages if needed so no single message can exceed Firestore's 1MiB/doc limit.
        const resolvedImages = await resolveChatImageBatch(activeCalId, chatImages, setChatUploadProgress);
        const chunks = chunkResolvedImagesForMessages(resolvedImages);
        const baseTimestamp = Date.now();
        for (let i = 0; i < chunks.length; i++) {
          setChatUploadProgress({
            pct: Math.min(99, 92 + Math.round((i / Math.max(1, chunks.length)) * 7)),
            remainingSec: chunks.length - i,
            label: '채팅 저장 중...',
            current: Math.min(imageCount, i + 1),
            total: imageCount
          });
          const chunkImages = chunks[i];
          const messageOperationId = `chat_${activeCalId}_${baseTimestamp}_${i}_${Math.random().toString(36).slice(2, 8)}`;
          const messageData = {
            participantId: chatParticipantId,
            text: i === 0 ? chatInput.trim() : '',
            imageUrl: chunkImages[0].imageUrl,
            thumbUrl: chunkImages[0].thumbUrl,
            imageUrls: chunkImages.map(r => r.imageUrl),
            thumbUrls: chunkImages.map(r => r.thumbUrl),
            imageTags: chunkImages.map(r => buildMetadataTags(r.metadata, todayUploadTagOptions())),
            timestamp: baseTimestamp + i,
            uploadSource: 'chat'
          };
          if (i === 0 && uploadedFileAttachments.length) messageData.fileAttachments = uploadedFileAttachments;
          if (i === 0 && linkPreview) messageData.linkPreview = linkPreview;
          if (i === 0 && replyToPayload) messageData.replyTo = replyToPayload;
          const sent = await writeCollectionDocumentWithFallback('messages', activeCalId, '', messageData, 'add', '채팅 저장', { documentId: messageOperationId });
          if (!sent) throw new Error(`Chat send failed for chunk ${i + 1}/${chunks.length}`);
          if (i === 0) firstSentMessageId = sent.id || null;
          if (sent.id) sentMessagesForOptimisticInsert.push({ ...messageData, id: sent.id });
          if (sent.queued) sendWasQueued = true;
        }
        ok = true;
        setChatUploadProgress({ pct: 100, remainingSec: 0, label: '전송 완료', current: imageCount, total: imageCount });
      }

      if (ok) {
        sentMessagesForOptimisticInsert.forEach(msg => upsertLocalChatMessage(msg));
        if (firstSentMessageId && chatLinkUrl && shouldFetchLinkPreviewForChatUrl(chatLinkUrl)) {
          void fetchLinkPreview(chatLinkUrl, activeCalId).then(async result => {
            if (result?.status !== 'success') return;
            await writeCollectionDocumentWithFallback('messages', activeCalId, firstSentMessageId, {
              linkPreview: result.data
            }, 'update', '채팅 링크 미리보기 후처리');
          }).catch(error => console.warn('Background chat link preview failed:', error));
        }
        setChatInput('');
        setChatImages([]);
        setChatFileAttachments([]);
        setChatReplyTarget(null);
        if (chatTextareaRef.current) {
          chatTextareaRef.current.style.height = '34px';
        }
        if (!firebaseDb) {
          fetchChatMessagesRest(activeCalId).then(list => setChatMessages(list));
        }
        // No success toast in the normal case -- the new message is immediately visible in the
        // chat feed. A queued send is the one exception: it looks identical in the feed (via the
        // optimistic insert above) but hasn't actually reached the server yet, so say so.
        if (sendWasQueued) {
          showToast('네트워크가 불안정하여 전송을 대기열에 저장했습니다. 연결되면 자동으로 반영됩니다.', 'info', 6000);
        }
      } else {
        showRetryableUploadToast('등록 실패', () => handleSendChatMessage(), 5000);
      }
    } catch (err) {
      console.error('handleSendChatMessage failed:', err);
      showRetryableUploadToast('등록 실패', () => handleSendChatMessage(), 5000);
    } finally {
      setIsChatSubmitting(false);
      setChatUploadProgress(null);
    }
  };

  // 밈 키보드에서 썸네일을 탭했을 때: 이미 Storage에 올라가 있는 이미지라 handleSendChatMessage의
  // 업로드/오프라인 큐잉 로직이 전혀 필요 없다 -- 그 URL만 그대로 참조하는 메시지 한 건을 쓴다.
  const handleSendMemeImage = async (meme) => {
    if (!meme || (!meme.fullUrl && !meme.thumbUrl)) return;
    if (!chatParticipantId) { showToast('참여자를 선택해 주세요.', 'error'); return; }
    const url = meme.fullUrl || meme.thumbUrl;
    const thumb = meme.thumbUrl || meme.fullUrl;
    const messageOperationId = `chat_${activeCalId}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const messageData = {
      participantId: chatParticipantId,
      text: '',
      imageUrl: url,
      thumbUrl: thumb,
      imageUrls: [url],
      thumbUrls: [thumb],
      timestamp: Date.now(),
      // Deliberately distinct from 'chat' (getMessageImageEntries's sourceHint list doesn't
      // recognize 'meme' and falls back to 'chat' for it internally, so this doesn't change
      // asset-key behavior) -- composeGalleryPhotos below filters on this exact value to keep
      // meme stickers out of the gallery/memories screens; they're meant to live in chat only.
      uploadSource: 'meme'
    };
    // Tapping the meme thumbnail (a <button>, not the textarea) blurs the composer on mobile
    // Safari and can dismiss the on-screen keyboard mid-send; without this the scroll-driven
    // auto-hide (handleChatScroll) can collapse the composer/meme strip right as the write is
    // still in flight, making the whole thing look like it "disappeared".
    chatHeaderRevealUntilRef.current = Date.now() + 1000;
    setIsHeaderVisible(true);
    try {
      const sent = await writeCollectionDocumentWithFallback('messages', activeCalId, '', messageData, 'add', '밈 전송', { documentId: messageOperationId });
      if (sent?.id) upsertLocalChatMessage({ ...messageData, id: sent.id });
      else showToast('밈 전송에 실패했습니다.', 'error');
    } catch (err) {
      console.error('밈 전송 실패:', err);
      showToast('밈 전송에 실패했습니다.', 'error');
    }
  };

  const prepareGalleryImageUploads = async (files, title = '사진 업로드 준비 중...') => {
    const imageFiles = Array.from(files || []).filter(file => /^image\//i.test(file?.type || '') || isHeicFile(file));
    if (imageFiles.length === 0) {
      showToast('업로드할 이미지가 없습니다.', 'error');
      return [];
    }
    const limitedFiles = imageFiles.slice(0, 50);
    if (imageFiles.length > limitedFiles.length) showToast('최대 50장까지 업로드됩니다.', 'info');
    setChatUploadProgress({ pct: 2, remainingSec: null, label: title, current: 0, total: limitedFiles.length });
    const { succeeded, failed } = await processImageFilesSequentially(limitedFiles, progress => {
      const total = Math.max(1, progress.total || limitedFiles.length);
      const current = Math.min(total, progress.current || 0);
      setChatUploadProgress({
        pct: Math.min(25, 4 + Math.round((current / total) * 20)),
        remainingSec: null,
        label: '사진 압축 중...',
        current,
        total
      });
    });
    if (failed.length > 0) {
      console.error('Gallery image processing failed for:', failed.map(f => f.fileName));
      showToast(describeImageProcessingFailures(failed), 'error', 5000);
    }
    return succeeded;
  };

  const handleUploadGalleryImages = async files => {
    if (!guardLoadedCalendar()) return false;
    const compressed = await prepareGalleryImageUploads(files, '갤러리 사진 업로드 준비 중...');
    if (!compressed.length) {
      setChatUploadProgress(null);
      return false;
    }
    const fallbackParticipantId = chatParticipantId || getActiveParticipants(activeCal)[0]?.id || '';
    try {
      if (typeof navigator !== 'undefined' && navigator.onLine === false
        && compressed.every(image => image?.originalBlob && image?.thumbnailBlob)) {
        const queued = await enqueueWriteOperation({
          id: `gallery_media_${activeCal.id}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
          type: 'media-chat-send', calendarId: activeCal.id,
          payload: {
            participantId: fallbackParticipantId,
            text: '갤러리 사진', timestamp: Date.now(), uploadSource: 'gallery',
            images: compressed.map(image => ({ originalBlob: image.originalBlob, thumbnailBlob: image.thumbnailBlob, metadata: image.metadata || null }))
          }
        });
        if (!queued) throw new Error('갤러리 사진 오프라인 저장 공간이 부족합니다.');
        setChatUploadProgress({ pct: 100, remainingSec: 0, label: '연결 후 자동 등록 대기' });
        showToast('오프라인입니다. 갤러리 사진은 연결되면 자동 등록됩니다.', 'info', 5000);
        return true;
      }
      const resolvedImages = await resolveChatImageBatch(activeCal.id, compressed, progress => {
        setChatUploadProgress({
          ...progress,
          label: '갤러리 사진 업로드 중...'
        });
      });
      const chunks = chunkResolvedImagesForMessages(resolvedImages);
      const now = Date.now();
      let anyQueued = false;
      for (let i = 0; i < chunks.length; i += 1) {
        const chunkImages = chunks[i];
        const messageOperationId = `gallery_${activeCal.id}_${now}_${i}_${Math.random().toString(36).slice(2, 8)}`;
        setChatUploadProgress({
          pct: Math.min(99, 90 + Math.round((i / Math.max(1, chunks.length)) * 9)),
          remainingSec: Math.max(1, chunks.length - i),
          label: '갤러리 기록 저장 중...',
          current: Math.min(resolvedImages.length, i + 1),
          total: resolvedImages.length
        });
        const messageData = {
          participantId: fallbackParticipantId,
          text: i === 0 ? '갤러리 사진' : '',
          imageUrl: chunkImages[0].imageUrl,
          thumbUrl: chunkImages[0].thumbUrl,
          imageUrls: chunkImages.map(r => r.imageUrl),
          thumbUrls: chunkImages.map(r => r.thumbUrl),
          imageTags: chunkImages.map(r => buildMetadataTags(r.metadata, todayUploadTagOptions())),
          timestamp: now + i,
          // Marks this message as gallery-uploaded (vs typed into the chat composer) so the
          // Lightbox info panel can show "갤러리에서 업로드됨" instead of "채팅방에서 업로드됨".
          uploadSource: 'gallery'
        };
        const sent = await writeCollectionDocumentWithFallback('messages', activeCal.id, '', messageData, 'add', '갤러리 저장', { documentId: messageOperationId });
        if (!sent) throw new Error(`Gallery upload save failed ${i + 1}/${chunks.length}`);
        if (sent.queued) anyQueued = true;
        // Same reasoning as handleSendChatMessage's optimistic insert -- the gallery grid reads
        // from this same chatMessages state, and waiting on the realtime listener alone left a
        // freshly-pasted/uploaded photo invisible in the grid until a manual reload.
        if (sent.id) upsertLocalChatMessage({ ...messageData, id: sent.id });
      }
      setChatUploadProgress({ pct: 100, remainingSec: 0, label: '갤러리 업로드 완료' });
      // See handleDeleteChatMessagePhoto's comment on `.queued` -- a queued write hasn't actually
      // reached Firestore yet, so claiming "추가되었습니다" here would be the exact same
      // misleading signal that made a deleted photo look like it hadn't been deleted.
      if (anyQueued) {
        showToast('네트워크가 불안정하여 업로드를 대기열에 저장했습니다. 연결되면 자동으로 반영됩니다.', 'info', 6000);
      } else {
        showToast('갤러리에 사진이 추가되었습니다.', 'success');
      }
      forgetPreprocessedImages(files);
      return true;
    } catch (err) {
      console.error('handleUploadGalleryImages failed:', err);
      showRetryableUploadToast('갤러리 업로드 실패', () => handleUploadGalleryImages(files), 5000);
      return false;
    } finally {
      setTimeout(() => setChatUploadProgress(null), 250);
    }
  };

  // 링크 tab's own '추가'/'붙여넣기' (see ui-chat-gallery.js's onAddLink) -- a "link" in the
  // gallery isn't its own stored entity, it's just a URL that sharedLinks finds inside some chat
  // message's or memo's text. Adding one directly here means writing a small gallery-only text
  // message containing that URL, same uploadSource:'gallery' pattern handleUploadGalleryImages
  // uses for a directly-uploaded photo, so it shows up in the gallery's 링크 tab without also
  // appearing as a message in the chat feed.
  const handleAddGalleryLink = async url => {
    if (!guardLoadedCalendar()) return false;
    const cleanUrl = String(url || '').trim();
    if (!cleanUrl) {
      showToast('올바른 링크를 입력해 주세요.', 'error');
      return false;
    }
    const fallbackParticipantId = chatParticipantId || getActiveParticipants(activeCal)[0]?.id || '';
    const messageOperationId = `gallery_link_${activeCal.id}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const messageData = {
      participantId: fallbackParticipantId,
      text: cleanUrl,
      timestamp: Date.now(),
      uploadSource: 'gallery'
    };
    try {
      const sent = await writeCollectionDocumentWithFallback('messages', activeCal.id, '', messageData, 'add', '갤러리 링크 저장', { documentId: messageOperationId });
      if (!sent) throw new Error('Gallery link save failed');
      // Same reasoning as handleUploadGalleryImages -- don't wait on the realtime listener to
      // echo this back before it shows up in the gallery's 링크 tab.
      if (sent.id) upsertLocalChatMessage({ ...messageData, id: sent.id });
      if (shouldFetchLinkPreviewForChatUrl(cleanUrl)) {
        const sentId = sent.id || messageOperationId;
        void fetchLinkPreview(cleanUrl, activeCal.id).then(async result => {
          if (result?.status !== 'success') return;
          await writeCollectionDocumentWithFallback('messages', activeCal.id, sentId, { linkPreview: result.data }, 'update', '갤러리 링크 미리보기 후처리');
        }).catch(error => console.warn('Background gallery link preview failed:', error));
      }
      // 'queued' (not a plain boolean) tells the caller (ui-chat-gallery.js) this only reached
      // the durable retry queue, not Firestore itself yet -- see handleDeleteChatMessagePhoto's
      // comment on `.queued` for why claiming plain success here would be misleading.
      return sent.queued ? 'queued' : true;
    } catch (err) {
      console.error('handleAddGalleryLink failed:', err);
      showToast('링크 저장 실패', 'error');
      return false;
    }
  };

  const handleAddGalleryFiles = async attachments => {
    if (!guardLoadedCalendar()) return false;
    const files = (attachments || []).map(item => sanitizeFileAttachment({
      url: String(item?.url || '').trim(),
      name: String(item?.name || '파일').trim(),
      mime: String(item?.mime || item?.contentType || '').trim(),
      size: Number(item?.size) || 0,
      storagePath: String(item?.storagePath || '').trim(),
      uploadedAt: Number(item?.uploadedAt) || Date.now(),
      id: String(item?.id || '').trim(),
      ext: String(item?.ext || '').trim(),
      tags: String(item?.tags || '').trim()
    })).filter(Boolean);
    files.forEach((item, index) => {
      files[index] = { ...item, tags: withUploadDateTag(item.tags) };
    });
    if (!files.length) {
      showToast('공유 파일 정보가 불완전합니다. 모아엘가에서 파일을 다시 일괄공유한 뒤 붙여넣어 주세요.', 'error');
      return false;
    }
    const fallbackParticipantId = chatParticipantId || getActiveParticipants(activeCal)[0]?.id || '';
    const messageOperationId = `gallery_files_${activeCal.id}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const messageData = {
      participantId: fallbackParticipantId,
      text: files.map(item => item.name).filter(Boolean).join('\n'),
      timestamp: Date.now(),
      uploadSource: 'gallery',
      fileAttachments: files
    };
    try {
      const sent = await writeCollectionDocumentWithFallback('messages', activeCal.id, '', messageData, 'add', '갤러리 파일 저장', { documentId: messageOperationId });
      if (!sent) throw new Error('Gallery file save failed');
      if (sent.id) {
        upsertLocalChatMessage({ ...messageData, id: sent.id });
        if (typeof patchGalleryArchiveMessage === 'function') patchGalleryArchiveMessage(sent.id, { ...messageData, id: sent.id });
      }
      return sent.queued ? 'queued' : true;
    } catch (err) {
      console.error('handleAddGalleryFiles failed:', err);
      showToast('파일 저장 실패', 'error');
      return false;
    }
  };

  const handleDeleteGalleryFiles = items => deleteGalleryFileAttachments(items, {
    activeCal,
    activeCalId,
    guardLoadedCalendar,
    findChatMessageById,
    getMessageImageEntries,
    writeCollectionDocumentWithFallback,
    removeLocalChatMessage,
    patchLocalChatMessage,
    getLiveFirebaseStorage,
    ensureFirebaseStorageReady
  });

  const handleDeleteGalleryLinks = items => deleteGalleryLinkItems(items, {
    activeCal,
    guardLoadedCalendar,
    findChatMessageById,
    getMessageImageEntries,
    writeCollectionDocumentWithFallback,
    removeLocalChatMessage,
    patchLocalChatMessage
  });

  // 다른 캘린더의 라이트박스에서 "URL 복사하기"로 복사한 사진을 이 갤러리에 붙여넣는다
  // (ui-chat-gallery.js의 onPasteGatherPhoto). URL은 그대로 재사용한다 -- 사진 삭제는 어느
  // 캘린더에서든 이 메시지 문서(참조)만 지울 뿐 Storage 원본 파일은 건드리지 않으므로(기존
  // 사진 삭제 기능도 동일), 두 캘린더 중 어느 쪽에서 지워도 다른 쪽엔 전혀 영향이 없다. 태그도
  // 붙여넣는 시점의 값을 이 메시지 문서 자신의 imageTags에 그대로 복사해 넣으므로, 그 이후
  // 어느 쪽에서 태그를 추가/삭제해도 서로 완전히 독립적이다(한쪽 문서만 바뀔 뿐).
  const handlePasteGatherPhoto = async (url, tags) => {
    if (!guardLoadedCalendar()) return false;
    const cleanUrl = String(url || '').trim();
    if (!/^https?:\/\//i.test(cleanUrl)) {
      showToast('올바른 사진 URL이 아닙니다.', 'error');
      return false;
    }
    const fallbackParticipantId = chatParticipantId || getActiveParticipants(activeCal)[0]?.id || '';
    const messageOperationId = `gather_photo_paste_${activeCal.id}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const tagTokens = String(tags || '').split(/[,\s#]+/).map(t => sanitizeText(t.trim(), 30)).filter(Boolean).slice(0, 10);
    const cleanTags = sanitizeText(tagTokens.join(' '), 100);
    const messageData = {
      participantId: fallbackParticipantId,
      text: '',
      imageUrl: cleanUrl,
      thumbUrl: cleanUrl,
      imageUrls: [cleanUrl],
      thumbUrls: [cleanUrl],
      imageTags: [cleanTags],
      timestamp: Date.now(),
      uploadSource: 'gallery'
    };
    try {
      const sent = await writeCollectionDocumentWithFallback('messages', activeCal.id, '', messageData, 'add', '사진 붙여넣기(다른 캘린더)', { documentId: messageOperationId });
      if (!sent) throw new Error('Gather photo paste save failed');
      if (sent.id) upsertLocalChatMessage({ ...messageData, id: sent.id });
      showToast(sent.queued ? '네트워크가 불안정하여 대기열에 저장했습니다. 연결되면 자동으로 반영됩니다.' : '사진을 붙여넣었습니다.', sent.queued ? 'info' : 'success');
      return sent.queued ? 'queued' : true;
    } catch (err) {
      console.error('handlePasteGatherPhoto failed:', err);
      showToast('사진 붙여넣기 실패', 'error');
      return false;
    }
  };

  // 위 handlePasteGatherPhoto의 일괄(여러 장) 버전 -- 갤러리 "편집" 모드에서 여러 장을 골라
  // "일괄공유"로 묶어 보낸 URL을 붙여넣을 때 쓴다. 사진마다 독립된 메시지 문서로 저장해, 이후
  // 어느 캘린더에서 태그를 바꾸거나 사진을 지워도 서로 전혀 영향이 없다(단일 붙여넣기와 동일).
  const handlePasteGatherPhotos = async (photos) => {
    if (!guardLoadedCalendar()) return false;
    const list = Array.isArray(photos)
      ? photos.filter(p => p && /^https?:\/\//i.test(String(p.url || '')))
      : [];
    if (!list.length) {
      showToast('올바른 사진이 없습니다.', 'error');
      return false;
    }
    const fallbackParticipantId = chatParticipantId || getActiveParticipants(activeCal)[0]?.id || '';
    const baseTs = Date.now();
    let anyQueued = false;
    try {
      for (let i = 0; i < list.length; i++) {
        const cleanUrl = String(list[i].url).trim();
        const tagTokens = String(list[i].tags || '').split(/[,\s#]+/).map(t => sanitizeText(t.trim(), 30)).filter(Boolean).slice(0, 10);
        const cleanTags = sanitizeText(tagTokens.join(' '), 100);
        const messageOperationId = `gather_photos_paste_${activeCal.id}_${baseTs}_${i}_${Math.random().toString(36).slice(2, 8)}`;
        const messageData = {
          participantId: fallbackParticipantId,
          text: '',
          imageUrl: cleanUrl,
          thumbUrl: cleanUrl,
          imageUrls: [cleanUrl],
          thumbUrls: [cleanUrl],
          imageTags: [cleanTags],
          timestamp: baseTs + i,
          uploadSource: 'gallery'
        };
        const sent = await writeCollectionDocumentWithFallback('messages', activeCal.id, '', messageData, 'add', '사진 일괄 붙여넣기(다른 캘린더)', { documentId: messageOperationId });
        if (!sent) throw new Error(`Gather photos paste save failed at index ${i}`);
        if (sent.id) upsertLocalChatMessage({ ...messageData, id: sent.id });
        if (sent.queued) anyQueued = true;
      }
      showToast(anyQueued
        ? '네트워크가 불안정하여 일부를 대기열에 저장했습니다. 연결되면 자동으로 반영됩니다.'
        : `사진 ${list.length}장을 붙여넣었습니다.`, anyQueued ? 'info' : 'success');
      return true;
    } catch (err) {
      console.error('handlePasteGatherPhotos failed:', err);
      showToast('사진 붙여넣기 실패', 'error');
      return false;
    }
  };

  const handleDeleteMessage = (msg) => {
    const deletingMessage = { ...msg, calId: activeCalId };
    const participants = getActiveParticipants(activeCal);
    const author = participants.find(p => p.id === msg.participantId);
    const authorName = author?.name || '알수없음';
    let contentText = msg.text || '';
    if (contentText.length > 20) {
      contentText = contentText.substring(0, 20) + '...';
    } else if (!contentText && msg.imageUrl) {
      contentText = '사진';
    }
    showConfirmDialog('채팅 삭제', `${authorName}님의 "${contentText}" 내용을 삭제하시겠습니까?`, () => handleConfirmDeleteMessage(deletingMessage));
  };

  const handleConfirmDeleteMessage = async (deletingMessage) => {
    if (!deletingMessage) return;
    const { id, calId } = deletingMessage;
    const sourceSnapshot = JSON.parse(JSON.stringify(deletingMessage));
    try {
      const deleted = await writeCollectionDocumentWithFallback('messages', calId, id, null, 'delete', '메시지 삭제');
      const ok = Boolean(deleted);
      if (ok) {
        // See handleDeleteChatMessagePhoto's matching comment -- `deleted.queued` means this was
        // only durably saved for a later automatic retry, not actually removed on the server yet.
        const wasQueued = Boolean(deleted?.queued);
        removeLocalChatMessage(id);
        await unlinkMeetingPhotoReferences(id, null);
        if (!firebaseDb) {
          fetchChatMessagesRest(calId).then(list => setChatMessages(list));
        }
        const finalizeStorage = () => { deleteAllChatImagesFromStorage(sourceSnapshot); };
        const restoreMessage = async () => {
          try {
            const allowed = ['participantId', 'text', 'timestamp', 'imageUrl', 'thumbUrl', 'imageUrls', 'thumbUrls', 'imageTags', 'uploadSource', 'linkPreview', 'fileAttachments', 'replyTo'];
            const createData = {};
            for (const key of allowed) {
              if (sourceSnapshot[key] !== undefined) createData[key] = sourceSnapshot[key];
            }
            if (typeof createData.participantId !== 'string') createData.participantId = String(sourceSnapshot.participantId || '');
            if (typeof createData.timestamp !== 'number') createData.timestamp = Number(sourceSnapshot.timestamp) || Date.now();
            if (createData.text === undefined) createData.text = String(sourceSnapshot.text || '');
            const data = sanitizeMessageForFirestore(createData);
            const restored = await writeCollectionDocumentWithFallback('messages', calId, id, data, 'set', '메시지 복원');
            if (!restored) throw new Error('Message restore failed');
            upsertLocalChatMessage({ ...sourceSnapshot, ...data, id });
            showToast('메시지 삭제를 되돌렸습니다.', 'success', 3000);
          } catch (err) {
            console.error('handleConfirmDeleteMessage undo failed:', err);
            showToast('메시지 복원 실패', 'error', 4000);
          }
        };
        if (wasQueued) {
          showToast('네트워크가 불안정하여 삭제를 대기열에 저장했습니다. 연결되면 자동으로 반영됩니다.', 'info', 6000);
        } else if (firebaseDb) {
          showUndoableDeleteToast('메시지가 삭제되었습니다.', restoreMessage, finalizeStorage, 5000);
        } else {
          showToast('삭제완료', 'delete', 3000, null, finalizeStorage);
        }
      } else {
        showToast('삭제 실패', 'error', 3000);
      }
    } catch (err) {
      console.error('handleConfirmDeleteMessage failed:', err);
      showToast('삭제 실패', 'error', 3000);
    }
  };

  const handleEditMessage = (msg) => {
    setEditingMessage({ ...msg, calId: activeCalId });
  };

  const handleSaveEditMessage = async (newText, newImages, newParticipantId, nextFileAttachments) => {
    if (!editingMessage) return false;
    const { id, calId } = editingMessage;
    const resolvedParticipantId = newParticipantId || editingMessage.participantId;
    const hasNewImages = (newImages || []).some(img => !img.isExisting);
    if (hasNewImages) setChatUploadProgress({ pct: 0, remainingSec: null });
    let saved = false;
    try {
      let linkPreview = null;
      const url = extractFirstUrl(newText);
      if (url && shouldFetchLinkPreviewForChatUrl(url)) {
        const oldUrl = extractFirstUrl(editingMessage.text);
        if (oldUrl === url && editingMessage.linkPreview) {
          linkPreview = editingMessage.linkPreview;
        } else {
          try {
            const res = await fetchLinkPreview(url, calId);
            if (res && res.status === 'success') {
              linkPreview = res.data;
            }
          } catch (e) {
            console.error('Failed to fetch link preview on message update:', e);
          }
        }
      }

      // Images already on the message (isExisting) are passed through as-is; freshly
      // picked ones get uploaded via resolveChatImageBatch, matching the compose flow. If the
      // result still doesn't fit in one document (inline base64 fallback with many images),
      // the edited message keeps the first chunk and any remainder is appended as new messages
      // right after it, same as the compose flow -- quality is never degraded to force a fit.
      const resolvedImages = await resolveChatImageBatch(calId, newImages || [], hasNewImages ? setChatUploadProgress : null);
      const chunks = resolvedImages.length > 0 ? chunkResolvedImagesForMessages(resolvedImages) : [[]];
      const firstChunk = chunks[0];
      const extraChunks = chunks.slice(1);

      // imageTags is parallel-indexed to imageUrls/thumbUrls by ARRAY POSITION, not by the
      // image's identity -- so it has to be explicitly rebuilt here to match the edited image
      // order. Previously this was omitted from `data` entirely, so Firestore's partial update
      // left the old imageTags array untouched: removing a tagged photo and attaching a new one
      // in its place made the new photo silently inherit the old one's tag, since it landed on
      // the same array index. Kept (isExisting) images carry their own tag forward by matching
      // their original URL (not position, since an earlier removal can shift everything after
      // it); freshly attached images start untagged.
      const originalUrls = Array.isArray(editingMessage.imageUrls) && editingMessage.imageUrls.length > 0
        ? editingMessage.imageUrls
        : (editingMessage.imageUrl ? [editingMessage.imageUrl] : []);
      const originalTags = Array.isArray(editingMessage.imageTags) ? editingMessage.imageTags : [];
      const nextImageTags = (newImages || []).map(img => {
        if (!img.isExisting) return '';
        const originalIdx = originalUrls.indexOf(img.original);
        return originalIdx >= 0 ? (originalTags[originalIdx] || '') : '';
      });

      const incomingFiles = Array.isArray(nextFileAttachments) ? nextFileAttachments : (editingMessage.fileAttachments || []);
      let uploadedFileAttachments = incomingFiles.filter(f => f && f.url && !f.file);
      const pendingFiles = incomingFiles.filter(f => f && f.file);
      if (pendingFiles.length && typeof uploadChatFileAttachments === 'function') {
        const uploaded = await uploadChatFileAttachments(calId, pendingFiles, hasNewImages || pendingFiles.length ? setChatUploadProgress : null);
        uploadedFileAttachments = uploadedFileAttachments.concat((uploaded || []).map(item => item ? { ...item, tags: withUploadDateTag(item.tags) } : item));
      }

      const data = {
        text: newText,
        imageUrl: firstChunk[0]?.imageUrl || '',
        thumbUrl: firstChunk[0]?.thumbUrl || '',
        imageUrls: firstChunk.map(r => r.imageUrl),
        thumbUrls: firstChunk.map(r => r.thumbUrl),
        imageTags: nextImageTags.slice(0, firstChunk.length),
        linkPreview: linkPreview || null,
        fileAttachments: uploadedFileAttachments
      };
      if (resolvedParticipantId !== editingMessage.participantId) data.participantId = resolvedParticipantId;
      let ok = false;
      const updateResult = await writeCollectionDocumentWithFallback('messages', calId, id, data, 'update', '메시지 수정');
      ok = Boolean(updateResult);
      // See handleDeleteChatMessagePhoto's comment on `.queued`.
      let editWasQueued = Boolean(updateResult?.queued);
      if (ok && extraChunks.length > 0) {
        const baseTimestamp = (editingMessage.timestamp || Date.now()) + 1;
        for (let i = 0; i < extraChunks.length; i++) {
          const chunkImages = extraChunks[i];
          const sent = await writeCollectionDocumentWithFallback('messages', calId, '', {
            participantId: resolvedParticipantId,
            text: '',
            imageUrl: chunkImages[0].imageUrl,
            thumbUrl: chunkImages[0].thumbUrl,
            imageUrls: chunkImages.map(r => r.imageUrl),
            thumbUrls: chunkImages.map(r => r.thumbUrl),
            timestamp: baseTimestamp + i
          }, 'add', '메시지 분할 저장', { documentId: `edit_${encodeURIComponent(calId)}_${encodeURIComponent(id)}_${i}` });
          if (!sent) {
            ok = false;
            break;
          }
          if (sent.queued) editWasQueued = true;
        }
      }
      if (ok) {
        const previousRestore = {
          text: editingMessage.text || '',
          imageUrl: editingMessage.imageUrl || '',
          thumbUrl: editingMessage.thumbUrl || '',
          imageUrls: Array.isArray(editingMessage.imageUrls) ? editingMessage.imageUrls : (editingMessage.imageUrl ? [editingMessage.imageUrl] : []),
          thumbUrls: Array.isArray(editingMessage.thumbUrls) ? editingMessage.thumbUrls : (editingMessage.thumbUrl ? [editingMessage.thumbUrl] : []),
          imageTags: Array.isArray(editingMessage.imageTags) ? editingMessage.imageTags : [],
          linkPreview: editingMessage.linkPreview || null,
          participantId: editingMessage.participantId
        };
        const originalEntries = Array.isArray(editingMessage.imageUrls) && editingMessage.imageUrls.length > 0
          ? editingMessage.imageUrls.map((url, idx) => ({ original: url, thumbnail: (editingMessage.thumbUrls || [])[idx] || url }))
          : (editingMessage.imageUrl ? [{ original: editingMessage.imageUrl, thumbnail: editingMessage.thumbUrl || editingMessage.imageUrl }] : []);
        const keptOriginals = new Set((newImages || []).filter(img => img.isExisting).map(img => img.original));
        const removedEntries = originalEntries.filter(entry => !keptOriginals.has(entry.original));
        const finalizeRemovedStorage = () => {
          if (removedEntries.length > 0) {
            deleteAllChatImagesFromStorage({
              imageUrls: removedEntries.map(e => e.original),
              thumbUrls: removedEntries.map(e => e.thumbnail)
            });
          }
        };
        patchLocalChatMessage(id, data);
        if (!firebaseDb) {
          fetchChatMessagesRest(calId).then(list => setChatMessages(list));
        }
        if (editWasQueued) {
          showToast('네트워크가 불안정하여 수정을 대기열에 저장했습니다. 연결되면 자동으로 반영됩니다.', 'info', 6000);
        } else {
          showToast('메시지가 수정되었습니다.', 'success', 5000, async () => {
            try {
              const restoreData = sanitizeMessageForFirestore(previousRestore);
              const restored = await writeCollectionDocumentWithFallback('messages', calId, id, restoreData, 'update', '메시지 복원');
              if (!restored) throw new Error('Message restore failed');
              patchLocalChatMessage(id, restoreData);
              showToast('메시지 수정을 되돌렸습니다.', 'success', 3000);
            } catch (err) {
              console.error('handleSaveEditMessage undo failed:', err);
              showToast('수정 되돌리기 실패', 'error', 4000);
            }
          }, finalizeRemovedStorage);
        }
        saved = true;
      } else {
        showToast('수정 실패', 'error', 3000);
      }
    } catch (err) {
      console.error('handleSaveEditMessage failed:', err);
      showToast(describeFirebaseWriteError(err, '수정 실패'), 'error', 4000);
    } finally {
      setChatUploadProgress(null);
    }
    return saved;
  };

  const handlePromoteInlineChatImage = async ({ url, meta, index = 0 }) => {
    if (typeof url !== 'string' || !url.startsWith('data:')) return url;

    const messageId = meta?.messageId;
    const sourceMessage = messageId
      ? (chatMessages || []).find(msg => msg.id === messageId)
      : null;
    const progressMap = new Map();
    const updateProgress = (taskKey, transferred, total) => {
      progressMap.set(taskKey, { transferred, total });
      const totals = Array.from(progressMap.values());
      const totalBytes = totals.reduce((sum, item) => sum + (item.total || 0), 0);
      const transferredBytes = totals.reduce((sum, item) => sum + (item.transferred || 0), 0);
      const pct = totalBytes > 0 ? Math.max(1, Math.min(99, Math.round((transferredBytes / totalBytes) * 100))) : 1;
      setChatUploadProgress({ pct, remainingSec: null });
    };

    setChatUploadProgress({ pct: 3, remainingSec: null, label: '공유 URL 준비 중...' });
    try {
      if (sourceMessage) {
        const imageUrls = Array.isArray(sourceMessage.imageUrls) && sourceMessage.imageUrls.length > 0
          ? [...sourceMessage.imageUrls]
          : (sourceMessage.imageUrl ? [sourceMessage.imageUrl] : []);
        const thumbUrls = Array.isArray(sourceMessage.thumbUrls) && sourceMessage.thumbUrls.length > 0
          ? [...sourceMessage.thumbUrls]
          : (sourceMessage.thumbUrl ? [sourceMessage.thumbUrl] : []);
        let targetIndex = Number.isInteger(meta?.imageIndex) ? meta.imageIndex : Number(index || 0);
        if (!Number.isInteger(targetIndex) || targetIndex < 0) targetIndex = Math.max(0, imageUrls.findIndex(item => item === url));
        while (imageUrls.length <= targetIndex) imageUrls.push('');
        while (thumbUrls.length <= targetIndex) thumbUrls.push(imageUrls[targetIndex] || url);

        const originalUrl = imageUrls[targetIndex] || url;
        const originalThumbUrl = thumbUrls[targetIndex] || meta?.thumb || originalUrl;
        if (typeof originalUrl === 'string' && /^https?:\/\//.test(originalUrl)) return { shareUrl: originalUrl, imageUrl: originalUrl };

        const shareUrls = Array.isArray(sourceMessage.imageShareUrls) ? [...sourceMessage.imageShareUrls] : [];
        const existingShareUrl = shareUrls[targetIndex];
        if (typeof existingShareUrl === 'string' && /^https?:\/\//.test(existingShareUrl)) {
          setChatUploadProgress({ pct: 100, remainingSec: 0, label: '기존 URL 확인완료' });
          return { shareUrl: existingShareUrl, imageUrl: null };
        }

        setChatUploadProgress({ pct: 35, remainingSec: null, label: '공유 링크 저장 중...' });
        const shareUrl = await createImageShareDocument(activeCalId, originalUrl, {
          ...meta,
          messageId: sourceMessage.id,
          imageIndex: targetIndex,
          thumb: originalThumbUrl
        });
        while (shareUrls.length <= targetIndex) shareUrls.push('');
        shareUrls[targetIndex] = shareUrl;
        const data = { imageShareUrls: shareUrls };
        const ok = await writeCollectionDocumentWithFallback('messages', activeCalId, sourceMessage.id, data, 'update', '메시지 공유 URL 저장');
        if (!ok) throw new Error('Message share URL cache update failed');
        patchLocalChatMessage(sourceMessage.id, data);
        setChatUploadProgress({ pct: 100, remainingSec: 0, label: 'URL 생성완료' });
        return { shareUrl, imageUrl: null };
      }

      if (!(getLiveFirebaseStorage() || await ensureFirebaseStorageReady())) throw new Error('Firebase Storage is not available');
      const uploaded = await uploadInlineChatImageToStorage(activeCalId, url, meta?.thumb || url, index, updateProgress, 12000);
      if (!uploaded?.imageUrl) throw new Error('Image upload failed');
      setChatUploadProgress({ pct: 100, remainingSec: 0, label: 'URL 생성완료' });
      return { shareUrl: uploaded.imageUrl, imageUrl: uploaded.imageUrl };
    } catch (err) {
      console.warn('Storage image URL generation failed, using Firestore share fallback:', err);
      try {
        setChatUploadProgress({ pct: 55, remainingSec: null, label: '대체 공유 링크 생성 중...' });
        const shareUrl = await createImageShareDocument(activeCalId, url, meta || {});
        setChatUploadProgress({ pct: 100, remainingSec: 0, label: 'URL 생성완료' });
        return { shareUrl, imageUrl: null };
      } catch (fallbackErr) {
        console.error('handlePromoteInlineChatImage failed:', fallbackErr);
        showRetryableUploadToast('이미지 URL 생성 실패', () => handlePromoteInlineChatImage({ url, meta, index }), 5000);
        throw fallbackErr;
      }
    } finally {
      setTimeout(() => setChatUploadProgress(null), 300);
    }
  };

  // Per-image hashtags (회비정산 URL 캐시와 동일하게 imageUrls/thumbUrls와 나란한 배열로 메시지
  // 문서에 저장, 한 이미지당 공백/쉼표로 구분된 태그 여러 개를 하나의 문자열로 보관) -- 갤러리/
  // 라이트박스의 이미지정보 패널에서 입력하고, GlobalSearchModal의 태그 검색에서 사용된다.
  // 이전 태그 목록과 비교해 새로 추가/삭제된 토큰마다 활동 로그를 남겨 어드민 페이지에서
  // 언제 어떤 해시태그가 추가/삭제됐는지 확인할 수 있게 한다.
  const parseFlexibleDateTokens = text => {
    const source = String(text || '').replace(/[()[\]{}'"“”‘’]/g, ' ');
    const dates = new Set();
    const pushDate = (yearRaw, monthRaw, dayRaw) => {
      let year = Number(yearRaw);
      const month = Number(monthRaw);
      const day = Number(dayRaw);
      if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) return;
      if (year < 100) year += 2000;
      if (year < 2000 || year > 2099 || month < 1 || month > 12 || day < 1 || day > 31) return;
      const check = new Date(year, month - 1, day);
      if (check.getFullYear() !== year || check.getMonth() !== month - 1 || check.getDate() !== day) return;
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      if (isValidDateString(dateStr)) dates.add(dateStr);
    };
    source.replace(/(?:^|[^\d])(\d{2,4})\s*[.\-/]\s*(\d{1,2})\s*[.\-/]\s*(\d{1,2})(?=$|[^\d])/g, (match, y, m, d) => {
      pushDate(y, m, d);
      return match;
    });
    source.replace(/(?:^|[^\d])(\d{2,4})\s*년\s*(\d{1,2})\s*월\s*(\d{1,2})\s*일?/g, (match, y, m, d) => {
      pushDate(y, m, d);
      return match;
    });
    source.replace(/(?:^|[^\d])(\d{4})(\d{2})(\d{2})(?=$|[^\d])/g, (match, y, m, d) => {
      pushDate(y, m, d);
      return match;
    });
    source.replace(/(?:^|[^\d])(\d{2})(\d{2})(\d{2})(?=$|[^\d])/g, (match, y, m, d) => {
      pushDate(y, m, d);
      return match;
    });
    return Array.from(dates);
  };

  // The photo's own tag text is the single source of truth for which dates it's linked to --
  // this both adds new links for date tokens found in the CURRENT tags and drops any earlier
  // auto-link (matched by sourceMessageId+sourceImageIndex, never by URL -- a replaced photo
  // keeps the same identity even though its URL changes) whose date is no longer present, so a
  // photo tagged "260912 260815" shows up under both dates and staying consistent everywhere as
  // tags are edited. Manually uploaded 일정 사진 (added via DateModal's own upload button, no
  // sourceMessageId) are a separate, standalone thing and are never touched here.
  const linkTaggedImageToMeetingDates = async (dateStrs, photo, sourceMessage, cleanTags) => {
    if (!activeCal || !sourceMessage?.id || !photo?.imageUrl) return 0;
    const validDates = Array.from(new Set((Array.isArray(dateStrs) ? dateStrs : []).filter(isValidDateString)));
    const sourceMessageId = sourceMessage.id;
    const sourceImageIndex = Number.isInteger(photo.imageIndex) ? photo.imageIndex : 0;
    const existingMeetings = getConfirmedMeetings(activeCal);
    const byDate = new Map(existingMeetings.map(meeting => [meeting.date, {
      ...meeting,
      photos: Array.isArray(meeting.photos) ? [...meeting.photos] : []
    }]));
    const now = Date.now();
    let changed = false;
    byDate.forEach((meeting, dateStr) => {
      if (validDates.includes(dateStr)) return;
      const nextPhotos = meeting.photos.filter(p => !(p?.sourceMessageId === sourceMessageId && p?.sourceImageIndex === sourceImageIndex));
      if (nextPhotos.length !== meeting.photos.length) {
        byDate.set(dateStr, { ...meeting, photos: nextPhotos });
        changed = true;
      }
    });
    let linkedCount = 0;
    validDates.forEach((dateStr, index) => {
      const meeting = byDate.get(dateStr) || {
        date: dateStr,
        note: '',
        confirmedAt: null,
        confirmed: false,
        expenses: [],
        photos: []
      };
      const photos = Array.isArray(meeting.photos) ? meeting.photos : [];
      const alreadyLinked = photos.some(p => p?.sourceMessageId === sourceMessageId && p?.sourceImageIndex === sourceImageIndex);
      if (alreadyLinked) {
        byDate.set(dateStr, meeting);
        return;
      }
      const photoId = `photo_${activeCal.id}_${dateStr}_${now}_${index}_${Math.random().toString(36).slice(2, 7)}`;
      const keys = getMediaIdentityKeys({
        sourceMessageId,
        sourceImageIndex,
        meetingDate: dateStr,
        photoId,
        source: 'meeting'
      }, { source: 'meeting', meetingDate: dateStr });
      photos.push({
        id: photoId,
        imageUrl: photo.imageUrl,
        thumbUrl: photo.thumbUrl || photo.imageUrl,
        createdAt: now + index,
        source: 'lightbox-tag',
        sourceMessageId,
        sourceImageIndex,
        tags: cleanTags || '',
        assetKey: keys.assetKey,
        mediaKey: keys.mediaKey,
        refKey: keys.refKey
      });
      byDate.set(dateStr, { ...meeting, photos, amount: meeting.amount || null });
      linkedCount += 1;
      changed = true;
    });
    if (!changed) return 0;
    const photoLogs = validDates.map((dateStr, index) => (
      createActivityLog(activeCal.id, 'photo_create', dateStr, '', now + index, '사진 날짜 태그 연결')
    )).filter(Boolean);
    await commitConfirmedMeetings(Array.from(byDate.values()).sort((a, b) => String(a.date || '').localeCompare(String(b.date || ''))), linkedCount > 0 ? `${linkedCount}건 일정 사진 연결완료` : '일정 사진 연결 정리완료', photoLogs);
    return linkedCount;
  };

  // 'meeting' gallery photos are archival copies stored on confirmedMeeting.photos (see
  // linkTaggedImageToMeetingDates above), not chat messages -- they have their own independent
  // tags field, identified by meetingDate+photoId rather than messageId/imageIndex.
  const handleSaveMeetingPhotoTags = async (meetingDate, photoId, tagsText) => {
    if (!activeCal || !meetingDate || !photoId) return false;
    const existingMeetings = getConfirmedMeetings(activeCal);
    const meeting = existingMeetings.find(m => m.date === meetingDate);
    const photos = Array.isArray(meeting?.photos) ? meeting.photos : [];
    const photoIndex = photos.findIndex(p => p?.id === photoId || p?.refKey === photoId || p?.mediaKey === photoId);
    if (!meeting || photoIndex === -1) {
      showToast('태그 저장 대상 사진을 찾지 못했습니다.', 'error', 4000);
      return false;
    }
    const parseTagTokens = text => Array.from(new Set(
      String(text || '').split(/[,\s#]+/).map(t => sanitizeText(t.trim(), 30)).filter(Boolean)
    )).slice(0, 10);
    const cleanTags = sanitizeText(parseTagTokens(tagsText).join(' '), 100);
    const nextPhotos = photos.map((p, i) => i === photoIndex ? { ...p, tags: cleanTags } : p);
    const saved = await commitConfirmedMeetings(existingMeetings.map(m => m.date === meetingDate ? { ...meeting, photos: nextPhotos } : m), '태그 저장완료');
    if (!saved) return false;
    // Confirm the subcollection write before reporting success. The calendar document and its
    // confirmedMeetings mirror can briefly diverge when a fallback request races a realtime
    // snapshot; silently keeping the optimistic local tag makes it disappear on re-entry.
    const serverMeetings = await fetchConfirmedMeetingsFromFirestore(activeCal.id).catch(() => null);
    const serverPhoto = Array.isArray(serverMeetings)
      ? (serverMeetings.find(m => m.date === meetingDate)?.photos || []).find(p => p?.id === photoId || p?.refKey === photoId || p?.mediaKey === photoId)
      : null;
    if (!serverPhoto || String(serverPhoto.tags || '') !== cleanTags) {
      showToast('태그 저장 확인에 실패했습니다. 다시 시도해 주세요.', 'error', 5000);
      return false;
    }
    return true;
  };

  // Persist hashtags onto anniversary.photos[i].tags (anniversary docs live in the
  // anniversaries subcollection -- same write path AnniversaryModal's own save uses).
  const handleSaveAnniversaryPhotoTags = async (anniversaryId, imageIndex, tagsText) => {
    if (!Number.isInteger(imageIndex) && Number.isFinite(Number(imageIndex))) {
      imageIndex = Math.max(0, Math.round(Number(imageIndex)));
    }
    if (!activeCal?.id || !anniversaryId || !Number.isInteger(imageIndex)) {
      if (activeCal?.id && anniversaryId) showToast('태그 저장 대상 이미지를 찾지 못했습니다.', 'error', 4000);
      return false;
    }
    const ann = (anniversaries || []).find(a => a && a.id === anniversaryId);
    const photos = Array.isArray(ann?.photos) ? ann.photos : [];
    if (!ann || imageIndex < 0 || imageIndex >= photos.length) {
      showToast('태그 저장 대상 사진을 찾지 못했습니다.', 'error', 4000);
      return false;
    }
    const parseTagTokens = text => Array.from(new Set(
      String(text || '').split(/[,\s#]+/).map(t => sanitizeText(t.trim(), 30)).filter(Boolean)
    )).slice(0, 10);
    const cleanTags = sanitizeText(parseTagTokens(tagsText).join(' '), 100);
    const nextPhotos = photos.map((p, i) => i === imageIndex ? { ...p, tags: cleanTags } : p);
    const annData = preserveAnniversaryCurationFields(ann, { ...ann, photos: nextPhotos, updatedAt: Date.now() });
    try {
      const saved = await writeCollectionDocumentWithFallback('anniversaries', activeCal.id, anniversaryId, annData, 'set', '기념일 사진 태그 저장');
      if (!saved?.success) throw new Error('Anniversary photo tags update failed');
      handleAnniversarySaved(annData);
      showToast('태그 저장완료', 'success');
      return true;
    } catch (err) {
      console.error('Anniversary photo tag save failed:', err);
      showToast('태그 저장 실패', 'error');
      return false;
    }
  };

  const handleSaveImageTags = async (messageId, imageIndex, tagsText, meta = {}) => {
    // Photo-index / REST may deliver imageIndex as a numeric string. Coerce before every
    // Number.isInteger gate so gallery/chat/memo/meeting tag saves do not silently no-op.
    const coerceTagImageIndex = value => {
      if (Number.isInteger(value)) return value;
      const n = Number(value);
      return Number.isFinite(n) ? Math.max(0, Math.round(n)) : null;
    };
    const resolvedIndex = coerceTagImageIndex(imageIndex);
    const resolvedMetaIndex = coerceTagImageIndex(meta?.imageIndex);
    const resolvedSourceIndex = coerceTagImageIndex(meta?.sourceImageIndex);
    if (meta?.source === 'anniversary') {
      return handleSaveAnniversaryPhotoTags(meta.anniversaryId, resolvedMetaIndex != null ? resolvedMetaIndex : resolvedIndex, tagsText);
    }
    if (meta?.source === 'meeting') {
      // Auto-linked 일정 사진: edit the source chat photo. Meeting-composer uploads (no meetingDate yet): own message.
      if (meta.sourceMessageId && resolvedSourceIndex != null) {
        return handleSaveImageTags(meta.sourceMessageId, resolvedSourceIndex, tagsText, {});
      }
      if (messageId && resolvedIndex != null && !meta.meetingDate) {
        return handleSaveImageTags(messageId, resolvedIndex, tagsText, {});
      }
      return handleSaveMeetingPhotoTags(meta.meetingDate, meta.photoId, tagsText);
    }
    if (meta?.source === 'memo') {
      let memoId = messageId || meta.messageId || '';
      // Canonical photo-index rows used to store messageId:'' for memos; recover from sourceOwner.
      if (!memoId) {
        const owner = String(meta.sourceOwner || (Array.isArray(meta.owners) && meta.owners[0] && meta.owners[0].sourceOwner) || '');
        const match = owner.match(/^memo:([^:]+):/);
        if (match) memoId = match[1];
      }
      if (!memoId || resolvedIndex == null) {
        showToast('태그 저장 대상 이미지를 찾지 못했습니다.', 'error', 4000);
        return false;
      }
      const memo = await findMemoById(memoId);
      if (!memo) { showToast('태그 저장 대상 이미지를 찾지 못했습니다.', 'error', 4000); return false; }
      const urls = Array.isArray(memo.imageUrls) ? memo.imageUrls : (memo.imageUrl ? [memo.imageUrl] : []);
      if (resolvedIndex < 0 || resolvedIndex >= urls.length) {
        showToast('태그 저장 대상 이미지를 찾지 못했습니다.', 'error', 4000);
        return false;
      }
      const parseTagTokens = text => Array.from(new Set(String(text || '').split(/[,\s#]+/).map(t => sanitizeText(t.trim(), 30)).filter(Boolean))).slice(0, 10);
      const cleanTags = sanitizeText(parseTagTokens(tagsText).join(' '), 100);
      const nextImageTags = Array.isArray(memo.imageTags) ? [...memo.imageTags] : [];
      while (nextImageTags.length < urls.length) nextImageTags.push('');
      nextImageTags[resolvedIndex] = cleanTags;
      try {
        const ok = await writeCollectionDocumentWithFallback('memos', activeCalId, memoId, sanitizeMemoForFirestore({ imageTags: nextImageTags }), 'update', '메모 이미지 태그 저장', { requirePersisted: true });
        if (!ok?.success || ok?.queued) throw new Error('Memo image tags update failed');
        setMemos(prev => prev.map(m => m.id === memoId ? { ...m, imageTags: nextImageTags } : m));
        patchGalleryArchiveMemo(memoId, { imageTags: nextImageTags });
        try {
          invalidatePhotoIndexCache(activeCalId);
          const memoAsset = String(meta?.assetKey || meta?.mediaKey || meta?.refKey || '');
          const memoTagPatch = {
            messageId: memoId,
            imageIndex: resolvedIndex,
            assetKey: memoAsset,
            mediaKey: memoAsset,
            refKey: memoAsset,
            tags: cleanTags
          };
          rememberPhotoIndexTags(activeCalId, [memoTagPatch]);
          if (typeof galleryPhotoIndex?.patchItems === 'function') {
            galleryPhotoIndex.patchItems(items => (items || []).map(photo => {
              const sameAsset = memoAsset && (photo.assetKey === memoAsset || photo.mediaKey === memoAsset || photo.refKey === memoAsset);
              if (sameAsset || (photo.messageId === memoId && Number(photo.imageIndex) === Number(resolvedIndex))) {
                return { ...photo, tags: cleanTags };
              }
              return photo;
            }));
          }
          // Do not force-reload immediately: CF denorm races; poll until sticky clears.
          schedulePhotoIndexTagReload(galleryPhotoIndex, activeCalId, memoTagPatch);
        } catch (indexSyncErr) {
          console.warn('Gallery photoIndex memo-tag sync skipped:', indexSyncErr);
        }
        showToast('태그 저장완료', 'success');
        return true;
      } catch (err) {
        console.error('Memo image tag save failed:', err);
        showToast('태그 저장 실패', 'error');
        return false;
      }
    }
    // chat / gallery / directMedia (and any other message-backed source)
    if (!messageId || resolvedIndex == null) {
      showToast('태그 저장 대상 이미지를 찾지 못했습니다.', 'error', 4000);
      return false;
    }
    imageIndex = resolvedIndex;
    let sourceMessage = (chatMessages || []).find(msg => msg.id === messageId);
    if (!sourceMessage) {
      try {
        if (firebaseDb) {
          const snap = await withTimeout(firebaseDb.collection('calendars').doc(`cal_${activeCalId}`).collection('messages').doc(messageId).get(), 9000, 'image tag source message read');
          sourceMessage = snap?.exists ? { id: messageId, ...snap.data() } : null;
        } else {
          sourceMessage = await fetchMessageRest(activeCalId, messageId);
        }
      } catch (readErr) {
        console.warn('Image tag source message read failed:', readErr);
      }
    }
    if (!sourceMessage) {
      showToast('태그 저장 대상 이미지를 찾지 못했습니다.', 'error', 4000);
      return false;
    }
    const isDirectMedia = !!meta?.directMediaUrl;
    const entryCount = getMessageImageEntries(sourceMessage).length;
    if (!isDirectMedia && (imageIndex < 0 || imageIndex >= entryCount)) {
      showToast('태그 저장 대상 이미지를 찾지 못했습니다.', 'error', 4000);
      return false;
    }
    const parseTagTokens = text => Array.from(new Set(
      String(text || '').split(/[,\s#]+/).map(t => sanitizeText(t.trim(), 30)).filter(Boolean)
    )).slice(0, 10);
    const prevTokens = parseTagTokens(isDirectMedia ? getDirectMediaTagsForUrl(sourceMessage, meta.directMediaUrl) : (Array.isArray(sourceMessage.imageTags) ? sourceMessage.imageTags[imageIndex] : ''));
    const nextTokens = parseTagTokens(tagsText);
    const cleanTags = sanitizeText(nextTokens.join(' '), 100);
    const data = isDirectMedia ? (() => {
      const previous = sourceMessage.directMediaTags;
      const nextDirectTags = previous && typeof previous === 'object' && !Array.isArray(previous) ? { ...previous } : {};
      const directKey = getDirectMediaTagKey(meta.directMediaUrl);
      if (cleanTags) {
        nextDirectTags[directKey] = cleanTags;
      } else {
        delete nextDirectTags[directKey];
      }
      return { directMediaTags: nextDirectTags };
    })() : (() => {
      const nextImageTags = Array.isArray(sourceMessage.imageTags) ? [...sourceMessage.imageTags] : [];
      while (nextImageTags.length < entryCount) nextImageTags.push('');
      nextImageTags[imageIndex] = cleanTags;
      return { imageTags: nextImageTags };
    })();
    try {
      const ok = await writeCollectionDocumentWithFallback('messages', activeCalId, messageId, data, 'update', '이미지 태그 저장', { requirePersisted: true });
      if (!ok?.success || ok?.queued) throw new Error('Image tags update failed');
      // Read the just-written message back from the server and update every local message
      // snapshot. This prevents a stale onSnapshot/fetched-source snapshot from overwriting a
      // tag that was successfully saved, especially for meeting photos opened from a modal.
      const verifiedMessage = await fetchMessageRest(activeCalId, messageId);
      if (!verifiedMessage) throw new Error('Image tags verification read failed');
      const verifiedTags = isDirectMedia
        ? getDirectMediaTagsForUrl(verifiedMessage, meta.directMediaUrl)
        : (Array.isArray(verifiedMessage.imageTags) ? verifiedMessage.imageTags[imageIndex] : '');
      if (String(verifiedTags || '') !== cleanTags) throw new Error('Image tags verification mismatch');
      // Patch-only, not upsertLocalChatMessage -- this message may live only in olderChatMessages
      // (an older photo scrolled up to and tagged, not in the live chatMessages window). Upserting
      // it would insert a copy into chatMessages too, growing that "live recent window" array and
      // tripping the chat-view scroll-to-bottom effect keyed on chatMessages.length (see below),
      // yanking the chat down to the latest message right after closing the Lightbox.
      patchLocalChatMessage(messageId, verifiedMessage);
      const now = Date.now();
      const added = nextTokens.filter(t => !prevTokens.includes(t));
      const removed = prevTokens.filter(t => !nextTokens.includes(t));
      const tagIdentity = getMediaIdentityKeys({
        messageId,
        imageIndex: isDirectMedia ? 0 : imageIndex,
        directMediaUrl: isDirectMedia ? meta.directMediaUrl : '',
        source: 'chat'
      }, { source: 'chat', messageId });
      const tagResource = {
        resourceType: 'photo-tag',
        resourceId: tagIdentity.mediaKey,
        source: 'chat',
        sourceMessageId: messageId,
        imageIndex: isDirectMedia ? 0 : imageIndex,
        before: prevTokens.join(' '),
        after: cleanTags
      };
      const tagLogs = [
        ...added.map((t, i) => createActivityLog(activeCalId, 'tag_add', '', '', now + i, `#${t}`, tagResource)),
        ...removed.map((t, i) => createActivityLog(activeCalId, 'tag_remove', '', '', now + added.length + i, `#${t}`, tagResource))
      ].filter(Boolean);
      if (tagLogs.length > 0) {
        try {
          await writeActivityLogsToFirestore(activeCalId, tagLogs);
        } catch (logErr) {
          // Tag persistence is the primary user action; activity logs are best-effort metadata.
          console.warn('Image tag activity log write skipped:', logErr);
        }
      }
    } catch (err) {
      console.error('Image tag save failed:', err);
      showToast('태그 저장 실패', 'error');
      return false;
    }
    const sourceEntry = isDirectMedia ? null : getMessageImageEntries(sourceMessage)[imageIndex];
    const imageUrl = String(meta?.imageUrl || meta?.directMediaUrl || sourceEntry?.full || sourceEntry?.thumb || '').trim();
    const thumbUrl = String(meta?.thumb || sourceEntry?.thumb || imageUrl).trim();
    let linkedCount = 0;
    if (imageUrl) {
      // Always call this (even with an empty dateStrs array) so removing every date tag
      // un-links the photo from any meeting date it was previously auto-linked to.
      const dateStrs = parseFlexibleDateTokens(tagsText);
      try {
        linkedCount = await linkTaggedImageToMeetingDates(dateStrs, { imageUrl, thumbUrl, imageIndex }, sourceMessage, cleanTags);
      } catch (dateLinkErr) {
        console.warn('Image tag date link skipped:', dateLinkErr);
        showToast('태그는 저장됐지만 일정 사진 연결은 실패했습니다.', 'error', 5000);
      }
    }
    // Gallery reads tags from photoIndex (CF-maintained). Messages already hold the verified
    // tags; patch local index rows and remember them for the session. A delayed reload gives
    // onMessagePhotoIndexWrite time to catch up — an immediate force reload raced CF and wiped
    // tags, so closing/reopening the lightbox showed empty meta.tags despite "태그 저장완료".
    try {
      invalidatePhotoIndexCache(activeCalId);
      const asset = String(meta?.assetKey || meta?.mediaKey || meta?.refKey || '');
      const stickyProbe = {
        messageId,
        imageIndex: isDirectMedia ? 0 : imageIndex,
        assetKey: asset,
        mediaKey: asset,
        refKey: asset,
        tags: cleanTags
      };
      rememberPhotoIndexTags(activeCalId, [stickyProbe]);
      if (typeof galleryPhotoIndex?.patchItems === 'function') {
        galleryPhotoIndex.patchItems(items => (items || []).map(photo => {
          const sameAsset = asset && (photo.assetKey === asset || photo.mediaKey === asset || photo.refKey === asset);
          const sameMessage = messageId && photo.messageId === messageId
            && Number(photo.imageIndex) === Number(isDirectMedia ? 0 : imageIndex);
          if (sameAsset || sameMessage) return { ...photo, tags: cleanTags };
          return photo;
        }));
      }
      schedulePhotoIndexTagReload(galleryPhotoIndex, activeCalId, stickyProbe);
    } catch (indexSyncErr) {
      console.warn('Gallery photoIndex tag sync skipped:', indexSyncErr);
    }
    if (!linkedCount) showToast('태그 저장완료', 'success');
    return true;
  };

  React.useEffect(() => {
    const rawId = getRawCalendarIdFromURL();
    if (rawId && !isAllowedCalendarId(rawId)) {
      const safeUrl = getCalendarShareUrl(activeCal?.id || activeCalId);
      window.history.replaceState({}, '', safeUrl);
      showToast('캘린더 주소 정리됨', 'error', 5000);
    }
  }, []);
  React.useEffect(() => {
    let cancelled = false;
    const requestedId = getCalendarIdFromURL();
    if (requestedId && !isAllowedCalendarId(requestedId)) {
      showToast('지원하지 않는 캘린더', 'error', 5000);
      return;
    }
    if (requestedId && !(calendarsRef.current || []).some(c => c.id === requestedId)) {
      const resolveRequestedCalendar = async () => {
        const existing = await fetchSingleCloudCalendar(requestedId, 1);
        if (cancelled) return;
        if (existing?.calendar) {
          applyServerCalendars(mergeCalendarCollections(calendarsRef.current || [], [existing.calendar], {
            replaceMatchingId: true
          }), existing.lastModified || Date.now());
          setActiveCalId(requestedId);
          return;
        }
        showToast('캘린더를 찾을 수 없음', 'error');
      };
      resolveRequestedCalendar();
    }
    return () => {
      cancelled = true;
    };
  }, []);
  const handleSelectCalendar = id => {
    if (!isAllowedCalendarId(id)) {
      showToast('잘못된 캘린더 ID', 'error');
      return;
    }
    setActiveCalId(id);
    try { window.localStorage?.setItem('gather_last_active_cal_id', id); } catch (_) {}
    window.history.replaceState({}, '', getCalendarShareUrl(id));
  };
  const guardLoadedCalendar = (message = 'Firebase 데이터를 불러온 뒤 다시 시도해 주세요.') => {
    if (activeCalLoaded) return true;
    showToast(message, 'error');
    return false;
  };
  const handleSaveAvailability = (dateStr, participantId, note) => {
    if (!activeCalLoaded) {
      showToast('잠시 후 다시 시도', 'error');
      return false;
    }
    if (!activeCal || !isValidCalendarId(activeCal.id) || activeCal.id !== activeCalId) {
      showToast('캘린더 상태 확인 불가', 'error');
      return false;
    }
    if (!isValidDateString(dateStr)) {
      showToast('날짜 형식 오류', 'error');
      return false;
    }
    const BULK_NO_PARTICIPANT_ID = (GATHER_APP_CONSTANTS && GATHER_APP_CONSTANTS.BULK_NO_PARTICIPANT_ID) || '__none__';
    const activeParticipantIds = new Set(getActiveParticipants(activeCal).map(participant => participant.id));
    if (participantId !== BULK_NO_PARTICIPANT_ID && !activeParticipantIds.has(participantId)) {
      showToast('참여자 재선택 필요', 'error');
      return false;
    }
    const now = Date.now();
    const cleanNote = sanitizeText(note, 500);
    const existing = activeCal.availabilities || [];
    const index = existing.findIndex(e => e.date === dateStr && e.participantId === participantId);
    const existingActive = index >= 0 && !isTombstone(existing[index]);
    const action = existingActive ? 'update' : 'create';
    let nextAvail = [...existing];
    if (index >= 0) {
      nextAvail[index] = {
        ...nextAvail[index],
        date: dateStr,
        participantId,
        note: cleanNote,
        updatedAt: now,
        deletedAt: null
      };
    } else {
      nextAvail.push({
        date: dateStr,
        participantId,
        note: cleanNote,
        updatedAt: now
      });
    }
    const partName = participantId === BULK_NO_PARTICIPANT_ID
      ? '참여자 없음'
      : ((getActiveParticipants(activeCal).find(p => p.id === participantId) || {}).name || participantId);
    const logNote = `[참여자: ${partName}] ${cleanNote ? `[메모: ${cleanNote}]` : '[참석]'}`;
    const activityLog = createActivityLog(activeCal.id, action, dateStr, participantId, now, logNote);
    const updatedCal = {
      ...activeCal,
      updatedAt: now,
      revision: (activeCal.revision || 0) + 1,
      availabilities: nextAvail,
      activityLogs: activityLog ? [...getCalendarActivityLogs(activeCal), activityLog] : getCalendarActivityLogs(activeCal)
    };
    const nextCalendars = calendars.map(c => c.id === updatedCal.id ? updatedCal : c);
    return updateCalendars(nextCalendars, '등록완료', 'success', updatedCal.id, 'availability', activityLog ? [activityLog] : []);
  };
  const handleMoveAvailability = (entryReferId, sourceDate, targetDate, participantId, participantName) => {
    const formatDateKst = (dStr) => {
      const [y, m, d] = dStr.split('-').map(Number);
      const dateObj = new Date(y, m - 1, d);
      const days = ['일', '월', '화', '수', '목', '금', '토'];
      return `${m}월 ${d}일 (${days[dateObj.getDay()]})`;
    };
    
    const sourceFormatted = formatDateKst(sourceDate);
    const targetFormatted = formatDateKst(targetDate);
    const message = `${sourceFormatted} ${participantName}님의 일정을, ${targetFormatted} 으로 옮기시겠습니까?`;
    
    showConfirmDialog('일정 이동', message, async () => {
      if (!activeCalLoaded || !activeCal) {
        showToast('잠시 후 다시 시도', 'error');
        return;
      }
      const now = Date.now();
      const existing = activeCal.availabilities || [];
      const sourceIndex = existing.findIndex(e => e.date === sourceDate && e.participantId === participantId && !isTombstone(e));
      if (sourceIndex < 0) {
        showToast('원본 일정을 찾을 수 없습니다.', 'error');
        return;
      }
      const sourceEntry = existing[sourceIndex];
      const note = sourceEntry.note || '';
      
      let nextAvail = [...existing];
      nextAvail[sourceIndex] = {
        ...sourceEntry,
        deletedAt: now,
        updatedAt: now
      };
      
      const targetIndex = nextAvail.findIndex(e => e.date === targetDate && e.participantId === participantId);
      if (targetIndex >= 0) {
        nextAvail[targetIndex] = {
          ...nextAvail[targetIndex],
          note: note,
          deletedAt: null,
          updatedAt: now
        };
      } else {
        nextAvail.push({
          date: targetDate,
          participantId,
          note: note,
          updatedAt: now
        });
      }
      
      const deleteLog = createActivityLog(activeCal.id, 'delete', sourceDate, participantId, now, note);
      const createLog = createActivityLog(activeCal.id, targetIndex >= 0 ? 'update' : 'create', targetDate, participantId, now + 1, note);
      const logs = [];
      if (deleteLog) logs.push(deleteLog);
      if (createLog) logs.push(createLog);
      
      const updatedCal = {
        ...activeCal,
        updatedAt: now,
        revision: (activeCal.revision || 0) + 1,
        availabilities: nextAvail,
        activityLogs: [...getCalendarActivityLogs(activeCal), ...logs]
      };
      
      const nextCalendars = calendars.map(c => c.id === updatedCal.id ? updatedCal : c);
      await updateCalendars(nextCalendars, '일정 이동완료', 'success', updatedCal.id, 'availability', logs);
    });
  };
  // Registers one participant's availability across several dates in a single save -- used by
  // the recurring-schedule template ("반복 일정") so applying a weekly pattern doesn't fire one
  // network write per date.
  const handleBulkRegisterAvailability = (participantId, dateStrList, note) => {
    if (!activeCalLoaded || !activeCal) {
      showToast('잠시 후 다시 시도', 'error');
      return false;
    }
    const BULK_NO_PARTICIPANT_ID = (GATHER_APP_CONSTANTS && GATHER_APP_CONSTANTS.BULK_NO_PARTICIPANT_ID) || '__none__';
    const activeParticipantIds = new Set(getActiveParticipants(activeCal).map(participant => participant.id));
    if (participantId !== BULK_NO_PARTICIPANT_ID && !activeParticipantIds.has(participantId)) {
      showToast('참여자 재선택 필요', 'error');
      return false;
    }
    const validDates = (dateStrList || []).filter(isValidDateString);
    if (validDates.length === 0) return false;
    const now = Date.now();
    const cleanNote = sanitizeText(note, 500);
    let nextAvail = [...(activeCal.availabilities || [])];
    const activityLogs = [];
    validDates.forEach((dateStr, i) => {
      const index = nextAvail.findIndex(e => e.date === dateStr && e.participantId === participantId);
      const existingActive = index >= 0 && !isTombstone(nextAvail[index]);
      const action = existingActive ? 'update' : 'create';
      const stamp = now + i;
      if (index >= 0) {
        nextAvail[index] = { ...nextAvail[index], date: dateStr, participantId, note: cleanNote, updatedAt: stamp, deletedAt: null };
      } else {
        nextAvail.push({ date: dateStr, participantId, note: cleanNote, updatedAt: stamp });
      }
      const log = createActivityLog(activeCal.id, action, dateStr, participantId, stamp, cleanNote);
      if (log) activityLogs.push(log);
    });
    const updatedCal = {
      ...activeCal,
      updatedAt: now,
      revision: (activeCal.revision || 0) + 1,
      availabilities: nextAvail,
      activityLogs: activityLogs.length > 0 ? [...getCalendarActivityLogs(activeCal), ...activityLogs] : getCalendarActivityLogs(activeCal)
    };
    const nextCalendars = calendars.map(c => c.id === updatedCal.id ? updatedCal : c);
    return updateCalendars(nextCalendars, `${validDates.length}건 일괄 등록완료`, 'success', updatedCal.id, 'availability', activityLogs);
  };
  const handleDeleteAvailability = async (dateStr, participantId) => {
    if (!activeCal || !isValidDateString(dateStr)) return false;
    const BULK_NO_PARTICIPANT_ID = (GATHER_APP_CONSTANTS && GATHER_APP_CONSTANTS.BULK_NO_PARTICIPANT_ID) || '__none__';
    const activeParticipantIds = new Set(getActiveParticipants(activeCal).map(participant => participant.id));
    if (participantId !== BULK_NO_PARTICIPANT_ID && !activeParticipantIds.has(participantId)) return false;
    const now = Date.now();
    const targetEntry = (activeCal.availabilities || []).find(e => e.date === dateStr && e.participantId === participantId && !isTombstone(e));
    if (!targetEntry) return false;
    const entrySnapshot = JSON.parse(JSON.stringify(targetEntry));
    const calId = activeCal.id;
    const nextAvail = (activeCal.availabilities || []).map(e => e.date === dateStr && e.participantId === participantId ? {
      ...e, deletedAt: now, updatedAt: now
    } : e);
    const activityLog = createActivityLog(activeCal.id, 'delete', dateStr, participantId, now, targetEntry.note || '');
    const updatedCal = {
      ...activeCal, updatedAt: now, revision: (activeCal.revision || 0) + 1,
      availabilities: nextAvail,
      activityLogs: activityLog ? [...getCalendarActivityLogs(activeCal), activityLog] : getCalendarActivityLogs(activeCal)
    };
    const nextCalendars = calendars.map(c => c.id === updatedCal.id ? updatedCal : c);
    const ok = await updateCalendars(nextCalendars, null, null, updatedCal.id, 'availability', activityLog ? [activityLog] : []);
    if (ok) {
      showUndoableDeleteToast('참석이 삭제되었습니다.', async () => {
        try {
          const restoreNow = Date.now();
          const latestCal = calendarsRef.current.find(c => c.id === calId) || updatedCal;
          const restoredAvail = (latestCal.availabilities || []).map(e =>
            (e.date === dateStr && e.participantId === participantId)
              ? { ...entrySnapshot, deletedAt: null, updatedAt: restoreNow } : e);
          const restoreLog = createActivityLog(calId, 'update', dateStr, participantId, restoreNow, entrySnapshot.note || '');
          const restoredCal = {
            ...latestCal, updatedAt: restoreNow, revision: (latestCal.revision || 0) + 1,
            availabilities: restoredAvail,
            activityLogs: restoreLog ? [...getCalendarActivityLogs(latestCal), restoreLog] : getCalendarActivityLogs(latestCal)
          };
          const next = calendarsRef.current.map(c => c.id === restoredCal.id ? restoredCal : c);
          await updateCalendars(next, '참석 삭제를 되돌렸습니다.', 'success', restoredCal.id, 'availability', restoreLog ? [restoreLog] : []);
        } catch (err) {
          console.error('handleDeleteAvailability undo failed:', err);
          showToast('참석 복원 실패', 'error', 4000);
        }
      }, null, 5000);
    }
    return ok;
  };
  // Reorders the 참석 명단 (attendee) rows shown for one date in DateModal, dragged via the
  // same pointer-sort UI as the settlement expense list (see moveExpense/beginExpensePointerSort
  // in ui-date-modal.js). availabilities has no per-entry order field -- display order is just
  // array order in calendar.availabilities -- so this reorders only the slots this date's active
  // entries already occupy in that array, leaving every other date's entries' positions (and
  // their own updatedAt) untouched.
  const handleReorderAvailability = (dateStr, orderedParticipantIds) => {
    if (!activeCal || !isValidDateString(dateStr) || !Array.isArray(orderedParticipantIds) || orderedParticipantIds.length < 2) return false;
    const existing = activeCal.availabilities || [];
    const dateIndices = [];
    existing.forEach((entry, i) => { if (entry.date === dateStr && !isTombstone(entry)) dateIndices.push(i); });
    if (dateIndices.length < 2) return false;
    const entryByParticipant = new Map();
    dateIndices.forEach(i => entryByParticipant.set(existing[i].participantId, existing[i]));
    const orderedEntries = [];
    orderedParticipantIds.forEach(participantId => {
      if (entryByParticipant.has(participantId)) {
        orderedEntries.push(entryByParticipant.get(participantId));
        entryByParticipant.delete(participantId);
      }
    });
    // Any active entry not named in orderedParticipantIds (shouldn't happen from the UI, but
    // keeps this defensive against a stale/partial id list) keeps its relative place at the end.
    entryByParticipant.forEach(entry => orderedEntries.push(entry));
    if (orderedEntries.length !== dateIndices.length) return false;
    const unchanged = dateIndices.every((idx, i) => existing[idx].participantId === orderedEntries[i].participantId);
    if (unchanged) return true;
    const nextAvail = [...existing];
    dateIndices.forEach((idx, i) => { nextAvail[idx] = orderedEntries[i]; });
    const now = Date.now();
    const updatedCal = { ...activeCal, updatedAt: now, revision: (activeCal.revision || 0) + 1, availabilities: nextAvail };
    const nextCalendars = calendars.map(c => c.id === updatedCal.id ? updatedCal : c);
    return updateCalendars(nextCalendars, null, null, updatedCal.id, 'availability', []);
  };
  const handleDeleteAllForDate = async dateStr => {
    if (!activeCal || !isValidDateString(dateStr)) return false;
    const now = Date.now();
    const currentCal = calendarsRef.current.find(c => c.id === activeCal.id) || activeCal;
    const activeEntries = (currentCal.availabilities || []).filter(e => e.date === dateStr && !isTombstone(e));
    if (activeEntries.length === 0) return false;
    const deletedSnapshot = activeEntries.map(entry => ({ ...entry }));
    const nextAvail = (currentCal.availabilities || []).map(e => e.date === dateStr ? {
      ...e,
      deletedAt: now,
      updatedAt: now
    } : e);
    const activityLogs = activeEntries.map((entry, index) =>
      createActivityLog(currentCal.id, 'delete', dateStr, entry.participantId, now + index, entry.note || '')
    ).filter(Boolean);
    const updatedCal = {
      ...currentCal,
      updatedAt: now,
      revision: (currentCal.revision || 0) + 1,
      availabilities: nextAvail,
      activityLogs: [...getCalendarActivityLogs(currentCal), ...activityLogs]
    };
    const nextCalendars = calendars.map(c => c.id === updatedCal.id ? updatedCal : c);
    const ok = await updateCalendars(nextCalendars, null, null, updatedCal.id, 'availability', activityLogs);
    if (!ok) return false;
    showUndoableDeleteToast('날짜가 초기화되었습니다.', async () => {
      try {
        const restoreNow = Date.now();
        const latestCal = calendarsRef.current.find(c => c.id === updatedCal.id) || updatedCal;
        const deletedKeys = new Set(deletedSnapshot.map(entry => `${entry.date}::${entry.participantId}`));
        const restoredAvail = (latestCal.availabilities || []).map(entry => {
          const key = `${entry.date}::${entry.participantId}`;
          if (!deletedKeys.has(key)) return entry;
          const snapshot = deletedSnapshot.find(item => `${item.date}::${item.participantId}` === key);
          return snapshot
            ? { ...entry, ...snapshot, deletedAt: null, updatedAt: restoreNow }
            : { ...entry, deletedAt: null, updatedAt: restoreNow };
        });
        const restoreLogs = deletedSnapshot.map((entry, index) =>
          createActivityLog(updatedCal.id, 'update', dateStr, entry.participantId, restoreNow + index, entry.note || '')
        ).filter(Boolean);
        const restoredCal = {
          ...latestCal,
          updatedAt: restoreNow,
          revision: (latestCal.revision || 0) + 1,
          availabilities: restoredAvail,
          activityLogs: restoreLogs.length > 0 ? [...getCalendarActivityLogs(latestCal), ...restoreLogs] : getCalendarActivityLogs(latestCal)
        };
        const nextCalendarsRestore = calendarsRef.current.map(c => c.id === restoredCal.id ? restoredCal : c);
        await updateCalendars(nextCalendarsRestore, '날짜 초기화를 되돌렸습니다.', 'success', restoredCal.id, 'availability', restoreLogs);
      } catch (err) {
        console.error('handleDeleteAllForDate undo failed:', err);
        showToast('날짜 복원 실패', 'error', 4000);
      }
    }, null, 5000);
    return true;
  };
  const commitConfirmedMeetings = async (nextConfirmedMeetings, toastMessage = null, activityLogs = [], warnLabel = 'write', toastType = 'success') => {
    void warnLabel;
    return commitConfirmedMeetingChanges({
      activeCalendar: activeCal, calendars, nextConfirmedMeetings, toastMessage, activityLogs,
      toastType, getConfirmedMeetings, getCalendarActivityLogs, updateCalendars,
      setConfirmedMeetingsSubcollection, mergeConfirmedMeetings
    });
  };
  const handleConfirmMeeting = (dateStr, note) => {
    if (!activeCal || !isValidDateString(dateStr)) return false;
    const now = Date.now();
    const existingMeetings = getConfirmedMeetings(activeCal);
    const meetingIndex = existingMeetings.findIndex(m => m.date === dateStr);
    const isAlreadyConfirmed = meetingIndex >= 0 && existingMeetings[meetingIndex].confirmed !== false;
    let nextConfirmedMeetings;
    if (isAlreadyConfirmed) {
      // Un-confirming always keeps the entry around (marked confirmed:false) rather than ever
      // deleting it outright -- this used to only apply when the entry also carried settlement
      // data (Array.isArray(meeting.expenses) && meeting.expenses.length > 0), dropping it via
      // .filter() otherwise. That filtered-out case is exactly the one
      // ENABLE_PLACES_SUBCOLLECTION_MIGRATION can't represent: once a date's confirmedMeeting
      // entry has migrated out to its own calendars/{id}/confirmedMeetings/{date} doc (see
      // stripEmbeddedConfirmedMeetingField), the only way this write path knows to touch that doc
      // again is by that date still being present in nextConfirmedMeetings when
      // writeConfirmedMeetingsToFirestore's caller rebuilds legacyConfirmedMeetings from the
      // current embedded array -- an entry that gets deleted from the array here is simply never
      // written anywhere, so the old confirmed:true subcollection doc is left behind forever and
      // keeps getting unioned back in (unionConfirmedMeetings) as though 확정취소 never happened.
      // Keeping the entry (now confirmed:false, no settlement data) is otherwise inert --
      // getTrulyConfirmedMeetings already filters confirmed:false entries out of every "is this
      // date actually confirmed" caller (badges, reminders, ICS export, stats, summary lists), and
      // an entry with an empty/absent expenses array renders nothing in the settlement views
      // either, so it never becomes visible clutter.
      nextConfirmedMeetings = existingMeetings.map((m, i) => i === meetingIndex ? { ...m, confirmed: false } : m);
    } else if (meetingIndex >= 0) {
      // A settlement-only placeholder already exists for this date (created by
      // handleSaveExpense below) -- promote it to a real confirmed meeting instead of adding
      // a duplicate entry for the same date.
      nextConfirmedMeetings = existingMeetings.map((m, i) => i === meetingIndex
        ? { ...m, confirmed: true, note: sanitizeText(note, 500), confirmedAt: now }
        : m);
    } else {
      nextConfirmedMeetings = [...existingMeetings, { date: dateStr, note: sanitizeText(note, 500), confirmedAt: now, confirmed: true }];
    }
    const action = isAlreadyConfirmed ? 'meeting_cancel' : 'meeting_confirm';
    const logNote = sanitizeText(note || '', 500) || (isAlreadyConfirmed ? '모임 확정 취소됨' : '모임 확정됨');
    const meetingLog = createActivityLog(activeCal.id, action, dateStr, '', now, logNote);
    return commitConfirmedMeetings(nextConfirmedMeetings, isAlreadyConfirmed ? '모임 확정 취소' : '모임 확정', meetingLog ? [meetingLog] : []);
  };
  // Confirmed-meeting writes declare their field scope in commitConfirmedMeetings, so unrelated
  // settings saves cannot carry a stale settlement snapshot back over this value.
  const handleSaveExpense = async (dateStr, expense) => {
    if (!activeCal || !isValidDateString(dateStr)) return false;
    const existingMeetings = getConfirmedMeetings(activeCal);
    let meetingIndex = existingMeetings.findIndex(m => m.date === dateStr);
    // Editing an existing expense always targets an already-saved entry; adding a new one is
    // allowed on any date (모임확정 여부와 무관), so create an unconfirmed settlement-only
    // placeholder entry on the fly the first time someone logs income/expenses for that date.
    if (meetingIndex < 0 && expense?.id) return false;
	    const cleanLabel = sanitizeText(expense?.label || '', 120);
	    const cleanUrl = sanitizeText(expense?.url || '', 220);
	    const categoryIds = new Set(getExpenseCategories(activeCal).map(category => category.id));
	    const cleanCategoryId = categoryIds.has(expense?.categoryId) ? expense.categoryId : 'etc';
	    const cleanAmount = Number.isFinite(expense?.amount) && expense.amount !== 0 ? Math.round(expense.amount) : 0;
	    // 지출자(payer): empty/absent means 공금지출 (paid from the shared pool, the long-standing
	    // default). A specific participant name means that person personally fronted the amount --
	    // the settlement card ("정산카드") reads this to auto-derive who needs to be reimbursed
	    // instead of requiring the same line item to be re-typed there by hand.
	    const activeParticipantNames = new Set(getActiveParticipants(activeCal).map(p => p.name));
	    const cleanPayerId = activeParticipantNames.has(expense?.payerId) ? expense.payerId : '';
	    // 자비부담: a personal expense someone covered entirely themselves, as opposed to a
	    // 선결제 shared cost they merely fronted. Recorded for visibility only -- excluded from
	    // 공금 (calculateSettlementBalance) and from the settlement card's split total
	    // (monthlyExpenses in ui-event-modals.js) wherever amount is summed.
	    const cleanIsSelfPay = !!expense?.isSelfPay;
    if ((!cleanLabel && !cleanUrl) || !cleanAmount) return false;
    
    // Link previews are display metadata, not part of the settlement write. Never block the
    // user's save on a third-party scraper; an existing preview is retained on same-URL edits,
    // while the normal link-preview component can hydrate a missing preview after rendering.
    let linkPreview = null;
    if (cleanUrl && expense?.id) {
      const meeting = existingMeetings[meetingIndex];
      const existingExp = meeting?.expenses?.find(e => e.id === expense.id);
      if (existingExp && existingExp.url === cleanUrl && existingExp.linkPreview) {
        linkPreview = existingExp.linkPreview;
      }
    }

    const now = Date.now();
    let meetings = existingMeetings;
    if (meetingIndex < 0) {
      meetings = [...existingMeetings, { date: dateStr, note: '', confirmedAt: null, confirmed: false, expenses: [] }];
      meetingIndex = meetings.length - 1;
    }
    const meeting = meetings[meetingIndex];
	    const existingExpenses = Array.isArray(meeting.expenses) ? meeting.expenses : [];
	    const isEditing = !!expense?.id;
	    const nextExpenses = isEditing
	      ? existingExpenses.map(e => e.id === expense.id ? { ...e, label: cleanLabel, url: cleanUrl, categoryId: cleanCategoryId, amount: cleanAmount, payerId: cleanPayerId, isSelfPay: cleanIsSelfPay, updatedAt: now, linkPreview: linkPreview || null } : e)
	      : [...existingExpenses, { id: `exp_${activeCal.id}_${dateStr}_${now}_${Math.random().toString(36).slice(2, 7)}`, label: cleanLabel, url: cleanUrl, categoryId: cleanCategoryId, amount: cleanAmount, payerId: cleanPayerId, isSelfPay: cleanIsSelfPay, order: existingExpenses.length, createdAt: now, updatedAt: now, linkPreview: linkPreview || null }];
    const nextConfirmedMeetings = meetings.map((m, i) => i === meetingIndex ? { ...m, expenses: nextExpenses, updatedAt: now, amount: null } : m);
    // Expense/income entries have no participant selector of their own, so these logs carry an
    // empty participantId (matching how poll activity logs already handle system-level actions)
    // -- the admin log UI falls back to a generic '정산' label for that case.
    const fmtAmt = n => `${Number(n) < 0 ? '+' : '-'}${Math.abs(Number(n) || 0).toLocaleString()}원`;
    const expCats = getExpenseCategories(activeCal);
    const expCatName = id => (expCats.find(c => c.id === id) || {}).name || id || '-';
    const prevExp = isEditing ? existingExpenses.find(e => e.id === expense.id) : null;
    const payerLabel = (payerId, selfPay) => payerId ? `${payerId} ${selfPay ? '자비부담' : '선결제'}` : (selfPay ? '자비부담' : '공금지출');
    let expenseLogNote;
    if (isEditing && prevExp) {
      expenseLogNote = buildFieldChangeNote(cleanLabel || cleanUrl || '정산', [
        { key: '금액', before: fmtAmt(prevExp.amount), after: fmtAmt(cleanAmount) },
        { key: '명목', before: prevExp.label || prevExp.url || '', after: cleanLabel || cleanUrl },
        { key: '카테고리', before: expCatName(prevExp.categoryId), after: expCatName(cleanCategoryId) },
        { key: '지출자', before: payerLabel(prevExp.payerId, prevExp.isSelfPay), after: payerLabel(cleanPayerId, cleanIsSelfPay) }
      ]);
    } else {
      expenseLogNote = sanitizeText(`${fmtAmt(cleanAmount)} ${cleanLabel || cleanUrl} · ${expCatName(cleanCategoryId)}${(cleanPayerId || cleanIsSelfPay) ? ` · ${payerLabel(cleanPayerId, cleanIsSelfPay)}` : ''}`, 300);
    }
    const expenseActivityLog = createActivityLog(activeCal.id, isEditing ? 'expense_update' : 'expense_create', dateStr, '', now, expenseLogNote);
    return commitConfirmedMeetings(nextConfirmedMeetings, '지출 저장완료', expenseActivityLog ? [expenseActivityLog] : []);
  };
  const handleDeleteExpense = async (dateStr, expenseId) => {
    if (!activeCal || !isValidDateString(dateStr)) return false;
    const existingMeetings = getConfirmedMeetings(activeCal);
    const meetingIndex = existingMeetings.findIndex(m => m.date === dateStr);
    if (meetingIndex < 0) return false;
    const meeting = existingMeetings[meetingIndex];
    const deletedExpense = (Array.isArray(meeting.expenses) ? meeting.expenses : []).find(e => e.id === expenseId);
    if (!deletedExpense) return false;
    const previousMeetings = cloneConfirmedMeetings(existingMeetings);
    const now = Date.now();
    const nextExpenses = (Array.isArray(meeting.expenses) ? meeting.expenses : [])
      .map(e => e.id === expenseId ? { ...e, deletedAt: now, updatedAt: now } : e);
    const nextConfirmedMeetings = existingMeetings.map((m, i) => i === meetingIndex ? { ...m, expenses: nextExpenses, updatedAt: now } : m);
    const expenseLogNote = sanitizeText(
      `${deletedExpense.amount < 0 ? '+' : '-'}${Math.abs(Number(deletedExpense.amount) || 0).toLocaleString()}원 ${deletedExpense.label || deletedExpense.url || ''}`,
      120
    );
    const expenseActivityLog = createActivityLog(activeCal.id, 'expense_delete', dateStr, '', now, expenseLogNote);
    const ok = await commitConfirmedMeetings(nextConfirmedMeetings, null, expenseActivityLog ? [expenseActivityLog] : []);
    if (ok) {
      showUndoableDeleteToast('지출이 삭제되었습니다.', async () => {
        try {
          await commitConfirmedMeetings(previousMeetings, '지출 삭제를 되돌렸습니다.', [], 'restore');
        } catch (err) {
          console.error('handleDeleteExpense undo failed:', err);
          showToast('지출 복원 실패', 'error', 4000);
        }
      }, null, 5000);
    }
    return ok;
  };

  const handleReorderExpenses = (dateStr, orderedExpenseIds) => {
    if (!activeCal || !isValidDateString(dateStr) || !Array.isArray(orderedExpenseIds) || orderedExpenseIds.length < 2) return false;
    const existingMeetings = getConfirmedMeetings(activeCal);
    const meetingIndex = existingMeetings.findIndex(m => m.date === dateStr);
    if (meetingIndex < 0) return false;
    const meeting = existingMeetings[meetingIndex];
    const existingExpenses = Array.isArray(meeting.expenses) ? meeting.expenses : [];
    if (existingExpenses.length < 2) return false;
    const expenseById = new Map(existingExpenses.map(expense => [expense.id, expense]));
    const nextExpenses = [];
    orderedExpenseIds.forEach(id => {
      if (expenseById.has(id)) {
        nextExpenses.push({ ...expenseById.get(id), order: nextExpenses.length });
        expenseById.delete(id);
      }
    });
    expenseById.forEach(expense => {
      nextExpenses.push({ ...expense, order: nextExpenses.length });
    });
    if (nextExpenses.length !== existingExpenses.length) return false;
    const same = existingExpenses.every((e, i) => e.id === nextExpenses[i].id);
    if (same) return true;
    const nextConfirmedMeetings = existingMeetings.map((m, i) => i === meetingIndex ? { ...m, expenses: nextExpenses } : m);
    return commitConfirmedMeetings(nextConfirmedMeetings, '지출 순서 저장완료');
  };

  const handleReorderPlaces = (dateStr, orderedPlaceIds) => {
    if (!activeCal || !isValidDateString(dateStr) || !Array.isArray(orderedPlaceIds) || orderedPlaceIds.length < 2) return false;
    const existingPlaces = getCalendarPlaces(activeCal);
    const visiblePlaces = existingPlaces.filter(place => doesPlaceMatchDate(place, dateStr));
    if (visiblePlaces.length < 2) return false;
    const byId = new Map(existingPlaces.map(place => [place.id, place]));
    const orderedVisible = orderedPlaceIds.map(id => byId.get(id)).filter(Boolean);
    if (orderedVisible.length !== visiblePlaces.length) return false;
    const visibleIds = new Set(visiblePlaces.map(place => place.id));
    const nextPlaces = existingPlaces.slice();
    let visibleIndex = 0;
    const now = Date.now();
    nextPlaces.forEach((place, index) => {
      if (!visibleIds.has(place.id)) return;
      const ordered = orderedVisible[visibleIndex++];
      nextPlaces[index] = { ...place, order: existingPlaces.indexOf(ordered), updatedAt: now };
    });
    const same = visiblePlaces.every(place => place.id === orderedVisible[visiblePlaces.indexOf(place)]?.id);
    if (same) return true;
    const updatedCal = {
      ...activeCal, places: nextPlaces, updatedAt: now,
      revision: (activeCal.revision || 0) + 1
    };
    const nextCalendars = calendarsRef.current.map(c => c.id === updatedCal.id ? updatedCal : c);
    setPlacesSubcollection(nextPlaces);
    return updateCalendars(nextCalendars, '장소 순서 저장완료', 'success', updatedCal.id, 'settings', [], {
      places: nextPlaces, settingsFields: ['places']
    });
  };

  // 일정 사진은 메시지 컬렉션에 저장해서 이미지 편집/교체/태그 공유를 한 곳에서
  // 처리하지만, `uploadSource: 'meeting'` 규칙으로 채팅과는 완전히 분리한다. 아래
  // confirmedMeeting.photos 는 실제 본문이 아니라 이 메시지를 가리키는 참조만
  // 남기므로, 화면에서는 갤러리/일정에만 보이고 채팅 카운트에는 포함되지 않는다.
  const handleAddMeetingPhotos = async (dateStr, files) => {
    if (!activeCal || !isValidDateString(dateStr)) {
      showToast('일정 정보를 확인할 수 없습니다.', 'error');
      return false;
    }
    const compressed = await prepareGalleryImageUploads(files, '일정 사진 업로드 준비 중...');
    if (!compressed.length) {
      setChatUploadProgress(null);
      showToast('사진을 처리할 수 없습니다.', 'error');
      return false;
    }
    try {
      const resolvedImages = await resolveChatImageBatch(activeCal.id, compressed, progress => {
        setChatUploadProgress({ ...progress, label: '일정 사진 업로드 중...' });
      }, { requireStorage: true, continueOnError: true });
      const failedCount = (resolvedImages.failed || []).length;
      const failedFiles = (resolvedImages.failed || []).map(({ index }) => files?.[index]).filter(Boolean);
      const successfulImages = resolvedImages.filter(Boolean);
      if (successfulImages.length === 0) throw new Error('모든 일정 사진 업로드에 실패했습니다. 네트워크를 확인한 뒤 다시 시도해 주세요.');
      const chunks = chunkResolvedImagesForMessages(successfulImages);
      const now = Date.now();
      const fallbackParticipantId = chatParticipantId || getActiveParticipants(activeCal)[0]?.id || '';
      const newRefs = [];
      for (let i = 0; i < chunks.length; i += 1) {
        const chunkImages = chunks[i];
        const messageOperationId = `meeting_${activeCal.id}_${dateStr}_${now}_${i}_${Math.random().toString(36).slice(2, 8)}`;
        setChatUploadProgress({
          pct: Math.min(99, 90 + Math.round((i / Math.max(1, chunks.length)) * 9)),
          remainingSec: Math.max(1, chunks.length - i),
          label: '일정 사진 저장 중...',
          current: Math.min(successfulImages.length, i + 1),
          total: successfulImages.length
        });
        const messageData = {
          participantId: fallbackParticipantId,
          text: i === 0 ? '일정 사진' : '',
          imageUrl: chunkImages[0].imageUrl,
          thumbUrl: chunkImages[0].thumbUrl,
          imageUrls: chunkImages.map(r => r.imageUrl),
          thumbUrls: chunkImages.map(r => r.thumbUrl),
          imageTags: chunkImages.map(img => buildMetadataTags(img.metadata, dateStr)),
          timestamp: now + i,
          uploadSource: 'meeting'
        };
        const sent = await writeCollectionDocumentWithFallback('messages', activeCal.id, '', messageData, 'add', '일정 사진 저장', { documentId: messageOperationId });
        if (!sent || !sent.id) throw new Error(`Meeting photo save failed ${i + 1}/${chunks.length}`);
        const newMessageId = sent.id;
        const photoIdPrefix = `photo_${activeCal.id}_${dateStr}_${now}_${i}`;
        chunkImages.forEach((img, idx) => {
          const photoId = `${photoIdPrefix}_${idx}_${Math.random().toString(36).slice(2, 7)}`;
          const keys = getMediaIdentityKeys({
            source: 'meeting',
            meetingDate: dateStr,
            photoId
          }, { source: 'meeting', meetingDate: dateStr });
          newRefs.push({
            id: photoId,
            imageUrl: img.imageUrl,
            thumbUrl: img.thumbUrl || img.imageUrl,
            createdAt: now + i,
            source: 'lightbox-tag',
            sourceMessageId: newMessageId || '',
            sourceImageIndex: idx,
            tags: dateStrToHashtag(dateStr),
            assetKey: keys.assetKey,
            mediaKey: keys.mediaKey,
            refKey: keys.refKey
          });
        });
      }
      const existingMeetings = getConfirmedMeetings(activeCal);
      const meetingIndex = existingMeetings.findIndex(m => m.date === dateStr);
      let meetings = existingMeetings;
      if (meetingIndex < 0) {
        meetings = [...existingMeetings, { date: dateStr, note: '', confirmedAt: null, confirmed: false, expenses: [], photos: [] }];
      }
      const targetIndex = meetingIndex >= 0 ? meetingIndex : meetings.length - 1;
      const nextConfirmedMeetings = meetings.map((m, i) => i === targetIndex
        ? { ...m, photos: [...(Array.isArray(m.photos) ? m.photos : []), ...newRefs], amount: m.amount || null }
        : m);
      const photoLog = createActivityLog(activeCal.id, 'photo_create', dateStr, '', now, `${newRefs.length}장 일정 사진 추가`);
      const ok = await commitConfirmedMeetings(nextConfirmedMeetings, '일정 사진 저장완료', photoLog ? [photoLog] : []);
      setChatUploadProgress({ pct: 100, remainingSec: 0, label: '일정 사진 저장 완료' });
      if (failedCount > 0) showRetryableUploadToast(`${successfulImages.length}장 저장 완료, ${failedCount}장은 실패했습니다. 실패한 사진만 다시 시도할 수 있습니다.`, () => handleAddMeetingPhotos(dateStr, failedFiles), 7000);
      return ok;
    } catch (err) {
      console.error('handleAddMeetingPhotos failed:', err);
      // Same reasoning as describeUpdateCalendarsFailure above (see its comment): a bare
      // "일정 사진 저장 실패" with the real reason only in the console is exactly what made this
      // keep getting reported without ever getting fixed. Everything that can throw inside the
      // try block above (resolveChatImageBatch's Storage upload, the per-chunk Firestore message
      // writes) surfaces a Firebase/network error message that's usually readable on its own
      // (e.g. "Missing or insufficient permissions.", a timeout, a quota message) even though it
      // isn't hand-written Korean like updateCalendars' own errors -- so this appends it whenever
      // it looks like a plain message rather than a raw JSON/object dump.
      const rawMessage = err && typeof err.message === 'string' ? err.message.trim() : '';
      const detail = rawMessage && rawMessage.length <= 300 && !/[{}[\]]/.test(rawMessage) ? `: ${rawMessage}` : '';
      showRetryableUploadToast(`일정 사진 저장 실패${detail}`, () => handleAddMeetingPhotos(dateStr, files), 6000);
      return false;
    } finally {
      setTimeout(() => setChatUploadProgress(null), 250);
    }
  };

  const isSameImageUrl = (url1, url2) => {
    if (!url1 || !url2) return false;
    if (url1 === url2) return true;
    const c1 = String(url1).split('?')[0];
    const c2 = String(url2).split('?')[0];
    return c1 === c2;
  };

  const photoMatchesUrl = (p, targetUrl) => {
    if (!p || !targetUrl) return false;
    const urls = [p.imageUrl, p.thumbUrl, p.full, p.thumb, p.url].filter(Boolean);
    return urls.some(u => isSameImageUrl(u, targetUrl));
  };

  const photoMatchesIdentity = (p, identityKey) => {
    if (!p || !identityKey) return false;
    return p.id === identityKey || p.refKey === identityKey || p.mediaKey === identityKey || p.assetKey === identityKey;
  };

  const photoMatchesIdentityPayload = (photo, identity = {}) => {
    if (!photo || !identity || typeof identity !== 'object') return false;
    const keys = [identity.photoId, identity.refKey, identity.mediaKey, identity.assetKey].filter(Boolean);
    if (keys.some(key => photoMatchesIdentity(photo, key))) return true;
    const urls = [identity.imageUrl, identity.thumbUrl, identity.full, identity.thumb].filter(Boolean);
    return urls.some(url => photoMatchesUrl(photo, url));
  };

  const photoIdentityKeys = (identity = {}) => [identity.photoId, identity.refKey, identity.mediaKey, identity.assetKey].filter(Boolean);

  const resolveImageEntryIndex = (entries, preferredIndex, identity = {}) => {
    if (!Array.isArray(entries) || entries.length === 0) return -1;
    const keys = photoIdentityKeys(identity);
    const urls = [identity.imageUrl, identity.thumbUrl, identity.full, identity.thumb].filter(Boolean);
    if (keys.length) {
      const matchedByKey = entries.findIndex(entry => keys.some(key => photoMatchesIdentity(entry, key)));
      if (matchedByKey >= 0) return matchedByKey;
    }
    if (urls.length) {
      const matchedByUrl = entries.findIndex(entry => urls.some(url => entry.full === url || entry.thumb === url || entry.imageUrl === url));
      if (matchedByUrl >= 0) return matchedByUrl;
    }
    const fallbackIndex = Number.isInteger(preferredIndex)
      ? preferredIndex
      : (Number.isInteger(identity.imageIndex) ? identity.imageIndex : (Number.isInteger(identity.sourceImageIndex) ? identity.sourceImageIndex : null));
    return Number.isInteger(fallbackIndex) && fallbackIndex >= 0 && fallbackIndex < entries.length ? fallbackIndex : -1;
  };

  const handleDeleteMeetingPhoto = (dateStr, photoId, imageUrl, options = {}) => {
    if (!activeCal) return false;
    const existingMeetings = getConfirmedMeetings(activeCal);
    let meetingIndex = isValidDateString(dateStr) ? existingMeetings.findIndex(m => m.date === dateStr) : -1;
    if (meetingIndex < 0) {
      meetingIndex = existingMeetings.findIndex(m => (m.photos || []).some(p => (
        (photoId && photoMatchesIdentity(p, photoId))
        || photoMatchesIdentity(p, options.refKey)
        || photoMatchesIdentity(p, options.mediaKey)
        || photoMatchesUrl(p, imageUrl)
      )));
    }
    if (meetingIndex < 0) return false;
    const meeting = existingMeetings[meetingIndex];
    const existingPhotos = Array.isArray(meeting.photos) ? meeting.photos : [];
    const deletedPhoto = existingPhotos.find(p => (
      (photoId && photoMatchesIdentity(p, photoId))
      || photoMatchesIdentity(p, options.refKey)
      || photoMatchesIdentity(p, options.mediaKey)
      || photoMatchesUrl(p, imageUrl)
    ));
    if (!deletedPhoto) return false;
    const previousMeetings = cloneConfirmedMeetings(existingMeetings);
    const now = Date.now();
    const nextConfirmedMeetings = existingMeetings.map((m, i) => i === meetingIndex
      ? { ...m, photos: existingPhotos.map(p => (p === deletedPhoto || p.id === deletedPhoto.id || photoMatchesUrl(p, imageUrl)) ? { ...p, deletedAt: Date.now(), updatedAt: Date.now() } : p), updatedAt: Date.now() }
      : m);
    const targetDate = meeting.date || dateStr;
    const photoLog = createActivityLog(activeCal.id, 'photo_delete', targetDate, '', now, '일정 사진 삭제');
    const ok = commitConfirmedMeetings(nextConfirmedMeetings, null, photoLog ? [photoLog] : [], 'write', 'delete');
    const restoreSourceTags = typeof options.restoreSourceTags === 'string' ? options.restoreSourceTags : '';
    const restoreSourceMessageId = options.restoreSourceMessageId || '';
    const restoreSourceImageIndex = Number.isInteger(options.restoreSourceImageIndex) ? options.restoreSourceImageIndex : null;
    const shouldDeleteStorage = !restoreSourceMessageId && !deletedPhoto?.sourceMessageId;
    const finalizeStorageDeletion = () => {
      if (!shouldDeleteStorage) return;
      deleteChatImageFromStorage(deletedPhoto.imageUrl || imageUrl);
      if (deletedPhoto.thumbUrl && deletedPhoto.thumbUrl !== (deletedPhoto.imageUrl || imageUrl)) {
        deleteChatImageFromStorage(deletedPhoto.thumbUrl);
      }
    };
    const undoDelete = async () => {
      try {
        const restoredMeetings = cloneConfirmedMeetings(previousMeetings);
        await commitConfirmedMeetings(restoredMeetings, null, [], 'restore');
        if (restoreSourceMessageId && Number.isInteger(restoreSourceImageIndex) && restoreSourceTags) {
          await handleSaveImageTags(restoreSourceMessageId, restoreSourceImageIndex, restoreSourceTags, {
            source: 'meeting',
            uploadSource: 'meeting',
            meetingDate: targetDate,
            photoId: deletedPhoto.id,
            imageUrl: deletedPhoto.imageUrl || imageUrl,
            thumbUrl: deletedPhoto.thumbUrl || deletedPhoto.imageUrl || imageUrl,
            sourceMessageId: restoreSourceMessageId,
            sourceImageIndex: restoreSourceImageIndex
          });
        }
        showToast('일정 사진 복원완료', 'success', 3000);
      } catch (err) {
        console.error('handleDeleteMeetingPhoto undo failed:', err);
        showToast('일정 사진 복원 실패', 'error', 4000);
      }
    };
    return ok.then(result => {
      if (!result) return false;
      if (options.silent) {
        if (shouldDeleteStorage) finalizeStorageDeletion();
        return true;
      }
      const onExpire = shouldDeleteStorage ? async () => {
        finalizeStorageDeletion();
      } : null;
      showUndoableDeleteToast('일정 사진이 삭제되었습니다.', undoDelete, onExpire, 5000);
      return true;
    });
  };

  const handleReplaceMeetingPhoto = async (dateStr, photoId, file, imageUrl, options = {}) => {
    if (!activeCal || !file) return false;
    const existingMeetings = getConfirmedMeetings(activeCal);
    let meetingIndex = isValidDateString(dateStr) ? existingMeetings.findIndex(m => m.date === dateStr) : -1;
    if (meetingIndex < 0) {
      meetingIndex = existingMeetings.findIndex(m => (m.photos || []).some(p => (
        (photoId && photoMatchesIdentity(p, photoId))
        || photoMatchesIdentity(p, options.refKey)
        || photoMatchesIdentity(p, options.mediaKey)
        || (imageUrl && (p.imageUrl === imageUrl || p.thumbUrl === imageUrl))
      )));
    }
    if (meetingIndex < 0) return false;
    const meeting = existingMeetings[meetingIndex];
    const existingPhotos = Array.isArray(meeting.photos) ? meeting.photos : [];
    const targetPhoto = existingPhotos.find(p => (
      (photoId && photoMatchesIdentity(p, photoId))
      || photoMatchesIdentity(p, options.refKey)
      || photoMatchesIdentity(p, options.mediaKey)
      || (imageUrl && (p.imageUrl === imageUrl || p.thumbUrl === imageUrl))
    ));
    if (!targetPhoto) return false;
    const compressed = await prepareGalleryImageUploads([file], '사진 교체 준비 중...');
    if (!compressed.length) { setChatUploadProgress(null); return false; }
    try {
      const [resolved] = await resolveChatImageBatch(activeCal.id, compressed, progress => {
        setChatUploadProgress({ ...progress, label: '사진 교체 중...' });
      });
      if (!resolved) throw new Error('Replacement upload returned no result');
      const prevImageUrl = targetPhoto.imageUrl;
      const prevThumbUrl = targetPhoto.thumbUrl;
      const nextConfirmedMeetings = existingMeetings.map((m, i) => i === meetingIndex
        ? { ...m, photos: existingPhotos.map(photo => (photo === targetPhoto || (photoId && photoMatchesIdentity(photo, photoId))) ? { ...photo, imageUrl: resolved.imageUrl, thumbUrl: resolved.thumbUrl || resolved.imageUrl } : photo) }
        : m);
      const ok = await commitConfirmedMeetings(nextConfirmedMeetings, '사진 교체완료');
      if (ok) {
        deleteChatImageFromStorage(prevImageUrl);
        deleteChatImageFromStorage(prevThumbUrl);
      }
      return ok ? resolved.imageUrl : false;
    } catch (err) {
      console.error('handleReplaceMeetingPhoto failed:', err);
      showRetryableUploadToast('사진 교체 실패', () => handleReplaceMeetingPhoto(dateStr, photoId, file, imageUrl, options), 5000);
      return false;
    } finally {
      setTimeout(() => setChatUploadProgress(null), 250);
    }
  };

  // Shared by handleDeleteChatMessagePhoto/handleReplaceChatMessagePhoto -- mirrors
  // handleSaveImageTags' own message lookup (local state first, then a direct Firestore/REST
  // read, since the Lightbox can be opened on a message that hasn't been paginated into
  // chatMessages yet).
  // Stable findChatMessageById for DateModal source-message effect.
  const chatMessagesRef = React.useRef(chatMessages);
  chatMessagesRef.current = chatMessages;
  const galleryChatMessagesRef = React.useRef(galleryChatMessages);
  galleryChatMessagesRef.current = galleryChatMessages;
  const findChatMessageById = React.useCallback(async messageId => {
    const pools = [chatMessagesRef.current, galleryChatMessagesRef.current];
    for (let i = 0; i < pools.length; i += 1) {
      const local = (pools[i] || []).find(msg => msg && msg.id === messageId);
      if (local) return local;
    }
    try {
      if (firebaseDb) {
        const snap = await withTimeout(firebaseDb.collection('calendars').doc(`cal_${activeCalId}`).collection('messages').doc(messageId).get(), 9000, 'photo edit source message read');
        return snap?.exists ? { id: messageId, ...snap.data() } : null;
      }
      return await fetchMessageRest(activeCalId, messageId);
    } catch (readErr) {
      console.warn('findChatMessageById failed:', readErr);
      return null;
    }
  }, [activeCalId, firebaseDb]);

  // Keeps confirmedMeeting.photos[] REFERENCES (see linkTaggedImageToMeetingDates) pointing at
  // the right photo after the chat message they trace back to loses an image -- the entry at
  // the deleted index is dropped (that photo is gone everywhere now, not just here), and every
  // later index shifts down by one to track the now-renumbered imageUrls array. Pass
  // deletedImageIndex=null when the whole message was removed, dropping every reference to it
  // regardless of index.
  const unlinkMeetingPhotoReferences = async (messageId, deletedImageIndex, deletedPhoto = {}) => {
    if (!activeCal || !messageId) return true;
    const existingMeetings = getConfirmedMeetings(activeCal);
    let changed = false;
    const deletedIdentity = {
      photoId: deletedPhoto.photoId || '',
      mediaKey: deletedPhoto.mediaKey || '',
      refKey: deletedPhoto.refKey || '',
      imageUrl: deletedPhoto.imageUrl || '',
      thumbUrl: deletedPhoto.thumbUrl || ''
    };
    const nextConfirmedMeetings = existingMeetings.map(meeting => {
      const photos = Array.isArray(meeting.photos) ? meeting.photos : [];
      let meetingChanged = false;
      const nextPhotos = photos.reduce((acc, p) => {
        if (p?.sourceMessageId !== messageId) {
          acc.push(p);
          return acc;
        }
        const identityMatch = photoMatchesIdentityPayload(p, deletedIdentity);
        const indexMatch = deletedImageIndex === null || p.sourceImageIndex === deletedImageIndex;
        if (identityMatch || indexMatch) {
          meetingChanged = true;
          return acc;
        }
        if (Number.isInteger(deletedImageIndex) && p.sourceImageIndex > deletedImageIndex) {
          meetingChanged = true;
          acc.push({ ...p, sourceImageIndex: p.sourceImageIndex - 1 });
          return acc;
        }
        acc.push(p);
        return acc;
      }, []);
      if (!meetingChanged) return meeting;
      changed = true;
      return { ...meeting, photos: nextPhotos };
    });
    if (!changed) return true;
    const ok = await commitConfirmedMeetings(nextConfirmedMeetings, null, [], 'write', 'success');
    if (!ok) {
      throw new Error('일정 사진 연결 정리 실패');
    }
    return true;
  };

  const handleDeleteChatMessagePhoto = async (messageId, imageIndex, options) => {
    const silent = !!(options && options.silent);
    if (!messageId || !Number.isInteger(imageIndex)) return false;
    const sourceMessage = await findChatMessageById(messageId);
    if (!sourceMessage) {
      return false;
    }
    const entries = getMessageImageEntries(sourceMessage);
    const target = entries[imageIndex];
    if (!target) return false;
    const nextUrls = entries.filter((_, i) => i !== imageIndex).map(e => e.full);
    const nextThumbs = entries.filter((_, i) => i !== imageIndex).map(e => e.thumb);
    const nextTags = entries.filter((_, i) => i !== imageIndex).map(e => e.tags || '');
    const remainingText = String(sourceMessage.text || '').trim();
    const remainingFiles = Array.isArray(sourceMessage.fileAttachments) ? sourceMessage.fileAttachments.filter(Boolean) : [];
    const previousMeetings = cloneConfirmedMeetings(getConfirmedMeetings(activeCal));
    const sourceSnapshot = JSON.parse(JSON.stringify(sourceMessage));
    const deletedPhotoIdentity = {
      photoId: target.refKey || target.mediaKey || '',
      mediaKey: target.mediaKey || '',
      refKey: target.refKey || '',
      imageUrl: target.full || '',
      thumbUrl: target.thumb || ''
    };
    // Firestore messages rules only allow a fixed key set. Client snapshots often carry `id`
    // and other local-only fields; writing those on undo caused permission-denied / restore fail.
    const pickMessageFieldsForWrite = (msg, { asCreate = false } = {}) => {
      const allowed = asCreate
        ? ['participantId', 'text', 'timestamp', 'imageUrl', 'thumbUrl', 'imageUrls', 'thumbUrls', 'imageTags', 'uploadSource', 'linkPreview', 'fileAttachments', 'replyTo']
        : ['text', 'imageUrl', 'thumbUrl', 'imageUrls', 'thumbUrls', 'imageShareUrls', 'imageTags', 'directMediaTags', 'participantId', 'linkPreview', 'fileAttachments'];
      const out = {};
      for (const key of allowed) {
        if (msg && msg[key] !== undefined) out[key] = msg[key];
      }
      if (asCreate) {
        if (typeof out.participantId !== 'string') out.participantId = String(msg && msg.participantId || '');
        if (typeof out.timestamp !== 'number') out.timestamp = Number(msg && msg.timestamp) || Date.now();
        if (out.text === undefined) out.text = typeof (msg && msg.text) === 'string' ? msg.text : '';
      }
      return sanitizeMessageForFirestore(out);
    };
    const finalizeStorageDeletion = () => {
      deleteChatImageFromStorage(target.full);
      if (target.thumb !== target.full) deleteChatImageFromStorage(target.thumb);
    };
    // `writeCollectionDocumentWithFallback` can also return { queued: true } when neither the
    // SDK nor REST attempt could complete in time (see FIRESTORE_WRITE_DEADLINE_MS/
    // shouldQueueCollectionWrite) -- the operation is durably saved for a later automatic retry,
    // but it has NOT actually reached Firestore yet. Callers used to treat that identically to a
    // real success, showing "사진이 삭제되었습니다." even though the photo was still sitting on
    // the server -- exactly the confusing "it says deleted but it's still there" symptom this is
    // fixing. Surface the truth instead so the user knows to wait rather than repeat the action.
    let wasQueued;
    try {
      const isWholeDelete = nextUrls.length === 0 && !remainingText && remainingFiles.length === 0;
      if (isWholeDelete) {
        const deleted = await writeCollectionDocumentWithFallback('messages', activeCalId, messageId, null, 'delete', '메시지 삭제');
        if (!deleted) throw new Error('Message delete failed');
        wasQueued = Boolean(deleted?.queued);
        removeLocalChatMessage(messageId);
      } else {
        const deletePaths = nextUrls.length === 0 ? ['imageUrl', 'thumbUrl'] : [];
        const data = sanitizeMessageForFirestore({
          imageUrls: nextUrls,
          thumbUrls: nextThumbs,
          imageUrl: nextUrls[0] || null,
          thumbUrl: nextThumbs[0] || null,
          imageTags: nextTags
        });
        const ok = await writeCollectionDocumentWithFallback('messages', activeCalId, messageId, data, 'update', '사진 삭제', { deletePaths });
        if (!ok) throw new Error('Photo delete update failed');
        wasQueued = Boolean(ok?.queued);
        patchLocalChatMessage(messageId, data);
      }

      let meetingCleanupOk = true;
      try {
        meetingCleanupOk = await unlinkMeetingPhotoReferences(
          messageId,
          nextUrls.length === 0 ? null : imageIndex,
          deletedPhotoIdentity
        );
      } catch (cleanupErr) {
        meetingCleanupOk = false;
        console.warn('handleDeleteChatMessagePhoto meeting cleanup deferred:', cleanupErr);
      }
      const canUndo = firebaseDb || !isWholeDelete;
      const restoreDeletedPhoto = async () => {
        try {
          if (isWholeDelete) {
            const createData = pickMessageFieldsForWrite(sourceSnapshot, { asCreate: true });
            const restored = await writeCollectionDocumentWithFallback('messages', activeCalId, messageId, createData, 'set', '메시지 복원');
            if (!restored) throw new Error('Message restore failed');
            upsertLocalChatMessage({ ...sourceSnapshot, ...createData, id: messageId });
          } else {
            const restoreData = pickMessageFieldsForWrite({
              imageUrls: Array.isArray(sourceSnapshot.imageUrls) ? sourceSnapshot.imageUrls : (sourceSnapshot.imageUrl ? [sourceSnapshot.imageUrl] : []),
              thumbUrls: Array.isArray(sourceSnapshot.thumbUrls) ? sourceSnapshot.thumbUrls : (sourceSnapshot.thumbUrl ? [sourceSnapshot.thumbUrl] : []),
              imageUrl: sourceSnapshot.imageUrl || (Array.isArray(sourceSnapshot.imageUrls) ? sourceSnapshot.imageUrls[0] : null) || null,
              thumbUrl: sourceSnapshot.thumbUrl || (Array.isArray(sourceSnapshot.thumbUrls) ? sourceSnapshot.thumbUrls[0] : null) || null,
              imageTags: Array.isArray(sourceSnapshot.imageTags) ? sourceSnapshot.imageTags : [],
              text: sourceSnapshot.text,
              participantId: sourceSnapshot.participantId,
              linkPreview: sourceSnapshot.linkPreview
            }, { asCreate: false });
            const restored = await writeCollectionDocumentWithFallback('messages', activeCalId, messageId, restoreData, 'update', '사진 복원');
            if (!restored) throw new Error('Photo delete restore failed');
            patchLocalChatMessage(messageId, { ...restoreData, id: messageId });
          }
          try {
            const restoredMeetings = cloneConfirmedMeetings(previousMeetings);
            await commitConfirmedMeetings(restoredMeetings, null, [], 'restore');
          } catch (meetingErr) {
            console.warn('handleDeleteChatMessagePhoto meeting restore notice:', meetingErr);
          }
          showToast('사진 삭제를 되돌렸습니다.', 'success', 3000);
        } catch (err) {
          console.error('handleDeleteChatMessagePhoto undo failed:', err);
          showToast('사진 복원 실패', 'error', 4000);
        }
      };
      const expireStorageDeletion = async () => {
        if (!meetingCleanupOk) {
          try {
            meetingCleanupOk = await unlinkMeetingPhotoReferences(
              messageId,
              nextUrls.length === 0 ? null : imageIndex,
              deletedPhotoIdentity
            );
          } catch (cleanupErr) {
            meetingCleanupOk = false;
            console.warn('handleDeleteChatMessagePhoto meeting cleanup retry failed:', cleanupErr);
          }
        }
        if (!meetingCleanupOk) return;
        finalizeStorageDeletion();
      };
      if (wasQueued) {
        if (!silent) showToast('네트워크가 불안정하여 삭제를 대기열에 저장했습니다. 연결되면 자동으로 반영됩니다.', 'info', 6000);
      } else if (silent) {
        await expireStorageDeletion();
      } else if (canUndo) {
        showUndoableDeleteToast('사진이 삭제되었습니다.', restoreDeletedPhoto, expireStorageDeletion, 5000);
      } else {
        showToast('사진이 삭제되었습니다.', 'delete', 5000, null, expireStorageDeletion);
      }
      return true;
    } catch (err) {
      console.error('handleDeleteChatMessagePhoto failed:', err);
      if (!silent) showToast('사진 삭제 실패', 'error', 4000);
      return false;
    }
  };

  const handleReplaceChatMessagePhoto = async (messageId, imageIndex, file) => {
    if (!messageId || !Number.isInteger(imageIndex) || !file) return false;
    const sourceMessage = await findChatMessageById(messageId);
    if (!sourceMessage) {
      showToast('교체 대상 이미지를 찾지 못했습니다.', 'error', 4000);
      return false;
    }
    const entries = getMessageImageEntries(sourceMessage);
    const target = entries[imageIndex];
    if (!target) return false;
    const compressed = await prepareGalleryImageUploads([file], '사진 교체 준비 중...');
    if (!compressed.length) { setChatUploadProgress(null); return false; }
    try {
      const [resolved] = await resolveChatImageBatch(activeCalId, compressed, progress => {
        setChatUploadProgress({ ...progress, label: '사진 교체 중...' });
      });
      if (!resolved) throw new Error('Replacement upload returned no result');
      const nextUrls = entries.map((e, i) => i === imageIndex ? resolved.imageUrl : e.full);
      const nextThumbs = entries.map((e, i) => i === imageIndex ? (resolved.thumbUrl || resolved.imageUrl) : e.thumb);
      const data = sanitizeMessageForFirestore({
        imageUrls: nextUrls,
        thumbUrls: nextThumbs,
        imageUrl: nextUrls[0] || null,
        thumbUrl: nextThumbs[0] || null
      });
      const ok = await writeCollectionDocumentWithFallback('messages', activeCalId, messageId, data, 'update', '사진 교체');
      if (!ok) throw new Error('Photo replace update failed');
      patchLocalChatMessage(messageId, data);
      deleteChatImageFromStorage(target.full);
      if (target.thumb !== target.full) deleteChatImageFromStorage(target.thumb);
      showToast('사진 교체완료', 'success');
      return resolved.imageUrl;
    } catch (err) {
      console.error('handleReplaceChatMessagePhoto failed:', err);
      showRetryableUploadToast('사진 교체 실패', () => handleReplaceChatMessagePhoto(messageId, imageIndex, file), 5000);
      return false;
    } finally {
      setTimeout(() => setChatUploadProgress(null), 250);
    }
  };

  // Memo photos live in the memos collection, structurally identical to chat message images
  // (imageUrls/thumbUrls arrays), so this mirrors handleDeleteChatMessagePhoto/
  // handleReplaceChatMessagePhoto one-for-one against that collection instead.
  // 라이트박스 사진 댓글 -- 사진의 mediaKey/refKey(getMediaIdentityKeys, 항상 값이 있음)를
  // calendars/cal_{id}/photoComments 문서 id로 그대로 쓴다. firestore.rules의
  // isValidPhotoCommentDocId와 같은 문자셋으로 한 번 더 다듬어(콜론/점/하이픈/밑줄/영숫자만,
  // 300자 캡) 규칙에 안 걸리는 값만 서버로 보낸다.
  const handleFetchPhotoComments = React.useCallback(async photoKey => {
    const docId = String(photoKey || '').replace(/[^A-Za-z0-9_:.-]/g, '_').slice(0, 300);
    if (photoCommentStoreRef.current) return photoCommentStoreRef.current.fetch(docId);
    return fetchPhotoComments({
      photoKey,
      calendarId: activeCalId,
      db: firebaseDb,
      projectId: firebaseConfig.projectId,
      decodeDocument: firestoreDocumentToJs
    });
  }, [activeCalId, firebaseDb]);
  const handleSavePhotoComments = async (photoKey, nextComments) => {
    const saved = await savePhotoComments({
      photoKey,
      comments: nextComments,
      calendarId: activeCalId,
      writeDocument: writeCollectionDocumentWithFallback,
      audit: (type, detail) => queueServerAuditEvent(activeCalId, type, detail, getClientAuditContext())
    });
    if (saved) {
      const docId = String(photoKey || '').replace(/[^A-Za-z0-9_:.-]/g, '_').slice(0, 300);
      if (docId) {
        const comments = Array.isArray(nextComments) ? nextComments : [];
        if (photoCommentStoreRef.current) photoCommentStoreRef.current.updateLocal(docId, comments);
        setPreloadedPhotoComments(previous => {
          const next = { ...previous };
          if (comments.length > 0) next[docId] = comments;
          else delete next[docId];
          return next;
        });
        setPhotoCommentCounts(previous => {
          const next = { ...previous };
          if (comments.length > 0) next[docId] = comments.length;
          else delete next[docId];
          return next;
        });
      }
    }
    return saved;
  };

  const findMemoById = async memoId => {
    const local = (memos || []).find(m => m.id === memoId);
    if (local) return local;
    try {
      if (firebaseDb) {
        const snap = await firebaseDb.collection('calendars').doc(`cal_${activeCalId}`).collection('memos').doc(memoId).get();
        return snap?.exists ? { id: memoId, ...snap.data() } : null;
      }
      const res = await fetch(`https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/calendars/cal_${activeCalId}/memos/${memoId}`);
      return res.ok ? { id: memoId, ...firestoreDocumentToJs(await res.json()) } : null;
    } catch (readErr) {
      console.warn('findMemoById failed:', readErr);
      return null;
    }
  };

  const handleDeleteMemoPhoto = async (memoId, imageIndex, options) => {
    const silent = !!(options && options.silent);
    if (!memoId || !Number.isInteger(imageIndex)) return false;
    const memo = await findMemoById(memoId);
    if (!memo) {
      return false;
    }
    const urls = Array.isArray(memo.imageUrls) ? memo.imageUrls : (memo.imageUrl ? [memo.imageUrl] : []);
    const thumbs = Array.isArray(memo.thumbUrls) ? memo.thumbUrls : (memo.thumbUrl ? [memo.thumbUrl] : []);
    if (!urls[imageIndex]) return false;
    const removedUrl = urls[imageIndex];
    const removedThumb = thumbs[imageIndex] || removedUrl;
    const nextUrls = urls.filter((_, i) => i !== imageIndex);
    const nextThumbs = thumbs.filter((_, i) => i !== imageIndex);
    const nextImageTags = Array.isArray(memo.imageTags) ? memo.imageTags.filter((_, i) => i !== imageIndex) : undefined;
    const memoSnapshot = JSON.parse(JSON.stringify(memo));
    const finalizeStorageDeletion = () => {
      deleteChatImageFromStorage(removedUrl);
      if (removedThumb !== removedUrl) deleteChatImageFromStorage(removedThumb);
    };
    try {
      const deletePaths = nextUrls.length === 0 ? ['imageUrl', 'thumbUrl'] : [];
      const data = sanitizeMemoForFirestore({ imageUrls: nextUrls, thumbUrls: nextThumbs, imageUrl: nextUrls[0] || null, thumbUrl: nextThumbs[0] || null, ...(nextImageTags ? { imageTags: nextImageTags } : {}) });
      const updated = await writeCollectionDocumentWithFallback('memos', activeCalId, memoId, data, 'update', '메모 사진 삭제', { deletePaths });
      if (!updated) throw new Error('Memo photo delete failed');
      setMemos(prev => prev.map(m => m.id === memoId ? { ...m, ...data } : m));
      if (typeof patchGalleryArchiveMemo === 'function') patchGalleryArchiveMemo(memoId, data);
      if (silent) {
        finalizeStorageDeletion();
        return true;
      }
      showUndoableDeleteToast('사진이 삭제되었습니다.', async () => {
        try {
          const restored = await writeCollectionDocumentWithFallback('memos', activeCalId, memoId, sanitizeMemoForFirestore(memoSnapshot), 'set', '메모 사진 복원');
          if (!restored) throw new Error('Memo photo restore failed');
          setMemos(prev => prev.map(m => m.id === memoId ? { ...m, ...memoSnapshot } : m));
          if (typeof patchGalleryArchiveMemo === 'function') patchGalleryArchiveMemo(memoId, memoSnapshot);
          showToast('사진 삭제를 되돌렸습니다.', 'success', 3000);
        } catch (err) {
          console.error('handleDeleteMemoPhoto undo failed:', err);
          showToast('사진 복원 실패', 'error', 4000);
        }
      }, finalizeStorageDeletion, 5000);
      return true;
    } catch (err) {
      console.error('handleDeleteMemoPhoto failed:', err);
      if (!silent) showToast('사진 삭제 실패', 'error', 4000);
      return false;
    }
  };

  const handleReplaceMemoPhoto = async (memoId, imageIndex, file) => {
    if (!memoId || !Number.isInteger(imageIndex) || !file) return false;
    const memo = await findMemoById(memoId);
    if (!memo) {
      showToast('교체 대상 이미지를 찾지 못했습니다.', 'error', 4000);
      return false;
    }
    const urls = Array.isArray(memo.imageUrls) ? memo.imageUrls : (memo.imageUrl ? [memo.imageUrl] : []);
    const thumbs = Array.isArray(memo.thumbUrls) ? memo.thumbUrls : (memo.thumbUrl ? [memo.thumbUrl] : []);
    if (!urls[imageIndex]) return false;
    const compressed = await prepareGalleryImageUploads([file], '사진 교체 준비 중...');
    if (!compressed.length) { setChatUploadProgress(null); return false; }
    try {
      const [resolved] = await resolveChatImageBatch(activeCalId, compressed, progress => {
        setChatUploadProgress({ ...progress, label: '사진 교체 중...' });
      });
      if (!resolved) throw new Error('Replacement upload returned no result');
      const removedUrl = urls[imageIndex];
      const removedThumb = thumbs[imageIndex] || removedUrl;
      const nextUrls = urls.map((u, i) => i === imageIndex ? resolved.imageUrl : u);
      const nextThumbs = thumbs.map((t, i) => i === imageIndex ? (resolved.thumbUrl || resolved.imageUrl) : t);
      const data = sanitizeMemoForFirestore({ imageUrls: nextUrls, thumbUrls: nextThumbs, imageUrl: nextUrls[0] || null, thumbUrl: nextThumbs[0] || null });
      const updated = await writeCollectionDocumentWithFallback('memos', activeCalId, memoId, data, 'update', '메모 사진 교체');
      if (!updated) throw new Error('Memo photo replace failed');
      setMemos(prev => prev.map(m => m.id === memoId ? { ...m, ...data } : m));
      deleteChatImageFromStorage(removedUrl);
      if (removedThumb !== removedUrl) deleteChatImageFromStorage(removedThumb);
      showToast('사진 교체완료', 'success');
      return resolved.imageUrl;
    } catch (err) {
      console.error('handleReplaceMemoPhoto failed:', err);
      showRetryableUploadToast('사진 교체 실패', () => handleReplaceMemoPhoto(memoId, imageIndex, file), 5000);
      return false;
    } finally {
      setTimeout(() => setChatUploadProgress(null), 250);
    }
  };

  // Single dispatch point handed to every Lightbox instance -- routes to the right storage
  // location based on meta.source. directMediaUrl (an image pasted as a bare URL in chat/memo
  // text) has no clean single-item target to mutate, so it's left unsupported (Lightbox hides
  // the edit/delete buttons for it).
  const findPhotoTargetByUrl = async (imageUrl, preferredMsgId, preferredDateStr, preferredPhotoId, preferredIdentity = {}) => {
    if (!imageUrl) return null;
    if (preferredMsgId) {
      const msg = await findChatMessageById(preferredMsgId);
      if (msg) {
        const getEntries = typeof getMessageImageEntries === 'function' ? getMessageImageEntries : null;
        const entries = getEntries ? getEntries(msg) : [];
        const idx = resolveImageEntryIndex(entries, preferredIdentity.imageIndex, {
          ...preferredIdentity,
          photoId: preferredPhotoId || preferredIdentity.photoId || '',
          imageUrl,
          thumbUrl: preferredIdentity.thumbUrl || imageUrl
        });
        if (idx >= 0) return { type: 'chat', messageId: msg.id, imageIndex: idx, assetKey: entries[idx]?.assetKey || entries[idx]?.mediaKey || '', mediaKey: entries[idx]?.mediaKey || '', refKey: entries[idx]?.refKey || '' };
      }
    }
    const localMsg = (allChatMessages || []).find(m => {
      const getEntries = typeof getMessageImageEntries === 'function' ? getMessageImageEntries : null;
      const entries = getEntries ? getEntries(m) : [];
      return entries.some(e => e.full === imageUrl || e.thumb === imageUrl || e.imageUrl === imageUrl || photoMatchesIdentityPayload(e, preferredIdentity));
    });
    if (localMsg) {
      const getEntries = typeof getMessageImageEntries === 'function' ? getMessageImageEntries : null;
      const entries = getEntries ? getEntries(localMsg) : [];
      const idx = resolveImageEntryIndex(entries, preferredIdentity.imageIndex, {
        ...preferredIdentity,
        photoId: preferredPhotoId || preferredIdentity.photoId || '',
        imageUrl,
        thumbUrl: preferredIdentity.thumbUrl || imageUrl
      });
      if (idx >= 0) return { type: 'chat', messageId: localMsg.id, imageIndex: idx, assetKey: entries[idx]?.assetKey || entries[idx]?.mediaKey || '', mediaKey: entries[idx]?.mediaKey || '', refKey: entries[idx]?.refKey || '' };
    }

    const localMemo = (memos || []).find(m => {
      const urls = Array.isArray(m.imageUrls) ? m.imageUrls : (m.imageUrl ? [m.imageUrl] : []);
      const thumbs = Array.isArray(m.thumbUrls) ? m.thumbUrls : (m.thumbUrl ? [m.thumbUrl] : []);
      return urls.includes(imageUrl) || thumbs.includes(imageUrl) || photoMatchesIdentityPayload(m, preferredIdentity);
    });
    if (localMemo) {
      const urls = Array.isArray(localMemo.imageUrls) ? localMemo.imageUrls : (localMemo.imageUrl ? [localMemo.imageUrl] : []);
      const thumbs = Array.isArray(localMemo.thumbUrls) ? localMemo.thumbUrls : (localMemo.thumbUrl ? [localMemo.thumbUrl] : []);
      let idx = urls.indexOf(imageUrl);
      if (idx < 0) idx = thumbs.indexOf(imageUrl);
      return { type: 'memo', memoId: localMemo.id, imageIndex: Math.max(0, idx), assetKey: `memo:${localMemo.id}:${Math.max(0, idx)}`, mediaKey: `memo:${localMemo.id}:${Math.max(0, idx)}`, refKey: `memo:${localMemo.id}:${Math.max(0, idx)}` };
    }

    const meetings = getConfirmedMeetings(activeCal);
    let targetMeeting = null;
    let targetPhoto = null;
    if (preferredDateStr && isValidDateString(preferredDateStr)) {
      const m = meetings.find(item => item.date === preferredDateStr);
      if (m && Array.isArray(m.photos)) {
        targetPhoto = m.photos.find(p => (preferredPhotoId && p.id === preferredPhotoId) || photoMatchesIdentityPayload(p, preferredIdentity) || p.imageUrl === imageUrl || p.thumbUrl === imageUrl);
        if (targetPhoto) targetMeeting = m;
      }
    }
    if (!targetMeeting) {
      for (const m of meetings) {
        if (!Array.isArray(m.photos)) continue;
        const p = m.photos.find(item => (preferredPhotoId && item.id === preferredPhotoId) || photoMatchesIdentityPayload(item, preferredIdentity) || item.imageUrl === imageUrl || item.thumbUrl === imageUrl);
        if (p) {
          targetMeeting = m;
          targetPhoto = p;
          break;
        }
      }
    }
    if (targetMeeting && targetPhoto) {
      return { type: 'meeting', dateStr: targetMeeting.date, photoId: targetPhoto.id, photo: targetPhoto, assetKey: targetPhoto.assetKey || targetPhoto.mediaKey || '', mediaKey: targetPhoto.mediaKey || '', refKey: targetPhoto.refKey || '' };
    }

    return null;
  };

  const focusElementWithShake = el => {
    if (!el) return false;
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    el.classList.remove('chat-search-focused-bubble');
    void el.offsetWidth;
    el.classList.add('chat-search-focused-bubble');
    setTimeout(() => {
      el.classList.remove('chat-search-focused-bubble');
    }, 2200);
    return true;
  };

  const dropPhotoFromGalleryIndex = meta => {
    if (!meta || typeof galleryPhotoIndex?.patchItems !== 'function') return;
    galleryPhotoIndex.patchItems(items => filterDeletedPhotoFromIndexItems(items, meta));
  };

  const handleDeletePhoto = async meta => {
    if (!meta || meta.directMediaUrl) return false;
    const silent = !!meta.silent;
    const imageUrl = meta.imageUrl || meta.full || meta.thumb;
    const msgId = meta.messageId || meta.sourceMessageId;
    const imgIdx = Number.isInteger(meta.imageIndex) ? meta.imageIndex : (Number.isInteger(meta.sourceImageIndex) ? meta.sourceImageIndex : 0);
    const dateStr = meta.meetingDate;
    const photoId = meta.photoId;
    const mediaKey = meta.mediaKey || meta.originMediaKey || '';
    const refKey = meta.refKey || '';
    const isMeetingPhotoMeta = meta.source === 'meeting' || meta.uploadSource === 'meeting' || dateStr || photoId;
    const originalTags = typeof meta.tags === 'string' ? meta.tags : '';
    const preferredIdentity = { photoId, mediaKey, refKey, assetKey: meta.assetKey || '', imageUrl, thumbUrl: meta.thumbUrl || meta.thumb || imageUrl, imageIndex: imgIdx, sourceImageIndex: meta.sourceImageIndex };
    const silentOpt = silent ? { silent: true } : undefined;
    const finish = (ok, patch) => {
      if (!ok) return false;
      dropPhotoFromGalleryIndex(patch || meta);
      return true;
    };
    const meetingOpts = extra => ({
      restoreSourceMessageId: extra.sourceMessageId,
      restoreSourceImageIndex: extra.sourceImageIndex,
      restoreSourceTags: originalTags,
      mediaKey: extra.mediaKey || mediaKey,
      refKey: extra.refKey || refKey,
      silent
    });

    if (meta.source === 'memo' && msgId) {
      if (finish(await handleDeleteMemoPhoto(msgId, imgIdx, silentOpt))) return true;
    }

    if (meta.sourceMessageId) {
      const sourceMessage = await findChatMessageById(meta.sourceMessageId);
      const entries = sourceMessage ? getMessageImageEntries(sourceMessage) : [];
      const resolvedIndex = resolveImageEntryIndex(entries, meta.sourceImageIndex, preferredIdentity);
      if (resolvedIndex >= 0) {
        // Meeting-tab photos are a view onto the shared image asset, not a separate owner.
        // Delete the canonical asset first so the photo disappears from chat, gallery, and
        // every linked meeting in one step.
        if (finish(
          await handleDeleteChatMessagePhoto(meta.sourceMessageId, resolvedIndex, silentOpt),
          { ...meta, imageIndex: resolvedIndex, messageId: meta.sourceMessageId }
        )) return true;
      }
    }

    const target = await findPhotoTargetByUrl(imageUrl, msgId, dateStr, photoId, preferredIdentity);
    if (target) {
      if (target.type === 'chat') {
        if (finish(
          await handleDeleteChatMessagePhoto(target.messageId, target.imageIndex, silentOpt),
          { ...meta, messageId: target.messageId, imageIndex: target.imageIndex }
        )) return true;
      } else if (target.type === 'memo') {
        if (finish(
          await handleDeleteMemoPhoto(target.memoId, target.imageIndex, silentOpt),
          { ...meta, messageId: target.memoId, imageIndex: target.imageIndex }
        )) return true;
      } else if (target.type === 'meeting') {
        if (finish(await handleDeleteMeetingPhoto(target.dateStr, target.photoId, imageUrl, meetingOpts(target)))) return true;
      }
    }

    if (msgId) {
      if (finish(
        await handleDeleteChatMessagePhoto(msgId, imgIdx, silentOpt),
        { ...meta, messageId: msgId, imageIndex: imgIdx }
      )) return true;
    }

    if (isMeetingPhotoMeta) {
      // Legacy fallback for meeting-only entries that do not have a canonical source asset
      // pointer. New uploads should almost always route through the shared chat/message asset
      // path above so one delete removes the photo everywhere.
      if (finish(await handleDeleteMeetingPhoto(dateStr, photoId, imageUrl, meetingOpts(meta)))) return true;
      return false;
    }

    if (finish(await handleDeleteMeetingPhoto(dateStr, photoId, imageUrl, meetingOpts(meta)))) return true;
    if (!silent) showToast('삭제 대상 사진을 찾지 못했습니다.', 'error', 4000);
    return false;
  };

  const handleReplacePhoto = async (meta, file) => {
    if (!meta || meta.directMediaUrl || !file) return false;
    const imageUrl = meta.imageUrl || meta.full || meta.thumb;
    const msgId = meta.messageId || meta.sourceMessageId;
    const imgIdx = Number.isInteger(meta.imageIndex) ? meta.imageIndex : (Number.isInteger(meta.sourceImageIndex) ? meta.sourceImageIndex : 0);
    const dateStr = meta.meetingDate;
    const photoId = meta.photoId;
    const mediaKey = meta.mediaKey || meta.originMediaKey || '';
    const refKey = meta.refKey || '';
    const preferredIdentity = { photoId, mediaKey, refKey, assetKey: meta.assetKey || '', imageUrl, thumbUrl: meta.thumbUrl || meta.thumb || imageUrl, imageIndex: imgIdx, sourceImageIndex: meta.sourceImageIndex };

    if (meta.source === 'memo' && msgId) {
      const res = await handleReplaceMemoPhoto(msgId, imgIdx, file);
      if (res) return res;
    }

    if (meta.sourceMessageId) {
      const sourceMessage = await findChatMessageById(meta.sourceMessageId);
      const entries = sourceMessage ? getMessageImageEntries(sourceMessage) : [];
      const resolvedIndex = resolveImageEntryIndex(entries, meta.sourceImageIndex, preferredIdentity);
      if (resolvedIndex >= 0) {
        // As with delete, the shared source image is the canonical asset. Replacing it there
        // keeps chat, gallery, and meeting views visually identical without having to patch each
        // view independently.
        const resChat = await handleReplaceChatMessagePhoto(meta.sourceMessageId, resolvedIndex, file);
        if (resChat) return resChat;
      }
    }

    if ((meta.source === 'meeting' || meta.uploadSource === 'meeting' || dateStr || photoId) && !meta.sourceMessageId) {
      const resMeeting = await handleReplaceMeetingPhoto(dateStr, photoId, file, imageUrl, { mediaKey, refKey });
      if (resMeeting) return resMeeting;
    }

    if (msgId) {
      const resChat = await handleReplaceChatMessagePhoto(msgId, imgIdx, file);
      if (resChat) return resChat;
    }

    const target = await findPhotoTargetByUrl(imageUrl, msgId, dateStr, photoId, preferredIdentity);
    if (target) {
      if (target.type === 'chat') {
        const res = await handleReplaceChatMessagePhoto(target.messageId, target.imageIndex, file);
        if (res) return res;
      } else if (target.type === 'memo') {
        const res = await handleReplaceMemoPhoto(target.memoId, target.imageIndex, file);
        if (res) return res;
      } else if (target.type === 'meeting') {
        const res = await handleReplaceMeetingPhoto(target.dateStr, target.photoId, file, imageUrl, { mediaKey: target.mediaKey, refKey: target.refKey });
        if (res) return res;
      }
    }

    const resFallback = await handleReplaceMeetingPhoto(dateStr, photoId, file, imageUrl, { mediaKey, refKey });
    if (resFallback) return resFallback;

    showToast('교체 대상 사진을 찾지 못했습니다.', 'error', 4000);
    return false;
  };

  const handleJumpToChatMessage = messageId => {
    if (!messageId) return;
    setActiveLightbox(null);
    changeView('chat');
    setTimeout(async () => {
      if (focusChatMessage(messageId)) return;
      for (let i = 0; i < 40 && hasMoreOlderChatRef.current; i++) {
        await Promise.resolve(loadOlderChatMessagesRef.current());
        await new Promise(resolve => setTimeout(resolve, 80));
        if (focusChatMessage(messageId)) return;
      }
      showToast('메시지를 찾을 수 없습니다.', 'error');
    }, 350);
  };

  const handleGetChatMessageOrdinal = timestamp => {
    if (!activeCalId || !timestamp) return Promise.resolve(null);
    return fetchMessageOrdinal(activeCalId, timestamp);
  };

  const handleGetGalleryPhotoOrdinal = (messageId, imageIndex) => {
    if (!activeCalId || !messageId) return Promise.resolve(null);
    return fetchGalleryPhotoOrdinal(activeCalId, messageId, imageIndex);
  };

  const handleJumpToMemo = async memoId => {
    if (!memoId) return;
    setActiveLightbox(null);
    const local = (memos || []).find(m => m.id === memoId);
    if (local) setSharedMemo(local);
    else {
      const fetched = await findMemoById(memoId);
      if (fetched) setSharedMemo(fetched);
    }
    changeView('memo');
    setTimeout(() => {
      const el = document.querySelector(`[data-memo-id="${memoId}"], #memo-${memoId}`);
      if (el) focusElementWithShake(el);
    }, 350);
  };

  const handleJumpToMemoTag = tag => {
    if (!tag) return;
    setMemoInitialTag(tag);
    changeView('memo');
  };

  const handleJumpToPlace = placeId => {
    if (!placeId) return;
    setPlacesInitialFocusId(placeId);
    changeView('places');
  };

  const handleJumpToGallery = (messageId, imageIndex, imageUrl) => {
    setActiveLightbox(null);
    changeView('gallery');
    setTimeout(() => {
      let el = imageUrl ? document.querySelector(`[data-photo-url="${CSS.escape(imageUrl)}"]`) : null;
      if (!el && messageId) {
        el = document.querySelector(`[data-message-id="${messageId}"]`);
      }
      if (el) focusElementWithShake(el);
    }, 350);
  };

  const handleJumpToMeetingDate = (dateStr, initialTab = null) => {
    if (!dateStr) return;
    setActiveLightbox(null);
    setDateModalInitialTab(initialTab);
    setSelectedDate(dateStr);
    setIsModalOpen(true);
    changeView('calendar');
    setTimeout(() => {
      const el = document.querySelector(`[data-date-str="${dateStr}"]`);
      if (el) focusElementWithShake(el);
    }, 350);
  };

  const handleSavePlace = (placeData) => {
    if (!activeCal || !Number.isFinite(placeData?.lat) || !Number.isFinite(placeData?.lng)) return false;
    const latestCal = activeCalRef.current?.id === activeCal.id ? activeCalRef.current : activeCal;
    const cleanName = sanitizeText(placeData?.name || '', 80);
    if (!cleanName) return false;
    const now = Date.now();
    const existingPlaces = getCalendarPlaces(latestCal);
    let isEditing = !!placeData.id;
    const categoryIds = new Set(getPlaceCategories(latestCal).map(c => c.id));
    const cleanCategoryId = categoryIds.has(placeData.categoryId) ? placeData.categoryId : 'etc';
    const cleanAddress = normalizePlaceAddressForSave(placeData.address || '', placeData.lat, placeData.lng);
    const cleanAlias = sanitizeText(placeData.alias || '', 80);
    const cleanMemo = sanitizeText(placeData.memo || '', 2000);
    const cleanVisitStatus = placeData.visitStatus === 'planned' ? 'planned' : 'visited';
    const cleanVisitDate = isValidDateString(placeData.visitDate) ? placeData.visitDate : '';
    const cleanSourcePlaceId = sanitizeText(placeData.sourcePlaceId || '', 120);
    // Same business, different save -- a place picked from a live search result (Kakao/Google
    // Places/Nominatim, see sourcePlaceId) that already exists somewhere in this calendar (any
    // date, or registered directly on the 장소 페이지) reuses that record instead of creating a
    // duplicate. Deliberately narrower than merging by address/name (see the no-merge rule below,
    // still in force for freehand entries like 도은네/은우네 in the same building) -- this only
    // fires when the exact same external search result was picked again, OR (second fallback)
    // when DateModal's own "이미 등록된 장소" suggestions (handleSelectExistingPlace,
    // ui-date-modal.js) pass the place's own id through as sourcePlaceId, since a private/
    // informal place (e.g. "서준네") often isn't findable in Kakao/Google's business directories
    // at all and so never gets a real external sourcePlaceId of its own.
    const candidateTargetId = (!isEditing && cleanSourcePlaceId) ? cleanSourcePlaceId : '';
    const mergeTargetPlace = candidateTargetId
      ? (existingPlaces.find(p => p.id !== placeData.id && ((p.sourcePlaceId && p.sourcePlaceId === candidateTargetId) || p.id === candidateTargetId)))
      : null;
    if (mergeTargetPlace) {
      isEditing = true;
      placeData = { ...placeData, id: mergeTargetPlace.id };
    }
    // A sourcePlaceId that just points at the merge target's own id (the "이미 등록된 장소"
    // fallback match above) isn't a real external search-result reference -- don't let it get
    // written back into the place's own sourcePlaceId field as if it were one.
    const sourcePlaceIdForSave = (mergeTargetPlace && cleanSourcePlaceId === mergeTargetPlace.id) ? '' : cleanSourcePlaceId;
    // Reusing an existing place for a (possibly new) date keeps its curated fields untouched
    // (mp() only falls back to this save's own value when the existing field is empty). A plain
    // edit (not a merge) still needs the same sourcePlaceId fallback: its incoming value is empty
    // (DateModal's pencil-icon edit form doesn't carry the original search result forward), so an
    // empty value here must not wipe out a sourcePlaceId set by an earlier save.
    const mp = (key, ownValue) => mergeTargetPlace ? (mergeTargetPlace[key] || ownValue) : ownValue;
    // Place memo is a stack of per-date entries ("YY.MM.DD 메모", one line per visit), addressable
    // individually via parsePlaceMemoEntries/upsertPlaceMemoEntry/removePlaceMemoEntry -- the same
    // functions drive DateModal's single-date view and PlacesView's full-history view, so the memo
    // reads identically everywhere it's shown. DateModal's place form always represents just ONE
    // date's note (this date, whether it's a brand new place, an existing place reused for another
    // date via merge, or an already-linked place being re-edited) and marks that with
    // memoOp:'upsert' so it's merged into the target place's existing stack instead of overwriting
    // it. Everything else (PlacesView's per-entry edit/delete, DateModal's unlink-from-date) already
    // computes and sends the exact final memo string itself, so that's stored as-is.
    const memoBasePlace = mergeTargetPlace || (isEditing ? existingPlaces.find(p => p.id === placeData.id) : null);
    const nextMemo = placeData.memoOp === 'upsert'
      // No visit date to key an entry on (e.g. visitStatus switched to 'planned') -- nothing to
      // upsert, so leave whatever stack already exists on the base place untouched rather than
      // collapsing it down to just this save's raw note.
      ? (cleanVisitDate ? upsertPlaceMemoEntry(memoBasePlace ? memoBasePlace.memo : '', cleanVisitDate, cleanMemo) : (memoBasePlace ? memoBasePlace.memo : cleanMemo))
      : (mergeTargetPlace ? mergeTargetPlace.memo : cleanMemo);
    const derivedVisitStatus = derivePlaceVisitStatus({ memo: nextMemo });
    let nextVisitDate = placeData.visitDate !== undefined ? cleanVisitDate : mp('visitDate', '');
    // 날짜 없는 후보지에 stale visitDate가 남아 일정 팝업 장소 탭에 뜨지 않도록 정리한다.
    if (derivedVisitStatus === 'planned') {
      const hasDatedMemo = parsePlaceMemoEntries(nextMemo).some(entry => normalizePlaceDateForSort(entry && entry.date));
      if (!hasDatedMemo) nextVisitDate = '';
    }
    const editedFields = {
      name: mp('name', cleanName),
      alias: mp('alias', cleanAlias),
      address: mp('address', cleanAddress),
      lat: mergeTargetPlace ? mergeTargetPlace.lat : placeData.lat,
      lng: mergeTargetPlace ? mergeTargetPlace.lng : placeData.lng,
      categoryId: mp('categoryId', cleanCategoryId),
      memo: nextMemo,
      visitStatus: derivedVisitStatus,
      visitDate: nextVisitDate,
      sourcePlaceId: mp('sourcePlaceId', sourcePlaceIdForSave || (isEditing && !mergeTargetPlace ? (existingPlaces.find(p => p.id === placeData.id) || {}).sourcePlaceId : '') || ''),
      updatedAt: now
    };
    let nextPlaces;
    if (isEditing) {
      const found = existingPlaces.some(p => p.id === placeData.id);
      nextPlaces = found
        ? existingPlaces.map(p => p.id === placeData.id ? { ...p, ...editedFields } : p)
        : [...existingPlaces, { id: placeData.id, ...editedFields, createdAt: now }];
    } else {
      nextPlaces = [...existingPlaces, { id: `place_${activeCal.id}_${now}_${Math.random().toString(36).slice(2, 7)}`, ...editedFields, createdAt: now }];
    }
    if (typeof deduplicateCalendarPlaces === 'function') {
      nextPlaces = deduplicateCalendarPlaces(nextPlaces);
    }
    const prevPlace = isEditing ? existingPlaces.find(p => p.id === placeData.id) : null;
    const displayLabel = cleanAlias || cleanName || '장소';
    const placeCats = getPlaceCategories(latestCal);
    const catName = id => (placeCats.find(c => c.id === id) || {}).name || id || '-';
    let placeLogNote = displayLabel;
    if (isEditing && prevPlace) {
      placeLogNote = buildFieldChangeNote(displayLabel, [
        { key: '별칭', before: prevPlace.alias || '', after: cleanAlias },
        { key: '이름', before: prevPlace.name || '', after: cleanName },
        { key: '메모', before: prevPlace.memo || '', after: nextMemo },
        { key: '카테고리', before: catName(prevPlace.categoryId), after: catName(cleanCategoryId) },
        { key: '주소', before: prevPlace.address || '', after: cleanAddress },
        { key: '방문', before: prevPlace.visitStatus === 'planned' ? '예정' : '방문', after: cleanVisitStatus === 'planned' ? '예정' : '방문' },
        { key: '일자', before: prevPlace.visitDate || '', after: cleanVisitDate }
      ]);
    } else if (!isEditing) {
      const bits = [displayLabel];
      if (cleanAlias && cleanAlias !== cleanName) bits.push(`별칭 ${cleanAlias}`);
      if (nextMemo) bits.push(`메모 ${sanitizeText(nextMemo, 40)}`);
      if (cleanCategoryId && cleanCategoryId !== 'etc') bits.push(`카테고리 ${catName(cleanCategoryId)}`);
      if (cleanVisitDate) bits.push(`일자 ${cleanVisitDate}`);
      placeLogNote = sanitizeText(bits.join(' · '), 300);
    }
    const placeActivityLog = createActivityLog(latestCal.id, isEditing ? 'place_update' : 'place_create', '', '', now, placeLogNote);
    const updatedCal = {
      ...latestCal,
      places: nextPlaces,
      updatedAt: now,
      revision: (activeCal.revision || 0) + 1,
      activityLogs: placeActivityLog ? [...getCalendarActivityLogs(activeCal), placeActivityLog] : getCalendarActivityLogs(activeCal)
    };
    const nextCalendars = calendarsRef.current.map(c => c.id === updatedCal.id ? updatedCal : c);
    setPlacesSubcollection(nextPlaces);
    return updateCalendars(
      nextCalendars,
      isEditing ? '장소 수정완료' : '장소 등록완료',
      'success',
      updatedCal.id,
      'settings',
      placeActivityLog ? [placeActivityLog] : [],
      // The places collection is the live source after migration. Persist the complete
      // merged set, not only the just-edited item; otherwise a settings save can leave
      // legacy places/date memos split between the calendar document and the subcollection.
      { places: nextPlaces, settingsFields: ['places'] }
    );
  };
  const handleDeletePlace = async (placeId, options) => {
    if (!activeCal || !placeId) return false;
    const existingPlaces = getCalendarPlaces(activeCal);
    const deletedPlace = existingPlaces.find(p => p.id === placeId);
    if (!deletedPlace) return false;
    const placeSnapshot = JSON.parse(JSON.stringify(deletedPlace));
    const calId = activeCal.id;
    if (firebaseDb) {
      try {
        await writeCollectionDocumentWithFallback('places', calId, placeId, null, 'delete', '장소 삭제');
      } catch (e) {
        console.warn('Failed to delete place from Firestore:', e);
      }
    }
    const now = Date.now();
    const nextPlaces = existingPlaces.filter(p => p.id !== placeId);
    const placeActivityLog = createActivityLog(activeCal.id, 'place_delete', '', '', now, deletedPlace.name || '장소');
    const updatedCal = {
      ...activeCal, places: nextPlaces, updatedAt: now, revision: (activeCal.revision || 0) + 1,
      activityLogs: placeActivityLog ? [...getCalendarActivityLogs(activeCal), placeActivityLog] : getCalendarActivityLogs(activeCal)
    };
    const nextCalendars = calendars.map(c => c.id === updatedCal.id ? updatedCal : c);
    setPlacesSubcollection(nextPlaces);
    const ok = await updateCalendars(nextCalendars, null, null, updatedCal.id, 'settings', placeActivityLog ? [placeActivityLog] : [], {
      places: nextPlaces,
      settingsFields: ['places'],
      deletedPlaceIds: [placeId]
    });
    if (ok && !(options && options.silent)) {
      showUndoableDeleteToast('장소가 삭제되었습니다.', async () => {
        try {
          const restoreNow = Date.now();
          if (firebaseDb) {
            const { id: _pid, ...placeBody } = placeSnapshot;
            await writeCollectionDocumentWithFallback('places', calId, placeId, { ...placeBody, updatedAt: restoreNow }, 'set', '장소 복원');
          }
          const latestCal = activeCalRef.current?.id === calId ? activeCalRef.current : updatedCal;
          const currentPlaces = getCalendarPlaces(latestCal);
          const restoredPlaces = currentPlaces.some(p => p.id === placeId)
            ? currentPlaces.map(p => p.id === placeId ? { ...placeSnapshot, updatedAt: restoreNow } : p)
            : [...currentPlaces, { ...placeSnapshot, updatedAt: restoreNow }];
          setPlacesSubcollection(restoredPlaces);
          const restoredCal = { ...latestCal, places: restoredPlaces, updatedAt: restoreNow, revision: (latestCal.revision || 0) + 1 };
          const next = calendarsRef.current.map(c => c.id === restoredCal.id ? restoredCal : c);
          await updateCalendars(next, '장소 삭제를 되돌렸습니다.', 'success', restoredCal.id, 'settings', [], { places: restoredPlaces, settingsFields: ['places'] });
        } catch (err) {
          console.error('handleDeletePlace undo failed:', err);
          showToast('장소 복원 실패', 'error', 4000);
        }
      }, null, 5000);
    }
    return ok;
  };
  const handleDeleteActivityLog = log => {
    if (!activeCal || !log?.id) return false;
    const logId = sanitizeText(log.id, 160);
    if (!logId) return false;
    const now = Date.now();
    const updatedCal = {
      ...activeCal,
      updatedAt: now,
      revision: (activeCal.revision || 0) + 1,
      activityLogs: getCalendarActivityLogs(activeCal),
      deletedActivityLogIds: mergeDeletedActivityLogIds(activeCal.deletedActivityLogIds || [], [logId])
    };
    const nextCalendars = calendars.map(c => c.id === updatedCal.id ? updatedCal : c);
    return updateCalendars(nextCalendars, '로그 삭제완료', 'delete', updatedCal.id);
  };
  const handleOpenPollCreate = () => {
    if (!guardLoadedCalendar('Firebase 데이터를 불러온 뒤 투표를 생성해 주세요.')) return;
    withEventUi(() => {
      setEditingPoll(null);
      setIsPollModalOpen(true);
    }, '투표');
  };
  const handleOpenPollEdit = poll => {
    if (!guardLoadedCalendar('Firebase 데이터를 불러온 뒤 투표를 수정해 주세요.')) return;
    withEventUi(() => {
      setEditingPoll(poll);
      setIsPollModalOpen(true);
    }, '투표');
  };
  const handleSavePoll = poll => {
    if (!guardLoadedCalendar('Firebase 데이터를 불러온 뒤 투표를 저장해 주세요.')) return false;
    const now = Date.now();
    const participantIds = new Set(getActiveParticipants(activeCal).map(participant => participant.id));
    const existingPoll = getCalendarPolls(activeCal).find(item => item.id === poll?.id);
    const normalizedPoll = normalizePoll(activeCal.id, {
      ...poll,
      calendarId: activeCal.id,
      updatedAt: now,
      createdAt: poll.createdAt || now
    }, participantIds);
    if (!normalizedPoll) {
      showToast('투표명·옵션 확인 필요', 'error');
      return false;
    }
    const activityLog = !existingPoll
      ? createPollActivityLog(activeCal.id, 'poll_create', '', now, normalizedPoll.title)
      : null;
    const updatedCal = {
      ...activeCal,
      updatedAt: now,
      revision: (activeCal.revision || 0) + 1,
      polls: mergePolls(getCalendarPolls(activeCal), [normalizedPoll], activeCal.id, participantIds),
      activityLogs: activityLog ? [...getCalendarActivityLogs(activeCal), activityLog] : getCalendarActivityLogs(activeCal)
    };
    const nextCalendars = calendars.map(c => c.id === updatedCal.id ? updatedCal : c);
    return updateCalendars(nextCalendars, '투표 저장완료', 'success', updatedCal.id, 'polls', activityLog ? [activityLog] : []);
  };

  const handleSaveSettlementCard = cardData => {
    if (!guardLoadedCalendar('Firebase 데이터를 불러온 뒤 정산 카드를 저장해 주세요.')) return false;
    const now = Date.now();
    const existingCards = getCalendarSettlementCards(activeCal);
    const idx = existingCards.findIndex(item => item.id === cardData?.id);
    let nextCards;
    if (idx >= 0) {
      nextCards = existingCards.map((item, i) => i === idx ? { ...item, ...cardData, updatedAt: now } : item);
    } else {
      nextCards = [{ ...cardData, updatedAt: now, createdAt: cardData.createdAt || now }, ...existingCards];
    }
    const updatedCal = {
      ...activeCal,
      updatedAt: now,
      revision: (activeCal.revision || 0) + 1,
      settlementCards: nextCards
    };
    const nextCalendars = calendars.map(c => c.id === updatedCal.id ? updatedCal : c);
    return updateCalendars(nextCalendars, '정산 카드 저장완료', 'success', updatedCal.id, 'settings', [], { settingsFields: ['settlementCards'] });
  };

  const handleDeleteSettlementCard = cardId => {
    if (!guardLoadedCalendar('Firebase 데이터를 불러온 뒤 삭제해 주세요.')) return false;
    const now = Date.now();
    const existingCards = getCalendarSettlementCards(activeCal);
    // Tombstoned (deletedAt set) instead of filtered out, so mergeSettlementCards' by-id merge
    // (see its comment in app-firebase-data.js) carries the delete through instead of a stale
    // 'settings' save from another device silently resurrecting this card by not knowing it was
    // removed. getCalendarSettlementCards already filters tombstones out of every read path.
    const nextCards = existingCards.map(item => item.id === cardId ? { ...item, deletedAt: now, updatedAt: now } : item);
    const updatedCal = {
      ...activeCal,
      updatedAt: now,
      revision: (activeCal.revision || 0) + 1,
      settlementCards: nextCards
    };
    const nextCalendars = calendars.map(c => c.id === updatedCal.id ? updatedCal : c);
    return updateCalendars(nextCalendars, '정산 카드가 삭제되었습니다.', 'info', updatedCal.id, 'settings', [], { settingsFields: ['settlementCards'] });
  };

  const handleToggleSettlementCardStatus = cardId => {
    if (!guardLoadedCalendar('Firebase 데이터를 불러온 뒤 변경해 주세요.')) return false;
    const now = Date.now();
    const existingCards = getCalendarSettlementCards(activeCal);
    const nextCards = existingCards.map(item => {
      if (item.id === cardId) {
        const nextStatus = item.status === 'closed' ? 'active' : 'closed';
        return { ...item, status: nextStatus, updatedAt: now };
      }
      return item;
    });
    const updatedCal = {
      ...activeCal,
      updatedAt: now,
      revision: (activeCal.revision || 0) + 1,
      settlementCards: nextCards
    };
    const nextCalendars = calendars.map(c => c.id === updatedCal.id ? updatedCal : c);
    return updateCalendars(nextCalendars, '정산 상태가 변경되었습니다.', 'info', updatedCal.id, 'settings', [], { settingsFields: ['settlementCards'] });
  };
  const handleOpenVoteSheet = (poll, option) => {
    if (!guardLoadedCalendar('Firebase 데이터를 불러온 뒤 투표해 주세요.')) return false;
    if (isPollClosed(poll)) {
      showToast('마감된 투표입니다', 'error');
      return false;
    }
    const activeParticipants = getActiveParticipants(activeCal);
    if (activeParticipants.length === 0) {
      showToast('참여자 설정 필요', 'error');
      return false;
    }
    setVoteTarget({ pollId: poll.id, optionId: option.id });
    return true;
  };
  const handleVotePoll = (pollId, optionId, participantId) => {
    if (!guardLoadedCalendar('Firebase 데이터를 불러온 뒤 투표해 주세요.')) return false;
    const activeParticipants = getActiveParticipants(activeCal);
    const participantIds = new Set(activeParticipants.map(participant => participant.id));
    if (!participantIds.has(participantId)) {
      showToast('참여자 재선택 필요', 'error');
      return false;
    }
    const poll = getCalendarPolls(activeCal).find(item => item.id === pollId);
    const option = getActivePollOptions(poll).find(item => item.id === optionId);
    if (!poll || !option) {
      showToast('투표 정보 확인 필요', 'error');
      return false;
    }
    if (isPollClosed(poll)) {
      showToast('마감된 투표입니다', 'error');
      return false;
    }
    const now = Date.now();
    const optionIds = new Set(getActivePollOptions(poll).map(item => item.id));
    const votes = normalizePollVotes(poll.votes || {}, optionIds, participantIds);
    const alreadyVoted = (votes[option.id] || []).includes(participantId);
    votes[option.id] = Array.from(new Set([...(votes[option.id] || []), participantId]));
    const nextPoll = {
      ...poll,
      votes,
      updatedAt: now
    };
    const activityLog = !alreadyVoted
      ? createPollActivityLog(activeCal.id, 'poll_vote', participantId, now, `${poll.title} / ${option.text}`)
      : null;
    const updatedCal = {
      ...activeCal,
      updatedAt: now,
      revision: (activeCal.revision || 0) + 1,
      polls: mergePolls(getCalendarPolls(activeCal), [nextPoll], activeCal.id, participantIds),
      activityLogs: activityLog ? [...getCalendarActivityLogs(activeCal), activityLog] : getCalendarActivityLogs(activeCal)
    };
    const nextCalendars = calendars.map(c => c.id === updatedCal.id ? updatedCal : c);
    setVoteTarget(null);
    return updateCalendars(nextCalendars, '투표 반영완료', 'success', updatedCal.id, 'polls', activityLog ? [activityLog] : []);
  };
  const handleCancelVote = (poll, option, participantId) => {
    if (!guardLoadedCalendar('Firebase 데이터를 불러온 뒤 투표를 취소해 주세요.')) return false;
    if (isPollClosed(poll)) {
      showToast('마감된 투표입니다', 'error');
      return false;
    }
    const activeParticipants = getActiveParticipants(activeCal);
    const participantIds = new Set(activeParticipants.map(participant => participant.id));
    const optionIds = new Set(getActivePollOptions(poll).map(item => item.id));
    const votes = normalizePollVotes(poll.votes || {}, optionIds, participantIds);
    const hadVote = (votes[option.id] || []).includes(participantId);
    votes[option.id] = (votes[option.id] || []).filter(id => id !== participantId);
    const now = Date.now();
    const nextPoll = {
      ...poll,
      votes,
      updatedAt: now
    };
    const activityLog = hadVote
      ? createPollActivityLog(activeCal.id, 'poll_cancel', participantId, now, `${poll.title} / ${option.text}`)
      : null;
    const updatedCal = {
      ...activeCal,
      updatedAt: now,
      revision: (activeCal.revision || 0) + 1,
      polls: mergePolls(getCalendarPolls(activeCal), [nextPoll], activeCal.id, participantIds),
      activityLogs: activityLog ? [...getCalendarActivityLogs(activeCal), activityLog] : getCalendarActivityLogs(activeCal)
    };
    const nextCalendars = calendars.map(c => c.id === updatedCal.id ? updatedCal : c);
    return updateCalendars(nextCalendars, '투표 취소 완료', 'delete', updatedCal.id, 'polls', activityLog ? [activityLog] : []);
  };
  const handleSaveAdmin = (updatedCal, newCalCreated) => {
    if (!activeCalLoaded && !newCalCreated) {
      showToast('잠시 후 다시 시도', 'error');
      return false;
    }
    if (newCalCreated) {
      if (!isAllowedCalendarId(newCalCreated.id)) {
        showToast('지원하지 않는 캘린더', 'error');
        return false;
      }
      const nextCalendars = [newCalCreated, ...calendars];
      handleSelectCalendar(newCalCreated.id);
      return updateCalendars(nextCalendars, '캘린더 생성완료', 'success', newCalCreated.id, 'replace');
    } else {
      const now = Date.now();
      const stampedCal = {
        ...updatedCal,
        updatedAt: now,
        revision: (updatedCal.revision || 0) + 1,
        title: sanitizeText(updatedCal.title, 80),
        description: sanitizeText(updatedCal.description, 160),
        participants: updatedCal.participants
      };
      if (!assertCalendarLinks(stampedCal)) {
        showToast('참여자·일정 확인 필요', 'error');
        return false;
      }
      const nextCalendars = calendars.map(c => c.id === stampedCal.id ? stampedCal : c);
      return updateCalendars(nextCalendars, '설정 저장완료', 'success', stampedCal.id, 'settings', [], {
        settingsFields: ['title', 'description', 'accentColor', 'participants', 'expenseCategories', 'placeCategories', 'settlementBaseBudget']
      });
    }
  };
  const handleUpdateWeatherLocation = async (location) => {
    if (!guardLoadedCalendar()) return false;
    const now = Date.now();
    const currentRecents = activeCal.recentLocations || [];
    const updatedRecents = [
      location,
      ...currentRecents.filter(loc => loc.name !== location.name)
    ].slice(0, 8);
    const updatedCal = {
      ...activeCal,
      weatherLocation: location,
      recentLocations: updatedRecents,
      updatedAt: now,
      revision: (activeCal.revision || 0) + 1
    };
    const nextCalendars = calendars.map(c => c.id === updatedCal.id ? updatedCal : c);
    return updateCalendars(nextCalendars, '날씨 지역 설정 완료', 'success', updatedCal.id, 'settings', [], { settingsFields: ['weatherLocation', 'recentLocations'] });
  };
  const handleDeleteRecentWeatherLocation = async (location) => {
    if (!guardLoadedCalendar()) return false;
    const now = Date.now();
    const currentRecents = activeCal.recentLocations || [];
    const updatedRecents = currentRecents.filter(loc => loc.name !== location.name);
    const updatedCal = {
      ...activeCal,
      recentLocations: updatedRecents,
      updatedAt: now,
      revision: (activeCal.revision || 0) + 1
    };
    const nextCalendars = calendars.map(c => c.id === updatedCal.id ? updatedCal : c);
    return updateCalendars(nextCalendars, '자주 찾는 지역이 삭제되었습니다.', 'delete', updatedCal.id, 'settings', [], { settingsFields: ['recentLocations'] });
  };
  const handleAddPinnedNotice = (text, authorName) => {
    if (!guardLoadedCalendar()) return false;
    const cleanText = sanitizeText(text || '', 200);
    if (!cleanText) return false;
    const now = Date.now();
    const notice = { id: `notice_${activeCal.id}_${now}_${Math.random().toString(36).slice(2, 7)}`, text: cleanText, setAt: now, setBy: authorName || '' };
    const updatedCal = {
      ...activeCal,
      pinnedNotices: [...getPinnedNotices(activeCal), notice],
      pinnedNotice: null,
      updatedAt: now,
      revision: (activeCal.revision || 0) + 1
    };
    const nextCalendars = calendars.map(c => c.id === updatedCal.id ? updatedCal : c);
    return updateCalendars(nextCalendars, '공지 등록완료', 'success', updatedCal.id, 'settings', [], { settingsFields: ['pinnedNotices', 'pinnedNotice'] });
  };
  const handleRemovePinnedNotice = (noticeId) => {
    if (!guardLoadedCalendar()) return false;
    const target = getPinnedNotices(activeCal).find(n => n.id === noticeId);
    if (!target) return false;
    const noticeSnapshot = JSON.parse(JSON.stringify(target));
    const noticeText = target.text || '';
    const shortText = noticeText.length > 30 ? noticeText.substring(0, 30) + '...' : noticeText;
    const calId = activeCal.id;
    showConfirmDialog(
      '공지사항 삭제',
      `"${shortText}" 내용의 공지사항을 삭제하시겠습니까?`,
      async () => {
        const now = Date.now();
        const updatedCal = {
          ...activeCal,
          pinnedNotices: getPinnedNotices(activeCal).filter(n => n.id !== noticeId),
          pinnedNotice: null, updatedAt: now, revision: (activeCal.revision || 0) + 1
        };
        const nextCalendars = calendars.map(c => c.id === updatedCal.id ? updatedCal : c);
        const ok = await updateCalendars(nextCalendars, null, null, updatedCal.id, 'settings', [], { settingsFields: ['pinnedNotices', 'pinnedNotice'] });
        if (!ok) return;
        showUndoableDeleteToast('공지가 삭제되었습니다.', async () => {
          try {
            const restoreNow = Date.now();
            const latestCal = calendarsRef.current.find(c => c.id === calId) || updatedCal;
            const notices = getPinnedNotices(latestCal);
            const restoredNotices = notices.some(n => n.id === noticeId)
              ? notices.map(n => n.id === noticeId ? noticeSnapshot : n)
              : [...notices, noticeSnapshot];
            const restoredCal = {
              ...latestCal, pinnedNotices: restoredNotices, pinnedNotice: null,
              updatedAt: restoreNow, revision: (latestCal.revision || 0) + 1
            };
            const next = calendarsRef.current.map(c => c.id === restoredCal.id ? restoredCal : c);
            await updateCalendars(next, '공지 삭제를 되돌렸습니다.', 'success', restoredCal.id, 'settings', [], { settingsFields: ['pinnedNotices', 'pinnedNotice'] });
          } catch (err) {
            console.error('handleRemovePinnedNotice undo failed:', err);
            showToast('공지 복원 실패', 'error', 4000);
          }
        }, null, 5000);
      }
    );
  };
  // App() early-returns a completely different tree per activeView (see the 5 branches below),
  // so the persistent video player can't just live inline in one of them -- it has to be included
  // as a stable sibling in every branch's return, wrapped in the SAME portal element shape each
  // time, or React would unmount/remount (and restart) it on every tab switch. See StickyVideoBox
  // for the actual portal player and handleActivateChatVideo above for how a video becomes active.
  const withStickyVideo = (content) => /*#__PURE__*/React.createElement(React.Fragment, null,
    content,
    /*#__PURE__*/React.createElement(StickyVideoBox, {
      stickyVideo: stickyVideo,
      onClose: () => setStickyVideo(null),
      onGoToChat: () => {
        const messageId = stickyVideo ? stickyVideo.key : null;
        changeView('chat');
        // Highlights the bubble the same way in-chat search does (see focusChatMessage) once it's
        // actually mounted, purely to help the viewer's eye land on the right message in a long
        // chat history -- the video itself keeps playing in its floating PIP throughout.
        if (messageId) setTimeout(() => { focusChatMessage(messageId); }, 350);
      }
    }),
    isModalOpen && /*#__PURE__*/React.createElement(DateModal, {
      anniversaries: anniversariesWithPosters,
      dateStr: selectedDate,
      calendar: activeCal,
      chatMessages: displayChatMessages,
      memos: memos,
      customCultureItems: customCultureItems,
      onSave: handleSaveAvailability,
      onDelete: handleDeleteAvailability,
      onReorderAvailability: handleReorderAvailability,
      onDeleteDate: handleDeleteAllForDate,
      onConfirmMeeting: handleConfirmMeeting,
      onSaveExpense: handleSaveExpense,
      onDeleteExpense: handleDeleteExpense,
      onReorderExpenses: handleReorderExpenses,
      onAddMeetingPhotos: handleAddMeetingPhotos,
      onDeletePhoto: handleDeletePhoto,
      onDeleteMeetingPhoto: handleDeleteMeetingPhoto,
      onFindChatMessageById: findChatMessageById,
      onFetchDateTaggedMessages: handleFetchDateTaggedMessages,
      onFetchDateTaggedMemos: handleFetchDateTaggedMemos,
      onFetchMeetingPhotoIndex: handleFetchMeetingPhotoIndex,
      onFetchMeetingAlbum: handleFetchMeetingAlbum,
      onLoadOlderChat: loadOlderChatMessages,
      hasMoreOlderChat: !Array.isArray(fullChatMessages) && hasMoreOlderChat,
      loadingOlderChat: loadingOlderChat,
      setActiveLightbox: setActiveLightbox,
      initialTab: dateModalInitialTab,
      onSavePlace: handleSavePlace,
      onDeletePlace: handleDeletePlace,
      onReorderPlaces: handleReorderPlaces,
      showToast: showToast,
      onRequestConfirm: showConfirmDialog,
      syncStatus: syncStatus,
      onClose: () => { setIsModalOpen(false); setDateModalInitialTab(null); },
      onParticipantClick: handleParticipantClick,
      onEditAnniversary: (ann) => {
        if (!ann?.id) return;
        withEventUi(() => {
          setAnniversaryEditId(ann.id);
          setIsAnniversariesOpen(true);
        }, '기념일 설정');
      },
      onAddAnniversaryForDate: (dateStr) => {
        if (!dateStr) return;
        setIsModalOpen(false);
        withEventUi(() => {
          setAnniversaryInitialDate(dateStr);
          setIsAnniversariesOpen(true);
        }, '기념일 설정');
      },
      onFocusCultureSource: (ann) => {
        // cultureSourceId가 있으면 포털에서 등록한(또는 등록 당시의) 항목의 원래 id, 없으면
        // 기념일 등록으로 직접 만든 항목이라 이 기념일 자신의 id가 곧 컨텐츠 페이지 카드의 id다
        // (HistoryView의 selfAuthoredCultureItems가 자기 id를 그대로 카드 id로 쓴다).
        const focusId = ann?.cultureSourceId || ann?.id;
        if (!focusId) return;
        // 문화행사/지역축제/스포츠 탭 중 이 기념일의 원래 카테고리에 맞는 탭을 열고, 그 항목의
        // 상세를 자동으로 펼치도록 ContentView에 전달 -- 실제 매칭/표시는 컨텐츠 페이지 쪽에서.
        const tabByCategory = { festival: 'festival', event: 'culture', sports: 'sports', movie: 'movies' };
        try {
          localStorage.setItem('gather_content_tab', tabByCategory[ann.category] || 'festival');
          localStorage.setItem('gather_content_focus_item_id', focusId);
          // id-only 매칭의 안전망: 크롤링 스냅샷의 id 생성 규칙이 과거에 바뀐 적이 있어(예:
          // 날짜 기반 -> 제목 기반), 그 변경 이전에 등록된 오래된 기념일은 cultureSourceId가
          // 오늘자 스냅샷의 어떤 항목과도 더 이상 일치하지 않을 수 있다 -- 그 경우 orphan 카드
          // 폴백(ui-summary-gallery.js orphanedSourceItems)도 같은 옛 id로만 찾아지므로 여전히
          // 열리기는 하지만, 제목까지 함께 넘겨두면 컨텐츠 페이지 쪽에서 id 매칭이 실패했을 때
          // 제목으로 한 번 더 찾아볼 수 있다.
          if (ann.title) localStorage.setItem('gather_content_focus_title', ann.title);
          else localStorage.removeItem('gather_content_focus_title');
        } catch (_) { /* best-effort */ }
        setIsModalOpen(false);
        changeView('content');
      },
      photoCommentCounts: photoCommentCounts
    }),
    confirmDialog && /*#__PURE__*/React.createElement(ConfirmDialog, {
      title: confirmDialog.title,
      message: confirmDialog.message,
      onConfirm: confirmDialog.onConfirm,
      onCancel: () => setConfirmDialog(null),
      showPasswordInput: confirmDialog.showPasswordInput,
      alertOnly: confirmDialog.alertOnly
    }),
    editingMessage && /*#__PURE__*/React.createElement(EditMessageModal, {
      message: editingMessage,
      calendar: activeCal,
      onSave: handleSaveEditMessage,
      onClose: () => setEditingMessage(null),
      onRequestConfirm: showConfirmDialog,
      showToast: showToast
    }),
    isAdminOpen && /*#__PURE__*/React.createElement(AdminModal, {
      initialTab: adminInitialTab,
      calendar: { ...activeCal, activityLogs: unionActivityLogs(activeCal, adminActivityLogs) },
      allCalendars: calendars,
      onSelectCalendar: handleSelectCalendar,
      onLoadActivityLogs: loadAdminActivityLogs,
      onSave: handleSaveAdmin,
      recentMessages: recentMessages,
      chatMessages: displayChatMessages,
      onDeleteMessage: handleDeleteMessage,
      onDeleteAvailability: handleDeleteAvailability,
      onDeleteAllForDate: handleDeleteAllForDate,
      onRequestConfirm: showConfirmDialog,
      onClose: () => { setIsAdminOpen(false); setAdminInitialTab('settings'); },
      showToast: showToast,
      onDeleteLog: handleDeleteActivityLog,
      chatParticipantId: chatParticipantId,
      themeChoice: themeChoice,
      toggleTheme: toggleTheme,
      isDarkTheme: isDarkTheme,
      fontScalePercent: fontScalePercent,
      setFontScalePercent: setFontScalePercent,
      onSelectDate: d => {
        setSelectedDate(d);
        setIsModalOpen(true);
      },
      onOpenChatMessage: messageId => {
        changeView('chat');
        setTimeout(() => { focusChatMessage(messageId); }, 350);
      },
      onOpenImage: (messageId, imageIndex, directMediaUrl = '') => {
        changeView('chat');
        setTimeout(() => {
          const msg = chatMessages.find(m => m.id === messageId);
          if (!msg) return;
          const directEntry = getMessageDirectMediaEntry(msg);
          const entries = directMediaUrl && directEntry ? [directEntry] : getMessageImageEntries(msg);
          setActiveLightbox({
            urls: entries.map(e => e.full),
            meta: entries.map(e => ({ timestamp: msg.timestamp, messageId: msg.id, imageIndex: e.imageIndex, thumb: e.thumb, tags: e.tags, directMediaUrl: e.directMediaUrl, source: e.source, uploadSource: e.uploadSource, assetKey: e.assetKey, mediaKey: e.mediaKey, refKey: e.refKey })),
            index: directMediaUrl ? 0 : imageIndex
          });
        }, 350);
      }
    }),
    isGlobalSearchOpen && /*#__PURE__*/React.createElement(GlobalSearchModal, {
      calendar: activeCal,
      chatMessages: displayChatMessages,
      memos: memos,
      initialQuery: globalSearchInitialQuery,
      onClose: () => setIsGlobalSearchOpen(false),
      onOpenMemo: () => changeView('memo'),
      onSelectDate: d => {
        setSelectedDate(d);
        setIsModalOpen(true);
      },
      onOpenChatMessage: messageId => {
        changeView('chat');
        setTimeout(() => { focusChatMessage(messageId); }, 350);
      },
      onOpenImage: (messageId, imageIndex, directMediaUrl = '') => {
        changeView('chat');
        setTimeout(() => {
          const msg = chatMessages.find(m => m.id === messageId);
          if (!msg) return;
          const directEntry = getMessageDirectMediaEntry(msg);
          const entries = directMediaUrl && directEntry ? [directEntry] : getMessageImageEntries(msg);
          setActiveLightbox({
            urls: entries.map(e => e.full),
            meta: entries.map(e => ({ timestamp: msg.timestamp, messageId: msg.id, imageIndex: e.imageIndex, thumb: e.thumb, tags: e.tags, directMediaUrl: e.directMediaUrl, source: e.source, uploadSource: e.uploadSource, assetKey: e.assetKey, mediaKey: e.mediaKey, refKey: e.refKey })),
            index: directMediaUrl ? 0 : imageIndex
          });
        }, 350);
      },
      onNotificationPermissionBlocked: openNotificationHelp
    }),
    isShareOpen && /*#__PURE__*/React.createElement(ShareModal, {
      calendar: activeCal,
      showToast: showToast,
      onClose: () => setIsShareOpen(false)
    }),
    isChatShareOpen && /*#__PURE__*/React.createElement(ShareModal, {
      calendar: activeCal,
      shareType: "chat",
      showToast: showToast,
      onClose: () => setIsChatShareOpen(false)
    }),
    isPollModalOpen && /*#__PURE__*/React.createElement(PollModal, {
      calendar: activeCal,
      poll: editingPoll,
      onRequestConfirm: showConfirmDialog,
      onSave: handleSavePoll,
      onClose: () => {
        setIsPollModalOpen(false);
        setEditingPoll(null);
      },
      showToast: showToast
    }),
    voteTarget && /*#__PURE__*/React.createElement(PollVoterSheet, {
      calendar: activeCal,
      pollId: voteTarget.pollId,
      optionId: voteTarget.optionId,
      onSelect: participantId => handleVotePoll(voteTarget.pollId, voteTarget.optionId, participantId),
      onClose: () => setVoteTarget(null)
    }),
    isChatSheetOpen && /*#__PURE__*/React.createElement(ChatParticipantSheet, {
      calendar: activeCal,
      selectedId: chatParticipantId,
      onSelect: id => {
        setChatParticipantId(id);
        setStoredChatParticipantId(activeCalId, id);
      },
      onClose: () => setIsChatSheetOpen(false)
    }),
    toast && /*#__PURE__*/React.createElement("div", {
      className: `toast ${(toast.type === 'delete' || toast.type === 'error') ? 'is-delete' : 'is-success'} ${toast.isExiting ? 'is-exiting' : ''}`
    }, /*#__PURE__*/React.createElement("span", {
      className: "toast-message"
    }, toast.message), toast.onAction && /*#__PURE__*/React.createElement("button", {
      type: "button",
      onClick: () => {
        const action = toast.onAction;
        dismissToast();
        Promise.resolve(action()).catch(console.warn);
      },
      className: "toast-action"
    }, toast.actionLabel || "되돌리기")),

    isAppSettingsOpen && /*#__PURE__*/React.createElement(AppSettingsModal, {
      onClose: () => setIsAppSettingsOpen(false),
      isDarkTheme: isDarkTheme,
      onToggleTheme: toggleTheme,
      fontScalePercent: fontScalePercent,
      onDecreaseFont: () => setFontScalePercent(prev => Math.max(80, prev - 10)),
      onIncreaseFont: () => setFontScalePercent(prev => Math.min(130, prev + 10)),
      isNotifPermissionGranted: mainNotifPermission === 'granted',
      isMasterNotifyEnabled: mainNotifPermission === 'granted' && mainChatNotifyEnabled,
      onToggleMasterNotify: async () => {
        await handleMainToggleNotifications();
        if (typeof setNotifGuideSeen === 'function') setNotifGuideSeen(true);
        setMainNotifPermission(isNotificationSupported() ? Notification.permission : 'unsupported');
        setMainChatNotifyEnabled(isChatNotifyEnabledForCalendar(activeCalId));
      },
      notifyChannels: notifyChannels,
      onToggleNotifyChannel: async (key) => {
        if (typeof setNotifyChannel !== 'function') return;
        const next = setNotifyChannel(key, !(notifyChannels && notifyChannels[key]));
        setNotifyChannelsState(next);
        if (key === 'chat' && typeof setChatNotifyEnabledForCalendar === 'function') {
          setChatNotifyEnabledForCalendar(activeCalId, !!(next && next.chat));
          setMainChatNotifyEnabled(!!(next && next.chat));
        }
        // Persist both ON and OFF changes to this browser's subscription document.
        // The server filters by that document, not by this tab's localStorage copy.
        try {
          await syncPushSubscriptionChannels(activeCalId, getCurrentChatParticipantId());
        } catch (_) {}
      },
      calendarId: activeCalId,
      weatherLocation: activeCal && activeCal.weatherLocation,
      recentLocations: (activeCal && activeCal.recentLocations) || [],
      onUpdateWeatherLocation: handleUpdateWeatherLocation,
      onDeleteRecentLocation: handleDeleteRecentWeatherLocation,
      showToast: showToast,
      helpSteps: typeof getNotificationPermissionHelpSteps === 'function' ? getNotificationPermissionHelpSteps() : [],
      calendar: activeCalLoaded ? activeCal : null,
      onRequestConfirm: showConfirmDialog,
      onRequestDataRefresh: () => setCloudReloadToken(token => token + 1)
    }),
    isNotifOnboardingOpen && /*#__PURE__*/React.createElement(NotificationOnboardingModal, {
      onClose: () => {
        if (typeof setNotifGuideSeen === 'function') setNotifGuideSeen(true);
        setIsNotifOnboardingOpen(false);
      },
      isMasterNotifyEnabled: mainNotifPermission === 'granted' && mainChatNotifyEnabled,
      onToggleMasterNotify: async () => {
        await handleMainToggleNotifications();
        if (typeof setNotifGuideSeen === 'function') setNotifGuideSeen(true);
        setMainNotifPermission(isNotificationSupported() ? Notification.permission : 'unsupported');
        setMainChatNotifyEnabled(isChatNotifyEnabledForCalendar(activeCalId));
        if (isNotificationSupported() && Notification.permission === 'granted') {
          setIsNotifOnboardingOpen(false);
        }
      },
      helpSteps: typeof getNotificationPermissionHelpSteps === 'function' ? getNotificationPermissionHelpSteps() : [],
      browserLabel: typeof getBrowserLabelForNotifications === 'function' ? getBrowserLabelForNotifications() : '브라우저'
    }),

    isNotificationHelpOpen && /*#__PURE__*/React.createElement(NotificationPermissionHelpModal, {
      onClose: () => setIsNotificationHelpOpen(false),
      onRetry: handleMainToggleNotifications,
      showToast: showToast
    }),
    operationProgress && !chatUploadProgress && /*#__PURE__*/React.createElement(OperationProgressOverlay, operationProgress),
    chatUploadProgress && /*#__PURE__*/React.createElement(ImageUploadOverlay, chatUploadProgress),
    // Shared Lightbox host for every activeView (calendar/chat/gallery/settlement/memo/places/history).
    // DateModal and other callers only setActiveLightbox; without a single mount here, settlement
    // (and similar early-return views) updated state with nothing to render.
    activeLightbox ? /*#__PURE__*/React.createElement(Lightbox, {
      urls: activeLightbox.urls,
      index: activeLightbox.index,
      meta: activeLightbox.meta,
      calendar: activeCalLoaded ? activeCal : null,
      onClose: () => setActiveLightbox(null),
      onNavigate: i => setActiveLightbox(prev => prev ? { ...prev, index: i } : prev),
      showToast: showToast,
      onPromoteImageUrl: handlePromoteInlineChatImage,
      onSaveImageTags: handleSaveImageTags,
      onSearchTag: handleSearchTag,
      onDeletePhoto: handleDeletePhoto,
      onReplacePhoto: handleReplacePhoto,
      onJumpToChatMessage: handleJumpToChatMessage,
      onJumpToMemo: handleJumpToMemo,
      onJumpToMeetingDate: handleJumpToMeetingDate,
      onJumpToGallery: handleJumpToGallery,
      onGetChatMessageOrdinal: handleGetChatMessageOrdinal,
      onGetGalleryPhotoOrdinal: handleGetGalleryPhotoOrdinal,
      onRequestConfirm: showConfirmDialog,
      onFetchPhotoComments: handleFetchPhotoComments,
      onSavePhotoComments: handleSavePhotoComments,
      preloadedPhotoComments: preloadedPhotoComments,
      preloadedPhotoCommentsReady: preloadedPhotoCommentsReady
    }) : null
  );
  const localGalleryCount = (() => {
    const directUrls = new Set();
    const persistentBroken = (window.GATHER_APP_UTILS && window.GATHER_APP_UTILS.getPersistentBrokenPhotoUrls)
      ? window.GATHER_APP_UTILS.getPersistentBrokenPhotoUrls()
      : new Set();
    const isBroken = val => {
      const u = String(val || '').trim().split(/[?#]/)[0];
      return !u || persistentBroken.has(u);
    };

    getConfirmedMeetings(activeCal).forEach(meeting => {
      const photos = Array.isArray(meeting?.photos) ? meeting.photos : [];
      photos.forEach(photo => {
        const u = photo?.imageUrl || photo?.full || photo?.thumbUrl || photo?.thumb;
        if (u && !isBroken(u) && !directUrls.has(u)) {
          directUrls.add(u);
        }
      });
    });
    const allMsgs = (allChatMessages && allChatMessages.length > 0) ? allChatMessages : (chatMessages || []);
    allMsgs.forEach(msg => {
      if (!msg || isTombstone(msg)) return;
      const getEntries = typeof getMessageImageEntries === 'function' ? getMessageImageEntries : null;
      const getDirect = typeof getAllDirectMediaImageEntries === 'function' ? getAllDirectMediaImageEntries : (typeof getMessageDirectMediaEntry === 'function' ? m => [getMessageDirectMediaEntry(m)].filter(Boolean) : () => []);
      const entries = getEntries ? [...getEntries(msg), ...getDirect(msg)] : [];
      if (entries.length > 0) {
        entries.forEach(e => {
          const u = e.full || e.thumb || e.imageUrl;
          if (u && !isBroken(u) && !directUrls.has(u)) {
            directUrls.add(u);
          }
        });
      } else {
        const u = msg.imageUrl || msg.thumbUrl;
        if (u && !isBroken(u) && !directUrls.has(u)) {
          directUrls.add(u);
        }
      }
    });
    (memos || []).forEach(memo => {
      if (!memo || isTombstone(memo)) return;
      const asMsg = {
        id: memo.id, text: memo.text || memo.content || memo.body || '',
        imageUrl: memo.imageUrl, imageUrls: memo.imageUrls, thumbUrl: memo.thumbUrl, thumbUrls: memo.thumbUrls,
        timestamp: memo.updatedAt || memo.createdAt || 0, participantId: memo.participantId || ''
      };
      const getEntries = typeof getMessageImageEntries === 'function' ? getMessageImageEntries : null;
      const getDirect = typeof getAllDirectMediaImageEntries === 'function' ? getAllDirectMediaImageEntries : () => [];
      const entries = getEntries ? [...getEntries(asMsg), ...getDirect(asMsg)] : [];
      entries.forEach(e => {
        const u = e.full || e.thumb || e.imageUrl;
        if (u && !isBroken(u) && !directUrls.has(u)) {
          directUrls.add(u);
        }
      });
    });
    return directUrls.size;
  })();

  const navChatCount = (typeof visibleTotalChatCount === 'number' && visibleTotalChatCount >= 0)
    ? visibleTotalChatCount
    : visibleChatMessages.length;
  const navGalleryCount = (localGalleryCount > 0)
    ? localGalleryCount
    : ((typeof totalGalleryCount === 'number' && totalGalleryCount > 0) ? totalGalleryCount : 0);
  const navMemoCount = (typeof totalMemoCount === 'number' && totalMemoCount >= 0) ? totalMemoCount : (memos || []).length;
  const navPlaceCount = (activeCal && Array.isArray(activeCal.places)) ? activeCal.places.filter(p => p && !p.deletedAt).length : 0;
  const navHistoryCount = activeCal ? getTrulyConfirmedMeetings(activeCal).filter(m => isValidDateString(m?.date)).length : 0;
  const navSettlementBadge = canUseSettlement && meetingsHydrated && activeCal && typeof calculateSettlementBalance === 'function' && typeof formatBalanceBadge === 'function'
    ? formatBalanceBadge(calculateSettlementBalance(activeCal))
    : null;

  // Side-menu trailing meta (latest activity snippets)
  const formatMenuDate = (ts) => {
    if (ts == null || ts === '') return null;
    let d = null;
    if (typeof ts === 'number') d = new Date(ts);
    else if (typeof ts === 'string') {
      // "2026-08-24" or ISO
      const m = ts.match(/^(\d{4})-(\d{2})-(\d{2})/);
      if (m) return `${m[2]}.${m[3]}`;
      const md = ts.match(/^(?:\d{2}|\d{4})\.(\d{2})\.(\d{2})/);
      if (md) return `${md[1]}.${md[2]}`;
      const parsed = Date.parse(ts);
      if (!Number.isNaN(parsed)) d = new Date(parsed);
    } else if (ts && typeof ts.toDate === 'function') {
      try { d = ts.toDate(); } catch (_) {}
    } else if (ts && typeof ts.seconds === 'number') {
      d = new Date(ts.seconds * 1000);
    }
    if (!d || Number.isNaN(d.getTime())) return null;
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${mm}.${dd}`;
  };

  const navChatLastAuthor = (() => {
    const msgs = visibleChatMessages;
    if (!msgs.length) return null;
    const last = msgs[msgs.length - 1];
    if (!last) return null;
    const parts = (activeCal && Array.isArray(activeCal.participants)) ? activeCal.participants : [];
    const p = parts.find(x => x && x.id === last.participantId);
    const name = (p && p.name) || last.participantName || null;
    if (!name) return null;
    return { name: String(name), color: (p && p.color) || '#64748B' };
  })();

  const navSettlementLastDate = (() => {
    let bestTs = 0;
    let bestLabel = null;
    let latestMeetingTs = 0;
    let latestMeetingLabel = null;
    const noteMeetingDate = (raw) => {
      const label = formatMenuDate(raw);
      if (!label) return;
      let ts = 0;
      if (typeof raw === 'number') ts = raw;
      else if (raw && typeof raw.seconds === 'number') ts = raw.seconds * 1000;
      else if (raw && typeof raw.toDate === 'function') {
        try { ts = raw.toDate().getTime(); } catch (_) {}
      } else if (typeof raw === 'string') {
        const p = Date.parse(raw);
        if (!Number.isNaN(p)) ts = p;
      }
      if (!ts) {
        const p = Date.parse(String(raw).slice(0, 10));
        if (!Number.isNaN(p)) ts = p;
      }
      if (ts > latestMeetingTs) {
        latestMeetingTs = ts;
        latestMeetingLabel = label;
      }
    };
    const consider = (raw, fallbackDateStr) => {
      let ts = 0;
      if (typeof raw === 'number') ts = raw;
      else if (raw && typeof raw.seconds === 'number') ts = raw.seconds * 1000;
      else if (raw && typeof raw.toDate === 'function') {
        try { ts = raw.toDate().getTime(); } catch (_) {}
      } else if (typeof raw === 'string') {
        const p = Date.parse(raw);
        if (!Number.isNaN(p)) ts = p;
      }
      if (!ts && fallbackDateStr) {
        const p = Date.parse(String(fallbackDateStr).slice(0, 10));
        if (!Number.isNaN(p)) ts = p;
      }
      if (ts > bestTs) {
        bestTs = ts;
        bestLabel = formatMenuDate(ts) || formatMenuDate(fallbackDateStr);
      }
    };
    const meetings = [
      ...(activeCal && Array.isArray(activeCal.confirmedMeeting) ? activeCal.confirmedMeeting : []),
      ...(Array.isArray(confirmedMeetingsSubcollection) ? confirmedMeetingsSubcollection : [])
    ];
    meetings.forEach(m => {
      if (!m || m.deletedAt) return;
      noteMeetingDate(m.date || m.confirmedAt);
      const expenses = Array.isArray(m.expenses) ? m.expenses : [];
      const incomes = Array.isArray(m.incomes) ? m.incomes : [];
      if (expenses.length > 0 || incomes.length > 0) {
        consider(m.date || m.confirmedAt);
      }
      expenses.forEach(e => {
        if (!e || e.deletedAt) return;
        consider(e.createdAt || e.timestamp || e.updatedAt, m.date || e.date);
      });
      incomes.forEach(e => {
        if (!e || e.deletedAt) return;
        consider(e.createdAt || e.timestamp || e.updatedAt, m.date || e.date);
      });
    });
    const topExp = (activeCal && Array.isArray(activeCal.expenses)) ? activeCal.expenses : [];
    topExp.forEach(e => {
      if (!e || e.deletedAt) return;
      consider(e.createdAt || e.timestamp || e.updatedAt, e.date);
    });
    return bestLabel || latestMeetingLabel;
  })();

  const navGalleryLastDate = (() => {
    const msgs = (typeof allChatMessages !== 'undefined' && allChatMessages && allChatMessages.length)
      ? allChatMessages
      : (chatMessages || []);
    for (let i = msgs.length - 1; i >= 0; i--) {
      const msg = msgs[i];
      if (!msg) continue;
      const hasImg = !!(msg.imageUrl || msg.thumbUrl
        || (Array.isArray(msg.imageUrls) && msg.imageUrls.length)
        || (Array.isArray(msg.thumbUrls) && msg.thumbUrls.length));
      if (!hasImg) continue;
      return formatMenuDate(msg.timestamp || msg.createdAt);
    }
    return null;
  })();

  const navPlaceLastName = (() => {
    const list = [];
    if (activeCal && Array.isArray(activeCal.places)) {
      activeCal.places.forEach(p => { if (p && !p.deletedAt) list.push(p); });
    }
    if (Array.isArray(placesSubcollection)) {
      placesSubcollection.forEach(p => { if (p && !p.deletedAt) list.push(p); });
    }
    if (!list.length) return null;
    const score = (p) => {
      const raw = p.updatedAt || p.createdAt || p.timestamp || 0;
      if (typeof raw === 'number') return raw;
      if (raw && typeof raw.seconds === 'number') return raw.seconds * 1000;
      if (raw && typeof raw.toDate === 'function') {
        try { return raw.toDate().getTime(); } catch (_) { return 0; }
      }
      if (typeof raw === 'string') {
        const n = Date.parse(raw);
        return Number.isNaN(n) ? 0 : n;
      }
      return 0;
    };
    list.sort((a, b) => score(b) - score(a));
    const top = list[0];
    const name = (top.alias || top.name || top.placeName || top.title || '').trim();
    return name || null;
  })();

  const navMemoLastTitleWord = (() => {
    const list = Array.isArray(memos) ? memos.filter(m => m && !m.deletedAt) : [];
    if (!list.length) return null;
    const score = (m) => {
      const raw = m.createdAt || m.timestamp || m.updatedAt || 0;
      if (typeof raw === 'number') return raw;
      if (raw && typeof raw.seconds === 'number') return raw.seconds * 1000;
      if (raw && typeof raw.toDate === 'function') {
        try { return raw.toDate().getTime(); } catch (_) { return 0; }
      }
      if (typeof raw === 'string') {
        const n = Date.parse(raw);
        return Number.isNaN(n) ? 0 : n;
      }
      return 0;
    };
    list.sort((a, b) => score(b) - score(a));
    const top = list[0];
    const title = String(top.title || top.text || top.content || '').trim();
    if (!title) return null;
    const word = title.split(/\s+/)[0];
    return word ? word.slice(0, 12) : null;
  })();

  const navMenuProps = {
    onChangeView: changeView,
    onOpenCreateSettlement: () => {
      withEventUi(() => {
        setEditingSettlementCard(null);
        setIsCreateSettlementOpen(true);
      }, '정산');
    },
    showSettlement: canUseSettlement,
    chatCount: navChatCount,
    settlementBadge: navSettlementBadge,
    galleryCount: navGalleryCount,
    placeCount: navPlaceCount,
    memoCount: navMemoCount,
    historyCount: navHistoryCount,
    chatLastAuthor: navChatLastAuthor,
    settlementLastDate: navSettlementLastDate,
    galleryLastDate: navGalleryLastDate,
    placeLastName: navPlaceLastName,
    memoLastTitleWord: navMemoLastTitleWord
  };
  const sharedAppOverlays = /*#__PURE__*/React.createElement(React.Fragment, null,
    isCreateSettlementOpen && !editingSettlementCard && activeCal && canUseSettlement && /*#__PURE__*/React.createElement(CreateSettlementModal, {
      calendar: activeCal,
      showToast: showToast,
      onClose: () => setIsCreateSettlementOpen(false),
      onSave: handleSaveSettlementCard,
      onRequestConfirm: showConfirmDialog
    }),
    editingSettlementCard && activeCal && /*#__PURE__*/React.createElement(CreateSettlementModal, {
      calendar: activeCal,
      initialData: editingSettlementCard,
      showToast: showToast,
      onClose: () => setEditingSettlementCard(null),
      onDeleteCard: handleDeleteSettlementCard,
      onToggleStatus: handleToggleSettlementCardStatus,
      onSave: handleSaveSettlementCard,
      onRequestConfirm: showConfirmDialog
    }),
    isAppSettingsOpen && /*#__PURE__*/React.createElement(AppSettingsModal, {
      onClose: () => setIsAppSettingsOpen(false),
      isDarkTheme: isDarkTheme,
      onToggleTheme: toggleTheme,
      fontScalePercent: fontScalePercent,
      onDecreaseFont: () => setFontScalePercent(prev => Math.max(80, prev - 10)),
      onIncreaseFont: () => setFontScalePercent(prev => Math.min(130, prev + 10)),
      isNotifPermissionGranted: mainNotifPermission === 'granted',
      isMasterNotifyEnabled: mainNotifPermission === 'granted' && mainChatNotifyEnabled,
      onToggleMasterNotify: async () => {
        await handleMainToggleNotifications();
        if (typeof setNotifGuideSeen === 'function') setNotifGuideSeen(true);
        setMainNotifPermission(isNotificationSupported() ? Notification.permission : 'unsupported');
        setMainChatNotifyEnabled(isChatNotifyEnabledForCalendar(activeCalId));
      },
      notifyChannels: notifyChannels,
      onToggleNotifyChannel: async (key) => {
        if (typeof setNotifyChannel !== 'function') return;
        const next = setNotifyChannel(key, !(notifyChannels && notifyChannels[key]));
        setNotifyChannelsState(next);
        if (key === 'chat' && typeof setChatNotifyEnabledForCalendar === 'function') {
          setChatNotifyEnabledForCalendar(activeCalId, !!(next && next.chat));
          setMainChatNotifyEnabled(!!(next && next.chat));
        }
        try {
          await syncPushSubscriptionChannels(activeCalId, getCurrentChatParticipantId());
        } catch (_) {}
      },
      calendarId: activeCalId,
      weatherLocation: activeCal && activeCal.weatherLocation,
      recentLocations: (activeCal && activeCal.recentLocations) || [],
      onUpdateWeatherLocation: handleUpdateWeatherLocation,
      onDeleteRecentLocation: handleDeleteRecentWeatherLocation,
      showToast: showToast,
      helpSteps: typeof getNotificationPermissionHelpSteps === 'function' ? getNotificationPermissionHelpSteps() : [],
      calendar: activeCalLoaded ? activeCal : null,
      onRequestConfirm: showConfirmDialog,
      onRequestDataRefresh: () => setCloudReloadToken(token => token + 1)
    }),
    isNotifOnboardingOpen && /*#__PURE__*/React.createElement(NotificationOnboardingModal, {
      onClose: () => {
        if (typeof setNotifGuideSeen === 'function') setNotifGuideSeen(true);
        setIsNotifOnboardingOpen(false);
      },
      isMasterNotifyEnabled: mainNotifPermission === 'granted' && mainChatNotifyEnabled,
      onToggleMasterNotify: async () => {
        await handleMainToggleNotifications();
        if (typeof setNotifGuideSeen === 'function') setNotifGuideSeen(true);
        setMainNotifPermission(isNotificationSupported() ? Notification.permission : 'unsupported');
        setMainChatNotifyEnabled(isChatNotifyEnabledForCalendar(activeCalId));
        if (isNotificationSupported() && Notification.permission === 'granted') {
          setIsNotifOnboardingOpen(false);
        }
      },
      helpSteps: typeof getNotificationPermissionHelpSteps === 'function' ? getNotificationPermissionHelpSteps() : [],
      browserLabel: typeof getBrowserLabelForNotifications === 'function' ? getBrowserLabelForNotifications() : '브라우저'
    }),
    isNotificationHelpOpen && /*#__PURE__*/React.createElement(NotificationPermissionHelpModal, {
      onClose: () => setIsNotificationHelpOpen(false),
      onRetry: handleMainToggleNotifications,
      showToast: showToast
    })
  );
  if (activeView === 'chat') {
    return withStickyVideo(/*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", { className: "chat-view-container" }, /*#__PURE__*/React.createElement(ChatRoomView, {
      calendar: activeCal,
      memePool: memePool,
      onSendMemeImage: handleSendMemeImage,
      chatMessages: displayChatMessages,
      loadingOlderChat: loadingOlderChat,
      hasMoreOlderChat: hasMoreOlderChat,
      onLoadOlderChat: loadOlderChatMessages,
      chatInput: chatInput,
      setChatInput: setChatInput,
      chatParticipantId: chatParticipantId,
      setChatParticipantId: setChatParticipantId,
      isChatSheetOpen: isChatSheetOpen,
      setIsChatSheetOpen: setIsChatSheetOpen,
      isChatSubmitting: isChatSubmitting,
      chatTextareaRef: chatTextareaRef,
      chatImage: chatImages,
      setChatImage: setChatImages,
      chatFileAttachments: chatFileAttachments,
      setChatFileAttachments: setChatFileAttachments,
      chatReplyTarget: chatReplyTarget,
      setChatReplyTarget: setChatReplyTarget,
      activeLightbox: null, // render via withStickyVideo shared Lightbox host
      setActiveLightbox: setActiveLightbox,
      onSend: handleSendChatMessage,
      onDeleteMessage: handleDeleteMessage,
      onEditMessage: handleEditMessage,
      onAddPinnedNotice: handleAddPinnedNotice,
      onRemovePinnedNotice: handleRemovePinnedNotice,
      onBack: () => changeView('calendar'),
      isHeaderVisible: isHeaderVisible,
      handleChatScroll: handleChatScroll,
      onRevealChatInput: () => setIsHeaderVisible(true),
      onToggleChatInputPin: toggleChatInputPin,
      chatMessagesContainerRef: chatMessagesContainerRef,
      showToast: showToast,
      onPromoteImageUrl: handlePromoteInlineChatImage,
      onSaveImageTags: handleSaveImageTags,
      onSearchTag: handleSearchTag,
      onShare: () => setIsChatShareOpen(true),
      isDarkTheme: isDarkTheme,
      onToggleTheme: toggleTheme,
      onOpenGallery: () => changeView('gallery'),
      onChangeView: changeView,
      fontScalePercent: fontScalePercent,
      onDecreaseFont: () => setFontScalePercent(prev => Math.max(80, prev - 10)),
      onIncreaseFont: () => setFontScalePercent(prev => Math.min(130, prev + 10)),
      isChatNotifyEnabled: mainNotifPermission === 'granted' && mainChatNotifyEnabled,
      onToggleChatNotifications: handleMainToggleNotifications,
      onOpenAppSettings: () => setIsAppSettingsOpen(true),
      ...navMenuProps,
      stickyVideoKey: stickyVideo ? stickyVideo.key : null,
      onActivateVideo: handleActivateChatVideo,
      onDeletePhoto: handleDeletePhoto,
      onReplacePhoto: handleReplacePhoto,
      onJumpToChatMessage: handleJumpToChatMessage,
      onJumpToMemo: handleJumpToMemo,
      onJumpToMeetingDate: handleJumpToMeetingDate,
      onGetChatMessageOrdinal: handleGetChatMessageOrdinal,
      onGetGalleryPhotoOrdinal: handleGetGalleryPhotoOrdinal,
      onRequestConfirm: showConfirmDialog,
      syncStatus: syncStatus,
      externalFocusMessageId: externalFocusMsgId
    })), sharedAppOverlays));
  }

  if (activeView === 'settlement') {
    return withStickyVideo(/*#__PURE__*/React.createElement(React.Fragment, null,
      /*#__PURE__*/React.createElement(SettlementSummaryModal, {
        calendar: activeCal,
        onBack: () => changeView('calendar'),
        onSelectDate: d => {
          setSelectedDate(d);
          setIsModalOpen(true);
        },
        onOpenShare: () => {
          if (guardLoadedCalendar('Firebase 데이터를 불러온 뒤 공유 정보를 확인해 주세요.')) setIsShareOpen(true);
        },
        onOpenAppSettings: () => setIsAppSettingsOpen(true),
        onToggleSettlementCardStatus: handleToggleSettlementCardStatus,
        onDeleteSettlementCard: handleDeleteSettlementCard,
        onSaveSettlementCard: handleSaveSettlementCard,
        onOpenSettlementEditor: card => {
          setIsCreateSettlementOpen(false);
          setEditingSettlementCard(card ? { ...card } : null);
        },
        showToast: showToast,
        onRequestConfirm: showConfirmDialog,
        ...navMenuProps,
        onOpenCreateSettlement: undefined
      }),
      isShareOpen && activeCal && /*#__PURE__*/React.createElement(ShareModal, {
        calendar: activeCal,
        shareType: "settlement",
        showToast: showToast,
        onClose: () => setIsShareOpen(false)
      }),
      sharedAppOverlays
    ));
  }

  if (activeView === 'memo') {
    return withStickyVideo(/*#__PURE__*/React.createElement(React.Fragment, null,
      /*#__PURE__*/React.createElement(MemoView, {
        calendar: activeCal,
        memos: memos,
        hasMoreMemos: hasMoreMemos,
        totalMemoCount: totalMemoCount,
        onLoadMoreMemos: () => setMemosLimit(prev => prev + MEMOS_PAGE_SIZE),
        onBack: () => changeView('calendar'),
        showToast: showToast,
        isDarkTheme: isDarkTheme,
        onRequestConfirm: showConfirmDialog,
        sharedMemo: sharedMemo,
        chatMessages: chatMessages,
        setActiveLightbox: setActiveLightbox,
        onDismissSharedMemo: () => {
          setSharedMemo(null);
          const url = new URL(window.location.href);
          url.searchParams.delete('memo');
          window.history.replaceState({}, '', url);
        },
        onOpenShare: () => {
          if (guardLoadedCalendar('Firebase 데이터를 불러온 뒤 공유 정보를 확인해 주세요.')) setIsMemoShareOpen(true);
        },
        onOpenAppSettings: () => setIsAppSettingsOpen(true),
        onUpdateMemo: patchLocalMemo,
        onUpsertMemo: upsertLocalMemo,
        onDeleteMemo: removeLocalMemo,
        memoInitialTag: memoInitialTag,
        setMemoInitialTag: setMemoInitialTag,
        ...navMenuProps
      }),
      isMemoShareOpen && activeCal && /*#__PURE__*/React.createElement(ShareModal, {
        calendar: activeCal,
        shareType: "memo",
        showToast: showToast,
        onClose: () => setIsMemoShareOpen(false)
      }),
      sharedAppOverlays
    ));
  }

  if (activeView === 'gallery') {
    // Lightbox mounts once in withStickyVideo (shared across views).
    return withStickyVideo(/*#__PURE__*/React.createElement(React.Fragment, null,
      /*#__PURE__*/React.createElement(ChatGalleryModal, {
        calendar: activeCal,
        chatMessages: galleryChatMessages,
        memos: galleryMemos,
        asPage: true,
        onClose: () => changeView('calendar'),
        onUploadImages: handleUploadGalleryImages,
        onAddLink: handleAddGalleryLink,
        onAddFiles: handleAddGalleryFiles,
        onDeleteFiles: handleDeleteGalleryFiles,
        onDeleteGalleryLinks: handleDeleteGalleryLinks,
        onRequestConfirm: showConfirmDialog,
        onPasteGatherPhoto: handlePasteGatherPhoto,
        onPasteGatherPhotos: handlePasteGatherPhotos,
        onOpenShare: () => {
          if (guardLoadedCalendar('Firebase 데이터를 불러온 뒤 공유 정보를 확인해 주세요.')) setIsGalleryShareOpen(true);
        },
        setActiveLightbox: setActiveLightbox,
        onDeletePhoto: handleDeletePhoto,
        photoCommentCounts: photoCommentCounts,
        // Before the canonical index resolves, pass an explicit empty indexed set instead of
        // the partially hydrated chat/memo archive. Presenting that fallback as a final gallery
        // is what produced calendar-specific "4 photos" screens on transient index failures.
        indexedPhotos: galleryPhotoIndex.status === 'ready'
          ? galleryPhotoIndex.items
          : (galleryPhotoIndex.status === 'fallback' ? null : []),
        indexedPhotoStatus: galleryPhotoIndex.status,
        indexedPhotoTotal: galleryPhotoIndex.status === 'ready' ? galleryPhotoIndex.total : null,
        indexedPhotoPage: galleryPhotoIndex.page,
        indexedPhotoLoading: galleryPhotoIndex.loading,
        indexedPhotoComplete: galleryPhotoIndex.complete,
        onIndexedPhotoPageChange: galleryPhotoIndex.loadPage,
        onIndexedPhotoLoadAll: galleryPhotoIndex.loadAll,
        hasMoreOlderChat: !Array.isArray(fullChatMessages) && hasMoreOlderChat,
        loadingOlderChat: loadingOlderChat,
        onLoadOlderChat: loadOlderChatMessages,
        hasMoreMemos: hasMoreMemos,
        onLoadMoreMemos: () => setMemosLimit(prev => prev + MEMOS_PAGE_SIZE),
        isDarkTheme: isDarkTheme,
        onToggleTheme: toggleTheme,
        fontScalePercent: fontScalePercent,
        onDecreaseFont: () => setFontScalePercent(prev => Math.max(80, prev - 10)),
        onIncreaseFont: () => setFontScalePercent(prev => Math.min(130, prev + 10)),
        isChatNotifyEnabled: mainNotifPermission === 'granted' && mainChatNotifyEnabled,
        onToggleChatNotifications: handleMainToggleNotifications,
        onOpenAppSettings: () => setIsAppSettingsOpen(true),
        showToast: showToast,
        syncStatus: syncStatus,
        ...navMenuProps
      }),
      isGalleryShareOpen && activeCal && /*#__PURE__*/React.createElement(ShareModal, {
        calendar: activeCal,
        shareType: "gallery",
        showToast: showToast,
        onClose: () => setIsGalleryShareOpen(false)
      }),
      sharedAppOverlays
    ));
  }

  if (activeView === 'places') {
    return withStickyVideo(/*#__PURE__*/React.createElement(React.Fragment, null,
      /*#__PURE__*/React.createElement(PlacesView, {
        calendar: activeCal,
        onBack: () => changeView('calendar'),
        onSavePlace: handleSavePlace,
        onDeletePlace: handleDeletePlace,
        onSelectDate: (dateStr) => {
          const canonicalDate = normalizePlaceDateForSort(dateStr);
          if (canonicalDate) {
            setSelectedDate(canonicalDate);
            setIsModalOpen(true);
          }
        },
        showToast: showToast,
        onRequestConfirm: showConfirmDialog,
        placesInitialQuery: placesInitialQuery,
        setPlacesInitialQuery: setPlacesInitialQuery,
        placesInitialFocusId: placesInitialFocusId,
        setPlacesInitialFocusId: setPlacesInitialFocusId,
        isDarkTheme: isDarkTheme,
        onToggleTheme: toggleTheme,
        fontScalePercent: fontScalePercent,
        onDecreaseFont: () => setFontScalePercent(prev => Math.max(80, prev - 10)),
        onIncreaseFont: () => setFontScalePercent(prev => Math.min(130, prev + 10)),
        isChatNotifyEnabled: mainNotifPermission === 'granted' && mainChatNotifyEnabled,
        onToggleChatNotifications: handleMainToggleNotifications,
        onOpenAppSettings: () => setIsAppSettingsOpen(true),
        onSharePlaces: () => setIsPlacesShareOpen(true),
        syncStatus: syncStatus,
        ...navMenuProps
      }),
      isPlacesShareOpen && activeCal && /*#__PURE__*/React.createElement(ShareModal, {
        calendar: activeCal,
        shareType: "places",
        showToast: showToast,
        onClose: () => setIsPlacesShareOpen(false)
      }),
      sharedAppOverlays
    ));
  }

  if (activeView === 'history') {
    return withStickyVideo(/*#__PURE__*/React.createElement(React.Fragment, null,
      /*#__PURE__*/React.createElement(HistoryView, {
        calendar: activeCal,
        onBack: () => changeView('calendar'),
        onSelectDate: (dateStr) => {
          setSelectedDate(dateStr);
          setIsModalOpen(true);
        },
        isDarkTheme: isDarkTheme,
        onToggleTheme: toggleTheme,
        fontScalePercent: fontScalePercent,
        onDecreaseFont: () => setFontScalePercent(prev => Math.max(80, prev - 10)),
        onIncreaseFont: () => setFontScalePercent(prev => Math.min(130, prev + 10)),
        isChatNotifyEnabled: mainNotifPermission === 'granted' && mainChatNotifyEnabled,
        onToggleChatNotifications: handleMainToggleNotifications,
        onOpenAppSettings: () => setIsAppSettingsOpen(true),
        onOpenShare: () => {
          if (guardLoadedCalendar('Firebase 데이터를 불러온 뒤 공유 정보를 확인해 주세요.')) setIsHistoryShareOpen(true);
        },
        syncStatus: syncStatus,
        onAddPersonTag: handleAddPersonTag,
        onRenamePersonTag: handleRenamePersonTag,
        onDeletePersonTag: handleDeletePersonTag,
        anniversaries: anniversaries,
        chatMessages: galleryChatMessages,
        memos: historyMemosSnapshot,
        setActiveLightbox: setActiveLightbox,
        showToast: showToast,
        onPromoteImageUrl: handlePromoteInlineChatImage,
        onSaveImageTags: handleSaveImageTags,
        onSearchTag: handleSearchTag,
        onDeletePhoto: handleDeletePhoto,
        onReplacePhoto: handleReplacePhoto,
        onJumpToChatMessage: handleJumpToChatMessage,
        onJumpToMemo: handleJumpToMemo,
        onJumpToMeetingDate: handleJumpToMeetingDate,
        onGetChatMessageOrdinal: handleGetChatMessageOrdinal,
        onGetGalleryPhotoOrdinal: handleGetGalleryPhotoOrdinal,
        onRequestConfirm: showConfirmDialog,
        onRemovePhotoFromMemory: handleRemovePhotoFromTravelMemory,
        onRemovePhotosFromMemory: handleRemovePhotosFromTravelMemory,
        onHideMemoryGroup: handleHideMemoryGroup,
        onRestoreMemoryGroup: handleRestoreMemoryGroup,
        onAddPhotosBackToMemory: handleAddPhotosBackToTravelMemory,
        onFetchPhotoComments: handleFetchPhotoComments,
        onSavePhotoComments: handleSavePhotoComments,
        onFetchMeetingPhotoIndex: handleFetchMeetingPhotoIndex,
        indexedPhotos: galleryPhotoIndex.items,
        indexedPhotoComplete: galleryPhotoIndex.complete,
        onIndexedPhotoLoadAll: galleryPhotoIndex.loadAll,
        photoCommentCounts: photoCommentCounts,
        ...navMenuProps
      }),
      isHistoryShareOpen && activeCal && /*#__PURE__*/React.createElement(ShareModal, {
        calendar: activeCal,
        shareType: "history",
        showToast: showToast,
        onClose: () => setIsHistoryShareOpen(false)
      }),
      sharedAppOverlays
    ));
  }

  if (activeView === 'content') {
    return withStickyVideo(/*#__PURE__*/React.createElement(React.Fragment, null,
      /*#__PURE__*/React.createElement(ContentView, {
        calendar: activeCal,
        onBack: () => changeView('calendar'),
        onOpenAppSettings: () => setIsAppSettingsOpen(true),
        anniversaries: anniversaries,
        memos: memos,
        onRegisterCultureEvent: handleRegisterCultureEvent,
        onUnregisterCultureEvent: handleUnregisterCultureEvent,
        onQuickSaveMemo: handleQuickSaveCultureMemo,
        customCultureItems: customCultureItems,
        onSaveCustomCultureItem: handleSaveCustomCultureItem,
        showToast: showToast,
        ...navMenuProps
      }),
      sharedAppOverlays
    ));
  }

  const {
    hasVisiblePolls,
    mainMenuChatCount,
    mainMenuChatHasUnread,
    mainMenuPollHasNew,
    mainMenuMemoCount,
    mainMenuMemoHasNew,
    mainMenuGalleryCount,
    mainMenuPlaceCount,
    visibleConfirmedMeetings
  } = buildMainCalendarScreenState({
    calendar: activeCal, calendarId: activeCalId, visibleTotalChatCount, visibleChatMessages,
    totalMemoCount, memos, localGalleryCount, totalGalleryCount
  });

  const toggleConfirmedDateExpand = (dateStr) => {
    const isCurrentlyExpanded = !!expandedConfirmedDates[dateStr];
    if (isCurrentlyExpanded) {
      const banner = document.querySelector(`[data-confirmed-meeting-date="${dateStr}"]`);
      if (banner) {
        banner.classList.add('is-closing');
        const existingTimer = confirmedMeetingAnimationTimersRef.current.get(dateStr);
        if (existingTimer) clearTimeout(existingTimer);
        const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) {
          setExpandedConfirmedDates(prev => ({ ...prev, [dateStr]: false }));
          return;
        }
        const timer = setTimeout(() => {
          setExpandedConfirmedDates(prev => ({ ...prev, [dateStr]: false }));
          confirmedMeetingAnimationTimersRef.current.delete(dateStr);
        }, 260);
        confirmedMeetingAnimationTimersRef.current.set(dateStr, timer);
        return;
      }
    }
    setExpandedConfirmedDates(prev => ({
      ...prev,
      [dateStr]: !prev[dateStr]
    }));
  };

  return withStickyVideo(/*#__PURE__*/React.createElement("div", {
    className: "app-container",
    // offsetHeight already includes .main-header-inner's safe-area padding. Adding the inset
    // again here on iOS standalone created a large blank band between the header and content.
    style: { paddingTop: `${mainHeaderHeight}px` }
  }, /*#__PURE__*/React.createElement("header", {
    ref: mainHeaderRef,
    className: "main-header",
    style: { transform: isMainHeaderVisible ? 'translateY(0)' : 'translateY(-100%)' }
  }, /*#__PURE__*/React.createElement("div", {
    className: "main-header-inner"
  }, /*#__PURE__*/React.createElement("div", {
    className: "main-header-top-row"
  }, /*#__PURE__*/React.createElement("div", {
    className: "header-left"
  }, /*#__PURE__*/React.createElement("div", {
    style: { position: 'relative', minWidth: 0 }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "calendar-title",
    onClick: () => {
      if (activeCalId) {
        window.location.href = `${window.location.pathname}?id=${activeCalId}`;
      }
    }
  }, activeCal?.title)))), /*#__PURE__*/React.createElement("div", {
    className: "header-actions"
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn header-search-btn",
    onClick: () => { setGlobalSearchInitialQuery(''); setIsGlobalSearchOpen(true); },
    title: "검색",
    style: {
      padding: '10px'
    }
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
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("circle", { cx: "11", cy: "11", r: "8" }),
    /*#__PURE__*/React.createElement("path", { d: "m21 21-4.3-4.3" }))), /*#__PURE__*/React.createElement("button", {
    className: "btn header-settings-btn",
    onClick: () => {
      setIsMainSideMenuOpen(true);
    },
    title: "메뉴",
    "aria-label": "메뉴 열기",
    style: {
      padding: '10px'
    }
  }, /*#__PURE__*/React.createElement(AdminFilledMenuIcon, null)))), activeCal?.description && /*#__PURE__*/React.createElement("div", {
    className: "calendar-desc"
  }, renderTextWithUrlBadge(activeCal.description)), /*#__PURE__*/React.createElement("div", {
    className: "main-menu-bar"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "main-menu-item",
    onClick: () => {
      if (!hasVisiblePolls) {
        showAlert('진행중 투표', '현재 진행중인 투표가 없습니다.');
        return;
      }
      setPollsExpandSignal(prev => prev + 1);
      scrollToSection(pollsSectionRef);
    }
  }, /*#__PURE__*/React.createElement("span", { className: "main-menu-icon" }, /*#__PURE__*/React.createElement(MenuIcon, { paths: ["M9 11l3 3l8 -8", "M20 12v6a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2v-12a2 2 0 0 1 2 -2h9"] })), /*#__PURE__*/React.createElement("span", { className: "main-menu-label-full" }, "투표"), /*#__PURE__*/React.createElement("span", { className: "main-menu-label-short" }, "투표"), mainMenuPollHasNew && /*#__PURE__*/React.createElement("span", {
    className: "main-menu-dot"
  })), /*#__PURE__*/React.createElement("div", { className: "main-menu-sep" }), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "main-menu-item",
    onClick: () => changeView('chat')
  }, /*#__PURE__*/React.createElement("span", { className: "main-menu-icon" }, /*#__PURE__*/React.createElement(MenuIcon, { paths: ["M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"] })), /*#__PURE__*/React.createElement("span", { className: "main-menu-label-full" }, "채팅"), /*#__PURE__*/React.createElement("span", { className: "main-menu-label-short" }, "채팅"), mainMenuChatHasUnread && /*#__PURE__*/React.createElement("span", {
    className: "main-menu-dot",
    style: navChatLastAuthor && navChatLastAuthor.color ? { backgroundColor: navChatLastAuthor.color } : undefined
  })), canUseSettlement && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", { className: "main-menu-sep" }), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "main-menu-item",
    onClick: () => {
      if (guardLoadedCalendar('Firebase 데이터를 불러온 뒤 정산 정보를 확인해 주세요.')) changeView('settlement');
    }
  }, /*#__PURE__*/React.createElement("span", { className: "main-menu-icon" }, /*#__PURE__*/React.createElement(WalletIcon, { size: 16 })), /*#__PURE__*/React.createElement("span", { className: "main-menu-label-full" }, "정산"), /*#__PURE__*/React.createElement("span", { className: "main-menu-label-short" }, "정산"), activeCal && (() => {
        const bal = calculateSettlementBalance(activeCal);
        const badgeInfo = formatBalanceBadge(bal);
        return /*#__PURE__*/React.createElement("span", {
          className: "main-menu-badge",
          style: {
            backgroundColor: badgeInfo.bgColor,
            color: '#FFFFFF'
          }
        }, badgeInfo.text);
      })()), /*#__PURE__*/React.createElement("div", { className: "main-menu-sep" })), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "main-menu-item",
    onClick: () => {
      if (guardLoadedCalendar('Firebase 데이터를 불러온 뒤 메모 정보를 확인해 주세요.')) changeView('memo');
    }
  }, /*#__PURE__*/React.createElement("span", { className: "main-menu-icon" }, /*#__PURE__*/React.createElement(NotepadTextIcon, null)), /*#__PURE__*/React.createElement("span", { className: "main-menu-label-full" }, "메모"), /*#__PURE__*/React.createElement("span", { className: "main-menu-label-short" }, "메모"), activeCal && mainMenuMemoHasNew && /*#__PURE__*/React.createElement("span", {
    className: "main-menu-dot"
  }))))), isMainSideMenuOpen && /*#__PURE__*/React.createElement(MainSideMenu, {
    calendar: activeCal,
    anniversaries: anniversaries,
    galleryCount: mainMenuGalleryCount,
    placeCount: mainMenuPlaceCount,
    chatCount: mainMenuChatCount,
    memoCount: mainMenuMemoCount,
    historyCount: navHistoryCount,
    settlementCount: Array.isArray(activeCal && activeCal.expenses)
      ? activeCal.expenses.filter(e => e && !e.deletedAt).length
      : 0,
    settlementBadge: meetingsHydrated && activeCal && typeof calculateSettlementBalance === 'function' && typeof formatBalanceBadge === 'function'
      ? formatBalanceBadge(calculateSettlementBalance(activeCal))
      : null,
    chatLastAuthor: navChatLastAuthor,
    settlementLastDate: navSettlementLastDate,
    galleryLastDate: navGalleryLastDate,
      placeLastName: navPlaceLastName,
    memoLastTitleWord: navMemoLastTitleWord,
    showSettlement: canUseSettlement,
      onClose: () => setIsMainSideMenuOpen(false),
    onOpenManual: () => {
      setIsMainSideMenuOpen(false);
      const openManual = () => setIsGuideOpen(true);
      if (typeof window.__gatherLoadManualUi === 'function') {
        window.__gatherLoadManualUi().then(openManual).catch(err => {
          console.error('User manual UI load failed:', err);
          showToast('사용자 매뉴얼을 불러오지 못했습니다. 다시 시도해 주세요.', 'error');
        });
      } else {
        openManual();
      }
    },
    onOpenSettings: () => {
      setIsMainSideMenuOpen(false);
      if (!guardLoadedCalendar('Firebase 데이터를 불러온 뒤 설정을 수정해 주세요.')) return;
      const openSettings = () => {
        setAdminInitialTab('settings');
        setIsAdminOpen(true);
      };
      if (typeof window.__gatherLoadAdminUi === 'function') {
        window.__gatherLoadAdminUi().then(openSettings).catch(err => {
          console.error('Calendar settings UI load failed:', err);
          showToast('캘린더 설정을 불러오지 못했습니다. 다시 시도해 주세요.', 'error');
        });
      } else {
        openSettings();
      }
    },
    onOpenAnniversaries: () => {
      setIsMainSideMenuOpen(false);
      if (guardLoadedCalendar('Firebase 데이터를 불러온 뒤 기념일 설정을 수정해 주세요.')) {
        withEventUi(() => setIsAnniversariesOpen(true), '기념일 설정');
        if (activeCalId && typeof fetchAnniversariesRest === 'function') {
          fetchAnniversariesRest(activeCalId).then(list => {
            if (Array.isArray(list) && list.length > 0) {
              setAnniversaries(list.slice().sort((a, b) =>
                (Number(b.createdAt) || Number(b.updatedAt) || 0) - (Number(a.createdAt) || Number(a.updatedAt) || 0)
              ));
            }
          }).catch(() => {});
        }
      }
    },
    onOpenShare: () => {
      setIsMainSideMenuOpen(false);
      if (guardLoadedCalendar('Firebase 데이터를 불러온 뒤 공유 정보를 확인해 주세요.')) setIsShareOpen(true);
    },
    onOpenAdmin: () => {
      const adminUrl = new URL(window.location.href);
      adminUrl.searchParams.delete('view');
      adminUrl.searchParams.delete('msg');
      adminUrl.searchParams.delete('img');
      adminUrl.searchParams.delete('memo');
      adminUrl.searchParams.delete('place');
      adminUrl.searchParams.set('admin', '1');
      if (activeCalId) {
        adminUrl.searchParams.set('id', activeCalId);
      }
      if (currentMonthDate instanceof Date && !Number.isNaN(currentMonthDate.getTime())) {
        adminUrl.searchParams.set('year', String(currentMonthDate.getFullYear()));
        adminUrl.searchParams.set('month', String(currentMonthDate.getMonth() + 1).padStart(2, '0'));
      }
      window.open(adminUrl.toString(), '_blank', 'noopener,noreferrer');
    },
    onOpenGallery: () => changeView('gallery'),
    onChangeView: changeView,
    isDarkTheme: isDarkTheme,
    onToggleTheme: toggleTheme,
    fontScalePercent: fontScalePercent,
    onDecreaseFont: () => setFontScalePercent(prev => Math.max(80, prev - 10)),
    onIncreaseFont: () => setFontScalePercent(prev => Math.min(130, prev + 10)),
    isChatNotifyEnabled: mainNotifPermission === 'granted' && mainChatNotifyEnabled,
    onToggleChatNotifications: handleMainToggleNotifications,
    onOpenAppSettings: () => setIsAppSettingsOpen(true),
    onUpdateWeatherLocation: handleUpdateWeatherLocation,
    onDeleteRecentLocation: handleDeleteRecentWeatherLocation,
    showToast: showToast,
    syncStatus: syncStatus
  }), isGalleryOpen && /*#__PURE__*/React.createElement(ChatGalleryModal, {
    calendar: activeCal,
    // 채팅창 안에서 여는 이 갤러리 인스턴스만 좁은 live-window `chatMessages`를 받고 있었다 --
    // 스크롤로 올라간 옛 사진을 열어 태그를 저장해도 patchLocalChatMessage가 patch하는 다른
    // 4개 버킷(olderChatMessages/galleryLiveMessages/갤러리 아카이브)에는 반영되지만 이 좁은
    // 배열엔 반영 안 돼서, 같은 사진을 다시 열면 저장 전 상태로 보였다(새로고침해야 갱신).
    // 갤러리 페이지/히스토리 뷰가 이미 쓰는 병합된 galleryChatMessages/galleryMemos로 맞춘다.
    chatMessages: galleryChatMessages,
    memos: galleryMemos,
    onClose: () => setIsGalleryOpen(false),
    onUploadImages: handleUploadGalleryImages,
    onAddLink: handleAddGalleryLink,
    onAddFiles: handleAddGalleryFiles,
    onDeleteFiles: handleDeleteGalleryFiles,
    onDeleteGalleryLinks: handleDeleteGalleryLinks,
    onRequestConfirm: showConfirmDialog,
    onPasteGatherPhoto: handlePasteGatherPhoto,
    onPasteGatherPhotos: handlePasteGatherPhotos,
    onOpenShare: () => {
      if (guardLoadedCalendar('Firebase 데이터를 불러온 뒤 공유 정보를 확인해 주세요.')) setIsGalleryShareOpen(true);
    },
    setActiveLightbox: setActiveLightbox,
    onDeletePhoto: handleDeletePhoto,
    photoCommentCounts: photoCommentCounts,
    showToast: showToast
  }), isGalleryShareOpen && activeCal && /*#__PURE__*/React.createElement(ShareModal, {
    calendar: activeCal,
    shareType: "gallery",
    showToast: showToast,
    onClose: () => setIsGalleryShareOpen(false)
  }), isGuideOpen && /*#__PURE__*/React.createElement(UserManualOverlay, {
    calendar: activeCal,
    onClose: () => setIsGuideOpen(false)
  }), isNotificationHelpOpen && /*#__PURE__*/React.createElement(NotificationPermissionHelpModal, {
    onClose: () => setIsNotificationHelpOpen(false),
    onRetry: handleMainToggleNotifications,
    showToast: showToast
  }), isAnniversariesOpen && /*#__PURE__*/React.createElement(AnniversaryModal, {
    calendar: activeCal,
    anniversaries: anniversaries,
    initialEditId: anniversaryEditId,
    onInitialEditConsumed: () => setAnniversaryEditId(null),
    initialDate: anniversaryInitialDate,
    onClose: () => { setIsAnniversariesOpen(false); setAnniversaryEditId(null); setAnniversaryInitialDate(null); },
    showToast: showToast,
    onRequestConfirm: showConfirmDialog,
    onBulkRegister: handleBulkRegisterAvailability,
    onAnniversarySaved: handleAnniversarySaved,
    onAnniversaryDeleted: handleAnniversaryDeleted,
    isDarkTheme: isDarkTheme,
    setActiveLightbox: setActiveLightbox
  }), /*#__PURE__*/React.createElement("div", {
    ref: calendarSectionRef
  }, visibleConfirmedMeetings.length > 0 && /*#__PURE__*/React.createElement("div", {
    className: "confirmed-meeting-list",
    "data-confirmed-count": visibleConfirmedMeetings.length === 1 ? 'one' : visibleConfirmedMeetings.length === 2 ? 'two' : 'three-plus',
    style: { display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '8px', marginBottom: '12px', alignItems: 'center', width: '100%' }
  }, visibleConfirmedMeetings.map((meeting, meetingIndex) => {
    // A lone confirmed meeting defaults to the expanded banner (no need to tap to see it), but
    // once the user has explicitly toggled it, that explicit choice always wins -- otherwise the
    // forced-expanded default fights the collapse animation started by toggleConfirmedDateExpand
    // and the card gets stuck mid-collapse instead of settling back into the small icon state.
    const isExpanded = meeting.date in expandedConfirmedDates
      ? expandedConfirmedDates[meeting.date]
      : visibleConfirmedMeetings.length === 1;
    // Only the lead (first) upcoming card gets the 두근두근 pulse, and only while collapsed —
    // expanded banner must stay still.
    const isLeadCollapsedHeartbeat = meetingIndex === 0 && !isExpanded;
    const memoEntries = getActiveAvailabilities(activeCal).filter(e => e.date === meeting.date && e.note && e.note.trim());
    const [y, m, d] = meeting.date.split('-');
    const dateObj = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
    const dayNamesFull = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
    const dayNamesShort = ['일', '월', '화', '수', '목', '금', '토'];
    const fullDayName = dayNamesFull[dateObj.getDay()];
    const shortDayName = dayNamesShort[dateObj.getDay()];
    const ddayText = formatDDayLabel(meeting.date);
    const yyMMdd = `${y.slice(2)}.${m}.${d}`;

    if (!isExpanded) {
      /* Collapsed Icon State (Matching Image 1) */
      return /*#__PURE__*/React.createElement("button", {
        type: "button",
        key: meeting.date,
        className: "confirmed-meeting-icon-btn confirmed-meeting-surface" + (isLeadCollapsedHeartbeat ? " is-heartbeat" : ""),
        onClick: () => toggleConfirmedDateExpand(meeting.date),
        title: `${formatConfirmedMeetingLabel(meeting.date)} (클릭하여 펼치기)`,
        style: {
          display: 'inline-flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '8px 10px',
          minWidth: '70px',
          minHeight: '66px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%)',
          color: '#FFFFFF',
          border: 'none',
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(168, 85, 247, 0.25)',
          userSelect: 'none',
          WebkitTapHighlightColor: 'transparent'
        }
      },
        /* Date YY.MM.DD */
        /*#__PURE__*/React.createElement("span", {
          style: { fontSize: 'var(--font-size-xs)', fontWeight: 800, color: '#FFFFFF', lineHeight: 1.1, textShadow: '0 1px 2px rgba(0,0,0,0.15)' }
        }, yyMMdd),
        /* Day Name */
        /*#__PURE__*/React.createElement("span", {
          style: {
            fontSize: 'var(--font-size-base)',
            fontWeight: 800,
            color: shortDayName === '일' ? '#B7F34A' : '#FFFFFF',
            marginTop: '2px',
            lineHeight: 1.1,
            textShadow: '0 1px 2px rgba(0,0,0,0.15)'
          }
        }, fullDayName),
        /* D-day Pill Badge */
        /*#__PURE__*/React.createElement("span", {
          style: {
            backgroundColor: 'rgba(26, 16, 47, 0.85)',
            color: '#F472B6',
            padding: '2px 8px',
            borderRadius: 'var(--radius-full)',
            fontSize: 'var(--font-size-xs)',
            fontWeight: 800,
            marginTop: '4px',
            whiteSpace: 'nowrap',
            letterSpacing: '0.02em',
            boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
          }
        }, ddayText)
      );
    } else {
      /* Expanded Banner State (Matching Image 2) */
      return /*#__PURE__*/React.createElement("div", {
        key: meeting.date,
        className: "confirmed-meeting-banner confirmed-meeting-surface",
        "data-confirmed-meeting-date": meeting.date,
        role: "button",
        tabIndex: 0,
        onClick: (e) => {
          // Keep action clicks from collapsing the banner even if bubbling reaches this handler.
          if (e.target?.closest?.('.btn-view-schedule')) return;
          toggleConfirmedDateExpand(meeting.date);
        },
        onKeyDown: (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleConfirmedDateExpand(meeting.date);
          }
        },
        title: "클릭하여 접기",
        style: {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          flex: '1 1 100%',
          padding: '10px 14px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%)',
          color: '#FFFFFF',
          border: 'none',
          cursor: 'pointer',
          gap: '12px',
          boxShadow: 'none',
          textAlign: 'left',
          userSelect: 'none',
          WebkitTapHighlightColor: 'transparent'
        }
      },
        /* Left Column: Title & Notes */
        /*#__PURE__*/React.createElement("div", {
          style: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '5px', minWidth: 0, flex: 1 }
        },
          /* Line 1: [모임확정] YY.MM.DD (요일) */
          /*#__PURE__*/React.createElement("span", {
            style: { fontWeight: 800, color: '#FFFFFF', fontSize: '0.9rem', letterSpacing: '-0.01em', textShadow: '0 1px 2px rgba(0,0,0,0.15)' }
          }, `[모임확정] ${yyMMdd} (${shortDayName})`),
          /* Line 2: Note Summary Capsules */
          memoEntries.length > 0 && /*#__PURE__*/React.createElement("div", {
            style: { display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }
          },
            memoEntries.map(entry => {
              const p = getActiveParticipants(activeCal).find(part => part.id === entry.participantId);
              if (!p) return null;
              const entryUrl = extractFirstUrl(entry.note);
              const noteTextOnly = entryUrl ? removeFirstUrl(entry.note) : entry.note.trim();
              if (!noteTextOnly) return null;
              const pColor = (p && p.color) ? p.color : '#6366F1';
              return /*#__PURE__*/React.createElement(CapsuleTextBadge, {
                key: entry.participantId,
                text: noteTextOnly,
                title: `${p.name}: ${noteTextOnly}`,
                className: "memo-capsule-badge",
                style: {
                  backgroundColor: pColor,
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: 'var(--font-size-sm)',
                  lineHeight: '140%',
                  padding: '4px 10px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }
              });
            })
          )
        ),
        /* Right Column: "일정보기" & D-day Button */
        /*#__PURE__*/React.createElement("button", {
          type: "button",
          className: "btn-view-schedule",
          "aria-label": `${formatConfirmedMeetingLabel(meeting.date)} 일정 보기`,
          "data-no-press-feedback": true,
          onPointerDownCapture: (e) => e.stopPropagation(),
          onPointerDown: (e) => {
            // Keep the nested action independent from the banner's collapse handler on touch.
            e.stopPropagation();
          },
          onMouseDown: (e) => e.stopPropagation(),
          onClick: (e) => {
            e.stopPropagation();
            if (!guardLoadedCalendar()) return;
            setSelectedDate(meeting.date);
            setIsModalOpen(true);
          },
          onKeyDown: (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.stopPropagation();
              e.preventDefault();
              if (!guardLoadedCalendar()) return;
              setSelectedDate(meeting.date);
              setIsModalOpen(true);
            }
          },
          style: {
            backgroundColor: 'rgba(26, 16, 47, 0.88)',
            borderRadius: 'var(--radius-md)',
            padding: '6px 14px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            flexShrink: 0,
            boxShadow: 'none',
            border: 'none'
          }
        },
          /*#__PURE__*/React.createElement("span", {
            style: { color: '#F472B6', fontSize: 'var(--font-size-xs)', fontWeight: 800, lineHeight: 1.2 }
          }, ddayText),
          /*#__PURE__*/React.createElement("span", {
            style: { color: '#FFFFFF', fontSize: 'var(--font-size-sm)', fontWeight: 800, lineHeight: 1.2, marginTop: '1px' }
          }, "일정보기")
        )
      );
    }
  })), /*#__PURE__*/React.createElement(CalendarGrid, {
    anniversaries: anniversariesWithPosters,
    calendar: activeCal,
    isLoading: isInitialDataLoading,
    monthDate: currentMonthDate,
    onPrevMonth: () => setCurrentMonthAndSync(new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() - 1, 1)),
    onNextMonth: () => setCurrentMonthAndSync(new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() + 1, 1)),
    onToday: () => setCurrentMonthAndSync(new Date()),
    onJumpToMonth: (y, m) => setCurrentMonthAndSync(new Date(y, m, 1)),
    onSelectDate: d => {
      if (!guardLoadedCalendar()) return;
      setSelectedDate(d);
      setIsModalOpen(true);
    },
    onMoveAvailability: handleMoveAvailability,
    onParticipantClick: handleParticipantClick
  })), hasVisiblePolls && /*#__PURE__*/React.createElement("div", {
    ref: pollsSectionRef,
    className: "calendar-card",
    style: {
      padding: '16px',
      marginTop: '-12px'
    }
  }, /*#__PURE__*/React.createElement(PollList, {
    calendar: activeCal,
    onCreatePoll: handleOpenPollCreate,
    onEditPoll: handleOpenPollEdit,
    onVotePoll: handleOpenVoteSheet,
    onCancelVote: handleCancelVote,
    onRequestConfirm: showConfirmDialog,
    expandSignal: pollsExpandSignal
  })), /*#__PURE__*/React.createElement("div", { className: "chat-memo-row" },
    /*#__PURE__*/React.createElement("div", {
      className: "calendar-card",
      style: {
        padding: '16px'
      }
    }, /*#__PURE__*/React.createElement(CommentsSection, {
      calendar: activeCal,
      recentMessages: recentMessages,
      chatMessages: visibleChatMessages,
      totalChatCount: visibleTotalChatCount,
      previewHydrationExhausted: chatPreviewHydrationExhausted,
      chatInput: chatInput,
      setChatInput: setChatInput,
      chatParticipantId: chatParticipantId,
      setChatParticipantId: setChatParticipantId,
      isChatSheetOpen: isChatSheetOpen,
      setIsChatSheetOpen: setIsChatSheetOpen,
      isChatSubmitting: isChatSubmitting,
      chatTextareaRef: chatTextareaRef,
      chatImage: chatImages,
      setChatImage: setChatImages,
      chatFileAttachments: chatFileAttachments,
      setChatFileAttachments: setChatFileAttachments,
      activeLightbox: null, // render via withStickyVideo shared Lightbox host
      setActiveLightbox: setActiveLightbox,
      onSend: handleSendChatMessage,
      onDeleteMessage: handleDeleteMessage,
      onEditMessage: handleEditMessage,
      onMore: () => changeView('chat'),
      showToast: showToast,
      onPromoteImageUrl: handlePromoteInlineChatImage,
      onSaveImageTags: handleSaveImageTags,
      onSearchTag: handleSearchTag,
      onDeletePhoto: handleDeletePhoto,
      onReplacePhoto: handleReplacePhoto,
      onJumpToChatMessage: handleJumpToChatMessage,
      onJumpToMemo: handleJumpToMemo,
      onJumpToMeetingDate: handleJumpToMeetingDate,
      onGetChatMessageOrdinal: handleGetChatMessageOrdinal,
      onGetGalleryPhotoOrdinal: handleGetGalleryPhotoOrdinal,
      onRequestConfirm: showConfirmDialog
    })),
    /*#__PURE__*/React.createElement(MemoPreviewSection, {
      memos: memos,
      calendar: activeCal,
      onViewAll: () => changeView('memo'),
      onOpenEdit: memo => handleJumpToMemo(memo.id),
      onTogglePin: handleTogglePinFromMemoPreview,
      onSelectTag: handleJumpToMemoTag,
      onShare: memo => setPreviewSharingMemo(memo),
      onCommentsChange: handleMemoCommentsChangeFromMemoPreview,
      onRequestConfirm: showConfirmDialog,
      showToast: showToast, setActiveLightbox: setActiveLightbox
    })
  ), /*#__PURE__*/React.createElement(SummaryList, {
    calendar: activeCal,
    onSelectDate: d => {
      if (!guardLoadedCalendar()) return;
      setSelectedDate(d);
      setIsModalOpen(true);
    }
  }), /*#__PURE__*/React.createElement("div", { className: "gallery-places-row" },
    /*#__PURE__*/React.createElement(PhotoGallery, {
      chatMessages: (galleryPreviewMessages && galleryPreviewMessages.length > 0) ? galleryPreviewMessages : allChatMessages,
      memos: memos,
      calendar: activeCal,
      totalGalleryCount: mainMenuGalleryCount,
      onViewAll: () => changeView('gallery'),
      showToast: showToast,
      onPromoteImageUrl: handlePromoteInlineChatImage,
      onSaveImageTags: handleSaveImageTags,
      onSearchTag: handleSearchTag,
      onDeletePhoto: handleDeletePhoto,
      onReplacePhoto: handleReplacePhoto,
      onJumpToChatMessage: handleJumpToChatMessage,
      onJumpToMemo: handleJumpToMemo,
      onJumpToMeetingDate: handleJumpToMeetingDate,
      onJumpToGallery: handleJumpToGallery,
      onGetChatMessageOrdinal: handleGetChatMessageOrdinal,
      onGetGalleryPhotoOrdinal: handleGetGalleryPhotoOrdinal,
      onRequestConfirm: showConfirmDialog,
      onFetchPhotoComments: handleFetchPhotoComments,
      onSavePhotoComments: handleSavePhotoComments,
      photoCommentCounts: photoCommentCounts
    }),
    /*#__PURE__*/React.createElement(PlacesSection, {
      calendar: activeCal,
      onViewAll: () => changeView('places'),
      onSelectPlace: place => handleJumpToPlace(place.id)
    })
  ), /*#__PURE__*/React.createElement(Footer, null),
  previewSharingMemo && activeCal && /*#__PURE__*/React.createElement(MemoShareModal, {
    memo: previewSharingMemo,
    calendarId: activeCal.id,
    onClose: () => setPreviewSharingMemo(null),
    showToast: showToast
  })));
}


// Calendar Grid Component
const { CalendarGrid, CommentsSection, MemoCard, PollList, GlobalSearchModal, EditMessageModal } = uiWrapperAliases;

// Detects when chat message TEXT contains several pasted image links (typed/pasted as plain
// URLs, e.g. one per line) rather than a single embedded link, so DirectChatMediaText can show
// them as a thumbnail grid like an actual multi-image upload instead of only picking out the
// first URL. Deliberately requires 2+ recognized image URLs -- a single one keeps using the
// existing one-image embed path (which also covers video/embed types this doesn't need to
// duplicate).
function extractDirectImageUrls(text) {
  return extractAllUrlInfos(text).filter(info => getDirectChatMediaInfo(info.url)?.type === 'image');
}

// Appending a fresh <script> tag per mount makes embed.js rescan the DOM for this blockquote.
// onFailed fires if no player iframe shows up in time, so the caller can fall back to the
// link-preview card.

// Floating video player kept alive via a document.body portal so it survives App()'s
// activeView-based tab switches without unmounting (see the withStickyVideo wrapper around
// every one of App()'s 5 return branches). zIndex 40000 sits above regular modals (up to
// ~30000) so it stays visible while browsing other tabs, but below toast (99999) and confirm
// dialogs (100000) so those never get obscured by it.

const { DirectChatMediaText, DeadlineDateTimePicker, PlacesSection, ImageUrlModal } = uiWrapperAliases;

const GATHER_APP_CHAT_DATA = window.GATHER_APP_CHAT_DATA || {};

const { ImageUploadOverlay, ImageProcessingOverlay, EmojiPickerSheet } = uiWrapperAliases;


// U1a (docs/app-main-split-units.md): the icon components below are aliases bound from
// GATHER_UI_COMPONENTS by bindUiComponentAliases (src/core/app-ui-wrappers.js), reusing the
// single `uiWrapperAliases` object computed near the top of this file (U1b) -- kept as
// same-name const bindings here because check-required-symbols.mjs and every JSX call site
// in this file still reference these names directly.
const {
  MenuIcon, NotepadTextIcon, ChatSectionIcon, LinkIcon, MessageCommentIcon, PencilIcon,
  BuildingIcon, BackArrowIcon, SunIcon, CloudIcon, MistIcon, CloudRainIcon, SnowflakeIcon,
  CloudLightningIcon, SettingsIcon, MapCogIcon, GiftIcon, MoonStarsIcon, TextResizeIcon,
  BellIcon, SearchIcon, CalendarCheckIcon, LockIcon, LogoutIcon, RefreshIcon,
  AdminFilledMenuIcon, EmojiPickerIcon, ExternalLinkIcon, WalletIcon, CoinIcon,
  BanknoteArrowUpIcon, BanknoteArrowDownIcon, PiggyBankIcon, ChartBarIcon, ChartPieIcon,
  CalendarCogIcon, CalendarSearchIcon, TrophyIcon, PodiumIcon, CloudDataConnectionIcon,
  LogIcon, HourglassIcon, AlertTriangleIcon, ShieldCheckIcon, KakaoTalkIcon,
  CalendarExportIcon, GalleryIcon, PollSectionIcon, LineHeightIcon, MegaphoneIcon,
  SmallXIcon, PlaceSectionIcon, ThreeLinesIcon, PlaceCategoryMarkerIcon, CctvIcon, DicesIcon
} = uiWrapperAliases;
// Matches MenuIcon's exact svg wrapper (16x16, stroke 2, round caps) but needs a <rect> child
// alongside its <path>s, which MenuIcon's paths-only prop can't express.


// Black-gradient info panel shown at the bottom of the active photo when the Lightbox's
// tap-to-toggle info mode is on. Fixed 4-line layout: 업로드 date, 파일정보 (format/size/
// dimensions), 해시태그 capsules + URL button, and the 태그입력 input row. 해시태그 is the
// public-facing name for what's stored as one space/comma-delimited string per image (see
// handleSaveImageTags) -- parsed into individual #tag capsules here for display/delete/search.




// Full-screen image viewer for a message's photo(s) -- swipeable (touch) with left/right arrow
// buttons and dot indicators when there's more than one image, matching the KakaoTalk-style
// multi-photo gallery UX the chat bubbles are modeled after. `meta` (optional, parallel to
// `urls`) supplies each image's { timestamp } for the tap-to-toggle info overlay.
const { Lightbox } = uiWrapperAliases;





const { ChatRoomView } = uiWrapperAliases;


// A curated, cross-platform-consistent emoji set (Twemoji, the same flat-design set used by
// Twitter/X, Discord, and Slack) rendered as small <img> tags -- not native OS emoji fonts.
// Native emoji rendering looks different on every OS (Apple/Segoe/Noto/etc.), which is exactly
// what a shared group chat wants to avoid: everyone sees the identical glyph regardless of
// device or browser (Safari/Chrome/Edge/Firefox, desktop or mobile).
const TWEMOJI_CDN_BASE = typeof GATHER_APP_CHAT_DATA.TWEMOJI_CDN_BASE === 'string' ? GATHER_APP_CHAT_DATA.TWEMOJI_CDN_BASE : 'https://cdn.jsdelivr.net/gh/jdecked/twemoji@17.0.3/assets/svg/';
function twemojiCodepoint(emoji) {
  const hasZwj = emoji.indexOf('\u200D') !== -1;
  const codepoints = [];
  for (const ch of emoji) {
    const cp = ch.codePointAt(0);
    if (cp === 0xFE0F && !hasZwj) continue; // strip the variation selector unless a ZWJ sequence needs it, matching Twemoji's own asset naming
    codepoints.push(cp.toString(16));
  }
  return codepoints.join('-');
}
function twemojiImageUrl(emoji) {
  return `${TWEMOJI_CDN_BASE}${twemojiCodepoint(emoji)}.svg`;
}

const RECENT_EMOJI_STORAGE_KEY = typeof GATHER_APP_CHAT_DATA.RECENT_EMOJI_STORAGE_KEY === 'string' ? GATHER_APP_CHAT_DATA.RECENT_EMOJI_STORAGE_KEY : 'gather_recent_emojis_v1';
function getRecentEmojis() {
  try {
    const arr = JSON.parse(getLocalStorage().getItem(RECENT_EMOJI_STORAGE_KEY) || '[]');
    return Array.isArray(arr) ? arr.slice(0, 24) : [];
  } catch (e) {
    return [];
  }
}
function addRecentEmoji(emoji) {
  try {
    const next = [emoji, ...getRecentEmojis().filter(e => e !== emoji)].slice(0, 24);
    getLocalStorage().setItem(RECENT_EMOJI_STORAGE_KEY, JSON.stringify(next));
  } catch (e) {
    // storage unavailable (private browsing etc.) -- recents just won't persist
  }
}

// A single emoji cell: renders the shared Twemoji image, falling back to the native character
// (via the system font) if the CDN image fails to load, so a network hiccup never blocks
// picking an emoji outright.




// Colored capsule button that opens a ChatParticipantSheet -- the "누구 작성" trigger used by
// the memo composer/editor and the chat edit modal (so a message posted under the wrong
// participant can be corrected). One definition so the pill's look stays identical everywhere.


// Speech-bubble "comment" icon (Lucide message), used by the memo comment toggle button.


// Pencil "edit" icon, matching the exact glyph the chat message action row already uses --
// shared here so the memo comment feature's edit button looks identical rather than a copy.


// "building-2" icon -- same path data as the raw SVG string PlaceMapView's Leaflet popup builds
// for its "지도에서 업체정보 보기" button (see businessInfoBtn.innerHTML), so the place list's icon
// version of 업체보기 looks identical to the map popup's.





const { ChatParticipantSheet, AppSettingsModal, NotificationOnboardingModal, NotificationPermissionHelpModal, ConfirmDialog } = uiWrapperAliases;








// canvas-confetti creates ONE shared canvas on the first confetti() call anywhere in the app and
// bakes that call's zIndex into it permanently -- later calls with a different zIndex are
// ignored since the canvas is reused, not recreated. So every call site must pass this same
// value, or an earlier low-zIndex call (e.g. a chat send burst) locks the canvas behind modals.
const CONFETTI_Z_INDEX = 999999;


const { DateModal } = uiWrapperAliases;





const rebuildCalendarToTimestamp = (calendar, T, logs = []) => {
  const now = Date.now();

  // Sort chronologically
  const sortedLogs = [...logs].sort((a, b) => a.timestamp - b.timestamp);

  // 1. Rebuild participants (only kept if created before T, un-removed if deleted after T)
  const rebuiltParticipants = (calendar.participants || [])
    .filter(p => (p.updatedAt || 0) <= T)
    .map(p => {
      if (p.removedAt && p.removedAt > T) {
        const { removedAt: _removedAt, ...rest } = p;
        return rest;
      }
      return p;
    });

  const participantIds = new Set(rebuiltParticipants.map(p => p.id));
  const BULK_NO_PARTICIPANT_ID = (GATHER_APP_CONSTANTS && GATHER_APP_CONSTANTS.BULK_NO_PARTICIPANT_ID) || '__none__';

  // 2. Rebuild availabilities
  const rebuiltAvailabilities = new Map();
  for (const log of sortedLogs) {
    if (log.timestamp > T) continue;
    if (POLL_ACTIVITY_ACTIONS.includes(log.action)) continue;
    if (log.participantId && log.participantId !== BULK_NO_PARTICIPANT_ID && !participantIds.has(log.participantId)) continue;

    const key = `${log.date}_${log.participantId}`;
    if (log.action === 'create' || log.action === 'update') {
      rebuiltAvailabilities.set(key, {
        date: log.date,
        participantId: log.participantId,
        note: log.note || '',
        updatedAt: log.timestamp
      });
    } else if (log.action === 'delete') {
      rebuiltAvailabilities.delete(key);
    }
  }

  // 3. Rebuild Polls and Votes
  const rebuiltPolls = (calendar.polls || [])
    .filter(poll => (poll.createdAt || 0) <= T)
    .map(poll => {
      const votes = {};
      const optionMap = (poll.options || []).reduce((acc, opt) => {
        acc[opt.text] = opt.id;
        return acc;
      }, {});

      for (const log of sortedLogs) {
        if (log.timestamp > T) continue;
        if (!participantIds.has(log.participantId)) continue;

        if (log.action === 'poll_vote' && log.note.startsWith(`${poll.title} / `)) {
          const optText = log.note.substring(poll.title.length + 3);
          const optId = optionMap[optText];
          if (optId) votes[log.participantId] = optId;
        } else if (log.action === 'poll_cancel' && log.note.startsWith(`${poll.title} / `)) {
          delete votes[log.participantId];
        }
      }
      return { ...poll, votes, updatedAt: T };
    });

  // 4. Rebuild Confirmed Meetings and Expenses
  const rebuiltMeetingsMap = new Map();
  (calendar.confirmedMeeting || []).forEach(m => {
    if (!m) return;
    const expenses = (m.expenses || []).filter(e => (e.createdAt || 0) <= T);
    const isConfirmed = m.confirmed !== false && (m.confirmedAt || 0) <= T;
    rebuiltMeetingsMap.set(m.date, {
      ...m,
      confirmed: isConfirmed,
      confirmedAt: isConfirmed ? m.confirmedAt : null,
      expenses: expenses
    });
  });

  for (const log of sortedLogs) {
    if (log.timestamp > T) continue;
    const dateStr = log.date;
    if (!dateStr) continue;

    if (log.action === 'meeting_confirm') {
      const existing = rebuiltMeetingsMap.get(dateStr) || { date: dateStr, expenses: [] };
      rebuiltMeetingsMap.set(dateStr, {
        ...existing,
        confirmed: true,
        confirmedAt: log.timestamp,
        note: log.note
      });
    } else if (log.action === 'meeting_cancel') {
      const existing = rebuiltMeetingsMap.get(dateStr) || { date: dateStr, expenses: [] };
      rebuiltMeetingsMap.set(dateStr, {
        ...existing,
        confirmed: false,
        confirmedAt: null
      });
    } else if (log.action === 'expense_create' || log.action === 'expense_update') {
      const existing = rebuiltMeetingsMap.get(dateStr) || { date: dateStr, expenses: [] };
      const match = /^([+-])([\d,]+)원\s*(.*)$/.exec(log.note);
      if (match) {
        const sign = match[1];
        const amountVal = Number(match[2].replace(/,/g, ''));
        const amount = sign === '+' ? -amountVal : amountVal;
        const label = match[3] || '';
        const expId = `rebuilt_exp_${log.id}`;
        const categoryId = 'etc';

        if (log.action === 'expense_create') {
          existing.expenses.push({
            id: expId,
            label,
            url: '',
            categoryId,
            amount,
            createdAt: log.timestamp,
            updatedAt: log.timestamp
          });
        } else {
          const idx = existing.expenses.findIndex(e => e.label === label);
          if (idx >= 0) {
            existing.expenses[idx] = {
              ...existing.expenses[idx],
              amount,
              updatedAt: log.timestamp
            };
          } else {
            existing.expenses.push({
              id: expId,
              label,
              url: '',
              categoryId,
              amount,
              createdAt: log.timestamp,
              updatedAt: log.timestamp
            });
          }
        }
      }
      rebuiltMeetingsMap.set(dateStr, existing);
    } else if (log.action === 'expense_delete') {
      const existing = rebuiltMeetingsMap.get(dateStr) || { date: dateStr, expenses: [] };
      const match = /^([+-])([\d,]+)원\s*(.*)$/.exec(log.note);
      if (match) {
        const label = match[3] || '';
        existing.expenses = existing.expenses.filter(e => e.label !== label);
      }
      rebuiltMeetingsMap.set(dateStr, existing);
    }
  }

  const rebuiltLogs = logs.filter(log => log.timestamp <= T);

  return {
    ...calendar,
    participants: rebuiltParticipants,
    availabilities: Array.from(rebuiltAvailabilities.values()),
    polls: rebuiltPolls,
    confirmedMeeting: Array.from(rebuiltMeetingsMap.values()).filter(m => m.confirmed !== false || m.expenses.length > 0 || (Array.isArray(m.photos) && m.photos.length > 0)),
    activityLogs: rebuiltLogs,
    updatedAt: now,
    revision: (calendar.revision || 0) + 1
  };
};

// A <input type="color">-replacement: native color inputs open the OS/browser's own color
// picker (a system popup outside the app's control, and inconsistent across browsers/dark
// mode) -- this instead opens the same bottom-sheet pattern as every other picker in the app,
// letting the user choose from the same PRESET_COLORS palette new participants are auto-assigned
// from. Used for calendar accent color, participant color, and expense category color alike.


// Admin Modal
// A <select>-replacement styled as a form-select trigger button that opens the same bottom-sheet
// picker pattern used elsewhere in the app (e.g. the admin header's calendar picker) -- unlike a
// native <select>, the open dropdown list is entirely CSS-styled and follows dark mode.
const { SectionCountBadge, SectionToggleButton, SearchCategoryTabs, SimpleBottomSheetPicker, PhotoGallery, SummaryList, MemoPreviewSection } = uiWrapperAliases;




// Wraps every case-insensitive match of `keyword` inside `text` in a <mark>. Shared by
// GlobalSearchModal (single-calendar) and AdminUnifiedSearchResultsView (cross-calendar).

// Formats a timestamp the same way the admin 로그 tab does, so every search result row (and the
// admin chat log itself) reads identically: "8/13 오후 2:05:31" style, ko-KR locale.

// Left-pointing chevron/arrow used by every "back to previous screen" header in this app
// (memo view, unified search results, etc.) -- one definition so the stroke weight/shape never
// drifts between screens.
// The single "<" back-button glyph used at the left of every page header in the app (chat room,
// memo, admin unified search, and any future page) -- a chevron-down rotated 90deg, matching the
// exact shape/weight this app has always used for "go back", not a full arrow-with-shaft.


// One keyword-search pass over a single calendar's 일정/채팅/태그/정산/메모 data. Shared by
// GlobalSearchModal (single active calendar) and AdminUnifiedSearchResultsView (looped across
// every calendar) so the two search surfaces can never drift out of sync on matching rules.

// Underlined tab bar with count badges, used by both search surfaces to switch between the
// 일정/채팅/태그/정산/메모 result categories.


// Admin-로그-tab-style result row: colorful name/category badge on top, matched content in the
// middle, timestamp on the bottom. Shared by GlobalSearchModal and AdminUnifiedSearchResultsView
// for every category except 태그 (which shows a photo thumbnail instead of a badge+text line).


// Global Search Modal -- searches the active calendar's schedule memos, participant names, and
// chat message text all in one place. Clicking a schedule result opens that date's DateModal;
// clicking a chat result opens the full chat view scrolled to that exact message bubble. Kept
// intentionally simple (substring match, no fuzzy search/indexing) since a single calendar's
// data is small enough that this is instant.


// Admin unified cross-calendar search: keyword input layer-popup. Submitting hands the query
// up to AdminDashboard, which swaps its normal tab content for AdminUnifiedSearchResultsView.


// Admin unified cross-calendar search: full result page, grouped by calendar then by category
// (일정/대화/투표/태그). Reuses the same helper functions/matching rules GlobalSearchModal uses
// per calendar, just looped across every calendar already held in AdminDashboard's memory
// (serverCalendars/messagesMap) instead of a single one.
// Builds the citizen-facing calendar URL that actually shows a given search result's real
// content, so a click can open it in a new tab instead of just linking back to admin state.
// Mirrors the deep-link params App reads on load (date / view=chat&msg=&img= / view=memo).



// Share Modal
const { ShareModal, UserManualOverlay } = uiWrapperAliases;





















function getWeatherIcon(code, size = 16) {
  const c = Number(code);
  if (c === 0) return /*#__PURE__*/React.createElement(SunIcon, { size });
  if ([1, 2, 3].includes(c)) return /*#__PURE__*/React.createElement(CloudIcon, { size });
  if ([45, 48].includes(c)) return /*#__PURE__*/React.createElement(MistIcon, { size });
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(c)) return /*#__PURE__*/React.createElement(CloudRainIcon, { size });
  if ([71, 73, 75, 77, 85, 86].includes(c)) return /*#__PURE__*/React.createElement(SnowflakeIcon, { size });
  if ([95, 96, 99].includes(c)) return /*#__PURE__*/React.createElement(CloudLightningIcon, { size });
  return /*#__PURE__*/React.createElement(SunIcon, { size });
}

const { WeatherBadge, WeatherLocationModal } = uiWrapperAliases;


function translateKoreanToEnglish(query) {
  const clean = query.trim().toLowerCase();
  const mapping = {
    '서울': 'Seoul', '서울특별시': 'Seoul', '서울시': 'Seoul',
    '인천': 'Incheon', '인천광역시': 'Incheon', '인천시': 'Incheon',
    '부산': 'Busan', '부산광역시': 'Busan', '부산시': 'Busan',
    '대구': 'Daegu', '대구광역시': 'Daegu', '대구시': 'Daegu',
    '대전': 'Daejeon', '대전광역시': 'Daejeon', '대전시': 'Daejeon',
    '광주': 'Gwangju', '광주광역시': 'Gwangju', '광주시': 'Gwangju',
    '울산': 'Ulsan', '울산광역시': 'Ulsan', '울산시': 'Ulsan',
    '세종': 'Sejong', '세종시': 'Sejong', '세종특별자치시': 'Sejong',
    '경기도': 'Gyeonggi', '경기': 'Gyeonggi',
    '강원도': 'Gangwon', '강원': 'Gangwon',
    '충청북도': 'Chungcheongbuk', '충북': 'Chungcheongbuk',
    '충청남도': 'Chungcheongnam', '충남': 'Chungcheongnam',
    '전라북도': 'Jeollabuk', '전북': 'Jeollabuk',
    '전라남도': 'Jeollanam', '전남': 'Jeollanam',
    '경상북도': 'Gyeongsangbuk', '경북': 'Gyeongsangbuk',
    '경상남도': 'Gyeongsangnam', '경남': 'Gyeongsangnam',
    '제주': 'Jeju', '제주도': 'Jeju', '제주시': 'Jeju', '서귀포': 'Seogwipo',
    '수원': 'Suwon', '성남': 'Seongnam', '분당': 'Bundang', '용인': 'Yongin',
    '부천': 'Bucheon', '안산': 'Ansan', '화성': 'Hwaseong', '남양주': 'Namyangju',
    '남양주시': 'Namyangju', '안양': 'Anyang', '평택': 'Pyeongtaek',
    '의정부': 'Uijeongbu', '파주': 'Paju', '파주시': 'Paju', '시흥': 'Siheung',
    '김포': 'Gimpo', '광명': 'Gwangmyeong', '군포': 'Gunpo', '오산': 'Osan',
    '이천': 'Icheon', '양주': 'Yangju', '안성': 'Anseong', '구리': 'Guri',
    '포천': 'Pocheon', '의왕': 'Uiwang', '하남': 'Hanam', '여주': 'Yeoju',
    '동두천': 'Dongducheon', '과천': 'Gwacheon',
    '춘천': 'Chuncheon', '원주': 'Wonju', '강릉': 'Gangneung', '동해': 'Donghae',
    '태백': 'Taebaek', '속초': 'Sokcho', '삼척': 'Samcheok',
    '청주': 'Cheongju', '충주': 'Chungju', '제천': 'Jecheon',
    '천안': 'Cheonan', '공주': 'Gongju', '보령': 'Boryeong', '아산': 'Asan',
    '서산': 'Seosan', '논산': 'Nonsan', '계룡': 'Gyeryong', '당진': 'Dangjin',
    '전주': 'Jeonju', '군산': 'Gunsan', '익산': 'Iksan', '정읍': 'Jeongeup',
    '남원': 'Namwon', '김제': 'Gimje',
    '목포': 'Mokpo', '여수': 'Yeosu', '순천': 'Suncheon', '나주': 'Naju',
    '광양': 'Gwangyang',
    '포항': 'Pohang', '경주': 'Gyeongju', '김천': 'Gimcheon', '안동': 'Andong',
    '구미': 'Gumi', '영주': 'Yeongju', '영천': 'Yeongcheon', '상주': 'Sangju',
    '문경': 'Mungyeong', '경산': 'Gyeongsan',
    '창원': 'Changwon', '진주': 'Jinju', '통영': 'Tongyeong', '사천': 'Sacheon',
    '김해': 'Gimhae', '밀양': 'Miryang', '거제': 'Geoje', '양산': 'Yangsan',
    '독도': 'Dokdo', '울릉도': 'Ulleungdo'
  };

  if (mapping[clean]) return mapping[clean];
  if (/[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(query)) {
    return null; // Fallback to Nominatim
  }
  return query;
}






const { MainSideMenu, UpdateAvailableBanner, ImageShareViewer, ImageThumbRemoveButton, InlineSearchBar, MemoShareModal, ChatGalleryModal, MemoView } = uiWrapperAliases;





// Memo Card component for clean grid layout separation


// Activity Log generator function for memos
function createMemoActivityLog(calendarId, action, participantId = '', timestamp = Date.now(), note = '') {
  // toISOString() is UTC, not local time -- a memo logged between midnight and 9am KST would
  // otherwise get attributed to the previous day in the activity log's date field.
  const d = new Date(timestamp);
  const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const participantPart = sanitizeText(participantId || 'system', 120);
  return normalizeActivityLog(calendarId, {
    id: `${calendarId}_memo_${participantPart}_${action}_${timestamp}_${Math.random().toString(36).slice(2, 8)}`,
    calendarId,
    participantId: sanitizeText(participantId || '', 120),
    action,
    note,
    timestamp,
    date: dateStr
  });
}



const { AnniversaryModal, SettlementSummaryModal, PollModal } = uiWrapperAliases;



// Icon helper function for gift












// Shared slide-down search row used by chat / memo / places (and gallery). Visual baseline is
// the places search field: left magnifier, borderless transparent input, optional trailing
// actions (prev/next/close, clear, etc.) stay page-specific.

































































// Shared "remove attached image" button for thumbnail previews (chat composer, memo composer
// new/edit) -- keeps the delete affordance visually identical everywhere a photo can be staged,
// so a style change here applies to every composer instead of drifting between copies.




// Standard 2(+)-way exclusive-choice control: a single bordered rounded-box container (not a
// capsule/pill -- see PlaceRegisterModal 방문/예정) holding each option as its own segment, thin
// divider between segments, selected segment filled with its own color + white text. Each option
// can carry its own activeColor (e.g. green for 수입, red for 지출) instead of defaulting to the
// app's purple accent, so this covers both neutral toggles (방문/예정, 누적보기/일자별보기) and
// semantically-colored ones (수입/지출) with one shared component.


// Shared numeric badge for section-title counts (진행중 투표, 모임 확정, 전원 참석 가능, 갤러리 등) --
// uses currentColor so it automatically tints to whatever accent color the surrounding title sets.








// Custom date+time picker replacing the browser's native <input type="datetime-local"> overlay
// (which renders with its own OS-styled chrome that doesn't follow the app's dark mode) with a
// layer-popup matching the main calendar's year/month picker look and feel.
// Summary List - Displays both "Partial Availability" (N+ members) and "Full Availability" lists





// Default center/zoom for a calendar with no places registered yet -- Seoul City Hall, a
// reasonable default since this app is Korean-audience-only.
const PLACE_MAP_DEFAULT_CENTER = [37.5665, 126.9780];
const PLACE_MAP_DEFAULT_ZOOM = 11;
// Rough bounding box for South+North Korea -- used only to decide which registered places count
// as "domestic" for the main-screen preview map's auto-fit (see preferDomesticBounds below), not
// as a precise border.

const { PlaceMapView, PlacesView, HistoryView, ContentView } = uiWrapperAliases;


// Address/업체명 search (Nominatim, same free geocoder the weather feature already uses as a
// fallback -- chosen as the PRIMARY geocoder here since it supports POI/business search, unlike
// Open-Meteo's city-only geocoder) + memo + category select, used for both creating a new place
// and editing an existing one (editingPlace present).
// Kakao's category_group_code covers 15 fixed groups; only these have an obvious match to this
// app's six place categories (식당/카페/놀이/숙박/쇼핑/기타) -- everything else (학교, 주차장, 지하철역
// 등) falls back to 기타 rather than guessing.
const KAKAO_CATEGORY_GROUP_TO_PLACE_CATEGORY = {
  FD6: 'restaurant', // 음식점
  CE7: 'cafe',        // 카페
  AD5: 'lodging',      // 숙박
  AT4: 'play',         // 관광명소
  MT1: 'shopping'      // 대형마트
};

// Caps how long any single search tier (Kakao/Google Places/Nominatim) is allowed to hang before
// PlaceRegisterModal.handleSearch gives up on it and moves to the next fallback -- googlePlacesSearchProxy
// in particular is a 1st-gen Cloud Function that's called rarely (only when Kakao comes up empty),
// so a cold start there can otherwise stall the whole 3-tier chain far longer than any one search
// step should reasonably take.
async function fetchWithTimeout(url, timeoutMs) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
}

const { PlaceRegisterModal } = uiWrapperAliases;


// Main-screen collapsible map preview -- collapsed shows a short 16:9 map, expanded shows a
// taller 4:3 map (the toggle only resizes the map, it never hides the section like PhotoGallery
// does, since the map itself is the content). "전체보기" sits immediately before the fold arrow,
// both wrapped in one group pushed to the header's right edge.


// Full-page map view -- header follows the same fixed-back-button + centered-title +
// right-action-button convention as MemoView, with "장소등록" as the action button. Body is a
// taller interactive map (marker click opens the register modal pre-filled for editing) plus a
// scrollable place-card list below it, since editing/deleting via Leaflet popup controls isn't
// practical to build or to verify structurally -- the card list is plain React DOM instead.








// Shown only on the main calendar screen -- chat/memo/settlement have a pinned bottom input bar.
const FOOTER_FAMILY_LINKS = [
  { label: '밖에 눈오나', url: 'https://pyw31337.github.io/cctv/', Icon: CctvIcon },
  { label: 'Culture Flow', url: 'https://pyw31337.github.io/culture/', Icon: DicesIcon }
];
// .app-footer/.app-footer-family flip flex-direction at 768px (see app.css): stacked 3 lines
// on mobile, a single copyright-left/FAMILY LINK-right row on desktop.


// Switching between in-app views (main/chat/admin/memo) is a React state change, not a real
// page navigation -- a tab left open for a while (very common on mobile: backgrounded,
// resumed from the home screen, or just never closed) keeps running whatever JS was loaded
// at the LAST actual page load, even though a fresh reload always gets the latest deploy.
// Rather than leave that tab silently stuck on old code (missing something like the direct-
// media-link rendering fix) until the user happens to reload on their own, periodically
// re-check the page's own ETag with a cache-busting HEAD request and prompt a reload once it
// changes -- a forced reload mid-typing would be worse than just asking.





function bindGatherUiDeps() {
  window.GATHER_UI_DEPS = Object.assign({}, window.GATHER_UI_DEPS || {}, {
    verifyAdminPasswordRemote: typeof verifyAdminPasswordRemote === 'function' ? verifyAdminPasswordRemote : null,
    rebuildCalendarToTimestamp: typeof rebuildCalendarToTimestamp === 'function' ? rebuildCalendarToTimestamp : null,
    copyTextToClipboard: typeof copyTextToClipboard === 'function' ? copyTextToClipboard : null,
    getCalendarShareUrl: typeof getCalendarShareUrl === 'function' ? getCalendarShareUrl : null,
    getViewShareUrl: typeof getViewShareUrl === 'function' ? getViewShareUrl : null,
    buildLightboxImageInfo: typeof buildLightboxImageInfo === 'function' ? buildLightboxImageInfo : null,
    getMemoItemShareUrl: typeof getMemoItemShareUrl === 'function' ? getMemoItemShareUrl : null,
    WeatherBadge: typeof WeatherBadge === 'function' ? WeatherBadge : null,
    WeatherLocationModal: typeof WeatherLocationModal === 'function' ? WeatherLocationModal : null,
    ChatGalleryModal: typeof ChatGalleryModal === 'function' ? ChatGalleryModal : null,
    getMessageImageEntries: typeof getMessageImageEntries === 'function' ? getMessageImageEntries : null,
    dateStrToHashtag: typeof dateStrToHashtag === 'function' ? dateStrToHashtag : null,
    getMediaIdentityKeys: typeof getMediaIdentityKeys === 'function' ? getMediaIdentityKeys : null,
    getPhotoAssetCommentKey: typeof getPhotoAssetCommentKey === 'function' ? getPhotoAssetCommentKey : null,
    getPhotoCommentIdentity: typeof getPhotoCommentIdentity === 'function' ? getPhotoCommentIdentity : null,
    getPhotoCommentCount: typeof getPhotoCommentCount === 'function' ? getPhotoCommentCount : null,
    getLegacyMeetingMediaKey: typeof getLegacyMeetingMediaKey === 'function' ? getLegacyMeetingMediaKey : null,
    resolveMeetingPhotoDisplay: typeof resolveMeetingPhotoDisplay === 'function' ? resolveMeetingPhotoDisplay : null,
    MemoView: typeof MemoView === 'function' ? MemoView : null,
    ChatRoomView: typeof ChatRoomView === 'function' ? ChatRoomView : null,
    getPinnedNotices: typeof getPinnedNotices === 'function' ? getPinnedNotices : null,
    getChatLastReadTimestamp: typeof getChatLastReadTimestamp === 'function' ? getChatLastReadTimestamp : null,
    setChatLastReadTimestamp: typeof setChatLastReadTimestamp === 'function' ? setChatLastReadTimestamp : null,
    useTapRevealedMsgId: typeof useTapRevealedMsgId === 'function' ? useTapRevealedMsgId : null,
    useChatSendGuard: typeof useChatSendGuard === 'function' ? useChatSendGuard : null,
    useModalDirtyGuard: typeof useModalDirtyGuard === 'function' ? useModalDirtyGuard : null,
    writeCollectionDocumentWithFallback: typeof writeCollectionDocumentWithFallback === 'function' ? writeCollectionDocumentWithFallback : null,
    appendChatImageFiles: typeof appendChatImageFiles === 'function' ? appendChatImageFiles : null,
    classifyChatComposerFiles: typeof classifyChatComposerFiles === 'function' ? classifyChatComposerFiles : null,
    createPendingChatFileAttachment: typeof createPendingChatFileAttachment === 'function' ? createPendingChatFileAttachment : null,
    formatChatFileSize: typeof formatChatFileSize === 'function' ? formatChatFileSize : null,
    getChatFileTypeLabel: typeof getChatFileTypeLabel === 'function' ? getChatFileTypeLabel : null,
    isPdfAttachment: typeof isPdfAttachment === 'function' ? isPdfAttachment : null,
    collectChatFileAttachmentsFromMessages: typeof collectChatFileAttachmentsFromMessages === 'function' ? collectChatFileAttachmentsFromMessages : null,
    confetti: typeof confetti === 'function' ? confetti : (typeof window !== 'undefined' ? window.confetti : null),
    CONFETTI_Z_INDEX: typeof CONFETTI_Z_INDEX !== 'undefined' ? CONFETTI_Z_INDEX : 9999,
    AdminDashboard: typeof AdminDashboard === 'function' ? AdminDashboard : null,
    DateCapsuleBadge: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.DateCapsuleBadge) || (typeof DateCapsuleBadge === 'function' ? DateCapsuleBadge : null),
    NotepadTextIcon: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.NotepadTextIcon) || (typeof NotepadTextIcon === 'function' ? NotepadTextIcon : null),
    LinkIcon: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.LinkIcon) || (typeof LinkIcon === 'function' ? LinkIcon : null),
    SunIcon: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.SunIcon) || (typeof SunIcon === 'function' ? SunIcon : null),
    CloudIcon: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.CloudIcon) || (typeof CloudIcon === 'function' ? CloudIcon : null),
    MistIcon: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.MistIcon) || (typeof MistIcon === 'function' ? MistIcon : null),
    CloudRainIcon: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.CloudRainIcon) || (typeof CloudRainIcon === 'function' ? CloudRainIcon : null),
    SnowflakeIcon: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.SnowflakeIcon) || (typeof SnowflakeIcon === 'function' ? SnowflakeIcon : null),
    CloudLightningIcon: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.CloudLightningIcon) || (typeof CloudLightningIcon === 'function' ? CloudLightningIcon : null),
    MapCogIcon: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.MapCogIcon) || (typeof MapCogIcon === 'function' ? MapCogIcon : null),
    GiftIcon: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.GiftIcon) || (typeof GiftIcon === 'function' ? GiftIcon : null),
    MoonStarsIcon: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.MoonStarsIcon) || (typeof MoonStarsIcon === 'function' ? MoonStarsIcon : null),
    TextResizeIcon: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.TextResizeIcon) || (typeof TextResizeIcon === 'function' ? TextResizeIcon : null),
    BellIcon: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.BellIcon) || (typeof BellIcon === 'function' ? BellIcon : null),
    WalletIcon: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.WalletIcon) || (typeof WalletIcon === 'function' ? WalletIcon : null),
    MegaphoneIcon: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.MegaphoneIcon) || (typeof MegaphoneIcon === 'function' ? MegaphoneIcon : null),
    CctvIcon: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.CctvIcon) || (typeof CctvIcon === 'function' ? CctvIcon : null),
    DicesIcon: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.DicesIcon) || (typeof DicesIcon === 'function' ? DicesIcon : null),
    AdminLoginGate: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.AdminLoginGate) || (typeof AdminLoginGate === 'function' ? AdminLoginGate : null),
    StickyVideoBox: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.StickyVideoBox) || (typeof StickyVideoBox === 'function' ? StickyVideoBox : null),
    PollVoterSheet: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.PollVoterSheet) || (typeof PollVoterSheet === 'function' ? PollVoterSheet : null),
    OperationProgressOverlay: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.OperationProgressOverlay) || (typeof OperationProgressOverlay === 'function' ? OperationProgressOverlay : null),
    ToggleSwitch: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.ToggleSwitch) || (typeof ToggleSwitch === 'function' ? ToggleSwitch : null),
    Footer: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.Footer) || (typeof Footer === 'function' ? Footer : null),
    AdminModal: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.AdminModal) || (typeof AdminModal === 'function' ? AdminModal : null),
    CalendarExportIcon: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.CalendarExportIcon) || (typeof CalendarExportIcon === 'function' ? CalendarExportIcon : null),
    CalendarSearchIcon: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.CalendarSearchIcon) || (typeof CalendarSearchIcon === 'function' ? CalendarSearchIcon : null),
    DateModal: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.DateModal) || (typeof DateModal === 'function' ? DateModal : null),
    DirectChatMediaText: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.DirectChatMediaText) || (typeof DirectChatMediaText === 'function' ? DirectChatMediaText : null),
    ImageUrlModal: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.ImageUrlModal) || (typeof ImageUrlModal === 'function' ? ImageUrlModal : null),
    LogIcon: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.LogIcon) || (typeof LogIcon === 'function' ? LogIcon : null),
    MenuIcon: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.MenuIcon) || (typeof MenuIcon === 'function' ? MenuIcon : null),
    PlacesSection: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.PlacesSection) || (typeof PlacesSection === 'function' ? PlacesSection : null),
    TikTokEmbedWidget: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.TikTokEmbedWidget) || (typeof TikTokEmbedWidget === 'function' ? TikTokEmbedWidget : null),
    AnniversaryModal: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.AnniversaryModal) || (typeof AnniversaryModal === 'function' ? AnniversaryModal : null),
    BanknoteArrowDownIcon: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.BanknoteArrowDownIcon) || (typeof BanknoteArrowDownIcon === 'function' ? BanknoteArrowDownIcon : null),
    BanknoteArrowUpIcon: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.BanknoteArrowUpIcon) || (typeof BanknoteArrowUpIcon === 'function' ? BanknoteArrowUpIcon : null),
    CalendarCheckIcon: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.CalendarCheckIcon) || (typeof CalendarCheckIcon === 'function' ? CalendarCheckIcon : null),
    CalendarGrid: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.CalendarGrid) || (typeof CalendarGrid === 'function' ? CalendarGrid : null),
    CoinIcon: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.CoinIcon) || (typeof CoinIcon === 'function' ? CoinIcon : null),
    CommentsSection: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.CommentsSection) || (typeof CommentsSection === 'function' ? CommentsSection : null),
    DeadlineDateTimePicker: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.DeadlineDateTimePicker) || (typeof DeadlineDateTimePicker === 'function' ? DeadlineDateTimePicker : null),
    EditMessageModal: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.EditMessageModal) || (typeof EditMessageModal === 'function' ? EditMessageModal : null),
    GlobalSearchModal: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.GlobalSearchModal) || (typeof GlobalSearchModal === 'function' ? GlobalSearchModal : null),
    LinkPreviewCard: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.LinkPreviewCard) || (typeof LinkPreviewCard === 'function' ? LinkPreviewCard : null),
    MessageCommentIcon: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.MessageCommentIcon) || (typeof MessageCommentIcon === 'function' ? MessageCommentIcon : null),
    PiggyBankIcon: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.PiggyBankIcon) || (typeof PiggyBankIcon === 'function' ? PiggyBankIcon : null),
    PollList: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.PollList) || (typeof PollList === 'function' ? PollList : null),
    ResizableModalContainer: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.ResizableModalContainer) || (typeof ResizableModalContainer === 'function' ? ResizableModalContainer : null),
    SearchResultLogRow: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.SearchResultLogRow) || (typeof SearchResultLogRow === 'function' ? SearchResultLogRow : null),
    SettlementSummaryModal: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.SettlementSummaryModal) || (typeof SettlementSummaryModal === 'function' ? SettlementSummaryModal : null),
    CreateSettlementModal: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.CreateSettlementModal) || CreateSettlementModal,
    MemoTagInputRow: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.MemoTagInputRow) || null,
    ClickToPlayVideoCard: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.ClickToPlayVideoCard) || null,
    getCalendarSettlementCards,
    getPlaceKakaoRouteUrl,
    getPlaceNaverRouteUrl,
    getPlaceGoogleRouteUrl,
    fetchSubcollectionCount: typeof fetchSubcollectionCount === 'function' ? fetchSubcollectionCount : null,
    AdminCreateCalendarModal: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.AdminCreateCalendarModal) || (typeof AdminCreateCalendarModal === 'function' ? AdminCreateCalendarModal : null),
    AdminFilledMenuIcon: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.AdminFilledMenuIcon) || (typeof AdminFilledMenuIcon === 'function' ? AdminFilledMenuIcon : null),
    AdminRestorePhraseModal: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.AdminRestorePhraseModal) || (typeof AdminRestorePhraseModal === 'function' ? AdminRestorePhraseModal : null),
    AdminUnifiedSearchModal: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.AdminUnifiedSearchModal) || (typeof AdminUnifiedSearchModal === 'function' ? AdminUnifiedSearchModal : null),
    AdminUnifiedSearchResultsView: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.AdminUnifiedSearchResultsView) || (typeof AdminUnifiedSearchResultsView === 'function' ? AdminUnifiedSearchResultsView : null),
    AlertTriangleIcon: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.AlertTriangleIcon) || (typeof AlertTriangleIcon === 'function' ? AlertTriangleIcon : null),
    CalendarCogIcon: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.CalendarCogIcon) || (typeof CalendarCogIcon === 'function' ? CalendarCogIcon : null),
    ChartBarIcon: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.ChartBarIcon) || (typeof ChartBarIcon === 'function' ? ChartBarIcon : null),
    ChartPieIcon: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.ChartPieIcon) || (typeof ChartPieIcon === 'function' ? ChartPieIcon : null),
    ChatSectionIcon: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.ChatSectionIcon) || (typeof ChatSectionIcon === 'function' ? ChatSectionIcon : null),
    CloudDataConnectionIcon: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.CloudDataConnectionIcon) || (typeof CloudDataConnectionIcon === 'function' ? CloudDataConnectionIcon : null),
    ColorSwatchPicker: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.ColorSwatchPicker) || (typeof ColorSwatchPicker === 'function' ? ColorSwatchPicker : null),
    ConfirmDialog: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.ConfirmDialog) || (typeof ConfirmDialog === 'function' ? ConfirmDialog : null),
    DonutChart: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.DonutChart) || (typeof DonutChart === 'function' ? DonutChart : null),
    ExternalLinkIcon: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.ExternalLinkIcon) || (typeof ExternalLinkIcon === 'function' ? ExternalLinkIcon : null),
    HourglassIcon: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.HourglassIcon) || (typeof HourglassIcon === 'function' ? HourglassIcon : null),
    LockIcon: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.LockIcon) || (typeof LockIcon === 'function' ? LockIcon : null),
    LogoutIcon: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.LogoutIcon) || (typeof LogoutIcon === 'function' ? LogoutIcon : null),
    PodiumIcon: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.PodiumIcon) || (typeof PodiumIcon === 'function' ? PodiumIcon : null),
    PollModal: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.PollModal) || (typeof PollModal === 'function' ? PollModal : null),
    PollSectionIcon: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.PollSectionIcon) || (typeof PollSectionIcon === 'function' ? PollSectionIcon : null),
    RefreshIcon: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.RefreshIcon) || (typeof RefreshIcon === 'function' ? RefreshIcon : null),
    SettingsIcon: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.SettingsIcon) || (typeof SettingsIcon === 'function' ? SettingsIcon : null),
    ShieldCheckIcon: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.ShieldCheckIcon) || (typeof ShieldCheckIcon === 'function' ? ShieldCheckIcon : null),
    KakaoTalkIcon: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.KakaoTalkIcon) || (typeof KakaoTalkIcon === 'function' ? KakaoTalkIcon : null),
    SmallXIcon: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.SmallXIcon) || (typeof SmallXIcon === 'function' ? SmallXIcon : null),
    TrophyIcon: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.TrophyIcon) || (typeof TrophyIcon === 'function' ? TrophyIcon : null),
    MemoCard: typeof MemoCard === 'function' ? MemoCard : null,
    ParticipantPickerButton: typeof ParticipantPickerButton === 'function' ? ParticipantPickerButton : null,
    LinkPreviewProgressOverlay: typeof LinkPreviewProgressOverlay === 'function' ? LinkPreviewProgressOverlay : null,
    EmojiPickerIcon: typeof EmojiPickerIcon === 'function' ? EmojiPickerIcon : null,
    EmojiPickerSheet: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.EmojiPickerSheet) || (typeof EmojiPickerSheet === 'function' ? EmojiPickerSheet : null),
    ImageProcessingOverlay: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.ImageProcessingOverlay) || (typeof ImageProcessingOverlay === 'function' ? ImageProcessingOverlay : null),
    ImageUploadOverlay: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.ImageUploadOverlay) || (typeof ImageUploadOverlay === 'function' ? ImageUploadOverlay : null),
    ImageThumbRemoveButton: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.ImageThumbRemoveButton) || (typeof ImageThumbRemoveButton === 'function' ? ImageThumbRemoveButton : null),
    ChatParticipantSheet: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.ChatParticipantSheet) || (typeof ChatParticipantSheet === 'function' ? ChatParticipantSheet : null),
    MemoShareModal: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.MemoShareModal) || (typeof MemoShareModal === 'function' ? MemoShareModal : null),
    GamifiedConfirmButtonContent: typeof GamifiedConfirmButtonContent === 'function' ? GamifiedConfirmButtonContent : null,
    ItemEditDeleteActions: typeof ItemEditDeleteActions === 'function' ? ItemEditDeleteActions : null,
    LineHeightIcon: typeof LineHeightIcon === 'function' ? LineHeightIcon : null,
    UrlCapsuleBadge: typeof UrlCapsuleBadge === 'function' ? UrlCapsuleBadge : null,
    getActiveParticipants: typeof getActiveParticipants === 'function' ? getActiveParticipants : null,
    renderTextWithUrlBadge: typeof renderTextWithUrlBadge === 'function' ? renderTextWithUrlBadge : null,
    sanitizeText: typeof sanitizeText === 'function' ? sanitizeText : null,
    getMessageDirectMediaEntry: typeof getMessageDirectMediaEntry === 'function' ? getMessageDirectMediaEntry : null,
    extractFirstUrl: typeof extractFirstUrl === 'function' ? extractFirstUrl : null,
    extractAllUrlInfos: typeof extractAllUrlInfos === 'function' ? extractAllUrlInfos : null,
    extractAllUrlInfosLoose: typeof extractAllUrlInfosLoose === 'function' ? extractAllUrlInfosLoose : null,
    extractDirectImageUrls: typeof extractDirectImageUrls === 'function' ? extractDirectImageUrls : null,
    removeFirstUrl: typeof removeFirstUrl === 'function' ? removeFirstUrl : null,
    formatChatHeaderTitle: typeof formatChatHeaderTitle === 'function' ? formatChatHeaderTitle : null,
    PlaceMapView: typeof PlaceMapView === 'function' ? PlaceMapView : null,
    PlacesView: typeof PlacesView === 'function' ? PlacesView : null,
    PlaceRegisterModal: typeof PlaceRegisterModal === 'function' ? PlaceRegisterModal : null,
    AutoGrowTextarea: typeof AutoGrowTextarea === 'function' ? AutoGrowTextarea : null,
    FormAddEditActionButtons: typeof FormAddEditActionButtons === 'function' ? FormAddEditActionButtons : null,
    PlaceSectionIcon: typeof PlaceSectionIcon === 'function' ? PlaceSectionIcon : null,
    SegmentedToggle: typeof SegmentedToggle === 'function' ? SegmentedToggle : null,
    UnderlineTabs: typeof UnderlineTabs === 'function' ? UnderlineTabs : null,
    normalizePlaceDateForSort: typeof normalizePlaceDateForSort === 'function' ? normalizePlaceDateForSort : null,
    autoGrowTextarea: typeof autoGrowTextarea === 'function' ? autoGrowTextarea : null,
    getPlaceCategoryIcon: typeof getPlaceCategoryIcon === 'function' ? getPlaceCategoryIcon : null,
    fetchWithTimeout: typeof fetchWithTimeout === 'function' ? fetchWithTimeout : null,
    firebaseConfig: typeof firebaseConfig !== 'undefined' ? firebaseConfig : null,
    KAKAO_CATEGORY_GROUP_TO_PLACE_CATEGORY: typeof KAKAO_CATEGORY_GROUP_TO_PLACE_CATEGORY !== 'undefined' ? KAKAO_CATEGORY_GROUP_TO_PLACE_CATEGORY : null,
    PlaceCategoryMarkerIcon: typeof PlaceCategoryMarkerIcon === 'function' ? PlaceCategoryMarkerIcon : null,
    InlineSearchBar: typeof InlineSearchBar === 'function' ? InlineSearchBar : null,
    BackArrowIcon: typeof BackArrowIcon === 'function' ? BackArrowIcon : null,
    BuildingIcon: typeof BuildingIcon === 'function' ? BuildingIcon : null,
    PencilIcon: typeof PencilIcon === 'function' ? PencilIcon : null,
    SearchIcon: typeof SearchIcon === 'function' ? SearchIcon : null,
    ThreeLinesIcon: typeof ThreeLinesIcon === 'function' ? ThreeLinesIcon : null,
    getCalendarPlaces: typeof getCalendarPlaces === 'function' ? getCalendarPlaces : null,
    getPlaceCategories: typeof getPlaceCategories === 'function' ? getPlaceCategories : null,
    getPlaceSortDateKey: typeof getPlaceSortDateKey === 'function' ? getPlaceSortDateKey : null,
    extractLeadingMemoDate: typeof extractLeadingMemoDate === 'function' ? extractLeadingMemoDate : null,
    parseVisitEntriesFromMemo: typeof parseVisitEntriesFromMemo === 'function' ? parseVisitEntriesFromMemo : null,
    sortVisitEntriesRecentFirst: typeof sortVisitEntriesRecentFirst === 'function' ? sortVisitEntriesRecentFirst : null,
    parsePlaceMemoEntries: typeof parsePlaceMemoEntries === 'function' ? parsePlaceMemoEntries : null,
    toMemoDateFormat: typeof toMemoDateFormat === 'function' ? toMemoDateFormat : null,
    upsertPlaceMemoEntry: typeof upsertPlaceMemoEntry === 'function' ? upsertPlaceMemoEntry : null,
    removePlaceMemoEntry: typeof removePlaceMemoEntry === 'function' ? removePlaceMemoEntry : null,
    getPlaceMemoEntryForDate: typeof getPlaceMemoEntryForDate === 'function' ? getPlaceMemoEntryForDate : null,
    derivePlaceVisitStatus: typeof derivePlaceVisitStatus === 'function' ? derivePlaceVisitStatus : null,
    countPlaceVisits: typeof countPlaceVisits === 'function' ? countPlaceVisits : null,
    extractKnownParticipantNames: typeof extractKnownParticipantNames === 'function' ? extractKnownParticipantNames : null,
    getPlaceExternalMapUrl: typeof getPlaceExternalMapUrl === 'function' ? getPlaceExternalMapUrl : null,
    loadLeaflet: typeof loadLeaflet === 'function' ? loadLeaflet : null,
    loadLeafletMarkerCluster: typeof loadLeafletMarkerCluster === 'function' ? loadLeafletMarkerCluster : null,
    loadMapLibreLeaflet: typeof loadMapLibreLeaflet === 'function' ? loadMapLibreLeaflet : null,
    buildPlaceMarkerHtml: typeof buildPlaceMarkerHtml === 'function' ? buildPlaceMarkerHtml : null,
    panMapToFitMarkerPopup: typeof panMapToFitMarkerPopup === 'function' ? panMapToFitMarkerPopup : null,
    centerMapOnMarkerAndPopup: typeof centerMapOnMarkerAndPopup === 'function' ? centerMapOnMarkerAndPopup : null,
    PLACE_MAP_DEFAULT_CENTER: typeof PLACE_MAP_DEFAULT_CENTER !== 'undefined' ? PLACE_MAP_DEFAULT_CENTER : null,
    PLACE_MAP_DEFAULT_ZOOM: typeof PLACE_MAP_DEFAULT_ZOOM !== 'undefined' ? PLACE_MAP_DEFAULT_ZOOM : null,
    GalleryIcon: typeof GalleryIcon === 'function' ? GalleryIcon : null,
    Lightbox: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.Lightbox) || (typeof Lightbox === 'function' ? Lightbox : null),
    SectionCountBadge: typeof SectionCountBadge === 'function' ? SectionCountBadge : null,
    SectionToggleButton: typeof SectionToggleButton === 'function' ? SectionToggleButton : null,
    SearchCategoryTabs: typeof SearchCategoryTabs === 'function' ? SearchCategoryTabs : null,
    SimpleBottomSheetPicker: typeof SimpleBottomSheetPicker === 'function' ? SimpleBottomSheetPicker : null,
    PhotoGallery: typeof PhotoGallery === 'function' ? PhotoGallery : null,
    MemoPreviewSection: typeof MemoPreviewSection === 'function' ? MemoPreviewSection : null,
    SummaryList: typeof SummaryList === 'function' ? SummaryList : null,
    getActiveAvailabilities: typeof getActiveAvailabilities === 'function' ? getActiveAvailabilities : null,
    getCalendarPolls: typeof getCalendarPolls === 'function' ? getCalendarPolls : null,
    isSettlementEnabledCalendarId: typeof isSettlementEnabledCalendarId === 'function' ? isSettlementEnabledCalendarId : null,
    computeKoreanHolidaysForYear: typeof computeKoreanHolidaysForYear === 'function' ? computeKoreanHolidaysForYear : null,
    getKoreanSolarTermsForYear: typeof getKoreanSolarTermsForYear === 'function' ? getKoreanSolarTermsForYear : null,
    getTrulyConfirmedMeetings: typeof getTrulyConfirmedMeetings === 'function' ? getTrulyConfirmedMeetings : null,
    getConfirmedMeetings: typeof getConfirmedMeetings === 'function' ? getConfirmedMeetings : null,
    getHolidayNamesForDate: typeof getHolidayNamesForDate === 'function' ? getHolidayNamesForDate : null,
    getAnniversariesForDate: typeof getAnniversariesForDate === 'function' ? getAnniversariesForDate : null,
    renderChatMessageBody: typeof renderChatMessageBody === 'function' ? renderChatMessageBody : null,
    parseTextWithLinks: typeof parseTextWithLinks === 'function' ? parseTextWithLinks : null,
    highlightKeyword: typeof highlightKeyword === 'function' ? highlightKeyword : null,
    highlightTextWithYellowMarker: typeof highlightTextWithYellowMarker === 'function' ? highlightTextWithYellowMarker : null,
    getRecentEmojis: typeof getRecentEmojis === 'function' ? getRecentEmojis : null,
    addRecentEmoji: typeof addRecentEmoji === 'function' ? addRecentEmoji : null,
    fetchLinkPreview: typeof fetchLinkPreview === 'function' ? fetchLinkPreview : null,
    useLinkPreview: typeof useLinkPreview === 'function' ? useLinkPreview : null,
    isDateConfirmedMeeting: typeof isDateConfirmedMeeting === 'function' ? isDateConfirmedMeeting : null,
    calculateDday: typeof calculateDday === 'function' ? calculateDday : null,
    getShortTitleParts: typeof getShortTitleParts === 'function' ? getShortTitleParts : null,
    isEmojiOnlyChatText: typeof isEmojiOnlyChatText === 'function' ? isEmojiOnlyChatText : null,
    twemojiImageUrl: typeof twemojiImageUrl === 'function' ? twemojiImageUrl : null,
    getDirectChatMediaInfo: typeof getDirectChatMediaInfo === 'function' ? getDirectChatMediaInfo : null,
    getDirectMediaTagsForUrl: typeof getDirectMediaTagsForUrl === 'function' ? getDirectMediaTagsForUrl : null,
    getPollOptionVoterIds: typeof getPollOptionVoterIds === 'function' ? getPollOptionVoterIds : null,
    getPollTotalVoteCount: typeof getPollTotalVoteCount === 'function' ? getPollTotalVoteCount : null,
    getCalendarActivityLogs: typeof getCalendarActivityLogs === 'function' ? getCalendarActivityLogs : null,
    getCalendarAccentColor: typeof getCalendarAccentColor === 'function' ? getCalendarAccentColor : null,
    getAnniversaryDisplayColor: typeof getAnniversaryDisplayColor === 'function' ? getAnniversaryDisplayColor : null,
    buildActivityLogsFromAvailabilities: typeof buildActivityLogsFromAvailabilities === 'function' ? buildActivityLogsFromAvailabilities : null,
    buildAdminDashboardMetrics: typeof buildAdminDashboardMetrics === 'function' ? buildAdminDashboardMetrics : null,
    buildFieldChangeNote: typeof buildFieldChangeNote === 'function' ? buildFieldChangeNote : null,
    changeAdminPasswordRemote: typeof changeAdminPasswordRemote === 'function' ? changeAdminPasswordRemote : null,
    clearAdminSession: typeof clearAdminSession === 'function' ? clearAdminSession : null,
    cloneCalendarList: typeof cloneCalendarList === 'function' ? cloneCalendarList : null,
    computeCalendarSearchMatches: typeof computeCalendarSearchMatches === 'function' ? computeCalendarSearchMatches : null,
    createCalendarBackupPayload: typeof createCalendarBackupPayload === 'function' ? createCalendarBackupPayload : null,
    createCalendarDataBackupPayload: typeof createCalendarDataBackupPayload === 'function' ? createCalendarDataBackupPayload : null,
    createDefaultCalendar: typeof createDefaultCalendar === 'function' ? createDefaultCalendar : null,
    createMemoActivityLog: typeof createMemoActivityLog === 'function' ? createMemoActivityLog : null,
    createPollActivityLog: typeof createPollActivityLog === 'function' ? createPollActivityLog : null,
    deleteActivityLogsAfterTimestamp: typeof deleteActivityLogsAfterTimestamp === 'function' ? deleteActivityLogsAfterTimestamp : null,
    deleteAllChatImagesFromStorage: typeof deleteAllChatImagesFromStorage === 'function' ? deleteAllChatImagesFromStorage : null,
    deleteMessageRest: typeof deleteMessageRest === 'function' ? deleteMessageRest : null,
    describeImageProcessingFailures: typeof describeImageProcessingFailures === 'function' ? describeImageProcessingFailures : null,
    doesPlaceMatchDate: typeof doesPlaceMatchDate === 'function' ? doesPlaceMatchDate : null,
    downloadJsonFile: typeof downloadJsonFile === 'function' ? downloadJsonFile : null,
    exportCalendarConfirmedMeetingsToICS: typeof exportCalendarConfirmedMeetingsToICS === 'function' ? exportCalendarConfirmedMeetingsToICS : null,
    extractCalendarsFromBackup: typeof extractCalendarsFromBackup === 'function' ? extractCalendarsFromBackup : null,
    extractCalendarBackupEntries: typeof extractCalendarBackupEntries === 'function' ? extractCalendarBackupEntries : null,
    fetchActivityLogsFromFirestore: typeof fetchActivityLogsFromFirestore === 'function' ? fetchActivityLogsFromFirestore : null,
    fetchChatMessagesRest: typeof fetchChatMessagesRest === 'function' ? fetchChatMessagesRest : null,
    fetchAllChatMessagesRest: typeof fetchAllChatMessagesRest === 'function' ? fetchAllChatMessagesRest : null,
    fetchCalendarSearchIndex: typeof fetchCalendarSearchIndex === 'function' ? fetchCalendarSearchIndex : null,
    fetchImageShareDocument: typeof fetchImageShareDocument === 'function' ? fetchImageShareDocument : null,
    fetchRecentMessagesRest: typeof fetchRecentMessagesRest === 'function' ? fetchRecentMessagesRest : null,
    fetchSingleCalendarWithRest: typeof fetchSingleCalendarWithRest === 'function' ? fetchSingleCalendarWithRest : null,
    formatLogTimestamp: typeof formatLogTimestamp === 'function' ? formatLogTimestamp : null,
    getAdminSearchFilterFromUrl: typeof getAdminSearchFilterFromUrl === 'function' ? getAdminSearchFilterFromUrl : null,
    getAdminSearchQueryFromUrl: typeof getAdminSearchQueryFromUrl === 'function' ? getAdminSearchQueryFromUrl : null,
    getAdminSearchResultTargetUrl: typeof getAdminSearchResultTargetUrl === 'function' ? getAdminSearchResultTargetUrl : null,
    getAdminSelectedCalendarIdFromUrl: typeof getAdminSelectedCalendarIdFromUrl === 'function' ? getAdminSelectedCalendarIdFromUrl : null,
    getAdminSession: typeof getAdminSession === 'function' ? getAdminSession : null,
    getImageFilesFromClipboardEvent: typeof getImageFilesFromClipboardEvent === 'function' ? getImageFilesFromClipboardEvent : null,
    getKnownPlaceParticipantNames: typeof getKnownPlaceParticipantNames === 'function' ? getKnownPlaceParticipantNames : null,
    getPlaceCategoryMarkerContent: typeof getPlaceCategoryMarkerContent === 'function' ? getPlaceCategoryMarkerContent : null,
    getSolarFromLunar: typeof getSolarFromLunar === 'function' ? getSolarFromLunar : null,
    getWeatherIcon: typeof getWeatherIcon === 'function' ? getWeatherIcon : null,
    isAdminRestoreRoute: typeof isAdminRestoreRoute === 'function' ? isAdminRestoreRoute : null,
    listAllCalendarsRemote: typeof listAllCalendarsRemote === 'function' ? listAllCalendarsRemote : null,
    listServerAuditLogsRemote: typeof listServerAuditLogsRemote === 'function' ? listServerAuditLogsRemote : null,
    memePoolUpsertRemote: typeof memePoolUpsertRemote === 'function' ? memePoolUpsertRemote : null,
    memePoolDeleteRemote: typeof memePoolDeleteRemote === 'function' ? memePoolDeleteRemote : null,
    listUntaggedPhotoIndexEntriesRemote: typeof listUntaggedPhotoIndexEntriesRemote === 'function' ? listUntaggedPhotoIndexEntriesRemote : null,
    adminBulkTagPhotosRemote: typeof adminBulkTagPhotosRemote === 'function' ? adminBulkTagPhotosRemote : null,
    listSharedDataPoolRemote: typeof listSharedDataPoolRemote === 'function' ? listSharedDataPoolRemote : null,
    fetchMemePoolRest: typeof fetchMemePoolRest === 'function' ? fetchMemePoolRest : null,
    rebuildPhotoIndexRemote: typeof rebuildPhotoIndexRemote === 'function' ? rebuildPhotoIndexRemote : null,
    mergeCalendarCollections: typeof mergeCalendarCollections === 'function' ? mergeCalendarCollections : null,
    mergePollRecord: typeof mergePollRecord === 'function' ? mergePollRecord : null,
    normalizeCalendarForSave: typeof normalizeCalendarForSave === 'function' ? normalizeCalendarForSave : null,
    normalizePollOptionInput: typeof normalizePollOptionInput === 'function' ? normalizePollOptionInput : null,
    processImageFilesSequentially: typeof processImageFilesSequentially === 'function' ? processImageFilesSequentially : null,
    pushSingleCloudCalendar: typeof pushSingleCloudCalendar === 'function' ? pushSingleCloudCalendar : null,
    readClipboardImageFiles: typeof readClipboardImageFiles === 'function' ? readClipboardImageFiles : null,
    resolveMemoImageBatch: typeof resolveMemoImageBatch === 'function' ? resolveMemoImageBatch : null,
    resolveAnniversaryImageBatch: typeof resolveAnniversaryImageBatch === 'function' ? resolveAnniversaryImageBatch : null,
    sanitizeMemoForFirestore: typeof sanitizeMemoForFirestore === 'function' ? sanitizeMemoForFirestore : null,
    setAdminSession: typeof setAdminSession === 'function' ? setAdminSession : null,
    sha256Hex: typeof sha256Hex === 'function' ? sha256Hex : null,
    subscribeUserToPushWithPermission: typeof subscribeUserToPushWithPermission === 'function' ? subscribeUserToPushWithPermission : null,
    ensurePushSubscriptionHealthy: typeof ensurePushSubscriptionHealthy === 'function' ? ensurePushSubscriptionHealthy : null,
    translateKoreanToEnglish: typeof translateKoreanToEnglish === 'function' ? translateKoreanToEnglish : null,
    unsubscribeUserFromPush: typeof unsubscribeUserFromPush === 'function' ? unsubscribeUserFromPush : null,
    validateCalendarBackupEntries: typeof validateCalendarBackupEntries === 'function' ? validateCalendarBackupEntries : null,
    validateBackupCalendars: typeof validateBackupCalendars === 'function' ? validateBackupCalendars : null,
    restoreCalendarBackupEntries: typeof restoreCalendarBackupEntries === 'function' ? restoreCalendarBackupEntries : null,
    validateCalendarShape: typeof validateCalendarShape === 'function' ? validateCalendarShape : null,
    ADMIN_MESSAGE_LIVE_LIMIT: typeof ADMIN_MESSAGE_LIVE_LIMIT !== 'undefined' ? ADMIN_MESSAGE_LIVE_LIMIT : 50,
    ADMIN_MEMO_LIVE_LIMIT: typeof ADMIN_MEMO_LIVE_LIMIT !== 'undefined' ? ADMIN_MEMO_LIVE_LIMIT : 50,
    FOOTER_FAMILY_LINKS: typeof FOOTER_FAMILY_LINKS !== 'undefined' ? FOOTER_FAMILY_LINKS : []
  });
}
bindGatherUiDeps();

// Icons live in ui-icons.js → GATHER_UI_COMPONENTS. Fill DEPS from COMPONENTS for any *Icon
// still missing (e.g. TrashIcon) so ChatRoomView message actions do not hit React #130.
(function syncIconsFromComponents() {
  const c = window.GATHER_UI_COMPONENTS || {};
  const d = window.GATHER_UI_DEPS || {};
  let changed = false;
  Object.keys(c).forEach((key) => {
    if (!key.endsWith('Icon')) return;
    if (typeof c[key] !== 'function') return;
    if (typeof d[key] === 'function') return;
    d[key] = c[key];
    changed = true;
  });
  if (changed) window.GATHER_UI_DEPS = d;
})();


function __gatherStartApp() {
try {
  const rootElement = document.getElementById('root');
  if (rootElement) {
    // app-main.js can be imported after boot has already completed, while main.jsx also calls
    // this entry point explicitly. Reuse one root instead of calling createRoot twice; the second
    // root attached to the same DOM node caused React #300 during view transitions.
    const root = window.__GATHER_REACT_ROOT__ || (window.__GATHER_REACT_ROOT__ = ReactDOM.createRoot(rootElement));
    const imageShareId = new URLSearchParams(window.location.search).get('image');
    const EB = (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.AppErrorBoundary) || React.Fragment;
    root.render(/*#__PURE__*/React.createElement(EB, null,
      /*#__PURE__*/React.createElement(React.Fragment, null,
        imageShareId
          ? /*#__PURE__*/React.createElement(ImageShareViewer, { shareId: imageShareId })
          : /*#__PURE__*/React.createElement(App, null),
        /*#__PURE__*/React.createElement(UpdateAvailableBanner, null)
      )
    ));
  }
} catch (e) {
  console.error('App render error:', e);
}

}

window.__gatherStartApp = __gatherStartApp;
