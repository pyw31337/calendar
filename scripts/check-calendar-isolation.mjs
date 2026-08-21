/**
 * Static calendar isolation checks (P3-4).
 */
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const main = readFileSync(resolve(root, 'src/core/app-main.js'), 'utf8');
const services = readFileSync(resolve(root, 'src/core/firebase-services.js'), 'utf8');
const utils = readFileSync(resolve(root, 'src/core/app-utils.js'), 'utf8');
const rules = readFileSync(resolve(root, 'firestore.rules'), 'utf8');

let failed = false;
function fail(msg) {
  console.error('[check-calendar-isolation]', msg);
  failed = true;
}
function ok(msg) {
  console.log('[check-calendar-isolation] OK:', msg);
}

const hardcoded = main.match(/calendars\/cal_(kkot|cw|jhair)\b/g) || [];
if (hardcoded.length) fail('hardcoded calendar doc path: ' + hardcoded.join(', '));
else ok('no hardcoded cal_kkot/cal_cw/cal_jhair data paths');

if (!/base\.id !== next\.id/.test(main) || !/Calendar ID mismatch/.test(main)) {
  fail('mergeCalendarRecord missing cross-calendar id guard');
} else ok('mergeCalendarRecord refuses different calendar ids');

for (const c of [
  'setOlderChatMessages([])',
  'setTotalChatCount(null)',
  'setTotalMemoCount(null)',
  'setTotalGalleryCount(null)',
  'setGalleryPreviewMessages([])'
]) {
  if (!main.includes(c)) fail('missing state clear: ' + c);
}
ok('chat/gallery state cleared on calendar switch');

if (!/cal_'\s*\+\s*calId/.test(services)) fail('firebase-services missing cal_ + calId');
else ok('firebase-services scopes paths with cal_ + calId');

if (!rules.includes("calendarDocId == 'cal_' + request.resource.data.calendar.id")) {
  fail('firestore.rules missing calendarDocId binding');
} else ok('firestore.rules binds document id to calendar.id');

if (!/function isValidCalendarId/.test(utils) && !/function isValidCalendarId/.test(main)) {
  fail('isValidCalendarId missing');
} else ok('isValidCalendarId present');

for (const name of ['subscribeMessages', 'subscribePlaces', 'subscribeMemos']) {
  if (!services.includes('function ' + name)) fail('missing ' + name);
}
ok('subscription helpers present');

if (failed) process.exit(1);
console.log('[check-calendar-isolation] all checks passed');
