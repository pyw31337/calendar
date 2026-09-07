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

export function SearchResultLogRow({ badgeName, badgeColor, timeStr, calendarLabel, onClick, children }) {
  const React = window.React;
  const __deps = window.GATHER_UI_DEPS || {};
  const __comp = window.GATHER_UI_COMPONENTS || {};

  const Tag = onClick ? "button" : "div";
  return /*#__PURE__*/React.createElement(Tag, {
    type: onClick ? "button" : undefined,
    onClick,
    style: {
      display: 'block', width: '100%', boxSizing: 'border-box', textAlign: 'left',
      padding: '10px 12px', borderRadius: 'var(--radius-md)', backgroundColor: '#F8FAFC', border: '1px solid var(--border-subtle)',
      cursor: onClick ? 'pointer' : 'default', font: 'inherit'
    }
  },
    /*#__PURE__*/React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px', flexWrap: 'wrap' } },
      badgeName && /*#__PURE__*/React.createElement("span", {
        style: { backgroundColor: badgeColor || '#94A3B8', color: '#FFFFFF', padding: '2px 8px', borderRadius: 'var(--radius-full)', fontSize: 'var(--font-size-xs)', fontWeight: 'bold', whiteSpace: 'nowrap' }
      }, badgeName),
      calendarLabel && /*#__PURE__*/React.createElement("span", {
        style: { fontSize: 'var(--font-size-xs)', color: 'var(--text-light)', fontWeight: 700 }
      }, calendarLabel)
    ),
    /*#__PURE__*/React.createElement("div", { style: { fontSize: 'var(--font-size-base)', color: 'var(--text-main)', lineHeight: 1.45, wordBreak: 'break-word' } }, children),
    timeStr && /*#__PURE__*/React.createElement("div", { style: { fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginTop: '6px' } }, timeStr)
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
  const [isMultiline, setIsMultiline] = React.useState(false);
  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const measure = () => {
      const cs = window.getComputedStyle(el);
      let lineHeight = parseFloat(cs.lineHeight);
      if (!Number.isFinite(lineHeight) || lineHeight <= 0) {
        lineHeight = (parseFloat(cs.fontSize) || 14) * 1.3;
      }
      setIsMultiline(el.scrollHeight > lineHeight * 1.5);
    };
    measure();
    if (typeof ResizeObserver === 'function') {
      const ro = new ResizeObserver(measure);
      ro.observe(el);
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
  const [ref, isMultiline] = useCapsuleAutoRadius(text);
  if (!text && !children) return null;
  return /*#__PURE__*/React.createElement(tag, {
    ref,
    title: title != null ? title : text,
    className: className || undefined,
    onClick,
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      borderRadius: isMultiline ? '10px' : 'var(--radius-full)',
      ...(style || {})
    }
  }, children || text);
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

// The single shared participant-select control -- solid color pill (participant's own color as
// background, white bold name, small ▼) that opens ChatParticipantSheet. This is the chat
// composer's original look; memo composer/edit, the chat edit modal, and the comment composer
// all render this exact component (not a local copy) so a future style change only has to
// happen here. Never re-implement this button inline at a call site -- import and use this.
export function ParticipantPickerButton({ participant, onClick, placeholder = '작성자 선택' }) {
  const React = window.React;

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
  }, participant?.name || placeholder, /*#__PURE__*/React.createElement("span", {
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
export function ParticipantBadge({ participant, style, className = '', children, ...rest }) {
  const React = window.React;
  if (!participant) return null;
  return /*#__PURE__*/React.createElement("span", {
    className: `participant-badge${className ? ' ' + className : ''}`,
    style: { backgroundColor: participant.color || '#94A3B8', color: '#FFFFFF', ...style },
    ...rest
  }, children || participant.name);
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
  });
}
