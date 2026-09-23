import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const appCss = readFileSync(join(root, 'src/app.css'), 'utf8');
const renewal = appCss.slice(appCss.lastIndexOf('.renewal-shell {'));

test('renewal-shell chat/memo canvases do not force light #FAFAFC/#FFFFFF', () => {
  assert.equal(
    /\.renewal-shell-main\.is-chat\s*>\s*\.chat-room-container\s*\{[^}]*background:\s*#FAFAFC/i.test(renewal),
    false,
  );
  assert.equal(
    /\.renewal-shell-main\.is-chat\s+\.chat-room-header\s*\{[^}]*background:\s*#FFFFFF/i.test(renewal),
    false,
  );
  assert.equal(
    /\.renewal-shell-main\.is-chat\s+\.chat-composer\s*\{[^}]*background:\s*#FFFFFF/i.test(renewal),
    false,
  );
  assert.equal(
    /\.renewal-shell-main\.is-records\s+\.memo-view-header\s*\{[^}]*background:\s*#FFFFFF/i.test(renewal),
    false,
  );
});

test('dest-chrome-late has no color-mix against literal #fff', () => {
  const css = readFileSync(join(root, 'src/ui/v2/dest-chrome-late.css'), 'utf8');
  assert.equal(/,\s*#(?:fff|ffffff)\s*\)/i.test(css), false);
});
