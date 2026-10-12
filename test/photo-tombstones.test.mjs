import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { alignedFingerprint, rowFingerprint, tombstoneFor, fingerprintId } = require('../functions/photo-tombstones.js');

const fp = n => `sha256:${String(n).repeat(64)}`;
const https = name => `https://firebasestorage.googleapis.com/v0/b/x/o/${name}?alt=media`;

test('a slot fingerprint is trusted only when the list lines up with the photos', () => {
  assert.equal(alignedFingerprint([fp(1), fp(2)], ['a', 'b'], 1), fp(2));
  assert.equal(alignedFingerprint([fp(1), fp(2)], ['b'], 0), '', 'a list that lost a slot names a neighbour');
  assert.equal(alignedFingerprint(['descriptor:abc'], ['a'], 0), '', 'only sha256 names a file exactly');
  assert.equal(alignedFingerprint(undefined, ['a'], 0), '');
});

test('a row keeps its fingerprint when the owner that carried it goes', () => {
  assert.equal(rowFingerprint([{ sourceOwner: 'meeting:d:0' }, { fingerprint: fp(3) }], null), fp(3));
  assert.equal(rowFingerprint([{ sourceOwner: 'meeting:d:0' }], { fingerprint: fp(4) }), fp(4));
  assert.equal(rowFingerprint([], {}), '');
});

test('the note names the stored original and thumbnail, from the row or the removed entry', () => {
  const fromRow = tombstoneFor({ assetKey: 'asset:v1:a', existing: { full: https('a_original'), thumb: https('a_thumb'), fingerprint: fp(5), owners: [] }, now: 9 });
  assert.deepEqual(fromRow, { id: '5'.repeat(64), data: { fingerprint: fp(5), imageUrl: https('a_original'), thumbUrl: https('a_thumb'), assetKey: 'asset:v1:a', deletedAt: 9 } });
  const fromEntry = tombstoneFor({ assetKey: 'asset:v1:b', existing: {}, removed: { full: https('b_original'), thumb: '', fingerprint: fp(6) }, now: 1 });
  assert.equal(fromEntry.id, '6'.repeat(64));
  assert.equal(fromEntry.data.thumbUrl, https('b_original'), 'no thumbnail: the original stands in');
  assert.equal(tombstoneFor({ assetKey: 'k', existing: { full: 'data:image/png;base64,xx', fingerprint: fp(7) } }), null, 'only a stored file');
  assert.equal(tombstoneFor({ assetKey: 'k', existing: { full: https('c') } }), null, 'no fingerprint, no note');
  assert.equal(fingerprintId(`sha256:${'A'.repeat(64)}`), '', 'hex digests are lower case');
});
