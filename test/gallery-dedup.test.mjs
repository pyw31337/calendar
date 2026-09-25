import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  getStorageUrlFileSize,
  getStorageUrlExt,
  toDedupCandidate,
  findDuplicatePhotoGroups,
  chooseDedupWinner
} from '../src/core/gallery-dedup.js';

const storageUrl = (sizeBytes, ext = 'jpg', stamp = '1700000000000_ab12cd_0') =>
  `https://firebasestorage.googleapis.com/v0/b/x/o/chatImages%2Fcal_x%2F${stamp}_original_${sizeBytes}b.${ext}?alt=media`;

test('getStorageUrlFileSize parses the byte size embedded in an upload URL', () => {
  assert.equal(getStorageUrlFileSize(storageUrl(214875)), 214875);
  assert.equal(getStorageUrlFileSize('https://example.test/no-size-here.jpg'), null);
  assert.equal(getStorageUrlFileSize(null), null);
});

test('getStorageUrlExt reads the extension regardless of query string', () => {
  assert.equal(getStorageUrlExt(storageUrl(1000, 'png')), 'png');
  assert.equal(getStorageUrlExt('https://example.test/x.JPG?alt=media#frag'), 'jpg');
  assert.equal(getStorageUrlExt(''), '');
});

test('toDedupCandidate excludes photos with no parseable Storage size (inline/base64/legacy)', () => {
  assert.equal(toDedupCandidate(null), null);
  assert.equal(toDedupCandidate({ full: 'data:image/png;base64,AAAA', timestamp: 1 }), null);
  assert.equal(toDedupCandidate({ full: storageUrl(100), timestamp: NaN }), null);
  const ok = toDedupCandidate({ full: storageUrl(100), timestamp: 1700000000000, tags: '캠핑' });
  assert.equal(ok.sizeBytes, 100);
  assert.equal(ok.tags, '캠핑');
});

test('findDuplicatePhotoGroups flags same ext+size+second as an "exact" duplicate', () => {
  const ts = 1700000000000;
  const photos = [
    { id: 'a', full: storageUrl(214875, 'jpg', '1700000000000_aa_0'), timestamp: ts, tags: '' },
    { id: 'b', full: storageUrl(214875, 'jpg', '1700000000000_bb_1'), timestamp: ts, tags: '짜파게티' },
    { id: 'c', full: storageUrl(999999, 'jpg', '1700000000000_cc_2'), timestamp: ts, tags: '' } // different size
  ];
  const groups = findDuplicatePhotoGroups(photos);
  assert.equal(groups.length, 1);
  assert.equal(groups[0].kind, 'exact');
  assert.equal(groups[0].candidates.length, 2);
  assert.deepEqual(groups[0].candidates.map(c => c.photo.id).sort(), ['a', 'b']);
});

test('findDuplicatePhotoGroups catches a same-uploader retry minutes later as a "retry" duplicate', () => {
  const first = 1700000000000;
  const retryLater = first + 3 * 60 * 1000; // 3 minutes later -- inside the default 15-minute window
  const tooLate = first + 60 * 60 * 1000; // 1 hour later -- outside the window, not a duplicate
  const photos = [
    { id: 'a', full: storageUrl(500000, 'jpg', '1700000000000_aa_0'), timestamp: first, participantId: 'p1' },
    { id: 'b', full: storageUrl(500000, 'jpg', '1700000000180_bb_0'), timestamp: retryLater, participantId: 'p1' },
    { id: 'c', full: storageUrl(500000, 'jpg', '1700000003600_cc_0'), timestamp: tooLate, participantId: 'p1' },
    { id: 'd', full: storageUrl(500000, 'jpg', '1700000000200_dd_0'), timestamp: retryLater + 5000, participantId: 'p2' } // different uploader, and a different second so it can't collide with b's exact-second bucket
  ];
  const groups = findDuplicatePhotoGroups(photos);
  assert.equal(groups.length, 1);
  assert.equal(groups[0].kind, 'retry');
  assert.deepEqual(groups[0].candidates.map(c => c.photo.id), ['a', 'b']);
});

test('findDuplicatePhotoGroups never double-counts an exact match inside a retry group', () => {
  const ts = 1700000000000;
  const photos = [
    { id: 'a', full: storageUrl(300000, 'jpg', '1700000000000_aa_0'), timestamp: ts, participantId: 'p1' },
    { id: 'b', full: storageUrl(300000, 'jpg', '1700000000000_bb_0'), timestamp: ts, participantId: 'p1' }
  ];
  const groups = findDuplicatePhotoGroups(photos);
  assert.equal(groups.length, 1, 'the exact-second pair must not also appear as a retry group');
  assert.equal(groups[0].kind, 'exact');
});

test('findDuplicatePhotoGroups returns nothing for photos with no duplicates', () => {
  const photos = [
    { id: 'a', full: storageUrl(100, 'jpg'), timestamp: 1 },
    { id: 'b', full: storageUrl(200, 'jpg'), timestamp: 2 }
  ];
  assert.deepEqual(findDuplicatePhotoGroups(photos), []);
});

test('chooseDedupWinner prefers the candidate with tags over one with none', () => {
  const withTags = toDedupCandidate({ id: 'tagged', full: storageUrl(1, 'jpg', '1_a_0'), timestamp: 100, tags: '오징어덮밥' });
  const withoutTags = toDedupCandidate({ id: 'blank', full: storageUrl(1, 'jpg', '1_b_0'), timestamp: 50, tags: '' });
  const { winner, losers } = chooseDedupWinner({ candidates: [withoutTags, withTags] });
  assert.equal(winner.photo.id, 'tagged', 'the earlier, untagged photo must not win over the tagged one');
  assert.deepEqual(losers.map(l => l.photo.id), ['blank']);
});

test('chooseDedupWinner prefers more comments when tags are tied', () => {
  const fewComments = toDedupCandidate({ id: 'few', full: storageUrl(1, 'jpg', '1_a_0'), timestamp: 100, tags: 'x', commentCount: 1 });
  const manyComments = toDedupCandidate({ id: 'many', full: storageUrl(1, 'jpg', '1_b_0'), timestamp: 200, tags: 'x', commentCount: 5 });
  const { winner } = chooseDedupWinner({ candidates: [fewComments, manyComments] });
  assert.equal(winner.photo.id, 'many');
});

test('chooseDedupWinner falls back to earliest upload when both tags and comments are tied', () => {
  const earlier = toDedupCandidate({ id: 'earlier', full: storageUrl(1, 'jpg', '1_a_0'), timestamp: 100, tags: '', commentCount: 0 });
  const later = toDedupCandidate({ id: 'later', full: storageUrl(1, 'jpg', '1_b_0'), timestamp: 200, tags: '', commentCount: 0 });
  const { winner, losers } = chooseDedupWinner({ candidates: [later, earlier] });
  assert.equal(winner.photo.id, 'earlier');
  assert.deepEqual(losers.map(l => l.photo.id), ['later']);
});

test('chooseDedupWinner handles an empty group without throwing', () => {
  assert.equal(chooseDedupWinner({ candidates: [] }), null);
  assert.equal(chooseDedupWinner([]), null);
});
