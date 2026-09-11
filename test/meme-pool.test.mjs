import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  parseHashtagInput,
  generateMemePoolId,
  matchMemePoolByKeyword,
  describeMemeUploadError,
  isHeicFile,
  isGif
} from '../src/core/meme-pool.js';

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
  assert.match(describeMemeUploadError(new Error('HEIC 사진은 JPG')), /HEIC/);
});

test('isHeicFile / isGif detect by type or extension', () => {
  assert.equal(isHeicFile({ type: 'image/heic', name: 'a.heic' }), true);
  assert.equal(isHeicFile({ type: 'image/jpeg', name: 'a.jpg' }), false);
  assert.equal(isGif({ type: 'image/gif', name: 'x.gif' }), true);
  assert.equal(isGif({ type: 'image/png', name: 'x.png' }), false);
});
