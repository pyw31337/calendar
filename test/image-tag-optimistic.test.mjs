import test from 'node:test';
import assert from 'node:assert/strict';
import { createBulkImageTagSaveHandler, createImageTagSaveHandler } from '../src/core/app-image-tag-save.js';

function tagSaveHarness(writeImpl) {
  const patches = [];
  const writes = [];
  const handler = createImageTagSaveHandler({
    activeCalId: 'cal',
    chatMessages: [{ id: 'm1', imageUrls: ['https://cdn.example/a.jpg'], imageTags: ['before'], imageTagMap: {} }],
    firebaseDb: null,
    findMemoById: async () => null,
    writeCollectionDocumentWithFallback: async (_collection, _calId, _id, data) => {
      writes.push(data);
      return writeImpl(data);
    },
    sanitizeMemoForFirestore: doc => doc,
    setMemos: () => {},
    patchGalleryArchiveMemo: () => {},
    galleryPhotoIndex: { patchItems: () => {} },
    fetchMessageRest: async () => null,
    withTimeout: promise => promise,
    showToast: () => {},
    handleSaveAnniversaryPhotoTags: async () => false,
    handleSaveMeetingPhotoTags: async () => false,
    getMessageImageEntries: message => (message.imageUrls || []).map((url, imageIndex) => ({
      imageIndex, full: url, thumb: url, tags: (message.imageTags || [])[imageIndex] || '',
    })),
    resolveMessagePhotoImageIndex: (_message, index) => index,
    reconcileMessageImageTagMap: (_message, map) => map,
    getPhotoAssetCommentKey: entry => `asset-${entry.imageIndex}`,
    getDirectMediaTagKey: url => url,
    getDirectMediaTagsForUrl: () => '',
    getMediaIdentityKeys: () => ({ mediaKey: 'media-1' }),
    sanitizeText: (value, max = 640) => String(value || '').slice(0, max),
    invalidatePhotoIndexCache: () => {},
    rememberPhotoIndexTags: () => {},
    schedulePhotoIndexTagReload: () => {},
    patchLocalChatMessage: (_id, doc) => { patches.push(doc.imageTags?.[0] || ''); },
    parseFlexibleDateTokens: () => [],
    linkTaggedImageToMeetingDates: async () => {},
    createActivityLog: () => null,
    writeActivityLogsToFirestore: async () => {},
    syncMeetingCopyTags: async () => {},
  });
  return { handler, patches, writes };
}

test('image tag edits update local state before the firebase write finishes', async () => {
  let release = () => {};
  const gate = new Promise(resolve => { release = resolve; });
  let sawPatchBeforeWrite = false;
  const { handler, patches } = tagSaveHarness(async () => {
    sawPatchBeforeWrite = patches[0] === 'after';
    await gate;
    return { success: true };
  });
  const pending = handler('m1', 0, 'after', { source: 'chat', imageUrl: 'https://cdn.example/a.jpg', silent: true });
  await Promise.resolve();
  await Promise.resolve();
  assert.equal(sawPatchBeforeWrite, true);
  assert.equal(patches[0], 'after');
  release();
  assert.equal(await pending, true);
});

test('rapid tag edits on one message send only the latest payload', async () => {
  let release = () => {};
  const gate = new Promise(resolve => { release = resolve; });
  const { handler, writes } = tagSaveHarness(async () => {
    await gate;
    return { success: true };
  });
  const meta = { source: 'chat', imageUrl: 'https://cdn.example/a.jpg', silent: true };
  const first = handler('m1', 0, 'one', meta);
  const second = handler('m1', 0, 'one two', meta);
  await Promise.resolve();
  await Promise.resolve();
  assert.equal(writes.length, 1);
  assert.equal(writes[0].imageTags[0], 'one two');
  release();
  assert.equal(await first, true);
  assert.equal(await second, true);
  assert.equal(writes.length, 1);
});

test('a failed tag write rolls local state back and does not report success', async () => {
  const { handler, patches } = tagSaveHarness(async () => ({ success: false, queued: true }));
  const ok = await handler('m1', 0, 'after', { source: 'chat', imageUrl: 'https://cdn.example/a.jpg', silent: true });
  assert.equal(ok, false);
  assert.equal(patches.at(-1), 'before');
});

test('bulk tag saves patch the gallery index before the remote command and roll back on failure', async () => {
  let items = [{ assetKey: 'asset-a', tags: 'old', full: 'https://cdn.example/a.jpg' }];
  const seen = [];
  const handler = createBulkImageTagSaveHandler({
    activeCalId: 'cal',
    projectId: 'proj',
    galleryPhotoIndex: {
      patchItems: updater => {
        items = updater(items);
        seen.push(items.map(item => item.tags).join('|'));
      },
    },
    invalidatePhotoIndexCache: () => {},
    rememberPhotoIndexTags: () => {},
  });
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => { throw new Error('offline'); };
  try {
    const result = await handler([{
      photo: { assetKey: 'asset-a', full: 'https://cdn.example/a.jpg', tags: 'old' },
      assetKey: 'asset-a',
      beforeTags: 'old',
      tags: 'new',
    }]);
    assert.equal(result.ok, false);
    assert.deepEqual(seen, ['new', 'old']);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
