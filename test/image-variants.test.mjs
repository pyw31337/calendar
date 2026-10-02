import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CHAT_THUMB_MAX_EDGE,
  CHAT_THUMB_QUALITY,
  SMALL_THUMB_MAX_EDGE,
  SMALL_THUMB_QUALITY,
  canDeleteSupersededThumb,
  derivedSmallThumbUrl,
  imageUploadVariantPlan,
  isChatImageUpload,
  selectImageVariant,
  siblingSmallStoragePath,
  variantMigrationPlan,
} from '../src/core/image-variants.js';

const bucket = 'https://firebasestorage.googleapis.com/v0/b/metro.appspot.com/o/';
const original = `${bucket}${encodeURIComponent('chatImages/cw/1_original_2000b.webp')}?alt=media&token=orig`;
const chatThumb = `${bucket}${encodeURIComponent('chatImages/cw/1_thumb_400b.webp')}?alt=media&token=thumb`;
const small = `${bucket}${encodeURIComponent('chatImages/cw/1_small.webp')}?alt=media`;
const jpgOriginal = `${bucket}${encodeURIComponent('chatImages/cw/legacy.jpg')}?alt=media&token=jpg`;

test('sizes stay at the 512 tile thumb and the 160 small thumb; every upload keeps both', () => {
  assert.equal(CHAT_THUMB_MAX_EDGE, 512);
  assert.equal(CHAT_THUMB_QUALITY, 0.8);
  assert.equal(SMALL_THUMB_MAX_EDGE, 160);
  assert.equal(SMALL_THUMB_QUALITY, 0.8);
  assert.deepEqual(imageUploadVariantPlan('chat').files, ['original', 'chatThumb', 'small']);
  assert.deepEqual(imageUploadVariantPlan('grid').files, ['original', 'chatThumb', 'small']);
});

test('chat is uploadSource or the message channel, not the storage host', () => {
  assert.equal(isChatImageUpload({ uploadSource: 'chat', channel: 'message' }), true);
  assert.equal(isChatImageUpload({ uploadSource: '', channel: 'message' }), true);
  assert.equal(isChatImageUpload({ uploadSource: '', channel: 'messages' }), true);
  assert.equal(isChatImageUpload({ uploadSource: 'gallery', channel: 'message' }), false);
  assert.equal(isChatImageUpload({ uploadSource: 'memo', channel: 'memo' }), false);
  assert.equal(isChatImageUpload({ uploadSource: 'meeting', channel: 'meeting' }), false);
  assert.equal(isChatImageUpload({ uploadSource: 'calendar', channel: 'message' }), false);
  assert.equal(isChatImageUpload({ uploadSource: 'meme', channel: 'message' }), false);
  assert.equal(isChatImageUpload({ uploadSource: '', channel: '' }), false);
  assert.equal(isChatImageUpload({ uploadSource: 'chat' }), true);
});

test('tiles request the 512 thumb, mini surfaces the 160 small one, lightbox the original', () => {
  const derived = derivedSmallThumbUrl(original);
  assert.equal(derived, small);
  for (const uploadSource of ['chat', 'gallery', 'meeting', 'memo', '']) {
    assert.equal(selectImageVariant({ surface: 'grid', uploadSource, original, chatThumb }), chatThumb);
    assert.equal(selectImageVariant({ surface: 'chat-bubble', uploadSource, original, chatThumb }), chatThumb);
    assert.equal(selectImageVariant({ surface: 'mini', uploadSource, original, chatThumb }), small);
    assert.equal(selectImageVariant({ surface: 'lightbox', uploadSource, original, chatThumb }), original);
  }
  // No 512 thumb (a stored thumb that is itself the small file, or none): the small one, then the original.
  assert.equal(selectImageVariant({ surface: 'grid', uploadSource: 'memo', original, chatThumb: small }), small);
  assert.equal(selectImageVariant({ surface: 'grid', original: 'https://cdn.example/a.jpg' }), 'https://cdn.example/a.jpg');
  // A stored thumb that is the original itself: tiles take the 160px file instead of the full one.
  assert.equal(selectImageVariant({ surface: 'grid', original, chatThumb: original }), small);
  assert.equal(siblingSmallStoragePath('chatImages/cw/legacy.jpg'), 'chatImages/cw/legacy_small.webp');
  assert.equal(derivedSmallThumbUrl('https://cdn.example/not-storage.jpg'), '');
});

test('migration is idempotent and will not delete the only original, including mislabeled webp', () => {
  assert.equal(variantMigrationPlan({
    chat: false,
    smallObjectExists: true,
    thumbPath: 'chatImages/cw/1_small.webp',
    smallPath: 'chatImages/cw/1_small.webp',
    refsPointAtSmall: true,
    thumbStillReferenced: false,
  }).skip, true);

  const pending = variantMigrationPlan({
    chat: false,
    smallObjectExists: false,
    thumbPath: 'chatImages/cw/1_thumb_400b.webp',
    smallPath: 'chatImages/cw/1_small.webp',
    originalPaths: ['chatImages/cw/1_original_2000b.webp'],
  });
  assert.equal(pending.createSmall, true);
  assert.equal(pending.deleteThumb, false);

  const readyToRetarget = variantMigrationPlan({
    chat: false,
    smallObjectExists: true,
    thumbPath: 'chatImages/cw/1_thumb_400b.webp',
    smallPath: 'chatImages/cw/1_small.webp',
    refsPointAtSmall: false,
    thumbStillReferenced: true,
  });
  // Tiles show the 512 thumb now: refs are never retargeted to the small file.
  assert.equal(readyToRetarget.createSmall, false);
  assert.equal(readyToRetarget.retargetThumb, false);
  assert.equal(readyToRetarget.deleteThumb, false);
  assert.equal(readyToRetarget.skip, true);

  assert.equal(canDeleteSupersededThumb({
    chat: false,
    thumbPath: 'chatImages/cw/1_thumb_400b.jpg',
    originalPaths: ['chatImages/cw/legacy.jpg'],
    smallExists: true,
    refsPointAtSmall: true,
    thumbStillReferenced: false,
    thumbIsOriginalBytes: false,
  }), false); // the 512 thumb is never deleted
  assert.equal(canDeleteSupersededThumb({
    chat: false,
    thumbPath: 'chatImages/cw/legacy.jpg',
    originalPaths: ['chatImages/cw/legacy.jpg'],
    smallExists: true,
    refsPointAtSmall: true,
    thumbStillReferenced: false,
  }), false);
  assert.equal(canDeleteSupersededThumb({
    chat: true,
    thumbPath: 'chatImages/cw/1_thumb_400b.webp',
    smallExists: true,
    refsPointAtSmall: true,
    thumbStillReferenced: false,
  }), false);
  assert.equal(canDeleteSupersededThumb({
    chat: false,
    thumbPath: 'chatImages/cw/1_thumb_400b.webp',
    smallExists: false,
    refsPointAtSmall: false,
    thumbStillReferenced: true,
  }), false);
  assert.equal(canDeleteSupersededThumb({
    chat: false,
    thumbPath: 'chatImages/cw/1_original_2000b.jpg',
    originalPaths: ['chatImages/cw/1_original_2000b.jpg'],
    smallExists: true,
    refsPointAtSmall: true,
    thumbStillReferenced: false,
    thumbIsOriginalBytes: true,
  }), false);
  assert.equal(jpgOriginal.includes('legacy.jpg'), true);
});
