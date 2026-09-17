/**
 * Claude HTML design adapters, enabled exclusively by ?shell=v2.
 * The reference CSS is namespaced; existing feature components supply their real
 * state and actions through optional renderers. Default routes retain their UI.
 */

import './v2/reference-home.css';
import './v2/design.css';
import './v2/aurora-theme.css';
import { renderMemoScreen, renderPlacesScreen, renderSettlementScreen, renderChatScreen, renderGalleryScreen, renderContentScreen, renderArchiveScreen, PageHeader } from './v2/screens.js';
import { authorFor, latestRows, timestampMs, photoLightbox, shortParticipantName } from './v2/view-data.js';
import { ChatBubbleFrame, NameColorPill, ReplyQuote } from './v2/chat-bubble-modules.js';
import {
  V2_PRIMARY, V2_SECONDARY, V2_DESTINATION_TABS, resolveV2Destination,
} from './v2/shell-nav.js';
import { TABLER_ICONS } from './v2/tabler-icons.js';

const bentoClass = value => String(value || '').split(/\s+/).filter(Boolean).map(name => `bp-${name}`).join(' ');

const BULK_NO_PARTICIPANT_ID = '__none__';

// Keep comment animation staggered across renders without using Math.random(), which would
// reshuffle the gallery every state update. A stable key gives each thumbnail its own phase and
// cadence while still making the effect feel asynchronous.
function galleryCommentMotion(photo, index) {
  const key = String(photo?.id || photo?.mediaKey || photo?.full || photo?.thumb || index);
  let hash = 17;
  for (let i = 0; i < key.length; i += 1) hash = (hash * 31 + key.charCodeAt(i)) % 997;
  return {
    '--gallery-comment-delay': `${-((hash % 230) / 100).toFixed(2)}s`,
    '--gallery-comment-duration': `${(2.7 + (hash % 160) / 100).toFixed(2)}s`,
  };
}

import { getInitialAppView } from '../core/app-routing-state.js';
import { isRenewalShellEnabled } from '../core/app-feature-flags.js';
import { bindUiComponentAliases } from '../core/app-ui-wrappers.js';
import {
  isNotificationSupported, isChatNotifyEnabledForCalendar, setChatNotifyEnabledForCalendar,
  getNotificationPermissionHelpSteps, setNotifGuideSeen, setNotifyChannel, syncPushSubscriptionChannels,
  formatDDayLabel, formatConfirmedMeetingLabel, unionActivityLogs,
  getMessageDirectMediaEntry, getMessageImageEntries,
  normalizePlaceDateForSort,
  getTrulyConfirmedMeetings, getActiveAvailabilities, getActiveParticipants,
  calculateSettlementBalance, formatBalanceBadge, getAnniversaryDisplayColor,
} from '../core/app-domain-helpers.js';
import { getMeetingOwnedPhotoMessageIds, isChatRenderableMessage, isMemeKeyboardPhotoEntry } from '../core/gallery-data.js';
import { computeKoreanHolidaysForYear, getKoreanSolarTermsForYear } from '../core/app-calendar-holidays.js';
import { getAnniversariesForDate } from '../core/app-anniversary-dates.js';
import { buildMainCalendarScreenState } from '../core/app-calendar-screen-state.js';

/** Legacy 5-tab labels kept for PlaceholderPane; primary IA is V2_PRIMARY side-nav. */
const TABS = [
  { id: 'calendar', label: '캘린더' },
  { id: 'chat', label: '대화' },
  { id: 'memo', label: '메모' },
  { id: 'places', label: '장소' },
  { id: 'records', label: '기록' },
  { id: 'settlement', label: '정산' },
  { id: 'more', label: '더보기' },
];
const BENTO_MAIN_ITEMS = V2_PRIMARY;
const BENTO_SUB_ITEMS = V2_SECONDARY;
const TAB_IDS = V2_DESTINATION_TABS;
const DEFAULT_TAB = 'calendar';

/**
 * 기록 sub-tabs (docs/design-renewal-handoff.md §2's mapping table): the 5 screens 기록 absorbs
 * -- 메모/갤러리(사진·영상)/장소/보관함(추억)/콘텐츠 -- plus 전체 as the default landing filter.
 * Still placeholder content only; real data wiring is WP-06.
 */
const RECORDS_SUBTABS = [
  { id: 'all', label: '전체' },
  { id: 'media', label: '사진·영상' },
  { id: 'archive', label: '보관함' },
  { id: 'content', label: '콘텐츠' },
];
const RECORDS_SUBTAB_IDS = RECORDS_SUBTABS.map(t => t.id);
const DEFAULT_RECORDS_SUBTAB = 'all';

/** Reads `?tab=` from the current URL, falling back to 캘린더 for a missing/unknown value. */
function readTabFromLocation() {
  if (typeof window === 'undefined' || !window.location) return DEFAULT_TAB;
  try {
    const params = new URLSearchParams(window.location.search);
    const view = getInitialAppView(window.location);
    // Prefer explicit ?tab=; otherwise map data-view → first-class destination.
    const fromView = ({ memo: 'memo', places: 'places', gallery: 'records', history: 'records', content: 'records', chat: 'chat', settlement: 'settlement' })[view];
    let raw = params.get('tab') || fromView || view;
    // Old bookmarks: ?tab=records&sub=memo|places → promote to first-class tabs.
    if (raw === 'records') {
      const sub = params.get('sub');
      if (sub === 'memo' || sub === 'places') raw = sub;
    }
    return raw === 'search' || TAB_IDS.includes(raw) ? raw : DEFAULT_TAB;
  } catch (_) {
    return DEFAULT_TAB;
  }
}

/** Reads `?sub=` -- only meaningful on the 기록 tab, ignored (and later stripped) elsewhere. */
function readRecordsSubTabFromLocation() {
  if (typeof window === 'undefined' || !window.location) return DEFAULT_RECORDS_SUBTAB;
  try {
    const params = new URLSearchParams(window.location.search);
    const raw = params.get('sub') || ({ gallery: 'media', history: 'archive', content: 'content' }[params.get('view')]);
    // memo/places are first-class now — ignore as records sub.
    if (raw === 'memo' || raw === 'places') return DEFAULT_RECORDS_SUBTAB;
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
  // Only gallery/content/archive (records) keep ?sub=; memo/places are first-class tabs.
  if (tabId !== 'records' || !subTabId || subTabId === DEFAULT_RECORDS_SUBTAB) url.searchParams.delete('sub');
  else url.searchParams.set('sub', subTabId);
  url.searchParams.delete('view');
  const method = push ? 'pushState' : 'replaceState';
  window.history[method](window.history.state, '', url);
  // Existing core subscribers use popstate to select the correct data collection.
  window.dispatchEvent(new PopStateEvent('popstate'));
}

// Every v2 icon (nav categories, side-nav settings/footer/submenu items, chevrons, form
// controls) now comes from ONE registry (src/ui/v2/tabler-icons.js, TABLER_ICONS) -- a single
// Tabler icon set the user hand-picked with matching off/outline + on/filled pairs per glyph.
// This replaces the earlier mixed-family CATEGORY_ICON_DEFS (Ant Design/Bootstrap/Clarity/
// Fluent icons that needed per-icon viewBox cropping just to look the same size next to each
// other) -- every TABLER_ICONS entry shares the exact same 24x24 viewBox and 2px stroke weight
// by construction, so no per-icon size/weight correction is needed here at all. `active` selects
// `on` (paired with the brand purple via .bp-side-nav-item.bp-is-active's color rule) vs `off`
// (default ink); icons with no genuine active state (닫기, 체크, 더하기, 공유, 설정, ...) only
// have `off` and render identically either way.
//
// A few ids (chevronRight/chevronLeft, records, more) have no match in the user's provided set
// and keep their original bespoke [tag, props] node-array definition in TAB_ICON_NODES below.
const TAB_ICON_NODES = {
  records: [['path', { d: 'M4 19.5A2.5 2.5 0 0 1 6.5 17H20V2H6.5A2.5 2.5 0 0 0 4 4.5v15Z' }]],
  more: [['path', { d: 'M4 7h16M4 12h16M4 17h16' }]],
  chevronRight: [['path', { d: 'm9 18 6-6-6-6' }]],
  chevronLeft: [['path', { d: 'm15 18-6-6 6-6' }]],
  // No generic magnifier / hyperlink-chain glyph in the user's Tabler set (see
  // TABLER_ICONS_MISSING in tabler-icons.js) -- kept as bespoke outline nodes until sourced.
  search: [
    ['circle', { cx: 11, cy: 11, r: 8 }],
    ['path', { d: 'm21 21-4.3-4.3' }],
  ],
  link: [
    ['path', { d: 'M9 17H7A5 5 0 0 1 7 7h2' }],
    ['path', { d: 'M15 7h2a5 5 0 1 1 0 10h-2' }],
    ['path', { d: 'M8 12h8' }],
  ],
};

function TabIcon({ id, active }) {
  const React = window.React;
  const def = TABLER_ICONS[id];
  if (def) {
    const isFilled = active && def.on;
    return React.createElement('svg', {
      width: 16, height: 16, viewBox: '0 0 24 24', 'aria-hidden': 'true',
      fill: isFilled ? 'currentColor' : 'none', stroke: 'currentColor',
      // Filled (on) glyphs are solid shapes already -- keeping a 2px stroke on top of the fill
      // blurs/thickens the edges, so drop the stroke to 0 whenever we render the filled variant.
      strokeWidth: isFilled ? 0 : 2, strokeLinecap: 'round', strokeLinejoin: 'round',
      style: { display: 'block', shapeRendering: 'geometricPrecision' },
      dangerouslySetInnerHTML: { __html: isFilled ? def.on : def.off },
    });
  }
  const nodes = TAB_ICON_NODES[id] || [];
  return React.createElement(
    'svg', {
      width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
      strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': 'true',
      // Keep vectors on pixel grid when CSS sizes the icon; avoids soft antialias from 20→16 downscale.
      style: { display: 'block', shapeRendering: 'geometricPrecision' },
    },
    ...nodes.map(([tag, props], i) => React.createElement(tag, { key: i, ...props }))
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
  const brandName = String(calendarName || '모여라 캘린더')
    .replace(/^[^\p{L}\p{N}]+/u, '')
    .replace(/\s*캘린더\s*$/u, '')
    .trim();
  return React.createElement('div', { className: bentoClass('bento-title v2-title-row') },
    React.createElement('div', { className: bentoClass('bento-title-brand') },
      React.createElement('svg', { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' },
        React.createElement('rect', { x: 3, y: 4, width: 18, height: 18, rx: 2 }),
        React.createElement('path', { d: 'M8 2v4M16 2v4M3 10h18' })
      ),
      React.createElement('span', { className: bentoClass('brand-name') }, brandName)
    ),
    React.createElement('div', { className: bentoClass('renewal-shell-header-actions bento-title-actions') },
      React.createElement('button', { type: 'button', className: bentoClass('renewal-shell-header-icon-btn icon-btn'), 'aria-label': '검색', onClick: onOpenSearch },
        React.createElement('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' },
          React.createElement('circle', { cx: 11, cy: 11, r: 8 }),
          React.createElement('path', { d: 'm21 21-4.3-4.3' })
        )
      ),
      React.createElement('button', { type: 'button', className: bentoClass('renewal-shell-header-icon-btn icon-btn side-nav-toggle-btn'), 'aria-label': '더보기', onClick: onOpenMore },
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
    handleFetchDateTaggedMessages, handleFetchDateTaggedMemos, handleOpenEditMemo, handleToggleMemoPin, handleMemoCommentsChange, handleFetchMeetingPhotoIndex,
    handleFetchMeetingAlbum, loadOlderChatMessages, hasMoreOlderChat, loadingOlderChat, fullChatMessages,
    handleSavePlace, handleDeletePlace, handleReorderPlaces,
    showToast, showConfirmDialog, syncStatus, photoCommentCounts, setActiveLightbox, galleryPhotoIndex,
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
    displayChatMessages, memos, galleryPhotoIndex, setActiveLightbox,
    anniversaries: anniversariesWithPosters,
    isLoading: !!isInitialDataLoading,
    handleMoveAvailability,
    // Bento 시안: 최대 8개까지 가로 칩 스트립으로 표시.
    upcomingMeetings: visibleConfirmedMeetings.slice(0, 8),
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
      onOpenEditMemo: handleOpenEditMemo,
      onToggleMemoPin: handleToggleMemoPin,
      onMemoCommentsChange: handleMemoCommentsChange,
      onFetchMeetingPhotoIndex: handleFetchMeetingPhotoIndex, onFetchMeetingAlbum: handleFetchMeetingAlbum,
      onLoadOlderChat: loadOlderChatMessages,
      hasMoreOlderChat: !Array.isArray(fullChatMessages) && !!hasMoreOlderChat,
      loadingOlderChat, setActiveLightbox,
      onSavePlace: handleSavePlace, onDeletePlace: handleDeletePlace, onReorderPlaces: handleReorderPlaces,
      showToast, onRequestConfirm: showConfirmDialog, syncStatus, photoCommentCounts,
    },
  };
}

/** Compact hero zone from the approved BentoPink reference: one primary D-day plus
 * horizontally-scannable upcoming chips. It is presentation-only and reuses the same
 * confirmed meeting selector as the list below. */
function RenewalHero({ meetings, calendar, onSelectDate }) {
  const React = window.React;
  const list = Array.isArray(meetings) ? meetings : [];
  const [isOpen, setIsOpen] = React.useState(false);
  if (!list.length) return React.createElement('p', { className: 'bp-empty-hero', 'aria-label': '가까운 확정 일정' }, '다가오는 확정 일정이 없습니다.');
  const primary = list[0];
  const participants = getActiveParticipants(calendar || {});
  const participantMemosFor = (dateStr) => getActiveAvailabilities(calendar || {})
    .filter(e => e.date === dateStr && e.note && String(e.note).trim() && e.participantId !== BULK_NO_PARTICIPANT_ID)
    .map(e => {
      const p = participants.find(part => part.id === e.participantId);
      const note = String(e.note).trim().replace(/\s+/g, ' ');
      if (!note) return null;
      return { id: e.participantId || e.id, name: p?.name || '참여자', color: p?.color || '#A78BFA', note };
    })
    .filter(Boolean);
  /** Always expose a clear 모임확정 prefix; detail (date · note/title) may ellipsis. */
  const meetingLabelParts = (meeting) => {
    const rawTitle = typeof meeting?.title === 'string' ? meeting.title.trim().replace(/\s+/g, ' ') : '';
    const rawNote = typeof meeting?.note === 'string' ? meeting.note.trim().replace(/\s+/g, ' ') : '';
    const formatted = formatConfirmedMeetingLabel(meeting?.date) || '';
    // formatConfirmedMeetingLabel → "[모임확정] YY.MM.DD (요일)"; strip any leading tag for parts.
    const stripped = formatted.replace(/^\[?모임확정\]?\s*/u, '').trim();
    const datePart = stripped || (meeting?.date ? String(meeting.date) : '');
    const extra = (rawTitle && rawTitle !== '모임확정' ? rawTitle : '') || rawNote;
    const detail = extra
      ? `${datePart}${datePart ? ' · ' : ''}${extra.slice(0, 48)}`
      : datePart;
    return { prefix: '[모임확정]', detail };
  };
  const labelFor = (meeting) => {
    const { prefix, detail } = meetingLabelParts(meeting);
    return detail ? `${prefix} ${detail}` : prefix;
  };
  const renderMeetingLabel = (meeting, className) => {
    const { prefix, detail } = meetingLabelParts(meeting);
    return React.createElement('span', { className },
      React.createElement('span', { className: bentoClass('dday-compact-prefix') }, prefix),
      detail
        ? React.createElement('span', { className: bentoClass('dday-compact-detail') }, detail)
        : null
    );
  };
  const chipDateFor = (dateValue) => {
    const date = new Date(`${dateValue}T00:00:00`);
    if (Number.isNaN(date.getTime())) return { date: String(dateValue || ''), day: '' };
    return {
      date: `${String(date.getFullYear()).slice(-2)}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`,
      day: ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'][date.getDay()],
    };
  };

  // Match BentoPinkFinal: dday-toggle-wrap + dday-strip are direct hero-zone children (no extra wrapper).
  return React.createElement(React.Fragment, null,
    React.createElement('div', { className: bentoClass(`dday-toggle-wrap ${isOpen ? 'is-open' : ''}`.trim()), 'aria-label': '가까운 확정 일정' },
      React.createElement('button', { type: 'button', className: bentoClass('dday-compact'), onClick: () => setIsOpen(true), 'aria-expanded': isOpen },
        React.createElement('span', { className: bentoClass('dday-compact-badge') }, formatDDayLabel(primary.date)),
        renderMeetingLabel(primary, bentoClass('dday-compact-text')),
        React.createElement('svg', { className: bentoClass('dday-compact-chevron'), width: 14, height: 14, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2.5, strokeLinecap: 'round', strokeLinejoin: 'round' },
          React.createElement('path', { d: 'M6 9l6 6l6 -6' })

        )
      ),
      React.createElement('div', { className: bentoClass('dday-expanded') },
        React.createElement('div', { className: bentoClass('dday-expanded-main') },
          React.createElement('div', { className: bentoClass('dday-expanded-title-row') },
            renderMeetingLabel(primary, bentoClass('dday-expanded-title'))
          ),
          primary.note && React.createElement('div', { className: bentoClass('dday-expanded-tags') },
            React.createElement('span', { className: bentoClass('dday-expanded-tag') }, primary.note.trim())
          ),
          (() => {
            const memos = participantMemosFor(primary.date);
            if (!memos.length) return null;
            return React.createElement('div', { className: bentoClass('dday-participant-memos'), 'aria-label': '참여자 일정 메모' },
              memos.map(m => React.createElement('span', {
                key: m.id,
                className: bentoClass('dday-participant-memo'),
                title: `${m.name}: ${m.note}`,
                style: { borderColor: m.color },
              },
                React.createElement('span', { className: bentoClass('dday-participant-memo-name'), style: { color: m.color } }, m.name),
                m.note
              ))
            );
          })()
        ),
        React.createElement('div', { className: bentoClass('dday-expanded-side') },
          React.createElement('button', { type: 'button', className: bentoClass('dday-collapse-btn'), onClick: () => setIsOpen(false), 'aria-label': '접기' }, '⌃'),
          React.createElement('span', { className: bentoClass('dday-expanded-badge') }, formatDDayLabel(primary.date)),
          React.createElement('button', { type: 'button', className: bentoClass('dday-view-btn'), onClick: () => onSelectDate(primary.date) }, '일정보기')
        )
      )
    ),

    React.createElement('div', { className: bentoClass('dday-strip renewal-home-hero-chips') }, list.map(meeting => {

      const chipDate = chipDateFor(meeting.date);
      return React.createElement('button', {
        key: meeting.date, type: 'button', className: bentoClass('dday-chip renewal-home-hero-chip'), onClick: () => onSelectDate(meeting.date), title: labelFor(meeting)
      },
      React.createElement('strong', { className: bentoClass('dday-date renewal-home-hero-chip-date') }, chipDate.date),
      React.createElement('span', { className: bentoClass('dday-dow renewal-home-hero-chip-day') }, chipDate.day),
      React.createElement('small', { className: bentoClass('dday-pill renewal-home-hero-chip-dday') }, formatDDayLabel(meeting.date)));
    }))
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


/** YYYY-MM-DD ± n days (local noon to avoid DST edge). */
function shiftDateStr(dateStr, deltaDays) {
  const d = new Date(`${dateStr}T12:00:00`);
  if (Number.isNaN(d.getTime())) return null;
  d.setDate(d.getDate() + deltaDays);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/**
 * Multi-day (연일) range anniversary → start / mid / end / solo for connected bar radii.
 * Week-row aware: Sunday never continues left, Saturday never continues right (grid wraps).
 */
function anniversarySpanRole(ann, dateStr) {
  const start = ann && ann.startDate;
  const end = ann && ann.endDate;
  const isMulti = ann && ann.type === 'range' && start && end && start < end
    && dateStr >= start && dateStr <= end;
  if (!isMulti) return 'solo';
  const d = new Date(`${dateStr}T12:00:00`);
  if (Number.isNaN(d.getTime())) return 'solo';
  const dow = d.getDay(); // 0 Sun … 6 Sat
  const prevStr = shiftDateStr(dateStr, -1);
  const nextStr = shiftDateStr(dateStr, 1);
  const contLeft = dateStr !== start && prevStr && prevStr >= start && dow !== 0;
  const contRight = dateStr !== end && nextStr && nextStr <= end && dow !== 6;
  if (!contLeft && contRight) return 'start';
  if (contLeft && !contRight) return 'end';
  if (contLeft && contRight) return 'mid';
  return 'solo';
}

function BentoCalendarCard({ calendarContext, onSelectDate }) {
  const React = window.React;
  const [monthDate, setMonthDate] = React.useState(() => new Date());
  const [monthPickerOpen, setMonthPickerOpen] = React.useState(false);
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();

  const calendar = calendarContext?.calendar || {};
  const participants = Array.isArray(calendar.participants) ? calendar.participants : [];
  const anniversariesList = Array.isArray(calendarContext?.anniversaries) ? calendarContext.anniversaries : [];

  const participantsMap = React.useMemo(() => {
    return getActiveParticipants(calendar).reduce((acc, p) => {
      acc[p.id] = p;
      return acc;
    }, {});
  }, [calendar.participants]);

  const availMap = React.useMemo(() => {
    return getActiveAvailabilities(calendar).reduce((acc, entry) => {
      if (!acc[entry.date]) acc[entry.date] = [];
      acc[entry.date].push(entry);
      return acc;
    }, {});
  }, [calendar.availabilities]);

  const confirmedMeetings = React.useMemo(() => {
    return getTrulyConfirmedMeetings(calendar);
  }, [calendar]);

  const meetingMap = React.useMemo(() => {
    const map = {};
    confirmedMeetings.forEach(m => {
      if (m?.date) map[m.date] = m;
      if (Array.isArray(m?.dates)) {
        m.dates.forEach(d => { map[d] = m; });
      }
    });
    return map;
  }, [confirmedMeetings]);

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

  // Compute days array
  const firstDay = new Date(year, month, 1).getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();
  const prevLastDate = new Date(year, month, 0).getDate();
  const days = [];

  // Prev month
  for (let i = firstDay - 1; i >= 0; i--) {
    const d = prevLastDate - i;
    const prevD = new Date(year, month - 1, d);
    days.push({
      dayNum: d,
      dateStr: `${prevD.getFullYear()}-${String(prevD.getMonth() + 1).padStart(2, '0')}-${String(prevD.getDate()).padStart(2, '0')}`,
      isCurrentMonth: false,
    });
  }
  // Current month
  for (let i = 1; i <= lastDate; i++) {
    days.push({
      dayNum: i,
      dateStr: `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`,
      isCurrentMonth: true,
    });
  }
  // Next month
  const totalCells = Math.ceil(days.length / 7) * 7;
  const nextDaysNeeded = totalCells - days.length;
  for (let i = 1; i <= nextDaysNeeded; i++) {
    const nextD = new Date(year, month + 1, i);
    days.push({
      dayNum: i,
      dateStr: `${nextD.getFullYear()}-${String(nextD.getMonth() + 1).padStart(2, '0')}-${String(nextD.getDate()).padStart(2, '0')}`,
      isCurrentMonth: false,
    });
  }

  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  return React.createElement('div', { className: bentoClass('cal-card') },
    // Month nav
    React.createElement('div', { className: bentoClass('cal-month-nav-row'), style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', position: 'relative' } },
      React.createElement('button', {
        onClick: () => setMonthPickerOpen(value => !value),
        'aria-expanded': monthPickerOpen,
        className: bentoClass('ghost-btn cal-month-title'),
        style: { gap: '4px', fontWeight: 800, fontSize: '0.92rem', color: 'var(--text-main)', padding: '2px 0' },
        type: 'button',
      },
        `${year}년 ${month + 1}월`,
        React.createElement('svg', { width: 14, height: 14, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' },
          React.createElement('path', { d: 'M6 9l6 6l6 -6' })
        )
      ),
      monthPickerOpen && React.createElement('div', { className: 'bp-month-picker' },
        React.createElement('input', { type: 'month', 'aria-label': '이동할 연월', value: `${year}-${String(month + 1).padStart(2, '0')}`, onChange: event => { const [y, m] = event.target.value.split('-').map(Number); if (y && m) { setMonthDate(new Date(y, m - 1, 1)); setMonthPickerOpen(false); } } })
      ),
      React.createElement('div', { className: bentoClass('cal-month-nav'), style: { display: 'flex', gap: '0px' } },
        React.createElement('button', {
          className: bentoClass('ghost-btn cal-nav-btn'),
          'aria-label': '이전달',
          type: 'button',
          onClick: () => setMonthDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1)),
        },
          React.createElement('svg', { width: 15, height: 15, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', style: { transform: 'rotate(90deg)' } },
            React.createElement('path', { d: 'M6 9l6 6l6 -6' })
          )
        ),
        React.createElement('button', {
          className: bentoClass('ghost-btn cal-today-btn'),
          style: { fontWeight: 700, fontSize: '0.72rem', padding: '6px 8px' },
          type: 'button',
          onClick: () => setMonthDate(new Date()),
        }, '오늘'),
        React.createElement('button', {
          className: bentoClass('ghost-btn cal-nav-btn'),
          'aria-label': '다음달',
          type: 'button',
          onClick: () => setMonthDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1)),
        },
          React.createElement('svg', { width: 15, height: 15, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', style: { transform: 'rotate(-90deg)' } },
            React.createElement('path', { d: 'M6 9l6 6l6 -6' })
          )
        )
      )
    ),

    // Weekdays
    React.createElement('div', { className: bentoClass('cal-weekdays'), style: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: '2px' } },
      React.createElement('div', { className: bentoClass('weekday-label'), style: { color: '#EF4444' } }, '일'),
      React.createElement('div', { className: bentoClass('weekday-label') }, '월'),
      React.createElement('div', { className: bentoClass('weekday-label') }, '화'),
      React.createElement('div', { className: bentoClass('weekday-label') }, '수'),
      React.createElement('div', { className: bentoClass('weekday-label') }, '목'),
      React.createElement('div', { className: bentoClass('weekday-label') }, '금'),
      React.createElement('div', { className: bentoClass('weekday-label'), style: { color: '#2563EB' } }, '토')
    ),

    // Days grid
      React.createElement('div', { className: bentoClass('cal-days-grid'), style: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', rowGap: '1px' } },
      days.map(day => {
        const { dayNum, dateStr, isCurrentMonth } = day;
        const cellDate = new Date(dateStr);
        const dayOfWeek = cellDate.getDay();
        const isToday = dateStr === todayStr;
        const holidays = holidayMap[dateStr] || [];
        const isHoliday = holidays.length > 0 || dayOfWeek === 0;
        const solarTerm = solarTermMap[dateStr];
        const cornerLabel = holidays[0] || solarTerm || '';
        const isHolidayCorner = holidays.length > 0;
        const meeting = meetingMap[dateStr];
        const hasMeeting = !!meeting;
        const availEntries = availMap[dateStr] || [];
        const seenPids = new Set();
        const dots = [];
        availEntries.forEach(entry => {
          const p = participantsMap[entry.participantId];
          if (p && !seenPids.has(p.id)) {
            seenPids.add(p.id);
            dots.push(p);
          }
        });
        const anns = getAnniversariesForDate(dateStr, anniversariesList);
        const cellClasses = [
          'day-cell',
          !isCurrentMonth ? 'other-month' : '',
          isToday ? 'today' : '',
          isHoliday ? 'holiday' : '',
          hasMeeting ? 'confirmed has-event' : '',
        ].filter(Boolean).join(' ');

        return React.createElement('button', {
          key: dateStr,
          className: bentoClass(cellClasses),
          type: 'button',
          onClick: () => onSelectDate?.(dateStr),
          'aria-label': `${dateStr} 일정 상세`,
        },
          React.createElement('span', { className: bentoClass('day-num') }, dayNum),
          // Holiday + 모임확정 share one row (no stacked lines). Never render participant
          // schedule memos / meeting.note as free cell-body text under v2.
          (cornerLabel || hasMeeting) ? React.createElement('div', { className: bentoClass('day-head-row') },
            cornerLabel ? React.createElement('div', { className: bentoClass(`day-corner-label ${isHolidayCorner ? 'is-holiday' : ''}`.trim()) }, cornerLabel) : null,
            hasMeeting ? React.createElement('span', {
              className: bentoClass('day-meeting-pill'),
              title: meeting.title || meeting.note || '모임확정',
            }, '모임확정') : null
          ) : null,
          dots.length > 0 ? React.createElement('div', { className: bentoClass('dot-row') },
            dots.map(p => React.createElement('span', {
              key: p.id,
              className: bentoClass('p-dot'),
              'data-name': (p.name || '').slice(-2),
              style: { background: p.color || 'var(--brand)' },
            }))
          ) : null,
          // Anniversary bars only in the stack (pink --cal-anniversary). Meeting pill lives in day-head-row.
          // Range (연일) keeps start/mid/end radius classes from #636/#637.
          anns.length > 0 ? React.createElement('div', { className: bentoClass('day-bar-stack') },
            // Progressive disclosure: label in DOM; CSS shows on PC/wide, hides on mobile/narrow.
            anns.slice(0, 4).map((ann, annIdx) => {
              const role = anniversarySpanRole(ann, dateStr);
              const title = ann.title || '기념일';
              const displayColor = getAnniversaryDisplayColor(ann, calendar) || 'var(--cal-anniversary)';
              return React.createElement('div', {
                key: ann.id || `${dateStr}_ann_${annIdx}`,
                className: bentoClass(`day-anniversary ${role} ${ann.category ? `cat-${String(ann.category).toLowerCase()}` : ''} ${ann.genre ? `genre-${String(ann.genre).toLowerCase()}` : ''}`.trim()),
                title,
                'aria-label': title,
                style: { '--anniversary-color': displayColor },
              }, role === 'start' || role === 'solo' ? React.createElement('span', {
                className: bentoClass('day-anniversary-label'),
              }, title) : null);
            })
          ) : null
        );
      })
    ),

    // Legend
    React.createElement('div', { className: bentoClass('cal-legend') },
      participants.map(p => React.createElement('span', { key: p.id },
        React.createElement('span', { className: bentoClass('dot'), style: { background: p.color || '#A78BFA' } }),
        p.name
      )),
      React.createElement('span', null,
        React.createElement('span', { className: bentoClass('dot'), style: { background: 'var(--cal-schedule, #7C2FE5)', borderRadius: 'var(--radius-full)', width: '12px', height: '5px' } }),
        '일정·여행'
      ),
      React.createElement('span', null,
        React.createElement('span', { className: bentoClass('dot'), style: { background: 'var(--cal-anniversary, #F76AAD)', borderRadius: 'var(--radius-full)', width: '12px', height: '5px' } }),
        '기념일'
      )
    )
  );
}


function CalendarPane({ calendarContext, recordsContext, onOpenDate, onChangeView, calendarName, onOpenSearch, onOpenMore }) {
  const React = window.React;
  return React.createElement(React.Fragment, null,
    React.createElement('div', { className: 'bp-hero-zone' },
      React.createElement('span', { className: 'bp-hero-aurora', 'aria-hidden': 'true' }),
      React.createElement(TopHeader, { calendarName, onOpenSearch, onOpenMore }),
      React.createElement(RenewalHero, { meetings: calendarContext.upcomingMeetings, calendar: calendarContext.calendar, onSelectDate: onOpenDate })
    ),

    React.createElement(HomeActivitySummary, {
      calendarContext: {
        ...calendarContext,
        displayChatMessages: recordsContext?.mediaProps?.chatMessages,
        memos: recordsContext?.memoProps?.memos,
        places: recordsContext?.placesProps?.calendar?.places,
        galleryPhotoIndex: recordsContext?.mediaProps?.indexedPhotos ? { items: recordsContext.mediaProps.indexedPhotos } : null,
        setActiveLightbox: recordsContext?.mediaProps?.setActiveLightbox
      },
      onOpenDate,
      onChangeView
    }),
    React.createElement('footer', { className: bentoClass('renewal-home-footer footer') },
      React.createElement('span', null, 'Copyright © 2026 모여라 캘린더. All Rights Reserved.'),
      React.createElement('span', { className: bentoClass('renewal-home-footer-links links') },
        React.createElement('b', null, 'FAMILY LINK'), React.createElement('b', null, '밖에눈오나'), React.createElement('b', null, 'Culture Flow')
      )
    )
  );
}

// Home summary cards (채팅/메모/갤러리/장소) reuse the exact same 채팅/메모/갤러리/장소
// glyphs as the side-nav (TABLER_ICONS, above). Always renders the off/outline variant: these
// are static section headings, not on/off toggles, and the badge's own solid color fill (white
// icon on a colored gradient square, see .bp-bento-card-icon in design.css) already carries the
// visual "this section" identity.
function HomeSectionIcon({ kind }) {
  const React = window.React;
  const def = TABLER_ICONS[kind] || TABLER_ICONS.chat;
  return React.createElement('svg', {
    width: 15, height: 15, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': 'true',
    style: { display: 'block', shapeRendering: 'geometricPrecision' },
    dangerouslySetInnerHTML: { __html: def.off },
  });
}

/**
 * Module-scoped so React keeps a stable component type across parent re-renders.
 * Defining this inside HomeActivitySummary remounted every section on each render and
 * replayed bp-rise-in (enter), which looked like 채팅/메모/갤러리/장소 flickering while scrolling.
 */
function HomeSummarySection({ title, kind, children, onMore, delay }) {
  const React = window.React;
  return React.createElement('div', {
    className: bentoClass(`renewal-home-summary-section bento-card wide enter is-${kind}${kind === 'gallery' ? ' gallery-bleed' : ''}`),
    style: delay ? { animationDelay: delay } : undefined,
  },
    React.createElement('div', { className: bentoClass('renewal-home-summary-heading bento-card-head') },
      React.createElement('span', { className: bentoClass('renewal-home-summary-heading-icon bento-card-icon') }, React.createElement(HomeSectionIcon, { kind })),
      React.createElement('span', { className: bentoClass('bento-card-title') }, title),
      onMore && React.createElement('button', { type: 'button', className: bentoClass('more-link'), onClick: onMore }, '전체보기')
    ), children);
}

/** 클로드 목업의 홈 요약 흐름을 기존 로드 상태로 구현한다. 전체 목록을 추가 조회하지 않는다. */
function HomeActivitySummary({ calendarContext, onOpenDate, onChangeView }) {
  const React = window.React;
  const allMessages = Array.isArray(calendarContext?.displayChatMessages) ? calendarContext.displayChatMessages : [];
  // Match the legacy main-screen CommentsSection: preserve the live feed order, remove
  // gallery/meeting upload documents, then show the latest three rows. The previous V2
  // implementation promoted whichever image happened to be newest, which could surface a
  // gallery image instead of the same text/image/text sequence as the original.
  const meetingPhotoMessageIds = React.useMemo(
    () => getMeetingOwnedPhotoMessageIds(calendarContext?.calendar),
    [calendarContext?.calendar]
  );
  const messages = React.useMemo(() => {
    const visibleMessages = allMessages.filter(message => isChatRenderableMessage(message, meetingPhotoMessageIds));
    return visibleMessages.slice(-3);
  }, [allMessages, meetingPhotoMessageIds]);
  const memoItems = calendarContext?.memos;
  const memos = React.useMemo(
    () => (Array.isArray(memoItems) ? latestRows(memoItems).slice(0, 2) : []),
    [memoItems]
  );
  const photoItems = calendarContext?.galleryPhotoIndex?.items;
  const photos = React.useMemo(() => (Array.isArray(photoItems)
    ? photoItems
      .filter(photo => !isMemeKeyboardPhotoEntry(photo))
      .slice()
      .sort((a, b) => {
        const aTime = timestampMs(a?.timestamp ?? a?.createdAt ?? a?.updatedAt ?? a?.uploadedAt ?? a?.messageTimestamp);
        const bTime = timestampMs(b?.timestamp ?? b?.createdAt ?? b?.updatedAt ?? b?.uploadedAt ?? b?.messageTimestamp);
        return bTime - aTime || String(b?.id || b?.mediaKey || '').localeCompare(String(a?.id || a?.mediaKey || ''));
      })
      .slice(0, 9)
    : []), [photoItems]);
  const placeItems = calendarContext?.places;
  const places = React.useMemo(
    () => (Array.isArray(placeItems) ? latestRows(placeItems).slice(0, 2) : []),
    [placeItems]
  );
  const participants = Array.isArray(calendarContext?.calendar?.participants) ? calendarContext.calendar.participants : [];
  const participantFor = row => participants.find(p => p && (p.id === row?.participantId || p.name === row?.senderName || p.name === row?.author));
  const displayName = row => authorFor(row, participants).name;
  const displayColor = row => authorFor(row, participants).color;
  const dateValue = value => new Date(timestampMs(value) || NaN);
  const formatTime = value => {
    const d = dateValue(value);
    return Number.isNaN(d.getTime()) ? '' : d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false });
  };
  const formatShortDateTime = value => {
    const d = dateValue(value);
    return Number.isNaN(d.getTime()) ? '' : `${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}(${['일','월','화','수','목','금','토'][d.getDay()]}) ${formatTime(value)}`;
  };
  return React.createElement('div', { className: bentoClass('renewal-home-summary bento-grid') },
    React.createElement('div', { className: bentoClass('renewal-home-summary-section bento-card wide enter'), style: { animationDelay: '0.04s' } },
      React.createElement(BentoCalendarCard, { calendarContext, onSelectDate: onOpenDate })
    ),
    React.createElement(HomeSummarySection, { title: '채팅', kind: 'chat', delay: '0.08s', onMore: () => onChangeView?.('chat') },
      messages.length ? React.createElement('div', { className: bentoClass('renewal-home-chat-list') }, messages.map((m, i) => {
        const image = m.thumbUrl || (Array.isArray(m.thumbUrls) && m.thumbUrls[0]) || m.imageUrl || (Array.isArray(m.imageUrls) && m.imageUrls[0]);
        return React.createElement('button', { type: 'button', className: bentoClass(`renewal-home-chat-item chat-row${image ? ' has-image' : ''}`), key: m.id || i, onClick: () => onChangeView?.('chat') },
          React.createElement(NameColorPill, { className: bentoClass('renewal-home-chat-name chat-name-pill'), name: displayName(m), color: displayColor(m) }),
          React.createElement('span', { className: bentoClass('renewal-home-chat-content chat-content') },
            image && React.createElement('img', { className: bentoClass('renewal-home-chat-image chat-img'), src: image, alt: '', loading: 'lazy' }),
            m.replyTo && React.createElement(ReplyQuote, {
              className: bentoClass('renewal-home-chat-reply chat-reply-quote'),
              author: shortParticipantName(m.replyTo.senderName || participantFor(m.replyTo)?.name || '답장'),
              text: m.replyTo.text || '사진',
            }),
            (m.text || m.content) && React.createElement('span', { className: bentoClass('renewal-home-chat-text chat-text') }, String(m.text || m.content).slice(0, 120)),
            React.createElement('span', { className: bentoClass('renewal-home-chat-time chat-meta') }, image ? formatShortDateTime(m.timestamp ?? m.createdAt) : formatTime(m.timestamp ?? m.createdAt))
          )
        );
      })) : React.createElement('p', { className: bentoClass('renewal-home-empty') }, '최근 대화가 없습니다.')
    ),
        React.createElement(HomeSummarySection, { title: '메모', kind: 'memo', delay: '0.12s', onMore: () => onChangeView?.('memo') },
      memos.length ? React.createElement('div', { className: `${bentoClass('renewal-home-memo-list')} v2-bubble-memo-list` }, memos.map((memo, i) => {
        const preview = memo.linkPreview || (Array.isArray(memo.linkPreviews) && memo.linkPreviews[0]);
        const tags = Array.isArray(memo.tags) ? memo.tags.slice(0, 3) : [];
        const memoMeta = formatShortDateTime(memo.updatedAt ?? memo.createdAt);
        // 홈 화면에서 "지금 어디서 활동이 일어나는지" 바로 보여야 바로 피드백을 달아줄 수 있다는
        // 요구사항 -- 메모에 댓글이 달리면 최신 댓글을 미리보기로 바로 노출한다(전체보기 없이도
        // 반응이 왔다는 걸 즉시 알 수 있게).
        const memoComments = Array.isArray(memo.comments) ? memo.comments : [];
        const latestComment = memoComments.length ? memoComments[memoComments.length - 1] : null;
        return React.createElement(ChatBubbleFrame, {
          key: memo.id || i,
          name: displayName(memo),
          color: displayColor(memo),
          meta: memoMeta,
          className: 'v2-home-memo-bubble',
          surfaceAs: 'button',
          surfaceProps: {
            type: 'button',
            className: 'v2-home-memo-bubble-surface',
            style: { '--renewal-memo-author': displayColor(memo), '--memo-author-color': displayColor(memo) },
            onClick: () => onChangeView?.('memo'),
          },
        },
          React.createElement('strong', { className: 'v2-bubble-title' }, memo.title || '메모'),
          React.createElement('span', { className: 'v2-bubble-summary' }, String(memo.text || memo.content || memo.description || '').slice(0, 170)),
          preview && React.createElement('span', { className: 'v2-bubble-preview' },
            preview.image && React.createElement('img', { src: preview.image, alt: '', loading: 'lazy' }),
            React.createElement('span', null,
              React.createElement('strong', { className: bentoClass('memo-link-title') }, preview.title || '링크 미리보기'),
              React.createElement('small', { className: bentoClass('memo-link-desc') }, preview.description || preview.url || '')
            )
          ),
          tags.length ? React.createElement('span', { className: 'v2-bubble-tags' },
            tags.map(tag => React.createElement('em', { className: 'v2-bubble-tag', key: tag }, `#${String(tag).replace(/^#/, '')}`))
          ) : null,
          latestComment && React.createElement('span', { className: 'v2-bubble-comment-preview' },
            React.createElement(NameColorPill, { className: 'v2-bubble-comment-author', name: participantFor(latestComment)?.name || '댓글', color: participantFor(latestComment)?.color }),
            React.createElement('span', { className: 'v2-bubble-comment-text' }, String(latestComment.text || '').slice(0, 90)),
            memoComments.length > 1 ? React.createElement('em', { className: 'v2-bubble-comment-count' }, `댓글 ${memoComments.length}개`) : null
          )
        );
      })) : React.createElement('p', { className: bentoClass('renewal-home-empty') }, '최근 메모가 없습니다.')
    ),
    React.createElement(HomeSummarySection, { title: '갤러리', kind: 'gallery', delay: '0.16s', onMore: () => onChangeView?.('gallery') },
      photos.length ? React.createElement('div', { className: bentoClass('renewal-home-photo-strip thumb-grid') }, photos.map((photo, i) => React.createElement('button', {
        type: 'button',
        className: bentoClass(`thumb ${photo.commentCount > 0 ? 'gallery-comment-heartbeat' : ''}`.trim()),
        key: photo.id || photo.mediaKey || i,
        onClick: () => calendarContext.setActiveLightbox?.(photoLightbox(photo, photos)),
        style: photo.commentCount > 0 ? galleryCommentMotion(photo, i) : undefined,
        'aria-label': `사진 ${i + 1} 크게 보기`
      },
        React.createElement('img', { src: photo.thumb || photo.thumbnailUrl || photo.thumbUrl || photo.full || photo.url || photo.imageUrl || photo.downloadURL, alt: '', loading: 'lazy', decoding: 'async' }),
        photo.commentCount > 0 ? React.createElement('span', { className: bentoClass('comment-badge') }, photo.commentCount) : null
      ))) : React.createElement('p', { className: bentoClass('renewal-home-empty') }, '등록된 사진이 없습니다.')
    ),
    React.createElement(HomeSummarySection, { title: '장소', kind: 'places', delay: '0.20s', onMore: () => onChangeView?.('places') },
      places.length ? React.createElement('div', { className: bentoClass('renewal-home-place-list') }, places.map((place, i) => React.createElement('button', { type: 'button', className: bentoClass('renewal-home-place-card place-row'), key: place.id || i, onClick: () => onChangeView?.('places') },
        React.createElement('span', { className: bentoClass('renewal-home-place-copy') },
          React.createElement('span', { className: bentoClass('renewal-home-place-tags place-tags') },
            React.createElement('em', { className: bentoClass('place-tag'), style: { background: '#F1F5F9', color: 'var(--text-muted)' } }, place.categoryName || ({ restaurant: '식당', food: '식당', cafe: '카페', play: '놀이', lodging: '숙박', shopping: '쇼핑', other: '기타' }[place.categoryId]) || '기타'),
            React.createElement('em', {
              className: bentoClass(`place-tag ${place.visitStatus === 'planned' ? 'is-planned' : 'is-visited'}`),
              style: place.visitStatus === 'planned'
                ? { background: 'var(--brand-soft)', color: 'var(--brand)' }
                : { background: '#ECFDF5', color: 'var(--status-green)' }
            }, place.visitStatus === 'planned' ? '방문예정' : '방문')
          ),
          React.createElement('strong', { className: bentoClass('place-name') }, place.name || place.title || '저장한 장소'),
          React.createElement('small', { className: bentoClass('place-addr') }, place.address || place.description || ''),
          place.memo && React.createElement('small', { className: bentoClass('renewal-home-place-note place-note') }, String(place.memo).split('\n')[0].slice(0, 90))
        )
      ))) : React.createElement('p', { className: bentoClass('renewal-home-empty') }, '저장한 장소가 없습니다.')
    )
  );
}

/**
 * Shared date detail modal (WP-05): lives at `RenewalAppShell` level so 캘린더 and 정산 both open
 * the exact same instance instead of each tab duplicating it (WP-03 originally nested this inside
 * `CalendarPane` alone; lifted out once 정산 needed the same "click a date, see its detail" flow).
 */
function SharedDateModal({ calendarContext, dateModalDate, initialTab = null, onClose, onSelectDate, onEditAnniversary, onAddAnniversaryForDate, onFocusCultureSource }) {
  const React = window.React;
  const { DateModal } = bindUiComponentAliases(React);
  return React.createElement(DateModal, {
    ...calendarContext.dateModalProps,
    dateStr: dateModalDate,
    initialTab,
    shellChrome: 'bento',
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
    setIsChatShareOpen,
  } = deps || {};
  return {
    calendar: activeCal,
    showToast,
    isChatShareOpen: false,
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
function ChatPane({ chatContext, onChangeView, onOpenAppSettings, onOpenSideNav, onRegisterMenuActions }) {
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
    // The chat chunk is loaded lazily, but this is a route transition rather than a
    // data-loading state. Showing a full-page Korean loading message here made every
    // visit from another subpage look stalled (and differed from v1). Keep the shell
    // visually quiet while the chunk mounts; errors are still surfaced by the toast.
    return React.createElement('div', { className: 'renewal-shell-loading-surface', 'aria-busy': 'true' });
  }
  const { ChatRoomView, ShareModal } = bindUiComponentAliases(React);
  return React.createElement(React.Fragment, null,
    React.createElement(ChatRoomView, {
      ...chatContext.chatRoomProps,
      renderV2: (props) => renderChatScreen({ ...props, onMenu: onOpenSideNav || props.onMenu }),
      onBack: () => onChangeView('calendar'),
      onOpenGallery: () => onChangeView('gallery'),
      onChangeView,
      onShare: chatContext.onOpenChatShare,
      onOpenAppSettings,
      onRegisterMenuActions,
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
    editingSettlementCard, setEditingSettlementCard, setIsShareOpen,
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
    isShareOpen: false,
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
function SettlementPane({ settlementContext, onChangeView, onOpenAppSettings, onOpenDate, onOpenSideNav, onRegisterMenuActions }) {
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
      renderV2: (props) => renderSettlementScreen({ ...props, onMenu: onOpenSideNav || props.onMenu }),
      onBack: () => onChangeView('calendar'),
      onSelectDate: onOpenDate,
      onOpenShare: settlementContext.onOpenShare,
      onOpenAppSettings,
      onChangeView,
      onRegisterMenuActions,
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
  const isLoading = /불러오는 중|로딩/.test(String(title || ''));
  return React.createElement('div', { className: 'renewal-shell-placeholder' },
    isLoading && React.createElement('span', { className: 'renewal-shell-loading-spinner', role: 'status', 'aria-label': '불러오는 중' }),
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
    subtitle: withCalendarPrefix(calendarName, '이 기능은 준비가 끝나는 대로 이 화면에서 제공됩니다.'),
  });
}

/** 기록 > 전체: 이미 로드된 데이터만 사용하는 빠른 요약 허브. */
function RecordsOverviewPane({ recordsContext, calendarName, onSelectSubTab, onChangeView }) {
  const React = window.React;
  const memoCount = Array.isArray(recordsContext?.memoProps?.memos) ? recordsContext.memoProps.memos.length : 0;
  const mediaCount = Array.isArray(recordsContext?.mediaProps?.indexedPhotos) ? recordsContext.mediaProps.indexedPhotos.length : 0;
  const placeCount = Array.isArray(recordsContext?.placesProps?.calendar?.places) ? recordsContext.placesProps.calendar.places.length : 0;
  const cards = [
    { id: 'memo', label: '메모', count: memoCount, icon: '📝', hint: '날짜와 태그로 정리된 메모', firstClass: true },
    { id: 'media', label: '사진·영상', count: mediaCount, icon: '🖼️', hint: '모임과 대화에 연결된 미디어' },
    { id: 'places', label: '장소', count: placeCount, icon: '📍', hint: '저장한 장소와 방문 기록', firstClass: true },
    { id: 'archive', label: '보관함', count: Array.isArray(recordsContext?.historyProps?.anniversaries) ? recordsContext.historyProps.anniversaries.length : 0, icon: '🗂️', hint: '기념일과 추억 모음' },
  ];
  const openCard = (card) => {
    if (card.firstClass && typeof onChangeView === 'function') onChangeView(card.id);
    else onSelectSubTab(card.id);
  };
  return React.createElement('section', { className: 'renewal-records-overview v2-records-overview', 'aria-label': '기록 요약' },
    React.createElement('div', { className: 'renewal-shell-section-title' }, calendarName ? `${calendarName} 기록` : '기록 요약'),
    React.createElement('p', { className: 'renewal-records-overview-subtitle' }, '메모·장소는 독립 페이지, 사진·보관함은 기록 허브에서 이어집니다.'),
    React.createElement('div', { className: 'renewal-records-overview-grid' }, cards.map(card =>
      React.createElement('button', { key: card.id, type: 'button', className: 'renewal-records-overview-card', onClick: () => openCard(card) },
        React.createElement('span', { className: 'renewal-records-overview-icon', 'aria-hidden': 'true' }, card.icon),
        React.createElement('span', { className: 'renewal-records-overview-card-main' },
          React.createElement('span', { className: 'renewal-records-overview-card-label' }, card.label),
          React.createElement('span', { className: 'renewal-records-overview-card-count' }, `${card.count}개`),
          React.createElement('span', { className: 'renewal-records-overview-card-hint' }, card.hint)
        ),
        React.createElement('span', { className: 'renewal-records-overview-arrow', 'aria-hidden': 'true' }, '›')
      )
    ))
  );
}

/**
 * 기록 tab body: a sub-tab chip row (전체/메모/사진·영상/장소/보관함/콘텐츠) over the same
 * EmptyState, keyed by sub-tab so switching filters visibly changes something even before WP-06
 * wires real data in. This is the one tab with a second level of navigation because it alone
 * absorbs 5 old screens (docs/design-renewal-handoff.md §2) -- the other 4 tabs stay flat.
 */
/**
 * Builds the 기록 tab's real ingredients (WP-06 continuation, 사진·영상 + 보관함 + 장소 + 메모
 * subtabs). Straight pass-through of the same values/handlers `app-main.js`'s own
 * `activeView === 'gallery'` / `activeView === 'history'` / `activeView === 'places'` /
 * `activeView === 'memo'` render blocks already use -- `ChatGalleryModal` itself is unchanged,
 * just rendered with `asPage: true` the same way the original call site does for its full-page
 * (non-modal) form; person-tag management, travel-memory group hide/restore/remove, photo
 * comments, the shared gallery photo index (`galleryPhotoIndex`), place save/delete/search, and
 * the memo list/share/tag-filter pass-throughs, all pre-existing. `onLoadMoreMemos` is composed in
 * `app-main.js`'s own adapter call (it needs `MEMOS_PAGE_SIZE`, a module-level constant only in
 * scope there) and handed through already-built.
 */
export function buildRenewalRecordsContext(calendar, deps) {
  const {
    handleRegisterCultureEvent, handleUnregisterCultureEvent, handleQuickSaveCultureMemo,
    customCultureItems, handleSaveCustomCultureItem,
    activeCal, galleryChatMessages, galleryMemos, showToast, showConfirmDialog,
    handleUploadGalleryImages, handleAddGalleryLink, handleAddGalleryFiles, handleDeleteGalleryFiles,
    handleDeleteGalleryLinks, handlePasteGatherPhoto, handlePasteGatherPhotos,
    setActiveLightbox, handleDeletePhoto, photoCommentCounts, galleryPhotoIndex,
    hasMoreOlderChat, fullChatMessages, loadingOlderChat, loadOlderChatMessages,
    hasMoreMemos, setMemosLimit, MEMOS_PAGE_SIZE,
    isDarkTheme, toggleTheme, fontScalePercent, setFontScalePercent,
    mainNotifPermission, mainChatNotifyEnabled, handleMainToggleNotifications,
    syncStatus, isGalleryShareOpen, setIsGalleryShareOpen,
    isHistoryShareOpen, setIsHistoryShareOpen,
    handleAddPersonTag, handleRenamePersonTag, handleDeletePersonTag,
    anniversaries, historyMemosSnapshot,
    handlePromoteInlineChatImage, handleSaveImageTags, handleSearchTag,
    handleReplacePhoto,
    handleJumpToChatMessage, handleJumpToMemo, handleJumpToMeetingDate,
    handleGetChatMessageOrdinal, handleGetGalleryPhotoOrdinal,
    handleRemovePhotoFromTravelMemory, handleRemovePhotosFromTravelMemory,
    handleHideMemoryGroup, handleRestoreMemoryGroup, handleAddPhotosBackToTravelMemory,
    handleFetchPhotoComments, handleSavePhotoComments, handleFetchMeetingPhotoIndex,
    handleSavePlace, handleDeletePlace,
    placesInitialQuery, setPlacesInitialQuery, placesInitialFocusId, setPlacesInitialFocusId,
    isPlacesShareOpen, setIsPlacesShareOpen,
    memos, totalMemoCount, onLoadMoreMemos, sharedMemo, setSharedMemo, chatMessages,
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
    mediaProps: {
      calendar: activeCal,
      chatMessages: galleryChatMessages, memos: galleryMemos,
      asPage: true,
      onUploadImages: handleUploadGalleryImages, onAddLink: handleAddGalleryLink,
      onAddFiles: handleAddGalleryFiles, onDeleteFiles: handleDeleteGalleryFiles,
      onDeleteGalleryLinks: handleDeleteGalleryLinks,
      onRequestConfirm: showConfirmDialog,
      onPasteGatherPhoto: handlePasteGatherPhoto, onPasteGatherPhotos: handlePasteGatherPhotos,
      setActiveLightbox, onDeletePhoto: handleDeletePhoto, photoCommentCounts,
      indexedPhotos: galleryPhotoIndex && galleryPhotoIndex.status === 'ready'
        ? galleryPhotoIndex.items
        : (galleryPhotoIndex && galleryPhotoIndex.status === 'fallback' ? null : []),
      indexedPhotoStatus: galleryPhotoIndex ? galleryPhotoIndex.status : undefined,
      indexedPhotoTotal: galleryPhotoIndex && galleryPhotoIndex.status === 'ready' ? galleryPhotoIndex.total : null,
      indexedPhotoPage: galleryPhotoIndex ? galleryPhotoIndex.page : undefined,
      indexedPhotoLoading: galleryPhotoIndex ? galleryPhotoIndex.loading : undefined,
      indexedPhotoComplete: galleryPhotoIndex ? galleryPhotoIndex.complete : undefined,
      onIndexedPhotoPageChange: galleryPhotoIndex ? galleryPhotoIndex.loadPage : undefined,
      onIndexedPhotoLoadAll: galleryPhotoIndex ? galleryPhotoIndex.loadAll : undefined,
      hasMoreOlderChat: !Array.isArray(fullChatMessages) && hasMoreOlderChat,
      loadingOlderChat, onLoadOlderChat: loadOlderChatMessages,
      hasMoreMemos, onLoadMoreMemos: () => { if (typeof setMemosLimit === 'function') setMemosLimit(prev => prev + MEMOS_PAGE_SIZE); },
      isDarkTheme, onToggleTheme: toggleTheme, fontScalePercent,
      onDecreaseFont: () => setFontScalePercent(prev => Math.max(80, prev - 10)),
      onIncreaseFont: () => setFontScalePercent(prev => Math.min(130, prev + 10)),
      isChatNotifyEnabled: mainNotifPermission === 'granted' && mainChatNotifyEnabled,
      onToggleChatNotifications: handleMainToggleNotifications,
      showToast, syncStatus,
    },
    isGalleryShareOpen: !!isGalleryShareOpen,
    onOpenGalleryShare: () => { if (requireLoadedCalendar('Firebase 데이터를 불러온 뒤 공유 정보를 확인해 주세요.')) setIsGalleryShareOpen(true); },
    onCloseGalleryShare: () => setIsGalleryShareOpen(false),
    historyProps: {
      calendar: activeCal,
      isDarkTheme, onToggleTheme: toggleTheme, fontScalePercent,
      onDecreaseFont: () => setFontScalePercent(prev => Math.max(80, prev - 10)),
      onIncreaseFont: () => setFontScalePercent(prev => Math.min(130, prev + 10)),
      isChatNotifyEnabled: mainNotifPermission === 'granted' && mainChatNotifyEnabled,
      onToggleChatNotifications: handleMainToggleNotifications,
      syncStatus,
      onAddPersonTag: handleAddPersonTag, onRenamePersonTag: handleRenamePersonTag, onDeletePersonTag: handleDeletePersonTag,
      anniversaries, chatMessages: galleryChatMessages, memos: historyMemosSnapshot, setActiveLightbox,
      showToast, onPromoteImageUrl: handlePromoteInlineChatImage, onSaveImageTags: handleSaveImageTags, onSearchTag: handleSearchTag,
      onDeletePhoto: handleDeletePhoto, onReplacePhoto: handleReplacePhoto,
      onJumpToChatMessage: handleJumpToChatMessage, onJumpToMemo: handleJumpToMemo, onJumpToMeetingDate: handleJumpToMeetingDate,
      onGetChatMessageOrdinal: handleGetChatMessageOrdinal, onGetGalleryPhotoOrdinal: handleGetGalleryPhotoOrdinal,
      onRequestConfirm: showConfirmDialog,
      onRemovePhotoFromMemory: handleRemovePhotoFromTravelMemory, onRemovePhotosFromMemory: handleRemovePhotosFromTravelMemory,
      onHideMemoryGroup: handleHideMemoryGroup, onRestoreMemoryGroup: handleRestoreMemoryGroup,
      onAddPhotosBackToMemory: handleAddPhotosBackToTravelMemory,
      onFetchPhotoComments: handleFetchPhotoComments, onSavePhotoComments: handleSavePhotoComments,
      onFetchMeetingPhotoIndex: handleFetchMeetingPhotoIndex,
      indexedPhotos: galleryPhotoIndex ? galleryPhotoIndex.items : [],
      indexedPhotoComplete: galleryPhotoIndex ? galleryPhotoIndex.complete : false,
      onIndexedPhotoLoadAll: galleryPhotoIndex ? galleryPhotoIndex.loadAll : undefined,
      photoCommentCounts,
    },
    isHistoryShareOpen: !!isHistoryShareOpen,
    onOpenHistoryShare: () => { if (requireLoadedCalendar('Firebase 데이터를 불러온 뒤 공유 정보를 확인해 주세요.')) setIsHistoryShareOpen(true); },
    onCloseHistoryShare: () => setIsHistoryShareOpen(false),
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
 * 사진·영상 subtab body (WP-06 continuation): the real `ChatGalleryModal` in its `asPage: true`
 * form, same pass-through approach as `MemoPane`. `ChatGalleryModal` ships in the SAME lazy-loaded
 * chunk as `ChatRoomView` (`window.__gatherLoadChatUi`), so this waits for that chunk before
 * rendering -- identical "wait-then-open" step `ChatPane` already uses.
 */
function MediaPane({ recordsContext, calendarName, onChangeView, onOpenAppSettings, onOpenSideNav, onRegisterMenuActions }) {
  const React = window.React;
  const [loaded, setLoaded] = React.useState(() => !!(window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.ChatGalleryModal));
  React.useEffect(() => {
    if (loaded) return undefined;
    if (typeof window.__gatherLoadChatUi !== 'function') { setLoaded(true); return undefined; }
    let cancelled = false;
    window.__gatherLoadChatUi().then(() => { if (!cancelled) setLoaded(true); }).catch(err => {
      console.error('Gallery UI load failed:', err);
      if (typeof recordsContext.showToast === 'function') recordsContext.showToast('갤러리 화면을 불러오지 못했습니다. 다시 시도해 주세요.', 'error');
    });
    return () => { cancelled = true; };
  }, [loaded]);
  if (!loaded) {
    return React.createElement(EmptyState, { title: '사진·영상 불러오는 중', subtitle: '잠시만 기다려 주세요.' });
  }
  const { ChatGalleryModal, ShareModal } = bindUiComponentAliases(React);
  const galleryView = React.createElement(ChatGalleryModal, {
    ...recordsContext.mediaProps,
    onClose: () => onChangeView('calendar'),
    onOpenShare: recordsContext.onOpenGalleryShare,
    onOpenAppSettings,
    v2Embed: true,
    onRegisterMenuActions,
  });
  return React.createElement(React.Fragment, null,
    React.createElement('div', { className: 'v2-records-media' },
      renderGalleryScreen({
        legacyView: galleryView,
        subtitle: calendarName || undefined,
        onBack: () => onChangeView('calendar'),
        onShare: recordsContext.onOpenGalleryShare,
        onMenu: onOpenSideNav || onOpenAppSettings,
        onSearch: () => clickLegacyAriaButton('갤러리 검색', '.v2-gallery'),
        slots: {},
      })
    ),
    recordsContext.isGalleryShareOpen && React.createElement(ShareModal, {
      calendar: recordsContext.calendar, shareType: 'gallery', showToast: recordsContext.showToast,
      onClose: recordsContext.onCloseGalleryShare,
    })
  );
}


/** Click still-mounted legacy header search (parent may be display:none under V2 PageHeader).
 * Scope to legacy page headers so we do not re-click the V2 PageHeader IconButton (same aria-label).
 * Content/Archive use .places-view-header; Gallery uses .gallery-page-header. */
function clickLegacyAriaButton(ariaLabel, scopeSelector) {
  const scope = (scopeSelector && document.querySelector(scopeSelector)) || document;
  const btn = scope.querySelector(`.places-view-header button[aria-label="${ariaLabel}"]`)
    || scope.querySelector(`.gallery-page-header button[aria-label="${ariaLabel}"]`);
  if (btn) btn.click();
}

/** 콘텐츠 subtab body (WP-06 continuation): the existing ContentView with unchanged app-main props. */
function ContentPane({ recordsContext, calendarName, onChangeView, onOpenAppSettings, onOpenSideNav, onRegisterMenuActions }) {
  const React = window.React;
  const { ContentView } = bindUiComponentAliases(React);
  const contentView = React.createElement(ContentView, {
    ...recordsContext.contentProps,
    onBack: () => onChangeView('calendar'),
    onOpenAppSettings,
    v2Embed: true,
    onRegisterMenuActions,
  });
  return renderContentScreen({
    legacyView: contentView,
    subtitle: calendarName || undefined,
    onBack: () => onChangeView('calendar'),
    onMenu: onOpenSideNav || onOpenAppSettings,
    onSearch: () => clickLegacyAriaButton('컨텐츠 검색', '.v2-content'),
    slots: {},
  });
}

/**
 * 보관함 subtab body (WP-06 continuation): the real `HistoryView`, same pass-through approach as
 * `MemoPane`/`PlacesPane`. Unlike those two, `HistoryView` ships in `ui-summary-gallery.js`, which
 * is eagerly imported at boot (same reason `CalendarGrid`/`PollList` needed no lazy-load wait), so
 * no "wait for the chunk" step is needed here.
 *
 * Owns its own local date-detail-modal state (like `PlacesPane`'s) rather than depending on
 * WP-07's (not yet merged) shared date-modal lift -- see `PlacesPane`'s doc comment for the full
 * reasoning. `calendarContext` is threaded down through `RecordsPane` just for
 * `dateModalProps`'s data/handlers.
 */
function HistoryPane({ recordsContext, calendarContext, calendarName, onChangeView, onOpenAppSettings, onOpenSideNav, onEditAnniversary, onAddAnniversaryForDate, onFocusCultureSource, onRegisterMenuActions }) {
  const React = window.React;
  const [historyDateModalDate, setHistoryDateModalDate] = React.useState(null);
  const { HistoryView, ShareModal, DateModal } = bindUiComponentAliases(React);
  const historyView = React.createElement(HistoryView, {
    ...recordsContext.historyProps,
    onBack: () => onChangeView('calendar'),
    onSelectDate: (dateStr) => setHistoryDateModalDate(dateStr),
    onOpenShare: recordsContext.onOpenHistoryShare,
    onOpenAppSettings,
    v2Embed: true,
    onRegisterMenuActions,
  });
  return React.createElement(React.Fragment, null,
    renderArchiveScreen({
      legacyView: historyView,
      subtitle: calendarName || undefined,
      onBack: () => onChangeView('calendar'),
      onShare: recordsContext.onOpenHistoryShare,
      onMenu: onOpenSideNav || onOpenAppSettings,
      onSearch: () => clickLegacyAriaButton('보관함 검색', '.v2-archive'),
      slots: {},
    }),
    recordsContext.isHistoryShareOpen && React.createElement(ShareModal, {
      calendar: recordsContext.calendar, shareType: 'history', showToast: recordsContext.showToast,
      onClose: recordsContext.onCloseHistoryShare,
    }),
    historyDateModalDate && React.createElement(DateModal, {
      ...calendarContext.dateModalProps,
      dateStr: historyDateModalDate,
      shellChrome: 'bento',
      initialTab: null,
      onClose: () => setHistoryDateModalDate(null),
      onParticipantClick: (name, dateStr) => { if (dateStr) setHistoryDateModalDate(dateStr); },
      onEditAnniversary,
      onAddAnniversaryForDate: (d) => { setHistoryDateModalDate(null); onAddAnniversaryForDate(d); },
      onFocusCultureSource: () => onFocusCultureSource(),
    })
  );
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
function PlacesPane({ recordsContext, calendarContext, onChangeView, onOpenAppSettings, onOpenSideNav, onEditAnniversary, onAddAnniversaryForDate, onFocusCultureSource, onRegisterMenuActions }) {
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
      renderV2: (props) => renderPlacesScreen({ ...props, onMenu: onOpenSideNav || props.onMenu }),
      onBack: () => onChangeView('calendar'),
      onSelectDate: (dateStr) => {
        const canonicalDate = normalizePlaceDateForSort(dateStr);
        if (canonicalDate) setPlaceDateModalDate(canonicalDate);
      },
      onSharePlaces: recordsContext.onOpenPlacesShare,
      onOpenAppSettings,
      onRegisterMenuActions,
    }),

    recordsContext.isPlacesShareOpen && React.createElement(ShareModal, {
      calendar: recordsContext.calendar, shareType: 'places', showToast: recordsContext.showToast,
      onClose: recordsContext.onClosePlacesShare,
    }),
    placeDateModalDate && React.createElement(DateModal, {
      ...calendarContext.dateModalProps,
      dateStr: placeDateModalDate,
      shellChrome: 'bento',
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
function MemoPane({ recordsContext, onChangeView, onOpenAppSettings, onOpenSideNav, onRegisterMenuActions }) {
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
      renderV2: (props) => renderMemoScreen({ ...props, onMenu: onOpenSideNav || props.onMenu }),
      onBack: () => onChangeView('calendar'),
      onOpenShare: recordsContext.onOpenMemoShare,
      onOpenAppSettings,
      onRegisterMenuActions,
    }),

    recordsContext.isMemoShareOpen && React.createElement(ShareModal, {
      calendar: recordsContext.calendar, shareType: 'memo', showToast: recordsContext.showToast,
      onClose: recordsContext.onCloseMemoShare,
    })
  );
}

function RecordsPane({ subTab, onSelectSubTab, calendarName, recordsContext, calendarContext, onChangeView, onOpenAppSettings, onOpenSideNav, onEditAnniversary, onAddAnniversaryForDate, onFocusCultureSource, onRegisterMenuActions }) {
  const React = window.React;
  // Memo/Places are first-class destinations — never show renewal-shell-subtab chrome for them.
  React.useEffect(() => {
    if (subTab === 'memo') onChangeView('memo');
    else if (subTab === 'places') onChangeView('places');
  }, [subTab]);
  // Gallery/Content/Archive are selected from the side-nav — the records subtab strip
  // (전체/사진·영상/보관함/콘텐츠) is redundant IA when those destinations are already active.
  // Keep the strip only for the 전체 hub overview.
  const hideSubtabStrip = subTab === 'media' || subTab === 'content' || subTab === 'archive';
  return React.createElement('div', { className: `v2-records-frame${hideSubtabStrip ? ' v2-records-no-subtab' : ''}`.trim() },
    hideSubtabStrip
      ? null
      : React.createElement('div', { className: 'renewal-shell-subtab-row', role: 'tablist', 'aria-label': '기록 필터' },
          RECORDS_SUBTABS.map(t => React.createElement('button', {
            key: t.id,
            type: 'button',
            role: 'tab',
            'aria-selected': subTab === t.id,
            className: `renewal-shell-subtab-item ${subTab === t.id ? 'is-active' : ''}`.trim(),
            onClick: () => onSelectSubTab(t.id),
          }, t.label))
        ),
    React.createElement('div', { className: 'v2-records-body' },
    subTab === 'media'
      ? React.createElement(MediaPane, { recordsContext, calendarName, onChangeView, onOpenAppSettings, onOpenSideNav, onRegisterMenuActions })
      : subTab === 'content'
      ? React.createElement(ContentPane, { recordsContext, calendarName, onChangeView, onOpenAppSettings, onOpenSideNav, onRegisterMenuActions })
      : subTab === 'all'
      ? React.createElement(RecordsOverviewPane, { recordsContext, calendarName, onSelectSubTab, onChangeView })
      : subTab === 'archive'
      ? React.createElement(HistoryPane, { recordsContext, calendarContext, calendarName, onChangeView, onOpenAppSettings, onOpenSideNav, onEditAnniversary, onAddAnniversaryForDate, onFocusCultureSource, onRegisterMenuActions })
      : React.createElement(EmptyState, {
        title: `${RECORDS_SUBTABS.find(t => t.id === subTab)?.label || subTab} (준비 중)`,
        subtitle: withCalendarPrefix(calendarName, '갤러리·보관함·콘텐츠는 기록 허브에 남아 있습니다. 메모·장소는 사이드 메뉴의 독립 페이지입니다.'),
      })
    )
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
 * still just toggle the placeholder selection state. 검색 (GlobalSearchModal) is deliberately
 * left out of this slice -- it needs its own onOpenChatMessage/onOpenImage-style navigation
 * wiring, done separately (WP-08). 캘린더 설정 (AdminModal) needed the exact same class of
 * navigation props (onOpenChatMessage/onOpenImage jump to a chat message location, onSelectDate
 * opens a date's detail) -- those are shell-navigation concepts `buildRenewalMoreContext` has no
 * access to, so `RenewalAppShell` composes them the same way it does for WP-08's GlobalSearchModal
 * (`calendarSettingsExtra` below), reusing the exact same lightbox-entry-building logic
 * app-main.js's own AdminModal call site uses. 앱 설정 (AppSettingsModal) has no such navigation
 * dependency -- every one of its props is a self-contained toggle (theme, font size, notification
 * permission, weather location), so it's wired for real here using the exact same handlers/
 * utilities CalendarApp's own old menu uses (no reimplementation).
 */
const REAL_MORE_MODAL_IDS = ['share', 'anniversaries', 'manual', 'app-settings', 'calendar-settings', 'search'];

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
    calendars, handleSelectCalendar, adminActivityLogs, loadAdminActivityLogs, handleSaveAdmin,
    recentMessages, displayChatMessages, handleDeleteMessage, handleDeleteAvailability,
    handleDeleteAllForDate, handleDeleteActivityLog, chatParticipantId, themeChoice,
    focusChatMessage, chatMessages, memos, globalSearchInitialQuery, openNotificationHelp,
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
      // Straight port of app-main.js's own isAdminOpen && <AdminModal ...> call site (its
      // onOpenSettings handler, which opens with initialTab: 'settings') -- everything except
      // onSelectDate/onOpenChatMessage/onOpenImage/onClose, which need shell-navigation concepts
      // (which tab is active) this context builder has no access to; RenewalAppShell composes
      // those the same way WP-08's GlobalSearchModal wiring does.
      'calendar-settings': {
        initialTab: 'settings',
        calendar: calendar ? { ...calendar, activityLogs: unionActivityLogs(calendar, adminActivityLogs) } : calendar,
        allCalendars: calendars,
        onSelectCalendar: handleSelectCalendar,
        onLoadActivityLogs: loadAdminActivityLogs,
        onSave: handleSaveAdmin,
        recentMessages, chatMessages: displayChatMessages,
        onDeleteMessage: handleDeleteMessage,
        onDeleteAvailability: handleDeleteAvailability,
        onDeleteAllForDate: handleDeleteAllForDate,
        onRequestConfirm: showConfirmDialog,
        showToast,
        onDeleteLog: handleDeleteActivityLog,
        chatParticipantId, themeChoice, toggleTheme, isDarkTheme,
        fontScalePercent, setFontScalePercent,
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
    // AdminModal (캘린더 설정) ships in its own lazy-loaded chunk (window.__gatherLoadAdminUi),
    // the exact trigger app-main.js's own onOpenSettings handler uses -- same "wait for chunk"
    // pattern ChatPane/MediaPane already established, guarded the same way (loaded calendar
    // required, matching the original's guardLoadedCalendar check).
    onSelectCalendarSettings: () => {
      if (!requireLoadedCalendar('Firebase 데이터를 불러온 뒤 설정을 수정해 주세요.')) return Promise.reject();
      if (typeof window.__gatherLoadAdminUi !== 'function') return Promise.resolve();
      return window.__gatherLoadAdminUi().catch(err => {
        console.error('Calendar settings UI load failed:', err);
        if (typeof showToast === 'function') showToast('캘린더 설정을 불러오지 못했습니다. 다시 시도해 주세요.', 'error');
        throw err;
      });
    },
    // AdminModal needs to jump into a specific chat message/image the same way app-main.js's own
    // AdminModal call site's inline handlers do -- composed in RenewalAppShell, not here, since
    // switching to the 대화 tab is a shell-navigation concept this context builder has no access
    // to. The raw ingredients (focusChatMessage/chatMessages/setActiveLightbox) are already
    // returned above for 검색's identical need.
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
function MoreModalsHost({ openModal, onClose, modalProps, anniversaryOverride, calendarSettingsExtra, searchExtra }) {
  const React = window.React;
  if (!openModal) return null;
  const { ShareModal, AnniversaryModal, UserManualOverlay, AppSettingsModal, AdminModal, GlobalSearchModal } = bindUiComponentAliases(React);
  if (openModal === 'share') return React.createElement(ShareModal, { ...modalProps.share, onClose });
  if (openModal === 'anniversaries') return React.createElement(AnniversaryModal, { ...modalProps.anniversaries, ...anniversaryOverride, onClose });
  if (openModal === 'manual') return React.createElement(UserManualOverlay, { ...modalProps.manual, onClose });
  if (openModal === 'app-settings') return React.createElement(AppSettingsModal, { ...modalProps['app-settings'], onClose });
  if (openModal === 'calendar-settings') return React.createElement(AdminModal, { ...modalProps['calendar-settings'], ...calendarSettingsExtra, onClose });
  if (openModal === 'search') return React.createElement(GlobalSearchModal, { ...modalProps.search, ...searchExtra, onClose });
  return null;
}

function SearchPage({ modalProps, searchExtra, onClose }) {
  const React = window.React;
  const { GlobalSearchModal } = bindUiComponentAliases(React);
  return React.createElement(GlobalSearchModal, {
    ...modalProps,
    ...searchExtra,
    inline: true,
    onClose,
  });
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
    dateStr, initialTab: null, shellChrome: 'bento', onClose,
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
 * (share/anniversaries/manual/app-settings/calendar-settings/admin) or still just a placeholder
 * selection (search -- see REAL_MORE_MODAL_IDS above); this component stays presentation-only.
 *
 * Unlike every sibling Pane, this one has no legacy view underneath to extract slots from --
 * it's shell-authored from scratch -- so it never picked up the v2 PageHeader/glass-card chrome
 * the rest of the shell got (it still used pre-Bento `renewal-shell-more-*` classes). Wrap it in
 * the same `PageHeader` (with the shared hamburger via `onOpenSideNav`, matching ChatPane/
 * MemoPane/etc.) and restyle the rows as glass list cards using the existing `--v2-glass-light-*`
 * tokens, rather than introducing a new visual language.
 */
function MorePane({ calendarName, onSelectItem, selectedItem, onOpenSideNav }) {
  const React = window.React;
  return React.createElement('section', { className: 'v2-more v2-dest-page' },
    React.createElement('div', { className: 'bp-app-shell' },
      React.createElement(PageHeader, { title: '더보기', subtitle: calendarName, onMenu: onOpenSideNav }),
      React.createElement('ul', { className: 'v2-more-list', role: 'list' },
        MORE_ITEMS.map(item => React.createElement('li', { key: item.id },
          React.createElement('button', {
            type: 'button',
            className: `v2-more-item ${selectedItem === item.id ? 'is-active' : ''}`.trim(),
            onClick: () => onSelectItem(item.id),
          },
            React.createElement('span', { className: 'v2-more-item-icon' }, React.createElement(MoreItemIcon, { id: item.id })),
            React.createElement('span', { className: 'v2-more-item-label' }, item.label),
            React.createElement('svg', { className: 'v2-more-item-chevron', width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' },
              React.createElement('path', { d: 'm9 18 6-6-6-6' })
            )
          )
        ))
      ),
      React.createElement('div', { className: 'v2-more-note' },
        calendarName ? `${calendarName} · 검색과 설정은 위 메뉴에서 바로 열 수 있습니다.` : '검색과 설정은 위 메뉴에서 바로 열 수 있습니다.')
    )
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
  const [isSideNavOpen, setIsSideNavOpen] = React.useState(false);
  const [isSideNavCollapsed, setIsSideNavCollapsed] = React.useState(false);
  // PC (>=1200px): the side-nav is always visible, so its own bottom section is where each tab's
  // "메뉴" content that used to live behind a mobile-only hamburger now lives instead. Every
  // per-tab screen component (ChatRoomView, SettlementSummaryModal, ChatGalleryModal, PlacesView,
  // MemoView, ContentView, HistoryView) registers its own named actions here via an
  // onRegisterMenuActions prop, since that state (search-open flags, upload/compose triggers,
  // etc.) is local to each of those components. A ref (not state) because the side-nav buttons
  // only need to call whatever's current when clicked; re-rendering the whole shell on every
  // registration (e.g. every chat message, which changes the closure) would be wasteful.
  const tabMenuActionsRef = React.useRef({});
  // Stable per-tab registrar functions (a fresh closure every render would make each screen's
  // registration effect re-run every render too, since its dependency array includes this prop).
  const menuActionRegistrarsRef = React.useRef({});
  const getMenuActionsRegistrar = (tabId) => {
    if (!menuActionRegistrarsRef.current[tabId]) {
      menuActionRegistrarsRef.current[tabId] = (actions) => {
        if (actions) tabMenuActionsRef.current[tabId] = actions;
        else delete tabMenuActionsRef.current[tabId];
      };
    }
    return menuActionRegistrarsRef.current[tabId];
  };
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
  // Firestore calendar records use `title`; a few legacy callers still provide `name`.
  // Prefer the canonical title so the renewal shell reflects the active calendar identity
  // (e.g. cw → 모아엘가) instead of silently falling back to the generic brand.
  const calendarName = calendar?.title || calendar?.name || null;

  // Shared by the 더보기 list AND any other pane (e.g. ChatPane's "앱 설정" entry) that needs to
  // open one of the 4 real 더보기 modals directly, without going through the 더보기 tab's own list.
  const openMoreModalById = (id) => {
    const trigger = {
      share: moreContext.onSelectShare, anniversaries: moreContext.onSelectAnniversaries,
      manual: moreContext.onSelectManual, 'app-settings': moreContext.onSelectAppSettings,
      'calendar-settings': moreContext.onSelectCalendarSettings,
      search: moreContext.onSelectSearch,
    }[id];
    if (!trigger) return;
    Promise.resolve(trigger()).then(() => setOpenMoreModal(id)).catch(() => {});
  };
  const handleSelectMoreItem = (id) => {
    setSelectedMoreItem(id);
    if (id === 'admin') { moreContext.onOpenAdmin(); return; }
    if (!REAL_MORE_MODAL_IDS.includes(id)) return; // search: selection only for now
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
    const dest = resolveV2Destination(view);
    if (dest.tab === 'records' && dest.sub) {
      setActiveTab('records');
      setRecordsSubTab(dest.sub);
      return;
    }
    setActiveTab(dest.tab);
  };
  const onOpenAppSettings = () => openMoreModalById('app-settings');

  // AdminModal (캘린더 설정)'s date/chat-message/image navigation: composed here, not in
  // `buildRenewalMoreContext`, because switching to the 대화 tab (`onChangeView`) and opening a
  // date's detail are shell-navigation concepts that context builder has no access to. Reuses the
  // exact same lightbox-entry-building logic app-main.js's own AdminModal call site uses
  // (moreContext.chatMessages/setActiveLightbox/focusChatMessage are plain pass-through of those
  // same CalendarApp values) -- only "which tab is active" is new, same approach WP-08's
  // GlobalSearchModal wiring uses for the identical prop pair.
  //
  // `calendarSettingsDateModalDate` is its own small local instance (like PlacesPane's) rather
  // than a shared one: WP-07's date-modal lift (#617) isn't merged yet, so this avoids an
  // inter-PR ordering dependency; a later cleanup can fold it into the shared instance once that
  // lands.
  const [calendarSettingsDateModalDate, setCalendarSettingsDateModalDate] = React.useState(null);
  const calendarSettingsExtra = {
    onSelectDate: (d) => setCalendarSettingsDateModalDate(d),
    onOpenChatMessage: (messageId) => {
      onChangeView('chat');
      setTimeout(() => { if (typeof moreContext.focusChatMessage === 'function') moreContext.focusChatMessage(messageId); }, 350);
    },
    onOpenImage: (messageId, imageIndex, directMediaUrl = '') => {
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
    },
  };

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

  const selectSideItem = (id) => {
    setIsSideNavOpen(false);
    const dest = resolveV2Destination(id);
    if (dest.tab === 'records' && dest.sub) {
      setActiveTab('records');
      setRecordsSubTab(dest.sub);
      return;
    }
    setActiveTab(dest.tab);
  };
  const isSideItemActive = (id) => {
    const dest = resolveV2Destination(id);
    if (dest.tab === 'records') return activeTab === 'records' && dest.sub === recordsSubTab;
    return id === activeTab || dest.tab === activeTab;
  };

  const allChat = Array.isArray(calendarContext?.displayChatMessages) ? calendarContext.displayChatMessages : (recordsContext?.mediaProps?.chatMessages || []);
  const recentChat = React.useMemo(() => latestRows(allChat), [allChat]);
  const lastChatMsg = recentChat[0];
  const lastChatAuthor = lastChatMsg ? authorFor(lastChatMsg, calendar?.participants).name : '';
  const memoRows = recordsContext?.memoProps?.memos || [];
  const placeRows = recordsContext?.placesProps?.calendar?.places || [];
  const settlementCards = calendar?.settlementCards || [];
  const lastMemo = React.useMemo(() => latestRows(memoRows)[0], [memoRows]);
  const lastPlace = React.useMemo(() => latestRows(placeRows)[0], [placeRows]);
  const lastPhoto = recordsContext?.mediaProps?.indexedPhotos?.[0];
  const recentSettlementCards = React.useMemo(() => latestRows(settlementCards), [settlementCards]);
  const shortDate = value => { const ms = timestampMs(value); return ms ? new Date(ms).toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' }).replace(/\. /g, '.').replace(/\.$/, '') : ''; };
  const sideMeta = { chat: lastChatAuthor, memo: lastMemo?.title || '', places: lastPlace?.alias || lastPlace?.name || '', gallery: shortDate(lastPhoto?.timestamp), settlement: shortDate(recentSettlementCards[0]?.updatedAt || recentSettlementCards[0]?.createdAt) };
  // Same 잔액 source as default-shell side menu / settlement summary (공금 running balance).
  const settlementBalanceBadge = calendar
    ? formatBalanceBadge(calculateSettlementBalance(calendar))
    : null;
  const participants = Array.isArray(calendarContext?.calendar?.participants) ? calendarContext.calendar.participants : [];
  const chatAuthorPart = participants.find(p => p && (p.id === lastChatMsg?.participantId || p.name === lastChatAuthor));
  const chatPillColor = chatAuthorPart?.color || '#EF4444';
  const chatPillTextColor = '#FFFFFF';

  const hasFullScreen = activeTab === 'chat' || activeTab === 'settlement' || activeTab === 'memo' || activeTab === 'places' || activeTab === 'search';
  const cleanCalBadge = (value) => String(value || '')
    .replace(/[\p{Extended_Pictographic}\p{Emoji_Presentation}\uFE0F\u200D]/gu, '')
    .replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, '')
    .replace(/\s+/g, ' ')
    .trim();

  // Per-tab side-nav submenu content (see the `is-tab-menu` group inside `bentoSideNav` below).
  // 캘린더's three items are static (openMoreModalById covers them directly); every other tab's
  // items dispatch through tabMenuActionsRef, keyed by `action`, since that tab's own screen
  // component registers the actual handler (search toggle, upload trigger, etc.) itself.
  const TAB_MENU_ITEM_CONFIGS = {
    calendar: [
      { key: 'calendar-settings', label: '캘린더 설정', icon: 'calendarSettings', onClick: () => openMoreModalById('calendar-settings') },
      { key: 'anniversaries', label: '기념일 설정', icon: 'anniversary', onClick: () => openMoreModalById('anniversaries') },
      { key: 'manual', label: '사용자 매뉴얼', icon: 'manual', onClick: () => { setIsSideNavOpen(false); openMoreModalById('manual'); } },
    ],
    chat: [
      { key: 'chat-notice', label: '공지사항', icon: 'more', action: 'notice' },
    ],
    settlement: [
      { key: 'settlement-create', label: '정산 생성', icon: 'plus', action: 'create' },
      { key: 'settlement-list', label: '정산 목록', icon: 'receipt', action: 'list' },
    ],
    gallery: [
      { key: 'gallery-upload-image', label: '이미지 업로드', icon: 'gallery', action: 'uploadImage' },
      { key: 'gallery-upload-file', label: '파일 업로드', icon: 'fileUpload', action: 'uploadFile' },
      { key: 'gallery-upload-link', label: '링크 업로드', icon: 'link', action: 'uploadLink' },
    ],
    places: [
      { key: 'places-register', label: '장소 등록', icon: 'mapPinPlus', action: 'register' },
    ],
    memo: [],
    content: [
      { key: 'content-register', label: '컨텐츠 등록', icon: 'plus', action: 'register' },
    ],
    archive: [],
  };

  const bentoSideNav = React.createElement(React.Fragment, null,
    React.createElement('div', { className: bentoClass('side-nav-head') },
      React.createElement('div', { className: bentoClass('side-nav-brand') },
        React.createElement('span', {
          className: bentoClass('side-nav-brand-icon'),
          'aria-hidden': 'true',
        }, React.createElement(TabIcon, { id: 'calendar' })),
        React.createElement('span', { className: bentoClass('side-nav-brand-text') }, '모여라 캘린더'),
        (() => {
          const calBadge = cleanCalBadge(calendarName);
          return calBadge
            ? React.createElement('span', {
                className: bentoClass('side-nav-cal-badge'),
                title: calBadge,
              }, calBadge)
            : null;
        })()
      ),
      React.createElement('button', { type: 'button', className: bentoClass('side-nav-close-btn'), 'aria-label': '메뉴 닫기', onClick: () => setIsSideNavOpen(false) },
        React.createElement(TabIcon, { id: 'x' })
      )
    ),
    React.createElement('button', {
      type: 'button',
      className: bentoClass('side-nav-global-search'),
      'aria-label': '통합검색',
      onClick: () => { setIsSideNavOpen(false); setActiveTab('search'); },
    },
      React.createElement('span', { className: bentoClass('side-nav-global-search-icon'), 'aria-hidden': 'true' }, React.createElement(TabIcon, { id: 'search' })),
      React.createElement('span', { className: bentoClass('side-nav-global-search-label') }, '통합검색')
    ),
    React.createElement('div', { className: bentoClass('side-nav-group renewal-shell-side-nav-group is-main') },
      BENTO_MAIN_ITEMS.map(item => {
        const active = isSideItemActive(item.id);
        const metaVal = item.id === 'chat' ? shortParticipantName(sideMeta[item.id]) : sideMeta[item.id];
        return React.createElement('button', {
          key: item.id,
          type: 'button',
          className: bentoClass(`side-nav-item renewal-shell-side-nav-item ${active ? 'is-active' : ''}`.trim()),
          title: item.label,
          onClick: () => selectSideItem(item.id)
        },
          React.createElement('span', { className: bentoClass('side-nav-item-icon renewal-shell-nav-icon') }, React.createElement(TabIcon, { id: item.icon, active })),
          React.createElement('span', { className: bentoClass('side-nav-item-title renewal-shell-nav-label') },
            item.label,
            item.id === 'settlement' && settlementBalanceBadge?.text && React.createElement('span', {
              className: bentoClass('side-nav-item-badge'),
              style: { backgroundColor: settlementBalanceBadge.bgColor || '#EF4444' },
              title: '정산 잔액'
            }, settlementBalanceBadge.text)
          ),
          metaVal && (
            item.isPill
              ? React.createElement('span', { className: bentoClass('side-nav-item-meta chat-name-pill'), style: { backgroundColor: chatPillColor, color: chatPillTextColor } }, metaVal)
              : React.createElement('span', {
                  className: bentoClass(
                    item.id === 'settlement'
                      ? 'side-nav-item-meta side-nav-date-chip renewal-shell-side-nav-meta'
                      : 'side-nav-item-meta renewal-shell-side-nav-meta'
                  ),
                }, metaVal)
          )
        );
      })
    ),
    React.createElement('div', { className: bentoClass('side-nav-group renewal-shell-side-nav-group is-sub') },
      BENTO_SUB_ITEMS.map(item => {
        const active = isSideItemActive(item.id);
        return React.createElement('button', {
          key: item.id,
          type: 'button',
          className: bentoClass(`side-nav-item renewal-shell-side-nav-item ${active ? 'is-active' : ''}`.trim()),
          title: item.label,
          onClick: () => selectSideItem(item.id)
        },
          React.createElement('span', { className: bentoClass('side-nav-item-icon renewal-shell-nav-icon') }, React.createElement(TabIcon, { id: item.icon, active })),
          React.createElement('span', { className: bentoClass('side-nav-item-title renewal-shell-nav-label') }, item.label)
        );
      })
    ),
    // PC-only (hidden on the mobile drawer via CSS, see .bp-side-nav-group.bp-is-tab-menu): the
    // side-nav is always visible on PC, so this is where each tab's own extra menu content
    // (previously reachable only through that tab's mobile-only "메뉴" hamburger) lives instead --
    // a single dynamic group whose items change with the active tab, replacing what used to be a
    // static "캘린더 설정/기념일 설정/사용자 매뉴얼" block (that's simply 캘린더 탭's own entry
    // below now) plus a chat-only 공지사항 item. Actions for tabs other than 캘린더 come from
    // each screen's own onRegisterMenuActions registration (tabMenuActionsRef, above) since that
    // state (search-open flags, upload/compose triggers) is local to each of those components.
    (() => {
      const groupKey = activeTab === 'records'
        ? (recordsSubTab === 'media' ? 'gallery' : recordsSubTab === 'archive' ? 'archive' : recordsSubTab === 'content' ? 'content' : null)
        : activeTab;
      const items = TAB_MENU_ITEM_CONFIGS[groupKey];
      if (!items) return null;
      return React.createElement('div', { className: bentoClass('side-nav-group renewal-shell-side-nav-group is-tab-menu') },
        items.map(item => React.createElement('button', {
          key: item.key,
          type: 'button',
          className: bentoClass('side-nav-item renewal-shell-side-nav-quick-item'),
          title: item.label,
          onClick: typeof item.onClick === 'function' ? item.onClick : () => tabMenuActionsRef.current[groupKey]?.[item.action]?.(),
        },
          React.createElement('span', { className: bentoClass('side-nav-item-icon') }, React.createElement(TabIcon, { id: item.icon })),
          React.createElement('span', { className: bentoClass('side-nav-item-title') }, item.label)
        ))
      );
    })(),
    React.createElement('div', { className: bentoClass('side-nav-footer renewal-shell-side-nav-footer') },
      React.createElement('button', { type: 'button', className: bentoClass('side-nav-item renewal-shell-side-nav-quick-item'), title: '공유', onClick: () => openMoreModalById('share') },
        React.createElement('span', { className: bentoClass('side-nav-item-icon') }, React.createElement(TabIcon, { id: 'share' })),
        React.createElement('span', { className: bentoClass('side-nav-item-title') }, '공유')
      ),
      React.createElement('button', { type: 'button', className: bentoClass('side-nav-item renewal-shell-side-nav-quick-item'), title: '설정', onClick: () => openMoreModalById('app-settings') },
        React.createElement('span', { className: bentoClass('side-nav-item-icon') }, React.createElement(TabIcon, { id: 'settings' })),
        React.createElement('span', { className: bentoClass('side-nav-item-title') }, '설정')
      ),
      React.createElement('button', { type: 'button', className: bentoClass('side-nav-collapse-btn renewal-shell-side-collapse'), title: isSideNavCollapsed ? '메뉴 펼치기' : '메뉴 접기', 'aria-label': isSideNavCollapsed ? '메뉴 펼치기' : '메뉴 접기', onClick: () => setIsSideNavCollapsed(v => !v) },
        React.createElement(TabIcon, { id: isSideNavCollapsed ? 'chevronRight' : 'chevronLeft' }),
        React.createElement('span', { className: bentoClass('side-nav-collapse-label') }, isSideNavCollapsed ? '펼치기' : '접기')
      )
    )
  );

  return React.createElement(React.Fragment, null,

    React.createElement('div', { className: `renewal-shell v2-design ${hasFullScreen ? 'v2-has-detail' : ''} ${isSideNavCollapsed ? 'is-side-collapsed' : ''}`.trim() },
      React.createElement('button', { type: 'button', className: bentoClass(`side-nav-backdrop ${isSideNavOpen ? 'is-open' : ''}`), onClick: () => setIsSideNavOpen(false), 'aria-label': '메뉴 닫기' }),
      React.createElement('nav', { className: bentoClass(`side-nav ${isSideNavOpen ? 'is-open' : ''} ${isSideNavCollapsed ? 'is-collapsed' : ''}`), 'aria-label': '주 메뉴' }, bentoSideNav),
      React.createElement('main', { className: activeTab === 'calendar' ? 'bp-app-shell is-bento-home' : `renewal-shell-main v2-destination ${hasFullScreen ? `v2-${activeTab}` : (activeTab === 'records' ? `is-records v2-records-${recordsSubTab}` : `is-${activeTab}`)}` },

        activeTab === 'calendar'
          ? React.createElement(CalendarPane, { calendarContext, recordsContext, onOpenDate: setDateModalDate, onChangeView, calendarName, onOpenSearch: () => setActiveTab('search'), onOpenMore: () => setIsSideNavOpen(true) })
          : activeTab === 'search'
          ? React.createElement(SearchPage, { modalProps: moreContext.modalProps.search, searchExtra, onClose: () => setActiveTab('calendar') })
          : activeTab === 'chat'
          ? React.createElement(ChatPane, { chatContext, onChangeView, onOpenAppSettings, onOpenSideNav: () => setIsSideNavOpen(true), onRegisterMenuActions: getMenuActionsRegistrar('chat') })
          : activeTab === 'memo'
          ? React.createElement(MemoPane, { recordsContext, onChangeView, onOpenAppSettings, onOpenSideNav: () => setIsSideNavOpen(true), onRegisterMenuActions: getMenuActionsRegistrar('memo') })
          : activeTab === 'places'
          ? React.createElement(PlacesPane, { recordsContext, calendarContext, onChangeView, onOpenAppSettings, onOpenSideNav: () => setIsSideNavOpen(true), onEditAnniversary, onAddAnniversaryForDate, onFocusCultureSource, onRegisterMenuActions: getMenuActionsRegistrar('places') })
          : activeTab === 'settlement'
          ? React.createElement(SettlementPane, { settlementContext, onChangeView, onOpenAppSettings, onOpenDate: setDateModalDate, onOpenSideNav: () => setIsSideNavOpen(true), onRegisterMenuActions: getMenuActionsRegistrar('settlement') })
          : activeTab === 'records'
          ? React.createElement(RecordsPane, { subTab: recordsSubTab, onSelectSubTab: setRecordsSubTab, calendarName, recordsContext, calendarContext, onChangeView, onOpenAppSettings, onOpenSideNav: () => setIsSideNavOpen(true), onEditAnniversary, onAddAnniversaryForDate, onFocusCultureSource, onRegisterMenuActions: getMenuActionsRegistrar(recordsSubTab === 'media' ? 'gallery' : recordsSubTab === 'archive' ? 'archive' : recordsSubTab) })
          : activeTab === 'more'
          ? React.createElement(MorePane, { calendarName, selectedItem: selectedMoreItem, onSelectItem: handleSelectMoreItem, onOpenSideNav: () => setIsSideNavOpen(true) })
          : React.createElement(PlaceholderPane, { tabId: activeTab, calendarName }),

        dateModalDate && React.createElement(SharedDateModal, {
          calendarContext, dateModalDate, initialTab: activeTab === 'settlement' ? 'settlement' : null,
          onClose: () => setDateModalDate(null),
          onSelectDate: setDateModalDate,
          onEditAnniversary, onAddAnniversaryForDate, onFocusCultureSource,
        })
      )
    ),
    React.createElement(MoreModalsHost, {
      openModal: openMoreModal, onClose: () => setOpenMoreModal(null),
      modalProps: moreContext.modalProps, anniversaryOverride, calendarSettingsExtra, searchExtra,
    }),
    calendarSettingsDateModalDate && React.createElement(bindUiComponentAliases(React).DateModal, {
      ...calendarContext.dateModalProps,
      dateStr: calendarSettingsDateModalDate,
      initialTab: null,
      onClose: () => setCalendarSettingsDateModalDate(null),
      onParticipantClick: (name, dateStr) => { if (dateStr) setCalendarSettingsDateModalDate(dateStr); },
      onEditAnniversary,
      onAddAnniversaryForDate: (d) => { setCalendarSettingsDateModalDate(null); onAddAnniversaryForDate(d); },
      onFocusCultureSource,
    }),
    moreDateModalDate && React.createElement(SearchDateModal, {
      calendarContext, dateStr: moreDateModalDate,
      onClose: () => setMoreDateModalDate(null),
      onEditAnniversary, onAddAnniversaryForDate: (d) => { setMoreDateModalDate(null); onAddAnniversaryForDate(d); },
      onFocusCultureSource,
    })
  );
}
