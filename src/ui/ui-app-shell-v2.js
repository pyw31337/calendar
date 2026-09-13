/**
 * WP-01 renewal app shell (feature-flagged, `?shell=v2`).
 *
 * Implements the 5-destination IA from docs/product-renewal-master-plan.md §4.1:
 * 캘린더 / 대화 / 기록 / 정산 / 더보기 -- a mobile bottom nav, and the SAME five destinations
 * as a desktop side rail (§4.1: "데스크톱은 동일한 목적지를 좌측 또는 상단 내비게이션으로
 * 표현하되 정보 구조는 모바일과 동일하게 유지한다"). 기록 replaces the old separate
 * 메모/갤러리/장소 menu entries -- those become tabs inside 기록, not top-level destinations
 * (docs/renewal-baseline.md §5 gap note).
 *
 * This is the WP-01 slice only: the nav shell and its routing/tab state. Real data (calendar
 * grid, chat messages, memo/gallery/place records, settlement) is wired screen-by-screen in
 * WP-03 through WP-07 -- each tab below renders a placeholder pane, not live content, so this
 * can ship with zero risk to the default (flag-off) experience while later work fills it in.
 */

import { isRenewalShellEnabled } from '../core/app-feature-flags.js';
import { bindUiComponentAliases } from '../core/app-ui-wrappers.js';
import {
  isNotificationSupported, isChatNotifyEnabledForCalendar, setChatNotifyEnabledForCalendar,
  getNotificationPermissionHelpSteps, setNotifGuideSeen, setNotifyChannel, syncPushSubscriptionChannels,
  formatDDayLabel, formatConfirmedMeetingLabel, getMessageDirectMediaEntry, getMessageImageEntries,
  normalizePlaceDateForSort,
} from '../core/app-domain-helpers.js';
import { buildMainCalendarScreenState } from '../core/app-calendar-screen-state.js';

const TABS = [
  { id: 'calendar', label: '캘린더' },
  { id: 'chat', label: '대화' },
  { id: 'records', label: '기록' },
  { id: 'settlement', label: '정산' },
  { id: 'more', label: '더보기' },
];
const TAB_IDS = TABS.map(t => t.id);
const DEFAULT_TAB = 'calendar';

/**
 * 기록 sub-tabs (docs/design-renewal-handoff.md §2's mapping table): the 5 screens 기록 absorbs
 * -- 메모/갤러리(사진·영상)/장소/보관함(추억)/콘텐츠 -- plus 전체 as the default landing filter.
 * Still placeholder content only; real data wiring is WP-06.
 */
const RECORDS_SUBTABS = [
  { id: 'all', label: '전체' },
  { id: 'memo', label: '메모' },
  { id: 'media', label: '사진·영상' },
  { id: 'places', label: '장소' },
  { id: 'archive', label: '보관함' },
  { id: 'content', label: '콘텐츠' },
];
const RECORDS_SUBTAB_IDS = RECORDS_SUBTABS.map(t => t.id);
const DEFAULT_RECORDS_SUBTAB = 'all';

/** Reads `?tab=` from the current URL, falling back to 캘린더 for a missing/unknown value. */
function readTabFromLocation() {
  if (typeof window === 'undefined' || !window.location) return DEFAULT_TAB;
  try {
    const raw = new URLSearchParams(window.location.search).get('tab');
    return TAB_IDS.includes(raw) ? raw : DEFAULT_TAB;
  } catch (_) {
    return DEFAULT_TAB;
  }
}

/** Reads `?sub=` -- only meaningful on the 기록 tab, ignored (and later stripped) elsewhere. */
function readRecordsSubTabFromLocation() {
  if (typeof window === 'undefined' || !window.location) return DEFAULT_RECORDS_SUBTAB;
  try {
    const raw = new URLSearchParams(window.location.search).get('sub');
    return RECORDS_SUBTAB_IDS.includes(raw) ? raw : DEFAULT_RECORDS_SUBTAB;
  } catch (_) {
    return DEFAULT_RECORDS_SUBTAB;
  }
}

/**
 * Writes the tab (and, for 기록, its sub-tab) into the URL without touching any other query
 * param (`?id=`, `?shell=v2`, ...) or reloading the page. `push` adds a history entry (a
 * deliberate tab switch, so the back button steps back through tabs one at a time -- 마스터플랜
 * §4.1's "브라우저 뒤로가기는 탭 내부 상세 → 탭 루트 → 이전 브라우저 위치 순"); `replace` (used
 * for the very first mount, and to correct an invalid `?tab=`/`?sub=`) does not. `?sub=` is
 * dropped whenever the tab isn't 기록, so it never lingers into an unrelated tab's URL.
 */
function writeLocationState(tabId, subTabId, { push } = { push: true }) {
  if (typeof window === 'undefined' || !window.history) return;
  const url = new URL(window.location.href);
  if (tabId === DEFAULT_TAB) url.searchParams.delete('tab');
  else url.searchParams.set('tab', tabId);
  if (tabId !== 'records' || subTabId === DEFAULT_RECORDS_SUBTAB) url.searchParams.delete('sub');
  else url.searchParams.set('sub', subTabId);
  const method = push ? 'pushState' : 'replaceState';
  window.history[method](window.history.state, '', url);
}

const TAB_ICONS = {
  calendar: 'M3 10h18M8 2v4M16 2v4M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z',
  chat: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z',
  records: 'M4 19.5A2.5 2.5 0 0 1 6.5 17H20V2H6.5A2.5 2.5 0 0 0 4 4.5v15Z',
  settlement: 'M2 6h20v12H2zM2 10h20',
  more: 'M4 7h16M4 12h16M4 17h16',
};

function TabIcon({ id }) {
  const React = window.React;
  return React.createElement(
    'svg', { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' },
    React.createElement('path', { d: TAB_ICONS[id] || '' })
  );
}

/**
 * Top header bar -- brand/캘린더명 + 검색 + 더보기, matching the Claude Design 목업 (Mobile320
 * artboard)'s hero-zone brand row. Unlike that mockup, there is no separate 메뉴/hamburger icon
 * here: 더보기 is now one of the 5 tabs (§4.1), so a second, redundant menu affordance in the
 * header would just recreate the duplicate-entry-point problem the master plan calls out
 * (docs/renewal-baseline.md §5). 검색 stays a header action since 검색 has no tab of its own
 * (§4.1: "더보기 탭에 검색, 공유, 기념일, 설정, 도움말을 정리한다" -- it lives inside 더보기,
 * but WP-01 §5.1 also keeps a direct header shortcut: "모바일 헤더에는 브랜드/캘린더명, 검색,
 * 더보기만 둔다"). Shared across all 5 tabs, sitting above wherever each tab's own summary badge
 * (예: 캘린더 tab의 D-day 요약, WP-03) will render.
 */
function TopHeader({ calendarName, onOpenSearch, onOpenMore }) {
  const React = window.React;
  return React.createElement('div', { className: 'renewal-shell-header' },
    React.createElement('div', { className: 'renewal-shell-header-brand' },
      React.createElement('svg', { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' },
        React.createElement('rect', { x: 3, y: 4, width: 18, height: 18, rx: 2 }),
        React.createElement('path', { d: 'M8 2v4M16 2v4M3 10h18' })
      ),
      React.createElement('span', null, calendarName || '모여라 캘린더')
    ),
    React.createElement('div', { className: 'renewal-shell-header-actions' },
      React.createElement('button', { type: 'button', className: 'renewal-shell-header-icon-btn', 'aria-label': '검색', onClick: onOpenSearch },
        React.createElement('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' },
          React.createElement('circle', { cx: 11, cy: 11, r: 8 }),
          React.createElement('path', { d: 'm21 21-4.3-4.3' })
        )
      ),
      React.createElement('button', { type: 'button', className: 'renewal-shell-header-icon-btn', 'aria-label': '더보기', onClick: onOpenMore },
        React.createElement(TabIcon, { id: 'more' })
      )
    )
  );
}

/**
 * Builds the 캘린더 tab's real ingredients from CalendarApp's own state/helpers (WP-03). Every
 * value here is a straight pass-through of an already-existing, already-tested CalendarApp
 * function/value -- CalendarGrid and DateModal are self-contained (no onOpenChatMessage/
 * onOpenImage-style navigation dependency the way AdminModal/GlobalSearchModal are), so unlike
 * those two this can be wired for real in this slice.
 *
 * @param {object|null} calendar - unused for the grid/date-modal `calendar` prop itself (see
 *   `activeCal` below) -- kept as a parameter only for signature symmetry with
 *   `buildRenewalMoreContext`.
 * @param {object} deps - activeCal, anniversariesWithPosters, isInitialDataLoading,
 *   handleMoveAvailability, displayChatMessages, memos, customCultureItems,
 *   handleSaveAvailability, handleDeleteAvailability, handleReorderAvailability,
 *   handleDeleteAllForDate, handleConfirmMeeting, handleSaveExpense, handleDeleteExpense,
 *   handleReorderExpenses, handleAddMeetingPhotos, handleDeletePhoto, handleDeleteMeetingPhoto,
 *   findChatMessageById, handleFetchDateTaggedMessages, handleFetchDateTaggedMemos,
 *   handleFetchMeetingPhotoIndex, handleFetchMeetingAlbum, loadOlderChatMessages,
 *   hasMoreOlderChat, loadingOlderChat, fullChatMessages, handleSavePlace, handleDeletePlace,
 *   handleReorderPlaces, showToast, showConfirmDialog, syncStatus, photoCommentCounts,
 *   setActiveLightbox, isPollModalOpen, setIsPollModalOpen, editingPoll, setEditingPoll,
 *   voteTarget, setVoteTarget, handleOpenPollCreate, handleOpenPollEdit, handleSavePoll,
 *   handleOpenVoteSheet, handleVotePoll, handleCancelVote.
 */
export function buildRenewalCalendarContext(calendar, deps) {
  const {
    // CalendarGrid/DateModal need CalendarApp's OWN `activeCal` -- never null, always at least
    // `{ places: [...], confirmedMeeting: ... }` even before Firestore data loads, since it's
    // built by spreading `rawActiveCal` (`{...null}` is `{}` in JS). The `calendar` prop this
    // shell otherwise passes around (`activeCalLoaded ? activeCal : null`) is deliberately
    // nullable so the 더보기 tab can toast "not loaded yet" -- but CalendarGrid has no such guard
    // and reads straight into `calendar.availabilities`, so passing it the nullable one crashes
    // (caught via Playwright: "Cannot read properties of null (reading 'availabilities')").
    activeCal,
    anniversariesWithPosters, isInitialDataLoading, handleMoveAvailability,
    displayChatMessages, memos, customCultureItems,
    handleSaveAvailability, handleDeleteAvailability, handleReorderAvailability, handleDeleteAllForDate,
    handleConfirmMeeting, handleSaveExpense, handleDeleteExpense, handleReorderExpenses,
    handleAddMeetingPhotos, handleDeletePhoto, handleDeleteMeetingPhoto, findChatMessageById,
    handleFetchDateTaggedMessages, handleFetchDateTaggedMemos, handleFetchMeetingPhotoIndex,
    handleFetchMeetingAlbum, loadOlderChatMessages, hasMoreOlderChat, loadingOlderChat, fullChatMessages,
    handleSavePlace, handleDeletePlace, handleReorderPlaces,
    showToast, showConfirmDialog, syncStatus, photoCommentCounts, setActiveLightbox,
    isPollModalOpen, setIsPollModalOpen, editingPoll, setEditingPoll, voteTarget, setVoteTarget,
    handleOpenPollCreate, handleOpenPollEdit, handleSavePoll, handleOpenVoteSheet, handleVotePoll, handleCancelVote,
  } = deps || {};
  // 홈 요약 "가까운 일정"/"응답 필요" (master-plan.md §4.2, §5.3): reuses the SAME pure selector
  // app-main.js's own main screen calls (buildMainCalendarScreenState) instead of recomputing the
  // "which confirmed meetings are upcoming"/"are there open polls" rules ourselves -- calendarId
  // is omitted since the only fields used here (visibleConfirmedMeetings, hasVisiblePolls) don't
  // depend on it (it only affects the chat/memo/gallery badge fields this tab doesn't need).
  const { visibleConfirmedMeetings, hasVisiblePolls } = buildMainCalendarScreenState({ calendar: activeCal });
  return {
    calendar: activeCal,
    anniversaries: anniversariesWithPosters,
    isLoading: !!isInitialDataLoading,
    handleMoveAvailability,
    // 마스터플랜 §4.2: "가까운 일정 1~3개".
    upcomingMeetings: visibleConfirmedMeetings.slice(0, 3),
    hasVisiblePolls,
    pollsProps: {
      calendar: activeCal,
      onCreatePoll: handleOpenPollCreate,
      onEditPoll: handleOpenPollEdit,
      onVotePoll: handleOpenVoteSheet,
      onCancelVote: handleCancelVote,
      onRequestConfirm: showConfirmDialog,
    },
    isPollModalOpen: !!isPollModalOpen,
    pollModalProps: {
      calendar: activeCal,
      poll: editingPoll,
      onRequestConfirm: showConfirmDialog,
      onSave: handleSavePoll,
      onClose: () => { setIsPollModalOpen(false); setEditingPoll(null); },
      showToast,
    },
    voteTarget,
    onSelectVote: (participantId) => handleVotePoll(voteTarget?.pollId, voteTarget?.optionId, participantId),
    onCloseVoteSheet: () => setVoteTarget(null),
    dateModalProps: {
      calendar: activeCal, chatMessages: displayChatMessages, memos, customCultureItems,
      onSave: handleSaveAvailability, onDelete: handleDeleteAvailability,
      onReorderAvailability: handleReorderAvailability, onDeleteDate: handleDeleteAllForDate,
      onConfirmMeeting: handleConfirmMeeting, onSaveExpense: handleSaveExpense,
      onDeleteExpense: handleDeleteExpense, onReorderExpenses: handleReorderExpenses,
      onAddMeetingPhotos: handleAddMeetingPhotos, onDeletePhoto: handleDeletePhoto,
      onDeleteMeetingPhoto: handleDeleteMeetingPhoto, onFindChatMessageById: findChatMessageById,
      onFetchDateTaggedMessages: handleFetchDateTaggedMessages, onFetchDateTaggedMemos: handleFetchDateTaggedMemos,
      onFetchMeetingPhotoIndex: handleFetchMeetingPhotoIndex, onFetchMeetingAlbum: handleFetchMeetingAlbum,
      onLoadOlderChat: loadOlderChatMessages,
      hasMoreOlderChat: !Array.isArray(fullChatMessages) && !!hasMoreOlderChat,
      loadingOlderChat, setActiveLightbox,
      onSavePlace: handleSavePlace, onDeletePlace: handleDeletePlace, onReorderPlaces: handleReorderPlaces,
      showToast, onRequestConfirm: showConfirmDialog, syncStatus, photoCommentCounts,
    },
  };
}

/**
 * "가까운 일정" home summary (master-plan.md §4.2/§5.3): up to 3 upcoming confirmed meetings,
 * date + D-day + a short label, matching the fields actually present on a confirmedMeeting entry
 * (date/note -- there is no separate 제목/장소 field on this record, so 제목 falls back to a
 * generic label and 장소 is omitted rather than guessed). Clicking one opens that date in the
 * same DateModal the grid uses (via `onSelectDate`, owned by the parent CalendarPane).
 */
function UpcomingMeetingsSection({ meetings, onSelectDate }) {
  const React = window.React;
  if (!meetings || meetings.length === 0) return null;
  return React.createElement('div', { className: 'renewal-shell-section' },
    React.createElement('div', { className: 'renewal-shell-section-title' }, '가까운 일정'),
    React.createElement('div', { className: 'renewal-shell-upcoming-list' },
      meetings.map(meeting => React.createElement('button', {
        key: meeting.date,
        type: 'button',
        className: 'renewal-shell-upcoming-item',
        onClick: () => onSelectDate(meeting.date),
      },
        React.createElement('span', { className: 'renewal-shell-upcoming-dday' }, formatDDayLabel(meeting.date)),
        React.createElement('span', { className: 'renewal-shell-upcoming-label' }, formatConfirmedMeetingLabel(meeting.date)),
        meeting.note && meeting.note.trim() && React.createElement('span', { className: 'renewal-shell-upcoming-note' }, meeting.note.trim())
      ))
    )
  );
}

/**
 * "응답 필요" home summary (master-plan.md §4.2/§5.3): "활성 투표가 없으면 큰 빈 카드를 표시하지
 * 않는다" -- so this section renders nothing unless `hasVisiblePolls` is true. Embeds the real,
 * already-tested `PollList`/`PollModal`/`PollVoterSheet` trio pass-through (same components/props
 * app-main.js's own main screen renders) rather than reimplementing vote/response tracking --
 * there's no separate poll screen in the 5-tab IA, so this summary section doubles as the poll
 * feature's one home, matching "홈 요약 카드는 목적 화면으로 이동하는 진입점" for a feature that
 * has no other destination.
 */
function PollsSection({ calendarContext }) {
  const React = window.React;
  const { PollList, PollModal, PollVoterSheet } = bindUiComponentAliases(React);
  if (!calendarContext.hasVisiblePolls) return null;
  return React.createElement('div', { className: 'renewal-shell-section' },
    React.createElement('div', { className: 'renewal-shell-section-title' }, '응답 필요'),
    React.createElement(PollList, calendarContext.pollsProps),
    calendarContext.isPollModalOpen && React.createElement(PollModal, calendarContext.pollModalProps),
    calendarContext.voteTarget && React.createElement(PollVoterSheet, {
      calendar: calendarContext.calendar,
      pollId: calendarContext.voteTarget.pollId,
      optionId: calendarContext.voteTarget.optionId,
      onSelect: calendarContext.onSelectVote,
      onClose: calendarContext.onCloseVoteSheet,
    })
  );
}

/**
 * 캘린더 tab body (WP-03): the real month grid, using the SAME `window.GATHER_UI_COMPONENTS`
 * pass-through aliases the other real modals use (`bindUiComponentAliases`) -- `CalendarGrid` is
 * not a lazy-loaded chunk (it ships in the main bundle, same as app-main.js's own usage), so no
 * wait-then-open step is needed here the way share/manual/anniversaries needed. Order below
 * matches master-plan.md §4.2's 캘린더 홈 표시 순서 (월간 캘린더 -> 가까운 일정 -> 내가 응답할 일
 * -> 최근 소식); 최근 소식 is deferred (see docs/wp01-app-shell-progress.md's WP-03 note -- no
 * existing data model maps to it, unlike the other two which reuse `buildMainCalendarScreenState`
 * untouched).
 *
 * The date detail modal itself now lives at `RenewalAppShell` level (`onOpenDate` opens it) --
 * WP-05's 정산 탭 also needs to open the exact same modal from its own date list, so a single
 * shared instance beats each tab owning (and duplicating) its own. Month navigation is still
 * local state here, same reasoning as `openMoreModal`: CalendarApp's own `currentMonthDate` drives
 * JSX this shell's early return never reaches, so reusing it would silently no-op.
 */
function CalendarPane({ calendarContext, onOpenDate }) {
  const React = window.React;
  const { CalendarGrid } = bindUiComponentAliases(React);
  const [monthDate, setMonthDate] = React.useState(() => new Date());
  const onParticipantClick = (name, dateStr) => { if (dateStr) onOpenDate(dateStr); };
  return React.createElement(React.Fragment, null,
    React.createElement(CalendarGrid, {
      anniversaries: calendarContext.anniversaries,
      calendar: calendarContext.calendar,
      isLoading: calendarContext.isLoading,
      monthDate,
      onPrevMonth: () => setMonthDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1)),
      onNextMonth: () => setMonthDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1)),
      onToday: () => setMonthDate(new Date()),
      onJumpToMonth: (y, m) => setMonthDate(new Date(y, m, 1)),
      onSelectDate: onOpenDate,
      onMoveAvailability: calendarContext.handleMoveAvailability,
      onParticipantClick,
    }),
    React.createElement(UpcomingMeetingsSection, { meetings: calendarContext.upcomingMeetings, onSelectDate: onOpenDate }),
    React.createElement(PollsSection, { calendarContext })
  );
}

/**
 * Shared date detail modal (WP-05): lives at `RenewalAppShell` level so 캘린더 and 정산 both open
 * the exact same instance instead of each tab duplicating it (WP-03 originally nested this inside
 * `CalendarPane` alone; lifted out once 정산 needed the same "click a date, see its detail" flow).
 */
function SharedDateModal({ calendarContext, dateModalDate, onClose, onSelectDate, onEditAnniversary, onAddAnniversaryForDate, onFocusCultureSource }) {
  const React = window.React;
  const { DateModal } = bindUiComponentAliases(React);
  return React.createElement(DateModal, {
    ...calendarContext.dateModalProps,
    dateStr: dateModalDate,
    initialTab: null,
    onClose,
    onParticipantClick: (name, dateStr) => { if (dateStr) onSelectDate(dateStr); },
    onEditAnniversary,
    onAddAnniversaryForDate: (d) => { onClose(); onAddAnniversaryForDate(d); },
    // 컨텐츠 원본 포커스는 아직 실제 컨텐츠 화면(WP-06)이 없어 기록 탭 콘텐츠 서브탭으로만
    // 이동시킨다 -- localStorage 포커스 힌트는 그 화면이 실제로 연결될 때 함께 넣는다.
    onFocusCultureSource: () => onFocusCultureSource(),
  });
}

/**
 * Builds the 대화 tab's real ingredients (WP-03 continuation): straight pass-through of the SAME
 * ~35 CalendarApp state values/handlers that already drive the original `activeView === 'chat'`
 * render block (app-main.js) -- composer state, media/attachment state, jump/ordinal helpers,
 * sticky-video activation, etc. `onBack`/`onOpenGallery`/`onChangeView`/`onOpenAppSettings` are
 * NOT built here -- those need shell tab-navigation (setActiveTab/setRecordsSubTab), which only
 * `RenewalAppShell` owns, so `ChatPane` composes them from the `onChangeView`/`onOpenAppSettings`
 * props it receives instead.
 *
 * Deliberately deferred: the cross-tab "sticky video keeps floating after you leave 대화"
 * behavior (`withStickyVideo` in app-main.js) isn't wrapped around this shell -- `stickyVideoKey`/
 * `onActivateVideo` still make a tapped video actually play inline in the chat feed (that's a
 * pure pass-through of existing state), but it won't keep floating as a mini-player after
 * switching tabs. That's a nice-to-have on top of a working 대화 tab, not required for one.
 */
export function buildRenewalChatContext(calendar, deps) {
  const {
    activeCal, memePool, handleSendMemeImage, displayChatMessages, loadingOlderChat, hasMoreOlderChat, loadOlderChatMessages,
    chatInput, setChatInput, chatParticipantId, setChatParticipantId, isChatSheetOpen, setIsChatSheetOpen, isChatSubmitting,
    chatTextareaRef, chatImages, setChatImages, chatFileAttachments, setChatFileAttachments, chatReplyTarget, setChatReplyTarget,
    setActiveLightbox, handleSendChatMessage, handleDeleteMessage, handleEditMessage, handleAddPinnedNotice, handleRemovePinnedNotice,
    isHeaderVisible, setIsHeaderVisible, handleChatScroll, toggleChatInputPin, chatMessagesContainerRef, showToast,
    handlePromoteInlineChatImage, handleSaveImageTags, handleSearchTag, isDarkTheme, toggleTheme,
    fontScalePercent, setFontScalePercent, mainNotifPermission, mainChatNotifyEnabled, handleMainToggleNotifications,
    stickyVideo, handleActivateChatVideo, handleJumpToChatMessage, handleJumpToMemo, handleJumpToMeetingDate,
    handleGetChatMessageOrdinal, handleGetGalleryPhotoOrdinal, showConfirmDialog, syncStatus, externalFocusMsgId,
    isChatShareOpen, setIsChatShareOpen,
  } = deps || {};
  return {
    calendar: activeCal,
    showToast,
    isChatShareOpen: !!isChatShareOpen,
    onOpenChatShare: () => setIsChatShareOpen(true),
    onCloseChatShare: () => setIsChatShareOpen(false),
    chatRoomProps: {
      calendar: activeCal, memePool, onSendMemeImage: handleSendMemeImage,
      chatMessages: displayChatMessages, loadingOlderChat, hasMoreOlderChat, onLoadOlderChat: loadOlderChatMessages,
      chatInput, setChatInput, chatParticipantId, setChatParticipantId, isChatSheetOpen, setIsChatSheetOpen, isChatSubmitting,
      chatTextareaRef, chatImage: chatImages, setChatImage: setChatImages, chatFileAttachments, setChatFileAttachments,
      chatReplyTarget, setChatReplyTarget,
      activeLightbox: null, // rendered via a shared Lightbox host elsewhere once WP-05 needs it; not required for a working chat tab
      setActiveLightbox,
      onSend: handleSendChatMessage, onDeleteMessage: handleDeleteMessage, onEditMessage: handleEditMessage,
      onAddPinnedNotice: handleAddPinnedNotice, onRemovePinnedNotice: handleRemovePinnedNotice,
      isHeaderVisible, handleChatScroll, onRevealChatInput: () => setIsHeaderVisible(true), onToggleChatInputPin: toggleChatInputPin,
      chatMessagesContainerRef, showToast, onPromoteImageUrl: handlePromoteInlineChatImage, onSaveImageTags: handleSaveImageTags,
      onSearchTag: handleSearchTag, isDarkTheme, onToggleTheme: toggleTheme, fontScalePercent,
      onDecreaseFont: () => setFontScalePercent(prev => Math.max(80, prev - 10)),
      onIncreaseFont: () => setFontScalePercent(prev => Math.min(130, prev + 10)),
      isChatNotifyEnabled: mainNotifPermission === 'granted' && mainChatNotifyEnabled,
      onToggleChatNotifications: handleMainToggleNotifications,
      stickyVideoKey: stickyVideo ? stickyVideo.key : null, onActivateVideo: handleActivateChatVideo,
      onJumpToChatMessage: handleJumpToChatMessage, onJumpToMemo: handleJumpToMemo, onJumpToMeetingDate: handleJumpToMeetingDate,
      onGetChatMessageOrdinal: handleGetChatMessageOrdinal, onGetGalleryPhotoOrdinal: handleGetGalleryPhotoOrdinal,
      onRequestConfirm: showConfirmDialog, syncStatus, externalFocusMessageId: externalFocusMsgId,
    },
  };
}

/**
 * 대화 tab body (WP-03 continuation): the real `ChatRoomView`, same pass-through approach as
 * `CalendarPane`. Unlike `CalendarGrid`/`DateModal`, `ChatRoomView` ships in its OWN lazy-loaded
 * chunk (`window.__gatherLoadChatUi`, the exact trigger CalendarApp's own `changeView('chat')`
 * uses) rather than the main bundle, so this needs the same "wait for the chunk, then render"
 * step the 더보기 tab's share/manual/anniversaries entries needed (`buildRenewalMoreContext`).
 */
function ChatPane({ chatContext, onChangeView, onOpenAppSettings }) {
  const React = window.React;
  const [loaded, setLoaded] = React.useState(() => !!(window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.ChatRoomView));
  React.useEffect(() => {
    if (loaded) return undefined;
    if (typeof window.__gatherLoadChatUi !== 'function') { setLoaded(true); return undefined; }
    let cancelled = false;
    window.__gatherLoadChatUi().then(() => { if (!cancelled) setLoaded(true); }).catch(err => {
      console.error('Chat UI load failed:', err);
      if (typeof chatContext.showToast === 'function') chatContext.showToast('채팅 화면을 불러오지 못했습니다. 다시 시도해 주세요.', 'error');
    });
    return () => { cancelled = true; };
  }, [loaded]);
  if (!loaded) {
    return React.createElement(EmptyState, { title: '채팅 불러오는 중', subtitle: '잠시만 기다려 주세요.' });
  }
  const { ChatRoomView, ShareModal } = bindUiComponentAliases(React);
  return React.createElement(React.Fragment, null,
    React.createElement(ChatRoomView, {
      ...chatContext.chatRoomProps,
      onBack: () => onChangeView('calendar'),
      onOpenGallery: () => onChangeView('gallery'),
      onChangeView,
      onShare: chatContext.onOpenChatShare,
      onOpenAppSettings,
    }),
    chatContext.isChatShareOpen && React.createElement(ShareModal, {
      calendar: chatContext.calendar, shareType: 'chat', showToast: chatContext.showToast,
      onClose: chatContext.onCloseChatShare,
    })
  );
}

/**
 * Builds the 정산 tab's real ingredients (WP-05 continuation). Straight pass-through of the same
 * handlers `app-main.js`'s own `activeView === 'settlement'` render block already uses. Mirrors
 * that call site's one deliberate quirk exactly: `onOpenCreateSettlement` is left unset, so
 * `SettlementSummaryModal` falls back to its OWN internal create-settlement state/modal (it does
 * this natively -- see its `handleOpenCreateSettlement`) rather than routing through CalendarApp's
 * `isCreateSettlementOpen`, which the original render also never wires here. Only the EDIT flow
 * (`onOpenSettlementEditor`) routes externally, matching the original.
 */
export function buildRenewalSettlementContext(calendar, deps) {
  const {
    activeCal, canUseSettlement, showToast, showConfirmDialog,
    handleToggleSettlementCardStatus, handleDeleteSettlementCard, handleSaveSettlementCard,
    editingSettlementCard, setEditingSettlementCard, isShareOpen, setIsShareOpen,
  } = deps || {};
  const requireLoadedCalendar = (message) => {
    if (activeCal) return true;
    if (typeof showToast === 'function') showToast(message, 'error');
    return false;
  };
  return {
    calendar: activeCal,
    showToast,
    onRequestConfirm: showConfirmDialog,
    summaryProps: {
      calendar: activeCal,
      onToggleSettlementCardStatus: handleToggleSettlementCardStatus,
      onDeleteSettlementCard: handleDeleteSettlementCard,
      onSaveSettlementCard: handleSaveSettlementCard,
      onOpenSettlementEditor: (card) => setEditingSettlementCard(card ? { ...card } : null),
      showToast, onRequestConfirm: showConfirmDialog,
    },
    isShareOpen: !!isShareOpen,
    onOpenShare: () => { if (requireLoadedCalendar('Firebase 데이터를 불러온 뒤 공유 정보를 확인해 주세요.')) setIsShareOpen(true); },
    onCloseShare: () => setIsShareOpen(false),
    editingSettlementCard,
    onCloseSettlementEditor: () => setEditingSettlementCard(null),
    onDeleteSettlementCard: handleDeleteSettlementCard,
    onToggleSettlementCardStatus: handleToggleSettlementCardStatus,
    onSaveSettlementCard: handleSaveSettlementCard,
    canUseSettlement: !!canUseSettlement,
  };
}

/**
 * 정산 tab body (WP-05 continuation): the real `SettlementSummaryModal`, same pass-through
 * approach as `ChatPane`. `SettlementSummaryModal`/`CreateSettlementModal` ship in the same
 * lazy-loaded chunk as `PollModal`/`AnniversaryModal` (`window.__gatherLoadEventUi`), so this
 * needs the same "wait for the chunk" step.
 */
function SettlementPane({ settlementContext, onChangeView, onOpenAppSettings, onOpenDate }) {
  const React = window.React;
  const [loaded, setLoaded] = React.useState(() => !!(window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.SettlementSummaryModal));
  React.useEffect(() => {
    if (loaded) return undefined;
    if (typeof window.__gatherLoadEventUi !== 'function') { setLoaded(true); return undefined; }
    let cancelled = false;
    window.__gatherLoadEventUi().then(() => { if (!cancelled) setLoaded(true); }).catch(err => {
      console.error('Settlement UI load failed:', err);
      if (typeof settlementContext.showToast === 'function') settlementContext.showToast('정산 화면을 불러오지 못했습니다. 다시 시도해 주세요.', 'error');
    });
    return () => { cancelled = true; };
  }, [loaded]);
  if (!loaded) {
    return React.createElement(EmptyState, { title: '정산 화면 불러오는 중', subtitle: '잠시만 기다려 주세요.' });
  }
  const { SettlementSummaryModal, ShareModal, CreateSettlementModal } = bindUiComponentAliases(React);
  return React.createElement(React.Fragment, null,
    React.createElement(SettlementSummaryModal, {
      ...settlementContext.summaryProps,
      onBack: () => onChangeView('calendar'),
      onSelectDate: onOpenDate,
      onOpenShare: settlementContext.onOpenShare,
      onOpenAppSettings,
      onChangeView,
    }),
    settlementContext.isShareOpen && React.createElement(ShareModal, {
      calendar: settlementContext.calendar, shareType: 'settlement', showToast: settlementContext.showToast,
      onClose: settlementContext.onCloseShare,
    }),
    settlementContext.editingSettlementCard && React.createElement(CreateSettlementModal, {
      calendar: settlementContext.calendar,
      initialData: settlementContext.editingSettlementCard,
      showToast: settlementContext.showToast,
      onClose: settlementContext.onCloseSettlementEditor,
      onDeleteCard: settlementContext.onDeleteSettlementCard,
      onToggleStatus: settlementContext.onToggleSettlementCardStatus,
      onSave: settlementContext.onSaveSettlementCard,
      onRequestConfirm: settlementContext.onRequestConfirm,
    })
  );
}

/**
 * Shared "not built yet" state (WP-02's EmptyState, product-renewal-master-plan.md §9: "공통
 * 상태의 문구와 버튼 구조가 모든 기능에서 재사용 가능하다"), scoped to this shell for now --
 * every renewal-shell screen that has no real data yet (PlaceholderPane, RecordsPane's per-subtab
 * body) renders through this ONE component instead of repeating the same 3-line markup, so a
 * future visual pass (or wiring a "관리자에게 문의" button, etc.) only needs to change one place.
 * `icon` is optional (RecordsPane's sub-tab filters have no per-filter icon of their own).
 */
function EmptyState({ icon, title, subtitle }) {
  const React = window.React;
  return React.createElement('div', { className: 'renewal-shell-placeholder' },
    icon && React.createElement('div', { className: 'renewal-shell-placeholder-icon' }, icon),
    React.createElement('div', { className: 'renewal-shell-placeholder-title' }, title),
    React.createElement('div', { className: 'renewal-shell-placeholder-sub' }, subtitle)
  );
}

/** Builds EmptyState's subtitle: "<캘린더명> · <설명>" once a calendar is loaded, else just <설명>. */
function withCalendarPrefix(calendarName, text) {
  return calendarName ? `${calendarName} · ${text}` : text;
}

function PlaceholderPane({ tabId, calendarName }) {
  const React = window.React;
  const label = TABS.find(t => t.id === tabId)?.label || tabId;
  return React.createElement(EmptyState, {
    icon: React.createElement(TabIcon, { id: tabId }),
    title: `${label} (준비 중)`,
    subtitle: withCalendarPrefix(calendarName, 'WP-03~07에서 실제 데이터가 이 자리에 연결됩니다.'),
  });
}

/**
 * 기록 tab body: a sub-tab chip row (전체/메모/사진·영상/장소/보관함/콘텐츠) over the same
 * EmptyState, keyed by sub-tab so switching filters visibly changes something even before WP-06
 * wires real data in. This is the one tab with a second level of navigation because it alone
 * absorbs 5 old screens (docs/design-renewal-handoff.md §2) -- the other 4 tabs stay flat.
 */
/**
 * Builds the 기록 tab's real ingredients (WP-06 continuation, 콘텐츠 + 장소 + 메모 subtabs).
 * Straight pass-through of the same values/handlers `app-main.js`'s own `activeView === 'content'`
 * / `activeView === 'places'` / `activeView === 'memo'` render blocks already use. `ContentView`
 * ships in the same eager main-bundle chunk as `HistoryView`/`PlacesView` (all three live in
 * src/ui/ui-summary-gallery.js, always imported at boot), so -- unlike `MediaPane`/`ChatPane` --
 * no "wait for chunk" step is needed for it. `onLoadMoreMemos` is composed in `app-main.js`'s own
 * adapter call (it needs `MEMOS_PAGE_SIZE`, a module-level constant only in scope there) and
 * handed through already-built.
 */
export function buildRenewalRecordsContext(calendar, deps) {
  const {
    activeCal, anniversaries, memos, handleRegisterCultureEvent, handleUnregisterCultureEvent,
    handleQuickSaveCultureMemo, customCultureItems, handleSaveCustomCultureItem, showToast,
    showConfirmDialog, handleSavePlace, handleDeletePlace,
    placesInitialQuery, setPlacesInitialQuery, placesInitialFocusId, setPlacesInitialFocusId,
    isDarkTheme, toggleTheme, fontScalePercent, setFontScalePercent,
    mainNotifPermission, mainChatNotifyEnabled, handleMainToggleNotifications,
    syncStatus, isPlacesShareOpen, setIsPlacesShareOpen,
    hasMoreMemos, totalMemoCount, onLoadMoreMemos, sharedMemo, setSharedMemo,
    chatMessages, setActiveLightbox,
    patchLocalMemo, upsertLocalMemo, removeLocalMemo, memoInitialTag, setMemoInitialTag,
    isMemoShareOpen, setIsMemoShareOpen,
  } = deps || {};
  const requireLoadedCalendar = (message) => {
    if (activeCal) return true;
    if (typeof showToast === 'function') showToast(message, 'error');
    return false;
  };
  return {
    calendar: activeCal,
    showToast,
    contentProps: {
      calendar: activeCal, anniversaries, memos,
      onRegisterCultureEvent: handleRegisterCultureEvent,
      onUnregisterCultureEvent: handleUnregisterCultureEvent,
      onQuickSaveMemo: handleQuickSaveCultureMemo,
      customCultureItems, onSaveCustomCultureItem: handleSaveCustomCultureItem,
      showToast,
    },
    placesProps: {
      calendar: activeCal,
      onSavePlace: handleSavePlace, onDeletePlace: handleDeletePlace,
      showToast, onRequestConfirm: showConfirmDialog,
      placesInitialQuery, setPlacesInitialQuery, placesInitialFocusId, setPlacesInitialFocusId,
      isDarkTheme, onToggleTheme: toggleTheme, fontScalePercent,
      onDecreaseFont: () => setFontScalePercent(prev => Math.max(80, prev - 10)),
      onIncreaseFont: () => setFontScalePercent(prev => Math.min(130, prev + 10)),
      isChatNotifyEnabled: mainNotifPermission === 'granted' && mainChatNotifyEnabled,
      onToggleChatNotifications: handleMainToggleNotifications,
      syncStatus,
    },
    isPlacesShareOpen: !!isPlacesShareOpen,
    onOpenPlacesShare: () => { if (requireLoadedCalendar('Firebase 데이터를 불러온 뒤 공유 정보를 확인해 주세요.')) setIsPlacesShareOpen(true); },
    onClosePlacesShare: () => setIsPlacesShareOpen(false),
    memoProps: {
      calendar: activeCal, memos, hasMoreMemos, totalMemoCount, onLoadMoreMemos,
      showToast, isDarkTheme, onRequestConfirm: showConfirmDialog,
      sharedMemo, chatMessages, setActiveLightbox,
      onDismissSharedMemo: () => {
        if (typeof setSharedMemo === 'function') setSharedMemo(null);
        const url = new URL(window.location.href);
        url.searchParams.delete('memo');
        window.history.replaceState({}, '', url);
      },
      onUpdateMemo: patchLocalMemo, onUpsertMemo: upsertLocalMemo, onDeleteMemo: removeLocalMemo,
      memoInitialTag, setMemoInitialTag,
    },
    isMemoShareOpen: !!isMemoShareOpen,
    onOpenMemoShare: () => { if (requireLoadedCalendar('Firebase 데이터를 불러온 뒤 공유 정보를 확인해 주세요.')) setIsMemoShareOpen(true); },
    onCloseMemoShare: () => setIsMemoShareOpen(false),
  };
}

/**
 * 콘텐츠 subtab body (WP-06 continuation): the real `ContentView`, same pass-through approach as
 * `HistoryPane`/`PlacesPane` -- no lazy-load wait needed (see doc comment above).
 */
function ContentPane({ recordsContext, onChangeView, onOpenAppSettings }) {
  const React = window.React;
  const { ContentView } = bindUiComponentAliases(React);
  return React.createElement(ContentView, {
    ...recordsContext.contentProps,
    onBack: () => onChangeView('calendar'),
    onOpenAppSettings,
  });
}

/**
 * 장소 subtab body (WP-06 continuation): the real `PlacesView`, same pass-through approach as
 * `MemoPane` (WP-06's first subtab). `PlacesView` ships in its own lazy-loaded chunk
 * (`window.__gatherLoadViewUi('places')`), so this waits for that chunk before rendering.
 *
 * Owns its own local date-detail-modal state (`placeDateModalDate`) rather than sharing 캘린더's
 * -- unlike WP-07's 정산 tab (which lifted a shared instance up to `RenewalAppShell`), this slice
 * keeps 장소 fully self-contained so it doesn't need to land in lockstep with that unmerged work;
 * a later cleanup can fold this into the shared instance once both are on `main` together. Reuses
 * `calendarContext.dateModalProps` (already built at `RenewalAppShell` level) for the modal's
 * data/handlers, since those don't depend on which component owns the "which date is open" state.
 */
function PlacesPane({ recordsContext, calendarContext, onChangeView, onOpenAppSettings, onEditAnniversary, onAddAnniversaryForDate, onFocusCultureSource }) {
  const React = window.React;
  const [loaded, setLoaded] = React.useState(() => !!(window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.PlacesView));
  React.useEffect(() => {
    if (loaded) return undefined;
    if (typeof window.__gatherLoadViewUi !== 'function') { setLoaded(true); return undefined; }
    let cancelled = false;
    window.__gatherLoadViewUi('places').then(() => { if (!cancelled) setLoaded(true); }).catch(err => {
      console.error('Places UI load failed:', err);
      if (typeof recordsContext.showToast === 'function') recordsContext.showToast('장소 화면을 불러오지 못했습니다. 다시 시도해 주세요.', 'error');
    });
    return () => { cancelled = true; };
  }, [loaded]);
  const [placeDateModalDate, setPlaceDateModalDate] = React.useState(null);
  if (!loaded) {
    return React.createElement(EmptyState, { title: '장소 불러오는 중', subtitle: '잠시만 기다려 주세요.' });
  }
  const { PlacesView, ShareModal, DateModal } = bindUiComponentAliases(React);
  const onParticipantClick = (name, dateStr) => { if (dateStr) setPlaceDateModalDate(dateStr); };
  return React.createElement(React.Fragment, null,
    React.createElement(PlacesView, {
      ...recordsContext.placesProps,
      onBack: () => onChangeView('calendar'),
      onSelectDate: (dateStr) => {
        const canonicalDate = normalizePlaceDateForSort(dateStr);
        if (canonicalDate) setPlaceDateModalDate(canonicalDate);
      },
      onSharePlaces: recordsContext.onOpenPlacesShare,
      onOpenAppSettings,
    }),
    recordsContext.isPlacesShareOpen && React.createElement(ShareModal, {
      calendar: recordsContext.calendar, shareType: 'places', showToast: recordsContext.showToast,
      onClose: recordsContext.onClosePlacesShare,
    }),
    placeDateModalDate && React.createElement(DateModal, {
      ...calendarContext.dateModalProps,
      dateStr: placeDateModalDate,
      initialTab: null,
      onClose: () => setPlaceDateModalDate(null),
      onParticipantClick,
      onEditAnniversary,
      onAddAnniversaryForDate: (d) => { setPlaceDateModalDate(null); onAddAnniversaryForDate(d); },
      onFocusCultureSource: () => onFocusCultureSource(),
    })
  );
}

/**
 * 메모 subtab body (WP-06 continuation): the real `MemoView`, same pass-through approach as
 * `ChatPane`/`SettlementPane`. `MemoView` ships in its own lazy-loaded chunk
 * (`window.__gatherLoadViewUi('memo')`), so this waits for that chunk before rendering.
 */
function MemoPane({ recordsContext, onChangeView, onOpenAppSettings }) {
  const React = window.React;
  const [loaded, setLoaded] = React.useState(() => !!(window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.MemoView));
  React.useEffect(() => {
    if (loaded) return undefined;
    if (typeof window.__gatherLoadViewUi !== 'function') { setLoaded(true); return undefined; }
    let cancelled = false;
    window.__gatherLoadViewUi('memo').then(() => { if (!cancelled) setLoaded(true); }).catch(err => {
      console.error('Memo UI load failed:', err);
      if (typeof recordsContext.showToast === 'function') recordsContext.showToast('메모 화면을 불러오지 못했습니다. 다시 시도해 주세요.', 'error');
    });
    return () => { cancelled = true; };
  }, [loaded]);
  if (!loaded) {
    return React.createElement(EmptyState, { title: '메모 불러오는 중', subtitle: '잠시만 기다려 주세요.' });
  }
  const { MemoView, ShareModal } = bindUiComponentAliases(React);
  return React.createElement(React.Fragment, null,
    React.createElement(MemoView, {
      ...recordsContext.memoProps,
      onBack: () => onChangeView('calendar'),
      onOpenShare: recordsContext.onOpenMemoShare,
      onOpenAppSettings,
    }),
    recordsContext.isMemoShareOpen && React.createElement(ShareModal, {
      calendar: recordsContext.calendar, shareType: 'memo', showToast: recordsContext.showToast,
      onClose: recordsContext.onCloseMemoShare,
    })
  );
}

function RecordsPane({ subTab, onSelectSubTab, calendarName, recordsContext, calendarContext, onChangeView, onOpenAppSettings, onEditAnniversary, onAddAnniversaryForDate, onFocusCultureSource }) {
  const React = window.React;
  return React.createElement(React.Fragment, null,
    React.createElement('div', { className: 'renewal-shell-subtab-row', role: 'tablist', 'aria-label': '기록 필터' },
      RECORDS_SUBTABS.map(t => React.createElement('button', {
        key: t.id,
        type: 'button',
        role: 'tab',
        'aria-selected': subTab === t.id,
        className: `renewal-shell-subtab-item ${subTab === t.id ? 'is-active' : ''}`.trim(),
        onClick: () => onSelectSubTab(t.id),
      }, t.label))
    ),
    subTab === 'content'
      ? React.createElement(ContentPane, { recordsContext, onChangeView, onOpenAppSettings })
      : subTab === 'places'
      ? React.createElement(PlacesPane, { recordsContext, calendarContext, onChangeView, onOpenAppSettings, onEditAnniversary, onAddAnniversaryForDate, onFocusCultureSource })
      : subTab === 'memo'
      ? React.createElement(MemoPane, { recordsContext, onChangeView, onOpenAppSettings })
      : React.createElement(EmptyState, {
        title: `${RECORDS_SUBTABS.find(t => t.id === subTab)?.label || subTab} (준비 중)`,
        subtitle: withCalendarPrefix(calendarName, 'WP-06에서 실제 데이터가 이 자리에 연결됩니다.'),
      })
  );
}

/**
 * 더보기 tab items (docs/design-renewal-handoff.md §2's mapping table row for 더보기, itself
 * from product-renewal-master-plan.md §5.10): the 7 destinations 더보기 absorbs. Each is a
 * placeholder action for now -- real screens/dialogs land WP-08+ as each is actually wired
 * (this slice only proves the menu list itself, matching the 기록 sub-tab slice's scope).
 */
const MORE_ITEMS = [
  { id: 'search', label: '검색' },
  { id: 'share', label: '공유' },
  { id: 'anniversaries', label: '기념일 설정' },
  { id: 'calendar-settings', label: '캘린더 설정' },
  { id: 'app-settings', label: '앱 설정' },
  { id: 'manual', label: '사용자 매뉴얼' },
  { id: 'admin', label: '관리자 진입' },
];

const MORE_ITEM_ICONS = {
  search: 'M15.5 15.5 21 21M17 10.5A6.5 6.5 0 1 1 4 10.5a6.5 6.5 0 0 1 13 0Z',
  share: 'M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7M16 6l-4-4-4 4M12 2v14',
  anniversaries: 'M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2ZM8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01',
  'calendar-settings': 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8ZM19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9c.13.36.35.68.63.94.28.26.62.44 1 .5H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z',
  'app-settings': 'M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6',
  manual: 'M4 19.5A2.5 2.5 0 0 1 6.5 17H20V2H6.5A2.5 2.5 0 0 0 4 4.5v15ZM8 7h8M8 11h8',
  admin: 'M12 2 3 6v6c0 5 3.8 8.7 9 10 5.2-1.3 9-5 9-10V6l-9-4Z',
};

function MoreItemIcon({ id }) {
  const React = window.React;
  return React.createElement(
    'svg', { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' },
    React.createElement('path', { d: MORE_ITEM_ICONS[id] || '' })
  );
}

/**
 * Which 더보기 items open a real modal in THIS shell (rendered by `MoreModalsHost` below) vs.
 * still just toggle the placeholder selection state. 캘린더 설정 (AdminModal) and 검색
 * (GlobalSearchModal) are deliberately left out of this slice: both need onOpenChatMessage/
 * onOpenImage-style props that navigate to a chat message location via `changeView('chat')` --
 * that sets CalendarApp's `activeView` state, which drives the SAME old JSX tree this shell's
 * early return never reaches, so it would silently no-op exactly like the isShareOpen bug the
 * previous slice found (docs/wp01-app-shell-progress.md 5th slice). 앱 설정 (AppSettingsModal)
 * has no such navigation dependency -- every one of its props is a self-contained toggle (theme,
 * font size, notification permission, weather location), so it's wired for real here using the
 * exact same handlers/utilities CalendarApp's own old menu uses (no reimplementation).
 */
const REAL_MORE_MODAL_IDS = ['share', 'anniversaries', 'manual', 'app-settings', 'search'];

/**
 * Builds the 더보기 list's real destinations from CalendarApp's own state/helpers, passed in as
 * `deps` from the single adapter call site in app-main.js (CalendarApp is frozen at 7700 lines,
 * so this logic has to live here, not inline at that call site, or it would need many new
 * physical lines inside CalendarApp). Unlike the old MainSideMenu handlers this ports from, these
 * do NOT touch CalendarApp's own isShareOpen/isAnniversariesOpen/isGuideOpen state -- that state
 * drives a JSX tree this shell's early return never reaches, so reusing it would silently no-op.
 * Instead each `onSelect*` here is a side-effect-only trigger (a lazy-load wait, an anniversaries
 * refetch) that RenewalAppShell awaits before flipping its OWN local `openMoreModal` state; the
 * `calendar` argument is the same prop `renderRenewalShellIfEnabled` already receives, not
 * re-fetched.
 *
 * @param {object|null} calendar - activeCalLoaded ? activeCal : null, same value passed to
 *   `renderRenewalShellIfEnabled`'s 2nd argument.
 * @param {object} deps - showToast, activeCalId, anniversaries, fetchAnniversariesRest,
 *   setAnniversaries, showConfirmDialog, handleBulkRegisterAvailability, handleAnniversarySaved,
 *   handleAnniversaryDeleted, isDarkTheme, toggleTheme, fontScalePercent, setFontScalePercent,
 *   mainNotifPermission, setMainNotifPermission, mainChatNotifyEnabled, setMainChatNotifyEnabled,
 *   notifyChannels, setNotifyChannelsState, handleMainToggleNotifications,
 *   handleUpdateWeatherLocation, handleDeleteRecentWeatherLocation, getCurrentChatParticipantId,
 *   setCloudReloadToken, setActiveLightbox.
 */
export function buildRenewalMoreContext(calendar, deps) {
  const {
    showToast, activeCalId, anniversaries, fetchAnniversariesRest, setAnniversaries,
    showConfirmDialog, handleBulkRegisterAvailability, handleAnniversarySaved, handleAnniversaryDeleted,
    isDarkTheme, setActiveLightbox,
    toggleTheme, fontScalePercent, setFontScalePercent,
    mainNotifPermission, setMainNotifPermission, mainChatNotifyEnabled, setMainChatNotifyEnabled,
    notifyChannels, setNotifyChannelsState, handleMainToggleNotifications,
    handleUpdateWeatherLocation, handleDeleteRecentWeatherLocation, getCurrentChatParticipantId,
    setCloudReloadToken,
    chatMessages, memos, globalSearchInitialQuery, focusChatMessage, openNotificationHelp,
  } = deps || {};
  const requireLoadedCalendar = (message) => {
    if (calendar) return true;
    if (typeof showToast === 'function') showToast(message, 'error');
    return false;
  };
  return {
    modalProps: {
      share: { calendar, showToast },
      anniversaries: {
        calendar, anniversaries, initialEditId: null, initialDate: null,
        onInitialEditConsumed: () => {}, showToast, onRequestConfirm: showConfirmDialog,
        onBulkRegister: handleBulkRegisterAvailability, onAnniversarySaved: handleAnniversarySaved,
        onAnniversaryDeleted: handleAnniversaryDeleted, isDarkTheme, setActiveLightbox,
      },
      manual: { calendar },
      // Every prop here is a straight port of app-main.js's own isAppSettingsOpen &&
      // <AppSettingsModal ...> call site: same handlers, same utility functions
      // (isNotificationSupported/isChatNotifyEnabledForCalendar/etc., imported above from the
      // same shared app-domain-helpers.js CalendarApp itself imports them from), not
      // reimplemented -- this is why 앱 설정 is safe to wire for real (see REAL_MORE_MODAL_IDS
      // doc comment above) while 캘린더 설정/검색 are not.
      'app-settings': {
        isDarkTheme, onToggleTheme: toggleTheme, fontScalePercent,
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
        notifyChannels,
        onToggleNotifyChannel: async (key) => {
          if (typeof setNotifyChannel !== 'function') return;
          const next = setNotifyChannel(key, !(notifyChannels && notifyChannels[key]));
          setNotifyChannelsState(next);
          if (key === 'chat' && typeof setChatNotifyEnabledForCalendar === 'function') {
            setChatNotifyEnabledForCalendar(activeCalId, !!(next && next.chat));
            setMainChatNotifyEnabled(!!(next && next.chat));
          }
          try {
            await syncPushSubscriptionChannels(activeCalId, getCurrentChatParticipantId ? getCurrentChatParticipantId() : undefined);
          } catch (_) {}
        },
        calendarId: activeCalId,
        weatherLocation: calendar && calendar.weatherLocation,
        recentLocations: (calendar && calendar.recentLocations) || [],
        onUpdateWeatherLocation: handleUpdateWeatherLocation,
        onDeleteRecentLocation: handleDeleteRecentWeatherLocation,
        showToast,
        helpSteps: typeof getNotificationPermissionHelpSteps === 'function' ? getNotificationPermissionHelpSteps() : [],
        calendar,
        onRequestConfirm: showConfirmDialog,
        onRequestDataRefresh: () => { if (typeof setCloudReloadToken === 'function') setCloudReloadToken(token => token + 1); },
      },
      // GlobalSearchModal ships in the main bundle (ui-calendar-core.js, eagerly imported at
      // boot -- same reason CalendarGrid/PollList needed no lazy-load wait), so unlike
      // anniversaries/manual there's no chunk to wait for here. onOpenMemo/onSelectDate/
      // onOpenChatMessage/onOpenImage are NOT built here -- those need shell tab navigation
      // (RenewalAppShell's onChangeView) plus a shared/local date-modal instance, which only
      // RenewalAppShell has, so it composes and merges those in before rendering (see
      // `MoreModalsHost`'s `searchExtra` prop).
      search: {
        calendar, chatMessages, memos, initialQuery: globalSearchInitialQuery,
        onNotificationPermissionBlocked: openNotificationHelp,
      },
    },
    // Raw ingredients for the onOpenChatMessage/onOpenImage navigators RenewalAppShell composes
    // for 검색 (and, later, 캘린더 설정) -- both need to switch to the 대화 tab (a shell concept
    // this context builder has no access to) before focusing a message or opening its image, so
    // the actual composition happens in RenewalAppShell, not here.
    chatMessages, setActiveLightbox, focusChatMessage,
    // Each resolves (or rejects) once it's safe to show the modal; RenewalAppShell opens it on
    // resolve and swallows a rejection (the lazy-load failure already showed its own toast).
    onSelectShare: () => requireLoadedCalendar('Firebase 데이터를 불러온 뒤 공유 정보를 확인해 주세요.')
      ? Promise.resolve() : Promise.reject(),
    onSelectAnniversaries: () => {
      if (!requireLoadedCalendar('Firebase 데이터를 불러온 뒤 기념일 설정을 수정해 주세요.')) return Promise.reject();
      if (activeCalId && typeof fetchAnniversariesRest === 'function' && typeof setAnniversaries === 'function') {
        fetchAnniversariesRest(activeCalId).then(list => {
          if (Array.isArray(list) && list.length > 0) {
            setAnniversaries(list.slice().sort((a, b) =>
              (Number(b.createdAt) || Number(b.updatedAt) || 0) - (Number(a.createdAt) || Number(a.updatedAt) || 0)
            ));
          }
        }).catch(() => {});
      }
      // AnniversaryModal ships in the same code-split chunk as PollModal/SettlementSummaryModal
      // (ui-event-modals.js) -- loaded on demand via window.__gatherLoadEventUi (src/main.jsx),
      // same lazy trigger CalendarApp's own withEventUi helper uses.
      if (typeof window.__gatherLoadEventUi !== 'function') return Promise.resolve();
      return window.__gatherLoadEventUi().catch(err => {
        console.error('Anniversary UI load failed:', err);
        if (typeof showToast === 'function') showToast('기념일 설정을 불러오지 못했습니다. 다시 시도해 주세요.', 'error');
        throw err;
      });
    },
    onSelectManual: () => {
      if (typeof window.__gatherLoadManualUi !== 'function') return Promise.resolve();
      return window.__gatherLoadManualUi().catch(err => {
        console.error('User manual UI load failed:', err);
        if (typeof showToast === 'function') showToast('사용자 매뉴얼을 불러오지 못했습니다. 다시 시도해 주세요.', 'error');
        throw err;
      });
    },
    // AppSettingsModal is already in the main bundle (no lazy chunk to wait for, matching the
    // original isAppSettingsOpen call site) and has no loaded-calendar guard either.
    onSelectAppSettings: () => Promise.resolve(),
    // GlobalSearchModal is also already in the main bundle (see modalProps.search's comment) and
    // has no loaded-calendar guard in the original either.
    onSelectSearch: () => Promise.resolve(),
    onOpenAdmin: () => {
      const adminUrl = new URL(window.location.href);
      adminUrl.searchParams.delete('view');
      adminUrl.searchParams.delete('msg');
      adminUrl.searchParams.delete('img');
      adminUrl.searchParams.delete('memo');
      adminUrl.searchParams.delete('place');
      adminUrl.searchParams.set('admin', '1');
      if (activeCalId) adminUrl.searchParams.set('id', activeCalId);
      window.open(adminUrl.toString(), '_blank', 'noopener,noreferrer');
    },
  };
}

/**
 * Renders whichever of the 5 real 더보기 modals (share/anniversaries/manual/app-settings/search,
 * see REAL_MORE_MODAL_IDS above) is currently open, using the SAME `window.GATHER_UI_COMPONENTS`
 * pass-through aliases app-main.js itself uses (`bindUiComponentAliases`) -- so this reuses the
 * exact lazy-loaded chunk/component app-main.js already has, no separate copy bundled here.
 * `searchExtra` carries the tab-navigation callbacks (`onOpenMemo`/`onSelectDate`/
 * `onOpenChatMessage`/`onOpenImage`) `RenewalAppShell` composes for GlobalSearchModal -- see its
 * call site for why those can't be built inside `buildRenewalMoreContext`.
 */
function MoreModalsHost({ openModal, onClose, modalProps, anniversaryOverride, searchExtra }) {
  const React = window.React;
  if (!openModal) return null;
  const { ShareModal, AnniversaryModal, UserManualOverlay, AppSettingsModal, GlobalSearchModal } = bindUiComponentAliases(React);
  if (openModal === 'share') return React.createElement(ShareModal, { ...modalProps.share, onClose });
  if (openModal === 'anniversaries') return React.createElement(AnniversaryModal, { ...modalProps.anniversaries, ...anniversaryOverride, onClose });
  if (openModal === 'manual') return React.createElement(UserManualOverlay, { ...modalProps.manual, onClose });
  if (openModal === 'app-settings') return React.createElement(AppSettingsModal, { ...modalProps['app-settings'], onClose });
  if (openModal === 'search') return React.createElement(GlobalSearchModal, { ...modalProps.search, ...searchExtra, onClose });
  return null;
}

/**
 * The date-detail modal GlobalSearchModal's "이 날짜 보기" results open (WP-08) -- its own local
 * instance for the same reason `PlacesPane`'s is (see that component's doc comment): WP-07's
 * shared date-modal lift isn't merged yet, so this avoids an inter-PR ordering dependency. Reuses
 * `calendarContext.dateModalProps` for the actual data/handlers.
 */
function SearchDateModal({ calendarContext, dateStr, onClose, onEditAnniversary, onAddAnniversaryForDate, onFocusCultureSource }) {
  const React = window.React;
  const { DateModal } = bindUiComponentAliases(React);
  return React.createElement(DateModal, {
    ...calendarContext.dateModalProps,
    dateStr, initialTab: null, onClose,
    onParticipantClick: () => {},
    onEditAnniversary, onAddAnniversaryForDate,
    onFocusCultureSource: () => onFocusCultureSource(),
  });
}

/**
 * 더보기 tab body: a flat list of the 7 destinations it absorbs (docs/design-renewal-handoff.md
 * §2). 검색 also has a header shortcut (TopHeader's onOpenSearch), so choosing it here and there
 * both land on the same tab -- this list is the one place all 7 exist, header included or not.
 * `onSelectItem` (owned by RenewalAppShell) decides per-id whether that's a real destination
 * (share/anniversaries/manual/app-settings/admin) or still just a placeholder selection (search,
 * calendar-settings -- see REAL_MORE_MODAL_IDS above); this component stays presentation-only.
 */
function MorePane({ calendarName, onSelectItem, selectedItem }) {
  const React = window.React;
  return React.createElement('div', { className: 'renewal-shell-more' },
    React.createElement('ul', { className: 'renewal-shell-more-list', role: 'list' },
      MORE_ITEMS.map(item => React.createElement('li', { key: item.id },
        React.createElement('button', {
          type: 'button',
          className: `renewal-shell-more-item ${selectedItem === item.id ? 'is-active' : ''}`.trim(),
          onClick: () => onSelectItem(item.id),
        },
          React.createElement('span', { className: 'renewal-shell-more-item-icon' }, React.createElement(MoreItemIcon, { id: item.id })),
          React.createElement('span', { className: 'renewal-shell-more-item-label' }, item.label),
          React.createElement('svg', { className: 'renewal-shell-more-item-chevron', width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' },
            React.createElement('path', { d: 'm9 18 6-6-6-6' })
          )
        )
      ))
    ),
    React.createElement('div', { className: 'renewal-shell-placeholder-sub renewal-shell-more-note' },
      calendarName ? `${calendarName} · 검색/캘린더 설정은 아직 준비 중입니다.` : '검색/캘린더 설정은 아직 준비 중입니다.')
  );
}

/**
 * One-call adapter for CalendarApp's return statement (kept to a single call there deliberately
 * -- CalendarApp is frozen at a hard line-count ceiling, docs/app-main-split-units.md). Returns
 * the shell element when `?shell=v2` is set, otherwise null so the caller falls through to the
 * existing return unchanged.
 */
export function renderRenewalShellIfEnabled(activeCalId, calendar, moreContextDeps, calendarContextDeps, chatContextDeps, settlementContextDeps, recordsContextDeps) {
  const React = window.React;
  if (!isRenewalShellEnabled()) return null;
  return React.createElement(RenewalAppShell, {
    activeCalId, calendar,
    moreContext: buildRenewalMoreContext(calendar, moreContextDeps),
    calendarContext: buildRenewalCalendarContext(calendar, calendarContextDeps),
    chatContext: buildRenewalChatContext(calendar, chatContextDeps),
    settlementContext: buildRenewalSettlementContext(calendar, settlementContextDeps),
    recordsContext: buildRenewalRecordsContext(calendar, recordsContextDeps),
  });
}

/**
 * @param {{ activeCalId: string, calendar: object | null, moreContext: object, calendarContext: object, chatContext: object, settlementContext: object, recordsContext: object }} props
 *   `calendar` is the already-loaded record for activeCalId (or null while it loads) --
 *   passed in from CalendarApp's existing state as a plain prop (the adapter pattern from
 *   product-renewal-master-plan.md §8.2), never re-fetched here. `moreContext` (see
 *   `buildRenewalMoreContext`) is the 더보기 tab's real destinations; `calendarContext` (see
 *   `buildRenewalCalendarContext`) is the 캘린더 tab's; `chatContext` (see
 *   `buildRenewalChatContext`) is the 대화 tab's; `settlementContext` (see
 *   `buildRenewalSettlementContext`) is the 정산 tab's; `recordsContext` (see
 *   `buildRenewalRecordsContext`) is the 기록 탭's -- all built the same way.
 */
export function RenewalAppShell({ activeCalId, calendar, moreContext, calendarContext, chatContext, settlementContext, recordsContext }) {
  const React = window.React;
  const [activeTab, setActiveTabState] = React.useState(readTabFromLocation);
  const [recordsSubTab, setRecordsSubTabState] = React.useState(readRecordsSubTabFromLocation);
  const [selectedMoreItem, setSelectedMoreItem] = React.useState(null);
  // Which of the 4 real 더보기 modals (share/anniversaries/manual/app-settings) is open, if any -- local to
  // this shell (see buildRenewalMoreContext's doc comment for why this doesn't reuse
  // CalendarApp's own isShareOpen/isAnniversariesOpen/isGuideOpen state).
  const [openMoreModal, setOpenMoreModal] = React.useState(null);
  // Set only when DateModal's "+ 기념일 등록"/편집 opens the 기념일 설정 modal on top of (or after
  // closing) it, so that modal opens pre-filled the same way the old side-menu flow did.
  const [anniversaryOverride, setAnniversaryOverride] = React.useState(null);
  // Shared date detail modal (WP-05): both 캘린더 (grid/가까운 일정) and 정산 (date list) tabs open
  // the SAME DateModal instance from here instead of each owning its own -- CalendarApp's own
  // `selectedDate`/`isModalOpen` drive JSX this shell's early return never reaches, same reasoning
  // as `openMoreModal`.
  const [dateModalDate, setDateModalDate] = React.useState(null);
  const calendarName = calendar?.name || null;

  // Shared by the 더보기 list AND any other pane (e.g. ChatPane's "앱 설정" entry) that needs to
  // open one of the 4 real 더보기 modals directly, without going through the 더보기 tab's own list.
  const openMoreModalById = (id) => {
    const trigger = {
      share: moreContext.onSelectShare, anniversaries: moreContext.onSelectAnniversaries,
      manual: moreContext.onSelectManual, 'app-settings': moreContext.onSelectAppSettings,
      search: moreContext.onSelectSearch,
    }[id];
    if (!trigger) return;
    Promise.resolve(trigger()).then(() => setOpenMoreModal(id)).catch(() => {});
  };
  const handleSelectMoreItem = (id) => {
    setSelectedMoreItem(id);
    if (id === 'admin') { moreContext.onOpenAdmin(); return; }
    if (!REAL_MORE_MODAL_IDS.includes(id)) return; // search/calendar-settings: selection only for now
    if (id === 'anniversaries') setAnniversaryOverride(null); // opened from the 더보기 list itself, not a date's edit/add flow
    openMoreModalById(id);
  };

  // DateModal's "기념일 편집"/"+ 기념일 등록" buttons (WP-03) open the SAME 기념일 설정 modal the
  // 더보기 tab does, pre-filled with an edit id or a starting date -- exactly what the old
  // MainSideMenu-driven flow did, just routed through this shell's own openMoreModal state.
  const openAnniversariesWith = (override) => {
    setAnniversaryOverride(override);
    Promise.resolve(moreContext.onSelectAnniversaries()).then(() => setOpenMoreModal('anniversaries')).catch(() => {});
  };
  const onEditAnniversary = (ann) => {
    if (!ann?.id) return;
    openAnniversariesWith({ initialEditId: ann.id, initialDate: null });
  };
  const onAddAnniversaryForDate = (dateStr) => {
    if (!dateStr) return;
    openAnniversariesWith({ initialEditId: null, initialDate: dateStr });
  };
  // 컨텐츠 원본(지역축제/문화행사 등) 포커스는 아직 실제 컨텐츠 화면이 없어(WP-06), 기록 탭의
  // 콘텐츠 서브탭으로만 이동시킨다 -- 특정 항목을 펼쳐서 보여주는 것은 그 화면이 실제로
  // 연결될 때 함께 다룬다.
  const onFocusCultureSource = () => {
    setActiveTab('records');
    setRecordsSubTab('content');
  };

  // ChatRoomView's internal side menu (ChatSideMenu) calls this the same way app-main.js's own
  // `changeView` did to jump between the old top-level views -- those views are now tabs/subtabs
  // in this shell, so this just maps the old view id to the equivalent tab/subtab instead of
  // reimplementing navigation. `onBack`/`onOpenGallery` (ChatPane) reuse this same mapping.
  const onChangeView = (view) => {
    if (view === 'chat') return; // already there
    if (view === 'settlement') { setActiveTab('settlement'); return; }
    const recordsSubTabByView = { memo: 'memo', places: 'places', gallery: 'media', history: 'archive', content: 'content' };
    if (recordsSubTabByView[view]) {
      setActiveTab('records');
      setRecordsSubTab(recordsSubTabByView[view]);
      return;
    }
    setActiveTab('calendar');
  };
  const onOpenAppSettings = () => openMoreModalById('app-settings');

  // GlobalSearchModal's date/chat-message/image navigation (WP-08): composed here, not in
  // `buildRenewalMoreContext`, because switching to the 대화 tab (`onChangeView`) and opening a
  // date's detail are shell-navigation concepts that context builder has no access to. Reuses
  // the exact same lightbox-entry-building logic app-main.js's own AdminModal/GlobalSearchModal
  // call sites use (moreContext.chatMessages/setActiveLightbox/focusChatMessage are plain
  // pass-through of those same CalendarApp values) -- only the "which tab is active" part is new.
  //
  // `moreDateModalDate` is its own small local instance (like PlacesPane's) rather than a shared
  // one: WP-07's date-modal lift (#617) isn't merged yet, so this avoids an inter-PR ordering
  // dependency; a later cleanup can fold it into the shared instance once that lands.
  const [moreDateModalDate, setMoreDateModalDate] = React.useState(null);
  const onOpenChatMessageFromMore = (messageId) => {
    onChangeView('chat');
    setTimeout(() => { if (typeof moreContext.focusChatMessage === 'function') moreContext.focusChatMessage(messageId); }, 350);
  };
  const onOpenImageFromMore = (messageId, imageIndex, directMediaUrl = '') => {
    onChangeView('chat');
    setTimeout(() => {
      const msg = (moreContext.chatMessages || []).find(m => m.id === messageId);
      if (!msg || typeof moreContext.setActiveLightbox !== 'function') return;
      const directEntry = getMessageDirectMediaEntry(msg);
      const entries = directMediaUrl && directEntry ? [directEntry] : getMessageImageEntries(msg);
      moreContext.setActiveLightbox({
        urls: entries.map(e => e.full),
        meta: entries.map(e => ({ timestamp: msg.timestamp, messageId: msg.id, imageIndex: e.imageIndex, thumb: e.thumb, tags: e.tags, directMediaUrl: e.directMediaUrl, source: e.source, uploadSource: e.uploadSource, assetKey: e.assetKey, mediaKey: e.mediaKey, refKey: e.refKey })),
        index: directMediaUrl ? 0 : imageIndex,
      });
    }, 350);
  };
  const searchExtra = {
    onOpenMemo: () => onChangeView('memo'),
    onSelectDate: (d) => setMoreDateModalDate(d),
    onOpenChatMessage: onOpenChatMessageFromMore,
    onOpenImage: onOpenImageFromMore,
  };

  // Correct an invalid/stale ?tab=/?sub= on first mount without adding a history entry, then
  // listen for the back/forward buttons for the rest of this shell's lifetime.
  React.useEffect(() => {
    writeLocationState(activeTab, recordsSubTab, { push: false });
    const onPopState = () => {
      setActiveTabState(readTabFromLocation());
      setRecordsSubTabState(readRecordsSubTabFromLocation());
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []); // mount-only: reads the initial URL once and wires the one popstate listener

  const setActiveTab = (tabId) => {
    if (tabId === activeTab) return;
    const nextSub = tabId === 'records' ? recordsSubTab : DEFAULT_RECORDS_SUBTAB;
    writeLocationState(tabId, nextSub, { push: true });
    setActiveTabState(tabId);
  };

  const setRecordsSubTab = (subTabId) => {
    if (subTabId === recordsSubTab) return;
    writeLocationState('records', subTabId, { push: true });
    setRecordsSubTabState(subTabId);
  };

  const navButtons = (extraClass) => TABS.map(tab =>
    React.createElement('button', {
      key: tab.id,
      type: 'button',
      className: `renewal-shell-nav-item ${extraClass || ''} ${activeTab === tab.id ? 'is-active' : ''}`.trim(),
      onClick: () => setActiveTab(tab.id),
      'aria-current': activeTab === tab.id ? 'page' : undefined,
    },
      React.createElement('span', { className: 'renewal-shell-nav-icon' }, React.createElement(TabIcon, { id: tab.id })),
      React.createElement('span', { className: 'renewal-shell-nav-label' }, tab.label)
    )
  );

  return React.createElement(React.Fragment, null,
    React.createElement('div', { className: 'renewal-shell' },
      React.createElement('nav', { className: 'renewal-shell-side-nav', 'aria-label': '주 메뉴' },
        React.createElement('div', { className: 'renewal-shell-side-nav-brand' }, calendarName || '모여라 캘린더'),
        ...navButtons('renewal-shell-side-nav-item')
      ),
      React.createElement('main', { className: 'renewal-shell-main' },
        React.createElement(TopHeader, {
          calendarName,
          onOpenSearch: () => handleSelectMoreItem('search'),
          onOpenMore: () => setActiveTab('more'),
        }),
        activeTab === 'calendar'
          ? React.createElement(CalendarPane, { calendarContext, onOpenDate: setDateModalDate })
          : activeTab === 'chat'
          ? React.createElement(ChatPane, { chatContext, onChangeView, onOpenAppSettings })
          : activeTab === 'settlement'
          ? React.createElement(SettlementPane, { settlementContext, onChangeView, onOpenAppSettings, onOpenDate: setDateModalDate })
          : activeTab === 'records'
          ? React.createElement(RecordsPane, { subTab: recordsSubTab, onSelectSubTab: setRecordsSubTab, calendarName, recordsContext, calendarContext, onChangeView, onOpenAppSettings, onEditAnniversary, onAddAnniversaryForDate, onFocusCultureSource })
          : activeTab === 'more'
          ? React.createElement(MorePane, { calendarName, selectedItem: selectedMoreItem, onSelectItem: handleSelectMoreItem })
          : React.createElement(PlaceholderPane, { tabId: activeTab, calendarName }),
        dateModalDate && React.createElement(SharedDateModal, {
          calendarContext, dateModalDate,
          onClose: () => setDateModalDate(null),
          onSelectDate: setDateModalDate,
          onEditAnniversary, onAddAnniversaryForDate, onFocusCultureSource,
        })
      ),
      React.createElement('nav', { className: 'renewal-shell-bottom-nav', 'aria-label': '주 메뉴' },
        ...navButtons('renewal-shell-bottom-nav-item')
      )
    ),
    React.createElement(MoreModalsHost, {
      openModal: openMoreModal, onClose: () => setOpenMoreModal(null),
      modalProps: moreContext.modalProps, anniversaryOverride, searchExtra,
    }),
    moreDateModalDate && React.createElement(SearchDateModal, {
      calendarContext, dateStr: moreDateModalDate,
      onClose: () => setMoreDateModalDate(null),
      onEditAnniversary, onAddAnniversaryForDate: (d) => { setMoreDateModalDate(null); onAddAnniversaryForDate(d); },
      onFocusCultureSource,
    })
  );
}
