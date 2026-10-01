import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizePhotoTagTokens, buildBulkPhotoTagChanges, applyPhotoTagOperation } from '../src/core/bulk-photo-tags.js';
import { setTagClipboard, getTagClipboard, DEFAULT_OBJECT_TAG_RECOMMENDATIONS } from '../src/ui/photo-bulk-action-bar.js';

test('normalizePhotoTagTokens extracts and cleans multi-person and object tags', () => {
  const result = normalizePhotoTagTokens('#박영우, #서준   #바다 #전망대');
  assert.deepEqual(result, ['박영우', '서준', '바다', '전망대']);
});

test('applyPhotoTagOperation adds multiple tags simultaneously', () => {
  const currentTags = '#기존태그';
  const opResult = applyPhotoTagOperation(currentTags, 'add', '#박영우 #서준 #바다');
  assert.equal(opResult.changed, true);
  assert.ok(opResult.tags.includes('기존태그'));
  assert.ok(opResult.tags.includes('박영우'));
  assert.ok(opResult.tags.includes('서준'));
  assert.ok(opResult.tags.includes('바다'));
});

test('buildBulkPhotoTagChanges builds changes for all selected photos with multiple tags', () => {
  const photos = [
    { assetKey: 'photo_1', tags: '#기존1' },
    { assetKey: 'photo_2', tags: '' },
    { assetKey: 'photo_3', tags: '#기존3' },
  ];
  const changes = buildBulkPhotoTagChanges(photos, 'add', '#서준 #바다');
  assert.equal(changes.length, 3);
  assert.ok(changes[0].tags.includes('서준'));
  assert.ok(changes[0].tags.includes('바다'));
  assert.ok(changes[1].tags.includes('서준'));
  assert.ok(changes[1].tags.includes('바다'));
});

test('setTagClipboard and getTagClipboard manage copied tag buffer', () => {
  const copied = setTagClipboard(['#서준', '바다', '#전망대']);
  assert.deepEqual(copied, ['서준', '바다', '전망대']);
  assert.deepEqual(getTagClipboard(), ['서준', '바다', '전망대']);
});

test('DEFAULT_OBJECT_TAG_RECOMMENDATIONS provides standard object/scene candidates', () => {
  assert.ok(DEFAULT_OBJECT_TAG_RECOMMENDATIONS.includes('바다'));
  assert.ok(DEFAULT_OBJECT_TAG_RECOMMENDATIONS.includes('전망대'));
  assert.ok(DEFAULT_OBJECT_TAG_RECOMMENDATIONS.includes('풍경'));
  assert.ok(DEFAULT_OBJECT_TAG_RECOMMENDATIONS.includes('음식'));
});
