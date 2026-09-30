import test from 'node:test';
import assert from 'node:assert/strict';
import {
  classifyGalleryItem,
  dedupeGalleryFiles
} from '../src/core/gallery-item-kind.js';
import { isGalleryWebLinkPhoto } from '../src/core/gallery-data.js';
import { getPhotoTagCompleteness } from '../src/core/photo-tag-completeness.js';

const storageImage = 'https://firebasestorage.googleapis.com/v0/b/metro-live-2918e.firebasestorage.app/o/chatImages%2Fkkot%2Fphoto.webp?alt=media&token=abc';
const storagePdf = 'https://firebasestorage.googleapis.com/v0/b/metro-live-2918e.firebasestorage.app/o/chatFiles%2Fkkot%2Fgallery_files_kkot.pdf?alt=media&token=abc';
const webpage = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';

test('a PDF storage URL is a file, not a photo or a link', () => {
  const item = { full: storagePdf, url: storagePdf, storagePath: 'chatFiles/kkot/gallery_files_kkot.pdf', mime: 'application/pdf', ext: 'pdf', name: 'gallery_files_kkot.pdf' };
  assert.equal(classifyGalleryItem(item), 'file');
  assert.equal(classifyGalleryItem({ full: storagePdf }), 'file');
  assert.notEqual(classifyGalleryItem({ full: storagePdf }), 'photo');
  assert.equal(isGalleryWebLinkPhoto({ full: storagePdf }), false);
});

test('a storage image is a photo, not a link', () => {
  const item = { source: 'chat', full: storageImage, thumb: storageImage };
  assert.equal(classifyGalleryItem(item), 'photo');
  assert.notEqual(classifyGalleryItem(item), 'link');
  assert.equal(isGalleryWebLinkPhoto(item), false);
  // source:link must not turn a stored image into a link. PR #812 kept every
  // storage host in 사진; mime/extension is what decides, not the host.
  assert.equal(classifyGalleryItem({ source: 'link', full: storageImage }), 'photo');
});

test('an http webpage is a link, not a photo', () => {
  const item = { source: 'chat', url: webpage, full: webpage };
  assert.equal(classifyGalleryItem(item), 'link');
  assert.notEqual(classifyGalleryItem(item), 'photo');
  assert.equal(isGalleryWebLinkPhoto(item), true);
  assert.equal(isGalleryWebLinkPhoto({ directMediaUrl: 'https://naver.me/abc', full: storageImage }), true);
});

test('person-tag names present in the caption are not 인물 누락', () => {
  const calendar = {
    places: [{ name: '연지근린공원' }, { name: '메가커피' }],
    participants: [{ name: '박영우', alias: '영우' }],
    customPersonTags: ['서준', '도은']
  };
  const caption = '연지근린공원 260910 아이폰 서준 도은 메가커피';
  const result = getPhotoTagCompleteness(caption, calendar, { caption, tags: caption });
  assert.equal(result.hasDate, true);
  assert.equal(result.hasPlace, true);
  assert.equal(result.hasPerson, true);
  assert.equal(result.missing.includes('인물'), false);

  const untagged = getPhotoTagCompleteness('연지근린공원 260910 아이폰 메가커피', calendar);
  assert.equal(untagged.hasPerson, false);
  assert.equal(untagged.missing.includes('인물'), true);

  // Alias and a typed personTags list count even when participants[].name does not.
  assert.equal(getPhotoTagCompleteness('서준', { participants: [{ name: '첫째', alias: '서준' }] }).hasPerson, true);
  assert.equal(getPhotoTagCompleteness('풍경', { participants: [{ name: '첫째', alias: '서준' }], customPersonTags: ['도은'] }, { personTags: ['도은'] }).hasPerson, true);
});

test('file tab duplicates collapse on storage path, not message id', () => {
  const path = 'chatFiles/kkot/same.pdf';
  const first = {
    id: 'file_a', name: 'same.pdf', mime: 'application/pdf', ext: 'pdf', size: 1200,
    storagePath: path, messageId: 'msg_1',
    url: 'https://firebasestorage.googleapis.com/v0/b/x/o/chatFiles%2Fkkot%2Fsame.pdf?alt=media&token=1'
  };
  const second = {
    ...first, id: 'file_b', messageId: 'msg_2', memoId: 'memo_9',
    url: 'https://firebasestorage.googleapis.com/v0/b/x/o/chatFiles%2Fkkot%2Fsame.pdf?alt=media&token=2'
  };
  const other = {
    id: 'file_c', name: 'other.pdf', mime: 'application/pdf', ext: 'pdf', size: 99,
    storagePath: 'chatFiles/kkot/other.pdf', messageId: 'msg_1',
    url: 'https://firebasestorage.googleapis.com/v0/b/x/o/chatFiles%2Fkkot%2Fother.pdf?alt=media'
  };
  const deduped = dedupeGalleryFiles([first, second, other]);
  assert.equal(deduped.length, 2);
  assert.equal(deduped[0].messageId, 'msg_1');
  assert.equal(deduped[1].name, 'other.pdf');

  const nameless = dedupeGalleryFiles([
    { name: 'ticket.pdf', size: 42, messageId: 'a' },
    { name: 'ticket.pdf', size: 42, messageId: 'b' }
  ]);
  assert.equal(nameless.length, 1);
});
