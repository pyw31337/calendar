import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { URL } from 'node:url';

test('home memo cards open the existing editor without navigating away from the calendar', async () => {
  const shell = await readFile(new URL('../src/ui/ui-app-shell-v2.js', import.meta.url), 'utf8');

  assert.match(shell, /function MemoPane\([^)]*editorOnly = false/, 'the existing memo host supports editor-only use');
  assert.match(shell, /editorOnly\s*\?\s*\(\) => null/, 'editor-only mode does not render the memo page behind the editor');
  assert.match(shell, /onOpenMemo:\s*memo => \{ if \(memo\?\.id\) setHomeFocusedMemo\(\{ \.\.\.memo, _editOnHome: true \}\); \}/, 'home summary cards route to the editor host');
  assert.match(shell, /homeFocusedMemo\?\._editOnHome && React\.createElement\(MemoPane/, 'the overlay is mounted above the persistent shell');
  assert.doesNotMatch(shell, /_editOnHome:[\s\S]{0,240}setActiveTab\('memo'\)/, 'opening a home memo does not create a memo-page navigation');
});

test('memo editor preserves a usable body when the visual viewport is reduced by a keyboard', async () => {
  const css = await readFile(new URL('../src/app.css', import.meta.url), 'utf8');

  assert.match(css, /html\[data-v2-keyboard\] \.memo-edit-modal-container[\s\S]{0,420}--app-vv-height/, 'editor height follows the visual viewport while a keyboard is open');
  assert.match(css, /html\[data-v2-keyboard\] \.memo-edit-modal-body[\s\S]{0,120}flex:\s*1 1 0 !important;[\s\S]{0,120}min-height:\s*116px;/, 'keyboard-constrained body receives remaining space and cannot collapse to a single text line');
  assert.match(css, /html\[data-v2-keyboard\] \.memo-edit-textarea[\s\S]{0,180}min-height:\s*116px !important;/, 'the editing field itself retains readable space');
});
