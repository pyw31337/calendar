import fs from 'node:fs';
import vm from 'node:vm';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

// The app's main logic lives in assets/app-main.js (externalized from index.html's inline
// <script> -- see check-tab-wiring.mjs for the rationale). It reads helpers off the
// window.GATHER_APP_UTILS global that assets/app-utils.js populates in the real page, so that
// script has to run first here too (mirrors firebase-safety-tests.mjs's setup).
const script = fs.readFileSync('assets/app-main.js', 'utf8');
const utilsScript = fs.readFileSync('assets/app-utils.js', 'utf8');
assert(script, 'assets/app-main.js not found');

const context = {
  console,
  setTimeout,
  clearTimeout,
  URL,
  URLSearchParams,
  Blob,
  alert() {},
  window: {
    location: {
      hostname: 'pyw31337.github.io',
      search: '?admin=1&restore=1',
      href: 'https://pyw31337.github.io/calendar/?admin=1&restore=1',
      origin: 'https://pyw31337.github.io',
      pathname: '/calendar/'
    },
    history: {
      replaceState() {}
    }
  },
  document: {
    getElementById() {
      return null;
    }
  },
  localStorage: {
    getItem() {
      throw new Error('restore rehearsal must not read localStorage');
    },
    setItem() {
      throw new Error('restore rehearsal must not write localStorage');
    },
    removeItem() {},
    key() {
      return null;
    },
    length: 0
  },
  firebase: undefined,
  React: {
    createElement() {
      return {};
    },
    useState(value) {
      return [typeof value === 'function' ? value() : value, () => {}];
    },
    useEffect(callback) {
      callback();
    },
    useRef(value) {
      return { current: value };
    },
    useMemo(callback) {
      return callback();
    }
  },
  ReactDOM: {
    createRoot() {
      return { render() {} };
    }
  }
};

vm.createContext(context);

vm.runInContext(`${utilsScript}
${script}
  const rehearsalClock = Date.UTC(2026, 7, 4, 0, 0, 0);
  const existingCalendar = {
    id: 'kkot',
    title: '기존 리허설 캘린더',
    description: '복구 전 상태',
    participants: [
      { id: 'kkot_rehearsal_p1', name: '기존 참여자', color: '#EF4444', updatedAt: rehearsalClock - 5000 },
      { id: 'kkot_rehearsal_p2', name: '삭제될 참여자', color: '#3B82F6', removedAt: rehearsalClock - 4000, updatedAt: rehearsalClock - 4000 }
    ],
    availabilities: [
      { date: '2026-08-10', participantId: 'kkot_rehearsal_p1', note: '기존 일정', updatedAt: rehearsalClock - 3000 },
      { date: '2026-08-11', participantId: 'kkot_rehearsal_p1', note: '삭제된 일정', deletedAt: rehearsalClock - 2000, updatedAt: rehearsalClock - 2000 }
    ],
    updatedAt: rehearsalClock - 1000,
    revision: 2
  };
  const restoredCalendar = {
    id: 'kkot',
    title: '복구 리허설 임시 캘린더',
    description: '운영 Firestore에 쓰지 않는 로컬 복구 리허설',
    participants: [
      { id: 'kkot_rehearsal_p1', name: '복구 참여자', color: '#10B981', updatedAt: rehearsalClock + 1000 }
    ],
    availabilities: [
      { date: '2026-08-10', participantId: 'kkot_rehearsal_p1', note: '복구 일정', updatedAt: rehearsalClock + 2000 },
      { date: '2026-08-12', participantId: 'kkot_rehearsal_p1', note: '추가 일정', updatedAt: rehearsalClock + 3000 }
    ],
    updatedAt: rehearsalClock + 4000,
    revision: 9
  };
  const backup = createCalendarBackupPayload([restoredCalendar], 'kkot');
  const extracted = extractCalendarsFromBackup(backup);
  const validation = validateBackupCalendars(extracted);
  if (validation.error) throw new Error(validation.error);
  const merged = mergeCalendarCollections([existingCalendar], validation.calendars, { replaceMatchingId: true })[0];
  if (merged.id !== 'kkot') throw new Error('calendar id changed during restore rehearsal');
  if (merged.title !== '복구 리허설 임시 캘린더') throw new Error('restored title was not applied');
  if (!merged.participants.some((item) => item.id === 'kkot_rehearsal_p1' && item.name === '복구 참여자' && item.color === '#10B981')) {
    throw new Error('participant rename/color restore failed');
  }
  if (!merged.participants.some((item) => item.id === 'kkot_rehearsal_p2' && item.removedAt)) {
    throw new Error('removed participant history was not preserved');
  }
  if (!merged.availabilities.some((item) => item.date === '2026-08-11' && item.deletedAt)) {
    throw new Error('deleted availability history was not preserved');
  }
  if (getActiveAvailabilities(merged).length !== 2) throw new Error('active availability restore count failed');
  if (validateCalendarShape(merged)) throw new Error('merged rehearsal calendar failed shape validation');

  // Exercise the v2 payload shape used by the user/admin backup controls. Collections are
  // intentionally kept as independent documents so restoring one calendar replaces stale
  // subcollection records instead of silently falling back to embedded legacy fields.
  const collectionNames = ['messages', 'memos', 'places', 'confirmedMeetings', 'activityLogs', 'anniversaries'];
  const collectionPayload = Object.fromEntries(collectionNames.map((name, index) => [name, [
    { docId: 'kkot_rehearsal_' + name + '_1', data: { id: 'kkot_rehearsal_' + name + '_1', kind: name, index } }
  ]]));
  const fullBackup = {
    type: 'gather-calendar-data-backup',
    version: 2,
    projectId: 'metro-live-2918e',
    calendars: [{
      docId: 'cal_kkot',
      data: { calendar: restoredCalendar, lastModified: restoredCalendar.updatedAt, revision: restoredCalendar.revision },
      collections: collectionPayload
    }]
  };
  const fullEntries = extractCalendarBackupEntries(fullBackup);
  const fullValidation = validateCalendarBackupEntries(fullEntries);
  if (fullValidation.error || fullValidation.entries.length !== 1) throw new Error('full backup validation failed');
  const restoredCollections = fullValidation.entries[0].collections || {};
  for (const name of collectionNames) {
    if (restoredCollections[name]?.[0]?.data?.kind !== name) {
      throw new Error(name + ' collection restore shape failed');
    }
  }
  globalThis.__restoreRehearsalResult = {
    calendarId: merged.id,
    restoredTitle: merged.title,
    participants: getActiveParticipants(merged).length,
    activeAvailabilities: getActiveAvailabilities(merged).length,
    preservedRemovedParticipants: merged.participants.filter((item) => item.removedAt).length,
    preservedDeletedAvailabilities: merged.availabilities.filter((item) => item.deletedAt).length,
    restoredCollections: Object.fromEntries(collectionNames.map((name) => [name, restoredCollections[name].length])),
    backupBytes: JSON.stringify(backup).length
  };
`, context);

console.log(JSON.stringify(context.__restoreRehearsalResult, null, 2));
