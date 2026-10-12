import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('only saved pinned memos receive the purple card outline', async () => {
  const [memoCard, chromeCss] = await Promise.all([
    readFile(new URL('../src/ui/ui-calendar-core.js', import.meta.url), 'utf8'),
    readFile(new URL('../src/ui/v2/dest-chrome-late.css', import.meta.url), 'utf8'),
  ]);

  assert.match(
    memoCard,
    /data-memo-pinned.*memo\.isPinned/,
    'MemoCard must expose the persisted pin state, not a temporary display state'
  );
  assert.match(
    memoCard,
    /memo-card-hover v2-memo-card-contract" \+ \(memo\.isPinned \? " is-pinned" : ""\)/,
    'only a persisted pin adds the card-level pinned class'
  );
  assert.match(
    chromeCss,
    /\.renewal-shell\.v2-design \.v2-memo \.v2-memo-card-wrap \.memo-card-hover\.is-pinned[\s\S]*?border:\s*1px solid var\(--v2-accent, #7C3AED\) !important;[\s\S]*?border-left:\s*1px solid var\(--v2-accent, #7C3AED\) !important;/,
    'a pinned memo needs the complete thin purple outline from the reference'
  );
});
