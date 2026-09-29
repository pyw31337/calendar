import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const screens = readFileSync('src/ui/v2/screens.js', 'utf8');
const chrome = readFileSync('src/ui/v2/dest-chrome-late.css', 'utf8');

test('a hidden chat composer has an independent, persistent reopen control', () => {
  assert.match(screens, /const revealComposer = \(\) => \{/);
  assert.match(screens, /suppressUntilRef\.current = Date\.now\(\) \+ 640/);
  assert.match(screens, /setKeyboardPin\('on'\)/);
  assert.match(screens, /composerHidden \? h\('button', \{[\s\S]*v2-chat-composer-reopen-btn/);
  assert.match(screens, /data-chat-composer-reopen/);
  assert.match(screens, /!composerHidden \? h\('button', \{[\s\S]*v2-chat-keyboard-btn/);
  assert.match(chrome, /\.v2-chat-composer-reopen-btn \{[\s\S]*position:\s*absolute\s*!important;[\s\S]*z-index:\s*1100\s*!important;/);
  assert.match(chrome, /\.v2-chat-composer-reopen-btn \{[\s\S]*bottom:\s*calc\(var\(--mobile-bottom-nav-total, 0px\) \+ 12px\)\s*!important;/);
});

test('modal and side-drawer backdrops own the mobile viewport instead of competing with the nav', () => {
  assert.match(chrome, /body:has\(:is\([\s\S]*\.modal-overlay,[\s\S]*\.bottom-sheet-overlay,[\s\S]*\.lightbox-overlay/);
  assert.match(chrome, /\.bp-mobile-bottom-nav \{[\s\S]*visibility:\s*hidden\s*!important;[\s\S]*pointer-events:\s*none\s*!important;/);
  assert.match(chrome, /\.bp-side-nav\.bp-is-open,[\s\S]*\.bp-side-nav-backdrop\.bp-is-open \{[\s\S]*bottom:\s*0\s*!important;/);
  assert.match(chrome, /body > \.modal-overlay,[\s\S]*body > \.bottom-sheet-overlay:not\(\.emoji-sheet-overlay\),[\s\S]*z-index:\s*12000\s*!important;/);
});
