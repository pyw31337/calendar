import { mkdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';

const PROJECT_ID = 'metro-live-2918e';
const BASE_URL = 'https://pyw31337.github.io/calendar';
const OG_IMAGE_URL = `${BASE_URL}/og-thumb.jpg?v=20260803`;
const OUT_DIR = path.resolve('share');
const FALLBACK_TITLE = '모여라 캘린더';
const FALLBACK_DESCRIPTION = '사모임 참여자들의 가능 날짜를 캘린더에 표기하고 전원 모임 가능한 날짜를 한눈에 파악해보세요.';

function escapeHtml(value) {
  return String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function firestoreValueToJs(value) {
  if (!value || typeof value !== 'object') return undefined;
  if ('stringValue' in value) return value.stringValue;
  if ('integerValue' in value) return Number(value.integerValue);
  if ('doubleValue' in value) return Number(value.doubleValue);
  if ('booleanValue' in value) return Boolean(value.booleanValue);
  if ('timestampValue' in value) return Date.parse(value.timestampValue);
  if ('mapValue' in value) {
    const fields = value.mapValue.fields || {};
    return Object.fromEntries(Object.entries(fields).map(([key, nested]) => [key, firestoreValueToJs(nested)]));
  }
  if ('arrayValue' in value) {
    return (value.arrayValue.values || []).map(firestoreValueToJs);
  }
  return undefined;
}

function normalizeCalendar(doc) {
  const fields = doc.fields || {};
  const calendar = firestoreValueToJs(fields.calendar) || {};
  const docId = (doc.name || '').split('/').pop() || '';
  const id = calendar.id || docId.replace(/^cal_/, '');
  if (!id || !/^[A-Za-z0-9_-]{1,64}$/.test(id)) return null;
  return {
    id,
    title: calendar.title || FALLBACK_TITLE,
    description: calendar.description || `${calendar.title || FALLBACK_TITLE} 일정 조율 캘린더`
  };
}

async function fetchCalendars() {
  const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/calendars`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Firestore calendar fetch failed: ${res.status}`);
  }
  const json = await res.json();
  return (json.documents || []).map(normalizeCalendar).filter(Boolean);
}

function createShareHtml(calendar) {
  const title = `${calendar.title} - 모여라 캘린더`;
  const description = calendar.description || FALLBACK_DESCRIPTION;
  const calendarUrl = `${BASE_URL}/?id=${encodeURIComponent(calendar.id)}`;
  const shareUrl = calendarUrl;
  const escapedTitle = escapeHtml(title);
  const escapedDescription = escapeHtml(description);
  const escapedShareUrl = escapeHtml(shareUrl);
  const escapedCalendarUrl = escapeHtml(calendarUrl);

  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapedTitle}</title>
  <meta name="description" content="${escapedDescription}">
  <link rel="canonical" href="${escapedCalendarUrl}">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="모여라 캘린더">
  <meta property="og:title" content="${escapedTitle}">
  <meta property="og:description" content="${escapedDescription}">
  <meta property="og:image" content="${OG_IMAGE_URL}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:url" content="${escapedShareUrl}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapedTitle}">
  <meta name="twitter:description" content="${escapedDescription}">
  <meta name="twitter:image" content="${OG_IMAGE_URL}">
  <script>
    window.location.replace(${JSON.stringify(calendarUrl)});
  </script>
</head>
<body>
  <main style="font-family: sans-serif; padding: 32px;">
    <h1>${escapedTitle}</h1>
    <p>${escapedDescription}</p>
    <p><a href="${escapedCalendarUrl}">캘린더로 이동하기</a></p>
  </main>
</body>
</html>
`;
}

async function main() {
  const calendars = await fetchCalendars();
  await rm(OUT_DIR, { recursive: true, force: true });
  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(path.join(OUT_DIR, '.nojekyll'), '');

  await Promise.all(calendars.map(async (calendar) => {
    const targetDir = path.join(OUT_DIR, calendar.id);
    await mkdir(targetDir, { recursive: true });
    await writeFile(path.join(targetDir, 'index.html'), createShareHtml(calendar));
  }));

  const indexHtml = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${FALLBACK_TITLE}</title>
  <meta name="description" content="${FALLBACK_DESCRIPTION}">
  <meta property="og:title" content="${FALLBACK_TITLE}">
  <meta property="og:description" content="${FALLBACK_DESCRIPTION}">
  <meta property="og:image" content="${OG_IMAGE_URL}">
</head>
<body>
  <script>window.location.replace('${BASE_URL}/');</script>
  <a href="${BASE_URL}/">모여라 캘린더로 이동하기</a>
</body>
</html>
`;
  await writeFile(path.join(OUT_DIR, 'index.html'), indexHtml);
  console.log(`Generated ${calendars.length} Open Graph share page(s).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
