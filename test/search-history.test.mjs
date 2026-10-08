import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  pickSearchCategory,
  SEARCH_MARKER_KEY, hasSearchMarker, withSearchMarker, withoutSearchMarker, stateForTabWrite,
  planSearchClose, needsSearchColdStartSeed,
} from '../src/ui/search-history.js';

test('search entry carries a marker and keeps other overlay state', () => {
  const s = withSearchMarker({ __moyeoraOverlay_x: true });
  assert.equal(s[SEARCH_MARKER_KEY], true);
  assert.equal(s.__moyeoraOverlay_x, true);
  assert.equal(hasSearchMarker(s), true);
  assert.equal(hasSearchMarker(null), false);
  assert.deepEqual(withoutSearchMarker(s), { __moyeoraOverlay_x: true });
  assert.equal(withoutSearchMarker(null), null);
});

test('only the search tab keeps the marker when tabs are written', () => {
  const st = withSearchMarker({});
  assert.equal(hasSearchMarker(stateForTabWrite('memo', st)), false, 'a result tab pushes a clean entry');
  assert.equal(hasSearchMarker(stateForTabWrite('search', st)), true);
  assert.equal(stateForTabWrite('calendar', st, { a: 1 }).a, 1, 'explicit state wins');
});

test('close: pop our own entry, otherwise replace (cold start / bookmark)', () => {
  assert.equal(planSearchClose(withSearchMarker(null)), 'back');
  assert.equal(planSearchClose(null), 'replace');
  assert.equal(needsSearchColdStartSeed('search', null), true);
  assert.equal(needsSearchColdStartSeed('search', withSearchMarker(null)), false);
  assert.equal(needsSearchColdStartSeed('calendar', null), false);
});

test('shell wires search open/close through the marker, not a pushed 캘린더 entry', async () => {
  const shell = await readFile(new URL('../src/ui/ui-app-shell-v2.js', import.meta.url), 'utf8');
  assert.doesNotMatch(shell, /onClose: \(\) => setActiveTab\('calendar'\) \}\)/, 'X no longer pushes 캘린더 over search');
  assert.match(shell, /SearchPage, \{[^}]*onClose: closeSearch/);
  assert.match(shell, /planSearchClose\(window\.history\.state\) === 'back'\) \{\s*try \{ window\.history\.back\(\); return; \}/);
  assert.match(shell, /needsSearchColdStartSeed\(activeTab, window\.history\.state\)/);
  assert.match(shell, /if \(activeTab !== 'search'\) onChangeView\('calendar'\);/, 'date results open over search');
  assert.match(shell, /stateForTabWrite\(tabId, window\.history\.state, state\)/);
});

test('flow: open search -> open a result tab -> Back returns to search -> close pops search', () => {
  const stack = [{ tab: 'calendar', state: null }];
  const top = () => stack[stack.length - 1];
  const write = (tab, explicit) => stack.push({ tab, state: stateForTabWrite(tab, top().state, explicit) });
  write('search', withSearchMarker(top().state));
  write('memo');
  assert.equal(hasSearchMarker(top().state), false, 'result entry is clean');
  stack.pop(); // Back from the result
  assert.equal(top().tab, 'search');
  assert.equal(planSearchClose(top().state), 'back', 'X / Esc / Back pops our own search entry');
  stack.pop();
  assert.equal(top().tab, 'calendar');
  assert.equal(stack.length, 1, 'never leaves the app');
  assert.equal(needsSearchColdStartSeed('search', null), true, 'cold start on ?tab=search gets a 캘린더 seed');
});

test('a memo result that app-main opens itself does not push a second 메모 entry', async () => {
  const shell = await readFile(new URL('../src/ui/ui-app-shell-v2.js', import.meta.url), 'utf8');
  const fn = shell.slice(shell.indexOf('const searchExtra = {'), shell.indexOf('onSelectDate: (d, focus)'));
  assert.match(fn, /recordsContext\.memoProps\.onOpenMemo\(id\);\s*setActiveTabState\('memo'\);\s*return;/);
});

test('Back from a result keeps the picked category once it has matches', () => {
  const defs = (memos) => [{ key: 'schedules', count: 3 }, { key: 'chat', count: 0 }, { key: 'memos', count: memos }];
  assert.equal(pickSearchCategory('memos', 'memos', defs(0)), 'schedules', 'results not loaded yet: show something');
  assert.equal(pickSearchCategory('schedules', 'memos', defs(2)), 'memos', 'restored once memo matches arrive');
  assert.equal(pickSearchCategory('schedules', null, defs(2)), 'schedules', 'no preference: keep current');
  assert.equal(pickSearchCategory('chat', null, defs(2)), 'schedules', 'empty current: first with matches');
  assert.equal(pickSearchCategory('chat', null, []), 'chat');
});

test('통합검색 page remembers the category across Back from a result', async () => {
  const shell = await readFile(new URL('../src/ui/ui-app-shell-v2.js', import.meta.url), 'utf8');
  assert.match(shell, /initialCategory: searchCategoryRef\.current, onCategoryChange: \(key\) => \{ searchCategoryRef\.current = key \|\| null; \}/);
  assert.match(shell, /searchQueryRef\.current = '';\s*searchCategoryRef\.current = null;/, 'a fresh search starts on the default category');
  const core = await readFile(new URL('../src/ui/ui-calendar-core.js', import.meta.url), 'utf8');
  assert.match(core, /React\.useState\(initialCategory \|\| 'schedules'\)/);
  assert.match(core, /pickSearchCategory\(prev, preferredCategoryRef\.current, tabDefs\)/);
});
