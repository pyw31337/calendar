import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  parseHashtagInput,
  generateMemePoolId,
  matchMemePoolByKeyword,
  describeMemeUploadError,
  sniffImageFormat,
  isHeicFile,
  isGif
} from '../src/core/meme-pool.js';

function fakeFile(bytes, name, type) {
  const buf = Uint8Array.from(bytes);
  return {
    name,
    type,
    size: buf.length,
    slice(start, end) {
      const sliced = buf.slice(start, end ?? buf.length);
      return { arrayBuffer: async () => sliced.buffer.slice(sliced.byteOffset, sliced.byteOffset + sliced.byteLength) };
    }
  };
}

test('parseHashtagInput strips hashes, splits on space/comma, lowercases, dedupes', () => {
  assert.deepEqual(parseHashtagInput('#눈물 #화남 짜증, 눈물'), ['눈물', '화남', '짜증']);
});

test('generateMemePoolId matches the Cloud Function id regex', () => {
  const id = generateMemePoolId();
  assert.match(id, /^[A-Za-z0-9_-]{1,128}$/);
});

test('matchMemePoolByKeyword prefers the longest matching tag', () => {
  const pool = [
    { id: 'a', hashtags: ['눈물'] },
    { id: 'b', hashtags: ['눈물참기'] }
  ];
  const groups = matchMemePoolByKeyword(pool, '너무 눈물참기 힘들다');
  assert.equal(groups[0].tag, '눈물참기');
  assert.equal(groups[1].tag, '눈물');
});

test('describeMemeUploadError maps storage unauthorized and 401', () => {
  assert.match(describeMemeUploadError({ code: 'storage/unauthorized' }), /저장소 규칙/);
  assert.match(describeMemeUploadError(new Error('요청이 실패했습니다 (401)')), /비밀번호/);
  assert.match(describeMemeUploadError({ code: 'HEIC_CONVERT_FAILED' }), /사진을 처리하지/);
  assert.doesNotMatch(describeMemeUploadError({ code: 'HEIC_CONVERT_FAILED' }), /HEIC|JPG로 저장/);
});

test('isHeicFile / isGif detect by type or extension', () => {
  assert.equal(isHeicFile({ type: 'image/heic', name: 'a.heic' }), true);
  assert.equal(isHeicFile({ type: 'image/heif-sequence', name: 'a' }), true);
  assert.equal(isHeicFile({ type: 'image/jpeg', name: 'a.jpg' }), false);
  assert.equal(isGif({ type: 'image/gif', name: 'x.gif' }), true);
  assert.equal(isGif({ type: 'image/png', name: 'x.png' }), false);
});

test('sniffImageFormat reads magic bytes even when the name lies', async () => {
  const jpeg = await sniffImageFormat(fakeFile([0xff, 0xd8, 0xff, 0xe0], 'shot.png', 'image/png'));
  assert.equal(jpeg.kind, 'jpeg');
  const png = await sniffImageFormat(fakeFile([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a], 'a.jpg', ''));
  assert.equal(png.kind, 'png');
  const gif = await sniffImageFormat(fakeFile([0x47, 0x49, 0x46, 0x38, 0x39, 0x61], 'a.gif', 'image/gif'));
  assert.equal(gif.kind, 'gif');
  // ftyp + heic brand at bytes 8-11
  const heicBytes = [
    0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70,
    0x68, 0x65, 0x69, 0x63, 0x00, 0x00, 0x00, 0x00
  ];
  const heic = await sniffImageFormat(fakeFile(heicBytes, 'IMG_0001.JPG', 'image/jpeg'));
  assert.equal(heic.kind, 'heic');
  const mif1 = await sniffImageFormat(fakeFile([
    0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70,
    0x6d, 0x69, 0x66, 0x31, 0x00, 0x00, 0x00, 0x00
  ], 'photo.png', ''));
  assert.equal(mif1.kind, 'heic');
});
