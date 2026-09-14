import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  CHAT_TYPING_TTL_MS,
  clearChatTypingPresence,
  getActiveTypingParticipantIds,
  publishChatTypingPresence,
  subscribeChatTypingPresence
} from '../src/core/chat-typing-presence.js';

function createFakeDb() {
  const state = { path: [], writes: [], deletes: [], listener: null };
  const chain = {
    collection(name) { state.path.push(name); return chain; },
    doc(id) { state.path.push(id); return chain; },
    async set(data) { state.writes.push({ path: [...state.path], data }); },
    async delete() { state.deletes.push([...state.path]); },
    onSnapshot(next) {
      state.listener = next;
      return () => { state.listener = null; };
    }
  };
  return { db: chain, state };
}

test('active typing rows are expired, self-filtered, future-safe, and deduped by participant', () => {
  const now = 1_000_000;
  const ids = getActiveTypingParticipantIds([
    { participantId: 'me', updatedAt: now, expiresAt: now + 5000 },
    { participantId: 'friend', updatedAt: now, expiresAt: now + 5000 },
    { participantId: 'friend', updatedAt: now + 1, expiresAt: now + 5001 },
    { participantId: 'expired', updatedAt: now - 20_000, expiresAt: now - 1 },
    { participantId: 'future', updatedAt: now + CHAT_TYPING_TTL_MS + 1, expiresAt: now + 30_000 }
  ], now, 'me');
  assert.deepEqual(ids, ['friend']);
});

test('publish writes only bounded presence metadata under the calendar session path', async () => {
  const { db, state } = createFakeDb();
  const ok = await publishChatTypingPresence(db, 'cw', 'typing_session1', 'person-1', 1234);
  assert.equal(ok, true);
  assert.deepEqual(state.writes, [{
    path: ['calendars', 'cal_cw', 'typingPresence', 'typing_session1'],
    data: {
      participantId: 'person-1',
      sessionId: 'typing_session1',
      updatedAt: 1234,
      expiresAt: 1234 + CHAT_TYPING_TTL_MS
    }
  }]);
  assert.equal(JSON.stringify(state.writes).includes('text'), false);
});

test('invalid calendar and session identifiers never reach Firestore', async () => {
  const { db, state } = createFakeDb();
  assert.equal(await publishChatTypingPresence(db, '../cw', 'typing_ok', 'person', 1), false);
  assert.equal(await publishChatTypingPresence(db, 'cw', 'typing/bad', 'person', 1), false);
  assert.deepEqual(state.writes, []);
});

test('clear removes only the current session document', async () => {
  const { db, state } = createFakeDb();
  assert.equal(await clearChatTypingPresence(db, 'jhair', 'typing_session2'), true);
  assert.deepEqual(state.deletes, [['calendars', 'cal_jhair', 'typingPresence', 'typing_session2']]);
});

test('subscription converts snapshots to remote participant ids and unsubscribes cleanly', () => {
  const { db, state } = createFakeDb();
  const received = [];
  const stop = subscribeChatTypingPresence(db, 'kkot', 'me', ids => received.push(ids));
  const now = Date.now();
  state.listener({
    forEach(callback) {
      [
        { participantId: 'me', updatedAt: now, expiresAt: now + 5000 },
        { participantId: 'friend', updatedAt: now, expiresAt: now + 5000 }
      ].forEach(data => callback({ data: () => data }));
    }
  });
  assert.deepEqual(received.at(-1), ['friend']);
  stop();
  assert.equal(state.listener, null);
});
