function mergeArchiveDocsById(incoming, pendingById) {
  const incomingList = Array.isArray(incoming) ? incoming : [];
  const pending = pendingById && typeof pendingById === 'object' ? pendingById : null;
  if (!pending || Object.keys(pending).length === 0) return incomingList;
  const byId = new Map();
  incomingList.forEach(doc => { if (doc?.id) byId.set(doc.id, doc); });
  Object.keys(pending).forEach(id => {
    const patch = pending[id];
    if (!patch || typeof patch !== 'object') return;
    const server = byId.get(id);
    if (!server) {
      byId.set(id, { ...patch, id });
      return;
    }
    const merged = { ...server, ...patch, id };
    // Verified patch imageTags (including intentional '') beat a stale search-index page.
    if (Array.isArray(patch.imageTags)) merged.imageTags = patch.imageTags.slice();
    if (patch.directMediaTags && typeof patch.directMediaTags === 'object') {
      merged.directMediaTags = { ...(server.directMediaTags || {}), ...patch.directMediaTags };
    }
    byId.set(id, merged);
  });
  return Array.from(byId.values());
}

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
  // Verified tag saves that land before the search-index archive finishes loading. Applied when
  // the snapshot arrives so reopen can read imageTags without waiting on photoIndex CF.
  const pendingArchiveMessagePatchesRef = React.useRef({});
  const pendingArchiveMemoPatchesRef = React.useRef({});
  const fullChatMessages = fullChatHistoryByCalendar[activeCalId] || null;
  const displayChatMessages = React.useMemo(() => {
    if (!Array.isArray(fullChatMessages)) return allChatMessages;
    const byId = new Map(fullChatMessages.filter(message => message?.id).map(message => [message.id, message]));
    allChatMessages.forEach(message => {
      if (!message?.id) return;
      const previous = byId.get(message.id);
      if (!previous) {
        byId.set(message.id, message);
        return;
      }
      // Live windows can briefly lag a verified tag write. Keep archive imageTags when the live
      // slot is still empty so gallery lightbox reopen does not flash blank tags.
      const merged = { ...previous, ...message };
      if (Array.isArray(previous.imageTags)) {
        if (!Array.isArray(message.imageTags)) {
          merged.imageTags = previous.imageTags;
        } else {
          const len = Math.max(previous.imageTags.length, message.imageTags.length);
          const next = [];
          for (let i = 0; i < len; i += 1) {
            const live = String(message.imageTags[i] || '');
            const archived = String(previous.imageTags[i] || '');
            next[i] = live || archived;
          }
          merged.imageTags = next;
        }
      }
      if (previous.directMediaTags && !message.directMediaTags) merged.directMediaTags = previous.directMediaTags;
      byId.set(message.id, merged);
    });
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
        const pendingMessages = pendingArchiveMessagePatchesRef.current[activeCalId] || {};
        const pendingMemos = pendingArchiveMemoPatchesRef.current[activeCalId] || {};
        setFullChatHistoryByCalendar(previous => ({
          ...previous,
          [activeCalId]: mergeArchiveDocsById(index?.chatMessages, pendingMessages)
        }));
        setFullGalleryMemosByCalendar(previous => ({
          ...previous,
          [activeCalId]: mergeArchiveDocsById(index?.memos, pendingMemos)
        }));
        pendingArchiveMessagePatchesRef.current = { ...pendingArchiveMessagePatchesRef.current, [activeCalId]: {} };
        pendingArchiveMemoPatchesRef.current = { ...pendingArchiveMemoPatchesRef.current, [activeCalId]: {} };
      }).catch(error => {
        console.warn('full paged gallery archive load failed:', error);
        if (!cancelled) {
          setFullChatHistoryByCalendar(previous => ({ ...previous, [activeCalId]: [] }));
          setFullGalleryMemosByCalendar(previous => ({ ...previous, [activeCalId]: [] }));
        }
      });
    } else {
      fetchAllChatMessagesRest(activeCalId).then(list => {
        if (!cancelled) {
          const pendingMessages = pendingArchiveMessagePatchesRef.current[activeCalId] || {};
          setFullChatHistoryByCalendar(previous => ({
            ...previous,
            [activeCalId]: mergeArchiveDocsById(list, pendingMessages)
          }));
          pendingArchiveMessagePatchesRef.current = { ...pendingArchiveMessagePatchesRef.current, [activeCalId]: {} };
        }
      }).catch(error => console.warn('full paged chat history load failed:', error));
    }
    return () => { cancelled = true; };
  }, [activeCalId, isGlobalSearchOpen, activeView, firebaseDb, firebaseConnectionVersion, fullChatHistoryByCalendar, fullGalleryMemosByCalendar, fetchAllChatMessagesRest, fetchCalendarSearchIndex]);

  const patchGalleryArchiveMessage = React.useCallback((messageId, patch) => {
    if (!activeCalId || !messageId || !patch || typeof patch !== 'object') return;
    setFullChatHistoryByCalendar(previous => {
      const list = Array.isArray(previous[activeCalId]) ? previous[activeCalId] : null;
      // No archive yet (still loading / not on gallery): queue until search-index arrives.
      if (!list) {
        const bucket = { ...(pendingArchiveMessagePatchesRef.current[activeCalId] || {}) };
        bucket[messageId] = { ...(bucket[messageId] || {}), ...patch, id: messageId };
        pendingArchiveMessagePatchesRef.current = {
          ...pendingArchiveMessagePatchesRef.current,
          [activeCalId]: bucket
        };
        return previous;
      }
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
      if (!list) {
        const bucket = { ...(pendingArchiveMemoPatchesRef.current[activeCalId] || {}) };
        bucket[memoId] = { ...(bucket[memoId] || {}), ...patch, id: memoId };
        pendingArchiveMemoPatchesRef.current = {
          ...pendingArchiveMemoPatchesRef.current,
          [activeCalId]: bucket
        };
        return previous;
      }
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
