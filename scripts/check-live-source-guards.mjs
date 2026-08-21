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

if (!process.exitCode) {
  console.log('[check-live-source-guards] OK: live source guards passed');
}
