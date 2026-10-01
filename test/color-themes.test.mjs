import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import {
  COLOR_THEMES, parseThemeChoice, serializeThemeChoice, toggleThemeChoice, isStoredThemeChoice, findColorTheme,
} from '../src/core/color-themes.js';

const v2Dir = new URL('../src/ui/v2/', import.meta.url);
const themeCss = readFileSync(new URL('color-themes.css', v2Dir), 'utf8');
const v2Css = readdirSync(v2Dir)
  .filter(name => name.endsWith('.css') && name !== 'color-themes.css')
  .map(name => [name, readFileSync(new URL(name, v2Dir), 'utf8')]);

test('stored theme values parse to a mode and an optional point color', () => {
  assert.deepEqual(parseThemeChoice('light'), { mode: 'light', accent: '' });
  assert.deepEqual(parseThemeChoice('dark:orange'), { mode: 'dark', accent: 'orange' });
  assert.deepEqual(parseThemeChoice('dark:teal'), { mode: 'dark', accent: '' });
  assert.deepEqual(parseThemeChoice(null), { mode: 'system', accent: '' });
  assert.equal(serializeThemeChoice({ mode: 'light', accent: 'blue' }), 'light:blue');
  assert.equal(serializeThemeChoice({ mode: 'dark', accent: '' }), 'dark');
  assert.equal(isStoredThemeChoice('light:orange'), true);
  assert.equal(isStoredThemeChoice('system'), false);
});

test('the dark-mode switch keeps the point color', () => {
  assert.equal(toggleThemeChoice('light:orange', 'light'), 'dark:orange');
  assert.equal(toggleThemeChoice('dark:blue', 'dark'), 'light:blue');
  assert.equal(toggleThemeChoice('light', 'light'), 'dark');
  assert.equal(toggleThemeChoice('system', 'dark'), 'light');
});

test('every picker entry round-trips through the stored value', () => {
  assert.equal(new Set(COLOR_THEMES.map(theme => theme.id)).size, COLOR_THEMES.length);
  for (const theme of COLOR_THEMES) {
    assert.equal(serializeThemeChoice(parseThemeChoice(theme.id)), theme.id);
    assert.equal(findColorTheme(theme.id), theme);
  }
});

// The two default themes must render exactly as before: --a-*/--d-* are only defined under
// [data-accent], so every use outside color-themes.css needs the original color as a fallback.
test('every themed literal in the V2 CSS keeps its original color as the fallback', () => {
  for (const [name, css] of v2Css) {
    const bare = css.match(/var\(--[ad]-[\w-]+\)/g);
    assert.equal(bare, null, `${name} uses a color-theme token without a fallback: ${bare}`);
  }
});

test('each point-color theme defines every token the V2 CSS reads', () => {
  const used = new Set();
  for (const [, css] of v2Css) for (const m of css.matchAll(/var\((--[ad]-[\w-]+),/g)) used.add(m[1]);
  const block = selector => {
    const start = themeCss.indexOf(`${selector} {`);
    assert.ok(start >= 0, `missing ${selector}`);
    return themeCss.slice(start, themeCss.indexOf('}', start));
  };
  const blocks = {
    'light:orange': block('html[data-accent="orange"]:not([data-theme="dark"]):has(.renewal-shell.v2-design)'),
    'light:blue': block('html[data-accent="blue"]:not([data-theme="dark"]):has(.renewal-shell.v2-design)'),
    'dark:orange': block('html[data-theme="dark"][data-accent="orange"]:has(.renewal-shell.v2-design)'),
    'dark:blue': block('html[data-theme="dark"][data-accent="blue"]:has(.renewal-shell.v2-design)'),
    'light:pink': block('html[data-accent="pink"]:not([data-theme="dark"]):has(.renewal-shell.v2-design)'),
    'dark:pink': block('html[data-theme="dark"][data-accent="pink"]:has(.renewal-shell.v2-design)'),
  };
  for (const token of used) {
    for (const [id, body] of Object.entries(blocks)) {
      const needed = token.startsWith('--a-') ? id.startsWith('light') : id.startsWith('dark');
      if (needed) assert.match(body, new RegExp(`${token}:`), `${id} does not define ${token}`);
    }
  }
});

test('settings offers every color theme and the shell passes the picker through', () => {
  const sideMenu = readFileSync(new URL('../src/ui/ui-side-menu.js', import.meta.url), 'utf8');
  const shell = readFileSync(new URL('../src/ui/ui-app-shell-v2.js', import.meta.url), 'utf8');
  assert.match(sideMenu, /COLOR_THEME_GROUPS\.map/);
  assert.match(sideMenu, /typeof onSelectColorTheme === 'function'\s*\? \/\*#__PURE__\*\/React\.createElement\(ColorThemePicker/, 'the theme picker replaces the dark-mode switch');
  assert.match(shell, /onSelectColorTheme: selectColorTheme/);
  assert.match(shell, /import '\.\/v2\/color-themes\.css';/);
});
