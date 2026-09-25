import test from 'node:test';
import assert from 'node:assert/strict';

globalThis.window = globalThis.window || {};

const { canonicalPhotoAssetKey } = await import('../src/core/photo-asset.js');
const { resolvePhotoAsset } = await import('../src/core/gallery-thumb.js');
const { getMessageImageEntries, getPhotoAssetCommentKey, getPhotoCommentIdentity } = await import('../src/core/app-domain-helpers.js');

const storage = (token) =>
  `https://firebasestorage.googleapis.com/v0/b/x/o/chatImages%2Fcw%2Fphoto.jpg?alt=media&token=${token}`;

test('the same Storage object keeps one asset key when the download token rotates', () => {
  const a = canonicalPhotoAssetKey({ full: storage('aaa') });
  const b = canonicalPhotoAssetKey({ full: storage('bbb'), imageUrl: storage('ccc') });
  assert.equal(a, b);
  assert.match(a, /^asset:v1:[a-z0-9]+-[a-z0-9]+-[a-z0-9]+$/);
  assert.equal(getPhotoAssetCommentKey({ full: storage('zzz') }), a);
});

test('a broken thumb falls through to the original and ignores sibling imageUrls', () => {
  const full = 'https://cdn.test/original.jpg';
  const resolved = resolvePhotoAsset({
    thumb: 'https://cdn.test/dead-thumb.jpg',
    full,
    imageUrls: ['https://cdn.test/someone-else.jpg'],
    thumbUrls: ['https://cdn.test/someone-else-thumb.jpg'],
  }, { isBroken: (url) => String(url).includes('dead') });
  assert.equal(resolved.state, 'ready');
  assert.equal(resolved.displaySrc, full);
  assert.equal(resolved.assetKey, canonicalPhotoAssetKey({ full }));
  assert.equal(resolved.candidates.includes('https://cdn.test/someone-else.jpg'), false);
});

test('client key matches functions/index.js getPhotoAssetKey', async () => {
  const { readFileSync } = await import('node:fs');
  const { join } = await import('node:path');
  const { fileURLToPath, URL: nodeURL } = await import('node:url');
  const vm = await import('node:vm');
  const source = readFileSync(join(fileURLToPath(import.meta.url), '../../functions/index.js'), 'utf8');
  const start = source.indexOf('function normalizePhotoAssetUrl(value)');
  const end = source.indexOf('function getPhotoIndexEntries');
  assert.ok(start > 0 && end > start);
  const context = { URL: nodeURL, Math, key: '' };
  vm.runInNewContext(`${source.slice(start, end)}\nkey = getPhotoAssetKey(${JSON.stringify(storage('aaa'))});`, context);
  assert.equal(context.key, canonicalPhotoAssetKey({ full: storage('aaa') }));
});

test('message entries stamp the canonical asset key and keep the slot as a legacy alias', () => {
  const full = 'https://cdn.test/food.jpg';
  const entries = getMessageImageEntries({
    id: 'msg-1',
    uploadSource: 'chat',
    imageUrls: ['', full],
    thumbUrls: ['', 'https://cdn.test/food-thumb.jpg'],
    imageTags: ['', '오징어덮밥'],
  });
  assert.equal(entries.length, 1);
  const food = entries[0];
  assert.equal(food.imageIndex, 1);
  assert.equal(food.assetKey, getPhotoAssetCommentKey({ full }));
  assert.equal(food.mediaKey, food.assetKey);
  assert.equal(food.refKey, food.assetKey);
  assert.equal(food.slotKey, 'chat:msg-1:1');
  assert.equal(food.legacyKeys.includes('chat:msg-1:1'), true);
  assert.equal(food.tags, '오징어덮밥');
  const identity = getPhotoCommentIdentity(food, [food], { source: 'chat' });
  assert.equal(identity.mediaKey, food.assetKey);
  assert.equal(identity.legacyKeys.includes('chat:msg-1:1'), true);
});
