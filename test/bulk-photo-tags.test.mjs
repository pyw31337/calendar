import test from 'node:test';
import assert from 'node:assert/strict';
import {
  applyPhotoTagOperation,
  buildBulkPhotoTagChanges,
  normalizePhotoTagTokens,
} from '../src/core/bulk-photo-tags.js';

test('bulk tag operations deduplicate, preserve order, and enforce the shared twenty-tag cap', () => {
  assert.deepEqual(normalizePhotoTagTokens(' #파주, #하니랜드 파주 '), ['파주', '하니랜드']);
  assert.deepEqual(applyPhotoTagOperation('파주 하니랜드', 'add', '하니랜드 여행'), {
    tags: '파주 하니랜드 여행', changed: true, reason: ''
  });
  assert.deepEqual(applyPhotoTagOperation('파주 하니랜드 여행', 'remove', '하니랜드'), {
    tags: '파주 여행', changed: true, reason: ''
  });
});

test('bulk tag changes retain original sets for an exact undo payload', () => {
  const changes = buildBulkPhotoTagChanges([
    { assetKey: 'asset:v1:a', full: 'https://example.test/a.jpg', tags: '파주' },
    { assetKey: 'asset:v1:b', full: 'https://example.test/b.jpg', tags: '하니랜드' },
    { assetKey: 'asset:v1:a', full: 'https://example.test/a.jpg', tags: '파주' },
  ], 'add', '여행');
  assert.equal(changes.length, 2);
  assert.deepEqual(changes.map(change => [change.assetKey, change.beforeTags, change.tags]), [
    ['asset:v1:a', '파주', '파주 여행'],
    ['asset:v1:b', '하니랜드', '하니랜드 여행'],
  ]);
});
