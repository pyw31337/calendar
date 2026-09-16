import test from 'node:test';
import { URL } from 'node:url';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import postcss from 'postcss';

test('every V2 style selector is confined to a V2 root', () => {
  const folder = new URL('../src/ui/v2/', import.meta.url);
  for (const file of readdirSync(folder).filter(name => name.endsWith('.css'))) {
    const root = postcss.parse(readFileSync(new URL(file, folder), 'utf8'));
    root.walkRules(rule => {
      if (rule.parent.type === 'atrule' && /keyframes$/.test(rule.parent.name)) return;
      for (const selector of rule.selectors) {
        assert.match(selector, /^(?:\.renewal-shell)?\.v2-(?:design|chat|memo|places|settlement)(?=[\s.:>]|$)/, `${file}: unscoped selector ${selector}`);
        assert.doesNotMatch(selector, /\.bp-[\w-]*\.v2-/, `${file}: a class name was mistaken for a body selector`);
      }
    });
    root.walkAtRules(/keyframes$/, rule => assert.match(rule.params, /^bp-/, `${file}: animation leaks into original UI`));
  }
});
