import fs from 'node:fs';

const firestore = fs.readFileSync('firestore.rules', 'utf8');
const storage = fs.readFileSync('storage.rules', 'utf8');

function assert(condition, message) {
  if (!condition) {
    console.error(`[rules-safety] failed: ${message}`);
    process.exit(1);
  }
}

assert(/match \/\{document=\*\*\}[\s\S]*allow read, write: if false;/.test(firestore), 'Firestore wildcard must remain deny-all');
assert(/match \/\{allPaths=\*\*\}[\s\S]*allow read, write: if false;/.test(storage), 'Storage wildcard must remain deny-all');
assert(!/allow\s+(?:read|write|read,\s*write)\s*:\s*if\s+true\s*;/.test(firestore), 'Firestore must not grant unconditional read/write');
assert(!/allow\s+(?:read|write|read,\s*write)\s*:\s*if\s+true\s*;/.test(storage), 'Storage must not grant unconditional read/write');
assert(/match \/calendars\/\{calendarDocId\}[\s\S]*allow get: if isCalendarDoc\(calendarDocId\);/.test(firestore), 'calendar reads must stay scoped to validated document IDs');
assert(/match \/messages\/\{messageId\}[\s\S]*allow get, list: if isCalendarDoc\(calendarDocId\);/.test(firestore), 'message reads must stay calendar-scoped');
assert(/match \/meetingPhotoIndex\/\{photoId\}[\s\S]*allow write: if false;/.test(firestore), 'meeting photo index must remain server-maintained');

console.log('[rules-safety] passed: wildcard denies, scoped calendar reads, and server-only index are intact');
