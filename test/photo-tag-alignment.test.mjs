import { test } from 'node:test';
import assert from 'node:assert/strict';

globalThis.window = globalThis.window || {};
const { getMessageImageEntries, sanitizeMessageForFirestore } = await import('../src/core/app-domain-helpers.js');

// Regression for a real bug reported in production: a food photo showed a person's name tag
// instead of its own. Root cause -- getMessageImageEntries filtered malformed imageUrls/
// thumbUrls entries out with Array#filter() (compacting the array and shifting every later
// index left) while reading imageTags[i] with the ORIGINAL, unfiltered index. A single bad/
// legacy URL anywhere in the array permanently misaligned every photo after it with the wrong
// tag.
test('a malformed URL mid-array does not shift every later photo\'s tag onto the wrong photo', () => {
  const msg = {
    id: 'msg-1',
    uploadSource: 'chat',
    imageUrls: [
      'https://cdn.test/food.jpg',
      '', // malformed/legacy empty slot -- used to get filtered out and shift everything after it
      'https://cdn.test/person.jpg'
    ],
    thumbUrls: [
      'https://cdn.test/food-thumb.jpg',
      '',
      'https://cdn.test/person-thumb.jpg'
    ],
    imageTags: ['오징어덮밥', '', '박영우']
  };
  const entries = getMessageImageEntries(msg);
  assert.equal(entries.length, 2, 'the malformed middle slot is skipped, not compacted into the others');
  const food = entries.find(e => e.full === 'https://cdn.test/food.jpg');
  const person = entries.find(e => e.full === 'https://cdn.test/person.jpg');
  assert.ok(food, 'food photo entry exists');
  assert.ok(person, 'person photo entry exists');
  assert.equal(food.tags, '오징어덮밥', 'food photo keeps its own tag, not the person tag shifted into its slot');
  assert.equal(person.tags, '박영우', 'person photo keeps its own tag at its true array position');
  assert.equal(food.imageIndex, 0, 'imageIndex reflects the true original array position, not a compacted one');
  assert.equal(person.imageIndex, 2);
});

test('imageTags stays index-aligned with imageUrls/thumbUrls when getMessageImageEntries reads only urls', () => {
  // thumbUrls entirely absent (legacy record) must not desync imageTags either.
  const msg = {
    id: 'msg-2',
    uploadSource: 'gallery',
    imageUrls: ['https://cdn.test/a.jpg', null, 'https://cdn.test/c.jpg'],
    imageTags: ['첫번째', '', '세번째']
  };
  const entries = getMessageImageEntries(msg);
  assert.equal(entries.length, 2);
  assert.equal(entries[0].tags, '첫번째');
  assert.equal(entries[1].tags, '세번째');
  assert.equal(entries[1].imageIndex, 2);
});

// Regression: sanitizeMessageForFirestore (called right before every chat/memo write) dropped
// oversized base64 imageUrls/thumbUrls entries with independent Array#filter() calls, which --
// exactly like the read-side bug above -- compacted imageUrls/thumbUrls without touching
// imageTags, permanently baking a misaligned imageTags array into Firestore on save.
test('sanitizeMessageForFirestore drops an oversized image and its tag together, keeping the rest aligned', () => {
  const oversized = `data:image/png;base64,${'A'.repeat(20000)}`;
  const msg = {
    imageUrls: ['https://cdn.test/keep-1.jpg', oversized, 'https://cdn.test/keep-2.jpg'],
    thumbUrls: ['https://cdn.test/keep-1-thumb.jpg', 'https://cdn.test/oversized-thumb.jpg', 'https://cdn.test/keep-2-thumb.jpg'],
    imageTags: ['첫번째', '너무큰사진', '세번째']
  };
  const out = sanitizeMessageForFirestore(msg);
  assert.deepEqual(out.imageUrls, ['https://cdn.test/keep-1.jpg', 'https://cdn.test/keep-2.jpg']);
  assert.deepEqual(out.thumbUrls, ['https://cdn.test/keep-1-thumb.jpg', 'https://cdn.test/keep-2-thumb.jpg']);
  assert.deepEqual(out.imageTags, ['첫번째', '세번째'], 'the dropped oversized photo\'s tag is dropped too, not left to shift onto the next photo');
});
