/* Photo/file auto-hashtags from upload date, EXIF, and reverse-geocoded place names.
 *
 * Date tags use the app convention YYMMDD (`#260910`) so a chat/gallery upload
 * auto-links to that day's meeting the same way a typed hashtag would.
 *
 * Location tags prefer a specific POI (`#오류남초등학교`, `#천왕역모아엘가`) plus
 * a compact admin region (`#경기도부천시`). Device tags never emit opaque
 * product codes like SM-F916N — only a Korean marketing name when mapped.
 */

const HASHTAG_MAX_LEN = 24;
const TAG_JOIN_MAX = 8;

const SAMSUNG_MODEL_MAP = Object.freeze([
  [/SM-F900/i, '갤럭시폴드'],
  [/SM-F907/i, '갤럭시폴드'],
  [/SM-F916/i, '갤럭시Z폴드2'],
  [/SM-F926/i, '갤럭시Z폴드3'],
  [/SM-F936/i, '갤럭시Z폴드4'],
  [/SM-F946/i, '갤럭시Z폴드5'],
  [/SM-F956/i, '갤럭시Z폴드6'],
  [/SM-F966/i, '갤럭시Z폴드7'],
  [/SM-F700/i, '갤럭시Z플립'],
  [/SM-F707/i, '갤럭시Z플립5G'],
  [/SM-F711/i, '갤럭시Z플립3'],
  [/SM-F721/i, '갤럭시Z플립4'],
  [/SM-F731/i, '갤럭시Z플립5'],
  [/SM-F741/i, '갤럭시Z플립6'],
  [/SM-F761/i, '갤럭시Z플립7'],
  [/SM-F766/i, '갤럭시Z플립7'],
  [/SM-G980|SM-G981|SM-G985|SM-G986|SM-G988/i, '갤럭시S20'],
  [/SM-G990/i, '갤럭시S20FE'],
  [/SM-G991|SM-G996|SM-G998/i, '갤럭시S21'],
  [/SM-S901|SM-S906|SM-S908/i, '갤럭시S22'],
  [/SM-S911|SM-S916|SM-S918/i, '갤럭시S23'],
  [/SM-S711/i, '갤럭시S23FE'],
  [/SM-S921|SM-S926|SM-S928/i, '갤럭시S24'],
  [/SM-S721/i, '갤럭시S24FE'],
  [/SM-S931|SM-S936|SM-S938/i, '갤럭시S25'],
  [/SM-N980|SM-N981|SM-N985|SM-N986/i, '갤럭시노트20'],
  [/SM-A336/i, '갤럭시A33'],
  [/SM-A346/i, '갤럭시A34'],
  [/SM-A356/i, '갤럭시A35'],
  [/SM-A366/i, '갤럭시A36'],
  [/SM-A525|SM-A528/i, '갤럭시A52'],
  [/SM-A536/i, '갤럭시A53'],
  [/SM-A546/i, '갤럭시A54'],
  [/SM-A556/i, '갤럭시A55'],
  [/SM-A566/i, '갤럭시A56']
]);

const NOMINATIM_POI_KEYS = Object.freeze([
  'amenity', 'school', 'kindergarten', 'university', 'college',
  'building', 'residential', 'apartments', 'house',
  'railway', 'station', 'subway', 'public_transport',
  'tourism', 'leisure', 'shop', 'office', 'historic',
  'healthcare', 'hospital', 'clinic', 'place_of_worship',
  'neighbourhood', 'quarter'
]);

const GENERIC_POI_NAMES = new Set([
  'yes', 'building', 'residential', 'apartments', 'house', 'school',
  'station', 'railway', 'amenity', 'yes', 'no', 'unnamed'
]);

export function localDateStr(date = new Date(), timeZone = 'Asia/Seoul') {
  try {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(date);
  } catch (_) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
}

export function dateStrToCompactHashtag(dateStr) {
  const clean = String(dateStr || '').trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) return clean.replace(/-/g, '').slice(2);
  return '';
}

export function compactHashtagToken(value) {
  let t = String(value || '')
    .replace(/대한민국|South Korea|Korea,\s*Republic of/gi, '')
    .replace(/[₩$€]/g, '')
    .replace(/[\s_\-./(),[\]{}'"`~!@#$%^&*+=|\\:;<>?·•]+/g, '')
    .replace(/^#+/, '')
    .trim();
  t = t.replace(/^(the)/i, '');
  if (!t) return '';
  return t.slice(0, HASHTAG_MAX_LEN);
}

function addTag(tags, value) {
  const token = compactHashtagToken(value);
  if (!token || token.length < 2) return;
  const hashed = `#${token}`;
  if (!tags.includes(hashed)) tags.push(hashed);
}

export function formatDeviceHashtag(deviceRaw) {
  const raw = String(deviceRaw || '').replace(/\s+/g, ' ').trim();
  if (!raw) return '';
  const lower = raw.toLowerCase();

  if (lower.includes('iphone') || lower.includes('아이폰')) {
    const model = raw.match(/iphone\s*(se\s*\d*|[0-9]+(?:\s*pro(?:\s*max)?|\s*plus|\s*mini|\s*air)?)/i);
    if (!model) return '아이폰';
    const pretty = model[1]
      .replace(/\s+/g, '')
      .replace(/pro/i, '프로')
      .replace(/max/i, '맥스')
      .replace(/plus/i, '플러스')
      .replace(/mini/i, '미니')
      .replace(/air/i, '에어')
      .replace(/se/i, 'SE');
    return `아이폰${pretty}`;
  }

  if (lower.includes('galaxy') || lower.includes('갤럭시') || /^sm[- ]/i.test(raw) || /\bsamsung\b/i.test(raw)) {
    const mapped = SAMSUNG_MODEL_MAP.find(([pattern]) => pattern.test(raw));
    if (mapped) return mapped[1];
    const named = raw.match(/(?:galaxy\s*|갤럭시\s*)(z\s*(?:fold|flip)\s*\d+|s\s*\d+\s*(?:fe|ultra|plus|\+)?|note\s*\d+|a\s*\d+|fold\s*\d*|flip\s*\d*)/i);
    if (named) {
      return `갤럭시${named[1]
        .replace(/\s+/g, '')
        .replace(/\+/g, '')
        .replace(/fold/i, '폴드')
        .replace(/flip/i, '플립')
        .replace(/note/i, '노트')
        .replace(/ultra/i, '울트라')
        .replace(/plus/i, '')
        .replace(/fe/i, 'FE')}`;
    }
    // Opaque SM- codes with no mapping must not become user-facing tags.
    return '';
  }

  if (lower.includes('pixel')) {
    const model = raw.match(/pixel\s*(\d+[a]?(?:\s*pro(?:\s*xl)?)?)/i);
    if (!model) return '픽셀';
    const pretty = model[1].replace(/\s+/g, '').replace(/pro/i, '프로').replace(/xl/i, 'XL');
    return `픽셀${pretty}`;
  }

  return '';
}

function stripMarketingSuffix(name) {
  return String(name || '')
    .replace(/\s*(더\s*스카이|THE\s*SKY|the\s*sky)\s*/gi, ' ')
    .replace(/\s*(아파트|단지|오피스텔|주상복합)\s*$/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function isGenericPoiName(name) {
  const compact = compactHashtagToken(name).toLowerCase();
  return !compact || GENERIC_POI_NAMES.has(compact) || /^\d+$/.test(compact);
}

export function buildLocationHashtags(address = {}, displayName = '', extraName = '') {
  const tags = [];
  const a = address && typeof address === 'object' ? address : {};
  const country = String(a.country || '').trim();
  const isKorea = !country || country === '대한민국' || /south korea/i.test(country);

  const sido = String(a.province || a.state || '').trim();
  const sigungu = String(a.city || a.county || a.municipality || '').trim();
  const district = String(a.city_district || a.borough || a.district || '').trim();
  const dong = String(a.suburb || a.quarter || a.neighbourhood || a.town || '').trim();

  const poiCandidates = [];
  const topName = stripMarketingSuffix(extraName || displayName || a.name || '');
  if (topName && !isGenericPoiName(topName) && topName.length <= 40) poiCandidates.push(topName);
  NOMINATIM_POI_KEYS.forEach(key => {
    const value = stripMarketingSuffix(a[key] || '');
    if (value && !isGenericPoiName(value)) poiCandidates.push(value);
  });

  const station = stripMarketingSuffix(a.railway || a.station || a.subway || '');
  const building = stripMarketingSuffix(a.building || a.residential || a.apartments || extraName || '');
  const hasNamedVenue = poiCandidates.some(name => /학교|유치원|대학교|병원|공원/.test(name));
  if (!hasNamedVenue && station && /역$/.test(station) && building && !building.includes(station) && !station.includes(building)) {
    poiCandidates.unshift(`${station}${building.replace(/아파트|단지/g, '')}`);
  }

  const uniquePoi = [];
  poiCandidates.forEach(name => {
    const compact = compactHashtagToken(name);
    if (!compact || uniquePoi.some(existing => compactHashtagToken(existing) === compact)) return;
    if (sido && compact === compactHashtagToken(sido)) return;
    if (sigungu && compact === compactHashtagToken(sigungu)) return;
    uniquePoi.push(name);
  });

  if (uniquePoi[0]) addTag(tags, uniquePoi[0]);

  if (isKorea && (sido || sigungu)) {
    const admin = compactHashtagToken(`${sido}${sigungu === sido ? '' : sigungu}`);
    if (admin && admin.length >= 3) addTag(tags, admin);
  } else if (!isKorea) {
    const foreign = [country, sido || sigungu].filter(Boolean).join('');
    if (foreign) addTag(tags, foreign);
  }

  if (tags.length < 2 && dong && !/동$|구$/.test(compactHashtagToken(uniquePoi[0] || ''))) {
    const dongTag = compactHashtagToken(dong);
    if (dongTag && dongTag.length >= 2) addTag(tags, dong);
  } else if (tags.length < 2 && district) {
    addTag(tags, district);
  }

  return tags.slice(0, 3);
}

export function parseNominatimLocation(payload) {
  if (!payload || typeof payload !== 'object') return { location: '', locationTags: [] };
  const address = payload.address || {};
  const displayName = String(payload.name || payload.namedetails?.name || '').trim()
    || String(payload.display_name || '').split(',')[0].trim();
  const locationTags = buildLocationHashtags(address, displayName, payload.name);
  const location = locationTags
    .map(tag => tag.replace(/^#/, ''))
    .join(' ')
    .trim()
    .slice(0, 80);
  return { location, locationTags };
}

export function buildMetadataTags(metadata, scheduledDateOrOptions = '') {
  const options = typeof scheduledDateOrOptions === 'string'
    ? { scheduledDate: scheduledDateOrOptions }
    : (scheduledDateOrOptions && typeof scheduledDateOrOptions === 'object' ? scheduledDateOrOptions : {});
  const tags = [];
  const scheduledDate = options.scheduledDate || '';
  const uploadDate = options.uploadDate || '';

  if (scheduledDate && /^\d{4}-\d{2}-\d{2}$/.test(scheduledDate)) {
    addTag(tags, dateStrToCompactHashtag(scheduledDate));
  }
  if (uploadDate && /^\d{4}-\d{2}-\d{2}$/.test(uploadDate)) {
    addTag(tags, dateStrToCompactHashtag(uploadDate));
  }
  const captured = String(metadata?.capturedAt || '').slice(0, 10);
  if (/^\d{4}-\d{2}-\d{2}$/.test(captured)) {
    addTag(tags, dateStrToCompactHashtag(captured));
  }

  const locationTags = Array.isArray(metadata?.locationTags) ? metadata.locationTags : [];
  locationTags.forEach(tag => addTag(tags, tag));
  if (!locationTags.length && metadata?.location) {
    String(metadata.location).split(/\s+/).forEach(part => addTag(tags, part));
  }

  if (metadata?.device) {
    const deviceTag = formatDeviceHashtag(metadata.device);
    if (deviceTag) addTag(tags, deviceTag);
  }

  return tags.slice(0, TAG_JOIN_MAX).join(' ');
}

export function todayUploadTagOptions(now = new Date()) {
  return { uploadDate: localDateStr(now) };
}

export function withUploadDateTag(existingTags, now = new Date()) {
  const today = `#${dateStrToCompactHashtag(localDateStr(now))}`;
  const current = String(existingTags || '').trim();
  if (!today || today === '#') return current;
  const parts = current ? current.split(/\s+/).filter(Boolean) : [];
  if (parts.includes(today)) return current;
  return [today, ...parts].join(' ');
}

const api = {
  localDateStr,
  dateStrToCompactHashtag,
  compactHashtagToken,
  formatDeviceHashtag,
  buildLocationHashtags,
  parseNominatimLocation,
  buildMetadataTags,
  todayUploadTagOptions,
  withUploadDateTag
};

if (typeof window !== 'undefined') {
  window.GATHER_PHOTO_METADATA_TAGS = Object.assign({}, window.GATHER_PHOTO_METADATA_TAGS || {}, api);
}

export default api;
