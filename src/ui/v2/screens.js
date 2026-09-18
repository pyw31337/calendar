/**
 * Dedicated chrome for ?shell=v2 destination screens (Chat / Memo / Places / Settlement).
 * Real feature views keep data + handlers; this layer supplies Full-mock chrome (header,
 * filters shell, FAB) and scopes reference CSS. Default shell never imports this module.
 */
import './dest-layout.css';
import './screens.css';
import { calculateSettlementRows } from '../../core/settlement-calculator.js';
import { authorFor } from './view-data.js';
import { ChatBubbleFrame } from './chat-bubble-modules.js';
import {
  extractChatSlots, extractMemoSlots, extractPlacesSlots, extractSettlementSlots,
} from './shell-nav.js';

const h = (...args) => window.React.createElement(...args);

// Destination-only CSS is loaded when its tab is first rendered, instead of competing with the
// calendar home for the initial CSS download. Vite caches each dynamic CSS import after loading.
const destinationStyleLoaders = {
  memo: () => import('./reference-memo.css'),
  places: () => import('./reference-places.css'),
  settlement: () => import('./reference-settlement.css'),
  chat: () => import('./reference-chat.css'),
};
const destinationStylePromises = new Map();
function ensureDestinationStyles(kind) {
  if (!destinationStylePromises.has(kind) && destinationStyleLoaders[kind]) {
    destinationStylePromises.set(kind, destinationStyleLoaders[kind]().catch(error => {
      destinationStylePromises.delete(kind);
      console.warn(`V2 ${kind} styles failed to load`, error);
    }));
  }
}

/** Multi-element icons at mock stroke/size (same bar as home side-nav). */
const ICON_NODES = {
  back: [['path', { d: 'M15 18l-6-6 6-6' }]],
  search: [
    ['circle', { cx: 11, cy: 11, r: 8 }],
    ['path', { d: 'm21 21-4.3-4.3' }],
  ],
  menu: [
    ['path', { d: 'M4 6h16' }],
    ['path', { d: 'M4 12h16' }],
    ['path', { d: 'M4 18h16' }],
  ],
  plus: [
    ['path', { d: 'M12 5v14' }],
    ['path', { d: 'M5 12h14' }],
  ],
  close: [
    ['path', { d: 'M6 6l12 12' }],
    ['path', { d: 'M6 18L18 6' }],
  ],
  share: [
    ['circle', { cx: 18, cy: 5, r: 3 }],
    ['circle', { cx: 6, cy: 12, r: 3 }],
    ['circle', { cx: 18, cy: 19, r: 3 }],
    ['path', { d: 'm8.6 13.5 6.8 4M15.4 6.5l-6.8 4' }],
  ],
  pin: [
    ['path', { d: 'M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z' }],
    ['circle', { cx: 12, cy: 10, r: 3 }],
  ],
  map: [
    ['path', { d: 'M1 6v16l7-4 8 4 7-4V2l-7 4-8-4-7 4Z' }],
    ['path', { d: 'M8 2v16M16 6v16' }],
  ],
  edit: [
    ['path', { d: 'm15 4 5 5' }],
    ['path', { d: 'M4 20l4-1L20 7l-4-4L4 15v5' }],
  ],
  photo: [
    ['rect', { x: 3, y: 3, width: 18, height: 18, rx: 2 }],
    ['circle', { cx: 9, cy: 9, r: 2 }],
    ['path', { d: 'm21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21' }],
  ],
  sort: [
    ['path', { d: 'M3 6h18' }],
    ['path', { d: 'M6 12h12' }],
    ['path', { d: 'M10 18h4' }],
  ],
  attach: [['path', { d: 'M21.4 11.6 12.9 20a5 5 0 0 1-7-7l8-8a3.5 3.5 0 0 1 5 5l-8 8a2 2 0 0 1-2.8-2.8l7.1-7.1' }]],
  emoji: [
    ['circle', { cx: 12, cy: 12, r: 10 }],
    ['path', { d: 'M8 14s1.5 2 4 2 4-2 4-2' }],
    ['path', { d: 'M9 9h.01' }],
    ['path', { d: 'M15 9h.01' }],
  ],
  meme: [
    ['rect', { x: 3, y: 3, width: 18, height: 18, rx: 2 }],
    ['circle', { cx: 8.5, cy: 8.5, r: 1.5 }],
    ['path', { d: 'm21 15-5-5L5 21' }],
  ],
  paste: [
    ['path', { d: 'M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2' }],
    ['rect', { x: 9, y: 3, width: 6, height: 4, rx: 1 }],
  ],
  send: [['path', { d: 'M22 2 11 13M22 2l-7 20-4-9-9-4 20-7Z' }]],
  chevronLeft: [['path', { d: 'm15 18-6-6 6-6' }]],
  chevronRight: [['path', { d: 'm9 18 6-6-6-6' }]],
};

export function DesignIcon({ name, size = 18, strokeWidth = 2 }) {
  const nodes = ICON_NODES[name] || ICON_NODES.menu;
  return h(
    'svg',
    {
      width: size,
      height: size,
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      strokeWidth,
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
      'aria-hidden': true,
      style: { display: 'block', shapeRendering: 'geometricPrecision' },
    },
    ...nodes.map(([tag, props], i) => h(tag, { key: i, ...props }))
  );
}

function IconButton({ label, icon, onClick, size = 18 }) {
  return h(
    'button',
    { type: 'button', className: 'bp-icon-btn', 'aria-label': label, onClick },
    h(DesignIcon, { name: icon, size })
  );
}

/** Strip leading emoji/symbols from calendar title for header/side badges. */
function cleanCalendarName(calendar) {
  return String(calendar?.title || calendar?.name || '')
    .replace(/^[^\p{L}\p{N}]+/u, '')
    .replace(/\s*캘린더\s*$/u, '')
    .trim();
}

/** Shared header brand: preserve the calendar's leading emoji as the visual mark. */
function pageBrand(calendar) {
  const raw = String(calendar?.title || calendar?.name || '').trim();
  const mark = raw.match(/^[^\p{L}\p{N}\s]+/u)?.[0] || '🍺';
  return { mark, name: cleanCalendarName(calendar) };
}

/** Shared subtitle: calendar name, optionally with a real trailing fragment (e.g. member count). */
function pageSubtitle(calendar, trailing) {
  const name = cleanCalendarName(calendar);
  const extra = trailing == null || trailing === '' ? '' : String(trailing).trim();
  if (name && extra) return `${name} · ${extra}`;
  return name || extra || undefined;
}

export function PageHeader({ title, subtitle, brand, count, onBack, onSearch, searchLabel, onShare, onMenu, extra, centerSubtitle = true, showSearch = false, children }) {
  const React = window.React;
  const [isVisible, setIsVisible] = React.useState(true);
  React.useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    let lastTop = 0;
    const onScroll = event => {
      if (!window.matchMedia?.('(max-width: 767px)').matches) return;
      const target = event.target;
      if (!target || typeof target.scrollTop !== 'number' || target.scrollHeight <= target.clientHeight) return;
      const top = target.scrollTop;
      if (top < 12) setIsVisible(true);
      else if (top - lastTop > 4 && top > 56) setIsVisible(false);
      else if (lastTop - top > 4) setIsVisible(true);
      lastTop = top;
    };
    document.addEventListener('scroll', onScroll, true);
    return () => document.removeEventListener('scroll', onScroll, true);
  }, []);
  const centerBrand = brand || (subtitle ? { mark: '🍺', name: String(subtitle).split(' · ')[0].trim() } : null);
  return h(
    'header',
    { className: `bp-header v2-page-header${centerSubtitle ? ' v2-page-header--centered' : ''}${isVisible ? '' : ' is-scroll-hidden'}` },
    h(
      'div',
      { className: 'bp-header-row' },
      h(
        'div',
        { className: 'bp-header-leading' },
        h(
          'button',
          { className: 'bp-back-btn', type: 'button', 'aria-label': '뒤로가기', onClick: onBack },
          h(DesignIcon, { name: 'back', size: 18 })
        ),
        h(
          'div',
          { className: `v2-header-title-block${centerSubtitle ? ' v2-header-title-left' : ''}` },
          h('div', { className: 'bp-header-title' }, title),
          count ? h('span', { className: 'bp-header-count' }, count) : null,
          !centerSubtitle && subtitle ? h('div', { className: 'bp-header-sub' }, subtitle) : null
        )
      ),
      centerBrand ? h(
        'div',
        { className: 'bp-header-center-brand', 'aria-label': centerBrand.name },
        h('span', { className: 'bp-header-brand-mark', 'aria-hidden': 'true' }, centerBrand.mark),
        h('span', { className: 'bp-header-brand-name' }, centerBrand.name)
      ) : null,
      h(
        'div',
        { className: 'bp-header-actions' },
        extra,
        showSearch && onSearch && h(IconButton, { label: searchLabel || `${title} 검색`, icon: 'search', size: 20, onClick: onSearch }),
        onMenu && h(IconButton, { label: `${title} 메뉴`, icon: 'menu', size: 20, onClick: onMenu })
      )
    ),
    children,
    !isVisible && onBack ? h('button', {
      type: 'button', className: 'bp-floating-back-btn', 'aria-label': '뒤로가기', onClick: onBack,
    }, h(DesignIcon, { name: 'back', size: 18 })) : null
  );
}

function Search({ value, onChange, placeholder }) {
  return h(
    'div',
    { className: 'bp-search-row' },
    h(DesignIcon, { name: 'search', size: 14 }),
    h('input', {
      type: 'search',
      className: 'bp-search-input',
      placeholder,
      'aria-label': placeholder,
      value,
      onChange: event => onChange(event.target.value),
    })
  );
}

function Fab({ label, onClick }) {
  return h(
    'button',
    { type: 'button', className: 'bp-fab', 'aria-label': label, onClick },
    h(DesignIcon, { name: 'plus', size: 22, strokeWidth: 2.4 })
  );
}

function Empty({ children }) {
  return h('p', { className: 'v2-empty' }, children);
}

function overlays(slots, except = []) {
  if (!slots) return null;
  return Object.entries(slots)
    .filter(([key]) => !except.includes(key))
    .map(([key, value]) => h(window.React.Fragment, { key }, value));
}

function wrapLegacy(legacyView, className) {
  if (!legacyView) return null;
  if (window.React.isValidElement(legacyView)) {
    const prev = legacyView.props.className || '';
    return window.React.cloneElement(legacyView, {
      className: `${prev} ${className}`.trim(),
    });
  }
  return h('div', { className }, legacyView);
}

/* -------------------------------------------------------------------------- */
/* Memo                                                                        */
/* -------------------------------------------------------------------------- */

export function MemoScreen(p) {
  // Tag cloud under search removed (V2-MOBILE-IA-PLAN): tags still filter via card taps / search.
  const useDedicatedCards = typeof p.renderCard === 'function' && Array.isArray(p.memos);
  // Search starts closed — the header search icon (PageHeader's onSearch) toggles the input row
  // into view instead of it sitting open by default on every page load.
  const [isSearchOpen, setIsSearchOpen] = window.React.useState(false);
  const toggleSearch = () => setIsSearchOpen(v => !v);

  if (!useDedicatedCards && p.legacyView) {
    const slots = { ...extractMemoSlots(p.legacyView), ...(p.slots || {}) };
    // Prefer mock page frame + live body/composer slots over opaque wrap of the whole tree.
    if (slots.body) {
      return h(
        'section',
        { className: 'v2-memo v2-dest-page' },
        h(
          'div',
          { className: 'bp-app-shell' },
          h(
            PageHeader,
            {
              title: '메모',
              subtitle: p.subtitle || pageSubtitle(p.calendar),
              brand: pageBrand(p.calendar),
              onBack: p.onBack,
              onSearch: toggleSearch,
              searchLabel: '메모 검색',
              onShare: p.onShare,
              onMenu: p.onMenu,
            },
            isSearchOpen && h(Search, {
              value: p.searchQuery || '',
              onChange: p.onSearch || (() => {}),
              placeholder: '메모 검색',
            })
          ),
          h('div', { className: 'v2-dest-body v2-memo-body' }, slots.body),
          h(Fab, { label: '메모 작성', onClick: p.onCompose })
        ),
        overlays(slots, ['body', 'composer', 'list'])
      );
    }
    return h(
      'section',
      { className: 'v2-memo v2-dest-page v2-wrap-legacy' },
      h(
        'div',
        { className: 'bp-app-shell' },
        h(
          PageHeader,
          {
            title: '메모',
            subtitle: p.subtitle || pageSubtitle(p.calendar),
            brand: pageBrand(p.calendar),
            onBack: p.onBack,
            onSearch: toggleSearch,
            searchLabel: '메모 검색',
            onShare: p.onShare,
            onMenu: p.onMenu,
          },
          isSearchOpen && h(Search, {
            value: p.searchQuery || '',
            onChange: p.onSearch || (() => {}),
            placeholder: '메모 검색',
          })
        ),
        wrapLegacy(p.legacyView, 'v2-legacy-body v2-memo-legacy'),
        h(Fab, { label: '메모 작성', onClick: p.onCompose })
      ),
      overlays(slots)
    );
  }

  return h(
    'section',
    { className: 'v2-memo v2-dest-page' },
    h(
      'div',
      { className: 'bp-app-shell' },
      h(
        PageHeader,
        {
          title: '메모',
          subtitle: p.subtitle || pageSubtitle(p.calendar),
          brand: pageBrand(p.calendar),
          onBack: p.onBack,
          onSearch: toggleSearch,
          searchLabel: '메모 검색',
          onShare: p.onShare,
          onMenu: p.onMenu,
        },
        isSearchOpen && h(Search, {
          value: p.searchQuery,
          onChange: p.onSearch,
          placeholder: '메모 검색',
        })
      ),
      p.slots && p.slots.shared,
      h(
        'div',
        { className: 'bp-memo-grid' },
        (p.memos || []).map(memo => {
          const author = authorFor(memo, p.calendar.participants);
          const metaMs = memo.updatedAt ?? memo.createdAt;
          let meta = '';
          if (metaMs) {
            const d = new Date(typeof metaMs === 'number' ? metaMs : metaMs);
            if (!Number.isNaN(d.getTime())) {
              meta = d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
            }
          }
          return h(
            ChatBubbleFrame,
            {
              key: memo.id,
              name: author.name,
              color: author.color,
              meta,
              className: 'v2-memo-card-wrap',
              surfaceClassName: 'v2-memo-bubble-surface',
              surfaceProps: {
                style: { '--memo-author-color': author.color },
              },
            },
            p.renderCard(memo)
          );
        })
      ),
      !(p.memos || []).length && h(Empty, null, '검색 조건에 맞는 메모가 없습니다.'),
      p.hasMoreMemos &&
        h('button', { type: 'button', className: 'v2-load-more', onClick: p.onLoadMoreMemos }, '메모 더 보기'),
      h(Fab, { label: '메모 작성', onClick: p.onCompose })
    ),
    p.isComposerExpanded &&
      h(
        'div',
        { className: 'v2-compose-backdrop' },
        h(
          'section',
          { className: 'v2-compose-dialog', role: 'dialog', 'aria-modal': true, 'aria-label': '메모 작성' },
          h(
            'div',
            { className: 'v2-dialog-heading' },
            h('strong', null, '메모 작성'),
            h(IconButton, { label: '닫기', icon: 'close', onClick: p.onCloseComposer })
          ),
          p.slots && p.slots.composer
        )
      ),
    overlays(p.slots, ['composer', 'shared'])
  );
}

/* -------------------------------------------------------------------------- */
/* Places                                                                      */
/* -------------------------------------------------------------------------- */

export function PlacesScreen(p) {
  const [mapOpen, setMapOpen] = window.React.useState(p.mapOpenDefault !== false);
  // Search starts closed — the header search icon toggles the input row into view.
  const [isSearchOpen, setIsSearchOpen] = window.React.useState(false);
  const toggleSearch = () => setIsSearchOpen(v => !v);
  const select = place => {
    setMapOpen(true);
    if (p.onSelect) p.onSelect(place);
  };
  // Keep the map entry point in the page content so the shared header stays
  // identical across every destination screen.
  const mapToggle = h(IconButton, {
    label: '지도로 보기',
    icon: 'map',
    onClick: () => {
      setMapOpen(value => !value);
      if (p.onToggleMap) p.onToggleMap();
    },
  });

  if (!Array.isArray(p.places) && p.legacyView) {
    const slots = { ...extractPlacesSlots(p.legacyView), ...(p.slots || {}) };
    if (slots.list || slots.map) {
      return h(
        'section',
        { className: 'v2-places v2-dest-page' },
        h(
          'div',
          { className: 'bp-app-shell' },
          h(
            PageHeader,
            {
              title: '장소',
              subtitle: p.subtitle || pageSubtitle(p.calendar),
              brand: pageBrand(p.calendar),
              onBack: p.onBack,
              onSearch: toggleSearch,
              searchLabel: '장소 검색',
              onShare: p.onShare,
              onMenu: p.onMenu,
              extra: mapToggle,
            },
            isSearchOpen && h(Search, {
              value: p.searchQuery || '',
              onChange: p.onSearch || (() => {}),
              placeholder: '장소 검색',
            })
          ),
          mapOpen && slots.map && h('div', { className: 'v2-map-panel' }, slots.map),
          slots.filters,
          slots.toolbar,
          h('div', { className: 'v2-dest-body v2-places-body' }, slots.list || slots.map),
          h(Fab, { label: '장소 등록', onClick: p.onCompose })
        ),
        overlays(slots, ['map', 'toolbar', 'list', 'filters'])
      );
    }
    return h(
      'section',
      { className: 'v2-places v2-dest-page v2-wrap-legacy' },
      h(
        'div',
        { className: 'bp-app-shell' },
        h(
          PageHeader,
          {
            title: '장소',
            subtitle: p.subtitle || pageSubtitle(p.calendar),
            brand: pageBrand(p.calendar),
            onBack: p.onBack,
            onSearch: toggleSearch,
            searchLabel: '장소 검색',
            onShare: p.onShare,
            onMenu: p.onMenu,
            extra: mapToggle,
          },
          isSearchOpen && h(Search, {
            value: p.searchQuery || '',
            onChange: p.onSearch || (() => {}),
            placeholder: '장소 검색',
          })
        ),
        wrapLegacy(p.legacyView, 'v2-legacy-body v2-places-legacy'),
        h(Fab, { label: '장소 등록', onClick: p.onCompose })
      ),
      overlays(slots)
    );
  }

  return h(
    'section',
    { className: 'v2-places v2-dest-page' },
    h(
      'div',
      { className: 'bp-app-shell' },
      h(
        PageHeader,
        {
          title: '장소',
          subtitle: p.subtitle || pageSubtitle(p.calendar),
          brand: pageBrand(p.calendar),
          onBack: p.onBack,
          onSearch: toggleSearch,
          searchLabel: '장소 검색',
          onShare: p.onShare,
          onMenu: p.onMenu,
          extra: mapToggle,
        },
        isSearchOpen && h(Search, {
          value: p.searchQuery,
          onChange: p.onSearch,
          placeholder: '장소 검색',
        }),
        h(
          'div',
          { className: 'bp-cat-filter-row', 'aria-label': '장소 분류' },
          [{ id: 'all', name: '전체', color: '#1e1b2e' }, ...(p.categories || [])].map(category =>
            h(
              'button',
              {
                type: 'button',
                key: category.id,
                className: `bp-cat-chip${p.categoryFilter === category.id ? ' bp-is-selected' : ''}`,
                'aria-pressed': p.categoryFilter === category.id,
                onClick: () => p.onCategory(category.id),
                style: { color: category.color || '#6b6580' },
              },
              category.name
            )
          )
        )
      ),
      mapOpen && h('div', { className: 'v2-map-panel' }, p.slots && p.slots.map),
      p.isBulkShareMode
        ? h('div', { className: 'v2-bulk-places' }, p.slots && p.slots.toolbar, p.slots && p.slots.list)
        : h(
            'div',
            { className: 'bp-place-grid' },
            (p.places || []).map(place => {
              const category = (p.categories || []).find(c => c.id === place.categoryId);
              const visits = p.visitEntries ? p.visitEntries(place) : [];
              const planned = p.isPlanned ? p.isPlanned(place) : place.visitStatus === 'planned';
              return h(
                'article',
                { key: place.id, className: 'bp-place-card', 'data-place-id': place.id },
                h(
                  'button',
                  {
                    type: 'button',
                    className: 'bp-place-map-thumb',
                    'aria-label': `${place.alias || place.name} 지도 보기`,
                    onClick: () => select(place),
                  },
                  h(DesignIcon, { name: 'pin', size: 26, strokeWidth: 1.8 })
                ),
                h(
                  'div',
                  { className: 'bp-place-tags' },
                  h(
                    'span',
                    {
                      className: 'bp-place-tag',
                      style: {
                        color: category?.color || '#6b6580',
                        background: `${category?.color || '#6b6580'}22`,
                      },
                    },
                    category?.name || '기타'
                  ),
                  planned &&
                    h(
                      'span',
                      { className: 'bp-place-tag', style: { background: '#f3eeff', color: '#7c3aed' } },
                      '방문예정'
                    )
                ),
                h(
                  'button',
                  { type: 'button', className: 'v2-place-title-button', onClick: () => select(place) },
                  h('span', { className: 'bp-place-name' }, place.alias || place.name),
                  h('span', { className: 'bp-place-addr' }, place.address)
                ),
                h('p', { className: 'bp-place-note' }, visits[0]?.note || place.memo || ''),
                h(
                  'div',
                  { className: 'bp-place-meta-row' },
                  h(
                    'span',
                    { className: 'bp-place-visit-count' },
                    planned ? '방문 예정' : `방문 ${visits.length}회`
                  ),
                  h('span', { className: 'bp-place-last-visit' }, visits[0]?.date || ''),
                  h(IconButton, {
                    label: `${place.alias || place.name} 편집`,
                    icon: 'edit',
                    onClick: () => p.onEdit(place),
                  })
                )
              );
            })
          ),
      !(p.places || []).length && h(Empty, null, '검색 조건에 맞는 장소가 없습니다.'),
      h(Fab, { label: '장소 등록', onClick: p.onCompose })
    ),
    overlays(p.slots, ['map', 'toolbar', 'list'])
  );
}

/* -------------------------------------------------------------------------- */
/* Settlement                                                                  */
/* -------------------------------------------------------------------------- */

function settlementRows(card, calendar, fallbackExpense) {
  const names = card.participantRows?.length
    ? card.participantRows.map(row => row.participantId)
    : card.participants?.length
      ? card.participants
      : (calendar.participants || []).filter(p => !p.deletedAt).map(p => p.name);
  const personal = new Map();
  for (const item of card.personalExpenses || []) {
    const name = item.participantId || '참여자';
    const amount = item.signedAmount ? Number(item.amount) || 0 : -Math.abs(Number(item.amount) || 0);
    personal.set(name, (personal.get(name) || 0) + amount);
  }
  return calculateSettlementRows(Number(card.amount) || fallbackExpense, names, personal, card.depositorName);
}

const won = amount => `${Math.abs(Number(amount) || 0).toLocaleString('ko-KR')}원`;

export function SettlementScreen(p) {
  if (p.legacyView && !Array.isArray(p.cards)) {
    const slots = { ...extractSettlementSlots(p.legacyView), ...(p.slots || {}) };
    if (slots.body) {
      return h(
        'section',
        { className: 'v2-settlement v2-dest-page' },
        h(
          'div',
          { className: 'bp-app-shell' },
          h(PageHeader, {
            title: '정산',
            subtitle: p.subtitle || pageSubtitle(p.calendar),
            brand: pageBrand(p.calendar),
            onBack: p.onBack,
            onSearch: p.onSearch,
            searchLabel: '정산 검색',
            onShare: p.onShare,
            onMenu: p.onMenu,
          }),
          slots.tabs,
          h('div', { className: 'v2-dest-body v2-settlement-body' }, slots.body),
          h(Fab, { label: '지출 추가', onClick: p.onCompose })
        ),
        overlays(slots, ['body', 'tabs'])
      );
    }
    return h(
      'section',
      { className: 'v2-settlement v2-dest-page v2-wrap-legacy' },
      h(
        'div',
        { className: 'bp-app-shell' },
        h(PageHeader, {
          title: '정산',
          subtitle: p.subtitle || pageSubtitle(p.calendar),
          brand: pageBrand(p.calendar),
          onBack: p.onBack,
          onSearch: p.onSearch,
          searchLabel: '정산 검색',
          onShare: p.onShare,
          onMenu: p.onMenu,
        }),
        wrapLegacy(p.legacyView, 'v2-legacy-body v2-settlement-legacy'),
        h(Fab, { label: '지출 추가', onClick: p.onCompose })
      ),
      overlays(slots)
    );
  }

  const moveMonth = delta => {
    const d = new Date(p.year, p.month + delta, 1);
    p.onMonth(d.getFullYear(), d.getMonth());
  };

  return h(
    'section',
    { className: 'v2-settlement v2-dest-page' },
    h(
      'div',
      { className: 'bp-app-shell' },
      h(PageHeader, {
        title: '정산',
        subtitle: p.subtitle || pageSubtitle(p.calendar),
        brand: pageBrand(p.calendar),
      onBack: p.onBack,
      onSearch: p.onSearch,
      searchLabel: '정산 검색',
      onShare: p.onShare,
        onMenu: p.onMenu,
      }),
      h(
        'div',
        { className: 'bp-content' },
        h(
          'div',
          { className: 'bp-month-nav' },
          h(
            'button',
            { type: 'button', className: 'bp-month-nav-btn', 'aria-label': '이전달', onClick: () => moveMonth(-1) },
            h(DesignIcon, { name: 'chevronLeft', size: 18, strokeWidth: 2.2 })
          ),
          h('span', { className: 'bp-month-label' }, `${p.year}년 ${p.month + 1}월`),
          h(
            'button',
            { type: 'button', className: 'bp-month-nav-btn', 'aria-label': '다음달', onClick: () => moveMonth(1) },
            h(DesignIcon, { name: 'chevronRight', size: 18, strokeWidth: 2.2 })
          ),
          h(
            'button',
            {
              type: 'button',
              className: 'v2-period-toggle',
              'aria-pressed': p.activeTab === 'total',
              onClick: () => p.onTab(p.activeTab === 'total' ? 'daily' : 'total'),
            },
            p.activeTab === 'total' ? '누적보기' : '월별보기'
          )
        ),
        h(
          'div',
          { className: 'v2-settlement-summary' },
          (p.cards || []).map(card =>
            h(
              'article',
              { className: 'bp-settlement-card', key: card.id },
              h(
                'div',
                { className: 'bp-settlement-card-header' },
                h('strong', { className: 'bp-settlement-card-title' }, card.title || '정산'),
                h(
                  'button',
                  {
                    type: 'button',
                    className: 'bp-settlement-card-badge',
                    'aria-label': `${card.title || '정산'} 수정`,
                    onClick: () => p.onEdit(card),
                    style:
                      card.status === 'closed'
                        ? undefined
                        : { color: '#6b6580', background: '#fafafc' },
                  },
                  card.status === 'closed' ? '정산 완료' : '진행중'
                )
              ),
              h(
                'div',
                { className: 'bp-settlement-total-row' },
                '총 지출 ',
                h('b', null, won(Number(card.amount) || p.allTimeExpense))
              ),
              settlementRows(card, p.calendar, p.allTimeExpense).map(row =>
                h(
                  'div',
                  { className: 'bp-settlement-card-row', key: row.name },
                  h(
                    'div',
                    { className: 'bp-name-wrap' },
                    h('span', {
                      className: 'bp-dot',
                      style: {
                        background:
                          p.calendar.participants?.find(person => person.name === row.name)?.color || '#a78bfa',
                      },
                    }),
                    h('span', { className: 'bp-name' }, row.name)
                  ),
                  h(
                    'span',
                    { className: `bp-amt ${row.amount < 0 ? 'bp-is-refund' : 'bp-is-owe'}` },
                    `${row.amount < 0 ? '+' : row.amount > 0 ? '-' : ''}${won(row.amount)}`
                  )
                )
              ),
              h(
                'button',
                { type: 'button', className: 'bp-settlement-share-btn', onClick: p.onShare },
                '정산 카드 공유'
              )
            )
          ),
          h(
            'article',
            { className: 'bp-settlement-card' },
            h(
              'strong',
              { className: 'bp-settlement-card-title' },
              p.activeTab === 'total' ? '공금 누적 현황' : '이번 달 공금'
            ),
            [
              ['수입', p.displayIncome],
              ['지출', p.displayExpense],
              ['잔액', p.displayBalance],
            ].map(([label, amount]) =>
              h(
                'div',
                { className: 'bp-settlement-card-row', key: label },
                h('span', { className: 'bp-name' }, label),
                h('span', { className: 'bp-amt' }, `${amount < 0 ? '-' : ''}${won(amount)}`)
              )
            )
          ),
          h('button', { type: 'button', className: 'v2-load-more', onClick: p.onList }, '마감된 정산 포함 전체 목록')
        ),
        h(
          'div',
          { className: 'v2-expenses' },
          !(p.rows || []).length && h(Empty, null, '이 기간에 등록된 지출 내역이 없습니다.'),
          (p.rows || []).map(row =>
            h(
              'section',
              { key: row.meeting.date },
              h(
                'h3',
                { className: 'bp-expense-section-label' },
                row.meeting.date,
                row.meeting.note ? ` · ${row.meeting.note}` : ''
              ),
              row.items.map((item, i) =>
                h(
                  'button',
                  {
                    type: 'button',
                    className: 'bp-expense-row',
                    key: item.id || i,
                    onClick: () => p.onSelectDate(row.meeting.date),
                  },
                  h('span', {
                    className: 'bp-cat-dot',
                    style: { background: item.category?.color || '#83798f' },
                  }),
                  h(
                    'span',
                    { className: 'bp-expense-row-label' },
                    item.label,
                    h(
                      'small',
                      { className: 'bp-expense-row-payer' },
                      item.payerId
                        ? `${p.calendar.participants?.find(person => person.id === item.payerId)?.name || item.payerId} 결제`
                        : item.isSelfPay
                          ? '자비부담'
                          : item.isIncome
                            ? '공금수입'
                            : '공금지출',
                      item.payerId && item.isSelfPay ? ' · 자비부담' : ''
                    )
                  ),
                  h(
                    'span',
                    {
                      className: `bp-expense-row-amount ${item.isIncome ? 'bp-is-income' : 'bp-is-expense'}`,
                    },
                    `${item.isIncome ? '+' : '-'}${won(item.amount)}`
                  )
                )
              )
            )
          )
        )
      ),
      h(Fab, { label: '지출 추가', onClick: p.onCompose })
    ),
    overlays(p.slots)
  );
}

/* -------------------------------------------------------------------------- */
/* Chat                                                                        */
/* -------------------------------------------------------------------------- */

export function ChatScreen(p) {
  const React = window.React;
  const [toolsOpen, setToolsOpen] = React.useState(false);
  const slots = { ...(p.legacyView ? extractChatSlots(p.legacyView) : {}), ...(p.slots || {}) };
  const memberCount = (p.calendar?.participants || []).filter(person => !person.deletedAt).length;
  const subtitle = p.subtitle
    || pageSubtitle(p.calendar, memberCount ? `${memberCount}명` : '');

  // Preferred path: mock header + live message list + composer slots (ChatFull structure).
  // Require textarea+send so we can rebuild the composer row; otherwise fall back to wrap.
  if (slots.body && slots.composer && slots.textarea && slots.send && p.legacyView && React.isValidElement(p.legacyView)) {
    const clone = React.cloneElement;
    const originalRoot = Array.isArray(p.legacyView.props.children)
      ? p.legacyView.props.children[0]
      : p.legacyView.props.children;
    const composer = clone(
      slots.composer,
      {
        className: 'chat-composer v2-chat-composer',
        style: { ...slots.composer.props.style, transform: 'none', opacity: 1, pointerEvents: 'auto' },
      },
      slots.resize,
      slots.reply,
      slots.photos,
      slots.files,
      slots.fileInput,
      h(
        'div',
        { className: 'v2-chat-compose-row' },
        clone(slots.textarea, {
          className: 'bp-composer-input',
          placeholder: slots.textarea.props.placeholder || '메시지를 입력하세요...',
          style: {
            ...slots.textarea.props.style,
            minHeight: '44px',
            padding: '8px 14px',
            borderRadius: 'var(--radius-md)',
            resize: 'none',
          },
        }),
        clone(
          slots.send,
          { 'aria-label': '메시지 전송', className: 'bp-composer-send' },
          h(DesignIcon, { name: 'send', size: 16, strokeWidth: 2.4 })
        )
      ),
      h(
        'div',
        { className: 'v2-chat-compose-tools' },
        slots.participant || h('span', {
          className: 'v2-chat-participant-missing',
          role: 'status',
        }, '작성자 선택 필요'),
        h(
          'div',
          { className: 'v2-chat-tool-icons', role: 'toolbar', 'aria-label': '채팅 입력 도구' },
          slots.emoji
            ? clone(slots.emoji, {
                className: 'v2-tool-icon-btn',
                'aria-label': '이모티콘',
                title: '이모티콘',
              }, h(DesignIcon, { name: 'emoji', size: 18 }))
            : null,
          h('button', {
            type: 'button',
            className: `v2-tool-icon-btn${toolsOpen ? ' is-active' : ''}`,
            'aria-label': '밈', 'aria-pressed': toolsOpen, title: '밈',
            onClick: () => setToolsOpen(value => !value),
          }, h(DesignIcon, { name: 'meme', size: 18 })),
          slots.attach
            ? clone(slots.attach, {
                className: 'v2-tool-icon-btn',
                'aria-label': '사진 또는 파일 첨부',
                title: '사진 또는 파일 첨부',
              }, h(DesignIcon, { name: 'paperclip', size: 18 }))
            : null,
          slots.paste
            ? clone(slots.paste, {
                className: 'v2-tool-icon-btn',
                'aria-label': '붙여넣기',
                title: '붙여넣기',
              }, h(DesignIcon, { name: 'paste', size: 18 }))
            : null,
          slots.attach ? null : (p.onOpenGallery
            ? h('button', { type: 'button', className: 'v2-tool-icon-btn',
                'aria-label': '사진 또는 파일 첨부', title: '사진 또는 파일 첨부', onClick: p.onOpenGallery },
              h(DesignIcon, { name: 'paperclip', size: 18 })) : null)
        )
      ),
      toolsOpen && slots.memes
    );

    return h(
      'section',
      { className: `v2-chat v2-dest-page${p.isSearchOpen ? ' v2-chat-search-open' : ''}` },
      clone(
        originalRoot,
        { className: 'chat-room-container v2-chat-root' },
        h(PageHeader, {
          title: '채팅',
          subtitle,
          brand: pageBrand(p.calendar),
          onBack: p.onBack,
          onSearch: p.onSearch,
          searchLabel: '대화 검색',
          onMenu: p.onMenu,
        }),
        slots.notice,
        clone(slots.body, { className: 'v2-chat-scroll' }),
        composer,
        slots.lightbox
      ),
      overlays(slots, [
        'notice', 'body', 'composer', 'lightbox', 'resize', 'memes', 'reply', 'textarea',
        'photos', 'files', 'fileInput', 'participant', 'emoji', 'attach', 'paste', 'send',
      ])
    );
  }

  // Wrap path: inject dedicated header over the live ChatRoomView tree (no slot extraction yet).
  return h(
    'section',
    { className: `v2-chat v2-dest-page v2-wrap-legacy${p.isSearchOpen ? ' v2-chat-search-open' : ''}` },
    h(
      'div',
      { className: 'bp-app-shell v2-chat-shell' },
      h(PageHeader, {
        title: '채팅',
        subtitle,
        brand: pageBrand(p.calendar),
        onBack: p.onBack,
        onSearch: p.onSearch,
        searchLabel: '대화 검색',
        onMenu: p.onMenu,
      }),
      wrapLegacy(p.legacyView, 'v2-legacy-body v2-chat-legacy')
    ),
    overlays(slots)
  );
}

export const renderMemoScreen = props => { ensureDestinationStyles('memo'); return h(MemoScreen, props); };
export const renderPlacesScreen = props => { ensureDestinationStyles('places'); return h(PlacesScreen, props); };
export const renderSettlementScreen = props => { ensureDestinationStyles('settlement'); return h(SettlementScreen, props); };
export const renderChatScreen = props => { ensureDestinationStyles('chat'); return h(ChatScreen, props); };

/* -------------------------------------------------------------------------- */
/* Gallery / Content / Archive — V2 page frames (restyle legacy chrome in place) */
/* Dedicated Full mocks do not exist; match BentoPinkFinal IA + home density.   */
/* Header actions (search/share/menu) stay on the live feature tree.            */
/* -------------------------------------------------------------------------- */

export function GalleryScreen(p) {
  return h(
    'section',
    { className: 'v2-gallery v2-dest-page v2-embed-frame v2-records-media v2-has-page-header' },
    h(PageHeader, {
      title: '갤러리',
      subtitle: p.subtitle || pageSubtitle(p.calendar),
      brand: pageBrand(p.calendar),
      onBack: p.onBack,
      onSearch: p.onSearch,
      searchLabel: '갤러리 검색',
      onShare: p.onShare,
      onMenu: p.onMenu,
    }),
    wrapLegacy(p.legacyView, 'v2-legacy-body v2-gallery-legacy'),
    overlays(p.slots)
  );
}

export function ContentScreen(p) {
  return h(
    'section',
    { className: 'v2-content v2-dest-page v2-embed-frame v2-has-page-header' },
    h(PageHeader, {
      title: '컨텐츠',
      subtitle: p.subtitle || pageSubtitle(p.calendar),
      brand: pageBrand(p.calendar),
      onBack: p.onBack,
      onSearch: p.onSearch,
      searchLabel: '컨텐츠 검색',
      onShare: p.onShare,
      onMenu: p.onMenu,
    }),
    wrapLegacy(p.legacyView, 'v2-legacy-body v2-content-legacy'),
    overlays(p.slots)
  );
}

export function ArchiveScreen(p) {
  return h(
    'section',
    { className: 'v2-archive v2-dest-page v2-embed-frame v2-has-page-header' },
    h(PageHeader, {
      title: '보관함',
      subtitle: p.subtitle || pageSubtitle(p.calendar),
      brand: pageBrand(p.calendar),
      onBack: p.onBack,
      onSearch: p.onSearch,
      searchLabel: '보관함 검색',
      centerSubtitle: true,
      onShare: p.onShare,
      onMenu: p.onMenu,
    }),
    wrapLegacy(p.legacyView, 'v2-legacy-body v2-archive-legacy'),
    overlays(p.slots)
  );
}

export const renderGalleryScreen = props => h(GalleryScreen, props);
export const renderContentScreen = props => h(ContentScreen, props);
export const renderArchiveScreen = props => h(ArchiveScreen, props);
