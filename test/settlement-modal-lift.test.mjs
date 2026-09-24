import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { URL } from 'node:url';

// SettlementSummaryModal's V2 path keeps only elements it recognises as overlays (liftOverlays:
// overlay className or a /Modal/ component name). Minified builds rename functions, so every
// modal component it renders without an overlay className needs a string displayName.
test('modals rendered inside the settlement page survive minification', () => {
  const src = readFileSync(new URL('../src/ui/ui-event-modals.js', import.meta.url), 'utf8');
  const start = src.indexOf('export function SettlementSummaryModal');
  const end = src.indexOf('\nexport function ', start + 1);
  const body = src.slice(start, end);
  assert.match(body, /\/Modal\/\.test\(typeName\)/, 'liftOverlays still matches by component name');
  const rendered = new Set([...body.matchAll(/React\.createElement\(([A-Z]\w*Modal)\b/g)].map(m => m[1]));
  assert.ok(rendered.has('CreateSettlementModal'));
  for (const name of rendered) {
    assert.match(src, new RegExp(`${name}\\.displayName = '${name}'`), `${name} needs an explicit displayName`);
  }
});
