import test from 'node:test';
import assert from 'node:assert/strict';
import { buildPlacePhotoGroups } from '../src/ui/archive-place-groups.js';
import { buildTagSuggestions, albumDateOf, dateTagToken } from '../src/ui/archive-tag-suggestions.js';

const places = [
  { id: 'p1', name: '예당호 출렁다리', lat: 36.62, lng: 126.83 },
  { id: 'p2', name: '아르떼뮤지엄 제주', lat: 33.4, lng: 126.3 },
];
const dateTokens = text => (String(text || '').match(/\b\d{6}\b/g) || []).map(t => `20${t.slice(0, 2)}-${t.slice(2, 4)}-${t.slice(4, 6)}`);
const run = photos => buildTagSuggestions({
  photos,
  places,
  placeGroups: buildPlacePhotoGroups({ places, photos, getPhotoDates: p => dateTokens(p.tags), doesPlaceMatchDate: () => false }),
  getPhotoDates: p => dateTokens(p.tags),
  personLabels: ['박서준', '유리', '영우'],
});

test('a photo filed under a place by GPS gets that place tag suggested', () => {
  const photos = [{ assetKey: 'a', tags: '260919 아이폰15', latitude: 36.6201, longitude: 126.8301, messageId: 'm1' }];
  const { groups } = run(photos);
  assert.equal(groups.length, 1);
  assert.equal(groups[0].tag, '예당호출렁다리');
  assert.equal(groups[0].rule, 'registered');
});

test('the upload batch follows its anchored photos, and tagged photos are not suggested again', () => {
  const photos = [
    { assetKey: 'a', tags: '260919 예당호출렁다리 아이폰15', messageId: 'm1' },
    { assetKey: 'b', tags: '260919 아이폰15', messageId: 'm1' },
  ];
  const { groups } = run(photos);
  assert.deepEqual(groups.map(g => [g.tag, g.photos.map(p => p.assetKey)]), [['예당호출렁다리', ['b']]]);
});

test('same-day majority place needs two anchors and skips screenshots', () => {
  const photos = [
    { assetKey: 'a', tags: '220523 아르떼뮤지엄제주 아이폰13', messageId: 'm1' },
    { assetKey: 'b', tags: '220523 아르떼뮤지엄제주 아이폰13', messageId: 'm2' },
    { assetKey: 'c', tags: '220523 아이폰13', messageId: 'm3' },
    { assetKey: 'd', tags: '220523 캡처', messageId: 'm4' },
  ];
  const { groups } = run(photos);
  const sameDay = groups.find(g => g.rule === 'same-day');
  assert.ok(sameDay);
  assert.deepEqual(sameDay.photos.map(p => p.assetKey), ['c']);
  const single = run(photos.slice(1));
  assert.equal(single.groups.some(g => g.rule === 'same-day'), false, 'one anchor is not enough');
});

test('album uploads without a date tag get the album date', () => {
  assert.equal(albumDateOf({ messageId: 'meeting_cw_2026-09-19_1789938071166_0_2blluk' }), '2026-09-19');
  assert.equal(dateTagToken('2026-09-19'), '260919');
  const { groups } = run([{ assetKey: 'a', tags: '김치볶음밥', messageId: 'meeting_cw_2026-09-19_17899_0_x' }]);
  assert.deepEqual(groups.map(g => [g.kind, g.tag]), [['date', '260919']]);
});

test('person candidates come from the same day, given names count, and nothing is pre-applied', () => {
  const photos = [
    { assetKey: 'a', tags: '260919 서준 유리' },
    { assetKey: 'b', tags: '260919 서준' },
    { assetKey: 'c', tags: '260919' },
    { assetKey: 'd', tags: '260920' },
  ];
  const { personDays, groups } = run(photos);
  assert.equal(groups.length, 0);
  assert.equal(personDays.length, 1);
  assert.equal(personDays[0].date, '2026-09-19');
  assert.deepEqual(personDays[0].photos.map(p => p.assetKey), ['c']);
  assert.deepEqual(personDays[0].candidates.map(c => [c.label, c.count]), [['서준', 2], ['유리', 1]]);
});

test('a tag most of an upload batch shares is offered to the rest, device names are not', () => {
  const photos = [
    { assetKey: 'a', tags: '260919 바이킹 Apple iPhone 14 Pro', messageId: 'm1' },
    { assetKey: 'b', tags: '260919 바이킹 Apple iPhone 14 Pro', messageId: 'm1' },
    { assetKey: 'c', tags: '260919 바이킹 서준', messageId: 'm1' },
    { assetKey: 'd', tags: '260919 Apple iPhone 14 Pro', messageId: 'm1' },
    { assetKey: 'e', tags: '260919 바이킹', messageId: 'm2' },
  ];
  const { groups } = run(photos);
  assert.deepEqual(groups.map(g => [g.rule, g.tag, g.photos.map(p => p.assetKey)]), [['batch', '바이킹', ['d']]]);
});
