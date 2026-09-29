/**
 * Weather badge + location modal (P4-8)
 */

import {
  getWeatherIcon as getCoreWeatherIcon,
  getWeatherDescription,
  fetchDetailedWeatherForecast
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
 * ahead, so past dates and dates further out render nothing. Memory-only cache (no Firestore /
 * localStorage) keyed by rounded coords + date; concurrent banners share one in-flight request.
 */
const DAILY_FORECAST_MAX_DAYS = 15;
const __dailyWeatherMem = typeof Map !== 'undefined' ? new Map() : null;

function daysAheadOf(dateStr) {
  const target = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(target.getTime())) return NaN;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / 86400000);
}

function fetchDailyForecast(lat, lon, dateStr) {
  const key = `${weatherCacheKey(lat, lon)}_${dateStr}`;
  const hit = __dailyWeatherMem && __dailyWeatherMem.get(key);
  if (hit && (hit.promise || (Date.now() - hit.fetchedAt) < WEATHER_CACHE_TTL_MS)) {
    return hit.promise || Promise.resolve(hit.value);
  }
  const url = 'https://api.open-meteo.com/v1/forecast?latitude=' + Number(lat).toFixed(3)
    + '&longitude=' + Number(lon).toFixed(3)
    + '&daily=weather_code,temperature_2m_max,temperature_2m_min'
    + '&timezone=Asia%2FSeoul&start_date=' + dateStr + '&end_date=' + dateStr;
  const promise = withWeatherTimeout(fetch(url))
    .then((res) => {
      if (!res.ok) throw new Error('daily forecast failed');
      return res.json();
    })
    .then((data) => {
      const daily = (data && data.daily) || {};
      const code = Array.isArray(daily.weather_code) ? daily.weather_code[0] : null;
      if (code == null) return null;
      const max = Array.isArray(daily.temperature_2m_max) ? daily.temperature_2m_max[0] : null;
      const min = Array.isArray(daily.temperature_2m_min) ? daily.temperature_2m_min[0] : null;
      return { code, max, min };
    });
  if (__dailyWeatherMem) __dailyWeatherMem.set(key, { promise, fetchedAt: Date.now() });
  promise.then(
    (value) => { if (__dailyWeatherMem) __dailyWeatherMem.set(key, { value, fetchedAt: Date.now() }); },
    () => { if (__dailyWeatherMem) __dailyWeatherMem.delete(key); }
  );
  return promise;
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
    fetchDailyForecast(latNum, lonNum, date)
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

export function WeatherDetailModal({
  dateStr: initialDateStr,
  weatherLocation,
  onClose,
  onSelectDate,
  days = []
}) {
  const React = window.React;
  const [selectedDate, setSelectedDate] = React.useState(initialDateStr || '');
  const [forecastData, setForecastData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  const effectiveLocation = weatherLocation || { name: '서울', lat: 37.566, lon: 126.9784 };
  const lat = effectiveLocation.lat || 37.566;
  const lon = effectiveLocation.lon || 126.9784;
  const locationName = effectiveLocation.name || '지역';

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

  return /*#__PURE__*/React.createElement("div", {
    className: "modal-overlay weather-detail-modal-overlay",
    onClick: onClose,
    style: { zIndex: 12500 }
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal-container weather-detail-modal-container",
    onClick: e => e.stopPropagation(),
    style: {
      maxWidth: '520px',
      width: '92%',
      maxHeight: 'min(90vh, 820px)',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: 'var(--bg-card, #FFFFFF)',
      borderRadius: '24px',
      border: '1px solid var(--border-subtle, rgba(0,0,0,0.08))',
      boxShadow: '0 20px 48px -8px rgba(0, 0, 0, 0.22)',
      overflow: 'hidden',
      boxSizing: 'border-box'
    }
  },
    /* Header */
    /*#__PURE__*/React.createElement("div", {
      className: "modal-header weather-detail-header",
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 20px',
        borderBottom: '1px solid var(--border-subtle, rgba(0,0,0,0.06))',
        flexShrink: 0
      }
    },
      /* Location & Date Title */
      /*#__PURE__*/React.createElement("div", {
        style: { display: 'flex', flexDirection: 'column', gap: '2px' }
      },
        /*#__PURE__*/React.createElement("div", {
          style: { display: 'flex', alignItems: 'center', gap: '6px' }
        },
          /*#__PURE__*/React.createElement("span", {
            style: {
              fontSize: 'var(--font-size-xs, 0.75rem)',
              fontWeight: 700,
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              color: '#3B82F6',
              padding: '2px 8px',
              borderRadius: '9999px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '3px'
            }
          }, `📍 ${locationName}`),
          dayBadge && /*#__PURE__*/React.createElement("span", {
            style: {
              fontSize: 'var(--font-size-xs, 0.75rem)',
              fontWeight: 800,
              color: dayBadge === '오늘' ? '#10B981' : 'var(--text-muted)',
              backgroundColor: dayBadge === '오늘' ? 'rgba(16, 185, 129, 0.1)' : 'var(--border-subtle, rgba(0,0,0,0.05))',
              padding: '2px 8px',
              borderRadius: '9999px'
            }
          }, dayBadge)
        ),
        /*#__PURE__*/React.createElement("span", {
          style: { fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main, #1E293B)' }
        }, formattedDateTitle)
      ),
      /* Close Button */
      /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: onClose,
        className: "modal-close-btn",
        "aria-label": "닫기",
        style: {
          width: '34px',
          height: '34px',
          borderRadius: '50%',
          border: 'none',
          backgroundColor: 'var(--border-subtle, rgba(0,0,0,0.04))',
          color: 'var(--text-muted, #64748B)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          padding: 0,
          transition: 'background-color 0.15s ease'
        }
      },
        /*#__PURE__*/React.createElement("svg", { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2.2, strokeLinecap: "round", strokeLinejoin: "round" },
          /*#__PURE__*/React.createElement("path", { d: "M18 6L6 18M6 6l12 12" })
        )
      )
    ),

    /* Days Carousel Selector */
    Array.isArray(days) && days.length > 0 && /*#__PURE__*/React.createElement("div", {
      className: "weather-detail-days-strip",
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '10px 16px',
        overflowX: 'auto',
        borderBottom: '1px solid var(--border-subtle, rgba(0,0,0,0.05))',
        backgroundColor: 'var(--bg-primary, rgba(0,0,0,0.01))',
        scrollbarWidth: 'none',
        flexShrink: 0
      }
    },
      days.map(d => {
        const isSelected = d.dateStr === selectedDate;
        return /*#__PURE__*/React.createElement("button", {
          key: d.dateStr,
          type: "button",
          onClick: () => setSelectedDate(d.dateStr),
          style: {
            padding: '6px 12px',
            fontSize: 'var(--font-size-xs, 0.78rem)',
            fontWeight: isSelected ? 800 : 600,
            borderRadius: '9999px',
            border: isSelected ? '1px solid #3B82F6' : '1px solid var(--border-subtle, rgba(0,0,0,0.08))',
            backgroundColor: isSelected ? '#3B82F6' : 'var(--bg-card, #FFFFFF)',
            color: isSelected ? '#FFFFFF' : 'var(--text-main, #334155)',
            cursor: 'pointer',
            flexShrink: 0,
            transition: 'all 0.15s ease',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px'
          }
        },
          /*#__PURE__*/React.createElement("span", null, d.label),
          d.offset !== 0 && d.dateStr && /*#__PURE__*/React.createElement("span", {
            style: { opacity: isSelected ? 0.9 : 0.6, fontSize: '0.72rem' }
          }, d.dateStr.slice(5).replace('-', '.'))
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
        style: {
          padding: '40px 0',
          textAlign: 'center',
          color: 'var(--text-muted, #64748B)',
          fontSize: 'var(--font-size-md, 0.9rem)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '10px'
        }
      },
        /*#__PURE__*/React.createElement("span", { style: { fontSize: '1.6rem' } }, "⏳"),
        /*#__PURE__*/React.createElement("span", null, "기상청 및 위성 예보 데이터를 불러오는 중입니다...")
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
          style: {
            padding: '18px 20px',
            borderRadius: '20px',
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.12) 0%, rgba(147, 51, 234, 0.1) 100%)',
            border: '1px solid rgba(59, 130, 246, 0.22)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px'
          }
        },
          /* Left: Icon & Description */
          /*#__PURE__*/React.createElement("div", {
            style: { display: 'flex', alignItems: 'center', gap: '14px' }
          },
            /*#__PURE__*/React.createElement("div", {
              style: {
                width: '54px',
                height: '54px',
                borderRadius: '16px',
                backgroundColor: 'rgba(255, 255, 255, 0.85)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#3B82F6',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.18)',
                flexShrink: 0
              }
            }, getWeatherIcon(weatherCode, 32)),
            /*#__PURE__*/React.createElement("div", {
              style: { display: 'flex', flexDirection: 'column' }
            },
              /*#__PURE__*/React.createElement("span", {
                style: { fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-main, #0F172A)' }
              }, weatherDesc),
              apparentMax != null && /*#__PURE__*/React.createElement("span", {
                style: { fontSize: 'var(--font-size-xs, 0.78rem)', color: 'var(--text-muted, #64748B)', marginTop: '2px' }
              }, `체감온도 약 ${apparentMax}°C`)
            )
          ),
          /* Right: High & Low Temperatures */
          /*#__PURE__*/React.createElement("div", {
            style: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }
          },
            maxTemp != null && /*#__PURE__*/React.createElement("div", {
              style: { display: 'flex', alignItems: 'baseline', gap: '4px' }
            },
              /*#__PURE__*/React.createElement("span", {
                style: { fontSize: '0.72rem', fontWeight: 700, color: '#EF4444' }
              }, "최고"),
              /*#__PURE__*/React.createElement("span", {
                style: { fontSize: '1.4rem', fontWeight: 900, color: '#EF4444', lineHeight: 1 }
              }, `${maxTemp}°`)
            ),
            minTemp != null && /*#__PURE__*/React.createElement("div", {
              style: { display: 'flex', alignItems: 'baseline', gap: '4px' }
            },
              /*#__PURE__*/React.createElement("span", {
                style: { fontSize: '0.72rem', fontWeight: 700, color: '#3B82F6' }
              }, "최저"),
              /*#__PURE__*/React.createElement("span", {
                style: { fontSize: '1.15rem', fontWeight: 800, color: '#3B82F6', lineHeight: 1 }
              }, `${minTemp}°`)
            )
          )
        ),

        /* 4 Key Indicators Grid */
        /*#__PURE__*/React.createElement("div", {
          style: {
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '10px'
          }
        },
          /* 1. Precipitation */
          /*#__PURE__*/React.createElement("div", {
            style: {
              padding: '14px',
              borderRadius: '16px',
              backgroundColor: 'var(--bg-primary, rgba(0,0,0,0.02))',
              border: '1px solid var(--border-subtle, rgba(0,0,0,0.06))',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }
          },
            /*#__PURE__*/React.createElement("div", {
              style: { display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted, #64748B)', fontSize: '0.76rem', fontWeight: 700 }
            },
              /*#__PURE__*/React.createElement("span", null, "💧"), "강수량 및 확률"
            ),
            /*#__PURE__*/React.createElement("div", {
              style: { display: 'flex', alignItems: 'baseline', gap: '6px' }
            },
              /*#__PURE__*/React.createElement("span", {
                style: { fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main, #1E293B)' }
              }, `${precipSum} mm`),
              /*#__PURE__*/React.createElement("span", {
                style: { fontSize: '0.8rem', fontWeight: 700, color: precipProb > 0 ? '#3B82F6' : 'var(--text-muted)' }
              }, `(확률 ${precipProb}%)`)
            )
          ),

          /* 2. Fine Dust (Air Quality) */
          /*#__PURE__*/React.createElement("div", {
            style: {
              padding: '14px',
              borderRadius: '16px',
              backgroundColor: 'var(--bg-primary, rgba(0,0,0,0.02))',
              border: '1px solid var(--border-subtle, rgba(0,0,0,0.06))',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }
          },
            /*#__PURE__*/React.createElement("div", {
              style: { display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted, #64748B)', fontSize: '0.76rem', fontWeight: 700 }
            },
              /*#__PURE__*/React.createElement("span", null, "🍃"), "대기질 (미세먼지)"
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
                    fontSize: '0.72rem'
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
                    fontSize: '0.72rem'
                  }
                }, airQuality.grade25.text)
              )
            ) : /*#__PURE__*/React.createElement("span", {
              style: { fontSize: '0.9rem', fontWeight: 700, color: '#10B981' }
            }, "쾌적 / 보통")
          ),

          /* 3. Wind Speed */
          /*#__PURE__*/React.createElement("div", {
            style: {
              padding: '14px',
              borderRadius: '16px',
              backgroundColor: 'var(--bg-primary, rgba(0,0,0,0.02))',
              border: '1px solid var(--border-subtle, rgba(0,0,0,0.06))',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }
          },
            /*#__PURE__*/React.createElement("div", {
              style: { display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted, #64748B)', fontSize: '0.76rem', fontWeight: 700 }
            },
              /*#__PURE__*/React.createElement("span", null, "💨"), "최대 풍속"
            ),
            /*#__PURE__*/React.createElement("span", {
              style: { fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main, #1E293B)' }
            }, windSpeed ? `${windSpeed} m/s` : '산들바람')
          ),

          /* 4. UV Index */
          /*#__PURE__*/React.createElement("div", {
            style: {
              padding: '14px',
              borderRadius: '16px',
              backgroundColor: 'var(--bg-primary, rgba(0,0,0,0.02))',
              border: '1px solid var(--border-subtle, rgba(0,0,0,0.06))',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }
          },
            /*#__PURE__*/React.createElement("div", {
              style: { display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted, #64748B)', fontSize: '0.76rem', fontWeight: 700 }
            },
              /*#__PURE__*/React.createElement("span", null, "☀️"), "자외선 지수"
            ),
            /*#__PURE__*/React.createElement("span", {
              style: { fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main, #1E293B)' }
            }, uvText(uvIndex))
          )
        ),

        /* Hourly Weather Timeline */
        hourlyList.length > 0 && /*#__PURE__*/React.createElement("div", {
          style: { display: 'flex', flexDirection: 'column', gap: '8px' }
        },
          /*#__PURE__*/React.createElement("div", {
            style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' }
          },
            /*#__PURE__*/React.createElement("span", {
              style: { fontSize: 'var(--font-size-sm, 0.85rem)', fontWeight: 800, color: 'var(--text-main)' }
            }, "시간별 일기예보"),
            /*#__PURE__*/React.createElement("span", {
              style: { fontSize: 'var(--font-size-xs, 0.75rem)', color: 'var(--text-muted)' }
            }, "24시간")
          ),
          /*#__PURE__*/React.createElement("div", {
            className: "weather-hourly-timeline",
            style: {
              display: 'flex',
              gap: '8px',
              overflowX: 'auto',
              padding: '4px 2px 8px',
              scrollbarWidth: 'thin'
            }
          },
            hourlyList.map((h, idx) => {
              const hourNum = parseInt(h.time.split(':')[0], 10);
              const isNow = isDateValid && new Date().toDateString() === targetDate.toDateString() && new Date().getHours() === hourNum;
              return /*#__PURE__*/React.createElement("div", {
                key: idx,
                style: {
                  flex: '0 0 auto',
                  width: '62px',
                  padding: '10px 4px',
                  borderRadius: '14px',
                  backgroundColor: isNow ? 'rgba(59, 130, 246, 0.12)' : 'var(--bg-primary, rgba(0,0,0,0.02))',
                  border: isNow ? '1.5px solid #3B82F6' : '1px solid var(--border-subtle, rgba(0,0,0,0.06))',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                  boxSizing: 'border-box'
                }
              },
                /*#__PURE__*/React.createElement("span", {
                  style: { fontSize: '0.72rem', fontWeight: isNow ? 800 : 600, color: isNow ? '#3B82F6' : 'var(--text-muted)' }
                }, isNow ? '현재' : h.time),
                /*#__PURE__*/React.createElement("div", {
                  style: { height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center' }
                }, getWeatherIcon(h.code, 18)),
                /*#__PURE__*/React.createElement("span", {
                  style: { fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-main)' }
                }, h.temp != null ? `${Math.round(h.temp)}°` : '-'),
                h.precipProb > 0 ? /*#__PURE__*/React.createElement("span", {
                  style: { fontSize: '0.66rem', fontWeight: 700, color: '#3B82F6' }
                }, `${Math.round(h.precipProb)}%`) : /*#__PURE__*/React.createElement("span", {
                  style: { fontSize: '0.66rem', color: 'transparent' }
                }, "-")
              );
            })
          )
        )
      )
    ),

    /* Footer */
    /*#__PURE__*/React.createElement("div", {
      className: "modal-footer weather-detail-footer",
      style: {
        padding: '14px 20px',
        borderTop: '1px solid var(--border-subtle, rgba(0,0,0,0.06))',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '8px',
        backgroundColor: 'var(--bg-card)',
        flexShrink: 0
      }
    },
      /* Windy live radar button */
      /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: handleOpenWindy,
        style: {
          padding: '8px 12px',
          fontSize: 'var(--font-size-xs, 0.78rem)',
          fontWeight: 700,
          color: '#3B82F6',
          backgroundColor: 'rgba(59, 130, 246, 0.08)',
          border: '1px solid rgba(59, 130, 246, 0.2)',
          borderRadius: 'var(--radius-md, 10px)',
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '5px'
        }
      },
        /*#__PURE__*/React.createElement("span", null, "🌐"),
        "Windy 레이더"
      ),
      /* Right actions */
      /*#__PURE__*/React.createElement("div", {
        style: { display: 'flex', alignItems: 'center', gap: '8px' }
      },
        onSelectDate && /*#__PURE__*/React.createElement("button", {
          type: "button",
          onClick: handleSelectDateCalendar,
          className: "btn btn-primary",
          style: {
            padding: '8px 14px',
            fontSize: 'var(--font-size-sm, 0.82rem)',
            fontWeight: 800,
            borderRadius: 'var(--radius-md, 10px)'
          }
        }, "캘린더로 이동"),
        /*#__PURE__*/React.createElement("button", {
          type: "button",
          onClick: onClose,
          className: "btn btn-secondary",
          style: {
            padding: '8px 14px',
            fontSize: 'var(--font-size-sm, 0.82rem)',
            borderRadius: 'var(--radius-md, 10px)'
          }
        }, "닫기")
      )
    )
  ));
}

if (typeof window !== 'undefined') {
  window.GATHER_UI_COMPONENTS = Object.assign({}, window.GATHER_UI_COMPONENTS || {}, {
    WeatherBadge: WeatherBadge,
    WeatherLocationModal: WeatherLocationModal,
    DailyWeatherIcon: DailyWeatherIcon,
    WeatherDetailModal: WeatherDetailModal,
  });
}

