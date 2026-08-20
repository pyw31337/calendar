/**
 * Side menu UI (P4-4): SharedSideMenuSettings + MainSideMenu
 */
(function () {
function SharedSideMenuSettings({
  isDarkTheme,
  onToggleTheme,
  fontScalePercent,
  onDecreaseFont,
  onIncreaseFont,
  isChatNotifyEnabled,
  onToggleChatNotifications
}) {
  const React = window.React;
  const __deps = window.GATHER_UI_DEPS || {};
  const MoonStarsIcon = __deps.MoonStarsIcon;
  const TextResizeIcon = __deps.TextResizeIcon;
  const BellIcon = __deps.BellIcon;
  const ToggleSwitch = __deps.ToggleSwitch;

  return /*#__PURE__*/React.createElement("div", {
    className: "admin-side-menu-list shared-side-menu-settings",
    style: { borderTop: 'none', borderBottom: 'none', paddingTop: '14px' }
  },
    /*#__PURE__*/React.createElement("div", { className: "admin-side-menu-setting-row" },
      /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-setting-label" },
        /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-setting-icon", "aria-hidden": "true" }, /*#__PURE__*/React.createElement(MoonStarsIcon, null)),
        "다크모드"
      ),
      /*#__PURE__*/React.createElement(ToggleSwitch, { checked: !!isDarkTheme, onChange: onToggleTheme, label: "다크모드" })
    ),
    /*#__PURE__*/React.createElement("div", { className: "admin-side-menu-setting-row" },
      /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-setting-label" },
        /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-setting-icon", "aria-hidden": "true" }, /*#__PURE__*/React.createElement(TextResizeIcon, null)),
        "글자크기"
      ),
      /*#__PURE__*/React.createElement("div", { className: "admin-side-menu-font-controls" },
        /*#__PURE__*/React.createElement("button", {
          type: "button", onClick: onDecreaseFont, "aria-label": "글자 크기 줄이기", className: "admin-side-menu-font-btn"
        }, "−"),
        /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-font-value" }, `${fontScalePercent || 100}%`),
        /*#__PURE__*/React.createElement("button", {
          type: "button", onClick: onIncreaseFont, "aria-label": "글자 크기 늘리기", className: "admin-side-menu-font-btn"
        }, "+")
      )
    ),
    /*#__PURE__*/React.createElement("div", { className: "admin-side-menu-setting-row" },
      /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-setting-label" },
        /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-setting-icon", "aria-hidden": "true" }, /*#__PURE__*/React.createElement(BellIcon, null)),
        "채팅알림"
      ),
      /*#__PURE__*/React.createElement(ToggleSwitch, { checked: !!isChatNotifyEnabled, onChange: onToggleChatNotifications, label: "채팅알림" })
    )
  );
}

function MainSideMenu({
  calendar,
  anniversaries = [],
  onClose,
  onOpenManual,
  onOpenSettings,
  onOpenAnniversaries,
  onOpenShare,
  onCreateShortcut,
  onOpenAdmin,
  isDarkTheme,
  onToggleTheme,
  fontScalePercent,
  onDecreaseFont,
  onIncreaseFont,
  isChatNotifyEnabled,
  onToggleChatNotifications,
  onUpdateWeatherLocation,
  onDeleteRecentLocation,
  showToast,
  onOpenGallery,
  onChangeView
}) {
  const React = window.React;
  const __deps = window.GATHER_UI_DEPS || {};
  const SharedSideMenuSettings = (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.SharedSideMenuSettings) || __deps.SharedSideMenuSettings;
  const SmallXIcon = __deps.SmallXIcon;
  const MenuIcon = __deps.MenuIcon;
  const CalendarCogIcon = __deps.CalendarCogIcon;
  const MapCogIcon = __deps.MapCogIcon;
  const GiftIcon = __deps.GiftIcon;
  const LockIcon = __deps.LockIcon;
  const ExternalLinkIcon = __deps.ExternalLinkIcon;
  const WeatherBadge = __deps.WeatherBadge;
  const WeatherLocationModal = __deps.WeatherLocationModal;

  const [isWeatherModalOpen, setIsWeatherModalOpen] = React.useState(false);
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
    "aria-label": "메인 메뉴",
    onClick: e => e.stopPropagation(),
    onMouseMove: triggerScrollActive,
    onScroll: triggerScrollActive
  },
	    /*#__PURE__*/React.createElement("div", { className: "admin-side-menu-header" },
	      /*#__PURE__*/React.createElement("div", { className: "admin-side-menu-brand" },
	        /*#__PURE__*/React.createElement("div", { className: "admin-side-menu-copy" },
	          /*#__PURE__*/React.createElement("div", { className: "admin-side-menu-title" }, "메뉴")
	        )
      ),
        /* Right container: Weather badge + Settings Icon + Close Button */
        /*#__PURE__*/React.createElement("div", {
          style: { display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }
        },
          /* Weather Badge */
          /*#__PURE__*/React.createElement(WeatherBadge, { weatherLocation: calendar?.weatherLocation }),
          /* Weather Settings */
          /*#__PURE__*/React.createElement("button", {
            type: "button",
            className: "admin-side-menu-weather-settings-btn",
            title: "날씨 지역 설정",
            style: {
              width: '28px',
              height: '28px',
              border: 'none',
              borderRadius: '6px',
              background: 'transparent',
              color: '#64748B',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              padding: 0,
              transition: 'background-color 0.16s ease, color 0.16s ease'
            },
            onClick: (e) => {
              e.stopPropagation();
              setIsWeatherModalOpen(true);
            }
          }, /*#__PURE__*/React.createElement(MapCogIcon, { size: 16 })),
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
        onClick: () => handle(onOpenManual)
      },
        /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-icon" }, /*#__PURE__*/React.createElement(MenuIcon, { paths: ["M8 9h8", "M8 13h6", "M12 20l9 -5l-9 -5l-9 5l9 5z", "M12 12l9 -5l-9 -5l-9 5l9 5z"] })),
        /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-copy" },
          /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-title" }, "사용자 매뉴얼"),
          /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-desc" }, "캘린더 사용 방법 보기")
        )
      ),
      /*#__PURE__*/React.createElement("button", {
        type: "button",
        className: "admin-side-menu-item",
        onClick: () => handle(onOpenSettings)
      },
        /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-icon" }, /*#__PURE__*/React.createElement(CalendarCogIcon, null)),
        /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-copy" },
          /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-title" }, "캘린더 설정"),
          /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-desc" }, "이름, 설명, 참여자 관리")
        )
      ),
      /*#__PURE__*/React.createElement("button", {
        type: "button",
        className: "admin-side-menu-item",
        onClick: () => handle(onOpenAnniversaries)
      },
        /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-icon" }, /*#__PURE__*/React.createElement(GiftIcon, null)),
        /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-copy" },
          /*#__PURE__*/React.createElement("span", {
            className: "admin-side-menu-item-title",
            style: { display: 'flex', alignItems: 'center', gap: '6px' }
          }, "기념일 설정", anniversaries.length > 0 && /*#__PURE__*/React.createElement("span", {
            className: "main-menu-badge",
            style: {
              backgroundColor: 'var(--border-subtle)',
              color: 'var(--text-muted)',
              marginLeft: '4px'
            }
          }, anniversaries.length)),
          /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-desc" }, "매년 반복, 음양력, 디데이 관리")
        )
      ),
      /*#__PURE__*/React.createElement("button", {
        type: "button",
        className: "admin-side-menu-item",
        onClick: () => handle(onOpenShare)
      },
        /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-icon" }, /*#__PURE__*/React.createElement(MenuIcon, { paths: ["M3 12a3 3 0 1 0 6 0a3 3 0 1 0 -6 0", "M15 6a3 3 0 1 0 6 0a3 3 0 1 0 -6 0", "M15 18a3 3 0 1 0 6 0a3 3 0 1 0 -6 0", "M8.7 10.7l6.6 -3.4", "M8.7 13.3l6.6 3.4"] })),
        /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-copy" },
          /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-title" }, "공유하기"),
          /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-desc" }, "캘린더 URL 복사")
        )
      ),
      /*#__PURE__*/React.createElement("button", {
        type: "button",
        className: "admin-side-menu-item",
        onClick: () => handle(onCreateShortcut)
      },
        /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-icon" }, /*#__PURE__*/React.createElement(ExternalLinkIcon, null)),
        /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-copy" },
          /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-title" }, "바로가기"),
          /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-desc" }, "홈 화면 또는 바탕화면 추가")
        )
      )
    ),
    /* Gallery + Places after 기념일/공유 group */
    /*#__PURE__*/React.createElement("div", { className: "admin-side-menu-list", style: { borderTop: '1px solid #E2E8F0', borderBottom: 'none', paddingTop: '8px' } },
      /*#__PURE__*/React.createElement("button", {
        type: "button",
        className: "admin-side-menu-item",
        onClick: () => { onClose && onClose(); if (onChangeView) onChangeView('gallery'); }
      },
        /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-icon" }, /*#__PURE__*/React.createElement("svg", {
          xmlns: "http://www.w3.org/2000/svg", width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2"
        }, /*#__PURE__*/React.createElement("rect", { width: "18", height: "18", x: "3", y: "3", rx: "2", ry: "2" }), /*#__PURE__*/React.createElement("circle", { cx: "9", cy: "9", r: "2" }), /*#__PURE__*/React.createElement("path", { d: "m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" }))),
        /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-copy" },
          /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-title" }, "갤러리"),
          /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-desc" }, "채팅·메모 사진 및 링크")
        )
      ),
      /*#__PURE__*/React.createElement("button", {
        type: "button",
        className: "admin-side-menu-item",
        onClick: () => { onClose && onClose(); if (onChangeView) onChangeView('places'); }
      },
        /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-icon" }, /*#__PURE__*/React.createElement("svg", {
          xmlns: "http://www.w3.org/2000/svg", width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2"
        }, /*#__PURE__*/React.createElement("path", { d: "M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" }), /*#__PURE__*/React.createElement("circle", { cx: "12", cy: "10", r: "3" }))),
        /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-copy" },
          /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-title" }, "장소"),
          /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-desc" }, "장소 페이지로 이동")
        )
      )
    ),
    /* Theme / font / chat notify */
    /*#__PURE__*/React.createElement("div", { style: { borderTop: '1px solid #E2E8F0', borderBottom: 'none', paddingTop: '4px' } },
      /*#__PURE__*/React.createElement(SharedSideMenuSettings, {
        isDarkTheme: isDarkTheme,
        onToggleTheme: onToggleTheme,
        fontScalePercent: fontScalePercent,
        onDecreaseFont: onDecreaseFont,
        onIncreaseFont: onIncreaseFont,
        isChatNotifyEnabled: isChatNotifyEnabled,
        onToggleChatNotifications: onToggleChatNotifications
      })
    ),
        /* Admin alone at bottom */
    /*#__PURE__*/React.createElement("div", { className: "admin-side-menu-list", style: { marginTop: 'auto', borderTop: '1px solid #E2E8F0', borderBottom: 'none' } },
      /*#__PURE__*/React.createElement("button", {
        type: "button",
        className: "admin-side-menu-item",
        onClick: () => {
          onClose && onClose();
          handle(onOpenAdmin);
        }
      },
        /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-icon" }, /*#__PURE__*/React.createElement(LockIcon, null)),
        /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-copy" },
          /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-title" }, "어드민"),
          /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-desc" }, "관리자 페이지 새창 열기")
        )
      )
    )
  )), isWeatherModalOpen && /*#__PURE__*/React.createElement(WeatherLocationModal, {
    onClose: () => setIsWeatherModalOpen(false),
    onSelectLocation: onUpdateWeatherLocation,
    onDeleteRecentLocation: onDeleteRecentLocation,
    showToast: showToast,
    recentLocations: calendar?.recentLocations || []
  }));
}

  window.GATHER_UI_COMPONENTS = Object.assign({}, window.GATHER_UI_COMPONENTS || {}, {
    SharedSideMenuSettings: SharedSideMenuSettings,
    MainSideMenu: MainSideMenu
  });
})();
