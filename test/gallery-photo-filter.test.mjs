import test from 'node:test';
import assert from 'node:assert/strict';
import { isGalleryWebLinkPhoto, isStoredGalleryMediaUrl } from '../src/core/gallery-data.js';

const storage = 'https://firebasestorage.googleapis.com/v0/b/metro-live-2918e.firebasestorage.app/o/chatImages%2Fkkot%2Fphoto.webp?alt=media&token=abc';

test('firebase storage photoIndex rows stay in the photo tab', () => {
  assert.equal(isStoredGalleryMediaUrl(storage), true);
  assert.equal(isGalleryWebLinkPhoto({
    source: 'chat',
    full: storage,
    thumb: storage
  }), false);
});

test('webpage links are not gallery photos', () => {
  assert.equal(isGalleryWebLinkPhoto({
    source: 'chat',
    full: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
  }), true);
  assert.equal(isGalleryWebLinkPhoto({ source: 'link', full: storage }), false);
  assert.equal(isGalleryWebLinkPhoto({ directMediaUrl: 'https://naver.me/abc', full: storage }), true);
});
