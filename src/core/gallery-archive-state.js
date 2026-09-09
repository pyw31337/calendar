export function useGalleryArchiveState({
  React,
  activeCalId,
  activeView,
  isGlobalSearchOpen,
  firebaseDb,
  firebaseConnectionVersion,
  allChatMessages,
  galleryPreviewMessages,
  memos,
  fetchAllChatMessagesRest,
  fetchCalendarSearchIndex
}) {
  const [fullChatHistoryByCalendar, setFullChatHistoryByCalendar] = React.useState({});
  const [fullGalleryMemosByCalendar, setFullGalleryMemosByCalendar] = React.useState({});
  const fullChatMessages = fullChatHistoryByCalendar[activeCalId] || null;
  const displayChatMessages = React.useMemo(() => {
    if (!Array.isArray(fullChatMessages)) return allChatMessages;
    const byId = new Map(fullChatMessages.filter(message => message?.id).map(message => [message.id, message]));
    allChatMessages.forEach(message => { if (message?.id) byId.set(message.id, message); });
    return Array.from(byId.values()).sort((a, b) => Number(a.timestamp || 0) - Number(b.timestamp || 0));
  }, [allChatMessages, fullChatMessages]);
  const galleryChatMessages = React.useMemo(() => {
    const byId = new Map();
    (galleryPreviewMessages || []).forEach(message => { if (message?.id) byId.set(message.id, message); });
    displayChatMessages.forEach(message => { if (message?.id) byId.set(message.id, message); });
    return Array.from(byId.values()).sort((a, b) => Number(a.timestamp || 0) - Number(b.timestamp || 0));
  }, [displayChatMessages, galleryPreviewMessages]);
  const galleryMemos = React.useMemo(() => {
    const archived = fullGalleryMemosByCalendar[activeCalId];
    if (!Array.isArray(archived)) return memos;
    const byId = new Map(archived.filter(memo => memo?.id).map(memo => [memo.id, memo]));
    (memos || []).forEach(memo => { if (memo?.id) byId.set(memo.id, memo); });
    return Array.from(byId.values()).sort((a, b) =>
      Number(b.createdAt || b.updatedAt || 0) - Number(a.createdAt || a.updatedAt || 0)
    );
  }, [activeCalId, fullGalleryMemosByCalendar, memos]);

  React.useEffect(() => {
    if (!activeCalId || (!isGlobalSearchOpen && activeView !== 'history' && activeView !== 'gallery')) return;
    const hasFullChat = Object.prototype.hasOwnProperty.call(fullChatHistoryByCalendar, activeCalId);
    const hasFullGalleryMemos = Object.prototype.hasOwnProperty.call(fullGalleryMemosByCalendar, activeCalId);
    if (activeView === 'gallery' ? (hasFullChat && hasFullGalleryMemos) : hasFullChat) return;
    let cancelled = false;
    if (activeView === 'gallery') {
      fetchCalendarSearchIndex(activeCalId).then(index => {
        if (cancelled) return;
        setFullChatHistoryByCalendar(previous => ({ ...previous, [activeCalId]: Array.isArray(index?.chatMessages) ? index.chatMessages : [] }));
        setFullGalleryMemosByCalendar(previous => ({ ...previous, [activeCalId]: Array.isArray(index?.memos) ? index.memos : [] }));
      }).catch(error => {
        console.warn('full paged gallery archive load failed:', error);
        if (!cancelled) {
          setFullChatHistoryByCalendar(previous => ({ ...previous, [activeCalId]: [] }));
          setFullGalleryMemosByCalendar(previous => ({ ...previous, [activeCalId]: [] }));
        }
      });
    } else {
      fetchAllChatMessagesRest(activeCalId).then(list => {
        if (!cancelled) setFullChatHistoryByCalendar(previous => ({ ...previous, [activeCalId]: Array.isArray(list) ? list : [] }));
      }).catch(error => console.warn('full paged chat history load failed:', error));
    }
    return () => { cancelled = true; };
  }, [activeCalId, isGlobalSearchOpen, activeView, firebaseDb, firebaseConnectionVersion, fullChatHistoryByCalendar, fullGalleryMemosByCalendar, fetchAllChatMessagesRest, fetchCalendarSearchIndex]);

  const patchGalleryArchiveMessage = React.useCallback((messageId, patch) => {
    if (!activeCalId || !messageId || !patch || typeof patch !== 'object') return;
    setFullChatHistoryByCalendar(previous => {
      const list = Array.isArray(previous[activeCalId]) ? previous[activeCalId] : null;
      // No archive yet (still loading / not on gallery): nothing to patch; live windows cover it.
      if (!list) return previous;
      const idx = list.findIndex(message => message?.id === messageId);
      if (idx >= 0) {
        const next = list.slice();
        next[idx] = { ...next[idx], ...patch, id: messageId };
        return { ...previous, [activeCalId]: next };
      }
      // Verified tag save fetched a message that was absent from the search-index snapshot —
      // upsert so gallery lightbox reopen can read imageTags without depending on photoIndex CF.
      return { ...previous, [activeCalId]: [...list, { ...patch, id: messageId }] };
    });
  }, [activeCalId]);

  const patchGalleryArchiveMemo = React.useCallback((memoId, patch) => {
    if (!activeCalId || !memoId || !patch || typeof patch !== 'object') return;
    setFullGalleryMemosByCalendar(previous => {
      const list = Array.isArray(previous[activeCalId]) ? previous[activeCalId] : null;
      if (!list) return previous;
      const idx = list.findIndex(memo => memo?.id === memoId);
      if (idx >= 0) {
        const next = list.slice();
        next[idx] = { ...next[idx], ...patch, id: memoId };
        return { ...previous, [activeCalId]: next };
      }
      return { ...previous, [activeCalId]: [{ ...patch, id: memoId }, ...list] };
    });
  }, [activeCalId]);

  return {
    fullChatMessages,
    displayChatMessages,
    galleryChatMessages,
    galleryMemos,
    patchGalleryArchiveMessage,
    patchGalleryArchiveMemo
  };
}
