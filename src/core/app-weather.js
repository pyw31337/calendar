import { SunIcon, CloudIcon, MistIcon, CloudRainIcon, SnowflakeIcon, CloudLightningIcon } from '../ui/ui-icons.js';

export function getWeatherIcon(code, size = 16) {
  const React = window.React;
  const c = Number(code);
  if (c === 0) return /*#__PURE__*/React.createElement(SunIcon, { size });
  if ([1, 2, 3].includes(c)) return /*#__PURE__*/React.createElement(CloudIcon, { size });
  if ([45, 48].includes(c)) return /*#__PURE__*/React.createElement(MistIcon, { size });
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(c)) return /*#__PURE__*/React.createElement(CloudRainIcon, { size });
  if ([71, 73, 75, 77, 85, 86].includes(c)) return /*#__PURE__*/React.createElement(SnowflakeIcon, { size });
  if ([95, 96, 99].includes(c)) return /*#__PURE__*/React.createElement(CloudLightningIcon, { size });
  return /*#__PURE__*/React.createElement(SunIcon, { size });
}

export function translateKoreanToEnglish(query) {
  const clean = query.trim().toLowerCase();
  const mapping = {
    '서울': 'Seoul', '서울특별시': 'Seoul', '서울시': 'Seoul',
    '인천': 'Incheon', '인천광역시': 'Incheon', '인천시': 'Incheon',
    '부산': 'Busan', '부산광역시': 'Busan', '부산시': 'Busan',
    '대구': 'Daegu', '대구광역시': 'Daegu', '대구시': 'Daegu',
    '대전': 'Daejeon', '대전광역시': 'Daejeon', '대전시': 'Daejeon',
    '광주': 'Gwangju', '광주광역시': 'Gwangju', '광주시': 'Gwangju',
    '울산': 'Ulsan', '울산광역시': 'Ulsan', '울산시': 'Ulsan',
    '세종': 'Sejong', '세종시': 'Sejong', '세종특별자치시': 'Sejong',
    '경기도': 'Gyeonggi', '경기': 'Gyeonggi',
    '강원도': 'Gangwon', '강원': 'Gangwon',
    '충청북도': 'Chungcheongbuk', '충북': 'Chungcheongbuk',
    '충청남도': 'Chungcheongnam', '충남': 'Chungcheongnam',
    '전라북도': 'Jeollabuk', '전북': 'Jeollabuk',
    '전라남도': 'Jeollanam', '전남': 'Jeollanam',
    '경상북도': 'Gyeongsangbuk', '경북': 'Gyeongsangbuk',
    '경상남도': 'Gyeongsangnam', '경남': 'Gyeongsangnam',
    '제주': 'Jeju', '제주도': 'Jeju', '제주시': 'Jeju', '서귀포': 'Seogwipo',
    '수원': 'Suwon', '성남': 'Seongnam', '분당': 'Bundang', '용인': 'Yongin',
    '부천': 'Bucheon', '안산': 'Ansan', '화성': 'Hwaseong', '남양주': 'Namyangju',
    '남양주시': 'Namyangju', '안양': 'Anyang', '평택': 'Pyeongtaek',
    '의정부': 'Uijeongbu', '파주': 'Paju', '파주시': 'Paju', '시흥': 'Siheung',
    '김포': 'Gimpo', '광명': 'Gwangmyeong', '군포': 'Gunpo', '오산': 'Osan',
    '이천': 'Icheon', '양주': 'Yangju', '안성': 'Anseong', '구리': 'Guri',
    '포천': 'Pocheon', '의왕': 'Uiwang', '하남': 'Hanam', '여주': 'Yeoju',
    '동두천': 'Dongducheon', '과천': 'Gwacheon',
    '춘천': 'Chuncheon', '원주': 'Wonju', '강릉': 'Gangneung', '동해': 'Donghae',
    '태백': 'Taebaek', '속초': 'Sokcho', '삼척': 'Samcheok',
    '청주': 'Cheongju', '충주': 'Chungju', '제천': 'Jecheon',
    '천안': 'Cheonan', '공주': 'Gongju', '보령': 'Boryeong', '아산': 'Asan',
    '서산': 'Seosan', '논산': 'Nonsan', '계룡': 'Gyeryong', '당진': 'Dangjin',
    '전주': 'Jeonju', '군산': 'Gunsan', '익산': 'Iksan', '정읍': 'Jeongeup',
    '남원': 'Namwon', '김제': 'Gimje',
    '목포': 'Mokpo', '여수': 'Yeosu', '순천': 'Suncheon', '나주': 'Naju',
    '광양': 'Gwangyang',
    '포항': 'Pohang', '경주': 'Gyeongju', '김천': 'Gimcheon', '안동': 'Andong',
    '구미': 'Gumi', '영주': 'Yeongju', '영천': 'Yeongcheon', '상주': 'Sangju',
    '문경': 'Mungyeong', '경산': 'Gyeongsan',
    '창원': 'Changwon', '진주': 'Jinju', '통영': 'Tongyeong', '사천': 'Sacheon',
    '김해': 'Gimhae', '밀양': 'Miryang', '거제': 'Geoje', '양산': 'Yangsan',
    '독도': 'Dokdo', '울릉도': 'Ulleungdo'
  };

  if (mapping[clean]) return mapping[clean];
  if (/[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(query)) {
    return null; // Fallback to Nominatim
  }
  return query;
}

export function getWeatherDescription(code) {
  const c = Number(code);
  if (c === 0) return '맑음';
  if (c === 1) return '대체로 맑음';
  if (c === 2) return '구름 조금';
  if (c === 3) return '흐림';
  if ([45, 48].includes(c)) return '안개';
  if ([51, 53, 55].includes(c)) return '이슬비';
  if ([56, 57].includes(c)) return '어는 이슬비';
  if (c === 61) return '약한 비';
  if (c === 63) return '비';
  if (c === 65) return '강한 비';
  if ([66, 67].includes(c)) return '어는 비';
  if ([71, 73, 75].includes(c)) return '눈';
  if (c === 77) return '싸락눈';
  if ([80, 81, 82].includes(c)) return '소나기';
  if ([85, 86].includes(c)) return '눈보라/소낙눈';
  if (c === 95) return '뇌우';
  if ([96, 99].includes(c)) return '우박을 동반한 뇌우';
  return '맑음';
}

export function getAirQualityGrade(type, value) {
  if (value == null || Number.isNaN(Number(value))) return { text: '보통', color: '#10B981', level: 2 };
  const val = Number(value);
  if (type === 'pm10') {
    if (val <= 30) return { text: '좋음', color: '#3B82F6', level: 1 };
    if (val <= 80) return { text: '보통', color: '#10B981', level: 2 };
    if (val <= 150) return { text: '나쁨', color: '#F59E0B', level: 3 };
    return { text: '매우나쁨', color: '#EF4444', level: 4 };
  }
  // PM2.5
  if (val <= 15) return { text: '좋음', color: '#3B82F6', level: 1 };
  if (val <= 35) return { text: '보통', color: '#10B981', level: 2 };
  if (val <= 75) return { text: '나쁨', color: '#F59E0B', level: 3 };
  return { text: '매우나쁨', color: '#EF4444', level: 4 };
}

const FOUR_DAY_WEATHER_TTL_MS = 60 * 60 * 1000; // 1 hour
const __fourDayWeatherMem = typeof Map !== 'undefined' ? new Map() : null;
const __fourDayInflight = typeof Map !== 'undefined' ? new Map() : null;
const __singleDayWeatherMem = typeof Map !== 'undefined' ? new Map() : null;
const __singleDayInflight = typeof Map !== 'undefined' ? new Map() : null;
const __detailedWeatherMem = typeof Map !== 'undefined' ? new Map() : null;

function weatherCoordKey(lat, lon) {
  return `${Number(lat).toFixed(3)}_${Number(lon).toFixed(3)}`;
}

/** Calendar-day distance from local today. Matches the hero column dates and DailyWeatherIcon. */
function localDayOffset(dateStr) {
  const target = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(target.getTime())) return NaN;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / 86400000);
}

export function readFourDayWeatherMem(lat, lon) {
  if (!__fourDayWeatherMem) return null;
  const key = weatherCoordKey(lat, lon);
  const entry = __fourDayWeatherMem.get(key);
  if (entry && (Date.now() - entry.fetchedAt) < FOUR_DAY_WEATHER_TTL_MS) {
    return entry.value;
  }
  return null;
}

export function fetchFourDayForecast(lat, lon) {
  const key = weatherCoordKey(lat, lon);
  const hit = readFourDayWeatherMem(lat, lon);
  if (hit) return Promise.resolve(hit);
  if (__fourDayInflight && __fourDayInflight.has(key)) return __fourDayInflight.get(key);

  // One past day plus today and up to 9 future days gives the hero its compact
  // columns (up to 10 days for responsive desktop/tablet/mobile).
  // Note: past_days=1&forecast_days=4 query pattern is retained in fallback.
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${Number(lat).toFixed(3)}&longitude=${Number(lon).toFixed(3)}&daily=weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,uv_index_max&timezone=Asia%2FSeoul&past_days=1&forecast_days=10`;

  const promise = fetch(url)
    .then(res => {
      if (!res.ok) throw new Error(`Weather fetch failed: ${res.status}`);
      return res.json();
    })
    .then(data => {
      const daily = data && data.daily;
      if (!daily || !Array.isArray(daily.time)) return null;
      const result = {};
      daily.time.forEach((t, i) => {
        result[t] = {
          code: daily.weather_code?.[i] ?? 0,
          max: daily.temperature_2m_max?.[i],
          min: daily.temperature_2m_min?.[i],
          apparentMax: daily.apparent_temperature_max?.[i],
          apparentMin: daily.apparent_temperature_min?.[i],
          precipSum: daily.precipitation_sum?.[i] ?? 0,
          precipProbMax: daily.precipitation_probability_max?.[i] ?? 0,
          windSpeedMax: daily.wind_speed_10m_max?.[i],
          uvIndexMax: daily.uv_index_max?.[i],
        };
      });
      if (__fourDayWeatherMem) {
        __fourDayWeatherMem.set(key, { value: result, fetchedAt: Date.now() });
      }
      return result;
    })
    .catch(() => {
      // Fallback with minimal query if full daily query fails
      const fallbackUrl = `https://api.open-meteo.com/v1/forecast?latitude=${Number(lat).toFixed(3)}&longitude=${Number(lon).toFixed(3)}&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=Asia%2FSeoul&past_days=1&forecast_days=4`;
      return fetch(fallbackUrl)
        .then(r => r.ok ? r.json() : null)
        .then(data => {
          const daily = data && data.daily;
          if (!daily || !Array.isArray(daily.time)) return null;
          const result = {};
          daily.time.forEach((t, i) => {
            result[t] = {
              code: daily.weather_code?.[i] ?? 0,
              max: daily.temperature_2m_max?.[i],
              min: daily.temperature_2m_min?.[i],
            };
          });
          if (__fourDayWeatherMem) {
            __fourDayWeatherMem.set(key, { value: result, fetchedAt: Date.now() });
          }
          return result;
        });
    })
    .finally(() => {
      if (__fourDayInflight) __fourDayInflight.delete(key);
    });
  if (__fourDayInflight) __fourDayInflight.set(key, promise);
  return promise;
}

function readSingleDayWeatherMem(lat, lon, dateStr) {
  if (!__singleDayWeatherMem) return undefined;
  const entry = __singleDayWeatherMem.get(`${weatherCoordKey(lat, lon)}_${dateStr}`);
  if (entry && (Date.now() - entry.fetchedAt) < FOUR_DAY_WEATHER_TTL_MS) return entry.value;
  return undefined;
}

function fetchSingleDayForecast(lat, lon, dateStr) {
  const key = `${weatherCoordKey(lat, lon)}_${dateStr}`;
  const cached = readSingleDayWeatherMem(lat, lon, dateStr);
  if (cached !== undefined) return Promise.resolve(cached);
  if (__singleDayInflight && __singleDayInflight.has(key)) return __singleDayInflight.get(key);
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${Number(lat).toFixed(3)}&longitude=${Number(lon).toFixed(3)}&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=Asia%2FSeoul&start_date=${encodeURIComponent(dateStr)}&end_date=${encodeURIComponent(dateStr)}`;
  const promise = fetch(url)
    .then(res => {
      if (!res.ok) throw new Error('daily forecast failed');
      return res.json();
    })
    .then(data => {
      const daily = (data && data.daily) || {};
      const code = Array.isArray(daily.weather_code) ? daily.weather_code[0] : null;
      if (code == null) return null;
      const value = {
        code,
        max: Array.isArray(daily.temperature_2m_max) ? daily.temperature_2m_max[0] : null,
        min: Array.isArray(daily.temperature_2m_min) ? daily.temperature_2m_min[0] : null,
      };
      if (__singleDayWeatherMem) __singleDayWeatherMem.set(key, { value, fetchedAt: Date.now() });
      const bulk = __fourDayWeatherMem && __fourDayWeatherMem.get(weatherCoordKey(lat, lon));
      if (bulk && bulk.value) bulk.value[dateStr] = value;
      return value;
    })
    .catch(() => null)
    .finally(() => {
      if (__singleDayInflight) __singleDayInflight.delete(key);
    });
  if (__singleDayInflight) __singleDayInflight.set(key, promise);
  return promise;
}

/**
 * One daily max + weather code for a coordinate and calendar date.
 * The home hero and the D-day badge both read this so they cannot diverge:
 * dates inside the hero window come from the shared bulk cache (one in-flight
 * request per rounded lat/lon); later dates use one start/end request cached
 * on the same key.
 */
export function resolveDailyForecast(lat, lon, dateStr) {
  if (lat == null || lon == null || !dateStr) return Promise.resolve(null);
  const cached = readFourDayWeatherMem(lat, lon);
  if (cached && Object.prototype.hasOwnProperty.call(cached, dateStr)) {
    return Promise.resolve(cached[dateStr] || null);
  }
  const single = readSingleDayWeatherMem(lat, lon, dateStr);
  if (single !== undefined) return Promise.resolve(single);
  const ahead = localDayOffset(dateStr);
  // forecast_days=10 includes today through today+9; past_days=1 adds yesterday.
  if (Number.isFinite(ahead) && ahead >= -1 && ahead <= 9 && !(cached && !cached[dateStr])) {
    return fetchFourDayForecast(lat, lon).then(map => (map && map[dateStr]) || null);
  }
  return fetchSingleDayForecast(lat, lon, dateStr);
}

export function fetchDetailedWeatherForecast(lat, lon) {
  const key = `${Number(lat).toFixed(3)}_${Number(lon).toFixed(3)}`;
  if (__detailedWeatherMem) {
    const entry = __detailedWeatherMem.get(key);
    if (entry && (Date.now() - entry.fetchedAt) < FOUR_DAY_WEATHER_TTL_MS) {
      return Promise.resolve(entry.value);
    }
  }

  const forecastUrl = `https://api.open-meteo.com/v1/forecast?latitude=${Number(lat).toFixed(3)}&longitude=${Number(lon).toFixed(3)}&daily=weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,uv_index_max&hourly=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation_probability,precipitation,weather_code,wind_speed_10m&timezone=Asia%2FSeoul&past_days=1&forecast_days=10`;
  const airQualityUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${Number(lat).toFixed(3)}&longitude=${Number(lon).toFixed(3)}&hourly=pm10,pm2_5,european_aqi&timezone=Asia%2FSeoul&past_days=1&forecast_days=10`;

  return Promise.all([
    fetch(forecastUrl).then(r => r.ok ? r.json() : null).catch(() => null),
    fetch(airQualityUrl).then(r => r.ok ? r.json() : null).catch(() => null)
  ]).then(([forecastData, airData]) => {
    if (!forecastData || !forecastData.daily) return null;

    const dailyMap = {};
    forecastData.daily.time.forEach((t, i) => {
      dailyMap[t] = {
        dateStr: t,
        code: forecastData.daily.weather_code?.[i] ?? 0,
        max: forecastData.daily.temperature_2m_max?.[i],
        min: forecastData.daily.temperature_2m_min?.[i],
        apparentMax: forecastData.daily.apparent_temperature_max?.[i],
        apparentMin: forecastData.daily.apparent_temperature_min?.[i],
        precipSum: forecastData.daily.precipitation_sum?.[i] ?? 0,
        precipProbMax: forecastData.daily.precipitation_probability_max?.[i] ?? 0,
        windSpeedMax: forecastData.daily.wind_speed_10m_max?.[i],
        uvIndexMax: forecastData.daily.uv_index_max?.[i],
      };
    });

    // Populate fourDayWeatherMem cache as well
    if (__fourDayWeatherMem) {
      __fourDayWeatherMem.set(key, { value: dailyMap, fetchedAt: Date.now() });
    }

    const hourlyMap = {};
    if (forecastData.hourly && Array.isArray(forecastData.hourly.time)) {
      forecastData.hourly.time.forEach((isoTime, idx) => {
        const dStr = isoTime.slice(0, 10);
        if (!hourlyMap[dStr]) hourlyMap[dStr] = [];
        const rawWind = forecastData.hourly.wind_speed_10m?.[idx];
        hourlyMap[dStr].push({
          time: isoTime.slice(11, 16),
          isoTime,
          temp: forecastData.hourly.temperature_2m?.[idx],
          apparent: forecastData.hourly.apparent_temperature?.[idx],
          humidity: forecastData.hourly.relative_humidity_2m?.[idx],
          precipProb: forecastData.hourly.precipitation_probability?.[idx] ?? 0,
          precip: forecastData.hourly.precipitation?.[idx] ?? 0,
          code: forecastData.hourly.weather_code?.[idx] ?? 0,
          windSpeed: rawWind != null ? Math.round((rawWind / 3.6) * 10) / 10 : null,
        });
      });
    }

    const airMap = {};
    if (airData && airData.hourly && Array.isArray(airData.hourly.time)) {
      const pm10ByDay = {};
      const pm25ByDay = {};
      airData.hourly.time.forEach((isoTime, idx) => {
        const dStr = isoTime.slice(0, 10);
        if (!pm10ByDay[dStr]) pm10ByDay[dStr] = [];
        if (!pm25ByDay[dStr]) pm25ByDay[dStr] = [];
        const v10 = airData.hourly.pm10?.[idx];
        const v25 = airData.hourly.pm2_5?.[idx];
        if (v10 != null && !Number.isNaN(v10)) pm10ByDay[dStr].push(v10);
        if (v25 != null && !Number.isNaN(v25)) pm25ByDay[dStr].push(v25);
      });

      Object.keys(pm10ByDay).forEach(dStr => {
        const vals10 = pm10ByDay[dStr];
        const vals25 = pm25ByDay[dStr] || [];
        const avg10 = vals10.length ? Math.round(vals10.reduce((a, b) => a + b, 0) / vals10.length) : null;
        const avg25 = vals25.length ? Math.round(vals25.reduce((a, b) => a + b, 0) / vals25.length) : null;
        airMap[dStr] = {
          pm10: avg10,
          pm2_5: avg25,
          grade10: getAirQualityGrade('pm10', avg10),
          grade25: getAirQualityGrade('pm2_5', avg25),
        };
      });
    }

    const compiled = {
      daily: dailyMap,
      hourly: hourlyMap,
      airQuality: airMap,
    };

    if (__detailedWeatherMem) {
      __detailedWeatherMem.set(key, { value: compiled, fetchedAt: Date.now() });
    }

    return compiled;
  });
}
