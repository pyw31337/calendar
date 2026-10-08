import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';

const uiDir = new URL('../src/ui/', import.meta.url);
const uiJs = readdirSync(uiDir).filter(n => n.endsWith('.js')).map(n => [n, readFileSync(new URL(n, uiDir), 'utf8')]);
const lateCss = readFileSync(new URL('v2/dest-chrome-late.css', uiDir), 'utf8');
const DARK = 'html:has(.renewal-shell.v2-design)[data-theme="dark"]';

function darkToneBlock() {
  const start = lateCss.indexOf(`${DARK} {\n  --tone-`);
  assert.ok(start >= 0, 'dark tone token block exists');
  return lateCss.slice(start, lateCss.indexOf('}', start));
}

test('inline --tone-* colors keep their light literal as the fallback and are defined for dark', () => {
  const defined = new Set([...darkToneBlock().matchAll(/(--tone-[\w-]+):/g)].map(m => m[1]));
  for (const [name, src] of uiJs) {
    for (const m of src.matchAll(/var\((--tone-[\w$-]+)([,)])/g)) {
      if (m[1].includes('$')) continue; // toneInk() template, checked below
      assert.equal(m[2], ',', `${name}: ${m[1]} needs a light-theme fallback`);
      assert.ok(defined.has(m[1]), `${name}: ${m[1]} is not defined in the dark block`);
    }
  }
  const admin = readFileSync(new URL('ui-admin-modals.js', uiDir), 'utf8');
  for (const tone of new Set([...admin.matchAll(/: '(\w+)'/g)].map(m => m[1]).filter(t => /^(blue|violet|red|amber|orange|indigo|purple)$/.test(t)))) {
    assert.ok(defined.has(`--tone-${tone}-ink`), `--tone-${tone}-ink is not defined`);
  }
});

test('dark inline-ink overrides match the color property, not background-color/border-color', () => {
  // [style*="color: X"] also matches "background-color: X"; anchored forms are ^="color: or *=" color:
  const bare = [...lateCss.matchAll(/\[style\*="color: [^"]+"\]/g)].map(m => m[0]);
  assert.deepEqual(bare, [], 'use [style^="color: …"] / [style*=" color: …"] instead');
});

test('the dark map inverts the vector layer only once', () => {
  assert.match(lateCss, /\.leaflet-tile-pane \.leaflet-gl-layer \{\s*filter: none;/);
});

test('shared widgets read from GATHER_UI_COMPONENTS have a static fallback', () => {
  // ui-widgets.js is now loaded lazily, so a bare __comp.ParticipantBadge lookup can be undefined
  // and crash the screen (React #130), e.g. the calendar settings 복구/로그 tabs.
  const widgets = ['SearchResultLogRow', 'TikTokEmbedWidget', 'ParticipantPickerButton', 'ParticipantBadge'];
  for (const [name, src] of uiJs) {
    // A file that already imports ui-widgets.js statically has it registered before render.
    if (/^import \{[^}]*\} from '\.\/ui-widgets\.js';$/m.test(src) && !/ as Widget/.test(src)) continue;
    for (const w of widgets) {
      const re = new RegExp(`const ${w} = __comp\\.${w} \\|\\| __deps\\.${w}(.*);`, 'g');
      for (const m of src.matchAll(re)) assert.ok(m[1].includes(`Widget${w}`), `${name}: ${w} has no static fallback`);
    }
  }
});

test('블랙·핫핑크 D-day badges use black ink on the orange second accent', () => {
  assert.match(lateCss, /\[data-accent="pink"\]:has\(\.renewal-shell\.v2-design\) \.renewal-shell\.v2-design \.bp-dday-expanded-badge \{\s*color: var\(--on-brand, #0D0D0D\) !important;/);
});
