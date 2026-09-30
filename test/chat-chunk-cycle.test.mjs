import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('chat typing presence stays in the chat-room chunk', () => {
  const config = readFileSync(new URL('../vite.config.js', import.meta.url), 'utf8');
  const group = config.match(/name:\s*'ui-chat-room'[\s\S]{0,400}/)?.[0] || '';
  assert.match(group, /ui-chat-room/);
  assert.match(group, /chat-typing-presence/);
  const room = readFileSync(new URL('../src/ui/ui-chat-room.js', import.meta.url), 'utf8');
  assert.match(room, /import \{ useChatTypingPresence \} from '\.\.\/core\/chat-typing-presence\.js'/);
});
