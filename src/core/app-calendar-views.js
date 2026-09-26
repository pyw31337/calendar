// U14 (docs/app-main-split-units.md): CalendarApp's view JSX, moved out verbatim. This is what
// CalendarApp renders when the V2 shell does not take over (?shell=v1, the one-release V1
// fallback): the chat / settlement / memo / gallery / places / history / content screens and the
// main calendar screen (header, side menu, confirmed-meeting cards, grid, polls, previews).
//
// A plain render function, not a component: CalendarApp calls it at the spot where this JSX used
// to be and returns its result, so React sees exactly the same element tree as before (no extra
// component layer, no remounts). It holds no hooks. Every CalendarApp value and UI component it
// reads is passed in; the UI components are the module-level aliases app-main.js binds from
// GATHER_UI_COMPONENTS.
import { MEMOS_PAGE_SIZE, calculateSettlementBalance, extractFirstUrl, formatBalanceBadge, formatConfirmedMeetingLabel, formatDDayLabel, getActiveAvailabilities, getActiveParticipants, normalizePlaceDateForSort, removeFirstUrl } from './app-domain-helpers.js';
import { buildMainCalendarScreenState } from './app-calendar-screen-state.js';
import { fetchAnniversariesRest } from './app-firebase-data.js';
import { renderTextWithUrlBadge } from './app-chat-render.js';

export function renderCalendarViews({
  React, activeCalId, showToast, showConfirmDialog, showAlert, currentMonthDate, setSelectedDate,
  setIsModalOpen, setIsAdminOpen, setAdminInitialTab, setIsGlobalSearchOpen,
  setGlobalSearchInitialQuery, toggleTheme, isDarkTheme, fontScalePercent, setFontScalePercent,
  isShareOpen, setIsShareOpen, setIsChatShareOpen, isPlacesShareOpen, setIsPlacesShareOpen,
  isMemoShareOpen, setIsMemoShareOpen, isGalleryShareOpen, setIsGalleryShareOpen,
  isHistoryShareOpen, setIsHistoryShareOpen, isMainSideMenuOpen, setIsMainSideMenuOpen,
  confirmedMeetingAnimationTimersRef, setIsAppSettingsOpen, expandedConfirmedDates,
  setExpandedConfirmedDates, setIsCreateSettlementOpen, setEditingSettlementCard, isGuideOpen,
  setIsGuideOpen, isAnniversariesOpen, setIsAnniversariesOpen, anniversaryEditId,
  setAnniversaryEditId, withEventUi, anniversaryInitialDate, setAnniversaryInitialDate,
  isInitialDataLoading, chatPreviewHydrationExhausted, totalMemoCount, totalGalleryCount,
  galleryPreviewMessages, sharedMemo, setSharedMemo, anniversaries, setAnniversaries,
  customCultureItems, memePool, meetingsHydrated, chatInput, setChatInput, chatParticipantId,
  setChatParticipantId, mainNotifPermission, mainChatNotifyEnabled, isNotificationHelpOpen,
  setIsNotificationHelpOpen, handleMainToggleNotifications, isChatSheetOpen, setIsChatSheetOpen,
  isChatSubmitting, chatTextareaRef, chatImages, setChatImages, chatFileAttachments,
  setChatFileAttachments, chatReplyTarget, setChatReplyTarget, setActiveLightbox, isGalleryOpen,
  setIsGalleryOpen, placesInitialQuery, setPlacesInitialQuery, placesInitialFocusId,
  setPlacesInitialFocusId, memoInitialTag, setMemoInitialTag, previewSharingMemo,
  setPreviewSharingMemo, handleSearchTag, handleParticipantClick, activeView, isMainHeaderVisible,
  mainHeaderHeight, mainHeaderRef, calendarSectionRef, pollsSectionRef, pollsExpandSignal,
  setPollsExpandSignal, scrollToSection, photoCommentCounts, galleryPhotoIndex, chatMessages,
  loadingOlderChat, hasMoreOlderChat, allChatMessages, loadOlderChatMessages,
  chatMessagesContainerRef, memos, hasMoreMemos, setMemosLimit, galleryChatMessages, galleryMemos,
  displayChatMessages, fullChatMessages, stickyVideo, handleActivateChatVideo, externalFocusMsgId,
  changeView, setCurrentMonthAndSync, activeCal, visibleChatMessages, recentMessages,
  visibleTotalChatCount, canUseSettlement, syncStatus, handleAnniversarySaved,
  handleAnniversaryDeleted, anniversariesWithPosters, handleRegisterCultureEvent,
  handleUnregisterCultureEvent, handleQuickSaveCultureMemo, handleAddPersonTag,
  handleRenamePersonTag, handleDeletePersonTag, handleRemovePhotoFromTravelMemory,
  handleRemovePhotosFromTravelMemory, handleHideMemoryGroup, handleRestoreMemoryGroup,
  handleAddPhotosBackToTravelMemory, handleSaveCustomCultureItem, handleFetchMeetingPhotoIndex,
  historyMemosSnapshot, patchLocalMemo, upsertLocalMemo, removeLocalMemo,
  handleTogglePinFromMemoPreview, handleMemoCommentsChangeFromMemoPreview, isHeaderVisible,
  setIsHeaderVisible, toggleChatInputPin, handleChatScroll, handleSendChatMessage,
  handleSendMemeImage, handleUploadGalleryImages, handleAddGalleryLink, handleAddGalleryFiles,
  handleDeleteGalleryFiles, handleDeleteGalleryLinks, handlePasteGatherPhoto,
  handlePasteGatherPhotos, handleDeleteMessage, handleEditMessage, handlePromoteInlineChatImage,
  handleSaveImageTags, guardLoadedCalendar, handleMoveAvailability, handleBulkRegisterAvailability,
  handleFetchPhotoComments, handleDeletePhoto, handleReplacePhoto, handleSavePhotoComments,
  handleJumpToChatMessage, handleGetChatMessageOrdinal, handleGetGalleryPhotoOrdinal,
  handleJumpToMemo, handleJumpToMemoTag, handleJumpToGallery, handleJumpToPlace,
  handleJumpToMeetingDate, handleSavePlace, handleDeletePlace, handleOpenPollCreate,
  handleOpenPollEdit, handleSaveSettlementCard, handleDeleteSettlementCard,
  handleToggleSettlementCardStatus, handleOpenVoteSheet, handleCancelVote,
  handleUpdateWeatherLocation, handleDeleteRecentWeatherLocation, handleAddPinnedNotice,
  handleRemovePinnedNotice, withStickyVideo, localGalleryCount, navHistoryCount, navChatLastAuthor,
  navSettlementLastDate, navGalleryLastDate, navPlaceLastName, navMemoLastTitleWord, navMenuProps,
  sharedAppOverlays, AdminFilledMenuIcon, AnniversaryModal, CalendarGrid, CapsuleTextBadge,
  ChatGalleryModal, ChatRoomView, CommentsSection, ContentView, Footer, HistoryView, MainSideMenu,
  MemoPreviewSection, MemoShareModal, MemoView, MenuIcon, NotepadTextIcon,
  NotificationPermissionHelpModal, PhotoGallery, PlacesSection, PlacesView, PollList,
  SettlementSummaryModal, ShareModal, SummaryList, UserManualOverlay, WalletIcon
}) {
  if (activeView === 'chat') {
    return withStickyVideo(/*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", { className: "chat-view-container" }, /*#__PURE__*/React.createElement(ChatRoomView, {
      calendar: activeCal,
      memePool: memePool,
      onSendMemeImage: handleSendMemeImage,
      chatMessages: displayChatMessages,
      loadingOlderChat: loadingOlderChat,
      hasMoreOlderChat: hasMoreOlderChat,
      onLoadOlderChat: loadOlderChatMessages,
      chatInput: chatInput,
      setChatInput: setChatInput,
      chatParticipantId: chatParticipantId,
      setChatParticipantId: setChatParticipantId,
      isChatSheetOpen: isChatSheetOpen,
      setIsChatSheetOpen: setIsChatSheetOpen,
      isChatSubmitting: isChatSubmitting,
      chatTextareaRef: chatTextareaRef,
      chatImage: chatImages,
      setChatImage: setChatImages,
      chatFileAttachments: chatFileAttachments,
      setChatFileAttachments: setChatFileAttachments,
      chatReplyTarget: chatReplyTarget,
      setChatReplyTarget: setChatReplyTarget,
      activeLightbox: null, // render via withStickyVideo shared Lightbox host
      setActiveLightbox: setActiveLightbox,
      onSend: handleSendChatMessage,
      onDeleteMessage: handleDeleteMessage,
      onEditMessage: handleEditMessage,
      onAddPinnedNotice: handleAddPinnedNotice,
      onRemovePinnedNotice: handleRemovePinnedNotice,
      onBack: () => changeView('calendar'),
      isHeaderVisible: isHeaderVisible,
      handleChatScroll: handleChatScroll,
      onRevealChatInput: () => setIsHeaderVisible(true),
      onToggleChatInputPin: toggleChatInputPin,
      chatMessagesContainerRef: chatMessagesContainerRef,
      showToast: showToast,
      onPromoteImageUrl: handlePromoteInlineChatImage,
      onSaveImageTags: handleSaveImageTags,
      onSearchTag: handleSearchTag,
      onShare: () => setIsChatShareOpen(true),
      isDarkTheme: isDarkTheme,
      onToggleTheme: toggleTheme,
      onOpenGallery: () => changeView('gallery'),
      onChangeView: changeView,
      fontScalePercent: fontScalePercent,
      onDecreaseFont: () => setFontScalePercent(prev => Math.max(80, prev - 10)),
      onIncreaseFont: () => setFontScalePercent(prev => Math.min(130, prev + 10)),
      isChatNotifyEnabled: mainNotifPermission === 'granted' && mainChatNotifyEnabled,
      onToggleChatNotifications: handleMainToggleNotifications,
      onOpenAppSettings: () => setIsAppSettingsOpen(true),
      ...navMenuProps,
      stickyVideoKey: stickyVideo ? stickyVideo.key : null,
      onActivateVideo: handleActivateChatVideo,
      onDeletePhoto: handleDeletePhoto,
      onReplacePhoto: handleReplacePhoto,
      onJumpToChatMessage: handleJumpToChatMessage,
      onJumpToMemo: handleJumpToMemo,
      onJumpToMeetingDate: handleJumpToMeetingDate,
      onGetChatMessageOrdinal: handleGetChatMessageOrdinal,
      onGetGalleryPhotoOrdinal: handleGetGalleryPhotoOrdinal,
      onRequestConfirm: showConfirmDialog,
      syncStatus: syncStatus,
      externalFocusMessageId: externalFocusMsgId
    })), sharedAppOverlays));
  }

  if (activeView === 'settlement') {
    return withStickyVideo(/*#__PURE__*/React.createElement(React.Fragment, null,
      /*#__PURE__*/React.createElement(SettlementSummaryModal, {
        calendar: activeCal,
        onBack: () => changeView('calendar'),
        onSelectDate: d => {
          setSelectedDate(d);
          setIsModalOpen(true);
        },
        onOpenShare: () => {
          if (guardLoadedCalendar('Firebase 데이터를 불러온 뒤 공유 정보를 확인해 주세요.')) setIsShareOpen(true);
        },
        onOpenAppSettings: () => setIsAppSettingsOpen(true),
        onToggleSettlementCardStatus: handleToggleSettlementCardStatus,
        onDeleteSettlementCard: handleDeleteSettlementCard,
        onSaveSettlementCard: handleSaveSettlementCard,
        onOpenSettlementEditor: card => {
          setIsCreateSettlementOpen(false);
          setEditingSettlementCard(card ? { ...card } : null);
        },
        showToast: showToast,
        onRequestConfirm: showConfirmDialog,
        ...navMenuProps,
        onOpenCreateSettlement: undefined
      }),
      isShareOpen && activeCal && /*#__PURE__*/React.createElement(ShareModal, {
        calendar: activeCal,
        shareType: "settlement",
        showToast: showToast,
        onClose: () => setIsShareOpen(false)
      }),
      sharedAppOverlays
    ));
  }

  if (activeView === 'memo') {
    return withStickyVideo(/*#__PURE__*/React.createElement(React.Fragment, null,
      /*#__PURE__*/React.createElement(MemoView, {
        calendar: activeCal,
        memos: memos,
        hasMoreMemos: hasMoreMemos,
        totalMemoCount: totalMemoCount,
        onLoadMoreMemos: () => setMemosLimit(prev => prev + MEMOS_PAGE_SIZE),
        onBack: () => changeView('calendar'),
        showToast: showToast,
        isDarkTheme: isDarkTheme,
        onRequestConfirm: showConfirmDialog,
        sharedMemo: sharedMemo,
        chatMessages: chatMessages,
        setActiveLightbox: setActiveLightbox,
        onDismissSharedMemo: () => {
          setSharedMemo(null);
          const url = new URL(window.location.href);
          url.searchParams.delete('memo');
          window.history.replaceState({}, '', url);
        },
        onOpenShare: () => {
          if (guardLoadedCalendar('Firebase 데이터를 불러온 뒤 공유 정보를 확인해 주세요.')) setIsMemoShareOpen(true);
        },
        onOpenAppSettings: () => setIsAppSettingsOpen(true),
        onUpdateMemo: patchLocalMemo,
        onUpsertMemo: upsertLocalMemo,
        onDeleteMemo: removeLocalMemo,
        memoInitialTag: memoInitialTag,
        setMemoInitialTag: setMemoInitialTag,
        ...navMenuProps
      }),
      isMemoShareOpen && activeCal && /*#__PURE__*/React.createElement(ShareModal, {
        calendar: activeCal,
        shareType: "memo",
        showToast: showToast,
        onClose: () => setIsMemoShareOpen(false)
      }),
      sharedAppOverlays
    ));
  }

  if (activeView === 'gallery') {
    // Lightbox mounts once in withStickyVideo (shared across views).
    return withStickyVideo(/*#__PURE__*/React.createElement(React.Fragment, null,
      /*#__PURE__*/React.createElement(ChatGalleryModal, {
        calendar: activeCal,
        chatMessages: galleryChatMessages,
        memos: galleryMemos,
        asPage: true,
        onClose: () => changeView('calendar'),
        onUploadImages: handleUploadGalleryImages,
        onAddLink: handleAddGalleryLink,
        onAddFiles: handleAddGalleryFiles,
        onDeleteFiles: handleDeleteGalleryFiles,
        onDeleteGalleryLinks: handleDeleteGalleryLinks,
        onRequestConfirm: showConfirmDialog,
        onPasteGatherPhoto: handlePasteGatherPhoto,
        onPasteGatherPhotos: handlePasteGatherPhotos,
        onOpenShare: () => {
          if (guardLoadedCalendar('Firebase 데이터를 불러온 뒤 공유 정보를 확인해 주세요.')) setIsGalleryShareOpen(true);
        },
        setActiveLightbox: setActiveLightbox,
        onDeletePhoto: handleDeletePhoto,
        photoCommentCounts: photoCommentCounts,
        // Before the canonical index resolves, pass an explicit empty indexed set instead of
        // the partially hydrated chat/memo archive. Presenting that fallback as a final gallery
        // is what produced calendar-specific "4 photos" screens on transient index failures.
        indexedPhotos: galleryPhotoIndex.status === 'ready'
          ? galleryPhotoIndex.items
          : (galleryPhotoIndex.status === 'fallback' ? null : []),
        indexedPhotoStatus: galleryPhotoIndex.status,
        indexedPhotoTotal: galleryPhotoIndex.status === 'ready' ? galleryPhotoIndex.total : null,
        indexedPhotoPage: galleryPhotoIndex.page,
        indexedPhotoLoading: galleryPhotoIndex.loading,
        indexedPhotoComplete: galleryPhotoIndex.complete,
        onIndexedPhotoPageChange: galleryPhotoIndex.loadPage,
        onIndexedPhotoLoadAll: galleryPhotoIndex.loadAll,
        hasMoreOlderChat: !Array.isArray(fullChatMessages) && hasMoreOlderChat,
        loadingOlderChat: loadingOlderChat,
        onLoadOlderChat: loadOlderChatMessages,
        hasMoreMemos: hasMoreMemos,
        onLoadMoreMemos: () => setMemosLimit(prev => prev + MEMOS_PAGE_SIZE),
        isDarkTheme: isDarkTheme,
        onToggleTheme: toggleTheme,
        fontScalePercent: fontScalePercent,
        onDecreaseFont: () => setFontScalePercent(prev => Math.max(80, prev - 10)),
        onIncreaseFont: () => setFontScalePercent(prev => Math.min(130, prev + 10)),
        isChatNotifyEnabled: mainNotifPermission === 'granted' && mainChatNotifyEnabled,
        onToggleChatNotifications: handleMainToggleNotifications,
        onOpenAppSettings: () => setIsAppSettingsOpen(true),
        showToast: showToast,
        syncStatus: syncStatus,
        ...navMenuProps
      }),
      isGalleryShareOpen && activeCal && /*#__PURE__*/React.createElement(ShareModal, {
        calendar: activeCal,
        shareType: "gallery",
        showToast: showToast,
        onClose: () => setIsGalleryShareOpen(false)
      }),
      sharedAppOverlays
    ));
  }

  if (activeView === 'places') {
    return withStickyVideo(/*#__PURE__*/React.createElement(React.Fragment, null,
      /*#__PURE__*/React.createElement(PlacesView, {
        calendar: activeCal,
        onBack: () => changeView('calendar'),
        onSavePlace: handleSavePlace,
        onDeletePlace: handleDeletePlace,
        onSelectDate: (dateStr) => {
          const canonicalDate = normalizePlaceDateForSort(dateStr);
          if (canonicalDate) {
            setSelectedDate(canonicalDate);
            setIsModalOpen(true);
          }
        },
        showToast: showToast,
        onRequestConfirm: showConfirmDialog,
        placesInitialQuery: placesInitialQuery,
        setPlacesInitialQuery: setPlacesInitialQuery,
        placesInitialFocusId: placesInitialFocusId,
        setPlacesInitialFocusId: setPlacesInitialFocusId,
        isDarkTheme: isDarkTheme,
        onToggleTheme: toggleTheme,
        fontScalePercent: fontScalePercent,
        onDecreaseFont: () => setFontScalePercent(prev => Math.max(80, prev - 10)),
        onIncreaseFont: () => setFontScalePercent(prev => Math.min(130, prev + 10)),
        isChatNotifyEnabled: mainNotifPermission === 'granted' && mainChatNotifyEnabled,
        onToggleChatNotifications: handleMainToggleNotifications,
        onOpenAppSettings: () => setIsAppSettingsOpen(true),
        onSharePlaces: () => setIsPlacesShareOpen(true),
        syncStatus: syncStatus,
        ...navMenuProps
      }),
      isPlacesShareOpen && activeCal && /*#__PURE__*/React.createElement(ShareModal, {
        calendar: activeCal,
        shareType: "places",
        showToast: showToast,
        onClose: () => setIsPlacesShareOpen(false)
      }),
      sharedAppOverlays
    ));
  }

  if (activeView === 'history') {
    return withStickyVideo(/*#__PURE__*/React.createElement(React.Fragment, null,
      /*#__PURE__*/React.createElement(HistoryView, {
        calendar: activeCal,
        onBack: () => changeView('calendar'),
        onSelectDate: (dateStr) => {
          setSelectedDate(dateStr);
          setIsModalOpen(true);
        },
        isDarkTheme: isDarkTheme,
        onToggleTheme: toggleTheme,
        fontScalePercent: fontScalePercent,
        onDecreaseFont: () => setFontScalePercent(prev => Math.max(80, prev - 10)),
        onIncreaseFont: () => setFontScalePercent(prev => Math.min(130, prev + 10)),
        isChatNotifyEnabled: mainNotifPermission === 'granted' && mainChatNotifyEnabled,
        onToggleChatNotifications: handleMainToggleNotifications,
        onOpenAppSettings: () => setIsAppSettingsOpen(true),
        onOpenShare: () => {
          if (guardLoadedCalendar('Firebase 데이터를 불러온 뒤 공유 정보를 확인해 주세요.')) setIsHistoryShareOpen(true);
        },
        syncStatus: syncStatus,
        onAddPersonTag: handleAddPersonTag,
        onRenamePersonTag: handleRenamePersonTag,
        onDeletePersonTag: handleDeletePersonTag,
        anniversaries: anniversaries,
        chatMessages: galleryChatMessages,
        memos: historyMemosSnapshot,
        setActiveLightbox: setActiveLightbox,
        showToast: showToast,
        onPromoteImageUrl: handlePromoteInlineChatImage,
        onSaveImageTags: handleSaveImageTags,
        onSearchTag: handleSearchTag,
        onDeletePhoto: handleDeletePhoto,
        onReplacePhoto: handleReplacePhoto,
        onJumpToChatMessage: handleJumpToChatMessage,
        onJumpToMemo: handleJumpToMemo,
        onJumpToMeetingDate: handleJumpToMeetingDate,
        onGetChatMessageOrdinal: handleGetChatMessageOrdinal,
        onGetGalleryPhotoOrdinal: handleGetGalleryPhotoOrdinal,
        onRequestConfirm: showConfirmDialog,
        onRemovePhotoFromMemory: handleRemovePhotoFromTravelMemory,
        onRemovePhotosFromMemory: handleRemovePhotosFromTravelMemory,
        onHideMemoryGroup: handleHideMemoryGroup,
        onRestoreMemoryGroup: handleRestoreMemoryGroup,
        onAddPhotosBackToMemory: handleAddPhotosBackToTravelMemory,
        onFetchPhotoComments: handleFetchPhotoComments,
        onSavePhotoComments: handleSavePhotoComments,
        onFetchMeetingPhotoIndex: handleFetchMeetingPhotoIndex,
        indexedPhotos: galleryPhotoIndex.items,
        indexedPhotoComplete: galleryPhotoIndex.complete,
        onIndexedPhotoLoadAll: galleryPhotoIndex.loadAll,
        photoCommentCounts: photoCommentCounts,
        ...navMenuProps
      }),
      isHistoryShareOpen && activeCal && /*#__PURE__*/React.createElement(ShareModal, {
        calendar: activeCal,
        shareType: "history",
        showToast: showToast,
        onClose: () => setIsHistoryShareOpen(false)
      }),
      sharedAppOverlays
    ));
  }

  if (activeView === 'content') {
    return withStickyVideo(/*#__PURE__*/React.createElement(React.Fragment, null,
      /*#__PURE__*/React.createElement(ContentView, {
        calendar: activeCal,
        onBack: () => changeView('calendar'),
        onOpenAppSettings: () => setIsAppSettingsOpen(true),
        anniversaries: anniversaries,
        memos: memos,
        onRegisterCultureEvent: handleRegisterCultureEvent,
        onUnregisterCultureEvent: handleUnregisterCultureEvent,
        onQuickSaveMemo: handleQuickSaveCultureMemo,
        customCultureItems: customCultureItems,
        onSaveCustomCultureItem: handleSaveCustomCultureItem,
        showToast: showToast,
        ...navMenuProps
      }),
      sharedAppOverlays
    ));
  }

  const {
    hasVisiblePolls,
    mainMenuChatCount,
    mainMenuChatHasUnread,
    mainMenuPollHasNew,
    mainMenuMemoCount,
    mainMenuMemoHasNew,
    mainMenuGalleryCount,
    mainMenuPlaceCount,
    visibleConfirmedMeetings
  } = buildMainCalendarScreenState({
    calendar: activeCal, calendarId: activeCalId, visibleTotalChatCount, visibleChatMessages,
    totalMemoCount, memos, localGalleryCount, totalGalleryCount
  });

  const toggleConfirmedDateExpand = (dateStr) => {
    const isCurrentlyExpanded = !!expandedConfirmedDates[dateStr];
    if (isCurrentlyExpanded) {
      const banner = document.querySelector(`[data-confirmed-meeting-date="${dateStr}"]`);
      if (banner) {
        banner.classList.add('is-closing');
        const existingTimer = confirmedMeetingAnimationTimersRef.current.get(dateStr);
        if (existingTimer) clearTimeout(existingTimer);
        const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) {
          setExpandedConfirmedDates(prev => ({ ...prev, [dateStr]: false }));
          return;
        }
        const timer = setTimeout(() => {
          setExpandedConfirmedDates(prev => ({ ...prev, [dateStr]: false }));
          confirmedMeetingAnimationTimersRef.current.delete(dateStr);
        }, 260);
        confirmedMeetingAnimationTimersRef.current.set(dateStr, timer);
        return;
      }
    }
    setExpandedConfirmedDates(prev => ({
      ...prev,
      [dateStr]: !prev[dateStr]
    }));
  };

  return withStickyVideo(/*#__PURE__*/React.createElement("div", {
    className: "app-container",
    // offsetHeight already includes .main-header-inner's safe-area padding. Adding the inset
    // again here on iOS standalone created a large blank band between the header and content.
    style: { paddingTop: `${mainHeaderHeight}px` }
  }, /*#__PURE__*/React.createElement("header", {
    ref: mainHeaderRef,
    className: "main-header",
    style: { transform: isMainHeaderVisible ? 'translateY(0)' : 'translateY(-100%)' }
  }, /*#__PURE__*/React.createElement("div", {
    className: "main-header-inner"
  }, /*#__PURE__*/React.createElement("div", {
    className: "main-header-top-row"
  }, /*#__PURE__*/React.createElement("div", {
    className: "header-left"
  }, /*#__PURE__*/React.createElement("div", {
    style: { position: 'relative', minWidth: 0 }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "calendar-title",
    onClick: () => {
      if (activeCalId) {
        window.location.href = `${window.location.pathname}?id=${activeCalId}`;
      }
    }
  }, activeCal?.title)))), /*#__PURE__*/React.createElement("div", {
    className: "header-actions"
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn header-search-btn",
    onClick: () => { setGlobalSearchInitialQuery(''); setIsGlobalSearchOpen(true); },
    title: "검색",
    style: {
      padding: '10px'
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
    strokeLinejoin: "round",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("circle", { cx: "11", cy: "11", r: "8" }),
    /*#__PURE__*/React.createElement("path", { d: "m21 21-4.3-4.3" }))), /*#__PURE__*/React.createElement("button", {
    className: "btn header-settings-btn",
    onClick: () => {
      setIsMainSideMenuOpen(true);
    },
    title: "메뉴",
    "aria-label": "메뉴 열기",
    style: {
      padding: '10px'
    }
  }, /*#__PURE__*/React.createElement(AdminFilledMenuIcon, null)))), activeCal?.description && /*#__PURE__*/React.createElement("div", {
    className: "calendar-desc"
  }, renderTextWithUrlBadge(activeCal.description)), /*#__PURE__*/React.createElement("div", {
    className: "main-menu-bar"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "main-menu-item",
    onClick: () => {
      if (!hasVisiblePolls) {
        showAlert('진행중 투표', '현재 진행중인 투표가 없습니다.');
        return;
      }
      setPollsExpandSignal(prev => prev + 1);
      scrollToSection(pollsSectionRef);
    }
  }, /*#__PURE__*/React.createElement("span", { className: "main-menu-icon" }, /*#__PURE__*/React.createElement(MenuIcon, { paths: ["M9 11l3 3l8 -8", "M20 12v6a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2v-12a2 2 0 0 1 2 -2h9"] })), /*#__PURE__*/React.createElement("span", { className: "main-menu-label-full" }, "투표"), /*#__PURE__*/React.createElement("span", { className: "main-menu-label-short" }, "투표"), mainMenuPollHasNew && /*#__PURE__*/React.createElement("span", {
    className: "main-menu-dot"
  })), /*#__PURE__*/React.createElement("div", { className: "main-menu-sep" }), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "main-menu-item",
    onClick: () => changeView('chat')
  }, /*#__PURE__*/React.createElement("span", { className: "main-menu-icon" }, /*#__PURE__*/React.createElement(MenuIcon, { paths: ["M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"] })), /*#__PURE__*/React.createElement("span", { className: "main-menu-label-full" }, "채팅"), /*#__PURE__*/React.createElement("span", { className: "main-menu-label-short" }, "채팅"), mainMenuChatHasUnread && /*#__PURE__*/React.createElement("span", {
    className: "main-menu-dot",
    style: navChatLastAuthor && navChatLastAuthor.color ? { backgroundColor: navChatLastAuthor.color } : undefined
  })), canUseSettlement && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", { className: "main-menu-sep" }), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "main-menu-item",
    onClick: () => {
      if (guardLoadedCalendar('Firebase 데이터를 불러온 뒤 정산 정보를 확인해 주세요.')) changeView('settlement');
    }
  }, /*#__PURE__*/React.createElement("span", { className: "main-menu-icon" }, /*#__PURE__*/React.createElement(WalletIcon, { size: 16 })), /*#__PURE__*/React.createElement("span", { className: "main-menu-label-full" }, "정산"), /*#__PURE__*/React.createElement("span", { className: "main-menu-label-short" }, "정산"), activeCal && (() => {
        const bal = calculateSettlementBalance(activeCal);
        const badgeInfo = formatBalanceBadge(bal);
        return /*#__PURE__*/React.createElement("span", {
          className: "main-menu-badge",
          style: {
            backgroundColor: badgeInfo.bgColor,
            color: '#FFFFFF'
          }
        }, badgeInfo.text);
      })()), /*#__PURE__*/React.createElement("div", { className: "main-menu-sep" })), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "main-menu-item",
    onClick: () => {
      if (guardLoadedCalendar('Firebase 데이터를 불러온 뒤 메모 정보를 확인해 주세요.')) changeView('memo');
    }
  }, /*#__PURE__*/React.createElement("span", { className: "main-menu-icon" }, /*#__PURE__*/React.createElement(NotepadTextIcon, null)), /*#__PURE__*/React.createElement("span", { className: "main-menu-label-full" }, "메모"), /*#__PURE__*/React.createElement("span", { className: "main-menu-label-short" }, "메모"), activeCal && mainMenuMemoHasNew && /*#__PURE__*/React.createElement("span", {
    className: "main-menu-dot"
  }))))), isMainSideMenuOpen && /*#__PURE__*/React.createElement(MainSideMenu, {
    calendar: activeCal,
    anniversaries: anniversaries,
    galleryCount: mainMenuGalleryCount,
    placeCount: mainMenuPlaceCount,
    chatCount: mainMenuChatCount,
    memoCount: mainMenuMemoCount,
    historyCount: navHistoryCount,
    settlementCount: Array.isArray(activeCal && activeCal.expenses)
      ? activeCal.expenses.filter(e => e && !e.deletedAt).length
      : 0,
    settlementBadge: meetingsHydrated && activeCal && typeof calculateSettlementBalance === 'function' && typeof formatBalanceBadge === 'function'
      ? formatBalanceBadge(calculateSettlementBalance(activeCal))
      : null,
    chatLastAuthor: navChatLastAuthor,
    settlementLastDate: navSettlementLastDate,
    galleryLastDate: navGalleryLastDate,
      placeLastName: navPlaceLastName,
    memoLastTitleWord: navMemoLastTitleWord,
    showSettlement: canUseSettlement,
      onClose: () => setIsMainSideMenuOpen(false),
    onOpenManual: () => {
      setIsMainSideMenuOpen(false);
      const openManual = () => setIsGuideOpen(true);
      if (typeof window.__gatherLoadManualUi === 'function') {
        window.__gatherLoadManualUi().then(openManual).catch(err => {
          console.error('User manual UI load failed:', err);
          showToast('사용자 매뉴얼을 불러오지 못했습니다. 다시 시도해 주세요.', 'error');
        });
      } else {
        openManual();
      }
    },
    onOpenSettings: () => {
      setIsMainSideMenuOpen(false);
      if (!guardLoadedCalendar('Firebase 데이터를 불러온 뒤 설정을 수정해 주세요.')) return;
      const openSettings = () => {
        setAdminInitialTab('settings');
        setIsAdminOpen(true);
      };
      if (typeof window.__gatherLoadAdminUi === 'function') {
        window.__gatherLoadAdminUi().then(openSettings).catch(err => {
          console.error('Calendar settings UI load failed:', err);
          showToast('캘린더 설정을 불러오지 못했습니다. 다시 시도해 주세요.', 'error');
        });
      } else {
        openSettings();
      }
    },
    onOpenAnniversaries: () => {
      setIsMainSideMenuOpen(false);
      if (guardLoadedCalendar('Firebase 데이터를 불러온 뒤 기념일 설정을 수정해 주세요.')) {
        withEventUi(() => setIsAnniversariesOpen(true), '기념일 설정');
        if (activeCalId && typeof fetchAnniversariesRest === 'function') {
          fetchAnniversariesRest(activeCalId).then(list => {
            if (Array.isArray(list) && list.length > 0) {
              setAnniversaries(list.slice().sort((a, b) =>
                (Number(b.createdAt) || Number(b.updatedAt) || 0) - (Number(a.createdAt) || Number(a.updatedAt) || 0)
              ));
            }
          }).catch(() => {});
        }
      }
    },
    onOpenShare: () => {
      setIsMainSideMenuOpen(false);
      if (guardLoadedCalendar('Firebase 데이터를 불러온 뒤 공유 정보를 확인해 주세요.')) setIsShareOpen(true);
    },
    onOpenAdmin: () => {
      const adminUrl = new URL(window.location.href);
      adminUrl.searchParams.delete('view');
      adminUrl.searchParams.delete('msg');
      adminUrl.searchParams.delete('img');
      adminUrl.searchParams.delete('memo');
      adminUrl.searchParams.delete('place');
      adminUrl.searchParams.set('admin', '1');
      if (activeCalId) {
        adminUrl.searchParams.set('id', activeCalId);
      }
      if (currentMonthDate instanceof Date && !Number.isNaN(currentMonthDate.getTime())) {
        adminUrl.searchParams.set('year', String(currentMonthDate.getFullYear()));
        adminUrl.searchParams.set('month', String(currentMonthDate.getMonth() + 1).padStart(2, '0'));
      }
      window.open(adminUrl.toString(), '_blank', 'noopener,noreferrer');
    },
    onOpenGallery: () => changeView('gallery'),
    onChangeView: changeView,
    isDarkTheme: isDarkTheme,
    onToggleTheme: toggleTheme,
    fontScalePercent: fontScalePercent,
    onDecreaseFont: () => setFontScalePercent(prev => Math.max(80, prev - 10)),
    onIncreaseFont: () => setFontScalePercent(prev => Math.min(130, prev + 10)),
    isChatNotifyEnabled: mainNotifPermission === 'granted' && mainChatNotifyEnabled,
    onToggleChatNotifications: handleMainToggleNotifications,
    onOpenAppSettings: () => setIsAppSettingsOpen(true),
    onUpdateWeatherLocation: handleUpdateWeatherLocation,
    onDeleteRecentLocation: handleDeleteRecentWeatherLocation,
    showToast: showToast,
    syncStatus: syncStatus
  }), isGalleryOpen && /*#__PURE__*/React.createElement(ChatGalleryModal, {
    calendar: activeCal,
    // 채팅창 안에서 여는 이 갤러리 인스턴스만 좁은 live-window `chatMessages`를 받고 있었다 --
    // 스크롤로 올라간 옛 사진을 열어 태그를 저장해도 patchLocalChatMessage가 patch하는 다른
    // 4개 버킷(olderChatMessages/galleryLiveMessages/갤러리 아카이브)에는 반영되지만 이 좁은
    // 배열엔 반영 안 돼서, 같은 사진을 다시 열면 저장 전 상태로 보였다(새로고침해야 갱신).
    // 갤러리 페이지/히스토리 뷰가 이미 쓰는 병합된 galleryChatMessages/galleryMemos로 맞춘다.
    chatMessages: galleryChatMessages,
    memos: galleryMemos,
    onClose: () => setIsGalleryOpen(false),
    onUploadImages: handleUploadGalleryImages,
    onAddLink: handleAddGalleryLink,
    onAddFiles: handleAddGalleryFiles,
    onDeleteFiles: handleDeleteGalleryFiles,
    onDeleteGalleryLinks: handleDeleteGalleryLinks,
    onRequestConfirm: showConfirmDialog,
    onPasteGatherPhoto: handlePasteGatherPhoto,
    onPasteGatherPhotos: handlePasteGatherPhotos,
    onOpenShare: () => {
      if (guardLoadedCalendar('Firebase 데이터를 불러온 뒤 공유 정보를 확인해 주세요.')) setIsGalleryShareOpen(true);
    },
    setActiveLightbox: setActiveLightbox,
    onDeletePhoto: handleDeletePhoto,
    photoCommentCounts: photoCommentCounts,
    showToast: showToast
  }), isGalleryShareOpen && activeCal && /*#__PURE__*/React.createElement(ShareModal, {
    calendar: activeCal,
    shareType: "gallery",
    showToast: showToast,
    onClose: () => setIsGalleryShareOpen(false)
  }), isGuideOpen && /*#__PURE__*/React.createElement(UserManualOverlay, {
    calendar: activeCal,
    onClose: () => setIsGuideOpen(false)
  }), isNotificationHelpOpen && /*#__PURE__*/React.createElement(NotificationPermissionHelpModal, {
    onClose: () => setIsNotificationHelpOpen(false),
    onRetry: handleMainToggleNotifications,
    showToast: showToast
  }), isAnniversariesOpen && /*#__PURE__*/React.createElement(AnniversaryModal, {
    calendar: activeCal,
    anniversaries: anniversaries,
    initialEditId: anniversaryEditId,
    onInitialEditConsumed: () => setAnniversaryEditId(null),
    initialDate: anniversaryInitialDate,
    onClose: () => { setIsAnniversariesOpen(false); setAnniversaryEditId(null); setAnniversaryInitialDate(null); },
    showToast: showToast,
    onRequestConfirm: showConfirmDialog,
    onBulkRegister: handleBulkRegisterAvailability,
    onAnniversarySaved: handleAnniversarySaved,
    onAnniversaryDeleted: handleAnniversaryDeleted,
    isDarkTheme: isDarkTheme,
    setActiveLightbox: setActiveLightbox
  }), /*#__PURE__*/React.createElement("div", {
    ref: calendarSectionRef
  }, visibleConfirmedMeetings.length > 0 && /*#__PURE__*/React.createElement("div", {
    className: "confirmed-meeting-list",
    "data-confirmed-count": visibleConfirmedMeetings.length === 1 ? 'one' : visibleConfirmedMeetings.length === 2 ? 'two' : 'three-plus',
    style: { display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '8px', marginBottom: '12px', alignItems: 'center', width: '100%' }
  }, visibleConfirmedMeetings.map((meeting, meetingIndex) => {
    // A lone confirmed meeting defaults to the expanded banner (no need to tap to see it), but
    // once the user has explicitly toggled it, that explicit choice always wins -- otherwise the
    // forced-expanded default fights the collapse animation started by toggleConfirmedDateExpand
    // and the card gets stuck mid-collapse instead of settling back into the small icon state.
    const isExpanded = meeting.date in expandedConfirmedDates
      ? expandedConfirmedDates[meeting.date]
      : visibleConfirmedMeetings.length === 1;
    // Only the lead (first) upcoming card gets the 두근두근 pulse, and only while collapsed —
    // expanded banner must stay still.
    const isLeadCollapsedHeartbeat = meetingIndex === 0 && !isExpanded;
    const memoEntries = getActiveAvailabilities(activeCal).filter(e => e.date === meeting.date && e.note && e.note.trim());
    const [y, m, d] = meeting.date.split('-');
    const dateObj = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
    const dayNamesFull = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
    const dayNamesShort = ['일', '월', '화', '수', '목', '금', '토'];
    const fullDayName = dayNamesFull[dateObj.getDay()];
    const shortDayName = dayNamesShort[dateObj.getDay()];
    const ddayText = formatDDayLabel(meeting.date);
    const yyMMdd = `${y.slice(2)}.${m}.${d}`;

    if (!isExpanded) {
      /* Collapsed Icon State (Matching Image 1) */
      return /*#__PURE__*/React.createElement("button", {
        type: "button",
        key: meeting.date,
        className: "confirmed-meeting-icon-btn confirmed-meeting-surface" + (isLeadCollapsedHeartbeat ? " is-heartbeat" : ""),
        onClick: () => toggleConfirmedDateExpand(meeting.date),
        title: `${formatConfirmedMeetingLabel(meeting.date)} (클릭하여 펼치기)`,
        style: {
          display: 'inline-flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '8px 10px',
          minWidth: '70px',
          minHeight: '66px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%)',
          color: '#FFFFFF',
          border: 'none',
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(168, 85, 247, 0.25)',
          userSelect: 'none',
          WebkitTapHighlightColor: 'transparent'
        }
      },
        /* Date YY.MM.DD */
        /*#__PURE__*/React.createElement("span", {
          style: { fontSize: 'var(--font-size-xs)', fontWeight: 800, color: '#FFFFFF', lineHeight: 1.1, textShadow: '0 1px 2px rgba(0,0,0,0.15)' }
        }, yyMMdd),
        /* Day Name */
        /*#__PURE__*/React.createElement("span", {
          style: {
            fontSize: 'var(--font-size-base)',
            fontWeight: 800,
            color: shortDayName === '일' ? '#B7F34A' : '#FFFFFF',
            marginTop: '2px',
            lineHeight: 1.1,
            textShadow: '0 1px 2px rgba(0,0,0,0.15)'
          }
        }, fullDayName),
        /* D-day Pill Badge */
        /*#__PURE__*/React.createElement("span", {
          style: {
            backgroundColor: 'rgba(26, 16, 47, 0.85)',
            color: '#F472B6',
            padding: '2px 8px',
            borderRadius: 'var(--radius-full)',
            fontSize: 'var(--font-size-xs)',
            fontWeight: 800,
            marginTop: '4px',
            whiteSpace: 'nowrap',
            letterSpacing: '0.02em',
            boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
          }
        }, ddayText)
      );
    } else {
      /* Expanded Banner State (Matching Image 2) */
      return /*#__PURE__*/React.createElement("div", {
        key: meeting.date,
        className: "confirmed-meeting-banner confirmed-meeting-surface",
        "data-confirmed-meeting-date": meeting.date,
        role: "button",
        tabIndex: 0,
        onClick: (e) => {
          // Keep action clicks from collapsing the banner even if bubbling reaches this handler.
          if (e.target?.closest?.('.btn-view-schedule')) return;
          toggleConfirmedDateExpand(meeting.date);
        },
        onKeyDown: (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleConfirmedDateExpand(meeting.date);
          }
        },
        title: "클릭하여 접기",
        style: {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          flex: '1 1 100%',
          padding: '10px 14px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%)',
          color: '#FFFFFF',
          border: 'none',
          cursor: 'pointer',
          gap: '12px',
          boxShadow: 'none',
          textAlign: 'left',
          userSelect: 'none',
          WebkitTapHighlightColor: 'transparent'
        }
      },
        /* Left Column: Title & Notes */
        /*#__PURE__*/React.createElement("div", {
          style: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '5px', minWidth: 0, flex: 1 }
        },
          /* Line 1: [모임확정] YY.MM.DD (요일) */
          /*#__PURE__*/React.createElement("span", {
            style: { fontWeight: 800, color: '#FFFFFF', fontSize: '0.9rem', letterSpacing: '-0.01em', textShadow: '0 1px 2px rgba(0,0,0,0.15)' }
          }, `[모임확정] ${yyMMdd} (${shortDayName})`),
          /* Line 2: Note Summary Capsules */
          memoEntries.length > 0 && /*#__PURE__*/React.createElement("div", {
            style: { display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }
          },
            memoEntries.map(entry => {
              const p = getActiveParticipants(activeCal).find(part => part.id === entry.participantId);
              if (!p) return null;
              const entryUrl = extractFirstUrl(entry.note);
              const noteTextOnly = entryUrl ? removeFirstUrl(entry.note) : entry.note.trim();
              if (!noteTextOnly) return null;
              const pColor = (p && p.color) ? p.color : '#6366F1';
              return /*#__PURE__*/React.createElement(CapsuleTextBadge, {
                key: entry.participantId,
                text: noteTextOnly,
                title: `${p.name}: ${noteTextOnly}`,
                className: "memo-capsule-badge",
                style: {
                  backgroundColor: pColor,
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: 'var(--font-size-sm)',
                  lineHeight: '140%',
                  padding: '4px 10px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }
              });
            })
          )
        ),
        /* Right Column: "일정보기" & D-day Button */
        /*#__PURE__*/React.createElement("button", {
          type: "button",
          className: "btn-view-schedule",
          "aria-label": `${formatConfirmedMeetingLabel(meeting.date)} 일정 보기`,
          "data-no-press-feedback": true,
          onPointerDownCapture: (e) => e.stopPropagation(),
          onPointerDown: (e) => {
            // Keep the nested action independent from the banner's collapse handler on touch.
            e.stopPropagation();
          },
          onMouseDown: (e) => e.stopPropagation(),
          onClick: (e) => {
            e.stopPropagation();
            if (!guardLoadedCalendar()) return;
            setSelectedDate(meeting.date);
            setIsModalOpen(true);
          },
          onKeyDown: (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.stopPropagation();
              e.preventDefault();
              if (!guardLoadedCalendar()) return;
              setSelectedDate(meeting.date);
              setIsModalOpen(true);
            }
          },
          style: {
            backgroundColor: 'rgba(26, 16, 47, 0.88)',
            borderRadius: 'var(--radius-md)',
            padding: '6px 14px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            flexShrink: 0,
            boxShadow: 'none',
            border: 'none'
          }
        },
          /*#__PURE__*/React.createElement("span", {
            style: { color: '#F472B6', fontSize: 'var(--font-size-xs)', fontWeight: 800, lineHeight: 1.2 }
          }, ddayText),
          /*#__PURE__*/React.createElement("span", {
            style: { color: '#FFFFFF', fontSize: 'var(--font-size-sm)', fontWeight: 800, lineHeight: 1.2, marginTop: '1px' }
          }, "일정보기")
        )
      );
    }
  })), /*#__PURE__*/React.createElement(CalendarGrid, {
    anniversaries: anniversariesWithPosters,
    calendar: activeCal,
    isLoading: isInitialDataLoading,
    monthDate: currentMonthDate,
    onPrevMonth: () => setCurrentMonthAndSync(new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() - 1, 1)),
    onNextMonth: () => setCurrentMonthAndSync(new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() + 1, 1)),
    onToday: () => setCurrentMonthAndSync(new Date()),
    onJumpToMonth: (y, m) => setCurrentMonthAndSync(new Date(y, m, 1)),
    onSelectDate: d => {
      if (!guardLoadedCalendar()) return;
      setSelectedDate(d);
      setIsModalOpen(true);
    },
    onMoveAvailability: handleMoveAvailability,
    onParticipantClick: handleParticipantClick
  })), hasVisiblePolls && /*#__PURE__*/React.createElement("div", {
    ref: pollsSectionRef,
    className: "calendar-card",
    style: {
      padding: '16px',
      marginTop: '-12px'
    }
  }, /*#__PURE__*/React.createElement(PollList, {
    calendar: activeCal,
    onCreatePoll: handleOpenPollCreate,
    onEditPoll: handleOpenPollEdit,
    onVotePoll: handleOpenVoteSheet,
    onCancelVote: handleCancelVote,
    onRequestConfirm: showConfirmDialog,
    expandSignal: pollsExpandSignal
  })), /*#__PURE__*/React.createElement("div", { className: "chat-memo-row" },
    /*#__PURE__*/React.createElement("div", {
      className: "calendar-card",
      style: {
        padding: '16px'
      }
    }, /*#__PURE__*/React.createElement(CommentsSection, {
      calendar: activeCal,
      recentMessages: recentMessages,
      chatMessages: visibleChatMessages,
      totalChatCount: visibleTotalChatCount,
      previewHydrationExhausted: chatPreviewHydrationExhausted,
      chatInput: chatInput,
      setChatInput: setChatInput,
      chatParticipantId: chatParticipantId,
      setChatParticipantId: setChatParticipantId,
      isChatSheetOpen: isChatSheetOpen,
      setIsChatSheetOpen: setIsChatSheetOpen,
      isChatSubmitting: isChatSubmitting,
      chatTextareaRef: chatTextareaRef,
      chatImage: chatImages,
      setChatImage: setChatImages,
      chatFileAttachments: chatFileAttachments,
      setChatFileAttachments: setChatFileAttachments,
      activeLightbox: null, // render via withStickyVideo shared Lightbox host
      setActiveLightbox: setActiveLightbox,
      onSend: handleSendChatMessage,
      onDeleteMessage: handleDeleteMessage,
      onEditMessage: handleEditMessage,
      onMore: () => changeView('chat'),
      showToast: showToast,
      onPromoteImageUrl: handlePromoteInlineChatImage,
      onSaveImageTags: handleSaveImageTags,
      onSearchTag: handleSearchTag,
      onDeletePhoto: handleDeletePhoto,
      onReplacePhoto: handleReplacePhoto,
      onJumpToChatMessage: handleJumpToChatMessage,
      onJumpToMemo: handleJumpToMemo,
      onJumpToMeetingDate: handleJumpToMeetingDate,
      onGetChatMessageOrdinal: handleGetChatMessageOrdinal,
      onGetGalleryPhotoOrdinal: handleGetGalleryPhotoOrdinal,
      onRequestConfirm: showConfirmDialog
    })),
    /*#__PURE__*/React.createElement(MemoPreviewSection, {
      memos: memos,
      calendar: activeCal,
      onViewAll: () => changeView('memo'),
      onOpenEdit: memo => handleJumpToMemo(memo.id),
      onTogglePin: handleTogglePinFromMemoPreview,
      onSelectTag: handleJumpToMemoTag,
      onShare: memo => setPreviewSharingMemo(memo),
      onCommentsChange: handleMemoCommentsChangeFromMemoPreview,
      onRequestConfirm: showConfirmDialog,
      showToast: showToast, setActiveLightbox: setActiveLightbox
    })
  ), /*#__PURE__*/React.createElement(SummaryList, {
    calendar: activeCal,
    onSelectDate: d => {
      if (!guardLoadedCalendar()) return;
      setSelectedDate(d);
      setIsModalOpen(true);
    }
  }), /*#__PURE__*/React.createElement("div", { className: "gallery-places-row" },
    /*#__PURE__*/React.createElement(PhotoGallery, {
      chatMessages: (galleryPreviewMessages && galleryPreviewMessages.length > 0) ? galleryPreviewMessages : allChatMessages,
      memos: memos,
      calendar: activeCal,
      totalGalleryCount: mainMenuGalleryCount,
      onViewAll: () => changeView('gallery'),
      showToast: showToast,
      onPromoteImageUrl: handlePromoteInlineChatImage,
      onSaveImageTags: handleSaveImageTags,
      onSearchTag: handleSearchTag,
      onDeletePhoto: handleDeletePhoto,
      onReplacePhoto: handleReplacePhoto,
      onJumpToChatMessage: handleJumpToChatMessage,
      onJumpToMemo: handleJumpToMemo,
      onJumpToMeetingDate: handleJumpToMeetingDate,
      onJumpToGallery: handleJumpToGallery,
      onGetChatMessageOrdinal: handleGetChatMessageOrdinal,
      onGetGalleryPhotoOrdinal: handleGetGalleryPhotoOrdinal,
      onRequestConfirm: showConfirmDialog,
      onFetchPhotoComments: handleFetchPhotoComments,
      onSavePhotoComments: handleSavePhotoComments,
      photoCommentCounts: photoCommentCounts
    }),
    /*#__PURE__*/React.createElement(PlacesSection, {
      calendar: activeCal,
      onViewAll: () => changeView('places'),
      onSelectPlace: place => handleJumpToPlace(place.id)
    })
  ), /*#__PURE__*/React.createElement(Footer, null),
  previewSharingMemo && activeCal && /*#__PURE__*/React.createElement(MemoShareModal, {
    memo: previewSharingMemo,
    calendarId: activeCal.id,
    onClose: () => setPreviewSharingMemo(null),
    showToast: showToast
  })));
}
