/**
 * Weather badge + location modal (P4-8)
 */

import {
  getWeatherIcon as getCoreWeatherIcon,
  getWeatherDescription,
  fetchDetailedWeatherForecast,
  resolveDailyForecast
} from '../core/app-weather.js';

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
  const f = __gatherUiDeps().getWeatherIcon || GATHER_APP_UTILS.getWeatherIcon || getCoreWeatherIcon;
  return typeof f === 'function' ? f(...args) : getCoreWeatherIcon(...args);
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

/**
 * Daily forecast for a single date (confirmed-meeting banner). Open-Meteo only forecasts ~16 days
 * ahead, so past dates and dates further out render nothing. The hero strip and this badge share
 * resolveDailyForecast (same rounded coordinates, same daily max + weather code).
 */
const DAILY_FORECAST_MAX_DAYS = 15;

function daysAheadOf(dateStr) {
  const target = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(target.getTime())) return NaN;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / 86400000);
}

export function DailyWeatherIcon({ date, lat, lon, locationName, className, size = 18 }) {
  const React = window.React;
  const latNum = Number(lat);
  const lonNum = Number(lon);
  const hasCoords = lat != null && lon != null && Number.isFinite(latNum) && Number.isFinite(lonNum);
  const ahead = date ? daysAheadOf(date) : NaN;
  const inRange = hasCoords && Number.isFinite(ahead) && ahead >= 0 && ahead <= DAILY_FORECAST_MAX_DAYS;
  const [forecast, setForecast] = React.useState(null);

  React.useEffect(() => {
    setForecast(null);
    if (!inRange) return undefined;
    let active = true;
    resolveDailyForecast(latNum, lonNum, date)
      .then((value) => { if (active) setForecast(value); })
      .catch(() => { if (active) setForecast(null); });
    return () => { active = false; };
  }, [inRange, latNum, lonNum, date]);

  if (!inRange || !forecast) return null;
  const maxT = forecast.max != null ? Math.round(forecast.max) : null;
  const minT = forecast.min != null ? Math.round(forecast.min) : null;
  const place = locationName ? `${locationName} ` : '';
  const range = maxT != null && minT != null ? ` 최고 ${maxT}° / 최저 ${minT}°` : '';
  const label = `${place}예보${range}`;
  return React.createElement('span', {
    className: className || 'daily-weather-icon',
    title: label,
    'aria-label': label,
    role: 'img',
  },
    getWeatherIcon(forecast.code, size),
    maxT != null ? React.createElement('span', { className: 'daily-weather-temp', 'aria-hidden': 'true' }, `${maxT}°`) : null
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
    style: { maxWidth: '520px', width: '92%', maxHeight: '90vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)' },
    onClick: e => e.stopPropagation()
  },
    /* Header */
    /*#__PURE__*/React.createElement("div", {
      className: "modal-header",
      style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: '1px solid var(--border-subtle)' }
    },
      /* Title */
      /*#__PURE__*/React.createElement("span", {
        style: { fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }
      }, /*#__PURE__*/React.createElement(SettingsIcon, { size: 16 }), "날씨 정보 지역 설정"),
      /* Close */
      /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: onClose,
        className: "modal-close-btn",
        "aria-label": "닫기",
        style: { width: '32px', height: '32px', border: 'none', background: 'transparent', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: '4px' }
      }, /*#__PURE__*/React.createElement(SmallXIcon, { size: 20 }))
    ),

    /* Body */
    /*#__PURE__*/React.createElement("div", {
      className: "modal-body",
      style: { padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', flex: '1 1 auto', minHeight: 0, overflowY: 'auto' }
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

// --- Korea Regions Geo Coordinates & District Mapping ---
const KOREA_REGIONS_GEO = [
  { code: 'seoul', label: '서울', fullName: '서울특별시', lat: 37.5665, lon: 126.9780, gugun: '종로구,중구,용산구,성동구,광진구,동대문구,중랑구,성북구,강북구,도봉구,노원구,은평구,서대문구,마포구,양천구,강서구,구로구,금천구,영등포구,동작구,관악구,서초구,강남구,송파구,강동구'.split(',') },
  { code: 'busan', label: '부산', fullName: '부산광역시', lat: 35.1796, lon: 129.0756, gugun: '중구,서구,동구,영도구,부산진구,동래구,남구,북구,해운대구,사하구,금정구,강서구,연제구,수영구,사상구,기장군'.split(',') },
  { code: 'daegu', label: '대구', fullName: '대구광역시', lat: 35.8714, lon: 128.6014, gugun: '중구,동구,서구,남구,북구,수성구,달서구,달성군,군위군'.split(',') },
  { code: 'incheon', label: '인천', fullName: '인천광역시', lat: 37.4563, lon: 126.7052, gugun: '중구,동구,미추홀구,연수구,남동구,부평구,계양구,서구,강화군,옹진군'.split(',') },
  { code: 'gwangju', label: '광주', fullName: '광주광역시', lat: 35.1595, lon: 126.8526, gugun: '동구,서구,남구,북구,광산구'.split(',') },
  { code: 'daejeon', label: '대전', fullName: '대전광역시', lat: 36.3504, lon: 127.3845, gugun: '동구,중구,서구,유성구,대덕구'.split(',') },
  { code: 'ulsan', label: '울산', fullName: '울산광역시', lat: 35.5384, lon: 129.3114, gugun: '중구,남구,동구,북구,울주군'.split(',') },
  { code: 'sejong', label: '세종', fullName: '세종특별자치시', lat: 36.4800, lon: 127.2890, gugun: ['세종시'] },
  { code: 'gyeonggi', label: '경기', fullName: '경기도', lat: 37.2636, lon: 127.0286, gugun: '수원시,성남시,의정부시,안양시,부천시,광명시,평택시,동두천시,안산시,고양시,과천시,구리시,남양주시,오산시,시흥시,군포시,의왕시,하남시,용인시,파주시,이천시,안성시,김포시,화성시,광주시,양주시,포천시,여주시,연천군,가평군,양평군'.split(',') },
  { code: 'gangwon', label: '강원', fullName: '강원특별자치도', lat: 37.8854, lon: 127.7298, gugun: '춘천시,원주시,강릉시,동해시,태백시,속초시,삼척시,홍천군,횡성군,영월군,평창군,정선군,철원군,화천군,양구군,인제군,고성군,양양군'.split(',') },
  { code: 'chungbuk', label: '충북', fullName: '충청북도', lat: 36.6424, lon: 127.4890, gugun: '청주시,충주시,제천시,보은군,옥천군,영동군,증평군,진천군,괴산군,음성군,단양군'.split(',') },
  { code: 'chungnam', label: '충남', fullName: '충청남도', lat: 36.6012, lon: 126.6608, gugun: '천안시,공주시,보령시,아산시,서산시,논산시,계룡시,당진시,금산군,부여군,서천군,청양군,홍성군,예산군,태안군'.split(',') },
  { code: 'jeonbuk', label: '전북', fullName: '전북특별자치도', lat: 35.8242, lon: 127.1480, gugun: '전주시,군산시,익산시,정읍시,남원시,김제시,완주군,진안군,무주군,장수군,임실군,순창군,고창군,부안군'.split(',') },
  { code: 'jeonnam', label: '전남', fullName: '전라남도', lat: 34.8160, lon: 126.4630, gugun: '목포시,여수시,순천시,나주시,광양시,담양군,곡성군,구례군,고흥군,보성군,화순군,장흥군,강진군,해남군,영암군,무안군,함평군,영광군,장성군,완도군,진도군,신안군'.split(',') },
  { code: 'gyeongbuk', label: '경북', fullName: '경상북도', lat: 36.5684, lon: 128.7294, gugun: '포항시,경주시,김천시,안동시,구미시,영주시,영천시,상주시,문경시,경산시,의성군,청송군,영양군,영덕군,청도군,고령군,성주군,칠곡군,예천군,봉화군,울진군,울릉군'.split(',') },
  { code: 'gyeongnam', label: '경남', fullName: '경상남도', lat: 35.2280, lon: 128.6811, gugun: '창원시,진주시,통영시,사천시,김해시,밀양시,거제시,양산시,의령군,함안군,창녕군,고성군,남해군,하동군,산청군,함양군,거창군,합천군'.split(',') },
  { code: 'jeju', label: '제주', fullName: '제주특별자치도', lat: 33.4996, lon: 126.5312, gugun: ['제주시', '서귀포시'] }
];

const KOREA_REGION_GUGUN_MAP = KOREA_REGIONS_GEO.flatMap(region =>
  region.gugun.map(gugun => ({ code: region.code, label: region.label, fullName: region.fullName, gugun }))
);

async function resolveLocationCoordinates(queryName, fallbackLat = 37.566, fallbackLon = 126.9784) {
  const clean = String(queryName || '').trim();
  if (!clean) return { lat: fallbackLat, lon: fallbackLon, name: '서울특별시' };

  // Match Si/Do
  const directSido = KOREA_REGIONS_GEO.find(r => r.label === clean || r.fullName === clean || r.code === clean);
  if (directSido) {
    return { lat: directSido.lat, lon: directSido.lon, name: directSido.fullName || directSido.label };
  }

  // Geocoding via Open-Meteo
  try {
    const translated = translateKoreanToEnglish(clean);
    if (translated) {
      const res = await withWeatherTimeout(
        fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(translated)}&count=1&language=ko&format=json`),
        3500
      );
      if (res && res.ok) {
        const data = await res.json();
        if (data && data.results && data.results[0]) {
          return {
            lat: parseFloat(data.results[0].latitude),
            lon: parseFloat(data.results[0].longitude),
            name: clean,
            areaName: [data.results[0].admin1, data.results[0].admin2].filter(Boolean).join(' ')
          };
        }
      }
    }
  } catch (_) {}

  // Nominatim fallback
  try {
    const res = await withWeatherTimeout(
      fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(clean)}&format=json&addressdetails=1&limit=1&accept-language=ko`),
      3500
    );
    if (res && res.ok) {
      const data = await res.json();
      if (data && data[0]) {
        return {
          lat: parseFloat(data[0].lat),
          lon: parseFloat(data[0].lon),
          name: clean,
          areaName: getWeatherAreaName(data[0].address)
        };
      }
    }
  } catch (_) {}

  return { lat: fallbackLat, lon: fallbackLon, name: clean };
}

/**
 * Preserve an understandable, geographically meaningful forecast label.  We
 * deliberately keep this to administrative fields: a venue name is useful in
 * the title, but it must not masquerade as the forecast region.
 */
function getWeatherAreaName(address) {
  if (!address || typeof address !== 'object') return '';
  const parts = [
    address.state,
    address.province,
    address.city,
    address.county,
    address.city_district,
    address.district,
    address.town,
    address.village
  ]
    .map(value => String(value || '').trim())
    .filter(Boolean)
    .filter((value, index, list) => list.indexOf(value) === index);
  return parts.join(' ');
}

/**
 * A saved place can have coordinates without an address (for example an
 * imported pin).  Resolve only its display-area label so the forecast remains
 * tied to the original coordinates and never silently falls back to Seoul.
 */
async function reverseGeocodeWeatherArea(lat, lon) {
  const latitude = Number(lat);
  const longitude = Number(lon);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return '';

  try {
    const response = await withWeatherTimeout(
      fetch(`https://nominatim.openstreetmap.org/reverse?lat=${encodeURIComponent(latitude)}&lon=${encodeURIComponent(longitude)}&format=jsonv2&addressdetails=1&zoom=10&accept-language=ko`),
      3500
    );
    if (!response?.ok) return '';
    const data = await response.json();
    return getWeatherAreaName(data?.address);
  } catch (_) {
    return '';
  }
}

/**
 * WeatherLocationSettingModal
 * 첨부파일(media_1790669586844.png) 규격의 지역 설정 모달
 */
export function WeatherLocationSettingModal({ isOpen, onClose, onSelectLocation, currentLocationName }) {
  const React = window.React;
  const [query, setQuery] = React.useState('');
  const [expandedSido, setExpandedSido] = React.useState('');
  const [draftGugun, setDraftGugun] = React.useState('');
  const [isLocating, setIsLocating] = React.useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setExpandedSido('');
      setDraftGugun('');
      setQuery('');
    }
  }, [isOpen]);

  React.useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) return;
    const match = KOREA_REGION_GUGUN_MAP.find(entry => entry.gugun.includes(trimmed) || entry.label === trimmed);
    if (match) {
      setExpandedSido(match.code);
      if (match.gugun.includes(trimmed)) setDraftGugun(match.gugun);
    }
  }, [query]);

  if (!isOpen) return null;

  const activeRegion = KOREA_REGIONS_GEO.find(r => r.code === expandedSido);

  const handleLocate = () => {
    if (isLocating || typeof navigator === 'undefined' || !navigator.geolocation) return;
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        setIsLocating(false);
        onSelectLocation?.({
          name: '현재 위치',
          regionName: '현재 위치',
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
          needsReverseGeocode: true
        });
        onClose?.();
      },
      err => {
        console.warn('Geolocation error:', err);
        setIsLocating(false);
      },
      { timeout: 7000, enableHighAccuracy: true }
    );
  };

  const handleSave = async () => {
    if (!expandedSido && !query.trim()) return;

    if (query.trim() && !activeRegion) {
      const resolved = await resolveLocationCoordinates(query.trim());
      onSelectLocation?.(resolved);
      onClose?.();
      return;
    }

    if (!activeRegion) return;

    if (draftGugun && draftGugun !== '전체') {
      const searchTarget = `${activeRegion.label} ${draftGugun}`;
      const resolved = await resolveLocationCoordinates(searchTarget, activeRegion.lat, activeRegion.lon);
      onSelectLocation?.({
        name: searchTarget,
        regionName: `${activeRegion.fullName || activeRegion.label} ${draftGugun}`,
        lat: resolved.lat,
        lon: resolved.lon
      });
      onClose?.();
    } else {
      onSelectLocation?.({
        name: activeRegion.fullName || activeRegion.label,
        regionName: activeRegion.fullName || activeRegion.label,
        lat: activeRegion.lat,
        lon: activeRegion.lon
      });
      onClose?.();
    }
  };

  const displayLocationName = currentLocationName || (() => {
    try {
      if (typeof localStorage !== 'undefined') {
        const saved = localStorage.getItem('gather_weather_user_location');
        if (saved) {
          const parsed = JSON.parse(saved);
          return formatWeatherLocationArea(parsed) || parsed.name || '';
        }
      }
    } catch (_) {}
    return '';
  })();

  const modalNode = /*#__PURE__*/React.createElement("div", {
    className: "modal-overlay region-filter-overlay",
    onClick: onClose,
    style: { zIndex: 13500 }
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal-container region-filter-sheet",
    role: "dialog",
    "aria-modal": "true",
    "aria-label": "지역 설정",
    onClick: e => e.stopPropagation()
  },
    /* Drag Handle for Mobile */
    /*#__PURE__*/React.createElement("div", {
      className: "v2-modal-drag-handle",
      style: { width: '36px', height: '4px', backgroundColor: 'var(--border-subtle, rgba(0,0,0,0.15))', borderRadius: '9999px', margin: '8px auto 0' }
    }),
    /* Header */
    /*#__PURE__*/React.createElement("div", { className: "modal-header" },
      /*#__PURE__*/React.createElement("h3", {
        style: { display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }
      },
        "지역 설정",
        displayLocationName ? /*#__PURE__*/React.createElement("span", {
          className: "region-setting-current-location",
          style: {
            fontSize: '0.78rem',
            fontWeight: 600,
            color: 'var(--brand, #7C2FE5)',
            letterSpacing: '-0.01em'
          }
        }, `설정위치 : ${displayLocationName}`) : null
      ),
      /*#__PURE__*/React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '10px' } },
        (expandedSido || draftGugun || query) && /*#__PURE__*/React.createElement("button", {
          type: "button",
          className: "region-filter-reset-btn",
          onClick: () => { setExpandedSido(''); setDraftGugun(''); setQuery(''); }
        }, "초기화"),
        /*#__PURE__*/React.createElement("button", {
          type: "button",
          className: "modal-close-btn",
          onClick: onClose,
          "aria-label": "닫기",
          style: { background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.2rem', cursor: 'pointer' }
        }, "✕")
      )
    ),
    /* Body */
    /*#__PURE__*/React.createElement("div", { className: "modal-body region-filter-body" },
      /* Search Input & GPS */
      /*#__PURE__*/React.createElement("div", { className: "region-filter-search-row" },
        /*#__PURE__*/React.createElement("input", {
          type: "text",
          className: "form-input",
          placeholder: "지역명으로 검색 (예: 부천)",
          value: query,
          onChange: e => setQuery(e.target.value),
          onKeyDown: e => { if (e.key === 'Enter') handleSave(); },
          autoFocus: true
        }),
        /*#__PURE__*/React.createElement("button", {
          type: "button",
          className: "region-filter-locate-btn",
          disabled: isLocating,
          onClick: handleLocate,
          title: "현재 위치로 검색",
          "aria-label": "현재 위치로 검색"
        },
          /* GPS Crosshair Icon */
          /*#__PURE__*/React.createElement("svg", {
            width: 18, height: 18, viewBox: "0 0 24 24", fill: "none",
            stroke: "currentColor", strokeWidth: 2.2, strokeLinecap: "round", strokeLinejoin: "round"
          },
            /*#__PURE__*/React.createElement("line", { x1: 2, y1: 12, x2: 5, y2: 12 }),
            /*#__PURE__*/React.createElement("line", { x1: 19, y1: 12, x2: 22, y2: 12 }),
            /*#__PURE__*/React.createElement("line", { x1: 12, y1: 2, x2: 12, y2: 5 }),
            /*#__PURE__*/React.createElement("line", { x1: 12, y1: 19, x2: 12, y2: 22 }),
            /*#__PURE__*/React.createElement("circle", { cx: 12, cy: 12, r: 7 }),
            /*#__PURE__*/React.createElement("circle", { cx: 12, cy: 12, r: 2 })
          )
        )
      ),
      /* 시/도 Section */
      /*#__PURE__*/React.createElement("div", { className: "region-filter-section-label" }, "시/도"),
      /*#__PURE__*/React.createElement("div", { className: "region-filter-chip-group" },
        KOREA_REGIONS_GEO.map(r => /*#__PURE__*/React.createElement("button", {
          key: r.code,
          type: "button",
          className: `region-filter-chip${r.code === expandedSido ? ' is-active' : ''}`,
          onClick: () => { setQuery(''); setExpandedSido(r.code); setDraftGugun(''); }
        }, r.label))
      ),
      /* 군/구 Section */
      activeRegion && /*#__PURE__*/React.createElement(React.Fragment, null,
        /*#__PURE__*/React.createElement("div", { className: "region-filter-section-label" }, "군/구"),
        /*#__PURE__*/React.createElement("div", { className: "region-filter-chip-group" },
          /*#__PURE__*/React.createElement("button", {
            type: "button",
            className: `region-filter-chip${!draftGugun ? ' is-active' : ''}`,
            onClick: () => setDraftGugun('')
          }, "전체"),
          activeRegion.gugun.map(g => /*#__PURE__*/React.createElement("button", {
            key: g,
            type: "button",
            className: `region-filter-chip${g === draftGugun ? ' is-active' : ''}`,
            onClick: () => setDraftGugun(g)
          }, g))
        )
      )
    ),
    /* Footer */
    /*#__PURE__*/React.createElement("div", { className: "modal-footer region-filter-footer" },
      /*#__PURE__*/React.createElement("button", {
        type: "button",
        className: "region-filter-save-btn",
        disabled: !expandedSido && !query.trim(),
        onClick: handleSave
      }, "지역 저장")
    )
  ));

  const ReactDOM = window.ReactDOM;
  if (typeof document !== 'undefined' && ReactDOM?.createPortal) {
    return ReactDOM.createPortal(modalNode, document.body);
  }
  return modalNode;
}

const WEATHER_WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

function getWeatherDateParts(dateStr) {
  const date = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(date.getTime())) return null;
  return {
    date,
    monthDay: `${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`,
    weekday: WEATHER_WEEKDAY_LABELS[date.getDay()]
  };
}

function formatWeatherDayChoice(day) {
  const parts = getWeatherDateParts(day?.dateStr);
  if (!parts) return day?.label || '';
  return day?.offset === 0 ? `오늘(${parts.weekday})` : `${parts.monthDay}(${parts.weekday})`;
}

function formatWeatherLocationArea(location) {
  const regionName = String(location?.regionName || '').trim();
  // "현재 위치" is only a GPS-source label. Prefer the reverse-geocoded
  // administrative area once it is available so the forecast always states
  // the actual region being shown.
  const raw = String((regionName && regionName !== '현재 위치' ? regionName : '') || location?.areaName || location?.address || location?.name || '지역').trim();
  if (!raw) return '지역';
  return raw
    .replace(/^서울특별시(?:\s|$)/, '서울시 ')
    .replace(/^서울(?:\s|$)/, '서울시 ')
    .replace(/^부산광역시(?:\s|$)/, '부산시 ')
    .replace(/^대구광역시(?:\s|$)/, '대구시 ')
    .replace(/^인천광역시(?:\s|$)/, '인천시 ')
    .replace(/\s+/g, ' ')
    .trim();
}

function shortWeatherPlaceLabel(full) {
  const text = String(full || '').replace(/\s+/g, ' ').trim();
  if (!text || text === '지역') return '서울시';
  const parts = text.split(' ');
  if (parts.length >= 2 && /(?:특별시|광역시|도)$/.test(parts[0])) return parts[1];
  return parts[0];
}

function formatWeatherSettingLocation(location) {
  const name = String(location?.name || '').trim();
  const area = formatWeatherLocationArea(location);
  const explicitAddress = String(location?.address || '').trim();
  const areaName = String(location?.areaName || '').trim();
  if (location?.isMeetingPlace && name && name !== '지역') {
    const address = explicitAddress || areaName || (area && area !== name ? area : '');
    return address ? `설정위치 : [${name}] ${address}` : `설정위치 : [${name}]`;
  }
  const full = area && area !== '지역' ? area : '서울시';
  const short = shortWeatherPlaceLabel(full);
  return `설정위치 : [${short}] ${full}`;
}

function WeatherPlaceMarkerIcon({ size = 16 }) {
  const React = window.React;
  return /*#__PURE__*/React.createElement('svg', {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    'aria-hidden': 'true',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    style: { display: 'block', shapeRendering: 'geometricprecision' }
  },
  /*#__PURE__*/React.createElement('path', { d: 'M9 11a3 3 0 1 0 6 0a3 3 0 0 0 -6 0' }),
  /*#__PURE__*/React.createElement('path', { d: 'M17.657 16.657l-4.243 4.243a2 2 0 0 1 -2.827 0l-4.244 -4.243a8 8 0 1 1 11.314 0' }));
}

function WeatherRegionSettingsIcon({ size = 20 }) {
  const React = window.React;
  return /*#__PURE__*/React.createElement('svg', {
    xmlns: 'http://www.w3.org/2000/svg',
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': 'true'
  },
  /*#__PURE__*/React.createElement('path', { d: 'M12 2v2' }),
  /*#__PURE__*/React.createElement('path', { d: 'M12 8a4 4 0 0 0-1.645 7.647' }),
  /*#__PURE__*/React.createElement('path', { d: 'M2 12h2' }),
  /*#__PURE__*/React.createElement('path', { d: 'M20 14.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0z' }),
  /*#__PURE__*/React.createElement('path', { d: 'm4.93 4.93 1.41 1.41' }),
  /*#__PURE__*/React.createElement('path', { d: 'm6.34 17.66-1.41 1.41' }));
}

function MetricIconDroplet({ size = 16, color = '#06B6D4' }) {
  const React = window.React;
  return /*#__PURE__*/React.createElement('svg', {
    xmlns: 'http://www.w3.org/2000/svg',
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: color,
    strokeWidth: 2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    className: 'lucide lucide-droplet preview-icon',
    'aria-hidden': 'true',
    style: { display: 'inline-block', flexShrink: 0, verticalAlign: 'middle' }
  },
    /*#__PURE__*/React.createElement('path', { d: 'M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z' })
  );
}

function MetricIconRain({ size = 16, color = '#3ba7ee' }) {
  const React = window.React;
  return /*#__PURE__*/React.createElement('svg', {
    xmlns: 'http://www.w3.org/2000/svg',
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: color,
    strokeWidth: 2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    className: 'lucide lucide-cloud-rain-wind preview-icon',
    'aria-hidden': 'true',
    style: { display: 'inline-block', flexShrink: 0, verticalAlign: 'middle' }
  },
    /*#__PURE__*/React.createElement('path', { d: 'M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242' }),
    /*#__PURE__*/React.createElement('path', { d: 'm9.2 22 3-7' }),
    /*#__PURE__*/React.createElement('path', { d: 'm9 13-3 7' }),
    /*#__PURE__*/React.createElement('path', { d: 'm17 13-3 7' })
  );
}

function MetricIconFactory({ size = 16, color = '#32b588' }) {
  const React = window.React;
  return /*#__PURE__*/React.createElement('svg', {
    xmlns: 'http://www.w3.org/2000/svg',
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: color,
    strokeWidth: 2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    className: 'lucide lucide-factory preview-icon',
    'aria-hidden': 'true',
    style: { display: 'inline-block', flexShrink: 0, verticalAlign: 'middle' }
  },
    /*#__PURE__*/React.createElement('path', { d: 'M12 16h.01' }),
    /*#__PURE__*/React.createElement('path', { d: 'M16 16h.01' }),
    /*#__PURE__*/React.createElement('path', { d: 'M3 19a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8.5a.5.5 0 0 0-.769-.422l-4.462 2.844A.5.5 0 0 1 15 10.5v-2a.5.5 0 0 0-.769-.422L9.77 10.922A.5.5 0 0 1 9 10.5V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2z' }),
    /*#__PURE__*/React.createElement('path', { d: 'M8 16h.01' })
  );
}

function MetricIconWind({ size = 16, color = '#7c2fe5' }) {
  const React = window.React;
  return /*#__PURE__*/React.createElement('svg', {
    xmlns: 'http://www.w3.org/2000/svg',
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: color,
    strokeWidth: 2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    className: 'lucide lucide-wind preview-icon',
    'aria-hidden': 'true',
    style: { display: 'inline-block', flexShrink: 0, verticalAlign: 'middle' }
  },
    /*#__PURE__*/React.createElement('path', { d: 'M12.8 19.6A2 2 0 1 0 14 16H2' }),
    /*#__PURE__*/React.createElement('path', { d: 'M17.5 8a2.5 2.5 0 1 1 2 4H2' }),
    /*#__PURE__*/React.createElement('path', { d: 'M9.8 4.4A2 2 0 1 1 11 8H2' })
  );
}

function MetricIconUvIndex({ size = 16, color = '#f2ae2e' }) {
  const React = window.React;
  return /*#__PURE__*/React.createElement('svg', {
    xmlns: 'http://www.w3.org/2000/svg',
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: color,
    strokeWidth: 2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    className: 'icon icon-tabler icons-tabler-outline icon-tabler-uv-index',
    'aria-hidden': 'true',
    style: { display: 'inline-block', flexShrink: 0, verticalAlign: 'middle' }
  },
    /*#__PURE__*/React.createElement('path', { stroke: 'none', d: 'M0 0h24v24H0z', fill: 'none' }),
    /*#__PURE__*/React.createElement('path', { d: 'M3 12h1m16 0h1m-15.4 -6.4l.7 .7m12.1 -.7l-.7 .7m-9.7 5.7a4 4 0 1 1 8 0' }),
    /*#__PURE__*/React.createElement('path', { d: 'M12 4v-1' }),
    /*#__PURE__*/React.createElement('path', { d: 'M13 16l2 5h1l2 -5' }),
    /*#__PURE__*/React.createElement('path', { d: 'M6 16v3a2 2 0 1 0 4 0v-3' })
  );
}

function weatherSceneKind(code, isNight) {
  const storm = code >= 95 && code <= 99;
  const snow = (code >= 71 && code <= 77) || (code >= 85 && code <= 86);
  const rain = (code >= 51 && code <= 67) || (code >= 80 && code <= 82);
  const fog = code === 45 || code === 48;
  const overcast = code === 3;
  const cloudy = code === 2;
  if (isNight) {
    if (storm) return 'night-thunder';
    if (snow) return 'night-snow';
    if (rain) return 'night-rain';
    if (fog || overcast || cloudy) return 'night-cloud';
    return 'night';
  }
  if (storm) return 'thunder';
  if (snow) return 'snow';
  if (rain) return 'rain';
  if (fog) return 'fog';
  if (overcast) return 'overcast';
  if (cloudy) return 'cloudy';
  return 'clear';
}

function WeatherScene({ kind }) {
  const React = window.React;
  const night = String(kind).startsWith('night');
  const sun = kind === 'clear' || kind === 'cloudy';
  const moon = night;
  const cloud = kind !== 'clear' && kind !== 'night';
  const rain = kind === 'rain' || kind === 'thunder' || kind === 'night-rain' || kind === 'night-thunder';
  const snow = kind === 'snow' || kind === 'night-snow';
  const bolt = kind === 'thunder' || kind === 'night-thunder';
  const marks = (className, count) => Array.from({ length: count }, (_, index) => React.createElement('i', {
    key: `${className}-${index}`,
    className,
    style: { '--i': index }
  }));
  return React.createElement('div', { className: 'weather-scene', 'aria-hidden': 'true' },
    night ? React.createElement('span', { className: 'weather-stars' }, marks('weather-star', 8)) : null,
    sun ? React.createElement('span', { className: 'weather-sun' }, React.createElement('span', { className: 'weather-sun-rays' })) : null,
    moon ? React.createElement('span', { className: 'weather-moon' }) : null,
    cloud ? React.createElement('span', { className: 'weather-cloud weather-cloud-a' }) : null,
    cloud && kind !== 'fog' ? React.createElement('span', { className: 'weather-cloud weather-cloud-b' }) : null,
    kind === 'fog' ? React.createElement('span', { className: 'weather-mist' }) : null,
    rain ? React.createElement('span', { className: 'weather-rain' }, marks('weather-drop', 9)) : null,
    snow ? React.createElement('span', { className: 'weather-snow' }, marks('weather-flake', 9)) : null,
    bolt ? React.createElement('span', { className: 'weather-bolt' }) : null
  );
}

export function WeatherDetailModal({
  dateStr: initialDateStr,
  weatherLocation,
  onClose,
  onSelectDate,
  onSaveLocation,
  days = []
}) {
  const React = window.React;
  const [selectedDate, setSelectedDate] = React.useState(initialDateStr || '');
  const [forecastData, setForecastData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  const [currentLocation, setCurrentLocation] = React.useState(() => {
    return weatherLocation || { name: '서울특별시', lat: 37.566, lon: 126.9784 };
  });
  const [showLocationPicker, setShowLocationPicker] = React.useState(false);
  const dayStripRef = React.useRef(null);
  const dayStripDragRef = React.useRef(null);
  const ignoreDayClickRef = React.useRef(false);
  const onSaveLocationRef = React.useRef(onSaveLocation);
  const [hourlyTab, setHourlyTab] = React.useState('weather');
  const timelineRef = React.useRef(null);
  const timelineDragRef = React.useRef(null);

  React.useEffect(() => {
    onSaveLocationRef.current = onSaveLocation;
  }, [onSaveLocation]);

  React.useEffect(() => {
    if (weatherLocation) {
      setCurrentLocation(previous => {
        const sameMeetingCoordinates = previous?.isMeetingPlace
          && weatherLocation?.isMeetingPlace
          && Number(previous.lat) === Number(weatherLocation.lat)
          && Number(previous.lon) === Number(weatherLocation.lon);
        // The parent reconstructs a meeting-location object on ordinary
        // calendar renders. Keep an area we already resolved instead of
        // needlessly discarding it and issuing another reverse lookup.
        if (sameMeetingCoordinates && previous.areaName && !weatherLocation.areaName) return previous;
        return weatherLocation;
      });
    }
  }, [weatherLocation]);

  // If a location has a place name but needs geocoding:
  React.useEffect(() => {
    if (currentLocation?.needsGeocode && currentLocation?.name) {
      let active = true;
      resolveLocationCoordinates(currentLocation.name, currentLocation.lat || 37.566, currentLocation.lon || 126.9784)
        .then(resolved => {
          if (active && resolved) {
            setCurrentLocation(prev => ({
              ...prev,
              lat: resolved.lat,
              lon: resolved.lon,
              name: resolved.name || prev.name,
              areaName: resolved.areaName || prev.areaName,
              needsGeocode: false,
              needsReverseGeocode: !resolved.areaName && !prev.areaName
            }));
          }
        })
        .catch(() => {});
      return () => { active = false; };
    }
  }, [currentLocation?.needsGeocode, currentLocation?.name]);

  // Imported pins and GPS selections can provide a precise coordinate without
  // an administrative address.  Complete just that label in the background;
  // it does not change the forecast coordinate or the meeting place itself.
  React.useEffect(() => {
    if (!currentLocation?.needsReverseGeocode || currentLocation?.areaName) return undefined;
    let active = true;
    reverseGeocodeWeatherArea(currentLocation.lat, currentLocation.lon)
      .then(areaName => {
        if (!active) return;
        const resolvedAreaName = String(areaName || '').trim();
        setCurrentLocation(prev => {
          if (!prev?.needsReverseGeocode) return prev;
          return {
            ...prev,
            areaName: resolvedAreaName || prev.areaName || '',
            needsReverseGeocode: false
          };
        });
        // Persist a successful region resolution with the user's selected
        // weather region, but never write a meeting place back as a setting.
        if (resolvedAreaName && !currentLocation.isMeetingPlace) {
          onSaveLocationRef.current?.({
            ...currentLocation,
            areaName: resolvedAreaName,
            needsReverseGeocode: false
          });
        }
      })
      .catch(() => {})
      .finally(() => {
        if (active) {
          setCurrentLocation(prev => prev?.needsReverseGeocode
            ? { ...prev, needsReverseGeocode: false }
            : prev);
        }
      });
    return () => { active = false; };
  }, [currentLocation?.needsReverseGeocode, currentLocation?.areaName, currentLocation?.lat, currentLocation?.lon]);

  const lat = currentLocation.lat || 37.566;
  const lon = currentLocation.lon || 126.9784;
  const locationName = currentLocation.name || '지역';
  const locationAreaLabel = formatWeatherLocationArea(currentLocation);
  const isResolvingPlaceCoordinates = Boolean(currentLocation?.isMeetingPlace && currentLocation?.needsGeocode);
  const isResolvingForecastArea = Boolean(currentLocation?.isMeetingPlace && currentLocation?.needsReverseGeocode && !currentLocation?.areaName);
  const forecastAreaText = isResolvingPlaceCoordinates
    ? '일정 장소 위치 확인 중'
    : (isResolvingForecastArea ? '일정 장소 기준 날씨' : `${locationAreaLabel} 날씨`);

  React.useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    fetchDetailedWeatherForecast(lat, lon)
      .then(data => {
        if (!active) return;
        if (data) {
          setForecastData(data);
        } else {
          setError('날씨 정보를 불러올 수 없습니다.');
        }
      })
      .catch(err => {
        if (!active) return;
        console.error('Weather detail fetch error:', err);
        setError('일기예보 데이터를 가져오는 중 오류가 발생했습니다.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [lat, lon]);

  React.useEffect(() => {
    if (initialDateStr) {
      setSelectedDate(initialDateStr);
    }
  }, [initialDateStr]);

  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const daily = forecastData?.daily?.[selectedDate];
  const hourlyList = forecastData?.hourly?.[selectedDate] || [];
  const airQuality = forecastData?.airQuality?.[selectedDate];

  const targetDate = new Date(`${selectedDate}T00:00:00`);
  const isDateValid = !Number.isNaN(targetDate.getTime());
  const now = new Date();
  const isToday = isDateValid && now.toDateString() === targetDate.toDateString();
  const currentHourNum = now.getHours();
  const isNight = isToday ? (currentHourNum < 6 || currentHourNum >= 19) : false;
  const formattedDateTitle = isDateValid
    ? `${targetDate.getFullYear()}년 ${targetDate.getMonth() + 1}월 ${targetDate.getDate()}일 (${['일', '월', '화', '수', '목', '금', '토'][targetDate.getDay()]})`
    : selectedDate;

  const matchedDay = Array.isArray(days) ? days.find(d => d.dateStr === selectedDate) : null;
  const dayBadge = matchedDay ? matchedDay.label : null;

  const weatherCode = daily?.code ?? 0;
  const weatherDesc = getWeatherDescription(weatherCode);
  const maxTemp = daily?.max != null ? Math.round(daily.max) : null;
  const minTemp = daily?.min != null ? Math.round(daily.min) : null;
  const apparentMax = daily?.apparentMax != null ? Math.round(daily.apparentMax) : null;
  const precipSum = daily?.precipSum != null ? (Math.round(daily.precipSum * 10) / 10).toFixed(1) : '0.0';
  const precipProb = daily?.precipProbMax != null ? Math.round(daily.precipProbMax) : 0;
  const windSpeed = daily?.windSpeedMax != null ? (Math.round((daily.windSpeedMax / 3.6) * 10) / 10).toFixed(1) : null;
  const uvIndex = daily?.uvIndexMax != null ? Math.round(daily.uvIndexMax) : null;

  const currentHourly = isToday ? hourlyList.find(h => parseInt(h.time.split(':')[0], 10) === currentHourNum) : null;
  const displayTemp = currentHourly?.temp != null
    ? Math.round(currentHourly.temp)
    : (maxTemp != null ? maxTemp : (hourlyList[0]?.temp != null ? Math.round(hourlyList[0].temp) : null));
  const cardKind = weatherSceneKind(weatherCode, isNight);

  React.useEffect(() => {
    if (timelineRef.current && isToday) {
      const scrollPos = Math.max(0, currentHourNum * 54 - 54);
      timelineRef.current.scrollLeft = scrollPos;
    }
  }, [selectedDate, hourlyTab, isToday, currentHourNum]);

  const uvText = (uv) => {
    if (uv == null) return '보통';
    if (uv <= 2) return `낮음 (${uv})`;
    if (uv <= 5) return `보통 (${uv})`;
    if (uv <= 7) return `높음 (${uv})`;
    if (uv <= 10) return `매우높음 (${uv})`;
    return `위험 (${uv})`;
  };

  const handleOpenWindy = () => {
    window.open(`https://www.windy.com/?${lat},${lon},7`, '_blank', 'noopener,noreferrer');
  };

  const handleSelectDateCalendar = () => {
    onSelectDate?.(selectedDate);
    onClose?.();
  };

  const beginDayStripDrag = (event) => {
    const strip = dayStripRef.current;
    if (!strip || !event.isPrimary || (event.pointerType === 'mouse' && event.button !== 0)) return;
    dayStripDragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startScrollLeft: strip.scrollLeft,
      moved: false
    };
  };
  const moveDayStripDrag = (event) => {
    const strip = dayStripRef.current;
    const drag = dayStripDragRef.current;
    if (!strip || !drag || drag.pointerId !== event.pointerId) return;
    const distance = event.clientX - drag.startX;
    if (Math.abs(distance) <= 6) return;
    if (!drag.moved) {
      drag.moved = true;
      ignoreDayClickRef.current = true;
      try { strip.setPointerCapture?.(event.pointerId); } catch (_) {}
    }
    strip.scrollLeft = drag.startScrollLeft - distance;
    if (event.cancelable) event.preventDefault();
  };
  const endDayStripDrag = (event) => {
    const strip = dayStripRef.current;
    const drag = dayStripDragRef.current;
    if (!drag || (event && drag.pointerId !== event.pointerId)) return;
    if (!drag.moved && event?.target) {
      const button = event.target.closest?.('.weather-detail-day-choice');
      const date = button?.getAttribute?.('data-date');
      if (date) setSelectedDate(date);
    }
    if (drag.moved) {
      window.setTimeout(() => { ignoreDayClickRef.current = false; }, 40);
    }
    try { strip?.releasePointerCapture?.(drag.pointerId); } catch (_) {}
    dayStripDragRef.current = null;
  };

  const beginTimelineDrag = (event) => {
    const el = timelineRef.current;
    if (!el || !event.isPrimary || (event.pointerType === 'mouse' && event.button !== 0)) return;
    timelineDragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startScrollLeft: el.scrollLeft,
      moved: false
    };
    try { el.setPointerCapture?.(event.pointerId); } catch (_) {}
  };
  const moveTimelineDrag = (event) => {
    const el = timelineRef.current;
    const drag = timelineDragRef.current;
    if (!el || !drag || drag.pointerId !== event.pointerId) return;
    const distance = event.clientX - drag.startX;
    if (Math.abs(distance) > 2) {
      drag.moved = true;
      el.scrollLeft = drag.startScrollLeft - distance;
      if (event.cancelable) event.preventDefault();
    }
  };
  const endTimelineDrag = (event) => {
    const el = timelineRef.current;
    const drag = timelineDragRef.current;
    if (!drag || (event && drag.pointerId !== event.pointerId)) return;
    try { el?.releasePointerCapture?.(drag.pointerId); } catch (_) {}
    timelineDragRef.current = null;
  };

  const modalNode = /*#__PURE__*/React.createElement("div", {
    className: "modal-overlay weather-detail-modal-overlay",
    onClick: onClose,
    style: { zIndex: 12500 }
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal-container weather-detail-modal-container",
    role: "dialog",
    "aria-modal": "true",
    "aria-label": `${forecastAreaText} 상세`,
    onClick: e => e.stopPropagation(),
    style: { maxWidth: '520px' }
  },
    /* Mobile drag affordance */
    /*#__PURE__*/React.createElement("div", {
      className: "v2-modal-drag-handle",
      style: {
        width: '38px',
        height: '4px',
        backgroundColor: 'var(--border-subtle, rgba(0,0,0,0.18))',
        borderRadius: '9999px',
        margin: '8px auto 0',
        flexShrink: 0
      }
    }),

    /* Header: schedule place and forecast area are intentionally separate. */
    /*#__PURE__*/React.createElement("div", {
      className: "weather-detail-header"
    },
      /*#__PURE__*/React.createElement("div", { className: "weather-detail-header-actions" },
        /*#__PURE__*/React.createElement("button", {
          type: "button",
          onClick: () => setShowLocationPicker(true),
          className: "weather-detail-icon-button",
          title: "날씨 지역 설정",
          "aria-label": `날씨 지역 설정. 현재 ${locationAreaLabel}`
        }, /*#__PURE__*/React.createElement(WeatherRegionSettingsIcon, { size: 20 })),
        /*#__PURE__*/React.createElement("button", {
          type: "button",
          onClick: onClose,
          className: "weather-detail-icon-button weather-detail-close-button",
          "aria-label": "날씨 상세 닫기"
        },
          /*#__PURE__*/React.createElement("svg", { width: 20, height: 20, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2.2, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true" },
            /*#__PURE__*/React.createElement("path", { d: "M18 6L6 18M6 6l12 12" })
          )
        )
      )
    ),
    /*#__PURE__*/React.createElement("div", { className: "weather-detail-date-line" },
      /*#__PURE__*/React.createElement("span", { className: "weather-detail-date-eyebrow" }, dayBadge || '일일 예보'),
      /*#__PURE__*/React.createElement("strong", null, formattedDateTitle)
    ),

    /* Days Carousel Selector */
    Array.isArray(days) && days.length > 0 && /*#__PURE__*/React.createElement("div", {
      className: "weather-detail-days-strip",
      ref: dayStripRef,
      role: "tablist",
      "aria-label": "날짜별 날씨 선택",
      style: { borderRadius: 0, borderTop: 0, borderLeft: 0, borderRight: 0 },
      onPointerDown: beginDayStripDrag,
      onPointerMove: moveDayStripDrag,
      onPointerUp: endDayStripDrag,
      onPointerCancel: endDayStripDrag
    },
      days.map(d => {
        const isSelected = d.dateStr === selectedDate;
        return /*#__PURE__*/React.createElement("button", {
          key: d.dateStr,
          type: "button",
          role: "tab",
          "aria-selected": isSelected,
          className: `weather-detail-day-choice${isSelected ? ' is-selected' : ''}`,
          "data-date": d.dateStr,
          onClick: () => {
            if (!ignoreDayClickRef.current) setSelectedDate(d.dateStr);
          }
        }, formatWeatherDayChoice(d)
        );
      })
    ),

    /* Body */
    /*#__PURE__*/React.createElement("div", {
      className: "modal-body weather-detail-body",
      style: {
        padding: '18px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        flex: '1 1 auto',
        minHeight: 0,
        overflowY: 'auto'
      }
    },
      loading && /*#__PURE__*/React.createElement("div", {
        className: "bp-skel-page",
        role: "status",
        "aria-label": "날씨를 불러오는 중",
        style: { padding: '8px 0 12px' }
      },
        /*#__PURE__*/React.createElement("div", { className: "bp-skel-block is-hero", "aria-hidden": "true" }),
        /*#__PURE__*/React.createElement("div", { className: "bp-skel-metrics", "aria-hidden": "true" },
          [0, 1, 2, 3].map(index => /*#__PURE__*/React.createElement("span", { key: index, className: "bp-skel-block" }))
        )
      ),

      error && !loading && /*#__PURE__*/React.createElement("div", {
        style: {
          padding: '24px 16px',
          textAlign: 'center',
          color: '#EF4444',
          backgroundColor: 'rgba(239, 68, 68, 0.08)',
          borderRadius: '16px',
          fontSize: 'var(--font-size-sm, 0.85rem)'
        }
      }, error),

      !loading && !error && /*#__PURE__*/React.createElement(React.Fragment, null,
        /* Primary Highlight Card */
        /*#__PURE__*/React.createElement("div", {
          className: "weather-highlight-card",
          "data-weather": cardKind
        },
          /*#__PURE__*/React.createElement("div", { className: "weather-highlight-copy" },
            /*#__PURE__*/React.createElement("span", { className: "weather-highlight-condition" }, weatherDesc),
            /*#__PURE__*/React.createElement("div", { className: "weather-highlight-main" },
              /*#__PURE__*/React.createElement("strong", { className: "weather-highlight-temp-big" }, displayTemp != null ? displayTemp : "--"),
              /*#__PURE__*/React.createElement("span", { className: "weather-highlight-degree", "aria-hidden": "true" }, "°")
            ),
            /*#__PURE__*/React.createElement("span", { className: "weather-highlight-range" },
              [
                apparentMax != null ? `체감 ${apparentMax}°` : "",
                maxTemp != null && minTemp != null ? `최고 ${maxTemp}° / 최저 ${minTemp}°` : ""
              ].filter(Boolean).join("  ·  ")
            ),
            /*#__PURE__*/React.createElement("span", { className: "weather-highlight-setting" },
              /*#__PURE__*/React.createElement("span", { className: "weather-highlight-setting-pin", "aria-hidden": "true" },
                /*#__PURE__*/React.createElement(WeatherPlaceMarkerIcon, { size: 14 })
              ),
              /*#__PURE__*/React.createElement("span", { className: "weather-highlight-setting-text" }, formatWeatherSettingLocation(currentLocation))
            )
          ),
          /*#__PURE__*/React.createElement(WeatherScene, { kind: cardKind })
        ),

        /* 4 Key Indicators Grid */
        /*#__PURE__*/React.createElement("div", {
          className: "weather-detail-metrics"
        },
          /* 1. Precipitation */
          /*#__PURE__*/React.createElement("div", {
            className: "weather-detail-metric"
          },
            /*#__PURE__*/React.createElement("div", {
              className: "weather-detail-metric-label",
              style: { display: 'flex', alignItems: 'center', gap: '6px' }
            },
              /*#__PURE__*/React.createElement(MetricIconRain, { size: 16 }),
              "강수량 및 확률"
            ),
            /*#__PURE__*/React.createElement("div", {
              className: "weather-detail-metric-value-row"
            },
              /*#__PURE__*/React.createElement("span", {
                className: "weather-detail-metric-value"
              }, `${precipSum} mm`),
              /*#__PURE__*/React.createElement("span", {
                className: `weather-detail-metric-note${precipProb > 0 ? ' is-accent' : ''}`
              }, `(확률 ${precipProb}%)`)
            )
          ),

          /* 2. Fine Dust (Air Quality) */
          /*#__PURE__*/React.createElement("div", {
            className: "weather-detail-metric"
          },
            /*#__PURE__*/React.createElement("div", {
              className: "weather-detail-metric-label",
              style: { display: 'flex', alignItems: 'center', gap: '6px' }
            },
              /*#__PURE__*/React.createElement(MetricIconFactory, { size: 16 }),
              "대기질 (미세먼지)"
            ),
            airQuality ? /*#__PURE__*/React.createElement("div", {
              style: { display: 'flex', flexDirection: 'column', gap: '3px' }
            },
              /*#__PURE__*/React.createElement("div", {
                style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem' }
              },
                /*#__PURE__*/React.createElement("span", { style: { color: 'var(--text-muted)' } }, `미세 ${airQuality.pm10 ?? '-'}㎍`),
                /*#__PURE__*/React.createElement("span", {
                  style: {
                    fontWeight: 800,
                    color: airQuality.grade10.color,
                    backgroundColor: `${airQuality.grade10.color}15`,
                    padding: '1px 6px',
                    borderRadius: '4px',
                    fontSize: '0.75rem'
                  }
                }, airQuality.grade10.text)
              ),
              /*#__PURE__*/React.createElement("div", {
                style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem' }
              },
                /*#__PURE__*/React.createElement("span", { style: { color: 'var(--text-muted)' } }, `초미세 ${airQuality.pm2_5 ?? '-'}㎍`),
                /*#__PURE__*/React.createElement("span", {
                  style: {
                    fontWeight: 800,
                    color: airQuality.grade25.color,
                    backgroundColor: `${airQuality.grade25.color}15`,
                    padding: '1px 6px',
                    borderRadius: '4px',
                    fontSize: '0.75rem'
                  }
                }, airQuality.grade25.text)
              )
            ) : /*#__PURE__*/React.createElement("span", {
              style: { fontSize: '0.9rem', fontWeight: 700, color: '#10B981' }
            }, "쾌적 / 보통")
          ),

          /* 3. Wind Speed */
          /*#__PURE__*/React.createElement("div", {
            className: "weather-detail-metric"
          },
            /*#__PURE__*/React.createElement("div", {
              className: "weather-detail-metric-label",
              style: { display: 'flex', alignItems: 'center', gap: '6px' }
            },
              /*#__PURE__*/React.createElement(MetricIconWind, { size: 16 }),
              "최대 풍속"
            ),
            /*#__PURE__*/React.createElement("span", {
              style: { fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main, #1E293B)' }
            }, windSpeed ? `${windSpeed} m/s` : '산들바람')
          ),

          /* 4. UV Index */
          /*#__PURE__*/React.createElement("div", {
            className: "weather-detail-metric"
          },
            /*#__PURE__*/React.createElement("div", {
              className: "weather-detail-metric-label",
              style: { display: 'flex', alignItems: 'center', gap: '6px' }
            },
              /*#__PURE__*/React.createElement(MetricIconUvIndex, { size: 16 }),
              "자외선 지수"
            ),
            /*#__PURE__*/React.createElement("span", {
              style: { fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main, #1E293B)' }
            }, uvText(uvIndex))
          )
        ),

        /* Hourly Weather Timeline */
        hourlyList.length > 0 && /*#__PURE__*/React.createElement("div", {
          className: "weather-hourly-section",
          style: { display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '6px' }
        },
          /* Header: Title + Sub-tabs */
          /*#__PURE__*/React.createElement("div", {
            style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }
          },
            /*#__PURE__*/React.createElement("span", {
              style: { fontSize: 'var(--font-size-sm, 0.88rem)', fontWeight: 800, color: 'var(--text-main, #1E293B)' }
            }, "시간별 일기예보"),
            /* 4 Sub-tabs: 날씨, 강수, 바람, 습도 */
            /*#__PURE__*/React.createElement("div", {
              className: "weather-hourly-tabs",
              role: "tablist",
              style: { display: 'flex', gap: '5px', alignItems: 'center' }
            },
              [
                { key: 'weather', label: '날씨' },
                { key: 'precip', label: '강수' },
                { key: 'wind', label: '바람' },
                { key: 'humidity', label: '습도' }
              ].map(tab => /*#__PURE__*/React.createElement("button", {
                key: tab.key,
                type: "button",
                role: "tab",
                "aria-selected": hourlyTab === tab.key,
                className: `weather-hourly-tab-btn${hourlyTab === tab.key ? ' is-active' : ''}`,
                onClick: () => setHourlyTab(tab.key),
                style: {
                  padding: '4px 10px',
                  fontSize: '0.75rem',
                  fontWeight: hourlyTab === tab.key ? 800 : 600,
                  color: hourlyTab === tab.key ? 'var(--v2-primary, #7C2FE5)' : 'var(--text-muted, #64748B)',
                  borderRadius: '999px',
                  border: hourlyTab === tab.key ? '1.5px solid var(--v2-primary, #7C2FE5)' : '1px solid var(--border-subtle, rgba(0,0,0,0.12))',
                  backgroundColor: hourlyTab === tab.key ? 'rgb(var(--a-brand-rgb, 124 47 229) / 0.08)' : 'transparent',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }
              }, tab.label))
            )
          ),
          /* Horizontally Scrollable Timeline (No box borders!) */
          /*#__PURE__*/React.createElement("div", {
            ref: timelineRef,
            className: "weather-hourly-timeline",
            onPointerDown: beginTimelineDrag,
            onPointerMove: moveTimelineDrag,
            onPointerUp: endTimelineDrag,
            onPointerCancel: endTimelineDrag,
            style: {
              display: 'flex',
              overflowX: 'auto',
              padding: '6px 2px 10px',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              touchAction: 'pan-x',
              WebkitOverflowScrolling: 'touch',
              cursor: 'grab',
              userSelect: 'none'
            }
          },
            (() => {
              const colWidth = 54;
              const totalWidth = hourlyList.length * colWidth;

              if (hourlyTab === 'weather') {
                const temps = hourlyList.map(h => Number(h.temp ?? 0));
                const minT = Math.min(...temps);
                const maxT = Math.max(...temps);
                const spanT = (maxT - minT) > 0 ? (maxT - minT) : 2;
                const chartHeight = 64;
                const pts = hourlyList.map((h, idx) => {
                  const x = idx * colWidth + colWidth / 2;
                  const tempVal = Number(h.temp ?? minT);
                  const y = 20 + ((maxT - tempVal) / spanT) * (chartHeight - 34);
                  return { x, y, temp: Math.round(tempVal), hourNum: parseInt(h.time.split(':')[0], 10), code: h.code };
                });
                const linePath = pts.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

                return /*#__PURE__*/React.createElement("div", {
                  style: { width: `${totalWidth}px`, display: 'flex', flexDirection: 'column' }
                },
                  /* SVG Curve Chart */
                  /*#__PURE__*/React.createElement("svg", {
                    width: totalWidth,
                    height: chartHeight,
                    style: { display: 'block', overflow: 'visible' }
                  },
                    /* Curve */
                    /*#__PURE__*/React.createElement("path", {
                      d: linePath,
                      fill: "none",
                      stroke: "var(--v2-primary, #7C2FE5)",
                      strokeWidth: 2.2,
                      strokeLinecap: "round",
                      strokeLinejoin: "round",
                      opacity: 0.55
                    }),
                    /* Points, Guide lines, and Temp labels */
                    pts.map((p, idx) => {
                      const isNow = isToday && currentHourNum === p.hourNum;
                      return /*#__PURE__*/React.createElement("g", { key: idx },
                        /* Vertical faint guide line */
                        /*#__PURE__*/React.createElement("line", {
                          x1: p.x,
                          y1: p.y + 5,
                          x2: p.x,
                          y2: chartHeight,
                          stroke: "var(--border-subtle, rgba(0,0,0,0.08))",
                          strokeWidth: 1,
                          strokeDasharray: "2,2"
                        }),
                        /* Temperature text */
                        /*#__PURE__*/React.createElement("text", {
                          x: p.x,
                          y: p.y - 7,
                          textAnchor: "middle",
                          fontSize: "12",
                          fontWeight: isNow ? "850" : "750",
                          fill: isNow ? "var(--v2-primary, #7C2FE5)" : "var(--text-main, #1E293B)"
                        }, `${p.temp}°`),
                        /* Point circle */
                        /*#__PURE__*/React.createElement("circle", {
                          cx: p.x,
                          cy: p.y,
                          r: isNow ? 4.5 : 3.5,
                          fill: isNow ? "var(--v2-primary, #7C2FE5)" : "var(--bg-card, #FFFFFF)",
                          stroke: isNow ? "var(--v2-primary, #7C2FE5)" : "#94A3B8",
                          strokeWidth: 2
                        })
                      );
                    })
                  ),
                  /* Bottom Row: Weather Icon + Hour Label (No box borders) */
                  /*#__PURE__*/React.createElement("div", {
                    style: { display: 'flex', width: `${totalWidth}px` }
                  },
                    hourlyList.map((h, idx) => {
                      const hourNum = parseInt(h.time.split(':')[0], 10);
                      const isNow = isToday && currentHourNum === hourNum;
                      return /*#__PURE__*/React.createElement("div", {
                        key: idx,
                        className: "weather-hourly-col",
                        style: {
                          width: `${colWidth}px`,
                          flex: '0 0 auto',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 0',
                          border: 'none',
                          background: 'transparent'
                        }
                      },
                        /* Weather Icon */
                        /*#__PURE__*/React.createElement("div", {
                          style: { height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }
                        }, getWeatherIcon(h.code, 20)),
                        /* Hour label */
                        /*#__PURE__*/React.createElement("span", {
                          style: {
                            fontSize: '0.75rem',
                            fontWeight: isNow ? 800 : 500,
                            color: isNow ? 'var(--v2-primary, #7C2FE5)' : 'var(--text-muted, #64748B)'
                          }
                        }, isNow ? '현재' : `${hourNum}시`)
                      );
                    })
                  )
                );
              }

              if (hourlyTab === 'precip') {
                return /*#__PURE__*/React.createElement("div", {
                  style: { display: 'flex', width: `${totalWidth}px` }
                },
                  hourlyList.map((h, idx) => {
                    const hourNum = parseInt(h.time.split(':')[0], 10);
                    const isNow = isToday && currentHourNum === hourNum;
                    const prob = Math.round(h.precipProb ?? 0);
                    const barHeight = Math.max(4, Math.round(prob * 0.45));
                    return /*#__PURE__*/React.createElement("div", {
                      key: idx,
                      className: "weather-hourly-col",
                      style: {
                        width: `${colWidth}px`,
                        flex: '0 0 auto',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 0',
                        border: 'none',
                        background: 'transparent'
                      }
                    },
                      /* Percentage */
                      /*#__PURE__*/React.createElement("span", {
                        style: { fontSize: '0.75rem', fontWeight: 750, color: prob > 0 ? '#3B82F6' : 'var(--text-muted)' }
                      }, `${prob}%`),
                      /* Bar area */
                      /*#__PURE__*/React.createElement("div", {
                        style: { height: '50px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', width: '100%' }
                      },
                        /*#__PURE__*/React.createElement("div", {
                          style: {
                            width: '14px',
                            height: `${barHeight}px`,
                            borderRadius: '4px',
                            backgroundColor: prob > 0 ? '#3B82F6' : 'rgba(0,0,0,0.06)'
                          }
                        })
                      ),
                      /* Rain Icon */
                      /*#__PURE__*/React.createElement("div", {
                        style: { height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }
                      }, /*#__PURE__*/React.createElement(MetricIconRain, { size: 14, color: prob > 0 ? '#3B82F6' : 'var(--text-muted)' })),
                      /* Hour label */
                      /*#__PURE__*/React.createElement("span", {
                        style: {
                          fontSize: '0.75rem',
                          fontWeight: isNow ? 800 : 500,
                          color: isNow ? 'var(--v2-primary, #7C2FE5)' : 'var(--text-muted, #64748B)'
                        }
                      }, isNow ? '현재' : `${hourNum}시`)
                    );
                  })
                );
              }

              if (hourlyTab === 'wind') {
                return /*#__PURE__*/React.createElement("div", {
                  style: { display: 'flex', width: `${totalWidth}px` }
                },
                  hourlyList.map((h, idx) => {
                    const hourNum = parseInt(h.time.split(':')[0], 10);
                    const isNow = isToday && currentHourNum === hourNum;
                    const speed = h.windSpeed != null ? Number(h.windSpeed).toFixed(1) : (windSpeed || '2.0');
                    const barHeight = Math.min(48, Math.max(6, Math.round(Number(speed) * 6)));
                    return /*#__PURE__*/React.createElement("div", {
                      key: idx,
                      className: "weather-hourly-col",
                      style: {
                        width: `${colWidth}px`,
                        flex: '0 0 auto',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 0',
                        border: 'none',
                        background: 'transparent'
                      }
                    },
                      /* Speed text */
                      /*#__PURE__*/React.createElement("span", {
                        style: { fontSize: '0.75rem', fontWeight: 750, color: 'var(--v2-primary, #7C2FE5)' }
                      }, `${speed}m/s`),
                      /* Bar area */
                      /*#__PURE__*/React.createElement("div", {
                        style: { height: '50px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', width: '100%' }
                      },
                        /*#__PURE__*/React.createElement("div", {
                          style: {
                            width: '14px',
                            height: `${barHeight}px`,
                            borderRadius: '4px',
                            backgroundColor: 'var(--v2-primary, #7C2FE5)',
                            opacity: 0.8
                          }
                        })
                      ),
                      /* Wind Icon */
                      /*#__PURE__*/React.createElement("div", {
                        style: { height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }
                      }, /*#__PURE__*/React.createElement(MetricIconWind, { size: 14 })),
                      /* Hour label */
                      /*#__PURE__*/React.createElement("span", {
                        style: {
                          fontSize: '0.75rem',
                          fontWeight: isNow ? 800 : 500,
                          color: isNow ? 'var(--v2-primary, #7C2FE5)' : 'var(--text-muted, #64748B)'
                        }
                      }, isNow ? '현재' : `${hourNum}시`)
                    );
                  })
                );
              }

              // humidity
              return /*#__PURE__*/React.createElement("div", {
                style: { display: 'flex', width: `${totalWidth}px` }
              },
                hourlyList.map((h, idx) => {
                  const hourNum = parseInt(h.time.split(':')[0], 10);
                  const isNow = isToday && currentHourNum === hourNum;
                  const hum = Math.round(h.humidity ?? 50);
                  const barHeight = Math.max(6, Math.round(hum * 0.48));
                  return /*#__PURE__*/React.createElement("div", {
                    key: idx,
                    className: "weather-hourly-col",
                    style: {
                      width: `${colWidth}px`,
                      flex: '0 0 auto',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 0',
                      border: 'none',
                      background: 'transparent'
                    }
                  },
                    /* Humidity text */
                    /*#__PURE__*/React.createElement("span", {
                      style: { fontSize: '0.75rem', fontWeight: 750, color: '#06B6D4' }
                    }, `${hum}%`),
                    /* Bar area */
                    /*#__PURE__*/React.createElement("div", {
                      style: { height: '50px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', width: '100%' }
                    },
                      /*#__PURE__*/React.createElement("div", {
                        style: {
                          width: '14px',
                          height: `${barHeight}px`,
                          borderRadius: '4px',
                          backgroundColor: '#06B6D4',
                          opacity: 0.85
                        }
                      })
                    ),
                    /* Droplet icon */
                    /*#__PURE__*/React.createElement("div", {
                      style: { height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }
                    }, /*#__PURE__*/React.createElement(MetricIconDroplet, { size: 16, color: '#22D3EE' })),
                    /* Hour label */
                    /*#__PURE__*/React.createElement("span", {
                      style: {
                        fontSize: '0.75rem',
                        fontWeight: isNow ? 800 : 500,
                        color: isNow ? 'var(--v2-primary, #7C2FE5)' : 'var(--text-muted, #64748B)'
                      }
                    }, isNow ? '현재' : `${hourNum}시`)
                  );
                })
              );
            })()
          )
        )
      )
    ),

    /* Footer */
    /*#__PURE__*/React.createElement("div", {
      className: "weather-detail-footer"
    },
      /* Windy live radar button */
      /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: handleOpenWindy,
        className: "weather-detail-secondary-action"
      },
        /*#__PURE__*/React.createElement("span", null, "🌐"),
        "Windy 레이더"
      ),
      /* Right actions */
      /*#__PURE__*/React.createElement("div", {
        className: "weather-detail-footer-actions"
      },
        onSelectDate && /*#__PURE__*/React.createElement("button", {
          type: "button",
          onClick: handleSelectDateCalendar,
          className: "weather-detail-primary-action"
        }, "캘린더로 이동"),
        /*#__PURE__*/React.createElement("button", {
          type: "button",
          onClick: onClose,
          className: "weather-detail-close-action"
        }, "닫기")
      )
    ),

    /* Location Setting Modal */
    showLocationPicker && /*#__PURE__*/React.createElement(WeatherLocationSettingModal, {
      isOpen: true,
      currentLocationName: locationAreaLabel || locationName,
      onClose: () => setShowLocationPicker(false),
      onSelectLocation: (newLoc) => {
        setShowLocationPicker(false);
        if (newLoc && newLoc.lat != null && newLoc.lon != null) {
          const next = {
            ...newLoc,
            needsReverseGeocode: Boolean(newLoc.needsReverseGeocode || (!newLoc.areaName && newLoc.regionName === '현재 위치'))
          };
          setCurrentLocation(next);
          onSaveLocation?.(next);
        }
      }
    })
  ));

  const ReactDOM = window.ReactDOM;
  if (typeof document !== 'undefined' && ReactDOM?.createPortal) {
    return ReactDOM.createPortal(modalNode, document.body);
  }
  return modalNode;
}

if (typeof window !== 'undefined') {
  window.GATHER_UI_COMPONENTS = Object.assign({}, window.GATHER_UI_COMPONENTS || {}, {
    WeatherBadge: WeatherBadge,
    WeatherLocationModal: WeatherLocationModal,
    DailyWeatherIcon: DailyWeatherIcon,
    WeatherDetailModal: WeatherDetailModal,
    WeatherLocationSettingModal: WeatherLocationSettingModal,
  });
}
