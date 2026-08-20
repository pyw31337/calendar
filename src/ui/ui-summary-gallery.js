/**
 * Summary list, photo gallery, category tabs (P4-11)
 */

/* P6 ESM classic-compat: free names that live scripts shared via global lexical scope */
const GATHER_APP_CALENDAR_DATA = window.GATHER_APP_CALENDAR_DATA || {};
const GATHER_APP_CHAT_DATA = window.GATHER_APP_CHAT_DATA || {};
const GATHER_APP_UTILS = window.GATHER_APP_UTILS || {};
const GATHER_APP_CONSTANTS = window.GATHER_APP_CONSTANTS || {};
const GATHER_APP_CONFIG = window.GATHER_APP_CONFIG || {};
function __gatherUiDeps() { return window.GATHER_UI_DEPS || {}; }
function getActiveAvailabilities(calendar) {
  const f = __gatherUiDeps().getActiveAvailabilities || GATHER_APP_UTILS.getActiveAvailabilities;
  return typeof f === 'function' ? f(calendar) : [];
}
function getActiveParticipants(calendar) {
  const f = __gatherUiDeps().getActiveParticipants || GATHER_APP_UTILS.getActiveParticipants;
  return typeof f === 'function' ? f(calendar) : [];
}
function getCalendarPolls(calendar) {
  const f = __gatherUiDeps().getCalendarPolls || GATHER_APP_UTILS.getCalendarPolls;
  return typeof f === 'function' ? f(calendar) : [];
}
function getCalendarPlaces(calendar) {
  const f = __gatherUiDeps().getCalendarPlaces || GATHER_APP_UTILS.getCalendarPlaces;
  return typeof f === 'function' ? f(calendar) : [];
}
function useChatSendGuard(onSend, canSend) {
  const f = __gatherUiDeps().useChatSendGuard;
  return typeof f === 'function' ? f(onSend, canSend) : onSend;
}
function computeKoreanHolidaysForYear(year) {
  const f = __gatherUiDeps().computeKoreanHolidaysForYear;
  return typeof f === 'function' ? f(year) : [];
}
function getFooterFamilyLinks() {
  return __gatherUiDeps().FOOTER_FAMILY_LINKS || [];
}

function getKoreanSolarTermsForYear(...args) {
  const f = __gatherUiDeps().getKoreanSolarTermsForYear || GATHER_APP_UTILS.getKoreanSolarTermsForYear;
  return typeof f === 'function' ? f(...args) : undefined;
}
function useTapRevealedMsgId(...args) {
  const f = __gatherUiDeps().useTapRevealedMsgId || GATHER_APP_UTILS.useTapRevealedMsgId;
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
function getHolidayNamesForDate(...args) {
  const f = __gatherUiDeps().getHolidayNamesForDate || GATHER_APP_UTILS.getHolidayNamesForDate;
  return typeof f === 'function' ? f(...args) : undefined;
}
function getAnniversariesForDate(...args) {
  const f = __gatherUiDeps().getAnniversariesForDate || GATHER_APP_UTILS.getAnniversariesForDate;
  return typeof f === 'function' ? f(...args) : undefined;
}
function getPinnedNotices(...args) {
  const f = __gatherUiDeps().getPinnedNotices || GATHER_APP_UTILS.getPinnedNotices;
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
function renderTextWithUrlBadge(...args) {
  const f = __gatherUiDeps().renderTextWithUrlBadge || GATHER_APP_UTILS.renderTextWithUrlBadge;
  return typeof f === 'function' ? f(...args) : undefined;
}
function renderChatMessageBody(...args) {
  const f = __gatherUiDeps().renderChatMessageBody || GATHER_APP_UTILS.renderChatMessageBody;
  return typeof f === 'function' ? f(...args) : undefined;
}
function parseTextWithLinks(...args) {
  const f = __gatherUiDeps().parseTextWithLinks || GATHER_APP_UTILS.parseTextWithLinks;
  return typeof f === 'function' ? f(...args) : undefined;
}
function highlightKeyword(...args) {
  const f = __gatherUiDeps().highlightKeyword || GATHER_APP_UTILS.highlightKeyword;
  return typeof f === 'function' ? f(...args) : undefined;
}
function highlightTextWithYellowMarker(...args) {
  const f = __gatherUiDeps().highlightTextWithYellowMarker || GATHER_APP_UTILS.highlightTextWithYellowMarker;
  return typeof f === 'function' ? f(...args) : undefined;
}
function copyTextToClipboard(...args) {
  const f = __gatherUiDeps().copyTextToClipboard || GATHER_APP_UTILS.copyTextToClipboard;
  return typeof f === 'function' ? f(...args) : undefined;
}
function getCalendarShareUrl(...args) {
  const f = __gatherUiDeps().getCalendarShareUrl || GATHER_APP_UTILS.getCalendarShareUrl;
  return typeof f === 'function' ? f(...args) : undefined;
}
function getViewShareUrl(...args) {
  const f = __gatherUiDeps().getViewShareUrl || GATHER_APP_UTILS.getViewShareUrl;
  return typeof f === 'function' ? f(...args) : undefined;
}
function getMemoItemShareUrl(...args) {
  const f = __gatherUiDeps().getMemoItemShareUrl || GATHER_APP_UTILS.getMemoItemShareUrl;
  return typeof f === 'function' ? f(...args) : undefined;
}
function buildLightboxImageInfo(...args) {
  const f = __gatherUiDeps().buildLightboxImageInfo || GATHER_APP_UTILS.buildLightboxImageInfo;
  return typeof f === 'function' ? f(...args) : undefined;
}
function normalizeTagsForDisplay(...args) {
  const f = __gatherUiDeps().normalizeTagsForDisplay || GATHER_APP_UTILS.normalizeTagsForDisplay;
  return typeof f === 'function' ? f(...args) : undefined;
}
function getRecentEmojis(...args) {
  const f = __gatherUiDeps().getRecentEmojis || GATHER_APP_UTILS.getRecentEmojis;
  return typeof f === 'function' ? f(...args) : undefined;
}
function addRecentEmoji(...args) {
  const f = __gatherUiDeps().addRecentEmoji || GATHER_APP_UTILS.addRecentEmoji;
  return typeof f === 'function' ? f(...args) : undefined;
}
function fetchLinkPreview(...args) {
  const f = __gatherUiDeps().fetchLinkPreview || GATHER_APP_UTILS.fetchLinkPreview;
  return typeof f === 'function' ? f(...args) : undefined;
}
function useLinkPreview(...args) {
  const f = __gatherUiDeps().useLinkPreview || GATHER_APP_UTILS.useLinkPreview;
  return typeof f === 'function' ? f(...args) : undefined;
}
function useScrollHideHeader(...args) {
  const f = __gatherUiDeps().useScrollHideHeader || GATHER_APP_UTILS.useScrollHideHeader;
  return typeof f === 'function' ? f(...args) : undefined;
}
function loadLeaflet(...args) {
  const f = __gatherUiDeps().loadLeaflet || GATHER_APP_UTILS.loadLeaflet;
  return typeof f === 'function' ? f(...args) : undefined;
}
function loadLeafletMarkerCluster(...args) {
  const f = __gatherUiDeps().loadLeafletMarkerCluster || GATHER_APP_UTILS.loadLeafletMarkerCluster;
  return typeof f === 'function' ? f(...args) : undefined;
}
function buildPlaceMarkerHtml(...args) {
  const f = __gatherUiDeps().buildPlaceMarkerHtml || GATHER_APP_UTILS.buildPlaceMarkerHtml;
  return typeof f === 'function' ? f(...args) : undefined;
}
function panMapToFitMarkerPopup(...args) {
  const f = __gatherUiDeps().panMapToFitMarkerPopup || GATHER_APP_UTILS.panMapToFitMarkerPopup;
  return typeof f === 'function' ? f(...args) : undefined;
}
function getPlaceCategories(...args) {
  const f = __gatherUiDeps().getPlaceCategories || GATHER_APP_UTILS.getPlaceCategories;
  return typeof f === 'function' ? f(...args) : undefined;
}
function getPlaceSortDateKey(...args) {
  const f = __gatherUiDeps().getPlaceSortDateKey || GATHER_APP_UTILS.getPlaceSortDateKey;
  return typeof f === 'function' ? f(...args) : undefined;
}
function getPlaceExternalMapUrl(...args) {
  const f = __gatherUiDeps().getPlaceExternalMapUrl || GATHER_APP_UTILS.getPlaceExternalMapUrl;
  return typeof f === 'function' ? f(...args) : undefined;
}
function extractKnownParticipantNames(...args) {
  const f = __gatherUiDeps().extractKnownParticipantNames || GATHER_APP_UTILS.extractKnownParticipantNames;
  return typeof f === 'function' ? f(...args) : undefined;
}
function getChatLastReadTimestamp(...args) {
  const f = __gatherUiDeps().getChatLastReadTimestamp || GATHER_APP_UTILS.getChatLastReadTimestamp;
  return typeof f === 'function' ? f(...args) : undefined;
}
function setChatLastReadTimestamp(...args) {
  const f = __gatherUiDeps().setChatLastReadTimestamp || GATHER_APP_UTILS.setChatLastReadTimestamp;
  return typeof f === 'function' ? f(...args) : undefined;
}
function isDateConfirmedMeeting(...args) {
  const f = __gatherUiDeps().isDateConfirmedMeeting || GATHER_APP_UTILS.isDateConfirmedMeeting;
  return typeof f === 'function' ? f(...args) : undefined;
}
function calculateDday(...args) {
  const f = __gatherUiDeps().calculateDday || GATHER_APP_UTILS.calculateDday;
  return typeof f === 'function' ? f(...args) : undefined;
}
function formatChatHeaderTitle(...args) {
  const f = __gatherUiDeps().formatChatHeaderTitle || GATHER_APP_UTILS.formatChatHeaderTitle;
  return typeof f === 'function' ? f(...args) : undefined;
}
function getShortTitleParts(...args) {
  const f = __gatherUiDeps().getShortTitleParts || GATHER_APP_UTILS.getShortTitleParts;
  return typeof f === 'function' ? f(...args) : undefined;
}
function isEmojiOnlyChatText(...args) {
  const f = __gatherUiDeps().isEmojiOnlyChatText || GATHER_APP_UTILS.isEmojiOnlyChatText;
  return typeof f === 'function' ? f(...args) : undefined;
}
function twemojiImageUrl(...args) {
  const f = __gatherUiDeps().twemojiImageUrl || GATHER_APP_UTILS.twemojiImageUrl;
  return typeof f === 'function' ? f(...args) : undefined;
}
function getDirectChatMediaInfo(...args) {
  const f = __gatherUiDeps().getDirectChatMediaInfo || GATHER_APP_UTILS.getDirectChatMediaInfo;
  return typeof f === 'function' ? f(...args) : undefined;
}
function getPollOptionVoterIds(...args) {
  const f = __gatherUiDeps().getPollOptionVoterIds || GATHER_APP_UTILS.getPollOptionVoterIds;
  return typeof f === 'function' ? f(...args) : undefined;
}
function getPollTotalVoteCount(...args) {
  const f = __gatherUiDeps().getPollTotalVoteCount || GATHER_APP_UTILS.getPollTotalVoteCount;
  return typeof f === 'function' ? f(...args) : undefined;
}
function getCalendarActivityLogs(...args) {
  const f = __gatherUiDeps().getCalendarActivityLogs || GATHER_APP_UTILS.getCalendarActivityLogs;
  return typeof f === 'function' ? f(...args) : undefined;
}
function getCalendarAccentColor(...args) {
  const f = __gatherUiDeps().getCalendarAccentColor || GATHER_APP_UTILS.getCalendarAccentColor;
  return typeof f === 'function' ? f(...args) : undefined;
}
function getAnniversaryDisplayColor(...args) {
  const f = __gatherUiDeps().getAnniversaryDisplayColor || GATHER_APP_UTILS.getAnniversaryDisplayColor;
  return typeof f === 'function' ? f(...args) : undefined;
}


export function SectionCountBadge({ count }) {
  const React = window.React;

  return /*#__PURE__*/React.createElement("span", {
    className: "section-count-badge"
  }, count);
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
    "stroke-width": "2",
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
    className: "icon icon-tabler icons-tabler-outline icon-tabler-chevron-down"
  }, /*#__PURE__*/React.createElement("path", {
    stroke: "none",
    d: "M0 0h24v24H0z",
    fill: "none"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M6 9l6 6l6 -6"
  })));
}

export function SearchCategoryTabs({ tabs, activeKey, onSelect, containerStyle, tabPadding, tabTextStyle, countBadgeClassName, countBadgeStyle }) {
  const React = window.React;

  return /*#__PURE__*/React.createElement("div", {
    style: { display: 'grid', gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))`, overflow: 'hidden', borderBottom: '1px solid #E2E8F0', ...containerStyle }
  }, tabs.map(tab => /*#__PURE__*/React.createElement("button", {
    key: tab.key,
    type: "button",
    onClick: () => onSelect(tab.key),
    style: {
      minWidth: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
      padding: tabPadding || '10px 4px', fontSize: '0.82rem', fontWeight: 800,
      background: 'none', border: 'none', cursor: 'pointer',
      color: activeKey === tab.key ? '#2563EB' : '#64748B',
      borderBottom: activeKey === tab.key ? '3px solid #2563EB' : '3px solid transparent',
      marginBottom: '-1px',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      ...tabTextStyle
    }
  }, tab.label, countBadgeClassName
    ? /*#__PURE__*/React.createElement("span", { className: countBadgeClassName, style: countBadgeStyle }, tab.count)
    : /*#__PURE__*/React.createElement("span", {
        style: {
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: '18px', height: '18px',
          borderRadius: '50%', backgroundColor: activeKey === tab.key ? '#2563EB' : '#E2E8F0',
          color: activeKey === tab.key ? '#FFFFFF' : '#475569', fontSize: '0.68rem', fontWeight: 'bold', padding: '0 4px',
          ...countBadgeStyle
        }
      }, tab.count))));
}

export function SimpleBottomSheetPicker({ title, value, options, onSelect, placeholder, disabled, style, className = "form-select" }) {
  const React = window.React;

  const [isOpen, setIsOpen] = React.useState(false);
  const safeOptions = Array.isArray(options) ? options : [];
  const selected = safeOptions.find(o => o.value === value);
  const sheet = isOpen && /*#__PURE__*/React.createElement("div", {
    className: "bottom-sheet-overlay",
    onClick: () => setIsOpen(false)
  }, /*#__PURE__*/React.createElement("div", {
    className: "bottom-sheet",
    onClick: e => e.stopPropagation()
  },
    /*#__PURE__*/React.createElement("div", { className: "bottom-sheet-header" },
      /*#__PURE__*/React.createElement("h4", null, title),
      /*#__PURE__*/React.createElement("button", {
        type: "button",
        style: { background: 'none', border: 'none', color: '#64748B', fontSize: '1.2rem', cursor: 'pointer' },
        onClick: () => setIsOpen(false)
      }, "✕")
    ),
    /*#__PURE__*/React.createElement("div", { className: "bottom-sheet-body" },
      safeOptions.map(opt => /*#__PURE__*/React.createElement("button", {
        key: opt.value,
        type: "button",
        className: "bottom-sheet-item",
        onClick: () => { onSelect(opt.value); setIsOpen(false); }
      }, opt.label))
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
      /*#__PURE__*/React.createElement("span", { style: { minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, selected ? selected.label : placeholder),
      /*#__PURE__*/React.createElement("svg", {
        xmlns: "http://www.w3.org/2000/svg",
        width: "18",
        height: "18",
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        "stroke-width": "2",
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
        className: "icon icon-tabler icons-tabler-outline icon-tabler-chevron-down",
        style: { flexShrink: 0, color: '#94A3B8' }
      }, /*#__PURE__*/React.createElement("path", { stroke: "none", d: "M0 0h24v24H0z", fill: "none" }),
        /*#__PURE__*/React.createElement("path", { d: "M6 9l6 6l6 -6" }))
    ),
    sheet && typeof document !== 'undefined' && ReactDOM.createPortal ? ReactDOM.createPortal(sheet, document.body) : sheet
  );
}

export function PhotoGallery({ chatMessages, totalGalleryCount, onViewAll, showToast, onPromoteImageUrl, onSaveImageTags, onSearchTag }) {
  const React = window.React;
  const __deps = window.GATHER_UI_DEPS || {};
  const __comp = window.GATHER_UI_COMPONENTS || {};
  const GalleryIcon = __deps.GalleryIcon;
  const Lightbox = __comp.Lightbox || __deps.Lightbox;
  const SectionCountBadge = __comp.SectionCountBadge;
  const SectionToggleButton = __comp.SectionToggleButton;

  const [collapsed, setCollapsed] = React.useState(false);
  const [lightbox, setLightbox] = React.useState(null);

  const photoEntries = React.useMemo(() => {
    const sorted = [...(chatMessages || [])].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    return sorted.flatMap(msg => {
      const directEntry = getMessageDirectMediaEntry(msg);
      const entries = directEntry ? [...getMessageImageEntries(msg), directEntry] : getMessageImageEntries(msg);
      return entries.map((entry, i) => ({
        ...entry,
        key: `${msg.id}_${entry.directMediaUrl ? 'direct' : i}`,
        timestamp: msg.timestamp
      }));
    });
  }, [chatMessages]);

  const badgeCount = (typeof totalGalleryCount === 'number' && totalGalleryCount > 0)
    ? totalGalleryCount
    : photoEntries.length;
  const displayedEntries = photoEntries
    .filter(e => (e && ((e.thumb && String(e.thumb)) || (e.full && String(e.full)))))
    .slice(0, 12);
  const openGalleryPage = () => { if (typeof onViewAll === 'function') onViewAll(); };

  if (photoEntries.length === 0 && !(typeof totalGalleryCount === 'number' && totalGalleryCount > 0)) return null;

  return /*#__PURE__*/React.createElement("section", { className: "summary-card" },
    /*#__PURE__*/React.createElement("div", {
      className: `summary-title${collapsed ? ' is-collapsed' : ''}`,
      style: { display: 'flex', alignItems: 'center', gap: '6px', width: '100%' }
    },
      /*#__PURE__*/React.createElement("div", {
        style: { display: 'flex', alignItems: 'center', gap: '6px', flex: 1, minWidth: 0 }
      },
        /*#__PURE__*/React.createElement(GalleryIcon, null),
        /*#__PURE__*/React.createElement("span", null, "갤러리"),
        badgeCount > 0 && /*#__PURE__*/React.createElement(SectionCountBadge, { count: badgeCount })
      ),
      /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: e => { e.stopPropagation(); openGalleryPage(); },
        style: {
          border: 'none', background: 'transparent', cursor: 'pointer',
          color: '#3B82F6', fontSize: '0.82rem', fontWeight: 700, padding: '4px 6px', flexShrink: 0
        }
      }, "전체보기"),
      /*#__PURE__*/React.createElement(SectionToggleButton, {
        collapsed,
        onToggle: () => setCollapsed(prev => !prev),
        label: collapsed ? '갤러리 펼치기' : '갤러리 접기'
      })
    ),
    !collapsed && displayedEntries.length > 0 && /*#__PURE__*/React.createElement(React.Fragment, null,
      /*#__PURE__*/React.createElement("div", {
        style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(80px, 100%), 1fr))', gap: '6px', marginTop: '12px' }
      },
        displayedEntries.map((entry, idx) => /*#__PURE__*/React.createElement("img", {
          key: entry.key,
          src: (entry.thumb && String(entry.thumb)) || (entry.full && String(entry.full)) || '',
          alt: "채팅에 첨부된 사진",
          loading: "lazy",
          decoding: "async",
          referrerPolicy: 'no-referrer',
          onClick: () => setLightbox({
            urls: displayedEntries.map(e => e.full),
            meta: displayedEntries.map(e => ({ timestamp: e.timestamp, messageId: e.messageId, imageIndex: e.imageIndex, thumb: e.thumb, tags: e.tags, directMediaUrl: e.directMediaUrl })),
            index: idx
          }),
          style: { width: '100%', aspectRatio: '1 / 1', objectFit: 'cover', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }
        }))
      ),
      /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: openGalleryPage,
        style: {
          width: '100%',
          backgroundColor: 'color-mix(in srgb, var(--bg-primary) 96%, black)',
          border: 'none',
          borderRadius: '8px',
          padding: '8px 0',
          marginTop: '10px',
          fontSize: '0.85rem',
          fontWeight: 'bold',
          color: 'var(--text-main)',
          cursor: 'pointer',
          textAlign: 'center'
        }
      }, "갤러리 더보기")
    ),
    lightbox && /*#__PURE__*/React.createElement(Lightbox, {
      urls: lightbox.urls,
      index: lightbox.index,
      meta: lightbox.meta,
      onClose: () => setLightbox(null),
      onNavigate: i => setLightbox(prev => prev ? { ...prev, index: i } : prev),
      showToast,
      onPromoteImageUrl,
      onSaveImageTags,
      onSearchTag
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
    const entries = dateMap[d].filter(e => participantsMap[e.participantId]);
    const uniqueParticipants = new Set(entries.map(e => e.participantId));
    return totalCount > 0 && uniqueParticipants.size === totalCount;
  });
  const allAvailableSet = new Set(allAvailableDates);

  // 2. Partial-available dates (MIN_THRESHOLD <= availCount < totalCount), excluding all-available
  const partialAvailableDates = thresholdN > 0 ? Object.keys(dateMap).filter(d => {
    if (allAvailableSet.has(d)) return false;
    const entries = dateMap[d].filter(e => participantsMap[e.participantId]);
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
  const confirmedDates = getSortedDates(getTrulyConfirmedMeetings(calendar).map(m => m.date));

  // '6인 이상 참석 가능' / '전원 참석 가능' / '모임 확정' only ever show when they have at least
  // one matching date -- an empty one hides its title entirely rather than rendering a
  // placeholder. Track which sections are actually visible so dividers between them only
  // appear between two sections that both render.
  const isPartialVisible = thresholdN > 0 && sortedPartialDates.length > 0;
  const isAllVisible = sortedAllDates.length > 0;
  const isConfirmedVisible = confirmedDates.length > 0;
  const anyBeforeAll = isPartialVisible;
  const anyBeforeConfirmed = isPartialVisible || isAllVisible;

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
    "stroke-width": "2.5",
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
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
    const dateEntries = (dateMap[d] || []).filter(e => participantsMap[e.participantId] && !isTombstone(e));
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
      const p = participantsMap[e.participantId];
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
    style: {
      color: '#10B981',
      marginBottom: '12px'
    }
  }, /*#__PURE__*/React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    width: "20",
    height: "20",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    "stroke-width": "2.5",
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
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
      fontSize: '0.85rem',
      padding: '10px 0'
    }
  }, "\uC544\uC9C1 \uCC38\uC5EC\uC790 \uC804\uC6D0\uC774 \uAC00\uB2A5\uD55C \uB0A0\uC9DC\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4. \uCE98\uB9B0\uB354\uC5D0\uC11C \uB0A0\uC9DC\uB97C \uC120\uD0DD\uD558\uC5EC \uAC00\uB2A5 \uC5EC\uBD80\uB97C \uD45C\uAE30\uD574\uBCF4\uC138\uC694!") : /*#__PURE__*/React.createElement("div", null, sortedAllDates.slice(0, allListLimit).map(d => {
    const dateEntries = (dateMap[d] || []).filter(e => participantsMap[e.participantId] && !isTombstone(e));
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
        color: isPast ? '#94A3B8' : '#10B981',
        fontSize: '0.95rem',
        flexShrink: 0
      }
    }, formattedDateStr), /*#__PURE__*/React.createElement("span", {
      className: `date-item-badge ${isPast ? 'is-past' : 'is-all'}`,
      style: {
        background: isPast ? '#E2E8F0' : '#10B981',
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
      const p = participantsMap[e.participantId];
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
          border: 'none', borderRadius: '8px',
          backgroundColor: 'color-mix(in srgb, var(--bg-primary) 96%, black)',
          color: 'var(--text-main)', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', textAlign: 'center'
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
    "stroke-width": "2.5",
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
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
    const dateEntries = (dateMap[d] || []).filter(e => participantsMap[e.participantId] && !isTombstone(e));
    const formattedDateStr = formatDateWithDayName(d);
    const memoEntries = dateEntries.filter(e => e.note && e.note.trim().length > 0);
    const isPast = d < todayStr;
    return /*#__PURE__*/React.createElement("button", {
      key: d,
      className: `date-item-btn ${isPast ? 'is-past' : 'is-confirmed'}`,
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
        color: isPast ? '#94A3B8' : '#7C3AED',
        fontSize: '0.95rem',
        flexShrink: 0
      }
    }, formattedDateStr), /*#__PURE__*/React.createElement("span", {
      className: `date-item-badge ${isPast ? 'is-past' : 'is-confirmed'}`,
      style: {
        background: isPast ? '#E2E8F0' : '#F3E8FF',
        color: isPast ? '#64748B' : '#7C3AED',
        border: isPast ? 'none' : '1px solid #E9D5FF',
        flexShrink: 0
      }
    }, isPast ? '지나간 모임' : '확정')), memoEntries.length > 0 && /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        flexWrap: 'wrap'
      }
    }, memoEntries.map(e => {
      const p = participantsMap[e.participantId];
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
      const total = confirmedDates.length;
      const shown = Math.min(confirmedListLimit, total);
      if (!(total > shown)) return null;
      const step = SUMMARY_LIST_PAGE;
      return /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: () => setConfirmedListLimit(prev => prev + step),
        style: {
          width: '100%', marginTop: '4px', marginBottom: '6px', padding: '10px 0',
          border: 'none', borderRadius: '8px',
          backgroundColor: 'color-mix(in srgb, var(--bg-primary) 96%, black)',
          color: 'var(--text-main)', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', textAlign: 'center'
        }
      }, `더보기 (총 ${total}개 중 ${shown}개)`);
    })()))));
}

  if (typeof window !== 'undefined') {
  window.GATHER_UI_COMPONENTS = Object.assign({}, window.GATHER_UI_COMPONENTS || {}, {
    SectionCountBadge: SectionCountBadge,
    SectionToggleButton: SectionToggleButton,
    SearchCategoryTabs: SearchCategoryTabs,
    SimpleBottomSheetPicker: SimpleBottomSheetPicker,
    PhotoGallery: PhotoGallery,
    SummaryList: SummaryList,
  });
}
