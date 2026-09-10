/* Photo/file auto-hashtags from upload date, EXIF, and reverse-geocoded place names.
 *
 * Date tags use the app convention YYMMDD (`#260910`) so a chat/gallery upload
 * auto-links to that day's meeting the same way a typed hashtag would.
 *
 * Location tags prefer a specific POI (`#오류남초등학교`, `#천왕역모아엘가`) plus
 * a compact admin region (`#경기도부천시`). Kakao coord2address is the Korea-first
 * source (building_name + 시도/시군구); Nominatim fills railway/school when Kakao
 * only has an admin region. Device tags never emit opaque product codes like
 * SM-F916N — only a Korean marketing name when mapped.
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
  [/SM-G973|SM-G975|SM-G970|SM-G977/i, '갤럭시S10'],
  [/SM-G980|SM-G981|SM-G985|SM-G986|SM-G988/i, '갤럭시S20'],
  [/SM-G990/i, '갤럭시S20FE'],
  [/SM-G991|SM-G996|SM-G998/i, '갤럭시S21'],
  [/SM-S901|SM-S906|SM-S908/i, '갤럭시S22'],
  [/SM-S911|SM-S916|SM-S918/i, '갤럭시S23'],
  [/SM-S711/i, '갤럭시S23FE'],
  [/SM-S921|SM-S926|SM-S928/i, '갤럭시S24'],
  [/SM-S721/i, '갤럭시S24FE'],
  [/SM-S931|SM-S936|SM-S938/i, '갤럭시S25'],
  [/SM-N971|SM-N976|SM-N970/i, '갤럭시노트10'],
  [/SM-N980|SM-N981|SM-N985|SM-N986/i, '갤럭시노트20'],
  [/SM-A336/i, '갤럭시A33'],
  [/SM-A346/i, '갤럭시A34'],
  [/SM-A356/i, '갤럭시A35'],
  [/SM-A366/i, '갤럭시A36'],
  [/SM-A525|SM-A528/i, '갤럭시A52'],
  [/SM-A536/i, '갤럭시A53'],
  [/SM-A546/i, '갤럭시A54'],
  [/SM-A556/i, '갤럭시A55'],
  [/SM-A566/i, '갤럭시A56'],
  [/SM-X710|SM-X716/i, '갤럭시탭S9'],
  [/SM-X810|SM-X816/i, '갤럭시탭S9플러스'],
  [/SM-X910|SM-X916/i, '갤럭시탭S9울트라']
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

const SIDO_SHORT_TO_TAG = Object.freeze({
  서울: '서울', 서울특별시: '서울',
  부산: '부산', 부산광역시: '부산',
  대구: '대구', 대구광역시: '대구',
  인천: '인천', 인천광역시: '인천',
  광주: '광주', 광주광역시: '광주',
  대전: '대전', 대전광역시: '대전',
  울산: '울산', 울산광역시: '울산',
  세종: '세종', 세종특별자치시: '세종',
  경기: '경기도', 경기도: '경기도',
  강원: '강원도', 강원도: '강원도', 강원특별자치도: '강원도',
  충북: '충북', 충청북도: '충북',
  충남: '충남', 충청남도: '충남',
  전북: '전북', 전라북도: '전북', 전북특별자치도: '전북',
  전남: '전남', 전라남도: '전남',
  경북: '경북', 경상북도: '경북',
  경남: '경남', 경상남도: '경남',
  제주: '제주', 제주특별자치도: '제주', 제주도: '제주'
});

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

export function normalizeKoreaSido(name) {
  const raw = String(name || '').replace(/\s+/g, '').trim();
  if (!raw) return '';
  return SIDO_SHORT_TO_TAG[raw] || raw;
}

export function normalizeKoreaSigungu(name) {
  const raw = String(name || '').replace(/\s+/g, ' ').trim();
  if (!raw) return '';
  const city = raw.match(/^(\S+?(?:시|군))/);
  if (city) return city[1];
  const district = raw.match(/^(\S+?구)/);
  if (district) return district[1];
  return raw.replace(/\s+/g, '');
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
    const named = raw.match(/(?:galaxy\s*|갤럭시\s*)(z\s*(?:fold|flip)\s*\d+|s\s*\d+\s*(?:fe|ultra|plus|\+)?|note\s*\d+|a\s*\d+|fold\s*\d*|flip\s*\d*|tab\s*s?\s*\d+)/i);
    if (named) {
      return `갤럭시${named[1]
        .replace(/\s+/g, '')
        .replace(/\+/g, '')
        .replace(/fold/i, '폴드')
        .replace(/flip/i, '플립')
        .replace(/note/i, '노트')
        .replace(/ultra/i, '울트라')
        .replace(/plus/i, '')
        .replace(/tab/i, '탭')
        .replace(/fe/i, 'FE')}`;
    }
    // Opaque SM- codes with no mapping must not become user-facing tags.
    return '';
  }

  if (lower.includes('pixel')) {
    const model = raw.match(/pixel\s*(\d+[a]?(?:\s*pro(?:\s*xl)?|\s*fold)?)/i);
    if (!model) return '픽셀';
    const pretty = model[1].replace(/\s+/g, '').replace(/pro/i, '프로').replace(/xl/i, 'XL').replace(/fold/i, '폴드');
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

function isSchoolLike(name) {
  return /학교|유치원|대학교|어린이집/.test(String(name || ''));
}

export function buildLocationHashtags(address = {}, displayName = '', extraName = '') {
  const tags = [];
  const a = address && typeof address === 'object' ? address : {};
  const country = String(a.country || '').trim();
  const isKorea = !country || country === '대한민국' || /south korea/i.test(country);

  const sido = normalizeKoreaSido(a.province || a.state || '');
  const sigungu = normalizeKoreaSigungu(a.city || a.county || a.municipality || '');
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
  const hasNamedVenue = poiCandidates.some(name => isSchoolLike(name) || /병원|공원/.test(name));
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

function finalizeLocation(address, displayName, extraName) {
  const locationTags = buildLocationHashtags(address, displayName, extraName);
  const location = locationTags
    .map(tag => tag.replace(/^#/, ''))
    .join(' ')
    .trim()
    .slice(0, 80);
  return {
    location,
    locationTags,
    poi: stripMarketingSuffix(extraName || displayName || address.school || address.building || ''),
    station: stripMarketingSuffix(address.railway || address.station || address.subway || ''),
    sido: normalizeKoreaSido(address.province || address.state || ''),
    sigungu: normalizeKoreaSigungu(address.city || address.county || address.municipality || '')
  };
}

export function parseNominatimLocation(payload) {
  if (!payload || typeof payload !== 'object') {
    return { location: '', locationTags: [], poi: '', station: '', sido: '', sigungu: '' };
  }
  const address = payload.address || {};
  const displayName = String(payload.name || payload.namedetails?.name || '').trim()
    || String(payload.display_name || '').split(',')[0].trim();
  return finalizeLocation(address, displayName, payload.name);
}

function parseKakaoAddressName(addressName) {
  const parts = String(addressName || '').trim().split(/\s+/).filter(Boolean);
  return {
    sido: normalizeKoreaSido(parts[0] || ''),
    sigungu: normalizeKoreaSigungu(parts.slice(1, 3).join(' ')),
    dong: parts.find(part => /[동읍면]$/.test(part)) || ''
  };
}

export function parseKakaoAddress(doc) {
  if (!doc || typeof doc !== 'object') {
    return { location: '', locationTags: [], poi: '', station: '', sido: '', sigungu: '' };
  }

  if (doc.place_name) {
    const parsed = parseKakaoAddressName(doc.address_name || doc.road_address_name || '');
    const poi = stripMarketingSuffix(doc.place_name);
    const category = String(doc.category_name || '');
    const address = {
      country: '대한민국',
      province: parsed.sido,
      city: parsed.sigungu,
      suburb: parsed.dong,
      building: poi
    };
    if (isSchoolLike(poi) || /학교|유치원/.test(category)) address.school = poi;
    if (/지하철|전철|기차/.test(category) || /역$/.test(poi)) address.railway = poi;
    return finalizeLocation(address, poi, poi);
  }

  const road = doc.road_address && typeof doc.road_address === 'object' ? doc.road_address : {};
  const land = doc.address && typeof doc.address === 'object' ? doc.address : {};
  const building = stripMarketingSuffix(road.building_name || land.building_name || '');
  const sido = normalizeKoreaSido(land.region_1depth_name || road.region_1depth_name || '');
  const sigungu = normalizeKoreaSigungu(land.region_2depth_name || road.region_2depth_name || '');
  const dong = String(land.region_3depth_name || land.region_3depth_h_name || '').trim();
  const address = {
    country: '대한민국',
    province: sido,
    city: sigungu,
    suburb: dong,
    building
  };
  if (isSchoolLike(building)) address.school = building;
  return finalizeLocation(address, building, building);
}

export function mergeLocationResults(primary = null, secondary = null) {
  const a = primary && typeof primary === 'object' ? primary : {};
  const b = secondary && typeof secondary === 'object' ? secondary : {};
  const poi = a.poi || b.poi || '';
  const station = a.station || b.station || '';
  const sido = a.sido || b.sido || '';
  const sigungu = a.sigungu || b.sigungu || '';
  if (poi || station || sido || sigungu) {
    const address = {
      country: sido || sigungu ? '대한민국' : '',
      province: sido,
      city: sigungu,
      railway: station,
      building: poi
    };
    if (isSchoolLike(poi)) address.school = poi;
    const built = finalizeLocation(address, poi, poi);
    if (built.locationTags.length) return built;
  }
  const tags = [];
  [...(a.locationTags || []), ...(b.locationTags || [])].forEach(tag => addTag(tags, tag));
  return {
    location: tags.map(tag => tag.replace(/^#/, '')).join(' ').slice(0, 80),
    locationTags: tags.slice(0, 3),
    poi,
    station,
    sido,
    sigungu
  };
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
  normalizeKoreaSido,
  normalizeKoreaSigungu,
  formatDeviceHashtag,
  buildLocationHashtags,
  parseNominatimLocation,
  parseKakaoAddress,
  mergeLocationResults,
  buildMetadataTags,
  todayUploadTagOptions,
  withUploadDateTag
};

if (typeof window !== 'undefined') {
  window.GATHER_PHOTO_METADATA_TAGS = Object.assign({}, window.GATHER_PHOTO_METADATA_TAGS || {}, api);
}

export default api;
