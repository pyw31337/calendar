import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { bmpGray, dHash, hammingDistance, similarGroups } from '../tools/local-media-worker/look-hash.mjs';

const require = createRequire(import.meta.url);
const { sanitizeAnalysisItem, sanitizeSimilarGroups } = require('../functions/media-analysis.js');

// 9x8 24-bit bottom-up BMP from a brightness function.
function bmp(brightness) {
  const stride = Math.ceil((9 * 3) / 4) * 4;
  const buffer = Buffer.alloc(54 + stride * 8);
  buffer.write('BM', 0, 'ascii');
  buffer.writeUInt32LE(54, 10);
  buffer.writeUInt32LE(40, 14);
  buffer.writeInt32LE(9, 18);
  buffer.writeInt32LE(8, 22);
  buffer.writeUInt16LE(1, 26);
  buffer.writeUInt16LE(24, 28);
  for (let y = 0; y < 8; y += 1) {
    for (let x = 0; x < 9; x += 1) {
      const v = brightness(x, y);
      const at = 54 + (7 - y) * stride + x * 3;
      buffer[at] = v; buffer[at + 1] = v; buffer[at + 2] = v;
    }
  }
  return buffer;
}

test('dHash reads a bottom-up BMP top row first and marks left-brighter pixels', () => {
  const pixels = bmpGray(bmp((x, y) => (y === 0 ? 200 - x * 10 : 10 + x * 10)));
  assert.equal(pixels.gray.length, 72);
  // Row 0 gets darker to the right (all 1s), the other rows brighter (all 0s).
  assert.equal(dHash(pixels), 'ff00000000000000');
});

test('re-saved copies group together, a different picture and a flat one do not', () => {
  const a = 'f0f0f0f00f0f0f0f';
  const resaved = 'f0f0f0f00f0f0f0e';
  const other = '0123456789abcdef';
  const flat = '0000000000000000';
  assert.equal(hammingDistance(a, resaved), 1);
  assert.deepEqual(similarGroups({ 'asset:v1:a': a, 'asset:v1:b': resaved, 'asset:v1:c': other, 'asset:v1:d': flat, 'asset:v1:e': flat }), [['asset:v1:a', 'asset:v1:b']]);
});

test('the server keeps only well-formed look hashes and asset-key groups', () => {
  const item = sanitizeAnalysisItem({ assetKey: 'asset:v1:abc', insight: { lookHash: 'f0f0f0f00f0f0f0f' } });
  assert.equal(item.lookHash, 'f0f0f0f00f0f0f0f');
  assert.equal('lookHash' in sanitizeAnalysisItem({ assetKey: 'asset:v1:abc', insight: { lookHash: 'nope' } }), false);
  assert.deepEqual(sanitizeSimilarGroups([['asset:v1:a', 'asset:v1:b', 'bad/key'], ['asset:v1:c']]), [{ assetKeys: ['asset:v1:a', 'asset:v1:b'] }]);
});
