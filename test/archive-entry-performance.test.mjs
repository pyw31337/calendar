import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const appMain = await readFile(new URL('../src/core/app-main.js', import.meta.url), 'utf8');
const archiveState = await readFile(new URL('../src/core/gallery-archive-state.js', import.meta.url), 'utf8');
const historyView = await readFile(new URL('../src/ui/ui-summary-gallery.js', import.meta.url), 'utf8');

test('archive only reads legacy memo snapshots when the canonical index is absent', () => {
  assert.match(appMain, /activeView === 'history'\s*&& galleryPhotoIndex\.status === 'fallback'/);
  assert.match(appMain, /fetchMemosRest\(activeCalId, 100\)/);
});

test('gallery and archive browsing never trigger a full chat archive hydrate', () => {
  assert.match(archiveState, /const isMediaBrowse = !isGlobalSearchOpen && \(activeView === 'history' \|\| activeView === 'gallery'\);/);
  assert.match(archiveState, /if \(isMediaBrowse\) return;/);
});

test('archive does not expose a manual full analysis action', () => {
  assert.doesNotMatch(historyView, /전체 분석/);
  assert.doesNotMatch(historyView, /loadEntireArchive/);
});
