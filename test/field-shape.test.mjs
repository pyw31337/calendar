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

test('Memo titles use full capsule borders while actual edge-only fields keep straight lines', async () => {
  const [destLateCss, auditCss, screensJs, memoView] = await Promise.all([
    readFile(new URL('../src/ui/v2/dest-chrome-late.css', import.meta.url), 'utf8'),
    readFile(new URL('../src/ui/v2/responsive-audit.css', import.meta.url), 'utf8'),
    readFile(new URL('../src/ui/v2/screens.js', import.meta.url), 'utf8'),
    readFile(new URL('../src/ui/ui-memo-view.js', import.meta.url), 'utf8')
  ]);
  assert.doesNotMatch(destLateCss, /\.memo-edit-title-input[\s\S]{0,160}border-radius:\s*0 !important;/, 'memo title input is no longer treated as an edge-only field');
  assert.match(memoView, /className: "memo-edit-title-input form-input"/, 'memo title fields opt into the shared single-line form geometry');
  assert.match(memoView, /borderRadius: 'var\(--field-radius-single-line\)'/, 'memo title fields render as capsules');
  assert.match(destLateCss, /input:is\(\.field-edge-bottom, \[class\*="field-edge-"\]\)[\s\S]{0,100}border-radius:\s*0 !important;/, 'genuine edge-only fields retain straight border ends');
  assert.match(destLateCss, /\.modal-header,[\s\S]*?\.bottom-sheet-header[\s\S]*?border-bottom:\s*none !important;/, 'modal-overlay header border-bottom is removed');
  assert.match(auditCss, /\.modal-overlay \.modal-header[\s\S]*?border-bottom:\s*none !important;/, 'responsive audit modal-header removes divider');
  assert.match(screensJs, /className:\s*'modal-header',\s*style:\s*\{[^}]*borderBottom:\s*'none'/, 'screens.js layerPopup modal-header sets borderBottom to none');
});

test('Gallery tabs use dot badge mode and match event-sheet text style without numeric count pills', async () => {
  const [galleryJs, destLateCss] = await Promise.all([
    readFile(new URL('../src/ui/ui-chat-gallery.js', import.meta.url), 'utf8'),
    readFile(new URL('../src/ui/v2/dest-chrome-late.css', import.meta.url), 'utf8')
  ]);
  assert.match(galleryJs, /\{ value: 'photos', label: '사진', badge: displayPhotoTabCount, badgeMode: 'dot' \}/, 'photos tab uses dot badge mode');
  assert.match(galleryJs, /\{ value: 'links', label: '링크', badge: filteredLinks\.length, badgeMode: 'dot' \}/, 'links tab uses dot badge mode');
  assert.match(galleryJs, /\{ value: 'files', label: '파일', badge: filteredFiles\.length, badgeMode: 'dot' \}/, 'files tab uses dot badge mode');
  assert.match(galleryJs, /\{ value: 'analysis', label: 'AI 분석', badge: mediaAnalysis\.items\.length \|\| undefined, badgeMode: 'dot' \}/, 'analysis tab uses dot badge mode');
  assert.match(destLateCss, /:is\(\.gallery-page-tabs,[\s\S]*?\.v2-gallery[\s\S]*?\) \.underline-tabs \.underline-tabs-label[\s\S]*?font-size:\s*var\(--v2-event-sheet-tab-label-fs\);/, 'gallery tabs use shared 0.9rem event-sheet font size');
  assert.match(destLateCss, /:is\(\.gallery-page-tabs,[\s\S]*?\.v2-gallery[\s\S]*?\) \.underline-tabs-label\.has-status-dot::after/, 'gallery tabs render shared purple status dot');
  assert.match(destLateCss, /:is\(\.v2-gallery, \.gallery-page-tabs, \.gallery-page-tabs-mobile, \.v2-gallery-tabs-slot\) \.underline-tabs \.underline-tabs-count[\s\S]*?display:\s*none !important;/, 'numeric count pills are hidden in gallery tabs');
});
