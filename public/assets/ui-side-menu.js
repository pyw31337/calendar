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
    style: { borderTop: 'none', borderBottom: 'none', paddingTop: '4px', paddingBottom: '4px' }
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
    /* Group 1: manual (banner) + calendar + anniversary */
    /*#__PURE__*/React.createElement("div", { className: "admin-side-menu-list", style: { borderTop: 'none', borderBottom: 'none', paddingTop: '4px' } },
      /*#__PURE__*/React.createElement("button", {
        type: "button",
        className: "admin-side-menu-item main-side-menu-manual-banner",
        onClick: () => handle(onOpenManual)
      },
        /*#__PURE__*/React.createElement("span", { className: "main-side-menu-manual-banner-glow", "aria-hidden": "true" }),
        /*#__PURE__*/React.createElement("span", { className: "main-side-menu-manual-banner-icon-wrap", "aria-hidden": "true" },
          /*#__PURE__*/React.createElement("svg", {
            xmlns: "http://www.w3.org/2000/svg", width: "22", height: "22", viewBox: "0 0 24 24",
            fill: "none", stroke: "currentColor", strokeWidth: "1.8", strokeLinecap: "round", strokeLinejoin: "round"
          },
            /*#__PURE__*/React.createElement("path", { d: "M4 19.5A2.5 2.5 0 0 1 6.5 17H20" }),
            /*#__PURE__*/React.createElement("path", { d: "M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" }),
            /*#__PURE__*/React.createElement("path", { d: "M8 7h8" }),
            /*#__PURE__*/React.createElement("path", { d: "M8 11h6" })
          )
        ),
        /*#__PURE__*/React.createElement("span", { className: "main-side-menu-manual-banner-text" },
          /*#__PURE__*/React.createElement("span", { className: "main-side-menu-manual-banner-title" }, "사용자 매뉴얼"),
          /*#__PURE__*/React.createElement("span", { className: "main-side-menu-manual-banner-sub" }, "사용 방법 한눈에 보기")
        ),
        /*#__PURE__*/React.createElement("span", { className: "main-side-menu-manual-banner-chevron", "aria-hidden": "true" },
          /*#__PURE__*/React.createElement("svg", {
            xmlns: "http://www.w3.org/2000/svg", width: "18", height: "18", viewBox: "0 0 24 24",
            fill: "none", stroke: "currentColor", strokeWidth: "2.2", strokeLinecap: "round", strokeLinejoin: "round"
          }, /*#__PURE__*/React.createElement("path", { d: "m9 18 6-6-6-6" }))
        )
      ),
      /*#__PURE__*/React.createElement("button", {
        type: "button",
        className: "admin-side-menu-item",
        onClick: () => handle(onOpenSettings)
      },
        /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-icon" }, /*#__PURE__*/React.createElement(CalendarCogIcon, null)),
        /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-copy" },
          /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-title" }, "캘린더 설정")
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
          }, anniversaries.length))
        )
      )
    ),
    /* Group 2: gallery + places */
    /*#__PURE__*/React.createElement("div", { className: "admin-side-menu-list", style: { borderTop: '1px solid var(--border-subtle, #E2E8F0)', borderBottom: 'none', paddingTop: '6px', marginTop: '2px' } },
      /*#__PURE__*/React.createElement("button", {
        type: "button",
        className: "admin-side-menu-item",
        onClick: () => { onClose && onClose(); if (onChangeView) onChangeView('gallery'); }
      },
        /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-icon" }, /*#__PURE__*/React.createElement("svg", {
          xmlns: "http://www.w3.org/2000/svg", width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2"
        }, /*#__PURE__*/React.createElement("rect", { width: "18", height: "18", x: "3", y: "3", rx: "2", ry: "2" }), /*#__PURE__*/React.createElement("circle", { cx: "9", cy: "9", r: "2" }), /*#__PURE__*/React.createElement("path", { d: "m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" }))),
        /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-copy" },
          /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-title" }, "갤러리")
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
          /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-title" }, "장소")
        )
      )
    ),
    /* Group 3: theme / font / notify */
    /*#__PURE__*/React.createElement("div", { style: { borderTop: '1px solid var(--border-subtle, #E2E8F0)', marginTop: '2px' } },
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
    /* Group 4: share + shortcut */
    /*#__PURE__*/React.createElement("div", { className: "admin-side-menu-list", style: { borderTop: '1px solid var(--border-subtle, #E2E8F0)', borderBottom: 'none', paddingTop: '6px', marginTop: '2px' } },
      /*#__PURE__*/React.createElement("button", {
        type: "button",
        className: "admin-side-menu-item",
        onClick: () => handle(onOpenShare)
      },
        /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-icon" }, /*#__PURE__*/React.createElement(MenuIcon, { paths: ["M3 12a3 3 0 1 0 6 0a3 3 0 1 0 -6 0", "M15 6a3 3 0 1 0 6 0a3 3 0 1 0 -6 0", "M15 18a3 3 0 1 0 6 0a3 3 0 1 0 -6 0", "M8.7 10.7l6.6 -3.4", "M8.7 13.3l6.6 3.4"] })),
        /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-copy" },
          /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-title" }, "공유하기")
        )
      ),
      /*#__PURE__*/React.createElement("button", {
        type: "button",
        className: "admin-side-menu-item",
        onClick: () => handle(onCreateShortcut)
      },
        /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-icon" }, /*#__PURE__*/React.createElement(ExternalLinkIcon, null)),
        /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-copy" },
          /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-title" }, "바로가기")
        )
      )
    ),
    /* Group 5: admin */
    /*#__PURE__*/React.createElement("div", { className: "admin-side-menu-list", style: { marginTop: 'auto', borderTop: '1px solid var(--border-subtle, #E2E8F0)', borderBottom: 'none', paddingTop: '6px' } },
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
          /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-title" }, "어드민")
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
