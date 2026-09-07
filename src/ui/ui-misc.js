/**
 * Misc chat/share UI (P4-9)
 */

/* P6 ESM classic-compat: free names that live scripts shared via global lexical scope */
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

function fetchImageShareDocument(...args) {
  const f = __gatherUiDeps().fetchImageShareDocument || GATHER_APP_UTILS.fetchImageShareDocument;
  return typeof f === 'function' ? f(...args) : undefined;
}
export function UpdateAvailableBanner() {
  const React = window.React;

  const [updateAvailable, setUpdateAvailable] = React.useState(false);
  const [dismissed, setDismissed] = React.useState(false);
  React.useEffect(() => {
    let initialBuildId = null;
    let cancelled = false;
    const extractBuildId = (html) => {
      if (!html || typeof html !== 'string') return null;
      const m = html.match(/app-main-[A-Za-z0-9_-]+\.js/) || html.match(/index-[A-Za-z0-9_-]+\.js/);
      return m ? m[0] : null;
    };
    const currentBuildId = (() => {
      try {
        const scripts = document.querySelectorAll('script[src]');
        for (const s of scripts) {
          const src = s.getAttribute('src') || '';
          const m = src.match(/app-main-[A-Za-z0-9_-]+\.js/);
          if (m) return m[0];
        }
        const links = document.querySelectorAll('link[rel="modulepreload"]');
        for (const l of links) {
          const href = l.getAttribute('href') || '';
          const m = href.match(/app-main-[A-Za-z0-9_-]+\.js/);
          if (m) return m[0];
        }
      } catch (_) {}
      return null;
    })();
    const checkForUpdate = () => {
      fetch(location.href.split('#')[0], { method: 'GET', cache: 'no-store', credentials: 'same-origin' })
        .then(res => res.text())
        .then(html => {
          if (cancelled) return;
          const liveId = extractBuildId(html);
          if (!liveId) return;
          if (initialBuildId === null) initialBuildId = liveId;
          const baseline = currentBuildId || initialBuildId;
          if (baseline && liveId !== baseline) setUpdateAvailable(true);
        })
        .catch(() => {});
    };
    checkForUpdate();
    const intervalId = setInterval(() => {
      if (document.visibilityState === 'visible') checkForUpdate();
    }, 45 * 1000);
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') checkForUpdate();
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('focus', checkForUpdate);
    window.addEventListener('online', checkForUpdate);
    return () => {
      cancelled = true;
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('focus', checkForUpdate);
      window.removeEventListener('online', checkForUpdate);
    };
  }, []);

  if (!updateAvailable || dismissed) return null;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'fixed', left: '50%', bottom: '20px', transform: 'translateX(-50%)',
      zIndex: 100000, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px',
      backgroundColor: '#0F172A', color: '#FFFFFF', padding: '10px 12px 10px 16px',
      borderRadius: 'var(--radius-md)', boxShadow: '0 12px 32px rgba(0,0,0,0.28)',
      fontSize: 'var(--font-size-base)', fontWeight: 700, width: '90%', maxWidth: '380px',
      boxSizing: 'border-box'
    }
  },
    /*#__PURE__*/React.createElement("span", { style: { whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } }, "새 버전이 있어요"),
    /*#__PURE__*/React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 } },
      /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: () => window.location.reload(),
        style: {
          backgroundColor: '#4F46E5', color: '#FFFFFF', border: 'none', borderRadius: 'var(--radius-md)',
          padding: '6px 14px', fontSize: 'var(--font-size-md)', fontWeight: 800, cursor: 'pointer', whiteSpace: 'nowrap'
        }
      }, "새로고침"),
      /*#__PURE__*/React.createElement("button", {
        type: "button",
        "aria-label": "닫기",
        onClick: () => setDismissed(true),
        style: {
          background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer',
          padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center'
        }
      }, /*#__PURE__*/React.createElement("svg", {
        xmlns: "http://www.w3.org/2000/svg", width: "16", height: "16", viewBox: "0 0 24 24",
        fill: "none", stroke: "currentColor", strokeWidth: "2.5", strokeLinecap: "round", strokeLinejoin: "round"
      }, /*#__PURE__*/React.createElement("line", { x1: "18", y1: "6", x2: "6", y2: "18" }), /*#__PURE__*/React.createElement("line", { x1: "6", y1: "6", x2: "18", y2: "18" })))
    )
  );
}

// A plain JS style object can't use CSS's @supports fallback cascade the way app.css does (two
// inline style keys of the same name just collapse to the last one -- the '100vh' this used to
// sit next to was always dead code, never an actual fallback) -- pick the right unit once here
// instead, so an engine without dvh support (very old browsers only at this point) still gets a
// valid minHeight rather than none at all.
const SUPPORTS_DVH = typeof CSS !== 'undefined' && typeof CSS.supports === 'function' && CSS.supports('height', '1dvh');

export function ImageShareViewer({ shareId }) {
  const React = window.React;

  const [state, setState] = React.useState({ loading: true, share: null, error: '' });
  React.useEffect(() => {
    let cancelled = false;
    fetchImageShareDocument(shareId).then(share => {
      if (cancelled) return;
      if (!share?.imageUrl) {
        setState({ loading: false, share: null, error: '이미지를 찾지 못했습니다.' });
        return;
      }
      setState({ loading: false, share, error: '' });
    }).catch(err => {
      console.error('Image share load failed:', err);
      if (!cancelled) setState({ loading: false, share: null, error: '이미지를 불러오지 못했습니다.' });
    });
    return () => { cancelled = true; };
  }, [shareId]);

  return /*#__PURE__*/React.createElement("div", {
    style: {
      minHeight: SUPPORTS_DVH ? '100dvh' : '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '16px',
      padding: '20px',
      background: '#111827',
      color: '#FFFFFF',
      boxSizing: 'border-box'
    }
  }, state.loading ? /*#__PURE__*/React.createElement(React.Fragment, null,
    /*#__PURE__*/React.createElement("div", {
      style: { width: '42px', height: '42px', borderRadius: '50%', border: '4px solid rgba(255,255,255,0.22)', borderTopColor: '#FFFFFF', animation: 'spin 0.8s linear infinite' }
    }),
    /*#__PURE__*/React.createElement("div", { style: { fontSize: '0.95rem', fontWeight: 800 } }, "이미지를 불러오는 중입니다...")
  ) : state.error ? /*#__PURE__*/React.createElement(React.Fragment, null,
    /*#__PURE__*/React.createElement("div", { style: { fontSize: '1.05rem', fontWeight: 900 } }, state.error),
    /*#__PURE__*/React.createElement("a", { href: "./", style: { color: '#93C5FD', fontWeight: 800 } }, "캘린더로 돌아가기")
  ) : /*#__PURE__*/React.createElement(React.Fragment, null,
    /*#__PURE__*/React.createElement("img", {
      src: state.share.imageUrl,
      alt: "공유 이미지",
      decoding: "async",
      style: {
        maxWidth: '100%',
        maxHeight: 'calc(100dvh - 96px)',
        objectFit: 'contain',
        borderRadius: 'var(--radius-md)',
        boxShadow: '0 24px 80px rgba(0,0,0,0.35)'
      }
    }),
    /*#__PURE__*/React.createElement("div", {
      style: { fontSize: 'var(--font-size-md)', color: 'rgba(255,255,255,0.72)', textAlign: 'center' }
    }, "모여라 캘린더 공유 이미지")
  ));
}

export function ImageThumbRemoveButton({ onClick, title = '삭제' }) {
  const React = window.React;
  const __comp = window.GATHER_UI_COMPONENTS || {};
  const __deps = window.GATHER_UI_DEPS || {};
  const TrashIcon = __comp.TrashIcon || __deps.TrashIcon;

  return /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick,
    title,
    "aria-label": title,
    style: {
      position: 'absolute', top: '-6px', right: '-6px',
      width: '18px', height: '18px', borderRadius: '50%',
      backgroundColor: '#475569', border: 'none', cursor: 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 0, color: '#FFFFFF'
    }
  }, /*#__PURE__*/React.createElement(TrashIcon, { size: 10 }));
}

export function InlineSearchBar({
  value,
  onChange,
  placeholder,
  autoFocus = true,
  fixed = false,
  inputRef = null,
  leading = null,
  trailing = null,
  onClose = null,
  closeLabel = '닫기',
  className = '',
  style = null
}) {
  const React = window.React;

  const barStyle = {
    minHeight: '48px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 12px',
    backgroundColor: 'var(--bg-card)',
    borderBottom: '1px solid var(--border-subtle)',
    boxSizing: 'border-box',
    ...(fixed ? {
      // +env(safe-area-inset-top): every `fixed` caller assumes a 56px header directly above
      // starting at top:0 -- once that header shifts down for iOS standalone's status bar (see
      // .main-header/.memo-view-header etc.), this bar needs the same shift to stay glued right
      // below it instead of sliding back up under the status bar. 0 in a normal browser tab.
      position: 'fixed', top: 'calc(56px + env(safe-area-inset-top, 0px))', left: 0, right: 0, zIndex: 1008, flexShrink: 0
    } : { flexShrink: 0, zIndex: 1008 }),
    ...(style || {})
  };
  return /*#__PURE__*/React.createElement("div", {
    className: `inline-search-bar${fixed ? ' is-fixed' : ''}${className ? ' ' + className : ''}`,
    style: barStyle
  },
    leading,
    /*#__PURE__*/React.createElement("div", {
      className: "inline-search-capsule",
      style: {
        flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: '8px',
        height: '36px', padding: '0 12px', borderRadius: 'var(--radius-full)', border: 'none',
        backgroundColor: 'var(--bg-primary)', boxSizing: 'border-box'
      }
    },
      /*#__PURE__*/React.createElement("svg", {
        xmlns: "http://www.w3.org/2000/svg", width: "16", height: "16", viewBox: "0 0 24 24",
        fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round",
        style: { color: 'var(--text-muted)', flexShrink: 0 }, "aria-hidden": true
      },
        /*#__PURE__*/React.createElement("circle", { cx: "11", cy: "11", r: "8" }),
        /*#__PURE__*/React.createElement("path", { d: "m21 21-4.3-4.3" })
      ),
      /*#__PURE__*/React.createElement("input", {
        ref: inputRef, type: "text", className: "inline-search-input",
        placeholder: placeholder, value: value, onChange: onChange, autoFocus: autoFocus,
        style: {
          flex: 1, minWidth: 0, height: '100%', fontSize: 'var(--font-size-base)', padding: 0,
          border: 'none', outline: 'none', background: 'transparent',
          color: 'var(--text-main)', boxShadow: 'none'
        }
      })
    ),
    trailing,
    typeof onClose === 'function' ? /*#__PURE__*/React.createElement("button", {
      type: "button",
      onClick: onClose,
      style: {
        border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted)',
        padding: '4px 6px', fontSize: 'var(--font-size-md)', fontWeight: 700, flexShrink: 0
      }
    }, closeLabel) : null
  );
}

export function MemoShareModal({ memo, calendarId, onClose, showToast }) {
  const React = window.React;
  const __deps = window.GATHER_UI_DEPS || {};
  const __comp = window.GATHER_UI_COMPONENTS || {};
  const ResizableModalContainer = __comp.ResizableModalContainer || __deps.ResizableModalContainer || (function Shell(p) { return React.createElement('div', p, p.children); });
  const SmallXIcon = __deps.SmallXIcon;
  const getMemoItemShareUrl = __deps.getMemoItemShareUrl;
  const copyTextToClipboard = __deps.copyTextToClipboard;

  const shareUrl = React.useMemo(() => {
    return getMemoItemShareUrl(calendarId, memo.id);
  }, [calendarId, memo.id]);
  const qrDataUrl = React.useMemo(() => {
    if (typeof qrcode === 'undefined') return null;
    try {
      const qr = qrcode(0, 'M');
      qr.addData(shareUrl);
      qr.make();
      return qr.createDataURL(6, 8);
    } catch (e) {
      console.warn('QR code render failed:', e);
      return null;
    }
  }, [shareUrl]);
  return ReactDOM.createPortal(/*#__PURE__*/React.createElement("div", {
    className: "modal-overlay",
    onClick: onClose,
    style: { zIndex: 11000 }
  }, /*#__PURE__*/React.createElement(ResizableModalContainer, {
    className: "modal-container",
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal-header",
    style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' }
  }, /*#__PURE__*/React.createElement("h3", {
    style: { fontSize: '1.1rem', fontWeight: 800 }
  }, "메모 공유 URL"), /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    style: { background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.2rem', cursor: 'pointer', display: 'flex', alignItems: 'center' }
  }, /*#__PURE__*/React.createElement(SmallXIcon, { size: 20 }))), /*#__PURE__*/React.createElement("div", {
    className: "modal-body"
  }, /*#__PURE__*/React.createElement("label", {
    style: { fontSize: 'var(--font-size-base)', fontWeight: 700, color: 'var(--text-muted)' }
  }, memo.title ? `"${memo.title}" 메모 전용 공유 URL` : '이 메모 전용 공유 URL'), /*#__PURE__*/React.createElement("input", {
    type: "text",
    className: "form-input",
    style: { width: '100%' },
    value: shareUrl,
    readOnly: true
  }), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-primary",
    onClick: async () => {
      const ok = await copyTextToClipboard(shareUrl);
      const message = ok ? 'URL이 복사되었습니다!' : '복사에 실패했습니다. URL을 직접 선택해 복사해 주세요.';
      if (showToast) showToast(message, ok ? 'success' : 'error');
      else console.warn(message);
    }
  }, "URL 복사하기"),
  qrDataUrl && /*#__PURE__*/React.createElement("div", {
    style: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', marginTop: '16px' }
  },
    /*#__PURE__*/React.createElement("img", { src: qrDataUrl, alt: "메모 공유 QR코드", style: { borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' } }),
    /*#__PURE__*/React.createElement("span", { style: { fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' } }, "QR코드를 카메라로 스캔해 접속하세요")
  )))), document.body);
}

export function ChatSideMenu({
  onOpenAppSettings,
  onClose,
  onOpenSearch,
  onOpenNoticeSettings,
  onOpenGallery,
  onOpenShare,
  onChangeView,
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
  weatherLocation = null
}) {
  const React = window.React;
  const __deps = window.GATHER_UI_DEPS || {};
  const __comp = window.GATHER_UI_COMPONENTS || {};
  const SmallXIcon = __deps.SmallXIcon;
  const BackArrowIcon = __comp.BackArrowIcon || __deps.BackArrowIcon;
  const WeatherBadge = __comp.WeatherBadge || __deps.WeatherBadge;
  const MegaphoneIcon = __deps.MegaphoneIcon;
    const SharedSideMenuFooter = (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.SharedSideMenuFooter) || __deps.SharedSideMenuFooter;
  const SharedAppNavBlock = (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.SharedAppNavBlock) || __deps.SharedAppNavBlock;

  const handle = action => {
    if (typeof action === 'function') action();
  };
  const scrollTimeoutRef = React.useRef(null);
  const [isScrollingActive, setIsScrollingActive] = React.useState(false);
  const triggerScrollActive = () => {
    setIsScrollingActive(true);
    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    scrollTimeoutRef.current = setTimeout(() => {
      setIsScrollingActive(false);
    }, 1200);
  };
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "admin-side-menu-overlay",
    onClick: onClose
  }, /*#__PURE__*/React.createElement("nav", {
    className: "admin-side-menu" + (isScrollingActive ? " scroll-active" : ""),
    "aria-label": "채팅",
    onClick: e => e.stopPropagation(),
    onMouseMove: triggerScrollActive,
    onScroll: triggerScrollActive
  },
    /*#__PURE__*/React.createElement("div", { className: "admin-side-menu-header" },
      /*#__PURE__*/React.createElement("div", { className: "admin-side-menu-brand" },
        /*#__PURE__*/React.createElement("div", { className: "admin-side-menu-copy" },
          /*#__PURE__*/React.createElement("button", {
            type: "button",
            className: "admin-side-menu-title",
            title: "메인 화면으로 이동",
            "aria-label": "메인 화면으로 이동",
            onClick: () => { onClose && onClose(); if (typeof onChangeView === 'function') onChangeView('calendar'); },
            style: {
              background: 'none', border: 'none', padding: 0, margin: 0,
              color: 'inherit',
              cursor: 'pointer', textAlign: 'left',
              display: 'flex', alignItems: 'center', gap: '6px'
            }
          }, BackArrowIcon && /*#__PURE__*/React.createElement(BackArrowIcon, { size: 18 }), "채팅")
        )
      ),
        /*#__PURE__*/React.createElement("div", {
          style: { display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }
        },
          WeatherBadge ? /*#__PURE__*/React.createElement(WeatherBadge, { weatherLocation: weatherLocation }) : null,
          /* Close Button */
          /*#__PURE__*/React.createElement("button", {
            type: "button",
            className: "admin-side-menu-close-btn",
            title: "메뉴 닫기",
            "aria-label": "메뉴 닫기",
            onClick: onClose
          }, /*#__PURE__*/React.createElement(SmallXIcon, { size: 20 }))
        )
    ),
    /*#__PURE__*/React.createElement("div", {
    className: "admin-side-menu-list",
    style: { borderBottom: 'none', paddingTop: '6px' }
  },
      /*#__PURE__*/React.createElement("button", {
        type: "button",
        className: "admin-side-menu-item",
        onClick: () => { onClose(); handle(onOpenSearch); }
      },
        /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-icon" }, /*#__PURE__*/React.createElement("svg", {
          xmlns: "http://www.w3.org/2000/svg", width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2"
        }, /*#__PURE__*/React.createElement("circle", { cx: "11", cy: "11", r: "8" }), /*#__PURE__*/React.createElement("path", { d: "m21 21-4.3-4.3" }))),
        /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-copy" },
          /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-title" }, "대화검색")
        )
      ),
      /*#__PURE__*/React.createElement("button", {
        type: "button",
        className: "admin-side-menu-item",
        onClick: () => { onClose(); handle(onOpenNoticeSettings); }
      },
        /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-icon" }, /*#__PURE__*/React.createElement(MegaphoneIcon, { size: 20 })),
        /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-copy" },
          /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-title" }, "공지사항")
        )
      )
    ),
    typeof SharedAppNavBlock === 'function' && /*#__PURE__*/React.createElement(SharedAppNavBlock, {
      onClose: onClose,
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
      onClose: onClose,
      onOpenShare: onOpenShare,
      onOpenSettings: onOpenAppSettings,
      shareLabel: '공유'
    }),
  )));
}

  if (typeof window !== 'undefined') {
  window.GATHER_UI_COMPONENTS = Object.assign({}, window.GATHER_UI_COMPONENTS || {}, {
    UpdateAvailableBanner: UpdateAvailableBanner,
    ImageShareViewer: ImageShareViewer,
    ImageThumbRemoveButton: ImageThumbRemoveButton,
    InlineSearchBar: InlineSearchBar,
    MemoShareModal: MemoShareModal,
    ChatSideMenu: ChatSideMenu,
  });
}
