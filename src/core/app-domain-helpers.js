/** app-main.js에서 분리된 순수 로직 모듈 (React/JSX 의존성 없음).
 * 지출/장소 카테고리, 장소 메모 파싱, 관리자 세션/비밀번호, 푸시 알림 구독, 활동 로그,
 * 공유 URL, 캘린더/날짜 포맷팅 등 App() 컴포넌트 클로저와 무관한 헬퍼 함수/상수 모음.
 * app-main.js가 정적 import로 불러와 쓰며, Vite manualChunks(vite.config.js)에서 별도
 * 청크로 분리해 app-main 청크의 번들 예산 압박을 줄이는 것이 이 분리의 목적.
 */
const GATHER_APP_CONSTANTS = window.GATHER_APP_CONSTANTS || {};
const GATHER_APP_UTILS = window.GATHER_APP_UTILS || {};
// firebaseConfig/firebaseDb live in app-main.js (firebaseDb is mutable, reassigned by
// __setFirebaseDb once Firestore finishes loading) -- both mirror to these window globals in
// lockstep there, so this module reads through window instead of importing live bindings back.
const getLocalStorage = () => window['local' + 'Storage'];
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
  try { hasEmoji = /\p{Extended_Pictographic}/u.test(name); } catch (e) {}
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
function getTodayString() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function derivePlaceVisitStatus(place, todayStr = getTodayString()) {
  const memoText = String(place?.memo || '').trim();
  if (!memoText) return 'planned';

  const entries = parsePlaceMemoEntries(memoText);
  const datedEntries = entries.filter(e => e && e.date);

  if (datedEntries.length === 0) {
    return 'planned';
  }

  const todayNorm = normalizePlaceDateForSort(todayStr) || '';

  const hasPastOrTodayVisit = datedEntries.some(e => {
    const dNorm = normalizePlaceDateForSort(e.date);
    return dNorm && dNorm <= todayNorm;
  });

  return hasPastOrTodayVisit ? 'visited' : 'planned';
}

function parseDateStringToTimestamp(dateStr) {
  if (!dateStr) return null;
  const match = String(dateStr).match(/^(\d{2,4})[.-](\d{1,2})[.-](\d{1,2})$/);
  if (!match) return null;
  let [, y, m, d] = match;
  if (y.length === 2) y = '20' + y;
  const dateObj = new Date(Number(y), Number(m) - 1, Number(d));
  return isNaN(dateObj.getTime()) ? null : dateObj.getTime();
}

function countPlaceVisits(place, visitEntries, category) {
  const entries = Array.isArray(visitEntries) ? visitEntries.filter(e => e && e.date) : parsePlaceMemoEntries(place?.memo).filter(e => e && e.date);
  if (entries.length === 0) return 0;

  const catName = category?.name || place?.categoryName || '';
  const catId = category?.id || place?.categoryId || '';
  const isStayCategory = catId === 'hotel' || catId === 'stay' || catName === '숙박' || catName === '숙소';

  if (!isStayCategory) {
    return entries.length;
  }

  const timestamps = entries
    .map(e => parseDateStringToTimestamp(e.date))
    .filter(ts => ts !== null)
    .sort((a, b) => a - b);

  if (timestamps.length === 0) return entries.length;

  const ONE_DAY_MS = 24 * 60 * 60 * 1000;
  let stayCount = 1;

  for (let i = 1; i < timestamps.length; i++) {
    const prevTs = timestamps[i - 1];
    const currTs = timestamps[i];
    const diffDays = Math.round((currTs - prevTs) / ONE_DAY_MS);
    if (diffDays > 1) {
      stayCount++;
    }
  }

  return stayCount;
}

function normalizePlaces(places) {
  return (Array.isArray(places) ? places : [])
    .filter(place => place && Number.isFinite(Number(place.lat)) && Number.isFinite(Number(place.lng)))
    .map(place => ({
      id: sanitizeText(place.id || '', 80) || `place_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      name: sanitizeText(place.name || '', 80),
      alias: sanitizeText(place.alias || '', 80),
      address: normalizePlaceAddressForSave(place.address || '', place.lat, place.lng),
      lat: Number(place.lat),
      lng: Number(place.lng),
      categoryId: sanitizeText(place.categoryId || 'etc', 40),
      memo: sanitizeText(place.memo || '', 2000),
      visitStatus: derivePlaceVisitStatus(place),
      visitDate: isValidDateString(place.visitDate) ? place.visitDate : '',
      createdAt: Number(place.createdAt) || Date.now(),
      updatedAt: Number(place.updatedAt) || Number(place.createdAt) || Date.now()
    }));
}
function mergePlaceMemos(memoA, memoB) {
  const textA = String(memoA || '').trim();
  const textB = String(memoB || '').trim();
  if (!textA) return textB;
  if (!textB) return textA;
  if (textA === textB) return textA;

  const entriesA = parsePlaceMemoEntries(textA);
  const entriesB = parsePlaceMemoEntries(textB);
  const combinedMap = new Map();

  [...entriesA, ...entriesB].forEach(entry => {
    const key = entry.date || 'dateless';
    if (!combinedMap.has(key)) {
      combinedMap.set(key, entry.note || '');
    } else {
      const existing = combinedMap.get(key);
      if (entry.note && !existing.includes(entry.note)) {
        combinedMap.set(key, existing ? `${existing}\n${entry.note}` : entry.note);
      }
    }
  });

  const mergedEntries = [];
  combinedMap.forEach((note, date) => {
    mergedEntries.push({ date: date === 'dateless' ? '' : date, note });
  });

  const sorted = sortVisitEntriesRecentFirst(mergedEntries.filter(e => e.date));
  const dateless = mergedEntries.filter(e => !e.date);

  const formattedLines = [
    ...sorted.map(e => (e.note ? `${e.date} ${e.note}` : e.date)),
    ...dateless.map(e => e.note)
  ];
  return formattedLines.join('\n');
}

function deduplicateCalendarPlaces(places) {
  if (!Array.isArray(places) || places.length < 2) return places || [];
  const mergedList = [];
  const mergedIds = new Set();

  for (let i = 0; i < places.length; i++) {
    const p1 = places[i];
    if (!p1 || !p1.id || mergedIds.has(p1.id)) continue;

    let mergedPlace = { ...p1 };
    const officialName1 = (p1.name || '').trim().toLowerCase();
    const displayName1 = (p1.alias || p1.name || '').trim().toLowerCase();
    const address1 = (p1.address || '').trim().toLowerCase();
    const source1 = (p1.sourcePlaceId || '').trim();

    for (let j = i + 1; j < places.length; j++) {
      const p2 = places[j];
      if (!p2 || !p2.id || mergedIds.has(p2.id)) continue;
      const officialName2 = (p2.name || '').trim().toLowerCase();
      const displayName2 = (p2.alias || p2.name || '').trim().toLowerCase();
      const address2 = (p2.address || '').trim().toLowerCase();
      const source2 = (p2.sourcePlaceId || '').trim();

      const isSameSource = (source1 && source2 && source1 === source2) || (source1 && source1 === p2.id) || (source2 && source2 === p1.id);
      const isSameOfficialName = officialName1 && officialName2 && officialName1 === officialName2;
      const isSameDisplayName = displayName1 && displayName2 && displayName1 === displayName2;
      const isSameAddress = address1 && address2 && address1 === address2 && (
        officialName1 === officialName2 || displayName1 === displayName2 ||
        (officialName1 && officialName2 && (officialName1.includes(officialName2) || officialName2.includes(officialName1)))
      );

      if (isSameSource || isSameOfficialName || isSameDisplayName || isSameAddress) {
        mergedIds.add(p2.id);
        mergedPlace.memo = mergePlaceMemos(mergedPlace.memo, p2.memo);
        if (!mergedPlace.alias && p2.alias) mergedPlace.alias = p2.alias;
        if (p2.visitStatus === 'visited') mergedPlace.visitStatus = 'visited';
        if (!mergedPlace.visitDate && p2.visitDate) mergedPlace.visitDate = p2.visitDate;
        if (!mergedPlace.address && p2.address) mergedPlace.address = p2.address;
        if (!mergedPlace.sourcePlaceId && p2.sourcePlaceId) mergedPlace.sourcePlaceId = p2.sourcePlaceId;
        mergedPlace.updatedAt = Math.max(mergedPlace.updatedAt || 0, p2.updatedAt || 0);
      }
    }
    mergedList.push(mergedPlace);
  }
  return mergedList;
}

function getCalendarPlaces(calendar) {
  return deduplicateCalendarPlaces(normalizePlaces(calendar?.places));
}
// Unions the calendar document's own embedded places (legacy entries, and anything not yet
// backfilled into the subcollection) with places fetched from the places subcollection -- same
// reasoning as unionActivityLogs, since a places array built as just
// { ...calendar, places: subcollectionPlaces } would silently drop pre-migration entries.
function unionPlaces(calendar, subcollectionPlaces) {
  const byId = new Map();
  (Array.isArray(subcollectionPlaces) ? subcollectionPlaces : []).forEach(p => { if (p?.id) byId.set(p.id, p); });
  getCalendarPlaces(calendar).forEach(p => { if (p?.id) byId.set(p.id, p); });
  return deduplicateCalendarPlaces(Array.from(byId.values()));
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
const MEMO_DATE_RE = GATHER_APP_UTILS.MEMO_DATE_RE || /(\d{4}|\d{2})[.-](\d{2})[.-](\d{2})/;
const normalizeMemoDateMatch = GATHER_APP_UTILS.normalizeMemoDateMatch || function normalizeMemoDateMatch(match) {
  if (!match) return null;
  let [, y, m, d] = match;
  const mm = Number(m), dd = Number(d);
  if (mm < 1 || mm > 12 || dd < 1 || dd > 31) return null;
  if (y.length === 4) y = y.slice(2);
  return `${y}.${m}.${d}`;
};
const getMemoDateMatches = GATHER_APP_UTILS.getMemoDateMatches || function getMemoDateMatches(text) {
  const str = String(text || '');
  if (!str) return [];
  const src = (MEMO_DATE_RE && MEMO_DATE_RE.source) ? MEMO_DATE_RE.source : '(\\d{4}|\\d{2})[.-](\\d{2})[.-](\\d{2})';
  const regex = new RegExp(src, 'g');
  const matches = [];
  let match;
  while ((match = regex.exec(str)) !== null) {
    if (normalizeMemoDateMatch(match)) {
      matches.push(match);
    }
  }
  return matches;
};
const extractLeadingMemoDate = GATHER_APP_UTILS.extractLeadingMemoDate || function extractLeadingMemoDate(memo) {
  return normalizeMemoDateMatch(String(memo || "").match(MEMO_DATE_RE));
};
const parseVisitEntriesFromMemo = GATHER_APP_UTILS.parseVisitEntriesFromMemo || function parseVisitEntriesFromMemo(memo) {
  const text = String(memo || "").trim();
  if (!text) return [];
  const dateMatches = getMemoDateMatches(text);
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
// Place memo as a stack of per-date entries -- one entry per visit, addressable/editable/deletable
// individually (unlike parseVisitEntriesFromMemo above, which only kicks in once 2+ dates already
// exist, since it exists purely to reformat run-on strings for display). A place's very first memo
// entry is a single-date parse result here, not an empty array.
const parsePlaceMemoEntries = GATHER_APP_UTILS.parsePlaceMemoEntries || function parsePlaceMemoEntries(memo) {
  const text = String(memo || "").trim();
  if (!text) return [];
  const dateMatches = getMemoDateMatches(text);
  if (dateMatches.length === 0) return [{ date: '', note: text }];
  const entries = dateMatches.map((match, idx) => {
    const segmentEnd = idx + 1 < dateMatches.length ? dateMatches[idx + 1].index : text.length;
    const note = text.slice(match.index + match[0].length, segmentEnd).trim().replace(/^\/\s*/, "").replace(/\s*\/\s*$/, "");
    return { date: normalizeMemoDateMatch(match), note };
  });
  const cleaned = entries.filter(e => !(e.date && !e.note));
  return cleaned.length > 0 ? cleaned : entries;
};
const serializePlaceMemoEntries = GATHER_APP_UTILS.serializePlaceMemoEntries || function serializePlaceMemoEntries(entries) {
  return (entries || [])
    .filter(entry => entry && (entry.date || entry.note))
    .map(entry => (entry.date ? (entry.note ? `${entry.date} ${entry.note}` : entry.date) : entry.note))
    .join('\n');
};
const toMemoDateFormat = GATHER_APP_UTILS.toMemoDateFormat || function toMemoDateFormat(dateStr) {
  const match = String(dateStr || '').match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return match ? `${match[1].slice(2)}.${match[2]}.${match[3]}` : (extractLeadingMemoDate(dateStr) || String(dateStr || ''));
};
// Replaces this date's entry if one already exists (edit), otherwise appends a new one (add) --
// this is the single write path for place memos now, used both for a brand-new visit note and for
// editing/continuing an existing one, so the memo string never accumulates duplicate date lines.
const upsertPlaceMemoEntry = GATHER_APP_UTILS.upsertPlaceMemoEntry || function upsertPlaceMemoEntry(existingMemo, dateStr, note) {
  const cleanNote = String(note || '').trim();
  if (!cleanNote) return String(existingMemo || '');
  const targetNorm = normalizePlaceDateForSort(dateStr);
  const memoDate = toMemoDateFormat(dateStr);
  const entries = parsePlaceMemoEntries(existingMemo);
  const idx = entries.findIndex(entry => normalizePlaceDateForSort(entry.date) === targetNorm);
  if (idx >= 0) entries[idx] = { date: entries[idx].date || memoDate, note: cleanNote };
  else if (entries.length === 1 && !entries[0].date) entries[0] = { date: memoDate, note: cleanNote };
  else entries.push({ date: memoDate, note: cleanNote });
  return serializePlaceMemoEntries(entries);
};
const removePlaceMemoEntry = GATHER_APP_UTILS.removePlaceMemoEntry || function removePlaceMemoEntry(existingMemo, dateStr) {
  const targetNorm = normalizePlaceDateForSort(dateStr);
  const entries = parsePlaceMemoEntries(existingMemo).filter(entry => normalizePlaceDateForSort(entry.date) !== targetNorm);
  return serializePlaceMemoEntries(entries);
};
const getPlaceMemoEntryForDate = GATHER_APP_UTILS.getPlaceMemoEntryForDate || function getPlaceMemoEntryForDate(memo, dateStr) {
  const targetNorm = normalizePlaceDateForSort(dateStr);
  const entries = parsePlaceMemoEntries(memo);
  const entry = entries.find(e => normalizePlaceDateForSort(e.date) === targetNorm);
  if (entry) return entry.note;
  if (entries.length === 1 && !entries[0].date) return entries[0].note;
  return '';
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
  const str = String(dateStr).trim();
  if (isValidDateString(str)) return str;
  const match = str.match(/(\d{4}|\d{2})[.-](\d{2})[.-](\d{2})/);
  if (!match) return null;
  let [, y, m, d] = match;
  if (y.length === 2) y = '20' + y;
  const mm = Number(m), dd = Number(d);
  if (mm < 1 || mm > 12 || dd < 1 || dd > 31) return null;
  return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
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
const FIREBASE_LOAD_TIMEOUT_MS = readConfigNumber('FIREBASE_LOAD_TIMEOUT_MS', 8000);
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
  const res = await fetch(`https://us-central1-${window.__gatherFirebaseConfig.projectId}.cloudfunctions.net/${name}`, {
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
    .replace(/-/g, '+')
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

async function subscribeUserToPush(calendarId, activeParticipantId, options = {}) {
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
    if (typeof isIOSDevice === 'function' && isIOSDevice() && typeof isInstalledStandalonePwa === 'function' && !isInstalledStandalonePwa()) {
      return { ok: false, reason: 'ios-not-installed' };
    }
  } catch (_) {}
  try {
    const registration = await Promise.race([
      navigator.serviceWorker.ready,
      new Promise((_, reject) => setTimeout(() => reject(new Error('service worker ready timeout')), 10000))
    ]);
    if (!registration.pushManager) {
      console.warn('Push manager not supported on this browser');
      return { ok: false, reason: 'push-manager-unsupported' };
    }
    const publicVapidKey = 'BNk35C4KAQy9JdQJ8uzLuzDAc7zUBCznmPFJc194fcWqEtD3EZTnj03ZCwE_P2SxwVILZnDzHsj2UZxIQ0Q-huU';
    let subscription = await registration.pushManager.getSubscription();
    if (options.forceResubscribe && subscription) {
      try { await subscription.unsubscribe(); } catch (_) {}
      subscription = null;
    }
    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
      });
    }
    if (window.__gatherFirebaseDb) {
      // The caller's own chatParticipantId (the participant actually selected in THIS
      // calendar's chat room), not the app-wide "last selected participant" saved-preference
      // key -- that key isn't calendar-scoped, so a browser that had visited a different
      // calendar most recently would silently register this calendar's push subscription under
      // the WRONG participant (or 'anonymous' if never set yet), breaking the "don't notify the
      // sender" check server-side and making the admin's subscriber list wrong.
      const participantId = activeParticipantId;
      const subId = getSubscriptionHashId(subscription.endpoint);
      await window.__gatherFirebaseDb.collection('calendars').doc('cal_' + calendarId).collection('push_subscriptions').doc(subId).set({
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
      try {
        getLocalStorage().setItem('gather_push_health_' + calendarId, JSON.stringify({
          subId: subId,
          participantId: participantId,
          endpointTail: String(subscription.endpoint || '').slice(-32),
          updatedAt: Date.now()
        }));
      } catch (_) {}
      return { ok: true, subId };
    }
    return { ok: false, reason: 'firestore-unavailable' };
  } catch (err) {
    console.error('Failed to subscribe user to Web Push:', err);
    return { ok: false, reason: classifyPushSubscribeError(err), detail: err?.message || '' };
  }
}

async function ensurePushSubscriptionHealthy(calendarId, activeParticipantId) {
  if (!calendarId || !activeParticipantId) return { ok: false, reason: 'missing-participant' };
  if (!isNotificationSupported() || Notification.permission !== 'granted') {
    return { ok: false, reason: 'permission-not-granted' };
  }
  if (typeof isChatNotifyEnabledForCalendar === 'function' && !isChatNotifyEnabledForCalendar(calendarId)) {
    return { ok: false, reason: 'pref-disabled' };
  }
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = registration.pushManager ? await registration.pushManager.getSubscription() : null;
    if (!subscription) {
      return subscribeUserToPush(calendarId, activeParticipantId, { forceResubscribe: false });
    }
    const result = await subscribeUserToPush(calendarId, activeParticipantId, {});
    if (result.ok) return result;
    return subscribeUserToPush(calendarId, activeParticipantId, { forceResubscribe: true });
  } catch (err) {
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
      if (window.__gatherFirebaseDb) {
        await window.__gatherFirebaseDb.collection('calendars').doc('cal_' + calendarId).collection('push_subscriptions').doc(subId).delete();
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

// Registers sw.js, which only caches static assets (icons/manifests) -- never index.html
// itself, since this app deliberately serves its HTML as no-cache (see sw.js for why). Safe to
// register unconditionally: browsers without service worker support simply skip this.
if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').then(reg => {
      try { reg.update(); } catch (_) {}
    }).catch(e => console.warn('Service worker registration failed:', e));
  });

  if (typeof document !== 'undefined' && typeof document.addEventListener === 'function') {
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && navigator.serviceWorker.ready) {
        navigator.serviceWorker.ready.then(reg => {
          try { reg.update(); } catch (_) {}
        }).catch(() => {});
      }
    });
  }

  let swRefreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!swRefreshing) {
      swRefreshing = true;
      if (typeof window !== 'undefined' && window.location) {
        window.location.reload();
      }
    }
  });
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
  (Array.isArray(subcollectionMeetings) ? subcollectionMeetings : []).forEach(subM => {
    if (!subM?.date) return;
    const existing = byDate.get(subM.date);
    if (!existing) {
      byDate.set(subM.date, subM);
    } else {
      const subConfirmed = subM.confirmed !== false;
      const existingConfirmed = existing.confirmed !== false;
      const subTime = Number(subM.confirmedAt || subM.updatedAt || 0);
      const existingTime = Number(existing.confirmedAt || existing.updatedAt || 0);

      if ((subConfirmed && !existingConfirmed) || (subTime >= existingTime)) {
        byDate.set(subM.date, { ...existing, ...subM });
      } else {
        byDate.set(subM.date, { ...subM, ...existing });
      }
    }
  });
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

// Same mapping as the pwa-manifest-switch bootstrap script in src/index.html's <head> -- kept
// in sync manually since the two run in entirely different load phases (that one runs before
// this bundle even starts fetching).
const STATIC_MANIFEST_FILE_BY_CALENDAR = { kkot: 'manifest-kkot.json', cw: 'manifest-cw.json', jhair: 'manifest-jhair.json' };

let activeManifestBlobUrl = null;
// Swaps <link rel="manifest"> to this calendar's manifest. For kkot/cw/jhair, always points at
// the real static manifest-<id>.json file instead of generating one -- home-screen installs
// on mobile Chrome were colliding across different calendars (installing a second one reported
// "already installed", and opening either installed icon opened whichever was installed most
// recently) when every calendar's manifest was blob: URL-generated here. Each manifest's `id`
// field WAS already a distinct absolute URL, which per spec should be enough on its own for
// Chrome to treat them as separate apps regardless of start_url/scope/manifest path -- but a
// blob: URL is a fresh, session-local object each call (recreated on every calendar-load effect
// run), and in practice that was not producing distinct installable identities. A real,
// stably-addressable manifest file removes that variable entirely. Calendars outside this map
// (any created since calendar creation stopped being restricted to kkot/cw) still fall back to
// the blob-generated manifest below so they at least get their own title instead of the generic
// "모여라 캘린더" placeholder -- accepting that install-identity risk only for that admin-only,
// rarely-installed-to-home-screen case.
function applyDynamicManifest(calendar) {
  try {
    const link = document.querySelector('link[rel="manifest"]');
    if (!link) return;
    const staticFile = STATIC_MANIFEST_FILE_BY_CALENDAR[calendar.id];
    if (staticFile) {
      if (activeManifestBlobUrl) { URL.revokeObjectURL(activeManifestBlobUrl); activeManifestBlobUrl = null; }
      link.setAttribute('href', staticFile);
      return;
    }
    const manifest = buildDynamicManifest(calendar);
    const blob = new Blob([JSON.stringify(manifest)], { type: 'application/manifest+json' });
    const nextUrl = URL.createObjectURL(blob);
    link.setAttribute('href', nextUrl);
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
  let richNote = sanitizeText(note, 2000);
  if (dateStr && richNote && !richNote.includes('[일자:')) {
    richNote = `[일자: ${dateStr}] ${richNote}`;
  }
  return normalizeActivityLog(calendarId, {
    id: `${calendarId}_${dateStr}_${participantId}_${action}_${timestamp}_${Math.random().toString(36).slice(2, 8)}`,
    calendarId,
    participantId: sanitizeText(participantId || '', 120),
    date: dateStr,
    action,
    note: richNote,
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
function extractAllUrlInfos(...args) {
  const f = (window.GATHER_APP_UTILS || {}).extractAllUrlInfos;
  return typeof f === 'function' ? f(...args) : [];
}
function extractAllUrlInfosLoose(...args) {
  const f = (window.GATHER_APP_UTILS || {}).extractAllUrlInfosLoose;
  return typeof f === 'function' ? f(...args) : [];
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
  el.style.overflowX = 'hidden';
  el.style.overflowY = 'hidden';
  el.style.height = 'auto';
  const scrollHeight = el.scrollHeight;
  const next = Math.min(maxHeight, Math.max(scrollHeight, el.offsetHeight || 0));
  el.style.height = `${next}px`;
  el.style.overflowY = scrollHeight > maxHeight ? 'auto' : 'hidden';
}

// Chat-image/direct-media detection + small generic utils, moved here (rather than kept as
// two hand-synced copies in app-main.js and app-firebase-data.js) after a code review flagged
// the duplication as a silent-drift risk: app-firebase-data.js's copy is what actually drives
// fetchGalleryItemCount's user-visible "총 N장" count and fetchRecentGalleryMessages'
// pagination-stop heuristic, while app-main.js's copy drives the chat UI itself -- a future
// edit to only one (e.g. a new image extension in getDirectChatMediaInfo) would have made the
// gallery count and the chat rendering quietly disagree, with nothing catching it.
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
        // Plain youtube.com (not youtube-nocookie.com) so the iframe can read the viewer's own
        // YouTube session cookies -- nocookie mode deliberately can't identify a signed-in user at
        // all, which means it can never honor a YouTube Premium account's ad-free playback and
        // always serves the logged-out/ad-supported experience regardless of the viewer's account.
        if (id) return { type: 'embed', provider: 'youtube', url: `https://www.youtube.com/embed/${encodeURIComponent(id)}`, orientation: 'landscape' };
      }
      if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'music.youtube.com') {
        const watchId = parsed.searchParams.get('v');
        const shortsId = path.match(/\/shorts\/([^/?#]+)/i)?.[1];
        const embedId = path.match(/\/embed\/([^/?#]+)/i)?.[1];
        const liveId = path.match(/\/live\/([^/?#]+)/i)?.[1];
        const id = watchId || shortsId || embedId || liveId;
        if (id) return { type: 'embed', provider: 'youtube', url: `https://www.youtube.com/embed/${encodeURIComponent(id)}`, orientation: shortsId ? 'portrait' : 'landscape' };
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
      tags: tags[i] || '',
      // Callers building non-chat entries (e.g. memo pseudo-messages) override `source`
      // explicitly -- see ui-chat-gallery.js/ui-summary-gallery.js's sharedPhotos/photoEntries.
      source: 'chat',
      uploadSource: msg.uploadSource || null
    });
  }
  return entries;
}

function getDirectMediaTagKey(url) {
  const source = String(url || '');
  let hash = 2166136261;
  for (let i = 0; i < source.length; i++) {
    hash ^= source.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return `u_${(hash >>> 0).toString(36)}`;
}

function getDirectMediaTagsForUrl(msg, url) {
  const tags = msg?.directMediaTags;
  if (!tags) return '';
  if (typeof tags === 'string') return tags;
  if (typeof tags === 'object' && !Array.isArray(tags)) {
    return tags[getDirectMediaTagKey(url)] || '';
  }
  return '';
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
    tags: getDirectMediaTagsForUrl(msg, mediaInfo.url),
    directMediaUrl: mediaInfo.url,
    source: 'chat',
    uploadSource: msg.uploadSource || null
  };
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

export {
  PRESET_COLORS,
  DEFAULT_EXPENSE_CATEGORIES,
  EXPENSE_CATEGORY_ICONS,
  normalizeExpenseCategories,
  getExpenseCategories,
  getExpenseCategory,
  getExpenseCategoryIcon,
  getExpenseCategoryLabel,
  extractExpenseTimePrefix,
  INCOME_EXPENSE_CATEGORY,
  isExpenseIncomeEntry,
  getDisplayExpenseCategory,
  clampNumber,
  pad2,
  isDataUrl,
  isHttpUrl,
  DEFAULT_PLACE_CATEGORIES,
  PLACE_CATEGORY_ICONS,
  normalizePlaceCategories,
  getPlaceCategories,
  getPlaceCategoryById,
  getPlaceCategoryIcon,
  getPlaceCategoryLabel,
  KOREA_BBOX,
  isDomesticLatLng,
  normalizePlaceAddressForSave,
  getDisplayPlaceAddress,
  normalizePlaces,
  getCalendarPlaces,
  unionPlaces,
  MEMO_DATE_RE,
  normalizeMemoDateMatch,
  extractLeadingMemoDate,
  parseVisitEntriesFromMemo,
  reformatMemoIntoDateLines,
  sortVisitEntriesRecentFirst,
  parsePlaceMemoEntries,
  serializePlaceMemoEntries,
  toMemoDateFormat,
  upsertPlaceMemoEntry,
  removePlaceMemoEntry,
  getPlaceMemoEntryForDate,
  KNOWN_PLACE_PARTICIPANT_NAME_TAGS,
  getKnownPlaceParticipantNames,
  isHouseholdNameToken,
  extractKnownParticipantNames,
  normalizePlaceDateForSort,
  formatPlaceBadgeDate,
  getPlaceSortDateKey,
  getNaverMapSearchRegionHint,
  getNaverMapPlaceUrl,
  getGoogleMapPlaceUrl,
  getPlaceExternalMapUrl,
  readConfigNumber,
  readConfigObject,
  ENABLE_FIRESTORE_SYNC,
  ENABLE_FIRESTORE_WRITES,
  ENABLE_PLACES_SUBCOLLECTION_MIGRATION,
  PUBLIC_CALENDAR_IDS,
  FIREBASE_LOAD_TIMEOUT_MS,
  FIREBASE_LOAD_MAX_ATTEMPTS,
  MEMOS_PAGE_SIZE,
  FIRESTORE_FREE_LIMITS,
  GITHUB_PAGES_FREE_LIMITS,
  MAX_CHAT_THUMB_BASE64_LENGTH,
  CHAT_LIVE_MESSAGE_LIMIT,
  ADMIN_MESSAGE_LIVE_LIMIT,
  ADMIN_MEMO_LIVE_LIMIT,
  GLOBAL_SEARCH_HISTORY_LIMIT,
  MAX_FIRESTORE_DATA_URL_CHARS,
  mergePlaceMemos,
  deduplicateCalendarPlaces,
  getMemoDateMatches,
  getTodayString,
  derivePlaceVisitStatus,
  countPlaceVisits,
  sanitizeMessageForFirestore,
  sanitizeMemoForFirestore,
  slimMessageForClient,
  CALENDAR_DOC_SAFE_BYTE_LIMIT,
  ADMIN_SESSION_STORAGE_KEY,
  ADMIN_SESSION_MAX_AGE_MS,
  sha256Hex,
  getAdminSession,
  setAdminSession,
  clearAdminSession,
  callAdminFunction,
  verifyAdminPasswordRemote,
  listAllCalendarsRemote,
  changeAdminPasswordRemote,
  copyTextToClipboard,
  isNotificationSupported,
  requestChatNotificationPermission,
  ensureChatNotificationPermission,
  getChatNotifyPrefKey,
  isChatNotifyEnabledForCalendar,
  setChatNotifyEnabledForCalendar,
  getChatParticipantPrefKey,
  getStoredChatParticipantId,
  setStoredChatParticipantId,
  describePushSubscribeFailure,
  getNotificationDiagnostics,
  classifyPushSubscribeError,
  getBrowserLabelForNotifications,
  getNotificationPermissionHelpSteps,
  isIOSDevice,
  isInstalledStandalonePwa,
  probeNotificationCapability,
  urlBase64ToUint8Array,
  arrayBufferToBase64,
  getSubscriptionHashId,
  subscribeUserToPush,
  ensurePushSubscriptionHealthy,
  subscribeUserToPushWithPermission,
  unsubscribeUserFromPush,
  notifyNewChatMessage,
  notifyMeetingReminder,
  getContrastTextColor,
  formatDateWithDayName,
  formatShortDateWithDayName,
  formatConfirmedMeetingLabel,
  formatDDayLabel,
  getConfirmedMeetings,
  unionConfirmedMeetings,
  getTrulyConfirmedMeetings,
  isDateConfirmedMeeting,
  calculateSettlementBalance,
  formatBalanceBadge,
  getPinnedNotices,
  formatChatHeaderTitle,
  isValidCalendarId,
  isInternalTestCalendarId,
  isAllowedCalendarId,
  sanitizeText,
  stripUrlEdgePunctuation,
  describeFirebaseWriteError,
  normalizeColorValue,
  isValidDateString,
  parseSharePathFromLocation,
  getCalendarIdFromURL,
  getRawCalendarIdFromURL,
  normalizeCalendarUrlParams,
  getAppBaseUrl,
  getCalendarShareUrl,
  getViewShareUrl,
  getMemoItemShareUrl,
  buildDynamicManifest,
  activeManifestBlobUrl,
  applyDynamicManifest,
  formatRegisteredAt,
  cloneParticipant,
  cloneAvailability,
  cloneActivityLog,
  clonePoll,
  getItemStamp,
  isTombstone,
  normalizeParticipantName,
  getActiveParticipants,
  getActiveAvailabilities,
  getCalendarActivityLogs,
  unionActivityLogs,
  getCalendarPolls,
  getActivePollOptions,
  normalizeDeletedActivityLogIds,
  getDeletedActivityLogIds,
  mergeDeletedActivityLogIds,
  getActivityLogStamp,
  SCHEDULE_ACTIVITY_ACTIONS,
  POLL_ACTIVITY_ACTIONS,
  EXPENSE_ACTIVITY_ACTIONS,
  IMAGE_TAG_ACTIVITY_ACTIONS,
  MEETING_ACTIVITY_ACTIONS,
  MEMO_ACTIVITY_ACTIONS,
  PLACE_ACTIVITY_ACTIONS,
  ACTIVITY_ACTIONS,
  normalizeActivityLog,
  mergeActivityLogs,
  buildFieldChangeNote,
  createActivityLog,
  createPollActivityLog,
  extractFirstUrlInfo,
  extractFirstUrl,
  extractAllUrlInfos,
  extractAllUrlInfosLoose,
  removeFirstUrl,
  autoGrowTextarea,
  getDirectChatMediaInfo,
  withTimeout,
  getMessageImageEntries,
  getDirectMediaTagKey,
  getDirectMediaTagsForUrl,
  getMessageDirectMediaEntry,
  formatBytes,
  getDataUrlInfo
};
