import { mkdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';

const PROJECT_ID = 'metro-live-2918e';
const BASE_URL = 'https://pyw31337.github.io/calendar';
const OG_IMAGE_URL = `${BASE_URL}/og-thumb.jpg?v=20260804`;
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

function normalizeCalendar(raw) {
  const id = raw?.id || '';
  if (!id || !/^[A-Za-z0-9_-]{1,64}$/.test(id)) return null;
  return {
    id,
    title: raw.title || FALLBACK_TITLE,
    description: raw.description || `${raw.title || FALLBACK_TITLE} 일정 조율 캘린더`
  };
}

// Goes through the listPublicCalendarSummaries Cloud Function (functions/index.js) rather than a
// raw Firestore REST `list` on /calendars: that collection's `list` rule was locked down to
// `if false` (previously `if true` let anyone enumerate every calendar ID and read its full
// contents, not just the id/title/description this script actually needs) once the admin
// dashboard's cross-calendar view moved to server-side Cloud Functions instead. This script needs
// the same enumeration, just scoped to the public fields a share link's OG tags already expose.
async function fetchCalendars() {
  const url = `https://us-central1-${PROJECT_ID}.cloudfunctions.net/listPublicCalendarSummaries`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Calendar summary fetch failed: ${res.status}`);
  }
  const json = await res.json();
  if (!json.ok) {
    throw new Error(`Calendar summary fetch returned ok:false: ${json.message || 'unknown error'}`);
  }
  return (json.calendars || []).map(normalizeCalendar).filter(Boolean);
}

// `forwardSearch` keeps any legacy query string (e.g. an old `?view=chat` link generated
// before the dedicated chat share page below existed) alive across the redirect instead of
// silently dropping it and landing on the calendar view.
function createShareHtml(calendar, { title, description, calendarUrl, shareUrl, forwardSearch = true }) {
  const escapedTitle = escapeHtml(title);
  const escapedDescription = escapeHtml(description);
  const escapedShareUrl = escapeHtml(shareUrl);
  const escapedCalendarUrl = escapeHtml(calendarUrl);
  const redirectScript = forwardSearch
    ? `var u = ${JSON.stringify(calendarUrl)}; if (window.location.search) u += (u.indexOf('?') === -1 ? '?' : '&') + window.location.search.slice(1); window.location.replace(u);`
    : `window.location.replace(${JSON.stringify(calendarUrl)});`;

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
    ${redirectScript}
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

function createCalendarShareHtml(calendar) {
  return createShareHtml(calendar, {
    title: `${calendar.title} 캘린더`,
    description: calendar.description || FALLBACK_DESCRIPTION,
    calendarUrl: `${BASE_URL}/?id=${encodeURIComponent(calendar.id)}`,
    shareUrl: `${BASE_URL}/share/${encodeURIComponent(calendar.id)}/`
  });
}

function createChatShareHtml(calendar) {
  return createShareHtml(calendar, {
    title: `${calendar.title} 채팅방`,
    description: `${calendar.title} 채팅방에서 대화를 확인해보세요.`,
    calendarUrl: `${BASE_URL}/?id=${encodeURIComponent(calendar.id)}&view=chat`,
    shareUrl: `${BASE_URL}/share/${encodeURIComponent(calendar.id)}/chat/`,
    forwardSearch: false
  });
}

function createPlacesShareHtml(calendar) {
  return createShareHtml(calendar, {
    title: `${calendar.title} 장소`,
    description: `${calendar.title}에 등록된 장소를 지도에서 확인해보세요.`,
    calendarUrl: `${BASE_URL}/?id=${encodeURIComponent(calendar.id)}&view=places`,
    shareUrl: `${BASE_URL}/share/${encodeURIComponent(calendar.id)}/places/`,
    forwardSearch: false
  });
}

function createMemoShareHtml(calendar) {
  return createShareHtml(calendar, {
    title: `${calendar.title} 메모`,
    description: `${calendar.title} 메모를 확인해보세요.`,
    calendarUrl: `${BASE_URL}/?id=${encodeURIComponent(calendar.id)}&view=memo`,
    shareUrl: `${BASE_URL}/share/${encodeURIComponent(calendar.id)}/memo/`,
    forwardSearch: false
  });
}

function createGalleryShareHtml(calendar) {
  return createShareHtml(calendar, {
    title: `${calendar.title} 갤러리`,
    description: `${calendar.title} 사진과 링크 갤러리를 확인해보세요.`,
    calendarUrl: `${BASE_URL}/?id=${encodeURIComponent(calendar.id)}&view=gallery`,
    shareUrl: `${BASE_URL}/share/${encodeURIComponent(calendar.id)}/gallery/`,
    forwardSearch: false
  });
}

function createSettlementShareHtml(calendar) {
  return createShareHtml(calendar, {
    title: `${calendar.title} 정산`,
    description: `${calendar.title} 정산 내역을 확인해보세요.`,
    calendarUrl: `${BASE_URL}/?id=${encodeURIComponent(calendar.id)}&view=settlement`,
    shareUrl: `${BASE_URL}/share/${encodeURIComponent(calendar.id)}/settlement/`,
    forwardSearch: false
  });
}

async function main() {
  const calendars = await fetchCalendars();
  await rm(OUT_DIR, { recursive: true, force: true });
  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(path.join(OUT_DIR, '.nojekyll'), '');

  await Promise.all(calendars.map(async (calendar) => {
    const targetDir = path.join(OUT_DIR, calendar.id);
    const views = [
      ['', createCalendarShareHtml],
      ['chat', createChatShareHtml],
      ['places', createPlacesShareHtml],
      ['memo', createMemoShareHtml],
      ['gallery', createGalleryShareHtml],
      ['settlement', createSettlementShareHtml],
    ];
    for (const [seg, fn] of views) {
      const dir = seg ? path.join(targetDir, seg) : targetDir;
      await mkdir(dir, { recursive: true });
      await writeFile(path.join(dir, 'index.html'), fn(calendar));
    }
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
