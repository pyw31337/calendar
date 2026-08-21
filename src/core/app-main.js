/** P6 ESM adapter for app-main — live assets/app-main.js unchanged */
import './../react-globals.js';
const React = window.React;
const ReactDOM = window.ReactDOM;
if (!React || !ReactDOM || typeof ReactDOM.createRoot !== 'function') {
  throw new Error('[P6] React globals missing before app-main');
}

const GATHER_APP_CONSTANTS = window.GATHER_APP_CONSTANTS || {};
const GATHER_APP_UTILS = window.GATHER_APP_UTILS || {};
const PRESET_COLORS = Array.isArray(GATHER_APP_CONSTANTS.PRESET_COLORS) ? GATHER_APP_CONSTANTS.PRESET_COLORS : ['#EF4444', '#F97316', '#F59E0B', '#10B981', '#06B6D4', '#3B82F6', '#6366F1', '#8B5CF6', '#EC4899', '#14B8A6'];
const DEFAULT_EXPENSE_CATEGORIES = Array.isArray(GATHER_APP_CONSTANTS.DEFAULT_EXPENSE_CATEGORIES) ? GATHER_APP_CONSTANTS.DEFAULT_EXPENSE_CATEGORIES : [
  { id: 'food', name: '식품', color: '#F97316' },
  { id: 'goods', name: '물품', color: '#3B82F6' },
  { id: 'transport', name: '교통', color: '#10B981' },
  { id: 'lodging', name: '숙박', color: '#8B5CF6' },
  { id: 'culture', name: '문화', color: '#EC4899' },
  { id: 'etc', name: '기타', color: '#64748B' }
];
const EXPENSE_CATEGORY_ICONS = GATHER_APP_CONSTANTS.EXPENSE_CATEGORY_ICONS || {
  food: '🍜',
  goods: '🧸',
  transport: '🚎',
  lodging: '🏨',
  culture: '🎟️',
  etc: '💬'
};
function normalizeExpenseCategories(...args) {
  const f = (window.GATHER_APP_UTILS || {}).normalizeExpenseCategories;
  return typeof f === 'function' ? f(...args) : undefined;
}
function getExpenseCategories(...args) {
  const f = (window.GATHER_APP_UTILS || {}).getExpenseCategories;
  return typeof f === 'function' ? f(...args) : undefined;
}
function getExpenseCategory(...args) {
  const f = (window.GATHER_APP_UTILS || {}).getExpenseCategory;
  return typeof f === 'function' ? f(...args) : undefined;
}
function getExpenseCategoryIcon(...args) {
  const f = (window.GATHER_APP_UTILS || {}).getExpenseCategoryIcon;
  return typeof f === 'function' ? f(...args) : undefined;
}
function getExpenseCategoryLabel(...args) {
  const f = (window.GATHER_APP_UTILS || {}).getExpenseCategoryLabel;
  return typeof f === 'function' ? f(...args) : undefined;
}
function extractExpenseTimePrefix(...args) {
  const f = (window.GATHER_APP_UTILS || {}).extractExpenseTimePrefix;
  return typeof f === 'function' ? f(...args) : undefined;
}
// Income entries are saved with categoryId 'etc' as a placeholder -- they don't have a real
// spending category (see handleSaveExpenseClick), so any UI that badges an expense by resolving
// getExpenseCategory(calendar, expense.categoryId) straight off the stored id will show income as
// a plain "기타" expense unless it explicitly checks isExpenseIncomeEntry first and swaps in this
// instead. Centralized here (rather than each screen redefining its own isIncome/INCOME_CATEGORY
// pair) after a DateModal 회비정산 row was found still doing the raw lookup while every other
// settlement surface (AdminDashboard's SettlementPage, the global search index) had already been
// fixed to check for income -- same fix skipped in one more place is the same bug again.
const INCOME_EXPENSE_CATEGORY = GATHER_APP_UTILS.INCOME_EXPENSE_CATEGORY || { id: 'income', name: '수입', color: '#16A34A' };
const isExpenseIncomeEntry = GATHER_APP_UTILS.isExpenseIncomeEntry || function isExpenseIncomeEntry(expense) {
  return expense?.type === 'income' || Number(expense?.amount) < 0;
};
const getDisplayExpenseCategory = GATHER_APP_UTILS.getDisplayExpenseCategory || function getDisplayExpenseCategory(calendar, expense) {
  const resolved = isExpenseIncomeEntry(expense) ? INCOME_EXPENSE_CATEGORY : getExpenseCategory(calendar, expense?.categoryId);
  return resolved && resolved.name ? resolved : { id: 'etc', name: '기타', color: '#64748B' };
};
const clampNumber = GATHER_APP_UTILS.clampNumber || function clampNumber(value, min, max) {
  const n = Number(value);
  if (!Number.isFinite(n)) return min;
  return Math.min(max, Math.max(min, n));
};
const pad2 = GATHER_APP_UTILS.pad2 || function pad2(value) {
  return String(value).padStart(2, '0');
};
const isDataUrl = GATHER_APP_UTILS.isDataUrl || function isDataUrl(value) {
  return typeof value === 'string' && value.startsWith('data:');
};
const isHttpUrl = GATHER_APP_UTILS.isHttpUrl || function isHttpUrl(value) {
  return typeof value === 'string' && /^https?:\/\//i.test(value);
};

// 장소(Places) categories -- from GATHER_APP_UTILS (step 15b) with local fallbacks.
const DEFAULT_PLACE_CATEGORIES = GATHER_APP_UTILS.DEFAULT_PLACE_CATEGORIES || [
  { id: 'restaurant', name: '식당', color: '#F97316' },
  { id: 'cafe', name: '카페', color: '#8B5CF6' },
  { id: 'play', name: '놀이', color: '#3B82F6' },
  { id: 'lodging', name: '숙박', color: '#10B981' },
  { id: 'shopping', name: '쇼핑', color: '#EC4899' },
  { id: 'etc', name: '기타', color: '#64748B' }
];
const PLACE_CATEGORY_ICONS = GATHER_APP_UTILS.PLACE_CATEGORY_ICONS || { restaurant: '🍽️', cafe: '☕', play: '🎡', lodging: '🏨', shopping: '🛍️', etc: '💬' };
const normalizePlaceCategories = GATHER_APP_UTILS.normalizePlaceCategories || function normalizePlaceCategories(categories) {
  const defaultCategories = DEFAULT_PLACE_CATEGORIES;
  const source = Array.isArray(categories) && categories.length ? categories : defaultCategories;
  const seen = new Set();
  const normalized = source.map((category, index) => {
    const fallback = defaultCategories[index % defaultCategories.length];
    const rawId = sanitizeText(category?.id || category?.name || fallback.id, 40).toLowerCase().replace(/[^a-z0-9가-힣_-]/g, '') || fallback.id;
    const id = seen.has(rawId) ? `${rawId}_${index}` : rawId;
    seen.add(id);
    return {
      id,
      name: sanitizeText(category?.name || fallback.name, 24) || fallback.name,
      color: normalizeColorValue(category?.color, fallback.color)
    };
  }).filter(category => category.name);
  return normalized.length ? normalized : defaultCategories;
};
const getPlaceCategories = GATHER_APP_UTILS.getPlaceCategories || function getPlaceCategories(calendar) {
  return normalizePlaceCategories(calendar?.placeCategories);
};
const getPlaceCategoryById = GATHER_APP_UTILS.getPlaceCategoryById || function getPlaceCategoryById(calendar, categoryId) {
  const categories = getPlaceCategories(calendar);
  const id = String(categoryId || '').trim();
  const found = id ? categories.find(c => c && c.id === id) : null;
  if (found) return found;
  return categories.find(c => c && c.id === 'etc') || { id: 'etc', name: '기타', color: '#64748B' };
};
const getPlaceCategoryIcon = GATHER_APP_UTILS.getPlaceCategoryIcon || function getPlaceCategoryIcon(category) {
  if (!category) return PLACE_CATEGORY_ICONS.etc;
  const name = String(category.name || '');
  let hasEmoji = false;
  try { hasEmoji = /\p{Extended_Pictographic}/u.test(name); } catch (e) { hasEmoji = false; }
  if (hasEmoji) return '';
  const id = String(category.id || '').toLowerCase();
  if (PLACE_CATEGORY_ICONS[id]) return PLACE_CATEGORY_ICONS[id];
  const matchedDefault = DEFAULT_PLACE_CATEGORIES.find(item => item.name === name);
  return matchedDefault ? PLACE_CATEGORY_ICONS[matchedDefault.id] : PLACE_CATEGORY_ICONS.etc;
};
const getPlaceCategoryLabel = GATHER_APP_UTILS.getPlaceCategoryLabel || function getPlaceCategoryLabel(category) {
  const name = sanitizeText(category?.name || '기타', 24) || '기타';
  const icon = getPlaceCategoryIcon(category);
  return icon ? icon + '\u00a0\u00a0' + name : name;
};

const KOREA_BBOX = GATHER_APP_UTILS.KOREA_BBOX || { minLat: 33, maxLat: 39, minLng: 124, maxLng: 132 };
const isDomesticLatLng = GATHER_APP_UTILS.isDomesticLatLng || function isDomesticLatLng(lat, lng) {
  return Number(lat) >= KOREA_BBOX.minLat && Number(lat) <= KOREA_BBOX.maxLat && Number(lng) >= KOREA_BBOX.minLng && Number(lng) <= KOREA_BBOX.maxLng;
};
const normalizePlaceAddressForSave = GATHER_APP_UTILS.normalizePlaceAddressForSave || function normalizePlaceAddressForSave(address) {
  return String(address || '').trim();
};
const getDisplayPlaceAddress = GATHER_APP_UTILS.getDisplayPlaceAddress || function getDisplayPlaceAddress(place) {
  return normalizePlaceAddressForSave(place && place.address || '', place && place.lat, place && place.lng);
};

// A calendar's registered places: { id, name, address, lat, lng, categoryId, memo, visitStatus,
// visitDate, createdAt, updatedAt }. lat/lng is the only thing the map actually needs --
// name/address exist so a pin found via 업체명 검색(Kakao Local/Nominatim) still shows something
// meaningful, but a place can also be dropped by raw coordinates with no name/address at all.
// visitStatus distinguishes an already-visited place from one that's only planned; visitDate is
// only meaningful (and only ever shown) when visitStatus is 'visited'.
function normalizePlaces(places) {
  return (Array.isArray(places) ? places : [])
    .filter(place => place && Number.isFinite(Number(place.lat)) && Number.isFinite(Number(place.lng)))
    .map(place => ({
      id: sanitizeText(place.id || '', 80) || `place_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      name: sanitizeText(place.name || '', 80),
      alias: sanitizeText(place.alias || '', 80),
      // 표시·저장 포맷 통일. 병합 키로 쓰지 않음(id만).
      address: normalizePlaceAddressForSave(place.address || '', place.lat, place.lng),
      lat: Number(place.lat),
      lng: Number(place.lng),
      categoryId: sanitizeText(place.categoryId || 'etc', 40),
      memo: sanitizeText(place.memo || '', 2000),
      visitStatus: place.visitStatus === 'planned' ? 'planned' : 'visited',
      visitDate: isValidDateString(place.visitDate) ? place.visitDate : '',
      createdAt: Number(place.createdAt) || Date.now(),
      updatedAt: Number(place.updatedAt) || Number(place.createdAt) || Date.now()
    }));
}
function getCalendarPlaces(calendar) {
  return normalizePlaces(calendar?.places);
}
// Unions the calendar document's own embedded places (legacy entries, and anything not yet
// backfilled into the subcollection) with places fetched from the places subcollection -- same
// reasoning as unionActivityLogs, since a places array built as just
// { ...calendar, places: subcollectionPlaces } would silently drop pre-migration entries.
function unionPlaces(calendar, subcollectionPlaces) {
  const byId = new Map();
  getCalendarPlaces(calendar).forEach(p => { if (p?.id) byId.set(p.id, p); });
  (Array.isArray(subcollectionPlaces) ? subcollectionPlaces : []).forEach(p => { if (p?.id) byId.set(p.id, p); });
  return Array.from(byId.values());
}

// Bulk-imported places (e.g. from a Google My Maps export) often carry their whole visit history
// jammed into one memo string, one "YY.MM.DD 누구랑 뭐했는지" entry per line, joined with " / ".
// These helpers pull that history back out at render time rather than storing it as a separate
// structured field -- memo stays the single source of truth, and a memo that was never
// multi-entry in the first place (no leading date, or just one) renders exactly as typed.
//
// Dates are recognized in any of YY.MM.DD / YYYY.MM.DD / YY-MM-DD / YYYY-MM-DD (2 or 4 digit
// year, "." or "-" separator) since real memos in the wild mix all of these -- the match is
// always normalized back to the canonical 'YY.MM.DD' shape below so every other place-date
// helper (normalizePlaceDateForSort, formatPlaceBadgeDate, the sort comparator in PlacesView)
// keeps working against the one shape they already expect, without having to touch them.
const MEMO_DATE_RE = GATHER_APP_UTILS.MEMO_DATE_RE || /(\d{4}|\d{2})[.\-](\d{2})[.\-](\d{2})/;
const normalizeMemoDateMatch = GATHER_APP_UTILS.normalizeMemoDateMatch || function normalizeMemoDateMatch(match) {
  if (!match) return null;
  let [, y, m, d] = match;
  const mm = Number(m), dd = Number(d);
  if (mm < 1 || mm > 12 || dd < 1 || dd > 31) return null;
  if (y.length === 4) y = y.slice(2);
  return `${y}.${m}.${d}`;
};
const extractLeadingMemoDate = GATHER_APP_UTILS.extractLeadingMemoDate || function extractLeadingMemoDate(memo) {
  return normalizeMemoDateMatch(String(memo || "").match(MEMO_DATE_RE));
};
const parseVisitEntriesFromMemo = GATHER_APP_UTILS.parseVisitEntriesFromMemo || function parseVisitEntriesFromMemo(memo) {
  const text = String(memo || "").trim();
  if (!text) return [];
  const dateMatches = [...text.matchAll(new RegExp(MEMO_DATE_RE, "g"))].filter(m => normalizeMemoDateMatch(m));
  if (dateMatches.length < 2) return [];
  return dateMatches.map((match, idx) => {
    const segmentEnd = idx + 1 < dateMatches.length ? dateMatches[idx + 1].index : text.length;
    const note = text.slice(match.index + match[0].length, segmentEnd).trim().replace(/^\/\s*/, "").replace(/\s*\/\s*$/, "");
    return { date: normalizeMemoDateMatch(match), note };
  });
};
const reformatMemoIntoDateLines = GATHER_APP_UTILS.reformatMemoIntoDateLines || function reformatMemoIntoDateLines(memo) {
  const entries = parseVisitEntriesFromMemo(memo);
  if (entries.length === 0) return String(memo || "");
  return entries.map(entry => (entry.note ? `${entry.date} ${entry.note}` : entry.date)).join("\n");
};
const sortVisitEntriesRecentFirst = GATHER_APP_UTILS.sortVisitEntriesRecentFirst || function sortVisitEntriesRecentFirst(entries) {
  return (entries || []).slice().sort((a, b) => {
    const dateA = normalizePlaceDateForSort(a.date) || "";
    const dateB = normalizePlaceDateForSort(b.date) || "";
    return dateB.localeCompare(dateA);
  });
};

const KNOWN_PLACE_PARTICIPANT_NAME_TAGS = [
  '영우', '유리', '서준', '광석', '수진', '아윤', '현석', '효진',
  '장용', '희경', '리아', '지아', '꽃잎반', '엄마', '만식', '도은', '은혜'
];
function getKnownPlaceParticipantNames(calendar) {
  const fromParticipants = getActiveParticipants(calendar).map(p => {
    const name = String(p?.name || '').trim();
    return name.length > 2 ? name.slice(1) : name;
  });
  return Array.from(new Set([...fromParticipants, ...KNOWN_PLACE_PARTICIPANT_NAME_TAGS].filter(Boolean)));
}
// A bare "OO네" token (e.g. "도은네", "채연네", "리아아빠네") reads as "so-and-so's household" in
// every real memo that uses this shape -- checked against all 75 production place memos, every
// token ending in 네 across the whole set is a household reference with zero false positives, so
// this doesn't need the explicit KNOWN_PLACE_PARTICIPANT_NAME_TAGS whitelist the way an exact name
// match does. Capped at a 5-syllable root so it still can't accidentally swallow an unrelated
// sentence that happens to end in the same syllable.
function isHouseholdNameToken(token) {
  return /^[가-힣]{1,5}네$/.test(token);
}
// Tokenizes the whole memo (not just parsed visit-entry notes, since a name can sit in its own
// "/"-separated chunk with no date at all -- see 꽃잎반 above) and keeps only tokens that exactly
// match a known name (or look like a "OO네" household reference), so an unrelated word that
// happens to contain a name as a substring (or a name fused into a parenthetical aside like
// "(현석불참)") is never mistaken for a tag.
function extractKnownParticipantNames(memo, knownNames) {
  const text = String(memo || '');
  if (!text) return [];
  const knownSet = new Set(knownNames || []);
  const seen = new Set();
  const result = [];
  text.split(/[\s/,()·-]+/).forEach(token => {
    const trimmed = token.trim();
    if (!trimmed || seen.has(trimmed)) return;
    if (knownSet.has(trimmed) || isHouseholdNameToken(trimmed)) {
      seen.add(trimmed);
      result.push(trimmed);
    }
  });
  return result;
}

// Normalizes either date shape a place can carry -- the structured 'YYYY-MM-DD' visitDate field,
// or a memo-embedded 'YY.MM.DD' -- into a single comparable 'YYYY-MM-DD' string so the list can
// be sorted by actual visit recency regardless of which source the date came from.
const normalizePlaceDateForSort = GATHER_APP_UTILS.normalizePlaceDateForSort || function normalizePlaceDateForSort(dateStr) {
  if (!dateStr) return null;
  if (isValidDateString(dateStr)) return dateStr;
  const match = String(dateStr).match(/^(\d{2})\.(\d{2})\.(\d{2})$/);
  return match ? `20${match[1]}-${match[2]}-${match[3]}` : null;
};
const formatPlaceBadgeDate = GATHER_APP_UTILS.formatPlaceBadgeDate || function formatPlaceBadgeDate(dateStr) {
  const normalized = normalizePlaceDateForSort(dateStr);
  return normalized ? formatShortDateWithDayName(normalized) : null;
};

function getPlaceSortDateKey(place) {
  const structured = normalizePlaceDateForSort(place && place.visitDate);
  if (structured) return structured;
  const entries = parseVisitEntriesFromMemo(place && place.memo);
  if (entries.length > 0) {
    const latest = normalizePlaceDateForSort(entries[entries.length - 1].date);
    if (latest) return latest;
  }
  return normalizePlaceDateForSort(extractLeadingMemoDate(place && place.memo));
}


// Naver Map's keyword-search deep link (map.naver.com/p/search/{query}) -- the same experience
// as typing into the Naver Map search box, which drops straight into the real place entry page
// (photos/reviews/clips) when there's a strong match. This deliberately replaces an earlier
// "p?title=&lat=&lng=" coordinate-pin version: that format turned out to just quietly ignore the
// given lat/lng and fall back to a title-only search anyway (confirmed against production data,
// which also surfaced a separate stored-coordinate/address mismatch on at least one place -- the
// coordinate itself needs a look, tracked separately from this URL-format fix), so it bought no
// real accuracy over a plain search while showing only a small map-preview popup instead of the
// actual entry page the search flow reaches. Anchoring the query with the address's 구/군/시
// (getNaverMapSearchRegionHint) trades a little of the "can't land on the wrong chain branch"
// protection a bare coordinate would have given for actually reaching the right page most of the
// time. Business-name search itself still stays on Kakao Local (see
// PlaceRegisterModal.handleSearch) -- only where the user is sent to view the map on the place
// card uses Naver.
// Only the 구/군/시 (기초자치단체) token right after the 시/도 prefix -- e.g. "구로구" out of
// "대한민국 서울특별시 구로구 고척동 316-9". Deliberately doesn't also try to grab the following
// 동/읍/면 -- "시" ambiguously suffixes both a 시/도 ("서울특별시") and a 기초자치단체 ("파주시"),
// and there's no reliable way to tell those apart with a suffix-only pattern, so a single regex
// spanning both levels mismatched on real production data (returned "서울특별시" alone, swallowing
// "구로구" entirely). Stripping the 시/도 prefix as its own explicit step first removes that
// ambiguity, at the cost of not reaching down to the 동/읍/면 level.
function getNaverMapSearchRegionHint(...args) {
  const f = (window.GATHER_APP_UTILS || {}).getNaverMapSearchRegionHint;
  return typeof f === 'function' ? f(...args) : undefined;
}
function getNaverMapPlaceUrl(...args) {
  const f = (window.GATHER_APP_UTILS || {}).getNaverMapPlaceUrl;
  return typeof f === 'function' ? f(...args) : undefined;
}
function getGoogleMapPlaceUrl(...args) {
  const f = (window.GATHER_APP_UTILS || {}).getGoogleMapPlaceUrl;
  return typeof f === 'function' ? f(...args) : undefined;
}
function getPlaceExternalMapUrl(...args) {
  const f = (window.GATHER_APP_UTILS || {}).getPlaceExternalMapUrl;
  return typeof f === 'function' ? f(...args) : undefined;
}
const GATHER_APP_CONFIG = window.GATHER_APP_CONFIG || {};
const readConfigNumber = (key, fallback) => Number.isFinite(GATHER_APP_CONFIG[key]) ? GATHER_APP_CONFIG[key] : fallback;
const readConfigObject = (key, fallback) => GATHER_APP_CONFIG[key] && typeof GATHER_APP_CONFIG[key] === 'object' ? GATHER_APP_CONFIG[key] : fallback;
const ENABLE_FIRESTORE_SYNC = GATHER_APP_CONFIG.ENABLE_FIRESTORE_SYNC !== false; // Firestore is the only production source of truth.
const ENABLE_FIRESTORE_WRITES = GATHER_APP_CONFIG.ENABLE_FIRESTORE_WRITES !== false;
// Off by default until firestore.rules' places/confirmedMeetings subcollection rules are actually
// deployed (`firebase deploy --only firestore:rules`) -- flip to true in assets/app-config.js only
// after confirming that deploy, never before. While off, places/confirmedMeeting keep working
// exactly as they always have (embedded on the calendar document, read/written as one array) --
// see stripEmbeddedPlacesField/stripEmbeddedConfirmedMeetingField's call sites in
// pushSingleCloudCalendar/pushSingleCalendarWithRest. The read-side union (unionPlaces/
// unionConfirmedMeetings, feeding activeCal) stays active either way since it's a safe no-op
// while the subcollections are empty.
const ENABLE_PLACES_SUBCOLLECTION_MIGRATION = GATHER_APP_CONFIG.ENABLE_PLACES_SUBCOLLECTION_MIGRATION === true;
const PUBLIC_CALENDAR_IDS = Array.isArray(GATHER_APP_CONFIG.PUBLIC_CALENDAR_IDS) ? GATHER_APP_CONFIG.PUBLIC_CALENDAR_IDS : ['kkot', 'cw', 'jhair'];
const FIREBASE_LOAD_TIMEOUT_MS = readConfigNumber('FIREBASE_LOAD_TIMEOUT_MS', 10000);
const FIREBASE_LOAD_MAX_ATTEMPTS = readConfigNumber('FIREBASE_LOAD_MAX_ATTEMPTS', 3);
// Memos load newest-first in pages of this size instead of the whole collection at once, so a
// calendar with thousands of memos doesn't download/subscribe to all of them on every open.
// Pinned memos are fetched separately and unbounded (pinning is a deliberate, self-limiting
// action) so an old pinned memo never silently falls out of view as later pages load.
const MEMOS_PAGE_SIZE = readConfigNumber('MEMOS_PAGE_SIZE', 30);
const FIRESTORE_FREE_LIMITS = readConfigObject('FIRESTORE_FREE_LIMITS', {
  storageBytes: 1024 * 1024 * 1024,
  documentBytes: 1024 * 1024,
  readsPerDay: 50000,
  writesPerDay: 20000,
  deletesPerDay: 20000,
  outboundBytesPerMonth: 10 * 1024 * 1024 * 1024
});
const GITHUB_PAGES_FREE_LIMITS = readConfigObject('GITHUB_PAGES_FREE_LIMITS', {
  siteBytes: 1024 * 1024 * 1024,
  bandwidthBytesPerMonth: 100 * 1024 * 1024 * 1024,
  buildsPerHour: 10
});
// Chat/memo images normally upload to Firebase Storage (short download URL stored on the
// message/memo document); base64 is only the fallback embedded directly in the document when
// that upload fails (see compressImageToDataUrls/resolveImageUrls). That fallback is always kept
// small -- a live "last N messages" listener re-downloads and re-parses every matching document
// on every page load, so a single oversized embedded image taxes every future visitor's load
// forever, not just the one degraded send.
const MAX_CHAT_THUMB_BASE64_LENGTH = readConfigNumber('MAX_CHAT_THUMB_BASE64_LENGTH', 8000);
const CHAT_LIVE_MESSAGE_LIMIT = readConfigNumber('CHAT_LIVE_MESSAGE_LIMIT', 30);
const ADMIN_MESSAGE_LIVE_LIMIT = readConfigNumber('ADMIN_MESSAGE_LIVE_LIMIT', 50);
const ADMIN_MEMO_LIVE_LIMIT = readConfigNumber('ADMIN_MEMO_LIVE_LIMIT', 50);
if (typeof window !== 'undefined') {
  window.__GATHER_ADMIN_LIMITS = { ADMIN_MESSAGE_LIVE_LIMIT, ADMIN_MEMO_LIVE_LIMIT };
}
const GLOBAL_SEARCH_HISTORY_LIMIT = readConfigNumber('GLOBAL_SEARCH_HISTORY_LIMIT', 100);
const MAX_FIRESTORE_DATA_URL_CHARS = readConfigNumber('MAX_FIRESTORE_DATA_URL_CHARS', 6000);

function sanitizeMessageForFirestore(messageData) {
  if (!messageData || typeof messageData !== 'object') return messageData;
  const out = { ...messageData };
  const tooBig = (v) => typeof v === 'string' && v.startsWith('data:') && v.length > MAX_FIRESTORE_DATA_URL_CHARS;
  if (tooBig(out.imageUrl)) delete out.imageUrl;
  if (tooBig(out.thumbUrl)) delete out.thumbUrl;
  if (Array.isArray(out.imageUrls)) {
    out.imageUrls = out.imageUrls.filter(u => typeof u === 'string' && !tooBig(u));
    if (out.imageUrls.length === 0) delete out.imageUrls;
  }
  if (Array.isArray(out.thumbUrls)) {
    out.thumbUrls = out.thumbUrls.filter(u => typeof u === 'string' && !tooBig(u));
    if (out.thumbUrls.length === 0) delete out.thumbUrls;
  }
  if (out.linkPreview && typeof out.linkPreview === 'object') {
    const lp = { ...out.linkPreview };
    if (typeof lp.description === 'string' && lp.description.length > 280) lp.description = lp.description.slice(0, 280);
    if (typeof lp.title === 'string' && lp.title.length > 120) lp.title = lp.title.slice(0, 120);
    if (typeof lp.html === 'string') delete lp.html;
    if (typeof lp.content === 'string') delete lp.content;
    if (typeof lp.image === 'string' && lp.image.startsWith('data:') && lp.image.length > 2000) delete lp.image;
    out.linkPreview = lp;
  }
  return out;
}
function sanitizeMemoForFirestore(memoData) {
  return sanitizeMessageForFirestore(memoData);
}

function slimMessageForClient(message) {
  if (!message || typeof message !== 'object') return message;
  const out = { ...message };
  // NEVER drop imageUrl/thumbUrl/imageUrls/thumbUrls.
  // Legacy photos are often data:image base64 in Firestore (10KB–200KB+).
  // Stripping them on read hid photos while server data stayed intact.
  if (out.linkPreview && typeof out.linkPreview === 'object') {
    const lp = { ...out.linkPreview };
    if (typeof lp.html === 'string') delete lp.html;
    if (typeof lp.content === 'string') delete lp.content;
    if (typeof lp.description === 'string' && lp.description.length > 280) lp.description = lp.description.slice(0, 280);
    out.linkPreview = lp;
  }
  return out;
}



// A calendar document must stay under Firestore's 1MiB/doc hard limit. Refuse a save before
// it gets there instead of surfacing Firestore's opaque rejection at the boundary. Compared
// against the actual Firestore wire-format size (see estimateCalendarDocWireBytes), not a
// plain JSON.stringify length -- Firestore's typed-value wire format runs ~1.7-1.9x larger
// than plain JSON for this shape (measured against live production data), so comparing a
// plain JSON length against the raw 1,048,576 byte limit would under-count by a wide margin.
const CALENDAR_DOC_SAFE_BYTE_LIMIT = readConfigNumber('CALENDAR_DOC_SAFE_BYTE_LIMIT', 900000); // ~900KB of estimated wire size, ~150KB headroom

// Admin dashboard password gate. Verification and the cross-calendar data it unlocks both go
// through Cloud Functions (adminVerifyPassword / listAllCalendars / adminChangePassword in
// functions/index.js) which check the password server-side via the Admin SDK -- Firestore
// itself no longer grants the client SDK direct list/write access to this data (see
// firestore.rules), so a browser can't get either the calendar list or a way to change the
// admin password without actually passing that check.
const ADMIN_SESSION_STORAGE_KEY = typeof GATHER_APP_CONFIG.ADMIN_SESSION_STORAGE_KEY === 'string' ? GATHER_APP_CONFIG.ADMIN_SESSION_STORAGE_KEY : 'gather_admin_session_v1';
const ADMIN_SESSION_MAX_AGE_MS = readConfigNumber('ADMIN_SESSION_MAX_AGE_MS', 24 * 60 * 60 * 1000); // Re-authenticate at least once a day.

async function sha256Hex(text) {
  const encoded = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest('SHA-256', encoded);
  return Array.from(new Uint8Array(digest)).map(byte => byte.toString(16).padStart(2, '0')).join('');
}

// The session also carries the plaintext password (sessionStorage only -- gone once the tab
// closes) so an already-unlocked tab can call listAllCalendars/adminChangePassword again later
// (e.g. a manual refresh, or an actual password change) without re-prompting. A session created
// before this existed has no `password` field and is treated as invalid by getAdminSession, so
// it falls back to the login screen instead of failing later Cloud Function calls silently.
function getAdminSession() {
  try {
    const raw = sessionStorage.getItem(ADMIN_SESSION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed.authenticatedAt !== 'number' || typeof parsed.password !== 'string') return null;
    if (Date.now() - parsed.authenticatedAt > ADMIN_SESSION_MAX_AGE_MS) return null;
    return parsed;
  } catch (e) {
    return null;
  }
}

function setAdminSession(password) {
  try {
    sessionStorage.setItem(ADMIN_SESSION_STORAGE_KEY, JSON.stringify({ authenticatedAt: Date.now(), password }));
  } catch (e) {
    console.warn('Unable to persist admin session:', e);
  }
}

function clearAdminSession() {
  try {
    sessionStorage.removeItem(ADMIN_SESSION_STORAGE_KEY);
  } catch (e) {
    console.warn('Unable to clear admin session:', e);
  }
}

async function callAdminFunction(name, body) {
  const res = await fetch(`https://us-central1-${firebaseConfig.projectId}.cloudfunctions.net/${name}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  let json = null;
  try {
    json = await res.json();
  } catch (e) {
    // Non-JSON error body (e.g. a 429/500 from Cloud Functions infra itself) -- fall through
    // to the generic message below rather than throwing on the parse failure.
  }
  if (!res.ok) throw new Error(json?.message || `요청이 실패했습니다 (${res.status})`);
  return json;
}

async function verifyAdminPasswordRemote(password) {
  const result = await callAdminFunction('adminVerifyPassword', { password });
  return !!result?.ok;
}

async function listAllCalendarsRemote(password, options = {}) {
  const mode = options.mode === 'full' ? 'full' : 'summary';
  const result = await callAdminFunction('listAllCalendars', { password, mode });
  return { calendars: result?.calendars || [], lastModified: result?.lastModified || 0, mode: result?.mode || mode };
}

async function changeAdminPasswordRemote(oldPassword, newPasswordHash) {
  await callAdminFunction('adminChangePassword', { oldPassword, newPasswordHash });
}

// Copies text to the clipboard, falling back to the legacy execCommand approach when the
// async Clipboard API isn't available (non-secure context, older Safari/Firefox, some
// embedded webviews). Returns whether the copy actually succeeded.
async function copyTextToClipboard(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (e) {
      // fall through to the legacy fallback below
    }
  }
  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(textarea);
    return ok;
  } catch (e) {
    return false;
  }
}

const GATHER_APP_NOTIFICATIONS = window.GATHER_APP_NOTIFICATIONS || {};
function isNotificationSupported(...args) {
  const f = (window.GATHER_APP_NOTIFICATIONS || {}).isNotificationSupported;
  return typeof f === 'function' ? f(...args) : undefined;
}
function requestChatNotificationPermission(...args) {
  const f = (window.GATHER_APP_NOTIFICATIONS || {}).requestChatNotificationPermission;
  return typeof f === 'function' ? f(...args) : undefined;
}
function ensureChatNotificationPermission(...args) {
  const f = (window.GATHER_APP_NOTIFICATIONS || {}).ensureChatNotificationPermission;
  return typeof f === 'function' ? f(...args) : undefined;
}
function getChatNotifyPrefKey(...args) {
  const f = (window.GATHER_APP_NOTIFICATIONS || {}).getChatNotifyPrefKey;
  return typeof f === 'function' ? f(...args) : undefined;
}
function isChatNotifyEnabledForCalendar(...args) {
  const f = (window.GATHER_APP_NOTIFICATIONS || {}).isChatNotifyEnabledForCalendar;
  return typeof f === 'function' ? f(...args) : undefined;
}
function setChatNotifyEnabledForCalendar(...args) {
  const f = (window.GATHER_APP_NOTIFICATIONS || {}).setChatNotifyEnabledForCalendar;
  return typeof f === 'function' ? f(...args) : undefined;
}
function getChatParticipantPrefKey(...args) {
  const f = (window.GATHER_APP_NOTIFICATIONS || {}).getChatParticipantPrefKey;
  return typeof f === 'function' ? f(...args) : undefined;
}
function getStoredChatParticipantId(...args) {
  const f = (window.GATHER_APP_NOTIFICATIONS || {}).getStoredChatParticipantId;
  return typeof f === 'function' ? f(...args) : undefined;
}
function setStoredChatParticipantId(...args) {
  const f = (window.GATHER_APP_NOTIFICATIONS || {}).setStoredChatParticipantId;
  return typeof f === 'function' ? f(...args) : undefined;
}
function describePushSubscribeFailure(...args) {
  const f = (window.GATHER_APP_NOTIFICATIONS || {}).describePushSubscribeFailure;
  return typeof f === 'function' ? f(...args) : undefined;
}
function getNotificationDiagnostics(...args) {
  const f = (window.GATHER_APP_NOTIFICATIONS || {}).getNotificationDiagnostics;
  return typeof f === 'function' ? f(...args) : undefined;
}
function classifyPushSubscribeError(...args) {
  const f = (window.GATHER_APP_NOTIFICATIONS || {}).classifyPushSubscribeError;
  return typeof f === 'function' ? f(...args) : undefined;
}
function getBrowserLabelForNotifications(...args) {
  const f = (window.GATHER_APP_NOTIFICATIONS || {}).getBrowserLabelForNotifications;
  return typeof f === 'function' ? f(...args) : undefined;
}
function getNotificationPermissionHelpSteps(...args) {
  const f = (window.GATHER_APP_NOTIFICATIONS || {}).getNotificationPermissionHelpSteps;
  return typeof f === 'function' ? f(...args) : undefined;
}
function isIOSDevice(...args) {
  const f = (window.GATHER_APP_NOTIFICATIONS || {}).isIOSDevice;
  return typeof f === 'function' ? f(...args) : undefined;
}
function isInstalledStandalonePwa(...args) {
  const f = (window.GATHER_APP_NOTIFICATIONS || {}).isInstalledStandalonePwa;
  return typeof f === 'function' ? f(...args) : undefined;
}
function probeNotificationCapability(...args) {
  const f = (window.GATHER_APP_NOTIFICATIONS || {}).probeNotificationCapability;
  return typeof f === 'function' ? f(...args) : undefined;
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function arrayBufferToBase64(buffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

function getSubscriptionHashId(endpoint) {
  let hash = 0;
  for (let i = 0; i < endpoint.length; i++) {
    hash = (hash << 5) - hash + endpoint.charCodeAt(i);
    hash |= 0;
  }
  return 'sub_' + Math.abs(hash) + '_' + endpoint.slice(-20).replace(/[^a-zA-Z0-9]/g, '');
}

async function subscribeUserToPush(calendarId, activeParticipantId) {
  if (!calendarId) return { ok: false, reason: 'missing-calendar' };
  if (!activeParticipantId) return { ok: false, reason: 'missing-participant' };
  if (typeof window !== 'undefined' && window.isSecureContext === false) {
    return { ok: false, reason: 'insecure-context' };
  }
  if (!isNotificationSupported() || Notification.permission !== 'granted') {
    return { ok: false, reason: 'permission-not-granted' };
  }
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
    return { ok: false, reason: 'service-worker-unsupported' };
  }
  try {
    const registration = await Promise.race([
      navigator.serviceWorker.ready,
      new Promise((_, reject) => setTimeout(() => reject(new Error('service worker ready timeout')), 10000))
    ]);
    if (!registration.pushManager) {
      console.warn('Push manager not supported on this browser');
      return { ok: false, reason: 'push-manager-unsupported' };
    }
    let subscription = await registration.pushManager.getSubscription();
    const publicVapidKey = 'BNk35C4KAQy9JdQJ8uzLuzDAc7zUBCznmPFJc194fcWqEtD3EZTnj03ZCwE_P2SxwVILZnDzHsj2UZxIQ0Q-huU';
    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
      });
    }
    if (firebaseDb) {
      // The caller's own chatParticipantId (the participant actually selected in THIS
      // calendar's chat room), not the app-wide "last selected participant" saved-preference
      // key -- that key isn't calendar-scoped, so a browser that had visited a different
      // calendar most recently would silently register this calendar's push subscription under
      // the WRONG participant (or 'anonymous' if never set yet), breaking the "don't notify the
      // sender" check server-side and making the admin's subscriber list wrong.
      const participantId = activeParticipantId;
      const subId = getSubscriptionHashId(subscription.endpoint);
      await firebaseDb.collection('calendars').doc('cal_' + calendarId).collection('push_subscriptions').doc(subId).set({
        endpoint: subscription.endpoint,
        keys: {
          auth: arrayBufferToBase64(subscription.getKey('auth')),
          p256dh: arrayBufferToBase64(subscription.getKey('p256dh'))
        },
        participantId: participantId,
        createdAt: Date.now(),
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
        updatedAt: Date.now()
      }, { merge: true });
      return { ok: true, subId };
    }
    return { ok: false, reason: 'firestore-unavailable' };
  } catch (err) {
    console.error('Failed to subscribe user to Web Push:', err);
    return { ok: false, reason: classifyPushSubscribeError(err), detail: err?.message || '' };
  }
}

async function subscribeUserToPushWithPermission(calendarId, activeParticipantId) {
  if (!isNotificationSupported()) {
    return { ok: false, reason: 'permission-not-granted' };
  }
  // Mobile browsers (notably Samsung Internet) require the permission prompt to be opened
  // immediately from the user's tap/click. Trying a PushManager subscription first consumes
  // that activation and can leave Notification.permission stuck at "default", so ask first.
  if (Notification.permission !== 'granted') {
    const permission = await ensureChatNotificationPermission();
    if (permission !== 'granted') {
      return { ok: false, reason: 'permission-not-granted', permission };
    }
  }
  return subscribeUserToPush(calendarId, activeParticipantId);
}

async function unsubscribeUserFromPush(calendarId) {
  if (!calendarId) return { ok: false, reason: 'missing-calendar' };
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
    return { ok: false, reason: 'service-worker-unsupported' };
  }
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    if (subscription) {
      const subId = getSubscriptionHashId(subscription.endpoint);
      if (firebaseDb) {
        await firebaseDb.collection('calendars').doc('cal_' + calendarId).collection('push_subscriptions').doc(subId).delete();
      }
      // PushSubscription is origin-wide, not calendar-wide. Calling subscription.unsubscribe()
      // while muting a single calendar invalidates the same endpoint used by every other
      // calendar tab on pyw31337.github.io, leaving stale Firestore subscription docs and
      // breaking notifications elsewhere. Remove only this calendar's registration; the browser
      // endpoint can stay alive and be reused by still-enabled calendars.
      return { ok: true, subId };
    }
    return { ok: true, reason: 'no-browser-subscription' };
  } catch (err) {
    console.error('Failed to unsubscribe from Web Push:', err);
    return { ok: false, reason: err?.message || 'unsubscribe-failed' };
  }
}

function notifyNewChatMessage(calendar, message, participantName) {
  if (!isNotificationSupported() || Notification.permission !== 'granted') return;
  if (!isChatNotifyEnabledForCalendar(calendar?.id)) return;
  try {
    const body = message.text?.trim() || (message.imageUrls?.length || message.imageUrl ? '사진을 보냈습니다' : '');
    new Notification(`${calendar?.title || '모여라 캘린더'} · ${participantName}`, {
      body,
      tag: `chat-${calendar?.id}`,
      icon: message.thumbUrl || message.thumbUrls?.[0] || undefined
    });
  } catch (e) {
    console.warn('Failed to show chat notification:', e);
  }
}

// Local-only meeting reminder: fires when the app happens to be opened on D-day or D-1 of a
// confirmed meeting. There is no server-side push infrastructure in this app, so this can only
// ever notify while the tab is open -- it is not a substitute for a real scheduled push, just a
// best-effort nudge for whenever the user next launches the calendar.
function notifyMeetingReminder(calendar, meeting, whenLabel) {
  // Muting a calendar's chat notifications should suppress this reminder entirely -- both the
  // native Notification AND the in-app toast fallback -- not just the Notification path.
  if (!isChatNotifyEnabledForCalendar(calendar?.id)) return;
  const label = formatConfirmedMeetingLabel(meeting.date);
  const body = `${whenLabel} 모임입니다. ${label}`;
  if (isNotificationSupported() && Notification.permission === 'granted') {
    try {
      new Notification(`${calendar?.title || '모여라 캘린더'} 모임 알림`, {
        body,
        tag: `meeting-reminder-${calendar?.id}-${meeting.date}`
      });
      return;
    } catch (e) {
      console.warn('Failed to show meeting reminder notification:', e);
    }
  }
  return body;
}

// Home screen / desktop shortcut creation. Only Chromium-based browsers (Chrome, Edge, and
// Chromium-based mobile browsers) expose a JS-triggerable native install prompt via
// beforeinstallprompt -- Safari and Firefox have no such API by design and require the user
// to go through their own browser UI manually, so those get step-by-step instructions instead.
// The event itself is captured as early as possible by the pwa-install-capture bootstrap
// script in <head> (see its comment for why a listener down here would be too late) and
// stashed on window.__deferredInstallPrompt -- read fresh at click time below rather than
// cached into a local, since a late-firing event (e.g. after the manifest updates once real
// calendar data loads) still needs to be picked up.

// Registers sw.js, which only caches static assets (icons/manifests) -- never index.html
// itself, since this app deliberately serves its HTML as no-cache (see sw.js for why). Safe to
// register unconditionally: browsers without service worker support simply skip this.
if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(e => console.warn('Service worker registration failed:', e));
  });
}

function detectBrowserForShortcutInstructions(...args) {
  const f = (window.GATHER_APP_UTILS || {}).detectBrowserForShortcutInstructions;
  return typeof f === 'function' ? f(...args) : undefined;
}
function getShortcutInstructions(...args) {
  const f = (window.GATHER_APP_UTILS || {}).getShortcutInstructions;
  return typeof f === 'function' ? f(...args) : undefined;
}
function canUseNativeInstallPrompt(...args) {
  const f = (window.GATHER_APP_UTILS || {}).canUseNativeInstallPrompt;
  return typeof f === 'function' ? f(...args) : undefined;
}
function waitForDeferredInstallPrompt(timeoutMs = 1800) {
  if (window.__deferredInstallPrompt) return Promise.resolve(window.__deferredInstallPrompt);
  return new Promise(resolve => {
    let settled = false;
    const done = promptEvent => {
      if (settled) return;
      settled = true;
      window.removeEventListener('beforeinstallprompt', onPrompt);
      clearTimeout(timer);
      resolve(promptEvent || window.__deferredInstallPrompt || null);
    };
    const onPrompt = e => {
      e.preventDefault();
      window.__deferredInstallPrompt = e;
      done(e);
    };
    const timer = setTimeout(() => done(null), timeoutMs);
    window.addEventListener('beforeinstallprompt', onPrompt, { once: true });
  });
}

async function tryCreateShortcut(notify) {
  const shortcutKind = detectBrowserForShortcutInstructions();
  const deferredInstallPrompt = canUseNativeInstallPrompt(shortcutKind)
    ? await waitForDeferredInstallPrompt()
    : null;
  if (deferredInstallPrompt) {
    try {
      deferredInstallPrompt.prompt();
      const choice = await deferredInstallPrompt.userChoice;
      window.__deferredInstallPrompt = null;
      if (choice?.outcome === 'accepted') {
        if (notify) notify('바로가기가 생성되었습니다!');
        return;
      }
    } catch (e) {
      console.warn('Native install prompt failed:', e);
    }
  }
  const instructions = getShortcutInstructions(shortcutKind);
  if (notify) notify(instructions);
}

function getContrastTextColor(...args) {
  const f = (window.GATHER_APP_UTILS || {}).getContrastTextColor;
  return typeof f === 'function' ? f(...args) : undefined;
}
// Standard Formatter for Korean Date Display: 2026.09.19 (토)
function formatDateWithDayName(...args) {
  const f = (window.GATHER_APP_UTILS || {}).formatDateWithDayName;
  return typeof f === 'function' ? f(...args) : undefined;
}
function formatShortDateWithDayName(...args) {
  const f = (window.GATHER_APP_UTILS || {}).formatShortDateWithDayName;
  return typeof f === 'function' ? f(...args) : undefined;
}
// "[모임확정] 26.08.08 (토)" -- the confirmed-meeting banner's fixed text format.
function formatConfirmedMeetingLabel(...args) {
  const f = (window.GATHER_APP_UTILS || {}).formatConfirmedMeetingLabel;
  return typeof f === 'function' ? f(...args) : undefined;
}
// D-day label for the confirmed-meeting banner -- 'D-DAY' for today, 'D-N' for N days out.
// Confirmed-meeting banners never show past dates (see visibleConfirmedMeetings' >= today
// filter), so there's no D+N case to handle here.
function formatDDayLabel(...args) {
  const f = (window.GATHER_APP_UTILS || {}).formatDDayLabel;
  return typeof f === 'function' ? f(...args) : undefined;
}
// calendar.confirmedMeeting supports multiple confirmed dates as an array of
// {date, note, confirmedAt}, but earlier data (and any calendar saved before this
// change) may still carry a single {date, note, confirmedAt} object -- normalize
// both shapes to an array everywhere the field is read.
function getConfirmedMeetings(calendar) {
  const cm = calendar?.confirmedMeeting;
  if (!cm) return [];
  return (Array.isArray(cm) ? cm : [cm]).filter(m => m && m.date);
}
// Unions the calendar document's own embedded confirmedMeeting entries (legacy, not-yet-migrated)
// with entries fetched from the confirmedMeetings subcollection -- same reasoning as
// unionActivityLogs/unionPlaces. Keyed by `date` (already the unique key this whole feature uses)
// rather than a generated id.
function unionConfirmedMeetings(calendar, subcollectionMeetings) {
  const byDate = new Map();
  getConfirmedMeetings(calendar).forEach(m => { if (m?.date) byDate.set(m.date, m); });
  (Array.isArray(subcollectionMeetings) ? subcollectionMeetings : []).forEach(m => { if (m?.date) byDate.set(m.date, m); });
  return Array.from(byDate.values());
}

// An entry can exist purely to hold 회비 정산 (settlement) data for a date that was never
// actually confirmed as a meeting (confirmed === false, written by handleSaveExpense when a
// user logs income/expenses on a date with no confirmedMeeting entry yet). Callers that mean
// "was this date actually confirmed" (badges, reminders, ICS export, stats, summary lists) must
// filter those out with this helper; callers that just want settlement data regardless of
// confirmation status (SettlementSummaryModal, DateModal's own expense list) should keep using
// the raw getConfirmedMeetings list. Entries with no confirmed field at all (all pre-existing
// data) are treated as confirmed for backward compatibility.
function getTrulyConfirmedMeetings(calendar) {
  return getConfirmedMeetings(calendar).filter(m => m.confirmed !== false);
}

function isDateConfirmedMeeting(calendar, dateStr) {
  return getTrulyConfirmedMeetings(calendar).some(m => m.date === dateStr);
}

function calculateSettlementBalance(calendar) {
  if (!calendar) return 0;
  const baseBudget = Number.isFinite(Number(calendar.settlementBaseBudget))
    ? Math.max(0, Math.round(Number(calendar.settlementBaseBudget)))
    : 0;
  const confirmed = getConfirmedMeetings(calendar);
  let incomeTotal = 0;
  let expenseTotal = 0;
  
  confirmed.forEach(meeting => {
    const expenses = Array.isArray(meeting.expenses) ? meeting.expenses : [];
    expenses.forEach(exp => {
      const amount = Number(exp.amount || 0);
      if (Number.isFinite(amount) && amount !== 0) {
        const isIncome = isExpenseIncomeEntry(exp);
        if (isIncome) {
          incomeTotal += Math.abs(amount);
        } else {
          expenseTotal += Math.abs(amount);
        }
      }
    });
  });
  return baseBudget + incomeTotal - expenseTotal;
}

function formatBalanceBadge(balance) {
  if (balance === 0) {
    return {
      text: '0',
      bgColor: '#64748B' // gray
    };
  }
  const sign = balance > 0 ? '+' : '-';
  const absBalance = Math.abs(balance);
  const units = Math.floor(absBalance / 10000);
  if (units === 0) {
    return {
      text: '0',
      bgColor: '#64748B' // gray
    };
  }
  return {
    text: `${sign}${units}만`,
    bgColor: balance > 0 ? '#10B981' : '#EF4444' // green vs red
  };
}

// pinnedNotices is the array form; pinnedNotice (singular) is kept readable here only so a
// calendar saved by the earlier single-notice version of this feature still displays instead
// of silently vanishing once this ships.
function getPinnedNotices(calendar) {
  if (Array.isArray(calendar?.pinnedNotices)) return calendar.pinnedNotices.filter(n => n && n.id && n.text);
  if (calendar?.pinnedNotice && calendar.pinnedNotice.text) {
    return [{ id: `legacy_${calendar.id}`, text: calendar.pinnedNotice.text, setAt: calendar.pinnedNotice.setAt, setBy: calendar.pinnedNotice.setBy }];
  }
  return [];
}

// The chat room header is cramped for space (back button + title + bell + share icons all
// competing for one row), so strip a trailing "모여라 캘린더" from a calendar's title there --
// it's just the app's own name and is redundant once already inside the app.
function formatChatHeaderTitle(title) {
  return (title || '').replace(/\s*모여라\s*캘린더\s*$/, '').trim() || (title || '');
}

function isValidCalendarId(id) {
  const f = (window.GATHER_APP_UTILS || {}).isValidCalendarId;
  if (typeof f === 'function') return f(id);
  return typeof id === 'string' && id.length > 0 && id.length < 64;
}
function isInternalTestCalendarId(...args) {
  const f = (window.GATHER_APP_UTILS || {}).isInternalTestCalendarId;
  return typeof f === 'function' ? f(...args) : undefined;
}
function isAllowedCalendarId(id) {
  const f = (window.GATHER_APP_UTILS || {}).isAllowedCalendarId;
  if (typeof f === 'function') return f(id);
  return typeof id === 'string' && /^[A-Za-z0-9_-]{1,64}$/.test(id);
}
function sanitizeText(...args) {
  const f = (window.GATHER_APP_UTILS || {}).sanitizeText;
  return typeof f === 'function' ? f(...args) : undefined;
}
function stripUrlEdgePunctuation(...args) {
  const f = (window.GATHER_APP_UTILS || {}).stripUrlEdgePunctuation;
  return typeof f === 'function' ? f(...args) : undefined;
}
// Turns a raw Firestore/Firebase write error into a toast message that hints at *why* it
// failed instead of a bare "실패", since the most common real-world cause here (a
// firestore.rules/storage.rules change that hasn't been deployed yet -- `firebase deploy
// --only firestore:rules`/`--only storage`) is otherwise indistinguishable from a genuine bug
// without opening devtools. Falls back to the given generic label for anything else.
function describeFirebaseWriteError(err, genericLabel) {
  const code = err?.code || '';
  const message = err?.message || '';
  if (code === 'permission-denied' || /insufficient permission/i.test(message)) {
    return `${genericLabel}: 서버 권한 오류 (firestore.rules 배포가 필요할 수 있습니다)`;
  }
  if (code === 'unavailable' || /network/i.test(message)) {
    return `${genericLabel}: 네트워크 오류, 잠시 후 다시 시도해 주세요`;
  }
  return genericLabel;
}

function normalizeColorValue(...args) {
  const f = (window.GATHER_APP_UTILS || {}).normalizeColorValue;
  return typeof f === 'function' ? f(...args) : undefined;
}
function isValidDateString(...args) {
  const f = (window.GATHER_APP_UTILS || {}).isValidDateString;
  return typeof f === 'function' ? f(...args) : undefined;
}
// 공유 URL 규칙: 항상 /share/{calId}/[view]/[itemId]/ 슬래시 경로 (OG 크롤러용)
const parseSharePathFromLocation = GATHER_APP_UTILS.parseSharePathFromLocation
  ? (pathname = window.location.pathname) => GATHER_APP_UTILS.parseSharePathFromLocation(pathname)
  : function parseSharePathFromLocation(pathname = window.location.pathname) {
    const m = String(pathname || '').match(/\/share\/([A-Za-z0-9_-]+)(?:\/([A-Za-z0-9_-]+))?(?:\/([A-Za-z0-9_.-]+))?\/?$/);
    if (!m) return null;
    const calendarId = m[1];
    const seg2 = m[2] || '';
    const seg3 = m[3] || '';
    const viewSet = { chat: 1, memo: 1, places: 1, gallery: 1, settlement: 1 };
    if (!seg2) return { calendarId, view: 'calendar', memoId: null };
    if (viewSet[seg2]) {
      if (seg2 === 'memo' && seg3) return { calendarId, view: 'memo', memoId: seg3 };
      return { calendarId, view: seg2, memoId: null };
    }
    return { calendarId, view: 'calendar', memoId: null };
  };

function getCalendarIdFromURL() {
  const href = window.location.href;
  const urlParams = new URLSearchParams(window.location.search);
  if (isValidCalendarId(urlParams.get('id'))) return urlParams.get('id');
  if (isValidCalendarId(urlParams.get('cal'))) return urlParams.get('cal');
  const share = parseSharePathFromLocation();
  if (share && isValidCalendarId(share.calendarId)) return share.calendarId;
  const shareMatch = window.location.pathname.match(/\/share\/([A-Za-z0-9_-]+)/);
  if (shareMatch && isValidCalendarId(shareMatch[1])) return shareMatch[1];
  const match = href.match(/[?&#/]id=([a-zA-Z0-9_-]+)/);
  if (match && isValidCalendarId(match[1])) return match[1];
  return null;
}

function getRawCalendarIdFromURL() {
  const urlParams = new URLSearchParams(window.location.search);
  const share = parseSharePathFromLocation();
  return urlParams.get('id') || urlParams.get('cal') || (share && share.calendarId) || '';
}

function normalizeCalendarUrlParams() {
  try {
    const url = new URL(window.location.href);
    const id = url.searchParams.get('id') || url.searchParams.get('cal');
    if (id) {
      url.searchParams.delete('id');
      url.searchParams.delete('cal');
      url.searchParams.set('id', id);
    }
    const cleaned = url.pathname + url.search + url.hash;
    const current = window.location.pathname + window.location.search + window.location.hash;
    if (cleaned !== current) {
      window.history.replaceState({}, '', cleaned);
    }
  } catch (e) {}
}


const getAppBaseUrl = GATHER_APP_UTILS.getAppBaseUrl
  ? () => GATHER_APP_UTILS.getAppBaseUrl(window.location)
  : function getAppBaseUrl() {
    let basePath = window.location.pathname.replace(/\/share(?:\/.*)?$/, '/').replace(/\/(?:index\.html)?$/, '/');
    if (!basePath.endsWith('/')) basePath += '/';
    return `${window.location.origin}${basePath}`;
  };

const getCalendarShareUrl = GATHER_APP_UTILS.getCalendarShareUrl
  ? (calendarId) => GATHER_APP_UTILS.getCalendarShareUrl(calendarId, window.location)
  : function getCalendarShareUrl(calendarId) {
    return `${getAppBaseUrl()}share/${encodeURIComponent(calendarId)}/`;
  };

const getViewShareUrl = GATHER_APP_UTILS.getViewShareUrl
  ? (calendarId, view) => GATHER_APP_UTILS.getViewShareUrl(calendarId, view, window.location)
  : function getViewShareUrl(calendarId, view) {
    const base = getCalendarShareUrl(calendarId);
    if (!view || view === 'calendar') return base;
    return `${base}${encodeURIComponent(view)}/`;
  };

const getMemoItemShareUrl = GATHER_APP_UTILS.getMemoItemShareUrl
  ? (calendarId, memoId) => GATHER_APP_UTILS.getMemoItemShareUrl(calendarId, memoId, window.location)
  : function getMemoItemShareUrl(calendarId, memoId) {
    return `${getCalendarShareUrl(calendarId)}memo/${encodeURIComponent(memoId)}/`;
  };

// Builds a per-calendar Web App Manifest at runtime. Static manifest-<id>.json files only
// ever covered kkot/cw (see the pwa-manifest-switch bootstrap script in <head>) -- any
// calendar created since (calendar creation is no longer restricted to those two ids) fell
// back to manifest.json's generic "모여라 캘린더" name, so "Add to Home Screen" installed
// every calendar under the same placeholder label instead of its own title.
//
// Every URL below (id/start_url/scope/icons) must be absolute, not just the icons: a manifest
// served from a blob: URL has no directory of its own to resolve a relative path against, and
// Chrome/Firefox both fail installability outright ("Manifest start URL is not valid") when
// start_url/scope are left relative in a blob-URL manifest -- this is a documented issue
// (see https://github.com/200ok-ch/organice/issues/779), not just a cosmetic one: it silently
// blocks beforeinstallprompt from firing at all, so the install button falls through to the
// manual-instructions fallback even on an otherwise fully installable browser.
function buildDynamicManifest(calendar) {
  const base = getAppBaseUrl();
  const name = calendar.title ? `${calendar.title} 캘린더` : '모여라 캘린더';
  const startUrl = `${base}?id=${calendar.id}`;
  return {
    id: startUrl,
    name,
    short_name: name,
    description: calendar.description || `${name} 참여자들의 일정 조율`,
    start_url: startUrl,
    scope: base,
    display: 'standalone',
    background_color: '#F8FAFC',
    theme_color: '#4F46E5',
    icons: [
      { src: `${base}icons/icon-192.png`, sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: `${base}icons/icon-512.png`, sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: `${base}icons/icon-512-maskable.png`, sizes: '512x512', type: 'image/png', purpose: 'maskable' }
    ]
  };
}

let activeManifestBlobUrl = null;
// Swaps <link rel="manifest"> to a blob: URL generated from this calendar's real title. Safe
// to call repeatedly (e.g. once per calendar switch) -- the previous blob URL is revoked each
// time so this doesn't leak memory over a long-lived tab.
function applyDynamicManifest(calendar) {
  try {
    const manifest = buildDynamicManifest(calendar);
    const blob = new Blob([JSON.stringify(manifest)], { type: 'application/manifest+json' });
    const nextUrl = URL.createObjectURL(blob);
    const link = document.querySelector('link[rel="manifest"]');
    if (link) link.setAttribute('href', nextUrl);
    if (activeManifestBlobUrl) URL.revokeObjectURL(activeManifestBlobUrl);
    activeManifestBlobUrl = nextUrl;
  } catch (e) {
    console.warn('Dynamic manifest generation failed:', e);
  }
}

function formatRegisteredAt(...args) {
  const f = (window.GATHER_APP_UTILS || {}).formatRegisteredAt;
  return typeof f === 'function' ? f(...args) : undefined;
}
function cloneParticipant(...args) {
  const f = (window.GATHER_APP_UTILS || {}).cloneParticipant;
  return typeof f === 'function' ? f(...args) : undefined;
}
function cloneAvailability(...args) {
  const f = (window.GATHER_APP_UTILS || {}).cloneAvailability;
  return typeof f === 'function' ? f(...args) : undefined;
}
function cloneActivityLog(...args) {
  const f = (window.GATHER_APP_UTILS || {}).cloneActivityLog;
  return typeof f === 'function' ? f(...args) : undefined;
}
function clonePoll(...args) {
  const f = (window.GATHER_APP_UTILS || {}).clonePoll;
  return typeof f === 'function' ? f(...args) : undefined;
}
function getItemStamp(...args) {
  const f = (window.GATHER_APP_UTILS || {}).getItemStamp;
  return typeof f === 'function' ? f(...args) : undefined;
}
function isTombstone(...args) {
  const f = (window.GATHER_APP_UTILS || {}).isTombstone;
  return typeof f === 'function' ? f(...args) : undefined;
}
function normalizeParticipantName(calendarId, name) {
  const trimmed = sanitizeText(name, 40);
  if (calendarId === 'kkot' && trimmed === '김료진') return '김효진';
  if (calendarId === 'kkot' && trimmed === '박수진') return '신수진';
  return trimmed;
}

const getActiveParticipants = GATHER_APP_UTILS.getActiveParticipants
  ? GATHER_APP_UTILS.getActiveParticipants
  : function getActiveParticipants(calendar) {
  return Array.isArray(calendar?.participants) ? calendar.participants.filter(p => !isTombstone(p)) : [];
};

const getActiveAvailabilities = GATHER_APP_UTILS.getActiveAvailabilities
  ? GATHER_APP_UTILS.getActiveAvailabilities
  : function getActiveAvailabilities(calendar) {
  return Array.isArray(calendar?.availabilities) ? calendar.availabilities.filter(a => !isTombstone(a)) : [];
};

function getCalendarActivityLogs(calendar) {
  return Array.isArray(calendar?.activityLogs) ? calendar.activityLogs.filter(Boolean) : [];
}

// Unions the calendar document's own embedded activityLogs (legacy entries, and anything not
// yet backfilled into the subcollection) with logs fetched from the activityLogs subcollection.
// A calendar object built as { ...calendar, activityLogs: subcollectionLogs } would otherwise
// silently discard all pre-migration history the first time it's rendered, making every one of
// those untracked entries fall through to buildActivityLogsFromAvailabilities' legacy fallback
// synthesis (which has no concept of "update" and mislabels edits as fresh registrations).
function unionActivityLogs(calendar, subcollectionLogs) {
  const byId = new Map();
  getCalendarActivityLogs(calendar).forEach(log => { if (log?.id) byId.set(log.id, log); });
  (Array.isArray(subcollectionLogs) ? subcollectionLogs : []).forEach(log => { if (log?.id) byId.set(log.id, log); });
  return Array.from(byId.values());
}

const getCalendarPolls = GATHER_APP_UTILS.getCalendarPolls
  ? GATHER_APP_UTILS.getCalendarPolls
  : function getCalendarPolls(calendar) {
  return Array.isArray(calendar?.polls) ? calendar.polls.filter(poll => poll && !isTombstone(poll)) : [];
};

const getActivePollOptions = GATHER_APP_UTILS.getActivePollOptions
  ? GATHER_APP_UTILS.getActivePollOptions
  : function getActivePollOptions(poll) {
  return Array.isArray(poll?.options) ? poll.options.filter(option => option && !isTombstone(option)) : [];
};

function normalizeDeletedActivityLogIds(ids) {
  if (!Array.isArray(ids)) return [];
  return Array.from(new Set(ids.map(id => sanitizeText(id, 160)).filter(Boolean))).slice(0, 5000);
}

function getDeletedActivityLogIds(calendar) {
  return normalizeDeletedActivityLogIds(calendar?.deletedActivityLogIds || []);
}

function mergeDeletedActivityLogIds(...lists) {
  return normalizeDeletedActivityLogIds(lists.flat());
}

function getActivityLogStamp(...args) {
  const f = (window.GATHER_APP_UTILS || {}).getActivityLogStamp;
  return typeof f === 'function' ? f(...args) : undefined;
}
const SCHEDULE_ACTIVITY_ACTIONS = Array.isArray(GATHER_APP_CONSTANTS.SCHEDULE_ACTIVITY_ACTIONS) ? GATHER_APP_CONSTANTS.SCHEDULE_ACTIVITY_ACTIONS : ['create', 'update', 'delete'];
const POLL_ACTIVITY_ACTIONS = Array.isArray(GATHER_APP_CONSTANTS.POLL_ACTIVITY_ACTIONS) ? GATHER_APP_CONSTANTS.POLL_ACTIVITY_ACTIONS : ['poll_create', 'poll_vote', 'poll_cancel'];
// Expense/income entries (회비정산) have no participant selector of their own -- these logs
// carry an empty participantId, same as poll activity logs, so they need the same
// participant-optional treatment in normalizeActivityLog below.
const EXPENSE_ACTIVITY_ACTIONS = Array.isArray(GATHER_APP_CONSTANTS.EXPENSE_ACTIVITY_ACTIONS) ? GATHER_APP_CONSTANTS.EXPENSE_ACTIVITY_ACTIONS : ['expense_create', 'expense_update', 'expense_delete'];
// Photo hashtags (라이트박스 이미지정보 패널) also have no participant selector of their own --
// same participant-optional treatment as expense/poll logs below.
const IMAGE_TAG_ACTIVITY_ACTIONS = Array.isArray(GATHER_APP_CONSTANTS.IMAGE_TAG_ACTIVITY_ACTIONS) ? GATHER_APP_CONSTANTS.IMAGE_TAG_ACTIVITY_ACTIONS : ['tag_add', 'tag_remove'];
const MEETING_ACTIVITY_ACTIONS = Array.isArray(GATHER_APP_CONSTANTS.MEETING_ACTIVITY_ACTIONS) ? GATHER_APP_CONSTANTS.MEETING_ACTIVITY_ACTIONS : ['meeting_confirm', 'meeting_cancel'];
const MEMO_ACTIVITY_ACTIONS = Array.isArray(GATHER_APP_CONSTANTS.MEMO_ACTIVITY_ACTIONS) ? GATHER_APP_CONSTANTS.MEMO_ACTIVITY_ACTIONS : ['memo_create', 'memo_update', 'memo_delete'];
// Places (장소) also have no participant selector of their own -- same participant-optional
// treatment as expense/poll/memo logs below.
const PLACE_ACTIVITY_ACTIONS = Array.isArray(GATHER_APP_CONSTANTS.PLACE_ACTIVITY_ACTIONS) ? GATHER_APP_CONSTANTS.PLACE_ACTIVITY_ACTIONS : ['place_create', 'place_update', 'place_delete'];
const ACTIVITY_ACTIONS = [...SCHEDULE_ACTIVITY_ACTIONS, ...POLL_ACTIVITY_ACTIONS, ...EXPENSE_ACTIVITY_ACTIONS, ...IMAGE_TAG_ACTIVITY_ACTIONS, ...MEETING_ACTIVITY_ACTIONS, ...MEMO_ACTIVITY_ACTIONS, ...PLACE_ACTIVITY_ACTIONS];

function normalizeActivityLog(calendarId, log, participantIds = null, idRedirects = new Map()) {
  if (!log || typeof log !== 'object') return null;
  if (log.calendarId && log.calendarId !== calendarId) return null;
  const participantId = sanitizeText(idRedirects.get(log.participantId) || log.participantId || '', 120);
  const action = ACTIVITY_ACTIONS.includes(log.action) ? log.action : '';
  const isParticipantOptionalAction = POLL_ACTIVITY_ACTIONS.includes(action) || EXPENSE_ACTIVITY_ACTIONS.includes(action) || IMAGE_TAG_ACTIVITY_ACTIONS.includes(action) || MEETING_ACTIVITY_ACTIONS.includes(action) || MEMO_ACTIVITY_ACTIONS.includes(action) || PLACE_ACTIVITY_ACTIONS.includes(action);
  const date = sanitizeText(log.date || '', 20);
  const timestamp = Number(log.timestamp || log.updatedAt || 0) || 0;
  if (!action || !timestamp) return null;
  if (!isParticipantOptionalAction && (!participantId || !date || !isValidDateString(date))) return null;
  if (isParticipantOptionalAction && date && !isValidDateString(date)) return null;
  if (participantIds && participantId && !participantIds.has(participantId)) return null;
  if (participantIds && !isParticipantOptionalAction && !participantIds.has(participantId)) return null;
  const idDatePart = date || 'poll';
  const idParticipantPart = participantId || 'system';
  const id = sanitizeText(log.id || `${calendarId}_${idDatePart}_${idParticipantPart}_${action}_${timestamp}`, 160);
  const note = sanitizeText(log.note || '', 320);
  return {
    id,
    calendarId,
    participantId,
    date,
    action,
    note,
    timestamp
  };
}

function mergeActivityLogs(existingLogs = [], incomingLogs = [], calendarId = '', participantIds = null, idRedirects = new Map()) {
  const map = new Map();
  [...existingLogs, ...incomingLogs].forEach((log) => {
    const normalized = normalizeActivityLog(calendarId || log?.calendarId || '', log, participantIds, idRedirects);
    if (!normalized) return;
    const current = map.get(normalized.id);
    if (!current || getActivityLogStamp(normalized) >= getActivityLogStamp(current)) {
      map.set(normalized.id, normalized);
    }
  });
  return Array.from(map.values()).sort((a, b) => getActivityLogStamp(b) - getActivityLogStamp(a));
}

function buildFieldChangeNote(label, changes, maxLen = 300) {
  const parts = [];
  for (const c of changes) {
    const b = sanitizeText(String(c.before ?? '').trim(), 60) || '-';
    const a = sanitizeText(String(c.after ?? '').trim(), 60) || '-';
    if (b === a) continue;
    parts.push(`${c.key} ${b}→${a}`);
  }
  const head = sanitizeText(label || '', 40);
  if (!parts.length) return head;
  return sanitizeText(head ? `${head} · ${parts.join(' · ')}` : parts.join(' · '), maxLen);
}

function createActivityLog(calendarId, action, dateStr, participantId, timestamp = Date.now(), note = '') {
  return normalizeActivityLog(calendarId, {
    id: `${calendarId}_${dateStr}_${participantId}_${action}_${timestamp}_${Math.random().toString(36).slice(2, 8)}`,
    calendarId,
    participantId,
    date: dateStr,
    action,
    note,
    timestamp
  });
}

function createPollActivityLog(calendarId, action, participantId = '', timestamp = Date.now(), note = '') {
  if (!POLL_ACTIVITY_ACTIONS.includes(action)) return null;
  const participantPart = sanitizeText(participantId || 'system', 120);
  return normalizeActivityLog(calendarId, {
    id: `${calendarId}_poll_${participantPart}_${action}_${timestamp}_${Math.random().toString(36).slice(2, 8)}`,
    calendarId,
    participantId: sanitizeText(participantId || '', 120),
    action,
    note,
    timestamp
  });
}

function extractFirstUrlInfo(...args) {
  const f = (window.GATHER_APP_UTILS || {}).extractFirstUrlInfo;
  return typeof f === 'function' ? f(...args) : undefined;
}
function extractFirstUrl(...args) {
  const f = (window.GATHER_APP_UTILS || {}).extractFirstUrl;
  return typeof f === 'function' ? f(...args) : undefined;
}
function removeFirstUrl(...args) {
  const f = (window.GATHER_APP_UTILS || {}).removeFirstUrl;
  return typeof f === 'function' ? f(...args) : undefined;
}
// Shared "URL 뱃지" renderer: splits free text into its plain-text portion plus a clickable
// gray capsule badge for the first URL found (matches the existing memo/expense/availability
// badge styling elsewhere in the app). Returns a plain string when there's no URL so callers
// that don't need JSX (titles, etc.) can still use it directly.
// Grows a <textarea> to fit its content as the user types, instead of showing an inner scrollbar
// inside a fixed-height box. Resets to 'auto' first so shrinking text (e.g. deleting a pasted
// paragraph) shrinks the box back down too, not just grows it. maxHeight keeps a very long paste
// from pushing the rest of the form off-screen -- past that point it scrolls internally as before.
function autoGrowTextarea(el, maxHeight = 480) {
  if (!el) return;
  el.style.overflow = 'hidden';
  el.style.height = 'auto';
  const next = Math.min(maxHeight, Math.max(el.scrollHeight, el.offsetHeight || 0));
  el.style.height = `${next}px`;
}

// 입력필드 규칙: 멀티라인 텍스트는 값(로드/입력/붙여넣기)에 맞춰 세로로 자동 확장
function ResizableModalContainer(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.ResizableModalContainer;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function AutoGrowTextarea(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.AutoGrowTextarea;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function FormAddEditActionButtons(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.FormAddEditActionButtons;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function SegmentedToggle(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.SegmentedToggle;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function ItemEditDeleteActions(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.ItemEditDeleteActions;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function GamifiedConfirmButtonContent(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.GamifiedConfirmButtonContent;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function LinkPreviewCard(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.LinkPreviewCard;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function LinkPreviewProgressOverlay(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.LinkPreviewProgressOverlay;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function DeleteConfirmModal(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.DeleteConfirmModal;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function AdminLoginGate(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.AdminLoginGate;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function DonutChart(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.DonutChart;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function ColorSwatchPicker(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.ColorSwatchPicker;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function StickyVideoBox(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.StickyVideoBox;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function PollVoterSheet(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.PollVoterSheet;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function OperationProgressOverlay(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.OperationProgressOverlay;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function ToggleSwitch(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.ToggleSwitch;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function Footer(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.Footer;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}

function SearchResultLogRow(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.SearchResultLogRow;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function TikTokEmbedWidget(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.TikTokEmbedWidget;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function UrlCapsuleBadge(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.UrlCapsuleBadge;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function ParticipantPickerButton(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.ParticipantPickerButton;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function DateCapsuleBadge(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.DateCapsuleBadge;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}




// 입력필드 표시 규칙: 일반 텍스트 / YY.MM.DD 날짜 / URL 분리
function tokenizeRichFieldText(text) {
  const source = String(text || '');
  if (!source.trim()) return [];
  const urlRe = /https?:\/\/[^\s<>"'\]]+/gi;
  const chunks = [];
  let last = 0;
  let match;
  while ((match = urlRe.exec(source)) !== null) {
    if (match.index > last) chunks.push({ type: 'raw', value: source.slice(last, match.index) });
    let href = match[0].replace(/[.,);\]\}]+$/g, '');
    chunks.push({ type: 'url', value: href });
    last = match.index + match[0].length;
  }
  if (last < source.length) chunks.push({ type: 'raw', value: source.slice(last) });
  if (chunks.length === 0) chunks.push({ type: 'raw', value: source });

  const tokens = [];
  chunks.forEach(chunk => {
    if (chunk.type === 'url') { tokens.push(chunk); return; }
    const s = chunk.value;
    const dateRe = /(\d{2,4}[./-]\d{1,2}[./-]\d{1,2})/g;
    let dLast = 0, dm;
    while ((dm = dateRe.exec(s)) !== null) {
      if (dm.index > dLast) {
        const piece = s.slice(dLast, dm.index);
        if (piece) tokens.push({ type: 'text', value: piece });
      }
      tokens.push({ type: 'date', value: dm[1] || dm[0] });
      dLast = dm.index + dm[0].length;
    }
    if (dLast < s.length) {
      const piece = s.slice(dLast);
      if (piece) tokens.push({ type: 'text', value: piece });
    }
  });
  return tokens;
}

function renderTextWithUrlBadge(text, options = null) {
  const tokens = tokenizeRichFieldText(text);
  if (tokens.length === 0) return null;
  const stackUrl = !options || options.stackUrl !== false;
  const textRow = [];
  const urlRow = [];
  tokens.forEach((tok, idx) => {
    if (tok.type === 'url') {
      urlRow.push(/*#__PURE__*/React.createElement(UrlCapsuleBadge, {
        key: `u-${idx}-${tok.value}`,
        url: tok.value,
        style: stackUrl ? { alignSelf: 'flex-start' } : { marginLeft: '4px' }
      }));
    } else if (tok.type === 'date') {
      textRow.push(/*#__PURE__*/React.createElement(DateCapsuleBadge, {
        key: `d-${idx}-${tok.value}`,
        date: tok.value,
        style: { marginRight: '4px' }
      }));
    } else {
      const v = tok.value;
      if (!v || !String(v).trim()) return;
      textRow.push(/*#__PURE__*/React.createElement("span", {
        key: `t-${idx}`,
        style: { wordBreak: 'break-word' }
      }, v));
    }
  });
  if (!stackUrl) {
    return /*#__PURE__*/React.createElement("span", {
      style: { display: 'inline-flex', flexWrap: 'wrap', alignItems: 'center', gap: '4px' }
    }, textRow, urlRow);
  }
  if (urlRow.length === 0) {
    if (textRow.length === 0) return null;
    if (textRow.length === 1 && tokens.every(t => t.type === 'text')) return textRow[0];
    return /*#__PURE__*/React.createElement("span", {
      style: { display: 'inline-flex', flexWrap: 'wrap', alignItems: 'center', gap: '4px' }
    }, textRow);
  }
  return /*#__PURE__*/React.createElement("div", {
    style: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px', minWidth: 0 }
  },
    textRow.length > 0 && /*#__PURE__*/React.createElement("span", {
      style: { display: 'inline-flex', flexWrap: 'wrap', alignItems: 'center', gap: '2px', wordBreak: 'break-word' }
    }, textRow),
    /*#__PURE__*/React.createElement("div", {
      style: { display: 'flex', flexDirection: 'column', gap: '4px', maxWidth: '100%' }
    }, urlRow)
  );
}

// Shared add/edit action row: 추가 | (edit) 취소 + 수정 — DateModal 참여자/장소/정산 공통 모듈


function normalizePollOptionInput(value = '') {
  const source = sanitizeText(value, 220);
  const url = extractFirstUrl(source);
  const text = sanitizeText(url ? removeFirstUrl(source) : source, 120);
  return {
    text: text || source,
    url
  };
}

function normalizePollVotes(rawVotes, optionIds = new Set(), participantIds = null) {
  const votes = {};
  optionIds.forEach(optionId => {
    votes[optionId] = [];
  });
  if (!rawVotes || typeof rawVotes !== 'object') return votes;
  const addVote = (optionId, participantId) => {
    const cleanOptionId = sanitizeText(optionId, 140);
    const cleanParticipantId = sanitizeText(participantId, 120);
    if (!optionIds.has(cleanOptionId)) return;
    if (!cleanParticipantId || participantIds && !participantIds.has(cleanParticipantId)) return;
    const list = votes[cleanOptionId] || [];
    if (!list.includes(cleanParticipantId)) list.push(cleanParticipantId);
    votes[cleanOptionId] = list;
  };
  Object.entries(rawVotes).forEach(([key, value]) => {
    const cleanKey = sanitizeText(key, 140);
    if (optionIds.has(cleanKey)) {
      if (Array.isArray(value)) {
        value.forEach(participantId => addVote(cleanKey, participantId));
        return;
      }
      if (value && typeof value === 'object') {
        Object.entries(value).forEach(([participantId, selected]) => {
          if (selected) addVote(cleanKey, participantId);
        });
        return;
      }
    }
    if (typeof value === 'string') {
      addVote(value, cleanKey);
    }
  });
  return votes;
}

function getPollOptionVoterIds(poll, optionId) {
  const optionIds = new Set(getActivePollOptions(poll).map(option => option.id));
  return normalizePollVotes(poll?.votes || {}, optionIds)[optionId] || [];
}

function getPollTotalVoteCount(poll) {
  const optionIds = new Set(getActivePollOptions(poll).map(option => option.id));
  const votes = normalizePollVotes(poll?.votes || {}, optionIds);
  return Object.values(votes).reduce((total, voterIds) => total + voterIds.length, 0);
}

const isPollClosed = GATHER_APP_UTILS.isPollClosed
  ? GATHER_APP_UTILS.isPollClosed
  : function isPollClosed(poll) {
  return !!(poll?.deadline && Date.now() >= Number(poll.deadline));
};

const formatPollDeadline = GATHER_APP_UTILS.formatPollDeadline
  ? GATHER_APP_UTILS.formatPollDeadline
  : function formatPollDeadline(deadline) {
  if (!deadline) return '';
  const date = new Date(Number(deadline));
  if (Number.isNaN(date.getTime())) return '';
  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
  const m = date.getMonth() + 1;
  const d = date.getDate();
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  return `${m}/${d} (${dayNames[date.getDay()]}) ${hh}:${mm}`;
};

function normalizePoll(calendarId, poll, participantIds = null) {
  if (!poll || typeof poll !== 'object') return null;
  if (poll.calendarId && poll.calendarId !== calendarId) return null;
  const id = sanitizeText(poll.id || `${calendarId}_poll_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`, 120);
  const title = sanitizeText(poll.title, 80);
  const description = sanitizeText(poll.description || '', 160);
  const updatedAt = Number(poll.updatedAt || poll.createdAt || Date.now()) || Date.now();
  if (!id || !title) return null;
  const optionIds = new Set();
  const options = (Array.isArray(poll.options) ? poll.options : []).map((option, index) => {
    const normalizedInput = normalizePollOptionInput(option?.text || '');
    const optionUrl = sanitizeText(option?.url || normalizedInput.url || '', 220);
    const optionText = sanitizeText(normalizedInput.text || option?.text || '', 120);
    const optionId = sanitizeText(option?.id || `${id}_opt_${index + 1}_${Date.now()}`, 140);
    if (!optionId || !optionText || optionIds.has(optionId)) return null;
    optionIds.add(optionId);
    const { inputValue, ...storedOption } = option || {};
    return {
      ...storedOption,
      id: optionId,
      text: optionText,
      url: optionUrl,
      updatedAt: Number(option?.updatedAt || updatedAt) || updatedAt
    };
  }).filter(Boolean).slice(0, 30);
  if (options.length === 0) return null;
  const votes = normalizePollVotes(poll.votes || {}, optionIds, participantIds);
  return {
    ...poll,
    id,
    calendarId,
    title,
    description,
    options,
    votes,
    createdAt: Number(poll.createdAt || updatedAt) || updatedAt,
    updatedAt
  };
}

function mergePollRecord(existing, incoming) {
  const existingClone = clonePoll(existing);
  const incomingClone = clonePoll(incoming);
  if (!existingClone) return incomingClone;
  if (!incomingClone) return existingClone;
  const existingStamp = getItemStamp(existingClone);
  const incomingStamp = getItemStamp(incomingClone);
  const scalarSource = incomingStamp >= existingStamp ? incomingClone : existingClone;
  const optionMap = new Map();
  (existingClone.options || []).forEach(option => {
    if (option?.id) optionMap.set(option.id, option);
  });
  (incomingClone.options || []).forEach(option => {
    if (!option?.id) return;
    const current = optionMap.get(option.id);
    optionMap.set(option.id, !current || getItemStamp(option) >= getItemStamp(current) ? option : current);
  });
  const orderSource = incomingStamp >= existingStamp ? incomingClone : existingClone;
  const orderedOptions = [];
  const usedOptionIds = new Set();
  (orderSource.options || []).forEach(option => {
    const mergedOption = optionMap.get(option?.id);
    if (!mergedOption || usedOptionIds.has(mergedOption.id)) return;
    orderedOptions.push(mergedOption);
    usedOptionIds.add(mergedOption.id);
  });
  optionMap.forEach(option => {
    if (!option?.id || usedOptionIds.has(option.id)) return;
    orderedOptions.push(option);
  });
  return {
    ...existingClone,
    ...incomingClone,
    title: scalarSource.title || incomingClone.title || existingClone.title,
    description: scalarSource.description || incomingClone.description || existingClone.description || '',
    options: orderedOptions,
    votes: scalarSource === incomingClone ? incomingClone.votes || {} : existingClone.votes || {},
    updatedAt: Math.max(existingClone.updatedAt || 0, incomingClone.updatedAt || 0),
    deletedAt: incomingClone.deletedAt || existingClone.deletedAt || null
  };
}

function mergePolls(existingPolls = [], incomingPolls = [], calendarId = '', participantIds = null) {
  const map = new Map();
  [...existingPolls, ...incomingPolls].forEach((poll) => {
    const normalized = normalizePoll(calendarId || poll?.calendarId || '', poll, participantIds);
    if (!normalized) return;
    map.set(normalized.id, mergePollRecord(map.get(normalized.id), normalized));
  });
  return Array.from(map.values()).sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
}

function buildActivityLogsFromAvailabilities(calendar) {
  const explicitLogs = getCalendarActivityLogs(calendar);
  const deletedLogIds = new Set(getDeletedActivityLogIds(calendar));
  // Fallback synthesis only exists to backfill legacy availabilities that predate explicit
  // per-action logging (no create/update/delete log was ever written for them). Once a
  // date+participant pair has ANY explicit log, trust that history completely -- matching on
  // date+participant+action+timestamp let a later edit's updatedAt slip through as a brand
  // new synthesized "create" entry (this function has no concept of "update"), producing a
  // phantom duplicate registration log every time an already-tracked entry was edited.
  const explicitPairs = new Set(explicitLogs.map(log => `${log.date}_${log.participantId}`));
  const explicitCreatePairs = new Set(explicitLogs.filter(l => l.action === 'create').map(log => `${log.date}_${log.participantId}`));
  const availabilities = Array.isArray(calendar?.availabilities) ? calendar.availabilities : [];

  // Some tracked pairs have update/delete logs but no create log: their real registration
  // predates activity logging entirely and was never captured. There's no way to recover the
  // true timestamp, but participants who registered in the same batch (the common case --
  // several people added within seconds of each other) give a reasonable estimate. Use the
  // earliest reliable timestamp found for the same date, from either a real create log or an
  // untouched (never-edited) availability, whose own updatedAt is trustworthy as its true
  // creation time.
  const earliestReliableByDate = new Map();
  availabilities.forEach((availability) => {
    if (isTombstone(availability)) return;
    const pairKey = `${availability.date}_${availability.participantId}`;
    let candidate = null;
    if (explicitCreatePairs.has(pairKey)) {
      const createLog = explicitLogs.find(l => l.action === 'create' && l.date === availability.date && l.participantId === availability.participantId);
      candidate = createLog ? getActivityLogStamp(createLog) : null;
    } else if (!explicitPairs.has(pairKey)) {
      candidate = Number(availability.updatedAt) || null;
    }
    if (!candidate) return;
    const current = earliestReliableByDate.get(availability.date);
    if (current === undefined || candidate < current) earliestReliableByDate.set(availability.date, candidate);
  });

  const fallbackLogs = availabilities.map((availability) => {
    const pairKey = `${availability.date}_${availability.participantId}`;
    if (explicitPairs.has(pairKey)) {
      if (explicitCreatePairs.has(pairKey)) return null;
      const estimatedTimestamp = earliestReliableByDate.get(availability.date);
      if (!estimatedTimestamp) return null;
      return normalizeActivityLog(calendar.id, {
        id: `${calendar.id}_${availability.date}_${availability.participantId}_create_${estimatedTimestamp}_estimated`,
        calendarId: calendar.id,
        participantId: availability.participantId,
        date: availability.date,
        action: 'create',
        note: '',
        timestamp: estimatedTimestamp
      });
    }
    const action = availability.deletedAt ? 'delete' : 'create';
    const timestamp = Number(availability.deletedAt || availability.updatedAt || 0) || 0;
    return normalizeActivityLog(calendar.id, {
      id: `${calendar.id}_${availability.date}_${availability.participantId}_${action}_${timestamp}_fallback`,
      calendarId: calendar.id,
      participantId: availability.participantId,
      date: availability.date,
      action,
      note: availability.note || '',
      timestamp
    });
  }).filter(Boolean);
  return mergeActivityLogs(explicitLogs, fallbackLogs, calendar?.id || '').filter(log => !deletedLogIds.has(log.id));
}

function validateCalendarShape(calendar) {
  if (!calendar || !isValidCalendarId(calendar.id)) return '캘린더 ID가 올바르지 않습니다.';
  if (sanitizeText(calendar.title, 80).length === 0) return '캘린더명이 비어 있습니다.';
  const participants = Array.isArray(calendar.participants) ? calendar.participants : [];
  const availabilities = Array.isArray(calendar.availabilities) ? calendar.availabilities : [];
  const activityLogs = Array.isArray(calendar.activityLogs) ? calendar.activityLogs : [];
  const polls = Array.isArray(calendar.polls) ? calendar.polls : [];
	  const deletedActivityLogIds = normalizeDeletedActivityLogIds(calendar.deletedActivityLogIds || []);
	  const expenseCategories = normalizeExpenseCategories(calendar.expenseCategories);
	  if (participants.length > 80) return '참여자가 너무 많습니다.';
	  if (availabilities.length > 5000) return '일정 데이터가 너무 많습니다.';
	  if (activityLogs.length > 5000) return '활동 로그가 너무 많습니다.';
	  if (polls.length > 100) return '투표 데이터가 너무 많습니다.';
	  if (expenseCategories.length > 24) return '지출 카테고리가 너무 많습니다.';
  if (deletedActivityLogIds.length > 5000) return '삭제된 활동 로그 이력이 너무 많습니다.';
  const participantIds = new Set();
  const activeNames = new Set();
  for (const participant of participants) {
    if (!participant?.id || participant.id.length > 96) return '참여자 ID가 올바르지 않습니다.';
    if (participantIds.has(participant.id)) return '참여자 ID가 중복되었습니다.';
    participantIds.add(participant.id);
    if (!isTombstone(participant)) {
      const name = normalizeParticipantName(calendar.id, participant.name);
      if (!name) return '참여자 이름이 비어 있습니다.';
      const nameKey = name.toLowerCase();
      if (activeNames.has(nameKey)) return '참여자 이름이 중복되었습니다.';
      activeNames.add(nameKey);
    }
  }
  for (const availability of availabilities) {
    if (!availability?.date || !isValidDateString(availability.date)) return '일정 날짜가 올바르지 않습니다.';
    if (!participantIds.has(availability.participantId)) return '일정의 참여자 연결이 올바르지 않습니다.';
    if (sanitizeText(availability.note, 500).length > 500) return '메모가 너무 깁니다.';
  }
  for (const log of activityLogs) {
    if (!normalizeActivityLog(calendar.id, log, participantIds)) return '활동 로그 형식이 올바르지 않습니다.';
  }
  for (const poll of polls) {
    if (!normalizePoll(calendar.id, poll, participantIds)) return '투표 형식이 올바르지 않습니다.';
  }
  return '';
}

function normalizeCalendarForSave(calendar) {
  const cloned = cloneCalendar(calendar);
  if (!cloned) return cloned;

  const now = Date.now();
  const participantById = new Map();
  (cloned.participants || []).forEach((participant) => {
    if (!participant?.id) return;
    const current = participantById.get(participant.id);
    participantById.set(participant.id, mergeParticipantRecord(current, participant));
  });

  const idRedirects = new Map();
  const activeByName = new Map();
  const normalizedParticipants = [];
  participantById.forEach((participant) => {
    const nameKey = !isTombstone(participant) ? (participant.name || '').trim().toLowerCase() : '';
    if (nameKey && activeByName.has(nameKey)) {
      const kept = activeByName.get(nameKey);
      idRedirects.set(participant.id, kept.id);
      return;
    }
    if (nameKey) activeByName.set(nameKey, participant);
    normalizedParticipants.push({
      ...participant,
      name: normalizeParticipantName(cloned.id, participant.name),
      color: normalizeColorValue(participant.color, PRESET_COLORS[normalizedParticipants.length % PRESET_COLORS.length]),
      updatedAt: participant.updatedAt || now
    });
  });

  const availabilityMap = new Map();
  (cloned.availabilities || []).forEach((availability) => {
    if (!availability?.date || !availability?.participantId) return;
    if (!isValidDateString(availability.date)) return;
    const participantId = idRedirects.get(availability.participantId) || availability.participantId;
    if (!participantById.has(participantId)) return;
    const normalizedAvailability = {
      ...availability,
      date: availability.date,
      participantId,
      note: sanitizeText(availability.note, 500)
    };
    const key = `${normalizedAvailability.date}_${normalizedAvailability.participantId}`;
    availabilityMap.set(key, mergeAvailabilityRecord(availabilityMap.get(key), normalizedAvailability));
  });
  const participantIds = new Set(normalizedParticipants.map(participant => participant.id));
  const normalizedActivityLogs = mergeActivityLogs([], cloned.activityLogs || [], cloned.id, participantIds, idRedirects);
  const normalizedPolls = mergePolls([], cloned.polls || [], cloned.id, participantIds);
  const deletedActivityLogIds = getDeletedActivityLogIds(cloned);

  return {
    ...cloned,
	    participants: normalizedParticipants,
	    availabilities: Array.from(availabilityMap.values()),
	    activityLogs: normalizedActivityLogs,
	    polls: normalizedPolls,
	    expenseCategories: normalizeExpenseCategories(cloned.expenseCategories),
	    places: normalizePlaces(cloned.places),
	    placeCategories: normalizePlaceCategories(cloned.placeCategories),
	    settlementBaseBudget: Number.isFinite(Number(cloned.settlementBaseBudget)) ? Math.max(0, Math.round(Number(cloned.settlementBaseBudget))) : 0,
	    deletedActivityLogIds
	  };
	}

function assertCalendarLinks(calendar) {
  const participantIds = new Set(getActiveParticipants(calendar).map((participant) => participant.id));
  return getActiveAvailabilities(calendar).every((availability) => participantIds.has(availability.participantId));
}

function mergeParticipantRecord(existing, incoming) {
  const existingClone = cloneParticipant(existing);
  const incomingClone = cloneParticipant(incoming);
  if (!existingClone) return incomingClone;
  if (!incomingClone) return existingClone;
  const existingStamp = getItemStamp(existingClone);
  const incomingStamp = getItemStamp(incomingClone);
  if (incomingStamp > existingStamp) {
    return {
      ...existingClone,
      ...incomingClone,
      removedAt: incomingClone.removedAt || null,
      deletedAt: incomingClone.deletedAt || null
    };
  }
  if (existingStamp > incomingStamp) return existingClone;
  return {
    ...existingClone,
    ...incomingClone,
    removedAt: incomingClone.removedAt || existingClone.removedAt || null,
    deletedAt: incomingClone.deletedAt || existingClone.deletedAt || null
  };
}

function mergeAvailabilityRecord(existing, incoming) {
  const existingClone = cloneAvailability(existing);
  const incomingClone = cloneAvailability(incoming);
  if (incomingClone) {
    incomingClone.note = sanitizeText(incomingClone.note, 500);
  }
  if (!existingClone) return incomingClone;
  if (!incomingClone) return existingClone;
  const existingStamp = getItemStamp(existingClone);
  const incomingStamp = getItemStamp(incomingClone);
  if (incomingStamp > existingStamp) {
    return {
      ...existingClone,
      ...incomingClone,
      deletedAt: incomingClone.deletedAt || null
    };
  }
  if (existingStamp > incomingStamp) return existingClone;
  return {
    ...existingClone,
    ...incomingClone,
    deletedAt: incomingClone.deletedAt || existingClone.deletedAt || null
  };
}

function mergeCalendarRecord(existing, incoming) {
  const base = cloneCalendar(existing) || {};
  const next = cloneCalendar(incoming) || {};
  if (!base.id) return next;
  if (!next.id) return base;
  if (base.id !== next.id) {
    throw new Error(`Calendar ID mismatch: ${base.id} cannot merge with ${next.id}`);
  }

  const participantMap = new Map();
  (base.participants || []).forEach((participant) => {
    if (participant?.id) participantMap.set(participant.id, participant);
  });
  (next.participants || []).forEach((participant) => {
    if (!participant?.id) return;
    const current = participantMap.get(participant.id);
    participantMap.set(participant.id, mergeParticipantRecord(current, participant));
  });

  const availabilityMap = new Map();
  (base.availabilities || []).forEach((availability) => {
    if (availability?.date && availability?.participantId) {
      availabilityMap.set(`${availability.date}_${availability.participantId}`, availability);
    }
  });
  (next.availabilities || []).forEach((availability) => {
    if (!availability?.date || !availability?.participantId) return;
    const key = `${availability.date}_${availability.participantId}`;
    const current = availabilityMap.get(key);
    availabilityMap.set(key, mergeAvailabilityRecord(current, availability));
  });
  const participantIds = new Set(Array.from(participantMap.values()).map(participant => participant.id));

  const mergedUpdatedAt = [base.updatedAt, next.updatedAt].reduce((max, value) => {
    const ts = value ? new Date(value).getTime() : 0;
    return ts > max ? ts : max;
  }, 0);
  const mergedRevision = Math.max(base.revision || 0, next.revision || 0);
  const baseStamp = base.updatedAt ? new Date(base.updatedAt).getTime() : 0;
  const nextStamp = next.updatedAt ? new Date(next.updatedAt).getTime() : 0;
  const scalarSource = nextStamp >= baseStamp ? next : base;

  return {
    ...base,
    ...next,
    title: scalarSource.title || next.title || base.title,
    description: scalarSource.description || next.description || base.description,
    participants: Array.from(participantMap.values()),
    availabilities: Array.from(availabilityMap.values()),
    activityLogs: mergeActivityLogs(base.activityLogs || [], next.activityLogs || [], base.id || next.id, participantIds),
    polls: mergePolls(base.polls || [], next.polls || [], base.id || next.id, participantIds),
    deletedActivityLogIds: mergeDeletedActivityLogIds(base.deletedActivityLogIds || [], next.deletedActivityLogIds || []),
    updatedAt: mergedUpdatedAt || next.updatedAt || base.updatedAt || null,
    revision: mergedRevision
  };
}

function mergeCalendarAvailabilityDelta(serverCalendar, incomingCalendar, changedAt = 0) {
  const base = cloneCalendar(serverCalendar) || cloneCalendar(incomingCalendar) || {};
  const incoming = cloneCalendar(incomingCalendar) || {};
  if (base.id && incoming.id && base.id !== incoming.id) {
    throw new Error(`Calendar ID mismatch: ${base.id} cannot receive ${incoming.id} availability`);
  }
  const participantIds = new Set(getActiveParticipants(base).map(participant => participant.id));
  const availabilityMap = new Map();

  (base.availabilities || []).forEach((availability) => {
    if (availability?.date && availability?.participantId && isValidDateString(availability.date)) {
      availabilityMap.set(`${availability.date}_${availability.participantId}`, availability);
    }
  });

  (incoming.availabilities || []).forEach((availability) => {
    if (!availability?.date || !availability?.participantId) return;
    if (!isValidDateString(availability.date)) return;
    if (participantIds.size > 0 && !participantIds.has(availability.participantId)) return;
    const key = `${availability.date}_${availability.participantId}`;
    availabilityMap.set(key, mergeAvailabilityRecord(availabilityMap.get(key), availability));
  });

  return {
    ...base,
    title: base.title || incoming.title,
    description: base.description || incoming.description,
    participants: base.participants || [],
    availabilities: Array.from(availabilityMap.values()),
    activityLogs: mergeActivityLogs(base.activityLogs || [], incoming.activityLogs || [], base.id || incoming.id, participantIds),
    polls: base.polls || [],
    deletedActivityLogIds: mergeDeletedActivityLogIds(base.deletedActivityLogIds || [], incoming.deletedActivityLogIds || []),
    updatedAt: Math.max(base.updatedAt || 0, incoming.updatedAt || 0, changedAt || 0),
    revision: Math.max(base.revision || 0, incoming.revision || 0)
  };
}

function mergeCalendarSettingsDelta(serverCalendar, incomingCalendar) {
  const server = cloneCalendar(serverCalendar) || {};
  const incoming = cloneCalendar(incomingCalendar) || {};
  if (server.id && incoming.id && server.id !== incoming.id) {
    throw new Error(`Calendar ID mismatch: ${server.id} cannot be saved as ${incoming.id}`);
  }
  const calendarId = incoming.id || server.id;
  const serverActiveCount = getActiveParticipants(server).length;
  const incomingActiveCount = getActiveParticipants(incoming).length;
  if (serverActiveCount > 0 && incomingActiveCount === 0) {
    throw new Error(`Refusing to replace ${calendarId} participants with an empty settings payload`);
  }

  const participantMap = new Map();
  (server.participants || []).forEach((participant) => {
    if (participant?.id) participantMap.set(participant.id, participant);
  });
  (incoming.participants || []).forEach((participant) => {
    if (!participant?.id) return;
    const normalizedParticipant = {
      ...participant,
      name: normalizeParticipantName(calendarId, participant.name)
    };
    participantMap.set(
      normalizedParticipant.id,
      mergeParticipantRecord(participantMap.get(normalizedParticipant.id), normalizedParticipant)
    );
  });

  return {
    ...server,
    ...incoming,
    id: calendarId,
    participants: Array.from(participantMap.values()),
    availabilities: server.availabilities || [],
    activityLogs: mergeActivityLogs(server.activityLogs || [], incoming.activityLogs || [], calendarId, new Set(Array.from(participantMap.values()).map(participant => participant.id))),
    polls: mergePolls(server.polls || [], incoming.polls || [], calendarId, new Set(Array.from(participantMap.values()).map(participant => participant.id))),
    deletedActivityLogIds: mergeDeletedActivityLogIds(server.deletedActivityLogIds || [], incoming.deletedActivityLogIds || []),
    // Explicit rather than relying on the "...incoming" spread above: confirmed-meeting expense
    // edits (category/label/amount) go through this exact saveMode, so an incoming payload that's
    // missing the field for any reason must not silently fall back to dropping the meeting data.
    confirmedMeeting: incoming.confirmedMeeting !== undefined ? incoming.confirmedMeeting : (server.confirmedMeeting || []),
    expenseCategories: incoming.expenseCategories !== undefined ? incoming.expenseCategories : server.expenseCategories,
    places: incoming.places !== undefined ? incoming.places : server.places,
    placeCategories: incoming.placeCategories !== undefined ? incoming.placeCategories : server.placeCategories,
    settlementBaseBudget: incoming.settlementBaseBudget !== undefined ? incoming.settlementBaseBudget : server.settlementBaseBudget
  };
}

function mergeCalendarPollsDelta(serverCalendar, incomingCalendar, changedAt = 0) {
  const base = cloneCalendar(serverCalendar) || cloneCalendar(incomingCalendar) || {};
  const incoming = cloneCalendar(incomingCalendar) || {};
  if (base.id && incoming.id && base.id !== incoming.id) {
    throw new Error(`Calendar ID mismatch: ${base.id} cannot receive ${incoming.id} polls`);
  }
  const participantIds = new Set(getActiveParticipants(base).map(participant => participant.id));
  const calendarId = base.id || incoming.id;
  return {
    ...base,
    polls: mergePolls(base.polls || [], incoming.polls || [], calendarId, participantIds),
    activityLogs: mergeActivityLogs(base.activityLogs || [], incoming.activityLogs || [], calendarId, participantIds),
    deletedActivityLogIds: mergeDeletedActivityLogIds(base.deletedActivityLogIds || [], incoming.deletedActivityLogIds || []),
    updatedAt: Math.max(base.updatedAt || 0, incoming.updatedAt || 0, changedAt || 0),
    revision: Math.max(base.revision || 0, incoming.revision || 0)
  };
}

function cloneCalendar(calendar) {
  if (!calendar) return calendar;
  return {
    ...calendar,
    participants: Array.isArray(calendar.participants) ? calendar.participants.map(cloneParticipant) : [],
    availabilities: Array.isArray(calendar.availabilities) ? calendar.availabilities.map(cloneAvailability) : [],
    activityLogs: Array.isArray(calendar.activityLogs) ? calendar.activityLogs.map(cloneActivityLog) : [],
    polls: Array.isArray(calendar.polls) ? calendar.polls.map(clonePoll) : [],
    deletedActivityLogIds: getDeletedActivityLogIds(calendar)
  };
}

function cloneCalendarList(list) {
  return Array.isArray(list) ? list.map(cloneCalendar).filter(Boolean) : [];
}

// Safety function: Strictly merge calendars by ID without bleeding participant data across different calendars.
// All objects are cloned so the static seed data never gets mutated by live updates.
function mergeCalendarCollections(sourceList, targetList, options = {}) {
  const { replaceMatchingId = false } = options;
  if (!Array.isArray(sourceList)) return cloneCalendarList(targetList || []);
  if (!Array.isArray(targetList)) return cloneCalendarList(sourceList || []);
  const map = new Map();
  cloneCalendarList(sourceList).forEach(c => map.set(c.id, c));
  targetList.forEach(tc => {
    const nextCalendar = cloneCalendar(tc);
    if (!nextCalendar || !nextCalendar.id) return;
    if (!map.has(nextCalendar.id)) {
      map.set(nextCalendar.id, nextCalendar);
    } else {
      const existing = map.get(nextCalendar.id);
      if (replaceMatchingId) {
        map.set(nextCalendar.id, mergeCalendarRecord(existing, nextCalendar));
        return;
      }
      map.set(nextCalendar.id, mergeCalendarRecord(existing, nextCalendar));
    }
  });
  return Array.from(map.values());
}
const INITIAL_CALENDARS = ['kkot', 'cw'].map(id => ({
  id,
  title: '캘린더 불러오는 중...',
  description: 'Firebase에서 실시간 캘린더 데이터를 불러오는 중입니다.',
  participants: [],
  availabilities: [],
  activityLogs: [],
  polls: [],
  deletedActivityLogIds: [],
  revision: 0,
  updatedAt: 0
}));

function loadLocalCache() {
  // Firestore is the only source of truth. Start empty so seed/demo data can never flash on screen.
  return [];
}

function saveLocalCache() {}

// Placeholder shown only until the real Firestore document arrives -- deliberately generic
// (not a real-looking calendar name) so a refresh never flashes stale/outdated text before the
// current title loads. This used to hardcode kkot/cw's actual titles as of whenever this was
// last written, which meant every refresh briefly showed whatever those calendars used to be
// named, however out of date, before snapping to the real (possibly renamed) title.
function getLoadingCalendarTitle(calendarId) {
  return '캘린더 불러오는 중...';
}

function createLoadingCalendarShell(calendarId) {
  const id = isAllowedCalendarId(calendarId) ? calendarId : 'kkot';
  return {
    id,
    title: getLoadingCalendarTitle(id),
    description: 'Firebase에서 실시간 캘린더 데이터를 불러오는 중입니다.',
    participants: [],
    availabilities: [],
    activityLogs: [],
    polls: [],
    deletedActivityLogIds: [],
    revision: 0,
    updatedAt: 0
  };
}

// Firebase Config for Realtime Multi-User Cloud Sync

function bindGatherFirebaseDeps() {
  window.GATHER_FIREBASE_DEPS = {
    getDb: function () { return firebaseDb; },
    projectId: (typeof firebaseConfig !== 'undefined' && firebaseConfig && firebaseConfig.projectId) || '',
    slimMessageForClient: typeof slimMessageForClient === 'function' ? slimMessageForClient : function (m) { return m; },
    firestoreDocumentToJs: typeof firestoreDocumentToJs === 'function' ? firestoreDocumentToJs : function () { return {}; },
    getMessageImageEntries: function (msg) {
      return typeof getMessageImageEntries === 'function' ? getMessageImageEntries(msg) : [];
    },
    getMessageDirectMediaEntry: function (msg) {
      return typeof getMessageDirectMediaEntry === 'function' ? getMessageDirectMediaEntry(msg) : null;
    },
    CHAT_LIVE_MESSAGE_LIMIT: typeof CHAT_LIVE_MESSAGE_LIMIT !== 'undefined' ? CHAT_LIVE_MESSAGE_LIMIT : 30,
    CHAT_OLDER_PAGE_SIZE: typeof CHAT_OLDER_PAGE_SIZE !== 'undefined' ? CHAT_OLDER_PAGE_SIZE : 40
  };
}

function subscribeMessages(calId, options, onSnapshot, onError) {
  const svc = window.GATHER_FIREBASE_SERVICES;
  if (svc && typeof svc.subscribeMessages === 'function' && !svc.isScaffold) {
    return svc.subscribeMessages(calId, options, onSnapshot, onError);
  }
  if (!firebaseDb || !calId) return function () {};
  let q = firebaseDb.collection('calendars').doc('cal_' + calId).collection('messages');
  const orderBy = (options && options.orderBy) || 'timestamp';
  const direction = (options && options.direction) || 'desc';
  q = q.orderBy(orderBy, direction);
  if (options && options.limit) q = q.limit(options.limit);
  return q.onSnapshot(onSnapshot, onError || function () {});
}
function subscribePlaces(calId, onSnapshot, onError) {
  const svc = window.GATHER_FIREBASE_SERVICES;
  if (svc && typeof svc.subscribePlaces === 'function' && !svc.isScaffold) {
    return svc.subscribePlaces(calId, onSnapshot, onError);
  }
  if (!firebaseDb || !calId) return function () {};
  return firebaseDb.collection('calendars').doc('cal_' + calId).collection('places')
    .onSnapshot(onSnapshot, onError || function () {});
}
function subscribeMemos(calId, options, onSnapshot, onError) {
  const svc = window.GATHER_FIREBASE_SERVICES;
  if (svc && typeof svc.subscribeMemos === 'function' && !svc.isScaffold) {
    return svc.subscribeMemos(calId, options, onSnapshot, onError);
  }
  if (!firebaseDb || !calId) return function () {};
  let q = firebaseDb.collection('calendars').doc('cal_' + calId).collection('memos');
  if (options && options.where) q = q.where(options.where[0], options.where[1], options.where[2]);
  if (options && options.orderBy) q = q.orderBy(options.orderBy, options.direction || 'desc');
  if (options && options.limit) q = q.limit(options.limit);
  return q.onSnapshot(onSnapshot, onError || function () {});
}
function subscribeAnniversaries(calId, onSnapshot, onError) {
  const svc = window.GATHER_FIREBASE_SERVICES;
  if (svc && typeof svc.subscribeAnniversaries === 'function' && !svc.isScaffold) {
    return svc.subscribeAnniversaries(calId, onSnapshot, onError);
  }
  if (!firebaseDb || !calId) return function () {};
  return firebaseDb.collection('calendars').doc('cal_' + calId).collection('anniversaries')
    .orderBy('createdAt', 'desc')
    .onSnapshot(onSnapshot, onError || function () {});
}


const firebaseConfig = {
  apiKey: "AIzaSyD-GatherCalendarAppLiveKey2026",
  authDomain: "metro-live-2918e.firebaseapp.com",
  projectId: "metro-live-2918e",
  storageBucket: "metro-live-2918e.firebasestorage.app",
  messagingSenderId: "154827314076",
  appId: "1:154827314076:web:gathercalendar2026"
};
let firebaseDb = null;
function __setFirebaseDb(v){ firebaseDb = v; if (typeof window!=="undefined") window.__gatherFirebaseDb = v; }

let firebaseStorage = null;
try {
  if (ENABLE_FIRESTORE_SYNC && typeof firebase !== 'undefined') {
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }
    __setFirebaseDb(firebase.firestore());
    bindGatherFirebaseDeps();
  }
} catch (e) {
  console.warn('Firebase init notice:', e);
}
try {
  // Chat images are uploaded here when available (see uploadChatImageAssets); every call site
  // falls back to embedding a compressed base64 image directly in the message document if this
  // is unavailable (bucket not provisioned on this project/plan, offline, etc.), so a Storage
  // outage degrades image quality/cost rather than breaking the chat feature outright.
  if (ENABLE_FIRESTORE_SYNC && typeof firebase !== 'undefined' && firebase.apps.length) {
    firebaseStorage = firebase.storage();
  }
} catch (e) {
  console.warn('Firebase Storage init notice (falling back to inline base64 images):', e);
}

let isStorageDisabled = false;
let lastStorageHealthCheckAt = 0;
let lastStorageHealthOk = null; // null = never checked yet

// A success is trusted for the rest of the session (Storage being reachable once means the
// SDK/network path itself is fine), but a failure is retried after a cooldown instead of
// latching forever -- this runs automatically ~1s after script load, so a single transient
// hiccup at that exact moment (slow initial connection competing with other startup requests,
// SDK not fully warmed up yet, etc.) would otherwise permanently degrade every image for the
// rest of the session even though Storage is actually fine moments later.
const STORAGE_HEALTH_RECHECK_COOLDOWN_MS = 20000;

async function checkFirebaseStorageHealth() {
  const now = Date.now();
  if (lastStorageHealthOk === true) return true;
  if (lastStorageHealthOk === false && (now - lastStorageHealthCheckAt) < STORAGE_HEALTH_RECHECK_COOLDOWN_MS) {
    return false;
  }
  if (!firebaseStorage) {
    lastStorageHealthOk = false;
    lastStorageHealthCheckAt = now;
    isStorageDisabled = true;
    return false;
  }
  try {
    // Path must satisfy storage.rules' chatImages/{calendarId}/{fileName} shape (two segments
    // after chatImages/) or it falls through to the deny-all catch-all rule, and the blob's
    // contentType must match storage.rules' `image/.*` requirement for this path -- either one
    // being wrong makes this probe always "fail" even when Storage itself is perfectly healthy,
    // silently capping every chat/memo image at the low-res inline-base64 fallback instead of
    // the high-quality upload.
    const probeRef = firebaseStorage.ref('chatImages/_health/probe.png');
    const blob = new Blob(['1'], { type: 'image/png' });
    const probePromise = probeRef.put(blob);
    const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('PROBE_TIMEOUT')), 5000));
    await Promise.race([probePromise, timeoutPromise]);
    isStorageDisabled = false;
    lastStorageHealthOk = true;
  } catch (e) {
    console.warn('Firebase Storage health check failed (will retry after cooldown):', e);
    isStorageDisabled = true;
    lastStorageHealthOk = false;
  }
  lastStorageHealthCheckAt = now;
  return !isStorageDisabled;
}

// Run health check early
setTimeout(() => {
  checkFirebaseStorageHealth().catch(() => {});
}, 1000);

// Mobile browsers aggressively suspend a backgrounded tab's network activity, and Firestore's
// realtime "listen" stream can come back stale/dead when the tab is foregrounded again -- the
// onSnapshot listener is still technically subscribed, but its underlying connection stopped
// delivering updates, so messages sent elsewhere while this tab was backgrounded never appear
// until a full page reload re-creates everything from scratch. Cycling disableNetwork() then
// enableNetwork() on visibility-return forces the SDK to drop and re-establish its streams,
// which reliably clears this up without requiring a reload.
//
// Only worth doing after a real background stretch, though: a brief glance away (checking a
// notification, switching apps for a couple seconds) is well within what Firestore's own
// connection handles fine on its own, and forcing every single listener (calendar doc, chat,
// memos, anniversaries, ...) to fully reconnect on EVERY foreground event makes the app look
// like it's reloading from scratch each time the user comes back -- which given how often mobile
// tabs get backgrounded/foregrounded is the more noticeable cost in practice.
const VISIBILITY_RECONNECT_THRESHOLD_MS = 60000;
const BACKGROUND_NETWORK_PAUSE_MS = 15000;
let lastHiddenAt = 0;
let backgroundPauseTimer = null;
let networkPausedForBackground = false;
if (typeof document !== 'undefined' && typeof document.addEventListener === 'function') {
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      lastHiddenAt = Date.now();
      if (backgroundPauseTimer) clearTimeout(backgroundPauseTimer);
      backgroundPauseTimer = setTimeout(() => {
        backgroundPauseTimer = null;
        if (typeof document === 'undefined' || document.visibilityState !== 'hidden' || !firebaseDb) return;
        networkPausedForBackground = true;
        firebaseDb.disableNetwork().catch(e => {
          console.warn('Firestore background pause notice:', e);
        });
      }, BACKGROUND_NETWORK_PAUSE_MS);
      return;
    }
    if (backgroundPauseTimer) {
      clearTimeout(backgroundPauseTimer);
      backgroundPauseTimer = null;
    }
    if (document.visibilityState !== 'visible' || !firebaseDb) return;
    const hiddenFor = lastHiddenAt ? (Date.now() - lastHiddenAt) : 0;
    const resume = () => { networkPausedForBackground = false; };
    if (networkPausedForBackground || hiddenFor >= VISIBILITY_RECONNECT_THRESHOLD_MS) {
      firebaseDb.disableNetwork()
        .catch(() => {})
        .then(() => firebaseDb.enableNetwork())
        .then(resume)
        .catch(e => { resume(); console.warn('Firestore reconnect notice:', e); });
      return;
    }
  });
}

async function fetchSingleCalendarWithRest(calId, timeoutMs = FIREBASE_LOAD_TIMEOUT_MS) {
  if (!isAllowedCalendarId(calId)) return null;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const docUrl = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/calendars/cal_${calId}`;
    const response = await fetch(docUrl, { signal: controller.signal });
    if (!response.ok) return null;
    const decoded = firestoreDocumentToJs(await response.json());
    if (decoded?.calendar?.id !== calId) return null;
    return {
      calendar: decoded.calendar,
      lastModified: decoded.lastModified || decoded.calendar.updatedAt || 0
    };
  } catch (error) {
    console.warn(`Firestore REST fetch notice for cal_${calId}:`, error);
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function fetchRecentMessagesRest(calId) {
  try {
    const url = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/calendars/cal_${calId}/messages?orderBy=timestamp%20desc&pageSize=5`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    const docs = data.documents || [];
    return docs.map(doc => ({
      id: doc.name.split('/').pop(),
      ...firestoreDocumentToJs(doc)
    }));
  } catch (err) {
    console.warn('fetchRecentMessagesRest error:', err);
    return [];
  }
}

async function fetchChatMessagesRest() {
  const svc = window.GATHER_FIREBASE_SERVICES;
  if (svc && typeof svc.fetchChatMessagesRest === 'function' && !svc.isScaffold) {
    return svc.fetchChatMessagesRest.apply(null, arguments);
  }
  console.warn('fetchChatMessagesRest: GATHER_FIREBASE_SERVICES missing');
  return [];
}

async function fetchRecentChatMessages() {
  const svc = window.GATHER_FIREBASE_SERVICES;
  if (svc && typeof svc.fetchRecentChatMessages === 'function' && !svc.isScaffold) {
    return svc.fetchRecentChatMessages.apply(null, arguments);
  }
  console.warn('fetchRecentChatMessages: GATHER_FIREBASE_SERVICES missing');
  return [];
}

const CHAT_OLDER_PAGE_SIZE = readConfigNumber('CHAT_OLDER_PAGE_SIZE', 40);
bindGatherFirebaseDeps();

async function fetchSubcollectionCount() {
  const svc = window.GATHER_FIREBASE_SERVICES;
  if (svc && typeof svc.fetchSubcollectionCount === 'function' && !svc.isScaffold) {
    return svc.fetchSubcollectionCount.apply(null, arguments);
  }
  console.warn('fetchSubcollectionCount: GATHER_FIREBASE_SERVICES missing');
  return null;
}

async function fetchOlderChatMessages() {
  const svc = window.GATHER_FIREBASE_SERVICES;
  if (svc && typeof svc.fetchOlderChatMessages === 'function' && !svc.isScaffold) {
    return svc.fetchOlderChatMessages.apply(null, arguments);
  }
  console.warn('fetchOlderChatMessages: GATHER_FIREBASE_SERVICES missing');
  return [];
}

async function fetchGalleryItemCount() {
  const svc = window.GATHER_FIREBASE_SERVICES;
  if (svc && typeof svc.fetchGalleryItemCount === 'function' && !svc.isScaffold) {
    return svc.fetchGalleryItemCount.apply(null, arguments);
  }
  console.warn('fetchGalleryItemCount: GATHER_FIREBASE_SERVICES missing');
  return null;
}

async function fetchMemosRest(calId, recentLimit = null) {
  try {
    const pageSizePart = recentLimit ? `&pageSize=${recentLimit}` : '';
    const url = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/calendars/cal_${calId}/memos?orderBy=createdAt%20desc${pageSizePart}`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    const docs = data.documents || [];
    return docs.map(doc => ({
      id: doc.name.split('/').pop(),
      ...firestoreDocumentToJs(doc)
    }));
  } catch (err) {
    console.warn('fetchMemosRest error:', err);
    return [];
  }
}

async function fetchAnniversariesRest(calId) {
  try {
    const url = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/calendars/cal_${calId}/anniversaries?orderBy=createdAt%20desc`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    const docs = data.documents || [];
    return docs.map(doc => ({
      id: doc.name.split('/').pop(),
      ...firestoreDocumentToJs(doc)
    }));
  } catch (err) {
    console.warn('fetchAnniversariesRest error:', err);
    return [];
  }
}

async function sendChatMessageRest(calId, message) {
  try {
    const url = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/calendars/cal_${calId}/messages`;
    const fields = {
      participantId: jsToFirestoreValue(message.participantId),
      text: jsToFirestoreValue(message.text),
      timestamp: jsToFirestoreValue(message.timestamp)
    };
    if (message.imageUrl) fields.imageUrl = jsToFirestoreValue(message.imageUrl);
    if (message.thumbUrl) fields.thumbUrl = jsToFirestoreValue(message.thumbUrl);
    if (Array.isArray(message.imageUrls) && message.imageUrls.length > 0) fields.imageUrls = jsToFirestoreValue(message.imageUrls);
    if (Array.isArray(message.thumbUrls) && message.thumbUrls.length > 0) fields.thumbUrls = jsToFirestoreValue(message.thumbUrls);
    const payload = { fields };
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return res.ok;
  } catch (err) {
    console.warn('sendChatMessageRest error:', err);
    return false;
  }
}

async function deleteMessageRest(calId, messageId) {
  try {
    const url = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/calendars/cal_${calId}/messages/${messageId}`;
    const res = await fetch(url, { method: 'DELETE' });
    return res.ok;
  } catch (err) {
    console.warn('deleteMessageRest error:', err);
    return false;
  }
}

async function updateMessageRest(calId, messageId, data) {
  try {
    const fields = {};
    if (data.text !== undefined) fields.text = jsToFirestoreValue(data.text);
    if (data.imageUrl !== undefined) fields.imageUrl = jsToFirestoreValue(data.imageUrl);
    if (data.thumbUrl !== undefined) fields.thumbUrl = jsToFirestoreValue(data.thumbUrl);
    if (data.imageUrls !== undefined) fields.imageUrls = jsToFirestoreValue(data.imageUrls);
    if (data.thumbUrls !== undefined) fields.thumbUrls = jsToFirestoreValue(data.thumbUrls);
    if (data.participantId !== undefined) fields.participantId = jsToFirestoreValue(data.participantId);
    const updateMask = Object.keys(fields).map(k => `updateMask.fieldPaths=${k}`).join('&');
    const url = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/calendars/cal_${calId}/messages/${messageId}?${updateMask}`;
    const res = await fetch(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fields })
    });
    return res.ok;
  } catch (err) {
    console.warn('updateMessageRest error:', err);
    return false;
  }
}

function waitForTimeout(ms, message = 'timeout') {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error(message)), ms);
  });
}

// Returns { calendar, lastModified } or null with 10s timeout, retries, and REST fallback.
async function fetchSingleCloudCalendar(calId, retryCount = FIREBASE_LOAD_MAX_ATTEMPTS, timeoutMs = FIREBASE_LOAD_TIMEOUT_MS) {
  if (!isAllowedCalendarId(calId)) return null;
  const attempts = Math.max(1, retryCount);
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      if (firebaseDb) {
        const doc = await Promise.race([
          firebaseDb.collection('calendars').doc(`cal_${calId}`).get(),
          waitForTimeout(timeoutMs, `Firestore fetch timeout after ${timeoutMs}ms`)
        ]);
        if (doc.exists) {
          const data = doc.data();
          if (data && data.calendar && data.calendar.id === calId) {
            return {
              calendar: data.calendar,
              lastModified: data.lastModified || data.calendar.updatedAt || 0
            };
          }
        }
      }
      const restResult = await fetchSingleCalendarWithRest(calId, timeoutMs);
      if (restResult) return restResult;
    } catch (e) {
      console.warn(`Firestore fetch notice for cal_${calId}, attempt ${attempt}/${attempts}:`, e);
      const restResult = await fetchSingleCalendarWithRest(calId, timeoutMs);
      if (restResult) return restResult;
    }
    if (attempt < attempts) {
      await new Promise(resolve => setTimeout(resolve, 350 * attempt));
    }
  }
  return null;
}

function isUsableCloudCalendarPayload(data, expectedCalendarId) {
  return Boolean(data && data.calendar && data.calendar.id === expectedCalendarId);
}

function getCloudDocCalendar(doc, expectedCalendarId) {
  if (!doc?.exists) return null;
  const data = doc.data();
  if (!isUsableCloudCalendarPayload(data, expectedCalendarId)) return null;
  return {
    calendar: data.calendar,
    lastModified: data.lastModified || data.calendar.updatedAt || 0
  };
}

function firestoreValueToJs(value) {
  if (!value || typeof value !== 'object') return undefined;
  if ('stringValue' in value) return value.stringValue;
  if ('integerValue' in value) return Number(value.integerValue);
  if ('doubleValue' in value) return Number(value.doubleValue);
  if ('booleanValue' in value) return value.booleanValue;
  if ('nullValue' in value) return null;
  if ('mapValue' in value) {
    const fields = value.mapValue.fields || {};
    return Object.fromEntries(Object.entries(fields).map(([key, nested]) => [key, firestoreValueToJs(nested)]));
  }
  if ('arrayValue' in value) return (value.arrayValue.values || []).map(firestoreValueToJs);
  return undefined;
}

function jsToFirestoreValue(value) {
  if (value === null || value === undefined) return { nullValue: null };
  if (typeof value === 'string') return { stringValue: value };
  if (typeof value === 'boolean') return { booleanValue: value };
  if (typeof value === 'number') {
    return Number.isInteger(value) ? { integerValue: String(value) } : { doubleValue: value };
  }
  if (Array.isArray(value)) {
    return { arrayValue: value.length ? { values: value.map(jsToFirestoreValue) } : {} };
  }
  if (typeof value === 'object') {
    return {
      mapValue: {
        fields: Object.fromEntries(Object.entries(value).map(([key, nested]) => [key, jsToFirestoreValue(nested)]))
      }
    };
  }
  return { stringValue: String(value) };
}

function firestoreDocumentToJs(doc) {
  const fields = doc?.fields || {};
  return Object.fromEntries(Object.entries(fields).map(([key, value]) => [key, firestoreValueToJs(value)]));
}

function getImageSharePageUrl(shareId) {
  const url = new URL(window.location.href);
  url.search = '';
  url.hash = '';
  url.searchParams.set('image', shareId);
  return url.toString();
}

function sanitizeShareIdPart(value, fallback = 'item') {
  const clean = String(value || '')
    .replace(/[^A-Za-z0-9_-]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 80);
  return clean || fallback;
}

async function createImageShareDocument(calendarId, imageUrl, meta = {}) {
  const messageId = sanitizeText(meta?.messageId || '', 180);
  const imageIndex = Number.isFinite(Number(meta?.imageIndex)) ? Math.max(0, Math.round(Number(meta.imageIndex))) : 0;
  if (messageId) {
    const shareId = `img_${sanitizeShareIdPart(calendarId, 'cal')}_${sanitizeShareIdPart(messageId, 'msg')}_${imageIndex}`;
    const payload = {
      id: shareId,
      calendarId,
      source: 'message',
      messageId,
      imageIndex,
      thumbUrl: typeof meta?.thumb === 'string' && meta.thumb.startsWith('data:image/') ? meta.thumb : '',
      createdAt: Date.now()
    };
    try {
      const existing = await fetchImageShareDocument(shareId);
      if (existing?.imageUrl || existing?.source === 'message') return getImageSharePageUrl(shareId);
    } catch (e) {
      console.warn('Image share cache lookup skipped:', e);
    }
    if (firebaseDb) {
      await withTimeout(firebaseDb.collection('imageShares').doc(shareId).set(payload, { merge: true }), 9000, 'image share pointer write');
    } else {
      const res = await withTimeout(fetch(`https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/imageShares/${shareId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields: Object.fromEntries(Object.entries(payload).map(([key, value]) => [key, jsToFirestoreValue(value)])) })
      }), 9000, 'image share pointer REST write');
      if (!res.ok) throw new Error(`Image share REST write failed: ${res.status}`);
    }
    return getImageSharePageUrl(shareId);
  }

  if (typeof imageUrl !== 'string' || !imageUrl.startsWith('data:image/')) {
    throw new Error('Only inline image data URLs can be shared with the fallback document route');
  }
  const dataInfo = getDataUrlInfo(imageUrl);
  if (dataInfo?.sizeBytes && dataInfo.sizeBytes > 900 * 1024) {
    throw new Error('Inline image is too large for Firestore image share document');
  }
  const shareId = `img_${calendarId}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  const payload = {
    id: shareId,
    calendarId,
    imageUrl,
    thumbUrl: typeof meta?.thumb === 'string' && meta.thumb.startsWith('data:image/') ? meta.thumb : '',
    messageId,
    imageIndex,
    createdAt: Date.now()
  };
  if (firebaseDb) {
    await withTimeout(firebaseDb.collection('imageShares').doc(shareId).set(payload), 9000, 'image share fallback write');
  } else {
    const res = await withTimeout(fetch(`https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/imageShares/${shareId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fields: Object.fromEntries(Object.entries(payload).map(([key, value]) => [key, jsToFirestoreValue(value)])) })
    }), 9000, 'image share fallback REST write');
    if (!res.ok) throw new Error(`Image share REST write failed: ${res.status}`);
  }
  return getImageSharePageUrl(shareId);
}

async function fetchImageShareDocument(shareId) {
  if (!shareId || !/^img_[A-Za-z0-9_-]{3,180}$/.test(shareId)) return null;
  const resolveMessageShare = async share => {
    if (!share || share.imageUrl || share.source !== 'message' || !share.calendarId || !share.messageId) return share;
    let msg = null;
    if (firebaseDb) {
      const snap = await firebaseDb.collection('calendars').doc(`cal_${share.calendarId}`).collection('messages').doc(share.messageId).get();
      msg = snap.exists ? snap.data() : null;
    } else {
      const res = await fetch(`https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/calendars/cal_${share.calendarId}/messages/${share.messageId}`);
      msg = res.ok ? firestoreDocumentToJs(await res.json()) : null;
    }
    if (!msg) return share;
    const imageUrls = Array.isArray(msg.imageUrls) && msg.imageUrls.length > 0 ? msg.imageUrls : (msg.imageUrl ? [msg.imageUrl] : []);
    const thumbUrls = Array.isArray(msg.thumbUrls) && msg.thumbUrls.length > 0 ? msg.thumbUrls : (msg.thumbUrl ? [msg.thumbUrl] : []);
    const index = Number.isFinite(Number(share.imageIndex)) ? Math.max(0, Math.round(Number(share.imageIndex))) : 0;
    return {
      ...share,
      imageUrl: imageUrls[index] || imageUrls[0] || '',
      thumbUrl: thumbUrls[index] || thumbUrls[0] || '',
      timestamp: msg.timestamp || share.createdAt
    };
  };
  if (firebaseDb) {
    const snap = await firebaseDb.collection('imageShares').doc(shareId).get();
    return snap.exists ? resolveMessageShare(snap.data()) : null;
  }
  const res = await fetch(`https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/imageShares/${shareId}`);
  if (!res.ok) return null;
  return resolveMessageShare(firestoreDocumentToJs(await res.json()));
}

// Estimates the actual Firestore wire-format byte size of a calendar payload (the same
// typed-value shape jsToFirestoreValue produces for the REST commit body), so a save can be
// refused with a clear message before it gets anywhere near Firestore's real 1MiB/doc limit.
function estimateCalendarDocWireBytes(calendar) {
  try {
    const wireValue = jsToFirestoreValue(calendar);
    return new TextEncoder().encode(JSON.stringify(wireValue)).length;
  } catch (e) {
    return 0;
  }
}

// --- Activity log subcollection (calendars/cal_{id}/activityLogs/{logId}) ---
// activityLogs used to be an embedded array on the calendar document, growing forever with
// zero de-duplication (unlike availabilities, which de-dupes by date+participant). That made
// it the single biggest long-term threat to the calendar document's 1MiB size limit. It now
// lives in its own subcollection, one document per log entry (same pattern as `messages`),
// which has no per-document array-size ceiling to worry about.

// Strips the legacy embedded activityLogs array from a calendar payload right before it is
// written to Firestore. deletedActivityLogIds is NOT touched here -- it's a short list of
// hidden log IDs added one at a time by a manual user action, not an auto-growing log, so it
// stays embedded on the calendar document as before.
function stripEmbeddedActivityLogsField(calendar) {
  if (!calendar || typeof calendar !== 'object') return calendar;
  const { activityLogs, ...rest } = calendar;
  return rest;
}

// Writes a batch of activity log entries as individual documents, keyed by each log's own
// `id` so retries/re-copies of the same entry are idempotent no-ops rather than duplicates.
async function writeActivityLogsToFirestore(calendarId, logs) {
  const validLogs = Array.isArray(logs) ? logs.filter(log => log && typeof log.id === 'string' && log.id) : [];
  if (!validLogs.length) return true;
  if (firebaseDb) {
    try {
      const colRef = firebaseDb.collection('calendars').doc(`cal_${calendarId}`).collection('activityLogs');
      const batch = firebaseDb.batch();
      validLogs.forEach(log => batch.set(colRef.doc(log.id), log));
      await batch.commit();
      return true;
    } catch (e) {
      console.warn(`Failed to write activity logs for ${calendarId} via SDK, trying REST:`, e);
    }
  }
  try {
    const writes = validLogs.map(log => ({
      update: {
        name: `projects/metro-live-2918e/databases/(default)/documents/calendars/cal_${calendarId}/activityLogs/${log.id}`,
        fields: Object.fromEntries(Object.entries(log).map(([key, value]) => [key, jsToFirestoreValue(value)]))
      }
    }));
    const res = await fetch('https://firestore.googleapis.com/v1/projects/metro-live-2918e/databases/(default)/documents:commit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ writes })
    });
    if (!res.ok) console.warn(`Activity log REST write failed for ${calendarId}:`, await res.text());
    return res.ok;
  } catch (e) {
    console.warn(`Failed to write activity logs for ${calendarId} via REST:`, e);
    return false;
  }
}

// Fetches activity log documents for a calendar. Pass `recentLimit` for a display feed
// (ordered newest-first); omit it to fetch the full history (unordered), which point-in-time
// recovery needs to correctly replay every action up to a cutoff timestamp.
async function fetchActivityLogsFromFirestore(calendarId, recentLimit = null) {
  const basePath = `calendars/cal_${calendarId}/activityLogs`;
  try {
    if (firebaseDb) {
      let query = firebaseDb.collection('calendars').doc(`cal_${calendarId}`).collection('activityLogs');
      if (recentLimit) query = query.orderBy('timestamp', 'desc').limit(recentLimit);
      const snap = await query.get();
      return snap.docs.map(doc => doc.data());
    }
  } catch (e) {
    console.warn(`Failed to fetch activity logs for ${calendarId} via SDK, trying REST:`, e);
  }
  try {
    const orderPart = recentLimit ? '?orderBy=timestamp%20desc&pageSize=' + recentLimit : '?pageSize=1000';
    const res = await fetch(`https://firestore.googleapis.com/v1/projects/metro-live-2918e/databases/(default)/documents/${basePath}${orderPart}`);
    if (!res.ok) return [];
    const data = await res.json();
    const docs = data.documents || [];
    return docs.map(doc => firestoreDocumentToJs(doc));
  } catch (e) {
    console.warn(`Failed to fetch activity logs for ${calendarId} via REST:`, e);
    return [];
  }
}

// Deletes activity log documents strictly after a cutoff timestamp, used by point-in-time
// recovery to match the "future" chat messages it already deletes on restore.
async function deleteActivityLogsAfterTimestamp(calendarId, logs, cutoffTimestamp) {
  const toDelete = (logs || []).filter(log => getActivityLogStamp(log) > cutoffTimestamp && log.id);
  for (const log of toDelete) {
    try {
      if (firebaseDb) {
        await firebaseDb.collection('calendars').doc(`cal_${calendarId}`).collection('activityLogs').doc(log.id).delete();
      } else {
        await fetch(`https://firestore.googleapis.com/v1/projects/metro-live-2918e/databases/(default)/documents/calendars/cal_${calendarId}/activityLogs/${log.id}`, { method: 'DELETE' });
      }
    } catch (e) {
      console.warn(`Failed to delete activity log ${log.id} for ${calendarId}:`, e);
    }
  }
}

// --- Places subcollection (calendars/cal_{id}/places/{placeId}) ---
// Same migration reasoning as activityLogs above: `places` used to be an embedded array on the
// calendar document (still count-capped at 500 there for calendars not yet migrated -- see
// firestore.rules), so every registered place was re-downloaded on every single realtime update
// to the calendar doc, for every connected client, regardless of relevance. Moved to its own
// subcollection, one document per place, keyed by the place's own client-generated `id` (same
// keyed-by-own-id pattern as memos).
function stripEmbeddedPlacesField(calendar) {
  if (!calendar || typeof calendar !== 'object') return calendar;
  const { places, ...rest } = calendar;
  return rest;
}
async function writePlacesToFirestore(calendarId, places) {
  const validPlaces = Array.isArray(places) ? places.filter(p => p && typeof p.id === 'string' && p.id) : [];
  if (!validPlaces.length) return true;
  if (firebaseDb) {
    try {
      const colRef = firebaseDb.collection('calendars').doc(`cal_${calendarId}`).collection('places');
      const batch = firebaseDb.batch();
      validPlaces.forEach(place => batch.set(colRef.doc(place.id), place));
      await batch.commit();
      return true;
    } catch (e) {
      console.warn(`Failed to write places for ${calendarId} via SDK, trying REST:`, e);
    }
  }
  try {
    const writes = validPlaces.map(place => ({
      update: {
        name: `projects/metro-live-2918e/databases/(default)/documents/calendars/cal_${calendarId}/places/${place.id}`,
        fields: Object.fromEntries(Object.entries(place).map(([key, value]) => [key, jsToFirestoreValue(value)]))
      }
    }));
    const res = await fetch('https://firestore.googleapis.com/v1/projects/metro-live-2918e/databases/(default)/documents:commit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ writes })
    });
    if (!res.ok) console.warn(`Places REST write failed for ${calendarId}:`, await res.text());
    return res.ok;
  } catch (e) {
    console.warn(`Failed to write places for ${calendarId} via REST:`, e);
    return false;
  }
}
async function fetchPlacesFromFirestore(calendarId) {
  const basePath = `calendars/cal_${calendarId}/places`;
  try {
    if (firebaseDb) {
      const snap = await firebaseDb.collection('calendars').doc(`cal_${calendarId}`).collection('places').get();
      return snap.docs.map(doc => doc.data());
    }
  } catch (e) {
    console.warn(`Failed to fetch places for ${calendarId} via SDK, trying REST:`, e);
  }
  try {
    const res = await fetch(`https://firestore.googleapis.com/v1/projects/metro-live-2918e/databases/(default)/documents/${basePath}?pageSize=500`);
    if (!res.ok) return [];
    const data = await res.json();
    const docs = data.documents || [];
    return docs.map(doc => firestoreDocumentToJs(doc));
  } catch (e) {
    console.warn(`Failed to fetch places for ${calendarId} via REST:`, e);
    return [];
  }
}

// --- Confirmed meetings subcollection (calendars/cal_{id}/confirmedMeetings/{date}) ---
// Same migration reasoning, keyed by the entry's own `date` string (already the unique key
// getConfirmedMeetings/handleConfirmMeeting use to find/update/delete an entry) rather than a
// generated id.
function stripEmbeddedConfirmedMeetingField(calendar) {
  if (!calendar || typeof calendar !== 'object') return calendar;
  const { confirmedMeeting, ...rest } = calendar;
  return rest;
}
async function writeConfirmedMeetingsToFirestore(calendarId, meetings) {
  const validMeetings = Array.isArray(meetings) ? meetings.filter(m => m && typeof m.date === 'string' && m.date) : [];
  if (!validMeetings.length) return true;
  if (firebaseDb) {
    try {
      const colRef = firebaseDb.collection('calendars').doc(`cal_${calendarId}`).collection('confirmedMeetings');
      const batch = firebaseDb.batch();
      validMeetings.forEach(meeting => batch.set(colRef.doc(meeting.date), meeting));
      await batch.commit();
      return true;
    } catch (e) {
      console.warn(`Failed to write confirmed meetings for ${calendarId} via SDK, trying REST:`, e);
    }
  }
  try {
    const writes = validMeetings.map(meeting => ({
      update: {
        name: `projects/metro-live-2918e/databases/(default)/documents/calendars/cal_${calendarId}/confirmedMeetings/${meeting.date}`,
        fields: Object.fromEntries(Object.entries(meeting).map(([key, value]) => [key, jsToFirestoreValue(value)]))
      }
    }));
    const res = await fetch('https://firestore.googleapis.com/v1/projects/metro-live-2918e/databases/(default)/documents:commit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ writes })
    });
    if (!res.ok) console.warn(`Confirmed meetings REST write failed for ${calendarId}:`, await res.text());
    return res.ok;
  } catch (e) {
    console.warn(`Failed to write confirmed meetings for ${calendarId} via REST:`, e);
    return false;
  }
}
async function fetchConfirmedMeetingsFromFirestore(calendarId) {
  const basePath = `calendars/cal_${calendarId}/confirmedMeetings`;
  try {
    if (firebaseDb) {
      const snap = await firebaseDb.collection('calendars').doc(`cal_${calendarId}`).collection('confirmedMeetings').get();
      return snap.docs.map(doc => doc.data());
    }
  } catch (e) {
    console.warn(`Failed to fetch confirmed meetings for ${calendarId} via SDK, trying REST:`, e);
  }
  try {
    const res = await fetch(`https://firestore.googleapis.com/v1/projects/metro-live-2918e/databases/(default)/documents/${basePath}?pageSize=500`);
    if (!res.ok) return [];
    const data = await res.json();
    const docs = data.documents || [];
    return docs.map(doc => firestoreDocumentToJs(doc));
  } catch (e) {
    console.warn(`Failed to fetch confirmed meetings for ${calendarId} via REST:`, e);
    return [];
  }
}

function isRetryableFirestoreConflict(errorText) {
  return /ABORTED|FAILED_PRECONDITION|409|stored version|base version/i.test(String(errorText || ''));
}

function getFirestoreRetryDelay(attempt) {
  const baseDelay = Math.min(3000, 180 * Math.pow(1.55, attempt));
  const jitter = Math.floor(Math.random() * 180);
  return baseDelay + jitter;
}

async function pushSingleCalendarWithRest(normalizedCal, lastModified, saveMode, retryCount = 18, newActivityLogs = []) {
  const docPath = `projects/metro-live-2918e/databases/(default)/documents/calendars/cal_${normalizedCal.id}`;
  const docUrl = `https://firestore.googleapis.com/v1/${docPath}`;
  for (let attempt = 0; attempt <= retryCount; attempt += 1) {
    try {
      const getRes = await fetch(docUrl);
      const currentDoc = getRes.ok ? await getRes.json() : null;
      const currentData = currentDoc ? firestoreDocumentToJs(currentDoc) : null;
      const serverCalendar = currentData?.calendar || null;
      let nextCalendar;
      if (!serverCalendar) {
        nextCalendar = normalizedCal;
      } else if (saveMode === 'restore') {
        nextCalendar = normalizedCal;
      } else if (saveMode === 'replace') {
        const err = new Error(`Refusing to replace existing calendar ${normalizedCal.id}`);
        err.nonRetryable = true;
        throw err;
      } else if (saveMode === 'settings') {
        nextCalendar = mergeCalendarSettingsDelta(serverCalendar, normalizedCal);
      } else if (saveMode === 'polls') {
        nextCalendar = mergeCalendarPollsDelta(serverCalendar, normalizedCal, lastModified);
      } else {
        nextCalendar = mergeCalendarAvailabilityDelta(serverCalendar, normalizedCal, lastModified);
      }
      const mergedCalendar = normalizeCalendarForSave(nextCalendar);
      mergedCalendar.revision = Math.max(serverCalendar?.revision || 0, normalizedCal.revision || 0) + 1;
      mergedCalendar.updatedAt = Math.max(mergedCalendar.updatedAt || 0, lastModified || 0);
      const nextDocRevision = (currentData?.revision || 0) + 1;
      // activityLogs lives in its own subcollection now (see writeActivityLogsToFirestore) and
      // is never part of the calendar document itself. Any still-present legacy embedded
      // entries (from before this migration) are copied over the first time this calendar is
      // saved, self-healing without needing a separate one-off migration script. Validation and
      // the size guard below run against docCalendar (the actual write payload), not
      // mergedCalendar, so a large legacy activityLogs array being migrated away doesn't count
      // against the size limit it's no longer part of.
      const legacyActivityLogs = [
        ...(Array.isArray(serverCalendar?.activityLogs) ? serverCalendar.activityLogs : []),
        ...(Array.isArray(normalizedCal?.activityLogs) ? normalizedCal.activityLogs : [])
      ];
      // places/confirmedMeeting get the exact same self-healing subcollection migration as
      // activityLogs above, but gated behind ENABLE_PLACES_SUBCOLLECTION_MIGRATION (off by
      // default -- see its declaration) since it depends on firestore.rules' places/
      // confirmedMeetings subcollection rules actually being deployed first. Deduped by their own
      // key (id for places, date for meetings) since serverCalendar/normalizedCal can both still
      // carry legacy-embedded copies of an entry already migrated on a previous save.
      let legacyPlaces = [];
      let legacyConfirmedMeetings = [];
      let docCalendar = stripEmbeddedActivityLogsField(mergedCalendar);
      if (ENABLE_PLACES_SUBCOLLECTION_MIGRATION) {
        const legacyPlacesById = new Map();
        [...(Array.isArray(serverCalendar?.places) ? serverCalendar.places : []), ...(Array.isArray(normalizedCal?.places) ? normalizedCal.places : [])]
          .forEach(p => { if (p?.id) legacyPlacesById.set(p.id, p); });
        legacyPlaces = Array.from(legacyPlacesById.values());
        const legacyMeetingsByDate = new Map();
        [...(Array.isArray(serverCalendar?.confirmedMeeting) ? serverCalendar.confirmedMeeting : []), ...(Array.isArray(normalizedCal?.confirmedMeeting) ? normalizedCal.confirmedMeeting : [])]
          .forEach(m => { if (m?.date) legacyMeetingsByDate.set(m.date, m); });
        legacyConfirmedMeetings = Array.from(legacyMeetingsByDate.values());
        docCalendar = stripEmbeddedConfirmedMeetingField(stripEmbeddedPlacesField(docCalendar));
      }
      const validationError = validateCalendarShape(docCalendar);
      if (validationError) {
        const err = new Error(validationError);
        err.nonRetryable = true;
        throw err;
      }
      if (estimateCalendarDocWireBytes(docCalendar) > CALENDAR_DOC_SAFE_BYTE_LIMIT) {
        const err = new Error('캘린더 데이터가 너무 커져 더 이상 저장할 수 없습니다. 관리자에게 문의해 주세요.');
        err.nonRetryable = true;
        throw err;
      }
      const commitRes = await fetch('https://firestore.googleapis.com/v1/projects/metro-live-2918e/databases/(default)/documents:commit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          writes: [{
            update: {
              name: docPath,
              fields: {
                calendar: jsToFirestoreValue(docCalendar),
                lastModified: jsToFirestoreValue(lastModified),
                revision: jsToFirestoreValue(nextDocRevision)
              }
            },
            ...(currentDoc?.updateTime ? { currentDocument: { updateTime: currentDoc.updateTime } } : { currentDocument: { exists: false } })
          }]
        })
      });
      if (commitRes.ok) {
        const logsToPersist = [...legacyActivityLogs, ...(Array.isArray(newActivityLogs) ? newActivityLogs : [])];
        if (logsToPersist.length) {
          writeActivityLogsToFirestore(normalizedCal.id, logsToPersist).catch(e => console.warn('Activity log persist failed:', e));
        }
        if (legacyPlaces.length) {
          writePlacesToFirestore(normalizedCal.id, legacyPlaces).catch(e => console.warn('Places persist failed:', e));
        }
        if (legacyConfirmedMeetings.length) {
          writeConfirmedMeetingsToFirestore(normalizedCal.id, legacyConfirmedMeetings).catch(e => console.warn('Confirmed meetings persist failed:', e));
        }
        return true;
      }
      const errorText = await commitRes.text();
      if (!isRetryableFirestoreConflict(errorText) || attempt === retryCount) {
        throw new Error(errorText.slice(0, 500));
      }
      await new Promise(resolve => setTimeout(resolve, getFirestoreRetryDelay(attempt)));
    } catch (error) {
      if (error?.nonRetryable || attempt === retryCount) {
        console.warn(`Firestore REST fallback failed for cal_${normalizedCal.id}:`, error);
        return false;
      }
      await new Promise(resolve => setTimeout(resolve, getFirestoreRetryDelay(attempt)));
    }
  }
  return false;
}

// Pushes isolated calendar data to the durable master store and Firestore when available.
async function pushSingleCloudCalendar(targetCal, lastModified, retryCount = 18, allCalendars = null, saveMode = 'availability', newActivityLogs = []) {
  const normalizedCal = normalizeCalendarForSave(targetCal);
  if (!normalizedCal || !normalizedCal.id) return false;
  if (!isAllowedCalendarId(normalizedCal.id)) return false;
  if (!ENABLE_FIRESTORE_WRITES) {
    console.warn(`Blocked Firestore write for ${normalizedCal.id}: recovery read-only mode`);
    return false;
  }
  if (!ENABLE_FIRESTORE_SYNC) return false;
  if (firebaseDb) {
    let legacyActivityLogs = [];
    let legacyPlaces = [];
    let legacyConfirmedMeetings = [];
    // Set the instant the 8s timeout below fires, so a transaction that's still stuck on a slow
    // tx.get() (rather than genuinely offline) bails out cleanly instead of committing anyway
    // sometime after we've already moved on to the REST fallback below -- without this, both
    // writes could land (an orphaned transaction has no way to be cancelled once started), each
    // independently bumping revision and racing the other's optimistic-concurrency check.
    let raceLost = false;
    try {
      const ref = firebaseDb.collection('calendars').doc(`cal_${normalizedCal.id}`);
      await Promise.race([
	        firebaseDb.runTransaction(async tx => {
	          const snap = await tx.get(ref);
	          if (raceLost) throw new Error('Superseded by REST fallback after Firestore push timeout');
	          const currentData = snap.exists && snap.data() ? snap.data() : null;
	          const serverCalendar = currentData ? currentData.calendar : null;
	          let nextCalendar;
	          if (!serverCalendar) {
	            nextCalendar = normalizedCal;
	          } else if (saveMode === 'restore') {
	            nextCalendar = normalizedCal;
	          } else if (saveMode === 'replace') {
	            throw new Error(`Refusing to replace existing calendar ${normalizedCal.id}`);
	          } else if (saveMode === 'settings') {
	            nextCalendar = mergeCalendarSettingsDelta(serverCalendar, normalizedCal);
	          } else if (saveMode === 'polls') {
	            nextCalendar = mergeCalendarPollsDelta(serverCalendar, normalizedCal, lastModified);
	          } else {
	            nextCalendar = mergeCalendarAvailabilityDelta(serverCalendar, normalizedCal, lastModified);
	          }
	          const mergedCalendar = normalizeCalendarForSave(nextCalendar);
	          const nextDocRevision = (currentData?.revision || 0) + 1;
	          mergedCalendar.revision = Math.max(serverCalendar?.revision || 0, normalizedCal.revision || 0) + 1;
	          mergedCalendar.updatedAt = Math.max(mergedCalendar.updatedAt || 0, lastModified || 0);
	          // activityLogs lives in its own subcollection now -- see writeActivityLogsToFirestore
	          // below. Capture any still-present legacy embedded entries so they get copied over
	          // (self-healing migration) instead of silently disappearing on this overwrite.
	          // Validation and the size guard run against the stripped payload (the actual write),
	          // not mergedCalendar, so a legacy activityLogs array being migrated away doesn't
	          // count against a size limit it's no longer part of.
	          legacyActivityLogs = [
	            ...(Array.isArray(serverCalendar?.activityLogs) ? serverCalendar.activityLogs : []),
	            ...(Array.isArray(normalizedCal?.activityLogs) ? normalizedCal.activityLogs : [])
	          ];
	          // places/confirmedMeeting get the same self-healing subcollection migration as
	          // activityLogs above, gated behind ENABLE_PLACES_SUBCOLLECTION_MIGRATION (see its
	          // declaration) -- deduped by their own key since server/normalized can both still
	          // carry legacy-embedded copies of an entry already migrated on a prior save.
	          let docCalendar = stripEmbeddedActivityLogsField(mergedCalendar);
	          if (ENABLE_PLACES_SUBCOLLECTION_MIGRATION) {
	            const legacyPlacesById = new Map();
	            [...(Array.isArray(serverCalendar?.places) ? serverCalendar.places : []), ...(Array.isArray(normalizedCal?.places) ? normalizedCal.places : [])]
	              .forEach(p => { if (p?.id) legacyPlacesById.set(p.id, p); });
	            legacyPlaces = Array.from(legacyPlacesById.values());
	            const legacyMeetingsByDate = new Map();
	            [...(Array.isArray(serverCalendar?.confirmedMeeting) ? serverCalendar.confirmedMeeting : []), ...(Array.isArray(normalizedCal?.confirmedMeeting) ? normalizedCal.confirmedMeeting : [])]
	              .forEach(m => { if (m?.date) legacyMeetingsByDate.set(m.date, m); });
	            legacyConfirmedMeetings = Array.from(legacyMeetingsByDate.values());
	            docCalendar = stripEmbeddedConfirmedMeetingField(stripEmbeddedPlacesField(docCalendar));
	          }
	          const validationError = validateCalendarShape(docCalendar);
	          if (validationError) throw new Error(validationError);
	          if (estimateCalendarDocWireBytes(docCalendar) > CALENDAR_DOC_SAFE_BYTE_LIMIT) {
	            throw new Error('캘린더 데이터가 너무 커져 더 이상 저장할 수 없습니다. 관리자에게 문의해 주세요.');
	          }
	          tx.set(ref, {
	            calendar: docCalendar,
	            lastModified,
	            revision: nextDocRevision
	          });
	        }),
	        new Promise((_, reject) => setTimeout(() => { raceLost = true; reject(new Error('Firestore push timeout')); }, 8000))
	      ]);
	      const logsToPersist = [...legacyActivityLogs, ...(Array.isArray(newActivityLogs) ? newActivityLogs : [])];
	      if (logsToPersist.length) {
	        writeActivityLogsToFirestore(normalizedCal.id, logsToPersist).catch(e => console.warn('Activity log persist failed:', e));
	      }
	      if (legacyPlaces.length) {
	        writePlacesToFirestore(normalizedCal.id, legacyPlaces).catch(e => console.warn('Places persist failed:', e));
	      }
	      if (legacyConfirmedMeetings.length) {
	        writeConfirmedMeetingsToFirestore(normalizedCal.id, legacyConfirmedMeetings).catch(e => console.warn('Confirmed meetings persist failed:', e));
	      }
	      return true;
    } catch (e) {
      console.warn(`Firestore push notice for cal_${normalizedCal.id}:`, e);
    }
  }
  return pushSingleCalendarWithRest(normalizedCal, lastModified, saveMode, retryCount, newActivityLogs);
}
function loadLocalMeta() {
  return { lastModified: 0, byCalendar: {} };
}
function saveLocalMeta() {}

function getMetaLastModified(meta, calendarId) {
  if (!meta) return 0;
  if (calendarId && meta.byCalendar && typeof meta.byCalendar[calendarId] === 'number') {
    return meta.byCalendar[calendarId];
  }
  return typeof meta.lastModified === 'number' ? meta.lastModified : 0;
}

function updateMetaLastModified(meta, calendarId, lastModified) {
  const next = {
    ...(meta || {}),
    lastModified: Math.max(getMetaLastModified(meta), lastModified || 0),
    byCalendar: {
      ...((meta && meta.byCalendar) || {})
    }
  };
  if (calendarId) next.byCalendar[calendarId] = lastModified || 0;
  return next;
}

function isAdminDashboardRoute() {
  const params = new URLSearchParams(window.location.search);
  return params.get('admin') === '1' || params.get('mode') === 'admin';
}

function isAdminRestoreRoute() {
  const params = new URLSearchParams(window.location.search);
  return isAdminDashboardRoute() && params.get('restore') === '1';
}

function getAdminSelectedCalendarIdFromUrl(fallback = 'kkot') {
  if (!isAdminDashboardRoute()) return fallback;
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id') || '';
  return isValidCalendarId(id) ? id : fallback;
}

// Makes the admin 통합검색결과 page addressable/bookmarkable/back-button-navigable as its own
// URL (?admin=1&search=<query>) instead of only existing as in-memory component state.
function getAdminSearchQueryFromUrl() {
  if (!isAdminDashboardRoute()) return null;
  const params = new URLSearchParams(window.location.search);
  return params.get('search') || null;
}

// Same idea as getAdminSearchQueryFromUrl, for the 통합검색결과 page's 캘린더/기간 filters
// (?cal=<id|all>&from=<YYYY-MM-DD>&to=<YYYY-MM-DD>).
function getAdminSearchFilterFromUrl() {
  if (!isAdminDashboardRoute()) return { calFilter: 'all', dateStart: '', dateEnd: '' };
  const params = new URLSearchParams(window.location.search);
  return {
    calFilter: params.get('cal') || 'all',
    dateStart: params.get('from') || '',
    dateEnd: params.get('to') || ''
  };
}

function createDefaultCalendar(id) {
  const now = Date.now();
  return {
    id,
    title: `${id} 사모임 캘린더`,
    description: `${id} 멤버들의 참석 가능 일자를 표기해 주세요`,
    updatedAt: now,
    revision: 1,
    participants: [{
      id: `${id}_p1`,
      name: '참여자 1',
      color: '#EF4444',
      updatedAt: now
    }, {
      id: `${id}_p2`,
      name: '참여자 2',
      color: '#3B82F6',
      updatedAt: now
    }, {
      id: `${id}_p3`,
      name: '참여자 3',
      color: '#10B981',
      updatedAt: now
    }],
	    availabilities: [],
	    activityLogs: [],
	    polls: [],
	    expenseCategories: DEFAULT_EXPENSE_CATEGORIES,
	    places: [],
	    placeCategories: DEFAULT_PLACE_CATEGORIES,
	    settlementBaseBudget: 0,
	    deletedActivityLogIds: []
	  };
	}

function getMonthKey(dateStr) {
  return isValidDateString(dateStr) ? dateStr.slice(0, 7) : 'unknown';
}

function estimateFirestoreDocumentSize(calendar) {
  return new Blob([JSON.stringify({
    calendar,
    lastModified: calendar?.updatedAt || 0,
    revision: calendar?.revision || 0
  })]).size;
}

function estimateMonthlyOutboundBytes(calendarStats) {
  const totalDocBytes = calendarStats.reduce((sum, stat) => sum + stat.sizeBytes, 0);
  // 현재 앱은 접속 시 해당 캘린더 문서 1개와 관리자 화면의 전체 문서를 읽습니다.
  // 여유 산정을 위해 하루 60회 전체 로드 + 동시 편집 동기화 여유분을 더한 보수적 추정치입니다.
  return Math.round(totalDocBytes * 60 * 30 * 1.5);
}

function buildServiceUsageMetrics(calendarStats) {
  const totalStorageBytes = calendarStats.reduce((sum, stat) => sum + stat.sizeBytes, 0);
  const totalWritesPerFullRound = calendarStats.reduce((sum, stat) => sum + stat.schedules.length, 0);
  const monthlyOutboundBytes = estimateMonthlyOutboundBytes(calendarStats);
  return [{
    label: 'Firestore 저장공간',
    used: formatBytes(totalStorageBytes),
    limit: formatBytes(FIRESTORE_FREE_LIMITS.storageBytes),
    remaining: formatBytes(Math.max(0, FIRESTORE_FREE_LIMITS.storageBytes - totalStorageBytes)),
    percent: totalStorageBytes / FIRESTORE_FREE_LIMITS.storageBytes * 100,
    note: '운영 캘린더 문서 2개의 현재 JSON 크기 기준'
  }, {
    label: '단일 문서 최대치',
    used: `${Math.max(0, ...calendarStats.map(stat => stat.sizePercent)).toFixed(1)}%`,
    limit: formatBytes(FIRESTORE_FREE_LIMITS.documentBytes),
    remaining: '75% 이상부터 경고',
    percent: Math.max(0, ...calendarStats.map(stat => stat.sizePercent)),
    note: '캘린더 1개 문서가 커질수록 저장 실패 위험 증가'
  }, {
    label: 'Firestore 읽기',
    used: '접속당 1~2회',
    limit: `${FIRESTORE_FREE_LIMITS.readsPerDay.toLocaleString('ko-KR')}회/일`,
    remaining: '현재 규모 여유',
    percent: 0.2,
    note: '관리자 화면은 전체 캘린더 문서를 한 번에 읽음'
  }, {
    label: 'Firestore 쓰기',
    used: '저장당 1회',
    limit: `${FIRESTORE_FREE_LIMITS.writesPerDay.toLocaleString('ko-KR')}회/일`,
    remaining: '현재 규모 여유',
    percent: Math.min(100, totalWritesPerFullRound / FIRESTORE_FREE_LIMITS.writesPerDay * 100),
    note: '참여자 8명이 자주 입력해도 일 2만 회까지는 큰 여유'
  }, {
    label: 'Firestore 전송량',
    used: formatBytes(monthlyOutboundBytes),
    limit: `${formatBytes(FIRESTORE_FREE_LIMITS.outboundBytesPerMonth)}/월`,
    remaining: formatBytes(Math.max(0, FIRESTORE_FREE_LIMITS.outboundBytesPerMonth - monthlyOutboundBytes)),
    percent: monthlyOutboundBytes / FIRESTORE_FREE_LIMITS.outboundBytesPerMonth * 100,
    note: '보수적 월간 사용 추정치'
  }, {
    label: 'GitHub Pages',
    used: '정적 파일 배포',
    limit: `${formatBytes(GITHUB_PAGES_FREE_LIMITS.bandwidthBytesPerMonth)}/월`,
    remaining: '현재 규모 여유',
    percent: 0.1,
    note: `사이트 1GB, 기본 빌드 ${GITHUB_PAGES_FREE_LIMITS.buildsPerHour}회/시간 제한 기준`
  }];
}

function createCalendarBackupPayload(calendarsList, targetCalendarId = '') {
  const selected = targetCalendarId
    ? calendarsList.filter(calendar => calendar.id === targetCalendarId)
    : calendarsList.filter(calendar => isValidCalendarId(calendar.id));
  return {
    type: 'gather-calendar-backup',
    version: 1,
    exportedAt: new Date().toISOString(),
    projectId: firebaseConfig.projectId,
    calendarIds: selected.map(calendar => calendar.id),
    calendars: selected.map(calendar => ({
      docId: `cal_${calendar.id}`,
      data: {
        calendar: normalizeCalendarForSave(calendar),
        lastModified: calendar.updatedAt || Date.now(),
        revision: calendar.revision || 0
      }
    }))
  };
}

function downloadJsonFile(filename, payload) {
  const blob = new Blob([`${JSON.stringify(payload, null, 2)}\n`], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function downloadTextFile(filename, content, mimeType) {
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

// Minimal RFC 5545 (.ics) export for a single confirmed-meeting date -- an all-day VEVENT with
// the calendar's title as SUMMARY and any admin note / participant memos folded into
// DESCRIPTION, so a confirmed date can be dropped straight into Google/Apple/Outlook Calendar.
function escapeICSText(text) {
  return String(text || '').replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
}

function formatICSDateOnly(dateStr) {
  return dateStr.replace(/-/g, '');
}

function addDaysToDateStr(dateStr, days) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + days);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function buildICSTimestamp() {
  const now = new Date();
  const pad = n => String(n).padStart(2, '0');
  return `${now.getUTCFullYear()}${pad(now.getUTCMonth() + 1)}${pad(now.getUTCDate())}T${pad(now.getUTCHours())}${pad(now.getUTCMinutes())}${pad(now.getUTCSeconds())}Z`;
}

// Wraps one VEVENT per {dateStr, description} entry in a single VCALENDAR, so every confirmed
// meeting for a calendar can be imported at once instead of one file per date.
function buildCalendarConfirmedMeetingsICS(calendar, events) {
  const dtstamp = buildICSTimestamp();
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//모여라 캘린더//KO', 'CALSCALE:GREGORIAN'];
  events.forEach(({ dateStr, description }) => {
    lines.push(
      'BEGIN:VEVENT',
      `UID:${calendar.id}_${dateStr}@moyeora-calendar`,
      `DTSTAMP:${dtstamp}`,
      `DTSTART;VALUE=DATE:${formatICSDateOnly(dateStr)}`,
      `DTEND;VALUE=DATE:${formatICSDateOnly(addDaysToDateStr(dateStr, 1))}`,
      `SUMMARY:${escapeICSText(`${calendar.title} 모임`)}`
    );
    if (description) lines.push(`DESCRIPTION:${escapeICSText(description)}`);
    lines.push('END:VEVENT');
  });
  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

// Per-date description: the admin's own confirmation note plus every participant's memo for
// that date, same content the old per-row export used to show.
function buildConfirmedMeetingDescription(calendar, dateStr) {
  const meeting = getTrulyConfirmedMeetings(calendar).find(m => m.date === dateStr);
  const participantsMap = getActiveParticipants(calendar).reduce((acc, p) => {
    acc[p.id] = p;
    return acc;
  }, {});
  const memoLines = getActiveAvailabilities(calendar)
    .filter(item => item.date === dateStr && item.note && item.note.trim())
    .map(item => `${participantsMap[item.participantId]?.name || ''}: ${item.note}`.trim())
    .join('\n');
  return [meeting?.note, memoLines].filter(Boolean).join('\n\n');
}

function exportCalendarConfirmedMeetingsToICS(calendar) {
  const dates = getTrulyConfirmedMeetings(calendar).map(m => m.date).sort();
  const events = dates.map(dateStr => ({ dateStr, description: buildConfirmedMeetingDescription(calendar, dateStr) }));
  const ics = buildCalendarConfirmedMeetingsICS(calendar, events);
  downloadTextFile(`${calendar.id}_confirmed_meetings.ics`, ics, 'text/calendar');
}

function extractCalendarsFromBackup(payload) {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (payload.calendar) return [payload.calendar];
  if (payload.data?.calendar) return [payload.data.calendar];
  if (Array.isArray(payload.calendars)) {
    return payload.calendars.map(item => item?.data?.calendar || item?.calendar || item).filter(Boolean);
  }
  return [];
}

function validateBackupCalendars(calendarsList) {
  const normalized = calendarsList
    .map(normalizeCalendarForSave)
    .filter(calendar => calendar && isValidCalendarId(calendar.id));
  const uniqueById = new Map();
  normalized.forEach(calendar => uniqueById.set(calendar.id, calendar));
  const result = Array.from(uniqueById.values());
  if (result.length === 0) return { calendars: [], error: '복구 가능한 데이터 없음' };
  for (const calendar of result) {
    const validationError = validateCalendarShape(calendar);
    if (validationError) return { calendars: [], error: `${calendar.id}: ${validationError}` };
    if (!assertCalendarLinks(calendar)) return { calendars: [], error: `${calendar.id}: 참여자·일정 연결 오류` };
  }
  return { calendars: result, error: '' };
}

function buildAdminDashboardMetrics(calendarsList) {
  // Built from local date components (not toISOString, which is always UTC) so "today"
  // matches the browser's local calendar day -- toISOString() would be a day behind for
  // roughly 9 hours every day for KST users (UTC+9), wrongly counting yesterday's
  // schedules as still upcoming during that window.
  const todayDate = new Date();
  const todayStr = `${todayDate.getFullYear()}-${String(todayDate.getMonth() + 1).padStart(2, '0')}-${String(todayDate.getDate()).padStart(2, '0')}`;
  const calendarStats = calendarsList.map(cal => {
    const participants = getActiveParticipants(cal);
    const participantIds = new Set(participants.map(participant => participant.id));
    const schedules = getActiveAvailabilities(cal);
    const polls = getCalendarPolls(cal);
    const pollMetrics = polls.reduce((acc, poll) => {
      const options = getActivePollOptions(poll);
      const optionIds = new Set(options.map(option => option.id));
      const votes = normalizePollVotes(poll.votes || {}, optionIds, participantIds);
      acc.optionCount += options.length;
      Object.values(votes).forEach(voterIds => {
        acc.voteCount += voterIds.length;
        voterIds.forEach(participantId => acc.voterIds.add(participantId));
      });
      return acc;
    }, { optionCount: 0, voteCount: 0, voterIds: new Set() });
    const dateBuckets = new Map();
    const monthBuckets = new Map();
    const participantBuckets = new Map(participants.map(participant => [participant.id, {
      ...participant,
      count: 0,
      memoCount: 0,
      upcomingCount: 0,
      latestDate: ''
    }]));
    let memoCount = 0;
    schedules.forEach(item => {
      if (!dateBuckets.has(item.date)) dateBuckets.set(item.date, []);
      dateBuckets.get(item.date).push(item);
      const monthKey = getMonthKey(item.date);
      monthBuckets.set(monthKey, (monthBuckets.get(monthKey) || 0) + 1);
      const participantStat = participantBuckets.get(item.participantId);
      if (participantStat) {
        participantStat.count += 1;
        if (item.date >= todayStr) participantStat.upcomingCount += 1;
        if (!participantStat.latestDate || item.date > participantStat.latestDate) participantStat.latestDate = item.date;
        if (item.note) participantStat.memoCount += 1;
      }
      if (item.note) memoCount += 1;
    });
    const fullDates = Array.from(dateBuckets.entries())
      .filter(([, items]) => participants.length > 0 && new Set(items.map(item => item.participantId)).size >= participants.length)
      .map(([date, items]) => ({ date, count: items.length }))
      .sort((a, b) => a.date.localeCompare(b.date));
    const popularDates = Array.from(dateBuckets.entries())
      .map(([date, items]) => ({ date, count: new Set(items.map(item => item.participantId)).size }))
      .sort((a, b) => b.count - a.count || a.date.localeCompare(b.date))
      .slice(0, 8);
    const participantStats = Array.from(participantBuckets.values())
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
    const monthStats = Array.from(monthBuckets.entries())
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => a.month.localeCompare(b.month));
    const storedAvailabilities = Array.isArray(cal.availabilities) ? cal.availabilities.length : 0;
    const deletedCount = storedAvailabilities - schedules.length;
    const sizeBytes = estimateFirestoreDocumentSize(cal);
    const confirmedCount = getTrulyConfirmedMeetings(cal).length;
    return {
      calendar: cal,
      participants,
      schedules,
      pollCount: polls.length,
      pollOptionCount: pollMetrics.optionCount,
      pollVoteCount: pollMetrics.voteCount,
      pollVoterCount: pollMetrics.voterIds.size,
      confirmedCount,
      dateCount: dateBuckets.size,
      upcomingCount: schedules.filter(item => item.date >= todayStr).length,
      pastCount: schedules.filter(item => item.date < todayStr).length,
      memoCount,
      fullDates,
      popularDates,
      participantStats,
      monthStats,
      storedAvailabilities,
      deletedCount,
      sizeBytes,
      sizePercent: Math.round(sizeBytes / 1048576 * 1000) / 10
    };
  });
  const allSchedules = calendarStats.flatMap(stat => stat.schedules.map(item => ({ ...item, calendarId: stat.calendar.id })));
  const totalParticipants = calendarStats.reduce((sum, stat) => sum + stat.participants.length, 0);
  const totalSchedules = allSchedules.length;
  const totalPolls = calendarStats.reduce((sum, stat) => sum + stat.pollCount, 0);
  const totalPollOptions = calendarStats.reduce((sum, stat) => sum + stat.pollOptionCount, 0);
  const totalPollVotes = calendarStats.reduce((sum, stat) => sum + stat.pollVoteCount, 0);
  const totalConfirmedMeetings = calendarStats.reduce((sum, stat) => sum + stat.confirmedCount, 0);
  const uniqueDateCount = new Set(allSchedules.map(item => `${item.calendarId}_${item.date}`)).size;
  const upcomingCount = allSchedules.filter(item => item.date >= todayStr).length;
  const memoCount = allSchedules.filter(item => item.note).length;
  const maxSchedules = Math.max(1, ...calendarStats.map(stat => stat.schedules.length));
  const maxMonthCount = Math.max(1, ...calendarStats.flatMap(stat => stat.monthStats.map(item => item.count)));
  const qualityWarnings = calendarStats.flatMap(stat => {
    const warnings = [];
    if (stat.sizePercent >= 75) warnings.push(`${stat.calendar.id}: Firestore 문서 크기 ${stat.sizePercent}%`);
    if (stat.deletedCount > 200) warnings.push(`${stat.calendar.id}: 삭제 이력 ${stat.deletedCount}건 보존 중`);
    if (stat.participants.length === 0) warnings.push(`${stat.calendar.id}: 활성 참여자 없음`);
    if (stat.schedules.some(item => !stat.participants.some(participant => participant.id === item.participantId))) {
      warnings.push(`${stat.calendar.id}: 참여자와 연결되지 않은 일정 존재`);
    }
    return warnings;
  });
  return {
    calendarStats,
    totalParticipants,
    totalSchedules,
    totalPolls,
    totalPollOptions,
    totalPollVotes,
    totalConfirmedMeetings,
    uniqueDateCount,
    upcomingCount,
    memoCount,
    maxSchedules,
    maxMonthCount,
    qualityWarnings,
    serviceUsage: buildServiceUsageMetrics(calendarStats)
  };
}

const CALENDAR_ACCENT_PALETTE = Array.isArray(GATHER_APP_CONSTANTS.CALENDAR_ACCENT_PALETTE) ? GATHER_APP_CONSTANTS.CALENDAR_ACCENT_PALETTE : ['#F97316', '#3B82F6', '#8B5CF6', '#10B981', '#EC4899', '#F59E0B'];
function getCalendarAccentColor(calOrId, indexInList) {
  const cal = calOrId && typeof calOrId === 'object' ? calOrId : null;
  if (cal && typeof cal.accentColor === 'string' && /^#[0-9a-fA-F]{6}$/.test(cal.accentColor)) {
    return cal.accentColor;
  }
  const calId = cal ? cal.id : calOrId;
  const knownIndex = PUBLIC_CALENDAR_IDS.indexOf(calId);
  const idx = knownIndex >= 0 ? knownIndex : indexInList;
  return CALENDAR_ACCENT_PALETTE[idx % CALENDAR_ACCENT_PALETTE.length];
}

/* Small dependency-free donut chart: N segments as SVG stroke-dasharray arcs on a ring. */


function AdminDashboard(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.AdminDashboard;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}


function AdminModal(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.AdminModal;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function AdminUnifiedSearchResultsView(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.AdminUnifiedSearchResultsView;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function AdminCreateCalendarModal(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.AdminCreateCalendarModal;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function AdminRestorePhraseModal(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.AdminRestorePhraseModal;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function AdminUnifiedSearchModal(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.AdminUnifiedSearchModal;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}






function App() {
  normalizeCalendarUrlParams();
  const [calendars, setCalendarsState] = React.useState(() => loadLocalCache());
  const [toast, setToast] = React.useState(null);
  const [operationProgress, setOperationProgress] = React.useState(null);
  const toastTimeoutRef = React.useRef(null);
  const operationTimersRef = React.useRef({ delay: null, interval: null, hide: null });
  const clearOperationTimers = () => {
    const timers = operationTimersRef.current;
    if (timers.delay) clearTimeout(timers.delay);
    if (timers.interval) clearInterval(timers.interval);
    if (timers.hide) clearTimeout(timers.hide);
    operationTimersRef.current = { delay: null, interval: null, hide: null };
  };
  React.useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
      clearOperationTimers();
    };
  }, []);

  const showToast = (message, type = 'info', duration = 3000) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToast({
      message,
      type
    });
    toastTimeoutRef.current = setTimeout(() => {
      setToast(t => t?.message === message ? null : t);
    }, duration);
  };

  const runWithOperationProgress = async ({ title, detail, delay = 1000 } = {}, task) => {
    if (typeof task !== 'function') return undefined;
    const id = `op_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    let shown = false;
    let pct = 12;
    const finishSoon = () => {
      clearOperationTimers();
      if (!shown) return;
      setOperationProgress(prev => prev?.id === id ? { ...prev, pct: 100, detail: '마무리 중입니다...' } : prev);
      operationTimersRef.current.hide = setTimeout(() => {
        setOperationProgress(prev => prev?.id === id ? null : prev);
      }, 350);
    };
    clearOperationTimers();
    operationTimersRef.current.delay = setTimeout(() => {
      shown = true;
      setOperationProgress({ id, title: title || '작업 처리 중...', detail: detail || '서버에 반영하고 있습니다.', pct });
      operationTimersRef.current.interval = setInterval(() => {
        pct = Math.min(92, pct + (pct < 55 ? 9 : pct < 80 ? 5 : 2));
        setOperationProgress(prev => prev?.id === id ? { ...prev, pct } : prev);
      }, 650);
    }, delay);
    try {
      return await task();
    } finally {
      finishSoon();
    }
  };

  React.useEffect(() => {
    const motionQuery = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    const interactiveSelector = [
      'button',
      '.day-cell',
      '.date-item-btn',
      '.poll-card',
      '.poll-option-row',
      '.recent-log-row',
      '.search-result-row',
      '.bottom-sheet-item',
      '.poll-voter-option',
      '[role="button"]'
    ].join(',');

    const handlePointerDown = event => {
      const target = event.target?.closest?.(interactiveSelector);
      if (!target || target.closest('.admin-scope')) return;
      target.classList.add('is-pressing');
      window.setTimeout(() => target.classList.remove('is-pressing'), 170);

      if (motionQuery?.matches || target.matches('input, textarea, select')) return;
      const rect = target.getBoundingClientRect();
      const ripple = document.createElement('span');
      ripple.className = 'motion-ripple';
      ripple.style.setProperty('--ripple-x', `${event.clientX - rect.left}px`);
      ripple.style.setProperty('--ripple-y', `${event.clientY - rect.top}px`);
      target.appendChild(ripple);
      ripple.addEventListener('animationend', () => ripple.remove(), { once: true });
    };

    document.addEventListener('pointerdown', handlePointerDown, { passive: true });
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, []);

  // ---- Generic Confirm Dialog ----
  const [confirmDialog, setConfirmDialog] = React.useState(null);
  const showConfirmDialog = (title, message, onConfirm, showPasswordInput = false) => {
    setConfirmDialog({
      title,
      message,
      onConfirm: () => {
        setConfirmDialog(null);
        onConfirm();
      },
      showPasswordInput
    });
  };

  const isSavingRef = React.useRef(false);
  const serverRevisionRef = React.useRef(loadLocalMeta());

  const applyServerCalendars = (serverCalendars, lastModified = Date.now()) => {
    const normalized = cloneCalendarList(serverCalendars).map(normalizeCalendarForSave);
    if (normalized.length === 0) return;
    normalized.forEach((calendar) => {
      serverRevisionRef.current = updateMetaLastModified(serverRevisionRef.current, calendar.id, lastModified);
    });
    setCalendarsState(normalized);
    saveLocalCache(normalized);
    saveLocalMeta(serverRevisionRef.current);
  };

  const updateCalendars = async (nextCalendars, toastMsg = '저장완료', toastType = 'success', targetCalId = activeCalId, saveMode = 'availability', newActivityLogs = []) => {
    let previousCalendars = null;
    try {
      if (!isAllowedCalendarId(targetCalId)) {
        showToast('캘린더 ID 오류', 'error');
        return false;
      }
      const requestedId = getCalendarIdFromURL();
      if (requestedId && requestedId !== targetCalId) {
        showToast('캘린더 불일치', 'error');
        return false;
      }
      const now = Date.now();
      const normalizedCalendars = cloneCalendarList(nextCalendars).map(normalizeCalendarForSave);

      const currentCal = normalizedCalendars.find(c => c.id === targetCalId) || null;
      if (!currentCal) {
        console.warn('Active calendar not found during save:', targetCalId);
        showToast('캘린더 없음', 'error');
        return false;
      }

      isSavingRef.current = true;
      previousCalendars = calendars;
      setCalendarsState(normalizedCalendars);
      const progressTitle = saveMode === 'polls'
        ? '투표 저장 중...'
        : saveMode === 'settings'
        ? '설정 저장 중...'
        : saveMode === 'replace'
        ? '캘린더 저장 중...'
        : saveMode === 'restore'
        ? '데이터 복구 중...'
        : '일정 저장 중...';
      const saved = await runWithOperationProgress({
        title: progressTitle,
        detail: `${currentCal.title || currentCal.id} 데이터를 Firebase에 반영하고 있습니다.`
      }, () => pushSingleCloudCalendar(currentCal, now, 18, normalizedCalendars, saveMode, newActivityLogs));
      if (!saved) {
        console.warn('Cloud save failed for calendar:', currentCal.id);
        if (previousCalendars) setCalendarsState(previousCalendars);
        showToast('저장 실패', 'error');
        return false;
      }

      serverRevisionRef.current = updateMetaLastModified(serverRevisionRef.current, currentCal.id, now);
      saveLocalCache(normalizedCalendars);
      saveLocalMeta(serverRevisionRef.current);
      showToast(toastMsg, toastType, 3000);
      return true;
    } catch (err) {
      console.error('updateCalendars failed:', err);
      if (previousCalendars) setCalendarsState(previousCalendars);
      showToast('저장 실패', 'error');
      return false;
    } finally {
      isSavingRef.current = false;
    }
  };
  const [activeCalId, setActiveCalId] = React.useState(() => {
    const requestedId = getCalendarIdFromURL();
    return requestedId && isAllowedCalendarId(requestedId) ? requestedId : 'kkot';
  });
  const [currentMonthDate, setCurrentMonthDate] = React.useState(new Date());
  const [selectedDate, setSelectedDate] = React.useState(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isAdminOpen, setIsAdminOpen] = React.useState(false);
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = React.useState(false);
  const [globalSearchInitialQuery, setGlobalSearchInitialQuery] = React.useState('');

  // Theme, font size, and (below) chat notifications are per-calendar preferences, not
  // per-browser -- someone managing several calendars can want dark mode on one and not
  // another. Storage keys are scoped by activeCalId, and both re-read from that calendar's own
  // key whenever activeCalId changes (handleSelectCalendar switches it without a full page
  // reload, so a plain useState initializer alone wouldn't pick up the new calendar's saved
  // choice).
  //
  // Theme toggle -- mirrors the choice the early <head> theme-init script already applied
  // before first paint, so this state starts in sync with whatever's on <html> rather than
  // flashing to a default and then correcting itself.
  const readThemeForCalendar = (calId) => {
    if (!calId) return 'system';
    try {
      const saved = getLocalStorage().getItem(`gather_theme_preference_${calId}_v1`);
      return saved === 'dark' || saved === 'light' ? saved : 'system';
    } catch (e) {
      return 'system';
    }
  };
  const applyThemeChoice = (choice) => {
    if (choice === 'dark' || choice === 'light') {
      document.documentElement.setAttribute('data-theme', choice);
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  };
  const [themeChoice, setThemeChoice] = React.useState(() => {
    if (isAdminDashboardRoute()) return 'light';
    return readThemeForCalendar(activeCalId);
  });
  const toggleTheme = () => {
    if (isAdminDashboardRoute() || !activeCalId) return;
    const isDark = themeChoice === 'dark' || (themeChoice === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    const next = isDark ? 'light' : 'dark';
    getLocalStorage().setItem(`gather_theme_preference_${activeCalId}_v1`, next);
    applyThemeChoice(next);
    setThemeChoice(next);
  };
  const isDarkTheme = !isAdminDashboardRoute() && (themeChoice === 'dark' || (themeChoice === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches));
  const isFirstCalIdRenderRef = React.useRef(true);
  React.useEffect(() => {
    if (isAdminDashboardRoute()) {
      applyThemeChoice('light');
      setThemeChoice('light');
      return;
    }
    const next = readThemeForCalendar(activeCalId);
    applyThemeChoice(next);
    setThemeChoice(next);
    isFirstCalIdRenderRef.current = false;
  }, [activeCalId]);

  // Text-size preference, relative to the browser's own default (100%).
  const readFontScaleForCalendar = (calId) => {
    if (!calId) return 100;
    const calScale = getLocalStorage().getItem(`gather_font_scale_${calId}_v1`);
    if (calScale) return Number(calScale) || 100;
    return 100;
  };
  const [fontScalePercent, setFontScalePercent] = React.useState(() => {
    if (isAdminDashboardRoute()) return 100;
    return readFontScaleForCalendar(activeCalId);
  });
  const skipNextFontWriteRef = React.useRef(false);
  React.useEffect(() => {
    if (isAdminDashboardRoute()) {
      document.documentElement.style.fontSize = '';
      return;
    }
    document.documentElement.style.fontSize = `${fontScalePercent}%`;
    if (skipNextFontWriteRef.current) {
      skipNextFontWriteRef.current = false;
      return;
    }
    if (!activeCalId) return;
    getLocalStorage().setItem(`gather_font_scale_${activeCalId}_v1`, String(fontScalePercent));
  }, [fontScalePercent, activeCalId]);
  React.useEffect(() => {
    if (isAdminDashboardRoute()) {
      document.documentElement.style.fontSize = '';
      setFontScalePercent(100);
      return;
    }
    skipNextFontWriteRef.current = true;
    setFontScalePercent(readFontScaleForCalendar(activeCalId));
  }, [activeCalId]);

  const [mainNotifPermission, setMainNotifPermission] = React.useState(() => (isNotificationSupported() ? Notification.permission : 'unsupported'));
  const [mainChatNotifyEnabled, setMainChatNotifyEnabled] = React.useState(() => isChatNotifyEnabledForCalendar(activeCalId));
  React.useEffect(() => {
    setMainChatNotifyEnabled(isChatNotifyEnabledForCalendar(activeCalId));
    setMainNotifPermission(isNotificationSupported() ? Notification.permission : 'unsupported');
  }, [activeCalId]);
  const getCurrentChatParticipantId = () => {
    if (chatParticipantIdRef.current) return chatParticipantIdRef.current;
    return ((window.GATHER_APP_NOTIFICATIONS||{}).getStoredChatParticipantId||(()=>undefined))(activeCalId, activeCal);
  };
  const openNotificationHelp = () => {
    setIsNotificationHelpOpen(true);
  };
  const handleMainToggleNotifications = async () => {
    if (!isNotificationSupported()) {
      showToast('알림 미지원 브라우저', 'error');
      openNotificationHelp();
      return;
    }
    if (Notification.permission === 'granted') {
      const next = !mainChatNotifyEnabled;
      if (next) {
        // iOS reports Notification.permission as 'granted' even in a regular (non-installed)
        // Safari/Chrome/Firefox tab, where push can never actually arrive -- probe before
        // trusting that flag, same as the other two chat-notification toggles in this app
        // already do (ChatRoomView/CommentsSection, AdminModal 일반 tab). This one was the odd
        // one out, missing the probe entirely -- which is exactly the side-menu switch most
        // people reach for first, and exactly why "I turned it on but nothing ever arrives"
        // reports kept coming from iPhone/iPad users regardless of what they toggled.
        const capability = await probeNotificationCapability();
        if (!capability.ok) {
          setMainNotifPermission('unsupported');
          openNotificationHelp();
          showToast(capability.reason === 'ios-not-installed' ? 'iOS는 홈 화면에 추가한 앱에서만 채팅알림을 받을 수 있습니다.' : '이 환경에서는 채팅알림을 받을 수 없습니다.', 'error', 6000);
          return;
        }
      }
      setMainChatNotifyEnabled(next);
      setChatNotifyEnabledForCalendar(activeCalId, next);
      if (next) {
        const result = await subscribeUserToPushWithPermission(activeCalId, getCurrentChatParticipantId());
        if (result && !result.ok) {
          setMainChatNotifyEnabled(false);
          setChatNotifyEnabledForCalendar(activeCalId, false);
          if (result.reason === 'permission-not-granted') {
            openNotificationHelp();
          }
          showToast(`푸시 등록 실패: ${describePushSubscribeFailure(result.reason)}`, 'error', 6000);
          console.warn('Main chat notification subscribe failed:', result.reason);
          return;
        }
      } else {
        await unsubscribeUserFromPush(activeCalId);
      }
      showToast(next ? '이 캘린더 채팅 알림 켜짐' : '이 캘린더 채팅 알림 꺼짐', 'success');
      return;
    }
    if (Notification.permission === 'denied') {
      openNotificationHelp();
      showToast('브라우저 설정에서 알림 허용 필요', 'error', 6000);
      return;
    }
    const result = await ensureChatNotificationPermission();
    setMainNotifPermission(result);
    if (result !== 'granted') {
      openNotificationHelp();
      showToast('알림 권한을 허용해야 채팅알림을 받을 수 있습니다.', 'error', 6000);
      return;
    }
    const capability = await probeNotificationCapability();
    if (!capability.ok) {
      setMainNotifPermission('unsupported');
      openNotificationHelp();
      showToast(capability.reason === 'ios-not-installed' ? 'iOS는 홈 화면에 추가한 앱에서만 채팅알림을 받을 수 있습니다.' : '이 브라우저에서는 알림을 표시할 수 없습니다.', 'error', 6000);
      return;
    }
    setChatNotifyEnabledForCalendar(activeCalId, true);
    setMainChatNotifyEnabled(true);
    const subscribeResult = await subscribeUserToPushWithPermission(activeCalId, getCurrentChatParticipantId());
    if (subscribeResult && !subscribeResult.ok) {
      setMainChatNotifyEnabled(false);
      setChatNotifyEnabledForCalendar(activeCalId, false);
      if (subscribeResult.reason === 'permission-not-granted') {
        openNotificationHelp();
      }
      showToast(`푸시 등록 실패: ${describePushSubscribeFailure(subscribeResult.reason)}`, 'error', 6000);
      console.warn('Main chat notification subscribe failed:', subscribeResult.reason);
      return;
    }
    showToast('이 캘린더 채팅 알림 켜짐', 'success');
  };

  const [adminActivityLogs, setAdminActivityLogs] = React.useState([]);
  const [isShareOpen, setIsShareOpen] = React.useState(false);
  const [isChatShareOpen, setIsChatShareOpen] = React.useState(false);
  const [isPlacesShareOpen, setIsPlacesShareOpen] = React.useState(false);
  const [isMainSideMenuOpen, setIsMainSideMenuOpen] = React.useState(false);
  const [isNotificationHelpOpen, setIsNotificationHelpOpen] = React.useState(false);
  const [isPollModalOpen, setIsPollModalOpen] = React.useState(false);
  const [editingPoll, setEditingPoll] = React.useState(null);
  const [voteTarget, setVoteTarget] = React.useState(null);
  const [isGuideOpen, setIsGuideOpen] = React.useState(false);
  const [isAnniversariesOpen, setIsAnniversariesOpen] = React.useState(false);
  const [isInitialDataLoading, setIsInitialDataLoading] = React.useState(() => Boolean(firebaseDb));
  const initialLoadOverlayTimerRef = React.useRef(null);
  const initialLoadOverlayIntervalRef = React.useRef(null);
  React.useEffect(() => {
    if (initialLoadOverlayTimerRef.current) clearTimeout(initialLoadOverlayTimerRef.current);
    if (initialLoadOverlayIntervalRef.current) clearInterval(initialLoadOverlayIntervalRef.current);
    initialLoadOverlayTimerRef.current = null;
    initialLoadOverlayIntervalRef.current = null;
    if (!isInitialDataLoading) {
      setOperationProgress(prev => prev?.id === 'initial-load' ? null : prev);
      return;
    }
    let pct = 18;
    initialLoadOverlayTimerRef.current = setTimeout(() => {
      setOperationProgress({
        id: 'initial-load',
        title: '캘린더 데이터 로딩 중...',
        detail: 'Firebase에서 최신 캘린더와 채팅 데이터를 불러오고 있습니다.',
        pct
      });
      initialLoadOverlayIntervalRef.current = setInterval(() => {
        pct = Math.min(92, pct + (pct < 60 ? 7 : 3));
        setOperationProgress(prev => prev?.id === 'initial-load' ? { ...prev, pct } : prev);
      }, 700);
    }, 1000);
    return () => {
      if (initialLoadOverlayTimerRef.current) clearTimeout(initialLoadOverlayTimerRef.current);
      if (initialLoadOverlayIntervalRef.current) clearInterval(initialLoadOverlayIntervalRef.current);
    };
  }, [isInitialDataLoading, activeCalId]);

  // Main header: fixed full-width bar with a menu row, hides on scroll-down and reappears on
  // scroll-up (same behavior as the chat room header). Refs below are scroll targets for the
  // 일정잡기/투표하기 menu items; mainHeaderRef measures its own height for the scroll offset
  // (so the fixed header doesn't cover the section being scrolled to).
  const [isMainHeaderVisible, setIsMainHeaderVisible] = React.useState(true);
  const mainHeaderRef = React.useRef(null);
  const calendarSectionRef = React.useRef(null);
  const pollsSectionRef = React.useRef(null);
  const [pollsExpandSignal, setPollsExpandSignal] = React.useState(0);
  const lastMainScrollTopRef = React.useRef(0);
  React.useEffect(() => {
    const handleMainScroll = () => {
      const scrollTop = window.scrollY;
      const lastScrollTop = lastMainScrollTopRef.current;
      if (scrollTop < 10) {
        setIsMainHeaderVisible(true);
      } else if (scrollTop > lastScrollTop && scrollTop > 56) {
        setIsMainHeaderVisible(false);
      } else if (scrollTop < lastScrollTop) {
        setIsMainHeaderVisible(true);
      }
      lastMainScrollTopRef.current = scrollTop;
    };
    window.addEventListener('scroll', handleMainScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleMainScroll);
  }, []);
  const scrollToSection = (ref) => {
    if (!ref.current) return;
    const headerHeight = mainHeaderRef.current ? mainHeaderRef.current.offsetHeight : 0;
    const top = ref.current.getBoundingClientRect().top + window.scrollY - headerHeight - 12;
    window.scrollTo({ top, behavior: 'smooth' });
  };
  // Chat-related states
  const [chatMessages, setChatMessages] = React.useState([]);
  const [olderChatMessages, setOlderChatMessages] = React.useState([]);
  const [hasMoreOlderChat, setHasMoreOlderChat] = React.useState(true);
  const [loadingOlderChat, setLoadingOlderChat] = React.useState(false);
  const [totalChatCount, setTotalChatCount] = React.useState(null);
  const [totalMemoCount, setTotalMemoCount] = React.useState(null);
  const [totalGalleryCount, setTotalGalleryCount] = React.useState(null);
  const [galleryPreviewMessages, setGalleryPreviewMessages] = React.useState([]);
  const loadingOlderChatRef = React.useRef(false);
  const allChatMessages = React.useMemo(() => {
    const byId = new Map();
    (olderChatMessages || []).forEach(m => { if (m && m.id) byId.set(m.id, m); });
    (chatMessages || []).forEach(m => { if (m && m.id) byId.set(m.id, m); });
    return Array.from(byId.values()).sort((a, b) => Number(a.timestamp || 0) - Number(b.timestamp || 0));
  }, [olderChatMessages, chatMessages]);
  const recentMessages = React.useMemo(() => allChatMessages.slice(-5).reverse(), [allChatMessages]);
  const [memos, setMemos] = React.useState([]);
  const [memosLimit, setMemosLimit] = React.useState(MEMOS_PAGE_SIZE);
  const [hasMoreMemos, setHasMoreMemos] = React.useState(false);
  // A memo shared via its own ?view=memo&memo=<id> link (see MemoShareModal) may be older than
  // the paginated `memos` window above, so it needs its own direct-by-id fetch rather than
  // relying on it already being present in that list.
  const [sharedMemo, setSharedMemo] = React.useState(null);
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const share = parseSharePathFromLocation();
    const memoParam = (share && share.memoId) || params.get('memo');
    if (!memoParam || !activeCalId) {
      setSharedMemo(null);
      return;
    }
    let isMounted = true;
    (async () => {
      try {
        if (firebaseDb) {
          const doc = await firebaseDb.collection('calendars').doc(`cal_${activeCalId}`).collection('memos').doc(memoParam).get();
          if (isMounted && doc.exists) setSharedMemo({ id: doc.id, ...doc.data() });
        } else {
          const res = await fetch(`https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/calendars/cal_${activeCalId}/memos/${memoParam}`);
          if (res.ok && isMounted) setSharedMemo({ id: memoParam, ...firestoreDocumentToJs(await res.json()) });
        }
      } catch (e) {
        console.warn('Failed to fetch shared memo:', e);
      }
    })();
    return () => { isMounted = false; };
  }, [activeCalId, firebaseDb]);
  const [anniversaries, setAnniversaries] = React.useState([]);
  // Live subcollection state for places/confirmedMeeting (see unionPlaces/unionConfirmedMeetings
  // and the effect below) -- unlike activityLogs (only fetched on-demand for the recovery UI),
  // these two feed many always-visible surfaces (calendar grid badges, summary banners, place
  // map, settlement), so they need a live listener merged into activeCal itself, not a
  // fetch-on-open pattern.
  const [placesSubcollection, setPlacesSubcollection] = React.useState([]);
  const [confirmedMeetingsSubcollection, setConfirmedMeetingsSubcollection] = React.useState([]);
  const [chatInput, setChatInput] = React.useState('');
  const [chatParticipantId, setChatParticipantId] = React.useState('');
  const chatParticipantIdRef = React.useRef(chatParticipantId);
  React.useEffect(() => { chatParticipantIdRef.current = chatParticipantId; }, [chatParticipantId]);
  React.useEffect(() => {
    if (!activeCalId || !chatParticipantId) return;
    if (!mainChatNotifyEnabled || mainNotifPermission !== 'granted') return;
    subscribeUserToPush(activeCalId, chatParticipantId).then(result => {
      if (result && !result.ok) {
        console.warn('Main chat notification auto-subscribe skipped:', result.reason);
      }
    });
  }, [activeCalId, chatParticipantId, mainChatNotifyEnabled, mainNotifPermission]);
  const [isChatSheetOpen, setIsChatSheetOpen] = React.useState(false);
  const [isChatSubmitting, setIsChatSubmitting] = React.useState(false);
  const [chatUploadProgress, setChatUploadProgress] = React.useState(null);
  const chatTextareaRef = React.useRef(null);
  const [chatImages, setChatImages] = React.useState([]);
  const [activeLightbox, setActiveLightbox] = React.useState(null); // { urls: string[], index: number } | null
  const [linkPreviewProgressState, setLinkPreviewProgressState] = React.useState(null);
  const [isGalleryOpen, setIsGalleryOpen] = React.useState(false);
  const [placesInitialQuery, setPlacesInitialQuery] = React.useState('');
  // Clicking a #해시태그 in the lightbox's image-info panel closes the lightbox and opens the
  // global search prefilled with that tag -- shared by every Lightbox instance in the app.
  // GlobalSearchModal is only mounted in the default (calendar) tree, not in the separate
  // early-returned activeView==='chat' tree, so switching back to 'calendar' first is required
  // for the search modal to actually become visible when a tag is clicked from inside chat.
  const handleSearchTag = tagText => {
    setActiveLightbox(null);
    setGlobalSearchInitialQuery(tagText);
    setIsGlobalSearchOpen(true);
    changeView('calendar');
  };
  const handleParticipantClick = (name, dateStr) => {
    if (dateStr) {
      setSelectedDate(dateStr);
      setIsModalOpen(true);
      return;
    }
    if (name) {
      setPlacesInitialQuery(name);
      changeView('places');
    }
  };
  const [deletingMessage, setDeletingMessage] = React.useState(null); // {id, participantId, text, calId}
  const [editingMessage, setEditingMessage] = React.useState(null); // {id, participantId, text, imageUrl, thumbUrl, calId}

  const getActiveViewFromURL = () => {
    const share = parseSharePathFromLocation();
    if (share && share.view && share.view !== 'calendar') return share.view;
    const params = new URLSearchParams(window.location.search);
    return params.get('view') || 'calendar';
  };
  const [activeView, setActiveView] = React.useState(getActiveViewFromURL);
  // The chat embed the user tapped just before navigating away from chat, kept alive as a
  // floating mini player instead of being unmounted along with the rest of ChatRoomView --
  // { key, embedUrl, provider, orientation, title } | null. See changeView below for the
  // promotion trigger and StickyVideoBox for the persistent portal that actually renders it.
  const [stickyVideo, setStickyVideo] = React.useState(null);

  React.useEffect(() => {
    const handleUrlChange = () => {
      setActiveView(getActiveViewFromURL());
    };
    window.addEventListener('popstate', handleUrlChange);
    return () => window.removeEventListener('popstate', handleUrlChange);
  }, []);

  // Deep-link support: ?date=YYYY-MM-DD auto-opens that date's DateModal on load. Used by the
  // admin 통합검색결과 page so clicking a 일정/정산 search result can open a new tab that lands
  // directly on the matched date instead of just the calendar's home screen.
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const dateParam = params.get('date');
    if (dateParam && isValidDateString(dateParam)) {
      setSelectedDate(dateParam);
      setIsModalOpen(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // The header is now position:fixed (full-bleed), so page content needs top padding equal to
  // its rendered height -- measured (not hardcoded) since it varies by title length/wrapping.
  // The header itself unmounts entirely while activeView is 'chat' (ChatRoomView renders its
  // own tree with no main header), so re-running this on activeView change is required --
  // otherwise the ResizeObserver set up on the first mount keeps watching a detached DOM node
  // after returning from chat, mainHeaderHeight stops tracking the real (remounted) header's
  // height, and body content ends up hidden behind the fixed header.
  const [mainHeaderHeight, setMainHeaderHeight] = React.useState(0);
  React.useEffect(() => {
    if (!mainHeaderRef.current) return;
    const measure = () => {
      if (mainHeaderRef.current) setMainHeaderHeight(mainHeaderRef.current.offsetHeight);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(mainHeaderRef.current);
    return () => ro.disconnect();
  }, [activeView]);

  React.useEffect(() => {
    if (!isMainSideMenuOpen) return;
    const originalOverflow = document.body.style.overflow;
    const originalTouchAction = document.body.style.touchAction;
    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';
    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.touchAction = originalTouchAction;
    };
  }, [isMainSideMenuOpen]);

  // Global visual viewport resize handler to scroll active inputs into view (e.g. CommentsSection)
  React.useEffect(() => {
    if (!window.visualViewport) return;
    const handleResize = () => {
      const active = document.activeElement;
      if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA')) {
        if (active.closest('.chat-room-container')) return; // ChatRoom handles its own viewport height
        setTimeout(() => {
          active.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 150);
      }
    };
    window.visualViewport.addEventListener('resize', handleResize);
    return () => window.visualViewport.removeEventListener('resize', handleResize);
  }, []);

  const changeView = (view) => {
    // Leaving chat with a video the user had tapped -> keep it alive as a floating mini player
    // instead of letting it get torn down along with the rest of ChatRoomView. Only fires on the
    // chat -> elsewhere transition, never the reverse: returning to chat is exactly what the
    // mini player's own "채팅으로 이동" button already does (see StickyVideoBox), and that path
    // intentionally releases sticky mode so the video goes back to playing inline in its message.
    if (activeView === 'chat' && view !== 'chat' && lastFocusedChatVideo) {
      setStickyVideo(lastFocusedChatVideo);
    }
    setActiveView(view);
    if (view !== 'chat') {
      setIsMainHeaderVisible(true);
      lastMainScrollTopRef.current = 0;
      requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'auto' }));
    }
    const params = new URLSearchParams(window.location.search);
    const keepId = params.get('id') || params.get('cal');
    params.delete('id');
    params.delete('cal');
    if (keepId) params.set('id', keepId);
    if (view === 'calendar') {
      params.delete('view');
    } else {
      params.set('view', view);
    }
    const qs = params.toString();
    const newUrl = qs ? `${window.location.pathname}?${qs}` : window.location.pathname;
    window.history.pushState({}, '', newUrl);
  };
  if (isAdminDashboardRoute()) {
    return /*#__PURE__*/React.createElement(AdminLoginGate, null,
      /*#__PURE__*/React.createElement(AdminDashboard, {
        initialCalendars: calendars
      })
    );
  }

  // Firebase Firestore Real-Time Listener (ISOLATED per activeCalId)
  React.useEffect(() => {
    if (!firebaseDb || !activeCalId) {
      setIsInitialDataLoading(false);
      return;
    }
    let isMounted = true;
    let hasLoadedCloudCalendar = false;
    let unsubscribe = null;
    setIsInitialDataLoading(true);

    const applyLoadedCalendar = (cloudCal, cloudLastMod = Date.now()) => {
      if (!isMounted || !cloudCal || cloudCal.id !== activeCalId) return false;
      if (cloudLastMod < getMetaLastModified(serverRevisionRef.current, activeCalId)) return false;
      hasLoadedCloudCalendar = true;
      setIsInitialDataLoading(false);
      setCalendarsState(prevCals => {
        const hasExisting = prevCals.some(c => c.id === activeCalId);
        const nextCals = hasExisting
          ? prevCals.map(c => c.id === activeCalId ? cloneCalendar(cloudCal) : c)
          : [cloneCalendar(cloudCal), ...prevCals];
        saveLocalCache(nextCals);
        serverRevisionRef.current = updateMetaLastModified(serverRevisionRef.current, activeCalId, cloudLastMod);
        saveLocalMeta(serverRevisionRef.current);
        return nextCals;
      });
      return true;
    };

    const runInitialLoad = async () => {
      for (let attempt = 1; attempt <= FIREBASE_LOAD_MAX_ATTEMPTS && isMounted && !hasLoadedCloudCalendar; attempt += 1) {
        const result = await fetchSingleCloudCalendar(activeCalId, 1, FIREBASE_LOAD_TIMEOUT_MS);
        if (result?.calendar && applyLoadedCalendar(result.calendar, result.lastModified || Date.now())) {
          if (attempt > 1) showToast('다시 불러옴', 'success', 3000);
          return;
        }
        if (attempt < FIREBASE_LOAD_MAX_ATTEMPTS && isMounted && !hasLoadedCloudCalendar) {
          showToast(`${attempt + 1}차 재시도 중`, 'info', 3000);
        }
      }
      if (isMounted && !hasLoadedCloudCalendar) {
        setIsInitialDataLoading(false);
        showToast('데이터 로딩 실패', 'error', 7000);
      }
    };

    unsubscribe = firebaseDb.collection('calendars').doc(`cal_${activeCalId}`).onSnapshot(doc => {
      const result = getCloudDocCalendar(doc, activeCalId);
      if (result && !isSavingRef.current) {
        applyLoadedCalendar(result.calendar, result.lastModified || Date.now());
      }
    }, err => {
      console.warn(`Firestore realtime sync notice for cal_${activeCalId}:`, err);
    });

    // The onSnapshot listener above already delivers the initial load (from cache first, then
    // server) the vast majority of the time, so firing runInitialLoad's separate get()+retry
    // path immediately as well would just duplicate that same request. Give onSnapshot a head
    // start and only fall back to the explicit fetch/retry loop if it hasn't come through yet --
    // this keeps the retry safety net for a genuinely stuck listener without doubling up network
    // calls on every normal calendar open.
    const fallbackTimeoutId = setTimeout(() => {
      if (isMounted && !hasLoadedCloudCalendar) runInitialLoad();
    }, 2500);

    return () => {
      isMounted = false;
      clearTimeout(fallbackTimeoutId);
      if (unsubscribe) unsubscribe();
    };
  }, [activeCalId]);

  React.useEffect(() => {
    if (firebaseDb) return;
    showToast('연결 오류', 'error', 5000);
  }, []);
  const activeCalLoaded = calendars.some(c => c.id === activeCalId);
  const rawActiveCal = calendars.find(c => c.id === activeCalId) || createLoadingCalendarShell(activeCalId);
  // Merges the live places/confirmedMeetings subcollections into whatever's still embedded on
  // the calendar document itself (legacy entries not yet migrated -- see unionPlaces/
  // unionConfirmedMeetings and the self-healing migration in pushSingleCloudCalendar/
  // pushSingleCalendarWithRest). Every consumer of `activeCal` below -- rendering AND the
  // handleSavePlace/handleConfirmMeeting-family handlers' own "existing entries" lookups --
  // sees the merged view for free from this single point, rather than needing every call site
  // updated individually.
  const activeCal = React.useMemo(() => ({
    ...rawActiveCal,
    places: unionPlaces(rawActiveCal, placesSubcollection),
    confirmedMeeting: unionConfirmedMeetings(rawActiveCal, confirmedMeetingsSubcollection)
  }), [rawActiveCal, placesSubcollection, confirmedMeetingsSubcollection]);
  // The chat message listener below only re-subscribes on [activeCalId], so without this ref it
  // would keep using the activeCal snapshot from whenever that effect last ran -- meaning a
  // participant added (or the calendar renamed) mid-session wouldn't be reflected in incoming
  // chat notifications (sender shows "알수없음", title stays the old name) until activeCalId
  // itself changes. Mirrors the chatParticipantIdRef pattern used the same way above.
  const activeCalRef = React.useRef(activeCal);
  React.useEffect(() => { activeCalRef.current = activeCal; }, [activeCal]);
  React.useEffect(() => {
    if (activeCal) {
      const calTitle = `${activeCal.title} 캘린더`;
      const calDesc = activeCal.description || `${activeCal.title} 사모임 멤버들의 참석 가능 날짜 조율 캘린더입니다.`;
      const currentShareUrl = getCalendarShareUrl(activeCal.id);
      document.title = calTitle;
      const ogTitle = document.getElementById('og-title');
      if (ogTitle) ogTitle.setAttribute('content', calTitle);
      const ogDesc = document.getElementById('og-desc');
      if (ogDesc) ogDesc.setAttribute('content', calDesc);
      const ogUrl = document.getElementById('og-url');
      if (ogUrl) ogUrl.setAttribute('content', currentShareUrl);
      const twTitle = document.getElementById('tw-title');
      if (twTitle) twTitle.setAttribute('content', calTitle);
      if (window.location.pathname.includes('/share/')) {
        window.history.replaceState({}, '', currentShareUrl);
      }
      // Only once real data has loaded -- activeCal is otherwise createLoadingCalendarShell's
      // placeholder, and installing under "Firebase에서 실시간..." would be worse than not
      // swapping the manifest at all yet.
      if (activeCalLoaded) {
        applyDynamicManifest(activeCal);
        // iOS Safari's "홈 화면에 추가" reads this meta tag for the installed icon's label --
        // it doesn't consult the manifest at all, so it needs the same per-calendar update.
        const appleTitle = document.querySelector('meta[name="apple-mobile-web-app-title"]');
        if (appleTitle) appleTitle.setAttribute('content', activeCal.title);
      }
    }
  }, [activeCal, activeCalLoaded]);

  // Local meeting reminder: on D-day or D-1 of a confirmed meeting, nudge once per day the app
  // happens to be opened (no backend push exists here -- see notifyMeetingReminder's own note).
  React.useEffect(() => {
    if (!activeCalLoaded || !activeCal) return;
    const meetings = getTrulyConfirmedMeetings(activeCal);
    if (meetings.length === 0) return;
    const now = new Date();
    const toDateStr = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const todayStr = toDateStr(now);
    const tomorrowStr = toDateStr(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1));
    const todayMeeting = meetings.find(m => m.date === todayStr);
    const tomorrowMeeting = meetings.find(m => m.date === tomorrowStr);
    const target = todayMeeting ? { meeting: todayMeeting, whenLabel: '오늘' } : tomorrowMeeting ? { meeting: tomorrowMeeting, whenLabel: '내일' } : null;
    if (!target) return;
    const shownKey = `gather_meeting_reminder_shown_${activeCal.id}_${target.meeting.date}_${todayStr}_v1`;
    if (getLocalStorage().getItem(shownKey)) return;
    getLocalStorage().setItem(shownKey, '1');
    const fallbackMessage = notifyMeetingReminder(activeCal, target.meeting, target.whenLabel);
    if (fallbackMessage) showToast(fallbackMessage, 'success');
  }, [activeCal?.id, activeCalLoaded, activeCal?.confirmedMeeting]);

  // Synchronize chatParticipantId when activeCal changes (loads cached participant or defaults to first active)
  React.useEffect(() => {
    if (activeCal) {
      setChatParticipantId(((window.GATHER_APP_NOTIFICATIONS||{}).getStoredChatParticipantId||(()=>undefined))(activeCalId, activeCal));
    }
  }, [activeCalId, calendars]);

  // Real-time messages listener
  // Full window on chat/gallery; compact window elsewhere (main CommentsSection only needs ~5).
  React.useEffect(() => {
    if (!activeCalId) {
      setChatMessages([]);
      return;
    }
    const chatLimit = (activeView === 'chat' || activeView === 'gallery')
      ? CHAT_LIVE_MESSAGE_LIMIT
      : Math.min(10, CHAT_LIVE_MESSAGE_LIMIT);
    if (!firebaseDb) {
      fetchChatMessagesRest(activeCalId).then(list => setChatMessages(list.slice(-chatLimit)));
      return;
    }
    let isMounted = true;

    // Subscribe to chat room history. Queried newest-first + limit so the window
    // tracks the most recent messages as new ones arrive, then reversed back to
    // ascending order for rendering.
    let hasSeenInitialChatSnapshot = false;
    let lastNotifiedMessageId = null;
    const unsubscribeChat = subscribeMessages(activeCalId, { orderBy: 'timestamp', direction: 'desc', limit: chatLimit }, snapshot => {
        if (!isMounted) return;
        const list = [];
        snapshot.forEach(doc => {
          list.push(slimMessageForClient({ id: doc.id, ...doc.data() }));
        });
        list.reverse();
        setChatMessages(list);

        // Browser notification for a genuinely new incoming message from someone else --
        // skip the very first snapshot (that's just the existing history loading, not a
        // new message) and skip anything sent by the current participant themselves.
        const latest = list[list.length - 1];
        if (hasSeenInitialChatSnapshot && latest && latest.id !== lastNotifiedMessageId
          && latest.participantId !== chatParticipantIdRef.current) {
          const sender = getActiveParticipants(activeCalRef.current).find(p => p.id === latest.participantId);
          notifyNewChatMessage(activeCalRef.current, latest, sender?.name || '알수없음');
        }
        hasSeenInitialChatSnapshot = true;
        if (latest) lastNotifiedMessageId = latest.id;
      }, err => {
        console.warn(`Firestore chat history subscription error:`, err);
        fetchChatMessagesRest(activeCalId).then(list => {
          if (isMounted) setChatMessages(list);
        });
      });

    return () => {
      isMounted = false;
      if (unsubscribeChat) unsubscribeChat();
    };
  }, [activeCalId, activeView, firebaseDb]);

  // Anniversaries: only while calendar view needs them
  React.useEffect(() => {
    if (!activeCalId || !firebaseDb) return;
    if (activeView !== 'calendar') return;
    let isMounted = true;
    const unsub = subscribeAnniversaries(activeCalId, snapshot => {
        if (!isMounted) return;
        const list = [];
        snapshot.forEach(doc => list.push({ id: doc.id, ...doc.data() }));
        setAnniversaries(list);
      }, err => {
        console.warn(`Firestore anniversaries subscription error:`, err);
        fetchAnniversariesRest(activeCalId).then(list => {
          if (isMounted) setAnniversaries(list);
        });
      });
    return () => { isMounted = false; unsub(); };
  }, [activeCalId, activeView, firebaseDb]);

  // Places + confirmed meetings: calendar / places / settlement only
  React.useEffect(() => {
    if (!activeCalId || !firebaseDb) return;
    if (activeView !== 'calendar' && activeView !== 'places' && activeView !== 'settlement') return;
    let isMounted = true;
    const unsubPlaces = subscribePlaces(activeCalId, snapshot => {
        if (!isMounted) return;
        const list = [];
        snapshot.forEach(doc => list.push(doc.data()));
        setPlacesSubcollection(list);
      }, err => {
        console.warn(`Firestore places subscription error:`, err);
        fetchPlacesFromFirestore(activeCalId).then(list => {
          if (isMounted) setPlacesSubcollection(list);
        });
      });
    const unsubMeetings = firebaseDb.collection('calendars').doc(`cal_${activeCalId}`).collection('confirmedMeetings')
      .onSnapshot(snapshot => {
        if (!isMounted) return;
        const list = [];
        snapshot.forEach(doc => list.push(doc.data()));
        setConfirmedMeetingsSubcollection(list);
      }, err => {
        console.warn(`Firestore confirmedMeetings subscription error:`, err);
        fetchConfirmedMeetingsFromFirestore(activeCalId).then(list => {
          if (isMounted) setConfirmedMeetingsSubcollection(list);
        });
      });
    return () => {
      isMounted = false;
      unsubPlaces();
      unsubMeetings();
    };
  }, [activeCalId, activeView, firebaseDb]);

  // Memos: paginated newest-first load (rather than subscribing to the entire collection at
  // once, which would download/re-sync thousands of memos on every open as a calendar grows).
  // Pinned memos are fetched separately and unbounded -- pinning is a deliberate, self-limiting
  // action, and keeping it a separate always-live query means an old pinned memo can never
  // silently fall out of view just because it's outside the paginated recent window.
  React.useEffect(() => {
    setMemosLimit(MEMOS_PAGE_SIZE);
  }, [activeCalId]);

  React.useEffect(() => {
    if (!activeCalId) {
      setMemos([]);
      setHasMoreMemos(false);
      return;
    }
    // Memos only while memo view is open
    if (activeView !== 'memo') {
      return;
    }
    if (!firebaseDb) {
      fetchMemosRest(activeCalId, memosLimit).then(list => {
        setMemos(list);
        setHasMoreMemos(list.length >= memosLimit);
      });
      return;
    }
    let isMounted = true;
    let pinnedList = [];
    let recentList = [];
    const applyMerged = () => {
      const byId = new Map();
      pinnedList.forEach(m => byId.set(m.id, m));
      recentList.forEach(m => byId.set(m.id, m));
      setMemos(Array.from(byId.values()).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)));
    };

    const unsubscribePinned = subscribeMemos(activeCalId, { where: ['isPinned', '==', true] }, snapshot => {
        if (!isMounted) return;
        pinnedList = [];
        snapshot.forEach(doc => pinnedList.push({ id: doc.id, ...doc.data() }));
        applyMerged();
      }, err => {
        console.warn(`Firestore pinned memos subscription error:`, err);
      });

    const unsubscribeRecent = subscribeMemos(activeCalId, { orderBy: 'createdAt', direction: 'desc', limit: memosLimit }, snapshot => {
        if (!isMounted) return;
        recentList = [];
        snapshot.forEach(doc => recentList.push({ id: doc.id, ...doc.data() }));
        setHasMoreMemos(recentList.length >= memosLimit);
        applyMerged();
      }, err => {
        console.warn(`Firestore memos subscription error:`, err);
        fetchMemosRest(activeCalId, memosLimit).then(list => {
          if (!isMounted) return;
          recentList = list;
          setHasMoreMemos(list.length >= memosLimit);
          applyMerged();
        });
      });

    return () => {
      isMounted = false;
      unsubscribePinned();
      unsubscribeRecent();
    };
  }, [activeCalId, memosLimit, activeView, firebaseDb]);

  // Dynamic body padding override for full-screen subviews (chat, settlement, memo)
  React.useEffect(() => {
    if (activeView === 'memo' || activeView === 'chat' || activeView === 'settlement') {
      document.body.classList.add('no-body-padding');
    } else {
      document.body.classList.remove('no-body-padding');
    }
    return () => {
      document.body.classList.remove('no-body-padding');
    };
  }, [activeView]);

  // Deep-link support: ?view=chat&msg=<id>[&img=<index>] switches to chat and scrolls/flashes
  // the matched message bubble (same DOM hook + animation GlobalSearchModal's in-session click
  // already uses), optionally opening the lightbox at a specific image for 태그 results. Used by
  // the admin 통합검색결과 page so 채팅/태그 search results open a new tab landing on the actual
  // message instead of just the chat room's bottom. Re-runs as chatMessages streams in (the
  // message may not be in the DOM yet on first paint) but only acts once via the ref guard.
  const chatDeepLinkHandledRef = React.useRef(false);
  React.useEffect(() => {
    if (chatDeepLinkHandledRef.current) return;
    const params = new URLSearchParams(window.location.search);
    const msgParam = params.get('msg');
    if (!msgParam) return;
    if (activeView !== 'chat') { changeView('chat'); return; }
    const el = document.querySelector(`[data-msg-row-id="${msgParam}"]`);
    if (!el) return;
    chatDeepLinkHandledRef.current = true;
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    el.classList.add('search-result-flash');
    setTimeout(() => el.classList.remove('search-result-flash'), 1700);
    const imgParam = params.get('img');
    if (imgParam !== null) {
      const msg = chatMessages.find(m => m.id === msgParam);
      if (msg) {
        const entries = getMessageImageEntries(msg);
        setActiveLightbox({
          urls: entries.map(e => e.full),
          meta: entries.map(e => ({ timestamp: msg.timestamp, messageId: msg.id, imageIndex: e.imageIndex, thumb: e.thumb, tags: e.tags })),
          index: Number(imgParam) || 0
        });
      }
    }
  }, [activeView, chatMessages]);

  // Activity logs only when settings AdminModal opens recovery/logs tabs (not on every settings open).
  const adminActivityLogsLoadedForRef = React.useRef(null);
  const loadAdminActivityLogs = React.useCallback(() => {
    if (!activeCalId) return;
    if (adminActivityLogsLoadedForRef.current === activeCalId && adminActivityLogs.length > 0) return;
    const calId = activeCalId;
    fetchActivityLogsFromFirestore(calId, 400).then(list => {
      adminActivityLogsLoadedForRef.current = calId;
      setAdminActivityLogs(Array.isArray(list) ? list : []);
    });
  }, [activeCalId, adminActivityLogs.length]);
  React.useEffect(() => {
    if (!isAdminOpen) {
      setAdminActivityLogs([]);
      adminActivityLogsLoadedForRef.current = null;
    }
  }, [isAdminOpen]);

  // Scroll to bottom of chat container
  const chatMessagesContainerRef = React.useRef(null);
  React.useEffect(() => {
    setOlderChatMessages([]);
    setHasMoreOlderChat(true);
    setLoadingOlderChat(false);
    loadingOlderChatRef.current = false;
    setTotalChatCount(null);
    setTotalMemoCount(null);
    setTotalGalleryCount(null);
    setGalleryPreviewMessages([]);
    if (!activeCalId) return;
    let cancelled = false;
    (async () => {
      const [msgCount, memoCount, galCount] = await Promise.all([
        fetchSubcollectionCount(activeCalId, 'messages'),
        fetchSubcollectionCount(activeCalId, 'memos'),
        fetchGalleryItemCount(activeCalId)
      ]);
      if (cancelled) return;
      if (msgCount != null) setTotalChatCount(msgCount);
      if (memoCount != null) setTotalMemoCount(memoCount);
      if (galCount != null) setTotalGalleryCount(galCount);
      try {
        if (!window.__gatherB64MigDone) window.__gatherB64MigDone = Object.create(null);
        if (!window.__gatherB64MigDone[activeCalId]) {
          const result = await migrateBase64ChatImagesForCalendar(activeCalId, { maxMessages: 20 });
          if (!cancelled && result && (result.failed || 0) === 0) window.__gatherB64MigDone[activeCalId] = true;
          if (result && result.migrated > 0) console.info('base64→Storage migrated', activeCalId, result);
        }
      } catch (e) { console.warn('base64 migration skipped', e); }
    })();
    return () => { cancelled = true; };
  }, [activeCalId]);

  React.useEffect(() => {
    if (!activeCalId || activeView !== 'calendar') return;
    let cancelled = false;
    (async () => {
      const list = await fetchRecentChatMessages(activeCalId, 60);
      if (!cancelled && Array.isArray(list)) setGalleryPreviewMessages(list);
    })();
    return () => { cancelled = true; };
  }, [activeCalId, activeView]);

  const loadOlderChatMessages = React.useCallback(async () => {
    if (!activeCalId || loadingOlderChatRef.current || !hasMoreOlderChat) return;
    const oldest = allChatMessages[0];
    const beforeTs = oldest && oldest.timestamp;
    if (!beforeTs) return;
    loadingOlderChatRef.current = true;
    setLoadingOlderChat(true);
    const container = chatMessagesContainerRef.current;
    const prevHeight = container ? container.scrollHeight : 0;
    const prevTop = container ? container.scrollTop : 0;
    try {
      const older = await fetchOlderChatMessages(activeCalId, beforeTs, CHAT_OLDER_PAGE_SIZE);
      if (!older.length) {
        setHasMoreOlderChat(false);
        return;
      }
      if (older.length < CHAT_OLDER_PAGE_SIZE) setHasMoreOlderChat(false);
      setOlderChatMessages(prev => {
        const seen = new Set((prev || []).map(m => m.id));
        (chatMessages || []).forEach(m => { if (m && m.id) seen.add(m.id); });
        const add = older.filter(m => m && m.id && !seen.has(m.id));
        return add.length ? [...add, ...(prev || [])] : prev;
      });
      requestAnimationFrame(() => {
        const el = chatMessagesContainerRef.current;
        if (!el || !prevHeight) return;
        el.scrollTop = prevTop + (el.scrollHeight - prevHeight);
      });
    } finally {
      loadingOlderChatRef.current = false;
      setLoadingOlderChat(false);
    }
  }, [activeCalId, hasMoreOlderChat, allChatMessages, chatMessages]);

  React.useEffect(() => {
    if (activeView === 'chat' && chatMessagesContainerRef.current) {
      const container = chatMessagesContainerRef.current;
      if (loadingOlderChatRef.current) return;
      container.scrollTop = container.scrollHeight;
      const t = setTimeout(() => {
        if (!loadingOlderChatRef.current) container.scrollTop = container.scrollHeight;
      }, 50);
      return () => clearTimeout(t);
    }
  }, [activeView, chatMessages.length]);

  const [isHeaderVisible, setIsHeaderVisible] = React.useState(true);
  const lastScrollTopRef = React.useRef(0);

  // Cross-browser virtual keyboard detection.
  // Strategy:
  //  1. visualViewport resize/scroll events (all browsers)
  //  2. document focusin/focusout events (iOS Safari workaround for resize event delay)
  //  3. Distinguish address-bar shrink from true keyboard: keyboard height > 120px threshold
  //     (address bar change is typically only 40-60px on iOS; keyboard is 250px+)
  //  4. requestAnimationFrame coalescing to prevent Samsung double-fire flicker
  const isKeyboardOpenRef = React.useRef(false);
  const kbRafRef = React.useRef(null);
  React.useEffect(() => {
    const measureKeyboard = () => {
      // Use visualViewport when available; fall back to window dimensions (Firefox Android)
      const vh = window.visualViewport ? window.visualViewport.height : window.innerHeight;
      // On iOS the page may have scrolled up (visualViewport.offsetTop > 0), which adds to
      // the gap but isn't keyboard. On Android innerHeight truly shrinks with the keyboard.
      const offsetTop = window.visualViewport ? (window.visualViewport.offsetTop || 0) : 0;
      const keyboardHeight = window.innerHeight - vh - offsetTop;
      // 120px threshold: rules out iOS address bar animation (typically 40-60px change)
      const wasOpen = isKeyboardOpenRef.current;
      isKeyboardOpenRef.current = keyboardHeight > 120;
      if (isKeyboardOpenRef.current && !wasOpen) {
        // Keyboard just opened → force input bar visible immediately
        setIsHeaderVisible(true);
      }
    };

    const onVpChangeRaf = () => {
      if (kbRafRef.current) cancelAnimationFrame(kbRafRef.current);
      kbRafRef.current = requestAnimationFrame(measureKeyboard);
    };

    // Fallback for iOS Safari: resize event can be delayed up to ~300ms.
    // focusin on an input/textarea fires immediately → pre-mark keyboard as open so
    // the scroll handler ignores the incoming programmatic scrollTop update.
    const onFocusIn = (e) => {
      const target = e.target;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
        if (target.closest && target.closest('.chat-room-container')) {
          // Pre-emptively flag keyboard as open and reveal input bar BEFORE the
          // visualViewport resize fires (critical for iOS Safari where resize is delayed)
          isKeyboardOpenRef.current = true;
          setIsHeaderVisible(true);
          // Schedule a real measurement after keyboard animation (~350ms on iOS)
          setTimeout(measureKeyboard, 400);
        }
      }
    };
    const onFocusOut = (e) => {
      const target = e.target;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
        if (target.closest && target.closest('.chat-room-container')) {
          // Delay clearing keyboard flag to avoid race with next focusin (e.g. tapping emoji picker)
          setTimeout(() => {
            if (!document.activeElement || document.activeElement.tagName === 'BODY') {
              isKeyboardOpenRef.current = false;
            } else {
              measureKeyboard();
            }
          }, 300);
        }
      }
    };

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', onVpChangeRaf);
      window.visualViewport.addEventListener('scroll', onVpChangeRaf);
    } else {
      // Firefox Android fallback: window resize
      window.addEventListener('resize', onVpChangeRaf);
    }
    document.addEventListener('focusin', onFocusIn);
    document.addEventListener('focusout', onFocusOut);
    measureKeyboard();
    return () => {
      if (kbRafRef.current) cancelAnimationFrame(kbRafRef.current);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', onVpChangeRaf);
        window.visualViewport.removeEventListener('scroll', onVpChangeRaf);
      } else {
        window.removeEventListener('resize', onVpChangeRaf);
      }
      document.removeEventListener('focusin', onFocusIn);
      document.removeEventListener('focusout', onFocusOut);
    };
  }, []);

  const handleChatScroll = (e) => {
    // Keep composer while keyboard open, focused, OR draft text/images exist.
    // Mobile often blurs the textarea as soon as the message list is scrolled.
    const active = document.activeElement;
    const chatInputFocused = !!(
      active &&
      (active.tagName === 'TEXTAREA' || active.tagName === 'INPUT') &&
      active.closest &&
      (active.closest('.chat-composer') || active.closest('.chat-room-container'))
    );
    const hasComposerDraft = !!(String(chatInput || '').trim() || (chatImages && chatImages.length > 0));
    const scrollTop = e.target.scrollTop;
    if (scrollTop < 120 && hasMoreOlderChat && !loadingOlderChatRef.current) {
      loadOlderChatMessages();
    }
    if (isKeyboardOpenRef.current || chatInputFocused || hasComposerDraft) {
      setIsHeaderVisible(true);
      lastScrollTopRef.current = scrollTop;
      return;
    }
    const lastScrollTop = lastScrollTopRef.current;
    if (scrollTop < 10) {
      setIsHeaderVisible(true);
    } else if (scrollTop > lastScrollTop && scrollTop > 56) {
      setIsHeaderVisible(false);
    } else if (scrollTop < lastScrollTop) {
      setIsHeaderVisible(true);
    }
    lastScrollTopRef.current = scrollTop;
  };

  const handleSendChatMessage = async () => {
    const hasText = !!chatInput.trim();
    const imageCount = chatImages.length;
    if ((!hasText && imageCount === 0) || !chatParticipantId) return;
    setIsChatSubmitting(true);
    if (imageCount > 0) setChatUploadProgress({ pct: 0, remainingSec: null });

    try {
      let linkPreview = null;
      if (hasText) {
        const url = extractFirstUrl(chatInput);
        if (url && shouldFetchLinkPreviewForChatUrl(url)) {
          setLinkPreviewProgressState({ pct: 5, remainingSec: 5 });
          const startTime = Date.now();
          const targetDuration = 5000;
          const pInterval = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const displayPercent = Math.min(Math.round(98 * (1 - Math.exp(-elapsed / 2200))), 98);
            const remaining = Math.max(1, Math.round((targetDuration - elapsed) / 1000));
            setLinkPreviewProgressState({ pct: displayPercent, remainingSec: remaining });
          }, 100);
          try {
            const res = await fetchLinkPreview(url);
            if (res && res.status === 'success') {
              linkPreview = res.data;
            }
          } catch (e) {
            console.error('Failed to fetch link preview on chat send:', e);
          } finally {
            clearInterval(pInterval);
            setLinkPreviewProgressState(null);
          }
        }
      }

      let ok = false;
      if (imageCount === 0) {
        const messageData = {
          participantId: chatParticipantId,
          text: chatInput.trim(),
          timestamp: Date.now()
        };
        if (linkPreview) messageData.linkPreview = linkPreview;
        ok = await runWithOperationProgress({
          title: '채팅 전송 중...',
          detail: '메시지를 Firebase에 저장하고 있습니다.'
        }, async () => {
          if (firebaseDb) {
            await firebaseDb.collection('calendars').doc(`cal_${activeCalId}`).collection('messages').add(sanitizeMessageForFirestore(messageData));
            return true;
          }
          return sendChatMessageRest(activeCalId, messageData);
        });
      } else {
        // Bundle every attached image into a single multi-thumbnail message when possible.
        // Uploads that land in Storage produce short download URLs, so this is always a single
        // message in the normal case. Images that fall back to inline base64 (Storage
        // unavailable) keep their full quality -- instead the batch is split across multiple
        // chat messages if needed so no single message can exceed Firestore's 1MiB/doc limit.
        const resolvedImages = await resolveChatImageBatch(activeCalId, chatImages, setChatUploadProgress);
        const chunks = chunkResolvedImagesForMessages(resolvedImages);
        const baseTimestamp = Date.now();
        for (let i = 0; i < chunks.length; i++) {
          const chunkImages = chunks[i];
          const messageData = {
            participantId: chatParticipantId,
            text: i === 0 ? chatInput.trim() : '',
            imageUrl: chunkImages[0].imageUrl,
            thumbUrl: chunkImages[0].thumbUrl,
            imageUrls: chunkImages.map(r => r.imageUrl),
            thumbUrls: chunkImages.map(r => r.thumbUrl),
            timestamp: baseTimestamp + i
          };
          if (i === 0 && linkPreview) messageData.linkPreview = linkPreview;
          if (firebaseDb) {
            await firebaseDb.collection('calendars').doc(`cal_${activeCalId}`).collection('messages').add(sanitizeMessageForFirestore(messageData));
          } else {
            const sent = await sendChatMessageRest(activeCalId, messageData);
            if (!sent) throw new Error(`REST chat send failed for chunk ${i + 1}/${chunks.length}`);
          }
        }
        ok = true;
      }

      if (ok) {
        setChatInput('');
        setChatImages([]);
        if (chatTextareaRef.current) {
          chatTextareaRef.current.style.height = '34px';
        }
        if (!firebaseDb) {
          fetchChatMessagesRest(activeCalId).then(list => setChatMessages(list));
        }
        // No success toast here -- the new message is immediately visible in the chat feed.
      } else {
        showToast('등록 실패', 'error', 3000);
      }
    } catch (err) {
      console.error('handleSendChatMessage failed:', err);
      showToast('등록 실패', 'error', 3000);
    } finally {
      setIsChatSubmitting(false);
      setChatUploadProgress(null);
    }
  };

  const handleDeleteMessage = (msg) => {
    setDeletingMessage({ ...msg, calId: activeCalId });
  };

  const handleConfirmDeleteMessage = async () => {
    if (!deletingMessage) return;
    const { id, calId } = deletingMessage;
    try {
      let ok = false;
      if (firebaseDb) {
        await firebaseDb.collection('calendars').doc(`cal_${calId}`).collection('messages').doc(id).delete();
        ok = true;
      } else {
        ok = await deleteMessageRest(calId, id);
      }
      if (ok) {
        deleteAllChatImagesFromStorage(deletingMessage);
        if (!firebaseDb) {
          fetchChatMessagesRest(calId).then(list => setChatMessages(list));
        }
        showToast('삭제완료', 'success', 3000);
      } else {
        showToast('삭제 실패', 'error', 3000);
      }
    } catch (err) {
      console.error('handleConfirmDeleteMessage failed:', err);
      showToast('삭제 실패', 'error', 3000);
    } finally {
      setDeletingMessage(null);
    }
  };

  const handleEditMessage = (msg) => {
    setEditingMessage({ ...msg, calId: activeCalId });
  };

  const handleSaveEditMessage = async (newText, newImages, newParticipantId) => {
    if (!editingMessage) return;
    const { id, calId } = editingMessage;
    const resolvedParticipantId = newParticipantId || editingMessage.participantId;
    const hasNewImages = (newImages || []).some(img => !img.isExisting);
    if (hasNewImages) setChatUploadProgress({ pct: 0, remainingSec: null });
    try {
      let linkPreview = null;
      const url = extractFirstUrl(newText);
      if (url && shouldFetchLinkPreviewForChatUrl(url)) {
        const oldUrl = extractFirstUrl(editingMessage.text);
        if (oldUrl === url && editingMessage.linkPreview) {
          linkPreview = editingMessage.linkPreview;
        } else {
          try {
            const res = await fetchLinkPreview(url);
            if (res && res.status === 'success') {
              linkPreview = res.data;
            }
          } catch (e) {
            console.error('Failed to fetch link preview on message update:', e);
          }
        }
      }

      // Images already on the message (isExisting) are passed through as-is; freshly
      // picked ones get uploaded via resolveChatImageBatch, matching the compose flow. If the
      // result still doesn't fit in one document (inline base64 fallback with many images),
      // the edited message keeps the first chunk and any remainder is appended as new messages
      // right after it, same as the compose flow -- quality is never degraded to force a fit.
      const resolvedImages = await resolveChatImageBatch(calId, newImages || [], hasNewImages ? setChatUploadProgress : null);
      const chunks = resolvedImages.length > 0 ? chunkResolvedImagesForMessages(resolvedImages) : [[]];
      const firstChunk = chunks[0];
      const extraChunks = chunks.slice(1);

      // imageTags is parallel-indexed to imageUrls/thumbUrls by ARRAY POSITION, not by the
      // image's identity -- so it has to be explicitly rebuilt here to match the edited image
      // order. Previously this was omitted from `data` entirely, so Firestore's partial update
      // left the old imageTags array untouched: removing a tagged photo and attaching a new one
      // in its place made the new photo silently inherit the old one's tag, since it landed on
      // the same array index. Kept (isExisting) images carry their own tag forward by matching
      // their original URL (not position, since an earlier removal can shift everything after
      // it); freshly attached images start untagged.
      const originalUrls = Array.isArray(editingMessage.imageUrls) && editingMessage.imageUrls.length > 0
        ? editingMessage.imageUrls
        : (editingMessage.imageUrl ? [editingMessage.imageUrl] : []);
      const originalTags = Array.isArray(editingMessage.imageTags) ? editingMessage.imageTags : [];
      const nextImageTags = (newImages || []).map(img => {
        if (!img.isExisting) return '';
        const originalIdx = originalUrls.indexOf(img.original);
        return originalIdx >= 0 ? (originalTags[originalIdx] || '') : '';
      });

      const data = {
        text: newText,
        imageUrl: firstChunk[0]?.imageUrl || '',
        thumbUrl: firstChunk[0]?.thumbUrl || '',
        imageUrls: firstChunk.map(r => r.imageUrl),
        thumbUrls: firstChunk.map(r => r.thumbUrl),
        imageTags: nextImageTags.slice(0, firstChunk.length),
        linkPreview: linkPreview || null
      };
      if (resolvedParticipantId !== editingMessage.participantId) data.participantId = resolvedParticipantId;
      let ok = false;
      if (firebaseDb) {
        await firebaseDb.collection('calendars').doc(`cal_${calId}`).collection('messages').doc(id).update(data);
        if (extraChunks.length > 0) {
          const baseTimestamp = (editingMessage.timestamp || Date.now()) + 1;
          for (let i = 0; i < extraChunks.length; i++) {
            const chunkImages = extraChunks[i];
            await firebaseDb.collection('calendars').doc(`cal_${calId}`).collection('messages').add(sanitizeMessageForFirestore({
              participantId: resolvedParticipantId,
              text: '',
              imageUrl: chunkImages[0].imageUrl,
              thumbUrl: chunkImages[0].thumbUrl,
              imageUrls: chunkImages.map(r => r.imageUrl),
              thumbUrls: chunkImages.map(r => r.thumbUrl),
              timestamp: baseTimestamp + i
            }));
          }
        }
        ok = true;
      } else {
        ok = await updateMessageRest(calId, id, data);
      }
      if (ok) {
        // Clean up Storage only for images the user actually removed, not ones kept.
        const originalEntries = Array.isArray(editingMessage.imageUrls) && editingMessage.imageUrls.length > 0
          ? editingMessage.imageUrls.map((url, idx) => ({ original: url, thumbnail: (editingMessage.thumbUrls || [])[idx] || url }))
          : (editingMessage.imageUrl ? [{ original: editingMessage.imageUrl, thumbnail: editingMessage.thumbUrl || editingMessage.imageUrl }] : []);
        const keptOriginals = new Set((newImages || []).filter(img => img.isExisting).map(img => img.original));
        const removedEntries = originalEntries.filter(entry => !keptOriginals.has(entry.original));
        if (removedEntries.length > 0) {
          deleteAllChatImagesFromStorage({
            imageUrls: removedEntries.map(e => e.original),
            thumbUrls: removedEntries.map(e => e.thumbnail)
          });
        }
        if (!firebaseDb) {
          fetchChatMessagesRest(calId).then(list => setChatMessages(list));
        }
        showToast('수정완료', 'success', 3000);
      } else {
        showToast('수정 실패', 'error', 3000);
      }
    } catch (err) {
      console.error('handleSaveEditMessage failed:', err);
      showToast(describeFirebaseWriteError(err, '수정 실패'), 'error', 4000);
    } finally {
      setEditingMessage(null);
      setChatUploadProgress(null);
    }
  };

  const handlePromoteInlineChatImage = async ({ url, meta, index = 0 }) => {
    if (typeof url !== 'string' || !url.startsWith('data:')) return url;

    const messageId = meta?.messageId;
    const sourceMessage = messageId
      ? (chatMessages || []).find(msg => msg.id === messageId)
      : null;
    const progressMap = new Map();
    const updateProgress = (taskKey, transferred, total) => {
      progressMap.set(taskKey, { transferred, total });
      const totals = Array.from(progressMap.values());
      const totalBytes = totals.reduce((sum, item) => sum + (item.total || 0), 0);
      const transferredBytes = totals.reduce((sum, item) => sum + (item.transferred || 0), 0);
      const pct = totalBytes > 0 ? Math.max(1, Math.min(99, Math.round((transferredBytes / totalBytes) * 100))) : 1;
      setChatUploadProgress({ pct, remainingSec: null });
    };

    setChatUploadProgress({ pct: 3, remainingSec: null, label: '공유 URL 준비 중...' });
    try {
      if (sourceMessage) {
        const imageUrls = Array.isArray(sourceMessage.imageUrls) && sourceMessage.imageUrls.length > 0
          ? [...sourceMessage.imageUrls]
          : (sourceMessage.imageUrl ? [sourceMessage.imageUrl] : []);
        const thumbUrls = Array.isArray(sourceMessage.thumbUrls) && sourceMessage.thumbUrls.length > 0
          ? [...sourceMessage.thumbUrls]
          : (sourceMessage.thumbUrl ? [sourceMessage.thumbUrl] : []);
        let targetIndex = Number.isInteger(meta?.imageIndex) ? meta.imageIndex : Number(index || 0);
        if (!Number.isInteger(targetIndex) || targetIndex < 0) targetIndex = Math.max(0, imageUrls.findIndex(item => item === url));
        while (imageUrls.length <= targetIndex) imageUrls.push('');
        while (thumbUrls.length <= targetIndex) thumbUrls.push(imageUrls[targetIndex] || url);

        const originalUrl = imageUrls[targetIndex] || url;
        const originalThumbUrl = thumbUrls[targetIndex] || meta?.thumb || originalUrl;
        if (typeof originalUrl === 'string' && /^https?:\/\//.test(originalUrl)) return { shareUrl: originalUrl, imageUrl: originalUrl };

        const shareUrls = Array.isArray(sourceMessage.imageShareUrls) ? [...sourceMessage.imageShareUrls] : [];
        const existingShareUrl = shareUrls[targetIndex];
        if (typeof existingShareUrl === 'string' && /^https?:\/\//.test(existingShareUrl)) {
          setChatUploadProgress({ pct: 100, remainingSec: 0, label: '기존 URL 확인완료' });
          return { shareUrl: existingShareUrl, imageUrl: null };
        }

        setChatUploadProgress({ pct: 35, remainingSec: null, label: '공유 링크 저장 중...' });
        const shareUrl = await createImageShareDocument(activeCalId, originalUrl, {
          ...meta,
          messageId: sourceMessage.id,
          imageIndex: targetIndex,
          thumb: originalThumbUrl
        });
        while (shareUrls.length <= targetIndex) shareUrls.push('');
        shareUrls[targetIndex] = shareUrl;
        const data = { imageShareUrls: shareUrls };
        if (firebaseDb) {
          await withTimeout(firebaseDb.collection('calendars').doc(`cal_${activeCalId}`).collection('messages').doc(sourceMessage.id).update(data), 9000, 'message share URL cache write');
        } else {
          const ok = await updateMessageRest(activeCalId, sourceMessage.id, data);
          if (!ok) throw new Error('Message share URL cache update failed');
        }
        const patchMessage = msg => msg.id === sourceMessage.id ? { ...msg, ...data } : msg;
        setChatMessages(prev => prev.map(patchMessage));
        setChatUploadProgress({ pct: 100, remainingSec: 0, label: 'URL 생성완료' });
        return { shareUrl, imageUrl: null };
      }

      if (!firebaseStorage) throw new Error('Firebase Storage is not available');
      const uploaded = await uploadInlineChatImageToStorage(activeCalId, url, meta?.thumb || url, index, updateProgress, 12000);
      if (!uploaded?.imageUrl) throw new Error('Image upload failed');
      setChatUploadProgress({ pct: 100, remainingSec: 0, label: 'URL 생성완료' });
      return { shareUrl: uploaded.imageUrl, imageUrl: uploaded.imageUrl };
    } catch (err) {
      console.warn('Storage image URL generation failed, using Firestore share fallback:', err);
      try {
        setChatUploadProgress({ pct: 55, remainingSec: null, label: '대체 공유 링크 생성 중...' });
        const shareUrl = await createImageShareDocument(activeCalId, url, meta || {});
        setChatUploadProgress({ pct: 100, remainingSec: 0, label: 'URL 생성완료' });
        return { shareUrl, imageUrl: null };
      } catch (fallbackErr) {
        console.error('handlePromoteInlineChatImage failed:', fallbackErr);
        showToast('이미지 URL 생성 실패', 'error', 4000);
        throw fallbackErr;
      }
    } finally {
      setTimeout(() => setChatUploadProgress(null), 300);
    }
  };

  // Per-image hashtags (회비정산 URL 캐시와 동일하게 imageUrls/thumbUrls와 나란한 배열로 메시지
  // 문서에 저장, 한 이미지당 공백/쉼표로 구분된 태그 여러 개를 하나의 문자열로 보관) -- 갤러리/
  // 라이트박스의 이미지정보 패널에서 입력하고, GlobalSearchModal의 태그 검색에서 사용된다.
  // 이전 태그 목록과 비교해 새로 추가/삭제된 토큰마다 활동 로그를 남겨 어드민 페이지에서
  // 언제 어떤 해시태그가 추가/삭제됐는지 확인할 수 있게 한다.
  const handleSaveImageTags = async (messageId, imageIndex, tagsText, meta = {}) => {
    if (!messageId || !Number.isInteger(imageIndex)) return false;
    const sourceMessage = (chatMessages || []).find(msg => msg.id === messageId);
    if (!sourceMessage) return false;
    const isDirectMedia = !!meta?.directMediaUrl;
    const entryCount = getMessageImageEntries(sourceMessage).length;
    if (!isDirectMedia && (imageIndex < 0 || imageIndex >= entryCount)) return false;
    const parseTagTokens = text => Array.from(new Set(
      String(text || '').split(/[,\s#]+/).map(t => sanitizeText(t.trim(), 30)).filter(Boolean)
    )).slice(0, 10);
    const prevTokens = parseTagTokens(isDirectMedia ? sourceMessage.directMediaTags : (Array.isArray(sourceMessage.imageTags) ? sourceMessage.imageTags[imageIndex] : ''));
    const nextTokens = parseTagTokens(tagsText);
    const cleanTags = sanitizeText(nextTokens.join(' '), 100);
    const data = isDirectMedia ? { directMediaTags: cleanTags } : (() => {
      const nextImageTags = Array.isArray(sourceMessage.imageTags) ? [...sourceMessage.imageTags] : [];
      while (nextImageTags.length < entryCount) nextImageTags.push('');
      nextImageTags[imageIndex] = cleanTags;
      return { imageTags: nextImageTags };
    })();
    try {
      if (firebaseDb) {
        await withTimeout(firebaseDb.collection('calendars').doc(`cal_${activeCalId}`).collection('messages').doc(messageId).update(data), 9000, 'image tags write');
      } else {
        const ok = await updateMessageRest(activeCalId, messageId, data);
        if (!ok) throw new Error('Image tags update failed');
      }
      const now = Date.now();
      const added = nextTokens.filter(t => !prevTokens.includes(t));
      const removed = prevTokens.filter(t => !nextTokens.includes(t));
      const tagLogs = [
        ...added.map((t, i) => createActivityLog(activeCalId, 'tag_add', '', '', now + i, `#${t}`)),
        ...removed.map((t, i) => createActivityLog(activeCalId, 'tag_remove', '', '', now + added.length + i, `#${t}`))
      ].filter(Boolean);
      if (tagLogs.length > 0) await writeActivityLogsToFirestore(activeCalId, tagLogs);
    } catch (err) {
      console.error('Image tag save failed:', err);
      showToast('태그 저장 실패', 'error');
      return false;
    }
    const patchMessage = msg => msg.id === messageId ? { ...msg, ...data } : msg;
    setChatMessages(prev => prev.map(patchMessage));
    showToast('태그 저장완료', 'success');
    return true;
  };

  React.useEffect(() => {
    const rawId = getRawCalendarIdFromURL();
    if (rawId && !isAllowedCalendarId(rawId)) {
      const safeUrl = getCalendarShareUrl(activeCal?.id || activeCalId);
      window.history.replaceState({}, '', safeUrl);
      showToast('캘린더 주소 정리됨', 'error', 5000);
    }
  }, []);
  React.useEffect(() => {
    let cancelled = false;
    const requestedId = getCalendarIdFromURL();
    if (requestedId && !isAllowedCalendarId(requestedId)) {
      showToast('지원하지 않는 캘린더', 'error', 5000);
      return;
    }
    if (requestedId && !calendars.some(c => c.id === requestedId)) {
      const resolveRequestedCalendar = async () => {
        const existing = await fetchSingleCloudCalendar(requestedId, 1);
        if (cancelled) return;
        if (existing?.calendar) {
          applyServerCalendars(mergeCalendarCollections(calendars, [existing.calendar], {
            replaceMatchingId: true
          }), existing.lastModified || Date.now());
          setActiveCalId(requestedId);
          return;
        }
        showToast('캘린더를 찾을 수 없음', 'error');
      };
      resolveRequestedCalendar();
    }
    return () => {
      cancelled = true;
    };
  }, []);
  const handleSelectCalendar = id => {
    if (!isAllowedCalendarId(id)) {
      showToast('잘못된 캘린더 ID', 'error');
      return;
    }
    setActiveCalId(id);
    window.history.replaceState({}, '', getCalendarShareUrl(id));
  };
  const guardLoadedCalendar = (message = 'Firebase 데이터를 불러온 뒤 다시 시도해 주세요.') => {
    if (activeCalLoaded) return true;
    showToast(message, 'error');
    return false;
  };
  const handleSaveAvailability = (dateStr, participantId, note) => {
    if (!activeCalLoaded) {
      showToast('잠시 후 다시 시도', 'error');
      return false;
    }
    if (!activeCal || !isValidCalendarId(activeCal.id) || activeCal.id !== activeCalId) {
      showToast('캘린더 상태 확인 불가', 'error');
      return false;
    }
    if (!isValidDateString(dateStr)) {
      showToast('날짜 형식 오류', 'error');
      return false;
    }
    const activeParticipantIds = new Set(getActiveParticipants(activeCal).map(participant => participant.id));
    if (!activeParticipantIds.has(participantId)) {
      showToast('참여자 재선택 필요', 'error');
      return false;
    }
    const now = Date.now();
    const cleanNote = sanitizeText(note, 500);
    const existing = activeCal.availabilities || [];
    const index = existing.findIndex(e => e.date === dateStr && e.participantId === participantId);
    const existingActive = index >= 0 && !isTombstone(existing[index]);
    const action = existingActive ? 'update' : 'create';
    let nextAvail = [...existing];
    if (index >= 0) {
      nextAvail[index] = {
        ...nextAvail[index],
        date: dateStr,
        participantId,
        note: cleanNote,
        updatedAt: now,
        deletedAt: null
      };
    } else {
      nextAvail.push({
        date: dateStr,
        participantId,
        note: cleanNote,
        updatedAt: now
      });
    }
    const activityLog = createActivityLog(activeCal.id, action, dateStr, participantId, now, cleanNote);
    const updatedCal = {
      ...activeCal,
      updatedAt: now,
      revision: (activeCal.revision || 0) + 1,
      availabilities: nextAvail,
      activityLogs: activityLog ? [...getCalendarActivityLogs(activeCal), activityLog] : getCalendarActivityLogs(activeCal)
    };
    const nextCalendars = calendars.map(c => c.id === updatedCal.id ? updatedCal : c);
    return updateCalendars(nextCalendars, '등록완료', 'success', updatedCal.id, 'availability', activityLog ? [activityLog] : []);
  };
  const handleMoveAvailability = (entryReferId, sourceDate, targetDate, participantId, participantName) => {
    const formatDateKst = (dStr) => {
      const [y, m, d] = dStr.split('-').map(Number);
      const dateObj = new Date(y, m - 1, d);
      const days = ['일', '월', '화', '수', '목', '금', '토'];
      return `${m}월 ${d}일 (${days[dateObj.getDay()]})`;
    };
    
    const sourceFormatted = formatDateKst(sourceDate);
    const targetFormatted = formatDateKst(targetDate);
    const message = `${sourceFormatted} ${participantName}님의 일정을, ${targetFormatted} 으로 옮기시겠습니까?`;
    
    showConfirmDialog('일정 이동', message, async () => {
      if (!activeCalLoaded || !activeCal) {
        showToast('잠시 후 다시 시도', 'error');
        return;
      }
      const now = Date.now();
      const existing = activeCal.availabilities || [];
      const sourceIndex = existing.findIndex(e => e.date === sourceDate && e.participantId === participantId && !isTombstone(e));
      if (sourceIndex < 0) {
        showToast('원본 일정을 찾을 수 없습니다.', 'error');
        return;
      }
      const sourceEntry = existing[sourceIndex];
      const note = sourceEntry.note || '';
      
      let nextAvail = [...existing];
      nextAvail[sourceIndex] = {
        ...sourceEntry,
        deletedAt: now,
        updatedAt: now
      };
      
      const targetIndex = nextAvail.findIndex(e => e.date === targetDate && e.participantId === participantId);
      if (targetIndex >= 0) {
        nextAvail[targetIndex] = {
          ...nextAvail[targetIndex],
          note: note,
          deletedAt: null,
          updatedAt: now
        };
      } else {
        nextAvail.push({
          date: targetDate,
          participantId,
          note: note,
          updatedAt: now
        });
      }
      
      const deleteLog = createActivityLog(activeCal.id, 'delete', sourceDate, participantId, now, note);
      const createLog = createActivityLog(activeCal.id, targetIndex >= 0 ? 'update' : 'create', targetDate, participantId, now + 1, note);
      const logs = [];
      if (deleteLog) logs.push(deleteLog);
      if (createLog) logs.push(createLog);
      
      const updatedCal = {
        ...activeCal,
        updatedAt: now,
        revision: (activeCal.revision || 0) + 1,
        availabilities: nextAvail,
        activityLogs: [...getCalendarActivityLogs(activeCal), ...logs]
      };
      
      const nextCalendars = calendars.map(c => c.id === updatedCal.id ? updatedCal : c);
      await updateCalendars(nextCalendars, '일정 이동완료', 'success', updatedCal.id, 'availability', logs);
    });
  };
  // Registers one participant's availability across several dates in a single save -- used by
  // the recurring-schedule template ("반복 일정") so applying a weekly pattern doesn't fire one
  // network write per date.
  const handleBulkRegisterAvailability = (participantId, dateStrList, note) => {
    if (!activeCalLoaded || !activeCal) {
      showToast('잠시 후 다시 시도', 'error');
      return false;
    }
    const activeParticipantIds = new Set(getActiveParticipants(activeCal).map(participant => participant.id));
    if (!activeParticipantIds.has(participantId)) {
      showToast('참여자 재선택 필요', 'error');
      return false;
    }
    const validDates = (dateStrList || []).filter(isValidDateString);
    if (validDates.length === 0) return false;
    const now = Date.now();
    const cleanNote = sanitizeText(note, 500);
    let nextAvail = [...(activeCal.availabilities || [])];
    const activityLogs = [];
    validDates.forEach((dateStr, i) => {
      const index = nextAvail.findIndex(e => e.date === dateStr && e.participantId === participantId);
      const existingActive = index >= 0 && !isTombstone(nextAvail[index]);
      const action = existingActive ? 'update' : 'create';
      const stamp = now + i;
      if (index >= 0) {
        nextAvail[index] = { ...nextAvail[index], date: dateStr, participantId, note: cleanNote, updatedAt: stamp, deletedAt: null };
      } else {
        nextAvail.push({ date: dateStr, participantId, note: cleanNote, updatedAt: stamp });
      }
      const log = createActivityLog(activeCal.id, action, dateStr, participantId, stamp, cleanNote);
      if (log) activityLogs.push(log);
    });
    const updatedCal = {
      ...activeCal,
      updatedAt: now,
      revision: (activeCal.revision || 0) + 1,
      availabilities: nextAvail,
      activityLogs: activityLogs.length > 0 ? [...getCalendarActivityLogs(activeCal), ...activityLogs] : getCalendarActivityLogs(activeCal)
    };
    const nextCalendars = calendars.map(c => c.id === updatedCal.id ? updatedCal : c);
    return updateCalendars(nextCalendars, `${validDates.length}건 일괄 등록완료`, 'success', updatedCal.id, 'availability', activityLogs);
  };
  const handleDeleteAvailability = (dateStr, participantId) => {
    if (!activeCal || !isValidDateString(dateStr)) return false;
    const activeParticipantIds = new Set(getActiveParticipants(activeCal).map(participant => participant.id));
    if (!activeParticipantIds.has(participantId)) return false;
    const now = Date.now();
    const targetEntry = (activeCal.availabilities || []).find(e => e.date === dateStr && e.participantId === participantId && !isTombstone(e));
    if (!targetEntry) return false;
    const nextAvail = (activeCal.availabilities || []).map(e => e.date === dateStr && e.participantId === participantId ? {
      ...e,
      deletedAt: now,
      updatedAt: now
    } : e);
    const activityLog = createActivityLog(activeCal.id, 'delete', dateStr, participantId, now, targetEntry.note || '');
    const updatedCal = {
      ...activeCal,
      updatedAt: now,
      revision: (activeCal.revision || 0) + 1,
      availabilities: nextAvail,
      activityLogs: activityLog ? [...getCalendarActivityLogs(activeCal), activityLog] : getCalendarActivityLogs(activeCal)
    };
    const nextCalendars = calendars.map(c => c.id === updatedCal.id ? updatedCal : c);
    return updateCalendars(nextCalendars, '삭제완료', 'delete', updatedCal.id, 'availability', activityLog ? [activityLog] : []);
  };
  const handleDeleteAllForDate = dateStr => {
    if (!activeCal || !isValidDateString(dateStr)) return false;
    const now = Date.now();
    const activeEntries = (activeCal.availabilities || []).filter(e => e.date === dateStr && !isTombstone(e));
    if (activeEntries.length === 0) return false;
    const nextAvail = (activeCal.availabilities || []).map(e => e.date === dateStr ? {
      ...e,
      deletedAt: now,
      updatedAt: now
    } : e);
    const activityLogs = activeEntries.map((entry, index) =>
      createActivityLog(activeCal.id, 'delete', dateStr, entry.participantId, now + index, entry.note || '')
    ).filter(Boolean);
    const updatedCal = {
      ...activeCal,
      updatedAt: now,
      revision: (activeCal.revision || 0) + 1,
      availabilities: nextAvail,
      activityLogs: [...getCalendarActivityLogs(activeCal), ...activityLogs]
    };
    const nextCalendars = calendars.map(c => c.id === updatedCal.id ? updatedCal : c);
    return updateCalendars(nextCalendars, '삭제완료', 'delete', updatedCal.id, 'availability', activityLogs);
  };
  const handleConfirmMeeting = (dateStr, note) => {
    if (!activeCal || !isValidDateString(dateStr)) return false;
    const now = Date.now();
    const existingMeetings = getConfirmedMeetings(activeCal);
    const meetingIndex = existingMeetings.findIndex(m => m.date === dateStr);
    const isAlreadyConfirmed = meetingIndex >= 0 && existingMeetings[meetingIndex].confirmed !== false;
    let nextConfirmedMeetings;
    if (isAlreadyConfirmed) {
      // Un-confirming always keeps the entry around (marked confirmed:false) rather than ever
      // deleting it outright -- this used to only apply when the entry also carried settlement
      // data (Array.isArray(meeting.expenses) && meeting.expenses.length > 0), dropping it via
      // .filter() otherwise. That filtered-out case is exactly the one
      // ENABLE_PLACES_SUBCOLLECTION_MIGRATION can't represent: once a date's confirmedMeeting
      // entry has migrated out to its own calendars/{id}/confirmedMeetings/{date} doc (see
      // stripEmbeddedConfirmedMeetingField), the only way this write path knows to touch that doc
      // again is by that date still being present in nextConfirmedMeetings when
      // writeConfirmedMeetingsToFirestore's caller rebuilds legacyConfirmedMeetings from the
      // current embedded array -- an entry that gets deleted from the array here is simply never
      // written anywhere, so the old confirmed:true subcollection doc is left behind forever and
      // keeps getting unioned back in (unionConfirmedMeetings) as though 확정취소 never happened.
      // Keeping the entry (now confirmed:false, no settlement data) is otherwise inert --
      // getTrulyConfirmedMeetings already filters confirmed:false entries out of every "is this
      // date actually confirmed" caller (badges, reminders, ICS export, stats, summary lists), and
      // an entry with an empty/absent expenses array renders nothing in the settlement views
      // either, so it never becomes visible clutter.
      nextConfirmedMeetings = existingMeetings.map((m, i) => i === meetingIndex ? { ...m, confirmed: false } : m);
    } else if (meetingIndex >= 0) {
      // A settlement-only placeholder already exists for this date (created by
      // handleSaveExpense below) -- promote it to a real confirmed meeting instead of adding
      // a duplicate entry for the same date.
      nextConfirmedMeetings = existingMeetings.map((m, i) => i === meetingIndex
        ? { ...m, confirmed: true, note: sanitizeText(note, 500), confirmedAt: now }
        : m);
    } else {
      nextConfirmedMeetings = [...existingMeetings, { date: dateStr, note: sanitizeText(note, 500), confirmedAt: now, confirmed: true }];
    }
    const action = isAlreadyConfirmed ? 'meeting_cancel' : 'meeting_confirm';
    const logNote = sanitizeText(note || '', 500) || (isAlreadyConfirmed ? '모임 확정 취소됨' : '모임 확정됨');
    const meetingLog = createActivityLog(activeCal.id, action, dateStr, '', now, logNote);
    const updatedCal = {
      ...activeCal,
      confirmedMeeting: nextConfirmedMeetings,
      updatedAt: now,
      revision: (activeCal.revision || 0) + 1,
      activityLogs: meetingLog ? [...getCalendarActivityLogs(activeCal), meetingLog] : getCalendarActivityLogs(activeCal)
    };
    const nextCalendars = calendars.map(c => c.id === updatedCal.id ? updatedCal : c);
    return updateCalendars(nextCalendars, isAlreadyConfirmed ? '모임 확정 취소' : '모임 확정', 'success', updatedCal.id, 'settings', meetingLog ? [meetingLog] : []);
  };
  // Saved via saveMode 'settings' like confirmedMeeting itself -- mergeCalendarSettingsDelta
  // does a blind {...server, ...incoming} for fields it doesn't explicitly preserve/merge (see
  // its handling of availabilities/polls for contrast), so two near-simultaneous 'settings'
  // saves from different tabs (e.g. this and handleSetPinnedNotice) can still let a stale local
  // confirmedMeeting/pinnedNotice/expenses snapshot overwrite a fresher one. Pre-existing pattern
  // shared by every other settings-mode field in this app (title, description, ...); a real fix
  // would need confirmedMeeting/pinnedNotice to get their own dedicated saveMode + delta-merge
  // function the way availabilities and polls already do.
  const handleSaveExpense = async (dateStr, expense) => {
    if (!activeCal || !isValidDateString(dateStr)) return false;
    const existingMeetings = getConfirmedMeetings(activeCal);
    let meetingIndex = existingMeetings.findIndex(m => m.date === dateStr);
    // Editing an existing expense always targets an already-saved entry; adding a new one is
    // allowed on any date (모임확정 여부와 무관), so create an unconfirmed settlement-only
    // placeholder entry on the fly the first time someone logs income/expenses for that date.
    if (meetingIndex < 0 && expense?.id) return false;
	    const cleanLabel = sanitizeText(expense?.label || '', 120);
	    const cleanUrl = sanitizeText(expense?.url || '', 220);
	    const categoryIds = new Set(getExpenseCategories(activeCal).map(category => category.id));
	    const cleanCategoryId = categoryIds.has(expense?.categoryId) ? expense.categoryId : 'etc';
	    const cleanAmount = Number.isFinite(expense?.amount) && expense.amount !== 0 ? Math.round(expense.amount) : 0;
    if ((!cleanLabel && !cleanUrl) || !cleanAmount) return false;
    
    let linkPreview = null;
    if (cleanUrl) {
      if (expense?.id) {
        const meeting = existingMeetings[meetingIndex];
        const existingExp = meeting?.expenses?.find(e => e.id === expense.id);
        if (existingExp && existingExp.url === cleanUrl && existingExp.linkPreview) {
          linkPreview = existingExp.linkPreview;
        }
      }
      if (!linkPreview) {
        try {
          const res = await fetchLinkPreview(cleanUrl);
          if (res && res.status === 'success') {
            linkPreview = res.data;
          }
        } catch (e) {
          console.warn("Failed to fetch link preview on expense save:", e);
        }
      }
    }

    const now = Date.now();
    let meetings = existingMeetings;
    if (meetingIndex < 0) {
      meetings = [...existingMeetings, { date: dateStr, note: '', confirmedAt: null, confirmed: false, expenses: [] }];
      meetingIndex = meetings.length - 1;
    }
    const meeting = meetings[meetingIndex];
	    const existingExpenses = Array.isArray(meeting.expenses) ? meeting.expenses : [];
	    const isEditing = !!expense?.id;
	    const nextExpenses = isEditing
	      ? existingExpenses.map(e => e.id === expense.id ? { ...e, label: cleanLabel, url: cleanUrl, categoryId: cleanCategoryId, amount: cleanAmount, updatedAt: now, linkPreview: linkPreview || null } : e)
	      : [...existingExpenses, { id: `exp_${activeCal.id}_${dateStr}_${now}_${Math.random().toString(36).slice(2, 7)}`, label: cleanLabel, url: cleanUrl, categoryId: cleanCategoryId, amount: cleanAmount, order: existingExpenses.length, createdAt: now, updatedAt: now, linkPreview: linkPreview || null }];
    const nextConfirmedMeetings = meetings.map((m, i) => i === meetingIndex ? { ...m, expenses: nextExpenses, amount: null } : m);
    // Expense/income entries have no participant selector of their own, so these logs carry an
    // empty participantId (matching how poll activity logs already handle system-level actions)
    // -- the admin log UI falls back to a generic '정산' label for that case.
    const fmtAmt = n => `${Number(n) < 0 ? '+' : '-'}${Math.abs(Number(n) || 0).toLocaleString()}원`;
    const expCats = getExpenseCategories(activeCal);
    const expCatName = id => (expCats.find(c => c.id === id) || {}).name || id || '-';
    const prevExp = isEditing ? existingExpenses.find(e => e.id === expense.id) : null;
    let expenseLogNote;
    if (isEditing && prevExp) {
      expenseLogNote = buildFieldChangeNote(cleanLabel || cleanUrl || '정산', [
        { key: '금액', before: fmtAmt(prevExp.amount), after: fmtAmt(cleanAmount) },
        { key: '명목', before: prevExp.label || prevExp.url || '', after: cleanLabel || cleanUrl },
        { key: '카테고리', before: expCatName(prevExp.categoryId), after: expCatName(cleanCategoryId) }
      ]);
    } else {
      expenseLogNote = sanitizeText(`${fmtAmt(cleanAmount)} ${cleanLabel || cleanUrl} · ${expCatName(cleanCategoryId)}`, 300);
    }
    const expenseActivityLog = createActivityLog(activeCal.id, isEditing ? 'expense_update' : 'expense_create', dateStr, '', now, expenseLogNote);
    const updatedCal = {
      ...activeCal,
      confirmedMeeting: nextConfirmedMeetings,
      updatedAt: now,
      revision: (activeCal.revision || 0) + 1,
      activityLogs: expenseActivityLog ? [...getCalendarActivityLogs(activeCal), expenseActivityLog] : getCalendarActivityLogs(activeCal)
    };
    const nextCalendars = calendars.map(c => c.id === updatedCal.id ? updatedCal : c);
    return updateCalendars(nextCalendars, '지출 저장완료', 'success', updatedCal.id, 'settings', expenseActivityLog ? [expenseActivityLog] : []);
  };
  const handleDeleteExpense = (dateStr, expenseId) => {
    // Confirm rule: UI layer (DateModal) shows confirm once. Do not confirm again here.
    if (!activeCal || !isValidDateString(dateStr)) return false;
    const existingMeetings = getConfirmedMeetings(activeCal);
    const meetingIndex = existingMeetings.findIndex(m => m.date === dateStr);
    if (meetingIndex < 0) return false;
    const meeting = existingMeetings[meetingIndex];
    const deletedExpense = (Array.isArray(meeting.expenses) ? meeting.expenses : []).find(e => e.id === expenseId);
    if (!deletedExpense) return false;

    const nextExpenses = (Array.isArray(meeting.expenses) ? meeting.expenses : []).filter(e => e.id !== expenseId);
    const now = Date.now();
    const nextConfirmedMeetings = existingMeetings.map((m, i) => i === meetingIndex ? { ...m, expenses: nextExpenses } : m);
    const expenseLogNote = sanitizeText(
      `${deletedExpense.amount < 0 ? '+' : '-'}${Math.abs(Number(deletedExpense.amount) || 0).toLocaleString()}원 ${deletedExpense.label || deletedExpense.url || ''}`,
      120
    );
    const expenseActivityLog = createActivityLog(activeCal.id, 'expense_delete', dateStr, '', now, expenseLogNote);
    const updatedCal = {
      ...activeCal,
      confirmedMeeting: nextConfirmedMeetings,
      updatedAt: now,
      revision: (activeCal.revision || 0) + 1,
      activityLogs: expenseActivityLog ? [...getCalendarActivityLogs(activeCal), expenseActivityLog] : getCalendarActivityLogs(activeCal)
    };
    const nextCalendars = calendars.map(c => c.id === updatedCal.id ? updatedCal : c);
    return updateCalendars(nextCalendars, '지출 삭제완료', 'success', updatedCal.id, 'settings', expenseActivityLog ? [expenseActivityLog] : []);
  };

  const handleReorderExpenses = (dateStr, orderedExpenseIds) => {
    if (!activeCal || !isValidDateString(dateStr) || !Array.isArray(orderedExpenseIds) || orderedExpenseIds.length < 2) return false;
    const existingMeetings = getConfirmedMeetings(activeCal);
    const meetingIndex = existingMeetings.findIndex(m => m.date === dateStr);
    if (meetingIndex < 0) return false;
    const meeting = existingMeetings[meetingIndex];
    const existingExpenses = Array.isArray(meeting.expenses) ? meeting.expenses : [];
    if (existingExpenses.length < 2) return false;
    const expenseById = new Map(existingExpenses.map(expense => [expense.id, expense]));
    const nextExpenses = [];
    orderedExpenseIds.forEach(id => {
      if (expenseById.has(id)) {
        nextExpenses.push({ ...expenseById.get(id), order: nextExpenses.length });
        expenseById.delete(id);
      }
    });
    expenseById.forEach(expense => {
      nextExpenses.push({ ...expense, order: nextExpenses.length });
    });
    if (nextExpenses.length !== existingExpenses.length) return false;
    const same = existingExpenses.every((e, i) => e.id === nextExpenses[i].id);
    if (same) return true;
    const now = Date.now();
    const nextConfirmedMeetings = existingMeetings.map((m, i) => i === meetingIndex ? { ...m, expenses: nextExpenses } : m);
    const updatedCal = {
      ...activeCal,
      confirmedMeeting: nextConfirmedMeetings,
      updatedAt: now,
      revision: (activeCal.revision || 0) + 1
    };
    const nextCalendars = calendars.map(c => c.id === updatedCal.id ? updatedCal : c);
    return updateCalendars(nextCalendars, '지출 순서 저장완료', 'success', updatedCal.id, 'settings', []);
  };
  const handleSavePlace = (placeData) => {
    if (!activeCal || !Number.isFinite(placeData?.lat) || !Number.isFinite(placeData?.lng)) return false;
    const cleanName = sanitizeText(placeData?.name || '', 80);
    if (!cleanName) return false;
    const now = Date.now();
    const existingPlaces = getCalendarPlaces(activeCal);
    const isEditing = !!placeData.id;
    const categoryIds = new Set(getPlaceCategories(activeCal).map(c => c.id));
    const cleanCategoryId = categoryIds.has(placeData.categoryId) ? placeData.categoryId : 'etc';
    const cleanAddress = normalizePlaceAddressForSave(placeData.address || '', placeData.lat, placeData.lng);
    const cleanAlias = sanitizeText(placeData.alias || '', 80);
    const cleanMemo = sanitizeText(placeData.memo || '', 2000);
    const cleanVisitStatus = placeData.visitStatus === 'planned' ? 'planned' : 'visited';
    const cleanVisitDate = cleanVisitStatus === 'visited' && isValidDateString(placeData.visitDate) ? placeData.visitDate : '';
    const editedFields = { name: cleanName, alias: cleanAlias, address: cleanAddress, lat: placeData.lat, lng: placeData.lng, categoryId: cleanCategoryId, memo: cleanMemo, visitStatus: cleanVisitStatus, visitDate: cleanVisitDate, updatedAt: now };
    let nextPlaces;
    if (isEditing) {
      const found = existingPlaces.some(p => p.id === placeData.id);
      nextPlaces = found
        ? existingPlaces.map(p => p.id === placeData.id ? { ...p, ...editedFields } : p)
        : [...existingPlaces, { id: placeData.id, ...editedFields, createdAt: now }];
    } else {
      // RULE: 주소/좌표/이름으로 기존 장소와 합치지 않음.
      // 같은 단지에 도은네·은우네·서준네처럼 별칭·메모가 다른 장소는 각각 별도 문서.
      nextPlaces = [...existingPlaces, { id: `place_${activeCal.id}_${now}_${Math.random().toString(36).slice(2, 7)}`, ...editedFields, createdAt: now }];
    }
    const prevPlace = isEditing ? existingPlaces.find(p => p.id === placeData.id) : null;
    const displayLabel = cleanAlias || cleanName || '장소';
    const placeCats = getPlaceCategories(activeCal);
    const catName = id => (placeCats.find(c => c.id === id) || {}).name || id || '-';
    let placeLogNote = displayLabel;
    if (isEditing && prevPlace) {
      placeLogNote = buildFieldChangeNote(displayLabel, [
        { key: '별칭', before: prevPlace.alias || '', after: cleanAlias },
        { key: '이름', before: prevPlace.name || '', after: cleanName },
        { key: '메모', before: prevPlace.memo || '', after: cleanMemo },
        { key: '카테고리', before: catName(prevPlace.categoryId), after: catName(cleanCategoryId) },
        { key: '주소', before: prevPlace.address || '', after: cleanAddress },
        { key: '방문', before: prevPlace.visitStatus === 'planned' ? '예정' : '방문', after: cleanVisitStatus === 'planned' ? '예정' : '방문' },
        { key: '일자', before: prevPlace.visitDate || '', after: cleanVisitDate }
      ]);
    } else if (!isEditing) {
      const bits = [displayLabel];
      if (cleanAlias && cleanAlias !== cleanName) bits.push(`별칭 ${cleanAlias}`);
      if (cleanMemo) bits.push(`메모 ${sanitizeText(cleanMemo, 40)}`);
      if (cleanCategoryId && cleanCategoryId !== 'etc') bits.push(`카테고리 ${catName(cleanCategoryId)}`);
      if (cleanVisitDate) bits.push(`일자 ${cleanVisitDate}`);
      placeLogNote = sanitizeText(bits.join(' · '), 300);
    }
    const placeActivityLog = createActivityLog(activeCal.id, isEditing ? 'place_update' : 'place_create', '', '', now, placeLogNote);
    const updatedCal = {
      ...activeCal,
      places: nextPlaces,
      updatedAt: now,
      revision: (activeCal.revision || 0) + 1,
      activityLogs: placeActivityLog ? [...getCalendarActivityLogs(activeCal), placeActivityLog] : getCalendarActivityLogs(activeCal)
    };
    const nextCalendars = calendars.map(c => c.id === updatedCal.id ? updatedCal : c);
    return updateCalendars(nextCalendars, isEditing ? '장소 수정완료' : '장소 등록완료', 'success', updatedCal.id, 'settings', placeActivityLog ? [placeActivityLog] : []);
  };
  const handleDeletePlace = (placeId) => {
    if (!activeCal || !placeId) return false;
    if (firebaseDb) {
      try {
        firebaseDb.collection('calendars').doc(`cal_${activeCal.id}`).collection('places').doc(placeId).delete().catch(e => {});
      } catch (e) {
        console.warn('Failed to delete place from Firestore:', e);
      }
    }
    const existingPlaces = getCalendarPlaces(activeCal);
    const deletedPlace = existingPlaces.find(p => p.id === placeId);
    if (!deletedPlace) return false;
    const now = Date.now();
    const nextPlaces = existingPlaces.filter(p => p.id !== placeId);
    const placeActivityLog = createActivityLog(activeCal.id, 'place_delete', '', '', now, deletedPlace.name || '장소');
    const updatedCal = {
      ...activeCal,
      places: nextPlaces,
      updatedAt: now,
      revision: (activeCal.revision || 0) + 1,
      activityLogs: placeActivityLog ? [...getCalendarActivityLogs(activeCal), placeActivityLog] : getCalendarActivityLogs(activeCal)
    };
    const nextCalendars = calendars.map(c => c.id === updatedCal.id ? updatedCal : c);
    return updateCalendars(nextCalendars, '장소 삭제완료', 'delete', updatedCal.id, 'settings', placeActivityLog ? [placeActivityLog] : []);
  };
  const handleDeleteActivityLog = log => {
    if (!activeCal || !log?.id) return false;
    const logId = sanitizeText(log.id, 160);
    if (!logId) return false;
    const now = Date.now();
    const updatedCal = {
      ...activeCal,
      updatedAt: now,
      revision: (activeCal.revision || 0) + 1,
      activityLogs: getCalendarActivityLogs(activeCal),
      deletedActivityLogIds: mergeDeletedActivityLogIds(activeCal.deletedActivityLogIds || [], [logId])
    };
    const nextCalendars = calendars.map(c => c.id === updatedCal.id ? updatedCal : c);
    return updateCalendars(nextCalendars, '로그 삭제완료', 'delete', updatedCal.id);
  };
  const handleOpenPollCreate = () => {
    if (!guardLoadedCalendar('Firebase 데이터를 불러온 뒤 투표를 생성해 주세요.')) return;
    setEditingPoll(null);
    setIsPollModalOpen(true);
  };
  const handleOpenPollEdit = poll => {
    if (!guardLoadedCalendar('Firebase 데이터를 불러온 뒤 투표를 수정해 주세요.')) return;
    setEditingPoll(poll);
    setIsPollModalOpen(true);
  };
  const handleSavePoll = poll => {
    if (!guardLoadedCalendar('Firebase 데이터를 불러온 뒤 투표를 저장해 주세요.')) return false;
    const now = Date.now();
    const participantIds = new Set(getActiveParticipants(activeCal).map(participant => participant.id));
    const existingPoll = getCalendarPolls(activeCal).find(item => item.id === poll?.id);
    const normalizedPoll = normalizePoll(activeCal.id, {
      ...poll,
      calendarId: activeCal.id,
      updatedAt: now,
      createdAt: poll.createdAt || now
    }, participantIds);
    if (!normalizedPoll) {
      showToast('투표명·옵션 확인 필요', 'error');
      return false;
    }
    const activityLog = !existingPoll
      ? createPollActivityLog(activeCal.id, 'poll_create', '', now, normalizedPoll.title)
      : null;
    const updatedCal = {
      ...activeCal,
      updatedAt: now,
      revision: (activeCal.revision || 0) + 1,
      polls: mergePolls(getCalendarPolls(activeCal), [normalizedPoll], activeCal.id, participantIds),
      activityLogs: activityLog ? [...getCalendarActivityLogs(activeCal), activityLog] : getCalendarActivityLogs(activeCal)
    };
    const nextCalendars = calendars.map(c => c.id === updatedCal.id ? updatedCal : c);
    return updateCalendars(nextCalendars, '투표 저장완료', 'success', updatedCal.id, 'polls', activityLog ? [activityLog] : []);
  };
  const handleOpenVoteSheet = (poll, option) => {
    if (!guardLoadedCalendar('Firebase 데이터를 불러온 뒤 투표해 주세요.')) return false;
    if (isPollClosed(poll)) {
      showToast('마감된 투표입니다', 'error');
      return false;
    }
    const activeParticipants = getActiveParticipants(activeCal);
    if (activeParticipants.length === 0) {
      showToast('참여자 설정 필요', 'error');
      return false;
    }
    setVoteTarget({ pollId: poll.id, optionId: option.id });
    return true;
  };
  const handleVotePoll = (pollId, optionId, participantId) => {
    if (!guardLoadedCalendar('Firebase 데이터를 불러온 뒤 투표해 주세요.')) return false;
    const activeParticipants = getActiveParticipants(activeCal);
    const participantIds = new Set(activeParticipants.map(participant => participant.id));
    if (!participantIds.has(participantId)) {
      showToast('참여자 재선택 필요', 'error');
      return false;
    }
    const poll = getCalendarPolls(activeCal).find(item => item.id === pollId);
    const option = getActivePollOptions(poll).find(item => item.id === optionId);
    if (!poll || !option) {
      showToast('투표 정보 확인 필요', 'error');
      return false;
    }
    if (isPollClosed(poll)) {
      showToast('마감된 투표입니다', 'error');
      return false;
    }
    const now = Date.now();
    const optionIds = new Set(getActivePollOptions(poll).map(item => item.id));
    const votes = normalizePollVotes(poll.votes || {}, optionIds, participantIds);
    const alreadyVoted = (votes[option.id] || []).includes(participantId);
    votes[option.id] = Array.from(new Set([...(votes[option.id] || []), participantId]));
    const nextPoll = {
      ...poll,
      votes,
      updatedAt: now
    };
    const activityLog = !alreadyVoted
      ? createPollActivityLog(activeCal.id, 'poll_vote', participantId, now, `${poll.title} / ${option.text}`)
      : null;
    const updatedCal = {
      ...activeCal,
      updatedAt: now,
      revision: (activeCal.revision || 0) + 1,
      polls: mergePolls(getCalendarPolls(activeCal), [nextPoll], activeCal.id, participantIds),
      activityLogs: activityLog ? [...getCalendarActivityLogs(activeCal), activityLog] : getCalendarActivityLogs(activeCal)
    };
    const nextCalendars = calendars.map(c => c.id === updatedCal.id ? updatedCal : c);
    setVoteTarget(null);
    return updateCalendars(nextCalendars, '투표 반영완료', 'success', updatedCal.id, 'polls', activityLog ? [activityLog] : []);
  };
  const handleCancelVote = (poll, option, participantId) => {
    if (!guardLoadedCalendar('Firebase 데이터를 불러온 뒤 투표를 취소해 주세요.')) return false;
    if (isPollClosed(poll)) {
      showToast('마감된 투표입니다', 'error');
      return false;
    }
    const activeParticipants = getActiveParticipants(activeCal);
    const participantIds = new Set(activeParticipants.map(participant => participant.id));
    const optionIds = new Set(getActivePollOptions(poll).map(item => item.id));
    const votes = normalizePollVotes(poll.votes || {}, optionIds, participantIds);
    const hadVote = (votes[option.id] || []).includes(participantId);
    votes[option.id] = (votes[option.id] || []).filter(id => id !== participantId);
    const now = Date.now();
    const nextPoll = {
      ...poll,
      votes,
      updatedAt: now
    };
    const activityLog = hadVote
      ? createPollActivityLog(activeCal.id, 'poll_cancel', participantId, now, `${poll.title} / ${option.text}`)
      : null;
    const updatedCal = {
      ...activeCal,
      updatedAt: now,
      revision: (activeCal.revision || 0) + 1,
      polls: mergePolls(getCalendarPolls(activeCal), [nextPoll], activeCal.id, participantIds),
      activityLogs: activityLog ? [...getCalendarActivityLogs(activeCal), activityLog] : getCalendarActivityLogs(activeCal)
    };
    const nextCalendars = calendars.map(c => c.id === updatedCal.id ? updatedCal : c);
    return updateCalendars(nextCalendars, '투표 취소 완료', 'delete', updatedCal.id, 'polls', activityLog ? [activityLog] : []);
  };
  const handleSaveAdmin = (updatedCal, newCalCreated) => {
    if (!activeCalLoaded && !newCalCreated) {
      showToast('잠시 후 다시 시도', 'error');
      return false;
    }
    if (newCalCreated) {
      if (!isAllowedCalendarId(newCalCreated.id)) {
        showToast('지원하지 않는 캘린더', 'error');
        return false;
      }
      const nextCalendars = [newCalCreated, ...calendars];
      handleSelectCalendar(newCalCreated.id);
      return updateCalendars(nextCalendars, '캘린더 생성완료', 'success', newCalCreated.id, 'replace');
    } else {
      const now = Date.now();
      const stampedCal = {
        ...updatedCal,
        updatedAt: now,
        revision: (updatedCal.revision || 0) + 1,
        title: sanitizeText(updatedCal.title, 80),
        description: sanitizeText(updatedCal.description, 160),
        participants: updatedCal.participants
      };
      if (!assertCalendarLinks(stampedCal)) {
        showToast('참여자·일정 확인 필요', 'error');
        return false;
      }
      const nextCalendars = calendars.map(c => c.id === stampedCal.id ? stampedCal : c);
      return updateCalendars(nextCalendars, '설정 저장완료', 'success', stampedCal.id, 'settings');
    }
  };
  const handleUpdateWeatherLocation = async (location) => {
    if (!guardLoadedCalendar()) return false;
    const now = Date.now();
    const currentRecents = activeCal.recentLocations || [];
    const updatedRecents = [
      location,
      ...currentRecents.filter(loc => loc.name !== location.name)
    ].slice(0, 8);
    const updatedCal = {
      ...activeCal,
      weatherLocation: location,
      recentLocations: updatedRecents,
      updatedAt: now,
      revision: (activeCal.revision || 0) + 1
    };
    const nextCalendars = calendars.map(c => c.id === updatedCal.id ? updatedCal : c);
    return updateCalendars(nextCalendars, '날씨 지역 설정 완료', 'success', updatedCal.id, 'settings');
  };
  const handleDeleteRecentWeatherLocation = async (location) => {
    if (!guardLoadedCalendar()) return false;
    const now = Date.now();
    const currentRecents = activeCal.recentLocations || [];
    const updatedRecents = currentRecents.filter(loc => loc.name !== location.name);
    const updatedCal = {
      ...activeCal,
      recentLocations: updatedRecents,
      updatedAt: now,
      revision: (activeCal.revision || 0) + 1
    };
    const nextCalendars = calendars.map(c => c.id === updatedCal.id ? updatedCal : c);
    return updateCalendars(nextCalendars, '자주 찾는 지역이 삭제되었습니다.', 'success', updatedCal.id, 'settings');
  };
  const handleAddPinnedNotice = (text, authorName) => {
    if (!guardLoadedCalendar()) return false;
    const cleanText = sanitizeText(text || '', 200);
    if (!cleanText) return false;
    const now = Date.now();
    const notice = { id: `notice_${activeCal.id}_${now}_${Math.random().toString(36).slice(2, 7)}`, text: cleanText, setAt: now, setBy: authorName || '' };
    const updatedCal = {
      ...activeCal,
      pinnedNotices: [...getPinnedNotices(activeCal), notice],
      pinnedNotice: null,
      updatedAt: now,
      revision: (activeCal.revision || 0) + 1
    };
    const nextCalendars = calendars.map(c => c.id === updatedCal.id ? updatedCal : c);
    return updateCalendars(nextCalendars, '공지 등록완료', 'success', updatedCal.id, 'settings');
  };
  const handleRemovePinnedNotice = (noticeId) => {
    if (!guardLoadedCalendar()) return false;
    const target = getPinnedNotices(activeCal).find(n => n.id === noticeId);
    const noticeText = target ? target.text : '';
    const shortText = noticeText.length > 30 ? noticeText.substring(0, 30) + '...' : noticeText;
    showConfirmDialog(
      '공지사항 삭제',
      `"${shortText}" 내용의 공지사항을 삭제하시겠습니까?`,
      () => {
        const now = Date.now();
        const updatedCal = {
          ...activeCal,
          pinnedNotices: getPinnedNotices(activeCal).filter(n => n.id !== noticeId),
          pinnedNotice: null,
          updatedAt: now,
          revision: (activeCal.revision || 0) + 1
        };
        const nextCalendars = calendars.map(c => c.id === updatedCal.id ? updatedCal : c);
        updateCalendars(nextCalendars, '공지 삭제완료', 'success', updatedCal.id, 'settings');
      }
    );
  };
  // App() early-returns a completely different tree per activeView (see the 5 branches below),
  // so the sticky mini player can't just live inline in one of them -- it has to be included as
  // a stable sibling in every branch's return, wrapped in the SAME portal element shape each
  // time, or React would unmount/remount (and restart) it on every tab switch. See StickyVideoBox
  // for the actual floating player and changeView above for how a video gets promoted into it.
  const withStickyVideo = (content) => /*#__PURE__*/React.createElement(React.Fragment, null,
    content,
    /*#__PURE__*/React.createElement(StickyVideoBox, {
      stickyVideo: stickyVideo,
      onClose: () => setStickyVideo(null),
      onGoToChat: () => { changeView('chat'); setStickyVideo(null); }
    }),
    isModalOpen && /*#__PURE__*/React.createElement(DateModal, {
      anniversaries: anniversaries,
      dateStr: selectedDate,
      calendar: activeCal,
      onSave: handleSaveAvailability,
      onDelete: handleDeleteAvailability,
      onDeleteDate: handleDeleteAllForDate,
      onConfirmMeeting: handleConfirmMeeting,
      onSaveExpense: handleSaveExpense,
      onDeleteExpense: handleDeleteExpense,
      onReorderExpenses: handleReorderExpenses,
      onSavePlace: handleSavePlace,
      onDeletePlace: handleDeletePlace,
      showToast: showToast,
      onRequestConfirm: showConfirmDialog,
      onClose: () => setIsModalOpen(false),
      onParticipantClick: handleParticipantClick
    }),
    confirmDialog && /*#__PURE__*/React.createElement(ConfirmDialog, {
      title: confirmDialog.title,
      message: confirmDialog.message,
      onConfirm: confirmDialog.onConfirm,
      onCancel: () => setConfirmDialog(null),
      showPasswordInput: confirmDialog.showPasswordInput
    }),
    deletingMessage && /*#__PURE__*/React.createElement(DeleteConfirmModal, {
      message: deletingMessage,
      calendar: activeCal,
      onConfirm: handleConfirmDeleteMessage,
      onCancel: () => setDeletingMessage(null)
    }),
    editingMessage && /*#__PURE__*/React.createElement(EditMessageModal, {
      message: editingMessage,
      calendar: activeCal,
      onSave: handleSaveEditMessage,
      onClose: () => setEditingMessage(null),
      showToast: showToast
    }),
    isAdminOpen && /*#__PURE__*/React.createElement(AdminModal, {
      anniversaries: anniversaries,
      calendar: { ...activeCal, activityLogs: unionActivityLogs(activeCal, adminActivityLogs) },
      allCalendars: calendars,
      onSelectCalendar: handleSelectCalendar,
      onLoadActivityLogs: loadAdminActivityLogs,
      onSave: handleSaveAdmin,
      recentMessages: recentMessages,
      chatMessages: chatMessages,
      onDeleteMessage: handleDeleteMessage,
      onDeleteAvailability: handleDeleteAvailability,
      onDeleteAllForDate: handleDeleteAllForDate,
      onBulkRegister: handleBulkRegisterAvailability,
      onRequestConfirm: showConfirmDialog,
      onClose: () => setIsAdminOpen(false),
      showToast: showToast,
      onDeleteLog: handleDeleteActivityLog,
      chatParticipantId: chatParticipantId,
      themeChoice: themeChoice,
      toggleTheme: toggleTheme,
      isDarkTheme: isDarkTheme,
      fontScalePercent: fontScalePercent,
      setFontScalePercent: setFontScalePercent,
      onSelectDate: d => {
        setSelectedDate(d);
        setIsModalOpen(true);
      },
      onOpenChatMessage: messageId => {
        changeView('chat');
        setTimeout(() => {
          const el = document.querySelector(`[data-msg-row-id="${messageId}"]`);
          if (!el) return;
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.classList.add('search-result-flash');
          setTimeout(() => el.classList.remove('search-result-flash'), 1700);
        }, 350);
      },
      onOpenImage: (messageId, imageIndex, directMediaUrl = '') => {
        changeView('chat');
        setTimeout(() => {
          const msg = chatMessages.find(m => m.id === messageId);
          if (!msg) return;
          const directEntry = getMessageDirectMediaEntry(msg);
          const entries = directMediaUrl && directEntry ? [directEntry] : getMessageImageEntries(msg);
          setActiveLightbox({
            urls: entries.map(e => e.full),
            meta: entries.map(e => ({ timestamp: msg.timestamp, messageId: msg.id, imageIndex: e.imageIndex, thumb: e.thumb, tags: e.tags, directMediaUrl: e.directMediaUrl })),
            index: directMediaUrl ? 0 : imageIndex
          });
        }, 350);
      }
    }),
    isGlobalSearchOpen && /*#__PURE__*/React.createElement(GlobalSearchModal, {
      calendar: activeCal,
      chatMessages: chatMessages,
      memos: memos,
      initialQuery: globalSearchInitialQuery,
      onClose: () => setIsGlobalSearchOpen(false),
      onOpenMemo: () => changeView('memo'),
      onSelectDate: d => {
        setSelectedDate(d);
        setIsModalOpen(true);
      },
      onOpenChatMessage: messageId => {
        changeView('chat');
        setTimeout(() => {
          const el = document.querySelector(`[data-msg-row-id="${messageId}"]`);
          if (!el) return;
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.classList.add('search-result-flash');
          setTimeout(() => el.classList.remove('search-result-flash'), 1700);
        }, 350);
      },
      onOpenImage: (messageId, imageIndex, directMediaUrl = '') => {
        changeView('chat');
        setTimeout(() => {
          const msg = chatMessages.find(m => m.id === messageId);
          if (!msg) return;
          const directEntry = getMessageDirectMediaEntry(msg);
          const entries = directMediaUrl && directEntry ? [directEntry] : getMessageImageEntries(msg);
          setActiveLightbox({
            urls: entries.map(e => e.full),
            meta: entries.map(e => ({ timestamp: msg.timestamp, messageId: msg.id, imageIndex: e.imageIndex, thumb: e.thumb, tags: e.tags, directMediaUrl: e.directMediaUrl })),
            index: directMediaUrl ? 0 : imageIndex
          });
        }, 350);
      },
      onNotificationPermissionBlocked: openNotificationHelp
    }),
    isShareOpen && /*#__PURE__*/React.createElement(ShareModal, {
      calendar: activeCal,
      showToast: showToast,
      onClose: () => setIsShareOpen(false)
    }),
    isChatShareOpen && /*#__PURE__*/React.createElement(ShareModal, {
      calendar: activeCal,
      shareType: "chat",
      showToast: showToast,
      onClose: () => setIsChatShareOpen(false)
    }),
    isPollModalOpen && /*#__PURE__*/React.createElement(PollModal, {
      calendar: activeCal,
      poll: editingPoll,
      onRequestConfirm: showConfirmDialog,
      onSave: handleSavePoll,
      onClose: () => {
        setIsPollModalOpen(false);
        setEditingPoll(null);
      },
      showToast: showToast
    }),
    voteTarget && /*#__PURE__*/React.createElement(PollVoterSheet, {
      calendar: activeCal,
      pollId: voteTarget.pollId,
      optionId: voteTarget.optionId,
      onSelect: participantId => handleVotePoll(voteTarget.pollId, voteTarget.optionId, participantId),
      onClose: () => setVoteTarget(null)
    }),
    isChatSheetOpen && /*#__PURE__*/React.createElement(ChatParticipantSheet, {
      calendar: activeCal,
      selectedId: chatParticipantId,
      onSelect: id => {
        setChatParticipantId(id);
        setStoredChatParticipantId(activeCalId, id);
      },
      onClose: () => setIsChatSheetOpen(false)
    }),
    toast && /*#__PURE__*/React.createElement("div", {
      className: "toast",
      style: {
        position: 'fixed',
        bottom: '32px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 99999,
        backgroundColor: toast.type === 'delete' ? '#EF4444' : toast.type === 'success' ? '#10B981' : '#3B82F6',
        color: '#FFFFFF',
        padding: '12px 24px',
        borderRadius: '12px',
        boxShadow: '0 12px 32px rgba(0,0,0,0.25)',
        fontSize: '0.95rem',
        fontWeight: '800',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        textAlign: 'center',
        wordBreak: 'break-all',
        whiteSpace: 'pre-wrap',
        maxWidth: '380px',
        width: '90%',
        boxSizing: 'border-box'
      }
    }, toast.message),
    isNotificationHelpOpen && /*#__PURE__*/React.createElement(NotificationPermissionHelpModal, {
      onClose: () => setIsNotificationHelpOpen(false),
      onRetry: handleMainToggleNotifications,
      showToast: showToast
    }),
    operationProgress && !chatUploadProgress && /*#__PURE__*/React.createElement(OperationProgressOverlay, operationProgress),
    chatUploadProgress && /*#__PURE__*/React.createElement(ImageUploadOverlay, chatUploadProgress)
  );
  if (activeView === 'chat') {
    return withStickyVideo(/*#__PURE__*/React.createElement("div", { className: "chat-view-container" }, /*#__PURE__*/React.createElement(ChatRoomView, {
      calendar: activeCal,
      chatMessages: allChatMessages,
      loadingOlderChat: loadingOlderChat,
      hasMoreOlderChat: hasMoreOlderChat,
      onLoadOlderChat: loadOlderChatMessages,
      chatInput: chatInput,
      setChatInput: setChatInput,
      chatParticipantId: chatParticipantId,
      setChatParticipantId: setChatParticipantId,
      isChatSheetOpen: isChatSheetOpen,
      setIsChatSheetOpen: setIsChatSheetOpen,
      isChatSubmitting: isChatSubmitting,
      chatTextareaRef: chatTextareaRef,
      chatImage: chatImages,
      setChatImage: setChatImages,
      activeLightbox: activeLightbox,
      setActiveLightbox: setActiveLightbox,
      onSend: handleSendChatMessage,
      onDeleteMessage: handleDeleteMessage,
      onEditMessage: handleEditMessage,
      onAddPinnedNotice: handleAddPinnedNotice,
      onRemovePinnedNotice: handleRemovePinnedNotice,
      onBack: () => changeView('calendar'),
      isHeaderVisible: isHeaderVisible,
      handleChatScroll: handleChatScroll,
      onRevealChatInput: () => setIsHeaderVisible(true),
      chatMessagesContainerRef: chatMessagesContainerRef,
      showToast: showToast,
      onPromoteImageUrl: handlePromoteInlineChatImage,
      onSaveImageTags: handleSaveImageTags,
      onSearchTag: handleSearchTag,
      onShare: () => setIsChatShareOpen(true),
      isDarkTheme: isDarkTheme,
      onToggleTheme: toggleTheme,
      onOpenGallery: () => changeView('gallery'),
      onChangeView: changeView,
      fontScalePercent: fontScalePercent,
      onDecreaseFont: () => setFontScalePercent(prev => Math.max(80, prev - 10)),
      onIncreaseFont: () => setFontScalePercent(prev => Math.min(130, prev + 10)),
      isChatNotifyEnabled: mainNotifPermission === 'granted' && mainChatNotifyEnabled,
      onToggleChatNotifications: handleMainToggleNotifications,
      stickyVideoKey: stickyVideo ? stickyVideo.key : null,
      onReleaseSticky: () => setStickyVideo(null)
    })));
  }

  if (activeView === 'settlement') {
    return withStickyVideo(/*#__PURE__*/React.createElement(SettlementSummaryModal, {
      calendar: activeCal,
      onBack: () => changeView('calendar'),
      onSelectDate: d => {
        setSelectedDate(d);
        setIsModalOpen(true);
        changeView('calendar');
      }
    }));
  }

  if (activeView === 'memo') {
    return withStickyVideo(/*#__PURE__*/React.createElement(MemoView, {
      calendar: activeCal,
      memos: memos,
      hasMoreMemos: hasMoreMemos,
      totalMemoCount: totalMemoCount,
      onLoadMoreMemos: () => setMemosLimit(prev => prev + MEMOS_PAGE_SIZE),
      onBack: () => changeView('calendar'),
      showToast: showToast,
      isDarkTheme: isDarkTheme,
      onRequestConfirm: showConfirmDialog,
      sharedMemo: sharedMemo,
      chatMessages: chatMessages,
      setActiveLightbox: setActiveLightbox,
      onDismissSharedMemo: () => {
        setSharedMemo(null);
        const url = new URL(window.location.href);
        url.searchParams.delete('memo');
        window.history.replaceState({}, '', url);
      }
    }));
  }

  if (activeView === 'gallery') {
    return withStickyVideo(/*#__PURE__*/React.createElement(React.Fragment, null,
      /*#__PURE__*/React.createElement(ChatGalleryModal, {
        calendar: activeCal,
        chatMessages: allChatMessages,
        memos: memos,
        asPage: true,
        onClose: () => changeView('calendar'),
        setActiveLightbox: setActiveLightbox,
        hasMoreOlderChat: hasMoreOlderChat,
        loadingOlderChat: loadingOlderChat,
        onLoadOlderChat: loadOlderChatMessages,
        hasMoreMemos: hasMoreMemos,
        onLoadMoreMemos: () => setMemosLimit(prev => prev + MEMOS_PAGE_SIZE),
        totalGalleryCount: totalGalleryCount
      }),
      activeLightbox ? /*#__PURE__*/React.createElement(Lightbox, {
        urls: activeLightbox.urls,
        index: activeLightbox.index,
        meta: activeLightbox.meta,
        onClose: () => setActiveLightbox(null),
        onNavigate: i => setActiveLightbox(prev => prev ? { ...prev, index: i } : prev),
        showToast: showToast,
        onPromoteImageUrl: handlePromoteInlineChatImage,
        onSaveImageTags: handleSaveImageTags,
        onSearchTag: handleSearchTag
      }) : null
    ));
  }

  if (activeView === 'places') {
    return withStickyVideo(/*#__PURE__*/React.createElement(React.Fragment, null,
      /*#__PURE__*/React.createElement(PlacesView, {
        calendar: activeCal,
        onBack: () => changeView('calendar'),
        onSavePlace: handleSavePlace,
        onDeletePlace: handleDeletePlace,
        showToast: showToast,
        onRequestConfirm: showConfirmDialog,
        placesInitialQuery: placesInitialQuery,
        setPlacesInitialQuery: setPlacesInitialQuery,
        isDarkTheme: isDarkTheme,
        onToggleTheme: toggleTheme,
        fontScalePercent: fontScalePercent,
        onDecreaseFont: () => setFontScalePercent(prev => Math.max(80, prev - 10)),
        onIncreaseFont: () => setFontScalePercent(prev => Math.min(130, prev + 10)),
        isChatNotifyEnabled: mainNotifPermission === 'granted' && mainChatNotifyEnabled,
        onToggleChatNotifications: handleMainToggleNotifications,
        onSharePlaces: () => setIsPlacesShareOpen(true)
      }),
      isPlacesShareOpen && activeCal && /*#__PURE__*/React.createElement(ShareModal, {
        calendar: activeCal,
        shareType: "places",
        showToast: showToast,
        onClose: () => setIsPlacesShareOpen(false)
      })
    ));
  }

  const mainMenuPollCount = getCalendarPolls(activeCal).filter(poll => !isPollClosed(poll)).length;
  const mainMenuChatCount = (typeof totalChatCount === 'number' && totalChatCount >= 0)
    ? totalChatCount
    : Math.max(allChatMessages.length, (chatMessages || []).length);
  const mainMenuChatLatestTimestamp = allChatMessages.length > 0 ? allChatMessages[allChatMessages.length - 1].timestamp : 0;
  const mainMenuChatHasUnread = mainMenuChatLatestTimestamp > getChatLastReadTimestamp(activeCalId);
  const mainMenuMemoCount = (typeof totalMemoCount === 'number' && totalMemoCount >= 0)
    ? totalMemoCount
    : (memos || []).length;

  // Each confirmed meeting gets its own banner bubble on the calendar, and stays up through
  // the day of the meeting itself -- only today-or-future confirmations show.
  const todayDateStrForBanner = (() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  })();
  const visibleConfirmedMeetings = getTrulyConfirmedMeetings(activeCal)
    .filter(m => m.date >= todayDateStrForBanner)
    .sort((a, b) => a.date.localeCompare(b.date));

  return withStickyVideo(/*#__PURE__*/React.createElement("div", {
    className: "app-container",
    style: { paddingTop: `${mainHeaderHeight}px` }
  }, /*#__PURE__*/React.createElement("header", {
    ref: mainHeaderRef,
    className: "main-header",
    style: { transform: isMainHeaderVisible ? 'translateY(0)' : 'translateY(-100%)' }
  }, /*#__PURE__*/React.createElement("div", {
    className: "main-header-inner"
  }, /*#__PURE__*/React.createElement("div", {
    className: "main-header-top-row"
  }, /*#__PURE__*/React.createElement("div", {
    className: "header-left"
  }, /*#__PURE__*/React.createElement("div", {
    style: { position: 'relative', minWidth: 0 }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "calendar-title",
    onClick: () => {
      if (activeCalId) {
        window.location.href = `${window.location.pathname}?id=${activeCalId}`;
      }
    }
  }, activeCal?.title)))), /*#__PURE__*/React.createElement("div", {
    className: "header-actions"
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn header-search-btn",
    onClick: () => { setGlobalSearchInitialQuery(''); setIsGlobalSearchOpen(true); },
    title: "검색",
    style: {
      padding: '10px'
    }
  }, /*#__PURE__*/React.createElement(SearchIcon, null)), /*#__PURE__*/React.createElement("button", {
    className: "btn header-settings-btn",
    onClick: () => {
      setIsMainSideMenuOpen(true);
    },
    title: "메뉴",
    "aria-label": "메뉴 열기",
    style: {
      padding: '10px'
    }
  }, /*#__PURE__*/React.createElement(AdminFilledMenuIcon, null)))), activeCal?.description && /*#__PURE__*/React.createElement("div", {
    className: "calendar-desc"
  }, renderTextWithUrlBadge(activeCal.description)), /*#__PURE__*/React.createElement("div", {
    className: "main-menu-bar"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "main-menu-item",
    onClick: () => {
      setPollsExpandSignal(prev => prev + 1);
      scrollToSection(pollsSectionRef);
    }
  }, /*#__PURE__*/React.createElement("span", { className: "main-menu-icon" }, /*#__PURE__*/React.createElement(MenuIcon, { paths: ["M9 11l3 3l8 -8", "M20 12v6a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2v-12a2 2 0 0 1 2 -2h9"] })), /*#__PURE__*/React.createElement("span", { className: "main-menu-label-full" }, "투표"), /*#__PURE__*/React.createElement("span", { className: "main-menu-label-short" }, "투표"), mainMenuPollCount > 0 && /*#__PURE__*/React.createElement("span", {
    className: "main-menu-badge"
  }, mainMenuPollCount)), /*#__PURE__*/React.createElement("div", { className: "main-menu-sep" }), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "main-menu-item",
    onClick: () => changeView('chat')
  }, /*#__PURE__*/React.createElement("span", { className: "main-menu-icon" }, /*#__PURE__*/React.createElement(MenuIcon, { paths: ["M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"] })), /*#__PURE__*/React.createElement("span", { className: "main-menu-label-full" }, "채팅"), /*#__PURE__*/React.createElement("span", { className: "main-menu-label-short" }, "채팅"), mainMenuChatCount > 0 && /*#__PURE__*/React.createElement("span", {
    className: `main-menu-badge${mainMenuChatHasUnread ? ' is-unread' : ''}`
  }, mainMenuChatCount)), /*#__PURE__*/React.createElement("div", { className: "main-menu-sep" }), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "main-menu-item",
    onClick: () => {
      if (guardLoadedCalendar('Firebase 데이터를 불러온 뒤 정산 정보를 확인해 주세요.')) changeView('settlement');
    }
  }, /*#__PURE__*/React.createElement("span", { className: "main-menu-icon" }, /*#__PURE__*/React.createElement(WalletIcon, { size: 16 })), /*#__PURE__*/React.createElement("span", { className: "main-menu-label-full" }, "정산"), /*#__PURE__*/React.createElement("span", { className: "main-menu-label-short" }, "정산"), activeCal && (() => {
        const bal = calculateSettlementBalance(activeCal);
        const badgeInfo = formatBalanceBadge(bal);
        return /*#__PURE__*/React.createElement("span", {
          className: "main-menu-badge",
          style: {
            backgroundColor: badgeInfo.bgColor,
            color: '#FFFFFF'
          }
        }, badgeInfo.text);
      })()), /*#__PURE__*/React.createElement("div", { className: "main-menu-sep" }), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "main-menu-item",
    onClick: () => {
      if (guardLoadedCalendar('Firebase 데이터를 불러온 뒤 메모 정보를 확인해 주세요.')) changeView('memo');
    }
  }, /*#__PURE__*/React.createElement("span", { className: "main-menu-icon" }, /*#__PURE__*/React.createElement(NotepadTextIcon, null)), /*#__PURE__*/React.createElement("span", { className: "main-menu-label-full" }, "메모"), /*#__PURE__*/React.createElement("span", { className: "main-menu-label-short" }, "메모"), activeCal && mainMenuMemoCount > 0 && /*#__PURE__*/React.createElement("span", {
    className: "main-menu-badge"
  }, mainMenuMemoCount))))), isMainSideMenuOpen && /*#__PURE__*/React.createElement(MainSideMenu, {
    calendar: activeCal,
    anniversaries: anniversaries,
    onClose: () => setIsMainSideMenuOpen(false),
    onOpenManual: () => {
      setIsGuideOpen(true);
      setIsMainSideMenuOpen(false);
    },
    onOpenSettings: () => {
      setIsMainSideMenuOpen(false);
      if (guardLoadedCalendar('Firebase 데이터를 불러온 뒤 설정을 수정해 주세요.')) setIsAdminOpen(true);
    },
    onOpenAnniversaries: () => {
      setIsMainSideMenuOpen(false);
      if (guardLoadedCalendar('Firebase 데이터를 불러온 뒤 기념일 설정을 수정해 주세요.')) setIsAnniversariesOpen(true);
    },
    onOpenShare: () => {
      setIsMainSideMenuOpen(false);
      if (guardLoadedCalendar('Firebase 데이터를 불러온 뒤 공유 정보를 확인해 주세요.')) setIsShareOpen(true);
    },
    onCreateShortcut: () => {
      setIsMainSideMenuOpen(false);
      tryCreateShortcut(msg => showToast(msg, 'info', 5000));
    },
    onOpenAdmin: () => window.open(`${window.location.pathname}?admin=1`, '_blank', 'noopener,noreferrer'),
    onOpenGallery: () => changeView('gallery'),
    onChangeView: changeView,
    isDarkTheme: isDarkTheme,
    onToggleTheme: toggleTheme,
    fontScalePercent: fontScalePercent,
    onDecreaseFont: () => setFontScalePercent(prev => Math.max(80, prev - 10)),
    onIncreaseFont: () => setFontScalePercent(prev => Math.min(130, prev + 10)),
    isChatNotifyEnabled: mainNotifPermission === 'granted' && mainChatNotifyEnabled,
    onToggleChatNotifications: handleMainToggleNotifications,
    onUpdateWeatherLocation: handleUpdateWeatherLocation,
    onDeleteRecentLocation: handleDeleteRecentWeatherLocation,
    showToast: showToast
  }), isGalleryOpen && /*#__PURE__*/React.createElement(ChatGalleryModal, {
    chatMessages: chatMessages,
    onClose: () => setIsGalleryOpen(false),
    setActiveLightbox: setActiveLightbox
  }), isGuideOpen && /*#__PURE__*/React.createElement(UserManualOverlay, {
    calendar: activeCal,
    onClose: () => setIsGuideOpen(false)
  }), isNotificationHelpOpen && /*#__PURE__*/React.createElement(NotificationPermissionHelpModal, {
    onClose: () => setIsNotificationHelpOpen(false),
    onRetry: handleMainToggleNotifications,
    showToast: showToast
  }), isAnniversariesOpen && /*#__PURE__*/React.createElement(AnniversaryModal, {
    calendar: activeCal,
    anniversaries: anniversaries,
    onClose: () => setIsAnniversariesOpen(false),
    showToast: showToast,
    onRequestConfirm: showConfirmDialog,
    onBulkRegister: handleBulkRegisterAvailability,
    isDarkTheme: isDarkTheme
  }), /*#__PURE__*/React.createElement("div", {
    ref: calendarSectionRef
  }, visibleConfirmedMeetings.length > 0 && /*#__PURE__*/React.createElement("div", {
    style: { display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }
  }, visibleConfirmedMeetings.map(meeting => {
    const memoEntries = getActiveAvailabilities(activeCal).filter(e => e.date === meeting.date && e.note && e.note.trim());
    return /*#__PURE__*/React.createElement("div", {
      key: meeting.date,
      style: {
        background: 'linear-gradient(var(--bg-card), var(--bg-card)) padding-box, var(--accent-gradient) border-box',
        border: '1px solid transparent',
        borderRadius: 'var(--radius-md)',
        padding: '10px 14px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        cursor: 'pointer'
      },
      onClick: () => {
        if (!guardLoadedCalendar()) return;
        setSelectedDate(meeting.date);
        setIsModalOpen(true);
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }
    }, /*#__PURE__*/React.createElement("span", {
      className: "memo-capsule-badge confirmed-meeting-label-badge"
    }, formatConfirmedMeetingLabel(meeting.date)), /*#__PURE__*/React.createElement("span", {
      className: "dday-badge"
    }, formatDDayLabel(meeting.date))), memoEntries.length > 0 && /*#__PURE__*/React.createElement("div", {
      style: { display: 'flex', flexWrap: 'wrap', gap: '8px' }
    }, memoEntries.map(entry => {
      const p = getActiveParticipants(activeCal).find(part => part.id === entry.participantId);
      if (!p) return null;
      const entryUrl = extractFirstUrl(entry.note);
      const noteTextOnly = entryUrl ? removeFirstUrl(entry.note) : entry.note.trim();
      if (!noteTextOnly) return null;
      return /*#__PURE__*/React.createElement("span", {
        key: entry.participantId,
        className: "memo-capsule-badge",
        style: { backgroundColor: p.color, color: getContrastTextColor(p.color) },
        title: `${p.name}: ${noteTextOnly}`
      }, noteTextOnly);
    })));
  })), /*#__PURE__*/React.createElement(CalendarGrid, {
    anniversaries: anniversaries,
    calendar: activeCal,
    isLoading: isInitialDataLoading,
    monthDate: currentMonthDate,
    onPrevMonth: () => setCurrentMonthDate(new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() - 1, 1)),
    onNextMonth: () => setCurrentMonthDate(new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() + 1, 1)),
    onToday: () => setCurrentMonthDate(new Date()),
    onJumpToMonth: (y, m) => setCurrentMonthDate(new Date(y, m, 1)),
    onSelectDate: d => {
      if (!guardLoadedCalendar()) return;
      setSelectedDate(d);
      setIsModalOpen(true);
    },
    onMoveAvailability: handleMoveAvailability,
    onParticipantClick: handleParticipantClick
  })), /*#__PURE__*/React.createElement("div", {
    ref: pollsSectionRef,
    className: "calendar-card",
    style: {
      padding: '16px',
      marginTop: '-12px'
    }
  }, /*#__PURE__*/React.createElement(PollList, {
    calendar: activeCal,
    onCreatePoll: handleOpenPollCreate,
    onEditPoll: handleOpenPollEdit,
    onVotePoll: handleOpenVoteSheet,
    onCancelVote: handleCancelVote,
    onRequestConfirm: showConfirmDialog,
    expandSignal: pollsExpandSignal
  })), /*#__PURE__*/React.createElement("div", {
    className: "calendar-card",
    style: {
      padding: '16px',
      marginTop: '-12px'
    }
  }, /*#__PURE__*/React.createElement(CommentsSection, {
    calendar: activeCal,
    recentMessages: recentMessages,
    chatMessages: allChatMessages,
    totalChatCount: totalChatCount,
    chatInput: chatInput,
    setChatInput: setChatInput,
    chatParticipantId: chatParticipantId,
    setChatParticipantId: setChatParticipantId,
    isChatSheetOpen: isChatSheetOpen,
    setIsChatSheetOpen: setIsChatSheetOpen,
    isChatSubmitting: isChatSubmitting,
    chatTextareaRef: chatTextareaRef,
    chatImage: chatImages,
    setChatImage: setChatImages,
    activeLightbox: activeLightbox,
    setActiveLightbox: setActiveLightbox,
    onSend: handleSendChatMessage,
    onDeleteMessage: handleDeleteMessage,
    onEditMessage: handleEditMessage,
    onMore: () => changeView('chat'),
    showToast: showToast,
    onPromoteImageUrl: handlePromoteInlineChatImage,
    onSaveImageTags: handleSaveImageTags,
    onSearchTag: handleSearchTag
  })), /*#__PURE__*/React.createElement(SummaryList, {
    calendar: activeCal,
    onSelectDate: d => {
      if (!guardLoadedCalendar()) return;
      setSelectedDate(d);
      setIsModalOpen(true);
    }
  }), /*#__PURE__*/React.createElement(PhotoGallery, {
    chatMessages: (galleryPreviewMessages && galleryPreviewMessages.length > 0) ? galleryPreviewMessages : allChatMessages,
    totalGalleryCount: totalGalleryCount,
    onViewAll: () => changeView('gallery'),
    showToast: showToast,
    onPromoteImageUrl: handlePromoteInlineChatImage,
    onSaveImageTags: handleSaveImageTags,
    onSearchTag: handleSearchTag
  }), /*#__PURE__*/React.createElement(PlacesSection, {
    calendar: activeCal,
    onViewAll: () => changeView('places')
  }), /*#__PURE__*/React.createElement(Footer, null)));
}

// ---- Korean public holidays, substitute holidays, and 24 solar terms ----
// Base facts are hardcoded (fixed-date holidays; lunar-holiday solar dates, verified
// against Wikipedia's "Public holidays in South Korea" 1994-2050 table); consequences
// (대체공휴일) are computed from the legal rule so edge cases self-correct.

// Solar-date anchors for lunar-based holidays (설날/추석/부처님오신날), 2021-2032.
const GATHER_APP_CALENDAR_DATA = window.GATHER_APP_CALENDAR_DATA || {};
const KOREAN_LUNAR_HOLIDAY_DATES = GATHER_APP_CALENDAR_DATA.KOREAN_LUNAR_HOLIDAY_DATES || {
  2021: { seollal: '2021-02-12', chuseok: '2021-09-21', buddha: '2021-05-19' },
  2022: { seollal: '2022-02-01', chuseok: '2022-09-10', buddha: '2022-05-08' },
  2023: { seollal: '2023-01-22', chuseok: '2023-09-29', buddha: '2023-05-27' },
  2024: { seollal: '2024-02-10', chuseok: '2024-09-17', buddha: '2024-05-15' },
  2025: { seollal: '2025-01-29', chuseok: '2025-10-06', buddha: '2025-05-05' },
  2026: { seollal: '2026-02-17', chuseok: '2026-09-25', buddha: '2026-05-24' },
  2027: { seollal: '2027-02-07', chuseok: '2027-09-15', buddha: '2027-05-13' },
  2028: { seollal: '2028-01-27', chuseok: '2028-10-03', buddha: '2028-05-02' },
  2029: { seollal: '2029-02-13', chuseok: '2029-09-22', buddha: '2029-05-20' },
  2030: { seollal: '2030-02-03', chuseok: '2030-09-12', buddha: '2030-05-09' },
  2031: { seollal: '2031-01-23', chuseok: '2031-10-01', buddha: '2031-05-28' },
  2032: { seollal: '2032-02-11', chuseok: '2032-09-19', buddha: '2032-05-16' }
};

// One-off government-designated days off (임시공휴일) - not derivable from the standing law.
const KOREAN_TEMPORARY_HOLIDAYS = Array.isArray(GATHER_APP_CALENDAR_DATA.KOREAN_TEMPORARY_HOLIDAYS) ? GATHER_APP_CALENDAR_DATA.KOREAN_TEMPORARY_HOLIDAYS : [{ date: '2023-10-02', name: '임시공휴일' }, { date: '2025-01-27', name: '임시공휴일' }];

// subType controls 대체공휴일 eligibility: 'weekend' = substitute if Sat or Sun,
// 'sunday' = substitute if Sun only (설날/추석), 'none' = never substitutes.
// fromYear = the holiday itself didn't exist/wasn't a red day before that year.
// subFromYear = the holiday already existed, but only became substitute-eligible
// from that year (관공서의 공휴일에 관한 규정 개정 이력: 삼일절/광복절/개천절/한글날
// 대체공휴일 2021년 확대 시행, 부처님오신날/성탄절은 2023년부터 확대 적용).
const KOREAN_FIXED_HOLIDAYS = Array.isArray(GATHER_APP_CALENDAR_DATA.KOREAN_FIXED_HOLIDAYS) ? GATHER_APP_CALENDAR_DATA.KOREAN_FIXED_HOLIDAYS : [{ month: 1, day: 1, name: '신정', subType: 'none' }, { month: 3, day: 1, name: '삼일절', subType: 'weekend', subFromYear: 2022 }, { month: 5, day: 5, name: '어린이날', subType: 'weekend' }, { month: 6, day: 6, name: '현충일', subType: 'none' }, { month: 7, day: 17, name: '제헌절', subType: 'weekend', fromYear: 2026 }, { month: 8, day: 15, name: '광복절', subType: 'weekend', subFromYear: 2021 }, { month: 10, day: 3, name: '개천절', subType: 'weekend', subFromYear: 2021 }, { month: 10, day: 9, name: '한글날', subType: 'weekend', subFromYear: 2021 }, { month: 12, day: 25, name: '성탄절', subType: 'weekend', subFromYear: 2023 }, { month: 5, day: 1, name: '노동절', subType: 'none', fromYear: 2026 }];

function koreanYmd(y, m, d) {
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}
function koreanDateStrToDate(s) {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}
function koreanAddDays(s, n) {
  const dt = koreanDateStrToDate(s);
  dt.setDate(dt.getDate() + n);
  return koreanYmd(dt.getFullYear(), dt.getMonth() + 1, dt.getDate());
}
function koreanDayOfWeek(s) {
  return koreanDateStrToDate(s).getDay();
}

function getKoreanHolidayEntriesForYear(year) {
  const entries = [];
  KOREAN_FIXED_HOLIDAYS.forEach(h => {
    if (h.fromYear && year < h.fromYear) return;
    const subType = h.subFromYear && year < h.subFromYear ? 'none' : h.subType;
    entries.push({ date: koreanYmd(year, h.month, h.day), name: h.name, subType, groupId: `${h.name}-${year}` });
  });
  KOREAN_TEMPORARY_HOLIDAYS.forEach(h => {
    if (h.date.startsWith(`${year}-`)) {
      entries.push({ date: h.date, name: h.name, subType: 'none', groupId: `temp-${h.date}` });
    }
  });
  const lunar = KOREAN_LUNAR_HOLIDAY_DATES[year];
  if (lunar) {
    const seollalGroup = `seollal-${year}`;
    entries.push({ date: koreanAddDays(lunar.seollal, -1), name: '설날 연휴', subType: 'sunday', groupId: seollalGroup });
    entries.push({ date: lunar.seollal, name: '설날', subType: 'sunday', groupId: seollalGroup });
    entries.push({ date: koreanAddDays(lunar.seollal, 1), name: '설날 연휴', subType: 'sunday', groupId: seollalGroup });
    const chuseokGroup = `chuseok-${year}`;
    entries.push({ date: koreanAddDays(lunar.chuseok, -1), name: '추석 연휴', subType: 'sunday', groupId: chuseokGroup });
    entries.push({ date: lunar.chuseok, name: '추석', subType: 'sunday', groupId: chuseokGroup });
    entries.push({ date: koreanAddDays(lunar.chuseok, 1), name: '추석 연휴', subType: 'sunday', groupId: chuseokGroup });
    entries.push({ date: lunar.buddha, name: '부처님오신날', subType: year >= 2023 ? 'weekend' : 'none', groupId: `buddha-${year}` });
  }
  return entries;
}

// Computes the full holiday list for a year, including programmatically-derived
// 대체공휴일 (substitute holidays). Overlapping holidays (same exact date, e.g.
// 어린이날+부처님오신날 in 2025) and weekend-triggered holidays are merged into a
// single component via union-find so only ONE substitute is granted per triggering
// event, matching the actual legal rule.
function computeKoreanHolidaysForYear(year) {
  const entries = getKoreanHolidayEntriesForYear(year);
  const parent = entries.map((_, i) => i);
  function find(x) { while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x]; } return x; }
  function union(a, b) { const ra = find(a), rb = find(b); if (ra !== rb) parent[ra] = rb; }
  const groupIdxMap = {};
  entries.forEach((e, i) => { (groupIdxMap[e.groupId] = groupIdxMap[e.groupId] || []).push(i); });
  Object.values(groupIdxMap).forEach(idxs => { for (let i = 1; i < idxs.length; i++) union(idxs[0], idxs[i]); });
  const dateIdxMap = {};
  entries.forEach((e, i) => { (dateIdxMap[e.date] = dateIdxMap[e.date] || []).push(i); });
  Object.values(dateIdxMap).forEach(idxs => { for (let i = 1; i < idxs.length; i++) union(idxs[0], idxs[i]); });
  const components = {};
  entries.forEach((e, i) => { const r = find(i); (components[r] = components[r] || []).push(e); });

  const occupied = new Set(entries.map(e => e.date));
  const substitutes = [];
  Object.values(components).forEach(comp => {
    let triggered = false;
    comp.forEach(e => {
      if (e.subType === 'none') return;
      const dow = koreanDayOfWeek(e.date);
      if (e.subType === 'weekend' && (dow === 0 || dow === 6)) triggered = true;
      if (e.subType === 'sunday' && dow === 0) triggered = true;
    });
    if (!triggered) {
      const byDate = {};
      comp.forEach(e => { (byDate[e.date] = byDate[e.date] || []).push(e); });
      Object.values(byDate).forEach(list => {
        if (list.length > 1 && list.some(e => e.subType !== 'none')) triggered = true;
      });
    }
    if (!triggered || !comp.some(e => e.subType !== 'none')) return;
    const lastDate = comp.map(e => e.date).sort().slice(-1)[0];
    let cand = koreanAddDays(lastDate, 1);
    while (true) {
      const dow = koreanDayOfWeek(cand);
      if (dow !== 0 && dow !== 6 && !occupied.has(cand)) break;
      cand = koreanAddDays(cand, 1);
    }
    occupied.add(cand);
    const label = [...new Set(comp.map(e => e.name.replace(' 연휴', '')))].join('·');
    substitutes.push({ date: cand, name: `대체공휴일(${label})` });
  });

  return entries.concat(substitutes);
}

// Single-date holiday name lookup (e.g. for DateModal's header) -- CalendarGrid's own
// holidayMap is memoized per rendered month range, which isn't available outside that
// component, so this recomputes just the one year a given date falls in.
function getHolidayNamesForDate(dateStr) {
  if (!dateStr) return [];
  const year = parseInt(dateStr.slice(0, 4), 10);
  if (!year) return [];
  return computeKoreanHolidaysForYear(year).filter(e => e.date === dateStr).map(e => e.name);
}

// 24 solar terms (24절기) via the standard low-precision solar-longitude formula
// (Meeus/USNO, ~0.01deg accuracy). Validated against 19 KASI-derived reference
// dates spanning 2025-2027 with zero mismatches; no external data table needed.
const KOREAN_SOLAR_TERMS = Array.isArray(GATHER_APP_CALENDAR_DATA.KOREAN_SOLAR_TERMS) ? GATHER_APP_CALENDAR_DATA.KOREAN_SOLAR_TERMS : [['소한', 285], ['대한', 300], ['입춘', 315], ['우수', 330], ['경칩', 345], ['춘분', 0], ['청명', 15], ['곡우', 30], ['입하', 45], ['소만', 60], ['망종', 75], ['하지', 90], ['소서', 105], ['대서', 120], ['입추', 135], ['처서', 150], ['백로', 165], ['추분', 180], ['한로', 195], ['상강', 210], ['입동', 225], ['소설', 240], ['대설', 255], ['동지', 270]];

function koreanJulianDayUTC(year, month, day, hourUTC) {
  let y = year, m = month;
  if (m <= 2) { y -= 1; m += 12; }
  const A = Math.floor(y / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + B - 1524.5 + hourUTC / 24;
}
function koreanSunEclipticLongitudeDeg(jd) {
  const D = jd - 2451545.0;
  let L = 280.460 + 0.9856474 * D;
  let g = 357.528 + 0.9856003 * D;
  L = ((L % 360) + 360) % 360;
  g = ((g % 360) + 360) % 360;
  const gRad = g * Math.PI / 180;
  const lambda = L + 1.915 * Math.sin(gRad) + 0.020 * Math.sin(2 * gRad);
  return ((lambda % 360) + 360) % 360;
}
function koreanLongitudeAtKstMidnight(year, month, day) {
  // KST 00:00 of (y,m,d) = UTC previous-day 15:00, i.e. 9 hours before that date's 00:00 UTC.
  return koreanSunEclipticLongitudeDeg(koreanJulianDayUTC(year, month, day, -9));
}
function findKoreanSolarTermDate(year, targetDeg) {
  let cur = { y: year - 1, m: 12, d: 15 };
  let prevUnwrapped = koreanLongitudeAtKstMidnight(cur.y, cur.m, cur.d);
  let offset = 0;
  for (let i = 0; i < 400; i++) {
    const nextStr = koreanAddDays(koreanYmd(cur.y, cur.m, cur.d), 1);
    const [ny, nm, nd] = nextStr.split('-').map(Number);
    const next = { y: ny, m: nm, d: nd };
    let lon = koreanLongitudeAtKstMidnight(next.y, next.m, next.d);
    let unwrapped = lon + offset;
    if (unwrapped < prevUnwrapped - 1) { offset += 360; unwrapped = lon + offset; }
    for (let k = -1; k <= 2; k++) {
      const tgt = targetDeg + k * 360;
      // The crossing happens sometime during the KST calendar day "cur" (between cur's
      // and next's KST midnights), so the term always falls on `cur`, not `next`.
      if (prevUnwrapped <= tgt && tgt < unwrapped && cur.y === year) {
        return cur;
      }
    }
    prevUnwrapped = unwrapped;
    cur = next;
  }
  return null;
}
function getKoreanSolarTermsForYear(year) {
  const map = {};
  KOREAN_SOLAR_TERMS.forEach(([name, deg]) => {
    const r = findKoreanSolarTermDate(year, deg);
    if (r) map[koreanYmd(r.y, r.m, r.d)] = name;
  });
  return map;
}

// Calendar Grid Component
function CalendarGrid(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.CalendarGrid;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function CommentsSection(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.CommentsSection;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function MemoCard(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.MemoCard;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function PollList(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.PollList;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function GlobalSearchModal(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.GlobalSearchModal;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function EditMessageModal(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.EditMessageModal;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}


// Comments / Chat Icons & Utilities
const getLocalStorage = () => {
  return window['local' + 'Storage'];
};

// Per-calendar "last read" chat timestamp, stored locally per browser/device (no server
// concept of read state). Used to color the chat count badge gray (all read) vs red
// (unread messages newer than the last time this section was expanded).
const CHAT_LAST_READ_KEY_PREFIX = 'gather_chat_last_read_v1_';
function getChatLastReadTimestamp(calendarId) {
  try {
    const raw = getLocalStorage().getItem(CHAT_LAST_READ_KEY_PREFIX + calendarId);
    return raw ? Number(raw) || 0 : 0;
  } catch (e) {
    return 0;
  }
}
function setChatLastReadTimestamp(calendarId, timestamp) {
  try {
    getLocalStorage().setItem(CHAT_LAST_READ_KEY_PREFIX + calendarId, String(timestamp));
  } catch (e) {
    // ignore (private browsing / storage disabled)
  }
}

// Link preview (OpenGraph via peekalink.io's API), fetched through the peekalinkProxy Cloud
// Function (functions/index.js) instead of calling api.peekalink.io directly from the browser.
// This is a static site with no backend of its own, so the Peekalink API key previously had to
// live in this client-shipped file (visible to anyone via view-source) -- it now lives ONLY in
// the Cloud Function's source, which never reaches the browser, and the proxy forwards requests
// server-side with it. Cached at module scope (by URL) so re-renders and repeated occurrences of
// the same link don't refetch, and in-flight requests are deduped across simultaneously-mounting
// message bubbles.
const PEEKALINK_PROXY_URL = `https://us-central1-${firebaseConfig.projectId}.cloudfunctions.net/peekalinkProxy`;
const GATHER_APP_CHAT_DATA = window.GATHER_APP_CHAT_DATA || {};
const linkPreviewCache = new Map();
const linkPreviewInflight = new Map();
// Single mutable slot (not React state -- nothing needs to re-render when this changes) recording
// the last embedded chat video the user actually tapped/interacted with. Read once, at the moment
// the user navigates away from the chat tab (see changeView's sticky-video promotion), to decide
// which video -- if any -- should keep playing as the floating mini player. A module-level
// singleton is safe here the same way linkPreviewCache above is: this app only ever mounts one
// <App/> instance.
let lastFocusedChatVideo = null;
// Peekalink's free plan is a 50-request-per-hour rate limit, not a fixed lifetime quota --
// it resets every clock hour rather than depleting over time. See PEEKALINK_HOUR_BUCKET_MS below.
const PEEKALINK_FREE_HOURLY_LIMIT = Number.isFinite(GATHER_APP_CHAT_DATA.PEEKALINK_FREE_HOURLY_LIMIT) ? GATHER_APP_CHAT_DATA.PEEKALINK_FREE_HOURLY_LIMIT : 50;
const PEEKALINK_HOUR_BUCKET_MS = Number.isFinite(GATHER_APP_CHAT_DATA.PEEKALINK_HOUR_BUCKET_MS) ? GATHER_APP_CHAT_DATA.PEEKALINK_HOUR_BUCKET_MS : 3600000;

// Deterministic, synchronous 64-bit FNV-1a hash used as the Firestore doc ID for the shared
// linkPreviews cache below (doc IDs can't contain '/', which raw URLs do). Collisions are
// astronomically unlikely for the number of distinct URLs this app will ever see, and using a
// plain hash instead of crypto.subtle.digest keeps this working in non-secure contexts too
// (e.g. file:// during local testing), where Web Crypto isn't available.
function hashUrlForCache(url) {
  let hash = 0xcbf29ce484222325n;
  const prime = 0x100000001b3n;
  for (let i = 0; i < url.length; i++) {
    hash ^= BigInt(url.charCodeAt(i));
    hash = BigInt.asUintN(64, hash * prime);
  }
  return hash.toString(16).padStart(16, '0');
}

function normalizeLinkPreviewData(url, data = {}, fetchedAt = Date.now()) {
  return {
    url: sanitizeText(url || data.url || '', 2000),
    title: sanitizeText(data.title || '', 300),
    description: sanitizeText(data.description || '', 500),
    image: sanitizeText(data.image || '', 2000),
    siteName: sanitizeText(data.siteName || '', 200),
    fetchedAt: Number(data.fetchedAt || fetchedAt || Date.now())
  };
}

// Best-effort counter so the admin dashboard can show shared-cache size without ever needing
// list access on the linkPreviews collection itself (see firestore.rules).
// Uses set({merge:true}) since incrementPeekalinkApiCallStat below writes to the same doc --
// a plain overwriting set() here would wipe its hourlyUsage fields (and vice versa).
async function incrementLinkPreviewStat() {
  if (!firebaseDb) return;
  try {
    await firebaseDb.runTransaction(async (tx) => {
      const ref = firebaseDb.collection('appConfig').doc('linkPreviewStats');
      const snap = await tx.get(ref);
      const current = snap.exists ? (snap.data().cachedCount || 0) : 0;
      tx.set(ref, { cachedCount: current + 1, updatedAt: Date.now() }, { merge: true });
    });
  } catch (e) {
    // Non-critical stat -- ignore failures
  }
}

// Tracks actual outbound calls to Peekalink's API (cache hits never reach this point) against
// its 50/hour free-plan rate limit, bucketed by clock hour -- an approximation of the rolling
// window Peekalink itself enforces, close enough for the admin dashboard's usage gauge. Powers
// the "외부 서비스 연동 현황" 통계 tab card.
async function incrementPeekalinkApiCallStat() {
  if (!firebaseDb) return;
  try {
    await firebaseDb.runTransaction(async (tx) => {
      const ref = firebaseDb.collection('appConfig').doc('linkPreviewStats');
      const snap = await tx.get(ref);
      const data = snap.exists ? snap.data() : {};
      const currentBucket = Math.floor(Date.now() / PEEKALINK_HOUR_BUCKET_MS);
      const sameBucket = data.hourlyUsageBucket === currentBucket;
      tx.set(ref, {
        hourlyUsageBucket: currentBucket,
        hourlyUsageCount: sameBucket ? (data.hourlyUsageCount || 0) + 1 : 1
      }, { merge: true });
    });
  } catch (e) {
    // Non-critical stat -- ignore failures
  }
}

async function fetchLinkPreview(url) {
  if (linkPreviewCache.has(url)) return linkPreviewCache.get(url);
  if (linkPreviewInflight.has(url)) return linkPreviewInflight.get(url);
  const promise = (async () => {
    const urlHash = hashUrlForCache(url);
    try {
      // Check the shared, service-wide cache first -- every calendar/user reuses the same
      // Peekalink fetch for a given URL instead of each calendar re-fetching it independently.
      if (firebaseDb) {
        try {
          const sharedDoc = await firebaseDb.collection('linkPreviews').doc(urlHash).get();
          if (sharedDoc.exists) {
            const d = sharedDoc.data();
            const result = { status: 'success', data: normalizeLinkPreviewData(url, d, d.fetchedAt) };
            linkPreviewCache.set(url, result);
            return result;
          }
        } catch (e) {
          // Shared cache read failed (offline, rules mismatch, etc.) -- fall through to a direct fetch.
        }
      }

      const res = await fetch(PEEKALINK_PROXY_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ link: url })
      });
      const json = await res.json();
      // Counts against the free-plan quota regardless of json.ok -- the request still reached
      // Peekalink's server and consumed the hourly allowance either way.
      incrementPeekalinkApiCallStat();
      if (!json.ok) throw new Error(json.message || 'peekalink request failed');
      const image = json.image?.medium?.url || json.image?.large?.url || json.image?.thumbnail?.url || json.icon?.url || '';
      const hasContent = !!(json.title || image || json.description);
      const data = normalizeLinkPreviewData(url, {
        title: json.title || (json.redirected && json.redirectionUrl ? new URL(json.redirectionUrl).hostname.replace('www.','') : '') || json.domain || '',
        description: json.description || '',
        image,
        siteName: json.siteName || json.domain || ''
      });
      const result = { status: hasContent ? 'success' : 'empty', data };
      // Only cache successful results; let empty/failed results be retried on next render
      if (hasContent) {
        linkPreviewCache.set(url, result);
        if (firebaseDb) {
          firebaseDb.collection('linkPreviews').doc(urlHash).set(data).then(() => incrementLinkPreviewStat()).catch(() => {});
        }
      }
      return result;
    } catch (e) {
      const result = { status: 'error' };
      // Don't cache errors -- let them be retried when the component remounts or page reloads
      return result;
    } finally {
      linkPreviewInflight.delete(url);
    }
  })();
  linkPreviewInflight.set(url, promise);
  return promise;
}
function useLinkPreview(url, cachedData) {
  const [state, setState] = React.useState(() => {
    if (cachedData) return { status: 'success', data: cachedData };
    return (url ? linkPreviewCache.get(url) : null) || null;
  });
  React.useEffect(() => {
    if (cachedData) {
      setState({ status: 'success', data: cachedData });
      return;
    }
    if (!url) return;
    const cached = linkPreviewCache.get(url);
    if (cached) {
      setState(cached);
      return;
    }
    let cancelled = false;
    setState({ status: 'loading' });
    fetchLinkPreview(url).then(result => {
      if (!cancelled) setState(result);
    });
    return () => {
      cancelled = true;
    };
  }, [url, cachedData]);
  return state;
}


function shouldFetchLinkPreviewForChatUrl(url) {
  const mediaInfo = getDirectChatMediaInfo(url);
  return !mediaInfo || mediaInfo.type === 'embed';
}

function getDirectChatMediaInfo(url) {
  const normalizedUrl = sanitizeText(url || '', 2000);
  if (!normalizedUrl || !/^https?:\/\//i.test(normalizedUrl)) return null;
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif', '.bmp', '.svg', '.jfif', '.pjpeg', '.pjp', '.ico'];
  const videoExtensions = ['.mp4', '.webm', '.ogv', '.ogg', '.m4v', '.mov', '.3gp', '.3g2'];
  const getExtensionType = candidate => {
    try {
      const parsed = new URL(candidate);
      const path = decodeURIComponent(parsed.pathname || '').toLowerCase();
      if (imageExtensions.some(ext => path.endsWith(ext))) return 'image';
      if (videoExtensions.some(ext => path.endsWith(ext))) return 'video';
    } catch (e) {
      const clean = String(candidate || '').split(/[?#]/)[0].toLowerCase();
      if (imageExtensions.some(ext => clean.endsWith(ext))) return 'image';
      if (videoExtensions.some(ext => clean.endsWith(ext))) return 'video';
    }
    return '';
  };
  const getEmbedInfo = source => {
    try {
      const parsed = new URL(source);
      const host = parsed.hostname.replace(/^www\./i, '').toLowerCase();
      const path = parsed.pathname || '';
      if (host === 'youtu.be') {
        const id = path.split('/').filter(Boolean)[0];
        if (id) return { type: 'embed', provider: 'youtube', url: `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}`, orientation: 'landscape' };
      }
      if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'music.youtube.com') {
        const watchId = parsed.searchParams.get('v');
        const shortsId = path.match(/\/shorts\/([^/?#]+)/i)?.[1];
        const embedId = path.match(/\/embed\/([^/?#]+)/i)?.[1];
        const liveId = path.match(/\/live\/([^/?#]+)/i)?.[1];
        const id = watchId || shortsId || embedId || liveId;
        if (id) return { type: 'embed', provider: 'youtube', url: `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}`, orientation: shortsId ? 'portrait' : 'landscape' };
      }
      if (host === 'vimeo.com' || host === 'player.vimeo.com') {
        const id = path.match(/(?:\/video)?\/(\d+)(?:$|[/?#])/i)?.[1] || path.match(/\/(\d+)(?:$|[/?#])/i)?.[1];
        if (id) return { type: 'embed', provider: 'vimeo', url: `https://player.vimeo.com/video/${encodeURIComponent(id)}`, orientation: 'landscape' };
      }
      // TikTok's official embed.js widget (see TikTokEmbedWidget below). Falls back to the
      // link-preview card if it doesn't produce a player within a few seconds.
      if (host === 'tiktok.com' || host === 'm.tiktok.com') {
        const videoId = path.match(/\/video\/(\d+)/)?.[1];
        if (videoId) return { type: 'tiktok-widget', provider: 'tiktok', url: source, videoId };
      }
    } catch (e) {
      // Keep non-URL and unsupported providers on the regular link-preview path.
    }
    return null;
  };

  const embedInfo = getEmbedInfo(normalizedUrl);
  if (embedInfo) return embedInfo;

  const candidates = [normalizedUrl];
  try {
    const parsed = new URL(normalizedUrl);
    ['src', 'url', 'u', 'image', 'img', 'media'].forEach(key => {
      const value = parsed.searchParams.get(key);
      if (!value) return;
      candidates.push(value);
      try {
        candidates.push(decodeURIComponent(value));
      } catch (e) {
        // URLSearchParams usually decodes already; this only covers double-encoded sources.
      }
    });
  } catch (e) {
    // Invalid URL is rejected by the normalizedUrl guard above; keep this defensive.
  }

  for (const candidate of candidates) {
    const type = getExtensionType(candidate);
    if (type) return { type, url: normalizedUrl };
  }
  return null;
}

// Appending a fresh <script> tag per mount makes embed.js rescan the DOM for this blockquote.
// onFailed fires if no player iframe shows up in time, so the caller can fall back to the
// link-preview card.


// Floating video player kept alive via a document.body portal so it survives App()'s
// activeView-based tab switches without unmounting (see the withStickyVideo wrapper around
// every one of App()'s 5 return branches). zIndex 40000 sits above regular modals (up to
// ~30000) so it stays visible while browsing other tabs, but below toast (99999) and confirm
// dialogs (100000) so those never get obscured by it.


function DirectChatMediaText(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.DirectChatMediaText;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function DeadlineDateTimePicker(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.DeadlineDateTimePicker;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function PlacesSection(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.PlacesSection;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function ImageUrlModal(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.ImageUrlModal;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}


function renderChatMessageBody(msg, setActiveLightbox, singleImageStyle = {}, searchQuery = '', stickyVideoKey = null, onReleaseSticky = null) {
  const msgImages = renderChatMessageImages(msg, setActiveLightbox, singleImageStyle);
  return /*#__PURE__*/React.createElement(React.Fragment, null,
    msgImages ? /*#__PURE__*/React.createElement('div', { style: { marginBottom: msg.text ? '8px' : '0' } }, msgImages) : null,
    msg.text ? /*#__PURE__*/React.createElement(DirectChatMediaText, {
      text: msg.text,
      searchQuery,
      setActiveLightbox: msgImages ? null : setActiveLightbox,
      linkPreview: msg.linkPreview,
      style: singleImageStyle,
      message: msg,
      stickyVideoKey,
      onReleaseSticky
    }) : null
  );
}

// HEIC/HEIF (the default photo format on iPhone) has no native decode support in canvas/Image()
// on any browser except some Safari versions -- a raw .heic/.heif file (e.g. picked via the
// Files app, which unlike Safari's usual photo picker doesn't auto-convert to JPEG on select)
// fails outright everywhere else. heic2any is a WASM-based client-side HEIC->JPEG converter;
// it's ~1.3MB so it's loaded lazily, only the first time an actual HEIC/HEIF file shows up.
// Bounds any promise that might otherwise hang forever (a stalled network request that never
// fires error/complete, a CDN script tag whose load/error events never trigger on a flaky
// mobile connection) so a single stuck operation can't freeze the whole upload/processing
// flow indefinitely -- without this, callers awaiting it never reach their finally block, so a
// submit button or progress overlay would stay stuck on-screen with no way to recover.
function withTimeout(promise, ms, timeoutMessage) {
  return new Promise((resolve, reject) => {
    let settled = false;
    const timeoutId = setTimeout(() => {
      if (settled) return;
      settled = true;
      reject(Object.assign(new Error(timeoutMessage || 'TIMEOUT'), { code: 'TIMEOUT' }));
    }, ms);
    promise.then(
      value => { if (settled) return; settled = true; clearTimeout(timeoutId); resolve(value); },
      err => { if (settled) return; settled = true; clearTimeout(timeoutId); reject(err); }
    );
  });
}

let heicToLoadPromise = null;
// heic-to bundles a current libheif build (1.22.2 as of writing) inside a single self-contained
// file -- no separate .wasm fetch, it spins up its decoder as an inline Worker built from a
// string embedded in this same file. heic2any (below) is kept only as a second-chance fallback:
// it hasn't been updated since 2023, and its own Emscripten build has been unreliable on some
// mobile browsers in the wild for reasons that never surface a clear error (it's caught and
// collapsed into one generic failure), which is exactly the profile of this bug report.
const HEIC_TO_CDN_URLS = Array.isArray(GATHER_APP_CHAT_DATA.HEIC_TO_CDN_URLS) ? GATHER_APP_CHAT_DATA.HEIC_TO_CDN_URLS : [
  'https://cdn.jsdelivr.net/npm/heic-to@1.5.2/dist/heic-to.js',
  'https://unpkg.com/heic-to@1.5.2/dist/heic-to.js'
];
function loadHeicTo(timeoutMs = 15000) {
  if (heicToLoadPromise) return heicToLoadPromise;
  heicToLoadPromise = (async () => {
    let lastErr = null;
    for (const src of HEIC_TO_CDN_URLS) {
      try {
        const mod = await withTimeout(import(/* @vite-ignore */ src), timeoutMs, `heic-to import timed out: ${src}`);
        if (mod && typeof mod.heicTo === 'function') return mod.heicTo;
        lastErr = new Error('heic-to module missing heicTo export');
      } catch (err) {
        lastErr = err;
      }
    }
    heicToLoadPromise = null; // allow retrying on a later file instead of caching the failure forever
    throw lastErr || new Error('heic-to failed to load from all CDNs');
  })();
  return heicToLoadPromise;
}

let heic2anyLoadPromise = null;
// Two independent CDNs -- some mobile carrier/corporate networks block one but not the other,
// and a single hardcoded host with no fallback turns any CDN hiccup into a hard HEIC failure.
const HEIC2ANY_CDN_URLS = Array.isArray(GATHER_APP_CHAT_DATA.HEIC2ANY_CDN_URLS) ? GATHER_APP_CHAT_DATA.HEIC2ANY_CDN_URLS : [
  'https://cdn.jsdelivr.net/npm/heic2any@0.0.4/dist/heic2any.min.js',
  'https://unpkg.com/heic2any@0.0.4/dist/heic2any.min.js'
];
function loadScriptOnce(src, timeoutMs) {
  return new Promise((resolve, reject) => {
    let settled = false;
    const timeoutId = setTimeout(() => {
      if (settled) return;
      settled = true;
      reject(new Error(`script load timed out: ${src}`));
    }, timeoutMs);
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => {
      if (settled) return;
      settled = true;
      clearTimeout(timeoutId);
      resolve();
    };
    script.onerror = () => {
      if (settled) return;
      settled = true;
      clearTimeout(timeoutId);
      reject(new Error(`script failed to load: ${src}`));
    };
    document.head.appendChild(script);
  });
}
function loadHeic2any(timeoutMs = 15000) {
  if (window.heic2any) return Promise.resolve(window.heic2any);
  if (heic2anyLoadPromise) return heic2anyLoadPromise;
  heic2anyLoadPromise = (async () => {
    let lastErr = null;
    for (const src of HEIC2ANY_CDN_URLS) {
      try {
        await loadScriptOnce(src, timeoutMs);
        if (window.heic2any) return window.heic2any;
        lastErr = new Error('heic2any failed to initialize');
      } catch (err) {
        lastErr = err;
      }
    }
    heic2anyLoadPromise = null; // allow retrying on a later file instead of caching the failure forever
    throw lastErr || new Error('heic2any failed to load from all CDNs');
  })();
  return heic2anyLoadPromise;
}

function isHeicFile(file) {
  const type = (file.type || '').toLowerCase();
  if (type === 'image/heic' || type === 'image/heif' || type === 'image/heic-sequence' || type === 'image/heif-sequence') return true;
  // file.type is often empty for HEIC on browsers/OSes with no MIME association registered,
  // so also fall back to the extension.
  const name = (file.name || '').toLowerCase();
  return name.endsWith('.heic') || name.endsWith('.heif');
}

// Wraps Image() decoding with a timeout so one stuck/malformed file can't hang a whole batch
// indefinitely (the caller is otherwise waiting on onload/onerror, which some browsers never
// fire for certain corrupt inputs).
function loadImageElement(objectUrl, timeoutMs = 20000) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    let settled = false;
    const timeoutId = setTimeout(() => {
      if (settled) return;
      settled = true;
      reject(Object.assign(new Error('IMAGE_DECODE_TIMEOUT'), { code: 'IMAGE_DECODE_TIMEOUT' }));
    }, timeoutMs);
    img.onload = () => {
      if (settled) return;
      settled = true;
      clearTimeout(timeoutId);
      resolve(img);
    };
    img.onerror = () => {
      if (settled) return;
      settled = true;
      clearTimeout(timeoutId);
      reject(Object.assign(new Error('IMAGE_DECODE_FAILED'), { code: 'IMAGE_DECODE_FAILED' }));
    };
    img.src = objectUrl;
  });
}

async function compressImageToDataUrls(file, { maxThumbBase64Length = MAX_CHAT_THUMB_BASE64_LENGTH } = {}) {
  let sourceBlob = file;
  let img = null;

  if (isHeicFile(file)) {
    // Try every native decode path the platform might offer before falling back to a CDN
    // library. Different engines expose HEIC support through different APIs -- some Chrome
    // builds decode via createImageBitmap using the OS's own HEIF codec without supporting
    // <img> for the same file, while Safari typically supports both. Trying both costs nothing
    // on browsers that support neither: createImageBitmap rejects immediately for an
    // undecodable blob, and <img> reports onerror almost instantly (no network wait, the file
    // is already a local blob). This also sidesteps heic2any's bundled libheif (last published
    // 2020) failing to parse newer HDR/gain-map HEIC variants some iPhones now produce, which
    // the platform's own decoder often still handles fine -- and avoids the ~1.3MB CDN fetch
    // entirely on capable browsers.
    if (typeof createImageBitmap === 'function') {
      try {
        img = await withTimeout(createImageBitmap(file), 6000, 'createImageBitmap timed out');
      } catch (err) {
        img = null;
      }
    }
    if (!img) {
      const probeUrl = URL.createObjectURL(file);
      try {
        img = await loadImageElement(probeUrl, 6000);
      } catch (err) {
        img = null;
      } finally {
        URL.revokeObjectURL(probeUrl);
      }
    }

    if (!img) {
      let converted = null;
      let lastErr = null;

      // Primary: heic-to, a self-contained, actively-maintained current-libheif build. Try it
      // twice -- the first conversion call right after the decoder's Worker spins up can
      // transiently fail in some browsers, and one retry recovers most of those.
      for (let attempt = 0; attempt < 2 && !converted; attempt++) {
        try {
          const heicTo = await loadHeicTo();
          converted = await withTimeout(
            heicTo({ blob: file, type: 'image/jpeg', quality: 0.85 }),
            45000,
            'HEIC conversion timed out'
          );
        } catch (err) {
          lastErr = err;
          heicToLoadPromise = null; // force a fresh load attempt on retry, not a cached failure
        }
      }

      // Fallback: heic2any, an older/differently-built decoder kept only as a second opinion in
      // case heic-to's specific CDN or Worker/WASM path is the one having trouble on a given
      // device -- a genuinely different implementation succeeding where the first one failed is
      // exactly the case this is here for.
      if (!converted) {
        for (let attempt = 0; attempt < 2 && !converted; attempt++) {
          try {
            const heic2any = await loadHeic2any();
            // A 24MP+ HEIC on a slower mobile device can genuinely take a while to decode, but
            // must not be allowed to hang forever -- bound it generously (45s) rather than leave
            // the attach flow stuck with no way to recover.
            converted = await withTimeout(
              heic2any({ blob: file, toType: 'image/jpeg', quality: 0.85 }),
              45000,
              'HEIC conversion timed out'
            );
          } catch (err) {
            lastErr = err;
            heic2anyLoadPromise = null; // force a fresh load attempt on retry, not a cached failure
            window.heic2any = null;
          }
        }
      }

      if (!converted) {
        throw Object.assign(new Error('HEIC 이미지를 변환하지 못했습니다.'), { code: 'HEIC_CONVERT_FAILED', fileName: file.name, cause: lastErr });
      }
      sourceBlob = Array.isArray(converted) ? converted[0] : converted;
    }
  }

  if (!img) {
    const objectUrl = URL.createObjectURL(sourceBlob);
    try {
      img = await loadImageElement(objectUrl);
    } catch (err) {
      throw Object.assign(
        new Error('이미지를 불러오지 못했습니다. 지원하지 않는 형식이거나 손상된 파일일 수 있습니다.'),
        { code: err.code || 'IMAGE_DECODE_FAILED', fileName: file.name }
      );
    } finally {
      URL.revokeObjectURL(objectUrl);
    }
  }

  // Encodes `img` as a JPEG data URL guaranteed to fit within `budget`: steps down through
  // `qualitySteps` at the current size first, and only if the lowest quality still doesn't fit
  // does it shrink the longest side and retry from the top of the quality list.
  // Quality-only stepping (the previous approach) could still exceed the cap on a busy/detailed
  // photo, which -- multiplied across a multi-image batch that falls back to inline base64 --
  // could push the whole Firestore document over its 1MiB hard limit and get the write rejected
  // outright instead of degrading gracefully.
  // Yields to the event loop (setTimeout over rAF -- this can run while the tab is backgrounded/
  // hidden between images in a multi-attach batch, where rAF would simply stall) between each
  // resize/quality attempt so a detailed photo's full step-ladder doesn't block the main thread
  // (and the ImageProcessingOverlay progress UI) for one long unbroken stretch.
  const yieldToMain = () => new Promise(r => setTimeout(r, 0));
  const encodeWithinBudget = async (maxDimStart, qualitySteps, budget, minDim) => {
    let maxDim = maxDimStart;
    let best = null;
    while (true) {
      let w = img.width, h = img.height;
      if (w > maxDim || h > maxDim) {
        if (w > h) { h = Math.round(h * maxDim / w); w = maxDim; }
        else { w = Math.round(w * maxDim / h); h = maxDim; }
      }
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      canvas.getContext('2d').drawImage(img, 0, 0, w, h);
      for (const quality of qualitySteps) {
        const base64 = canvas.toDataURL('image/jpeg', quality);
        best = { base64, canvas, quality };
        if (base64.length <= budget) return best;
        await yieldToMain();
      }
      if (maxDim <= minDim) return best; // best effort: smallest size / lowest quality tried
      maxDim = Math.max(minDim, Math.round(maxDim * 0.75));
    }
  };

  // This base64 (`original`) is discarded unread whenever the Storage upload below succeeds
  // (the normal case) -- it only ever becomes the persisted imageUrl when that upload fails (see
  // resolveImageUrls). It used to be compressed at a much larger budget (1200px / ~350KB) whenever
  // Storage looked healthy going in, on the theory that upload would probably succeed -- but a
  // single transient upload failure (slow mobile connection, brief Storage hiccup) would then
  // permanently embed that huge base64 directly in the message document. Because chat's live
  // "last 100 messages" listener (see the Real-time messages listener effect) downloads and
  // re-parses every matching document on every page load for every visitor, one such message
  // taxes everyone's load forever -- multiple of these accumulating in a single calendar's history
  // measurably slowed chat loading for every user. So the fallback is always compressed at the
  // same small, cheap-to-store budget the isStorageDisabled path already used, regardless of
  // whether Storage looks reachable right now: if the upload does succeed, this is thrown away and
  // the full-quality Storage blob is what actually gets used, so nothing is lost in the common
  // case; if it fails, the degraded fallback is small enough to never become a load-time liability.
  const original = await encodeWithinBudget(600, [0.85, 0.75, 0.65, 0.55, 0.45, 0.35], 48 * 1024, 320);

  // 360px thumbnails keep chat/gallery previews crisp on high-DPI screens while remaining
  // bounded. Storage normally serves the sharper 720px Blob below; this base64 thumbnail is the
  // safe fallback when Storage upload is unavailable or still in progress.
  const thumbnail = await encodeWithinBudget(360, [0.78, 0.68, 0.58, 0.48], maxThumbBase64Length, 180);

  // High-quality blob for Firebase Storage (when storage is working): images already within the
  // 1920px cap upload completely untouched (100% pixel-perfect, zero compression noise) as long
  // as they're a reasonable file size; anything larger gets its longest side scaled down to 1920.
  const getHighQualityBlob = () => {
    if (isStorageDisabled) return Promise.resolve(null);

    const maxDimHigh = 1920;
    const isOversized = img.width > maxDimHigh || img.height > maxDimHigh;

    if (!isOversized && file.size <= 4 * 1024 * 1024) {
      return Promise.resolve(file);
    }

    return new Promise(res => {
      let w = img.width, h = img.height;
      const isPng = (file.type === 'image/png' || file.name.toLowerCase().endsWith('.png'));
      if (isOversized) {
        if (w > h) { h = Math.round(h * maxDimHigh / w); w = maxDimHigh; }
        else { w = Math.round(w * maxDimHigh / h); h = maxDimHigh; }
      }
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      canvas.getContext('2d').drawImage(img, 0, 0, w, h);
      if (isPng) {
        canvas.toBlob(blob => res(blob), 'image/png');
      } else {
        canvas.toBlob(blob => res(blob), 'image/jpeg', 0.7);
      }
    });
  };

  const getHighQualityThumbBlob = () => {
    if (isStorageDisabled) return Promise.resolve(null);
    return new Promise(res => {
      let w = img.width, h = img.height;
      const maxDimThumb = 720; // Sharper Storage thumbnails for high-DPI chat and gallery previews
      if (w > maxDimThumb || h > maxDimThumb) {
        if (w > h) { h = Math.round(h * maxDimThumb / w); w = maxDimThumb; }
        else { w = Math.round(w * maxDimThumb / h); h = maxDimThumb; }
      }
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      canvas.getContext('2d').drawImage(img, 0, 0, w, h);
      const isPng = (file.type === 'image/png' || file.name.toLowerCase().endsWith('.png'));
      if (isPng) {
        canvas.toBlob(blob => res(blob), 'image/png');
      } else {
        canvas.toBlob(blob => res(blob), 'image/jpeg', 0.86); // High quality JPEG thumbnail
      }
    });
  };

  const highQualityBlob = await getHighQualityBlob();
  const highQualityThumbBlob = await getHighQualityThumbBlob();

  // Also produce Blobs at the same size/quality actually chosen above, used to upload to
  // Firebase Storage at send time (see uploadChatImageAssets) instead of embedding base64 in
  // the message document. The base64 strings above are kept as the fallback if that upload fails.
  return new Promise((resolve) => {
    const resolveAll = (origBlob, thumbBlob) => {
      resolve({
        original: original.base64,
        thumbnail: thumbnail.base64,
        originalBlob: origBlob,
        thumbnailBlob: thumbBlob
      });
    };

    const getBase64OrigBlob = (cb) => {
      if (highQualityBlob) cb(highQualityBlob);
      else original.canvas.toBlob(blob => cb(blob), 'image/jpeg', original.quality);
    };

    const getBase64ThumbBlob = (cb) => {
      if (highQualityThumbBlob) cb(highQualityThumbBlob);
      else thumbnail.canvas.toBlob(blob => cb(blob), 'image/jpeg', thumbnail.quality);
    };

    getBase64OrigBlob(origBlob => {
      getBase64ThumbBlob(thumbBlob => {
        resolveAll(origBlob, thumbBlob);
      });
    });
  });
}

// Processes a batch of image files one at a time (bounds peak memory on large photos and gives
// meaningful progress feedback), isolating failures per file so one bad file (unsupported
// format, corrupt data, decode timeout) doesn't discard the others that succeeded.
// Every image keeps the SAME fixed quality/size cap regardless of how many photos are in the
// batch -- resolution/quality never degrades just because more photos were attached. The
// Firestore 1MiB/doc limit is instead respected by splitting a large fallback batch across
// multiple chat messages at send time (see chunkResolvedImagesForMessages), so quality only
// ever depends on the individual photo, never on batch size.
async function processImageFilesSequentially(files, onProgress) {
  // Re-check (rather than trusting only the one automatic probe ~1s after script load) so a
  // session that started with a transient/false-negative health check gets a real chance to
  // recover once its cooldown has passed, instead of staying stuck on the low-res fallback for
  // every photo for the rest of the session.
  await checkFirebaseStorageHealth().catch(() => {});
  const succeeded = [];
  const failed = [];
  const startedAt = Date.now();
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (onProgress) {
      const elapsedSec = (Date.now() - startedAt) / 1000;
      const pct = Math.round((i / files.length) * 100);
      const remainingSec = i > 0 ? Math.max(0, Math.round((elapsedSec / i) * (files.length - i))) : null;
      onProgress({ current: i + 1, total: files.length, fileName: file.name, pct, remainingSec });
    }
    try {
      const compressed = await compressImageToDataUrls(file);
      succeeded.push(compressed);
    } catch (err) {
      failed.push({ fileName: file.name, error: err });
    }
  }
  if (onProgress) onProgress({ current: files.length, total: files.length, fileName: null, pct: 100, remainingSec: 0 });
  return { succeeded, failed };
}

// Groups resolved images ({ imageUrl, thumbUrl }) into per-message chunks that stay safely
// under Firestore's 1,048,576-byte/doc limit. When Storage upload succeeded (the normal case),
// imageUrl/thumbUrl are short download URLs, so this always yields a single chunk regardless of
// how many photos were sent. Only when images fall back to inline base64 (Storage unavailable)
// can a batch grow large enough to need more than one chunk -- and even then, each image keeps
// its full quality; only the number of chat messages sent scales, never the image quality.
const CHAT_MESSAGE_SAFE_BYTE_BUDGET = 120000; // large images must use Storage URLs, not Firestore
function chunkResolvedImagesForMessages(resolvedImages) {
  const chunks = [];
  let current = [];
  let currentBytes = 0;
  for (const img of resolvedImages) {
    const imgBytes = (img.imageUrl?.length || 0) + (img.thumbUrl?.length || 0);
    if (current.length > 0 && currentBytes + imgBytes > CHAT_MESSAGE_SAFE_BYTE_BUDGET) {
      chunks.push(current);
      current = [];
      currentBytes = 0;
    }
    current.push(img);
    currentBytes += imgBytes;
  }
  if (current.length > 0) chunks.push(current);
  return chunks;
}

function describeImageProcessingFailures(failed) {
  if (failed.length === 0) return '';
  const first = failed[0];
  const reason = first.error?.code === 'HEIC_CONVERT_FAILED'
    ? 'HEIC/HEIF 변환 실패'
    : first.error?.code === 'IMAGE_DECODE_TIMEOUT'
    ? '처리 시간 초과'
    : '지원하지 않는 형식';
  if (failed.length === 1) return `${first.fileName} 첨부 실패 (${reason})`;
  return `${failed.length}장 첨부 실패 (${reason} 등)`;
}

function getImageFilesFromClipboardEvent(event) {
  const clipboard = event?.clipboardData;
  if (!clipboard) return [];
  const files = [];
  const seen = new Set();
  const appendFile = file => {
    if (!file) return;
    const isImageLike = /^image\//i.test(file.type || '') || isHeicFile(file);
    if (!isImageLike) return;
    // Some browsers expose the same pasted screenshot both through clipboard.items and
    // clipboard.files, but with different transient names/lastModified values. Deduplicate
    // pasted images by stable binary-ish metadata first so one paste never becomes two previews.
    const stableKey = `${file.type || 'image'}:${file.size || 0}`;
    const fallbackKey = `${file.name || 'clipboard-image'}:${file.size || 0}:${file.type || ''}:${file.lastModified || 0}`;
    const key = file.size ? stableKey : fallbackKey;
    if (seen.has(key) || seen.has(fallbackKey)) return;
    seen.add(key);
    seen.add(fallbackKey);
    files.push(file);
  };

  Array.from(clipboard.items || []).forEach(item => {
    if (item?.kind === 'file' && /^image\//i.test(item.type || '')) {
      appendFile(item.getAsFile());
    }
  });
  Array.from(clipboard.files || []).forEach(appendFile);
  return files;
}

async function appendChatImageFiles({
  files,
  currentCount,
  setImageProcessing,
  setChatImages,
  showToast
}) {
  const imageFiles = Array.from(files || []).filter(file => /^image\//i.test(file?.type || '') || isHeicFile(file));
  if (imageFiles.length === 0) return { handled: false, succeeded: 0, failed: 0 };

  const remainingSlots = 50 - currentCount;
  if (remainingSlots <= 0) {
    if (showToast) showToast('사진 최대 50장', 'error');
    return { handled: true, succeeded: 0, failed: 0 };
  }

  const filesToProcess = imageFiles.slice(0, remainingSlots);
  if (imageFiles.length > remainingSlots && showToast) {
    showToast(`${remainingSlots}장만 추가됨 (최대 50장)`, 'info');
  }

  setImageProcessing({ current: 0, total: filesToProcess.length });
  const { succeeded, failed } = await processImageFilesSequentially(
    filesToProcess,
    progress => setImageProcessing(progress)
  );

  if (succeeded.length > 0) {
    setChatImages(prev => [...prev, ...succeeded]);
  }
  if (failed.length > 0) {
    console.error('Image compression failed for:', failed.map(f => f.fileName));
    if (showToast) showToast(describeImageProcessingFailures(failed), 'error', 5000);
  } else if (succeeded.length > 0 && showToast) {
    showToast(`${succeeded.length}장 첨부완료`, 'success', 3000);
  }

  return { handled: true, succeeded: succeeded.length, failed: failed.length };
}



function ImageUploadOverlay(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.ImageUploadOverlay;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function ImageProcessingOverlay(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.ImageProcessingOverlay;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function EmojiGridButton(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.EmojiGridButton;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function EmojiPickerSheet(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.EmojiPickerSheet;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}




// Uploads a compressed chat image pair to Firebase Storage and returns download URLs, or null
// if Storage isn't available/the upload fails -- callers should fall back to the base64 data
// URLs already produced by compressImageToDataUrls in that case. `onBytes(taskKey, transferred,
// total)` is called as each upload progresses so a caller can aggregate progress across a batch.
function uploadChatImageAssets(calendarId, compressed, index, onBytes, timeoutMs = 45000) {
  return new Promise((resolve) => {
    if (!firebaseStorage || !compressed?.originalBlob || !compressed?.thumbnailBlob) {
      resolve(null);
      return;
    }
    const stamp = Date.now();
    const rand = Math.random().toString(36).slice(2, 8);
    const basePath = `chatImages/${calendarId}/${stamp}_${rand}_${index}`;
    // The byte size is embedded in the filename itself (parsed back out by
    // getStorageUrlFileSize) so the Lightbox info panel can show it without any extra network
    // request -- Firebase Storage's download endpoint doesn't send a CORS header by default, so
    // a plain fetch() to read Content-Length from a different origin (like this app's GitHub
    // Pages host) is silently blocked by the browser and would never work.
    const originalRef = firebaseStorage.ref(`${basePath}_original_${compressed.originalBlob.size}b.jpg`);
    const thumbRef = firebaseStorage.ref(`${basePath}_thumb_${compressed.thumbnailBlob.size}b.jpg`);

    // On a flaky mobile connection, a stalled upload can go silent with no error/complete event
    // ever firing (the SDK is still waiting on a dead connection) -- without a bound here, the
    // whole send/edit flow would hang forever with no way for the user to recover. Time out and
    // fall back to inline base64 for that image instead.
    const runUpload = (blob, ref, taskKey) => {
      let settled = false;
      return new Promise((resolveOne) => {
        const settle = value => { if (settled) return; settled = true; resolveOne(value); };
        const timeoutId = setTimeout(() => settle(null), timeoutMs);
        const task = ref.put(blob, { contentType: 'image/jpeg' });
        task.on('state_changed', snapshot => {
          if (onBytes) onBytes(taskKey, snapshot.bytesTransferred, snapshot.totalBytes);
        }, () => { clearTimeout(timeoutId); settle(null); }, async () => {
          clearTimeout(timeoutId);
          try {
            settle(await task.snapshot.ref.getDownloadURL());
          } catch (e) {
            settle(null);
          }
        });
      });
    };

    Promise.all([
      runUpload(compressed.originalBlob, originalRef, `${index}-orig`),
      runUpload(compressed.thumbnailBlob, thumbRef, `${index}-thumb`)
    ]).then(([imageUrl, thumbUrl]) => {
      if (imageUrl && thumbUrl) resolve({ imageUrl, thumbUrl });
      else {
        console.warn('Chat image Storage upload failed (no base64 fallback)');
        resolve(null);
      }
    });
  });
}

async function dataUrlToBlob(dataUrl) {
  if (typeof dataUrl !== 'string' || !dataUrl.startsWith('data:')) return null;
  const res = await fetch(dataUrl);
  return res.ok ? res.blob() : null;
}

async function uploadInlineChatImageToStorage(calendarId, imageUrl, thumbUrl, index = 0, onBytes, timeoutMs = 45000) {
  if (!firebaseStorage) return null;
  const originalBlob = await dataUrlToBlob(imageUrl);
  const thumbnailBlob = await dataUrlToBlob(thumbUrl && thumbUrl.startsWith('data:') ? thumbUrl : imageUrl);
  if (!originalBlob || !thumbnailBlob) return null;
  return uploadChatImageAssets(calendarId, {
    original: imageUrl,
    thumbnail: thumbUrl || imageUrl,
    originalBlob,
    thumbnailBlob
  }, `share_${index}`, onBytes, timeoutMs);
}

async function migrateBase64ChatImagesForCalendar(calId, { maxMessages = 40 } = {}) {
  if (!calId || !firebaseDb || !firebaseStorage) return { migrated: 0, failed: 0, scanned: 0 };
  const storageOk = await checkFirebaseStorageHealth();
  if (!storageOk) return { migrated: 0, failed: 0, scanned: 0, reason: 'storage-unavailable' };
  let migrated = 0, failed = 0, scanned = 0;
  try {
    const snap = await firebaseDb.collection('calendars').doc(`cal_${calId}`).collection('messages')
      .orderBy('timestamp', 'asc').limit(200).get();
    const docs = [];
    snap.forEach(doc => docs.push({ id: doc.id, ...doc.data() }));
    for (const msg of docs) {
      if (migrated + failed >= maxMessages) break;
      scanned += 1;
      const urls = Array.isArray(msg.imageUrls) && msg.imageUrls.length ? msg.imageUrls : (msg.imageUrl ? [msg.imageUrl] : []);
      const thumbs = Array.isArray(msg.thumbUrls) && msg.thumbUrls.length ? msg.thumbUrls : (msg.thumbUrl ? [msg.thumbUrl] : []);
      if (!urls.some(u => typeof u === 'string' && u.startsWith('data:image'))) continue;
      const newUrls = [], newThumbs = [];
      let anyFail = false;
      for (let i = 0; i < urls.length; i++) {
        const u = urls[i], t = thumbs[i] || u;
        if (typeof u === 'string' && u.startsWith('http')) {
          newUrls.push(u);
          newThumbs.push(typeof t === 'string' && t.startsWith('http') ? t : u);
          continue;
        }
        if (typeof u !== 'string' || !u.startsWith('data:image')) { anyFail = true; break; }
        try {
          const uploaded = await uploadInlineChatImageToStorage(calId, u, t, i);
          if (!uploaded || !uploaded.imageUrl) { anyFail = true; break; }
          newUrls.push(uploaded.imageUrl);
          newThumbs.push(uploaded.thumbUrl || uploaded.imageUrl);
        } catch (e) {
          console.warn('migrate image failed', msg.id, e);
          anyFail = true; break;
        }
      }
      if (anyFail || !newUrls.length) { failed += 1; continue; }
      try {
        await firebaseDb.collection('calendars').doc(`cal_${calId}`).collection('messages').doc(msg.id).update({
          imageUrl: newUrls[0] || '', thumbUrl: newThumbs[0] || '', imageUrls: newUrls, thumbUrls: newThumbs
        });
        migrated += 1;
      } catch (e) {
        console.warn('migrate update failed', msg.id, e);
        failed += 1;
      }
    }
  } catch (e) {
    console.warn('migrateBase64ChatImagesForCalendar', e);
    return { migrated, failed, scanned, reason: String(e && e.message || e) };
  }
  return { migrated, failed, scanned };
}


// Resolves the {imageUrl, thumbUrl} pair a message/memo should store: uploaded Storage
// download URLs when possible, the original compressed base64 data URLs otherwise. uploadFn
// is uploadChatImageAssets or uploadMemoImageAssets, keeping each feature's Storage path.
async function resolveImageUrls(calendarId, compressed, index, onBytes, uploadFn) {
  const uploaded = await uploadFn(calendarId, compressed, index, onBytes);
  if (uploaded) return uploaded;
  throw new Error('이미지 업로드에 실패했습니다. 네트워크 상태를 확인한 뒤 다시 시도해 주세요.');
}

// Resolves a whole batch of images (upload + fallback per image, same as resolveImageUrls)
// while reporting combined byte-level progress across every upload in the batch as
// { pct, remainingSec }. Falls back to compressed.isExisting entries as-is (no re-upload).
// Shared by chat and memo attachments; uploadFn picks which Storage path each uses.
async function resolveImageBatch(calendarId, compressedList, onProgress, uploadFn) {
  const uploadIndexes = compressedList
    .map((c, idx) => ({ c, idx }))
    .filter(({ c }) => !c.isExisting);

  const isStorageWorking = await checkFirebaseStorageHealth();
  if (uploadIndexes.length === 0) {
    if (onProgress) onProgress({ pct: 100, remainingSec: 0, current: compressedList.length, total: compressedList.length });
    return Promise.all(compressedList.map((c) =>
      Promise.resolve({ imageUrl: c.original, thumbUrl: c.thumbnail })
    ));
  }
  if (!firebaseStorage || !isStorageWorking) {
    throw new Error('이미지 저장소를 사용할 수 없습니다. 잠시 후 다시 시도해 주세요.');
  }

  // Progress split: compression = 0~45%, upload = 45~99%
  // This ensures the bar visibly moves during the (previously silent) compression phase.
  const startedAt = Date.now();
  const total = compressedList.length;
  let compressionDone = 0;
  // 1-indexed position of the image currently being uploaded, for the "(n/total)" label --
  // images upload strictly one at a time (see the sequential loop below), so this is always
  // unambiguous.
  let currentIndex = 0;

  const reportCompressionProgress = () => {
    if (!onProgress) return;
    const pct = Math.min(44, Math.round((compressionDone / total) * 45));
    const elapsedSec = (Date.now() - startedAt) / 1000;
    const remainingSec = compressionDone > 0
      ? Math.max(0, Math.round((elapsedSec / compressionDone) * (total - compressionDone) * 2)) // *2 for upload phase too
      : null;
    onProgress({ pct, remainingSec, current: currentIndex, total });
  };

  const progressByTask = new Map();
  const reportUploadProgress = () => {
    if (!onProgress) return;
    let transferred = 0, totalBytes = 0;
    progressByTask.forEach(p => { transferred += p.transferred; totalBytes += p.total; });
    const uploadPct = totalBytes > 0 ? Math.min(54, Math.round((transferred / totalBytes) * 54)) : 0;
    const pct = Math.min(99, 45 + uploadPct);
    const elapsedSec = (Date.now() - startedAt) / 1000;
    const remainingSec = pct > 46 ? Math.max(0, Math.round(elapsedSec * (100 - pct) / pct)) : null;
    onProgress({ pct, remainingSec, current: currentIndex, total });
  };
  const onBytes = (taskKey, transferred, total) => {
    progressByTask.set(taskKey, { transferred, total });
    reportUploadProgress();
  };

  // Truly sequential per-image upload to prevent network starvation and timeouts
  const results = [];
  for (let idx = 0; idx < compressedList.length; idx++) {
    currentIndex = idx + 1;
    const c = compressedList[idx];
    if (c.isExisting) {
      compressionDone++;
      reportCompressionProgress();
      results.push({ imageUrl: c.original, thumbUrl: c.thumbnail });
    } else {
      const result = await resolveImageUrls(calendarId, c, idx, onBytes, uploadFn);
      compressionDone++;
      reportCompressionProgress();
      results.push(result);
    }
  }
  if (onProgress) onProgress({ pct: 100, remainingSec: 0, current: total, total });
  return results;
}

async function resolveChatImageBatch(calendarId, compressedList, onProgress) {
  return resolveImageBatch(calendarId, compressedList, onProgress, uploadChatImageAssets);
}

async function resolveMemoImageBatch(calendarId, compressedList, onProgress) {
  return resolveImageBatch(calendarId, compressedList, onProgress, uploadMemoImageAssets);
}

// A Storage download URL looks like https://firebasestorage.googleapis.com/...; a fallback
// image is an embedded data: URL. Only the former needs cleanup when a message is deleted.
function isStorageDownloadUrl(url) {
  return typeof url === 'string' && /^https:\/\//.test(url);
}

async function deleteChatImageFromStorage(url) {
  if (!firebaseStorage || !isStorageDownloadUrl(url)) return;
  try {
    await firebaseStorage.refFromURL(url).delete();
  } catch (e) {
    console.warn('Failed to delete chat image from Storage:', e);
  }
}

// Cleans up every Storage object attached to a message being deleted, covering both the
// legacy single-image fields and the imageUrls/thumbUrls arrays used by multi-image messages.
function deleteAllChatImagesFromStorage(msg) {
  if (!msg) return;
  const urls = new Set();
  if (msg.imageUrl) urls.add(msg.imageUrl);
  if (msg.thumbUrl) urls.add(msg.thumbUrl);
  if (Array.isArray(msg.imageUrls)) msg.imageUrls.forEach(u => u && urls.add(u));
  if (Array.isArray(msg.thumbUrls)) msg.thumbUrls.forEach(u => u && urls.add(u));
  urls.forEach(url => deleteChatImageFromStorage(url));
}

// Small line-icon for the main header's menu bar (Tabler-style outline icons, matching the
// existing icon set used elsewhere in the header/popovers).
function MenuIcon(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.MenuIcon;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function NotepadTextIcon(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.NotepadTextIcon;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function ChatSectionIcon(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.ChatSectionIcon;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function LinkIcon(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.LinkIcon;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function MessageCommentIcon(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.MessageCommentIcon;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function PencilIcon(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.PencilIcon;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function BuildingIcon(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.BuildingIcon;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function BackArrowIcon(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.BackArrowIcon;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function SunIcon(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.SunIcon;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function CloudIcon(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.CloudIcon;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function MistIcon(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.MistIcon;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function CloudRainIcon(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.CloudRainIcon;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function SnowflakeIcon(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.SnowflakeIcon;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function CloudLightningIcon(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.CloudLightningIcon;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function SettingsIcon(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.SettingsIcon;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function MapCogIcon(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.MapCogIcon;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function GiftIcon(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.GiftIcon;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function MoonStarsIcon(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.MoonStarsIcon;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function TextResizeIcon(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.TextResizeIcon;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function BellIcon(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.BellIcon;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function SearchIcon(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.SearchIcon;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function CalendarCheckIcon(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.CalendarCheckIcon;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function LockIcon(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.LockIcon;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function LogoutIcon(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.LogoutIcon;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function RefreshIcon(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.RefreshIcon;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function AdminFilledMenuIcon(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.AdminFilledMenuIcon;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function EmojiPickerIcon(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.EmojiPickerIcon;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function ExternalLinkIcon(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.ExternalLinkIcon;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function ShareIcon(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.ShareIcon;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function WalletIcon(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.WalletIcon;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function CoinIcon(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.CoinIcon;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function BanknoteArrowUpIcon(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.BanknoteArrowUpIcon;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function BanknoteArrowDownIcon(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.BanknoteArrowDownIcon;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function PiggyBankIcon(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.PiggyBankIcon;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function ChartBarIcon(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.ChartBarIcon;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function ChartPieIcon(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.ChartPieIcon;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function CalendarCogIcon(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.CalendarCogIcon;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function CalendarSearchIcon(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.CalendarSearchIcon;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function TrophyIcon(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.TrophyIcon;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function PodiumIcon(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.PodiumIcon;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function CloudDataConnectionIcon(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.CloudDataConnectionIcon;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function LogIcon(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.LogIcon;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function HourglassIcon(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.HourglassIcon;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function AlertTriangleIcon(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.AlertTriangleIcon;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function ShieldCheckIcon(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.ShieldCheckIcon;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function CalendarExportIcon(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.CalendarExportIcon;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function GalleryIcon(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.GalleryIcon;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function PollSectionIcon(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.PollSectionIcon;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function LineHeightIcon(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.LineHeightIcon;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function MegaphoneIcon(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.MegaphoneIcon;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function SmallXIcon(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.SmallXIcon;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function PlaceSectionIcon(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.PlaceSectionIcon;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function ThreeLinesIcon(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.ThreeLinesIcon;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function PlaceCategoryMarkerIcon(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.PlaceCategoryMarkerIcon;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function CctvIcon(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.CctvIcon;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function DicesIcon(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.DicesIcon;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}


// Matches MenuIcon's exact svg wrapper (16x16, stroke 2, round caps) but needs a <rect> child
// alongside its <path>s, which MenuIcon's paths-only prop can't express.




function highlightTextWithYellowMarker(text, keyword) {
  if (!text) return '';
  if (!keyword) return text;
  const cleanKeyword = keyword.trim().toLowerCase();
  if (!cleanKeyword) return text;

  const parts = [];
  let remaining = text;
  const lowerRemaining = () => remaining.toLowerCase();

  while (remaining) {
    const idx = lowerRemaining().indexOf(cleanKeyword);
    if (idx === -1) {
      parts.push(remaining);
      break;
    }
    if (idx > 0) {
      parts.push(remaining.substring(0, idx));
    }
    const matchText = remaining.substring(idx, idx + cleanKeyword.length);
    parts.push(
      /*#__PURE__*/React.createElement("mark", {
        key: remaining.length + idx,
        style: { backgroundColor: '#FEF08A', color: '#1E293B', padding: '0 2px', borderRadius: '2px', fontWeight: 'bold' }
      }, matchText)
    );
    remaining = remaining.substring(idx + cleanKeyword.length);
  }
  return React.createElement(React.Fragment, null, ...parts);
}

function parseTextWithLinks(text, keyword = '') {
  if (!text) return '';
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const urlTestRegex = /^https?:\/\/[^\s]+$/;
  const parts = text.split(urlRegex);
  return parts.map((part, i) => {
    if (urlTestRegex.test(part)) {
      return /*#__PURE__*/React.createElement("a", {
        key: i,
        href: part,
        target: "_blank",
        rel: "noopener noreferrer",
        style: {
          color: '#2563EB',
          textDecoration: 'underline',
          cursor: 'pointer',
          wordBreak: 'break-all'
        }
      }, part);
    }
    return keyword ? highlightTextWithYellowMarker(part, keyword) : part;
  });
}

function isEmojiOnlyChatText(text) {
  const compact = (text || '').trim();
  if (!compact || extractFirstUrl(compact)) return false;
  try {
    return /^[\p{Emoji_Presentation}\p{Extended_Pictographic}\uFE0F\u200D\s]+$/u.test(compact);
  } catch (e) {
    return /^[\u203C-\u3299\uD83C-\uDBFF\uDC00-\uDFFF\uFE0F\u200D\s]+$/.test(compact);
  }
}

function formatCommentDate(...args) {
  const f = (window.GATHER_APP_UTILS || {}).formatCommentDate;
  return typeof f === 'function' ? f(...args) : undefined;
}
function formatChatTime(...args) {
  const f = (window.GATHER_APP_UTILS || {}).formatChatTime;
  return typeof f === 'function' ? f(...args) : undefined;
}
function formatChatDividerDate(...args) {
  const f = (window.GATHER_APP_UTILS || {}).formatChatDividerDate;
  return typeof f === 'function' ? f(...args) : undefined;
}
// Returns paired {full, thumb} entries for a chat message's attached image(s), handling both
// the legacy single-image fields (imageUrl/thumbUrl) and the imageUrls/thumbUrls arrays used
// by multi-image messages. Empty array when the message has no image at all. Shared by the
// chat bubble renderer below and the calendar-wide PhotoGallery so both read images the same way.
function getMessageImageEntries(msg) {
  // Prefer multi-image arrays; fall back to legacy singular fields.
  // Do NOT require thumbnails — slimMessageForClient may drop oversized base64 thumbs
  // while keeping https Storage imageUrls. Requiring thumbs looked like data loss.
  const urls = Array.isArray(msg.imageUrls) && msg.imageUrls.length > 0
    ? msg.imageUrls.filter(u => typeof u === 'string' && u)
    : (typeof msg.imageUrl === 'string' && msg.imageUrl ? [msg.imageUrl] : []);
  const thumbs = Array.isArray(msg.thumbUrls) && msg.thumbUrls.length > 0
    ? msg.thumbUrls.filter(u => typeof u === 'string' && u)
    : (typeof msg.thumbUrl === 'string' && msg.thumbUrl ? [msg.thumbUrl] : []);
  const tags = Array.isArray(msg.imageTags) ? msg.imageTags : [];
  const count = Math.max(urls.length, thumbs.length);
  if (count === 0) return [];
  const entries = [];
  for (let i = 0; i < count; i++) {
    const full = urls[i] || thumbs[i];
    const thumb = thumbs[i] || urls[i];
    if (!full && !thumb) continue;
    entries.push({
      full: full || thumb,
      thumb: thumb || full,
      imageIndex: i,
      messageId: msg.id,
      timestamp: msg.timestamp,
      tags: tags[i] || ''
    });
  }
  return entries;
}

function getMessageDirectMediaEntry(msg) {
  const firstUrl = extractFirstUrl(msg?.text || '');
  const mediaInfo = getDirectChatMediaInfo(firstUrl);
  if (!mediaInfo || mediaInfo.type !== 'image') return null;
  return {
    full: mediaInfo.url,
    thumb: mediaInfo.url,
    imageIndex: 0,
    messageId: msg.id,
    timestamp: msg.timestamp,
    tags: msg.directMediaTags || '',
    directMediaUrl: mediaInfo.url
  };
}

// Renders a chat message's attached image(s): a single thumbnail for legacy/one-image
// messages, or a wrapping grid of thumbnails for messages sent with multiple images
// (msg.imageUrls/msg.thumbUrls). Returns null when the message has no image at all.
function renderChatMessageImages(msg, setActiveLightbox, singleImageStyle = {}) {
  const entries = getMessageImageEntries(msg);
  if (entries.length === 0) return null;
  const thumbs = entries.map(e => e.thumb);
  const displayUrls = entries.map(e => e.full);
  const meta = entries.map(e => ({ timestamp: msg.timestamp, messageId: msg.id, imageIndex: e.imageIndex, thumb: e.thumb, tags: e.tags }));
  if (thumbs.length === 1) {
    return /*#__PURE__*/React.createElement('img', {
      src: displayUrls[0] || thumbs[0],
      alt: '첨부이미지',
      referrerPolicy: 'no-referrer',
      onClick: () => setActiveLightbox && setActiveLightbox({ urls: displayUrls, index: 0, meta }),
      style: { 
        display: 'block', 
        borderRadius: '8px', 
        cursor: 'pointer', 
        objectFit: 'contain',
        width: '100%', 
        height: 'auto', 
        ...singleImageStyle, 
        maxWidth: 'min(100%, ' + (singleImageStyle.maxWidth || '420px') + ')',
        maxHeight: singleImageStyle.maxHeight || '60vh'
      }
    });
  }

  // Multi-image layout: PC gets denser rows so mixed image+text bubbles do not leave a huge
  // empty right side. Mobile keeps the compact 2/3-column layout for touch readability.
  const mobileCols = thumbs.length === 2 ? 2 : 3;
  const desktopCols = thumbs.length >= 12 ? 6 : thumbs.length >= 5 ? 5 : mobileCols;
  const cols = `var(--chat-image-grid-cols, ${mobileCols})`;
  const shouldFillBubble = thumbs.length >= 5;
  // Must match the grid's own actual rendered width (cols * 76px track + gaps) exactly -- a
  // 2-image message previously hardcoded '180px' here instead of the true 156px, leaving a real
  // 24px gap to the right of the thumbnails even independent of the mobile shrink-to-fit bug
  // above (see the CSS media query comment for that one).
  const maxW = `min(100%, calc(var(--chat-image-grid-cols, ${mobileCols}) * 76px + (var(--chat-image-grid-cols, ${mobileCols}) - 1) * 4px))`;

  return /*#__PURE__*/React.createElement('div', {
    className: `chat-message-image-grid${shouldFillBubble ? ' is-wide' : ''}`,
    style: {
      '--chat-image-grid-cols': desktopCols,
      '--chat-image-grid-mobile-cols': mobileCols,
      '--chat-image-grid-max-width': maxW,
      '--chat-image-thumb-track': '76px'
    },
  }, /*#__PURE__*/React.createElement('div', {
    style: {
      display: 'grid',
      gridTemplateColumns: `repeat(${cols}, var(--chat-image-thumb-track, 76px))`,
      gap: '4px',
      width: 'var(--chat-image-grid-max-width)',
      maxWidth: '100%',
      marginBottom: singleImageStyle.marginBottom || '0'
    }
  }, thumbs.map((thumb, idx) => /*#__PURE__*/React.createElement('img', {
    key: idx,
    src: thumb,
    alt: `첨부이미지 ${idx + 1}`,
    referrerPolicy: 'no-referrer',
    onClick: () => setActiveLightbox && setActiveLightbox({ urls: displayUrls, index: idx, meta }),
    style: {
      display: 'block',
      width: '100%',
      aspectRatio: '1',
      borderRadius: '6px',
      cursor: 'pointer',
      objectFit: 'cover'
    }
  }))));
}

// Best-effort per-image metadata for the Lightbox info overlay. Chat images are stored either
// inline as base64 data: URIs (exact size/type derivable from the string itself) or as uploaded
// Firebase Storage URLs -- the latter can't have their size read via a network fetch (Firebase
// Storage's download endpoint sends no CORS header by default, so the browser silently blocks a
// cross-origin fetch() from reading the response), so uploadChatImageAssets/uploadMemoImageAssets
// instead embed the byte size directly in the filename at upload time (e.g. "..._original_
// 214875b.jpg"), which getStorageUrlFileSize parses back out here with zero extra requests.
function getStorageUrlFileSize(url) {
  if (typeof url !== 'string') return null;
  const match = url.match(/_(\d+)b\.[a-zA-Z0-9]+(?:[?#]|$)/);
  return match ? Number(match[1]) : null;
}
function formatBytes(...args) {
  const f = (window.GATHER_APP_UTILS || {}).formatBytes;
  return typeof f === 'function' ? f(...args) : undefined;
}
function getDataUrlInfo(url) {
  if (typeof url !== 'string' || !url.startsWith('data:')) return null;
  const match = url.match(/^data:([^;,]*)(;base64)?,/);
  if (!match) return null;
  const mime = match[1] || 'application/octet-stream';
  const dataPart = url.slice(match[0].length);
  let sizeBytes;
  if (match[2]) {
    const padding = dataPart.endsWith('==') ? 2 : dataPart.endsWith('=') ? 1 : 0;
    sizeBytes = Math.floor(dataPart.length * 3 / 4) - padding;
  } else {
    sizeBytes = decodeURIComponent(dataPart).length;
  }
  return { mime, sizeBytes };
}

function getImageExtFromMime(mime) {
  const map = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif', 'image/heic': 'heic' };
  if (mime && map[mime]) return map[mime];
  const sub = mime && mime.split('/')[1];
  return sub ? sub.split('+')[0] : 'jpg';
}

function buildLightboxImageInfo(url, timestamp) {
  const dataInfo = getDataUrlInfo(url);
  const mime = dataInfo ? dataInfo.mime : 'image/jpeg';
  const ext = getImageExtFromMime(mime);
  const fileDate = timestamp ? new Date(timestamp) : null;
  const fileName = fileDate
    ? `moyeora_${fileDate.getFullYear()}${String(fileDate.getMonth() + 1).padStart(2, '0')}${String(fileDate.getDate()).padStart(2, '0')}_${String(fileDate.getHours()).padStart(2, '0')}${String(fileDate.getMinutes()).padStart(2, '0')}${String(fileDate.getSeconds()).padStart(2, '0')}.${ext}`
    : `moyeora_image.${ext}`;
  let dateLabel = null;
  if (timestamp) {
    const { dateStr, timeStr } = formatCommentDate(timestamp);
    dateLabel = `${dateStr} ${timeStr}`;
  }
  const storageSizeBytes = !dataInfo ? getStorageUrlFileSize(url) : null;
  return {
    dateLabel,
    fileName,
    sizeLabel: dataInfo ? formatBytes(dataInfo.sizeBytes) : (storageSizeBytes != null ? formatBytes(storageSizeBytes) : null),
    typeLabel: ext.toUpperCase()
  };
}



// Black-gradient info panel shown at the bottom of the active photo when the Lightbox's
// tap-to-toggle info mode is on. Fixed 4-line layout: 업로드 date, 파일정보 (format/size/
// dimensions), 해시태그 capsules + URL button, and the 태그입력 input row. 해시태그 is the
// public-facing name for what's stored as one space/comma-delimited string per image (see
// handleSaveImageTags) -- parsed into individual #tag capsules here for display/delete/search.




// Full-screen image viewer for a message's photo(s) -- swipeable (touch) with left/right arrow
// buttons and dot indicators when there's more than one image, matching the KakaoTalk-style
// multi-photo gallery UX the chat bubbles are modeled after. `meta` (optional, parallel to
// `urls`) supplies each image's { timestamp } for the tap-to-toggle info overlay.
function LightboxInfoPanel(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.LightboxInfoPanel;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function Lightbox(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.Lightbox;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}


// Tracks which message row's edit/delete controls should be revealed: desktop hover is
// handled purely in CSS (see .msg-row-hover:hover), this only drives the mobile tap case --
// tapping a row reveals its controls, tapping anywhere else (including another row) hides them.
function useTapRevealedMsgId() {
  const [revealedId, setRevealedId] = React.useState(null);
  React.useEffect(() => {
    const handler = e => {
      const target = e.target.closest ? e.target.closest('[data-msg-row-id]') : null;
      setRevealedId(target ? target.getAttribute('data-msg-row-id') : null);
    };
    document.addEventListener('touchstart', handler, { passive: true });
    document.addEventListener('mousedown', handler);
    return () => {
      document.removeEventListener('touchstart', handler);
      document.removeEventListener('mousedown', handler);
    };
  }, []);
  return revealedId;
}

// De-dupes rapid double-taps / pointerdown+click event duplication firing onSend() twice for the
// same message -- extracted from ChatRoomView (see its own history of this exact bug) so
// CommentsSection's independent Send button/Ctrl+Enter shortcut get the same protection instead
// of quietly missing it.
function useChatSendGuard(onSend, canSend) {
  const lockRef = React.useRef(false);
  return () => {
    if (!canSend() || lockRef.current) return;
    lockRef.current = true;
    Promise.resolve(onSend && onSend()).finally(() => {
      setTimeout(() => {
        lockRef.current = false;
      }, 250);
    });
  };
}



function ChatRoomView(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.ChatRoomView;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}


// A curated, cross-platform-consistent emoji set (Twemoji, the same flat-design set used by
// Twitter/X, Discord, and Slack) rendered as small <img> tags -- not native OS emoji fonts.
// Native emoji rendering looks different on every OS (Apple/Segoe/Noto/etc.), which is exactly
// what a shared group chat wants to avoid: everyone sees the identical glyph regardless of
// device or browser (Safari/Chrome/Edge/Firefox, desktop or mobile).
const TWEMOJI_CDN_BASE = typeof GATHER_APP_CHAT_DATA.TWEMOJI_CDN_BASE === 'string' ? GATHER_APP_CHAT_DATA.TWEMOJI_CDN_BASE : 'https://cdn.jsdelivr.net/gh/jdecked/twemoji@17.0.3/assets/svg/';
function twemojiCodepoint(emoji) {
  const hasZwj = emoji.indexOf('\u200D') !== -1;
  const codepoints = [];
  for (const ch of emoji) {
    const cp = ch.codePointAt(0);
    if (cp === 0xFE0F && !hasZwj) continue; // strip the variation selector unless a ZWJ sequence needs it, matching Twemoji's own asset naming
    codepoints.push(cp.toString(16));
  }
  return codepoints.join('-');
}
function twemojiImageUrl(emoji) {
  return `${TWEMOJI_CDN_BASE}${twemojiCodepoint(emoji)}.svg`;
}

const EMOJI_CATEGORIES = Array.isArray(GATHER_APP_CHAT_DATA.EMOJI_CATEGORIES) ? GATHER_APP_CHAT_DATA.EMOJI_CATEGORIES : [
  { label: '표정', emojis: ['😀', '😁', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😍', '🥰', '😘', '😋', '😜', '🤪', '😎', '🤩', '🥳', '😏', '😢', '😭', '😤', '😡', '🥺', '😱', '😨', '😴', '🤔', '🙄', '😅', '😐', '🤗', '🤭'] },
  { label: '손동작·사람', emojis: ['👍', '👎', '👏', '🙌', '🙏', '👋', '🤝', '💪', '✌️', '🤞', '👌', '🤙', '👊', '🤟', '🖐️', '🙇', '🙇‍♂️', '🙇‍♀️', '🤦', '🤷'] },
  { label: '하트', emojis: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '💕', '💖', '💗', '💘', '💝', '😻'] },
  { label: '동물·자연', emojis: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐷', '🐸', '🐵', '🌸', '🌼', '🌻', '🌈', '⭐', '☀️', '☁️', '❄️'] },
  { label: '음식', emojis: ['🍎', '🍕', '🍔', '🍟', '🍗', '🍺', '🍻', '☕', '🍰', '🎂', '🍫', '🍭', '🍜', '🍱', '🍚', '🥗'] },
  { label: '활동·사물', emojis: ['🎉', '🎊', '🎁', '🎈', '🎵', '🎶', '⚽', '📷', '📱', '💻', '⏰', '🔥', '💤', '💯', '✅', '❌', '⚠️', '📌', '📍', '🚗'] },
  { label: '기호', emojis: ['✨', '💥', '💫', '💦', '💨', '🆗', '🆒', '🔔', '🚫', '❓', '❗', '➕', '➖'] }
];

const RECENT_EMOJI_STORAGE_KEY = typeof GATHER_APP_CHAT_DATA.RECENT_EMOJI_STORAGE_KEY === 'string' ? GATHER_APP_CHAT_DATA.RECENT_EMOJI_STORAGE_KEY : 'gather_recent_emojis_v1';
function getRecentEmojis() {
  try {
    const arr = JSON.parse(getLocalStorage().getItem(RECENT_EMOJI_STORAGE_KEY) || '[]');
    return Array.isArray(arr) ? arr.slice(0, 24) : [];
  } catch (e) {
    return [];
  }
}
function addRecentEmoji(emoji) {
  try {
    const next = [emoji, ...getRecentEmojis().filter(e => e !== emoji)].slice(0, 24);
    getLocalStorage().setItem(RECENT_EMOJI_STORAGE_KEY, JSON.stringify(next));
  } catch (e) {
    // storage unavailable (private browsing etc.) -- recents just won't persist
  }
}

// A single emoji cell: renders the shared Twemoji image, falling back to the native character
// (via the system font) if the CDN image fails to load, so a network hiccup never blocks
// picking an emoji outright.




// Colored capsule button that opens a ChatParticipantSheet -- the "누구 작성" trigger used by
// the memo composer/editor and the chat edit modal (so a message posted under the wrong
// participant can be corrected). One definition so the pill's look stays identical everywhere.


// Speech-bubble "comment" icon (Lucide message), used by the memo comment toggle button.


// Pencil "edit" icon, matching the exact glyph the chat message action row already uses --
// shared here so the memo comment feature's edit button looks identical rather than a copy.


// "building-2" icon -- same path data as the raw SVG string PlaceMapView's Leaflet popup builds
// for its "지도에서 업체정보 보기" button (see businessInfoBtn.innerHTML), so the place list's icon
// version of 업체보기 looks identical to the map popup's.





function ChatParticipantSheet(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.ChatParticipantSheet;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function NotificationPermissionHelpModal(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.NotificationPermissionHelpModal;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}


function ConfirmDialog(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.ConfirmDialog;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}








// canvas-confetti creates ONE shared canvas on the first confetti() call anywhere in the app and
// bakes that call's zIndex into it permanently -- later calls with a different zIndex are
// ignored since the canvas is reused, not recreated. So every call site must pass this same
// value, or an earlier low-zIndex call (e.g. a chat send burst) locks the canvas behind modals.
const CONFETTI_Z_INDEX = 999999;

function getShortTitleParts(dateStr) {
  if (!dateStr) return { year: '', rest: '' };
  const [year, month, day] = dateStr.split('-');
  const dateObj = new Date(year, month - 1, day);
  const dayOfWeek = ['일', '월', '화', '수', '목', '금', '토'][dateObj.getDay()];
  const shortYear = year.slice(2);
  return {
    year: `${shortYear}.`,
    rest: `${month}.${day}(${dayOfWeek})`
  };
}




function DateModal(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.DateModal;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}




function doesPlaceMatchDate(place, dateStr) {
  if (place.visitDate === dateStr) return true;
  const normalizedTarget = normalizePlaceDateForSort(dateStr);
  if (!normalizedTarget) return false;
  if (place.visitDate && normalizePlaceDateForSort(place.visitDate) === normalizedTarget) return true;
  const visitEntries = parseVisitEntriesFromMemo(place.memo);
  for (const entry of visitEntries) {
    if (normalizePlaceDateForSort(entry.date) === normalizedTarget) return true;
  }
  const memoDate = extractLeadingMemoDate(place.memo);
  if (memoDate && normalizePlaceDateForSort(memoDate) === normalizedTarget) return true;
  return false;
}


const rebuildCalendarToTimestamp = (calendar, T, logs = []) => {
  const now = Date.now();

  // Sort chronologically
  const sortedLogs = [...logs].sort((a, b) => a.timestamp - b.timestamp);

  // 1. Rebuild participants (only kept if created before T, un-removed if deleted after T)
  const rebuiltParticipants = (calendar.participants || [])
    .filter(p => (p.updatedAt || 0) <= T)
    .map(p => {
      if (p.removedAt && p.removedAt > T) {
        const { removedAt, ...rest } = p;
        return rest;
      }
      return p;
    });

  const participantIds = new Set(rebuiltParticipants.map(p => p.id));

  // 2. Rebuild availabilities
  const rebuiltAvailabilities = new Map();
  for (const log of sortedLogs) {
    if (log.timestamp > T) continue;
    if (POLL_ACTIVITY_ACTIONS.includes(log.action)) continue;
    if (log.participantId && !participantIds.has(log.participantId)) continue;

    const key = `${log.date}_${log.participantId}`;
    if (log.action === 'create' || log.action === 'update') {
      rebuiltAvailabilities.set(key, {
        date: log.date,
        participantId: log.participantId,
        note: log.note || '',
        updatedAt: log.timestamp
      });
    } else if (log.action === 'delete') {
      rebuiltAvailabilities.delete(key);
    }
  }

  // 3. Rebuild Polls and Votes
  const rebuiltPolls = (calendar.polls || [])
    .filter(poll => (poll.createdAt || 0) <= T)
    .map(poll => {
      const votes = {};
      const optionMap = (poll.options || []).reduce((acc, opt) => {
        acc[opt.text] = opt.id;
        return acc;
      }, {});

      for (const log of sortedLogs) {
        if (log.timestamp > T) continue;
        if (!participantIds.has(log.participantId)) continue;

        if (log.action === 'poll_vote' && log.note.startsWith(`${poll.title} / `)) {
          const optText = log.note.substring(poll.title.length + 3);
          const optId = optionMap[optText];
          if (optId) votes[log.participantId] = optId;
        } else if (log.action === 'poll_cancel' && log.note.startsWith(`${poll.title} / `)) {
          delete votes[log.participantId];
        }
      }
      return { ...poll, votes, updatedAt: T };
    });

  // 4. Rebuild Confirmed Meetings and Expenses
  const rebuiltMeetingsMap = new Map();
  (calendar.confirmedMeeting || []).forEach(m => {
    if (!m) return;
    const expenses = (m.expenses || []).filter(e => (e.createdAt || 0) <= T);
    const isConfirmed = m.confirmed !== false && (m.confirmedAt || 0) <= T;
    rebuiltMeetingsMap.set(m.date, {
      ...m,
      confirmed: isConfirmed,
      confirmedAt: isConfirmed ? m.confirmedAt : null,
      expenses: expenses
    });
  });

  for (const log of sortedLogs) {
    if (log.timestamp > T) continue;
    const dateStr = log.date;
    if (!dateStr) continue;

    if (log.action === 'meeting_confirm') {
      const existing = rebuiltMeetingsMap.get(dateStr) || { date: dateStr, expenses: [] };
      rebuiltMeetingsMap.set(dateStr, {
        ...existing,
        confirmed: true,
        confirmedAt: log.timestamp,
        note: log.note
      });
    } else if (log.action === 'meeting_cancel') {
      const existing = rebuiltMeetingsMap.get(dateStr) || { date: dateStr, expenses: [] };
      rebuiltMeetingsMap.set(dateStr, {
        ...existing,
        confirmed: false,
        confirmedAt: null
      });
    } else if (log.action === 'expense_create' || log.action === 'expense_update') {
      const existing = rebuiltMeetingsMap.get(dateStr) || { date: dateStr, expenses: [] };
      const match = /^([+-])([\d,]+)원\s*(.*)$/.exec(log.note);
      if (match) {
        const sign = match[1];
        const amountVal = Number(match[2].replace(/,/g, ''));
        const amount = sign === '+' ? -amountVal : amountVal;
        const label = match[3] || '';
        const expId = `rebuilt_exp_${log.id}`;
        const categoryId = 'etc';

        if (log.action === 'expense_create') {
          existing.expenses.push({
            id: expId,
            label,
            url: '',
            categoryId,
            amount,
            createdAt: log.timestamp,
            updatedAt: log.timestamp
          });
        } else {
          const idx = existing.expenses.findIndex(e => e.label === label);
          if (idx >= 0) {
            existing.expenses[idx] = {
              ...existing.expenses[idx],
              amount,
              updatedAt: log.timestamp
            };
          } else {
            existing.expenses.push({
              id: expId,
              label,
              url: '',
              categoryId,
              amount,
              createdAt: log.timestamp,
              updatedAt: log.timestamp
            });
          }
        }
      }
      rebuiltMeetingsMap.set(dateStr, existing);
    } else if (log.action === 'expense_delete') {
      const existing = rebuiltMeetingsMap.get(dateStr) || { date: dateStr, expenses: [] };
      const match = /^([+-])([\d,]+)원\s*(.*)$/.exec(log.note);
      if (match) {
        const label = match[3] || '';
        existing.expenses = existing.expenses.filter(e => e.label !== label);
      }
      rebuiltMeetingsMap.set(dateStr, existing);
    }
  }

  const rebuiltLogs = logs.filter(log => log.timestamp <= T);

  return {
    ...calendar,
    participants: rebuiltParticipants,
    availabilities: Array.from(rebuiltAvailabilities.values()),
    polls: rebuiltPolls,
    confirmedMeeting: Array.from(rebuiltMeetingsMap.values()).filter(m => m.confirmed !== false || m.expenses.length > 0),
    activityLogs: rebuiltLogs,
    updatedAt: now,
    revision: (calendar.revision || 0) + 1
  };
};

// A <input type="color">-replacement: native color inputs open the OS/browser's own color
// picker (a system popup outside the app's control, and inconsistent across browsers/dark
// mode) -- this instead opens the same bottom-sheet pattern as every other picker in the app,
// letting the user choose from the same PRESET_COLORS palette new participants are auto-assigned
// from. Used for calendar accent color, participant color, and expense category color alike.


// Admin Modal
// A <select>-replacement styled as a form-select trigger button that opens the same bottom-sheet
// picker pattern used elsewhere in the app (e.g. the admin header's calendar picker) -- unlike a
// native <select>, the open dropdown list is entirely CSS-styled and follows dark mode.
function SectionCountBadge(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.SectionCountBadge;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function SectionToggleButton(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.SectionToggleButton;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function SearchCategoryTabs(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.SearchCategoryTabs;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function SimpleBottomSheetPicker(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.SimpleBottomSheetPicker;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function PhotoGallery(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.PhotoGallery;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function SummaryList(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.SummaryList;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}




// Wraps every case-insensitive match of `keyword` inside `text` in a <mark>. Shared by
// GlobalSearchModal (single-calendar) and AdminUnifiedSearchResultsView (cross-calendar).
function highlightKeyword(text, keyword) {
  if (!text) return '';
  if (!keyword) return text;
  const cleanKeyword = keyword.trim().toLowerCase();
  if (!cleanKeyword) return text;

  const parts = [];
  let remaining = text;
  const lowerRemaining = () => remaining.toLowerCase();

  while (remaining) {
    const idx = lowerRemaining().indexOf(cleanKeyword);
    if (idx === -1) {
      parts.push(remaining);
      break;
    }
    if (idx > 0) {
      parts.push(remaining.substring(0, idx));
    }
    const matchText = remaining.substring(idx, idx + cleanKeyword.length);
    parts.push(
      /*#__PURE__*/React.createElement("mark", {
        key: remaining.length,
        style: { backgroundColor: '#FEF08A', color: '#1E293B', padding: '0 2px', borderRadius: '2px', fontWeight: 'bold' }
      }, matchText)
    );
    remaining = remaining.substring(idx + cleanKeyword.length);
  }
  return React.createElement(React.Fragment, null, ...parts);
}

// Formats a timestamp the same way the admin 로그 tab does, so every search result row (and the
// admin chat log itself) reads identically: "8/13 오후 2:05:31" style, ko-KR locale.
function formatLogTimestamp(ts) {
  if (!ts) return '';
  return new Date(ts).toLocaleString('ko-KR', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

// Left-pointing chevron/arrow used by every "back to previous screen" header in this app
// (memo view, unified search results, etc.) -- one definition so the stroke weight/shape never
// drifts between screens.
// The single "<" back-button glyph used at the left of every page header in the app (chat room,
// memo, admin unified search, and any future page) -- a chevron-down rotated 90deg, matching the
// exact shape/weight this app has always used for "go back", not a full arrow-with-shaft.


// One keyword-search pass over a single calendar's 일정/채팅/태그/정산/메모 data. Shared by
// GlobalSearchModal (single active calendar) and AdminUnifiedSearchResultsView (looped across
// every calendar) so the two search surfaces can never drift out of sync on matching rules.
function computeCalendarSearchMatches(cal, chatMessages, memoList, q, limit = 30) {
  if (!cal || !q) return { schedules: [], chat: [], tags: [], expenses: [], memos: [] };
  const participantsMap = getActiveParticipants(cal).reduce((acc, p) => { acc[p.id] = p; return acc; }, {});
  const expenseCategoriesMap = getExpenseCategories(cal).reduce((acc, c) => { acc[c.id] = c; return acc; }, {});

  const schedules = getActiveAvailabilities(cal)
    .filter(item => (item.note || '').toLowerCase().includes(q) || (participantsMap[item.participantId]?.name || '').toLowerCase().includes(q))
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, limit)
    .map(item => ({ ...item, participantName: participantsMap[item.participantId]?.name || '알수없음', participantColor: participantsMap[item.participantId]?.color || '#94A3B8' }));

  const chat = (chatMessages || [])
    .filter(msg => (msg.text || '').toLowerCase().includes(q))
    .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
    .slice(0, limit)
    .map(msg => ({ ...msg, participantName: participantsMap[msg.participantId]?.name || '알수없음', participantColor: participantsMap[msg.participantId]?.color || '#94A3B8' }));

  const tags = [];
  (chatMessages || []).forEach(msg => {
    const directEntry = getMessageDirectMediaEntry(msg);
    const imageEntries = directEntry ? [...getMessageImageEntries(msg), directEntry] : getMessageImageEntries(msg);
    imageEntries.forEach(entry => {
      if ((entry.tags || '').toLowerCase().includes(q)) {
        tags.push({ ...entry, participantName: participantsMap[msg.participantId]?.name || '알수없음', participantColor: participantsMap[msg.participantId]?.color || '#94A3B8' });
      }
    });
  });
  tags.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

  const expenses = [];
  (cal.confirmedMeeting || []).forEach(meeting => {
    (meeting.expenses || []).forEach(exp => {
      // Income entries are stored with categoryId 'etc' as a placeholder (they don't have a
      // real spending category), so resolving categoryName straight off expenseCategoriesMap
      // would badge/match them as "기타" like a real misc *expense* -- same fix SettlementPage's
      // getDisplayCategory already applies for the on-screen badge, mirrored here so search
      // agrees with what's actually shown.
      const isIncome = isExpenseIncomeEntry(exp);
      const category = expenseCategoriesMap[exp.categoryId];
      const categoryName = isIncome ? '수입' : (category?.name || '기타');
      const categoryColor = isIncome ? '#16A34A' : (category?.color || '#94A3B8');
      if ((exp.label || '').toLowerCase().includes(q) || (exp.url || '').toLowerCase().includes(q) || categoryName.toLowerCase().includes(q)) {
        expenses.push({ ...exp, date: meeting.date, categoryName, categoryColor });
      }
    });
  });
  expenses.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

  const memos = (memoList || [])
    .filter(memo => (memo.title || '').toLowerCase().includes(q) || (memo.text || '').toLowerCase().includes(q) || (memo.tags || []).some(t => (t || '').toLowerCase().includes(q)))
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
    .slice(0, limit)
    .map(memo => ({ ...memo, participantName: participantsMap[memo.participantId]?.name || '알수없음', participantColor: participantsMap[memo.participantId]?.color || '#94A3B8' }));

  return { schedules, chat, tags: tags.slice(0, limit), expenses: expenses.slice(0, limit), memos };
}

// Underlined tab bar with count badges, used by both search surfaces to switch between the
// 일정/채팅/태그/정산/메모 result categories.


// Admin-로그-tab-style result row: colorful name/category badge on top, matched content in the
// middle, timestamp on the bottom. Shared by GlobalSearchModal and AdminUnifiedSearchResultsView
// for every category except 태그 (which shows a photo thumbnail instead of a badge+text line).


// Global Search Modal -- searches the active calendar's schedule memos, participant names, and
// chat message text all in one place. Clicking a schedule result opens that date's DateModal;
// clicking a chat result opens the full chat view scrolled to that exact message bubble. Kept
// intentionally simple (substring match, no fuzzy search/indexing) since a single calendar's
// data is small enough that this is instant.


// Admin unified cross-calendar search: keyword input layer-popup. Submitting hands the query
// up to AdminDashboard, which swaps its normal tab content for AdminUnifiedSearchResultsView.


// Admin unified cross-calendar search: full result page, grouped by calendar then by category
// (일정/대화/투표/태그). Reuses the same helper functions/matching rules GlobalSearchModal uses
// per calendar, just looped across every calendar already held in AdminDashboard's memory
// (serverCalendars/messagesMap) instead of a single one.
// Builds the citizen-facing calendar URL that actually shows a given search result's real
// content, so a click can open it in a new tab instead of just linking back to admin state.
// Mirrors the deep-link params App reads on load (date / view=chat&msg=&img= / view=memo).
function getAdminSearchResultTargetUrl(type, item) {
  const params = new URLSearchParams({ id: item.calendarId });
  if (type === 'schedules' || type === 'expenses') {
    params.set('date', item.date);
  } else if (type === 'chat') {
    params.set('view', 'chat');
    params.set('msg', item.id);
  } else if (type === 'tags') {
    params.set('view', 'chat');
    params.set('msg', item.messageId);
    params.set('img', String(item.imageIndex));
  } else if (type === 'memos') {
    params.set('view', 'memo');
  }
  return `${getAppBaseUrl()}?${params.toString()}`;
}



// Share Modal
function ShareModal(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.ShareModal;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}


function UserManualOverlay(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.UserManualOverlay;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}





















function getWeatherIcon(code, size = 16) {
  const c = Number(code);
  if (c === 0) return /*#__PURE__*/React.createElement(SunIcon, { size });
  if ([1, 2, 3].includes(c)) return /*#__PURE__*/React.createElement(CloudIcon, { size });
  if ([45, 48].includes(c)) return /*#__PURE__*/React.createElement(MistIcon, { size });
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(c)) return /*#__PURE__*/React.createElement(CloudRainIcon, { size });
  if ([71, 73, 75, 77, 85, 86].includes(c)) return /*#__PURE__*/React.createElement(SnowflakeIcon, { size });
  if ([95, 96, 99].includes(c)) return /*#__PURE__*/React.createElement(CloudLightningIcon, { size });
  return /*#__PURE__*/React.createElement(SunIcon, { size });
}

function WeatherBadge(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.WeatherBadge;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function WeatherLocationModal(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.WeatherLocationModal;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}


function translateKoreanToEnglish(query) {
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






function SharedSideMenuSettings(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.SharedSideMenuSettings;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function MainSideMenu(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.MainSideMenu;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}


function UpdateAvailableBanner(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.UpdateAvailableBanner;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function ImageShareViewer(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.ImageShareViewer;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function ImageThumbRemoveButton(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.ImageThumbRemoveButton;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function InlineSearchBar(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.InlineSearchBar;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function MemoShareModal(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.MemoShareModal;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function ChatSideMenu(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.ChatSideMenu;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}


function ChatGalleryModal(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.ChatGalleryModal;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}


// Scroll-direction-based header visibility (hide on scroll-down, reveal on scroll-up or near
// the top), the same behavior as the chat room header (see handleChatScroll in ChatRoomView).
// Shared here so any other full-page header (memo, and future pages) can adopt the identical
// hide/show + floating-back-button pattern without re-deriving the threshold logic.
function useScrollHideHeader() {
  const [isHeaderVisible, setIsHeaderVisible] = React.useState(true);
  const lastScrollTopRef = React.useRef(0);
  const onScroll = React.useCallback((e) => {
    const scrollTop = e.target.scrollTop;
    const lastScrollTop = lastScrollTopRef.current;
    if (scrollTop < 10) {
      setIsHeaderVisible(true);
    } else if (scrollTop > lastScrollTop && scrollTop > 56) {
      setIsHeaderVisible(false);
    } else if (scrollTop < lastScrollTop) {
      setIsHeaderVisible(true);
    }
    lastScrollTopRef.current = scrollTop;
  }, []);
  return { isHeaderVisible, onScroll };
}

function MemoView(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.MemoView;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}





// Memo Card component for clean grid layout separation


// Activity Log generator function for memos
function createMemoActivityLog(calendarId, action, participantId = '', timestamp = Date.now(), note = '') {
  // toISOString() is UTC, not local time -- a memo logged between midnight and 9am KST would
  // otherwise get attributed to the previous day in the activity log's date field.
  const d = new Date(timestamp);
  const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const participantPart = sanitizeText(participantId || 'system', 120);
  return normalizeActivityLog(calendarId, {
    id: `${calendarId}_memo_${participantPart}_${action}_${timestamp}_${Math.random().toString(36).slice(2, 8)}`,
    calendarId,
    participantId: sanitizeText(participantId || '', 120),
    action,
    note,
    timestamp,
    date: dateStr
  });
}

// REST fallback helper for uploading memo image assets to Firebase Storage
function uploadMemoImageAssets(calendarId, compressed, index, onBytes, timeoutMs = 45000) {
  return new Promise((resolve) => {
    if (!firebaseStorage || !compressed?.originalBlob || !compressed?.thumbnailBlob) {
      resolve(null);
      return;
    }
    const stamp = Date.now();
    const rand = Math.random().toString(36).slice(2, 8);
    const basePath = `memoImages/${calendarId}/${stamp}_${rand}_${index}`;
    // Byte size embedded in the filename -- see the matching comment in uploadChatImageAssets.
    const originalRef = firebaseStorage.ref(`${basePath}_original_${compressed.originalBlob.size}b.jpg`);
    const thumbRef = firebaseStorage.ref(`${basePath}_thumb_${compressed.thumbnailBlob.size}b.jpg`);

    const runUpload = (blob, ref, taskKey) => {
      let settled = false;
      return new Promise((resolveOne) => {
        const settle = value => { if (settled) return; settled = true; resolveOne(value); };
        const timeoutId = setTimeout(() => settle(null), timeoutMs);
        const task = ref.put(blob, { contentType: 'image/jpeg' });
        task.on('state_changed', snapshot => {
          if (onBytes) onBytes(taskKey, snapshot.bytesTransferred, snapshot.totalBytes);
        }, () => { clearTimeout(timeoutId); settle(null); }, async () => {
          clearTimeout(timeoutId);
          try {
            settle(await task.snapshot.ref.getDownloadURL());
          } catch (e) {
            settle(null);
          }
        });
      });
    };

    Promise.all([
      runUpload(compressed.originalBlob, originalRef, `${index}-orig`),
      runUpload(compressed.thumbnailBlob, thumbRef, `${index}-thumb`)
    ]).then(([imageUrl, thumbUrl]) => {
      if (imageUrl && thumbUrl) resolve({ imageUrl, thumbUrl });
      else {
        console.warn('Memo image Storage upload failed');
        resolve(null);
      }
    });
  });
}



function getAnniversariesForDate(dateStr, anniversariesList) {
  if (!dateStr || !Array.isArray(anniversariesList)) return [];
  const [y, m, d] = dateStr.split('-').map(Number);
  
  const results = [];
  anniversariesList.forEach(ann => {
    if (ann.type === 'yearly') {
      if (ann.isLunar) {
        try {
          const cal = new KoreanLunarCalendar();
          const [lunarM, lunarD] = ann.date.split('-').map(Number);
          cal.setLunarDate(y, lunarM, lunarD, !!ann.isLeap);
          const solar = cal.getSolarCalendar();
          if (solar && solar.year === y && solar.month === m && solar.day === d) {
            results.push({
              id: ann.id,
              title: `${ann.title} (음)`,
              badgeColor: '#EF4444',
              icon: '🎂'
            });
          }
        } catch (e) {
          console.warn('Lunar date calculation failed for', ann.title, e);
        }
      } else {
        const [solarM, solarD] = ann.date.split('-').map(Number);
        if (solarM === m && solarD === d) {
          results.push({
            id: ann.id,
            title: `${ann.title}`,
            badgeColor: '#EF4444',
            icon: '🎂'
          });
        }
      }
    } else if (ann.type === 'dday') {
      const targetStr = ann.targetDate;
      if (targetStr === dateStr) {
        results.push({
          id: ann.id,
          title: `${ann.title} (D-Day)`,
          badgeColor: '#3B82F6',
          icon: '🎁'
        });
      } else {
        const tDate = new Date(`${targetStr}T00:00:00`);
        const cDate = new Date(`${dateStr}T00:00:00`);
        const diffMs = cDate.getTime() - tDate.getTime();
        const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
        
        if (ann.isCountDown) {
          if (diffDays < 0) {
            const daysLeft = Math.abs(diffDays);
            if (daysLeft === 100 || daysLeft === 50 || daysLeft === 10 || daysLeft === 30) {
              results.push({
                id: ann.id,
                title: `${ann.title} D-${daysLeft}`,
                badgeColor: '#6366F1',
                icon: '📅'
              });
            }
          }
        } else {
          if (diffDays === 99) {
            results.push({
              id: ann.id,
              title: `${ann.title} 100일`,
              badgeColor: '#EC4899',
              icon: '💖'
            });
          } else if (diffDays === 199) {
            results.push({
              id: ann.id,
              title: `${ann.title} 200일`,
              badgeColor: '#EC4899',
              icon: '💖'
            });
          } else if (diffDays === 299) {
            results.push({
              id: ann.id,
              title: `${ann.title} 300일`,
              badgeColor: '#EC4899',
              icon: '💖'
            });
          } else if (diffDays === 364) {
            results.push({
              id: ann.id,
              title: `${ann.title} 1주년`,
              badgeColor: '#EC4899',
              icon: '🎉'
            });
          } else if (diffDays > 0 && diffDays % 365 === 364) {
            const years = Math.round((diffDays + 1) / 365);
            results.push({
              id: ann.id,
              title: `${ann.title} ${years}주년`,
              badgeColor: '#EC4899',
              icon: '🎉'
            });
          }
        }
      }
    }
  });
  return results;
}

// Anniversary badges default to a generic type color, but when the title names an active
// participant (e.g. "김현석 생일"), use that person's own calendar color instead. Matches
// against the LONGEST participant name found in the title first, so a short name (e.g. "김현")
// can't shadow a longer, more specific one (e.g. "김현석") that also appears in the list.
function getAnniversaryDisplayColor(ann, calendar) {
  const matched = getActiveParticipants(calendar)
    .filter(p => p.name && ann.title.includes(p.name))
    .sort((a, b) => b.name.length - a.name.length)[0];
  return matched ? matched.color : ann.badgeColor;
}

// Signed day-count from today to targetDateStr (positive = future, negative = past),
// local-midnight based to match formatDDayLabel's convention.
function calculateDday(targetDateStr) {
  const [y, m, d] = targetDateStr.split('-').map(Number);
  const target = new Date(y, m - 1, d);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((target - today) / 86400000);
}

// Converts a lunar calendar date to its solar-calendar equivalent for display
// (e.g. showing "this year's" solar date next to a recurring lunar anniversary).
// Returns a 'YYYY-MM-DD' string, or null if the lunar date is invalid.
function getSolarFromLunar(year, month, day, isLeap) {
  try {
    const cal = new KoreanLunarCalendar();
    cal.setLunarDate(year, month, day, !!isLeap);
    const solar = cal.getSolarCalendar();
    if (!solar) return null;
    return `${solar.year}-${String(solar.month).padStart(2, '0')}-${String(solar.day).padStart(2, '0')}`;
  } catch (e) {
    console.warn('Lunar to solar conversion failed:', e);
    return null;
  }
}

function AnniversaryModal(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.AnniversaryModal;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function SettlementSummaryModal(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.SettlementSummaryModal;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function PollModal(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.PollModal;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}



// Icon helper function for gift












// Shared slide-down search row used by chat / memo / places (and gallery). Visual baseline is
// the places search field: left magnifier, borderless transparent input, optional trailing
// actions (prev/next/close, clear, etc.) stay page-specific.

































































// Shared "remove attached image" button for thumbnail previews (chat composer, memo composer
// new/edit) -- keeps the delete affordance visually identical everywhere a photo can be staged,
// so a style change here applies to every composer instead of drifting between copies.




// Standard 2(+)-way exclusive-choice control: a single bordered rounded-box container (not a
// capsule/pill -- see PlaceRegisterModal 방문/예정) holding each option as its own segment, thin
// divider between segments, selected segment filled with its own color + white text. Each option
// can carry its own activeColor (e.g. green for 수입, red for 지출) instead of defaulting to the
// app's purple accent, so this covers both neutral toggles (방문/예정, 누적보기/일자별보기) and
// semantically-colored ones (수입/지출) with one shared component.


// Shared numeric badge for section-title counts (진행중 투표, 모임 확정, 전원 참석 가능, 갤러리 등) --
// uses currentColor so it automatically tints to whatever accent color the surrounding title sets.








// Custom date+time picker replacing the browser's native <input type="datetime-local"> overlay
// (which renders with its own OS-styled chrome that doesn't follow the app's dark mode) with a
// layer-popup matching the main calendar's year/month picker look and feel.
const DEADLINE_PICKER_MONTH_NAMES = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];




// Summary List - Displays both "Partial Availability" (N+ members) and "Full Availability" lists


// Leaflet is a UMD/global-style library (not an ES module), so unlike loadHeicTo's dynamic
// import(), it has to be lazy-loaded via a plain <script> tag injection -- mirrors the same
// memoized-promise + multi-CDN-fallback shape though, reusing loadScriptOnce from the HEIC
// loading code above.
let leafletLoadPromise = null;
const LEAFLET_JS_CDN_URLS = [
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
  'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.js'
];
const LEAFLET_CSS_CDN_URLS = [
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.css'
];
function loadLeafletCss() {
  if (document.getElementById('leaflet-css-link')) return;
  const link = document.createElement('link');
  link.id = 'leaflet-css-link';
  link.rel = 'stylesheet';
  link.href = LEAFLET_CSS_CDN_URLS[0];
  document.head.appendChild(link);
}
function loadLeaflet(timeoutMs = 15000) {
  if (window.L) return Promise.resolve(window.L);
  if (leafletLoadPromise) return leafletLoadPromise;
  leafletLoadPromise = (async () => {
    loadLeafletCss();
    let lastErr = null;
    for (const src of LEAFLET_JS_CDN_URLS) {
      try {
        await loadScriptOnce(src, timeoutMs);
        if (window.L) return window.L;
        lastErr = new Error('leaflet script loaded but window.L missing');
      } catch (err) {
        lastErr = err;
      }
    }
    leafletLoadPromise = null; // allow retrying on a later call instead of caching the failure forever
    throw lastErr || new Error('leaflet failed to load from all CDNs');
  })();
  return leafletLoadPromise;
}

// Marker clustering (leaflet.markercluster) -- with dozens/hundreds of places (e.g. an imported
// travel log), rendering every pin as its own live DOM marker makes Leaflet's pan/zoom repaint
// visibly janky since it repositions every marker element on every animation frame. Grouping
// nearby pins into a single cluster badge that only splits apart once you zoom in keeps the
// number of on-screen marker elements small regardless of how many places are registered.
// Best-effort: if this plugin fails to load, the map still works with ungrouped markers (see the
// clusterAvailable fallback in PlaceMapView below) rather than failing the whole map.
let leafletMarkerClusterLoadPromise = null;
const LEAFLET_MARKERCLUSTER_JS_CDN_URLS = [
  'https://unpkg.com/leaflet.markercluster@1.5.3/dist/leaflet.markercluster.js',
  'https://cdn.jsdelivr.net/npm/leaflet.markercluster@1.5.3/dist/leaflet.markercluster.js'
];
function loadLeafletMarkerClusterCss() {
  if (document.getElementById('leaflet-markercluster-css-link')) return;
  const link = document.createElement('link');
  link.id = 'leaflet-markercluster-css-link';
  link.rel = 'stylesheet';
  link.href = 'https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.css';
  document.head.appendChild(link);
}
function loadLeafletMarkerCluster(timeoutMs = 15000) {
  if (window.L && window.L.markerClusterGroup) return Promise.resolve();
  if (leafletMarkerClusterLoadPromise) return leafletMarkerClusterLoadPromise;
  leafletMarkerClusterLoadPromise = (async () => {
    loadLeafletMarkerClusterCss();
    let lastErr = null;
    for (const src of LEAFLET_MARKERCLUSTER_JS_CDN_URLS) {
      try {
        await loadScriptOnce(src, timeoutMs);
        if (window.L && window.L.markerClusterGroup) return;
        lastErr = new Error('leaflet.markercluster script loaded but L.markerClusterGroup missing');
      } catch (err) {
        lastErr = err;
      }
    }
    leafletMarkerClusterLoadPromise = null;
    throw lastErr || new Error('leaflet.markercluster failed to load from all CDNs');
  })();
  return leafletMarkerClusterLoadPromise;
}



// Default center/zoom for a calendar with no places registered yet -- Seoul City Hall, a
// reasonable default since this app is Korean-audience-only.
const PLACE_MAP_DEFAULT_CENTER = [37.5665, 126.9780];
const PLACE_MAP_DEFAULT_ZOOM = 11;
// Rough bounding box for South+North Korea -- used only to decide which registered places count
// as "domestic" for the main-screen preview map's auto-fit (see preferDomesticBounds below), not
// as a precise border.
function stripKoreaCountryPrefix(...args) {
  const f = (window.GATHER_APP_UTILS || {}).stripKoreaCountryPrefix;
  return typeof f === 'function' ? f(...args) : undefined;
}
function normalizeDomesticKoreanAddress(...args) {
  const f = (window.GATHER_APP_UTILS || {}).normalizeDomesticKoreanAddress;
  return typeof f === 'function' ? f(...args) : undefined;
}
const trimLatLngOutliers = GATHER_APP_UTILS.trimLatLngOutliers || function trimLatLngOutliers(points) {
  if (!Array.isArray(points) || points.length <= 5) return points || [];
  const lats = points.map(p => p[0]).slice().sort((a, b) => a - b);
  const lngs = points.map(p => p[1]).slice().sort((a, b) => a - b);
  const pct = (arr, p) => arr[Math.min(arr.length - 1, Math.max(0, Math.round(p * (arr.length - 1))))];
  const latLo = pct(lats, 0.1), latHi = pct(lats, 0.9);
  const lngLo = pct(lngs, 0.1), lngHi = pct(lngs, 0.9);
  const trimmed = points.filter(([lat, lng]) => lat >= latLo && lat <= latHi && lng >= lngLo && lng <= lngHi);
  return trimmed.length >= 3 ? trimmed : points;
};



// Small monochrome (white, via stroke="#fff") lucide-style glyph per category id. Each icon is
// stored as an array of shape descriptors -- { tag: 'path', d } / { tag: 'rect', ... } /
// { tag: 'circle', ... } -- rather than just path "d" strings, since several of these icons (예:
// dices, hotel, shopping-cart) mix <rect>/<circle> primitives with <path>. One shared definition
// drives both a Leaflet divIcon HTML string (markers render outside React's tree, so those can't
// use a React icon component) AND a real React <PlaceCategoryMarkerIcon> element (used inline in
// the place list, see PlacesView) without keeping two copies in sync by hand. Every built-in
// category id (including 기타/etc) has its own pictogram now; a custom category id an admin adds
// beyond these falls back to the 기타 icon rather than guessing at one.
const PLACE_CATEGORY_MARKER_SHAPES = {
  // Soup (lucide "soup") -- 식당/restaurant
  restaurant: [
    { tag: 'path', d: 'M12 21a9 9 0 0 0 9-9H3a9 9 0 0 0 9 9Z' },
    { tag: 'path', d: 'M7 21h10' },
    { tag: 'path', d: 'M19.5 12 22 6' },
    { tag: 'path', d: 'M16.25 3c.27.1.8.53.75 1.36-.06.83-.93 1.2-1 2.02-.05.78.34 1.24.73 1.62' },
    { tag: 'path', d: 'M11.25 3c.27.1.8.53.74 1.36-.05.83-.93 1.2-.98 2.02-.06.78.33 1.24.72 1.62' },
    { tag: 'path', d: 'M6.25 3c.27.1.8.53.75 1.36-.06.83-.93 1.2-1 2.02-.05.78.34 1.24.74 1.62' }
  ],
  cafe: [
    { tag: 'path', d: 'M4 8h12v6a4 4 0 0 1 -4 4h-4a4 4 0 0 1 -4 -4v-6z' },
    { tag: 'path', d: 'M16 9h2a2 2 0 0 1 0 4h-2' },
    { tag: 'path', d: 'M8 2c-.6 1 .6 1.5 0 2.5' },
    { tag: 'path', d: 'M12 2c-.6 1 .6 1.5 0 2.5' }
  ],
  // Dices (lucide "dices") -- 놀이/play
  play: [
    { tag: 'rect', width: '12', height: '12', x: '2', y: '10', rx: '2', ry: '2' },
    { tag: 'path', d: 'm17.92 14 3.5-3.5a2.24 2.24 0 0 0 0-3l-5-4.92a2.24 2.24 0 0 0-3 0L10 6' },
    { tag: 'path', d: 'M6 18h.01' },
    { tag: 'path', d: 'M10 14h.01' },
    { tag: 'path', d: 'M15 6h.01' },
    { tag: 'path', d: 'M18 9h.01' }
  ],
  // Hotel (lucide "hotel") -- 숙박/lodging
  lodging: [
    { tag: 'path', d: 'M10 22v-6.57' },
    { tag: 'path', d: 'M12 11h.01' },
    { tag: 'path', d: 'M12 7h.01' },
    { tag: 'path', d: 'M14 15.43V22' },
    { tag: 'path', d: 'M15 16a5 5 0 0 0-6 0' },
    { tag: 'path', d: 'M16 11h.01' },
    { tag: 'path', d: 'M16 7h.01' },
    { tag: 'path', d: 'M8 11h.01' },
    { tag: 'path', d: 'M8 7h.01' },
    { tag: 'rect', x: '4', y: '2', width: '16', height: '20', rx: '2' }
  ],
  // ShoppingCart (lucide "shopping-cart") -- 쇼핑/shopping
  shopping: [
    { tag: 'circle', cx: '8', cy: '21', r: '1' },
    { tag: 'circle', cx: '19', cy: '21', r: '1' },
    { tag: 'path', d: 'M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12' }
  ],
  // MessageCircleMore (lucide "message-circle-more") -- 기타/etc, and the fallback for any
  // custom category id that doesn't match one of the above.
  etc: [
    { tag: 'path', d: 'M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719' },
    { tag: 'path', d: 'M8 12h.01' },
    { tag: 'path', d: 'M12 12h.01' },
    { tag: 'path', d: 'M16 12h.01' }
  ]
};
// Returns { shapes: [...] } for the marker's inner content -- an unrecognized/custom category id
// falls back to the 기타 pictogram rather than a plain emoji.
function getPlaceCategoryMarkerContent(category) {
  const id = String(category?.id || '').toLowerCase();
  return { shapes: PLACE_CATEGORY_MARKER_SHAPES[id] || PLACE_CATEGORY_MARKER_SHAPES.etc };
}
function placeMarkerShapeToHtml(shape) {
  if (shape.tag === 'rect') return `<rect x="${shape.x}" y="${shape.y}" width="${shape.width}" height="${shape.height}"${shape.rx ? ` rx="${shape.rx}"` : ''}${shape.ry ? ` ry="${shape.ry}"` : ''} />`;
  if (shape.tag === 'circle') return `<circle cx="${shape.cx}" cy="${shape.cy}" r="${shape.r}" />`;
  return `<path d="${shape.d}" />`;
}
// Marker circle/icon dimensions, shared by buildPlaceMarkerHtml and every L.divIcon iconSize
// below them so the two never drift out of sync with each other.
const PLACE_MARKER_SIZE = 34;
const PLACE_MARKER_ICON_SIZE = 18;
// Shared by both a normal individual marker AND a cluster badge that's collapsed down to a
// single child (see iconCreateFunction below) -- a cluster with only one marker left inside it
// should look identical to that marker on its own, not like a numbered cluster.
function buildPlaceMarkerHtml(category, visitStatus = 'visited') {
  const color = category ? category.color : '#64748B';
  const content = getPlaceCategoryMarkerContent(category);
  const isPlanned = visitStatus === 'planned';
  const bgColor = isPlanned ? '#FFFFFF' : color;
  const strokeColor = isPlanned ? color : '#fff';
  const borderColor = isPlanned ? color : '#fff';
  const innerHtml = `<svg xmlns="http://www.w3.org/2000/svg" width="${PLACE_MARKER_ICON_SIZE}" height="${PLACE_MARKER_ICON_SIZE}" viewBox="0 0 24 24" fill="none" stroke="${strokeColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${content.shapes.map(placeMarkerShapeToHtml).join('')}</svg>`;
  return `<div style="width:${PLACE_MARKER_SIZE}px;height:${PLACE_MARKER_SIZE}px;border-radius:50%;background:${bgColor};border:2px solid ${borderColor};box-shadow:0 1px 3px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;box-sizing:border-box;">${innerHtml}</div>`;
}
// React version of the same badge -- a small solid-color circle with the category's white line
// icon inside, matching the map marker exactly. Used in the place list (PlacesView) so its
// category badge looks like a miniature of the actual pin instead of a plain emoji.


// Renders an interactive Leaflet/OSM map with one pin per registered place, auto-fit to bounds
// so every pin stays visible. Popup content is built via DOM nodes (not HTML string
// interpolation) since place name/address/memo are free-text user input -- only the marker's
// divIcon HTML interpolates category.color (hex-validated by normalizeColorValue) and its icon
// (a fixed emoji from a controlled lookup table), never raw user text, so that stays safe as a
// string template.

// After opening a Leaflet popup, pan so the full popup+marker stays inside the map pane.
// Previous panBy([0, -h]) pushed the pin toward the bottom edge on desktop, clipping tall
// visit-history popups under the map grip / category tabs.
function panMapToFitMarkerPopup(map, marker, opts) {
  if (!map || !marker) return;
  const pad = (opts && opts.pad) || 16;
  const tryPan = () => {
    if (!map) return;
    const popup = marker.getPopup && marker.getPopup();
    const el = popup && popup.getElement && popup.getElement();
    if (!el) return;
    const mapRect = map.getContainer().getBoundingClientRect();
    const popupRect = el.getBoundingClientRect();
    let dx = 0;
    let dy = 0;
    if (popupRect.top < mapRect.top + pad) {
      dy = popupRect.top - (mapRect.top + pad);
    } else if (popupRect.bottom > mapRect.bottom - pad) {
      dy = popupRect.bottom - (mapRect.bottom - pad);
    }
    if (popupRect.left < mapRect.left + pad) {
      dx = popupRect.left - (mapRect.left + pad);
    } else if (popupRect.right > mapRect.right - pad) {
      dx = popupRect.right - (mapRect.right - pad);
    }
    if (dx !== 0 || dy !== 0) {
      map.panBy([dx, dy], { animate: opts && opts.animate !== false });
    }
  };
  requestAnimationFrame(() => requestAnimationFrame(tryPan));
  setTimeout(tryPan, 120);
  setTimeout(tryPan, 320);
}

function PlaceMapView(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.PlaceMapView;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}
function PlacesView(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.PlacesView;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}


// Address/업체명 search (Nominatim, same free geocoder the weather feature already uses as a
// fallback -- chosen as the PRIMARY geocoder here since it supports POI/business search, unlike
// Open-Meteo's city-only geocoder) + memo + category select, used for both creating a new place
// and editing an existing one (editingPlace present).
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

// Caps how long any single search tier (Kakao/Google Places/Nominatim) is allowed to hang before
// PlaceRegisterModal.handleSearch gives up on it and moves to the next fallback -- googlePlacesSearchProxy
// in particular is a 1st-gen Cloud Function that's called rarely (only when Kakao comes up empty),
// so a cold start there can otherwise stall the whole 3-tier chain far longer than any one search
// step should reasonably take.
async function fetchWithTimeout(url, timeoutMs) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
}

function PlaceRegisterModal(props) {
  const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.PlaceRegisterModal;
  return typeof C === 'function' ? React.createElement(C, props) : null;
}


// Main-screen collapsible map preview -- collapsed shows a short 16:9 map, expanded shows a
// taller 4:3 map (the toggle only resizes the map, it never hides the section like PhotoGallery
// does, since the map itself is the content). "전체보기" sits immediately before the fold arrow,
// both wrapped in one group pushed to the header's right edge.


// Full-page map view -- header follows the same fixed-back-button + centered-title +
// right-action-button convention as MemoView, with "장소등록" as the action button. Body is a
// taller interactive map (marker click opens the register modal pre-filled for editing) plus a
// scrollable place-card list below it, since editing/deleting via Leaflet popup controls isn't
// practical to build or to verify structurally -- the card list is plain React DOM instead.








// Shown only on the main calendar screen -- chat/memo/settlement have a pinned bottom input bar.
const FOOTER_FAMILY_LINKS = [
  { label: '밖에 눈오나', url: 'https://pyw31337.github.io/cctv/', Icon: CctvIcon },
  { label: 'Culture Flow', url: 'https://pyw31337.github.io/culture/', Icon: DicesIcon }
];
// .app-footer/.app-footer-family flip flex-direction at 768px (see app.css): stacked 3 lines
// on mobile, a single copyright-left/FAMILY LINK-right row on desktop.


// Switching between in-app views (main/chat/admin/memo) is a React state change, not a real
// page navigation -- a tab left open for a while (very common on mobile: backgrounded,
// resumed from the home screen, or just never closed) keeps running whatever JS was loaded
// at the LAST actual page load, even though a fresh reload always gets the latest deploy.
// Rather than leave that tab silently stuck on old code (missing something like the direct-
// media-link rendering fix) until the user happens to reload on their own, periodically
// re-check the page's own ETag with a cache-busting HEAD request and prompt a reload once it
// changes -- a forced reload mid-typing would be worse than just asking.





function bindGatherUiDeps() {
  window.GATHER_UI_DEPS = Object.assign({}, window.GATHER_UI_DEPS || {}, {
    ResizableModalContainer: typeof ResizableModalContainer === 'function' ? ResizableModalContainer : null,
    verifyAdminPasswordRemote: typeof verifyAdminPasswordRemote === 'function' ? verifyAdminPasswordRemote : null,
    SmallXIcon: typeof SmallXIcon === 'function' ? SmallXIcon : null,
    LinkIcon: typeof LinkIcon === 'function' ? LinkIcon : null,
    copyTextToClipboard: typeof copyTextToClipboard === 'function' ? copyTextToClipboard : null,
    getCalendarShareUrl: typeof getCalendarShareUrl === 'function' ? getCalendarShareUrl : null,
    getViewShareUrl: typeof getViewShareUrl === 'function' ? getViewShareUrl : null,
    ImageUrlModal: typeof ImageUrlModal === 'function' ? ImageUrlModal : null,
    buildLightboxImageInfo: typeof buildLightboxImageInfo === 'function' ? buildLightboxImageInfo : null,
    normalizeTagsForDisplay: typeof normalizeTagsForDisplay === 'function' ? normalizeTagsForDisplay : null,
    MoonStarsIcon: typeof MoonStarsIcon === 'function' ? MoonStarsIcon : null,
    TextResizeIcon: typeof TextResizeIcon === 'function' ? TextResizeIcon : null,
    BellIcon: typeof BellIcon === 'function' ? BellIcon : null,
    ToggleSwitch: typeof ToggleSwitch === 'function' ? ToggleSwitch : null,
    MenuIcon: typeof MenuIcon === 'function' ? MenuIcon : null,
    CalendarCogIcon: typeof CalendarCogIcon === 'function' ? CalendarCogIcon : null,
    MapCogIcon: typeof MapCogIcon === 'function' ? MapCogIcon : null,
    GiftIcon: typeof GiftIcon === 'function' ? GiftIcon : null,
    LockIcon: typeof LockIcon === 'function' ? LockIcon : null,
    ExternalLinkIcon: typeof ExternalLinkIcon === 'function' ? ExternalLinkIcon : null,
    SettingsIcon: typeof SettingsIcon === 'function' ? SettingsIcon : null,
    MegaphoneIcon: typeof MegaphoneIcon === 'function' ? MegaphoneIcon : null,
    getMemoItemShareUrl: typeof getMemoItemShareUrl === 'function' ? getMemoItemShareUrl : null,
    WeatherBadge: typeof WeatherBadge === 'function' ? WeatherBadge : null,
    WeatherLocationModal: typeof WeatherLocationModal === 'function' ? WeatherLocationModal : null,
    ChatGalleryModal: typeof ChatGalleryModal === 'function' ? ChatGalleryModal : null,
    LinkPreviewCard: typeof LinkPreviewCard === 'function' ? LinkPreviewCard : null,
    getMessageImageEntries: typeof getMessageImageEntries === 'function' ? getMessageImageEntries : null,
    DateModal: typeof DateModal === 'function' ? DateModal : null,
    MemoView: typeof MemoView === 'function' ? MemoView : null,
    ChatRoomView: typeof ChatRoomView === 'function' ? ChatRoomView : null,
    PencilIcon: typeof PencilIcon === 'function' ? PencilIcon : null,
    getPinnedNotices: typeof getPinnedNotices === 'function' ? getPinnedNotices : null,
    getChatLastReadTimestamp: typeof getChatLastReadTimestamp === 'function' ? getChatLastReadTimestamp : null,
    setChatLastReadTimestamp: typeof setChatLastReadTimestamp === 'function' ? setChatLastReadTimestamp : null,
    useTapRevealedMsgId: typeof useTapRevealedMsgId === 'function' ? useTapRevealedMsgId : null,
    useChatSendGuard: typeof useChatSendGuard === 'function' ? useChatSendGuard : null,
    appendChatImageFiles: typeof appendChatImageFiles === 'function' ? appendChatImageFiles : null,
    confetti: typeof confetti === 'function' ? confetti : (typeof window !== 'undefined' ? window.confetti : null),
    CONFETTI_Z_INDEX: typeof CONFETTI_Z_INDEX !== 'undefined' ? CONFETTI_Z_INDEX : 9999,
    AdminDashboard: typeof AdminDashboard === 'function' ? AdminDashboard : null,
    SearchResultLogRow: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.SearchResultLogRow) || (typeof SearchResultLogRow === 'function' ? SearchResultLogRow : null),
    TikTokEmbedWidget: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.TikTokEmbedWidget) || (typeof TikTokEmbedWidget === 'function' ? TikTokEmbedWidget : null),
    UrlCapsuleBadge: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.UrlCapsuleBadge) || (typeof UrlCapsuleBadge === 'function' ? UrlCapsuleBadge : null),
    ParticipantPickerButton: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.ParticipantPickerButton) || (typeof ParticipantPickerButton === 'function' ? ParticipantPickerButton : null),
    DateCapsuleBadge: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.DateCapsuleBadge) || (typeof DateCapsuleBadge === 'function' ? DateCapsuleBadge : null),
    MenuIcon: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.MenuIcon) || (typeof MenuIcon === 'function' ? MenuIcon : null),
    NotepadTextIcon: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.NotepadTextIcon) || (typeof NotepadTextIcon === 'function' ? NotepadTextIcon : null),
    ChatSectionIcon: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.ChatSectionIcon) || (typeof ChatSectionIcon === 'function' ? ChatSectionIcon : null),
    LinkIcon: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.LinkIcon) || (typeof LinkIcon === 'function' ? LinkIcon : null),
    MessageCommentIcon: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.MessageCommentIcon) || (typeof MessageCommentIcon === 'function' ? MessageCommentIcon : null),
    PencilIcon: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.PencilIcon) || (typeof PencilIcon === 'function' ? PencilIcon : null),
    BuildingIcon: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.BuildingIcon) || (typeof BuildingIcon === 'function' ? BuildingIcon : null),
    BackArrowIcon: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.BackArrowIcon) || (typeof BackArrowIcon === 'function' ? BackArrowIcon : null),
    SunIcon: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.SunIcon) || (typeof SunIcon === 'function' ? SunIcon : null),
    CloudIcon: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.CloudIcon) || (typeof CloudIcon === 'function' ? CloudIcon : null),
    MistIcon: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.MistIcon) || (typeof MistIcon === 'function' ? MistIcon : null),
    CloudRainIcon: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.CloudRainIcon) || (typeof CloudRainIcon === 'function' ? CloudRainIcon : null),
    SnowflakeIcon: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.SnowflakeIcon) || (typeof SnowflakeIcon === 'function' ? SnowflakeIcon : null),
    CloudLightningIcon: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.CloudLightningIcon) || (typeof CloudLightningIcon === 'function' ? CloudLightningIcon : null),
    SettingsIcon: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.SettingsIcon) || (typeof SettingsIcon === 'function' ? SettingsIcon : null),
    MapCogIcon: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.MapCogIcon) || (typeof MapCogIcon === 'function' ? MapCogIcon : null),
    GiftIcon: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.GiftIcon) || (typeof GiftIcon === 'function' ? GiftIcon : null),
    MoonStarsIcon: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.MoonStarsIcon) || (typeof MoonStarsIcon === 'function' ? MoonStarsIcon : null),
    TextResizeIcon: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.TextResizeIcon) || (typeof TextResizeIcon === 'function' ? TextResizeIcon : null),
    BellIcon: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.BellIcon) || (typeof BellIcon === 'function' ? BellIcon : null),
    SearchIcon: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.SearchIcon) || (typeof SearchIcon === 'function' ? SearchIcon : null),
    CalendarCheckIcon: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.CalendarCheckIcon) || (typeof CalendarCheckIcon === 'function' ? CalendarCheckIcon : null),
    LockIcon: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.LockIcon) || (typeof LockIcon === 'function' ? LockIcon : null),
    LogoutIcon: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.LogoutIcon) || (typeof LogoutIcon === 'function' ? LogoutIcon : null),
    RefreshIcon: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.RefreshIcon) || (typeof RefreshIcon === 'function' ? RefreshIcon : null),
    AdminFilledMenuIcon: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.AdminFilledMenuIcon) || (typeof AdminFilledMenuIcon === 'function' ? AdminFilledMenuIcon : null),
    EmojiPickerIcon: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.EmojiPickerIcon) || (typeof EmojiPickerIcon === 'function' ? EmojiPickerIcon : null),
    ExternalLinkIcon: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.ExternalLinkIcon) || (typeof ExternalLinkIcon === 'function' ? ExternalLinkIcon : null),
    ShareIcon: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.ShareIcon) || (typeof ShareIcon === 'function' ? ShareIcon : null),
    WalletIcon: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.WalletIcon) || (typeof WalletIcon === 'function' ? WalletIcon : null),
    CoinIcon: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.CoinIcon) || (typeof CoinIcon === 'function' ? CoinIcon : null),
    BanknoteArrowUpIcon: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.BanknoteArrowUpIcon) || (typeof BanknoteArrowUpIcon === 'function' ? BanknoteArrowUpIcon : null),
    BanknoteArrowDownIcon: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.BanknoteArrowDownIcon) || (typeof BanknoteArrowDownIcon === 'function' ? BanknoteArrowDownIcon : null),
    PiggyBankIcon: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.PiggyBankIcon) || (typeof PiggyBankIcon === 'function' ? PiggyBankIcon : null),
    ChartBarIcon: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.ChartBarIcon) || (typeof ChartBarIcon === 'function' ? ChartBarIcon : null),
    ChartPieIcon: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.ChartPieIcon) || (typeof ChartPieIcon === 'function' ? ChartPieIcon : null),
    CalendarCogIcon: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.CalendarCogIcon) || (typeof CalendarCogIcon === 'function' ? CalendarCogIcon : null),
    CalendarSearchIcon: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.CalendarSearchIcon) || (typeof CalendarSearchIcon === 'function' ? CalendarSearchIcon : null),
    TrophyIcon: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.TrophyIcon) || (typeof TrophyIcon === 'function' ? TrophyIcon : null),
    PodiumIcon: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.PodiumIcon) || (typeof PodiumIcon === 'function' ? PodiumIcon : null),
    CloudDataConnectionIcon: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.CloudDataConnectionIcon) || (typeof CloudDataConnectionIcon === 'function' ? CloudDataConnectionIcon : null),
    LogIcon: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.LogIcon) || (typeof LogIcon === 'function' ? LogIcon : null),
    HourglassIcon: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.HourglassIcon) || (typeof HourglassIcon === 'function' ? HourglassIcon : null),
    AlertTriangleIcon: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.AlertTriangleIcon) || (typeof AlertTriangleIcon === 'function' ? AlertTriangleIcon : null),
    ShieldCheckIcon: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.ShieldCheckIcon) || (typeof ShieldCheckIcon === 'function' ? ShieldCheckIcon : null),
    CalendarExportIcon: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.CalendarExportIcon) || (typeof CalendarExportIcon === 'function' ? CalendarExportIcon : null),
    GalleryIcon: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.GalleryIcon) || (typeof GalleryIcon === 'function' ? GalleryIcon : null),
    PollSectionIcon: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.PollSectionIcon) || (typeof PollSectionIcon === 'function' ? PollSectionIcon : null),
    LineHeightIcon: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.LineHeightIcon) || (typeof LineHeightIcon === 'function' ? LineHeightIcon : null),
    MegaphoneIcon: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.MegaphoneIcon) || (typeof MegaphoneIcon === 'function' ? MegaphoneIcon : null),
    SmallXIcon: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.SmallXIcon) || (typeof SmallXIcon === 'function' ? SmallXIcon : null),
    PlaceSectionIcon: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.PlaceSectionIcon) || (typeof PlaceSectionIcon === 'function' ? PlaceSectionIcon : null),
    ThreeLinesIcon: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.ThreeLinesIcon) || (typeof ThreeLinesIcon === 'function' ? ThreeLinesIcon : null),
    PlaceCategoryMarkerIcon: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.PlaceCategoryMarkerIcon) || (typeof PlaceCategoryMarkerIcon === 'function' ? PlaceCategoryMarkerIcon : null),
    CctvIcon: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.CctvIcon) || (typeof CctvIcon === 'function' ? CctvIcon : null),
    DicesIcon: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.DicesIcon) || (typeof DicesIcon === 'function' ? DicesIcon : null),
    ResizableModalContainer: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.ResizableModalContainer) || (typeof ResizableModalContainer === 'function' ? ResizableModalContainer : null),
    AutoGrowTextarea: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.AutoGrowTextarea) || (typeof AutoGrowTextarea === 'function' ? AutoGrowTextarea : null),
    FormAddEditActionButtons: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.FormAddEditActionButtons) || (typeof FormAddEditActionButtons === 'function' ? FormAddEditActionButtons : null),
    SegmentedToggle: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.SegmentedToggle) || (typeof SegmentedToggle === 'function' ? SegmentedToggle : null),
    ItemEditDeleteActions: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.ItemEditDeleteActions) || (typeof ItemEditDeleteActions === 'function' ? ItemEditDeleteActions : null),
    GamifiedConfirmButtonContent: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.GamifiedConfirmButtonContent) || (typeof GamifiedConfirmButtonContent === 'function' ? GamifiedConfirmButtonContent : null),
    LinkPreviewCard: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.LinkPreviewCard) || (typeof LinkPreviewCard === 'function' ? LinkPreviewCard : null),
    LinkPreviewProgressOverlay: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.LinkPreviewProgressOverlay) || (typeof LinkPreviewProgressOverlay === 'function' ? LinkPreviewProgressOverlay : null),
    DeleteConfirmModal: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.DeleteConfirmModal) || (typeof DeleteConfirmModal === 'function' ? DeleteConfirmModal : null),
    AdminLoginGate: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.AdminLoginGate) || (typeof AdminLoginGate === 'function' ? AdminLoginGate : null),
    DonutChart: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.DonutChart) || (typeof DonutChart === 'function' ? DonutChart : null),
    ColorSwatchPicker: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.ColorSwatchPicker) || (typeof ColorSwatchPicker === 'function' ? ColorSwatchPicker : null),
    StickyVideoBox: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.StickyVideoBox) || (typeof StickyVideoBox === 'function' ? StickyVideoBox : null),
    PollVoterSheet: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.PollVoterSheet) || (typeof PollVoterSheet === 'function' ? PollVoterSheet : null),
    OperationProgressOverlay: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.OperationProgressOverlay) || (typeof OperationProgressOverlay === 'function' ? OperationProgressOverlay : null),
    ToggleSwitch: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.ToggleSwitch) || (typeof ToggleSwitch === 'function' ? ToggleSwitch : null),
    Footer: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.Footer) || (typeof Footer === 'function' ? Footer : null),
    AdminCreateCalendarModal: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.AdminCreateCalendarModal) || (typeof AdminCreateCalendarModal === 'function' ? AdminCreateCalendarModal : null),
    AdminModal: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.AdminModal) || (typeof AdminModal === 'function' ? AdminModal : null),
    AdminRestorePhraseModal: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.AdminRestorePhraseModal) || (typeof AdminRestorePhraseModal === 'function' ? AdminRestorePhraseModal : null),
    AdminUnifiedSearchModal: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.AdminUnifiedSearchModal) || (typeof AdminUnifiedSearchModal === 'function' ? AdminUnifiedSearchModal : null),
    AdminUnifiedSearchResultsView: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.AdminUnifiedSearchResultsView) || (typeof AdminUnifiedSearchResultsView === 'function' ? AdminUnifiedSearchResultsView : null),
    AlertTriangleIcon: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.AlertTriangleIcon) || (typeof AlertTriangleIcon === 'function' ? AlertTriangleIcon : null),
    BackArrowIcon: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.BackArrowIcon) || (typeof BackArrowIcon === 'function' ? BackArrowIcon : null),
    CalendarCogIcon: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.CalendarCogIcon) || (typeof CalendarCogIcon === 'function' ? CalendarCogIcon : null),
    CalendarExportIcon: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.CalendarExportIcon) || (typeof CalendarExportIcon === 'function' ? CalendarExportIcon : null),
    CalendarGrid: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.CalendarGrid) || (typeof CalendarGrid === 'function' ? CalendarGrid : null),
    CalendarSearchIcon: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.CalendarSearchIcon) || (typeof CalendarSearchIcon === 'function' ? CalendarSearchIcon : null),
    ColorSwatchPicker: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.ColorSwatchPicker) || (typeof ColorSwatchPicker === 'function' ? ColorSwatchPicker : null),
    DateModal: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.DateModal) || (typeof DateModal === 'function' ? DateModal : null),
    DeadlineDateTimePicker: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.DeadlineDateTimePicker) || (typeof DeadlineDateTimePicker === 'function' ? DeadlineDateTimePicker : null),
    DirectChatMediaText: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.DirectChatMediaText) || (typeof DirectChatMediaText === 'function' ? DirectChatMediaText : null),
    HourglassIcon: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.HourglassIcon) || (typeof HourglassIcon === 'function' ? HourglassIcon : null),
    ImageUrlModal: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.ImageUrlModal) || (typeof ImageUrlModal === 'function' ? ImageUrlModal : null),
    LinkPreviewCard: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.LinkPreviewCard) || (typeof LinkPreviewCard === 'function' ? LinkPreviewCard : null),
    LogIcon: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.LogIcon) || (typeof LogIcon === 'function' ? LogIcon : null),
    MenuIcon: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.MenuIcon) || (typeof MenuIcon === 'function' ? MenuIcon : null),
    PlaceMapView: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.PlaceMapView) || (typeof PlaceMapView === 'function' ? PlaceMapView : null),
    PlaceSectionIcon: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.PlaceSectionIcon) || (typeof PlaceSectionIcon === 'function' ? PlaceSectionIcon : null),
    PlacesSection: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.PlacesSection) || (typeof PlacesSection === 'function' ? PlacesSection : null),
    PollModal: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.PollModal) || (typeof PollModal === 'function' ? PollModal : null),
    PollSectionIcon: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.PollSectionIcon) || (typeof PollSectionIcon === 'function' ? PollSectionIcon : null),
    ResizableModalContainer: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.ResizableModalContainer) || (typeof ResizableModalContainer === 'function' ? ResizableModalContainer : null),
    SearchCategoryTabs: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.SearchCategoryTabs) || (typeof SearchCategoryTabs === 'function' ? SearchCategoryTabs : null),
    SearchIcon: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.SearchIcon) || (typeof SearchIcon === 'function' ? SearchIcon : null),
    SearchResultLogRow: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.SearchResultLogRow) || (typeof SearchResultLogRow === 'function' ? SearchResultLogRow : null),
    SectionCountBadge: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.SectionCountBadge) || (typeof SectionCountBadge === 'function' ? SectionCountBadge : null),
    SectionToggleButton: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.SectionToggleButton) || (typeof SectionToggleButton === 'function' ? SectionToggleButton : null),
    SettingsIcon: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.SettingsIcon) || (typeof SettingsIcon === 'function' ? SettingsIcon : null),
    SimpleBottomSheetPicker: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.SimpleBottomSheetPicker) || (typeof SimpleBottomSheetPicker === 'function' ? SimpleBottomSheetPicker : null),
    SmallXIcon: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.SmallXIcon) || (typeof SmallXIcon === 'function' ? SmallXIcon : null),
    TikTokEmbedWidget: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.TikTokEmbedWidget) || (typeof TikTokEmbedWidget === 'function' ? TikTokEmbedWidget : null),
    AnniversaryModal: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.AnniversaryModal) || (typeof AnniversaryModal === 'function' ? AnniversaryModal : null),
    BackArrowIcon: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.BackArrowIcon) || (typeof BackArrowIcon === 'function' ? BackArrowIcon : null),
    BanknoteArrowDownIcon: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.BanknoteArrowDownIcon) || (typeof BanknoteArrowDownIcon === 'function' ? BanknoteArrowDownIcon : null),
    BanknoteArrowUpIcon: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.BanknoteArrowUpIcon) || (typeof BanknoteArrowUpIcon === 'function' ? BanknoteArrowUpIcon : null),
    CalendarCheckIcon: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.CalendarCheckIcon) || (typeof CalendarCheckIcon === 'function' ? CalendarCheckIcon : null),
    CalendarGrid: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.CalendarGrid) || (typeof CalendarGrid === 'function' ? CalendarGrid : null),
    ChartBarIcon: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.ChartBarIcon) || (typeof ChartBarIcon === 'function' ? ChartBarIcon : null),
    ChatParticipantSheet: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.ChatParticipantSheet) || (typeof ChatParticipantSheet === 'function' ? ChatParticipantSheet : null),
    ChatSectionIcon: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.ChatSectionIcon) || (typeof ChatSectionIcon === 'function' ? ChatSectionIcon : null),
    CoinIcon: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.CoinIcon) || (typeof CoinIcon === 'function' ? CoinIcon : null),
    CommentsSection: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.CommentsSection) || (typeof CommentsSection === 'function' ? CommentsSection : null),
    DeadlineDateTimePicker: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.DeadlineDateTimePicker) || (typeof DeadlineDateTimePicker === 'function' ? DeadlineDateTimePicker : null),
    EditMessageModal: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.EditMessageModal) || (typeof EditMessageModal === 'function' ? EditMessageModal : null),
    EmojiPickerIcon: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.EmojiPickerIcon) || (typeof EmojiPickerIcon === 'function' ? EmojiPickerIcon : null),
    EmojiPickerSheet: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.EmojiPickerSheet) || (typeof EmojiPickerSheet === 'function' ? EmojiPickerSheet : null),
    GlobalSearchModal: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.GlobalSearchModal) || (typeof GlobalSearchModal === 'function' ? GlobalSearchModal : null),
    ImageProcessingOverlay: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.ImageProcessingOverlay) || (typeof ImageProcessingOverlay === 'function' ? ImageProcessingOverlay : null),
    ImageThumbRemoveButton: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.ImageThumbRemoveButton) || (typeof ImageThumbRemoveButton === 'function' ? ImageThumbRemoveButton : null),
    Lightbox: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.Lightbox) || (typeof Lightbox === 'function' ? Lightbox : null),
    LineHeightIcon: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.LineHeightIcon) || (typeof LineHeightIcon === 'function' ? LineHeightIcon : null),
    LinkPreviewCard: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.LinkPreviewCard) || (typeof LinkPreviewCard === 'function' ? LinkPreviewCard : null),
    MemoCard: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.MemoCard) || (typeof MemoCard === 'function' ? MemoCard : null),
    MessageCommentIcon: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.MessageCommentIcon) || (typeof MessageCommentIcon === 'function' ? MessageCommentIcon : null),
    ParticipantPickerButton: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.ParticipantPickerButton) || (typeof ParticipantPickerButton === 'function' ? ParticipantPickerButton : null),
    PencilIcon: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.PencilIcon) || (typeof PencilIcon === 'function' ? PencilIcon : null),
    PiggyBankIcon: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.PiggyBankIcon) || (typeof PiggyBankIcon === 'function' ? PiggyBankIcon : null),
    PollList: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.PollList) || (typeof PollList === 'function' ? PollList : null),
    PollModal: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.PollModal) || (typeof PollModal === 'function' ? PollModal : null),
    PollSectionIcon: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.PollSectionIcon) || (typeof PollSectionIcon === 'function' ? PollSectionIcon : null),
    ResizableModalContainer: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.ResizableModalContainer) || (typeof ResizableModalContainer === 'function' ? ResizableModalContainer : null),
    SearchCategoryTabs: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.SearchCategoryTabs) || (typeof SearchCategoryTabs === 'function' ? SearchCategoryTabs : null),
    SearchIcon: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.SearchIcon) || (typeof SearchIcon === 'function' ? SearchIcon : null),
    SearchResultLogRow: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.SearchResultLogRow) || (typeof SearchResultLogRow === 'function' ? SearchResultLogRow : null),
    SectionCountBadge: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.SectionCountBadge) || (typeof SectionCountBadge === 'function' ? SectionCountBadge : null),
    SectionToggleButton: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.SectionToggleButton) || (typeof SectionToggleButton === 'function' ? SectionToggleButton : null),
    SegmentedToggle: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.SegmentedToggle) || (typeof SegmentedToggle === 'function' ? SegmentedToggle : null),
    SettingsIcon: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.SettingsIcon) || (typeof SettingsIcon === 'function' ? SettingsIcon : null),
    SettlementSummaryModal: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.SettlementSummaryModal) || (typeof SettlementSummaryModal === 'function' ? SettlementSummaryModal : null),
    ShareIcon: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.ShareIcon) || (typeof ShareIcon === 'function' ? ShareIcon : null),
    SimpleBottomSheetPicker: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.SimpleBottomSheetPicker) || (typeof SimpleBottomSheetPicker === 'function' ? SimpleBottomSheetPicker : null),
    SmallXIcon: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.SmallXIcon) || (typeof SmallXIcon === 'function' ? SmallXIcon : null),
    fetchSubcollectionCount: typeof fetchSubcollectionCount === 'function' ? fetchSubcollectionCount : null,
    AdminCreateCalendarModal: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.AdminCreateCalendarModal) || (typeof AdminCreateCalendarModal === 'function' ? AdminCreateCalendarModal : null),
    AdminFilledMenuIcon: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.AdminFilledMenuIcon) || (typeof AdminFilledMenuIcon === 'function' ? AdminFilledMenuIcon : null),
    AdminRestorePhraseModal: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.AdminRestorePhraseModal) || (typeof AdminRestorePhraseModal === 'function' ? AdminRestorePhraseModal : null),
    AdminUnifiedSearchModal: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.AdminUnifiedSearchModal) || (typeof AdminUnifiedSearchModal === 'function' ? AdminUnifiedSearchModal : null),
    AdminUnifiedSearchResultsView: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.AdminUnifiedSearchResultsView) || (typeof AdminUnifiedSearchResultsView === 'function' ? AdminUnifiedSearchResultsView : null),
    AlertTriangleIcon: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.AlertTriangleIcon) || (typeof AlertTriangleIcon === 'function' ? AlertTriangleIcon : null),
    CalendarCogIcon: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.CalendarCogIcon) || (typeof CalendarCogIcon === 'function' ? CalendarCogIcon : null),
    ChartBarIcon: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.ChartBarIcon) || (typeof ChartBarIcon === 'function' ? ChartBarIcon : null),
    ChartPieIcon: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.ChartPieIcon) || (typeof ChartPieIcon === 'function' ? ChartPieIcon : null),
    ChatSectionIcon: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.ChatSectionIcon) || (typeof ChatSectionIcon === 'function' ? ChatSectionIcon : null),
    CloudDataConnectionIcon: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.CloudDataConnectionIcon) || (typeof CloudDataConnectionIcon === 'function' ? CloudDataConnectionIcon : null),
    ColorSwatchPicker: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.ColorSwatchPicker) || (typeof ColorSwatchPicker === 'function' ? ColorSwatchPicker : null),
    ConfirmDialog: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.ConfirmDialog) || (typeof ConfirmDialog === 'function' ? ConfirmDialog : null),
    DonutChart: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.DonutChart) || (typeof DonutChart === 'function' ? DonutChart : null),
    ExternalLinkIcon: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.ExternalLinkIcon) || (typeof ExternalLinkIcon === 'function' ? ExternalLinkIcon : null),
    HourglassIcon: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.HourglassIcon) || (typeof HourglassIcon === 'function' ? HourglassIcon : null),
    LockIcon: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.LockIcon) || (typeof LockIcon === 'function' ? LockIcon : null),
    LogoutIcon: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.LogoutIcon) || (typeof LogoutIcon === 'function' ? LogoutIcon : null),
    PodiumIcon: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.PodiumIcon) || (typeof PodiumIcon === 'function' ? PodiumIcon : null),
    PollModal: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.PollModal) || (typeof PollModal === 'function' ? PollModal : null),
    PollSectionIcon: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.PollSectionIcon) || (typeof PollSectionIcon === 'function' ? PollSectionIcon : null),
    RefreshIcon: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.RefreshIcon) || (typeof RefreshIcon === 'function' ? RefreshIcon : null),
    SearchIcon: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.SearchIcon) || (typeof SearchIcon === 'function' ? SearchIcon : null),
    SectionCountBadge: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.SectionCountBadge) || (typeof SectionCountBadge === 'function' ? SectionCountBadge : null),
    SettingsIcon: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.SettingsIcon) || (typeof SettingsIcon === 'function' ? SettingsIcon : null),
    ShieldCheckIcon: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.ShieldCheckIcon) || (typeof ShieldCheckIcon === 'function' ? ShieldCheckIcon : null),
    SmallXIcon: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.SmallXIcon) || (typeof SmallXIcon === 'function' ? SmallXIcon : null),
    TrophyIcon: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.TrophyIcon) || (typeof TrophyIcon === 'function' ? TrophyIcon : null),
    MemoCard: typeof MemoCard === 'function' ? MemoCard : null,
    ParticipantPickerButton: typeof ParticipantPickerButton === 'function' ? ParticipantPickerButton : null,
    LinkPreviewProgressOverlay: typeof LinkPreviewProgressOverlay === 'function' ? LinkPreviewProgressOverlay : null,
    EmojiPickerIcon: typeof EmojiPickerIcon === 'function' ? EmojiPickerIcon : null,
    EmojiPickerSheet: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.EmojiPickerSheet) || (typeof EmojiPickerSheet === 'function' ? EmojiPickerSheet : null),
    ImageProcessingOverlay: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.ImageProcessingOverlay) || (typeof ImageProcessingOverlay === 'function' ? ImageProcessingOverlay : null),
    ImageUploadOverlay: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.ImageUploadOverlay) || (typeof ImageUploadOverlay === 'function' ? ImageUploadOverlay : null),
    ImageThumbRemoveButton: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.ImageThumbRemoveButton) || (typeof ImageThumbRemoveButton === 'function' ? ImageThumbRemoveButton : null),
    ChatParticipantSheet: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.ChatParticipantSheet) || (typeof ChatParticipantSheet === 'function' ? ChatParticipantSheet : null),
    MemoShareModal: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.MemoShareModal) || (typeof MemoShareModal === 'function' ? MemoShareModal : null),
    GamifiedConfirmButtonContent: typeof GamifiedConfirmButtonContent === 'function' ? GamifiedConfirmButtonContent : null,
    ItemEditDeleteActions: typeof ItemEditDeleteActions === 'function' ? ItemEditDeleteActions : null,
    LineHeightIcon: typeof LineHeightIcon === 'function' ? LineHeightIcon : null,
    UrlCapsuleBadge: typeof UrlCapsuleBadge === 'function' ? UrlCapsuleBadge : null,
    getActiveParticipants: typeof getActiveParticipants === 'function' ? getActiveParticipants : null,
    renderTextWithUrlBadge: typeof renderTextWithUrlBadge === 'function' ? renderTextWithUrlBadge : null,
    sanitizeText: typeof sanitizeText === 'function' ? sanitizeText : null,
    getMessageDirectMediaEntry: typeof getMessageDirectMediaEntry === 'function' ? getMessageDirectMediaEntry : null,
    extractFirstUrl: typeof extractFirstUrl === 'function' ? extractFirstUrl : null,
    removeFirstUrl: typeof removeFirstUrl === 'function' ? removeFirstUrl : null,
    formatChatHeaderTitle: typeof formatChatHeaderTitle === 'function' ? formatChatHeaderTitle : null,
    useScrollHideHeader: typeof useScrollHideHeader === 'function' ? useScrollHideHeader : null,
    PlaceMapView: typeof PlaceMapView === 'function' ? PlaceMapView : null,
    PlacesView: typeof PlacesView === 'function' ? PlacesView : null,
    PlaceRegisterModal: typeof PlaceRegisterModal === 'function' ? PlaceRegisterModal : null,
    AutoGrowTextarea: typeof AutoGrowTextarea === 'function' ? AutoGrowTextarea : null,
    FormAddEditActionButtons: typeof FormAddEditActionButtons === 'function' ? FormAddEditActionButtons : null,
    PlaceSectionIcon: typeof PlaceSectionIcon === 'function' ? PlaceSectionIcon : null,
    SegmentedToggle: typeof SegmentedToggle === 'function' ? SegmentedToggle : null,
    normalizePlaceAddress: typeof normalizePlaceAddress === 'function' ? normalizePlaceAddress : null,
    normalizePlaceDateForSort: typeof normalizePlaceDateForSort === 'function' ? normalizePlaceDateForSort : null,
    extractLeadingMemoDate: typeof extractLeadingMemoDate === 'function' ? extractLeadingMemoDate : null,
    autoGrowTextarea: typeof autoGrowTextarea === 'function' ? autoGrowTextarea : null,
    getPlaceCategoryIcon: typeof getPlaceCategoryIcon === 'function' ? getPlaceCategoryIcon : null,
    fetchWithTimeout: typeof fetchWithTimeout === 'function' ? fetchWithTimeout : null,
    firebaseConfig: typeof firebaseConfig !== 'undefined' ? firebaseConfig : null,
    KAKAO_CATEGORY_GROUP_TO_PLACE_CATEGORY: typeof KAKAO_CATEGORY_GROUP_TO_PLACE_CATEGORY !== 'undefined' ? KAKAO_CATEGORY_GROUP_TO_PLACE_CATEGORY : null,
    SearchCategoryTabs: typeof SearchCategoryTabs === 'function' ? SearchCategoryTabs : null,
    SimpleBottomSheetPicker: typeof SimpleBottomSheetPicker === 'function' ? SimpleBottomSheetPicker : null,
    PlaceCategoryMarkerIcon: typeof PlaceCategoryMarkerIcon === 'function' ? PlaceCategoryMarkerIcon : null,
    InlineSearchBar: typeof InlineSearchBar === 'function' ? InlineSearchBar : null,
    BackArrowIcon: typeof BackArrowIcon === 'function' ? BackArrowIcon : null,
    BuildingIcon: typeof BuildingIcon === 'function' ? BuildingIcon : null,
    PencilIcon: typeof PencilIcon === 'function' ? PencilIcon : null,
    SearchIcon: typeof SearchIcon === 'function' ? SearchIcon : null,
    ThreeLinesIcon: typeof ThreeLinesIcon === 'function' ? ThreeLinesIcon : null,
    getCalendarPlaces: typeof getCalendarPlaces === 'function' ? getCalendarPlaces : null,
    getPlaceCategories: typeof getPlaceCategories === 'function' ? getPlaceCategories : null,
    getPlaceSortDateKey: typeof getPlaceSortDateKey === 'function' ? getPlaceSortDateKey : null,
    extractLeadingMemoDate: typeof extractLeadingMemoDate === 'function' ? extractLeadingMemoDate : null,
    parseVisitEntriesFromMemo: typeof parseVisitEntriesFromMemo === 'function' ? parseVisitEntriesFromMemo : null,
    sortVisitEntriesRecentFirst: typeof sortVisitEntriesRecentFirst === 'function' ? sortVisitEntriesRecentFirst : null,
    extractKnownParticipantNames: typeof extractKnownParticipantNames === 'function' ? extractKnownParticipantNames : null,
    getPlaceExternalMapUrl: typeof getPlaceExternalMapUrl === 'function' ? getPlaceExternalMapUrl : null,
    loadLeaflet: typeof loadLeaflet === 'function' ? loadLeaflet : null,
    loadLeafletMarkerCluster: typeof loadLeafletMarkerCluster === 'function' ? loadLeafletMarkerCluster : null,
    buildPlaceMarkerHtml: typeof buildPlaceMarkerHtml === 'function' ? buildPlaceMarkerHtml : null,
    panMapToFitMarkerPopup: typeof panMapToFitMarkerPopup === 'function' ? panMapToFitMarkerPopup : null,
    PLACE_MAP_DEFAULT_CENTER: typeof PLACE_MAP_DEFAULT_CENTER !== 'undefined' ? PLACE_MAP_DEFAULT_CENTER : null,
    PLACE_MAP_DEFAULT_ZOOM: typeof PLACE_MAP_DEFAULT_ZOOM !== 'undefined' ? PLACE_MAP_DEFAULT_ZOOM : null,
    GalleryIcon: typeof GalleryIcon === 'function' ? GalleryIcon : null,
    Lightbox: (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.Lightbox) || (typeof Lightbox === 'function' ? Lightbox : null),
    SectionCountBadge: typeof SectionCountBadge === 'function' ? SectionCountBadge : null,
    SectionToggleButton: typeof SectionToggleButton === 'function' ? SectionToggleButton : null,
    SearchCategoryTabs: typeof SearchCategoryTabs === 'function' ? SearchCategoryTabs : null,
    SimpleBottomSheetPicker: typeof SimpleBottomSheetPicker === 'function' ? SimpleBottomSheetPicker : null,
    PhotoGallery: typeof PhotoGallery === 'function' ? PhotoGallery : null,
    SummaryList: typeof SummaryList === 'function' ? SummaryList : null,
    getActiveAvailabilities: typeof getActiveAvailabilities === 'function' ? getActiveAvailabilities : null,
    getCalendarPolls: typeof getCalendarPolls === 'function' ? getCalendarPolls : null,
    computeKoreanHolidaysForYear: typeof computeKoreanHolidaysForYear === 'function' ? computeKoreanHolidaysForYear : null,
    getKoreanSolarTermsForYear: typeof getKoreanSolarTermsForYear === 'function' ? getKoreanSolarTermsForYear : null,
    getTrulyConfirmedMeetings: typeof getTrulyConfirmedMeetings === 'function' ? getTrulyConfirmedMeetings : null,
    getConfirmedMeetings: typeof getConfirmedMeetings === 'function' ? getConfirmedMeetings : null,
    getHolidayNamesForDate: typeof getHolidayNamesForDate === 'function' ? getHolidayNamesForDate : null,
    getAnniversariesForDate: typeof getAnniversariesForDate === 'function' ? getAnniversariesForDate : null,
    renderChatMessageBody: typeof renderChatMessageBody === 'function' ? renderChatMessageBody : null,
    parseTextWithLinks: typeof parseTextWithLinks === 'function' ? parseTextWithLinks : null,
    highlightKeyword: typeof highlightKeyword === 'function' ? highlightKeyword : null,
    highlightTextWithYellowMarker: typeof highlightTextWithYellowMarker === 'function' ? highlightTextWithYellowMarker : null,
    getRecentEmojis: typeof getRecentEmojis === 'function' ? getRecentEmojis : null,
    addRecentEmoji: typeof addRecentEmoji === 'function' ? addRecentEmoji : null,
    fetchLinkPreview: typeof fetchLinkPreview === 'function' ? fetchLinkPreview : null,
    useLinkPreview: typeof useLinkPreview === 'function' ? useLinkPreview : null,
    isDateConfirmedMeeting: typeof isDateConfirmedMeeting === 'function' ? isDateConfirmedMeeting : null,
    calculateDday: typeof calculateDday === 'function' ? calculateDday : null,
    getShortTitleParts: typeof getShortTitleParts === 'function' ? getShortTitleParts : null,
    isEmojiOnlyChatText: typeof isEmojiOnlyChatText === 'function' ? isEmojiOnlyChatText : null,
    twemojiImageUrl: typeof twemojiImageUrl === 'function' ? twemojiImageUrl : null,
    getDirectChatMediaInfo: typeof getDirectChatMediaInfo === 'function' ? getDirectChatMediaInfo : null,
    getPollOptionVoterIds: typeof getPollOptionVoterIds === 'function' ? getPollOptionVoterIds : null,
    getPollTotalVoteCount: typeof getPollTotalVoteCount === 'function' ? getPollTotalVoteCount : null,
    getCalendarActivityLogs: typeof getCalendarActivityLogs === 'function' ? getCalendarActivityLogs : null,
    getCalendarAccentColor: typeof getCalendarAccentColor === 'function' ? getCalendarAccentColor : null,
    getAnniversaryDisplayColor: typeof getAnniversaryDisplayColor === 'function' ? getAnniversaryDisplayColor : null,
    buildActivityLogsFromAvailabilities: typeof buildActivityLogsFromAvailabilities === 'function' ? buildActivityLogsFromAvailabilities : null,
    buildAdminDashboardMetrics: typeof buildAdminDashboardMetrics === 'function' ? buildAdminDashboardMetrics : null,
    buildFieldChangeNote: typeof buildFieldChangeNote === 'function' ? buildFieldChangeNote : null,
    changeAdminPasswordRemote: typeof changeAdminPasswordRemote === 'function' ? changeAdminPasswordRemote : null,
    clearAdminSession: typeof clearAdminSession === 'function' ? clearAdminSession : null,
    cloneCalendarList: typeof cloneCalendarList === 'function' ? cloneCalendarList : null,
    computeCalendarSearchMatches: typeof computeCalendarSearchMatches === 'function' ? computeCalendarSearchMatches : null,
    createCalendarBackupPayload: typeof createCalendarBackupPayload === 'function' ? createCalendarBackupPayload : null,
    createDefaultCalendar: typeof createDefaultCalendar === 'function' ? createDefaultCalendar : null,
    createMemoActivityLog: typeof createMemoActivityLog === 'function' ? createMemoActivityLog : null,
    createPollActivityLog: typeof createPollActivityLog === 'function' ? createPollActivityLog : null,
    deleteActivityLogsAfterTimestamp: typeof deleteActivityLogsAfterTimestamp === 'function' ? deleteActivityLogsAfterTimestamp : null,
    deleteAllChatImagesFromStorage: typeof deleteAllChatImagesFromStorage === 'function' ? deleteAllChatImagesFromStorage : null,
    deleteMessageRest: typeof deleteMessageRest === 'function' ? deleteMessageRest : null,
    describeImageProcessingFailures: typeof describeImageProcessingFailures === 'function' ? describeImageProcessingFailures : null,
    doesPlaceMatchDate: typeof doesPlaceMatchDate === 'function' ? doesPlaceMatchDate : null,
    downloadJsonFile: typeof downloadJsonFile === 'function' ? downloadJsonFile : null,
    exportCalendarConfirmedMeetingsToICS: typeof exportCalendarConfirmedMeetingsToICS === 'function' ? exportCalendarConfirmedMeetingsToICS : null,
    extractCalendarsFromBackup: typeof extractCalendarsFromBackup === 'function' ? extractCalendarsFromBackup : null,
    fetchActivityLogsFromFirestore: typeof fetchActivityLogsFromFirestore === 'function' ? fetchActivityLogsFromFirestore : null,
    fetchChatMessagesRest: typeof fetchChatMessagesRest === 'function' ? fetchChatMessagesRest : null,
    fetchImageShareDocument: typeof fetchImageShareDocument === 'function' ? fetchImageShareDocument : null,
    fetchRecentMessagesRest: typeof fetchRecentMessagesRest === 'function' ? fetchRecentMessagesRest : null,
    fetchSingleCalendarWithRest: typeof fetchSingleCalendarWithRest === 'function' ? fetchSingleCalendarWithRest : null,
    formatLogTimestamp: typeof formatLogTimestamp === 'function' ? formatLogTimestamp : null,
    getAdminSearchFilterFromUrl: typeof getAdminSearchFilterFromUrl === 'function' ? getAdminSearchFilterFromUrl : null,
    getAdminSearchQueryFromUrl: typeof getAdminSearchQueryFromUrl === 'function' ? getAdminSearchQueryFromUrl : null,
    getAdminSearchResultTargetUrl: typeof getAdminSearchResultTargetUrl === 'function' ? getAdminSearchResultTargetUrl : null,
    getAdminSelectedCalendarIdFromUrl: typeof getAdminSelectedCalendarIdFromUrl === 'function' ? getAdminSelectedCalendarIdFromUrl : null,
    getAdminSession: typeof getAdminSession === 'function' ? getAdminSession : null,
    getImageFilesFromClipboardEvent: typeof getImageFilesFromClipboardEvent === 'function' ? getImageFilesFromClipboardEvent : null,
    getKnownPlaceParticipantNames: typeof getKnownPlaceParticipantNames === 'function' ? getKnownPlaceParticipantNames : null,
    getPlaceCategoryMarkerContent: typeof getPlaceCategoryMarkerContent === 'function' ? getPlaceCategoryMarkerContent : null,
    getSolarFromLunar: typeof getSolarFromLunar === 'function' ? getSolarFromLunar : null,
    getWeatherIcon: typeof getWeatherIcon === 'function' ? getWeatherIcon : null,
    isAdminRestoreRoute: typeof isAdminRestoreRoute === 'function' ? isAdminRestoreRoute : null,
    listAllCalendarsRemote: typeof listAllCalendarsRemote === 'function' ? listAllCalendarsRemote : null,
    mergeCalendarCollections: typeof mergeCalendarCollections === 'function' ? mergeCalendarCollections : null,
    mergePollRecord: typeof mergePollRecord === 'function' ? mergePollRecord : null,
    normalizeCalendarForSave: typeof normalizeCalendarForSave === 'function' ? normalizeCalendarForSave : null,
    normalizePollOptionInput: typeof normalizePollOptionInput === 'function' ? normalizePollOptionInput : null,
    processImageFilesSequentially: typeof processImageFilesSequentially === 'function' ? processImageFilesSequentially : null,
    pushSingleCloudCalendar: typeof pushSingleCloudCalendar === 'function' ? pushSingleCloudCalendar : null,
    resolveMemoImageBatch: typeof resolveMemoImageBatch === 'function' ? resolveMemoImageBatch : null,
    sanitizeMemoForFirestore: typeof sanitizeMemoForFirestore === 'function' ? sanitizeMemoForFirestore : null,
    setAdminSession: typeof setAdminSession === 'function' ? setAdminSession : null,
    sha256Hex: typeof sha256Hex === 'function' ? sha256Hex : null,
    subscribeUserToPushWithPermission: typeof subscribeUserToPushWithPermission === 'function' ? subscribeUserToPushWithPermission : null,
    translateKoreanToEnglish: typeof translateKoreanToEnglish === 'function' ? translateKoreanToEnglish : null,
    unsubscribeUserFromPush: typeof unsubscribeUserFromPush === 'function' ? unsubscribeUserFromPush : null,
    validateBackupCalendars: typeof validateBackupCalendars === 'function' ? validateBackupCalendars : null,
    validateCalendarShape: typeof validateCalendarShape === 'function' ? validateCalendarShape : null,
    ADMIN_MESSAGE_LIVE_LIMIT: typeof ADMIN_MESSAGE_LIVE_LIMIT !== 'undefined' ? ADMIN_MESSAGE_LIVE_LIMIT : 50,
    ADMIN_MEMO_LIVE_LIMIT: typeof ADMIN_MEMO_LIVE_LIMIT !== 'undefined' ? ADMIN_MEMO_LIVE_LIMIT : 50,
    FOOTER_FAMILY_LINKS: typeof FOOTER_FAMILY_LINKS !== 'undefined' ? FOOTER_FAMILY_LINKS : []
  });
}
bindGatherUiDeps();


function __gatherStartApp() {
try {
  const rootElement = document.getElementById('root');
  if (rootElement) {
    const root = ReactDOM.createRoot(rootElement);
    const imageShareId = new URLSearchParams(window.location.search).get('image');
    root.render(/*#__PURE__*/React.createElement(React.Fragment, null,
      imageShareId
        ? /*#__PURE__*/React.createElement(ImageShareViewer, { shareId: imageShareId })
        : /*#__PURE__*/React.createElement(App, null),
      /*#__PURE__*/React.createElement(UpdateAvailableBanner, null)
    ));
  }
} catch (e) {
  console.error('App render error:', e);
}

}

window.__gatherStartApp = __gatherStartApp;
if (window.__GATHER_BOOT_READY__) {
  __gatherStartApp();
}
