/**
 * Misc chat/share UI (P4-9)
 */
(function () {
function UpdateAvailableBanner() {
  const React = window.React;

  const [updateAvailable, setUpdateAvailable] = React.useState(false);
  const [dismissed, setDismissed] = React.useState(false);
  React.useEffect(() => {
    let initialVersionTag = null;
    let cancelled = false;
    const checkForUpdate = () => {
      fetch(location.href, { method: 'HEAD', cache: 'no-store' }).then(res => {
        const versionTag = res.headers.get('etag') || res.headers.get('last-modified');
        if (!versionTag || cancelled) return;
        if (initialVersionTag === null) {
          initialVersionTag = versionTag;
          return;
        }
        if (versionTag !== initialVersionTag) setUpdateAvailable(true);
      }).catch(() => {
        // Offline, or the request was blocked -- just retry on the next interval/visibility tick.
      });
    };
    checkForUpdate();
    const intervalId = setInterval(checkForUpdate, 10 * 60 * 1000);
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') checkForUpdate();
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      cancelled = true;
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, []);

  if (!updateAvailable || dismissed) return null;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'fixed', left: '50%', bottom: '20px', transform: 'translateX(-50%)',
      zIndex: 100000, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px',
      backgroundColor: '#0F172A', color: '#FFFFFF', padding: '10px 12px 10px 16px',
      borderRadius: '12px', boxShadow: '0 12px 32px rgba(0,0,0,0.28)',
      fontSize: '0.85rem', fontWeight: 700, width: '90%', maxWidth: '380px',
      boxSizing: 'border-box'
    }
  },
    /*#__PURE__*/React.createElement("span", { style: { whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } }, "새 버전이 있어요"),
    /*#__PURE__*/React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 } },
      /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: () => window.location.reload(),
        style: {
          backgroundColor: '#4F46E5', color: '#FFFFFF', border: 'none', borderRadius: '8px',
          padding: '6px 14px', fontSize: '0.82rem', fontWeight: 800, cursor: 'pointer', whiteSpace: 'nowrap'
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

function ImageShareViewer({ shareId }) {
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
      minHeight: '100vh',
      minHeight: '100dvh',
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
      style: {
        maxWidth: '100%',
        maxHeight: 'calc(100dvh - 96px)',
        objectFit: 'contain',
        borderRadius: '14px',
        boxShadow: '0 24px 80px rgba(0,0,0,0.35)'
      }
    }),
    /*#__PURE__*/React.createElement("div", {
      style: { fontSize: '0.78rem', color: 'rgba(255,255,255,0.72)', textAlign: 'center' }
    }, "모여라 캘린더 공유 이미지")
  ));
}

function ImageThumbRemoveButton({ onClick, title = '삭제' }) {
  const React = window.React;

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
  }, /*#__PURE__*/React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg", width: "10", height: "10", viewBox: "0 0 24 24",
    fill: "none", stroke: "#FFFFFF", strokeWidth: "3", strokeLinecap: "round", strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("line", { x1: "18", y1: "6", x2: "6", y2: "18" }), /*#__PURE__*/React.createElement("line", { x1: "6", y1: "6", x2: "18", y2: "18" })));
}

function InlineSearchBar({
  value,
  onChange,
  placeholder,
  autoFocus = true,
  fixed = false,
  inputRef = null,
  trailing = null,
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
      position: 'fixed', top: '56px', left: 0, right: 0, zIndex: 1008, flexShrink: 0
    } : { flexShrink: 0, zIndex: 1008 }),
    ...(style || {})
  };
  return /*#__PURE__*/React.createElement("div", {
    className: `inline-search-bar${fixed ? ' is-fixed' : ''}${className ? ' ' + className : ''}`,
    style: barStyle
  },
    /*#__PURE__*/React.createElement("div", {
      className: "inline-search-capsule",
      style: {
        flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: '8px',
        height: '36px', padding: '0 12px', borderRadius: '999px', border: 'none',
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
          flex: 1, minWidth: 0, height: '100%', fontSize: '0.88rem', padding: 0,
          border: 'none', outline: 'none', background: 'transparent',
          color: 'var(--text-main)', boxShadow: 'none'
        }
      })
    ),
    trailing
  );
}

function MemoShareModal({ memo, calendarId, onClose, showToast }) {
  const React = window.React;
  const __deps = window.GATHER_UI_DEPS || {};
  const ResizableModalContainer = __deps.ResizableModalContainer;
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
    style: { background: 'none', border: 'none', color: '#64748B', fontSize: '1.2rem', cursor: 'pointer', display: 'flex', alignItems: 'center' }
  }, /*#__PURE__*/React.createElement(SmallXIcon, { size: 20 }))), /*#__PURE__*/React.createElement("div", {
    className: "modal-body"
  }, /*#__PURE__*/React.createElement("label", {
    style: { fontSize: '0.85rem', fontWeight: 700, color: '#64748B' }
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
      else alert(message);
    }
  }, "URL 복사하기"),
  qrDataUrl && /*#__PURE__*/React.createElement("div", {
    style: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', marginTop: '16px' }
  },
    /*#__PURE__*/React.createElement("img", { src: qrDataUrl, alt: "메모 공유 QR코드", style: { borderRadius: '8px', border: '1px solid var(--border-subtle)' } }),
    /*#__PURE__*/React.createElement("span", { style: { fontSize: '0.76rem', color: 'var(--text-muted)' } }, "QR코드를 카메라로 스캔해 접속하세요")
  )))), document.body);
}

function ChatSideMenu({
  onClose,
  onOpenSearch,
  onOpenNoticeSettings,
  onOpenGallery,
  onOpenShare,
  isDarkTheme,
  onToggleTheme,
  fontScalePercent,
  onDecreaseFont,
  onIncreaseFont,
  isChatNotifyEnabled,
  onToggleChatNotifications,
  onChangeView
}) {
  const React = window.React;
  const __deps = window.GATHER_UI_DEPS || {};
  const SmallXIcon = __deps.SmallXIcon;
  const MegaphoneIcon = __deps.MegaphoneIcon;
  const SharedSideMenuSettings = (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.SharedSideMenuSettings) || __deps.SharedSideMenuSettings;

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
    "aria-label": "채팅 메뉴",
    onClick: e => e.stopPropagation(),
    onMouseMove: triggerScrollActive,
    onScroll: triggerScrollActive
  },
    /*#__PURE__*/React.createElement("div", { className: "admin-side-menu-header" },
      /*#__PURE__*/React.createElement("div", { className: "admin-side-menu-brand" },
        /*#__PURE__*/React.createElement("div", { className: "admin-side-menu-copy" },
          /*#__PURE__*/React.createElement("div", { className: "admin-side-menu-title" }, "채팅 메뉴")
        )
      ),
        /*#__PURE__*/React.createElement("div", {
          style: { display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }
        },
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
    /*#__PURE__*/React.createElement("div", { className: "admin-side-menu-list" },
      /*#__PURE__*/React.createElement("button", {
        type: "button",
        className: "admin-side-menu-item",
        onClick: () => { onClose(); handle(onOpenSearch); }
      },
        /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-icon" }, /*#__PURE__*/React.createElement("svg", {
          xmlns: "http://www.w3.org/2000/svg",
          width: "20",
          height: "20",
          viewBox: "0 0 24 24",
          fill: "none",
          stroke: "currentColor",
          strokeWidth: "2",
          strokeLinecap: "round",
          strokeLinejoin: "round"
        }, /*#__PURE__*/React.createElement("circle", { cx: "11", cy: "11", r: "8" }), /*#__PURE__*/React.createElement("path", { d: "m21 21-4.3-4.3" }))),
        /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-copy" },
          /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-title" }, "대화검색"),
          /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-desc" }, "채팅 메시지 검색")
        )
      ),
      /*#__PURE__*/React.createElement("button", {
        type: "button",
        className: "admin-side-menu-item",
        onClick: () => { onClose(); handle(onOpenGallery); }
      },
        /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-icon" }, /*#__PURE__*/React.createElement("svg", {
          xmlns: "http://www.w3.org/2000/svg", width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2"
        }, /*#__PURE__*/React.createElement("rect", { width: "18", height: "18", x: "3", y: "3", rx: "2", ry: "2" }), /*#__PURE__*/React.createElement("circle", { cx: "9", cy: "9", r: "2" }), /*#__PURE__*/React.createElement("path", { d: "m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" }))),
        /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-copy" },
          /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-title" }, "갤러리"),
          /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-desc" }, "채팅 사진 및 링크")
        )
      ),
      /*#__PURE__*/React.createElement("button", {
        type: "button",
        className: "admin-side-menu-item",
        onClick: () => { onClose(); handle(onOpenNoticeSettings); }
      },
        /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-icon" }, /*#__PURE__*/React.createElement(MegaphoneIcon, { size: 20 })),
        /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-copy" },
          /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-title" }, "공지사항"),
          /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-desc" }, "공지 등록 및 고정 관리")
        )
      ),
      /*#__PURE__*/React.createElement("button", {
        type: "button",
        className: "admin-side-menu-item",
        onClick: () => { onClose(); handle(onOpenShare); }
      },
        /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-icon" }, /*#__PURE__*/React.createElement("svg", {
          xmlns: "http://www.w3.org/2000/svg",
          width: "20",
          height: "20",
          viewBox: "0 0 24 24",
          fill: "none",
          stroke: "currentColor",
          strokeWidth: "2",
          strokeLinecap: "round",
          strokeLinejoin: "round"
        }, /*#__PURE__*/React.createElement("path", { d: "M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" }), /*#__PURE__*/React.createElement("polyline", { points: "16 6 12 2 8 6" }), /*#__PURE__*/React.createElement("line", { x1: "12", x2: "12", y1: "2", y2: "15" }))),
        /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-copy" },
          /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-title" }, "공유하기"),
          /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-desc" }, "채팅방 공유 URL 복사")
        )
      )
    ),
    /*#__PURE__*/React.createElement(SharedSideMenuSettings, {
      isDarkTheme: isDarkTheme,
      onToggleTheme: onToggleTheme,
      fontScalePercent: fontScalePercent,
      onDecreaseFont: onDecreaseFont,
      onIncreaseFont: onIncreaseFont,
      isChatNotifyEnabled: isChatNotifyEnabled,
      onToggleChatNotifications: onToggleChatNotifications
    }),
  )));
}

  window.GATHER_UI_COMPONENTS = Object.assign({}, window.GATHER_UI_COMPONENTS || {}, {
    UpdateAvailableBanner: UpdateAvailableBanner,
    ImageShareViewer: ImageShareViewer,
    ImageThumbRemoveButton: ImageThumbRemoveButton,
    InlineSearchBar: InlineSearchBar,
    MemoShareModal: MemoShareModal,
    ChatSideMenu: ChatSideMenu
  });
})();
