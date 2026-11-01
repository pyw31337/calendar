import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  planPushSubscriptionRepair,
  readRegisteredPushCalendars,
  staleDeviceRowIds,
  PUSH_HEALTH_KEY_PREFIX
} from '../src/core/push-subscription-repair.js';

function memoryStorage(entries) {
  const map = new Map(Object.entries(entries));
  return {
    get length() { return map.size; },
    key: i => Array.from(map.keys())[i] ?? null,
    getItem: key => (map.has(key) ? map.get(key) : null)
  };
}

test('a calendar that has never seen the endpoint registers it instead of replacing it', () => {
  // The Samsung Internet app on 10-28: cw open, endpoint saved under jhair only. Replacing it
  // here killed jhair's endpoint; the next jhair visit then killed cw's.
  assert.equal(planPushSubscriptionRepair({ health: { available: true, exists: false }, storedSubId: 'sub_old', subId: 'sub_now' }), 'register');
  assert.equal(planPushSubscriptionRepair({ health: { available: true, exists: false }, storedSubId: '', subId: 'sub_now' }), 'register');
});

test('the subscription is replaced only when its endpoint is known dead', () => {
  // The row this browser saved for this very endpoint is gone: the server deletes it after 404/410.
  assert.equal(planPushSubscriptionRepair({ health: { available: true, exists: false }, storedSubId: 'sub_now', subId: 'sub_now' }), 'rotate');
  for (const status of ['http-404', 'http-410', 'http-403']) {
    assert.equal(planPushSubscriptionRepair({ health: { available: true, exists: true, data: { lastPushStatus: status } }, subId: 'sub_now' }), 'rotate', status);
  }
  for (const status of ['sent', 'http-400', 'http-429', 'http-500', 'send-failed', undefined]) {
    assert.equal(planPushSubscriptionRepair({ health: { available: true, exists: true, data: { lastPushStatus: status } }, subId: 'sub_now' }), 'register', String(status));
  }
  // Offline / unreadable: never throw the endpoint away on a guess.
  assert.equal(planPushSubscriptionRepair({ health: { available: false }, storedSubId: 'sub_now', subId: 'sub_now' }), 'register');
  assert.equal(planPushSubscriptionRepair({}), 'register');
});

test('this browser\'s registered calendars come from the per-calendar push record', () => {
  const storage = memoryStorage({
    [`${PUSH_HEALTH_KEY_PREFIX}cw`]: JSON.stringify({ subId: 'sub_a', participantId: 'cw_p_1' }),
    [`${PUSH_HEALTH_KEY_PREFIX}jhair`]: JSON.stringify({ subId: 'sub_b', participantId: 'jh_p_2' }),
    [`${PUSH_HEALTH_KEY_PREFIX}broken`]: '{not json',
    [`${PUSH_HEALTH_KEY_PREFIX}empty`]: JSON.stringify({ participantId: 'x' }),
    gather_device_id: 'dev_1'
  });
  assert.deepEqual(readRegisteredPushCalendars(storage), [
    { calendarId: 'cw', subId: 'sub_a', participantId: 'cw_p_1' },
    { calendarId: 'jhair', subId: 'sub_b', participantId: 'jh_p_2' }
  ]);
  assert.deepEqual(readRegisteredPushCalendars(null), []);
});

test('only this device\'s rows for older endpoints are removed', () => {
  const rows = [
    { id: 'sub_live', deviceId: 'dev_phone' },
    { id: 'sub_dead1', deviceId: 'dev_phone' },
    { id: 'sub_dead2', deviceId: 'dev_phone' },
    { id: 'sub_mac', deviceId: 'dev_mac' },
    { id: 'sub_legacy' }
  ];
  assert.deepEqual(staleDeviceRowIds(rows, { deviceId: 'dev_phone', subId: 'sub_live' }), ['sub_dead1', 'sub_dead2']);
  assert.deepEqual(staleDeviceRowIds(rows, { deviceId: '', subId: 'sub_live' }), []);
  assert.deepEqual(staleDeviceRowIds(rows, { deviceId: 'dev_phone', subId: '' }), []);
});

test('the resume repair never unsubscribes on a missing row or a failed save', () => {
  const src = readFileSync(new URL('../src/core/app-domain-helpers.js', import.meta.url), 'utf8');
  const start = src.indexOf('async function repairPushSubscription');
  const body = src.slice(start, src.indexOf('function readStoredPushSubId', start));
  assert.match(body, /forceResubscribe: action === 'rotate' \|\| options\.forceResubscribe === true/);
  assert.doesNotMatch(body, /forceResubscribe: true/, 'a failed save must not throw away the shared subscription');
  assert.match(src, /const pushHealthInFlight = new Map\(\);/);
});
