import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

// The V2 memo page (screens.js MemoScreen) shows "메모 더 보기" from p.hasMoreMemos /
// p.onLoadMoreMemos. MemoView's renderV2(...) call used to leave both out, so the page stopped at
// the first 20 memos with no way to reach older ones.
test('MemoView passes the paging props through to the V2 memo screen', () => {
  const src = fs.readFileSync('src/ui/ui-memo-view.js', 'utf8');
  const call = src.slice(src.indexOf('renderV2({'), src.indexOf('renderV2({') + 1500);
  assert.match(call, /hasMoreMemos:/);
  assert.match(call, /onLoadMoreMemos/);
  const screen = fs.readFileSync('src/ui/v2/screens.js', 'utf8');
  assert.match(screen, /p\.hasMoreMemos &&[\s\S]{0,200}onClick: p\.onLoadMoreMemos/);
});
