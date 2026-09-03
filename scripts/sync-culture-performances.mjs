// Pulls two slices of Culture Flow's public performances feed
// (https://pyw31337.github.io/culture/data/performances.json, CORS-open static JSON) once a day,
// keeps only currently-running or upcoming items, and writes normalized snapshots into this
// repo's own public-vite/data/ so the calendar app never depends on a live cross-origin fetch at
// runtime:
//   - culture-performances.json (문화공연 탭): source 'culture-portal' + 'kopis'. KOPIS turned out
//     to carry far more currently-active listings than the 문화포털 API alone (~1400 vs ~90 on a
//     typical day) with near-complete region/district coverage, so both are kept side by side
//     rather than picking one -- no de-duplication between them is attempted (they're independent
//     upstream sources with no shared id space to match on reliably), so a show simultaneously
//     listed on both sites can appear twice. Worth revisiting if that turns out to bother anyone
//     in practice; for now more coverage beats a naive title-fuzzy-match that could just as easily
//     drop a real show as a duplicate one.
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
    const normalized = [];
    for (const raw of all) {
      if (!raw || !feed.sources.has(raw.source)) continue;
      if (REQUIRED_FIELDS.some(f => !raw[f])) continue;
      const { startDate, endDate, item } = normalizeItem(raw);
      if (!isVisible(endDate, startDate, todayIso)) continue;
      normalized.push(item);
    }
    writeFeedIfHealthy(path.resolve(DATA_DIR, feed.file), normalized, feed.label);
  }
}

await main();
