import { test } from 'node:test';
import assert from 'node:assert/strict';

globalThis.window = globalThis.window || {};
const {
  parsePlaceMemoEntries,
  stripDummyPhotoVisitMemos,
  isDummyPhotoVisitNote,
  normalizePlaces
} = await import('../src/core/app-domain-helpers.js');

test('isDummyPhotoVisitNote detects dummy photo visit notes', () => {
  assert.equal(isDummyPhotoVisitNote('사진'), true);
  assert.equal(isDummyPhotoVisitNote('사진 3장'), true);
  assert.equal(isDummyPhotoVisitNote('/ 사진 /'), true);
  assert.equal(isDummyPhotoVisitNote(''), false);
  assert.equal(isDummyPhotoVisitNote('서준네 도은네'), false);
  assert.equal(isDummyPhotoVisitNote('사진 많이 찍음'), false);
});

test('stripDummyPhotoVisitMemos removes dummy photo visit entries from memo text', () => {
  const seoulLand = '2026.09.26(토) 서준네 도은네 26.09.13 사진 26.09.15 사진 26.09.28 사진';
  assert.equal(stripDummyPhotoVisitMemos(seoulLand), '2026.09.26(토) 서준네 도은네');

  const multiLine = `2026.09.26(토) 서준네 도은네\n26.09.13 사진\n26.09.15 사진\n26.09.28 사진`;
  assert.equal(stripDummyPhotoVisitMemos(multiLine), '2026.09.26(토) 서준네 도은네');

  const onlyPhotos = '26.09.13 사진 26.09.15 사진';
  assert.equal(stripDummyPhotoVisitMemos(onlyPhotos), '');
});

test('parsePlaceMemoEntries excludes dummy photo visit notes', () => {
  const seoulLand = '2026.09.26(토) 서준네 도은네 26.09.13 사진 26.09.15 사진 26.09.28 사진';
  const entries = parsePlaceMemoEntries(seoulLand);
  assert.equal(entries.length, 1);
  assert.ok(entries[0].note.includes('서준네 도은네'));
});

test('normalizePlaces sanitizes dummy photo visit memos', () => {
  const places = normalizePlaces([{
    id: 'p1',
    name: '서울랜드',
    lat: 37.436,
    lng: 127.020,
    memo: '2026.09.26(토) 서준네 도은네 26.09.13 사진 26.09.15 사진 26.09.28 사진'
  }]);
  assert.equal(places[0].memo, '2026.09.26(토) 서준네 도은네');
});
