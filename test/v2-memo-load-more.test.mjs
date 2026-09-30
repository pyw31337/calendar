import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

// Older memos stay reachable through the same numbered pager as 콘텐츠, not a
// "메모 더 보기" button. The screen asks the collection window to grow to the
// page the reader opened.
test('MemoView passes the paging props through to the V2 memo screen', () => {
  const src = fs.readFileSync('src/ui/ui-memo-view.js', 'utf8');
  const call = src.slice(src.indexOf('renderV2({'), src.indexOf('renderV2({') + 1500);
  assert.match(call, /hasMoreMemos:/);
  assert.match(call, /onLoadMoreMemos/);
  assert.match(call, /totalMemoCount/);
  const screen = fs.readFileSync('src/ui/v2/screens.js', 'utf8');
  assert.match(screen, /MemoPagination/);
  assert.match(screen, /p\.onLoadMoreMemos\(needed\)/);
  assert.doesNotMatch(screen, /메모 더 보기/);
});
