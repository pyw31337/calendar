/**
 * Side menu UI (P4-4): SharedSideMenuSettings + MainSideMenu
 */

/* P6 ESM classic-compat: free names that live scripts shared via global lexical scope */
function __gatherUiDeps() { return window.GATHER_UI_DEPS || {}; }
/* __fb() bridge */
function __fb() {
  const deps = __gatherUiDeps();
  if (deps && typeof deps.getDb === 'function') {
    try { const d = deps.getDb(); if (d) return d; } catch (e) {}
  }
  return (typeof window !== 'undefined' && window.__gatherFirebaseDb) || null;
}
const SIDE_MENU_REQUEST_TIMEOUT_MS = 7000;
function withSideMenuTimeout(promise, timeoutMs = SIDE_MENU_REQUEST_TIMEOUT_MS) {
  let timer = null;
  const deadline = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error('사이드 메뉴 요청 시간이 초과되었습니다.')), timeoutMs);
  });
  return Promise.race([promise, deadline]).finally(() => {
    if (timer) clearTimeout(timer);
  });
}
export function AppSettingsModal({
  onClose, isDarkTheme, onToggleTheme, fontScalePercent, onDecreaseFont, onIncreaseFont,
  isNotifPermissionGranted, isMasterNotifyEnabled, onToggleMasterNotify,
  notifyChannels, onToggleNotifyChannel, helpSteps,
  weatherLocation = null, recentLocations = [], onUpdateWeatherLocation, onDeleteRecentLocation, showToast,
  calendarId = null,
  calendar = null,
  onRequestConfirm = null,
  onRequestDataRefresh = null
}) {
  const React = window.React;
  const __deps = window.GATHER_UI_DEPS || {};
  const __comp = window.GATHER_UI_COMPONENTS || {};
  const SmallXIcon = __deps.SmallXIcon;
  const ToggleSwitch = __deps.ToggleSwitch;
  const ConfirmDialog = __comp.ConfirmDialog || __deps.ConfirmDialog;
  const MoonStarsIcon = __deps.MoonStarsIcon;
  const TextResizeIcon = __deps.TextResizeIcon;
  const BellIcon = __deps.BellIcon;
  const MapCogIcon = __deps.MapCogIcon;
  const translateKoreanToEnglish = __deps.translateKoreanToEnglish;
  const channels = [
    { key: 'chat', label: '채팅 알림' },
    { key: 'memo', label: '메모 알림' },
    { key: 'poll', label: '투표 알림' },
    { key: 'schedule', label: '일정 알림' }
  ];
  const [weatherQuery, setWeatherQuery] = React.useState('');
  const [weatherResults, setWeatherResults] = React.useState([]);
  const [weatherLoading, setWeatherLoading] = React.useState(false);
  const currentWeatherName = (weatherLocation && weatherLocation.name) || '서울';
  const [localConfirmDialog, setLocalConfirmDialog] = React.useState(null);
          const isKoreaResult = (loc) => {
    if (!loc) return false;
    const cc = String(loc.country_code || loc.countryCode || '').toUpperCase();
    if (cc === 'KR') return true;
    const country = String(loc.country || '');
    if (/대한민국|South Korea|Korea, Republic|한국/i.test(country)) return true;
    // open-meteo uses country_code
    return false;
  };

  const handleWeatherSearch = async (e) => {
    if (e) e.preventDefault();
    const cleanQuery = (weatherQuery || '').trim();
    if (!cleanQuery) {
      if (typeof showToast === 'function') showToast('검색할 지역 이름을 입력해 주세요.', 'error');
      return;
    }
    setWeatherLoading(true);
    try {
      const translated = typeof translateKoreanToEnglish === 'function' ? translateKoreanToEnglish(cleanQuery) : cleanQuery;
      let searchResults = [];
      // Domestic only: countryCode=KR (open-meteo) / countrycodes=kr (nominatim)
      if (translated) {
        const res = await withSideMenuTimeout(fetch('https://geocoding-api.open-meteo.com/v1/search?name=' + encodeURIComponent(translated) + '&count=12&language=ko&format=json&countryCode=KR'));
        if (res.ok) {
          const data = await res.json();
          searchResults = (data.results || []).filter(isKoreaResult);
        }
      }
      if (searchResults.length === 0) {
        const res = await withSideMenuTimeout(fetch('https://nominatim.openstreetmap.org/search?q=' + encodeURIComponent(cleanQuery) + '&format=json&limit=12&accept-language=ko&countrycodes=kr'));
        if (res.ok) {
          const data = await res.json();
          searchResults = (data || []).map((item, idx) => ({
            id: 'nominatim_' + (item.place_id || idx),
            name: item.name || (item.display_name || '').split(',')[0],
            latitude: parseFloat(item.lat),
            longitude: parseFloat(item.lon),
            country: '대한민국',
            country_code: 'KR',
            admin1: (item.display_name || '').split(',').slice(1, 2)[0]?.trim() || ''
          }));
        }
      }
      setWeatherResults(searchResults);
      if (searchResults.length === 0 && typeof showToast === 'function') {
        showToast('국내에서 일치하는 지역이 없습니다.', 'info');
      }
    } catch (err) {
      console.error(err);
      if (typeof showToast === 'function') showToast('지역 검색에 실패했습니다.', 'error');
    } finally {
      setWeatherLoading(false);
    }
  };

  const pickWeatherLocation = (loc) => {
    if (!loc) return;
    const normalized = {
      name: loc.name || loc.admin1 || '선택한 지역',
      lat: loc.latitude != null ? loc.latitude : loc.lat,
      lon: loc.longitude != null ? loc.longitude : loc.lon
    };
    if (typeof onUpdateWeatherLocation === 'function') onUpdateWeatherLocation(normalized);
    setWeatherQuery('');
    setWeatherResults([]);
    if (typeof showToast === 'function') showToast((normalized.name || '지역') + ' 날씨로 설정했습니다.', 'success');
  };

  return /*#__PURE__*/React.createElement("div", { className: "modal-overlay", onClick: onClose, style: { zIndex: 12000 } },
    /*#__PURE__*/React.createElement("div", {
      className: "modal-container", onClick: e => e.stopPropagation(),
      style: { maxWidth: '400px', width: '92%', backgroundColor: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-subtle)', overflow: 'hidden' }
    },
      /*#__PURE__*/React.createElement("div", { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid var(--border-subtle)' } },
        /*#__PURE__*/React.createElement("span", { style: { fontWeight: 900, fontSize: '0.98rem' } }, "설정"),
        /*#__PURE__*/React.createElement("button", { type: "button", onClick: onClose, style: { background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' } },
          SmallXIcon ? /*#__PURE__*/React.createElement(SmallXIcon, { size: 20 }) : "✕")
      ),
      /*#__PURE__*/React.createElement("div", { style: { padding: '12px 16px 20px', display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '70vh', overflowY: 'auto' } },
        /* Weather region — above dark mode */
        /*#__PURE__*/React.createElement("div", { style: { padding: '6px 0 12px', display: 'flex', flexDirection: 'column', gap: '8px' } },
          /*#__PURE__*/React.createElement("div", {
            className: "admin-side-menu-setting-row",
            style: { padding: '4px 0 2px', alignItems: 'center' }
          },
            /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-setting-label" },
              /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-setting-icon" },
                MapCogIcon ? /*#__PURE__*/React.createElement(MapCogIcon, { size: 20 }) : null
              ),
              "날씨 지역"
            ),
            /*#__PURE__*/React.createElement("span", {
              style: { fontSize: 'var(--font-size-md)', color: 'var(--text-muted)', fontWeight: 600, flexShrink: 0 }
            }, "현재 : ", /*#__PURE__*/React.createElement("span", { style: { color: 'var(--text-main)', fontWeight: 700 } }, currentWeatherName))
          ),
          /*#__PURE__*/React.createElement("form", {
            onSubmit: handleWeatherSearch,
            style: { display: 'flex', gap: '8px', alignItems: 'center' }
          },
            /*#__PURE__*/React.createElement("input", {
              type: "text",
              value: weatherQuery,
              onChange: e => setWeatherQuery(e.target.value),
              placeholder: "지역 이름 검색 (예: 구로구)",
              style: {
                flex: 1, minWidth: 0, padding: '10px 12px', borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)', background: 'var(--bg-primary)',
                color: 'var(--text-main)', fontSize: 'var(--font-size-base)', outline: 'none'
              }
            }),
            /*#__PURE__*/React.createElement("button", {
              type: "submit",
              disabled: weatherLoading,
              style: {
                flexShrink: 0, padding: '10px 14px', borderRadius: 'var(--radius-md)', border: 'none',
                background: '#0f172a', color: '#fff', fontWeight: 700, fontSize: 'var(--font-size-md)',
                cursor: weatherLoading ? 'wait' : 'pointer'
              }
            }, weatherLoading ? '검색중' : '검색')
          ),
          recentLocations && recentLocations.length > 0 && /*#__PURE__*/React.createElement("div", {
            style: { display: 'flex', flexWrap: 'wrap', gap: '6px' }
          },
            recentLocations.map((loc, idx) => /*#__PURE__*/React.createElement("button", {
              key: idx,
              type: "button",
              onClick: () => pickWeatherLocation(loc),
              style: {
                padding: '5px 10px', fontSize: 'var(--font-size-sm)', borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)', background: 'var(--bg-primary)',
                color: 'var(--text-main)', cursor: 'pointer'
              }
            }, loc.name))
          ),
          weatherResults && weatherResults.length > 0 && /*#__PURE__*/React.createElement("div", {
            style: { display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '160px', overflowY: 'auto' }
          },
            weatherResults.map((loc, idx) => /*#__PURE__*/React.createElement("button", {
              key: loc.id || idx,
              type: "button",
              onClick: () => pickWeatherLocation(loc),
              style: {
                textAlign: 'left', padding: '8px 10px', borderRadius: '8px',
                border: '1px solid var(--border-subtle)', background: 'var(--bg-primary)',
                color: 'var(--text-main)', cursor: 'pointer', fontSize: 'var(--font-size-md)'
              }
            }, loc.name, loc.admin1 ? ' · ' + loc.admin1 : ''))
          )
        ),
        /*#__PURE__*/React.createElement("div", {
          "aria-hidden": "true",
          style: { height: '0', borderTop: '1px solid var(--border-subtle)', margin: '12px 0' }
        }),
        /*#__PURE__*/React.createElement("div", { className: "admin-side-menu-setting-row", style: { padding: '10px 0' } },
          /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-setting-label" },
            /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-setting-icon" }, MoonStarsIcon && /*#__PURE__*/React.createElement(MoonStarsIcon, null)), "다크모드"),
          ToggleSwitch && /*#__PURE__*/React.createElement(ToggleSwitch, { checked: !!isDarkTheme, onChange: onToggleTheme, label: "다크모드" })
        ),
        /*#__PURE__*/React.createElement("div", { className: "admin-side-menu-setting-row", style: { padding: '10px 0' } },
          /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-setting-label" },
            /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-setting-icon" }, TextResizeIcon && /*#__PURE__*/React.createElement(TextResizeIcon, null)), "글자크기"),
          /*#__PURE__*/React.createElement("div", { className: "admin-side-menu-font-controls" },
            /*#__PURE__*/React.createElement("button", { type: "button", onClick: onDecreaseFont, className: "admin-side-menu-font-btn", "aria-label": "글자 크기 줄이기" }, "−"),
            /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-font-value" }, (fontScalePercent || 100) + "%"),
            /*#__PURE__*/React.createElement("button", { type: "button", onClick: onIncreaseFont, className: "admin-side-menu-font-btn", "aria-label": "글자 크기 늘리기" }, "+")
          )
        ),
        /*#__PURE__*/React.createElement("div", {
          "aria-hidden": "true",
          style: { height: '0', borderTop: '1px solid var(--border-subtle)', margin: '12px 0' }
        }),
        /*#__PURE__*/React.createElement("div", { className: "admin-side-menu-setting-row", style: { padding: '10px 0' } },
          /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-setting-label" },
            /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-setting-icon" }, BellIcon && /*#__PURE__*/React.createElement(BellIcon, null)), "알림허용"),
          ToggleSwitch && /*#__PURE__*/React.createElement(ToggleSwitch, { checked: !!isMasterNotifyEnabled, onChange: onToggleMasterNotify, label: "알림허용" })
        ),
        /*#__PURE__*/React.createElement("div", { style: { fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', lineHeight: 1.45, padding: '0 2px 8px' } },
          isNotifPermissionGranted ? "브라우저 알림이 허용된 상태입니다. 아래에서 종류별로 켤 수 있습니다." : "스위치를 켜면 브라우저 알림 허용 요청이 표시됩니다."),
        /*#__PURE__*/React.createElement("div", {
          style: {
            marginTop: '4px', padding: '4px 10px', borderRadius: '12px',
            background: 'var(--bg-primary)', border: '1px solid var(--border-subtle)',
            opacity: isMasterNotifyEnabled ? 1 : 0.55
          }
        },
          channels.map(ch => /*#__PURE__*/React.createElement("div", {
            key: ch.key, className: "admin-side-menu-setting-row",
            style: { padding: '10px 2px' }
          },
            /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-setting-label", style: { fontSize: 'var(--font-size-base)' } }, ch.label),
            ToggleSwitch && /*#__PURE__*/React.createElement(ToggleSwitch, {
              checked: !!(notifyChannels && notifyChannels[ch.key]),
              onChange: () => onToggleNotifyChannel && onToggleNotifyChannel(ch.key),
              label: ch.label
            })
          ))
        ),
        Array.isArray(helpSteps) && helpSteps.length > 0 && /*#__PURE__*/React.createElement("div", {
          style: { marginTop: '10px', padding: '12px', borderRadius: '12px', background: 'var(--bg-primary)', border: 'none', fontSize: 'var(--font-size-md)', color: 'var(--text-muted)', lineHeight: 1.5 }
        },
          /*#__PURE__*/React.createElement("div", { style: { fontWeight: 800, color: 'var(--text-main)', marginBottom: '6px' } }, "설정 안내"),
          /*#__PURE__*/React.createElement("ol", { style: { margin: 0, paddingLeft: '18px' } },
            helpSteps.map((step, i) => /*#__PURE__*/React.createElement("li", { key: i, style: { marginBottom: '4px' } }, step))
          )
        )
      )
    ),
    localConfirmDialog && ConfirmDialog && /*#__PURE__*/React.createElement(ConfirmDialog, {
      title: localConfirmDialog.title,
      message: localConfirmDialog.message,
      onConfirm: () => { const action = localConfirmDialog.onConfirm; setLocalConfirmDialog(null); action(); },
      onCancel: () => setLocalConfirmDialog(null)
    })
  );
}

export function NotificationOnboardingModal({ onClose, isMasterNotifyEnabled, onToggleMasterNotify, helpSteps, browserLabel }) {
  const React = window.React;
  const __deps = window.GATHER_UI_DEPS || {};
  const SmallXIcon = __deps.SmallXIcon;
  const ToggleSwitch = __deps.ToggleSwitch;
  const BellIcon = __deps.BellIcon;
  return /*#__PURE__*/React.createElement("div", { className: "modal-overlay", style: { zIndex: 13000 } },
    /*#__PURE__*/React.createElement("div", {
      className: "modal-container", onClick: e => e.stopPropagation(),
      style: { maxWidth: '400px', width: '92%', backgroundColor: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-subtle)', overflow: 'hidden' }
    },
      /*#__PURE__*/React.createElement("div", { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid var(--border-subtle)' } },
        /*#__PURE__*/React.createElement("span", { style: { fontWeight: 900, fontSize: '0.98rem', display: 'flex', alignItems: 'center', gap: '6px' } },
          BellIcon && /*#__PURE__*/React.createElement(BellIcon, null), "알림 허용 안내"),
        /*#__PURE__*/React.createElement("button", { type: "button", onClick: onClose, style: { background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' } },
          SmallXIcon ? /*#__PURE__*/React.createElement(SmallXIcon, { size: 20 }) : "✕")
      ),
      /*#__PURE__*/React.createElement("div", { style: { padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' } },
        /*#__PURE__*/React.createElement("div", {
          className: "admin-side-menu-setting-row",
          style: { padding: '14px 12px', borderRadius: '12px', background: 'var(--bg-primary)', border: '1px solid var(--border-subtle)' }
        },
          /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-setting-label", style: { fontWeight: 800 } }, "알림허용"),
          ToggleSwitch && /*#__PURE__*/React.createElement(ToggleSwitch, { checked: !!isMasterNotifyEnabled, onChange: onToggleMasterNotify, label: "알림허용" })
        ),
        /*#__PURE__*/React.createElement("p", { style: { margin: 0, fontSize: 'var(--font-size-base)', color: 'var(--text-main)', lineHeight: 1.55 } },
          "채팅·메모·일정·투표 등 새 소식이 등록될 때 알림을 받으려면 알림허용이 필요합니다."),
        /*#__PURE__*/React.createElement("div", { style: { fontSize: 'var(--font-size-md)', color: 'var(--text-muted)', lineHeight: 1.5 } },
          /*#__PURE__*/React.createElement("div", { style: { fontWeight: 800, color: 'var(--text-main)', marginBottom: '6px' } }, (browserLabel || '브라우저') + " 설정 안내"),
          /*#__PURE__*/React.createElement("ol", { style: { margin: 0, paddingLeft: '18px' } },
            (helpSteps || []).map((step, i) => /*#__PURE__*/React.createElement("li", { key: i, style: { marginBottom: '4px' } }, step))
          )
        ),
        /*#__PURE__*/React.createElement("button", { type: "button", className: "btn btn-action-dark btn-action", onClick: onClose, style: { width: '100%', marginTop: '4px' } }, "확인")
      )
    )
  );
}


/** 공통 앱 네비: 채팅 / 정산 / 갤러리 / 장소 / 메모 / 보관함 */
export function SharedAppNavBlock({
  onClose,
  onChangeView,
  onOpenCreateSettlement,
  showSettlement = true,
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
  memoLastTitleWord = null
}) {
  const React = window.React;
  const __deps = window.GATHER_UI_DEPS || {};
  const __comp = window.GATHER_UI_COMPONENTS || {};
  const FolderClockIcon = __comp.FolderClockIcon || __deps.FolderClockIcon;
  const NotepadTextIcon = __comp.NotepadTextIcon || __deps.NotepadTextIcon;
  const go = (view) => {
    if (typeof onChangeView === 'function') onChangeView(view);
    if (typeof onClose === 'function') onClose();
  };
    const metaPill = (text, styleExtra) => {
    if (!text) return null;
    const label = String(text).trim();
    if (!label) return null;
    return /*#__PURE__*/React.createElement("span", {
      className: "side-menu-meta-pill",
      title: label,
      style: Object.assign({
        marginLeft: "auto",
        alignSelf: "center",
        flexShrink: 0,
        maxWidth: "8.25rem",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "flex-end",
        height: "auto",
        minHeight: "auto",
        padding: "0",
        fontSize: "var(--font-size-2xs)",
        fontWeight: 500,
        lineHeight: 1.2,
        borderRadius: "0",
        backgroundColor: "transparent",
        border: "none",
        color: "var(--text-muted, #64748B)",
        boxSizing: "border-box",
        fontVariantNumeric: "tabular-nums"
      }, styleExtra || {})
    }, label);
  };

  const chatAuthorPill = () => {
    if (!chatLastAuthor || !chatLastAuthor.name) return null;
    const color = chatLastAuthor.color || "#64748B";
    return metaPill(chatLastAuthor.name, {
      border: "none",
      color: color,
      backgroundColor: "transparent"
    });
  };

  return /*#__PURE__*/React.createElement("div", {
    className: "admin-side-menu-list",
    style: { borderTop: '1px solid var(--border-subtle, #E2E8F0)', borderBottom: 'none', paddingTop: '6px', marginTop: '2px' }
  },
    /* 1. 채팅 */
    /*#__PURE__*/React.createElement("button", { type: "button", className: "admin-side-menu-item", onClick: () => go("chat") },
      /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-icon" }, /*#__PURE__*/React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }, /*#__PURE__*/React.createElement("path", { d: "M7.9 20A9 9 0 1 0 4 16.1L2 22Z" }))),
      /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-copy" },
        /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-title", style: { display: "flex", alignItems: "center", gap: "6px" } }, "채팅")
      ),
      chatAuthorPill()
    ),
    /* 4. 정산 */
    showSettlement && /*#__PURE__*/React.createElement("button", { type: "button", className: "admin-side-menu-item", onClick: () => go("settlement") },
      /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-icon" }, /*#__PURE__*/React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }, /*#__PURE__*/React.createElement("path", { d: "M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" }), /*#__PURE__*/React.createElement("path", { d: "M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" }))),
      /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-copy" },
        /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-title", style: { display: "flex", alignItems: "center", gap: "6px" } }, "정산",
          settlementBadge && settlementBadge.text && /*#__PURE__*/React.createElement("span", {
            className: "main-menu-badge",
            style: { backgroundColor: settlementBadge.bgColor || "#64748B", color: "#FFFFFF", marginLeft: "4px" }
          }, settlementBadge.text)
        )
      ),
      metaPill(settlementLastDate)
    ),
    /* 5. 갤러리 */
    /*#__PURE__*/React.createElement("button", { type: "button", className: "admin-side-menu-item", onClick: () => go("gallery") },
      /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-icon" }, /*#__PURE__*/React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }, /*#__PURE__*/React.createElement("rect", { width: "18", height: "18", x: "3", y: "3", rx: "2", ry: "2" }), /*#__PURE__*/React.createElement("circle", { cx: "9", cy: "9", r: "2" }), /*#__PURE__*/React.createElement("path", { d: "m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" }))),
      /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-copy" },
        /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-title", style: { display: "flex", alignItems: "center", gap: "6px" } }, "갤러리")
      ),
      metaPill(galleryLastDate)
    ),
    /* 6. 장소 */
    /*#__PURE__*/React.createElement("button", { type: "button", className: "admin-side-menu-item", onClick: () => go("places") },
      /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-icon" }, /*#__PURE__*/React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }, /*#__PURE__*/React.createElement("path", { d: "M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" }), /*#__PURE__*/React.createElement("circle", { cx: "12", cy: "10", r: "3" }))),
      /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-copy" },
        /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-title", style: { display: "flex", alignItems: "center", gap: "6px" } }, "장소")
      ),
      metaPill(placeLastName)
    ),
    /* 7. 메모 */
    /*#__PURE__*/React.createElement("button", { type: "button", className: "admin-side-menu-item", onClick: () => go("memo") },
      /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-icon" }, NotepadTextIcon ? /*#__PURE__*/React.createElement(NotepadTextIcon, { size: 20 }) : null),
      /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-copy" },
        /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-title", style: { display: "flex", alignItems: "center", gap: "6px" } }, "메모")
      ),
      metaPill(memoLastTitleWord)
    ),
    /* 8. 컨텐츠 (지역축제/문화행사/스포츠) */
    /*#__PURE__*/React.createElement("button", { type: "button", className: "admin-side-menu-item", onClick: () => {
      try { localStorage.setItem('gather_content_tab', 'festival'); } catch (_) { /* best-effort */ }
      go("content");
    } },
      /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-icon" }, /*#__PURE__*/React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }, /*#__PURE__*/React.createElement("path", { d: "m12 3-8.5 4.5L12 12l8.5-4.5L12 3Z" }), /*#__PURE__*/React.createElement("path", { d: "m3.5 12 8.5 4.5 8.5-4.5" }), /*#__PURE__*/React.createElement("path", { d: "m3.5 16.5 8.5 4.5 8.5-4.5" }))),
      /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-copy" },
        /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-title", style: { display: "flex", alignItems: "center", gap: "6px" } }, "컨텐츠")
      )
    ),
    /* 9. 보관함 (구 히스토리) */
    /*#__PURE__*/React.createElement("button", { type: "button", className: "admin-side-menu-item", onClick: () => {
      try { localStorage.setItem('gather_history_tab', 'meetings'); } catch (_) { /* best-effort */ }
      go("history");
    } },
      /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-icon" }, FolderClockIcon ? /*#__PURE__*/React.createElement(FolderClockIcon, { size: 20 }) : null),
      /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-copy" },
        /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-title", style: { display: "flex", alignItems: "center", gap: "6px" } }, "기록")
      )
    )
  );
}

export function SharedSideMenuFooter({ onClose, onOpenShare, onOpenSettings, shareLabel = '공유' }) {
  const React = window.React;
  const __deps = window.GATHER_UI_DEPS || {};
  const MenuIcon = __deps.MenuIcon;
  const handle = action => { if (typeof action === 'function') action(); };
  return /*#__PURE__*/React.createElement("div", {
    className: "admin-side-menu-list",
    style: { borderTop: '1px solid var(--border-subtle, #E2E8F0)', borderBottom: 'none', paddingTop: '6px', marginTop: '2px' }
  },
    typeof onOpenShare === 'function' && /*#__PURE__*/React.createElement("button", {
      type: "button", className: "admin-side-menu-item",
      onClick: () => { handle(onClose); handle(onOpenShare); }
    },
      /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-icon" }, MenuIcon ? /*#__PURE__*/React.createElement(MenuIcon, { paths: ["M3 12a3 3 0 1 0 6 0a3 3 0 1 0 -6 0", "M15 6a3 3 0 1 0 6 0a3 3 0 1 0 -6 0", "M15 18a3 3 0 1 0 6 0a3 3 0 1 0 -6 0", "M8.7 10.7l6.6 -3.4", "M8.7 13.3l6.6 3.4"] }) : "↗"),
      /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-copy" },
        /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-title" }, shareLabel)
      )
    ),
    typeof onOpenSettings === 'function' && /*#__PURE__*/React.createElement("button", {
      type: "button", className: "admin-side-menu-item",
      onClick: () => { handle(onClose); handle(onOpenSettings); }
    },
      /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-icon" }, /*#__PURE__*/React.createElement("svg", {
        xmlns: "http://www.w3.org/2000/svg", width: "20", height: "20", viewBox: "0 0 24 24",
        fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round"
      }, /*#__PURE__*/React.createElement("path", { d: "M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" }), /*#__PURE__*/React.createElement("circle", { cx: "12", cy: "12", r: "3" }))),
      /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-copy" },
        /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-title" }, "설정")
      )
    )
  );
}

export function SharedSideMenuSettings({
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
    style: { borderTop: '1px solid var(--border-subtle, #E2E8F0)', borderBottom: 'none', paddingTop: '8px', paddingBottom: '4px', marginTop: '2px' }
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

export function MainSideMenu({
  onOpenAppSettings,
  calendar,
  anniversaries = [],
  galleryCount = 0,
  placeCount = 0,
  chatCount = 0,
  memoCount = 0,
  historyCount = 0,
  settlementCount = 0,
  settlementBadge = null,
  chatLastAuthor = null,
  settlementLastDate = null,
  galleryLastDate = null,
  placeLastName = null,
  memoLastTitleWord = null,
  onClose,
  onOpenManual,
  onOpenSettings,
  onOpenAnniversaries,
  onOpenShare,
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
  onChangeView,
  onOpenCreateSettlement,
  showSettlement = true
}) {
  const React = window.React;
  const __deps = window.GATHER_UI_DEPS || {};
    const SharedSideMenuFooter = (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.SharedSideMenuFooter) || __deps.SharedSideMenuFooter;
  const SharedAppNavBlock = (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.SharedAppNavBlock) || __deps.SharedAppNavBlock;
  const SmallXIcon = __deps.SmallXIcon;
    const CalendarCogIcon = __deps.CalendarCogIcon;
    const GiftIcon = __deps.GiftIcon;
  const LockIcon = __deps.LockIcon;
  const WeatherBadge = __deps.WeatherBadge;
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
  React.useEffect(() => () => {
    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
  }, []);
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "admin-side-menu-overlay",
    onClick: onClose
  }, /*#__PURE__*/React.createElement("nav", {
    className: "admin-side-menu main-side-menu" + (isScrollingActive ? " scroll-active" : ""),
    "aria-label": "메인 메뉴",
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
	            title: "메인 화면",
	            "aria-label": "메인 화면",
	            onClick: () => { onClose && onClose(); if (typeof onChangeView === 'function') onChangeView('calendar'); },
	            style: {
	              background: 'none', border: 'none', padding: 0, margin: 0,
	              color: 'inherit',
	              cursor: 'pointer', textAlign: 'left'
	            }
	          }, "메뉴")
	        )
      ),
        /* Right container: Weather badge + Settings Icon + Close Button */
        /*#__PURE__*/React.createElement("div", {
          style: { display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }
        },
          /* Weather Badge only (region settings moved to AppSettingsModal) */
          /*#__PURE__*/React.createElement(WeatherBadge, { weatherLocation: calendar?.weatherLocation }),
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
    /* Group 1: manual (banner) + calendar settings */
    /*#__PURE__*/React.createElement("div", { className: "admin-side-menu-list", style: { borderTop: 'none', borderBottom: 'none', paddingTop: '4px' } },
      /*#__PURE__*/React.createElement("button", {
        type: "button",
        className: "admin-side-menu-item main-side-menu-manual-banner",
        onClick: () => handle(onOpenManual)
      },
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
      /* 기념일 설정 -- split out of 캘린더 설정's own tab bar (that modal was accumulating too
         many sub-tabs) into its own top-level menu entry, right below it. */
      /*#__PURE__*/React.createElement("button", {
        type: "button",
        className: "admin-side-menu-item",
        onClick: () => handle(onOpenAnniversaries)
      },
        /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-icon" }, /*#__PURE__*/React.createElement(GiftIcon, null)),
        /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-copy" },
          /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-title" }, "기념일 설정")
        )
      )
    ),
    /* Group 2: 채팅 / 정산 / 갤러리 / 장소 / 메모 */
    typeof SharedAppNavBlock === 'function' && /*#__PURE__*/React.createElement(SharedAppNavBlock, {
      onClose: onClose,
      onChangeView: onChangeView,
      onOpenCreateSettlement: onOpenCreateSettlement,
      showSettlement: showSettlement,
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
/* Group 3+4: 공유하기 + 설정 */
    typeof SharedSideMenuFooter === 'function' && /*#__PURE__*/React.createElement(SharedSideMenuFooter, {
      onClose: onClose,
      onOpenShare: onOpenShare,
      onOpenSettings: onOpenAppSettings,
      shareLabel: '공유'
    }),
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
  )));
}

  if (typeof window !== 'undefined') {
  window.GATHER_UI_COMPONENTS = Object.assign({}, window.GATHER_UI_COMPONENTS || {}, {
    SharedSideMenuSettings: SharedSideMenuSettings,
    SharedSideMenuFooter: SharedSideMenuFooter,
    SharedAppNavBlock: SharedAppNavBlock,
    AppSettingsModal: AppSettingsModal,
    NotificationOnboardingModal: NotificationOnboardingModal,
    MainSideMenu: MainSideMenu,
  });
}
