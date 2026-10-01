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

test('history browsing and the gallery photo grid do not hydrate the full chat archive', () => {
  assert.match(archiveState, /if \(activeView === 'history' && !wantsSearchCorpus\) return undefined;/);
  assert.match(archiveState, /const wantsGalleryCorpus = activeView === 'gallery' && galleryCorpusRequested;/);
  assert.match(archiveState, /if \(!wantsSearchCorpus && !wantsGalleryCorpus\) return undefined;/);
  assert.doesNotMatch(archiveState, /activeView === 'history' \|\| activeView === 'gallery'/);
});

test('archive does not expose a manual full analysis action', () => {
  assert.doesNotMatch(historyView, /전체 분석/);
  assert.doesNotMatch(historyView, /loadEntireArchive/);
});
