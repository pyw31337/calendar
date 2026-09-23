import test from 'node:test';
import assert from 'node:assert/strict';
import {
  isGalleryThumbUrl,
  collectGalleryThumbCandidates,
  resolveGalleryThumbUrl,
  selectGalleryPreviewPhotos,
  resolveHomeGalleryStripState,
} from '../src/core/gallery-thumb.js';

const ok = (n) => `https://firebasestorage.googleapis.com/v0/b/x/o/chatImages%2Fcw%2F${n}.jpg?alt=media&token=abc`;

test('isGalleryThumbUrl accepts http(s) and rejects empty/relative', () => {
  assert.equal(isGalleryThumbUrl(ok(1)), true);
  assert.equal(isGalleryThumbUrl(''), false);
  assert.equal(isGalleryThumbUrl('  '), false);
  assert.equal(isGalleryThumbUrl('/relative.jpg'), false);
  assert.equal(isGalleryThumbUrl(null), false);
});

test('collectGalleryThumbCandidates prefers thumb fields then full', () => {
  const candidates = collectGalleryThumbCandidates({
    full: ok('full'),
    thumb: ok('thumb'),
    imageUrl: ok('image'),
    thumbUrl: ok('thumbUrl'),
  });
  assert.deepEqual(candidates.slice(0, 3), [ok('thumb'), ok('thumbUrl'), ok('full')]);
});

test('resolveGalleryThumbUrl returns missing when every candidate is broken', () => {
  const item = { thumb: ok('a'), full: ok('b') };
  const broken = new Set([ok('a'), ok('b')]);
  const resolved = resolveGalleryThumbUrl(item, { isBroken: (u) => broken.has(u) });
  assert.equal(resolved.state, 'missing');
  assert.equal(resolved.src, '');
});

test('resolveGalleryThumbUrl skips broken thumb and falls through to full', () => {
  const item = { thumb: ok('dead'), full: ok('alive') };
  const resolved = resolveGalleryThumbUrl(item, { isBroken: (u) => u.includes('dead') });
  assert.equal(resolved.state, 'ready');
  assert.equal(resolved.src, ok('alive'));
  assert.equal(resolved.fallbackSrc, '');
});

test('resolveGalleryThumbUrl reports loading without painting', () => {
  const resolved = resolveGalleryThumbUrl({ thumb: ok(1) }, { loading: true });
  assert.equal(resolved.state, 'loading');
  assert.equal(resolved.src, '');
});

test('selectGalleryPreviewPhotos skips meme pool + missing URLs and still fills the strip', () => {
  const now = 1_790_000_000_000;
  const items = [
    { id: 'meme', thumb: 'https://firebasestorage.googleapis.com/v0/b/x/o/memePool%2Fx_thumb.jpg?alt=media', timestamp: now + 9 },
    { id: 'dead', thumb: ok('dead'), full: ok('dead'), timestamp: now + 8 },
    { id: 'empty', thumb: '', full: '', timestamp: now + 7 },
    { id: 'ok1', thumb: ok(1), full: ok('1f'), timestamp: now + 6 },
    { id: 'ok2', thumb: ok(2), full: ok('2f'), timestamp: now + 5 },
    { id: 'ok3', thumb: ok(3), full: ok('3f'), timestamp: now + 4 },
  ];
  const broken = new Set([ok('dead')]);
  const picked = selectGalleryPreviewPhotos(items, {
    limit: 3,
    isBroken: (u) => broken.has(u),
  });
  assert.deepEqual(picked.map((p) => p.id), ['ok1', 'ok2', 'ok3']);
  assert.equal(picked[0].__thumbResolved.state, 'ready');
  assert.equal(picked[0].thumb, ok(1));
});

test('selectGalleryPreviewPhotos oversamples past a 404 so a 3x3 never keeps a grey hole', () => {
  const now = 1_790_000_000_000;
  const items = [];
  for (let i = 0; i < 9; i += 1) {
    items.push({
      id: `slot-${i}`,
      thumb: ok(`slot-${i}`),
      full: ok(`slot-${i}-full`),
      timestamp: now - i,
    });
  }
  // Newest row is a 404 meeting tombstone that used to paint as opacity:0 grey.
  items[0] = { id: 'tomb', thumb: ok('tomb'), full: ok('tomb'), timestamp: now + 1 };
  items.push({ id: 'extra', thumb: ok('extra'), full: ok('extra-full'), timestamp: now - 100 });

  const broken = new Set([ok('tomb')]);
  const picked = selectGalleryPreviewPhotos(items, {
    limit: 9,
    isBroken: (u) => broken.has(u),
  });
  assert.equal(picked.length, 9);
  assert.equal(picked.some((p) => p.id === 'tomb'), false);
  assert.equal(picked.some((p) => p.id === 'extra'), true);
});

test('resolveHomeGalleryStripState shows loading until photoIndex is ready', () => {
  assert.equal(resolveHomeGalleryStripState({ status: 'idle', items: [] }).state, 'loading');
  assert.equal(resolveHomeGalleryStripState({ status: 'loading', items: [], loading: true }).state, 'loading');
  const ready = resolveHomeGalleryStripState({
    status: 'ready',
    items: [{ id: 'a', thumb: ok(1), timestamp: 10 }],
  });
  assert.equal(ready.state, 'ready');
  assert.equal(ready.photos.length, 1);
  const empty = resolveHomeGalleryStripState({ status: 'ready', items: [{ id: 'x', thumb: '' }] });
  assert.equal(empty.state, 'empty');
});
