// "비슷한 사진" hints: a 64-bit difference hash per photo and grouping of photos whose hashes
// are within a few bits. Two different files of the same picture (re-saved, re-sent through a
// messenger, resized) hash alike; byte-identical copies are handled separately (sha256/md5).
// macOS `sips` scales the image to 9x8 BMP, so no image library is needed.
import { execFile } from 'node:child_process';
import { readFile, rm } from 'node:fs/promises';

const SIMILAR_MAX_DISTANCE = 6;
const MAX_GROUP_SIZE = 8;
const MAX_GROUPS = 60;

/** Grayscale pixels (row-major, top row first) of an uncompressed 24/32-bit BMP. */
export function bmpGray(buffer) {
  if (buffer.length < 54 || buffer.toString('ascii', 0, 2) !== 'BM') throw new Error('not a BMP');
  const offset = buffer.readUInt32LE(10);
  const width = buffer.readInt32LE(18);
  const rawHeight = buffer.readInt32LE(22);
  const bpp = buffer.readUInt16LE(28);
  if (bpp !== 24 && bpp !== 32) throw new Error(`unsupported BMP depth ${bpp}`);
  const height = Math.abs(rawHeight);
  const bottomUp = rawHeight > 0;
  const bytes = bpp / 8;
  const stride = Math.ceil((width * bytes) / 4) * 4;
  const gray = [];
  for (let y = 0; y < height; y += 1) {
    const row = bottomUp ? height - 1 - y : y;
    for (let x = 0; x < width; x += 1) {
      const at = offset + row * stride + x * bytes;
      const [b, g, r] = [buffer[at], buffer[at + 1], buffer[at + 2]];
      gray.push(0.299 * r + 0.587 * g + 0.114 * b);
    }
  }
  return { width, height, gray };
}

/** dHash of a 9x8 grayscale image: bit = left pixel brighter than its right neighbour. */
export function dHash({ width, height, gray }) {
  if (width !== 9 || height !== 8) throw new Error('dHash needs 9x8 pixels');
  let bits = '';
  for (let y = 0; y < 8; y += 1) {
    for (let x = 0; x < 8; x += 1) bits += gray[y * 9 + x] > gray[y * 9 + x + 1] ? '1' : '0';
  }
  return BigInt(`0b${bits}`).toString(16).padStart(16, '0');
}

export function hammingDistance(a, b) {
  let value = BigInt(`0x${a}`) ^ BigInt(`0x${b}`);
  let count = 0;
  while (value) { count += Number(value & 1n); value >>= 1n; }
  return count;
}

/** Look hash of an image file, or '' when it cannot be computed (never fails the analysis). */
export async function lookHashOfFile(filename) {
  const out = `${filename}.look.bmp`;
  try {
    await new Promise((resolve, reject) => execFile('/usr/bin/sips',
      ['-s', 'format', 'bmp', '--resampleHeightWidth', '8', '9', filename, '--out', out],
      { timeout: 20000 }, error => (error ? reject(error) : resolve())));
    return dHash(bmpGray(await readFile(out)));
  } catch (_) {
    return '';
  } finally {
    await rm(out, { force: true });
  }
}

/**
 * Groups of asset keys whose hashes are within SIMILAR_MAX_DISTANCE bits (single link). A
 * nearly flat picture (almost all bits equal) matches everything, so it is left out.
 */
export function similarGroups(hashes, { maxDistance = SIMILAR_MAX_DISTANCE } = {}) {
  const entries = Object.entries(hashes || {})
    .filter(([, hash]) => /^[0-9a-f]{16}$/.test(hash))
    .filter(([, hash]) => { const ones = hammingDistance(hash, '0000000000000000'); return ones >= 8 && ones <= 56; });
  const parent = entries.map((_, index) => index);
  const find = index => (parent[index] === index ? index : (parent[index] = find(parent[index])));
  for (let i = 0; i < entries.length; i += 1) {
    for (let j = i + 1; j < entries.length; j += 1) {
      if (hammingDistance(entries[i][1], entries[j][1]) <= maxDistance) parent[find(j)] = find(i);
    }
  }
  const groups = new Map();
  entries.forEach(([key], index) => {
    const root = find(index);
    if (!groups.has(root)) groups.set(root, []);
    groups.get(root).push(key);
  });
  return [...groups.values()]
    .filter(group => group.length >= 2 && group.length <= MAX_GROUP_SIZE)
    .slice(0, MAX_GROUPS);
}
