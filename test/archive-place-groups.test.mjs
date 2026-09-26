import test from 'node:test';
import assert from 'node:assert/strict';
import { buildPlacePhotoGroups, photoMatchesPlaceTag, compactPlaceToken } from '../src/ui/archive-place-groups.js';

const places = [
  { id: 'p1', name: '서울랜드', visits: ['2026-09-26'] },
  { id: 'p2', name: '예당호 출렁다리', alias: '예당호', visits: ['2026-09-20'] },
  { id: 'p3', name: '막국수집', visits: ['2026-09-20'] },
  { id: 'p4', name: '지운 장소', deletedAt: 1, visits: ['2026-09-26'] }
];
const doesPlaceMatchDate = (place, date) => (place.visits || []).includes(date);
const getPhotoDates = photo => String(photo.tags || '').match(/\d{6}/g)?.map(t => `20${t.slice(0, 2)}-${t.slice(2, 4)}-${t.slice(4, 6)}`) || [];

test('place tags match names and aliases, including longer tags', () => {
  assert.equal(compactPlaceToken('예당호 출렁다리'), '예당호출렁다리');
  assert.ok(photoMatchesPlaceTag({ tags: '#예당호출렁다리 #260920' }, places[1]));
  assert.ok(photoMatchesPlaceTag({ tags: '#예당호야경' }, places[1]));
  assert.ok(!photoMatchesPlaceTag({ tags: '#서울 #260926' }, places[0]));
});

test('a date with exactly one place claims the photo; several places go to 분류 필요', () => {
  const photos = [
    { id: 'a', tags: '#260926 #260925 아이폰17 서준' },
    { id: 'shot', tags: '#260926' },
    { id: 'b', tags: '260920 갤럭시Z폴드2 서준' },
    { id: 'c', tags: '260920 막국수집 도은' },
    { id: 'm', tags: '#260926', uploadSource: 'meeting' },
    { id: 'd', tags: '#260101' }
  ];
  const { groups, unclassified, unclassifiedCount } = buildPlacePhotoGroups({ places, photos, getPhotoDates, doesPlaceMatchDate });
  const byId = Object.fromEntries(groups.map(g => [g.place.id, g.photos.map(p => p.id)]));
  assert.deepEqual(byId.p1, ['a', 'm'], 'screenshots are not filed by date; 일정 uploads are');
  assert.deepEqual(byId.p3, ['c']);
  assert.equal(byId.p2, undefined);
  assert.equal(byId.p4, undefined, 'deleted places never get a group');
  assert.equal(unclassifiedCount, 1);
  assert.equal(unclassified[0].date, '2026-09-20');
  assert.deepEqual(unclassified[0].candidates.map(p => p.id), ['p2', 'p3']);
  assert.deepEqual(unclassified[0].photos.map(p => p.id), ['b']);
});

test('groups are ordered by most recent visit', () => {
  const photos = [{ id: 'x', tags: '#예당호' }, { id: 'y', tags: '#서울랜드 #260926' }];
  const { groups } = buildPlacePhotoGroups({ places, photos, getPhotoDates, doesPlaceMatchDate });
  assert.deepEqual(groups.map(g => g.place.id), ['p1', 'p2']);
  assert.equal(groups[0].byTag, 1);
});

test('cover photos prefer camera shots over screenshots', async () => {
  const { orderCoverPhotos } = await import('../src/ui/archive-place-groups.js');
  const ordered = orderCoverPhotos([{ id: 'shot', tags: '#260920' }, { id: 'cam', tags: '260920 갤럭시Z폴드2 서준' }, { id: 'ip', tags: '아이폰17' }]);
  assert.deepEqual(ordered.map(p => p.id), ['cam', 'ip', 'shot']);
});

test('GPS position files a photo under the nearest registered place, even without tags', async () => {
  const { buildPlacePhotoGroups } = await import('../src/ui/archive-place-groups.js');
  const geoPlaces = [
    { id: 'g1', name: '서울랜드', lat: 37.4344, lng: 127.0205, visits: [] },
    { id: 'g2', name: '과천과학관', lat: 37.4378, lng: 126.9990, visits: ['2026-09-26'] }
  ];
  const photos = [
    { id: 'near', tags: '#260926', latitude: 37.43366, longitude: 127.02008 },
    { id: 'far', tags: '#260926 아이폰17', latitude: 35.1, longitude: 129.0 }
  ];
  const { groups } = buildPlacePhotoGroups({ places: geoPlaces, photos, getPhotoDates, doesPlaceMatchDate });
  const byId = Object.fromEntries(groups.map(g => [g.place.id, g.photos.map(p => p.id)]));
  assert.deepEqual(byId.g1, ['near'], 'GPS wins over the date rule (g2 is the only place visited that day)');
  assert.deepEqual(byId.g2, ['far'], 'no nearby place: falls back to the date rule');
  assert.equal(groups.find(g => g.place.id === 'g1').byGeo, 1);
});
