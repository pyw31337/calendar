import { highlightTextWithYellowMarker } from './app-search.js';
import { extractFirstUrl, getMediaIdentityKeys, getMessageImageEntries, formatBytes, getDataUrlInfo } from './app-domain-helpers.js';
import { bindUiComponentAliases } from './app-ui-wrappers.js';

const React = window.React;
const { DirectChatMediaText, UrlCapsuleBadge, DateCapsuleBadge } = bindUiComponentAliases(React);

function renderChatMessageBody(msg, setActiveLightbox, singleImageStyle = {}, searchQuery = '', stickyVideoKey = null, onActivateVideo = null, linkPreviewOnly = false, onOpenFileAttachment = null) {
  const msgImages = renderChatMessageImages(msg, setActiveLightbox, singleImageStyle);
  const renderFiles = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.renderChatFileAttachments;
  const fileNodes = typeof renderFiles === 'function' && Array.isArray(msg.fileAttachments) && msg.fileAttachments.length
    ? renderFiles(msg.fileAttachments, onOpenFileAttachment)
    : null;
  // A fit-content chat bubble sizes itself to whichever of its children is widest. When there's
  // a multi-image grid above, cap the caption text below it to that same grid width -- otherwise
  // a long caption stretches the bubble past the grid, leaving a gap to the grid's right.
  const imageEntryCount = getMessageImageEntries(msg).length;
  const textMaxWidth = imageEntryCount >= 2 ? computeChatImageGridMaxWidth(imageEntryCount) : null;
  const hasText = !!msg.text;
  return /*#__PURE__*/React.createElement(React.Fragment, null,
    msgImages ? /*#__PURE__*/React.createElement('div', { style: { marginBottom: (hasText || fileNodes) ? '8px' : '0' } }, msgImages) : null,
    fileNodes ? /*#__PURE__*/React.createElement('div', { style: { marginBottom: hasText ? '8px' : '0' } }, fileNodes) : null,
    hasText ? /*#__PURE__*/React.createElement(DirectChatMediaText, {
      text: msg.text,
      searchQuery,
      setActiveLightbox: msgImages ? null : setActiveLightbox,
      linkPreview: msg.linkPreview,
      style: singleImageStyle,
      message: msg,
      stickyVideoKey,
      onActivateVideo,
      textMaxWidth,
      linkPreviewOnly
    }) : null
  );
}

function parseTextWithLinks(text, keyword = '') {
  if (!text) return '';
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const urlTestRegex = /^https?:\/\/[^\s]+$/;
  const parts = text.split(urlRegex);
  return parts.map((part, i) => {
    if (urlTestRegex.test(part)) {
      return /*#__PURE__*/React.createElement("a", {
        key: i,
        href: part,
        target: "_blank",
        rel: "noopener noreferrer",
        style: {
          color: '#2563EB',
          textDecoration: 'underline',
          cursor: 'pointer',
          wordBreak: 'break-all'
        }
      }, part);
    }
    return keyword ? highlightTextWithYellowMarker(part, keyword) : part;
  });
}

function isEmojiOnlyChatText(text) {
  const compact = (text || '').trim();
  if (!compact || extractFirstUrl(compact)) return false;
  try {
    return /^[\p{Emoji_Presentation}\p{Extended_Pictographic}\uFE0F\u200D\s]+$/u.test(compact);
  } catch (e) {
    // FE0F/200D are matched as individual quantified class members here, not as part of a
    // combined grapheme, so the character class below is intentional.
    // eslint-disable-next-line no-misleading-character-class
    return /^[\u203C-\u3299\uD83C-\uDBFF\uDC00-\uDFFF\uFE0F\u200D\s]+$/u.test(compact);
  }
}

function formatCommentDate(...args) {
  const f = (window.GATHER_APP_UTILS || {}).formatCommentDate;
  return typeof f === 'function' ? f(...args) : undefined;
}
// Returns paired {full, thumb} entries for a chat message's attached image(s), handling both
// the legacy single-image fields (imageUrl/thumbUrl) and the imageUrls/thumbUrls arrays used
// by multi-image messages. Empty array when the message has no image at all. Shared by the
// chat bubble renderer below and the calendar-wide PhotoGallery so both read images the same way.

// A confirmedMeeting.photos[] entry auto-linked via a date hashtag (see
// linkTaggedImageToMeetingDates) is a REFERENCE to a real chat message photo
// (sourceMessageId + sourceImageIndex), not an independent copy -- its imageUrl/thumbUrl/tags
// are resolved live from the source message here whenever it's still loaded locally, so the
// exact same photo with the exact same tags shows up identically in the chat room, every
// gallery, and every meeting date it's linked to, and an edit from any one of those places is
// immediately visible everywhere else. Falls back to the entry's own stored fields when the
// source message isn't loaded locally (yet) or no longer exists, and passes manually-uploaded
// 일정 사진 (no sourceMessageId -- a standalone upload with no chat photo behind it) straight
// through unchanged.
function resolveMeetingPhotoDisplay(photo, chatMessages) {
  const fallback = {
    imageUrl: photo?.imageUrl || photo?.full || '',
    thumbUrl: photo?.thumbUrl || photo?.thumb || photo?.imageUrl || photo?.full || '',
    tags: String(photo?.tags || '')
  };
  // Photo-index / REST / older writes may store sourceImageIndex as a numeric string. Coerce
  // before Number.isInteger gates so auto-linked 일정 copies keep chat:<msg>:<idx> identity and
  // do not fall through to meeting:<date>:<photoId> (which duplicated main-gallery lightbox slides).
  const coerceIndex = (value) => {
    if (Number.isInteger(value)) return value;
    const n = Number(value);
    return Number.isFinite(n) ? Math.max(0, Math.round(n)) : null;
  };
  const sourceImageIndex = coerceIndex(photo?.sourceImageIndex);
  const photoForKeys = sourceImageIndex == null ? photo : { ...photo, sourceImageIndex };
  const fallbackKeys = getMediaIdentityKeys(photoForKeys, { source: 'meeting', meetingDate: photo?.meetingDate || '' });
  if (!photo?.sourceMessageId || sourceImageIndex == null) {
    return { ...fallback, ...fallbackKeys, sourceImageIndex };
  }
  const sourceMessage = (Array.isArray(chatMessages) ? chatMessages : []).find(m => m && m.id === photo.sourceMessageId);
  if (!sourceMessage) return { ...fallback, ...fallbackKeys, sourceImageIndex };
  const entry = getMessageImageEntries(sourceMessage)[sourceImageIndex];
  if (!entry) return { ...fallback, ...fallbackKeys, sourceImageIndex };
  return {
    imageUrl: entry.full,
    thumbUrl: entry.thumb,
    tags: ((a, b) => { const ca = String(a||'').split(/[,\s#]+/).map(t=>t.trim()).filter(Boolean).length; const cb = String(b||'').split(/[,\s#]+/).map(t=>t.trim()).filter(Boolean).length; return cb > ca ? String(b||'') : String(a||''); })(entry.tags, photo?.tags),
    // Prefer the live chat slot identity over a stale meeting-local mediaKey.
    assetKey: entry.assetKey || fallbackKeys.assetKey,
    mediaKey: entry.mediaKey || fallbackKeys.mediaKey,
    refKey: fallbackKeys.refKey || entry.refKey,
    sourceImageIndex
  };
}


// Renders a chat message's attached image(s): a single thumbnail for legacy/one-image
// messages, or a wrapping grid of thumbnails for messages sent with multiple images
// (msg.imageUrls/msg.thumbUrls). Returns null when the message has no image at all.
// Shared by renderChatMessageImages below and renderChatMessageBody's caption-text cap so a
// multi-image grid and the caption text under it always agree on a max width -- without this,
// a fit-content chat bubble sizes itself to whichever of the two is wider, and an uncapped long
// caption stretches the bubble past the grid, leaving a visible gap to the grid's right.
function computeChatImageGridMaxWidth(count) {
  const mobileCols = count === 2 ? 2 : 3;
  const isMobile = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(max-width: 640px)').matches;
  const activeCols = isMobile ? mobileCols : (count >= 12 ? 6 : count >= 5 ? 5 : mobileCols);
  // Deliberately a plain length, NOT wrapped in min(100%, ...) -- every caller already pairs this
  // with width:'100%' on the same element, which already shrinks it to the actual available space
  // during normal layout (percentages resolve fine against a definite parent there). Wrapping the
  // max-width itself in min(100%, ...) is redundant for that, and actively wrong: verified via an
  // isolated repro that when an ANCESTOR (the fit-content chat bubble) is computing its own
  // preferred width, a descendant's max-width containing a percentage inside min()/max() resolves
  // as indefinite for that intrinsic-size calculation and gets ignored -- so the bubble sizes
  // itself to something close to its full available width instead of hugging this grid's actual
  // (much narrower) rendered size, leaving a large gap next to it. A bare length isn't ambiguous
  // that way, and still gets safely clamped by the paired width:'100%' when the bubble ends up
  // genuinely narrower than this value.
  return isMobile ? '280px' : `calc(${activeCols} * 76px + (${activeCols} - 1) * 4px)`;
}
function renderChatMessageImages(msg, setActiveLightbox, singleImageStyle = {}) {
  const entries = getMessageImageEntries(msg);
  if (entries.length === 0) return null;
  const thumbs = entries.map(e => e.thumb);
  const displayUrls = entries.map(e => e.full);
  const meta = entries.map(e => ({ timestamp: msg.timestamp, messageId: msg.id, imageIndex: e.imageIndex, thumb: e.thumb, tags: e.tags, source: e.source, uploadSource: e.uploadSource, assetKey: e.assetKey, mediaKey: e.mediaKey, refKey: e.refKey }));
  if (thumbs.length === 1) {
    // The bubble caps display to maxWidth 420px/60vh (singleImageStyle below), so the small
    // thumb (480px cap) is already higher resolution than this ever needs to render at -- using
    // the full/original asset here (up to a 2000px-capped JPEG, or an untouched original up to
    // 1.5MB) downloads and decodes several times more data than the bubble can even show. The
    // lightbox onClick below still opens `displayUrls` (the full asset) when the user taps in.
    return /*#__PURE__*/React.createElement('img', {
      src: thumbs[0] || displayUrls[0],
      alt: '첨부이미지',
      loading: 'lazy',
      decoding: 'async',
      referrerPolicy: 'no-referrer',
      onClick: () => setActiveLightbox && setActiveLightbox({ urls: displayUrls, index: 0, meta }),
      style: {
        display: 'block',
        borderRadius: 'var(--radius-md)',
        cursor: 'pointer',
        objectFit: 'contain',
        width: '100%',
        height: 'auto',
        ...singleImageStyle,
        // Plain length, NOT min(100%, ...) -- same fit-content-ancestor bug as
        // computeChatImageGridMaxWidth above (see its comment): wrapping this in min() with a
        // percentage makes the chat bubble's own fit-content width calculation treat it as
        // indefinite and ignore the cap, so the bubble balloons out while the actual <img> still
        // renders capped at maxWidth during normal layout -- leaving a gap on its right. This was
        // the single-image case that PR #230 (grid/link-preview/URL text) didn't cover, which is
        // why the same-looking gap kept resurfacing on plain photo messages. width:'100%' above
        // already shrinks it safely on a narrow bubble.
        maxWidth: singleImageStyle.maxWidth || '420px',
        maxHeight: singleImageStyle.maxHeight || '60vh'
      }
    });
  }

  // Multi-image layout: PC gets denser rows (4/5/6 cols) while Mobile uses compact 2/3 cols with minmax(0, 1fr)
  // so thumbnails never overflow the chat speech bubble or the right edge of mobile screens.
  const mobileCols = thumbs.length === 2 ? 2 : 3;
  const isMobile = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(max-width: 640px)').matches;
  const activeCols = isMobile ? mobileCols : (thumbs.length >= 12 ? 6 : thumbs.length >= 5 ? 5 : mobileCols);
  const maxW = computeChatImageGridMaxWidth(thumbs.length);

  return /*#__PURE__*/React.createElement('div', {
    className: `chat-message-image-grid${thumbs.length >= 5 ? ' is-wide' : ''}`,
    style: {
      width: '100%',
      maxWidth: maxW,
      boxSizing: 'border-box'
    }
  }, /*#__PURE__*/React.createElement('div', {
    style: {
      display: 'grid',
      gridTemplateColumns: `repeat(${activeCols}, minmax(0, 1fr))`,
      gap: '4px',
      width: '100%',
      maxWidth: '100%',
      boxSizing: 'border-box',
      marginBottom: singleImageStyle.marginBottom || '0'
    }
  }, thumbs.map((thumb, idx) => /*#__PURE__*/React.createElement('img', {
    key: idx,
    src: thumb,
    alt: `첨부이미지 ${idx + 1}`,
    loading: 'lazy',
    decoding: 'async',
    referrerPolicy: 'no-referrer',
    onClick: () => setActiveLightbox && setActiveLightbox({ urls: displayUrls, index: idx, meta }),
    style: {
      display: 'block',
      width: '100%',
      aspectRatio: '1',
      borderRadius: 'var(--radius-sm)',
      cursor: 'pointer',
      objectFit: 'cover'
    }
  }))));
}

// Best-effort per-image metadata for the Lightbox info overlay. Chat images are stored either
// inline as base64 data: URIs (exact size/type derivable from the string itself) or as uploaded
// Firebase Storage URLs -- the latter can't have their size read via a network fetch (Firebase
// Storage's download endpoint sends no CORS header by default, so the browser silently blocks a
// cross-origin fetch() from reading the response), so uploadChatImageAssets/uploadMemoImageAssets
// instead embed the byte size directly in the filename at upload time (e.g. "..._original_
// 214875b.jpg"), which getStorageUrlFileSize parses back out here with zero extra requests.
function getStorageUrlFileSize(url) {
  if (typeof url !== 'string') return null;
  const match = url.match(/_(\d+)b\.[a-zA-Z0-9]+(?:[?#]|$)/);
  return match ? Number(match[1]) : null;
}

function getImageExtFromMime(mime) {
  const map = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif', 'image/heic': 'heic' };
  if (mime && map[mime]) return map[mime];
  const sub = mime && mime.split('/')[1];
  return sub ? sub.split('+')[0] : 'jpg';
}

function buildLightboxImageInfo(url, timestamp) {
  const dataInfo = getDataUrlInfo(url);
  const mime = dataInfo ? dataInfo.mime : 'image/jpeg';
  const ext = getImageExtFromMime(mime);
  const fileDate = timestamp ? new Date(timestamp) : null;
  const fileName = fileDate
    ? `moyeora_${fileDate.getFullYear()}${String(fileDate.getMonth() + 1).padStart(2, '0')}${String(fileDate.getDate()).padStart(2, '0')}_${String(fileDate.getHours()).padStart(2, '0')}${String(fileDate.getMinutes()).padStart(2, '0')}${String(fileDate.getSeconds()).padStart(2, '0')}.${ext}`
    : `moyeora_image.${ext}`;
  let dateLabel = null;
  if (timestamp) {
    const { dateStr, timeStr } = formatCommentDate(timestamp);
    dateLabel = `${dateStr} ${timeStr}`;
  }
  const storageSizeBytes = !dataInfo ? getStorageUrlFileSize(url) : null;
  return {
    dateLabel,
    fileName,
    sizeLabel: dataInfo ? formatBytes(dataInfo.sizeBytes) : (storageSizeBytes != null ? formatBytes(storageSizeBytes) : null),
    typeLabel: ext.toUpperCase()
  };
}

// 입력필드 표시 규칙: 일반 텍스트 / YY.MM.DD 날짜 / URL 분리
function tokenizeRichFieldText(text) {
  const source = String(text || '');
  if (!source.trim()) return [];
  const urlRe = /https?:\/\/[^\s<>"'\]]+/gi;
  const chunks = [];
  let last = 0;
  let match;
  while ((match = urlRe.exec(source)) !== null) {
    if (match.index > last) chunks.push({ type: 'raw', value: source.slice(last, match.index) });
    let href = match[0].replace(/[.,);\]}]+$/g, '');
    chunks.push({ type: 'url', value: href });
    last = match.index + match[0].length;
  }
  if (last < source.length) chunks.push({ type: 'raw', value: source.slice(last) });
  if (chunks.length === 0) chunks.push({ type: 'raw', value: source });

  const tokens = [];
  chunks.forEach(chunk => {
    if (chunk.type === 'url') { tokens.push(chunk); return; }
    const s = chunk.value;
    const dateRe = /(\d{2,4}[./-]\d{1,2}[./-]\d{1,2})/g;
    let dLast = 0, dm;
    while ((dm = dateRe.exec(s)) !== null) {
      if (dm.index > dLast) {
        const piece = s.slice(dLast, dm.index);
        if (piece) tokens.push({ type: 'text', value: piece });
      }
      tokens.push({ type: 'date', value: dm[1] || dm[0] });
      dLast = dm.index + dm[0].length;
    }
    if (dLast < s.length) {
      const piece = s.slice(dLast);
      if (piece) tokens.push({ type: 'text', value: piece });
    }
  });
  return tokens;
}

function renderTextWithUrlBadge(text, options = null) {
  const tokens = tokenizeRichFieldText(text);
  if (tokens.length === 0) return null;
  const stackUrl = !options || options.stackUrl !== false;
  const textRow = [];
  const urlRow = [];
  tokens.forEach((tok, idx) => {
    if (tok.type === 'url') {
      urlRow.push(/*#__PURE__*/React.createElement(UrlCapsuleBadge, {
        key: `u-${idx}-${tok.value}`,
        url: tok.value,
        style: stackUrl ? { alignSelf: 'flex-start' } : { marginLeft: '4px' }
      }));
    } else if (tok.type === 'date') {
      textRow.push(/*#__PURE__*/React.createElement(DateCapsuleBadge, {
        key: `d-${idx}-${tok.value}`,
        date: tok.value,
        style: { marginRight: '4px' }
      }));
    } else {
      const v = tok.value;
      if (!v || !String(v).trim()) return;
      textRow.push(/*#__PURE__*/React.createElement("span", {
        key: `t-${idx}`,
        style: { wordBreak: 'break-word' }
      }, v));
    }
  });
  if (!stackUrl) {
    return /*#__PURE__*/React.createElement("span", {
      style: { display: 'inline-flex', flexWrap: 'wrap', alignItems: 'center', gap: '4px' }
    }, textRow, urlRow);
  }
  if (urlRow.length === 0) {
    if (textRow.length === 0) return null;
    if (textRow.length === 1 && tokens.every(t => t.type === 'text')) return textRow[0];
    return /*#__PURE__*/React.createElement("span", {
      style: { display: 'inline-flex', flexWrap: 'wrap', alignItems: 'center', gap: '4px' }
    }, textRow);
  }
  return /*#__PURE__*/React.createElement("div", {
    style: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px', minWidth: 0 }
  },
    textRow.length > 0 && /*#__PURE__*/React.createElement("span", {
      style: { display: 'inline-flex', flexWrap: 'wrap', alignItems: 'center', gap: '2px', wordBreak: 'break-word' }
    }, textRow),
    /*#__PURE__*/React.createElement("div", {
      style: { display: 'flex', flexDirection: 'column', gap: '4px', maxWidth: '100%' }
    }, urlRow)
  );
}

export {
  renderChatMessageBody,
  parseTextWithLinks,
  isEmojiOnlyChatText,
  formatCommentDate,
  resolveMeetingPhotoDisplay,
  computeChatImageGridMaxWidth,
  renderChatMessageImages,
  buildLightboxImageInfo,
  getStorageUrlFileSize,
  getImageExtFromMime,
  tokenizeRichFieldText,
  renderTextWithUrlBadge
};
