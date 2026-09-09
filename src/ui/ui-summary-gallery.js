/**
 * Summary list, photo gallery, category tabs (P4-11)
 */

/* P6 ESM classic-compat: free names that live scripts shared via global lexical scope */
const GATHER_APP_UTILS = window.GATHER_APP_UTILS || {};
const GATHER_APP_CONSTANTS = window.GATHER_APP_CONSTANTS || {};
const BULK_NO_PARTICIPANT_ID = GATHER_APP_CONSTANTS.BULK_NO_PARTICIPANT_ID || '__none__';
function __gatherUiDeps() { return window.GATHER_UI_DEPS || {}; }
function getPhotoCommentIdentity(...args) {
  const f = __gatherUiDeps().getPhotoCommentIdentity || GATHER_APP_UTILS.getPhotoCommentIdentity;
  return typeof f === 'function' ? f(...args) : {};
}
function getPhotoCommentCount(...args) {
  const f = __gatherUiDeps().getPhotoCommentCount || GATHER_APP_UTILS.getPhotoCommentCount;
  return typeof f === 'function' ? f(...args) : 0;
}
function getPhotoAssetCommentKey(...args) {
  const f = __gatherUiDeps().getPhotoAssetCommentKey || GATHER_APP_UTILS.getPhotoAssetCommentKey;
  return typeof f === 'function' ? f(...args) : '';
}
function getActiveAvailabilities(calendar) {
  const f = __gatherUiDeps().getActiveAvailabilities || GATHER_APP_UTILS.getActiveAvailabilities;
  return typeof f === 'function' ? f(calendar) : [];
}
function getActiveParticipants(calendar) {
  const f = __gatherUiDeps().getActiveParticipants || GATHER_APP_UTILS.getActiveParticipants;
  return typeof f === 'function' ? f(calendar) : [];
}
function getCalendarPlaces(calendar) {
  const f = __gatherUiDeps().getCalendarPlaces || GATHER_APP_UTILS.getCalendarPlaces;
  return typeof f === 'function' ? f(calendar) : [];
}
/* __fb() bridge */
function __fb() {
  const deps = __gatherUiDeps();
  if (deps && typeof deps.getDb === 'function') {
    try { const d = deps.getDb(); if (d) return d; } catch (e) {}
  }
  return (typeof window !== 'undefined' && window.__gatherFirebaseDb) || null;
}

function extractFirstUrl(...args) {
  const f = __gatherUiDeps().extractFirstUrl || GATHER_APP_UTILS.extractFirstUrl;
  return typeof f === 'function' ? f(...args) : undefined;
}
function formatConfirmedMeetingLabel(...args) {
  const f = __gatherUiDeps().formatConfirmedMeetingLabel || GATHER_APP_UTILS.formatConfirmedMeetingLabel;
  return typeof f === 'function' ? f(...args) : (args[0] ? formatDateWithDayName(args[0]) : '');
}
function formatDateWithDayName(...args) {
  const f = __gatherUiDeps().formatDateWithDayName || GATHER_APP_UTILS.formatDateWithDayName;
  return typeof f === 'function' ? f(...args) : undefined;
}
function normalizeDateString(...args) {
  const f = __gatherUiDeps().normalizeDateString || GATHER_APP_UTILS.normalizeDateString;
  return typeof f === 'function' ? f(...args) : '';
}
function getContrastTextColor(...args) {
  const f = __gatherUiDeps().getContrastTextColor || GATHER_APP_UTILS.getContrastTextColor;
  return typeof f === 'function' ? f(...args) : undefined;
}
function getDisplayPlaceAddress(...args) {
  const f = __gatherUiDeps().getDisplayPlaceAddress || GATHER_APP_UTILS.getDisplayPlaceAddress;
  return typeof f === 'function' ? f(...args) : undefined;
}
function normalizeDomesticKoreanAddress(...args) {
  const f = __gatherUiDeps().normalizeDomesticKoreanAddress || GATHER_APP_UTILS.normalizeDomesticKoreanAddress;
  return typeof f === 'function' ? f(...args) : undefined;
}
function isTombstone(...args) {
  const f = __gatherUiDeps().isTombstone || GATHER_APP_UTILS.isTombstone;
  return typeof f === 'function' ? f(...args) : undefined;
}
function isValidDateString(...args) {
  const f = __gatherUiDeps().isValidDateString || GATHER_APP_UTILS.isValidDateString;
  return typeof f === 'function' ? f(...args) : undefined;
}
function removeFirstUrl(...args) {
  const f = __gatherUiDeps().removeFirstUrl || GATHER_APP_UTILS.removeFirstUrl;
  return typeof f === 'function' ? f(...args) : undefined;
}
function doesPlaceMatchDate(...args) {
  const f = __gatherUiDeps().doesPlaceMatchDate || GATHER_APP_UTILS.doesPlaceMatchDate;
  return typeof f === 'function' ? f(...args) : undefined;
}
function getTrulyConfirmedMeetings(...args) {
  const f = __gatherUiDeps().getTrulyConfirmedMeetings || GATHER_APP_UTILS.getTrulyConfirmedMeetings;
  return typeof f === 'function' ? f(...args) : undefined;
}
function getConfirmedMeetings(...args) {
  const f = __gatherUiDeps().getConfirmedMeetings || GATHER_APP_UTILS.getConfirmedMeetings;
  return typeof f === 'function' ? f(...args) : undefined;
}
function getMessageImageEntries(...args) {
  const f = __gatherUiDeps().getMessageImageEntries || GATHER_APP_UTILS.getMessageImageEntries;
  return typeof f === 'function' ? f(...args) : undefined;
}
function getMessageDirectMediaEntry(...args) {
  const f = __gatherUiDeps().getMessageDirectMediaEntry || GATHER_APP_UTILS.getMessageDirectMediaEntry;
  return typeof f === 'function' ? f(...args) : undefined;
}
function normalizePhotoUrl(value) {
  const candidate = typeof value === 'string' ? value.trim() : '';
  const validator = GATHER_APP_UTILS.isRenderableImageUrl;
  return typeof validator === 'function' && validator(candidate) ? candidate : '';
}

// Combines chat message images, memo images, and confirmed-meeting photos into one flat, deduped,
// newest-first list -- shared by PhotoGallery (갤러리 페이지) and HistoryView's 인물/추억 tabs so
// both browse exactly the same photo set instead of two independently-built ones drifting apart.
function buildCombinedPhotoEntries(chatMessages, memos, calendar, anniversaries = []) {
  const __deps = window.GATHER_UI_DEPS || {};
  const resolveMeetingPhotoDisplay = __deps.resolveMeetingPhotoDisplay;
  const sorted = [...(chatMessages || [])].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
  const chatEntries = sorted.flatMap(msg => {
    if (!msg || isTombstone(msg)) return [];
    const directEntry = getMessageDirectMediaEntry(msg);
    const entries = directEntry ? [...getMessageImageEntries(msg), directEntry] : getMessageImageEntries(msg);
    return entries.map((entry) => ({ ...entry, source: entry.source || 'chat', timestamp: msg.timestamp }));
  });
  const memoEntries = (memos || []).flatMap(memo => {
    if (!memo || isTombstone(memo)) return [];
    const memoImageTags = Array.isArray(memo.imageTags) ? memo.imageTags : [];
    const asMsg = {
      id: memo.id, text: memo.text || memo.content || memo.body || '',
      imageUrl: memo.imageUrl, imageUrls: memo.imageUrls, thumbUrl: memo.thumbUrl, thumbUrls: memo.thumbUrls,
      imageTags: memoImageTags,
      timestamp: memo.updatedAt || memo.createdAt || 0, participantId: memo.participantId || '',
      uploadSource: 'memo'
    };
    const directEntry = getMessageDirectMediaEntry(asMsg);
    const entries = directEntry ? [...getMessageImageEntries(asMsg), directEntry] : getMessageImageEntries(asMsg);
    return entries.map((entry, idx) => ({
      ...entry,
      tags: String(entry.tags || memoImageTags[entry.imageIndex ?? idx] || ''),
      source: 'memo',
      timestamp: asMsg.timestamp
    }));
  });
  const meetingEntries = [];
  getConfirmedMeetings(calendar).forEach(meeting => {
    const photos = Array.isArray(meeting?.photos) ? meeting.photos : [];
    photos.forEach((photo, index) => {
      if (!photo || isTombstone(photo)) return;
      const resolved = resolveMeetingPhotoDisplay ? resolveMeetingPhotoDisplay(photo, chatMessages) : null;
      const full = normalizePhotoUrl(resolved?.imageUrl || photo?.imageUrl || photo?.full || '');
      const thumb = normalizePhotoUrl(resolved?.thumbUrl || photo?.thumbUrl || photo?.thumb || full);
      if (!full && !thumb) return;
      const mediaKey = resolved?.mediaKey
        || photo?.mediaKey
        || (photo?.sourceMessageId && Number.isInteger(photo?.sourceImageIndex)
          ? `chat:${photo.sourceMessageId}:${photo.sourceImageIndex}`
          : `meeting:${meeting.date || 'date'}:${photo?.id || index}`);
      const refKey = resolved?.refKey || photo?.refKey || `meeting:${meeting.date || 'date'}:${photo?.id || index}`;
      meetingEntries.push({
        full: full || thumb,
        thumb: thumb || full,
        imageIndex: index,
        messageId: null,
        photoId: photo?.id || '',
        sourceMessageId: photo?.sourceMessageId || '',
        sourceImageIndex: Number.isInteger(photo?.sourceImageIndex) ? photo.sourceImageIndex : null,
        timestamp: Number(photo?.createdAt || photo?.updatedAt || meeting?.confirmedAt || 0),
        tags: String(resolved?.tags ?? photo?.tags ?? ''),
        directMediaUrl: '',
        source: 'meeting',
        meetingDate: meeting.date || '',
        mediaKey,
        refKey
      });
    });
  });
  // Anniversary photos live on the anniversary document itself rather than in chat/memo or
  // confirmed-meeting photo arrays. Keep them in the same flat source used by the History
  // memories tab so a calendar event with an attached photo is always discoverable there.
  const anniversaryEntries = [];
  (Array.isArray(anniversaries) ? anniversaries : []).forEach(anniversary => {
    const photos = Array.isArray(anniversary?.photos) ? anniversary.photos : [];
    const anniversaryDate = String(anniversary?.date || anniversary?.startDate || anniversary?.endDate || '').slice(0, 10);
    photos.forEach((photo, index) => {
      const full = normalizePhotoUrl(photo?.imageUrl || photo?.url || photo?.full || photo?.src || '');
      const thumb = normalizePhotoUrl(photo?.thumbUrl || photo?.thumbnailUrl || photo?.thumb || full);
      if (!full && !thumb) return;
      const mediaKey = photo?.mediaKey || `anniversary:${anniversary?.id || anniversaryDate || 'date'}:${photo?.id || index}`;
      const refKey = photo?.refKey || mediaKey;
      anniversaryEntries.push({
        full: full || thumb,
        thumb: thumb || full,
        imageIndex: index,
        messageId: null,
        photoId: photo?.id || '',
        sourceMessageId: '',
        sourceImageIndex: null,
        timestamp: Number(photo?.createdAt || photo?.updatedAt || anniversary?.updatedAt || 0),
        tags: String(photo?.tags || ''),
        directMediaUrl: '',
        source: 'anniversary',
        anniversaryId: anniversary?.id || '',
        meetingDate: anniversaryDate,
        mediaKey,
        refKey
      });
    });
  });
  const byUrl = new Map();
  const sourceRank = { chat: 0, memo: 1, meeting: 2, anniversary: 3 };
  [...chatEntries, ...memoEntries, ...meetingEntries, ...anniversaryEntries].forEach(entry => {
    const key = entry.mediaKey || entry.refKey || entry.full || entry.thumb;
    if (!key) return;
    const existing = byUrl.get(key);
    if (!existing) {
      byUrl.set(key, { ...entry });
    } else if ((sourceRank[entry.source] ?? 9) < (sourceRank[existing.source] ?? 9)) {
      byUrl.set(key, { ...entry, meetingDate: entry.meetingDate || existing.meetingDate || '' });
    } else if (!existing.meetingDate && entry.meetingDate) {
      existing.meetingDate = entry.meetingDate;
    }
  });
  return Array.from(byUrl.values()).sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
}
function copyTextToClipboard(...args) {
  const f = __gatherUiDeps().copyTextToClipboard || GATHER_APP_UTILS.copyTextToClipboard;
  return typeof f === 'function' ? f(...args) : undefined;
}
function useScrollHideHeader() {
  const React = window.React;
  const [isHeaderVisible, setIsHeaderVisible] = React.useState(true);
  const lastScrollTopRef = React.useRef(0);
  const onScroll = React.useCallback((e) => {
    const el = e && e.target;
    const scrollTop = el && typeof el.scrollTop === 'number' ? el.scrollTop : 0;
    const lastScrollTop = lastScrollTopRef.current;
    const delta = scrollTop - lastScrollTop;
    lastScrollTopRef.current = scrollTop;
    // Ignore sub-pixel / rubber-band noise
    if (Math.abs(delta) < 4) return;
    const maxScroll = el ? Math.max(0, (el.scrollHeight || 0) - (el.clientHeight || 0)) : 0;
    // Near the bottom, never re-show from tiny upward deltas (padding oscillation)
    const nearBottom = maxScroll > 0 && (maxScroll - scrollTop) < 64;
    if (scrollTop < 10) {
      setIsHeaderVisible(true);
    } else if (delta > 0 && scrollTop > 56) {
      setIsHeaderVisible(false);
    } else if (delta < 0 && !nearBottom) {
      setIsHeaderVisible(true);
    }
  }, []);
  return { isHeaderVisible, onScroll };
}
function isDateConfirmedMeeting(...args) {
  const f = __gatherUiDeps().isDateConfirmedMeeting || GATHER_APP_UTILS.isDateConfirmedMeeting;
  return typeof f === 'function' ? f(...args) : undefined;
}
function calculateDday(...args) {
  const f = __gatherUiDeps().calculateDday || GATHER_APP_UTILS.calculateDday;
  return typeof f === 'function' ? f(...args) : undefined;
}
export function SectionCountBadge({ count }) {
  const React = window.React;
  const normalizedCount = Number(count || 0);

  if (!Number.isFinite(normalizedCount) || normalizedCount <= 0) return null;

  return /*#__PURE__*/React.createElement("span", {
    className: "section-count-badge"
  }, normalizedCount);
}

export function SectionToggleButton({ collapsed, onToggle, label }) {
  const React = window.React;

  return /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: `section-toggle-btn${collapsed ? ' is-collapsed' : ''}`,
    "aria-label": label,
    "aria-expanded": !collapsed,
    onClick: event => {
      event.stopPropagation();
      onToggle();
    }
  }, /*#__PURE__*/React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    width: "24",
    height: "24",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    className: "icon icon-tabler icons-tabler-outline icon-tabler-chevron-down"
  }, /*#__PURE__*/React.createElement("path", {
    stroke: "none",
    d: "M0 0h24v24H0z",
    fill: "none"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M6 9l6 6l6 -6"
  })));
}

function handleSectionHeaderKeyDown(event, onToggle) {
  if (event.key !== 'Enter' && event.key !== ' ') return;
  event.preventDefault();
  onToggle();
}

export function SearchCategoryTabs({ tabs, activeKey, onSelect, containerStyle, tabPadding, tabTextStyle, countBadgeClassName, countBadgeStyle }) {
  const React = window.React;

  return /*#__PURE__*/React.createElement("div", {
    style: { display: 'grid', gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))`, overflow: 'hidden', borderBottom: '1px solid var(--border-subtle)', ...containerStyle }
  }, tabs.map(tab => {
    const count = Number(tab.count || 0);
    return /*#__PURE__*/React.createElement("button", {
      key: tab.key,
      type: "button",
      onClick: () => onSelect(tab.key),
      style: {
        minWidth: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
        padding: tabPadding || '10px 4px', fontSize: 'var(--font-size-md)', fontWeight: 800,
        background: 'none', border: 'none', cursor: 'pointer',
        color: activeKey === tab.key ? '#2563EB' : '#64748B',
        borderBottom: activeKey === tab.key ? '3px solid #2563EB' : '3px solid transparent',
        marginBottom: '-1px',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        ...tabTextStyle
      }
    }, tab.label, count > 0 && /*#__PURE__*/React.createElement("span", {
        className: countBadgeClassName || undefined,
        style: {
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          verticalAlign: 'middle',
          lineHeight: 1,
          minWidth: '20px',
          height: '18px',
          borderRadius: 'var(--radius-full)',
          backgroundColor: tab.color || tab.badgeColor || '#2563EB',
          color: '#FFFFFF',
          fontSize: 'var(--font-size-xs)',
          fontWeight: 'bold',
          padding: '0 6px',
          boxSizing: 'border-box',
          ...countBadgeStyle
        }
      }, count));
  }));
}

export function ParticipantBackdrop({ participant, name, dotSize = 10, style = {}, className }) {
  const React = window.React;
  const color = participant?.color || '#94A3B8';
  const label = name || participant?.name || '참여자';
  return React.createElement('span', {
    className,
    style: { display: 'inline-flex', alignItems: 'center', gap: '8px', color, fontWeight: 700, ...style }
  },
    React.createElement('span', {
      'aria-hidden': 'true',
      style: { display: 'inline-block', width: `${dotSize}px`, height: `${dotSize}px`, borderRadius: '50%', backgroundColor: color, flexShrink: 0 }
    }),
    label
  );
}

export function SimpleBottomSheetPicker({ title, value, options, onSelect, placeholder, disabled, style, className = "form-select" }) {
  const React = window.React;

  const [isOpen, setIsOpen] = React.useState(false);
  const safeOptions = Array.isArray(options) ? options : [];
  const selected = safeOptions.find(o => o.value === value);
  const sheet = isOpen && /*#__PURE__*/React.createElement("div", {
    className: "bottom-sheet-overlay",
    // This sheet is portaled to document.body below, so its synthetic click still bubbles up
    // the React component tree (not the DOM tree) to whatever ancestor rendered it -- without
    // stopPropagation, a click meant only to dismiss this sheet can also trigger an ancestor
    // card's own "tap to open" handler.
    onClick: e => { e.stopPropagation(); setIsOpen(false); }
  }, /*#__PURE__*/React.createElement("div", {
    className: "bottom-sheet",
    onClick: e => e.stopPropagation()
  },
    /*#__PURE__*/React.createElement("div", { className: "bottom-sheet-header" },
      /*#__PURE__*/React.createElement("h4", null, title),
      /*#__PURE__*/React.createElement("button", {
        type: "button",
        style: { background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.2rem', cursor: 'pointer' },
        onClick: () => setIsOpen(false)
      }, "✕")
    ),
    /*#__PURE__*/React.createElement("div", { className: "bottom-sheet-body" },
      safeOptions.map(opt => /*#__PURE__*/React.createElement("button", {
        key: opt.value,
        type: "button",
        className: "bottom-sheet-item",
        disabled: !!opt.disabled,
        onClick: () => { if (!opt.disabled) { onSelect(opt.value); setIsOpen(false); } },
        style: opt.disabled ? { opacity: 0.45, cursor: 'not-allowed' } : undefined
      }, opt.color ? /*#__PURE__*/React.createElement(ParticipantBackdrop, { participant: opt, name: opt.label }) : opt.label,
        opt.disabled ? /*#__PURE__*/React.createElement("span", { style: { marginLeft: 'auto', fontSize: 'var(--font-size-sm)', color: 'var(--text-light)' } }, "추가됨") : null))
    )
  ));
  return /*#__PURE__*/React.createElement(React.Fragment, null,
    /*#__PURE__*/React.createElement("button", {
      type: "button",
      className,
      disabled,
      style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', cursor: disabled ? 'default' : 'pointer', textAlign: 'left', width: '100%', ...style },
      onClick: () => setIsOpen(true)
    },
      selected?.color ? /*#__PURE__*/React.createElement(ParticipantBackdrop, { participant: selected, name: selected.label, style: { minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }) : /*#__PURE__*/React.createElement("span", { style: { minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, selected ? selected.label : placeholder),
      /*#__PURE__*/React.createElement("svg", {
        xmlns: "http://www.w3.org/2000/svg",
        width: "18",
        height: "18",
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "2",
        strokeLinecap: "round",
        strokeLinejoin: "round",
        className: "icon icon-tabler icons-tabler-outline icon-tabler-chevron-down",
        style: { flexShrink: 0, color: 'var(--text-light)' }
      }, /*#__PURE__*/React.createElement("path", { stroke: "none", d: "M0 0h24v24H0z", fill: "none" }),
        /*#__PURE__*/React.createElement("path", { d: "M6 9l6 6l6 -6" }))
    ),
    sheet && typeof document !== 'undefined' && ReactDOM.createPortal ? ReactDOM.createPortal(sheet, document.body) : sheet
  );
}

// Comments are stored inline on the memo doc (see MemoCard in ui-calendar-core.js), so the
// latest-comment timestamp is derived straight from that array rather than relying on the
// denormalized memo.lastCommentAt field, which has known gaps for memos outside the page's
// currently-loaded window (see ui-memo-view.js's own comment on RECENT_MEMO_ACTIVITY_WINDOW_MS).
function getLatestMemoPreviewCommentTimestamp(memo) {
  const comments = memo?.comments || [];
  let latest = 0;
  for (const c of comments) {
    const t = Number(c?.createdAt) || 0;
    if (t > latest) latest = t;
  }
  return latest;
}

// Same curated pastel palette MemoView's own composer/edit color picker uses (see MEMO_COLORS in
// ui-memo-view.js) -- duplicated here as a tiny pure lookup (not imported) so this preview's
// MemoCard instances tint their border the same as the memo page's, without pulling in MemoView's
// much larger edit-modal state.
const MEMO_PREVIEW_BORDER_COLORS = {
  'var(--bg-card)': 'var(--border-subtle)',
  'rgba(239, 68, 68, 0.12)': 'rgba(239, 68, 68, 0.3)',
  'rgba(245, 158, 11, 0.12)': 'rgba(245, 158, 11, 0.3)',
  'rgba(234, 179, 8, 0.12)': 'rgba(234, 179, 8, 0.3)',
  'rgba(16, 185, 129, 0.12)': 'rgba(16, 185, 129, 0.3)',
  'rgba(6, 182, 212, 0.12)': 'rgba(6, 182, 212, 0.3)',
  'rgba(59, 130, 246, 0.12)': 'rgba(59, 130, 246, 0.3)',
  'rgba(139, 92, 246, 0.12)': 'rgba(139, 92, 246, 0.3)',
  'rgba(236, 72, 153, 0.12)': 'rgba(236, 72, 153, 0.3)'
};
function getMemoPreviewBorderColor(colorVal) {
  return MEMO_PREVIEW_BORDER_COLORS[colorVal] || 'var(--border-subtle)';
}

// Renders the actual memo-page MemoCard (same title/image-grid/tags/comments/pin/share look and
// behavior as the 메모 page), not a bespoke compact row, per the product decision that the
// main-screen memo preview should look and act like a real memo card. onOpenEdit/onSelectTag fall
// back to navigating to the memo page (this section owns no edit modal or tag-search UI of its
// own); onTogglePin/onCommentsChange are real writes (see handleTogglePinFromMemoPreview /
// handleMemoCommentsChangeFromMemoPreview in app-main.js) since MemoCard calls them unconditionally.
export function MemoPreviewSection({ memos = [], calendar = null, onViewAll, onOpenEdit, onTogglePin, onSelectTag, onShare, onCommentsChange, onRequestConfirm, showToast, setActiveLightbox = null }) {
  const React = window.React;
  const __deps = window.GATHER_UI_DEPS || {};
  const __comp = window.GATHER_UI_COMPONENTS || {};
  const MemoSectionIcon = __comp.MemoSectionIcon || __deps.MemoSectionIcon;
  const MemoCard = __comp.MemoCard || __deps.MemoCard;

  const [collapsed, setCollapsed] = React.useState(true);

  const sortedMemos = React.useMemo(() => {
    const list = (memos || []).filter(m => m && !isTombstone(m));
    return list.slice().sort((a, b) => {
      const aComment = getLatestMemoPreviewCommentTimestamp(a);
      const bComment = getLatestMemoPreviewCommentTimestamp(b);
      if (aComment !== bComment) return bComment - aComment;
      const aCreated = a.updatedAt || a.createdAt || 0;
      const bCreated = b.updatedAt || b.createdAt || 0;
      return bCreated - aCreated;
    });
  }, [memos]);

  if (sortedMemos.length === 0) return null;

  const displayedMemos = sortedMemos.slice(0, collapsed ? 1 : 3);
  const openMemoPage = () => { if (typeof onViewAll === 'function') onViewAll(); };
  const handleTitleKeyDown = event => handleSectionHeaderKeyDown(event, () => setCollapsed(prev => !prev));

  return /*#__PURE__*/React.createElement("section", { className: "summary-card" },
    /*#__PURE__*/React.createElement("div", {
      className: `summary-title is-toggleable${collapsed ? ' is-collapsed' : ''}`,
      role: "button",
      tabIndex: 0,
      "aria-expanded": !collapsed,
      "data-no-press-feedback": true,
      onClick: () => setCollapsed(prev => !prev),
      onKeyDown: handleTitleKeyDown,
      style: { display: 'flex', alignItems: 'center', gap: '6px', width: '100%', color: 'var(--text-main)', cursor: 'pointer' }
    },
      /*#__PURE__*/React.createElement("div", {
        style: { display: 'flex', alignItems: 'center', gap: '6px', flex: 1, minWidth: 0, color: 'var(--text-main)' }
      },
        /*#__PURE__*/React.createElement(MemoSectionIcon, null),
        /*#__PURE__*/React.createElement("span", null, "메모")
      ),
      /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: e => { e.stopPropagation(); openMemoPage(); },
        style: { background: 'none', border: 'none', color: '#3B82F6', fontSize: 'var(--font-size-md)', fontWeight: 800, cursor: 'pointer', padding: '4px 6px', flexShrink: 0 }
      }, "전체보기")
    ),
    /*#__PURE__*/React.createElement("div", {
      style: { display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px' }
    }, MemoCard ? displayedMemos.map(memo => /*#__PURE__*/React.createElement(MemoCard, {
      key: memo.id,
      memo: memo,
      calendar: calendar,
      onOpenEdit: onOpenEdit,
      onTogglePin: () => { if (typeof onTogglePin === 'function') onTogglePin(memo); },
      onShare: () => { if (typeof onShare === 'function') onShare(memo); },
      onSelectTag: onSelectTag,
      onCommentsChange: nextComments => (typeof onCommentsChange === 'function' ? onCommentsChange(memo, nextComments) : false),
      getBorderColor: getMemoPreviewBorderColor,
      onRequestConfirm: onRequestConfirm,
      showToast: showToast,
      setActiveLightbox: setActiveLightbox,
      effectivePinned: !!memo.isPinned,
      hidePinButton: true,
      variant: 'preview'
    })) : null)
  );
}

export function PhotoGallery({ chatMessages, memos = [], calendar = null, totalGalleryCount, onViewAll, showToast, onPromoteImageUrl, onSaveImageTags, onSearchTag, onDeletePhoto, onReplacePhoto, onJumpToChatMessage, onJumpToMemo, onJumpToMeetingDate, onJumpToGallery, onGetChatMessageOrdinal, onGetGalleryPhotoOrdinal, onRequestConfirm, onFetchPhotoComments, onSavePhotoComments, photoCommentCounts = {} }) {
  const React = window.React;
  const __deps = window.GATHER_UI_DEPS || {};
  const __comp = window.GATHER_UI_COMPONENTS || {};
  const GalleryIcon = __deps.GalleryIcon;
  const Lightbox = __comp.Lightbox || __deps.Lightbox;
  const MediaThumb = __comp.MediaThumb || __deps.MediaThumb;
  const PhotoCommentCountBadge = __comp.PhotoCommentCountBadge || __deps.PhotoCommentCountBadge || function InlinePhotoCommentCountBadge({ count = 0 } = {}) {
    if (!count) return null;
    return React.createElement('span', {
      className: 'photo-comment-count-badge',
      'aria-label': `댓글 ${count}개`,
      style: { position: 'absolute', top: '6px', right: '6px', zIndex: 3, minWidth: '24px', height: '24px', padding: '0 6px', borderRadius: '999px', background: 'rgba(15,23,42,0.78)', color: '#fff', fontSize: 'var(--font-size-xs)', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', lineHeight: 1 }
    }, String(count));
  };
      const [collapsed, setCollapsed] = React.useState(false);
  const [lightbox, setLightbox] = React.useState(null);
  // Phone AND tablet widths show a tighter 3x3 grid instead of the real-desktop 6-wide layout
  // (6 columns at tablet width shrank each thumbnail too small to make out), so the thumbnail
  // cap needs to track the same breakpoint the CSS grid switches on (see .gallery-thumb-grid).
  const [isMobile, setIsMobile] = React.useState(() => typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(max-width: 1023px)').matches);
  React.useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined;
    const mq = window.matchMedia('(max-width: 1023px)');
    const handleChange = () => setIsMobile(mq.matches);
    handleChange();
    if (mq.addEventListener) mq.addEventListener('change', handleChange);
    else if (mq.addListener) mq.addListener(handleChange);
    return () => {
      if (mq.removeEventListener) mq.removeEventListener('change', handleChange);
      else if (mq.removeListener) mq.removeListener(handleChange);
    };
  }, []);
  const brokenPhotoKeysRef = React.useRef((GATHER_APP_UTILS.getPersistentBrokenPhotoUrls || (window.GATHER_APP_UTILS && window.GATHER_APP_UTILS.getPersistentBrokenPhotoUrls) || (() => new Set()))());
  const brokenPhotoUrlsRef = React.useRef((GATHER_APP_UTILS.getPersistentBrokenPhotoUrls || (window.GATHER_APP_UTILS && window.GATHER_APP_UTILS.getPersistentBrokenPhotoUrls) || (() => new Set()))());
  // A confirmed-broken entry (MediaThumb already tried the full-size fallback -- this only fires
  // once both attempts failed) is a dead, unclickable placeholder with no way to recover it from
  // this read-only preview widget, so it is dropped from the grid rather than shown. The revision
  // bump re-runs the visibleEntries filter below so a newly-discovered broken photo disappears
  // immediately instead of waiting for a fresh page load.
  const [brokenPhotoRevision, setBrokenPhotoRevision] = React.useState(0);
  const normalizeBrokenPhotoUrl = value => {
    const url = String(value || '').trim();
    if (!url) return '';
    return url.split(/[?#]/)[0];
  };
  const saveBrokenUrl = urlOrKey => {
    const saveFn = GATHER_APP_UTILS.savePersistentBrokenPhotoUrl || (window.GATHER_APP_UTILS && window.GATHER_APP_UTILS.savePersistentBrokenPhotoUrl);
    if (typeof saveFn === 'function') saveFn(urlOrKey);
  };
  const markBrokenPhoto = (photo, brokenInfo = {}) => {
    const key = photo?.mediaKey || photo?.refKey || photo?.key;
    const urls = [
      photo?.full,
      photo?.thumb,
      brokenInfo?.src,
      brokenInfo?.fallbackSrc,
      brokenInfo?.currentSrc
    ].map(normalizeBrokenPhotoUrl).filter(Boolean);
    let changed = false;
    if (key && !brokenPhotoKeysRef.current.has(key)) {
      brokenPhotoKeysRef.current.add(key);
      saveBrokenUrl(key);
      changed = true;
    }
    urls.forEach(url => {
      if (!brokenPhotoUrlsRef.current.has(url)) {
        brokenPhotoUrlsRef.current.add(url);
        saveBrokenUrl(url);
        changed = true;
      }
    });
    if (changed) setBrokenPhotoRevision(prev => prev + 1);
  };

  const photoEntries = React.useMemo(() => buildCombinedPhotoEntries(chatMessages, memos, calendar), [chatMessages, memos, calendar]);
  const isKnownBrokenPhoto = entry => {
    const key = entry?.mediaKey || entry?.refKey || entry?.key;
    if (key && brokenPhotoKeysRef.current.has(key)) return true;
    return [entry?.full, entry?.thumb].map(normalizeBrokenPhotoUrl).filter(Boolean)
      .some(url => brokenPhotoUrlsRef.current.has(url));
  };
  // brokenPhotoRevision is read only to re-run this filter once markBrokenPhoto records a
  // newly-discovered broken entry, so a dead placeholder disappears immediately instead of
  // lingering until the next full reload.
  const visibleEntries = React.useMemo(() => photoEntries.filter(entry => (
    ((entry && entry.thumb && String(entry.thumb)) || (entry && entry.full && String(entry.full)))
    && !isKnownBrokenPhoto(entry)
  )), [photoEntries, brokenPhotoRevision]);

  const handleBrokenPhoto = (photo, brokenInfo = {}) => {
    markBrokenPhoto(photo, brokenInfo);
  };

  const displayedEntries = visibleEntries
    .filter(e => (e && ((e.thumb && String(e.thumb)) || (e.full && String(e.full)))))
    .slice(0, isMobile ? 9 : 18);
  const openGalleryPage = () => { if (typeof onViewAll === 'function') onViewAll(); };
  const handleGalleryTitleKeyDown = event => handleSectionHeaderKeyDown(event, () => setCollapsed(prev => !prev));

  if (visibleEntries.length === 0) return null;

  return /*#__PURE__*/React.createElement("section", { className: "summary-card" },
    /*#__PURE__*/React.createElement("div", {
      className: `summary-title is-toggleable${collapsed ? ' is-collapsed' : ''}`,
      role: "button",
      tabIndex: 0,
      "aria-expanded": !collapsed,
      "data-no-press-feedback": true,
      onClick: () => setCollapsed(prev => !prev),
      onKeyDown: handleGalleryTitleKeyDown,
      style: { display: 'flex', alignItems: 'center', gap: '6px', width: '100%', color: 'var(--text-main)', cursor: 'pointer' }
    },
      /*#__PURE__*/React.createElement("div", {
        style: { display: 'flex', alignItems: 'center', gap: '6px', flex: 1, minWidth: 0, color: 'var(--text-main)' }
      },
        /*#__PURE__*/React.createElement(GalleryIcon, null),
        /*#__PURE__*/React.createElement("span", null, "갤러리")
      ),
      /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: e => { e.stopPropagation(); openGalleryPage(); },
        style: {
          border: 'none', background: 'transparent', cursor: 'pointer',
          color: '#3B82F6', fontSize: 'var(--font-size-md)', fontWeight: 700, padding: '4px 6px', flexShrink: 0
        }
      }, "전체보기")
    ),
    !collapsed && displayedEntries.length > 0 && /*#__PURE__*/React.createElement(React.Fragment, null,
      /*#__PURE__*/React.createElement("div", {
        className: "gallery-thumb-grid",
        style: { display: 'grid', gap: '6px', marginTop: '12px' }
      },
        displayedEntries.map((entry, idx) => /*#__PURE__*/React.createElement("div", {
          key: entry.mediaKey || entry.refKey || entry.full || entry.thumb,
          style: { position: 'relative' }
        },
          /*#__PURE__*/React.createElement(MediaThumb, {
            src: (entry.thumb && String(entry.thumb)) || (entry.full && String(entry.full)) || '',
            fallbackSrc: (entry.full && String(entry.full)) || (entry.thumb && String(entry.thumb)) || '',
            alt: "채팅에 첨부된 사진",
            loading: "lazy",
            decoding: "async",
            referrerPolicy: 'no-referrer',
            onClick: () => setLightbox({
              urls: displayedEntries.map(e => e.full),
              meta: displayedEntries.map(e => ({ timestamp: e.timestamp, messageId: e.messageId, imageIndex: e.imageIndex, thumb: e.thumb, tags: e.tags, directMediaUrl: e.directMediaUrl, source: e.source, uploadSource: e.uploadSource, meetingDate: e.meetingDate, photoId: e.photoId, sourceMessageId: e.sourceMessageId, sourceImageIndex: e.sourceImageIndex, mediaKey: e.mediaKey, refKey: e.refKey, legacyKeys: e.legacyKeys })),
              index: idx
            }),
            onBroken: (e, brokenInfo) => handleBrokenPhoto(entry, brokenInfo),
            style: { width: '100%', aspectRatio: '1 / 1', objectFit: 'cover', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }
          }),
          PhotoCommentCountBadge && /*#__PURE__*/React.createElement(PhotoCommentCountBadge, {
            count: (() => {
              const identity = getPhotoCommentIdentity(entry, visibleEntries, { source: entry.source, meetingDate: entry.meetingDate }) || {};
              return getPhotoCommentCount(identity, photoCommentCounts);
            })()
          })
        ))
      )
    ),
    lightbox && /*#__PURE__*/React.createElement(Lightbox, {
      urls: lightbox.urls,
      index: lightbox.index,
      meta: lightbox.meta,
      calendar,
      onClose: () => setLightbox(null),
      onNavigate: i => setLightbox(prev => prev ? { ...prev, index: i } : prev),
      showToast,
      onPromoteImageUrl,
      onSaveImageTags,
      onSearchTag,
      onDeletePhoto,
      onReplacePhoto,
      onJumpToChatMessage: (msgId) => { setLightbox(null); if (typeof onJumpToChatMessage === 'function') onJumpToChatMessage(msgId); },
      onJumpToMemo: (memoId) => { setLightbox(null); if (typeof onJumpToMemo === 'function') onJumpToMemo(memoId); },
      onJumpToMeetingDate: (dateStr, tab) => { setLightbox(null); if (typeof onJumpToMeetingDate === 'function') onJumpToMeetingDate(dateStr, tab); },
      onJumpToGallery: (msgId, idx, url) => { setLightbox(null); if (typeof onJumpToGallery === 'function') onJumpToGallery(msgId, idx, url); },
      onGetChatMessageOrdinal,
      onGetGalleryPhotoOrdinal,
      onRequestConfirm,
      onFetchPhotoComments,
      onSavePhotoComments
    })
  );
}

export function SummaryList({
  calendar,
  onSelectDate
}) {
  const React = window.React;
  const __comp = window.GATHER_UI_COMPONENTS || {};
  const SectionCountBadge = __comp.SectionCountBadge;
  const SectionToggleButton = __comp.SectionToggleButton;

  const [collapsedSections, setCollapsedSections] = React.useState({
    partial: false,
    all: true,
    confirmed: true,
    past: true
  });
  const SUMMARY_LIST_PAGE = 10;
  const [allListLimit, setAllListLimit] = React.useState(SUMMARY_LIST_PAGE);
  const [confirmedListLimit, setConfirmedListLimit] = React.useState(SUMMARY_LIST_PAGE);
  const toggleSection = sectionKey => {
    setCollapsedSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };
  const handleSectionTitleKeyDown = (event, sectionKey) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    toggleSection(sectionKey);
  };
  const activeParticipants = getActiveParticipants(calendar);
  const totalCount = activeParticipants.length || 0;
  const availabilities = getActiveAvailabilities(calendar);
  const participantsMap = activeParticipants.reduce((acc, p) => {
    acc[p.id] = p;
    return acc;
  }, {});
  const dateMap = availabilities.reduce((acc, e) => {
    if (!acc[e.date]) acc[e.date] = [];
    acc[e.date].push(e);
    return acc;
  }, {});
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  // Threshold = totalCount - 2, only show partial section when totalCount >= 6
  // 4명 → 전원만 | 6명 → 4명 이상 + 전원 | 8명 → 6명 이상 + 전원
  const thresholdN = totalCount >= 6 ? totalCount - 2 : 0;

  // 1. All-available dates: only count active participants (those still in participantsMap)
  const allAvailableDates = Object.keys(dateMap).filter(d => {
    const entries = dateMap[d].filter(e => participantsMap[e.participantId] || e.participantId === BULK_NO_PARTICIPANT_ID);
    const uniqueParticipants = new Set(entries.map(e => e.participantId));
    return totalCount > 0 && uniqueParticipants.size === totalCount;
  });
  const allAvailableSet = new Set(allAvailableDates);

  // 2. Partial-available dates (MIN_THRESHOLD <= availCount < totalCount), excluding all-available
  const partialAvailableDates = thresholdN > 0 ? Object.keys(dateMap).filter(d => {
    if (allAvailableSet.has(d)) return false;
    const entries = dateMap[d].filter(e => participantsMap[e.participantId] || e.participantId === BULK_NO_PARTICIPANT_ID);
    const uniqueParticipants = new Set(entries.map(e => e.participantId));
    const cnt = uniqueParticipants.size;
    return cnt >= thresholdN && cnt < totalCount;
  }) : [];

  // Sort descending: newest at top, oldest at bottom
  const getSortedDates = datesList => {
    return [...datesList].sort((a, b) => b.localeCompare(a));
  };

  // Future only — past availability dates are not shown here; confirmed meetings (past or
  // future) still appear in the '모임 확정' section below. Confirmed meetings are excluded
  // from '전원 참석 가능' entirely -- once a date is confirmed it lives on the calendar's
  // own banner bubble instead, so it shouldn't linger here as merely "possible".
  const sortedAllDates = getSortedDates(allAvailableDates.filter(d => d >= todayStr && !isDateConfirmedMeeting(calendar, d)));
  const sortedPartialDates = getSortedDates(partialAvailableDates.filter(d => d >= todayStr));

  // 3. Confirmed-meeting dates -- every date promoted to 모임확정, past or future.
  const confirmedDates = getSortedDates(getTrulyConfirmedMeetings(calendar).filter(m => isValidDateString(m?.date)).map(m => m.date));

  // '6인 이상 참석 가능' / '전원 참석 가능' / '모임 확정' -- all three removed from the main
  // screen entirely per product decision (모임 확정 already lives on its own 히스토리 page; the
  // partial/all-available sections were the last ones still rendering here). Forcing all three
  // flags false hides every section (and the dividers between them, gated on the same flags)
  // without touching the large nested JSX blocks below, so there's no risk of a stray unbalanced
  // paren from hand-editing them -- the early return just below then always fires.
  const isPartialVisible = false;
  const isAllVisible = false;
  const isConfirmedVisible = false;
  const anyBeforeAll = isPartialVisible;
  const anyBeforeConfirmed = isPartialVisible || isAllVisible;

  // Nothing to show (this section is now always hidden -- see above) -- an empty .summary-card
  // shell used to still take up a visible gap on the main screen below chat.
  if (!isPartialVisible && !isAllVisible && !isConfirmedVisible) return null;

  return /*#__PURE__*/React.createElement("div", {
    className: "summary-card",
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '20px'
    }
  }, thresholdN > 0 && sortedPartialDates.length > 0 && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: `summary-title is-toggleable${collapsedSections.partial ? ' is-collapsed' : ''}`,
    role: "button",
    tabIndex: 0,
    "aria-expanded": !collapsedSections.partial,
    onClick: () => toggleSection('partial'),
    onKeyDown: event => handleSectionTitleKeyDown(event, 'partial'),
    "data-no-press-feedback": true,
    style: {
      color: '#2563EB',
      marginBottom: '12px'
    }
  }, /*#__PURE__*/React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    width: "20",
    height: "20",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2.5",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    style: {
      marginRight: '4px'
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "9",
    cy: "7",
    r: "4"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M22 21v-2a4 4 0 0 0-3-3.87"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M16 3.13a4 4 0 0 1 0 7.75"
  })), thresholdN, "\uBA85 \uC774\uC0C1 \uCC38\uC11D \uAC00\uB2A5 ", /*#__PURE__*/React.createElement(SectionCountBadge, { count: sortedPartialDates.length }), /*#__PURE__*/React.createElement(SectionToggleButton, {
    collapsed: collapsedSections.partial,
    onToggle: () => toggleSection('partial'),
    label: collapsedSections.partial ? `${thresholdN}\uBA85 \uC774\uC0C1 \uCC38\uC11D \uAC00\uB2A5 \uD3BC\uCE58\uAE30` : `${thresholdN}\uBA85 \uC774\uC0C1 \uCC38\uC11D \uAC00\uB2A5 \uC811\uAE30`
  })), !collapsedSections.partial && /*#__PURE__*/React.createElement("div", null, sortedPartialDates.map(d => {
    const dateEntries = (dateMap[d] || []).filter(e => (participantsMap[e.participantId] || e.participantId === BULK_NO_PARTICIPANT_ID) && !isTombstone(e));
    const formattedDateStr = formatDateWithDayName(d);
    const memoEntries = dateEntries.filter(e => e.note && e.note.trim().length > 0);
    const isPast = d < todayStr;
    const availCount = new Set(dateEntries.map(e => e.participantId)).size;
    const isConfirmed = isDateConfirmedMeeting(calendar, d);
    return /*#__PURE__*/React.createElement("button", {
      key: d,
      className: `date-item-btn ${isPast ? 'is-past' : isConfirmed ? 'is-confirmed' : 'is-available'}`,
      onClick: () => onSelectDate(d)
    }, /*#__PURE__*/React.createElement("div", {
      className: "date-item-left"
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontWeight: 800,
        color: isPast ? '#94A3B8' : '#2563EB',
        fontSize: '0.95rem'
      }
    }, formattedDateStr), memoEntries.length > 0 && /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        flexWrap: 'wrap'
      }
    }, memoEntries.map(e => {
      const p = participantsMap[e.participantId] || (e.participantId === BULK_NO_PARTICIPANT_ID ? { id: BULK_NO_PARTICIPANT_ID, name: '일정', color: '#94A3B8' } : null);
      if (!p) return null;
      const memoUrl = extractFirstUrl(e.note);
      const memoText = memoUrl ? removeFirstUrl(e.note) : e.note.trim();
      if (!memoText) return null;
      return /*#__PURE__*/React.createElement("span", {
        key: e.participantId || p.id,
        className: "memo-capsule-badge",
        style: isPast ? {
          backgroundColor: 'transparent',
          color: p.color,
          border: `1px solid ${p.color}`,
          boxShadow: 'none'
        } : {
          backgroundColor: p.color,
          color: getContrastTextColor(p.color)
        },
        title: `${p.name}: ${memoText}`
      }, memoText);
    }))), /*#__PURE__*/React.createElement("span", {
      className: `date-item-badge ${isPast ? 'is-past' : isConfirmed ? 'is-confirmed' : 'is-available'}`,
      style: {
        background: isPast ? '#E2E8F0' : isConfirmed ? '#F3E8FF' : '#DBEAFE',
        color: isPast ? '#64748B' : isConfirmed ? '#7C3AED' : '#1D4ED8',
        border: isPast ? 'none' : isConfirmed ? '1px solid #E9D5FF' : '1px solid #BFDBFE'
      }
    }, isPast ? '지나간 모임' : isConfirmed ? '확정모임' : `${availCount}명 가능 (${availCount}/${totalCount}명)`));
  }))), anyBeforeAll && isAllVisible && /*#__PURE__*/React.createElement("div", {
    className: "summary-section-divider"
  }), isAllVisible && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: `summary-title is-toggleable${collapsedSections.all ? ' is-collapsed' : ''}`,
    role: "button",
    tabIndex: 0,
    "aria-expanded": !collapsedSections.all,
    onClick: () => toggleSection('all'),
    onKeyDown: event => handleSectionTitleKeyDown(event, 'all'),
    "data-no-press-feedback": true,
    style: {
      color: 'var(--status-green)',
      marginBottom: '12px'
    }
  }, /*#__PURE__*/React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    width: "20",
    height: "20",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2.5",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    style: {
      marginRight: '4px'
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "m9 12 2 2 4-4"
  })), "\uC804\uC6D0 \uCC38\uC11D \uAC00\uB2A5 ", /*#__PURE__*/React.createElement(SectionCountBadge, { count: sortedAllDates.length }), /*#__PURE__*/React.createElement(SectionToggleButton, {
    collapsed: collapsedSections.all,
    onToggle: () => toggleSection('all'),
    label: collapsedSections.all ? "\uC804\uC6D0 \uCC38\uC11D \uAC00\uB2A5 \uD3BC\uCE58\uAE30" : "\uC804\uC6D0 \uCC38\uC11D \uAC00\uB2A5 \uC811\uAE30"
  })), !collapsedSections.all && (sortedAllDates.length === 0 ? /*#__PURE__*/React.createElement("div", {
    style: {
      color: 'var(--text-muted)',
      fontSize: 'var(--font-size-base)',
      padding: '10px 0'
    }
  }, "\uC544\uC9C1 \uCC38\uC5EC\uC790 \uC804\uC6D0\uC774 \uAC00\uB2A5\uD55C \uB0A0\uC9DC\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4. \uCE98\uB9B0\uB354\uC5D0\uC11C \uB0A0\uC9DC\uB97C \uC120\uD0DD\uD558\uC5EC \uAC00\uB2A5 \uC5EC\uBD80\uB97C \uD45C\uAE30\uD574\uBCF4\uC138\uC694!") : /*#__PURE__*/React.createElement("div", null, sortedAllDates.slice(0, allListLimit).map(d => {
    const dateEntries = (dateMap[d] || []).filter(e => (participantsMap[e.participantId] || e.participantId === BULK_NO_PARTICIPANT_ID) && !isTombstone(e));
    const formattedDateStr = formatDateWithDayName(d);
    const memoEntries = dateEntries.filter(e => e.note && e.note.trim().length > 0);
    const isPast = d < todayStr;
    return /*#__PURE__*/React.createElement("button", {
      key: d,
      className: `date-item-btn${isPast ? ' is-past' : ' is-all'}`,
      onClick: () => onSelectDate(d),
      style: {
        flexDirection: 'column',
        alignItems: 'flex-start'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        gap: '8px'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontWeight: 800,
        color: isPast ? '#94A3B8' : 'var(--status-green)',
        fontSize: '0.95rem',
        minWidth: 0,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
      }
    }, formattedDateStr), /*#__PURE__*/React.createElement("span", {
      className: `date-item-badge ${isPast ? 'is-past' : 'is-all'}`,
      style: {
        background: isPast ? '#E2E8F0' : 'var(--status-green)',
        color: isPast ? '#64748B' : '#FFF',
        border: 'none',
        flexShrink: 0
      }
    }, isPast ? '지나간 모임' : '전원 가능')), memoEntries.length > 0 && /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        flexWrap: 'wrap'
      }
    }, memoEntries.map(e => {
      const p = participantsMap[e.participantId] || (e.participantId === BULK_NO_PARTICIPANT_ID ? { id: BULK_NO_PARTICIPANT_ID, name: '일정', color: '#94A3B8' } : null);
      if (!p) return null;
      const memoUrl = extractFirstUrl(e.note);
      const memoText = memoUrl ? removeFirstUrl(e.note) : e.note.trim();
      if (!memoText) return null;
      return /*#__PURE__*/React.createElement("span", {
        key: e.participantId || p.id,
        className: "memo-capsule-badge",
        style: isPast ? {
          backgroundColor: 'var(--bg-primary)',
          color: 'var(--text-muted)',
          border: `1px solid ${p.color}`,
          boxShadow: 'none'
        } : {
          backgroundColor: p.color,
          color: getContrastTextColor(p.color)
        },
        title: `${p.name}: ${memoText}`
      }, memoText);
    })));
  }), ((() => {
      const total = sortedAllDates.length;
      const shown = Math.min(allListLimit, total);
      if (!(total > shown)) return null;
      const step = SUMMARY_LIST_PAGE;
      return /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: () => setAllListLimit(prev => prev + step),
        style: {
          width: '100%', marginTop: '4px', marginBottom: '6px', padding: '10px 0',
          border: 'none', borderRadius: 'var(--radius-md)',
          backgroundColor: 'color-mix(in srgb, var(--bg-primary) 96%, black)',
          color: 'var(--text-main)', fontSize: 'var(--font-size-base)', fontWeight: 700, cursor: 'pointer', textAlign: 'center'
        }
      }, `더보기 (총 ${total}개 중 ${shown}개)`);
    })())))), anyBeforeConfirmed && isConfirmedVisible && /*#__PURE__*/React.createElement("div", {
    className: "summary-section-divider"
  }), isConfirmedVisible && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: `summary-title is-toggleable${collapsedSections.confirmed ? ' is-collapsed' : ''}`,
    role: "button",
    tabIndex: 0,
    "aria-expanded": !collapsedSections.confirmed,
    onClick: () => toggleSection('confirmed'),
    onKeyDown: event => handleSectionTitleKeyDown(event, 'confirmed'),
    "data-no-press-feedback": true,
    style: {
      color: '#7C3AED',
      marginBottom: '12px'
    }
  }, /*#__PURE__*/React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    width: "20",
    height: "20",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2.5",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    style: {
      marginRight: '4px'
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "m9 12 2 2 4-4"
  })), "모임 확정 ", /*#__PURE__*/React.createElement(SectionCountBadge, { count: confirmedDates.length }), /*#__PURE__*/React.createElement(SectionToggleButton, {
    collapsed: collapsedSections.confirmed,
    onToggle: () => toggleSection('confirmed'),
    label: collapsedSections.confirmed ? "모임 확정 펼치기" : "모임 확정 접기"
  })), !collapsedSections.confirmed && /*#__PURE__*/React.createElement("div", null, confirmedDates.slice(0, confirmedListLimit).map(d => {
    const dateEntries = (dateMap[d] || []).filter(e => (participantsMap[e.participantId] || e.participantId === BULK_NO_PARTICIPANT_ID) && !isTombstone(e));
    const memoEntries = dateEntries.filter(e => e.note && e.note.trim().length > 0);
    const isPast = d < todayStr;
    const ddayLabel = isPast ? '지난 모임' : (() => {
      const dday = calculateDday(d);
      return dday <= 0 ? 'D-DAY' : `D-${dday}`;
    })();
    return /*#__PURE__*/React.createElement("button", {
      key: d,
      className: `date-item-btn ${isPast ? 'is-past' : 'is-confirmed'} confirmed-meeting-card confirmed-meeting-surface`,
      onClick: () => onSelectDate(d),
      style: {
        flexDirection: 'column',
        alignItems: 'flex-start'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        gap: '8px'
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "confirmed-meeting-date",
      style: {
        fontWeight: 800,
        color: isPast ? '#94A3B8' : '#FFFFFF',
        fontSize: '0.95rem',
        minWidth: 0,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
      }
    }, isPast ? formatDateWithDayName(d) : formatConfirmedMeetingLabel(d)), /*#__PURE__*/React.createElement("span", {
      className: `date-item-badge dday-badge ${isPast ? 'is-past' : 'is-confirmed'}`,
      style: {
        flexShrink: 0
      }
    }, ddayLabel)), memoEntries.length > 0 && /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        flexWrap: 'wrap'
      }
    }, memoEntries.map(e => {
      const p = participantsMap[e.participantId] || (e.participantId === BULK_NO_PARTICIPANT_ID ? { id: BULK_NO_PARTICIPANT_ID, name: '일정', color: '#94A3B8' } : null);
      if (!p) return null;
      const memoUrl = extractFirstUrl(e.note);
      const memoText = memoUrl ? removeFirstUrl(e.note) : e.note.trim();
      if (!memoText) return null;
      return /*#__PURE__*/React.createElement("span", {
        key: e.participantId || p.id,
        className: `memo-capsule-badge ${isPast ? 'is-past' : ''}`,
        style: isPast ? {
          backgroundColor: 'transparent',
          background: 'transparent',
          color: p.color,
          border: `1px solid ${p.color}`,
          boxShadow: 'none'
        } : {
          backgroundColor: p.color,
          color: getContrastTextColor(p.color)
        },
        title: `${p.name}: ${memoText}`
      }, memoText);
    })));
  }), ((() => {
      const total = confirmedDates.length;
      const shown = Math.min(confirmedListLimit, total);
      if (!(total > shown)) return null;
      const step = SUMMARY_LIST_PAGE;
      return /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: () => setConfirmedListLimit(prev => prev + step),
        style: {
          width: '100%', marginTop: '4px', marginBottom: '6px', padding: '10px 0',
          border: 'none', borderRadius: 'var(--radius-md)',
          backgroundColor: 'color-mix(in srgb, var(--bg-primary) 96%, black)',
          color: 'var(--text-main)', fontSize: 'var(--font-size-base)', fontWeight: 700, cursor: 'pointer', textAlign: 'center'
        }
      }, `더보기 (총 ${total}개 중 ${shown}개)`);
    })()))));
}

// Opens Kakao Map centered on a specific point with a labeled marker -- a plain link URL, no API
// key needed (unlike Kakao's search/local APIs). getPlaceKakaoRouteUrl exists as a cross-file
// bridge but has no real implementation anywhere in the app, so it always resolves to undefined;
// building the well-known link format directly here avoids depending on that dead reference.
function getKakaoMapLinkUrl(place) {
  if (!place || !Number.isFinite(place.lat) || !Number.isFinite(place.lng)) return null;
  const label = encodeURIComponent(place.alias || place.name || '장소');
  return `https://map.kakao.com/link/map/${label},${place.lat},${place.lng}`;
}

// Same chevron-down glyph SimpleBottomSheetPicker renders (see below) -- reused as-is on the
// 시/도·군/구 region triggers so they read as the exact same picker control the rest of the app
// uses, not a bespoke plain-text button. A function (not a module-level element) because it needs
// the caller's own `React` local -- this module never assumes window.React is ready at
// module-evaluation time, only once a component actually renders.
function renderRegionTriggerChevron(React) {
  return /*#__PURE__*/React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg", width: "18", height: "18", viewBox: "0 0 24 24",
    fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round",
    className: "form-select-chevron"
  }, /*#__PURE__*/React.createElement("path", { stroke: "none", d: "M0 0h24v24H0z", fill: "none" }),
    /*#__PURE__*/React.createElement("path", { d: "M6 9l6 6l6 -6" }));
}

// Shared by HistoryView(보관함) and ContentView(컨텐츠) -- both open the same admin-side-menu
// overlay chrome (brand header/weather badge/close button + page-specific extra items +
// SharedAppNavBlock + SharedSideMenuFooter), differing only in title text and which extra items
// they show above the shared nav block.
function SideMenuOverlay({ isOpen, onClose, homeLabel, ariaLabel, calendar, onGoHome, extraItems = [], navBlockProps, onOpenShare, onOpenAppSettings }) {
  const React = window.React;
  const __comp = window.GATHER_UI_COMPONENTS || {};
  const __deps = window.GATHER_UI_DEPS || {};
  const WeatherBadge = __comp.WeatherBadge || __deps.WeatherBadge;
  const SmallXIcon = __comp.SmallXIcon || __deps.SmallXIcon;
  const BackArrowIcon = __comp.BackArrowIcon || __deps.BackArrowIcon;
  const SharedAppNavBlock = __comp.SharedAppNavBlock || __deps.SharedAppNavBlock;
  const SharedSideMenuFooter = __comp.SharedSideMenuFooter || __deps.SharedSideMenuFooter;
  if (!isOpen) return null;
  const overlay = /*#__PURE__*/React.createElement("div", {
    className: "admin-side-menu-overlay", onClick: onClose
  }, /*#__PURE__*/React.createElement("div", {
    className: "admin-side-menu", onClick: e => e.stopPropagation(), role: "dialog", "aria-label": ariaLabel
  },
    /*#__PURE__*/React.createElement("div", { className: "admin-side-menu-header" },
      /*#__PURE__*/React.createElement("div", { className: "admin-side-menu-brand" },
        /*#__PURE__*/React.createElement("div", { className: "admin-side-menu-copy" },
          /*#__PURE__*/React.createElement("button", {
            type: "button", className: "admin-side-menu-title", title: "메인 화면으로 이동", "aria-label": "메인 화면으로 이동",
            onClick: onGoHome,
            style: { background: 'none', border: 'none', padding: 0, margin: 0, color: 'var(--text-main)', fontSize: '1.05rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }
          }, BackArrowIcon && /*#__PURE__*/React.createElement(BackArrowIcon, { size: 18 }), homeLabel)
        )
      ),
      /*#__PURE__*/React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 } },
        WeatherBadge ? /*#__PURE__*/React.createElement(WeatherBadge, { weatherLocation: calendar && calendar.weatherLocation }) : null,
        /*#__PURE__*/React.createElement("button", {
          type: "button", className: "admin-side-menu-close-btn", title: "메뉴 닫기", "aria-label": "메뉴 닫기",
          onClick: onClose
        }, SmallXIcon ? /*#__PURE__*/React.createElement(SmallXIcon, { size: 20 }) : "✕")
      )
    ),
    extraItems.length > 0 && /*#__PURE__*/React.createElement("div", { className: "admin-side-menu-list" },
      extraItems.map((it, idx) => /*#__PURE__*/React.createElement("button", {
        key: idx, type: "button", className: "admin-side-menu-item", onClick: it.onClick
      },
        /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-icon" }, it.icon),
        /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-copy" },
          /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-title" }, it.title),
          it.desc && /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-desc" }, it.desc)
        )
      ))
    ),
    typeof SharedAppNavBlock === 'function' && /*#__PURE__*/React.createElement(SharedAppNavBlock, navBlockProps),
    typeof SharedSideMenuFooter === 'function' && /*#__PURE__*/React.createElement(SharedSideMenuFooter, {
      onClose, onOpenShare, onOpenSettings: onOpenAppSettings
    })
  ));
  const ReactDOM = window.ReactDOM;
  return (typeof document !== 'undefined' && ReactDOM && ReactDOM.createPortal)
    ? ReactDOM.createPortal(overlay, document.body)
    : overlay;
}

// Full-page '히스토리' view -- every confirmed meeting date (모임 확정), moved off the main
// calendar screen onto its own page. Each card also folds in whatever place(s) were registered
// for that date (see doesPlaceMatchDate), since a confirmed meeting's place is exactly the kind
// of detail worth keeping alongside its history entry.
export function HistoryView({
  calendar, onBack, onSelectDate, onChangeView, onOpenAppSettings, onOpenShare = null,
  chatCount = 0, settlementBadge = null, galleryCount = 0, placeCount = 0, memoCount = 0, historyCount = 0,
  chatLastAuthor = null, settlementLastDate = null, galleryLastDate = null, placeLastName = null, memoLastTitleWord = null,
  showSettlement = true, onOpenCreateSettlement,
  isDarkTheme, onToggleTheme, fontScalePercent, onDecreaseFont, onIncreaseFont,
  isChatNotifyEnabled, onToggleChatNotifications, syncStatus = null,
  onAddPersonTag = null, onRenamePersonTag = null, onDeletePersonTag = null, showToast = null,
  anniversaries = [], chatMessages = [], memos = [], setActiveLightbox = null,
  onPromoteImageUrl = null, onSaveImageTags = null, onSearchTag = null,
  onDeletePhoto = null, onReplacePhoto = null,
  onJumpToChatMessage = null, onJumpToMemo = null, onJumpToMeetingDate = null,
  onGetChatMessageOrdinal = null, onGetGalleryPhotoOrdinal = null, onRequestConfirm = null,
  onRemovePhotoFromMemory = null, onRemovePhotosFromMemory = null, onFetchPhotoComments = null, onSavePhotoComments = null,
  onHideMemoryGroup = null, onRestoreMemoryGroup = null, onAddPhotosBackToMemory = null,
  onFetchMeetingPhotoIndex = null,
  photoCommentCounts = {}
}) {
  const React = window.React;
  const __deps = window.GATHER_UI_DEPS || {};
  const __comp = window.GATHER_UI_COMPONENTS || {};
  const BackArrowIcon = __comp.BackArrowIcon || __deps.BackArrowIcon;
  const ThreeLinesIcon = __comp.ThreeLinesIcon || __deps.ThreeLinesIcon;
  const SearchIcon = __comp.SearchIcon || __deps.SearchIcon;
  const MapPinIcon = __comp.MapPinIcon || __deps.MapPinIcon;
  const InlineSearchBar = __comp.InlineSearchBar || __deps.InlineSearchBar;
  const UnderlineTabs = __comp.UnderlineTabs || __deps.UnderlineTabs;
  const Lightbox = __comp.Lightbox || __deps.Lightbox;
  const PencilIcon = __comp.PencilIcon || __deps.PencilIcon;
  const TrashIcon = __comp.TrashIcon || __deps.TrashIcon;
  const PhotoCommentCountBadge = __comp.PhotoCommentCountBadge || __deps.PhotoCommentCountBadge || function InlinePhotoCommentCountBadge({ count = 0 } = {}) {
    if (!count) return null;
    return /*#__PURE__*/React.createElement('span', {
      className: 'photo-comment-count-badge',
      "aria-label": `댓글 ${count}개`,
      style: { position: 'absolute', top: '6px', right: '6px', zIndex: 3, minWidth: '24px', height: '24px', padding: '0 6px', borderRadius: '999px', background: 'rgba(15,23,42,0.78)', color: '#fff', fontSize: 'var(--font-size-xs)', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', lineHeight: 1 }
    }, String(count));
  };
  const formatHistoryDate = value => {
    const text = String(value || '').slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) return '';
    if (typeof formatDateWithDayName === 'function') {
      const labeled = formatDateWithDayName(text);
      if (labeled) return labeled;
    }
    if (typeof __deps.formatShortDateWithDayName === 'function') return __deps.formatShortDateWithDayName(text);
    return text.replace(/^(\d{4})-(\d{2})-(\d{2})$/, '$1.$2.$3');
  };
  const formatHistoryDateRange = (start, end) => {
    const startText = String(start || '').slice(0, 10);
    const endText = String(end || start || '').slice(0, 10);
    const a = formatHistoryDate(startText);
    if (!a) return '';
    if (!endText || endText === startText) return a;
    const b = formatHistoryDate(endText);
    if (!b) return a;
    return `${a} ~ ${b.replace(/^20(?=\d{2}\.)/, '')}`;
  };
  // Align with app-main parseFlexibleDateTokens so compact tags like 26.06.13 match.
  const parseHistoryDateTokens = text => {
    const parseFlexibleDateTokens = __deps.parseFlexibleDateTokens;
    if (typeof parseFlexibleDateTokens === 'function') return parseFlexibleDateTokens(text);
    const source = String(text || '').replace(/[()[\]{}'"“”‘’]/g, ' ');
    const dates = new Set();
    const pushDate = (yearRaw, monthRaw, dayRaw) => {
      let year = Number(yearRaw);
      const month = Number(monthRaw);
      const day = Number(dayRaw);
      if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) return;
      if (year < 100) year += 2000;
      if (year < 2000 || year > 2099 || month < 1 || month > 12 || day < 1 || day > 31) return;
      const check = new Date(year, month - 1, day);
      if (check.getFullYear() !== year || check.getMonth() !== month - 1 || check.getDate() !== day) return;
      dates.add(`${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`);
    };
    source.replace(/(?:^|[^\d])(\d{2,4})\s*[.\-/]\s*(\d{1,2})\s*[.\-/]\s*(\d{1,2})(?=$|[^\d])/g, (match, y, m, d) => { pushDate(y, m, d); return match; });
    source.replace(/(?:^|[^\d])(\d{2,4})\s*년\s*(\d{1,2})\s*월\s*(\d{1,2})\s*일?/g, (match, y, m, d) => { pushDate(y, m, d); return match; });
    source.replace(/(?:^|[^\d])(\d{4})(\d{2})(\d{2})(?=$|[^\d])/g, (match, y, m, d) => { pushDate(y, m, d); return match; });
    source.replace(/(?:^|[^\d])(\d{2})(\d{2})(\d{2})(?=$|[^\d])/g, (match, y, m, d) => { pushDate(y, m, d); return match; });
    return Array.from(dates);
  };
  const getTaggedDate = photo => {
    const meetingDate = String(photo?.meetingDate || '').slice(0, 10);
    if (/^\d{4}-\d{2}-\d{2}$/.test(meetingDate)) return meetingDate;
    return parseHistoryDateTokens(photo?.tags || '')[0] || '';
  };

  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const VALID_HISTORY_TABS = ['meetings', 'memories', 'people'];
  // 기록 페이지는 매번 새로 마운트되며(activeView==='history'일 때만 렌더), 언제 들어오든
  // 항상 추억 탭이 첫화면이어야 한다 -- 예전에는 localStorage에 마지막으로 보던 탭을 저장해
  // 재진입 시 그대로 복원했지만, 그러면 지난모임 탭을 보다 나간 사용자는 계속 지난모임이
  // 먼저 나와 이 요구사항과 어긋나므로 탭 기억 기능 자체를 제거했다.
  const readHistoryTabFromUrl = () => {
    const value = new URLSearchParams(window.location.search).get('historyTab');
    return VALID_HISTORY_TABS.includes(value) ? value : 'memories';
  };
  const [historyTab, setHistoryTab] = React.useState(readHistoryTabFromUrl);
  const [selectedMemoryGroupId, setSelectedMemoryGroupId] = React.useState(() => new URLSearchParams(window.location.search).get('memory') || null);
  const pushHistoryState = (tab, memoryId = null) => {
    const params = new URLSearchParams(window.location.search);
    params.set('historyTab', tab);
    if (memoryId) params.set('memory', memoryId); else params.delete('memory');
    const qs = params.toString();
    window.history.pushState({ historyTab: tab, memory: memoryId || null }, '', `${window.location.pathname}?${qs}`);
  };
  const openMemoryGroup = id => {
    setSelectedMemoryGroupId(id);
    pushHistoryState(historyTab, id);
  };
  const clearMemoryGroup = (useBrowserBack = false) => {
    const params = new URLSearchParams(window.location.search);
    if (useBrowserBack && params.get('memory')) {
      window.history.back();
      return;
    }
    setSelectedMemoryGroupId(null);
    params.delete('memory');
    const qs = params.toString();
    window.history.replaceState({ historyTab }, '', `${window.location.pathname}?${qs}`);
  };
  const changeHistoryTab = (tab) => {
    if (!VALID_HISTORY_TABS.includes(tab)) return;
    setHistoryTab(tab);
    setSelectedMemoryGroupId(null);
    pushHistoryState(tab);
  };
  React.useEffect(() => {
    const handleHistoryPopState = () => {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('historyTab');
      setHistoryTab(VALID_HISTORY_TABS.includes(tab) ? tab : 'memories');
      setSelectedMemoryGroupId(params.get('memory') || null);
    };
    window.addEventListener('popstate', handleHistoryPopState);
    return () => window.removeEventListener('popstate', handleHistoryPopState);
  }, []);
  // When the side menu navigates to 기록 again (or any view), force the 추억 tab so
  // re-entry always lands there rather than whatever tab was last open.
  const handleHistoryChangeView = (view) => {
    if (view === 'history') changeHistoryTab('memories');
    if (typeof onChangeView === 'function') onChangeView(view);
  };
  // 인물 탭: 기본 태그는 현재 캘린더 참여자, 그 외에 사용자가 직접 추가한 커스텀 태그
  // (calendar.customPersonTags)도 함께 보여준다.
  const [newPersonTag, setNewPersonTag] = React.useState('');
  const [isAddingPersonTag, setIsAddingPersonTag] = React.useState(false);
  const handleAddPersonTagClick = async () => {
    const label = newPersonTag.trim();
    if (!label || isAddingPersonTag || typeof onAddPersonTag !== 'function') return;
    setIsAddingPersonTag(true);
    try {
      const ok = await onAddPersonTag(label);
      if (ok) setNewPersonTag('');
    } finally {
      setIsAddingPersonTag(false);
    }
  };
  // 인물 상세 헤더의 편집(연필)/삭제(휴지통) 버튼 -- 참여자 태그는 캘린더 참여자 명단 자체를
  // 바꾸는 셈이라 여기서 손대면 안 되고, calendar.customPersonTags에 직접 추가한 커스텀 태그만
  // 이름 변경/삭제가 가능하다. 이 목록은 실제 사진과 별개로 관리되는 "태그 이름표"일 뿐이라
  // (사진 쪽 해시태그는 getPhotosForTagLabel이 그때그때 매칭), 이름을 바꾸면 다음부터 그 새
  // 이름과 매칭되는 사진들을 보여줄 뿐 사진 자체는 전혀 건드리지 않는다.
  const [isEditingPersonTagLabel, setIsEditingPersonTagLabel] = React.useState(false);
  const [editPersonTagLabelDraft, setEditPersonTagLabelDraft] = React.useState('');
  const [isSavingPersonTagLabel, setIsSavingPersonTagLabel] = React.useState(false);
  const handleStartEditPersonTag = () => {
    if (!selectedPersonTag) return;
    setEditPersonTagLabelDraft(selectedPersonTag);
    setIsEditingPersonTagLabel(true);
  };
  const handleCancelEditPersonTag = () => {
    setIsEditingPersonTagLabel(false);
    setEditPersonTagLabelDraft('');
  };
  const handleConfirmEditPersonTag = async () => {
    const nextLabel = editPersonTagLabelDraft.trim();
    if (!nextLabel || nextLabel === selectedPersonTag || typeof onRenamePersonTag !== 'function' || isSavingPersonTagLabel) return;
    setIsSavingPersonTagLabel(true);
    try {
      const ok = await onRenamePersonTag(selectedPersonTag, nextLabel);
      if (ok) {
        setSelectedPersonTag(nextLabel);
        setIsEditingPersonTagLabel(false);
        setEditPersonTagLabelDraft('');
      }
    } finally {
      setIsSavingPersonTagLabel(false);
    }
  };
  const handleDeletePersonTagClick = () => {
    if (!selectedPersonTag || typeof onDeletePersonTag !== 'function' || typeof onRequestConfirm !== 'function') return;
    const label = selectedPersonTag;
    onRequestConfirm('태그 삭제', `'#${label}' 인물 태그를 삭제할까요? 태그가 달린 사진은 그대로 유지됩니다.`, async () => {
      const ok = await onDeletePersonTag(label);
      if (ok) setSelectedPersonTag(null);
    });
  };
  // 채팅방/갤러리 페이지의 고정 헤더와 같은 방식: 상단 헤더+탭을 하나의 position:fixed 묶음으로
  // 만들어서, 아래로 스크롤하면 위로 숨고 위로 스크롤하면 다시 나타나게 한다. 묶음의 실제 높이는
  // ResizeObserver로 직접 측정 -- 갤러리 헤더처럼 고정 픽셀값을 하드코딩하지 않는다.
  const { isHeaderVisible, onScroll: handleHistoryScroll } = useScrollHideHeader();
  // Full-page 기록 owns scrolling via .history-page-scroll panes. Lock document underneath so
  // iOS Safari/PWA cannot leave vertical gestures on a dead outer scroller.
  React.useEffect(() => {
    if (typeof document === 'undefined') return undefined;
    const html = document.documentElement;
    const body = document.body;
    const prevHtml = html.style.overflow;
    const prevBody = body.style.overflow;
    html.style.overflow = 'hidden';
    body.style.overflow = 'hidden';
    return () => {
      html.style.overflow = prevHtml;
      body.style.overflow = prevBody;
    };
  }, []);
  const headerStackRef = React.useRef(null);
  const [, setHeaderStackHeight] = React.useState(0);
  React.useLayoutEffect(() => {
    const el = headerStackRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(entries => {
      const rect = entries[0] && entries[0].contentRect;
      setHeaderStackHeight(Math.round(rect ? rect.height : el.offsetHeight));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  // Content sits below the now-fixed header stack; padding-top reserves exactly its measured
  // height, and drops to a small constant while hidden so the first scroll-up gesture actually
  // moves content instead of only eating reserved empty space (same trick the 갤러리 페이지 uses).
  // Both branches add env(safe-area-inset-top) too, since the header stack itself now starts
  // that far down (see its `top` above) rather than at the very top of the screen.
    const activeParticipants = getActiveParticipants(calendar);
  const participantsMap = activeParticipants.reduce((acc, p) => { acc[p.id] = p; return acc; }, {});
  const availabilities = getActiveAvailabilities(calendar);
  const dateMap = availabilities.reduce((acc, e) => {
    if (!acc[e.date]) acc[e.date] = [];
    acc[e.date].push(e);
    return acc;
  }, {});
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const allConfirmedDates = [...getTrulyConfirmedMeetings(calendar).filter(m => isValidDateString(m?.date)).map(m => m.date)]
    .sort((a, b) => b.localeCompare(a));

  const q = searchQuery.trim().toLowerCase();
  const confirmedDates = !q ? allConfirmedDates : allConfirmedDates.filter(d => {
    const dateEntries = (dateMap[d] || []).filter(e => participantsMap[e.participantId] || e.participantId === BULK_NO_PARTICIPANT_ID);
    const namesMatch = dateEntries.some(e => (participantsMap[e.participantId]?.name || '').toLowerCase().includes(q));
    const memoMatch = dateEntries.some(e => (e.note || '').toLowerCase().includes(q));
    const placeMatch = getCalendarPlaces(calendar).filter(p => doesPlaceMatchDate(p, d)).some(p =>
      (p.alias || p.name || '').toLowerCase().includes(q) || (p.address || '').toLowerCase().includes(q)
    );
    return d.includes(q) || namesMatch || memoMatch || placeMatch;
  });

  const customPersonTags = Array.isArray(calendar?.customPersonTags) ? calendar.customPersonTags : [];
  const personTagChips = [
    ...activeParticipants.map(p => ({ id: p.id, participantId: p.id, label: p.name, color: p.color || '#7C3AED' })),
    ...customPersonTags.filter(t => !activeParticipants.some(p => p.name === t)).map(t => ({ id: `custom_${t}`, participantId: null, label: t, color: '#64748B' }))
  ];

  // 인물/추억 탭이 공유하는 사진 목록 -- 갤러리 페이지(PhotoGallery)와 동일한 소스(채팅/메모/모임
  // 사진)를 결합해, 태그(인물)나 날짜(추억)로 걸러 보여준다.
  const baseHistoryPhotoEntries = React.useMemo(() => buildCombinedPhotoEntries(chatMessages, memos, calendar, anniversaries), [chatMessages, memos, calendar, anniversaries]);
  // DateModal hydrates meetingPhotoIndex for the open date so album photos appear even when the
  // chat window is incomplete. Memories need the same for anniversary date ranges.
  const [indexedMeetingPhotoEntries, setIndexedMeetingPhotoEntries] = React.useState([]);
  // People badges and Memories groups share historyPhotoEntries. Only hydrating the meeting
  // photo index on the Memories tab made People counts jump after the first Memories visit.
  // Load once for either tab and keep the result across tab switches (same anniversary dates
  // skip refetch). Server-side denormalized counts would need invalidation on every tag/upload
  // and drift easily -- session hydrate of the existing index is cheaper and stays accurate.
  const indexedMeetingDatesKeyRef = React.useRef('');
  React.useEffect(() => {
    if (typeof onFetchMeetingPhotoIndex !== 'function') {
      setIndexedMeetingPhotoEntries([]);
      indexedMeetingDatesKeyRef.current = '';
      return;
    }
    if (historyTab !== 'memories' && historyTab !== 'people') return;
    const dateSet = new Set();
    const pushRange = (startRaw, endRaw) => {
      const start = String(startRaw || '').slice(0, 10);
      const end = String(endRaw || startRaw || '').slice(0, 10);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(start)) return;
      const cursor = new Date(`${start}T00:00:00`);
      const last = new Date(`${(/^\d{4}-\d{2}-\d{2}$/.test(end) ? end : start)}T00:00:00`);
      if (Number.isNaN(cursor.getTime()) || Number.isNaN(last.getTime()) || cursor > last) return;
      let guard = 0;
      while (cursor <= last && guard < 93) {
        dateSet.add(`${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}-${String(cursor.getDate()).padStart(2, '0')}`);
        cursor.setDate(cursor.getDate() + 1);
        guard += 1;
      }
    };
    (anniversaries || []).forEach(a => {
      if (!a || a.hiddenFromMemories) return;
      pushRange(a.startDate || a.date, a.endDate || a.startDate || a.date);
    });
    const dates = Array.from(dateSet).sort();
    const datesKey = dates.join(',');
    if (!dates.length) {
      setIndexedMeetingPhotoEntries([]);
      indexedMeetingDatesKeyRef.current = '';
      return;
    }
    // Already hydrated for this anniversary date set (e.g. switched people <-> memories).
    if (datesKey && datesKey === indexedMeetingDatesKeyRef.current) return;
    let cancelled = false;
    Promise.all(dates.map(date => Promise.resolve(onFetchMeetingPhotoIndex(date))
      .then(photos => ({ date, photos: Array.isArray(photos) ? photos : [] }))
      .catch(err => {
        console.warn('history meeting photo index fetch failed:', date, err);
        return { date, photos: [] };
      }))).then(rows => {
      if (cancelled) return;
      const entries = [];
      rows.forEach(({ date, photos }) => {
        photos.forEach((photo, index) => {
          if (!photo || isTombstone(photo)) return;
          const full = normalizePhotoUrl(photo.imageUrl || photo.full || photo.thumbUrl || photo.thumb || '');
          const thumb = normalizePhotoUrl(photo.thumbUrl || photo.thumb || photo.imageUrl || full);
          if (!full && !thumb) return;
          const sourceImageIndex = Number.isInteger(photo.sourceImageIndex)
            ? photo.sourceImageIndex
            : (Number.isFinite(Number(photo.sourceImageIndex)) ? Number(photo.sourceImageIndex) : null);
          const mediaKey = photo.mediaKey
            || (photo.sourceMessageId && sourceImageIndex != null ? `chat:${photo.sourceMessageId}:${sourceImageIndex}` : `meeting-index:${date}:${photo.id || index}`);
          const refKey = photo.refKey || `meeting-index:${photo.id || `${date}:${index}`}`;
          entries.push({
            full: full || thumb,
            thumb: thumb || full,
            imageIndex: sourceImageIndex != null ? sourceImageIndex : index,
            messageId: null,
            photoId: photo.id || '',
            sourceMessageId: photo.sourceMessageId || '',
            sourceImageIndex,
            timestamp: Number(photo.createdAt || photo.updatedAt || 0),
            tags: String(photo.tags || ''),
            directMediaUrl: '',
            source: 'meeting',
            meetingDate: date,
            mediaKey,
            refKey
          });
        });
      });
      indexedMeetingDatesKeyRef.current = datesKey;
      setIndexedMeetingPhotoEntries(entries);
    });
    return () => { cancelled = true; };
  }, [historyTab, anniversaries, onFetchMeetingPhotoIndex]);
  const historyPhotoEntries = React.useMemo(() => {
    if (!indexedMeetingPhotoEntries.length) return baseHistoryPhotoEntries;
    const byKey = new Map();
    const sourceRank = { chat: 0, memo: 1, meeting: 2, anniversary: 3 };
    [...baseHistoryPhotoEntries, ...indexedMeetingPhotoEntries].forEach(entry => {
      const key = getPhotoAssetCommentKey(entry) || entry.mediaKey || entry.refKey || entry.full || entry.thumb;
      if (!key) return;
      const prev = byKey.get(key);
      if (!prev || (sourceRank[entry.source] ?? 9) < (sourceRank[prev.source] ?? 9)) byKey.set(key, entry);
    });
    return Array.from(byKey.values()).sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
  }, [baseHistoryPhotoEntries, indexedMeetingPhotoEntries]);
  const [selectedPersonTag, setSelectedPersonTag] = React.useState(null);
  // Selecting a different person tag (or leaving the detail view) must not leave a stale rename
  // draft armed for whichever tag comes next.
  React.useEffect(() => {
    setIsEditingPersonTagLabel(false);
    setEditPersonTagLabelDraft('');
  }, [selectedPersonTag]);
  React.useEffect(() => { setSelectedPersonTag(null); setSelectedMemoryGroupId(null); }, [historyTab]);
  const [isMemoryListEditMode, setIsMemoryListEditMode] = React.useState(false);
  const [selectedMemoryGroupIds, setSelectedMemoryGroupIds] = React.useState(() => new Set());
  const [isMemoryAddModalOpen, setIsMemoryAddModalOpen] = React.useState(false);
  const [isChangingMemoryGroups, setIsChangingMemoryGroups] = React.useState(false);
  React.useEffect(() => {
    setIsMemoryListEditMode(false);
    setSelectedMemoryGroupIds(new Set());
    setIsMemoryAddModalOpen(false);
  }, [historyTab]);
  // 추억 상세 페이지의 사진 일괄 제외 -- 사진 하나하나 라이트박스를 열어 개별적으로 "이 추억에서
  // 제거"를 누르기엔 사진이 수십~수백 장인 여행에서는 너무 번거로워서, 편집 모드에서 체크박스로
  // 여러 장을 골라 한 번에 제외할 수 있게 한다.
  const [isMemoryEditMode, setIsMemoryEditMode] = React.useState(false);
  const [selectedMemoryPhotoKeys, setSelectedMemoryPhotoKeys] = React.useState(() => new Set());
  const [isExcludingMemoryPhotos, setIsExcludingMemoryPhotos] = React.useState(false);
  React.useEffect(() => { setIsMemoryEditMode(false); setSelectedMemoryPhotoKeys(new Set()); }, [selectedMemoryGroupId]);
  const toggleMemoryPhotoSelected = key => {
    setSelectedMemoryPhotoKeys(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };
  const handleClickExcludeMemoryPhotos = group => {
    const keys = Array.from(selectedMemoryPhotoKeys);
    if (!keys.length || typeof onRemovePhotosFromMemory !== 'function') return;
    const doExclude = async () => {
      setIsExcludingMemoryPhotos(true);
      try {
        const ok = await onRemovePhotosFromMemory(group.id, keys);
        if (ok !== false) {
          setIsMemoryEditMode(false);
          setSelectedMemoryPhotoKeys(new Set());
          // 이번에 제외한 사진이 이 그룹의 전부였다면 목록에서 그룹 자체가 사라진다 --
          // 그대로 두면 상세 화면(뒤로가기 버튼 포함)이 통째로 안 보이는 먹통 상태가 되므로
          // 미리 목록으로 돌아간다.
          if (keys.length >= group.photos.length) clearMemoryGroup();
        }
      } finally {
        setIsExcludingMemoryPhotos(false);
      }
    };
    if (typeof onRequestConfirm === 'function') {
      onRequestConfirm('사진 제외', `총 ${keys.length}장의 사진을 ${group.title}에서 제외할까요?`, doExclude);
    }
  };
  // 흔들도시락처럼 매월 반복 일정용으로 등록한 기념일은 사진이 우연히 그 기간에 걸리면
  // 추억 탭에 여행처럼 그룹으로 잡혀버린다 -- 실제 반복 일정 자체(및 그 사진)는 그대로 두고,
  // 이 기념일만 추억 탭 그룹핑 대상에서 숨기는 플래그(hiddenFromMemories)를 남긴다.
  const [isHidingMemoryGroup, setIsHidingMemoryGroup] = React.useState(false);
  const handleClickDeleteMemoryGroup = group => {
    if (typeof onHideMemoryGroup !== 'function') return;
    const doHide = async () => {
      setIsHidingMemoryGroup(true);
      try {
        const ok = await onHideMemoryGroup(group.id);
        if (ok !== false) clearMemoryGroup();
      } finally {
        setIsHidingMemoryGroup(false);
      }
    };
    if (typeof onRequestConfirm === 'function') {
      onRequestConfirm('추억 삭제', `'${group.title}'을(를) 추억 목록에서 삭제할까요? (사진과 원래 일정은 그대로 유지됩니다)`, doHide);
    }
  };
  // "추가" -- 라이트박스/편집 모드에서 제외했던 사진을 다시 이 추억에 넣을 수 있게, 제외된
  // 사진 목록을 레이어 팝업으로 보여주고 체크박스로 골라 되돌린다.
  const [isAddBackModalOpen, setIsAddBackModalOpen] = React.useState(false);
  const [selectedAddBackKeys, setSelectedAddBackKeys] = React.useState(() => new Set());
  const [isAddingBackPhotos, setIsAddingBackPhotos] = React.useState(false);
  React.useEffect(() => { setIsAddBackModalOpen(false); setSelectedAddBackKeys(new Set()); }, [selectedMemoryGroupId]);
  const toggleAddBackPhotoSelected = key => {
    setSelectedAddBackKeys(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };
  const handleClickAddBackPhotos = async (group) => {
    const keys = Array.from(selectedAddBackKeys);
    if (!keys.length || typeof onAddPhotosBackToMemory !== 'function') return;
    setIsAddingBackPhotos(true);
    try {
      const ok = await onAddPhotosBackToMemory(group.id, keys);
      if (ok !== false) {
        setIsAddBackModalOpen(false);
        setSelectedAddBackKeys(new Set());
      }
    } finally {
      setIsAddingBackPhotos(false);
    }
  };
  const entryTagTokens = entry => String(entry?.tags || '').split(/[,\s#]+/).map(t => t.trim()).filter(Boolean);
  // 한국식 성+이름 태그 매칭: "박영우"로 등록된 참여자는 "영우"라고만 붙은 사진 해시태그도
  // 같은 사람으로 인식해야 한다. 성 1자를 뗀 이름만으로도 같은 사람을 부르는 경우가 흔하기
  // 때문 -- 2~3음절 한글 이름이면 첫 글자(성으로 추정)를 뗀 나머지도 매칭 후보에 넣는다.
  const getPersonNameVariants = name => {
    const trimmed = String(name || '').trim();
    if (!trimmed) return [];
    const variants = new Set([trimmed]);
    if (/^[가-힣]{2,3}$/.test(trimmed)) variants.add(trimmed.slice(1));
    return Array.from(variants);
  };
  // tag는 {label, participantId} -- 한때 participantId가 있으면(실제 캘린더 참여자) "그 사람이
  // 보낸 사진 전부"를 자동으로 그 사람 사진으로 매칭했었다. 하지만 "보낸 사진"과 "그 사람이
  // 등장하는 사진"은 다른 개념이라, 음식/풍경/서류 스캔처럼 본인이 안 나온 사진까지 전부
  // 잡혀버려 인물 탭이 실제와 동떨어지게 부풀려지는 문제가 있었다. 인물 태그는 해시태그(#이름)로
  // 명시적으로 붙인 사진만 인정한다 -- participantId는 더 이상 매칭에 쓰지 않는다.
  // "#해맑은도연"처럼 이름 앞뒤에 다른 글자가 붙은 해시태그도 같은 사람으로 인식해야 하므로
  // 완전일치 대신 부분일치(포함)로 비교한다. 다만 성을 뗀 1음절 변형("도연" -> "연")까지 부분일치를
  // 허용하면 "연"이 들어간 무관한 태그까지 잡혀 인물 탭이 부풀려지므로, 1음절 변형은 기존처럼
  // 완전일치만 인정한다.
  const getPhotosForTagLabel = React.useCallback((label) => {
    if (!label) return [];
    const variants = getPersonNameVariants(label).map(v => v.toLowerCase());
    return historyPhotoEntries.filter(entry => {
      const tokens = entryTagTokens(entry).map(t => t.toLowerCase());
      return variants.some(v => v.length <= 1 ? tokens.includes(v) : tokens.some(t => t.includes(v)));
    });
  }, [historyPhotoEntries]);
  const photosForPersonTag = React.useMemo(
    () => getPhotosForTagLabel(selectedPersonTag),
    [getPhotosForTagLabel, selectedPersonTag]
  );
  // 인물/추억 탭은 갤러리 페이지(PhotoGallery)와 달리 지금까지 setActiveLightbox에 URL 목록만
  // 넘겨서, 공유 라이트박스 호스트(app-main.js)가 받는 meta가 비어 태그 입력/삭제/교체 등 표준
  // 라이트박스 기능이 전혀 동작하지 않았다. PhotoGallery와 동일하게 이 탭 전용 라이트박스를
  // 로컬로 띄우고, historyPhotoEntries가 이미 갖고 있는 전체 메타를 그대로 넘긴다.
  // memoryId가 있으면(추억 탭에서 연 경우) 해당 여행 사진 모음에서만 제거하는 버튼이 뜬다.
  const [historyLightbox, setHistoryLightbox] = React.useState(null);
  const openHistoryLightbox = (photos, index, memoryId = null) => {
    const urls = photos.map(p => p.full || p.thumb).filter(Boolean);
    if (urls.length === 0) return;
    const meta = photos.map(p => ({
      timestamp: p.timestamp, messageId: p.messageId, imageIndex: p.imageIndex, thumb: p.thumb,
      tags: p.tags, directMediaUrl: p.directMediaUrl, source: p.source, uploadSource: p.uploadSource,
      anniversaryId: p.anniversaryId,
      meetingDate: p.meetingDate, photoId: p.photoId, sourceMessageId: p.sourceMessageId,
      sourceImageIndex: p.sourceImageIndex, mediaKey: p.mediaKey, refKey: p.refKey,
      legacyKeys: p.legacyKeys
    }));
    setHistoryLightbox({ urls, index, meta, memoryId });
  };
  // 추억 탭: 날짜(startDate/date)가 등록된 기념일이면 카테고리와 상관없이, 그 기간에 등록된
  // 사진을 모아 보여준다 (여행만이 아니라 행사/축제/생일 등도 사진이 있으면 노출).
  // 모임(meeting) 사진은 timestamp(업로드/확정 시각)와 실제 모임 날짜(meetingDate)가 다른 경우가
  // 많다 -- 모임 당일이 아니라 나중에 사진을 올리거나 확정하는 경우가 흔하기 때문. 그래서
  // Upload time is not schedule membership. Timestamp fallback used to mix unrelated chat or
  // memo photos uploaded during a trip into that memory.
  // Chat/memo photos can be attached to a meeting by a compact date hashtag (26.09.04,
  // 260904, etc.) rather than by a meeting-photo reference. Treat those explicit dates as the
  // source of truth before falling back to the upload timestamp; otherwise photos uploaded later
  // than the trip disappear from its memories group even though the date modal shows them.
  const entryTaggedDates = entry => parseHistoryDateTokens(entry?.tags || '');
  const entryMatchesDateRange = (entry, start, end) => {
    if (!entry || !start || !end) return false;
    if (entry.meetingDate) {
      const meetingDate = String(entry.meetingDate).slice(0, 10);
      if (meetingDate >= start && meetingDate <= end) return true;
    }
    if (entryTaggedDates(entry).some(date => date >= start && date <= end)) return true;
    if (entry.source === 'anniversary') {
      const anniversaryDate = String(entry.meetingDate || '').slice(0, 10);
      return !!anniversaryDate && anniversaryDate >= start && anniversaryDate <= end;
    }
    return false;
  };
  const travelMemoryGroups = React.useMemo(() => {
    // range 타입(dayMode==='range')이 아닌 once/yearly 타입(하루짜리) 여행 기념일은
    // a.startDate/a.endDate가 비어 있고 대신 a.date에 날짜가 저장된다 (컨텐츠 상세 시트의
    // "기간: 정보없음" 버그와 같은 원인) -- a.date를 폴백으로 읽지 않으면 하루짜리로 등록한
    // 여행은 사진이 있어도 추억 탭에서 통째로 사라진다.
    return (anniversaries || [])
      .filter(a => a && (a.startDate || a.date) && !a.hiddenFromMemories)
      .map(a => {
        const start = a.startDate || a.date;
        const end = a.endDate || a.startDate || a.date;
        // 날짜 구간으로 자동 수집되다 보니 그 기념일과 상관없는 사진이 섞여 들어올 수 있어,
        // 라이트박스의 '이 추억에서 제거' 버튼으로 뺀 사진(excludedMemoryPhotoKeys)은 제외한다.
        const excluded = new Set(Array.isArray(a.excludedMemoryPhotoKeys) ? a.excludedMemoryPhotoKeys : []);
        const photosInRange = historyPhotoEntries.filter(entry => {
          return entryMatchesDateRange(entry, start, end);
        });
        const photos = photosInRange.filter(entry => {
          const key = entry.mediaKey || entry.refKey;
          return !key || !excluded.has(key);
        });
        // 제외된 사진 목록 -- "추가" 버튼에서 다시 추억에 넣을 수 있게 보여준다.
        const excludedPhotos = photosInRange.filter(entry => {
          const key = entry.mediaKey || entry.refKey;
          return key && excluded.has(key);
        });
        return { id: a.id, title: a.title || '기록', startDate: start, endDate: end, photos, excludedPhotos };
      })
      // 등록된 사진이 없는 여행은 목록에서 아예 숨긴다 -- 빈 여행 카드를 계속 보여주는 것보다
      // 실제로 추억(사진)이 쌓인 여행만 보여주는 게 이 탭의 취지에 맞다.
      .filter(group => group.photos.length > 0)
      .sort((a, b) => (b.startDate || '').localeCompare(a.startDate || ''));
  }, [anniversaries, historyPhotoEntries]);

    const handleExcludeMemoryGroups = async () => {
    const ids = Array.from(selectedMemoryGroupIds);
    if (!ids.length || typeof onHideMemoryGroup !== 'function') return;
    const doExclude = async () => {
      setIsChangingMemoryGroups(true);
      try {
        for (const id of ids) await onHideMemoryGroup(id);
        setIsMemoryListEditMode(false);
        setSelectedMemoryGroupIds(new Set());
      } finally {
        setIsChangingMemoryGroups(false);
      }
    };
    if (typeof onRequestConfirm === 'function') onRequestConfirm('추억 제외', `선택한 추억 ${ids.length}개를 목록에서 제외할까요?`, doExclude);
  };
  // 이미 추억 목록에 있는 기념일을 제외하고, 사진이 있거나 이전에 숨긴 기록이 있는
  // 기념일만 추가 후보로 보여준다. 실제 추가/복원은 기존 기념일 문서 모듈을 재사용한다.
  const memoryGroupIds = new Set(travelMemoryGroups.map(group => group.id));
  const availableMemoryGroups = React.useMemo(() => (anniversaries || []).filter(a => {
    if (!a || !a.id || memoryGroupIds.has(a.id)) return false;
    const start = a.startDate || a.date;
    const end = a.endDate || a.startDate || a.date;
    if (!start || !end) return false;
    return historyPhotoEntries.some(entry => entryMatchesDateRange(entry, start, end));
  }).map(a => ({ id: a.id, title: a.title || '기록', startDate: a.startDate || a.date, endDate: a.endDate || a.startDate || a.date, hidden: !!a.hiddenFromMemories }))
    .sort((a, b) => (b.startDate || '').localeCompare(a.startDate || '')), [anniversaries, historyPhotoEntries, travelMemoryGroups]);
  const handleRestoreMemoryGroup = async id => {
    if (typeof onRestoreMemoryGroup !== 'function') return;
    setIsChangingMemoryGroups(true);
    try {
      const ok = await onRestoreMemoryGroup(id);
      if (ok !== false) setIsMemoryAddModalOpen(false);
    } finally { setIsChangingMemoryGroups(false); }
  };

  // 추억 상세/제외된 사진 팝업이 공유하는 썸네일 그리드 -- checkable이면 체크박스 오버레이를 켜고
  // 탭할 때 onToggle을, 아니면 onOpen(라이트박스)을 부른다.
  const renderPhotoThumbGrid = (photos, { checkable, selectedKeys, onToggle, onOpen, keyPrefix }) => (
    /*#__PURE__*/React.createElement("div", {
      style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: '4px' }
    }, photos.map((photo, idx) => {
      const photoKey = photo.mediaKey || photo.refKey || `${keyPrefix}${idx}`;
      const isChecked = checkable && selectedKeys.has(photoKey);
      const identity = getPhotoCommentIdentity(photo, photos, { source: photo.source, meetingDate: photo.meetingDate }) || {};
      const commentCount = getPhotoCommentCount(identity, photoCommentCounts) || Math.max(0, Number(photo.commentCount || 0));
      return /*#__PURE__*/React.createElement("button", {
        key: photoKey, type: "button",
        onClick: () => checkable ? onToggle(photoKey) : onOpen(idx),
        style: { position: 'relative', padding: 0, border: 'none', borderRadius: 'var(--radius-sm)', overflow: 'hidden', aspectRatio: '1 / 1', cursor: 'pointer', backgroundColor: 'var(--bg-primary)' }
      },
        /*#__PURE__*/React.createElement("img", {
          src: photo.thumb || photo.full, alt: "", loading: "lazy", decoding: "async",
          style: { width: '100%', height: '100%', objectFit: 'cover' }
        }),
        PhotoCommentCountBadge && /*#__PURE__*/React.createElement(PhotoCommentCountBadge, { count: commentCount }),
        checkable && /*#__PURE__*/React.createElement("span", {
          "aria-hidden": true,
          style: {
            position: 'absolute', top: '4px', left: '4px', width: '20px', height: '20px', borderRadius: '5px',
            border: isChecked ? 'none' : '2px solid rgba(255,255,255,0.9)',
            backgroundColor: isChecked ? 'var(--accent-primary)' : 'rgba(0,0,0,0.35)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 1px 3px rgba(0,0,0,0.4)'
          }
        }, isChecked && /*#__PURE__*/React.createElement("svg", {
          xmlns: "http://www.w3.org/2000/svg", width: "14", height: "14", viewBox: "0 0 24 24",
          fill: "none", stroke: "#fff", strokeWidth: "3", strokeLinecap: "round", strokeLinejoin: "round"
        }, /*#__PURE__*/React.createElement("path", { d: "M20 6 9 17l-5-5" })))
      );
    }))
  );

  return /*#__PURE__*/React.createElement("div", {
    className: "places-view-container",
    style: {
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'var(--bg-primary)',
      display: 'flex', flexDirection: 'column',
      width: '100%', maxWidth: '100%', overflow: 'hidden'
    }
  },
    /*#__PURE__*/React.createElement("div", {
      ref: headerStackRef,
      className: "history-header-stack",
      style: {
        // iOS 홈화면 설치(standalone) 상태에서는 상태바 영역까지 콘텐츠가 그려지므로, top:0
        // 대신 env(safe-area-inset-top)만큼 아래로 밀어야 상태바 아이콘과 겹치지 않고 버튼도
        // 눌린다. 일반 브라우저 탭에서는 이 값이 0이라 동작 변화 없음.
        position: 'fixed', top: 'env(safe-area-inset-top, 0px)', left: 0, right: 0, zIndex: 1010,
        backgroundColor: 'var(--bg-primary)',
        transition: 'transform 0.3s ease',
        transform: isHeaderVisible ? 'translateY(0)' : 'translateY(-100%)'
      }
    },
    /*#__PURE__*/React.createElement("div", {
      className: "places-view-header",
      style: {
        position: 'relative', height: '56px',
        backgroundColor: 'var(--bg-card)', borderBottom: '1px solid var(--border-subtle)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 16px', flexShrink: 0
      }
    },
      /*#__PURE__*/React.createElement("button", {
        type: "button", onClick: onBack, "aria-label": "뒤로가기",
        style: {
          width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'transparent', border: 'none',
          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-muted)'
        }
      }, BackArrowIcon ? /*#__PURE__*/React.createElement(BackArrowIcon, { size: 22 }) : "←"),
      /*#__PURE__*/React.createElement("div", {
        style: {
          position: 'absolute', left: '50%', transform: 'translateX(-50%)',
          display: 'flex', alignItems: 'center', fontWeight: 800, fontSize: '0.95rem',
          color: 'var(--text-main)', whiteSpace: 'nowrap', pointerEvents: 'none'
        }
      }, calendar.title, " 보관함"),
      /*#__PURE__*/React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '8px' } },
        /*#__PURE__*/React.createElement("button", {
          type: "button", onClick: () => setIsSearchOpen(v => !v), title: "보관함 검색", "aria-label": "보관함 검색",
          style: { background: 'none', border: 'none', cursor: 'pointer', padding: '6px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }
        }, SearchIcon ? /*#__PURE__*/React.createElement(SearchIcon, null) : "🔍"),
        /*#__PURE__*/React.createElement("button", {
          type: "button", onClick: () => setIsMenuOpen(true), title: "메뉴", "aria-label": "메뉴 열기",
          style: { background: 'none', border: 'none', cursor: 'pointer', padding: '6px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }
        }, ThreeLinesIcon ? /*#__PURE__*/React.createElement(ThreeLinesIcon, { size: 22 }) : "≡")
      )
    ),
    isSearchOpen && InlineSearchBar && /*#__PURE__*/React.createElement(InlineSearchBar, {
      value: searchQuery,
      placeholder: "날짜·참여자·메모·장소 검색...",
      onChange: e => setSearchQuery(e.target.value),
      onClose: () => { setIsSearchOpen(false); setSearchQuery(''); }
    }),
    UnderlineTabs && /*#__PURE__*/React.createElement(UnderlineTabs, {
      ariaLabel: "보관함 탭",
      value: historyTab,
      onChange: changeHistoryTab,
      options: [
        { value: 'memories', label: '추억' },
        { value: 'people', label: '인물' },
        { value: 'meetings', label: '지난모임' }
      ]
    })
    ), // end history-header-stack
    historyTab === 'meetings' && /*#__PURE__*/React.createElement("div", {
      className: "history-meetings-grid history-page-scroll",
      onScroll: handleHistoryScroll,
      style: Object.assign(
        { flex: 1, minHeight: 0, overflowY: 'auto', overscrollBehavior: 'contain', WebkitOverflowScrolling: 'touch', padding: '118px 16px 16px' },
        confirmedDates.length === 0 ? { display: 'flex', alignItems: 'center', justifyContent: 'center' } : {}
      )
    },
      confirmedDates.length === 0 ? /*#__PURE__*/React.createElement("div", {
        style: { textAlign: 'center', color: 'var(--text-muted)', fontSize: 'var(--font-size-md)' }
      }, q ? "검색 결과가 없습니다." : "아직 확정된 모임이 없습니다.") : confirmedDates.map(d => {
        const dateEntries = (dateMap[d] || []).filter(e => (participantsMap[e.participantId] || e.participantId === BULK_NO_PARTICIPANT_ID) && !isTombstone(e));
        const memoEntries = dateEntries.filter(e => e.note && e.note.trim().length > 0);
        const isPast = d < todayStr;
        const ddayLabel = isPast ? '지난 모임' : (() => {
          const dday = calculateDday(d);
          return dday <= 0 ? 'D-DAY' : `D-${dday}`;
        })();
        const datePlaces = getCalendarPlaces(calendar).filter(p => doesPlaceMatchDate(p, d));
        return /*#__PURE__*/React.createElement("button", {
          key: d,
          className: `date-item-btn ${isPast ? 'is-past' : 'is-confirmed'} confirmed-meeting-card confirmed-meeting-surface`,
          onClick: () => onSelectDate(d),
          style: { flexDirection: 'column', alignItems: 'flex-start' }
        },
          /*#__PURE__*/React.createElement("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', gap: '8px' } },
            /*#__PURE__*/React.createElement("span", {
              className: "confirmed-meeting-date",
              style: { fontWeight: 800, color: isPast ? '#94A3B8' : '#FFFFFF', fontSize: '0.95rem', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }
            }, isPast ? formatDateWithDayName(d) : formatConfirmedMeetingLabel(d)),
            /*#__PURE__*/React.createElement("span", { className: `date-item-badge dday-badge ${isPast ? 'is-past' : 'is-confirmed'}`, style: { flexShrink: 0 } }, ddayLabel)
          ),
          memoEntries.length > 0 && /*#__PURE__*/React.createElement("div", { style: { display: 'flex', alignItems: 'flex-start', gap: '6px', flexWrap: 'wrap' } },
            memoEntries.map(e => {
              const p = participantsMap[e.participantId] || (e.participantId === BULK_NO_PARTICIPANT_ID ? { id: BULK_NO_PARTICIPANT_ID, name: '일정', color: '#94A3B8' } : null);
              if (!p) return null;
              const memoUrl = extractFirstUrl(e.note);
              const memoText = memoUrl ? removeFirstUrl(e.note) : e.note.trim();
              if (!memoText) return null;
              return /*#__PURE__*/React.createElement("span", {
                key: e.participantId || p.id,
                className: `memo-capsule-badge ${isPast ? 'is-past' : ''}`,
                style: isPast
                  ? { backgroundColor: 'transparent', background: 'transparent', color: p.color, border: `1px solid ${p.color}`, boxShadow: 'none' }
                  : { backgroundColor: p.color, color: getContrastTextColor(p.color) },
                title: `${p.name}: ${memoText}`
              }, memoText);
            })
          ),
          datePlaces.length > 0 && /*#__PURE__*/React.createElement("div", {
            style: {
              display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '2px', width: '100%',
              ...(isPast ? {} : { mixBlendMode: 'luminosity' })
            }
          },
            datePlaces.map(place => {
              const mapUrl = getKakaoMapLinkUrl(place);
              const placeName = place.alias || place.name;
              const address = place.address ? getDisplayPlaceAddress(place) : '';
              return /*#__PURE__*/React.createElement("div", {
                key: place.id,
                className: "place-memo-stack",
                style: {
                  display: 'flex', alignItems: 'flex-start', gap: '6px',
                  backgroundColor: isPast ? 'transparent' : '#333',
                  borderRadius: isPast ? 0 : 'var(--radius-md)',
                  borderTop: isPast ? '1px solid rgba(0, 0, 0, 0.05)' : 'none',
                  padding: '7px 10px', width: '100%', boxSizing: 'border-box'
                }
              },
                MapPinIcon && /*#__PURE__*/React.createElement(MapPinIcon, { size: 14, style: { flexShrink: 0, marginTop: '2px', color: '#7C3AED' } }),
                /*#__PURE__*/React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: '1px', minWidth: 0 } },
                  mapUrl
                    ? /*#__PURE__*/React.createElement("a", {
                        href: mapUrl, target: "_blank", rel: "noreferrer",
                        onClick: e => e.stopPropagation(),
                        style: { fontSize: 'var(--font-size-sm)', fontWeight: 800, color: isPast ? 'var(--text-main)' : '#fff', textDecoration: 'none', wordBreak: 'break-word' }
                      }, placeName)
                    : /*#__PURE__*/React.createElement("span", { style: { fontSize: 'var(--font-size-sm)', fontWeight: 800, color: isPast ? 'var(--text-main)' : '#fff', wordBreak: 'break-word' } }, placeName),
                  address && /*#__PURE__*/React.createElement("span", { style: { fontSize: 'var(--font-size-xs)', color: isPast ? 'var(--text-muted)' : '#fff', wordBreak: 'break-word' } }, address)
                )
              );
            })
          )
        );
      })
    ),
    // 추억 탭: 인물 탭과 동일하게, 초기화면은 여행별 벤또 그리드(칸마다 그 여행의 최신 등록
    // 사진을 배경으로, 딤 처리 위에 여행 타이틀). 칸을 누르면 그 여행 사진만 모아 보여주는
    // 상세 페이지로 들어간다.
    historyTab === 'memories' && !selectedMemoryGroupId && /*#__PURE__*/React.createElement("div", {
      className: "history-page-scroll",
      onScroll: handleHistoryScroll,
      style: { flex: 1, minHeight: 0, overflowY: 'auto', overscrollBehavior: 'contain', WebkitOverflowScrolling: 'touch', padding: '118px 16px 16px' }
    }, /*#__PURE__*/React.createElement(React.Fragment, null,
      /*#__PURE__*/React.createElement("div", {
        style: { display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '8px', marginBottom: '10px' }
      },
        /*#__PURE__*/React.createElement("button", {
          type: "button", "aria-label": "추억 추가", onClick: () => setIsMemoryAddModalOpen(true),
          style: { width: '36px', minWidth: '36px', height: '36px', minHeight: '36px', padding: 0, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-main)', fontSize: '1.35rem', lineHeight: 1, cursor: 'pointer' }
        }, "+"),
        isMemoryListEditMode
          ? /*#__PURE__*/React.createElement(React.Fragment, null,
              /*#__PURE__*/React.createElement("button", {
                type: "button", "aria-label": "추억 편집 취소", onClick: () => { setIsMemoryListEditMode(false); setSelectedMemoryGroupIds(new Set()); }, disabled: isChangingMemoryGroups,
                style: { height: '34px', padding: '0 10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-main)', fontSize: 'var(--font-size-sm)', fontWeight: 700, cursor: 'pointer' }
              }, "취소"),
              /*#__PURE__*/React.createElement("button", {
                type: "button", "aria-label": "추억 제외", onClick: handleExcludeMemoryGroups, disabled: selectedMemoryGroupIds.size === 0 || isChangingMemoryGroups,
                style: { height: '34px', padding: '0 10px', borderRadius: 'var(--radius-md)', border: 'none', backgroundColor: '#EF4444', color: '#fff', fontSize: 'var(--font-size-sm)', fontWeight: 700, opacity: selectedMemoryGroupIds.size === 0 || isChangingMemoryGroups ? 0.5 : 1, cursor: 'pointer' }
              }, `제외${selectedMemoryGroupIds.size ? ` (${selectedMemoryGroupIds.size})` : ''}`)
            )
          : /*#__PURE__*/React.createElement("button", {
              type: "button", "aria-label": "추억 편집", onClick: () => setIsMemoryListEditMode(true),
              style: { width: '36px', minWidth: '36px', height: '36px', minHeight: '36px', padding: 0, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }
            }, PencilIcon ? /*#__PURE__*/React.createElement(PencilIcon, { size: 16 }) : "✎")
      ),
      /*#__PURE__*/React.createElement("div", { style: {} },
      travelMemoryGroups.length === 0
        ? /*#__PURE__*/React.createElement("div", {
            style: {
              flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              gap: '8px', padding: '24px', textAlign: 'center', color: 'var(--text-muted)'
            }
          },
            /*#__PURE__*/React.createElement("span", { style: { fontSize: '2rem' } }, "🗂️"),
            /*#__PURE__*/React.createElement("span", { style: { fontSize: 'var(--font-size-md)', fontWeight: 700, color: 'var(--text-main)' } }, "등록된 추억이 없습니다"),
            /*#__PURE__*/React.createElement("span", { style: { fontSize: 'var(--font-size-sm)' } }, "기념일을 등록하면, 그 날짜(구간)에 올라온 사진을 여기 모아 보여줘요.")
          )
        : /*#__PURE__*/React.createElement("div", { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '10px' } },
            travelMemoryGroups.map(group => {
              const cover = group.photos[0];
              return /*#__PURE__*/React.createElement("button", {
                key: group.id,
                type: "button",
                onClick: () => openMemoryGroup(group.id),
                style: {
                  position: 'relative', aspectRatio: '1 / 1', borderRadius: 'var(--radius-lg)', overflow: 'hidden',
                  border: 'none', padding: 0, cursor: 'pointer', backgroundColor: 'var(--bg-card)'
                }
              },
                /*#__PURE__*/React.createElement("span", { style: { position: 'absolute', top: '6px', right: '6px', zIndex: 3, minWidth: '24px', height: '24px', padding: '0 6px', borderRadius: '999px', background: 'rgba(15,23,42,0.78)', color: '#fff', fontSize: 'var(--font-size-xs)', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' } }, String(group.photos.length)),
                cover
                  ? /*#__PURE__*/React.createElement("img", {
                      src: cover.thumb || cover.full, alt: "", loading: "lazy", decoding: "async",
                      style: { width: '100%', height: '100%', objectFit: 'cover' }
                    })
                  : /*#__PURE__*/React.createElement("div", {
                      style: {
                        width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '2.2rem'
                      }
                    }, "🗺️"),
                /*#__PURE__*/React.createElement("div", {
                  style: {
                    position: 'absolute', left: 0, right: 0, bottom: 0, padding: '8px 10px',
                    background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                    display: 'flex', flexDirection: 'column', gap: '1px'
                  }
                },
                  /*#__PURE__*/React.createElement("span", { style: { color: '#fff', fontWeight: 800, fontSize: 'var(--font-size-sm)' } }, group.title),
                  /*#__PURE__*/React.createElement("span", { style: { color: 'rgba(255,255,255,0.85)', fontSize: 'var(--font-size-2xs)' } }, formatHistoryDate(group.startDate))
                )
              );
            })
          )
      ),
      isMemoryAddModalOpen && /*#__PURE__*/React.createElement("div", {
        className: "bottom-sheet-overlay", onClick: () => setIsMemoryAddModalOpen(false), style: { zIndex: 12000 }
      }, /*#__PURE__*/React.createElement("div", { className: "bottom-sheet", onClick: e => e.stopPropagation() },
        /*#__PURE__*/React.createElement("div", { className: "bottom-sheet-header" },
          /*#__PURE__*/React.createElement("h4", null, "추억에 추가할 기념일"),
          /*#__PURE__*/React.createElement("button", { type: "button", onClick: () => setIsMemoryAddModalOpen(false), style: { background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.2rem', cursor: 'pointer' } }, '✕')
        ),
        /*#__PURE__*/React.createElement("div", { className: "bottom-sheet-body" },
          availableMemoryGroups.length === 0
            ? /*#__PURE__*/React.createElement("p", { style: { color: 'var(--text-muted)', textAlign: 'center', padding: '24px 0' } }, "추가할 미등록 기념일이 없습니다.")
            : availableMemoryGroups.map(item => /*#__PURE__*/React.createElement("button", {
                key: item.id, type: "button", disabled: isChangingMemoryGroups, onClick: () => handleRestoreMemoryGroup(item.id),
                style: { width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', padding: '12px', marginBottom: '8px', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', background: 'var(--bg-primary)', color: 'var(--text-main)', textAlign: 'left', cursor: 'pointer' }
              }, /*#__PURE__*/React.createElement("span", null,
                /*#__PURE__*/React.createElement("strong", { style: { display: 'block' } }, item.title),
                /*#__PURE__*/React.createElement("small", { style: { color: 'var(--text-muted)' } }, formatHistoryDateRange(item.startDate, item.endDate))
              ), /*#__PURE__*/React.createElement("span", { style: { color: 'var(--accent-primary)', fontWeight: 800 } }, "+")))
        )
      ))
    )),
    // 추억 상세 페이지: 특정 여행 칸을 눌렀을 때 그 여행 사진만 모아 보여준다.
    historyTab === 'memories' && !!selectedMemoryGroupId && (() => {
      const group = travelMemoryGroups.find(g => g.id === selectedMemoryGroupId);
      if (!group) return null;
      const canBulkExclude = typeof onRemovePhotosFromMemory === 'function';
      return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
        className: "history-page-scroll",
        onScroll: handleHistoryScroll,
        style: { flex: 1, minHeight: 0, overflowY: 'auto', overscrollBehavior: 'contain', WebkitOverflowScrolling: 'touch', padding: '118px 16px 16px' }
      }, /*#__PURE__*/React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: '12px' } },
        /*#__PURE__*/React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '8px' } },
          /*#__PURE__*/React.createElement("button", {
            type: "button", onClick: () => clearMemoryGroup(true), "aria-label": "추억 목록으로",
            style: {
              width: '32px', height: '32px', borderRadius: '50%', border: 'none', background: 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-muted)', flexShrink: 0
            }
          }, BackArrowIcon ? /*#__PURE__*/React.createElement(BackArrowIcon, { size: 20 }) : "←"),
          /*#__PURE__*/React.createElement("div", { style: { display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1 } },
            /*#__PURE__*/React.createElement("span", { style: { fontSize: 'var(--font-size-lg)', fontWeight: 800, color: 'var(--text-main)' } }, group.title),
            /*#__PURE__*/React.createElement("span", { style: { fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' } },
              formatHistoryDateRange(group.startDate, group.endDate)
            )
          ),
          canBulkExclude && (
            isMemoryEditMode
              ? /*#__PURE__*/React.createElement(React.Fragment, null,
                  /*#__PURE__*/React.createElement("button", {
                    type: "button",
                    onClick: () => { setIsMemoryEditMode(false); setSelectedMemoryPhotoKeys(new Set()); },
                    disabled: isExcludingMemoryPhotos,
                    style: {
                      flexShrink: 0, height: '32px', padding: '0 12px', borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-main)',
                      fontSize: 'var(--font-size-sm)', fontWeight: 700, cursor: 'pointer'
                    }
                  }, "취소"),
                  /*#__PURE__*/React.createElement("button", {
                    type: "button",
                    onClick: () => handleClickExcludeMemoryPhotos(group),
                    disabled: selectedMemoryPhotoKeys.size === 0 || isExcludingMemoryPhotos,
                    style: {
                      flexShrink: 0, height: '32px', padding: '0 12px', borderRadius: 'var(--radius-md)', border: 'none',
                      backgroundColor: '#EF4444', color: '#fff', fontSize: 'var(--font-size-sm)', fontWeight: 700,
                      cursor: (selectedMemoryPhotoKeys.size === 0 || isExcludingMemoryPhotos) ? 'default' : 'pointer',
                      opacity: (selectedMemoryPhotoKeys.size === 0 || isExcludingMemoryPhotos) ? 0.5 : 1
                    }
                  }, `제외${selectedMemoryPhotoKeys.size > 0 ? ` (${selectedMemoryPhotoKeys.size})` : ''}`)
                )
              : [
                  { show: typeof onAddPhotosBackToMemory === 'function', key: 'add', onClick: () => setIsAddBackModalOpen(true), label: '사진 추가', css: { border: 'none', backgroundColor: '#111827', color: '#fff', fontSize: '1.1rem', fontWeight: 800, lineHeight: 1 }, content: "+" },
                  { show: true, key: 'edit', onClick: () => setIsMemoryEditMode(true), label: '편집', css: { border: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-main)' }, content: PencilIcon ? /*#__PURE__*/React.createElement(PencilIcon, { size: 15 }) : "✎" },
                  { show: typeof onHideMemoryGroup === 'function', key: 'delete', onClick: () => handleClickDeleteMemoryGroup(group), disabled: isHidingMemoryGroup, label: '삭제', css: { border: '1px solid #EF4444', backgroundColor: 'var(--bg-primary)', color: '#EF4444', cursor: isHidingMemoryGroup ? 'default' : 'pointer', opacity: isHidingMemoryGroup ? 0.5 : 1 }, content: TrashIcon ? /*#__PURE__*/React.createElement(TrashIcon, { size: 16 }) : "✕" }
                ].map(cfg => cfg.show && /*#__PURE__*/React.createElement("button", {
                  key: cfg.key, type: "button", onClick: cfg.onClick, disabled: cfg.disabled, "aria-label": cfg.label,
                  style: Object.assign({ flexShrink: 0, width: '36px', minWidth: '36px', height: '36px', minHeight: '36px', padding: 0, borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }, cfg.css)
                }, cfg.content))
          )
        ),
        renderPhotoThumbGrid(group.photos, {
          checkable: isMemoryEditMode,
          selectedKeys: selectedMemoryPhotoKeys,
          onToggle: toggleMemoryPhotoSelected,
          onOpen: idx => openHistoryLightbox(group.photos, idx, group.id),
          keyPrefix: `${group.id}_`
        })
      )),
      isAddBackModalOpen && /*#__PURE__*/React.createElement("div", {
        className: "bottom-sheet-overlay",
        onClick: () => setIsAddBackModalOpen(false),
        style: { zIndex: 12000 }
      }, /*#__PURE__*/React.createElement("div", {
        className: "bottom-sheet",
        onClick: e => e.stopPropagation()
      },
        /*#__PURE__*/React.createElement("div", { className: "bottom-sheet-header" },
          /*#__PURE__*/React.createElement("h4", null, "추억에 사진 추가"),
          /*#__PURE__*/React.createElement("button", {
            type: "button",
            style: { background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.2rem', cursor: 'pointer' },
            onClick: () => setIsAddBackModalOpen(false)
          }, '✕')
        ),
        /*#__PURE__*/React.createElement("div", { className: "bottom-sheet-body" },
          group.excludedPhotos.length === 0
            ? /*#__PURE__*/React.createElement("p", { style: { color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)', textAlign: 'center', padding: '24px 0' } }, "추가할 사진이 없습니다.")
            : /*#__PURE__*/React.createElement(React.Fragment, null,
                renderPhotoThumbGrid(group.excludedPhotos, {
                  checkable: true,
                  selectedKeys: selectedAddBackKeys,
                  onToggle: toggleAddBackPhotoSelected,
                  onOpen: () => {},
                  keyPrefix: `excluded_${group.id}_`
                }),
                /*#__PURE__*/React.createElement("button", {
                  type: "button",
                  className: "btn btn-primary",
                  disabled: selectedAddBackKeys.size === 0 || isAddingBackPhotos,
                  onClick: () => handleClickAddBackPhotos(group),
                  style: {
                    width: '100%', height: '44px', minHeight: '44px', fontSize: '0.95rem', fontWeight: 800,
                    borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginTop: '14px', opacity: (selectedAddBackKeys.size === 0 || isAddingBackPhotos) ? 0.5 : 1
                  }
                }, `추가${selectedAddBackKeys.size > 0 ? ` (${selectedAddBackKeys.size})` : ''}`)
              )
        )
      ))
      );
    })(),
    // 인물 탭: 인물별 벤또 그리드(칸마다 그 사람 사진이 붙은 사진 중 하나를 커버로 보여줌).
    // 칸을 누르면 그 사람으로 태그된 사진만 모아 보여주는 상세 페이지로 들어간다.
    historyTab === 'people' && !selectedPersonTag && /*#__PURE__*/React.createElement("div", {
      className: "history-page-scroll",
      onScroll: handleHistoryScroll,
      style: { flex: 1, minHeight: 0, overflowY: 'auto', overscrollBehavior: 'contain', WebkitOverflowScrolling: 'touch', padding: '118px 16px 16px' }
    }, /*#__PURE__*/React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: '16px' } },
      // 새 인물 태그 추가 -- 벤또 그리드 위로 이동(추가 즉시 그리드에 반영되는 걸 바로 보기
      // 쉽도록). 기존 .form-input/.btn-primary만으로는 패딩/높이/모서리가 다른 입력·버튼과
      // 달라 보였어서, 이 화면에서 직접 크기/스타일을 지정해 나머지 디자인과 맞춘다.
      /*#__PURE__*/React.createElement("div", { style: { display: 'flex', gap: '8px', alignItems: 'center' } },
        /*#__PURE__*/React.createElement("input", {
          type: "text",
          placeholder: "새 인물 태그 추가 (예: 삼촌)",
          value: newPersonTag,
          onChange: e => setNewPersonTag(e.target.value),
          onKeyDown: e => { if (e.key === 'Enter') { e.preventDefault(); handleAddPersonTagClick(); } },
          style: {
            flex: 1, height: '40px', padding: '0 14px', borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-primary)',
            color: 'var(--text-main)', fontSize: 'var(--font-size-sm)'
          }
        }),
        /*#__PURE__*/React.createElement("button", {
          type: "button",
          disabled: isAddingPersonTag || !newPersonTag.trim(),
          onClick: handleAddPersonTagClick,
          style: {
            flexShrink: 0, height: '40px', padding: '0 16px', borderRadius: 'var(--radius-md)',
            border: 'none', background: 'var(--accent-gradient)', color: '#fff',
            fontSize: 'var(--font-size-sm)', fontWeight: 800, cursor: 'pointer',
            opacity: (isAddingPersonTag || !newPersonTag.trim()) ? 0.5 : 1
          }
        }, "태그 추가")
      ),
      /*#__PURE__*/React.createElement("div", { style: { color: 'var(--text-muted)', fontSize: 'var(--font-size-xs)' } },
        "칸을 누르면 그 사람으로 태그된 사진을 모아 보여줘요. 사진에 태그를 달려면 갤러리에서 사진을 열고 해시태그로 그 이름을 추가하세요."
      ),
      personTagChips.length === 0
        ? /*#__PURE__*/React.createElement("div", { style: { color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)' } }, "태그가 없습니다. 위에서 인물 태그를 추가해 보세요.")
        : /*#__PURE__*/React.createElement("div", { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '10px' } },
            personTagChips.map(tag => {
              const tagPhotos = getPhotosForTagLabel(tag.label);
              const cover = tagPhotos[0];
              return /*#__PURE__*/React.createElement("button", {
                key: tag.id,
                type: "button",
                onClick: () => setSelectedPersonTag(tag.label),
                style: {
                  position: 'relative', aspectRatio: '1 / 1', borderRadius: 'var(--radius-lg)', overflow: 'hidden',
                  border: 'none', padding: 0, cursor: 'pointer', backgroundColor: tag.color
                }
              },
                /*#__PURE__*/React.createElement("span", { style: { position: 'absolute', top: '6px', right: '6px', zIndex: 3, minWidth: '24px', height: '24px', padding: '0 6px', borderRadius: '999px', background: 'rgba(15,23,42,0.78)', color: '#fff', fontSize: 'var(--font-size-xs)', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' } }, String(tagPhotos.length)),
                cover
                  ? /*#__PURE__*/React.createElement("img", {
                      src: cover.thumb || cover.full, alt: "", loading: "lazy", decoding: "async",
                      style: { width: '100%', height: '100%', objectFit: 'cover' }
                    })
                  : /*#__PURE__*/React.createElement("div", {
                      style: {
                        width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: getContrastTextColor(tag.color), fontSize: '2.2rem', fontWeight: 800
                      }
                    }, tag.label.slice(0, 1)),
                /*#__PURE__*/React.createElement("div", {
                  style: {
                    position: 'absolute', left: 0, right: 0, bottom: 0, padding: '8px 10px',
                    background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                    display: 'flex', flexDirection: 'column', gap: '1px'
                  }
                },
                  /*#__PURE__*/React.createElement("span", { style: { color: '#fff', fontWeight: 800, fontSize: 'var(--font-size-sm)' } }, tag.label),
                  /*#__PURE__*/React.createElement("span", { style: { color: 'rgba(255,255,255,0.85)', fontSize: 'var(--font-size-2xs)' } }, formatHistoryDate(getTaggedDate(tagPhotos[0])) || '최근 일정')
                )
              );
            })
          )
    )),
    // 인물 상세 페이지: 특정 인물 칸을 눌렀을 때 그 사람으로 태그된 사진만 모아 보여준다.
    historyTab === 'people' && !!selectedPersonTag && /*#__PURE__*/React.createElement("div", {
      className: "history-page-scroll",
      onScroll: handleHistoryScroll,
      style: { flex: 1, minHeight: 0, overflowY: 'auto', overscrollBehavior: 'contain', WebkitOverflowScrolling: 'touch', padding: '118px 16px 16px' }
    }, /*#__PURE__*/React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: '12px' } },
      /*#__PURE__*/React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '8px' } },
        /*#__PURE__*/React.createElement("button", {
          type: "button", onClick: () => setSelectedPersonTag(null), "aria-label": "인물 목록으로",
          style: {
            width: '32px', height: '32px', borderRadius: '50%', border: 'none', background: 'transparent',
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-muted)', flexShrink: 0
          }
        }, BackArrowIcon ? /*#__PURE__*/React.createElement(BackArrowIcon, { size: 20 }) : "←"),
        isEditingPersonTagLabel
          ? /*#__PURE__*/React.createElement(React.Fragment, null,
              /*#__PURE__*/React.createElement("input", {
                type: "text",
                autoFocus: true,
                value: editPersonTagLabelDraft,
                onChange: e => setEditPersonTagLabelDraft(e.target.value),
                onKeyDown: e => {
                  if (e.key === 'Enter') { e.preventDefault(); handleConfirmEditPersonTag(); }
                  if (e.key === 'Escape') { e.preventDefault(); handleCancelEditPersonTag(); }
                },
                style: {
                  flex: 1, minWidth: 0, height: '36px', padding: '0 12px', borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-primary)',
                  color: 'var(--text-main)', fontSize: 'var(--font-size-lg)', fontWeight: 800
                }
              }),
              /*#__PURE__*/React.createElement("button", {
                type: "button", onClick: handleConfirmEditPersonTag,
                disabled: isSavingPersonTagLabel || !editPersonTagLabelDraft.trim(),
                "aria-label": "이름 저장",
                style: {
                  flexShrink: 0, width: '36px', height: '36px', padding: 0, borderRadius: 'var(--radius-md)', border: 'none',
                  backgroundColor: '#111827', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', opacity: (isSavingPersonTagLabel || !editPersonTagLabelDraft.trim()) ? 0.5 : 1
                }
              }, "✓"),
              /*#__PURE__*/React.createElement("button", {
                type: "button", onClick: handleCancelEditPersonTag, disabled: isSavingPersonTagLabel, "aria-label": "취소",
                style: {
                  flexShrink: 0, width: '36px', height: '36px', padding: 0, borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-muted)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                }
              }, "✕")
            )
          : /*#__PURE__*/React.createElement(React.Fragment, null,
              /*#__PURE__*/React.createElement("span", { style: { fontSize: 'var(--font-size-lg)', fontWeight: 800, color: 'var(--text-main)' } }, selectedPersonTag),
              // 참여자 태그(캘린더 참여자 명단에서 온 것)는 여기서 이름을 바꾸거나 지울 수 없다 --
              // 참여자 관리는 캘린더 설정의 몫이고, 이 화면은 사진과 별개로 관리되는 customPersonTags
              // 커스텀 태그만 손댈 수 있어야 한다.
              customPersonTags.includes(selectedPersonTag) && /*#__PURE__*/React.createElement("div", {
                style: { display: 'flex', gap: '6px', marginLeft: 'auto', flexShrink: 0 }
              },
                typeof onRenamePersonTag === 'function' && /*#__PURE__*/React.createElement("button", {
                  type: "button", onClick: handleStartEditPersonTag, "aria-label": "태그 이름 수정",
                  style: {
                    width: '32px', height: '32px', padding: 0, borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-main)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                  }
                }, PencilIcon ? /*#__PURE__*/React.createElement(PencilIcon, { size: 15 }) : "✎"),
                typeof onDeletePersonTag === 'function' && /*#__PURE__*/React.createElement("button", {
                  type: "button", onClick: handleDeletePersonTagClick, "aria-label": "태그 삭제",
                  style: {
                    width: '32px', height: '32px', padding: 0, borderRadius: 'var(--radius-md)',
                    border: '1px solid #EF4444', backgroundColor: 'var(--bg-primary)', color: '#EF4444',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                  }
                }, TrashIcon ? /*#__PURE__*/React.createElement(TrashIcon, { size: 16 }) : "✕")
              )
            )
      ),
      photosForPersonTag.length === 0
        ? /*#__PURE__*/React.createElement("div", { style: { color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)' } }, `#${selectedPersonTag} 태그가 달린 사진이 아직 없어요.`)
        : /*#__PURE__*/React.createElement("div", {
            style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: '4px' }
          }, photosForPersonTag.map((photo, idx) => {
            const identity = getPhotoCommentIdentity(photo, photosForPersonTag, { source: photo.source, meetingDate: photo.meetingDate }) || {};
            const commentCount = getPhotoCommentCount(identity, photoCommentCounts) || Math.max(0, Number(photo.commentCount || 0));
            return /*#__PURE__*/React.createElement("button", {
              key: photo.mediaKey || photo.refKey || `person_${idx}`,
              type: "button",
              onClick: () => openHistoryLightbox(photosForPersonTag, idx),
              style: { position: 'relative', padding: 0, border: 'none', borderRadius: 'var(--radius-sm)', overflow: 'hidden', aspectRatio: '1 / 1', cursor: 'pointer', backgroundColor: 'var(--bg-primary)' }
            },
              /*#__PURE__*/React.createElement("img", {
                src: photo.thumb || photo.full, alt: "", loading: "lazy", decoding: "async",
                style: { width: '100%', height: '100%', objectFit: 'cover' }
              }),
              PhotoCommentCountBadge && /*#__PURE__*/React.createElement(PhotoCommentCountBadge, { count: commentCount })
            );
          })
          )
    )),

    historyLightbox && Lightbox && /*#__PURE__*/React.createElement(Lightbox, {
      urls: historyLightbox.urls,
      index: historyLightbox.index,
      meta: historyLightbox.meta,
      calendar,
      onClose: () => setHistoryLightbox(null),
      onNavigate: i => setHistoryLightbox(prev => prev ? { ...prev, index: i } : prev),
      showToast,
      onPromoteImageUrl,
      onSaveImageTags,
      onSearchTag,
      onDeletePhoto,
      onReplacePhoto,
      onJumpToChatMessage: msgId => { setHistoryLightbox(null); if (typeof onJumpToChatMessage === 'function') onJumpToChatMessage(msgId); },
      onJumpToMemo: memoId => { setHistoryLightbox(null); if (typeof onJumpToMemo === 'function') onJumpToMemo(memoId); },
      onJumpToMeetingDate: (dateStr, tab) => { setHistoryLightbox(null); if (typeof onJumpToMeetingDate === 'function') onJumpToMeetingDate(dateStr, tab); },
      onGetChatMessageOrdinal,
      onGetGalleryPhotoOrdinal,
      onRequestConfirm,
      onRemoveFromMemory: (historyLightbox.memoryId && typeof onRemovePhotoFromMemory === 'function')
        ? (async photoMeta => {
            const memoryId = historyLightbox.memoryId;
            const key = photoMeta?.mediaKey || photoMeta?.refKey;
            const grp = travelMemoryGroups.find(g => g.id === memoryId);
            const ok = await onRemovePhotoFromMemory(memoryId, key);
            // 이 사진이 그룹의 마지막 한 장이었다면 제거 후 그룹 자체가 목록에서 사라진다 --
            // 그대로 두면 상세 화면(뒤로가기 버튼 포함)이 통째로 안 보이는 먹통 상태가 된다.
            if (ok !== false && grp && grp.photos.length <= 1) clearMemoryGroup();
            return ok;
          })
        : null,
      onFetchPhotoComments,
      onSavePhotoComments
    }),

    /*#__PURE__*/React.createElement(SideMenuOverlay, {
      isOpen: isMenuOpen,
      onClose: () => setIsMenuOpen(false),
      homeLabel: "보관함",
      ariaLabel: "보관함 메뉴",
      calendar,
      onGoHome: () => { setIsMenuOpen(false); if (typeof onChangeView === 'function') onChangeView('calendar'); else if (typeof onBack === 'function') onBack(); },
      extraItems: [{
        onClick: () => { setIsMenuOpen(false); setIsSearchOpen(true); },
        icon: SearchIcon ? /*#__PURE__*/React.createElement(SearchIcon, null) : "🔍",
        title: "보관함 검색",
        desc: "지난모임 날짜·참여자·메모·장소 검색"
      }],
      navBlockProps: {
        onClose: () => setIsMenuOpen(false),
        onChangeView: handleHistoryChangeView,
        onOpenCreateSettlement, showSettlement, chatCount, settlementBadge, galleryCount, placeCount, memoCount, historyCount,
        chatLastAuthor, settlementLastDate, galleryLastDate, placeLastName, memoLastTitleWord
      },
      onOpenShare,
      onOpenAppSettings
    })
  );
}

// 컨텐츠: 사이드메뉴 "컨텐츠" 항목이 여는 페이지. 예전 보관함의 지역축제/문화공연 탭 chrome을 그대로
// 이어받아 스포츠 탭을 추가한 것 -- 지역 필터/그리드 밀도 토글/컨텐츠 등록까지 동일하게 유지된다.
export function ContentView({
  calendar, onBack, onChangeView, onOpenAppSettings, onOpenShare = null,
  chatCount = 0, settlementBadge = null, galleryCount = 0, placeCount = 0, memoCount = 0, historyCount = 0,
  chatLastAuthor = null, settlementLastDate = null, galleryLastDate = null, placeLastName = null, memoLastTitleWord = null,
  showSettlement = true, onOpenCreateSettlement,
  anniversaries = [], onRegisterCultureEvent, onUnregisterCultureEvent, onQuickSaveMemo = null,
  memos = [],
  customCultureItems = [], onSaveCustomCultureItem = null, showToast = null
}) {
  const React = window.React;
  const __deps = window.GATHER_UI_DEPS || {};
  const __comp = window.GATHER_UI_COMPONENTS || {};
  const BackArrowIcon = __comp.BackArrowIcon || __deps.BackArrowIcon;
  const ThreeLinesIcon = __comp.ThreeLinesIcon || __deps.ThreeLinesIcon;
  const SearchIcon = __comp.SearchIcon || __deps.SearchIcon;
  const InlineSearchBar = __comp.InlineSearchBar || __deps.InlineSearchBar;
  const LocateFixedIcon = __comp.LocateFixedIcon || __deps.LocateFixedIcon;
  const UnderlineTabs = __comp.UnderlineTabs || __deps.UnderlineTabs;

  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isContentRegisterOpen, setIsContentRegisterOpen] = React.useState(false);
  const [editingContentItem, setEditingContentItem] = React.useState(null);
  const CONTENT_TAB_STORAGE_KEY = 'gather_content_tab';
  const VALID_CONTENT_TABS = ['festival', 'culture', 'sports', 'movies'];
  const [contentTab, setContentTab] = React.useState(() => {
    try {
      const saved = localStorage.getItem(CONTENT_TAB_STORAGE_KEY);
      if (VALID_CONTENT_TABS.includes(saved)) return saved;
    } catch (_) { /* private browsing / disabled storage */ }
    return 'festival';
  });
  const changeContentTab = (tab) => {
    if (!VALID_CONTENT_TABS.includes(tab)) return;
    setContentTab(tab);
    try { localStorage.setItem(CONTENT_TAB_STORAGE_KEY, tab); } catch (_) { /* best-effort */ }
  };
  // 일정 팝업의 기념일 제목 클릭 -> 컨텐츠 페이지 이동 시, app-main.js가 미리 저장해 둔 항목 id.
  // 한 번 소비하면 바로 지워서 이후 컨텐츠 페이지 재방문 때 엉뚱한 항목이 다시 열리지 않게 한다.
  const [focusItemId] = React.useState(() => {
    try { return localStorage.getItem('gather_content_focus_item_id') || null; } catch (_) { return null; }
  });
  // id 매칭 실패에 대비한 안전망(app-main.js의 onFocusCultureSource 참고) -- 크롤링 스냅샷의 id
  // 생성 규칙이 과거에 바뀐 적이 있어, 그 이전에 등록된 기념일은 cultureSourceId가 오늘자
  // 스냅샷/orphan 폴백 어느 쪽과도 더 이상 일치하지 않을 수 있다. 제목이 일치하는 항목을 찾는
  // 마지막 수단으로만 쓰인다(CulturePerformancesTab 참고).
  const [focusTitle] = React.useState(() => {
    try { return localStorage.getItem('gather_content_focus_title') || ''; } catch (_) { return ''; }
  });
  React.useEffect(() => {
    if (!focusItemId) return;
    try {
      localStorage.removeItem('gather_content_focus_item_id');
      localStorage.removeItem('gather_content_focus_title');
    } catch (_) { /* best-effort */ }
  }, [focusItemId]);
  // 컨텐츠 메뉴를 다시 누르면 항상 지역축제 탭부터 보이도록.
  const handleContentChangeView = (view) => {
    if (view === 'content') changeContentTab('festival');
    if (typeof onChangeView === 'function') onChangeView(view);
  };
  const openContentEditor = (item) => {
    if (!item) return;
    setEditingContentItem(item);
    setIsContentRegisterOpen(true);
  };

  // 기념일 등록(AnniversaryModal)으로 직접 만든 festival/event/sports도 각 탭에 보이도록,
  // 문화포털에서 등록된 것(cultureSourceId 있음)은 제외하고 사용자가 직접 만든 것만 카드 형태로 변환.
  const selfAuthoredCultureItems = React.useMemo(() => {
    const kindByCategory = { festival: 'festival', event: 'performance', sports: 'sports', movie: 'movie' };
    return (anniversaries || [])
      .filter(a => a && !a.cultureSourceId && kindByCategory[a.category])
      .map(a => ({
        id: a.id,
        kind: kindByCategory[a.category],
        title: a.title || '',
        // range 타입(dayMode==='range')일 때만 a.startDate/a.endDate가 채워진다. once/yearly
        // 타입(하루짜리 기념일)은 대신 a.date에 저장되므로, 이걸 빼먹으면 정확히 날짜를 입력해도
        // 기간이 항상 비어보인다(-> 컨텐츠 상세 시트에서 "정보없음"으로 표시됨).
        startDate: a.startDate || a.date,
        endDate: a.endDate || a.date,
        dateLabel: formatCultureDateLabel(a.startDate || a.date, a.endDate || a.date),
        venue: a.place ? (a.place.alias || a.place.name || '') : '',
        address: a.place ? (a.place.address || '') : '',
        description: a.description || '',
        releaseDate: a.movieMeta?.releaseDate || a.date,
        director: a.movieMeta?.director || '',
        cast: Array.isArray(a.movieMeta?.cast) ? a.movieMeta.cast : [],
        ageRating: a.movieMeta?.ageRating || '',
        bookingRate: a.movieMeta?.bookingRate || '',
        audienceCount: a.movieMeta?.audienceCount || '',
        isOpenEnded: a.movieMeta?.isOpenEnded !== false,
        // 컨텐츠 페이지 카드 커버 사진 -- 문화포털 자동 등록 항목은 a.image(포털 썸네일 URL)를
        // 쓰지만, AnniversaryModal에서 직접 첨부한 사진은 a.photos 배열(url/thumbUrl)에 저장되어
        // a.image는 항상 비어 있다. a.image가 없을 때는 첫 번째 첨부 사진으로 대체해야
        // 사용자가 직접 올린 사진이 있는데도 "포스터 없음"으로 나오는 걸 막을 수 있다.
        image: a.image || (Array.isArray(a.photos) && a.photos[0] ? (a.photos[0].thumbUrl || a.photos[0].url || '') : '')
      }));
  }, [anniversaries]);

  // Memoized per-kind so each stays reference-stable across renders when its actual contents
  // haven't changed. Building these inline in JSX (as a fresh .filter()/.filter() spread every
  // render) used to hand CulturePerformancesTab a brand-new `extraItems` array identity on every
  // single ContentView render -- and since that tab's onItemsLoaded effect reports its merged
  // list back up via setRegionFilterItems (ContentView's own state) whenever `extraItems`'s
  // *reference* changes, every report caused this exact re-render that just handed it yet another
  // new reference, live-locking the two components into an unthrottled render loop (visible as
  // "Maximum update depth exceeded" and continuous CPU/battery drain with no other visible symptom,
  // which is exactly why it went unnoticed).
  const performanceExtraItems = React.useMemo(
    () => [...selfAuthoredCultureItems.filter(i => getCultureItemKind(i) === 'performance'), ...(customCultureItems || []).filter(i => getCultureItemKind(i) === 'performance')],
    [selfAuthoredCultureItems, customCultureItems]
  );
  const festivalExtraItems = React.useMemo(
    () => [...selfAuthoredCultureItems.filter(i => getCultureItemKind(i) === 'festival'), ...(customCultureItems || []).filter(i => getCultureItemKind(i) === 'festival')],
    [selfAuthoredCultureItems, customCultureItems]
  );
  const sportsExtraItems = React.useMemo(
    () => [...selfAuthoredCultureItems.filter(i => getCultureItemKind(i) === 'sports'), ...(customCultureItems || []).filter(i => getCultureItemKind(i) === 'sports')],
    [selfAuthoredCultureItems, customCultureItems]
  );
  const movieExtraItems = React.useMemo(
    () => [...selfAuthoredCultureItems.filter(i => getCultureItemKind(i) === 'movie'), ...(customCultureItems || []).filter(i => getCultureItemKind(i) === 'movie')],
    [selfAuthoredCultureItems, customCultureItems]
  );

  // Shared 지역 filter for the 지역축제/문화공연/스포츠 tabs. Restored from localStorage so a
  // region picked on a previous visit still applies next time.
  const CULTURE_REGION_STORAGE_KEY = 'gather_culture_region_filter';
  const [regionSelections, setRegionSelections] = React.useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(CULTURE_REGION_STORAGE_KEY) || '{}');
      if (Array.isArray(saved.selections)) return saved.selections.filter(s => s && s.sido);
      if (saved.sido) return [{ sido: saved.sido, gugun: saved.gugun || '' }];
      return [];
    } catch (_) { return []; }
  });
  const [isRegionFilterOpen, setIsRegionFilterOpen] = React.useState(false);
  const persistRegionSelections = (next) => {
    setRegionSelections(next);
    try { localStorage.setItem(CULTURE_REGION_STORAGE_KEY, JSON.stringify({ selections: next })); } catch (_) { /* best-effort */ }
  };
  const addRegionSelection = (sido, gugun) => {
    if (!sido) return;
    const normalizedGugun = gugun || '';
    if (regionSelections.some(s => s.sido === sido && (s.gugun || '') === normalizedGugun)) return;
    persistRegionSelections([...regionSelections, { sido, gugun: normalizedGugun }]);
  };
  const removeRegionSelection = (index) => {
    persistRegionSelections(regionSelections.filter((_, i) => i !== index));
  };
  const resetRegionSelections = () => persistRegionSelections([]);
  const [regionFilterItems, setRegionFilterItems] = React.useState([]);
  const [isLocating, setIsLocating] = React.useState(false);
  const CULTURE_GRID_COLS_STORAGE_KEY = 'gather_culture_grid_cols';
  const [gridCols, setGridCols] = React.useState(() => {
    try {
      const saved = localStorage.getItem(CULTURE_GRID_COLS_STORAGE_KEY);
      return saved === '1' || saved === '2' ? saved : '2';
    } catch (_) { return '2'; }
  });
  const persistGridCols = (next) => {
    setGridCols(next);
    try { localStorage.setItem(CULTURE_GRID_COLS_STORAGE_KEY, next); } catch (_) { /* best-effort */ }
  };
  const handleUseCurrentLocation = () => {
    if (isLocating) return;
    setIsLocating(true);
    resolveCurrentLocationRegion()
      .then(({ sido, gugun }) => addRegionSelection(sido, gugun))
      .catch(err => console.warn('Current-location region lookup failed:', err))
      .finally(() => setIsLocating(false));
  };

  const { isHeaderVisible, onScroll: handleContentScroll } = useScrollHideHeader();
  React.useEffect(() => {
    if (typeof document === 'undefined') return undefined;
    const html = document.documentElement;
    const body = document.body;
    const prevHtml = html.style.overflow;
    const prevBody = body.style.overflow;
    html.style.overflow = 'hidden';
    body.style.overflow = 'hidden';
    return () => {
      html.style.overflow = prevHtml;
      body.style.overflow = prevBody;
    };
  }, []);
  const headerStackRef = React.useRef(null);
  const [headerStackHeight, setHeaderStackHeight] = React.useState(0);
  React.useLayoutEffect(() => {
    const el = headerStackRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(entries => {
      const rect = entries[0] && entries[0].contentRect;
      setHeaderStackHeight(Math.round(rect ? rect.height : el.offsetHeight));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const [chipRowSlot, setChipRowSlot] = React.useState(null);
  const contentPaddingTop = isHeaderVisible
    ? `calc(${headerStackHeight}px + env(safe-area-inset-top, 0px))`
    : `calc(12px + env(safe-area-inset-top, 0px))`;

  return /*#__PURE__*/React.createElement("div", {
    className: "places-view-container",
    style: {
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'var(--bg-primary)',
      display: 'flex', flexDirection: 'column',
      width: '100%', maxWidth: '100%', overflow: 'hidden'
    }
  },
    /*#__PURE__*/React.createElement("div", {
      ref: headerStackRef,
      className: "history-header-stack",
      style: {
        position: 'fixed', top: 'env(safe-area-inset-top, 0px)', left: 0, right: 0, zIndex: 1010,
        backgroundColor: 'var(--bg-primary)',
        transition: 'transform 0.3s ease',
        transform: isHeaderVisible ? 'translateY(0)' : 'translateY(-100%)'
      }
    },
    /*#__PURE__*/React.createElement("div", {
      className: "places-view-header",
      style: {
        position: 'relative', height: '56px',
        backgroundColor: 'var(--bg-card)', borderBottom: '1px solid var(--border-subtle)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 16px', flexShrink: 0
      }
    },
      /*#__PURE__*/React.createElement("button", {
        type: "button", onClick: onBack, "aria-label": "뒤로가기",
        style: {
          width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'transparent', border: 'none',
          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-muted)'
        }
      }, BackArrowIcon ? /*#__PURE__*/React.createElement(BackArrowIcon, { size: 22 }) : "←"),
      /*#__PURE__*/React.createElement("div", {
        style: {
          position: 'absolute', left: '50%', transform: 'translateX(-50%)',
          display: 'flex', alignItems: 'center', fontWeight: 800, fontSize: '0.95rem',
          color: 'var(--text-main)', whiteSpace: 'nowrap', pointerEvents: 'none'
        }
      }, calendar.title, " 컨텐츠"),
      /*#__PURE__*/React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '8px' } },
        /*#__PURE__*/React.createElement("button", {
          type: "button", onClick: () => setIsSearchOpen(v => !v), title: "컨텐츠 검색", "aria-label": "컨텐츠 검색",
          style: { background: 'none', border: 'none', cursor: 'pointer', padding: '6px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }
        }, SearchIcon ? /*#__PURE__*/React.createElement(SearchIcon, null) : "🔍"),
        /*#__PURE__*/React.createElement("button", {
          type: "button", onClick: () => setIsMenuOpen(true), title: "메뉴", "aria-label": "메뉴 열기",
          style: { background: 'none', border: 'none', cursor: 'pointer', padding: '6px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }
        }, ThreeLinesIcon ? /*#__PURE__*/React.createElement(ThreeLinesIcon, { size: 22 }) : "≡")
      )
    ),
    isSearchOpen && InlineSearchBar && /*#__PURE__*/React.createElement(InlineSearchBar, {
      value: searchQuery,
      placeholder: "제목으로 검색...",
      onChange: e => setSearchQuery(e.target.value),
      onClose: () => { setIsSearchOpen(false); setSearchQuery(''); }
    }),
    UnderlineTabs && /*#__PURE__*/React.createElement(UnderlineTabs, {
      ariaLabel: "컨텐츠 탭",
      value: contentTab,
      onChange: changeContentTab,
      options: [
        { value: 'festival', label: '지역축제' },
        { value: 'culture', label: '문화행사' },
        { value: 'sports', label: '스포츠' },
        { value: 'movies', label: '영화' }
      ]
    }),
    /*#__PURE__*/React.createElement("div", {
      className: "region-filter-trigger-row"
    },
      /*#__PURE__*/React.createElement("button", {
        type: "button",
        className: "current-location-btn",
        disabled: isLocating,
        onClick: handleUseCurrentLocation,
        title: "현재 위치",
        "aria-label": "현재 위치"
      },
        LocateFixedIcon && /*#__PURE__*/React.createElement(LocateFixedIcon, { size: 18 })
      ),
      /*#__PURE__*/React.createElement("button", {
        type: "button",
        className: "form-select region-filter-trigger",
        onClick: () => setIsRegionFilterOpen(true)
      },
        /*#__PURE__*/React.createElement("span", { style: { minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, "지역 선택"),
        renderRegionTriggerChevron(React)
      ),
      /*#__PURE__*/React.createElement("div", {
        className: "culture-grid-cols-toggle",
        role: "group",
        "aria-label": "그리드 열 수"
      },
        /*#__PURE__*/React.createElement("button", {
          type: "button",
          className: "culture-grid-cols-btn" + (gridCols === '2' ? " is-active" : ""),
          "aria-label": "2단",
          "aria-pressed": gridCols === '2',
          onClick: () => persistGridCols('2')
        },
          /*#__PURE__*/React.createElement("svg", {
            width: 20, height: 20, viewBox: "0 0 24 24", fill: "none",
            stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round",
            "aria-hidden": "true"
          },
            /*#__PURE__*/React.createElement("path", { d: "M3 4a1 1 0 0 1 1 -1h16a1 1 0 0 1 1 1v16a1 1 0 0 1 -1 1h-16a1 1 0 0 1 -1 -1v-16" }),
            /*#__PURE__*/React.createElement("path", { d: "M12 3v18" })
          )
        ),
        /*#__PURE__*/React.createElement("button", {
          type: "button",
          className: "culture-grid-cols-btn" + (gridCols === '1' ? " is-active" : ""),
          "aria-label": "1단",
          "aria-pressed": gridCols === '1',
          onClick: () => persistGridCols('1')
        },
          /*#__PURE__*/React.createElement("svg", {
            width: 20, height: 20, viewBox: "0 0 24 24", fill: "none",
            stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round",
            "aria-hidden": "true"
          },
            /*#__PURE__*/React.createElement("path", { d: "M5 4a1 1 0 0 1 1 -1h12a1 1 0 0 1 1 1v16a1 1 0 0 1 -1 1h-12a1 1 0 0 1 -1 -1l0 -16" })
          )
        )
      )
    ),
    regionSelections.length > 0 && /*#__PURE__*/React.createElement("div", {
      className: "region-selection-badges-row"
    },
      regionSelections.map((sel, idx) => /*#__PURE__*/React.createElement(RegionSelectionBadge, {
        key: `${sel.sido}::${sel.gugun}`,
        sel,
        onRemove: () => removeRegionSelection(idx)
      })),
      /*#__PURE__*/React.createElement("button", {
        type: "button",
        className: "region-filter-reset-btn",
        onClick: resetRegionSelections
      }, "초기화")
    ),
    /*#__PURE__*/React.createElement("div", { ref: setChipRowSlot })
    ), // end history-header-stack
    /*#__PURE__*/React.createElement(RegionFilterBackdrop, {
      isOpen: isRegionFilterOpen,
      onClose: () => setIsRegionFilterOpen(false),
      selections: regionSelections,
      onAdd: addRegionSelection,
      onRemove: removeRegionSelection,
      onReset: resetRegionSelections,
      items: regionFilterItems
    }),
    contentTab === 'culture' && /*#__PURE__*/React.createElement(CulturePerformancesTab, {
      calendar, anniversaries, memos, onRegisterCultureEvent, onUnregisterCultureEvent, onQuickSaveMemo, dataUrl: CULTURE_PERFORMANCES_URL,
      emptyLabel: "상영중이거나 예정된 문화행사가 없습니다.", regionSelections, onItemsLoaded: setRegionFilterItems,
      anniversaryCategory: "event",
      extraItems: performanceExtraItems,
      chipRowSlot, contentPaddingTop, onScroll: handleContentScroll,
      gridCols, focusItemId, focusTitle, searchQuery, onEditContent: openContentEditor
    }),
    contentTab === 'festival' && /*#__PURE__*/React.createElement(CulturePerformancesTab, {
      calendar, anniversaries, memos, onRegisterCultureEvent, onUnregisterCultureEvent, onQuickSaveMemo, dataUrl: CULTURE_FESTIVALS_URL,
      emptyLabel: "진행중이거나 예정된 지역축제가 없습니다.", regionSelections, onItemsLoaded: setRegionFilterItems,
      anniversaryCategory: "festival",
      extraItems: festivalExtraItems,
      chipRowSlot, contentPaddingTop, onScroll: handleContentScroll,
      gridCols, focusItemId, focusTitle, searchQuery, onEditContent: openContentEditor
    }),
    contentTab === 'sports' && /*#__PURE__*/React.createElement(CulturePerformancesTab, {
      calendar, anniversaries, memos, onRegisterCultureEvent, onUnregisterCultureEvent, onQuickSaveMemo, dataUrl: CULTURE_SPORTS_URL,
      emptyLabel: "진행중이거나 예정된 스포츠 경기가 없습니다.", regionSelections, onItemsLoaded: setRegionFilterItems,
      anniversaryCategory: "sports",
      extraItems: sportsExtraItems,
      chipRowSlot, contentPaddingTop, onScroll: handleContentScroll,
      gridCols, focusItemId, focusTitle, searchQuery, onEditContent: openContentEditor
    }),
    contentTab === 'movies' && /*#__PURE__*/React.createElement(CulturePerformancesTab, {
      calendar, anniversaries, memos, onRegisterCultureEvent, onUnregisterCultureEvent, onQuickSaveMemo, dataUrl: CULTURE_MOVIES_URL,
      emptyLabel: "등록된 영화가 없습니다.", regionSelections, onItemsLoaded: setRegionFilterItems,
      anniversaryCategory: "movie", extraItems: movieExtraItems,
      chipRowSlot, contentPaddingTop, onScroll: handleContentScroll,
      gridCols, focusItemId, focusTitle, searchQuery, onEditContent: openContentEditor
    }),

    /*#__PURE__*/React.createElement(SideMenuOverlay, {
      isOpen: isMenuOpen,
      onClose: () => setIsMenuOpen(false),
      homeLabel: "컨텐츠",
      ariaLabel: "컨텐츠 메뉴",
      calendar,
      onGoHome: () => { setIsMenuOpen(false); if (typeof onChangeView === 'function') onChangeView('calendar'); else if (typeof onBack === 'function') onBack(); },
      extraItems: [{
        onClick: () => { setIsMenuOpen(false); setEditingContentItem(null); setIsContentRegisterOpen(true); },
        icon: /*#__PURE__*/React.createElement("svg", {
          xmlns: "http://www.w3.org/2000/svg", width: "20", height: "20", viewBox: "0 0 24 24",
          fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true"
        },
          /*#__PURE__*/React.createElement("circle", { cx: "12", cy: "12", r: "10" }),
          /*#__PURE__*/React.createElement("path", { d: "M12 8v8" }),
          /*#__PURE__*/React.createElement("path", { d: "M8 12h8" })
        ),
        title: "컨텐츠 등록",
        desc: "문화행사·지역축제·스포츠·영화 직접 등록"
      }],
      navBlockProps: {
        onClose: () => setIsMenuOpen(false),
        onChangeView: handleContentChangeView,
        onOpenCreateSettlement, showSettlement, chatCount, settlementBadge, galleryCount, placeCount, memoCount, historyCount,
        chatLastAuthor, settlementLastDate, galleryLastDate, placeLastName, memoLastTitleWord
      },
      onOpenShare,
      onOpenAppSettings
    }),
    isContentRegisterOpen && /*#__PURE__*/React.createElement(ContentRegisterModal, {
      onClose: () => { setIsContentRegisterOpen(false); setEditingContentItem(null); },
      onSave: onSaveCustomCultureItem,
      showToast: showToast,
      initialItem: editingContentItem,
      initialKind: contentTab === 'festival' ? 'festival' : (contentTab === 'sports' ? 'sports' : (contentTab === 'movies' ? 'movie' : 'performance'))
    }),
  );
}

const CULTURE_DATA_BASE = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.BASE_URL) || '/';
const CULTURE_PERFORMANCES_URL = `${CULTURE_DATA_BASE}data/culture-performances.json`;
const CULTURE_FESTIVALS_URL = `${CULTURE_DATA_BASE}data/culture-festivals.json`;
const CULTURE_SPORTS_URL = `${CULTURE_DATA_BASE}data/culture-sports.json`;
const CULTURE_MOVIES_URL = `${CULTURE_DATA_BASE}data/culture-movies.json`;
const CULTURE_MISSING_LABEL = '정보없음';
// culture-performances.json/culture-festivals.json 항목의 raw `genre` 코드 -> 칩에 보여줄 한글
// 라벨. 매핑에 없는 값(장래에 Culture Flow가 새 장르를 추가하는 경우)은 코드값 그대로 보여준다 --
// 조용히 사라지는 것보다 "알 수 없는 라벨"이 낫다.
const CULTURE_GENRE_LABELS = {
  classic_tradition: '클래식/전통',
  play: '연극',
  musical: '뮤지컬',
  concert: '콘서트',
  exhibition: '전시',
  activity: '체험',
  museum: '박물관',
  baseball: '야구',
  basketball: '농구',
  volleyball: '배구',
  soccer: '축구',
  handball: '핸드볼'
  ,movie: '영화'
};
const cultureGenreLabel = genre => CULTURE_GENRE_LABELS[genre] || genre || '기타';

// 문화공연/지역축제 탭의 지역 필터용 전국 시/도-군/구 목록 (동 단위는 두지 않음). `code`는
// culture-performances.json/culture-festivals.json의 각 항목이 이미 들고 있는 `region` 필드값과
// 그대로 맞춘 것 -- 이 코드로 데이터를 직접 필터링한다. `gugun`은 데이터에 별도 필드가 없어
// item.address의 두 번째 토큰(예: "경기도 부천시 ...")으로 대조하므로, 실제 데이터 유무와 무관하게
// 대한민국 표준 행정구역 전체를 보여준다 (Culture Flow 자체 지역설정 백드롭과 동일한 방식).
const KOREA_REGIONS = [
  { code: 'seoul', label: '서울', gugun: ['종로구', '중구', '용산구', '성동구', '광진구', '동대문구', '중랑구', '성북구', '강북구', '도봉구', '노원구', '은평구', '서대문구', '마포구', '양천구', '강서구', '구로구', '금천구', '영등포구', '동작구', '관악구', '서초구', '강남구', '송파구', '강동구'] },
  { code: 'busan', label: '부산', gugun: ['중구', '서구', '동구', '영도구', '부산진구', '동래구', '남구', '북구', '해운대구', '사하구', '금정구', '강서구', '연제구', '수영구', '사상구', '기장군'] },
  { code: 'daegu', label: '대구', gugun: ['중구', '동구', '서구', '남구', '북구', '수성구', '달서구', '달성군', '군위군'] },
  { code: 'incheon', label: '인천', gugun: ['중구', '동구', '미추홀구', '연수구', '남동구', '부평구', '계양구', '서구', '강화군', '옹진군'] },
  { code: 'gwangju', label: '광주', gugun: ['동구', '서구', '남구', '북구', '광산구'] },
  { code: 'daejeon', label: '대전', gugun: ['동구', '중구', '서구', '유성구', '대덕구'] },
  { code: 'ulsan', label: '울산', gugun: ['중구', '남구', '동구', '북구', '울주군'] },
  { code: 'sejong', label: '세종', gugun: ['세종시'] },
  { code: 'gyeonggi', label: '경기', gugun: ['수원시', '성남시', '의정부시', '안양시', '부천시', '광명시', '평택시', '동두천시', '안산시', '고양시', '과천시', '구리시', '남양주시', '오산시', '시흥시', '군포시', '의왕시', '하남시', '용인시', '파주시', '이천시', '안성시', '김포시', '화성시', '광주시', '양주시', '포천시', '여주시', '연천군', '가평군', '양평군'] },
  { code: 'gangwon', label: '강원', gugun: ['춘천시', '원주시', '강릉시', '동해시', '태백시', '속초시', '삼척시', '홍천군', '횡성군', '영월군', '평창군', '정선군', '철원군', '화천군', '양구군', '인제군', '고성군', '양양군'] },
  { code: 'chungbuk', label: '충북', gugun: ['청주시', '충주시', '제천시', '보은군', '옥천군', '영동군', '증평군', '진천군', '괴산군', '음성군', '단양군'] },
  { code: 'chungnam', label: '충남', gugun: ['천안시', '공주시', '보령시', '아산시', '서산시', '논산시', '계룡시', '당진시', '금산군', '부여군', '서천군', '청양군', '홍성군', '예산군', '태안군'] },
  { code: 'jeonbuk', label: '전북', gugun: ['전주시', '군산시', '익산시', '정읍시', '남원시', '김제시', '완주군', '진안군', '무주군', '장수군', '임실군', '순창군', '고창군', '부안군'] },
  { code: 'jeonnam', label: '전남', gugun: ['목포시', '여수시', '순천시', '나주시', '광양시', '담양군', '곡성군', '구례군', '고흥군', '보성군', '화순군', '장흥군', '강진군', '해남군', '영암군', '무안군', '함평군', '영광군', '장성군', '완도군', '진도군', '신안군'] },
  { code: 'gyeongbuk', label: '경북', gugun: ['포항시', '경주시', '김천시', '안동시', '구미시', '영주시', '영천시', '상주시', '문경시', '경산시', '의성군', '청송군', '영양군', '영덕군', '청도군', '고령군', '성주군', '칠곡군', '예천군', '봉화군', '울진군', '울릉군'] },
  { code: 'gyeongnam', label: '경남', gugun: ['창원시', '진주시', '통영시', '사천시', '김해시', '밀양시', '거제시', '양산시', '의령군', '함안군', '창녕군', '고성군', '남해군', '하동군', '산청군', '함양군', '거창군', '합천군'] },
  { code: 'jeju', label: '제주', gugun: ['제주시', '서귀포시'] }
];
// Flat (region, gugun) lookup used by the search field below to resolve a typed district name
// (e.g. "부천") straight to its parent 시/도 -- built once at module load since KOREA_REGIONS
// never changes at runtime.
const KOREA_REGION_GUGUN_INDEX = KOREA_REGIONS.flatMap(region =>
  region.gugun.map(gugun => ({ code: region.code, label: region.label, gugun }))
);

// item.region already matches a KOREA_REGIONS code 1:1. There's no separate 군/구 field in the
// culture snapshot, so this reads it off the second space-separated token of the item's own
// address string (Korean addresses always lead with "시/도 시/군/구 ..."). Shared by the grid's
// own region filter and the region-count badges in RegionFilterBackdrop below so both agree on
// exactly the same district for a given item.
function getCultureItemDistrict(item) {
  const tokens = String(item?.address || item?.venue || '').trim().split(/\s+/);
  return tokens[1] || '';
}

// Shared by both the page-level "현재 위치" trigger and RegionFilterBackdrop's own GPS icon
// button -- resolves the browser's geolocation position to a { sido, gugun } pair via the same
// reverse-geocode + address-normalize path both call sites need, so that logic lives in one place.
function resolveCurrentLocationRegion() {
  return new Promise((resolve, reject) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      reject(new Error('geolocation unavailable'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=jsonv2&accept-language=ko&zoom=14`);
          const data = await res.json();
          const normalized = normalizeDomesticKoreanAddress(data?.display_name || '') || '';
          const tokens = normalized.trim().split(/\s+/);
          const matchedRegion = KOREA_REGIONS.find(r => r.label === tokens[0]);
          if (!matchedRegion) { reject(new Error('no matching region')); return; }
          const matchedGugun = matchedRegion.gugun.includes(tokens[1]) ? tokens[1] : '';
          resolve({ sido: matchedRegion.code, gugun: matchedGugun });
        } catch (err) {
          reject(err);
        }
      },
      (err) => reject(err),
      { timeout: 10000 }
    );
  });
}

// One capsule badge for a saved region selection ("서울 광진구 (x)") -- rendered both below the
// 지역 선택 trigger row on the page itself and inside RegionFilterBackdrop's own body, both
// driven by the same regionSelections array so the two stay in sync.
function RegionSelectionBadge({ sel, onRemove }) {
  const React = window.React;
  const __comp = window.GATHER_UI_COMPONENTS || {};
  const __deps = window.GATHER_UI_DEPS || {};
  const TrashIcon = __comp.TrashIcon || __deps.TrashIcon;
  const label = `${KOREA_REGIONS.find(r => r.code === sel.sido)?.label || sel.sido}${sel.gugun ? ' ' + sel.gugun : ''}`;
  return /*#__PURE__*/React.createElement("span", { className: "region-selection-badge" },
    label,
    /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "region-selection-badge-remove",
      "aria-label": `${label} 필터 해제`,
      onClick: onRemove
    }, TrashIcon ? /*#__PURE__*/React.createElement(TrashIcon, { size: 11 }) : "✕")
  );
}

// Region-select backdrop opened by the single 지역 선택 trigger below the 보관함 tabs
// (Culture Flow's own region picker, referenced by the product ask, is the model: a search field
// on top auto-resolving a typed district straight to its province, plus every province's full
// district list laid out as tap targets rather than a plain dropdown). Multi-select: choosing a
// 시/도 then a 군/구 (or "전체") only highlights a *draft* pick -- nothing is applied until "지역
// 저장" is pressed, which adds it to `selections` (via onAdd) without closing the sheet, so
// several regions can be added in one sitting (e.g. 서울 광진구 저장, then 인천 연수구 저장).
export function RegionFilterBackdrop({ isOpen, onClose, selections = [], onAdd, onRemove, onReset, items = [] }) {
  const React = window.React;
  const ReactDOM = window.ReactDOM;
  const __comp = window.GATHER_UI_COMPONENTS || {};
  const __deps = window.GATHER_UI_DEPS || {};
  const LocateFixedIcon = __comp.LocateFixedIcon || __deps.LocateFixedIcon;
  const [query, setQuery] = React.useState('');
  const [expandedSido, setExpandedSido] = React.useState('');
  const [draftGugun, setDraftGugun] = React.useState('');
  const [isLocating, setIsLocating] = React.useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setExpandedSido('');
      setDraftGugun('');
      setQuery('');
    }
  }, [isOpen]);

  // Typing a district name (partial match, e.g. "부천" -> "부천시") jumps straight to that
  // province's chip list with the district pre-highlighted as the draft pick -- the user still
  // taps "지역 저장" to actually add it.
  React.useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) return;
    const match = KOREA_REGION_GUGUN_INDEX.find(entry => entry.gugun.includes(trimmed));
    if (match) {
      setExpandedSido(match.code);
      setDraftGugun(match.gugun);
    }
  }, [query]);

  if (!isOpen) return null;

  const activeRegion = KOREA_REGIONS.find(r => r.code === expandedSido);

  // Per-region/per-군구 counts shown as badges next to each chip label, computed off the
  // currently active tab's full (unfiltered) item snapshot passed down from HistoryView.
  const regionCounts = {};
  const gugunCounts = {};
  items.forEach(item => {
    regionCounts[item.region] = (regionCounts[item.region] || 0) + 1;
    if (activeRegion && item.region === activeRegion.code) {
      const district = getCultureItemDistrict(item);
      if (district) gugunCounts[district] = (gugunCounts[district] || 0) + 1;
    }
  });

  const handleLocate = () => {
    if (isLocating) return;
    setIsLocating(true);
    resolveCurrentLocationRegion()
      .then(({ sido, gugun }) => { setExpandedSido(sido); setDraftGugun(gugun); setQuery(''); })
      .catch(err => console.warn('Current-location region lookup failed:', err))
      .finally(() => setIsLocating(false));
  };

  const handleSave = () => {
    if (!expandedSido || typeof onAdd !== 'function') return;
    onAdd(expandedSido, draftGugun);
    setExpandedSido('');
    setDraftGugun('');
    setQuery('');
  };

  const sheet = /*#__PURE__*/React.createElement("div", {
    className: "bottom-sheet-overlay",
    onClick: e => { e.stopPropagation(); onClose(); }
  }, /*#__PURE__*/React.createElement("div", {
    className: "bottom-sheet region-filter-sheet",
    onClick: e => e.stopPropagation()
  },
    /*#__PURE__*/React.createElement("div", { className: "bottom-sheet-header" },
      /*#__PURE__*/React.createElement("h4", null, "지역 설정"),
      /*#__PURE__*/React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '10px' } },
        selections.length > 0 && /*#__PURE__*/React.createElement("button", {
          type: "button",
          className: "region-filter-reset-btn",
          onClick: () => { setExpandedSido(''); setDraftGugun(''); setQuery(''); onReset && onReset(); }
        }, "초기화"),
        /*#__PURE__*/React.createElement("button", {
          type: "button",
          style: { background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.2rem', cursor: 'pointer' },
          onClick: onClose
        }, "✕")
      )
    ),
    /*#__PURE__*/React.createElement("div", { className: "bottom-sheet-body region-filter-body" },
      /*#__PURE__*/React.createElement("div", { className: "region-filter-search-row" },
        /*#__PURE__*/React.createElement("input", {
          type: "text",
          className: "form-input",
          placeholder: "지역명으로 검색 (예: 부천)",
          value: query,
          onChange: e => setQuery(e.target.value),
          autoFocus: true
        }),
        /*#__PURE__*/React.createElement("button", {
          type: "button",
          className: "region-filter-locate-btn",
          disabled: isLocating,
          onClick: handleLocate,
          title: "현재 위치로 검색",
          "aria-label": "현재 위치로 검색"
        }, LocateFixedIcon ? /*#__PURE__*/React.createElement(LocateFixedIcon, { size: 18 }) : "GPS")
      ),
      selections.length > 0 && /*#__PURE__*/React.createElement("div", { className: "region-selection-badges" },
        selections.map((sel, idx) => /*#__PURE__*/React.createElement(RegionSelectionBadge, {
          key: `${sel.sido}::${sel.gugun}`,
          sel,
          onRemove: () => onRemove && onRemove(idx)
        }))
      ),
      /*#__PURE__*/React.createElement("div", { className: "region-filter-section-label" }, "시/도"),
      /*#__PURE__*/React.createElement("div", { className: "region-filter-chip-group" },
        KOREA_REGIONS.map(r => /*#__PURE__*/React.createElement("button", {
          key: r.code,
          type: "button",
          className: `region-filter-chip${r.code === expandedSido ? ' is-active' : ''}`,
          onClick: () => { setQuery(''); setExpandedSido(r.code); setDraftGugun(''); }
        }, r.label, /*#__PURE__*/React.createElement("span", { className: "region-filter-chip-count" }, regionCounts[r.code] || 0)))
      ),
      activeRegion && /*#__PURE__*/React.createElement(React.Fragment, null,
        /*#__PURE__*/React.createElement("div", { className: "region-filter-section-label" }, "군/구"),
        /*#__PURE__*/React.createElement("div", { className: "region-filter-chip-group" },
          /*#__PURE__*/React.createElement("button", {
            type: "button",
            className: `region-filter-chip${!draftGugun ? ' is-active' : ''}`,
            onClick: () => setDraftGugun('')
          }, "전체", /*#__PURE__*/React.createElement("span", { className: "region-filter-chip-count" }, regionCounts[activeRegion.code] || 0)),
          activeRegion.gugun.map(g => /*#__PURE__*/React.createElement("button", {
            key: g,
            type: "button",
            className: `region-filter-chip${g === draftGugun ? ' is-active' : ''}`,
            onClick: () => setDraftGugun(g)
          }, g, /*#__PURE__*/React.createElement("span", { className: "region-filter-chip-count" }, gugunCounts[g] || 0)))
        )
      )
    ),
    /*#__PURE__*/React.createElement("div", { className: "bottom-sheet-footer" },
      /*#__PURE__*/React.createElement("button", {
        type: "button",
        className: "region-filter-save-btn",
        disabled: !expandedSido,
        onClick: handleSave
      }, "지역 저장")
    )
  ));
  return typeof document !== 'undefined' && ReactDOM.createPortal ? ReactDOM.createPortal(sheet, document.body) : sheet;
}

function formatCultureDateLabel(startDate, endDate) {
  const fmt = (s) => {
    const normalized = normalizeDateString(s);
    return normalized ? formatDateWithDayName(normalized) : '';
  };
  const a = fmt(startDate);
  const b = fmt(endDate || startDate);
  if (!a) return '';
  return a === b ? a : `${a} ~ ${b}`;
}

// Older individually registered cards were written with `category` (or no kind at all)
// before customCultureItems gained a strict kind field. Normalize at the rendering boundary too,
// so one legacy document can never be silently filtered out of its festival/performance tab.
function getCultureItemKind(item) {
  if (!item) return '';
  if (item.kind) return item.kind;
  const byCategory = { festival: 'festival', event: 'performance', performance: 'performance', sports: 'sports', movie: 'movie' };
  return byCategory[item.category] || byCategory[item.anniversaryCategory] || (item.genre === 'movie' ? 'movie' : '');
}

function todayIsoLocal() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}


// Pull the first http(s) URL out of free text. Custom festival cards often store the homepage
// only in description, so link/website are empty while a blue URL still shows in the sheet.
function extractFirstHttpUrl(text) {
  const match = String(text || '').match(/https?:\/\/[^\s)\]}>"',]+/i);
  if (!match) return '';
  return match[0].replace(/[).,!?"'\u201d\u2019]+$/u, '');
}
function resolveCultureDetailUrl(item) {
  const structured = String(item?.link || item?.website || item?.url || '').trim();
  if (structured) return structured;
  return extractFirstHttpUrl(item?.description) || extractFirstHttpUrl(item?.contact) || '';
}

function cultureItemDay(item) {
  const value = item?.releaseDate || item?.startDate;
  return /^\d{4}-\d{2}-\d{2}$/.test(String(value || '')) ? String(value) : '';
}

function cultureItemEndDay(item) {
  const end = item?.endDate || item?.releaseDate || item?.startDate;
  return /^\d{4}-\d{2}-\d{2}$/.test(String(end || '')) ? String(end) : cultureItemDay(item);
}

function filterAndSortCultureItems(items, category) {
  // festival / event(문화행사) / sports: 목록에서는 종료일이 지난 항목을 모두 숨긴다
  // (포털·개별등록·캘린더 연동 orphan 동일). 데이터 자체는 지우지 않는다 -- 개별등록/연동은
  // Firestore·cultureSnapshot에 남아 일정 뱃지→백드롭 deep-link(mergedItems focus)로 열린다.
  // 서비스 JSON 풀의 비연동 항목은 sync가 종료+30일 뒤 스냅샷에서 정리한다.
  // movie: 개봉일이 오늘 이전인데 상영중이 아닌 항목만 숨긴다 (예정·상영중은 유지).
  if (category !== 'festival' && category !== 'event' && category !== 'sports' && category !== 'movie') {
    return items;
  }
  const today = todayIsoLocal();
  const visible = items.filter(item => {
    if (category === 'movie') {
      const day = cultureItemDay(item);
      if (!day) return true;
      if (day >= today) return true; // 예정(오늘 포함)
      // 개봉일 지남: 상영중 배지와 동일 조건(종료일 없거나 오늘 이상)만 유지
      return !item.endDate || item.endDate >= today;
    }
    const end = cultureItemEndDay(item);
    if (!end) return true;
    return end >= today;
  });
  if (category === 'festival' || category === 'event') return visible;
  return visible.sort((a, b) => {
    const aDay = cultureItemDay(a), bDay = cultureItemDay(b);
    if (!aDay || !bDay) return aDay ? -1 : (bDay ? 1 : 0);
    return Math.abs(Date.parse(`${aDay}T00:00:00`) - Date.parse(`${today}T00:00:00`))
      - Math.abs(Date.parse(`${bDay}T00:00:00`) - Date.parse(`${today}T00:00:00`));
  });
}

// 컨텐츠 상세의 "공유" 버튼/컨텐츠 등록의 "붙여넣기"가 쓰는 인코더/파서 -- 사진 공유와 같은
// 원칙으로, 카드의 모든 필드(포스터~설명)를 URL 프래그먼트에 실어 보낸다. 복사 시점의 데이터를
// 그대로 복제하는 개념이라, 공유한 뒤 원본을 수정/삭제해도 이미 붙여넣은 쪽에는 영향이 없다.
const GATHER_CONTENT_FRAGMENT_PREFIX = '#gatherContent=';
const GATHER_CONTENT_FIELDS = [
  'id', 'kind', 'title', 'startDate', 'endDate', 'dateLabel', 'venue', 'address', 'link',
  'description', 'image', 'price', 'contact', 'director', 'cast', 'ageRating', 'audienceCount',
  'bookingRate', 'isOpenEnded', 'genre'
];
function encodeGatherContentFragment(item) {
  try {
    const picked = {};
    GATHER_CONTENT_FIELDS.forEach(f => {
      const v = item && item[f];
      if (v !== undefined && v !== null && v !== '') picked[f] = v;
    });
    if (!picked.title) return '';
    const payload = { v: 1, kind: 'gather-content', item: picked };
    const json = JSON.stringify(payload);
    const b64 = typeof btoa === 'function' ? btoa(unescape(encodeURIComponent(json))) : '';
    return b64 ? GATHER_CONTENT_FRAGMENT_PREFIX + b64 : '';
  } catch (_) {
    return '';
  }
}
function parseGatherContentClipboardText(text) {
  const raw = String(text || '').trim();
  if (!/^https?:\/\//i.test(raw)) return null;
  const markerIndex = raw.indexOf(GATHER_CONTENT_FRAGMENT_PREFIX);
  if (markerIndex === -1) return null;
  const b64 = raw.slice(markerIndex + GATHER_CONTENT_FRAGMENT_PREFIX.length);
  try {
    const json = decodeURIComponent(escape(atob(b64)));
    const payload = JSON.parse(json);
    if (!payload || payload.kind !== 'gather-content' || !payload.item || !payload.item.title) return null;
    return payload.item;
  } catch (_) {
    return null;
  }
}

// Layer popup for manually registering 문화공연 / 지역축제 items into the archive tabs.
// Portaled to document.body (same pattern as CulturePerformancesTab's detail sheet) so it sits
// above the side menu / page chrome. Persists via onSave → app-main customCultureItems write.
function ContentRegisterModal({ onClose, onSave, showToast = null, initialKind = 'performance', initialItem = null }) {
  const React = window.React;
  const ReactDOM = window.ReactDOM;
  const __deps = window.GATHER_UI_DEPS || {};
  const __comp = window.GATHER_UI_COMPONENTS || {};
  const SmallXIcon = __comp.SmallXIcon || __deps.SmallXIcon;
  const UnderlineTabs = __comp.UnderlineTabs || __deps.UnderlineTabs;
  const AutoGrowTextarea = __comp.AutoGrowTextarea || __deps.AutoGrowTextarea;
  const autoGrowTextarea = __deps.autoGrowTextarea || (window.GATHER_APP_UTILS || {}).autoGrowTextarea || (() => {});

  // 'performance' | 'festival' | 'sports' -- defaults to whichever 컨텐츠 탭 the user opened this
  // from (initialKind), instead of always 'performance', so registering while already on 지역축제
  // or 스포츠 doesn't silently save into 문화행사 unless the user notices and switches this tab.
  const [kind, setKind] = React.useState(['festival', 'sports', 'movie'].includes(initialKind) ? initialKind : 'performance');
  const [title, setTitle] = React.useState('');
  const [startDate, setStartDate] = React.useState('');
  const [endDate, setEndDate] = React.useState('');
  const [venue, setVenue] = React.useState('');
  const [address, setAddress] = React.useState('');
  const [link, setLink] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [image, setImage] = React.useState('');
  const [price, setPrice] = React.useState('');
  const [contact, setContact] = React.useState('');
  const [director, setDirector] = React.useState('');
  const [cast, setCast] = React.useState('');
  const [rating, setRating] = React.useState('');
  const [audience, setAudience] = React.useState('');
  const [bookingRate, setBookingRate] = React.useState('');
  const [saving, setSaving] = React.useState(false);
  React.useEffect(() => {
    if (!initialItem) return;
    const nextKind = initialItem.kind || (initialItem.genre === 'movie' ? 'movie' : initialItem.kind) || initialKind;
    setKind(['festival', 'sports', 'movie'].includes(nextKind) ? nextKind : 'performance');
    setTitle(initialItem.title || ''); setStartDate(initialItem.releaseDate || initialItem.startDate || '');
    setEndDate(initialItem.endDate || ''); setVenue(initialItem.venue || ''); setAddress(initialItem.address || '');
    setLink(initialItem.link || ''); setDescription(initialItem.description || ''); setImage(initialItem.image || '');
    setPrice(initialItem.price || ''); setContact(initialItem.contact || ''); setDirector(initialItem.director || '');
    setCast(Array.isArray(initialItem.cast) ? initialItem.cast.join(', ') : (initialItem.cast || ''));
    setRating(initialItem.ageRating || ''); setAudience(initialItem.audienceCount || ''); setBookingRate(initialItem.bookingRate || '');
  }, [initialItem, initialKind]);

  // 다른 캘린더의 컨텐츠 상세 "공유" 버튼으로 복사한 URL을 붙여넣으면, 그 카드의 모든 필드를
  // 이 폼에 그대로 채워 넣는다 -- 등록 자체는 여느 등록과 동일하게 사용자가 내용을 확인하고
  // 아래 "등록" 버튼을 눌러야 저장되므로, 붙여넣기 한 번으로 검토 없이 바로 써지지 않는다.
  const applyPastedContent = (item) => {
    if (!item) return false;
    setKind(['festival', 'sports', 'movie'].includes(item.kind) ? item.kind : 'performance');
    setTitle(item.title || '');
    setStartDate(item.startDate || '');
    setEndDate(item.endDate || '');
    setVenue(item.venue || '');
    setAddress(item.address || '');
    setLink(item.link || '');
    setDescription(item.description || '');
    setImage(item.image || '');
    setPrice(item.price || '');
    setContact(item.contact || '');
    setDirector(item.director || '');
    setCast(Array.isArray(item.cast) ? item.cast.join(', ') : (item.cast || ''));
    setRating(item.ageRating || '');
    setAudience(item.audienceCount || '');
    setBookingRate(item.bookingRate || '');
    return true;
  };
  const handlePasteContentClick = async () => {
    let text = '';
    try { text = await navigator.clipboard.readText(); } catch (_) { /* not granted/available */ }
    const item = parseGatherContentClipboardText(text);
    if (!item) {
      if (typeof showToast === 'function') showToast('클립보드에 공유된 컨텐츠가 없습니다.', 'error');
      return;
    }
    applyPastedContent(item);
    if (typeof showToast === 'function') showToast('컨텐츠 정보를 붙여넣었습니다. 확인 후 등록해 주세요.', 'success');
  };
  React.useEffect(() => {
    const handlePaste = e => {
      const text = e.clipboardData ? e.clipboardData.getData('text/plain') : '';
      const item = parseGatherContentClipboardText(text);
      if (!item) return;
      e.preventDefault();
      applyPastedContent(item);
      if (typeof showToast === 'function') showToast('컨텐츠 정보를 붙여넣었습니다. 확인 후 등록해 주세요.', 'success');
    };
    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, []);

  const handleSave = async () => {
    const cleanTitle = (title || '').trim();
    const cleanStart = normalizeDateString((startDate || '').trim());
    if (!cleanTitle) {
      if (typeof showToast === 'function') showToast('제목을 입력해 주세요.', 'error');
      return;
    }
    if (!cleanStart || !/^\d{4}-\d{2}-\d{2}$/.test(cleanStart)) {
      if (typeof showToast === 'function') showToast('시작일을 2026.04.17 또는 2026-04-17 형식으로 입력해 주세요.', 'error');
      return;
    }
    const cleanEnd = kind === 'movie' ? normalizeDateString((endDate || '').trim()) : (normalizeDateString((endDate || '').trim()) || cleanStart);
    if ((endDate || '').trim() && !cleanEnd) {
      if (typeof showToast === 'function') showToast('종료일을 2026.04.17 또는 2026-04-17 형식으로 입력해 주세요.', 'error');
      return;
    }
    if (typeof onSave !== 'function') {
      if (typeof showToast === 'function') showToast('저장 기능을 사용할 수 없습니다.', 'error');
      return;
    }
    const stamp = Date.now();
    const idPrefixByKind = { festival: 'custom_fest_', sports: 'custom_sport_', movie: 'custom_movie_' };
    const prefix = idPrefixByKind[kind] || 'custom_perf_';
    const id = initialItem?.id || (prefix + stamp + '_' + Math.random().toString(36).slice(2, 8));
    const normalizedKind = ['festival', 'sports', 'movie'].includes(kind) ? kind : 'performance';
    const item = {
      ...(initialItem || {}),
      id,
      title: cleanTitle,
      startDate: cleanStart,
      endDate: cleanEnd,
      dateLabel: formatCultureDateLabel(cleanStart, cleanEnd),
      venue: (venue || '').trim(),
      address: (address || '').trim(),
      link: (link || '').trim(),
      description: (description || '').trim(),
      image: (image || '').trim(),
      price: (price || '').trim(),
      contact: (contact || '').trim(),
      source: initialItem?.source || 'custom',
      kind: normalizedKind,
      createdAt: initialItem?.createdAt || stamp,
      updatedAt: stamp
    };
    if (normalizedKind === 'movie') Object.assign(item, {
      genre: 'movie', releaseDate: cleanStart, endDate: cleanEnd || null,
      director: (director || '').trim(), cast: (cast || '').split(',').map(s => s.trim()).filter(Boolean),
      ageRating: (rating || '').trim(), audienceCount: (audience || '').trim(), bookingRate: (bookingRate || '').trim(),
      isOpenEnded: !cleanEnd
    });
    // Drop empty optional strings so Firestore never sees unnecessary keys (and to keep card
    // rendering identical to crawled items that omit missing fields).
    Object.keys(item).forEach(k => {
      if (item[k] === '' || item[k] == null) delete item[k];
    });
    // Re-assert required fields after the empty-key sweep.
    item.id = id;
    item.title = cleanTitle;
    item.startDate = cleanStart;
    item.endDate = cleanEnd;
    item.source = initialItem?.source || 'custom';
    item.kind = normalizedKind;
    item.createdAt = initialItem?.createdAt || stamp;
    item.updatedAt = stamp;
    if (!item.dateLabel) item.dateLabel = formatCultureDateLabel(cleanStart, cleanEnd);

    setSaving(true);
    try {
      const ok = await onSave(item);
      if (ok) onClose && onClose();
    } finally {
      setSaving(false);
    }
  };

  const field = (label, el, extraStyle = null) => /*#__PURE__*/React.createElement("label", {
    style: Object.assign({ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: 'var(--font-size-sm)', fontWeight: 700, color: 'var(--text-main)' }, extraStyle || {})
  }, label, el);

  if (typeof document === 'undefined' || !ReactDOM) return null;
  return ReactDOM.createPortal(
    /*#__PURE__*/React.createElement("div", {
      onClick: () => !saving && onClose && onClose(),
      style: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.55)', zIndex: 14000, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }
    },
      /*#__PURE__*/React.createElement("div", {
        onClick: e => e.stopPropagation(),
        role: "dialog",
        "aria-label": "컨텐츠 등록",
        style: {
          width: '100%', maxWidth: '480px', maxHeight: '90vh', overflowY: 'auto',
          backgroundColor: 'var(--bg-card)', borderRadius: '16px 16px 0 0', padding: '16px 16px 20px',
          display: 'flex', flexDirection: 'column', gap: '12px', boxSizing: 'border-box'
        }
      },
        /*#__PURE__*/React.createElement("div", { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' } },
          /*#__PURE__*/React.createElement("div", { style: { fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)' } }, initialItem ? "컨텐츠 수정" : "컨텐츠 등록"),
          /*#__PURE__*/React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '4px' } },
            !initialItem && /*#__PURE__*/React.createElement("button", {
              type: "button", onClick: handlePasteContentClick, disabled: saving,
              style: {
                height: '30px', padding: '0 10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)',
                backgroundColor: 'var(--bg-primary)', color: 'var(--text-main)', fontSize: 'var(--font-size-sm)', fontWeight: 700,
                cursor: saving ? 'default' : 'pointer'
              }
            }, "붙여넣기"),
            /*#__PURE__*/React.createElement("button", {
              type: "button", onClick: () => !saving && onClose && onClose(), "aria-label": "닫기",
              style: { background: 'none', border: 'none', cursor: 'pointer', padding: '6px', color: 'var(--text-muted)', display: 'flex' }
            }, SmallXIcon ? /*#__PURE__*/React.createElement(SmallXIcon, { size: 20 }) : "✕")
          )
        ),
        UnderlineTabs && /*#__PURE__*/React.createElement(UnderlineTabs, {
          ariaLabel: "컨텐츠 종류",
          value: kind,
          onChange: v => setKind(v),
          style: { backgroundColor: 'var(--bg-card)', borderBottom: '1px solid var(--border-subtle)' },
          options: [
            { value: 'performance', label: '문화공연' },
            { value: 'festival', label: '지역축제' },
            { value: 'sports', label: '스포츠' },
            { value: 'movie', label: '영화' }
          ]
        }),
        field("제목 *", /*#__PURE__*/React.createElement("input", {
          className: "form-input", type: "text", value: title, onChange: e => setTitle(e.target.value),
          placeholder: kind === 'festival' ? "축제 이름" : (kind === 'sports' ? "경기/대회 이름" : (kind === 'movie' ? "영화 제목" : "공연 제목")), maxLength: 120
        })),
        /*#__PURE__*/React.createElement("div", { style: { display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: '10px', width: '100%' } },
          field("시작일 *", /*#__PURE__*/React.createElement("input", {
            className: "form-input", type: "date", value: startDate, onChange: e => setStartDate(e.target.value),
            style: { width: '100%', maxWidth: '100%', minWidth: 0, boxSizing: 'border-box' }
          }), { minWidth: 0, maxWidth: '100%', overflow: 'hidden' }),
          field(kind === 'movie' ? "상영종료일 (선택)" : "종료일", /*#__PURE__*/React.createElement("input", {
            className: "form-input", type: "date", value: endDate, onChange: e => setEndDate(e.target.value),
            style: { width: '100%', maxWidth: '100%', minWidth: 0, boxSizing: 'border-box' }
          }), { minWidth: 0, maxWidth: '100%', overflow: 'hidden' })
        ),
        kind !== 'movie' && field(kind === 'festival' ? "장소" : (kind === 'sports' ? "경기장" : "공연장"), /*#__PURE__*/React.createElement("input", {
          className: "form-input", type: "text", value: venue, onChange: e => setVenue(e.target.value),
          placeholder: "장소 / 공연장", maxLength: 120
        })),
        field("주소", /*#__PURE__*/React.createElement("input", {
          className: "form-input", type: "text", value: address, onChange: e => setAddress(e.target.value),
          placeholder: "주소", maxLength: 200
        })),
        field("링크 / URL", /*#__PURE__*/React.createElement("input", {
          className: "form-input", type: "url", value: link, onChange: e => setLink(e.target.value),
          placeholder: "https://", maxLength: 500
        })),
        field("이미지 URL (선택)", /*#__PURE__*/React.createElement("input", {
          className: "form-input", type: "url", value: image, onChange: e => setImage(e.target.value),
          placeholder: "https://", maxLength: 500
        })),
        /*#__PURE__*/React.createElement("div", { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' } },
          field("가격 / 요금", /*#__PURE__*/React.createElement("input", {
            className: "form-input", type: "text", value: price, onChange: e => setPrice(e.target.value),
            placeholder: "예: 무료 / 20,000원", maxLength: 80
          })),
          field("문의", /*#__PURE__*/React.createElement("input", {
            className: "form-input", type: "text", value: contact, onChange: e => setContact(e.target.value),
            placeholder: "연락처 / 문의처", maxLength: 120
          }))
        ),
        kind === 'movie' && /*#__PURE__*/React.createElement(React.Fragment, null,
          field("감독", /*#__PURE__*/React.createElement("input", { className: "form-input", value: director, onChange: e => setDirector(e.target.value), placeholder: "감독", maxLength: 120 })),
          field("출연 (쉼표로 구분)", /*#__PURE__*/React.createElement("input", { className: "form-input", value: cast, onChange: e => setCast(e.target.value), placeholder: "배우1, 배우2", maxLength: 500 })),
          /*#__PURE__*/React.createElement("div", { style: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' } },
            field("관람등급", /*#__PURE__*/React.createElement("input", { className: "form-input", value: rating, onChange: e => setRating(e.target.value), placeholder: "전체" })),
            field("예매율", /*#__PURE__*/React.createElement("input", { className: "form-input", value: bookingRate, onChange: e => setBookingRate(e.target.value), placeholder: "%" })),
            field("관객수", /*#__PURE__*/React.createElement("input", { className: "form-input", value: audience, onChange: e => setAudience(e.target.value), placeholder: "명" }))
          )
        ),
        field("설명", AutoGrowTextarea
          ? /*#__PURE__*/React.createElement(AutoGrowTextarea, {
              className: "form-input",
              value: description,
              onChange: e => setDescription(e.target.value),
              placeholder: "간단한 설명",
              rows: 3,
              maxLength: 2000,
              minHeight: 72,
              maxHeight: 240,
              style: { width: '100%' }
            })
          : /*#__PURE__*/React.createElement("textarea", {
              className: "form-input", value: description,
              onChange: e => { setDescription(e.target.value); autoGrowTextarea(e.target, 240); },
              onInput: e => autoGrowTextarea(e.target, 240),
              placeholder: "간단한 설명", rows: 3, maxLength: 2000,
              style: { resize: 'none', minHeight: '72px', overflow: 'hidden', width: '100%' }
            })),
        /*#__PURE__*/React.createElement("button", {
          type: "button", className: "btn btn-primary btn-action", disabled: saving, onClick: handleSave,
          style: { width: '100%', marginTop: '4px', height: '44px', minHeight: '44px', opacity: saving ? 0.7 : 1 }
        }, saving ? "저장 중..." : "저장")
      )
    ),
    document.body
  );
}

// 히스토리(보관함) 페이지의 '문화공연'/'지역축제' 탭 -- 둘 다 이 컴포넌트 하나를 dataUrl만 바꿔
// 재사용한다 (문화공연은 culture-performances.json, 지역축제는 culture-festivals.json). 둘 다
// scripts/sync-culture-performances.mjs가 매일 커밋하는 이 리포 소유의 정적 스냅샷을 fetch해서
// 상영중/예정 목록을 보여준다. Culture Flow(별개 프로젝트)의 실시간 JSON을 직접 fetch하지 않는
// 이유는 그 프로젝트의 스키마가 바뀌거나 그날 수집이 실패해도 이 탭이 즉시 깨지지 않게 하기
// 위함 -- 동기화 스크립트가 검증에 실패하면 최근 정상 스냅샷을 그대로 커밋해 유지한다.
// Resolve already-saved memo text for a culture card so the detail backdrop can seed the
// composer. Priority: linked anniversary.memo → memos collection (cultureSourceId / title) →
// date-modal attendance notes on the linked anniversary's start date. Without this, reopening
// a calendar-linked card always showed an empty memo dropdown even when DateModal already had
// the note (e.g. "티켓 17,000원").
function resolveExistingCultureMemoText(item, {
  anniversaries = [],
  memos = [],
  calendar = null,
  anniversaryCategory = 'event',
  findRegisteredAnniversary = null
} = {}) {
  if (!item) return '';
  const ann = typeof findRegisteredAnniversary === 'function'
    ? findRegisteredAnniversary(item.id, item.title)
    : (anniversaries || []).find(a => a && (a.cultureSourceId === item.id || a.id === item.id)) || null;
  const fromAnn = String(ann?.memo || '').trim();
  if (fromAnn) return fromAnn;

  const itemId = String(item.id || '').trim();
  const title = String(item.title || '').trim();
  const liveMemos = (memos || []).filter(m => m && !isTombstone(m) && String(m.text || '').trim());
  const bySource = itemId
    ? liveMemos.find(m => String(m.cultureSourceId || '').trim() === itemId)
    : null;
  if (bySource) return String(bySource.text || '').trim();
  if (title) {
    const byTitle = liveMemos
      .filter(m => String(m.title || '').trim() === title)
      .sort((a, b) => (Number(b.updatedAt) || Number(b.createdAt) || 0) - (Number(a.updatedAt) || Number(a.createdAt) || 0));
    if (byTitle[0]) return String(byTitle[0].text || '').trim();
  }

  // Last-resort: attendance notes the user left on the performance day in DateModal.
  const getActiveAvailabilities = (__gatherUiDeps().getActiveAvailabilities)
    || (window.GATHER_APP_UTILS || {}).getActiveAvailabilities;
  const dateStr = String(ann?.startDate || ann?.date || item.startDate || item.date || '').slice(0, 10);
  if (dateStr && typeof getActiveAvailabilities === 'function' && calendar) {
    const notes = getActiveAvailabilities(calendar)
      .filter(e => e && !isTombstone(e) && e.date === dateStr && String(e.note || '').trim())
      .map(e => String(e.note || '').trim());
    if (notes.length === 1) return notes[0];
    // Prefer a short personal note over multi-line auto text when several exist.
    const short = notes.find(n => n.length <= 80 && !n.includes('\n'));
    if (short) return short;
    if (notes[0]) return notes[0];
  }
  void anniversaryCategory;
  return '';
}

// Preview-only mirror of app-main.js's buildCultureEventMemoText -- shown as the textarea's
// placeholder so the user can see what gets saved if they leave the memo blank. The actual
// save always goes through onQuickSaveMemo (app-main.js), which is the single source of truth
// for the saved text; this is just a hint and doesn't need to stay byte-identical.
function buildQuickMemoPlaceholder(item) {
  if (!item) return '';
  const lines = [];
  const period = item.dateLabel || [item.startDate, item.endDate].filter(Boolean).join(' ~ ');
  if (period) lines.push(`기간: ${period}`);
  if (item.venue && item.kind !== 'movie' && item.genre !== 'movie') lines.push(`장소: ${item.venue}`);
  if (item.address) lines.push(`주소: ${item.address}`);
  return lines.join('\n') || '비워두면 행사 정보가 그대로 저장됩니다';
}

export function CulturePerformancesTab({ calendar, anniversaries = [], memos = [], onRegisterCultureEvent, onUnregisterCultureEvent, onQuickSaveMemo = null, onEditContent = null, dataUrl = CULTURE_PERFORMANCES_URL, emptyLabel = "상영중이거나 예정된 문화공연이 없습니다.", regionSelections = [], onItemsLoaded, anniversaryCategory = 'event', extraItems = [], chipRowSlot = null, contentPaddingTop = 0, onScroll, gridCols = '2', focusItemId = null, focusTitle = '', searchQuery = '' }) {
  const React = window.React;
  const ReactDOM = window.ReactDOM;
  const __deps = window.GATHER_UI_DEPS || {};
  const __comp = window.GATHER_UI_COMPONENTS || {};
  const SmallXIcon = __comp.SmallXIcon || __deps.SmallXIcon;
  const ShareIcon = __comp.ShareIcon || __deps.ShareIcon;
  const PencilIcon = __comp.PencilIcon || __deps.PencilIcon;
  const CalendarUpIcon = __comp.CalendarUpIcon || __deps.CalendarUpIcon;
  const [items, setItems] = React.useState(null); // null = loading, [] = loaded-empty
  const [loadError, setLoadError] = React.useState(false);
  const [selected, setSelected] = React.useState(null);
  const [pendingId, setPendingId] = React.useState(null);
  // 상세 시트의 "공유" 버튼 -- 이 카드의 전체 필드를 URL 프래그먼트에 실어(사진 공유와 동일한
  // 원칙) 복사한다. 이 URL을 열면 그 카드 백드롭이 바로 뜨고(App의 SharedContentPreviewModal),
  // 컨텐츠 등록 폼에 붙여넣으면 포스터~설명까지 그대로 복제 등록된다.
  const [contentShareUrl, setContentShareUrl] = React.useState('');
  const handleShareContent = async (item) => {
    const fragment = encodeGatherContentFragment(item);
    if (!fragment) return;
    const shareUrl = `${window.location.origin}${window.location.pathname}${fragment}`;
    const ok = await copyTextToClipboard(shareUrl);
    setContentShareUrl(shareUrl);
    // showToast isn't a prop here; a silent copy + the URL shown in the modal below is enough
    // feedback either way (a visible "복사됨" toast would need threading a new prop through).
    void ok;
  };
  const [isMemoOpen, setIsMemoOpen] = React.useState(false);
  const openMovieVideoSearch = item => {
    if (!item) return;
    const query = encodeURIComponent(`${item.title || ''} 영화 예고편 리뷰`.trim());
    window.open(`https://www.youtube.com/results?search_query=${query}`, '_blank', 'noopener,noreferrer');
  };
  const [memoDraft, setMemoDraft] = React.useState('');
  const [isSavingMemo, setIsSavingMemo] = React.useState(false);
  const resolveSelectedMemoText = React.useCallback((item) => {
    if (!item) return '';
    const list = anniversaries || [];
    const byId = list.find(a => a?.cultureSourceId === item.id || a?.id === item.id);
    const title = String(item.title || '').trim();
    const registered = byId || (title
      ? list.find(a => a && a.category === anniversaryCategory && String(a.title || '').trim() === title) || null
      : null);
    return resolveExistingCultureMemoText(item, {
      anniversaries,
      memos,
      calendar,
      anniversaryCategory,
      findRegisteredAnniversary: () => registered
    });
  }, [anniversaries, memos, calendar, anniversaryCategory]);
  // Seed (and auto-expand) the memo composer from any already-linked memo when a card opens.
  // Previously this always cleared + collapsed, so calendar-linked items that already had a
  // memo (anniversary.memo / memos collection / DateModal attendance note) looked empty.
  React.useEffect(() => {
    setIsSavingMemo(false);
    if (!selected) {
      setIsMemoOpen(false);
      setMemoDraft('');
      return;
    }
    const existing = resolveSelectedMemoText(selected);
    setMemoDraft(existing || '');
    setIsMemoOpen(!!existing);
  }, [selected?.id]);
  // If memos/anniversaries hydrate after the sheet opened, fill an still-empty composer once
  // without clobbering text the user has already started typing.
  React.useEffect(() => {
    if (!selected?.id) return;
    const existing = resolveSelectedMemoText(selected);
    if (!existing) return;
    setMemoDraft(prev => {
      if (String(prev || '').trim()) return prev;
      setIsMemoOpen(true);
      return existing;
    });
  }, [anniversaries, memos, resolveSelectedMemoText, selected?.id]);
  const handleSaveQuickMemo = async () => {
    if (!selected || isSavingMemo || typeof onQuickSaveMemo !== 'function') return;
    setIsSavingMemo(true);
    try {
      const draft = String(memoDraft || '').trim();
      const ok = await onQuickSaveMemo(selected, memoDraft);
      if (ok) {
        // Keep the rounded memo field visible with the saved text (matches the expected
        // calendar-linked backdrop screenshot) instead of collapsing to an empty composer.
        if (draft) setMemoDraft(draft);
        setIsMemoOpen(true);
      }
    } finally {
      setIsSavingMemo(false);
    }
  };
  // Local to this mount, not lifted to HistoryView like regionSelections -- 문화공연 and
  // 지역축제 have genuinely different genre mixes (지역축제 is almost entirely 'exhibition'), so a
  // category picked in one tab wouldn't mean anything carried over to the other. Since HistoryView
  // renders only one of these two tabs at a time (mutually exclusive `historyTab === ...` guards),
  // switching tabs unmounts this component and this state naturally resets with it.
  const [categoryFilter, setCategoryFilter] = React.useState('');

  // 문화공연 스냅샷은 1500개 안팎, 스포츠도 700개 안팎이라 필터 없이 전부 DOM에 한꺼번에
  // 그려버리면(포스터 이미지 <img>는 loading:'lazy'라 네트워크는 지연되지만, 카드 자체의 DOM
  // 노드 생성/레이아웃은 즉시 전부 일어남) 저사양 모바일에서 탭 진입 시 버벅임이 생긴다.
  // 한 번에 60개만 그리고 "더 보기"로 늘려가는 방식으로 초기 렌더 부담을 줄인다.
  const CULTURE_RENDER_PAGE_SIZE = 60;
  const [renderLimit, setRenderLimit] = React.useState(CULTURE_RENDER_PAGE_SIZE);
  // 필터가 바뀌면(지역/카테고리) 보여줄 항목 자체가 달라지므로 페이지 크기를 처음부터 다시 센다.
  React.useEffect(() => {
    setRenderLimit(CULTURE_RENDER_PAGE_SIZE);
  }, [categoryFilter, regionSelections, dataUrl]);

  React.useEffect(() => {
    let cancelled = false;
    setItems(null);
    setLoadError(false);
    fetch(dataUrl)
      .then(res => { if (!res.ok) throw new Error(`status ${res.status}`); return res.json(); })
      .then(data => {
        if (cancelled) return;
        setItems(Array.isArray(data?.items) ? data.items : []);
      })
      .catch(err => {
        console.warn('Culture snapshot load failed:', err);
        if (!cancelled) { setItems([]); setLoadError(true); }
      });
    return () => { cancelled = true; };
  }, [dataUrl]);

  // A registered item's own anniversary doc (cultureSourceId set by handleRegisterCultureEvent
  // in app-main.js), or null if this item hasn't been added to the calendar yet. Also matches by
  // a.id === itemId for cards built directly from a self-authored anniversary (기념일 등록으로
  // 만든 festival/event -- see HistoryView's selfAuthoredCultureItems), which never gets its own
  // cultureSourceId since it wasn't registered through this tab in the first place.
  //
  // itemTitle is a last-resort fallback for the same id-mismatch case orphanedSourceItems above
  // guards against (crawled id-generation scheme drift, or a Korean Unicode normalization
  // mismatch): a live crawled card whose id no longer equals what was captured at registration
  // time would otherwise show as "not registered" even though it plainly still is -- checking by
  // exact title (scoped to this tab's own category, so an unrelated same-titled sports/movie
  // entry can't false-match) keeps the checkbox/체크마크 correct without needing a data migration.
  const findRegisteredAnniversary = (itemId, itemTitle) => {
    const list = anniversaries || [];
    const byId = list.find(a => a?.cultureSourceId === itemId || a?.id === itemId);
    if (byId) return byId;
    const title = String(itemTitle || '').trim();
    if (!title) return null;
    return list.find(a => a && a.category === anniversaryCategory && String(a.title || '').trim() === title) || null;
  };

  const handleToggleRegister = async (item) => {
    if (!item || pendingId) return;
    setPendingId(item.id);
    try {
      const existing = findRegisteredAnniversary(item.id, item.title);
      if (existing) {
        if (typeof onUnregisterCultureEvent === 'function') await onUnregisterCultureEvent(existing.id);
      } else {
        const category = ['festival', 'sports', 'movie'].includes(anniversaryCategory) ? anniversaryCategory : 'event';
        if (typeof onRegisterCultureEvent === 'function') await onRegisterCultureEvent({ ...item, anniversaryCategory: category }, { category });
      }
    } finally {
      setPendingId(null);
    }
  };

  // A cultureSourceId-linked anniversary's card normally comes entirely from the live crawled
  // snapshot (`items`) -- the anniversary itself only stores the source id, not a copy of the
  // card's own fields. The daily sync (scripts/sync-culture-performances.mjs) drops items whose
  // listing has expired or was removed upstream, which silently erases that card from every tab
  // even though the calendar's own registration/confirmation of it is still completely intact --
  // from the user's side it looks exactly like "I registered this and it just vanished." Once the
  // snapshot has loaded, synthesize a fallback card (same shape HistoryView's selfAuthoredCultureItems
  // builds for anniversaries with no cultureSourceId at all) for any registered anniversary whose
  // source id is no longer present, so a user's own confirmed content never just disappears because
  // an external feed happened to drop it that day.
  const orphanedSourceItems = React.useMemo(() => {
    if (items === null) return [];
    const presentIds = new Set(items.map(i => i && i.id).filter(Boolean));
    // Also check by title: an id mismatch (e.g. the crawled snapshot's id-generation scheme
    // changed, or a Unicode normalization difference in the Korean title between the day this
    // was registered and today's snapshot) must not be treated the same as "genuinely dropped
    // from the feed" when a live item with the identical title still exists -- that live item
    // already renders normally via `crawled` below, and synthesizing a SECOND, poorer-fidelity
    // card for the same real-world listing here is exactly the "이중으로 관리되는" duplicate
    // bug (하나는 풍부한 크롤링 카드, 하나는 기념일 자신의 제한된 필드로만 채워진 카드).
    const presentTitles = new Set(items.map(i => i && String(i.title || '').trim()).filter(Boolean));
    const kindByCategory = { festival: 'festival', event: 'performance', sports: 'sports', movie: 'movie' };
    return (anniversaries || [])
      .filter(a => a && a.cultureSourceId && a.category === anniversaryCategory
        && !presentIds.has(a.cultureSourceId)
        && !presentTitles.has(String(a.title || '').trim()))
      .map(a => {
        // Full parity with the original crawled card, not just the handful of fields the
        // anniversary itself structurally tracks (place/description/movieMeta) -- see
        // cultureSnapshot's own comment in handleRegisterCultureEvent (app-main.js). Anniversaries
        // registered before this field existed have no cultureSnapshot at all; snapshot stays an
        // empty object for those and every field below falls back to the anniversary's own
        // limited set exactly as it always has, so nothing regresses for pre-existing data.
        const snapshot = (a.cultureSnapshot && typeof a.cultureSnapshot === 'object') ? a.cultureSnapshot : {};
        return {
          ...snapshot,
          id: a.cultureSourceId,
          kind: kindByCategory[a.category] || 'performance',
          title: a.title || snapshot.title || '',
          startDate: a.startDate || a.date || snapshot.startDate,
          endDate: a.endDate || a.date || snapshot.endDate,
          dateLabel: formatCultureDateLabel(a.startDate || a.date || snapshot.startDate, a.endDate || a.date || snapshot.endDate) || snapshot.dateLabel || '',
          venue: a.place ? (a.place.alias || a.place.name || '') : (snapshot.venue || ''),
          address: a.place ? (a.place.address || '') : (snapshot.address || ''),
          description: a.description || snapshot.description || '',
          releaseDate: a.movieMeta?.releaseDate || snapshot.releaseDate || a.date,
          director: a.movieMeta?.director || snapshot.director || '',
          cast: Array.isArray(a.movieMeta?.cast) ? a.movieMeta.cast : (Array.isArray(snapshot.cast) ? snapshot.cast : []),
          ageRating: a.movieMeta?.ageRating || snapshot.ageRating || '',
          bookingRate: a.movieMeta?.bookingRate || snapshot.bookingRate || '',
          audienceCount: a.movieMeta?.audienceCount || snapshot.audienceCount || '',
          isOpenEnded: a.movieMeta ? a.movieMeta.isOpenEnded !== false : (snapshot.isOpenEnded !== false),
          image: a.image || (Array.isArray(a.photos) && a.photos[0] ? (a.photos[0].thumbUrl || a.photos[0].url || '') : (snapshot.image || ''))
        };
      });
  }, [items, anniversaries, anniversaryCategory]);

  // Merge calendar-owned custom items (컨텐츠 등록) ahead of the crawled snapshot. Custom ids
  // use custom_perf_/custom_fest_ prefixes so they never collide with crawled perf_/fest_ ids,
  // but still de-dupe by id in case a write echoes twice.
  const mergedItems = React.useMemo(() => {
    if (items === null) return null;
    // A self-authored anniversary (기념일 등록으로 직접 typed, no cultureSourceId at all) or a
    // manually 개별등록-ed card can coincidentally share its title with something that's also
    // sitting right there in today's live crawled feed -- the user typed/found it independently,
    // unaware it was already a registerable listing. Without this check both would render as two
    // separate cards for the same real-world event: the rich crawled one, and the other holding
    // only whatever the user themselves typed -- exactly the "이중으로 관리되는" duplicate this
    // caused. Prefer the live crawled version (richer, and always the freshest available data)
    // over a same-titled self-authored/custom entry.
    const crawledTitles = new Set((items || []).map(i => i && String(i.title || '').trim()).filter(Boolean));
    // isCustomRegistered marks every self-authored/컨텐츠-등록 item (as opposed to crawled from
    // the portal snapshot) so the "개별등록" category chip below can filter on it directly,
    // instead of guessing from genre/id-prefix which crawled items can also lack.
    const extras = (Array.isArray(extraItems) ? extraItems.filter(Boolean) : [])
      .filter(e => !crawledTitles.has(String(e.title || '').trim()))
      .map(e => ({ ...e, isCustomRegistered: true }));
    const seen = new Set(extras.map(e => e && e.id).filter(Boolean));
    const orphaned = orphanedSourceItems
      .filter(o => o && o.id && !seen.has(o.id))
      .map(o => ({ ...o, isCustomRegistered: true }));
    orphaned.forEach(o => seen.add(o.id));
    const crawled = (items || []).filter(i => i && i.id && !seen.has(i.id));
    return [...extras, ...orphaned, ...crawled];
  }, [items, extraItems, orphanedSourceItems]);

  // Reported unfiltered (crawled snapshot + any custom items merged in above) -- RegionFilterBackdrop's
  // per-region counts should always reflect every item available in this tab, not just whatever the
  // current region selection narrows the grid down to.
  React.useEffect(() => {
    if (typeof onItemsLoaded === 'function') onItemsLoaded(mergedItems || []);
  }, [mergedItems]);

  // 일정 팝업에서 "기념일 제목"을 눌러 넘어온 경우, 그 항목을 찾아 상세 시트를 자동으로 연다.
  // 한 번만 시도하면 되므로 mergedItems가 (아직 못 찾았더라도) 로드된 뒤로는 다시 확인하지 않는다.
  // id로 못 찾으면 제목으로 한 번 더 찾는다 -- 크롤링 스냅샷의 id 생성 규칙이 과거에 바뀐 적이
  // 있어(예: 날짜 기반 -> 제목 기반), 그 변경 이전에 등록된 기념일은 cultureSourceId가 오늘자
  // 스냅샷/orphan 폴백 어느 쪽과도 더 이상 일치하지 않게 될 수 있다 -- 이때도 같은 제목의
  // 항목이 오늘자 스냅샷에 그대로 있다면 그거라도 열어 주는 게, 아무것도 안 열리는 것보다 낫다.
  const focusAttemptedRef = React.useRef(false);
  React.useEffect(() => {
    if (!focusItemId || focusAttemptedRef.current || mergedItems === null) return;
    focusAttemptedRef.current = true;
    const match = mergedItems.find(i => i && i.id === focusItemId)
      || (focusTitle ? mergedItems.find(i => i && String(i.title || '').trim() === focusTitle.trim()) : null);
    if (match) setSelected(match);
  }, [focusItemId, focusTitle, mergedItems]);

  if (mergedItems === null) {
    return /*#__PURE__*/React.createElement("div", {
      style: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 'var(--font-size-md)', paddingTop: contentPaddingTop }
    }, "불러오는 중...");
  }

  if (mergedItems.length === 0) {
    return /*#__PURE__*/React.createElement("div", {
      style: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 'var(--font-size-md)', paddingTop: contentPaddingTop }
    }, loadError ? "정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요." : emptyLabel);
  }

  // Multi-select OR: with no selections at all, every item passes (전국); with one or more,
  // an item matches if it satisfies ANY saved { sido, gugun } pair (gugun '' means that 시/도 전체).
  const lifecycleItems = filterAndSortCultureItems(mergedItems, anniversaryCategory);
  const regionFilteredItems = lifecycleItems.filter(item => {
    if (!regionSelections || regionSelections.length === 0) return true;
    return regionSelections.some(sel => {
      if (sel.sido && item.region !== sel.sido) return false;
      if (sel.gugun && getCultureItemDistrict(item) !== sel.gugun) return false;
      return true;
    });
  });

  if (regionFilteredItems.length === 0) {
    return /*#__PURE__*/React.createElement("div", {
      style: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 'var(--font-size-md)', paddingTop: contentPaddingTop }
    }, "선택한 지역에 해당하는 항목이 없습니다.");
  }

  const searchNeedle = (searchQuery || '').trim().toLowerCase();
  const searchFilteredItems = searchNeedle
    ? regionFilteredItems.filter(item => String(item?.title || '').toLowerCase().includes(searchNeedle))
    : regionFilteredItems;

  if (searchFilteredItems.length === 0) {
    return /*#__PURE__*/React.createElement("div", {
      style: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 'var(--font-size-md)', paddingTop: contentPaddingTop }
    }, "검색 결과가 없습니다.");
  }

  // Counts (and which genres even exist) are computed off the region+search-filtered set, not the
  // raw snapshot -- so switching region/search can change which category chips show up / their
  // counts, consistent with how RegionFilterBackdrop's own counts work off whichever tab is mounted.
  const categoryCounts = new Map();
  searchFilteredItems.forEach(item => {
    const key = anniversaryCategory === 'movie' ? (item.subGenre || '기타') : (item.genre || '');
    categoryCounts.set(key, (categoryCounts.get(key) || 0) + 1);
  });
  const categoryOptions = [...categoryCounts.entries()]
    .filter(([genre]) => !!genre)
    .sort((a, b) => b[1] - a[1])
    .map(([genre, count]) => ({ value: genre, label: cultureGenreLabel(genre), count }));
  const CUSTOM_CATEGORY_VALUE = '__custom__';
  const customRegisteredCount = searchFilteredItems.filter(item => item && item.isCustomRegistered).length;

  const filteredItems = categoryFilter === CUSTOM_CATEGORY_VALUE
    ? searchFilteredItems.filter(item => item && item.isCustomRegistered)
    : categoryFilter
      ? searchFilteredItems.filter(item => (anniversaryCategory === 'movie' ? (item.subGenre || '기타') : (item.genre || '')) === categoryFilter)
      : searchFilteredItems;

  // "개별등록"은 전체/장르 칩과 마찬가지로 항상 고정 노출한다 -- 지금 등록된 개수가 0이어도
  // (예: 등록해둔 항목이 피드 갱신으로 잠시 사라진 경우) 사용자가 바로 눌러서 확인할 수 있는
  // 자리가 계속 있어야 하며, 개수만 보고 매번 나타났다 사라지는 건 "전체 / 개별등록 / 장르..."
  // 로 항상 구성해 달라던 요청과 어긋난다.
  const categoryChipRow = /*#__PURE__*/React.createElement("div", {
    style: { display: 'flex', gap: '6px', padding: '0 16px 12px', overflowX: 'auto', flexShrink: 0, alignItems: 'center' }
  },
    [
      { value: '', label: '전체', count: searchFilteredItems.length },
      { value: CUSTOM_CATEGORY_VALUE, label: '개별등록', count: customRegisteredCount },
      ...categoryOptions
    ].map(opt => {
      const isActive = categoryFilter === opt.value;
      return /*#__PURE__*/React.createElement("button", {
        key: opt.value || 'all',
        type: "button",
        onClick: () => setCategoryFilter(opt.value),
        style: {
          flexShrink: 0, border: 'none', borderRadius: 'var(--radius-full)', padding: '6px 12px',
          background: isActive ? 'var(--accent-primary)' : 'var(--bg-primary)',
          color: isActive ? '#FFFFFF' : 'var(--text-muted)',
          fontWeight: 700, fontSize: 'var(--font-size-sm)', cursor: 'pointer', whiteSpace: 'nowrap',
          display: 'inline-flex', alignItems: 'center', gap: '6px'
        }
      }, opt.label, /*#__PURE__*/React.createElement(SectionCountBadge, { count: opt.count }));
    })
  );

  // Portals into the fixed header-stack slot HistoryView renders below the 시/도·군/구 row so the
  // chip row slides away together with the rest of the header on scroll, instead of scrolling
  // with the poster grid underneath it. Falls back to rendering inline (its pre-existing spot,
  // right above the grid) on the rare render where the slot ref hasn't attached yet.
  const renderedCategoryChipRow = chipRowSlot
    ? (categoryChipRow ? ReactDOM.createPortal(categoryChipRow, chipRowSlot) : null)
    : categoryChipRow;

  if (filteredItems.length === 0) {
    return /*#__PURE__*/React.createElement(React.Fragment, null,
      renderedCategoryChipRow,
      /*#__PURE__*/React.createElement("div", {
        style: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 'var(--font-size-md)', paddingTop: contentPaddingTop }
      }, "선택한 카테고리에 해당하는 항목이 없습니다.")
    );
  }

  const visibleItems = filteredItems.slice(0, renderLimit);
  const hasMoreToRender = filteredItems.length > visibleItems.length;
  // 스크롤이 하단 근처(300px 이내)에 닿으면 "더 보기"를 누른 것과 동일하게 다음 60개를 이어
  // 붙인다. 이 그리드는 HistoryView가 헤더 접힘 효과에 쓰는 자기 onScroll도 받고 있어서, 그걸
  // 대체하지 않고 함께 호출한다.
  const handleGridScroll = e => {
    if (typeof onScroll === 'function') onScroll(e);
    if (!hasMoreToRender) return;
    const el = e.target;
    if (el.scrollHeight - el.scrollTop - el.clientHeight < 300) {
      setRenderLimit(limit => limit + CULTURE_RENDER_PAGE_SIZE);
    }
  };

  // 상세보기 설명(selected.description)은 외부 지역축제/문화행사 피드의 원본 텍스트를 그대로
  // 보여주는 자유 텍스트라, 공식 홈페이지처럼 별도 구조화된 필드 없이 URL이 그냥 문장 중간에
  // 섞여 들어오는 경우가 있다(예: 운영시간 뒤에 홈페이지 주소가 이어지는 식) -- 그런 URL도
  // 클릭해서 새 창으로 열 수 있도록 설명 텍스트 안의 http(s) 링크만 찾아 <a>로 바꿔준다.
  const renderDescriptionWithLinks = text => {
    const raw = String(text || '');
    return raw.split(/(https?:\/\/[^\s]+)/g).map((part, i) => {
      if (!/^https?:\/\//.test(part)) return part;
      const trailingMatch = part.match(/[).,!?"'”’]+$/);
      const trailing = trailingMatch ? trailingMatch[0] : '';
      const url = trailing ? part.slice(0, part.length - trailing.length) : part;
      return /*#__PURE__*/React.createElement(React.Fragment, { key: i },
        /*#__PURE__*/React.createElement("a", {
          href: url, target: "_blank", rel: "noopener noreferrer",
          onClick: e => e.stopPropagation(),
          style: { color: 'var(--accent-primary)', textDecoration: 'underline', wordBreak: 'break-all' }
        }, url),
        trailing
      );
    });
  };
  const renderPersonLinks = value => {
    const people = Array.isArray(value) ? value : String(value || '').split(',').map(s => s.trim()).filter(Boolean);
    return people.flatMap((person, index) => [
      index > 0 ? /*#__PURE__*/React.createElement(React.Fragment, { key: `sep-${index}` }, ', ') : null,
      /*#__PURE__*/React.createElement("a", {
        key: `${person}-${index}`,
        href: `https://search.naver.com/search.naver?query=${encodeURIComponent(person)}`,
        target: "_blank", rel: "noopener noreferrer",
        onClick: e => e.stopPropagation(),
        style: { color: 'var(--accent-primary)', textDecoration: 'underline' }
      }, person)
    ]);
  };

  return /*#__PURE__*/React.createElement(React.Fragment, null,
    renderedCategoryChipRow,
    /*#__PURE__*/React.createElement("div", {
      className: "culture-items-grid is-cols-" + (gridCols === '1' ? '1' : '2'),
      onScroll: handleGridScroll,
      style: { flex: 1, overflowY: 'auto', padding: '16px', paddingTop: contentPaddingTop, alignContent: 'start', gridAutoRows: 'max-content' }
    },
      visibleItems.map(item => {
        const registered = !!findRegisteredAnniversary(item.id, item.title);
        const isMovieCard = anniversaryCategory === 'movie' || item.genre === 'movie' || item.kind === 'movie';
        const isMovieNowShowing = isMovieCard
          && cultureItemDay(item)
          && cultureItemDay(item) <= todayIsoLocal()
          && (!item.endDate || item.endDate >= todayIsoLocal());
        const posterDateText = item.dateLabel || formatCultureDateLabel(item.startDate, item.endDate) || (item.releaseDate ? `${item.releaseDate} 개봉` : CULTURE_MISSING_LABEL);
        const posterDateParts = !isMovieCard && String(posterDateText).match(/^(.*?\([^)]*\))\s*[·•]?\s*(\d{1,2}:\d{2})\s*$/);
        return /*#__PURE__*/React.createElement("button", {
          key: item.id,
          type: "button",
          onClick: () => setSelected(item),
          style: {
            display: 'flex', flexDirection: 'column', gap: '6px', padding: 0,
            border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--bg-card)', cursor: 'pointer', textAlign: 'left',
            minWidth: 0,
            overflow: 'hidden'
          }
        },
          /*#__PURE__*/React.createElement("div", { style: { position: 'relative', width: '100%', aspectRatio: '3 / 4', backgroundColor: 'var(--bg-primary)', flexShrink: 0, overflow: 'hidden' } },
            // "포스터 없음" is always the base layer (not just the no-image branch's fallback) so
            // a broken image URL -- the daily snapshot's festival items all carry an
            // /images/fallbacks/*.jpg path that was never actually committed as a real asset,
            // so every one 404s -- reveals this placeholder underneath once onError hides the
            // <img>, instead of leaving a blank box with nothing in it.
            /*#__PURE__*/React.createElement("div", { style: { position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)' } }, "포스터 없음"),
            item.image && /*#__PURE__*/React.createElement("img", {
              src: item.image, alt: item.title, loading: 'lazy', decoding: 'async',
              style: { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' },
              onError: e => { e.currentTarget.style.display = 'none'; }
            }),
            isMovieNowShowing && /*#__PURE__*/React.createElement("span", {
              style: {
                position: 'absolute', top: '8px', left: '8px', zIndex: 2,
                display: 'inline-flex', alignItems: 'center', padding: '4px 9px',
                borderRadius: 'var(--radius-full)', backgroundColor: '#16A34A', color: '#FFFFFF',
                fontSize: 'var(--font-size-2xs)', fontWeight: 800, lineHeight: 1,
                boxShadow: '0 1px 4px rgba(0,0,0,0.28)'
              }
            }, "상영중"),
            // 스포츠 경기 카드: 포스터(팀 관계없는 종목 기본 이미지) 위에 날짜/양팀 로고/경기장을
            // 오버레이로 얹는다. 로고를 크게 꽉 채우고, 날짜/경기장은 로고 쪽으로 촘촘하게 붙인다
            // (컬처플로우 스포츠 카드 레이아웃 참고).
            item.homeTeam && item.awayTeam && /*#__PURE__*/React.createElement("div", {
              style: {
                position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
                justifyContent: 'center', alignItems: 'center', gap: '4px', padding: '10px 8px',
                boxSizing: 'border-box', color: '#fff', textAlign: 'center',
                background: 'linear-gradient(180deg, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.4) 22%, rgba(0,0,0,0.4) 78%, rgba(0,0,0,0.72) 100%)'
              }
            },
              /*#__PURE__*/React.createElement("div", {
                style: {
                  fontSize: '0.9rem', fontWeight: 800, textShadow: '0 1px 3px rgba(0,0,0,0.7)',
                  backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 'var(--radius-full)', padding: '2px 14px',
                  maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                }
              }, posterDateParts ? /*#__PURE__*/React.createElement(React.Fragment, null,
                /*#__PURE__*/React.createElement("span", { style: { display: 'block', whiteSpace: 'nowrap' } }, posterDateParts[1]),
                /*#__PURE__*/React.createElement("span", { style: { display: 'block', whiteSpace: 'nowrap', marginTop: '2px' } }, posterDateParts[2])
              ) : posterDateText),
              /*#__PURE__*/React.createElement("div", {
                style: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', width: '100%' }
              },
                /*#__PURE__*/React.createElement("div", { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', flex: '1 1 0', minWidth: 0 } },
                  item.homeTeamLogo && /*#__PURE__*/React.createElement("img", {
                    src: item.homeTeamLogo, alt: item.homeTeam, loading: 'lazy', decoding: 'async',
                    style: { width: '100%', maxWidth: '112px', aspectRatio: '1 / 1', objectFit: 'contain', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.55))' },
                    onError: e => { e.currentTarget.style.display = 'none'; }
                  }),
                  /*#__PURE__*/React.createElement("span", {
                    style: { fontSize: 'var(--font-size-xs)', fontWeight: 800, textShadow: '0 1px 2px rgba(0,0,0,0.6)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%' }
                  }, item.homeTeam)
                ),
                /*#__PURE__*/React.createElement("span", {
                  style: {
                    fontSize: '1.3rem', fontWeight: 800, textShadow: '0 1px 2px rgba(0,0,0,0.6)', flexShrink: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 'var(--radius-full)', padding: '2px 10px'
                  }
                }, "vs"),
                /*#__PURE__*/React.createElement("div", { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', flex: '1 1 0', minWidth: 0 } },
                  item.awayTeamLogo && /*#__PURE__*/React.createElement("img", {
                    src: item.awayTeamLogo, alt: item.awayTeam, loading: 'lazy', decoding: 'async',
                    style: { width: '100%', maxWidth: '112px', aspectRatio: '1 / 1', objectFit: 'contain', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.55))' },
                    onError: e => { e.currentTarget.style.display = 'none'; }
                  }),
                  /*#__PURE__*/React.createElement("span", {
                    style: { fontSize: 'var(--font-size-xs)', fontWeight: 800, textShadow: '0 1px 2px rgba(0,0,0,0.6)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%' }
                  }, item.awayTeam)
                )
              ),
              /*#__PURE__*/React.createElement("div", {
                style: {
                  fontSize: '0.9rem', fontWeight: 700, textShadow: '0 1px 3px rgba(0,0,0,0.7)',
                  backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 'var(--radius-full)', padding: '2px 14px',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%'
                }
              }, item.venue || CULTURE_MISSING_LABEL)
            ),
            registered && /*#__PURE__*/React.createElement("div", {
              title: "캘린더 등록됨",
              "aria-label": "캘린더 등록됨",
              style: { position: 'absolute', top: '6px', right: '6px', backgroundColor: '#7C3AED', color: '#fff', borderRadius: 'var(--radius-full)', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.25)' }
            }, CalendarUpIcon ? /*#__PURE__*/React.createElement(CalendarUpIcon, { size: 13 }) : null)
          ),
          /*#__PURE__*/React.createElement("div", { style: { padding: '8px 10px 10px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: '3px', flex: 1 } },
            /*#__PURE__*/React.createElement("div", {
              style: { fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }
            }, isMovieCard
              ? `개봉일 ${formatDateWithDayName(item.releaseDate || item.startDate) || CULTURE_MISSING_LABEL}`
              : (item.dateLabel || formatCultureDateLabel(item.startDate, item.endDate) || CULTURE_MISSING_LABEL)),
            /*#__PURE__*/React.createElement("div", {
              style: { fontSize: 'var(--font-size-sm)', fontWeight: 800, color: 'var(--text-main)', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', wordBreak: 'break-word' }
            }, item.title),
            isMovieCard ? /*#__PURE__*/React.createElement(React.Fragment, null,
              /*#__PURE__*/React.createElement("div", {
                style: { fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }
              }, item.ageRating || '등급 정보 없음'),
              /*#__PURE__*/React.createElement("div", {
                style: { fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }
              }, `[${item.director || '감독 정보 없음'}] ${Array.isArray(item.cast) && item.cast.length ? item.cast.join(', ') : '출연 정보 없음'}`)
            ) : /*#__PURE__*/React.createElement(React.Fragment, null,
            // 지역축제는 '장소'와 '주소'가 사실상 같은 정보를 가리키는 경우가 대부분이라
            // (예: 장소="영등포아트홀", 주소="서울 영등포구 ...") 축제 카드에서는 장소 줄을
            // 생략하고 주소만 보여준다. 문화공연(anniversaryCategory 'event')은 공연장 이름이
            // 주소만으로는 알 수 없는 별도 정보라 계속 둘 다 보여준다.
            anniversaryCategory !== 'festival' && anniversaryCategory !== 'movie' && /*#__PURE__*/React.createElement("div", {
              style: { fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }
            }, item.venue || CULTURE_MISSING_LABEL),
            /*#__PURE__*/React.createElement("div", {
              style: { fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }
            }, item.address || CULTURE_MISSING_LABEL))
          )
        );
      }),
      hasMoreToRender && /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: () => setRenderLimit(limit => limit + CULTURE_RENDER_PAGE_SIZE),
        style: {
          gridColumn: '1 / -1', padding: '12px', borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-primary)',
          color: 'var(--text-main)', fontWeight: 700, fontSize: 'var(--font-size-sm)', cursor: 'pointer'
        }
      }, `더 보기 (${visibleItems.length}/${filteredItems.length})`)
    ),
    selected && ReactDOM.createPortal(
      /*#__PURE__*/React.createElement("div", {
        onClick: () => setSelected(null),
        style: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.55)', zIndex: 13000, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }
      },
        /*#__PURE__*/React.createElement("div", {
          onClick: e => e.stopPropagation(),
          style: {
            position: 'relative', width: '100%', maxWidth: '480px', maxHeight: '85vh',
            backgroundColor: 'var(--bg-card)', borderRadius: '16px 16px 0 0', padding: '20px',
            display: 'flex', flexDirection: 'column', gap: '10px', boxSizing: 'border-box'
          }
        },
          /*#__PURE__*/React.createElement("button", {
            type: "button", onClick: () => setSelected(null), "aria-label": "닫기",
            style: {
              position: 'absolute', top: '12px', right: '12px', zIndex: 1,
              width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: 'none', borderRadius: 'var(--radius-full)', cursor: 'pointer',
              backgroundColor: 'rgba(0,0,0,0.45)', color: '#fff'
            }
          }, SmallXIcon ? /*#__PURE__*/React.createElement(SmallXIcon, { size: 18 }) : "✕"),
          typeof onEditContent === 'function' && /*#__PURE__*/React.createElement("button", {
            type: "button", onClick: () => { setSelected(null); onEditContent(selected); },
            "aria-label": "컨텐츠 편집", title: "편집",
            style: {
              position: 'absolute', top: '12px', left: '12px', zIndex: 2,
              width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: 'none', borderRadius: 'var(--radius-full)', cursor: 'pointer',
              backgroundColor: 'rgba(0,0,0,0.45)', color: '#fff', fontSize: '18px', lineHeight: 1
            }
          }, PencilIcon ? /*#__PURE__*/React.createElement(PencilIcon, { size: 14 }) : "✎"),
          selected.image && /*#__PURE__*/React.createElement("div", {
            role: (anniversaryCategory === 'movie' || selected.genre === 'movie') ? 'button' : undefined,
            tabIndex: (anniversaryCategory === 'movie' || selected.genre === 'movie') ? 0 : undefined,
            onClick: (anniversaryCategory === 'movie' || selected.genre === 'movie') ? () => openMovieVideoSearch(selected) : undefined,
            onKeyDown: (anniversaryCategory === 'movie' || selected.genre === 'movie') ? e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openMovieVideoSearch(selected); } } : undefined,
            'aria-label': (anniversaryCategory === 'movie' || selected.genre === 'movie') ? '유튜브에서 예고편 및 리뷰 보기' : undefined,
            style: { position: 'relative', width: '100%', flexShrink: 0, cursor: (anniversaryCategory === 'movie' || selected.genre === 'movie') ? 'pointer' : 'default' }
          },
            /*#__PURE__*/React.createElement("img", {
              src: selected.image, alt: selected.title, loading: 'lazy',
              style: { width: '100%', maxHeight: '260px', objectFit: 'contain', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-primary)', display: 'block' },
              onError: e => { e.currentTarget.style.display = 'none'; }
            }),
            (anniversaryCategory === 'movie' || selected.genre === 'movie') && /*#__PURE__*/React.createElement("span", {
              'aria-hidden': 'true', style: {
                position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)',
                width: '56px', height: '56px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                backgroundColor: 'rgba(0,0,0,0.55)', color: '#fff', fontSize: '25px', paddingLeft: '4px', boxSizing: 'border-box',
                boxShadow: '0 2px 10px rgba(0,0,0,0.3)', pointerEvents: 'none'
              }
            }, "▶")
          ),
          /*#__PURE__*/React.createElement("div", { style: { fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', flexShrink: 0, paddingRight: '36px' } }, selected.title),
          // 기간~설명까지 한 블록으로 스크롤 -- 예전엔 설명 칸만 따로 120px 높이로 스크롤돼서
          // 모바일 세로폭에선 몇 줄 보이지도 않는 좁은 창으로 긴 설명을 읽어야 했다. 이미지/제목은
          // 항상 보이게 위에 고정, 체크박스/링크 버튼은 항상 보이게 아래 고정하고, 그 사이 정보
          // 블록만 남는 공간을 스크롤하도록 minHeight:0 + flex:1로 바꿨다.
          /*#__PURE__*/React.createElement("div", {
            style: { flex: 1, minHeight: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }
          },
            [
              ['개봉일', selected.releaseDate || ((anniversaryCategory === 'movie' || selected.genre === 'movie') ? selected.startDate : '')],
              ['상영기간', (anniversaryCategory === 'movie' || selected.genre === 'movie') && !selected.endDate ? '종료일 미정 · 상영정보 유지' : selected.dateLabel],
              ['감독', selected.director],
              ['출연', Array.isArray(selected.cast) ? selected.cast.join(', ') : selected.cast],
              ['관람등급', selected.ageRating],
              ['예매율', selected.bookingRate],
              ['관객수', selected.audienceCount],
              ['러닝타임', selected.runningTime],
              ['장르', selected.subGenre],
              ['장소', anniversaryCategory === 'movie' || selected.genre === 'movie' ? '' : selected.venue],
              ['주소', anniversaryCategory === 'movie' || selected.genre === 'movie' ? '' : selected.address],
              ['주최', selected.organizer],
              ['문의', selected.contact],
              ['가격', selected.price],
              ['공식 홈페이지', selected.website || selected.link]
            ].filter(([, value]) => value && String(value).trim())
              .map(([label, value]) => /*#__PURE__*/React.createElement("div", {
              key: label, style: { display: 'flex', gap: '8px', fontSize: 'var(--font-size-sm)' }
            },
              /*#__PURE__*/React.createElement("span", { style: { flexShrink: 0, width: '84px', color: 'var(--text-muted)', fontWeight: 700 } }, label),
              /*#__PURE__*/React.createElement("span", { style: { color: 'var(--text-main)', wordBreak: 'break-word' } },
                (label === '감독' || label === '출연') ? renderPersonLinks(value)
                  : (label === '공식 홈페이지' ? renderDescriptionWithLinks(value) : value))
            )),
            selected.description && /*#__PURE__*/React.createElement("div", {
              style: { fontSize: 'var(--font-size-sm)', color: 'var(--text-main)', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }
            }, renderDescriptionWithLinks(selected.description))
          ),
          /*#__PURE__*/React.createElement("div", {
            style: { display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }
          },
            /*#__PURE__*/React.createElement("label", {
              style: { display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0, padding: '10px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-primary)', cursor: pendingId ? 'wait' : 'pointer', fontSize: 'var(--font-size-md)', fontWeight: 700, color: 'var(--text-main)' }
            },
              /*#__PURE__*/React.createElement("input", {
                type: "checkbox",
                checked: !!findRegisteredAnniversary(selected.id, selected.title),
                disabled: !!pendingId,
                onChange: () => handleToggleRegister(selected)
              }),
              /*#__PURE__*/React.createElement("span", {
                style: { display: 'inline-flex', alignItems: 'center', gap: '4px', minWidth: 0 }
              },
                "캘린더와 연동",
                CalendarUpIcon ? /*#__PURE__*/React.createElement(CalendarUpIcon, { size: 13 }) : null
              )
            ),
            typeof onQuickSaveMemo === 'function' && /*#__PURE__*/React.createElement("button", {
              type: "button",
              onClick: () => setIsMemoOpen(prev => !prev),
              "aria-expanded": isMemoOpen,
              "aria-label": "메모로 등록",
              style: {
                display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0,
                padding: '10px 12px', borderRadius: 'var(--radius-md)', border: 'none',
                backgroundColor: 'var(--bg-primary)', color: 'var(--text-main)',
                fontSize: 'var(--font-size-md)', fontWeight: 700, cursor: 'pointer'
              }
            }, "메모", /*#__PURE__*/React.createElement("svg", {
              xmlns: "http://www.w3.org/2000/svg", width: "16", height: "16", viewBox: "0 0 24 24",
              fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round",
              style: { transform: isMemoOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s ease' }
            }, /*#__PURE__*/React.createElement("path", { d: "M6 9l6 6l6 -6" })))
          ),
          (isMemoOpen || !!String(memoDraft || '').trim()) && /*#__PURE__*/React.createElement("div", {
            style: { display: 'flex', flexDirection: 'column', gap: '8px', flexShrink: 0 }
          },
            /*#__PURE__*/React.createElement("textarea", {
              value: memoDraft,
              onChange: e => setMemoDraft(e.target.value),
              placeholder: buildQuickMemoPlaceholder(selected),
              rows: 4,
              style: {
                width: '100%', boxSizing: 'border-box', padding: '10px', borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-card)', color: 'var(--text-main)',
                fontSize: 'var(--font-size-sm)', fontFamily: 'inherit', resize: 'vertical'
              }
            }),
            /*#__PURE__*/React.createElement("button", {
              type: "button",
              onClick: handleSaveQuickMemo,
              disabled: isSavingMemo,
              style: {
                padding: '10px', borderRadius: 'var(--radius-md)', border: 'none',
                backgroundColor: 'var(--accent-primary)', color: '#fff', fontWeight: 800,
                fontSize: 'var(--font-size-md)', cursor: isSavingMemo ? 'wait' : 'pointer',
                opacity: isSavingMemo ? 0.6 : 1
              }
            }, "메모 저장")
          ),
          (() => {
            // 자세히보기 URL이 없으면 공유만 남는데, 44px 아이콘만 두면 로드 깨진 것처럼 보인다.
            // 그때는 자세히보기 폭까지 써서 아이콘+「공유하기」풀폭 버튼으로 바꾼다.
            const detailUrl = resolveCultureDetailUrl(selected);
            return /*#__PURE__*/React.createElement("div", { style: { display: 'flex', gap: '8px', flexShrink: 0 } },
              /*#__PURE__*/React.createElement("button", {
                type: "button", onClick: () => handleShareContent(selected), "aria-label": "공유",
                style: detailUrl ? {
                  width: '44px', height: '44px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)',
                  backgroundColor: 'var(--bg-primary)', color: 'var(--text-main)', cursor: 'pointer'
                } : {
                  flex: 1, minHeight: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)',
                  backgroundColor: 'var(--bg-primary)', color: 'var(--text-main)', cursor: 'pointer',
                  fontWeight: 800, fontSize: 'var(--font-size-md)'
                }
              },
                ShareIcon ? /*#__PURE__*/React.createElement(ShareIcon, { size: 20 }) : "🔗",
                !detailUrl ? "공유하기" : null
              ),
              detailUrl ? /*#__PURE__*/React.createElement("a", {
                href: detailUrl, target: "_blank", rel: "noopener noreferrer",
                style: {
                  display: 'block', flex: 1, textAlign: 'center', padding: '10px', borderRadius: 'var(--radius-md)',
                  backgroundColor: '#7C3AED', color: '#fff', fontWeight: 800, fontSize: 'var(--font-size-md)', textDecoration: 'none'
                }
              }, "자세히보기") : null
            );
          })()
        )
      ),
      document.body
    ),
    contentShareUrl && ReactDOM.createPortal(
      /*#__PURE__*/React.createElement("div", {
        onClick: () => setContentShareUrl(''),
        style: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.55)', zIndex: 30000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }
      }, /*#__PURE__*/React.createElement("div", {
        onClick: e => e.stopPropagation(),
        style: { width: '100%', maxWidth: '400px', backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-md)', padding: '20px', boxSizing: 'border-box' }
      },
        /*#__PURE__*/React.createElement("h3", { style: { fontSize: '1.05rem', fontWeight: 800, marginBottom: '12px', color: 'var(--text-main)', textAlign: 'center' } }, "공유 URL"),
        /*#__PURE__*/React.createElement("input", {
          type: "text", className: "form-input", readOnly: true, value: contentShareUrl,
          style: { width: '100%', marginBottom: '12px', boxSizing: 'border-box' }
        }),
        /*#__PURE__*/React.createElement("div", {
          style: { fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', textAlign: 'center', marginBottom: '16px' }
        }, "URL이 클립보드에 복사되었습니다. 이 URL을 열면 이 컨텐츠가 바로 보이고, 다른 캘린더의 '컨텐츠 등록'에 붙여넣으면 포스터부터 내용까지 그대로 등록됩니다."),
        /*#__PURE__*/React.createElement("div", { style: { display: 'flex', gap: '10px' } },
          /*#__PURE__*/React.createElement("button", {
            type: "button", className: "btn btn-secondary", onClick: () => setContentShareUrl(''),
            style: { flex: 1, height: '36px', fontSize: 'var(--font-size-base)' }
          }, "닫기"),
          /*#__PURE__*/React.createElement("button", {
            type: "button", className: "btn btn-action-dark",
            onClick: () => copyTextToClipboard(contentShareUrl),
            style: { flex: 1, height: '36px', fontSize: 'var(--font-size-base)' }
          }, "다시 복사")
        )
      )),
      document.body
    )
  );
}

// 다른 캘린더의 컨텐츠 상세 "공유" 버튼으로 받은 URL(#gatherContent=...)을 열었을 때, 로그인/
// 캘린더 상태와 무관하게 바로 띄우는 읽기 전용 미리보기 -- app-main.js의 App()이 URL을 한 번
// 파싱해 이 컴포넌트에 item을 넘겨준다. 실제 등록(Firestore 쓰기)은 여기서 하지 않고, 등록하고
// 싶으면 컨텐츠 등록 화면의 "붙여넣기"를 쓰도록 안내만 한다.
function SharedContentPreviewModal({ item, onClose }) {
  const React = window.React;
  const ReactDOM = window.ReactDOM;
  const __deps = window.GATHER_UI_DEPS || {};
  const __comp = window.GATHER_UI_COMPONENTS || {};
  const SmallXIcon = __comp.SmallXIcon || __deps.SmallXIcon;
  if (!item || typeof document === 'undefined' || !ReactDOM) return null;
  return ReactDOM.createPortal(
    /*#__PURE__*/React.createElement("div", {
      onClick: onClose,
      style: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.55)', zIndex: 40000, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }
    },
      /*#__PURE__*/React.createElement("div", {
        onClick: e => e.stopPropagation(),
        style: {
          position: 'relative', width: '100%', maxWidth: '480px', maxHeight: '85vh',
          backgroundColor: 'var(--bg-card)', borderRadius: '16px 16px 0 0', padding: '20px',
          display: 'flex', flexDirection: 'column', gap: '10px', boxSizing: 'border-box'
        }
      },
        /*#__PURE__*/React.createElement("button", {
          type: "button", onClick: onClose, "aria-label": "닫기",
          style: {
            position: 'absolute', top: '12px', right: '12px', zIndex: 1,
            width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: 'none', borderRadius: 'var(--radius-full)', cursor: 'pointer',
            backgroundColor: 'rgba(0,0,0,0.45)', color: '#fff'
          }
        }, SmallXIcon ? /*#__PURE__*/React.createElement(SmallXIcon, { size: 18 }) : "✕"),
        item.image && /*#__PURE__*/React.createElement("img", {
          src: item.image, alt: item.title, loading: 'lazy',
          style: { width: '100%', maxHeight: '260px', objectFit: 'contain', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-primary)', flexShrink: 0 },
          onError: e => { e.currentTarget.style.display = 'none'; }
        }),
        /*#__PURE__*/React.createElement("div", { style: { fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', flexShrink: 0, paddingRight: '36px' } }, item.title),
        /*#__PURE__*/React.createElement("div", {
          style: { flex: 1, minHeight: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }
        },
          [
            ['기간', item.dateLabel || formatCultureDateLabel(item.startDate, item.endDate) || item.startDate],
            ['장소', item.venue],
            ['주소', item.address],
            ['문의', item.contact],
            ['가격', item.price],
            ['감독', item.director],
            ['출연', Array.isArray(item.cast) ? item.cast.join(', ') : item.cast]
          ].filter(([, value]) => value && String(value).trim())
            .map(([label, value]) => /*#__PURE__*/React.createElement("div", {
              key: label, style: { display: 'flex', gap: '8px', fontSize: 'var(--font-size-sm)' }
            },
              /*#__PURE__*/React.createElement("span", { style: { flexShrink: 0, width: '84px', color: 'var(--text-muted)', fontWeight: 700 } }, label),
              /*#__PURE__*/React.createElement("span", { style: { color: 'var(--text-main)', wordBreak: 'break-word' } }, value)
            )),
          item.description && /*#__PURE__*/React.createElement("div", {
            style: { fontSize: 'var(--font-size-sm)', color: 'var(--text-main)', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }
          }, item.description)
        ),
        /*#__PURE__*/React.createElement("div", {
          style: { fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', textAlign: 'center', flexShrink: 0 }
        }, "다른 사람이 공유한 컨텐츠입니다. 내 캘린더에 등록하려면 컨텐츠 등록 화면의 '붙여넣기'를 사용하세요."),
        (() => {
          const detailUrl = resolveCultureDetailUrl(item);
          if (!detailUrl) return null;
          return /*#__PURE__*/React.createElement("a", {
            href: detailUrl, target: "_blank", rel: "noopener noreferrer",
            style: {
              display: 'block', flexShrink: 0, textAlign: 'center', padding: '10px', borderRadius: 'var(--radius-md)',
              backgroundColor: '#7C3AED', color: '#fff', fontWeight: 800, fontSize: 'var(--font-size-md)', textDecoration: 'none'
            }
          }, "자세히보기");
        })()
      )
    ),
    document.body
  );
}

  if (typeof window !== 'undefined') {
  window.GATHER_UI_COMPONENTS = Object.assign({}, window.GATHER_UI_COMPONENTS || {}, {
    SharedContentPreviewModal: SharedContentPreviewModal,
    SectionCountBadge: SectionCountBadge,
    SectionToggleButton: SectionToggleButton,
    SearchCategoryTabs: SearchCategoryTabs,
    SimpleBottomSheetPicker: SimpleBottomSheetPicker,
    ParticipantBackdrop: ParticipantBackdrop,
    PhotoGallery: PhotoGallery,
    MemoPreviewSection: MemoPreviewSection,
    SummaryList: SummaryList,
    HistoryView: HistoryView,
    ContentView: ContentView,
    CulturePerformancesTab: CulturePerformancesTab,
    ContentRegisterModal: ContentRegisterModal,
    RegionFilterBackdrop: RegionFilterBackdrop,
  });
}
