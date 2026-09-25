// Pulls two slices of Culture Flow's public performances feed
// (https://pyw31337.github.io/culture/data/performances.json, CORS-open static JSON) once a day,
// keeps currently-running/upcoming plus a 30-day post-end grace window, and writes normalized snapshots into this
// repo's own public-vite/data/ so the calendar app never depends on a live cross-origin fetch at
// runtime:
//   - culture-performances.json (문화공연 탭): sources culture-portal + kopis + interpark +
//     timeticket + yes24-exclusive, merged (see mergeDuplicates below) since ticketing portals
//     and KOPIS/문화포털 independently list many of the same shows under mismatched venue-name
//     formatting with no shared id to join on directly. KOPIS + Interpark together carry far
//     more currently-active theater/performance listings than 문화포털 alone, with near-complete
//     region/district coverage, so all ticket/portal sources are kept (merged where they
//     overlap) rather than picking one. Class/tourism/sports/movie buckets stay on their own
//     feeds -- this file is the 문화행사 tab only.
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
import { compactItem, isVisible, mergeDuplicates, normalizeItem } from './lib/culture-normalize.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SOURCE_URL = 'https://pyw31337.github.io/culture/data/performances.json';
const DATA_DIR = path.resolve(__dirname, '../public-vite/data');

// 스포츠(culture-sports.json)는 source가 아니라 genre로 고른다 -- Culture Flow의 야구/농구/배구/
// 축구/핸드볼 스크레이퍼들은 각자 다른 소스 키(kbo/kbl/kovo/football/handball 등)를 쓰지만, 다섯
// 종목 모두 raw.genre를 baseball/basketball/volleyball/soccer/handball 중 하나로 일관되게 채운다
// (Culture Flow scripts/generate-performance-json.ts의 GENRE_LABELS/FALLBACK_IMAGES와 동일한 값).
const SPORTS_GENRES = new Set(['baseball', 'basketball', 'volleyball', 'soccer', 'handball']);
// 문화행사 탭: Culture Flow ticketing/portal sources that carry 연극·뮤지컬·콘서트·클래식 등.
// Interpark/TimeTicket/YES24 were historically omitted (early sync only kept culture-portal+kopis),
// which silently dropped ~1k+ live ticket listings even when upstream already had them.
const PERFORMANCE_SOURCES = new Set([
  'culture-portal',
  'kopis',
  'interpark',
  'timeticket',
  'yes24-exclusive'
]);
// dedupe: merge the same show listed more than once (see mergeDuplicates in
// scripts/lib/culture-normalize.mjs). Sports stays off -- "LG vs 두산" at the same stadium is a
// different game every day, and single-day ranges only overlap for a true double listing anyway.
const FEEDS = [
  { file: 'culture-performances.json', sources: PERFORMANCE_SOURCES, label: 'performances', dedupe: true },
  { file: 'culture-festivals.json', sources: new Set(['festival']), label: 'festivals', dedupe: true },
  { file: 'culture-sports.json', genres: SPORTS_GENRES, label: 'sports' },
  // requiredFields: announced films with no release date yet ship date "" -- still worth listing
  // (sorted last as 개봉 미정), so movies only need a title and a link.
  { file: 'culture-movies.json', sources: new Set(['movie']), label: 'movies', keepHistorical: true, requiredFields: ['title', 'link'] }
];


function isFallbackPoster(url) {
  return !url || /fallbacks\/movie\.(svg|png|jpg)$/i.test(String(url));
}

// Culture Flow may legitimately have no poster yet for a newly announced title. Naver's movie
// search result exposes a small poster thumbnail even in that case; cache that URL in our static
// snapshot so runtime users never have to scrape a search engine or pay for another API call.
async function enrichMovieFromNaver(item) {
  if (!item || item.genre !== 'movie' || !isFallbackPoster(item.image)) return item;
  try {
    const response = await fetch(`https://search.naver.com/search.naver?query=${encodeURIComponent(`${item.title} 영화`)}`, {
      headers: { 'user-agent': 'Mozilla/5.0 (compatible; CalendarContentSync/1.0)' },
      signal: AbortSignal.timeout(10000)
    });
    if (!response.ok) return item;
    const html = await response.text();
    const posterCandidates = [...html.matchAll(/https?:[^"'\\ ]+(?:jpg|jpeg|png|webp)/gi)]
      .map(match => match[0].replaceAll('\\u0026', '&'))
      .filter(url => /movie\.phinf|imgmovie/i.test(url));
    const poster = posterCandidates.find(url => /type=o|size=\d+x\d+/i.test(url)) || posterCandidates[0] || '';
    if (poster) item.image = poster;
    if (!item.ageRating || /미정|정보없음|정보 없음/i.test(item.ageRating)) {
      const rating = html.match(/(전체관람가|12세이상관람가|15세이상관람가|청소년관람불가)/)?.[1];
      if (rating) item.ageRating = rating;
    }
  } catch (error) {
    console.warn(`[sync-culture-performances] movie enrichment skipped for ${item.title}: ${error.message}`);
  }
  return item;
}

function writeFeedIfHealthy(outputPath, items, label) {
  // A near-empty result is far more likely to be an upstream problem (feed truncated mid-build,
  // a filter regression) than a real feed genuinely shrinking to a handful overnight -- refuse to
  // overwrite a healthy snapshot with a suspiciously small one.
  if (items.length < 5) {
    console.error(`[sync-culture-performances] ${label}: only ${items.length} visible items -- looks like an upstream problem, keeping existing snapshot`);
    return;
  }
  // Same idea for a sudden collapse (one upstream scraper failing wipes most of a feed): losing
  // over 60% of yesterday's items in one night is kept out; a real shrink passes on a later run
  // once it's gradual, or by deleting the file / running with CULTURE_SYNC_FORCE=1.
  try {
    const previous = JSON.parse(fs.readFileSync(outputPath, 'utf8'));
    const previousCount = Array.isArray(previous?.items) ? previous.items.length : 0;
    if (previousCount >= 50 && items.length < previousCount * 0.4 && process.env.CULTURE_SYNC_FORCE !== '1') {
      console.error(`[sync-culture-performances] ${label}: ${items.length} items vs ${previousCount} in the current snapshot -- looks like an upstream problem, keeping existing snapshot`);
      return;
    }
  } catch {
    // No readable previous snapshot -- nothing to compare against.
  }
  const output = { generatedAt: new Date().toISOString(), sourceUrl: SOURCE_URL, count: items.length, items: items.map(compactItem) };
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  const tmpPath = `${outputPath}.tmp`;
  // Compact, not pretty-printed: these are fetched whole by the content tab on open, and the
  // indentation alone was ~a third of culture-performances.json.
  fs.writeFileSync(tmpPath, `${JSON.stringify(output)}\n`);
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
    const seenIds = new Set();
    let skipped = 0;
    for (const raw of all) {
      if (!raw) continue;
      const matches = feed.genres ? feed.genres.has(raw.genre) : feed.sources.has(raw.source);
      if (!matches) continue;
      if ((feed.requiredFields || REQUIRED_FIELDS).some(f => !String(raw[f] ?? '').trim())) { skipped++; continue; }
      const { startDate, endDate, openEnded, item } = normalizeItem(raw);
      // A title that is only entities/whitespace upstream, or a repeated id, would render as a
      // blank card or collide on the card's React key / cultureSourceId.
      if (!item.title || seenIds.has(item.id)) { skipped++; continue; }
      if (!feed.keepHistorical && !isVisible(endDate, startDate, todayIso, { openEnded })) continue;
      seenIds.add(item.id);
      normalized.push(item);
    }
    if (skipped > 0) console.log(`[sync-culture-performances] ${feed.label}: skipped ${skipped} item(s) missing title/date/link or with a repeated id`);
    if (feed.dedupe) {
      const result = mergeDuplicates(normalized);
      normalized = result.items;
      if (result.mergedCount > 0) console.log(`[sync-culture-performances] ${feed.label}: merged ${result.mergedCount} duplicate listing(s)`);
    }
    if (feed.label === 'movies') {
      for (const item of normalized) await enrichMovieFromNaver(item);
    }
    writeFeedIfHealthy(path.resolve(DATA_DIR, feed.file), normalized, feed.label);
  }
}

await main();
