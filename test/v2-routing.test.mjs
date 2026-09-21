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

test('V2 places screen does not reparent Leaflet map slots (removeChild crash)', async () => {
  const { readFileSync } = await import('node:fs');
  const screens = readFileSync(new URL('../src/ui/v2/screens.js', import.meta.url), 'utf8');
  assert.match(screens, /v2-places-legacy/);
  assert.doesNotMatch(screens, /slots\.list \|\| slots\.map/);
  assert.match(screens, /Same React element in two parents/);
});

test('V2 destination panes prefetch lazy UI and never stall on 불러오는 중 copy', async () => {
  const { readFileSync } = await import('node:fs');
  const shell = readFileSync(new URL('../src/ui/ui-app-shell-v2.js', import.meta.url), 'utf8');
  const screens = readFileSync(new URL('../src/ui/v2/screens.js', import.meta.url), 'utf8');
  assert.match(shell, /function useLazyUi/);
  assert.match(shell, /prefetchDestinationUi/);
  assert.match(shell, /function HomePlaceCard/);
  assert.match(shell, /homePlaceVisitLine/);
  assert.match(shell, /TABLER_ICONS\.externalLink/);
  assert.doesNotMatch(shell, /title: '메모 불러오는 중'/);
  assert.doesNotMatch(shell, /title: '장소 불러오는 중'/);
  assert.match(screens, /export function prefetchDestinationStyles/);
});

test('places map reuses the shared chat composer resize handle', async () => {
  const { readFileSync } = await import('node:fs');
  const places = readFileSync(new URL('../src/ui/ui-places.js', import.meta.url), 'utf8');
  const widgets = readFileSync(new URL('../src/ui/ui-widgets.js', import.meta.url), 'utf8');
  const chat = readFileSync(new URL('../src/ui/ui-chat-room.js', import.meta.url), 'utf8');
  const css = readFileSync(new URL('../src/ui/v2/screens.css', import.meta.url), 'utf8');
  assert.match(widgets, /export function PanelResizeHandle/);
  assert.match(chat, /import \{ PanelResizeHandle \} from '\.\/ui-widgets\.js'/);
  assert.match(places, /import \{ PanelResizeHandle \} from '\.\/ui-widgets\.js'/);
  assert.match(places, /PanelResizeHandle/);
  assert.match(places, /panel-resize-bar/);
  assert.match(css, /\.places-category-sticky-tabs[\s\S]{0,160}padding:\s*0 !important/);
  assert.match(css, /\.places-category-sticky-tabs[\s\S]{0,220}border-bottom:\s*none !important/);
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
  assert.match(design, /bp-day-cell\.bp-today \.bp-day-num/);
  assert.match(design, /bp-day-bar-stack/);
  assert.match(design, /\.bp-p-dot::after[\s\S]*font-size:\s*0\.6rem/);
  assert.match(design, /\.festival-bar-desktop \.bp-day-anniversary-label/);
  assert.match(design, /--v2-fs-base:\s*0\.94rem/);
  assert.match(design, /--v2-fs-md:\s*0\.90rem/);
  assert.match(design, /--v2-fs-title:\s*1\.2rem/);

  assert.match(shell, /slice\(0, 9\)/);
  assert.match(shell, /dday-participant-memos/);
  assert.match(shell, /participantMemosFor/);
  assert.match(shell, /day-bar-stack/);
  assert.match(shell, /anns\.slice\(0, 4\)\.map/);
  assert.match(shell, /day-head-row/);
  assert.match(shell, /day-meeting-pill/);
  assert.match(shell, /computeFestivalBars/);
  assert.match(shell, /festival-bar-desktop/);
  assert.match(shell, /festival-bar-mobile/);
  assert.match(shell, /chat-bubble-modules/);
  assert.match(shell, /ChatBubbleFrame/);
  // V2 badge colors: 모임확정/일정·여행 = --cal-schedule; 기념일 = --cal-anniversary (pink)
  assert.match(design, /bp-day-meeting-pill/);
  assert.match(design, /--cal-schedule:\s*#7C2FE5/);
  assert.match(design, /--cal-anniversary:\s*#F76AAD/);
  assert.match(design, /background:\s*var\(--cal-schedule/);
  assert.match(design, /background:\s*var\(--cal-anniversary/);
  assert.match(shell, /cal-schedule/);
  assert.match(shell, /cal-anniversary/);
  assert.match(shell, /dday-compact-prefix/);
  assert.doesNotMatch(design, /#F472B6/);
  assert.doesNotMatch(design, /background:\s*var\(--status-green/);
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
  assert.match(screens, /searchLabel: '갤러리 검색'|label: '갤러리 검색'/);
  assert.match(shell, /setActiveLightbox/);
  assert.match(shell, /dday-participant-memos/);
  assert.match(styles, /chat-reply-quote-card/);
  assert.match(styles, /v2-records-media/);
});

// Regression: RenewalAppShell returns before CalendarApp's own withStickyVideo() wrapper (see
// app-main.js's `if (renewalShellEl) return renewalShellEl;`), which is where v1 renders
// ImageUploadOverlay/OperationProgressOverlay. v2 had no equivalent for a long stretch, so an
// upload was actually running (shared upload code path with v1) with zero visual progress
// feedback -- indistinguishable from a stalled/failed upload to whoever was watching it.
test('V2 shell renders the same upload/operation progress overlays as v1', async () => {
  const { readFileSync } = await import('node:fs');
  const shell = readFileSync(new URL('../src/ui/ui-app-shell-v2.js', import.meta.url), 'utf8');
  const appMain = readFileSync(new URL('../src/core/app-main.js', import.meta.url), 'utf8');
  assert.match(shell, /chatUploadProgress/, 'RenewalAppShell must accept chatUploadProgress as a prop');
  assert.match(shell, /ImageUploadOverlay/, 'RenewalAppShell must render ImageUploadOverlay when uploading');
  assert.match(shell, /OperationProgressOverlay/, 'RenewalAppShell must render OperationProgressOverlay too');
  assert.match(appMain, /renderRenewalShellIfEnabled\([\s\S]*?\{\s*chatUploadProgress,\s*operationProgress/, 'CalendarApp must pass its live chatUploadProgress/operationProgress state into the v2 shell');
});

// Regression: the app-wide toast (success/error banner from showToast(), used by nearly every
// action -- uploads, deletes, tag saves, shares, network status) renders via the SAME
// withStickyVideo() tree as the overlays above (app-main.js: `toast && <div className="toast...">`).
// v2 never reached it either, so every showToast() call already made from v2 screens was updating
// state with nothing on screen to show it -- indistinguishable from the action silently no-oping.
// Regression: ui-chat-room.js's "OO님에게 답장" reply-preview card (rendered as a plain child
// of .chat-composer when chatReplyTarget is set) carries no className -- it's styled purely via
// an inline --reply-accent custom property. extractChatSlots's className-based walk never
// matched it, so slots.reply was always undefined; ChatScreen's composer clone() then replaced
// the composer's children wholesale (resize, slots.reply, photos, files, ...), silently dropping
// the reply banner and its cancel button even though chatReplyTarget/setChatReplyTarget kept
// working and the reply still attached to the sent message. Users under ?shell=v2 had no way to
// see or cancel a pending reply.
test('extractChatSlots captures the reply-preview card by its --reply-accent marker', async () => {
  const { readFileSync } = await import('node:fs');
  const shellNav = readFileSync(new URL('../src/ui/v2/shell-nav.js', import.meta.url), 'utf8');
  const screens = readFileSync(new URL('../src/ui/v2/screens.js', import.meta.url), 'utf8');
  assert.match(shellNav, /--reply-accent/, 'extractChatSlots must detect the reply card by its --reply-accent style marker (it has no className)');
  assert.match(shellNav, /bag\.reply\s*=\s*node/, 'a matched reply card must be assigned to bag.reply');
  assert.match(screens, /slots\.reply/, 'ChatScreen must place the captured reply slot back into the rebuilt composer');
});

test('V2 shell renders the same app-wide toast as v1', async () => {
  const { readFileSync } = await import('node:fs');
  const shell = readFileSync(new URL('../src/ui/ui-app-shell-v2.js', import.meta.url), 'utf8');
  const appMain = readFileSync(new URL('../src/core/app-main.js', import.meta.url), 'utf8');
  assert.match(shell, /\btoast\b[\s\S]{0,40}dismissToast|dismissToast[\s\S]{0,40}\btoast\b/, 'RenewalAppShell must accept toast + dismissToast as props');
  assert.match(shell, /className:\s*`toast \$\{/, 'RenewalAppShell must render the same .toast markup v1 uses');
  assert.match(appMain, /renderRenewalShellIfEnabled\([\s\S]*?\btoast,\s*dismissToast\s*\}/, 'CalendarApp must pass its live toast/dismissToast state into the v2 shell');
});
