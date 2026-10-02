import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

globalThis.window = globalThis.window || {};
const { getPhotoCommentIdentity, createPhotoCommentIdentityResolver } = await import('../src/core/app-domain-helpers.js');
const {
  buildGalleryLinks, buildGalleryKeyIndex, createGalleryOwnerLookup, resolveIndexedGalleryPhotos, withUniqueGalleryKeys
} = await import('../src/core/gallery-collections.js');

const extractUrls = text => (String(text).match(/https?:\/\/\S+/g) || []).map(url => ({ url }));
const linkDeps = { extractUrls, isExternalServiceUrl: () => true, classifyGalleryItem: () => 'link' };

test('several links from one message get distinct keys (the cause of cards leaking into the photo grid)', () => {
  const links = buildGalleryLinks({
    ...linkDeps,
    messages: [{ id: 'm1', timestamp: 2, text: 'https://a.test/1 https://b.test/2' }],
    memos: [{ id: 'memo1', updatedAt: 1, text: 'https://c.test/3' }]
  });
  assert.equal(links.length, 3);
  assert.equal(new Set(links.map(item => item.galleryKey)).size, 3);
  assert.deepEqual(links.map(item => item.url), ['https://a.test/1', 'https://b.test/2', 'https://c.test/3']);
  assert.ok(links[0].linkPreview === undefined || links[1].linkPreview === null, 'only the first URL reuses the cached preview');
});

test('a URL shared twice appears once, first owner wins', () => {
  const links = buildGalleryLinks({
    ...linkDeps,
    messages: [{ id: 'm1', timestamp: 5, text: 'https://a.test/x' }],
    memos: [{ id: 'memo1', updatedAt: 9, text: 'https://a.test/x' }]
  });
  assert.equal(links.length, 1);
  assert.equal(links[0].source, 'chat');
});

test('withUniqueGalleryKeys never returns duplicate keys', () => {
  const rows = withUniqueGalleryKeys([{ id: 'f' }, { id: 'f' }, { url: 'u' }], item => item.id || item.url);
  assert.deepEqual(rows.map(row => row.galleryKey), ['f', 'f#1', 'u']);
});

test('owner lookup matches the Array.find scan it replaces, including meeting order', () => {
  const meetings = [
    { date: '2026-01-01', photos: [{ id: 'p1', tags: null }, { sourceMessageId: 'm9', sourceImageIndex: 2, tags: '#첫번째' }] },
    { date: '2026-02-01', photos: [{ id: 'p1', tags: '#두번째' }] }
  ];
  const lookup = createGalleryOwnerLookup({ messages: [{ id: 'a' }, { id: 'a', dup: true }], memos: [{ id: 'z' }], meetings });
  assert.equal(lookup.message('a').dup, undefined, 'first message with the id wins, like find');
  assert.equal(lookup.memo('z').id, 'z');
  // p1: first meeting's row has null tags, so the scan continues to the second meeting.
  assert.equal(lookup.meetingTagRow({ photoId: 'p1' }, 0).tags, '#두번째');
  assert.equal(lookup.meetingTagRow({ sourceMessageId: 'm9', sourceImageIndex: 2 }, 0).tags, '#첫번째');
  assert.equal(lookup.meetingTagRow({ sourceMessageId: 'm9' }, 3), null);
});

test('indexed photos take the owning message slot over the lagging index', () => {
  const lookup = createGalleryOwnerLookup({ messages: [{ id: 'm1', imageTags: ['#새태그'] }] });
  const rows = resolveIndexedGalleryPhotos([
    { messageId: 'm1', imageIndex: 0, source: 'chat', full: 'https://x/a.jpg', tags: '#옛태그' },
    { source: 'anniversary', full: 'https://x/poster.jpg' }
  ], {
    lookup,
    classifyGalleryItem: () => 'photo',
    resolveGalleryLightboxTags: (_cal, _photo, { localTags, indexTags }) => localTags ?? indexTags
  });
  assert.equal(rows.length, 1, 'posters stay out of 사진');
  assert.equal(rows[0].tags, '#새태그');
});

test('the precomputed comment resolver agrees with getPhotoCommentIdentity', () => {
  const rows = [
    { source: 'meeting', meetingDate: '2026-09-06', photoId: 'msg-1', sourceMessageId: 'msg-1', full: 'https://cdn.test/a.jpg' },
    { source: 'meeting', meetingDate: '2026-09-06', photoId: 'msg-1', sourceMessageId: 'msg-1', full: 'https://cdn.test/b.jpg' },
    { source: 'chat', messageId: 'c1', imageIndex: 0, full: 'https://cdn.test/c.jpg' },
    { source: 'chat', messageId: 'c1', imageIndex: 1, full: 'https://cdn.test/d.jpg' },
    { source: 'gallery', messageId: 'g1', imageIndex: 0, full: 'https://cdn.test/c.jpg' },
    { source: 'meeting', meetingDate: '2026-09-07', photoId: 'p7', sourceMessageId: 'msg-2', sourceImageIndex: 7, full: 'https://cdn.test/e.jpg' }
  ];
  const resolve = createPhotoCommentIdentityResolver(rows);
  rows.forEach(row => {
    const opts = { source: row.source, meetingDate: row.meetingDate };
    assert.deepEqual(resolve(row, opts), getPhotoCommentIdentity(row, rows, opts));
  });
  const single = createPhotoCommentIdentityResolver([rows[5]]);
  assert.deepEqual(single(rows[5], { source: 'meeting', meetingDate: '2026-09-07' }),
    getPhotoCommentIdentity(rows[5], [rows[5]], { source: 'meeting', meetingDate: '2026-09-07' }));
});

test('key index finds positions without scanning', () => {
  const map = buildGalleryKeyIndex([{ k: 'a' }, { k: 'b' }, { k: 'a' }], row => row.k);
  assert.equal(map.get('a'), 0);
  assert.equal(map.get('b'), 1);
});

test('the gallery page mounts each tab separately and keys links/files uniquely', async () => {
  const source = await readFile(new URL('../src/ui/ui-chat-gallery.js', import.meta.url), 'utf8');
  assert.match(source, /key: `gallery-tab-\$\{activeTab\}-\$\{galleryViewMode\}`/);
  assert.match(source, /const itemKey = item\.galleryKey \|\|/);
  assert.match(source, /createGalleryOwnerLookup\(/);
  assert.doesNotMatch(source, /\.findIndex\(entry => getPhotoKey\(entry\) === photoKey\)/, 'no per-thumbnail list scan');
  assert.doesNotMatch(source, /\(memos \|\| \[\]\)\.find\(row => row && row\.id === messageId\)/, 'no per-photo memo scan');
});
