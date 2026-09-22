/**
 * Leftover small widgets (P4-24)
 */

/* P6 ESM classic-compat: free names that live scripts shared via global lexical scope */
function __gatherUiDeps() { return window.GATHER_UI_DEPS || {}; }
/* __fb() bridge */
function __fb() {
  const deps = __gatherUiDeps();
  if (deps && typeof deps.getDb === 'function') {
    try { const d = deps.getDb(); if (d) return d; } catch (e) {}
  }
  return (typeof window !== 'undefined' && window.__gatherFirebaseDb) || null;
}

export function SearchResultLogRow({ kindLabel, kindColor, badgeName, badgeColor, title, timeStr, calendarLabel, onClick, children }) {
  const React = window.React;
  const __deps = window.GATHER_UI_DEPS || {};
  const __comp = window.GATHER_UI_COMPONENTS || {};

  const Tag = onClick ? "button" : "div";
  const hasTitle = title != null && title !== '';
  return /*#__PURE__*/React.createElement(Tag, {
    type: onClick ? "button" : undefined,
    onClick,
    className: "global-search-result",
    style: {
      display: 'block', width: '100%', boxSizing: 'border-box', textAlign: 'left',
      padding: '14px 16px', borderRadius: '14px', backgroundColor: '#F8FAFC', border: '1px solid var(--border-subtle)',
      cursor: onClick ? 'pointer' : 'default', font: 'inherit'
    }
  },
    /*#__PURE__*/React.createElement("div", {
      className: "global-search-result-top",
      style: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: hasTitle || children ? '8px' : 0, flexWrap: 'wrap' }
    },
      kindLabel && /*#__PURE__*/React.createElement("span", {
        className: "global-search-result-kind",
        style: {
          backgroundColor: kindColor || badgeColor || '#94A3B8', color: '#FFFFFF',
          padding: '2px 8px', borderRadius: 'var(--radius-full)',
          fontSize: 'var(--font-size-xs)', fontWeight: 800, lineHeight: '18px', whiteSpace: 'nowrap'
        }
      }, kindLabel),
      badgeName && /*#__PURE__*/React.createElement("span", {
        className: kindLabel ? "global-search-result-path" : "global-search-result-kind",
        style: kindLabel ? {
          fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', fontWeight: 700, lineHeight: '18px'
        } : {
          backgroundColor: badgeColor || '#94A3B8', color: '#FFFFFF',
          padding: '2px 8px', borderRadius: 'var(--radius-full)',
          fontSize: 'var(--font-size-xs)', fontWeight: 800, lineHeight: '18px', whiteSpace: 'nowrap'
        }
      }, badgeName),
      calendarLabel && /*#__PURE__*/React.createElement("span", {
        style: { fontSize: 'var(--font-size-xs)', color: 'var(--text-light)', fontWeight: 700 }
      }, calendarLabel)
    ),
    hasTitle && /*#__PURE__*/React.createElement("div", {
      className: "global-search-result-title",
      style: { fontSize: 'var(--font-size-base)', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.45, wordBreak: 'break-word' }
    }, title),
    children ? /*#__PURE__*/React.createElement("div", {
      className: "global-search-result-meta",
      style: {
        fontSize: hasTitle ? 'var(--font-size-sm)' : 'var(--font-size-base)',
        color: hasTitle ? 'var(--text-muted)' : 'var(--text-main)',
        lineHeight: 1.45, wordBreak: 'break-word',
        marginTop: hasTitle ? '4px' : 0
      }
    }, children) : null,
    timeStr && /*#__PURE__*/React.createElement("div", {
      className: "global-search-result-time",
      style: { fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginTop: '8px' }
    }, timeStr)
  );
}

export function TikTokEmbedWidget({ url, videoId, onFailed }) {
  const React = window.React;
  const __deps = window.GATHER_UI_DEPS || {};
  const __comp = window.GATHER_UI_COMPONENTS || {};

  const containerRef = React.useRef(null);
  React.useEffect(() => {
    let cancelled = false;
    const script = document.createElement('script');
    script.src = 'https://www.tiktok.com/embed.js';
    script.async = true;
    document.body.appendChild(script);
    const detectFailure = () => {
      if (cancelled) return;
      const node = containerRef.current;
      if (!node) return;
      const hasPlayer = node.querySelector('iframe');
      const text = (node.textContent || '').toLowerCase();
      // TikTok sometimes injects a plain "overload-protect triggered" message instead of
      // firing an iframe error. Treat that as a hard embed failure and fall back to the normal
      // link-preview card so users never see TikTok's internal diagnostic text in a bubble.
      const hasTikTokInternalError = text.includes('overload-protect') || text.includes('triggered');
      if (!hasPlayer || hasTikTokInternalError) onFailed();
    };
    const observer = new MutationObserver(() => {
      if (cancelled) return;
      const node = containerRef.current;
      const text = (node?.textContent || '').toLowerCase();
      if (text.includes('overload-protect') || text.includes('triggered')) {
        onFailed();
      }
    });
    if (containerRef.current) observer.observe(containerRef.current, { childList: true, subtree: true, characterData: true });
    const timeoutId = setTimeout(detectFailure, 6000);
    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
      observer.disconnect();
      if (script.parentNode) script.parentNode.removeChild(script);
    };
  }, [url]);

  return /*#__PURE__*/React.createElement('div', {
    ref: containerRef,
    style: { width: '100%', maxWidth: '100%', minWidth: '0', margin: '0 auto', overflow: 'hidden', boxSizing: 'border-box' }
  }, /*#__PURE__*/React.createElement('blockquote', {
    className: 'tiktok-embed',
    cite: url,
    'data-video-id': videoId,
    style: { width: '100%', maxWidth: '100%', minWidth: '0', margin: '0 auto', boxSizing: 'border-box' }
  }, /*#__PURE__*/React.createElement('section', null)));
}

// Shared "Capsule" shape-switching module: every pill-shaped badge in the app that wraps
// arbitrary-length text (a memo note, a URL, ...) should read as a capsule while its content
// fits on one line, and switch to a gently-rounded box once it wraps to two or more lines --
// a full capsule around multi-line text looks like a mistake (the round ends stop meaning
// anything once there's a second line), while a 10px radius box reads fine at any height.
// There's no pure-CSS way to ask "did this text wrap past one line", so this measures the
// rendered element's height against its own line-height and flips a boolean once it's grown
// past ~1.5 lines. Attach the returned ref to the element carrying the text; read `isMultiline`
// to choose the border-radius.
export function useCapsuleAutoRadius(text) {
  const React = window.React;
  const ref = React.useRef(null);
  const [isMultiline, setIsMultiline] = React.useState(() => {
    const s = String(text || '').trim();
    return s.includes('\n');
  });
  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const s = String(text || '').trim();
    if (s.includes('\n')) {
      setIsMultiline(true);
      return undefined;
    }
    const measure = () => {
      try {
        const range = document.createRange();
        range.selectNodeContents(el);
        const rects = range.getClientRects();
        if (rects.length <= 1) {
          const isOverflowing = el.scrollWidth > el.clientWidth + 1;
          setIsMultiline(isOverflowing);
          return;
        }
        const firstTop = rects[0].top;
        const wrapped = Array.from(rects).some(r => Math.abs(r.top - firstTop) > 6);
        setIsMultiline(wrapped);
      } catch (err) {
        setIsMultiline(el.scrollWidth > el.clientWidth + 1);
      }
    };
    measure();
    const targetToObserve = el.parentElement || el;
    if (typeof ResizeObserver === 'function') {
      let lastWidth = targetToObserve.clientWidth;
      const ro = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const newWidth = entry.contentRect ? entry.contentRect.width : targetToObserve.clientWidth;
          if (Math.abs(newWidth - lastWidth) >= 1) {
            lastWidth = newWidth;
            measure();
          }
        }
      });
      ro.observe(targetToObserve);
      return () => ro.disconnect();
    }
    return undefined;
  }, [text]);
  return [ref, isMultiline];
}

// Generic reusable capsule-or-rounded-box text badge built on useCapsuleAutoRadius above --
// the module every new "capsule" badge should render through instead of hardcoding
// border-radius: var(--radius-full) inline.
export function CapsuleTextBadge({ text, title, tag = 'span', style = null, className = '', onClick, children }) {
  const React = window.React;
  const rawText = text != null ? String(text) : (typeof children === 'string' ? children : '');
  const [ref, isMultiline] = useCapsuleAutoRadius(rawText);
  if (!rawText && !children) return null;
  const multilineClass = isMultiline ? 'is-multiline' : '';
  const combinedClassName = [className, multilineClass].filter(Boolean).join(' ') || undefined;
  return /*#__PURE__*/React.createElement(tag, {
    ref,
    title: title != null ? title : (text || (typeof children === 'string' ? children : undefined)),
    className: combinedClassName,
    onClick,
    style: Object.assign(
      {
        display: isMultiline ? 'inline-block' : 'inline-flex',
        alignItems: isMultiline ? undefined : 'center',
        borderRadius: isMultiline ? '10px' : 'var(--radius-full, 999px)',
        boxSizing: 'border-box'
      },
      style || {},
      isMultiline ? {
        textAlign: 'left',
        padding: '6px 14px',
        lineHeight: '130%',
        borderRadius: '10px',
        wordBreak: 'break-word',
        maxWidth: '100%'
      } : {}
    )
  }, children != null ? children : text);
}

export function UrlCapsuleBadge({ url, style = null }) {
  const React = window.React;
  const __deps = window.GATHER_UI_DEPS || {};
  const __comp = window.GATHER_UI_COMPONENTS || {};
  const sanitizeText = __deps.sanitizeText;

  const href = sanitizeText(url || '', 500);
  const [ref, isMultiline] = useCapsuleAutoRadius(href);
  if (!href) return null;
  return /*#__PURE__*/React.createElement("button", {
    ref,
    type: "button",
    title: href,
    onClick: e => { e.stopPropagation(); window.open(href, '_blank', 'noopener,noreferrer'); },
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      padding: '3px 10px',
      borderRadius: isMultiline ? '10px' : 'var(--radius-full)',
      fontSize: 'var(--font-size-sm)',
      fontWeight: 600,
      border: 0,
      backgroundColor: 'var(--border-subtle)',
      color: '#475569',
      cursor: 'pointer',
      wordBreak: 'break-all',
      maxWidth: '100%',
      textAlign: 'left',
      ...(style || {})
    }
  }, href);
}

export function shortParticipantName(name) {
  const value = String(name || '').trim();
  return /^[가-힣]{3,4}$/.test(value) ? value.slice(1) : value;
}

// The single shared participant-select control -- solid color pill (participant's own color as
// background, white bold name, small ▼) that opens ChatParticipantSheet. This is the chat
// composer's original look; memo composer/edit, the chat edit modal, and the comment composer
// all render this exact component (not a local copy) so a future style change only has to
// happen here. Never re-implement this button inline at a call site -- import and use this.
export function ParticipantPickerButton({ participant, onClick, placeholder = '작성자 선택' }) {
  const React = window.React;
  const label = shortParticipantName(participant?.name) || placeholder;

  return /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "participant-picker-button",
    onClick,
    style: {
      backgroundColor: participant?.color || '#94A3B8',
      color: '#FFFFFF',
      border: 'none',
      borderRadius: 'var(--radius-full)',
      padding: '6px 14px',
      fontSize: 'var(--font-size-md)',
      fontWeight: 'bold',
      cursor: 'pointer',
      whiteSpace: 'nowrap',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      height: '32px',
      boxSizing: 'border-box',
      flexShrink: 0
    }
  }, label, /*#__PURE__*/React.createElement("span", {
    style: { fontSize: 'var(--font-size-2xs)' }
  }, "▼"));
}

// The single shared "참여자 뱃지" -- a solid pill showing a participant's name on their own color,
// white text. .participant-badge (app.css) already carries the real padding/radius/font-size, so
// this component exists to stop call sites from re-typing (and quietly drifting from) those same
// values inline -- before this, the day-cell grid, the admin dashboard rows, the admin activity
// log, and the user manual examples each had their own near-but-not-quite copy (0.68rem here,
// 0.7rem there, 0.72rem elsewhere, all meant to be the exact same badge). Pass `children` only
// when the badge needs more than the bare name (e.g. an inline remove button); otherwise it
// renders participant.name.
export function ParticipantBadge({ participant, style, className = '', asDot = false, children, ...rest }) {
  const React = window.React;
  if (!participant) return null;
  const badgeName = shortParticipantName(participant.name);
  if (asDot) {
    return /*#__PURE__*/React.createElement("span", {
      className: `v2-author-dot participant-dot${className ? ' ' + className : ''}`,
      role: "img",
      tabIndex: 0,
      "data-author-name": participant.name,
      title: participant.name,
      style: { backgroundColor: participant.color || '#94A3B8', ...style },
      ...rest
    });
  }
  return /*#__PURE__*/React.createElement("span", {
    className: `participant-badge${className ? ' ' + className : ''}`,
    style: { backgroundColor: participant.color || '#94A3B8', color: '#FFFFFF', ...style },
    ...rest
  }, children || badgeName);
}

export function DateCapsuleBadge({ date, style = null }) {
  const React = window.React;
  const __deps = window.GATHER_UI_DEPS || {};
  const __comp = window.GATHER_UI_COMPONENTS || {};

  const label = String(date || '').trim();
  if (!label) return null;
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      padding: '2px 8px',
      borderRadius: 'var(--radius-full)',
      fontSize: 'var(--font-size-sm)',
      fontWeight: 700,
      backgroundColor: 'rgba(99, 102, 241, 0.12)',
      color: '#4338CA',
      whiteSpace: 'nowrap',
      ...(style || {})
    }
  }, label);
}

/** Shared ns-resize grip used above the chat composer and under the places map. */
export function PanelResizeHandle({
  label = '높이 조절',
  className = '',
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
  onKeyDown,
}) {
  const React = window.React;
  return /*#__PURE__*/React.createElement("div", {
    className: `panel-resize-handle chat-composer-resize-handle${className ? ` ${className}` : ''}`,
    role: "separator",
    "aria-label": label,
    "aria-orientation": "horizontal",
    tabIndex: 0,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel,
    onKeyDown
  }, /*#__PURE__*/React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    width: "22",
    height: "14",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    className: "lucide lucide-grip-horizontal",
    "aria-hidden": "true"
  },
    /*#__PURE__*/React.createElement("circle", { cx: "12", cy: "9", r: "1" }),
    /*#__PURE__*/React.createElement("circle", { cx: "19", cy: "9", r: "1" }),
    /*#__PURE__*/React.createElement("circle", { cx: "5", cy: "9", r: "1" }),
    /*#__PURE__*/React.createElement("circle", { cx: "12", cy: "15", r: "1" }),
    /*#__PURE__*/React.createElement("circle", { cx: "19", cy: "15", r: "1" }),
    /*#__PURE__*/React.createElement("circle", { cx: "5", cy: "15", r: "1" })
  ));
}

  if (typeof window !== 'undefined') {
  window.GATHER_UI_COMPONENTS = Object.assign({}, window.GATHER_UI_COMPONENTS || {}, {
    SearchResultLogRow: SearchResultLogRow,
    TikTokEmbedWidget: TikTokEmbedWidget,
    UrlCapsuleBadge: UrlCapsuleBadge,
    CapsuleTextBadge: CapsuleTextBadge,
    useCapsuleAutoRadius: useCapsuleAutoRadius,
    ParticipantPickerButton: ParticipantPickerButton,
    ParticipantBadge: ParticipantBadge,
    DateCapsuleBadge: DateCapsuleBadge,
    PanelResizeHandle: PanelResizeHandle,
    shortParticipantName: shortParticipantName,
  });
}
