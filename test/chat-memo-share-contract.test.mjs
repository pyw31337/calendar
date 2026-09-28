import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { URL } from 'node:url';

test('chat memo shares open from the card surface and refresh their preview cache after editing', async () => {
  const source = await readFile(new URL('../src/ui/ui-chat-room.js', import.meta.url), 'utf8');
  const component = source.slice(source.indexOf('function ChatMemoShareCard'), source.indexOf('export function ChatRoomView'));
  assert.match(component, /className: 'chat-memo-share-card v2-memo-card-wrap'/, 'memo card has a dedicated chat wrapper');
  assert.doesNotMatch(component, /'data-stop-card-open': 'true'/, 'wrapper must not block MemoCard surface clicks');
  assert.match(component, /onSelectTag: \(\) => \{\}/, 'tag taps do not replace the card-surface edit action');
  assert.match(source, /cacheSharedMemo\(memoShareCacheKey\(chatMemoEditingTarget\.share\), memo\)/, 'saved memo state refreshes the chat preview cache');
});
