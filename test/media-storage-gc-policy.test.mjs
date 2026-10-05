import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFile } from 'node:fs/promises';

const require = createRequire(import.meta.url);
const media = require('../functions/media-commands.js');

test('isOriginalStoragePath detects uploaded originals', () => {
  assert.equal(media.isOriginalStoragePath('chatImages/cw/abc_original_1234b.webp'), true);
  assert.equal(media.isOriginalStoragePath('memoImages/cw/abc_thumb_99b.webp'), false);
  assert.equal(media.isOriginalStoragePath('chatFiles/cw/doc.pdf'), false);
});

test('isDerivedThumbPath detects thumb variants', () => {
  assert.equal(media.isDerivedThumbPath('chatImages/cw/abc_thumb_99b.webp'), true);
  assert.equal(media.isDerivedThumbPath('chatImages/cw/abc_original_1234b.webp'), false);
});

test('nightlyMediaMaintenance aborts GC when any photoIndex rebuild fails', async () => {
  const src = await readFile(new URL('../functions/index.js', import.meta.url), 'utf8');
  assert.match(src, /rebuildFailures/);
  assert.match(src, /nightly storage GC aborted/);
  assert.match(src, /if \(rebuildFailures\.length\)/);
});

test('sweepStorageGc builds in-use set from messages, memos, places, and fileAttachments', async () => {
  const src = await readFile(new URL('../functions/media-commands.js', import.meta.url), 'utf8');
  assert.match(src, /collection\('messages'\)/);
  assert.match(src, /collection\('memos'\)/);
  assert.match(src, /collection\('places'\)/);
  assert.match(src, /fileAttachments/);
  assert.match(src, /isOriginalStoragePath/);
  assert.match(src, /skippedOriginal/);
});
