import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { readImageGeo, pickPhotoIndexGeo } = require('../functions/photo-index-geo.js');

test('readImageGeo reads one asset from imageGeoMap and rejects junk', () => {
  const data = { imageGeoMap: { 'asset:v1:a': { lat: 37.43366, lng: 127.02008 }, 'asset:v1:z': { lat: 0, lng: 0 }, 'asset:v1:x': { lat: 'n', lng: 1 } } };
  assert.deepEqual(readImageGeo(data, 'asset:v1:a'), { latitude: 37.43366, longitude: 127.02008 });
  assert.equal(readImageGeo(data, 'asset:v1:z'), null);
  assert.equal(readImageGeo(data, 'asset:v1:x'), null);
  assert.equal(readImageGeo({}, 'asset:v1:a'), null);
});

test('coordinates come from any owner, not only the selected one', () => {
  const owners = [{ sourceOwner: 'message:m2:0' }, { sourceOwner: 'message:m1:0', latitude: 37.5, longitude: 127.1 }];
  assert.deepEqual(pickPhotoIndexGeo(owners, {}), { latitude: 37.5, longitude: 127.1 });
});

test('a late create event without coordinates keeps the ones already on the row', () => {
  // create (no imageGeoMap) and the follow-up geo update fire together; the create commits last.
  const ownersFromCreateEvent = [{ sourceOwner: 'message:m1:0' }];
  const rowWrittenByUpdateEvent = { latitude: 37.5, longitude: 127.1, owners: [] };
  assert.deepEqual(pickPhotoIndexGeo(ownersFromCreateEvent, rowWrittenByUpdateEvent), { latitude: 37.5, longitude: 127.1 });
  assert.deepEqual(pickPhotoIndexGeo(ownersFromCreateEvent, {}), {});
});
