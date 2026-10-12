import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { buildMetadataTags } from '../src/core/photo-metadata-tags.js';

const require = createRequire(import.meta.url);
const { removeAssetSlots, getPhotoAssetKey } = require('../functions/media-commands.js');

const url = name => `https://firebasestorage.googleapis.com/v0/b/demo/o/chatImages%2Fcal%2F${name}?alt=media&token=t`;

test('deleting one photo removes that same slot from every per-photo list', () => {
  const [a, b, c] = ['a', 'b', 'c'].map(name => ({ imageUrl: url(`${name}_original_1b.png`), thumbUrl: url(`${name}_thumb_1b.png`) }));
  const data = {
    text: '갤러리 사진',
    imageUrls: [a.imageUrl, b.imageUrl, c.imageUrl],
    thumbUrls: [a.thumbUrl, b.thumbUrl, c.thumbUrl],
    imageTags: ['ta', 'tb', 'tc'],
    imageFingerprints: ['sha256:a', 'sha256:b', 'sha256:c'],
    imageIntake: [{ name: 'a' }, { name: 'b' }, { name: 'c' }],
    imageShareUrls: ['', 'https://share/b', ''],
    imageGeoMap: { [getPhotoAssetKey(b.imageUrl)]: { lat: 1, lng: 2 }, [getPhotoAssetKey(c.imageUrl)]: { lat: 3, lng: 4 } },
  };
  const { patch, deleteDoc } = removeAssetSlots(data, b);
  assert.equal(deleteDoc, false);
  assert.deepEqual(patch.imageUrls, [a.imageUrl, c.imageUrl]);
  assert.deepEqual(patch.imageTags, ['ta', 'tc']);
  assert.deepEqual(patch.imageFingerprints, ['sha256:a', 'sha256:c'], 'the next photo does not inherit the removed fingerprint');
  assert.deepEqual(patch.imageIntake.map(item => item.name), ['a', 'c']);
  assert.deepEqual(patch.imageShareUrls, ['', '']);
  assert.deepEqual(Object.keys(patch.imageGeoMap), [getPhotoAssetKey(c.imageUrl)]);

  const legacy = removeAssetSlots({ ...data, imageFingerprints: ['sha256:a', 'sha256:b'] }, b);
  assert.equal('imageFingerprints' in legacy.patch, false, 'a list already out of step is not guessed at');
  const without = removeAssetSlots({ text: 'x', imageUrls: [a.imageUrl, b.imageUrl], thumbUrls: [a.thumbUrl, b.thumbUrl] }, a);
  assert.equal('imageFingerprints' in without.patch, false, 'a list the record never had is not created');
});

test('a re-upload that reuses a stored original keeps that photo\'s tags', () => {
  assert.equal(buildMetadataTags({ inheritedTags: '서준 도은 영월', capturedAt: '2026-10-09T10:00:00' }, { uploadDate: '2026-10-12' }), '서준 도은 영월');
  assert.notEqual(buildMetadataTags({ capturedAt: '2026-10-09T10:00:00' }, { uploadDate: '2026-10-12' }), '');
  const pipeline = readFileSync(new URL('../src/core/app-image-pipeline.js', import.meta.url), 'utf8');
  assert.match(pipeline, /reuseByIndex\.set\(entry\.index, \{ \.\.\.original, tags: await readStoredPhotoTags\(calendarId, original\.imageUrl\) \}\)/);
  assert.match(pipeline, /inheritedTags: original\.tags/);
});

test('a delete also reads the albums of photos whose position shifts', () => {
  const source = readFileSync(new URL('../functions/media-commands.js', import.meta.url), 'utf8');
  assert.match(source, /const meetingScope = await widenScopeForShiftedSlots\(root, owners\.messages, asset,/);
});
