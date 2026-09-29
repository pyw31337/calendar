import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { URL } from 'node:url';

const { countPlaceholderLines } = await import('../src/core/field-shape.js');
const tenPxPerChar = text => text.length * 10;

test('placeholder line count drives capsule (1) vs box (2+)', () => {
  assert.equal(countPlaceholderLines('', 300, tenPxPerChar), 1);
  assert.equal(countPlaceholderLines('short', 300, tenPxPerChar), 1);
  assert.equal(countPlaceholderLines('x'.repeat(30), 300, tenPxPerChar), 1, 'exactly fills one line');
  assert.equal(countPlaceholderLines('x'.repeat(31), 300, tenPxPerChar), 2, 'wraps');
  assert.equal(countPlaceholderLines('a\nb', 300, tenPxPerChar), 2, 'explicit newline');
  assert.equal(countPlaceholderLines('text', 0, tenPxPerChar), 1, 'unmeasurable width');
});

test('V2 applies capsule geometry to picker controls and one-line settlement members', async () => {
  const [css, modal] = await Promise.all([
    readFile(new URL('../src/ui/v2/dest-chrome-late.css', import.meta.url), 'utf8'),
    readFile(new URL('../src/ui/ui-event-modals.js', import.meta.url), 'utf8')
  ]);
  assert.match(css, /button\.form-select[\s\S]{0,320}border-radius:\s*var\(--field-radius-single-line\) !important/, 'bottom-sheet picker trigger is a capsule');
  assert.match(css, /\.settlement-participant-row:not\(\.is-multiline\)[\s\S]{0,120}border-radius:\s*var\(--field-radius-single-line\) !important/, 'single-line settlement member is a capsule');
  assert.match(css, /\.settlement-participant-row\.is-multiline[\s\S]{0,220}border-radius:\s*var\(--field-radius-multiline\) !important/, 'memo-bearing member remains a rounded box');
  assert.match(modal, /className: `settlement-participant-row\$\{row\.memo \? ' is-multiline' : ''\}`/, 'member row exposes its actual line count to the style system');
});

test('Chat composer field maintains capsule on single line and transitions to rounded rectangle on multi-line', async () => {
  const [appCss, destLateCss, screensCss, screensJs] = await Promise.all([
    readFile(new URL('../src/app.css', import.meta.url), 'utf8'),
    readFile(new URL('../src/ui/v2/dest-chrome-late.css', import.meta.url), 'utf8'),
    readFile(new URL('../src/ui/v2/screens.css', import.meta.url), 'utf8'),
    readFile(new URL('../src/ui/v2/screens.js', import.meta.url), 'utf8')
  ]);
  assert.match(appCss, /--field-radius-single-line:\s*calc\(var\(--field-single-line-height,\s*44px\)\s*\/\s*2\);/, '--field-radius-single-line is half the single-line height for exact capsule geometry');
  assert.match(destLateCss, /\.bp-composer-input:not\(\.is-multiline\):not\(\[data-field-lines="multi"\]\)[\s\S]{0,160}border-radius:\s*var\(--field-radius-single-line\) !important;/, 'single-line composer input gets capsule radius');
  assert.match(destLateCss, /\.bp-composer-input\.is-multiline[\s\S]{0,160}border-radius:\s*var\(--field-radius-multiline\) !important;/, 'multiline composer input gets rounded rectangle radius');
  assert.match(screensCss, /\.bp-composer-input\.is-multiline[\s\S]{0,200}white-space:\s*pre-wrap !important;/, 'multiline composer wraps text');
  assert.match(screensJs, /isMultiline/, 'ChatScreen computes multiline status for composer input');
});

