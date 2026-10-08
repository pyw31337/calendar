import test from 'node:test';
import assert from 'node:assert/strict';

// app-domain-helpers reads its browser adapters during module initialisation.  The photo-action
// factory itself is pure once its dependencies are supplied, so provide the minimal browser
// facade required for this focused regression test.
globalThis.window = globalThis.window || {};
window.GATHER_APP_CONSTANTS = window.GATHER_APP_CONSTANTS || {};
window.GATHER_APP_UTILS = window.GATHER_APP_UTILS || {};

const { createCalendarPhotoActions } = await import('../src/core/app-calendar-photo-actions.js');

const url = name => `https://firebasestorage.googleapis.com/v0/b/example/o/${name}?alt=media&token=abc`;

test('deleting a legacy id-less meeting photo never tombstones its neighbours', async () => {
  const first = { imageUrl: url('first.jpg'), thumbUrl: url('first-thumb.jpg') };
  const second = { imageUrl: url('second.jpg'), thumbUrl: url('second-thumb.jpg') };
  const activeCal = {
    id: 'cw',
    confirmedMeeting: [{ date: '2026-10-09', photos: [first, second] }]
  };
  let committed = null;
  const actions = createCalendarPhotoActions({
    activeCalId: 'cw',
    activeCal,
    activeCalRef: { current: activeCal },
    commitConfirmedMeetings: async meetings => {
      committed = meetings;
      return true;
    },
    showToast: () => {},
    showUndoableDeleteToast: () => {},
    findChatMessageById: async () => null,
    getFirebaseDb: () => null,
  });

  const deleted = await actions.handleDeleteMeetingPhoto('2026-10-09', '', first.imageUrl, { silent: true });

  assert.equal(deleted, true);
  assert.equal(committed[0].photos[0].deletedAt > 0, true);
  assert.equal(committed[0].photos[1].deletedAt, undefined);
});

test('date-modal maps a meeting index projection back to an editable meeting source', async () => {
  const source = await import('node:fs/promises').then(fs => fs.readFile(new URL('../src/ui/ui-date-modal.js', import.meta.url), 'utf8'));
  const lightbox = await import('node:fs/promises').then(fs => fs.readFile(new URL('../src/ui/ui-lightbox.js', import.meta.url), 'utf8'));

  assert.match(source, /source: p\.source === 'chat-tag' \? 'chat-tag' : 'meeting'/);
  assert.match(lightbox, /const isMeetingPhoto = !!currentMeta\?\.meetingDate && !!currentMeta\?\.photoId/);
  assert.match(lightbox, /void confirmAction\(\)/);
});
