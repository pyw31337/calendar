/**
 * Chat / gallery modal (P4-13)
 */
(function () {
function ChatGalleryModal({
  chatMessages,
  memos = [],
  calendar = null,
  asPage = false,
  onClose,
  setActiveLightbox,
  hasMoreOlderChat = false,
  loadingOlderChat = false,
  onLoadOlderChat = null,
  hasMoreMemos = false,
  onLoadMoreMemos = null,
  totalGalleryCount = 0
}) {
  const React = window.React;
  const __deps = window.GATHER_UI_DEPS || {};
  const __comp = window.GATHER_UI_COMPONENTS || {};
  const ResizableModalContainer = __deps.ResizableModalContainer;
  const SmallXIcon = __deps.SmallXIcon;
  const BackArrowIcon = __deps.BackArrowIcon;
  const InlineSearchBar = __comp.InlineSearchBar || __deps.InlineSearchBar;
  const LinkPreviewCard = __deps.LinkPreviewCard || __comp.LinkPreviewCard;
  const getMessageImageEntries = __deps.getMessageImageEntries;
  const getMessageDirectMediaEntry = __deps.getMessageDirectMediaEntry;
  const extractFirstUrl = __deps.extractFirstUrl;
  const removeFirstUrl = __deps.removeFirstUrl;
  const formatChatHeaderTitle = __deps.formatChatHeaderTitle;
  const useScrollHideHeader = __deps.useScrollHideHeader;

  const [activeTab, setActiveTab] = React.useState('photos'); // 'photos' | 'links'
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);
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
    const list = [];
    const seen = new Set();
    (chatMessages || []).forEach(msg => {
      if (!msg.text) return;
      const url = extractFirstUrl(msg.text);
      if (url && !seen.has(url)) {
        seen.add(url);
        list.push({ url, timestamp: msg.timestamp, messageId: msg.id, text: msg.text, linkPreview: msg.linkPreview, source: 'chat' });
      }
    });
    (memos || []).forEach(memo => {
      const body = memo?.text || memo?.content || memo?.body || '';
      if (!body) return;
      const url = extractFirstUrl(body);
      if (url && !seen.has(url)) {
        seen.add(url);
        list.push({ url, timestamp: memo.updatedAt || memo.createdAt || 0, messageId: memo.id, text: body, linkPreview: memo.linkPreview || null, source: 'memo' });
      }
    });
    return list.sort((a, b) => b.timestamp - a.timestamp);
  }, [chatMessages, memos]);

  const sharedPhotos = React.useMemo(() => {
    const list = [];
    (chatMessages || []).forEach(msg => {
      const directEntry = getMessageDirectMediaEntry(msg);
      const entries = directEntry ? [...getMessageImageEntries(msg), directEntry] : getMessageImageEntries(msg);
      entries.forEach(entry => {
        list.push({ ...entry, text: msg.text || '', participantId: msg.participantId || '', source: 'chat' });
      });
    });
    (memos || []).forEach(memo => {
      const asMsg = {
        id: memo.id, text: memo.text || memo.content || memo.body || '',
        imageUrl: memo.imageUrl, imageUrls: memo.imageUrls, thumbUrl: memo.thumbUrl, thumbUrls: memo.thumbUrls,
        timestamp: memo.updatedAt || memo.createdAt || 0, participantId: memo.participantId || ''
      };
      const directEntry = getMessageDirectMediaEntry(asMsg);
      const entries = directEntry ? [...getMessageImageEntries(asMsg), directEntry] : getMessageImageEntries(asMsg);
      entries.forEach(entry => {
        list.push({ ...entry, text: asMsg.text || '', participantId: asMsg.participantId || '', source: 'memo' });
      });
    });
    return list.sort((a, b) => b.timestamp - a.timestamp);
  }, [chatMessages, memos]);

  const filteredLinks = React.useMemo(() => {
    if (!searchQuery.trim()) return sharedLinks;
    const q = searchQuery.toLowerCase().trim();
    const qNoHash = q.replace(/^#/, '');
    return sharedLinks.filter(item => {
      const matchText = (item.text || '').toLowerCase().includes(q) || (item.text || '').toLowerCase().includes(qNoHash);
      const matchUrl = (item.url || '').toLowerCase().includes(q) || (item.url || '').toLowerCase().includes(qNoHash);
      const matchTitle = (item.linkPreview?.title || '').toLowerCase().includes(q) || (item.linkPreview?.title || '').toLowerCase().includes(qNoHash);
      const matchDesc = (item.linkPreview?.description || '').toLowerCase().includes(q) || (item.linkPreview?.description || '').toLowerCase().includes(qNoHash);
      return matchText || matchUrl || matchTitle || matchDesc;
    });
  }, [sharedLinks, searchQuery]);

  const filteredPhotos = React.useMemo(() => {
    if (!searchQuery.trim()) return sharedPhotos;
    const q = searchQuery.toLowerCase().trim();
    const qNoHash = q.replace(/^#/, '');
    return sharedPhotos.filter(item => {
      // tags is stored as a space-separated string (e.g. "#영우생일 #말복"), not an array
      const tagsRaw = Array.isArray(item.tags) ? item.tags.join(' ') : String(item.tags || '');
      const tagsLower = tagsRaw.toLowerCase();
      const matchTags = tagsLower.includes(q) || tagsLower.includes(qNoHash) || tagsLower.replace(/#/g, '').includes(qNoHash);
      const matchText = (item.text || '').toLowerCase().includes(q) || (item.text || '').toLowerCase().includes(qNoHash);
      return matchTags || matchText;
    });
  }, [sharedPhotos, searchQuery]);

  // Search must scan the full history: drain older chat pages (and memo pages) while a query is active.
  React.useEffect(() => {
    if (!searchQuery.trim()) return;
    if (typeof onLoadOlderChat === 'function' && hasMoreOlderChat && !loadingOlderChat) {
      onLoadOlderChat();
    }
    if (typeof onLoadMoreMemos === 'function' && hasMoreMemos) {
      onLoadMoreMemos();
    }
  }, [searchQuery, hasMoreOlderChat, loadingOlderChat, hasMoreMemos, (chatMessages || []).length, (memos || []).length]);

  React.useEffect(() => {
    if (!asPage || (searchQuery || '').trim()) return;
    if (typeof onLoadOlderChat !== 'function' || !hasMoreOlderChat || loadingOlderChat) return;
    if ((sharedPhotos || []).length >= 60) return;
    onLoadOlderChat();
  }, [asPage, searchQuery, hasMoreOlderChat, loadingOlderChat, (sharedPhotos || []).length, (chatMessages || []).length]);

  const displayPhotoTabCount = (typeof totalGalleryCount === 'number' && totalGalleryCount > (sharedPhotos || []).length)
    ? totalGalleryCount
    : (sharedPhotos || []).length;

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
    position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1010, overflow: 'hidden', flexShrink: 0,
    backgroundColor: 'var(--bg-card)',
    transition: 'transform 0.3s ease',
    transform: isHeaderVisible ? 'translateY(0)' : 'translateY(-100%)'
  } : {
    padding: '16px 20px 12px 20px', borderBottom: '1px solid var(--border-subtle)',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    position: 'relative', overflow: 'hidden'
  };

  return /*#__PURE__*/React.createElement("div", {
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
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748B', flexShrink: 0
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
          /*#__PURE__*/React.createElement("button", {
            type: "button",
            onClick: () => setIsSearchOpen(prev => { if (prev) setSearchQuery(''); return !prev; }),
            title: "검색", "aria-label": "갤러리 검색",
            style: {
              background: 'none', border: 'none', cursor: 'pointer', padding: '6px',
              color: isSearchOpen ? 'var(--text-main)' : '#64748B',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
            }
          }, /*#__PURE__*/React.createElement("svg", {
            xmlns: "http://www.w3.org/2000/svg", width: "22", height: "22", viewBox: "0 0 24 24",
            fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round"
          }, /*#__PURE__*/React.createElement("circle", { cx: "11", cy: "11", r: "8" }), /*#__PURE__*/React.createElement("path", { d: "m21 21-4.3-4.3" })))
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
              xmlns: "http://www.w3.org/2000/svg", width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2.5"
            }, /*#__PURE__*/React.createElement("circle", { cx: "11", cy: "11", r: "8" }), /*#__PURE__*/React.createElement("path", { d: "m21 21-4.3-4.3" }))),
            /*#__PURE__*/React.createElement("button", {
              type: "button", className: "modal-close-btn", onClick: onClose, "aria-label": "닫기",
              style: { display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px', border: 0, background: 'none', cursor: 'pointer', color: 'var(--text-muted)' }
            }, /*#__PURE__*/React.createElement(SmallXIcon, { size: 20 }))
          )
        )
  ),
  isSearchOpen && /*#__PURE__*/React.createElement(InlineSearchBar, {
    value: searchQuery,
    placeholder: "사진·링크 통합 검색 (태그, 텍스트, URL)",
    onChange: e => setSearchQuery(e.target.value),
    fixed: !!asPage,
    style: asPage ? {
      borderBottom: 'none',
      boxShadow: 'none',
      transition: 'transform 0.3s ease',
      transform: isHeaderVisible ? 'translateY(0)' : 'translateY(-100%)'
    } : { borderBottom: '1px solid var(--border-subtle)' },
    trailing: /*#__PURE__*/React.createElement("button", {
      type: "button",
      onClick: () => { setIsSearchOpen(false); setSearchQuery(''); },
      style: { border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px 6px', fontSize: '0.8rem', fontWeight: 700, flexShrink: 0 }
    }, "닫기")
  }), /*#__PURE__*/React.createElement("div", {
    className: asPage ? "gallery-page-tabs" : undefined,
    style: {
      display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', padding: '12px 20px 8px 20px',
      borderBottom: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-primary)',
      flexShrink: 0,
      ...(asPage ? {
        position: 'fixed', top: isSearchOpen ? '104px' : '56px', left: 0, right: 0, zIndex: 1009,
        transition: 'transform 0.3s ease, top 0.3s ease',
        transform: isHeaderVisible ? 'translateY(0)' : 'translateY(calc(-100% - 56px))'
      } : {})
    }
  }, [['photos', '사진'], ['links', '링크']].map(tab => {
    const count = tab[0] === 'photos'
      ? ((searchQuery || '').trim() ? filteredPhotos.length : displayPhotoTabCount)
      : filteredLinks.length;
    return /*#__PURE__*/React.createElement("button", {
      key: tab[0],
      type: "button",
      onClick: () => setActiveTab(tab[0]),
      style: {
        border: 'none',
        borderRadius: '8px',
        padding: '8px 10px',
        background: activeTab === tab[0] ? 'var(--accent-primary)' : 'transparent',
        color: activeTab === tab[0] ? '#FFFFFF' : 'var(--text-muted)',
        fontWeight: 900,
        fontSize: '0.86rem',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px'
      }
    },
      tab[1],
      /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: '0.7rem',
          fontWeight: 800,
          padding: '1px 7px',
          borderRadius: '999px',
          backgroundColor: activeTab === tab[0] ? 'rgba(255,255,255,0.22)' : 'var(--border-subtle)',
          color: activeTab === tab[0] ? '#FFFFFF' : 'var(--text-muted)',
          minWidth: '18px',
          textAlign: 'center'
        }
      }, String(count))
    );
  })), /*#__PURE__*/React.createElement("div", {
    ref: gridHostRef,
    onScroll: asPage ? handleGalleryScroll : undefined,
    style: {
      flex: 1, overflowY: 'auto',
      padding: asPage
        ? ((isSearchOpen ? '168px' : '120px') + ' 20px 16px 20px')
        : '16px 20px',
      display: 'flex', flexDirection: 'column', gap: '12px', boxSizing: 'border-box',
      minWidth: 0
    }
  }, activeTab === 'links' ? (
    filteredLinks.length === 0 ? /*#__PURE__*/React.createElement("div", {
      style: { textAlign: 'center', color: 'var(--text-muted)', padding: '40px 0', fontSize: '0.88rem' }
    }, searchQuery ? "검색 결과가 없습니다." : "공유된 링크가 없습니다.") : filteredLinks.map(item => /*#__PURE__*/React.createElement("div", {
      key: item.messageId,
      style: { width: '100%' }
    }, /*#__PURE__*/React.createElement(LinkPreviewCard, { url: item.url, fallbackTitle: item.text ? removeFirstUrl(item.text).replace(/\n/g, ' ').replace(/\s+/g, ' ').trim() : '', cachedData: item.linkPreview })))
  ) : /*#__PURE__*/React.createElement(React.Fragment, null,
    filteredPhotos.length === 0 ? /*#__PURE__*/React.createElement("div", {
      style: { textAlign: 'center', color: 'var(--text-muted)', padding: '40px 0', fontSize: '0.88rem' }
    }, searchQuery
      ? "검색 결과가 없습니다."
      : ((hasMoreOlderChat || loadingOlderChat)
        ? "이전 사진을 불러오는 중…"
        : ((typeof totalGalleryCount === 'number' && totalGalleryCount > 0)
          ? "사진 데이터를 아직 불러오지 못했습니다. 아래 더보기를 눌러 주세요."
          : "공유된 사진이 없습니다.")))
    : /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))`,
        gap: '6px',
        width: '100%',
        alignContent: 'start'
      }
    }, filteredPhotos.map((photo, idx) => /*#__PURE__*/React.createElement("img", {
      key: `${photo.messageId}-${photo.directMediaUrl ? 'direct' : photo.imageIndex}`,
      src: (photo.thumb && String(photo.thumb)) || (photo.full && String(photo.full)) || '',
      alt: "공유사진",
      loading: "lazy",
      decoding: "async",
      referrerPolicy: 'no-referrer',
      onClick: () => setActiveLightbox && setActiveLightbox({
        urls: filteredPhotos.map(p => p.full),
        index: idx,
        meta: filteredPhotos.map(p => ({ timestamp: p.timestamp, messageId: p.messageId, imageIndex: p.imageIndex, thumb: p.thumb, tags: p.tags, directMediaUrl: p.directMediaUrl }))
      }),
      style: {
        width: '100%',
        maxWidth: '100%',
        aspectRatio: '1 / 1',
        objectFit: 'cover',
        borderRadius: '6px',
        cursor: 'pointer',
        backgroundColor: 'var(--bg-primary)',
        display: 'block'
      }
    }))),
    (hasMoreOlderChat || loadingOlderChat) && !(searchQuery || '').trim() && /*#__PURE__*/React.createElement("button", {
      type: "button",
      onClick: () => { if (typeof onLoadOlderChat === 'function' && !loadingOlderChat) onLoadOlderChat(); },
      disabled: !!loadingOlderChat,
      style: {
        width: '100%',
        marginTop: '4px',
        padding: '12px 0',
        border: 'none',
        borderRadius: '8px',
        backgroundColor: 'color-mix(in srgb, var(--bg-primary) 96%, black)',
        color: 'var(--text-main)',
        fontSize: '0.85rem',
        fontWeight: 700,
        cursor: loadingOlderChat ? 'wait' : 'pointer',
        textAlign: 'center'
      }
    }, loadingOlderChat ? '이전 사진을 불러오는 중…' : '이전 사진·링크 더 보기')
  ))));
}

  window.GATHER_UI_COMPONENTS = Object.assign({}, window.GATHER_UI_COMPONENTS || {}, {
    ChatGalleryModal: ChatGalleryModal
  });
})();
