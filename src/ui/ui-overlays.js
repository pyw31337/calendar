/**
 * Overlay / emoji picker UI (P4-5)
 */
export function ImageUploadOverlay({ pct, remainingSec, label, current, total }) {
  const React = window.React;

  const clamped = Math.max(0, Math.min(100, pct || 0));
  // Only worth showing "(n/총장수)" once there's more than one photo in the batch -- a single
  // photo's own label ("사진 전송 중...") already says everything a "(1/1)" suffix would.
  const countSuffix = total > 1 ? ` (${Math.min(current || 1, total)}/${total})` : '';
  return /*#__PURE__*/React.createElement('div', {
    style: { position: 'fixed', inset: 0, backgroundColor: 'rgba(15,23,42,0.45)', zIndex: 100000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }
  }, /*#__PURE__*/React.createElement('div', {
    style: { backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '14px', padding: '24px 28px', width: '260px', maxWidth: '100%', textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.25)' }
  },
    /*#__PURE__*/React.createElement('div', { style: { fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-main)', marginBottom: '4px' } }, `${label || '사진 전송 중...'}${countSuffix}`),
    /*#__PURE__*/React.createElement('div', { style: { fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '14px' } },
      `${clamped}%${typeof remainingSec === 'number' ? ` · 약 ${remainingSec}초 남음` : ''}`),
    /*#__PURE__*/React.createElement('div', { style: { height: '8px', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--border-subtle)', overflow: 'hidden' } },
      /*#__PURE__*/React.createElement('div', { style: { height: '100%', width: `${clamped}%`, backgroundColor: '#4F46E5', transition: 'width 0.2s ease', borderRadius: 'var(--radius-full)' } })
    )
  ));
}

export function ImageProcessingOverlay({ current, total, fileName, pct, remainingSec }) {
  const React = window.React;

  if (!total) return null;
  const clamped = typeof pct === 'number' ? Math.max(0, Math.min(100, pct)) : Math.min(100, Math.round((current / total) * 100));
  return /*#__PURE__*/React.createElement('div', {
    style: { position: 'fixed', inset: 0, backgroundColor: 'rgba(15,23,42,0.45)', zIndex: 100000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }
  }, /*#__PURE__*/React.createElement('div', {
    style: { backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '14px', padding: '24px 28px', width: '260px', maxWidth: '100%', textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.25)' }
  },
    /*#__PURE__*/React.createElement('div', { style: { fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-main)', marginBottom: '4px' } }, '사진 변환 중...'),
    /*#__PURE__*/React.createElement('div', { style: { fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } },
      `${current}/${total}${fileName ? ` · ${fileName}` : ''} · ${clamped}%${typeof remainingSec === 'number' ? ` · 약 ${remainingSec}초 남음` : ''}`),
    /*#__PURE__*/React.createElement('div', { style: { height: '8px', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--border-subtle)', overflow: 'hidden' } },
      /*#__PURE__*/React.createElement('div', { style: { height: '100%', width: `${clamped}%`, backgroundColor: '#4F46E5', transition: 'width 0.2s ease', borderRadius: 'var(--radius-full)' } })
    )
  ));
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
      display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px',
      padding: 0, fontSize: '1.3rem', lineHeight: 1
    }
  }, imgFailed
    ? emoji
    : /*#__PURE__*/React.createElement('img', {
      src: twemojiImageUrl(emoji), alt: emoji, width: 24, height: 24, loading: 'lazy', draggable: false,
      onError: () => setImgFailed(true)
    }));
}

export function EmojiPickerSheet({ onSelect, onClose }) {
  const React = window.React;
  const __deps = window.GATHER_UI_DEPS || {};
  const EmojiGridButton = (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.EmojiGridButton) || __deps.EmojiGridButton;

  const [recents, setRecents] = React.useState(() => getRecentEmojis());
  const handlePick = (emoji) => {
    addRecentEmoji(emoji);
    setRecents(getRecentEmojis());
    onSelect(emoji);
  };
  const renderGroup = (label, emojis, key) => /*#__PURE__*/React.createElement('div', { key, style: { marginBottom: '10px' } },
    /*#__PURE__*/React.createElement('div', { style: { fontSize: '0.75rem', fontWeight: 700, color: '#94A3B8', margin: '4px 6px' } }, label),
    /*#__PURE__*/React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, 38px)', justifyContent: 'space-between' } },
      emojis.map((e, i) => /*#__PURE__*/React.createElement(EmojiGridButton, { key: `${key}-${i}`, emoji: e, onSelect: handlePick }))
    )
  );
  const sheet = /*#__PURE__*/React.createElement('div', {
    className: 'bottom-sheet-overlay emoji-sheet-overlay',
    onClick: onClose
  }, /*#__PURE__*/React.createElement('div', {
    className: 'bottom-sheet emoji-sheet',
    onClick: e => e.stopPropagation(),
    style: { maxHeight: '60vh' }
  },
    /*#__PURE__*/React.createElement('div', { className: 'bottom-sheet-header' },
      /*#__PURE__*/React.createElement('h4', null, '이모티콘'),
      /*#__PURE__*/React.createElement('button', {
        type: 'button', onClick: onClose,
        style: { background: 'none', border: 'none', color: '#64748B', fontSize: '1.2rem', cursor: 'pointer' }
      }, '✕')
    ),
    /*#__PURE__*/React.createElement('div', { style: { overflowY: 'auto', padding: '10px 14px 20px' } },
      recents.length > 0 && renderGroup('최근 사용', recents, 'recent'),
      EMOJI_CATEGORIES.map(cat => renderGroup(cat.label, cat.emojis, cat.label))
    )
  ));
  return ReactDOM.createPortal(sheet, document.body);
}

  if (typeof window !== 'undefined') {
  window.GATHER_UI_COMPONENTS = Object.assign({}, window.GATHER_UI_COMPONENTS || {}, {
    ImageUploadOverlay: ImageUploadOverlay,
    ImageProcessingOverlay: ImageProcessingOverlay,
    EmojiGridButton: EmojiGridButton,
    EmojiPickerSheet: EmojiPickerSheet
  });
}
