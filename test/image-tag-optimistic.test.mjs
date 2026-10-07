import test from 'node:test';
import assert from 'node:assert/strict';
import { createBulkImageTagSaveHandler, createImageTagSaveHandler, createImageTagSaveState } from '../src/core/app-image-tag-save.js';

function tagSaveHarness(writeImpl, overrides = {}) {
  const patches = [];
  const writes = [];
  const make = () => createImageTagSaveHandler({
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
    ...overrides,
  });
  return { handler: make(), make, patches, writes };
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

test('late bulk-save rollback cannot patch a newly selected calendar', async () => {
  let currentCalendar = 'cal-a';
  let items = [{ assetKey: 'shared-asset', tags: 'a-old', full: 'https://cdn.example/a.jpg' }];
  let release;
  const gate = new Promise(resolve => { release = resolve; });
  const patchCalendars = [];
  const remembered = [];
  const handler = createBulkImageTagSaveHandler({
    activeCalId: 'cal-a', projectId: 'proj',
    isCurrentCalendar: () => currentCalendar === 'cal-a',
    galleryPhotoIndex: { patchItems: updater => { patchCalendars.push(currentCalendar); items = updater(items); } },
    invalidatePhotoIndexCache: () => {},
    rememberPhotoIndexTags: (id, probes) => remembered.push({ id, tags: probes[0]?.tags }),
  });
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (_url, options) => {
    assert.equal(JSON.parse(options.body).calendarId, 'cal-a');
    await gate;
    throw new Error('offline');
  };
  try {
    const pending = handler([{ photo: items[0], assetKey: 'shared-asset', beforeTags: 'a-old', tags: 'a-new' }]);
    assert.equal(items[0].tags, 'a-new');
    currentCalendar = 'cal-b';
    items = [{ ...items[0], tags: 'b-untouched' }];
    release();
    assert.equal((await pending).ok, false);
    assert.equal(items[0].tags, 'b-untouched');
    assert.deepEqual(patchCalendars, ['cal-a']);
    assert.ok(remembered.every(record => record.id === 'cal-a'));
  } finally {
    release();
    globalThis.fetch = originalFetch;
  }
});

// CalendarApp rebuilds the handler on every render (the first edit's local patch causes one).
// Sharing the save state keeps the second edit queued behind the first instead of racing it.
test('a handler rebuilt by a render keeps queueing behind the in-flight save', async () => {
  let release = () => {};
  const gate = new Promise(resolve => { release = resolve; });
  const saveState = createImageTagSaveState();
  const { make, writes } = tagSaveHarness(async () => { await gate; return { success: true }; }, { saveState });
  const meta = { source: 'chat', imageUrl: 'https://cdn.example/a.jpg', silent: true };
  const first = make()('m1', 0, 'one', meta);
  await Promise.resolve();
  await Promise.resolve();
  const second = make()('m1', 0, 'one two', meta);
  await Promise.resolve();
  assert.equal(writes.length, 1, 'the rebuilt handler must not start a parallel write');
  release();
  assert.equal(await first, true);
  assert.equal(await second, true);
  assert.equal(writes.at(-1).imageTags[0], 'one two');
});

test('album write-through finishes before the date-album link starts', async () => {
  const order = [];
  let releaseCopies = () => {};
  const copiesGate = new Promise(resolve => { releaseCopies = resolve; });
  const { handler } = tagSaveHarness(async () => ({ success: true }), {
    tagAssetRemote: async () => { order.push('copies:start'); await copiesGate; order.push('copies:end'); return { ok: true }; },
    syncMeetingCopyTags: async () => { order.push('local-fallback'); },
    linkTaggedImageToMeetingDates: async () => { order.push('link'); },
  });
  const pending = handler('m1', 0, '260919', { source: 'chat', imageUrl: 'https://cdn.example/a.jpg', silent: true });
  for (let i = 0; i < 6; i += 1) await Promise.resolve();
  assert.deepEqual(order, ['copies:start']);
  releaseCopies();
  assert.equal(await pending, true);
  assert.deepEqual(order, ['copies:start', 'copies:end', 'link']);
});

test('a failed server write-through falls back to the local album sync', async () => {
  const calls = [];
  const { handler } = tagSaveHarness(async () => ({ success: true }), {
    tagAssetRemote: async () => { throw new Error('offline'); },
    syncMeetingCopyTags: async (_asset, tags) => { calls.push(tags); },
  });
  assert.equal(await handler('m1', 0, 'after', { source: 'chat', imageUrl: 'https://cdn.example/a.jpg', silent: true }), true);
  assert.deepEqual(calls, ['after']);
});
