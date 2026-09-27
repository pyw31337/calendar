import test from 'node:test';
import assert from 'node:assert/strict';
import { MAX_UPLOAD_PHOTOS, MAX_PHOTOS_PER_MESSAGE, MAX_PHOTO_TAGS, MAX_PHOTO_TAG_TEXT } from '../src/core/photo-limits.js';

globalThis.window = globalThis.window || {};
const { chunkResolvedImagesForMessages } = await import('../src/core/app-image-pipeline.js');

test('limits: 200 photos per upload, 50 per message, 20 tags that always fit the stored text', () => {
  assert.equal(MAX_UPLOAD_PHOTOS, 200);
  assert.equal(MAX_PHOTOS_PER_MESSAGE, 50);
  assert.equal(MAX_PHOTO_TAGS, 20);
  const longest = Array.from({ length: MAX_PHOTO_TAGS }, () => 'x'.repeat(30)).join(' ');
  assert.ok(longest.length <= MAX_PHOTO_TAG_TEXT);
});

test('a 200-photo upload becomes four messages of 50 (firestore.rules cap imageUrls at 50)', () => {
  const images = Array.from({ length: 200 }, (_, i) => ({
    imageUrl: `https://firebasestorage.googleapis.com/v0/b/x/o/chatImages%2Fc%2F${i}_original.jpg?alt=media&token=t`,
    thumbUrl: `https://firebasestorage.googleapis.com/v0/b/x/o/chatImages%2Fc%2F${i}_thumb.jpg?alt=media&token=t`,
  }));
  const chunks = chunkResolvedImagesForMessages(images);
  assert.deepEqual(chunks.map(chunk => chunk.length), [50, 50, 50, 50]);
  assert.equal(chunks.flat().length, 200);
});
