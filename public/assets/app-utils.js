(function () {
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

  function removeFirstUrl(value = '') {
    const source = String(value || '');
    const { raw } = extractFirstUrlInfo(source);
    return raw ? source.replace(raw, '').trim() : source.trim();
  }

  function sanitizeTextValue(value, maxLength = 120) {
    return String(value ?? '')
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

  function detectBrowserForShortcutInstructions(navigatorLike = typeof navigator !== 'undefined' ? navigator : {}) {
    const ua = navigatorLike.userAgent || '';
    const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigatorLike.platform === 'MacIntel' && navigatorLike.maxTouchPoints > 1);
    const isEdge = /Edg|EdgiOS|EdgA/.test(ua);
    const isChrome = /Chrome|CriOS|Chromium/.test(ua) && !isEdge;
    const isSafari = /Safari/.test(ua) && !/Chrome|CriOS|EdgiOS|FxiOS/.test(ua);
    const isFirefox = /Firefox|FxiOS/.test(ua);
    const isWhale = /Whale|NAVER/.test(ua);
    if (isIOS && isSafari) return 'ios-safari';
    if (isIOS) return 'ios-other';
    if (isSafari) return 'macos-safari';
    if (isFirefox) return 'firefox';
    if (isWhale) return 'whale';
    if (isEdge) return 'edge';
    if (isChrome) return 'chrome';
    return 'other';
  }

  function getShortcutInstructions(kind) {
    switch (kind) {
      case 'ios-safari':
        return '하단 공유 버튼( ⬆️ )을 누른 뒤 "홈 화면에 추가"를 선택해 주세요.';
      case 'macos-safari':
        return '공유 버튼을 누른 뒤 "Dock에 추가" 또는 "홈 화면에 추가"를 선택해 주세요.';
      case 'ios-other':
        return 'iPhone/iPad에서는 브라우저 메뉴 또는 공유 버튼에서 "홈 화면에 추가"를 선택해 주세요. 자동 생성은 iOS 정책상 제한됩니다.';
      case 'firefox':
        return '브라우저 메뉴(≡)를 열어 "홈 화면에 추가" 또는 "설치"를 선택해 주세요.';
      case 'whale':
        return '웨일 하단 메뉴(≡)에서 "홈 화면 추가" 또는 "앱 설치"를 선택해 주세요.';
      case 'chrome':
        return 'Chrome 메뉴(⋮)에서 "앱 설치" 또는 "홈 화면에 추가"를 선택해 주세요.';
      case 'edge':
        return 'Edge 메뉴(⋯)에서 "앱" 또는 "이 사이트를 앱으로 설치"를 선택해 주세요.';
      default:
        return '브라우저 메뉴에서 "홈 화면에 추가" 또는 "앱 설치"를 찾아 선택해 주세요.';
    }
  }

  function canUseNativeInstallPrompt(kind) {
    return kind === 'chrome' || kind === 'edge' || kind === 'other';
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
    try { hasEmoji = /\p{Extended_Pictographic}/u.test(name); } catch (e) { hasEmoji = false; }
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


  const MEMO_DATE_RE = /(\d{4}|\d{2})[.\-](\d{2})[.\-](\d{2})/;

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

  window.GATHER_APP_UTILS = Object.freeze({
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
    detectBrowserForShortcutInstructions,
    getShortcutInstructions,
    canUseNativeInstallPrompt,
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
    sortVisitEntriesRecentFirst
  });
})();
