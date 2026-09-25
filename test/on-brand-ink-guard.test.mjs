import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import postcss from 'postcss';

// In dark mode the brand and status-green fills are bright (V2 lime #C9FD58, V1 #4ADE80), so a
// literal white label on them is ~1.2-1.8:1 and unreadable. Anything painted with one of those
// fills must take its ink from --on-brand / --on-status (white in light mode, near-black in dark).
const FILL = /var\(--(v2-primary|brand|accent-primary|status-green|cal-schedule)\b|#C9FD58|#4ADE80/i;
const WHITE_CSS = /^(#fff(fff)?|white|rgb\(255,\s*255,\s*255\))\s*(!important)?$/i;
const WHITE_JS = /(?<![\w-])color:\s*'(#fff|#ffffff|white)'/i;

function listFiles(dir, ext) {
  const out = [];
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    if (fs.statSync(p).isDirectory()) out.push(...listFiles(p, ext));
    else if (p.endsWith(ext)) out.push(p);
  }
  return out;
}

test('CSS rules with a brand/status-green fill never hardcode white text', () => {
  const offenders = [];
  for (const file of listFiles('src', '.css')) {
    postcss.parse(fs.readFileSync(file, 'utf8')).walkRules(rule => {
      let fill = '';
      let color = '';
      rule.walkDecls(decl => {
        if (/^background(-color)?$/.test(decl.prop)) fill = decl.value;
        if (decl.prop === 'color') color = decl.value;
      });
      // Gradients mix the brand with another color; there is no single right ink for them.
      if (!fill || /gradient/i.test(fill) || !FILL.test(fill)) return;
      if (WHITE_CSS.test(color.trim())) offenders.push(`${file}:${rule.source.start.line} ${rule.selector.slice(0, 80)}`);
    });
  }
  assert.deepEqual(offenders, [], 'use color: var(--on-brand, #fff) / var(--on-status, #fff)');
});

test('inline styles with a brand/status-green fill never hardcode white text', () => {
  const offenders = [];
  for (const file of listFiles('src', '.js')) {
    const lines = fs.readFileSync(file, 'utf8').split('\n');
    lines.forEach((line, i) => {
      const fill = line.match(/background(?:Color)?:\s*'([^']*)'/);
      if (!fill || !FILL.test(fill[1])) return;
      // Same style object: the fill's line and its immediate neighbours.
      if ([lines[i - 1], line, lines[i + 1]].some(l => l && WHITE_JS.test(l))) offenders.push(`${file}:${i + 1}`);
    });
  }
  assert.deepEqual(offenders, [], "use color: 'var(--on-brand, #fff)' / 'var(--on-status, #fff)'");
});

test('inline styles never paint a literal white/light-gray surface (dark mode would keep it white)', () => {
  const LIGHT = /background(?:Color)?:\s*'(#fff|#ffffff|white|#f8fafc|#f1f5f9|#fafafa)'/i;
  const offenders = [];
  for (const file of listFiles('src/ui', '.js')) {
    if (/admin/.test(file)) continue; // the admin dashboard pins its own light palette
    fs.readFileSync(file, 'utf8').split('\n').forEach((line, i) => {
      // Allowed: the toggle switch's knob (white in both themes by design), and a white chip that
      // pins its own dark ink on the same line (e.g. the lightbox tag-delete disc over a photo).
      const pinnedInk = /(?<![\w-])color:\s*'#(0|1|2|3)[0-9a-f]{5}'/i.test(line);
      if (LIGHT.test(line) && !pinnedInk && !/borderRadius: '50%', backgroundColor: '#FFFFFF'/.test(line)) offenders.push(`${file}:${i + 1}`);
    });
  }
  assert.deepEqual(offenders, [], "use 'var(--bg-card)' / 'var(--bg-primary)'");
});
