import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const source = await readFile(new URL('../src/ui/ui-summary-gallery.js', import.meta.url), 'utf8');

test('archive tab badges do not depend on the currently open tab', () => {
  // These two collections back the 보관함 header counts.  They are memoized by source data,
  // not by historyTab, so navigating from 장소 to 추억 cannot briefly show 0 or hide a badge.
  assert.doesNotMatch(source, /if \(historyTab !== 'places'\) return \{ groups: \[\], unclassified: \[\], unclassifiedCount: 0 \};/);
  assert.doesNotMatch(source, /if \(historyTab !== 'memories'\) return \[\];/);
  assert.match(source, /\{ value: 'places', label: '장소', badge: placePhotoGroups\.groups\.length \}/);
});
