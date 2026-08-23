const DAY_NAMES_KO = ['일', '월', '화', '수', '목', '금', '토'];

  function getContrastTextColor(hexColor) {
    if (!hexColor) return '#FFFFFF';
    const hex = hexColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16) || 0;
    const g = parseInt(hex.substring(2, 4), 16) || 0;
    const b = parseInt(hex.substring(4, 6), 16) || 0;
    return (r * 299 + g * 587 + b * 114) / 1000 >= 128 ? '#0F172A' : '#FFFFFF';
  }

  function formatDateWithDayName(dateStr) {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const y = parts[0];
      const m = parts[1];
      const d = parts[2];
      const dateObj = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
      if (!isNaN(dateObj.getTime())) {
        const dayName = DAY_NAMES_KO[dateObj.getDay()];
        return `${y}.${m}.${d} (${dayName})`;
      }
    }
    return dateStr;
  }

  function formatShortDateWithDayName(dateStr) {
    const formatted = formatDateWithDayName(dateStr);
    return formatted.replace(/^(\d{2})(\d{2})\./, '$2.');
  }

  function formatConfirmedMeetingLabel(dateStr) {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-');
    const dateObj = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
    const dayName = DAY_NAMES_KO[dateObj.getDay()];
    return `[모임확정] ${y.slice(2)}.${m}.${d} (${dayName})`;
  }

  function formatDDayLabel(dateStr) {
    const [y, m, d] = dateStr.split('-').map(Number);
    const target = new Date(y, m - 1, d);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const diffDays = Math.round((target - today) / 86400000);
    return diffDays <= 0 ? 'D-DAY' : `D-${diffDays}`;
  }

  function formatRegisteredAt(timestamp) {
    const value = Number(timestamp || 0);
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    const year = String(date.getFullYear()).slice(2);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}.${month}.${day} (${DAY_NAMES_KO[date.getDay()]}) ${hours}:${minutes}:${seconds}`;
  }

  function formatCommentDate(timestamp) {
    const date = new Date(timestamp);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return {
      dateStr: `${month}.${day}(${DAY_NAMES_KO[date.getDay()]})`,
      timeStr: `${hours}:${minutes}:${seconds}`
    };
  }

  function formatChatTime(timestamp) {
    const date = new Date(timestamp);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  function formatChatDividerDate(timestamp) {
    const date = new Date(timestamp);
    const year = String(date.getFullYear()).slice(-2);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}.${month}.${day}(${DAY_NAMES_KO[date.getDay()]})`;
  }

  function formatBytes(bytes) {
    const value = Number(bytes);
    if (!isFinite(value) || value < 0) return null;
    if (value >= 1024 * 1024 * 1024) return `${(value / 1024 / 1024 / 1024).toFixed(2)} GB`;
    if (value >= 1024 * 1024) return `${(value / 1024 / 1024).toFixed(1)} MB`;
    if (value >= 1024) return `${(value / 1024).toFixed(1)} KB`;
    return `${value} B`;
  }

  function isValidCalendarId(id) {
    return typeof id === 'string' && /^[A-Za-z0-9_-]{1,64}$/.test(id);
  }

  function isInternalTestCalendarId(id) {
    return typeof id === 'string' && /^(stress_|test_)/.test(id);
  }

  function isAllowedCalendarId(id) {
    return isValidCalendarId(id);
  }

  function stripUrlEdgePunctuation(value = '') {
    return String(value || '').replace(/[\s"'“”‘’`)\].,!?]+$/g, '');
  }

  function extractFirstUrlInfo(value = '') {
    const source = String(value || '');
    const markdownMatch = source.match(/\[[^\]]*]\(((?:https?:\/\/|www\.)[^)\s]+|(?:[a-z0-9-]+\.)+[a-z]{2,}(?:\/[^)\s]*)?)\)/i);
    if (markdownMatch) {
      const raw = markdownMatch[0];
      const href = stripUrlEdgePunctuation(markdownMatch[1]);
      const url = /^https?:\/\//i.test(href) ? href : `https://${href}`;
      return { raw, url };
    }
    const match = source.match(/(?:https?:\/\/|www\.)[^\s)\]]+|(?:[a-z0-9-]+\.)+[a-z]{2,}(?:\/[^\s)\]]*)?/i);
    if (!match) return { raw: '', url: '' };
    const raw = stripUrlEdgePunctuation(match[0]);
    if (!raw || !/[a-z0-9]/i.test(raw)) return { raw: '', url: '' };
    const url = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
    return { raw, url };
  }

  function extractFirstUrl(value = '') {
    return extractFirstUrlInfo(value).url;
  }

  // Like extractFirstUrlInfo, but returns every distinct URL in the text instead of just the
  // first -- used to detect a message that's a plain list of pasted image links (one per line or
  // otherwise) rather than a single embedded link. Deliberately simpler than
  // extractFirstUrlInfo's regex (no markdown-link or bare-domain-without-scheme matching): a
  // multi-URL message is expected to have each link spelled out with an explicit http(s):// or
  // www. prefix, and loosening this further would risk false-matching ordinary sentence text
  // that merely contains a dot.
  function extractAllUrlInfos(value = '') {
    const source = String(value || '');
    const matches = source.match(/(?:https?:\/\/|www\.)[^\s)\]]+/gi) || [];
    const seen = new Set();
    const results = [];
    matches.forEach(m => {
      const raw = stripUrlEdgePunctuation(m);
      if (!raw || !/[a-z0-9]/i.test(raw)) return;
      const url = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
      if (seen.has(url)) return;
      seen.add(url);
      results.push({ raw, url });
    });
    return results;
  }

  // Like extractAllUrlInfos, but ALSO matches a bare domain with no http(s):// or www. prefix --
  // the same relaxed pattern extractFirstUrlInfo already uses for the single-link chat/memo
  // preview. Used by the gallery's 링크 tab, which aggregates links across many messages/memos
  // rather than deciding whether one specific message IS a multi-image-link message -- there the
  // false-positive risk that keeps extractAllUrlInfos strict doesn't apply the same way, while
  // being strict there meant a share-sheet link pasted without its scheme (common when copying a
  // shortened URL like naver.me/xxxx) rendered its own preview fine in chat/memo but never made
  // it into the gallery's aggregated list at all.
  function extractAllUrlInfosLoose(value = '') {
    const source = String(value || '');
    const matches = source.match(/(?:https?:\/\/|www\.)[^\s)\]]+|(?:[a-z0-9-]+\.)+[a-z]{2,}(?:\/[^\s)\]]*)?/gi) || [];
    const seen = new Set();
    const results = [];
    matches.forEach(m => {
      const raw = stripUrlEdgePunctuation(m);
      if (!raw || !/[a-z0-9]/i.test(raw)) return;
      const url = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
      if (seen.has(url)) return;
      seen.add(url);
      results.push({ raw, url });
    });
    return results;
  }

  function removeFirstUrl(value = '') {
    const source = String(value || '');
    const { raw } = extractFirstUrlInfo(source);
    return raw ? source.replace(raw, '').trim() : source.trim();
  }

  function sanitizeTextValue(value, maxLength = 120) {
    return String(value ?? '')
      // eslint-disable-next-line no-control-regex -- intentionally stripping ASCII control chars
      .replace(/[\u0000-\u001F\u007F]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, maxLength);
  }

  function normalizeColorValue(value, fallback = '#64748B') {
    const color = String(value || '').trim();
    return /^#[0-9A-Fa-f]{6}$/.test(color) ? color : fallback;
  }

  function isValidDateString(value) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value || ''))) return false;
    const [year, month, day] = String(value).split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
  }

  function getItemStamp(item) {
    if (!item) return 0;
    const values = [item.updatedAt, item.deletedAt, item.removedAt];
    return values.reduce((max, value) => {
      const ts = value ? new Date(value).getTime() : 0;
      return ts > max ? ts : max;
    }, 0);
  }

  function isTombstone(item) {
    return Boolean(item && (item.deletedAt || item.removedAt));
  }

  function getActivityLogStamp(log) {
    return Number(log?.timestamp || log?.updatedAt || 0) || 0;
  }

  function cloneParticipant(participant) {
    return participant ? { ...participant } : participant;
  }

  function cloneAvailability(availability) {
    return availability ? { ...availability } : availability;
  }

  function cloneActivityLog(log) {
    return log ? { ...log } : log;
  }

  function clonePoll(poll) {
    if (!poll) return poll;
    const clonedVotes = {};
    if (poll.votes && typeof poll.votes === 'object') {
      Object.entries(poll.votes).forEach(([key, value]) => {
        clonedVotes[key] = Array.isArray(value) ? [...value] : value;
      });
    }
    return {
      ...poll,
      options: Array.isArray(poll.options) ? poll.options.map(option => ({ ...option })) : [],
      votes: clonedVotes
    };
  }

  function getDefaultExpenseCategories() {
    return Array.isArray(window.GATHER_APP_CONSTANTS?.DEFAULT_EXPENSE_CATEGORIES)
      ? window.GATHER_APP_CONSTANTS.DEFAULT_EXPENSE_CATEGORIES
      : [
        { id: 'food', name: '식품', color: '#F97316' },
        { id: 'goods', name: '물품', color: '#3B82F6' },
        { id: 'transport', name: '교통', color: '#10B981' },
        { id: 'lodging', name: '숙박', color: '#8B5CF6' },
        { id: 'culture', name: '문화', color: '#EC4899' },
        { id: 'etc', name: '기타', color: '#64748B' }
      ];
  }

  function getExpenseCategoryIcons() {
    return window.GATHER_APP_CONSTANTS?.EXPENSE_CATEGORY_ICONS || {
      food: '🍜',
      goods: '🧸',
      transport: '🚎',
      lodging: '🏨',
      culture: '🎟️',
      etc: '💬'
    };
  }

  function normalizeExpenseCategories(categories) {
    const defaultCategories = getDefaultExpenseCategories();
    const source = Array.isArray(categories) && categories.length ? categories : defaultCategories;
    const seen = new Set();
    const normalized = source.map((category, index) => {
      const fallback = defaultCategories[index % defaultCategories.length];
      const rawId = sanitizeTextValue(category?.id || category?.name || fallback.id, 40).toLowerCase().replace(/[^a-z0-9가-힣_-]/g, '') || fallback.id;
      const id = seen.has(rawId) ? `${rawId}_${index}` : rawId;
      seen.add(id);
      return {
        id,
        name: sanitizeTextValue(category?.name || fallback.name, 24) || fallback.name,
        color: normalizeColorValue(category?.color, fallback.color)
      };
    }).filter(category => category.name);
    return normalized.length ? normalized : defaultCategories;
  }

  function getExpenseCategories(calendar) {
    return normalizeExpenseCategories(calendar?.expenseCategories);
  }

  function getExpenseCategory(calendar, categoryId) {
    const defaultCategories = getDefaultExpenseCategories();
    const categories = getExpenseCategories(calendar);
    return categories.find(category => category.id === categoryId) || categories.find(category => category.id === 'etc') || defaultCategories[defaultCategories.length - 1];
  }

  function getExpenseCategoryIcon(category) {
    const icons = getExpenseCategoryIcons();
    if (!category) return icons.etc;
    const name = String(category.name || '');
    const hasEmoji = /[\uD800-\uDBFF][\uDC00-\uDFFF]/.test(name) || /\p{Emoji_Presentation}/u.test(name);
    if (hasEmoji) return '';
    const id = String(category.id || '').toLowerCase();
    if (icons[id]) return icons[id];
    const matchedDefault = getDefaultExpenseCategories().find(item => item.name === name);
    return matchedDefault ? icons[matchedDefault.id] : icons.etc;
  }

  function getExpenseCategoryLabel(category) {
    const name = sanitizeTextValue(category?.name || '기타', 24) || '기타';
    const icon = getExpenseCategoryIcon(category);
    return icon ? `${icon}\u00A0\u00A0${name}` : name;
  }

  function extractExpenseTimePrefix(label) {
    const text = (label || '').trim();
    const match = /^(\d{1,2}시)\s+([\s\S]*)$/.exec(text);
    return match ? { time: match[1], rest: match[2].trim() } : { time: '', rest: text };
  }


  const INCOME_EXPENSE_CATEGORY = { id: 'income', name: '수입', color: '#16A34A' };

  function isExpenseIncomeEntry(expense) {
    return expense?.type === 'income' || Number(expense?.amount) < 0;
  }

  function getDisplayExpenseCategory(calendar, expense) {
    const resolved = isExpenseIncomeEntry(expense)
      ? INCOME_EXPENSE_CATEGORY
      : getExpenseCategory(calendar, expense?.categoryId);
    return resolved && resolved.name ? resolved : { id: 'etc', name: '기타', color: '#64748B' };
  }

  function clampNumber(value, min, max) {
    const n = Number(value);
    if (!Number.isFinite(n)) return min;
    return Math.min(max, Math.max(min, n));
  }

  function pad2(value) {
    return String(value).padStart(2, '0');
  }

  function isDataUrl(value) {
    return typeof value === 'string' && value.startsWith('data:');
  }

  function isHttpUrl(value) {
    return typeof value === 'string' && /^https?:\/\//i.test(value);
  }

  const DEFAULT_PLACE_CATEGORIES = [
    { id: 'restaurant', name: '식당', color: '#F97316' },
    { id: 'cafe', name: '카페', color: '#8B5CF6' },
    { id: 'play', name: '놀이', color: '#3B82F6' },
    { id: 'lodging', name: '숙박', color: '#10B981' },
    { id: 'shopping', name: '쇼핑', color: '#EC4899' },
    { id: 'etc', name: '기타', color: '#64748B' }
  ];
  const PLACE_CATEGORY_ICONS = { restaurant: '🍽️', cafe: '☕', play: '🎡', lodging: '🏨', shopping: '🛍️', etc: '💬' };

  function normalizePlaceCategories(categories) {
    const defaultCategories = DEFAULT_PLACE_CATEGORIES;
    const source = Array.isArray(categories) && categories.length ? categories : defaultCategories;
    const seen = new Set();
    const normalized = source.map((category, index) => {
      const fallback = defaultCategories[index % defaultCategories.length];
      const rawId = sanitizeTextValue(category?.id || category?.name || fallback.id, 40).toLowerCase().replace(/[^a-z0-9가-힣_-]/g, '') || fallback.id;
      const id = seen.has(rawId) ? `${rawId}_${index}` : rawId;
      seen.add(id);
      return {
        id,
        name: sanitizeTextValue(category?.name || fallback.name, 24) || fallback.name,
        color: normalizeColorValue(category?.color, fallback.color)
      };
    }).filter(category => category.name);
    return normalized.length ? normalized : defaultCategories;
  }

  function getPlaceCategories(calendar) {
    return normalizePlaceCategories(calendar?.placeCategories);
  }

  function getPlaceCategoryById(calendar, categoryId) {
    const categories = getPlaceCategories(calendar);
    const id = String(categoryId || '').trim();
    const found = id ? categories.find(c => c && c.id === id) : null;
    if (found) return found;
    return categories.find(c => c && c.id === 'etc') || { id: 'etc', name: '기타', color: '#64748B' };
  }

  function getPlaceCategoryIcon(category) {
    if (!category) return PLACE_CATEGORY_ICONS.etc;
    const name = String(category.name || '');
    let hasEmoji = false;
    try { hasEmoji = /\p{Extended_Pictographic}/u.test(name); } catch (e) {}
    if (hasEmoji) return '';
    const id = String(category.id || '').toLowerCase();
    if (PLACE_CATEGORY_ICONS[id]) return PLACE_CATEGORY_ICONS[id];
    const matchedDefault = DEFAULT_PLACE_CATEGORIES.find(item => item.name === name);
    return matchedDefault ? PLACE_CATEGORY_ICONS[matchedDefault.id] : PLACE_CATEGORY_ICONS.etc;
  }

  function getPlaceCategoryLabel(category) {
    const name = sanitizeTextValue(category?.name || '기타', 24) || '기타';
    const icon = getPlaceCategoryIcon(category);
    return icon ? icon + '\u00a0\u00a0' + name : name;
  }


  const KOREA_BBOX = { minLat: 33, maxLat: 39, minLng: 124, maxLng: 132 };

  function isDomesticLatLng(lat, lng) {
    const la = Number(lat), ln = Number(lng);
    return la >= KOREA_BBOX.minLat && la <= KOREA_BBOX.maxLat && ln >= KOREA_BBOX.minLng && ln <= KOREA_BBOX.maxLng;
  }

  function stripKoreaCountryPrefix(address) {
    return String(address || '')
      .replace(/^(대한민국|남한)\s*,?\s*/u, '')
      .replace(/^(South\s*Korea|Korea,?\s*Republic\s+of|Republic\s+of\s+Korea|ROK)\s*,?\s*/i, '')
      .trim();
  }

  function normalizeDomesticKoreanAddress(address) {
    let s = stripKoreaCountryPrefix(address);
    if (!s) return '';
    const regionPairs = [
      [/^서울특별시(?=\s|$)/, '서울'], [/^부산광역시(?=\s|$)/, '부산'], [/^대구광역시(?=\s|$)/, '대구'],
      [/^인천광역시(?=\s|$)/, '인천'], [/^광주광역시(?=\s|$)/, '광주'], [/^대전광역시(?=\s|$)/, '대전'],
      [/^울산광역시(?=\s|$)/, '울산'], [/^세종특별자치시(?=\s|$)/, '세종'], [/^제주특별자치도(?=\s|$)/, '제주'],
      [/^강원특별자치도(?=\s|$)/, '강원'], [/^전북특별자치도(?=\s|$)/, '전북'], [/^전라북도(?=\s|$)/, '전북'],
      [/^전라남도(?=\s|$)/, '전남'], [/^충청북도(?=\s|$)/, '충북'], [/^충청남도(?=\s|$)/, '충남'],
      [/^경상북도(?=\s|$)/, '경북'], [/^경상남도(?=\s|$)/, '경남'], [/^경기도(?=\s|$)/, '경기'], [/^강원도(?=\s|$)/, '강원']
    ];
    for (let i = 0; i < regionPairs.length; i++) s = s.replace(regionPairs[i][0], regionPairs[i][1]);
    s = s.replace(/\s+/g, ' ').trim();
    const roadCut = s.match(/^(.+?(?:로|길)\s*\d+(?:-\d+)?(?:번지)?)/);
    if (roadCut) return roadCut[1].trim();
    const lotCut = s.match(/^(.+?(?:동|리|가)\s*\d+(?:-\d+)?)/);
    if (lotCut) return lotCut[1].trim();
    return s;
  }

  function normalizePlaceAddressForSave(address, lat, lng) {
    const raw = sanitizeTextValue(address || '', 200);
    if (!raw) return '';
    const hasCoords = Number.isFinite(Number(lat)) && Number.isFinite(Number(lng));
    const domestic = hasCoords
      ? isDomesticLatLng(Number(lat), Number(lng))
      : /^(대한민국|남한|South\s*Korea|Korea,?\s*Republic\s+of|Republic\s+of\s+Korea|ROK)\b/i.test(raw)
        || /^(서울|부산|대구|인천|광주|대전|울산|세종|경기|강원|충북|충남|전북|전남|경북|경남|제주)/.test(raw);
    if (domestic) return sanitizeTextValue(normalizeDomesticKoreanAddress(raw), 200);
    return sanitizeTextValue(raw.replace(/\s+/g, ' ').trim(), 200);
  }

  function getDisplayPlaceAddress(place) {
    return normalizePlaceAddressForSave(place?.address || '', place?.lat, place?.lng);
  }

  function normalizePlaceDateForSort(dateStr) {
    if (!dateStr) return null;
    if (isValidDateString(dateStr)) return dateStr;
    const match = String(dateStr).match(/^(\d{2})\.(\d{2})\.(\d{2})$/);
    return match ? `20${match[1]}-${match[2]}-${match[3]}` : null;
  }

  function formatPlaceBadgeDate(dateStr) {
    const normalized = normalizePlaceDateForSort(dateStr);
    return normalized ? formatShortDateWithDayName(normalized) : null;
  }

  function getNaverMapSearchRegionHint(address) {
    const stripped = String(address || '')
      .replace(/^대한민국\s*/, '')
      .replace(/^(서울|부산|대구|인천|광주|대전|울산|세종|경기|강원|충북|충남|전북|전남|경북|경남|제주)(?:특별시|광역시|특별자치시|특별자치도|도)?\s*/, '');
    const firstToken = stripped.trim().split(/\s+/)[0] || '';
    return /^[가-힣]+(?:시|군|구)$/.test(firstToken) ? firstToken : '';
  }

  function getNaverMapPlaceUrl(place) {
    const name = String(place?.name || place?.alias || '장소').trim() || '장소';
    const lat = Number(place?.lat), lng = Number(place?.lng);
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      return `https://map.kakao.com/link/map/${encodeURIComponent(name)},${lat},${lng}`;
    }
    const address = String(place?.address || '').trim().replace(/^대한민국\s*/, '');
    const query = [name, address].filter(Boolean).join(' ') || name;
    return `https://map.kakao.com/link/search/${encodeURIComponent(query)}`;
  }

  function getGoogleMapPlaceUrl(place) {
    return `https://www.google.com/maps/search/?api=1&query=${place.lat},${place.lng}`;
  }

  function getPlaceExternalMapUrl(place) {
    return isDomesticLatLng(place?.lat, place?.lng) ? getNaverMapPlaceUrl(place) : getGoogleMapPlaceUrl(place);
  }


  const MEMO_DATE_RE = /(\d{4}|\d{2})[.-](\d{2})[.-](\d{2})/;

  function normalizeMemoDateMatch(match) {
    if (!match) return null;
    let [, y, m, d] = match;
    const mm = Number(m), dd = Number(d);
    if (mm < 1 || mm > 12 || dd < 1 || dd > 31) return null;
    if (y.length === 4) y = y.slice(2);
    return `${y}.${m}.${d}`;
  }

  function extractLeadingMemoDate(memo) {
    return normalizeMemoDateMatch(String(memo || '').match(MEMO_DATE_RE));
  }

  function parseVisitEntriesFromMemo(memo) {
    const text = String(memo || '').trim();
    if (!text) return [];
    const dateMatches = [...text.matchAll(new RegExp(MEMO_DATE_RE, 'g'))]
      .filter(match => normalizeMemoDateMatch(match));
    if (dateMatches.length < 2) return [];
    return dateMatches.map((match, idx) => {
      const segmentEnd = idx + 1 < dateMatches.length ? dateMatches[idx + 1].index : text.length;
      const note = text.slice(match.index + match[0].length, segmentEnd)
        .trim()
        .replace(/^\/\s*/, '')
        .replace(/\s*\/\s*$/, '');
      return { date: normalizeMemoDateMatch(match), note };
    });
  }

  function reformatMemoIntoDateLines(memo) {
    const entries = parseVisitEntriesFromMemo(memo);
    if (entries.length === 0) return String(memo || '');
    return entries.map(entry => (entry.note ? `${entry.date} ${entry.note}` : entry.date)).join('\n');
  }

  function sortVisitEntriesRecentFirst(entries) {
    return (entries || []).slice().sort((a, b) => {
      const dateA = normalizePlaceDateForSort(a.date) || '';
      const dateB = normalizePlaceDateForSort(b.date) || '';
      return dateB.localeCompare(dateA);
    });
  }

  // Structured per-date memo stack: unlike parseVisitEntriesFromMemo (which only parses when 2+
  // dates are present, since it exists purely to reformat run-on memo strings for display), this
  // always returns one entry per date so a place's very first memo entry is addressable too.
  function parsePlaceMemoEntries(memo) {
    const text = String(memo || '').trim();
    if (!text) return [];
    const dateMatches = [...text.matchAll(new RegExp(MEMO_DATE_RE, 'g'))]
      .filter(match => normalizeMemoDateMatch(match));
    if (dateMatches.length === 0) return [{ date: '', note: text }];
    const entries = dateMatches.map((match, idx) => {
      const segmentEnd = idx + 1 < dateMatches.length ? dateMatches[idx + 1].index : text.length;
      const note = text.slice(match.index + match[0].length, segmentEnd)
        .trim()
        .replace(/^\/\s*/, '')
        .replace(/\s*\/\s*$/, '');
      return { date: normalizeMemoDateMatch(match), note };
    });
    // A dated entry with an empty note is parsing noise, not a real visit -- typically a
    // duplicated/typo'd date token sitting right before the real "date note" pair in legacy
    // run-on memo text (e.g. "... 26.08.22 26.08.22 실제메모..."). Left in, it would silently win
    // every date lookup below (Array.find/findIndex return the first match), hiding the real note
    // for that date. New saves never produce one (upsertPlaceMemoEntry requires a non-empty note),
    // so this only ever strips pre-existing noise.
    const cleaned = entries.filter(e => !(e.date && !e.note));
    return cleaned.length > 0 ? cleaned : entries;
  }

  function serializePlaceMemoEntries(entries) {
    return (entries || [])
      .filter(entry => entry && (entry.date || entry.note))
      .map(entry => (entry.date ? (entry.note ? `${entry.date} ${entry.note}` : entry.date) : entry.note))
      .join('\n');
  }

  function toMemoDateFormat(dateStr) {
    const match = String(dateStr || '').match(/^(\d{4})-(\d{2})-(\d{2})$/);
    return match ? `${match[1].slice(2)}.${match[2]}.${match[3]}` : (extractLeadingMemoDate(dateStr) || String(dateStr || ''));
  }

  function upsertPlaceMemoEntry(existingMemo, dateStr, note) {
    const cleanNote = String(note || '').trim();
    if (!cleanNote) return String(existingMemo || '');
    const targetNorm = normalizePlaceDateForSort(dateStr);
    const memoDate = toMemoDateFormat(dateStr);
    const entries = parsePlaceMemoEntries(existingMemo);
    const idx = entries.findIndex(entry => normalizePlaceDateForSort(entry.date) === targetNorm);
    if (idx >= 0) {
      entries[idx] = { date: entries[idx].date || memoDate, note: cleanNote };
    } else if (entries.length === 1 && !entries[0].date) {
      // A legacy single freeform note (no date yet) is what getPlaceMemoEntryForDate falls back
      // to showing/prefilling for any date -- editing and saving it should replace that note in
      // place, not leave it behind as an orphaned dateless entry alongside a new dated one.
      entries[0] = { date: memoDate, note: cleanNote };
    } else {
      entries.push({ date: memoDate, note: cleanNote });
    }
    return serializePlaceMemoEntries(entries);
  }

  function removePlaceMemoEntry(existingMemo, dateStr) {
    const targetNorm = normalizePlaceDateForSort(dateStr);
    const entries = parsePlaceMemoEntries(existingMemo).filter(entry => normalizePlaceDateForSort(entry.date) !== targetNorm);
    return serializePlaceMemoEntries(entries);
  }

  function getPlaceMemoEntryForDate(memo, dateStr) {
    const targetNorm = normalizePlaceDateForSort(dateStr);
    const entries = parsePlaceMemoEntries(memo);
    const entry = entries.find(e => normalizePlaceDateForSort(e.date) === targetNorm);
    if (entry) return entry.note;
    // A place whose memo was never touched by the per-date system yet (a single freeform note
    // with no date at all) still needs to show up regardless of which date it's viewed from --
    // matches how a plain place.memo string always displayed before this per-date restructure.
    if (entries.length === 1 && !entries[0].date) return entries[0].note;
    return '';
  }


  function trimLatLngOutliers(points) {
    if (!Array.isArray(points) || points.length <= 5) return points || [];
    const lats = points.map(p => p[0]).slice().sort((a, b) => a - b);
    const lngs = points.map(p => p[1]).slice().sort((a, b) => a - b);
    const pct = (arr, p) => arr[Math.min(arr.length - 1, Math.max(0, Math.round(p * (arr.length - 1))))];
    const latLo = pct(lats, 0.1), latHi = pct(lats, 0.9);
    const lngLo = pct(lngs, 0.1), lngHi = pct(lngs, 0.9);
    const trimmed = points.filter(([lat, lng]) => lat >= latLo && lat <= latHi && lng >= lngLo && lng <= lngHi);
    return trimmed.length >= 3 ? trimmed : points;
  }


  function parseSharePathFromLocation(pathname) {
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
  }

  function getAppBaseUrl(locationLike) {
    const loc = locationLike || (typeof window !== 'undefined' ? window.location : null);
    if (!loc) return '/';
    let basePath = String(loc.pathname || '/').replace(/\/share(?:\/.*)?$/, '/').replace(/\/(?:index\.html)?$/, '/');
    if (!basePath.endsWith('/')) basePath += '/';
    return `${loc.origin || ''}${basePath}`;
  }

  function getCalendarShareUrl(calendarId, locationLike) {
    return `${getAppBaseUrl(locationLike)}share/${encodeURIComponent(calendarId)}/`;
  }

  function getViewShareUrl(calendarId, view, locationLike) {
    const base = getCalendarShareUrl(calendarId, locationLike);
    if (!view || view === 'calendar') return base;
    return `${base}${encodeURIComponent(view)}/`;
  }

  function getMemoItemShareUrl(calendarId, memoId, locationLike) {
    return `${getCalendarShareUrl(calendarId, locationLike)}memo/${encodeURIComponent(memoId)}/`;
  }


  function getActiveParticipants(calendar) {
    return Array.isArray(calendar && calendar.participants)
      ? calendar.participants.filter(function (p) { return !isTombstone(p); })
      : [];
  }
  function getActiveAvailabilities(calendar) {
    return Array.isArray(calendar && calendar.availabilities)
      ? calendar.availabilities.filter(function (a) { return !isTombstone(a); })
      : [];
  }
  function getCalendarPolls(calendar) {
    return Array.isArray(calendar && calendar.polls)
      ? calendar.polls.filter(function (poll) { return poll && !isTombstone(poll); })
      : [];
  }
  function getActivePollOptions(poll) {
    return Array.isArray(poll && poll.options)
      ? poll.options.filter(function (option) { return option && !isTombstone(option); })
      : [];
  }
  function isPollClosed(poll) {
    return !!(poll && poll.deadline && Date.now() >= Number(poll.deadline));
  }
  function formatPollDeadline(deadline) {
    if (!deadline) return '';
    var date = new Date(Number(deadline));
    if (Number.isNaN(date.getTime())) return '';
    var dayNames = ['일', '월', '화', '수', '목', '금', '토'];
    var m = date.getMonth() + 1;
    var d = date.getDate();
    var hh = String(date.getHours()).padStart(2, '0');
    var mm = String(date.getMinutes()).padStart(2, '0');
    return m + '/' + d + ' (' + dayNames[date.getDay()] + ') ' + hh + ':' + mm;
  }

  export const GATHER_APP_UTILS = Object.freeze({
    getContrastTextColor,
    formatDateWithDayName,
    formatShortDateWithDayName,
    formatConfirmedMeetingLabel,
    formatDDayLabel,
    formatRegisteredAt,
    formatCommentDate,
    formatChatTime,
    formatChatDividerDate,
    formatBytes,
    isValidCalendarId,
    isInternalTestCalendarId,
    isAllowedCalendarId,
    stripUrlEdgePunctuation,
    extractFirstUrlInfo,
    extractFirstUrl,
    extractAllUrlInfos,
    extractAllUrlInfosLoose,
    removeFirstUrl,
    sanitizeText: sanitizeTextValue,
    normalizeColorValue,
    isValidDateString,
    getItemStamp,
    isTombstone,
    getActivityLogStamp,
    cloneParticipant,
    cloneAvailability,
    cloneActivityLog,
    clonePoll,
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
    stripKoreaCountryPrefix,
    normalizeDomesticKoreanAddress,
    normalizePlaceAddressForSave,
    getDisplayPlaceAddress,
    normalizePlaceDateForSort,
    formatPlaceBadgeDate,
    getNaverMapSearchRegionHint,
    getNaverMapPlaceUrl,
    getGoogleMapPlaceUrl,
    getPlaceExternalMapUrl,
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
    trimLatLngOutliers,
    parseSharePathFromLocation,
    getAppBaseUrl,
    getCalendarShareUrl,
    getViewShareUrl,
    getActiveParticipants,
    getActiveAvailabilities,
    getCalendarPolls,
    getActivePollOptions,
    isPollClosed,
    formatPollDeadline,
    getMemoItemShareUrl
  });

if (typeof window !== 'undefined') {
  window.GATHER_APP_UTILS = GATHER_APP_UTILS;
}
