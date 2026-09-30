import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const {
  planMemoPush,
  planChatPush,
  planPollPushes,
  planSchedulePush,
  selectDeliverableSubscriptions
} = require('../functions/push-notify-policy.js');

const memoText = [
  '이용시간 연중무휴 9:00-18:00',
  '이용인원 동시 수용인원 80명',
  '별도 예약 없음 / 무료입장료 / 무료주차장'
].join('\n');

function memo(overrides = {}) {
  return {
    id: 'memo_place',
    participantId: 'person_author',
    title: '모아엘가',
    text: memoText,
    ...overrides
  };
}

test('unchanged memo content does not notify, even when maintenance fields change', () => {
  const before = memo({ updatedAt: 1, imageTagMap: { a: '#old' }, linkPreview: null, assetIds: [] });
  const after = memo({
    updatedAt: Date.now(),
    imageTagMap: { a: '#경기도 #광명시' },
    imageGeoMap: { 'asset:v1:abc': { lat: 37.4, lng: 127.0 } },
    linkPreview: { url: 'https://example.com', title: 'preview', fetchedAt: Date.now() },
    linkPreviews: [{ url: 'https://example.com', title: 'preview' }],
    assetIds: ['asset:v1:abc'],
    assetGraphVersion: 1,
    isPinned: true,
    color: 'var(--bg-card)'
  });
  const claims = new Set();
  assert.equal(planMemoPush(before, after, claims, { memoId: 'memo_place' }), null);
  assert.equal(claims.size, 0);
});

test('the same memo revision notifies only once', () => {
  const claims = new Set();
  const created = planMemoPush(null, memo(), claims, { memoId: 'memo_place' });
  assert.ok(created);
  assert.equal(created.skipParticipantId, 'person_author');
  assert.match(created.tag, /^memo-memo_place-/);
  assert.equal(created.renotify, false);
  const again = planMemoPush(null, memo({ updatedAt: 2, linkPreview: { url: 'https://example.com' } }), claims, { memoId: 'memo_place' });
  assert.equal(again, null);
  const edited = planMemoPush(memo(), memo({ text: memoText + '\n추가 안내' }), claims, { memoId: 'memo_place' });
  assert.ok(edited);
  assert.equal(edited.kind, 'edit');
  assert.notEqual(edited.claimKey, created.claimKey);
});

test('duplicate device subscriptions collapse to one delivery', () => {
  const selected = selectDeliverableSubscriptions([
    { id: 'old-1', endpoint: 'https://push.example/a', deviceId: 'iphone', updatedAt: 10 },
    { id: 'old-2', endpoint: 'https://push.example/b', deviceId: 'iphone', updatedAt: 20 },
    { id: 'old-3', endpoint: 'https://push.example/c', deviceId: 'iphone', lastSeenAt: 30 },
    { id: 'same-endpoint', endpoint: 'https://push.example/c', deviceId: '', updatedAt: 5 },
    { id: 'other-phone', endpoint: 'https://push.example/d', deviceId: 'ipad', updatedAt: 1 }
  ]);
  assert.deepEqual(selected.map(entry => entry.id).sort(), ['old-3', 'other-phone']);
});

test('the same chat message, regenerated poll, and confirmed meeting do not notify twice', () => {
  const claims = new Set();
  const message = { id: 'm1', participantId: 'author', text: '안녕' };
  assert.ok(planChatPush(message, claims, { messageId: 'm1' }));
  assert.equal(planChatPush(message, claims, { messageId: 'm1' }), null);
  assert.equal(planChatPush({ ...message, uploadSource: 'gallery' }, new Set(), { messageId: 'm2' }), null);

  const poll = { id: 'poll_old', title: '점심', options: [{ text: '김치찌개' }] };
  assert.deepEqual(planPollPushes([poll], [{ ...poll, id: 'poll_new_same_content' }], claims), []);
  const created = planPollPushes([poll], [poll, { id: 'poll_real', title: '저녁', options: [{ text: '파스타' }], participantId: 'author' }], claims);
  assert.equal(created.length, 1);
  assert.equal(created[0].skipParticipantId, 'author');
  assert.equal(planPollPushes([], [{ id: 'poll_real', title: '저녁', options: [{ text: '파스타' }] }], claims).length, 0);

  const meeting = { confirmed: true, confirmedAt: 50, date: '2026-10-01' };
  assert.ok(planSchedulePush(null, meeting, claims, { dateId: '2026-10-01', stale: false }));
  assert.equal(planSchedulePush({ confirmed: false }, meeting, claims, { dateId: '2026-10-01', stale: false }), null);
  assert.equal(planSchedulePush({ confirmed: true, note: 'old' }, { ...meeting, note: 'edited' }, claims, { dateId: '2026-10-01' }), null);
  assert.equal(planSchedulePush(null, meeting, new Set(), { dateId: '2026-09-01', stale: true }), null);
});
