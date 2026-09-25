// Pure helpers for scripts/sync-culture-performances.mjs, split out so they can be unit tested
// (test/culture-normalize.test.mjs) without the sync script's network fetch running on import.
//
// Everything here is deterministic and side-effect free: parse Culture Flow's raw date strings,
// clean up text the upstream scrapers pass through verbatim (HTML entities, <br> tags,
// full-width brackets), backfill the region code the calendar's region filter matches on, merge
// the same show listed by several ticket/portal sources, and slim each item down to the fields
// that actually carry a value.

// TimeTicket (and similar) university-ro / open-ended shows often ship date="OPEN RUN"
// with no YYYY.MM.DD tokens. Treat those as currently-visible open-ended listings rather
// than dropping them in isVisible (which previously required a parseable end/start).
export function isOpenRunDate(raw) {
  return /OPEN\s*RUN|상시\s*공연|상설\s*공연|연중무휴|기간\s*미정/i.test(String(raw || '').trim());
}

export function parseDateRange(raw) {
  // Culture Flow date strings look like "2026.08.28 (금) ~ 2027.02.09 (화)" or a single
  // "2026.08.28 (금)" -- pull out plain YYYY.MM.DD tokens and ignore the day-name parens.
  const matches = String(raw || '').match(/\d{4}\.\d{2}\.\d{2}/g) || [];
  const toIso = s => s.replaceAll('.', '-');
  let startDate = matches[0] ? toIso(matches[0]) : null;
  let endDate = matches[1] ? toIso(matches[1]) : startDate;
  // A reversed range is an upstream typo, not a show that ends before it starts -- keep both
  // days rather than letting isVisible/sorting read a nonsensical window.
  if (startDate && endDate && endDate < startDate) [startDate, endDate] = [endDate, startDate];
  return { startDate, endDate };
}

export function addDaysIso(iso, days) {
  const d = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return iso;
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

// Days an item stays in the snapshot after it ends. The calendar UI hides past items from lists
// immediately; this window only keeps the JSON available for anniversary badge deep-links and
// cultureSnapshot orphans (see filterAndSortCultureItems in src/ui/ui-summary-gallery.js).
export const POST_END_GRACE_DAYS = 30;

export function isVisible(endDate, startDate, todayIso, { openEnded = false } = {}) {
  // Open-ended / OPEN RUN listings have no parseable end date by design -- keep them while
  // upstream still publishes them (Culture Flow collect is the lifecycle owner for those).
  if (openEnded) return true;
  const effectiveEnd = endDate || startDate;
  if (!effectiveEnd) return false;
  return addDaysIso(effectiveEnd, POST_END_GRACE_DAYS) >= todayIso;
}

// Culture Flow's own site is served at basePath '/culture' (Next export on GitHub Pages), and most
// of its poster images are root-relative paths meant to resolve against ITS domain. Fetched as-is
// from our own domain a relative path 404s silently, so resolve against Culture Flow's origin.
export const CULTURE_FLOW_ORIGIN = 'https://pyw31337.github.io/culture';
export function resolveImageUrl(raw) {
  const value = String(raw || '').trim();
  if (!value) return '';
  if (/^https?:\/\//i.test(value)) return value;
  if (value.startsWith('//')) return `https:${value}`;
  return `${CULTURE_FLOW_ORIGIN}${value.startsWith('/') ? '' : '/'}${value}`;
}

const NAMED_ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', middot: '·', hellip: '…' };
// Upstream scrapers pass HTML through verbatim, sometimes double-encoded
// ("&&#35;39;깨달음&&#35;39;" is "&#39;" whose "#" was itself encoded as "&#35;"). Decode until
// the string stops changing (bounded) so a title reads '깨달음' instead of entity soup.
export function decodeHtmlEntities(value) {
  let text = String(value ?? '');
  for (let pass = 0; pass < 3; pass++) {
    const next = text
      .replace(/&&#35;/g, '&#')
      .replace(/&#(\d+);/g, (m, code) => {
        const n = Number(code);
        return n > 0 && n < 0x110000 ? String.fromCodePoint(n) : m;
      })
      .replace(/&#x([0-9a-f]+);/gi, (m, code) => {
        const n = parseInt(code, 16);
        return n > 0 && n < 0x110000 ? String.fromCodePoint(n) : m;
      })
      .replace(/&([a-z]+);/gi, (m, name) => NAMED_ENTITIES[name.toLowerCase()] ?? m);
    if (next === text) break;
    text = next;
  }
  return text;
}

// Titles/venues: decode, fold full-width brackets/spaces to ASCII ("［제주］" -> "[제주]"), and
// collapse runs of whitespace.
export function cleanInlineText(value) {
  return decodeHtmlEntities(value)
    .replace(/[［]/g, '[')
    .replace(/[］]/g, ']')
    .replace(/[（]/g, '(')
    .replace(/[）]/g, ')')
    .replace(/[\s\u3000\u00A0]+/g, ' ')
    .trim();
}

// Descriptions: decode, turn <br>/<p> into line breaks, drop every other tag and stray \r, and
// cap blank-line runs -- the card renders this as plain text, so markup would show literally.
export function cleanMultilineText(value, maxLength = 600) {
  const text = decodeHtmlEntities(value)
    .replace(/<\s*br\s*\/?>/gi, '\n')
    .replace(/<\/\s*p\s*>/gi, '\n')
    .replace(/<[a-z/!][^>]*>/gi, '')
    .replace(/\r/g, '')
    .replace(/[ \t\u00A0]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  return maxLength > 0 ? text.slice(0, maxLength).trim() : text;
}

// ---------------------------------------------------------------------------------------------
// Region backfill. The content page's region filter matches item.region against the KOREA_REGIONS
// codes in src/ui/ui-summary-gallery.js; items upstream leaves as 'etc'/'unknown'/'' are invisible
// under any region selection. Resolve what we can from the address (or a "[부산 서구]"-style venue
// tag) and leave the rest as upstream sent it.
export const REGION_CODES = new Set([
  'seoul', 'busan', 'daegu', 'incheon', 'gwangju', 'daejeon', 'ulsan', 'sejong', 'gyeonggi',
  'gangwon', 'chungbuk', 'chungnam', 'jeonbuk', 'jeonnam', 'gyeongbuk', 'gyeongnam', 'jeju'
]);
const SIDO_PREFIXES = [
  [/^서울(특별시|시)?$/, 'seoul'],
  [/^부산(광역시|시)?$/, 'busan'],
  [/^대구(광역시|시)?$/, 'daegu'],
  [/^인천(광역시|시)?$/, 'incheon'],
  [/^광주(광역시)?$/, 'gwangju'],
  [/^대전(광역시|시)?$/, 'daejeon'],
  [/^울산(광역시|시)?$/, 'ulsan'],
  [/^세종(특별자치시|시)?$/, 'sejong'],
  [/^경기(도)?$/, 'gyeonggi'],
  [/^강원(특별자치도|도)?$/, 'gangwon'],
  [/^충청북도$|^충북$/, 'chungbuk'],
  [/^충청남도$|^충남$/, 'chungnam'],
  [/^전라북도$|^전북(특별자치도)?$/, 'jeonbuk'],
  [/^전라남도$|^전남$/, 'jeonnam'],
  [/^경상북도$|^경북$/, 'gyeongbuk'],
  [/^경상남도$|^경남$/, 'gyeongnam'],
  [/^제주(특별자치도|도)?$/, 'jeju']
];
// 2026 전남·광주 통합: addresses now read "전남광주통합특별시 <시/군/구> ...". The former 광주광역시
// districts map back to the calendar's 광주 region, everything else to 전남.
const GWANGJU_DISTRICTS = new Set(['동구', '서구', '남구', '북구', '광산구']);

function regionFromTokens(first, second) {
  const head = String(first || '').trim();
  if (!head) return '';
  if (/^전남광주/.test(head)) return GWANGJU_DISTRICTS.has(String(second || '').trim()) ? 'gwangju' : 'jeonnam';
  for (const [re, code] of SIDO_PREFIXES) if (re.test(head)) return code;
  return '';
}

export function inferRegion({ region, address, venue } = {}) {
  const current = String(region || '').trim();
  if (REGION_CODES.has(current)) return current;
  const addr = String(address || '').trim().replace(/^etc\s+/i, '');
  const [a1, a2] = addr.split(/\s+/);
  const fromAddress = regionFromTokens(a1, a2);
  if (fromAddress) return fromAddress;
  const tag = String(venue || '').match(/\[([^\]]+)\]/);
  if (tag) {
    const [t1, t2] = tag[1].trim().split(/\s+/);
    const fromTag = regionFromTokens(t1, t2);
    if (fromTag) return fromTag;
  }
  return current;
}

// Upstream fills address with "etc <venue>" when it has no real address -- that isn't an
// address, and the region filter reads the district off address token #2, so drop it.
export function cleanAddress(address) {
  const value = cleanInlineText(address);
  return /^etc(\s|$)/i.test(value) || /^(정보\s*없음|미정|-)$/.test(value) ? '' : value;
}

// ---------------------------------------------------------------------------------------------
// Duplicate matching across ticket/portal sources (and within one source: KOPIS and Interpark
// both occasionally list one run twice under slightly different titles).

// Leading genre words ticket portals prepend ("뮤지컬 〈해몽가〉" vs KOPIS "해몽가").
// Also a leading edition/year ("2026 세계음악극축제" vs "세계 음악극 축제", "제8회 ...") -- safe to
// ignore because a match still needs the same venue AND overlapping dates.
const LEADING_GENRE_WORDS = /^(?:(?:19|20)\d{2}\s*년?|제\s*\d+\s*회|어린이\s*뮤지컬|가족\s*뮤지컬|뮤지컬|연극|콘서트|클래식|오페라|무용|발레|국악|전시|공연|창극|마당놀이|내한\s*공연|단독\s*판매|앵콜|앙코르)\s*/;
const MATCH_PUNCTUATION = /[\s\u3000·•,.:;\-_/!?'"“”‘’~@#&*+=|\\^`$%]/g;

function titleCore(text) {
  let value = String(text || '').trim();
  for (let i = 0; i < 3; i++) {
    const next = value.replace(LEADING_GENRE_WORDS, '');
    if (next === value) break;
    value = next;
  }
  return value.replace(MATCH_PUNCTUATION, '').toLowerCase();
}

// "[뮤지컬] 써니텐" and "써니텐" compare equal; so do "뮤지컬 〈해몽가〉" and "해몽가". Title
// brackets 〈〉《》「」『』<> usually wrap the real title, so only the marks are removed; [] () 【】
// usually wrap tags/regions/casts, so their content is removed -- unless that leaves nothing,
// in which case the bracket content WAS the title ("[해몽가]").
export function normalizeTitleForMatch(title) {
  const base = cleanInlineText(title).replace(/[〈〉《》「」『』<>]/g, ' ');
  const withoutTags = base.replace(/[[(【][^\])】]*[\])】]/g, ' ');
  const core = titleCore(withoutTags);
  if (core.length >= 2) return core;
  return titleCore(base.replace(/[[\]()【】]/g, ' '));
}

// KOPIS venue names repeat themselves in parens ("세티 라이브홀 (SETI LIVE HALL) (...)") and carry
// former names ("...예술의전당 구. 광주예술의전당") -- keep only the leading comparable name.
export function normalizeVenueForMatch(venue) {
  return cleanInlineText(venue)
    .split(/[([]/)[0]
    .replace(/\s구\.\s*\S+.*$/, '')
    .replace(MATCH_PUNCTUATION, '')
    .toLowerCase();
}

// Exact normalized match, or one containing the other ("킨텍스" vs "일산킨텍스제2전시장") when the
// shorter side is still a real name (3+ chars) rather than a generic "홀".
export function venuesMatch(a, b) {
  const va = normalizeVenueForMatch(a);
  const vb = normalizeVenueForMatch(b);
  if (!va || !vb) return false;
  if (va === vb) return true;
  const [short, long] = va.length <= vb.length ? [va, vb] : [vb, va];
  return short.length >= 3 && long.includes(short);
}

export function dateRangesOverlap(aStart, aEnd, bStart, bEnd) {
  if (!aStart || !bStart) return false;
  const aE = aEnd || aStart, bE = bEnd || bStart;
  return aStart <= bE && bStart <= aE;
}

// Prefer whichever value is actually present; when both are, prefer the longer/richer one.
export function pickRicher(a, b) {
  const av = (a ?? '').toString().trim();
  const bv = (b ?? '').toString().trim();
  if (!av) return b;
  if (!bv) return a;
  return bv.length > av.length ? b : a;
}

function isRealPoster(url) {
  return !!url && !/\/fallbacks\//i.test(String(url));
}

function mergePair(base, other) {
  const image = isRealPoster(base.image) ? base.image : (isRealPoster(other.image) ? other.image : pickRicher(base.image, other.image));
  const startDate = [base.startDate, other.startDate].filter(Boolean).sort()[0] || null;
  const endDate = [base.endDate, other.endDate].filter(Boolean).sort().pop() || null;
  const sources = [...new Set(`${base.source || ''}+${other.source || ''}`.split('+').filter(Boolean))];
  return {
    ...base,
    // Union of both listings' dates, so neither source's run is cut short by the merge.
    startDate,
    endDate,
    dateLabel: startDate && endDate && (startDate !== base.startDate || endDate !== base.endDate)
      ? `${startDate.replaceAll('-', '.')} ~ ${endDate.replaceAll('-', '.')}`
      : base.dateLabel,
    venue: pickRicher(base.venue, other.venue),
    address: pickRicher(base.address, other.address),
    region: REGION_CODES.has(base.region) ? base.region : (REGION_CODES.has(other.region) ? other.region : pickRicher(base.region, other.region)),
    lat: base.lat ?? other.lat,
    lng: base.lng ?? other.lng,
    image,
    price: pickRicher(base.price, other.price),
    contact: pickRicher(base.contact, other.contact),
    organizer: pickRicher(base.organizer, other.organizer),
    website: pickRicher(base.website, other.website),
    description: pickRicher(base.description, other.description),
    cast: (base.cast && base.cast.length) ? base.cast : other.cast,
    runningTime: pickRicher(base.runningTime, other.runningTime),
    ageRating: pickRicher(base.ageRating, other.ageRating),
    source: sources.join('+')
  };
}

// Groups by normalized title (no month bucket -- a KOPIS run starting 08-28 and the Interpark
// listing of the same run starting 09-01 used to land in different buckets and never merge),
// then within a group merges any pair whose venue matches AND whose date ranges overlap. Title
// match alone is never enough: two different productions can share a generic title, so a venue
// or date mismatch stays as two separate items. The first-seen item keeps its id so existing
// cultureSourceId links in calendars keep resolving.
export function mergeDuplicates(items) {
  const groups = new Map();
  const order = [];
  for (const it of items) {
    const key = normalizeTitleForMatch(it.title) || `__id:${it.id}`;
    if (!groups.has(key)) { groups.set(key, []); order.push(key); }
    groups.get(key).push(it);
  }
  const merged = [];
  let mergedCount = 0;
  for (const key of order) {
    const group = groups.get(key);
    if (group.length === 1) { merged.push(group[0]); continue; }
    const used = new Array(group.length).fill(false);
    for (let i = 0; i < group.length; i++) {
      if (used[i]) continue;
      let base = group[i];
      used[i] = true;
      // Re-scan after each merge: the widened date range can now overlap a listing it missed.
      let changed = true;
      while (changed) {
        changed = false;
        for (let j = i + 1; j < group.length; j++) {
          if (used[j]) continue;
          const other = group[j];
          if (!venuesMatch(base.venue, other.venue)) continue;
          if (!dateRangesOverlap(base.startDate, base.endDate, other.startDate, other.endDate)) continue;
          used[j] = true;
          mergedCount++;
          changed = true;
          base = mergePair(base, other);
        }
      }
      merged.push(base);
    }
  }
  return { items: merged, mergedCount };
}

// Drops keys whose value carries nothing ('' / null / undefined / []) so ~20 always-empty
// sports/movie fields stop costing every performance item bytes. Booleans and numbers are kept
// as-is -- readers treat `isOpenEnded !== false` as open-ended, so a false must stay explicit.
export function compactItem(item) {
  const out = {};
  for (const [key, value] of Object.entries(item)) {
    if (value === '' || value === null || value === undefined) continue;
    if (Array.isArray(value) && value.length === 0) continue;
    out[key] = value;
  }
  return out;
}

export function normalizeItem(raw) {
  const openRun = isOpenRunDate(raw.date);
  const { startDate, endDate } = parseDateRange(raw.date);
  const movie = raw.genre === 'movie';
  const openEnded = movie || openRun;
  const normalizedStartDate = openRun ? null : startDate;
  const normalizedEndDate = openEnded ? null : endDate;
  const venue = cleanInlineText(raw.venue || raw.venueKey || '');
  const address = cleanAddress(raw.address);
  const cast = Array.isArray(raw.cast)
    ? raw.cast.map(name => cleanInlineText(name)).filter(Boolean).slice(0, 12)
    : [];
  return {
    startDate: normalizedStartDate, endDate: normalizedEndDate, openEnded,
    item: {
      id: String(raw.id || `${raw.title}::${raw.date}`),
      title: cleanInlineText(raw.title),
      // Culture Flow lists announced-but-undated films with date "" -- say so on the card
      // instead of the generic 정보없음.
      dateLabel: cleanInlineText(raw.date) || (movie ? '개봉 미정' : ''),
      startDate: normalizedStartDate,
      endDate: normalizedEndDate,
      venue,
      address,
      region: inferRegion({ region: raw.region, address: raw.address, venue }),
      lat: typeof raw.lat === 'number' && Number.isFinite(raw.lat) ? raw.lat : null,
      lng: typeof raw.lng === 'number' && Number.isFinite(raw.lng) ? raw.lng : null,
      genre: raw.genre || '',
      image: resolveImageUrl(raw.image || raw.backupPoster || raw.posterUrl || raw.poster),
      link: String(raw.link).trim(),
      price: cleanInlineText(raw.price),
      contact: cleanInlineText(raw.contact),
      organizer: cleanInlineText(raw.organizer || raw.host || ''),
      website: String(raw.website || '').trim(),
      // Capped: KOPIS descriptions routinely run several paragraphs and are the single biggest
      // field in a tab that's fetched whole on open.
      description: cleanMultilineText(raw.description, 600),
      source: raw.source || '',
      // 스포츠 경기 전용 필드 -- Culture Flow의 KBO/K리그/KBL/KOVO/핸드볼코리아 스크레이퍼가 수집한
      // 홈/원정팀과 팀 로고. 다른 피드에서는 비어 있어 compactItem이 떨어뜨린다.
      homeTeam: cleanInlineText(raw.homeTeam),
      awayTeam: cleanInlineText(raw.awayTeam),
      homeTeamLogo: resolveImageUrl(raw.homeTeamLogo),
      awayTeamLogo: resolveImageUrl(raw.awayTeamLogo),
      releaseDate: movie ? (raw.dateRaw ? String(raw.dateRaw).replace(/^(\d{4})(\d{2})(\d{2}).*$/, '$1-$2-$3') : startDate) : '',
      isOpenEnded: openEnded,
      director: cleanInlineText(raw.director),
      cast,
      ageRating: cleanInlineText(raw.ageRating),
      audienceCount: raw.audienceCount ?? raw.audience ?? '',
      bookingRate: raw.bookingRate ?? raw.reservationRate ?? '',
      runningTime: cleanInlineText(raw.runningTime),
      subGenre: cleanInlineText(raw.subGenre),
      originalTitle: cleanInlineText(raw.originalTitle),
      synopsis: cleanMultilineText(raw.synopsis, 600)
    }
  };
}
