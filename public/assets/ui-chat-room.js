/**
 * Chat room view (P4-16)
 */
(function () {
function ChatRoomView({
  calendar,
  chatMessages,
  loadingOlderChat,
  hasMoreOlderChat,
  onLoadOlderChat,
  chatInput,
  setChatInput,
  chatParticipantId,
  setChatParticipantId,
  isChatSheetOpen,
  setIsChatSheetOpen,
  isChatSubmitting,
  chatTextareaRef,
  chatImage: chatImages,
  setChatImage: setChatImages,
  activeLightbox,
  setActiveLightbox,
  onSend,
  onDeleteMessage,
  onEditMessage,
  onAddPinnedNotice,
  onRemovePinnedNotice,
  onBack,
  isHeaderVisible,
  handleChatScroll,
  onRevealChatInput,
  chatMessagesContainerRef,
  showToast,
  onPromoteImageUrl,
  onSaveImageTags,
  onSearchTag,
  onShare,
  isDarkTheme,
  onToggleTheme,
  fontScalePercent,
  onDecreaseFont,
  onIncreaseFont,
  isChatNotifyEnabled,
  onToggleChatNotifications,
  onOpenGallery,
  onChangeView,
  stickyVideoKey,
  onReleaseSticky
}) {
  const React = window.React;
  const __deps = window.GATHER_UI_DEPS || {};
  const __comp = window.GATHER_UI_COMPONENTS || {};
  const BackArrowIcon = __deps.BackArrowIcon;
  const SmallXIcon = __deps.SmallXIcon;
  const PencilIcon = __deps.PencilIcon;
  const ThreeLinesIcon = __deps.ThreeLinesIcon;
  const MegaphoneIcon = __deps.MegaphoneIcon;
  const EmojiPickerIcon = __deps.EmojiPickerIcon;
  const ChatGalleryModal = __comp.ChatGalleryModal || __deps.ChatGalleryModal;
  const ChatSideMenu = __comp.ChatSideMenu || __deps.ChatSideMenu;
  const EmojiPickerSheet = __comp.EmojiPickerSheet || __deps.EmojiPickerSheet;
  const ImageProcessingOverlay = __comp.ImageProcessingOverlay || __deps.ImageProcessingOverlay;
  const ImageThumbRemoveButton = __comp.ImageThumbRemoveButton || __deps.ImageThumbRemoveButton;
  const InlineSearchBar = __comp.InlineSearchBar || __deps.InlineSearchBar;
  const Lightbox = __comp.Lightbox || __deps.Lightbox;
  const getActiveParticipants = __deps.getActiveParticipants;
  const extractFirstUrl = __deps.extractFirstUrl;
  const autoGrowTextarea = __deps.autoGrowTextarea;
  const formatChatHeaderTitle = __deps.formatChatHeaderTitle;
  const useScrollHideHeader = __deps.useScrollHideHeader;
  const getPinnedNotices = __deps.getPinnedNotices;
  const getMessageImageEntries = __deps.getMessageImageEntries;
  const getChatLastReadTimestamp = __deps.getChatLastReadTimestamp;
  const setChatLastReadTimestamp = __deps.setChatLastReadTimestamp;
  const useTapRevealedMsgId = __deps.useTapRevealedMsgId;
  const useChatSendGuard = __deps.useChatSendGuard;
  const appendChatImageFiles = __deps.appendChatImageFiles;
  const confetti = __deps.confetti || window.confetti;
  const CONFETTI_Z_INDEX = __deps.CONFETTI_Z_INDEX;

  const [viewportBottom, setViewportBottom] = React.useState(0);
  const [isInputFocused, setIsInputFocused] = React.useState(false);
  // 'closed' (default -- nothing shown) | 'list' (existing notices + 공지 추가) | 'add' (textarea)
  const [noticePanelMode, setNoticePanelMode] = React.useState('closed');
  const [noticeInput, setNoticeInput] = React.useState('');
  const [isChatSideMenuOpen, setIsChatSideMenuOpen] = React.useState(false);
  const [isChatGalleryOpen, setIsChatGalleryOpen] = React.useState(false);
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [searchFocusIndex, setSearchFocusIndex] = React.useState(0);

  // Ordered list of message IDs matching the current search query (for ▲▼ navigation)
  const searchMatchIds = React.useMemo(() => {
    if (!searchQuery) return [];
    const q = searchQuery.toLowerCase();
    return chatMessages
      .filter(m => m.text && m.text.toLowerCase().includes(q))
      .map(m => m.id)
      .filter(id => !!id);
  }, [chatMessages, searchQuery]);

  const clampedFocusIdx = searchMatchIds.length > 0
    ? Math.max(0, Math.min(searchFocusIndex, searchMatchIds.length - 1))
    : 0;
  const focusedMsgId = searchMatchIds.length > 0 ? searchMatchIds[clampedFocusIdx] : null;

  // Scroll focused match into view whenever it changes
  React.useEffect(() => {
    if (!focusedMsgId) return;
    const el = document.querySelector('[data-msg-row-id="' + focusedMsgId + '"]');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [focusedMsgId]);

  const pinnedNotices = getPinnedNotices(calendar);
  const revealedMsgId = useTapRevealedMsgId();

  // Read-up-to-here marker: capture the read timestamp as it was BEFORE this view marks
  // everything read, so the marker can be placed at the right spot in the message list.
  // Mirrors the same browser-storage key CommentsSection uses for its unread badge.
  const [priorReadTimestamp] = React.useState(() => getChatLastReadTimestamp(calendar.id));
  React.useEffect(() => {
    const latest = chatMessages.length > 0 ? chatMessages[chatMessages.length - 1].timestamp : 0;
    if (latest > 0) setChatLastReadTimestamp(calendar.id, latest);
  }, [calendar.id, chatMessages.length > 0 ? chatMessages[chatMessages.length - 1]?.timestamp : 0]);

  // Scroll-to-bottom floating button: shown once scrolled far enough away from the latest
  // message that swiping back down manually would be tedious.
  const [showScrollToBottom, setShowScrollToBottom] = React.useState(false);
  // "새로운 메시지" banner: distinct from the generic scroll-to-bottom button above -- this one
  // only appears when a message actually arrives WHILE the user is reading older history
  // (scrolled away from the bottom), replacing the generic button with a labeled pill so a new
  // message doesn't go unnoticed. Clears once the user scrolls back near the bottom themselves.
  const [hasNewMessageBelow, setHasNewMessageBelow] = React.useState(false);
  const prevMessageCountRef = React.useRef(chatMessages.length);
  React.useEffect(() => {
    const increased = chatMessages.length > prevMessageCountRef.current;
    prevMessageCountRef.current = chatMessages.length;
    if (!increased) return;
    const el = chatMessagesContainerRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    if (distanceFromBottom > 200) setHasNewMessageBelow(true);
  }, [chatMessages.length]);
  // Confetti burst around a newly-sent bubble -- only for messages I just sent myself (not
  // ones arriving from other participants, and not the initial batch on mount). Anchors the
  // burst to the actual bubble's on-screen position via its data-msg-row-id, same pattern as
  // celebrateMoneyBurst's origin-element math elsewhere in the app.
  const prevLastMsgIdRef = React.useRef(undefined);
  React.useEffect(() => {
    return; // Disabled chat confetti per user request
    const last = chatMessages[chatMessages.length - 1];
    const prevId = prevLastMsgIdRef.current;
    prevLastMsgIdRef.current = last ? last.id : null;
    if (prevId === undefined || !last || last.id === prevId) return;
    if (last.participantId !== chatParticipantId) return;
    if (typeof confetti !== 'function') return;
    requestAnimationFrame(() => {
      const el = chatMessagesContainerRef.current && last.id
        ? chatMessagesContainerRef.current.querySelector(`[data-msg-row-id="${last.id}"]`)
        : null;
      let origin = { y: 0.75 };
      if (el && typeof el.getBoundingClientRect === 'function') {
        const rect = el.getBoundingClientRect();
        if (rect.width || rect.height) {
          origin = {
            x: (rect.left + rect.width / 2) / window.innerWidth,
            y: (rect.top + rect.height / 2) / window.innerHeight
          };
        }
      }
      try {
        confetti({ particleCount: 36, spread: 60, startVelocity: 26, gravity: 1.1, ticks: 90, origin, scalar: 0.85, zIndex: CONFETTI_Z_INDEX });
      } catch (err) {
        console.warn('Chat confetti error', err);
      }
    });
  }, [chatMessages.length]);
  const handleScrollCombined = (e) => {
    if (handleChatScroll) handleChatScroll(e);
    const el = e.target;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    setShowScrollToBottom(distanceFromBottom > 200);
    if (distanceFromBottom <= 200) setHasNewMessageBelow(false);
  };
  const scrollToBottom = () => {
    if (chatMessagesContainerRef.current) {
      chatMessagesContainerRef.current.scrollTo({ top: chatMessagesContainerRef.current.scrollHeight, behavior: 'smooth' });
    }
  };
  const handleNewMessageBannerClick = () => {
    scrollToBottom();
    setHasNewMessageBelow(false);
  };
  const canSendChatNow = () => !isChatSubmitting && (!!chatInput.trim() || chatImages.length > 0);
  const triggerChatSend = useChatSendGuard(onSend, canSendChatNow);
  const handleSendPointerDown = (event) => {
    if (!canSendChatNow()) return;
    event.preventDefault();
    event.stopPropagation();
    triggerChatSend();
  };
  const handleSendClick = () => {
    triggerChatSend();
  };

  // Note: chat notification on/off is fully owned by the App-level handleMainToggleNotifications,
  // reached here via the isChatNotifyEnabled/onToggleChatNotifications props (passed straight
  // through to ChatSideMenu) -- including the iOS false-positive-permission probe and the
  // NotificationPermissionHelpModal popup. A parallel local copy of this same state/handler/
  // auto-subscribe-effect used to live here too (pre-dating that unification) but was never
  // actually wired to anything -- removed as dead code that only duplicated App's own
  // subscribeUserToPush effect on every ChatRoomView mount.

  // Monitor visualViewport to shift layout above virtual keyboard on mobile devices.
  // Cross-browser notes:
  //  - iOS Safari: visualViewport.height shrinks when keyboard is up; offsetTop may be > 0 if
  //    the page has scrolled up to keep the input in view -- we must subtract offsetTop to get
  //    only the keyboard portion, not page scroll.
  //  - Android Chrome/Samsung: innerHeight truly shrinks with interactive-widget=resizes-content
  //    so the viewportBottom calc yields ~0. The layout simply follows the shrunk window.
  //  - Android Firefox: same as Chrome (innerHeight shrinks).
  //  - All: rAF coalesces rapid back-to-back events (Samsung keyboard auto-complete bar pop-in).
  const vpRafRef = React.useRef(null);
  React.useEffect(() => {
    const updateViewport = () => {
      if (!window.visualViewport) return;
      // offsetTop is non-zero on iOS when the browser scrolls the page to keep the input
      // in view -- that scroll portion is NOT keyboard, so subtract it.
      const offsetTop = window.visualViewport.offsetTop || 0;
      const kbHeight = window.innerHeight - window.visualViewport.height - offsetTop;
      setViewportBottom(Math.max(0, kbHeight));
    };
    const onVpEvent = () => {
      if (vpRafRef.current) cancelAnimationFrame(vpRafRef.current);
      vpRafRef.current = requestAnimationFrame(updateViewport);
    };

    // iOS Safari focus-in fallback: visualViewport resize fires late.
    // When a textarea inside the chat room gets focus, force a delayed measurement.
    const onFocus = (e) => {
      const t = e.target;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA') && t.closest && t.closest('.chat-room-container')) {
        setIsInputFocused(true);
        // Two-pass: immediate (catches partial-open) + 400ms (catches fully-open on iOS)
        setTimeout(updateViewport, 50);
        setTimeout(updateViewport, 400);
      }
    };
    const onBlur = (e) => {
      const t = e.target;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA') && t.closest && t.closest('.chat-room-container')) {
        const related = e.relatedTarget;
        if (related && related.closest && related.closest('.chat-composer')) {
          return;
        }
        setTimeout(() => {
          const a = document.activeElement;
          if (a && (a.tagName === 'TEXTAREA' || a.tagName === 'INPUT') && a.closest &&
              (a.closest('.chat-composer') || a.closest('.chat-room-container'))) {
            setIsInputFocused(true);
            return;
          }
          setIsInputFocused(false);
          setTimeout(updateViewport, 300);
        }, 50);
      }
    };

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', onVpEvent);
      window.visualViewport.addEventListener('scroll', onVpEvent);
    }
    document.addEventListener('focusin', onFocus);
    document.addEventListener('focusout', onBlur);
    updateViewport();
    return () => {
      if (vpRafRef.current) cancelAnimationFrame(vpRafRef.current);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', onVpEvent);
        window.visualViewport.removeEventListener('scroll', onVpEvent);
      }
      document.removeEventListener('focusin', onFocus);
      document.removeEventListener('focusout', onBlur);
    };
  }, []);

  // Keyboard open/close: scroll to bottom AND ensure composer is always visible
  // when keyboard is up. On some Android browsers (Samsung Internet, Chrome), the keyboard
  // appears without a scroll event, so isHeaderVisible must be forced here too.
  React.useEffect(() => {
    if (chatMessagesContainerRef.current) {
      const container = chatMessagesContainerRef.current;
      container.scrollTop = container.scrollHeight;
      const t = setTimeout(() => {
        container.scrollTop = container.scrollHeight;
      }, 100);
      return () => clearTimeout(t);
    }
  }, [viewportBottom]);

  const fileInputRefChat = React.useRef(null);
  const [imageProcessingChat, setImageProcessingChat] = React.useState(null);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = React.useState(false);
  const insertEmojiIntoChatInput = (emoji) => {
    const textarea = chatTextareaRef.current;
    const start = textarea ? (textarea.selectionStart ?? chatInput.length) : chatInput.length;
    const end = textarea ? (textarea.selectionEnd ?? chatInput.length) : chatInput.length;
    const next = chatInput.slice(0, start) + emoji + chatInput.slice(end);
    setChatInput(next);
    if (textarea) {
      requestAnimationFrame(() => {
        textarea.focus();
        const pos = start + emoji.length;
        textarea.setSelectionRange(pos, pos);
      });
    }
  };
  const handleFileChangeChat = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    try {
      await appendChatImageFiles({
        files,
        currentCount: chatImages.length,
        setImageProcessing: setImageProcessingChat,
        setChatImages,
        showToast
      });
    } catch (err) {
      console.error('handleFileChangeChat unexpected error:', err);
      if (showToast) showToast('사진 첨부 중 오류', 'error', 5000);
    } finally {
      setImageProcessingChat(null);
      e.target.value = '';
    }
  };
  const handlePasteImagesChat = async (e) => {
    const pastedFiles = getImageFilesFromClipboardEvent(e);
    if (pastedFiles.length === 0) return;
    const pastedText = e.clipboardData?.getData('text/plain') || '';
    if (!pastedText) e.preventDefault();
    try {
      await appendChatImageFiles({
        files: pastedFiles,
        currentCount: chatImages.length,
        setImageProcessing: setImageProcessingChat,
        setChatImages,
        showToast
      });
    } catch (err) {
      console.error('handlePasteImagesChat unexpected error:', err);
      if (showToast) showToast('붙여넣은 사진 첨부 중 오류', 'error', 5000);
    } finally {
      setImageProcessingChat(null);
    }
  };
  const participants = getActiveParticipants(calendar);
  const participantsMap = participants.reduce((acc, p) => {
    acc[p.id] = p;
    return acc;
  }, {});
  const selectedParticipant = participants.find(p => p.id === chatParticipantId);
  let lastDateStr = '';
  let readMarkerInserted = false;
  const renderedMessages = [];
  chatMessages.forEach((msg, idx) => {
    if (!readMarkerInserted && priorReadTimestamp > 0 && msg.timestamp > priorReadTimestamp) {
      readMarkerInserted = true;
      renderedMessages.push(/*#__PURE__*/React.createElement("div", {
        key: `read-marker-${msg.timestamp}-${idx}`,
        style: {
          position: 'relative',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          margin: '16px 0'
        }
      },
        /*#__PURE__*/React.createElement("div", {
          style: { position: 'absolute', left: 0, right: 0, height: '1px', backgroundColor: '#FCA5A5', zIndex: 1 }
        }),
        /*#__PURE__*/React.createElement("span", {
          style: {
            position: 'relative', zIndex: 2, backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5',
            borderRadius: '12px', padding: '3px 12px', fontSize: '0.72rem', color: '#EF4444', fontWeight: 'bold'
          }
        }, '여기까지 읽으셨습니다')
      ));
    }
    const date = new Date(msg.timestamp);
    const dateStr = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
    if (dateStr !== lastDateStr) {
      renderedMessages.push(/*#__PURE__*/React.createElement("div", {
        key: `divider-${msg.timestamp}-${idx}`,
        style: {
          position: 'relative',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          margin: '24px 0 16px'
        }
      },
        /* Line */
        /*#__PURE__*/React.createElement("div", {
          style: {
            position: 'absolute',
            left: 0,
            right: 0,
            height: '1px',
            backgroundColor: 'var(--border-subtle)',
            zIndex: 1
          }
        }),
        /* Date Badge */
        /*#__PURE__*/React.createElement("span", {
          style: {
            position: 'relative',
            zIndex: 2,
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '12px',
            padding: '3px 12px',
            fontSize: '0.72rem',
            color: '#64748B',
            fontWeight: 'bold'
          }
        }, formatChatDividerDate(msg.timestamp))
      ));
      lastDateStr = dateStr;
    }
    const p = participantsMap[msg.participantId];
    const isMe = msg.participantId === chatParticipantId;
    const timeStr = formatChatTime(msg.timestamp);
    const msgHasImages = !!(msg.imageUrl || (Array.isArray(msg.imageUrls) && msg.imageUrls.length > 0));
    const msgDirectMediaInfo = getDirectChatMediaInfo(extractFirstUrl(msg.text || ''));
    const isEmbedMessage = msgDirectMediaInfo?.type === 'embed';
    // Wide enough that the embed's own .chat-media-resizable wrapper (see DirectChatMediaText)
    // has real headroom to drag-resize into on desktop, instead of immediately overflowing
    // this bubble's box the moment the user grows it past the old 820px ceiling.
    const chatBubbleMaxWidth = isEmbedMessage ? 'calc(100% - 60px)' : '65%';
    const chatMediaStyle = isEmbedMessage
      ? { maxWidth: '760px', embedMaxWidth: '760px', portraitEmbedMaxWidth: '360px', maxHeight: '72vh', marginBottom: msg.text ? '10px' : '0' }
      : { maxWidth: '420px', maxHeight: '62vh', marginBottom: msg.text ? '10px' : '0' };
    const isEmojiOnlyMessage = isEmojiOnlyChatText(msg.text) && !msgHasImages;
    const rowId = msg.id || `msg-${idx}`;
    const isSearchMatch = searchQuery && msg.text && msg.text.toLowerCase().includes(searchQuery.toLowerCase());
    const isSearchFocused = isSearchMatch && rowId === focusedMsgId;
    renderedMessages.push(/*#__PURE__*/React.createElement("div", {
      key: rowId,
      className: `msg-row-hover ${revealedMsgId === rowId ? 'msg-actions-revealed' : ''}`,
      'data-msg-row-id': rowId,
      style: {
        display: 'flex',
        alignItems: 'flex-start',
        gap: '8px',
        marginBottom: '12px',
        justifyContent: isMe ? 'flex-end' : 'flex-start'
      }
    }, !isMe && /*#__PURE__*/React.createElement("span", {
      style: {
        backgroundColor: p?.color || '#94A3B8',
        color: '#FFFFFF',
        padding: '3px 8px',
        borderRadius: 'var(--radius-full)',
        fontSize: '0.78rem',
        fontWeight: 'bold',
        flexShrink: 0,
        alignSelf: 'flex-start',
        marginTop: '2px'
      }
    }, p?.name || '알수없음'), isMe ? [/*#__PURE__*/React.createElement("div", {
      key: "meta",
      style: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        alignItems: 'flex-end',
        alignSelf: 'flex-end',
        gap: '4px',
        marginRight: '6px',
        flexShrink: 0,
        minWidth: '32px',
        padding: '2px 0'
      }
    },
      /* Top: Delete button */
      /*#__PURE__*/React.createElement("button", {
        type: "button",
        className: "msg-actions-group",
        onClick: () => onDeleteMessage && onDeleteMessage(msg),
        title: "삭제",
        style: {
          width: '24px',
          height: '24px',
          border: 'none',
          background: 'none',
          padding: 0,
          cursor: 'pointer',
          color: '#94A3B8',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end'
        }
      }, /*#__PURE__*/React.createElement("svg", {
        xmlns: "http://www.w3.org/2000/svg",
        width: "13",
        height: "13",
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "2",
        strokeLinecap: "round",
        strokeLinejoin: "round"
      }, /*#__PURE__*/React.createElement("path", { stroke: "none", d: "M0 0h24v24H0z", fill: "none" }), /*#__PURE__*/React.createElement("path", { d: "M18 6l-12 12" }), /*#__PURE__*/React.createElement("path", { d: "M6 6l12 12" }))),
      /* Bottom: Edit button + Timestamp */
      /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: '4px'
        }
      },
        /* Edit button */
        /*#__PURE__*/React.createElement("button", {
          type: "button",
          className: "msg-actions-group",
          onClick: () => onEditMessage && onEditMessage(msg),
          title: "편집",
          style: {
            width: '24px',
            height: '24px',
            border: '1px solid var(--border-subtle)',
            backgroundColor: 'var(--bg-primary)',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            padding: 0,
            color: '#64748B'
          }
        }, /*#__PURE__*/React.createElement(PencilIcon, { size: 12 })),
        /* Timestamp */
        /*#__PURE__*/React.createElement("span", {
          style: {
            fontSize: '0.68rem',
            color: '#94A3B8',
            lineHeight: '1.25',
            textAlign: 'right'
          }
        }, timeStr)
      )
    ), /*#__PURE__*/React.createElement("div", {
      key: "bubble-wrapper",
      // minWidth:0 overrides the flex item's default min-width:auto, which otherwise refuses to
      // shrink the bubble below its content's natural size (the classic flexbox overflow trap) --
      // without it, an oversized child (e.g. an embed sized by an imprecise vw estimate) can force
      // this box wider than message-row actually has room for.
      style: { position: 'relative', maxWidth: chatBubbleMaxWidth, minWidth: 0, zIndex: 1, alignSelf: 'flex-end' }
    }, /*#__PURE__*/React.createElement("div", {
      key: isSearchFocused ? `bubble-focused-${rowId}` : undefined,
      className: isSearchFocused ? 'chat-search-focused-bubble' : (isSearchMatch ? 'chat-search-match-bubble' : ''),
      style: {
        position: 'relative',
        zIndex: 1,
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '12px',
        padding: isEmojiOnlyMessage ? '12px 16px' : '8px 12px',
        fontSize: isEmojiOnlyMessage ? '4rem' : '0.9rem',
        lineHeight: isEmojiOnlyMessage ? 1 : '1.4',
        color: 'var(--text-main)',
        wordBreak: 'keep-all',
        overflowWrap: 'break-word',
        whiteSpace: 'pre-wrap',
        boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
        // Hard guarantee that text/media content never visually escapes the bubble's rounded
        // border, regardless of any upstream sizing imprecision (e.g. an embed's vw-estimated
        // width overshooting on a narrow viewport) -- overflow:hidden is spec-basic and behaves
        // identically across Chrome/Whale/Safari/Firefox, unlike relying purely on width math.
        overflow: 'hidden'
      }
    }, renderChatMessageBody(msg, setActiveLightbox, chatMediaStyle, searchQuery, stickyVideoKey, onReleaseSticky)), /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        right: '-7px',
        top: '10px',
        width: 0,
        height: 0,
        borderTop: '7px solid transparent',
        borderBottom: '7px solid transparent',
        borderLeft: isSearchFocused
          ? '7px solid #7C3AED'
          : isSearchMatch
            ? '7px solid rgba(124,58,237,0.45)'
            : '7px solid var(--border-subtle)',
        zIndex: 2
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        right: '-5px',
        top: '11px',
        width: 0,
        height: 0,
        borderTop: '6px solid transparent',
        borderBottom: '6px solid transparent',
        borderLeft: isSearchFocused
          ? '6px solid rgba(124,58,237,0.06)'
          : isSearchMatch
            ? '6px solid rgba(124,58,237,0.03)'
            : '6px solid var(--bg-card)',
        zIndex: 3
      }
    }))] : [/*#__PURE__*/React.createElement("div", {
      key: "bubble-wrapper",
      style: { position: 'relative', maxWidth: chatBubbleMaxWidth, minWidth: 0, zIndex: 1 }
    }, /*#__PURE__*/React.createElement("div", {
      key: isSearchFocused ? `bubble-focused-${rowId}` : undefined,
      className: isSearchFocused ? 'chat-search-focused-bubble' : (isSearchMatch ? 'chat-search-match-bubble' : ''),
      style: {
        position: 'relative',
        zIndex: 1,
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '12px',
        padding: isEmojiOnlyMessage ? '12px 16px' : '8px 12px',
        fontSize: isEmojiOnlyMessage ? '4rem' : '0.9rem',
        lineHeight: isEmojiOnlyMessage ? 1 : '1.4',
        color: 'var(--text-main)',
        wordBreak: 'keep-all',
        overflowWrap: 'break-word',
        whiteSpace: 'pre-wrap',
        boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
        // Hard guarantee that text/media content never visually escapes the bubble's rounded
        // border, regardless of any upstream sizing imprecision (e.g. an embed's vw-estimated
        // width overshooting on a narrow viewport) -- overflow:hidden is spec-basic and behaves
        // identically across Chrome/Whale/Safari/Firefox, unlike relying purely on width math.
        overflow: 'hidden'
      }
    }, renderChatMessageBody(msg, setActiveLightbox, chatMediaStyle, searchQuery, stickyVideoKey, onReleaseSticky)), /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        left: '-7px',
        top: '10px',
        width: 0,
        height: 0,
        borderTop: '7px solid transparent',
        borderBottom: '7px solid transparent',
        borderRight: isSearchFocused
          ? '7px solid #7C3AED'
          : isSearchMatch
            ? '7px solid rgba(124,58,237,0.45)'
            : '7px solid var(--border-subtle)',
        zIndex: 2
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        left: '-5px',
        top: '11px',
        width: 0,
        height: 0,
        borderTop: '6px solid transparent',
        borderBottom: '6px solid transparent',
        borderRight: isSearchFocused
          ? '6px solid rgba(124,58,237,0.06)'
          : isSearchMatch
            ? '6px solid rgba(124,58,237,0.03)'
            : '6px solid var(--bg-card)',
        zIndex: 3
      }
    })), /*#__PURE__*/React.createElement("div", {
      key: "meta",
      style: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        alignItems: 'flex-start',
        alignSelf: 'stretch',
        marginLeft: '6px',
        flexShrink: 0,
        minWidth: '32px',
        padding: '2px 0'
      }
    },
      /* Timestamp only, no edit/delete for other participants */
      /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: '0.68rem',
          color: '#94A3B8',
          lineHeight: '1.25',
          textAlign: 'left'
        }
      }, timeStr))]));
  });
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "chat-room-container",
    style: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: `${viewportBottom}px`,
      backgroundColor: 'var(--bg-primary)',
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      maxWidth: '100%',
      overflowX: 'hidden',
      zIndex: 1005,
      transition: 'bottom 0.12s ease-out'
    }
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onBack,
    "aria-label": "뒤로가기",
    style: {
      position: 'fixed',
      top: '10px',
      left: '10px',
      width: '36px',
      height: '36px',
      borderRadius: '50%',
      backgroundColor: 'var(--bg-card)',
      border: 'none',
      boxShadow: isHeaderVisible ? 'none' : '0 2px 8px rgba(0,0,0,0.12)',
      transition: 'box-shadow 0.2s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      color: '#64748B',
      zIndex: 1020
    }
  }, /*#__PURE__*/React.createElement(BackArrowIcon, { size: 22 })),
  !(isHeaderVisible || viewportBottom > 80 || isInputFocused || !!(chatInput && String(chatInput).trim()) || (chatImages && chatImages.length > 0)) && /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "chat-keyboard-reopen-btn",
    onClick: () => {
      if (onRevealChatInput) onRevealChatInput();
      requestAnimationFrame(() => chatTextareaRef.current && chatTextareaRef.current.focus());
    },
    "aria-label": "채팅 입력창 열기",
    style: {
      position: 'fixed',
      left: '10px',
      bottom: `calc(${viewportBottom}px + 16px)`,
      width: '36px',
      height: '36px',
      borderRadius: '50%',
      backgroundColor: 'var(--bg-card)',
      border: '1px solid var(--border-subtle)',
      boxShadow: '0 2px 10px rgba(0,0,0,0.16)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      color: '#64748B',
      zIndex: 1020
    }
  }, /*#__PURE__*/React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    width: "20",
    height: "20",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", { stroke: "none", d: "M0 0h24v24H0z", fill: "none" }),
    /*#__PURE__*/React.createElement("path", { d: "M2 6a2 2 0 0 1 2 -2h16a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-16a2 2 0 0 1 -2 -2z" }),
    /*#__PURE__*/React.createElement("path", { d: "M6 8h.01" }),
    /*#__PURE__*/React.createElement("path", { d: "M10 8h.01" }),
    /*#__PURE__*/React.createElement("path", { d: "M14 8h.01" }),
    /*#__PURE__*/React.createElement("path", { d: "M18 8h.01" }),
    /*#__PURE__*/React.createElement("path", { d: "M8 12h.01" }),
    /*#__PURE__*/React.createElement("path", { d: "M12 12h.01" }),
    /*#__PURE__*/React.createElement("path", { d: "M16 12h.01" }),
    /*#__PURE__*/React.createElement("path", { d: "M7 16h10" }))), noticePanelMode === 'floating' && /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setNoticePanelMode(pinnedNotices.length > 0 ? 'list' : 'add'),
    title: "공지",
    "aria-label": "공지 펼치기",
    style: {
      position: 'fixed',
      top: '10px',
      right: '16px',
      width: '36px',
      height: '36px',
      borderRadius: '50%',
      backgroundColor: 'var(--bg-card)',
      border: 'none',
      boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      color: '#64748B',
      zIndex: 1000
    }
  }, /*#__PURE__*/React.createElement(MegaphoneIcon, { size: 18 })), /*#__PURE__*/React.createElement("div", {
    className: "chat-room-header",
    style: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      height: '56px',
      backgroundColor: 'var(--bg-card)',
      borderBottom: '1px solid var(--border-subtle)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 16px',
      zIndex: 1010,
      transition: 'transform 0.3s ease',
      transform: isHeaderVisible ? 'translateY(0)' : 'translateY(-100%)'
    }
  }, /*#__PURE__*/React.createElement("div", { style: { width: '32px', flexShrink: 0 } }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: '50%',
      transform: 'translateX(-50%)',
      display: 'flex',
      alignItems: 'center',
      fontWeight: 800,
      fontSize: '0.95rem',
      color: 'var(--text-main)',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      maxWidth: 'calc(100vw - 160px)',
      pointerEvents: 'none'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: { overflow: 'hidden', textOverflow: 'ellipsis' }
  }, formatChatHeaderTitle(calendar?.title), " 채팅")), /*#__PURE__*/React.createElement("div", {
    style: { display: 'flex', alignItems: 'center', gap: '2px' }
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setIsChatSideMenuOpen(true),
    title: "채팅 메뉴",
    "aria-label": "채팅 메뉴 열기",
    style: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      padding: '6px',
      color: 'var(--text-muted)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '8px'
    }
  }, /*#__PURE__*/React.createElement(ThreeLinesIcon, { size: 22 })))), /*#__PURE__*/React.createElement("div", {
    style: { flex: 1, position: 'relative', minHeight: 0 }
  }, /*#__PURE__*/React.createElement("div", {
    ref: chatMessagesContainerRef,
    onScroll: handleScrollCombined,
    style: {
      position: 'absolute',
      inset: 0,
      overflowY: 'auto',
      padding: '16px',
      paddingTop: isSearchOpen ? '124px' : '72px',
      paddingBottom: '152px'
    }
  }, (loadingOlderChat || hasMoreOlderChat) && /*#__PURE__*/React.createElement("div", {
    style: { textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', padding: '8px 0 12px' }
  }, loadingOlderChat ? '이전 대화를 불러오는 중…' : (hasMoreOlderChat ? '위로 스크롤하면 이전 대화가 로드됩니다' : '')), noticePanelMode === 'add' && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'sticky', top: 0, zIndex: 6,
      display: 'flex', flexDirection: 'column', gap: '8px',
      backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '8px',
      padding: '10px 12px', marginBottom: '12px', boxShadow: 'var(--shadow-md)'
    }
  },
    /*#__PURE__*/React.createElement("textarea", {
      className: "form-input",
      style: { width: '100%', resize: 'none', minHeight: '60px' },
      value: noticeInput,
      maxLength: 200,
      autoFocus: true,
      placeholder: "채팅방 상단에 고정할 공지를 입력하세요",
      onChange: e => { setNoticeInput(e.target.value); autoGrowTextarea(e.target, 200); }
    }),
    /*#__PURE__*/React.createElement("div", { style: { display: 'flex', gap: '8px' } },
      /*#__PURE__*/React.createElement("button", {
        type: "button", className: "btn btn-secondary", style: { flex: 1 },
        onClick: () => setNoticePanelMode(pinnedNotices.length > 0 ? 'list' : 'closed')
      }, "취소"),
      /*#__PURE__*/React.createElement("button", {
        type: "button", className: "btn btn-secondary",
        style: { flex: 1, height: '44px', minHeight: '44px', backgroundColor: '#0F172A', borderColor: '#0F172A', color: '#FFFFFF', justifyContent: 'center' },
        onClick: () => {
          const trimmed = noticeInput.trim();
          if (!trimmed) { if (showToast) showToast('공지 내용을 입력해 주세요', 'error'); return; }
          onAddPinnedNotice && onAddPinnedNotice(trimmed, (participantsMap[chatParticipantId] || {}).name || '');
          setNoticeInput('');
          setNoticePanelMode('list');
        }
      }, "저장")
    )
  ), noticePanelMode === 'list' && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'sticky', top: 0, zIndex: 6,
      display: 'flex', flexDirection: 'column', gap: '8px',
      backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '8px',
      padding: '10px 12px', marginBottom: '12px', boxShadow: 'var(--shadow-md)'
    }
  },
    pinnedNotices.length === 0 ? /*#__PURE__*/React.createElement("div", {
      style: { fontSize: '0.82rem', color: 'var(--text-muted)', textAlign: 'center', padding: '6px 0' }
    }, "등록된 공지가 없습니다.") : pinnedNotices.map(notice => /*#__PURE__*/React.createElement("div", {
      key: notice.id,
      style: {
        display: 'flex', alignItems: 'flex-start', gap: '8px',
        backgroundColor: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: '8px',
        padding: '10px 12px', fontSize: '0.82rem', color: '#92400E', lineHeight: '1.5'
      }
    },
      /*#__PURE__*/React.createElement("div", { style: { flex: 1, wordBreak: 'break-word' } }, renderTextWithUrlBadge(notice.text)),
      /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: () => onRemovePinnedNotice && onRemovePinnedNotice(notice.id),
        title: "공지 삭제",
        style: { background: 'none', border: 'none', cursor: 'pointer', color: '#92400E', flexShrink: 0, display: 'flex', alignItems: 'center' }
      }, /*#__PURE__*/React.createElement(SmallXIcon, { size: 16 }))
    )),
    /*#__PURE__*/React.createElement("div", { style: { display: 'flex', gap: '8px' } },
      /*#__PURE__*/React.createElement("button", {
        type: "button",
        style: { flex: 1, border: '1px solid #0F172A', borderRadius: '10px', padding: '10px', fontWeight: 800, cursor: 'pointer', backgroundColor: '#0F172A', color: '#FFFFFF' },
        onClick: () => { setNoticeInput(''); setNoticePanelMode('add'); }
      }, "공지 추가"),
      /*#__PURE__*/React.createElement("button", {
        type: "button", className: "btn btn-secondary", style: { flex: 1 },
        onClick: () => setNoticePanelMode('floating')
      }, "공지 접기")
    )
  ), noticePanelMode === 'closed' && pinnedNotices.length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'sticky', top: 0, zIndex: 5,
      display: 'flex', flexDirection: 'column', gap: '6px',
      marginBottom: '12px'
    }
  }, pinnedNotices.map(notice => /*#__PURE__*/React.createElement("div", {
    key: notice.id,
    style: {
      display: 'flex', alignItems: 'flex-start', gap: '8px',
      backgroundColor: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: '8px',
      padding: '10px 12px', fontSize: '0.82rem', color: '#92400E', lineHeight: '1.5'
    }
  },
    /*#__PURE__*/React.createElement("div", { style: { flex: 1, wordBreak: 'break-word' } },
      /*#__PURE__*/React.createElement("strong", null, "공지 "), renderTextWithUrlBadge(notice.text)
    )
  ))), renderedMessages.length === 0 ? /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      color: '#94A3B8',
      fontSize: '0.85rem',
      marginTop: '40px'
    }
  }, "\uC544\uC9C1 \uB4F1\uB85D\uB41C \uB300\uD654\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4.") : renderedMessages), showScrollToBottom && !hasNewMessageBelow && /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: scrollToBottom,
    "aria-label": "\uCD5C\uADFC \uB300\uD654\uB85C \uC774\uB3D9",
    style: {
      position: 'absolute',
      bottom: '16px',
      right: '16px',
      width: '36px',
      height: '36px',
      borderRadius: '50%',
      backgroundColor: 'var(--bg-card)',
      border: 'none',
      boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      color: '#64748B',
      zIndex: 50
    }
  }, /*#__PURE__*/React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    width: "22",
    height: "22",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    "stroke-width": "2",
    "stroke-linecap": "round",
    "stroke-linejoin": "round"
  }, /*#__PURE__*/React.createElement("path", { stroke: "none", d: "M0 0h24v24H0z", fill: "none" }), /*#__PURE__*/React.createElement("path", { d: "M6 9l6 6l6 -6" }))), hasNewMessageBelow && /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: handleNewMessageBannerClick,
    "aria-label": "\uC0C8\uB85C\uC6B4 \uBA54\uC2DC\uC9C0\uB85C \uC774\uB3D9",
    style: {
      position: 'absolute',
      bottom: '16px',
      left: '50%',
      transform: 'translateX(-50%)',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      padding: '8px 16px',
      borderRadius: 'var(--radius-full)',
      backgroundColor: '#4F46E5',
      color: '#FFFFFF',
      border: 'none',
      boxShadow: '0 4px 12px rgba(79,70,229,0.35)',
      cursor: 'pointer',
      fontSize: '0.82rem',
      fontWeight: 700,
      whiteSpace: 'nowrap',
      zIndex: 51
    }
  }, "\uC0C8\uB85C\uC6B4 \uBA54\uC2DC\uC9C0", /*#__PURE__*/React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    width: "16",
    height: "16",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    "stroke-width": "2.5",
    "stroke-linecap": "round",
    "stroke-linejoin": "round"
  }, /*#__PURE__*/React.createElement("path", { d: "M6 9l6 6l6 -6" })))), /*#__PURE__*/React.createElement("div", {
    className: "chat-composer",
    style: {
      position: 'fixed',
      left: 0,
      right: 0,
      bottom: `${viewportBottom}px`,
      backgroundColor: 'var(--bg-card)',
      borderTop: '1px solid var(--border-subtle)',
      padding: '12px 16px',
      zIndex: 1012,
      flexShrink: 0,
      transform: (isHeaderVisible || viewportBottom > 80 || isInputFocused || !!(chatInput && String(chatInput).trim()) || (chatImages && chatImages.length > 0)) ? 'translateY(0)' : 'translateY(calc(100% + 12px))',
      opacity: (isHeaderVisible || viewportBottom > 80 || isInputFocused || !!(chatInput && String(chatInput).trim()) || (chatImages && chatImages.length > 0)) ? 1 : 0,
      pointerEvents: (isHeaderVisible || viewportBottom > 80 || isInputFocused || !!(chatInput && String(chatInput).trim()) || (chatImages && chatImages.length > 0)) ? 'auto' : 'none',
      transition: 'transform 0.28s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.18s ease, bottom 0.12s ease-out'
    }
  },
    /* Inner card wrapper (same border/radius as CommentsSection input card) */
    /*#__PURE__*/React.createElement("div", {
      style: {
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '12px',
        padding: '12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        boxSizing: 'border-box',
        width: '100%'
      }
    },
      /* Textarea at top */
      /*#__PURE__*/React.createElement("textarea", {
        ref: chatTextareaRef,
        placeholder: "메시지를 입력하세요...",
        value: chatInput,
        maxLength: 5000,
        onFocus: () => setIsInputFocused(true),
        onBlur: () => {
          setTimeout(() => {
            const a = document.activeElement;
            if (a && a.closest && a.closest('.chat-composer')) {
              setIsInputFocused(true);
              return;
            }
            if ((chatInput && String(chatInput).trim()) || (chatImages && chatImages.length > 0)) {
              setIsInputFocused(true);
              return;
            }
            setIsInputFocused(false);
          }, 50);
        },
        onChange: e => { setChatInput(e.target.value); autoGrowTextarea(e.target, 100); },
        onPaste: handlePasteImagesChat,
        onKeyDown: e => {
          if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            triggerChatSend();
          }
        },
        style: {
          width: '100%',
          height: '44px',
          minHeight: '44px',
          maxHeight: '100px',
          resize: 'none',
          border: 'none',
          background: 'none',
          padding: '2px 4px',
          fontSize: '0.85rem',
          lineHeight: '1.4',
          fontFamily: 'inherit',
          outline: 'none',
          boxSizing: 'border-box',
          overflowY: 'auto'
        }
      }),

      /* Attached Images Preview (between Textarea and Action Row) */
      chatImages.length > 0 ? /*#__PURE__*/React.createElement("div", {
        style: { display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '4px', alignSelf: 'flex-start' }
      }, chatImages.map((img, index) => /*#__PURE__*/React.createElement("div", {
        key: index,
        style: { position: 'relative', display: 'inline-block' }
      }, /*#__PURE__*/React.createElement("img", {
        src: img.thumbnail,
        alt: `첨부 미리보기 ${index + 1}`,
        style: {
          width: '60px',
          height: '60px',
          objectFit: 'cover',
          borderRadius: '8px',
          display: 'block'
        }
      }), /*#__PURE__*/React.createElement(ImageThumbRemoveButton, {
        onClick: () => setChatImages(prev => prev.filter((_, idx) => idx !== index))
      })))) : null,

      /* Hidden File Input */
      /*#__PURE__*/React.createElement("input", {
        ref: fileInputRefChat,
        type: "file",
        accept: "image/*",
        multiple: true,
        style: { position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0,0,0,0)', border: 0 },
        onChange: handleFileChangeChat
      }),

      /* Action Row (Select box, Camera, Send) at bottom */
      /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          borderTop: '1px solid var(--border-subtle)',
          paddingTop: '8px',
          marginTop: '2px'
        }
      },
        /* Left side: Participant select capsule button */
        /*#__PURE__*/React.createElement("button", {
          type: "button",
          onClick: () => setIsChatSheetOpen(true),
          style: {
            backgroundColor: selectedParticipant?.color || '#94A3B8',
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
            flexShrink: 0
          }
        }, selectedParticipant?.name || '선택', /*#__PURE__*/React.createElement("span", {
          style: { fontSize: '0.6rem' }
        }, "▼")),

        /* Right side: Camera button & Send button */
        /*#__PURE__*/React.createElement("div", {
          style: { display: 'flex', alignItems: 'center', gap: '8px' }
        },
          /* Emoji Button */
          /*#__PURE__*/React.createElement("button", {
            type: "button",
            onClick: () => setIsEmojiPickerOpen(true),
            title: "이모티콘",
            style: {
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              border: '1px solid var(--border-subtle)',
              backgroundColor: 'var(--bg-card)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              padding: 0,
              color: '#64748B'
            }
          }, /*#__PURE__*/React.createElement(EmojiPickerIcon, null)),
          /* Camera/Image Button */
          /*#__PURE__*/React.createElement("button", {
            type: "button",
            onClick: () => fileInputRefChat.current && fileInputRefChat.current.click(),
            title: "사진 첨부",
            style: {
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              border: '1px solid var(--border-subtle)',
              backgroundColor: 'var(--bg-card)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              padding: 0,
              color: '#64748B'
            }
          }, /*#__PURE__*/React.createElement("svg", {
            xmlns: "http://www.w3.org/2000/svg",
            width: "18",
            height: "18",
            viewBox: "0 0 24 24",
            fill: "none",
            stroke: "currentColor",
            strokeWidth: "2",
            strokeLinecap: "round",
            strokeLinejoin: "round"
          },
            /*#__PURE__*/React.createElement("path", { stroke: "none", d: "M0 0h24v24H0z", fill: "none" }),
            /*#__PURE__*/React.createElement("path", { d: "M15 8h.01" }),
            /*#__PURE__*/React.createElement("path", { d: "M12.5 21h-6.5a3 3 0 0 1 -3 -3v-12a3 3 0 0 1 3 -3h12a3 3 0 0 1 3 3v6.5" }),
            /*#__PURE__*/React.createElement("path", { d: "M3 16l5 -5c.928 -.893 2.072 -.893 3 0l4 4" }),
            /*#__PURE__*/React.createElement("path", { d: "M14 14l1 -1c.67 -.644 1.45 -.824 2.182 -.54" }),
            /*#__PURE__*/React.createElement("path", { d: "M16 19h6" }),
            /*#__PURE__*/React.createElement("path", { d: "M19 16v6" })
          )),

          /* Send Button */
          /*#__PURE__*/React.createElement("button", {
            type: "button",
            disabled: isChatSubmitting || (!chatInput.trim() && chatImages.length === 0),
            onPointerDown: handleSendPointerDown,
            onClick: handleSendClick,
            style: {
              height: '32px',
              padding: '0 16px',
              fontSize: '0.82rem',
              fontWeight: 'bold',
              backgroundColor: '#57606F',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '16px',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              opacity: (chatInput.trim() || chatImages.length > 0) && !isChatSubmitting ? 1 : 0.6
            }
          }, isChatSubmitting ? '...' : '전송')
        )
      )
    )),
  activeLightbox ? /*#__PURE__*/React.createElement(Lightbox, {
    urls: activeLightbox.urls,
    index: activeLightbox.index,
    meta: activeLightbox.meta,
    onClose: () => setActiveLightbox(null),
    onNavigate: i => setActiveLightbox(prev => prev ? { ...prev, index: i } : prev),
    showToast,
    onPromoteImageUrl,
    onSaveImageTags,
    onSearchTag
  }) : null), imageProcessingChat && /*#__PURE__*/React.createElement(ImageProcessingOverlay, imageProcessingChat),
  isEmojiPickerOpen && /*#__PURE__*/React.createElement(EmojiPickerSheet, {
    onSelect: insertEmojiIntoChatInput,
    onClose: () => setIsEmojiPickerOpen(false)
  }),
  isChatSideMenuOpen && /*#__PURE__*/React.createElement(ChatSideMenu, {
    onClose: () => setIsChatSideMenuOpen(false),
    onOpenSearch: () => { setIsSearchOpen(true); setSearchQuery(''); },
    onOpenNoticeSettings: () => {
      if (pinnedNotices.length > 0) { setNoticePanelMode('list'); } else { setNoticeInput(''); setNoticePanelMode('add'); }
    },
    onOpenGallery: () => setIsChatGalleryOpen(true),
    onOpenShare: onShare,
    isDarkTheme: isDarkTheme,
    onChangeView: onChangeView,
    onToggleTheme: onToggleTheme,
    fontScalePercent: fontScalePercent,
    onDecreaseFont: onDecreaseFont,
    onIncreaseFont: onIncreaseFont,
    isChatNotifyEnabled: isChatNotifyEnabled,
    onToggleChatNotifications: onToggleChatNotifications
  }),
  isChatGalleryOpen && /*#__PURE__*/React.createElement(ChatGalleryModal, {
    chatMessages: chatMessages,
    onClose: () => setIsChatGalleryOpen(false),
    setActiveLightbox: setActiveLightbox,
    hasMoreOlderChat: hasMoreOlderChat,
    loadingOlderChat: loadingOlderChat,
    onLoadOlderChat: onLoadOlderChat,
    totalGalleryCount: 0
  }),
  isSearchOpen && /*#__PURE__*/React.createElement(InlineSearchBar, {
    fixed: true,
    value: searchQuery,
    placeholder: "검색할 메시지를 입력하세요...",
    onChange: e => { setSearchQuery(e.target.value); setSearchFocusIndex(Number.MAX_SAFE_INTEGER); },
    trailing: /*#__PURE__*/React.createElement(React.Fragment, null,
      searchQuery && /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: '0.76rem', color: 'var(--text-muted)', flexShrink: 0,
          minWidth: '36px', textAlign: 'center', fontVariantNumeric: 'tabular-nums'
        }
      }, searchMatchIds.length > 0 ? `${clampedFocusIdx + 1}/${searchMatchIds.length}` : '0/0'),
      /*#__PURE__*/React.createElement("button", {
        type: "button", disabled: searchMatchIds.length === 0,
        onClick: () => setSearchFocusIndex(i => {
          const currentIdx = i >= searchMatchIds.length ? searchMatchIds.length - 1 : i;
          const next = currentIdx - 1;
          return next < 0 ? searchMatchIds.length - 1 : next;
        }),
        title: "이전 결과",
        style: {
          border: 'none', background: 'none',
          cursor: searchMatchIds.length > 0 ? 'pointer' : 'default',
          color: searchMatchIds.length > 0 ? 'var(--text-main)' : 'var(--text-muted)',
          padding: '4px', display: 'flex', alignItems: 'center', flexShrink: 0,
          opacity: searchMatchIds.length > 0 ? 1 : 0.4
        }
      }, /*#__PURE__*/React.createElement("svg", {
        xmlns: "http://www.w3.org/2000/svg", width: "18", height: "18",
        viewBox: "0 0 24 24", fill: "none", stroke: "currentColor",
        strokeWidth: "2.5", strokeLinecap: "round", strokeLinejoin: "round"
      }, /*#__PURE__*/React.createElement("path", { d: "m18 15-6-6-6 6" }))),
      /*#__PURE__*/React.createElement("button", {
        type: "button", disabled: searchMatchIds.length === 0,
        onClick: () => setSearchFocusIndex(i => {
          const currentIdx = i >= searchMatchIds.length ? searchMatchIds.length - 1 : i;
          const next = currentIdx + 1;
          return next >= searchMatchIds.length ? 0 : next;
        }),
        title: "다음 결과",
        style: {
          border: 'none', background: 'none',
          cursor: searchMatchIds.length > 0 ? 'pointer' : 'default',
          color: searchMatchIds.length > 0 ? 'var(--text-main)' : 'var(--text-muted)',
          padding: '4px', display: 'flex', alignItems: 'center', flexShrink: 0,
          opacity: searchMatchIds.length > 0 ? 1 : 0.4
        }
      }, /*#__PURE__*/React.createElement("svg", {
        xmlns: "http://www.w3.org/2000/svg", width: "18", height: "18",
        viewBox: "0 0 24 24", fill: "none", stroke: "currentColor",
        strokeWidth: "2.5", strokeLinecap: "round", strokeLinejoin: "round"
      }, /*#__PURE__*/React.createElement("path", { d: "m6 9 6 6 6-6" }))),
      /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: () => { setIsSearchOpen(false); setSearchQuery(''); setSearchFocusIndex(0); },
        style: {
          border: 'none', background: 'none', cursor: 'pointer',
          color: 'var(--text-muted)', padding: '4px 6px', fontSize: '0.8rem',
          fontWeight: 700, flexShrink: 0
        }
      }, "닫기")
    )
  }));
}

  window.GATHER_UI_COMPONENTS = Object.assign({}, window.GATHER_UI_COMPONENTS || {}, {
    ChatRoomView: ChatRoomView
  });
})();
