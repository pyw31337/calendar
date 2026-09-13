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

const TABS = [
  { id: 'calendar', label: '캘린더' },
  { id: 'chat', label: '대화' },
  { id: 'records', label: '기록' },
  { id: 'settlement', label: '정산' },
  { id: 'more', label: '더보기' },
];
const TAB_IDS = TABS.map(t => t.id);
const DEFAULT_TAB = 'calendar';

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

/**
 * Writes the tab into the URL without touching any other query param (`?id=`, `?shell=v2`, ...)
 * or reloading the page. `push` adds a history entry (a deliberate tab switch, so the back
 * button steps back through tabs one at a time -- 마스터플랜 §4.1's "브라우저 뒤로가기는 탭
 * 내부 상세 → 탭 루트 → 이전 브라우저 위치 순"); `replace` (used for the very first mount, and
 * to correct an invalid `?tab=`) does not.
 */
function writeTabToLocation(tabId, { push } = { push: true }) {
  if (typeof window === 'undefined' || !window.history) return;
  const url = new URL(window.location.href);
  if (tabId === DEFAULT_TAB) url.searchParams.delete('tab');
  else url.searchParams.set('tab', tabId);
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

function PlaceholderPane({ tabId, calendarName }) {
  const React = window.React;
  const label = TABS.find(t => t.id === tabId)?.label || tabId;
  return React.createElement('div', { className: 'renewal-shell-placeholder' },
    React.createElement('div', { className: 'renewal-shell-placeholder-icon' }, React.createElement(TabIcon, { id: tabId })),
    React.createElement('div', { className: 'renewal-shell-placeholder-title' }, `${label} (준비 중)`),
    React.createElement('div', { className: 'renewal-shell-placeholder-sub' },
      calendarName ? `${calendarName} · WP-03~07에서 실제 데이터가 이 자리에 연결됩니다.` : 'WP-03~07에서 실제 데이터가 이 자리에 연결됩니다.')
  );
}

/**
 * One-call adapter for CalendarApp's return statement (kept to a single call there deliberately
 * -- CalendarApp is frozen at a hard line-count ceiling, docs/app-main-split-units.md). Returns
 * the shell element when `?shell=v2` is set, otherwise null so the caller falls through to the
 * existing return unchanged.
 */
export function renderRenewalShellIfEnabled(activeCalId, calendar) {
  const React = window.React;
  if (!isRenewalShellEnabled()) return null;
  return React.createElement(RenewalAppShell, { activeCalId, calendar });
}

/**
 * @param {{ activeCalId: string, calendar: object | null }} props
 *   `calendar` is the already-loaded record for activeCalId (or null while it loads) --
 *   passed in from CalendarApp's existing state as a plain prop (the adapter pattern from
 *   product-renewal-master-plan.md §8.2), never re-fetched here.
 */
export function RenewalAppShell({ activeCalId, calendar }) {
  const React = window.React;
  const [activeTab, setActiveTabState] = React.useState(readTabFromLocation);
  const calendarName = calendar?.name || null;

  // Correct an invalid/stale ?tab= on first mount without adding a history entry, then listen
  // for the back/forward buttons for the rest of this shell's lifetime.
  React.useEffect(() => {
    writeTabToLocation(activeTab, { push: false });
    const onPopState = () => setActiveTabState(readTabFromLocation());
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []); // mount-only: reads the initial URL once and wires the one popstate listener

  const setActiveTab = (tabId) => {
    if (tabId === activeTab) return;
    writeTabToLocation(tabId, { push: true });
    setActiveTabState(tabId);
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

  return React.createElement('div', { className: 'renewal-shell' },
    React.createElement('nav', { className: 'renewal-shell-side-nav', 'aria-label': '주 메뉴' },
      React.createElement('div', { className: 'renewal-shell-side-nav-brand' }, calendarName || '모여라 캘린더'),
      ...navButtons('renewal-shell-side-nav-item')
    ),
    React.createElement('main', { className: 'renewal-shell-main' },
      React.createElement(TopHeader, {
        calendarName,
        onOpenSearch: () => setActiveTab('more'),
        onOpenMore: () => setActiveTab('more'),
      }),
      React.createElement(PlaceholderPane, { tabId: activeTab, calendarName })
    ),
    React.createElement('nav', { className: 'renewal-shell-bottom-nav', 'aria-label': '주 메뉴' },
      ...navButtons('renewal-shell-bottom-nav-item')
    )
  );
}
