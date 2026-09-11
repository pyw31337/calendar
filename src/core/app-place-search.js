/*
 * Provider-neutral place and tourism search.
 *
 * The UI must not know which geocoder is active.  Keeping the provider order,
 * timeout, cache and Nominatim throttle here lets us switch providers without
 * editing every modal that offers place search.
 *
 * reverseGeocodeCoords is the photo-upload path: Kakao coord2address first
 * (Korean building/admin names), Nominatim zoom=18 as supplement/fallback.
 */

import {
  parseKakaoAddress,
  parseNominatimLocation,
  mergeLocationResults
} from './photo-metadata-tags.js';

const PLACE_SEARCH_PROVIDER_KEY = 'gather_place_search_provider_v1';
const NOMINATIM_ENDPOINT_KEY = 'gather_nominatim_endpoint_v1';
const DEFAULT_PROVIDER_ORDER = ['kakao', 'google', 'nominatim'];

// Kakao's category_group_code covers 15 fixed groups; only these have an obvious match to this
// app's six place categories (식당/카페/놀이/숙박/쇼핑/기타) -- everything else (학교, 주차장, 지하철역
// 등) falls back to 기타 rather than guessing.
const KAKAO_CATEGORY_GROUP_TO_PLACE_CATEGORY = {
  FD6: 'restaurant', // 음식점
  CE7: 'cafe',        // 카페
  AD5: 'lodging',      // 숙박
  AT4: 'play',         // 관광명소
  MT1: 'shopping'      // 대형마트
};
const NOMINATIM_MIN_INTERVAL_MS = 1100;
const REQUEST_TIMEOUT_MS = 4500;
const TOUR_TYPE_LABELS = {
  '12': '관광지', '14': '문화시설', '15': '축제·행사', '25': '여행코스',
  '28': '레포츠', '32': '숙박', '38': '쇼핑', '39': '음식점'
};
const memoryCache = new Map();
const inFlightSearches = new Map();
let lastNominatimRequestAt = 0;
let nominatimQueue = Promise.resolve();

function getStorage() {
  try { return window.localStorage; } catch (_) { return null; }
}

function readProviderPreference() {
  const value = getStorage()?.getItem(PLACE_SEARCH_PROVIDER_KEY) || '';
  return DEFAULT_PROVIDER_ORDER.includes(value) ? value : 'auto';
}

function getPlaceSearchSettings() {
  const preferred = readProviderPreference();
  const order = preferred === 'auto'
    ? DEFAULT_PROVIDER_ORDER.slice()
    : [preferred, ...DEFAULT_PROVIDER_ORDER.filter(provider => provider !== preferred)];
  const endpoint = getStorage()?.getItem(NOMINATIM_ENDPOINT_KEY)
    || (typeof window !== 'undefined' && window.GATHER_PLACE_SEARCH_NOMINATIM_ENDPOINT)
    || 'https://nominatim.openstreetmap.org/search';
  return { preferred, order, endpoint, nominatimMinIntervalMs: NOMINATIM_MIN_INTERVAL_MS };
}

function setPlaceSearchProvider(provider) {
  const value = provider === 'auto' || DEFAULT_PROVIDER_ORDER.includes(provider) ? provider : 'auto';
  const storage = getStorage();
  if (storage) storage.setItem(PLACE_SEARCH_PROVIDER_KEY, value);
  return value;
}

function setNominatimEndpoint(endpoint) {
  const value = String(endpoint || '').trim();
  if (!/^https?:\/\//i.test(value)) return false;
  const storage = getStorage();
  if (storage) storage.setItem(NOMINATIM_ENDPOINT_KEY, value.replace(/\/$/, ''));
  return true;
}

function fetchWithTimeout(url, options = {}, timeoutMs = REQUEST_TIMEOUT_MS) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(url, { ...options, signal: controller.signal }).finally(() => clearTimeout(timer));
}

// Caps how long any single search tier (Kakao/Google Places/Nominatim) is allowed to hang before
// PlaceRegisterModal.handleSearch gives up on it and moves to the next fallback -- googlePlacesSearchProxy
// in particular is a 1st-gen Cloud Function that's called rarely (only when Kakao comes up empty),
// so a cold start there can otherwise stall the whole 3-tier chain far longer than any one search
// step should reasonably take. Distinct from this file's own fetchWithTimeout above (different
// signature: no options param) -- kept separate rather than merged since callers pass args
// positionally and a merge would silently break one side's timeoutMs into the other's options.
async function searchTierFetchWithTimeout(url, timeoutMs) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
}

function cached(key) {
  const item = memoryCache.get(key);
  if (!item || item.expiresAt < Date.now()) {
    if (item) memoryCache.delete(key);
    return null;
  }
  return item.value;
}

function cache(key, value) {
  memoryCache.set(key, { value, expiresAt: Date.now() + 5 * 60 * 1000 });
  return value;
}

async function waitForNominatimSlot() {
  const run = nominatimQueue.then(async () => {
    const waitMs = Math.max(0, NOMINATIM_MIN_INTERVAL_MS - (Date.now() - lastNominatimRequestAt));
    if (waitMs) await new Promise(resolve => setTimeout(resolve, waitMs));
    lastNominatimRequestAt = Date.now();
  });
  nominatimQueue = run.catch(() => {});
  await run;
}

function normalizeKakao(doc, idx, query, categoryMap) {
  const lat = Number.parseFloat(doc.y);
  const lng = Number.parseFloat(doc.x);
  return Number.isFinite(lat) && Number.isFinite(lng) ? {
    id: `kakao_${doc.id || idx}`,
    provider: 'kakao',
    name: doc.place_name || query,
    address: doc.road_address_name || doc.address_name || '',
    lat, lng,
    categoryId: categoryMap[doc.category_group_code] || null,
    categoryLabel: doc.category_name || '',
    phone: doc.phone || '',
    url: doc.place_url || ''
  } : null;
}

function normalizeGoogle(place, idx, query) {
  const lat = Number.parseFloat(place.location?.latitude);
  const lng = Number.parseFloat(place.location?.longitude);
  return Number.isFinite(lat) && Number.isFinite(lng) ? {
    id: `google_${place.id || idx}`,
    provider: 'google',
    name: place.displayName?.text || query,
    address: place.formattedAddress || '',
    lat, lng,
    categoryId: null,
    categoryLabel: '',
    phone: '',
    url: ''
  } : null;
}

function normalizeNominatim(item, idx, query) {
  const lat = Number.parseFloat(item.lat);
  const lng = Number.parseFloat(item.lon);
  return Number.isFinite(lat) && Number.isFinite(lng) ? {
    id: `nominatim_${item.place_id || idx}`,
    provider: 'nominatim',
    name: (item.display_name || '').split(',')[0] || query,
    address: item.display_name || '',
    lat, lng,
    categoryId: null,
    categoryLabel: '',
    phone: '',
    url: ''
  } : null;
}

async function searchProvider(provider, query, options) {
  const { firebaseConfig = {}, categoryMap = {}, nominatimEndpoint = 'https://nominatim.openstreetmap.org/search' } = options;
  const key = `${provider}:${query.toLowerCase()}`;
  const hit = cached(key);
  if (hit) return hit;

  // Deduplicate concurrent identical provider lookups so debounce + manual search
  // share one network trip instead of racing duplicate responses into the UI.
  const existing = inFlightSearches.get(key);
  if (existing) return existing;

  const pending = (async () => {
    if (provider === 'kakao') {
      const base = `https://us-central1-${firebaseConfig.projectId}.cloudfunctions.net/kakaoLocalSearchProxy`;
      const response = await fetchWithTimeout(`${base}?query=${encodeURIComponent(query)}`);
      const json = response.ok ? await response.json() : null;
      const result = json?.ok && Array.isArray(json.documents)
        ? json.documents.map((doc, idx) => normalizeKakao(doc, idx, query, categoryMap)).filter(Boolean) : [];
      return cache(key, result);
    }

    if (provider === 'google') {
      const base = `https://us-central1-${firebaseConfig.projectId}.cloudfunctions.net/googlePlacesSearchProxy`;
      const response = await fetchWithTimeout(`${base}?query=${encodeURIComponent(query)}`);
      const json = response.ok ? await response.json() : null;
      const result = json?.ok && Array.isArray(json.places)
        ? json.places.map((place, idx) => normalizeGoogle(place, idx, query)).filter(Boolean) : [];
      return cache(key, result);
    }

    if (provider === 'nominatim') {
      await waitForNominatimSlot();
      const url = `${nominatimEndpoint}?q=${encodeURIComponent(query)}&format=json&limit=8&accept-language=ko`;
      const response = await fetchWithTimeout(url);
      const data = response.ok ? await response.json() : [];
      const result = Array.isArray(data) ? data.map((item, idx) => normalizeNominatim(item, idx, query)).filter(Boolean) : [];
      return cache(key, result);
    }
    return [];
  })();

  inFlightSearches.set(key, pending);
  try {
    return await pending;
  } finally {
    if (inFlightSearches.get(key) === pending) inFlightSearches.delete(key);
  }
}

async function searchPlaces(query, options = {}) {
  const cleanQuery = String(query || '').trim();
  if (!cleanQuery) return { provider: null, results: [] };
  const settings = getPlaceSearchSettings();
  if (!options.nominatimEndpoint) options.nominatimEndpoint = settings.endpoint;
  const order = options.auto ? settings.order.slice(0, 1) : settings.order;
  let lastError = null;
  for (const provider of order) {
    options.onStage?.(provider);
    try {
      const results = await searchProvider(provider, cleanQuery, options);
      if (results.length) return { provider, results };
    } catch (error) {
      lastError = error;
      console.warn(`[place-search] ${provider} failed; trying next provider`, error);
    }
  }
  return { provider: null, results: [], error: lastError };
}

function getTourApiUrl(firebaseConfig, params = {}) {
  const base = `https://us-central1-${firebaseConfig?.projectId || ''}.cloudfunctions.net/tourApiSearchProxy`;
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') search.set(key, String(value));
  });
  return `${base}?${search.toString()}`;
}

async function searchTourInfo(firebaseConfig, params = {}) {
  const key = `tour:${JSON.stringify(params)}`;
  const hit = cached(key);
  if (hit) return hit;
  const response = await fetchWithTimeout(getTourApiUrl(firebaseConfig, params), {}, 8000);
  const json = response.ok ? await response.json() : null;
  const result = json?.ok && Array.isArray(json.items) ? json.items : [];
  return cache(key, result);
}

function groupTourItemsByType(items = []) {
  const groups = new Map();
  items.forEach(item => {
    const key = String(item?.contentTypeId || 'etc');
    if (!groups.has(key)) groups.set(key, { key, label: TOUR_TYPE_LABELS[key] || '주변 여행정보', items: [] });
    groups.get(key).items.push(item);
  });
  return Array.from(groups.values());
}

function isSchoolPoi(parsed) {
  return /학교|유치원|대학교|어린이집/.test(String(parsed?.poi || ''));
}

async function reverseGeocodeNominatim(lat, lng) {
  await waitForNominatimSlot();
  const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=jsonv2&addressdetails=1&namedetails=1&accept-language=ko&zoom=18`;
  const response = await fetchWithTimeout(url, {
    headers: { Accept: 'application/json', 'User-Agent': 'GatherCalendar/1.0 (https://github.com/pyw31337/calendar)' }
  });
  if (!response.ok) return null;
  return parseNominatimLocation(await response.json());
}

async function reverseGeocodeKakao(lat, lng, firebaseConfig) {
  const projectId = firebaseConfig?.projectId;
  if (!projectId) return null;
  const base = `https://us-central1-${projectId}.cloudfunctions.net/kakaoLocalSearchProxy`;
  const response = await fetchWithTimeout(`${base}?x=${encodeURIComponent(String(lng))}&y=${encodeURIComponent(String(lat))}`);
  const json = response.ok ? await response.json() : null;
  if (!json?.ok || !Array.isArray(json.documents) || !json.documents[0]) return null;
  return parseKakaoAddress(json.documents[0]);
}

async function reverseGeocodeCoords(lat, lng, options = {}) {
  const latN = Number(lat);
  const lngN = Number(lng);
  if (!Number.isFinite(latN) || !Number.isFinite(lngN)) {
    return { location: '', locationTags: [] };
  }
  const key = `rev:${latN.toFixed(4)},${lngN.toFixed(4)}`;
  const hit = cached(key);
  if (hit) return hit;
  const existing = inFlightSearches.get(key);
  if (existing) return existing;

  const pending = (async () => {
    let kakaoParsed;
    try {
      kakaoParsed = await reverseGeocodeKakao(latN, lngN, options.firebaseConfig || {});
    } catch (_) { kakaoParsed = null; }

    let nominatimParsed = null;
    const skipNominatim = isSchoolPoi(kakaoParsed) && kakaoParsed?.sido;
    if (!skipNominatim) {
      try {
        nominatimParsed = await reverseGeocodeNominatim(latN, lngN);
      } catch (_) { nominatimParsed = null; }
    }

    const merged = mergeLocationResults(kakaoParsed, nominatimParsed);
    return cache(key, merged);
  })();

  inFlightSearches.set(key, pending);
  try {
    return await pending;
  } finally {
    if (inFlightSearches.get(key) === pending) inFlightSearches.delete(key);
  }
}

const api = {
  getPlaceSearchSettings,
  setPlaceSearchProvider,
  setNominatimEndpoint,
  searchPlaces,
  searchTourInfo,
  groupTourItemsByType,
  getTourApiUrl,
  reverseGeocodeCoords
};

if (typeof window !== 'undefined') window.GATHER_APP_PLACE_SEARCH = api;
export {
  getPlaceSearchSettings,
  setPlaceSearchProvider,
  setNominatimEndpoint,
  searchPlaces,
  searchTourInfo,
  groupTourItemsByType,
  getTourApiUrl,
  reverseGeocodeCoords,
  KAKAO_CATEGORY_GROUP_TO_PLACE_CATEGORY,
  searchTierFetchWithTimeout as fetchWithTimeout
};
