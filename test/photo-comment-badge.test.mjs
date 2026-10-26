import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  arePhotoCommentCountsLoaded,
  photoCommentBadgeCount,
  subscribePhotoCommentCounts
} from '../src/core/photo-comment-items.js';

function fakeSummaryDb() {
  const listeners = [];
  return {
    db: {
      collection: () => ({ doc: () => ({ collection: () => ({ doc: () => ({
        onSnapshot: (onNext) => { listeners.push(onNext); return () => {}; }
      }) }) }) })
    },
    emit: (data) => listeners.forEach(fn => fn(data ? { exists: true, data: () => data } : { exists: false }))
  };
}

test('summary counts are marked loaded; a default or pending {} is not', () => {
  const { db, emit } = fakeSummaryDb();
  globalThis.window = { __gatherFirebaseDb: db };
  const seen = [];
  try {
    subscribePhotoCommentCounts({ calendarId: 'demo', onChange: counts => seen.push(counts) });
    emit({ counts: { 'asset:v1:a': 20 } });
    emit(null);
  } finally {
    delete globalThis.window;
  }
  assert.deepEqual(seen[0], { 'asset:v1:a': 20 });
  assert.equal(arePhotoCommentCountsLoaded(seen[0]), true);
  assert.deepEqual(seen[1], {}, 'a calendar without any comment yet');
  assert.equal(arePhotoCommentCountsLoaded(seen[1]), true);
  assert.equal(arePhotoCommentCountsLoaded({}), false);
  assert.equal(arePhotoCommentCountsLoaded(undefined), false);
});

test('a badge follows the live summary once loaded, the photo row until then', () => {
  const { db, emit } = fakeSummaryDb();
  globalThis.window = { __gatherFirebaseDb: db };
  let live;
  try {
    subscribePhotoCommentCounts({ calendarId: 'demo', onChange: counts => { live = counts; } });
    emit({ counts: { 'asset:v1:a': 20 } });
  } finally {
    delete globalThis.window;
  }
  // Comments added after the phone cached the photo list (row still says 0).
  assert.equal(photoCommentBadgeCount(20, live, 0), 20);
  // Every comment deleted after the cache was written (row still says 7).
  assert.equal(photoCommentBadgeCount(0, live, 7), 0);
  // Summary not answered yet: never hide what the row already knows.
  assert.equal(photoCommentBadgeCount(0, {}, 7), 7);
  assert.equal(photoCommentBadgeCount(3, undefined, 1), 3);
  assert.equal(photoCommentBadgeCount(undefined, {}, undefined), 0);
});

test('the home gallery strip receives the live comment counts', () => {
  const shell = readFileSync(new URL('../src/ui/ui-app-shell-v2.js', import.meta.url), 'utf8');
  const start = shell.indexOf('export function buildRenewalCalendarContext');
  const contextBody = shell.slice(start, shell.indexOf('dateModalProps: {', start));
  assert.match(contextBody, /\bphotoCommentCounts\b/, 'calendarContext.photoCommentCounts must be set, not only dateModalProps');
  assert.match(shell, /const photoCommentCounts = calendarContext\?\.photoCommentCounts;/);
  assert.match(shell, /photoCommentBadgeCount\(liveCount, photoCommentCounts, photo\?\.commentCount\)/);
});
