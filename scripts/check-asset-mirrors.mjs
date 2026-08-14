import { existsSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

const MIRRORED_ASSETS = [
  'app-calendar-data.js',
  'app-chat-data.js',
  'app-config.js',
  'app-constants.js',
  'app-utils.js'
];

const REQUIRED_SCRIPT_ORDER = [
  'assets/app-constants.js',
  'assets/app-config.js',
  'assets/app-calendar-data.js',
  'assets/app-chat-data.js',
  'assets/app-utils.js'
];

function hashFile(path) {
  return createHash('sha256').update(readFileSync(path)).digest('hex');
}

for (const filename of MIRRORED_ASSETS) {
  const rootAsset = `assets/${filename}`;
  const publicAsset = `public/assets/${filename}`;
  const rootHash = hashFile(rootAsset);
  const publicHash = hashFile(publicAsset);

  if (rootHash !== publicHash) {
    console.error(`Asset mirror mismatch: ${rootAsset} and ${publicAsset} differ.`);
    process.exit(1);
  }
}

const indexHtml = readFileSync('index.html', 'utf8');
const referencedAssets = [...indexHtml.matchAll(/(?:href|src)="(assets\/[^"?]+)(?:\?[^"]*)?"/g)]
  .map(match => match[1]);

for (const assetPath of referencedAssets) {
  if (!existsSync(assetPath)) {
    console.error(`Missing referenced asset: ${assetPath}`);
    process.exit(1);
  }
}

let previousIndex = -1;
for (const assetPath of REQUIRED_SCRIPT_ORDER) {
  const scriptIndex = indexHtml.indexOf(`src="${assetPath}`);

  if (scriptIndex === -1) {
    console.error(`Missing required script reference: ${assetPath}`);
    process.exit(1);
  }

  if (scriptIndex <= previousIndex) {
    console.error(`Required script order is broken near: ${assetPath}`);
    process.exit(1);
  }

  previousIndex = scriptIndex;
}

const inlineAppIndex = indexHtml.indexOf('const GATHER_APP_CONSTANTS = window.GATHER_APP_CONSTANTS || {};');
if (inlineAppIndex === -1) {
  console.error('Missing inline app bootstrap marker: GATHER_APP_CONSTANTS.');
  process.exit(1);
}

if (inlineAppIndex <= previousIndex) {
  console.error('Inline app bootstrap must run after external app data scripts.');
  process.exit(1);
}

const staleInitialCalendarMarkers = [
  'CW_DEFAULT_CALENDAR',
  'KKOT_DEFAULT_CALENDAR',
  'gather_calendars_persistent',
  '8월 여름휴가 친목 모임',
  '친구들과 함께 떠나는 여름 휴가',
  '김민준',
  '예당호 착한농촌체험세상'
];

for (const marker of staleInitialCalendarMarkers) {
  if (indexHtml.includes(marker)) {
    console.error(`Stale initial calendar/demo data marker found: ${marker}`);
    process.exit(1);
  }
}

console.log('Asset mirror check passed.');
