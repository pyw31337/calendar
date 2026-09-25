import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

// app-main-split-units.md note: moving a name's body out of app-main.js is fine as long as an
// alias survives (`import { Name } from '...'` or `const { Name } = ...`) -- this check only
// greps for the name appearing in one of a few textual shapes (see requireOneOf below), it does
// not care where the real definition lives. Only remove a name from these lists once the split
// unit that moves it has actually landed and the alias is confirmed still present.

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const main = readFileSync(resolve(root, 'src/core/app-main.js'), 'utf8');
const utils = readFileSync(resolve(root, 'src/core/app-utils.js'), 'utf8');
const firebaseServices = readFileSync(resolve(root, 'src/core/firebase-services.js'), 'utf8');
const domainHelpers = readFileSync(resolve(root, 'src/core/app-domain-helpers.js'), 'utf8');

const requiredInMain = [
  'getPlaceSortDateKey',
  'unionPlaces',
  'parseVisitEntriesFromMemo',
  'sortVisitEntriesRecentFirst',
  'extractLeadingMemoDate',
  'normalizePlaceAddressForSave',
  'getPlaceExternalMapUrl',
  'getPlaceCategories',
  'AdminLoginGate',
  'PlacesView',
  'DateModal',
  'parseSharePathFromLocation',
  'getCalendarShareUrl',
  'getViewShareUrl',
  'getMessageImageEntries',
  'fetchRecentChatMessages',
  'fetchSubcollectionCount',
  'ChatGalleryModal',
  'PhotoGallery',
  'SummaryList',
  'fetchOlderChatMessages',
  'subscribePlaces'
];

// U10 moved the chat message window (live listener, gallery live window, watchdog, older
// history) out of CalendarApp into use-chat-message-window.js, so the realtime chat
// subscription is required there now.
const chatWindow = readFileSync(resolve(root, 'src/core/use-chat-message-window.js'), 'utf8');
const requiredInChatWindow = [
  'subscribeMessages',
  'fetchRecentChatMessages',
  'fetchOlderChatMessages'
];

const requiredInUtils = [
  'normalizePlaceAddressForSave',
  'isDomesticLatLng',
  'getPlaceExternalMapUrl',
  'formatPlaceBadgeDate',
  'formatConfirmedMeetingLabel',
  'isExpenseIncomeEntry',
  'normalizePlaceCategories',
  'reformatMemoIntoDateLines',
  'trimLatLngOutliers',
  'encodeGatherPlacesFragment',
  'GATHER_APP_UTILS'
];

const requiredInDomainHelpers = [
  'normalizePlaces',
  'getPhotoCommentIdentity',
  'getPhotoCommentCount'
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
for (const name of requiredInChatWindow) {
  if (!hasSymbol(chatWindow, name)) {
    console.error(`[check-required-symbols] MISSING in use-chat-message-window.js: ${name}`);
    failed = true;
  }
}
for (const name of requiredInUtils) {
  if (!hasSymbol(utils, name)) {
    console.error(`[check-required-symbols] MISSING in app-utils.js: ${name}`);
    failed = true;
  }
}
for (const name of requiredInDomainHelpers) {
  if (!hasSymbol(domainHelpers, name)) {
    console.error(`[check-required-symbols] MISSING in app-domain-helpers.js: ${name}`);
    failed = true;
  }
}
const requiredInFirebaseServices = [
  'fetchChatMessagesRest',
  'fetchRecentChatMessages',
  'fetchSubcollectionCount',
  'fetchOlderChatMessages',
  'fetchGalleryItemCount',
  'subscribeMessages',
  'subscribePlaces',
  'subscribeMemos',
  'subscribeAnniversaries'
];
for (const name of requiredInFirebaseServices) {
  if (!hasSymbol(firebaseServices, name)) {
    console.error(`[check-required-symbols] MISSING in firebase-services.js: ${name}`);
    failed = true;
  }
}
if (failed) process.exit(1);
console.log(`[check-required-symbols] OK (${requiredInMain.length} main, ${requiredInUtils.length} utils, ${requiredInDomainHelpers.length} domain, ${requiredInFirebaseServices.length} firebase-services)`);
