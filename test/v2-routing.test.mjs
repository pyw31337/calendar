import test from 'node:test';
import assert from 'node:assert/strict';
import { URL } from 'node:url';
import { getInitialAppView, buildAppViewUrl } from '../src/core/app-routing-state.js';
import { photoLightbox, timestampMs } from '../src/ui/v2/view-data.js';
import { resolveV2Destination, V2_PRIMARY } from '../src/ui/v2/shell-nav.js';

const location = search => ({ pathname: '/calendar/', search });
test('default routes ignore V2 tab/sub parameters', () => {
  assert.equal(getInitialAppView(location('?id=example&tab=records&sub=memo')), 'calendar');
  assert.equal(getInitialAppView(location('?view=chat&tab=records&sub=memo')), 'chat');
  assert.equal(buildAppViewUrl(location('?id=example'), 'memo'), '/calendar/?id=example&view=memo');
});
test('V2 first-class destinations use ?tab=memo|places (not records sub)', () => {
  assert.equal(getInitialAppView(location('?shell=v2&tab=memo')), 'memo');
  assert.equal(getInitialAppView(location('?shell=v2&tab=places')), 'places');
  assert.equal(getInitialAppView(location('?shell=v2&tab=chat')), 'chat');
  assert.equal(getInitialAppView(location('?shell=v2&tab=settlement')), 'settlement');
  // Legacy bookmark still resolves to the same data view, then shell promotes tab.
  assert.equal(getInitialAppView(location('?shell=v2&tab=records&sub=memo&view=chat')), 'memo');
  assert.equal(getInitialAppView(location('?shell=v2&tab=records&sub=places')), 'places');
  for (const view of ['memo', 'places', 'chat', 'settlement']) {
    const url = buildAppViewUrl(location('?id=example&shell=v2&tab=chat'), view);
    const params = new URL(url, 'https://example.test').searchParams;
    assert.equal(params.get('tab'), view);
    assert.equal(params.has('sub'), false);
    assert.equal(params.get('id'), 'example');
  }
});
test('V2 records subs remain for gallery/history/content only', () => {
  for (const [sub, view] of Object.entries({ media: 'gallery', archive: 'history', content: 'content' })) {
    assert.equal(getInitialAppView(location(`?shell=v2&tab=records&sub=${sub}&view=chat`)), view);
    const url = buildAppViewUrl(location('?id=example&shell=v2&tab=chat'), view);
    const params = new URL(url, 'https://example.test').searchParams;
    assert.equal(params.get('tab'), 'records');
    assert.equal(params.get('sub'), sub);
  }
  assert.equal(getInitialAppView(location('?shell=v2&tab=more')), 'calendar');
});
test('V2 home clears stale detail routes while retaining calendar identity', () => {
  const result = buildAppViewUrl(location('?shell=v2&id=example&tab=memo&view=memo'), 'calendar');
  const params = new URL(result, 'https://example.test').searchParams;
  for (const key of ['tab', 'sub', 'view']) assert.equal(params.has(key), false);
  assert.equal(params.get('shell'), 'v2');
  assert.equal(params.get('id'), 'example');
});
test('direct share views remain authoritative', () => {
  assert.equal(getInitialAppView(location('?shell=v2&tab=chat'), () => ({ view: 'memo' })), 'memo');
});
test('shell-nav resolves Bento IA to first-class destinations', () => {
  assert.deepEqual(resolveV2Destination('memo'), { tab: 'memo', sub: null });
  assert.deepEqual(resolveV2Destination('places'), { tab: 'places', sub: null });
  assert.deepEqual(resolveV2Destination('gallery'), { tab: 'records', sub: 'media' });
  assert.equal(V2_PRIMARY.some(i => i.id === 'memo'), true);
  assert.equal(V2_PRIMARY.some(i => i.id === 'places'), true);
});
test('gallery preview uses the shared lightbox URL and identity contract', () => {
  const photos = [{ full: 'https://example.test/a.jpg', messageId: 'm1', imageIndex: 0, assetKey: 'asset-1', thumb: 'thumb-1' }, { url: 'https://example.test/b.jpg', memoId: 'memo2', refKey: 'ref-2' }];
  const lightbox = photoLightbox(photos[1], photos);
  assert.deepEqual(lightbox.urls, photos.map(p => p.full || p.url));
  assert.equal(lightbox.index, 1);
  assert.equal(lightbox.meta[0].assetKey, 'asset-1');
  assert.equal(lightbox.meta[1].memoId, 'memo2');
  assert.equal(lightbox.meta[1].refKey, 'ref-2');
});
test('timestamps normalize without turning Firestore seconds into 1970 dates', () => {
  const ms = 1780000000000;
  for (const input of [ms, String(ms), { seconds: ms / 1000 }, { toMillis: () => ms }, { toDate: () => new Date(ms) }, new Date(ms).toISOString()]) assert.equal(timestampMs(input), ms);
  assert.equal(timestampMs(null), 0);
});

test('V2 date modal opts into bento sheet chrome without changing default export signature defaults', async () => {
  const { readFileSync } = await import('node:fs');
  const modal = readFileSync(new URL('../src/ui/ui-date-modal.js', import.meta.url), 'utf8');
  const shell = readFileSync(new URL('../src/ui/ui-app-shell-v2.js', import.meta.url), 'utf8');
  assert.match(modal, /shellChrome\s*=\s*null/);
  assert.match(modal, /shellChrome === 'bento'/);
  assert.match(modal, /bp-event-sheet bp-is-open/);
  assert.match(modal, /\.renewal-shell\.v2-design/);
  assert.match(shell, /shellChrome:\s*'bento'/);
  assert.equal((shell.match(/shellChrome:\s*'bento'/g) || []).length >= 3, true);
  // First-class destination tabs present in shell.
  assert.match(shell, /activeTab === 'memo'/);
  assert.match(shell, /activeTab === 'places'/);
  assert.match(shell, /resolveV2Destination/);
  // Legacy ?tab=records&sub=memo|places bookmarks promote to first-class tabs; sub is stripped.
  assert.match(shell, /sub === 'memo' \|\| sub === 'places'/);
  assert.match(shell, /Only gallery\/content\/archive \(records\) keep \?sub=/);
});

test('V2 PC polish keeps wider rail, fluid content, 3x3 gallery, and participant memos', async () => {
  const { readFileSync } = await import('node:fs');
  const design = readFileSync(new URL('../src/ui/v2/design.css', import.meta.url), 'utf8');
  const shell = readFileSync(new URL('../src/ui/ui-app-shell-v2.js', import.meta.url), 'utf8');
  assert.match(design, /--v2-side-nav-width:\s*280px/);
  assert.match(design, /--v2-content-max:\s*1600px/);
  assert.match(design, /grid-template-columns:\s*repeat\(3, 1fr\)/);
  assert.match(design, /min-width:\s*1\.85em/);
  assert.match(design, /bp-day-bar-stack/);
  assert.match(design, /\.bp-p-dot::after[\s\S]*font-size:\s*0\.6rem/);
  assert.match(design, /bp-day-anniversary\.bp-start/);
  assert.match(design, /bp-day-anniversary\.bp-mid/);
  assert.match(design, /bp-day-anniversary\.bp-end/);
  assert.match(design, /bp-day-anniversary\.bp-solo/);
  assert.match(design, /border-radius:\s*999px 0 0 999px/);
  assert.match(design, /border-radius:\s*0 999px 999px 0/);
  assert.match(design, /--v2-fs-base:\s*0\.88rem/);
  assert.match(design, /--v2-fs-md:\s*0\.82rem/);
  assert.match(design, /--v2-fs-title:\s*1\.12rem/);

  assert.match(shell, /slice\(0, 9\)/);
  assert.match(shell, /dday-participant-memos/);
  assert.match(shell, /participantMemosFor/);
  assert.match(shell, /day-bar-stack/);
  assert.match(shell, /anns\.slice\(0, 4\)\.map/);
  assert.match(shell, /day-head-row/);
  assert.match(shell, /day-meeting-pill/);
  assert.match(shell, /anniversarySpanRole/);
  assert.match(shell, /day-anniversary \$\{role\}/);
  assert.match(shell, /chat-bubble-modules/);
  assert.match(shell, /ChatBubbleFrame/);
  // V2 badge colors: 모임확정/일정·여행 = brand purple; 기념일 = status-green
  assert.match(design, /bp-day-meeting-pill/);
  assert.match(design, /status-green/);
  assert.match(design, /background:\s*var\(--brand/);
  assert.match(design, /background:\s*var\(--status-green/);
  assert.doesNotMatch(design, /#F472B6/);
});


test('V2 destination screens keep live feature entry points', async () => {
  const { readFileSync } = await import('node:fs');
  const screens = readFileSync(new URL('../src/ui/v2/screens.js', import.meta.url), 'utf8');
  const shell = readFileSync(new URL('../src/ui/ui-app-shell-v2.js', import.meta.url), 'utf8');
  const styles = readFileSync(new URL('../src/ui/v2/screens.css', import.meta.url), 'utf8');
  // Search / share / FAB / map / composer remain wired (design is chrome-only).
  assert.match(screens, /placeholder: '장소 검색'/);
  assert.match(screens, /placeholder: '메모 검색'|메모 검색/);
  assert.match(screens, /Fab\(/);
  assert.match(screens, /label: '메모 작성'/);
  assert.match(screens, /label: '장소 등록'/);
  assert.match(screens, /label: '지출 추가'/);
  assert.match(screens, /label: '지도로 보기'|icon: 'map'/);
  assert.match(screens, /onShare/);
  assert.match(screens, /bp-composer-input|composer/);
  assert.match(screens, /대화 검색/);
  // Gallery/media keeps share + lightbox plumbing; v2 wrapper is presentation-only.
  assert.match(shell, /v2-records-media/);
  assert.match(shell, /onOpenGalleryShare/);
  assert.match(shell, /clickLegacyAriaButton\('갤러리 검색'/);
  assert.match(screens, /label: '갤러리 검색'/);
  assert.match(shell, /setActiveLightbox/);
  assert.match(shell, /dday-participant-memos/);
  assert.match(styles, /chat-reply-quote-card/);
  assert.match(styles, /v2-records-media/);
});
