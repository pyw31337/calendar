import test from 'node:test';
import assert from 'node:assert/strict';

// app-image-pipeline is also loaded by legacy browser entry points, so provide the tiny global
// facade it reads at module evaluation time before importing its pure selection helpers.
globalThis.window = globalThis.window || {};
const {
  MAX_IMAGE_UPLOADS_PER_ACTION,
  isImageUploadFile,
  limitImageUploadSelection,
  chunkResolvedImagesForMessages
} = await import('../src/core/app-image-pipeline.js');

test('a single image selection accepts 200 files and chunks only the persisted message records', () => {
  const files = Array.from({ length: MAX_IMAGE_UPLOADS_PER_ACTION + 3 }, (_, index) => ({
    name: `google-photo-${index + 1}.jpg`,
    // Google Photos can omit MIME type from a shared File; filename fallback must still accept it.
    type: '',
    size: 1000,
    lastModified: index
  }));
  const selection = limitImageUploadSelection(files);
  assert.equal(MAX_IMAGE_UPLOADS_PER_ACTION, 200);
  assert.equal(selection.candidates.length, 203);
  assert.equal(selection.selected.length, 200);
  assert.equal(selection.omittedCount, 3);
  assert.equal(isImageUploadFile(files[0]), true);

  const chunks = chunkResolvedImagesForMessages(selection.selected.map((file, index) => ({
    imageUrl: `https://example.test/photo-${index}.jpg`,
    thumbUrl: `https://example.test/photo-${index}-thumb.jpg`,
    sourceFile: file
  })));
  assert.deepEqual(chunks.map(chunk => chunk.length), [50, 50, 50, 50]);
  assert.equal(chunks.flat().length, 200, '50 is a per-message storage boundary, not a selection cap');
});
