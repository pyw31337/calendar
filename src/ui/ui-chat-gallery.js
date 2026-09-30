/**
 * Chat / gallery modal (P4-13)
 */

import { composeGalleryPhotos, getPaginationWindow, isMemeKeyboardPhotoEntry, paginateGalleryItems } from '../core/gallery-data.js';
import { PhotoAssetThumb } from './photo-asset-thumb.js';
import { resolveGalleryLightboxTags } from '../core/photo-index.js';
import { buildBulkPhotoTagChanges, normalizePhotoTagTokens } from '../core/bulk-photo-tags.js';
import { useScrollHideHeader } from '../core/use-scroll-hide-header.js';
import { fetchMediaAnalysisFeed, fetchMediaAnalysisPhoto, formatMediaAnalysisTime, recordMediaAnalysisFeedback } from '../core/media-analysis-feed.js';
import { ClipboardPasteIcon } from './ui-icons.js';
import { setTagClipboard, getTagClipboard } from './photo-bulk-action-bar.js';
import { isExternalServiceUrl } from '../core/memo-share-link.js';

/* P6 ESM classic-compat: free names that live scripts shared via global lexical scope */
const GATHER_APP_UTILS = window.GATHER_APP_UTILS || {};
const AI_REVIEW_MAX_TAGS = 20;
const GALLERY_PAGE_SIZE = 100;
const GALLERY_CARD_PAGE_SIZE = 20;
const ANALYSIS_BATCH_FETCH_CONCURRENCY = 6;
function normalizeAnalysisTagList(values) {
  const input = (Array.isArray(values) ? values : [values])
    .flatMap(value => String(value || '').split(/[\s,#]+/));
  return Array.from(new Set(input
    .map(value => String(value || '').replace(/^#+/, '').trim())
    .filter(Boolean))).slice(0, AI_REVIEW_MAX_TAGS);
}
function getAnalysisSuggestedTags(item) {
  return normalizeAnalysisTagList([
    ...(Array.isArray(item?.suggestedTags) ? item.suggestedTags : []),
    ...(Array.isArray(item?.people) ? item.people : []),
    ...(Array.isArray(item?.places) ? item.places : []),
    ...(Array.isArray(item?.meetings) ? item.meetings : [])
  ]);
}

function createAnalysisTagChange(item, photo, finalTags) {
  const assetKey = String(item?.assetKey || photo?.assetKey || '').trim();
  const imageUrl = String(photo?.full || photo?.imageUrl || photo?.url || photo?.directMediaUrl || photo?.thumb || '').trim();
  const thumbUrl = String(photo?.thumb || photo?.thumbUrl || imageUrl).trim();
  return {
    assetKey,
    beforeTags: normalizeAnalysisTagList(photo?.tags || '').join(' '),
    tags: normalizeAnalysisTagList(finalTags).join(' '),
    photo: {
      ...photo,
      assetKey,
      mediaKey: assetKey,
      refKey: assetKey,
      full: imageUrl,
      imageUrl,
      thumb: thumbUrl,
      thumbUrl,
    },
  };
}

function getPhotoTagCompleteness(tagsText, calendar) {
  const rawTags = String(tagsText || '')
    .split(/[\s,#]+/)
    .map(t => t.trim().toLowerCase())
    .filter(Boolean);

  // 1. 날짜: 6자리 숫자 (예: 250615, 250330) 또는 8자리 숫자 (20250615) 또는 YYYY-MM-DD
  const hasDate = rawTags.some(tag => /^\d{6}$/.test(tag) || /^\d{8}$/.test(tag) || /^\d{4}[.\-_]?\d{2}[.\-_]?\d{2}$/.test(tag));

  // 2. 장소: calendar.places 매칭
  const placeNames = (Array.isArray(calendar?.places) ? calendar.places : [])
    .map(p => String(p?.name || p?.title || '').trim().toLowerCase())
    .filter(Boolean);
  const hasPlace = rawTags.some(tag => placeNames.some(name => tag.includes(name) || name.includes(tag)));

  // 3. 인물: calendar.participants 매칭
  const participantNames = (Array.isArray(calendar?.participants) ? calendar.participants : [])
    .map(p => String(p?.name || '').trim().toLowerCase())
    .filter(Boolean);
  const hasPerson = rawTags.some(tag => participantNames.some(name => tag.includes(name) || name.includes(tag)));

  const missing = [];
  if (!hasDate) missing.push('날짜');
  if (!hasPlace) missing.push('장소');
  if (!hasPerson) missing.push('인물');

  return {
    hasDate,
    hasPlace,
    hasPerson,
    isComplete: missing.length === 0,
    missing
  };
}

function getSuggestedDateTag(photo, item) {
  const ts = photo?.timestamp || photo?.capturedAt || item?.lastReceivedAt || item?.analyzedAt;
  if (!ts) return '';
  const date = new Date(Number(ts));
  if (Number.isNaN(date.getTime()) || date.getTime() <= 0) return '';
  const yy = String(date.getFullYear()).slice(2);
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yy}${mm}${dd}`;
}

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
function _getAllDirectMediaImageEntries(msgLike) {
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
      minWidth: 0,
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
        whiteSpace: 'normal',
        wordBreak: 'break-word',
        overflowWrap: 'anywhere',
        lineHeight: 1.45
      }
    }, highlightKeyword(fallbackTitle, searchQuery)),

    /* Primary Link Preview Card */
    /*#__PURE__*/React.createElement(LinkPreviewCard, {
      url: item.url,
      fallbackTitle: fallbackTitle,
      cachedData: item.linkPreview,
      stretch: true,
      wrapTitle: true
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
const GATHER_LINKS_FRAGMENT_PREFIX = '#gatherLinks=';
function encodeGatherLinksFragment(links) {
  try {
    const payload = {
      v: 1,
      kind: 'gather-links',
      links: (links || []).map(item => ({
        url: String(item?.url || '').trim(),
        title: String(item?.title || item?.text || '').trim()
      })).filter(item => /^https?:\/\//i.test(item.url))
    };
    if (!payload.links.length) return '';
    const json = JSON.stringify(payload);
    const b64 = typeof btoa === 'function' ? btoa(unescape(encodeURIComponent(json))) : '';
    return b64 ? GATHER_LINKS_FRAGMENT_PREFIX + b64 : '';
  } catch (_) {
    return '';
  }
}
function parseGatherLinksClipboardText(text) {
  const raw = String(text || '').trim();
  if (!/^https?:\/\//i.test(raw)) return null;
  const markerIndex = raw.indexOf(GATHER_LINKS_FRAGMENT_PREFIX);
  if (markerIndex === -1) return null;
  const b64 = raw.slice(markerIndex + GATHER_LINKS_FRAGMENT_PREFIX.length);
  try {
    const json = decodeURIComponent(escape(atob(b64)));
    const payload = JSON.parse(json);
    if (!payload || payload.kind !== 'gather-links' || !Array.isArray(payload.links)) return null;
    const links = payload.links
      .map(item => ({ url: String(item?.url || '').trim(), title: String(item?.title || '').trim() }))
      .filter(item => /^https?:\/\//i.test(item.url) && isExternalServiceUrl(item.url));
    return links.length ? links : null;
  } catch (_) {
    return null;
  }
}
const GATHER_FILES_FRAGMENT_PREFIX = '#gatherFiles=';
function encodeGatherFilesFragment(files) {
  try {
    const payload = {
      v: 1,
      kind: 'gather-files',
      files: (files || []).map(item => ({
        url: String(item?.url || '').trim(),
        name: String(item?.name || '파일').trim(),
        mime: String(item?.mime || item?.contentType || '').trim(),
        size: Number(item?.size) || 0,
        storagePath: String(item?.storagePath || '').trim(),
        uploadedAt: Number(item?.uploadedAt) || Number(item?.timestamp) || 0,
        id: String(item?.id || '').trim(),
        ext: String(item?.ext || '').trim()
      })).filter(item => /^https?:\/\//i.test(item.url) && item.storagePath)
    };
    if (!payload.files.length) return '';
    const json = JSON.stringify(payload);
    const b64 = typeof btoa === 'function' ? btoa(unescape(encodeURIComponent(json))) : '';
    return b64 ? GATHER_FILES_FRAGMENT_PREFIX + b64 : '';
  } catch (_) {
    return '';
  }
}
function parseGatherFilesClipboardText(text) {
  const raw = String(text || '').trim();
  if (!/^https?:\/\//i.test(raw)) return null;
  const markerIndex = raw.indexOf(GATHER_FILES_FRAGMENT_PREFIX);
  if (markerIndex === -1) return null;
  const b64 = raw.slice(markerIndex + GATHER_FILES_FRAGMENT_PREFIX.length);
  try {
    const json = decodeURIComponent(escape(atob(b64)));
    const payload = JSON.parse(json);
    if (!payload || payload.kind !== 'gather-files' || !Array.isArray(payload.files)) return null;
    const files = payload.files
      .map(item => ({
        url: String(item?.url || '').trim(),
        name: String(item?.name || '파일').trim(),
        mime: String(item?.mime || item?.contentType || '').trim(),
        size: Number(item?.size) || 0,
        storagePath: String(item?.storagePath || '').trim(),
        uploadedAt: Number(item?.uploadedAt) || 0,
        id: String(item?.id || '').trim(),
        ext: String(item?.ext || '').trim()
      }))
      .filter(item => /^https?:\/\//i.test(item.url) && item.storagePath);
    return files.length ? files : null;
  } catch (_) {
    return null;
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
  v2Embed = false,
  onClose,
  onUploadImages = null,
  onAddLink = null,
  onAddFiles = null,
  onDeleteFiles = null,
  onDeleteGalleryLinks = null,
  onRequestConfirm = null,
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
  syncStatus = null,
  onSaveImageTags = null,
  onBulkSaveImageTags = null,
  onRegisterMenuActions = null
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
  const [_v2GallerySlotTick, setV2GallerySlotTick] = React.useState(0);
  React.useEffect(() => {
    if (v2Embed && typeof document !== 'undefined') {
      const el = document.getElementById('v2-gallery-header-tabs-slot');
      if (el) setV2GallerySlotTick(t => t + 1);
    }
  }, [v2Embed]);
  const v2GalleryTabsSlot = v2Embed && typeof document !== 'undefined'
    ? document.getElementById('v2-gallery-header-tabs-slot')
    : null;
  const __deps = window.GATHER_UI_DEPS || {};
  const __comp = window.GATHER_UI_COMPONENTS || {};
  const ResizableModalContainer = __comp.ResizableModalContainer || __deps.ResizableModalContainer || (function Shell(p) { return React.createElement('div', p, p.children); });
  const SmallXIcon = __deps.SmallXIcon;
  const BackArrowIcon = __deps.BackArrowIcon;
  const PlusIcon = __comp.PlusIcon || __deps.PlusIcon;
  const PencilIcon = __comp.PencilIcon || __deps.PencilIcon;
  const TrashIcon = __comp.TrashIcon || __deps.TrashIcon;
  const SearchIcon = __comp.SearchIcon || __deps.SearchIcon;
  const ThreeLinesIcon = __comp.ThreeLinesIcon || __deps.ThreeLinesIcon;
  const EditSelectCheckbox = __comp.EditSelectCheckbox || __deps.EditSelectCheckbox;
  const getListEditActionWrapStyle = __comp.getListEditActionWrapStyle || __deps.getListEditActionWrapStyle;
  const getListEditTextBtnStyle = __comp.getListEditTextBtnStyle || __deps.getListEditTextBtnStyle;
  const LIST_TOOLBAR_ROW_STYLE = __comp.LIST_TOOLBAR_ROW_STYLE || __deps.LIST_TOOLBAR_ROW_STYLE || {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    gap: '8px', padding: '12px 0 4px', minWidth: 0, flexWrap: 'nowrap', flexShrink: 0
  };
  const PAGE_HEADER_ICON_BTN_STYLE = __comp.PAGE_HEADER_ICON_BTN_STYLE || __deps.PAGE_HEADER_ICON_BTN_STYLE || {
    background: 'none', border: 'none', cursor: 'pointer', padding: '6px',
    color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
  };
  const PAGE_HEADER_BACK_BTN_STYLE = __comp.PAGE_HEADER_BACK_BTN_STYLE || __deps.PAGE_HEADER_BACK_BTN_STYLE || {
    width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'transparent', border: 'none',
    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-muted)', flexShrink: 0
  };
  const PAGE_HEADER_ACTIONS_WRAP_STYLE = __comp.PAGE_HEADER_ACTIONS_WRAP_STYLE || __deps.PAGE_HEADER_ACTIONS_WRAP_STYLE || {
    display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0
  };
  const PAGE_HEADER_TITLE_STYLE = __comp.PAGE_HEADER_TITLE_STYLE || __deps.PAGE_HEADER_TITLE_STYLE || {
    position: 'absolute', left: '50%', transform: 'translateX(-50%)',
    display: 'flex', alignItems: 'center', fontWeight: 800, fontSize: '0.95rem',
    color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
    maxWidth: 'calc(100vw - 120px)', pointerEvents: 'none'
  };
  const PhotoCommentCountBadge = __comp.PhotoCommentCountBadge || __deps.PhotoCommentCountBadge || function InlinePhotoCommentCountBadge({ count = 0 } = {}) {
    if (!count) return null;
    const countStr = String(count);
    const isMulti = countStr.length > 1;
    return React.createElement('span', {
      className: `photo-comment-count-badge ${isMulti ? 'is-multi-digit' : 'is-single-digit'}`,
      'data-digits': isMulti ? 'multi' : 'single',
      'aria-label': `댓글 ${count}개`,
      style: {
        position: 'absolute', top: '6px', right: '6px', zIndex: 3,
        minWidth: '22px', height: '22px',
        width: isMulti ? 'auto' : '22px',
        aspectRatio: isMulti ? 'auto' : '1 / 1',
        padding: isMulti ? '0 5.5px' : '0',
        borderRadius: '9999px',
        background: 'rgba(15,23,42,0.78)', color: '#fff',
        fontSize: 'var(--font-size-xs)', fontWeight: 800,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        pointerEvents: 'none', lineHeight: 1
      }
    }, countStr);
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
  const getMessageImageEntries = __deps.getMessageImageEntries;
  const resolveMeetingPhotoDisplay = __deps.resolveMeetingPhotoDisplay;
    const formatChatHeaderTitle = __deps.formatChatHeaderTitle;
    const CalendarCheckIcon = __comp.CalendarCheckIcon || __deps.CalendarCheckIcon;
  const SectionToggleButton = __comp.SectionToggleButton || __deps.SectionToggleButton;

  const [activeTab, setActiveTab] = React.useState('photos');
  const [galleryViewMode, setGalleryViewMode] = React.useState('all'); // 'all' | 'date'
  const [galleryListPage, setGalleryListPage] = React.useState(1);
  const setGalleryTab = next => {
    setActiveTab(next);
    setGalleryListPage(1);
    setSelectedBulkShareKeys(new Set());
  }; // 'photos' | 'links' | 'files' | 'analysis'
  const [analysisViewMode, setAnalysisViewMode] = React.useState('unreviewed'); // 'unreviewed' | 'reviewed'
  const [mediaAnalysis, setMediaAnalysis] = React.useState({ loading: false, error: '', items: [] });
  const [analysisPhotoCache, setAnalysisPhotoCache] = React.useState({});
  const photoByAssetKeyRef = React.useRef(new Map());
  const [isBatchApplying, setIsBatchApplying] = React.useState(false);
  const [batchProgress, setBatchProgress] = React.useState({ current: 0, total: 0 });
  const [analysisAction, setAnalysisAction] = React.useState({ assetKey: '', mode: '', draft: '' });
  const [analysisSavingAssetKey, setAnalysisSavingAssetKey] = React.useState('');
  const loadMediaAnalysis = React.useCallback((force = false) => {
    const calendarId = String(calendar?.id || '').trim();
    const projectId = String(window.__gatherFirebaseConfig?.projectId || '').trim();
    if (!calendarId || !projectId) return Promise.resolve();
    setMediaAnalysis(previous => ({ ...previous, loading: true, error: '' }));
    return fetchMediaAnalysisFeed({ calendarId, projectId, force, limit: 100 })
      .then(items => setMediaAnalysis({ loading: false, error: '', items }))
      .catch(error => setMediaAnalysis(previous => ({ ...previous, loading: false, error: String(error?.message || error) })));
  }, [calendar?.id]);
  React.useEffect(() => {
    if (activeTab === 'analysis') void loadMediaAnalysis();
  }, [activeTab, loadMediaAnalysis]);
  const updateAnalysisReview = React.useCallback((assetKey, review) => {
    setMediaAnalysis(previous => ({
      ...previous,
      items: previous.items.map(item => item.assetKey === assetKey ? { ...item, review } : item)
    }));
  }, []);
  const saveAnalysisReview = React.useCallback(async (item, decision, finalTags = [], acceptedTags = []) => {
    const calendarId = String(calendar?.id || '').trim();
    const projectId = String(window.__gatherFirebaseConfig?.projectId || '').trim();
    if (!calendarId || !projectId || !item?.assetKey) throw new Error('분석 대상을 찾을 수 없습니다.');
    const optimisticReview = {
      decision,
      proposedTags: getAnalysisSuggestedTags(item),
      acceptedTags,
      finalTags,
      reviewedAt: Date.now(),
      reviewCount: (Number(item?.review?.reviewCount) || 0) + 1
    };
    updateAnalysisReview(item.assetKey, optimisticReview);
    if (decision === 'rejected') {
      showToast('추천에서 제외했습니다.', 'info');
    }
    void recordMediaAnalysisFeedback({
      calendarId,
      projectId,
      assetKey: item.assetKey,
      decision,
      proposedTags: getAnalysisSuggestedTags(item),
      acceptedTags,
      finalTags
    }).catch(err => console.warn('Background feedback save warning:', err));
    return optimisticReview;
  }, [calendar?.id, updateAnalysisReview, showToast]);
  const applyAnalysisTags = React.useCallback(async (item, requestedTags = getAnalysisSuggestedTags(item), decision = 'applied', { silent = false } = {}) => {
    const calendarId = String(calendar?.id || '').trim();
    const projectId = String(window.__gatherFirebaseConfig?.projectId || '').trim();
    const saveBulk = onBulkSaveImageTags || window.__gatherBulkSaveImageTags;
    if (!onSaveImageTags && typeof saveBulk !== 'function') throw new Error('이 화면에서 태그 저장 기능을 준비하지 못했습니다.');
    if (!calendarId || !projectId || !item?.assetKey) throw new Error('분석 대상을 찾을 수 없습니다.');

    // 1. Resolve photo from memory cache immediately if available (avoids 1~2s REST delay)
    const cachedPhoto = photoByAssetKeyRef.current.get(item.assetKey) || analysisPhotoCache[item.assetKey] || null;
    let photo = cachedPhoto;
    if (!photo) {
      setAnalysisSavingAssetKey(item.assetKey);
      try {
        photo = await fetchMediaAnalysisPhoto({ calendarId, projectId, assetKey: item.assetKey });
      } catch (err) {
        setAnalysisSavingAssetKey('');
        throw err;
      }
    }

    const finalTags = normalizeAnalysisTagList([photo?.tags || '', ...requestedTags]);
    const changed = finalTags.join(' ') !== normalizeAnalysisTagList(photo?.tags || '').join(' ');

    // 2. Optimistic UI update: Immediately mark review in state so user experiences instant response (0.05s)
    const optimisticReview = {
      decision,
      proposedTags: getAnalysisSuggestedTags(item),
      acceptedTags: requestedTags,
      finalTags,
      reviewedAt: Date.now(),
      reviewCount: (Number(item?.review?.reviewCount) || 0) + 1
    };
    updateAnalysisReview(item.assetKey, optimisticReview);
    setAnalysisAction({ assetKey: '', mode: '', draft: '' });
    setAnalysisSavingAssetKey('');

    if (!silent) {
      showToast(changed ? '태그를 적용했습니다.' : '이미 같은 태그가 적용되어 있어 검토 완료로 표시했습니다.', 'success');
    }

    // 3. Save to server in background without blocking user UI
    try {
      const tagSavePromise = (async () => {
        if (!changed) return true;
        if (typeof saveBulk === 'function') {
          const result = await saveBulk([createAnalysisTagChange(item, photo, finalTags)]);
          return result?.ok;
        } else if (typeof onSaveImageTags === 'function') {
          const sourceOwner = String(photo.tagSourceOwner || photo.sourceOwner || photo.owners?.[0]?.sourceOwner || '');
          const ownerMatch = sourceOwner.match(/^(message|memo|meeting):(.+):(\d+)$/);
          if (!ownerMatch) return false;
          const [, sourceType, sourceId, sourceIndex] = ownerMatch;
          const imageIndex = Number(sourceIndex);
          const source = sourceType === 'message' ? 'chat' : sourceType;
          return onSaveImageTags(sourceId, imageIndex, finalTags.join(' '), {
            source,
            sourceOwner,
            imageIndex,
            sourceImageIndex: imageIndex,
            meetingDate: sourceType === 'meeting' ? sourceId : '',
            photoId: String(photo.photoId || ''),
            imageUrl: photo.full || photo.thumb || '',
            thumb: photo.thumb || photo.full || '',
            assetKey: item.assetKey,
            mediaKey: item.assetKey,
            refKey: item.assetKey,
            directMediaUrl: String(photo.directMediaUrl || ''),
            readFresh: true,
            silent: true
          });
        }
        return true;
      })();

      const feedbackPromise = recordMediaAnalysisFeedback({
        calendarId,
        projectId,
        assetKey: item.assetKey,
        decision,
        proposedTags: getAnalysisSuggestedTags(item),
        acceptedTags: requestedTags,
        finalTags
      }).catch(err => console.warn('Background feedback save error:', err));

      const [tagSaveOk] = await Promise.all([tagSavePromise, feedbackPromise]);
      if (changed && !tagSaveOk) {
        showToast('태그 서버 저장에 실패했습니다. 다시 시도해 주세요.', 'error');
      }
    } catch (err) {
      console.error('Server save error in applyAnalysisTags:', err);
      showToast('태그 서버 동기화 중 오류가 발생했습니다.', 'error');
    }
  }, [calendar?.id, onBulkSaveImageTags, onSaveImageTags, analysisPhotoCache, showToast, updateAnalysisReview]);
  const handleBatchApplyAnalysis = React.useCallback(async () => {
    const unreviewed = (mediaAnalysis.items || []).filter(item => {
      if (!item?.assetKey || item.review) return false;
      const photo = photoByAssetKeyRef.current.get(item.assetKey) || analysisPhotoCache[item.assetKey];
      const currentTagsText = item.review?.finalTags?.join(' ') || photo?.tags || '';
      const completeness = getPhotoTagCompleteness(currentTagsText, calendar);
      return !completeness.isComplete;
    });
    if (!unreviewed.length) {
      showToast('처리할 미검토 항목이 없습니다.', 'info');
      return;
    }
    const calendarId = String(calendar?.id || '').trim();
    const projectId = String(window.__gatherFirebaseConfig?.projectId || '').trim();
    if (!calendarId || !projectId) {
      showToast('분석 대상 캘린더를 찾을 수 없습니다.', 'error');
      return;
    }
    const saveBulk = onBulkSaveImageTags || window.__gatherBulkSaveImageTags;
    if (typeof saveBulk !== 'function') {
      showToast('사진 태그 일괄 저장 기능을 준비하지 못했습니다. 새로고침 후 다시 시도해 주세요.', 'error');
      return;
    }
    setIsBatchApplying(true);
    setBatchProgress({ current: 0, total: unreviewed.length });
    const resolved = [];
    const failures = [];
    let cursor = 0;
    try {
      const workers = Array.from({ length: Math.min(ANALYSIS_BATCH_FETCH_CONCURRENCY, unreviewed.length) }, async () => {
        while (cursor < unreviewed.length) {
          const index = cursor++;
          const item = unreviewed[index];
          try {
            const cachedPhoto = photoByAssetKeyRef.current.get(item.assetKey) || analysisPhotoCache[item.assetKey];
            const photo = (cachedPhoto && (cachedPhoto.tags != null || cachedPhoto.sourceOwner))
              ? cachedPhoto
              : await fetchMediaAnalysisPhoto({
                  calendarId,
                  projectId,
                  assetKey: item.assetKey,
                });
            resolved.push({
              item,
              finalTags: normalizeAnalysisTagList([photo.tags || '', ...getAnalysisSuggestedTags(item)]),
              photo,
            });
          } catch (error) {
            failures.push({ item, error });
            console.warn('AI batch photo lookup failed for', item.assetKey, error);
          } finally {
            setBatchProgress({ current: index + 1, total: unreviewed.length });
          }
        }
      });
      await Promise.all(workers);

      const changed = resolved
        .map(({ item, photo, finalTags }) => ({ item, finalTags, photo, change: createAnalysisTagChange(item, photo, finalTags) }))
        .filter(record => record.change.tags !== record.change.beforeTags);
      if (changed.length) {
        const result = await saveBulk(changed.map(record => record.change));
        if (!result?.ok) throw new Error('AI 추천 태그 일괄 저장에 실패했습니다.');
      }
      // Reviews are audit records, so keep them after the canonical tag write and use bounded
      // parallelism. A failed review never rolls back an already successful photo mutation.
      let reviewCursor = 0;
      const reviewWorkers = Array.from({ length: Math.min(ANALYSIS_BATCH_FETCH_CONCURRENCY, resolved.length) }, async () => {
        while (reviewCursor < resolved.length) {
          const record = resolved[reviewCursor++];
          try {
            await saveAnalysisReview(record.item, 'applied', record.finalTags, getAnalysisSuggestedTags(record.item));
          } catch (error) {
            failures.push({ item: record.item, error });
            console.warn('AI batch review save failed for', record.item.assetKey, error);
          }
        }
      });
      await Promise.all(reviewWorkers);
      const failedAssetCount = new Set(failures.map(({ item }) => item?.assetKey).filter(Boolean)).size;
      const message = failedAssetCount
        ? `사진 태그 ${resolved.length}장을 반영했습니다. 분석 기록 ${failedAssetCount}건은 다시 시도해 주세요.`
        : `미검토 사진 ${resolved.length}장에 AI 추천 태그를 일괄 적용했습니다.`;
      showToast(message, failures.length ? 'error' : 'success');
    } catch (error) {
      console.error('AI batch tag apply failed:', error);
      showToast(String(error?.message || 'AI 추천 태그 일괄 저장에 실패했습니다.'), 'error');
    } finally {
      setIsBatchApplying(false);
      setBatchProgress({ current: 0, total: 0 });
    }
  }, [calendar, mediaAnalysis.items, onBulkSaveImageTags, saveAnalysisReview, showToast, analysisPhotoCache]);
  const rejectAnalysisTags = React.useCallback(async item => {
    if (!item?.assetKey) return;
    setAnalysisSavingAssetKey(item.assetKey);
    try {
      await saveAnalysisReview(item, 'rejected', []);
      setAnalysisAction({ assetKey: '', mode: '', draft: '' });
    } finally {
      setAnalysisSavingAssetKey('');
    }
  }, [saveAnalysisReview]);
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
  const [isBulkDeleting, setIsBulkDeleting] = React.useState(false);
  const [selectedBulkShareKeys, setSelectedBulkShareKeys] = React.useState(() => new Set());
  // 마지막 기준점을 키로 보관하면 OS 파일 관리자처럼 Shift+클릭으로 현재 목록의
  // 연속 구간을 고를 수 있다. URL/배열 인덱스 대신 immutable asset key를 사용하므로
  // 중복 정리나 정렬 변경 뒤에도 다른 사진을 선택하지 않는다.
  const bulkSelectionAnchorKeyRef = React.useRef('');
  const [isBulkTagPanelOpen, setIsBulkTagPanelOpen] = React.useState(false);
  const [bulkTagDraft, setBulkTagDraft] = React.useState('');
  const [isBulkTagSaving, setIsBulkTagSaving] = React.useState(false);
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
  // V2 mobile embed: denser ~90px target so 390px viewports get 4 columns (original product).
  const [gridCols, setGridCols] = React.useState(() => {
    const w = typeof window !== 'undefined' ? window.innerWidth : 400;
    const gap = 6;
    const target = (v2Embed && w < 640) ? 78 : 108;
    const minCols = (v2Embed && w < 640) ? 4 : 2;
    return Math.max(minCols, Math.min(12, Math.floor((w + gap) / (target + gap)) || minCols));
  });
  const gridHostRef = React.useRef(null);
  const { isHeaderVisible, onScroll: handleGalleryScroll } = useScrollHideHeader();

  React.useEffect(() => {
    const computeCols = width => {
      const gap = 6;
      const usable = Math.max(0, Number(width) || 0);
      // V2 mobile: match original 4-col gallery density (pad shrinks usable width below 390).
      const targetCell = (v2Embed && usable < 640) ? 78 : 108;
      const cols = Math.floor((usable + gap) / (targetCell + gap));
      const minCols = (v2Embed && usable > 0 && usable < 640) ? 4 : 2;
      return Math.max(minCols, Math.min(12, cols || minCols));
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
  }, [asPage, activeTab, v2Embed]);

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
    // In the gallery, only external service URLs belong to the 링크 tab.
    // Internal service links (memos, calendar shares, app routes, self origin) are excluded.
    const list = [];
    const seen = new Set();
    (chatMessages || []).forEach(msg => {
      if (!msg.text) return;
      let firstUrlSeen = false;
      extractAllUrlInfosLoose(msg.text).forEach(info => {
        if (!info.url || seen.has(info.url)) return;
        if (!isExternalServiceUrl(info.url)) return;
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
        if (!info.url || seen.has(info.url)) return;
        if (!isExternalServiceUrl(info.url)) return;
        seen.add(info.url);
        list.push({ url: info.url, timestamp: memo.updatedAt || memo.createdAt || 0, messageId: memo.id, title: memo.title || '', text: body, linkPreview: !firstUrlSeen ? (memo.linkPreview || null) : null, source: 'memo' });
        firstUrlSeen = true;
      });
    });
    getConfirmedMeetings(calendar).forEach(meeting => {
      const body = [meeting?.note, meeting?.memo, meeting?.description, meeting?.text].filter(Boolean).join('\n');
      if (!body) return;
      extractAllUrlInfosLoose(body).forEach(info => {
        if (!info.url || seen.has(info.url)) return;
        if (!isExternalServiceUrl(info.url)) return;
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
        // Meme keyboard stickers
        .filter(photo => !isMemeKeyboardPhotoEntry(photo))
        // Photos tab must only contain real photos, not link URLs
        .filter(photo => !photo.directMediaUrl)
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
          // Client cannot write photoIndex. CF denorm can lag, so the source document's
          // asset-keyed tag state wins.  Do not combine it with a tag from a duplicate photo:
          // deletion/dedup must never make another photo's tag appear here.
          const indexTags = String(photo.tags || '');
          let localTags = null;
          let localTagsAreAuthoritative = false;
          const getAssetMappedTags = row => {
            const map = row?.imageTagMap;
            const assetKey = String(photo?.assetKey || getPhotoAssetCommentKey(photo) || '');
            if (map && typeof map === 'object' && !Array.isArray(map) && assetKey
              && Object.prototype.hasOwnProperty.call(map, assetKey)) {
              return { tags: String(map[assetKey] || ''), authoritative: true };
            }
            return null;
          };
          if (messageId) {
            if (source === 'memo') {
              const memo = (memos || []).find(row => row && row.id === messageId);
              if (memo) {
                const mapped = getAssetMappedTags(memo);
                if (mapped) {
                  localTags = mapped.tags;
                  localTagsAreAuthoritative = mapped.authoritative;
                } else if (Array.isArray(memo.imageTags) && Object.prototype.hasOwnProperty.call(memo.imageTags, imageIndex)) {
                  localTags = String(memo.imageTags[imageIndex] || '');
                  localTagsAreAuthoritative = true;
                }
              }
            } else if (photo.directMediaUrl) {
              const msg = (chatMessages || []).find(row => row && row.id === messageId);
              if (msg) localTags = String(getDirectMediaTagsForUrl(msg, photo.directMediaUrl) || '');
            } else {
              const msg = (chatMessages || []).find(row => row && row.id === messageId);
              if (msg) {
                const mapped = getAssetMappedTags(msg);
                if (mapped) {
                  localTags = mapped.tags;
                  localTagsAreAuthoritative = mapped.authoritative;
                } else if (Array.isArray(msg.imageTags) && Object.prototype.hasOwnProperty.call(msg.imageTags, imageIndex)) {
                  localTags = String(msg.imageTags[imageIndex] || '');
                  localTagsAreAuthoritative = true;
                }
              }
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
              if (match && match.tags != null && !localTagsAreAuthoritative && localTags == null) {
                // An album copy is a legacy fallback only.  Once the original message/memo
                // owns an explicit map slot (including an empty slot), it must not be replaced.
                localTags = String(match.tags || '');
                break;
              }
            }
          }
          const calendarId = calendar && calendar.id ? calendar.id : '';
          let tags = resolveGalleryLightboxTags(calendarId, {
            ...photo,
            messageId: messageId || photo.messageId,
            imageIndex
          }, { localTags, indexTags, localTagAuthoritative: localTagsAreAuthoritative });
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
      getAllDirectMediaImageEntries: () => [], getConfirmedMeetings, resolveMeetingPhotoDisplay,
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

  const photoByAssetKey = React.useMemo(() => {
    const map = new Map();
    (sharedPhotos || []).forEach(p => {
      const k1 = p.assetKey;
      const k2 = p.mediaKey;
      const k3 = p.refKey;
      if (k1) map.set(k1, p);
      if (k2 && !map.has(k2)) map.set(k2, p);
      if (k3 && !map.has(k3)) map.set(k3, p);
    });
    return map;
  }, [sharedPhotos]);
  photoByAssetKeyRef.current = photoByAssetKey;

  React.useEffect(() => {
    if (activeTab !== 'analysis' || !Array.isArray(mediaAnalysis.items) || mediaAnalysis.items.length === 0) return;
    const calendarId = String(calendar?.id || '').trim();
    const projectId = String(window.__gatherFirebaseConfig?.projectId || '').trim();
    if (!calendarId || !projectId) return;

    const missingKeys = mediaAnalysis.items
      .map(item => item.assetKey)
      .filter(key => key && !photoByAssetKey.has(key) && !analysisPhotoCache[key]);

    if (missingKeys.length === 0) return;

    let canceled = false;
    const fetchMissingPhotos = async () => {
      const updates = {};
      await Promise.all(
        missingKeys.slice(0, 30).map(async key => {
          try {
            const photo = await fetchMediaAnalysisPhoto({ calendarId, projectId, assetKey: key });
            if (photo && (photo.thumb || photo.full || photo.imageUrl)) {
              updates[key] = photo;
            }
          } catch (_) {}
        })
      );
      if (!canceled && Object.keys(updates).length > 0) {
        setAnalysisPhotoCache(previous => ({ ...previous, ...updates }));
      }
    };
    void fetchMissingPhotos();
    return () => { canceled = true; };
  }, [activeTab, mediaAnalysis.items, photoByAssetKey, analysisPhotoCache, calendar?.id]);

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
    const qNoHash = q.replace(/^#/, '');
    return sharedFiles.filter(item => {
      const name = String(item.name || '').toLowerCase();
      const mime = String(item.mime || '').toLowerCase();
      const ext = String(item.ext || '').toLowerCase();
      const tags = String(item.tags || '').toLowerCase();
      return name.includes(q) || mime.includes(q) || ext.includes(q)
        || tags.includes(q) || tags.includes(qNoHash) || tags.replace(/#/g, '').includes(qNoHash);
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
    if (photo.directMediaUrl) return false;
    const key = photo.mediaKey || photo.refKey || getPhotoKey(photo);
    if (key && brokenPhotoKeysRef.current.has(key)) return false;
    return !isBrokenPhotoValue(photo.full) && !isBrokenPhotoValue(photo.thumb);
  }), [filteredPhotos, brokenPhotoRevision]);
  const selectedBulkPhotos = React.useMemo(() => {
    if (activeTab !== 'photos' || selectedBulkShareKeys.size === 0) return [];
    return visiblePhotos.filter(photo => selectedBulkShareKeys.has(getPhotoKey(photo)));
  }, [activeTab, visiblePhotos, selectedBulkShareKeys]);
  const selectedBulkTagTokens = React.useMemo(() => {
    const counts = new Map();
    selectedBulkPhotos.forEach(photo => normalizePhotoTagTokens(photo.tags).forEach(tag => {
      counts.set(tag, (counts.get(tag) || 0) + 1);
    }));
    return Array.from(counts.entries())
      .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
      .map(([tag, count]) => ({ tag, count }));
  }, [selectedBulkPhotos]);
  const applyBulkPhotoTags = async (operation, rawTags = bulkTagDraft) => {
    const targetPhotos = selectedBulkPhotos;
    const changes = buildBulkPhotoTagChanges(targetPhotos, operation, rawTags);
    if (!targetPhotos.length) {
      showToast?.('태그를 관리할 사진을 먼저 선택해 주세요.', 'error');
      return;
    }
    if (!normalizePhotoTagTokens(rawTags).length) {
      showToast?.('추가하거나 삭제할 태그를 입력해 주세요.', 'error');
      return;
    }
    if (!changes.length) {
      showToast?.(operation === 'remove' ? '선택한 사진에 해당 태그가 없습니다.' : '선택한 사진에는 이미 같은 태그가 있습니다.', 'info');
      return;
    }
    const save = onBulkSaveImageTags || window.__gatherBulkSaveImageTags;
    if (typeof save !== 'function') {
      showToast?.('일괄 태그 저장 기능을 준비하지 못했습니다. 새로고침 후 다시 시도해 주세요.', 'error');
      return;
    }
    setIsBulkTagSaving(true);
    try {
      const result = await save(changes);
      if (!result?.ok) throw new Error('사진 태그 일괄 저장 실패');
      const undoneChanges = changes.map(change => ({ ...change, tags: change.beforeTags }));
      const label = operation === 'remove' ? '삭제' : '추가';
      showToast?.(`사진 ${changes.length}장에 태그를 ${label}했습니다.`, 'success', 9000, () => {
        const undoSave = onBulkSaveImageTags || window.__gatherBulkSaveImageTags;
        if (typeof undoSave !== 'function') return;
        void undoSave(undoneChanges)
          .then(undoResult => showToast?.(undoResult?.ok ? '태그 일괄 변경을 되돌렸습니다.' : '되돌리지 못했습니다.', undoResult?.ok ? 'success' : 'error'))
          .catch(error => {
            console.error('Bulk photo tag undo failed:', error);
            showToast?.('태그 되돌리기에 실패했습니다.', 'error');
          });
      }, null, '되돌리기');
      setBulkTagDraft('');
      setIsBulkTagPanelOpen(false);
      setSelectedBulkShareKeys(new Set());
    } catch (error) {
      console.error('Bulk photo tag save failed:', error);
      showToast?.(String(error?.message || '사진 태그 일괄 저장에 실패했습니다.'), 'error');
    } finally {
      setIsBulkTagSaving(false);
    }
  };
  const pagedFallbackPhotos = React.useMemo(
    () => paginateGalleryItems(visiblePhotos, galleryListPage, GALLERY_PAGE_SIZE),
    [visiblePhotos, galleryListPage]
  );
  const usingPhotoIndex = Array.isArray(indexedPhotos);
  const renderedPhotos = React.useMemo(
    () => asPage && !usingPhotoIndex ? pagedFallbackPhotos.items : visiblePhotos,
    [asPage, visiblePhotos, pagedFallbackPhotos.items, usingPhotoIndex]
  );
  const handleGalleryContentScroll = handleGalleryScroll;

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

  const [galleryMonthDate, setGalleryMonthDate] = React.useState(() => new Date());
  const [collapsedGalleryDates, setCollapsedGalleryDates] = React.useState(() => new Set());
  const [isGalleryPickerOpen, setIsGalleryPickerOpen] = React.useState(false);
  const [pickerGalleryYear, setPickerGalleryYear] = React.useState(() => new Date().getFullYear());
  const [pickerGalleryMonth, setPickerGalleryMonth] = React.useState(() => new Date().getMonth());
  const galleryMonthKey = `${galleryMonthDate.getFullYear()}-${String(galleryMonthDate.getMonth() + 1).padStart(2, '0')}`;
  React.useEffect(() => {
    setGalleryListPage(1);
  }, [searchQuery, galleryViewMode, galleryMonthKey]);
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
  const dateModeSourceItems = React.useMemo(() => {
    const sourceItems = activeTab === 'links' ? filteredLinks : (activeTab === 'files' ? filteredFiles : visiblePhotos);
    return (sourceItems || []).filter(item => {
      const key = getGalleryItemDateKey(item) || '__unknown__';
      return key === '__unknown__' || key.startsWith(galleryMonthKey);
    });
  }, [activeTab, filteredLinks, filteredFiles, visiblePhotos, galleryMonthKey]);
  const pagedDateModeItems = React.useMemo(
    () => paginateGalleryItems(dateModeSourceItems, galleryListPage, (activeTab === 'links' || activeTab === 'files') ? GALLERY_CARD_PAGE_SIZE : GALLERY_PAGE_SIZE),
    [activeTab, dateModeSourceItems, galleryListPage]
  );
  const groupedGallerySections = React.useMemo(() => {
    if (galleryViewMode !== 'date') return [];
    const sourceItems = pagedDateModeItems.items;
    const groups = new Map();
    (sourceItems || []).forEach((item, idx) => {
      const key = getGalleryItemDateKey(item) || '__unknown__';
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
  }, [galleryViewMode, pagedDateModeItems.items]);

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
    const gatherFiles = parseGatherFilesClipboardText(clipboardText);
    if (gatherFiles && typeof onAddFiles === 'function') {
      setIsMenuOpen(false);
      setIsSavingLink(true);
      try {
        const ok = await onAddFiles(gatherFiles);
        if (showToast) showToast(ok !== false ? `파일 ${gatherFiles.length}개를 붙여넣었습니다.` : '파일 붙여넣기에 실패했습니다.', ok !== false ? 'success' : 'error');
        if (ok !== false) setActiveTab('files');
      } finally {
        setIsSavingLink(false);
      }
      return;
    }
    const gatherLinks = parseGatherLinksClipboardText(clipboardText);
    if (gatherLinks && typeof onAddLink === 'function') {
      setIsMenuOpen(false);
      setIsSavingLink(true);
      try {
        let added = 0;
        for (const item of gatherLinks) {
          const ok = await onAddLink(item.url);
          if (ok !== false) added += 1;
        }
        if (showToast) showToast(added ? `링크 ${added}개를 붙여넣었습니다.` : '링크 붙여넣기에 실패했습니다.', added ? 'success' : 'error');
        if (added) setActiveTab('links');
      } finally {
        setIsSavingLink(false);
      }
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
    const ok = await uploadFiles(files);
    if (ok) setActiveTab('photos');
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
  const toggleBulkShareSelected = (key, options = {}) => {
    const orderedKeys = Array.isArray(options.orderedKeys) ? options.orderedKeys.filter(Boolean) : [];
    setSelectedBulkShareKeys(prev => {
      const next = new Set(prev);
      const anchorKey = bulkSelectionAnchorKeyRef.current;
      const canSelectRange = Boolean(options.shiftKey && anchorKey && orderedKeys.length);
      const start = canSelectRange ? orderedKeys.indexOf(anchorKey) : -1;
      const end = canSelectRange ? orderedKeys.indexOf(key) : -1;
      if (start >= 0 && end >= 0) {
        const [from, to] = start <= end ? [start, end] : [end, start];
        orderedKeys.slice(from, to + 1).forEach(itemKey => next.add(itemKey));
      } else if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      bulkSelectionAnchorKeyRef.current = key;
      return next;
    });
  };
  const handleToggleBulkShareMode = () => {
    setIsBulkShareMode(v => !v);
    setSelectedBulkShareKeys(new Set());
    bulkSelectionAnchorKeyRef.current = '';
    setIsBulkTagPanelOpen(false);
    setBulkTagDraft('');
  };
  const handleClickBulkDelete = () => {
    const keys = Array.from(selectedBulkShareKeys);
    if (!keys.length || isBulkDeleting) return;
    const keySet = new Set(keys);
    const count = keys.length;
    const selectedPhotos = activeTab === 'photos'
      ? (visiblePhotos || []).filter(photo => keySet.has(getPhotoKey(photo)))
      : [];
    const selectedFiles = activeTab === 'files'
      ? (filteredFiles || []).filter(item => keySet.has(String(item.id || item.url || '')))
      : [];
    const photoPlaces = (() => {
      const labels = new Set(['갤러리']);
      selectedPhotos.forEach(photo => {
        const s = String(photo.source || photo.uploadSource || '').toLowerCase();
        if (s === 'chat' || s === 'chat-tag') labels.add('채팅');
        if (s === 'meeting') labels.add('일정');
        if (s === 'memo') labels.add('메모');
      });
      return Array.from(labels).join('·');
    })();
    const filePlaces = selectedFiles.some(item => {
      const s = String(item.uploadSource || '').toLowerCase();
      return s && s !== 'gallery' && s !== 'meeting';
    }) ? '채팅과 갤러리' : '갤러리';
    const message = activeTab === 'photos'
      ? `선택한 사진 ${count}장을 이 캘린더 ${photoPlaces}에서 삭제하시겠습니까? 다른 캘린더 원본은 그대로 둡니다.`
      : (activeTab === 'files'
        ? `선택한 파일 ${count}개를 이 캘린더 ${filePlaces}에서 삭제하시겠습니까? 다른 캘린더 원본은 그대로 둡니다.`
        : `선택한 링크 ${count}개를 이 캘린더 갤러리에서 삭제하시겠습니까? 메모/일정 본문과 다른 캘린더 원본은 그대로 둡니다.`);
    const run = async () => {
      setIsBulkDeleting(true);
      try {
        if (activeTab === 'photos') {
          if (typeof onDeletePhoto !== 'function') return;
          const photos = (visiblePhotos || []).filter(photo => keySet.has(getPhotoKey(photo)));
          photos.sort((a, b) => {
            const idA = String(a.sourceMessageId || a.messageId || '');
            const idB = String(b.sourceMessageId || b.messageId || '');
            if (idA !== idB) return idA.localeCompare(idB);
            const idxA = Number.isInteger(a.imageIndex) ? a.imageIndex : (Number(a.sourceImageIndex) || 0);
            const idxB = Number.isInteger(b.imageIndex) ? b.imageIndex : (Number(b.sourceImageIndex) || 0);
            return idxB - idxA;
          });
          let okCount = 0;
          for (const photo of photos) {
            const ok = await onDeletePhoto({
              ...photo,
              imageUrl: photo.full || photo.thumb,
              silent: true
            });
            if (ok) okCount += 1;
          }
          if (showToast) showToast(okCount ? `사진 ${okCount}장을 삭제했습니다.` : '삭제할 사진을 처리하지 못했습니다.', okCount ? 'success' : 'error');
        } else if (activeTab === 'files') {
          if (typeof onDeleteFiles !== 'function') return;
          const files = (filteredFiles || []).filter(item => keySet.has(String(item.id || item.url || '')));
          const deleted = await onDeleteFiles(files);
          if (showToast) showToast(deleted ? `파일 ${deleted}개를 삭제했습니다.` : '삭제할 파일을 처리하지 못했습니다.', deleted ? 'success' : 'error');
        } else {
          if (typeof onDeleteGalleryLinks !== 'function') return;
          const links = (filteredLinks || []).filter(item => keySet.has(item.messageId || item.url));
          const result = await onDeleteGalleryLinks(links) || { deleted: 0, skipped: 0 };
          if (showToast) {
            if (result.deleted && result.skipped) showToast(`링크 ${result.deleted}개 삭제, ${result.skipped}개는 본문에 있어 건너뛰었습니다.`, 'info');
            else if (result.deleted) showToast(`링크 ${result.deleted}개를 삭제했습니다.`, 'success');
            else showToast('채팅/메모/일정 본문에 있는 링크는 해당 화면에서 수정해 주세요.', 'error');
          }
        }
        setSelectedBulkShareKeys(new Set());
      } finally {
        setIsBulkDeleting(false);
      }
    };
    if (typeof onRequestConfirm === 'function') onRequestConfirm('삭제', message, run);
    else void run();
  };
  const renderGalleryActionButtons = (actions) => {
    const onAdd = actions && actions.onAdd;
    const onPaste = actions && actions.onPaste;
    const addDisabled = !!(actions && actions.addDisabled);
    const pasteDisabled = !!(actions && actions.pasteDisabled);
    const iconBtn = {
      height: '44px', minHeight: '44px', width: '44px', minWidth: '44px', maxWidth: '44px', padding: 0,
      borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center',
      cursor: 'pointer', flexShrink: 0, boxSizing: 'border-box', aspectRatio: '1 / 1'
    };
    const textBtn = typeof getListEditTextBtnStyle === 'function'
      ? getListEditTextBtnStyle(isMobile, isBulkShareMode)
      : {
          height: '44px', minHeight: '44px', minWidth: '44px', padding: isMobile ? '0 8px' : '0 14px',
          borderRadius: 'var(--radius-md)', fontSize: isMobile ? 'var(--font-size-sm)' : 'var(--font-size-md)', fontWeight: 900,
          cursor: 'pointer', flex: isBulkShareMode && isMobile ? 1 : '0 0 auto', flexShrink: 0, whiteSpace: 'nowrap', boxSizing: 'border-box'
        };
    if (!isBulkShareMode) {
      return /*#__PURE__*/React.createElement(React.Fragment, null,
        onAdd ? /*#__PURE__*/React.createElement("button", {
          type: "button", className: "btn btn-action btn-action-dark",
          onClick: onAdd, disabled: addDisabled, title: "추가", "aria-label": "추가",
          style: { ...iconBtn, cursor: addDisabled ? 'wait' : 'pointer' }
        }, PlusIcon ? /*#__PURE__*/React.createElement(PlusIcon, { size: 16 }) : "+") : null,
        /*#__PURE__*/React.createElement("button", {
          type: "button", className: "btn btn-action btn-action-outline",
          onClick: handleToggleBulkShareMode, title: "편집", "aria-label": "편집",
          style: iconBtn
        }, PencilIcon ? /*#__PURE__*/React.createElement(PencilIcon, { size: 15 }) : "편집")
      );
    }
    return /*#__PURE__*/React.createElement(React.Fragment, null,
      activeTab === 'photos' && /*#__PURE__*/React.createElement("button", {
        type: "button", className: "btn btn-action btn-action-outline",
        onClick: () => setIsBulkTagPanelOpen(open => !open),
        disabled: selectedBulkShareKeys.size === 0 || isBulkDeleting || isBulkTagSaving,
        title: "일괄 태그", "aria-label": "일괄 태그",
        style: {
          ...textBtn,
          cursor: (selectedBulkShareKeys.size === 0 || isBulkDeleting || isBulkTagSaving) ? 'default' : 'pointer',
          opacity: (selectedBulkShareKeys.size === 0 || isBulkDeleting || isBulkTagSaving) ? 0.5 : 1
        }
      }, `태그${selectedBulkShareKeys.size ? ` (${selectedBulkShareKeys.size})` : ''}`),
      /*#__PURE__*/React.createElement("button", {
        type: "button", className: "btn btn-action btn-action-danger",
        onClick: handleClickBulkDelete,
        disabled: selectedBulkShareKeys.size === 0 || isBulkDeleting,
        title: "삭제",
        "aria-label": "삭제",
        style: {
          ...iconBtn,
          cursor: (selectedBulkShareKeys.size === 0 || isBulkDeleting) ? 'default' : 'pointer',
          opacity: (selectedBulkShareKeys.size === 0 || isBulkDeleting) ? 0.5 : 1
        }
      }, TrashIcon ? /*#__PURE__*/React.createElement(TrashIcon, { size: 16 }) : (isBulkDeleting ? "..." : "삭제")),
      onPaste ? /*#__PURE__*/React.createElement("button", {
        type: "button", className: "btn btn-action btn-action-outline",
        onClick: onPaste, disabled: pasteDisabled || isBulkDeleting,
        style: { ...textBtn, cursor: (pasteDisabled || isBulkDeleting) ? 'wait' : 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }
      },
        ClipboardPasteIcon ? /*#__PURE__*/React.createElement(ClipboardPasteIcon, { size: 14 }) : null,
        "붙여넣기"
      ) : null,
      /*#__PURE__*/React.createElement("button", {
        type: "button", className: "btn btn-action btn-action-dark",
        onClick: handleClickBulkShare,
        disabled: selectedBulkShareKeys.size === 0 || isGeneratingBulkShareUrl || isBulkDeleting,
        style: {
          ...textBtn,
          cursor: (selectedBulkShareKeys.size === 0 || isGeneratingBulkShareUrl || isBulkDeleting) ? 'default' : 'pointer',
          opacity: (selectedBulkShareKeys.size === 0 || isGeneratingBulkShareUrl || isBulkDeleting) ? 0.5 : 1
        }
      }, isGeneratingBulkShareUrl ? "생성 중..." : `일괄공유${selectedBulkShareKeys.size > 0 ? ` (${selectedBulkShareKeys.size})` : ''}`),
      /*#__PURE__*/React.createElement("button", {
        type: "button", className: "btn btn-action btn-action-outline",
        onClick: handleToggleBulkShareMode,
        disabled: isGeneratingBulkShareUrl || isBulkDeleting,
        style: textBtn
      }, "취소")
    );
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
      let fragment = '';
      if (activeTab === 'links') {
        const links = (filteredLinks || []).filter(item => keySet.has(item.messageId || item.url));
        fragment = encodeGatherLinksFragment(links);
        if (!fragment) { if (showToast) showToast('공유할 링크를 선택해 주세요.', 'error'); return; }
        const shareUrl = `${window.location.origin}${window.location.pathname}${fragment}`;
        const ok = await copyTextToClipboard(shareUrl);
        setBulkShareResultUrl(shareUrl);
        setIsBulkShareMode(false);
        setSelectedBulkShareKeys(new Set());
        if (showToast) showToast(ok ? `링크 ${links.length}개 공유 URL이 복사되었습니다.` : 'URL 생성은 됐지만 복사에 실패했습니다.', ok ? 'success' : 'error');
        return;
      }
      if (activeTab === 'files') {
        const files = (filteredFiles || []).filter(item => keySet.has(String(item.id || item.url || '')));
        fragment = encodeGatherFilesFragment(files);
        if (!fragment) { if (showToast) showToast('공유할 파일을 선택해 주세요.', 'error'); return; }
        const shareUrl = `${window.location.origin}${window.location.pathname}${fragment}`;
        const ok = await copyTextToClipboard(shareUrl);
        setBulkShareResultUrl(shareUrl);
        setIsBulkShareMode(false);
        setSelectedBulkShareKeys(new Set());
        if (showToast) showToast(ok ? `파일 ${files.length}개 공유 URL이 복사되었습니다.` : 'URL 생성은 됐지만 복사에 실패했습니다.', ok ? 'success' : 'error');
        return;
      }
      const photos = visiblePhotos
        .filter(photo => keySet.has(getPhotoKey(photo)))
        .map(photo => ({ url: photo.full || photo.thumb, tags: photo.tags || '' }));
      fragment = encodeGatherPhotosFragment(photos);
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
    if (!files.length || typeof onUploadImages !== 'function') return false;
    setIsMenuOpen(false);
    const result = await Promise.resolve(onUploadImages(files));
    return result !== false;
  };
  const handleUploadChange = async event => {
    const files = Array.from(event.target.files || []);
    event.target.value = '';
    if (!files.length) return;
    const api = (typeof window !== 'undefined' && window.GATHER_CHAT_FILE_ATTACHMENTS) || {};
    const classify = api.classifyChatComposerFiles;
    if (typeof classify !== 'function') {
      const ok = await uploadFiles(files);
      if (ok) setActiveTab('photos');
      return;
    }
    const { images, documents, rejected } = classify(files);
    if (rejected && rejected.length && showToast) {
      const videos = rejected.filter(item => item.reason === 'video').length;
      const large = rejected.filter(item => item.reason === 'too-large').length;
      const unsupported = rejected.filter(item => item.reason === 'unsupported').length;
      const bits = [];
      if (videos) bits.push('동영상은 올릴 수 없습니다');
      if (large) bits.push('20MB를 넘는 파일은 제외했습니다');
      if (unsupported) bits.push('지원하지 않는 형식은 제외했습니다');
      if (bits.length) showToast(bits.join(' · '), 'info');
    }
    setIsMenuOpen(false);
    let imageOk = false;
    let fileOk = false;
    if (images.length) imageOk = await uploadFiles(images);
    if (documents.length && typeof api.uploadChatFileAttachments === 'function' && calendar && calendar.id && typeof onAddFiles === 'function') {
      try {
        const ready = await api.uploadChatFileAttachments(calendar.id, documents);
        if (ready && ready.length) {
          const saved = await onAddFiles(ready);
          fileOk = saved !== false;
          if (showToast && fileOk) {
            showToast(saved === 'queued'
              ? '네트워크가 불안정하여 파일을 대기열에 저장했습니다. 연결되면 자동으로 반영됩니다.'
              : `파일 ${ready.length}개를 올렸습니다.`, saved === 'queued' ? 'info' : 'success');
          }
        }
      } catch (err) {
        console.error('gallery file upload failed', err);
        if (showToast) showToast('파일 업로드에 실패했습니다.', 'error');
      }
    } else if (documents.length && showToast) {
      showToast('파일 업로드를 사용할 수 없습니다.', 'error');
    }
    if (images.length && imageOk) setActiveTab('photos');
    else if (fileOk) setActiveTab('files');
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
  // v2 shell (PC): the side-nav's per-tab submenu needs to reach this gallery's own
  // 검색/업로드 actions (previously only reachable via this component's own asPage 메뉴
  // overlay, which v2 always redirects elsewhere -- see ui-app-shell-v2.js MediaPane). Each
  // upload action switches to the tab it belongs to first since the "추가" control for
  // links/files only renders while that tab is active.
  React.useEffect(() => {
    if (typeof onRegisterMenuActions !== 'function') return undefined;
    onRegisterMenuActions({
      search: () => setIsSearchOpen(prev => { if (prev) setSearchQuery(''); return !prev; }),
      uploadMixed: () => handleUploadClick(),
      uploadImage: () => handleUploadClick(),
      uploadFile: () => handleUploadClick(),
      uploadLink: () => { setActiveTab('links'); setIsAddingLink(true); },
    });
    return () => onRegisterMenuActions(null);
  }, [onRegisterMenuActions]);
  const handleSubmitLinkInput = async () => {
    if (typeof onAddLink !== 'function' || isSavingLink) return;
    const url = extractFirstUrl(linkUrlInput);
    if (!url) {
      if (showToast) showToast('올바른 링크(URL)를 입력해 주세요.', 'error');
      return;
    }
    if (!isExternalServiceUrl(url)) {
      if (showToast) showToast('외부 서비스의 링크(URL)만 추가할 수 있습니다.', 'error');
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
    const gatherLinks = parseGatherLinksClipboardText(text);
    if (gatherLinks && gatherLinks.length) {
      setIsSavingLink(true);
      try {
        let added = 0;
        for (const item of gatherLinks) {
          if (!isExternalServiceUrl(item.url)) continue;
          const ok = await onAddLink(item.url);
          if (ok !== false) added += 1;
        }
        if (showToast) showToast(added ? `링크 ${added}개를 붙여넣었습니다.` : '붙여넣을 수 있는 외부 서비스 링크가 없습니다.', added ? 'success' : 'error');
        if (added) setActiveTab('links');
      } finally {
        setIsSavingLink(false);
      }
      return;
    }
    const url = extractFirstUrl(text);
    if (!url) {
      if (showToast) showToast('클립보드에 붙여넣을 링크가 없습니다.', 'error');
      return;
    }
    if (!isExternalServiceUrl(url)) {
      if (showToast) showToast('외부 서비스의 링크(URL)만 추가할 수 있습니다.', 'error');
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
      const target = e.target;
      if (target && ((target.closest && target.closest('input, textarea, select, [contenteditable="true"]')) || target.isContentEditable)) return;
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
      {
        const text = e.clipboardData ? e.clipboardData.getData('text/plain') : '';
        const gatherFiles = parseGatherFilesClipboardText(text);
        if (gatherFiles && typeof onAddFiles === 'function') {
          e.preventDefault();
          setIsMenuOpen(false);
          void (async () => {
            const ok = await onAddFiles(gatherFiles);
            if (showToast) showToast(ok !== false ? `파일 ${gatherFiles.length}개를 붙여넣었습니다.` : '파일 붙여넣기에 실패했습니다.', ok !== false ? 'success' : 'error');
            if (ok !== false) setActiveTab('files');
          })();
          return;
        }
        const gatherLinks = parseGatherLinksClipboardText(text);
        if (gatherLinks && typeof onAddLink === 'function') {
          e.preventDefault();
          setIsMenuOpen(false);
          void (async () => {
            let added = 0;
            for (const item of gatherLinks) {
              const ok = await onAddLink(item.url);
              if (ok !== false) added += 1;
            }
            if (showToast) showToast(added ? `링크 ${added}개를 붙여넣었습니다.` : '링크 붙여넣기에 실패했습니다.', added ? 'success' : 'error');
            if (added) setActiveTab('links');
          })();
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
  }, [onUploadImages, onPasteGatherPhoto, onPasteGatherPhotos, onAddFiles, onAddLink, showToast]);

  React.useEffect(() => {
    const handleGalleryKeyDown = e => {
      const target = e.target;
      if (target && ((target.closest && target.closest('input, textarea, select, [contenteditable="true"]')) || target.isContentEditable)) return;
      const isCmdOrCtrl = e.metaKey || e.ctrlKey;
      if (isCmdOrCtrl && (e.key === 'a' || e.key === 'A')) {
        if (isBulkShareMode && activeTab === 'photos') {
          e.preventDefault();
          const allKeys = (visiblePhotos || []).map(getPhotoKey);
          const isAll = allKeys.length > 0 && allKeys.every(k => selectedBulkShareKeys.has(k));
          setSelectedBulkShareKeys(isAll ? new Set() : new Set(allKeys));
        }
      } else if (isCmdOrCtrl && (e.key === 'c' || e.key === 'C')) {
        if (isBulkShareMode && selectedBulkPhotos.length > 0) {
          e.preventDefault();
          const tokens = [];
          selectedBulkPhotos.forEach(p => normalizePhotoTagTokens(p.tags).forEach(t => { if (!tokens.includes(t)) tokens.push(t); }));
          if (tokens.length) {
            setTagClipboard(tokens);
            showToast?.(`태그 ${tokens.length}개를 복사했습니다.`, 'success');
          }
        }
      } else if (isCmdOrCtrl && (e.key === 'v' || e.key === 'V')) {
        if (isBulkShareMode && selectedBulkPhotos.length > 0 && getTagClipboard().length > 0) {
          e.preventDefault();
          const tags = getTagClipboard();
          void applyBulkPhotoTags('add', tags.map(t => `#${t}`).join(' '));
        }
      }
    };
    window.addEventListener('keydown', handleGalleryKeyDown);
    return () => window.removeEventListener('keydown', handleGalleryKeyDown);
  }, [isBulkShareMode, activeTab, visiblePhotos, selectedBulkShareKeys, selectedBulkPhotos, showToast]);
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
  }, /*#__PURE__*/React.createElement((window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.ResizableModalContainer) || "div", {
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
  }, /*#__PURE__*/React.createElement((window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.ResizableModalContainer) || "div", {
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
  }, /*#__PURE__*/React.createElement((window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.ResizableModalContainer) || "div", {
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
  }, /*#__PURE__*/React.createElement((window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.ResizableModalContainer) || "div", {
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
    position: v2Embed ? 'relative' : 'fixed',
    top: v2Embed ? undefined : 0,
    left: v2Embed ? undefined : 0,
    right: v2Embed ? undefined : 0,
    bottom: v2Embed ? undefined : 0,
    zIndex: v2Embed ? 1 : 1005,
    backgroundColor: 'var(--bg-primary)', display: 'flex', flexDirection: 'column',
    width: '100%', maxWidth: '100%', overflow: 'hidden',
    height: v2Embed ? '100%' : undefined,
    minHeight: v2Embed ? '100%' : undefined,
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
    position: v2Embed ? 'sticky' : 'fixed',
    top: v2Embed ? 0 : 'env(safe-area-inset-top, 0px)',
    left: v2Embed ? undefined : 0,
    right: v2Embed ? undefined : 0,
    zIndex: v2Embed ? 5 : 1010, overflow: 'hidden', flexShrink: 0,
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
    const thumb = /*#__PURE__*/React.createElement(PhotoAssetThumb, {
      key: isBulkShareMode ? undefined : itemKey,
      photo: photo,
      isBroken: value => isBrokenPhotoValue(value),
      "data-photo-url": photo.full || photo.thumb,
      "data-message-id": photo.messageId || photo.sourceMessageId,
      alt: "공유사진",
      loading: "lazy",
      decoding: "async",
      referrerPolicy: 'no-referrer',
      onClick: event => isBulkShareMode ? toggleBulkShareSelected(photoKey, {
        shiftKey: Boolean(event?.shiftKey), orderedKeys: (items || []).map(getPhotoKey)
      }) : (setActiveLightbox && setActiveLightbox({
        urls: (lightboxItems || []).map(p => p.full),
        index: lightboxIndex >= 0 ? lightboxIndex : idx,
        meta: (lightboxItems || []).map(p => ({ timestamp: p.timestamp, messageId: p.messageId, imageIndex: p.imageIndex, thumb: p.thumb, tags: p.tags, directMediaUrl: p.directMediaUrl, source: p.source, uploadSource: p.uploadSource, meetingDate: p.meetingDate, photoId: p.photoId, sourceMessageId: p.sourceMessageId, sourceImageIndex: p.sourceImageIndex, assetKey: p.assetKey, mediaKey: p.mediaKey, refKey: p.refKey, legacyKeys: p.legacyKeys, slotKey: p.slotKey }))
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
      isBulkShareMode && (EditSelectCheckbox
        ? /*#__PURE__*/React.createElement(EditSelectCheckbox, { checked: isChecked, variant: "onMedia" })
        : /*#__PURE__*/React.createElement("span", {
        "aria-hidden": true,
        style: {
          position: 'absolute', top: '8px', left: '8px', width: '20px', height: '20px', borderRadius: '5px',
          border: isChecked ? 'none' : '2px solid rgba(255,255,255,0.95)',
          backgroundColor: isChecked ? 'var(--accent-primary)' : 'rgba(0,0,0,0.35)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 1px 3px rgba(0,0,0,0.35)', pointerEvents: 'none'
        }
      }, isChecked && /*#__PURE__*/React.createElement("svg", {
        xmlns: "http://www.w3.org/2000/svg", width: "14", height: "14", viewBox: "0 0 24 24",
        fill: "none", stroke: "#fff", strokeWidth: "3", strokeLinecap: "round", strokeLinejoin: "round"
      }, /*#__PURE__*/React.createElement("path", { d: "M20 6 9 17l-5-5" })))),
      commentBadge
    );
  }));
  const renderGalleryLinkList = items => /*#__PURE__*/React.createElement("div", {
    className: "gallery-link-grid",
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
      gap: isMobile ? '8px' : '12px',
      width: '100%',
      boxSizing: 'border-box'
    }
  },
    (items || []).map(item => {
      const itemKey = item.messageId || item.url;
      const isChecked = selectedBulkShareKeys.has(itemKey);
      const card = /*#__PURE__*/React.createElement(GalleryLinkCard, {
        key: itemKey,
        item: item,
        searchQuery: searchQuery
      });
      if (!isBulkShareMode) return card;
      return /*#__PURE__*/React.createElement("div", {
        key: itemKey,
        onClick: ev => { ev.preventDefault(); ev.stopPropagation(); toggleBulkShareSelected(itemKey); },
        style: { position: 'relative', width: '100%', minWidth: 0, height: '100%', cursor: 'pointer', outline: isChecked ? '2px solid var(--accent-primary)' : 'none', borderRadius: 'var(--radius-md)' }
      },
        card,
        EditSelectCheckbox
          ? /*#__PURE__*/React.createElement(EditSelectCheckbox, { checked: isChecked, variant: "onMedia" })
          : /*#__PURE__*/React.createElement("span", {
          "aria-hidden": true,
          style: {
            position: 'absolute', top: '8px', left: '8px', width: '20px', height: '20px', borderRadius: '5px',
            border: isChecked ? 'none' : '2px solid rgba(255,255,255,0.95)',
            backgroundColor: isChecked ? 'var(--accent-primary)' : 'rgba(0,0,0,0.35)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 1px 3px rgba(0,0,0,0.35)', pointerEvents: 'none', zIndex: 2
          }
        }, isChecked && /*#__PURE__*/React.createElement("svg", {
          xmlns: "http://www.w3.org/2000/svg", width: "14", height: "14", viewBox: "0 0 24 24",
          fill: "none", stroke: "#fff", strokeWidth: "3", strokeLinecap: "round", strokeLinejoin: "round"
        }, /*#__PURE__*/React.createElement("path", { d: "M20 6 9 17l-5-5" })))
      );
    })
  );
  const renderGalleryFileList = items => /*#__PURE__*/React.createElement("div", {
    className: "gallery-file-grid",
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
      gap: isMobile ? '8px' : '12px',
      width: '100%',
      boxSizing: 'border-box'
    }
  }, (items || []).map((item, idx) => {
    const itemKey = String(item.id || item.url || idx);
    const isChecked = selectedBulkShareKeys.has(itemKey);
    const card = FileAttachmentCard ? /*#__PURE__*/React.createElement(FileAttachmentCard, {
      key: itemKey,
      attachment: item,
      searchQuery: searchQuery,
      stretch: true,
      compact: true,
      onToggleSelect: isBulkShareMode ? () => toggleBulkShareSelected(itemKey) : undefined,
      onOpen: isBulkShareMode ? undefined : () => setGalleryDocLightbox({ attachments: items, index: idx })
    }) : null;
    if (!card) return null;
    return /*#__PURE__*/React.createElement("div", {
      key: itemKey,
      onClick: isBulkShareMode ? ev => { ev.preventDefault(); ev.stopPropagation(); toggleBulkShareSelected(itemKey); } : undefined,
      style: { position: 'relative', width: '100%', minWidth: 0, height: '100%', maxWidth: '100%', boxSizing: 'border-box', cursor: isBulkShareMode ? 'pointer' : 'default', outline: isChecked ? '2px solid var(--accent-primary)' : 'none', borderRadius: 'var(--radius-md)' }
    },
      card,
      isBulkShareMode && (EditSelectCheckbox
        ? /*#__PURE__*/React.createElement(EditSelectCheckbox, { checked: isChecked, variant: "onMedia" })
        : /*#__PURE__*/React.createElement("span", {
        "aria-hidden": true,
        style: {
          position: 'absolute', top: '8px', left: '8px', width: '20px', height: '20px', borderRadius: '5px',
          border: isChecked ? 'none' : '2px solid rgba(255,255,255,0.95)',
          backgroundColor: isChecked ? 'var(--accent-primary)' : 'rgba(0,0,0,0.35)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 1px 3px rgba(0,0,0,0.35)', pointerEvents: 'none', zIndex: 2
        }
      }, isChecked && /*#__PURE__*/React.createElement("svg", {
        xmlns: "http://www.w3.org/2000/svg", width: "14", height: "14", viewBox: "0 0 24 24",
        fill: "none", stroke: "#fff", strokeWidth: "3", strokeLinecap: "round", strokeLinejoin: "round"
      }, /*#__PURE__*/React.createElement("path", { d: "M20 6 9 17l-5-5" }))))
    );
  }));
  const renderFileListHeader = () => /*#__PURE__*/React.createElement("div", {
    style: { ...LIST_TOOLBAR_ROW_STYLE, gap: isMobile ? '6px' : '8px' }
  },
    (!isBulkShareMode || !isMobile) && renderVisitFilterToggleMobile(),
    /*#__PURE__*/React.createElement("div", {
      style: typeof getListEditActionWrapStyle === 'function' ? getListEditActionWrapStyle(isBulkShareMode, isMobile) : { display: 'flex', alignItems: 'center', gap: isMobile ? '4px' : '6px', flexShrink: 0, flexWrap: 'nowrap', justifyContent: isBulkShareMode ? 'stretch' : 'flex-end', marginLeft: isBulkShareMode ? 0 : 'auto', flex: isBulkShareMode ? 1 : undefined, width: isBulkShareMode && isMobile ? '100%' : 'auto' }
    },
      renderGalleryActionButtons({ onAdd: handleUploadClick, onPaste: handlePasteGalleryUpload })
    )
  );
  // Mobile pagination has no arrows -- a horizontal drag pans the centered page window so more
  // numbers can be revealed, then a tap (or drag-release past the threshold) selects a page.
  const [paginationDragPage, setPaginationDragPage] = React.useState(null);
  const paginationDragRef = React.useRef(null);
  const paginationSuppressClickRef = React.useRef(false);
  React.useEffect(() => {
    setPaginationDragPage(null);
    paginationDragRef.current = null;
    paginationSuppressClickRef.current = false;
  }, [indexedPhotoPage, indexedPhotoTotal, galleryListPage]);
  // One existing gallery paginator serves server-indexed photos and every local 100-row view.
  // Keeping the same control prevents an unbounded date/list DOM from returning through a
  // separate “load on scroll” implementation.
  const renderGalleryPagination = (options = null) => {
    const isIndexedPage = !options;
    if (isIndexedPage && (!usingPhotoIndex || indexedPhotoComplete || typeof onIndexedPhotoPageChange !== 'function')) return null;
    const currentPage = Number(options?.currentPage || indexedPhotoPage || 1);
    const pageCount = Math.max(1, Number(options?.pageCount || Math.ceil(Number(indexedPhotoTotal || 0) / GALLERY_PAGE_SIZE)) || 1);
    const onPageChange = options?.onChange || onIndexedPhotoPageChange;
    const pageLoading = options?.loading ?? indexedPhotoLoading;
    const alwaysShow = !!options?.alwaysShow;
    if (pageCount <= 1 && !alwaysShow) return null;
    const windowSize = isMobile ? 5 : 10;
    const focusPage = paginationDragPage != null ? paginationDragPage : currentPage;
    const pages = getPaginationWindow(focusPage, pageCount, windowSize);
    const go = page => {
      if (pageLoading || page < 1 || page > pageCount || page === currentPage || typeof onPageChange !== 'function') return;
      if (isIndexedPage) void onPageChange(page);
      else onPageChange(page);
      if (gridHostRef.current) gridHostRef.current.scrollTop = 0;
    };
    // Same chevron used by the month-nav / BackArrowIcon (down path, rotated). Double-stack for
    // first/last. Mobile hides arrows entirely -- number window alone is enough on a phone.
    const chevron = (direction, key) => /*#__PURE__*/React.createElement("svg", {
      key: key,
      xmlns: "http://www.w3.org/2000/svg", width: isMobile ? "13" : "18", height: isMobile ? "13" : "18", viewBox: "0 0 24 24",
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
      /*#__PURE__*/React.createElement("span", { style: { display: 'inline-flex', marginLeft: isMobile ? '-9px' : '-11px' } },
        chevron(direction, `${direction}-b`)
      )
    );
    const arrow = (label, page, disabled, glyph) => /*#__PURE__*/React.createElement("button", {
      key: label, type: "button", className: "gallery-pagination-button gallery-pagination-arrow",
      "aria-label": label, disabled: disabled || pageLoading, onClick: () => go(page)
    }, glyph);
    const endMobileDrag = () => {
      const drag = paginationDragRef.current;
      paginationDragRef.current = null;
      if (!drag) return;
      const target = Math.min(pageCount, Math.max(1, Number(drag.focusPage) || currentPage));
      setPaginationDragPage(null);
      if (!drag.moved) return;
      // Prevent the synthesized click on the button under the finger from also selecting a page.
      paginationSuppressClickRef.current = true;
      if (target !== currentPage) go(target);
    };
    const mobileDragProps = isMobile ? {
      onPointerDown: event => {
        if (pageLoading || event.button != null && event.button !== 0) return;
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
      "aria-label": options?.label || "갤러리 페이지",
      ...mobileDragProps
    },
      arrow('첫 페이지', 1, currentPage <= 1, doubleChevron('left')),
      arrow('이전 페이지', currentPage - 1, currentPage <= 1, chevron('left')),
      pages.map(page => /*#__PURE__*/React.createElement("button", {
        key: page, type: "button", className: `gallery-pagination-button${page === currentPage ? ' is-active' : ''}${page === focusPage && page !== currentPage ? ' is-focus' : ''}`,
        "aria-current": page === currentPage ? 'page' : undefined,
        disabled: pageLoading,
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
      arrow('다음 페이지', currentPage + 1, currentPage >= pageCount, chevron('right')),
      arrow('마지막 페이지', pageCount, currentPage >= pageCount, doubleChevron('right'))
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
        height: '100%', boxSizing: 'border-box', padding: '0 12px', fontSize: 'var(--font-size-md)', fontWeight: 900,
        borderRadius: 'var(--radius-sm)', border: 'none', cursor: 'pointer',
        backgroundColor: galleryViewMode === tab.key ? 'var(--accent-primary)' : 'transparent',
        color: galleryViewMode === tab.key ? '#FFFFFF' : 'var(--text-muted)'
      }
    }, tab.label))
  );
  const renderBulkTagPanel = () => (!isBulkShareMode || !isBulkTagPanelOpen || activeTab !== 'photos') ? null : /*#__PURE__*/React.createElement("section", {
    className: "gallery-bulk-tag-panel",
    "aria-label": "선택한 사진 태그 관리",
    style: {
      display: 'flex', flexDirection: 'column', gap: '8px', padding: isMobile ? '10px' : '12px',
      border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)'
    }
  },
    /*#__PURE__*/React.createElement("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' } },
      /*#__PURE__*/React.createElement("strong", { style: { color: 'var(--text-main)', fontSize: 'var(--font-size-sm)' } }, `선택한 사진 ${selectedBulkPhotos.length}장`),
      /*#__PURE__*/React.createElement("span", { style: { color: 'var(--text-muted)', fontSize: 'var(--font-size-xs)' } }, '추가 또는 일괄 삭제')
    ),
    /*#__PURE__*/React.createElement("div", { style: { display: 'flex', gap: '6px', alignItems: 'center', width: '100%' } },
      /*#__PURE__*/React.createElement("input", {
        type: "text", className: "form-input", value: bulkTagDraft,
        onChange: event => setBulkTagDraft(event.target.value),
        onKeyDown: event => { if (event.key === 'Enter') { event.preventDefault(); void applyBulkPhotoTags('add'); } },
        placeholder: '태그 입력 (공백 또는 쉼표로 구분)', maxLength: 640,
        style: { flex: 1, minWidth: 0, minHeight: '38px', borderRadius: 'var(--radius-full)' }
      }),
      /*#__PURE__*/React.createElement("button", {
        type: "button", className: "btn btn-action btn-action-dark", disabled: isBulkTagSaving,
        onClick: () => { void applyBulkPhotoTags('add'); },
        style: { minHeight: '38px', padding: '0 12px', borderRadius: 'var(--radius-full)', whiteSpace: 'nowrap', fontWeight: 800 }
      }, isBulkTagSaving ? '저장 중' : '추가')
    ),
    selectedBulkTagTokens.length > 0 && /*#__PURE__*/React.createElement("div", { style: { display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' } },
      selectedBulkTagTokens.map(({ tag, count }) => /*#__PURE__*/React.createElement("button", {
        key: tag, type: "button", title: `#${tag} 입력`, onClick: () => setBulkTagDraft(tag),
        style: { minHeight: '26px', padding: '2px 9px', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-full)', background: 'var(--bg-card)', color: 'var(--text-secondary)', fontSize: 'var(--font-size-xs)', fontWeight: 800, cursor: 'pointer' }
      }, `#${tag}${count === selectedBulkPhotos.length ? '' : ` · ${count}`}`))
    ),
    /*#__PURE__*/React.createElement("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', flexWrap: 'wrap' } },
      /*#__PURE__*/React.createElement("div", { style: { display: 'flex', gap: '6px', alignItems: 'center' } },
        /*#__PURE__*/React.createElement("button", {
          type: "button", className: "btn btn-action btn-action-outline",
          onClick: () => {
            const tokens = selectedBulkTagTokens.map(t => t.tag);
            if (!tokens.length) {
              showToast?.('선택한 사진에 등록된 태그가 없습니다.', 'info');
              return;
            }
            setTagClipboard(tokens);
            showToast?.(`태그 ${tokens.length}개를 복사했습니다.`, 'success');
          },
          title: "선택한 사진 태그 복사 (Ctrl+C)",
          style: { minHeight: '30px', padding: '0 10px', borderRadius: 'var(--radius-full)', fontSize: 'var(--font-size-xs)', fontWeight: 700 }
        }, "태그 복사"),
        /*#__PURE__*/React.createElement("button", {
          type: "button", className: "btn btn-action btn-action-outline",
          disabled: isBulkTagSaving || getTagClipboard().length === 0,
          onClick: () => {
            const tags = getTagClipboard();
            if (!tags.length) {
              showToast?.('복사된 태그가 없습니다.', 'info');
              return;
            }
            void applyBulkPhotoTags('add', tags.map(t => `#${t}`).join(' '));
          },
          title: "복사한 태그 붙여넣기 (Ctrl+V)",
          style: { minHeight: '30px', padding: '0 10px', borderRadius: 'var(--radius-full)', fontSize: 'var(--font-size-xs)', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }
        },
          ClipboardPasteIcon ? /*#__PURE__*/React.createElement(ClipboardPasteIcon, { size: 14 }) : null,
          `붙여넣기${getTagClipboard().length > 0 ? ` (${getTagClipboard().length})` : ''}`
        )
      ),
      /*#__PURE__*/React.createElement("button", {
        type: "button", className: "btn btn-action btn-action-danger", disabled: isBulkTagSaving || !bulkTagDraft.trim(),
        onClick: () => { void applyBulkPhotoTags('remove'); },
        style: { minHeight: '34px', padding: '0 12px', borderRadius: 'var(--radius-full)', fontSize: 'var(--font-size-xs)', fontWeight: 800 }
      }, '입력한 태그 일괄 삭제')
    )
  );
  const renderPhotoListHeader = () => /*#__PURE__*/React.createElement(React.Fragment, null,
    /*#__PURE__*/React.createElement("div", {
      style: { ...LIST_TOOLBAR_ROW_STYLE, gap: isMobile ? '6px' : '8px' }
    },
      (!isBulkShareMode || !isMobile) && renderVisitFilterToggleMobile(),
      /*#__PURE__*/React.createElement("div", {
        style: typeof getListEditActionWrapStyle === 'function' ? getListEditActionWrapStyle(isBulkShareMode, isMobile) : { display: 'flex', alignItems: 'center', gap: isMobile ? '4px' : '6px', flexShrink: 0, minWidth: 0, flexWrap: 'nowrap', justifyContent: isBulkShareMode ? 'stretch' : 'flex-end', marginLeft: isBulkShareMode ? 0 : 'auto', flex: isBulkShareMode ? 1 : undefined, width: isBulkShareMode && isMobile ? '100%' : 'auto' }
      },
        renderGalleryActionButtons({ onAdd: handleUploadClick, onPaste: handlePasteGalleryUpload })
      )
    ),
    renderBulkTagPanel()
  );
  const renderLinkListHeader = () => /*#__PURE__*/React.createElement("div", {
    style: { display: 'flex', flexDirection: 'column', gap: '8px' }
  },
    /*#__PURE__*/React.createElement("div", {
      style: { ...LIST_TOOLBAR_ROW_STYLE, gap: isMobile ? '6px' : '8px' }
    },
      (!isBulkShareMode || !isMobile) && renderVisitFilterToggleMobile(),
      /*#__PURE__*/React.createElement("div", {
        style: typeof getListEditActionWrapStyle === 'function' ? getListEditActionWrapStyle(isBulkShareMode, isMobile) : { display: 'flex', alignItems: 'center', gap: isMobile ? '4px' : '6px', flexShrink: 0, flexWrap: 'nowrap', justifyContent: isBulkShareMode ? 'stretch' : 'flex-end', marginLeft: isBulkShareMode ? 0 : 'auto', flex: isBulkShareMode ? 1 : undefined, width: isBulkShareMode && isMobile ? '100%' : 'auto' }
      },
        renderGalleryActionButtons({ onAdd: handleToggleAddLink, onPaste: handlePasteLinkFromClipboard, addDisabled: isSavingLink, pasteDisabled: isSavingLink })
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
    if (activeTab === 'analysis') {
      const allItems = mediaAnalysis.items || [];
      const unreviewed = [];
      const reviewed = [];
      for (const item of allItems) {
        const photo = photoByAssetKey.get(item.assetKey) || analysisPhotoCache[item.assetKey];
        const isReviewed = Boolean(item.review);
        const currentTagsText = item.review?.finalTags?.join(' ') || photo?.tags || '';
        const completeness = getPhotoTagCompleteness(currentTagsText, calendar);
        const isHandled = isReviewed || completeness.isComplete;
        const meta = { item, photo, completeness, isReviewed, isHandled };
        if (isHandled) {
          reviewed.push(meta);
        } else {
          unreviewed.push(meta);
        }
      }
      const displayList = analysisViewMode === 'unreviewed' ? unreviewed : reviewed;
      const canSaveAnalysisTags = typeof onSaveImageTags === 'function'
        || typeof onBulkSaveImageTags === 'function'
        || typeof window.__gatherBulkSaveImageTags === 'function';

      const renderChips = (values, colorType = 'accent') => {
        const bgMap = {
          people: 'color-mix(in srgb, var(--status-danger, #e11d48) 12%, transparent)',
          places: 'color-mix(in srgb, var(--status-green, #10b981) 12%, transparent)',
          meetings: 'color-mix(in srgb, var(--accent-primary) 12%, transparent)',
          accent: 'color-mix(in srgb, var(--accent-primary) 10%, transparent)'
        };
        const colorMap = {
          people: 'var(--status-danger, #e11d48)',
          places: 'var(--status-green, #10b981)',
          meetings: 'var(--accent-primary)',
          accent: 'var(--accent-primary)'
        };
        const borderMap = {
          people: 'color-mix(in srgb, var(--status-danger, #e11d48) 22%, transparent)',
          places: 'color-mix(in srgb, var(--status-green, #10b981) 22%, transparent)',
          meetings: 'color-mix(in srgb, var(--accent-primary) 22%, transparent)',
          accent: 'color-mix(in srgb, var(--accent-primary) 20%, transparent)'
        };
        return (Array.isArray(values) ? values : []).slice(0, 16).map(value => /*#__PURE__*/React.createElement('span', {
          key: value,
          style: {
            display: 'inline-flex',
            alignItems: 'center',
            minHeight: '26px',
            padding: '2px 10px',
            borderRadius: 'var(--radius-full)',
            background: bgMap[colorType] || bgMap.accent,
            color: colorMap[colorType] || colorMap.accent,
            border: `1px solid ${borderMap[colorType] || borderMap.accent}`,
            fontSize: 'var(--font-size-xs, 12px)',
            fontWeight: 800,
            whiteSpace: 'nowrap'
          }
        }, `#${value}`));
      };

      const appendTagToDraft = tagToAdd => {
        const clean = String(tagToAdd || '').replace(/^#+/, '').trim();
        if (!clean) return;
        setAnalysisAction(prev => {
          const rawTokens = (prev.draft || '').trim().split(/\s+/).filter(Boolean);
          const existingClean = rawTokens.map(t => t.replace(/^#+/, ''));
          if (existingClean.includes(clean)) return prev;
          const newTokens = [...rawTokens, `#${clean}`];
          return { ...prev, draft: newTokens.join(' ') };
        });
      };

      return /*#__PURE__*/React.createElement('section', {
        className: 'media-analysis-feed',
        style: { display: 'flex', flexDirection: 'column', gap: '14px', padding: '12px 0 24px' },
        'aria-label': 'AI 사진 분석 추천'
      },
        /* Top summary and batch action toolbar */
        /*#__PURE__*/React.createElement('div', {
          className: 'v2-analysis-header-toolbar',
          style: {
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '12px',
            padding: '14px 18px',
            background: 'var(--bg-card)',
            border: '1px solid var(--v2-card-border, var(--border-subtle))',
            borderRadius: 'var(--radius-lg, 16px)',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)'
          }
        },
          /* Left summary info & view toggle */
          /*#__PURE__*/React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: '6px' } },
            /*#__PURE__*/React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' } },
              /*#__PURE__*/React.createElement('span', { style: { fontWeight: 900, color: 'var(--text-main)', fontSize: 'var(--font-size-md, 15px)' } }, 'AI 사진 분석 추천'),
              /* Segmented view switcher */
              /*#__PURE__*/React.createElement('div', {
                style: {
                  display: 'inline-flex',
                  padding: '2px',
                  background: 'var(--bg-secondary)',
                  borderRadius: 'var(--radius-full, 9999px)',
                  border: '1px solid var(--border-subtle)',
                  gap: '2px'
                }
              },
                /* Unreviewed tab */
                /*#__PURE__*/React.createElement('button', {
                  type: 'button',
                  onClick: () => setAnalysisViewMode('unreviewed'),
                  style: {
                    padding: '4px 12px',
                    borderRadius: 'var(--radius-full, 9999px)',
                    border: 'none',
                    background: analysisViewMode === 'unreviewed' ? 'var(--bg-card)' : 'transparent',
                    color: analysisViewMode === 'unreviewed' ? 'var(--accent-primary)' : 'var(--text-muted)',
                    fontWeight: analysisViewMode === 'unreviewed' ? 900 : 600,
                    fontSize: 'var(--font-size-xs, 12px)',
                    boxShadow: analysisViewMode === 'unreviewed' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px'
                  }
                },
                  '미처리',
                  /*#__PURE__*/React.createElement('span', {
                    style: {
                      padding: '1px 6px',
                      borderRadius: '9999px',
                      background: analysisViewMode === 'unreviewed' ? 'var(--accent-primary)' : 'var(--border-subtle)',
                      color: analysisViewMode === 'unreviewed' ? '#fff' : 'var(--text-secondary)',
                      fontSize: '11px',
                      fontWeight: 800
                    }
                  }, unreviewed.length)
                ),
                /* Reviewed tab */
                /*#__PURE__*/React.createElement('button', {
                  type: 'button',
                  onClick: () => setAnalysisViewMode('reviewed'),
                  style: {
                    padding: '4px 12px',
                    borderRadius: 'var(--radius-full, 9999px)',
                    border: 'none',
                    background: analysisViewMode === 'reviewed' ? 'var(--bg-card)' : 'transparent',
                    color: analysisViewMode === 'reviewed' ? 'var(--accent-primary)' : 'var(--text-muted)',
                    fontWeight: analysisViewMode === 'reviewed' ? 900 : 600,
                    fontSize: 'var(--font-size-xs, 12px)',
                    boxShadow: analysisViewMode === 'reviewed' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px'
                  }
                },
                  '검토 완료',
                  /*#__PURE__*/React.createElement('span', {
                    style: {
                      padding: '1px 6px',
                      borderRadius: '9999px',
                      background: analysisViewMode === 'reviewed' ? 'var(--accent-primary)' : 'var(--border-subtle)',
                      color: analysisViewMode === 'reviewed' ? '#fff' : 'var(--text-secondary)',
                      fontSize: '11px',
                      fontWeight: 800
                    }
                  }, reviewed.length)
                )
              )
            ),
            /*#__PURE__*/React.createElement('p', {
              style: { margin: 0, color: 'var(--text-muted)', fontSize: 'var(--font-size-xs, 12px)', lineHeight: 1.4 }
            }, analysisViewMode === 'unreviewed'
              ? '날짜(YYMMDD)·장소·인물 태그 중 누락되었거나 추천된 항목입니다. 수정/적용 시 검토 완료로 이동합니다.'
              : '검토를 마쳤거나 필수 태그(날짜·장소·인물)가 모두 입력된 사진 목록입니다.')
          ),
          /* Right action buttons */
          /*#__PURE__*/React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' } },
            analysisViewMode === 'unreviewed' && unreviewed.length > 0 && /*#__PURE__*/React.createElement('button', {
              type: 'button',
              className: 'btn btn-action',
              disabled: isBatchApplying || mediaAnalysis.loading,
              onClick: handleBatchApplyAnalysis,
              style: {
                minHeight: '36px',
                padding: '0 16px',
                borderRadius: 'var(--radius-full)',
                background: 'var(--accent-primary)',
                color: 'var(--on-brand, #fff)',
                border: 'none',
                fontWeight: 800,
                fontSize: 'var(--font-size-sm, 13px)',
                cursor: isBatchApplying ? 'wait' : 'pointer',
                boxShadow: '0 2px 6px rgba(124, 47, 229, 0.25)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }
            },
              /* Sparkle icon */
              /*#__PURE__*/React.createElement('svg', { width: '13', height: '13', viewBox: '0 0 24 24', fill: 'currentColor' },
                /*#__PURE__*/React.createElement('path', { d: 'm12 2 2.4 7.2L21.6 12l-7.2 2.8L12 22l-2.4-7.2L2.4 12l7.2-2.8L12 2z' })
              ),
              isBatchApplying
                ? `적용 중 (${batchProgress.current}/${batchProgress.total})…`
                : `미처리 전체 태그 적용 (${unreviewed.length})`
            ),
            /*#__PURE__*/React.createElement('button', {
              type: 'button',
              className: 'btn btn-action',
              onClick: () => void loadMediaAnalysis(true),
              disabled: mediaAnalysis.loading || isBatchApplying,
              style: {
                minHeight: '36px',
                padding: '0 14px',
                borderRadius: 'var(--radius-full)',
                background: 'var(--bg-card)',
                color: 'var(--text-main)',
                border: '1px solid var(--border-subtle)',
                fontWeight: 700,
                fontSize: 'var(--font-size-sm, 13px)',
                cursor: mediaAnalysis.loading ? 'wait' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }
            },
              /* Refresh icon */
              /*#__PURE__*/React.createElement('svg', {
                width: '13',
                height: '13',
                viewBox: '0 0 24 24',
                fill: 'none',
                stroke: 'currentColor',
                strokeWidth: '2.5',
                strokeLinecap: 'round',
                strokeLinejoin: 'round'
              },
                /*#__PURE__*/React.createElement('path', { d: 'M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2' })
              ),
              mediaAnalysis.loading ? '불러오는 중…' : '새로고침'
            )
          )
        ),
        mediaAnalysis.error && /*#__PURE__*/React.createElement('p', {
          role: 'alert',
          style: { margin: 0, padding: '12px 16px', borderRadius: 'var(--radius-md)', background: 'color-mix(in srgb, var(--status-danger) 10%, var(--bg-card))', color: 'var(--status-danger)', fontSize: 'var(--font-size-sm)' }
        }, mediaAnalysis.error),
        !mediaAnalysis.loading && !mediaAnalysis.error && displayList.length === 0 && (
          analysisViewMode === 'unreviewed'
            ? /*#__PURE__*/React.createElement('div', {
                style: {
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  padding: '48px 16px',
                  textAlign: 'center',
                  background: 'var(--bg-card)',
                  borderRadius: 'var(--radius-lg, 16px)',
                  border: '1px dashed var(--border-subtle)',
                  color: 'var(--text-muted)'
                }
              },
                /* Big check circle */
                /*#__PURE__*/React.createElement('div', {
                  style: {
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: 'color-mix(in srgb, var(--status-green, #10b981) 15%, transparent)',
                    color: 'var(--status-green, #10b981)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }
                },
                  /*#__PURE__*/React.createElement('svg', { width: '28', height: '28', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: '2.5', strokeLinecap: 'round', strokeLinejoin: 'round' },
                    /*#__PURE__*/React.createElement('polyline', { points: '20 6 9 17 4 12' })
                  )
                ),
                /*#__PURE__*/React.createElement('span', { style: { fontSize: 'var(--font-size-base, 15px)', fontWeight: 800, color: 'var(--text-main)' } }, '모든 사진의 검토 및 태그 작성이 완료되었습니다!'),
                /*#__PURE__*/React.createElement('span', { style: { fontSize: 'var(--font-size-xs, 12px)', maxWidth: '380px', lineHeight: 1.5 } }, '미처리 항목이 없습니다. 날짜(YYMMDD)·장소·인물 필수 정보가 모두 등록되었거나 추천 태그가 적용되었습니다.'),
                reviewed.length > 0 && /*#__PURE__*/React.createElement('button', {
                  type: 'button',
                  onClick: () => setAnalysisViewMode('reviewed'),
                  style: {
                    marginTop: '6px',
                    padding: '8px 18px',
                    borderRadius: 'var(--radius-full)',
                    border: '1px solid var(--accent-primary)',
                    background: 'transparent',
                    color: 'var(--accent-primary)',
                    fontWeight: 800,
                    fontSize: 'var(--font-size-xs, 12px)',
                    cursor: 'pointer'
                  }
                }, `검토 완료된 사진 보기 (${reviewed.length}건)`)
              )
            : /*#__PURE__*/React.createElement('div', {
                style: {
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '48px 16px',
                  textAlign: 'center',
                  color: 'var(--text-muted)'
                }
              },
                /* Info circle */
                /*#__PURE__*/React.createElement('svg', { width: '36', height: '36', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: '1.8' },
                  /*#__PURE__*/React.createElement('circle', { cx: '12', cy: '12', r: '10' }),
                  /*#__PURE__*/React.createElement('line', { x1: '12', y1: '16', x2: '12', y2: '12' }),
                  /*#__PURE__*/React.createElement('line', { x1: '12', y1: '8', x2: '12.01', y2: '8' })
                ),
                /*#__PURE__*/React.createElement('span', { style: { fontSize: 'var(--font-size-base, 14px)', fontWeight: 700 } }, '검토 완료된 사진이 아직 없습니다.'),
                /*#__PURE__*/React.createElement('span', { style: { fontSize: 'var(--font-size-xs, 12px)' } }, '미처리 탭에서 태그를 적용하거나 수정한 사진이 이곳에 보관됩니다.')
              )
        ),
        displayList.map(({ item, photo, completeness, isReviewed }) => {
          const thumbUrl = photo?.thumb || photo?.full || photo?.imageUrl || '';
          const fullUrl = photo?.full || photo?.imageUrl || photo?.thumb || '';
          const isSaving = analysisSavingAssetKey === item.assetKey;
          const isEditing = analysisAction.assetKey === item.assetKey && analysisAction.mode === 'edit';
          const suggestedTags = getAnalysisSuggestedTags(item);
          const suggestedDate = getSuggestedDateTag(photo, item);

          return /*#__PURE__*/React.createElement('article', {
            key: item.id || item.assetKey,
            className: 'v2-analysis-card',
            style: {
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              alignItems: isMobile ? 'stretch' : 'flex-start',
              gap: isMobile ? '12px' : '16px',
              padding: '16px',
              border: '1px solid var(--v2-card-border, var(--border-subtle))',
              borderRadius: 'var(--radius-lg, 16px)',
              background: 'var(--bg-card)',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
              position: 'relative'
            }
          },
            /* Left: Photo Thumbnail */
            /*#__PURE__*/React.createElement('div', {
              className: 'v2-analysis-thumb-wrap',
              style: {
                position: 'relative',
                width: isMobile ? '100%' : '110px',
                height: isMobile ? '190px' : '110px',
                minWidth: isMobile ? 'auto' : '110px',
                borderRadius: 'var(--radius-md, 12px)',
                overflow: 'hidden',
                flexShrink: 0,
                background: 'var(--bg-secondary)',
                cursor: fullUrl ? 'pointer' : 'default',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              },
              title: fullUrl ? '클릭하여 사진 원본 보기' : '사진을 불러오는 중',
              onClick: () => {
                if (!fullUrl) return;
                if (typeof setActiveLightbox === 'function') {
                  setActiveLightbox({
                    urls: [fullUrl],
                    index: 0,
                    meta: [{
                      ...(photo || {}),
                      full: fullUrl,
                      thumb: thumbUrl,
                      assetKey: item.assetKey,
                      mediaKey: item.assetKey,
                      tags: photo?.tags || suggestedTags.join(' ')
                    }]
                  });
                }
              }
            },
              thumbUrl
                ? /*#__PURE__*/React.createElement('img', {
                    src: thumbUrl,
                    alt: '분석 대상 사진',
                    loading: 'lazy',
                    decoding: 'async',
                    referrerPolicy: 'no-referrer',
                    style: {
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block'
                    }
                  })
                : /*#__PURE__*/React.createElement('div', {
                    style: {
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                      color: 'var(--text-muted)'
                    }
                  },
                    /* Photo icon */
                    /*#__PURE__*/React.createElement('svg', {
                      width: '24',
                      height: '24',
                      viewBox: '0 0 24 24',
                      fill: 'none',
                      stroke: 'currentColor',
                      strokeWidth: '1.8'
                    },
                      /*#__PURE__*/React.createElement('rect', { x: '3', y: '3', width: '18', height: '18', rx: '3' }),
                      /*#__PURE__*/React.createElement('circle', { cx: '8.5', cy: '8.5', r: '1.5' }),
                      /*#__PURE__*/React.createElement('path', { d: 'm21 15-5-5L5 21' })
                    ),
                    /*#__PURE__*/React.createElement('span', { style: { fontSize: '11px', fontWeight: 600 } }, '사진 로딩 중')
                  ),
              fullUrl && /*#__PURE__*/React.createElement('div', {
                style: {
                  position: 'absolute',
                  right: '6px',
                  bottom: '6px',
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: 'rgba(0, 0, 0, 0.5)',
                  backdropFilter: 'blur(4px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  pointerEvents: 'none'
                }
              },
                /* Magnifier icon */
                /*#__PURE__*/React.createElement('svg', {
                  width: '13',
                  height: '13',
                  viewBox: '0 0 24 24',
                  fill: 'none',
                  stroke: 'currentColor',
                  strokeWidth: '2.5',
                  strokeLinecap: 'round',
                  strokeLinejoin: 'round'
                },
                  /*#__PURE__*/React.createElement('circle', { cx: '11', cy: '11', r: '8' }),
                  /*#__PURE__*/React.createElement('line', { x1: '21', y1: '21', x2: '16.65', y2: '16.65' })
                )
              )
            ),
            /* Right: Content details and actions */
            /*#__PURE__*/React.createElement('div', {
              className: 'v2-analysis-content',
              style: {
                flex: '1 1 auto',
                minWidth: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                width: '100%'
              }
            },
              /* Card header: Badge + existing tags + completeness badges + time */
              /*#__PURE__*/React.createElement('div', {
                style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }
              },
                /* Left badges */
                /*#__PURE__*/React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' } },
                  /* Sparkle type badge */
                  /*#__PURE__*/React.createElement('span', {
                    style: {
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-full)',
                      background: 'var(--accent-tint, rgba(124, 47, 229, 0.08))',
                      color: 'var(--accent-primary)',
                      fontSize: 'var(--font-size-xs, 12px)',
                      fontWeight: 800
                    }
                  },
                    /* Sparkle icon */
                    /*#__PURE__*/React.createElement('svg', { width: '12', height: '12', viewBox: '0 0 24 24', fill: 'currentColor' },
                      /*#__PURE__*/React.createElement('path', { d: 'm12 2 2.4 7.2L21.6 12l-7.2 2.8L12 22l-2.4-7.2L2.4 12l7.2-2.8L12 2z' })
                    ),
                    item.assetKey ? '사진 분석' : '로컬 사진 분석'
                  ),
                  /* Existing tags badge */
                  photo?.tags
                    ? /*#__PURE__*/React.createElement('span', {
                        style: { fontSize: 'var(--font-size-xs, 12px)', color: 'var(--text-muted)' },
                        title: `기존 등록 태그: ${photo.tags}`
                      }, `기존: ${photo.tags.slice(0, 32)}${photo.tags.length > 32 ? '…' : ''}`)
                    : /*#__PURE__*/React.createElement('span', {
                        style: { fontSize: 'var(--font-size-xs, 12px)', color: 'var(--text-muted)' }
                      }, '기존 태그 없음'),
                  /* Completeness indicators */
                  !completeness.hasDate && /*#__PURE__*/React.createElement('span', {
                    style: {
                      display: 'inline-flex',
                      alignItems: 'center',
                      padding: '1px 7px',
                      borderRadius: 'var(--radius-full)',
                      background: 'color-mix(in srgb, var(--status-danger, #e11d48) 12%, transparent)',
                      color: 'var(--status-danger, #e11d48)',
                      border: '1px solid color-mix(in srgb, var(--status-danger, #e11d48) 25%, transparent)',
                      fontSize: '11px',
                      fontWeight: 800
                    }
                  }, '날짜 누락'),
                  !completeness.hasPlace && /*#__PURE__*/React.createElement('span', {
                    style: {
                      display: 'inline-flex',
                      alignItems: 'center',
                      padding: '1px 7px',
                      borderRadius: 'var(--radius-full)',
                      background: 'color-mix(in srgb, var(--status-danger, #e11d48) 12%, transparent)',
                      color: 'var(--status-danger, #e11d48)',
                      border: '1px solid color-mix(in srgb, var(--status-danger, #e11d48) 25%, transparent)',
                      fontSize: '11px',
                      fontWeight: 800
                    }
                  }, '장소 누락'),
                  !completeness.hasPerson && /*#__PURE__*/React.createElement('span', {
                    style: {
                      display: 'inline-flex',
                      alignItems: 'center',
                      padding: '1px 7px',
                      borderRadius: 'var(--radius-full)',
                      background: 'color-mix(in srgb, var(--status-danger, #e11d48) 12%, transparent)',
                      color: 'var(--status-danger, #e11d48)',
                      border: '1px solid color-mix(in srgb, var(--status-danger, #e11d48) 25%, transparent)',
                      fontSize: '11px',
                      fontWeight: 800
                    }
                  }, '인물 누락'),
                  completeness.isComplete && /*#__PURE__*/React.createElement('span', {
                    style: {
                      display: 'inline-flex',
                      alignItems: 'center',
                      padding: '1px 7px',
                      borderRadius: 'var(--radius-full)',
                      background: 'color-mix(in srgb, var(--status-green, #10b981) 12%, transparent)',
                      color: 'var(--status-green, #10b981)',
                      border: '1px solid color-mix(in srgb, var(--status-green, #10b981) 25%, transparent)',
                      fontSize: '11px',
                      fontWeight: 800
                    }
                  }, '✓ 날짜·장소·인물 완비')
                ),
                /* Right time */
                /*#__PURE__*/React.createElement('time', {
                  style: { color: 'var(--text-muted)', fontSize: 'var(--font-size-xs, 12px)', whiteSpace: 'nowrap' }
                }, formatMediaAnalysisTime(item.lastReceivedAt || item.analyzedAt))
              ),
              /* Suggested tag chips */
              /*#__PURE__*/React.createElement('div', {
                style: { display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }
              },
                renderChips(item.suggestedTags, 'accent'),
                renderChips(item.people, 'people'),
                renderChips(item.places, 'places'),
                renderChips(item.meetings, 'meetings'),
                suggestedTags.length === 0 && /*#__PURE__*/React.createElement('span', {
                  style: { color: 'var(--text-muted)', fontSize: 'var(--font-size-xs, 12px)' }
                }, '추천 태그 없음')
              ),
              /* OCR Text */
              item.ocrText?.length > 0 && /*#__PURE__*/React.createElement('div', {
                style: {
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-md, 8px)',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-secondary)',
                  fontSize: 'var(--font-size-xs, 12px)',
                  lineHeight: 1.45,
                  wordBreak: 'break-all'
                }
              },
                /*#__PURE__*/React.createElement('span', { style: { fontWeight: 700, color: 'var(--text-muted)', marginRight: '6px' } }, '텍스트 인식:'),
                item.ocrText.join(' · ')
              ),
              /* Action row or Review state */
              item.review
                ? /*#__PURE__*/React.createElement('div', {
                    style: { display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px', paddingTop: '4px' }
                  },
                    /* Decision badge */
                    /*#__PURE__*/React.createElement('span', {
                      style: {
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        minHeight: '26px',
                        padding: '2px 10px',
                        borderRadius: 'var(--radius-full)',
                        background: item.review.decision === 'rejected'
                          ? 'var(--bg-secondary)'
                          : 'var(--status-success-bg, #DCFCE7)',
                        color: item.review.decision === 'rejected'
                          ? 'var(--text-muted)'
                          : 'var(--status-success, #15803D)',
                        fontSize: 'var(--font-size-xs, 12px)',
                        fontWeight: 800
                      }
                    },
                      item.review.decision === 'rejected'
                        ? '✕ 제외됨'
                        : (item.review.decision === 'edited' ? '✓ 수정 적용됨' : '✓ 태그 적용 완료')
                    ),
                    item.review.finalTags?.length > 0 && /*#__PURE__*/React.createElement('div', {
                      style: { display: 'inline-flex', flexWrap: 'wrap', gap: '4px' }
                    },
                      item.review.finalTags.map(tag => /*#__PURE__*/React.createElement('span', {
                        key: tag,
                        style: {
                          fontSize: 'var(--font-size-xs, 12px)',
                          fontWeight: 700,
                          color: 'var(--text-secondary)',
                          background: 'var(--bg-secondary)',
                          padding: '1px 7px',
                          borderRadius: 'var(--radius-full)'
                        }
                      }, `#${tag}`))
                    ),
                    /* Re-edit option */
                    /*#__PURE__*/React.createElement('button', {
                      type: 'button',
                      onClick: () => {
                        const existingList = normalizeAnalysisTagList(photo?.tags || '');
                        const finalTags = item.review.finalTags?.length ? item.review.finalTags : suggestedTags;
                        const combined = normalizeAnalysisTagList([...existingList, ...finalTags]).map(t => `#${t}`).join(' ');
                        setAnalysisAction({
                          assetKey: item.assetKey,
                          mode: 'edit',
                          draft: combined
                        });
                      },
                      style: {
                        border: 'none',
                        background: 'transparent',
                        color: 'var(--text-muted)',
                        fontSize: 'var(--font-size-xs, 12px)',
                        cursor: 'pointer',
                        textDecoration: 'underline',
                        padding: '2px 6px'
                      }
                    }, '다시 수정')
                  )
                : /*#__PURE__*/React.createElement('div', {
                    style: { display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '2px' }
                  },
                    isEditing
                      ? /*#__PURE__*/React.createElement('div', {
                          style: { display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }
                        },
                          /* Tag input */
                          /*#__PURE__*/React.createElement('input', {
                            type: 'text',
                            value: analysisAction.draft,
                            onChange: event => setAnalysisAction(previous => ({ ...previous, draft: event.target.value })),
                            placeholder: '적용할 태그를 공백 또는 쉼표로 구분 (#서준 #콘소넌스 #250615)',
                            maxLength: 640,
                            autoFocus: true,
                            style: {
                              width: '100%',
                              boxSizing: 'border-box',
                              minHeight: '40px',
                              padding: '0 14px',
                              borderRadius: 'var(--radius-md, 8px)',
                              border: '1.5px solid var(--accent-primary)',
                              background: 'var(--bg-primary)',
                              color: 'var(--text-main)',
                              fontSize: 'var(--font-size-sm, 13px)',
                              outline: 'none'
                            },
                            onKeyDown: e => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                void applyAnalysisTags(item, normalizeAnalysisTagList(analysisAction.draft), 'edited').catch(error => showToast(String(error?.message || error), 'error'));
                              } else if (e.key === 'Escape') {
                                setAnalysisAction({ assetKey: '', mode: '', draft: '' });
                              }
                            }
                          }),
                          /* Quick chip suggestions */
                          /*#__PURE__*/React.createElement('div', {
                            style: {
                              display: 'flex',
                              alignItems: 'center',
                              flexWrap: 'wrap',
                              gap: '6px',
                              padding: '6px 10px',
                              background: 'var(--bg-secondary)',
                              borderRadius: 'var(--radius-md, 8px)',
                              fontSize: 'var(--font-size-xs, 12px)'
                            }
                          },
                            /*#__PURE__*/React.createElement('span', { style: { fontWeight: 700, color: 'var(--text-muted)' } }, '빠른 추가:'),
                            /* Date suggestion */
                            !completeness.hasDate && suggestedDate && /*#__PURE__*/React.createElement('button', {
                              type: 'button',
                              onClick: () => appendTagToDraft(suggestedDate),
                              style: {
                                padding: '2px 8px',
                                borderRadius: 'var(--radius-full)',
                                border: '1px dashed var(--accent-primary)',
                                background: 'color-mix(in srgb, var(--accent-primary) 8%, transparent)',
                                color: 'var(--accent-primary)',
                                fontSize: '11px',
                                fontWeight: 800,
                                cursor: 'pointer'
                              }
                            }, `+ #${suggestedDate} (촬영일)`),
                            /* Place suggestions from calendar */
                            (Array.isArray(calendar?.places) ? calendar.places : []).map(p => {
                              const name = String(p?.name || p?.title || '').trim();
                              if (!name) return null;
                              return /*#__PURE__*/React.createElement('button', {
                                key: `place-${name}`,
                                type: 'button',
                                onClick: () => appendTagToDraft(name),
                                style: {
                                  padding: '2px 8px',
                                  borderRadius: 'var(--radius-full)',
                                  border: '1px solid color-mix(in srgb, var(--status-green, #10b981) 30%, transparent)',
                                  background: 'color-mix(in srgb, var(--status-green, #10b981) 10%, transparent)',
                                  color: 'var(--status-green, #10b981)',
                                  fontSize: '11px',
                                  fontWeight: 800,
                                  cursor: 'pointer'
                                }
                              }, `+ #${name}`);
                            }),
                            /* Participant suggestions from calendar */
                            (Array.isArray(calendar?.participants) ? calendar.participants : []).map(part => {
                              const name = String(part?.name || '').trim();
                              if (!name) return null;
                              return /*#__PURE__*/React.createElement('button', {
                                key: `person-${name}`,
                                type: 'button',
                                onClick: () => appendTagToDraft(name),
                                style: {
                                  padding: '2px 8px',
                                  borderRadius: 'var(--radius-full)',
                                  border: '1px solid color-mix(in srgb, var(--status-danger, #e11d48) 30%, transparent)',
                                  background: 'color-mix(in srgb, var(--status-danger, #e11d48) 10%, transparent)',
                                  color: 'var(--status-danger, #e11d48)',
                                  fontSize: '11px',
                                  fontWeight: 800,
                                  cursor: 'pointer'
                                }
                              }, `+ #${name}`);
                            }),
                            /* AI suggestions */
                            suggestedTags.map(tag => /*#__PURE__*/React.createElement('button', {
                              key: `ai-${tag}`,
                              type: 'button',
                              onClick: () => appendTagToDraft(tag),
                              style: {
                                padding: '2px 8px',
                                borderRadius: 'var(--radius-full)',
                                border: '1px solid var(--border-subtle)',
                                background: 'var(--bg-card)',
                                color: 'var(--text-secondary)',
                                fontSize: '11px',
                                fontWeight: 700,
                                cursor: 'pointer'
                              }
                            }, `+ #${tag}`))
                          ),
                          /* Action buttons */
                          /*#__PURE__*/React.createElement('div', { style: { display: 'flex', gap: '8px' } },
                            /*#__PURE__*/React.createElement('button', {
                              type: 'button',
                              className: 'btn btn-action',
                              disabled: isSaving,
                              onClick: () => {
                                void applyAnalysisTags(item, normalizeAnalysisTagList(analysisAction.draft), 'edited').catch(error => showToast(String(error?.message || error), 'error'));
                              },
                              style: {
                                minHeight: '34px',
                                padding: '0 14px',
                                borderRadius: 'var(--radius-full)',
                                background: 'var(--accent-primary)',
                                color: 'var(--on-brand, #fff)',
                                border: 'none',
                                fontWeight: 800,
                                fontSize: 'var(--font-size-xs, 12px)',
                                cursor: 'pointer'
                              }
                            }, isSaving ? '저장 중…' : '수정 적용'),
                            /*#__PURE__*/React.createElement('button', {
                              type: 'button',
                              className: 'btn btn-action',
                              disabled: isSaving,
                              onClick: () => setAnalysisAction({ assetKey: '', mode: '', draft: '' }),
                              style: {
                                minHeight: '34px',
                                padding: '0 12px',
                                borderRadius: 'var(--radius-full)',
                                background: 'var(--bg-card)',
                                color: 'var(--text-muted)',
                                border: '1px solid var(--border-subtle)',
                                fontWeight: 700,
                                fontSize: 'var(--font-size-xs, 12px)',
                                cursor: 'pointer'
                              }
                            }, '취소')
                          )
                        )
                      : /*#__PURE__*/React.createElement('div', {
                          style: { display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }
                        },
                          /* Primary: 태그 적용 */
                          /*#__PURE__*/React.createElement('button', {
                            type: 'button',
                            className: 'btn btn-action',
                            disabled: isSaving || isBatchApplying || !canSaveAnalysisTags,
                            onClick: () => {
                              void applyAnalysisTags(item).catch(error => showToast(String(error?.message || error), 'error'));
                            },
                            style: {
                              minHeight: '36px',
                              padding: '0 16px',
                              borderRadius: 'var(--radius-full)',
                              background: 'var(--accent-primary)',
                              color: 'var(--on-brand, #fff)',
                              border: 'none',
                              fontWeight: 800,
                              fontSize: 'var(--font-size-sm, 13px)',
                              cursor: isSaving ? 'wait' : 'pointer',
                              boxShadow: '0 2px 6px rgba(124, 47, 229, 0.25)',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px'
                            }
                          },
                            /* Check icon */
                            /*#__PURE__*/React.createElement('svg', {
                              width: '14',
                              height: '14',
                              viewBox: '0 0 24 24',
                              fill: 'none',
                              stroke: 'currentColor',
                              strokeWidth: '2.5',
                              strokeLinecap: 'round',
                              strokeLinejoin: 'round'
                            },
                              /*#__PURE__*/React.createElement('polyline', { points: '20 6 9 17 4 12' })
                            ),
                            isSaving ? '적용 중…' : '태그 적용'
                          ),
                          /* Secondary: 수정 */
                          /*#__PURE__*/React.createElement('button', {
                            type: 'button',
                            className: 'btn btn-action',
                            disabled: isSaving || isBatchApplying || !canSaveAnalysisTags,
                            onClick: () => {
                              const existingList = normalizeAnalysisTagList(photo?.tags || '');
                              const aiTags = getAnalysisSuggestedTags(item);
                              const combined = normalizeAnalysisTagList([...existingList, ...aiTags]).map(t => `#${t}`).join(' ');
                              setAnalysisAction({
                                assetKey: item.assetKey,
                                mode: 'edit',
                                draft: combined
                              });
                            },
                            style: {
                              minHeight: '36px',
                              padding: '0 14px',
                              borderRadius: 'var(--radius-full)',
                              background: 'var(--bg-card)',
                              color: 'var(--text-main)',
                              border: '1px solid var(--border-subtle)',
                              fontWeight: 700,
                              fontSize: 'var(--font-size-sm, 13px)',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px'
                            }
                          },
                            /* Edit icon */
                            /*#__PURE__*/React.createElement('svg', {
                              width: '13',
                              height: '13',
                              viewBox: '0 0 24 24',
                              fill: 'none',
                              stroke: 'currentColor',
                              strokeWidth: '2.2',
                              strokeLinecap: 'round',
                              strokeLinejoin: 'round'
                            },
                              /*#__PURE__*/React.createElement('path', { d: 'M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z' })
                            ),
                            '수정'
                          ),
                          /* Tertiary: 제외 */
                          /*#__PURE__*/React.createElement('button', {
                            type: 'button',
                            className: 'btn btn-action',
                            disabled: isSaving,
                            onClick: () => {
                              void rejectAnalysisTags(item).catch(error => showToast(String(error?.message || error), 'error'));
                            },
                            style: {
                              minHeight: '36px',
                              padding: '0 14px',
                              borderRadius: 'var(--radius-full)',
                              background: 'var(--bg-card)',
                              color: 'var(--text-muted)',
                              border: '1px solid var(--border-subtle)',
                              fontWeight: 700,
                              fontSize: 'var(--font-size-sm, 13px)',
                              cursor: isSaving ? 'wait' : 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px'
                            }
                          },
                            /* X icon */
                            /*#__PURE__*/React.createElement('svg', {
                              width: '13',
                              height: '13',
                              viewBox: '0 0 24 24',
                              fill: 'none',
                              stroke: 'currentColor',
                              strokeWidth: '2.2',
                              strokeLinecap: 'round',
                              strokeLinejoin: 'round'
                            },
                              /*#__PURE__*/React.createElement('line', { x1: '18', y1: '6', x2: '6', y2: '18' }),
                              /*#__PURE__*/React.createElement('line', { x1: '6', y1: '6', x2: '18', y2: '18' })
                            ),
                            isSaving ? '저장 중…' : '제외'
                          )
                        )
                  )
            )
          );
        })
      );
    }
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
          style: { border: 'none', borderRadius: 'var(--radius-md)', padding: '12px', backgroundColor: 'var(--bg-card)' }
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
                    fontSize: 'var(--font-size-md)', fontWeight: 900, color: 'var(--on-status, #FFFFFF)',
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
            }, isLinkMode ? renderGalleryLinkList(section.items) : (isFileMode ? renderGalleryFileList(section.items) : renderGalleryPhotoGrid(section.items, section.items)))
          );
        }),
        renderGalleryPagination({
          currentPage: pagedDateModeItems.currentPage,
          pageCount: pagedDateModeItems.pageCount,
          onChange: setGalleryListPage,
          label: '일자별 갤러리 페이지',
          alwaysShow: ((activeTab === 'links' || activeTab === 'files') && dateModeSourceItems.length > 0)
        })
      );
    }
    if (activeTab === 'files') {
      const sortedFiles = sortGalleryFlatItems(filteredFiles);
      const pagedFiles = paginateGalleryItems(sortedFiles, galleryListPage, GALLERY_CARD_PAGE_SIZE);
      return /*#__PURE__*/React.createElement(React.Fragment, null,
        renderFileListHeader(),
        sortedFiles.length === 0 ? /*#__PURE__*/React.createElement("div", {
          style: { textAlign: 'center', color: 'var(--text-muted)', padding: '40px 0', fontSize: 'var(--font-size-base)' }
        }, searchQuery ? "검색 결과가 없습니다." : "업로드된 파일이 없습니다.") : renderGalleryFileList(pagedFiles.items),
        renderGalleryPagination({
          currentPage: pagedFiles.currentPage,
          pageCount: pagedFiles.pageCount,
          onChange: setGalleryListPage,
          label: '파일 갤러리 페이지',
          alwaysShow: sortedFiles.length > 0
        })
      );
    }
    if (activeTab === 'links') {
      const sortedLinks = sortGalleryFlatItems(filteredLinks);
      const pagedLinks = paginateGalleryItems(sortedLinks, galleryListPage, GALLERY_CARD_PAGE_SIZE);
      return /*#__PURE__*/React.createElement(React.Fragment, null,
        renderLinkListHeader(),
        sortedLinks.length === 0 ? /*#__PURE__*/React.createElement("div", {
          style: { textAlign: 'center', color: 'var(--text-muted)', padding: '40px 0', fontSize: 'var(--font-size-base)' }
        }, searchQuery ? "검색 결과가 없습니다." : "공유된 링크가 없습니다.") : renderGalleryLinkList(pagedLinks.items),
        renderGalleryPagination({
          currentPage: pagedLinks.currentPage,
          pageCount: pagedLinks.pageCount,
          onChange: setGalleryListPage,
          label: '링크 갤러리 페이지',
          alwaysShow: sortedLinks.length > 0
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
      usingPhotoIndex && !(searchQuery || '').trim()
        ? renderGalleryPagination()
        : renderGalleryPagination({
          currentPage: pagedFallbackPhotos.currentPage,
          pageCount: pagedFallbackPhotos.pageCount,
          onChange: setGalleryListPage,
          label: '사진 갤러리 페이지'
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
            style: PAGE_HEADER_BACK_BTN_STYLE
          }, /*#__PURE__*/React.createElement(BackArrowIcon, { size: 22 })),
          /*#__PURE__*/React.createElement("div", {
            style: PAGE_HEADER_TITLE_STYLE
          }, v2Embed ? '갤러리' : (formatChatHeaderTitle(calendar?.title) ? formatChatHeaderTitle(calendar?.title) + " 갤러리" : "갤러리")),
          /*#__PURE__*/React.createElement("div", {
            style: PAGE_HEADER_ACTIONS_WRAP_STYLE
          },
            /*#__PURE__*/React.createElement("button", {
              type: "button",
              onClick: () => setIsSearchOpen(prev => { if (prev) setSearchQuery(''); return !prev; }),
              title: "갤러리 검색", "aria-label": "갤러리 검색",
              style: PAGE_HEADER_ICON_BTN_STYLE
            }, SearchIcon ? /*#__PURE__*/React.createElement(SearchIcon, { size: 20 }) : "🔍"),
            /*#__PURE__*/React.createElement("button", {
              type: "button",
              onClick: () => setIsMenuOpen(true),
              title: "갤러리 메뉴", "aria-label": "갤러리 메뉴 열기",
              style: PAGE_HEADER_ICON_BTN_STYLE
            }, ThreeLinesIcon ? /*#__PURE__*/React.createElement(ThreeLinesIcon, { size: 22 }) : renderMenuIcon())
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
    accept: (typeof window !== 'undefined' && window.GATHER_CHAT_FILE_ATTACHMENTS && window.GATHER_CHAT_FILE_ATTACHMENTS.CHAT_COMPOSER_ACCEPT) || "image/*,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.csv,.rtf,application/pdf",
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
  }), (() => {
    const tabsNode = asPage && /*#__PURE__*/React.createElement("div", {
      className: isMobile ? "gallery-page-tabs-mobile" : "gallery-page-tabs",
      style: {
        display: 'flex', alignItems: 'center', padding: '0',
        borderBottom: v2Embed ? 'none' : '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-card)',
        flexShrink: 0,
        width: '100%',
        position: v2Embed ? 'relative' : 'fixed',
        top: v2Embed ? 0 : `calc(${isSearchOpen ? '104px' : '56px'} + env(safe-area-inset-top, 0px))`,
        left: v2Embed ? undefined : 0,
        right: v2Embed ? undefined : 0,
        zIndex: v2Embed ? 5 : 1009,
        transition: v2Embed ? undefined : 'transform 0.3s ease, top 0.3s ease',
        transform: v2Embed ? 'none' : (isHeaderVisible ? 'translateY(0)' : 'translateY(calc(-100% - 56px))')
      }
    },
      UnderlineTabs && /*#__PURE__*/React.createElement(UnderlineTabs, {
        ariaLabel: "갤러리 탭",
        variant: "flush",
        activeColor: "var(--brand, #7C2FE5)",
        value: activeTab,
        onChange: v => setGalleryTab(v),
        style: { backgroundColor: 'var(--bg-card)', flex: 1, borderBottom: 'none' },
        options: [
          { value: 'photos', label: '사진' },
          { value: 'links', label: '링크' },
          { value: 'files', label: '파일' },
          { value: 'analysis', label: 'AI 분석' }
        ]
      })
    );
    if (v2Embed && v2GalleryTabsSlot && window.ReactDOM?.createPortal) {
      return window.ReactDOM.createPortal(tabsNode, v2GalleryTabsSlot);
    }
    return !v2Embed ? tabsNode : null;
  })(), /*#__PURE__*/React.createElement("div", {
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
            v2Embed
              ? undefined
              : (
                  `calc(${(!isHeaderVisible
                    ? '12px'
                    : (isSearchOpen ? '156px' : '108px'))} + env(safe-area-inset-top, 0px))`
                  + ' 16px 16px 16px'
                )
          )
        : '16px',
      display: 'flex', flexDirection: 'column', gap: '12px', boxSizing: 'border-box',
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
            }, /*#__PURE__*/React.createElement(window.GATHER_UI_COMPONENTS.ChevronIcon, { size: 15, direction: 'left' })),
            /*#__PURE__*/React.createElement("span", {
              style: { fontWeight: 800, fontSize: '1.1rem', minWidth: '60px', textAlign: 'center' }
            }, pickerGalleryYear, "년"),
            /*#__PURE__*/React.createElement("button", {
              type: "button", className: "btn btn-secondary", style: { padding: '4px 10px', fontSize: 'var(--font-size-base)' },
              onClick: () => setPickerGalleryYear(y => y + 1)
            }, /*#__PURE__*/React.createElement(window.GATHER_UI_COMPONENTS.ChevronIcon, { size: 15, direction: 'right' }))
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
