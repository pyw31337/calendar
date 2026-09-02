import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = process.cwd();
const SRC_DIR = join(ROOT, 'src');

const BLOCKED_SOURCE_PATTERNS = [
  {
    pattern: /\bJSONBlob\b|jsonblob\.com|jsonblob/i,
    message: 'JSONBlob must not be reintroduced as an app persistence path.'
  },
  {
    pattern: /calendars\/cal_(kkot|cw|jhair)\b/,
    message: 'Calendar document paths must be derived from the current calendar id.'
  },
  {
    pattern: /8월 여름휴가|여름 휴가|하계휴가|친목 모임|꽃잎반 모임 \(cw\)/,
    message: 'Obsolete demo calendar copy must not ship in live source.'
  },
  {
    pattern: /gather_calendars_persistent|FORCE_LOCAL_STORAGE|gather_calendars_v1/,
    message: 'Legacy browser-storage persistence keys must not be used.'
  }
];

const REQUIRED_MAIN_ORDER = [
  './core/app-constants.js',
  './core/app-config.js',
  './core/app-calendar-data.js',
  './core/app-chat-data.js',
  './core/app-utils.js',
  './core/app-notifications.js',
  './core/firebase-services.js',
  './core/app-main.js'
];

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) out.push(...walk(full));
    else if (/\.(js|jsx|css|html)$/.test(entry)) out.push(full);
  }
  return out;
}

function fail(message) {
  console.error(`[check-live-source-guards] ${message}`);
  process.exitCode = 1;
}

for (const file of walk(SRC_DIR)) {
  const rel = relative(ROOT, file);
  const source = readFileSync(file, 'utf8');
  for (const { pattern, message } of BLOCKED_SOURCE_PATTERNS) {
    const match = source.match(pattern);
    if (match) {
      fail(`${rel}: ${message} Found "${match[0]}".`);
    }
  }
}

const mainEntry = readFileSync(join(ROOT, 'src/main.jsx'), 'utf8');
let lastIndex = -1;
for (const importPath of REQUIRED_MAIN_ORDER) {
  const index = mainEntry.indexOf(importPath);
  if (index === -1) {
    fail(`src/main.jsx is missing required import: ${importPath}`);
    continue;
  }
  if (index <= lastIndex) {
    fail(`src/main.jsx import order is unsafe near: ${importPath}`);
  }
  lastIndex = index;
}

if (!mainEntry.includes('window.__gatherStartApp()')) {
  fail('src/main.jsx must call window.__gatherStartApp() after dependencies load.');
}

const appMain = readFileSync(join(ROOT, 'src/core/app-main.js'), 'utf8');
const firebaseServices = readFileSync(join(ROOT, 'src/core/firebase-services.js'), 'utf8');
const firebaseData = readFileSync(join(ROOT, 'src/core/app-firebase-data.js'), 'utf8');
// app-main.js was split into these two in a later refactor (each has its own manualChunks entry
// in vite.config.js), so which file a given piece of core logic lives in has shifted and can
// shift again -- appMainAndData covers the whole split for "must contain" checks below.
const appMainAndData = appMain
  + '\n' + readFileSync(join(ROOT, 'src/core/app-domain-helpers.js'), 'utf8')
  + '\n' + readFileSync(join(ROOT, 'src/core/app-firebase-data.js'), 'utf8');
const adminDashboard = readFileSync(join(ROOT, 'src/ui/ui-admin-dashboard.js'), 'utf8');
const adminModals = readFileSync(join(ROOT, 'src/ui/ui-admin-modals.js'), 'utf8');
const rootIndex = readFileSync(join(ROOT, 'index.html'), 'utf8');
const serviceWorker = readFileSync(join(ROOT, 'sw.js'), 'utf8');
const copyStatic = readFileSync(join(ROOT, 'scripts/copy-static-to-dist.mjs'), 'utf8');

if (!/function getAdminSelectedCalendarIdFromUrl\(fallback = 'kkot'\)/.test(appMainAndData)) {
  fail('Admin dashboard must read its selected calendar from ?id= so refresh keeps the selected calendar.');
}

if (!/(function|const)\s+syncSelectedCalendarUrl\b[\s\S]{0,80}calId[\s\S]{0,80}mode = 'replace'/.test(adminDashboard)) {
  fail('Admin dashboard must sync selected calendar changes back to the URL.');
}

if (!/params\.set\('admin', '1'\)/.test(adminDashboard) || !/params\.set\('id', calId\)/.test(adminDashboard)) {
  fail('Admin calendar URL sync must preserve admin=1 and write id=<calendarId>.');
}

if (!/React\.useState\(\(\) => getAdminSelectedCalendarIdFromUrl\('kkot'\)\)/.test(adminDashboard)) {
  fail('Admin selected calendar state must initialize from the URL.');
}

if (/setActiveTab\('calendar'\)|activeTab === 'calendar'/.test(adminModals)) {
  fail('Calendar settings modal must not expose the removed empty 일정/calendar tab.');
}

const adminModalTabHandlers = [...adminModals.matchAll(/setActiveTab\('([^']+)'\)/g)].map(match => match[1]);
// 일반 / 투표 / 복구 / 로그 -- 기념일 tab was split out into its own top-level side-menu entry
// (기념일 설정, see MainSideMenu in ui-side-menu.js) since nesting it here was accumulating
// too many sub-tabs inside a single settings modal. 투표 was later split out of the 일반 tab
// into its own tab for the same reason.
const allowedAdminModalTabs = new Set(['settings', 'polls', 'recovery', 'logs']);
const unexpectedAdminModalTabs = adminModalTabHandlers.filter(tab => !allowedAdminModalTabs.has(tab));
if (unexpectedAdminModalTabs.length > 0) {
  fail(`Calendar settings modal has unexpected tab handler(s): ${unexpectedAdminModalTabs.join(', ')}`);
}
if (adminModalTabHandlers.length !== 4) {
  fail(`Calendar settings modal must render exactly 4 tabs (settings/polls/recovery/logs), found ${adminModalTabHandlers.length}.`);
}

for (const requiredTab of ["setActiveTab('settings')", "setActiveTab('polls')", "setActiveTab('recovery')", "setActiveTab('logs')"]) {
  if (!adminModals.includes(requiredTab)) {
    fail(`Calendar settings modal is missing required tab handler: ${requiredTab}`);
  }
}

if (!rootIndex.includes("jhair: 'manifest-jhair.json'")) {
  fail('index.html must select manifest-jhair.json for the jhair calendar.');
}

if (!serviceWorker.includes("'manifest-jhair.json'")) {
  fail('sw.js must include manifest-jhair.json in its static asset list.');
}

if (/cache\.addAll\(STATIC_ASSETS\)/.test(serviceWorker)) {
  fail('sw.js must not let one failed static asset abort the whole service-worker install.');
}

if (/BACKGROUND_NETWORK_PAUSE_MS|networkPausedForBackground|Firestore background pause notice/.test(appMain)) {
  fail('app-main must not disable Firestore while a browser tab is hidden; it can make resumed tabs look empty.');
}

const localCacheLoader = firebaseData.match(/function loadLocalCache\(\)\s*\{([\s\S]*?)\n\}/);
const localCacheSaver = firebaseData.match(/function saveLocalCache\(list\)\s*\{([\s\S]*?)\n\}/);
if (!localCacheLoader || !/return \[\];/.test(localCacheLoader[1])) {
  fail('calendar local cache loader must remain disabled and return an empty list.');
}
if (!localCacheSaver || !/Intentionally no-op/.test(localCacheSaver[1])) {
  fail('calendar local cache saver must remain a no-op.');
}
if (!/if \(isDocument\) \{[\s\S]{0,180}fetch\(req, \{ cache: 'no-store' \}\)/.test(serviceWorker)) {
  fail('service worker document navigations must bypass browser HTTP cache.');
}
const appUtils = readFileSync(join(ROOT, 'src/core/app-utils.js'), 'utf8');
if (!/function getPersistentBrokenPhotoUrls\(\)\s*\{[\s\S]{0,500}return new Set\(\);[\s\S]{0,120}\}/.test(appUtils)
  || !/function savePersistentBrokenPhotoUrl\(urlOrKey\)\s*\{[\s\S]{0,180}Intentionally no-op/.test(appUtils)) {
  fail('broken-photo URL persistence must remain disabled so transient failures do not hide repaired media.');
}
if (!/function invalidateGalleryItemCount\(calId\)/.test(firebaseServices)
  || !/invalidateGalleryItemCount: invalidateGalleryItemCount/.test(firebaseServices)) {
  fail('gallery count cache invalidation must remain available from Firebase services.');
}
if (!/function invalidateGalleryItemCount\(calId\)/.test(firebaseData)
  || !/invalidateGalleryItemCount,/.test(firebaseData)) {
  fail('gallery count cache invalidation must remain bridged to app-main.');
}
if ((appMain.match(/invalidateGalleryItemCount\(activeCalId\)/g) || []).length < 3) {
  fail('gallery count cache must be invalidated for realtime, add, and delete message paths.');
}
if (!/orderBy\('timestamp', 'desc'\)\.limit\(80\);[\s\S]{0,160}const snap = await (?:q\.get\(\{ source: 'server' \}\)|withSdkTimeout\(q\.get\(\{ source: 'server' \}\), FIRESTORE_REST_TIMEOUT_MS\))/.test(firebaseServices)) {
  fail('gallery count pages must read from the Firestore server, not the persistent SDK cache.');
}

for (const manifestFile of ['manifest.json', 'manifest-kkot.json', 'manifest-cw.json', 'manifest-jhair.json']) {
  if (!copyStatic.includes(manifestFile)) {
    fail(`copy-static-to-dist must copy ${manifestFile} into dist.`);
  }
}

if (!process.exitCode) {
  console.log('[check-live-source-guards] OK: live source guards passed');
}
