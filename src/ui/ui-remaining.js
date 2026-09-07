/**
 * Direct media, deadline picker, places section, image URL (P4-21)
 */

/* P6 ESM classic-compat: free names that live scripts shared via global lexical scope */
const GATHER_APP_CALENDAR_DATA = window.GATHER_APP_CALENDAR_DATA || {};
const GATHER_APP_UTILS = window.GATHER_APP_UTILS || {};
function __gatherUiDeps() { return window.GATHER_UI_DEPS || {}; }
/* __fb() bridge */
function __fb() {
  const deps = __gatherUiDeps();
  if (deps && typeof deps.getDb === 'function') {
    try { const d = deps.getDb(); if (d) return d; } catch (e) {}
  }
  return (typeof window !== 'undefined' && window.__gatherFirebaseDb) || null;
}

function getMediaIdentityKeys(...args) {
  const f = __gatherUiDeps().getMediaIdentityKeys || GATHER_APP_UTILS.getMediaIdentityKeys;
  return typeof f === 'function' ? f(...args) : undefined;
}
function extractAllUrlInfos(...args) {
  const f = __gatherUiDeps().extractAllUrlInfos || GATHER_APP_UTILS.extractAllUrlInfos;
  return typeof f === 'function' ? f(...args) : [];
}
function formatPlaceBadgeDate(...args) {
  const f = __gatherUiDeps().formatPlaceBadgeDate || GATHER_APP_UTILS.formatPlaceBadgeDate;
  return typeof f === 'function' ? f(...args) : undefined;
}
function getDisplayPlaceAddress(...args) {
  const f = __gatherUiDeps().getDisplayPlaceAddress || GATHER_APP_UTILS.getDisplayPlaceAddress;
  return typeof f === 'function' ? f(...args) : undefined;
}
function parsePlaceMemoEntries(...args) {
  const f = __gatherUiDeps().parsePlaceMemoEntries || GATHER_APP_UTILS.parsePlaceMemoEntries;
  return typeof f === 'function' ? f(...args) : [];
}
function derivePlaceVisitStatus(...args) {
  const f = __gatherUiDeps().derivePlaceVisitStatus || GATHER_APP_UTILS.derivePlaceVisitStatus;
  return typeof f === 'function' ? f(...args) : undefined;
}
function countPlaceVisits(...args) {
  const f = __gatherUiDeps().countPlaceVisits || GATHER_APP_UTILS.countPlaceVisits;
  return typeof f === 'function' ? f(...args) : undefined;
}
function removeFirstUrl(...args) {
  const f = __gatherUiDeps().removeFirstUrl || GATHER_APP_UTILS.removeFirstUrl;
  return typeof f === 'function' ? f(...args) : undefined;
}
function sortVisitEntriesRecentFirst(...args) {
  const f = __gatherUiDeps().sortVisitEntriesRecentFirst || GATHER_APP_UTILS.sortVisitEntriesRecentFirst;
  return typeof f === 'function' ? f(...args) : undefined;
}
const DEADLINE_PICKER_MONTH_NAMES = GATHER_APP_CALENDAR_DATA.MONTH_NAMES || ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'];

function getMessageImageEntries(...args) {
  const f = __gatherUiDeps().getMessageImageEntries || GATHER_APP_UTILS.getMessageImageEntries;
  return typeof f === 'function' ? f(...args) : undefined;
}
function renderTextWithUrlBadge(...args) {
  const f = __gatherUiDeps().renderTextWithUrlBadge || GATHER_APP_UTILS.renderTextWithUrlBadge;
  return typeof f === 'function' ? f(...args) : undefined;
}
function parseTextWithLinks(...args) {
  const f = __gatherUiDeps().parseTextWithLinks || GATHER_APP_UTILS.parseTextWithLinks;
  return typeof f === 'function' ? f(...args) : undefined;
}
function copyTextToClipboard(...args) {
  const f = __gatherUiDeps().copyTextToClipboard || GATHER_APP_UTILS.copyTextToClipboard;
  return typeof f === 'function' ? f(...args) : undefined;
}
const CHAT_LINK_PREVIEW_SKIP_HOSTS = new Set([
  'leisure-web.yanolja.com',
  'naver.me',
  'nid.naver.com'
]);

function getChatLinkPreviewHost(url) {
  try {
    return new URL(url).hostname.toLowerCase().replace(/^www\./, '');
  } catch (_) {
    return '';
  }
}

function shouldRenderChatLinkPreview(url) {
  if (!url) return false;
  const mediaInfo = getDirectChatMediaInfo(url);
  if (mediaInfo) return false;
  const host = getChatLinkPreviewHost(url);
  if (host && CHAT_LINK_PREVIEW_SKIP_HOSTS.has(host)) return false;
  return true;
}

function getPlaceCategories(...args) {
  const f = __gatherUiDeps().getPlaceCategories || GATHER_APP_UTILS.getPlaceCategories;
  return typeof f === 'function' ? f(...args) : undefined;
}
function getPlaceExternalMapUrl(...args) {
  const f = __gatherUiDeps().getPlaceExternalMapUrl || GATHER_APP_UTILS.getPlaceExternalMapUrl;
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
function extractDirectImageUrls(...args) {
  const f = __gatherUiDeps().extractDirectImageUrls || GATHER_APP_UTILS.extractDirectImageUrls;
  return typeof f === 'function' ? f(...args) : [];
}
export function DirectChatMediaText({ text, searchQuery = '', setActiveLightbox, linkPreview, style = {}, message = null, stickyVideoKey = null, onActivateVideo = null, textMaxWidth = null, linkPreviewOnly = false }) {
  const React = window.React;
  const __deps = window.GATHER_UI_DEPS || {};
  const __comp = window.GATHER_UI_COMPONENTS || {};
  const LinkPreviewCard = __comp.LinkPreviewCard || __deps.LinkPreviewCard;
  const TikTokEmbedWidget = __comp.TikTokEmbedWidget || __deps.TikTokEmbedWidget;
  const extractFirstUrl = __deps.extractFirstUrl;

  const firstUrl = extractFirstUrl(text);
  // linkPreviewOnly (the main-screen chat quick-preview) always shows a plain link-preview card,
  // never the interactive embed/inline-video treatment the full chat room gives the same URL --
  // nulling mediaInfo up front makes every check below naturally take that already-existing path.
  const mediaInfo = linkPreviewOnly ? null : getDirectChatMediaInfo(firstUrl);
  // When a message also contains uploaded images, the surrounding bubble is sized by that
  // image row -- stretchWidth below locks the card to that image layout width. Chat link cards
  // always stretch (width 100%) so left/right margins match the bubble content rather than a
  // narrow fit-content card with empty space on the right.
  const hasAttachedImages = !!(message && getMessageImageEntries(message).length > 0);
  // A bubble with several plain webpage links (not a multi-image-link message, which is handled
  // separately below) used to only ever preview firstUrl -- every other link in the same message
  // was left as plain clickable text with no card. firstUrl always leads the list (and keeps its
  // message-level cachedData below) so a single-link message renders byte-identical to before;
  // any further distinct URLs extractAllUrlInfos finds are appended, each using persisted preview
  // metadata when available (rendering never scrapes a URL; see useLinkPreview's read-only path).
  const allPreviewUrls = React.useMemo(() => {
    const list = firstUrl ? [firstUrl] : [];
    extractAllUrlInfos(text).forEach(info => {
      if (!list.includes(info.url)) list.push(info.url);
    });
    return list;
  }, [text, firstUrl]);
  const previewUrls = React.useMemo(
    () => allPreviewUrls.filter(url => {
      // shouldRenderChatLinkPreview excludes embeddable URLs (youtube/vimeo/tiktok/...) since
      // those normally render as an interactive embed instead of a card -- but linkPreviewOnly
      // just nulled mediaInfo to skip that embed entirely, so here it must allow those same URLs
      // through to the card instead, still respecting the plain host-skip list.
      if (linkPreviewOnly) {
        const host = getChatLinkPreviewHost(url);
        return !(host && CHAT_LINK_PREVIEW_SKIP_HOSTS.has(host));
      }
      return shouldRenderChatLinkPreview(url);
    }),
    [allPreviewUrls, linkPreviewOnly]
  );
  // URLs whose LinkPreviewCard has reported success -- those are stripped from bubble text so the
  // card is the clickable affordance. Loading/failed keep the raw URL visible. Seed with firstUrl
  // when message-level cached linkPreview data already exists (immediate success, no flash).
  const previewUrlsKey = previewUrls.join('\0');
  const [readyPreviewUrls, setReadyPreviewUrls] = React.useState(() => {
    const initial = new Set();
    if (firstUrl && linkPreview && previewUrls.includes(firstUrl)) initial.add(firstUrl);
    return initial;
  });
  React.useEffect(() => {
    const initial = new Set();
    if (firstUrl && linkPreview && previewUrls.includes(firstUrl)) {
      initial.add(firstUrl);
    }
    setReadyPreviewUrls(initial);
    // Only text / previewUrlsKey: linkPreview object identity can churn without meaningful change;
    // cached success is still re-reported via LinkPreviewCard onStatusChange.
  }, [text, previewUrlsKey]);
  const handlePreviewStatusChange = React.useCallback((url, status) => {
    setReadyPreviewUrls(prev => {
      const shouldHave = status === 'success';
      const has = prev.has(url);
      if (shouldHave === has) return prev;
      const next = new Set(prev);
      if (shouldHave) next.add(url);
      else next.delete(url);
      return next;
    });
  }, []);
  const [failed, setFailed] = React.useState(false);
  React.useEffect(() => {
    setFailed(false);
  }, [firstUrl]);
  // Several pasted image links (not an actual upload) shown as a thumbnail grid, same as a real
  // multi-image message -- see extractDirectImageUrls. Computed unconditionally every render like
  // the hooks around it so this component's hook order never changes; the multi-image early
  // return below happens after all hooks have run.
  const directImageUrls = React.useMemo(() => extractDirectImageUrls(text), [text]);

  // Detects which embed the user actually pressed play on, so it can be promoted to the single
  // persistent player (see PersistentVideoPlayer/StickyVideoBox) that survives view/tab switches
  // without ever unmounting -- that's what makes playback genuinely uninterrupted rather than
  // just restarted in a new iframe elsewhere. Clicks inside a cross-origin iframe never bubble
  // out to this parent div, so a plain onClick handler can't see them; a window 'blur' event
  // fires when focus moves INTO the iframe (e.g. the user hit play), and document.activeElement
  // then correctly identifies which of possibly many embeds in the chat history received it.
  const embedIframeRef = React.useRef(null);
  const isEmbedVideo = mediaInfo && mediaInfo.type === 'embed';
  React.useEffect(() => {
    if (!isEmbedVideo || !onActivateVideo) return undefined;
    const handleWindowBlur = () => {
      if (document.activeElement === embedIframeRef.current) {
        onActivateVideo({
          key: message ? message.id : null,
          embedUrl: mediaInfo.url,
          provider: mediaInfo.provider,
          orientation: mediaInfo.orientation,
          title: mediaInfo.provider === 'youtube' ? 'YouTube 영상' : mediaInfo.provider === 'vimeo' ? 'Vimeo 영상' : '링크 영상'
        });
      }
    };
    window.addEventListener('blur', handleWindowBlur);
    return () => window.removeEventListener('blur', handleWindowBlur);
  }, [isEmbedVideo, onActivateVideo, mediaInfo && mediaInfo.url, message && message.id]);
  // While this message owns the active/persistent video, it doesn't render its own iframe at all
  // -- the persistent player (StickyVideoBox, mounted once at the app root) already has the same
  // iframe playing in its own floating PIP, so this just shows a placeholder instead of a second,
  // competing iframe for the same video (see the isThisSticky branch below).
  const isThisSticky = isEmbedVideo && stickyVideoKey && message && message.id === stickyVideoKey;

  if (directImageUrls.length >= 2) {
    const urls = directImageUrls.map(info => info.url);
    const meta = directImageUrls.map((info, idx) => ({
      timestamp: message?.timestamp || Date.now(),
      messageId: message?.id || '',
      imageIndex: idx,
      thumb: info.url,
      directMediaUrl: info.url,
      // Without this, reopening the Lightbox on a multi-image-link message always showed blank
      // tags regardless of what was actually saved -- getMessageDirectMediaEntry (the single-
      // embedded-image case) already does this the same way.
      tags: message ? getDirectMediaTagsForUrl(message, info.url) : ''
    }));
    let remainingText = text;
    directImageUrls.forEach(info => { remainingText = remainingText.split(info.raw).join(''); });
    remainingText = remainingText.replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
    // Same multi-image grid layout as renderChatMessageImages' multi-image branch (app-main.js) --
    // deliberately duplicated rather than shared since that one reads from getMessageImageEntries
    // (actual uploads) while this reads from plain URLs pulled out of the text.
    const mobileCols = urls.length === 2 ? 2 : 3;
    const isMobile = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(max-width: 640px)').matches;
    const activeCols = isMobile ? mobileCols : (urls.length >= 12 ? 6 : urls.length >= 5 ? 5 : mobileCols);
    // Plain length, not wrapped in min(100%, ...) -- see computeChatImageGridMaxWidth in
    // app-main.js for why: paired with width:'100%' below, that's already enough to shrink this
    // safely on a narrow viewport, and min()+percentage here actively breaks the ancestor
    // bubble's own fit-content sizing (verified via isolated repro).
    const maxW = isMobile ? '280px' : `calc(${activeCols} * 76px + (${activeCols} - 1) * 4px)`;
    return /*#__PURE__*/React.createElement(React.Fragment, null,
      /*#__PURE__*/React.createElement('div', {
        className: `chat-message-image-grid${urls.length >= 5 ? ' is-wide' : ''}`,
        style: { width: '100%', maxWidth: maxW, boxSizing: 'border-box', marginBottom: remainingText ? '8px' : (style.marginBottom || '0') }
      }, /*#__PURE__*/React.createElement('div', {
        style: { display: 'grid', gridTemplateColumns: `repeat(${activeCols}, minmax(0, 1fr))`, gap: '4px', width: '100%', maxWidth: '100%', boxSizing: 'border-box' }
      }, urls.map((url, idx) => /*#__PURE__*/React.createElement('img', {
        key: idx,
        src: url,
        alt: `링크 이미지 ${idx + 1}`,
        loading: 'lazy',
        decoding: 'async',
        referrerPolicy: 'no-referrer',
        onClick: () => setActiveLightbox && setActiveLightbox({ urls, index: idx, meta }),
        style: { display: 'block', width: '100%', aspectRatio: '1', borderRadius: 'var(--radius-sm)', cursor: setActiveLightbox ? 'pointer' : 'default', objectFit: 'cover' }
      })))),
      // Capped to the same maxW as the grid above -- a fit-content chat bubble sizes itself to
      // whichever child is widest, so an uncapped caption longer than the grid would stretch the
      // bubble past it, leaving a gap to the grid's right (see computeChatImageGridMaxWidth in
      // app-main.js, whose real-upload counterpart needs the identical fix for the same reason).
      remainingText ? /*#__PURE__*/React.createElement('div', {
        style: { maxWidth: maxW, width: '100%', boxSizing: 'border-box' }
      }, parseTextWithLinks(remainingText, searchQuery)) : null
    );
  }

  if (!mediaInfo || failed) {
    // Strip every URL whose preview card is ready so the card becomes the clickable target.
    // extractAllUrlInfos covers explicit http(s)/www links; bare-domain first URLs (matched by
    // extractFirstUrlInfo but not extractAllUrlInfos) are removed via repeated removeFirstUrl.
    let displayText = String(text || '');
    extractAllUrlInfos(displayText).forEach(info => {
      if (info && info.url && info.raw && readyPreviewUrls.has(info.url)) {
        displayText = displayText.split(info.raw).join('');
      }
    });
    const extractFirstUrlInfo = (__deps.extractFirstUrlInfo || GATHER_APP_UTILS.extractFirstUrlInfo);
    for (let guard = 0; guard < 8; guard += 1) {
      const info = typeof extractFirstUrlInfo === 'function'
        ? extractFirstUrlInfo(displayText)
        : { raw: '', url: firstUrl && readyPreviewUrls.has(firstUrl) ? firstUrl : '' };
      if (!info || !info.url || !readyPreviewUrls.has(info.url)) break;
      if (info.raw) {
        displayText = displayText.split(info.raw).join('');
      } else {
        displayText = removeFirstUrl(displayText);
      }
    }
    displayText = displayText.replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
    const textNode = displayText ? parseTextWithLinks(displayText, searchQuery) : null;
    // textMaxWidth (grid caption case, see above) takes priority when both apply. Otherwise, if
    // a preview URL is still shown in the text (loading/failed), cap it to the compact card width
    // so long tracking query strings don't force the fit-content bubble wider than the card.
    // Once every preview URL is stripped, drop the 280px force so remaining long text can define
    // bubble width and the stretched card matches it. Plain length (not min(100%, ...)) for the
    // same reason as computeChatImageGridMaxWidth in app-main.js.
    const firstUrlStillShown = !!(firstUrl && !readyPreviewUrls.has(firstUrl));
    const effectiveMaxWidth = textMaxWidth || (firstUrlStillShown ? '280px' : null);
    const cappedTextNode = (textNode && effectiveMaxWidth)
      ? /*#__PURE__*/React.createElement('div', {
        style: { maxWidth: effectiveMaxWidth, width: '100%', boxSizing: 'border-box' }
      }, textNode)
      : textNode;
    // textMaxWidth (multi-image grid caption from app-main) wins; else match attached image
    // layout width; else null so stretch uses width/maxWidth 100% and fills the bubble.
    const cardStretchWidth = textMaxWidth
      ? textMaxWidth
      : (hasAttachedImages ? (style.maxWidth || '420px') : null);
    return /*#__PURE__*/React.createElement(React.Fragment, null,
      cappedTextNode,
      previewUrls.map((url, idx) => /*#__PURE__*/React.createElement(LinkPreviewCard, {
        key: url,
        url,
        fallbackTitle: (idx === 0 && text) ? removeFirstUrl(text).replace(/\n/g, ' ').replace(/\s+/g, ' ').trim() : '',
        cachedData: idx === 0 ? linkPreview : undefined,
        stretch: true,
        stretchWidth: cardStretchWidth,
        marginTop: displayText ? 20 : 0,
        onStatusChange: (status) => handlePreviewStatusChange(url, status)
      }))
    );
  }

  const remainingText = removeFirstUrl(text);
  const maxWidth = style.maxWidth || '320px';
  const maxHeight = style.maxHeight || '240px';
  const marginBottom = remainingText ? '8px' : (style.marginBottom || '0');
  const isPortraitEmbed = mediaInfo.type === 'embed' && mediaInfo.orientation === 'portrait';
  const embedTitleMap = {
    youtube: 'YouTube 영상',
    vimeo: 'Vimeo 영상'
  };
  const commonStyle = {
    display: 'block',
    width: '100%',
    // Plain length, not min(100%, ...) -- same fit-content-ancestor bug as
    // computeChatImageGridMaxWidth in app-main.js: a direct-linked image/video pasted in chat
    // sits inside the same fit-content bubble, so wrapping this in min() with a percentage makes
    // the bubble ignore the cap and balloon out while the element itself still renders capped,
    // leaving a gap to its right. width:'100%' above already shrinks it safely when narrower.
    maxWidth,
    maxHeight,
    borderRadius: 'var(--radius-md)',
    backgroundColor: 'var(--bg-primary)',
    objectFit: 'contain',
    marginBottom
  };

  return /*#__PURE__*/React.createElement(React.Fragment, null,
    mediaInfo.type === 'tiktok-widget'
      // Same "ancestor has no definite width" problem as the youtube/vimeo iframe box below --
      // TikTokEmbedWidget's own width:100% resolves to auto against this fit-content bubble, so
      // its container grows to whatever fixed pixel width TikTok's embed.js injects (its iframe
      // ignores the parent entirely) instead of ever being capped. Give it the same real,
      // vw-based starting width + percentage-relative cap the iframe branch uses -- TikTok clips
      // are always portrait, so sized like the portrait embed case below (min 180px, max 500px).
      ? /*#__PURE__*/React.createElement('div', {
        style: {
          width: 'min(70vw, 325px)',
          maxWidth: 'min(100%, 500px)',
          minWidth: '180px',
          margin: '0 auto',
          marginBottom
        }
      }, /*#__PURE__*/React.createElement(TikTokEmbedWidget, {
        key: mediaInfo.url,
        url: mediaInfo.url,
        videoId: mediaInfo.videoId,
        onFailed: () => setFailed(true)
      }))
      : mediaInfo.type === 'image'
      ? /*#__PURE__*/React.createElement('img', {
        src: mediaInfo.url,
        alt: '링크 이미지',
        loading: 'lazy',
        decoding: 'async',
        referrerPolicy: 'no-referrer',
        onError: () => setFailed(true),
        onClick: () => setActiveLightbox && setActiveLightbox({
          urls: [mediaInfo.url],
          index: 0,
          mediaKey: getMediaIdentityKeys({
            messageId: message?.id || '',
            imageIndex: 0,
            directMediaUrl: mediaInfo.url
          }, { source: message?.uploadSource === 'memo' ? 'memo' : 'chat', messageId: message?.id || '' })?.mediaKey || '',
          refKey: getMediaIdentityKeys({
            messageId: message?.id || '',
            imageIndex: 0,
            directMediaUrl: mediaInfo.url
          }, { source: message?.uploadSource === 'memo' ? 'memo' : 'chat', messageId: message?.id || '' })?.refKey || '',
          meta: [{
            timestamp: message?.timestamp || Date.now(),
            messageId: message?.id || '',
            imageIndex: 0,
            thumb: mediaInfo.url,
            tags: message?.directMediaTags || '',
            directMediaUrl: mediaInfo.url,
            mediaKey: getMediaIdentityKeys({
              messageId: message?.id || '',
              imageIndex: 0,
              directMediaUrl: mediaInfo.url
            }, { source: message?.uploadSource === 'memo' ? 'memo' : 'chat', messageId: message?.id || '' })?.mediaKey || '',
            refKey: getMediaIdentityKeys({
              messageId: message?.id || '',
              imageIndex: 0,
              directMediaUrl: mediaInfo.url
            }, { source: message?.uploadSource === 'memo' ? 'memo' : 'chat', messageId: message?.id || '' })?.refKey || ''
          }]
        }),
        style: { ...commonStyle, cursor: setActiveLightbox ? 'pointer' : 'default' }
      })
      : mediaInfo.type === 'video'
      ? /*#__PURE__*/React.createElement('video', {
        src: mediaInfo.url,
        muted: true,
        autoPlay: true,
        loop: true,
        playsInline: true,
        controls: true,
        preload: 'metadata',
        referrerPolicy: 'no-referrer',
        onError: () => setFailed(true),
        style: commonStyle
      })
      : (() => {
        // Chat-room case uses vw (not %) width: the ancestor chain here (shrink-to-fit flex
        // item, then a plain block) has no definite width, so % would resolve to 'auto' and
        // collapse the <iframe> to 300x150. vw resolves against the viewport directly, also
        // letting bubble/bubble-wrapper shrink-to-fit around it instead of stretching wider and
        // leaving empty space beside it. isMiniChat (dashboard preview) already sits in a
        // definite-size container so it stays %-based. Doubles as the desktop drag-resize handle
        // (.chat-media-resizable in app.css): resize:horizontal grows width, aspect-ratio keeps
        // height proportional for free.
        const isMini = !!style.isMiniChat;
        const embedWidth = isMini ? '100%' : (isPortraitEmbed ? (style.portraitEmbedMaxWidth || '360px') : (style.embedMaxWidth || '760px'));
        const minW = isMini ? '0' : (isPortraitEmbed ? '150px' : '180px');
        const maxW = isMini ? '100%' : (isPortraitEmbed ? '500px' : '1400px');
        // LinkPreviewCard lives INSIDE this width-constrained div, not as a sibling, so it
        // matches the video's rendered width even after a drag-resize via .chat-media-resizable.
        const embedBoxStyle = {
          width: isMini ? `min(100%, ${embedWidth})` : `min(88vw, ${embedWidth})`,
          // maxWidth also clamps to 100% of the bubble now that bubble-wrapper's min-width:0
          // lets it actually shrink -- the vw estimate above is only ever a *starting* size;
          // this is what stops it from overflowing once the real available space is smaller.
          maxWidth: `min(100%, ${maxW})`,
          minWidth: minW,
          margin: '0 auto',
          marginBottom
        };
        // This message owns the active/persistent video -- it doesn't render its own iframe here
        // at all, since the exact same iframe is already playing in StickyVideoBox's floating PIP.
        if (isThisSticky) {
          return /*#__PURE__*/React.createElement('div', {
            style: {
              ...embedBoxStyle,
              aspectRatio: isPortraitEmbed ? '9 / 16' : '16 / 9',
              maxHeight: isPortraitEmbed ? 'min(72vh, 620px)' : 'min(54vh, 430px)',
              borderRadius: 'var(--radius-md)',
              backgroundColor: '#000',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'rgba(255, 255, 255, 0.75)',
              fontSize: 'var(--font-size-md)',
              fontWeight: 800
            }
          }, /*#__PURE__*/React.createElement('span', null, '▶ 미니플레이어(PIP) 재생 중'));
        }
        return /*#__PURE__*/React.createElement('div', {
          className: isMini ? '' : 'chat-media-resizable',
          style: embedBoxStyle
        }, /*#__PURE__*/React.createElement('iframe', {
          ref: embedIframeRef,
          src: mediaInfo.url,
          title: embedTitleMap[mediaInfo.provider] || '링크 영상',
          loading: 'lazy',
          allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share',
          allowFullScreen: true,
          onError: () => setFailed(true),
          style: {
            display: 'block',
            width: '100%',
            aspectRatio: isPortraitEmbed ? '9 / 16' : '16 / 9',
            maxHeight: isPortraitEmbed ? 'min(72vh, 620px)' : 'min(54vh, 430px)',
            border: '0',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--bg-primary)'
          }
        }), firstUrl && /*#__PURE__*/React.createElement(LinkPreviewCard, {
          // Direct video embeds (especially YouTube) still get a metadata card below the
          // player. Previously shouldRenderChatLinkPreview() rejected every media URL, so
          // those links showed only a blank/plain video block while ordinary web links showed
          // title and thumbnail. The card is supplemental; the iframe remains unchanged.
          url: firstUrl,
          fallbackTitle: text ? removeFirstUrl(text).replace(/\n/g, ' ').replace(/\s+/g, ' ').trim() : '',
          cachedData: linkPreview,
          stretch: true,
          marginTop: 20
        }));
      })(),
    remainingText ? /*#__PURE__*/React.createElement('div', null, parseTextWithLinks(remainingText, searchQuery)) : null
  );
}

export function DeadlineDateTimePicker({ value, onChange, disabled, dateOnly = false, placeholder, rangeMode = false, rangeStart, rangeEnd, onChangeRange }) {
  const React = window.React;
  const __deps = window.GATHER_UI_DEPS || {};
  const __comp = window.GATHER_UI_COMPONENTS || {};
  const CalendarSearchIcon = __comp.CalendarSearchIcon || __deps.CalendarSearchIcon;

  const [isOpen, setIsOpen] = React.useState(false);
  const now = new Date();
  // dateOnly mode stores/reads plain YYYY-MM-DD (no time component) -- append a fixed local
  // midnight when parsing so Date() doesn't interpret the bare date string as UTC (see
  // isValidDateString's "always UTC" comment elsewhere in this file for the same pitfall).
  const parsed = value ? new Date(dateOnly ? `${value}T00:00` : value) : null;
  const isValid = parsed && !Number.isNaN(parsed.getTime());
  const [pYear, setPYear] = React.useState(isValid ? parsed.getFullYear() : now.getFullYear());
  const [pMonth, setPMonth] = React.useState(isValid ? parsed.getMonth() : now.getMonth());
  const [pDay, setPDay] = React.useState(isValid ? parsed.getDate() : now.getDate());
  const [pTime, setPTime] = React.useState(isValid && !dateOnly ? value.slice(11, 16) : '23:59');
  // rangeMode: 호텔스닷컴/야놀자 스타일 2탭 구간 선택 -- 백드롭 하나를 열고 1번째 클릭은
  // 시작일, 2번째 클릭은 종료일로 자동 인식하며, 3번째 클릭은 다시 새 시작일로 리셋된다.
  const [localRangeStart, setLocalRangeStart] = React.useState(rangeStart || null);
  const [localRangeEnd, setLocalRangeEnd] = React.useState(rangeEnd || null);
  const [rangePickStep, setRangePickStep] = React.useState('start');

  const openPicker = () => {
    if (rangeMode) {
      const anchor = rangeStart || null;
      const d = anchor ? new Date(`${anchor}T00:00`) : null;
      const v = d && !Number.isNaN(d.getTime());
      setPYear(v ? d.getFullYear() : now.getFullYear());
      setPMonth(v ? d.getMonth() : now.getMonth());
      setLocalRangeStart(rangeStart || null);
      setLocalRangeEnd(rangeEnd || null);
      setRangePickStep('start');
      setIsOpen(true);
      return;
    }
    const d = value ? new Date(dateOnly ? `${value}T00:00` : value) : null;
    const v = d && !Number.isNaN(d.getTime());
    setPYear(v ? d.getFullYear() : now.getFullYear());
    setPMonth(v ? d.getMonth() : now.getMonth());
    setPDay(v ? d.getDate() : now.getDate());
    if (!dateOnly) setPTime(v ? value.slice(11, 16) : '23:59');
    setIsOpen(true);
  };

  const daysInMonth = new Date(pYear, pMonth + 1, 0).getDate();
  const firstWeekday = new Date(pYear, pMonth, 1).getDay();

  const handleDayClick = day => {
    if (!rangeMode) { setPDay(day); return; }
    const mm = String(pMonth + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    const dateStr = `${pYear}-${mm}-${dd}`;
    if (rangePickStep === 'start') {
      setLocalRangeStart(dateStr);
      setLocalRangeEnd(null);
      setRangePickStep('end');
      return;
    }
    const start = dateStr < localRangeStart ? dateStr : localRangeStart;
    const end = dateStr < localRangeStart ? localRangeStart : dateStr;
    setLocalRangeStart(start);
    setLocalRangeEnd(end);
    setRangePickStep('start');
    if (typeof onChangeRange === 'function') onChangeRange({ start, end });
  };

  const handleApply = () => {
    if (rangeMode) { setIsOpen(false); return; }
    const mm = String(pMonth + 1).padStart(2, '0');
    const dd = String(pDay).padStart(2, '0');
    onChange(dateOnly ? `${pYear}-${mm}-${dd}` : `${pYear}-${mm}-${dd}T${pTime}`);
    setIsOpen(false);
  };

  const dayNamesKo = ['일', '월', '화', '수', '목', '금', '토'];
  const dayNameStr = isValid ? dayNamesKo[parsed.getDay()] : '';
  const fmtRangeDate = d => {
    if (!d) return '';
    const dt = new Date(`${d}T00:00`);
    return `${dt.getMonth() + 1}.${dt.getDate()}(${dayNamesKo[dt.getDay()]})`;
  };
  const displayText = rangeMode
    ? (rangeStart || rangeEnd)
      ? `${fmtRangeDate(rangeStart) || '시작일'} ~ ${fmtRangeDate(rangeEnd) || '종료일'}`
      : (placeholder || '기간 선택')
    : isValid
      ? dateOnly
        ? `${parsed.getFullYear()}.${String(parsed.getMonth() + 1).padStart(2, '0')}.${String(parsed.getDate()).padStart(2, '0')} (${dayNameStr})`
        : `${parsed.getFullYear()}.${String(parsed.getMonth() + 1).padStart(2, '0')}.${String(parsed.getDate()).padStart(2, '0')} (${dayNameStr}) ${value.slice(11, 16)}`
      : (placeholder || (dateOnly ? '날짜 선택' : '날짜/시간 선택'));

  return /*#__PURE__*/React.createElement('div', { style: { position: 'relative' } },
    /*#__PURE__*/React.createElement('button', {
      type: 'button',
      className: 'form-input',
      disabled,
      style: {
        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px',
        cursor: disabled ? 'default' : 'pointer', textAlign: 'left'
      },
      onClick: openPicker
    },
      /*#__PURE__*/React.createElement('span', { style: { minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, displayText),
      (dateOnly || rangeMode) && /*#__PURE__*/React.createElement(CalendarSearchIcon, { size: 18 })
    ),
    (() => {
      const sheet = isOpen && /*#__PURE__*/React.createElement('div', {
        className: 'bottom-sheet-overlay',
        onClick: () => setIsOpen(false),
        style: { zIndex: 12000 }
      }, /*#__PURE__*/React.createElement('div', {
        className: 'bottom-sheet',
        onClick: e => e.stopPropagation()
      },
        /*#__PURE__*/React.createElement('div', { className: 'bottom-sheet-header' },
          /*#__PURE__*/React.createElement('h4', null, rangeMode ? (rangePickStep === 'start' ? '시작일 선택' : '종료일 선택') : (dateOnly ? '날짜 선택' : '날짜/시간 선택')),
          /*#__PURE__*/React.createElement('button', {
            type: 'button',
            style: { background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.2rem', cursor: 'pointer' },
            onClick: () => setIsOpen(false)
          }, '✕')
        ),
        /*#__PURE__*/React.createElement('div', { className: 'bottom-sheet-body' },
          /*#__PURE__*/React.createElement('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '12px' } },
            /*#__PURE__*/React.createElement('button', { type: 'button', className: 'btn btn-secondary', style: { padding: '4px 10px', fontSize: 'var(--font-size-base)' }, onClick: () => setPYear(y => y - 1) }, '◀'),
            /*#__PURE__*/React.createElement('span', { style: { fontWeight: 800, fontSize: '1rem', minWidth: '60px', textAlign: 'center' } }, `${pYear}년`),
            /*#__PURE__*/React.createElement('button', { type: 'button', className: 'btn btn-secondary', style: { padding: '4px 10px', fontSize: 'var(--font-size-base)' }, onClick: () => setPYear(y => y + 1) }, '▶')
          ),
          /*#__PURE__*/React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', marginBottom: '12px' } },
            DEADLINE_PICKER_MONTH_NAMES.map((name, idx) => /*#__PURE__*/React.createElement('button', {
              key: idx, type: 'button',
              onClick: () => {
                setPMonth(idx);
                const dim = new Date(pYear, idx + 1, 0).getDate();
                if (!rangeMode && pDay > dim) setPDay(dim);
              },
              style: {
                padding: '6px 4px', borderRadius: 'var(--radius-sm)',
                border: pMonth === idx ? '2px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                background: pMonth === idx ? 'rgba(99, 102, 241, 0.15)' : 'var(--bg-card)',
                color: pMonth === idx ? 'var(--accent-primary)' : 'var(--text-main)',
                fontWeight: pMonth === idx ? 800 : 500, fontSize: 'var(--font-size-md)', cursor: 'pointer'
              }
            }, name))
          ),
          /*#__PURE__*/React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '4px' } },
            ['일', '월', '화', '수', '목', '금', '토'].map(w => /*#__PURE__*/React.createElement('div', {
              key: w, style: { textAlign: 'center', fontSize: 'var(--font-size-xs)', fontWeight: 700, color: 'var(--text-muted)' }
            }, w))
          ),
          /*#__PURE__*/React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '14px' } },
            Array.from({ length: firstWeekday }).map((_, i) => /*#__PURE__*/React.createElement('div', { key: `blank-${i}` })),
            Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const mm = String(pMonth + 1).padStart(2, '0');
              const dateStr = rangeMode ? `${pYear}-${mm}-${String(day).padStart(2, '0')}` : '';
              const isStart = rangeMode && !!localRangeStart && dateStr === localRangeStart;
              const isEnd = rangeMode && !!localRangeEnd && dateStr === localRangeEnd;
              const isRangeEndpoint = isStart || isEnd;
              const isInRange = rangeMode && localRangeStart && localRangeEnd && dateStr > localRangeStart && dateStr < localRangeEnd;
              const isSelected = rangeMode ? isRangeEndpoint : pDay === day;
              // 시작일/종료일 두 칸이 하나의 구간 막대처럼 보이도록, 시작일은 좌측만, 종료일은
              // 우측만 둥글게 -- 하루만 선택된 경우(시작=종료)에는 기존처럼 네 모서리 다 둥글게.
              const rangeRadius = isStart && isEnd
                ? 'var(--radius-sm)'
                : isStart ? 'var(--radius-sm) 0 0 var(--radius-sm)'
                : isEnd ? '0 var(--radius-sm) var(--radius-sm) 0'
                : isInRange ? '0' : 'var(--radius-sm)';
              return /*#__PURE__*/React.createElement('button', {
                key: day, type: 'button', onClick: () => handleDayClick(day),
                style: {
                  padding: '6px 0', borderRadius: rangeMode ? rangeRadius : 'var(--radius-sm)',
                  border: isSelected ? '2px solid var(--accent-primary)' : '1px solid transparent',
                  background: isSelected ? 'rgba(99, 102, 241, 0.15)' : (isInRange ? 'rgba(99, 102, 241, 0.06)' : 'transparent'),
                  color: isSelected ? 'var(--accent-primary)' : 'var(--text-main)',
                  fontWeight: isSelected ? 800 : 500, fontSize: 'var(--font-size-md)', cursor: 'pointer'
                }
              }, day);
            })
          ),
          !dateOnly && /*#__PURE__*/React.createElement('div', { style: { marginBottom: '14px' } },
            /*#__PURE__*/React.createElement('label', { style: { fontSize: 'var(--font-size-md)', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' } }, '시간'),
            /*#__PURE__*/React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '8px' } },
              /*#__PURE__*/React.createElement('input', {
                type: 'number', inputMode: 'numeric', className: 'form-input', style: { flex: '1 1 0%', minWidth: 0, textAlign: 'center' },
                min: 0, max: 23, value: Number(pTime.slice(0, 2)),
                onChange: e => {
                  const h = Math.min(23, Math.max(0, Number(e.target.value) || 0));
                  setPTime(`${String(h).padStart(2, '0')}:${pTime.slice(3, 5)}`);
                }
              }),
              /*#__PURE__*/React.createElement('span', { style: { fontWeight: 800, color: 'var(--text-muted)' } }, ':'),
              /*#__PURE__*/React.createElement('input', {
                type: 'number', inputMode: 'numeric', className: 'form-input', style: { flex: '1 1 0%', minWidth: 0, textAlign: 'center' },
                min: 0, max: 59, value: Number(pTime.slice(3, 5)),
                onChange: e => {
                  const m = Math.min(59, Math.max(0, Number(e.target.value) || 0));
                  setPTime(`${pTime.slice(0, 2)}:${String(m).padStart(2, '0')}`);
                }
              })
            )
          ),
          /*#__PURE__*/React.createElement('button', {
            type: 'button',
            className: 'btn btn-primary',
            style: { width: '100%', height: '44px', minHeight: '44px', fontSize: '0.95rem', fontWeight: 800, borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
            onClick: handleApply
          }, '선택 완료')
        )
      ));
      return sheet && typeof document !== 'undefined' && ReactDOM.createPortal ? ReactDOM.createPortal(sheet, document.body) : sheet;
    })()
  );
}

function handleSectionHeaderKeyDown(event, onToggle) {
  if (event.key !== 'Enter' && event.key !== ' ') return;
  event.preventDefault();
  onToggle();
}

export function PlacesSection({ calendar, onViewAll, onSelectPlace }) {
  const React = window.React;
  const __deps = window.GATHER_UI_DEPS || {};
  const __comp = window.GATHER_UI_COMPONENTS || {};
  const PlaceSectionIcon = __comp.PlaceSectionIcon || __deps.PlaceSectionIcon;
  const PlaceCategoryMarkerIcon = __comp.PlaceCategoryMarkerIcon || __deps.PlaceCategoryMarkerIcon;
  const BuildingIcon = __comp.BuildingIcon || __deps.BuildingIcon;
  const getCalendarPlaces = __deps.getCalendarPlaces;

  // Unlike the other main-screen preview sections, collapsed here still shows 2 cards (not 0) --
  // the toggle only widens 2 -> 4, it never hides the section entirely.
  const [collapsed, setCollapsed] = React.useState(true);
  const places = getCalendarPlaces(calendar);
  const categoryMap = React.useMemo(() => {
    const categories = getPlaceCategories(calendar) || [];
    return categories.reduce((acc, c) => { acc[c.id] = c; return acc; }, {});
  }, [calendar]);
  const sortedPlaces = React.useMemo(() => {
    return places.slice().sort((a, b) => ((b.createdAt || b.updatedAt || 0) - (a.createdAt || a.updatedAt || 0)));
  }, [places]);
  const handleSectionTitleKeyDown = event => handleSectionHeaderKeyDown(event, () => setCollapsed(prev => !prev));

  if (places.length === 0) return null;

  const displayedPlaces = sortedPlaces.slice(0, collapsed ? 2 : 4);

  return /*#__PURE__*/React.createElement("section", { className: "summary-card" },
    /*#__PURE__*/React.createElement("div", {
      className: `summary-title is-toggleable${collapsed ? ' is-collapsed' : ''}`,
      role: "button",
      tabIndex: 0,
      "aria-expanded": !collapsed,
      "data-no-press-feedback": true,
      onClick: () => setCollapsed(prev => !prev),
      onKeyDown: handleSectionTitleKeyDown,
      style: { display: 'flex', alignItems: 'center', gap: '6px', width: '100%', color: 'var(--text-main)', cursor: 'pointer' }
    },
      /*#__PURE__*/React.createElement("div", {
        style: { display: 'flex', alignItems: 'center', gap: '6px', flex: 1, minWidth: 0, color: 'var(--text-main)' }
      },
        /*#__PURE__*/React.createElement(PlaceSectionIcon, null),
        /*#__PURE__*/React.createElement("span", null, "장소")
      ),
      /*#__PURE__*/React.createElement("div", {
        style: { marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '2px', flexShrink: 0 }
      },
        /*#__PURE__*/React.createElement("button", {
          type: "button",
          onClick: e => { e.stopPropagation(); onViewAll(); },
          style: { background: 'none', border: 'none', color: '#3B82F6', fontSize: 'var(--font-size-md)', fontWeight: 800, cursor: 'pointer', padding: '4px 6px' }
        }, "전체보기")
      )
    ),
    /*#__PURE__*/React.createElement("div", {
      style: { display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }
    }, displayedPlaces.map(place => {
      const category = categoryMap[place.categoryId] || categoryMap.etc || { color: '#94A3B8', name: '기타' };
      const memoEntries = parsePlaceMemoEntries(place.memo);
      const dated = sortVisitEntriesRecentFirst(memoEntries.filter(e => e.date));
      const latestEntry = dated[0] || null;
      const memoWithoutDate = memoEntries.filter(e => !e.date).map(e => e.note).join('\n');
      const visitStatus = derivePlaceVisitStatus ? derivePlaceVisitStatus(place) : place.visitStatus;
      const visitLabel = visitStatus === 'planned' ? '방문예정' : '방문';
      const visitCount = countPlaceVisits ? countPlaceVisits(place, dated, category) : dated.length;
      const openPlace = () => {
        if (typeof onSelectPlace === 'function') onSelectPlace(place);
        else if (typeof onViewAll === 'function') onViewAll();
      };
      return /*#__PURE__*/React.createElement("div", {
        key: place.id,
        "data-place-preview-id": place.id,
        role: "button",
        tabIndex: 0,
        onClick: openPlace,
        onKeyDown: e => {
          if (e.key !== 'Enter' && e.key !== ' ') return;
          e.preventDefault();
          openPlace();
        },
        style: {
          display: 'flex', flexDirection: 'column', gap: '4px', padding: '10px 12px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--bg-primary)', cursor: 'pointer'
        }
      },
        /*#__PURE__*/React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' } },
          /*#__PURE__*/React.createElement("span", {
            style: {
              display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '3px 8px 3px 3px', borderRadius: 'var(--radius-full)',
              backgroundColor: `${category.color}18`, color: category.color, fontSize: 'var(--font-size-xs)', fontWeight: 900
            }
          },
            /*#__PURE__*/React.createElement("span", {
              style: {
                width: '16px', height: '16px', borderRadius: '50%', flexShrink: 0,
                backgroundColor: visitStatus === 'planned' ? '#FFFFFF' : category.color,
                border: visitStatus === 'planned' ? `1px solid ${category.color}` : 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box'
              }
            }, PlaceCategoryMarkerIcon ? /*#__PURE__*/React.createElement(PlaceCategoryMarkerIcon, {
              category, size: 10, strokeColor: visitStatus === 'planned' ? category.color : '#fff'
            }) : null),
            category.name
          ),
          /*#__PURE__*/React.createElement("span", {
            style: {
              fontSize: 'var(--font-size-2xs)', fontWeight: 700, padding: '2px 7px', borderRadius: 'var(--radius-full)',
              backgroundColor: visitStatus === 'planned' ? 'rgba(249, 115, 22, 0.12)' : 'rgba(16, 185, 129, 0.12)',
              color: visitStatus === 'planned' ? '#EA580C' : 'var(--status-green)'
            }
          }, visitLabel),
          visitCount > 0 && /*#__PURE__*/React.createElement("span", {
            style: { fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', fontWeight: 700 }
          }, `총 ${visitCount}회 ${visitLabel}`),
          /* Same icon + getPlaceExternalMapUrl + window.open behavior as the 업체보기 button
             on the full Places page's own list row (see ui-places.js) -- kept in sync by
             calling the identical shared bridge function rather than re-deriving a URL here. */
          /*#__PURE__*/React.createElement("button", {
            type: "button",
            title: "업체보기",
            onClick: event => {
              event.preventDefault();
              event.stopPropagation();
              const url = getPlaceExternalMapUrl(place);
              if (url) window.open(url, '_blank', 'noopener,noreferrer');
            },
            style: { marginLeft: 'auto', flexShrink: 0, display: 'flex', alignItems: 'center', background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: 'var(--text-light)' }
          }, BuildingIcon && /*#__PURE__*/React.createElement(BuildingIcon, { size: 14, style: { pointerEvents: 'none' } }))
        ),
        /*#__PURE__*/React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 } },
          /*#__PURE__*/React.createElement("span", { style: { fontWeight: 800, fontSize: 'var(--font-size-base)', color: 'var(--text-main)' } }, place.alias || place.name || '이름 없음'),
          place.address && /*#__PURE__*/React.createElement("span", { style: { fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' } }, getDisplayPlaceAddress(place))
        ),
        latestEntry
          ? /*#__PURE__*/React.createElement("div", {
              className: "place-preview-visit-row",
              style: { borderTop: '1px solid var(--border-subtle)', paddingTop: '6px', marginTop: '4px' }
            },
              /*#__PURE__*/React.createElement("span", { style: { flexShrink: 0, fontWeight: 700, fontSize: 'var(--font-size-sm)' } }, formatPlaceBadgeDate(latestEntry.date) || latestEntry.date),
              /*#__PURE__*/React.createElement("span", { style: { flex: 1, minWidth: 0, fontSize: 'var(--font-size-sm)', color: 'var(--text-main)', wordBreak: 'break-word' } }, latestEntry.note)
            )
          : memoWithoutDate && /*#__PURE__*/React.createElement("div", { style: { fontSize: 'var(--font-size-sm)', color: 'var(--text-main)', borderTop: '1px solid var(--border-subtle)', paddingTop: '6px', marginTop: '4px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '4px' } }, renderTextWithUrlBadge(memoWithoutDate))
      );
    }))
  );
}

// 다른 캘린더의 갤러리 페이지에 이 URL을 붙여넣으면(붙여넣기 버튼 또는 Ctrl+V) 사진과 해시태그를
// 그대로 들고 가되, 그 이후로는 서로 완전히 독립적으로 관리되도록(한쪽에서 태그를 추가/삭제해도
// 다른 쪽에 영향 없음) -- URL 자체는 그대로 두고(다른 곳에 붙여넣어도 정상 동작하는 이미지 링크로
// 남도록) 눈에 보이지 않는 URL 프래그먼트(#)에 태그만 실어 보낸다. 프래그먼트는 서버로 전송되지
// 않고 이미지 로딩에도 영향을 주지 않아 원본 URL의 용도를 해치지 않는다. 파일정보(타입/용량/
// 해상도)는 URL과 업로드 시각만 있으면 붙여넣은 쪽에서도 똑같이 다시 계산되므로 여기 실어보낼
// 필요가 없다 -- 오직 태그(해시태그)만 앱이 스스로 다시 계산해낼 수 없는 값이라 실어 보낸다.
const GATHER_PHOTO_FRAGMENT_PREFIX = '#gatherPhoto=';
function encodeGatherPhotoFragment(tags) {
  const cleanTags = String(tags || '').trim();
  if (!cleanTags) return '';
  try {
    const payload = { v: 1, kind: 'gather-photo', tags: cleanTags };
    const json = JSON.stringify(payload);
    const b64 = typeof btoa === 'function' ? btoa(unescape(encodeURIComponent(json))) : '';
    return b64 ? GATHER_PHOTO_FRAGMENT_PREFIX + b64 : '';
  } catch (_) {
    return '';
  }
}

export function ImageUrlModal({ imageUrl, tags = '', onClose, showToast, onEnsureShareUrl }) {
  const React = window.React;
  const __deps = window.GATHER_UI_DEPS || {};
  const __comp = window.GATHER_UI_COMPONENTS || {};
  const ResizableModalContainer = __comp.ResizableModalContainer || __deps.ResizableModalContainer || (function Shell(p) { return React.createElement('div', p, p.children); });
  const SmallXIcon = __comp.SmallXIcon || __deps.SmallXIcon;

  const [resolvedUrl, setResolvedUrl] = React.useState(imageUrl || '');
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [errorText, setErrorText] = React.useState('');
  const isInlineImageUrl = typeof resolvedUrl === 'string' && resolvedUrl.startsWith('data:');
  const isShareableUrl = /^https?:\/\//.test(resolvedUrl || '');
  // onEnsureShareUrl is a fresh closure on every Lightbox render (it isn't memoized, since it
  // closes over meta/index/onPromoteImageUrl), so keeping it out of the effect's dependency
  // array -- and reading the latest version through a ref instead -- keeps an unrelated parent
  // re-render (e.g. chat messages updating, image dimensions loading) from cancelling and
  // restarting an in-flight share-URL generation before it can resolve.
  const onEnsureShareUrlRef = React.useRef(onEnsureShareUrl);
  onEnsureShareUrlRef.current = onEnsureShareUrl;
  React.useEffect(() => {
    let cancelled = false;
    setResolvedUrl(imageUrl || '');
    setErrorText('');
    if (typeof imageUrl !== 'string' || !imageUrl.startsWith('data:') || typeof onEnsureShareUrlRef.current !== 'function') return;
    setIsGenerating(true);
    Promise.resolve(onEnsureShareUrlRef.current(imageUrl)).then(result => {
      if (cancelled) return;
      const nextUrl = typeof result === 'string' ? result : result?.shareUrl;
      if (nextUrl && /^https?:\/\//.test(nextUrl)) {
        setResolvedUrl(nextUrl);
      } else {
        setErrorText('공유 URL 생성 실패');
      }
    }).catch(err => {
      console.error('Image share URL generation failed:', err);
      if (!cancelled) setErrorText('공유 URL 생성 실패');
    }).finally(() => {
      if (!cancelled) setIsGenerating(false);
    });
    return () => { cancelled = true; };
  }, [imageUrl]);
  return /*#__PURE__*/React.createElement("div", {
    className: "modal-overlay image-url-modal",
    onClick: e => { e.stopPropagation(); onClose(); },
    style: { zIndex: 10050 }
  }, /*#__PURE__*/React.createElement(ResizableModalContainer, {
    className: "modal-container",
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal-header",
    style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' }
  }, /*#__PURE__*/React.createElement("h3", {
    style: { fontSize: '1.1rem', fontWeight: 800 }
  }, "이미지 URL"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onClose,
    style: {
      background: 'none',
      border: 'none',
      color: 'var(--text-muted)',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement(SmallXIcon, { size: 20 }))), /*#__PURE__*/React.createElement("div", {
    className: "modal-body"
  }, /*#__PURE__*/React.createElement("label", {
    style: { fontSize: 'var(--font-size-base)', fontWeight: 700, color: 'var(--text-muted)' }
  }, isGenerating ? "공유 가능한 이미지 URL 생성 중" : "선택한 사진의 원본 이미지 URL"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    className: "form-input",
    style: { width: '100%' },
    value: isGenerating ? '공유 URL을 생성하고 있습니다...' : (isInlineImageUrl ? '공유 가능한 HTTPS URL을 생성할 수 없습니다.' : resolvedUrl || ''),
    readOnly: true
  }), errorText && /*#__PURE__*/React.createElement("div", {
    style: { fontSize: 'var(--font-size-md)', color: '#EF4444', fontWeight: 700 }
  }, errorText, " Storage 업로드 권한 또는 네트워크 상태를 확인해 주세요."), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn-primary",
    disabled: isGenerating || !isShareableUrl,
    style: { opacity: isGenerating || !isShareableUrl ? 0.65 : 1, cursor: isGenerating || !isShareableUrl ? 'not-allowed' : 'pointer' },
    onClick: async () => {
      const fragment = encodeGatherPhotoFragment(tags);
      const copyText = fragment ? `${resolvedUrl || ''}${fragment}` : (resolvedUrl || '');
      const ok = await copyTextToClipboard(copyText);
      const message = ok ? '이미지 URL이 복사되었습니다.' : '복사에 실패했습니다. URL을 직접 선택해 복사해 주세요.';
      if (showToast) showToast(message, ok ? 'success' : 'error');
        else console.warn(message);
    }
  }, isGenerating ? "URL 생성 중..." : "URL 복사하기"))));
}

  if (typeof window !== 'undefined') {
  window.GATHER_UI_COMPONENTS = Object.assign({}, window.GATHER_UI_COMPONENTS || {}, {
    DirectChatMediaText: DirectChatMediaText,
    DeadlineDateTimePicker: DeadlineDateTimePicker,
    PlacesSection: PlacesSection,
    ImageUrlModal: ImageUrlModal,
  });
}
