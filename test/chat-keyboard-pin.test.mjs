import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

// The chat room must stay on the newest message when it opens and when the keyboard opens or
// closes (iPhone Safari tab and home-screen app).
const src = fs.readFileSync('src/ui/ui-chat-room.js', 'utf8');

test('the scroll box itself is observed so a keyboard resize re-pins the newest message', () => {
  assert.match(src, /const container = chatMessagesContainerRef\.current;\s*if \(container && container !== el\) ro\.observe\(container\);/);
});

test('only an upward scroll unpins the room; late scroll events after growth keep it pinned', () => {
  const start = src.indexOf('const handleScrollCombined');
  const body = src.slice(start, src.indexOf('const scrollToBottom', start));
  assert.match(body, /if \(distanceFromBottom <= 60\) \{\s*isAtBottomRef\.current = true;/);
  assert.match(body, /else if \(el\.scrollTop < prevScrollTop - 1\) \{[\s\S]*?isAtBottomRef\.current = false;/);
  assert.match(body, /else if \(isAtBottomRef\.current\) \{[\s\S]*?el\.scrollTop = el\.scrollHeight;/);
  assert.doesNotMatch(body, /isAtBottomRef\.current = distanceFromBottom <= 60;/);
});
