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
import {
  compactItem,
  culturePortalPosterFromHtml,
  interparkPosterFromGoods,
  isFallbackOrEmptyPoster,
  isVisible,
  mergeDuplicates,
  normalizeItem,
  timeTicketPosterFromHtml,
  timeTicketProductUrl
} from './lib/culture-normalize.mjs';

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
  // Dated films are visible only through their theatrical window (see movieTheatricalEnd).
  // Undated announcements stay via openEnded. keepHistorical used to pin every past release
  // in the movie tab as 상영중.
  { file: 'culture-movies.json', sources: new Set(['movie']), label: 'movies', requiredFields: ['title', 'link'] }
];


const POSTER_CACHE_FILE = path.resolve(__dirname, 'data/culture-poster-cache.json');
const BROWSER_UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36';
const FETCH_HEADERS = {
  'user-agent': BROWSER_UA,
  'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
  'accept-language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7'
};

let posterCache = {};
try {
  if (fs.existsSync(POSTER_CACHE_FILE)) {
    posterCache = JSON.parse(fs.readFileSync(POSTER_CACHE_FILE, 'utf8'));
    // Purge corrupted/fallback cache entries (such as https_p.gif or fallback svgs)
    for (const key of Object.keys(posterCache)) {
      if (isFallbackOrEmptyPoster(posterCache[key])) {
        delete posterCache[key];
      }
    }
  }
} catch (e) {
  posterCache = {};
}

function savePosterCache() {
  try {
    fs.mkdirSync(path.dirname(POSTER_CACHE_FILE), { recursive: true });
    fs.writeFileSync(POSTER_CACHE_FILE, `${JSON.stringify(posterCache, null, 2)}\n`);
  } catch (e) {
    console.warn('[sync-culture-performances] failed to save poster cache:', e.message);
  }
}

function getCachedPoster(item) {
  if (!item) return '';
  const cached = posterCache[item.id] || posterCache[item.link] || posterCache[`title:${item.title}`] || '';
  return isFallbackOrEmptyPoster(cached) ? '' : cached;
}

function setCachedPoster(item, posterUrl) {
  if (!item || !posterUrl || isFallbackOrEmptyPoster(posterUrl)) return;
  if (item.id) posterCache[item.id] = posterUrl;
  if (item.link) posterCache[item.link] = posterUrl;
  if (item.title) posterCache[`title:${item.title}`] = posterUrl;
}

async function enrichMovieFromNaver(item) {
  if (!item || item.genre !== 'movie' || !isFallbackOrEmptyPoster(item.image)) return item;
  try {
    const clean = item.title.replace(/[[\]()【】〈〉《》「」『』]/g, ' ').replace(/\s+/g, ' ').trim();
    const queries = [`${clean} 영화`, clean];
    for (const q of queries) {
      const response = await fetch(`https://search.naver.com/search.naver?query=${encodeURIComponent(q)}`, {
        headers: FETCH_HEADERS,
        signal: AbortSignal.timeout(10000)
      });
      if (!response.ok) continue;
      const html = await response.text();
      const posterCandidates = [...html.matchAll(/https?:[^"'\\ ]+(?:jpg|jpeg|png|webp)/gi)]
        .map(match => match[0].replaceAll('\\u0026', '&'))
        .filter(url => /movie\.phinf|imgmovie/i.test(url) && !isFallbackOrEmptyPoster(url));
      const poster = posterCandidates.find(url => /type=o|size=\d+x\d+/i.test(url)) || posterCandidates[0] || '';
      if (poster) {
        item.image = poster;
        setCachedPoster(item, poster);
        if (!item.ageRating || /미정|정보없음|정보 없음/i.test(item.ageRating)) {
          const rating = html.match(/(전체관람가|12세이상관람가|15세이상관람가|청소년관람불가)/)?.[1];
          if (rating) item.ageRating = rating;
        }
        break;
      }
    }
  } catch (error) {
    console.warn(`[sync-culture-performances] movie enrichment skipped for ${item.title}: ${error.message}`);
  }
  return item;
}

async function enrichFromOpenGraph(item) {
  if (!item || !isFallbackOrEmptyPoster(item.image)) return item;
  const link = String(item.link || item.website || '').trim();
  if (!link || !/^https?:\/\//i.test(link) || /search\.naver\.com|search\.daum\.net/i.test(link)) return item;
  try {
    const response = await fetch(link, {
      headers: FETCH_HEADERS,
      signal: AbortSignal.timeout(10000)
    });
    if (!response.ok) return item;
    const html = await response.text();
    const ogMatch = html.match(/<meta\b[^>]*property=["'](?:og:image|twitter:image)["'][^>]*content=["']([^"']+)["']/i)
      || html.match(/<meta\b[^>]*content=["']([^"']+)["'][^>]*property=["'](?:og:image|twitter:image)["']/i);
    if (ogMatch && ogMatch[1]) {
      const candidate = ogMatch[1].trim();
      let resolved = candidate;
      if (!/^https?:\/\//i.test(resolved)) {
        try { resolved = new URL(resolved, link).href; } catch { resolved = ''; }
      }
      if (resolved && !isFallbackOrEmptyPoster(resolved)) {
        item.image = resolved;
        setCachedPoster(item, resolved);
        return item;
      }
    }
  } catch (error) {
    // silently skip network/page errors
  }
  return item;
}

async function enrichPerformanceFromSearch(item) {
  if (!item || !isFallbackOrEmptyPoster(item.image)) return item;
  try {
    const cleanTitle = item.title.replace(/[[\]()【】〈〉《》「」『』]/g, ' ').replace(/\s+/g, ' ').trim();
    const queries = [
      `${cleanTitle} ${item.venue || ''}`.trim(),
      `${cleanTitle} 포스터`.trim(),
      `${cleanTitle} ${item.genre || '공연'}`.trim()
    ];

    // Try Naver Search
    for (const query of queries) {
      if (!isFallbackOrEmptyPoster(item.image)) break;
      const response = await fetch(`https://search.naver.com/search.naver?query=${encodeURIComponent(query)}`, {
        headers: FETCH_HEADERS,
        signal: AbortSignal.timeout(10000)
      });
      if (!response.ok) continue;
      const html = await response.text();
      const candidates = [...html.matchAll(/https?:\/\/[^\s"'<>\\]+?(?:search\.pstatic\.net|phinf)[^\s"'<>\\]+?(?:jpg|jpeg|png|webp)/gi)]
        .map(m => m[0].replaceAll('\\u0026', '&'))
        .filter(url => !/favicon|logo|icon|profile|avatar|comment/i.test(url) && !isFallbackOrEmptyPoster(url));
      const poster = candidates.find(url => /type=o|size=\d+x\d+|common/i.test(url)) || candidates[0] || '';
      if (poster) {
        item.image = poster;
        setCachedPoster(item, poster);
        return item;
      }
    }

    // Secondary fallback: Daum Image Search
    if (isFallbackOrEmptyPoster(item.image)) {
      const daumResponse = await fetch(`https://search.daum.net/search?w=img&q=${encodeURIComponent(`${cleanTitle} 포스터`)}`, {
        headers: FETCH_HEADERS,
        signal: AbortSignal.timeout(10000)
      });
      if (daumResponse.ok) {
        const daumHtml = await daumResponse.text();
        const daumCandidates = [...daumHtml.matchAll(/https?:\/\/[^\s"'<>\\]+?(?:daumcdn\.net|kakaocdn\.net)[^\s"'<>\\]+?(?:jpg|jpeg|png|webp)/gi)]
          .map(m => m[0].replaceAll('\\u0026', '&'))
          .filter(url => !/thumb|favicon|logo|icon|profile/i.test(url) && !isFallbackOrEmptyPoster(url));
        const daumPoster = daumCandidates[0] || '';
        if (daumPoster) {
          item.image = daumPoster;
          setCachedPoster(item, daumPoster);
          return item;
        }
      }
    }
  } catch (error) {
    console.warn(`[sync-culture-performances] search enrichment skipped for ${item.title}: ${error.message}`);
  }
  return item;
}

async function mapPool(items, limit, worker) {
  const queue = items.slice();
  const runners = Array.from({ length: Math.min(limit, queue.length) }, async () => {
    while (queue.length) await worker(queue.shift());
  });
  await Promise.all(runners);
}

async function enrichCulturePortalPoster(item) {
  if (!item || !isFallbackOrEmptyPoster(item.image)) return item;
  const link = String(item.link || item.website || '').trim();
  if (!link || (!link.includes('mcst.go.kr') && !link.includes('culture.go.kr'))) return item;
  try {
    const response = await fetch(link, {
      headers: FETCH_HEADERS,
      signal: AbortSignal.timeout(10000)
    });
    if (!response.ok) return item;
    const poster = culturePortalPosterFromHtml(await response.text(), link);
    if (poster && !isFallbackOrEmptyPoster(poster)) {
      item.image = poster;
      setCachedPoster(item, poster);
    }
  } catch (error) {
    console.warn(`[sync-culture-performances] mcst poster skipped for ${item.title}: ${error.message}`);
  }
  return item;
}

async function enrichTimeTicketPoster(item) {
  const pageUrl = timeTicketProductUrl(item);
  if (!pageUrl) return item;
  try {
    const response = await fetch(pageUrl, {
      headers: FETCH_HEADERS,
      signal: AbortSignal.timeout(12000)
    });
    if (!response.ok) return item;
    const poster = timeTicketPosterFromHtml(await response.text(), pageUrl);
    if (poster && !isFallbackOrEmptyPoster(poster)) {
      item.image = poster;
      setCachedPoster(item, poster);
    }
  } catch (error) {
    console.warn(`[sync-culture-performances] timeticket poster skipped for ${item.title}: ${error.message}`);
  }
  return item;
}

async function enrichAllFeedPosters(items, label) {
  let fromCache = 0;
  let fromInterpark = 0;
  let remoteRefreshed = 0;

  // Pass 1: Synchronous cache & deterministic Interpark recovery
  for (const item of items) {
    if (!isFallbackOrEmptyPoster(item.image)) {
      setCachedPoster(item, item.image);
      continue;
    }
    const cached = getCachedPoster(item);
    if (cached && !isFallbackOrEmptyPoster(cached)) {
      item.image = cached;
      fromCache++;
      continue;
    }
    const interpark = interparkPosterFromGoods(item.link || item.website);
    if (interpark && !isFallbackOrEmptyPoster(interpark)) {
      item.image = interpark;
      setCachedPoster(item, interpark);
      fromInterpark++;
      continue;
    }
  }

  // Pass 2: Asynchronous network recovery for unresolved items
  const unresolved = items.filter(it => isFallbackOrEmptyPoster(it.image));
  if (unresolved.length > 0) {
    console.log(`[sync-culture-performances] ${label}: recovering ${unresolved.length} unresolved poster(s) via source scrapers & search...`);
    await mapPool(unresolved, 6, async item => {
      const prev = item.image;
      if (item.genre === 'movie') {
        await enrichMovieFromNaver(item);
      } else if (item.source === 'timeticket' || timeTicketProductUrl(item)) {
        await enrichTimeTicketPoster(item);
      } else if (item.link && (item.link.includes('mcst.go.kr') || item.link.includes('culture.go.kr'))) {
        await enrichCulturePortalPoster(item);
      }
      if (isFallbackOrEmptyPoster(item.image)) {
        await enrichFromOpenGraph(item);
      }
      if (isFallbackOrEmptyPoster(item.image)) {
        await enrichPerformanceFromSearch(item);
      }
      if (item.image !== prev && !isFallbackOrEmptyPoster(item.image)) {
        remoteRefreshed++;
      }
    });
  }

  console.log(`[sync-culture-performances] ${label} posters: cached ${fromCache}, interpark ${fromInterpark}, remote refreshed ${remoteRefreshed}, remaining unresolved: ${items.filter(it => isFallbackOrEmptyPoster(it.image)).length}`);
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
  const localSourceFile = process.env.CULTURE_SYNC_SOURCE_FILE || '';

  let all;
  if (localSourceFile && fs.existsSync(localSourceFile)) {
    try {
      all = JSON.parse(fs.readFileSync(localSourceFile, 'utf8'));
      console.log(`[sync-culture-performances] loaded ${Array.isArray(all) ? all.length : 0} items from local file ${localSourceFile}`);
    } catch (err) {
      console.error(`[sync-culture-performances] failed to parse local file ${localSourceFile}: ${err.message}`);
      return;
    }
  } else {
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

    try {
      all = await response.json();
    } catch (err) {
      console.error(`[sync-culture-performances] response was not valid JSON, keeping existing snapshots: ${err.message}`);
      return;
    }
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
    const outputPath = path.resolve(DATA_DIR, feed.file);
    if (feed.dedupe && fs.existsSync(outputPath)) {
      try {
        const prevSnapshot = JSON.parse(fs.readFileSync(outputPath, 'utf8'));
        const prevItems = Array.isArray(prevSnapshot?.items) ? prevSnapshot.items : [];
        let carriedOver = 0;
        for (const prev of prevItems) {
          if (!prev || !prev.id || !prev.title || seenIds.has(prev.id)) continue;
          const startDate = prev.startDate || '';
          const endDate = prev.endDate || startDate || '';
          if (!feed.keepHistorical && !isVisible(endDate, startDate, todayIso, { openEnded: Boolean(prev.openEnded) })) continue;
          seenIds.add(prev.id);
          normalized.push(prev);
          carriedOver++;
        }
        if (carriedOver > 0) {
          console.log(`[sync-culture-performances] ${feed.label}: carried over ${carriedOver} still-visible item(s) from previous snapshot`);
        }
      } catch (err) {
        console.warn(`[sync-culture-performances] ${feed.label}: failed to read previous snapshot for carry-over: ${err.message}`);
      }
    }
    if (feed.dedupe) {
      const result = mergeDuplicates(normalized);
      normalized = result.items;
      if (result.mergedCount > 0) console.log(`[sync-culture-performances] ${feed.label}: merged ${result.mergedCount} duplicate listing(s)`);
    }
    await enrichAllFeedPosters(normalized, feed.label);
    writeFeedIfHealthy(outputPath, normalized, feed.label);
  }
  savePosterCache();
}

await main();
