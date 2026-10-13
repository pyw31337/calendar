import test from 'node:test';
import assert from 'node:assert/strict';
import { latestRows, timestampMs } from '../src/ui/v2/view-data.js';

test('latestRows sorts items descending by timestamp so index 0 is newest', () => {
  const messages = [
    { id: 'msg-1', text: 'Old message', timestamp: 1000 },
    { id: 'msg-2', text: 'Middle message', timestamp: 2000 },
    { id: 'msg-3', text: 'Newest message', timestamp: 3000 },
  ];
  const sorted = latestRows(messages);
  assert.equal(sorted[0].id, 'msg-3', 'Newest message must be at index 0 for pager page 0');
  assert.equal(sorted[1].id, 'msg-2');
  assert.equal(sorted[2].id, 'msg-1');
});

test('latestRows handles Firestore timestamp representations correctly', () => {
  const rows = [
    { id: 't1', createdAt: 1790600000000 },
    { id: 't2', timestamp: { seconds: 1790653080, nanoseconds: 0 } },
    { id: 't3', updatedAt: 1790620000000 },
  ];
  const sorted = latestRows(rows);
  assert.equal(sorted[0].id, 't2', 'Firestore Timestamp object with seconds must sort properly');
});

test('memo activity timestamp ranks recently updated memos and recently commented memos together', () => {
  const memoUpdatedAt = memo => timestampMs(memo?.updatedAt ?? memo?.createdAt);
  const latestCommentAt = memo => {
    const denormalized = timestampMs(memo?.lastCommentAt);
    if (denormalized > 0) return denormalized;
    return Array.isArray(memo?.comments)
      ? memo.comments.reduce((latest, comment) => Math.max(latest, timestampMs(comment?.updatedAt ?? comment?.createdAt)), 0)
      : 0;
  };
  const memoActivityAt = memo => Math.max(memoUpdatedAt(memo), latestCommentAt(memo));
  const recentFirst = (a, b) => memoActivityAt(b) - memoActivityAt(a) || String(b?.id || '').localeCompare(String(a?.id || ''));

  const memos = [
    { id: 'memo-old-comment', updatedAt: 1000, lastCommentAt: 5000 },
    { id: 'memo-new-edit', updatedAt: 6000, lastCommentAt: 0 },
    { id: 'memo-idle', updatedAt: 2000 },
  ];
  const ranked = memos.slice().sort(recentFirst);
  assert.equal(ranked[0].id, 'memo-new-edit', 'Memo edited at 6000 should rank higher than memo with comment at 5000');
  assert.equal(ranked[1].id, 'memo-old-comment', 'Memo with comment at 5000 ranks above idle memo at 2000');
  assert.equal(ranked[2].id, 'memo-idle');
});

test('ui-app-shell-v2 uses latestRows for chat messages and passes live calendarContext messages', async () => {
  const fs = await import('node:fs/promises');
  const shellSource = await fs.readFile(new URL('../src/ui/ui-app-shell-v2.js', import.meta.url), 'utf8');

  // Verify chat messages slice uses latestRows without reverse so newest message is 1st
  assert.ok(
    shellSource.includes('latestRows(visibleMessages).slice(0, 3)'),
    'HomeActivitySummary must order chat messages newest-first with latestRows'
  );
  assert.ok(
    !shellSource.includes('latestRows(visibleMessages).slice(0, 3).reverse()'),
    'HomeActivitySummary must not reverse chat slice, ensuring latest message is 1st'
  );

  // Verify CalendarPane prefers calendarContext.displayChatMessages
  assert.ok(
    shellSource.includes('displayChatMessages: (Array.isArray(calendarContext?.displayChatMessages) && calendarContext.displayChatMessages.length > 0)'),
    'CalendarPane must forward live displayChatMessages from calendarContext'
  );

  // Verify CalendarPane prefers mergedCalendar.places
  assert.ok(
    shellSource.includes('places: (Array.isArray(mergedCalendar?.places) && mergedCalendar.places.length > 0)'),
    'CalendarPane must forward places from mergedCalendar'
  );

  // Verify side-nav chat personal badge uses isChatRenderableMessage with meetingPhotoMessageIds
  assert.ok(
    shellSource.includes('allChat.filter(msg => isChatRenderableMessage(msg, sideMeetingPhotoMessageIds))'),
    'Side-nav personal badge must use isChatRenderableMessage so its lastChatMsg matches HomeActivitySummary'
  );
});

test('fetchRecentChatMessages pages past meeting/gallery uploads in timestamp desc order and never falls back to unordered alphabetical docs', async () => {
  const { GATHER_FIREBASE_SERVICES } = await import('../src/core/firebase-services.js');
  const allDocs = [
    // Old August messages with alphabetically-first IDs ('0...')
    { id: '0L8c1ubElVYwmkJeDbHe', text: '저흰 오류2동', participantId: 'p_eunhye', timestamp: 1787271255747, uploadSource: 'chat' },
    { id: '0QA8MzMww0cuqg2Vss4Q', text: '타요는 왜 1박이 안돼요????', participantId: 'p_eunhye', timestamp: 1787563790410, uploadSource: 'chat' },
    // Recent October chat messages by 박영우
    { id: 'chat_cw_1791704034607_0jwzij', text: 'ㅋㅋ', participantId: 'p_youngwoo', timestamp: 1791704034607, uploadSource: 'chat' },
    { id: 'chat_cw_1791704065784_mdb37f', text: '송금완료~', participantId: 'p_youngwoo', timestamp: 1791704065784, uploadSource: 'chat' },
    { id: 'chat_cw_1791704082426_do67d3', text: '차차 이어서 사진이랑 장소등록 하겄습니다~', participantId: 'p_youngwoo', timestamp: 1791704082426, uploadSource: 'chat' },
    // 7 newest meeting photo uploads at the head of the collection
    ...Array.from({ length: 7 }, (_, i) => ({
      id: `meeting_cw_2026-10-10_${i}`,
      text: '',
      participantId: 'p_youngwoo',
      timestamp: 1791759273490 + i * 1000,
      uploadSource: 'meeting',
    })),
  ];

  let unorderedCalled = false;
  const makeQuery = (state = { ordered: false, afterDoc: null, limitN: 400 }) => ({
    orderBy(field, dir) {
      assert.equal(field, 'timestamp');
      assert.equal(dir, 'desc');
      return makeQuery({ ...state, ordered: true });
    },
    startAfter(doc) {
      return makeQuery({ ...state, afterDoc: doc });
    },
    limit(n) {
      return makeQuery({ ...state, limitN: n });
    },
    async get() {
      if (!state.ordered) {
        unorderedCalled = true;
      }
      const sorted = state.ordered
        ? allDocs.slice().sort((a, b) => b.timestamp - a.timestamp)
        : allDocs.slice().sort((a, b) => a.id.localeCompare(b.id));
      let startIdx = 0;
      if (state.afterDoc) {
        const idx = sorted.findIndex(d => d.id === state.afterDoc.id);
        startIdx = idx >= 0 ? idx + 1 : sorted.length;
      }
      const slice = sorted.slice(startIdx, startIdx + state.limitN);
      const docs = slice.map(d => ({ id: d.id, data: () => ({ ...d }) }));
      return {
        empty: docs.length === 0,
        size: docs.length,
        docs,
        forEach(fn) { docs.forEach(fn); },
      };
    },
  });

  globalThis.window = globalThis.window || {};
  const prevDeps = globalThis.window.GATHER_FIREBASE_DEPS;
  globalThis.window.GATHER_FIREBASE_DEPS = {
    getDb: () => ({
      collection: () => ({
        doc: () => ({
          collection: () => makeQuery(),
        }),
      }),
    }),
    slimMessageForClient: m => m,
  };

  try {
    const recent = await GATHER_FIREBASE_SERVICES.fetchRecentChatMessages('cw', 3);
    assert.equal(unorderedCalled, false, 'Must never fall back to an unordered alphabetical query');
    assert.equal(recent.length, 3);
    assert.equal(recent[recent.length - 1].id, 'chat_cw_1791704082426_do67d3', 'Newest chat message must be 박영우 latest message');
    assert.equal(recent[recent.length - 1].text, '차차 이어서 사진이랑 장소등록 하겄습니다~');
    assert.ok(!recent.some(m => m.id === '0QA8MzMww0cuqg2Vss4Q'), 'Old August message must not be returned in top 3');
  } finally {
    globalThis.window.GATHER_FIREBASE_DEPS = prevDeps;
  }
});
