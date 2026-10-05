import test from 'node:test';
import assert from 'node:assert/strict';
import {
  deleteOwnedChatFileFromStorage,
  queueOwnedChatFileForStorageGc,
  deleteGalleryFileAttachments,
} from '../src/core/gallery-bulk-delete.js';

test('deleteOwnedChatFileFromStorage is a no-op (never hard-deletes)', async () => {
  let deleted = false;
  await deleteOwnedChatFileFromStorage(
    { storagePath: 'chatFiles/cw/x.pdf' },
    { activeCalId: 'cw', getStorage: () => ({ ref: () => ({ delete: async () => { deleted = true; } }) }) }
  );
  assert.equal(deleted, false);
});

test('queueOwnedChatFileForStorageGc posts queueStorageGc for owned paths', async () => {
  const bodies = [];
  const fetchImpl = async (url, init) => {
    bodies.push(JSON.parse(init.body));
    return { ok: true, status: 200, json: async () => ({ ok: true, queued: 1 }) };
  };
  const result = await queueOwnedChatFileForStorageGc(
    { storagePath: 'chatFiles/cw/doc.pdf' },
    { activeCalId: 'cw', projectId: 'demo', fetchImpl }
  );
  assert.equal(result.ok, true);
  assert.equal(bodies[0].op, 'queueStorageGc');
  assert.deepEqual(bodies[0].paths, ['chatFiles/cw/doc.pdf']);
});

test('queueOwnedChatFileForStorageGc rejects paths outside this calendar', async () => {
  const result = await queueOwnedChatFileForStorageGc(
    { storagePath: 'chatFiles/other/doc.pdf' },
    { activeCalId: 'cw', projectId: 'demo', fetchImpl: async () => ({ ok: true, json: async () => ({}) }) }
  );
  assert.equal(result.ok, false);
  assert.equal(result.reason, 'not-owned');
});

test('deleteGalleryFileAttachments queues GC instead of Storage.delete', async () => {
  const queued = [];
  const fetchImpl = async (_url, init) => {
    queued.push(JSON.parse(init.body));
    return { ok: true, status: 200, json: async () => ({ ok: true, queued: 1 }) };
  };
  let storageDeletes = 0;
  const deleted = await deleteGalleryFileAttachments(
    [{ messageId: 'm1', id: 'f1', url: 'https://x/f', storagePath: 'chatFiles/cw/a.pdf' }],
    {
      activeCal: { id: 'cw' },
      activeCalId: 'cw',
      projectId: 'demo',
      fetchImpl,
      guardLoadedCalendar: () => true,
      findChatMessageById: async () => ({
        id: 'm1',
        text: 'keep',
        fileAttachments: [{ id: 'f1', url: 'https://x/f', storagePath: 'chatFiles/cw/a.pdf' }],
      }),
      getMessageImageEntries: () => [],
      writeCollectionDocumentWithFallback: async () => ({ success: true }),
      removeLocalChatMessage: () => {},
      patchLocalChatMessage: () => {},
      getLiveFirebaseStorage: () => ({ ref: () => ({ delete: async () => { storageDeletes += 1; } }) }),
    }
  );
  assert.equal(deleted, 1);
  assert.equal(storageDeletes, 0);
  assert.equal(queued[0].op, 'queueStorageGc');
});
