import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const appCss = readFileSync(join(root, 'src/app.css'), 'utf8');

test('.renewal-shell "V2 reference parity" block keeps --renewal-* vars theme-aware', () => {
  // This block runs AFTER the shell's own base rule (which sets --renewal-bg/card/text/muted
  // to var(--bg-primary) etc.) and used to re-pin them to hardcoded light hex, silently undoing
  // dark mode for every V2 page (title bars, memo card titles, settlement category label, ...)
  // since color/background on .renewal-shell-main and its descendants all read these vars.
  const match = appCss.match(/\.renewal-shell\s*\{[^}]*--renewal-text:\s*([^;]+);/);
  assert.ok(match, 'could not find the .renewal-shell --renewal-text declaration');
  assert.equal(match[1].trim(), 'var(--text-main)');
  assert.equal(/--renewal-bg:\s*#[0-9a-fA-F]{3,6}/.test(appCss), false, '--renewal-bg must not be a hardcoded hex');
  assert.equal(/--renewal-card:\s*#[0-9a-fA-F]{3,6}/.test(appCss), false, '--renewal-card must not be a hardcoded hex');
  assert.equal(/--renewal-muted:\s*#[0-9a-fA-F]{3,6}/.test(appCss), false, '--renewal-muted must not be a hardcoded hex');
});

test('src/ui/v2 does not set literal color: #1e1b2e (must use var(--text-main))', () => {
  const files = ['screens.css', 'dest-chrome-late.css', 'design.css', 'responsive-audit.css'];
  for (const file of files) {
    const css = readFileSync(join(root, 'src/ui/v2', file), 'utf8');
    assert.equal(
      /color:\s*#1e1b2e\b/i.test(css),
      false,
      `${file} has a literal color: #1e1b2e (should be var(--text-main))`,
    );
  }
});
