/**
 * Chat / gallery modal (P4-13)
 */

import { composeGalleryPhotos, getPaginationWindow } from '../core/gallery-data.js';
import { resolveGalleryLightboxTags } from '../core/photo-index.js';

/* P6 ESM classic-compat: free names that live scripts shared via global lexical scope */
const GATHER_APP_UTILS = window.GATHER_APP_UTILS || {};
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
function extractAllUrlInfosLoose(...args) {
  const f = __gatherUiDeps().extractAllUrlInfosLoose || GATHER_APP_UTILS.extractAllUrlInfosLoose;
  return typeof f === 'function' ? f(...args) : [];
}
function getDirectMediaTagKey(...args) {
  const f = __gatherUiDeps().getDirectMediaTagKey || GATHER_APP_UTILS.getDirectMediaTagKey;
  return typeof f === 'function' ? f(...args) : '';
}
function formatShortDateWithDayName(...args) {
  const f = __gatherUiDeps().formatShortDateWithDayName || GATHER_APP_UTILS.formatShortDateWithDayName;
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
function highlightKeyword(...args) {
  const f = __gatherUiDeps().highlightKeyword || GATHER_APP_UTILS.highlightKeyword;
  return typeof f === 'function' ? f(...args) : args[0];
}
function removeFirstUrl(...args) {
  const f = __gatherUiDeps().removeFirstUrl || GATHER_APP_UTILS.removeFirstUrl;
  return typeof f === 'function' ? f(...args) : undefined;
}
function getImageFilesFromClipboardEvent(...args) {
  const f = __gatherUiDeps().getImageFilesFromClipboardEvent || GATHER_APP_UTILS.getImageFilesFromClipboardEvent;
  return typeof f === 'function' ? f(...args) : undefined;
}
function readClipboardImageFiles(...args) {
  const f = __gatherUiDeps().readClipboardImageFiles || GATHER_APP_UTILS.readClipboardImageFiles;
  return typeof f === 'function' ? f(...args) : Promise.resolve([]);
}
function getConfirmedMeetings(...args) {
  const f = __gatherUiDeps().getConfirmedMeetings || GATHER_APP_UTILS.getConfirmedMeetings;
  return typeof f === 'function' ? f(...args) : undefined;
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
function getDirectChatMediaInfo(...args) {
  const f = __gatherUiDeps().getDirectChatMediaInfo || GATHER_APP_UTILS.getDirectChatMediaInfo;
  return typeof f === 'function' ? f(...args) : undefined;
}
function getDirectMediaTagsForUrl(...args) {
  const f = __gatherUiDeps().getDirectMediaTagsForUrl || GATHER_APP_UTILS.getDirectMediaTagsForUrl;
  return typeof f === 'function' ? f(...args) : '';
}
// Generalizes getMessageDirectMediaEntry (which only ever returned the FIRST externally-linked
// image in a message) to every recognized image link in the text -- a message pasted with several
// external image links (see DirectChatMediaText's multi-image grid in ui-remaining.js) needs every
// one of them to show up here too, not just the first, the same way a real multi-image upload
// already does via getMessageImageEntries.
function getAllDirectMediaImageEntries(msgLike) {
  if (!msgLike?.text) return [];
  const declaredSource = String(msgLike?.uploadSource || '').trim().toLowerCase();
  const sourceHint = ['chat', 'gallery', 'meeting', 'memo'].includes(declaredSource)
    ? declaredSource
    : 'chat';
  return extractAllUrlInfosLoose(msgLike.text)
    .filter(info => getDirectChatMediaInfo(info.url)?.type === 'image')
    .map((info, idx) => ({
      full: info.url,
      thumb: info.url,
      imageIndex: idx,
      messageId: msgLike.id,
      timestamp: msgLike.timestamp,
      tags: getDirectMediaTagsForUrl(msgLike, info.url),
      directMediaUrl: info.url,
      uploadSource: msgLike.uploadSource || null,
      source: sourceHint,
      mediaKey: `${sourceHint}:${msgLike.id || 'msg'}:direct:${getDirectMediaTagKey(info.url)}`,
      refKey: `${sourceHint}:${msgLike.id || 'msg'}:direct:${getDirectMediaTagKey(info.url)}`
    }));
}
// Tracks whether the OS clipboard currently holds an image, so a '붙여넣기' button can be
// disabled when there's nothing to paste. Browsers vary wildly here (Firefox has no image
// support for navigator.clipboard.read(), Safari/Chrome gate it behind the clipboard-read
// permission) -- this fails OPEN (button stays enabled) whenever the check itself is
// unsupported or inconclusive, and specifically avoids calling clipboard.read() while
// permission is still 'prompt' so merely rendering the button never pops a permission dialog.
function useClipboardHasImage(active) {
  return true;
}

// Module-level (not defined inside ChatGalleryModal's render body) on purpose: this used to be a
// component defined inline in ChatGalleryModal, which meant React saw a brand-new component type
// on every ChatGalleryModal re-render -- including the header show/hide state the scroll handler
// below flips constantly on mobile -- and remounted every visible link card. That wiped each
// card's local isVideoOpen state and tore down/rebuilt its DOM, which is what read as "the video
// suddenly closes" and "the screen jumps" while scrolling with a video open. A stable module-level
// function keeps each card's own state and DOM across ChatGalleryModal re-renders.
function GalleryLinkCard({ item, searchQuery = '' }) {
  const React = window.React;
  const __deps = window.GATHER_UI_DEPS || {};
  const __comp = window.GATHER_UI_COMPONENTS || {};
  const LinkPreviewCard = __deps.LinkPreviewCard || __comp.LinkPreviewCard;
  const ClickToPlayVideoCard = __comp.ClickToPlayVideoCard || __deps.ClickToPlayVideoCard;
  const SmallXIcon = __comp.SmallXIcon || __deps.SmallXIcon;
  const [isVideoOpen, setIsVideoOpen] = React.useState(false);
  const mediaInfo = getDirectChatMediaInfo(item.url);
  // Only media that actually plays inline here (YouTube/Vimeo embeds, direct video files) gets
  // the "영상 바로보기" toggle -- TikTok's façade just opens a new tab instead of playing on this
  // page, which read as the button lying/glitching.
  const isVideoMedia = !!(mediaInfo && mediaInfo.playsInline);
  const fallbackTitle = item.title || (item.text ? removeFirstUrl(item.text).replace(/\n/g, ' ').replace(/\s+/g, ' ').trim() : '');

  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      width: '100%',
      backgroundColor: 'var(--bg-card)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-md)',
      padding: '12px',
      boxSizing: 'border-box'
    }
  },
    fallbackTitle && /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '0.9rem',
        fontWeight: 700,
        color: 'var(--text-main)',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
      }
    }, highlightKeyword(fallbackTitle, searchQuery)),

    /* Primary Link Preview Card */
    /*#__PURE__*/React.createElement(LinkPreviewCard, {
      url: item.url,
      fallbackTitle: fallbackTitle,
      cachedData: item.linkPreview,
      stretch: true
    }),

    /* Video Toggle Button for video media */
    isVideoMedia && /*#__PURE__*/React.createElement("button", {
      type: "button",
      onClick: () => setIsVideoOpen(prev => !prev),
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
        width: '100%',
        height: '32px',
        minHeight: '32px',
        padding: '0 12px',
        marginTop: '2px',
        boxSizing: 'border-box',
        borderRadius: 'var(--radius-md)',
        border: isVideoOpen ? '1px solid var(--border-subtle)' : '1px solid var(--primary)',
        backgroundColor: isVideoOpen ? 'var(--bg-secondary)' : 'color-mix(in srgb, var(--primary) 10%, transparent)',
        color: isVideoOpen ? 'var(--text-muted)' : 'var(--primary)',
        fontSize: 'var(--font-size-md)',
        fontWeight: 700,
        cursor: 'pointer'
      }
    },
      isVideoOpen ? [
        SmallXIcon ? /*#__PURE__*/React.createElement(SmallXIcon, { size: 14 }) : null,
        " 영상 닫기"
      ] : [
        /*#__PURE__*/React.createElement("svg", {
          viewBox: "0 0 24 24", width: "14", height: "14", fill: "currentColor"
        }, /*#__PURE__*/React.createElement("path", { d: "M8 5v14l11-7z" })),
        " 영상 바로보기"
      ]
    ),

    /* Video Player when expanded */
    isVideoMedia && isVideoOpen && /*#__PURE__*/React.createElement("div", {
      style: { marginTop: '4px', width: '100%' }
    }, /*#__PURE__*/React.createElement(ClickToPlayVideoCard, {
      url: item.url,
      mediaInfo: mediaInfo,
      fallbackTitle: fallbackTitle,
      cachedData: item.linkPreview
    }))
  );
}

// 다른 캘린더의 라이트박스에서 "URL 복사하기"로 복사한 URL을 이 갤러리 페이지에 붙여넣을 때
// 쓰는 파서(ImageUrlModal, ui-remaining.js가 붙여넣은 대응 인코더). URL 자체는 그대로 두고
// 눈에 보이지 않는 프래그먼트(#gatherPhoto=<base64 JSON>)에 태그만 실어 보냈으므로, 여기서는
// 그 프래그먼트만 떼어내 태그를 복원하고 나머지(원본 URL)는 그대로 이미지 주소로 쓴다. 형식이
// 안 맞으면(다른 사이트에서 복사한 평범한 이미지 URL 등) null을 반환해 기존 "링크 추가" 등
// 다른 붙여넣기 경로로 자연스럽게 넘어가게 한다.
function parseGatherPhotoClipboardText(text) {
  const raw = String(text || '').trim();
  if (!/^https?:\/\//i.test(raw)) return null;
  const markerIndex = raw.indexOf('#gatherPhoto=');
  if (markerIndex === -1) return null;
  const url = raw.slice(0, markerIndex);
  const b64 = raw.slice(markerIndex + '#gatherPhoto='.length);
  try {
    const json = decodeURIComponent(escape(atob(b64)));
    const payload = JSON.parse(json);
    if (!payload || payload.kind !== 'gather-photo' || !url) return null;
    return { url, tags: String(payload.tags || '').trim() };
  } catch (_) {
    return null;
  }
}

// 여러 장을 한 번에 공유("일괄공유")할 때 쓰는 인코더/파서 -- 단일 사진과 달리 사진마다 URL이
// 달라 그 URL 자체를 프래그먼트 앞에 실을 수 없으므로, 이번엔 프래그먼트 안에 (URL, 태그) 쌍의
// 배열을 통째로 담는다. 프래그먼트 앞의 URL은 그냥 유효한 https 링크 형태를 갖추기 위한 것으로
// (현재 페이지 주소), 실제로 어느 사진의 URL도 아니다 -- 붙여넣는 쪽은 프래그먼트만 읽는다.
const GATHER_PHOTOS_FRAGMENT_PREFIX = '#gatherPhotos=';
function encodeGatherPhotosFragment(photos) {
  try {
    const payload = {
      v: 1,
      kind: 'gather-photos',
      photos: (photos || []).map(p => ({ url: String(p?.url || ''), tags: String(p?.tags || '').trim() })).filter(p => p.url)
    };
    if (!payload.photos.length) return '';
    const json = JSON.stringify(payload);
    const b64 = typeof btoa === 'function' ? btoa(unescape(encodeURIComponent(json))) : '';
    return b64 ? GATHER_PHOTOS_FRAGMENT_PREFIX + b64 : '';
  } catch (_) {
    return '';
  }
}
function parseGatherPhotosClipboardText(text) {
  const raw = String(text || '').trim();
  if (!/^https?:\/\//i.test(raw)) return null;
  const markerIndex = raw.indexOf(GATHER_PHOTOS_FRAGMENT_PREFIX);
  if (markerIndex === -1) return null;
  const b64 = raw.slice(markerIndex + GATHER_PHOTOS_FRAGMENT_PREFIX.length);
  try {
    const json = decodeURIComponent(escape(atob(b64)));
    const payload = JSON.parse(json);
    if (!payload || payload.kind !== 'gather-photos' || !Array.isArray(payload.photos)) return null;
    const photos = payload.photos
      .map(p => ({ url: String(p?.url || '').trim(), tags: String(p?.tags || '').trim() }))
      .filter(p => /^https?:\/\//i.test(p.url));
    return photos.length ? photos : null;
  } catch (_) {
    return null;
  }
}

export function ChatGalleryModal({
  chatMessages,
  memos = [],
  calendar = null,
  asPage = false,
  onClose,
  onUploadImages = null,
  onAddLink = null,
  onOpenShare = null,
  setActiveLightbox,
  hasMoreOlderChat = false,
  loadingOlderChat = false,
  onLoadOlderChat = null,
  hasMoreMemos = false,
  onLoadMoreMemos = null,
  isDarkTheme,
  onToggleTheme,
  fontScalePercent,
  onDecreaseFont,
  onIncreaseFont,
  isChatNotifyEnabled,
  onToggleChatNotifications,
  onOpenAppSettings = null,
  onChangeView = null,
  chatCount = 0,
  settlementBadge = null,
  galleryCount = 0,
  placeCount = 0,
  memoCount = 0,
  historyCount = 0,
  chatLastAuthor = null,
  settlementLastDate = null,
  galleryLastDate = null,
  placeLastName = null,
  memoLastTitleWord = null,
  showToast,
  onDeletePhoto = null,
  photoCommentCounts = {},
  indexedPhotos = null,
  indexedPhotoStatus = 'idle',
  indexedPhotoTotal = null,
  indexedPhotoPage = 1,
  indexedPhotoLoading = false,
  indexedPhotoComplete = false,
  onIndexedPhotoPageChange = null,
  onIndexedPhotoLoadAll = null,
  onPasteGatherPhoto = null,
  onPasteGatherPhotos = null,
  syncStatus = null
}) {
  const React = window.React;
  // The full-page gallery owns scrolling through .gallery-page-scroll.  Lock the document
  // underneath it so the browser cannot expose a second (outer) scrollbar beside the gallery's
  // intentional inner scrollbar, especially on desktop where the fixed shell still leaves the
  // app root's previous height in the layout.
  React.useEffect(() => {
    if (!asPage || typeof document === 'undefined') return undefined;
    const html = document.documentElement;
    const body = document.body;
    const previousHtmlOverflow = html.style.overflow;
    const previousBodyOverflow = body.style.overflow;
    html.style.overflow = 'hidden';
    body.style.overflow = 'hidden';
    return () => {
      html.style.overflow = previousHtmlOverflow;
      body.style.overflow = previousBodyOverflow;
    };
  }, [asPage]);
  const __deps = window.GATHER_UI_DEPS || {};
  const __comp = window.GATHER_UI_COMPONENTS || {};
  const ResizableModalContainer = __comp.ResizableModalContainer || __deps.ResizableModalContainer || (function Shell(p) { return React.createElement('div', p, p.children); });
  const SmallXIcon = __deps.SmallXIcon;
  const BackArrowIcon = __deps.BackArrowIcon;
  const PlusIcon = __comp.PlusIcon || __deps.PlusIcon;
  const PencilIcon = __comp.PencilIcon || __deps.PencilIcon;
  const PhotoCommentCountBadge = __comp.PhotoCommentCountBadge || __deps.PhotoCommentCountBadge || function InlinePhotoCommentCountBadge({ count = 0 } = {}) {
    if (!count) return null;
    return React.createElement('span', {
      className: 'photo-comment-count-badge',
      'aria-label': `댓글 ${count}개`,
      style: { position: 'absolute', top: '6px', right: '6px', zIndex: 3, minWidth: '24px', height: '24px', padding: '0 6px', borderRadius: '999px', background: 'rgba(15,23,42,0.78)', color: '#fff', fontSize: 'var(--font-size-xs)', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', lineHeight: 1 }
    }, String(count));
  };
  const getMediaIdentityKeys = __deps.getMediaIdentityKeys;
  const getLegacyMeetingMediaKey = __deps.getLegacyMeetingMediaKey;
    const SharedSideMenuFooter = __comp.SharedSideMenuFooter || __deps.SharedSideMenuFooter;
  const SharedAppNavBlock = __comp.SharedAppNavBlock || __deps.SharedAppNavBlock;
  const WeatherBadge = __comp.WeatherBadge || __deps.WeatherBadge;
  const InlineSearchBar = __comp.InlineSearchBar || __deps.InlineSearchBar;
  const UnderlineTabs = __comp.UnderlineTabs || __deps.UnderlineTabs;
  const FileAttachmentCard = __comp.FileAttachmentCard || __deps.FileAttachmentCard;
  const DocumentLightbox = __comp.DocumentLightbox || __deps.DocumentLightbox;
  const collectChatFileAttachmentsFromMessages = __deps.collectChatFileAttachmentsFromMessages || (window.GATHER_CHAT_FILE_ATTACHMENTS && window.GATHER_CHAT_FILE_ATTACHMENTS.collectChatFileAttachmentsFromMessages);
        const MenuIcon = __deps.MenuIcon || __comp.MenuIcon;
  const MediaThumb = __comp.MediaThumb || __deps.MediaThumb;
  const getMessageImageEntries = __deps.getMessageImageEntries;
  const resolveMeetingPhotoDisplay = __deps.resolveMeetingPhotoDisplay;
    const formatChatHeaderTitle = __deps.formatChatHeaderTitle;
    const CalendarCheckIcon = __comp.CalendarCheckIcon || __deps.CalendarCheckIcon;
  const SectionToggleButton = __comp.SectionToggleButton || __deps.SectionToggleButton;

  const [activeTab, setActiveTab] = React.useState('photos'); // 'photos' | 'links' | 'files'
  const [galleryDocLightbox, setGalleryDocLightbox] = React.useState(null);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  // Tracked as real state with a matchMedia listener (same pattern/breakpoint as ui-places.js's
  // isMobile) so the PC header filter vs. mobile select+tab row swap reacts live to resize/rotate
  // instead of only whatever this component happened to read on its first render.
  const [isMobile, setIsMobile] = React.useState(() => typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(max-width: 720px)').matches);
  React.useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined;
    const mq = window.matchMedia('(max-width: 720px)');
    const handleChange = () => setIsMobile(mq.matches);
    handleChange();
    if (mq.addEventListener) mq.addEventListener('change', handleChange);
    else if (mq.addListener) mq.addListener(handleChange);
    return () => {
      if (mq.removeEventListener) mq.removeEventListener('change', handleChange);
      else if (mq.removeListener) mq.removeListener(handleChange);
    };
  }, []);
  const uploadInputRef = React.useRef(null);
  const hasClipboardImage = useClipboardHasImage(true);
  const [pastePreview, setPastePreview] = React.useState(null); // { files, previewUrls } | null
  const [gatherPhotoPastePreview, setGatherPhotoPastePreview] = React.useState(null); // { url, tags } | null
  const [isSavingGatherPhotoPaste, setIsSavingGatherPhotoPaste] = React.useState(false);
  const [gatherPhotosPastePreview, setGatherPhotosPastePreview] = React.useState(null); // [{ url, tags }] | null
  const [isSavingGatherPhotosPaste, setIsSavingGatherPhotosPaste] = React.useState(false);
  // "편집" -> 일괄공유 모드: 사진 탭 썸네일마다 체크박스를 켜고, 고른 사진들을 태그와 함께
  // 하나의 URL로 묶어 다른 캘린더 갤러리에 붙여넣을 수 있게 한다(위 gather-photos 프래그먼트).
  const [isBulkShareMode, setIsBulkShareMode] = React.useState(false);
  const [selectedBulkShareKeys, setSelectedBulkShareKeys] = React.useState(() => new Set());
  const [isGeneratingBulkShareUrl, setIsGeneratingBulkShareUrl] = React.useState(false);
  const [bulkShareResultUrl, setBulkShareResultUrl] = React.useState('');
  const brokenPhotoKeysRef = React.useRef((GATHER_APP_UTILS.getPersistentBrokenPhotoUrls || (window.GATHER_APP_UTILS && window.GATHER_APP_UTILS.getPersistentBrokenPhotoUrls) || (() => new Set()))());
  const brokenPhotoUrlsRef = React.useRef((GATHER_APP_UTILS.getPersistentBrokenPhotoUrls || (window.GATHER_APP_UTILS && window.GATHER_APP_UTILS.getPersistentBrokenPhotoUrls) || (() => new Set()))());
  const [brokenPhotoRevision, setBrokenPhotoRevision] = React.useState(0);
  const getPhotoKey = photo => getPhotoAssetCommentKey(photo)
    || photo?.mediaKey
    || photo?.refKey
    || `${photo?.messageId || photo?.photoId || photo?.sourceMessageId || ''}_${photo?.imageIndex ?? photo?.sourceImageIndex ?? ''}`;
  const normalizeBrokenPhotoUrl = value => {
    const url = String(value || '').trim();
    if (!url) return '';
    return url.split(/[?#]/)[0];
  };
  const isBrokenPhotoValue = value => {
    const url = normalizeBrokenPhotoUrl(value);
    if (!url) return false;
    const persistent = (GATHER_APP_UTILS.getPersistentBrokenPhotoUrls || (window.GATHER_APP_UTILS && window.GATHER_APP_UTILS.getPersistentBrokenPhotoUrls) || (() => new Set()))();
    return brokenPhotoUrlsRef.current.has(url) || persistent.has(url);
  };
  const saveBrokenUrl = urlOrKey => {
    const saveFn = GATHER_APP_UTILS.savePersistentBrokenPhotoUrl || (window.GATHER_APP_UTILS && window.GATHER_APP_UTILS.savePersistentBrokenPhotoUrl);
    if (typeof saveFn === 'function') saveFn(urlOrKey);
  };
  const markBrokenPhoto = (photo, brokenInfo = {}) => {
    const key = photo?.mediaKey || photo?.refKey || getPhotoKey(photo);
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
  React.useEffect(() => () => {
    // Safety net if the component unmounts (e.g. gallery closed) while the preview is still open.
    if (pastePreview) pastePreview.previewUrls.forEach(url => { try { URL.revokeObjectURL(url); } catch (e) {} });
  }, [pastePreview]);
  // 창이 넓어지면 썸네일을 키우지 않고 단 수(2~12)를 늘린다. 셀 목표 너비 ~108px.
  const [gridCols, setGridCols] = React.useState(() => {
    const w = typeof window !== 'undefined' ? window.innerWidth : 400;
    const gap = 6;
    const target = 108;
    return Math.max(2, Math.min(12, Math.floor((w + gap) / (target + gap)) || 2));
  });
  const gridHostRef = React.useRef(null);
  const { isHeaderVisible, onScroll: handleGalleryScroll } = useScrollHideHeader();

  React.useEffect(() => {
    const computeCols = width => {
      const gap = 6;
      const targetCell = 108;
      const usable = Math.max(0, Number(width) || 0);
      const cols = Math.floor((usable + gap) / (targetCell + gap));
      return Math.max(2, Math.min(12, cols || 2));
    };
    const apply = width => setGridCols(prev => {
      const next = computeCols(Math.max(0, width || 0));
      return prev === next ? prev : next;
    });
    const el = gridHostRef.current;
    if (el && typeof ResizeObserver !== 'undefined') {
      const ro = new ResizeObserver(entries => {
        const w = entries[0]?.contentRect?.width;
        apply(w || el.clientWidth || window.innerWidth);
      });
      ro.observe(el);
      apply(el.clientWidth || window.innerWidth);
      return () => ro.disconnect();
    }
    const onWin = () => apply(window.innerWidth);
    onWin();
    window.addEventListener('resize', onWin);
    return () => window.removeEventListener('resize', onWin);
  }, [asPage, activeTab]);

  const sharedLinks = React.useMemo(() => {
    // Was extractFirstUrl -- a message or memo with several distinct links (not just a multi-image
    // link grid, any mix of URLs typed/pasted together) only ever contributed its first one here,
    // silently dropping the rest from this tab even though every one of them still renders its own
    // preview in the chat/memo itself. extractAllUrlInfosLoose surfaces all of them, INCLUDING a
    // bare domain with no http(s):// or www. prefix (e.g. a share-sheet link pasted as just
    // "naver.me/xxxx") -- that already rendered its own preview fine in chat/memo (via
    // extractFirstUrlInfo's looser single-link match) but was invisible to this tab entirely
    // under the stricter extractAllUrlInfos. Only the first URL per message reuses the cached
    // linkPreview (that cache is keyed to the message's first URL); the rest fetch their own
    // preview live the same way a fresh link normally would. Recognized image links are excluded
    // here -- those belong to the 사진 tab only (see sharedPhotos below), not duplicated as a
    // generic link card here too.
    const list = [];
    const seen = new Set();
    (chatMessages || []).forEach(msg => {
      if (!msg.text) return;
      let firstUrlSeen = false;
      extractAllUrlInfosLoose(msg.text).forEach(info => {
        if (!info.url || seen.has(info.url) || getDirectChatMediaInfo(info.url)?.type === 'image') return;
        seen.add(info.url);
        list.push({ url: info.url, timestamp: msg.timestamp, messageId: msg.id, text: msg.text, linkPreview: !firstUrlSeen ? msg.linkPreview : null, source: 'chat' });
        firstUrlSeen = true;
      });
    });
    (memos || []).forEach(memo => {
      const body = memo?.text || memo?.content || memo?.body || '';
      if (!body) return;
      if (!body || isTombstone(memo)) return;
      let firstUrlSeen = false;
      extractAllUrlInfosLoose(body).forEach(info => {
        if (!info.url || seen.has(info.url) || getDirectChatMediaInfo(info.url)?.type === 'image') return;
        seen.add(info.url);
        list.push({ url: info.url, timestamp: memo.updatedAt || memo.createdAt || 0, messageId: memo.id, title: memo.title || '', text: body, linkPreview: !firstUrlSeen ? (memo.linkPreview || null) : null, source: 'memo' });
        firstUrlSeen = true;
      });
    });
    getConfirmedMeetings(calendar).forEach(meeting => {
      const body = [meeting?.note, meeting?.memo, meeting?.description, meeting?.text].filter(Boolean).join('\n');
      if (!body) return;
      extractAllUrlInfosLoose(body).forEach(info => {
        if (!info.url || seen.has(info.url) || getDirectChatMediaInfo(info.url)?.type === 'image') return;
        seen.add(info.url);
        list.push({
          url: info.url, timestamp: meeting.updatedAt || meeting.confirmedAt || 0,
          messageId: `meeting:${meeting.date || ''}`, text: body, source: 'meeting',
          title: meeting.date ? `${meeting.date} 일정` : '일정'
        });
      });
    });
    return list.sort((a, b) => b.timestamp - a.timestamp);
  }, [chatMessages, memos, calendar]);

  const sharedPhotos = React.useMemo(() => {
    if (Array.isArray(indexedPhotos)) {
      return indexedPhotos
        .filter(photo => photo && !isBrokenPhotoValue(photo.full) && !isBrokenPhotoValue(photo.thumb))
        // Movie/sports (anniversary) posters belong in 컨텐츠, not gallery 사진.
        .filter(photo => {
          const source = String(photo.source || '').trim();
          if (source === 'anniversary') return false;
          return !String(photo.sourceOwner || '').startsWith('anniversary:');
        })
        .map(photo => {
          const source = photo.source || 'gallery';
          const imageIndex = Number.isInteger(photo.imageIndex)
            ? photo.imageIndex
            : (Number.isFinite(Number(photo.imageIndex)) ? Math.max(0, Math.round(Number(photo.imageIndex))) : 0);
          // Photo-index memo rows historically omitted messageId (''). Recover from sourceOwner
          // (`memo:<id>:<index>`) so lightbox tag save can resolve the memo document.
          let messageId = photo.messageId;
          if ((!messageId || messageId === '') && source === 'memo') {
            const owner = String(photo.sourceOwner || (Array.isArray(photo.owners) && photo.owners[0] && photo.owners[0].sourceOwner) || '');
            const match = owner.match(/^memo:([^:]+):/);
            if (match) messageId = match[1];
          }
          // Client cannot write photoIndex. CF denorm can lag empty OR partial (e.g. only
          // #260908 while message.imageTags still has the full save). Session sticky (verified
          // save this tab) wins over stale in-memory imageTags (unpatched galleryLive) and
          // empty/partial photoIndex; then the richer of local message/memo/meeting tags + index.
          const indexTags = String(photo.tags || '');
          let localTags = null;
          if (messageId) {
            if (source === 'memo') {
              const memo = (memos || []).find(row => row && row.id === messageId);
              if (memo && Array.isArray(memo.imageTags)) localTags = String(memo.imageTags[imageIndex] || '');
            } else if (photo.directMediaUrl) {
              const msg = (chatMessages || []).find(row => row && row.id === messageId);
              if (msg) localTags = String(getDirectMediaTagsForUrl(msg, photo.directMediaUrl) || '');
            } else {
              const msg = (chatMessages || []).find(row => row && row.id === messageId);
              if (msg && Array.isArray(msg.imageTags)) localTags = String(msg.imageTags[imageIndex] || '');
            }
          }
          // Meeting album copies store durable tags on confirmedMeetings.photos[].tags. After
          // rebuildPhotoIndex, the selected message owner can expose empty/partial imageTags for
          // the same asset — still consult the meeting-local tags so lightbox reopen stays full.
          if (source === 'meeting' || photo.meetingDate || photo.photoId || photo.sourceMessageId) {
            const meetings = typeof getConfirmedMeetings === 'function' ? (getConfirmedMeetings(calendar) || []) : [];
            for (const meeting of meetings) {
              const photos = Array.isArray(meeting?.photos) ? meeting.photos : [];
              const match = photos.find(row => {
                if (!row) return false;
                if (photo.photoId && row.id === photo.photoId) return true;
                if (photo.sourceMessageId && row.sourceMessageId === photo.sourceMessageId
                  && Number(row.sourceImageIndex) === Number(photo.sourceImageIndex != null ? photo.sourceImageIndex : imageIndex)) {
                  return true;
                }
                return false;
              });
              if (match && match.tags != null && String(match.tags)) {
                localTags = localTags == null ? String(match.tags) : localTags;
                // Prefer whichever local string is richer; resolveGalleryLightboxTags also merges
                // against indexTags, but keep local itself non-empty when the meeting copy is.
                const localCount = String(localTags || '').split(/[,\s#]+/).map(t => t.trim()).filter(Boolean).length;
                const meetingCount = String(match.tags || '').split(/[,\s#]+/).map(t => t.trim()).filter(Boolean).length;
                if (meetingCount > localCount) localTags = String(match.tags);
                break;
              }
            }
          }
          const calendarId = calendar && calendar.id ? calendar.id : '';
          let tags = resolveGalleryLightboxTags(calendarId, {
            ...photo,
            messageId: messageId || photo.messageId,
            imageIndex
          }, { localTags, indexTags });
          return {
            ...photo,
            source,
            uploadSource: photo.uploadSource || (['chat', 'gallery', 'meeting', 'memo'].includes(source) ? source : photo.uploadSource),
            messageId: messageId || photo.messageId,
            imageIndex,
            tags
          };
        });
    }
    const composed = composeGalleryPhotos({
      chatMessages, memos, calendar, isTombstone, getMessageImageEntries,
      getAllDirectMediaImageEntries, getConfirmedMeetings, resolveMeetingPhotoDisplay,
      isBrokenPhotoValue, getPhotoAssetCommentKey
    });
    const calendarId = calendar && calendar.id ? calendar.id : '';
    return composed.map(photo => ({
      ...photo,
      tags: resolveGalleryLightboxTags(calendarId, photo, {
        localTags: photo.tags != null ? String(photo.tags) : null,
        indexTags: String(photo.tags || '')
      })
    }));
  }, [chatMessages, memos, calendar, indexedPhotos]);

  const filteredLinks = React.useMemo(() => {
    if (!searchQuery.trim()) return sharedLinks;
    const q = searchQuery.toLowerCase().trim();
    const qNoHash = q.replace(/^#/, '');
    return sharedLinks.filter(item => {
      const matchText = (item.text || '').toLowerCase().includes(q) || (item.text || '').toLowerCase().includes(qNoHash);
      const matchUrl = (item.url || '').toLowerCase().includes(q) || (item.url || '').toLowerCase().includes(qNoHash);
      const matchItemTitle = (item.title || '').toLowerCase().includes(q) || (item.title || '').toLowerCase().includes(qNoHash);
      const matchTitle = (item.linkPreview?.title || '').toLowerCase().includes(q) || (item.linkPreview?.title || '').toLowerCase().includes(qNoHash);
      const matchDesc = (item.linkPreview?.description || '').toLowerCase().includes(q) || (item.linkPreview?.description || '').toLowerCase().includes(qNoHash);
      return matchText || matchUrl || matchItemTitle || matchTitle || matchDesc;
    });
  }, [sharedLinks, searchQuery]);

  const sharedFiles = React.useMemo(() => {
    const collect = collectChatFileAttachmentsFromMessages;
    if (typeof collect !== 'function') return [];
    return collect(chatMessages || []);
  }, [chatMessages]);

  const filteredFiles = React.useMemo(() => {
    if (!searchQuery.trim()) return sharedFiles;
    const q = searchQuery.toLowerCase().trim();
    return sharedFiles.filter(item => {
      const name = String(item.name || '').toLowerCase();
      const mime = String(item.mime || '').toLowerCase();
      const ext = String(item.ext || '').toLowerCase();
      return name.includes(q) || mime.includes(q) || ext.includes(q);
    });
  }, [sharedFiles, searchQuery]);

  const filteredPhotos = React.useMemo(() => {
    if (!searchQuery.trim()) return sharedPhotos;
    const q = searchQuery.toLowerCase().trim();
    const qNoHash = q.replace(/^#/, '');
    return sharedPhotos.filter(item => {
      const tagsRaw = Array.isArray(item.tags) ? item.tags.join(' ') : String(item.tags || '');
      const tagsLower = tagsRaw.toLowerCase();
      const matchTags = tagsLower.includes(q) || tagsLower.includes(qNoHash) || tagsLower.replace(/#/g, '').includes(qNoHash);
      const matchText = (item.text || '').toLowerCase().includes(q) || (item.text || '').toLowerCase().includes(qNoHash);
      return matchTags || matchText;
    });
  }, [sharedPhotos, searchQuery]);
  const visiblePhotos = React.useMemo(() => filteredPhotos.filter(photo => {
    const key = photo.mediaKey || photo.refKey || getPhotoKey(photo);
    if (key && brokenPhotoKeysRef.current.has(key)) return false;
    return !isBrokenPhotoValue(photo.full) && !isBrokenPhotoValue(photo.thumb);
  }), [filteredPhotos, brokenPhotoRevision]);
  const [photoRenderLimit, setPhotoRenderLimit] = React.useState(24);
  const usingPhotoIndex = Array.isArray(indexedPhotos);
  const renderedPhotos = React.useMemo(
    () => asPage && !usingPhotoIndex ? visiblePhotos.slice(0, photoRenderLimit) : visiblePhotos,
    [asPage, visiblePhotos, photoRenderLimit, usingPhotoIndex]
  );
  const hasLocallyHiddenPhotos = !usingPhotoIndex && renderedPhotos.length < visiblePhotos.length;
  const loadMorePhotos = () => {
    if (hasLocallyHiddenPhotos) {
      setPhotoRenderLimit(limit => limit + 20);
      return;
    }
    if (typeof onLoadOlderChat === 'function' && hasMoreOlderChat && !loadingOlderChat) onLoadOlderChat();
  };
  const handleGalleryContentScroll = e => {
    handleGalleryScroll(e);
    if (!asPage || activeTab !== 'photos' || galleryViewMode !== 'all' || !hasLocallyHiddenPhotos) return;
    const el = e?.currentTarget;
    if (!el) return;
    // Keep the initial DOM light, then progressively reveal the complete already-hydrated
    // gallery before the user reaches the bottom. The button remains as an accessibility and
    // slow-device fallback, but ordinary scrolling no longer requires repeated manual taps.
    if (el.scrollHeight - el.scrollTop - el.clientHeight < 900) {
      setPhotoRenderLimit(limit => Math.min(visiblePhotos.length, limit + 40));
    }
  };

  const handleBrokenPhoto = (photo, brokenInfo = {}) => {
    markBrokenPhoto(photo, brokenInfo);
  };

  const searchHydratedRef = React.useRef('');
  React.useEffect(() => {
    const query = searchQuery.trim();
    if (!query || searchHydratedRef.current === query) return;
    searchHydratedRef.current = query;
    if (typeof onLoadOlderChat === 'function' && hasMoreOlderChat && !loadingOlderChat) {
      onLoadOlderChat();
    }
    if (typeof onLoadMoreMemos === 'function' && hasMoreMemos) {
      onLoadMoreMemos();
    }
  }, [searchQuery, hasMoreOlderChat, loadingOlderChat, hasMoreMemos, onLoadOlderChat, onLoadMoreMemos]);

  const displayPhotoTabCount = usingPhotoIndex && Number.isFinite(Number(indexedPhotoTotal))
    ? Number(indexedPhotoTotal) : visiblePhotos.length;
  const [galleryViewMode, setGalleryViewMode] = React.useState('all'); // 'all' | 'date'
  const [galleryMonthDate, setGalleryMonthDate] = React.useState(() => new Date());
  const [collapsedGalleryDates, setCollapsedGalleryDates] = React.useState(() => new Set());
  const [isGalleryPickerOpen, setIsGalleryPickerOpen] = React.useState(false);
  const [pickerGalleryYear, setPickerGalleryYear] = React.useState(() => new Date().getFullYear());
  const [pickerGalleryMonth, setPickerGalleryMonth] = React.useState(() => new Date().getMonth());
  const galleryMonthKey = `${galleryMonthDate.getFullYear()}-${String(galleryMonthDate.getMonth() + 1).padStart(2, '0')}`;
  const requiresCompletePhotoIndex = usingPhotoIndex
    && activeTab === 'photos'
    && (Boolean(searchQuery.trim()) || galleryViewMode === 'date');
  React.useEffect(() => {
    if (!usingPhotoIndex || indexedPhotoLoading) return;
    if (requiresCompletePhotoIndex && !indexedPhotoComplete && typeof onIndexedPhotoLoadAll === 'function') {
      void onIndexedPhotoLoadAll();
      return;
    }
    if (!requiresCompletePhotoIndex && indexedPhotoComplete && typeof onIndexedPhotoPageChange === 'function') {
      void onIndexedPhotoPageChange(indexedPhotoPage || 1);
    }
  }, [usingPhotoIndex, requiresCompletePhotoIndex, indexedPhotoComplete, indexedPhotoLoading, indexedPhotoPage, onIndexedPhotoLoadAll, onIndexedPhotoPageChange]);
  const monthNames = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];
  const getGalleryItemDateKey = item => {
    const meetingDate = String(item?.meetingDate || '').trim();
    if (meetingDate && isValidDateString(meetingDate)) return meetingDate;
    const timestamp = Number(item?.timestamp || 0);
    if (!Number.isFinite(timestamp) || timestamp <= 0) return '';
    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  // Most-recently-uploaded first. sharedPhotos/sharedLinks are already built this way (sorted by
  // raw timestamp), so this only needs to preserve that order rather than re-sort by the item's
  // content/meeting date -- sorting by content date let an item tagged with an older meeting date
  // but uploaded just now sort as if it were old, which isn't what "최근 업로드" means. Only
  // affects the flat ('전체' view mode) list; '일자' grouped view already buckets by date and
  // sorts within each bucket independently.
  const sortGalleryFlatItems = items => {
    const list = (items || []).slice();
    if (!asPage) return list;
    list.sort((a, b) => Number(b?.timestamp || 0) - Number(a?.timestamp || 0));
    return list;
  };
  const groupedGallerySections = React.useMemo(() => {
    if (galleryViewMode !== 'date') return [];
    // Date mode must group the full filtered list (visiblePhotos), not the flat-mode
    // render slice (renderedPhotos). Slicing left hasLocallyHiddenPhotos true for other
    // months and made auto load-more keep firing without growing the current month UI.
    const sourceItems = activeTab === 'links' ? filteredLinks : (activeTab === 'files' ? filteredFiles : visiblePhotos);
    const groups = new Map();
    (sourceItems || []).forEach((item, idx) => {
      const key = getGalleryItemDateKey(item) || '__unknown__';
      if (key !== '__unknown__' && !key.startsWith(galleryMonthKey)) return;
      const next = groups.get(key) || [];
      next.push({ item, idx });
      groups.set(key, next);
    });
    return Array.from(groups.entries())
      .sort((a, b) => {
        if (a[0] === '__unknown__') return 1;
        if (b[0] === '__unknown__') return -1;
        return b[0].localeCompare(a[0]);
      })
      .map(([dateKey, entries]) => ({
        dateKey,
        label: dateKey === '__unknown__' ? '날짜 미상' : (formatShortDateWithDayName(dateKey) || dateKey),
        items: entries
          .slice()
          .sort((a, b) => (Number(b.item?.timestamp || 0) - Number(a.item?.timestamp || 0)) || (a.idx - b.idx))
          .map(entry => entry.item)
      }));
  }, [galleryViewMode, activeTab, filteredLinks, filteredFiles, visiblePhotos, galleryMonthKey]);

  // Per-month photo count for the active galleryMonthKey (already-loaded visiblePhotos only).
  const monthVisiblePhotoCount = React.useMemo(() => {
    if (galleryViewMode !== 'date' || activeTab !== 'photos') return 0;
    return (visiblePhotos || []).reduce((count, item) => {
      const key = getGalleryItemDateKey(item) || '';
      return key.startsWith(galleryMonthKey) ? count + 1 : count;
    }, 0);
  }, [galleryViewMode, activeTab, visiblePhotos, galleryMonthKey]);

  // When an older-chat load finishes without adding any photos for the current month,
  // mark that month exhausted so date-mode auto load-more stops bouncing at the bottom.
  const [exhaustedGalleryMonthKey, setExhaustedGalleryMonthKey] = React.useState(null);
  const prevLoadingOlderChatRef = React.useRef(!!loadingOlderChat);
  const prevMonthVisiblePhotoCountRef = React.useRef(monthVisiblePhotoCount);
  const prevGalleryMonthKeyForExhaustRef = React.useRef(galleryMonthKey);
  React.useEffect(() => {
    if (prevGalleryMonthKeyForExhaustRef.current !== galleryMonthKey) {
      prevGalleryMonthKeyForExhaustRef.current = galleryMonthKey;
      setExhaustedGalleryMonthKey(null);
      prevMonthVisiblePhotoCountRef.current = monthVisiblePhotoCount;
      prevLoadingOlderChatRef.current = !!loadingOlderChat;
      return;
    }
    const wasLoading = prevLoadingOlderChatRef.current;
    prevLoadingOlderChatRef.current = !!loadingOlderChat;
    if (monthVisiblePhotoCount > prevMonthVisiblePhotoCountRef.current) {
      setExhaustedGalleryMonthKey(prev => prev === galleryMonthKey ? null : prev);
    }
    if (wasLoading && !loadingOlderChat && monthVisiblePhotoCount <= prevMonthVisiblePhotoCountRef.current) {
      setExhaustedGalleryMonthKey(galleryMonthKey);
    }
    prevMonthVisiblePhotoCountRef.current = monthVisiblePhotoCount;
  }, [loadingOlderChat, monthVisiblePhotoCount, galleryMonthKey]);

  const toggleGalleryDate = dateKey => {
    setCollapsedGalleryDates(prev => {
      const next = new Set(prev);
      if (next.has(dateKey)) next.delete(dateKey);
      else next.add(dateKey);
      return next;
    });
  };
  const moveGalleryMonth = offset => {
    setGalleryMonthDate(prev => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
    setCollapsedGalleryDates(new Set());
  };
  const goToGalleryToday = () => {
    setGalleryMonthDate(new Date());
    setCollapsedGalleryDates(new Set());
  };
  const openGalleryPicker = () => {
    setPickerGalleryYear(galleryMonthDate.getFullYear());
    setPickerGalleryMonth(galleryMonthDate.getMonth());
    setIsGalleryPickerOpen(true);
  };
  const applyGalleryPicker = () => {
    setGalleryMonthDate(new Date(pickerGalleryYear, pickerGalleryMonth, 1));
    setCollapsedGalleryDates(new Set());
    setIsGalleryPickerOpen(false);
  };
  // Same month-nav module the settlement page's 월별보기 tab uses ('calendar-nav' class +
  // btn/calendar-month-nav-btn buttons) so the two pages stay visually and structurally
  // consistent instead of each keeping its own copy of this UI.
  const renderGalleryMonthNavigator = () => /*#__PURE__*/React.createElement("div", {
    className: "calendar-nav",
    style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px', marginBottom: '10px', flexShrink: 0 }
  },
    /*#__PURE__*/React.createElement("div", {
      style: { display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-main)', fontWeight: 900, fontSize: '1rem', cursor: 'pointer', userSelect: 'none' },
      onClick: openGalleryPicker,
      title: "클릭하여 년월 이동"
    },
      `${galleryMonthDate.getFullYear()}년 ${galleryMonthDate.getMonth() + 1}월`,
      /*#__PURE__*/React.createElement("span", { style: { color: 'var(--text-light)', display: 'inline-flex', alignItems: 'center' } },
        /*#__PURE__*/React.createElement("svg", {
          xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24",
          fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round",
          className: "icon icon-tabler icons-tabler-outline icon-tabler-chevron-down"
        },
          /*#__PURE__*/React.createElement("path", { stroke: "none", d: "M0 0h24v24H0z", fill: "none" }),
          /*#__PURE__*/React.createElement("path", { d: "M6 9l6 6l6 -6" })
        )
      )
    ),
    /*#__PURE__*/React.createElement("div", { style: { display: 'flex', gap: '6px' } },
      /*#__PURE__*/React.createElement("button", {
        type: "button", className: "btn btn-secondary calendar-month-nav-btn", title: "이전달", "aria-label": "이전달",
        style: { padding: '8px' }, onClick: () => moveGalleryMonth(-1)
      }, /*#__PURE__*/React.createElement("svg", {
        xmlns: "http://www.w3.org/2000/svg", width: "20", height: "20", viewBox: "0 0 24 24",
        fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round",
        style: { transform: 'rotate(90deg)' }, className: "icon icon-tabler icons-tabler-outline icon-tabler-chevron-down"
      },
        /*#__PURE__*/React.createElement("path", { stroke: "none", d: "M0 0h24v24H0z", fill: "none" }),
        /*#__PURE__*/React.createElement("path", { d: "M6 9l6 6l6 -6" })
      )),
      /*#__PURE__*/React.createElement("button", {
        type: "button", className: "btn btn-secondary calendar-month-nav-btn", title: "오늘", "aria-label": "오늘",
        style: { padding: '8px' }, onClick: goToGalleryToday
      }, /*#__PURE__*/React.createElement(CalendarCheckIcon, null)),
      /*#__PURE__*/React.createElement("button", {
        type: "button", className: "btn btn-secondary calendar-month-nav-btn", title: "다음달", "aria-label": "다음달",
        style: { padding: '8px' }, onClick: () => moveGalleryMonth(1)
      }, /*#__PURE__*/React.createElement("svg", {
        xmlns: "http://www.w3.org/2000/svg", width: "20", height: "20", viewBox: "0 0 24 24",
        fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round",
        style: { transform: 'rotate(-90deg)' }, className: "icon icon-tabler icons-tabler-outline icon-tabler-chevron-down"
      },
        /*#__PURE__*/React.createElement("path", { stroke: "none", d: "M0 0h24v24H0z", fill: "none" }),
        /*#__PURE__*/React.createElement("path", { d: "M6 9l6 6l6 -6" })
      ))
    )
  );

  const handleUploadClick = () => {
    if (uploadInputRef.current) uploadInputRef.current.click();
  };
  const handlePasteGalleryUpload = async e => {
    if (e) e.stopPropagation();
    // Other-calendar 사진(gather-photo URL)인지 먼저 확인 -- 클립보드 이미지 파일 읽기보다
    // 먼저 시도해서, 다른 캘린더에서 복사해온 URL이 있을 땐 그쪽을 우선한다.
    let clipboardText = '';
    try { clipboardText = await navigator.clipboard.readText(); } catch (_) { /* not granted/available */ }
    const gatherPhoto = parseGatherPhotoClipboardText(clipboardText);
    if (gatherPhoto) {
      setIsMenuOpen(false);
      setGatherPhotoPastePreview(gatherPhoto);
      return;
    }
    const gatherPhotos = parseGatherPhotosClipboardText(clipboardText);
    if (gatherPhotos) {
      setIsMenuOpen(false);
      setGatherPhotosPastePreview(gatherPhotos);
      return;
    }
    const files = await readClipboardImageFiles(showToast);
    if (files && files.length > 0) {
      // Show what will be uploaded and let the user confirm instead of uploading immediately --
      // handleConfirmPastePreview does the actual upload once confirmed.
      setIsMenuOpen(false);
      setPastePreview({ files, previewUrls: files.map(f => URL.createObjectURL(f)) });
    }
  };
  // previewUrls are revoked by the cleanup effect above once pastePreview changes (including
  // back to null here) -- no need to revoke them again in these two handlers.
  const handleCancelPastePreview = () => setPastePreview(null);
  const handleConfirmPastePreview = async () => {
    if (!pastePreview) return;
    const files = pastePreview.files;
    setPastePreview(null);
    await uploadFiles(files);
  };
  const handleCancelGatherPhotoPaste = () => setGatherPhotoPastePreview(null);
  const handleConfirmGatherPhotoPaste = async () => {
    if (!gatherPhotoPastePreview || typeof onPasteGatherPhoto !== 'function' || isSavingGatherPhotoPaste) return;
    setIsSavingGatherPhotoPaste(true);
    try {
      const ok = await onPasteGatherPhoto(gatherPhotoPastePreview.url, gatherPhotoPastePreview.tags);
      if (ok !== false) {
        setGatherPhotoPastePreview(null);
        setActiveTab('photos');
      }
    } finally {
      setIsSavingGatherPhotoPaste(false);
    }
  };
  const handleCancelGatherPhotosPaste = () => setGatherPhotosPastePreview(null);
  const handleConfirmGatherPhotosPaste = async () => {
    if (!gatherPhotosPastePreview || typeof onPasteGatherPhotos !== 'function' || isSavingGatherPhotosPaste) return;
    setIsSavingGatherPhotosPaste(true);
    try {
      const ok = await onPasteGatherPhotos(gatherPhotosPastePreview);
      if (ok !== false) {
        setGatherPhotosPastePreview(null);
        setActiveTab('photos');
      }
    } finally {
      setIsSavingGatherPhotosPaste(false);
    }
  };
  const toggleBulkShareSelected = key => {
    setSelectedBulkShareKeys(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };
  const handleToggleBulkShareMode = () => {
    setIsBulkShareMode(v => !v);
    setSelectedBulkShareKeys(new Set());
  };
  // 선택한 사진들을 하나의 URL로 묶어 공유("일괄공유") -- 복사 시점의 사진 URL과 태그를 그대로
  // 실어 보내고(encodeGatherPhotosFragment), 이후 원본/사본 어느 쪽에서 태그를 바꾸거나 사진을
  // 지워도 서로 영향이 없다(단일 사진 공유와 동일한 원칙).
  const handleClickBulkShare = async () => {
    const keys = Array.from(selectedBulkShareKeys);
    if (!keys.length) return;
    setIsGeneratingBulkShareUrl(true);
    try {
      const keySet = new Set(keys);
      const photos = visiblePhotos
        .filter(photo => keySet.has(getPhotoKey(photo)))
        .map(photo => ({ url: photo.full || photo.thumb, tags: photo.tags || '' }));
      const fragment = encodeGatherPhotosFragment(photos);
      if (!fragment) {
        if (showToast) showToast('공유 URL 생성 실패', 'error');
        return;
      }
      const baseUrl = `${window.location.origin}${window.location.pathname}`;
      const shareUrl = `${baseUrl}${fragment}`;
      const ok = await copyTextToClipboard(shareUrl);
      setBulkShareResultUrl(shareUrl);
      setIsBulkShareMode(false);
      setSelectedBulkShareKeys(new Set());
      if (showToast) showToast(ok ? '공유 URL이 복사되었습니다.' : 'URL 생성은 됐지만 복사에 실패했습니다. 아래 URL을 직접 복사해 주세요.', ok ? 'success' : 'error');
    } finally {
      setIsGeneratingBulkShareUrl(false);
    }
  };
  const uploadFiles = async files => {
    if (!files.length || typeof onUploadImages !== 'function') return;
    setIsMenuOpen(false);
    await Promise.resolve(onUploadImages(files));
    setActiveTab('photos');
  };
  const handleUploadChange = async event => {
    const files = Array.from(event.target.files || []);
    event.target.value = '';
    await uploadFiles(files);
  };

  // 링크 tab's '추가'/'붙여넣기' -- unlike photos (uploaded as their own message), a "link" here
  // is just a URL that happens to appear in some chat message's or memo's text (see sharedLinks
  // above), so adding one directly means creating a small gallery-only text message containing
  // that URL -- onAddLink (wired to handleAddGalleryLink in app-main.js) writes it the same way
  // handleUploadGalleryImages writes an uploaded photo, with uploadSource:'gallery' so it doesn't
  // also show up as a message in the chat feed.
  const [isAddingLink, setIsAddingLink] = React.useState(false);
  const [linkUrlInput, setLinkUrlInput] = React.useState('');
  const [isSavingLink, setIsSavingLink] = React.useState(false);
  const handleToggleAddLink = () => {
    setIsAddingLink(prev => !prev);
    setLinkUrlInput('');
  };
  const handleSubmitLinkInput = async () => {
    if (typeof onAddLink !== 'function' || isSavingLink) return;
    const url = extractFirstUrl(linkUrlInput);
    if (!url) {
      if (showToast) showToast('올바른 링크(URL)를 입력해 주세요.', 'error');
      return;
    }
    setIsSavingLink(true);
    try {
      const ok = await onAddLink(url);
      if (ok !== false) {
        if (showToast) {
          showToast(ok === 'queued'
            ? '네트워크가 불안정하여 링크를 대기열에 저장했습니다. 연결되면 자동으로 반영됩니다.'
            : '링크가 추가되었습니다.', ok === 'queued' ? 'info' : 'success');
        }
        setLinkUrlInput('');
        setIsAddingLink(false);
        setActiveTab('links');
      }
    } finally {
      setIsSavingLink(false);
    }
  };
  const handlePasteLinkFromClipboard = async () => {
    if (typeof onAddLink !== 'function' || isSavingLink) return;
    let text;
    try {
      text = await navigator.clipboard.readText();
    } catch (err) {
      if (showToast) showToast('클립보드를 읽을 수 없습니다. 브라우저 권한을 확인해 주세요.', 'error');
      return;
    }
    const url = extractFirstUrl(text);
    if (!url) {
      if (showToast) showToast('클립보드에 붙여넣을 링크가 없습니다.', 'error');
      return;
    }
    setIsSavingLink(true);
    try {
      const ok = await onAddLink(url);
      if (ok !== false) {
        if (showToast) {
          showToast(ok === 'queued'
            ? '네트워크가 불안정하여 링크를 대기열에 저장했습니다. 연결되면 자동으로 반영됩니다.'
            : '링크가 추가되었습니다.', ok === 'queued' ? 'info' : 'success');
        }
        setActiveTab('links');
      }
    } finally {
      setIsSavingLink(false);
    }
  };
  // Lets '이미지 업로드' accept a clipboard-pasted image too, not just the file picker -- active
  // for as long as the 갤러리 페이지 is open. Routes through the same preview/confirm modal as
  // the 붙여넣기 button (handlePasteGalleryUpload) rather than uploading straight from the paste
  // event -- otherwise a stray Ctrl+V uploads whatever happens to be on the clipboard with no
  // chance to back out.
  React.useEffect(() => {
    if (typeof onUploadImages !== 'function' && typeof onPasteGatherPhoto !== 'function' && typeof onPasteGatherPhotos !== 'function') return;
    const handlePaste = e => {
      // 다른 캘린더 사진(gather-photo URL)이 먼저 -- clipboardData는 이 이벤트에서만 동기적으로
      // 읽을 수 있어(navigator.clipboard 비동기 API와 달리 권한 프롬프트 없이) Ctrl+V 쪽은
      // 이 경로로 확인한다.
      if (typeof onPasteGatherPhoto === 'function') {
        const text = e.clipboardData ? e.clipboardData.getData('text/plain') : '';
        const gatherPhoto = parseGatherPhotoClipboardText(text);
        if (gatherPhoto) {
          e.preventDefault();
          setIsMenuOpen(false);
          setGatherPhotoPastePreview(gatherPhoto);
          return;
        }
      }
      if (typeof onPasteGatherPhotos === 'function') {
        const text = e.clipboardData ? e.clipboardData.getData('text/plain') : '';
        const gatherPhotos = parseGatherPhotosClipboardText(text);
        if (gatherPhotos) {
          e.preventDefault();
          setIsMenuOpen(false);
          setGatherPhotosPastePreview(gatherPhotos);
          return;
        }
      }
      if (typeof onUploadImages !== 'function') return;
      const files = getImageFilesFromClipboardEvent(e);
      if (!files.length) return;
      e.preventDefault();
      setIsMenuOpen(false);
      setPastePreview({ files, previewUrls: files.map(f => URL.createObjectURL(f)) });
    };
    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [onUploadImages, onPasteGatherPhoto, onPasteGatherPhotos]);
  const renderMenuIcon = () => MenuIcon
    ? /*#__PURE__*/React.createElement(MenuIcon, { paths: ["M4 6h16", "M4 12h16", "M4 18h16"] })
    : /*#__PURE__*/React.createElement("svg", {
        xmlns: "http://www.w3.org/2000/svg", width: "22", height: "22", viewBox: "0 0 24 24",
        fill: "none", stroke: "currentColor", strokeWidth: "2.5", strokeLinecap: "round", strokeLinejoin: "round"
      }, /*#__PURE__*/React.createElement("path", { d: "M4 6h16" }), /*#__PURE__*/React.createElement("path", { d: "M4 12h16" }), /*#__PURE__*/React.createElement("path", { d: "M4 18h16" }));
  const renderGalleryUploadIcon = () => /*#__PURE__*/React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg", width: "20", height: "20", viewBox: "0 0 24 24",
    fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", { d: "M10.3 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10l-3.1-3.1a2 2 0 0 0-2.814.014L6 21" }),
     /*#__PURE__*/React.createElement("path", { d: "m14 19.5 3-3 3 3" }),
     /*#__PURE__*/React.createElement("path", { d: "M17 22v-5.5" }),
     /*#__PURE__*/React.createElement("circle", { cx: "9", cy: "9", r: "2" }));
    // Paste preview/confirm modal -- shown after clicking '붙여넣기' and before the clipboard
  // image(s) actually upload, so the user can see what's about to be attached.
  const pastePreviewModal = pastePreview ? /*#__PURE__*/React.createElement("div", {
    className: "modal-overlay",
    style: { zIndex: 30000 },
    onClick: handleCancelPastePreview
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal-container confirm-dialog-modal",
    onClick: e => e.stopPropagation(),
    style: { maxWidth: '360px', borderRadius: 'var(--radius-md)' }
  },
    /*#__PURE__*/React.createElement("h3", {
      style: { fontSize: '1.05rem', fontWeight: 800, marginBottom: '12px', color: 'var(--text-main)', textAlign: 'center' }
    }, `클립보드 이미지 ${pastePreview.previewUrls.length}장을 붙여넣을까요?`),
    /*#__PURE__*/React.createElement("div", {
      style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(76px, 1fr))', gap: '8px', marginBottom: '16px', maxHeight: '50vh', overflowY: 'auto' }
    }, pastePreview.previewUrls.map((url, i) => /*#__PURE__*/React.createElement("img", {
      key: i,
      src: url,
      alt: "붙여넣을 이미지 미리보기",
      style: { width: '100%', aspectRatio: '1 / 1', objectFit: 'cover', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-primary)' }
    }))),
    /*#__PURE__*/React.createElement("div", { style: { display: 'flex', gap: '10px', justifyContent: 'center' } },
      /*#__PURE__*/React.createElement("button", {
        type: "button",
        className: "btn btn-secondary",
        onClick: handleCancelPastePreview,
        style: { flex: 1, height: '36px', fontSize: 'var(--font-size-base)' }
      }, "취소"),
      /*#__PURE__*/React.createElement("button", {
        type: "button",
        className: "btn btn-action-dark",
        onClick: handleConfirmPastePreview,
        style: { flex: 1, height: '36px', fontSize: 'var(--font-size-base)' }
      }, "업로드")
    )
  )) : null;

  const gatherPhotoTagList = gatherPhotoPastePreview
    ? String(gatherPhotoPastePreview.tags || '').split(/[,\s#]+/).map(t => t.trim()).filter(Boolean)
    : [];
  // 다른 캘린더 라이트박스에서 복사해온 사진을 붙여넣기 전 확인하는 모달 -- 사진과 그 사진의
  // 해시태그를 함께 보여줘, 붙여넣은 뒤에는 이 캘린더에서 독립적으로 관리된다는 걸 알 수 있게
  // 태그 개수를 명시한다.
  const gatherPhotoPasteModal = gatherPhotoPastePreview ? /*#__PURE__*/React.createElement("div", {
    className: "modal-overlay",
    style: { zIndex: 30000 },
    onClick: handleCancelGatherPhotoPaste
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal-container confirm-dialog-modal",
    onClick: e => e.stopPropagation(),
    style: { maxWidth: '360px', borderRadius: 'var(--radius-md)' }
  },
    /*#__PURE__*/React.createElement("h3", {
      style: { fontSize: '1.05rem', fontWeight: 800, marginBottom: '12px', color: 'var(--text-main)', textAlign: 'center' }
    }, "다른 캘린더 사진을 붙여넣을까요?"),
    /*#__PURE__*/React.createElement("img", {
      src: gatherPhotoPastePreview.url,
      alt: "붙여넣을 사진 미리보기",
      style: { width: '100%', maxHeight: '40vh', objectFit: 'contain', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-primary)', marginBottom: '12px' }
    }),
    gatherPhotoTagList.length > 0 && /*#__PURE__*/React.createElement("div", {
      style: { display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px', justifyContent: 'center' }
    }, gatherPhotoTagList.map(tag => /*#__PURE__*/React.createElement("span", {
      key: tag,
      style: {
        display: 'inline-flex', alignItems: 'center', padding: '3px 10px', borderRadius: 'var(--radius-full)',
        border: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)', fontWeight: 700
      }
    }, `#${tag}`))),
    /*#__PURE__*/React.createElement("div", {
      style: { fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', textAlign: 'center', marginBottom: '16px' }
    }, gatherPhotoTagList.length > 0
      ? `사진과 해시태그 ${gatherPhotoTagList.length}개를 이 캘린더 갤러리에 붙여넣습니다. 이후 태그 변경은 서로 영향을 주지 않습니다.`
      : '사진을 이 캘린더 갤러리에 붙여넣습니다.'),
    /*#__PURE__*/React.createElement("div", { style: { display: 'flex', gap: '10px', justifyContent: 'center' } },
      /*#__PURE__*/React.createElement("button", {
        type: "button",
        className: "btn btn-secondary",
        onClick: handleCancelGatherPhotoPaste,
        disabled: isSavingGatherPhotoPaste,
        style: { flex: 1, height: '36px', fontSize: 'var(--font-size-base)' }
      }, "취소"),
      /*#__PURE__*/React.createElement("button", {
        type: "button",
        className: "btn btn-action-dark",
        onClick: handleConfirmGatherPhotoPaste,
        disabled: isSavingGatherPhotoPaste,
        style: { flex: 1, height: '36px', fontSize: 'var(--font-size-base)', opacity: isSavingGatherPhotoPaste ? 0.6 : 1 }
      }, isSavingGatherPhotoPaste ? "붙여넣는 중..." : "붙여넣기")
    )
  )) : null;

  // 다른 캘린더에서 "일괄공유"로 묶어 보낸 사진 여러 장을 한꺼번에 붙여넣기 전 확인하는 모달.
  const gatherPhotosPasteModal = gatherPhotosPastePreview ? /*#__PURE__*/React.createElement("div", {
    className: "modal-overlay",
    style: { zIndex: 30000 },
    onClick: handleCancelGatherPhotosPaste
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal-container confirm-dialog-modal",
    onClick: e => e.stopPropagation(),
    style: { maxWidth: '400px', borderRadius: 'var(--radius-md)' }
  },
    /*#__PURE__*/React.createElement("h3", {
      style: { fontSize: '1.05rem', fontWeight: 800, marginBottom: '12px', color: 'var(--text-main)', textAlign: 'center' }
    }, `다른 캘린더 사진 ${gatherPhotosPastePreview.length}장을 붙여넣을까요?`),
    /*#__PURE__*/React.createElement("div", {
      style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(76px, 1fr))', gap: '8px', marginBottom: '12px', maxHeight: '50vh', overflowY: 'auto' }
    }, gatherPhotosPastePreview.map((photo, i) => /*#__PURE__*/React.createElement("img", {
      key: i,
      src: photo.url,
      alt: "붙여넣을 사진 미리보기",
      style: { width: '100%', aspectRatio: '1 / 1', objectFit: 'cover', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-primary)' }
    }))),
    /*#__PURE__*/React.createElement("div", {
      style: { fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', textAlign: 'center', marginBottom: '16px' }
    }, "사진과 각자의 해시태그를 이 캘린더 갤러리에 붙여넣습니다. 이후 태그 변경/삭제는 서로 영향을 주지 않습니다."),
    /*#__PURE__*/React.createElement("div", { style: { display: 'flex', gap: '10px', justifyContent: 'center' } },
      /*#__PURE__*/React.createElement("button", {
        type: "button",
        className: "btn btn-secondary",
        onClick: handleCancelGatherPhotosPaste,
        disabled: isSavingGatherPhotosPaste,
        style: { flex: 1, height: '36px', fontSize: 'var(--font-size-base)' }
      }, "취소"),
      /*#__PURE__*/React.createElement("button", {
        type: "button",
        className: "btn btn-action-dark",
        onClick: handleConfirmGatherPhotosPaste,
        disabled: isSavingGatherPhotosPaste,
        style: { flex: 1, height: '36px', fontSize: 'var(--font-size-base)', opacity: isSavingGatherPhotosPaste ? 0.6 : 1 }
      }, isSavingGatherPhotosPaste ? "붙여넣는 중..." : "붙여넣기")
    )
  )) : null;

  // "일괄공유" 결과 URL 모달 -- 복사는 이미 handleClickBulkShare에서 자동으로 시도하지만,
  // 클립보드 권한이 없는 환경을 위해 URL을 직접 보고 복사할 수 있게 남겨둔다.
  const bulkShareResultModal = bulkShareResultUrl ? /*#__PURE__*/React.createElement("div", {
    className: "modal-overlay",
    style: { zIndex: 30000 },
    onClick: () => setBulkShareResultUrl('')
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal-container confirm-dialog-modal",
    onClick: e => e.stopPropagation(),
    style: { maxWidth: '400px', borderRadius: 'var(--radius-md)' }
  },
    /*#__PURE__*/React.createElement("h3", {
      style: { fontSize: '1.05rem', fontWeight: 800, marginBottom: '12px', color: 'var(--text-main)', textAlign: 'center' }
    }, "공유 URL"),
    /*#__PURE__*/React.createElement("input", {
      type: "text", className: "form-input", readOnly: true, value: bulkShareResultUrl,
      style: { width: '100%', marginBottom: '12px' }
    }),
    /*#__PURE__*/React.createElement("div", {
      style: { fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', textAlign: 'center', marginBottom: '16px' }
    }, "이 URL을 다른 캘린더 갤러리의 '붙여넣기' 버튼이나 Ctrl+V로 붙여넣으면 선택한 사진들이 그대로 등록됩니다."),
    /*#__PURE__*/React.createElement("div", { style: { display: 'flex', gap: '10px', justifyContent: 'center' } },
      /*#__PURE__*/React.createElement("button", {
        type: "button",
        className: "btn btn-secondary",
        onClick: () => setBulkShareResultUrl(''),
        style: { flex: 1, height: '36px', fontSize: 'var(--font-size-base)' }
      }, "닫기"),
      /*#__PURE__*/React.createElement("button", {
        type: "button",
        className: "btn btn-action-dark",
        onClick: async () => {
          const ok = await copyTextToClipboard(bulkShareResultUrl);
          if (showToast) showToast(ok ? 'URL이 복사되었습니다.' : '복사에 실패했습니다. URL을 직접 선택해 복사해 주세요.', ok ? 'success' : 'error');
        },
        style: { flex: 1, height: '36px', fontSize: 'var(--font-size-base)' }
      }, "다시 복사")
    )
  )) : null;

  const galleryShellStyle = asPage ? {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1005,
    backgroundColor: 'var(--bg-primary)', display: 'flex', flexDirection: 'column',
    width: '100%', maxWidth: '100%', overflow: 'hidden'
  } : { zIndex: 11000 };
  const galleryInnerStyle = asPage ? {
    width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
    backgroundColor: 'var(--bg-card)', borderRadius: 0, maxWidth: '100%'
  } : {
    maxWidth: window.innerWidth >= 768 ? '960px' : '520px',
    width: '95%', height: '80vh', display: 'flex', flexDirection: 'column'
  };
  const galleryHeaderStyle = asPage ? {
    height: '56px', padding: '0 16px',
    borderBottom: isSearchOpen ? 'none' : '1px solid var(--border-subtle)',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    // top shifts down by env(safe-area-inset-top) for iOS standalone (see .main-header) --
    // 0 in a normal browser tab, so this is a no-op there.
    position: 'fixed', top: 'env(safe-area-inset-top, 0px)', left: 0, right: 0, zIndex: 1010, overflow: 'hidden', flexShrink: 0,
    backgroundColor: 'var(--bg-card)',
    transition: 'transform 0.3s ease',
    transform: isHeaderVisible ? 'translateY(0)' : 'translateY(-100%)'
  } : {
    padding: '16px 20px 12px 20px', borderBottom: '1px solid var(--border-subtle)',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    position: 'relative', overflow: 'hidden'
  };
  const renderGalleryPhotoGrid = (items, lightboxItems = visiblePhotos) => /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))`,
      gap: '6px',
      width: '100%',
      alignContent: 'start'
    }
  }, (items || []).map((photo, idx) => {
    const photoKey = getPhotoKey(photo);
    const itemKey = photoKey || `${photo.messageId || photo.source || 'photo'}-${photo.meetingDate || ''}-${photo.directMediaUrl ? 'direct' : photo.imageIndex}-${photo.timestamp || idx}`;
    const lightboxIndex = (lightboxItems || []).findIndex(entry => getPhotoKey(entry) === photoKey);
    const isChecked = isBulkShareMode && selectedBulkShareKeys.has(photoKey);
    // Same mediaKey/refKey identity the Lightbox itself computes to key a photo's comment thread
    // (see ui-lightbox.js's currentIdentity) -- reusing it here (rather than photoKey/itemKey,
    // which are this grid's own React-key/dedup identifiers with a different shape for most
    // photos) is what lets this thumbnail badge and the Lightbox's comment count agree.
    const commentIdentity = getPhotoCommentIdentity(photo, lightboxItems || [], { source: photo.source, meetingDate: photo.meetingDate })
      || (typeof getMediaIdentityKeys === 'function' ? getMediaIdentityKeys(photo, { source: photo.source, meetingDate: photo.meetingDate }) : {});
    // Falls back to the pre-photoId/index era key (see getLegacyMeetingMediaKey) so meeting
    // photo comment threads saved before that data shape existed still show their badge here.
    const legacyMeetingKey = typeof getLegacyMeetingMediaKey === 'function'
      ? getLegacyMeetingMediaKey(photo, { meetingDate: photo.meetingDate })
      : '';
    // Meeting photos that originated in a chat can retain the original chat-based
    // comment document key even after the meeting photo receives its own photoId.
    // Include that key as a read fallback so the badge follows the same thread as
    // the lightbox instead of silently showing zero.
    const commentCount = Math.max(Number(photo.commentCount || 0), getPhotoCommentCount({
      ...commentIdentity,
      legacyKeys: [...(commentIdentity.legacyKeys || []), legacyMeetingKey].filter(Boolean)
    }, photoCommentCounts));
    const thumb = /*#__PURE__*/React.createElement(MediaThumb, {
      key: isBulkShareMode ? undefined : itemKey,
      "data-photo-url": photo.full || photo.thumb,
      "data-message-id": photo.messageId || photo.sourceMessageId,
      src: (photo.thumb && String(photo.thumb)) || (photo.full && String(photo.full)) || '',
      fallbackSrc: (photo.full && String(photo.full)) || (photo.thumb && String(photo.thumb)) || '',
      alt: "공유사진",
      loading: "lazy",
      decoding: "async",
      referrerPolicy: 'no-referrer',
      onClick: () => isBulkShareMode ? toggleBulkShareSelected(photoKey) : (setActiveLightbox && setActiveLightbox({
        urls: (lightboxItems || []).map(p => p.full),
        index: lightboxIndex >= 0 ? lightboxIndex : idx,
        meta: (lightboxItems || []).map(p => ({ timestamp: p.timestamp, messageId: p.messageId, imageIndex: p.imageIndex, thumb: p.thumb, tags: p.tags, directMediaUrl: p.directMediaUrl, source: p.source, uploadSource: p.uploadSource, meetingDate: p.meetingDate, photoId: p.photoId, sourceMessageId: p.sourceMessageId, sourceImageIndex: p.sourceImageIndex, assetKey: p.assetKey, mediaKey: p.mediaKey, refKey: p.refKey, legacyKeys: p.legacyKeys }))
      })),
      onBroken: (e, brokenInfo) => handleBrokenPhoto(photo, brokenInfo),
      style: {
        width: '100%',
        maxWidth: '100%',
        aspectRatio: '1 / 1',
        objectFit: 'cover',
        borderRadius: 'var(--radius-sm)',
        cursor: 'pointer',
        backgroundColor: 'var(--bg-primary)',
        display: 'block'
      }
    });
    const commentBadge = PhotoCommentCountBadge && /*#__PURE__*/React.createElement(PhotoCommentCountBadge, { count: commentCount });
    if (!isBulkShareMode && !commentBadge) return thumb;
    return /*#__PURE__*/React.createElement("div", {
      key: itemKey,
      className: commentCount ? 'gallery-comment-heartbeat' : '',
      style: { position: 'relative', animationDelay: `${(idx % 7) * 0.9}s` }
    },
      thumb,
      isBulkShareMode && /*#__PURE__*/React.createElement("span", {
        "aria-hidden": true,
        style: {
          position: 'absolute', top: '4px', left: '4px', width: '20px', height: '20px', borderRadius: '5px',
          border: isChecked ? 'none' : '2px solid rgba(255,255,255,0.9)',
          backgroundColor: isChecked ? 'var(--accent-primary)' : 'rgba(0,0,0,0.35)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 1px 3px rgba(0,0,0,0.4)', pointerEvents: 'none'
        }
      }, isChecked && /*#__PURE__*/React.createElement("svg", {
        xmlns: "http://www.w3.org/2000/svg", width: "14", height: "14", viewBox: "0 0 24 24",
        fill: "none", stroke: "#fff", strokeWidth: "3", strokeLinecap: "round", strokeLinejoin: "round"
      }, /*#__PURE__*/React.createElement("path", { d: "M20 6 9 17l-5-5" }))),
      commentBadge
    );
  }));
  const renderGalleryLinkList = items => /*#__PURE__*/React.createElement(React.Fragment, null,
    (items || []).map(item => /*#__PURE__*/React.createElement(GalleryLinkCard, {
      key: item.messageId || item.url,
      item: item,
      searchQuery: searchQuery
    }))
  );
  const renderGalleryFileList = items => /*#__PURE__*/React.createElement("div", {
    style: { display: 'flex', flexDirection: 'column', gap: '8px' }
  }, (items || []).map((item, idx) => FileAttachmentCard ? /*#__PURE__*/React.createElement(FileAttachmentCard, {
    key: (item.id || item.url) + '-' + idx,
    attachment: item,
    searchQuery: searchQuery,
    stretch: true,
    compact: true,
    onOpen: () => setGalleryDocLightbox({ attachments: items, index: idx })
  }) : null));
  const renderFileListHeader = () => /*#__PURE__*/React.createElement("div", {
    style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '8px' }
  }, isMobile
    ? renderVisitFilterToggleMobile()
    : /*#__PURE__*/React.createElement("label", {
      style: { fontSize: 'var(--font-size-md)', fontWeight: 800, color: 'var(--text-muted)' }
    }, `등록된 파일 (${filteredFiles.length}개)`));
  // "이전 사진/링크 더 보기": a real component (not a plain render-helper function) so it can use
  // its own IntersectionObserver to auto-fire onClick once the user scrolls near it, instead of
  // requiring an explicit tap. A sentinel div sits 300px above the visible button so the next
  // page starts loading just before the user actually reaches the bottom.
  //
  // Auto-fire is gated by an "armed" flag, not just by `disabled` -- a page that happens to add
  // no net-new content (a stretch of text-only chat history with no photos, or a page shorter
  // than the 300px lookahead) leaves the sentinel sitting in the trigger zone with nothing having
  // moved, so gating on `disabled` alone would re-fire the instant it clears and hammer Firestore
  // in a tight loop for as long as that page keeps coming back empty.
  // Re-arm only when the sentinel leaves the viewport (intersecting → not intersecting). Arming
  // on every scroll (including bottom rubber-band) would loop-fire while the sentinel stays
  // intersecting. Manual tap on the button still calls onClick directly.
  const GalleryLoadMoreButton = ({ loadingLabel, label, onClick, disabled }) => {
    const sentinelRef = React.useRef(null);
    const armedRef = React.useRef(true);
    const wasIntersectingRef = React.useRef(false);
    React.useEffect(() => {
      const node = sentinelRef.current;
      if (!node || disabled || typeof IntersectionObserver !== 'function') return undefined;
      const root = gridHostRef.current || null;
      const observer = new IntersectionObserver(entries => {
        const isIntersecting = entries.some(entry => entry.isIntersecting);
        if (wasIntersectingRef.current && !isIntersecting) {
          armedRef.current = true;
        }
        wasIntersectingRef.current = isIntersecting;
        if (!armedRef.current) return;
        if (isIntersecting) {
          armedRef.current = false;
          onClick();
        }
      }, { root, rootMargin: '300px 0px' });
      observer.observe(node);
      return () => observer.disconnect();
    }, [disabled, onClick]);
    return /*#__PURE__*/React.createElement(React.Fragment, null,
      /*#__PURE__*/React.createElement("div", { ref: sentinelRef, "aria-hidden": "true" }),
      /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: onClick,
        disabled: !!disabled,
        style: {
          width: '100%',
          marginTop: '4px',
          padding: '12px 0',
          border: 'none',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'color-mix(in srgb, var(--bg-primary) 96%, black)',
          color: 'var(--text-main)',
          fontSize: 'var(--font-size-base)',
          fontWeight: 700,
          cursor: disabled ? 'wait' : 'pointer',
          textAlign: 'center'
        }
      }, disabled ? loadingLabel : label)
    );
  };
  const renderGalleryLoadMoreButton = props => /*#__PURE__*/React.createElement(GalleryLoadMoreButton, props);
  // Mobile pagination has no arrows -- a horizontal drag pans the centered page window so more
  // numbers can be revealed, then a tap (or drag-release past the threshold) selects a page.
  const [paginationDragPage, setPaginationDragPage] = React.useState(null);
  const paginationDragRef = React.useRef(null);
  const paginationSuppressClickRef = React.useRef(false);
  React.useEffect(() => {
    setPaginationDragPage(null);
    paginationDragRef.current = null;
    paginationSuppressClickRef.current = false;
  }, [indexedPhotoPage, indexedPhotoTotal]);
  const renderGalleryPagination = () => {
    if (!usingPhotoIndex || indexedPhotoComplete || typeof onIndexedPhotoPageChange !== 'function') return null;
    const pageCount = Math.max(1, Math.ceil(Number(indexedPhotoTotal || 0) / 100));
    if (pageCount <= 1) return null;
    const windowSize = isMobile ? 5 : 10;
    const focusPage = paginationDragPage != null ? paginationDragPage : indexedPhotoPage;
    const pages = getPaginationWindow(focusPage, pageCount, windowSize);
    const go = page => {
      if (indexedPhotoLoading || page < 1 || page > pageCount || page === indexedPhotoPage) return;
      void onIndexedPhotoPageChange(page);
      if (gridHostRef.current) gridHostRef.current.scrollTop = 0;
    };
    // Same chevron used by the month-nav / BackArrowIcon (down path, rotated). Double-stack for
    // first/last. Mobile hides arrows entirely -- number window alone is enough on a phone.
    const chevron = (direction, key) => /*#__PURE__*/React.createElement("svg", {
      key: key,
      xmlns: "http://www.w3.org/2000/svg", width: "18", height: "18", viewBox: "0 0 24 24",
      fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round",
      style: { transform: direction === 'left' ? 'rotate(90deg)' : 'rotate(-90deg)', display: 'inline-block' },
      className: "icon icon-tabler icons-tabler-outline icon-tabler-chevron-down", "aria-hidden": "true"
    },
      /*#__PURE__*/React.createElement("path", { stroke: "none", d: "M0 0h24v24H0z", fill: "none" }),
      /*#__PURE__*/React.createElement("path", { d: "M6 9l6 6l6 -6" })
    );
    const doubleChevron = direction => /*#__PURE__*/React.createElement("span", {
      style: { display: 'inline-flex', alignItems: 'center' }
    },
      chevron(direction, `${direction}-a`),
      /*#__PURE__*/React.createElement("span", { style: { display: 'inline-flex', marginLeft: '-11px' } },
        chevron(direction, `${direction}-b`)
      )
    );
    const arrow = (label, page, disabled, glyph) => /*#__PURE__*/React.createElement("button", {
      key: label, type: "button", className: "gallery-pagination-button gallery-pagination-arrow",
      "aria-label": label, disabled: disabled || indexedPhotoLoading, onClick: () => go(page)
    }, glyph);
    const endMobileDrag = () => {
      const drag = paginationDragRef.current;
      paginationDragRef.current = null;
      if (!drag) return;
      const target = Math.min(pageCount, Math.max(1, Number(drag.focusPage) || indexedPhotoPage));
      setPaginationDragPage(null);
      if (!drag.moved) return;
      // Prevent the synthesized click on the button under the finger from also selecting a page.
      paginationSuppressClickRef.current = true;
      if (target !== indexedPhotoPage) go(target);
    };
    const mobileDragProps = isMobile ? {
      onPointerDown: event => {
        if (indexedPhotoLoading || event.button != null && event.button !== 0) return;
        paginationDragRef.current = {
          pointerId: event.pointerId,
          startX: event.clientX,
          originPage: focusPage,
          focusPage,
          moved: false
        };
        try { event.currentTarget.setPointerCapture(event.pointerId); } catch (_) { /* ignore */ }
      },
      onPointerMove: event => {
        const drag = paginationDragRef.current;
        if (!drag || drag.pointerId !== event.pointerId) return;
        const delta = event.clientX - drag.startX;
        if (Math.abs(delta) < 12 && !drag.moved) return;
        // Drag left reveals higher page numbers (content moves with the finger).
        const pageDelta = Math.round(-delta / 44);
        const next = Math.min(pageCount, Math.max(1, drag.originPage + pageDelta));
        drag.moved = true;
        drag.focusPage = next;
        if (paginationDragPage !== next) setPaginationDragPage(next);
        event.preventDefault();
      },
      onPointerUp: endMobileDrag,
      onPointerCancel: endMobileDrag
    } : {};
    return /*#__PURE__*/React.createElement("nav", {
      className: `gallery-pagination${isMobile ? ' is-mobile is-swipeable' : ''}`,
      "aria-label": "갤러리 페이지",
      ...mobileDragProps
    },
      !isMobile && arrow('첫 페이지', 1, indexedPhotoPage <= 1, doubleChevron('left')),
      !isMobile && arrow('이전 페이지', indexedPhotoPage - 1, indexedPhotoPage <= 1, chevron('left')),
      pages.map(page => /*#__PURE__*/React.createElement("button", {
        key: page, type: "button", className: `gallery-pagination-button${page === indexedPhotoPage ? ' is-active' : ''}${page === focusPage && page !== indexedPhotoPage ? ' is-focus' : ''}`,
        "aria-current": page === indexedPhotoPage ? 'page' : undefined,
        disabled: indexedPhotoLoading,
        onClick: event => {
          if (paginationSuppressClickRef.current) {
            paginationSuppressClickRef.current = false;
            event.preventDefault();
            event.stopPropagation();
            return;
          }
          go(page);
        }
      }, String(page))),
      !isMobile && arrow('다음 페이지', indexedPhotoPage + 1, indexedPhotoPage >= pageCount, chevron('right')),
      !isMobile && arrow('마지막 페이지', pageCount, indexedPhotoPage >= pageCount, doubleChevron('right'))
    );
  };
  // Distinguishes "haven't finished loading this calendar's history yet" from "genuinely no
  // photos here" -- totalGalleryCount (a global, all-months count fetched once) used to stand in
  // for this, which made an empty month falsely claim there was more to load via a '더보기'
  // button that showLoadMore (driven by the same hasMoreOlderChat/loadingOlderChat pair used
  // here) wasn't actually rendering. hasMoreOlderChat/loadingOlderChat are the real signal: once
  // pagination reports nothing left to fetch, whatever's already in chatMessages/memos is the
  // complete data set, so an empty result here means the month/gallery truly has none.
  const describeGalleryPhotoEmptyState = emptyMessage => {
    if (loadingOlderChat) return "이전 사진을 불러오는 중…";
    if (hasMoreOlderChat) return "아직 모든 사진을 불러오지 않았습니다. 아래 더보기를 눌러 주세요.";
    return emptyMessage;
  };
  const describeGalleryLinkEmptyState = emptyMessage => {
    if (hasMoreOlderChat || hasMoreMemos) return "아직 모든 링크를 불러오지 않았습니다. 아래 더보기를 눌러 주세요.";
    return emptyMessage;
  };
  // Count + 붙여넣기/추가 header shown above the flat (전체) list -- same module the date modal's
  // own 사진 tab uses (label left, action buttons right), reused here for visual consistency.
  // Mobile-only 전체|일자 pill (same markup/styles as the former visit-filter-toggle-mobile
  // that lived beside the 사진|링크 tabs). Desktop keeps the filter in the page header.
  // Shell is 44px + 3px padding; do not set minHeight:44px on inner segments or purple bleed
  // past the gray pill border on iOS Safari. Clip with overflow:hidden.
  const renderVisitFilterToggleMobile = () => /*#__PURE__*/React.createElement("div", {
    className: "visit-filter-toggle-mobile",
    style: {
      display: 'inline-flex', alignItems: 'center', height: '44px', boxSizing: 'border-box',
      padding: '3px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)',
      backgroundColor: 'var(--bg-card)', flexShrink: 0, overflow: 'hidden'
    }
  },
    [
      { key: 'all', label: '전체' },
      { key: 'date', label: '일자' }
    ].map(tab => /*#__PURE__*/React.createElement("button", {
      key: tab.key,
      type: "button",
      onClick: () => setGalleryViewMode(tab.key),
      style: {
        height: '100%', boxSizing: 'border-box', padding: isMobile ? '0 10px' : '0 14px', fontSize: 'var(--font-size-md)', fontWeight: 900,
        borderRadius: 'var(--radius-sm)', border: 'none', cursor: 'pointer',
        backgroundColor: galleryViewMode === tab.key ? '#4F46E5' : 'transparent',
        color: galleryViewMode === tab.key ? '#FFFFFF' : 'var(--text-muted)'
      }
    }, tab.label))
  );
  const renderPhotoListHeader = () => /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      gap: isMobile ? '6px' : '8px', marginBottom: '4px', minWidth: 0
    }
  },
    isMobile
      ? renderVisitFilterToggleMobile()
      : /*#__PURE__*/React.createElement("label", {
          style: { fontSize: 'var(--font-size-md)', fontWeight: 800, color: 'var(--text-muted)' }
        }, `등록된 사진 (${displayPhotoTabCount}장)`),
    /*#__PURE__*/React.createElement("div", {
      style: { display: 'flex', alignItems: 'center', gap: isMobile ? '4px' : '6px', flexShrink: 0, minWidth: 0 }
    },
      isBulkShareMode
        ? /*#__PURE__*/React.createElement(React.Fragment, null,
            /*#__PURE__*/React.createElement("button", {
              type: "button",
              className: "btn btn-action btn-action-outline",
              onClick: handleToggleBulkShareMode,
              disabled: isGeneratingBulkShareUrl,
              style: { height: '44px', minHeight: '44px', padding: '0 14px', borderRadius: 'var(--radius-md)', fontSize: 'var(--font-size-md)', fontWeight: 900, cursor: 'pointer' }
            }, "취소"),
            /*#__PURE__*/React.createElement("button", {
              type: "button",
              className: "btn btn-action btn-action-dark",
              onClick: handleClickBulkShare,
              disabled: selectedBulkShareKeys.size === 0 || isGeneratingBulkShareUrl,
              style: {
                height: '44px', minHeight: '44px', padding: '0 14px', borderRadius: 'var(--radius-md)', fontSize: 'var(--font-size-md)', fontWeight: 900,
                cursor: (selectedBulkShareKeys.size === 0 || isGeneratingBulkShareUrl) ? 'default' : 'pointer',
                opacity: (selectedBulkShareKeys.size === 0 || isGeneratingBulkShareUrl) ? 0.5 : 1
              }
            }, isGeneratingBulkShareUrl ? "생성 중..." : `일괄공유${selectedBulkShareKeys.size > 0 ? ` (${selectedBulkShareKeys.size})` : ''}`)
          )
        : /*#__PURE__*/React.createElement(React.Fragment, null,
            // 배경 없이 텍스트만 -- 이 헤더의 나머지 두 버튼(추가/편집)은 아이콘 전용이라
            // 시각적 무게가 가벼워졌으므로, 가장 덜 쓰이는 이 버튼까지 배경을 남겨두면 상대적으로
            // 튀어 보인다.
            /*#__PURE__*/React.createElement("button", {
              type: "button",
              className: "btn btn-action btn-action-outline",
              onClick: handlePasteGalleryUpload,
              style: {
                height: '44px', minHeight: '44px',
                padding: isMobile ? '0 8px' : '0 12px',
                borderRadius: 'var(--radius-md)', fontSize: 'var(--font-size-md)', fontWeight: 900, cursor: 'pointer',
                flexShrink: 0
              }
            }, "붙여넣기"),
            /*#__PURE__*/React.createElement("button", {
              type: "button",
              className: "btn btn-action btn-action-dark",
              onClick: handleUploadClick,
              title: "추가",
              "aria-label": "추가",
              style: {
                height: '44px', minHeight: '44px', width: '44px', minWidth: '44px', maxWidth: '44px',
                padding: 0, borderRadius: 'var(--radius-md)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                flexShrink: 0, aspectRatio: '1 / 1', boxSizing: 'border-box'
              }
            }, PlusIcon ? /*#__PURE__*/React.createElement(PlusIcon, { size: 16 }) : "+"),
            /*#__PURE__*/React.createElement("button", {
              type: "button",
              className: "btn btn-action btn-action-outline",
              onClick: handleToggleBulkShareMode,
              title: "편집",
              "aria-label": "편집",
              style: {
                height: '44px', minHeight: '44px', width: '44px', minWidth: '44px', maxWidth: '44px',
                padding: 0, borderRadius: 'var(--radius-md)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                flexShrink: 0, aspectRatio: '1 / 1', boxSizing: 'border-box'
              }
            }, PencilIcon ? /*#__PURE__*/React.createElement(PencilIcon, { size: 15 }) : "편집")
          )
    )
  );
  const renderLinkListHeader = () => /*#__PURE__*/React.createElement("div", {
    style: { display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '4px' }
  },
    /*#__PURE__*/React.createElement("div", {
      style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }
    },
      isMobile
        ? renderVisitFilterToggleMobile()
        : /*#__PURE__*/React.createElement("label", {
            style: { fontSize: 'var(--font-size-md)', fontWeight: 800, color: 'var(--text-muted)' }
          }, `등록된 링크 (${filteredLinks.length}개)`),
      /*#__PURE__*/React.createElement("div", {
        style: { display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }
      },
        /*#__PURE__*/React.createElement("button", {
          type: "button",
          className: "btn btn-action btn-action-outline",
          disabled: isSavingLink,
          onClick: handlePasteLinkFromClipboard,
          style: { height: '44px', minHeight: '44px', padding: '0 14px', borderRadius: 'var(--radius-md)', fontSize: 'var(--font-size-md)', fontWeight: 900, cursor: isSavingLink ? 'wait' : 'pointer' }
        }, "붙여넣기"),
        /*#__PURE__*/React.createElement("button", {
          type: "button",
          className: "btn btn-action btn-action-dark",
          disabled: isSavingLink,
          onClick: handleToggleAddLink,
          style: { height: '44px', minHeight: '44px', padding: '0 14px', borderRadius: 'var(--radius-md)', fontSize: 'var(--font-size-md)', fontWeight: 900, cursor: isSavingLink ? 'wait' : 'pointer' }
        }, isSavingLink ? "저장 중..." : (isAddingLink ? "취소" : "추가"))
      )
    ),
    isAddingLink && /*#__PURE__*/React.createElement("div", {
      style: { display: 'flex', gap: '8px', alignItems: 'center', width: '100%' }
    },
      /*#__PURE__*/React.createElement("input", {
        type: "url",
        className: "form-input",
        value: linkUrlInput,
        onChange: e => setLinkUrlInput(e.target.value),
        placeholder: "https://...",
        autoFocus: true,
        style: { flex: 1, minWidth: 0, height: '40px', borderRadius: '8px', fontSize: 'var(--font-size-base)' },
        onKeyDown: e => { if (e.key === 'Enter') { e.preventDefault(); handleSubmitLinkInput(); } }
      }),
      /*#__PURE__*/React.createElement("button", {
        type: "button",
        className: "btn btn-action btn-action-dark",
        disabled: isSavingLink,
        onClick: handleSubmitLinkInput,
        style: { height: '40px', padding: '0 14px', borderRadius: '8px', fontSize: 'var(--font-size-md)', fontWeight: 900, flexShrink: 0, cursor: isSavingLink ? 'wait' : 'pointer' }
      }, "등록")
    )
  );
  const renderGalleryContent = () => {
    if (activeTab === 'photos' && usingPhotoIndex && indexedPhotoStatus !== 'ready') {
      const failed = indexedPhotoStatus === 'error';
      return /*#__PURE__*/React.createElement(React.Fragment, null,
        renderPhotoListHeader(),
        /*#__PURE__*/React.createElement("div", {
          role: failed ? 'alert' : 'status',
          style: { textAlign: 'center', color: 'var(--text-muted)', padding: '40px 0', fontSize: 'var(--font-size-base)' }
        }, failed
          ? /*#__PURE__*/React.createElement("button", {
              type: "button",
              className: "btn btn-action btn-action-outline",
              onClick: () => { if (typeof onIndexedPhotoPageChange === 'function') void onIndexedPhotoPageChange(indexedPhotoPage || 1, { force: true }); },
              style: { minHeight: '44px', padding: '0 16px', borderRadius: 'var(--radius-md)', fontWeight: 800 }
            }, "사진 목록 다시 불러오기")
          : "사진 목록을 불러오는 중…")
      );
    }
    if (galleryViewMode === 'date') {
      const isLinkMode = activeTab === 'links';
      const isFileMode = activeTab === 'files';
      const monthExhausted = activeTab === 'photos' && exhaustedGalleryMonthKey === galleryMonthKey;
      // Date mode: do not gate on hasLocallyHiddenPhotos (flat slice). Photos already group from
      // visiblePhotos; only older-chat pagination (plus loading) matters. Hide when this month
      // was exhausted by a load that added zero month photos.
      const showLoadMore = isLinkMode
        ? (hasMoreOlderChat || hasMoreMemos)
        : (isFileMode ? hasMoreOlderChat : ((hasMoreOlderChat || loadingOlderChat) && !monthExhausted));
      const loadMoreNode = showLoadMore && !(searchQuery || '').trim() && (
        isLinkMode
          ? renderGalleryLoadMoreButton({
              label: `이전 링크 더 보기 (${filteredLinks.length}개 불러옴)`,
              loadingLabel: '이전 링크를 불러오는 중…',
              disabled: !!loadingOlderChat,
              onClick: () => {
                if (typeof onLoadOlderChat === 'function' && hasMoreOlderChat && !loadingOlderChat) onLoadOlderChat();
                if (typeof onLoadMoreMemos === 'function' && hasMoreMemos) onLoadMoreMemos();
              }
            })
          : renderGalleryLoadMoreButton({
              label: isFileMode ? `이전 파일 더 보기 (${filteredFiles.length}개 불러옴)` : `이전 사진 더 보기 (${visiblePhotos.length}장 불러옴)`,
              loadingLabel: isFileMode ? '이전 파일을 불러오는 중…' : '이전 사진을 불러오는 중…',
              disabled: !!loadingOlderChat,
              onClick: () => {
                if (typeof onLoadOlderChat === 'function' && hasMoreOlderChat && !loadingOlderChat) onLoadOlderChat();
              }
            })
      );
      return /*#__PURE__*/React.createElement(React.Fragment, null,
        // Keep 전체|일자 + 붙여넣기/추가 toolbar visible in date mode (same mobile header as flat).
        isLinkMode ? renderLinkListHeader() : (isFileMode ? renderFileListHeader() : renderPhotoListHeader()),
        renderGalleryMonthNavigator(),
        groupedGallerySections.length === 0 ? /*#__PURE__*/React.createElement("div", {
          style: { textAlign: 'center', color: 'var(--text-muted)', padding: '40px 0', fontSize: 'var(--font-size-base)' }
        }, searchQuery
          ? "검색 결과가 없습니다."
          : (isLinkMode
            ? describeGalleryLinkEmptyState("이 달에 공유된 링크가 없습니다.")
            : (isFileMode ? "이 달에 업로드된 파일이 없습니다." : describeGalleryPhotoEmptyState("이 달에 등록된 사진이 없습니다."))))
        // Same per-date section module the settlement page's 월별보기 tab uses for its daily
        // rows (icon + date label on the left, a pill badge + SectionToggleButton on the right),
        // re-skinned with a plain item count instead of a +/- amount.
        : groupedGallerySections.map(section => {
          const isCollapsed = collapsedGalleryDates.has(section.dateKey);
          return /*#__PURE__*/React.createElement("section", {
          key: section.dateKey,
          style: { border: 'none', borderRadius: 'var(--radius-md)', padding: '12px', backgroundColor: '#FFFFFF' }
        },
            /*#__PURE__*/React.createElement("div", {
              style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', marginBottom: isCollapsed ? 0 : '10px' }
            },
              /*#__PURE__*/React.createElement("strong", {
                style: { fontSize: '0.92rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }
              }, /*#__PURE__*/React.createElement(CalendarCheckIcon, null), section.label),
              /*#__PURE__*/React.createElement("span", {
                style: { display: 'inline-flex', alignItems: 'center', gap: '6px', marginLeft: 'auto', whiteSpace: 'nowrap' }
              },
                /*#__PURE__*/React.createElement("span", {
                  style: {
                    fontSize: 'var(--font-size-md)', fontWeight: 900, color: '#FFFFFF',
                    backgroundColor: 'var(--status-green)', padding: '4px 10px', borderRadius: 'var(--radius-full)'
                  }
                }, section.items.length),
                /*#__PURE__*/React.createElement(SectionToggleButton, {
                  collapsed: isCollapsed,
                  onToggle: () => toggleGalleryDate(section.dateKey),
                  label: `${section.label} ${isLinkMode ? '링크' : (isFileMode ? '파일' : '사진')}`
                })
              )
            ),
            !isCollapsed && /*#__PURE__*/React.createElement("div", {
              id: `gallery-date-items-${section.dateKey}`,
              style: { display: 'flex', flexDirection: 'column', gap: '8px' }
            }, isLinkMode ? renderGalleryLinkList(section.items) : (isFileMode ? renderGalleryFileList(section.items) : renderGalleryPhotoGrid(section.items, visiblePhotos)))
          );
        }),
        loadMoreNode
      );
    }
    if (activeTab === 'files') {
      const sortedFiles = sortGalleryFlatItems(filteredFiles);
      return /*#__PURE__*/React.createElement(React.Fragment, null,
        renderFileListHeader(),
        sortedFiles.length === 0 ? /*#__PURE__*/React.createElement("div", {
          style: { textAlign: 'center', color: 'var(--text-muted)', padding: '40px 0', fontSize: 'var(--font-size-base)' }
        }, searchQuery ? "검색 결과가 없습니다." : "업로드된 파일이 없습니다.") : renderGalleryFileList(sortedFiles),
        (hasMoreOlderChat) && !(searchQuery || '').trim() && renderGalleryLoadMoreButton({
          label: `이전 파일 더 보기 (${filteredFiles.length}개 불러옴)`,
          loadingLabel: '이전 파일을 불러오는 중…',
          disabled: !!loadingOlderChat,
          onClick: () => {
            if (typeof onLoadOlderChat === 'function' && hasMoreOlderChat && !loadingOlderChat) onLoadOlderChat();
          }
        })
      );
    }
    if (activeTab === 'links') {
      const sortedLinks = sortGalleryFlatItems(filteredLinks);
      return /*#__PURE__*/React.createElement(React.Fragment, null,
        renderLinkListHeader(),
        sortedLinks.length === 0 ? /*#__PURE__*/React.createElement("div", {
          style: { textAlign: 'center', color: 'var(--text-muted)', padding: '40px 0', fontSize: 'var(--font-size-base)' }
        }, searchQuery ? "검색 결과가 없습니다." : "공유된 링크가 없습니다.") : renderGalleryLinkList(sortedLinks),
        (hasMoreOlderChat || hasMoreMemos) && !(searchQuery || '').trim() && renderGalleryLoadMoreButton({
          label: `이전 링크 더 보기 (${filteredLinks.length}개 불러옴)`,
          loadingLabel: '이전 링크를 불러오는 중…',
          disabled: !!loadingOlderChat,
          onClick: () => {
            if (typeof onLoadOlderChat === 'function' && hasMoreOlderChat && !loadingOlderChat) onLoadOlderChat();
            if (typeof onLoadMoreMemos === 'function' && hasMoreMemos) onLoadMoreMemos();
          }
        })
      );
    }
    const sortedVisiblePhotos = sortGalleryFlatItems(visiblePhotos);
    const renderedKeys = new Set(renderedPhotos.map(getPhotoKey));
    const sortedPhotos = sortedVisiblePhotos.filter(photo => renderedKeys.has(getPhotoKey(photo)));
    return /*#__PURE__*/React.createElement(React.Fragment, null,
      renderPhotoListHeader(),
      sortedPhotos.length === 0 ? /*#__PURE__*/React.createElement("div", {
        style: { textAlign: 'center', color: 'var(--text-muted)', padding: '40px 0', fontSize: 'var(--font-size-base)' }
      }, searchQuery
        ? "검색 결과가 없습니다."
        : describeGalleryPhotoEmptyState("공유된 사진이 없습니다."))
      : renderGalleryPhotoGrid(sortedPhotos, sortedVisiblePhotos),
      usingPhotoIndex && !(searchQuery || '').trim() && renderGalleryPagination(),
      (hasLocallyHiddenPhotos || hasMoreOlderChat || loadingOlderChat) && !(searchQuery || '').trim() && renderGalleryLoadMoreButton({
        label: hasLocallyHiddenPhotos ? `사진 더 보기 (${visiblePhotos.length}장 불러옴)` : `이전 사진 더 보기 (${visiblePhotos.length}장 불러옴)`,
        loadingLabel: '이전 사진을 불러오는 중…',
        disabled: !!loadingOlderChat && !hasLocallyHiddenPhotos,
        onClick: loadMorePhotos
      })
    );
  };

  const galleryTree = /*#__PURE__*/React.createElement("div", {
    className: asPage ? "gallery-page-container" : "modal-overlay",
    onClick: asPage ? undefined : onClose,
    style: galleryShellStyle
  }, /*#__PURE__*/React.createElement(asPage ? "div" : ResizableModalContainer, asPage ? {
    className: "gallery-page-inner", style: galleryInnerStyle
  } : {
    className: "modal-container", onClick: e => e.stopPropagation(), style: galleryInnerStyle
  },
  /*#__PURE__*/React.createElement("div", {
    className: asPage ? "gallery-page-header" : "modal-header",
    style: galleryHeaderStyle
  },
    asPage
      ? /*#__PURE__*/React.createElement(React.Fragment, null,
          /*#__PURE__*/React.createElement("button", {
            type: "button", onClick: onClose, "aria-label": "뒤로가기",
            style: {
              width: '36px', height: '36px', borderRadius: '50%', background: 'transparent', border: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-muted)', flexShrink: 0
            }
          }, /*#__PURE__*/React.createElement(BackArrowIcon, { size: 22 })),
          /*#__PURE__*/React.createElement("div", {
            style: {
              position: 'absolute', left: '50%', transform: 'translateX(-50%)',
              display: 'flex', alignItems: 'center', fontWeight: 800, fontSize: '0.95rem',
              color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden',
              textOverflow: 'ellipsis', maxWidth: 'calc(100vw - 120px)', pointerEvents: 'none'
            }
          }, formatChatHeaderTitle(calendar?.title) ? formatChatHeaderTitle(calendar?.title) + " 갤러리" : "갤러리"),
          /*#__PURE__*/React.createElement("div", {
            style: { display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }
          },
            /* Desktop view-mode filter: 전체 | 일자 (Only on PC -- mobile gets its own row
               below the header, matching the places page's desktop-vs-mobile filter split). */
            !isMobile && /*#__PURE__*/React.createElement("div", {
              className: "visit-filter-toggle-desktop",
              style: {
                display: 'flex', alignItems: 'center', gap: '2px',
                backgroundColor: 'var(--bg-primary)', padding: '3px', borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)'
              }
            },
              [
                { key: 'all', label: '전체' },
                { key: 'date', label: '일자' }
              ].map(tab => /*#__PURE__*/React.createElement("button", {
                key: tab.key,
                type: "button",
                onClick: () => setGalleryViewMode(tab.key),
                style: {
                  padding: '4px 10px', fontSize: 'var(--font-size-sm)', fontWeight: 800, borderRadius: 'var(--radius-sm)', border: 'none', cursor: 'pointer',
                  backgroundColor: galleryViewMode === tab.key ? '#4F46E5' : 'transparent',
                  color: galleryViewMode === tab.key ? '#FFFFFF' : 'var(--text-muted)'
                }
              }, tab.label))
            ),
            /*#__PURE__*/React.createElement("button", {
              type: "button",
              onClick: () => setIsSearchOpen(prev => { if (prev) setSearchQuery(''); return !prev; }),
              title: "갤러리 검색", "aria-label": "갤러리 검색",
              style: {
                background: 'none', border: 'none', cursor: 'pointer', padding: '6px',
                color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
              }
            }, /*#__PURE__*/React.createElement("svg", {
              xmlns: "http://www.w3.org/2000/svg", width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true
            }, /*#__PURE__*/React.createElement("circle", { cx: "11", cy: "11", r: "8" }), /*#__PURE__*/React.createElement("path", { d: "m21 21-4.3-4.3" }))),
            /*#__PURE__*/React.createElement("button", {
              type: "button",
              onClick: () => setIsMenuOpen(true),
              title: "갤러리 메뉴", "aria-label": "갤러리 메뉴 열기",
              style: {
                background: 'none', border: 'none', cursor: 'pointer', padding: '6px',
                color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
              }
            }, renderMenuIcon())
          )
        )
      : /*#__PURE__*/React.createElement(React.Fragment, null,
          /*#__PURE__*/React.createElement("h3", {
            style: { fontSize: '1.05rem', fontWeight: 900, color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap', flex: 1 }
          }, "갤러리"),
          /*#__PURE__*/React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 } },
            /*#__PURE__*/React.createElement("button", {
              type: "button",
              onClick: () => setIsSearchOpen(prev => { if (prev) setSearchQuery(''); return !prev; }),
              style: { display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6px', border: 0, background: 'none', cursor: 'pointer', color: 'var(--text-muted)' }
            }, /*#__PURE__*/React.createElement("svg", {
              xmlns: "http://www.w3.org/2000/svg", width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true
            }, /*#__PURE__*/React.createElement("circle", { cx: "11", cy: "11", r: "8" }), /*#__PURE__*/React.createElement("path", { d: "m21 21-4.3-4.3" }))),
            /*#__PURE__*/React.createElement("button", {
              type: "button", className: "modal-close-btn", onClick: onClose, "aria-label": "닫기",
              style: { display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px', border: 0, background: 'none', cursor: 'pointer', color: 'var(--text-muted)' }
            }, /*#__PURE__*/React.createElement(SmallXIcon, { size: 20 }))
          )
        )
  ),
  /*#__PURE__*/React.createElement("input", {
    ref: uploadInputRef,
    type: "file",
    accept: "image/jpeg, image/png, image/gif, image/webp, image/heic, image/heif, image/*",
    multiple: true,
    onChange: handleUploadChange,
    style: { display: 'none' }
  }),
  asPage && isMenuOpen && typeof document !== 'undefined' && window.ReactDOM && window.ReactDOM.createPortal
    ? window.ReactDOM.createPortal(/*#__PURE__*/React.createElement("div", {
    className: "admin-side-menu-overlay",
    onClick: () => setIsMenuOpen(false)
  }, /*#__PURE__*/React.createElement("nav", {
    className: "admin-side-menu",
    "aria-label": "갤러리 메뉴",
    onClick: e => e.stopPropagation()
  },
    /*#__PURE__*/React.createElement("div", { className: "admin-side-menu-header" },
      /*#__PURE__*/React.createElement("div", { className: "admin-side-menu-brand" },
        /*#__PURE__*/React.createElement("div", { className: "admin-side-menu-copy" },
          /*#__PURE__*/React.createElement("button", {
            type: "button",
            className: "admin-side-menu-title",
            title: "메인 화면으로 이동",
            "aria-label": "메인 화면으로 이동",
            onClick: () => { setIsMenuOpen(false); if (typeof onChangeView === 'function') onChangeView('calendar'); else if (typeof onClose === 'function') onClose(); },
            style: {
              background: 'none', border: 'none', padding: 0, margin: 0,
              color: 'inherit',
              cursor: 'pointer', textAlign: 'left',
              display: 'flex', alignItems: 'center', gap: '6px'
            }
          }, BackArrowIcon && /*#__PURE__*/React.createElement(BackArrowIcon, { size: 18 }), "갤러리")
        )
      ),
      /*#__PURE__*/React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 } },
        WeatherBadge ? /*#__PURE__*/React.createElement(WeatherBadge, { weatherLocation: calendar && calendar.weatherLocation }) : null,
        /*#__PURE__*/React.createElement("button", {
          type: "button",
          className: "admin-side-menu-close-btn",
          onClick: () => setIsMenuOpen(false),
          "aria-label": "메뉴 닫기"
        }, /*#__PURE__*/React.createElement(SmallXIcon, { size: 20 }))
      )
    ),
    /*#__PURE__*/React.createElement("div", { className: "admin-side-menu-list" },
      /*#__PURE__*/React.createElement("button", {
        type: "button",
        className: "admin-side-menu-item",
        onClick: () => { setIsMenuOpen(false); setIsSearchOpen(true); }
      },
        /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-icon" }, /*#__PURE__*/React.createElement("svg", {
          xmlns: "http://www.w3.org/2000/svg", width: "20", height: "20", viewBox: "0 0 24 24",
          fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round"
        }, /*#__PURE__*/React.createElement("circle", { cx: "11", cy: "11", r: "8" }), /*#__PURE__*/React.createElement("path", { d: "m21 21-4.3-4.3" }))),
        /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-copy" },
          /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-title" }, "갤러리 검색"),
          /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-desc" }, "사진·링크·파일 통합 검색")
        )
      ),
      /*#__PURE__*/React.createElement("div", {
        style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', paddingRight: '8px' }
      },
        /*#__PURE__*/React.createElement("button", {
          type: "button",
          className: "admin-side-menu-item",
          onClick: handleUploadClick,
          style: { flex: 1 }
        },
          /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-icon" }, renderGalleryUploadIcon()),
          /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-copy" },
            /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-title" }, "이미지 업로드"),
            /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-desc" }, "갤러리에 사진을 바로 추가")
          )
        ),
        /*#__PURE__*/React.createElement("button", {
          type: "button",
          className: "btn btn-action btn-action-outline",
          disabled: !hasClipboardImage,
          onClick: handlePasteGalleryUpload,
          title: hasClipboardImage ? undefined : '클립보드에 붙여넣을 이미지가 없습니다.',
          style: {
            padding: '4px 10px',
            fontSize: 'var(--font-size-sm)',
            fontWeight: 900,
            borderRadius: 'var(--radius-md)',
            cursor: hasClipboardImage ? 'pointer' : 'default',
            flexShrink: 0,
            whiteSpace: 'nowrap'
          }
        }, "붙여넣기")
      ),
    ),
    typeof SharedAppNavBlock === 'function' && /*#__PURE__*/React.createElement(SharedAppNavBlock, {
      onClose: () => setIsMenuOpen(false),
      onChangeView: onChangeView,
      chatCount: chatCount,
      settlementBadge: settlementBadge,
      galleryCount: galleryCount,
      placeCount: placeCount,
      memoCount: memoCount,
      historyCount: historyCount,
      chatLastAuthor: chatLastAuthor,
      settlementLastDate: settlementLastDate,
      galleryLastDate: galleryLastDate,
      placeLastName: placeLastName,
      memoLastTitleWord: memoLastTitleWord
    }),
    typeof SharedSideMenuFooter === 'function' && /*#__PURE__*/React.createElement(SharedSideMenuFooter, {
      onClose: () => setIsMenuOpen(false),
      onOpenShare: onOpenShare,
      onOpenSettings: onOpenAppSettings,
      shareLabel: '공유'
    })
  )), document.body)
    : null,
  isSearchOpen && /*#__PURE__*/React.createElement(InlineSearchBar, {
    value: searchQuery,
    placeholder: "사진·링크·파일 통합 검색 (태그, 텍스트, URL)",
    onChange: e => setSearchQuery(e.target.value),
    fixed: !!asPage,
    style: asPage ? {
      borderBottom: 'none',
      boxShadow: 'none',
      transition: 'transform 0.3s ease',
      transform: isHeaderVisible ? 'translateY(0)' : 'translateY(-100%)'
    } : { borderBottom: '1px solid var(--border-subtle)' },
    onClose: () => { setIsSearchOpen(false); setSearchQuery(''); }
  }), asPage && !isMobile && /*#__PURE__*/React.createElement("div", {
    className: "gallery-page-tabs",
    style: {
      display: 'flex', alignItems: 'center', padding: '0',
      borderBottom: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-card)',
      flexShrink: 0,
      position: 'fixed', top: `calc(${isSearchOpen ? '104px' : '56px'} + env(safe-area-inset-top, 0px))`, left: 0, right: 0, zIndex: 1009,
      transition: 'transform 0.3s ease, top 0.3s ease',
      transform: isHeaderVisible ? 'translateY(0)' : 'translateY(calc(-100% - 56px))'
    }
  },
    UnderlineTabs && /*#__PURE__*/React.createElement(UnderlineTabs, {
      ariaLabel: "갤러리 탭",
      value: activeTab,
      onChange: v => setActiveTab(v),
      style: { backgroundColor: 'var(--bg-card)', flex: 1, borderBottom: 'none' },
      options: [
        { value: 'photos', label: '사진' },
        { value: 'links', label: '링크' },
        { value: 'files', label: '파일' }
      ]
    })
  ), asPage && isMobile && /*#__PURE__*/React.createElement("div", {
    className: "gallery-page-tabs-mobile",
    style: {
      display: 'flex', alignItems: 'center', padding: '0',
      borderBottom: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-card)',
      flexShrink: 0,
      position: 'fixed', top: `calc(${isSearchOpen ? '104px' : '56px'} + env(safe-area-inset-top, 0px))`, left: 0, right: 0, zIndex: 1009,
      transition: 'transform 0.3s ease, top 0.3s ease',
      transform: isHeaderVisible ? 'translateY(0)' : 'translateY(calc(-100% - 56px))'
    }
  },
    UnderlineTabs && /*#__PURE__*/React.createElement(UnderlineTabs, {
      ariaLabel: "갤러리 탭",
      value: activeTab,
      onChange: v => setActiveTab(v),
      style: { backgroundColor: 'var(--bg-card)', flex: 1, borderBottom: 'none' },
      options: [
        { value: 'photos', label: '사진' },
        { value: 'links', label: '링크' },
        { value: 'files', label: '파일' }
      ]
    })
  ), /*#__PURE__*/React.createElement("div", {
    ref: gridHostRef,
    className: asPage ? "gallery-page-scroll" : undefined,
    onScroll: asPage ? handleGalleryContentScroll : undefined,
    style: {
      flex: 1, overflowY: 'auto', minHeight: 0,
      overscrollBehavior: 'contain', WebkitOverflowScrolling: 'touch',
      backgroundColor: asPage ? 'var(--bg-primary)' : undefined,
      // When the fixed header/tabs hide via translateY, drop the reserved top padding so the
      // first scroll gesture actually moves thumbnails instead of only eating empty padding.
      // Each top value also adds env(safe-area-inset-top) since the fixed bars above now start
      // that far down on iOS standalone instead of at the very top of the screen (0 elsewhere).
      padding: asPage
        ? (
            `calc(${(!isHeaderVisible
              ? '12px'
              : (isSearchOpen ? '156px' : '108px'))} + env(safe-area-inset-top, 0px))`
            + ' 20px 16px 20px'
          )
        : '16px 20px',
      display: 'flex', flexDirection: 'column', gap: activeTab === 'links' ? '8px' : '12px', boxSizing: 'border-box',
      minWidth: 0
    }
  }, renderGalleryContent())));
  // Same '연월 선택' bottom sheet the settlement page's month-nav opens, portaled the same way
  // (bottom-sheet rule: never nest under a transformed ancestor -- see the settlement page's own
  // comment on this).
  const galleryYearMonthPickerSheet = isGalleryPickerOpen && typeof document !== 'undefined' && ReactDOM.createPortal(
    /*#__PURE__*/React.createElement("div", {
      className: "bottom-sheet-overlay",
      onClick: () => setIsGalleryPickerOpen(false),
      style: { zIndex: 12000 }
    }, /*#__PURE__*/React.createElement("div", {
      className: "bottom-sheet",
      onClick: e => e.stopPropagation()
    },
      /*#__PURE__*/React.createElement("div", { className: "bottom-sheet-header" },
        /*#__PURE__*/React.createElement("h4", null, "연월 선택"),
        /*#__PURE__*/React.createElement("button", {
          type: "button",
          style: { background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.2rem', cursor: 'pointer' },
          onClick: () => setIsGalleryPickerOpen(false)
        }, "✕")
      ),
      /*#__PURE__*/React.createElement("div", { className: "bottom-sheet-body" },
        /*#__PURE__*/React.createElement("div", { style: { marginBottom: '16px' } },
          /*#__PURE__*/React.createElement("label", {
            style: { fontSize: 'var(--font-size-md)', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }
          }, "년도"),
          /*#__PURE__*/React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '10px' } },
            /*#__PURE__*/React.createElement("button", {
              type: "button", className: "btn btn-secondary", style: { padding: '4px 10px', fontSize: 'var(--font-size-base)' },
              onClick: () => setPickerGalleryYear(y => y - 1)
            }, "◀"),
            /*#__PURE__*/React.createElement("span", {
              style: { fontWeight: 800, fontSize: '1.1rem', minWidth: '60px', textAlign: 'center' }
            }, pickerGalleryYear, "년"),
            /*#__PURE__*/React.createElement("button", {
              type: "button", className: "btn btn-secondary", style: { padding: '4px 10px', fontSize: 'var(--font-size-base)' },
              onClick: () => setPickerGalleryYear(y => y + 1)
            }, "▶")
          )
        ),
        /*#__PURE__*/React.createElement("div", { style: { marginBottom: '16px' } },
          /*#__PURE__*/React.createElement("label", {
            style: { fontSize: 'var(--font-size-md)', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }
          }, "월"),
          /*#__PURE__*/React.createElement("div", { style: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' } },
            monthNames.map((name, idx) => /*#__PURE__*/React.createElement("button", {
              key: idx, type: "button", onClick: () => setPickerGalleryMonth(idx),
              style: {
                padding: '6px 4px', borderRadius: 'var(--radius-sm)',
                border: pickerGalleryMonth === idx ? '2px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                background: pickerGalleryMonth === idx ? 'rgba(99, 102, 241, 0.15)' : 'var(--bg-card)',
                color: pickerGalleryMonth === idx ? 'var(--accent-primary)' : 'var(--text-main)',
                fontWeight: pickerGalleryMonth === idx ? 800 : 500, fontSize: 'var(--font-size-md)', cursor: 'pointer'
              }
            }, name))
          )
        ),
        /*#__PURE__*/React.createElement("button", {
          type: "button", className: "btn btn-primary", style: { width: '100%' },
          onClick: applyGalleryPicker
        }, pickerGalleryYear, "년 ", pickerGalleryMonth + 1, "월로 이동")
      )
    )),
    document.body
  );
  const galleryDocumentLightbox = galleryDocLightbox && DocumentLightbox ? /*#__PURE__*/React.createElement(DocumentLightbox, {
    attachments: galleryDocLightbox.attachments,
    index: galleryDocLightbox.index,
    onClose: () => setGalleryDocLightbox(null),
    onNavigate: i => setGalleryDocLightbox(prev => prev ? { ...prev, index: i } : prev)
  }) : null;
  return /*#__PURE__*/React.createElement(React.Fragment, null, galleryTree, pastePreviewModal, gatherPhotoPasteModal, gatherPhotosPasteModal, bulkShareResultModal, galleryYearMonthPickerSheet, galleryDocumentLightbox);
}

  if (typeof window !== 'undefined') {
  window.GATHER_UI_COMPONENTS = Object.assign({}, window.GATHER_UI_COMPONENTS || {}, {
    ChatGalleryModal: ChatGalleryModal,
  });
}
