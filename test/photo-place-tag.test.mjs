import test from 'node:test';
import assert from 'node:assert/strict';
import { buildMetadataTags, nearestPlaceForCoords, setPhotoTagPlaces } from '../src/core/photo-metadata-tags.js';

const places = [
  { name: '서울랜드', lat: 37.4344, lng: 127.0205 },
  { name: '과천과학관', lat: 37.4378, lng: 126.9990 },
  { name: '좌표없는곳' },
  { name: '지운곳', lat: 37.4344, lng: 127.0205, deletedAt: 1 }
];

test('nearest registered place within 200m', () => {
  assert.equal(nearestPlaceForCoords(37.43366, 127.02008, places).name, '서울랜드');
  assert.equal(nearestPlaceForCoords(37.5, 127.1, places), null);
  assert.equal(nearestPlaceForCoords(0, 0, places), null);
  assert.equal(nearestPlaceForCoords(undefined, undefined, places), null);
});

test('upload tags include the registered place name when the GPS position is next to it', () => {
  setPhotoTagPlaces(places);
  const tags = buildMetadataTags({ capturedAt: '2026-09-26T03:00:00.000Z', latitude: 37.43366, longitude: 127.02008, device: 'samsung SM-F916N' }, { uploadDate: '2026-09-26' });
  assert.match(tags, /#서울랜드/);
  assert.match(tags, /#260926/);
  const far = buildMetadataTags({ latitude: 35.1, longitude: 129.0 }, { uploadDate: '2026-09-26' });
  assert.doesNotMatch(far, /서울랜드/);
  setPhotoTagPlaces([{ name: '지운곳', lat: 37.4344, lng: 127.0205, deletedAt: 1 }]);
  assert.doesNotMatch(buildMetadataTags({ latitude: 37.43366, longitude: 127.02008 }, {}), /지운곳/, 'deleted places are never tagged');
  setPhotoTagPlaces([]);
});
