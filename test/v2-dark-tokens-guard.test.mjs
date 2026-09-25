import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

// Ongoing guard (not tied to one phase) against the exact failure mode Phase 1-4 kept
// re-introducing in different files: a CSS custom property meant to be theme-aware
// (defined via var(--text-main) etc. so :root[data-theme="dark"] can override it) gets
// silently re-pinned to a literal light hex somewhere downstream, and every element that
// reads that variable goes back to light colors regardless of the active theme -- with no
// visible error, since the CSS is perfectly valid, just wrong for dark mode.

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const v2Dir = join(root, 'src/ui/v2');
const v2Files = readdirSync(v2Dir).filter(f => f.endsWith('.css'));

// These four are the specific "V2 reference parity" aliases app.css hands to every V2
// surface (.renewal-shell-main and almost everything under it reads them for
// background/color). There is no legitimate reason for any of these to ever be a literal
// hex instead of var(--bg-primary)/var(--bg-card)/var(--text-main)/var(--text-muted) --
// that literal-hex form is exactly the Phase 4 bug.
const RENEWAL_VARS = ['--renewal-bg', '--renewal-card', '--renewal-text', '--renewal-muted'];

test('--renewal-* tokens are never assigned a literal hex (anywhere in the repo)', () => {
  const offenders = [];
  const searchFiles = [join(root, 'src/app.css'), ...v2Files.map(f => join(v2Dir, f))];
  for (const file of searchFiles) {
    const css = readFileSync(file, 'utf8');
    css.split('\n').forEach((line, idx) => {
      for (const name of RENEWAL_VARS) {
        const re = new RegExp(`${name}\\s*:\\s*#[0-9a-fA-F]{3,8}\\b`);
        if (re.test(line)) offenders.push(`${file}:${idx + 1}: ${line.trim()}`);
      }
    });
  }
  assert.deepEqual(offenders, [], `--renewal-* must always resolve through var(--bg-primary)/var(--text-main)/etc, never a literal hex:\n${offenders.join('\n')}`);
});

// src/ui/v2/**/*.css should only ever CONSUME the shared theme tokens (--bg-primary,
// --bg-card, --bg-secondary, --text-main, --text-muted, --text-light) via var(...); it has
// no business redefining them. Phase 1's bug was exactly this: reference-*.css files
// reintroducing "--bg-primary: #FAFAFC" inside a .v2-* scope, silently overriding the
// theme-aware definition from src/app.css for every element under that scope.
const BASE_THEME_VARS = ['--bg-primary', '--bg-card', '--bg-secondary', '--text-main', '--text-muted', '--text-light'];

test('src/ui/v2/*.css never redefines the shared --bg-*/--text-* theme tokens', () => {
  const offenders = [];
  for (const file of v2Files) {
    const css = readFileSync(join(v2Dir, file), 'utf8');
    css.split('\n').forEach((line, idx) => {
      for (const name of BASE_THEME_VARS) {
        const re = new RegExp(`^\\s*${name}\\s*:`);
        if (re.test(line)) offenders.push(`${file}:${idx + 1}: ${line.trim()}`);
      }
    });
  }
  assert.deepEqual(offenders, [], `src/ui/v2 must only consume these tokens via var(...), never redefine them:\n${offenders.join('\n')}`);
});
