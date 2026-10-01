import test from 'node:test';
import assert from 'node:assert/strict';

// app-image-pipeline reads window at evaluation time. Do not install document before that
// import: app-firebase-data starts a long background retry interval when both window and
// document exist, which keeps the test process alive.
globalThis.window = globalThis.window || {};
if (typeof globalThis.URL.createObjectURL !== 'function') {
  globalThis.URL.createObjectURL = () => 'blob:image-original-webp-test';
  globalThis.URL.revokeObjectURL = () => {};
}

const encodes = [];
globalThis.createImageBitmap = async () => ({ ...bitmapSize, close() {} });

let bitmapSize = { width: 1200, height: 800 };
const { compressImageToDataUrls } = await import('../src/core/app-image-pipeline.js');

globalThis.document = {
  createElement(tag) {
    assert.equal(tag, 'canvas');
    const canvas = {
      width: 0,
      height: 0,
      getContext() {
        return { drawImage() {} };
      },
      toBlob(callback, type, quality) {
        encodes.push({ type, quality, width: canvas.width, height: canvas.height });
        callback(new Blob([new Uint8Array(24)], { type: type || '' }));
      },
      toDataURL() {
        return 'data:image/jpeg;base64,QQ==';
      }
    };
    return canvas;
  }
};

function imageFile(name, type, header, size = 80 * 1024) {
  const bytes = new Uint8Array(size);
  header.forEach((byte, index) => { bytes[index] = byte; });
  return new File([bytes], name, { type });
}

test('a small camera JPEG is stored as WebP at the large-photo quality, not the original file', async () => {
  encodes.length = 0;
  bitmapSize = { width: 1200, height: 800 };
  const file = imageFile('camera.jpg', 'image/jpeg', [0xff, 0xd8, 0xff]);
  assert.ok(file.size <= 1.5 * 1024 * 1024);
  const compressed = await compressImageToDataUrls(file);
  assert.equal(compressed.originalBlob.type, 'image/webp');
  assert.notEqual(compressed.originalBlob, file);
  assert.equal(compressed.thumbnailBlob.type, 'image/webp');
  assert.equal(compressed.smallThumbBlob.type, 'image/webp');
  assert.deepEqual(encodes.map(item => item.type), ['image/webp', 'image/webp', 'image/webp']);
  assert.equal(encodes[0].quality, 0.85);
  assert.equal(encodes[0].width, 1200);
  assert.equal(encodes[0].height, 800);
  assert.equal(encodes[1].quality, 0.80);
  assert.equal(encodes[1].width, 512);
  assert.equal(encodes[2].quality, 0.80);
  assert.equal(encodes[2].width, 160);
  assert.equal(encodes[2].height, 107);
});

test('an oversized still is still capped at 2000px and WebP quality 0.85', async () => {
  encodes.length = 0;
  bitmapSize = { width: 4000, height: 3000 };
  const file = imageFile('huge.png', 'image/png', [0x89, 0x50, 0x4e, 0x47], 2 * 1024 * 1024);
  const compressed = await compressImageToDataUrls(file);
  assert.equal(compressed.originalBlob.type, 'image/webp');
  assert.equal(encodes[0].quality, 0.85);
  assert.equal(encodes[0].width, 2000);
  assert.equal(encodes[0].height, 1500);
});

test('a small GIF keeps its original bytes so animation is not flattened', async () => {
  encodes.length = 0;
  bitmapSize = { width: 400, height: 300 };
  const file = imageFile('loop.gif', 'image/gif', [0x47, 0x49, 0x46, 0x38, 0x39, 0x61]);
  const compressed = await compressImageToDataUrls(file);
  assert.equal(compressed.originalBlob, file);
  assert.equal(compressed.originalBlob.type, 'image/gif');
  assert.equal(compressed.thumbnailBlob.type, 'image/webp');
  assert.equal(compressed.smallThumbBlob.type, 'image/webp');
  assert.equal(encodes.length, 2);
  assert.equal(encodes[0].quality, 0.80);
  assert.equal(encodes[0].width, 400);
  assert.equal(encodes[1].quality, 0.80);
  assert.equal(encodes[1].width, 160);
});
