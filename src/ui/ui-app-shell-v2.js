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
  const [activeTab, setActiveTab] = React.useState('calendar');
  const calendarName = calendar?.name || null;

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
      React.createElement(PlaceholderPane, { tabId: activeTab, calendarName })
    ),
    React.createElement('nav', { className: 'renewal-shell-bottom-nav', 'aria-label': '주 메뉴' },
      ...navButtons('renewal-shell-bottom-nav-item')
    )
  );
}
