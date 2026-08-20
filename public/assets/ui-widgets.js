/**
 * Leftover small widgets (P4-24)
 */
(function () {
function SearchResultLogRow({ badgeName, badgeColor, timeStr, calendarLabel, onClick, children }) {
  const React = window.React;
  const __deps = window.GATHER_UI_DEPS || {};
  const __comp = window.GATHER_UI_COMPONENTS || {};

  const Tag = onClick ? "button" : "div";
  return /*#__PURE__*/React.createElement(Tag, {
    type: onClick ? "button" : undefined,
    onClick,
    style: {
      display: 'block', width: '100%', boxSizing: 'border-box', textAlign: 'left',
      padding: '10px 12px', borderRadius: '10px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0',
      cursor: onClick ? 'pointer' : 'default', font: 'inherit'
    }
  },
    /*#__PURE__*/React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px', flexWrap: 'wrap' } },
      badgeName && /*#__PURE__*/React.createElement("span", {
        style: { backgroundColor: badgeColor || '#94A3B8', color: getContrastTextColor(badgeColor || '#94A3B8'), padding: '2px 8px', borderRadius: 'var(--radius-full)', fontSize: '0.7rem', fontWeight: 'bold', whiteSpace: 'nowrap' }
      }, badgeName),
      calendarLabel && /*#__PURE__*/React.createElement("span", {
        style: { fontSize: '0.68rem', color: '#94A3B8', fontWeight: 700 }
      }, calendarLabel)
    ),
    /*#__PURE__*/React.createElement("div", { style: { fontSize: '0.84rem', color: '#0F172A', lineHeight: 1.45, wordBreak: 'break-word' } }, children),
    timeStr && /*#__PURE__*/React.createElement("div", { style: { fontSize: '0.7rem', color: '#94A3B8', marginTop: '6px' } }, timeStr)
  );
}

function TikTokEmbedWidget({ url, videoId, onFailed }) {
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
    const timeoutId = setTimeout(() => {
      if (cancelled) return;
      const hasPlayer = containerRef.current && containerRef.current.querySelector('iframe');
      if (!hasPlayer) onFailed();
    }, 6000);
    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
      if (script.parentNode) script.parentNode.removeChild(script);
    };
  }, [url]);

  return /*#__PURE__*/React.createElement('div', {
    ref: containerRef,
    // overflow:hidden is a safety net -- the real width clamp is the .tiktok-embed !important
    // rule in app.css, needed because embed.js sets its own inline pixel width on the iframe
    // it generates once loaded, which otherwise overrides anything set here from React.
    style: { width: 'min(88vw, 360px)', maxWidth: '500px', minWidth: '200px', margin: '0 auto', overflow: 'hidden' }
  }, /*#__PURE__*/React.createElement('blockquote', {
    className: 'tiktok-embed',
    cite: url,
    'data-video-id': videoId,
    style: { maxWidth: '100%', minWidth: '200px', margin: '0 auto' }
  }, /*#__PURE__*/React.createElement('section', null)));
}

function UrlCapsuleBadge({ url, style = null }) {
  const React = window.React;
  const __deps = window.GATHER_UI_DEPS || {};
  const __comp = window.GATHER_UI_COMPONENTS || {};
  const sanitizeText = __deps.sanitizeText;

  const href = sanitizeText(url || '', 500);
  if (!href) return null;
  return /*#__PURE__*/React.createElement("button", {
    type: "button",
    title: href,
    onClick: e => { e.stopPropagation(); window.open(href, '_blank', 'noopener,noreferrer'); },
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      padding: '3px 10px',
      borderRadius: 'var(--radius-full)',
      fontSize: '0.72rem',
      fontWeight: 600,
      border: 0,
      backgroundColor: '#E2E8F0',
      color: '#475569',
      cursor: 'pointer',
      wordBreak: 'break-all',
      maxWidth: '100%',
      textAlign: 'left',
      ...(style || {})
    }
  }, href);
}

function ParticipantPickerButton({ participant, onClick }) {
  const React = window.React;
  const __deps = window.GATHER_UI_DEPS || {};
  const __comp = window.GATHER_UI_COMPONENTS || {};

  return /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick,
    style: {
      backgroundColor: participant?.color || '#94A3B8',
      color: '#FFFFFF',
      border: 'none',
      borderRadius: 'var(--radius-full)',
      padding: '6px 14px',
      fontSize: '0.8rem',
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
  }, participant?.name || '작성자 선택', /*#__PURE__*/React.createElement("span", { style: { fontSize: '0.6rem' } }, "▼"));
}

function DateCapsuleBadge({ date, style = null }) {
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
      fontSize: '0.72rem',
      fontWeight: 700,
      backgroundColor: 'rgba(99, 102, 241, 0.12)',
      color: '#4338CA',
      whiteSpace: 'nowrap',
      ...(style || {})
    }
  }, label);
}

  window.GATHER_UI_COMPONENTS = Object.assign({}, window.GATHER_UI_COMPONENTS || {}, {
    SearchResultLogRow: SearchResultLogRow,
    TikTokEmbedWidget: TikTokEmbedWidget,
    UrlCapsuleBadge: UrlCapsuleBadge,
    ParticipantPickerButton: ParticipantPickerButton,
    DateCapsuleBadge: DateCapsuleBadge
  });
})();
