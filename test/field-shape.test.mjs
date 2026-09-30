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

test('Gallery tabs render clean labels without status dots or numeric count pills', async () => {
  const [galleryJs, destLateCss] = await Promise.all([
    readFile(new URL('../src/ui/ui-chat-gallery.js', import.meta.url), 'utf8'),
    readFile(new URL('../src/ui/v2/dest-chrome-late.css', import.meta.url), 'utf8')
  ]);
  assert.match(galleryJs, /\{ value: 'photos', label: '사진' \}/, 'photos tab uses plain label');
  assert.match(galleryJs, /\{ value: 'links', label: '링크' \}/, 'links tab uses plain label');
  assert.match(galleryJs, /\{ value: 'files', label: '파일' \}/, 'files tab uses plain label');
  assert.match(galleryJs, /\{ value: 'analysis', label: 'AI 분석' \}/, 'analysis tab uses plain label');
  assert.doesNotMatch(galleryJs, /value: 'photos'[\s\S]*?badgeMode:\s*'dot'/, 'photos tab does not use badgeMode dot');
  assert.match(destLateCss, /:is\(\.gallery-page-tabs,[\s\S]*?\.v2-gallery[\s\S]*?\) \.underline-tabs \.underline-tabs-label[\s\S]*?font-size:\s*var\(--v2-event-sheet-tab-label-fs\);/, 'gallery tabs use shared 0.9rem event-sheet font size');
  assert.match(destLateCss, /:is\(\.gallery-page-tabs,[\s\S]*?\.v2-gallery[\s\S]*?\) \.underline-tabs-label\.has-status-dot::after[\s\S]*?display:\s*none !important;/, 'gallery tabs suppress status dots');
  assert.match(destLateCss, /:is\(\.v2-gallery, \.gallery-page-tabs, \.gallery-page-tabs-mobile, \.v2-gallery-tabs-slot\) \.underline-tabs \.underline-tabs-count[\s\S]*?display:\s*none !important;/, 'numeric count pills are hidden in gallery tabs');
  assert.doesNotMatch(galleryJs, /이전 사진 더 보기/, 'gallery does not render redundant load more photos button');
  assert.doesNotMatch(galleryJs, /renderGalleryLoadMoreButton/, 'gallery does not render redundant load more buttons');
});

test('Gallery links and files render in 2-column grid with wrapping text and persistent pagination', async () => {
  const [galleryJs, filesJs] = await Promise.all([
    readFile(new URL('../src/ui/ui-chat-gallery.js', import.meta.url), 'utf8'),
    readFile(new URL('../src/ui/ui-chat-files.js', import.meta.url), 'utf8')
  ]);
  assert.match(galleryJs, /className:\s*"gallery-link-grid"[\s\S]*?gridTemplateColumns:\s*(?:isTabletOrMobile \? '1fr' : )?'repeat\(2, minmax\(0, 1fr\)\)'/, 'links render in responsive grid');
  assert.match(galleryJs, /className:\s*"gallery-file-grid"[\s\S]*?gridTemplateColumns:\s*(?:isTabletOrMobile \? '1fr' : )?'repeat\(2, minmax\(0, 1fr\)\)'/, 'files render in responsive grid');
  assert.match(galleryJs, /fallbackTitle[\s\S]*?whiteSpace:\s*'normal'[\s\S]*?wordBreak:\s*'break-word'[\s\S]*?overflowWrap:\s*'anywhere'/, 'link fallbackTitle wraps without ellipsis');
  assert.doesNotMatch(galleryJs, /fallbackTitle && [\s\S]{0,150}textOverflow:\s*'ellipsis'/, 'link fallbackTitle has no ellipsis');
  assert.match(filesJs, /attachment\.name[\s\S]*?whiteSpace:\s*"normal"[\s\S]*?overflowWrap:\s*"anywhere"[\s\S]*?wordBreak:\s*"break-word"/, 'file name wraps without clipping');
  assert.match(galleryJs, /const alwaysShow = !!options\?\.alwaysShow;[\s\S]*?if \(pageCount <= 1 && !alwaysShow\) return null;/, 'renderGalleryPagination honors alwaysShow');
});

test('Hero weather D-day calculation and badge styling', async () => {
  const [appUtilsJs, appShellJs, designCss] = await Promise.all([
    readFile(new URL('../src/core/app-utils.js', import.meta.url), 'utf8'),
    readFile(new URL('../src/ui/ui-app-shell-v2.js', import.meta.url), 'utf8'),
    readFile(new URL('../src/ui/v2/design.css', import.meta.url), 'utf8')
  ]);

  // Verify formatDDayLabel logic
  assert.match(appUtilsJs, /if \(diffDays === 0\) return 'D-Day';/, 'formatDDayLabel returns D-Day for today');
  assert.match(appUtilsJs, /if \(diffDays < 0\) return `D\+\$\{Math\.abs\(diffDays\)\}`;/, 'formatDDayLabel returns D+N for past dates');
  assert.match(appUtilsJs, /return `D-\$\{diffDays\}`;/, 'formatDDayLabel returns D-N for future dates');

  // Verify weather row badge font size and white-space
  assert.match(designCss, /\.v2-design \.bp-hero-weather-dday-badge\s*\{[\s\S]*?font-size:\s*0?\.75rem !important;/, 'dday badge stays at the 12px floor');
  assert.match(designCss, /\.v2-design \.bp-hero-weather-dday-badge\s*\{[\s\S]*?white-space:\s*nowrap !important;/, 'dday badge prevents wrapping');
  assert.match(designCss, /\.v2-design \.bp-hero-weather-past-dday\s*\{[\s\S]*?animation:\s*none !important;/, 'past dday badge disables animation');

  // Verify app shell differentiates past meetings
  assert.match(appShellJs, /const isPast = day\.offset < 0;/, 'checks whether date is in the past');
  assert.match(appShellJs, /isPast\s*\?\s*React\.createElement\('span', \{ className: 'bp-hero-weather-day bp-hero-weather-past-dday' \}, ddayText\)/, 'renders bp-hero-weather-past-dday for past meetings');
});

test('Mobile bottom nav floats over main content and allows content to scroll underneath', async () => {
  const destLateCss = await readFile(new URL('../src/ui/v2/dest-chrome-late.css', import.meta.url), 'utf8');

  // Verify shell main has padding-bottom: 0 so it reaches the bottom
  assert.match(destLateCss, /\.v2-design \.renewal-shell-main\.v2-destination:not\(\.v2-chat\)\s*\{[\s\S]*?padding-bottom:\s*0 !important;/, 'main shell padding-bottom is 0 for floating overlay nav');

  // Verify inner scroll containers keep clearance
  assert.match(destLateCss, /\.v2-design \.gallery-page-scroll,[\s\S]*?padding-bottom:\s*calc\(var\(--mobile-bottom-nav-total, 58px\) \+ 24px\) !important;/, 'inner containers maintain bottom nav clearance');
});

test('Chat and memo file attachments collection and gallery photo filtering', async () => {
  const [chatFilesJs, galleryJs, galleryDataJs] = await Promise.all([
    readFile(new URL('../src/core/chat-file-attachments.js', import.meta.url), 'utf8'),
    readFile(new URL('../src/ui/ui-chat-gallery.js', import.meta.url), 'utf8'),
    readFile(new URL('../src/core/gallery-data.js', import.meta.url), 'utf8')
  ]);

  // File collection from memos
  assert.match(chatFilesJs, /export function collectChatFileAttachmentsFromMessages\(messages,\s*memos = \[\]\)/, 'collects from both messages and memos');
  assert.match(chatFilesJs, /\(Array\.isArray\(memos\) \? memos : \[\]\)\.forEach\(memo => \{/, 'scans memos for file attachments');
  assert.match(galleryJs, /import \{ collectChatFileAttachmentsFromMessages \} from '\.\.\/core\/chat-file-attachments\.js';/, 'ui-chat-gallery imports collectChatFileAttachmentsFromMessages');

  // Photo filtering excludes links and external service urls
  assert.match(galleryJs, /\.filter\(photo => !isGalleryWebLinkPhoto\(photo\)\)/, 'sharedPhotos keeps stored media and drops webpage links');
  assert.match(galleryDataJs, /export function isGalleryWebLinkPhoto/, 'stored gallery media is not treated as an external link');
  assert.match(galleryDataJs, /const hasPhotos = Boolean\(memo\.imageUrl \|\| \(Array\.isArray\(memo\.imageUrls\) && memo\.imageUrls\.length > 0\)/, 'composeGalleryPhotos skips memos without uploaded photos');
});


