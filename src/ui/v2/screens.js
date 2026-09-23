/**
 * Dedicated chrome for ?shell=v2 destination screens (Chat / Memo / Places / Settlement).
 * Real feature views keep data + handlers; this layer supplies Full-mock chrome (header,
 * filters shell, FAB) and scopes reference CSS. Default shell never imports this module.
 */
import './dest-layout.css';
import './screens.css';
// Keep the responsive contract last among destination sheets, then dest-chrome-late
// so badge/tab/popup polish still wins the cascade.
import './responsive-audit.css';
import './dest-chrome-late.css';
import { calculateSettlementRows } from '../../core/settlement-calculator.js';
import { authorFor } from './view-data.js';
import { ChatBubbleFrame } from './chat-bubble-modules.js';
import {
  extractChatSlots, extractMemoSlots, extractSettlementSlots,
} from './shell-nav.js';

const h = (...args) => window.React.createElement(...args);

// Destination-only CSS is loaded when its tab is first rendered, instead of competing with the
// calendar home for the initial CSS download. Vite caches each dynamic CSS import after loading.
const destinationStyleLoaders = {
  memo: () => import('./reference-memo.css').then(() => import('./dest-chrome-late.css')),
  places: () => import('./reference-places.css').then(() => import('./dest-chrome-late.css')),
  settlement: () => import('./reference-settlement.css').then(() => import('./dest-chrome-late.css')),
  chat: () => import('./reference-chat.css').then(() => import('./dest-chrome-late.css')),
  gallery: () => import('./dest-chrome-late.css'),
  content: () => import('./dest-chrome-late.css'),
  archive: () => import('./dest-chrome-late.css'),
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

export function prefetchDestinationStyles() {
  Object.keys(destinationStyleLoaders).forEach(ensureDestinationStyles);
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
  paperclip: [
    ['path', { d: 'M21.4 11.6 12.9 20a5 5 0 0 1-7-7l8-8a3.5 3.5 0 0 1 5 5l-8 8a2 2 0 0 1-2.8-2.8l7.1-7.1' }],
  ],
  attach: [
    ['path', { d: 'M21.4 11.6 12.9 20a5 5 0 0 1-7-7l8-8a3.5 3.5 0 0 1 5 5l-8 8a2 2 0 0 1-2.8-2.8l7.1-7.1' }],
  ],
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
  chevronDown: [['path', { d: 'm6 9 6 6 6-6' }]],
  megaphone: [
    ['path', { d: 'M11 6a13 13 0 0 0 8.4-2.8A1 1 0 0 1 21 4v12a1 1 0 0 1-1.6.8A13 13 0 0 0 11 14H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z' }],
    ['path', { d: 'M6 14a12 12 0 0 0 2.4 7.2 2 2 0 0 0 3.2-2.4A8 8 0 0 1 10 14' }],
    ['path', { d: 'M8 6v8' }],
  ],
  clipboardPlus: [
    ['path', { d: 'M9 5h-2a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-12a2 2 0 0 0 -2 -2h-2' }],
    ['path', { d: 'M9 5a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2a2 2 0 0 1 -2 2h-2a2 2 0 0 1 -2 -2' }],
    ['path', { d: 'M10 14h4' }],
    ['path', { d: 'M12 12v4' }],
  ],
  cashPlus: [
    ['path', { d: 'M7 15h-3a1 1 0 0 1 -1 -1v-8a1 1 0 0 1 1 -1h12a1 1 0 0 1 1 1v3' }],
    ['path', { d: 'M12 19h-4a1 1 0 0 1 -1 -1v-8a1 1 0 0 1 1 -1h12a1 1 0 0 1 1 1v2.5' }],
    ['path', { d: 'M12 14a2 2 0 1 0 4 0a2 2 0 0 0 -4 0' }],
    ['path', { d: 'M16 19h6' }],
    ['path', { d: 'M19 16v6' }],
  ],
  receipt: [
    ['path', { d: 'M5 21v-16a2 2 0 0 1 2 -2h10a2 2 0 0 1 2 2v16l-3 -2l-2 2l-2 -2l-2 2l-2 -2l-3 2' }],
    ['path', { d: 'M9 7h6' }],
    ['path', { d: 'M9 11h6' }],
    ['path', { d: 'M13 15h2' }],
  ],
  fileUpload: [
    ['path', { d: 'M14 3v4a1 1 0 0 0 1 1h4' }],
    ['path', { d: 'M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2' }],
    ['path', { d: 'M12 11l0 6' }],
    ['path', { d: 'M9 14l6 0' }],
  ],
  link: [
    ['path', { d: 'M9 15l6 -6' }],
    ['path', { d: 'M11 6l.463 -.536a5 5 0 0 1 7.072 0a4.993 4.993 0 0 1 -.001 7.072' }],
    ['path', { d: 'M12.603 18.534a5.07 5.07 0 0 1 -7.127 0a4.972 4.972 0 0 1 0 -7.071l.524 -.463' }],
    ['path', { d: 'M16 19h6' }],
    ['path', { d: 'M19 16v6' }],
  ],
  mapPinPlus: [
    ['path', { d: 'M9 11a3 3 0 1 0 6 0a3 3 0 0 0 -6 0' }],
    ['path', { d: 'M12.794 21.322a2 2 0 0 1 -2.207 -.422l-4.244 -4.243a8 8 0 1 1 13.59 -4.616' }],
    ['path', { d: 'M16 19h6' }],
    ['path', { d: 'M19 16v6' }],
  ],
  scriptPlus: [
    ['path', { d: 'M17 19h4' }],
    ['path', { d: 'M14 20h-8a3 3 0 0 1 0 -6h11a3 3 0 0 0 -3 3m7 -3v-8a2 2 0 0 0 -2 -2h-10a2 2 0 0 0 -2 2v8' }],
    ['path', { d: 'M19 17v4' }],
  ],
  // Tabler map-2 outline (지역설정) -- exact paths from product request
  map2: [
    ['path', { d: 'M12 18.5l-3 -1.5l-6 3v-13l6 -3l6 3l6 -3v7.5' }],
    ['path', { d: 'M9 4v13' }],
    ['path', { d: 'M15 7v5.5' }],
    ['path', { d: 'M21.121 20.121a3 3 0 1 0 -4.242 0c.418 .419 1.125 1.045 2.121 1.879c1.051 -.89 1.759 -1.516 2.121 -1.879' }],
    ['path', { d: 'M19 18v.01' }],
  ],
  // Same glyphs as culture-grid-cols toggle (2-col / 1-col)
  layoutColumns: [
    ['path', { d: 'M3 4a1 1 0 0 1 1 -1h16a1 1 0 0 1 1 1v16a1 1 0 0 1 -1 1h-16a1 1 0 0 1 -1 -1v-16' }],
    ['path', { d: 'M12 3v18' }],
  ],
  layoutRows: [
    ['path', { d: 'M5 4a1 1 0 0 1 1 -1h12a1 1 0 0 1 1 1v16a1 1 0 0 1 -1 1h-12a1 1 0 0 1 -1 -1l0 -16' }],
  ],
  keyboard: [
    ['rect', { x: 2, y: 6, width: 20, height: 12, rx: 2 }],
    ['path', { d: 'M6 10h.01' }],
    ['path', { d: 'M10 10h.01' }],
    ['path', { d: 'M14 10h.01' }],
    ['path', { d: 'M18 10h.01' }],
    ['path', { d: 'M8 14h8' }],
  ],
  keyboardOff: [
    ['path', { d: 'M20 4H6' }],
    ['path', { d: 'M4 8h.01' }],
    ['path', { d: 'M8 8h.01' }],
    ['path', { d: 'M12 8h.01' }],
    ['path', { d: 'M16 8h.01' }],
    ['path', { d: 'M7 12h6' }],
    ['path', { d: 'm2 2 20 20' }],
    ['path', { d: 'M20 16V6a2 2 0 0 0-2-2' }],
    ['path', { d: 'M4 6v10a2 2 0 0 0 2 2h10' }],
  ],
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

function IconButton({ label, icon, onClick, size = 18, active = false }) {
  return h(
    'button',
    {
      type: 'button',
      className: 'bp-icon-btn' + (active ? ' is-active' : ''),
      'aria-label': label,
      'aria-pressed': active ? 'true' : 'false',
      onClick,
    },
    h(DesignIcon, { name: icon, size })
  );
}

function headerExtra(nodes) {
  const items = (nodes || []).filter(Boolean);
  if (!items.length) return null;
  return h(window.React.Fragment, null, ...items);
}

function layerPopup({ label, title, onClose, children }) {
  const ReactDOM = window.ReactDOM;
  const Box = (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.ResizableModalContainer) || 'div';
  const dialog = h(
    'div',
    { className: 'modal-overlay', onClick: onClose, style: { zIndex: 12000 } },
    h(
      Box,
      {
        className: 'modal-container',
        role: 'dialog',
        'aria-modal': true,
        'aria-label': label || title,
        onClick: event => event.stopPropagation(),
        style: { maxWidth: '560px', width: '92%', maxHeight: '86vh', display: 'flex', flexDirection: 'column' },
      },
      h(
        'div',
        { className: 'modal-header', style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: '1px solid var(--border-subtle)' } },
        h('h3', { style: { margin: 0, fontSize: '1.02rem', fontWeight: 900, color: 'var(--text-main)' } }, title),
        h(IconButton, { label: '닫기', icon: 'close', onClick: onClose })
      ),
      h('div', { className: 'modal-body', style: { overflowY: 'auto', padding: '14px 16px 18px' } }, children)
    )
  );
  if (ReactDOM && typeof ReactDOM.createPortal === 'function' && typeof document !== 'undefined') {
    return ReactDOM.createPortal(dialog, document.body);
  }
  return dialog;
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

export function PageHeader({ title, subtitle, brand, count, onBack, onSearch, searchLabel, onShare, onMenu, extra, centerSubtitle = true, hideOnScroll = true, showMenu = false, children }) {
  const React = window.React;
  const headerRef = React.useRef(null);
  const suppressUntilRef = React.useRef(0);
  const [hidden, setHidden] = React.useState(false);
  React.useEffect(() => {
    if (!hideOnScroll) {
      setHidden(false);
      return undefined;
    }
    const header = headerRef.current;
    if (!header) return undefined;
    const root = header.closest('section') || header.parentElement;
    let lastTop = 0;
    const onScroll = (event) => {
      const target = event.target;
      if (!target || target === document || target === window || typeof target.closest !== 'function') return;
      if (!root || !root.contains(target) || header.contains(target) || target.contains(header)) return;
      if (target.closest('.modal-overlay, .bottom-sheet-overlay, .bp-side-nav, textarea, input')) return;
      const top = target.scrollTop;
      if (typeof top !== 'number') return;
      if (Date.now() < suppressUntilRef.current) {
        lastTop = top;
        return;
      }
      const delta = top - lastTop;
      if (Math.abs(delta) < 6) return;
      // Opening a long list jumps scrollTop from 0 to the bottom in one
      // assignment. That is not a user gesture and must not collapse the header.
      if (lastTop === 0 && delta > 240) {
        lastTop = top;
        return;
      }
      const max = Math.max(0, (target.scrollHeight || 0) - (target.clientHeight || 0));
      lastTop = top;
      // Collapsing the header gives its box back to the list. Only do it when the
      // scroller still has room, otherwise the shrink clamps scrollTop and snaps back.
      // The layout change itself fires another scroll; ignore that echo or the
      // header hides and shows on every frame.
      let next = null;
      if (top < 8) next = false;
      else if (delta > 0 && top > 40 && max > 140) next = true;
      else if (delta < 0) next = false;
      if (next == null) return;
      setHidden(prev => {
        if (prev === next) return prev;
        suppressUntilRef.current = Date.now() + 450;
        return next;
      });
    };
    document.addEventListener('scroll', onScroll, true);
    return () => document.removeEventListener('scroll', onScroll, true);
  }, [hideOnScroll]);
  const shown = !hideOnScroll || !hidden;
  return h(
    'header',
    {
      ref: headerRef,
      className: `bp-header v2-page-header${centerSubtitle ? ' v2-page-header--centered' : ''}${shown ? '' : ' is-scroll-hidden'}`,
    },
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
        // Center brand text and search/share icons are not rendered. Destination
        // pages open the side menu from the purple FAB, so the header menu button
        // stays off unless `showMenu` is set (chat has no FAB). Chat renders the
        // notice icon first, then the menu button.
        h(
          'div',
          { className: 'bp-header-actions' },
          extra,
          showMenu && onMenu && h(IconButton, { label: `${title} 메뉴`, icon: 'menu', size: 20, onClick: onMenu })
        )
      ),
      children
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

function Fab({ label, onClick, icon = 'plus', className = '' }) {
  return h(
    'button',
    { type: 'button', className: `bp-fab${className ? ` ${className}` : ''}`, 'aria-label': label, onClick },
    h(DesignIcon, { name: icon, size: 22, strokeWidth: 2.4 })
  );
}

function Empty({ children }) {
  return h('div', { className: 'v2-empty', role: 'status' },
    h('p', { className: 'v2-empty-copy' }, children)
  );
}

function overlays(slots, except = []) {
  if (!slots) return null;
  const skip = new Set(except);
  const seen = new Set();
  return Object.entries(slots)
    .filter(([key, value]) => {
      if (skip.has(key) || value == null) return false;
      // Same React element in two parents → removeChild: node is not a child.
      if (seen.has(value)) return false;
      seen.add(value);
      return true;
    })
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
  // `memoFocus` is written by the V2 home card before its local tab handoff.
  // It keeps the destination deterministic even if an outer legacy context
  // rerender arrives between the click and MemoView mounting.
  const focusIdFromLocation = typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search).get('memoFocus') || ''
    : '';
  const focusedMemoId = p.focusedMemo?.id || focusIdFromLocation;
  // A home-card click should land the reader on the matching card, not merely
  // switch tabs.  The target can be an older shared memo outside the current
  // page window, so add it once when necessary before scrolling to it.
  const visibleMemos = window.React.useMemo(() => {
    const rows = Array.isArray(p.memos) ? p.memos.filter(Boolean) : [];
    if (!p.focusedMemo?.id || rows.some(memo => memo?.id === p.focusedMemo.id)) return rows;
    return [p.focusedMemo, ...rows];
  }, [p.memos, p.focusedMemo]);
  window.React.useEffect(() => {
    if (!focusedMemoId || typeof document === 'undefined') return undefined;
    const frame = window.requestAnimationFrame(() => {
      const target = [...document.querySelectorAll('[data-v2-memo-id]')]
        .find(element => element.getAttribute('data-v2-memo-id') === String(focusedMemoId));
      target?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [focusedMemoId]);
  // Dedicated-cards mode still receives the real MemoView's full legacy tree via p.legacyView
  // (only used for slot extraction here, never rendered directly) -- pull the "새로운 메모를
  // 남겨보세요..." composer card out of it the same way the legacyView+slots.body branch below
  // already does, so the inline top-of-list compose section isn't silently dropped just because
  // this page renders its own card list instead of wrapping the legacy body.
  const dedicatedComposerSlot = useDedicatedCards && p.legacyView
    ? extractMemoSlots(p.legacyView).composer
    : null;
  const memoHeaderExtra = headerExtra([
    typeof p.onCompose === 'function' && h(IconButton, { label: '메모 등록', icon: 'clipboardPlus', onClick: p.onCompose }),
  ]);
  const closeComposer = () => {
    if (typeof p.onCloseComposer === 'function') p.onCloseComposer();
  };
  const memoComposePopup = p.isComposerExpanded && dedicatedComposerSlot
    ? layerPopup({
      label: '메모 등록',
      title: '메모 등록',
      onClose: closeComposer,
      children: dedicatedComposerSlot,
    })
    : null;

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
              extra: memoHeaderExtra,
            },
            isSearchOpen && h(Search, {
              value: p.searchQuery || '',
              onChange: p.onSearch || (() => {}),
              placeholder: '메모 검색',
            })
          ),
          h('div', { className: 'v2-dest-body v2-memo-body' }, slots.body),
          h(Fab, { label: '메뉴', icon: 'menu', className: 'bp-menu-fab', onClick: p.onMenu })
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
            extra: memoHeaderExtra,
          },
          isSearchOpen && h(Search, {
            value: p.searchQuery || '',
            onChange: p.onSearch || (() => {}),
            placeholder: '메모 검색',
          })
        ),
        wrapLegacy(p.legacyView, 'v2-legacy-body v2-memo-legacy'),
        h(Fab, { label: '메뉴', icon: 'menu', className: 'bp-menu-fab', onClick: p.onMenu })
      )
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
          extra: memoHeaderExtra,
        },
        isSearchOpen && h(Search, {
          value: p.searchQuery,
          onChange: p.onSearch,
          placeholder: '메모 검색',
        })
      ),
      // screens.css's flex/overflow chain for .v2-memo only makes .v2-dest-body /
      // .v2-memo-body scrollable (the rest of the pane is overflow:hidden by design, matching
      // .v2-page-header's flex:0 0 auto sibling rule) -- the legacyView+slots.body branch above
      // already wraps its content in this class; the dedicated-cards branch here needs the same
      // wrapper or its list silently clips at one screen height with no way to reach the rest.
      h(
        'div',
        { className: 'v2-dest-body v2-memo-body' },
        p.isComposerExpanded ? ((p.slots && p.slots.shared) || null) : ((p.slots && p.slots.shared) || dedicatedComposerSlot),
        h(
          'div',
          { className: 'bp-memo-grid' },
          visibleMemos.map(memo => {
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
                name: null,
                color: author.color,
                meta,
                className: `v2-memo-card-wrap${memo.id === focusedMemoId ? ' v2-memo-card-is-focused' : ''}`,
                'data-v2-memo-id': memo.id,
                surfaceClassName: 'v2-memo-bubble-surface',
                surfaceProps: {
                  style: { '--memo-author-color': author.color },
                },
              },
              p.renderCard(memo)
            );
          })
        ),
        !visibleMemos.length && h(Empty, null, '검색 조건에 맞는 메모가 없습니다.'),
        p.hasMoreMemos &&
          h('button', { type: 'button', className: 'v2-load-more', onClick: p.onLoadMoreMemos }, '메모 더 보기')
      ),
      h(Fab, { label: '메뉴', icon: 'menu', className: 'bp-menu-fab', onClick: p.onMenu })
    ),
    memoComposePopup,
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
  const placeHeaderExtra = headerExtra([
    h(IconButton, {
      label: '지도보기',
      icon: 'map',
      onClick: () => {
        setMapOpen(value => !value);
        if (p.onToggleMap) p.onToggleMap();
      },
    }),
    typeof p.onCompose === 'function' && h(IconButton, { label: '장소 등록', icon: 'mapPinPlus', onClick: p.onCompose }),
  ]);

  if (!Array.isArray(p.places) && p.legacyView) {
    // Do not steal Leaflet map / list nodes out of the live PlacesView tree.
    // Reparenting PlaceMapView (Leaflet mutates the container's children) and/or
    // rendering the same slot in two parents throws:
    // "Failed to execute 'removeChild' on 'Node': The node to be removed is not a child of this node."
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
            extra: placeHeaderExtra,
          },
          isSearchOpen && h(Search, {
            value: p.searchQuery || '',
            onChange: p.onSearch || (() => {}),
            placeholder: '장소 검색',
          })
        ),
        wrapLegacy(p.legacyView, 'v2-legacy-body v2-places-legacy'),
        h(Fab, { label: '메뉴', icon: 'menu', className: 'bp-menu-fab', onClick: p.onMenu })
      )
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
          extra: placeHeaderExtra,
        },
        isSearchOpen && h(Search, {
          value: p.searchQuery,
          onChange: p.onSearch,
          placeholder: '장소 검색',
        })
      ),
      // Filters are body content. They share the page gutter and scroll with the list;
      // the header itself remains only the back/action chrome.
      h(
        'div',
        { className: 'v2-dest-controls bp-cat-filter-row', 'aria-label': '장소 분류' },
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
      h(Fab, { label: '메뉴', icon: 'menu', className: 'bp-menu-fab', onClick: p.onMenu })
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
  const settlementHeaderExtra = headerExtra([
    typeof p.onOpenCreate === 'function' && h(IconButton, { label: '정산 생성', icon: 'cashPlus', onClick: p.onOpenCreate }),
    typeof p.onOpenList === 'function' && h(IconButton, { label: '정산 목록', icon: 'receipt', onClick: p.onOpenList }),
  ]);
  if (p.legacyView && !Array.isArray(p.cards)) {
    const slots = { ...extractSettlementSlots(p.legacyView), ...(p.slots || {}) };
    if (slots.body) {
      const flushTabs = slots.tabs && window.React.isValidElement(slots.tabs)
        ? window.React.cloneElement(slots.tabs, {
            style: {
              ...(slots.tabs.props.style || {}),
              position: 'relative',
              top: 0,
              left: 'auto',
              right: 'auto',
              transform: 'none',
              zIndex: 4,
              width: '100%',
            },
          })
        : slots.tabs;
      const flushBody = window.React.isValidElement(slots.body)
        ? window.React.cloneElement(slots.body, {
            style: {
              ...(slots.body.props.style || {}),
              position: 'relative',
              top: 'auto',
              left: 'auto',
              right: 'auto',
              transform: 'none',
              padding: '8px 16px 96px',
            },
          })
        : slots.body;
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
            extra: settlementHeaderExtra,
          }, flushTabs),
          h('div', { className: 'v2-dest-body v2-settlement-body' }, flushBody),
          h(Fab, { label: '메뉴', icon: 'menu', className: 'bp-menu-fab', onClick: p.onMenu })
        ),
        overlays({ ...slots, tabs: flushTabs, body: flushBody }, ['body', 'tabs'])
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
          extra: settlementHeaderExtra,
        }),
        wrapLegacy(p.legacyView, 'v2-legacy-body v2-settlement-legacy'),
        h(Fab, { label: '메뉴', icon: 'menu', className: 'bp-menu-fab', onClick: p.onMenu })
      )
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
        extra: settlementHeaderExtra,
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
      h(Fab, { label: '메뉴', icon: 'menu', className: 'bp-menu-fab', onClick: p.onMenu })
    ),
    overlays(p.slots)
  );
}

/* -------------------------------------------------------------------------- */
/* Chat                                                                        */
/* -------------------------------------------------------------------------- */

export function ChatScreen(p) {
  const React = window.React;
  const [showScrollBottom, setShowScrollBottom] = React.useState(false);
  const [composerHidden, setComposerHidden] = React.useState(false);
  const slots = { ...(p.legacyView ? extractChatSlots(p.legacyView) : {}), ...(p.slots || {}) };
  const memberCount = (p.calendar?.participants || []).filter(person => !person.deletedAt).length;
  const subtitle = p.subtitle
    || pageSubtitle(p.calendar, memberCount ? `${memberCount}명` : '');
  const chatHeader = {
    title: '채팅',
    subtitle,
    brand: pageBrand(p.calendar),
    onBack: p.onBack,
    onSearch: p.onSearch,
    searchLabel: '대화 검색',
    onMenu: p.onMenu,
    showMenu: true,
    // Chat keeps the header and composer on screen. Auto-hide here fights the
    // list's scroll-to-bottom and the two collapse/expand in a loop.
    hideOnScroll: false,
    extra: typeof p.onOpenNotice === 'function'
      ? h(IconButton, { label: '공지사항', icon: 'megaphone', size: 20, onClick: p.onOpenNotice })
      : null,
  };

  React.useEffect(() => {
    const timer = setTimeout(() => {
      const el = document.querySelector('.v2-chat-scroll, .chat-messages-scroll');
      if (el) el.scrollTop = el.scrollHeight;
    }, 60);
    return () => clearTimeout(timer);
  }, []);

  // Preferred path: mock header + live message list + composer slots (ChatFull structure).
  // Require textarea+send so we can rebuild the composer row; otherwise fall back to wrap.
  if (slots.body && slots.composer && slots.textarea && slots.send && p.legacyView && React.isValidElement(p.legacyView)) {
    const clone = React.cloneElement;
    const legacyKids = React.Children.toArray(p.legacyView.props.children);
    const selfIsContainer = String(p.legacyView.props?.className || '').includes('chat-room-container');
    const originalRoot = selfIsContainer
      ? p.legacyView
      : (legacyKids.find(node =>
          React.isValidElement(node) && String(node.props?.className || '').includes('chat-room-container')
        ) || (Array.isArray(p.legacyView.props.children)
          ? p.legacyView.props.children[0]
          : p.legacyView.props.children));
    const passthrough = selfIsContainer
      ? []
      : legacyKids.filter(node => {
          if (node === originalRoot) return false;
          if (React.isValidElement(node) && String(node.props?.className || '').includes('chat-composer')) return false;
          return true;
        });
    const rootKids = React.isValidElement(originalRoot)
      ? React.Children.toArray(originalRoot.props.children)
      : [];
    const containsChatMessages = (node) => {
      if (!node || !React.isValidElement(node)) return false;
      if (node === slots.body) return true;
      const c = String(node.props?.className || '');
      if (c.includes('chat-messages-scroll')) return true;
      const ch = React.Children.toArray(node.props?.children);
      return ch.some(containsChatMessages);
    };

    const keptRootKids = rootKids.filter(node => {
      if (!node || node === slots.composer || node === slots.body || node === slots.notice) return false;
      const cls = String(node.props?.className || '');
      if (cls.includes('chat-room-header')) return false;
      if (cls.includes('chat-composer')) return false;
      if (cls.includes('chat-keyboard-reopen-btn')) return false;
      if (node.props?.['aria-label'] === '뒤로가기') return false;
      if (containsChatMessages(node)) return false;
      return true;
    });
    const composer = clone(
      slots.composer,
      {
        className: `chat-composer v2-chat-composer${composerHidden ? ' is-scroll-hidden' : ''}`,
        style: {
          ...(slots.composer.props?.style || {}),
          position: 'relative',
          left: 'auto',
          right: 'auto',
          top: 'auto',
          bottom: 'auto',
          transform: 'none',
        },
      },
      slots.resize,
      // V1 places the meme-tag row here (before the input row), so the tag chips read as
      // suggestions sitting above the text field. Ordering it after the input row/tools instead
      // (as this composer used to) put the chips below the field, which visually reads as
      // unrelated content trailing the composer rather than an autocomplete-style suggestion.
      slots.memes,
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
                type: 'button',
                'aria-label': '이모티콘',
                title: '이모티콘',
              }, h(DesignIcon, { name: 'emoji', size: 18 }))
            : null,
          slots.attach
            ? clone(slots.attach, {
                className: 'v2-tool-icon-btn',
                type: 'button',
                'aria-label': '사진 또는 파일 첨부',
                title: '사진 또는 파일 첨부',
              }, h(DesignIcon, { name: 'paperclip', size: 18 }))
            : null,
          slots.attach ? null : (p.onOpenGallery
            ? h('button', { type: 'button', className: 'v2-tool-icon-btn',
                'aria-label': '사진 또는 파일 첨부', title: '사진 또는 파일 첨부', onClick: p.onOpenGallery },
              h(DesignIcon, { name: 'paperclip', size: 18 })) : null),
          /* Keep the live paste control rather than synthesising a new clipboard flow.
             ChatRoom owns both the click-to-paste handler and textarea onPaste handler:
             text keeps the browser's Ctrl/Cmd+V behaviour, while pasted images become
             the same thumbnail attachments as the legacy composer. */
          slots.paste
            ? clone(slots.paste, {
                className: 'v2-tool-icon-btn',
                type: 'button',
                'aria-label': '붙여넣기',
                title: '붙여넣기',
              }, h(DesignIcon, { name: 'paste', size: 18 }))
            : null
        )
      )
    );

    return h(
      'section',
      { className: `v2-chat v2-dest-page${p.isSearchOpen ? ' v2-chat-search-open' : ''}` },
      clone(
        originalRoot,
        {
          className: 'chat-room-container v2-chat-root',
          style: {
            ...(originalRoot.props?.style || {}),
            bottom: p.viewportBottom ? `${p.viewportBottom}px` : 0,
            height: '100%',
            overflow: 'hidden',
          },
        },
        h(PageHeader, chatHeader),
        slots.notice,
        h(
          'div',
          { className: 'v2-chat-scroll-wrap' },
          clone(slots.body, {
            className: 'v2-chat-scroll',
            style: {
              ...(slots.body.props.style || {}),
              paddingTop: 8,
            },
            onScroll: (e) => {
              if (typeof slots.body.props.onScroll === 'function') slots.body.props.onScroll(e);
              const el = e.currentTarget;
              if (!el) return;
              setShowScrollBottom(el.scrollHeight - el.scrollTop - el.clientHeight > 160);
            }
          })
        ),
        h(
          'div',
          { className: 'v2-chat-jump-row' },
          h('button', {
            type: 'button',
            className: 'v2-chat-keyboard-btn',
            'aria-label': composerHidden ? '키보드 열기' : '키보드 닫기',
            title: composerHidden ? '키보드 열기' : '키보드 닫기',
            onClick: () => {
              setComposerHidden(hiddenNow => {
                if (hiddenNow) {
                  requestAnimationFrame(() => {
                    const input = document.querySelector('.v2-chat .bp-composer-input');
                    if (input && typeof input.focus === 'function') input.focus();
                  });
                }
                return !hiddenNow;
              });
            },
          }, h(DesignIcon, { name: composerHidden ? 'keyboard' : 'keyboardOff', size: 18 })),
          showScrollBottom ? h('button', {
            type: 'button',
            className: 'v2-chat-scroll-bottom-btn',
            'aria-label': '최근 대화로 이동',
            title: '최근 대화로 이동',
            onClick: () => {
              const el = document.querySelector('.v2-chat-scroll, .chat-messages-scroll');
              if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
            },
          }, h(DesignIcon, { name: 'chevronDown', size: 20 })) : h('span', { className: 'v2-chat-jump-spacer' })
        ),
        composer,
        ...keptRootKids
      ),
      ...passthrough,
      overlays(slots, [
        'notice', 'body', 'composer', 'lightbox', 'resize', 'memes', 'reply', 'textarea',
        'photos', 'files', 'fileInput', 'participant', 'emoji', 'keyboard', 'attach', 'paste', 'send',
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
      h(PageHeader, chatHeader),
      wrapLegacy(p.legacyView, 'v2-legacy-body v2-chat-legacy')
    )
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
  ensureDestinationStyles('gallery');
  return h(
    'section',
    { className: 'v2-gallery v2-dest-page v2-embed-frame v2-records-media v2-has-page-header' },
    h(PageHeader, {
      title: '갤러리',
      searchLabel: '갤러리 검색',
      onBack: p.onBack,
      onMenu: p.onMenu,
      onSearch: p.onSearch,
      extra: headerExtra([
        typeof p.onUploadFiles === 'function' && h(IconButton, { label: '파일 업로드', icon: 'fileUpload', onClick: p.onUploadFiles }),
        typeof p.onUploadLink === 'function' && h(IconButton, { label: '링크 업로드', icon: 'link', onClick: p.onUploadLink }),
      ]),
    },
      h('div', { id: 'v2-gallery-header-tabs-slot', className: 'v2-gallery-tabs-slot' })
    ),
    wrapLegacy(p.legacyView, 'v2-legacy-body v2-gallery-legacy'),
    p.onMenu && h(Fab, { label: '메뉴', icon: 'menu', className: 'bp-menu-fab', onClick: p.onMenu }),
    overlays(p.slots)
  );
}

function makeTabbedScreen(name, title) {
  return function(p) {
    ensureDestinationStyles(name);
    const extra = p.headerExtra || (name === 'content'
      ? headerExtra([
        typeof p.onOpenRegion === 'function' && h(IconButton, { label: '지역설정', icon: 'map2', onClick: p.onOpenRegion }),
        typeof p.onOpenRegister === 'function' && h(IconButton, { label: '컨텐츠 등록', icon: 'scriptPlus', onClick: p.onOpenRegister }),
        typeof p.onSetGridCols === 'function' && h(IconButton, {
          label: '그리드뷰', icon: 'layoutColumns', active: p.gridCols !== '1',
          onClick: () => p.onSetGridCols('2'),
        }),
        typeof p.onSetGridCols === 'function' && h(IconButton, {
          label: '리스트뷰', icon: 'layoutRows', active: p.gridCols === '1',
          onClick: () => p.onSetGridCols('1'),
        }),
      ])
      : null);
    return h(
      'section',
      { className: `v2-${name} v2-dest-page v2-embed-frame v2-has-page-header` },
      h(PageHeader, { title, onBack: p.onBack, onMenu: p.onMenu, extra },
        h('div', { id: `v2-${name}-header-tabs-slot`, className: `v2-${name}-tabs-slot` })
      ),
      wrapLegacy(p.legacyView, `v2-legacy-body v2-${name}-legacy`),
      p.onMenu && h(Fab, { label: '메뉴', icon: 'menu', className: 'bp-menu-fab', onClick: p.onMenu }),
      overlays(p.slots)
    );
  };
}
export const ContentScreen = makeTabbedScreen('content', '컨텐츠');
export const ArchiveScreen = makeTabbedScreen('archive', '보관함');

export const renderGalleryScreen = props => h(GalleryScreen, props);
export const renderContentScreen = props => h(ContentScreen, props);
export const renderArchiveScreen = props => h(ArchiveScreen, props);
