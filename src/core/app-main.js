/** P6 ESM adapter for app-main — live assets/app-main.js unchanged */
import './../react-globals.js';
const React = window.React;
const ReactDOM = window.ReactDOM;
if (!React || !ReactDOM || typeof ReactDOM.createRoot !== 'function') {
  throw new Error('[P6] React globals missing before app-main');
}

import {
  PRESET_COLORS,
  DEFAULT_EXPENSE_CATEGORIES,
  EXPENSE_CATEGORY_ICONS,
  normalizeExpenseCategories,
  getExpenseCategories,
  getExpenseCategory,
  getExpenseCategoryIcon,
  getExpenseCategoryLabel,
  extractExpenseTimePrefix,
  INCOME_EXPENSE_CATEGORY,
  isExpenseIncomeEntry,
  getDisplayExpenseCategory,
  clampNumber,
  pad2,
  isDataUrl,
  isHttpUrl,
  DEFAULT_PLACE_CATEGORIES,
  PLACE_CATEGORY_ICONS,
  normalizePlaceCategories,
  getPlaceCategories,
  getPlaceCategoryById,
  getPlaceCategoryIcon,
  getPlaceCategoryLabel,
  KOREA_BBOX,
  isDomesticLatLng,
  normalizePlaceAddressForSave,
  getDisplayPlaceAddress,
  normalizePlaces,
  getCalendarPlaces,
  unionPlaces,
  MEMO_DATE_RE,
  normalizeMemoDateMatch,
  extractLeadingMemoDate,
  parseVisitEntriesFromMemo,
  reformatMemoIntoDateLines,
  sortVisitEntriesRecentFirst,
  parsePlaceMemoEntries,
  serializePlaceMemoEntries,
  toMemoDateFormat,
  upsertPlaceMemoEntry,
  removePlaceMemoEntry,
  getPlaceMemoEntryForDate,
  KNOWN_PLACE_PARTICIPANT_NAME_TAGS,
  getKnownPlaceParticipantNames,
  isHouseholdNameToken,
  extractKnownParticipantNames,
  normalizePlaceDateForSort,
  formatPlaceBadgeDate,
  getPlaceSortDateKey,
  getNaverMapSearchRegionHint,
  getNaverMapPlaceUrl,
  getGoogleMapPlaceUrl,
  getPlaceExternalMapUrl,
  readConfigNumber,
  readConfigObject,
  ENABLE_FIRESTORE_SYNC,
  ENABLE_FIRESTORE_WRITES,
  ENABLE_PLACES_SUBCOLLECTION_MIGRATION,
  PUBLIC_CALENDAR_IDS,
  FIREBASE_LOAD_TIMEOUT_MS,
  FIREBASE_LOAD_MAX_ATTEMPTS,
  MEMOS_PAGE_SIZE,
  FIRESTORE_FREE_LIMITS,
  GITHUB_PAGES_FREE_LIMITS,
  MAX_CHAT_THUMB_BASE64_LENGTH,
  CHAT_LIVE_MESSAGE_LIMIT,
  ADMIN_MESSAGE_LIVE_LIMIT,
  ADMIN_MEMO_LIVE_LIMIT,
  GLOBAL_SEARCH_HISTORY_LIMIT,
  MAX_FIRESTORE_DATA_URL_CHARS,
  sanitizeMessageForFirestore,
  sanitizeMemoForFirestore,
  slimMessageForClient,
  CALENDAR_DOC_SAFE_BYTE_LIMIT,
  ADMIN_SESSION_STORAGE_KEY,
  ADMIN_SESSION_MAX_AGE_MS,
  sha256Hex,
  getAdminSession,
  setAdminSession,
  clearAdminSession,
  callAdminFunction,
  verifyAdminPasswordRemote,
  listAllCalendarsRemote,
  changeAdminPasswordRemote,
  copyTextToClipboard,
  isNotificationSupported,
  requestChatNotificationPermission,
  ensureChatNotificationPermission,
  getChatNotifyPrefKey,
  isChatNotifyEnabledForCalendar,
  setChatNotifyEnabledForCalendar,
  getChatParticipantPrefKey,
  getStoredChatParticipantId,
  setStoredChatParticipantId,
  describePushSubscribeFailure,
  getNotificationDiagnostics,
  classifyPushSubscribeError,
  getBrowserLabelForNotifications,
  getNotificationPermissionHelpSteps,
  isIOSDevice,
  isInstalledStandalonePwa,
  probeNotificationCapability,
  urlBase64ToUint8Array,
  arrayBufferToBase64,
  getSubscriptionHashId,
  subscribeUserToPush,
  ensurePushSubscriptionHealthy,
  subscribeUserToPushWithPermission,
  unsubscribeUserFromPush,
  notifyNewChatMessage,
  notifyMeetingReminder,
  getContrastTextColor,
  formatDateWithDayName,
  formatShortDateWithDayName,
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
  isInternalTestCalendarId,
  isAllowedCalendarId,
  sanitizeText,
  stripUrlEdgePunctuation,
  describeFirebaseWriteError,
  normalizeColorValue,
  isValidDateString,
  parseSharePathFromLocation,
  getCalendarIdFromURL,
  getRawCalendarIdFromURL,
  normalizeCalendarUrlParams,
  getAppBaseUrl,
  getCalendarShareUrl,
  getViewShareUrl,
  getMemoItemShareUrl,
  buildDynamicManifest,
  activeManifestBlobUrl,
  applyDynamicManifest,
  formatRegisteredAt,
  cloneParticipant,
  cloneAvailability,
  cloneActivityLog,
  clonePoll,
  getItemStamp,
  isTombstone,
  normalizeParticipantName,
  getActiveParticipants,
  getActiveAvailabilities,
  getCalendarActivityLogs,
  unionActivityLogs,
  getCalendarPolls,
  getActivePollOptions,
  normalizeDeletedActivityLogIds,
  getDeletedActivityLogIds,
  mergeDeletedActivityLogIds,
  getActivityLogStamp,
  SCHEDULE_ACTIVITY_ACTIONS,
  POLL_ACTIVITY_ACTIONS,
  EXPENSE_ACTIVITY_ACTIONS,
  IMAGE_TAG_ACTIVITY_ACTIONS,
  MEETING_ACTIVITY_ACTIONS,
  MEMO_ACTIVITY_ACTIONS,
  PLACE_ACTIVITY_ACTIONS,
  ACTIVITY_ACTIONS,
  normalizeActivityLog,
  mergeActivityLogs,
  buildFieldChangeNote,
  createActivityLog,
  createPollActivityLog,
  extractFirstUrlInfo,
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
  getMessageDirectMediaEntry,
  formatBytes,
  getDataUrlInfo,
} from './app-domain-helpers.js';
const GATHER_APP_CONSTANTS = window.GATHER_APP_CONSTANTS || {};
const GATHER_APP_UTILS = window.GATHER_APP_UTILS || {};
const GATHER_APP_NOTIFICATIONS = window.GATHER_APP_NOTIFICATIONS || {};


// 입력필드 규칙: 멀티라인 텍스트는 값(로드/입력/붙여넣기)에 맞춰 세로로 자동 확장
function ResizableModalContainer(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.ResizableModalContainer;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function AutoGrowTextarea(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.AutoGrowTextarea;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function FormAddEditActionButtons(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.FormAddEditActionButtons;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function SegmentedToggle(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.SegmentedToggle;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function ItemEditDeleteActions(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.ItemEditDeleteActions;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function GamifiedConfirmButtonContent(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.GamifiedConfirmButtonContent;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function LinkPreviewCard(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.LinkPreviewCard;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function LinkPreviewProgressOverlay(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.LinkPreviewProgressOverlay;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function DeleteConfirmModal(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.DeleteConfirmModal;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function AdminLoginGate(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.AdminLoginGate;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function DonutChart(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.DonutChart;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function ColorSwatchPicker(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.ColorSwatchPicker;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function StickyVideoBox(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.StickyVideoBox;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function PollVoterSheet(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.PollVoterSheet;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function OperationProgressOverlay(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.OperationProgressOverlay;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function ToggleSwitch(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.ToggleSwitch;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function Footer(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.Footer;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}

function SearchResultLogRow(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.SearchResultLogRow;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function TikTokEmbedWidget(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.TikTokEmbedWidget;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function UrlCapsuleBadge(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.UrlCapsuleBadge;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function ParticipantPickerButton(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.ParticipantPickerButton;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function DateCapsuleBadge(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.DateCapsuleBadge;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}




// 입력필드 표시 규칙: 일반 텍스트 / YY.MM.DD 날짜 / URL 분리
function tokenizeRichFieldText(text) {
  const source = String(text || '');
  if (!source.trim()) return [];
  const urlRe = /https?:\/\/[^\s<>"'\]]+/gi;
  const chunks = [];
  let last = 0;
  let match;
  while ((match = urlRe.exec(source)) !== null) {
    if (match.index > last) chunks.push({ type: 'raw', value: source.slice(last, match.index) });
    let href = match[0].replace(/[.,);\]}]+$/g, '');
    chunks.push({ type: 'url', value: href });
    last = match.index + match[0].length;
  }
  if (last < source.length) chunks.push({ type: 'raw', value: source.slice(last) });
  if (chunks.length === 0) chunks.push({ type: 'raw', value: source });

  const tokens = [];
  chunks.forEach(chunk => {
    if (chunk.type === 'url') { tokens.push(chunk); return; }
    const s = chunk.value;
    const dateRe = /(\d{2,4}[./-]\d{1,2}[./-]\d{1,2})/g;
    let dLast = 0, dm;
    while ((dm = dateRe.exec(s)) !== null) {
      if (dm.index > dLast) {
        const piece = s.slice(dLast, dm.index);
        if (piece) tokens.push({ type: 'text', value: piece });
      }
      tokens.push({ type: 'date', value: dm[1] || dm[0] });
      dLast = dm.index + dm[0].length;
    }
    if (dLast < s.length) {
      const piece = s.slice(dLast);
      if (piece) tokens.push({ type: 'text', value: piece });
    }
  });
  return tokens;
}

function renderTextWithUrlBadge(text, options = null) {
  const tokens = tokenizeRichFieldText(text);
  if (tokens.length === 0) return null;
  const stackUrl = !options || options.stackUrl !== false;
  const textRow = [];
  const urlRow = [];
  tokens.forEach((tok, idx) => {
    if (tok.type === 'url') {
      urlRow.push(/*#__PURE__*/React.createElement(UrlCapsuleBadge, {
        key: `u-${idx}-${tok.value}`,
        url: tok.value,
        style: stackUrl ? { alignSelf: 'flex-start' } : { marginLeft: '4px' }
      }));
    } else if (tok.type === 'date') {
      textRow.push(/*#__PURE__*/React.createElement(DateCapsuleBadge, {
        key: `d-${idx}-${tok.value}`,
        date: tok.value,
        style: { marginRight: '4px' }
      }));
    } else {
      const v = tok.value;
      if (!v || !String(v).trim()) return;
      textRow.push(/*#__PURE__*/React.createElement("span", {
        key: `t-${idx}`,
        style: { wordBreak: 'break-word' }
      }, v));
    }
  });
  if (!stackUrl) {
    return /*#__PURE__*/React.createElement("span", {
      style: { display: 'inline-flex', flexWrap: 'wrap', alignItems: 'center', gap: '4px' }
    }, textRow, urlRow);
  }
  if (urlRow.length === 0) {
    if (textRow.length === 0) return null;
    if (textRow.length === 1 && tokens.every(t => t.type === 'text')) return textRow[0];
    return /*#__PURE__*/React.createElement("span", {
      style: { display: 'inline-flex', flexWrap: 'wrap', alignItems: 'center', gap: '4px' }
    }, textRow);
  }
  return /*#__PURE__*/React.createElement("div", {
    style: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px', minWidth: 0 }
  },
    textRow.length > 0 && /*#__PURE__*/React.createElement("span", {
      style: { display: 'inline-flex', flexWrap: 'wrap', alignItems: 'center', gap: '2px', wordBreak: 'break-word' }
    }, textRow),
    /*#__PURE__*/React.createElement("div", {
      style: { display: 'flex', flexDirection: 'column', gap: '4px', maxWidth: '100%' }
    }, urlRow)
  );
}

// Shared add/edit action row: 추가 | (edit) 취소 + 수정 — DateModal 참여자/장소/정산 공통 모듈


import {
  normalizePollOptionInput,
  normalizePollVotes,
  getPollOptionVoterIds,
  getPollTotalVoteCount,
  isPollClosed,
  formatPollDeadline,
  normalizePoll,
  mergePollRecord,
  mergePolls,
  buildActivityLogsFromAvailabilities,
  validateCalendarShape,
  normalizeCalendarForSave,
  assertCalendarLinks,
  mergeParticipantRecord,
  mergeAvailabilityRecord,
  mergeCalendarRecord,
  mergeCalendarAvailabilityDelta,
  mergeCalendarSettingsDelta,
  mergeCalendarPollsDelta,
  cloneCalendar,
  cloneCalendarList,
  mergeCalendarCollections,
  INITIAL_CALENDARS,
  GATHER_LOCAL_CACHE_KEY,
  GATHER_LOCAL_META_KEY,
  __gatherSafeLocalStorage,
  loadLocalCache,
  saveLocalCache,
  isLoadingCalendarShell,
  isUsableCalendarRecord,
  getLoadingCalendarTitle,
  createLoadingCalendarShell,
  bindGatherFirebaseDeps,
  subscribeMessages,
  subscribePlaces,
  subscribeMemos,
  subscribeAnniversaries,
  firebaseConfig,
  firebaseDb,
  __setFirebaseDb,
  firebaseInitError,
  firebaseRetryExhausted,
  firebaseStorage,
  isStorageDisabled,
  lastStorageHealthCheckAt,
  lastStorageHealthOk,
  STORAGE_HEALTH_RECHECK_COOLDOWN_MS,
  checkFirebaseStorageHealth,
  fetchSingleCalendarWithRest,
  fetchRecentMessagesRest,
  fetchChatMessagesRest,
  fetchRecentChatMessages,
  fetchRecentGalleryMessages,
  CHAT_OLDER_PAGE_SIZE,
  MAX_OLDER_CHAT_MESSAGES,
  fetchSubcollectionCount,
  fetchOlderChatMessages,
  fetchMessageOrdinal,
  fetchGalleryPhotoOrdinal,
  fetchGalleryItemCount,
  fetchMemosRest,
  fetchAnniversariesRest,
  sendChatMessageRest,
  deleteMessageRest,
  fetchMessageRest,
  updateMessageRest,
  waitForTimeout,
  fetchSingleCloudCalendar,
  isUsableCloudCalendarPayload,
  getCloudDocCalendar,
  firestoreValueToJs,
  jsToFirestoreValue,
  firestoreDocumentToJs,
  getImageSharePageUrl,
  sanitizeShareIdPart,
  createImageShareDocument,
  fetchImageShareDocument,
  estimateCalendarDocWireBytes,
  stripEmbeddedActivityLogsField,
  writeActivityLogsToFirestore,
  fetchActivityLogsFromFirestore,
  deleteActivityLogsAfterTimestamp,
  stripEmbeddedPlacesField,
  writePlacesToFirestore,
  fetchPlacesFromFirestore,
  stripEmbeddedConfirmedMeetingField,
  writeConfirmedMeetingsToFirestore,
  fetchConfirmedMeetingsFromFirestore,
  isRetryableFirestoreConflict,
  describeUpdateCalendarsFailure,
  getFirestoreRetryDelay,
  pushSingleCalendarWithRest,
  pushSingleCloudCalendar,
  loadLocalMeta,
  saveLocalMeta,
  getMetaLastModified,
  updateMetaLastModified,
  isAdminDashboardRoute,
  isAdminRestoreRoute,
  getAdminSelectedCalendarIdFromUrl,
  getAdminSearchQueryFromUrl,
  getAdminSearchFilterFromUrl,
  createDefaultCalendar,
  getMonthKey,
  estimateFirestoreDocumentSize,
  estimateMonthlyOutboundBytes,
  buildServiceUsageMetrics,
  createCalendarBackupPayload,
  downloadJsonFile,
  downloadTextFile,
  escapeICSText,
  formatICSDateOnly,
  dateStrToHashtag,
  addDaysToDateStr,
  buildICSTimestamp,
  buildCalendarConfirmedMeetingsICS,
  buildConfirmedMeetingDescription,
  exportCalendarConfirmedMeetingsToICS,
  extractCalendarsFromBackup,
  validateBackupCalendars,
  buildAdminDashboardMetrics,
  CALENDAR_ACCENT_PALETTE,
  getCalendarAccentColor
} from './app-firebase-data.js';

/* Small dependency-free donut chart: N segments as SVG stroke-dasharray arcs on a ring. */


function AdminDashboard(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.AdminDashboard;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}


function AdminModal(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.AdminModal;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function AdminUnifiedSearchResultsView(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.AdminUnifiedSearchResultsView;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function AdminCreateCalendarModal(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.AdminCreateCalendarModal;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function AdminRestorePhraseModal(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.AdminRestorePhraseModal;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function AdminUnifiedSearchModal(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.AdminUnifiedSearchModal;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}






function App() {
  normalizeCalendarUrlParams();
  const [calendars, setCalendarsState] = React.useState(() => loadLocalCache());
  const calendarsRef = React.useRef(calendars);
  React.useEffect(() => {
    calendarsRef.current = calendars;
  }, [calendars]);
  const [toast, setToast] = React.useState(null);
  const [operationProgress, setOperationProgress] = React.useState(null);
  const toastTimeoutRef = React.useRef(null);
  const operationTimersRef = React.useRef({ delay: null, interval: null, hide: null });
  const clearOperationTimers = () => {
    const timers = operationTimersRef.current;
    if (timers.delay) clearTimeout(timers.delay);
    if (timers.interval) clearInterval(timers.interval);
    if (timers.hide) clearTimeout(timers.hide);
    operationTimersRef.current = { delay: null, interval: null, hide: null };
  };
  React.useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
      clearOperationTimers();
    };
  }, []);

  const showToast = (message, type = 'info', duration = 3000) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToast({
      message,
      type
    });
    toastTimeoutRef.current = setTimeout(() => {
      setToast(t => t?.message === message ? null : t);
    }, duration);
  };

  const runWithOperationProgress = async ({ title, detail, delay = 1000 } = {}, task) => {
    if (typeof task !== 'function') return undefined;
    const id = `op_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    let shown = false;
    let pct = 12;
    const finishSoon = () => {
      clearOperationTimers();
      if (!shown) return;
      setOperationProgress(prev => prev?.id === id ? { ...prev, pct: 100, detail: '마무리 중입니다...' } : prev);
      operationTimersRef.current.hide = setTimeout(() => {
        setOperationProgress(prev => prev?.id === id ? null : prev);
      }, 350);
    };
    clearOperationTimers();
    operationTimersRef.current.delay = setTimeout(() => {
      shown = true;
      setOperationProgress({ id, title: title || '작업 처리 중...', detail: detail || '서버에 반영하고 있습니다.', pct });
      operationTimersRef.current.interval = setInterval(() => {
        pct = Math.min(92, pct + (pct < 55 ? 9 : pct < 80 ? 5 : 2));
        setOperationProgress(prev => prev?.id === id ? { ...prev, pct } : prev);
      }, 650);
    }, delay);
    try {
      return await task();
    } finally {
      finishSoon();
    }
  };

  React.useEffect(() => {
    const motionQuery = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    const interactiveSelector = [
      'button',
      '.day-cell',
      '.date-item-btn',
      '.poll-card',
      '.poll-option-row',
      '.recent-log-row',
      '.search-result-row',
      '.bottom-sheet-item',
      '.poll-voter-option',
      '[role="button"]'
    ].join(',');

    const handlePointerDown = event => {
      const target = event.target?.closest?.(interactiveSelector);
      if (!target || target.closest('.admin-scope')) return;
      target.classList.add('is-pressing');
      window.setTimeout(() => target.classList.remove('is-pressing'), 170);

      if (motionQuery?.matches || target.matches('input, textarea, select')) return;
      const rect = target.getBoundingClientRect();
      const ripple = document.createElement('span');
      ripple.className = 'motion-ripple';
      ripple.style.setProperty('--ripple-x', `${event.clientX - rect.left}px`);
      ripple.style.setProperty('--ripple-y', `${event.clientY - rect.top}px`);
      target.appendChild(ripple);
      ripple.addEventListener('animationend', () => ripple.remove(), { once: true });
    };

    document.addEventListener('pointerdown', handlePointerDown, { passive: true });
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, []);

  // ---- Generic Confirm Dialog ----
  const [confirmDialog, setConfirmDialog] = React.useState(null);
  const showConfirmDialog = (title, message, onConfirm, showPasswordInput = false) => {
    setConfirmDialog({
      title,
      message,
      onConfirm: () => {
        setConfirmDialog(null);
        onConfirm();
      },
      showPasswordInput
    });
  };

  const isSavingRef = React.useRef(false);
  const serverRevisionRef = React.useRef(loadLocalMeta());
  // Tracks which calendar id the "서버 재연결 중" toast has already been shown for, so a stuck
  // connection that keeps retrying every 3.5s (see runInitialLoad below) only surfaces it once
  // instead of repeating it forever -- the cache-restored screen already told the user the data
  // might be stale, repeating that same toast on every retry tick added noise without new information.
  const reconnectToastShownForRef = React.useRef(null);

  const applyServerCalendars = (serverCalendars, lastModified = Date.now()) => {
    const normalized = cloneCalendarList(serverCalendars).map(normalizeCalendarForSave);
    if (normalized.length === 0) return;
    normalized.forEach((calendar) => {
      serverRevisionRef.current = updateMetaLastModified(serverRevisionRef.current, calendar.id, lastModified);
    });
    setCalendarsState(normalized);
    saveLocalCache(normalized);
    saveLocalMeta(serverRevisionRef.current);
  };

  const updateCalendars = async (nextCalendars, toastMsg = '저장완료', toastType = 'success', targetCalId = activeCalId, saveMode = 'availability', newActivityLogs = []) => {
    let previousCalendars = null;
    try {
      if (!isAllowedCalendarId(targetCalId)) {
        showToast('캘린더 ID 오류', 'error');
        return false;
      }
      const requestedId = getCalendarIdFromURL();
      if (requestedId && requestedId !== targetCalId) {
        showToast('캘린더 불일치', 'error');
        return false;
      }
      const now = Date.now();
      const normalizedCalendars = cloneCalendarList(nextCalendars).map(normalizeCalendarForSave);

      const currentCal = normalizedCalendars.find(c => c.id === targetCalId) || null;
      if (!currentCal) {
        console.warn('Active calendar not found during save:', targetCalId);
        showToast('캘린더 없음', 'error');
        return false;
      }

      isSavingRef.current = true;
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
      }, () => pushSingleCloudCalendar(currentCal, now, 18, normalizedCalendars, saveMode, newActivityLogs));
      if (!saved) {
        console.warn('Cloud save failed for calendar:', currentCal.id);
        if (previousCalendars) setCalendarsState(previousCalendars);
        showToast('저장 실패', 'error');
        return false;
      }

      serverRevisionRef.current = updateMetaLastModified(serverRevisionRef.current, currentCal.id, now);
      saveLocalCache(normalizedCalendars);
      saveLocalMeta(serverRevisionRef.current);
      showToast(toastMsg, toastType, 3000);
      return true;
    } catch (err) {
      console.error('updateCalendars failed:', err);
      if (previousCalendars) setCalendarsState(previousCalendars);
      showToast(describeUpdateCalendarsFailure(err), 'error', 6000);
      return false;
    } finally {
      isSavingRef.current = false;
    }
  };
  const [activeCalId, setActiveCalId] = React.useState(() => {
    const requestedId = getCalendarIdFromURL();
    return requestedId && isAllowedCalendarId(requestedId) ? requestedId : 'kkot';
  });
  const [cloudReloadToken, setCloudReloadToken] = React.useState(0);
  const [currentMonthDate, setCurrentMonthDate] = React.useState(new Date());
  const [selectedDate, setSelectedDate] = React.useState(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  // Lets a Lightbox "이동" action (from handleJumpToMeetingDate) open DateModal straight on
  // its 사진 tab instead of the default 참여자 tab; null everywhere else.
  const [dateModalInitialTab, setDateModalInitialTab] = React.useState(null);
  const [isAdminOpen, setIsAdminOpen] = React.useState(false);
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = React.useState(false);
  const [globalSearchInitialQuery, setGlobalSearchInitialQuery] = React.useState('');

  // Theme, font size, and (below) chat notifications are per-calendar preferences, not
  // per-browser -- someone managing several calendars can want dark mode on one and not
  // another. Storage keys are scoped by activeCalId, and both re-read from that calendar's own
  // key whenever activeCalId changes (handleSelectCalendar switches it without a full page
  // reload, so a plain useState initializer alone wouldn't pick up the new calendar's saved
  // choice).
  //
  // Theme toggle -- mirrors the choice the early <head> theme-init script already applied
  // before first paint, so this state starts in sync with whatever's on <html> rather than
  // flashing to a default and then correcting itself.
  const readThemeForCalendar = (calId) => {
    if (!calId) return 'system';
    try {
      const saved = getLocalStorage().getItem(`gather_theme_preference_${calId}_v1`);
      return saved === 'dark' || saved === 'light' ? saved : 'system';
    } catch (e) {
      return 'system';
    }
  };
  const applyThemeChoice = (choice) => {
    // Always stamp explicit light|dark. Unset data-theme made
    // :root:not([data-theme="light"]) darken side menu only while page stayed light
    // (Samsung Internet / system theme).
    let resolved = choice;
    if (choice !== 'dark' && choice !== 'light') {
      try {
        resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      } catch (_) {
        resolved = 'light';
      }
    }
    document.documentElement.setAttribute('data-theme', resolved);
  };
  const [themeChoice, setThemeChoice] = React.useState(() => {
    if (isAdminDashboardRoute()) return 'light';
    return readThemeForCalendar(activeCalId);
  });
  const toggleTheme = () => {
    if (isAdminDashboardRoute() || !activeCalId) return;
    const isDark = themeChoice === 'dark' || (themeChoice === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    const next = isDark ? 'light' : 'dark';
    getLocalStorage().setItem(`gather_theme_preference_${activeCalId}_v1`, next);
    applyThemeChoice(next);
    setThemeChoice(next);
  };
  const isDarkTheme = !isAdminDashboardRoute() && (themeChoice === 'dark' || (themeChoice === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches));
  const isFirstCalIdRenderRef = React.useRef(true);
  React.useEffect(() => {
    if (isAdminDashboardRoute()) {
      applyThemeChoice('light');
      setThemeChoice('light');
      return;
    }
    const next = readThemeForCalendar(activeCalId);
    applyThemeChoice(next);
    setThemeChoice(next);
    isFirstCalIdRenderRef.current = false;
  }, [activeCalId]);

  React.useEffect(() => {
    if (isAdminDashboardRoute()) return undefined;
    if (themeChoice === 'dark' || themeChoice === 'light') return undefined;
    let mql;
    try {
      mql = window.matchMedia('(prefers-color-scheme: dark)');
    } catch (_) {
      return undefined;
    }
    const onChange = () => applyThemeChoice('system');
    if (mql.addEventListener) mql.addEventListener('change', onChange);
    else if (mql.addListener) mql.addListener(onChange);
    applyThemeChoice('system');
    return () => {
      if (mql.removeEventListener) mql.removeEventListener('change', onChange);
      else if (mql.removeListener) mql.removeListener(onChange);
    };
  }, [themeChoice, activeCalId]);

  // Text-size preference, relative to the browser's own default (100%).
  const readFontScaleForCalendar = (calId) => {
    if (!calId) return 100;
    const calScale = getLocalStorage().getItem(`gather_font_scale_${calId}_v1`);
    if (calScale) return Number(calScale) || 100;
    return 100;
  };
  const [fontScalePercent, setFontScalePercent] = React.useState(() => {
    if (isAdminDashboardRoute()) return 100;
    return readFontScaleForCalendar(activeCalId);
  });
  const skipNextFontWriteRef = React.useRef(false);
  React.useEffect(() => {
    if (isAdminDashboardRoute()) {
      document.documentElement.style.fontSize = '';
      return;
    }
    document.documentElement.style.fontSize = `${fontScalePercent}%`;
    if (skipNextFontWriteRef.current) {
      skipNextFontWriteRef.current = false;
      return;
    }
    if (!activeCalId) return;
    getLocalStorage().setItem(`gather_font_scale_${activeCalId}_v1`, String(fontScalePercent));
  }, [fontScalePercent, activeCalId]);
  React.useEffect(() => {
    if (isAdminDashboardRoute()) {
      document.documentElement.style.fontSize = '';
      setFontScalePercent(100);
      return;
    }
    skipNextFontWriteRef.current = true;
    setFontScalePercent(readFontScaleForCalendar(activeCalId));
  }, [activeCalId]);

  const [mainNotifPermission, setMainNotifPermission] = React.useState(() => (isNotificationSupported() ? Notification.permission : 'unsupported'));
  const [mainChatNotifyEnabled, setMainChatNotifyEnabled] = React.useState(() => isChatNotifyEnabledForCalendar(activeCalId));
  React.useEffect(() => {
    setMainChatNotifyEnabled(isChatNotifyEnabledForCalendar(activeCalId));
    setMainNotifPermission(isNotificationSupported() ? Notification.permission : 'unsupported');
  }, [activeCalId]);

  React.useEffect(() => {
    if (!activeCalId || !firebaseDb) return undefined;
    if (!isChatNotifyEnabledForCalendar(activeCalId)) return undefined;
    let cancelled = false;
    const run = async () => {
      if (cancelled) return;
      if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return;
      let pid = null;
      try {
        pid = ((window.GATHER_APP_NOTIFICATIONS || {}).getStoredChatParticipantId || (() => null))(activeCalId, null);
      } catch (_) {}
      if (!pid) return;
      try { await ensurePushSubscriptionHealthy(activeCalId, pid); } catch (e) { console.warn('push health:', e); }
    };
    run();
    const onVis = () => { if (document.visibilityState === 'visible') run(); };
    document.addEventListener('visibilitychange', onVis);
    window.addEventListener('focus', run);
    const intervalId = setInterval(run, 6 * 60 * 60 * 1000);
    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('focus', run);
      clearInterval(intervalId);
    };
  }, [activeCalId, mainChatNotifyEnabled]);
  const getCurrentChatParticipantId = () => {
    if (chatParticipantIdRef.current) return chatParticipantIdRef.current;
    return ((window.GATHER_APP_NOTIFICATIONS||{}).getStoredChatParticipantId||(()=>undefined))(activeCalId, activeCal);
  };
  const openNotificationHelp = () => {
    setIsNotificationHelpOpen(true);
  };
  const handleMainToggleNotifications = async () => {
    if (!isNotificationSupported()) {
      showToast('알림 미지원 브라우저', 'error');
      openNotificationHelp();
      return;
    }
    if (Notification.permission === 'granted') {
      const next = !mainChatNotifyEnabled;
      if (next) {
        // iOS reports Notification.permission as 'granted' even in a regular (non-installed)
        // Safari/Chrome/Firefox tab, where push can never actually arrive -- probe before
        // trusting that flag, same as the other two chat-notification toggles in this app
        // already do (ChatRoomView/CommentsSection, AdminModal 일반 tab). This one was the odd
        // one out, missing the probe entirely -- which is exactly the side-menu switch most
        // people reach for first, and exactly why "I turned it on but nothing ever arrives"
        // reports kept coming from iPhone/iPad users regardless of what they toggled.
        const capability = await probeNotificationCapability();
        if (!capability.ok) {
          setMainNotifPermission('unsupported');
          openNotificationHelp();
          showToast(capability.reason === 'ios-not-installed' ? 'iOS는 홈 화면에 추가한 앱에서만 채팅알림을 받을 수 있습니다.' : '이 환경에서는 채팅알림을 받을 수 없습니다.', 'error', 6000);
          return;
        }
      }
      setMainChatNotifyEnabled(next);
      setChatNotifyEnabledForCalendar(activeCalId, next);
      if (next) {
        const result = await subscribeUserToPushWithPermission(activeCalId, getCurrentChatParticipantId());
        if (result && !result.ok) {
          setMainChatNotifyEnabled(false);
          setChatNotifyEnabledForCalendar(activeCalId, false);
          if (result.reason === 'permission-not-granted') {
            openNotificationHelp();
          }
          showToast(`푸시 등록 실패: ${describePushSubscribeFailure(result.reason)}`, 'error', 6000);
          console.warn('Main chat notification subscribe failed:', result.reason);
          return;
        }
      } else {
        await unsubscribeUserFromPush(activeCalId);
      }
      showToast(next ? '이 캘린더 채팅 알림 켜짐' : '이 캘린더 채팅 알림 꺼짐', 'success');
      return;
    }
    if (Notification.permission === 'denied') {
      openNotificationHelp();
      showToast('브라우저 설정에서 알림 허용 필요', 'error', 6000);
      return;
    }
    const result = await ensureChatNotificationPermission();
    setMainNotifPermission(result);
    if (result !== 'granted') {
      openNotificationHelp();
      showToast('알림 권한을 허용해야 채팅알림을 받을 수 있습니다.', 'error', 6000);
      return;
    }
    const capability = await probeNotificationCapability();
    if (!capability.ok) {
      setMainNotifPermission('unsupported');
      openNotificationHelp();
      showToast(capability.reason === 'ios-not-installed' ? 'iOS는 홈 화면에 추가한 앱에서만 채팅알림을 받을 수 있습니다.' : '이 브라우저에서는 알림을 표시할 수 없습니다.', 'error', 6000);
      return;
    }
    setChatNotifyEnabledForCalendar(activeCalId, true);
    setMainChatNotifyEnabled(true);
    const subscribeResult = await subscribeUserToPushWithPermission(activeCalId, getCurrentChatParticipantId());
    if (subscribeResult && !subscribeResult.ok) {
      setMainChatNotifyEnabled(false);
      setChatNotifyEnabledForCalendar(activeCalId, false);
      if (subscribeResult.reason === 'permission-not-granted') {
        openNotificationHelp();
      }
      showToast(`푸시 등록 실패: ${describePushSubscribeFailure(subscribeResult.reason)}`, 'error', 6000);
      console.warn('Main chat notification subscribe failed:', subscribeResult.reason);
      return;
    }
    showToast('이 캘린더 채팅 알림 켜짐', 'success');
  };

  const [adminActivityLogs, setAdminActivityLogs] = React.useState([]);
  const [isShareOpen, setIsShareOpen] = React.useState(false);
  const [isChatShareOpen, setIsChatShareOpen] = React.useState(false);
  const [isPlacesShareOpen, setIsPlacesShareOpen] = React.useState(false);
  const [isMainSideMenuOpen, setIsMainSideMenuOpen] = React.useState(false);
  const [isNotificationHelpOpen, setIsNotificationHelpOpen] = React.useState(false);
  const [isPollModalOpen, setIsPollModalOpen] = React.useState(false);
  const [editingPoll, setEditingPoll] = React.useState(null);
  const [voteTarget, setVoteTarget] = React.useState(null);
  const [isGuideOpen, setIsGuideOpen] = React.useState(false);
  const [isAnniversariesOpen, setIsAnniversariesOpen] = React.useState(false);
  const [isInitialDataLoading, setIsInitialDataLoading] = React.useState(() => {
    if (!firebaseDb) return false;
    try {
      const cached = loadLocalCache();
      const hit = Array.isArray(cached) && cached.some(c => c && c.id === activeCalId && c.title && c.title !== '캘린더 불러오는 중...');
      return !hit;
    } catch (_) {
      return true;
    }
  });
  const initialLoadOverlayTimerRef = React.useRef(null);
  const initialLoadOverlayIntervalRef = React.useRef(null);
  React.useEffect(() => {
    if (initialLoadOverlayTimerRef.current) clearTimeout(initialLoadOverlayTimerRef.current);
    if (initialLoadOverlayIntervalRef.current) clearInterval(initialLoadOverlayIntervalRef.current);
    initialLoadOverlayTimerRef.current = null;
    initialLoadOverlayIntervalRef.current = null;
    if (!isInitialDataLoading) {
      setOperationProgress(prev => prev?.id === 'initial-load' ? null : prev);
      return;
    }
    let pct = 22;
    initialLoadOverlayTimerRef.current = setTimeout(() => {
      setOperationProgress({
        id: 'initial-load',
        title: '캘린더 불러오는 중...',
        detail: '최신 데이터를 동기화하고 있습니다.',
        pct
      });
      initialLoadOverlayIntervalRef.current = setInterval(() => {
        pct = Math.min(90, pct + (pct < 50 ? 12 : 5));
        setOperationProgress(prev => prev?.id === 'initial-load' ? { ...prev, pct } : prev);
      }, 400);
    }, 280);
    return () => {
      if (initialLoadOverlayTimerRef.current) clearTimeout(initialLoadOverlayTimerRef.current);
      if (initialLoadOverlayIntervalRef.current) clearInterval(initialLoadOverlayIntervalRef.current);
    };
  }, [isInitialDataLoading, activeCalId]);

  // Main header: fixed full-width bar with a menu row, hides on scroll-down and reappears on
  // scroll-up (same behavior as the chat room header). Refs below are scroll targets for the
  // 일정잡기/투표하기 menu items; mainHeaderRef measures its own height for the scroll offset
  // (so the fixed header doesn't cover the section being scrolled to).
  const [isMainHeaderVisible, setIsMainHeaderVisible] = React.useState(true);
  const mainHeaderRef = React.useRef(null);
  const calendarSectionRef = React.useRef(null);
  const pollsSectionRef = React.useRef(null);
  const [pollsExpandSignal, setPollsExpandSignal] = React.useState(0);
  const lastMainScrollTopRef = React.useRef(0);
  React.useEffect(() => {
    const handleMainScroll = () => {
      const scrollTop = window.scrollY;
      const lastScrollTop = lastMainScrollTopRef.current;
      if (scrollTop < 10) {
        setIsMainHeaderVisible(true);
      } else if (scrollTop > lastScrollTop && scrollTop > 56) {
        setIsMainHeaderVisible(false);
      } else if (scrollTop < lastScrollTop) {
        setIsMainHeaderVisible(true);
      }
      lastMainScrollTopRef.current = scrollTop;
    };
    window.addEventListener('scroll', handleMainScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleMainScroll);
  }, []);
  const scrollToSection = (ref) => {
    if (!ref.current) return;
    const headerHeight = mainHeaderRef.current ? mainHeaderRef.current.offsetHeight : 0;
    const top = ref.current.getBoundingClientRect().top + window.scrollY - headerHeight - 12;
    window.scrollTo({ top, behavior: 'smooth' });
  };
  // Chat-related states
  const [chatMessages, setChatMessages] = React.useState([]);
  const [olderChatMessages, setOlderChatMessages] = React.useState([]);
  const [hasMoreOlderChat, setHasMoreOlderChat] = React.useState(true);
  const [loadingOlderChat, setLoadingOlderChat] = React.useState(false);
  const [totalChatCount, setTotalChatCount] = React.useState(null);
  const [totalMemoCount, setTotalMemoCount] = React.useState(null);
  const [totalGalleryCount, setTotalGalleryCount] = React.useState(null);
  const [galleryPreviewMessages, setGalleryPreviewMessages] = React.useState([]);
  const loadingOlderChatRef = React.useRef(false);
  const allChatMessages = React.useMemo(() => {
    const byId = new Map();
    (olderChatMessages || []).forEach(m => { if (m && m.id) byId.set(m.id, m); });
    (chatMessages || []).forEach(m => { if (m && m.id) byId.set(m.id, m); });
    return Array.from(byId.values()).sort((a, b) => Number(a.timestamp || 0) - Number(b.timestamp || 0));
  }, [olderChatMessages, chatMessages]);
  const recentMessages = React.useMemo(() => allChatMessages.slice(-5).reverse(), [allChatMessages]);
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
          const doc = await firebaseDb.collection('calendars').doc(`cal_${activeCalId}`).collection('memos').doc(memoParam).get();
          if (isMounted && doc.exists) setSharedMemo({ id: doc.id, ...doc.data() });
        } else {
          const res = await fetch(`https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/calendars/cal_${activeCalId}/memos/${memoParam}`);
          if (res.ok && isMounted) setSharedMemo({ id: memoParam, ...firestoreDocumentToJs(await res.json()) });
        }
      } catch (e) {
        console.warn('Failed to fetch shared memo:', e);
      }
    })();
    return () => { isMounted = false; };
  }, [activeCalId, firebaseDb]);
  const [anniversaries, setAnniversaries] = React.useState([]);
  // Live subcollection state for places/confirmedMeeting (see unionPlaces/unionConfirmedMeetings
  // and the effect below) -- unlike activityLogs (only fetched on-demand for the recovery UI),
  // these two feed many always-visible surfaces (calendar grid badges, summary banners, place
  // map, settlement), so they need a live listener merged into activeCal itself, not a
  // fetch-on-open pattern.
  const [placesSubcollection, setPlacesSubcollection] = React.useState([]);
  const [confirmedMeetingsSubcollection, setConfirmedMeetingsSubcollection] = React.useState([]);
  const [chatInput, setChatInput] = React.useState('');
  const [chatParticipantId, setChatParticipantId] = React.useState('');
  const chatParticipantIdRef = React.useRef(chatParticipantId);
  React.useEffect(() => { chatParticipantIdRef.current = chatParticipantId; }, [chatParticipantId]);
  React.useEffect(() => {
    if (!activeCalId || !chatParticipantId) return;
    if (!mainChatNotifyEnabled || mainNotifPermission !== 'granted') return;
    subscribeUserToPush(activeCalId, chatParticipantId).then(result => {
      if (result && !result.ok) {
        console.warn('Main chat notification auto-subscribe skipped:', result.reason);
      }
    });
  }, [activeCalId, chatParticipantId, mainChatNotifyEnabled, mainNotifPermission]);
  const [isChatSheetOpen, setIsChatSheetOpen] = React.useState(false);
  const [isChatSubmitting, setIsChatSubmitting] = React.useState(false);
  const [chatUploadProgress, setChatUploadProgress] = React.useState(null);
  const chatTextareaRef = React.useRef(null);
  const [chatImages, setChatImages] = React.useState([]);
  const [activeLightbox, setActiveLightbox] = React.useState(null); // { urls: string[], index: number } | null
  const [isGalleryOpen, setIsGalleryOpen] = React.useState(false);
  const [placesInitialQuery, setPlacesInitialQuery] = React.useState('');
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
  const [deletingMessage, setDeletingMessage] = React.useState(null); // {id, participantId, text, calId}
  const [editingMessage, setEditingMessage] = React.useState(null); // {id, participantId, text, imageUrl, thumbUrl, calId}

  const getActiveViewFromURL = () => {
    const share = parseSharePathFromLocation();
    if (share && share.view && share.view !== 'calendar') return share.view;
    const params = new URLSearchParams(window.location.search);
    return params.get('view') || 'calendar';
  };
  const [activeView, setActiveView] = React.useState(getActiveViewFromURL);
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
      setActiveView(getActiveViewFromURL());
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

  // The header is now position:fixed (full-bleed), so page content needs top padding equal to
  // its rendered height -- measured (not hardcoded) since it varies by title length/wrapping.
  // The header itself unmounts entirely while activeView is 'chat' (ChatRoomView renders its
  // own tree with no main header), so re-running this on activeView change is required --
  // otherwise the ResizeObserver set up on the first mount keeps watching a detached DOM node
  // after returning from chat, mainHeaderHeight stops tracking the real (remounted) header's
  // height, and body content ends up hidden behind the fixed header.
  const [mainHeaderHeight, setMainHeaderHeight] = React.useState(0);
  React.useEffect(() => {
    if (!mainHeaderRef.current) return;
    const measure = () => {
      if (mainHeaderRef.current) setMainHeaderHeight(mainHeaderRef.current.offsetHeight);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(mainHeaderRef.current);
    return () => ro.disconnect();
  }, [activeView]);

  React.useEffect(() => {
    if (!isMainSideMenuOpen) return;
    const originalOverflow = document.body.style.overflow;
    const originalTouchAction = document.body.style.touchAction;
    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';
    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.touchAction = originalTouchAction;
    };
  }, [isMainSideMenuOpen]);

  // JS fallback for three app.css rules that rely on :has() -- background-scroll lock while any
  // modal/bottom sheet is mounted, the admin screen's forced light-mode override, and its
  // padding reset. :has() is supported by every evergreen browser (Safari 15.4+/Chrome 105+/
  // Firefox 121+) but some outdated embedded webviews still lack it (e.g. an old Android OEM
  // WebView inside KakaoTalk/Naver's in-app browser, both realistic sources of traffic for a
  // Korean link-shared app) -- there, the CSS rules silently do nothing and background scroll
  // stays unlocked / the admin screen stays in dark colors it isn't designed for. A
  // MutationObserver (rather than threading each overlay's own open/close state into this one
  // effect) mirrors the exact same rules for every current and future modal without extra
  // wiring, and only ever touches the DOM when :has() isn't supported at all -- on every modern
  // engine this effect is a no-op and the native CSS rules do all the work, unchanged.
  React.useEffect(() => {
    if (typeof MutationObserver === 'undefined') return undefined;
    if (typeof CSS !== 'undefined' && typeof CSS.supports === 'function' && CSS.supports('selector(:has(*))')) return undefined;

    let overlayLocked = false;
    let savedOverflow = '';
    let adminScopeActive = false;
    let savedBackgroundColor = '';
    let savedBackgroundImage = '';
    let savedColorScheme = '';
    let bodyPaddingReset = false;
    let savedPadding = '';

    const sync = () => {
      // Mirrors: body:has(.modal-overlay, .bottom-sheet-overlay) { overflow: hidden; }
      const hasOverlay = !!document.body.querySelector('.modal-overlay, .bottom-sheet-overlay');
      if (hasOverlay !== overlayLocked) {
        overlayLocked = hasOverlay;
        if (overlayLocked) {
          savedOverflow = document.body.style.overflow;
          document.body.style.overflow = 'hidden';
        } else {
          document.body.style.overflow = savedOverflow;
        }
      }

      const hasAdminScope = !!document.body.querySelector('.admin-scope');
      const hasLoginGate = !!document.body.querySelector('.admin-login-gate');

      // Mirrors: body:has(.admin-scope), body:has(.admin-login-gate) { padding: 0; }
      const shouldResetPadding = hasAdminScope || hasLoginGate;
      if (shouldResetPadding !== bodyPaddingReset) {
        bodyPaddingReset = shouldResetPadding;
        if (bodyPaddingReset) {
          savedPadding = document.body.style.padding;
          document.body.style.padding = '0';
        } else {
          document.body.style.padding = savedPadding;
        }
      }

      // Mirrors: :root[data-theme="dark"] body:has(.admin-scope) { background-color/-image }
      // and :root[data-theme="dark"]:has(.admin-scope) { color-scheme: light }
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      const shouldForceLight = isDark && hasAdminScope;
      if (shouldForceLight !== adminScopeActive) {
        adminScopeActive = shouldForceLight;
        if (adminScopeActive) {
          savedBackgroundColor = document.body.style.backgroundColor;
          savedBackgroundImage = document.body.style.backgroundImage;
          savedColorScheme = document.documentElement.style.colorScheme;
          document.body.style.backgroundColor = '#F8FAFC';
          document.body.style.backgroundImage = 'none';
          document.documentElement.style.colorScheme = 'light';
        } else {
          document.body.style.backgroundColor = savedBackgroundColor;
          document.body.style.backgroundImage = savedBackgroundImage;
          document.documentElement.style.colorScheme = savedColorScheme;
        }
      }
    };

    sync();
    const bodyObserver = new MutationObserver(sync);
    // attributes+attributeFilter:['class'] on top of childList/subtree catches the rarer case of
    // a persistently-mounted element's className toggling (e.g. via a class-list update rather
    // than mount/unmount) in addition to the more common case of the overlay/admin element itself
    // being mounted or removed.
    bodyObserver.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
    const themeObserver = new MutationObserver(sync);
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => {
      bodyObserver.disconnect();
      themeObserver.disconnect();
    };
  }, []);

  // Global visual viewport resize handler to scroll active inputs into view (e.g. CommentsSection)
  React.useEffect(() => {
    if (!window.visualViewport) return;
    const handleResize = () => {
      const active = document.activeElement;
      if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA')) {
        if (active.closest('.chat-room-container')) return; // ChatRoom handles its own viewport height
        setTimeout(() => {
          active.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 150);
      }
    };
    window.visualViewport.addEventListener('resize', handleResize);
    return () => window.visualViewport.removeEventListener('resize', handleResize);
  }, []);

  const changeView = (view) => {
    // No sticky-video promotion needed here anymore -- stickyVideo (once set by actually pressing
    // play in chat, see handleActivateChatVideo) stays active across every view by itself, always
    // floating as PIP (see StickyVideoBox).
    setActiveView(view);
    if (view !== 'chat') {
      setIsMainHeaderVisible(true);
      lastMainScrollTopRef.current = 0;
      requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'auto' }));
    }
    const params = new URLSearchParams(window.location.search);
    const keepId = params.get('id') || params.get('cal');
    params.delete('id');
    params.delete('cal');
    if (keepId) params.set('id', keepId);
    if (view === 'calendar') {
      params.delete('view');
    } else {
      params.set('view', view);
    }
    const qs = params.toString();
    const newUrl = qs ? `${window.location.pathname}?${qs}` : window.location.pathname;
    window.history.pushState({}, '', newUrl);
  };
  if (isAdminDashboardRoute()) {
    return /*#__PURE__*/React.createElement(AdminLoginGate, null,
      /*#__PURE__*/React.createElement(AdminDashboard, {
        initialCalendars: calendars
      })
    );
  }

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

  // Firebase Firestore Real-Time Listener (ISOLATED per activeCalId)
  React.useEffect(() => {
    if (!firebaseDb || !activeCalId) {
      setIsInitialDataLoading(false);
      return;
    }
    let isMounted = true;
    let hasLoadedCloudCalendar = false;
    let unsubscribe = null;
    let retryTimeoutId = null;
    const restoredFromCache = restoreActiveCalendarFromCache();
    const cacheHit = restoredFromCache || (calendarsRef.current || []).some(c => c && c.id === activeCalId && isUsableCalendarRecord(c));
    setIsInitialDataLoading(!cacheHit);

    const applyLoadedCalendar = (cloudCal, cloudLastMod = Date.now(), forceApply = false) => {
      if (!isMounted || !cloudCal || cloudCal.id !== activeCalId) return false;
      if (!forceApply && cloudLastMod < getMetaLastModified(serverRevisionRef.current, activeCalId)) return false;
      hasLoadedCloudCalendar = true;
      setIsInitialDataLoading(false);
      setCalendarsState(prevCals => {
        const hasExisting = prevCals.some(c => c.id === activeCalId);
        const nextCals = hasExisting
          ? prevCals.map(c => c.id === activeCalId ? cloneCalendar(cloudCal) : c)
          : [cloneCalendar(cloudCal), ...prevCals];
        saveLocalCache(nextCals);
        const targetMod = Math.max(cloudLastMod || 0, Date.now());
        serverRevisionRef.current = updateMetaLastModified(serverRevisionRef.current, activeCalId, targetMod);
        saveLocalMeta(serverRevisionRef.current);
        return nextCals;
      });
      return true;
    };

    const runInitialLoad = async () => {
      // cacheHit means we already have a usable calendar record on screen (from cache or state)
      // when this effect started -- runInitialLoad still runs in that case as a background
      // refresh (see the fallbackTimeoutId branch below), most often right after the module-level
      // visibilitychange handler force-cycles disableNetwork/enableNetwork on returning from a
      // long background stint (see VISIBILITY_RECONNECT_THRESHOLD_MS), which can leave the
      // onSnapshot listener briefly slow to redeliver. That's a routine reconnect the user already
      // has working data for, not a "no data at all" emergency -- showing "N차 재시도 중" /
      // "데이터 로딩 지연" toasts for it just alarms the user over something that resolves itself,
      // sometimes repeatedly on every background/foreground cycle. Only escalate to the user when
      // there was NO usable data to fall back on to begin with.
      for (let attempt = 1; attempt <= FIREBASE_LOAD_MAX_ATTEMPTS && isMounted && !hasLoadedCloudCalendar; attempt += 1) {
        const result = await fetchSingleCloudCalendar(activeCalId, 1, FIREBASE_LOAD_TIMEOUT_MS);
        if (result?.calendar && applyLoadedCalendar(result.calendar, result.lastModified || Date.now())) {
          if (attempt > 1 && !cacheHit) showToast('다시 불러옴', 'success', 3000);
          reconnectToastShownForRef.current = null;
          return;
        }
        if (attempt < FIREBASE_LOAD_MAX_ATTEMPTS && isMounted && !hasLoadedCloudCalendar && !cacheHit) {
          showToast(`${attempt + 1}차 재시도 중`, 'info', 3000);
        }
      }
      if (isMounted && !hasLoadedCloudCalendar) {
        const restored = restoreActiveCalendarFromCache();
        if (restored) {
          setIsInitialDataLoading(false);
          if (!cacheHit && reconnectToastShownForRef.current !== activeCalId) {
            reconnectToastShownForRef.current = activeCalId;
            showToast('서버 재연결 중', 'info', 4000);
          }
        } else {
          setIsInitialDataLoading(true);
          if (!cacheHit) showToast('데이터 로딩 지연, 재시도 중', 'error', 5000);
        }
        retryTimeoutId = setTimeout(() => {
          if (isMounted) setCloudReloadToken(token => token + 1);
        }, 3500);
      }
    };

    unsubscribe = firebaseDb.collection('calendars').doc(`cal_${activeCalId}`).onSnapshot(doc => {
      const result = getCloudDocCalendar(doc, activeCalId);
      if (result && !isSavingRef.current) {
        applyLoadedCalendar(result.calendar, result.lastModified || Date.now());
      }
    }, err => {
      console.warn(`Firestore realtime sync notice for cal_${activeCalId}:`, err);
      if (isMounted) {
        restoreActiveCalendarFromCache();
        setIsInitialDataLoading(false);
        retryTimeoutId = setTimeout(() => {
          if (isMounted) setCloudReloadToken(token => token + 1);
        }, 2500);
      }
    });

    // The onSnapshot listener above already delivers the initial load (from cache first, then
    // server) the vast majority of the time, so firing runInitialLoad's separate get()+retry
    // path immediately as well would just duplicate that same request. Give onSnapshot a head
    // start and only fall back to the explicit fetch/retry loop if it hasn't come through yet --
    // this keeps the retry safety net for a genuinely stuck listener without doubling up network
    // calls on every normal calendar open.
    // Cache miss: fetch in parallel with onSnapshot (no artificial delay).
    let fallbackTimeoutId = null;
    if (!cacheHit) {
      runInitialLoad();
    } else {
      fallbackTimeoutId = setTimeout(() => {
        if (isMounted && !hasLoadedCloudCalendar) runInitialLoad();
      }, 1500);
    }

    return () => {
      isMounted = false;
      if (fallbackTimeoutId) clearTimeout(fallbackTimeoutId);
      if (retryTimeoutId) clearTimeout(retryTimeoutId);
      if (unsubscribe) unsubscribe();
    };
  }, [activeCalId, cloudReloadToken, restoreActiveCalendarFromCache]);

  React.useEffect(() => {
    if (firebaseDb) return;
    // Firing this immediately on the first failed attempt was itself the bug: a live report
    // showed real-time chat sync working perfectly (a message sent from a phone appeared
    // instantly on a PC browser) at the exact moment this toast was on screen saying "연결
    // 오류" -- the background retry (app-firebase-data.js) had already quietly recovered
    // firebaseDb by then, but this effect only ever checked its value once, at mount, so the
    // toast kept reporting a failure that was no longer true. Poll instead: skip the toast
    // entirely if firebaseDb resolves shortly after, and only show it once
    // firebaseRetryExhausted is actually true (every retry genuinely gave up, ~10 minutes) --
    // that is a real, final failure worth interrupting the user for.
    if (firebaseRetryExhausted) {
      const detail = firebaseInitError ? ` (${firebaseInitError})` : ' (원인 미상)';
      showToast(`연결 오류${detail}`, 'error', 15000);
      return;
    }
    let cancelled = false;
    const pollId = setInterval(() => {
      if (cancelled || firebaseDb) { clearInterval(pollId); return; }
      if (firebaseRetryExhausted) {
        clearInterval(pollId);
        const detail = firebaseInitError ? ` (${firebaseInitError})` : ' (원인 미상)';
        showToast(`연결 오류${detail}`, 'error', 15000);
      }
    }, 2000);
    return () => { cancelled = true; clearInterval(pollId); };
  }, []);
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
  React.useEffect(() => {
    if (!firebaseDb || !activeCalId) return undefined;
    let lastRefreshAt = 0;
    const refreshFromResume = async () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return;
      const now = Date.now();
      if (now - lastRefreshAt < 1200) return;
      lastRefreshAt = now;
      if (activeCalId && isAllowedCalendarId(activeCalId)) {
        try {
          const fresh = await fetchSingleCalendarWithRest(activeCalId, 5000);
          if (fresh?.calendar && applyLoadedCalendar(fresh.calendar, fresh.lastModified || Date.now(), true)) {
            if (activeView === 'calendar' || activeView === 'places' || activeView === 'settlement') {
              fetchPlacesFromFirestore(activeCalId).then(list => { if (isMounted) setPlacesSubcollection(list); }).catch(() => {});
              fetchConfirmedMeetingsFromFirestore(activeCalId).then(list => { if (isMounted) setConfirmedMeetingsSubcollection(list); }).catch(() => {});
            }
            if (activeView === 'memo') {
              fetchMemosRest(activeCalId, memosLimit).then(list => {
                if (isMounted) {
                  setMemos(list);
                  setHasMoreMemos(list.length >= memosLimit);
                }
              }).catch(() => {});
            }
            return;
          }
        } catch (e) {
          console.warn('refreshFromResume REST fetch notice:', e);
        }
      }
      if (!activeCalLoaded) {
        const restored = restoreActiveCalendarFromCache();
        if (!restored) {
          setIsInitialDataLoading(true);
        }
        setCloudReloadToken(token => token + 1);
      }
    };
    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        setTimeout(refreshFromResume, 200);
      }
    };
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', refreshFromResume);
    window.addEventListener('online', refreshFromResume);
    window.addEventListener('pageshow', refreshFromResume);
    return () => {
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', refreshFromResume);
      window.removeEventListener('online', refreshFromResume);
      window.removeEventListener('pageshow', refreshFromResume);
    };
  }, [activeCalId, activeCalLoaded, restoreActiveCalendarFromCache]);
  // The chat message listener below only re-subscribes on [activeCalId], so without this ref it
  // would keep using the activeCal snapshot from whenever that effect last ran -- meaning a
  // participant added (or the calendar renamed) mid-session wouldn't be reflected in incoming
  // chat notifications (sender shows "알수없음", title stays the old name) until activeCalId
  // itself changes. Mirrors the chatParticipantIdRef pattern used the same way above.
  const activeCalRef = React.useRef(activeCal);
  React.useEffect(() => { activeCalRef.current = activeCal; }, [activeCal]);
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

  // Local meeting reminder: on D-day or D-1 of a confirmed meeting, nudge once per day the app
  // happens to be opened (no backend push exists here -- see notifyMeetingReminder's own note).
  React.useEffect(() => {
    if (!activeCalLoaded || !activeCal) return;
    const meetings = getTrulyConfirmedMeetings(activeCal);
    if (meetings.length === 0) return;
    const now = new Date();
    const toDateStr = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const todayStr = toDateStr(now);
    const tomorrowStr = toDateStr(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1));
    const todayMeeting = meetings.find(m => m.date === todayStr);
    const tomorrowMeeting = meetings.find(m => m.date === tomorrowStr);
    const target = todayMeeting ? { meeting: todayMeeting, whenLabel: '오늘' } : tomorrowMeeting ? { meeting: tomorrowMeeting, whenLabel: '내일' } : null;
    if (!target) return;
    const shownKey = `gather_meeting_reminder_shown_${activeCal.id}_${target.meeting.date}_${todayStr}_v1`;
    if (getLocalStorage().getItem(shownKey)) return;
    getLocalStorage().setItem(shownKey, '1');
    const fallbackMessage = notifyMeetingReminder(activeCal, target.meeting, target.whenLabel);
    if (fallbackMessage) showToast(fallbackMessage, 'success');
  }, [activeCal?.id, activeCalLoaded, activeCal?.confirmedMeeting]);

  // Synchronize chatParticipantId when activeCal changes (loads cached participant or defaults to first active)
  React.useEffect(() => {
    if (activeCal) {
      setChatParticipantId(((window.GATHER_APP_NOTIFICATIONS||{}).getStoredChatParticipantId||(()=>undefined))(activeCalId, activeCal));
    }
  }, [activeCalId, calendars]);

  // Real-time messages listener
  // Full window on chat/gallery; compact window elsewhere (main CommentsSection only needs ~5).
  React.useEffect(() => {
    if (!activeCalId) {
      setChatMessages([]);
      return;
    }
    const chatLimit = (activeView === 'chat' || activeView === 'gallery')
      ? CHAT_LIVE_MESSAGE_LIMIT
      : Math.min(10, CHAT_LIVE_MESSAGE_LIMIT);
    if (!firebaseDb) {
      fetchChatMessagesRest(activeCalId).then(list => setChatMessages(list.slice(-chatLimit)));
      return;
    }
    let isMounted = true;

    // Subscribe to chat room history. Queried newest-first + limit so the window
    // tracks the most recent messages as new ones arrive, then reversed back to
    // ascending order for rendering.
    let hasSeenInitialChatSnapshot = false;
    let lastNotifiedMessageId = null;
    const unsubscribeChat = subscribeMessages(activeCalId, { orderBy: 'timestamp', direction: 'desc', limit: chatLimit }, snapshot => {
        if (!isMounted) return;
        const list = [];
        snapshot.forEach(doc => {
          list.push(slimMessageForClient({ id: doc.id, ...doc.data() }));
        });
        list.reverse();
        setChatMessages(list);

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
        fetchChatMessagesRest(activeCalId).then(list => {
          if (isMounted) setChatMessages(list);
        });
      });

    return () => {
      isMounted = false;
      if (unsubscribeChat) unsubscribeChat();
    };
  }, [activeCalId, activeView, firebaseDb]);

  // Anniversaries: only while calendar view needs them
  React.useEffect(() => {
    if (!activeCalId || !firebaseDb) return;
    if (activeView !== 'calendar') return;
    let isMounted = true;
    const unsub = subscribeAnniversaries(activeCalId, snapshot => {
        if (!isMounted) return;
        const list = [];
        snapshot.forEach(doc => list.push({ id: doc.id, ...doc.data() }));
        setAnniversaries(list);
      }, err => {
        console.warn(`Firestore anniversaries subscription error:`, err);
        fetchAnniversariesRest(activeCalId).then(list => {
          if (isMounted) setAnniversaries(list);
        });
      });
    return () => { isMounted = false; unsub(); };
  }, [activeCalId, activeView, firebaseDb]);

  // Places + confirmed meetings: calendar / places / settlement only
  React.useEffect(() => {
    if (!activeCalId || !firebaseDb) return;
    if (activeView !== 'calendar' && activeView !== 'places' && activeView !== 'settlement') return;
    let isMounted = true;
    const unsubPlaces = subscribePlaces(activeCalId, snapshot => {
        if (!isMounted) return;
        const list = [];
        snapshot.forEach(doc => list.push(doc.data()));
        setPlacesSubcollection(list);
      }, err => {
        console.warn(`Firestore places subscription error:`, err);
        fetchPlacesFromFirestore(activeCalId).then(list => {
          if (isMounted) setPlacesSubcollection(list);
        });
      });
    const unsubMeetings = firebaseDb.collection('calendars').doc(`cal_${activeCalId}`).collection('confirmedMeetings')
      .onSnapshot(snapshot => {
        if (!isMounted) return;
        const list = [];
        snapshot.forEach(doc => list.push(doc.data()));
        setConfirmedMeetingsSubcollection(list);
      }, err => {
        console.warn(`Firestore confirmedMeetings subscription error:`, err);
        fetchConfirmedMeetingsFromFirestore(activeCalId).then(list => {
          if (isMounted) setConfirmedMeetingsSubcollection(list);
        });
      });
    return () => {
      isMounted = false;
      unsubPlaces();
      unsubMeetings();
    };
  }, [activeCalId, activeView, firebaseDb]);

  // Memos: paginated newest-first load (rather than subscribing to the entire collection at
  // once, which would download/re-sync thousands of memos on every open as a calendar grows).
  // Pinned memos are fetched separately and unbounded -- pinning is a deliberate, self-limiting
  // action, and keeping it a separate always-live query means an old pinned memo can never
  // silently fall out of view just because it's outside the paginated recent window.
  React.useEffect(() => {
    setMemosLimit(MEMOS_PAGE_SIZE);
  }, [activeCalId]);

  React.useEffect(() => {
    if (!activeCalId) {
      setMemos([]);
      setHasMoreMemos(false);
      return;
    }
    // Memos only while memo view is open
    if (activeView !== 'memo') {
      return;
    }
    if (!firebaseDb) {
      fetchMemosRest(activeCalId, memosLimit).then(list => {
        setMemos(list);
        setHasMoreMemos(list.length >= memosLimit);
      });
      return;
    }
    let isMounted = true;
    let pinnedList = [];
    let recentList = [];
    const applyMerged = () => {
      const byId = new Map();
      pinnedList.forEach(m => byId.set(m.id, m));
      recentList.forEach(m => byId.set(m.id, m));
      setMemos(Array.from(byId.values()).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)));
    };

    const unsubscribePinned = subscribeMemos(activeCalId, { where: ['isPinned', '==', true] }, snapshot => {
        if (!isMounted) return;
        pinnedList = [];
        snapshot.forEach(doc => pinnedList.push({ id: doc.id, ...doc.data() }));
        applyMerged();
      }, err => {
        console.warn(`Firestore pinned memos subscription error:`, err);
      });

    const unsubscribeRecent = subscribeMemos(activeCalId, { orderBy: 'createdAt', direction: 'desc', limit: memosLimit }, snapshot => {
        if (!isMounted) return;
        recentList = [];
        snapshot.forEach(doc => recentList.push({ id: doc.id, ...doc.data() }));
        setHasMoreMemos(recentList.length >= memosLimit);
        applyMerged();
      }, err => {
        console.warn(`Firestore memos subscription error:`, err);
        fetchMemosRest(activeCalId, memosLimit).then(list => {
          if (!isMounted) return;
          recentList = list;
          setHasMoreMemos(list.length >= memosLimit);
          applyMerged();
        });
      });

    return () => {
      isMounted = false;
      unsubscribePinned();
      unsubscribeRecent();
    };
  }, [activeCalId, memosLimit, activeView, firebaseDb]);

  // Dynamic body padding override for full-screen subviews (chat, settlement, memo)
  React.useEffect(() => {
    if (activeView === 'memo' || activeView === 'chat' || activeView === 'settlement') {
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
          meta: entries.map(e => ({ timestamp: msg.timestamp, messageId: msg.id, imageIndex: e.imageIndex, thumb: e.thumb, tags: e.tags, source: e.source, uploadSource: e.uploadSource })),
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
    // These counts/migration scan are non-essential background work -- deferred until the
    // initial calendar document has actually finished loading (isInitialDataLoading false) so
    // they queue up behind the one fetch that matters on a cold start instead of racing it. A
    // burst of count()/paginated get() calls firing on the very same tick as the critical
    // calendar-doc fetch was starving that fetch of its 8s timeout budget, which is what made
    // the "서버 재연결 중" toast show up so often on first load / deep-link entry.
    if (!activeCalId || isInitialDataLoading) return;
    let cancelled = false;
    (async () => {
      const [msgCount, memoCount, galCount] = await Promise.all([
        fetchSubcollectionCount(activeCalId, 'messages'),
        fetchSubcollectionCount(activeCalId, 'memos'),
        fetchGalleryItemCount(activeCalId)
      ]);
      if (cancelled) return;
      if (msgCount != null) setTotalChatCount(msgCount);
      if (memoCount != null) setTotalMemoCount(memoCount);
      if (galCount != null) setTotalGalleryCount(galCount);
      try {
        if (!window.__gatherB64MigDone) window.__gatherB64MigDone = Object.create(null);
        if (!window.__gatherB64MigDone[activeCalId]) {
          const result = await migrateBase64ChatImagesForCalendar(activeCalId, { maxMessages: 20 });
          if (!cancelled && result && (result.failed || 0) === 0) window.__gatherB64MigDone[activeCalId] = true;
          if (result && result.migrated > 0) console.info('base64→Storage migrated', activeCalId, result);
        }
      } catch (e) { console.warn('base64 migration skipped', e); }
    })();
    return () => { cancelled = true; };
  }, [activeCalId, isInitialDataLoading]);

  React.useEffect(() => {
    // Same reasoning as above -- wait for the initial calendar document load to finish before
    // spending a paginated Firestore scan on gallery-preview thumbnails.
    if (!activeCalId || activeView !== 'calendar' || isInitialDataLoading) return;
    let cancelled = false;
    (async () => {
      // Keeps paging through history until at least 12 photos have been found (matching the
      // widget's own 12-thumbnail cap below), instead of grabbing the newest 60 messages
      // regardless of content -- a text-heavy recent stretch of chat used to starve the main
      // screen's gallery widget of thumbnails even when far more photos existed further back.
      const list = await fetchRecentGalleryMessages(activeCalId, 12);
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
    const oldest = allChatMessages[0];
    const beforeTs = oldest && oldest.timestamp;
    if (!beforeTs) return;
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
  // "Latest ref" mirrors for handleJumpToChatMessage's retry loop below -- that loop runs
  // across several ticks via setTimeout, outside any single render's closures, so it reads
  // these refs (updated fresh every render) instead of the plain consts above, which would
  // otherwise stay frozen at whatever hasMoreOlderChat/loadOlderChatMessages was when the loop
  // started.
  const loadOlderChatMessagesRef = React.useRef(loadOlderChatMessages);
  loadOlderChatMessagesRef.current = loadOlderChatMessages;
  const hasMoreOlderChatRef = React.useRef(hasMoreOlderChat);
  hasMoreOlderChatRef.current = hasMoreOlderChat;

  // A single chat message can be locally cached in up to three independent snapshots at once --
  // `chatMessages` (the live recent window), `olderChatMessages` (manually paginated-in older
  // history), and `galleryPreviewMessages` (a one-time fetch for the main-screen gallery widget).
  // Every per-message mutation (tag save, photo delete/replace, share-URL caching) MUST patch all
  // three, or whichever snapshot wasn't touched keeps showing stale data (e.g. a tag saved from
  // the main-screen gallery widget's Lightbox wouldn't show up when the same photo is reopened
  // from the 갤러리 page, since that page reads from a different one of these three arrays).
  const patchLocalChatMessage = (messageId, patch) => {
    const patchMessage = msg => msg.id === messageId ? { ...msg, ...patch } : msg;
    setChatMessages(prev => prev.map(patchMessage));
    setOlderChatMessages(prev => prev.map(patchMessage));
    setGalleryPreviewMessages(prev => prev.map(patchMessage));
  };
  const removeLocalChatMessage = messageId => {
    const dropMessage = prev => prev.filter(m => m.id !== messageId);
    setChatMessages(dropMessage);
    setOlderChatMessages(dropMessage);
    setGalleryPreviewMessages(dropMessage);
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
    const hasComposerDraft = !!(String(chatInput || '').trim() || (chatImages && chatImages.length > 0));
    const scrollTop = e.target.scrollTop;
    if (scrollTop < 120 && hasMoreOlderChat && !loadingOlderChatRef.current) {
      loadOlderChatMessages();
    }
    if (isKeyboardOpenRef.current || chatInputFocused || hasComposerDraft) {
      setIsHeaderVisible(true);
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
    if (!chatParticipantId) {
      showToast('참여자를 선택해 주세요.', 'error');
      return;
    }
    if (!hasText && imageCount === 0) {
      showToast('메시지 내용 또는 사진을 입력해 주세요.', 'error');
      return;
    }
    setIsChatSubmitting(true);
    setChatUploadProgress({
      pct: 3,
      remainingSec: null,
      label: imageCount > 0 ? '채팅 준비 중...' : '채팅 전송 준비 중...',
      current: imageCount > 0 ? 1 : undefined,
      total: imageCount > 0 ? imageCount : undefined
    });

    try {
      let linkPreview = null;
      if (hasText) {
        const url = extractFirstUrl(chatInput);
        if (url && shouldFetchLinkPreviewForChatUrl(url)) {
          setChatUploadProgress({
            pct: 8,
            remainingSec: 5,
            label: '링크 미리보기 생성 중...',
            current: imageCount > 0 ? 1 : undefined,
            total: imageCount > 0 ? imageCount : undefined
          });
          const startTime = Date.now();
          const targetDuration = 5000;
          const pInterval = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const displayPercent = Math.min(84, 8 + Math.round(76 * (1 - Math.exp(-elapsed / 2200))));
            const remaining = Math.max(1, Math.round((targetDuration - elapsed) / 1000));
            setChatUploadProgress({
              pct: displayPercent,
              remainingSec: remaining,
              label: '링크 미리보기 생성 중...',
              current: imageCount > 0 ? 1 : undefined,
              total: imageCount > 0 ? imageCount : undefined
            });
          }, 100);
          try {
            const res = await fetchLinkPreview(url);
            if (res && res.status === 'success') {
              linkPreview = res.data;
            }
          } catch (e) {
            console.error('Failed to fetch link preview on chat send:', e);
          } finally {
            clearInterval(pInterval);
            setChatUploadProgress({
              pct: imageCount > 0 ? 25 : 86,
              remainingSec: null,
              label: imageCount > 0 ? '사진 전송 준비 중...' : '채팅 저장 중...',
              current: imageCount > 0 ? 1 : undefined,
              total: imageCount > 0 ? imageCount : undefined
            });
          }
        }
      }

      let ok = false;
      if (imageCount === 0) {
        const messageData = {
          participantId: chatParticipantId,
          text: chatInput.trim(),
          timestamp: Date.now()
        };
        if (linkPreview) messageData.linkPreview = linkPreview;
        setChatUploadProgress({ pct: 90, remainingSec: 1, label: '채팅 저장 중...' });
        ok = await (async () => {
          if (firebaseDb) {
            await firebaseDb.collection('calendars').doc(`cal_${activeCalId}`).collection('messages').add(sanitizeMessageForFirestore(messageData));
            return true;
          }
          return sendChatMessageRest(activeCalId, messageData);
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
          const messageData = {
            participantId: chatParticipantId,
            text: i === 0 ? chatInput.trim() : '',
            imageUrl: chunkImages[0].imageUrl,
            thumbUrl: chunkImages[0].thumbUrl,
            imageUrls: chunkImages.map(r => r.imageUrl),
            thumbUrls: chunkImages.map(r => r.thumbUrl),
            timestamp: baseTimestamp + i
          };
          if (i === 0 && linkPreview) messageData.linkPreview = linkPreview;
          if (firebaseDb) {
            await firebaseDb.collection('calendars').doc(`cal_${activeCalId}`).collection('messages').add(sanitizeMessageForFirestore(messageData));
          } else {
            const sent = await sendChatMessageRest(activeCalId, messageData);
            if (!sent) throw new Error(`REST chat send failed for chunk ${i + 1}/${chunks.length}`);
          }
        }
        ok = true;
        setChatUploadProgress({ pct: 100, remainingSec: 0, label: '전송 완료', current: imageCount, total: imageCount });
      }

      if (ok) {
        setChatInput('');
        setChatImages([]);
        if (chatTextareaRef.current) {
          chatTextareaRef.current.style.height = '34px';
        }
        if (!firebaseDb) {
          fetchChatMessagesRest(activeCalId).then(list => setChatMessages(list));
        }
        // No success toast here -- the new message is immediately visible in the chat feed.
      } else {
        showToast('등록 실패', 'error', 3000);
      }
    } catch (err) {
      console.error('handleSendChatMessage failed:', err);
      showToast('등록 실패', 'error', 3000);
    } finally {
      setIsChatSubmitting(false);
      setChatUploadProgress(null);
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
    try {
      const resolvedImages = await resolveChatImageBatch(activeCal.id, compressed, progress => {
        setChatUploadProgress({
          ...progress,
          label: '갤러리 사진 업로드 중...'
        });
      });
      const chunks = chunkResolvedImagesForMessages(resolvedImages);
      const now = Date.now();
      const fallbackParticipantId = chatParticipantId || getActiveParticipants(activeCal)[0]?.id || '';
      for (let i = 0; i < chunks.length; i += 1) {
        const chunkImages = chunks[i];
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
          timestamp: now + i,
          // Marks this message as gallery-uploaded (vs typed into the chat composer) so the
          // Lightbox info panel can show "갤러리에서 업로드됨" instead of "채팅방에서 업로드됨".
          uploadSource: 'gallery'
        };
        if (firebaseDb) {
          await firebaseDb.collection('calendars').doc(`cal_${activeCal.id}`).collection('messages').add(sanitizeMessageForFirestore(messageData));
        } else {
          const sent = await sendChatMessageRest(activeCal.id, messageData);
          if (!sent) throw new Error(`Gallery upload REST save failed ${i + 1}/${chunks.length}`);
        }
      }
      setChatUploadProgress({ pct: 100, remainingSec: 0, label: '갤러리 업로드 완료' });
      showToast('갤러리에 사진이 추가되었습니다.', 'success');
      return true;
    } catch (err) {
      console.error('handleUploadGalleryImages failed:', err);
      showToast('갤러리 업로드 실패', 'error', 4000);
      return false;
    } finally {
      setTimeout(() => setChatUploadProgress(null), 250);
    }
  };

  const handleDeleteMessage = (msg) => {
    setDeletingMessage({ ...msg, calId: activeCalId });
  };

  const handleConfirmDeleteMessage = async () => {
    if (!deletingMessage) return;
    const { id, calId } = deletingMessage;
    try {
      let ok = false;
      if (firebaseDb) {
        await firebaseDb.collection('calendars').doc(`cal_${calId}`).collection('messages').doc(id).delete();
        ok = true;
      } else {
        ok = await deleteMessageRest(calId, id);
      }
      if (ok) {
        deleteAllChatImagesFromStorage(deletingMessage);
        unlinkMeetingPhotoReferences(id, null).catch(err => console.warn('unlinkMeetingPhotoReferences skipped:', err));
        if (!firebaseDb) {
          fetchChatMessagesRest(calId).then(list => setChatMessages(list));
        }
        showToast('삭제완료', 'success', 3000);
      } else {
        showToast('삭제 실패', 'error', 3000);
      }
    } catch (err) {
      console.error('handleConfirmDeleteMessage failed:', err);
      showToast('삭제 실패', 'error', 3000);
    } finally {
      setDeletingMessage(null);
    }
  };

  const handleEditMessage = (msg) => {
    setEditingMessage({ ...msg, calId: activeCalId });
  };

  const handleSaveEditMessage = async (newText, newImages, newParticipantId) => {
    if (!editingMessage) return;
    const { id, calId } = editingMessage;
    const resolvedParticipantId = newParticipantId || editingMessage.participantId;
    const hasNewImages = (newImages || []).some(img => !img.isExisting);
    if (hasNewImages) setChatUploadProgress({ pct: 0, remainingSec: null });
    try {
      let linkPreview = null;
      const url = extractFirstUrl(newText);
      if (url && shouldFetchLinkPreviewForChatUrl(url)) {
        const oldUrl = extractFirstUrl(editingMessage.text);
        if (oldUrl === url && editingMessage.linkPreview) {
          linkPreview = editingMessage.linkPreview;
        } else {
          try {
            const res = await fetchLinkPreview(url);
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

      const data = {
        text: newText,
        imageUrl: firstChunk[0]?.imageUrl || '',
        thumbUrl: firstChunk[0]?.thumbUrl || '',
        imageUrls: firstChunk.map(r => r.imageUrl),
        thumbUrls: firstChunk.map(r => r.thumbUrl),
        imageTags: nextImageTags.slice(0, firstChunk.length),
        linkPreview: linkPreview || null
      };
      if (resolvedParticipantId !== editingMessage.participantId) data.participantId = resolvedParticipantId;
      let ok = false;
      if (firebaseDb) {
        await firebaseDb.collection('calendars').doc(`cal_${calId}`).collection('messages').doc(id).update(data);
        if (extraChunks.length > 0) {
          const baseTimestamp = (editingMessage.timestamp || Date.now()) + 1;
          for (let i = 0; i < extraChunks.length; i++) {
            const chunkImages = extraChunks[i];
            await firebaseDb.collection('calendars').doc(`cal_${calId}`).collection('messages').add(sanitizeMessageForFirestore({
              participantId: resolvedParticipantId,
              text: '',
              imageUrl: chunkImages[0].imageUrl,
              thumbUrl: chunkImages[0].thumbUrl,
              imageUrls: chunkImages.map(r => r.imageUrl),
              thumbUrls: chunkImages.map(r => r.thumbUrl),
              timestamp: baseTimestamp + i
            }));
          }
        }
        ok = true;
      } else {
        ok = await updateMessageRest(calId, id, data);
      }
      if (ok) {
        // Clean up Storage only for images the user actually removed, not ones kept.
        const originalEntries = Array.isArray(editingMessage.imageUrls) && editingMessage.imageUrls.length > 0
          ? editingMessage.imageUrls.map((url, idx) => ({ original: url, thumbnail: (editingMessage.thumbUrls || [])[idx] || url }))
          : (editingMessage.imageUrl ? [{ original: editingMessage.imageUrl, thumbnail: editingMessage.thumbUrl || editingMessage.imageUrl }] : []);
        const keptOriginals = new Set((newImages || []).filter(img => img.isExisting).map(img => img.original));
        const removedEntries = originalEntries.filter(entry => !keptOriginals.has(entry.original));
        if (removedEntries.length > 0) {
          deleteAllChatImagesFromStorage({
            imageUrls: removedEntries.map(e => e.original),
            thumbUrls: removedEntries.map(e => e.thumbnail)
          });
        }
        if (!firebaseDb) {
          fetchChatMessagesRest(calId).then(list => setChatMessages(list));
        }
        showToast('수정완료', 'success', 3000);
      } else {
        showToast('수정 실패', 'error', 3000);
      }
    } catch (err) {
      console.error('handleSaveEditMessage failed:', err);
      showToast(describeFirebaseWriteError(err, '수정 실패'), 'error', 4000);
    } finally {
      setEditingMessage(null);
      setChatUploadProgress(null);
    }
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
        if (firebaseDb) {
          await withTimeout(firebaseDb.collection('calendars').doc(`cal_${activeCalId}`).collection('messages').doc(sourceMessage.id).update(data), 9000, 'message share URL cache write');
        } else {
          const ok = await updateMessageRest(activeCalId, sourceMessage.id, data);
          if (!ok) throw new Error('Message share URL cache update failed');
        }
        patchLocalChatMessage(sourceMessage.id, data);
        setChatUploadProgress({ pct: 100, remainingSec: 0, label: 'URL 생성완료' });
        return { shareUrl, imageUrl: null };
      }

      if (!firebaseStorage) throw new Error('Firebase Storage is not available');
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
        showToast('이미지 URL 생성 실패', 'error', 4000);
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
      photos.push({
        id: `photo_${activeCal.id}_${dateStr}_${now}_${index}_${Math.random().toString(36).slice(2, 7)}`,
        imageUrl: photo.imageUrl,
        thumbUrl: photo.thumbUrl || photo.imageUrl,
        createdAt: now + index,
        source: 'lightbox-tag',
        sourceMessageId,
        sourceImageIndex,
        tags: cleanTags || ''
      });
      byDate.set(dateStr, { ...meeting, photos, amount: meeting.amount || null });
      linkedCount += 1;
      changed = true;
    });
    if (!changed) return 0;
    const photoLogs = validDates.map((dateStr, index) => (
      createActivityLog(activeCal.id, 'photo_create', dateStr, '', now + index, '사진 날짜 태그 연결')
    )).filter(Boolean);
    const updatedCal = {
      ...activeCal,
      confirmedMeeting: Array.from(byDate.values()).sort((a, b) => String(a.date || '').localeCompare(String(b.date || ''))),
      updatedAt: now,
      revision: (activeCal.revision || 0) + 1,
      activityLogs: photoLogs.length > 0 ? [...getCalendarActivityLogs(activeCal), ...photoLogs] : getCalendarActivityLogs(activeCal)
    };
    const nextCalendars = calendars.map(c => c.id === updatedCal.id ? updatedCal : c);
    await updateCalendars(
      nextCalendars,
      linkedCount > 0 ? `${linkedCount}건 일정 사진 연결완료` : '일정 사진 연결 정리완료',
      'success',
      updatedCal.id,
      'settings',
      photoLogs
    );
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
    const photoIndex = photos.findIndex(p => p?.id === photoId);
    if (!meeting || photoIndex === -1) {
      showToast('태그 저장 대상 사진을 찾지 못했습니다.', 'error', 4000);
      return false;
    }
    const parseTagTokens = text => Array.from(new Set(
      String(text || '').split(/[,\s#]+/).map(t => sanitizeText(t.trim(), 30)).filter(Boolean)
    )).slice(0, 10);
    const cleanTags = sanitizeText(parseTagTokens(tagsText).join(' '), 100);
    const nextPhotos = photos.map((p, i) => i === photoIndex ? { ...p, tags: cleanTags } : p);
    const updatedCal = {
      ...activeCal,
      confirmedMeeting: existingMeetings.map(m => m.date === meetingDate ? { ...meeting, photos: nextPhotos } : m),
      updatedAt: Date.now(),
      revision: (activeCal.revision || 0) + 1
    };
    const nextCalendars = calendars.map(c => c.id === updatedCal.id ? updatedCal : c);
    return updateCalendars(nextCalendars, '태그 저장완료', 'success', updatedCal.id, 'settings');
  };

  const handleSaveImageTags = async (messageId, imageIndex, tagsText, meta = {}) => {
    if (meta?.source === 'meeting') {
      // An auto-linked 일정 사진 (created via a date hashtag, see linkTaggedImageToMeetingDates)
      // is just a reference to a real chat photo -- edit its tags there, not on the reference
      // itself, so the change is visible everywhere that photo appears, not just this one date.
      // Only a manually-uploaded 일정 사진 (no sourceMessageId, no chat photo behind it) still
      // writes to its own standalone tags field via handleSaveMeetingPhotoTags.
      if (meta.sourceMessageId && Number.isInteger(meta.sourceImageIndex)) {
        return handleSaveImageTags(meta.sourceMessageId, meta.sourceImageIndex, tagsText, {});
      }
      return handleSaveMeetingPhotoTags(meta.meetingDate, meta.photoId, tagsText);
    }
    if (!messageId || !Number.isInteger(imageIndex)) return false;
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
    if (!isDirectMedia && (imageIndex < 0 || imageIndex >= entryCount)) return false;
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
      if (firebaseDb) {
        await withTimeout(firebaseDb.collection('calendars').doc(`cal_${activeCalId}`).collection('messages').doc(messageId).update(data), 9000, 'image tags write');
      } else {
        const ok = await updateMessageRest(activeCalId, messageId, data);
        if (!ok) throw new Error('Image tags update failed');
      }
      const now = Date.now();
      const added = nextTokens.filter(t => !prevTokens.includes(t));
      const removed = prevTokens.filter(t => !nextTokens.includes(t));
      const tagLogs = [
        ...added.map((t, i) => createActivityLog(activeCalId, 'tag_add', '', '', now + i, `#${t}`)),
        ...removed.map((t, i) => createActivityLog(activeCalId, 'tag_remove', '', '', now + added.length + i, `#${t}`))
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
    patchLocalChatMessage(messageId, data);
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
    if (requestedId && !calendars.some(c => c.id === requestedId)) {
      const resolveRequestedCalendar = async () => {
        const existing = await fetchSingleCloudCalendar(requestedId, 1);
        if (cancelled) return;
        if (existing?.calendar) {
          applyServerCalendars(mergeCalendarCollections(calendars, [existing.calendar], {
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
    const activeParticipantIds = new Set(getActiveParticipants(activeCal).map(participant => participant.id));
    if (!activeParticipantIds.has(participantId)) {
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
    const activityLog = createActivityLog(activeCal.id, action, dateStr, participantId, now, cleanNote);
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
    const activeParticipantIds = new Set(getActiveParticipants(activeCal).map(participant => participant.id));
    if (!activeParticipantIds.has(participantId)) {
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
  const handleDeleteAvailability = (dateStr, participantId) => {
    if (!activeCal || !isValidDateString(dateStr)) return false;
    const activeParticipantIds = new Set(getActiveParticipants(activeCal).map(participant => participant.id));
    if (!activeParticipantIds.has(participantId)) return false;
    const now = Date.now();
    const targetEntry = (activeCal.availabilities || []).find(e => e.date === dateStr && e.participantId === participantId && !isTombstone(e));
    if (!targetEntry) return false;
    const nextAvail = (activeCal.availabilities || []).map(e => e.date === dateStr && e.participantId === participantId ? {
      ...e,
      deletedAt: now,
      updatedAt: now
    } : e);
    const activityLog = createActivityLog(activeCal.id, 'delete', dateStr, participantId, now, targetEntry.note || '');
    const updatedCal = {
      ...activeCal,
      updatedAt: now,
      revision: (activeCal.revision || 0) + 1,
      availabilities: nextAvail,
      activityLogs: activityLog ? [...getCalendarActivityLogs(activeCal), activityLog] : getCalendarActivityLogs(activeCal)
    };
    const nextCalendars = calendars.map(c => c.id === updatedCal.id ? updatedCal : c);
    return updateCalendars(nextCalendars, '삭제완료', 'delete', updatedCal.id, 'availability', activityLog ? [activityLog] : []);
  };
  const handleDeleteAllForDate = dateStr => {
    if (!activeCal || !isValidDateString(dateStr)) return false;
    const now = Date.now();
    const activeEntries = (activeCal.availabilities || []).filter(e => e.date === dateStr && !isTombstone(e));
    if (activeEntries.length === 0) return false;
    const nextAvail = (activeCal.availabilities || []).map(e => e.date === dateStr ? {
      ...e,
      deletedAt: now,
      updatedAt: now
    } : e);
    const activityLogs = activeEntries.map((entry, index) =>
      createActivityLog(activeCal.id, 'delete', dateStr, entry.participantId, now + index, entry.note || '')
    ).filter(Boolean);
    const updatedCal = {
      ...activeCal,
      updatedAt: now,
      revision: (activeCal.revision || 0) + 1,
      availabilities: nextAvail,
      activityLogs: [...getCalendarActivityLogs(activeCal), ...activityLogs]
    };
    const nextCalendars = calendars.map(c => c.id === updatedCal.id ? updatedCal : c);
    return updateCalendars(nextCalendars, '삭제완료', 'delete', updatedCal.id, 'availability', activityLogs);
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
    const updatedCal = {
      ...activeCal,
      confirmedMeeting: nextConfirmedMeetings,
      updatedAt: now,
      revision: (activeCal.revision || 0) + 1,
      activityLogs: meetingLog ? [...getCalendarActivityLogs(activeCal), meetingLog] : getCalendarActivityLogs(activeCal)
    };
    const nextCalendars = calendars.map(c => c.id === updatedCal.id ? updatedCal : c);
    return updateCalendars(nextCalendars, isAlreadyConfirmed ? '모임 확정 취소' : '모임 확정', 'success', updatedCal.id, 'settings', meetingLog ? [meetingLog] : []);
  };
  // Saved via saveMode 'settings' like confirmedMeeting itself -- mergeCalendarSettingsDelta
  // does a blind {...server, ...incoming} for fields it doesn't explicitly preserve/merge (see
  // its handling of availabilities/polls for contrast), so two near-simultaneous 'settings'
  // saves from different tabs (e.g. this and handleSetPinnedNotice) can still let a stale local
  // confirmedMeeting/pinnedNotice/expenses snapshot overwrite a fresher one. Pre-existing pattern
  // shared by every other settings-mode field in this app (title, description, ...); a real fix
  // would need confirmedMeeting/pinnedNotice to get their own dedicated saveMode + delta-merge
  // function the way availabilities and polls already do.
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
    if ((!cleanLabel && !cleanUrl) || !cleanAmount) return false;
    
    let linkPreview = null;
    if (cleanUrl) {
      if (expense?.id) {
        const meeting = existingMeetings[meetingIndex];
        const existingExp = meeting?.expenses?.find(e => e.id === expense.id);
        if (existingExp && existingExp.url === cleanUrl && existingExp.linkPreview) {
          linkPreview = existingExp.linkPreview;
        }
      }
      if (!linkPreview) {
        try {
          const res = await fetchLinkPreview(cleanUrl);
          if (res && res.status === 'success') {
            linkPreview = res.data;
          }
        } catch (e) {
          console.warn("Failed to fetch link preview on expense save:", e);
        }
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
	      ? existingExpenses.map(e => e.id === expense.id ? { ...e, label: cleanLabel, url: cleanUrl, categoryId: cleanCategoryId, amount: cleanAmount, updatedAt: now, linkPreview: linkPreview || null } : e)
	      : [...existingExpenses, { id: `exp_${activeCal.id}_${dateStr}_${now}_${Math.random().toString(36).slice(2, 7)}`, label: cleanLabel, url: cleanUrl, categoryId: cleanCategoryId, amount: cleanAmount, order: existingExpenses.length, createdAt: now, updatedAt: now, linkPreview: linkPreview || null }];
    const nextConfirmedMeetings = meetings.map((m, i) => i === meetingIndex ? { ...m, expenses: nextExpenses, amount: null } : m);
    // Expense/income entries have no participant selector of their own, so these logs carry an
    // empty participantId (matching how poll activity logs already handle system-level actions)
    // -- the admin log UI falls back to a generic '정산' label for that case.
    const fmtAmt = n => `${Number(n) < 0 ? '+' : '-'}${Math.abs(Number(n) || 0).toLocaleString()}원`;
    const expCats = getExpenseCategories(activeCal);
    const expCatName = id => (expCats.find(c => c.id === id) || {}).name || id || '-';
    const prevExp = isEditing ? existingExpenses.find(e => e.id === expense.id) : null;
    let expenseLogNote;
    if (isEditing && prevExp) {
      expenseLogNote = buildFieldChangeNote(cleanLabel || cleanUrl || '정산', [
        { key: '금액', before: fmtAmt(prevExp.amount), after: fmtAmt(cleanAmount) },
        { key: '명목', before: prevExp.label || prevExp.url || '', after: cleanLabel || cleanUrl },
        { key: '카테고리', before: expCatName(prevExp.categoryId), after: expCatName(cleanCategoryId) }
      ]);
    } else {
      expenseLogNote = sanitizeText(`${fmtAmt(cleanAmount)} ${cleanLabel || cleanUrl} · ${expCatName(cleanCategoryId)}`, 300);
    }
    const expenseActivityLog = createActivityLog(activeCal.id, isEditing ? 'expense_update' : 'expense_create', dateStr, '', now, expenseLogNote);
    const updatedCal = {
      ...activeCal,
      confirmedMeeting: nextConfirmedMeetings,
      updatedAt: now,
      revision: (activeCal.revision || 0) + 1,
      activityLogs: expenseActivityLog ? [...getCalendarActivityLogs(activeCal), expenseActivityLog] : getCalendarActivityLogs(activeCal)
    };
    const nextCalendars = calendars.map(c => c.id === updatedCal.id ? updatedCal : c);
    return updateCalendars(nextCalendars, '지출 저장완료', 'success', updatedCal.id, 'settings', expenseActivityLog ? [expenseActivityLog] : []);
  };
  const handleDeleteExpense = (dateStr, expenseId) => {
    // Confirm rule: UI layer (DateModal) shows confirm once. Do not confirm again here.
    if (!activeCal || !isValidDateString(dateStr)) return false;
    const existingMeetings = getConfirmedMeetings(activeCal);
    const meetingIndex = existingMeetings.findIndex(m => m.date === dateStr);
    if (meetingIndex < 0) return false;
    const meeting = existingMeetings[meetingIndex];
    const deletedExpense = (Array.isArray(meeting.expenses) ? meeting.expenses : []).find(e => e.id === expenseId);
    if (!deletedExpense) return false;

    const nextExpenses = (Array.isArray(meeting.expenses) ? meeting.expenses : []).filter(e => e.id !== expenseId);
    const now = Date.now();
    const nextConfirmedMeetings = existingMeetings.map((m, i) => i === meetingIndex ? { ...m, expenses: nextExpenses } : m);
    const expenseLogNote = sanitizeText(
      `${deletedExpense.amount < 0 ? '+' : '-'}${Math.abs(Number(deletedExpense.amount) || 0).toLocaleString()}원 ${deletedExpense.label || deletedExpense.url || ''}`,
      120
    );
    const expenseActivityLog = createActivityLog(activeCal.id, 'expense_delete', dateStr, '', now, expenseLogNote);
    const updatedCal = {
      ...activeCal,
      confirmedMeeting: nextConfirmedMeetings,
      updatedAt: now,
      revision: (activeCal.revision || 0) + 1,
      activityLogs: expenseActivityLog ? [...getCalendarActivityLogs(activeCal), expenseActivityLog] : getCalendarActivityLogs(activeCal)
    };
    const nextCalendars = calendars.map(c => c.id === updatedCal.id ? updatedCal : c);
    return updateCalendars(nextCalendars, '지출 삭제완료', 'success', updatedCal.id, 'settings', expenseActivityLog ? [expenseActivityLog] : []);
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
    const now = Date.now();
    const nextConfirmedMeetings = existingMeetings.map((m, i) => i === meetingIndex ? { ...m, expenses: nextExpenses } : m);
    const updatedCal = {
      ...activeCal,
      confirmedMeeting: nextConfirmedMeetings,
      updatedAt: now,
      revision: (activeCal.revision || 0) + 1
    };
    const nextCalendars = calendars.map(c => c.id === updatedCal.id ? updatedCal : c);
    return updateCalendars(nextCalendars, '지출 순서 저장완료', 'success', updatedCal.id, 'settings', []);
  };

  // Uploaded through the exact same chat-message pipeline as every other photo in the app (see
  // handleUploadGalleryImages) -- this is a real chat message (uploadSource: 'meeting'), not an
  // independent copy, so it shows up in the chat room/gallery/main gallery too. confirmedMeeting
  // .photos below only stores a REFERENCE to it (sourceMessageId + sourceImageIndex, tags set to
  // the meeting date), matching linkTaggedImageToMeetingDates' identity model -- one photo, one
  // Storage file, shared everywhere it's tagged.
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
      });
      const chunks = chunkResolvedImagesForMessages(resolvedImages);
      const now = Date.now();
      const fallbackParticipantId = chatParticipantId || getActiveParticipants(activeCal)[0]?.id || '';
      const newRefs = [];
      for (let i = 0; i < chunks.length; i += 1) {
        const chunkImages = chunks[i];
        setChatUploadProgress({
          pct: Math.min(99, 90 + Math.round((i / Math.max(1, chunks.length)) * 9)),
          remainingSec: Math.max(1, chunks.length - i),
          label: '일정 사진 저장 중...',
          current: Math.min(resolvedImages.length, i + 1),
          total: resolvedImages.length
        });
        const messageData = {
          participantId: fallbackParticipantId,
          text: i === 0 ? '일정 사진' : '',
          imageUrl: chunkImages[0].imageUrl,
          thumbUrl: chunkImages[0].thumbUrl,
          imageUrls: chunkImages.map(r => r.imageUrl),
          thumbUrls: chunkImages.map(r => r.thumbUrl),
          imageTags: chunkImages.map(() => dateStrToHashtag(dateStr)),
          timestamp: now + i,
          uploadSource: 'meeting'
        };
        let newMessageId = null;
        if (firebaseDb) {
          const ref = await firebaseDb.collection('calendars').doc(`cal_${activeCal.id}`).collection('messages').add(sanitizeMessageForFirestore(messageData));
          newMessageId = ref.id;
        } else {
          const sent = await sendChatMessageRest(activeCal.id, messageData);
          if (!sent) throw new Error(`Meeting photo save failed ${i + 1}/${chunks.length}`);
          newMessageId = sent.id || null;
        }
        chunkImages.forEach((img, idx) => {
          newRefs.push({
            id: `photo_${activeCal.id}_${dateStr}_${now}_${i}_${idx}_${Math.random().toString(36).slice(2, 7)}`,
            imageUrl: img.imageUrl,
            thumbUrl: img.thumbUrl || img.imageUrl,
            createdAt: now + i,
            source: 'lightbox-tag',
            sourceMessageId: newMessageId || '',
            sourceImageIndex: idx,
            tags: dateStrToHashtag(dateStr)
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
      const updatedCal = {
        ...activeCal,
        confirmedMeeting: nextConfirmedMeetings,
        updatedAt: now,
        revision: (activeCal.revision || 0) + 1,
        activityLogs: photoLog ? [...getCalendarActivityLogs(activeCal), photoLog] : getCalendarActivityLogs(activeCal)
      };
      const nextCalendars = calendars.map(c => c.id === updatedCal.id ? updatedCal : c);
      setChatUploadProgress({ pct: 100, remainingSec: 0, label: '일정 사진 저장 완료' });
      return updateCalendars(nextCalendars, '일정 사진 저장완료', 'success', updatedCal.id, 'settings', photoLog ? [photoLog] : []);
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
      showToast(`일정 사진 저장 실패${detail}`, 'error', 6000);
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

  const handleDeleteMeetingPhoto = (dateStr, photoId, imageUrl) => {
    if (!activeCal) return false;
    const existingMeetings = getConfirmedMeetings(activeCal);
    let meetingIndex = isValidDateString(dateStr) ? existingMeetings.findIndex(m => m.date === dateStr) : -1;
    if (meetingIndex < 0) {
      meetingIndex = existingMeetings.findIndex(m => (m.photos || []).some(p => (photoId && p.id === photoId) || photoMatchesUrl(p, imageUrl)));
    }
    if (meetingIndex < 0) return false;
    const meeting = existingMeetings[meetingIndex];
    const existingPhotos = Array.isArray(meeting.photos) ? meeting.photos : [];
    const deletedPhoto = existingPhotos.find(p => (photoId && p.id === photoId) || photoMatchesUrl(p, imageUrl));
    if (!deletedPhoto) return false;
    deleteChatImageFromStorage(deletedPhoto.imageUrl);
    deleteChatImageFromStorage(deletedPhoto.thumbUrl);
    const now = Date.now();
    const nextConfirmedMeetings = existingMeetings.map((m, i) => i === meetingIndex
      ? { ...m, photos: existingPhotos.filter(p => p !== deletedPhoto && p.id !== deletedPhoto.id && !photoMatchesUrl(p, imageUrl)) }
      : m);
    const targetDate = meeting.date || dateStr;
    const photoLog = createActivityLog(activeCal.id, 'photo_delete', targetDate, '', now, '일정 사진 삭제');
    const updatedCal = {
      ...activeCal,
      confirmedMeeting: nextConfirmedMeetings,
      updatedAt: now,
      revision: (activeCal.revision || 0) + 1,
      activityLogs: photoLog ? [...getCalendarActivityLogs(activeCal), photoLog] : getCalendarActivityLogs(activeCal)
    };
    const nextCalendars = calendars.map(c => c.id === updatedCal.id ? updatedCal : c);
    return updateCalendars(nextCalendars, '사진 삭제완료', 'delete', updatedCal.id, 'settings', photoLog ? [photoLog] : []);
  };

  const handleReplaceMeetingPhoto = async (dateStr, photoId, file, imageUrl) => {
    if (!activeCal || !file) return false;
    const existingMeetings = getConfirmedMeetings(activeCal);
    let meetingIndex = isValidDateString(dateStr) ? existingMeetings.findIndex(m => m.date === dateStr) : -1;
    if (meetingIndex < 0) {
      meetingIndex = existingMeetings.findIndex(m => (m.photos || []).some(p => (photoId && p.id === photoId) || (imageUrl && (p.imageUrl === imageUrl || p.thumbUrl === imageUrl))));
    }
    if (meetingIndex < 0) return false;
    const meeting = existingMeetings[meetingIndex];
    const existingPhotos = Array.isArray(meeting.photos) ? meeting.photos : [];
    const targetPhoto = existingPhotos.find(p => (photoId && p.id === photoId) || (imageUrl && (p.imageUrl === imageUrl || p.thumbUrl === imageUrl)));
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
      const now = Date.now();
      const nextConfirmedMeetings = existingMeetings.map((m, i) => i === meetingIndex
        ? { ...m, photos: existingPhotos.map(photo => (photo === targetPhoto || (photoId && photo.id === photoId)) ? { ...photo, imageUrl: resolved.imageUrl, thumbUrl: resolved.thumbUrl || resolved.imageUrl } : photo) }
        : m);
      const updatedCal = {
        ...activeCal,
        confirmedMeeting: nextConfirmedMeetings,
        updatedAt: now,
        revision: (activeCal.revision || 0) + 1
      };
      const nextCalendars = calendars.map(c => c.id === updatedCal.id ? updatedCal : c);
      const ok = await updateCalendars(nextCalendars, '사진 교체완료', 'success', updatedCal.id, 'settings');
      if (ok) {
        deleteChatImageFromStorage(prevImageUrl);
        deleteChatImageFromStorage(prevThumbUrl);
      }
      return ok ? resolved.imageUrl : false;
    } catch (err) {
      console.error('handleReplaceMeetingPhoto failed:', err);
      showToast('사진 교체 실패', 'error', 4000);
      return false;
    } finally {
      setTimeout(() => setChatUploadProgress(null), 250);
    }
  };

  // Shared by handleDeleteChatMessagePhoto/handleReplaceChatMessagePhoto -- mirrors
  // handleSaveImageTags' own message lookup (local state first, then a direct Firestore/REST
  // read, since the Lightbox can be opened on a message that hasn't been paginated into
  // chatMessages yet).
  const findChatMessageById = async messageId => {
    const local = (chatMessages || []).find(msg => msg.id === messageId);
    if (local) return local;
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
  };

  // Keeps confirmedMeeting.photos[] REFERENCES (see linkTaggedImageToMeetingDates) pointing at
  // the right photo after the chat message they trace back to loses an image -- the entry at
  // the deleted index is dropped (that photo is gone everywhere now, not just here), and every
  // later index shifts down by one to track the now-renumbered imageUrls array. Pass
  // deletedImageIndex=null when the whole message was removed, dropping every reference to it
  // regardless of index.
  const unlinkMeetingPhotoReferences = async (messageId, deletedImageIndex) => {
    if (!activeCal || !messageId) return;
    const existingMeetings = getConfirmedMeetings(activeCal);
    let changed = false;
    const nextConfirmedMeetings = existingMeetings.map(meeting => {
      const photos = Array.isArray(meeting.photos) ? meeting.photos : [];
      let meetingChanged = false;
      const nextPhotos = photos.reduce((acc, p) => {
        if (p?.sourceMessageId !== messageId) { acc.push(p); return acc; }
        if (deletedImageIndex === null || p.sourceImageIndex === deletedImageIndex) { meetingChanged = true; return acc; }
        if (p.sourceImageIndex > deletedImageIndex) {
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
    if (!changed) return;
    const updatedCal = {
      ...activeCal,
      confirmedMeeting: nextConfirmedMeetings,
      updatedAt: Date.now(),
      revision: (activeCal.revision || 0) + 1
    };
    const nextCalendars = calendars.map(c => c.id === updatedCal.id ? updatedCal : c);
    await updateCalendars(nextCalendars, '일정 사진 연결 정리완료', 'success', updatedCal.id, 'settings');
  };

  const handleDeleteChatMessagePhoto = async (messageId, imageIndex) => {
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
    try {
      if (nextUrls.length === 0 && !remainingText) {
        // No images and no text left -- nothing to keep, remove the whole message.
        if (firebaseDb) {
          await firebaseDb.collection('calendars').doc(`cal_${activeCalId}`).collection('messages').doc(messageId).delete();
        } else {
          await deleteMessageRest(activeCalId, messageId);
        }
        removeLocalChatMessage(messageId);
        unlinkMeetingPhotoReferences(messageId, null).catch(err => console.warn('unlinkMeetingPhotoReferences skipped:', err));
      } else {
        const data = sanitizeMessageForFirestore({
          imageUrls: nextUrls,
          thumbUrls: nextThumbs,
          imageUrl: nextUrls[0] || null,
          thumbUrl: nextThumbs[0] || null,
          imageTags: nextTags
        });
        if (firebaseDb) {
          await withTimeout(firebaseDb.collection('calendars').doc(`cal_${activeCalId}`).collection('messages').doc(messageId).update(data), 9000, 'photo delete write');
        } else {
          const ok = await updateMessageRest(activeCalId, messageId, data);
          if (!ok) throw new Error('Photo delete REST update failed');
        }
        patchLocalChatMessage(messageId, data);
        unlinkMeetingPhotoReferences(messageId, imageIndex).catch(err => console.warn('unlinkMeetingPhotoReferences skipped:', err));
      }
      deleteChatImageFromStorage(target.full);
      if (target.thumb !== target.full) deleteChatImageFromStorage(target.thumb);
      showToast('사진 삭제완료', 'success');
      return true;
    } catch (err) {
      console.error('handleDeleteChatMessagePhoto failed:', err);
      showToast('사진 삭제 실패', 'error', 4000);
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
      if (firebaseDb) {
        await withTimeout(firebaseDb.collection('calendars').doc(`cal_${activeCalId}`).collection('messages').doc(messageId).update(data), 9000, 'photo replace write');
      } else {
        const ok = await updateMessageRest(activeCalId, messageId, data);
        if (!ok) throw new Error('Photo replace REST update failed');
      }
      patchLocalChatMessage(messageId, data);
      deleteChatImageFromStorage(target.full);
      if (target.thumb !== target.full) deleteChatImageFromStorage(target.thumb);
      showToast('사진 교체완료', 'success');
      return resolved.imageUrl;
    } catch (err) {
      console.error('handleReplaceChatMessagePhoto failed:', err);
      showToast('사진 교체 실패', 'error', 4000);
      return false;
    } finally {
      setTimeout(() => setChatUploadProgress(null), 250);
    }
  };

  // Memo photos live in the memos collection, structurally identical to chat message images
  // (imageUrls/thumbUrls arrays), so this mirrors handleDeleteChatMessagePhoto/
  // handleReplaceChatMessagePhoto one-for-one against that collection instead.
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

  const handleDeleteMemoPhoto = async (memoId, imageIndex) => {
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
    try {
      const data = sanitizeMemoForFirestore({ imageUrls: nextUrls, thumbUrls: nextThumbs, imageUrl: nextUrls[0] || null, thumbUrl: nextThumbs[0] || null });
      await firebaseDb.collection('calendars').doc(`cal_${activeCalId}`).collection('memos').doc(memoId).update(data);
      setMemos(prev => prev.map(m => m.id === memoId ? { ...m, ...data } : m));
      deleteChatImageFromStorage(removedUrl);
      if (removedThumb !== removedUrl) deleteChatImageFromStorage(removedThumb);
      showToast('사진 삭제완료', 'success');
      return true;
    } catch (err) {
      console.error('handleDeleteMemoPhoto failed:', err);
      showToast('사진 삭제 실패', 'error', 4000);
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
      await firebaseDb.collection('calendars').doc(`cal_${activeCalId}`).collection('memos').doc(memoId).update(data);
      setMemos(prev => prev.map(m => m.id === memoId ? { ...m, ...data } : m));
      deleteChatImageFromStorage(removedUrl);
      if (removedThumb !== removedUrl) deleteChatImageFromStorage(removedThumb);
      showToast('사진 교체완료', 'success');
      return resolved.imageUrl;
    } catch (err) {
      console.error('handleReplaceMemoPhoto failed:', err);
      showToast('사진 교체 실패', 'error', 4000);
      return false;
    } finally {
      setTimeout(() => setChatUploadProgress(null), 250);
    }
  };

  // Single dispatch point handed to every Lightbox instance -- routes to the right storage
  // location based on meta.source. directMediaUrl (an image pasted as a bare URL in chat/memo
  // text) has no clean single-item target to mutate, so it's left unsupported (Lightbox hides
  // the edit/delete buttons for it).
  const findPhotoTargetByUrl = async (imageUrl, preferredMsgId, preferredDateStr, preferredPhotoId) => {
    if (!imageUrl) return null;
    if (preferredMsgId) {
      const msg = await findChatMessageById(preferredMsgId);
      if (msg) {
        const getEntries = typeof getMessageImageEntries === 'function' ? getMessageImageEntries : null;
        const entries = getEntries ? getEntries(msg) : [];
        const idx = entries.findIndex(e => e.full === imageUrl || e.thumb === imageUrl || e.imageUrl === imageUrl);
        if (idx >= 0) return { type: 'chat', messageId: msg.id, imageIndex: idx };
      }
    }
    const localMsg = (allChatMessages || []).find(m => {
      const getEntries = typeof getMessageImageEntries === 'function' ? getMessageImageEntries : null;
      const entries = getEntries ? getEntries(m) : [];
      return entries.some(e => e.full === imageUrl || e.thumb === imageUrl || e.imageUrl === imageUrl);
    });
    if (localMsg) {
      const getEntries = typeof getMessageImageEntries === 'function' ? getMessageImageEntries : null;
      const entries = getEntries ? getEntries(localMsg) : [];
      const idx = entries.findIndex(e => e.full === imageUrl || e.thumb === imageUrl || e.imageUrl === imageUrl);
      if (idx >= 0) return { type: 'chat', messageId: localMsg.id, imageIndex: idx };
    }

    const localMemo = (memos || []).find(m => {
      const urls = Array.isArray(m.imageUrls) ? m.imageUrls : (m.imageUrl ? [m.imageUrl] : []);
      const thumbs = Array.isArray(m.thumbUrls) ? m.thumbUrls : (m.thumbUrl ? [m.thumbUrl] : []);
      return urls.includes(imageUrl) || thumbs.includes(imageUrl);
    });
    if (localMemo) {
      const urls = Array.isArray(localMemo.imageUrls) ? localMemo.imageUrls : (localMemo.imageUrl ? [localMemo.imageUrl] : []);
      const thumbs = Array.isArray(localMemo.thumbUrls) ? localMemo.thumbUrls : (localMemo.thumbUrl ? [localMemo.thumbUrl] : []);
      let idx = urls.indexOf(imageUrl);
      if (idx < 0) idx = thumbs.indexOf(imageUrl);
      return { type: 'memo', memoId: localMemo.id, imageIndex: Math.max(0, idx) };
    }

    const meetings = getConfirmedMeetings(activeCal);
    let targetMeeting = null;
    let targetPhoto = null;
    if (preferredDateStr && isValidDateString(preferredDateStr)) {
      const m = meetings.find(item => item.date === preferredDateStr);
      if (m && Array.isArray(m.photos)) {
        targetPhoto = m.photos.find(p => (preferredPhotoId && p.id === preferredPhotoId) || p.imageUrl === imageUrl || p.thumbUrl === imageUrl);
        if (targetPhoto) targetMeeting = m;
      }
    }
    if (!targetMeeting) {
      for (const m of meetings) {
        if (!Array.isArray(m.photos)) continue;
        const p = m.photos.find(item => (preferredPhotoId && item.id === preferredPhotoId) || item.imageUrl === imageUrl || item.thumbUrl === imageUrl);
        if (p) {
          targetMeeting = m;
          targetPhoto = p;
          break;
        }
      }
    }
    if (targetMeeting && targetPhoto) {
      return { type: 'meeting', dateStr: targetMeeting.date, photoId: targetPhoto.id, photo: targetPhoto };
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

  const handleDeletePhoto = async meta => {
    if (!meta || meta.directMediaUrl) return false;
    const imageUrl = meta.imageUrl || meta.full || meta.thumb;
    const msgId = meta.messageId || meta.sourceMessageId;
    const imgIdx = Number.isInteger(meta.imageIndex) ? meta.imageIndex : (Number.isInteger(meta.sourceImageIndex) ? meta.sourceImageIndex : 0);
    const dateStr = meta.meetingDate;
    const photoId = meta.photoId;

    if (meta.source === 'memo' && msgId) {
      const ok = await handleDeleteMemoPhoto(msgId, imgIdx);
      if (ok) return true;
    }

    if ((meta.source === 'meeting' || meta.uploadSource === 'meeting' || dateStr || photoId) && !meta.sourceMessageId) {
      const okMeeting = await handleDeleteMeetingPhoto(dateStr, photoId, imageUrl);
      if (okMeeting) return true;
    }

    if (msgId) {
      const okChat = await handleDeleteChatMessagePhoto(msgId, imgIdx);
      if (okChat) return true;
    }

    const target = await findPhotoTargetByUrl(imageUrl, msgId, dateStr, photoId);
    if (target) {
      if (target.type === 'chat') {
        const ok = await handleDeleteChatMessagePhoto(target.messageId, target.imageIndex);
        if (ok) return true;
      } else if (target.type === 'memo') {
        const ok = await handleDeleteMemoPhoto(target.memoId, target.imageIndex);
        if (ok) return true;
      } else if (target.type === 'meeting') {
        const ok = await handleDeleteMeetingPhoto(target.dateStr, target.photoId, imageUrl);
        if (ok) return true;
      }
    }

    const okMeetingFallback = await handleDeleteMeetingPhoto(dateStr, photoId, imageUrl);
    if (okMeetingFallback) return true;

    showToast('삭제 대상 사진을 찾지 못했습니다.', 'error', 4000);
    return false;
  };

  const handleReplacePhoto = async (meta, file) => {
    if (!meta || meta.directMediaUrl || !file) return false;
    const imageUrl = meta.imageUrl || meta.full || meta.thumb;
    const msgId = meta.messageId || meta.sourceMessageId;
    const imgIdx = Number.isInteger(meta.imageIndex) ? meta.imageIndex : (Number.isInteger(meta.sourceImageIndex) ? meta.sourceImageIndex : 0);
    const dateStr = meta.meetingDate;
    const photoId = meta.photoId;

    if (meta.source === 'memo' && msgId) {
      const res = await handleReplaceMemoPhoto(msgId, imgIdx, file);
      if (res) return res;
    }

    if ((meta.source === 'meeting' || meta.uploadSource === 'meeting' || dateStr || photoId) && !meta.sourceMessageId) {
      const resMeeting = await handleReplaceMeetingPhoto(dateStr, photoId, file, imageUrl);
      if (resMeeting) return resMeeting;
    }

    if (msgId) {
      const resChat = await handleReplaceChatMessagePhoto(msgId, imgIdx, file);
      if (resChat) return resChat;
    }

    const target = await findPhotoTargetByUrl(imageUrl, msgId, dateStr, photoId);
    if (target) {
      if (target.type === 'chat') {
        const res = await handleReplaceChatMessagePhoto(target.messageId, target.imageIndex, file);
        if (res) return res;
      } else if (target.type === 'memo') {
        const res = await handleReplaceMemoPhoto(target.memoId, target.imageIndex, file);
        if (res) return res;
      } else if (target.type === 'meeting') {
        const res = await handleReplaceMeetingPhoto(target.dateStr, target.photoId, file, imageUrl);
        if (res) return res;
      }
    }

    const resFallback = await handleReplaceMeetingPhoto(dateStr, photoId, file, imageUrl);
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
    const cleanName = sanitizeText(placeData?.name || '', 80);
    if (!cleanName) return false;
    const now = Date.now();
    const existingPlaces = getCalendarPlaces(activeCal);
    let isEditing = !!placeData.id;
    const categoryIds = new Set(getPlaceCategories(activeCal).map(c => c.id));
    const cleanCategoryId = categoryIds.has(placeData.categoryId) ? placeData.categoryId : 'etc';
    const cleanAddress = normalizePlaceAddressForSave(placeData.address || '', placeData.lat, placeData.lng);
    const cleanAlias = sanitizeText(placeData.alias || '', 80);
    const cleanMemo = sanitizeText(placeData.memo || '', 2000);
    const cleanVisitStatus = placeData.visitStatus === 'planned' ? 'planned' : 'visited';
    const cleanVisitDate = cleanVisitStatus === 'visited' && isValidDateString(placeData.visitDate) ? placeData.visitDate : '';
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
    const mergeTargetPlace = (!isEditing && cleanSourcePlaceId)
      ? (existingPlaces.find(p => p.sourcePlaceId && p.sourcePlaceId === cleanSourcePlaceId)
        || existingPlaces.find(p => p.id === cleanSourcePlaceId))
        || null
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
    const editedFields = {
      name: mp('name', cleanName),
      alias: mp('alias', cleanAlias),
      address: mp('address', cleanAddress),
      lat: mergeTargetPlace ? mergeTargetPlace.lat : placeData.lat,
      lng: mergeTargetPlace ? mergeTargetPlace.lng : placeData.lng,
      categoryId: mp('categoryId', cleanCategoryId),
      memo: nextMemo,
      visitStatus: mp('visitStatus', cleanVisitStatus),
      visitDate: mp('visitDate', cleanVisitDate),
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
      // RULE: 주소/좌표/이름으로 기존 장소와 합치지 않음.
      // 같은 단지에 도은네·은우네·서준네처럼 별칭·메모가 다른 장소는 각각 별도 문서.
      nextPlaces = [...existingPlaces, { id: `place_${activeCal.id}_${now}_${Math.random().toString(36).slice(2, 7)}`, ...editedFields, createdAt: now }];
    }
    const prevPlace = isEditing ? existingPlaces.find(p => p.id === placeData.id) : null;
    const displayLabel = cleanAlias || cleanName || '장소';
    const placeCats = getPlaceCategories(activeCal);
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
    const placeActivityLog = createActivityLog(activeCal.id, isEditing ? 'place_update' : 'place_create', '', '', now, placeLogNote);
    const updatedCal = {
      ...activeCal,
      places: nextPlaces,
      updatedAt: now,
      revision: (activeCal.revision || 0) + 1,
      activityLogs: placeActivityLog ? [...getCalendarActivityLogs(activeCal), placeActivityLog] : getCalendarActivityLogs(activeCal)
    };
    const nextCalendars = calendars.map(c => c.id === updatedCal.id ? updatedCal : c);
    return updateCalendars(nextCalendars, isEditing ? '장소 수정완료' : '장소 등록완료', 'success', updatedCal.id, 'settings', placeActivityLog ? [placeActivityLog] : []);
  };
  const handleDeletePlace = (placeId) => {
    if (!activeCal || !placeId) return false;
    if (firebaseDb) {
      try {
        firebaseDb.collection('calendars').doc(`cal_${activeCal.id}`).collection('places').doc(placeId).delete().catch(e => {});
      } catch (e) {
        console.warn('Failed to delete place from Firestore:', e);
      }
    }
    const existingPlaces = getCalendarPlaces(activeCal);
    const deletedPlace = existingPlaces.find(p => p.id === placeId);
    if (!deletedPlace) return false;
    const now = Date.now();
    const nextPlaces = existingPlaces.filter(p => p.id !== placeId);
    const placeActivityLog = createActivityLog(activeCal.id, 'place_delete', '', '', now, deletedPlace.name || '장소');
    const updatedCal = {
      ...activeCal,
      places: nextPlaces,
      updatedAt: now,
      revision: (activeCal.revision || 0) + 1,
      activityLogs: placeActivityLog ? [...getCalendarActivityLogs(activeCal), placeActivityLog] : getCalendarActivityLogs(activeCal)
    };
    const nextCalendars = calendars.map(c => c.id === updatedCal.id ? updatedCal : c);
    return updateCalendars(nextCalendars, '장소 삭제완료', 'delete', updatedCal.id, 'settings', placeActivityLog ? [placeActivityLog] : []);
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
    setEditingPoll(null);
    setIsPollModalOpen(true);
  };
  const handleOpenPollEdit = poll => {
    if (!guardLoadedCalendar('Firebase 데이터를 불러온 뒤 투표를 수정해 주세요.')) return;
    setEditingPoll(poll);
    setIsPollModalOpen(true);
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
      return updateCalendars(nextCalendars, '설정 저장완료', 'success', stampedCal.id, 'settings');
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
    return updateCalendars(nextCalendars, '날씨 지역 설정 완료', 'success', updatedCal.id, 'settings');
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
    return updateCalendars(nextCalendars, '자주 찾는 지역이 삭제되었습니다.', 'success', updatedCal.id, 'settings');
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
    return updateCalendars(nextCalendars, '공지 등록완료', 'success', updatedCal.id, 'settings');
  };
  const handleRemovePinnedNotice = (noticeId) => {
    if (!guardLoadedCalendar()) return false;
    const target = getPinnedNotices(activeCal).find(n => n.id === noticeId);
    const noticeText = target ? target.text : '';
    const shortText = noticeText.length > 30 ? noticeText.substring(0, 30) + '...' : noticeText;
    showConfirmDialog(
      '공지사항 삭제',
      `"${shortText}" 내용의 공지사항을 삭제하시겠습니까?`,
      () => {
        const now = Date.now();
        const updatedCal = {
          ...activeCal,
          pinnedNotices: getPinnedNotices(activeCal).filter(n => n.id !== noticeId),
          pinnedNotice: null,
          updatedAt: now,
          revision: (activeCal.revision || 0) + 1
        };
        const nextCalendars = calendars.map(c => c.id === updatedCal.id ? updatedCal : c);
        updateCalendars(nextCalendars, '공지 삭제완료', 'success', updatedCal.id, 'settings');
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
      anniversaries: anniversaries,
      dateStr: selectedDate,
      calendar: activeCal,
      chatMessages: allChatMessages,
      onSave: handleSaveAvailability,
      onDelete: handleDeleteAvailability,
      onDeleteDate: handleDeleteAllForDate,
      onConfirmMeeting: handleConfirmMeeting,
      onSaveExpense: handleSaveExpense,
      onDeleteExpense: handleDeleteExpense,
      onReorderExpenses: handleReorderExpenses,
      onAddMeetingPhotos: handleAddMeetingPhotos,
      onFindChatMessageById: findChatMessageById,
      onLoadOlderChat: loadOlderChatMessages,
      hasMoreOlderChat: hasMoreOlderChat,
      loadingOlderChat: loadingOlderChat,
      setActiveLightbox: setActiveLightbox,
      initialTab: dateModalInitialTab,
      onSavePlace: handleSavePlace,
      onDeletePlace: handleDeletePlace,
      showToast: showToast,
      onRequestConfirm: showConfirmDialog,
      onClose: () => { setIsModalOpen(false); setDateModalInitialTab(null); },
      onParticipantClick: handleParticipantClick
    }),
    confirmDialog && /*#__PURE__*/React.createElement(ConfirmDialog, {
      title: confirmDialog.title,
      message: confirmDialog.message,
      onConfirm: confirmDialog.onConfirm,
      onCancel: () => setConfirmDialog(null),
      showPasswordInput: confirmDialog.showPasswordInput
    }),
    deletingMessage && /*#__PURE__*/React.createElement(DeleteConfirmModal, {
      message: deletingMessage,
      calendar: activeCal,
      onConfirm: handleConfirmDeleteMessage,
      onCancel: () => setDeletingMessage(null)
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
      anniversaries: anniversaries,
      calendar: { ...activeCal, activityLogs: unionActivityLogs(activeCal, adminActivityLogs) },
      allCalendars: calendars,
      onSelectCalendar: handleSelectCalendar,
      onLoadActivityLogs: loadAdminActivityLogs,
      onSave: handleSaveAdmin,
      recentMessages: recentMessages,
      chatMessages: chatMessages,
      onDeleteMessage: handleDeleteMessage,
      onDeleteAvailability: handleDeleteAvailability,
      onDeleteAllForDate: handleDeleteAllForDate,
      onBulkRegister: handleBulkRegisterAvailability,
      onRequestConfirm: showConfirmDialog,
      onClose: () => setIsAdminOpen(false),
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
            meta: entries.map(e => ({ timestamp: msg.timestamp, messageId: msg.id, imageIndex: e.imageIndex, thumb: e.thumb, tags: e.tags, directMediaUrl: e.directMediaUrl, source: e.source, uploadSource: e.uploadSource })),
            index: directMediaUrl ? 0 : imageIndex
          });
        }, 350);
      }
    }),
    isGlobalSearchOpen && /*#__PURE__*/React.createElement(GlobalSearchModal, {
      calendar: activeCal,
      chatMessages: chatMessages,
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
            meta: entries.map(e => ({ timestamp: msg.timestamp, messageId: msg.id, imageIndex: e.imageIndex, thumb: e.thumb, tags: e.tags, directMediaUrl: e.directMediaUrl, source: e.source, uploadSource: e.uploadSource })),
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
      className: "toast",
      style: {
        position: 'fixed',
        bottom: '32px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 99999,
        backgroundColor: toast.type === 'delete' ? '#EF4444' : toast.type === 'success' ? '#10B981' : '#3B82F6',
        color: '#FFFFFF',
        padding: '12px 24px',
        borderRadius: 'var(--radius-md)',
        boxShadow: '0 12px 32px rgba(0,0,0,0.25)',
        fontSize: '0.95rem',
        fontWeight: '800',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        textAlign: 'center',
        wordBreak: 'break-all',
        whiteSpace: 'pre-wrap',
        maxWidth: '380px',
        width: '90%',
        boxSizing: 'border-box'
      }
    }, toast.message),
    isNotificationHelpOpen && /*#__PURE__*/React.createElement(NotificationPermissionHelpModal, {
      onClose: () => setIsNotificationHelpOpen(false),
      onRetry: handleMainToggleNotifications,
      showToast: showToast
    }),
    operationProgress && !chatUploadProgress && /*#__PURE__*/React.createElement(OperationProgressOverlay, operationProgress),
    chatUploadProgress && /*#__PURE__*/React.createElement(ImageUploadOverlay, chatUploadProgress)
  );
  if (activeView === 'chat') {
    return withStickyVideo(/*#__PURE__*/React.createElement("div", { className: "chat-view-container" }, /*#__PURE__*/React.createElement(ChatRoomView, {
      calendar: activeCal,
      chatMessages: allChatMessages,
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
      activeLightbox: activeLightbox,
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
      externalFocusMessageId: externalFocusMsgId
    })));
  }

  if (activeView === 'settlement') {
    return withStickyVideo(/*#__PURE__*/React.createElement(SettlementSummaryModal, {
      calendar: activeCal,
      onBack: () => changeView('calendar'),
      onSelectDate: d => {
        setSelectedDate(d);
        setIsModalOpen(true);
        changeView('calendar');
      }
    }));
  }

  if (activeView === 'memo') {
    return withStickyVideo(/*#__PURE__*/React.createElement(MemoView, {
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
      }
    }));
  }

  if (activeView === 'gallery') {
    return withStickyVideo(/*#__PURE__*/React.createElement(React.Fragment, null,
      /*#__PURE__*/React.createElement(ChatGalleryModal, {
        calendar: activeCal,
        chatMessages: allChatMessages,
        memos: memos,
        asPage: true,
        onClose: () => changeView('calendar'),
        onUploadImages: handleUploadGalleryImages,
        onOpenShare: () => {
          if (guardLoadedCalendar('Firebase 데이터를 불러온 뒤 공유 정보를 확인해 주세요.')) setIsShareOpen(true);
        },
        setActiveLightbox: setActiveLightbox,
        hasMoreOlderChat: hasMoreOlderChat,
        loadingOlderChat: loadingOlderChat,
        onLoadOlderChat: loadOlderChatMessages,
        hasMoreMemos: hasMoreMemos,
        onLoadMoreMemos: () => setMemosLimit(prev => prev + MEMOS_PAGE_SIZE),
        totalGalleryCount: totalGalleryCount,
        isDarkTheme: isDarkTheme,
        onToggleTheme: toggleTheme,
        fontScalePercent: fontScalePercent,
        onDecreaseFont: () => setFontScalePercent(prev => Math.max(80, prev - 10)),
        onIncreaseFont: () => setFontScalePercent(prev => Math.min(130, prev + 10)),
        isChatNotifyEnabled: mainNotifPermission === 'granted' && mainChatNotifyEnabled,
        onToggleChatNotifications: handleMainToggleNotifications,
        showToast: showToast
      }),
      activeLightbox ? /*#__PURE__*/React.createElement(Lightbox, {
        urls: activeLightbox.urls,
        index: activeLightbox.index,
        meta: activeLightbox.meta,
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
        onRequestConfirm: showConfirmDialog
      }) : null
    ));
  }

  if (activeView === 'places') {
    return withStickyVideo(/*#__PURE__*/React.createElement(React.Fragment, null,
      /*#__PURE__*/React.createElement(PlacesView, {
        calendar: activeCal,
        onBack: () => changeView('calendar'),
        onSavePlace: handleSavePlace,
        onDeletePlace: handleDeletePlace,
        showToast: showToast,
        onRequestConfirm: showConfirmDialog,
        placesInitialQuery: placesInitialQuery,
        setPlacesInitialQuery: setPlacesInitialQuery,
        isDarkTheme: isDarkTheme,
        onToggleTheme: toggleTheme,
        fontScalePercent: fontScalePercent,
        onDecreaseFont: () => setFontScalePercent(prev => Math.max(80, prev - 10)),
        onIncreaseFont: () => setFontScalePercent(prev => Math.min(130, prev + 10)),
        isChatNotifyEnabled: mainNotifPermission === 'granted' && mainChatNotifyEnabled,
        onToggleChatNotifications: handleMainToggleNotifications,
        onSharePlaces: () => setIsPlacesShareOpen(true)
      }),
      isPlacesShareOpen && activeCal && /*#__PURE__*/React.createElement(ShareModal, {
        calendar: activeCal,
        shareType: "places",
        showToast: showToast,
        onClose: () => setIsPlacesShareOpen(false)
      })
    ));
  }

  const mainMenuPollCount = getCalendarPolls(activeCal).filter(poll => !isPollClosed(poll)).length;
  const mainMenuChatCount = (typeof totalChatCount === 'number' && totalChatCount >= 0)
    ? totalChatCount
    : Math.max(allChatMessages.length, (chatMessages || []).length);
  const mainMenuChatLatestTimestamp = allChatMessages.length > 0 ? allChatMessages[allChatMessages.length - 1].timestamp : 0;
  const mainMenuChatHasUnread = mainMenuChatLatestTimestamp > getChatLastReadTimestamp(activeCalId);
  const localGalleryCount = (() => {
    let count = 0;
    const directUrls = new Set();
    (activeCal?.confirmedMeeting || []).forEach(m => {
      (m.photos || []).forEach(p => {
        const u = p && (p.imageUrl || p.thumbUrl || p.full || p.thumb);
        if (u && !directUrls.has(u)) {
          directUrls.add(u);
          count++;
        }
      });
    });
    const allMsgs = (allChatMessages && allChatMessages.length > 0) ? allChatMessages : (chatMessages || []);
    allMsgs.forEach(msg => {
      const getEntries = typeof getMessageImageEntries === 'function' ? getMessageImageEntries : null;
      const getDirect = typeof getAllDirectMediaImageEntries === 'function' ? getAllDirectMediaImageEntries : (typeof getMessageDirectMediaEntry === 'function' ? m => [getMessageDirectMediaEntry(m)].filter(Boolean) : () => []);
      const entries = getEntries ? [...getEntries(msg), ...getDirect(msg)] : [];
      if (entries.length > 0) {
        entries.forEach(e => {
          const u = e.full || e.thumb || e.imageUrl;
          if (u && !directUrls.has(u)) {
            directUrls.add(u);
            count++;
          }
        });
      } else {
        const u = msg.imageUrl || msg.thumbUrl;
        if (u && !directUrls.has(u)) {
          directUrls.add(u);
          count++;
        }
      }
    });
    (memos || []).forEach(memo => {
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
        if (u && !directUrls.has(u)) {
          directUrls.add(u);
          count++;
        }
      });
    });
    return count;
  })();

  const mainMenuMemoCount = (typeof totalMemoCount === 'number' && totalMemoCount >= 0)
    ? totalMemoCount
    : (memos || []).length;
  const mainMenuGalleryCount = (typeof totalGalleryCount === 'number' && totalGalleryCount >= 0)
    ? Math.max(totalGalleryCount, localGalleryCount)
    : localGalleryCount;
  const mainMenuPlaceCount = getCalendarPlaces(activeCal).length;

  // Each confirmed meeting gets its own banner bubble on the calendar, and stays up through
  // the day of the meeting itself -- only today-or-future confirmations show.
  const todayDateStrForBanner = (() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  })();
  const visibleConfirmedMeetings = getTrulyConfirmedMeetings(activeCal)
    .filter(m => m.date >= todayDateStrForBanner)
    .sort((a, b) => a.date.localeCompare(b.date));

  return withStickyVideo(/*#__PURE__*/React.createElement("div", {
    className: "app-container",
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
  }, /*#__PURE__*/React.createElement(SearchIcon, null)), /*#__PURE__*/React.createElement("button", {
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
      setPollsExpandSignal(prev => prev + 1);
      scrollToSection(pollsSectionRef);
    }
  }, /*#__PURE__*/React.createElement("span", { className: "main-menu-icon" }, /*#__PURE__*/React.createElement(MenuIcon, { paths: ["M9 11l3 3l8 -8", "M20 12v6a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2v-12a2 2 0 0 1 2 -2h9"] })), /*#__PURE__*/React.createElement("span", { className: "main-menu-label-full" }, "투표"), /*#__PURE__*/React.createElement("span", { className: "main-menu-label-short" }, "투표"), mainMenuPollCount > 0 && /*#__PURE__*/React.createElement("span", {
    className: "main-menu-badge"
  }, mainMenuPollCount)), /*#__PURE__*/React.createElement("div", { className: "main-menu-sep" }), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "main-menu-item",
    onClick: () => changeView('chat')
  }, /*#__PURE__*/React.createElement("span", { className: "main-menu-icon" }, /*#__PURE__*/React.createElement(MenuIcon, { paths: ["M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"] })), /*#__PURE__*/React.createElement("span", { className: "main-menu-label-full" }, "채팅"), /*#__PURE__*/React.createElement("span", { className: "main-menu-label-short" }, "채팅"), mainMenuChatCount > 0 && /*#__PURE__*/React.createElement("span", {
    className: `main-menu-badge${mainMenuChatHasUnread ? ' is-unread' : ''}`
  }, mainMenuChatCount)), /*#__PURE__*/React.createElement("div", { className: "main-menu-sep" }), /*#__PURE__*/React.createElement("button", {
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
      })()), /*#__PURE__*/React.createElement("div", { className: "main-menu-sep" }), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "main-menu-item",
    onClick: () => {
      if (guardLoadedCalendar('Firebase 데이터를 불러온 뒤 메모 정보를 확인해 주세요.')) changeView('memo');
    }
  }, /*#__PURE__*/React.createElement("span", { className: "main-menu-icon" }, /*#__PURE__*/React.createElement(NotepadTextIcon, null)), /*#__PURE__*/React.createElement("span", { className: "main-menu-label-full" }, "메모"), /*#__PURE__*/React.createElement("span", { className: "main-menu-label-short" }, "메모"), activeCal && mainMenuMemoCount > 0 && /*#__PURE__*/React.createElement("span", {
    className: "main-menu-badge"
  }, mainMenuMemoCount))))), isMainSideMenuOpen && /*#__PURE__*/React.createElement(MainSideMenu, {
    calendar: activeCal,
    anniversaries: anniversaries,
    galleryCount: mainMenuGalleryCount,
    placeCount: mainMenuPlaceCount,
    onClose: () => setIsMainSideMenuOpen(false),
    onOpenManual: () => {
      setIsGuideOpen(true);
      setIsMainSideMenuOpen(false);
    },
    onOpenSettings: () => {
      setIsMainSideMenuOpen(false);
      if (guardLoadedCalendar('Firebase 데이터를 불러온 뒤 설정을 수정해 주세요.')) setIsAdminOpen(true);
    },
    onOpenAnniversaries: () => {
      setIsMainSideMenuOpen(false);
      if (guardLoadedCalendar('Firebase 데이터를 불러온 뒤 기념일 설정을 수정해 주세요.')) setIsAnniversariesOpen(true);
    },
    onOpenShare: () => {
      setIsMainSideMenuOpen(false);
      if (guardLoadedCalendar('Firebase 데이터를 불러온 뒤 공유 정보를 확인해 주세요.')) setIsShareOpen(true);
    },
    onOpenAdmin: () => window.open(`${window.location.pathname}?admin=1`, '_blank', 'noopener,noreferrer'),
    onOpenGallery: () => changeView('gallery'),
    onChangeView: changeView,
    isDarkTheme: isDarkTheme,
    onToggleTheme: toggleTheme,
    fontScalePercent: fontScalePercent,
    onDecreaseFont: () => setFontScalePercent(prev => Math.max(80, prev - 10)),
    onIncreaseFont: () => setFontScalePercent(prev => Math.min(130, prev + 10)),
    isChatNotifyEnabled: mainNotifPermission === 'granted' && mainChatNotifyEnabled,
    onToggleChatNotifications: handleMainToggleNotifications,
    onUpdateWeatherLocation: handleUpdateWeatherLocation,
    onDeleteRecentLocation: handleDeleteRecentWeatherLocation,
    showToast: showToast
  }), isGalleryOpen && /*#__PURE__*/React.createElement(ChatGalleryModal, {
    calendar: activeCal,
    chatMessages: chatMessages,
    onClose: () => setIsGalleryOpen(false),
    onUploadImages: handleUploadGalleryImages,
    onOpenShare: () => {
      if (guardLoadedCalendar('Firebase 데이터를 불러온 뒤 공유 정보를 확인해 주세요.')) setIsShareOpen(true);
    },
    setActiveLightbox: setActiveLightbox,
    showToast: showToast
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
    onClose: () => setIsAnniversariesOpen(false),
    showToast: showToast,
    onRequestConfirm: showConfirmDialog,
    onBulkRegister: handleBulkRegisterAvailability,
    isDarkTheme: isDarkTheme
  }), /*#__PURE__*/React.createElement("div", {
    ref: calendarSectionRef
  }, visibleConfirmedMeetings.length > 0 && /*#__PURE__*/React.createElement("div", {
    style: { display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }
  }, visibleConfirmedMeetings.map(meeting => {
    const memoEntries = getActiveAvailabilities(activeCal).filter(e => e.date === meeting.date && e.note && e.note.trim());
    return /*#__PURE__*/React.createElement("div", {
      key: meeting.date,
      style: {
        background: 'linear-gradient(var(--bg-card), var(--bg-card)) padding-box, var(--accent-gradient) border-box',
        border: '1px solid transparent',
        borderRadius: 'var(--radius-md)',
        padding: '10px 14px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        cursor: 'pointer'
      },
      onClick: () => {
        if (!guardLoadedCalendar()) return;
        setSelectedDate(meeting.date);
        setIsModalOpen(true);
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }
    }, /*#__PURE__*/React.createElement("span", {
      className: "memo-capsule-badge confirmed-meeting-label-badge"
    }, formatConfirmedMeetingLabel(meeting.date)), /*#__PURE__*/React.createElement("span", {
      className: "dday-badge"
    }, formatDDayLabel(meeting.date))), memoEntries.length > 0 && /*#__PURE__*/React.createElement("div", {
      style: { display: 'flex', flexWrap: 'wrap', gap: '8px' }
    }, memoEntries.map(entry => {
      const p = getActiveParticipants(activeCal).find(part => part.id === entry.participantId);
      if (!p) return null;
      const entryUrl = extractFirstUrl(entry.note);
      const noteTextOnly = entryUrl ? removeFirstUrl(entry.note) : entry.note.trim();
      if (!noteTextOnly) return null;
      return /*#__PURE__*/React.createElement("span", {
        key: entry.participantId,
        className: "memo-capsule-badge",
        style: { backgroundColor: p.color, color: getContrastTextColor(p.color) },
        title: `${p.name}: ${noteTextOnly}`
      }, noteTextOnly);
    })));
  })), /*#__PURE__*/React.createElement(CalendarGrid, {
    anniversaries: anniversaries,
    calendar: activeCal,
    isLoading: isInitialDataLoading,
    monthDate: currentMonthDate,
    onPrevMonth: () => setCurrentMonthDate(new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() - 1, 1)),
    onNextMonth: () => setCurrentMonthDate(new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() + 1, 1)),
    onToday: () => setCurrentMonthDate(new Date()),
    onJumpToMonth: (y, m) => setCurrentMonthDate(new Date(y, m, 1)),
    onSelectDate: d => {
      if (!guardLoadedCalendar()) return;
      setSelectedDate(d);
      setIsModalOpen(true);
    },
    onMoveAvailability: handleMoveAvailability,
    onParticipantClick: handleParticipantClick
  })), /*#__PURE__*/React.createElement("div", {
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
  })), /*#__PURE__*/React.createElement("div", {
    className: "calendar-card",
    style: {
      padding: '16px',
      marginTop: '-12px'
    }
  }, /*#__PURE__*/React.createElement(CommentsSection, {
    calendar: activeCal,
    recentMessages: recentMessages,
    chatMessages: allChatMessages,
    totalChatCount: totalChatCount,
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
    activeLightbox: activeLightbox,
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
  })), /*#__PURE__*/React.createElement(SummaryList, {
    calendar: activeCal,
    onSelectDate: d => {
      if (!guardLoadedCalendar()) return;
      setSelectedDate(d);
      setIsModalOpen(true);
    }
  }), /*#__PURE__*/React.createElement(PhotoGallery, {
    chatMessages: (galleryPreviewMessages && galleryPreviewMessages.length > 0) ? galleryPreviewMessages : allChatMessages,
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
    onRequestConfirm: showConfirmDialog
  }), /*#__PURE__*/React.createElement(PlacesSection, {
    calendar: activeCal,
    onViewAll: () => changeView('places')
  }), /*#__PURE__*/React.createElement(Footer, null)));
}

// ---- Korean public holidays, substitute holidays, and 24 solar terms ----
// Base facts are hardcoded (fixed-date holidays; lunar-holiday solar dates, verified
// against Wikipedia's "Public holidays in South Korea" 1994-2050 table); consequences
// (대체공휴일) are computed from the legal rule so edge cases self-correct.

// Solar-date anchors for lunar-based holidays (설날/추석/부처님오신날), 2021-2032.
const GATHER_APP_CALENDAR_DATA = window.GATHER_APP_CALENDAR_DATA || {};
const KOREAN_LUNAR_HOLIDAY_DATES = GATHER_APP_CALENDAR_DATA.KOREAN_LUNAR_HOLIDAY_DATES || {
  2021: { seollal: '2021-02-12', chuseok: '2021-09-21', buddha: '2021-05-19' },
  2022: { seollal: '2022-02-01', chuseok: '2022-09-10', buddha: '2022-05-08' },
  2023: { seollal: '2023-01-22', chuseok: '2023-09-29', buddha: '2023-05-27' },
  2024: { seollal: '2024-02-10', chuseok: '2024-09-17', buddha: '2024-05-15' },
  2025: { seollal: '2025-01-29', chuseok: '2025-10-06', buddha: '2025-05-05' },
  2026: { seollal: '2026-02-17', chuseok: '2026-09-25', buddha: '2026-05-24' },
  2027: { seollal: '2027-02-07', chuseok: '2027-09-15', buddha: '2027-05-13' },
  2028: { seollal: '2028-01-27', chuseok: '2028-10-03', buddha: '2028-05-02' },
  2029: { seollal: '2029-02-13', chuseok: '2029-09-22', buddha: '2029-05-20' },
  2030: { seollal: '2030-02-03', chuseok: '2030-09-12', buddha: '2030-05-09' },
  2031: { seollal: '2031-01-23', chuseok: '2031-10-01', buddha: '2031-05-28' },
  2032: { seollal: '2032-02-11', chuseok: '2032-09-19', buddha: '2032-05-16' }
};

// One-off government-designated days off (임시공휴일) - not derivable from the standing law.
const KOREAN_TEMPORARY_HOLIDAYS = Array.isArray(GATHER_APP_CALENDAR_DATA.KOREAN_TEMPORARY_HOLIDAYS) ? GATHER_APP_CALENDAR_DATA.KOREAN_TEMPORARY_HOLIDAYS : [{ date: '2023-10-02', name: '임시공휴일' }, { date: '2025-01-27', name: '임시공휴일' }];

// subType controls 대체공휴일 eligibility: 'weekend' = substitute if Sat or Sun,
// 'sunday' = substitute if Sun only (설날/추석), 'none' = never substitutes.
// fromYear = the holiday itself didn't exist/wasn't a red day before that year.
// subFromYear = the holiday already existed, but only became substitute-eligible
// from that year (관공서의 공휴일에 관한 규정 개정 이력: 삼일절/광복절/개천절/한글날
// 대체공휴일 2021년 확대 시행, 부처님오신날/성탄절은 2023년부터 확대 적용).
const KOREAN_FIXED_HOLIDAYS = Array.isArray(GATHER_APP_CALENDAR_DATA.KOREAN_FIXED_HOLIDAYS) ? GATHER_APP_CALENDAR_DATA.KOREAN_FIXED_HOLIDAYS : [{ month: 1, day: 1, name: '신정', subType: 'none' }, { month: 3, day: 1, name: '삼일절', subType: 'weekend', subFromYear: 2022 }, { month: 5, day: 5, name: '어린이날', subType: 'weekend' }, { month: 6, day: 6, name: '현충일', subType: 'none' }, { month: 7, day: 17, name: '제헌절', subType: 'weekend', fromYear: 2026 }, { month: 8, day: 15, name: '광복절', subType: 'weekend', subFromYear: 2021 }, { month: 10, day: 3, name: '개천절', subType: 'weekend', subFromYear: 2021 }, { month: 10, day: 9, name: '한글날', subType: 'weekend', subFromYear: 2021 }, { month: 12, day: 25, name: '성탄절', subType: 'weekend', subFromYear: 2023 }, { month: 5, day: 1, name: '노동절', subType: 'none', fromYear: 2026 }];

function koreanYmd(y, m, d) {
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}
function koreanDateStrToDate(s) {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}
function koreanAddDays(s, n) {
  const dt = koreanDateStrToDate(s);
  dt.setDate(dt.getDate() + n);
  return koreanYmd(dt.getFullYear(), dt.getMonth() + 1, dt.getDate());
}
function koreanDayOfWeek(s) {
  return koreanDateStrToDate(s).getDay();
}

function getKoreanHolidayEntriesForYear(year) {
  const entries = [];
  KOREAN_FIXED_HOLIDAYS.forEach(h => {
    if (h.fromYear && year < h.fromYear) return;
    const subType = h.subFromYear && year < h.subFromYear ? 'none' : h.subType;
    entries.push({ date: koreanYmd(year, h.month, h.day), name: h.name, subType, groupId: `${h.name}-${year}` });
  });
  KOREAN_TEMPORARY_HOLIDAYS.forEach(h => {
    if (h.date.startsWith(`${year}-`)) {
      entries.push({ date: h.date, name: h.name, subType: 'none', groupId: `temp-${h.date}` });
    }
  });
  const lunar = KOREAN_LUNAR_HOLIDAY_DATES[year];
  if (lunar) {
    const seollalGroup = `seollal-${year}`;
    entries.push({ date: koreanAddDays(lunar.seollal, -1), name: '설날 연휴', subType: 'sunday', groupId: seollalGroup });
    entries.push({ date: lunar.seollal, name: '설날', subType: 'sunday', groupId: seollalGroup });
    entries.push({ date: koreanAddDays(lunar.seollal, 1), name: '설날 연휴', subType: 'sunday', groupId: seollalGroup });
    const chuseokGroup = `chuseok-${year}`;
    entries.push({ date: koreanAddDays(lunar.chuseok, -1), name: '추석 연휴', subType: 'sunday', groupId: chuseokGroup });
    entries.push({ date: lunar.chuseok, name: '추석', subType: 'sunday', groupId: chuseokGroup });
    entries.push({ date: koreanAddDays(lunar.chuseok, 1), name: '추석 연휴', subType: 'sunday', groupId: chuseokGroup });
    entries.push({ date: lunar.buddha, name: '부처님오신날', subType: year >= 2023 ? 'weekend' : 'none', groupId: `buddha-${year}` });
  }
  return entries;
}

// Computes the full holiday list for a year, including programmatically-derived
// 대체공휴일 (substitute holidays). Overlapping holidays (same exact date, e.g.
// 어린이날+부처님오신날 in 2025) and weekend-triggered holidays are merged into a
// single component via union-find so only ONE substitute is granted per triggering
// event, matching the actual legal rule.
function computeKoreanHolidaysForYear(year) {
  const entries = getKoreanHolidayEntriesForYear(year);
  const parent = entries.map((_, i) => i);
  function find(x) { while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x]; } return x; }
  function union(a, b) { const ra = find(a), rb = find(b); if (ra !== rb) parent[ra] = rb; }
  const groupIdxMap = {};
  entries.forEach((e, i) => { (groupIdxMap[e.groupId] = groupIdxMap[e.groupId] || []).push(i); });
  Object.values(groupIdxMap).forEach(idxs => { for (let i = 1; i < idxs.length; i++) union(idxs[0], idxs[i]); });
  const dateIdxMap = {};
  entries.forEach((e, i) => { (dateIdxMap[e.date] = dateIdxMap[e.date] || []).push(i); });
  Object.values(dateIdxMap).forEach(idxs => { for (let i = 1; i < idxs.length; i++) union(idxs[0], idxs[i]); });
  const components = {};
  entries.forEach((e, i) => { const r = find(i); (components[r] = components[r] || []).push(e); });

  const occupied = new Set(entries.map(e => e.date));
  const substitutes = [];
  Object.values(components).forEach(comp => {
    let triggered = false;
    comp.forEach(e => {
      if (e.subType === 'none') return;
      const dow = koreanDayOfWeek(e.date);
      if (e.subType === 'weekend' && (dow === 0 || dow === 6)) triggered = true;
      if (e.subType === 'sunday' && dow === 0) triggered = true;
    });
    if (!triggered) {
      const byDate = {};
      comp.forEach(e => { (byDate[e.date] = byDate[e.date] || []).push(e); });
      Object.values(byDate).forEach(list => {
        if (list.length > 1 && list.some(e => e.subType !== 'none')) triggered = true;
      });
    }
    if (!triggered || !comp.some(e => e.subType !== 'none')) return;
    const lastDate = comp.map(e => e.date).sort().slice(-1)[0];
    let cand = koreanAddDays(lastDate, 1);
    while (true) {
      const dow = koreanDayOfWeek(cand);
      if (dow !== 0 && dow !== 6 && !occupied.has(cand)) break;
      cand = koreanAddDays(cand, 1);
    }
    occupied.add(cand);
    const label = [...new Set(comp.map(e => e.name.replace(' 연휴', '')))].join('·');
    substitutes.push({ date: cand, name: `대체공휴일(${label})` });
  });

  return entries.concat(substitutes);
}

// Single-date holiday name lookup (e.g. for DateModal's header) -- CalendarGrid's own
// holidayMap is memoized per rendered month range, which isn't available outside that
// component, so this recomputes just the one year a given date falls in.
function getHolidayNamesForDate(dateStr) {
  if (!dateStr) return [];
  const year = parseInt(dateStr.slice(0, 4), 10);
  if (!year) return [];
  return computeKoreanHolidaysForYear(year).filter(e => e.date === dateStr).map(e => e.name);
}

// 24 solar terms (24절기) via the standard low-precision solar-longitude formula
// (Meeus/USNO, ~0.01deg accuracy). Validated against 19 KASI-derived reference
// dates spanning 2025-2027 with zero mismatches; no external data table needed.
const KOREAN_SOLAR_TERMS = Array.isArray(GATHER_APP_CALENDAR_DATA.KOREAN_SOLAR_TERMS) ? GATHER_APP_CALENDAR_DATA.KOREAN_SOLAR_TERMS : [['소한', 285], ['대한', 300], ['입춘', 315], ['우수', 330], ['경칩', 345], ['춘분', 0], ['청명', 15], ['곡우', 30], ['입하', 45], ['소만', 60], ['망종', 75], ['하지', 90], ['소서', 105], ['대서', 120], ['입추', 135], ['처서', 150], ['백로', 165], ['추분', 180], ['한로', 195], ['상강', 210], ['입동', 225], ['소설', 240], ['대설', 255], ['동지', 270]];

function koreanJulianDayUTC(year, month, day, hourUTC) {
  let y = year, m = month;
  if (m <= 2) { y -= 1; m += 12; }
  const A = Math.floor(y / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + B - 1524.5 + hourUTC / 24;
}
function koreanSunEclipticLongitudeDeg(jd) {
  const D = jd - 2451545.0;
  let L = 280.460 + 0.9856474 * D;
  let g = 357.528 + 0.9856003 * D;
  L = ((L % 360) + 360) % 360;
  g = ((g % 360) + 360) % 360;
  const gRad = g * Math.PI / 180;
  const lambda = L + 1.915 * Math.sin(gRad) + 0.020 * Math.sin(2 * gRad);
  return ((lambda % 360) + 360) % 360;
}
function koreanLongitudeAtKstMidnight(year, month, day) {
  // KST 00:00 of (y,m,d) = UTC previous-day 15:00, i.e. 9 hours before that date's 00:00 UTC.
  return koreanSunEclipticLongitudeDeg(koreanJulianDayUTC(year, month, day, -9));
}
function findKoreanSolarTermDate(year, targetDeg) {
  let cur = { y: year - 1, m: 12, d: 15 };
  let prevUnwrapped = koreanLongitudeAtKstMidnight(cur.y, cur.m, cur.d);
  let offset = 0;
  for (let i = 0; i < 400; i++) {
    const nextStr = koreanAddDays(koreanYmd(cur.y, cur.m, cur.d), 1);
    const [ny, nm, nd] = nextStr.split('-').map(Number);
    const next = { y: ny, m: nm, d: nd };
    let lon = koreanLongitudeAtKstMidnight(next.y, next.m, next.d);
    let unwrapped = lon + offset;
    if (unwrapped < prevUnwrapped - 1) { offset += 360; unwrapped = lon + offset; }
    for (let k = -1; k <= 2; k++) {
      const tgt = targetDeg + k * 360;
      // The crossing happens sometime during the KST calendar day "cur" (between cur's
      // and next's KST midnights), so the term always falls on `cur`, not `next`.
      if (prevUnwrapped <= tgt && tgt < unwrapped && cur.y === year) {
        return cur;
      }
    }
    prevUnwrapped = unwrapped;
    cur = next;
  }
  return null;
}
function getKoreanSolarTermsForYear(year) {
  const map = {};
  KOREAN_SOLAR_TERMS.forEach(([name, deg]) => {
    const r = findKoreanSolarTermDate(year, deg);
    if (r) map[koreanYmd(r.y, r.m, r.d)] = name;
  });
  return map;
}

// Calendar Grid Component
function CalendarGrid(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.CalendarGrid;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function CommentsSection(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.CommentsSection;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function MemoCard(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.MemoCard;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function PollList(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.PollList;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function GlobalSearchModal(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.GlobalSearchModal;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function EditMessageModal(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.EditMessageModal;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}


// Comments / Chat Icons & Utilities
const getLocalStorage = () => {
  return window['local' + 'Storage'];
};

// Per-calendar "last read" chat timestamp, stored locally per browser/device (no server
// concept of read state). Used to color the chat count badge gray (all read) vs red
// (unread messages newer than the last time this section was expanded).
const CHAT_LAST_READ_KEY_PREFIX = 'gather_chat_last_read_v1_';
function getChatLastReadTimestamp(calendarId) {
  try {
    const raw = getLocalStorage().getItem(CHAT_LAST_READ_KEY_PREFIX + calendarId);
    return raw ? Number(raw) || 0 : 0;
  } catch (e) {
    return 0;
  }
}
function setChatLastReadTimestamp(calendarId, timestamp) {
  try {
    getLocalStorage().setItem(CHAT_LAST_READ_KEY_PREFIX + calendarId, String(timestamp));
  } catch (e) {
    // ignore (private browsing / storage disabled)
  }
}

// Link preview (OpenGraph via peekalink.io's API), fetched through the peekalinkProxy Cloud
// Function (functions/index.js) instead of calling api.peekalink.io directly from the browser.
// This is a static site with no backend of its own, so the Peekalink API key previously had to
// live in this client-shipped file (visible to anyone via view-source) -- it now lives ONLY in
// the Cloud Function's source, which never reaches the browser, and the proxy forwards requests
// server-side with it. Cached at module scope (by URL) so re-renders and repeated occurrences of
// the same link don't refetch, and in-flight requests are deduped across simultaneously-mounting
// message bubbles.
const PEEKALINK_PROXY_URL = `https://us-central1-${firebaseConfig.projectId}.cloudfunctions.net/peekalinkProxy`;
const GATHER_APP_CHAT_DATA = window.GATHER_APP_CHAT_DATA || {};
const linkPreviewCache = new Map();
const linkPreviewInflight = new Map();
const LINK_PREVIEW_CACHE_MAX_ENTRIES = 300;
// Unlike linkPreviewInflight (self-cleans via .delete() once each fetch settles),
// linkPreviewCache has no natural cap -- every distinct link ever previewed across the whole
// session stays in memory. Low severity for a normal session, but a calendar left open for
// weeks with lots of shared links could accumulate indefinitely, so evict the oldest entry
// (Map preserves insertion order) once this grows past a generous ceiling.
function cacheLinkPreview(url, result) {
  linkPreviewCache.set(url, result);
  if (linkPreviewCache.size > LINK_PREVIEW_CACHE_MAX_ENTRIES) {
    const oldestKey = linkPreviewCache.keys().next().value;
    if (oldestKey !== undefined) linkPreviewCache.delete(oldestKey);
  }
}
// Peekalink's free plan is a 50-request-per-hour rate limit, not a fixed lifetime quota --
// it resets every clock hour rather than depleting over time. See PEEKALINK_HOUR_BUCKET_MS below.
const PEEKALINK_FREE_HOURLY_LIMIT = Number.isFinite(GATHER_APP_CHAT_DATA.PEEKALINK_FREE_HOURLY_LIMIT) ? GATHER_APP_CHAT_DATA.PEEKALINK_FREE_HOURLY_LIMIT : 50;
const PEEKALINK_HOUR_BUCKET_MS = Number.isFinite(GATHER_APP_CHAT_DATA.PEEKALINK_HOUR_BUCKET_MS) ? GATHER_APP_CHAT_DATA.PEEKALINK_HOUR_BUCKET_MS : 3600000;

// Deterministic, synchronous 64-bit FNV-1a hash used as the Firestore doc ID for the shared
// linkPreviews cache below (doc IDs can't contain '/', which raw URLs do). Collisions are
// astronomically unlikely for the number of distinct URLs this app will ever see, and using a
// plain hash instead of crypto.subtle.digest keeps this working in non-secure contexts too
// (e.g. file:// during local testing), where Web Crypto isn't available.
function hashUrlForCache(url) {
  let hash = 0xcbf29ce484222325n;
  const prime = 0x100000001b3n;
  for (let i = 0; i < url.length; i++) {
    hash ^= BigInt(url.charCodeAt(i));
    hash = BigInt.asUintN(64, hash * prime);
  }
  return hash.toString(16).padStart(16, '0');
}

function normalizeLinkPreviewData(url, data = {}, fetchedAt = Date.now()) {
  return {
    url: sanitizeText(url || data.url || '', 2000),
    title: sanitizeText(data.title || '', 300),
    description: sanitizeText(data.description || '', 500),
    image: sanitizeText(data.image || '', 2000),
    siteName: sanitizeText(data.siteName || '', 200),
    fetchedAt: Number(data.fetchedAt || fetchedAt || Date.now())
  };
}

// Best-effort counter so the admin dashboard can show shared-cache size without ever needing
// list access on the linkPreviews collection itself (see firestore.rules).
// Uses set({merge:true}) since incrementPeekalinkApiCallStat below writes to the same doc --
// a plain overwriting set() here would wipe its hourlyUsage fields (and vice versa).
async function incrementLinkPreviewStat() {
  if (!firebaseDb) return;
  try {
    await firebaseDb.runTransaction(async (tx) => {
      const ref = firebaseDb.collection('appConfig').doc('linkPreviewStats');
      const snap = await tx.get(ref);
      const current = snap.exists ? (snap.data().cachedCount || 0) : 0;
      tx.set(ref, { cachedCount: current + 1, updatedAt: Date.now() }, { merge: true });
    });
  } catch (e) {
    // Non-critical stat -- ignore failures
  }
}

// Tracks actual outbound calls to Peekalink's API (cache hits never reach this point) against
// its 50/hour free-plan rate limit, bucketed by clock hour -- an approximation of the rolling
// window Peekalink itself enforces, close enough for the admin dashboard's usage gauge. Powers
// the "외부 서비스 연동 현황" 통계 tab card.
async function incrementPeekalinkApiCallStat() {
  if (!firebaseDb) return;
  try {
    await firebaseDb.runTransaction(async (tx) => {
      const ref = firebaseDb.collection('appConfig').doc('linkPreviewStats');
      const snap = await tx.get(ref);
      const data = snap.exists ? snap.data() : {};
      const currentBucket = Math.floor(Date.now() / PEEKALINK_HOUR_BUCKET_MS);
      const sameBucket = data.hourlyUsageBucket === currentBucket;
      tx.set(ref, {
        hourlyUsageBucket: currentBucket,
        hourlyUsageCount: sameBucket ? (data.hourlyUsageCount || 0) + 1 : 1
      }, { merge: true });
    });
  } catch (e) {
    // Non-critical stat -- ignore failures
  }
}

// Mirrors functions/index.js's looksLikeBlockedPreviewTitle -- some sites (Coupang among
// them) answer a scraper with a 200 OK "Access Denied"/bot-check interstitial instead of a real
// error status, which used to get cached and shown to users as if it were the link's actual
// preview. Used here to skip (and let the fetch below silently refresh) any doc that was cached
// by the proxy BEFORE that server-side fix existed, so already-broken cache entries self-heal
// instead of staying wrong forever.
function looksLikeBlockedPreviewTitle(title) {
  const t = String(title || '').trim().toLowerCase();
  if (!t) return false;
  const blockedPatterns = [
    'access denied', 'forbidden', '403 forbidden', 'attention required',
    'just a moment', 'are you a human', 'bot detection', 'unusual traffic',
    'captcha', 'request blocked', 'error 1020'
  ];
  return blockedPatterns.some(p => t === p || t.includes(p));
}

async function fetchLinkPreview(url) {
  if (linkPreviewCache.has(url)) return linkPreviewCache.get(url);
  if (linkPreviewInflight.has(url)) return linkPreviewInflight.get(url);
  const promise = (async () => {
    const urlHash = hashUrlForCache(url);
    try {
      // Check the shared, service-wide cache first -- every calendar/user reuses the same
      // Peekalink fetch for a given URL instead of each calendar re-fetching it independently.
      if (firebaseDb) {
        try {
          const sharedDoc = await firebaseDb.collection('linkPreviews').doc(urlHash).get();
          if (sharedDoc.exists && !looksLikeBlockedPreviewTitle(sharedDoc.data()?.title)) {
            const d = sharedDoc.data();
            const result = { status: 'success', data: normalizeLinkPreviewData(url, d, d.fetchedAt) };
            cacheLinkPreview(url, result);
            return result;
          }
        } catch (e) {
          // Shared cache read failed (offline, rules mismatch, etc.) -- fall through to a direct fetch.
        }
      }

      const controller = typeof AbortController === 'function' ? new AbortController() : null;
      const timeoutId = controller ? setTimeout(() => controller.abort(), 8000) : null;
      const res = await withTimeout(fetch(PEEKALINK_PROXY_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ link: url }),
        signal: controller?.signal
      }), 9000, 'link preview timed out').finally(() => {
        if (timeoutId) clearTimeout(timeoutId);
      });
      const json = await withTimeout(res.json(), 4000, 'link preview json timed out');
      // Counts against the free-plan quota regardless of json.ok -- the request still reached
      // Peekalink's server and consumed the hourly allowance either way.
      incrementPeekalinkApiCallStat();
      if (!json.ok) throw new Error(json.message || 'peekalink request failed');
      const image = json.image?.medium?.url || json.image?.large?.url || json.image?.thumbnail?.url || json.icon?.url || '';
      const hasContent = !!(json.title || image || json.description);
      const data = normalizeLinkPreviewData(url, {
        title: json.title || (json.redirected && json.redirectionUrl ? new URL(json.redirectionUrl).hostname.replace('www.','') : '') || json.domain || '',
        description: json.description || '',
        image,
        siteName: json.siteName || json.domain || ''
      });
      const result = { status: hasContent ? 'success' : 'empty', data };
      // Only cache successful results; let empty/failed results be retried on next render
      if (hasContent) {
        cacheLinkPreview(url, result);
        if (firebaseDb) {
          firebaseDb.collection('linkPreviews').doc(urlHash).set(data).then(() => incrementLinkPreviewStat()).catch(() => {});
        }
      }
      return result;
    } catch (e) {
      const result = { status: 'error' };
      // Don't cache errors -- let them be retried when the component remounts or page reloads
      return result;
    } finally {
      linkPreviewInflight.delete(url);
    }
  })();
  linkPreviewInflight.set(url, promise);
  return promise;
}
function useLinkPreview(url, cachedData) {
  const [state, setState] = React.useState(() => {
    if (cachedData) return { status: 'success', data: cachedData };
    return (url ? linkPreviewCache.get(url) : null) || null;
  });
  React.useEffect(() => {
    if (cachedData) {
      setState({ status: 'success', data: cachedData });
      return;
    }
    if (!url) return;
    const cached = linkPreviewCache.get(url);
    if (cached) {
      setState(cached);
      return;
    }
    let cancelled = false;
    setState({ status: 'loading' });
    fetchLinkPreview(url).then(result => {
      if (!cancelled) setState(result);
    });
    return () => {
      cancelled = true;
    };
  }, [url, cachedData]);
  return state;
}


function shouldFetchLinkPreviewForChatUrl(url) {
  const mediaInfo = getDirectChatMediaInfo(url);
  return !mediaInfo || mediaInfo.type === 'embed';
}


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


function DirectChatMediaText(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.DirectChatMediaText;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function DeadlineDateTimePicker(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.DeadlineDateTimePicker;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function PlacesSection(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.PlacesSection;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function ImageUrlModal(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.ImageUrlModal;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}


function renderChatMessageBody(msg, setActiveLightbox, singleImageStyle = {}, searchQuery = '', stickyVideoKey = null, onActivateVideo = null) {
  const msgImages = renderChatMessageImages(msg, setActiveLightbox, singleImageStyle);
  // A fit-content chat bubble sizes itself to whichever of its children is widest. When there's
  // a multi-image grid above, cap the caption text below it to that same grid width -- otherwise
  // a long caption stretches the bubble past the grid, leaving a gap to the grid's right.
  const imageEntryCount = getMessageImageEntries(msg).length;
  const textMaxWidth = imageEntryCount >= 2 ? computeChatImageGridMaxWidth(imageEntryCount) : null;
  return /*#__PURE__*/React.createElement(React.Fragment, null,
    msgImages ? /*#__PURE__*/React.createElement('div', { style: { marginBottom: msg.text ? '8px' : '0' } }, msgImages) : null,
    msg.text ? /*#__PURE__*/React.createElement(DirectChatMediaText, {
      text: msg.text,
      searchQuery,
      setActiveLightbox: msgImages ? null : setActiveLightbox,
      linkPreview: msg.linkPreview,
      style: singleImageStyle,
      message: msg,
      stickyVideoKey,
      onActivateVideo,
      textMaxWidth
    }) : null
  );
}

// HEIC/HEIF (the default photo format on iPhone) has no native decode support in canvas/Image()
// on any browser except some Safari versions -- a raw .heic/.heif file (e.g. picked via the
// Files app, which unlike Safari's usual photo picker doesn't auto-convert to JPEG on select)
// fails outright everywhere else. heic2any is a WASM-based client-side HEIC->JPEG converter;
// it's ~1.3MB so it's loaded lazily, only the first time an actual HEIC/HEIF file shows up.
// Bounds any promise that might otherwise hang forever (a stalled network request that never
// fires error/complete, a CDN script tag whose load/error events never trigger on a flaky
// mobile connection) so a single stuck operation can't freeze the whole upload/processing
// flow indefinitely -- without this, callers awaiting it never reach their finally block, so a
// submit button or progress overlay would stay stuck on-screen with no way to recover.

let heicToLoadPromise = null;
// heic-to bundles a current libheif build (1.22.2 as of writing) inside a single self-contained
// file -- no separate .wasm fetch, it spins up its decoder as an inline Worker built from a
// string embedded in this same file. heic2any (below) is kept only as a second-chance fallback:
// it hasn't been updated since 2023, and its own Emscripten build has been unreliable on some
// mobile browsers in the wild for reasons that never surface a clear error (it's caught and
// collapsed into one generic failure), which is exactly the profile of this bug report.
const HEIC_TO_CDN_URLS = Array.isArray(GATHER_APP_CHAT_DATA.HEIC_TO_CDN_URLS) ? GATHER_APP_CHAT_DATA.HEIC_TO_CDN_URLS : [
  'https://cdn.jsdelivr.net/npm/heic-to@1.5.2/dist/heic-to.js',
  'https://unpkg.com/heic-to@1.5.2/dist/heic-to.js'
];
function loadHeicTo(timeoutMs = 15000) {
  if (heicToLoadPromise) return heicToLoadPromise;
  heicToLoadPromise = (async () => {
    let lastErr = null;
    for (const src of HEIC_TO_CDN_URLS) {
      try {
        const mod = await withTimeout(import(/* @vite-ignore */ src), timeoutMs, `heic-to import timed out: ${src}`);
        if (mod && typeof mod.heicTo === 'function') return mod.heicTo;
        lastErr = new Error('heic-to module missing heicTo export');
      } catch (err) {
        lastErr = err;
      }
    }
    heicToLoadPromise = null; // allow retrying on a later file instead of caching the failure forever
    throw lastErr || new Error('heic-to failed to load from all CDNs');
  })();
  return heicToLoadPromise;
}

let heic2anyLoadPromise = null;
// Two independent CDNs -- some mobile carrier/corporate networks block one but not the other,
// and a single hardcoded host with no fallback turns any CDN hiccup into a hard HEIC failure.
const HEIC2ANY_CDN_URLS = Array.isArray(GATHER_APP_CHAT_DATA.HEIC2ANY_CDN_URLS) ? GATHER_APP_CHAT_DATA.HEIC2ANY_CDN_URLS : [
  'https://cdn.jsdelivr.net/npm/heic2any@0.0.4/dist/heic2any.min.js',
  'https://unpkg.com/heic2any@0.0.4/dist/heic2any.min.js'
];
function loadScriptOnce(src, timeoutMs) {
  return new Promise((resolve, reject) => {
    let settled = false;
    const timeoutId = setTimeout(() => {
      if (settled) return;
      settled = true;
      reject(new Error(`script load timed out: ${src}`));
    }, timeoutMs);
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => {
      if (settled) return;
      settled = true;
      clearTimeout(timeoutId);
      resolve();
    };
    script.onerror = () => {
      if (settled) return;
      settled = true;
      clearTimeout(timeoutId);
      reject(new Error(`script failed to load: ${src}`));
    };
    document.head.appendChild(script);
  });
}
function loadHeic2any(timeoutMs = 15000) {
  if (window.heic2any) return Promise.resolve(window.heic2any);
  if (heic2anyLoadPromise) return heic2anyLoadPromise;
  heic2anyLoadPromise = (async () => {
    let lastErr = null;
    for (const src of HEIC2ANY_CDN_URLS) {
      try {
        await loadScriptOnce(src, timeoutMs);
        if (window.heic2any) return window.heic2any;
        lastErr = new Error('heic2any failed to initialize');
      } catch (err) {
        lastErr = err;
      }
    }
    heic2anyLoadPromise = null; // allow retrying on a later file instead of caching the failure forever
    throw lastErr || new Error('heic2any failed to load from all CDNs');
  })();
  return heic2anyLoadPromise;
}

function isHeicFile(file) {
  const type = (file.type || '').toLowerCase();
  if (type === 'image/heic' || type === 'image/heif' || type === 'image/heic-sequence' || type === 'image/heif-sequence') return true;
  // file.type is often empty for HEIC on browsers/OSes with no MIME association registered,
  // so also fall back to the extension.
  const name = (file.name || '').toLowerCase();
  return name.endsWith('.heic') || name.endsWith('.heif');
}

// Wraps Image() decoding with a timeout so one stuck/malformed file can't hang a whole batch
// indefinitely (the caller is otherwise waiting on onload/onerror, which some browsers never
// fire for certain corrupt inputs).
function loadImageElement(objectUrl, timeoutMs = 20000) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    let settled = false;
    const timeoutId = setTimeout(() => {
      if (settled) return;
      settled = true;
      reject(Object.assign(new Error('IMAGE_DECODE_TIMEOUT'), { code: 'IMAGE_DECODE_TIMEOUT' }));
    }, timeoutMs);
    img.onload = () => {
      if (settled) return;
      settled = true;
      clearTimeout(timeoutId);
      resolve(img);
    };
    img.onerror = () => {
      if (settled) return;
      settled = true;
      clearTimeout(timeoutId);
      reject(Object.assign(new Error('IMAGE_DECODE_FAILED'), { code: 'IMAGE_DECODE_FAILED' }));
    };
    img.src = objectUrl;
  });
}

async function compressImageToDataUrls(file, { maxThumbBase64Length = MAX_CHAT_THUMB_BASE64_LENGTH } = {}) {
  let sourceBlob = file;
  let img = null;

  if (isHeicFile(file)) {
    // Try every native decode path the platform might offer before falling back to a CDN
    // library. Different engines expose HEIC support through different APIs -- some Chrome
    // builds decode via createImageBitmap using the OS's own HEIF codec without supporting
    // <img> for the same file, while Safari typically supports both. Trying both costs nothing
    // on browsers that support neither: createImageBitmap rejects immediately for an
    // undecodable blob, and <img> reports onerror almost instantly (no network wait, the file
    // is already a local blob). This also sidesteps heic2any's bundled libheif (last published
    // 2020) failing to parse newer HDR/gain-map HEIC variants some iPhones now produce, which
    // the platform's own decoder often still handles fine -- and avoids the ~1.3MB CDN fetch
    // entirely on capable browsers.
    if (typeof createImageBitmap === 'function') {
      try {
        img = await withTimeout(createImageBitmap(file), 6000, 'createImageBitmap timed out');
      } catch (err) {
        img = null;
      }
    }
    if (!img) {
      const probeUrl = URL.createObjectURL(file);
      try {
        img = await loadImageElement(probeUrl, 6000);
      } catch (err) {
        img = null;
      } finally {
        URL.revokeObjectURL(probeUrl);
      }
    }

    if (!img) {
      let converted = null;
      let lastErr = null;

      // Primary: heic-to, a self-contained, actively-maintained current-libheif build. Try it
      // twice -- the first conversion call right after the decoder's Worker spins up can
      // transiently fail in some browsers, and one retry recovers most of those.
      for (let attempt = 0; attempt < 2 && !converted; attempt++) {
        try {
          const heicTo = await loadHeicTo();
          converted = await withTimeout(
            heicTo({ blob: file, type: 'image/jpeg', quality: 0.85 }),
            45000,
            'HEIC conversion timed out'
          );
        } catch (err) {
          lastErr = err;
          heicToLoadPromise = null; // force a fresh load attempt on retry, not a cached failure
        }
      }

      // Fallback: heic2any, an older/differently-built decoder kept only as a second opinion in
      // case heic-to's specific CDN or Worker/WASM path is the one having trouble on a given
      // device -- a genuinely different implementation succeeding where the first one failed is
      // exactly the case this is here for.
      if (!converted) {
        for (let attempt = 0; attempt < 2 && !converted; attempt++) {
          try {
            const heic2any = await loadHeic2any();
            // A 24MP+ HEIC on a slower mobile device can genuinely take a while to decode, but
            // must not be allowed to hang forever -- bound it generously (45s) rather than leave
            // the attach flow stuck with no way to recover.
            converted = await withTimeout(
              heic2any({ blob: file, toType: 'image/jpeg', quality: 0.85 }),
              45000,
              'HEIC conversion timed out'
            );
          } catch (err) {
            lastErr = err;
            heic2anyLoadPromise = null; // force a fresh load attempt on retry, not a cached failure
            window.heic2any = null;
          }
        }
      }

      if (!converted) {
        throw Object.assign(new Error('HEIC 이미지를 변환하지 못했습니다.'), { code: 'HEIC_CONVERT_FAILED', fileName: file.name, cause: lastErr });
      }
      sourceBlob = Array.isArray(converted) ? converted[0] : converted;
    }
  }

  if (!img) {
    const objectUrl = URL.createObjectURL(sourceBlob);
    try {
      img = await loadImageElement(objectUrl);
    } catch (err) {
      throw Object.assign(
        new Error('이미지를 불러오지 못했습니다. 지원하지 않는 형식이거나 손상된 파일일 수 있습니다.'),
        { code: err.code || 'IMAGE_DECODE_FAILED', fileName: file.name }
      );
    } finally {
      URL.revokeObjectURL(objectUrl);
    }
  }

  // Encodes `img` as a JPEG data URL guaranteed to fit within `budget`: steps down through
  // `qualitySteps` at the current size first, and only if the lowest quality still doesn't fit
  // does it shrink the longest side and retry from the top of the quality list.
  // Quality-only stepping (the previous approach) could still exceed the cap on a busy/detailed
  // photo, which -- multiplied across a multi-image batch that falls back to inline base64 --
  // could push the whole Firestore document over its 1MiB hard limit and get the write rejected
  // outright instead of degrading gracefully.
  // Yields to the event loop (setTimeout over rAF -- this can run while the tab is backgrounded/
  // hidden between images in a multi-attach batch, where rAF would simply stall) between each
  // resize/quality attempt so a detailed photo's full step-ladder doesn't block the main thread
  // (and the ImageProcessingOverlay progress UI) for one long unbroken stretch.
  const yieldToMain = () => new Promise(r => setTimeout(r, 0));
  const encodeWithinBudget = async (maxDimStart, qualitySteps, budget, minDim) => {
    let maxDim = maxDimStart;
    let best = null;
    while (true) {
      let w = img.width, h = img.height;
      if (w > maxDim || h > maxDim) {
        if (w > h) { h = Math.round(h * maxDim / w); w = maxDim; }
        else { w = Math.round(w * maxDim / h); h = maxDim; }
      }
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      canvas.getContext('2d').drawImage(img, 0, 0, w, h);
      for (const quality of qualitySteps) {
        const base64 = canvas.toDataURL('image/jpeg', quality);
        best = { base64, canvas, quality };
        if (base64.length <= budget) return best;
        await yieldToMain();
      }
      if (maxDim <= minDim) return best; // best effort: smallest size / lowest quality tried
      maxDim = Math.max(minDim, Math.round(maxDim * 0.75));
    }
  };

  // This base64 (`original`) is discarded unread whenever the Storage upload below succeeds
  // (the normal case) -- it only ever becomes the persisted imageUrl when that upload fails (see
  // resolveImageUrls). It used to be compressed at a much larger budget (1200px / ~350KB) whenever
  // Storage looked healthy going in, on the theory that upload would probably succeed -- but a
  // single transient upload failure (slow mobile connection, brief Storage hiccup) would then
  // permanently embed that huge base64 directly in the message document. Because chat's live
  // "last 100 messages" listener (see the Real-time messages listener effect) downloads and
  // re-parses every matching document on every page load for every visitor, one such message
  // taxes everyone's load forever -- multiple of these accumulating in a single calendar's history
  // measurably slowed chat loading for every user. So the fallback is always compressed at the
  // same small, cheap-to-store budget the isStorageDisabled path already used, regardless of
  // whether Storage looks reachable right now: if the upload does succeed, this is thrown away and
  // the full-quality Storage blob is what actually gets used, so nothing is lost in the common
  // case; if it fails, the degraded fallback is small enough to never become a load-time liability.
  const original = await encodeWithinBudget(600, [0.85, 0.75, 0.65, 0.55, 0.45, 0.35], 48 * 1024, 320);

  // 360px thumbnails keep chat/gallery previews crisp on high-DPI screens while remaining
  // bounded. Storage normally serves the sharper 720px Blob below; this base64 thumbnail is the
  // safe fallback when Storage upload is unavailable or still in progress.
  const thumbnail = await encodeWithinBudget(360, [0.78, 0.68, 0.58, 0.48], maxThumbBase64Length, 180);

  // High-quality blob for Firebase Storage (when storage is working): images already within the
  // 1920px cap upload completely untouched (100% pixel-perfect, zero compression noise) as long
  // as they're a reasonable file size; anything larger gets its longest side scaled down to 1920.
  // The untouched-file threshold used to be 4MB, which let a same-dimension JPEG anywhere up to
  // that size skip recompression entirely -- a fairly common case (a nice camera's own JPEG
  // output, a downloaded photo) that made single-photo uploads feel slow independent of how many
  // photos or how fast the connection was, since 2-4MB is a lot to push over typical mobile
  // upload bandwidth (often far lower than download). Recompressing at quality 0.7 here still
  // looks effectively identical for chat/gallery viewing while cutting that payload by roughly
  // 70-85% in the common case, so lowering the bar to 2MB trades a compression pass most devices
  // do in well under a second for a meaningfully shorter upload.
  const getHighQualityBlob = () => {
    if (isStorageDisabled) return Promise.resolve(null);

    const maxDimHigh = 1920;
    const isOversized = img.width > maxDimHigh || img.height > maxDimHigh;

    if (!isOversized && file.size <= 2 * 1024 * 1024) {
      return Promise.resolve(file);
    }

    return new Promise(res => {
      let w = img.width, h = img.height;
      const isPng = (file.type === 'image/png' || file.name.toLowerCase().endsWith('.png'));
      if (isOversized) {
        if (w > h) { h = Math.round(h * maxDimHigh / w); w = maxDimHigh; }
        else { w = Math.round(w * maxDimHigh / h); h = maxDimHigh; }
      }
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      canvas.getContext('2d').drawImage(img, 0, 0, w, h);
      if (isPng) {
        canvas.toBlob(blob => res(blob), 'image/png');
      } else {
        canvas.toBlob(blob => res(blob), 'image/jpeg', 0.7);
      }
    });
  };

  const getHighQualityThumbBlob = () => {
    if (isStorageDisabled) return Promise.resolve(null);
    return new Promise(res => {
      let w = img.width, h = img.height;
      const maxDimThumb = 720; // Sharper Storage thumbnails for high-DPI chat and gallery previews
      if (w > maxDimThumb || h > maxDimThumb) {
        if (w > h) { h = Math.round(h * maxDimThumb / w); w = maxDimThumb; }
        else { w = Math.round(w * maxDimThumb / h); h = maxDimThumb; }
      }
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      canvas.getContext('2d').drawImage(img, 0, 0, w, h);
      const isPng = (file.type === 'image/png' || file.name.toLowerCase().endsWith('.png'));
      if (isPng) {
        canvas.toBlob(blob => res(blob), 'image/png');
      } else {
        canvas.toBlob(blob => res(blob), 'image/jpeg', 0.86); // High quality JPEG thumbnail
      }
    });
  };

  const highQualityBlob = await getHighQualityBlob();
  const highQualityThumbBlob = await getHighQualityThumbBlob();

  // Also produce Blobs at the same size/quality actually chosen above, used to upload to
  // Firebase Storage at send time (see uploadChatImageAssets) instead of embedding base64 in
  // the message document. The base64 strings above are kept as the fallback if that upload fails.
  return new Promise((resolve) => {
    const resolveAll = (origBlob, thumbBlob) => {
      resolve({
        original: original.base64,
        thumbnail: thumbnail.base64,
        originalBlob: origBlob,
        thumbnailBlob: thumbBlob
      });
    };

    const getBase64OrigBlob = (cb) => {
      if (highQualityBlob) cb(highQualityBlob);
      else original.canvas.toBlob(blob => cb(blob), 'image/jpeg', original.quality);
    };

    const getBase64ThumbBlob = (cb) => {
      if (highQualityThumbBlob) cb(highQualityThumbBlob);
      else thumbnail.canvas.toBlob(blob => cb(blob), 'image/jpeg', thumbnail.quality);
    };

    getBase64OrigBlob(origBlob => {
      getBase64ThumbBlob(thumbBlob => {
        resolveAll(origBlob, thumbBlob);
      });
    });
  });
}

// Processes a batch of image files one at a time (bounds peak memory on large photos and gives
// meaningful progress feedback), isolating failures per file so one bad file (unsupported
// format, corrupt data, decode timeout) doesn't discard the others that succeeded.
// Every image keeps the SAME fixed quality/size cap regardless of how many photos are in the
// batch -- resolution/quality never degrades just because more photos were attached. The
// Firestore 1MiB/doc limit is instead respected by splitting a large fallback batch across
// multiple chat messages at send time (see chunkResolvedImagesForMessages), so quality only
// ever depends on the individual photo, never on batch size.
async function processImageFilesSequentially(files, onProgress) {
  // Re-check (rather than trusting only the one automatic probe ~1s after script load) so a
  // session that started with a transient/false-negative health check gets a real chance to
  // recover once its cooldown has passed, instead of staying stuck on the low-res fallback for
  // every photo for the rest of the session.
  await checkFirebaseStorageHealth().catch(() => {});
  const succeeded = [];
  const failed = [];
  const startedAt = Date.now();
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (onProgress) {
      const elapsedSec = (Date.now() - startedAt) / 1000;
      const pct = Math.round((i / files.length) * 100);
      const remainingSec = i > 0 ? Math.max(0, Math.round((elapsedSec / i) * (files.length - i))) : null;
      onProgress({ current: i + 1, total: files.length, fileName: file.name, pct, remainingSec });
    }
    try {
      const compressed = await compressImageToDataUrls(file);
      succeeded.push(compressed);
    } catch (err) {
      failed.push({ fileName: file.name, error: err });
    }
  }
  if (onProgress) onProgress({ current: files.length, total: files.length, fileName: null, pct: 100, remainingSec: 0 });
  return { succeeded, failed };
}

// Groups resolved images ({ imageUrl, thumbUrl }) into per-message chunks that stay safely
// under Firestore's 1,048,576-byte/doc limit. When Storage upload succeeded (the normal case),
// imageUrl/thumbUrl are short download URLs, so this always yields a single chunk regardless of
// how many photos were sent. Only when images fall back to inline base64 (Storage unavailable)
// can a batch grow large enough to need more than one chunk -- and even then, each image keeps
// its full quality; only the number of chat messages sent scales, never the image quality.
const CHAT_MESSAGE_SAFE_BYTE_BUDGET = 120000; // large images must use Storage URLs, not Firestore
function chunkResolvedImagesForMessages(resolvedImages) {
  const chunks = [];
  let current = [];
  let currentBytes = 0;
  for (const img of resolvedImages) {
    const imgBytes = (img.imageUrl?.length || 0) + (img.thumbUrl?.length || 0);
    if (current.length > 0 && currentBytes + imgBytes > CHAT_MESSAGE_SAFE_BYTE_BUDGET) {
      chunks.push(current);
      current = [];
      currentBytes = 0;
    }
    current.push(img);
    currentBytes += imgBytes;
  }
  if (current.length > 0) chunks.push(current);
  return chunks;
}

function describeImageProcessingFailures(failed) {
  if (failed.length === 0) return '';
  const first = failed[0];
  const reason = first.error?.code === 'HEIC_CONVERT_FAILED'
    ? 'HEIC/HEIF 변환 실패'
    : first.error?.code === 'IMAGE_DECODE_TIMEOUT'
    ? '처리 시간 초과'
    : '지원하지 않는 형식';
  if (failed.length === 1) return `${first.fileName} 첨부 실패 (${reason})`;
  return `${failed.length}장 첨부 실패 (${reason} 등)`;
}

function getImageFilesFromClipboardEvent(event) {
  const clipboard = event?.clipboardData;
  if (!clipboard) return [];
  const files = [];
  const seen = new Set();
  const appendFile = file => {
    if (!file) return;
    const isImageLike = /^image\//i.test(file.type || '') || isHeicFile(file);
    if (!isImageLike) return;
    // Some browsers expose the same pasted screenshot both through clipboard.items and
    // clipboard.files, but with different transient names/lastModified values. Deduplicate
    // pasted images by stable binary-ish metadata first so one paste never becomes two previews.
    const stableKey = `${file.type || 'image'}:${file.size || 0}`;
    const fallbackKey = `${file.name || 'clipboard-image'}:${file.size || 0}:${file.type || ''}:${file.lastModified || 0}`;
    const key = file.size ? stableKey : fallbackKey;
    if (seen.has(key) || seen.has(fallbackKey)) return;
    seen.add(key);
    seen.add(fallbackKey);
    files.push(file);
  };

  Array.from(clipboard.items || []).forEach(item => {
    if (item?.kind === 'file' && /^image\//i.test(item.type || '')) {
      appendFile(item.getAsFile());
    }
  });
  Array.from(clipboard.files || []).forEach(appendFile);
  return files;
}

async function appendChatImageFiles({
  files,
  currentCount,
  setImageProcessing,
  setChatImages,
  showToast
}) {
  const imageFiles = Array.from(files || []).filter(file => /^image\//i.test(file?.type || '') || isHeicFile(file));
  if (imageFiles.length === 0) return { handled: false, succeeded: 0, failed: 0 };

  const remainingSlots = 50 - currentCount;
  if (remainingSlots <= 0) {
    if (showToast) showToast('사진 최대 50장', 'error');
    return { handled: true, succeeded: 0, failed: 0 };
  }

  const filesToProcess = imageFiles.slice(0, remainingSlots);
  if (imageFiles.length > remainingSlots && showToast) {
    showToast(`${remainingSlots}장만 추가됨 (최대 50장)`, 'info');
  }

  setImageProcessing({ current: 0, total: filesToProcess.length });
  const { succeeded, failed } = await processImageFilesSequentially(
    filesToProcess,
    progress => setImageProcessing(progress)
  );

  if (succeeded.length > 0) {
    setChatImages(prev => [...prev, ...succeeded]);
  }
  if (failed.length > 0) {
    console.error('Image compression failed for:', failed.map(f => f.fileName));
    if (showToast) showToast(describeImageProcessingFailures(failed), 'error', 5000);
  } else if (succeeded.length > 0 && showToast) {
    showToast(`${succeeded.length}장 첨부완료`, 'success', 3000);
  }

  return { handled: true, succeeded: succeeded.length, failed: failed.length };
}



function ImageUploadOverlay(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.ImageUploadOverlay;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function ImageProcessingOverlay(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.ImageProcessingOverlay;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function EmojiGridButton(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.EmojiGridButton;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function EmojiPickerSheet(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.EmojiPickerSheet;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}

function getUploadImageBlobMeta(blob, fallbackExt = 'jpg') {
  const mime = String(blob?.type || '').toLowerCase();
  const extByMime = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
    'image/avif': 'avif',
    'image/bmp': 'bmp'
  };
  const contentTypeByExt = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
    gif: 'image/gif',
    avif: 'image/avif',
    bmp: 'image/bmp'
  };
  const ext = extByMime[mime] || fallbackExt || 'jpg';
  return {
    ext,
    contentType: /^image\//.test(mime) ? mime : (contentTypeByExt[ext] || 'image/jpeg')
  };
}

// Uploads a compressed chat image pair to Firebase Storage and returns download URLs, or null
// if Storage isn't available/the upload fails -- callers should fall back to the base64 data
// URLs already produced by compressImageToDataUrls in that case. `onBytes(taskKey, transferred,
// total)` is called as each upload progresses so a caller can aggregate progress across a batch.
function uploadChatImageAssets(calendarId, compressed, index, onBytes, timeoutMs = 45000) {
  return new Promise((resolve) => {
    if (!firebaseStorage || !compressed?.originalBlob || !compressed?.thumbnailBlob) {
      resolve(null);
      return;
    }
    const stamp = Date.now();
    const rand = Math.random().toString(36).slice(2, 8);
    const basePath = `chatImages/${calendarId}/${stamp}_${rand}_${index}`;
    // The byte size is embedded in the filename itself (parsed back out by
    // getStorageUrlFileSize) so the Lightbox info panel can show it without any extra network
    // request -- Firebase Storage's download endpoint doesn't send a CORS header by default, so
    // a plain fetch() to read Content-Length from a different origin (like this app's GitHub
    // Pages host) is silently blocked by the browser and would never work.
    const originalMeta = getUploadImageBlobMeta(compressed.originalBlob, 'jpg');
    const thumbMeta = getUploadImageBlobMeta(compressed.thumbnailBlob, originalMeta.ext === 'png' ? 'png' : 'jpg');
    const originalRef = firebaseStorage.ref(`${basePath}_original_${compressed.originalBlob.size}b.${originalMeta.ext}`);
    const thumbRef = firebaseStorage.ref(`${basePath}_thumb_${compressed.thumbnailBlob.size}b.${thumbMeta.ext}`);

    // On a flaky mobile connection, a stalled upload can go silent with no error/complete event
    // ever firing (the SDK is still waiting on a dead connection) -- without a bound here, the
    // whole send/edit flow would hang forever with no way for the user to recover. Time out and
    // fall back to inline base64 for that image instead.
    const runUploadOnce = (blob, ref, taskKey, contentType) => {
      let settled = false;
      return new Promise((resolveOne) => {
        const settle = value => { if (settled) return; settled = true; resolveOne(value); };
        const timeoutId = setTimeout(() => settle(null), timeoutMs);
        const task = ref.put(blob, { contentType });
        task.on('state_changed', snapshot => {
          if (onBytes) onBytes(taskKey, snapshot.bytesTransferred, snapshot.totalBytes);
        }, () => { clearTimeout(timeoutId); settle(null); }, async () => {
          clearTimeout(timeoutId);
          try {
            settle(await task.snapshot.ref.getDownloadURL());
          } catch (e) {
            settle(null);
          }
        });
      });
    };
    // One retry before giving up -- a single failed/timed-out attempt (a brief mobile network
    // hiccup) used to permanently drop that photo to the low-quality ~600px/48KB base64 fallback
    // with no second chance, which is exactly what produced reports of meeting/gallery photos
    // saved at 600x450 / ~33KB. Same fix pattern as loadScriptWithRetry in main.jsx.
    const runUpload = async (blob, ref, taskKey, contentType) => {
      const first = await runUploadOnce(blob, ref, taskKey, contentType);
      if (first) return first;
      return runUploadOnce(blob, ref, taskKey, contentType);
    };

    Promise.all([
      runUpload(compressed.originalBlob, originalRef, `${index}-orig`, originalMeta.contentType),
      runUpload(compressed.thumbnailBlob, thumbRef, `${index}-thumb`, thumbMeta.contentType)
    ]).then(([imageUrl, thumbUrl]) => {
      if (imageUrl && thumbUrl) resolve({ imageUrl, thumbUrl });
      else {
        console.warn('Chat image Storage upload failed (no base64 fallback)');
        resolve(null);
      }
    });
  });
}

async function dataUrlToBlob(dataUrl) {
  if (typeof dataUrl !== 'string' || !dataUrl.startsWith('data:')) return null;
  const match = dataUrl.match(/^data:([^;,]+)?(;base64)?,(.*)$/);
  if (!match) return null;
  const mimeType = match[1] || 'application/octet-stream';
  const isBase64 = Boolean(match[2]);
  const payload = match[3] || '';
  try {
    if (isBase64) {
      const binary = atob(payload);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
      return new Blob([bytes], { type: mimeType });
    }
    return new Blob([decodeURIComponent(payload)], { type: mimeType });
  } catch (err) {
    console.warn('dataUrlToBlob failed:', err);
    return null;
  }
}

async function uploadInlineChatImageToStorage(calendarId, imageUrl, thumbUrl, index = 0, onBytes, timeoutMs = 45000) {
  if (!firebaseStorage) return null;
  if (onBytes) onBytes(`${index}-prepare`, 1, 10);
  const originalBlob = await dataUrlToBlob(imageUrl);
  if (onBytes) onBytes(`${index}-prepare`, 5, 10);
  const thumbnailBlob = await dataUrlToBlob(thumbUrl && thumbUrl.startsWith('data:') ? thumbUrl : imageUrl);
  if (onBytes) onBytes(`${index}-prepare`, 10, 10);
  if (!originalBlob || !thumbnailBlob) return null;
  return uploadChatImageAssets(calendarId, {
    original: imageUrl,
    thumbnail: thumbUrl || imageUrl,
    originalBlob,
    thumbnailBlob
  }, `share_${index}`, onBytes, timeoutMs);
}

async function migrateBase64ChatImagesForCalendar(calId, { maxMessages = 40 } = {}) {
  if (!calId || !firebaseDb || !firebaseStorage) return { migrated: 0, failed: 0, scanned: 0 };
  const storageOk = await checkFirebaseStorageHealth();
  if (!storageOk) return { migrated: 0, failed: 0, scanned: 0, reason: 'storage-unavailable' };
  let migrated = 0, failed = 0, scanned = 0;
  try {
    const snap = await firebaseDb.collection('calendars').doc(`cal_${calId}`).collection('messages')
      .orderBy('timestamp', 'asc').limit(200).get();
    const docs = [];
    snap.forEach(doc => docs.push({ id: doc.id, ...doc.data() }));
    for (const msg of docs) {
      if (migrated + failed >= maxMessages) break;
      scanned += 1;
      const urls = Array.isArray(msg.imageUrls) && msg.imageUrls.length ? msg.imageUrls : (msg.imageUrl ? [msg.imageUrl] : []);
      const thumbs = Array.isArray(msg.thumbUrls) && msg.thumbUrls.length ? msg.thumbUrls : (msg.thumbUrl ? [msg.thumbUrl] : []);
      if (!urls.some(u => typeof u === 'string' && u.startsWith('data:image'))) continue;
      const newUrls = [], newThumbs = [];
      let anyFail = false;
      for (let i = 0; i < urls.length; i++) {
        const u = urls[i], t = thumbs[i] || u;
        if (typeof u === 'string' && u.startsWith('http')) {
          newUrls.push(u);
          newThumbs.push(typeof t === 'string' && t.startsWith('http') ? t : u);
          continue;
        }
        if (typeof u !== 'string' || !u.startsWith('data:image')) { anyFail = true; break; }
        try {
          const uploaded = await uploadInlineChatImageToStorage(calId, u, t, i);
          if (!uploaded || !uploaded.imageUrl) { anyFail = true; break; }
          newUrls.push(uploaded.imageUrl);
          newThumbs.push(uploaded.thumbUrl || uploaded.imageUrl);
        } catch (e) {
          console.warn('migrate image failed', msg.id, e);
          anyFail = true; break;
        }
      }
      if (anyFail || !newUrls.length) { failed += 1; continue; }
      try {
        await firebaseDb.collection('calendars').doc(`cal_${calId}`).collection('messages').doc(msg.id).update({
          imageUrl: newUrls[0] || '', thumbUrl: newThumbs[0] || '', imageUrls: newUrls, thumbUrls: newThumbs
        });
        migrated += 1;
      } catch (e) {
        console.warn('migrate update failed', msg.id, e);
        failed += 1;
      }
    }
  } catch (e) {
    console.warn('migrateBase64ChatImagesForCalendar', e);
    return { migrated, failed, scanned, reason: String(e && e.message || e) };
  }
  return { migrated, failed, scanned };
}


async function readClipboardImageFiles(showToast) {
  if (typeof navigator === 'undefined' || !navigator.clipboard) {
    if (typeof showToast === 'function') showToast('클립보드 접근을 지원하지 않는 브라우저입니다.', 'error');
    return [];
  }
  try {
    const files = [];
    if (typeof navigator.clipboard.read === 'function') {
      // Some mobile browsers (notably Android Chrome when Permissions-Policy silently withholds
      // clipboard-read for this context) neither resolve nor reject this promise -- they just
      // hang forever with no error and no data. Without a bound, that reads to the user as the
      // 붙여넣기 button doing literally nothing when pressed (no toast, no preview, no error).
      // Bounding it guarantees the catch block's error toast fires within a few seconds either
      // way, so a press always produces some visible reaction.
      const items = await withTimeout(navigator.clipboard.read(), 5000, 'clipboard read timed out');
      for (const item of items) {
        for (const type of item.types) {
          if (type.startsWith('image/')) {
            const blob = await item.getType(type);
            const ext = type.split('/')[1] || 'png';
            const file = new File([blob], `paste_${Date.now()}.${ext}`, { type });
            files.push(file);
          }
        }
      }
    }
    if (files.length === 0) {
      if (typeof showToast === 'function') showToast('클립보드에 이미지가 없습니다.', 'info');
    }
    return files;
  } catch (err) {
    console.warn('readClipboardImageFiles failed:', err);
    if (typeof showToast === 'function') showToast('클립보드 이미지를 읽을 수 없거나 접근 권한이 없습니다.', 'error');
    return [];
  }
}

// Resolves the {imageUrl, thumbUrl} pair a message/memo should store: uploaded Storage
// download URLs when possible, the original compressed base64 data URLs otherwise. uploadFn
// is uploadChatImageAssets or uploadMemoImageAssets, keeping each feature's Storage path.
async function resolveImageUrls(calendarId, compressed, index, onBytes, uploadFn) {
  try {
    const uploaded = await uploadFn(calendarId, compressed, index, onBytes);
    if (uploaded && uploaded.imageUrl && uploaded.thumbUrl) return uploaded;
  } catch (e) {
    console.warn('Image Storage upload attempt failed, falling back to base64 data URL:', e);
  }
  if (compressed && (compressed.original || compressed.thumbnail)) {
    return {
      imageUrl: compressed.original || compressed.thumbnail,
      thumbUrl: compressed.thumbnail || compressed.original
    };
  }
  throw new Error('이미지 처리 중 오류가 발생했습니다.');
}

// Resolves a whole batch of images (upload + fallback per image, same as resolveImageUrls)
// while reporting combined byte-level progress across every upload in the batch as
// { pct, remainingSec }. Falls back to compressed.isExisting entries as-is (no re-upload).
// Shared by chat and memo attachments; uploadFn picks which Storage path each uses.
async function resolveImageBatch(calendarId, compressedList, onProgress, uploadFn) {
  const uploadIndexes = compressedList
    .map((c, idx) => ({ c, idx }))
    .filter(({ c }) => !c.isExisting);

  const isStorageWorking = await checkFirebaseStorageHealth().catch(() => false);
  if (uploadIndexes.length === 0) {
    if (onProgress) onProgress({ pct: 100, remainingSec: 0, current: compressedList.length, total: compressedList.length });
    return Promise.all(compressedList.map((c) =>
      Promise.resolve({ imageUrl: c.original, thumbUrl: c.thumbnail })
    ));
  }

  // Progress split: compression = 0~45%, upload = 45~99%
  // This ensures the bar visibly moves during the (previously silent) compression phase.
  const startedAt = Date.now();
  const total = compressedList.length;
  let compressionDone = 0;
  let currentIndex = 0;

  const reportCompressionProgress = () => {
    if (!onProgress) return;
    const pct = Math.min(44, Math.round((compressionDone / total) * 45));
    const elapsedSec = (Date.now() - startedAt) / 1000;
    const remainingSec = compressionDone > 0
      ? Math.max(0, Math.round((elapsedSec / compressionDone) * (total - compressionDone) * 2))
      : null;
    onProgress({ pct, remainingSec, current: currentIndex, total });
  };

  const progressByTask = new Map();
  const reportUploadProgress = () => {
    if (!onProgress) return;
    let transferred = 0, totalBytes = 0;
    progressByTask.forEach(p => { transferred += p.transferred; totalBytes += p.total; });
    const uploadPct = totalBytes > 0 ? Math.min(54, Math.round((transferred / totalBytes) * 54)) : 0;
    const pct = Math.min(99, 45 + uploadPct);
    const elapsedSec = (Date.now() - startedAt) / 1000;
    const remainingSec = pct > 46 ? Math.max(0, Math.round(elapsedSec * (100 - pct) / pct)) : null;
    onProgress({ pct, remainingSec, current: currentIndex, total });
  };
  const onBytes = (taskKey, transferred, total) => {
    progressByTask.set(taskKey, { transferred, total });
    reportUploadProgress();
  };

  // Truly sequential per-image upload to prevent network starvation and timeouts
  const results = [];
  for (let idx = 0; idx < compressedList.length; idx++) {
    currentIndex = idx + 1;
    const c = compressedList[idx];
    if (c.isExisting) {
      compressionDone++;
      reportCompressionProgress();
      results.push({ imageUrl: c.original, thumbUrl: c.thumbnail });
    } else {
      const result = await resolveImageUrls(calendarId, c, idx, onBytes, uploadFn);
      compressionDone++;
      reportCompressionProgress();
      results.push(result);
    }
  }
  if (onProgress) onProgress({ pct: 100, remainingSec: 0, current: total, total });
  return results;
}

async function resolveChatImageBatch(calendarId, compressedList, onProgress) {
  return resolveImageBatch(calendarId, compressedList, onProgress, uploadChatImageAssets);
}

async function resolveMemoImageBatch(calendarId, compressedList, onProgress) {
  return resolveImageBatch(calendarId, compressedList, onProgress, uploadMemoImageAssets);
}

// A Storage download URL looks like https://firebasestorage.googleapis.com/...; a fallback
// image is an embedded data: URL. Only the former needs cleanup when a message is deleted.
function isStorageDownloadUrl(url) {
  return typeof url === 'string' && /^https:\/\//.test(url);
}

async function deleteChatImageFromStorage(url) {
  if (!firebaseStorage || !isStorageDownloadUrl(url)) return;
  try {
    await firebaseStorage.refFromURL(url).delete();
  } catch (e) {
    console.warn('Failed to delete chat image from Storage:', e);
  }
}

// Cleans up every Storage object attached to a message being deleted, covering both the
// legacy single-image fields and the imageUrls/thumbUrls arrays used by multi-image messages.
function deleteAllChatImagesFromStorage(msg) {
  if (!msg) return;
  const urls = new Set();
  if (msg.imageUrl) urls.add(msg.imageUrl);
  if (msg.thumbUrl) urls.add(msg.thumbUrl);
  if (Array.isArray(msg.imageUrls)) msg.imageUrls.forEach(u => u && urls.add(u));
  if (Array.isArray(msg.thumbUrls)) msg.thumbUrls.forEach(u => u && urls.add(u));
  urls.forEach(url => deleteChatImageFromStorage(url));
}

// Small line-icon for the main header's menu bar (Tabler-style outline icons, matching the
// existing icon set used elsewhere in the header/popovers).
function MenuIcon(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.MenuIcon;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function NotepadTextIcon(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.NotepadTextIcon;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function ChatSectionIcon(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.ChatSectionIcon;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function LinkIcon(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.LinkIcon;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function MessageCommentIcon(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.MessageCommentIcon;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function PencilIcon(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.PencilIcon;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function BuildingIcon(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.BuildingIcon;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function BackArrowIcon(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.BackArrowIcon;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function SunIcon(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.SunIcon;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function CloudIcon(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.CloudIcon;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function MistIcon(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.MistIcon;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function CloudRainIcon(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.CloudRainIcon;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function SnowflakeIcon(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.SnowflakeIcon;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function CloudLightningIcon(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.CloudLightningIcon;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function SettingsIcon(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.SettingsIcon;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function MapCogIcon(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.MapCogIcon;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function GiftIcon(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.GiftIcon;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function MoonStarsIcon(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.MoonStarsIcon;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function TextResizeIcon(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.TextResizeIcon;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function BellIcon(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.BellIcon;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function SearchIcon(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.SearchIcon;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function CalendarCheckIcon(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.CalendarCheckIcon;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function LockIcon(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.LockIcon;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function LogoutIcon(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.LogoutIcon;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function RefreshIcon(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.RefreshIcon;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function AdminFilledMenuIcon(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.AdminFilledMenuIcon;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function EmojiPickerIcon(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.EmojiPickerIcon;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function ExternalLinkIcon(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.ExternalLinkIcon;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function ShareIcon(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.ShareIcon;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function WalletIcon(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.WalletIcon;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function CoinIcon(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.CoinIcon;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function BanknoteArrowUpIcon(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.BanknoteArrowUpIcon;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function BanknoteArrowDownIcon(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.BanknoteArrowDownIcon;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function PiggyBankIcon(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.PiggyBankIcon;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function ChartBarIcon(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.ChartBarIcon;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function ChartPieIcon(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.ChartPieIcon;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function CalendarCogIcon(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.CalendarCogIcon;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function CalendarSearchIcon(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.CalendarSearchIcon;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function TrophyIcon(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.TrophyIcon;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function PodiumIcon(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.PodiumIcon;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function CloudDataConnectionIcon(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.CloudDataConnectionIcon;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function LogIcon(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.LogIcon;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function HourglassIcon(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.HourglassIcon;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function AlertTriangleIcon(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.AlertTriangleIcon;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function ShieldCheckIcon(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.ShieldCheckIcon;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function CalendarExportIcon(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.CalendarExportIcon;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function GalleryIcon(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.GalleryIcon;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function PollSectionIcon(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.PollSectionIcon;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function LineHeightIcon(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.LineHeightIcon;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function MegaphoneIcon(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.MegaphoneIcon;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function SmallXIcon(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.SmallXIcon;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function PlaceSectionIcon(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.PlaceSectionIcon;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function ThreeLinesIcon(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.ThreeLinesIcon;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function PlaceCategoryMarkerIcon(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.PlaceCategoryMarkerIcon;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function CctvIcon(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.CctvIcon;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function DicesIcon(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.DicesIcon;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}


// Matches MenuIcon's exact svg wrapper (16x16, stroke 2, round caps) but needs a <rect> child
// alongside its <path>s, which MenuIcon's paths-only prop can't express.




function highlightTextWithYellowMarker(text, keyword) {
  if (!text) return '';
  if (!keyword) return text;
  const cleanKeyword = keyword.trim().toLowerCase();
  if (!cleanKeyword) return text;

  const parts = [];
  let remaining = text;
  const lowerRemaining = () => remaining.toLowerCase();

  while (remaining) {
    const idx = lowerRemaining().indexOf(cleanKeyword);
    if (idx === -1) {
      parts.push(remaining);
      break;
    }
    if (idx > 0) {
      parts.push(remaining.substring(0, idx));
    }
    const matchText = remaining.substring(idx, idx + cleanKeyword.length);
    parts.push(
      /*#__PURE__*/React.createElement("mark", {
        key: remaining.length + idx,
        style: { backgroundColor: '#FEF08A', color: '#1E293B', padding: '0 2px', borderRadius: '2px', fontWeight: 'bold' }
      }, matchText)
    );
    remaining = remaining.substring(idx + cleanKeyword.length);
  }
  return React.createElement(React.Fragment, null, ...parts);
}

function parseTextWithLinks(text, keyword = '') {
  if (!text) return '';
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const urlTestRegex = /^https?:\/\/[^\s]+$/;
  const parts = text.split(urlRegex);
  return parts.map((part, i) => {
    if (urlTestRegex.test(part)) {
      return /*#__PURE__*/React.createElement("a", {
        key: i,
        href: part,
        target: "_blank",
        rel: "noopener noreferrer",
        style: {
          color: '#2563EB',
          textDecoration: 'underline',
          cursor: 'pointer',
          wordBreak: 'break-all'
        }
      }, part);
    }
    return keyword ? highlightTextWithYellowMarker(part, keyword) : part;
  });
}

function isEmojiOnlyChatText(text) {
  const compact = (text || '').trim();
  if (!compact || extractFirstUrl(compact)) return false;
  try {
    return /^[\p{Emoji_Presentation}\p{Extended_Pictographic}\uFE0F\u200D\s]+$/u.test(compact);
  } catch (e) {
    // FE0F/200D are matched as individual quantified class members here, not as part of a
    // combined grapheme, so the character class below is intentional.
    // eslint-disable-next-line no-misleading-character-class
    return /^[\u203C-\u3299\uD83C-\uDBFF\uDC00-\uDFFF\uFE0F\u200D\s]+$/u.test(compact);
  }
}

function formatCommentDate(...args) {
  const f = (window.GATHER_APP_UTILS || {}).formatCommentDate;
  return typeof f === 'function' ? f(...args) : undefined;
}
function formatChatTime(...args) {
  const f = (window.GATHER_APP_UTILS || {}).formatChatTime;
  return typeof f === 'function' ? f(...args) : undefined;
}
function formatChatDividerDate(...args) {
  const f = (window.GATHER_APP_UTILS || {}).formatChatDividerDate;
  return typeof f === 'function' ? f(...args) : undefined;
}
// Returns paired {full, thumb} entries for a chat message's attached image(s), handling both
// the legacy single-image fields (imageUrl/thumbUrl) and the imageUrls/thumbUrls arrays used
// by multi-image messages. Empty array when the message has no image at all. Shared by the
// chat bubble renderer below and the calendar-wide PhotoGallery so both read images the same way.

// A confirmedMeeting.photos[] entry auto-linked via a date hashtag (see
// linkTaggedImageToMeetingDates) is a REFERENCE to a real chat message photo
// (sourceMessageId + sourceImageIndex), not an independent copy -- its imageUrl/thumbUrl/tags
// are resolved live from the source message here whenever it's still loaded locally, so the
// exact same photo with the exact same tags shows up identically in the chat room, every
// gallery, and every meeting date it's linked to, and an edit from any one of those places is
// immediately visible everywhere else. Falls back to the entry's own stored fields when the
// source message isn't loaded locally (yet) or no longer exists, and passes manually-uploaded
// 일정 사진 (no sourceMessageId -- a standalone upload with no chat photo behind it) straight
// through unchanged.
function resolveMeetingPhotoDisplay(photo, chatMessages) {
  const fallback = {
    imageUrl: photo?.imageUrl || photo?.full || '',
    thumbUrl: photo?.thumbUrl || photo?.thumb || photo?.imageUrl || photo?.full || '',
    tags: String(photo?.tags || '')
  };
  if (!photo?.sourceMessageId || !Number.isInteger(photo?.sourceImageIndex)) return fallback;
  const sourceMessage = (Array.isArray(chatMessages) ? chatMessages : []).find(m => m && m.id === photo.sourceMessageId);
  if (!sourceMessage) return fallback;
  const entry = getMessageImageEntries(sourceMessage)[photo.sourceImageIndex];
  if (!entry) return fallback;
  return { imageUrl: entry.full, thumbUrl: entry.thumb, tags: entry.tags || '' };
}




// Renders a chat message's attached image(s): a single thumbnail for legacy/one-image
// messages, or a wrapping grid of thumbnails for messages sent with multiple images
// (msg.imageUrls/msg.thumbUrls). Returns null when the message has no image at all.
// Shared by renderChatMessageImages below and renderChatMessageBody's caption-text cap so a
// multi-image grid and the caption text under it always agree on a max width -- without this,
// a fit-content chat bubble sizes itself to whichever of the two is wider, and an uncapped long
// caption stretches the bubble past the grid, leaving a visible gap to the grid's right.
function computeChatImageGridMaxWidth(count) {
  const mobileCols = count === 2 ? 2 : 3;
  const isMobile = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(max-width: 640px)').matches;
  const activeCols = isMobile ? mobileCols : (count >= 12 ? 6 : count >= 5 ? 5 : mobileCols);
  // Deliberately a plain length, NOT wrapped in min(100%, ...) -- every caller already pairs this
  // with width:'100%' on the same element, which already shrinks it to the actual available space
  // during normal layout (percentages resolve fine against a definite parent there). Wrapping the
  // max-width itself in min(100%, ...) is redundant for that, and actively wrong: verified via an
  // isolated repro that when an ANCESTOR (the fit-content chat bubble) is computing its own
  // preferred width, a descendant's max-width containing a percentage inside min()/max() resolves
  // as indefinite for that intrinsic-size calculation and gets ignored -- so the bubble sizes
  // itself to something close to its full available width instead of hugging this grid's actual
  // (much narrower) rendered size, leaving a large gap next to it. A bare length isn't ambiguous
  // that way, and still gets safely clamped by the paired width:'100%' when the bubble ends up
  // genuinely narrower than this value.
  return isMobile ? '280px' : `calc(${activeCols} * 76px + (${activeCols} - 1) * 4px)`;
}
function renderChatMessageImages(msg, setActiveLightbox, singleImageStyle = {}) {
  const entries = getMessageImageEntries(msg);
  if (entries.length === 0) return null;
  const thumbs = entries.map(e => e.thumb);
  const displayUrls = entries.map(e => e.full);
  const meta = entries.map(e => ({ timestamp: msg.timestamp, messageId: msg.id, imageIndex: e.imageIndex, thumb: e.thumb, tags: e.tags, source: e.source, uploadSource: e.uploadSource }));
  if (thumbs.length === 1) {
    return /*#__PURE__*/React.createElement('img', {
      src: displayUrls[0] || thumbs[0],
      alt: '첨부이미지',
      loading: 'lazy',
      decoding: 'async',
      referrerPolicy: 'no-referrer',
      onClick: () => setActiveLightbox && setActiveLightbox({ urls: displayUrls, index: 0, meta }),
      style: {
        display: 'block',
        borderRadius: 'var(--radius-md)',
        cursor: 'pointer',
        objectFit: 'contain',
        width: '100%',
        height: 'auto',
        ...singleImageStyle,
        // Plain length, NOT min(100%, ...) -- same fit-content-ancestor bug as
        // computeChatImageGridMaxWidth above (see its comment): wrapping this in min() with a
        // percentage makes the chat bubble's own fit-content width calculation treat it as
        // indefinite and ignore the cap, so the bubble balloons out while the actual <img> still
        // renders capped at maxWidth during normal layout -- leaving a gap on its right. This was
        // the single-image case that PR #230 (grid/link-preview/URL text) didn't cover, which is
        // why the same-looking gap kept resurfacing on plain photo messages. width:'100%' above
        // already shrinks it safely on a narrow bubble.
        maxWidth: singleImageStyle.maxWidth || '420px',
        maxHeight: singleImageStyle.maxHeight || '60vh'
      }
    });
  }

  // Multi-image layout: PC gets denser rows (4/5/6 cols) while Mobile uses compact 2/3 cols with minmax(0, 1fr)
  // so thumbnails never overflow the chat speech bubble or the right edge of mobile screens.
  const mobileCols = thumbs.length === 2 ? 2 : 3;
  const isMobile = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(max-width: 640px)').matches;
  const activeCols = isMobile ? mobileCols : (thumbs.length >= 12 ? 6 : thumbs.length >= 5 ? 5 : mobileCols);
  const maxW = computeChatImageGridMaxWidth(thumbs.length);

  return /*#__PURE__*/React.createElement('div', {
    className: `chat-message-image-grid${thumbs.length >= 5 ? ' is-wide' : ''}`,
    style: {
      width: '100%',
      maxWidth: maxW,
      boxSizing: 'border-box'
    }
  }, /*#__PURE__*/React.createElement('div', {
    style: {
      display: 'grid',
      gridTemplateColumns: `repeat(${activeCols}, minmax(0, 1fr))`,
      gap: '4px',
      width: '100%',
      maxWidth: '100%',
      boxSizing: 'border-box',
      marginBottom: singleImageStyle.marginBottom || '0'
    }
  }, thumbs.map((thumb, idx) => /*#__PURE__*/React.createElement('img', {
    key: idx,
    src: thumb,
    alt: `첨부이미지 ${idx + 1}`,
    loading: 'lazy',
    decoding: 'async',
    referrerPolicy: 'no-referrer',
    onClick: () => setActiveLightbox && setActiveLightbox({ urls: displayUrls, index: idx, meta }),
    style: {
      display: 'block',
      width: '100%',
      aspectRatio: '1',
      borderRadius: '6px',
      cursor: 'pointer',
      objectFit: 'cover'
    }
  }))));
}

// Best-effort per-image metadata for the Lightbox info overlay. Chat images are stored either
// inline as base64 data: URIs (exact size/type derivable from the string itself) or as uploaded
// Firebase Storage URLs -- the latter can't have their size read via a network fetch (Firebase
// Storage's download endpoint sends no CORS header by default, so the browser silently blocks a
// cross-origin fetch() from reading the response), so uploadChatImageAssets/uploadMemoImageAssets
// instead embed the byte size directly in the filename at upload time (e.g. "..._original_
// 214875b.jpg"), which getStorageUrlFileSize parses back out here with zero extra requests.
function getStorageUrlFileSize(url) {
  if (typeof url !== 'string') return null;
  const match = url.match(/_(\d+)b\.[a-zA-Z0-9]+(?:[?#]|$)/);
  return match ? Number(match[1]) : null;
}

function getImageExtFromMime(mime) {
  const map = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif', 'image/heic': 'heic' };
  if (mime && map[mime]) return map[mime];
  const sub = mime && mime.split('/')[1];
  return sub ? sub.split('+')[0] : 'jpg';
}

function buildLightboxImageInfo(url, timestamp) {
  const dataInfo = getDataUrlInfo(url);
  const mime = dataInfo ? dataInfo.mime : 'image/jpeg';
  const ext = getImageExtFromMime(mime);
  const fileDate = timestamp ? new Date(timestamp) : null;
  const fileName = fileDate
    ? `moyeora_${fileDate.getFullYear()}${String(fileDate.getMonth() + 1).padStart(2, '0')}${String(fileDate.getDate()).padStart(2, '0')}_${String(fileDate.getHours()).padStart(2, '0')}${String(fileDate.getMinutes()).padStart(2, '0')}${String(fileDate.getSeconds()).padStart(2, '0')}.${ext}`
    : `moyeora_image.${ext}`;
  let dateLabel = null;
  if (timestamp) {
    const { dateStr, timeStr } = formatCommentDate(timestamp);
    dateLabel = `${dateStr} ${timeStr}`;
  }
  const storageSizeBytes = !dataInfo ? getStorageUrlFileSize(url) : null;
  return {
    dateLabel,
    fileName,
    sizeLabel: dataInfo ? formatBytes(dataInfo.sizeBytes) : (storageSizeBytes != null ? formatBytes(storageSizeBytes) : null),
    typeLabel: ext.toUpperCase()
  };
}



// Black-gradient info panel shown at the bottom of the active photo when the Lightbox's
// tap-to-toggle info mode is on. Fixed 4-line layout: 업로드 date, 파일정보 (format/size/
// dimensions), 해시태그 capsules + URL button, and the 태그입력 input row. 해시태그 is the
// public-facing name for what's stored as one space/comma-delimited string per image (see
// handleSaveImageTags) -- parsed into individual #tag capsules here for display/delete/search.




// Full-screen image viewer for a message's photo(s) -- swipeable (touch) with left/right arrow
// buttons and dot indicators when there's more than one image, matching the KakaoTalk-style
// multi-photo gallery UX the chat bubbles are modeled after. `meta` (optional, parallel to
// `urls`) supplies each image's { timestamp } for the tap-to-toggle info overlay.
function LightboxInfoPanel(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.LightboxInfoPanel;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function Lightbox(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.Lightbox;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}


// Tracks which message row's edit/delete controls should be revealed: desktop hover is
// handled purely in CSS (see .msg-row-hover:hover), this only drives the mobile tap case --
// tapping a row reveals its controls, tapping anywhere else (including another row) hides them.
function useTapRevealedMsgId() {
  const [revealedId, setRevealedId] = React.useState(null);
  React.useEffect(() => {
    const handler = e => {
      const target = e.target.closest ? e.target.closest('[data-msg-row-id]') : null;
      setRevealedId(target ? target.getAttribute('data-msg-row-id') : null);
    };
    document.addEventListener('touchstart', handler, { passive: true });
    document.addEventListener('mousedown', handler);
    return () => {
      document.removeEventListener('touchstart', handler);
      document.removeEventListener('mousedown', handler);
    };
  }, []);
  return revealedId;
}

// Tracks whether the user has actually typed/edited a text field (not merely clicked a
// toggle/radio/checkbox/dropdown, tapped a search result, or tapped around) since a modal opened,
// and exposes a single backdrop-click/close-button handler built on top of that: closes
// immediately when nothing was typed, or routes through onRequestConfirm ("저장하지 않은 내용이
// 있습니다...") when it was -- so a stray tap on the dim background never silently discards text
// someone was mid-way through writing, while a pure click-only interaction (picking a search
// result, toggling 방문/예정, choosing a category) never triggers an unnecessary confirmation.
// Listens at the document level (not scoped to the modal's own DOM) since every modal in this app
// is effectively singular/blocking while open -- see DateModal's own bespoke field-diff version
// of this same idea (formBaselineRef/requestClose) for the original reference implementation this
// generalizes for every other form modal. `active` defaults to true, which is correct for the
// common case (a modal component that mounts fresh each time it opens and unmounts on close) --
// pass `active` explicitly only for a modal that's really an always-mounted conditional block
// inside a persistent page (e.g. MemoView's inline memo editor), so the listener doesn't pick up
// typing elsewhere on that page and the dirty flag resets on each open rather than only once ever.
function useModalDirtyGuard(onClose, onRequestConfirm, message, active = true) {
  const dirtyRef = React.useRef(false);
  React.useEffect(() => {
    if (!active) return undefined;
    dirtyRef.current = false;
    const handler = e => {
      const target = e.target;
      const tag = target && target.tagName;
      if (tag !== 'TEXTAREA' && tag !== 'INPUT') return;
      const type = (target.type || 'text').toLowerCase();
      if (/^(checkbox|radio|range|color|file|submit|button|reset|image)$/.test(type)) return;
      dirtyRef.current = true;
    };
    document.addEventListener('input', handler, true);
    return () => document.removeEventListener('input', handler, true);
  }, [active]);
  const requestClose = React.useCallback(() => {
    if (dirtyRef.current && typeof onRequestConfirm === 'function') {
      onRequestConfirm('닫기 확인', message || '저장하지 않은 내용이 있습니다. 닫으시겠습니까?', () => onClose());
      return;
    }
    onClose();
  }, [onClose, onRequestConfirm, message]);
  const overlayOnClick = React.useCallback(e => {
    if (e.target !== e.currentTarget) return;
    requestClose();
  }, [requestClose]);
  return { requestClose, overlayOnClick, markSaved: () => { dirtyRef.current = false; } };
}

// De-dupes rapid double-taps / pointerdown+click event duplication firing onSend() twice for the
// same message -- extracted from ChatRoomView (see its own history of this exact bug) so
// CommentsSection's independent Send button/Ctrl+Enter shortcut get the same protection instead
// of quietly missing it.
function useChatSendGuard(onSend, canSend) {
  const lockRef = React.useRef(false);
  return () => {
    if (!canSend() || lockRef.current) return;
    lockRef.current = true;
    Promise.resolve(onSend && onSend()).finally(() => {
      setTimeout(() => {
        lockRef.current = false;
      }, 250);
    });
  };
}



function ChatRoomView(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.ChatRoomView;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}


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

const EMOJI_CATEGORIES = Array.isArray(GATHER_APP_CHAT_DATA.EMOJI_CATEGORIES) ? GATHER_APP_CHAT_DATA.EMOJI_CATEGORIES : [
  { label: '표정', emojis: ['😀', '😁', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😍', '🥰', '😘', '😋', '😜', '🤪', '😎', '🤩', '🥳', '😏', '😢', '😭', '😤', '😡', '🥺', '😱', '😨', '😴', '🤔', '🙄', '😅', '😐', '🤗', '🤭'] },
  { label: '손동작·사람', emojis: ['👍', '👎', '👏', '🙌', '🙏', '👋', '🤝', '💪', '✌️', '🤞', '👌', '🤙', '👊', '🤟', '🖐️', '🙇', '🙇‍♂️', '🙇‍♀️', '🤦', '🤷'] },
  { label: '하트', emojis: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '💕', '💖', '💗', '💘', '💝', '😻'] },
  { label: '동물·자연', emojis: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐷', '🐸', '🐵', '🌸', '🌼', '🌻', '🌈', '⭐', '☀️', '☁️', '❄️'] },
  { label: '음식', emojis: ['🍎', '🍕', '🍔', '🍟', '🍗', '🍺', '🍻', '☕', '🍰', '🎂', '🍫', '🍭', '🍜', '🍱', '🍚', '🥗'] },
  { label: '활동·사물', emojis: ['🎉', '🎊', '🎁', '🎈', '🎵', '🎶', '⚽', '📷', '📱', '💻', '⏰', '🔥', '💤', '💯', '✅', '❌', '⚠️', '📌', '📍', '🚗'] },
  { label: '기호', emojis: ['✨', '💥', '💫', '💦', '💨', '🆗', '🆒', '🔔', '🚫', '❓', '❗', '➕', '➖'] }
];

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





function ChatParticipantSheet(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.ChatParticipantSheet;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function NotificationPermissionHelpModal(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.NotificationPermissionHelpModal;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}


function ConfirmDialog(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.ConfirmDialog;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}








// canvas-confetti creates ONE shared canvas on the first confetti() call anywhere in the app and
// bakes that call's zIndex into it permanently -- later calls with a different zIndex are
// ignored since the canvas is reused, not recreated. So every call site must pass this same
// value, or an earlier low-zIndex call (e.g. a chat send burst) locks the canvas behind modals.
const CONFETTI_Z_INDEX = 999999;

function getShortTitleParts(dateStr) {
  if (!dateStr) return { year: '', rest: '' };
  const [year, month, day] = dateStr.split('-');
  const dateObj = new Date(year, month - 1, day);
  const dayOfWeek = ['일', '월', '화', '수', '목', '금', '토'][dateObj.getDay()];
  const shortYear = year.slice(2);
  return {
    year: `${shortYear}.`,
    rest: `${month}.${day}(${dayOfWeek})`
  };
}




function DateModal(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.DateModal;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}




function doesPlaceMatchDate(place, dateStr) {
  if (place.visitDate === dateStr) return true;
  const normalizedTarget = normalizePlaceDateForSort(dateStr);
  if (!normalizedTarget) return false;
  if (place.visitDate && normalizePlaceDateForSort(place.visitDate) === normalizedTarget) return true;
  const visitEntries = parseVisitEntriesFromMemo(place.memo);
  for (const entry of visitEntries) {
    if (normalizePlaceDateForSort(entry.date) === normalizedTarget) return true;
  }
  const memoDate = extractLeadingMemoDate(place.memo);
  if (memoDate && normalizePlaceDateForSort(memoDate) === normalizedTarget) return true;
  return false;
}


const rebuildCalendarToTimestamp = (calendar, T, logs = []) => {
  const now = Date.now();

  // Sort chronologically
  const sortedLogs = [...logs].sort((a, b) => a.timestamp - b.timestamp);

  // 1. Rebuild participants (only kept if created before T, un-removed if deleted after T)
  const rebuiltParticipants = (calendar.participants || [])
    .filter(p => (p.updatedAt || 0) <= T)
    .map(p => {
      if (p.removedAt && p.removedAt > T) {
        const { removedAt, ...rest } = p;
        return rest;
      }
      return p;
    });

  const participantIds = new Set(rebuiltParticipants.map(p => p.id));

  // 2. Rebuild availabilities
  const rebuiltAvailabilities = new Map();
  for (const log of sortedLogs) {
    if (log.timestamp > T) continue;
    if (POLL_ACTIVITY_ACTIONS.includes(log.action)) continue;
    if (log.participantId && !participantIds.has(log.participantId)) continue;

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
function SectionCountBadge(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.SectionCountBadge;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function SectionToggleButton(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.SectionToggleButton;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function SearchCategoryTabs(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.SearchCategoryTabs;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function SimpleBottomSheetPicker(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.SimpleBottomSheetPicker;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function PhotoGallery(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.PhotoGallery;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function SummaryList(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.SummaryList;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}




// Wraps every case-insensitive match of `keyword` inside `text` in a <mark>. Shared by
// GlobalSearchModal (single-calendar) and AdminUnifiedSearchResultsView (cross-calendar).
function highlightKeyword(text, keyword) {
  if (!text) return '';
  if (!keyword) return text;
  const cleanKeyword = keyword.trim().toLowerCase();
  if (!cleanKeyword) return text;

  const parts = [];
  let remaining = text;
  const lowerRemaining = () => remaining.toLowerCase();

  while (remaining) {
    const idx = lowerRemaining().indexOf(cleanKeyword);
    if (idx === -1) {
      parts.push(remaining);
      break;
    }
    if (idx > 0) {
      parts.push(remaining.substring(0, idx));
    }
    const matchText = remaining.substring(idx, idx + cleanKeyword.length);
    parts.push(
      /*#__PURE__*/React.createElement("mark", {
        key: remaining.length,
        style: { backgroundColor: '#FEF08A', color: '#1E293B', padding: '0 2px', borderRadius: '2px', fontWeight: 'bold' }
      }, matchText)
    );
    remaining = remaining.substring(idx + cleanKeyword.length);
  }
  return React.createElement(React.Fragment, null, ...parts);
}

// Formats a timestamp the same way the admin 로그 tab does, so every search result row (and the
// admin chat log itself) reads identically: "8/13 오후 2:05:31" style, ko-KR locale.
function formatLogTimestamp(ts) {
  if (!ts) return '';
  return new Date(ts).toLocaleString('ko-KR', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

// Left-pointing chevron/arrow used by every "back to previous screen" header in this app
// (memo view, unified search results, etc.) -- one definition so the stroke weight/shape never
// drifts between screens.
// The single "<" back-button glyph used at the left of every page header in the app (chat room,
// memo, admin unified search, and any future page) -- a chevron-down rotated 90deg, matching the
// exact shape/weight this app has always used for "go back", not a full arrow-with-shaft.


// One keyword-search pass over a single calendar's 일정/채팅/태그/정산/메모 data. Shared by
// GlobalSearchModal (single active calendar) and AdminUnifiedSearchResultsView (looped across
// every calendar) so the two search surfaces can never drift out of sync on matching rules.
function computeCalendarSearchMatches(cal, chatMessages, memoList, q, limit = 30) {
  if (!cal || !q) return { schedules: [], chat: [], photos: [], places: [], expenses: [], memos: [] };
  const participantsMap = getActiveParticipants(cal).reduce((acc, p) => { acc[p.id] = p; return acc; }, {});
  const expenseCategoriesMap = getExpenseCategories(cal).reduce((acc, c) => { acc[c.id] = c; return acc; }, {});

  const schedules = getActiveAvailabilities(cal)
    .filter(item => (item.note || '').toLowerCase().includes(q) || (participantsMap[item.participantId]?.name || '').toLowerCase().includes(q))
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, limit)
    .map(item => ({ ...item, participantName: participantsMap[item.participantId]?.name || '알수없음', participantColor: participantsMap[item.participantId]?.color || '#94A3B8' }));

  const chat = (chatMessages || [])
    .filter(msg => (msg.text || '').toLowerCase().includes(q))
    .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
    .slice(0, limit)
    .map(msg => ({ ...msg, participantName: participantsMap[msg.participantId]?.name || '알수없음', participantColor: participantsMap[msg.participantId]?.color || '#94A3B8' }));

  const photos = [];
  (cal.confirmedMeeting || []).forEach(meeting => {
    (meeting.photos || []).forEach(photo => {
      if ((photo.tags || '').toLowerCase().includes(q) || (meeting.date || '').toLowerCase().includes(q)) {
        photos.push({ ...photo, date: meeting.date });
      }
    });
  });

  const getCalendarPlaces = typeof window !== 'undefined' && window.GATHER_APP_UTILS && window.GATHER_APP_UTILS.getCalendarPlaces ? window.GATHER_APP_UTILS.getCalendarPlaces : (() => []);
  const places = (getCalendarPlaces(cal) || [])
    .filter(place => (place.name || '').toLowerCase().includes(q) || (place.alias || '').toLowerCase().includes(q) || (place.address || '').toLowerCase().includes(q) || (place.memo || '').toLowerCase().includes(q))
    .slice(0, limit);

  const tags = [];
  (chatMessages || []).forEach(msg => {
    const directEntry = getMessageDirectMediaEntry(msg);
    const imageEntries = directEntry ? [...getMessageImageEntries(msg), directEntry] : getMessageImageEntries(msg);
    imageEntries.forEach(entry => {
      if ((entry.tags || '').toLowerCase().includes(q)) {
        tags.push({ ...entry, participantName: participantsMap[msg.participantId]?.name || '알수없음', participantColor: participantsMap[msg.participantId]?.color || '#94A3B8' });
      }
    });
  });
  tags.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

  const expenses = [];
  (cal.confirmedMeeting || []).forEach(meeting => {
    (meeting.expenses || []).forEach(exp => {
      const isIncome = isExpenseIncomeEntry(exp);
      const category = expenseCategoriesMap[exp.categoryId];
      const categoryName = isIncome ? '수입' : (category?.name || '기타');
      const categoryColor = isIncome ? '#16A34A' : (category?.color || '#94A3B8');
      if ((exp.label || '').toLowerCase().includes(q) || (exp.url || '').toLowerCase().includes(q) || categoryName.toLowerCase().includes(q)) {
        expenses.push({ ...exp, date: meeting.date, categoryName, categoryColor });
      }
    });
  });
  expenses.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

  const memos = (memoList || [])
    .filter(memo => (memo.title || '').toLowerCase().includes(q) || (memo.text || '').toLowerCase().includes(q) || (memo.tags || []).some(t => (t || '').toLowerCase().includes(q)))
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
    .slice(0, limit)
    .map(memo => ({ ...memo, participantName: participantsMap[memo.participantId]?.name || '알수없음', participantColor: participantsMap[memo.participantId]?.color || '#94A3B8' }));

  return { schedules, chat, photos: photos.slice(0, limit), places, tags: tags.slice(0, limit), expenses: expenses.slice(0, limit), memos };
}

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
function getAdminSearchResultTargetUrl(type, item) {
  const params = new URLSearchParams({ id: item.calendarId });
  if (type === 'schedules' || type === 'expenses') {
    params.set('date', item.date);
  } else if (type === 'chat') {
    params.set('view', 'chat');
    params.set('msg', item.id);
  } else if (type === 'tags') {
    params.set('view', 'chat');
    params.set('msg', item.messageId);
    params.set('img', String(item.imageIndex));
  } else if (type === 'memos') {
    params.set('view', 'memo');
  }
  return `${getAppBaseUrl()}?${params.toString()}`;
}



// Share Modal
function ShareModal(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.ShareModal;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}


function UserManualOverlay(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.UserManualOverlay;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}





















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

function WeatherBadge(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.WeatherBadge;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function WeatherLocationModal(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.WeatherLocationModal;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}


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






function SharedSideMenuSettings(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.SharedSideMenuSettings;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function MainSideMenu(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.MainSideMenu;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}


function UpdateAvailableBanner(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.UpdateAvailableBanner;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function ImageShareViewer(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.ImageShareViewer;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function ImageThumbRemoveButton(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.ImageThumbRemoveButton;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function InlineSearchBar(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.InlineSearchBar;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function MemoShareModal(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.MemoShareModal;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function ChatSideMenu(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.ChatSideMenu;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}


function ChatGalleryModal(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.ChatGalleryModal;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}


// Scroll-direction-based header visibility (hide on scroll-down, reveal on scroll-up or near
// the top), the same behavior as the chat room header (see handleChatScroll in ChatRoomView).
// Shared here so any other full-page header (memo, and future pages) can adopt the identical
// hide/show + floating-back-button pattern without re-deriving the threshold logic.
function useScrollHideHeader() {
  const [isHeaderVisible, setIsHeaderVisible] = React.useState(true);
  const lastScrollTopRef = React.useRef(0);
  const onScroll = React.useCallback((e) => {
    const scrollTop = e.target.scrollTop;
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

function MemoView(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.MemoView;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}





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

// REST fallback helper for uploading memo image assets to Firebase Storage
function uploadMemoImageAssets(calendarId, compressed, index, onBytes, timeoutMs = 45000) {
  return new Promise((resolve) => {
    if (!firebaseStorage || !compressed?.originalBlob || !compressed?.thumbnailBlob) {
      resolve(null);
      return;
    }
    const stamp = Date.now();
    const rand = Math.random().toString(36).slice(2, 8);
    const basePath = `memoImages/${calendarId}/${stamp}_${rand}_${index}`;
    // Byte size embedded in the filename -- see the matching comment in uploadChatImageAssets.
    const originalMeta = getUploadImageBlobMeta(compressed.originalBlob, 'jpg');
    const thumbMeta = getUploadImageBlobMeta(compressed.thumbnailBlob, originalMeta.ext === 'png' ? 'png' : 'jpg');
    const originalRef = firebaseStorage.ref(`${basePath}_original_${compressed.originalBlob.size}b.${originalMeta.ext}`);
    const thumbRef = firebaseStorage.ref(`${basePath}_thumb_${compressed.thumbnailBlob.size}b.${thumbMeta.ext}`);

    const runUploadOnce = (blob, ref, taskKey, contentType) => {
      let settled = false;
      return new Promise((resolveOne) => {
        const settle = value => { if (settled) return; settled = true; resolveOne(value); };
        const timeoutId = setTimeout(() => settle(null), timeoutMs);
        const task = ref.put(blob, { contentType });
        task.on('state_changed', snapshot => {
          if (onBytes) onBytes(taskKey, snapshot.bytesTransferred, snapshot.totalBytes);
        }, () => { clearTimeout(timeoutId); settle(null); }, async () => {
          clearTimeout(timeoutId);
          try {
            settle(await task.snapshot.ref.getDownloadURL());
          } catch (e) {
            settle(null);
          }
        });
      });
    };
    // One retry before giving up -- see the matching comment in uploadChatImageAssets.
    const runUpload = async (blob, ref, taskKey, contentType) => {
      const first = await runUploadOnce(blob, ref, taskKey, contentType);
      if (first) return first;
      return runUploadOnce(blob, ref, taskKey, contentType);
    };

    Promise.all([
      runUpload(compressed.originalBlob, originalRef, `${index}-orig`, originalMeta.contentType),
      runUpload(compressed.thumbnailBlob, thumbRef, `${index}-thumb`, thumbMeta.contentType)
    ]).then(([imageUrl, thumbUrl]) => {
      if (imageUrl && thumbUrl) resolve({ imageUrl, thumbUrl });
      else {
        console.warn('Memo image Storage upload failed');
        resolve(null);
      }
    });
  });
}



function getAnniversariesForDate(dateStr, anniversariesList) {
  if (!dateStr || !Array.isArray(anniversariesList)) return [];
  const [y, m, d] = dateStr.split('-').map(Number);
  
  const results = [];
  anniversariesList.forEach(ann => {
    if (ann.type === 'yearly') {
      if (ann.isLunar) {
        try {
          const cal = new KoreanLunarCalendar();
          const [lunarM, lunarD] = ann.date.split('-').map(Number);
          cal.setLunarDate(y, lunarM, lunarD, !!ann.isLeap);
          const solar = cal.getSolarCalendar();
          if (solar && solar.year === y && solar.month === m && solar.day === d) {
            results.push({
              id: ann.id,
              title: `${ann.title} (음)`,
              badgeColor: '#EF4444',
              icon: '🎂'
            });
          }
        } catch (e) {
          console.warn('Lunar date calculation failed for', ann.title, e);
        }
      } else {
        const [solarM, solarD] = ann.date.split('-').map(Number);
        if (solarM === m && solarD === d) {
          results.push({
            id: ann.id,
            title: `${ann.title}`,
            badgeColor: '#EF4444',
            icon: '🎂'
          });
        }
      }
    } else if (ann.type === 'dday') {
      const targetStr = ann.targetDate;
      if (targetStr === dateStr) {
        results.push({
          id: ann.id,
          title: `${ann.title} (D-Day)`,
          badgeColor: '#3B82F6',
          icon: '🎁'
        });
      } else {
        const tDate = new Date(`${targetStr}T00:00:00`);
        const cDate = new Date(`${dateStr}T00:00:00`);
        const diffMs = cDate.getTime() - tDate.getTime();
        const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
        
        if (ann.isCountDown) {
          if (diffDays < 0) {
            const daysLeft = Math.abs(diffDays);
            if (daysLeft === 100 || daysLeft === 50 || daysLeft === 10 || daysLeft === 30) {
              results.push({
                id: ann.id,
                title: `${ann.title} D-${daysLeft}`,
                badgeColor: '#6366F1',
                icon: '📅'
              });
            }
          }
        } else {
          if (diffDays === 99) {
            results.push({
              id: ann.id,
              title: `${ann.title} 100일`,
              badgeColor: '#EC4899',
              icon: '💖'
            });
          } else if (diffDays === 199) {
            results.push({
              id: ann.id,
              title: `${ann.title} 200일`,
              badgeColor: '#EC4899',
              icon: '💖'
            });
          } else if (diffDays === 299) {
            results.push({
              id: ann.id,
              title: `${ann.title} 300일`,
              badgeColor: '#EC4899',
              icon: '💖'
            });
          } else if (diffDays === 364) {
            results.push({
              id: ann.id,
              title: `${ann.title} 1주년`,
              badgeColor: '#EC4899',
              icon: '🎉'
            });
          } else if (diffDays > 0 && diffDays % 365 === 364) {
            const years = Math.round((diffDays + 1) / 365);
            results.push({
              id: ann.id,
              title: `${ann.title} ${years}주년`,
              badgeColor: '#EC4899',
              icon: '🎉'
            });
          }
        }
      }
    }
  });
  return results;
}

// Anniversary badges default to a generic type color, but when the title names an active
// participant (e.g. "김현석 생일"), use that person's own calendar color instead. Matches
// against the LONGEST participant name found in the title first, so a short name (e.g. "김현")
// can't shadow a longer, more specific one (e.g. "김현석") that also appears in the list.
function getAnniversaryDisplayColor(ann, calendar) {
  const matched = getActiveParticipants(calendar)
    .filter(p => p.name && ann.title.includes(p.name))
    .sort((a, b) => b.name.length - a.name.length)[0];
  return matched ? matched.color : ann.badgeColor;
}

// Signed day-count from today to targetDateStr (positive = future, negative = past),
// local-midnight based to match formatDDayLabel's convention.
function calculateDday(targetDateStr) {
  const [y, m, d] = targetDateStr.split('-').map(Number);
  const target = new Date(y, m - 1, d);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((target - today) / 86400000);
}

// Converts a lunar calendar date to its solar-calendar equivalent for display
// (e.g. showing "this year's" solar date next to a recurring lunar anniversary).
// Returns a 'YYYY-MM-DD' string, or null if the lunar date is invalid.
function getSolarFromLunar(year, month, day, isLeap) {
  try {
    const cal = new KoreanLunarCalendar();
    cal.setLunarDate(year, month, day, !!isLeap);
    const solar = cal.getSolarCalendar();
    if (!solar) return null;
    return `${solar.year}-${String(solar.month).padStart(2, '0')}-${String(solar.day).padStart(2, '0')}`;
  } catch (e) {
    console.warn('Lunar to solar conversion failed:', e);
    return null;
  }
}

function AnniversaryModal(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.AnniversaryModal;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function SettlementSummaryModal(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.SettlementSummaryModal;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function PollModal(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.PollModal;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}



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
const DEADLINE_PICKER_MONTH_NAMES = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];




// Summary List - Displays both "Partial Availability" (N+ members) and "Full Availability" lists


// Leaflet is a UMD/global-style library (not an ES module), so unlike loadHeicTo's dynamic
// import(), it has to be lazy-loaded via a plain <script> tag injection -- mirrors the same
// memoized-promise + multi-CDN-fallback shape though, reusing loadScriptOnce from the HEIC
// loading code above.
let leafletLoadPromise = null;
const LEAFLET_JS_CDN_URLS = [
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
  'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.js'
];
const LEAFLET_CSS_CDN_URLS = [
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.css'
];
function loadLeafletCss() {
  if (document.getElementById('leaflet-css-link')) return;
  const link = document.createElement('link');
  link.id = 'leaflet-css-link';
  link.rel = 'stylesheet';
  link.href = LEAFLET_CSS_CDN_URLS[0];
  document.head.appendChild(link);
}
function loadLeaflet(timeoutMs = 15000) {
  if (window.L) return Promise.resolve(window.L);
  if (leafletLoadPromise) return leafletLoadPromise;
  leafletLoadPromise = (async () => {
    loadLeafletCss();
    let lastErr = null;
    for (const src of LEAFLET_JS_CDN_URLS) {
      try {
        await loadScriptOnce(src, timeoutMs);
        if (window.L) return window.L;
        lastErr = new Error('leaflet script loaded but window.L missing');
      } catch (err) {
        lastErr = err;
      }
    }
    leafletLoadPromise = null; // allow retrying on a later call instead of caching the failure forever
    throw lastErr || new Error('leaflet failed to load from all CDNs');
  })();
  return leafletLoadPromise;
}

// Marker clustering (leaflet.markercluster) -- with dozens/hundreds of places (e.g. an imported
// travel log), rendering every pin as its own live DOM marker makes Leaflet's pan/zoom repaint
// visibly janky since it repositions every marker element on every animation frame. Grouping
// nearby pins into a single cluster badge that only splits apart once you zoom in keeps the
// number of on-screen marker elements small regardless of how many places are registered.
// Best-effort: if this plugin fails to load, the map still works with ungrouped markers (see the
// clusterAvailable fallback in PlaceMapView below) rather than failing the whole map.
let leafletMarkerClusterLoadPromise = null;
const LEAFLET_MARKERCLUSTER_JS_CDN_URLS = [
  'https://unpkg.com/leaflet.markercluster@1.5.3/dist/leaflet.markercluster.js',
  'https://cdn.jsdelivr.net/npm/leaflet.markercluster@1.5.3/dist/leaflet.markercluster.js'
];
function loadLeafletMarkerClusterCss() {
  if (document.getElementById('leaflet-markercluster-css-link')) return;
  const link = document.createElement('link');
  link.id = 'leaflet-markercluster-css-link';
  link.rel = 'stylesheet';
  link.href = 'https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.css';
  document.head.appendChild(link);
}
function loadLeafletMarkerCluster(timeoutMs = 15000) {
  if (window.L && window.L.markerClusterGroup) return Promise.resolve();
  if (leafletMarkerClusterLoadPromise) return leafletMarkerClusterLoadPromise;
  leafletMarkerClusterLoadPromise = (async () => {
    loadLeafletMarkerClusterCss();
    let lastErr = null;
    for (const src of LEAFLET_MARKERCLUSTER_JS_CDN_URLS) {
      try {
        await loadScriptOnce(src, timeoutMs);
        if (window.L && window.L.markerClusterGroup) return;
        lastErr = new Error('leaflet.markercluster script loaded but L.markerClusterGroup missing');
      } catch (err) {
        lastErr = err;
      }
    }
    leafletMarkerClusterLoadPromise = null;
    throw lastErr || new Error('leaflet.markercluster failed to load from all CDNs');
  })();
  return leafletMarkerClusterLoadPromise;
}



// Default center/zoom for a calendar with no places registered yet -- Seoul City Hall, a
// reasonable default since this app is Korean-audience-only.
const PLACE_MAP_DEFAULT_CENTER = [37.5665, 126.9780];
const PLACE_MAP_DEFAULT_ZOOM = 11;
// Rough bounding box for South+North Korea -- used only to decide which registered places count
// as "domestic" for the main-screen preview map's auto-fit (see preferDomesticBounds below), not
// as a precise border.
function stripKoreaCountryPrefix(...args) {
  const f = (window.GATHER_APP_UTILS || {}).stripKoreaCountryPrefix;
  return typeof f === 'function' ? f(...args) : undefined;
}
function normalizeDomesticKoreanAddress(...args) {
  const f = (window.GATHER_APP_UTILS || {}).normalizeDomesticKoreanAddress;
  return typeof f === 'function' ? f(...args) : undefined;
}
const trimLatLngOutliers = GATHER_APP_UTILS.trimLatLngOutliers || function trimLatLngOutliers(points) {
  if (!Array.isArray(points) || points.length <= 5) return points || [];
  const lats = points.map(p => p[0]).slice().sort((a, b) => a - b);
  const lngs = points.map(p => p[1]).slice().sort((a, b) => a - b);
  const pct = (arr, p) => arr[Math.min(arr.length - 1, Math.max(0, Math.round(p * (arr.length - 1))))];
  const latLo = pct(lats, 0.1), latHi = pct(lats, 0.9);
  const lngLo = pct(lngs, 0.1), lngHi = pct(lngs, 0.9);
  const trimmed = points.filter(([lat, lng]) => lat >= latLo && lat <= latHi && lng >= lngLo && lng <= lngHi);
  return trimmed.length >= 3 ? trimmed : points;
};



// Small monochrome (white, via stroke="#fff") lucide-style glyph per category id. Each icon is
// stored as an array of shape descriptors -- { tag: 'path', d } / { tag: 'rect', ... } /
// { tag: 'circle', ... } -- rather than just path "d" strings, since several of these icons (예:
// dices, hotel, shopping-cart) mix <rect>/<circle> primitives with <path>. One shared definition
// drives both a Leaflet divIcon HTML string (markers render outside React's tree, so those can't
// use a React icon component) AND a real React <PlaceCategoryMarkerIcon> element (used inline in
// the place list, see PlacesView) without keeping two copies in sync by hand. Every built-in
// category id (including 기타/etc) has its own pictogram now; a custom category id an admin adds
// beyond these falls back to the 기타 icon rather than guessing at one.
const PLACE_CATEGORY_MARKER_SHAPES = {
  // Soup (lucide "soup") -- 식당/restaurant
  restaurant: [
    { tag: 'path', d: 'M12 21a9 9 0 0 0 9-9H3a9 9 0 0 0 9 9Z' },
    { tag: 'path', d: 'M7 21h10' },
    { tag: 'path', d: 'M19.5 12 22 6' },
    { tag: 'path', d: 'M16.25 3c.27.1.8.53.75 1.36-.06.83-.93 1.2-1 2.02-.05.78.34 1.24.73 1.62' },
    { tag: 'path', d: 'M11.25 3c.27.1.8.53.74 1.36-.05.83-.93 1.2-.98 2.02-.06.78.33 1.24.72 1.62' },
    { tag: 'path', d: 'M6.25 3c.27.1.8.53.75 1.36-.06.83-.93 1.2-1 2.02-.05.78.34 1.24.74 1.62' }
  ],
  cafe: [
    { tag: 'path', d: 'M4 8h12v6a4 4 0 0 1 -4 4h-4a4 4 0 0 1 -4 -4v-6z' },
    { tag: 'path', d: 'M16 9h2a2 2 0 0 1 0 4h-2' },
    { tag: 'path', d: 'M8 2c-.6 1 .6 1.5 0 2.5' },
    { tag: 'path', d: 'M12 2c-.6 1 .6 1.5 0 2.5' }
  ],
  // Dices (lucide "dices") -- 놀이/play
  play: [
    { tag: 'rect', width: '12', height: '12', x: '2', y: '10', rx: '2', ry: '2' },
    { tag: 'path', d: 'm17.92 14 3.5-3.5a2.24 2.24 0 0 0 0-3l-5-4.92a2.24 2.24 0 0 0-3 0L10 6' },
    { tag: 'path', d: 'M6 18h.01' },
    { tag: 'path', d: 'M10 14h.01' },
    { tag: 'path', d: 'M15 6h.01' },
    { tag: 'path', d: 'M18 9h.01' }
  ],
  // Hotel (lucide "hotel") -- 숙박/lodging
  lodging: [
    { tag: 'path', d: 'M10 22v-6.57' },
    { tag: 'path', d: 'M12 11h.01' },
    { tag: 'path', d: 'M12 7h.01' },
    { tag: 'path', d: 'M14 15.43V22' },
    { tag: 'path', d: 'M15 16a5 5 0 0 0-6 0' },
    { tag: 'path', d: 'M16 11h.01' },
    { tag: 'path', d: 'M16 7h.01' },
    { tag: 'path', d: 'M8 11h.01' },
    { tag: 'path', d: 'M8 7h.01' },
    { tag: 'rect', x: '4', y: '2', width: '16', height: '20', rx: '2' }
  ],
  // ShoppingCart (lucide "shopping-cart") -- 쇼핑/shopping
  shopping: [
    { tag: 'circle', cx: '8', cy: '21', r: '1' },
    { tag: 'circle', cx: '19', cy: '21', r: '1' },
    { tag: 'path', d: 'M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12' }
  ],
  // MessageCircleMore (lucide "message-circle-more") -- 기타/etc, and the fallback for any
  // custom category id that doesn't match one of the above.
  etc: [
    { tag: 'path', d: 'M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719' },
    { tag: 'path', d: 'M8 12h.01' },
    { tag: 'path', d: 'M12 12h.01' },
    { tag: 'path', d: 'M16 12h.01' }
  ]
};
// Returns { shapes: [...] } for the marker's inner content -- an unrecognized/custom category id
// falls back to the 기타 pictogram rather than a plain emoji.
function getPlaceCategoryMarkerContent(category) {
  const id = String(category?.id || '').toLowerCase();
  return { shapes: PLACE_CATEGORY_MARKER_SHAPES[id] || PLACE_CATEGORY_MARKER_SHAPES.etc };
}
function placeMarkerShapeToHtml(shape) {
  if (shape.tag === 'rect') return `<rect x="${shape.x}" y="${shape.y}" width="${shape.width}" height="${shape.height}"${shape.rx ? ` rx="${shape.rx}"` : ''}${shape.ry ? ` ry="${shape.ry}"` : ''} />`;
  if (shape.tag === 'circle') return `<circle cx="${shape.cx}" cy="${shape.cy}" r="${shape.r}" />`;
  return `<path d="${shape.d}" />`;
}
// Marker circle/icon dimensions, shared by buildPlaceMarkerHtml and every L.divIcon iconSize
// below them so the two never drift out of sync with each other.
const PLACE_MARKER_SIZE = 34;
const PLACE_MARKER_ICON_SIZE = 18;
// Shared by both a normal individual marker AND a cluster badge that's collapsed down to a
// single child (see iconCreateFunction below) -- a cluster with only one marker left inside it
// should look identical to that marker on its own, not like a numbered cluster.
function buildPlaceMarkerHtml(category, visitStatus = 'visited') {
  const color = category ? category.color : '#64748B';
  const content = getPlaceCategoryMarkerContent(category);
  const isPlanned = visitStatus === 'planned';
  const bgColor = isPlanned ? '#FFFFFF' : color;
  const strokeColor = isPlanned ? color : '#fff';
  const borderColor = isPlanned ? color : '#fff';
  const innerHtml = `<svg xmlns="http://www.w3.org/2000/svg" width="${PLACE_MARKER_ICON_SIZE}" height="${PLACE_MARKER_ICON_SIZE}" viewBox="0 0 24 24" fill="none" stroke="${strokeColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${content.shapes.map(placeMarkerShapeToHtml).join('')}</svg>`;
  return `<div style="width:${PLACE_MARKER_SIZE}px;height:${PLACE_MARKER_SIZE}px;border-radius:50%;background:${bgColor};border:2px solid ${borderColor};box-shadow:0 1px 3px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;box-sizing:border-box;">${innerHtml}</div>`;
}
// React version of the same badge -- a small solid-color circle with the category's white line
// icon inside, matching the map marker exactly. Used in the place list (PlacesView) so its
// category badge looks like a miniature of the actual pin instead of a plain emoji.


// Renders an interactive Leaflet/OSM map with one pin per registered place, auto-fit to bounds
// so every pin stays visible. Popup content is built via DOM nodes (not HTML string
// interpolation) since place name/address/memo are free-text user input -- only the marker's
// divIcon HTML interpolates category.color (hex-validated by normalizeColorValue) and its icon
// (a fixed emoji from a controlled lookup table), never raw user text, so that stays safe as a
// string template.

// After opening a Leaflet popup, pan so the full popup+marker stays inside the map pane.
// Previous panBy([0, -h]) pushed the pin toward the bottom edge on desktop, clipping tall
// visit-history popups under the map grip / category tabs.
function panMapToFitMarkerPopup(map, marker, opts) {
  if (!map || !marker) return;
  const pad = (opts && opts.pad) || 16;
  const tryPan = () => {
    if (!map) return;
    const popup = marker.getPopup && marker.getPopup();
    const el = popup && popup.getElement && popup.getElement();
    if (!el) return;
    const mapRect = map.getContainer().getBoundingClientRect();
    const popupRect = el.getBoundingClientRect();
    let dx = 0;
    let dy = 0;
    if (popupRect.top < mapRect.top + pad) {
      dy = popupRect.top - (mapRect.top + pad);
    } else if (popupRect.bottom > mapRect.bottom - pad) {
      dy = popupRect.bottom - (mapRect.bottom - pad);
    }
    if (popupRect.left < mapRect.left + pad) {
      dx = popupRect.left - (mapRect.left + pad);
    } else if (popupRect.right > mapRect.right - pad) {
      dx = popupRect.right - (mapRect.right - pad);
    }
    if (dx !== 0 || dy !== 0) {
      map.panBy([dx, dy], { animate: opts && opts.animate !== false });
    }
  };
  requestAnimationFrame(() => requestAnimationFrame(tryPan));
  setTimeout(tryPan, 120);
  setTimeout(tryPan, 320);
}

function PlaceMapView(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.PlaceMapView;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function PlacesView(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.PlacesView;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}


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

function PlaceRegisterModal(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.PlaceRegisterModal;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}


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
    resolveMeetingPhotoDisplay: typeof resolveMeetingPhotoDisplay === 'function' ? resolveMeetingPhotoDisplay : null,
    MemoView: typeof MemoView === 'function' ? MemoView : null,
    ChatRoomView: typeof ChatRoomView === 'function' ? ChatRoomView : null,
    getPinnedNotices: typeof getPinnedNotices === 'function' ? getPinnedNotices : null,
    getChatLastReadTimestamp: typeof getChatLastReadTimestamp === 'function' ? getChatLastReadTimestamp : null,
    setChatLastReadTimestamp: typeof setChatLastReadTimestamp === 'function' ? setChatLastReadTimestamp : null,
    useTapRevealedMsgId: typeof useTapRevealedMsgId === 'function' ? useTapRevealedMsgId : null,
    useChatSendGuard: typeof useChatSendGuard === 'function' ? useChatSendGuard : null,
    useModalDirtyGuard: typeof useModalDirtyGuard === 'function' ? useModalDirtyGuard : null,
    appendChatImageFiles: typeof appendChatImageFiles === 'function' ? appendChatImageFiles : null,
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
    DeleteConfirmModal: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.DeleteConfirmModal) || (typeof DeleteConfirmModal === 'function' ? DeleteConfirmModal : null),
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
    ShareIcon: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.ShareIcon) || (typeof ShareIcon === 'function' ? ShareIcon : null),
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
    useScrollHideHeader: typeof useScrollHideHeader === 'function' ? useScrollHideHeader : null,
    PlaceMapView: typeof PlaceMapView === 'function' ? PlaceMapView : null,
    PlacesView: typeof PlacesView === 'function' ? PlacesView : null,
    PlaceRegisterModal: typeof PlaceRegisterModal === 'function' ? PlaceRegisterModal : null,
    AutoGrowTextarea: typeof AutoGrowTextarea === 'function' ? AutoGrowTextarea : null,
    FormAddEditActionButtons: typeof FormAddEditActionButtons === 'function' ? FormAddEditActionButtons : null,
    PlaceSectionIcon: typeof PlaceSectionIcon === 'function' ? PlaceSectionIcon : null,
    SegmentedToggle: typeof SegmentedToggle === 'function' ? SegmentedToggle : null,
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
    extractKnownParticipantNames: typeof extractKnownParticipantNames === 'function' ? extractKnownParticipantNames : null,
    getPlaceExternalMapUrl: typeof getPlaceExternalMapUrl === 'function' ? getPlaceExternalMapUrl : null,
    loadLeaflet: typeof loadLeaflet === 'function' ? loadLeaflet : null,
    loadLeafletMarkerCluster: typeof loadLeafletMarkerCluster === 'function' ? loadLeafletMarkerCluster : null,
    buildPlaceMarkerHtml: typeof buildPlaceMarkerHtml === 'function' ? buildPlaceMarkerHtml : null,
    panMapToFitMarkerPopup: typeof panMapToFitMarkerPopup === 'function' ? panMapToFitMarkerPopup : null,
    PLACE_MAP_DEFAULT_CENTER: typeof PLACE_MAP_DEFAULT_CENTER !== 'undefined' ? PLACE_MAP_DEFAULT_CENTER : null,
    PLACE_MAP_DEFAULT_ZOOM: typeof PLACE_MAP_DEFAULT_ZOOM !== 'undefined' ? PLACE_MAP_DEFAULT_ZOOM : null,
    GalleryIcon: typeof GalleryIcon === 'function' ? GalleryIcon : null,
    Lightbox: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.Lightbox) || (typeof Lightbox === 'function' ? Lightbox : null),
    SectionCountBadge: typeof SectionCountBadge === 'function' ? SectionCountBadge : null,
    SectionToggleButton: typeof SectionToggleButton === 'function' ? SectionToggleButton : null,
    SearchCategoryTabs: typeof SearchCategoryTabs === 'function' ? SearchCategoryTabs : null,
    SimpleBottomSheetPicker: typeof SimpleBottomSheetPicker === 'function' ? SimpleBottomSheetPicker : null,
    PhotoGallery: typeof PhotoGallery === 'function' ? PhotoGallery : null,
    SummaryList: typeof SummaryList === 'function' ? SummaryList : null,
    getActiveAvailabilities: typeof getActiveAvailabilities === 'function' ? getActiveAvailabilities : null,
    getCalendarPolls: typeof getCalendarPolls === 'function' ? getCalendarPolls : null,
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
    fetchActivityLogsFromFirestore: typeof fetchActivityLogsFromFirestore === 'function' ? fetchActivityLogsFromFirestore : null,
    fetchChatMessagesRest: typeof fetchChatMessagesRest === 'function' ? fetchChatMessagesRest : null,
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
    mergeCalendarCollections: typeof mergeCalendarCollections === 'function' ? mergeCalendarCollections : null,
    mergePollRecord: typeof mergePollRecord === 'function' ? mergePollRecord : null,
    normalizeCalendarForSave: typeof normalizeCalendarForSave === 'function' ? normalizeCalendarForSave : null,
    normalizePollOptionInput: typeof normalizePollOptionInput === 'function' ? normalizePollOptionInput : null,
    processImageFilesSequentially: typeof processImageFilesSequentially === 'function' ? processImageFilesSequentially : null,
    pushSingleCloudCalendar: typeof pushSingleCloudCalendar === 'function' ? pushSingleCloudCalendar : null,
    readClipboardImageFiles: typeof readClipboardImageFiles === 'function' ? readClipboardImageFiles : null,
    resolveMemoImageBatch: typeof resolveMemoImageBatch === 'function' ? resolveMemoImageBatch : null,
    sanitizeMemoForFirestore: typeof sanitizeMemoForFirestore === 'function' ? sanitizeMemoForFirestore : null,
    setAdminSession: typeof setAdminSession === 'function' ? setAdminSession : null,
    sha256Hex: typeof sha256Hex === 'function' ? sha256Hex : null,
    subscribeUserToPushWithPermission: typeof subscribeUserToPushWithPermission === 'function' ? subscribeUserToPushWithPermission : null,
    ensurePushSubscriptionHealthy: typeof ensurePushSubscriptionHealthy === 'function' ? ensurePushSubscriptionHealthy : null,
    translateKoreanToEnglish: typeof translateKoreanToEnglish === 'function' ? translateKoreanToEnglish : null,
    unsubscribeUserFromPush: typeof unsubscribeUserFromPush === 'function' ? unsubscribeUserFromPush : null,
    validateBackupCalendars: typeof validateBackupCalendars === 'function' ? validateBackupCalendars : null,
    validateCalendarShape: typeof validateCalendarShape === 'function' ? validateCalendarShape : null,
    ADMIN_MESSAGE_LIVE_LIMIT: typeof ADMIN_MESSAGE_LIVE_LIMIT !== 'undefined' ? ADMIN_MESSAGE_LIVE_LIMIT : 50,
    ADMIN_MEMO_LIVE_LIMIT: typeof ADMIN_MEMO_LIVE_LIMIT !== 'undefined' ? ADMIN_MEMO_LIVE_LIMIT : 50,
    FOOTER_FAMILY_LINKS: typeof FOOTER_FAMILY_LINKS !== 'undefined' ? FOOTER_FAMILY_LINKS : []
  });
}
bindGatherUiDeps();


function __gatherStartApp() {
try {
  const rootElement = document.getElementById('root');
  if (rootElement) {
    const root = ReactDOM.createRoot(rootElement);
    const imageShareId = new URLSearchParams(window.location.search).get('image');
    root.render(/*#__PURE__*/React.createElement(React.Fragment, null,
      imageShareId
        ? /*#__PURE__*/React.createElement(ImageShareViewer, { shareId: imageShareId })
        : /*#__PURE__*/React.createElement(App, null),
      /*#__PURE__*/React.createElement(UpdateAvailableBanner, null)
    ));
  }
} catch (e) {
  console.error('App render error:', e);
}

}

window.__gatherStartApp = __gatherStartApp;
if (window.__GATHER_BOOT_READY__) {
  __gatherStartApp();
}
