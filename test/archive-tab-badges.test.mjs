import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const source = await readFile(new URL('../src/ui/ui-summary-gallery.js', import.meta.url), 'utf8');

test('archive defers inactive facet analysis without presenting a false zero badge', () => {
  // 장소/추억 분류 are O(photo × facet) work. They must not run merely to render a hidden tab;
  // the place tab keeps the already cheap registered-place count until its real group count is ready.
  // 추천 reads the same place groups (archive-tag-suggestions.js), so it is the one other tab that runs them.
  assert.match(source, /if \(historyTab !== 'places' && historyTab !== 'suggest' && !q\) return \{ groups: \[\], unclassified: \[\], unclassifiedCount: 0 \};/);
  assert.match(source, /if \(historyTab !== 'suggest'\) return null;/);
  assert.match(source, /if \(historyTab !== 'memories'\) return \[\];/);
  assert.match(source, /\{ value: 'places', label: '장소', badge: historyTab === 'places' \? placePhotoGroups\.groups\.length : \(placeCount \|\| null\) \}/);
});

test('archive trusts a ready paged photo index and never falls back to a full legacy merge while it loads', () => {
  assert.match(source, /indexedPhotoStatus === 'ready'/);
  assert.match(source, /usesLegacyPhotoFallback \? buildCombinedPhotoEntries\(chatMessages, memos, calendar, anniversaries\) : \[\]/);
  assert.match(source, /archivePhotoIndexIsPending/);
  assert.match(source, /onIndexedPhotoPageChange\(1, \{ force: true \}\)/);
});
