import test from 'node:test';
import assert from 'node:assert/strict';
import { buildImageGeoMap, persistImageGeoMap, isValidCoordinatePair } from '../src/core/photo-geo.js';
import { canonicalPhotoAssetKey } from '../src/core/photo-asset.js';

const url = n => `https://firebasestorage.googleapis.com/v0/b/x.appspot.com/o/chatImages%2Fcw%2F${n}_original.jpg?alt=media&token=t`;

test('geo map is keyed by the canonical asset key and skips photos without GPS', () => {
  const images = [
    { imageUrl: url('a'), metadata: { latitude: 37.4336612345, longitude: 127.0200812345 } },
    { imageUrl: url('b'), metadata: {} },
    { imageUrl: url('c'), metadata: { latitude: 0, longitude: 0 } }
  ];
  const map = buildImageGeoMap(images);
  assert.deepEqual(Object.keys(map), [canonicalPhotoAssetKey({ imageUrl: url('a') })]);
  assert.deepEqual(Object.values(map)[0], { lat: 37.43366, lng: 127.02008 });
  assert.ok(!isValidCoordinatePair(91, 0));
});

test('persisting is best effort: a rejected update resolves false instead of throwing', async () => {
  const calls = [];
  const db = { collection: c1 => ({ doc: d1 => ({ collection: c2 => ({ doc: d2 => ({ update: async data => { calls.push([c1, d1, c2, d2, data]); throw Object.assign(new Error('denied'), { code: 'permission-denied' }); } }) }) }) }) };
  const ok = await persistImageGeoMap({ db, calendarId: 'cw', docId: 'm1', geoMap: { k: { lat: 1, lng: 2 } } });
  assert.equal(ok, false);
  assert.deepEqual(calls[0].slice(0, 4), ['calendars', 'cal_cw', 'messages', 'm1']);
  assert.equal(await persistImageGeoMap({ db, calendarId: 'cw', docId: 'm1', geoMap: {} }), false, 'nothing to write');
});
