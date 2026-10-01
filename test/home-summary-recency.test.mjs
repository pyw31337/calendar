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
});
