/**
 * Overlay / emoji picker UI (P4-5)
 */

/* P6 ESM classic-compat: free names that live scripts shared via global lexical scope */
const GATHER_APP_CHAT_DATA = window.GATHER_APP_CHAT_DATA || {};
const GATHER_APP_UTILS = window.GATHER_APP_UTILS || {};
const React = window.React;
function __gatherUiDeps() { return window.GATHER_UI_DEPS || {}; }
/* __fb() bridge */
function __fb() {
  const deps = __gatherUiDeps();
  if (deps && typeof deps.getDb === 'function') {
    try { const d = deps.getDb(); if (d) return d; } catch (e) {}
  }
  return (typeof window !== 'undefined' && window.__gatherFirebaseDb) || null;
}

const EMOJI_CATEGORIES = GATHER_APP_CHAT_DATA.EMOJI_CATEGORIES || [];
function getRecentEmojis(...args) {
  const f = __gatherUiDeps().getRecentEmojis || GATHER_APP_UTILS.getRecentEmojis;
  return typeof f === 'function' ? f(...args) : undefined;
}
function addRecentEmoji(...args) {
  const f = __gatherUiDeps().addRecentEmoji || GATHER_APP_UTILS.addRecentEmoji;
  return typeof f === 'function' ? f(...args) : undefined;
}
function twemojiImageUrl(...args) {
  const f = __gatherUiDeps().twemojiImageUrl || GATHER_APP_UTILS.twemojiImageUrl;
  return typeof f === 'function' ? f(...args) : undefined;
}
export function ImageUploadOverlay({ pct, remainingSec, label, current, total }) {
  const React = window.React;

  const clamped = Math.max(0, Math.min(100, pct || 0));
  const hasQueue = total > 1;
  const queueText = hasQueue ? `대기열 ${Math.min(current || 1, total)}/${total}` : '';
  const remainingText = typeof remainingSec === 'number' ? `약 ${remainingSec}초 남음` : '';
  return /*#__PURE__*/React.createElement('div', {
    role: 'status',
    'aria-live': 'polite',
    style: { position: 'fixed', top: 'calc(env(safe-area-inset-top, 0px) + 16px)', right: '16px', zIndex: 100000, width: '292px', maxWidth: 'calc(100vw - 32px)', pointerEvents: 'none' }
  }, /*#__PURE__*/React.createElement('div', {
    style: { backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '16px 18px', width: '100%', textAlign: 'left', boxShadow: '0 10px 30px rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column', gap: '8px' }
  },
    /*#__PURE__*/React.createElement('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' } },
      /*#__PURE__*/React.createElement('div', { style: { fontWeight: 900, fontSize: '0.95rem', color: 'var(--text-main)', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, label || '사진 전송 중...'),
      queueText && /*#__PURE__*/React.createElement('span', {
        style: {
          flexShrink: 0,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '4px 10px',
          borderRadius: 'var(--radius-full)',
          backgroundColor: 'var(--bg-primary)',
          color: 'var(--text-muted)',
          border: '1px solid var(--border-subtle)',
          fontSize: 'var(--font-size-sm)',
          fontWeight: 900,
          lineHeight: 1
        }
      }, queueText)
    ),
    /*#__PURE__*/React.createElement('div', { style: { fontSize: 'var(--font-size-md)', color: 'var(--text-muted)', lineHeight: 1.45 } },
      `${clamped}%${remainingText ? ` · ${remainingText}` : ''}${hasQueue ? ' · 순차 저장 중' : ''}`),
    /*#__PURE__*/React.createElement('div', { style: { height: '8px', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--border-subtle)', overflow: 'hidden' } },
      /*#__PURE__*/React.createElement('div', { style: { height: '100%', width: `${clamped}%`, backgroundColor: '#4F46E5', transition: 'width 0.2s ease', borderRadius: 'var(--radius-full)' } })
    )
  ));
}

export function ImageProcessingOverlay({ current, total, fileName, pct, remainingSec }) {
  const React = window.React;

  if (!total) return null;
  const clamped = typeof pct === 'number' ? Math.max(0, Math.min(100, pct)) : Math.min(100, Math.round((current / total) * 100));
  const queueText = total > 1 ? `파일 ${Math.min(current || 1, total)}/${total}` : '';
  const remainingText = typeof remainingSec === 'number' ? `약 ${remainingSec}초 남음` : '';
  return /*#__PURE__*/React.createElement('div', {
    role: 'status',
    'aria-live': 'polite',
    style: { position: 'fixed', top: 'calc(env(safe-area-inset-top, 0px) + 16px)', right: '16px', zIndex: 100000, width: '292px', maxWidth: 'calc(100vw - 32px)', pointerEvents: 'none' }
  }, /*#__PURE__*/React.createElement('div', {
    style: { backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '16px 18px', width: '100%', textAlign: 'left', boxShadow: '0 10px 30px rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column', gap: '8px' }
  },
    /*#__PURE__*/React.createElement('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' } },
      /*#__PURE__*/React.createElement('div', { style: { fontWeight: 900, fontSize: '0.95rem', color: 'var(--text-main)', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, '사진 변환 중...'),
      queueText && /*#__PURE__*/React.createElement('span', {
        style: {
          flexShrink: 0,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '4px 10px',
          borderRadius: 'var(--radius-full)',
          backgroundColor: 'var(--bg-primary)',
          color: 'var(--text-muted)',
          border: '1px solid var(--border-subtle)',
          fontSize: 'var(--font-size-sm)',
          fontWeight: 900,
          lineHeight: 1
        }
      }, queueText)
    ),
    /*#__PURE__*/React.createElement('div', { style: { fontSize: 'var(--font-size-md)', color: 'var(--text-muted)', lineHeight: 1.45, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } },
      `${clamped}%${remainingText ? ` · ${remainingText}` : ''}`),
    fileName && /*#__PURE__*/React.createElement('div', { style: { fontSize: 'var(--font-size-sm)', color: 'var(--text-light)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, fileName),
    /*#__PURE__*/React.createElement('div', { style: { height: '8px', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--border-subtle)', overflow: 'hidden' } },
      /*#__PURE__*/React.createElement('div', { style: { height: '100%', width: `${clamped}%`, backgroundColor: '#4F46E5', transition: 'width 0.2s ease', borderRadius: 'var(--radius-full)' } })
    )
  ));
}

export function MediaThumb({
  src = '',
  fallbackSrc = '',
  alt = '',
  loading = 'lazy',
  decoding = 'async',
  referrerPolicy = 'no-referrer',
  draggable = false,
  onClick,
  onLoad,
  onBroken,
  style = {},
  ...rest
}) {
  const React = window.React;
  const isSafeMediaSrc = value => {
    const candidate = String(value || '').trim();
    const validator = GATHER_APP_UTILS.isRenderableImageUrl;
    return typeof validator === 'function' && validator(candidate) ? candidate : '';
  };
  const primarySrc = isSafeMediaSrc(src);
  const secondarySrc = isSafeMediaSrc(fallbackSrc);
  const [currentSrc, setCurrentSrc] = React.useState(() => primarySrc || secondarySrc || '');
  const [isBroken, setIsBroken] = React.useState(false);

  React.useEffect(() => {
    setCurrentSrc(primarySrc || secondarySrc || '');
    setIsBroken(false);
  }, [primarySrc, secondarySrc]);

  const handleError = e => {
    if (secondarySrc && currentSrc !== secondarySrc) {
      setCurrentSrc(secondarySrc);
      return;
    }
    setIsBroken(true);
    if (typeof onBroken === 'function') onBroken(e, { src: primarySrc, fallbackSrc: secondarySrc, currentSrc });
  };

  if (isBroken) {
    return /*#__PURE__*/React.createElement("div", {
      ...rest,
      role: "img",
      "aria-label": alt || "이미지를 불러오지 못했습니다.",
      style: {
        ...style,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: style.backgroundColor || 'var(--bg-primary)',
        color: 'var(--text-muted)',
        overflow: 'hidden',
        boxSizing: 'border-box'
      }
    }, /*#__PURE__*/React.createElement("svg", {
      xmlns: "http://www.w3.org/2000/svg",
      width: "32",
      height: "32",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      className: "lucide lucide-image-off-icon lucide-image-off",
      style: { flexShrink: 0, opacity: 0.92 }
    }, /*#__PURE__*/React.createElement("line", { x1: "2", x2: "22", y1: "2", y2: "22" }), /*#__PURE__*/React.createElement("path", { d: "M10.41 10.41a2 2 0 1 1-2.83-2.83" }), /*#__PURE__*/React.createElement("line", { x1: "13.5", x2: "6", y1: "13.5", y2: "21" }), /*#__PURE__*/React.createElement("line", { x1: "18", x2: "21", y1: "12", y2: "15" }), /*#__PURE__*/React.createElement("path", { d: "M3.59 3.59A1.99 1.99 0 0 0 3 5v14a2 2 0 0 0 2 2h14c.55 0 1.052-.22 1.41-.59" }), /*#__PURE__*/React.createElement("path", { d: "M21 15V5a2 2 0 0 0-2-2H9" })));
  }

  if (!currentSrc) return null;

  return /*#__PURE__*/React.createElement('img', {
    ...rest,
    className: ['media-thumb', rest.className].filter(Boolean).join(' ') || 'media-thumb',
    src: currentSrc,
    alt,
    loading,
    decoding,
    referrerPolicy,
    draggable,
    onClick,
    onLoad,
    onError: handleError,
    style
  });
}

export function EmojiGridButton({ emoji, onSelect }) {
  const React = window.React;

  const [imgFailed, setImgFailed] = React.useState(false);
  return /*#__PURE__*/React.createElement('button', {
    type: 'button',
    title: emoji,
    onMouseDown: e => e.preventDefault(), // keep the chat textarea's focus/caret position intact
    onClick: () => onSelect(emoji),
    style: {
      width: '38px', height: '38px', border: 'none', background: 'none', cursor: 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 'var(--radius-md)',
      padding: 0, fontSize: '1.3rem', lineHeight: 1
    }
  }, imgFailed
    ? emoji
    : /*#__PURE__*/React.createElement('img', {
      src: twemojiImageUrl(emoji), alt: emoji, width: 24, height: 24, loading: 'lazy', decoding: 'async', draggable: false,
      onError: () => setImgFailed(true)
    }));
}

export function EmojiPickerSheet({ onSelect, onClose }) {
  const React = window.React;
  const __deps = window.GATHER_UI_DEPS || {};
  const EmojiGridButton = (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.EmojiGridButton) || __deps.EmojiGridButton;
  const sheetPanelRef = React.useRef(null);

  const [recents, setRecents] = React.useState(() => getRecentEmojis());
  const handlePick = (emoji) => {
    addRecentEmoji(emoji);
    setRecents(getRecentEmojis());
    onSelect(emoji);
  };
  const renderGroup = (label, emojis, key) => /*#__PURE__*/React.createElement('div', { key, style: { marginBottom: '10px' } },
    /*#__PURE__*/React.createElement('div', { style: { fontSize: 'var(--font-size-sm)', fontWeight: 700, color: 'var(--text-light)', margin: '4px 6px' } }, label),
    /*#__PURE__*/React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, 38px)', justifyContent: 'space-between' } },
      emojis.map((e, i) => /*#__PURE__*/React.createElement(EmojiGridButton, { key: `${key}-${i}`, emoji: e, onSelect: handlePick }))
    )
  );

  // Keep chat input (main section or chat room) visible above the sheet
  React.useEffect(() => {
    const root = document.documentElement;
    root.classList.add('emoji-sheet-open');

    const findPanels = () => {
      const list = [];
      document.querySelectorAll('.chat-composer, [data-chat-input-panel="1"]').forEach(el => list.push(el));
      return list;
    };

    const updateLift = () => {
      const panel = sheetPanelRef.current;
      let h = 0;
      if (panel) {
        h = Math.ceil(panel.getBoundingClientRect().height);
      }
      if (!h || h < 80) {
        h = Math.min(Math.round(window.innerHeight * 0.5), 420);
      }
      root.style.setProperty('--emoji-sheet-h', h + 'px');

      findPanels().forEach(el => {
        el.classList.add('emoji-sheet-lifted');
        // scroll-margin so scrollIntoView leaves room above the sheet
        el.style.scrollMarginBottom = (h + 16) + 'px';
      });

      // Prefer the focused field's panel, else first panel
      const active = document.activeElement;
      let target = null;
      if (active && active.closest) {
        target = active.closest('.chat-composer, [data-chat-input-panel="1"]');
      }
      if (!target) target = document.querySelector('.chat-composer.emoji-sheet-lifted, [data-chat-input-panel="1"].emoji-sheet-lifted');
      if (target && typeof target.scrollIntoView === 'function') {
        try {
          target.scrollIntoView({ block: 'end', behavior: 'smooth', inline: 'nearest' });
        } catch (_) {
          try { target.scrollIntoView(false); } catch (__) {}
        }
      }
    };

    const raf = requestAnimationFrame(() => {
      updateLift();
      requestAnimationFrame(updateLift);
    });
    // sheet layout may settle after fonts/images
    const t1 = setTimeout(updateLift, 50);
    const t2 = setTimeout(updateLift, 200);
    window.addEventListener('resize', updateLift);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener('resize', updateLift);
      root.classList.remove('emoji-sheet-open');
      root.style.removeProperty('--emoji-sheet-h');
      findPanels().forEach(el => {
        el.classList.remove('emoji-sheet-lifted');
        el.style.scrollMarginBottom = '';
      });
    };
  }, []);

  const sheet = /*#__PURE__*/React.createElement('div', {
    className: 'bottom-sheet-overlay emoji-sheet-overlay',
    onClick: onClose,
    style: {
      background: 'transparent',
      backgroundColor: 'transparent',
      backdropFilter: 'none',
      WebkitBackdropFilter: 'none'
    }
  }, /*#__PURE__*/React.createElement('div', {
    ref: sheetPanelRef,
    className: 'bottom-sheet emoji-sheet',
    onClick: e => e.stopPropagation(),
    style: { maxHeight: '60vh', boxShadow: '0 -8px 30px rgba(0,0,0,0.18)' }
  },
    /*#__PURE__*/React.createElement('div', { className: 'bottom-sheet-header' },
      /*#__PURE__*/React.createElement('h4', null, '이모티콘'),
      /*#__PURE__*/React.createElement('button', {
        type: 'button', onClick: onClose,
        style: { background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.2rem', cursor: 'pointer' }
      }, '✕')
    ),
    /*#__PURE__*/React.createElement('div', { style: { overflowY: 'auto', padding: '10px 14px 20px' } },
      recents.length > 0 && renderGroup('최근 사용', recents, 'recent'),
      EMOJI_CATEGORIES.map(cat => renderGroup(cat.label, cat.emojis, cat.label))
    )
  ));
  return ReactDOM.createPortal(sheet, document.body);
}

const ReactComponentBase = (typeof React !== 'undefined' && React.Component) ? React.Component : class {};
// Firestore's own internal watch-stream bookkeeping occasionally gets into a state it doesn't
// recognize (observed in production as rapid tab/page-navigation churn tearing down and
// re-attaching onSnapshot listeners) and throws "FIRESTORE (x.y.z) INTERNAL ASSERTION FAILED:
// Unexpected state" -- this is SDK-internal client state corruption, not app data corruption, so
// React re-rendering ("다시 시도") can never fix it: the same broken client object keeps throwing
// on the very next Firestore call. A full reload is the only thing that actually recovers (it
// constructs a fresh Firestore client), so this is auto-triggered once instead of leaving the
// user stuck re-tapping "다시 시도" for an error that inherently can't be dismissed away.
function isUnrecoverableFirestoreError(error) {
  return /INTERNAL ASSERTION FAILED/i.test(String(error?.message || error || ''));
}
class AppErrorBoundary extends ReactComponentBase {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error('Uncaught UI Error captured by AppErrorBoundary:', error, errorInfo);
    if (isUnrecoverableFirestoreError(error) && typeof window !== 'undefined' && typeof window.sessionStorage !== 'undefined') {
      // Guards against a reload loop if the corrupted state somehow survives the reload (e.g. a
      // network-level issue reproducing the same SDK error immediately) -- auto-reload fires at
      // most once per browser tab session, then falls back to the manual buttons below.
      const guardKey = 'gather_firestore_assertion_reload';
      if (!window.sessionStorage.getItem(guardKey)) {
        window.sessionStorage.setItem(guardKey, String(Date.now()));
        window.location.reload();
      }
    }
  }
  render() {
    if (this.state.hasError) {
      return React.createElement('div', {
        className: 'error-fallback-container',
        style: {
          padding: '24px',
          textAlign: 'center',
          margin: '20px auto',
          maxWidth: '600px',
          background: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid var(--border-subtle)',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.08)'
        }
      },
      React.createElement('div', { style: { fontSize: '2.5rem', marginBottom: '12px' } }, '⚠️'),
      React.createElement('h3', { style: { marginBottom: '8px', color: 'var(--text-main)', fontSize: '1.1rem', fontWeight: 700 } }, '화면 섹션을 불러오는 중 오류가 발생했습니다.'),
      React.createElement('p', { style: { marginBottom: '16px', color: 'var(--text-muted)', fontSize: '0.875rem', wordBreak: 'break-word' } }, (this.state.error && this.state.error.message) || '알 수 없는 오류가 발생했습니다.'),
      React.createElement('div', { style: { display: 'flex', gap: '10px', justifyContent: 'center' } },
        React.createElement('button', {
          onClick: () => this.setState({ hasError: false, error: null }),
          style: { padding: '8px 16px', background: '#F1F5F9', color: '#475569', border: '1px solid #CBD5E1', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: 'var(--font-size-base)' }
        }, '다시 시도'),
        React.createElement('button', {
          onClick: () => window.location.reload(),
          style: { padding: '8px 16px', background: '#4F46E5', color: '#FFFFFF', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: 'var(--font-size-base)' }
        }, '새로고침')
      )
      );
    }
    return this.props.children;
  }
}

  if (typeof window !== 'undefined') {
  window.GATHER_UI_COMPONENTS = Object.assign({}, window.GATHER_UI_COMPONENTS || {}, {
    AppErrorBoundary: AppErrorBoundary,
    ImageUploadOverlay: ImageUploadOverlay,
    ImageProcessingOverlay: ImageProcessingOverlay,
    MediaThumb: MediaThumb,
    EmojiGridButton: EmojiGridButton,
    EmojiPickerSheet: EmojiPickerSheet
  });
}
