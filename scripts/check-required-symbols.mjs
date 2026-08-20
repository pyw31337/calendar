import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const main = readFileSync(resolve(root, 'assets/app-main.js'), 'utf8');
const utils = readFileSync(resolve(root, 'assets/app-utils.js'), 'utf8');
const firebaseServices = readFileSync(resolve(root, 'assets/firebase-services.js'), 'utf8');

const requiredInMain = [
  'getPlaceSortDateKey',
  'normalizePlaces',
  'unionPlaces',
  'parseVisitEntriesFromMemo',
  'reformatMemoIntoDateLines',
  'sortVisitEntriesRecentFirst',
  'extractLeadingMemoDate',
  'normalizePlaceAddressForSave',
  'isDomesticLatLng',
  'getPlaceExternalMapUrl',
  'formatPlaceBadgeDate',
  'isExpenseIncomeEntry',
  'getDisplayExpenseCategory',
  'getPlaceCategories',
  'AdminLoginGate',
  'PlacesView',
  'DateModal',
  'trimLatLngOutliers',
  'parseSharePathFromLocation',
  'getCalendarShareUrl',
  'getViewShareUrl',
  'getMessageImageEntries',
  'fetchGalleryItemCount',
  'fetchRecentChatMessages',
  'fetchSubcollectionCount',
  'ChatGalleryModal',
  'PhotoGallery',
  'SummaryList',
  'fetchOlderChatMessages'
];

const requiredInUtils = [
  'normalizePlaceAddressForSave',
  'isDomesticLatLng',
  'getPlaceExternalMapUrl',
  'formatPlaceBadgeDate',
  'isExpenseIncomeEntry',
  'normalizePlaceCategories',
  'GATHER_APP_UTILS'
];

function hasSymbol(source, name) {
  return (
    new RegExp(`function\\s+${name}\\s*\\(`).test(source) ||
    new RegExp(`const\\s+${name}\\s*=`).test(source) ||
    new RegExp(`let\\s+${name}\\s*=`).test(source) ||
    source.includes(name)
  );
}

let failed = false;
for (const name of requiredInMain) {
  if (!hasSymbol(main, name)) {
    console.error(`[check-required-symbols] MISSING in app-main.js: ${name}`);
    failed = true;
  }
}
for (const name of requiredInUtils) {
  if (!hasSymbol(utils, name)) {
    console.error(`[check-required-symbols] MISSING in app-utils.js: ${name}`);
    failed = true;
  }
}
const requiredInFirebaseServices = [
  'fetchChatMessagesRest',
  'fetchRecentChatMessages',
  'fetchSubcollectionCount',
  'fetchOlderChatMessages',
  'fetchGalleryItemCount'
];
for (const name of requiredInFirebaseServices) {
  if (!hasSymbol(firebaseServices, name)) {
    console.error(`[check-required-symbols] MISSING in firebase-services.js: ${name}`);
    failed = true;
  }
}
if (failed) process.exit(1);
console.log(`[check-required-symbols] OK (${requiredInMain.length} main, ${requiredInUtils.length} utils, ${requiredInFirebaseServices.length} firebase-services)`);
