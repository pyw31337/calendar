import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('chat message action buttons hover is restricted to true hover devices', () => {
  const screensCss = fs.readFileSync('src/ui/v2/screens.css', 'utf8');
  assert.match(
    screensCss,
    /@media \(hover: hover\) and \(pointer: fine\) \{\s*\.v2-design \.v2-chat \.msg-row-hover:hover \.msg-actions-group \{\s*opacity: 1;\s*pointer-events: auto;\s*\}\s*\}/
  );

  const appCss = fs.readFileSync('src/app.css', 'utf8');
  assert.match(
    appCss,
    /@media \(hover: hover\) and \(pointer: fine\) \{\s*\.msg-row-hover:hover \.msg-actions-group \{\s*opacity: 1;\s*pointer-events: auto;\s*\}\s*\.msg-row-hover:hover \.msg-actions-group-inline/
  );

  const destLateCss = fs.readFileSync('src/ui/v2/dest-chrome-late.css', 'utf8');
  assert.match(
    destLateCss,
    /@media \(hover: none\), \(pointer: coarse\) \{\s*html:has\(\.renewal-shell\.v2-design\)\s*\.v2-chat\s*\.msg-row-hover:not\(\.msg-actions-revealed\)\s*\.msg-actions-group\s*\{\s*opacity:\s*0\s*!important;\s*pointer-events:\s*none\s*!important;\s*\}\s*\}/
  );
});

test('useTapRevealedMsgId in app-ui-hooks and ui-chat-room handles touch toggle and action buttons', () => {
  const hooksJs = fs.readFileSync('src/core/app-ui-hooks.js', 'utf8');
  assert.match(hooksJs, /export function useTapRevealedMsgId\(\)/);
  assert.match(hooksJs, /setRevealedId\(prev => \(prev === id \? null : id\)\)/);
  assert.match(hooksJs, /setTimeout\(\(\) => setRevealedId\(null\), 4000\)/);
  assert.match(hooksJs, /let ignoreMouseUntil = 0/);
  assert.match(hooksJs, /if \(e\.type === 'mousedown' && Date\.now\(\) < ignoreMouseUntil\) return/);
  assert.match(hooksJs, /document\.addEventListener\('touchend', noteTouch, passive\)/);
  assert.doesNotMatch(hooksJs, /addEventListener\('pointerup', handler/);
  assert.doesNotMatch(hooksJs, /addEventListener\('touchend', handler/);

  const chatRoomJs = fs.readFileSync('src/ui/ui-chat-room.js', 'utf8');
  assert.match(chatRoomJs, /function useTapRevealedMsgId\(\.\.\.args\)/);
  assert.match(chatRoomJs, /__gatherUiDeps\(\)\.useTapRevealedMsgId/);
  assert.match(chatRoomJs, /setRevealedId\(prev => \(prev === id \? null : id\)\)/);
  assert.match(chatRoomJs, /if \(e\.type === 'mousedown' && Date\.now\(\) < ignoreMouseUntil\) return/);
  assert.match(chatRoomJs, /document\.addEventListener\('touchend', noteTouch, passive\)/);
});
