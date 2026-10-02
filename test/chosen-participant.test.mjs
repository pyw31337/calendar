import test from 'node:test';
import assert from 'node:assert/strict';

// The side menu participant badge shows only a participant someone actually picked on this device.
const store = new Map();
globalThis.localStorage = { getItem: k => (store.has(k) ? store.get(k) : null), setItem: (k, v) => store.set(k, String(v)), removeItem: k => store.delete(k) };
globalThis.window = globalThis.window || globalThis;
window.localStorage = globalThis.localStorage;
const events = [];
window.dispatchEvent = event => events.push(event.detail);
window.GATHER_APP_UTILS = { getActiveParticipants: cal => (cal?.participants || []).filter(p => !p.deletedAt) };
globalThis.CustomEvent = globalThis.CustomEvent || class { constructor(type, init) { this.type = type; this.detail = init?.detail; } };
await import('../src/core/app-notifications.js');
const { getChosenChatParticipantId, getStoredChatParticipantId, setStoredChatParticipantId } = window.GATHER_APP_NOTIFICATIONS;
const calendar = { participants: [{ id: 'p1', name: '박영우' }, { id: 'p2', name: '김유리' }] };

test('no pick yet: chat still defaults to the first participant, but nothing counts as chosen', () => {
  store.clear();
  assert.equal(getStoredChatParticipantId('cal1', calendar), 'p1');
  assert.equal(getChosenChatParticipantId('cal1', calendar), '');
});

test('after a pick it is remembered and broadcast', () => {
  store.clear();
  events.length = 0;
  setStoredChatParticipantId('cal1', 'p2');
  assert.equal(getChosenChatParticipantId('cal1', calendar), 'p2');
  assert.deepEqual(events, [{ calId: 'cal1', participantId: 'p2' }]);
});

test('a removed participant no longer counts as chosen', () => {
  store.clear();
  setStoredChatParticipantId('cal1', 'p9');
  assert.equal(getChosenChatParticipantId('cal1', calendar), '');
});
