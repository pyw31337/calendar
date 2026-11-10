// ensurePushSubscriptionHealthy end to end against an in-memory browser + Firestore: the phone
// state found on 2026-11-01 (Samsung Internet app, registered in cw at 09:27, jhair still holding
// three rows for endpoints the 10-28 repair had already thrown away).
import test from 'node:test';
import assert from 'node:assert/strict';

const rows = new Map(); // `${calendarId}/${subId}` -> data
const storage = new Map();
let current = null;
let rotations = 0;
let nextEndpoint = 1;

function makeSubscription(endpoint) {
  return {
    endpoint,
    getKey: () => new Uint8Array([1, 2, 3]).buffer,
    async unsubscribe() { if (current === this) current = null; return true; }
  };
}

function rowsOf(calendarId) {
  return Array.from(rows.entries())
    .filter(([key]) => key.startsWith(`${calendarId}/`))
    .map(([key, data]) => ({ id: key.slice(calendarId.length + 1), ...data }));
}

const fakeDb = {
  collection: () => ({
    doc: calendarDocId => ({
      collection: () => ({
        doc: subId => ({
          async get() {
            const key = `${calendarDocId.replace(/^cal_/, '')}/${subId}`;
            return { exists: rows.has(key), data: () => rows.get(key) };
          }
        }),
        where: (field, op, value) => ({
          async get() {
            const calendarId = calendarDocId.replace(/^cal_/, '');
            const docs = rowsOf(calendarId).filter(row => row[field] === value)
              .map(({ id, ...data }) => ({ id, data: () => data }));
            return { docs };
          }
        })
      })
    })
  })
};

const pushManager = {
  async getSubscription() { return current; },
  async subscribe() {
    rotations += 1;
    current = makeSubscription(`https://fcm.example/send/new-${nextEndpoint++}`);
    return current;
  }
};

Object.defineProperty(globalThis, 'navigator', {
  configurable: true,
  value: { userAgent: 'SamsungBrowser test', serviceWorker: { ready: Promise.resolve({ pushManager }) } }
});
globalThis.Notification = { permission: 'granted' };
globalThis.window = {
  isSecureContext: true,
  btoa: value => Buffer.from(value, 'binary').toString('base64'),
  atob: value => Buffer.from(value, 'base64').toString('binary'),
  addEventListener() {},
  location: { href: 'https://x/calendar/', pathname: '/calendar/', search: '' },
  localStorage: {
    get length() { return storage.size; },
    key: i => Array.from(storage.keys())[i] ?? null,
    getItem: key => (storage.has(key) ? storage.get(key) : null),
    setItem: (key, value) => storage.set(key, String(value)),
    removeItem: key => storage.delete(key)
  },
  __gatherFirebaseDb: fakeDb,
  GATHER_APP_NOTIFICATIONS: {
    isNotificationSupported: () => true,
    isChatNotifyEnabledForCalendar: () => true,
    getOrCreateDeviceId: () => 'dev_phone',
    getDeviceLabel: () => 'Android · 삼성 인터넷 (앱)',
    getNotifyChannels: () => ({ chat: true, comment: true, memo: true, poll: true, schedule: true }),
    classifyPushSubscribeError: err => String(err && err.message)
  },
  GATHER_UI_DEPS: {
    async writeCollectionDocumentWithFallback(_collection, calendarId, docId, data, mode) {
      const key = `${calendarId}/${docId}`;
      if (mode === 'delete') rows.delete(key);
      else rows.set(key, { ...(rows.get(key) || {}), ...data });
      return { success: true };
    }
  }
};
globalThis.document = { addEventListener() {}, visibilityState: 'visible' };

const { ensurePushSubscriptionHealthy } = await import('../src/core/app-domain-helpers.js');

function endpointsOf(calendarId, deviceId = 'dev_phone') {
  return rowsOf(calendarId).filter(row => row.deviceId === deviceId).map(row => row.endpoint).sort();
}

test('the found phone state: cw keeps its endpoint and jhair is pointed at it, dead rows removed', async () => {
  current = makeSubscription('https://fcm.example/send/cw-0927');
  // cw: the live row the 09:27 visit wrote.
  const live = await ensurePushSubscriptionHealthy('cw', 'cw_p_young');
  assert.equal(live.ok, true, JSON.stringify(live));
  // jhair: three rows for endpoints already replaced, plus another person's Mac.
  for (const [i, endpoint] of ['dead-1', 'dead-2', 'dead-3'].entries()) {
    rows.set(`jhair/sub_dead_${i}`, { endpoint: `https://fcm.example/send/${endpoint}`, deviceId: 'dev_phone', participantId: 'jh_p_young' });
  }
  rows.set('jhair/sub_mac', { endpoint: 'https://fcm.example/send/mac', deviceId: 'dev_mac', participantId: 'jh_p_young' });
  storage.set('gather_push_health_jhair', JSON.stringify({ subId: 'sub_dead_2', participantId: 'jh_p_young' }));
  rotations = 0;

  const result = await ensurePushSubscriptionHealthy('cw', 'cw_p_young');
  assert.equal(result.ok, true);
  assert.equal(rotations, 0, 'the shared subscription is kept');
  assert.deepEqual(endpointsOf('cw'), ['https://fcm.example/send/cw-0927']);
  assert.deepEqual(endpointsOf('jhair'), ['https://fcm.example/send/cw-0927'], 'jhair now sends to the live endpoint only');
  assert.equal(rowsOf('jhair').find(row => row.endpoint.endsWith('cw-0927')).participantId, 'jh_p_young');
  assert.deepEqual(endpointsOf('jhair', 'dev_mac'), ['https://fcm.example/send/mac'], 'other devices are untouched');
});

test('opening another calendar and a burst of resume events never replace the subscription', async () => {
  rotations = 0;
  storage.delete('gather_push_health_kkot');
  const results = await Promise.all([1, 2, 3, 4].map(() => ensurePushSubscriptionHealthy('kkot', 'kk_p_young')));
  assert.ok(results.every(r => r.ok));
  assert.equal(rotations, 0);
  assert.deepEqual(endpointsOf('kkot'), ['https://fcm.example/send/cw-0927']);
  assert.deepEqual(endpointsOf('cw'), ['https://fcm.example/send/cw-0927'], 'cw still sends to the same endpoint');
});

test('a dead endpoint is replaced once and every calendar follows it', async () => {
  rotations = 0;
  // The server deleted cw's row after a 410 (the row this browser itself had saved).
  for (const row of rowsOf('cw')) rows.delete(`cw/${row.id}`);
  const result = await ensurePushSubscriptionHealthy('cw', 'cw_p_young');
  assert.equal(result.ok, true, JSON.stringify(result));
  assert.equal(rotations, 1);
  const fresh = current.endpoint;
  for (const calendarId of ['cw', 'jhair', 'kkot']) {
    assert.deepEqual(endpointsOf(calendarId), [fresh], calendarId);
  }
});

test('a calendar with only an active participant pref (no health key yet) adopts the live push endpoint', async () => {
  rotations = 0;
  // Suppose user has participant key for a new calendar 'testcal', but no gather_push_health_testcal yet
  storage.set('gather_active_participant_id_testcal_v1', 'test_p_young');
  // Trigger health check on cw
  const result = await ensurePushSubscriptionHealthy('cw', 'cw_p_young');
  assert.equal(result.ok, true);
  // testcal should now have adopted the endpoint
  assert.deepEqual(endpointsOf('testcal'), [current.endpoint]);
  assert.equal(rowsOf('testcal').find(row => row.endpoint === current.endpoint)?.participantId, 'test_p_young');
});

test('when server row for cw was deleted, resuming kkot heals cw without rotating the shared endpoint', async () => {
  rotations = 0;
  const liveEndpoint = current.endpoint;
  // Suppose cw row in Firestore was deleted (e.g. server 410 deletion)
  for (const row of rowsOf('cw')) rows.delete(`cw/${row.id}`);
  assert.equal(endpointsOf('cw').length, 0, 'cw row is gone');

  // But local storage still knows about cw
  storage.set('gather_push_health_cw', JSON.stringify({ subId: 'sub_live', participantId: 'cw_p_young' }));

  // User opens or receives notification in kkot
  const result = await ensurePushSubscriptionHealthy('kkot', 'kk_p_young');
  assert.equal(result.ok, true);

  // Endpoint must NOT have rotated
  assert.equal(rotations, 0, 'shared endpoint is preserved');
  assert.deepEqual(endpointsOf('kkot'), [liveEndpoint]);

  // And cw must be automatically self-healed in Firestore!
  assert.deepEqual(endpointsOf('cw'), [liveEndpoint], 'cw subscription is restored');
  assert.equal(rowsOf('cw').find(row => row.endpoint === liveEndpoint)?.participantId, 'cw_p_young');
});
