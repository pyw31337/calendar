import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { LIKE_KINDS, buildLikeDocument, groupLikesByKind, likeDocId, photoLikeItem } from '../src/core/likes-model.js';
import { splitLikesForParticipant } from '../src/core/likes-model.js';

test('like document ids are stable, kind-prefixed and match the rules pattern', async () => {
  const rules = await readFile(new URL('../firestore.rules', import.meta.url), 'utf8');
  const pattern = new RegExp(rules.match(/isValidLikeDocId\(id\) \{\s*return id is string && id\.matches\('([^']+)'\)/)[1]);
  LIKE_KINDS.forEach(kind => {
    const id = likeDocId(kind, `ref-${kind}`);
    assert.match(id, pattern, `${kind} id ${id} passes firestore.rules`);
    assert.equal(id, likeDocId(kind, `ref-${kind}`), 'stable');
  });
  assert.notEqual(likeDocId('photo', 'a'), likeDocId('photo', 'b'));
  assert.notEqual(likeDocId('photo', 'a'), likeDocId('memo', 'a'));
});

test('a like document only carries the fields the rules allow, clipped to their limits', () => {
  const doc = buildLikeDocument({ kind: 'memo', ref: 'm1', title: 'x'.repeat(400), target: { memoId: 'm1', empty: '' }, extra: 'nope' }, 123);
  assert.deepEqual(Object.keys(doc).sort(), ['kind', 'likedAt', 'ref', 'subtitle', 'target', 'thumb', 'title', 'url']);
  assert.equal(doc.title.length, 300);
  assert.deepEqual(doc.target, { memoId: 'm1' });
  assert.equal(doc.likedAt, 123);
  assert.equal(buildLikeDocument({ kind: 'chat', ref: 'x' }), null, 'unknown kinds are refused');
  assert.equal(buildLikeDocument({ kind: 'photo', ref: '' }), null, 'a like needs a ref');
});

test('the 좋아요 tab groups by kind in a fixed order, newest first', () => {
  const groups = groupLikesByKind([
    { kind: 'memo', likedAt: 1 }, { kind: 'photo', likedAt: 1 }, { kind: 'photo', likedAt: 5 }, { kind: 'bogus' }
  ]);
  assert.deepEqual(groups.map(group => group.kind), ['photo', 'memo']);
  assert.deepEqual(groups[0].items.map(item => item.likedAt), [5, 1]);
});

test('photo likes keep what the lightbox needs to reopen the photo', () => {
  const item = photoLikeItem({ tags: '#서준', full: 'https://x/f.jpg', thumb: 'https://x/t.jpg', messageId: 'm1', imageIndex: 2, source: 'chat' }, 'asset:1');
  assert.equal(item.kind, 'photo');
  assert.equal(item.ref, 'asset:1');
  assert.equal(item.url, 'https://x/f.jpg');
  assert.equal(item.target.imageIndex, 2);
});

test('likes are per participant: different ids for different people, legacy id unchanged', () => {
  const shared = likeDocId('photo', 'asset:v1:a');
  const yuri = likeDocId('photo', 'asset:v1:a', 'p_yuri');
  const youngwoo = likeDocId('photo', 'asset:v1:a', 'p_youngwoo');
  assert.match(shared, /^photo_[0-9a-f]{16}$/);
  assert.match(yuri, /^photo_[0-9a-f]{16}_p[0-9a-f]{8}$/);
  assert.notEqual(yuri, youngwoo);
  assert.equal(yuri.slice(0, shared.length), shared);
  assert.equal(buildLikeDocument({ kind: 'photo', ref: 'r' }, 1, 'p_yuri').participantId, 'p_yuri');
  assert.equal('participantId' in buildLikeDocument({ kind: 'photo', ref: 'r' }, 1), false);
});

test('mine is only my likes; all merges everyone per liked thing with who liked it', () => {
  const likes = [
    { id: '1', kind: 'photo', ref: 'a', participantId: 'p1', likedAt: 1 },
    { id: '2', kind: 'photo', ref: 'a', participantId: 'p2', likedAt: 3 },
    { id: '3', kind: 'memo', ref: 'm', participantId: 'p2', likedAt: 2 },
    { id: '4', kind: 'place', ref: 'x', likedAt: 5 },
  ];
  const { mine, all } = splitLikesForParticipant(likes, 'p1');
  assert.deepEqual(mine.map(l => l.id), ['1']);
  assert.deepEqual(all.map(l => [l.kind, l.likerIds]), [['place', []], ['photo', ['p2', 'p1']], ['memo', ['p2']]]);
});
