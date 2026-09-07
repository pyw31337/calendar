/**
 * Weather badge + location modal (P4-8)
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

function getWeatherIcon(...args) {
  const f = __gatherUiDeps().getWeatherIcon || GATHER_APP_UTILS.getWeatherIcon;
  return typeof f === 'function' ? f(...args) : undefined;
}
function translateKoreanToEnglish(...args) {
  const f = __gatherUiDeps().translateKoreanToEnglish || GATHER_APP_UTILS.translateKoreanToEnglish;
  return typeof f === 'function' ? f(...args) : undefined;
}
const WEATHER_CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour
/** In-memory L1 so multiple badges on the same page share one result without extra reads. */
const __weatherMem = typeof Map !== 'undefined' ? new Map() : null;
const WEATHER_FIRESTORE_TIMEOUT_MS = 7000;
function withWeatherTimeout(promise, timeoutMs = WEATHER_FIRESTORE_TIMEOUT_MS) {
  return Promise.race([promise, new Promise((_, reject) => setTimeout(() => reject(new Error('weather cache timeout')), timeoutMs))]);
}

function weatherCacheKey(lat, lon) {
  return String(Number(lat).toFixed(2)) + '_' + String(Number(lon).toFixed(2));
}

function getFirebaseDb() {
  try {
    if (typeof window !== 'undefined' && window.__gatherFirebaseDb) return window.__gatherFirebaseDb;
  } catch (_) {}
  return null;
}

function readMemWeather(lat, lon) {
  if (!__weatherMem) return null;
  const entry = __weatherMem.get(weatherCacheKey(lat, lon));
  if (!entry || entry.temp == null || entry.fetchedAt == null) return null;
  const age = Date.now() - Number(entry.fetchedAt);
  return {
    temp: entry.temp,
    code: entry.code,
    fetchedAt: entry.fetchedAt,
    fresh: age >= 0 && age < WEATHER_CACHE_TTL_MS
  };
}

function writeMemWeather(lat, lon, temp, code, fetchedAt) {
  if (!__weatherMem) return;
  __weatherMem.set(weatherCacheKey(lat, lon), {
    temp: temp,
    code: code,
    fetchedAt: fetchedAt != null ? fetchedAt : Date.now()
  });
}

async function readServerWeather(lat, lon) {
  const db = getFirebaseDb();
  if (!db) return null;
  try {
    const snap = await withWeatherTimeout(db.collection('weatherCache').doc(weatherCacheKey(lat, lon)).get());
    if (!snap || !snap.exists) return null;
    const d = snap.data() || {};
    if (d.temp == null || d.fetchedAt == null) return null;
    const age = Date.now() - Number(d.fetchedAt);
    return {
      temp: d.temp,
      code: d.code,
      fetchedAt: d.fetchedAt,
      fresh: age >= 0 && age < WEATHER_CACHE_TTL_MS
    };
  } catch (err) {
    console.warn('weather server read failed', err);
    return null;
  }
}

async function writeServerWeather(lat, lon, temp, code, name) {
  const db = getFirebaseDb();
  if (!db) return;
  try {
    const fetchedAt = Date.now();
    await withWeatherTimeout(db.collection('weatherCache').doc(weatherCacheKey(lat, lon)).set({
      temp: temp,
      code: code,
      lat: Number(Number(lat).toFixed(2)),
      lon: Number(Number(lon).toFixed(2)),
      fetchedAt: fetchedAt,
      name: name ? String(name).slice(0, 80) : null
    }, { merge: true }));
    writeMemWeather(lat, lon, temp, code, fetchedAt);
  } catch (err) {
    console.warn('weather server write failed', err);
  }
}

async function fetchOpenMeteo(lat, lon) {
  const res = await withWeatherTimeout(fetch(
    'https://api.open-meteo.com/v1/forecast?latitude=' + lat + '&longitude=' + lon + '&current=temperature_2m,weather_code'
  ));
  if (!res.ok) throw new Error('날씨 정보 로드 실패');
  const data = await res.json();
  return {
    temp: data.current.temperature_2m,
    code: data.current.weather_code
  };
}

export function WeatherBadge({ weatherLocation }) {
  const React = window.React;

  const effectiveLocation = weatherLocation || { name: '서울', lat: 37.566, lon: 126.9784 };
  const mem0 = (effectiveLocation?.lat != null && effectiveLocation?.lon != null)
    ? readMemWeather(effectiveLocation.lat, effectiveLocation.lon)
    : null;
  const [weather, setWeather] = React.useState(() => {
    if (mem0 && mem0.fresh) {
      return { temp: mem0.temp, code: mem0.code, loading: false, error: null };
    }
    if (mem0) {
      return { temp: mem0.temp, code: mem0.code, loading: false, error: null };
    }
    return { temp: null, code: null, loading: true, error: null };
  });

  React.useEffect(() => {
    if (!effectiveLocation?.lat || !effectiveLocation?.lon) {
      setWeather({ temp: null, code: null, loading: false, error: null });
      return;
    }

    let active = true;
    const lat = effectiveLocation.lat;
    const lon = effectiveLocation.lon;
    const name = effectiveLocation.name || '';

    const apply = (temp, code) => {
      if (!active) return;
      setWeather({ temp: temp, code: code, loading: false, error: null });
    };

    const run = async () => {
      // L1 memory
      const mem = readMemWeather(lat, lon);
      if (mem && mem.fresh) {
        apply(mem.temp, mem.code);
        return;
      }
      if (mem) apply(mem.temp, mem.code);

      // L2 Firestore shared cache (all users / devices)
      const server = await readServerWeather(lat, lon);
      if (!active) return;
      if (server && server.fresh) {
        writeMemWeather(lat, lon, server.temp, server.code, server.fetchedAt);
        apply(server.temp, server.code);
        return;
      }
      if (server && !mem) {
        writeMemWeather(lat, lon, server.temp, server.code, server.fetchedAt);
        apply(server.temp, server.code);
      }
      if (!mem && !server) {
        setWeather({ temp: null, code: null, loading: true, error: null });
      }

      // L3 Open-Meteo — only when cache missing or older than 1h
      try {
        const live = await fetchOpenMeteo(lat, lon);
        if (!active) return;
        writeMemWeather(lat, lon, live.temp, live.code, Date.now());
        apply(live.temp, live.code);
        // fire-and-forget server write so the next user hits cache
        writeServerWeather(lat, lon, live.temp, live.code, name);
      } catch (err) {
        console.error('Weather fetch error:', err);
        if (!active) return;
        if (server || mem) {
          const fallback = server || mem;
          apply(fallback.temp, fallback.code);
        } else {
          setWeather({ temp: null, code: null, loading: false, error: 'Fail' });
        }
      }
    };

    run();
    return () => { active = false; };
  }, [effectiveLocation.lat, effectiveLocation.lon]);

  if (weather.loading) {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 'var(--font-size-sm)',
        fontWeight: 'bold',
        color: 'var(--text-muted)',
        backgroundColor: 'var(--border-subtle)',
        padding: '4px 10px',
        borderRadius: 'var(--radius-md)',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        height: '28px',
        boxSizing: 'border-box'
      }
    }, "로딩 중...");
  }
  if (weather.error) return null;

  const displayTemp = weather.temp !== null ? `${Math.round(weather.temp)}°C` : '';
  const cleanName = effectiveLocation.name || '지역';

  const handleClick = (e) => {
    e.stopPropagation();
    window.open(`https://www.windy.com/?${effectiveLocation.lat},${effectiveLocation.lon},6`, '_blank', 'noopener,noreferrer');
  };

  return /*#__PURE__*/React.createElement("div", {
    onClick: handleClick,
    title: `${cleanName} 날씨 상세 보기 (windy.com 이동)`,
    style: {
      fontSize: 'var(--font-size-sm)',
      fontWeight: 'bold',
      color: '#3B82F6',
      backgroundColor: 'rgba(59, 130, 246, 0.08)',
      border: '1px solid rgba(59, 130, 246, 0.16)',
      padding: '4px 10px',
      borderRadius: 'var(--radius-md)',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '5px',
      cursor: 'pointer',
      height: '28px',
      boxSizing: 'border-box',
      transition: 'background-color 0.2s ease, border-color 0.2s ease'
    },
    className: "weather-badge-hover"
  },
    /* Region Name */
    /*#__PURE__*/React.createElement("span", {
      style: {
        // Allow up to 5 Korean characters (e.g. 서울특별시) without ellipsis; longer names truncate.
        maxWidth: (cleanName && cleanName.length > 5) ? '5.6em' : 'none',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        flexShrink: 1
      },
      title: cleanName
    }, cleanName),
    /* Weather Icon */
    getWeatherIcon(weather.code),
    /* Temperature */
    /*#__PURE__*/React.createElement("span", null, displayTemp)
  );
}

export function WeatherLocationModal({ onClose, onSelectLocation, onDeleteRecentLocation, showToast, recentLocations = [] }) {
  const React = window.React;
  const __deps = window.GATHER_UI_DEPS || {};
  const __comp = window.GATHER_UI_COMPONENTS || {};
  const ResizableModalContainer = __comp.ResizableModalContainer || __deps.ResizableModalContainer || (function Shell(p) { return React.createElement('div', p, p.children); });
  const SmallXIcon = __deps.SmallXIcon;
  const TrashIcon = __deps.TrashIcon;
  const SettingsIcon = __deps.SettingsIcon;

  const [query, setQuery] = React.useState('');
  const [results, setResults] = React.useState([]);
  const [loading, setLoading] = React.useState(false);

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    const cleanQuery = query.trim();
    if (!cleanQuery) {
      showToast('검색할 지역 이름을 입력해 주세요.', 'error');
      return;
    }
    setLoading(true);
    try {
      const translated = translateKoreanToEnglish(cleanQuery);
      let searchResults = [];

      if (translated) {
        const res = await withWeatherTimeout(fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(translated)}&count=10&language=ko&format=json`));
        if (res.ok) {
          const data = await res.json();
          searchResults = data.results || [];
        }
      }

      if (searchResults.length === 0) {
        const res = await withWeatherTimeout(fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(cleanQuery)}&format=json&limit=10&accept-language=ko`));
        if (res.ok) {
          const data = await res.json();
          searchResults = (data || []).map((item, idx) => ({
            id: `nominatim_${item.place_id || idx}`,
            name: item.name || item.display_name.split(',')[0],
            latitude: parseFloat(item.lat),
            longitude: parseFloat(item.lon),
            country: item.display_name.split(',').pop().trim(),
            admin1: item.display_name.split(',').slice(-2, -1)[0]?.trim() || ''
          }));
        }
      }

      setResults(searchResults);
      if (searchResults.length === 0) {
        showToast('일치하는 지역이 없습니다.', 'info');
      }
    } catch (err) {
      console.error(err);
      showToast('지역 검색에 실패했습니다.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return /*#__PURE__*/React.createElement("div", {
    className: "modal-overlay",
    onClick: onClose,
    style: { zIndex: 12000 }
  }, /*#__PURE__*/React.createElement(ResizableModalContainer, {
    className: "modal-container",
    style: { maxWidth: '380px', width: '90%', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)' },
    onClick: e => e.stopPropagation()
  },
    /* Header */
    /*#__PURE__*/React.createElement("div", {
      style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid var(--border-subtle)' }
    },
      /* Title */
      /*#__PURE__*/React.createElement("span", {
        style: { fontSize: '0.92rem', fontWeight: '900', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }
      }, /*#__PURE__*/React.createElement(SettingsIcon, { size: 16 }), "날씨 정보 지역 설정"),
      /* Close */
      /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: onClose,
        style: { width: '28px', height: '28px', borderRadius: '50%', border: 'none', background: 'var(--border-subtle)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }
      }, /*#__PURE__*/React.createElement(SmallXIcon, { size: 14 }))
    ),

    /* Body */
    /*#__PURE__*/React.createElement("div", {
      style: { padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }
    },
      /* Recent / Saved Locations */
      recentLocations && recentLocations.length > 0 && /*#__PURE__*/React.createElement("div", {
        style: { display: 'flex', flexDirection: 'column', gap: '6px' }
      },
        /*#__PURE__*/React.createElement("span", {
          style: { fontSize: 'var(--font-size-sm)', fontWeight: 'bold', color: 'var(--text-muted)' }
        }, "자주 찾는 지역"),
        /*#__PURE__*/React.createElement("div", {
          style: { display: 'flex', flexWrap: 'wrap', gap: '6px' }
        },
          recentLocations.map((loc, idx) => 
            /*#__PURE__*/React.createElement("div", {
              key: idx,
              style: { position: 'relative', display: 'inline-block' }
            },
              /*#__PURE__*/React.createElement("button", {
                type: "button",
                onClick: () => {
                  onSelectLocation(loc);
                  onClose();
                },
                style: {
                  padding: '6px 20px 6px 10px',
                  fontSize: 'var(--font-size-sm)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                  backgroundColor: 'var(--bg-primary)',
                  color: 'var(--text-main)',
                  cursor: 'pointer',
                  transition: 'background-color 0.15s ease'
                },
                className: "weather-recent-btn"
              }, loc.name),
              /*#__PURE__*/React.createElement("button", {
                type: "button",
                onClick: (e) => {
                  e.stopPropagation();
                  onDeleteRecentLocation && onDeleteRecentLocation(loc);
                },
                "aria-label": `${loc.name} 삭제`,
                style: {
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  width: '14px',
                  height: '14px',
                  borderRadius: '50%',
                  backgroundColor: '#EF4444',
                  color: '#FFFFFF',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 'var(--font-size-2xs)',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  zIndex: 2,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                  padding: 0,
                  lineHeight: 1
                }
              }, /*#__PURE__*/React.createElement(TrashIcon, { size: 9 }))
            )
          )
        )
      ),

      /* Search Input Form */
      /*#__PURE__*/React.createElement("form", {
        onSubmit: handleSearch,
        style: { display: 'flex', gap: '6px', width: '100%', boxSizing: 'border-box' }
      },
        /*#__PURE__*/React.createElement("input", {
          type: "text",
          className: "form-input",
          placeholder: "지역 이름 입력 (예: 서울, 파주)",
          value: query,
          onChange: e => setQuery(e.target.value),
          style: { flex: 1, minWidth: 0, padding: '8px 12px', fontSize: 'var(--font-size-md)', boxSizing: 'border-box' }
        }),
        /*#__PURE__*/React.createElement("button", {
          type: "submit",
          className: "btn btn-primary",
          disabled: loading,
          style: { padding: '8px 14px', fontSize: 'var(--font-size-md)', flexShrink: 0 }
        }, loading ? "검색 중" : "검색")
      ),

      /* Results list */
      /*#__PURE__*/React.createElement("div", {
        style: { maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }
      },
        results.map(r => {
          const regionLabel = [r.admin1, r.country].filter(Boolean).join(', ');
          return /*#__PURE__*/React.createElement("button", {
            key: r.id,
            type: "button",
            onClick: () => {
              onSelectLocation({ name: r.name, lat: r.latitude, lon: r.longitude });
              onClose();
            },
            className: "bottom-sheet-item",
            style: {
              width: '100%',
              textAlign: 'left',
              padding: '10px 12px',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-primary)',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: '2px',
              boxSizing: 'border-box',
              flexShrink: 0
            }
          },
            /*#__PURE__*/React.createElement("span", { style: { fontSize: 'var(--font-size-base)', fontWeight: 'bold', color: 'var(--text-main)' } }, r.name),
            /*#__PURE__*/React.createElement("span", { style: { fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' } }, `${regionLabel} (${r.latitude.toFixed(3)}, ${r.longitude.toFixed(3)})`)
          );
        })
      )
    )
  ));
}

  if (typeof window !== 'undefined') {
  window.GATHER_UI_COMPONENTS = Object.assign({}, window.GATHER_UI_COMPONENTS || {}, {
    WeatherBadge: WeatherBadge,
    WeatherLocationModal: WeatherLocationModal,
  });
}
