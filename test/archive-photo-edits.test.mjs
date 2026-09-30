import test from 'node:test';
import assert from 'node:assert/strict';
import {
  archivePhotosShareIdentity,
  projectArchivePhotoEntries,
  rememberArchiveDeleted,
  rememberArchiveTag,
} from '../src/core/archive-photo-edits.js';

test('archive tag overrides and deletes match a photo through any of its ids', () => {
  const listed = {
    mediaKey: 'photoIndexDoc',
    full: 'https://example.test/a.jpg',
    tags: '',
    messageId: 'm1',
    imageIndex: 2,
  };
  const edited = {
    assetKey: 'asset:v1:other',
    full: 'https://example.test/a.jpg?token=1',
    tags: '',
    sourceMessageId: 'm1',
    sourceImageIndex: 2,
  };
  assert.equal(archivePhotosShareIdentity(listed, edited), true);

  const tags = rememberArchiveTag(new Map(), edited, '서준 바다');
  const deleted = rememberArchiveDeleted(new Set(), { thumb: 'https://example.test/a.jpg' });
  const projected = projectArchivePhotoEntries([
    listed,
    { assetKey: 'asset:v1:keep', full: 'https://example.test/b.jpg', tags: '풍경' },
  ], { tagOverrides: tags, deletedKeys: new Set() });
  assert.equal(projected.length, 2);
  assert.equal(projected[0].tags, '서준 바다');
  assert.equal(projected[0].tagAuthoritative, true);

  const hidden = projectArchivePhotoEntries([listed, { assetKey: 'asset:v1:keep', full: 'https://example.test/b.jpg', tags: '' }], {
    deletedKeys: deleted,
  });
  assert.equal(hidden.length, 1);
  assert.equal(hidden[0].assetKey, 'asset:v1:keep');
});
