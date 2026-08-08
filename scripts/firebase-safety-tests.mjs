import fs from 'node:fs';
import vm from 'node:vm';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const html = fs.readFileSync('index.html', 'utf8');
const script = html.match(/<script>([\s\S]*)<\/script>\s*<\/body>/)?.[1];
assert(script, 'index.html app script block not found');
assert(!/JSONBlob|jsonblob|localStorage|gather_calendars|FORCE_LOCAL_STORAGE/.test(script), 'app script must not use legacy browser or JSONBlob storage');
assert(!/8월 여름휴가|여름 휴가|하계휴가|친목 모임|꽃잎반 모임 \(cw\)/.test(script), 'app script must not include obsolete seed calendar copy');

function createContext(url) {
  const parsed = new URL(url);
  return {
    console,
    setTimeout,
    clearTimeout,
    URL,
    URLSearchParams,
    Blob,
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
        replaced: '',
        replaceState(_state, _title, nextUrl) {
          this.replaced = nextUrl;
        }
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

function runAppScript(context, extraSource) {
  vm.createContext(context);
  vm.runInContext(`${script}\n${extraSource}`, context);
}

const productionContext = createContext('https://pyw31337.github.io/calendar/share/kkot/');
runAppScript(productionContext, `
  if (!ENABLE_FIRESTORE_SYNC || !ENABLE_FIRESTORE_WRITES) throw new Error('production disabled Firestore-only mode');
  if (getCalendarIdFromURL() !== 'kkot') throw new Error('share path id parse failed');
  if (getCalendarShareUrl('cw') !== 'https://pyw31337.github.io/calendar/share/cw/') throw new Error('canonical share URL failed');
  if (!isValidCalendarId('kkot') || isValidCalendarId('../bad') || isValidCalendarId('bad!')) {
    throw new Error('calendar id validation failed');
  }
  if (!isAllowedCalendarId('kkot') || !isAllowedCalendarId('cw') || !isAllowedCalendarId('trip') || isAllowedCalendarId('../bad') || isAllowedCalendarId('bad!')) {
    throw new Error('calendar id allowlist failed');
  }
  const registeredText = formatRegisteredAt(new Date(2026, 7, 4, 4, 39, 12).getTime());
  if (registeredText !== '26.08.04 (화) 04:39:12') {
    throw new Error('registered timestamp formatter failed');
  }
`);

const restoreContext = createContext('https://pyw31337.github.io/calendar/?admin=1&restore=1');
runAppScript(restoreContext, `
  if (!isAdminDashboardRoute()) throw new Error('admin route detection failed');
  if (!isAdminRestoreRoute()) throw new Error('restore route detection failed');
`);

const concurrencyContext = createContext('https://pyw31337.github.io/calendar/?id=kkot');
runAppScript(concurrencyContext, `
  const participants = Array.from({ length: 8 }, (_, index) => ({
    id: 'kkot_p' + (index + 1),
    name: 'P' + (index + 1),
    color: '#EF4444',
    updatedAt: index + 1
  }));
  let kkot = { id: 'kkot', title: 'K', participants, availabilities: [], updatedAt: 1, revision: 1 };
  for (const participant of participants) {
    const incoming = {
      ...kkot,
      availabilities: [{
        date: '2026-08-29',
        participantId: participant.id,
        note: '<script>alert(1)</script> '.repeat(20),
        updatedAt: Date.now() + Number(participant.id.replace('kkot_p', ''))
      }]
    };
    kkot = mergeCalendarAvailabilityDelta(kkot, incoming, Date.now());
  }
  const active = getActiveAvailabilities(kkot);
  if (active.length !== 8) throw new Error('8 concurrent participant saves did not merge');
  const controlPattern = new RegExp('[\\\\u0000-\\\\u001F\\\\u007F]');
  if (active.some((item) => item.note.length > 120 || controlPattern.test(item.note))) {
    throw new Error('note sanitization failed');
  }
  const withNewParticipant = {
    ...kkot,
    participants: [...kkot.participants, { id: 'kkot_p9', name: 'P9', color: '#000000', updatedAt: 9999 }]
  };
  const staleSettings = {
    id: 'kkot',
    title: 'Stale title',
    participants: participants.map((participant) => ({ ...participant, updatedAt: participant.updatedAt })),
    availabilities: []
  };
  const settingsMerged = mergeCalendarSettingsDelta(withNewParticipant, staleSettings);
  if (!settingsMerged.participants.some((participant) => participant.id === 'kkot_p9')) {
    throw new Error('stale settings removed newer participant');
  }
  let crossCalendarRefused = false;
  try {
    mergeCalendarRecord({ id: 'kkot' }, { id: 'cw' });
  } catch (error) {
    crossCalendarRefused = true;
  }
  if (!crossCalendarRefused) throw new Error('cross-calendar merge was not refused');
  if (validateCalendarShape(settingsMerged)) throw new Error('merged settings did not validate');
  const activityLog = createActivityLog('kkot', 'update', '2026-08-29', 'kkot_p1', 1800000000000, '10시 천왕물놀이터');
  const pollActivityLog = createPollActivityLog('kkot', 'poll_vote', 'kkot_p1', 1800000000001, '장소 투표 / 천왕역모아엘가');
  const loggedCalendar = normalizeCalendarForSave({
    ...settingsMerged,
    activityLogs: [activityLog, pollActivityLog, {
      id: 'bad-cross-calendar-log',
      calendarId: 'cw',
      action: 'create',
      date: '2026-08-29',
      participantId: 'cw_p1',
      timestamp: 1800000000001
    }]
  });
  if (loggedCalendar.activityLogs.length !== 2) throw new Error('activity log isolation failed');
  if (loggedCalendar.activityLogs.some((log) => log.calendarId !== 'kkot')) throw new Error('activity log calendar id changed');
  if (!loggedCalendar.activityLogs.some((log) => log.note === '10시 천왕물놀이터')) throw new Error('activity log note snapshot failed');
  if (!loggedCalendar.activityLogs.some((log) => log.action === 'poll_vote' && log.note === '장소 투표 / 천왕역모아엘가')) {
    throw new Error('poll activity log was not normalized');
  }
  const displayLogs = buildActivityLogsFromAvailabilities(loggedCalendar);
  if (!displayLogs.some((log) => log.action === 'update' && log.participantId === 'kkot_p1')) {
    throw new Error('activity log display builder failed');
  }
  const hiddenLogCalendar = normalizeCalendarForSave({
    ...loggedCalendar,
    deletedActivityLogIds: [loggedCalendar.activityLogs[0].id]
  });
  if (buildActivityLogsFromAvailabilities(hiddenLogCalendar).some((log) => log.id === loggedCalendar.activityLogs[0].id)) {
    throw new Error('deleted activity log was still displayed');
  }
  const pollInput = normalizePollOptionInput('천왕역모아엘가 https://naver.me/54LbfTLU');
  if (pollInput.text !== '천왕역모아엘가' || pollInput.url !== 'https://naver.me/54LbfTLU') {
    throw new Error('poll option URL parsing failed');
  }
  const pollCalendar = normalizeCalendarForSave({
    ...settingsMerged,
    polls: [{
      id: 'kkot_poll_1',
      calendarId: 'kkot',
      title: '장소 투표',
      description: '모임 장소를 골라주세요',
      options: [{ id: 'kkot_poll_1_opt_1', text: '천왕역모아엘가', url: 'https://naver.me/54LbfTLU', inputValue: '천왕역모아엘가 https://naver.me/54LbfTLU', updatedAt: 1 }],
      votes: { kkot_p1: 'kkot_poll_1_opt_1', missing: 'kkot_poll_1_opt_1' },
      updatedAt: 1
    }, {
      id: 'cw_poll_bad',
      calendarId: 'cw',
      title: '잘못된 투표',
      options: [{ id: 'cw_opt_1', text: 'X', updatedAt: 1 }],
      votes: {},
      updatedAt: 1
    }]
  });
  if (pollCalendar.polls.length !== 1) throw new Error('poll calendar isolation failed');
  if (!Array.isArray(pollCalendar.polls[0].votes.kkot_poll_1_opt_1)) throw new Error('poll votes were not normalized by option');
  if (!pollCalendar.polls[0].votes.kkot_poll_1_opt_1.includes('kkot_p1')) throw new Error('valid poll vote was lost');
  if (pollCalendar.polls[0].votes.kkot_poll_1_opt_1.includes('missing')) throw new Error('invalid poll voter was kept');
  if ('inputValue' in pollCalendar.polls[0].options[0]) throw new Error('transient poll input value was stored');
  if (validateCalendarShape(pollCalendar)) throw new Error('valid poll calendar rejected');
  const pollDeltaLog = createPollActivityLog('kkot', 'poll_cancel', 'kkot_p1', 1800000000002, '장소 투표 / 천왕역모아엘가');
  const mergedPollDelta = mergeCalendarPollsDelta({
    ...settingsMerged,
    polls: [],
    activityLogs: []
  }, {
    ...settingsMerged,
    polls: pollCalendar.polls,
    activityLogs: [pollDeltaLog]
  }, 1800000000002);
  if (!mergedPollDelta.activityLogs.some((log) => log.action === 'poll_cancel')) {
    throw new Error('poll delta did not preserve activity logs');
  }
`);

const invalidContext = createContext('https://pyw31337.github.io/calendar/?id=cw');
runAppScript(invalidContext, `
  const valid = {
    id: 'cw',
    title: 'CW',
    participants: [{ id: 'cw_p1', name: '박영우', color: '#EF4444', updatedAt: 1 }],
    availabilities: [{ date: '2026-08-29', participantId: 'cw_p1', note: 'ok', updatedAt: 1 }]
  };
  if (validateCalendarShape(valid)) throw new Error('valid calendar rejected');
  if (validateCalendarShape({
    ...valid,
    activityLogs: [{ id: 'cw_log_1', calendarId: 'cw', action: 'create', date: '2026-08-29', participantId: 'cw_p1', note: 'ok', timestamp: 1 }]
  })) throw new Error('valid activity log rejected');
  if (validateCalendarShape({
    ...valid,
    activityLogs: [{ id: 'cw_poll_log_1', calendarId: 'cw', action: 'poll_create', note: '장소 투표', timestamp: 1 }]
  })) throw new Error('valid poll activity log rejected');
  if (!validateCalendarShape({
    ...valid,
    activityLogs: [{ id: 'cw_log_bad', calendarId: 'cw', action: 'create', date: '2026-08-29', participantId: 'missing', timestamp: 1 }]
  })) throw new Error('missing participant activity log accepted');
  if (!validateCalendarShape({ ...valid, id: 'cw!' })) throw new Error('bad id accepted');
  if (!validateCalendarShape({ ...valid, availabilities: [{ date: '2026-02-30', participantId: 'cw_p1' }] })) {
    throw new Error('bad date accepted');
  }
  if (!validateCalendarShape({ ...valid, availabilities: [{ date: '2026-08-29', participantId: 'missing' }] })) {
    throw new Error('missing participant accepted');
  }
`);

const adminMetricsContext = createContext('https://pyw31337.github.io/calendar/?admin=1');
runAppScript(adminMetricsContext, `
  const dashboard = buildAdminDashboardMetrics([{
    id: 'kkot',
    title: 'KKOT',
    participants: [
      { id: 'kkot_p1', name: 'A', color: '#EF4444' },
      { id: 'kkot_p2', name: 'B', color: '#3B82F6' }
    ],
    availabilities: [
      { date: '2026-08-10', participantId: 'kkot_p1', note: 'memo', updatedAt: 1 },
      { date: '2026-08-10', participantId: 'kkot_p2', note: '', updatedAt: 2 },
      { date: '2026-08-11', participantId: 'kkot_p1', note: '', deletedAt: 3, updatedAt: 3 }
    ],
    polls: [{
      id: 'kkot_poll_admin_1',
      calendarId: 'kkot',
      title: '장소 투표',
      options: [
        { id: 'kkot_poll_admin_1_opt_1', text: '천왕역', updatedAt: 1 },
        { id: 'kkot_poll_admin_1_opt_2', text: '오류역', updatedAt: 1 }
      ],
      votes: {
        kkot_poll_admin_1_opt_1: ['kkot_p1', 'kkot_p2'],
        kkot_poll_admin_1_opt_2: ['kkot_p2', 'missing']
      },
      updatedAt: 2
    }],
    updatedAt: 2,
    revision: 1
  }]);
  if (dashboard.totalParticipants !== 2) throw new Error('admin participant metric failed');
  if (dashboard.totalSchedules !== 2) throw new Error('admin active schedule metric failed');
  if (dashboard.calendarStats[0].fullDates.length !== 1) throw new Error('admin full-date metric failed');
  if (dashboard.calendarStats[0].deletedCount !== 1) throw new Error('admin deleted history metric failed');
  if (dashboard.calendarStats[0].memoCount !== 1) throw new Error('admin memo metric failed');
  if (dashboard.totalPolls !== 1) throw new Error('admin poll count metric failed');
  if (dashboard.totalPollOptions !== 2) throw new Error('admin poll option metric failed');
  if (dashboard.totalPollVotes !== 3) throw new Error('admin poll vote metric failed');
  if (dashboard.calendarStats[0].pollVoterCount !== 2) throw new Error('admin poll voter metric failed');
  if (!dashboard.serviceUsage || dashboard.serviceUsage.length < 4) throw new Error('admin service usage metrics missing');
  const backup = createCalendarBackupPayload([{
    id: 'kkot',
    title: 'KKOT',
    participants: [{ id: 'kkot_p1', name: 'A', color: '#EF4444', updatedAt: 1 }],
    availabilities: [{ date: '2026-08-10', participantId: 'kkot_p1', note: 'memo', updatedAt: 1 }],
    updatedAt: 2,
    revision: 1
  }], 'kkot');
  if (backup.calendars.length !== 1 || backup.calendars[0].data.calendar.id !== 'kkot') {
    throw new Error('admin backup payload failed');
  }
  const restored = validateBackupCalendars(extractCalendarsFromBackup(backup));
  if (restored.error || restored.calendars.length !== 1) throw new Error('admin backup import validation failed');
  const acceptedAnyValidId = validateBackupCalendars(extractCalendarsFromBackup({
    calendars: [{ id: 'trip', title: 'Trip', participants: [], availabilities: [] }]
  }));
  if (acceptedAnyValidId.error || acceptedAnyValidId.calendars.length !== 1) {
    throw new Error('admin backup import rejected a well-formed non-kkot/cw calendar id');
  }
  const rejected = validateBackupCalendars(extractCalendarsFromBackup({
    calendars: [{ id: 'bad id!', title: 'Bad', participants: [], availabilities: [] }]
  }));
  if (!rejected.error) throw new Error('admin backup import accepted malformed calendar id');
`);

const restContext = createContext('https://pyw31337.github.io/calendar/?id=cw');
const restCalls = [];
restContext.fetch = async (url, options = {}) => {
  restCalls.push({ url: String(url), options });
  if (String(url).includes('/documents/calendars/cal_cw')) {
    return {
      ok: true,
      json: async () => ({
        name: 'projects/metro-live-2918e/databases/(default)/documents/calendars/cal_cw',
        updateTime: '2026-08-03T00:00:00.000000Z',
        fields: {
          calendar: {
            mapValue: {
              fields: {
                id: { stringValue: 'cw' },
                title: { stringValue: 'CW' },
                participants: {
                  arrayValue: {
                    values: [{ mapValue: { fields: {
                      id: { stringValue: 'cw_p1' },
                      name: { stringValue: '박영우' },
                      color: { stringValue: '#EF4444' },
                      updatedAt: { integerValue: '1' }
                    } } }]
                  }
                },
                availabilities: { arrayValue: {} },
                updatedAt: { integerValue: '1' },
                revision: { integerValue: '1' }
              }
            }
          },
          lastModified: { integerValue: '1' },
          revision: { integerValue: '1' }
        }
      })
    };
  }
  if (String(url).endsWith('/documents:commit')) {
    return { ok: true, json: async () => ({ commitTime: '2026-08-03T00:00:01.000000Z' }) };
  }
  throw new Error(`unexpected fetch ${url}`);
};
runAppScript(restContext, `
  globalThis.__restPromise = pushSingleCalendarWithRest({
    id: 'cw',
    title: 'CW',
    participants: [{ id: 'cw_p1', name: '박영우', color: '#EF4444', updatedAt: 1 }],
    availabilities: [{ date: '2026-08-08', participantId: 'cw_p1', note: '<b>10시</b>', updatedAt: 2 }],
    updatedAt: 2,
    revision: 1
  }, 2, 'availability', 0);
`);
assert(await restContext.__restPromise === true, 'REST fallback did not report success');
const commitCall = restCalls.find((call) => call.url.endsWith('/documents:commit'));
assert(commitCall, 'REST fallback did not call Firestore commit');
const commitBody = JSON.parse(commitCall.options.body);
assert(commitBody.writes[0].update.name.endsWith('/calendars/cal_cw'), 'REST fallback wrote wrong document');
assert(commitBody.writes[0].currentDocument.updateTime, 'REST fallback missing update precondition');
assert(commitBody.writes[0].update.fields.calendar.mapValue.fields.id.stringValue === 'cw', 'REST fallback changed calendar id');
assert(commitBody.writes[0].update.fields.revision.integerValue === '2', 'REST fallback did not advance doc revision');

console.log('Firebase-only calendar safety tests passed');
