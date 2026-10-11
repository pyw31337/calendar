import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const chromePath = new URL('../src/ui/v2/dest-chrome-late.css', import.meta.url);

test('V2 popup surfaces render their first frame without competing entrance animations', async () => {
  const css = await readFile(chromePath, 'utf8');
  const guardIndex = css.indexOf('Popup first-frame stability');

  assert.ok(guardIndex > css.indexOf('bp-soft-in'), 'the popup stability guard must win over the shared V2 entrance animation');
  const guard = css.slice(guardIndex);
  assert.match(guard, /:is\(\.modal-overlay, \.bottom-sheet-overlay\):not\(\.is-exit-ghost\)\s*\{\s*animation:\s*none !important;/);
  assert.match(guard, /:is\(\.modal-container, \.bottom-sheet, \.poll-voter-sheet\)[\s\S]*?animation:\s*none !important;/);
  assert.match(guard, /\.poll-voter-sheet:not\(\.is-exit-ghost\)/, 'standalone voter sheets are covered too');
});
