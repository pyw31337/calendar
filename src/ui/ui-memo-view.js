/**
 * Memo view page (P4-15)
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


export function MemoView({ calendar, memos, hasMoreMemos, totalMemoCount, onLoadMoreMemos, onBack, showToast, isDarkTheme, onRequestConfirm, sharedMemo, onDismissSharedMemo, chatMessages, setActiveLightbox }) {
  const React = window.React;
  const __deps = window.GATHER_UI_DEPS || {};
  const __comp = window.GATHER_UI_COMPONENTS || {};
  const BackArrowIcon = __deps.BackArrowIcon;
  const SmallXIcon = __deps.SmallXIcon;
  const ResizableModalContainer = __deps.ResizableModalContainer;
  const ChatGalleryModal = __comp.ChatGalleryModal || __deps.ChatGalleryModal;
  const ChatParticipantSheet = __comp.ChatParticipantSheet || __deps.ChatParticipantSheet;
  const EmojiPickerIcon = __deps.EmojiPickerIcon;
  const EmojiPickerSheet = __comp.EmojiPickerSheet || __deps.EmojiPickerSheet;
  const ImageProcessingOverlay = __comp.ImageProcessingOverlay || __deps.ImageProcessingOverlay;
  const ImageThumbRemoveButton = __comp.ImageThumbRemoveButton || __deps.ImageThumbRemoveButton;
  const ImageUploadOverlay = __comp.ImageUploadOverlay || __deps.ImageUploadOverlay;
  const InlineSearchBar = __comp.InlineSearchBar || __deps.InlineSearchBar;
  const LinkPreviewCard = __deps.LinkPreviewCard || __comp.LinkPreviewCard;
  const LinkPreviewProgressOverlay = __deps.LinkPreviewProgressOverlay;
  const MemoCard = __deps.MemoCard;
  const MemoShareModal = __comp.MemoShareModal || __deps.MemoShareModal;
  const ParticipantPickerButton = __deps.ParticipantPickerButton;
  const extractFirstUrl = __deps.extractFirstUrl;
  const autoGrowTextarea = __deps.autoGrowTextarea;
  const getActiveParticipants = __deps.getActiveParticipants;
  const useScrollHideHeader = __deps.useScrollHideHeader;
  const formatChatHeaderTitle = __deps.formatChatHeaderTitle;

  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedTag, setSelectedTag] = React.useState('');
  // Header hides on scroll-down / reappears on scroll-up, matching the chat room header exactly.
  const { isHeaderVisible, onScroll: handleMemoScroll } = useScrollHideHeader();
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);
  const memoSearchInputRef = React.useRef(null);
  React.useEffect(() => {
    if (isSearchOpen) memoSearchInputRef.current?.focus();
  }, [isSearchOpen]);
  const [isComposerExpanded, setIsComposerExpanded] = React.useState(false);
  const newTitleInputRef = React.useRef(null);
  React.useEffect(() => {
    if (isComposerExpanded) newTitleInputRef.current?.focus();
  }, [isComposerExpanded]);

  // New Memo Composer State
  const [newTitle, setNewTitle] = React.useState('');
  const [newText, setNewText] = React.useState('');
  const [newColor, setNewColor] = React.useState('var(--bg-card)');
  const [newIsPinned, setNewIsPinned] = React.useState(false);
  const [newTags, setNewTags] = React.useState([]); // array of strings (tag tokens)
  const [newTagInput, setNewTagInput] = React.useState('');
  const [newImages, setNewImages] = React.useState([]); // array of { original, thumbnail, originalBlob, thumbnailBlob } (same shape chat uses)
  const [imageProcessingNew, setImageProcessingNew] = React.useState(null); // compression phase, mirrors chat's imageProcessing
  const [newUploadProgress, setNewUploadProgress] = React.useState(null); // upload phase: { pct, remainingSec }

  // Editing Memo State
  const [editingMemo, setEditingMemo] = React.useState(null);
  const [editTitle, setEditTitle] = React.useState('');
  const [editText, setEditText] = React.useState('');
  const editMemoTextareaRef = React.useRef(null);
  // editText gets set from an existing memo's text when 수정 is clicked (not just from typing),
  // so sizing needs to run on every editText change, not just once on mount.
  React.useEffect(() => autoGrowTextarea(editMemoTextareaRef.current, 400), [editText]);
  const [editColor, setEditColor] = React.useState('');
  const [editIsPinned, setEditIsPinned] = React.useState(false);
  const [editTags, setEditTags] = React.useState([]); // array of strings (tag tokens)
  const [editTagInput, setEditTagInput] = React.useState('');
  const [editImages, setEditImages] = React.useState([]); // { original, thumbnail, isExisting } for kept photos, { original, thumbnail, originalBlob, thumbnailBlob } for new ones
  const [imageProcessingEdit, setImageProcessingEdit] = React.useState(null); // compression phase, mirrors chat's imageProcessingEdit
  const [editUploadProgress, setEditUploadProgress] = React.useState(null); // upload phase: { pct, remainingSec }

  // Participant Picker States
  const [composerParticipantId, setComposerParticipantId] = React.useState(() => {
    return getStoredChatParticipantId(calendar?.id, calendar);
  });
  const [isComposerPartOpen, setIsComposerPartOpen] = React.useState(false);
  const [editParticipantId, setEditParticipantId] = React.useState('');
  const [isEditPartOpen, setIsEditPartOpen] = React.useState(false);

  // Emoji Picker States
  const [isComposerEmojiOpen, setIsComposerEmojiOpen] = React.useState(false);
  const [isEditEmojiOpen, setIsEditEmojiOpen] = React.useState(false);

  // Curated RGBA pastel background colors that work perfectly in both Light and Dark mode
  const MEMO_COLORS = [
    { name: '기본', value: 'var(--bg-card)', border: 'var(--border-subtle)' },
    { name: '빨강', value: 'rgba(239, 68, 68, 0.12)', border: 'rgba(239, 68, 68, 0.3)' },
    { name: '오렌지', value: 'rgba(245, 158, 11, 0.12)', border: 'rgba(245, 158, 11, 0.3)' },
    { name: '노랑', value: 'rgba(234, 179, 8, 0.12)', border: 'rgba(234, 179, 8, 0.3)' },
    { name: '초록', value: 'rgba(16, 185, 129, 0.12)', border: 'rgba(16, 185, 129, 0.3)' },
    { name: '하늘', value: 'rgba(6, 182, 212, 0.12)', border: 'rgba(6, 182, 212, 0.3)' },
    { name: '파랑', value: 'rgba(59, 130, 246, 0.12)', border: 'rgba(59, 130, 246, 0.3)' },
    { name: '보라', value: 'rgba(139, 92, 246, 0.12)', border: 'rgba(139, 92, 246, 0.3)' },
    { name: '핑크', value: 'rgba(236, 72, 153, 0.12)', border: 'rgba(236, 72, 153, 0.3)' }
  ];

  const getBorderColor = (colorVal) => {
    const matched = MEMO_COLORS.find(c => c.value === colorVal);
    return matched ? matched.border : 'var(--border-subtle)';
  };

  // Reuses the exact same compression/thumbnail pipeline chat attachments use
  // (processImageFilesSequentially -> compressImageToDataUrls), so memo photos get
  // identical quality handling, HEIC support, and a { original, thumbnail, originalBlob,
  // thumbnailBlob } shape that resolveMemoImageBatch and the thumbnail <img> below expect.
  const handleComposerFileSelect = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    try {
      const remainingSlots = 50 - newImages.length;
      if (remainingSlots <= 0) {
        if (showToast) showToast('사진 최대 50장', 'error');
        return;
      }
      const filesToProcess = Array.from(files).slice(0, remainingSlots);
      if (files.length > remainingSlots && showToast) {
        showToast(`${remainingSlots}장만 추가됨 (최대 50장)`, 'info');
      }

      setImageProcessingNew({ current: 0, total: filesToProcess.length });
      const { succeeded, failed } = await processImageFilesSequentially(
        filesToProcess,
        progress => setImageProcessingNew(progress)
      );

      if (succeeded.length > 0) setNewImages(prev => [...prev, ...succeeded]);
      if (failed.length > 0) {
        console.error('Image compression failed for:', failed.map(f => f.fileName));
        if (showToast) showToast(describeImageProcessingFailures(failed), 'error', 5000);
      } else if (succeeded.length > 0 && showToast) {
        showToast(`${succeeded.length}장 첨부완료`, 'success', 3000);
      }
    } catch (err) {
      console.error('handleComposerFileSelect unexpected error:', err);
      if (showToast) showToast('사진 첨부 중 오류', 'error', 5000);
    } finally {
      setImageProcessingNew(null);
      e.target.value = '';
    }
  };

  const handleEditFileSelect = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    try {
      const remainingSlots = 50 - editImages.length;
      if (remainingSlots <= 0) {
        if (showToast) showToast('사진 최대 50장', 'error');
        return;
      }
      const filesToProcess = Array.from(files).slice(0, remainingSlots);
      if (files.length > remainingSlots && showToast) {
        showToast(`${remainingSlots}장만 추가됨 (최대 50장)`, 'info');
      }

      setImageProcessingEdit({ current: 0, total: filesToProcess.length });
      const { succeeded, failed } = await processImageFilesSequentially(
        filesToProcess,
        progress => setImageProcessingEdit(progress)
      );

      if (succeeded.length > 0) setEditImages(prev => [...prev, ...succeeded]);
      if (failed.length > 0) {
        console.error('Image compression failed for:', failed.map(f => f.fileName));
        if (showToast) showToast(describeImageProcessingFailures(failed), 'error', 5000);
      } else if (succeeded.length > 0 && showToast) {
        showToast(`${succeeded.length}장 첨부완료`, 'success', 3000);
      }
    } catch (err) {
      console.error('handleEditFileSelect unexpected error:', err);
      if (showToast) showToast('사진 첨부 중 오류', 'error', 5000);
    } finally {
      setImageProcessingEdit(null);
      e.target.value = '';
    }
  };

  const handleSaveMemo = async () => {
    if (!newTitle.trim() && !newText.trim() && newImages.length === 0) {
      showToast('제목, 내용, 사진 중 하나 이상 입력해 주세요.', 'error');
      return;
    }

    try {
      const calendarId = calendar.id;
      const stamp = Date.now();
      const memoId = 'memo_' + stamp + '_' + Math.random().toString(36).slice(2, 8);

      // 1. Upload attachments (Storage upload with inline-base64 fallback + progress,
      // exactly the same module chat uses -- see resolveMemoImageBatch/resolveImageBatch)
      let uploadedUrls = [];
      let uploadedThumbs = [];
      if (newImages.length > 0) {
        setNewUploadProgress({ pct: 0, remainingSec: null });
        const resolved = await resolveMemoImageBatch(calendarId, newImages, setNewUploadProgress);
        uploadedUrls = resolved.map(r => r.imageUrl);
        uploadedThumbs = resolved.map(r => r.thumbUrl);
      }

      // Save tags formatted back to database (prepend '#' prefix if needed)
      const tagsArray = newTags.map(t => t.startsWith('#') ? t : '#' + t);

      const participantId = composerParticipantId || 'anonymous';

      // Check for link preview
      const url = extractFirstUrl(newText);
      let linkPreview = null;
      if (url) {
        try {
          const res = await fetchLinkPreview(url);
          if (res && res.status === 'success') {
            linkPreview = res.data;
          }
        } catch (e) {
          console.error('Failed to fetch link preview on memo save:', e);
        }
      }

      // 2. Write to Firestore
      const memoData = {
        id: memoId,
        participantId,
        title: newTitle.trim(),
        text: newText.trim(),
        imageUrls: uploadedUrls,
        thumbUrls: uploadedThumbs,
        color: newColor,
        isPinned: newIsPinned,
        tags: tagsArray,
        createdAt: stamp,
        updatedAt: stamp
      };
      if (linkPreview) memoData.linkPreview = linkPreview;

      await firebaseDb.collection('calendars').doc('cal_' + calendarId).collection('memos').doc(memoId).set(sanitizeMemoForFirestore(memoData));

      // 3. Write Activity Log
      const logNote = newTitle.trim() ? `제목: ${newTitle.trim()}` : (newText.trim() ? newText.trim().slice(0, 30) + '...' : '사진 첨부');
      const activityLog = createMemoActivityLog(calendarId, 'memo_create', participantId, stamp, logNote);
      if (activityLog) {
        await firebaseDb.collection('calendars').doc('cal_' + calendarId).collection('activityLogs').doc(activityLog.id).set(activityLog);
        
        const nextCal = {
          ...calendar,
          updatedAt: stamp,
          revision: (calendar.revision || 0) + 1
        };
        await pushSingleCloudCalendar(nextCal, stamp, 18, null, 'settings', [activityLog]);
      }

      showToast('메모가 저장되었습니다.', 'success');
      
      // Reset composer
      setNewTitle('');
      setNewText('');
      setNewColor('var(--bg-card)');
      setNewIsPinned(false);
      setNewTags([]);
      setNewTagInput('');
      setNewImages([]);
      setIsComposerExpanded(false);
    } catch (err) {
      console.error('Failed to save memo:', err);
      showToast('메모 저장 실패', 'error');
    } finally {
      setNewUploadProgress(null);
    }
  };

  const handleUpdateMemo = async () => {
    if (!editTitle.trim() && !editText.trim() && editImages.length === 0) {
      showToast('제목, 내용, 사진 중 하나 이상 입력해 주세요.', 'error');
      return;
    }

    try {
      const calendarId = calendar.id;
      const stamp = Date.now();

      // Kept photos carry isExisting (pass through as-is) and new ones get uploaded, same
      // module chat's edit flow uses (see resolveMemoImageBatch/resolveImageBatch).
      let uploadedUrls = [];
      let uploadedThumbs = [];
      if (editImages.length > 0) {
        setEditUploadProgress({ pct: 0, remainingSec: null });
        const resolved = await resolveMemoImageBatch(calendarId, editImages, setEditUploadProgress);
        uploadedUrls = resolved.map(r => r.imageUrl);
        uploadedThumbs = resolved.map(r => r.thumbUrl);
      }

      // Save tags formatted back to database (prepend '#' prefix if needed)
      const tagsArray = editTags.map(t => t.startsWith('#') ? t : '#' + t);

      const participantId = editParticipantId || 'anonymous';

      // Check for link preview
      const url = extractFirstUrl(editText);
      let linkPreview = null;
      if (url) {
        const oldUrl = extractFirstUrl(editingMemo.text);
        if (oldUrl === url && editingMemo.linkPreview) {
          linkPreview = editingMemo.linkPreview;
        } else {
          try {
            const res = await fetchLinkPreview(url);
            if (res && res.status === 'success') {
              linkPreview = res.data;
            }
          } catch (e) {
            console.error('Failed to fetch link preview on memo update:', e);
          }
        }
      }

      const memoData = {
        ...editingMemo,
        participantId,
        title: editTitle.trim(),
        text: editText.trim(),
        imageUrls: uploadedUrls,
        thumbUrls: uploadedThumbs,
        color: editColor,
        isPinned: editIsPinned,
        tags: tagsArray,
        updatedAt: stamp,
        linkPreview: linkPreview || null
      };

      await firebaseDb.collection('calendars').doc('cal_' + calendarId).collection('memos').doc(editingMemo.id).set(sanitizeMemoForFirestore(memoData));

      // Log Memo Update — before→after detail
      const logNote = buildFieldChangeNote(editTitle.trim() || '메모', [
        { key: '제목', before: editingMemo.title || '', after: editTitle.trim() },
        { key: '내용', before: editingMemo.text || '', after: editText.trim() },
        { key: '색상', before: editingMemo.color || '', after: editColor || '' },
        { key: '고정', before: editingMemo.isPinned ? 'Y' : 'N', after: editIsPinned ? 'Y' : 'N' }
      ]) || (editTitle.trim() || (editText.trim().slice(0, 40) + '...'));
      const activityLog = createMemoActivityLog(calendarId, 'memo_update', participantId, stamp, logNote);
      if (activityLog) {
        await firebaseDb.collection('calendars').doc('cal_' + calendarId).collection('activityLogs').doc(activityLog.id).set(activityLog);
        
        const nextCal = {
          ...calendar,
          updatedAt: stamp,
          revision: (calendar.revision || 0) + 1
        };
        await pushSingleCloudCalendar(nextCal, stamp, 18, null, 'settings', [activityLog]);
      }

      showToast('메모가 수정되었습니다.', 'success');
      setEditingMemo(null);
    } catch (err) {
      console.error('Failed to update memo:', err);
      showToast('메모 수정 실패', 'error');
    } finally {
      setEditUploadProgress(null);
    }
  };

  const handleDeleteMemo = async (memo) => {
    const action = async () => {
      try {
        const calendarId = calendar.id;
        const stamp = Date.now();
        const participantId = getStoredChatParticipantId(calendarId, calendar) || 'anonymous';

        await firebaseDb.collection('calendars').doc('cal_' + calendarId).collection('memos').doc(memo.id).delete();

        // Log Memo Delete
        const logNote = memo.title ? `제목: ${memo.title}` : (memo.text.slice(0, 30) + '...');
        const activityLog = createMemoActivityLog(calendarId, 'memo_delete', participantId, stamp, logNote);
        if (activityLog) {
          await firebaseDb.collection('calendars').doc('cal_' + calendarId).collection('activityLogs').doc(activityLog.id).set(activityLog);
          
          const nextCal = {
            ...calendar,
            updatedAt: stamp,
            revision: (calendar.revision || 0) + 1
          };
          await pushSingleCloudCalendar(nextCal, stamp, 18, null, 'settings', [activityLog]);
        }

        showToast('메모가 삭제되었습니다.', 'success');
        setEditingMemo(null);
      } catch (err) {
        console.error('Failed to delete memo:', err);
        showToast('메모 삭제 실패', 'error');
      }
    };

    if (onRequestConfirm) {
      onRequestConfirm('메모 삭제', '이 메모를 삭제하시겠습니까?', action);
    } else {
      if (confirm('이 메모를 삭제하시겠습니까?')) {
        action();
      }
    }
  };

  const handleOpenEdit = (memo) => {
    setEditingMemo(memo);
    setEditTitle(memo.title || '');
    setEditText(memo.text || '');
    setEditColor(memo.color || 'var(--bg-card)');
    setEditIsPinned(!!memo.isPinned);
    
    // Parse tag tokens (strip '#' prefix for local state management)
    const rawTags = memo.tags || [];
    const cleanTags = rawTags.map(t => t.startsWith('#') ? t.slice(1).trim() : t).filter(Boolean);
    setEditTags(cleanTags);
    setEditTagInput('');

    // Reconstruct list of images for editing (same { original, thumbnail, isExisting }
    // shape chat's edit flow uses, so resolveMemoImageBatch passes these through untouched)
    const currentImgs = (memo.imageUrls || []).map((url, idx) => ({
      original: url,
      thumbnail: memo.thumbUrls?.[idx] || url,
      isExisting: true
    }));
    setEditImages(currentImgs);
    setEditParticipantId(memo.participantId || '');
  };

  const handleTogglePin = async (memo) => {
    try {
      await firebaseDb.collection('calendars').doc('cal_' + calendar.id).collection('memos').doc(memo.id).update({ isPinned: !memo.isPinned });
    } catch (err) {
      console.error('Failed to toggle memo pin:', err);
      showToast('고정 상태 변경 실패', 'error');
    }
  };

  const handleMemoCommentsChange = async (memo, nextComments) => {
    try {
      await firebaseDb.collection('calendars').doc('cal_' + calendar.id).collection('memos').doc(memo.id).update({ comments: nextComments });
    } catch (err) {
      console.error('Failed to update memo comments:', err);
      showToast('댓글 저장 실패', 'error');
    }
  };

  // Layer-popup share link for a single memo -- opens MemoShareModal, which builds the
  // ?id=<calendar>&view=memo&memo=<id> URL (same deep-link convention chat/tag search results
  // already use) and offers a one-tap copy.
  const [sharingMemo, setSharingMemo] = React.useState(null);

  // Gallery modal state -- opens the ChatGalleryModal (photo grid) from this view's own
  // header gallery icon or side-menu entry. Previously these variables were only declared
  // in App scope and were never in scope inside MemoView, causing a ReferenceError crash.
  const [isGalleryOpen, setIsGalleryOpen] = React.useState(false);

  // Link-preview progress overlay state -- shown while a memo link-preview is being fetched.
  // Same crash root cause as isGalleryOpen above (declared only in App, used here).
  const [linkPreviewProgressState, setLinkPreviewProgressState] = React.useState(null);

  const removeComposerImage = (idx) => {
    setNewImages(prev => prev.filter((_, i) => i !== idx));
  };

  const removeEditImage = (idx) => {
    setEditImages(prev => prev.filter((_, i) => i !== idx));
  };

  const handleAddNewTag = () => {
    const val = newTagInput.trim();
    if (!val) return;

    const cleanTag = val.startsWith('#') ? val.slice(1).trim() : val;
    if (!cleanTag) return;

    if (newTags.includes(cleanTag)) {
      showToast('이미 등록된 태그입니다.', 'error');
      return;
    }
    if (newTags.length >= 10) {
      showToast('태그는 최대 10개까지 등록 가능합니다.', 'error');
      return;
    }
    setNewTags(prev => [...prev, cleanTag]);
    setNewTagInput('');
  };

  const handleAddEditTag = async () => {
    const val = editTagInput.trim();
    if (!val) return;

    const cleanTag = val.startsWith('#') ? val.slice(1).trim() : val;
    if (!cleanTag) return;

    if (editTags.includes(cleanTag)) {
      showToast('이미 등록된 태그입니다.', 'error');
      return;
    }
    if (editTags.length >= 10) {
      showToast('태그는 최대 10개까지 등록 가능합니다.', 'error');
      return;
    }
    
    const nextTags = [...editTags, cleanTag];

    // Real-time Save to Firestore immediately for edit modal
    if (editingMemo) {
      try {
        const calendarId = calendar.id;
        const tagsArray = nextTags.map(t => t.startsWith('#') ? t : '#' + t);
        await firebaseDb.collection('calendars').doc('cal_' + calendarId).collection('memos').doc(editingMemo.id).update({
          tags: tagsArray
        });
      } catch (err) {
        console.error('Failed to update tags in Firestore:', err);
        showToast('태그 저장 실패', 'error');
      }
    }

    setEditTags(nextTags);
    setEditTagInput('');
  };

  const filteredMemos = (memos || []).filter(memo => {
    const query = searchQuery.trim().toLowerCase();
    
    // Live Search Matcher
    let searchMatch = true;
    if (query) {
      const titleMatch = memo.title ? memo.title.toLowerCase().includes(query) : false;
      const textMatch = memo.text ? memo.text.toLowerCase().includes(query) : false;
      const tagsMatch = memo.tags ? memo.tags.some(tag => tag.toLowerCase().includes(query)) : false;
      searchMatch = titleMatch || textMatch || tagsMatch;
    }

    // Filter by Tag Clicked Matcher
    const filterTagMatch = selectedTag ? (memo.tags || []).includes(selectedTag) : true;

    return searchMatch && filterTagMatch;
  });

  const pinnedMemos = filteredMemos.filter(m => m.isPinned);
  const otherMemos = filteredMemos.filter(m => !m.isPinned);

  const composerPart = (calendar.participants || []).find(p => p.id === composerParticipantId);
  const editPart = (calendar.participants || []).find(p => p.id === editParticipantId);

  return /*#__PURE__*/React.createElement("div", {
    className: "memo-view-container",
    style: {
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'var(--bg-primary)',
      display: 'flex', flexDirection: 'column',
      width: '100%', maxWidth: '100%', overflowX: 'hidden'
    }
  },
    /* Floating back button -- always fixed in place; gains a shadow once the header itself
       has scrolled out of view, exactly like the chat room's back button. */
    /*#__PURE__*/React.createElement("button", {
      type: "button",
      onClick: onBack,
      "aria-label": "뒤로가기",
      style: {
        position: 'fixed', top: '10px', left: '10px', width: '36px', height: '36px',
        borderRadius: '50%', backgroundColor: 'var(--bg-card)', border: 'none',
        boxShadow: isHeaderVisible ? 'none' : '0 2px 8px rgba(0,0,0,0.12)',
        transition: 'box-shadow 0.2s ease',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', color: '#64748B', zIndex: 1020
      }
    }, /*#__PURE__*/React.createElement(BackArrowIcon, { size: 22 })),

    /* Chat-room-header-style header: left spacer (back button floats over it), centered
       title, right search-toggle button. */
    /*#__PURE__*/React.createElement("div", {
      className: "memo-view-header",
      style: {
        position: 'fixed', top: 0, left: 0, right: 0, height: '56px',
        backgroundColor: 'var(--bg-card)', borderBottom: '1px solid var(--border-subtle)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 16px', zIndex: 1010,
        transition: 'transform 0.3s ease',
        transform: isHeaderVisible ? 'translateY(0)' : 'translateY(-100%)'
      }
    },
      /*#__PURE__*/React.createElement("div", { style: { width: '32px', flexShrink: 0 } }),
      /*#__PURE__*/React.createElement("div", {
        style: {
          position: 'absolute', left: '50%', transform: 'translateX(-50%)',
          display: 'flex', alignItems: 'center', fontWeight: 800, fontSize: '0.95rem',
          color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden',
          textOverflow: 'ellipsis', maxWidth: 'calc(100vw - 160px)', pointerEvents: 'none'
        }
      }, calendar.title, " 메모"),
      /*#__PURE__*/React.createElement("div", {
        style: { display: 'flex', alignItems: 'center', gap: '2px', flexShrink: 0 }
      },
        /* Search button */
        /*#__PURE__*/React.createElement("button", {
          type: "button",
          onClick: () => setIsSearchOpen(v => !v),
          title: "검색",
          "aria-label": "메모 검색",
          style: {
            background: 'none', border: 'none', cursor: 'pointer', padding: '6px',
            color: isSearchOpen ? 'var(--accent-primary)' : 'var(--text-muted)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px'
          }
        }, /*#__PURE__*/React.createElement("svg", {
          xmlns: "http://www.w3.org/2000/svg", width: "22", height: "22", viewBox: "0 0 24 24",
          fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round"
        }, /*#__PURE__*/React.createElement("circle", { cx: "11", cy: "11", r: "8" }), /*#__PURE__*/React.createElement("path", { d: "m21 21-4.3-4.3" })))
      )
    ),

    /* Search bar -- hidden by default, slides in below the header when the search button is
       tapped (same slot/z-index the chat room's own search bar uses). */
    isSearchOpen && /*#__PURE__*/React.createElement(InlineSearchBar, {
      fixed: true,
      inputRef: memoSearchInputRef,
      value: searchQuery,
      placeholder: "메모 제목, 내용, 해시태그 검색...",
      onChange: e => setSearchQuery(e.target.value),
      trailing: /*#__PURE__*/React.createElement(React.Fragment, null,
        selectedTag && /*#__PURE__*/React.createElement("button", {
          type: "button",
          onClick: () => setSelectedTag(''),
          title: selectedTag,
          style: {
            padding: '6px 12px', borderRadius: '16px', backgroundColor: 'var(--bg-primary)',
            border: '1px solid var(--border-subtle)', color: '#3B82F6', fontSize: '0.75rem',
            fontWeight: 'bold', cursor: 'pointer', flexShrink: 0,
            maxWidth: '35vw', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
          }
        }, selectedTag, " ✕"),
        /*#__PURE__*/React.createElement("button", {
          type: "button",
          onClick: () => { setIsSearchOpen(false); setSearchQuery(''); setSelectedTag(''); },
          style: { border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px 6px', fontSize: '0.8rem', fontWeight: 700, flexShrink: 0 }
        }, "닫기")
      )
    }),

    /* Main Scrollable Body */
    /*#__PURE__*/React.createElement("div", {
      style: { flex: 1, position: 'relative', minHeight: 0 }
    }, /*#__PURE__*/React.createElement("div", {
      onScroll: handleMemoScroll,
      style: { position: 'absolute', inset: 0, overflowY: 'auto', padding: '16px', paddingTop: isSearchOpen ? '116px' : '72px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: '20px' }
    },
      /* Shared-memo banner -- when this page was opened via a memo's own share link
         (?view=memo&memo=<id>), show that memo prominently as a single full-width row above
         everything else (composer included), then the normal composer/list continue exactly
         as before below it. The memo may be older than the paginated `memos` window, hence the
         separate direct-by-id fetch (see sharedMemo in App()) rather than searching the list. */
      sharedMemo && /*#__PURE__*/React.createElement("div", {
        style: {
          width: '100%', maxWidth: '520px', margin: '0 auto', boxSizing: 'border-box',
          border: '2px solid #4F46E5', borderRadius: '16px', padding: '10px',
          boxShadow: '0 6px 18px rgba(79, 70, 229, 0.14)',
          display: 'flex', flexDirection: 'column', gap: '8px'
        }
      },
        /*#__PURE__*/React.createElement("div", {
          style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', padding: '0 4px' }
        },
          /*#__PURE__*/React.createElement("span", {
            style: { fontSize: '0.72rem', fontWeight: 800, color: '#4F46E5', letterSpacing: '0.05em', textTransform: 'uppercase' }
          }, "공유된 메모"),
          /*#__PURE__*/React.createElement("button", {
            type: "button",
            onClick: () => { if (onDismissSharedMemo) onDismissSharedMemo(); },
            title: "닫기",
            style: { background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', display: 'flex', alignItems: 'center', flexShrink: 0 }
          }, /*#__PURE__*/React.createElement(SmallXIcon, { size: 18 }))
        ),
        /* Reuses MemoCard itself (same images/link-preview/text/pin/comments rendering as the
           normal grid below) instead of a bespoke one-line teaser -- "크게" (prominently) here
           means full-width and its own row, not a stripped-down summary. */
        /*#__PURE__*/React.createElement(MemoCard, {
          memo: sharedMemo,
          calendar: calendar,
          onOpenEdit: handleOpenEdit,
          onTogglePin: () => handleTogglePin(sharedMemo),
          onShare: () => setSharingMemo(sharedMemo),
          onSelectTag: (tag) => { setSelectedTag(tag); setIsSearchOpen(true); },
          onCommentsChange: (nextComments) => handleMemoCommentsChange(sharedMemo, nextComments),
          getBorderColor: getBorderColor,
          onRequestConfirm: onRequestConfirm,
          showToast: showToast
        })
      ),

      /* Rich Memo Input Composer (Google Keep style) */
      /*#__PURE__*/React.createElement("div", {
        style: {
          width: '100%',
          maxWidth: '520px',
          margin: '0 auto',
          backgroundColor: newColor,
          border: '1px solid ' + getBorderColor(newColor),
          borderRadius: '12px',
          padding: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          transition: 'all 0.2s ease',
          boxSizing: 'border-box'
        }
      },
        !isComposerExpanded ? 
          /* Collapsed state */
          /*#__PURE__*/React.createElement("div", {
            onClick: () => setIsComposerExpanded(true),
            style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', color: 'var(--text-muted)' }
          },
            /*#__PURE__*/React.createElement("span", { style: { fontSize: '0.88rem' } }, "새로운 메모를 남겨보세요..."),
            /*#__PURE__*/React.createElement("span", { style: { display: 'flex', gap: '8px', color: '#64748B', marginLeft: 'auto' } }, 
              /* Photo icon shortcut */
              /*#__PURE__*/React.createElement("svg", {
                xmlns: "http://www.w3.org/2000/svg", width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2"
              }, /*#__PURE__*/React.createElement("rect", { width: "18", height: "18", x: "3", y: "3", rx: "2", ry: "2" }), /*#__PURE__*/React.createElement("circle", { cx: "9", cy: "9", r: "2" }), /*#__PURE__*/React.createElement("path", { d: "m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" }))
            )
          )
        :
          /* Expanded state */
          /*#__PURE__*/React.createElement("div", {
            style: { display: 'flex', flexDirection: 'column', gap: '8px' }
          },
            /* Title & Pin row */
            /*#__PURE__*/React.createElement("div", {
              style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }
            },
              /* Title input - Styled precisely as user requested */
              /*#__PURE__*/React.createElement("input", {
                type: "text",
                ref: newTitleInputRef,
                placeholder: "제목",
                value: newTitle,
                onChange: e => setNewTitle(e.target.value),
                style: {
                  padding: '8px 8px',
                  background: 'transparent',
                  borderWidth: 'medium',
                  borderStyle: 'none',
                  borderColor: 'currentcolor',
                  borderImage: 'none',
                  outline: 'none',
                  fontSize: '0.95rem',
                  fontWeight: 'bold',
                  color: 'var(--text-main)',
                  width: '100%',
                  borderBottom: '1px solid var(--border-subtle)',
                  boxSizing: 'border-box'
                }
              }),
              /* Pin Toggle button (Custom pin SVGs for ON/OFF) */
              /*#__PURE__*/React.createElement("button", {
                type: "button",
                onClick: () => setNewIsPinned(!newIsPinned),
                style: { background: 'none', border: 'none', cursor: 'pointer', color: newIsPinned ? '#F59E0B' : '#94A3B8', padding: '4px' }
              }, newIsPinned ? 
                /*#__PURE__*/React.createElement("svg", {
                  xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "currentColor", className: "icon icon-tabler icon-tabler-filled icon-tabler-pin"
                }, /*#__PURE__*/React.createElement("path", { stroke: "none", d: "M0 0h24v24H0z", fill: "none" }), /*#__PURE__*/React.createElement("path", { d: "M15.113 3.21l.094 .083l5.5 5.5a1 1 0 0 1 -1.175 1.59l-3.172 3.171l-1.424 3.797a1 1 0 0 1 -.158 .277l-.07 .08l-1.5 1.5a1 1 0 0 1 -1.32 .082l-.095 -.083l-2.793 -2.792l-3.793 3.792a1 1 0 0 1 -1.497 -1.32l.083 -.094l3.792 -3.793l-2.792 -2.793a1 1 0 0 1 -.083 -1.32l.083 -.094l1.5 -1.5a1 1 0 0 1 .258 -.187l.098 -.042l3.796 -1.425l3.171 -3.17a1 1 0 0 1 1.497 -1.26z" }))
              :
                /*#__PURE__*/React.createElement("svg", {
                  xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: "icon icon-tabler icons-tabler-outline icon-tabler-pin"
                }, /*#__PURE__*/React.createElement("path", { stroke: "none", d: "M0 0h24v24H0z", fill: "none" }), /*#__PURE__*/React.createElement("path", { d: "M15 4.5l-4 4l-4 1.5l-1.5 1.5l7 7l1.5 -1.5l1.5 -4l4 -4" }), /*#__PURE__*/React.createElement("path", { d: "M9 15l-4.5 4.5" }), /*#__PURE__*/React.createElement("path", { d: "M14.5 4l5.5 5.5" }))
              )
            ),

            /* Body Textarea wrapped relatively with bottom-right emoji & file picker icons - Styled precisely as user requested */
            /*#__PURE__*/React.createElement("div", {
              style: { position: 'relative', width: '100%' }
            },
              /* Textarea */
              /*#__PURE__*/React.createElement("textarea", {
                placeholder: "메모 입력...",
                value: newText,
                onChange: e => { setNewText(e.target.value); autoGrowTextarea(e.target, 400); },
                rows: "4",
                style: {
                  padding: '8px 4px',
                  background: 'transparent',
                  borderWidth: 'medium',
                  borderStyle: 'none',
                  borderColor: 'currentcolor',
                  borderImage: 'none',
                  outline: 'none',
                  resize: 'none',
                  fontSize: '0.88rem',
                  color: 'var(--text-main)',
                  width: '100%',
                  paddingBottom: '28px',
                  fontFamily: 'inherit',
                  boxSizing: 'border-box'
                }
              }),
              /* Bottom-right emoji/photo buttons wrapper */
              /*#__PURE__*/React.createElement("div", {
                style: {
                  position: 'absolute',
                  right: '4px',
                  bottom: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  zIndex: 2
                }
              },
                /* Emoji picker trigger */
                /*#__PURE__*/React.createElement("button", {
                  type: "button",
                  onClick: () => setIsComposerEmojiOpen(true),
                  style: { background: 'none', border: 'none', padding: '4px', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' },
                  title: "이모티콘 추가"
                }, /*#__PURE__*/React.createElement(EmojiPickerIcon, null)),
                
                /* File Upload label icon */
                /*#__PURE__*/React.createElement("label", {
                  style: { display: 'flex', alignItems: 'center', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px' },
                  title: "사진 첨부"
                }, 
                  /*#__PURE__*/React.createElement("input", {
                    type: "file",
                    multiple: true,
                    accept: "image/*",
                    onChange: handleComposerFileSelect,
                    style: { display: 'none' }
                  }),
                  /*#__PURE__*/React.createElement("svg", {
                    xmlns: "http://www.w3.org/2000/svg", width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2"
                  }, /*#__PURE__*/React.createElement("rect", { width: "18", height: "18", x: "3", y: "3", rx: "2", ry: "2" }), /*#__PURE__*/React.createElement("circle", { cx: "9", cy: "9", r: "2" }), /*#__PURE__*/React.createElement("path", { d: "m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" }))
                )
              )
            ),

            /* Live Link Preview Area inside input */
            extractFirstUrl(newText) && /*#__PURE__*/React.createElement("div", {
              style: { marginTop: '4px', marginBottom: '4px' }
            }, /*#__PURE__*/React.createElement(LinkPreviewCard, { url: extractFirstUrl(newText) })),

            /* Images previews list */
            newImages.length > 0 && /*#__PURE__*/React.createElement("div", {
              style: { display: 'flex', flexWrap: 'wrap', gap: '6px', margin: '4px 0' }
            }, newImages.map((img, idx) => /*#__PURE__*/React.createElement("div", {
              key: idx,
              style: { position: 'relative', width: '60px', height: '60px' }
            }, 
              /* Image element */
              /*#__PURE__*/React.createElement("img", {
                src: img.thumbnail,
                style: { width: '100%', height: '100%', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--border-subtle)' }
              }),
              /* Remove button (shared with chat's attachment thumbnail) */
              /*#__PURE__*/React.createElement(ImageThumbRemoveButton, {
                onClick: () => removeComposerImage(idx)
              })
            ))),

            /* Tag Input Module (from Lightbox, with IME composition prevention) */
            /*#__PURE__*/React.createElement("div", {
              style: { display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }
            },
              /*#__PURE__*/React.createElement("span", {
                style: { fontSize: '0.74rem', fontWeight: 800, color: 'var(--text-muted)', flexShrink: 0 }
              }, "태그입력"),
              /*#__PURE__*/React.createElement("input", {
                type: "text",
                placeholder: newTags.length >= 10 ? "태그 최대 10개 도달" : `태그 입력 (${newTags.length}/10)`,
                value: newTagInput,
                onChange: e => setNewTagInput(e.target.value),
                onKeyDown: e => {
                  if (e.nativeEvent.isComposing) return;
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddNewTag();
                  }
                },
                maxLength: 100,
                style: {
                  flex: 1, minWidth: 0, height: '28px', padding: '0 8px', borderRadius: '6px',
                  border: '1px solid var(--border-subtle)', background: 'var(--bg-primary)',
                  color: 'var(--text-main)', fontSize: '0.74rem'
                }
              }),
              /*#__PURE__*/React.createElement("button", {
                type: "button",
                onClick: handleAddNewTag,
                disabled: newTags.length >= 10,
                style: {
                  flexShrink: 0, height: '28px', padding: '0 10px', borderRadius: '6px',
                  border: '1px solid var(--border-subtle)', background: 'var(--border-subtle)',
                  color: 'var(--text-main)', fontSize: '0.72rem', fontWeight: 800, cursor: 'pointer',
                  opacity: newTags.length >= 10 ? 0.45 : 1
                }
              }, "저장")
            ),

            /* Actions Row: swatches completely removed, shows writer and tags side-by-side */
            /*#__PURE__*/React.createElement("div", {
              style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px', gap: '8px', flexWrap: 'wrap' }
            },
              /* Participant select box & tag badges list to its right */
              /*#__PURE__*/React.createElement("div", {
                style: { display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }
              },
                /* Participant selection capsule button (shared with memo edit + chat edit modal) */
                /*#__PURE__*/React.createElement(ParticipantPickerButton, {
                  participant: composerPart,
                  onClick: () => setIsComposerPartOpen(true)
                }),

                /* Active tag capsule badges (Responsive white background style: (#레시피 (✕))) */
                newTags.map(tag => /*#__PURE__*/React.createElement("span", {
                  key: tag,
                  style: {
                    display: 'inline-flex', alignItems: 'center', gap: '6px', borderRadius: 'var(--radius-full)',
                    padding: '3px 4px 3px 10px', fontSize: '0.72rem', fontWeight: 900, lineHeight: 1,
                    border: '1px solid var(--border-subtle)', color: 'var(--text-main)', background: 'var(--bg-primary)'
                  }
                }, `#${tag}`, /*#__PURE__*/React.createElement("button", {
                  type: "button",
                  title: `#${tag} 태그 삭제`,
                  onClick: e => {
                    e.stopPropagation();
                    setNewTags(prev => prev.filter(t => t !== tag));
                  },
                  style: {
                    width: '17px', height: '17px', border: 0, borderRadius: '50%',
                    background: 'var(--border-subtle)', color: 'var(--text-main)', display: 'inline-flex',
                    alignItems: 'center', justifyContent: 'center', padding: 0, cursor: 'pointer',
                    flexShrink: 0
                  }
                }, /*#__PURE__*/React.createElement(SmallXIcon, { size: 12 }))))
              ),

              /* Save & Close buttons formatted using DateModal styles */
              /*#__PURE__*/React.createElement("div", {
                style: { display: 'flex', gap: '8px', marginLeft: 'auto' }
              },
                /* Close without saving */
                /*#__PURE__*/React.createElement("button", {
                  type: "button",
                  className: "btn btn-secondary",
                  onClick: () => setIsComposerExpanded(false),
                  style: {
                    whiteSpace: 'nowrap',
                    cursor: 'pointer',
                    backgroundColor: 'transparent',
                    border: 'none'
                  }
                }, "닫기"),
                /* Save memo */
                /*#__PURE__*/React.createElement("button", {
                  type: "button",
                  className: "btn btn-primary",
                  onClick: handleSaveMemo,
                  disabled: newUploadProgress !== null,
                  style: {
                    padding: '10px 28px',
                    whiteSpace: 'nowrap',
                    cursor: 'pointer'
                  }
                }, newUploadProgress !== null ? `업로드 (${newUploadProgress.pct}%)` : "저장")
              )
            )
          )
      ),

      /* MEMOS SECTIONS (Pinned vs Normal) */
      
      /* 1. Pinned Memos Section */
      pinnedMemos.length > 0 && /*#__PURE__*/React.createElement("div", {
        style: { display: 'flex', flexDirection: 'column', gap: '8px' }
      },
        /* Label */
        /*#__PURE__*/React.createElement("div", {
          style: { fontSize: '0.72rem', fontWeight: 'bold', color: '#64748B', letterSpacing: '0.05em', textTransform: 'uppercase' }
        }, "고정됨"),
        /* Grid */
        /*#__PURE__*/React.createElement("div", {
          style: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '12px'
          }
        }, pinnedMemos.map(memo => /*#__PURE__*/React.createElement(MemoCard, {
          key: memo.id,
          memo: memo,
          calendar: calendar,
          onOpenEdit: handleOpenEdit,
          onTogglePin: () => handleTogglePin(memo),
          onShare: () => setSharingMemo(memo),
          onSelectTag: (tag) => { setSelectedTag(tag); setIsSearchOpen(true); },
          onCommentsChange: (nextComments) => handleMemoCommentsChange(memo, nextComments),
          getBorderColor: getBorderColor,
          onRequestConfirm: onRequestConfirm,
          showToast: showToast
        })))
      ),

      /* 2. Other Memos Section */
      otherMemos.length > 0 && /*#__PURE__*/React.createElement("div", {
        style: { display: 'flex', flexDirection: 'column', gap: '8px', marginTop: pinnedMemos.length > 0 ? '12px' : '0' }
      },
        /* Label */
        pinnedMemos.length > 0 && /*#__PURE__*/React.createElement("div", {
          style: { fontSize: '0.72rem', fontWeight: 'bold', color: '#64748B', letterSpacing: '0.05em', textTransform: 'uppercase' }
        }, "메모 목록"),
        /* Grid */
        /*#__PURE__*/React.createElement("div", {
          style: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '12px'
          }
        }, otherMemos.map(memo => /*#__PURE__*/React.createElement(MemoCard, {
          key: memo.id,
          memo: memo,
          calendar: calendar,
          onOpenEdit: handleOpenEdit,
          onTogglePin: () => handleTogglePin(memo),
          onShare: () => setSharingMemo(memo),
          onSelectTag: (tag) => { setSelectedTag(tag); setIsSearchOpen(true); },
          onCommentsChange: (nextComments) => handleMemoCommentsChange(memo, nextComments),
          getBorderColor: getBorderColor,
          onRequestConfirm: onRequestConfirm,
          showToast: showToast
        })))
      ),

      /* "메모 더 보기" -- memos load newest-first in pages rather than all at once, so this
         fetches the next page of older memos (mirrors chat room's "이전 채팅 더보기"). Pinned
         memos are always fully loaded regardless of this button, so pinning an old memo never
         depends on paging back to it first. */
      hasMoreMemos && /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: onLoadMoreMemos,
        style: {
          width: '100%',
          backgroundColor: 'var(--bg-primary)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '8px',
          padding: '10px 0',
          fontSize: '0.85rem',
          fontWeight: 'bold',
          color: 'var(--text-main)',
          cursor: 'pointer',
          textAlign: 'center',
          marginTop: '4px'
        }
      }, "메모 더 보기"),

      /* Empty State */
      filteredMemos.length === 0 && /*#__PURE__*/React.createElement("div", {
        style: { padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.88rem' }
      }, "등록된 메모가 없거나 검색 조건과 일치하는 메모가 없습니다. 📝")
    ),

    /* Memo Editor Modal Overlay */
    editingMemo && /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)',
        zIndex: 10000,
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
      }
    },
      /* Modal Container */
      /*#__PURE__*/React.createElement(ResizableModalContainer, {
        style: {
          width: '100%', maxWidth: '520px',
          backgroundColor: editColor,
          border: '1px solid ' + getBorderColor(editColor),
          borderRadius: '12px',
          boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
          display: 'flex', flexDirection: 'column', gap: '12px',
          padding: '16px', boxSizing: 'border-box',
          animation: 'modalFadeIn 0.2s ease'
        }
      },
        /* Header: Title & Pin */
        /*#__PURE__*/React.createElement("div", {
          style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }
        },
          /* Title input - Styled precisely as user requested */
          /*#__PURE__*/React.createElement("input", {
            type: "text",
            placeholder: "제목",
            value: editTitle,
            onChange: e => setEditTitle(e.target.value),
            style: {
              padding: '8px 8px',
              background: 'transparent',
              borderWidth: 'medium',
              borderStyle: 'none',
              borderColor: 'currentcolor',
              borderImage: 'none',
              outline: 'none',
              fontSize: '0.95rem',
              fontWeight: 'bold',
              color: 'var(--text-main)',
              width: '100%',
              borderBottom: '1px solid var(--border-subtle)',
              boxSizing: 'border-box'
            }
          }),
          /* Share button in Memo edit popup */
          /*#__PURE__*/React.createElement("button", {
            type: "button",
            onClick: () => setSharingMemo(editingMemo),
            title: "메모 공유",
            style: { background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', padding: '4px', marginRight: '6px' }
          }, /*#__PURE__*/React.createElement("svg", {
            xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round"
          }, /*#__PURE__*/React.createElement("path", { d: "M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" }), /*#__PURE__*/React.createElement("polyline", { points: "16 6 12 2 8 6" }), /*#__PURE__*/React.createElement("line", { x1: "12", y1: "2", x2: "12", y2: "15" }))),
          /* Pin Toggle button (Custom pin SVGs for ON/OFF) */
          /*#__PURE__*/React.createElement("button", {
            type: "button",
            onClick: () => setEditIsPinned(!editIsPinned),
            style: { background: 'none', border: 'none', cursor: 'pointer', color: editIsPinned ? '#F59E0B' : '#94A3B8', padding: '4px' }
          }, editIsPinned ? 
            /*#__PURE__*/React.createElement("svg", {
              xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "currentColor", className: "icon icon-tabler icon-tabler-filled icon-tabler-pin"
            }, /*#__PURE__*/React.createElement("path", { stroke: "none", d: "M0 0h24v24H0z", fill: "none" }), /*#__PURE__*/React.createElement("path", { d: "M15.113 3.21l.094 .083l5.5 5.5a1 1 0 0 1 -1.175 1.59l-3.172 3.171l-1.424 3.797a1 1 0 0 1 -.158 .277l-.07 .08l-1.5 1.5a1 1 0 0 1 -1.32 .082l-.095 -.083l-2.793 -2.792l-3.793 3.792a1 1 0 0 1 -1.497 -1.32l.083 -.094l3.792 -3.793l-2.792 -2.793a1 1 0 0 1 -.083 -1.32l.083 -.094l1.5 -1.5a1 1 0 0 1 .258 -.187l.098 -.042l3.796 -1.425l3.171 -3.17a1 1 0 0 1 1.497 -1.26z" }))
          :
            /*#__PURE__*/React.createElement("svg", {
              xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: "icon icon-tabler icons-tabler-outline icon-tabler-pin"
            }, /*#__PURE__*/React.createElement("path", { stroke: "none", d: "M0 0h24v24H0z", fill: "none" }), /*#__PURE__*/React.createElement("path", { d: "M15 4.5l-4 4l-4 1.5l-1.5 1.5l7 7l1.5 -1.5l1.5 -4l4 -4" }), /*#__PURE__*/React.createElement("path", { d: "M9 15l-4.5 4.5" }), /*#__PURE__*/React.createElement("path", { d: "M14.5 4l5.5 5.5" }))
          )
        ),

        /* Textarea wrapped relatively with bottom-right emoji & file picker icons - Styled precisely as user requested */
        /*#__PURE__*/React.createElement("div", {
          style: { position: 'relative', width: '100%' }
        },
          /* Body Textarea */
          /*#__PURE__*/React.createElement("textarea", {
            ref: editMemoTextareaRef,
            placeholder: "메모 입력...",
            value: editText,
            onChange: e => { setEditText(e.target.value); autoGrowTextarea(e.target, 480); },
            rows: "6",
            style: {
              padding: '8px 4px',
              background: 'transparent',
              borderWidth: 'medium',
              borderStyle: 'none',
              borderColor: 'currentcolor',
              borderImage: 'none',
              outline: 'none',
              resize: 'none',
              fontSize: '0.88rem',
              color: 'var(--text-main)',
              width: '100%',
              paddingBottom: '28px',
              fontFamily: 'inherit',
              boxSizing: 'border-box'
            }
          }),
          /* Bottom-right emoji/photo buttons wrapper */
          /*#__PURE__*/React.createElement("div", {
            style: {
              position: 'absolute',
              right: '4px',
              bottom: '4px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              zIndex: 2
            }
          },
            /* Emoji picker trigger */
            /*#__PURE__*/React.createElement("button", {
              type: "button",
              onClick: () => setIsEditEmojiOpen(true),
              style: { background: 'none', border: 'none', padding: '4px', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' },
              title: "이모티콘 추가"
            }, /*#__PURE__*/React.createElement(EmojiPickerIcon, null)),
            
            /* File Upload label icon */
            /*#__PURE__*/React.createElement("label", {
              style: { display: 'flex', alignItems: 'center', cursor: 'pointer', color: '#64748B', padding: '4px' },
              title: "사진 추가"
            }, 
              /*#__PURE__*/React.createElement("input", {
                type: "file",
                multiple: true,
                accept: "image/*",
                onChange: handleEditFileSelect,
                style: { display: 'none' }
              }),
              /*#__PURE__*/React.createElement("svg", {
                xmlns: "http://www.w3.org/2000/svg", width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2"
              }, /*#__PURE__*/React.createElement("rect", { width: "18", height: "18", x: "3", y: "3", rx: "2", ry: "2" }), /*#__PURE__*/React.createElement("circle", { cx: "9", cy: "9", r: "2" }), /*#__PURE__*/React.createElement("path", { d: "m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" }))
            )
          )
        ),

        /* Links Card Preview inside edit modal */
        extractFirstUrl(editText) && (() => {
          const url = extractFirstUrl(editText);
          const oldUrl = extractFirstUrl(editingMemo?.text);
          const cachedData = (oldUrl === url) ? editingMemo?.linkPreview : null;
          return /*#__PURE__*/React.createElement("div", {
            style: { marginTop: '4px', marginBottom: '4px' }
          }, /*#__PURE__*/React.createElement(LinkPreviewCard, { url: url, cachedData: cachedData }));
        })(),

        /* Images previews list */
        editImages.length > 0 && /*#__PURE__*/React.createElement("div", {
          style: { display: 'flex', flexWrap: 'wrap', gap: '6px', margin: '4px 0' }
        }, editImages.map((img, idx) => /*#__PURE__*/React.createElement("div", {
          key: idx,
          style: { position: 'relative', width: '60px', height: '60px' }
        }, 
          /* Image element */
          /*#__PURE__*/React.createElement("img", {
            src: img.thumbnail,
            style: { width: '100%', height: '100%', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--border-subtle)' }
          }),
          /* Remove button (shared with chat's attachment thumbnail) */
          /*#__PURE__*/React.createElement(ImageThumbRemoveButton, {
            onClick: () => removeEditImage(idx)
          })
        ))),

        /* Tag Input Module (migrated directly from Lightbox component, white background responsive, IME composition protected) */
        /*#__PURE__*/React.createElement("div", {
          style: { display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }
        },
          /*#__PURE__*/React.createElement("span", {
            style: { fontSize: '0.74rem', fontWeight: 800, color: 'var(--text-muted)', flexShrink: 0 }
          }, "태그입력"),
          /*#__PURE__*/React.createElement("input", {
            type: "text",
            placeholder: editTags.length >= 10 ? "태그 최대 10개 도달" : `태그 입력 (${editTags.length}/10)`,
            value: editTagInput,
            onChange: e => setEditTagInput(e.target.value),
            onKeyDown: e => {
              if (e.nativeEvent.isComposing) return;
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddEditTag();
              }
            },
            maxLength: 100,
            style: {
              flex: 1, minWidth: 0, height: '28px', padding: '0 8px', borderRadius: '6px',
              border: '1px solid var(--border-subtle)', background: 'var(--bg-primary)',
              color: 'var(--text-main)', fontSize: '0.74rem'
            }
          }),
          /*#__PURE__*/React.createElement("button", {
            type: "button",
            onClick: handleAddEditTag,
            disabled: editTags.length >= 10,
            style: {
              flexShrink: 0, height: '28px', padding: '0 10px', borderRadius: '6px',
              border: '1px solid var(--border-subtle)', background: 'var(--border-subtle)',
              color: 'var(--text-main)', fontSize: '0.72rem', fontWeight: 800, cursor: 'pointer',
              opacity: editTags.length >= 10 ? 0.45 : 1
            }
          }, "저장")
        ),

        /* Footer Controls: Participant button and Tag Badges row (Swatches dot menu removed completely) */
        /*#__PURE__*/React.createElement("div", {
          style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px', gap: '8px', flexWrap: 'wrap' }
        },
          /* Participant select box & tag badges list to its right */
          /*#__PURE__*/React.createElement("div", {
            style: { display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }
          },
            /* Participant selection capsule button (shared with memo composer + chat edit modal) */
            /*#__PURE__*/React.createElement(ParticipantPickerButton, {
              participant: editPart,
              onClick: () => setIsEditPartOpen(true)
            }),

            /* Active tag capsule badges (Responsive white background style: (#레시피 (✕))) */
            editTags.map(tag => /*#__PURE__*/React.createElement("span", {
              key: tag,
              style: {
                display: 'inline-flex', alignItems: 'center', gap: '6px', borderRadius: 'var(--radius-full)',
                padding: '3px 4px 3px 10px', fontSize: '0.72rem', fontWeight: 900, lineHeight: 1,
                border: '1px solid var(--border-subtle)', color: 'var(--text-main)', background: 'var(--bg-primary)'
              }
            }, `#${tag}`, /*#__PURE__*/React.createElement("button", {
              type: "button",
              title: `#${tag} 태그 삭제`,
              onClick: async e => {
                e.stopPropagation();
                const nextTags = editTags.filter(t => t !== tag);
                if (editingMemo) {
                  try {
                    const calendarId = calendar.id;
                    const tagsArray = nextTags.map(t => t.startsWith('#') ? t : '#' + t);
                    await firebaseDb.collection('calendars').doc('cal_' + calendarId).collection('memos').doc(editingMemo.id).update({
                      tags: tagsArray
                    });
                  } catch (err) {
                    console.error('Failed to delete tag in Firestore:', err);
                    showToast('태그 삭제 실패', 'error');
                  }
                }
                setEditTags(nextTags);
              },
              style: {
                width: '17px', height: '17px', border: 0, borderRadius: '50%',
                background: 'var(--border-subtle)', color: 'var(--text-main)', display: 'inline-flex',
                alignItems: 'center', justifyContent: 'center', padding: 0, cursor: 'pointer',
                flexShrink: 0
              }
            }, /*#__PURE__*/React.createElement(SmallXIcon, { size: 12 }))))
          ),

          /* Save / Delete / Cancel Actions using DateModal layout styles */
          /*#__PURE__*/React.createElement("div", {
            style: { display: 'flex', gap: '8px', width: '100%', justifyContent: 'flex-end', marginTop: '6px' }
          },
            /* Delete Memo Button (Pushed to the far left) */
            /*#__PURE__*/React.createElement("button", {
              type: "button",
              className: "btn btn-danger",
              onClick: () => handleDeleteMemo(editingMemo),
              style: {
                whiteSpace: 'nowrap',
                cursor: 'pointer',
                padding: '10px 20px',
                marginRight: 'auto' // Align delete button to the left
              }
            }, "삭제"),
            
            /* Cancel */
            /*#__PURE__*/React.createElement("button", {
              type: "button",
              className: "btn btn-secondary",
              onClick: () => setEditingMemo(null),
              style: {
                whiteSpace: 'nowrap',
                cursor: 'pointer',
                backgroundColor: 'transparent',
                border: 'none'
              }
            }, "닫기"),
            
            /* Update */
            /*#__PURE__*/React.createElement("button", {
              type: "button",
              className: "btn btn-primary",
              onClick: handleUpdateMemo,
              disabled: editUploadProgress !== null,
              style: {
                padding: '10px 28px',
                whiteSpace: 'nowrap',
                cursor: 'pointer'
              }
            }, editUploadProgress !== null ? `업로드 (${editUploadProgress.pct}%)` : "저장")
          )
        )
      )
    )),

    /* Emoji Picker Overlay & Bottom Sheets for selector sheets */
    isComposerEmojiOpen && /*#__PURE__*/React.createElement(EmojiPickerSheet, {
      onSelect: (emoji) => {
        setNewText(prev => prev + emoji);
        setIsComposerEmojiOpen(false);
      },
      onClose: () => setIsComposerEmojiOpen(false)
    }),
    isEditEmojiOpen && /*#__PURE__*/React.createElement(EmojiPickerSheet, {
      onSelect: (emoji) => {
        setEditText(prev => prev + emoji);
        setIsEditEmojiOpen(false);
      },
      onClose: () => setIsEditEmojiOpen(false)
    }),

    isComposerPartOpen && /*#__PURE__*/React.createElement(ChatParticipantSheet, {
      calendar: calendar,
      selectedId: composerParticipantId,
      onSelect: id => {
        setComposerParticipantId(id);
        setIsComposerPartOpen(false);
      },
      onClose: () => setIsComposerPartOpen(false)
    }),
    isEditPartOpen && /*#__PURE__*/React.createElement(ChatParticipantSheet, {
      calendar: calendar,
      selectedId: editParticipantId,
      onSelect: id => {
        setEditParticipantId(id);
        setIsEditPartOpen(false);
      },
      onClose: () => setIsEditPartOpen(false)
    }),

    imageProcessingNew && /*#__PURE__*/React.createElement(ImageProcessingOverlay, imageProcessingNew),
    newUploadProgress && /*#__PURE__*/React.createElement(ImageUploadOverlay, newUploadProgress),
    imageProcessingEdit && /*#__PURE__*/React.createElement(ImageProcessingOverlay, imageProcessingEdit),
    linkPreviewProgressState && /*#__PURE__*/React.createElement(LinkPreviewProgressOverlay, { progress: linkPreviewProgressState.pct, remainingSec: linkPreviewProgressState.remainingSec }),
    isGalleryOpen && /*#__PURE__*/React.createElement(ChatGalleryModal, { chatMessages, onClose: () => setIsGalleryOpen(false), setActiveLightbox }),
    editUploadProgress && /*#__PURE__*/React.createElement(ImageUploadOverlay, editUploadProgress),

    sharingMemo && /*#__PURE__*/React.createElement(MemoShareModal, {
      memo: sharingMemo,
      calendarId: calendar.id,
      onClose: () => setSharingMemo(null),
      showToast: showToast
    })
  );
}

  if (typeof window !== 'undefined') {
  window.GATHER_UI_COMPONENTS = Object.assign({}, window.GATHER_UI_COMPONENTS || {}, {
    MemoView: MemoView,
  });
}
