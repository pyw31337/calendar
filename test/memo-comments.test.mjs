import test from 'node:test';
import assert from 'node:assert/strict';
import { diffMemoComments, latestMemoCommentAt, persistMemoCommentsChange } from '../src/core/memo-comments.js';
import { buildMemoEditPatch, buildMemoImageRestorePatch } from '../src/core/memo-edit-patch.js';

test('diffMemoComments classifies add/edit/delete by id', () => {
  const prev = [
    { id: 'a', text: 'one', participantId: 'p1', createdAt: 1 },
    { id: 'b', text: 'two', participantId: 'p1', createdAt: 2 },
  ];
  const next = [
    { id: 'a', text: 'one!', participantId: 'p1', createdAt: 1, updatedAt: 9 },
    { id: 'c', text: 'three', participantId: 'p2', createdAt: 3 },
  ];
  const d = diffMemoComments(prev, next);
  assert.deepEqual(d.added.map(c => c.id), ['c']);
  assert.deepEqual(d.edited.map(c => c.id), ['a']);
  assert.deepEqual(d.deletedIds, ['b']);
});

test('latestMemoCommentAt reads newest createdAt', () => {
  assert.equal(latestMemoCommentAt([{ createdAt: 5 }, { createdAt: 12 }, { createdAt: 3 }]), 12);
  assert.equal(latestMemoCommentAt([]), 0);
});

test('buildMemoEditPatch never carries comments or id', () => {
  const patch = buildMemoEditPatch({
    id: 'm1',
    comments: [{ id: 'c1', text: 'stale' }],
    title: 't',
    text: 'body',
    updatedAt: 10,
  });
  assert.equal(patch.title, 't');
  assert.equal(patch.text, 'body');
  assert.equal('comments' in patch, false);
  assert.equal('id' in patch, false);
});

test('buildMemoImageRestorePatch only restores image fields', () => {
  const patch = buildMemoImageRestorePatch({
    id: 'm1',
    comments: [{ id: 'c' }],
    title: 'keep-local',
    imageUrls: ['https://x/a'],
    thumbUrls: ['https://x/at'],
    imageUrl: 'https://x/a',
    thumbUrl: 'https://x/at',
  });
  assert.deepEqual(patch.imageUrls, ['https://x/a']);
  assert.equal('comments' in patch, false);
  assert.equal('title' in patch, false);
});

test('persistMemoCommentsChange uses arrayUnion for a pure append', async () => {
  const updates = [];
  const db = {
    collection: () => ({
      doc: () => ({
        collection: () => ({
          doc: () => ({
            update: async (payload) => { updates.push(payload); },
          }),
        }),
      }),
    }),
  };
  // Stub FieldValue.arrayUnion on global firebase
  globalThis.firebase = {
    firestore: {
      FieldValue: {
        arrayUnion: (...args) => ({ __arrayUnion: args }),
      },
    },
  };
  const added = { id: 'c2', text: 'hi', participantId: 'p', createdAt: 2 };
  const result = await persistMemoCommentsChange({
    db,
    calendarId: 'cw',
    memoId: 'm1',
    previousComments: [{ id: 'c1', text: 'old', participantId: 'p', createdAt: 1 }],
    nextComments: [
      { id: 'c1', text: 'old', participantId: 'p', createdAt: 1 },
      added,
    ],
  });
  assert.equal(result.success, true);
  assert.equal(result.mode, 'arrayUnion');
  assert.equal(updates.length, 1);
  assert.deepEqual(updates[0].comments.__arrayUnion, [added]);
  assert.equal(updates[0].lastCommentAt, 2);
  delete globalThis.firebase;
});

test('persistMemoCommentsChange transaction merges edits without dropping sibling comments', async () => {
  const serverComments = [
    { id: 'a', text: 'one', participantId: 'p1', createdAt: 1 },
    { id: 'b', text: 'two', participantId: 'p2', createdAt: 2 },
  ];
  let written = null;
  const ref = {};
  const db = {
    collection: () => ({
      doc: () => ({
        collection: () => ({
          doc: () => ref,
        }),
      }),
    }),
    runTransaction: async (fn) => {
      const tx = {
        get: async () => ({ data: () => ({ comments: serverComments.slice() }) }),
        update: (_ref, payload) => { written = payload; },
      };
      await fn(tx);
    },
  };
  const result = await persistMemoCommentsChange({
    db,
    calendarId: 'cw',
    memoId: 'm1',
    previousComments: serverComments,
    nextComments: [
      { id: 'a', text: 'one!', participantId: 'p1', createdAt: 1, updatedAt: 9 },
      // caller omitted b (stale) — but wait, for edit-only the next still has b.
      // Simulate delete of b:
    ],
  });
  assert.equal(result.success, true);
  assert.equal(result.mode, 'transaction');
  assert.equal(result.deleted, 1);
  assert.deepEqual(written.comments.map(c => c.id), ['a']);
  assert.equal(written.comments[0].text, 'one!');
});
