import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
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
