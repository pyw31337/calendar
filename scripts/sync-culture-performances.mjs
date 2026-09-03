// Pulls two slices of Culture Flow's public performances feed
// (https://pyw31337.github.io/culture/data/performances.json, CORS-open static JSON) once a day,
// keeps only currently-running or upcoming items, and writes normalized snapshots into this
// repo's own public-vite/data/ so the calendar app never depends on a live cross-origin fetch at
// runtime:
//   - culture-performances.json (문화공연 탭): source 'culture-portal' + 'kopis', merged (see
//     mergeDuplicates below) since both independently list many of the same shows under
//     mismatched venue-name formatting with no shared id to join on directly. KOPIS carries far
//     more currently-active listings than the 문화포털 API alone (~1400-1800 vs ~90 on a typical
//     day) with near-complete region/district coverage, so both are kept (merged where they
//     overlap) rather than picking one.
//   - culture-festivals.json (지역축제 탭): source 'festival' -- Culture Flow already aggregates
//     VisitKorea/문체부/VisitSeoul/경기관광공사 등 지역축제 sources into this one merged bucket, so
//     this repo doesn't need its own scrapers for any of those sites.
//
// Deliberately defensive: Culture Flow is a separate project with its own release cadence. If its
// feed is unreachable, empty, or missing fields this script depends on, we log and exit WITHOUT
// touching the existing committed snapshots -- yesterday's data keeps serving rather than the
// calendar site losing a tab (or showing empty) because of an unrelated project's bad day. The
// GitHub Actions step running this only commits files that actually changed.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SOURCE_URL = 'https://pyw31337.github.io/culture/data/performances.json';
const DATA_DIR = path.resolve(__dirname, '../public-vite/data');

const FEEDS = [
  { file: 'culture-performances.json', sources: new Set(['culture-portal', 'kopis']), label: 'performances' },
  { file: 'culture-festivals.json', sources: new Set(['festival']), label: 'festivals' }
];

function parseDateRange(raw) {
  // Culture Flow date strings look like "2026.08.28 (금) ~ 2027.02.09 (화)" or a single
  // "2026.08.28 (금)" -- pull out plain YYYY.MM.DD tokens and ignore the day-name parens.
  const matches = String(raw || '').match(/\d{4}\.\d{2}\.\d{2}/g) || [];
  const toIso = s => s.replaceAll('.', '-');
  const startDate = matches[0] ? toIso(matches[0]) : null;
  const endDate = matches[1] ? toIso(matches[1]) : startDate;
  return { startDate, endDate };
}

function isVisible(endDate, startDate, todayIso) {
  // "상영중 + 예정작만" -- an item is worth showing while it hasn't finished yet. If only a
  // start date parsed, fall back to that (single-day event). Unparseable dates are dropped
  // rather than guessed at, since a wrong guess is worse than a missing item here.
  const effectiveEnd = endDate || startDate;
  if (!effectiveEnd) return false;
  return effectiveEnd >= todayIso;
}

function normalizeItem(raw) {
  const { startDate, endDate } = parseDateRange(raw.date);
  return {
    startDate, endDate,
    item: {
      id: String(raw.id || `${raw.title}::${raw.date}`),
      title: String(raw.title),
      dateLabel: String(raw.date),
      startDate,
      endDate,
      venue: raw.venue || raw.venueKey || '',
      address: raw.address || '',
      region: raw.region || '',
      lat: typeof raw.lat === 'number' ? raw.lat : null,
      lng: typeof raw.lng === 'number' ? raw.lng : null,
      genre: raw.genre || '',
      image: raw.image || raw.backupPoster || '',
      link: String(raw.link),
      price: raw.price || '',
      contact: raw.contact || '',
      organizer: raw.organizer || raw.host || '',
      website: raw.website || '',
      // KOPIS alone pushed this feed from ~80 to ~1300 items -- capping description (routinely
      // several paragraphs, the single biggest field) keeps the payload reasonable for a tab
      // that's fetched fresh on open rather than paginated.
      description: String(raw.description || '').slice(0, 600),
      source: raw.source || ''
    }
  };
}

// Strips bracketed prefixes ("[뮤지컬] ", "(대학로)"), whitespace, and punctuation so
// "[뮤지컬] 써니텐" (culture-portal) and "써니텐" (kopis) compare equal. Not a full fuzzy-match --
// deliberately exact-after-normalization, so it only merges titles that really are the same show
// rather than guessing at near-misses that could just as easily merge two different ones.
function normalizeTitleForMatch(title) {
  return String(title || '')
    .replace(/[[(【][^\])】]*[\])】]/g, '')
    .replace(/[\s\u3000·,.\-_/!?'"“”‘’]/g, '')
    .toLowerCase();
}

// KOPIS venue names routinely repeat themselves in parens, e.g.
// "세티 라이브홀 (SETI LIVE HALL) (세티 라이브홀 (SETI LIVE HALL) )" -- take everything before the
// first paren as the comparable venue name.
function normalizeVenueForMatch(venue) {
  return String(venue || '').split('(')[0].replace(/\s/g, '').toLowerCase();
}

function dateRangesOverlap(aStart, aEnd, bStart, bEnd) {
  if (!aStart || !bStart) return false;
  const aE = aEnd || aStart, bE = bEnd || bStart;
  return aStart <= bE && bStart <= aE;
}

// Prefer whichever value is actually present; when both are, prefer the longer/richer one (a
// real https poster over a source's own placeholder path, a fuller description, etc.) without
// needing to know per-field which source tends to be better.
function pickRicher(a, b) {
  const av = (a ?? '').toString().trim();
  const bv = (b ?? '').toString().trim();
  if (!av) return b;
  if (!bv) return a;
  return bv.length > av.length ? b : a;
}

// culture-portal and kopis independently list many of the same show with no shared id, under
// venue-name formatting that never matches exactly. Groups items by (normalized title, calendar
// month of start date) -- month bucketing keeps groups small on a feed this size (1000+ items)
// without needing an O(n^2) scan of the whole feed -- then within each group merges any pair
// whose normalized venue matches AND whose date ranges overlap. Deliberately conservative: title
// match alone is not enough (two different productions can share a generic title), so a
// venue+date mismatch is left as two separate items rather than risk merging unrelated shows.
function mergeDuplicates(items) {
  const groups = new Map();
  for (const it of items) {
    const key = `${normalizeTitleForMatch(it.title)}::${(it.startDate || '').slice(0, 7)}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(it);
  }

  const merged = [];
  let mergedCount = 0;
  for (const group of groups.values()) {
    if (group.length === 1) { merged.push(group[0]); continue; }
    const used = new Array(group.length).fill(false);
    for (let i = 0; i < group.length; i++) {
      if (used[i]) continue;
      let base = group[i];
      used[i] = true;
      for (let j = i + 1; j < group.length; j++) {
        if (used[j]) continue;
        const other = group[j];
        if (base.source === other.source) continue; // same-source "duplicates" aren't this bug's target
        const venueMatch = normalizeVenueForMatch(base.venue) && normalizeVenueForMatch(base.venue) === normalizeVenueForMatch(other.venue);
        if (!venueMatch || !dateRangesOverlap(base.startDate, base.endDate, other.startDate, other.endDate)) continue;
        used[j] = true;
        mergedCount++;
        base = {
          ...base,
          venue: pickRicher(base.venue, other.venue),
          address: pickRicher(base.address, other.address),
          region: pickRicher(base.region, other.region),
          lat: base.lat ?? other.lat,
          lng: base.lng ?? other.lng,
          image: pickRicher(base.image, other.image),
          price: pickRicher(base.price, other.price),
          contact: pickRicher(base.contact, other.contact),
          organizer: pickRicher(base.organizer, other.organizer),
          website: pickRicher(base.website, other.website),
          description: pickRicher(base.description, other.description),
          source: [...new Set([base.source, other.source])].join('+')
        };
      }
      merged.push(base);
    }
  }
  if (mergedCount > 0) console.log(`[sync-culture-performances] merged ${mergedCount} cross-source duplicate(s) (culture-portal <-> kopis)`);
  return merged;
}

function writeFeedIfHealthy(outputPath, items, label) {
  // A near-empty result is far more likely to be an upstream problem (feed truncated mid-build,
  // a filter regression) than a real feed genuinely shrinking to a handful overnight -- refuse to
  // overwrite a healthy snapshot with a suspiciously small one.
  if (items.length < 5) {
    console.error(`[sync-culture-performances] ${label}: only ${items.length} visible items -- looks like an upstream problem, keeping existing snapshot`);
    return;
  }
  const output = { generatedAt: new Date().toISOString(), sourceUrl: SOURCE_URL, count: items.length, items };
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  const tmpPath = `${outputPath}.tmp`;
  fs.writeFileSync(tmpPath, JSON.stringify(output, null, 2));
  fs.renameSync(tmpPath, outputPath);
  console.log(`[sync-culture-performances] ${label}: wrote ${items.length} items to ${path.relative(process.cwd(), outputPath)}`);
}

async function main() {
  const todayIso = new Date().toISOString().slice(0, 10);

  let response;
  try {
    response = await fetch(SOURCE_URL, { signal: AbortSignal.timeout(20000) });
  } catch (err) {
    console.error(`[sync-culture-performances] fetch failed, keeping existing snapshots: ${err.message}`);
    return;
  }
  if (!response.ok) {
    console.error(`[sync-culture-performances] fetch returned ${response.status}, keeping existing snapshots`);
    return;
  }

  let all;
  try {
    all = await response.json();
  } catch (err) {
    console.error(`[sync-culture-performances] response was not valid JSON, keeping existing snapshots: ${err.message}`);
    return;
  }
  if (!Array.isArray(all)) {
    console.error('[sync-culture-performances] response was not an array, keeping existing snapshots');
    return;
  }

  const REQUIRED_FIELDS = ['title', 'date', 'link'];
  for (const feed of FEEDS) {
    let normalized = [];
    for (const raw of all) {
      if (!raw || !feed.sources.has(raw.source)) continue;
      if (REQUIRED_FIELDS.some(f => !raw[f])) continue;
      const { startDate, endDate, item } = normalizeItem(raw);
      if (!isVisible(endDate, startDate, todayIso)) continue;
      normalized.push(item);
    }
    if (feed.sources.size > 1) normalized = mergeDuplicates(normalized);
    writeFeedIfHealthy(path.resolve(DATA_DIR, feed.file), normalized, feed.label);
  }
}

await main();
