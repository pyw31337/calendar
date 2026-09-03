// Pulls the culture-portal (문화포털) slice of Culture Flow's public performances feed
// (https://pyw31337.github.io/culture/data/performances.json, CORS-open static JSON) once a day,
// keeps only currently-running or upcoming shows, and writes a small normalized snapshot into
// this repo's own public-vite/data/ so the calendar app never depends on a live cross-origin
// fetch at runtime.
//
// Deliberately defensive: Culture Flow is a separate project with its own release cadence. If its
// feed is unreachable, empty, or missing fields this script depends on, we log and exit WITHOUT
// touching the existing committed snapshot -- yesterday's data keeps serving rather than the
// calendar site losing the 문화공연 tab (or showing empty) because of an unrelated project's bad
// day. The GitHub Actions step running this only commits when the file actually changed, so a
// no-op run leaves no diff.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SOURCE_URL = 'https://pyw31337.github.io/culture/data/performances.json';
const OUTPUT_PATH = path.resolve(__dirname, '../public-vite/data/culture-performances.json');
const SOURCE_TAG = 'culture-portal';

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

async function main() {
  const todayIso = new Date().toISOString().slice(0, 10);

  let response;
  try {
    response = await fetch(SOURCE_URL, { signal: AbortSignal.timeout(20000) });
  } catch (err) {
    console.error(`[sync-culture-performances] fetch failed, keeping existing snapshot: ${err.message}`);
    return;
  }
  if (!response.ok) {
    console.error(`[sync-culture-performances] fetch returned ${response.status}, keeping existing snapshot`);
    return;
  }

  let all;
  try {
    all = await response.json();
  } catch (err) {
    console.error(`[sync-culture-performances] response was not valid JSON, keeping existing snapshot: ${err.message}`);
    return;
  }
  if (!Array.isArray(all)) {
    console.error('[sync-culture-performances] response was not an array, keeping existing snapshot');
    return;
  }

  const REQUIRED_FIELDS = ['title', 'date', 'link'];
  const normalized = [];
  let skippedMissingFields = 0;
  let skippedPast = 0;

  for (const raw of all) {
    if (!raw || raw.source !== SOURCE_TAG) continue;
    if (REQUIRED_FIELDS.some(f => !raw[f])) { skippedMissingFields++; continue; }
    const { startDate, endDate } = parseDateRange(raw.date);
    if (!isVisible(endDate, startDate, todayIso)) { skippedPast++; continue; }

    normalized.push({
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
      description: raw.description || ''
    });
  }

  // A near-empty result is far more likely to be an upstream problem (feed truncated mid-build,
  // a filter regression) than 3790 real shows genuinely shrinking to a handful overnight -- refuse
  // to overwrite a healthy snapshot with a suspiciously small one. 5 is well below any observed
  // day's culture-portal count (dozens) but well above "the feed came back empty".
  if (normalized.length < 5) {
    console.error(`[sync-culture-performances] only ${normalized.length} visible items after filtering (skipped ${skippedMissingFields} missing-field, ${skippedPast} past) -- looks like an upstream problem, keeping existing snapshot`);
    return;
  }

  const output = {
    generatedAt: new Date().toISOString(),
    sourceUrl: SOURCE_URL,
    count: normalized.length,
    items: normalized
  };

  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  const tmpPath = `${OUTPUT_PATH}.tmp`;
  fs.writeFileSync(tmpPath, JSON.stringify(output, null, 2));
  fs.renameSync(tmpPath, OUTPUT_PATH);
  console.log(`[sync-culture-performances] wrote ${normalized.length} items (skipped ${skippedMissingFields} missing-field, ${skippedPast} past) to ${path.relative(process.cwd(), OUTPUT_PATH)}`);
}

await main();
