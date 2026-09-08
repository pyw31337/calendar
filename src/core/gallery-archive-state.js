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

  return { fullChatMessages, displayChatMessages, galleryChatMessages, galleryMemos };
}
