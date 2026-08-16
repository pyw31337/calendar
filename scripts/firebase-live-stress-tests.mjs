import fs from 'node:fs';
import vm from 'node:vm';

const PROJECT_ID = 'metro-live-2918e';
const DATABASE = '(default)';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

// The app's main logic lives in assets/app-main.js (externalized from index.html's inline
// <script> -- see check-tab-wiring.mjs for the rationale). It reads helpers off the
// window.GATHER_APP_UTILS global that assets/app-utils.js populates in the real page, so that
// script has to run first here too (mirrors restore-rehearsal.mjs/firebase-safety-tests.mjs's
// setup) -- without it, GATHER_APP_UTILS resolves to {} and any cloneCalendar()/cloneActivityLog()
// call site throws "undefined is not a function" the first time a save actually exercises it.
const script = fs.readFileSync('assets/app-main.js', 'utf8');
const utilsScript = fs.readFileSync('assets/app-utils.js', 'utf8');
assert(script, 'assets/app-main.js not found');

function createContext(url) {
  const parsed = new URL(url);
  return {
    console,
    fetch,
    setTimeout,
    clearTimeout,
    URL,
    URLSearchParams,
    alert() {},
    window: {
      location: {
        hostname: parsed.hostname,
        search: parsed.search,
        href: parsed.href,
        origin: parsed.origin,
        pathname: parsed.pathname
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
        throw new Error('production localStorage read');
      },
      setItem() {
        throw new Error('production localStorage write');
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
}

function runAppScript(context, extraSource = '') {
  vm.createContext(context);
  vm.runInContext(`${utilsScript}\n${script}\n${extraSource}`, context);
}

async function fetchCalendarDoc(calendarId) {
  const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/${DATABASE}/documents/calendars/cal_${calendarId}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`failed to fetch ${calendarId}: ${response.status} ${await response.text()}`);
  }
  return response.json();
}

const stamp = `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
const testCalendars = [
  { id: `stress_kkot_${stamp}`, title: 'Stress KKOT' },
  { id: `stress_cw_${stamp}`, title: 'Stress CW' }
];

async function runCalendarStress(target) {
  const context = createContext(`https://pyw31337.github.io/calendar/?id=${target.id}`);
  context.window.__ALLOW_INTERNAL_TEST_CALENDARS__ = true;
  runAppScript(context, `
    const colors = ['#EF4444', '#3B82F6', '#10B981', '#EC4899', '#8B5CF6', '#F59E0B', '#14B8A6', '#64748B'];
    const participants = Array.from({ length: 8 }, (_, index) => ({
      id: '${target.id}_p' + (index + 1),
      name: '${target.id}_참여자_' + (index + 1),
      color: colors[index],
      updatedAt: ${Date.now()} + index
    }));
    const baseCalendar = {
      id: '${target.id}',
      title: '${target.title}',
      description: 'live stress test',
      participants,
      availabilities: [],
      updatedAt: ${Date.now()},
      revision: 1
    };

    async function saveAvailability(participant, date, note, stamp, deletedAt = null) {
      return pushSingleCalendarWithRest({
        ...baseCalendar,
        availabilities: [{
          date,
          participantId: participant.id,
          note,
          updatedAt: stamp,
          deletedAt
        }],
        updatedAt: stamp,
        revision: 1
      }, stamp, 'availability', 18);
    }

    async function participantWorker(participant, index) {
      const failures = [];
      for (let round = 0; round < 4; round += 1) {
        const date = '2026-08-' + String(10 + round).padStart(2, '0');
        const createStamp = Date.now() + index * 1000 + round * 10;
        if (!await saveAvailability(participant, date, 'create ' + participant.id + ' <script>x</script>', createStamp)) {
          failures.push('create:' + participant.id + ':' + date);
        }
        const updateStamp = createStamp + 1;
        if (!await saveAvailability(participant, date, 'update ' + participant.id + ' / 특수문자 <> {} [] & '.repeat(4), updateStamp)) {
          failures.push('update:' + participant.id + ':' + date);
        }
        if (round % 2 === 1) {
          const deleteStamp = updateStamp + 1;
          if (!await saveAvailability(participant, date, '', deleteStamp, deleteStamp)) {
            failures.push('delete:' + participant.id + ':' + date);
          }
        }
      }
      return failures;
    }

    async function settingsWorker() {
      const nextParticipant = {
        id: '${target.id}_p9',
        name: '${target.id}_추가참여자',
        color: '#111827',
        updatedAt: Date.now() + 900000
      };
      const payload = {
        ...baseCalendar,
        title: '${target.title} Updated',
        participants: [...participants, nextParticipant],
        updatedAt: Date.now() + 900000,
        revision: 1
      };
      return pushSingleCalendarWithRest(payload, payload.updatedAt, 'settings', 18);
    }

    globalThis.__stressPromise = (async () => {
      const seedOk = await pushSingleCalendarWithRest(baseCalendar, baseCalendar.updatedAt, 'availability', 18);
      if (!seedOk) throw new Error('seed failed for ${target.id}');
      const participantResults = await Promise.all(participants.map((participant, index) => participantWorker(participant, index)));
      const settingsOk = await settingsWorker();
      return [
        ...participantResults.flat().filter(Boolean),
        ...(settingsOk ? [] : ['settings'])
      ];
    })();
  `);
  const failures = await context.__stressPromise;
  assert(failures.length === 0, `${target.id} worker failures: ${failures.join(', ')}`);
}

await Promise.all(testCalendars.map(runCalendarStress));

for (const target of testCalendars) {
  const context = createContext(`https://pyw31337.github.io/calendar/?id=${target.id}`);
  context.window.__ALLOW_INTERNAL_TEST_CALENDARS__ = true;
  runAppScript(context, `
    globalThis.__decode = (doc) => firestoreDocumentToJs(doc);
    globalThis.__activeParticipants = (calendar) => getActiveParticipants(calendar);
    globalThis.__activeAvailabilities = (calendar) => getActiveAvailabilities(calendar);
    globalThis.__validate = (calendar) => validateCalendarShape(calendar);
  `);
  const doc = await fetchCalendarDoc(target.id);
  const decoded = context.__decode(doc);
  const calendar = decoded.calendar;
  assert(calendar.id === target.id, `${target.id} decoded as wrong calendar ${calendar.id}`);
  assert(context.__validate(calendar) === '', `${target.id} failed final validation: ${context.__validate(calendar)}`);
  const activeParticipants = context.__activeParticipants(calendar);
  const activeAvailabilities = context.__activeAvailabilities(calendar);
  const expectedDates = new Set(['2026-08-10', '2026-08-12']);
  assert(activeParticipants.length === 9, `${target.id} expected 9 active participants, got ${activeParticipants.length}`);
  assert(activeAvailabilities.length === 16, `${target.id} expected 16 active availabilities, got ${activeAvailabilities.length}`);
  assert(activeAvailabilities.every((item) => expectedDates.has(item.date)), `${target.id} deleted dates are still active`);
  assert(activeAvailabilities.every((item) => item.participantId.startsWith(`${target.id}_p`)), `${target.id} contains foreign participant IDs`);
  assert(activeAvailabilities.every((item) => !/[\u0000-\u001F\u007F]/.test(item.note || '') && (item.note || '').length <= 120), `${target.id} contains unsanitized notes`);
  target.summary = {
    id: target.id,
    docRevision: decoded.revision,
    calendarRevision: calendar.revision,
    activeParticipants: activeParticipants.length,
    activeAvailabilities: activeAvailabilities.length,
    storedAvailabilities: calendar.availabilities.length
  };
}

const [firstDoc, secondDoc] = await Promise.all(testCalendars.map((target) => fetchCalendarDoc(target.id)));
assert(firstDoc.name.endsWith(`cal_${testCalendars[0].id}`), 'first test doc path mismatch');
assert(secondDoc.name.endsWith(`cal_${testCalendars[1].id}`), 'second test doc path mismatch');

console.log(JSON.stringify({
  ok: true,
  calendars: testCalendars.map((target) => target.summary)
}, null, 2));
